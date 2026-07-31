/**
 * WP-V71 · Redacción de secretos para el log estructurado.
 *
 * Pieza PURA: sin `vscode`, sin E/S, sin estado global. Se ejercita en test
 * unitario sin arnés de Extension Host.
 *
 * Regla del carril: **el log nunca imprime credenciales**. Ante la duda, se
 * redacta — un diagnóstico con un campo tapado sigue sirviendo; un token
 * pegado en un issue público, no.
 *
 * ── Cómo decide (reescrito en la corrección de la devolución, D4/D5) ──────
 * Hay UN vocabulario (`SECRET_WORDS` + `SECRET_TERM_SOURCE`) del que derivan
 * TODOS los caminos: claves de objeto, banderas de CLI, asignaciones de
 * entorno y parámetros de query. La primera versión tenía cuatro listas que no
 * coincidían entre sí — `?auth=` se tapaba pero `--auth` no —, y eso no es un
 * criterio: es un hueco con aspecto de criterio.
 *
 * Las claves se comparan **por palabras**, no por subcadena: `authToken` se
 * parte en `auth|token` y se tapa; `author` es la palabra `author` y NO se
 * tapa — sin necesidad de excluir `auth` del vocabulario. Comparar por
 * palabras es además lo que hace seguro meter `pin`, que como subcadena vive
 * dentro de `spinner` y `pingInterval`.
 *
 * ── Límites conocidos (declarados, no tapados) ────────────────────────────
 * Ningún redactor por nombre puede con esto. Vale más saberlo que descubrirlo:
 *   L1 · secreto en el PATH de una URL (`https://host/v1/AKIA…/datos`): no hay
 *        nombre que lo anuncie.
 *   L2 · blob base64/hex suelto y sin etiqueta: indistinguible de un hash, un
 *        id o contenido legítimo; taparlo por su forma cegaría más de lo que
 *        protege.
 *   L3 · secreto usado como CLAVE (`{ 'ghp_real': 'activo' }`): se redacta el
 *        valor, no el nombre del campo.
 *   L4 · `-p valor` (bandera corta): NO se tapa a propósito — en medio
 *        ecosistema `-p` es «port» (`docker run -p 8080:80`), y taparlo sería
 *        una fábrica de falsos positivos. Las formas largas sí se tapan.
 *   L5 · secreto en prosa sin etiqueta: «la clave es hunter2» se tapa;
 *        «hunter2» a secas, no.
 */

/** Marca visible de valor tapado. Se elige un literal improbable en datos reales. */
export const REDACTED = '«redactado»';

/**
 * Palabras que, como **token completo** de una clave, marcan su valor secreto.
 *
 * Incluye castellano a propósito: este árbol comenta, documenta y planifica en
 * castellano, así que sus datos también lo harán. En la primera versión
 * `contraseña` fugaba y `secreto` se salvaba por casualidad (por contener
 * «secret»); eso no es criterio, es coincidencia.
 *
 * `author`/`authorship` no necesitan exclusión: son palabras distintas de
 * `auth` y la comparación es por palabra.
 */
const SECRET_WORDS = new Set([
    // inglés
    'password', 'passwords', 'passwd', 'pass', 'passphrase', 'passphrases',
    'secret', 'secrets', 'token', 'tokens', 'jwt',
    'credential', 'credentials', 'cookie', 'cookies',
    'authorization', 'auth', 'bearer', 'signature', 'signatures',
    'otp', 'totp', 'seed', 'mnemonic',
    // castellano
    'clave', 'claves', 'contraseña', 'contraseñas', 'contrasena', 'contrasenas',
    'contrasenya', 'contrasenyas', 'secreto', 'secretos',
    'credencial', 'credenciales', 'firma', 'firmas', 'pwd', 'pin'
]);

/**
 * Palabras que solo son secretas cuando son la clave **entera** (`key`, `sig`)
 * o el nombre completo de un parámetro o bandera (`?key=`, `--sig=`).
 *
 * Como token suelto dentro de una clave compuesta no bastan: `settingKey` y
 * `configKey` son nombres de ajuste, no credenciales — y este árbol loguea
 * `settingKey` de verdad (`src/views/HackerConfigPanelProvider.ts`).
 */
const STANDALONE_SECRET_WORDS = new Set(['key', 'keys', 'sig']);

/**
 * Calificadores que convierten `key` en secreto: `apiKey`, `privateKey`,
 * `accessKey`… frente a `settingKey`.
 */
const KEY_QUALIFIERS = new Set([
    'api', 'access', 'private', 'secret', 'signing', 'session', 'encryption',
    'master', 'client', 'app', 'auth', 'ssh', 'gpg', 'pgp'
]);

/**
 * Sufijos que indican que la clave nombra **dónde** vive un valor, no el valor.
 *
 * Arregla un falso positivo REAL: `VisibleGate.tokenEnv`
 * (`src/mutation/types.ts:24`) es el NOMBRE de una variable de entorno, y la
 * primera versión lo tapaba por contener «token» — cegaba un campo que existe
 * para proteger uno que no.
 */
const REFERENCE_SUFFIXES = new Set([
    'env', 'envvar', 'name', 'varname', 'var', 'label', 'field'
]);

/**
 * Parte una clave en palabras: camelCase, PascalCase, snake_case, kebab-case,
 * SCREAMING_SNAKE y acrónimos pegados (`APIKey` → `api|key`).
 */
function keyWords(key: string): string[] {
    return key
        .replace(/([a-z0-9])([A-ZÁÉÍÓÚÑ])/g, '$1 $2')
        .replace(/([A-ZÁÉÍÓÚÑ]+)([A-ZÁÉÍÓÚÑ][a-záéíóúñ])/g, '$1 $2')
        .split(/[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9]+/)
        .filter(Boolean)
        .map(word => word.toLowerCase());
}

