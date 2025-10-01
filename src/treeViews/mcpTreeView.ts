import * as vscode from 'vscode';
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

    constructor(private mcpServerManager: MCPServerManager) {}

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
            // Access servers from MCPServerManager (need to make this public or add getter)
            const servers: MCPTreeItem[] = [
                {
                    id: 'state-machine-server',
                    label: 'State Machine Server',
                    description: 'Game state management',
                    status: 'stopped', // Will be updated from actual status
                    port: 3001
                },
                {
                    id: 'wiki-mcp-browser',
                    label: 'Wiki MCP Browser',
                    description: 'Knowledge browsing',
                    status: 'stopped',
                    port: 3002
                },
                {
                    id: 'devops-mcp-server',
                    label: 'DevOps MCP Server',
                    description: 'System operations',
                    status: 'stopped',
                    port: 3003
                }
            ];

            return servers;
        } catch (error) {
            console.error('Error loading MCP servers for TreeView:', error);
            return [];
        }
    }
}
