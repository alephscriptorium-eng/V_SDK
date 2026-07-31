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
 */
import * as crypto from 'crypto';

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

const FORBIDDEN_TOKEN = /unsafe-inline|unsafe-eval/i;

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

function assertSafeSource(value: string, directive: string): string {
    if (FORBIDDEN_TOKEN.test(value)) {
        throw new Error(`Fuente prohibida en ${directive}: ${value}`);
    }
    return value;
}

/** Construye el contenido de la CSP. Fail-closed: parte de `default-src 'none'`. */
export function buildCspContent(opts: WebviewCspOptions): string {
    const directives: string[] = [`default-src 'none'`];

    const style: string[] = [];
    if (opts.styleNonce) {
        style.push(`'nonce-${assertSafeSource(opts.styleNonce, 'style-src')}'`);
    }
    if (opts.styleSource) {
        style.push(assertSafeSource(opts.styleSource, 'style-src'));
    }
    if (style.length > 0) {
        directives.push(`style-src ${style.join(' ')}`);
    }

    if (opts.scriptNonce) {
        directives.push(`script-src 'nonce-${assertSafeSource(opts.scriptNonce, 'script-src')}'`);
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

/** ¿El HTML (p. ej. cargado de disco) declara una meta CSP? Sin ella no se sirve. */
export function hasCspMeta(html: string): boolean {
    return /<meta\s+http-equiv=["']Content-Security-Policy["']/i.test(html);
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
