import * as vscode from 'vscode';
import { BaseHackerPanelProvider } from './BaseHackerPanelProvider';
import { WebViewManager } from '../webViewManager';

export interface WebViewGroup {
    name: string;
    icon: string;
    description: string;
    webviews: WebViewInfo[];
}

export interface WebViewInfo {
    id: string;
    name: string;
    command: string;
    icon: string;
    status: 'available' | 'active' | 'error';
    port?: number;
    description: string;
}

export class HackerControlPanelProvider extends BaseHackerPanelProvider {
    public static readonly viewType = 'alephscript.hackerControlPanel';

    private webViewManager: WebViewManager;

    constructor(
        extensionUri: vscode.Uri,
        context: vscode.ExtensionContext
    ) {
        super(extensionUri, context);
        this.webViewManager = WebViewManager.getInstance();
    }

    public get viewType(): string {
        return HackerControlPanelProvider.viewType;
    }

    protected initializePanel(): void {
        // Initial status update
        setTimeout(() => this._updateStatus(), 1000);
    }

    protected getHtmlContent(webview: vscode.Webview): string {
        const bodyContent = `
            <div class="control-panels" id="controlPanels">
                <div class="loading-message">
                    <span class="blinking-text">>>> INITIALIZING QUANTUM INTERFACES...</span>
                </div>
            </div>
            
            <div class="system-controls">
                <button class="hacker-btn primary" onclick="refreshAll()">
                    🔄 REFRESH_MATRIX
                </button>
                <button class="hacker-btn danger" onclick="reloadAllWebviews()">
                    ⚡ RELOAD_ALL_NEURAL_LINKS
                </button>
            </div>
        `;

        return this.generateBaseHtml(
            webview,
            'hacker-control-panel.js',
            'hacker-control-panel.css',
            'ARRAKIS_THEATER_CONTROL_MATRIX',
            bodyContent
        );
    }

    protected handleMessage(message: any): void {
        switch (message.command) {
            case 'launchWebview':
                this._launchWebview(message.commandId);
                break;
            case 'refreshPanel':
                this._refreshPanel();
                break;
            case 'getStatus':
                this._updateStatus();
                break;
            case 'closeWebview':
                this._closeWebview(message.webviewId);
                break;
            case 'reloadAllWebviews':
                this._reloadAllWebviews();
                break;
        }
    }

    private async _launchWebview(commandId: string): Promise<void> {
        try {
            await vscode.commands.executeCommand(commandId);
            // Update status after launch
            setTimeout(() => this._updateStatus(), 2000);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to launch webview: ${error}`);
        }
    }

    private _closeWebview(webviewId: string): void {
        try {
            this.webViewManager.disposeWebView(webviewId);
            this._updateStatus();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to close webview: ${error}`);
        }
    }

    private async _reloadAllWebviews(): Promise<void> {
        try {
            await vscode.commands.executeCommand('alephscript.webview.reloadAll');
            this._updateStatus();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to reload webviews: ${error}`);
        }
    }

    private _refreshPanel(): void {
        this.refresh();
    }

    private _updateStatus(): void {
        if (this._view) {
            const webviewGroups = this._getWebViewGroups();
            this.postMessage({
                command: 'updateStatus',
                data: webviewGroups
            });
        }
    }

    private _getWebViewGroups(): WebViewGroup[] {
        const activeWebviews = this.webViewManager.getAllWebViews();
        
        return [
            {
                name: "GAMIFICATION INTERFACES",
                icon: "🎮",
                description: "Interactive gaming and visualization UIs",
                webviews: [
                    {
                        id: 'webrtc-ui',
                        name: 'WebRTC Gamify',
                        command: 'alephscript.webview.openWebRTC',
                        icon: '🌐',
                        status: this._getWebViewStatus('webrtc-ui', activeWebviews),
                        port: 4201,
                        description: 'Real-time WebRTC gaming interface'
                    },
                    {
                        id: 'threejs-ui',
                        name: 'ThreeJS Engine',
                        command: 'alephscript.webview.openThreeJS',
                        icon: '🎯',
                        status: this._getWebViewStatus('threejs-ui', activeWebviews),
                        port: 4202,
                        description: '3D visualization and gaming engine'
                    },
                    {
                        id: 'socket-webapp',
                        name: 'Socket Gym',
                        command: 'alephscript.webview.openSocket',
                        icon: '⚡',
                        status: this._getWebViewStatus('socket-webapp', activeWebviews),
                        port: 4200,
                        description: 'Real-time socket communication gym'
                    }
                ]
            },
            {
                name: "SYSTEM INTERFACES",
                icon: "⚙️",
                description: "Core system management and monitoring",
                webviews: [
                    {
                        id: 'driver-ui',
                        name: 'State Driver',
                        command: 'alephscript.webview.openDriver',
                        icon: '🚗',
                        status: this._getWebViewStatus('driver-ui', activeWebviews),
                        description: 'State machine driver interface'
                    },
                    {
                        id: 'webview-dashboard',
                        name: 'Main Dashboard',
                        command: 'alephscript.webview.showDashboard',
                        icon: '📊',
                        status: 'available',
                        description: 'Central webview management dashboard'
                    }
                ]
            },
            {
                name: "NEURAL NETWORKS",
                icon: "🧠",
                description: "AI and socket monitoring systems",
                webviews: [
                    {
                        id: 'socket-monitor',
                        name: 'Socket Monitor',
                        command: 'mcpSocketManager.openSocketMonitor',
                        icon: '🔌',
                        status: 'available',
                        description: 'Real-time socket.io monitoring'
                    },
                    {
                        id: 'mcp-config',
                        name: 'MCP Config',
                        command: 'mcpSocketManager.openConfigEditor',
                        icon: '⚡',
                        status: 'available',
                        description: 'Model Context Protocol configuration'
                    }
                ]
            },
            {
                name: "TEATRO CONTROL",
                icon: "🎭",
                description: "Theatrical AI agent orchestration",
                webviews: [
                    {
                        id: 'teatro-panel',
                        name: 'Teatro Panel',
                        command: 'alephscript.teatro.openTeatroPanel',
                        icon: '🎭',
                        status: 'available',
                        description: 'Theatrical agent control panel'
                    }
                ]
            }
        ];
    }

    private _getWebViewStatus(webviewId: string, activeWebviews: any[]): 'available' | 'active' | 'error' {
        const active = activeWebviews.find(w => w.id === webviewId);
        if (!active) return 'available';
        if (active.status === 'error') return 'error';
        return 'active';
    }
}