import * as vscode from 'vscode';

/**
 * Base class for Hacker-themed WebView panels with common functionality
 */
export abstract class BaseHackerPanelProvider implements vscode.WebviewViewProvider {
    protected _view?: vscode.WebviewView;
    protected matrixInterval?: NodeJS.Timeout;
    protected timeInterval?: NodeJS.Timeout;
    protected readonly THEME_STORAGE_KEY = 'alephscript.hackerTheme';
    protected readonly THEME_MANUAL_KEY = 'alephscript.hackerTheme.manual';

    constructor(
        protected readonly _extensionUri: vscode.Uri,
        protected readonly context: vscode.ExtensionContext
    ) {}

    public abstract get viewType(): string;
    protected abstract getHtmlContent(webview: vscode.Webview): string;
    protected abstract handleMessage(message: any): void;

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

        webviewView.webview.html = this.getHtmlContent(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(message => {
            if (message?.command === 'setTheme' && typeof message.theme === 'string') {
                const theme = message.theme as 'matrix' | 'light' | 'dark';
                this.setCurrentTheme(theme);
                // Immediately notify the client that the theme was set manually
                this.postMessage({ command: 'applyTheme', theme: theme, mode: 'manual' });
                return;
            }
            if (message?.command === 'setThemeAuto') {
                this.setAutoThemeMode();
                // Immediately apply the current VS Code mapped theme
                const t = this.getAutoThemeFromVSCode();
                this.postMessage({ command: 'applyTheme', theme: t, mode: 'auto' });
                return;
            }
            this.handleMessage(message);
        });

        // Initialize panel
        this.initializePanel();

        // Auto-sync VS Code theme if user hasn't manually selected a theme
        const themeListener = vscode.window.onDidChangeActiveColorTheme(() => {
            const isManual = this.isManualThemeSelected();
            console.log(`VS Code theme changed, manual selection: ${isManual}`);
            if (!isManual) {
                const autoTheme = this.getAutoThemeFromVSCode();
                console.log(`Applying auto theme: ${autoTheme}`);
                this.postMessage({ command: 'applyTheme', theme: autoTheme });
            } else {
                console.log(`Skipping auto theme change because manual theme is selected`);
            }
        });
        this.context.subscriptions.push(themeListener);
    }

    protected initializePanel(): void {
        // Override in subclasses for specific initialization
    }

    protected generateBaseHtml(
        webview: vscode.Webview,
        scriptFileName: string,
        styleFileName: string,
        title: string,
        bodyContent: string
    ): string {
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', scriptFileName));
    const themeScriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'hacker-theme-switcher.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', styleFileName));
    const baseStyleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'hacker-base.css'));
    const themesStyleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'hacker-themes.css'));

        const nonce = this.getNonce();
        const currentTheme = this.getCurrentTheme();

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}' ${webview.cspSource};">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="${baseStyleUri}" rel="stylesheet">
            <link href="${styleUri}" rel="stylesheet">
            <link href="${themesStyleUri}" rel="stylesheet">
            <title>${title}</title>
        </head>
        <body class="theme-${currentTheme}">
            <div class="hacker-terminal">
                <div class="terminal-header">
                    <div class="terminal-title">
                        <span class="blinking-cursor">█</span> ${title}
                    </div>
                    <div class="system-status">
                        <span class="status-indicator online"></span> NEURAL_LINK_ACTIVE
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
                    ${bodyContent}
                </div>
                
                <div class="terminal-footer">
                    <div class="system-info">
                        QUANTUM_STATE: <span class="status-text">OPERATIONAL</span> | 
                        ACTIVE_PROCESSES: <span id="processCount">0</span> | 
                        MATRIX_TIME: <span id="matrixTime"></span>
                    </div>
                </div>
            </div>
            <script src="${themeScriptUri}"></script>
            <script nonce="${nonce}" src="${scriptUri}"></script>
        </body>
        </html>`;
    }

    protected postMessage(message: any): void {
        if (this._view) {
            console.log('BaseHackerPanelProvider.postMessage sending:', message);
            this._view.webview.postMessage(message);
        } else {
            console.log('BaseHackerPanelProvider.postMessage: No view available');
        }
    }

    protected getNonce(): string {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    public refresh(): void {
        if (this._view) {
            this._view.webview.html = this.getHtmlContent(this._view.webview);
        }
    }

    public dispose(): void {
        if (this.matrixInterval) {
            clearInterval(this.matrixInterval);
        }
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
        }
    }

    protected getCurrentTheme(): 'matrix' | 'light' | 'dark' {
        const manual = this.isManualThemeSelected();
        if (manual) {
            const saved = this.context.globalState.get<string>(this.THEME_STORAGE_KEY);
            if (saved === 'light' || saved === 'dark' || saved === 'matrix') return saved;
        }
        // Auto mode: map VS Code theme to our light/dark; default to dark
        return this.getAutoThemeFromVSCode();
    }

    protected getAutoThemeFromVSCode(): 'light' | 'dark' {
        const kind = vscode.window.activeColorTheme.kind;
        // Map Light themes to 'light', everything else to 'dark'
        if (kind === vscode.ColorThemeKind.Light || kind === vscode.ColorThemeKind.HighContrastLight) {
            return 'light';
        }
        return 'dark';
    }

    protected setCurrentTheme(theme: 'matrix' | 'light' | 'dark'): void {
        // Mark as manual selection and persist synchronously
        this.context.globalState.update(this.THEME_MANUAL_KEY, true);
        this.context.globalState.update(this.THEME_STORAGE_KEY, theme);
        console.log(`Theme set manually to: ${theme}, manual flag: ${this.isManualThemeSelected()}`);
        // Do not refresh the view here; the client script already applied the theme instantly.
    }

    protected isManualThemeSelected(): boolean {
        return this.context.globalState.get<boolean>(this.THEME_MANUAL_KEY) === true;
    }

    protected setAutoThemeMode(): void {
        this.context.globalState.update(this.THEME_MANUAL_KEY, false);
        // Optional: clear explicit theme value
        // this.context.globalState.update(this.THEME_STORAGE_KEY, undefined);
    }
}