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
 * ## Qué es esto, con precisión
 *
 * Un tokenizador **acotado y deliberadamente incompleto**. NO pretende empatar
 * con el navegador: perseguir al navegador es una carrera que no se gana, y
 * cada divergencia sería un defecto. Lo que sí promete es la otra mitad del
 * trato: **ante lo que no puede decidir con certeza, RECHAZA**. `errors` no
 * vacío significa «no me creas, no lo sirvas», y el llamador
 * (`findWebviewHtmlViolations`) convierte eso en rechazo del documento.
 *
 * Esa asimetría es el contrato: puede rechazar HTML válido, no puede aprobar
 * HTML que no haya entendido.
 *
 * ## Límites conocidos (enumerados a propósito)
 *
 *  - **Contenido extranjero**: en `<svg>`/`<math>` las reglas de tokenización
 *    cambian (RAWTEXT/RCDATA no conmutan por nombre de etiqueta), así que un
 *    `<svg><title><script src=…></script></title></svg>` sería marcado real
 *    para el navegador y texto invisible aquí. **No se emula: se rechaza** todo
 *    documento que los contenga. Ninguno de los 25 puntos de render propios usa
 *    SVG/MathML inline; si algún día hace falta, se resuelve entonces.
 *  - **No construye árbol**: no hay reglas de inserción, ni *foster parenting*,
 *    ni reconstrucción de elementos de formato. Un vector que dependa de la
 *    construcción del árbol y no del nivel léxico no está cubierto.
 *  - **Referencias de carácter con nombre**: se decodifican las de
 *    `NAMED_REFS`, no las 2231 del spec. Una referencia con nombre que no esté
 *    en la tabla se marca como **no resuelta**; el llamador rechaza el
 *    documento si aparece donde importa (URLs, CSP).
 *  - **`srcdoc`**: un documento dentro de un atributo. No se analiza en
 *    profundidad; se rechaza (ver `security.ts`).
 *  - **`&#128;` y la tabla windows-1252**: para las referencias numéricas en
 *    el rango 0x80–0x9F el navegador aplica una tabla heredada (`&#128;` es
 *    U+20AC, el euro), y aquí se devuelve U+0080. Es la única divergencia
 *    conocida que va en dirección INSEGURA, pero ninguno de esos code points
 *    puede formar un esquema ni un separador de URL.
 *  - **`<image>`**: el navegador lo construye como `<img>`; aquí se tokeniza
 *    con su nombre literal, así que no se le aplican las reglas de `<img>`.
 *    Va en dirección insegura sólo para `img-src`, que es la directiva menos
 *    crítica; se anota en vez de emular la corrección de nombres del árbol.
 *  - **Referencias con nombre sin *longest match***: el spec resuelve la
 *    coincidencia más larga; aquí se lee el nombre completo y, si no está en
 *    la tabla, se marca no resuelta. Rechaza de más, nunca de menos.
 *  - **Cierre de RAWTEXT sin exigir delimitador**: se corta en `</script`
 *    aunque el navegador pida además `>`, `/` o espacio detrás. Rechaza o
 *    recorta de más, nunca de menos.
 *
 * Un módulo que declara sus límites es auditable. Uno que se declarase
 * equivalente al navegador estaría prometiendo lo que ningún parser a mano
 * cumple.
 */

