/**
 * WP-V66 · Seguridad de webviews — helper único de CSP.
 *
 * UN helper, N consumidores (providers de paneles, custom editors,
 * managers y páginas de comandos del bootstrap). Política fail-closed:
 *
 *  - `default-src 'none'` SIEMPRE; cada permiso se añade por necesidad real.
 *  - nonce criptográfico por render (`crypto.randomBytes`), jamás Math.random.
 *  - cero `unsafe-inline` / `unsafe-eval`: el builder LANZA si alguien
 *    intenta colarlos por cualquier fuente.
 *  - cerco v2 (local-first): `frame-src`/`connect-src` solo admiten
 *    orígenes locales (localhost / 127.0.0.1 / [::1]); un origen externo
 *    vivo LANZA — la referencia externa se muestra inerte, no se embebe.
 *  - toda fuente de `style/img/font` pasa por lista blanca (D4).
 *  - `findWebviewHtmlViolations` verifica el documento YA RENDERIZADO: es el
 *    mismo motor que usan la guarda de ejecución y el test del censo.
 *
 * ## Modelo de amenaza (qué defiende cada capa)
 *
 * Este fichero es la **guarda de ejecución** y defiende **contra entrada
 * externa**: HTML que la extensión no ha escrito y que llega en tiempo de
 * ejecución — hoy, el `index.html` de disco que sirve `webViewManager` para
 * un `localPath` de un repo vecino. El adversario es quien pueda escribir ese
 * fichero, no un colaborador del repo. Contra él las invariantes de aquí son
 * una frontera de seguridad de verdad, y por eso son fail-closed: lo que no se
 * puede analizar se rechaza, y la ruta de disco además va **sin scripts**.
 *
 * El **censo de puntos de render** (`tests/unit/webview/webviewCsp.test.ts`)
 * defiende otra cosa: **regresión en `src/`**. Detecta que alguien añada un
 * render sin CSP o con marcado inseguro por descuido. **NO es una frontera de
 * seguridad** y no pretende resistir a un contribuyente hostil deliberado:
 * quien puede editar `src/` puede editar el test. No debe leerse como si
 * protegiera de un atacante — sólo de un error.
 */
import * as crypto from 'crypto';
import { scanHtml } from './htmlScan';

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

const FORBIDDEN_TOKEN = /unsafe-inline|unsafe-eval/i;

/**
 * WP-V66 (D4) · Tokens admisibles como fuente de una directiva CSP.
 *
 * Fail-closed por lista blanca: `webview.cspSource` real (los tres esquemas
 * que VS Code ha usado), peers locales del cerco y las palabras clave
 * inocuas. Todo lo demás se rechaza — incluidos `*`, `data:`, los orígenes
 * externos, y cualquier valor con `;` (inyección de directivas) o `"`
 * (rotura del atributo `content=` del `<meta>`).
 */
const CSP_SOURCE_TOKEN =
    /^(?:'none'|'self'|'nonce-[A-Za-z0-9+/=_-]+'|vscode-resource:|vscode-webview-resource:|vscode-webview:\/\/[A-Za-z0-9._-]+|https:\/\/\*\.vscode-cdn\.net|https:\/\/[A-Za-z0-9.+-]+\.vscode-cdn\.net|https?:\/\/localhost(?::\d+)?|https?:\/\/127\.0\.0\.1(?::\d+)?|https?:\/\/\[::1\](?::\d+)?)$/;

/** Nonce criptográfico por render (128 bits, base64). */
export function createNonce(): string {
    return crypto.randomBytes(16).toString('base64');
}

const EMPTY = '';
/** TAB, LF y CR: el parser de la WHATWG los borra en CUALQUIER posicion. */
const TAB_OR_NEWLINE = new RegExp('[\u0009\u000A\u000D]', 'g');
/** C0 y espacio en los extremos: la WHATWG tambien los recorta. */
const EDGE_CONTROL = new RegExp('^[\u0000-\u0020]+|[\u0000-\u0020]+$', 'g');

