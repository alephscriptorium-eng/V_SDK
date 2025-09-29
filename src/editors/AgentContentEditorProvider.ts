import * as vscode from 'vscode';
import * as path from 'path';

export class AgentContentEditorProvider implements vscode.CustomTextEditorProvider {
    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new AgentContentEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(
            AgentContentEditorProvider.viewType, 
            provider,
            {
                webviewOptions: {
                    retainContextWhenHidden: true,
                },
                supportsMultipleEditorsPerDocument: false,
            }
        );
        return providerRegistration;
    }

    private static readonly viewType = 'theatrical.agentContentEditor';

    constructor(
        private readonly context: vscode.ExtensionContext
    ) {}

    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.context.extensionUri]
        };

        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview, document);

        function updateWebview() {
            webviewPanel.webview.postMessage({
                type: 'update',
                text: document.getText(),
            });
        }

        // Hook up event handlers so that we can synchronize the webview with the text document
        const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.uri.toString() === document.uri.toString()) {
                updateWebview();
            }
        });

        // Make sure we get rid of the listener when our editor is closed
        webviewPanel.onDidDispose(() => {
            changeDocumentSubscription.dispose();
        });

        // Receive message from the webview
        webviewPanel.webview.onDidReceiveMessage(e => {
            switch (e.type) {
                case 'save':
                    this.saveDocument(document, e.content);
                    return;
                case 'openConfig':
                    this.openConfigFile(document.uri);
                    return;
                case 'preview':
                    this.previewAgent(document.uri);
                    return;
                case 'validate':
                    this.validateAgentContent(e.content);
                    return;
            }
        });

        updateWebview();
    }

    private getHtmlForWebview(webview: vscode.Webview, document: vscode.TextDocument): string {
        // Get the local path to main script run in the webview
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'agent-content-editor.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'agent-content-editor.css'));

        // Use a nonce to only allow specific scripts to be run
        const nonce = getNonce();

        const agentName = this.extractAgentName(document.getText());
        const configPath = this.getConfigPath(document.uri);

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="${styleUri}" rel="stylesheet">
            <title>🎭 Editor de Contenido - ${agentName}</title>
        </head>
        <body>
            <div class="editor-container">
                <header class="editor-header">
                    <div class="header-info">
                        <h1>🎭 Editor de Contenido de Agente</h1>
                        <div class="agent-info">
                            <span class="agent-name">${agentName}</span>
                            <span class="file-path">${document.fileName}</span>
                        </div>
                    </div>
                    <div class="header-actions">
                        <button id="validateBtn" class="btn btn-secondary">
                            ✅ Validar
                        </button>
                        <button id="openConfigBtn" class="btn btn-primary" data-config-path="${configPath}">
                            ⚙️ Abrir Configuración
                        </button>
                        <button id="previewBtn" class="btn btn-success">
                            👁️ Vista Previa
                        </button>
                        <button id="saveBtn" class="btn btn-primary">
                            💾 Guardar
                        </button>
                    </div>
                </header>

                <div class="editor-main">
                    <div class="editor-sidebar">
                        <div class="sidebar-section">
                            <h3>📋 Estructura</h3>
                            <div class="structure-tree" id="structureTree">
                                <!-- Will be populated by JS -->
                            </div>
                        </div>

                        <div class="sidebar-section">
                            <h3>🏷️ Metadata</h3>
                            <div class="metadata-editor" id="metadataEditor">
                                <!-- Will be populated by JS -->
                            </div>
                        </div>

                        <div class="sidebar-section">
                            <h3>🎯 Guías Rápidas</h3>
                            <div class="quick-guides">
                                <button class="guide-btn" data-guide="personality">
                                    👤 Personalidad
                                </button>
                                <button class="guide-btn" data-guide="commands">
                                    ⚡ Comandos
                                </button>
                                <button class="guide-btn" data-guide="capabilities">
                                    🔧 Capacidades
                                </button>
                                <button class="guide-btn" data-guide="relationships">
                                    🤝 Relaciones
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="editor-content">
                        <div class="editor-toolbar">
                            <div class="toolbar-group">
                                <button class="toolbar-btn" data-action="bold">
                                    <strong>B</strong>
                                </button>
                                <button class="toolbar-btn" data-action="italic">
                                    <em>I</em>
                                </button>
                                <button class="toolbar-btn" data-action="code">
                                    &lt;/&gt;
                                </button>
                                <button class="toolbar-btn" data-action="emoji">
                                    😀
                                </button>
                            </div>
                            <div class="toolbar-group">
                                <button class="toolbar-btn" data-action="header1">
                                    H1
                                </button>
                                <button class="toolbar-btn" data-action="header2">
                                    H2
                                </button>
                                <button class="toolbar-btn" data-action="header3">
                                    H3
                                </button>
                                <button class="toolbar-btn" data-action="list">
                                    📋
                                </button>
                            </div>
                        </div>

                        <div class="content-editor">
                            <textarea id="contentTextarea" class="content-textarea" spellcheck="true"></textarea>
                        </div>

                        <div class="editor-status">
                            <div class="status-info">
                                <span id="wordCount">0 palabras</span>
                                <span id="charCount">0 caracteres</span>
                                <span id="lineCount">0 líneas</span>
                            </div>
                            <div class="validation-status" id="validationStatus">
                                <span class="status-indicator">⏳ Sin validar</span>
                            </div>
                        </div>
                    </div>

                    <div class="editor-preview" id="editorPreview" style="display: none;">
                        <div class="preview-header">
                            <h3>👁️ Vista Previa</h3>
                            <button id="closePreviewBtn" class="btn btn-small">✕</button>
                        </div>
                        <div class="preview-content" id="previewContent">
                            <!-- Rendered markdown will appear here -->
                        </div>
                    </div>
                </div>

                <div class="validation-panel" id="validationPanel" style="display: none;">
                    <div class="panel-header">
                        <h3>✅ Resultados de Validación</h3>
                        <button id="closeValidationBtn" class="btn btn-small">✕</button>
                    </div>
                    <div class="validation-results" id="validationResults">
                        <!-- Validation results will appear here -->
                    </div>
                </div>
            </div>

            <script nonce="${nonce}" src="${scriptUri}"></script>
        </body>
        </html>`;
    }

    private extractAgentName(content: string): string {
        const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
        if (frontmatterMatch) {
            const nameMatch = frontmatterMatch[1].match(/^name:\s*(.+)$/m);
            if (nameMatch) {
                return nameMatch[1].trim();
            }
        }
        return 'Agente Desconocido';
    }

    private getConfigPath(documentUri: vscode.Uri): string {
        const fileName = path.basename(documentUri.fsPath, '.agent.md');
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(documentUri);
        if (workspaceFolder) {
            return path.join(workspaceFolder.uri.fsPath, 'theatrical-content', 'configurations', 'agents', `${fileName}.config.json`);
        }
        return '';
    }

    private async saveDocument(document: vscode.TextDocument, content: string): Promise<void> {
        const edit = new vscode.WorkspaceEdit();
        edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), content);
        await vscode.workspace.applyEdit(edit);
        await document.save();
        
        vscode.window.showInformationMessage('🎭 Contenido del agente guardado correctamente');
    }

    private async openConfigFile(documentUri: vscode.Uri): Promise<void> {
        const configPath = this.getConfigPath(documentUri);
        if (configPath) {
            try {
                const configUri = vscode.Uri.file(configPath);
                await vscode.window.showTextDocument(configUri);
            } catch (error) {
                vscode.window.showErrorMessage(`No se pudo abrir el archivo de configuración: ${configPath}`);
            }
        }
    }

    private async previewAgent(documentUri: vscode.Uri): Promise<void> {
        vscode.window.showInformationMessage('🎭 Función de vista previa del agente próximamente...');
    }

    private async validateAgentContent(content: string): Promise<void> {
        // Basic validation logic
        const errors: string[] = [];
        const warnings: string[] = [];

        // Check for frontmatter
        if (!content.match(/^---\s*\n([\s\S]*?)\n---/)) {
            errors.push('❌ El archivo debe comenzar con frontmatter YAML');
        }

        // Check for required sections
        const requiredSections = ['Mi Identidad', 'Especialización', 'Capacidades', 'Comandos'];
        requiredSections.forEach(section => {
            if (!content.includes(section)) {
                warnings.push(`⚠️ Sección recomendada faltante: ${section}`);
            }
        });

        // Check word count
        const wordCount = content.split(/\s+/).length;
        if (wordCount < 500) {
            warnings.push('⚠️ El contenido parece muy breve (menos de 500 palabras)');
        }

        const message = errors.length > 0 
            ? `❌ ${errors.length} errores encontrados`
            : warnings.length > 0
            ? `⚠️ ${warnings.length} advertencias encontradas`
            : '✅ Contenido válido';

        vscode.window.showInformationMessage(message);
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