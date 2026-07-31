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
 */
import * as crypto from 'crypto';

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

/** ¿El URL apunta a un peer local (cerco v2)? */
export function isLocalOrigin(rawUrl: string): boolean {
    try {
        const u = new URL(rawUrl);
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
// WP-V66 (D2/D3/D5) · Verificación DE FACTO del documento renderizado
//
// Un solo motor de invariantes, dos consumidores:
//   - la guarda de ejecución que sirve HTML de disco (`webViewManager`),
//   - el test del censo, que lo aplica a TODO punto de render derivado.
// Así no puede haber "el test comprueba una cosa y la guarda otra".
// ---------------------------------------------------------------------------

/** Quita comentarios HTML: una meta CSP comentada NO es una meta CSP (D3). */
export function stripHtmlComments(html: string): string {
    return html.replace(/<!--[\s\S]*?-->/g, '');
}

/**
 * Valor de un atributo. El tipo de comilla se respeta: un `content="…'none'…"`
 * NO puede cortarse en la primera comilla simple.
 */
function attrOf(tag: string, attr: string): string | undefined {
    const m = new RegExp(`\\b${attr}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i').exec(tag);
    if (!m) {
        return undefined;
    }
    return m[1] !== undefined ? m[1] : m[2];
}

function tagsOf(html: string, tag: string): string[] {
    return html.match(new RegExp(`<${tag}\\b[^>]*>`, 'gi')) ?? [];
}

/**
 * Contenido de TODAS las metas CSP del documento (D5: no solo la primera).
 * Se ignora lo que esté dentro de comentarios.
 */
export function extractCspMetaContents(html: string): string[] {
    const re = /<meta\b[^>]*http-equiv\s*=\s*["']Content-Security-Policy["'][^>]*>/gi;
    return (stripHtmlComments(html).match(re) ?? []).map(tag => attrOf(tag, 'content') ?? '');
}

/**
 * ¿El URL apunta a un recurso del propio documento/extensión?
 * Relativo, o los esquemas de recurso de webview de VS Code. Un origen
 * externo (aunque sea https) es NO. Protocol-relative (`//host`) es NO.
 */
export function isExtensionResourceUrl(rawUrl: string): boolean {
    const v = rawUrl.trim();
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
        const host = /^https:\/\/([^/?#]*)/i.exec(v)?.[1] ?? '';
        return host === '*.vscode-cdn.net' || host.endsWith('.vscode-cdn.net');
    }
    return false;
}

/** Atributos que cargan un recurso, con la política aplicable a cada uno. */
const URL_BEARING: Array<{ tag: string; attr: string; allowLocalPeer: boolean; allowData: boolean }> = [
    { tag: 'script', attr: 'src', allowLocalPeer: false, allowData: false },
    { tag: 'link', attr: 'href', allowLocalPeer: false, allowData: false },
    { tag: 'iframe', attr: 'src', allowLocalPeer: true, allowData: false },
    { tag: 'frame', attr: 'src', allowLocalPeer: true, allowData: false },
    { tag: 'embed', attr: 'src', allowLocalPeer: false, allowData: false },
    { tag: 'object', attr: 'data', allowLocalPeer: false, allowData: false },
    { tag: 'source', attr: 'src', allowLocalPeer: false, allowData: true },
    { tag: 'img', attr: 'src', allowLocalPeer: false, allowData: true },
    { tag: 'form', attr: 'action', allowLocalPeer: false, allowData: false }
];

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
    const doc = stripHtmlComments(html);

    // 1 · metas CSP: al menos una, y TODAS fail-closed
    const metas = extractCspMetaContents(html);
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

    // 4 · handlers y estilos inline
    const onAttr = /\son[a-z]+\s*=\s*["'`\\]/i.exec(doc);
    if (onAttr) {
        problems.push(`handler inline presente: "${onAttr[0].trim()}"`);
    }
    if (/\sstyle\s*=\s*["'`\\]/i.test(doc)) {
        problems.push('atributo style= inline presente');
    }

    // 5 · nonce en cada <script>/<style>
    for (const kind of ['script', 'style']) {
        for (const tag of tagsOf(doc, kind)) {
            const nonce = attrOf(tag, 'nonce');
            if (!nonce) {
                problems.push(`<${kind}> sin nonce: ${tag}`);
            } else if (!nonces.includes(nonce)) {
                problems.push(`<${kind}> con nonce no declarado en la CSP: ${tag}`);
            }
        }
    }

    // 6 · recursos remotos (el nonce NO redime a un src externo)
    for (const rule of URL_BEARING) {
        for (const tag of tagsOf(doc, rule.tag)) {
            const url = attrOf(tag, rule.attr);
            if (url === undefined) {
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
    if (tagsOf(doc, 'base').length > 0) {
        problems.push('<base> presente: reescribiría las URLs relativas del documento');
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
