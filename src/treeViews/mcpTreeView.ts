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
        
        // Status-based icons for individual items
        if (!element.children) {
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
        }

        // Context value for commands - different for groups vs individual items
        if (element.children) {
            treeItem.contextValue = 'group';
        } else {
            // For individual items, determine context based on which group they belong to
            const parentId = this.getParentId(element.id);
            
            if (parentId === 'mcp-servers') {
                // Set context based on server status to show appropriate buttons
                treeItem.contextValue = element.status === 'running' ? 'serverRunning' : 'serverStopped';
            } else if (parentId === 'mcp-webs') {
                // Set context for web items to show open button
                treeItem.contextValue = 'web';
                // Override icon for web items
                treeItem.iconPath = new vscode.ThemeIcon('globe', new vscode.ThemeColor('testing.iconPassed'));
            }
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
                },
                {
                    id: 'mcp-webs',
                    label: 'MCP UIs',
                    description: 'Model Context Protocol UIs',
                    status: 'running',
                    children: []
                }
            ]);
        }

        if (element.id === 'mcp-servers') {
            return this.getMCPServers();
        }

        if (element.id === 'mcp-webs') {
            return this.getMCPWebs();
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

    private async getMCPWebs(): Promise<MCPTreeItem[]> {
        try {
            // Ensure configuration manager is initialized
            if (!this.configManager.isConfigLoaded()) {
                await this.configManager.initialize();
            }

            const mcpWebs = this.configManager.getMcpWebs();
            const servers: MCPTreeItem[] = [];

            for (const [webId, webConfig] of Object.entries(mcpWebs)) {
                // Get status from ProcessManager (check if we're tracking this web)
                const isRunning = this.processManager.isMCPWebRunning(webId);
                const webInfo = this.processManager.getMCPWebInfo(webId);
                
                // If not tracked yet, try to track it (assuming it might be running)
                if (!webInfo) {
                    await this.processManager.startMCPWeb(
                        webId, 
                        webConfig.host, 
                        webConfig.port
                    );
                }
                
                servers.push({
                    id: `web-${webId}`, // Prefix to avoid conflicts with server IDs
                    label: this.formatServerName(webId),
                    description: this.getWebDescription(webId, webConfig.desc || '', webConfig.host, webConfig.port),
                    status: isRunning ? 'running' : 'stopped',
                    port: webConfig.port
                });
            }

            return servers;
        } catch (error) {
            console.error('Error loading MCP webs for TreeView:', error);
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
        const baseDescription = description || 'MCP server';
        
        if (isRunning !== undefined) {
            return `${baseDescription}  ${isRunning ? '•' : ''}`;
        }
        
        return baseDescription;
    }

    private getWebDescription(webId: string, description: string, host: string, port: number): string {
        const baseDescription = description || 'MCP web interface';
        const url = `http://${host}:${port}`;
        return `${baseDescription} • ${url}`;
    }

    /**
     * Determine which parent group an item belongs to based on configuration
     */
    private getParentId(itemId: string): string {
        // Check if it has the web prefix
        if (itemId.startsWith('web-')) {
            return 'mcp-webs';
        }
        
        // Check if it's in MCP servers
        const mcpServers = this.configManager.getMcpServers();
        if (mcpServers[itemId]) {
            return 'mcp-servers';
        }
        
        // Check if it's in MCP webs (without prefix)
        const webIdWithoutPrefix = itemId.replace('web-', '');
        const mcpWebs = this.configManager.getMcpWebs();
        if (mcpWebs[webIdWithoutPrefix]) {
            return 'mcp-webs';
        }
        
        // Default to servers if not found
        return 'mcp-servers';
    }
}
