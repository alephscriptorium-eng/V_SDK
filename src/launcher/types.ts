/**
 * Tipos del feed de catálogo dinámico (WP-V06).
 * Contrato remoto: @zeus/mcp-launcher resources launcher://* + tools.
 */

export type CatalogAvailability =
    | 'ready'
    | 'pending_settings'
    | 'pending_launcher'
    | 'error';

/** Entrada de flota tal como la expone launcher://catalog */
export interface CatalogServerEntry {
    id: string;
    name: string;
    port?: number;
    workspace?: string;
    spawnGroup?: string;
    capabilities?: string[];
    tree?: {
        barrio?: string;
        edificio?: string;
        maquinaria?: string;
        [k: string]: unknown;
    } | null;
}

export interface LauncherInfo {
    name?: string;
    version?: string;
    role?: string;
    frontier?: Record<string, string>;
    portTable?: Record<string, number>;
    catalogSize?: number;
    [k: string]: unknown;
}

export interface CapabilitiesListing {
    fromCatalog: string[];
    fromMap: string[];
}

export interface CatalogSnapshot {
    availability: CatalogAvailability;
    /** Mensaje honesto para UI (⏳ / motivo). Nunca inventa flota. */
    statusMessage: string;
    /** Setting key esperada (V05) — documentada aunque aún no exista en schema. */
    expectedSettingKeys: {
        port: string;
        host: string;
    };
    host?: string;
    port?: number;
    info?: LauncherInfo;
    servers: CatalogServerEntry[];
    ports?: Record<string, number>;
    capabilities?: CapabilitiesListing;
    fetchedAt?: string;
    lastError?: string;
}

/** Schema canónico V05 (package.json contributes.configuration). */
export const ZIGURAT_LAUNCHER_PORT_KEY = 'aleph0.pieza.launcher.port';
export const ZIGURAT_LAUNCHER_HOST_KEY = 'aleph0.pieza.launcher.host';

export function emptyPendingSnapshot(
    availability: Exclude<CatalogAvailability, 'ready'>,
    statusMessage: string,
    extras: Partial<CatalogSnapshot> = {}
): CatalogSnapshot {
    return {
        availability,
        statusMessage,
        expectedSettingKeys: {
            port: ZIGURAT_LAUNCHER_PORT_KEY,
            host: ZIGURAT_LAUNCHER_HOST_KEY
        },
        servers: [],
        ...extras
    };
}
