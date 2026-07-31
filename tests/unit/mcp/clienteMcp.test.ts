/**
 * WP-V28 · Tests del cliente MCP mínimo.
 *
 * CA1/CA2 corren contra el FIXTURE LOCAL del test (tests/unit/mcp/
 * fixtureServidorMcp.ts) — declarado como tal, NO runtime real de la Ciudad.
 * CA3 prueba de facto el camino sin servidor: fallo tipado, cero throw,
 * cero éxito fingido (plan/PRACTICAS.md §2 invariante 1).
 */

import * as http from 'node:http';
import { MinimalMcpClient } from '../../../src/mcp/client';
import {
    EDITOR_INFO_URI,
    LAUNCHER_CATALOG_URI,
    readEditorInfo,
    readLauncherCatalog
} from '../../../src/mcp/contracts';
import { resolveMcpEndpoint, MCP_HTTP_PATH } from '../../../src/mcp/endpoint';
import type { McpEndpoint } from '../../../src/mcp/types';
import {
    FixtureMcpServer,
    freePort,
    startFixtureMcpServer
} from './fixtureServidorMcp';

/** Settings vacíos: el schema V05/V08 tiene defaults vacíos (⏳). */
const SETTINGS_VACIOS = {
    launcherHost: '',
    launcherPort: undefined,
    lineaEditorHost: '',
    lineaEditorPort: undefined
};

describe('WP-V28 · CA1 — conectar contra servidor del catálogo (fixture local declarado)', () => {
    let fixture: FixtureMcpServer;

    beforeAll(async () => {
        fixture = await startFixtureMcpServer();
    });
    afterAll(async () => {
        await fixture.close();
    });

    function endpointDelFixture(): McpEndpoint {
        // Resolución por config (env central de z-sdk: ZEUS_HOST /
        // ZEUS_MCP_LAUNCHER — env/index.mjs:61,175-178), sin literales:
        // el puerto viene del fixture efímero.
        const r = resolveMcpEndpoint('launcher', {
            settings: SETTINGS_VACIOS,
            env: {
                ZEUS_HOST: fixture.host,
                ZEUS_MCP_LAUNCHER: String(fixture.port)
            }
        });
        if (!r.configured) {
            throw new Error(`endpoint del fixture sin resolver: ${r.reason}`);
        }
        return { host: r.host, port: r.port };
    }

    it('conecta (initialize) y lee la identidad del servidor', async () => {
        const client = new MinimalMcpClient(endpointDelFixture());
        const res = await client.connect();
        expect(res).toEqual({
            ok: true,
            data: {
                name: 'fixture-mcp',
                version: '0.0.0-fixture',
                protocolVersion: '2025-03-26'
            }
        });
    });

    it('envía el Accept dual exigido por el transporte del SDK y POST a /mcp', async () => {
        const client = new MinimalMcpClient(endpointDelFixture());
        await client.connect();
        const last = fixture.requests[fixture.requests.length - 1];
        expect(last.method).toBe('POST');
        expect(last.url).toBe(MCP_HTTP_PATH);
        const accept = String(last.headers.accept);
        expect(accept).toContain('application/json');
        expect(accept).toContain('text/event-stream');
    });

    it('lista lo que el servidor expone (resources/list)', async () => {
        const client = new MinimalMcpClient(endpointDelFixture());
        const res = await client.listResources();
        expect(res.ok).toBe(true);
        if (res.ok) {
            const uris = res.data.map((r) => r.uri);
            expect(uris).toContain(EDITOR_INFO_URI);
            expect(uris).toContain(LAUNCHER_CATALOG_URI);
            for (const d of res.data) {
                expect(d.mimeType).toBe('application/json');
            }
        }
    });

    describe('CA2 — leer editor://info y launcher://catalog (formato citado)', () => {
        it('editor://info trae la forma de editorInfo() (editor-server.mjs:83-128)', async () => {
            const client = new MinimalMcpClient(endpointDelFixture());
            const res = await readEditorInfo(client);
            expect(res.ok).toBe(true);
            if (res.ok) {
                expect(res.data.name).toBe('linea-editor');
                expect(res.data.mutationTools).toEqual([
                    'crear_linea',
                    'export_story_board'
                ]);
                expect(res.data.gate).toMatchObject({
                    visible: true,
                    token_env: 'ZEUS_MCP_APPROVAL_TOKEN'
                });
                expect(typeof res.data.lineasRoot).toBe('string');
            }
        });

        it('launcher://catalog trae servers[] con id (launcher-server.mjs:46-56)', async () => {
            const client = new MinimalMcpClient(endpointDelFixture());
            const res = await readLauncherCatalog(client);
            expect(res.ok).toBe(true);
            if (res.ok) {
                expect(res.data.servers).toHaveLength(1);
                const s = res.data.servers[0];
                expect(s.id).toBe('linea-editor');
                expect(s.spawnGroup).toBe('lineas');
                expect(typeof s.port).toBe('number');
                expect(s.capabilities).toEqual(['linea.editor']);
            }
        });
    });

    describe('caminos de contrato roto y error declarado', () => {
        it('resource desconocido → jsonrpc_error tipado (sin throw)', async () => {
            const client = new MinimalMcpClient(endpointDelFixture());
            const res = await client.readResourceJson('launcher://inexistente');
            expect(res.ok).toBe(false);
            if (!res.ok) {
                expect(res.pending).toBe(true);
                expect(res.code).toBe('jsonrpc_error');
                expect(res.reason).toContain('⏳');
            }
        });

        it('payload fuera de contrato → contrato_invalido (sin datos inventados)', async () => {
            const roto = await startFixtureMcpServer({
                resourceOverrides: {
                    [EDITOR_INFO_URI]: { name: 'linea-editor', mutationTools: [] }, // sin gate
                    [LAUNCHER_CATALOG_URI]: { servers: 'no-un-array' }
                }
            });
            try {
                const client = new MinimalMcpClient({ host: roto.host, port: roto.port });
                const info = await readEditorInfo(client);
                expect(info.ok).toBe(false);
                if (!info.ok) {
                    expect(info.code).toBe('contrato_invalido');
                    expect(info.reason).toContain('gate');
                }
                const cat = await readLauncherCatalog(client);
                expect(cat.ok).toBe(false);
                if (!cat.ok) {
                    expect(cat.code).toBe('contrato_invalido');
                    expect(cat.reason).toContain('servers');
                }
            } finally {
                await roto.close();
            }
        });
    });
});

