import * as vscode from 'vscode';
import { McpConfigurationManager } from '../core/mcpConfigurationManager';
import { MCPServerManager, MCPServerInfo } from '../mcpServerManager';

export interface MCPTreeItem {
    id: string;
    label: string;
    description?: string;
    status: 'running' | 'stopped' | 'error';
    port?: number;
    iconPath?: vscode.ThemeIcon;
    children?: MCPTreeItem[];
}

export class MCPTreeDataProvider implements vscode.TreeDataProvider<MCPTreeItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<MCPTreeItem | undefined | null | void> = new vscode.EventEmitter<MCPTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<MCPTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;
    private configManager: McpConfigurationManager;

    constructor(private mcpServerManager: MCPServerManager) {
        this.configManager = McpConfigurationManager.getInstance();
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getMCPServerManager() {
        return this.mcpServerManager;
    }

    getTreeItem(element: MCPTreeItem): vscode.TreeItem {
        const treeItem = new vscode.TreeItem(element.label, element.children ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);
        
        treeItem.id = element.id;
        treeItem.description = element.description;
        treeItem.tooltip = `${element.label} - ${element.status}${element.port ? ` (port ${element.port})` : ''}`;
        
        // Status-based icons
        switch (element.status) {
            case 'running':
                treeItem.iconPath = new vscode.ThemeIcon('play', new vscode.ThemeColor('testing.iconPassed'));
                break;
            case 'stopped':
                treeItem.iconPath = new vscode.ThemeIcon('stop', new vscode.ThemeColor('testing.iconQueued'));
                break;
            case 'error':
                treeItem.iconPath = new vscode.ThemeIcon('error', new vscode.ThemeColor('testing.iconFailed'));
                break;
        }

        // Context value for commands
        treeItem.contextValue = element.children ? 'group' : 'item';
        
        return treeItem;
    }

    getChildren(element?: MCPTreeItem): Thenable<MCPTreeItem[]> {
        if (!element) {
            // Root level - show MCP Servers group
            return Promise.resolve([
                {
                    id: 'mcp-servers',
                    label: 'MCP Servers',
                    description: 'Model Context Protocol Servers',
                    status: 'running',
                    children: []
                }
            ]);
        }

        if (element.id === 'mcp-servers') {
            return this.getMCPServers();
        }

        return Promise.resolve([]);
    }

    private async getMCPServers(): Promise<MCPTreeItem[]> {
        try {
            // Ensure configuration manager is initialized
            if (!this.configManager.isConfigLoaded()) {
                await this.configManager.initialize();
            }

            const mcpServers = this.configManager.getMcpServers();
            const servers: MCPTreeItem[] = [];

            for (const [serverId, serverConfig] of Object.entries(mcpServers)) {
                servers.push({
                    id: serverId,
                    label: this.formatServerName(serverId),
                    description: this.getServerDescription(serverId),
                    status: 'stopped', // Will be updated from actual status
                    port: serverConfig.port
                });
            }

            return servers;
        } catch (error) {
            console.error('Error loading MCP servers for TreeView:', error);
            return [];
        }
    }

    private formatServerName(serverId: string): string {
        return serverId
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    private getServerDescription(serverId: string): string {
        const descriptions: { [key: string]: string } = {
            'state-machine-server': 'Game state management',
            'wiki-mcp-browser': 'Knowledge browsing',
            'devops-mcp-server': 'System operations',
            'mcp-mesh-sdk': 'Mesh SDK server'
        };
        return descriptions[serverId] || 'MCP server';
    }
}
