import { getZiguratSettings } from '../config/ziguratSettings';
import {
    ZIGURAT_LAUNCHER_HOST_KEY,
    ZIGURAT_LAUNCHER_PORT_KEY
} from './types';

/**
 * Lectura de settings aleph0.pieza.launcher.* (schema canónico V05).
 *
 * Keys:
 * - aleph0.pieza.launcher.port (number|null, requerido)
 * - aleph0.pieza.launcher.host (string, requerido; vacío = ⏳)
 *
 * Sin inventar host/puerto por defecto.
 */
export interface LauncherEndpointSettings {
    configured: boolean;
    host?: string;
    port?: number;
    reason?: string;
}

export function readLauncherEndpointSettings(): LauncherEndpointSettings {
    const { launcherHost, launcherPort } = getZiguratSettings();

    if (launcherPort === undefined) {
        return {
            configured: false,
            reason: `⏳ setting ausente: ${ZIGURAT_LAUNCHER_PORT_KEY} (sin inventar puerto)`
        };
    }

    if (!launcherHost) {
        return {
            configured: false,
            port: launcherPort,
            reason: `⏳ setting ausente: ${ZIGURAT_LAUNCHER_HOST_KEY} (sin inventar host)`
        };
    }

    return { configured: true, host: launcherHost, port: launcherPort };
}

export function launcherMcpUrl(host: string, port: number): string {
    return `http://${host}:${port}/mcp`;
}
