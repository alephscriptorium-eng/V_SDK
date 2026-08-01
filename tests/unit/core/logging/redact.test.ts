/**
 * WP-V71 · el redactor es la garantía de «nada de secretos en el log».
 * Se ejercita como pieza pura: sin `vscode`, sin canal, sin singleton.
 */
import {
    REDACTED,
    redactString,
    redactValue,
    serializeData,
    isSecretKey,
    maskHomePath
} from '../../../../src/core/logging/redact';

describe('WP-V71 · redact — claves secretas', () => {
    it.each([
        // inglés
        'password', 'passwd', 'pass', 'passphrase', 'secret', 'token', 'jwt',
        'accessToken', 'api_key', 'apiKey', 'API-KEY', 'APIKey', 'authorization',
        'auth', 'authToken', 'oauthToken', 'credential', 'credentials', 'cookie',
        'privateKey', 'private_key', 'sessionKey', 'signature', 'otp',
        // la clave ENTERA
        'key', 'sig',
        // compuestos PEGADOS, sin separador ni camelCase (2ª devolución, D-1):
        // `apiKey` se tapaba y `apikey` fugaba en la misma línea
        'apikey', 'apikeys', 'accesstoken', 'accesskey', 'privatekey',
        'sessionkey', 'secretkey', 'signingkey', 'encryptionkey', 'masterkey',
        // castellano — el árbol comenta y documenta en castellano (devolución D4)
        'clave', 'claves', 'contraseña', 'contrasena', 'contrasenya',
        'credenciales', 'credencial', 'secreto', 'pwd', 'pin', 'firma'
    ])('reconoce «%s» como clave secreta', key => {
        expect(isSecretKey(key)).toBe(true);
    });

    it.each([
        'author', 'authorship', 'authorId', 'name', 'url', 'port', 'status',
        'command',
        // `key` sin calificador secreto: son nombres de ajuste, no credenciales
        'settingKey', 'configKey', 'keyName',
        // la clave nombra DÓNDE vive el valor, no el valor (devolución D5)
        'tokenEnv', 'repartoPolicyEnv', 'tokenName',
        // descriptores, no valores (2ª devolución, D-6)
        'authorizationDocsUrl', 'cookieBannerShown', 'tokenPattern', 'authType',
        // subcadenas que NO son la palabra: por qué se compara por palabras
        'pingInterval', 'spinner', 'passengers', 'pinnedAt', 'monkey', 'turnkey'
    ])('NO trata «%s» como secreta', key => {
        expect(isSecretKey(key)).toBe(false);
    });

    it('`tokenEnv` conserva su valor: nombra la variable, no la contiene', () => {
        // Falso positivo real corregido en la devolución (D5):
        // `VisibleGate.tokenEnv` — src/mutation/types.ts:24
        expect(redactValue({ tokenEnv: 'MESH_TOKEN', token: 'ghp_deadbeef' })).toEqual({
            tokenEnv: 'MESH_TOKEN',
            token: REDACTED
        });
    });

    it('`auth` se tapa y `author` no, sin excluir `auth` del vocabulario', () => {
        // La primera versión sacrificaba `auth` para salvar `author`. Comparar
        // por PALABRAS da las dos cosas (devolución D5).
        expect(isSecretKey('auth')).toBe(true);
        expect(isSecretKey('author')).toBe(false);
        expect(redactValue({ author: 'ada@lovelace.dev', auth: 'ghp_x' })).toEqual({
            author: 'ada@lovelace.dev',
            auth: REDACTED
        });
    });

    it('tapa el valor secreto a cualquier profundidad', () => {
        const out = redactValue({
            mesh: { conexion: { apiKey: 'sk-live-123456' }, host: 'localhost' }
        }) as any;
        expect(out.mesh.conexion.apiKey).toBe(REDACTED);
        expect(out.mesh.host).toBe('localhost');
    });

    it('un contenedor con nombre secreto se tapa ENTERO, sin descender', () => {
        // `auth` es secreta como palabra, así que el subárbol no se explora:
        // más seguro que tapar hoja a hoja y dejarse una.
        const out = redactValue({ mesh: { auth: { apiKey: 'sk-live-1', otro: 'x' } } }) as any;
        expect(out.mesh.auth).toBe(REDACTED);
    });
});

