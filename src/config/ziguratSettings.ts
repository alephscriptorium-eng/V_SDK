/**
 * Lectura tipada de settings workspace `aleph0.*`.
 * Defaults vacíos en schema → ⏳ honesto (hostil-omite); sin inventar hosts/puertos.
 *
 * WP-V23 — espacio de nombres ÚNICO: `aleph0` es la única sección de
 * configuración de la extensión. Los segmentos salen del léxico
 * (`plan/LEXICO-ZIGURAT.md` §1): `ciudad` (runtime de Z que V observa),
 * `room` (canal del socket-server), `pieza` (unidad de obra ajena que V
 * consume — C1: «pieza», nunca «servidor/servicio» en superficie).
 * Los identificadores de código NO se renombran (DV-16.a).
 */
import * as vscode from 'vscode';

export const ZIGURAT_PENDING = '⏳';

/** Única sección de configuración de la extensión (WP-V23). */
export const ALEPH0_SECTION = 'aleph0';

/**
 * Sub-clave del fichero heredado que declara las piezas MCP locales.
 * WP-V23 la **fusiona**: antes eran dos claves distintas apuntando al mismo
 * fichero (`mcpSocketManager.configPath` y `alephscript.configurationFile`).
 */
export const MCP_CONFIG_PATH_SUBKEY = 'mcp.configPath';

/** Sub-clave de visibilidad de la barra de estado (superficie de periferia). */
export const STATUSBAR_VISIBLE_SUBKEY = 'superficie.statusBar.visible';

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
    /** Path a JSON `reparto/1` para panel elenco (WP-V09). Vacío = ⏳. */
    repartoPath: string;
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

/** Lee configuración aleph0.* (defaults de schema = vacío). */
export function getZiguratSettings(): ZiguratSettings {
    const cfg = vscode.workspace.getConfiguration(ALEPH0_SECTION);
    return {
        meshHost: readString(cfg.get('ciudad.host')),
        meshPort: readNumber(cfg.get('ciudad.port')),
        meshBaseUrl: readString(cfg.get('ciudad.baseUrl')),
        launcherHost: readString(cfg.get('pieza.launcher.host')),
        launcherPort: readNumber(cfg.get('pieza.launcher.port')),
        ollamaBaseUrl: readString(cfg.get('pieza.ollama.baseUrl')),
        roomId: readString(cfg.get('room.id')),
        lineaEditorHost: readString(cfg.get('pieza.lineaEditor.host')),
        lineaEditorPort: readNumber(cfg.get('pieza.lineaEditor.port')),
        repartoPath: readString(cfg.get('pieza.reparto.path')),
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
