import * as vscode from 'vscode';

/**
 * Base class for Hacker-themed WebView panels with common functionality
 */
export abstract class BaseHackerPanelProvider implements vscode.WebviewViewProvider {
    protected _view?: vscode.WebviewView;
    protected matrixInterval?: NodeJS.Timeout;
    protected timeInterval?: NodeJS.Timeout;

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
        webviewView.webview.onDidReceiveMessage(
            message => this.handleMessage(message)
        );

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

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="${styleUri}" rel="stylesheet">
            <title>${title}</title>
        </head>
        <body>
            <div class="hacker-terminal">
                <div class="terminal-header">
                    <div class="terminal-title">
                        <span class="blinking-cursor">█</span> ${title}
                    </div>
                    <div class="system-status">
                        <span class="status-indicator online"></span> NEURAL_LINK_ACTIVE
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
}