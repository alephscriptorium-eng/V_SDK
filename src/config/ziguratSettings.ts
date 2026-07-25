/**
 * Lectura tipada de settings workspace `zigurat.*`.
 * Defaults vacíos en schema → ⏳ honesto (hostil-omite); sin inventar hosts/puertos.
 */
import * as vscode from 'vscode';

export const ZIGURAT_PENDING = '⏳';

export interface ZiguratSettings {
    meshHost: string;
    meshPort: number | undefined;
    meshBaseUrl: string;
    launcherHost: string;
    launcherPort: number | undefined;
    ollamaBaseUrl: string;
    /** Room a la que el IDE hace join (WP-V07). Vacío = ⏳. */
    roomId: string;
    /** Override endpoint linea-editor (WP-V08). Vacío = resolver desde catálogo. */
    lineaEditorHost: string;
    lineaEditorPort: number | undefined;
}

function readNumber(value: unknown): number | undefined {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
        return value;
    }
    if (typeof value === 'string' && value.trim() !== '') {
        const n = Number(value);
        if (Number.isFinite(n) && n > 0) {
            return n;
        }
    }
    return undefined;
}

function readString(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
}

/** Lee configuración zigurat.* (defaults de schema = vacío). */
export function getZiguratSettings(): ZiguratSettings {
    const cfg = vscode.workspace.getConfiguration('zigurat');
    return {
        meshHost: readString(cfg.get('mesh.host')),
        meshPort: readNumber(cfg.get('mesh.port')),
        meshBaseUrl: readString(cfg.get('mesh.baseUrl')),
        launcherHost: readString(cfg.get('launcher.host')),
        launcherPort: readNumber(cfg.get('launcher.port')),
        ollamaBaseUrl: readString(cfg.get('ollama.baseUrl')),
        roomId: readString(cfg.get('room.id')),
        lineaEditorHost: readString(cfg.get('lineaEditor.host')),
        lineaEditorPort: readNumber(cfg.get('lineaEditor.port')),
    };
}

/**
 * URL HTTP del mesh (Socket.IO). Prioridad: baseUrl → host+port.
 * Vacío si no hay settings → caller debe mostrar ⏳.
 */
export function resolveMeshBaseUrl(settings: ZiguratSettings = getZiguratSettings()): string {
    if (settings.meshBaseUrl) {
        return settings.meshBaseUrl.replace(/\/$/, '');
    }
    if (settings.meshHost && settings.meshPort !== undefined) {
        return `http://${settings.meshHost}:${settings.meshPort}`;
    }
    return '';
}

/**
 * URL WebSocket del mesh (monitores / tree views).
 * Vacío si no hay settings.
 */
export function resolveMeshSocketUrl(settings: ZiguratSettings = getZiguratSettings()): string {
    const http = resolveMeshBaseUrl(settings);
    if (!http) {
        return '';
    }
    return http.replace(/^http/i, 'ws');
}

export function resolveLauncherPort(settings: ZiguratSettings = getZiguratSettings()): number | undefined {
    return settings.launcherPort;
}

export function resolveOllamaBaseUrl(settings: ZiguratSettings = getZiguratSettings()): string {
    return settings.ollamaBaseUrl;
}

export function isMeshConfigured(settings: ZiguratSettings = getZiguratSettings()): boolean {
    return resolveMeshBaseUrl(settings) !== '';
}

export function meshPendingLabel(settings: ZiguratSettings = getZiguratSettings()): string {
    return isMeshConfigured(settings) ? resolveMeshBaseUrl(settings) : ZIGURAT_PENDING;
}