describe('WP-V28 · CA3 — falla honesto sin runtime (de facto, sin servidor)', () => {
    it('sin configuración → endpoint_no_configurado vía resolución ⏳ (no inventa)', () => {
        const r = resolveMcpEndpoint('launcher', { settings: SETTINGS_VACIOS, env: {} });
        expect(r.configured).toBe(false);
        if (!r.configured) {
            expect(r.reason).toContain('⏳');
            expect(r.reason).toContain('aleph0.pieza.launcher.port');
            expect(r.reason).toContain('ZEUS_MCP_LAUNCHER');
        }
    });

    it('sin servidor escuchando → servidor_inaccesible tipado, cero throw, cero éxito fingido', async () => {
        const puertoLibre = await freePort(); // del SO, sin literal
        const client = new MinimalMcpClient({ host: '127.0.0.1', port: puertoLibre });

        const conexion = await client.connect(); // no debe lanzar
        expect(conexion.ok).toBe(false);
        if (!conexion.ok) {
            expect(conexion.pending).toBe(true);
            expect(conexion.code).toBe('servidor_inaccesible');
            expect(conexion.reason).toContain('⏳');
            expect(conexion.reason).toContain('sin runtime');
        }

        const lectura = await readEditorInfo(client); // tampoco lanza
        expect(lectura.ok).toBe(false);
        if (!lectura.ok) {
            expect(lectura.code).toBe('servidor_inaccesible');
        }

        const listado = await client.listResources();
        expect(listado.ok).toBe(false);
        if (!listado.ok) {
            expect(listado.code).toBe('servidor_inaccesible');
        }
    });

    it('servidor que no responde → timeout tipado dentro del plazo del cliente', async () => {
        // Servidor ad-hoc del test que acepta y JAMÁS responde (fixture hostil).
        const colgado = http.createServer(() => undefined);
        await new Promise<void>((resolve) => colgado.listen(0, '127.0.0.1', resolve));
        const addr = colgado.address();
        const port = addr !== null && typeof addr === 'object' ? addr.port : 0;
        try {
            const client = new MinimalMcpClient(
                { host: '127.0.0.1', port },
                { timeoutMs: 100 }
            );
            const res = await client.connect();
            expect(res.ok).toBe(false);
            if (!res.ok) {
                expect(res.code).toBe('timeout');
                expect(res.reason).toContain('100ms');
            }
        } finally {
            await new Promise<void>((resolve) => colgado.close(() => resolve()));
        }
    });

    it('respuesta HTTP no-MCP → respuesta_http_invalida tipada (status y cuerpo)', async () => {
        // Fixture hostil: 200 con texto plano en /mcp.
        const plano = http.createServer((_req, res) => {
            res.statusCode = 200;
            res.setHeader('content-type', 'text/plain');
            res.end('no soy JSON-RPC');
        });
        await new Promise<void>((resolve) => plano.listen(0, '127.0.0.1', resolve));
        const a1 = plano.address();
        const p1 = a1 !== null && typeof a1 === 'object' ? a1.port : 0;
        try {
            const client = new MinimalMcpClient({ host: '127.0.0.1', port: p1 });
            const res = await client.connect();
            expect(res.ok).toBe(false);
            if (!res.ok) {
                expect(res.code).toBe('respuesta_http_invalida');
            }
        } finally {
            await new Promise<void>((resolve) => plano.close(() => resolve()));
        }

        // Fixture hostil: error HTTP.
        const caido = http.createServer((_req, res) => {
            res.statusCode = 503;
            res.end();
        });
        await new Promise<void>((resolve) => caido.listen(0, '127.0.0.1', resolve));
        const a2 = caido.address();
        const p2 = a2 !== null && typeof a2 === 'object' ? a2.port : 0;
        try {
            const client = new MinimalMcpClient({ host: '127.0.0.1', port: p2 });
            const res = await client.listResources();
            expect(res.ok).toBe(false);
            if (!res.ok) {
                expect(res.code).toBe('respuesta_http_invalida');
                expect(res.reason).toContain('503');
            }
        } finally {
            await new Promise<void>((resolve) => caido.close(() => resolve()));
        }
    });
});

describe('WP-V28 · contra runtime real (skip-honesto)', () => {
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('skip-honesto: conectar/listar/leer contra mcp-launcher y linea-editor VIVOS de z-sdk — exige runtime real de la Ciudad arrancado (no disponible en este arnés unit); no se simula como verde', () => {
        /* intencionadamente vacío: sin runtime no hay ✅ */
    });
});