/**
 * D-1 · Puerta de entrada ÚNICA para clasificar un URL.
 *
 * El parser de URL de la WHATWG —el que usa el navegador— hace dos cosas antes
 * de mirar nada: «remove all ASCII tab or newline from input» (en CUALQUIER
 * posición, no sólo en los bordes) y recorta los C0 y espacios de los extremos.
 * Así que `htt<TAB>ps://evil` ES `https://evil` para el navegador.
 *
 * Este módulo tenía DOS clasificadores con criterios distintos: `isLocalOrigin`
 * usaba `new URL` (que normaliza) y `isExtensionResourceUrl` una regex de
 * esquema escrita a mano (que no). Ahora ambos pasan por aquí primero.
 */
export function normalizeUrlForClassification(rawUrl: string): string {
    return rawUrl.replace(TAB_OR_NEWLINE, EMPTY).replace(EDGE_CONTROL, EMPTY);
}

/** ¿El URL apunta a un peer local (cerco v2)? */
export function isLocalOrigin(rawUrl: string): boolean {
    try {
        const u = new URL(normalizeUrlForClassification(rawUrl));
        if (u.protocol !== 'http:' && u.protocol !== 'https:' && u.protocol !== 'ws:' && u.protocol !== 'wss:') {
            return false;
        }
        return LOCAL_HOSTNAMES.has(u.hostname);
    } catch {
        return false;
    }
}

/**
 * Devuelve el origen (`scheme://host:port`) de un URL local.
 * LANZA si el URL no es un peer local — el consumidor debe degradar a
 * representación inerte (texto), nunca embeber el ancla externa.
 */
export function requireLocalOrigin(rawUrl: string): string {
    if (!isLocalOrigin(rawUrl)) {
        throw new Error(`Origen no local rechazado por el cerco de webviews: ${rawUrl}`);
    }
    return new URL(rawUrl).origin;
}

export interface WebviewCspOptions {
    /** nonce para `<script nonce=...>`; habilita `script-src 'nonce-X'`. */
    scriptNonce?: string;
    /** nonce para `<style nonce=...>`; se suma a `style-src`. */
    styleNonce?: string;
    /** `webview.cspSource` para `<link rel=stylesheet>` desde localResourceRoots. */
    styleSource?: string;
    /** `webview.cspSource` para imágenes locales. */
    imgSource?: string;
    /** `webview.cspSource` para fuentes locales. */
    fontSource?: string;
    /** iframes: SOLO orígenes locales (validados por `requireLocalOrigin`). */
    frameOrigins?: string[];
    /** fetch/websocket del script del webview: SOLO orígenes locales. */
    connectOrigins?: string[];
}

/** ¿El token es una fuente CSP admisible por la lista blanca del cerco? */
export function isAllowedCspSourceToken(token: string): boolean {
    return CSP_SOURCE_TOKEN.test(token);
}

/**
 * Valida una fuente CSP suministrada por el llamador (D4).
 * LANZA ante `unsafe-*`, ante metacaracteres que rompen el `<meta>` o
 * inyectan directivas, y ante cualquier token fuera de la lista blanca
 * (comodines y orígenes externos incluidos).
 */
function assertSafeSource(value: string, directive: string): string {
    if (FORBIDDEN_TOKEN.test(value)) {
        throw new Error(`Fuente prohibida en ${directive}: ${value}`);
    }
    if (/[;"<>\r\n]/.test(value)) {
        throw new Error(`Metacaracter no admitido en ${directive}: ${value}`);
    }
    const tokens = value.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) {
        throw new Error(`Fuente vacía en ${directive}`);
    }
    for (const token of tokens) {
        if (!isAllowedCspSourceToken(token)) {
            throw new Error(`Fuente no admitida en ${directive}: ${token}`);
        }
    }
    return value;
}

/**
 * Un nonce es base64/base64url puro: cualquier otra cosa (comillas, espacios,
 * `;`) sería un intento de romper la directiva desde el propio nonce.
 */
function assertSafeNonce(value: string, directive: string): string {
    if (!/^[A-Za-z0-9+/=_-]+$/.test(value)) {
        throw new Error(`Nonce no válido en ${directive}: ${value}`);
    }
    return value;
}

