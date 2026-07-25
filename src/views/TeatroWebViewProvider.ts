import * as vscode from 'vscode';
import { TeatroTreeDataProvider } from './TeatroTreeDataProvider';

export class TeatroWebViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'alephscript.teatro.webview';

    private _view?: vscode.WebviewView;
    private readonly THEME_STORAGE_KEY = 'alephscript.hackerTheme';
    private readonly THEME_MANUAL_KEY = 'alephscript.hackerTheme.manual';

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _extensionContext: vscode.ExtensionContext,
        private readonly teatroProvider: TeatroTreeDataProvider
    ) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(message => {
            switch (message?.command) {
                case 'setTheme': {
                    const t = message.theme as 'matrix' | 'light' | 'dark' | undefined;
                    if (t === 'matrix' || t === 'light' || t === 'dark') {
                        this.setCurrentTheme(t);
                        // Immediately notify the client that the theme was set manually
                        this.postMessage({ command: 'applyTheme', theme: t, mode: 'manual' });
                    }
                    break;
                }
                case 'setThemeAuto': {
                    this.setAutoThemeMode();
                    const t = this.getAutoThemeFromVSCode();
                    this.postMessage({ command: 'applyTheme', theme: t, mode: 'auto' });
                    break;
                }
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
        });

        const themeListener = vscode.window.onDidChangeActiveColorTheme(() => {
            const isManual = this.isManualThemeSelected();
            console.log(`Teatro: VS Code theme changed, manual selection: ${isManual}`);
            if (!isManual) {
                const autoTheme = this.getAutoThemeFromVSCode();
                console.log(`Teatro: Applying auto theme: ${autoTheme}`);
                this.postMessage({ command: 'applyTheme', theme: autoTheme });
            } else {
                console.log(`Teatro: Skipping auto theme change because manual theme is selected`);
            }
        });
        this._extensionContext.subscriptions.push(themeListener);

        this._updateWebview();
    }

    private _updateWebview() {
        if (!this._view) return;
        const status = this.teatroProvider.getAgentsStatus();
        const activeAgents = this.teatroProvider.getActiveAgents();
        this._view.webview.postMessage({
            command: 'updateStatus',
            status,
            activeAgents
        });
    }

    private async _openChatParticipant(agentId: string, command?: string) {
        try {
            const agent = this.teatroProvider.getAgent(agentId);
            if (!agent) {
                vscode.window.showErrorMessage(`Agente ${agentId} no encontrado`);
                return;
            }
            await vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
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
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'teatro.js'));
        const baseStyleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'hacker-base.css'));
        const themesStyleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'hacker-themes.css'));
        const teatroStyleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'teatro.css'));
        const themeScriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'hacker-theme-switcher.js'));

        const nonce = this.getNonce();
        const currentTheme = this.getCurrentTheme();

        return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}' ${webview.cspSource};">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="${baseStyleUri}" rel="stylesheet">
    <link href="${teatroStyleUri}" rel="stylesheet">
    <link href="${themesStyleUri}" rel="stylesheet">
    <title>🎭 Teatro de Agentes</title>
</head>
<body class="theme-${currentTheme}">
    <div class="hacker-terminal">
        <div class="terminal-header">
            <div class="terminal-title">
                <span class="blinking-cursor">█</span> 🎭 Teatro de Agentes
            </div>
            <div class="system-status">
                <span class="status-indicator online"></span> THEATER_SYSTEM_ACTIVE
            </div>
            <div class="header-controls" title="Theme">
                <span class="theme-label">THEME:</span>
                <select id="themeSelector" class="theme-select" aria-label="Select theme">
                    ${this.isManualThemeSelected() ? '' : '<option value="auto" selected>Auto (VS Code)</option>'}
                    ${this.isManualThemeSelected() ? '<option value="auto">Auto (VS Code)</option>' : ''}
                    <option value="matrix" ${this.isManualThemeSelected() && currentTheme === 'matrix' ? 'selected' : ''}>Matrix</option>
                    <option value="light" ${this.isManualThemeSelected() && currentTheme === 'light' ? 'selected' : ''}>Light</option>
                    <option value="dark" ${this.isManualThemeSelected() && currentTheme === 'dark' ? 'selected' : ''}>Dark</option>
                </select>
            </div>
        </div>

        <div class="terminal-body">
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
                    <div id="agentsContainer" class="agents-container"></div>
                </section>

                <section class="teatro-actions">
                    <h2>⚡ Acciones Rápidas</h2>
                    <div class="actions-grid">
                        <button class="action-btn primary" onclick="refreshTeatro()">🔄 Actualizar Teatro</button>
                        <button class="action-btn secondary" onclick="openAllChats()">💬 Abrir Panel de Chat</button>
                        <button class="action-btn tertiary" onclick="showSystemInfo()">ℹ️ Info del Sistema</button>
                    </div>
                </section>
            </div>
        </div>

        <div class="terminal-footer">
            <div class="system-info">
                THEATER_STATE: <span class="status-text">OPERATIONAL</span> |
                ACTIVE_AGENTS: <span id="activeAgentsFooter">0</span>
            </div>
        </div>
    </div>

    <script src="${themeScriptUri}"></script>
    <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
    }

    private postMessage(message: any) {
        this._view?.webview.postMessage(message);
    }

    private getNonce(): string {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    private getCurrentTheme(): 'matrix' | 'light' | 'dark' {
        if (this.isManualThemeSelected()) {
            const saved = this._extensionContext.globalState.get<string>(this.THEME_STORAGE_KEY);
            if (saved === 'light' || saved === 'dark' || saved === 'matrix') return saved;
        }
        return this.getAutoThemeFromVSCode();
    }

    private getAutoThemeFromVSCode(): 'light' | 'dark' {
        const kind = vscode.window.activeColorTheme.kind;
        if (kind === vscode.ColorThemeKind.Light || kind === vscode.ColorThemeKind.HighContrastLight) {
            return 'light';
        }
        return 'dark';
    }

    private setCurrentTheme(theme: 'matrix' | 'light' | 'dark'): void {
        // Mark as manual selection and persist synchronously
        this._extensionContext.globalState.update(this.THEME_MANUAL_KEY, true);
        this._extensionContext.globalState.update(this.THEME_STORAGE_KEY, theme);
        console.log(`Teatro: Theme set manually to: ${theme}, manual flag: ${this.isManualThemeSelected()}`);
    }

    private isManualThemeSelected(): boolean {
        return this._extensionContext.globalState.get<boolean>(this.THEME_MANUAL_KEY) === true;
    }

    private setAutoThemeMode(): void {
        this._extensionContext.globalState.update(this.THEME_MANUAL_KEY, false);
    }
}