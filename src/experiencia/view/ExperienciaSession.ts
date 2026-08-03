/**
 * RH-17 · Sesión UI de experiencia H: refresh desde catálogo + tools MCP.
 * No importa sibling H; no finge connected/complete sin resources fresh.
 */

import * as vscode from 'vscode';
import { CatalogService } from '../../launcher/CatalogService';
import { readLauncherEndpointSettings } from '../../launcher/settings';
import { MinimalMcpClient } from '../../mcp/client';
import type { McpEndpoint, McpToolDescriptor } from '../../mcp/types';
import { discoverHExperienceServer, serverHasPort } from '../discover';
import { ExperienciaHService } from '../ExperienciaHService';
import {
    emptyExperienciaSnapshot,
    type ExperienciaSnapshot
} from '../types';

export class ExperienciaSession implements vscode.Disposable {
    private static instance: ExperienciaSession | undefined;

    private readonly service = new ExperienciaHService();
    private readonly _onDidChange = new vscode.EventEmitter<ExperienciaSnapshot>();
    readonly onDidChange = this._onDidChange.event;

    private tools: readonly McpToolDescriptor[] = [];
    private lastToolResult: string | undefined;
    private refreshInFlight: Promise<ExperienciaSnapshot> | undefined;

    static getInstance(): ExperienciaSession {
        if (!ExperienciaSession.instance) {
            ExperienciaSession.instance = new ExperienciaSession();
        }
        return ExperienciaSession.instance;
    }

    static resetInstanceForTests(): void {
        ExperienciaSession.instance?.dispose();
        ExperienciaSession.instance = undefined;
    }

    getSnapshot(): ExperienciaSnapshot {
        return this.service.getSnapshot();
    }

    getTools(): readonly McpToolDescriptor[] {
        return this.tools;
    }

    getLastToolResult(): string | undefined {
        return this.lastToolResult;
    }

    async refresh(): Promise<ExperienciaSnapshot> {
        if (this.refreshInFlight) {
            return this.refreshInFlight;
        }
        this.refreshInFlight = this.doRefresh().finally(() => {
            this.refreshInFlight = undefined;
        });
        return this.refreshInFlight;
    }

    /**
     * Invoca un tool MCP publicado por el server H descubierto.
     * Sin server/puerto → ⏳; no inventa resultado de producto.
     */
    async callPublishedTool(
        name: string,
        args: Record<string, unknown> = {}
    ): Promise<{ ok: boolean; message: string }> {
        const endpoint = this.resolveHEndpoint();
        if (!endpoint.ok) {
            this.lastToolResult = endpoint.message;
            this._onDidChange.fire(this.getSnapshot());
            return { ok: false, message: endpoint.message };
        }
        const client = new MinimalMcpClient(endpoint.endpoint);
        const identity = await client.connect();
        if (!identity.ok) {
            const message = `⏳ tools/call: connect falló — ${identity.reason}`;
            this.lastToolResult = message;
            this._onDidChange.fire(this.getSnapshot());
            return { ok: false, message };
        }
        const listed = await client.listTools();
        if (!listed.ok) {
            const message = `⏳ tools/list: ${listed.reason}`;
            this.lastToolResult = message;
            this._onDidChange.fire(this.getSnapshot());
            return { ok: false, message };
        }
        this.tools = listed.data;
        if (!listed.data.some((t) => t.name === name)) {
            const message = `⏳ tool '${name}' no está publicado en el server H`;
            this.lastToolResult = message;
            this._onDidChange.fire(this.getSnapshot());
            return { ok: false, message };
        }
        const called = await client.callTool(name, args);
        if (!called.ok) {
            const message = `⏳ tools/call ${name}: ${called.reason}`;
            this.lastToolResult = message;
            this._onDidChange.fire(this.getSnapshot());
            return { ok: false, message };
        }
        const message = `tool ${name} ok`;
        this.lastToolResult = message;
        await this.refresh();
        return { ok: true, message };
    }

    dispose(): void {
        this._onDidChange.dispose();
    }

    private async doRefresh(): Promise<ExperienciaSnapshot> {
        const catalog = CatalogService.getInstance().getSnapshot();
        const settings = readLauncherEndpointSettings();
        const host =
            (catalog.host && catalog.host.trim() !== ''
                ? catalog.host
                : undefined) ??
            settings.host ??
            '';

        const snap = await this.service.refresh({
            catalogServers: catalog.servers,
            host
        });

        this.tools = [];
        const endpoint = this.resolveHEndpoint();
        if (endpoint.ok && !snap.transportPending && snap.phase !== 'error') {
            const client = new MinimalMcpClient(endpoint.endpoint);
            const listed = await client.listTools();
            if (listed.ok) {
                this.tools = listed.data;
            }
        }

        this._onDidChange.fire(snap);
        return snap;
    }

    private resolveHEndpoint():
        | { ok: true; endpoint: McpEndpoint }
        | { ok: false; message: string } {
        const catalog = CatalogService.getInstance().getSnapshot();
        const settings = readLauncherEndpointSettings();
        const host =
            (catalog.host && catalog.host.trim() !== ''
                ? catalog.host
                : undefined) ??
            settings.host ??
            '';
        if (!host) {
            return {
                ok: false,
                message:
                    '⏳ host launcher vacío — no se inventa endpoint H para tools'
            };
        }
        const entry = discoverHExperienceServer(catalog.servers);
        if (!entry || !serverHasPort(entry)) {
            return {
                ok: false,
                message:
                    '⏳ server H sin puerto en catálogo — transport MCP producto <pendiente>'
            };
        }
        return { ok: true, endpoint: { host, port: entry.port as number } };
    }
}

/** Snapshot inicial honesto para tests/UI antes del primer refresh. */
export function initialExperienciaSnapshot(): ExperienciaSnapshot {
    return emptyExperienciaSnapshot(
        'pending',
        'experiencia H no refrescada aún',
        { transportPending: true, fresh: false }
    );
}
