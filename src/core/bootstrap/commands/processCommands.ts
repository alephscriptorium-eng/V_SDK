/**
 * WP-V80 · DATOS — tabla de comandos de procesos, demo y sistema.
 * Handlers transcritos literalmente del monolito. Las tablas de terminales
 * de la demo (DEMO-1.0.0-F002) quedan como constantes declarativas; la
 * discrepancia histórica runAll(6)/stopAll(5 nombres) se PRESERVA tal cual
 * (cero cambio observable).
 */
import * as vscode from 'vscode';
import { LogCategory } from '../../../loggingManager';
import { CommandEntry } from './types';

/** Terminales que abre `aleph0.demo.runAll` (orden y textos literales). */
export const demoTerminals = (workspaceRoot: string): { name: string; cwd: string; command: string }[] => [
    { name: '🌐 Jekyll Site', cwd: `${workspaceRoot}`, command: './scripts/serve-site.sh' },
    { name: '🚀 MCP Launcher', cwd: `${workspaceRoot}/MCPGallery`, command: 'npm run start:launcher' },
    { name: '🤖 MCP Model', cwd: `${workspaceRoot}/MCPGallery`, command: 'npm run start:model' },
    { name: '⚡ Zeus', cwd: `${workspaceRoot}/MCPGallery`, command: 'npm run start:zeus' },
    { name: '📝 Novelist', cwd: `${workspaceRoot}/NovelistEditor`, command: 'npm start' },
    { name: '📝 Novelist UI', cwd: `${workspaceRoot}/NovelistEditor`, command: 'npm run docs:serve' }
];

/** Nombres que filtra `aleph0.demo.stopAll` (lista literal del monolito). */
export const demoTerminalStopNames = ['🌐 Jekyll Site', '🚀 MCP Launcher', '🤖 MCP Model', '⚡ Zeus', '📝 Novelist'];

export const processCommands: CommandEntry[] = [
    // Process management commands
    {
        id: 'aleph0.process.startLauncher',
        handler: deps => async () => {
            try {
                const configPath = deps.managers.config.get('process.configPath');
                if (!configPath) {
                    const result = await vscode.window.showOpenDialog({
                        canSelectFiles: true,
                        canSelectFolders: false,
                        canSelectMany: false,
                        filters: { 'JSON Files': ['json'] }
                    });

                    if (result && result[0]) {
                        await deps.managers.process.startLauncher(result[0].fsPath);
                    }
                } else {
                    await deps.managers.process.startLauncher(configPath);
                }
                vscode.window.showInformationMessage('Launcher started successfully');
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'process.startLauncher',
                    LogCategory.PROCESS
                );
            }
        }
    },
    {
        id: 'aleph0.process.stopLauncher',
        handler: deps => async () => {
            try {
                await deps.managers.process.stopLauncher();
                vscode.window.showInformationMessage('Launcher stopped successfully');
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'process.stopLauncher',
                    LogCategory.PROCESS
                );
            }
        }
    },
    // Demo commands - Run All Servers (DEMO-1.0.0-F002)
    {
        id: 'aleph0.demo.runAll',
        handler: deps => async () => {
            try {
                const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
                if (!workspaceRoot) {
                    vscode.window.showErrorMessage('No workspace folder found');
                    return;
                }

                for (const config of demoTerminals(workspaceRoot)) {
                    const terminal = vscode.window.createTerminal({
                        name: config.name,
                        cwd: config.cwd
                    });
                    terminal.show(false);
                    terminal.sendText(config.command);
                }

                vscode.window.showInformationMessage('🎬 All 5 demo servers started!');
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'demo.runAll',
                    LogCategory.PROCESS
                );
            }
        }
    },
    {
        id: 'aleph0.demo.stopAll',
        handler: deps => async () => {
            try {
                const demoTerminalsAbiertas = vscode.window.terminals.filter(t =>
                    demoTerminalStopNames.includes(t.name)
                );

                for (const terminal of demoTerminalsAbiertas) {
                    terminal.dispose();
                }

                vscode.window.showInformationMessage(`🛑 Stopped ${demoTerminalsAbiertas.length} demo servers`);
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'demo.stopAll',
                    LogCategory.PROCESS
                );
            }
        }
    },
    // System commands
    {
        id: 'aleph0.system.showStatus',
        handler: deps => () => {
            deps.showSystemStatus();
        }
    },
    {
        id: 'aleph0.system.restart',
        handler: deps => async () => {
            try {
                await deps.restartExtension();
                vscode.window.showInformationMessage('AlephScript extension restarted successfully');
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'system.restart',
                    LogCategory.EXTENSION
                );
            }
        }
    }
];
