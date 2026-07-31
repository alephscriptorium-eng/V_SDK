/**
 * WP-V28 · Resolución de endpoint MCP desde configuración.
 *
 * Cero literales de puerto/URL en este módulo: V consume los NOMBRES que
 * declara el env central de z-sdk y las claves del schema propio; los números
 * son del owner (Z). Si nadie configuró el endpoint → ⏳ honesto, no un
 * default inventado.
 *
 * Contrato citado (z-sdk, READ-ONLY — `C:\S_LAB\z-sdk`):
 * - Puertos por defecto del catálogo en el env central:
 *   `DEFAULT_ZEUS_MCP.lineaEditor.disk` →
 *   packages/engine/presets-sdk/src/env/index.mjs:41;
 *   `DEFAULT_ZEUS_MCP.launcher.disk` → env/index.mjs:43.
 *   V NO copia esos números (invariante «V consume, no inventa»).
 * - Nombres de override por env (`MCP_PORT_ENV`):
 *   `'lineaEditor.disk': 'ZEUS_MCP_LINEA_EDITOR'` → env/index.mjs:59;
 *   `'launcher.disk': 'ZEUS_MCP_LAUNCHER'` → env/index.mjs:61.
 *   El propio launcher se auto-resuelve con esa variable
 *   (packages/mesh/mcp-launcher/src/launcher-server.mjs:14-18).
 * - Host: `resolveZeusHost()` lee `ZEUS_HOST` (env/index.mjs:175-178). El
 *   fallback de host que ahí se declara es decisión del servidor; V no lo
 *   replica: sin host configurado → ⏳.
 * - Semántica de lectura de puerto: `readEnvPort` (env/index.mjs:167-173):
 *   vacío/no-numérico no vale. Aquí, sin fallback propio → no configurado.
 * - Superficie HTTP: `mcpPath = '/mcp'`
 *   (packages/engine/presets-sdk/src/mcp/create-app.mjs:65) y health
 *   `GET /mcp/health` (create-app.mjs:25).
 */

import { getZiguratSettings, ZiguratSettings } from '../config/ziguratSettings';
import type { McpEndpoint, McpEndpointResolution } from './types';

/** Servidores del catálogo con endpoint configurable en el schema propio. */
export type McpCatalogTarget = 'launcher' | 'lineaEditor';

/** Nombre de la variable de host del env central (cita en cabecera). */
export const ZEUS_ENV_HOST = 'ZEUS_HOST';

/** Nombre de la variable de puerto por target (citas en cabecera). */
export const ZEUS_ENV_PORT_BY_TARGET: Record<McpCatalogTarget, string> = {
    launcher: 'ZEUS_MCP_LAUNCHER',
    lineaEditor: 'ZEUS_MCP_LINEA_EDITOR'
};

/** Claves del schema propio (package.json contributes.configuration, V05/V08). */
export const SETTING_KEYS_BY_TARGET: Record<
    McpCatalogTarget,
    { host: string; port: string }
> = {
    launcher: { host: 'aleph0.pieza.launcher.host', port: 'aleph0.pieza.launcher.port' },
    lineaEditor: { host: 'aleph0.pieza.lineaEditor.host', port: 'aleph0.pieza.lineaEditor.port' }
};

/**
 * Ruta del endpoint Streamable HTTP MCP — contrato del servidor
 * (create-app.mjs:65). Es una RUTA del contrato, no un endpoint inventado:
 * host y puerto siguen viniendo de configuración.
 */
export const MCP_HTTP_PATH = '/mcp';

/** Ruta canónica de health (create-app.mjs:25). */
export const MCP_HEALTH_PATH = '/mcp/health';

/** Fuentes inyectables (tests) — por defecto settings del IDE + process.env. */
export interface EndpointSources {
    settings?: Pick<
        ZiguratSettings,
        'launcherHost' | 'launcherPort' | 'lineaEditorHost' | 'lineaEditorPort'
    >;
    env?: Record<string, string | undefined>;
}

/**
 * Puerto desde env con la semántica citada de `readEnvPort`
 * (env/index.mjs:167-173): vacío o no-numérico → sin valor. Sin fallback
 * propio: la ausencia se declara, no se rellena.
 */
function envPort(raw: string | undefined): number | undefined {
    if (raw === undefined || raw === '') {
        return undefined;
    }
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : undefined;
}

/**
 * Resuelve host+puerto para un servidor del catálogo.
 * Prioridad: settings del IDE (aleph0.*) → env central ZEUS_* → ⏳.
 * Nunca lanza; nunca inventa.
 */
export function resolveMcpEndpoint(
    target: McpCatalogTarget,
    sources: EndpointSources = {}
): McpEndpointResolution {
    const settings = sources.settings ?? getZiguratSettings();
    const env = sources.env ?? process.env;
    const keys = SETTING_KEYS_BY_TARGET[target];
    const envPortName = ZEUS_ENV_PORT_BY_TARGET[target];

    const settingHost =
        target === 'launcher' ? settings.launcherHost : settings.lineaEditorHost;
    const settingPort =
        target === 'launcher' ? settings.launcherPort : settings.lineaEditorPort;

    if (settingHost && settingPort !== undefined) {
        return { configured: true, source: 'settings', host: settingHost, port: settingPort };
    }

    const portFromEnv = envPort(env[envPortName]);
    const hostFromEnv =
        typeof env[ZEUS_ENV_HOST] === 'string' && env[ZEUS_ENV_HOST] !== ''
            ? (env[ZEUS_ENV_HOST] as string)
            : undefined;
    // Mezcla declarada: un setting puede aportar la mitad que el env no trae.
    const host = settingHost || hostFromEnv;
    const port = settingPort ?? portFromEnv;

    if (host && port !== undefined) {
        return { configured: true, source: 'env', host, port };
    }

    const faltantes: string[] = [];
    if (!host) {
        faltantes.push(`${keys.host} | ${ZEUS_ENV_HOST}`);
    }
    if (port === undefined) {
        faltantes.push(`${keys.port} | ${envPortName}`);
    }
    return {
        configured: false,
        reason: `⏳ endpoint MCP '${target}' sin configurar — falta: ${faltantes.join(' · ')} (V consume, no inventa)`
    };
}

/** URL del endpoint Streamable HTTP MCP a partir del endpoint resuelto. */
export function mcpHttpUrl(endpoint: McpEndpoint): string {
    return `http://${endpoint.host}:${endpoint.port}${MCP_HTTP_PATH}`;
}

/** URL del health canónico a partir del endpoint resuelto. */
export function mcpHealthUrl(endpoint: McpEndpoint): string {
    return `http://${endpoint.host}:${endpoint.port}${MCP_HEALTH_PATH}`;
}
