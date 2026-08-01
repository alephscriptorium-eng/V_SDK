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
 * Hay UN vocabulario (`COMPOUND_SECRET_TERMS`) del que derivan **las dos
 * mitades**: `WORD_IS_SECRET` para claves de objeto y `SECRET_TERM_SOURCE`
 * para cadenas — banderas de CLI, asignaciones de entorno y parámetros de
 * query. Es la **misma alternancia anclada**, y por eso `apikey` casa como
 * clave y como cadena mientras `author` no casa por ninguna vía.
 *
 * Esta frontera se ha roto **dos veces** y siempre por lo mismo: cuatro listas
 * que no coincidían entre sí (`?auth=` se tapaba y `--auth` no), y luego una
 * lista aparte para claves que no veía los compuestos pegados (`apikey` en
 * claro junto a `apiKey` tapado, en la misma línea). Un criterio partido en
 * dos no es un criterio: es un hueco con aspecto de criterio. Por eso el test
 * fija el invariante **en pareja** por cada término.
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
 *   L5 · secreto en prosa **sin delimitador**: `clave: hunter2` y `clave=hunter2`
 *        SÍ se tapan (hay `:` o `=`); «la clave es hunter2» NO — reconocer que
 *        «es» delimita exigiría analizar lenguaje natural.
 *        (Corregido en la 2ª devolución: la cabecera afirmaba que esta forma se
 *        tapaba, y era falso. Ahora el test fija el límite donde de verdad
 *        está, no en el lado que nadie cerraría nunca.)
 *   L6 · **sobre-redacción** residual: la clave `claveDeOrdenacion` se tapa
 *        aunque no sea un secreto. `REFERENCE_SUFFIXES` cubre los descriptores
 *        frecuentes, pero no hay lista completa. Ciega, no fuga: es el lado
 *        seguro del error, y se declara en vez de venderse como «cero falsos
 *        positivos».
 */

/** Marca visible de valor tapado. Se elige un literal improbable en datos reales. */
export const REDACTED = '«redactado»';

/**
 * ── EL VOCABULARIO. Fuente ÚNICA. ────────────────────────────────────────
 *
 * Términos compuestos: valen como palabra suelta y **también pegados**
 * (`apikey`, `accesstoken`, `privatekey`). De esta lista salen a la vez el
 * camino de CLAVES y los cuatro caminos de CADENA — literalmente la misma
 * constante, no dos listas que se parecen.
 *
 * Historia de por qué está así (dos devoluciones):
 *  - 1ª: había cuatro listas paralelas; `?auth=` se tapaba y `--auth` no.
 *    Se unificaron los caminos de cadena.
 *  - 2ª: el camino de CLAVE seguía siendo una lista aparte, y como partía por
 *    palabras no veía los compuestos pegados: `apiKey` se tapaba y `apikey`
 *    fugaba **en la misma línea**. El mismo defecto un piso más abajo.
 *    Ahora el camino de clave prueba estos términos ANCLADOS contra cada
 *    palabra, así que `apikey` casa por `api[-_]?keys?` y `author` sigue sin
 *    casar por `auth` (el anclaje preserva la frontera de palabra).
 *
 * Incluye castellano a propósito: este árbol comenta, documenta y planifica en
 * castellano, así que sus datos también lo harán.
 */
const COMPOUND_SECRET_TERMS = [
    // inglés
    'pass(?:words?|wds?|phrases?)?',
    'secrets?', 'tokens?', 'jwt',
    'api[-_]?keys?', 'access[-_]?(?:keys?|tokens?)',
    'private[-_]?keys?', 'signing[-_]?keys?', 'session[-_]?keys?',
    'secret[-_]?keys?', 'encryption[-_]?keys?', 'master[-_]?keys?',
    'credentials?', 'cookies?', 'signatures?',
    'authorization', 'auth', 'bearer',
    'otp', 'totp', 'mnemonic', 'seed',
    // castellano
    'secretos?', 'credenciales', 'credencial',
    'claves?', 'contrase(?:ñ|n|ny)as?', 'firmas?', 'pwd', 'pin'
];

/**
 * Términos que solo son secretos cuando son el nombre **completo**: la clave
 * entera (`{ key: … }`), el parámetro entero (`?key=`) o la bandera entera
 * (`--sig=`).
 *
 * Como palabra suelta dentro de una clave compuesta no bastan: `settingKey` y
 * `configKey` son nombres de ajuste, no credenciales — y este árbol loguea
 * `settingKey` de verdad (`src/views/HackerConfigPanelProvider.ts`).
 */
const STANDALONE_SECRET_TERMS = ['keys?', 'sig'];

