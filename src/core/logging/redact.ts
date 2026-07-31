/**
 * WP-V71 · Redacción de secretos para el log estructurado.
 *
 * Pieza PURA: sin `vscode`, sin E/S, sin estado global. Se ejercita en test
 * unitario sin arnés de Extension Host.
 *
 * Regla del carril: **el log nunca imprime credenciales**. Ante la duda, se
 * redacta — un diagnóstico con un campo tapado sigue sirviendo; un token
 * pegado en un issue público, no.
 */

/** Marca visible de valor tapado. Se elige un literal improbable en datos reales. */
export const REDACTED = '«redactado»';

/**
 * Claves cuyo VALOR nunca se imprime, se llame como se llame el contenedor.
 *
 * NOTA deliberada: **no** se incluye `auth` a secas. Este árbol tiene
 * `AuthorshipService` y campos `author`/`authorship` (`src/mutation/AuthorshipService.ts`);
 * un `/auth/i` los taparía y dejaría el log de autoría ciego. Se enumeran las
 * formas realmente sensibles.
 */
const SECRET_KEY_PATTERN =
    /(pass(word|wd)?|secret|token|api[-_]?key|apikey|authorization|credential|cookie|private[-_]?key|signing[-_]?key|session[-_]?key|access[-_]?key|bearer|passphrase)/i;

/** `scheme://usuario:contraseña@host` → las credenciales inline de una URL. */
const URL_CREDENTIALS = /(\b[a-z][a-z0-9+.-]*:\/\/)[^/\s:@]+:[^/\s@]+@/gi;

