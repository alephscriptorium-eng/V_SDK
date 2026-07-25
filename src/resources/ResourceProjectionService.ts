import * as vscode from 'vscode';
import { CatalogService } from '../launcher/CatalogService';
import { RoomIdentityService } from '../identity/RoomIdentityService';
import { readLauncherEndpointSettings } from '../launcher/settings';
import { McpResourceClient } from './McpResourceClient';
import {
    emptyResourceSnapshot,
    type ProjectedMcpResource,
    type ResourceProjectionSnapshot
} from './types';

/**
 * Proyecta resources MCP (fase 2) en estado consumible por UI.
 * Requiere identidad ready + catálogo con puertos; si falta → ⏳.
 */
export class ResourceProjectionService implements vscode.Disposable {
    private static instance: ResourceProjectionService | undefined;

    private readonly client = new McpResourceClient();
    private readonly _onDidChange = new vscode.EventEmitter<ResourceProjectionSnapshot>();
    readonly onDidChange = this._onDidChange.event;

    private snapshot: ResourceProjectionSnapshot = emptyResourceSnapshot(
        'pending_settings',
        '⏳ resources no proyectados aún'
    );
    private refreshInFlight: Promise<ResourceProjectionSnapshot> | undefined;

    static getInstance(): ResourceProjectionService {
        if (!ResourceProjectionService.instance) {
            ResourceProjectionService.instance = new ResourceProjectionService();
        }
        return ResourceProjectionService.instance;
    }

    static resetInstanceForTests(): void {
        ResourceProjectionService.instance?.dispose();
        ResourceProjectionService.instance = undefined;
    }

    getSnapshot(): ResourceProjectionSnapshot {
        return this.snapshot;
    }

    async refresh(): Promise<ResourceProjectionSnapshot> {
        if (this.refreshInFlight) {
            return this.refreshInFlight;
        }
        this.refreshInFlight = this.doRefresh().finally(() => {
            this.refreshInFlight = undefined;
        });
        return this.refreshInFlight;
    }

    dispose(): void {
        this._onDidChange.dispose();
    }

    private async doRefresh(): Promise<ResourceProjectionSnapshot> {
        const identity = RoomIdentityService.getInstance().getSnapshot();
        if (identity.availability !== 'ready') {
            return this.publish(
                emptyResourceSnapshot(
                    'pending_identity',
                    `⏳ resources: identidad no ready (${identity.statusMessage})`
                )
            );
        }

        const launcher = readLauncherEndpointSettings();
        if (!launcher.configured || !launcher.host || launcher.port === undefined) {
            return this.publish(
                emptyResourceSnapshot(
                    'pending_settings',
                    launcher.reason || '⏳ zigurat.launcher.* no configurado'
                )
            );
        }

        const catalog = CatalogService.getInstance().getSnapshot();
        if (catalog.availability !== 'ready') {
            return this.publish(
                emptyResourceSnapshot('pending_launcher', catalog.statusMessage)
            );
        }

        // Resources del launcher (fase 0/2) siempre proyectados si catálogo ready.
        const collected: ProjectedMcpResource[] = [
            {
                uri: 'launcher://info',
                name: 'info',
                description: 'launcher info',
                serverId: 'mcp-launcher',
                serverPort: launcher.port
            },
            {
                uri: 'launcher://catalog',
                name: 'catalog',
                description: 'launcher catalog',
                serverId: 'mcp-launcher',
                serverPort: launcher.port
            },
            {
                uri: 'launcher://ports',
                name: 'ports',
                description: 'launcher ports',
                serverId: 'mcp-launcher',
                serverPort: launcher.port
            }
        ];

        const targets = catalog.servers.filter((s) => typeof s.port === 'number');
        const errors: string[] = [];
        // Fan-out acotado a servidores con puerto en catálogo.
        for (const entry of targets.slice(0, 5)) {
            const result = await this.client.listFromServer({
                serverId: entry.id,
                host: launcher.host,
                port: entry.port as number
            });
            collected.push(...result.resources);
            if (result.error) {
                errors.push(`${entry.id}: ${result.error}`);
            }
        }

        const note = errors.length ? ` · ${errors.length} server(s) sin listResources` : '';
        return this.publish({
            availability: 'ready',
            statusMessage: `${collected.length} resource(s) proyectado(s)${note}`,
            resources: collected,
            fetchedAt: new Date().toISOString()
        });
    }

    private publish(next: ResourceProjectionSnapshot): ResourceProjectionSnapshot {
        this.snapshot = next;
        this._onDidChange.fire(next);
        return next;
    }
}
