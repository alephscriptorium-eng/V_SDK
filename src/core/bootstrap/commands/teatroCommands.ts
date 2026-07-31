/**
 * WP-V80 · DATOS — tablas de comandos del Teatro.
 * Dos tablas porque el monolito registraba en dos tramos no contiguos
 * (refresh primero; agentes/panel después de uis.refresh); el índice
 * las concatena en el MISMO orden global.
 */
import * as vscode from 'vscode';
import { LogCategory } from '../../../loggingManager';
import { CommandEntry } from './types';

export const teatroCoreCommands: CommandEntry[] = [
    // Teatro Commands
    {
        id: 'aleph0.teatro.refresh',
        handler: deps => () => {
            const ctx = deps.getContext();
            if (!ctx) return;
            ctx.teatroTreeProvider.refresh();
            vscode.window.showInformationMessage('🎭 Teatro actualizado');
        }
    }
];

export const teatroAgentCommands: CommandEntry[] = [
    {
        id: 'aleph0.teatro.activateAgent',
        handler: deps => (arg: any) => {
            const ctx = deps.getContext();
            if (!ctx) return;
            const agentId = typeof arg === 'string' ? arg : arg?.agent?.id ?? arg?.id ?? arg?.label ?? '';
            if (!agentId || typeof agentId !== 'string') {
                vscode.window.showErrorMessage('No se pudo determinar el agente a activar');
                return;
            }
            ctx.teatroTreeProvider.activateAgent(agentId);
        }
    },
    {
        id: 'aleph0.teatro.deactivateAgent',
        handler: deps => (arg: any) => {
            const ctx = deps.getContext();
            if (!ctx) return;
            const agentId = typeof arg === 'string' ? arg : arg?.agent?.id ?? arg?.id ?? arg?.label ?? '';
            if (!agentId || typeof agentId !== 'string') {
                vscode.window.showErrorMessage('No se pudo determinar el agente a desactivar');
                return;
            }
            ctx.teatroTreeProvider.deactivateAgent(agentId);
        }
    },
    {
        id: 'aleph0.teatro.openChatParticipant',
        handler: deps => async (arg: any, command?: string) => {
            try {
                const ctx = deps.getContext();
                if (!ctx) return;
                const agentId = typeof arg === 'string' ? arg : arg?.agent?.id ?? arg?.id ?? '';
                const agent = ctx.teatroTreeProvider.getAgent(agentId);
                if (!agent) {
                    vscode.window.showErrorMessage(`Agente ${agentId} no encontrado`);
                    return;
                }

                // Focus chat panel
                await vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');

                // Prepare chat message
                const message = command ? `@${agentId} /${command}` : `@${agentId} Hola, estoy listo para trabajar contigo`;

                // Show info about the agent
                vscode.window.showInformationMessage(
                    `🎭 Conectando con ${agent.fullName}`,
                    'Abrir Chat'
                ).then(selection => {
                    if (selection === 'Abrir Chat') {
                        vscode.commands.executeCommand('workbench.action.chat.open', {
                            query: message
                        });
                    }
                });
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'teatro.openChatParticipant',
                    LogCategory.EXTENSION
                );
            }
        }
    },
    {
        id: 'aleph0.teatro.showAgentInfo',
        handler: deps => (arg: any) => {
            const ctx = deps.getContext();
            if (!ctx) return;
            const agentId = typeof arg === 'string' ? arg : arg?.agent?.id ?? arg?.id ?? '';
            if (agentId === 'system') {
                const status = ctx.teatroTreeProvider.getAgentsStatus();
                vscode.window.showInformationMessage(
                    `🎭 Teatro: ${status.active}/${status.total} agentes activos`
                );
                return;
            }

            const agent = ctx.teatroTreeProvider.getAgent(agentId);
            if (agent) {
                const commands = agent.commands.map(cmd => `• /${cmd.name}: ${cmd.description}`).join('\n');
                vscode.window.showInformationMessage(
                    `🎭 ${agent.fullName}\n\n${agent.description}\n\nComandos disponibles:\n${commands}`,
                    'Abrir Chat'
                ).then(selection => {
                    if (selection === 'Abrir Chat') {
                        vscode.commands.executeCommand('aleph0.teatro.openChatParticipant', agentId);
                    }
                });
            } else {
                vscode.window.showErrorMessage(`Agente ${agentId} no encontrado`);
            }
        }
    },
    {
        id: 'aleph0.teatro.openTeatroPanel',
        handler: deps => async () => {
            try {
                const ctx = deps.getContext();
                if (!ctx) return;

                // Create Teatro control panel
                const panel = vscode.window.createWebviewPanel(
                    'teatro-panel',
                    '🎭 Panel del Teatro',
                    vscode.ViewColumn.One,
                    {
                        enableScripts: true,
                        // WP-V66: solo media/ — lo único que el HTML del teatro carga.
                        localResourceRoots: [vscode.Uri.joinPath(deps.getVsCodeContext()!.extensionUri, 'media')]
                    }
                );

                // Use the same HTML as our WebView provider
                if (ctx.teatroWebViewProvider) {
                    const webview = {
                        webview: panel.webview,
                        onDidChangeViewState: panel.onDidChangeViewState,
                        visible: panel.visible,
                        viewType: 'teatro-panel'
                    } as any;

                    // Resolve the webview manually
                    ctx.teatroWebViewProvider.resolveWebviewView(
                        webview,
                        {} as vscode.WebviewViewResolveContext,
                        new vscode.CancellationTokenSource().token
                    );
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'teatro.openTeatroPanel',
                    LogCategory.EXTENSION
                );
            }
        }
    }
];
