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
        'password', 'passwd', 'pass', 'secret', 'token', 'accessToken',
        'api_key', 'apiKey', 'API-KEY', 'authorization', 'credential',
        'cookie', 'privateKey', 'private_key', 'sessionKey', 'passphrase'
    ])('reconoce «%s» como clave secreta', key => {
        expect(isSecretKey(key)).toBe(true);
    });

    it.each(['author', 'authorship', 'authorId', 'name', 'url', 'port', 'status', 'command'])(
        'NO trata «%s» como secreta',
        key => {
            expect(isSecretKey(key)).toBe(false);
        }
    );

    it('no ciega a AuthorshipService: `author` sobrevive junto a `token` tapado', () => {
        const out = redactValue({ author: 'ada@lovelace.dev', token: 'ghp_deadbeefdeadbeef' });
        expect(out).toEqual({ author: 'ada@lovelace.dev', token: REDACTED });
    });

    it('tapa el valor secreto a cualquier profundidad', () => {
        const out = redactValue({
            mesh: { auth: { apiKey: 'sk-live-123456' }, host: 'localhost' }
        }) as any;
        expect(out.mesh.auth.apiKey).toBe(REDACTED);
        expect(out.mesh.host).toBe('localhost');
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

    it('tapa una cabecera Bearer', () => {
        expect(redactString('Authorization: Bearer eyJhbGciOi.J9payload.sig')).not.toContain('eyJhbGciOi');
    });

    it('tapa banderas de línea de comando', () => {
        const out = redactString('node launcher.js --api-key sk-live-999 --port 3000');
        expect(out).not.toContain('sk-live-999');
        expect(out).toContain('--port 3000');
    });

    it('tapa asignaciones de entorno en una línea de comando', () => {
        const out = redactString('MESH_TOKEN=abc999 NODE_ENV=production node index.js');
        expect(out).not.toContain('abc999');
        expect(out).toContain('NODE_ENV=production');
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
