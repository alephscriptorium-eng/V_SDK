/**
 * FIXTURE LOCAL DEL TEST — declarado como tal (CA1 de WP-V28).
 * NO es runtime real de la Ciudad: es un servidor node:http propio del test
 * que imita la superficie Streamable HTTP citada de z-sdk:
 * - POST sobre '/mcp' (presets-sdk/src/mcp/create-app.mjs:65,107);
 * - stateless con respuesta JSON plana (stateless-route.mjs:38-41);
 * - GET/DELETE → 405 (stateless-route.mjs:66-67);
 * - Accept debe incluir application/json y text/event-stream (SDK MCP) → 406;
 * - formas de editor://info (editor-server.mjs:83-128) y launcher://catalog
 *   (launcher-server.mjs:46-56) con VALORES SINTÉTICOS del fixture.
 * Escucha en puerto efímero (listen(0)) — cero literales de puerto.
 */

import * as http from 'node:http';
import { MCP_HTTP_PATH } from '../../../src/mcp/endpoint';
import { EDITOR_INFO_URI, LAUNCHER_CATALOG_URI } from '../../../src/mcp/contracts';

export interface FixtureRequest {
    method: string;
    url: string;
    headers: http.IncomingHttpHeaders;
    body: unknown;
}

export interface FixtureMcpServer {
    host: string;
    port: number;
    requests: FixtureRequest[];
    close: () => Promise<void>;
}

export interface FixtureOptions {
    /** Overrides de payload por URI (para probar contrato_invalido). */
    resourceOverrides?: Record<string, unknown>;
}

/** Forma sintética de editor://info según editorInfo() (editor-server.mjs:83-128). */
export function fixtureEditorInfo(): Record<string, unknown> {
    return {
        name: 'linea-editor',
        version: '0.0.0-fixture',
        lineasRoot: '<fixture>/LINEAS',
        mutationTools: ['crear_linea', 'export_story_board'],
        gate: {
            visible: true,
            token_env: 'ZEUS_MCP_APPROVAL_TOKEN',
            gate_line: 'fixture gate line',
            reparto_required: true,
            reparto_policy_env: 'ZEUS_LINEA_EDITOR_REQUIRE_REPARTO',
            reparto: {
                required: true,
                motivos_deny: ['reparto_requerido', 'card_no_vigente']
            }
        },
        personajes: { schema: '@zeus/story-board-schema', emitted_by: 'export_story_board' },
        frontier: { this_server: 'mutation + export' }
    };
}

/** Forma sintética de launcher://catalog (launcher-server.mjs:46-56). */
export function fixtureLauncherCatalog(fixturePort: number): Record<string, unknown> {
    return {
        servers: [
            {
                id: 'linea-editor',
                name: 'linea-editor',
                // puerto del propio fixture: dato sintético sin literal
                port: fixturePort,
                workspace: 'packages/mesh/linea-editor',
                spawnGroup: 'lineas',
                capabilities: ['linea.editor'],
                tree: null
            }
        ]
    };
}

export async function startFixtureMcpServer(
    options: FixtureOptions = {}
): Promise<FixtureMcpServer> {
    const requests: FixtureRequest[] = [];
    let boundPort = 0;

    const server = http.createServer((req, res) => {
        const chunks: Buffer[] = [];
        req.on('data', (c) => chunks.push(c));
        req.on('end', () => {
            const rawBody = Buffer.concat(chunks).toString('utf8');
            let body: unknown = undefined;
            try {
                body = rawBody === '' ? undefined : JSON.parse(rawBody);
            } catch {
                body = rawBody;
            }
            requests.push({
                method: req.method ?? '',
                url: req.url ?? '',
                headers: req.headers,
                body
            });

            if (req.url !== MCP_HTTP_PATH) {
                res.statusCode = 404;
                res.end();
                return;
            }
            // stateless-route.mjs:66-67 — solo POST.
            if (req.method !== 'POST') {
                res.statusCode = 405;
                res.setHeader('content-type', 'application/json');
                res.end(
                    JSON.stringify({
                        jsonrpc: '2.0',
                        error: { code: -32000, message: 'Method not allowed in stateless mode' },
                        id: null
                    })
                );
                return;
            }
            // Contrato del transporte servidor del SDK: Accept dual o 406.
            const accept = String(req.headers.accept ?? '');
            if (!accept.includes('application/json') || !accept.includes('text/event-stream')) {
                res.statusCode = 406;
                res.end();
                return;
            }

            const rpc = (body ?? {}) as {
                id?: number | string | null;
                method?: string;
                params?: { uri?: string };
            };
            const reply = (payload: Record<string, unknown>) => {
                res.statusCode = 200;
                res.setHeader('content-type', 'application/json');
                res.end(JSON.stringify({ jsonrpc: '2.0', id: rpc.id ?? null, ...payload }));
            };

            switch (rpc.method) {
                case 'initialize':
                    reply({
                        result: {
                            protocolVersion: '2025-03-26',
                            capabilities: { resources: {} },
                            serverInfo: { name: 'fixture-mcp', version: '0.0.0-fixture' }
                        }
                    });
                    return;
                case 'resources/list':
                    reply({
                        result: {
                            resources: [
                                {
                                    uri: EDITOR_INFO_URI,
                                    name: 'editor-info',
                                    mimeType: 'application/json'
                                },
                                {
                                    uri: LAUNCHER_CATALOG_URI,
                                    name: 'launcher-catalog',
                                    mimeType: 'application/json'
                                }
                            ]
                        }
                    });
                    return;
                case 'resources/read': {
                    const uri = rpc.params?.uri;
                    const overrides = options.resourceOverrides ?? {};
                    let payload: unknown;
                    if (uri !== undefined && uri in overrides) {
                        payload = overrides[uri];
                    } else if (uri === EDITOR_INFO_URI) {
                        payload = fixtureEditorInfo();
                    } else if (uri === LAUNCHER_CATALOG_URI) {
                        payload = fixtureLauncherCatalog(boundPort);
                    } else {
                        reply({
                            error: { code: -32002, message: `Resource not found: ${uri}` }
                        });
                        return;
                    }
                    reply({
                        result: {
                            contents: [
                                {
                                    uri,
                                    mimeType: 'application/json',
                                    text: JSON.stringify(payload)
                                }
                            ]
                        }
                    });
                    return;
                }
                default:
                    reply({
                        error: { code: -32601, message: `Method not found: ${rpc.method}` }
                    });
            }
        });
    });

    await new Promise<void>((resolve, reject) => {
        server.once('error', reject);
        // Puerto efímero del SO: el test no fija literales.
        server.listen(0, '127.0.0.1', () => resolve());
    });
    const address = server.address();
    if (address === null || typeof address !== 'object') {
        throw new Error('fixture sin dirección de escucha');
    }
    boundPort = address.port;

    return {
        host: '127.0.0.1',
        port: boundPort,
        requests,
        close: () =>
            new Promise<void>((resolve) => {
                server.close(() => resolve());
            })
    };
}

/**
 * Puerto libre obtenido del SO (abrir en 0 y cerrar): para el camino
 * «sin servidor» sin inventar literales ni pisar servicios reales.
 */
export async function freePort(): Promise<number> {
    const server = http.createServer(() => undefined);
    await new Promise<void>((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', () => resolve());
    });
    const address = server.address();
    const port = address !== null && typeof address === 'object' ? address.port : 0;
    await new Promise<void>((resolve) => server.close(() => resolve()));
    return port;
}
