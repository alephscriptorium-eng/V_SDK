/**
 * WP-V80 · DATOS — tablas de comandos de la Primera Época (gamificación):
 * uis, socket monitor, AracneBot y configs. Cuatro tablas porque el
 * monolito registraba en tramos no contiguos; el índice preserva el orden.
 * Handlers transcritos literalmente del monolito.
 */
import * as vscode from 'vscode';
import { LogCategory } from '../../../loggingManager';
import { CommandEntry } from './types';

export const uisCommands: CommandEntry[] = [
    // UIs Commands
    {
        id: 'aleph0.uis.refresh',
        handler: deps => async () => {
            try {
                const ctx = deps.getContext();
                if (ctx) {
                    ctx.uisTreeProvider.refresh();
                    ctx.logger.info('UIs TreeView refreshed');
                    vscode.window.showInformationMessage('🎨 UIs refreshed');
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'uis.refresh',
                    LogCategory.EXTENSION
                );
            }
        }
    }
];

export const socketCommands: CommandEntry[] = [
    // Socket.io Gamification Commands (First Era Restoration)
    {
        id: 'aleph0.mcpSocketManager.openSocketMonitor',
        handler: deps => async () => {
            try {
                const ctx = deps.getContext();
                const vsCodeContext = deps.getVsCodeContext();
                if (ctx && vsCodeContext) {
                    await ctx.socketMonitor.createOrShowPanel(vsCodeContext.extensionUri);
                    ctx.logger.info('Socket Monitor opened');
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'socket.openMonitor',
                    LogCategory.SOCKET
                );
            }
        }
    },
    {
        id: 'aleph0.sockets.refresh',
        handler: deps => async () => {
            try {
                const ctx = deps.getContext();
                if (ctx) {
                    ctx.socketsTreeProvider.refresh();
                    ctx.logger.info('Sockets TreeView refreshed');
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'sockets.refresh',
                    LogCategory.SOCKET
                );
            }
        }
    }
];

export const aracneCommands: CommandEntry[] = [
    // AracneBot Commands - Socket.IO mesh integration
    {
        id: 'aleph0.aracne.connect',
        handler: deps => async () => {
            try {
                const ctx = deps.getContext();
                if (ctx) {
                    ctx.aracneBotService.connect();
                    vscode.window.showInformationMessage('🕷️ AracneBot connecting to mesh...');
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'aracne.connect',
                    LogCategory.SOCKET
                );
            }
        }
    },
    {
        id: 'aleph0.aracne.disconnect',
        handler: deps => async () => {
            try {
                const ctx = deps.getContext();
                if (ctx) {
                    ctx.aracneBotService.disconnect();
                    vscode.window.showInformationMessage('🕷️ AracneBot disconnected from mesh');
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'aracne.disconnect',
                    LogCategory.SOCKET
                );
            }
        }
    },
    {
        id: 'aleph0.aracne.status',
        handler: deps => async () => {
            try {
                const ctx = deps.getContext();
                if (ctx) {
                    const connected = ctx.aracneBotService.isConnected();
                    const status = connected ? '🟢 Connected' : '🔴 Disconnected';
                    vscode.window.showInformationMessage(`🕷️ AracneBot: ${status}`);
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'aracne.status',
                    LogCategory.SOCKET
                );
            }
        }
    }
];

export const configsCommands: CommandEntry[] = [
    // Configs Commands
    {
        id: 'aleph0.configs.refresh',
        handler: deps => async () => {
            try {
                const ctx = deps.getContext();
                if (ctx) {
                    ctx.configsTreeProvider.refresh();
                    ctx.logger.info('Configs TreeView refreshed');
                    vscode.window.showInformationMessage('⚙️ Configurations refreshed');
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'configs.refresh',
                    LogCategory.EXTENSION
                );
            }
        }
    }
];
