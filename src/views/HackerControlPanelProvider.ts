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
        console.log('HackerControlPanelProvider.initializePanel called');
        // Initial status update
        setTimeout(() => {
            console.log('Calling _updateStatus after 1 second delay');
            this._updateStatus();
        }, 1000);
    }

    protected getHtmlContent(webview: vscode.Webview): string {
        const bodyContent = `
            <div class="control-panels" id="controlPanels">
                <div class="loading-message">
                    <span class="blinking-text">>>> INITIALIZING QUANTUM INTERFACES...</span>
                </div>
            </div>
            
            <div class="system-controls">
                <button class="hacker-btn primary" data-action="refreshAll">
                    🔄 REFRESH_MATRIX
                </button>
                <button class="hacker-btn danger" data-action="reloadAllWebviews">
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
        console.log('HackerControlPanel received message:', message);
        vscode.window.showInformationMessage(`HackerControlPanel received: ${message.command}`);
        
        switch (message.command) {
            case 'launchWebview':
                console.log('Launching webview with commandId:', message.commandId);
                this._launchWebview(message.commandId);
                break;
            case 'refreshPanel':
                console.log('Refreshing panel');
                this._refreshPanel();
                break;
            case 'getStatus':
                console.log('Getting status');
                this._updateStatus();
                break;
            case 'closeWebview':
                console.log('Closing webview:', message.webviewId);
                this._closeWebview(message.webviewId);
                break;
            case 'reloadAllWebviews':
                console.log('Reloading all webviews');
                this._reloadAllWebviews();
                break;
            default:
                console.log('Unknown command:', message.command);
                vscode.window.showWarningMessage(`Unknown command: ${message.command}`);
        }
    }

    private async _launchWebview(commandId: string): Promise<void> {
        try {
            console.log(`Attempting to execute command: ${commandId}`);
            vscode.window.showInformationMessage(`Launching webview with command: ${commandId}`);
            await vscode.commands.executeCommand(commandId);
            console.log(`Successfully executed command: ${commandId}`);
            // Update status after launch
            setTimeout(() => this._updateStatus(), 2000);
        } catch (error) {
            console.error(`Failed to launch webview: ${error}`);
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
        console.log('HackerControlPanelProvider._updateStatus called');
        if (this._view) {
            const webviewGroups = this._getWebViewGroups();
            console.log('Sending webview groups to frontend:', webviewGroups);
            this.postMessage({
                command: 'updateStatus',
                data: webviewGroups
            });
            console.log('Posted updateStatus message to webview');
        } else {
            console.log('No view available, cannot update status');
        }
    }

    private _getWebViewGroups(): WebViewGroup[] {
        const activeWebviews = this.webViewManager.getAllWebViews();
        console.log('Active webviews from WebViewManager:', activeWebviews);
        
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
        console.log(`Status check for ${webviewId}:`, active ? 'found active' : 'not found', active);
        if (!active) return 'available';
        if (active.status === 'error') return 'error';
        return 'active';
    }
}