/**
 * RH-16 · Descubrimiento del servidor H en el catálogo launcher.
 * Sin inventar endpoint: si no hay fila → pending / transport `<pendiente>`.
 */

import type { CatalogServerEntry } from '../launcher/types';

/** Ids/nombres/capabilities que identifican la proyección experiencia H. */
export const H_EXPERIENCIA_SERVER_IDS = Object.freeze([
    'h-sdk',
    'prueba-hm',
    'app-prueba-hm',
    'experiencia-h'
] as const);

export const H_EXPERIENCIA_CAPABILITY = 'h.experiencia';

/**
 * Localiza la entrada de catálogo del servidor H.
 * Criterio (en orden): id conocido · id/name contiene `h-sdk` · capability.
 */
export function discoverHExperienceServer(
    servers: readonly CatalogServerEntry[]
): CatalogServerEntry | undefined {
    for (const s of servers) {
        if ((H_EXPERIENCIA_SERVER_IDS as readonly string[]).includes(s.id)) {
            return s;
        }
    }
    for (const s of servers) {
        const name = s.name ?? '';
        if (s.id.includes('h-sdk') || name.includes('h-sdk')) {
            return s;
        }
    }
    for (const s of servers) {
        if (s.capabilities?.includes(H_EXPERIENCIA_CAPABILITY)) {
            return s;
        }
    }
    return undefined;
}

export function serverHasPort(
    entry: CatalogServerEntry
): entry is CatalogServerEntry & { port: number } {
    return typeof entry.port === 'number' && Number.isFinite(entry.port);
}
