/**
 * WP-V80 · DATOS — tabla de comandos de WebViews genéricas.
 * Handlers transcritos literalmente del monolito (`registerCommands`):
 * `managers.*` → `deps.managers.*`.
 */
import * as vscode from 'vscode';
import { LogCategory } from '../../../loggingManager';
import { CommandEntry } from './types';

export const webviewCommands: CommandEntry[] = [
    {
        id: 'aleph0.webview.showDashboard',
        handler: () => () => {
            const panel = vscode.window.createWebviewPanel(
                'webview-dashboard',
                'WebView Dashboard',
                vscode.ViewColumn.One,
                { enableScripts: true }
            );
            panel.webview.html = '<h1>WebView Dashboard</h1><p>WebView management interface</p>';
        }
    },
    {
        id: 'aleph0.webview.openWebRTC',
        handler: deps => async () => {
            try {
                const config = deps.managers.webView.getWebRTCConfig();
                const webview = await deps.managers.webView.createWebView(config);
                if (webview) {
                    vscode.window.showInformationMessage('WebRTC UI opened successfully');
                } else {
                    vscode.window.showErrorMessage('Failed to open WebRTC UI');
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'webview.openWebRTC',
                    LogCategory.WEBVIEW
                );
            }
        }
    },
    {
        id: 'aleph0.webview.openThreeJS',
        handler: deps => async () => {
            try {
                const config = deps.managers.webView.getThreeJSConfig();
                const webview = await deps.managers.webView.createWebView(config);
                if (webview) {
                    vscode.window.showInformationMessage('ThreeJS UI opened successfully');
                } else {
                    vscode.window.showErrorMessage('Failed to open ThreeJS UI');
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'webview.openThreeJS',
                    LogCategory.WEBVIEW
                );
            }
        }
    },
    {
        id: 'aleph0.webview.openSocket',
        handler: deps => async () => {
            try {
                const config = deps.managers.webView.getSocketWebAppConfig();
                const webview = await deps.managers.webView.createWebView(config);
                if (webview) {
                    vscode.window.showInformationMessage('Socket WebApp opened successfully');
                } else {
                    vscode.window.showErrorMessage('Failed to open Socket WebApp');
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'webview.openSocket',
                    LogCategory.WEBVIEW
                );
            }
        }
    },
    {
        id: 'aleph0.webview.openDriver',
        handler: deps => async () => {
            try {
                const config = deps.managers.webView.getDriverUIConfig();
                const webview = await deps.managers.webView.createWebView(config);
                if (webview) {
                    vscode.window.showInformationMessage('Driver UI opened successfully');
                } else {
                    vscode.window.showErrorMessage('Failed to open Driver UI');
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'webview.openDriver',
                    LogCategory.WEBVIEW
                );
            }
        }
    },
    {
        id: 'aleph0.webview.reloadAll',
        handler: deps => async () => {
            try {
                const webviews = deps.managers.webView.getAllWebViews();
                const reloadPromises = webviews.map((w: any) => deps.managers.webView.reloadWebView(w.id));
                const results = await Promise.all(reloadPromises);
                const successCount = results.filter((r: any) => r).length;
                vscode.window.showInformationMessage(`Reloaded ${successCount} of ${webviews.length} webviews`);
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'webview.reloadAll',
                    LogCategory.WEBVIEW
                );
            }
        }
    }
];