describe('WP-V71 · redact — cadenas libres', () => {
    it('tapa credenciales inline de una URL y conserva el host', () => {
        const out = redactString('conectando a https://ada:s3cr3t@mesh.local:3000/runtime');
        expect(out).toContain('mesh.local:3000/runtime');
        expect(out).not.toContain('s3cr3t');
    });

    it('tapa el token de un query param', () => {
        const out = redactString('GET http://mesh.local/catalog?token=abc123&page=2');
        expect(out).not.toContain('abc123');
        expect(out).toContain('page=2');
    });

    it.each(['Bearer', 'Basic', 'Negotiate'])(
        'tapa la cabecera de autorización con esquema %s (credencial pegada al esquema)',
        esquema => {
            // `Basic` fugaba entero en la 1ª versión, y viaja con
            // usuario:contraseña en base64 (1ª devolución, D4).
            //
            // `Digest` NO está en esta lista a propósito: su credencial no va
            // pegada al esquema sino en parámetros, así que tratarlo aquí
            // tapaba el usuario y dejaba pasar el hash (2ª devolución, D-7).
            // Tiene su propio caso más abajo.
            const out = redactString(`Authorization: ${esquema} eyJhbGciOiSECRETOaaa`);
            expect(out).not.toContain('SECRETO');
        }
    );

    it('tapa banderas de línea de comando en forma larga', () => {
        const out = redactString('node launcher.js --api-key sk-live-999 --port 3000');
        expect(out).not.toContain('sk-live-999');
        expect(out).toContain('--port 3000');
    });

    it.each(['--clave', '--contraseña', '--pwd', '--auth', '--jwt', '--credenciales'])(
        'tapa la bandera %s (vocabulario unificado con el de las claves)',
        bandera => {
            expect(redactString(`node a.js ${bandera} SECRETO`)).not.toContain('SECRETO');
        }
    );

    it('tapa asignaciones de entorno en MAYÚSCULAS y en minúsculas', () => {
        // La primera versión solo miraba MAYÚSCULAS: `token=x` fugaba mientras
        // `?token=x` sí se tapaba (devolución D4).
        for (const linea of ['MESH_TOKEN=abc999 node i.js', 'token=abc999 node i.js', 'api_key=abc999 x']) {
            expect(redactString(linea)).not.toContain('abc999');
        }
    });

    it.each([
        'node a.js --port 3000',
        'NODE_ENV=production node i.js',
        'docker run -p 8080:80 img',
        'SPINNER=on node i.js',
        'PASSENGERS=3 node i.js',
        'GET /authors?page=2'
    ])('NO toca «%s» (cero falsos positivos)', linea => {
        expect(redactString(linea)).toBe(linea);
    });

    it('el vocabulario es el MISMO en query, bandera y entorno', () => {
        // La inconsistencia que señaló la 1ª devolución: `?auth=` se tapaba
        // pero `--auth` no. Los caminos derivan ya de una sola fuente.
        for (const forma of ['http://m/c?auth=SECRETO', 'node a.js --auth SECRETO', 'auth=SECRETO node a.js']) {
            expect(redactString(forma)).not.toContain('SECRETO');
        }
    });

    it('tapa `etiqueta: valor` — incluido el JSON embebido en cadena libre', () => {
        // 2ª devolución (D-2): ningún patrón cubría los dos puntos. Llega por
        // `error.message` (src/libs/alephscript-client.ts:125).
        for (const forma of [
            'password: SECRETO',
            'contraseña: SECRETO',
            'clave: SECRETO',
            'fallo al parsear {"token":"SECRETO","page":2}',
            "Authorization: SECRETOxyz"
        ]) {
            expect(redactString(forma)).not.toContain('SECRETO');
        }
    });

    it('D-7 · en `Digest` se tapan los PARÁMETROS, que es donde vive el hash', () => {
        // El patrón de esquema tapaba el usuario y dejaba pasar `response`.
        const out = redactString('Authorization: Digest username="ada", response="0f1e2d3c4b5a", nonce="xyz"');
        expect(out).not.toContain('0f1e2d3c4b5a');
        expect(out).not.toContain('ada');
    });

    it('«digest» en prosa NO arrasa la línea', () => {
        expect(redactString('el message digest quedó calculado')).toBe('el message digest quedó calculado');
    });

    it('EL MISMO término se comporta igual por los DOS caminos (clave y cadena)', () => {
        // Este es el invariante que las dos devoluciones han atacado: que el
        // camino de CLAVE y el de CADENA no discrepen. Se prueba en pareja.
        for (const termino of ['apikey', 'apiKey', 'accesstoken', 'privatekey', 'auth', 'clave', 'pwd']) {
            expect(isSecretKey(termino)).toBe(true);
            expect(redactString(`?${termino}=SECRETO`)).not.toContain('SECRETO');
            expect(redactValue({ [termino]: 'SECRETO' })).toEqual({ [termino]: REDACTED });
        }
    });

    it('tapa un bloque PEM entero', () => {
        const pem = '-----BEGIN RSA PRIVATE KEY-----\nMIIEow...\nlineados\n-----END RSA PRIVATE KEY-----';
        const out = redactString(`clave cargada: ${pem}`);
        expect(out).not.toContain('MIIEow');
        expect(out).toContain(REDACTED);
    });

    it('enmascara el home del usuario conservando el resto de la ruta', () => {
        const home = process.env.HOME || process.env.USERPROFILE;
        if (!home || home.length <= 3) {
            return; // sin home no hay nada que enmascarar en este entorno
        }
        const out = maskHomePath(`${home}/proyectos/zigurat/config.json`);
        expect(out).toBe('~/proyectos/zigurat/config.json');
        expect(out).not.toContain(home);
    });
});

