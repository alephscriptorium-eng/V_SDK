import * as vscode from 'vscode';
import { ProcessManager, ProcessInfo } from './processManager';
import { McpConfigurationManager } from './core/mcpConfigurationManager';
import { MCPConfiguration } from './theatrical/core/interfaces';
import { MCPServersConfig } from './mcpTypes';
import { buildCspMeta, createNonce } from './webview/security';

export interface MCPServerInfo {
    id: string;
    name: string;
    port?: number;
    status: 'running' | 'stopped' | 'error';
    config: any;
}

export class MCPServerManager {
    private servers: Map<string, MCPServerInfo> = new Map();
    private configManager: McpConfigurationManager;

    constructor(private processManager: ProcessManager) {
        this.configManager = McpConfigurationManager.getInstance();
    }

    public async showMCPManager() {
        const panel = vscode.window.createWebviewPanel(
            'mcpServerManager',
            'MCP Server Manager',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                // WP-V66: la página no carga recursos locales.
                localResourceRoots: []
            }
        );

        panel.webview.html = this.getMCPManagerWebview();

        panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'loadServers':
                        await this.loadServersFromConfig();
                        panel.webview.postMessage({
                            command: 'serversLoaded',
                            servers: Array.from(this.servers.values())
                        });
                        break;
                    case 'startServer':
                        await this.startServer(message.serverId);
                        break;
                    case 'stopServer':
                        await this.stopServer(message.serverId);
                        break;
                    case 'showLogs':
                        this.processManager.showProcessLogs(message.serverId);
                        break;
                    case 'testConnection':
                        await this.testConnection(message.serverId);
                        break;
                }
            }
        );

        // Load servers on panel creation
        await this.loadServersFromConfig();
        panel.webview.postMessage({
            command: 'serversLoaded',
            servers: Array.from(this.servers.values())
        });
    }

    private async loadServersFromConfig() {
        try {
            // Ensure configuration manager is initialized
            if (!this.configManager.isConfigLoaded()) {
                await this.configManager.initialize();
            }

            this.servers.clear();
            
            const mcpServers = this.configManager.getMcpServers();
            
            Object.keys(mcpServers).forEach((serverId) => {
                const serverConfig = mcpServers[serverId];
                const server: MCPServerInfo = {
                    id: serverId,
                    name: this.formatServerName(serverId),
                    port: serverConfig.port,
                    status: 'stopped',
                    config: serverConfig
                };
                
                this.servers.set(serverId, server);
                
                // Check if process is already running
                const processInfo = this.processManager.getProcess(serverId);
                if (processInfo && processInfo.status === 'running') {
                    server.status = 'running';
                }
            });
            
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to load MCP servers from config: ${error}`);
        }
    }

    private formatServerName(serverId: string): string {
        return serverId
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    public async startServer(serverId: string) {
        try {
            const server = this.servers.get(serverId);
            if (!server) {
                throw new Error(`Server ${serverId} not found`);
            }

            if (server.status === 'running') {
                vscode.window.showInformationMessage(`MCP Server ${server.name} is already running`);
                return;
            }

            const command = this.configManager.getMcpServer(serverId) || {

            } as MCPServersConfig;

            
            await this.processManager.startMCPServer(
                serverId, 
                server.port || this.configManager.getMcpServerPort(serverId) || 3001,
                command.wdir + "",
                command.cmd + "",
                command.args as string[]
            );
            server.status = 'running';
            
            vscode.window.showInformationMessage(`MCP Server ${server.name} started on port ${server.port}`);

        } catch (error) {
            vscode.window.showErrorMessage(`Failed to start MCP server ${serverId}: ${error}`);
        }
    }

    public async stopServer(serverId: string) {
        try {
            const server = this.servers.get(serverId);
            if (!server) {
                throw new Error(`Server ${serverId} not found`);
            }

            await this.processManager.stopMCPServer(serverId);
            server.status = 'stopped';
            
            vscode.window.showInformationMessage(`MCP Server ${server.name} stopped`);

        } catch (error) {
            vscode.window.showErrorMessage(`Failed to stop MCP server ${serverId}: ${error}`);
        }
    }

    private async testConnection(serverId: string) {
        try {
            const server = this.servers.get(serverId);
            if (!server || !server.port) {
                throw new Error(`Server ${serverId} not found or no port configured`);
            }

            // Simple HTTP health check
            const http = require('http');
            const options = {
                hostname: 'localhost',
                port: server.port,
                path: '/health',
                method: 'GET',
                timeout: 5000
            };

            const req = http.request(options, (res: any) => {
                if (res.statusCode === 200) {
                    vscode.window.showInformationMessage(`MCP Server ${server.name} is responding`);
                } else {
                    vscode.window.showWarningMessage(`MCP Server ${server.name} responded with status ${res.statusCode}`);
                }
            });

            req.on('error', (error: Error) => {
                vscode.window.showErrorMessage(`MCP Server ${server.name} connection failed: ${error.message}`);
            });

            req.on('timeout', () => {
                vscode.window.showErrorMessage(`MCP Server ${server.name} connection timed out`);
                req.destroy();
            });

            req.end();

        } catch (error) {
            vscode.window.showErrorMessage(`Failed to test connection to ${serverId}: ${error}`);
        }
    }

    private getMCPManagerWebview(): string {
        return renderMcpManagerPage();
    }
}

/**
 * WP-V66: página del gestor MCP con CSP del helper único.
 * Exportada como función pura para el test de facto del censo.
 * Cero handlers inline: delegación por `data-action`/`data-server-id`.
 */
export function renderMcpManagerPage(): string {
    const nonce = createNonce();
    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            ${buildCspMeta({ scriptNonce: nonce, styleNonce: nonce })}
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>MCP Server Manager</title>
            <style nonce="${nonce}">
                body {
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                    padding: 20px;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .btn {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 6px 12px;
                    cursor: pointer;
                    border-radius: 4px;
                    margin: 0 3px;
                    font-size: 12px;
                }
                .btn:hover {
                    background: var(--vscode-button-hoverBackground);
                }
                .btn.danger {
                    background: var(--vscode-terminal-ansiRed);
                    color: white;
                }
                .btn.success {
                    background: var(--vscode-terminal-ansiGreen);
                    color: black;
                }
                .server-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                }
                .server-card {
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 8px;
                    padding: 15px;
                    background: var(--vscode-panel-background);
                }
                .server-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }
                .server-title {
                    font-weight: bold;
                    font-size: 16px;
                }
                .server-id {
                    background: var(--vscode-badge-background);
                    color: var(--vscode-badge-foreground);
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-family: monospace;
                }
                .server-status {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .status-running {
                    background: var(--vscode-terminal-ansiGreen);
                    color: black;
                }
                .status-stopped {
                    background: var(--vscode-terminal-ansiYellow);
                    color: black;
                }
                .status-error {
                    background: var(--vscode-terminal-ansiRed);
                    color: white;
                }
                .server-details {
                    font-size: 12px;
                    color: var(--vscode-descriptionForeground);
                    margin-bottom: 15px;
                }
                .server-actions {
                    display: flex;
                    gap: 5px;
                    flex-wrap: wrap;
                }
                .info-section {
                    background: var(--vscode-textCodeBlock-background);
                    padding: 15px;
                    border-radius: 4px;
                    margin-bottom: 20px;
                }
                .info-section h3 {
                    margin-top: 0;
                    color: var(--vscode-textLink-foreground);
                }
                .empty-hint {
                    text-align: center;
                    color: var(--vscode-descriptionForeground);
                    padding: 40px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>MCP Server Manager</h1>
                <button class="btn" data-action="refresh">Refresh</button>
            </div>

            <div class="info-section">
                <h3>MCP (Model Context Protocol) Servers</h3>
                <p>These servers provide different capabilities to your gamification system:</p>
                <ul>
                    <li><strong>State Machine Server:</strong> Manages game state and transitions</li>
                    <li><strong>Wiki MCP Browser:</strong> Provides web browsing and knowledge access</li>
                    <li><strong>DevOps MCP Server:</strong> Handles system operations and deployment</li>
                </ul>
            </div>

            <div id="server-container" class="server-grid">
                <div class="empty-hint">
                    Loading servers...
                </div>
            </div>

            <script nonce="${nonce}">
                const vscode = acquireVsCodeApi();
                let servers = [];

                // WP-V66 (CSP): cero handlers inline — delegación única.
                document.addEventListener('click', event => {
                    const btn = event.target.closest('[data-action]');
                    if (!btn) return;
                    const serverId = btn.getAttribute('data-server-id');
                    switch (btn.getAttribute('data-action')) {
                        case 'refresh': refreshServers(); break;
                        case 'start': startServer(serverId); break;
                        case 'stop': stopServer(serverId); break;
                        case 'test': testConnection(serverId); break;
                        case 'logs': showLogs(serverId); break;
                    }
                });

                function refreshServers() {
                    vscode.postMessage({ command: 'loadServers' });
                }

                function startServer(serverId) {
                    vscode.postMessage({ command: 'startServer', serverId: serverId });
                }

                function stopServer(serverId) {
                    vscode.postMessage({ command: 'stopServer', serverId: serverId });
                }

                function showLogs(serverId) {
                    vscode.postMessage({ command: 'showLogs', serverId: serverId });
                }

                function testConnection(serverId) {
                    vscode.postMessage({ command: 'testConnection', serverId: serverId });
                }

                function renderServers(serverList) {
                    servers = serverList;
                    const container = document.getElementById('server-container');
                    
                    if (servers.length === 0) {
                        container.innerHTML = '<div class="empty-hint">No MCP servers configured. Check your config file.</div>';
                        return;
                    }
                    
                    container.innerHTML = servers.map(server => \`
                        <div class="server-card">
                            <div class="server-header">
                                <div class="server-title">\${server.name}</div>
                                <span class="server-id">\${server.id}</span>
                            </div>
                            
                            <div class="server-status status-\${server.status}">
                                Status: \${server.status.toUpperCase()}
                            </div>
                            
                            <div class="server-details">
                                \${server.port ? \`<div><strong>Port:</strong> \${server.port}</div>\` : ''}
                                <div><strong>Endpoint:</strong> http://localhost:\${server.port || 'N/A'}</div>
                            </div>
                            
                            <div class="server-actions">
                                \${server.status === 'running' ?
                                    \`<button class="btn danger" data-action="stop" data-server-id="\${server.id}">Stop</button>\` :
                                    \`<button class="btn success" data-action="start" data-server-id="\${server.id}">Start</button>\`
                                }
                                <button class="btn" data-action="test" data-server-id="\${server.id}">Test</button>
                                <button class="btn" data-action="logs" data-server-id="\${server.id}">Logs</button>
                            </div>
                        </div>
                    \`).join('');
                }

                // Listen for messages from the extension
                window.addEventListener('message', event => {
                    const message = event.data;
                    switch (message.command) {
                        case 'serversLoaded':
                            renderServers(message.servers);
                            break;
                    }
                });

                // Load servers on startup
                refreshServers();
            </script>
        </body>
        </html>`;
}