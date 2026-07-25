/**
 * WP-V08 · Mutación + autoría (linea-editor, fases 3-4).
 * motivos_deny se leen de editor://info en runtime — la lista del servidor manda.
 */

export const EDITOR_INFO_URI = 'editor://info';
export const TOOL_CREAR_LINEA = 'crear_linea';
export const TOOL_EXPORT_STORY_BOARD = 'export_story_board';
export const LINEA_EDITOR_SERVER_ID = 'linea-editor';
/** Env de política servidor (solo lectura / UI). No se hardcodea el valor. */
export const REQUIRE_REPARTO_ENV_NAME = 'ZEUS_LINEA_EDITOR_REQUIRE_REPARTO';

export type AuthorshipAvailability =
    | 'pending_settings'
    | 'pending_catalog'
    | 'pending_editor'
    | 'pending_info'
    | 'ready';

/** Cara visible del gate publicada por editor://info. */
export interface VisibleGate {
    visible: boolean;
    gateLine: string;
    tokenEnv: string;
    repartoRequired: boolean;
    repartoPolicyEnv: string;
    /** Motivos leídos de editor://info.gate.reparto.motivos_deny (runtime). */
    motivosDeny: string[];
    permiso?: string;
    engagesWhen?: string;
}

export interface AuthorshipSnapshot {
    availability: AuthorshipAvailability;
    statusMessage: string;
    host?: string;
    port?: number;
    mutationTools: string[];
    gate: VisibleGate | null;
    /** true solo si editor://info reportó reparto_required. */
    requireRepartoLive: boolean | null;
    fetchedAt: string;
    lastError?: string;
}

export interface MutationCallResult {
    ok: boolean;
    tool: string;
    /** Gate del payload de error/éxito (servidor); visible en UI. */
    gate: unknown;
    rule?: string;
    error?: string;
    motivo?: string;
    /** true si el servidor denegó antes de efecto (sin lineDir / sin refs de escritura). */
    deniedWithoutWrite: boolean;
    raw: unknown;
}

export function emptyAuthorshipSnapshot(
    availability: AuthorshipAvailability,
    statusMessage: string,
    extras: Partial<AuthorshipSnapshot> = {}
): AuthorshipSnapshot {
    return {
        availability,
        statusMessage,
        mutationTools: extras.mutationTools ?? [],
        gate: extras.gate ?? null,
        requireRepartoLive: extras.requireRepartoLive ?? null,
        fetchedAt: extras.fetchedAt ?? new Date().toISOString(),
        host: extras.host,
        port: extras.port,
        lastError: extras.lastError
    };
}