/** Una palabra de clave es secreta si casa ENTERA con un término compuesto. */
const WORD_IS_SECRET = new RegExp(`^(?:${COMPOUND_SECRET_TERMS.join('|')})$`, 'i');

/** …o si es uno de los términos que solo valen como nombre completo. */
const WORD_IS_STANDALONE = new RegExp(`^(?:${STANDALONE_SECRET_TERMS.join('|')})$`, 'i');

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
    'env', 'envvar', 'name', 'varname', 'var', 'label', 'field',
    // 2ª devolución (D-6): estos sufijos describen el campo, no lo contienen.
    // Sin ellos se cegaban `authorizationDocsUrl` y `cookieBannerShown`.
    'url', 'uri', 'docs', 'doc', 'pattern', 'type', 'format', 'mode',
    'policy', 'enabled', 'disabled', 'shown', 'visible', 'required', 'count'
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
    if (words.length === 1 && WORD_IS_STANDALONE.test(words[0])) {
        return true;
    }

    // Alguna palabra casa entera con un término del vocabulario. Al estar
    // ANCLADO, `apikey` casa (por `api[-_]?keys?`) y `author` no casa por
    // `auth` — que es justo lo que se quiere de las dos.
    if (words.some(word => WORD_IS_SECRET.test(word))) {
        return true;
    }

    // `key` calificado: apiKey / privateKey / accessKey, pero NO settingKey.
    if (words.some(word => WORD_IS_STANDALONE.test(word))) {
        return words.some(word => KEY_QUALIFIERS.has(word));
    }

    return false;
}

/**
 * El MISMO vocabulario para los caminos de texto libre. No es una lista
 * paralela: son literalmente las dos constantes de arriba concatenadas.
 */
const SECRET_TERM_SOURCE = [...COMPOUND_SECRET_TERMS, ...STANDALONE_SECRET_TERMS].join('|');

/** `scheme://usuario:contraseña@host` → las credenciales inline de una URL. */
const URL_CREDENTIALS = /(\b[a-z][a-z0-9+.-]*:\/\/)[^/\s:@]+:[^/\s@]+@/gi;

/** `?token=…`, `&access_token=…`, `?clave=…` — el nombre COMPLETO del parámetro. */
const QUERY_SECRET = new RegExp(`([?&](?:${SECRET_TERM_SOURCE})=)[^&\\s"'\`]+`, 'gi');

/**
 * `etiqueta: valor` en cadena libre — la forma que faltaba.
 *
 * 2ª devolución (D-2): ningún patrón cubría los dos puntos; todos exigían `=`,
 * `--` o `?`. Así fugaban `password: hunter2`, `contraseña: hunter2` y **el
 * JSON embebido en una cadena** (`{"token":"abc"}`), que es justo lo que llega
 * por `error.message` en `src/libs/alephscript-client.ts:125`.
 *
 * El valor se corta en el primer separador estructural para no comerse el
 * resto del mensaje.
 */
const LABELED_SECRET = new RegExp(
    `(["']?\\b(?:${SECRET_TERM_SOURCE})["']?\\s*:\\s*)(?:"[^"]*"|'[^']*'|[^\\s,;}\\])]+)`,
    'gi'
);

/**
 * Cabecera de autorización HTTP donde la credencial va **pegada al esquema**.
 * `Basic` viaja con `usuario:contraseña` en base64 y fugaba entero.
 *
 * `Digest` **no** está aquí: en Digest la credencial no va pegada al esquema
 * sino en parámetros (`response="…"`), así que este patrón tapaba el nombre de
 * usuario y dejaba pasar el hash — prometía una protección que no daba
 * (2ª devolución, D-7). Va aparte, abajo.
 */
const AUTH_SCHEME = /\b(bearer|basic|negotiate)\s+([A-Za-z0-9._~+/=-]{8,})/gi;

/**
 * `Digest username="ada", response="0f1e…", nonce="…"` — se tapan TODOS los
 * parámetros, que es donde vive de verdad la credencial. Solo dispara cuando
 * al esquema le siguen pares `clave=valor`, para no arrasar la palabra
 * «digest» en prosa.
 */
const DIGEST_HEADER =
    /\b(digest)\s+((?:[a-z]+\s*=\s*(?:"[^"]*"|[^,\s]+))(?:\s*,\s*[a-z]+\s*=\s*(?:"[^"]*"|[^,\s]+))*)/gi;

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
    out = out.replace(DIGEST_HEADER, `$1 ${REDACTED}`);
    out = out.replace(AUTH_SCHEME, `$1 ${REDACTED}`);
    out = out.replace(CLI_SECRET_FLAG, `$1${REDACTED}`);
    out = out.replace(ENV_ASSIGNMENT, `$1$2${REDACTED}`);
    out = out.replace(LABELED_SECRET, `$1${REDACTED}`);
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