describe('WP-V71 · redact — LÍMITES CONOCIDOS (declarados, no tapados)', () => {
    // Estos casos FUGAN, y se fijan por test a propósito: son el límite de
    // cualquier redactor por nombre. Si algún día se cierran, este bloque
    // falla y obliga a actualizar la cabecera de `redact.ts` — que es
    // exactamente lo que debe pasar. Un límite callado es un hueco; uno
    // fijado por test es una decisión.

    it('L1 · secreto en el PATH de una URL: no hay nombre que lo anuncie', () => {
        const s = 'GET https://host/v1/AKIAIOSFODNN7EXAMPLE/datos';
        expect(redactString(s)).toContain('AKIAIOSFODNN7EXAMPLE');
    });

    it('L2 · blob base64/hex suelto sin etiqueta: indistinguible de un hash o un id', () => {
        const s = 'respuesta: ZGVhZGJlZWZkZWFkYmVlZg==';
        expect(redactString(s)).toContain('ZGVhZGJlZWZkZWFkYmVlZg==');
    });

    it('L3 · secreto usado como CLAVE: se redacta el valor, no el nombre del campo', () => {
        // El nombre del campo ES el secreto. Nada en él lo anuncia.
        expect(redactValue({ ghp_A1b2C3d4E5f6: 'activo' })).toEqual({ ghp_A1b2C3d4E5f6: 'activo' });
    });

    it('L4 · `-p valor` NO se tapa: en medio ecosistema `-p` es «port»', () => {
        expect(redactString('mysql -u root -p hunter2')).toContain('hunter2');
        // La contrapartida buscada: `docker run -p 8080:80` queda intacto.
        expect(redactString('docker run -p 8080:80 img')).toBe('docker run -p 8080:80 img');
    });

    it('L5 · prosa SIN delimitador: «la clave es hunter2» fuga', () => {
        // 2ª devolución (D-2): la cabecera afirmaba que ESTA forma se tapaba, y
        // era falso; y el test solo fijaba el lado que nadie cerraría jamás
        // («hunter2» a secas), así que cerrar el caso real no ponía rojo nada.
        // Ahora el límite se fija DONDE ESTÁ: hay la palabra «clave», pero no
        // hay `:` ni `=` que la ligue al valor.
        expect(redactString('la clave es hunter2')).toContain('hunter2');

        // Y se fija el borde exacto: con delimitador SÍ se tapa. Si alguien
        // cierra el caso de arriba, este par deja de ser coherente y el
        // primero falla — que es lo que debe pasar.
        expect(redactString('la clave: hunter2')).not.toContain('hunter2');
        expect(redactString('clave=hunter2')).not.toContain('hunter2');
    });

    it('L6 · sobre-redacción residual: ciega, no fuga', () => {
        // `REFERENCE_SUFFIXES` cubre los descriptores frecuentes, pero no hay
        // lista completa de sufijos «esto describe, no contiene».
        expect(isSecretKey('claveDeOrdenacion')).toBe(true); // no es un secreto
        // El lado seguro del error: se declara, no se vende como «cero falsos
        // positivos».
    });
});

describe('WP-V71 · redact — valores no triviales', () => {
    it('serializa un Error con nombre, mensaje y pila', () => {
        const out = redactValue(new TypeError('algo explotó')) as any;
        expect(out.name).toBe('TypeError');
        expect(out.message).toBe('algo explotó');
        expect(typeof out.stack).toBe('string');
    });

    it('un Error dentro de un objeto NO se convierte en {} — el motivo de existir del serializador', () => {
        const json = serializeData({ error: new Error('fallo de red') })!;
        expect(json).toContain('fallo de red');
        expect(JSON.stringify({ error: new Error('fallo de red') })).toBe('{"error":{}}');
    });

    it('tolera ciclos sin lanzar', () => {
        const a: any = { nombre: 'a' };
        a.yo = a;
        expect(() => serializeData(a)).not.toThrow();
        expect(serializeData(a)).toContain('[ciclo]');
    });

    it('redacta dentro de arrays y Maps', () => {
        expect(redactValue([{ token: 'x' }])).toEqual([{ token: REDACTED }]);
        expect(redactValue(new Map([['secret', 'x'], ['port', '3000']]))).toEqual({
            secret: REDACTED,
            port: '3000'
        });
    });

    it('nunca lanza ante un valor hostil y devuelve una sola línea', () => {
        const hostil = {
            get explota() {
                throw new Error('getter hostil');
            }
        };
        expect(() => serializeData(hostil)).not.toThrow();
        expect(serializeData({ a: 1, b: 'dos' })).not.toContain('\n');
    });

    it('devuelve undefined cuando no hay nada que añadir', () => {
        expect(serializeData(undefined)).toBeUndefined();
        expect(serializeData(null)).toBeUndefined();
        expect(serializeData({})).toBeUndefined();
    });
});
