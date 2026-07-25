import * as vscode from 'vscode';
import { MCPServerManager } from '../mcpServerManager';
import { ProcessManager } from '../processManager';
import { CatalogService } from '../launcher/CatalogService';
import type { CatalogSnapshot } from '../launcher/types';
import { RoomIdentityService } from '../identity/RoomIdentityService';
import type { IdentitySnapshot } from '../identity/types';
import { ResourceProjectionService } from '../resources/ResourceProjectionService';
import type { ResourceProjectionSnapshot } from '../resources/types';
import { AuthorshipService } from '../mutation/AuthorshipService';
import type { AuthorshipSnapshot } from '../mutation/types';

export interface MCPTreeItem {
    id: string;
    label: string;
    description?: string;
    status: 'running' | 'stopped' | 'error' | 'pending';
    port?: number;
    iconPath?: vscode.ThemeIcon;
    children?: MCPTreeItem[];
}

/**
 * Árbol MCP alimentado por catálogo launcher en caliente (WP-V06).
 * Sin settings / sin launcher → nodos ⏳ (no inventa flota ni puertos fijos).
 */
export class MCPTreeDataProvider implements vscode.TreeDataProvider<MCPTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<MCPTreeItem | undefined | null | void> =
        new vscode.EventEmitter<MCPTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<MCPTreeItem | undefined | null | void> =
        this._onDidChangeTreeData.event;

    private processManager: ProcessManager;
    private catalogService: CatalogService;
    private identityService: RoomIdentityService;
    private resourceService: ResourceProjectionService;
    private authorshipService: AuthorshipService;
    private readonly subs: vscode.Disposable[] = [];

    constructor(private mcpServerManager: MCPServerManager) {
        this.processManager = ProcessManager.getInstance();
        this.catalogService = CatalogService.getInstance();
        this.identityService = RoomIdentityService.getInstance();
        this.resourceService = ResourceProjectionService.getInstance();
        this.authorshipService = AuthorshipService.getInstance();
        this.subs.push(
            this.catalogService.onDidChange(() => this.refresh()),
            this.identityService.onDidChange(() => this.refresh()),
            this.resourceService.onDidChange(() => this.refresh()),
            this.authorshipService.onDidChange(() => this.refresh())
        );
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    dispose(): void {
        for (const s of this.subs) {
            s.dispose();
        }
        this._onDidChangeTreeData.dispose();
    }

    getMCPServerManager() {
        return this.mcpServerManager;
    }

    getProcessManager() {
        return this.processManager;
    }

    /**
     * Arranque de proceso: solo si el id está en el catálogo vivo.
     * Sin catálogo → mensaje ⏳, no inventa puerto.
     */
    async startMCPServer(serverId: string): Promise<boolean> {
        const snap = this.catalogService.getSnapshot();
        if (snap.availability !== 'ready') {
            vscode.window.showWarningMessage(
                `MCP start ⏳: ${snap.statusMessage}. Configure ${snap.expectedSettingKeys.port} y arranque el launcher.`
            );
            return false;
        }
        const entry = snap.servers.find((s) => s.id === serverId);
        if (!entry) {
            vscode.window.showWarningMessage(
                `⏳ servidor "${serverId}" no está en el catálogo launcher (barrio no montado).`
            );
            return false;
        }
        if (entry.port === undefined) {
            vscode.window.showWarningMessage(
                `⏳ catálogo sin puerto para "${serverId}" — no se inventa puerto fijo.`
            );
            return false;
        }

        try {
            const success = await this.processManager.startMCPServer(
                serverId,
                entry.port,
                process.cwd(),
                'node',
                ['index.js']
            );
            if (success) {
                vscode.window.showInformationMessage(`MCP Server ${serverId} started`);
                this.refresh();
            } else {
                vscode.window.showErrorMessage(`Failed to start MCP Server ${serverId}`);
            }
            return success;
        } catch (error) {
            vscode.window.showErrorMessage(`Error starting MCP Server ${serverId}: ${error}`);
            return false;
        }
    }

    async stopMCPServer(serverId: string): Promise<boolean> {
        try {
            const success = await this.processManager.stopMCPServer(serverId);
            if (success) {
                vscode.window.showInformationMessage(`MCP Server ${serverId} stopped`);
                this.refresh();
            } else {
                vscode.window.showErrorMessage(`Failed to stop MCP Server ${serverId}`);
            }
            return success;
        } catch (error) {
            vscode.window.showErrorMessage(`Error stopping MCP Server ${serverId}: ${error}`);
            return false;
        }
    }

    getTreeItem(element: MCPTreeItem): vscode.TreeItem {
        const treeItem = new vscode.TreeItem(
            element.label,
            element.children
                ? vscode.TreeItemCollapsibleState.Collapsed
                : vscode.TreeItemCollapsibleState.None
        );

        treeItem.id = element.id;
        treeItem.description = element.description;
        treeItem.tooltip = `${element.label} - ${element.status}${
            element.port ? ` (port ${element.port})` : ''
        }`;

        if (!element.children) {
            switch (element.status) {
                case 'running':
                    treeItem.iconPath = new vscode.ThemeIcon(
                        'play',
                        new vscode.ThemeColor('testing.iconPassed')
                    );
                    break;
                case 'stopped':
                    treeItem.iconPath = new vscode.ThemeIcon(
                        'stop',
                        new vscode.ThemeColor('testing.iconQueued')
                    );
                    break;
                case 'error':
                    treeItem.iconPath = new vscode.ThemeIcon(
                        'error',
                        new vscode.ThemeColor('testing.iconFailed')
                    );
                    break;
                case 'pending':
                    treeItem.iconPath = new vscode.ThemeIcon(
                        'watch',
                        new vscode.ThemeColor('testing.iconQueued')
                    );
                    break;
            }
        }

        if (element.children) {
            treeItem.contextValue = 'group';
        } else if (element.status === 'pending') {
            treeItem.contextValue = 'catalogPending';
        } else if (element.id.startsWith('cap-')) {
            treeItem.contextValue = 'capability';
        } else {
            treeItem.contextValue =
                element.status === 'running' ? 'serverRunning' : 'serverStopped';
        }

        return treeItem;
    }

    getChildren(element?: MCPTreeItem): Thenable<MCPTreeItem[]> {
        if (!element) {
            return Promise.resolve([
                {
                    id: 'mcp-identity',
                    label: 'Identidad (peer-card)',
                    description: 'ssbId · seat protocol',
                    status: 'running',
                    children: []
                },
                {
                    id: 'mcp-resources',
                    label: 'Resources MCP',
                    description: 'proyección fase 2',
                    status: 'running',
                    children: []
                },
                {
                    id: 'mcp-authorship',
                    label: 'Autoría (linea-editor)',
                    description: 'gate + motivos_deny · editor://info',
                    status: 'running',
                    children: []
                },
                {
                    id: 'mcp-catalog',
                    label: 'Launcher catalog',
                    description: 'Inventario en caliente (@zeus/mcp-launcher)',
                    status: 'running',
                    children: []
                },
                {
                    id: 'mcp-capabilities',
                    label: 'Capabilities',
                    description: 'list_capabilities',
                    status: 'running',
                    children: []
                }
            ]);
        }

        if (element.id === 'mcp-identity') {
            return Promise.resolve(this.identityNodes(this.identityService.getSnapshot()));
        }

        if (element.id === 'mcp-resources') {
            return Promise.resolve(this.resourceNodes(this.resourceService.getSnapshot()));
        }

        if (element.id === 'mcp-authorship') {
            return Promise.resolve(this.authorshipNodes(this.authorshipService.getSnapshot()));
        }

        if (element.id === 'mcp-catalog') {
            return Promise.resolve(this.nodesFromCatalog(this.catalogService.getSnapshot()));
        }

        if (element.id === 'mcp-capabilities') {
            return Promise.resolve(this.capabilityNodes(this.catalogService.getSnapshot()));
        }

        return Promise.resolve([]);
    }

    private identityNodes(snap: IdentitySnapshot): MCPTreeItem[] {
        if (snap.availability !== 'ready' || !snap.ssbId) {
            return [
                {
                    id: 'identity-pending',
                    label: '⏳ Identidad no ready',
                    description: snap.statusMessage,
                    status: 'pending'
                }
            ];
        }
        return [
            {
                id: 'identity-ssbid',
                label: snap.ssbId,
                description: `ssbId · ${snap.phase} · join#${snap.joinCount}`,
                status: 'running'
            },
            {
                id: 'identity-room',
                label: snap.roomId || '(sin room)',
                description: 'roomId',
                status: 'running'
            }
        ];
    }

    /**
     * Gate visible + motivos_deny desde runtime (WP-V08).
     * PROHIBIDO panel elenco / cast / ICompany (V09).
     */
    private authorshipNodes(snap: AuthorshipSnapshot): MCPTreeItem[] {
        if (snap.availability !== 'ready' || !snap.gate) {
            return [
                {
                    id: 'auth-pending',
                    label: '⏳ Autoría no ready',
                    description: snap.statusMessage,
                    status: 'pending'
                }
            ];
        }

        const nodes: MCPTreeItem[] = [
            {
                id: 'auth-gate-line',
                label: snap.gate.gateLine || '(gate_line vacío)',
                description: 'gate_line visible',
                status: 'running'
            },
            {
                id: 'auth-reparto-policy',
                label: snap.gate.repartoRequired
                    ? `${snap.gate.repartoPolicyEnv}=ON`
                    : `${snap.gate.repartoPolicyEnv}=off`,
                description: snap.gate.repartoRequired
                    ? 'reparto_required'
                    : '⏳ flag off — demo verde/rojo pendiente de despliegue',
                status: snap.gate.repartoRequired ? 'running' : 'pending'
            },
            {
                id: 'auth-tools',
                label: snap.mutationTools.join(', ') || 'crear_linea, export_story_board',
                description: 'mutationTools',
                status: 'running'
            }
        ];

        if (snap.gate.motivosDeny.length === 0) {
            nodes.push({
                id: 'auth-motivos-empty',
                label: '⏳ motivos_deny vacíos',
                description: 'sin lista en editor://info',
                status: 'pending'
            });
        } else {
            for (const motivo of snap.gate.motivosDeny) {
                nodes.push({
                    id: `auth-motivo-${motivo}`,
                    label: motivo,
                    description: 'motivos_deny · runtime',
                    status: 'error'
                });
            }
        }

        return nodes;
    }

    private resourceNodes(snap: ResourceProjectionSnapshot): MCPTreeItem[] {
        if (snap.availability !== 'ready') {
            return [
                {
                    id: 'resources-pending',
                    label: '⏳ Resources no proyectados',
                    description: snap.statusMessage,
                    status: 'pending'
                }
            ];
        }
        if (snap.resources.length === 0) {
            return [
                {
                    id: 'resources-empty',
                    label: '⏳ Sin resources',
                    description: snap.statusMessage,
                    status: 'pending'
                }
            ];
        }
        return snap.resources.map((r) => ({
            id: `res-${r.serverId}-${r.uri}`,
            label: r.name,
            description: `${r.uri}${r.serverPort != null ? ` · :${r.serverPort}` : ''}`,
            status: 'running' as const
        }));
    }

    private nodesFromCatalog(snap: CatalogSnapshot): MCPTreeItem[] {
        if (snap.availability !== 'ready') {
            return [
                {
                    id: 'catalog-pending',
                    label: '⏳ Catálogo no disponible',
                    description: snap.statusMessage,
                    status: 'pending'
                }
            ];
        }

        if (snap.servers.length === 0) {
            return [
                {
                    id: 'catalog-empty',
                    label: '⏳ Catálogo vacío',
                    description: 'launcher respondió sin servers[]',
                    status: 'pending'
                }
            ];
        }

        return snap.servers.map((entry) => {
            const barrio = entry.tree?.barrio;
            const isRunning = this.processManager.isProcessRunning(entry.id);
            const barrioNote = barrio ? ` · ${barrio}` : '';
            const portNote =
                entry.port !== undefined ? `:${entry.port}` : ' · ⏳ sin puerto en catálogo';
            return {
                id: entry.id,
                label: entry.name || entry.id,
                description: `${isRunning ? 'running' : 'stopped'}${portNote}${barrioNote}`,
                status: (isRunning ? 'running' : 'stopped') as MCPTreeItem['status'],
                port: entry.port
            };
        });
    }

    private capabilityNodes(snap: CatalogSnapshot): MCPTreeItem[] {
        if (snap.availability !== 'ready') {
            return [
                {
                    id: 'caps-pending',
                    label: '⏳ Capabilities no disponibles',
                    description: snap.statusMessage,
                    status: 'pending'
                }
            ];
        }

        const fromCatalog = snap.capabilities?.fromCatalog ?? [];
        const fromMap = snap.capabilities?.fromMap ?? [];
        const labels = new Set([...fromCatalog, ...fromMap]);
        if (labels.size === 0) {
            return [
                {
                    id: 'caps-empty',
                    label: '⏳ Sin capabilities',
                    description: 'list_capabilities vacío',
                    status: 'pending'
                }
            ];
        }

        return [...labels].sort().map((cap) => ({
            id: `cap-${cap}`,
            label: cap,
            description: fromCatalog.includes(cap) ? 'fromCatalog' : 'fromMap',
            status: 'stopped' as const
        }));
    }
}
