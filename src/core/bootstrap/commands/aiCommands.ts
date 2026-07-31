/**
 * WP-V80 · DATOS — tabla de comandos del asistente AI (con sus plantillas
 * HTML inline, que son datos del comando). Handlers transcritos literalmente
 * del monolito: `managers.*` → `deps.managers.*`.
 */
import * as vscode from 'vscode';
import { AICapability, AIInteractionType } from '../../aiAssistantService';
import { LogCategory } from '../../../loggingManager';
import { ALEPH0_SECTION } from '../../../config/ziguratSettings';
import { CommandEntry } from './types';

export const aiCommands: CommandEntry[] = [
    // AI Assistant commands
    {
        id: 'aleph0.ai.askAssistant',
        handler: deps => async () => {
            try {
                const input = await vscode.window.showInputBox({
                    prompt: 'Ask the AI Assistant a question',
                    placeHolder: 'e.g., How can I optimize my code?'
                });

                if (input) {
                    const response = await deps.managers.aiAssistant.processRequest({
                        id: Date.now().toString(),
                        type: AIInteractionType.CHAT,
                        capability: AICapability.COMMAND_SUGGESTION,
                        context: {
                            workspace: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath,
                            activeFile: vscode.window.activeTextEditor?.document.uri.fsPath,
                            userIntent: input
                        },
                        data: {
                            query: input,
                            editor_language: vscode.window.activeTextEditor?.document.languageId
                        },
                        timestamp: new Date().toISOString(),
                        session_id: 'default'
                    });

                    const panel = vscode.window.createWebviewPanel(
                        'ai-assistant-response',
                        'AI Assistant Response',
                        vscode.ViewColumn.Two,
                        { enableScripts: true }
                    );

                    panel.webview.html = `
                        <html>
                        <head>
                            <style>
                                body { font-family: Arial, sans-serif; padding: 20px; }
                                .response { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0; }
                                .confidence { color: ${response.confidence > 70 ? 'green' : response.confidence > 40 ? 'orange' : 'red'}; }
                                .metadata { font-size: 0.9em; color: #666; margin-top: 10px; }
                            </style>
                        </head>
                        <body>
                            <h2>AI Assistant Response</h2>
                            <div class="response">
                                <h3>Answer:</h3>
                                <p>${response.content.message || 'No response message available'}</p>
                                <div class="metadata">
                                    <span class="confidence">Confidence: ${Math.round(response.confidence)}%</span> |
                                    Processing Time: ${response.metadata.processing_time}ms
                                </div>
                            </div>
                        </body>
                        </html>
                    `;
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'ai.askAssistant',
                    LogCategory.EXTENSION
                );
            }
        }
    },
    {
        id: 'aleph0.ai.codeAnalysis',
        handler: deps => async () => {
            try {
                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    vscode.window.showErrorMessage('No active text editor found');
                    return;
                }

                const selection = editor.selection;
                const code = selection.isEmpty ? editor.document.getText() : editor.document.getText(selection);

                if (!code.trim()) {
                    vscode.window.showErrorMessage('No code selected for analysis');
                    return;
                }

                const response = await deps.managers.aiAssistant.processRequest({
                    id: Date.now().toString(),
                    type: AIInteractionType.ANALYSIS,
                    capability: AICapability.CODE_ANALYSIS,
                    context: {
                        activeFile: editor.document.uri.fsPath,
                        selection: code,
                        workspace: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
                    },
                    data: {
                        code,
                        language: editor.document.languageId,
                        file_path: editor.document.uri.fsPath
                    },
                    timestamp: new Date().toISOString(),
                    session_id: 'default'
                });

                const panel = vscode.window.createWebviewPanel(
                    'ai-code-analysis',
                    'AI Code Analysis',
                    vscode.ViewColumn.Two,
                    { enableScripts: true }
                );

                panel.webview.html = `
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 20px; }
                            .analysis { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }
                            .code-block { background: #2d2d30; color: #cccccc; padding: 10px; border-radius: 3px; font-family: monospace; white-space: pre-wrap; }
                            .confidence { color: ${response.confidence > 70 ? 'green' : response.confidence > 40 ? 'orange' : 'red'}; }
                        </style>
                    </head>
                    <body>
                        <h2>AI Code Analysis Results</h2>
                        <div class="analysis">
                            <h3>Analysis:</h3>
                            <p>${response.content.message || response.content.analysis?.summary || 'No analysis available'}</p>
                            <div style="font-size: 0.9em; color: #666; margin-top: 10px;">
                                <span class="confidence">Confidence: ${Math.round(response.confidence)}%</span> |
                                Language: ${editor.document.languageId} |
                                Processing Time: ${response.metadata.processing_time}ms
                            </div>
                        </div>
                        <div>
                            <h3>Analyzed Code:</h3>
                            <div class="code-block">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
                        </div>
                    </body>
                    </html>
                `;
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'ai.codeAnalysis',
                    LogCategory.EXTENSION
                );
            }
        }
    },
    {
        id: 'aleph0.ai.optimizeWorkflow',
        handler: deps => async () => {
            try {
                const response = await deps.managers.aiAssistant.processRequest({
                    id: Date.now().toString(),
                    type: AIInteractionType.OPTIMIZATION,
                    capability: AICapability.WORKFLOW_OPTIMIZATION,
                    context: {
                        workspace: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath,
                        userIntent: 'workflow optimization analysis'
                    },
                    data: {
                        workspace_folders: vscode.workspace.workspaceFolders?.map(f => f.uri.fsPath),
                        extensions: vscode.extensions.all.filter(ext => ext.isActive).map(ext => ext.id),
                        settings: vscode.workspace.getConfiguration().get(ALEPH0_SECTION) || {}
                    },
                    timestamp: new Date().toISOString(),
                    session_id: 'default'
                });

                const panel = vscode.window.createWebviewPanel(
                    'ai-workflow-optimization',
                    'AI Workflow Optimization',
                    vscode.ViewColumn.Two,
                    { enableScripts: true }
                );

                panel.webview.html = `
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 20px; }
                            .optimization { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #28a745; }
                            .confidence { color: ${response.confidence > 70 ? 'green' : response.confidence > 40 ? 'orange' : 'red'}; }
                        </style>
                    </head>
                    <body>
                        <h2>AI Workflow Optimization Suggestions</h2>
                        <div class="optimization">
                            <h3>Optimization Recommendations:</h3>
                            <p>${response.content.message || 'No optimization suggestions available'}</p>
                            <div style="font-size: 0.9em; color: #666; margin-top: 10px;">
                                <span class="confidence">Confidence: ${Math.round(response.confidence)}%</span> |
                                Processing Time: ${response.metadata.processing_time}ms
                            </div>
                        </div>
                    </body>
                    </html>
                `;
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'ai.optimizeWorkflow',
                    LogCategory.EXTENSION
                );
            }
        }
    },
    {
        id: 'aleph0.ai.viewStats',
        handler: deps => async () => {
            try {
                const stats = deps.managers.aiAssistant.getStatistics();

                const panel = vscode.window.createWebviewPanel(
                    'ai-assistant-stats',
                    'AI Assistant Statistics',
                    vscode.ViewColumn.Two,
                    { enableScripts: true }
                );

                panel.webview.html = `
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 20px; }
                            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
                            .stat-card { background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #007acc; }
                            .stat-title { font-weight: bold; color: #333; margin-bottom: 5px; }
                            .stat-value { font-size: 1.2em; color: #007acc; }
                            .capabilities { background: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0; }
                            .capability-list { list-style-type: none; padding: 0; }
                            .capability-list li { background: #b3d9ff; margin: 5px 0; padding: 8px; border-radius: 3px; }
                        </style>
                    </head>
                    <body>
                        <h2>AI Assistant Statistics</h2>

                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-title">Total Requests</div>
                                <div class="stat-value">${stats.total_requests}</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-title">Success Rate</div>
                                <div class="stat-value">${Math.round(stats.success_rate * 100)}%</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-title">Avg Confidence</div>
                                <div class="stat-value">${Math.round(stats.avg_confidence * 100)}%</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-title">Avg Processing Time</div>
                                <div class="stat-value">${Math.round(stats.avg_processing_time)}ms</div>
                            </div>
                        </div>

                        <div class="capabilities">
                            <h3>Capabilities Usage</h3>
                            <ul class="capability-list">
                                ${Object.entries(stats.capabilities_used).map(([capability, count]) =>
                                    `<li>${capability}: ${count} uses</li>`
                                ).join('')}
                            </ul>
                        </div>
                    </body>
                    </html>
                `;
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'ai.viewStats',
                    LogCategory.EXTENSION
                );
            }
        }
    }
];
