/**
 * WP-V80 · DATOS — tablas de comandos de la Primera Época (gamificación):
 * uis, socket monitor, AracneBot y configs. Cuatro tablas porque el
 * monolito registraba en tramos no contiguos; el índice preserva el orden.
 * Handlers transcritos literalmente del monolito.
 */
import * as vscode from 'vscode';
import { LogCategory } from '../../../loggingManager';
import { CommandEntry } from './types';

/**
 * WP-V25 · nombre de sala de un `SocketTreeItem`. El menú `view/item/context`
 * de `alephscript.sockets` entrega el ítem entero; el ítem lleva `roomName`
 * y, como respaldo, la etiqueta visible.
 */
function nombreDeSala(item: any): string | undefined {
    return item?.roomName || item?.label || undefined;
}

/**
 * WP-V25 · ruta del fichero de un `ConfigTreeItem`. El menú entrega el ítem
 * (con `resourceUri`); su `id` es `config-<fsPath>` y sirve de respaldo.
 */
function rutaDeConfig(item: any): string | undefined {
    if (item?.resourceUri?.fsPath) {
        return item.resourceUri.fsPath;
    }
    if (typeof item?.fsPath === 'string') {
        return item.fsPath;
    }
    if (typeof item?.id === 'string' && item.id.startsWith('config-')) {
        return item.id.slice('config-'.length);
    }
    return undefined;
}

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
    },
    // WP-V25 · los cinco que faltaban. Estaban declarados en `package.json` y
    // cableados al menú contextual de la vista `alephscript.sockets`, pero nadie
    // los registraba: el usuario pulsaba «Connect to Server» y no pasaba nada.
    // Peor: `commandPaletteManager.quickConnectSocket()` y
    // `disconnectAllSockets()` los invocan con `executeCommand`, así que dos
    // comandos que SÍ tenían handler —uno de ellos con atajo `ctrl+alt+c`—
    // reventaban con «command not found». Los métodos públicos de
    // `SocketsTreeDataProvider` ya existían; lo que faltaba era el cable.
    {
        id: 'aleph0.sockets.connect',
        handler: deps => async (url?: string) => {
            try {
                const ctx = deps.getContext();
                if (ctx) {
                    await ctx.socketsTreeProvider.connectToServer(
                        typeof url === 'string' ? url : undefined
                    );
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'sockets.connect',
                    LogCategory.SOCKET
                );
            }
        }
    },
    {
        id: 'aleph0.sockets.disconnect',
        handler: deps => async () => {
            try {
                const ctx = deps.getContext();
                if (ctx) {
                    await ctx.socketsTreeProvider.disconnectFromServer();
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'sockets.disconnect',
                    LogCategory.SOCKET
                );
            }
        }
    },
    {
        id: 'aleph0.sockets.joinRoom',
        handler: deps => async (item?: any) => {
            try {
                const ctx = deps.getContext();
                if (ctx) {
                    const sala = nombreDeSala(item);
                    if (!sala) {
                        vscode.window.showErrorMessage('No room provided for join command');
                        return;
                    }
                    await ctx.socketsTreeProvider.joinRoom(sala);
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'sockets.joinRoom',
                    LogCategory.SOCKET
                );
            }
        }
    },
    {
        id: 'aleph0.sockets.leaveRoom',
        handler: deps => async (item?: any) => {
            try {
                const ctx = deps.getContext();
                if (ctx) {
                    const sala = nombreDeSala(item);
                    if (!sala) {
                        vscode.window.showErrorMessage('No room provided for leave command');
                        return;
                    }
                    await ctx.socketsTreeProvider.leaveRoom(sala);
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'sockets.leaveRoom',
                    LogCategory.SOCKET
                );
            }
        }
    },
    {
        id: 'aleph0.sockets.sendMessage',
        handler: deps => async (item?: any) => {
            try {
                const ctx = deps.getContext();
                if (ctx) {
                    const sala = nombreDeSala(item);
                    if (!sala) {
                        vscode.window.showErrorMessage('No room provided for send message command');
                        return;
                    }
                    await ctx.socketsTreeProvider.sendTestMessage(sala);
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'sockets.sendMessage',
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
    },
    // WP-V25 · los seis que faltaban. `ConfigsTreeDataProvider` ya exponía sus
    // métodos bajo el rótulo «Public API methods for commands» — y no había
    // comandos. `configs.openInEditor` es el más visible: el proveedor lo pone
    // como `treeItem.command` de CADA fichero del árbol, así que un clic normal
    // sobre una configuración levantaba «command not found».
    {
        id: 'aleph0.configs.openInEditor',
        handler: deps => async (uri?: vscode.Uri) => {
            try {
                // El proveedor invoca con `arguments: [element.resourceUri,
                // element.configType]`, así que el primer argumento es una Uri,
                // NO el ítem del árbol (a diferencia de los otros cinco). El
                // segundo (`configType`) no se usa: se ignora sin declararlo.
                const destino = uri ?? undefined;
                if (!destino) {
                    vscode.window.showErrorMessage('No configuration file provided');
                    return;
                }
                const doc = await vscode.workspace.openTextDocument(destino);
                await vscode.window.showTextDocument(doc);
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'configs.openInEditor',
                    LogCategory.CONFIG
                );
            }
        }
    },
    {
        id: 'aleph0.configs.validate',
        handler: deps => async (item?: any) => {
            try {
                const ctx = deps.getContext();
                if (ctx) {
                    const ruta = rutaDeConfig(item);
                    if (!ruta) {
                        vscode.window.showErrorMessage('No configuration file provided for validate');
                        return;
                    }
                    await ctx.configsTreeProvider.validateConfiguration(ruta);
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'configs.validate',
                    LogCategory.CONFIG
                );
            }
        }
    },
    {
        id: 'aleph0.configs.format',
        handler: deps => async (item?: any) => {
            try {
                const ctx = deps.getContext();
                if (ctx) {
                    const ruta = rutaDeConfig(item);
                    if (!ruta) {
                        vscode.window.showErrorMessage('No configuration file provided for format');
                        return;
                    }
                    await ctx.configsTreeProvider.formatConfiguration(ruta);
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'configs.format',
                    LogCategory.CONFIG
                );
            }
        }
    },
    {
        id: 'aleph0.configs.backup',
        handler: deps => async (item?: any) => {
            try {
                const ctx = deps.getContext();
                if (ctx) {
                    const ruta = rutaDeConfig(item);
                    if (!ruta) {
                        vscode.window.showErrorMessage('No configuration file provided for backup');
                        return;
                    }
                    await ctx.configsTreeProvider.createBackup(ruta);
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'configs.backup',
                    LogCategory.CONFIG
                );
            }
        }
    },
    {
        id: 'aleph0.configs.createTemplate',
        handler: deps => async (tipo?: string) => {
            try {
                const ctx = deps.getContext();
                if (!ctx) {
                    return;
                }
                // `createFromTemplate` sólo admite estas tres plantillas; la
                // lista sale de su propia firma, no de una invención local.
                const plantillas: Array<'xplus1' | 'socket' | 'ui'> = ['xplus1', 'socket', 'ui'];
                const elegida = plantillas.includes(tipo as any)
                    ? (tipo as 'xplus1' | 'socket' | 'ui')
                    : await vscode.window.showQuickPick(plantillas, {
                        placeHolder: 'Configuration template'
                    }) as 'xplus1' | 'socket' | 'ui' | undefined;
                if (!elegida) {
                    return;
                }
                await ctx.configsTreeProvider.createFromTemplate(elegida);
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'configs.createTemplate',
                    LogCategory.CONFIG
                );
            }
        }
    },
    {
        id: 'aleph0.configs.reload',
        handler: deps => async (item?: any) => {
            try {
                const ctx = deps.getContext();
                if (ctx) {
                    const ruta = rutaDeConfig(item);
                    if (!ruta) {
                        vscode.window.showErrorMessage('No configuration file provided for reload');
                        return;
                    }
                    await ctx.configsTreeProvider.reloadConfiguration(ruta);
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'configs.reload',
                    LogCategory.CONFIG
                );
            }
        }
    }
];
