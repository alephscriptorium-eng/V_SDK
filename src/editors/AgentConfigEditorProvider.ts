import * as vscode from 'vscode';
import * as path from 'path';

export class AgentConfigEditorProvider implements vscode.CustomTextEditorProvider {
    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new AgentConfigEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(
            AgentConfigEditorProvider.viewType, 
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

    private static readonly viewType = 'theatrical.agentConfigEditor';

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
                case 'openContent':
                    this.openContentFile(document.uri);
                    return;
                case 'validate':
                    this.validateConfig(e.config);
                    return;
                case 'previewAgent':
                    this.previewAgent(e.config);
                    return;
                case 'testMCP':
                    this.testMCPConnection(e.config.mcp);
                    return;
            }
        });

        updateWebview();
    }

    private getHtmlForWebview(webview: vscode.Webview, document: vscode.TextDocument): string {
        // Get the local path to main script run in the webview
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'agent-config-editor.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'agent-config-editor.css'));

        // Use a nonce to only allow specific scripts to be run
        const nonce = getNonce();

        const agentId = this.extractAgentId(document.getText());
        const contentPath = this.getContentPath(document.uri);

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="${styleUri}" rel="stylesheet">
            <title>⚙️ Editor de Configuración - ${agentId}</title>
        </head>
        <body>
            <div class="config-editor-container">
                <header class="config-header">
                    <div class="header-info">
                        <h1>⚙️ Editor de Configuración de Agente</h1>
                        <div class="agent-info">
                            <span class="agent-id">${agentId}</span>
                            <span class="file-path">${document.fileName}</span>
                        </div>
                    </div>
                    <div class="header-actions">
                        <button id="validateBtn" class="btn btn-secondary">
                            ✅ Validar JSON
                        </button>
                        <button id="openContentBtn" class="btn btn-primary" data-content-path="${contentPath}">
                            📝 Abrir Contenido
                        </button>
                        <button id="previewBtn" class="btn btn-success">
                            👁️ Vista Previa Agente
                        </button>
                        <button id="saveBtn" class="btn btn-primary">
                            💾 Guardar
                        </button>
                    </div>
                </header>

                <div class="config-main">
                    <div class="config-tabs">
                        <button class="tab-btn active" data-tab="general">
                            🎭 General
                        </button>
                        <button class="tab-btn" data-tab="tools">
                            🔧 Herramientas
                        </button>
                        <button class="tab-btn" data-tab="mcp">
                            🔗 MCP
                        </button>
                        <button class="tab-btn" data-tab="personality">
                            👤 Personalidad
                        </button>
                        <button class="tab-btn" data-tab="capabilities">
                            ⚡ Capacidades
                        </button>
                        <button class="tab-btn" data-tab="ui">
                            🎨 UI
                        </button>
                        <button class="tab-btn" data-tab="raw">
                            📄 JSON Crudo
                        </button>
                    </div>

                    <div class="config-content">
                        <!-- General Tab -->
                        <div class="tab-panel active" id="general-tab">
                            <div class="form-section">
                                <h3>🎭 Información General</h3>
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label for="agentId">ID del Agente:</label>
                                        <input type="text" id="agentId" pattern="[a-z-]+" placeholder="ejemplo: mi-agente">
                                        <small>Solo minúsculas y guiones</small>
                                    </div>
                                    <div class="form-group">
                                        <label for="displayName">Nombre para Mostrar:</label>
                                        <input type="text" id="displayName" placeholder="Mi Agente Especial">
                                    </div>
                                    <div class="form-group">
                                        <label for="emoji">Emoji:</label>
                                        <input type="text" id="emoji" maxlength="2" placeholder="🤖">
                                    </div>
                                    <div class="form-group">
                                        <label for="category">Categoría:</label>
                                        <select id="category">
                                            <option value="framework-retro">Framework Retro</option>
                                            <option value="technical">Técnico</option>
                                            <option value="integration">Integración</option>
                                            <option value="specialized">Especializado</option>
                                        </select>
                                    </div>
                                    <div class="form-group full-width">
                                        <label for="description">Descripción:</label>
                                        <textarea id="description" placeholder="Describe las capacidades del agente..."></textarea>
                                    </div>
                                    <div class="form-group">
                                        <label for="model">Modelo de IA:</label>
                                        <select id="model">
                                            <option value="Claude Sonnet 4">Claude Sonnet 4</option>
                                            <option value="Claude Opus">Claude Opus</option>
                                            <option value="Claude Haiku">Claude Haiku</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Tools Tab -->
                        <div class="tab-panel" id="tools-tab">
                            <div class="form-section">
                                <h3>🔧 Herramientas Disponibles</h3>
                                <div class="tools-grid" id="toolsGrid">
                                    <!-- Will be populated by JS -->
                                </div>
                            </div>
                        </div>

                        <!-- MCP Tab -->
                        <div class="tab-panel" id="mcp-tab">
                            <div class="form-section">
                                <h3>🔗 Configuración MCP</h3>
                                <div class="mcp-section">
                                    <h4>Servidores MCP</h4>
                                    <div class="array-editor" id="mcpServers">
                                        <div class="array-items" id="mcpServersList"></div>
                                        <button type="button" class="btn btn-small add-item" data-array="mcpServers">
                                            ➕ Añadir Servidor
                                        </button>
                                    </div>

                                    <h4>Herramientas MCP</h4>
                                    <div class="array-editor" id="mcpTools">
                                        <div class="array-items" id="mcpToolsList"></div>
                                        <button type="button" class="btn btn-small add-item" data-array="mcpTools">
                                            ➕ Añadir Herramienta
                                        </button>
                                    </div>

                                    <h4>Recursos MCP</h4>
                                    <div class="array-editor" id="mcpResources">
                                        <div class="array-items" id="mcpResourcesList"></div>
                                        <button type="button" class="btn btn-small add-item" data-array="mcpResources">
                                            ➕ Añadir Recurso
                                        </button>
                                    </div>

                                    <div class="mcp-actions">
                                        <button id="testMCPBtn" class="btn btn-secondary">
                                            🧪 Probar Conexión MCP
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Personality Tab -->
                        <div class="tab-panel" id="personality-tab">
                            <div class="form-section">
                                <h3>👤 Configuración de Personalidad</h3>
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label for="style">Estilo de Comunicación:</label>
                                        <select id="style">
                                            <option value="formal">Formal</option>
                                            <option value="casual">Casual</option>
                                            <option value="nautical">Náutico</option>
                                            <option value="technical">Técnico</option>
                                            <option value="friendly">Amigable</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="formality">Nivel de Formalidad:</label>
                                        <select id="formality">
                                            <option value="very-formal">Muy Formal</option>
                                            <option value="formal">Formal</option>
                                            <option value="neutral">Neutral</option>
                                            <option value="casual">Casual</option>
                                            <option value="very-casual">Muy Casual</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="emojiUsage">Uso de Emojis:</label>
                                        <select id="emojiUsage">
                                            <option value="none">Ninguno</option>
                                            <option value="minimal">Mínimo</option>
                                            <option value="moderate">Moderado</option>
                                            <option value="frequent">Frecuente</option>
                                            <option value="extensive">Extensivo</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="relationship">Tipo de Relación:</label>
                                        <select id="relationship">
                                            <option value="professional">Profesional</option>
                                            <option value="friendly">Amigable</option>
                                            <option value="loyal_crew">Tripulación Leal</option>
                                            <option value="mentor">Mentor</option>
                                            <option value="peer">Par</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Capabilities Tab -->
                        <div class="tab-panel" id="capabilities-tab">
                            <div class="form-section">
                                <h3>⚡ Capacidades del Agente</h3>
                                <div class="capabilities-grid" id="capabilitiesGrid">
                                    <!-- Will be populated by JS -->
                                </div>
                            </div>
                        </div>

                        <!-- UI Tab -->
                        <div class="tab-panel" id="ui-tab">
                            <div class="form-section">
                                <h3>🎨 Configuración de Interfaz</h3>
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label for="icon">Icono VS Code:</label>
                                        <input type="text" id="icon" placeholder="anchor">
                                        <small>Nombre del icono de VS Code (ej: anchor, gear, etc.)</small>
                                    </div>
                                    <div class="form-group">
                                        <label for="color">Color del Tema:</label>
                                        <input type="color" id="color">
                                    </div>
                                    <div class="form-group">
                                        <label>
                                            <input type="checkbox" id="isSticky">
                                            Mantener Activo en Chat
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Raw JSON Tab -->
                        <div class="tab-panel" id="raw-tab">
                            <div class="form-section">
                                <h3>📄 Editor JSON Crudo</h3>
                                <div class="json-editor">
                                    <textarea id="rawJsonEditor" class="json-textarea" spellcheck="false"></textarea>
                                </div>
                                <div class="json-actions">
                                    <button id="formatJsonBtn" class="btn btn-secondary">
                                        🎨 Formatear JSON
                                    </button>
                                    <button id="validateJsonBtn" class="btn btn-secondary">
                                        ✅ Validar JSON
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="validation-status" id="validationStatus">
                    <span class="status-indicator">⏳ Sin validar</span>
                    <div class="validation-details" id="validationDetails"></div>
                </div>
            </div>

            <script nonce="${nonce}" src="${scriptUri}"></script>
        </body>
        </html>`;
    }

    private extractAgentId(content: string): string {
        try {
            const config = JSON.parse(content);
            return config.agentId || 'Agente Desconocido';
        } catch (error) {
            return 'JSON Inválido';
        }
    }

    private getContentPath(documentUri: vscode.Uri): string {
        const fileName = path.basename(documentUri.fsPath, '.config.json');
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(documentUri);
        if (workspaceFolder) {
            return path.join(workspaceFolder.uri.fsPath, 'theatrical-content', 'content', 'agents', `${fileName}.agent.md`);
        }
        return '';
    }

    private async saveDocument(document: vscode.TextDocument, content: string): Promise<void> {
        try {
            // Validate JSON before saving
            JSON.parse(content);
            
            const edit = new vscode.WorkspaceEdit();
            edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), content);
            await vscode.workspace.applyEdit(edit);
            await document.save();
            
            vscode.window.showInformationMessage('⚙️ Configuración del agente guardada correctamente');
        } catch (error) {
            vscode.window.showErrorMessage(`❌ Error al guardar: JSON inválido - ${error}`);
        }
    }

    private async openContentFile(documentUri: vscode.Uri): Promise<void> {
        const contentPath = this.getContentPath(documentUri);
        if (contentPath) {
            try {
                const contentUri = vscode.Uri.file(contentPath);
                await vscode.window.showTextDocument(contentUri);
            } catch (error) {
                vscode.window.showErrorMessage(`No se pudo abrir el archivo de contenido: ${contentPath}`);
            }
        }
    }

    private async validateConfig(config: any): Promise<void> {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Required fields validation
        if (!config.agentId) errors.push('❌ agentId es requerido');
        if (!config.displayName) errors.push('❌ displayName es requerido');
        if (!config.description) errors.push('❌ description es requerido');
        if (!config.model) errors.push('❌ model es requerido');

        // Pattern validation
        if (config.agentId && !/^[a-z-]+$/.test(config.agentId)) {
            errors.push('❌ agentId debe contener solo minúsculas y guiones');
        }

        // Tools validation
        if (config.tools && !Array.isArray(config.tools)) {
            errors.push('❌ tools debe ser un array');
        }

        // MCP validation
        if (config.mcp) {
            if (config.mcp.servers && !Array.isArray(config.mcp.servers)) {
                errors.push('❌ mcp.servers debe ser un array');
            }
            if (config.mcp.tools && !Array.isArray(config.mcp.tools)) {
                errors.push('❌ mcp.tools debe ser un array');
            }
        }

        const message = errors.length > 0 
            ? `❌ ${errors.length} errores encontrados`
            : warnings.length > 0
            ? `⚠️ ${warnings.length} advertencias encontradas`
            : '✅ Configuración válida';

        vscode.window.showInformationMessage(message);
    }

    private async previewAgent(config: any): Promise<void> {
        vscode.window.showInformationMessage(`🎭 Vista previa de ${config.displayName || 'Agente'} próximamente...`);
    }

    private async testMCPConnection(mcpConfig: any): Promise<void> {
        vscode.window.showInformationMessage('🧪 Función de prueba de conexión MCP próximamente...');
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