/** `?token=…`, `&access_token=…`, `?api_key=…` en cualquier URL. */
const QUERY_SECRET =
    /([?&](?:pass(?:word|wd)?|secret|token|access[-_]?token|api[-_]?key|apikey|auth|key|sig|signature)=)[^&\s"']+/gi;

/** Cabecera `Authorization: Bearer …` / `Bearer …` suelto. */
const BEARER = /\b(bearer\s+)[A-Za-z0-9._~+/=-]{8,}/gi;

/** Banderas de línea de comandos: `--token X`, `--password=X`, `-p X`. */
const CLI_SECRET_FLAG =
    /(--?(?:pass(?:word|wd)?|secret|token|api[-_]?key|apikey|credential|passphrase)[=\s]+)(?:"[^"]*"|'[^']*'|\S+)/gi;

/** Asignación de entorno: `TOKEN=…`, `MY_API_KEY=…` dentro de una línea de comando. */
const ENV_ASSIGNMENT =
    /\b([A-Z0-9_]*(?:PASS(?:WORD|WD)?|SECRET|TOKEN|API[_-]?KEY|CREDENTIAL|PASSPHRASE)[A-Z0-9_]*=)(?:"[^"]*"|'[^']*'|\S+)/g;

/** Clave privada PEM completa, en una o varias líneas. */
const PEM_BLOCK =
    /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g;

/**
 * Prefijos del directorio del usuario. Una ruta absoluta filtra el nombre de
 * cuenta del sistema operativo; en un log que se pega en un issue eso es
 * información personal gratuita. Se sustituye por `~` conservando el resto de
 * la ruta, que es lo que de verdad sirve para diagnosticar.
 */
function homePrefixes(): string[] {
    const raw = [
        process.env.HOME,
        process.env.USERPROFILE,
        process.env.HOMEPATH && process.env.HOMEDRIVE
            ? `${process.env.HOMEDRIVE}${process.env.HOMEPATH}`
            : undefined
    ].filter((p): p is string => typeof p === 'string' && p.length > 3);

    // Más largo primero: evita que `C:\Users` tape a `C:\Users\alguien`.
    return Array.from(new Set(raw)).sort((a, b) => b.length - a.length);
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Sustituye el home del usuario por `~`, en separador `/` y `\`. */
export function maskHomePath(text: string): string {
    let out = text;
    for (const home of homePrefixes()) {
        const variants = new Set([home, home.replace(/\\/g, '/'), home.replace(/\//g, '\\')]);
        for (const variant of variants) {
            out = out.replace(new RegExp(escapeRegExp(variant), 'gi'), '~');
        }
    }
    return out;
}

/**
 * Redacta una cadena libre: credenciales en URL, query params, `Bearer`,
 * banderas de CLI, asignaciones de entorno, bloques PEM y el home del usuario.
 */
export function redactString(text: string): string {
    if (!text) {
        return text;
    }
    let out = text;
    out = out.replace(PEM_BLOCK, `-----BEGIN PRIVATE KEY----- ${REDACTED} -----END PRIVATE KEY-----`);
    out = out.replace(URL_CREDENTIALS, `$1${REDACTED}@`);
    out = out.replace(QUERY_SECRET, `$1${REDACTED}`);
    out = out.replace(BEARER, `$1${REDACTED}`);
    out = out.replace(CLI_SECRET_FLAG, `$1${REDACTED}`);
    out = out.replace(ENV_ASSIGNMENT, `$1${REDACTED}`);
    out = maskHomePath(out);
    return out;
}

/** ¿El nombre de esta clave designa un secreto? */
export function isSecretKey(key: string): boolean {
    return SECRET_KEY_PATTERN.test(key);
}

/**
 * Serializa un `Error` con lo que hace falta para diagnosticar en una máquina
 * ajena: nombre, mensaje y pila. `JSON.stringify(new Error('x'))` devuelve
 * `{}` — inútil — por eso este caso va explícito.
 */
function serializeError(error: Error): Record<string, unknown> {
    const out: Record<string, unknown> = {
        name: error.name,
        message: redactString(error.message)
    };
    if (typeof error.stack === 'string') {
        out.stack = redactString(error.stack);
    }
    const cause = (error as Error & { cause?: unknown }).cause;
    if (cause !== undefined) {
        out.cause = redactValue(cause);
    }
    // Campos propios añadidos por el emisor (p. ej. `code`, `errno`).
    for (const key of Object.keys(error)) {
        if (!(key in out)) {
            out[key] = isSecretKey(key) ? REDACTED : redactValue((error as never)[key]);
        }
    }
    return out;
}

/**
 * Redacta un valor cualquiera en profundidad. Tolera ciclos, `Error`, `Map`,
 * `Set`, `Date` y objetos anidados. **Nunca lanza**: un fallo del logger no
 * puede tumbar al llamante.
 */
export function redactValue(value: unknown, seen: WeakSet<object> = new WeakSet()): unknown {
    if (value === null || value === undefined) {
        return value;
    }
    if (typeof value === 'string') {
        return redactString(value);
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
        return value;
    }
    if (typeof value === 'bigint') {
        return `${value.toString()}n`;
    }
    if (typeof value === 'function') {
        return `[function ${value.name || 'anónima'}]`;
    }
    if (typeof value === 'symbol') {
        return value.toString();
    }
    if (value instanceof Error) {
        return serializeError(value);
    }
    if (value instanceof Date) {
        return value.toISOString();
    }
    if (typeof value === 'object') {
        if (seen.has(value as object)) {
            return '[ciclo]';
        }
        seen.add(value as object);

        if (Array.isArray(value)) {
            return value.map(item => redactValue(item, seen));
        }
        if (value instanceof Map) {
            const out: Record<string, unknown> = {};
            for (const [k, v] of value.entries()) {
                const key = String(k);
                out[key] = isSecretKey(key) ? REDACTED : redactValue(v, seen);
            }
            return out;
        }
        if (value instanceof Set) {
            return Array.from(value.values()).map(item => redactValue(item, seen));
        }

        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
            out[k] = isSecretKey(k) ? REDACTED : redactValue(v, seen);
        }
        return out;
    }
    return String(value);
}

/**
 * Serializa el payload de una entrada a JSON de una sola línea, ya redactado.
 * Devuelve `undefined` si no hay nada que añadir. **Nunca lanza.**
 */
export function serializeData(data: unknown): string | undefined {
    if (data === undefined || data === null) {
        return undefined;
    }
    try {
        const redacted = redactValue(data);
        if (redacted === undefined) {
            return undefined;
        }
        const json = JSON.stringify(redacted);
        if (json === undefined || json === '{}' || json === '""') {
            return undefined;
        }
        return json;
    } catch {
        return '"[dato no serializable]"';
    }
}
