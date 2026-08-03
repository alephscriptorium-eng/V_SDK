/**
 * Contrato mínimo reproducible H→V sin launcher Zeus.
 *
 * Owner H imprime al arrancar `bun run mcp`:
 *   H_SDK_MCP_HOST / H_SDK_MCP_PORT
 *
 * Si ambas están set, V inyecta una fila de catálogo descubrible
 * (id h-sdk · capability h.experiencia). Sin inventar defaults.
 */

import type { CatalogServerEntry } from '../launcher/types';
import { H_EXPERIENCIA_CAPABILITY } from './discover';

export const H_SDK_ENV_HOST = 'H_SDK_MCP_HOST';
export const H_SDK_ENV_PORT = 'H_SDK_MCP_PORT';

export interface HExperienceEnvEndpoint {
    readonly host: string;
    readonly port: number;
    readonly entry: CatalogServerEntry;
}

/**
 * Lee endpoint producto H desde env. Ausencia → undefined (fail-closed).
 */
export function readHExperienceEnv(
    env: NodeJS.ProcessEnv = process.env
): HExperienceEnvEndpoint | undefined {
    const host = typeof env[H_SDK_ENV_HOST] === 'string' ? env[H_SDK_ENV_HOST]!.trim() : '';
    const rawPort = env[H_SDK_ENV_PORT];
    if (!host || rawPort === undefined || rawPort === '') {
        return undefined;
    }
    const port = Number(rawPort);
    if (!Number.isFinite(port) || port <= 0) {
        return undefined;
    }
    return {
        host,
        port,
        entry: {
            id: 'h-sdk',
            name: 'prueba-hm',
            port,
            capabilities: [H_EXPERIENCIA_CAPABILITY],
            workspace: 'packages/app-prueba-hm'
        }
    };
}

/** Fusiona fila env al frente del catálogo (prioridad sobre launcher). */
export function mergeCatalogWithHEnv(
    servers: readonly CatalogServerEntry[],
    env: NodeJS.ProcessEnv = process.env
): {
    servers: CatalogServerEntry[];
    hostOverride?: string;
    fromEnv: boolean;
} {
    const fromEnv = readHExperienceEnv(env);
    if (!fromEnv) {
        return { servers: [...servers], fromEnv: false };
    }
    const rest = servers.filter((s) => s.id !== fromEnv.entry.id);
    return {
        servers: [fromEnv.entry, ...rest],
        hostOverride: fromEnv.host,
        fromEnv: true
    };
}
