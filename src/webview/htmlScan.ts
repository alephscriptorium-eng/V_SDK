/**
 * WP-V66 (DD4/DD5) · Escáner de HTML **fail-closed** para la guarda de webviews.
 *
 * Por qué existe: la versión anterior analizaba HTML hostil con expresiones
 * regulares, y una regex no es un tokenizador. Dos consecuencias probadas por
 * la contrarrevisión:
 *
 *  - **DD4** — `attrOf` sólo leía valores entrecomillados, así que
 *    `src=https://evil.example/x.js` (sin comillas, HTML lo permite) devolvía
 *    `undefined` y la comprobación de recurso remoto se saltaba en silencio.
 *    Lo mismo con `onclick=alert(1)` y `style=…` sin comillas.
 *  - **DD5** — el quitado de comentarios se desincronizaba del tokenizador:
 *    `<!-->` cierra el comentario para el navegador (*abrupt-closing-of-empty-
 *    comment*) pero la regex se comía hasta el `-->` siguiente; y un `<!--`
 *    dentro de un valor de atributo entrecomillado NO abre comentario para el
 *    navegador, pero sí para la regex. En ambos casos desaparecía del análisis
 *    marcado que el navegador sí ejecuta.
 *
 * La respuesta no es una regex mejor. Este módulo recorre el documento con la
 * misma máquina de estados que usa un navegador para lo que aquí importa
 * (etiquetas, atributos con y sin comillas, comentarios con sus cierres
 * abruptos, y contenido RAWTEXT/RCDATA que no se re-tokeniza), y **declara sus
 * errores**: si algo no se puede tokenizar con confianza, `errors` no queda
 * vacío y el llamador debe RECHAZAR el documento. Aprobar lo que no se ha
 * podido analizar es exactamente el fallo que se está corrigiendo.
 *
 * Alcance declarado: esto NO es un parser HTML5 completo (no construye árbol,
 * no hace foster parenting, no reconstruye elementos formateados). Cubre el
 * nivel léxico, que es donde viven las invariantes de la política de webview.
 */

export interface ScannedTag {
    /** nombre en minúsculas */
    name: string;
    kind: 'start' | 'end';
    /** nombre de atributo en minúsculas → valor (cadena vacía si no tiene) */
    attrs: Map<string, string>;
    selfClosing: boolean;
}

export interface HtmlScan {
    tags: ScannedTag[];
    /** el documento entero salvo los comentarios (para barridos de texto) */
    withoutComments: string;
    /** motivos por los que el documento NO es analizable; vacío = analizable */
    errors: string[];
}

/** Su contenido es texto crudo: no se re-tokeniza (un `<` dentro no es etiqueta). */
const RAW_TEXT_ELEMENTS = new Set(['script', 'style']);

/** Igual que RAWTEXT a efectos de tokenización de etiquetas. */
const ESCAPABLE_RAW_TEXT_ELEMENTS = new Set(['title', 'textarea']);

const OPEN = '<';
const SOLIDUS = '/';
const GT = '>';
const EQUALS = '=';

function isAsciiAlpha(c: string | undefined): boolean {
    return c !== undefined && ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z'));
}

function isHtmlSpace(c: string | undefined): boolean {
    return c === ' ' || c === '\t' || c === '\n' || c === '\f' || c === '\r';
}

/**
 * Tokeniza el documento. Nunca lanza: los problemas se acumulan en `errors`
 * para que el llamador decida (y la decisión correcta es rechazar).
 */
