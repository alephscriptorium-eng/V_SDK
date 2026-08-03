/**
 * WP-V28 · Cliente MCP mínimo — tipos de resultado honesto.
 *
 * Invariante 1 del carril (plan/PRACTICAS.md §2): sin runtime no hay éxito
 * fingido — toda operación devuelve un resultado tipado; el fallo lleva
 * estado ⏳ (pending) con motivo, nunca una excepción sin capturar ni datos
 * inventados.
 */

/** Códigos tipados de fallo del cliente (lista cerrada; sin catch-all). */
export type McpClientFailureCode =
    /** Ni settings ni env declaran host/puerto → ⏳ (no se inventa endpoint). */
    | 'endpoint_no_configurado'
    /** El transporte HTTP no llegó al servidor (ECONNREFUSED, DNS, etc.). */
    | 'servidor_inaccesible'
    /** El servidor no respondió dentro del plazo del cliente. */
    | 'timeout'
    /** Respuesta HTTP fuera de contrato (status != 2xx o cuerpo no-JSON). */
    | 'respuesta_http_invalida'
    /** El servidor respondió un error JSON-RPC declarado. */
    | 'jsonrpc_error'
    /** El payload llegó pero no tiene la forma citada del contrato. */
    | 'contrato_invalido';

export interface McpClientFailure {
    ok: false;
    /** ⏳ honesto: la Ciudad no está o el dato no llegó; no se disimula. */
    pending: true;
    code: McpClientFailureCode;
    /** Motivo legible para superficie (prefijo ⏳). */
    reason: string;
    /** Detalle técnico subyacente (message / status), si existe. */
    detail?: string;
}

export interface McpClientSuccess<T> {
    ok: true;
    data: T;
}

export type McpClientResult<T> = McpClientSuccess<T> | McpClientFailure;

/** Constructor único del fallo tipado (garantiza pending + ⏳ en el motivo). */
export function mcpFailure(
    code: McpClientFailureCode,
    reason: string,
    detail?: string
): McpClientFailure {
    return {
        ok: false,
        pending: true,
        code,
        reason: reason.startsWith('⏳') ? reason : `⏳ ${reason}`,
        ...(detail !== undefined ? { detail } : {})
    };
}

/** Endpoint resuelto desde configuración (jamás inventado por V). */
export interface McpEndpoint {
    host: string;
    port: number;
}

export type McpEndpointSource = 'settings' | 'env';

export type McpEndpointResolution =
    | ({ configured: true; source: McpEndpointSource } & McpEndpoint)
    | { configured: false; reason: string };

/** Identidad devuelta por `initialize` (MCP). */
export interface McpServerIdentity {
    name?: string;
    version?: string;
    protocolVersion?: string;
}

/** Descriptor de `resources/list` (MCP). */
export interface McpResourceDescriptor {
    uri: string;
    name?: string;
    title?: string;
    mimeType?: string;
    description?: string;
}

/** Descriptor de `tools/list` (MCP) — RH-17 comandos = tools publicados. */
export interface McpToolDescriptor {
    name: string;
    description?: string;
    inputSchema?: Record<string, unknown>;
}
