import * as vscode from 'vscode';
import { McpConfigurationManager } from '../core/mcpConfigurationManager';
import { MCPServerManager, MCPServerInfo } from '../mcpServerManager';
import { ProcessManager } from '../processManager';

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
    private processManager: ProcessManager;

    constructor(private mcpServerManager: MCPServerManager) {
        this.configManager = McpConfigurationManager.getInstance();
        this.processManager = ProcessManager.getInstance();
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getMCPServerManager() {
        return this.mcpServerManager;
    }

    getProcessManager() {
        return this.processManager;
    }

    async startMCPServer(serverId: string): Promise<boolean> {
        try {
            const serverConfig = this.configManager.getMcpServers()[serverId];
            if (!serverConfig) {
                vscode.window.showErrorMessage(`Server configuration not found for ${serverId}`);
                return false;
            }

            const success = await this.processManager.startMCPServer(
                serverId,
                serverConfig.port || 8080,
                serverConfig.wdir || process.cwd(),
                serverConfig.cmd || 'node',
                serverConfig.args || ['index.js']
            );

            if (success) {
                vscode.window.showInformationMessage(`MCP Server ${serverId} started successfully`);
                this.refresh(); // Refresh the tree view
            } else {
                vscode.window.showErrorMessage(`Failed to start MCP Server ${serverId}`);
            }

            return success;
        } catch (error) {
            console.error(`Error starting MCP server ${serverId}:`, error);
            vscode.window.showErrorMessage(`Error starting MCP Server ${serverId}: ${error}`);
            return false;
        }
    }

    async stopMCPServer(serverId: string): Promise<boolean> {
        try {
            const success = await this.processManager.stopMCPServer(serverId);

            if (success) {
                vscode.window.showInformationMessage(`MCP Server ${serverId} stopped successfully`);
                this.refresh(); // Refresh the tree view
            } else {
                vscode.window.showErrorMessage(`Failed to stop MCP Server ${serverId}`);
            }

            return success;
        } catch (error) {
            console.error(`Error stopping MCP server ${serverId}:`, error);
            vscode.window.showErrorMessage(`Error stopping MCP Server ${serverId}: ${error}`);
            return false;
        }
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

        // Context value for commands - different for groups vs servers, and based on status
        if (element.children) {
            treeItem.contextValue = 'group';
        } else {
            // Set context based on server status to show appropriate buttons
            treeItem.contextValue = element.status === 'running' ? 'serverRunning' : 'serverStopped';
        }
        
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
                // Get real status from ProcessManager
                const isRunning = this.processManager.isProcessRunning(serverId);
                const processInfo = this.processManager.getProcessInfo(serverId);
                const config = this.configManager.getMcpServer(serverId);
                servers.push({
                    id: serverId,
                    label: this.formatServerName(serverId),
                    description: this.getServerDescription(serverId, config?.desc || '', isRunning),
                    status: isRunning ? 'running' : 'stopped',
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

    private getServerDescription(serverId: string, description: string, isRunning?: boolean): string {
        const descriptions: { [key: string]: string } = {
            'state-machine-server': 'Game state management',
            'wiki-mcp-browser': 'Knowledge browsing',
            'devops-mcp-server': 'System operations',
            'mcp-mesh-sdk': 'Mesh SDK server'
        };
        const baseDescription = description || 'MCP server';
        
        if (isRunning !== undefined) {
            return `${baseDescription}  ${isRunning ? '•' : ''}`;
        }
        
        return baseDescription;
    }
}
