/**
 * FIXTURE LOCAL DEL TEST — RH-16.
 * Servidor MCP sintético que proyecta URIs h-sdk://experiencia/* con shapes 0.1.0.
 * NO es transport de producto H (AlmacenResources in-process sigue <pendiente>).
 */

import * as http from 'node:http';
import { MCP_HTTP_PATH } from '../../../src/mcp/endpoint';
import {
    EXPERIENCIA_RESOURCE_VERSION,
    URI_EXPERIENCIA_ESCENA,
    URI_EXPERIENCIA_ESTADO,
    URI_EXPERIENCIA_EVIDENCIA
} from '../../../src/experiencia/types';

export interface FixtureRequest {
    method: string;
    url: string;
    headers: http.IncomingHttpHeaders;
    body: unknown;
}

export interface FixtureExperienciaServer {
    host: string;
    port: number;
    requests: FixtureRequest[];
    close: () => Promise<void>;
}

export interface FixtureExperienciaOptions {
    /** Overrides de payload por URI. */
    resourceOverrides?: Record<string, unknown>;
    /** URIs a omitir de resources/list (hostil-omite). */
    omitUris?: readonly string[];
    serverName?: string;
    serverVersion?: string;
}

/** Payload tipado al estado actual de H (RH-15): pending_external visible, cero complete. */
export function fixtureEstadoPendingExternal(): Record<string, unknown> {
    return {
        resourceVersion: EXPERIENCIA_RESOURCE_VERSION,
        estado: 'pending_external_contract',
        motivo: 'gaps E/línea/HUB',
        superficie: 'app-prueba-hm',
        pending_external: [
            'LORE-HM',
            'provider-E',
            'linea-kit-types',
            'evidencia-HUB'
        ],
        acople: { ciudad: 'registry', delta: 'arg-runtime', m: 'onfalo-fixture' }
    };
}

export function fixtureEscenaNoDisponible(): Record<string, unknown> {
    return {
        resourceVersion: EXPERIENCIA_RESOURCE_VERSION,
        sesionId: null,
        disponible: false,
        motivo: 'sesion no abierta'
    };
}

export function fixtureEvidenciaPending(): Record<string, unknown> {
    return {
        resourceVersion: EXPERIENCIA_RESOURCE_VERSION,
        verificado: false,
        evidenciaId: null,
        pending_external: 'evidencia-HUB',
        motivo: 'evidencia canónica HUB ausente'
    };
}

/** Solo para probar el camino parse→complete; NO representa H vivo. */
export function fixtureEstadoCompleteSintetico(): Record<string, unknown> {
    return {
        resourceVersion: EXPERIENCIA_RESOURCE_VERSION,
        estado: 'complete',
        pending_external: [],
        acople: { ciudad: 'ok', delta: 'ok', m: 'ok' }
    };
}

export function fixtureEscenaDisponible(): Record<string, unknown> {
    return {
        resourceVersion: EXPERIENCIA_RESOURCE_VERSION,
        sesionId: 'sesion-fixture',
        disponible: true
    };
}

export function fixtureEvidenciaVerificada(): Record<string, unknown> {
    return {
        resourceVersion: EXPERIENCIA_RESOURCE_VERSION,
        verificado: true,
        evidenciaId: 'ev-fixture',
        pending_external: null
    };
}

export async function startFixtureExperienciaH(
    options: FixtureExperienciaOptions = {}
): Promise<FixtureExperienciaServer> {
    const requests: FixtureRequest[] = [];
    const omit = new Set(options.omitUris ?? []);

    const defaultPayloads: Record<string, () => Record<string, unknown>> = {
        [URI_EXPERIENCIA_ESTADO]: fixtureEstadoPendingExternal,
        [URI_EXPERIENCIA_ESCENA]: fixtureEscenaNoDisponible,
        [URI_EXPERIENCIA_EVIDENCIA]: fixtureEvidenciaPending
    };

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
            if (req.method !== 'POST') {
                res.statusCode = 405;
                res.end();
                return;
            }
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
                            serverInfo: {
                                name: options.serverName ?? 'fixture-h-experiencia',
                                version: options.serverVersion ?? '0.0.0-fixture'
                            }
                        }
                    });
                    return;
                case 'resources/list': {
                    const all = [
                        {
                            uri: URI_EXPERIENCIA_ESTADO,
                            name: 'estado',
                            mimeType: 'application/json'
                        },
                        {
                            uri: URI_EXPERIENCIA_ESCENA,
                            name: 'escena',
                            mimeType: 'application/json'
                        },
                        {
                            uri: URI_EXPERIENCIA_EVIDENCIA,
                            name: 'evidencia',
                            mimeType: 'application/json'
                        }
                    ];
                    reply({
                        result: {
                            resources: all.filter((r) => !omit.has(r.uri))
                        }
                    });
                    return;
                }
                case 'resources/read': {
                    const uri = rpc.params?.uri;
                    if (uri === undefined || omit.has(uri)) {
                        reply({
                            error: { code: -32002, message: `Resource not found: ${uri}` }
                        });
                        return;
                    }
                    const overrides = options.resourceOverrides ?? {};
                    let payload: unknown;
                    if (uri in overrides) {
                        payload = overrides[uri];
                    } else if (uri in defaultPayloads) {
                        payload = defaultPayloads[uri]();
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
        server.listen(0, '127.0.0.1', () => resolve());
    });
    const address = server.address();
    if (address === null || typeof address !== 'object') {
        throw new Error('fixture experiencia sin dirección');
    }

    return {
        host: '127.0.0.1',
        port: address.port,
        requests,
        close: () =>
            new Promise<void>((resolve) => {
                server.close(() => resolve());
            })
    };
}