/** Construye el contenido de la CSP. Fail-closed: parte de `default-src 'none'`. */
export function buildCspContent(opts: WebviewCspOptions): string {
    const directives: string[] = [`default-src 'none'`];

    const style: string[] = [];
    if (opts.styleNonce) {
        style.push(`'nonce-${assertSafeNonce(opts.styleNonce, 'style-src')}'`);
    }
    if (opts.styleSource) {
        style.push(assertSafeSource(opts.styleSource, 'style-src'));
    }
    if (style.length > 0) {
        directives.push(`style-src ${style.join(' ')}`);
    }

    if (opts.scriptNonce) {
        directives.push(`script-src 'nonce-${assertSafeNonce(opts.scriptNonce, 'script-src')}'`);
    }

    if (opts.imgSource) {
        directives.push(`img-src ${assertSafeSource(opts.imgSource, 'img-src')}`);
    }
    if (opts.fontSource) {
        directives.push(`font-src ${assertSafeSource(opts.fontSource, 'font-src')}`);
    }

    if (opts.frameOrigins && opts.frameOrigins.length > 0) {
        const origins = opts.frameOrigins.map(o => requireLocalOrigin(o));
        directives.push(`frame-src ${origins.join(' ')}`);
    }
    if (opts.connectOrigins && opts.connectOrigins.length > 0) {
        const origins = opts.connectOrigins.map(o => requireLocalOrigin(o));
        directives.push(`connect-src ${origins.join(' ')}`);
    }

    return directives.join('; ') + ';';
}

/** Meta CSP lista para incrustar en el `<head>` del webview. */
export function buildCspMeta(opts: WebviewCspOptions): string {
    return `<meta http-equiv="Content-Security-Policy" content="${buildCspContent(opts)}">`;
}

// ---------------------------------------------------------------------------
// WP-V66 (D2/D3/D5/DD4/DD5) · Verificación DE FACTO del documento renderizado
//
// Un solo motor de invariantes, dos consumidores:
//   - la guarda de ejecución que sirve HTML de disco (`webViewManager`),
//   - el test del censo, que lo aplica a TODO punto de render derivado.
// Así no puede haber "el test comprueba una cosa y la guarda otra".
//
// El documento se TOKENIZA (`htmlScan.ts`), no se somete a regex: valores de
// atributo sin comillas y cierres abruptos de comentario son marcado válido
// que el navegador ejecuta, y una regex los pierde en silencio. Si el escáner
// no puede tokenizar con confianza, esta función RECHAZA el documento.
// ---------------------------------------------------------------------------

/**
 * Contenido de TODAS las metas CSP del documento (D5: no solo la primera).
 * Se tokeniza — los comentarios y sus cierres abruptos los resuelve el
 * escáner, no una regex (DD5).
 */
export function extractCspMetaContents(html: string): string[] {
    return scanHtml(html)
        .tags.filter(
            t =>
                t.kind === 'start' &&
                t.name === 'meta' &&
                (t.attrs.get('http-equiv') ?? '').trim().toLowerCase() === 'content-security-policy'
        )
        .map(t => t.attrs.get('content') ?? '');
}

/**
 * ¿El URL apunta a un recurso del propio documento/extensión?
 * Relativo, o los esquemas de recurso de webview de VS Code. Un origen
 * externo (aunque sea https) es NO. Protocol-relative (`//host`) es NO.
 */
export function isExtensionResourceUrl(rawUrl: string): boolean {
    // D-1 · normalizar ANTES de clasificar, igual que el navegador. Sin esto,
    // `htt<TAB>ps://evil` no casaba ningún esquema y se daba por "relativo",
    // mientras el navegador lo cargaba como https externo. El fallo no estaba
    // en leer el atributo (eso ya era correcto) sino aquí, en clasificarlo.
    const v = normalizeUrlForClassification(rawUrl);
    if (v === '' || v.startsWith('//') || v.startsWith('\\')) {
        return false;
    }
    const m = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(v);
    if (!m) {
        return true; // relativo al documento → servido por localResourceRoots
    }
    const scheme = m[1].toLowerCase();
    if (scheme === 'vscode-resource' || scheme === 'vscode-webview-resource' || scheme === 'vscode-webview') {
        return true;
    }
    if (scheme === 'https') {
        // el host lo extrae el MISMO parser que usa `isLocalOrigin`, no una
        // segunda regex: dos clasificadores con dos criterios fue el defecto
        let host: string;
        try {
            host = new URL(v).hostname.toLowerCase();
        } catch {
            return false;
        }
        return host === '*.vscode-cdn.net' || host.endsWith('.vscode-cdn.net');
    }
    return false;
}

/**
 * Esquemas que ejecutan código o incrustan un documento al NAVEGAR. Son los
 * únicos prohibidos en un destino de navegación.
 */
