import * as vscode from 'vscode';
import { TeatroTreeDataProvider, TeatroAgent } from './TeatroTreeDataProvider';

export class TeatroWebViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'alephscript.teatro.webview';

    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly teatroProvider: TeatroTreeDataProvider
    ) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'activateAgent':
                        this.teatroProvider.activateAgent(message.agentId);
                        this._updateWebview();
                        break;
                    case 'deactivateAgent':
                        this.teatroProvider.deactivateAgent(message.agentId);
                        this._updateWebview();
                        break;
                    case 'openChatParticipant':
                        this._openChatParticipant(message.agentId, message.command);
                        break;
                    case 'refresh':
                        this.teatroProvider.refresh();
                        this._updateWebview();
                        break;
                    case 'getStatus':
                        this._updateWebview();
                        break;
                }
            },
            undefined,
            []
        );

        // Initial update
        this._updateWebview();
    }

    private _updateWebview() {
        if (this._view) {
            const status = this.teatroProvider.getAgentsStatus();
            const activeAgents = this.teatroProvider.getActiveAgents();
            
            this._view.webview.postMessage({
                command: 'updateStatus',
                status: status,
                activeAgents: activeAgents
            });
        }
    }

    private async _openChatParticipant(agentId: string, command?: string) {
        try {
            const agent = this.teatroProvider.getAgent(agentId);
            if (!agent) {
                vscode.window.showErrorMessage(`Agente ${agentId} no encontrado`);
                return;
            }

            // Open chat participant
            await vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
            
            // Show information about the agent
            vscode.window.showInformationMessage(
                `🎭 Conectando con ${agent.fullName}`, 
                'Abrir Chat'
            ).then(selection => {
                if (selection === 'Abrir Chat') {
                    vscode.commands.executeCommand('workbench.action.chat.open', {
                        query: `@${agentId} ${command || 'Hola, estoy listo para trabajar contigo'}`
                    });
                }
            });
        } catch (error) {
            vscode.window.showErrorMessage(`Error al abrir chat con ${agentId}: ${error}`);
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        // Get the local path to main script run in the webview
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'teatro.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'teatro.css'));

        // Use a nonce to only allow specific scripts to be run
        const nonce = getNonce();

        return `<!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="${styleUri}" rel="stylesheet">
            <title>🎭 Teatro de Agentes</title>
        </head>
        <body>
            <div class="teatro-container">
                <header class="teatro-header">
                    <h1>🎭 Teatro de Agentes</h1>
                    <p class="teatro-subtitle">Panel de Control del Sistema Teatral</p>
                </header>

                <section class="teatro-status">
                    <h2>📊 Estado del Teatro</h2>
                    <div class="status-grid">
                        <div class="status-card total">
                            <div class="status-icon">🎭</div>
                            <div class="status-info">
                                <span class="status-number" id="totalAgents">5</span>
                                <span class="status-label">Total Agentes</span>
                            </div>
                        </div>
                        <div class="status-card active">
                            <div class="status-icon">🟢</div>
                            <div class="status-info">
                                <span class="status-number" id="activeAgents">4</span>
                                <span class="status-label">Activos</span>
                            </div>
                        </div>
                        <div class="status-card inactive">
                            <div class="status-icon">💤</div>
                            <div class="status-info">
                                <span class="status-number" id="inactiveAgents">1</span>
                                <span class="status-label">Inactivos</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="teatro-agents">
                    <h2>🎪 Agentes del Teatro</h2>
                    <div id="agentsContainer" class="agents-container">
                        <!-- Agents will be populated by JavaScript -->
                    </div>
                </section>

                <section class="teatro-actions">
                    <h2>⚡ Acciones Rápidas</h2>
                    <div class="actions-grid">
                        <button class="action-btn primary" onclick="refreshTeatro()">
                            🔄 Actualizar Teatro
                        </button>
                        <button class="action-btn secondary" onclick="openAllChats()">
                            💬 Abrir Panel de Chat
                        </button>
                        <button class="action-btn tertiary" onclick="showSystemInfo()">
                            ℹ️ Info del Sistema
                        </button>
                    </div>
                </section>
            </div>

            <script nonce="${nonce}" src="${scriptUri}"></script>
        </body>
        </html>`;
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}