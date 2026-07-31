/**
 * WP-V28 · Cliente MCP mínimo — Streamable HTTP con fetch nativo.
 *
 * Cero dependencias nuevas: los servidores MCP del producto hablan HTTP
 * JSON-RPC 2.0 sin estado. Contrato citado (z-sdk, READ-ONLY):
 * - Montaje del endpoint: POST sobre `mcpPath = '/mcp'`
 *   (packages/engine/presets-sdk/src/mcp/create-app.mjs:65,107).
 * - Modo stateless: cada POST recibe un transporte efímero con
 *   `sessionIdGenerator: undefined` y `enableJsonResponse: true`
 *   (packages/engine/presets-sdk/src/mcp/stateless-route.mjs:38-41) — la
 *   respuesta es `application/json` plano y no hay sesión que mantener.
 * - GET/DELETE sobre /mcp → 405 (stateless-route.mjs:66-67); solo POST.
 * - El transporte servidor del SDK MCP exige un header `Accept` que incluya
 *   `application/json` y `text/event-stream`; este cliente lo envía siempre.
 *
 * Falla honesto (plan/PRACTICAS.md §2, invariante 1): ningún método lanza;
 * todo camino devuelve `McpClientResult` tipado. Sin runtime → ⏳ con motivo.
 */

import { mcpHttpUrl } from './endpoint';
import {
    mcpFailure,
    McpClientResult,
    McpEndpoint,
    McpResourceDescriptor,
    McpServerIdentity
} from './types';

/**
 * Revisión del protocolo MCP que este cliente declara en `initialize`
 * (constante de protocolo, no un endpoint).
 */
export const MCP_PROTOCOL_VERSION = '2025-03-26';

/** Identidad que el cliente declara en `initialize.clientInfo`. */
export const CLIENT_INFO = Object.freeze({
    name: 'aleph0-cliente-mcp-minimo',
    version: '0.0.0'
});

const DEFAULT_TIMEOUT_MS = 4_000;

interface JsonRpcEnvelope {
    jsonrpc?: string;
    id?: number | string | null;
    result?: unknown;
    error?: { code?: number; message?: string };
}

export interface MinimalMcpClientOptions {
    /** Plazo por petición; superado → fallo tipado 'timeout'. */
    timeoutMs?: number;
    /** Inyección de fetch (tests). Por defecto, fetch nativo. */
    fetchImpl?: typeof fetch;
}

/**
 * Cliente mínimo: conectar (initialize), listar (resources/list) y leer
 * (resources/read). Nada más — las superficies de V consumen esto.
 */
export class MinimalMcpClient {
    private readonly endpoint: McpEndpoint;
    private readonly timeoutMs: number;
    private readonly fetchImpl: typeof fetch;
    private nextId = 1;

    constructor(endpoint: McpEndpoint, options: MinimalMcpClientOptions = {}) {
        this.endpoint = endpoint;
        this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
        // bind: fetch nativo exige `this` global al invocarse desmembrado.
        this.fetchImpl = options.fetchImpl ?? fetch.bind(globalThis);
    }

    /**
     * Conecta: `initialize` contra el endpoint resuelto. En stateless no hay
     * sesión que retener (stateless-route.mjs:3-4); el valor de conectar es
     * verificar el contrato y leer la identidad del servidor.
     */
    async connect(): Promise<McpClientResult<McpServerIdentity>> {
        const res = await this.rpc('initialize', {
            protocolVersion: MCP_PROTOCOL_VERSION,
            capabilities: {},
            clientInfo: CLIENT_INFO
        });
        if (!res.ok) {
            return res;
        }
        const r = asRecord(res.data);
        if (r === null) {
            return mcpFailure(
                'contrato_invalido',
                'initialize sin objeto result (contrato MCP)'
            );
        }
        const serverInfo = asRecord(r.serverInfo);
        return {
            ok: true,
            data: {
                name: typeof serverInfo?.name === 'string' ? serverInfo.name : undefined,
                version:
                    typeof serverInfo?.version === 'string' ? serverInfo.version : undefined,
                protocolVersion:
                    typeof r.protocolVersion === 'string' ? r.protocolVersion : undefined
            }
        };
    }

