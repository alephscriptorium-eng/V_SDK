/**
 * WP-V80 · DATOS — tabla de comandos de gestión de agentes teatrales
 * (crear/editar/validar contenido y configuración). Las plantillas de
 * contenido/config son datos del comando y viven aquí con él.
 * Handlers transcritos literalmente del monolito.
 */
import * as vscode from 'vscode';
import { LogCategory } from '../../../loggingManager';
import { CommandEntry } from './types';

export const agentManagementCommands: CommandEntry[] = [
    // Agent Management Commands
    {
        id: 'aleph0.agents.createNew',
        handler: deps => async () => {
            try {
                // Ask for agent ID
                const agentId = await vscode.window.showInputBox({
                    prompt: 'Enter Agent ID (e.g., isaac, backend-agent)',
                    validateInput: (value) => {
                        if (!value || !/^[a-z][a-z0-9-]*[a-z0-9]$/.test(value)) {
                            return 'Agent ID must start with a letter, contain only lowercase letters, numbers, and hyphens';
                        }
                        return null;
                    }
                });

                if (!agentId) return;

                // Ask for agent name
                const agentName = await vscode.window.showInputBox({
                    prompt: 'Enter Agent Display Name (e.g., Isaac - El Marinero)',
                    value: agentId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                });

                if (!agentName) return;

                // Create agent files
                const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
                if (!workspaceFolder) {
                    vscode.window.showErrorMessage('No workspace folder found');
                    return;
                }

                const theatricalContentPath = vscode.Uri.joinPath(workspaceFolder.uri, 'theatrical-content');

                // Create content file
                const contentPath = vscode.Uri.joinPath(theatricalContentPath, 'content', 'agents', `${agentId}.agent.md`);
                const contentTemplate = `---
id: ${agentId}
name: "${agentName}"
version: "1.0.0"
description: "Description for ${agentName}"
role: "assistant"
specialization: "General"
---

# ${agentName}

## Descripción
Describe aquí las capacidades y propósito de este agente.

## Comandos Disponibles
- \`/example\`: Comando de ejemplo

## Configuración Especializada
Detalles específicos sobre cómo configurar y usar este agente.

## Ejemplos de Uso
\`\`\`
/example parameter
\`\`\`
`;

                const configPath = vscode.Uri.joinPath(theatricalContentPath, 'configurations', 'agents', `${agentId}.config.json`);
                const configTemplate = {
                    id: agentId,
                    name: agentName,
                    description: `Description for ${agentName}`,
                    role: "assistant",
                    version: "1.0.0",
                    enabled: true,
                    tools: [],
                    capabilities: [],
                    commands: [
                        {
                            name: "example",
                            description: "Example command"
                        }
                    ],
                    specialization: "General",
                    mcp: {
                        enabled: false,
                        servers: {}
                    }
                };

                // Create directories if they don't exist
                await vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(theatricalContentPath, 'content', 'agents'));
                await vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(theatricalContentPath, 'configurations', 'agents'));

                // Write files
                await vscode.workspace.fs.writeFile(contentPath, Buffer.from(contentTemplate, 'utf8'));
                await vscode.workspace.fs.writeFile(configPath, Buffer.from(JSON.stringify(configTemplate, null, 2), 'utf8'));

                // Open content file for editing
                const document = await vscode.workspace.openTextDocument(contentPath);
                await vscode.window.showTextDocument(document);

                vscode.window.showInformationMessage(`Agent ${agentName} created successfully!`);

            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'agents.createNew',
                    LogCategory.EXTENSION
                );
            }
        }
    },
    {
        id: 'aleph0.agents.editContent',
        handler: deps => async () => {
            try {
                const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
                if (!workspaceFolder) {
                    vscode.window.showErrorMessage('No workspace folder found');
                    return;
                }

                const agentFiles = await vscode.workspace.findFiles(
                    new vscode.RelativePattern(workspaceFolder, '**/theatrical-content/content/agents/*.agent.md')
                );

                if (agentFiles.length === 0) {
                    vscode.window.showInformationMessage('No agent content files found. Create a new agent first.');
                    return;
                }

                const selected = await vscode.window.showQuickPick(
                    agentFiles.map(file => ({
                        label: file.fsPath.split('/').pop()?.replace('.agent.md', '') || 'Unknown',
                        description: file.fsPath,
                        uri: file
                    })),
                    { placeHolder: 'Select agent to edit content' }
                );

                if (selected) {
                    const document = await vscode.workspace.openTextDocument(selected.uri);
                    await vscode.window.showTextDocument(document);
                }

            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'agents.editContent',
                    LogCategory.EXTENSION
                );
            }
        }
    },
    {
        id: 'aleph0.agents.editConfig',
        handler: deps => async () => {
            try {
                const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
                if (!workspaceFolder) {
                    vscode.window.showErrorMessage('No workspace folder found');
                    return;
                }

                const configFiles = await vscode.workspace.findFiles(
                    new vscode.RelativePattern(workspaceFolder, '**/theatrical-content/configurations/agents/*.config.json')
                );

                if (configFiles.length === 0) {
                    vscode.window.showInformationMessage('No agent configuration files found. Create a new agent first.');
                    return;
                }

                const selected = await vscode.window.showQuickPick(
                    configFiles.map(file => ({
                        label: file.fsPath.split('/').pop()?.replace('.config.json', '') || 'Unknown',
                        description: file.fsPath,
                        uri: file
                    })),
                    { placeHolder: 'Select agent to edit configuration' }
                );

                if (selected) {
                    const document = await vscode.workspace.openTextDocument(selected.uri);
                    await vscode.window.showTextDocument(document);
                }

            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'agents.editConfig',
                    LogCategory.EXTENSION
                );
            }
        }
    },
    {
        id: 'aleph0.agents.validateAll',
        handler: deps => async () => {
            try {
                const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
                if (!workspaceFolder) {
                    vscode.window.showErrorMessage('No workspace folder found');
                    return;
                }

                // Find all agent files
                const contentFiles = await vscode.workspace.findFiles(
                    new vscode.RelativePattern(workspaceFolder, '**/theatrical-content/content/agents/*.agent.md')
                );

                const configFiles = await vscode.workspace.findFiles(
                    new vscode.RelativePattern(workspaceFolder, '**/theatrical-content/configurations/agents/*.config.json')
                );

                const validationResults = [];

                // Validate that each content file has a corresponding config file
                for (const contentFile of contentFiles) {
                    const agentId = contentFile.fsPath.split('/').pop()?.replace('.agent.md', '');
                    const correspondingConfig = configFiles.find(config =>
                        config.fsPath.includes(`${agentId}.config.json`)
                    );

                    if (!correspondingConfig) {
                        validationResults.push(`❌ Missing config file for agent: ${agentId}`);
                    } else {
                        validationResults.push(`✅ Agent ${agentId} has both content and config files`);
                    }
                }

                // Show validation results
                const panel = vscode.window.createWebviewPanel(
                    'agent-validation',
                    'Agent Validation Results',
                    vscode.ViewColumn.One,
                    { enableScripts: false }
                );

                panel.webview.html = `
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 20px; }
                            .result { margin: 8px 0; padding: 8px; border-radius: 4px; }
                            .success { background: #d4edda; color: #155724; }
                            .error { background: #f8d7da; color: #721c24; }
                        </style>
                    </head>
                    <body>
                        <h2>🎭 Agent Validation Results</h2>
                        <p>Found ${contentFiles.length} content files and ${configFiles.length} config files</p>
                        ${validationResults.map(result =>
                            `<div class="result ${result.includes('✅') ? 'success' : 'error'}">${result}</div>`
                        ).join('')}
                    </body>
                    </html>
                `;

            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'agents.validateAll',
                    LogCategory.EXTENSION
                );
            }
        }
    }
];
