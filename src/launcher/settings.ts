import * as vscode from 'vscode';
import {
    ZIGURAT_LAUNCHER_HOST_KEY,
    ZIGURAT_LAUNCHER_PORT_KEY
} from './types';

/**
 * Lectura de settings zigurat.* para el launcher.
 *
 * Keys esperadas (WP-V05 / schema aún puede no estar en main):
 * - zigurat.launcherPort (number, requerido para conectar)
 * - zigurat.launcherHost (string, opcional; si hay puerto y no host → 127.0.0.1)
 *
 * Sin puerto configurado → no se inventa flota ni puerto fijo nuevo.
 */
export interface LauncherEndpointSettings {
    configured: boolean;
    host?: string;
    port?: number;
    reason?: string;
}

export function readLauncherEndpointSettings(): LauncherEndpointSettings {
    const cfg = vscode.workspace.getConfiguration('zigurat');
    const portRaw = cfg.get<unknown>('launcherPort');
    const hostRaw = cfg.get<unknown>('launcherHost');

    const port =
        typeof portRaw === 'number' && Number.isFinite(portRaw) && portRaw > 0
            ? Math.floor(portRaw)
            : typeof portRaw === 'string' && /^\d+$/.test(portRaw.trim())
              ? Number(portRaw.trim())
              : undefined;

    if (port === undefined) {
        return {
            configured: false,
            reason: `⏳ setting ausente: ${ZIGURAT_LAUNCHER_PORT_KEY} (schema V05; sin inventar puerto)`
        };
    }

    const host =
        typeof hostRaw === 'string' && hostRaw.trim().length > 0
            ? hostRaw.trim()
            : '127.0.0.1';

    return { configured: true, host, port };
}

export function launcherMcpUrl(host: string, port: number): string {
    return `http://${host}:${port}/mcp`;
}
