import * as vscode from 'vscode';
import { McpConfigurationManager } from './core/mcpConfigurationManager';
import { MCPWebConfig } from './mcpTypes';
import { LoggingManager, LogCategory, createLogger } from './loggingManager';
import { buildCspMeta, createNonce, escapeHtml, isLocalOrigin } from './webview/security';
import { renderInertExternalPage } from './webview/commonPages';

export interface MCPWebViewInfo {
    webId: string;
    url: string;
    panel: vscode.WebviewPanel;
    config: MCPWebConfig;
}

export class MCPWebViewManager {
    private static instance: MCPWebViewManager;
    private activeWebViews: Map<string, MCPWebViewInfo> = new Map();
    private configManager: McpConfigurationManager;
    private readonly logger = createLogger(LogCategory.EXTENSION, 'MCPWebViewManager');

    private constructor() {
        this.configManager = McpConfigurationManager.getInstance();
    }

    static getInstance(): MCPWebViewManager {
        if (!MCPWebViewManager.instance) {
            MCPWebViewManager.instance = new MCPWebViewManager();
        }
        return MCPWebViewManager.instance;
    }

    /**
     * Open or focus an MCP web interface
     */
    async openMCPWeb(webId: string): Promise<boolean> {
        try {
            // Check if already open
            const existingWebView = this.activeWebViews.get(webId);
            if (existingWebView) {
                // Focus existing panel
                existingWebView.panel.reveal();
                this.logger.info(`Focused existing web view for ${webId}`);
                return true;
            }

            // Get web configuration
            const webConfigs = this.configManager.getMcpWebs();
            const webConfig = webConfigs[webId];
            
            if (!webConfig) {
                vscode.window.showErrorMessage(`Web configuration not found for ${webId}`);
                return false;
            }

            // Build URL
            const url = `http://${webConfig.host}:${webConfig.port}`;
            
            // Create webview panel
            const panel = vscode.window.createWebviewPanel(
                `arrakis-mcp-web-${webId}`,
                `🎭 ${this.formatWebName(webId)}`,
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                    localResourceRoots: []
                }
            );

            // Set webview content
            panel.webview.html = this.getWebViewHtml(url, webId, webConfig);

            // Store webview info
            const webViewInfo: MCPWebViewInfo = {
                webId,
                url,
                panel,
                config: webConfig
            };
            this.activeWebViews.set(webId, webViewInfo);

            // Handle panel disposal
            panel.onDidDispose(() => {
                this.activeWebViews.delete(webId);
                this.logger.info(`Web view for ${webId} was disposed`);
            });

            // Handle messages from webview (for potential communication)
            panel.webview.onDidReceiveMessage(
                message => {
                    this.handleWebViewMessage(webId, message);
                },
                undefined
            );

            this.logger.info(`Opened web view for ${webId} at ${url}`);
            return true;

        } catch (error) {
            this.logger.error(`Failed to open MCP web ${webId}:`, error);
            vscode.window.showErrorMessage(`Failed to open MCP web ${webId}: ${error}`);
            return false;
        }
    }

    /**
     * Close an MCP web interface
     */
    closeMCPWeb(webId: string): boolean {
        const webViewInfo = this.activeWebViews.get(webId);
        if (webViewInfo) {
            webViewInfo.panel.dispose();
            this.activeWebViews.delete(webId);
            this.logger.info(`Closed web view for ${webId}`);
            return true;
        }
        return false;
    }

    /**
     * Check if a web view is open
     */
    isWebViewOpen(webId: string): boolean {
        return this.activeWebViews.has(webId);
    }

    /**
     * Get all active web views
     */
    getActiveWebViews(): MCPWebViewInfo[] {
        return Array.from(this.activeWebViews.values());
    }

    /**
     * Close all web views
     */
    closeAllWebViews(): void {
        for (const webViewInfo of this.activeWebViews.values()) {
            webViewInfo.panel.dispose();
        }
        this.activeWebViews.clear();
        this.logger.info('Closed all web views');
    }

    /**
     * Refresh a web view
     */
    refreshWebView(webId: string): boolean {
        const webViewInfo = this.activeWebViews.get(webId);
        if (webViewInfo) {
            // Reload the iframe by updating the HTML
            webViewInfo.panel.webview.html = this.getWebViewHtml(
                webViewInfo.url, 
                webId, 
                webViewInfo.config
            );
            this.logger.info(`Refreshed web view for ${webId}`);
            return true;
        }
        return false;
    }

    /**
     * Generate HTML content for the webview with iframe
     */
    private getWebViewHtml(url: string, webId: string, config: MCPWebConfig): string {
        const webName = this.formatWebName(webId);
        return renderMcpWebViewPage(url, webName);
    }

    /**
     * Format web ID to display name
     */
    private formatWebName(webId: string): string {
        return webId
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Handle messages from webview
     */
    private handleWebViewMessage(webId: string, message: any): void {
        switch (message.command) {
            case 'openInBrowser':
                vscode.env.openExternal(vscode.Uri.parse(message.url));
                break;
            case 'refresh':
                this.refreshWebView(webId);
                break;
            default:
                this.logger.debug(`Unknown message from web view ${webId}:`, message);
        }
    }

    /**
     * Dispose all resources
     */
    dispose(): void {
        this.closeAllWebViews();
    }
}


