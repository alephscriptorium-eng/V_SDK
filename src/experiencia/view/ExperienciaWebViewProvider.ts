/**
 * RH-17 · Webview experiencia H — CSP/nonce vía `webview/security`.
 * Data-driven desde ExperienciaSession; Teatro hardcodeado fuera del cambio.
 */

import * as vscode from 'vscode';
import { createNonce } from '../../webview/security';
import { ExperienciaSession } from './ExperienciaSession';
import { renderExperienciaDocument } from './renderExperienciaDocument';

export class ExperienciaWebViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'alephscript.experiencia.webview';

    private _view?: vscode.WebviewView;
    private readonly sub: vscode.Disposable;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly session: ExperienciaSession
    ) {
        this.sub = this.session.onDidChange(() => this.paint());
    }

    dispose(): void {
        this.sub.dispose();
    }

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, 'media')]
        };
        webviewView.webview.onDidReceiveMessage((message) => {
            void this.handleMessage(message);
        });
        this.paint();
        void this.session.refresh();
    }

    private paint(): void {
        if (!this._view) {
            return;
        }
        this._view.webview.html = renderExperienciaDocument({
            cspSource: this._view.webview.cspSource,
            nonce: createNonce(),
            snapshot: this.session.getSnapshot(),
            tools: this.session.getTools()
        });
    }

    private async handleMessage(message: unknown): Promise<void> {
        const m = message as { command?: string; tool?: string; args?: Record<string, unknown> };
        if (!m || typeof m.command !== 'string') {
            return;
        }
        switch (m.command) {
            case 'refresh':
                await this.session.refresh();
                break;
            case 'callTool': {
                if (typeof m.tool !== 'string' || m.tool.trim() === '') {
                    vscode.window.showWarningMessage(
                        '⏳ callTool sin nombre — no se inventa tool'
                    );
                    return;
                }
                const result = await this.session.callPublishedTool(
                    m.tool,
                    m.args ?? {}
                );
                if (result.ok) {
                    vscode.window.showInformationMessage(result.message);
                } else {
                    vscode.window.showWarningMessage(result.message);
                }
                break;
            }
            default:
                break;
        }
    }
}