    /**
     * Lista lo que el servidor expone (`resources/list`). Sin paginación:
     * los servidores del catálogo publican registros pequeños (launcher: 3
     * resources — launcher-server.mjs:20-67).
     */
    async listResources(): Promise<McpClientResult<McpResourceDescriptor[]>> {
        const res = await this.rpc('resources/list', {});
        if (!res.ok) {
            return res;
        }
        const r = asRecord(res.data);
        const resources = r?.resources;
        if (!Array.isArray(resources)) {
            return mcpFailure(
                'contrato_invalido',
                'resources/list sin array `resources` (contrato MCP)'
            );
        }
        const out: McpResourceDescriptor[] = [];
        for (const raw of resources) {
            const e = asRecord(raw);
            if (e === null || typeof e.uri !== 'string') {
                return mcpFailure(
                    'contrato_invalido',
                    'resources/list con entrada sin `uri` string (contrato MCP)'
                );
            }
            out.push({
                uri: e.uri,
                name: typeof e.name === 'string' ? e.name : undefined,
                title: typeof e.title === 'string' ? e.title : undefined,
                mimeType: typeof e.mimeType === 'string' ? e.mimeType : undefined,
                description:
                    typeof e.description === 'string' ? e.description : undefined
            });
        }
        return { ok: true, data: out };
    }

    /**
     * Lee un resource JSON (`resources/read`). Los resources del catálogo
     * declaran `mimeType: 'application/json'` (launcher-server.mjs:44,
     * editor-server.mjs:137) y viajan como `contents[0].text`.
     */
    async readResourceJson(uri: string): Promise<McpClientResult<unknown>> {
        const res = await this.rpc('resources/read', { uri });
        if (!res.ok) {
            return res;
        }
        const r = asRecord(res.data);
        const contents = r?.contents;
        if (!Array.isArray(contents) || contents.length === 0) {
            return mcpFailure(
                'contrato_invalido',
                `resources/read ${uri} sin contents[0] (contrato MCP)`
            );
        }
        const first = asRecord(contents[0]);
        if (first === null || typeof first.text !== 'string') {
            return mcpFailure(
                'contrato_invalido',
                `resources/read ${uri} sin contents[0].text string (contrato MCP)`
            );
        }
        try {
            return { ok: true, data: JSON.parse(first.text) };
        } catch (err) {
            return mcpFailure(
                'contrato_invalido',
                `resources/read ${uri}: contents[0].text no es JSON`,
                message(err)
            );
        }
    }

    /** POST JSON-RPC único. Nunca lanza: todo camino malo → fallo tipado. */
    private async rpc(
        method: string,
        params: Record<string, unknown>
    ): Promise<McpClientResult<unknown>> {
        const url = mcpHttpUrl(this.endpoint);
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs);
        let response: Response;
        try {
            response = await this.fetchImpl(url, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    // Exigido por el transporte servidor del SDK MCP (ambos tipos).
                    accept: 'application/json, text/event-stream'
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: this.nextId++,
                    method,
                    params
                }),
                signal: controller.signal
            });
        } catch (err) {
            if (isAbortError(err)) {
                return mcpFailure(
                    'timeout',
                    `sin respuesta de ${url} en ${this.timeoutMs}ms (${method})`
                );
            }
            return mcpFailure(
                'servidor_inaccesible',
                `servidor MCP inaccesible en ${url} (${method}) — sin runtime no hay catálogo`,
                message(err)
            );
        } finally {
            clearTimeout(timer);
        }

        if (!response.ok) {
            return mcpFailure(
                'respuesta_http_invalida',
                `HTTP ${response.status} de ${url} (${method})`
            );
        }

        let envelope: JsonRpcEnvelope;
        try {
            // enableJsonResponse:true (stateless-route.mjs:40) → JSON plano.
            envelope = (await response.json()) as JsonRpcEnvelope;
        } catch (err) {
            return mcpFailure(
                'respuesta_http_invalida',
                `cuerpo no-JSON de ${url} (${method}; content-type=${response.headers.get('content-type') ?? 'ausente'})`,
                message(err)
            );
        }

        if (envelope.error !== undefined) {
            return mcpFailure(
                'jsonrpc_error',
                `error JSON-RPC de ${url} (${method}): ${envelope.error.message ?? 'sin message'}`,
                envelope.error.code !== undefined ? `code ${envelope.error.code}` : undefined
            );
        }
        return { ok: true, data: envelope.result };
    }
}

function asRecord(v: unknown): Record<string, unknown> | null {
    return v !== null && typeof v === 'object' && !Array.isArray(v)
        ? (v as Record<string, unknown>)
        : null;
}

function message(err: unknown): string {
    return err instanceof Error
        ? `${err.message}${err.cause instanceof Error ? ` · ${err.cause.message}` : ''}`
        : String(err);
}

function isAbortError(err: unknown): boolean {
    // duck-type: en Node el abort de fetch llega como DOMException 'AbortError'
    // (no garantizado instanceof Error en todas las versiones).
    return (
        typeof err === 'object' &&
        err !== null &&
        (err as { name?: unknown }).name === 'AbortError'
    );
}
