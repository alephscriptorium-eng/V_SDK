import { getZiguratSettings } from '../config/ziguratSettings';
import { CatalogService } from '../launcher/CatalogService';
import { readLauncherEndpointSettings } from '../launcher/settings';
import { LINEA_EDITOR_SERVER_ID } from './types';

export const ZIGURAT_LINEA_EDITOR_HOST_KEY = 'aleph0.pieza.lineaEditor.host';
export const ZIGURAT_LINEA_EDITOR_PORT_KEY = 'aleph0.pieza.lineaEditor.port';

export interface LineaEditorEndpoint {
    configured: boolean;
    host?: string;
    port?: number;
    source?: 'catalog' | 'settings';
    reason?: string;
}

/**
 * Resuelve endpoint de linea-editor:
 * 1) catálogo launcher vivo (id=linea-editor) + host del launcher
 * 2) settings aleph0.pieza.lineaEditor.* (override / sin launcher)
 * Sin inventar puerto 4115.
 */
export function resolveLineaEditorEndpoint(): LineaEditorEndpoint {
    const settings = getZiguratSettings();
    if (settings.lineaEditorHost && settings.lineaEditorPort !== undefined) {
        return {
            configured: true,
            host: settings.lineaEditorHost,
            port: settings.lineaEditorPort,
            source: 'settings'
        };
    }

    const launcher = readLauncherEndpointSettings();
    const catalog = CatalogService.getInstance().getSnapshot();
    if (launcher.configured && launcher.host && catalog.availability === 'ready') {
        const entry = catalog.servers.find((s) => s.id === LINEA_EDITOR_SERVER_ID);
        if (entry && typeof entry.port === 'number') {
            return {
                configured: true,
                host: launcher.host,
                port: entry.port,
                source: 'catalog'
            };
        }
        return {
            configured: false,
            reason: `⏳ ${LINEA_EDITOR_SERVER_ID} no está en catálogo launcher (o sin puerto)`
        };
    }

    if (!settings.lineaEditorHost && settings.lineaEditorPort === undefined) {
        return {
            configured: false,
            reason:
                `⏳ configure ${ZIGURAT_LINEA_EDITOR_HOST_KEY}+${ZIGURAT_LINEA_EDITOR_PORT_KEY}` +
                ` o arranque launcher con ${LINEA_EDITOR_SERVER_ID} en catálogo`
        };
    }

    if (settings.lineaEditorPort === undefined) {
        return {
            configured: false,
            host: settings.lineaEditorHost || undefined,
            reason: `⏳ setting ausente: ${ZIGURAT_LINEA_EDITOR_PORT_KEY}`
        };
    }

    return {
        configured: false,
        port: settings.lineaEditorPort,
        reason: `⏳ setting ausente: ${ZIGURAT_LINEA_EDITOR_HOST_KEY}`
    };
}

export function lineaEditorMcpUrl(host: string, port: number): string {
    return `http://${host}:${port}/mcp`;
}