/**
 * WP-V66: página contenedora de un web MCP con CSP del helper único.
 * Exportada como función pura para el test de facto del censo.
 * Cerco v2: solo se embebe un peer LOCAL; un URL externo degrada a
 * página inerte (la referencia se muestra como texto, sin iframe).
 */
export function renderMcpWebViewPage(url: string, webName: string): string {
    if (!isLocalOrigin(url)) {
        return renderInertExternalPage(url, `🎭 ${webName}`);
    }
    const nonce = createNonce();
    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            ${buildCspMeta({ scriptNonce: nonce, styleNonce: nonce, frameOrigins: [url] })}
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>🎭 ${escapeHtml(webName)}</title>
            <style nonce="${nonce}">
                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                }
                
                .header {
                    background-color: var(--vscode-panel-background);
                    border-bottom: 1px solid var(--vscode-panel-border);
                    padding: 8px 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    min-height: 30px;
                }
                
                .header-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .status-indicator {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background-color: var(--vscode-testing-iconPassed);
                }
                
                .web-title {
                    font-weight: 600;
                    color: var(--vscode-editor-foreground);
                }
                
                .web-url {
                    font-size: 11px;
                    color: var(--vscode-descriptionForeground);
                    font-family: monospace;
                }
                
                .controls {
                    display: flex;
                    gap: 8px;
                }
                
                .control-btn {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 4px 8px;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 11px;
                }
                
                .control-btn:hover {
                    background: var(--vscode-button-hoverBackground);
                }
                
                .iframe-container {
                    flex: 1;
                    position: relative;
                    overflow: hidden;
                }
                
                .loading-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: var(--vscode-editor-background);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
                }
                
                .loading-spinner {
                    width: 24px;
                    height: 24px;
                    border: 2px solid var(--vscode-progressBar-background);
                    border-top: 2px solid var(--vscode-progressBar-foreground);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .web-iframe {
                    width: 100%;
                    height: 100%;
                    border: none;
                    background-color: white;
                }
                
                .error-message {
                    padding: 20px;
                    text-align: center;
                    color: var(--vscode-errorForeground);
                    background-color: var(--vscode-inputValidation-errorBackground);
                    border: 1px solid var(--vscode-inputValidation-errorBorder);
                    margin: 20px;
                    border-radius: 4px;
                }
                
                /* Hacker theme styling */
                .hacker-mode {
                    background: linear-gradient(135deg, #000a00 0%, #001100 100%);
                    color: #00ff00;
                }
                
                .hacker-mode .header {
                    background: rgba(0, 255, 0, 0.1);
                    border-bottom: 1px solid #00aa00;
                }
                
                .hacker-mode .status-indicator {
                    background: #00ff00;
                    box-shadow: 0 0 8px #00ff00;
                }
            </style>
        </head>
        <body class="hacker-mode">
            <div class="header">
                <div class="header-info">
                    <div class="status-indicator"></div>
                    <div class="web-title">🎭 ${escapeHtml(webName)}</div>
                    <div class="web-url">${escapeHtml(url)}</div>
                </div>
                <div class="controls">
                    <button class="control-btn" data-action="refresh">↻ Refresh</button>
                    <button class="control-btn" data-action="openInBrowser">🌐 Browser</button>
                </div>
            </div>

            <div class="iframe-container">
                <div class="loading-overlay" id="loadingOverlay">
                    <div class="loading-spinner"></div>
                </div>
                <iframe
                    class="web-iframe"
                    id="webIframe"
                    src="${escapeHtml(url)}">
                </iframe>
            </div>

            <script nonce="${nonce}">
                const vscode = acquireVsCodeApi();
                const targetUrl = ${JSON.stringify(url)};

                function hideLoading() {
                    document.getElementById('loadingOverlay').style.display = 'none';
                }

                function showError() {
                    const overlay = document.getElementById('loadingOverlay');
                    overlay.textContent = '';
                    const box = document.createElement('div');
                    box.className = 'error-message';
                    box.textContent = 'Failed to load ' + targetUrl + ' — make sure the MCP server is running';
                    overlay.appendChild(box);
                }

                function refreshIframe() {
                    document.getElementById('loadingOverlay').style.display = 'flex';
                    document.getElementById('webIframe').src = targetUrl;
                }

                function openInBrowser() {
                    vscode.postMessage({
                        command: 'openInBrowser',
                        url: targetUrl
                    });
                }

                // WP-V66 (CSP): cero handlers inline — listeners y delegación.
                const iframeEl = document.getElementById('webIframe');
                iframeEl.addEventListener('load', hideLoading);
                iframeEl.addEventListener('error', showError);
                document.addEventListener('click', event => {
                    const btn = event.target.closest('[data-action]');
                    if (!btn) return;
                    switch (btn.getAttribute('data-action')) {
                        case 'refresh': refreshIframe(); break;
                        case 'openInBrowser': openInBrowser(); break;
                    }
                });

                // Auto-refresh on VS Code theme change
                window.addEventListener('message', event => {
                    const message = event.data;
                    if (message.command === 'refresh') {
                        refreshIframe();
                    }
                });
            </script>
        </body>
        </html>`;
}