const DANGEROUS_NAV_SCHEMES = new Set(['javascript', 'data', 'vbscript']);

/**
 * Atributos que transportan una URL, clasificados por lo que la URL HACE:
 *
 *  - `resource` — el navegador **carga** ese URL sin que nadie haga nada. Un
 *    origen externo aquí es una fuga real, así que sólo se admiten recursos de
 *    la extensión (y peers locales donde el cerco lo permite).
 *  - `navigation` — el URL **no carga nada**: es un destino al que se va si el
 *    usuario pincha, y en un webview de VS Code eso abre el navegador del
 *    sistema, que es una función intencionada. Tratarlo como «recurso remoto»
 *    era un error de categoría (D-A) y metía un falso positivo mayor: `<a
 *    href="https://code.visualstudio.com/docs">`, `mailto:`, `tel:`, `vscode:`
 *    y `command:` —el idiom documentado de los webviews— caían todos. Aquí sólo
 *    se prohíben los esquemas que ejecutan (`javascript:`, `data:`,
 *    `vbscript:`).
 *
 * `ping`, `action` y `formaction` se quedan en `resource` a propósito aunque
 * los dispare el usuario: provocan una petición de red real con datos del
 * documento (baliza y envío de formulario), que es exfiltración, no navegación.
 *
 * D-3/D-B · Esta lista NO se declara exhaustiva sobre todo el HTML — no se
 * puede demostrar. Es **cerrada sobre tres categorías**: carga de subrecursos,
 * destinos de navegación y envío de formularios. Lo que queda fuera y porta URL
 * está enumerado en `UNSUPPORTED_URL_ATTRS` (se rechaza) o en la nota de abajo.
 */
type UrlAttrKind = 'resource' | 'navigation';
const URL_BEARING: Array<{
    tag: string;
    attr: string;
    kind: UrlAttrKind;
    allowLocalPeer: boolean;
    allowData: boolean;
}> = [
    // — carga de subrecursos —
    { tag: 'script', attr: 'src', kind: 'resource', allowLocalPeer: false, allowData: false },
    { tag: 'link', attr: 'href', kind: 'resource', allowLocalPeer: false, allowData: false },
    { tag: 'iframe', attr: 'src', kind: 'resource', allowLocalPeer: true, allowData: false },
    { tag: 'frame', attr: 'src', kind: 'resource', allowLocalPeer: true, allowData: false },
    { tag: 'embed', attr: 'src', kind: 'resource', allowLocalPeer: false, allowData: false },
    { tag: 'object', attr: 'data', kind: 'resource', allowLocalPeer: false, allowData: false },
    { tag: 'source', attr: 'src', kind: 'resource', allowLocalPeer: false, allowData: true },
    { tag: 'img', attr: 'src', kind: 'resource', allowLocalPeer: false, allowData: true },
    { tag: 'input', attr: 'src', kind: 'resource', allowLocalPeer: false, allowData: true },
    { tag: 'video', attr: 'src', kind: 'resource', allowLocalPeer: false, allowData: true },
    { tag: 'video', attr: 'poster', kind: 'resource', allowLocalPeer: false, allowData: true },
    { tag: 'audio', attr: 'src', kind: 'resource', allowLocalPeer: false, allowData: true },
    { tag: 'track', attr: 'src', kind: 'resource', allowLocalPeer: false, allowData: false },
    // — D-B · `background` lo cargan los tres navegadores como imagen de fondo —
    ...['body', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th'].map(tag => ({
        tag,
        attr: 'background',
        kind: 'resource' as UrlAttrKind,
        allowLocalPeer: false,
        allowData: true
    })),
    // — envío de formulario: petición de red con datos del documento —
    { tag: 'form', attr: 'action', kind: 'resource', allowLocalPeer: false, allowData: false },
    { tag: 'button', attr: 'formaction', kind: 'resource', allowLocalPeer: false, allowData: false },
    { tag: 'input', attr: 'formaction', kind: 'resource', allowLocalPeer: false, allowData: false },
    // — baliza: petición de red en segundo plano —
    { tag: 'a', attr: 'ping', kind: 'resource', allowLocalPeer: false, allowData: false },
    // — destinos de navegación: no cargan nada —
    { tag: 'a', attr: 'href', kind: 'navigation', allowLocalPeer: false, allowData: false },
    { tag: 'area', attr: 'href', kind: 'navigation', allowLocalPeer: false, allowData: false },
    ...['blockquote', 'q', 'del', 'ins'].map(tag => ({
        tag,
        attr: 'cite',
        kind: 'navigation' as UrlAttrKind,
        allowLocalPeer: false,
        allowData: false
    }))
];

