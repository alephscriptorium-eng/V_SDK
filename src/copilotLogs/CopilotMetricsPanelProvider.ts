/**
 * WISH-03: Métricas de Uso en Panel
 * WebView panel for displaying Copilot usage metrics
 * 
 * FEATURE-SNAPSHOTS-1.0.0: Añadido minidashboard de snapshots
 * SCRIPT-2.2.0: Añadido Model Selector para Generate Abstract
 * 
 * Refactorizado: Template HTML extraído a templates/MetricsPanelTemplate.ts
 */

import * as vscode from 'vscode';
import { getCopilotLogExporterService } from './CopilotLogExporterService';
import { getCacheStats } from './CcreqDocumentResolver';
import { getSnapshotManager } from './SnapshotManager';
import { getModelConfigService } from './ModelConfigService';
import { PREDEFINED_BACKLOGS } from './types/snapshot.types';
import { 
    generateMetricsPanelHtml, 
    generateErrorHtml,
    MetricsPanelData 
} from './templates/MetricsPanelTemplate';

/**
 * Panel for displaying Copilot usage metrics
 */
export class CopilotMetricsPanelProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'copilotMetrics.panel';

    private _view?: vscode.WebviewView;
    private logService = getCopilotLogExporterService();

    constructor(private readonly extensionUri: vscode.Uri) {}

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void {
        this._view = webviewView;
        console.log('[CopilotMetricsPanel] WebView resolved');

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.extensionUri]
        };

        webviewView.webview.onDidReceiveMessage(
            message => this.handleMessage(message)
        );

        this.updateContent().catch(err => {
            console.error('[CopilotMetricsPanel] Initial load error:', err);
        });
    }

    // =========================================================================
    // Message Handler
    // =========================================================================

    private async handleMessage(message: { command: string; [key: string]: unknown }): Promise<void> {
        console.log('[CopilotMetricsPanel] Message received:', message);
        
        switch (message.command) {
            case 'refresh':
                await this.refresh();
                break;
            case 'captureSnapshot':
                await this.handleCaptureSnapshot(
                    message.name as string | undefined, 
                    message.description as string | undefined
                );
                break;
            case 'viewSnapshot':
                await this.handleViewSnapshot(message.snapshotId as string);
                break;
            case 'exportSnapshot':
                await this.handleExportSnapshot(message.snapshotId as string);
                break;
            case 'deleteSnapshot':
                await this.handleDeleteSnapshot(message.snapshotId as string);
                break;
            case 'generateAbstract':
                await this.handleGenerateAbstract(message.modelId as string | undefined);
                break;
        }
    }

    /**
     * Refresh the panel content
     */
    async refresh(): Promise<void> {
        console.log('[CopilotMetricsPanel] Refresh requested');
        if (this._view) {
            await this.updateContent();
            console.log('[CopilotMetricsPanel] Refresh completed');
        }
    }

    // =========================================================================
    // Snapshot handlers (FEATURE-SNAPSHOTS-1.0.0)
    // =========================================================================

    private async handleCaptureSnapshot(name?: string, description?: string): Promise<void> {
        // 1. Pedir nombre (requerido)
        if (!name) {
            name = await vscode.window.showInputBox({
                prompt: '💾 Nombre del snapshot',
                placeHolder: 'ej: debugging-mcp-server',
                validateInput: v => v?.trim() ? null : 'El nombre es requerido'
            });
            if (!name) return;
        }

        // 2. Pedir descripción (opcional)
        if (description === undefined) {
            description = await vscode.window.showInputBox({
                prompt: '📝 Descripción (opcional)',
                placeHolder: 'ej: Investigando bug en cache de requests'
            }) || undefined;
        }

        // 3. Vincular a backlog (QuickPick)
        const selectedBacklog = await vscode.window.showQuickPick(PREDEFINED_BACKLOGS, {
            placeHolder: '🔗 Vincular a backlog (opcional)'
        });

        let linkedBacklog: string | undefined;
        if (selectedBacklog?.value === '__custom__') {
            linkedBacklog = await vscode.window.showInputBox({
                prompt: 'ID del backlog',
                placeHolder: 'ej: SCRIPT-2.1.1'
            }) || undefined;
        } else {
            linkedBacklog = selectedBacklog?.value;
        }

        const snapshotManager = getSnapshotManager();
        const result = await snapshotManager.captureSnapshot({ name, description, linkedBacklog });
        
        if (result.success) {
            vscode.window.showInformationMessage(`✅ Snapshot guardado: ${result.snapshotId}`);
            await this.refresh();
        } else {
            vscode.window.showErrorMessage(`Error: ${result.error}`);
        }
    }

    private async handleViewSnapshot(snapshotId: string): Promise<void> {
        const snapshotManager = getSnapshotManager();
        const snapshot = await snapshotManager.getSnapshot(snapshotId);
        if (snapshot) {
            const doc = await vscode.workspace.openTextDocument({
                content: JSON.stringify(snapshot, null, 2),
                language: 'json'
            });
            await vscode.window.showTextDocument(doc);
        }
    }

    private async handleExportSnapshot(snapshotId: string): Promise<void> {
        const snapshotManager = getSnapshotManager();
        const mdPath = await snapshotManager.exportToMarkdown(snapshotId);
        if (mdPath) {
            const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(mdPath));
            await vscode.window.showTextDocument(doc);
        }
    }

    private async handleDeleteSnapshot(snapshotId: string): Promise<void> {
        const confirm = await vscode.window.showWarningMessage(
            `¿Eliminar snapshot "${snapshotId}"?`,
            { modal: true },
            'Eliminar'
        );
        if (confirm === 'Eliminar') {
            const snapshotManager = getSnapshotManager();
            const deleted = await snapshotManager.deleteSnapshot(snapshotId);
            if (deleted) {
                vscode.window.showInformationMessage('Snapshot eliminado');
                await this.refresh();
            }
        }
    }

    // =========================================================================
    // Generate Abstract handler (SCRIPT-2.2.0)
    // =========================================================================

    private async handleGenerateAbstract(modelId?: string): Promise<void> {
        try {
            vscode.window.showInformationMessage(
                `🤖 Generating abstract${modelId ? ` with ${modelId}` : ''}...`
            );

            const snapshotManager = getSnapshotManager();
            const abstractPath = await snapshotManager.generateAbstract(modelId);

            if (abstractPath) {
                vscode.window.showInformationMessage('✅ Abstract generated successfully!');
                const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(abstractPath));
                await vscode.window.showTextDocument(doc);
            } else {
                vscode.window.showWarningMessage('No snapshots available to generate abstract.');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Error generating abstract: ${error}`);
        } finally {
            await this.refresh();
        }
    }

    // =========================================================================
    // Content Update
    // =========================================================================

    private async updateContent(): Promise<void> {
        if (!this._view) return;

        try {
            console.log('[CopilotMetricsPanel] Refreshing log service...');
            await this.logService.refresh();
            
            console.log('[CopilotMetricsPanel] Getting metrics...');
            const metrics = await this.logService.getUsageMetrics();
            const analysis = await this.logService.analyzeSession();
            const diagnostics = this.logService.getDiagnostics();
            const cacheStats = getCacheStats();
            
            const snapshotManager = getSnapshotManager();
            const snapshots = await snapshotManager.listSnapshots();

            // SCRIPT-2.2.0: Get available models and enrich with log data
            const modelConfigService = getModelConfigService();
            modelConfigService.enrichWithHistoricalModels(metrics);
            const availableModels = modelConfigService.getAvailableModels();
            const defaultModel = modelConfigService.getDefaultModel();
            
            console.log(`[CopilotMetricsPanel] Data loaded: ${diagnostics.requestCount} requests, ${cacheStats.size} cached, ${snapshots.length} snapshots, ${availableModels.length} models`);

            const data: MetricsPanelData = {
                metrics,
                analysis,
                diagnostics,
                cacheStats,
                snapshots,
                availableModels,
                defaultModelId: defaultModel?.id
            };

            this._view.webview.html = generateMetricsPanelHtml(data);
        } catch (error) {
            console.error('[CopilotMetricsPanel] Error:', error);
            this._view.webview.html = generateErrorHtml(error);
        }
    }
}
