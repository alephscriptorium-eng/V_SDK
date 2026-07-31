/**
 * WP-V80 · DATOS — tabla de comandos de analytics.
 * Handlers transcritos literalmente del monolito:
 * `this.extensionContext` → `ctx = deps.getContext()` ·
 * `this.generateAnalyticsDashboard` → `generateAnalyticsDashboard` (módulo de datos).
 */
import * as vscode from 'vscode';
import { AnalyticsEventType } from '../../analyticsService';
import { generateAnalyticsDashboard } from '../analyticsDashboardHtml';
import { CommandEntry } from './types';

export const analyticsCommands: CommandEntry[] = [
    // Analytics Commands
    {
        id: 'aleph0.analytics.showDashboard',
        handler: deps => async () => {
            const ctx = deps.getContext();
            if (!ctx) return;

            const tracker = ctx.managers.analytics.startTracking('analytics_dashboard_open');
            try {
                const aggregation = await ctx.managers.analytics.getAnalyticsAggregation();

                const panel = vscode.window.createWebviewPanel(
                    'analytics-dashboard',
                    'AlephScript Analytics',
                    vscode.ViewColumn.One,
                    { enableScripts: true }
                );

                panel.webview.html = generateAnalyticsDashboard(aggregation);

                await ctx.managers.analytics.trackEvent(
                    AnalyticsEventType.WEBVIEW_OPENED,
                    'analytics',
                    { webview_type: 'analytics_dashboard' }
                );

                await tracker(true);
            } catch (error) {
                await tracker(false, (error as Error).message);
                throw error;
            }
        }
    },
    {
        id: 'aleph0.analytics.export',
        handler: deps => async () => {
            const ctx = deps.getContext();
            if (!ctx) return;

            const tracker = ctx.managers.analytics.startTracking('analytics_export');
            try {
                const exportData = await ctx.managers.analytics.exportAnalytics();

                const uri = await vscode.window.showSaveDialog({
                    defaultUri: vscode.Uri.file(`alephscript-analytics-${Date.now()}.json`),
                    filters: { 'JSON Files': ['json'] }
                });

                if (uri) {
                    await vscode.workspace.fs.writeFile(uri, Buffer.from(exportData, 'utf8'));
                    vscode.window.showInformationMessage(`Analytics exported to ${uri.fsPath}`);

                    await ctx.managers.analytics.trackEvent(
                        AnalyticsEventType.USER_INTERACTION,
                        'analytics',
                        { action: 'export', file_path: uri.fsPath }
                    );

                    await tracker(true);
                } else {
                    await tracker(false, 'Export cancelled');
                }
            } catch (error) {
                await tracker(false, (error as Error).message);
                throw error;
            }
        }
    },
    {
        id: 'aleph0.analytics.clear',
        handler: deps => async () => {
            const ctx = deps.getContext();
            if (!ctx) return;

            const tracker = ctx.managers.analytics.startTracking('analytics_clear');
            try {
                const confirmation = await vscode.window.showWarningMessage(
                    'Are you sure you want to clear all analytics data?',
                    { modal: true },
                    'Yes, Clear Data'
                );

                if (confirmation === 'Yes, Clear Data') {
                    await ctx.managers.analytics.clearAnalytics();
                    vscode.window.showInformationMessage('Analytics data cleared successfully');

                    await ctx.managers.analytics.trackEvent(
                        AnalyticsEventType.USER_INTERACTION,
                        'analytics',
                        { action: 'clear_data' }
                    );

                    await tracker(true);
                } else {
                    await tracker(false, 'Clear cancelled');
                }
            } catch (error) {
                await tracker(false, (error as Error).message);
                throw error;
            }
        }
    }
];