/**
 * D-3 · Atributos que SÍ transportan URLs pero no con «una URL por atributo»:
 * `srcset`/`imagesrcset` son listas con descriptores, y el `content` de un
 * `<meta http-equiv="refresh">` lleva la URL dentro de `N;url=…`. Analizarlos
 * pediría un mini-parser por sintaxis, es decir volver a perseguir al
 * navegador. Se estrecha la entrada: no se admiten.
 */
const UNSUPPORTED_URL_ATTRS = ['srcset', 'imagesrcset'];

/**
 * Enumera las violaciones de la política de webview sobre el HTML YA
 * RENDERIZADO. Lista vacía = documento servible. Cubre:
 *
 *  1. meta CSP presente y fuera de comentarios, TODAS fail-closed (D3/D5)
 *  2. cero `unsafe-inline` / `unsafe-eval` en todo el documento
 *  3. toda fuente de toda meta CSP dentro de la lista blanca (D4)
 *  4. cero handlers inline (`onclick=`) y cero atributos `style=`
 *  5. todo `<script>`/`<style>` con nonce declarado en la CSP
 *  6. ningún recurso remoto: un `<script src>` externo NO se salva por
 *     llevar nonce — `script-src 'nonce-X'` autorizaría su ejecución (D2)
 *  7. sin `<base>` (reescribiría todas las URLs relativas)
 */
