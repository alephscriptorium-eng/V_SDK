/**
 * RH-16 · Contrato H→V de proyección experiencia (shapes `0.1.0`).
 *
 * Citas (handoff H, tip `9bfd7ff`): URIs `h-sdk://experiencia/{estado,escena,evidencia}`.
 * Formas propias de H — no reexport de `@zeus/*`, cero import sibling h-sdk.
 */

/** Versión publicada del resource H→V. */
export const EXPERIENCIA_RESOURCE_VERSION = '0.1.0';

export const URI_EXPERIENCIA_ESTADO = 'h-sdk://experiencia/estado' as const;
export const URI_EXPERIENCIA_ESCENA = 'h-sdk://experiencia/escena' as const;
export const URI_EXPERIENCIA_EVIDENCIA = 'h-sdk://experiencia/evidencia' as const;

export const EXPERIENCIA_URIS = [
    URI_EXPERIENCIA_ESTADO,
    URI_EXPERIENCIA_ESCENA,
    URI_EXPERIENCIA_EVIDENCIA
] as const;

export type ExperienciaResourceUri = (typeof EXPERIENCIA_URIS)[number];

/**
 * Fases observables en V (RH-18).
 * Distinción visual obligatoria: connecting · connected ·
 * pending_external_contract · failed · complete.
 * `pending_external_contract` ≠ `connected` / `complete` (hostil-omite).
 */
export type ExperienciaPhase =
    | 'connecting'
    | 'connected'
    | 'pending_external_contract'
    | 'failed'
    | 'complete';

export interface PayloadEstado {
    readonly resourceVersion: string;
    readonly estado: string;
    readonly motivo?: string;
    readonly superficie?: string;
    readonly pending_external: readonly string[];
    readonly acople: {
        readonly ciudad: string;
        readonly delta: string;
        readonly m: string;
    };
}

export interface PayloadEscena {
    readonly resourceVersion: string;
    readonly sesionId: string | null;
    readonly disponible: boolean;
    readonly motivo?: string;
}

export interface PayloadEvidencia {
    readonly resourceVersion: string;
    readonly verificado: boolean;
    readonly evidenciaId: string | null;
    readonly pending_external: string | null;
    readonly motivo?: string;
}

export interface ExperienciaPayloads {
    readonly estado: PayloadEstado;
    readonly escena: PayloadEscena;
    readonly evidencia: PayloadEvidencia;
}

export interface ExperienciaSnapshot {
    readonly phase: ExperienciaPhase;
    /** Motivo legible; prefijo ⏳ cuando no hay éxito de producto. */
    readonly reason: string;
    readonly fetchedAt: string;
    /** true solo si los tres resources se leyeron en este refresh (anti-stale). */
    readonly fresh: boolean;
    readonly serverId?: string;
    readonly serverName?: string;
    readonly serverVersion?: string;
    readonly payloads?: ExperienciaPayloads;
    /** Gaps externos visibles (unión de pending_external de estado/evidencia). */
    readonly pendingExternal: readonly string[];
    readonly transportPending?: boolean;
}

function withPhasePrefix(phase: ExperienciaPhase, reason: string): string {
    if (phase === 'connected' || phase === 'complete') {
        return reason;
    }
    return reason.startsWith('⏳') ? reason : `⏳ ${reason}`;
}

export function emptyExperienciaSnapshot(
    phase: ExperienciaPhase,
    reason: string,
    extras: Partial<ExperienciaSnapshot> = {}
): ExperienciaSnapshot {
    return {
        serverId: extras.serverId,
        serverName: extras.serverName,
        serverVersion: extras.serverVersion,
        payloads: extras.payloads,
        transportPending: extras.transportPending,
        phase,
        reason: withPhasePrefix(phase, reason),
        fetchedAt: extras.fetchedAt ?? new Date().toISOString(),
        fresh: extras.fresh ?? false,
        pendingExternal: extras.pendingExternal ?? []
    };
}