export function scanHtml(html: string): HtmlScan {
    const tags: ScannedTag[] = [];
    const errors: string[] = [];
    const lower = html.toLowerCase();
    const n = html.length;
    let kept = '';
    let i = 0;

    while (i < n) {
        if (html[i] !== OPEN) {
            kept += html[i];
            i++;
            continue;
        }

        // --- comentarios -------------------------------------------------
        if (lower.startsWith('<!--', i)) {
            const j = i + 4;
            // cierres abruptos del spec: `<!-->` y `<!--->` terminan AQUÍ
            if (html[j] === GT) {
                i = j + 1;
                continue;
            }
            if (html[j] === '-' && html[j + 1] === GT) {
                i = j + 2;
                continue;
            }
            const a = html.indexOf('-->', j);
            const b = html.indexOf('--!>', j);
            let end = -1;
            let width = 0;
            if (a >= 0 && (b < 0 || a <= b)) {
                end = a;
                width = 3;
            } else if (b >= 0) {
                end = b;
                width = 4;
            }
            if (end < 0) {
                errors.push('comentario sin cerrar');
                break;
            }
            i = end + width;
            continue;
        }

        // --- doctype y declaraciones -------------------------------------
        if (html[i + 1] === '!' || html[i + 1] === '?') {
            const gt = html.indexOf(GT, i);
            if (gt < 0) {
                errors.push('declaración sin cerrar');
                break;
            }
            kept += html.slice(i, gt + 1);
            i = gt + 1;
            continue;
        }

        // --- etiquetas ----------------------------------------------------
        const isEnd = html[i + 1] === SOLIDUS;
        const nameStart = i + (isEnd ? 2 : 1);
        if (!isAsciiAlpha(html[nameStart])) {
            // `<3`, `< a` … el tokenizador lo trata como texto
            kept += html[i];
            i++;
            continue;
        }

        let p = nameStart;
        while (p < n && !isHtmlSpace(html[p]) && html[p] !== GT && html[p] !== SOLIDUS) {
            p++;
        }
        const name = lower.slice(nameStart, p);

        const attrs = new Map<string, string>();
        let selfClosing = false;
        let closed = false;
        let fatal: string | undefined;

        while (p < n) {
            while (p < n && isHtmlSpace(html[p])) {
                p++;
            }
            if (p >= n) {
                break;
            }
            if (html[p] === GT) {
                p++;
                closed = true;
                break;
            }
            if (html[p] === SOLIDUS) {
                if (html[p + 1] === GT) {
                    selfClosing = true;
                    p += 2;
                    closed = true;
                    break;
                }
                p++;
                continue;
            }

            const attrStart = p;
            while (
                p < n &&
                !isHtmlSpace(html[p]) &&
                html[p] !== EQUALS &&
                html[p] !== GT &&
                html[p] !== SOLIDUS
            ) {
                p++;
            }
            const attrName = lower.slice(attrStart, p);

            while (p < n && isHtmlSpace(html[p])) {
                p++;
            }

            let value = '';
            if (html[p] === EQUALS) {
                p++;
                while (p < n && isHtmlSpace(html[p])) {
                    p++;
                }
                const quote = html[p];
                if (quote === '"' || quote === "'") {
                    const close = html.indexOf(quote, p + 1);
                    if (close < 0) {
                        fatal = `valor de atributo "${attrName}" sin cerrar`;
                        break;
                    }
                    value = html.slice(p + 1, close);
                    p = close + 1;
                } else {
                    // DD4: valor SIN comillas — HTML lo permite y hay que leerlo
                    const valueStart = p;
                    while (p < n && !isHtmlSpace(html[p]) && html[p] !== GT) {
                        p++;
                    }
                    value = html.slice(valueStart, p);
                }
            }

            // atributo duplicado: gana el primero (igual que el navegador)
            if (attrName !== '' && !attrs.has(attrName)) {
                attrs.set(attrName, value);
            }
        }

        if (fatal !== undefined) {
            errors.push(fatal);
            break;
        }
        if (!closed) {
            errors.push(`etiqueta <${name}> sin cerrar`);
            break;
        }

        tags.push({ name, kind: isEnd ? 'end' : 'start', attrs, selfClosing });
        kept += html.slice(i, p);
        i = p;

        // --- contenido que NO se re-tokeniza ------------------------------
        if (
            !isEnd &&
            !selfClosing &&
            (RAW_TEXT_ELEMENTS.has(name) || ESCAPABLE_RAW_TEXT_ELEMENTS.has(name))
        ) {
            const closeAt = lower.indexOf(`</${name}`, i);
            if (closeAt < 0) {
                errors.push(`<${name}> sin etiqueta de cierre`);
                break;
            }
            kept += html.slice(i, closeAt);
            i = closeAt;
        }
    }

    return { tags, withoutComments: kept, errors };
}