export function findWebviewHtmlViolations(html: string): string[] {
    const problems: string[] = [];

    // 0 · DD4/DD5 · lo que no se puede tokenizar con confianza se RECHAZA.
    //     Aprobar un documento que no se ha podido analizar es peor que no
    //     analizarlo: da un verde que nadie ha ganado.
    const scan = scanHtml(html);
    if (scan.errors.length > 0) {
        return scan.errors.map(e => `documento no analizable, se rechaza: ${e}`);
    }
    const doc = scan.withoutComments;
    const startTags = scan.tags.filter(t => t.kind === 'start');

    // 1 · metas CSP: al menos una, y TODAS fail-closed
    const metas = startTags
        .filter(
            t =>
                t.name === 'meta' &&
                (t.attrs.get('http-equiv') ?? '').trim().toLowerCase() === 'content-security-policy'
        )
        .map(t => t.attrs.get('content') ?? '');
    if (metas.length === 0) {
        problems.push('sin meta Content-Security-Policy fuera de comentarios');
    }
    const nonces: string[] = [];
    for (const csp of metas) {
        if (!/^\s*default-src\s+'none'\s*(;|$)/.test(csp)) {
            problems.push(`meta CSP que no arranca en default-src 'none': "${csp}"`);
        }
        for (const directive of csp.split(';').map(d => d.trim()).filter(Boolean)) {
            for (const token of directive.split(/\s+/).slice(1)) {
                if (!isAllowedCspSourceToken(token)) {
                    problems.push(`fuente no admitida en CSP: "${token}"`);
                }
            }
        }
        for (const m of csp.matchAll(/'nonce-([^']+)'/g)) {
            nonces.push(m[1]);
        }
    }

    // 2 · el documento entero, sin escapatorias
    if (/unsafe-inline/i.test(doc)) {
        problems.push('unsafe-inline presente en el documento');
    }
    if (/unsafe-eval/i.test(doc)) {
        problems.push('unsafe-eval presente en el documento');
    }

    // 4 · handlers y estilos inline — sobre ATRIBUTOS tokenizados, así que el
    //     valor sin comillas (DD4) ya no se escapa del análisis
    for (const tag of startTags) {
        for (const attrName of tag.attrs.keys()) {
            if (/^on[a-z]/.test(attrName)) {
                problems.push(`handler inline presente: <${tag.name} ${attrName}=…>`);
            }
        }
        if (tag.attrs.has('style')) {
            problems.push(`atributo style= inline presente en <${tag.name}>`);
        }
    }

    // 5 · nonce en cada <script>/<style>
    for (const tag of startTags) {
        if (tag.name !== 'script' && tag.name !== 'style') {
            continue;
        }
        const nonce = tag.attrs.get('nonce');
        if (nonce === undefined || nonce === '') {
            problems.push(`<${tag.name}> sin nonce`);
        } else if (!nonces.includes(nonce)) {
            problems.push(`<${tag.name}> con nonce no declarado en la CSP: "${nonce}"`);
        }
    }

    // 6 · recursos remotos (el nonce NO redime a un src externo)
    for (const rule of URL_BEARING) {
        for (const tag of startTags) {
            if (tag.name !== rule.tag) {
                continue;
            }
            const url = tag.attrs.get(rule.attr);
            if (url === undefined) {
                continue;
            }
            // D-1 · si el valor traía una referencia de carácter que el escáner
            // no supo resolver, no sabemos qué URL es: no se aprueba.
            if (tag.unresolvedRefAttrs.has(rule.attr)) {
                problems.push(
                    `referencia de carácter no resoluble en <${rule.tag} ${rule.attr}>: "${url}"`
                );
                continue;
            }
            // D-4 · valor vacío no es un recurso remoto. `<form action="">`
            // envía a la URL actual y es HTML válido; reportarlo era un falso
            // positivo, y un falso positivo en una guarda es la vía por la que
            // alguien acaba desactivándola.
            if (url.trim() === '') {
                continue;
            }
            // D-A · un destino de navegación no carga nada: sólo se prohíben
            // los esquemas que ejecutan. `https:`, `mailto:`, `tel:`,
            // `vscode:` y `command:` son legítimos aquí.
            if (rule.kind === 'navigation') {
                const scheme = /^([a-zA-Z][a-zA-Z0-9+.-]*):/
                    .exec(normalizeUrlForClassification(url))?.[1]
                    .toLowerCase();
                if (scheme !== undefined && DANGEROUS_NAV_SCHEMES.has(scheme)) {
                    problems.push(`esquema ejecutable en <${rule.tag} ${rule.attr}>: "${url}"`);
                }
                continue;
            }
            const ok =
                isExtensionResourceUrl(url) ||
                (rule.allowLocalPeer && isLocalOrigin(url)) ||
                (rule.allowData && /^data:/i.test(url));
            if (!ok) {
                problems.push(`recurso remoto en <${rule.tag} ${rule.attr}>: "${url}"`);
            }
        }
    }

    // 7 · <base> reescribiría toda URL relativa
    if (startTags.some(t => t.name === 'base')) {
        problems.push('<base> presente: reescribiría las URLs relativas del documento');
    }

    // 8 · `srcdoc` es un documento entero dentro de un atributo. Analizarlo
    //     en profundidad sería volver a perseguir al navegador (habría que
    //     decodificar y re-tokenizar recursivamente, con sus propias
    //     divergencias). Se estrecha la entrada: no se admite.
    for (const tag of startTags) {
        if (tag.attrs.has('srcdoc')) {
            problems.push(`<${tag.name} srcdoc> no admitido: documento anidado sin analizar`);
        }
    }

    // 9 · la CSP misma no puede depender de una referencia sin resolver
    for (const tag of startTags) {
        if (tag.name === 'meta' && tag.unresolvedRefAttrs.has('content')) {
            problems.push('referencia de carácter no resoluble en el content= de una meta');
        }
    }

    // 10 · D-3 · atributos de URL que esta guarda no sabe descomponer
    for (const tag of startTags) {
        for (const attr of UNSUPPORTED_URL_ATTRS) {
            if (tag.attrs.has(attr)) {
                problems.push(`<${tag.name} ${attr}> no admitido: lista de URLs sin analizar`);
            }
        }
        if (
            tag.name === 'meta' &&
            (tag.attrs.get('http-equiv') ?? '').trim().toLowerCase() === 'refresh'
        ) {
            // NB: el mensaje evita a propósito escribir la etiqueta literal —
            // el censo de puntos de render clasifica por texto de literal y la
            // tomaría por un fragmento HTML. Es su fragilidad, anotada para V89.
            problems.push('meta http-equiv=refresh no admitido: redirección sin analizar');
        }
    }

    return problems;
}

/** ¿El HTML cumple la política de webview? Sin ella no se sirve (fail-closed). */
export function isSafeWebviewHtml(html: string): boolean {
    return findWebviewHtmlViolations(html).length === 0;
}

/** Escape mínimo para interpolar datos en HTML de webview. */
export function escapeHtml(value: unknown): string {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
