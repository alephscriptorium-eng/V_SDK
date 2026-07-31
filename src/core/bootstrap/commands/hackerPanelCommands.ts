/**
 * WP-V80 · DATOS — tabla de comandos de los paneles hacker y su status bar.
 * Handlers transcritos literalmente del monolito (`registerCommands`):
 * `this.extensionContext` → `deps.getContext()` · `managers.*` → `deps.managers.*`.
 */
import * as vscode from 'vscode';
import { LogCategory } from '../../../loggingManager';
import { ALEPH0_SECTION, STATUSBAR_VISIBLE_SUBKEY } from '../../../config/ziguratSettings';
import { CommandEntry } from './types';

export const hackerPanelCommands: CommandEntry[] = [
    // Hacker Control Panel Commands
    {
        id: 'aleph0.hackerControlPanel.toggle',
        handler: deps => async () => {
            try {
                // Focus the hacker control panel view
                await vscode.commands.executeCommand('alephscript.hackerControlPanel.focus');
                vscode.window.showInformationMessage('🚀 Neural Control Matrix activated');

                // Update status bar to indicate active panel
                if (deps.getContext()?.hackerStatusBarManager) {
                    deps.getContext()!.hackerStatusBarManager.updateButtonStates(['control']);
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'hackerControlPanel.toggle',
                    LogCategory.EXTENSION
                );
            }
        }
    },
    {
        id: 'aleph0.hackerCommandPanel.toggle',
        handler: deps => async () => {
            try {
                // Focus the hacker command panel view
                await vscode.commands.executeCommand('alephscript.hackerCommandPanel.focus');
                vscode.window.showInformationMessage('⚡ Command Terminal activated');

                // Update status bar to indicate active panel
                if (deps.getContext()?.hackerStatusBarManager) {
                    deps.getContext()!.hackerStatusBarManager.updateButtonStates(['command']);
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'hackerCommandPanel.toggle',
                    LogCategory.EXTENSION
                );
            }
        }
    },
    {
        id: 'aleph0.hackerConfigPanel.toggle',
        handler: deps => async () => {
            try {
                // Focus the hacker config panel view
                await vscode.commands.executeCommand('alephscript.hackerConfigPanel.focus');
                vscode.window.showInformationMessage('⚙️ Config Matrix activated');

                // Update status bar to indicate active panel
                if (deps.getContext()?.hackerStatusBarManager) {
                    deps.getContext()!.hackerStatusBarManager.updateButtonStates(['config']);
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'hackerConfigPanel.toggle',
                    LogCategory.EXTENSION
                );
            }
        }
    },
    // ===== Hacker Tasks Panel Commands =====
    {
        id: 'aleph0.hackerTasksPanel.toggle',
        handler: deps => async () => {
            try {
                await vscode.commands.executeCommand('alephscript.hackerTasksPanel.focus');
                vscode.window.showInformationMessage('📋 Tasks Runner activated');

                if (deps.getContext()?.hackerStatusBarManager) {
                    deps.getContext()!.hackerStatusBarManager.updateButtonStates(['tasks']);
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'hackerTasksPanel.toggle',
                    LogCategory.EXTENSION
                );
            }
        }
    },
    {
        id: 'aleph0.hackerTasksPanel.refresh',
        handler: deps => async () => {
            try {
                if (deps.getContext()?.hackerTasksPanelProvider) {
                    await deps.getContext()!.hackerTasksPanelProvider.refresh();
                    vscode.window.showInformationMessage('🔄 Tasks refreshed');
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'hackerTasksPanel.refresh',
                    LogCategory.EXTENSION
                );
            }
        }
    },
    {
        id: 'aleph0.hackerTasksPanel.runDefault',
        handler: deps => async () => {
            try {
                // Execute the default build task
                await vscode.commands.executeCommand('workbench.action.tasks.build');
                vscode.window.showInformationMessage('▶️ Running default build task...');
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'hackerTasksPanel.runDefault',
                    LogCategory.EXTENSION
                );
            }
        }
    },
    {
        id: 'aleph0.hackerTasksPanel.stopAll',
        handler: deps => async () => {
            try {
                // Terminate all running tasks
                await vscode.commands.executeCommand('workbench.action.tasks.terminate');
                vscode.window.showInformationMessage('⏹️ All tasks stopped');
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'hackerTasksPanel.stopAll',
                    LogCategory.EXTENSION
                );
            }
        }
    },
    // Hacker Status Bar Commands
    {
        id: 'aleph0.statusBar.animate',
        handler: deps => async () => {
            try {
                if (deps.getContext()?.hackerStatusBarManager) {
                    deps.getContext()!.hackerStatusBarManager.animateButtons();
                    deps.getContext()!.hackerStatusBarManager.showMessage('🚀 Neural Interface Synchronized');
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'statusBar.animate',
                    LogCategory.EXTENSION
                );
            }
        }
    },
    {
        id: 'aleph0.statusBar.toggle',
        handler: deps => async () => {
            try {
                const ctx = deps.getContext();
                if (ctx?.hackerStatusBarManager) {
                    const config = vscode.workspace.getConfiguration(ALEPH0_SECTION);
                    const isVisible = config.get<boolean>(STATUSBAR_VISIBLE_SUBKEY, true);
                    const newVisibility = !isVisible;

                    await config.update(STATUSBAR_VISIBLE_SUBKEY, newVisibility, vscode.ConfigurationTarget.Global);
                    ctx.hackerStatusBarManager.setVisible(newVisibility);

                    vscode.window.showInformationMessage(
                        newVisibility ? '🚀 Hacker Status Bar Enabled' : '💫 Hacker Status Bar Disabled'
                    );
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'statusBar.toggle',
                    LogCategory.EXTENSION
                );
            }
        }
    }
];