export interface ScannedTag {
    /** nombre en minúsculas */
    name: string;
    kind: 'start' | 'end';
    /**
     * nombre de atributo en minúsculas → valor **con las referencias de
     * carácter ya decodificadas** (D-1): el navegador ejecuta el estado
     * *character reference* dentro de los tres estados de valor de atributo,
     * así que `src="&#104;ttps://evil"` ES `src="https://evil"`.
     */
    attrs: Map<string, string>;
    /**
     * Atributos que contenían una referencia con nombre fuera de `NAMED_REFS`.
     * El valor entregado conserva el texto literal; el llamador debe rechazar
     * el documento si el atributo es de los que importan (URL, CSP).
     */
    unresolvedRefAttrs: Set<string>;
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

/**
 * D-2 · Raíces de contenido extranjero. Dentro de ellas las reglas de
 * tokenización cambian y este escáner NO las implementa: se rechaza.
 */
const FOREIGN_CONTENT_ROOTS = new Set(['svg', 'math']);

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

function isAsciiAlnum(c: string | undefined): boolean {
    return c !== undefined && (isAsciiAlpha(c) || (c >= '0' && c <= '9'));
}

/**
 * Referencias con nombre que sabemos decodificar. No son las 2231 del spec:
 * son las que aparecen de hecho, más las que sirven para disfrazar un esquema
 * o un separador (`Tab`, `NewLine`, `colon`, `sol`, `semi`, `num`).
 * Lo que no esté aquí se marca como NO RESUELTO, no se adivina.
 */
const NAMED_REFS: Record<string, string> = {
    amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
    nbsp: ' ', Tab: '\t', NewLine: '\n',
    semi: ';', colon: ':', sol: '/', bsol: '\\', num: '#', percnt: '%',
    ast: '*', commat: '@', lpar: '(', rpar: ')', period: '.', comma: ',',
    excl: '!', quest: '?', dollar: '$', plus: '+', equals: '=', lowbar: '_',
    copy: '©', reg: '®', trade: '™', hellip: '…',
    mdash: '—', ndash: '–', lsquo: '‘', rsquo: '’',
    ldquo: '“', rdquo: '”', bull: '•', dagger: '†',
    Dagger: '‡', permil: '‰', laquo: '«', raquo: '»',
    middot: '·', sect: '§', para: '¶', deg: '°',
    plusmn: '±', times: '×', divide: '÷',
    frac12: '½', frac14: '¼', frac34: '¾',
    sup1: '¹', sup2: '²', sup3: '³', micro: 'µ',
    pound: '£', yen: '¥', cent: '¢', euro: '€',
    iexcl: '¡', iquest: '¿', ordf: 'ª', ordm: 'º',
    szlig: 'ß', ntilde: 'ñ', Ntilde: 'Ñ',
    aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó',
    uacute: 'ú', Aacute: 'Á', Eacute: 'É', Iacute: 'Í',
    Oacute: 'Ó', Uacute: 'Ú', agrave: 'à', egrave: 'è',
    auml: 'ä', ouml: 'ö', uuml: 'ü', Uuml: 'Ü',
    ccedil: 'ç', Ccedil: 'Ç', aring: 'å', oslash: 'ø'
};

/** Sustituciones del spec para referencias numéricas fuera de rango. */
function codePointToText(cp: number): string {
    if (cp === 0 || cp > 0x10ffff || (cp >= 0xd800 && cp <= 0xdfff)) {
        return '�';
    }
    return String.fromCodePoint(cp);
}

/**
 * D-1 · Decodifica las referencias de carácter de un valor de atributo.
 *
 * Numéricas (decimales y hexadecimales, con o sin `;`) siempre. Con nombre,
 * sólo las de `NAMED_REFS`; si aparece una que no conocemos se devuelve
 * `unresolved: true` y el texto se deja literal — nunca se adivina.
 *
 * Regla del spec para el contexto de atributo: una referencia con nombre SIN
 * `;` seguida de `=` o de alfanumérico NO se decodifica (caso heredado).
 */
export function decodeAttributeValue(raw: string): { value: string; unresolved: boolean } {
    if (!raw.includes('&')) {
        return { value: raw, unresolved: false };
    }
    let out = '';
    let unresolved = false;
    let i = 0;
    while (i < raw.length) {
        if (raw[i] !== '&') {
            out += raw[i];
            i++;
            continue;
        }
        // --- numérica ---
        if (raw[i + 1] === '#') {
            let j = i + 2;
            let hex = false;
            if (raw[j] === 'x' || raw[j] === 'X') {
                hex = true;
                j++;
            }
            const digitsStart = j;
            while (j < raw.length && (hex ? /[0-9a-fA-F]/.test(raw[j]) : /[0-9]/.test(raw[j]))) {
                j++;
            }
            if (j === digitsStart) {
                out += '&';
                i++;
                continue;
            }
            const cp = parseInt(raw.slice(digitsStart, j), hex ? 16 : 10);
            out += codePointToText(cp);
            i = j + (raw[j] === ';' ? 1 : 0);
            continue;
        }
        // --- con nombre ---
        if (isAsciiAlpha(raw[i + 1])) {
            let j = i + 1;
            while (j < raw.length && isAsciiAlnum(raw[j])) {
                j++;
            }
            const name = raw.slice(i + 1, j);
            const hasSemi = raw[j] === ';';
            const replacement = NAMED_REFS[name];
            if (replacement !== undefined) {
                // heredado: sin `;` y seguido de `=` o alfanumérico → literal
                if (!hasSemi && (raw[j] === '=' || isAsciiAlnum(raw[j]))) {
                    out += raw.slice(i, j);
                    i = j;
                    continue;
                }
                out += replacement;
                i = j + (hasSemi ? 1 : 0);
                continue;
            }
            unresolved = true;
            out += raw.slice(i, j + (hasSemi ? 1 : 0));
            i = j + (hasSemi ? 1 : 0);
            continue;
        }
        out += '&';
        i++;
    }
    return { value: out, unresolved };
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
        const unresolvedRefAttrs = new Set<string>();
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
                // D-1: el navegador decodifica referencias de carácter aquí
                const decoded = decodeAttributeValue(value);
                attrs.set(attrName, decoded.value);
                if (decoded.unresolved) {
                    unresolvedRefAttrs.add(attrName);
                }
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

        tags.push({ name, kind: isEnd ? 'end' : 'start', attrs, unresolvedRefAttrs, selfClosing });
        kept += html.slice(i, p);
        i = p;

        // --- D-2 · contenido extranjero: no se emula, se rechaza ----------
        // En `<svg>`/`<math>` la tokenización cambia (RAWTEXT/RCDATA no
        // conmutan por nombre de etiqueta), así que lo de dentro sería
        // marcado real para el navegador y texto invisible aquí. Emular el
        // constructor del árbol es perseguir al navegador; estrechar la
        // entrada es más corto y más honesto.
        if (!isEnd && FOREIGN_CONTENT_ROOTS.has(name)) {
            errors.push(`contenido extranjero <${name}> no soportado: el documento se rechaza`);
            break;
        }

        // --- contenido que NO se re-tokeniza ------------------------------
        // D-3 · el `/` de un `<script/>` se IGNORA para elementos HTML: el
        // navegador entra en RAWTEXT igual. Tokenizar el cuerpo como marcado
        // rechazaría HTML legítimo.
        if (!isEnd && (RAW_TEXT_ELEMENTS.has(name) || ESCAPABLE_RAW_TEXT_ELEMENTS.has(name))) {
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
