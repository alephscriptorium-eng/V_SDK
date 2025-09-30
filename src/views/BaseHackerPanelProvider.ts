import * as vscode from 'vscode';

/**
 * Base class for Hacker-themed WebView panels with common functionality
 */
export abstract class BaseHackerPanelProvider implements vscode.WebviewViewProvider {
    protected _view?: vscode.WebviewView;
    protected matrixInterval?: NodeJS.Timeout;
    protected timeInterval?: NodeJS.Timeout;
    protected readonly THEME_STORAGE_KEY = 'alephscript.hackerTheme';

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
                this.setCurrentTheme(message.theme as 'matrix' | 'light' | 'dark');
                return;
            }
            this.handleMessage(message);
        });

        // Initialize panel
        this.initializePanel();
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
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', styleFileName));

        const nonce = this.getNonce();
        const currentTheme = this.getCurrentTheme();

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="${styleUri}" rel="stylesheet">
            <title>${title}</title>
            <style>
                /* Theme selector minimal styles */
                .header-controls { display: flex; align-items: center; gap: 8px; }
                .theme-select { background: transparent; color: inherit; border: 1px solid currentColor; border-radius: 4px; padding: 2px 6px; font-size: 0.85rem; }
                .theme-label { opacity: 0.8; font-size: 0.75rem; }

                /* Theme overrides */
                body.theme-matrix .hacker-terminal { background: #000 !important; color: #00ff7f !important; }
                body.theme-matrix .terminal-header, 
                body.theme-matrix .terminal-footer { background: rgba(0, 255, 127, 0.08) !important; border-color: rgba(0,255,127,0.25) !important; }
                body.theme-matrix .status-text { color: #00ff7f !important; }
                body.theme-matrix .system-status .online { background: #00ff7f !important; }
                body.theme-matrix #matrixRain { display: block !important; }

                body.theme-light { color: #111 !important; }
                body.theme-light .hacker-terminal { background: #fafafa !important; color: #111 !important; }
                body.theme-light .terminal-header, 
                body.theme-light .terminal-footer { background: #ffffff !important; border-color: #e5e5e5 !important; color: #111 !important; }
                body.theme-light .terminal-body { background: #ffffff !important; }
                body.theme-light .status-text { color: #333 !important; }
                body.theme-light .system-status .online { background: #22c55e !important; }

                body.theme-dark { color: #e5e7eb !important; }
                body.theme-dark .hacker-terminal { background: #0b1020 !important; color: #e5e7eb !important; }
                body.theme-dark .terminal-header, 
                body.theme-dark .terminal-footer { background: #0f172a !important; border-color: #1f2937 !important; color: #e5e7eb !important; }
                body.theme-dark .terminal-body { background: #0b1020 !important; }
                body.theme-dark .status-text { color: #93c5fd !important; }
                body.theme-dark .system-status .online { background: #38bdf8 !important; }

                /* Hide matrix rain when not in matrix theme */
                body.theme-light #matrixRain, body.theme-dark #matrixRain { display: none !important; }
            </style>
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
                            <option value="matrix" ${currentTheme === 'matrix' ? 'selected' : ''}>Matrix</option>
                            <option value="light" ${currentTheme === 'light' ? 'selected' : ''}>Light</option>
                            <option value="dark" ${currentTheme === 'dark' ? 'selected' : ''}>Dark</option>
                        </select>
                    </div>
                </div>
                
                <div class="terminal-body">
                    <div class="matrix-rain" id="matrixRain"></div>
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
            <script nonce="${nonce}">
                const vscode = acquireVsCodeApi();
                (function() {
                    var selector = document.getElementById('themeSelector');
                    function applyTheme(t) {
                        document.body.classList.remove('theme-matrix','theme-light','theme-dark');
                        document.body.classList.add('theme-' + t);
                    }
                    // Initialize from saved
                    var initial = '${currentTheme}';
                    applyTheme(initial);
                    try { localStorage.setItem('${this.THEME_STORAGE_KEY}', initial); } catch (err) {}
                    if (selector) {
                        selector.addEventListener('change', function() {
                            var val = selector.value;
                            applyTheme(val);
                            try { localStorage.setItem('${this.THEME_STORAGE_KEY}', val); } catch (err) {}
                            vscode.postMessage({ command: 'setTheme', theme: val });
                        });
                    }
                })();
            </script>
            <script nonce="${nonce}" src="${scriptUri}"></script>
        </body>
        </html>`;
    }

    protected postMessage(message: any): void {
        if (this._view) {
            this._view.webview.postMessage(message);
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
        const saved = this.context.globalState.get<string>(this.THEME_STORAGE_KEY);
        if (saved === 'light' || saved === 'dark' || saved === 'matrix') return saved;
        return 'matrix';
    }

    protected setCurrentTheme(theme: 'matrix' | 'light' | 'dark'): void {
        this.context.globalState.update(this.THEME_STORAGE_KEY, theme);
        // If the view exists, we can optionally update without full refresh by posting a message
        // but since theme only affects CSS classes, simply refresh to re-render header selector state.
        this.refresh();
    }
}