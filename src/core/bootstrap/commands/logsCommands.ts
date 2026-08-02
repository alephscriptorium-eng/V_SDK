/**
 * WP-V25 · DATOS — tabla de comandos del panel de logs.
 *
 * ESTA TABLA NO EXISTÍA. Los diez comandos `aleph0.logs.*` que viven aquí
 * llevaban declarados en `package.json` —y seis de ellos, cableados a la barra
 * de título de la vista `alephscript.logs`— sin que ningún módulo los
 * registrara: el usuario pulsaba «Refresh Logs» y no pasaba nada. Uno de ellos,
 * `aleph0.logs.showEntry`, ni siquiera estaba declarado, pero
 * `src/treeViews/logsTreeView.ts` lo pone como `treeItem.command` de CADA
 * entrada de log, así que un clic normal levantaba el error crudo «command
 * 'aleph0.logs.showEntry' not found».
 *
 * NINGÚN HANDLER DE AQUÍ INVENTA COMPORTAMIENTO: todos delegan en capacidad
 * pública que ya existía —`LogsTreeDataProvider` y `LoggingManager`— y que
 * hasta hoy no tenía cable. Lo que este WP arregla es el cable; si el método
 * del proveedor hace poco o nada útil, eso es otra ficha (WP-V25 CA6).
 */
import * as vscode from 'vscode';
import { LogCategory, LogEntry } from '../../../loggingManager';
import { CommandEntry } from './types';

/** Niveles ofrecidos por `aleph0.logs.setLogLevel`, en el orden del enum. */
const NIVELES = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'];

export const logsCommands: CommandEntry[] = [
    {
        id: 'aleph0.logs.refresh',
        handler: deps => async () => {
            try {
                const ctx = deps.getContext();
                if (ctx) {
                    ctx.logsTreeProvider.refresh();
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'logs.refresh',
                    LogCategory.EXTENSION
                );
            }
        }
    },
    {
        id: 'aleph0.logs.clear',
        handler: deps => async () => {
            try {
                const ctx = deps.getContext();
                if (ctx) {
                    ctx.logsTreeProvider.clearLogs();
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'logs.clear',
                    LogCategory.EXTENSION
                );
            }
        }
    },
    {
        id: 'aleph0.logs.export',
        handler: deps => async () => {
            try {
                const ctx = deps.getContext();
                if (ctx) {
                    ctx.logsTreeProvider.exportLogs();
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'logs.export',
                    LogCategory.EXTENSION
                );
            }
        }
    },
    {
        id: 'aleph0.logs.toggleAutoRefresh',
        handler: deps => async () => {
            try {
                const ctx = deps.getContext();
                if (ctx) {
                    ctx.logsTreeProvider.toggleAutoRefresh();
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'logs.toggleAutoRefresh',
                    LogCategory.EXTENSION
                );
            }
        }
    },
    {
        id: 'aleph0.logs.toggleGroupByCategory',
        handler: deps => async () => {
            try {
                const ctx = deps.getContext();
                if (ctx) {
                    ctx.logsTreeProvider.toggleGroupByCategory();
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'logs.toggleGroupByCategory',
                    LogCategory.EXTENSION
                );
            }
        }
    },
    {
        id: 'aleph0.logs.toggleErrorsOnly',
        handler: deps => async () => {
            try {
                const ctx = deps.getContext();
                if (ctx) {
                    ctx.logsTreeProvider.toggleErrorsOnly();
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'logs.toggleErrorsOnly',
                    LogCategory.EXTENSION
                );
            }
        }
    },
    {
        id: 'aleph0.logs.setLogLevel',
        handler: deps => async (nivel?: string) => {
            try {
                // Desde la paleta llega sin argumento: se pregunta. Desde código
                // puede llegar ya elegido; `setLogLevelFromString` tolera basura
                // (cae a INFO), así que no se valida aquí por duplicado.
                const elegido = nivel ?? await vscode.window.showQuickPick(NIVELES, {
                    placeHolder: 'Log level'
                });
                if (!elegido) {
                    return;
                }
                deps.managers.logging.setLogLevelFromString(elegido);
                vscode.window.showInformationMessage(`Log level: ${elegido}`);
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'logs.setLogLevel',
                    LogCategory.EXTENSION
                );
            }
        }
    },
    {
        id: 'aleph0.logs.showChannel',
        handler: deps => async (categoria?: string) => {
            try {
                // `commandPaletteManager.showMainLogChannel()` lo invoca con
                // 'main' (src/commandPaletteManager.ts). Sin argumento, se elige.
                const elegida = categoria ?? await vscode.window.showQuickPick(
                    ['main', ...Object.values(LogCategory)],
                    { placeHolder: 'Log channel' }
                );
                if (!elegida) {
                    return;
                }
                deps.managers.logging.showChannel(elegida as LogCategory | 'main');
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'logs.showChannel',
                    LogCategory.EXTENSION
                );
            }
        }
    },
    {
        id: 'aleph0.logs.showEntry',
        handler: deps => async (entrada?: LogEntry) => {
            try {
                const ctx = deps.getContext();
                if (!ctx) {
                    return;
                }
                if (!entrada) {
                    // Invocado desde la paleta, sin entrada seleccionada. Se dice
                    // qué hacer en vez de callar: un handler mudo sería la misma
                    // mentira que este WP viene a quitar.
                    vscode.window.showInformationMessage(
                        'Select a log entry in the AlephScript Logs view to see its detail.'
                    );
                    return;
                }
                ctx.logsTreeProvider.showLogEntry(entrada);
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'logs.showEntry',
                    LogCategory.EXTENSION
                );
            }
        }
    }
];