/** ¿El nombre de esta clave designa un secreto? */
export function isSecretKey(key: string): boolean {
    const words = keyWords(key);
    if (words.length === 0) {
        return false;
    }

    // Nombra una ubicación, no un valor: `tokenEnv`, `passwordFieldName`.
    if (REFERENCE_SUFFIXES.has(words[words.length - 1])) {
        return false;
    }

    // La clave ENTERA es `key` / `sig`.
    if (words.length === 1 && STANDALONE_SECRET_WORDS.has(words[0])) {
        return true;
    }

    // Alguna palabra es secreta por sí misma (`auth`, `token`, `contraseña`…).
    if (words.some(word => SECRET_WORDS.has(word))) {
        return true;
    }

    // `key` calificado: apiKey / privateKey / accessKey, pero NO settingKey.
    if (words.some(word => STANDALONE_SECRET_WORDS.has(word))) {
        return words.some(word => KEY_QUALIFIERS.has(word));
    }

    return false;
}

/**
 * El MISMO vocabulario en forma de alternancia, para los caminos de texto
 * libre. No es una lista paralela: es el criterio de arriba escrito en regex.
 */
const SECRET_TERM_SOURCE = [
    'pass(?:words?|wds?|phrases?)?',
    'secrets?', 'secretos?',
    'tokens?', 'jwt',
    'api[-_]?keys?', 'access[-_]?(?:keys?|tokens?)',
    'private[-_]?keys?', 'signing[-_]?keys?', 'session[-_]?keys?',
    'secret[-_]?keys?', 'encryption[-_]?keys?',
    'credentials?', 'credenciales', 'credencial',
    'authorization', 'auth', 'bearer',
    'cookies?', 'signatures?', 'sig',
    'claves?', 'contrase(?:ñ|n|ny)as?',
    'firmas?', 'pwd', 'pin', 'otp', 'totp', 'mnemonic', 'seed',
    'keys?'
].join('|');

/** `scheme://usuario:contraseña@host` → las credenciales inline de una URL. */
const URL_CREDENTIALS = /(\b[a-z][a-z0-9+.-]*:\/\/)[^/\s:@]+:[^/\s@]+@/gi;

/** `?token=…`, `&access_token=…`, `?clave=…` — el nombre COMPLETO del parámetro. */
const QUERY_SECRET = new RegExp(`([?&](?:${SECRET_TERM_SOURCE})=)[^&\\s"'\`]+`, 'gi');

/**
 * Cabecera de autorización HTTP en cadena libre. Cubre los esquemas usuales y
 * no solo `Bearer`: `Basic` viaja con `usuario:contraseña` en base64 y fugaba
 * entero. El camino es real — `src/libs/alephscript-client.ts` loguea
 * `error.message` y `src/core/AracneBotService.ts` loguea `data` del mesh,
 * ambas cadenas libres que pueden traer la cabecera dentro.
 */
const AUTH_SCHEME = /\b(bearer|basic|digest|negotiate)\s+([A-Za-z0-9._~+/=-]{8,})/gi;

/**
 * Banderas de línea de comandos en forma larga: `--token X`, `--password=X`.
 * El lookahead del `[=\s]` evita tapar `--passthrough`, que empieza por «pass»
 * pero continúa. Sobre `-p` a secas, ver el límite L4 de la cabecera.
 */
const CLI_SECRET_FLAG = new RegExp(
    `(--?(?:${SECRET_TERM_SOURCE})[=\\s]+)(?:"[^"]*"|'[^']*'|\\S+)`,
    'gi'
);

/**
 * Asignación de entorno: `MESH_TOKEN=…`, `api_key=…`, `TOKEN=…`.
 *
 * El nombre se delimita por `_`/`-` o por los extremos, para que `SPINNER=x` no
 * case con `pin` ni `PASSENGERS=3` con `pass`. Va con `/i`: la primera versión
 * solo miraba MAYÚSCULAS, así que `token=x node app.js` fugaba entero mientras
 * `?token=x` sí se tapaba.
 */
const ENV_ASSIGNMENT = new RegExp(
    `(^|[\\s;&|(])((?:[A-Za-z0-9]+[_-])*(?:${SECRET_TERM_SOURCE})(?:[_-][A-Za-z0-9]+)*\\s*=)` +
        `(?:"[^"]*"|'[^']*'|\\S+)`,
    'gim'
);

/** Clave privada PEM completa, en una o varias líneas. */
const PEM_BLOCK = /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g;

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
 * Redacta una cadena libre: credenciales en URL, query params, cabeceras de
 * autorización, banderas de CLI, asignaciones de entorno, bloques PEM y el home
 * del usuario. Ver los límites L1–L5 en la cabecera del módulo.
 */
export function redactString(text: string): string {
    if (!text) {
        return text;
    }
    let out = text;
    out = out.replace(PEM_BLOCK, `-----BEGIN PRIVATE KEY----- ${REDACTED} -----END PRIVATE KEY-----`);
    out = out.replace(URL_CREDENTIALS, `$1${REDACTED}@`);
    out = out.replace(QUERY_SECRET, `$1${REDACTED}`);
    out = out.replace(AUTH_SCHEME, `$1 ${REDACTED}`);
    out = out.replace(CLI_SECRET_FLAG, `$1${REDACTED}`);
    out = out.replace(ENV_ASSIGNMENT, `$1$2${REDACTED}`);
    out = maskHomePath(out);
    return out;
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
