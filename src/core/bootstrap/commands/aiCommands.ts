/**
 * WP-V80 · DATOS — tabla de comandos del asistente AI (con sus plantillas
 * HTML inline, que son datos del comando). Handlers transcritos literalmente
 * del monolito: `managers.*` → `deps.managers.*`.
 */
import * as vscode from 'vscode';
import { AICapability, AIInteractionType } from '../../aiAssistantService';
import { LogCategory } from '../../../loggingManager';
import {
    renderAiCodeAnalysisPage,
    renderAiResponsePage,
    renderAiStatsPage,
    renderAiWorkflowPage
} from '../../../webview/bootstrapPages';
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
                        // WP-V66: página estática — sin scripts ni recursos locales.
                        { enableScripts: false, localResourceRoots: [] }
                    );

                    // WP-V66: HTML con CSP desde el módulo de páginas (fuera de la tabla).
                    panel.webview.html = renderAiResponsePage(response);
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
                    // WP-V66: página estática — sin scripts ni recursos locales.
                    { enableScripts: false, localResourceRoots: [] }
                );

                // WP-V66: HTML con CSP desde el módulo de páginas (fuera de la tabla).
                panel.webview.html = renderAiCodeAnalysisPage(response, code, editor.document.languageId);
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
                        settings: vscode.workspace.getConfiguration().get('alephscript') || {}
                    },
                    timestamp: new Date().toISOString(),
                    session_id: 'default'
                });

                const panel = vscode.window.createWebviewPanel(
                    'ai-workflow-optimization',
                    'AI Workflow Optimization',
                    vscode.ViewColumn.Two,
                    // WP-V66: página estática — sin scripts ni recursos locales.
                    { enableScripts: false, localResourceRoots: [] }
                );

                // WP-V66: HTML con CSP desde el módulo de páginas (fuera de la tabla).
                panel.webview.html = renderAiWorkflowPage(response);
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
                    // WP-V66: página estática — sin scripts ni recursos locales.
                    { enableScripts: false, localResourceRoots: [] }
                );

                // WP-V66: HTML con CSP desde el módulo de páginas (fuera de la tabla).
                panel.webview.html = renderAiStatsPage(stats);
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
