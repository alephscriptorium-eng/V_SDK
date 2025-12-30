/**
 * WISH-03: Métricas de Uso en Panel
 * WebView panel for displaying Copilot usage metrics
 */

import * as vscode from 'vscode';
import { getCopilotLogExporterService } from './CopilotLogExporterService';
import { CopilotUsageMetrics, ContextBloatAnalysis } from './types';

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

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.extensionUri]
        };

        // Handle messages from the webview (e.g., refresh button)
        webviewView.webview.onDidReceiveMessage(async (message) => {
            if (message.command === 'refresh') {
                await this.refresh();
            }
        });

        this.updateContent();
    }

    /**
     * Refresh the panel content
     */
    async refresh(): Promise<void> {
        if (this._view) {
            await this.updateContent();
        }
    }

    /**
     * Update the webview content
     */
    private async updateContent(): Promise<void> {
        if (!this._view) return;

        try {
            await this.logService.refresh();
            const metrics = await this.logService.getUsageMetrics();
            const analysis = await this.logService.analyzeSession();
            const diagnostics = this.logService.getDiagnostics();

            this._view.webview.html = this.getHtml(metrics, analysis, diagnostics);
        } catch (error) {
            this._view.webview.html = this.getErrorHtml(error);
        }
    }

    /**
     * Generate HTML for the metrics panel
     */
    private getHtml(
        metrics: CopilotUsageMetrics,
        analysis: ContextBloatAnalysis,
        diagnostics: { logPath: string; lastScan: Date | null; requestCount: number; sessionCount: number }
    ): string {
        const statusColors = {
            optimal: '#4caf50',
            acceptable: '#8bc34a',
            warning: '#ff9800',
            critical: '#f44336'
        };

        const statusColor = statusColors[analysis.status];
        const cacheRateColor = analysis.cacheHitRate > 0.7 ? '#4caf50' : 
                              analysis.cacheHitRate > 0.5 ? '#ff9800' : '#f44336';

        // Generate hourly chart bars
        const maxHourly = Math.max(...metrics.hourlyDistribution, 1);
        const hourlyBars = metrics.hourlyDistribution.map((count, hour) => {
            const height = (count / maxHourly) * 100;
            return `<div class="bar" style="height: ${height}%" title="${hour}:00 - ${count} requests"></div>`;
        }).join('');

        // Generate model breakdown
        const modelRows = Array.from(metrics.byModel.entries()).map(([model, data]) => `
            <tr>
                <td>${model}</td>
                <td>${data.requests}</td>
                <td>${this.formatNumber(data.tokens)}</td>
                <td>${(data.avgDuration / 1000).toFixed(1)}s</td>
            </tr>
        `).join('');

        // Generate issues list
        const issueItems = analysis.issues.map(issue => {
            const icon = issue.severity === 'error' ? '🔴' : 
                        issue.severity === 'warning' ? '🟠' : '🔵';
            return `<li>${icon} ${issue.message}</li>`;
        }).join('') || '<li>✅ No issues detected</li>';

        // Generate recommendations
        const recommendationItems = analysis.recommendations.map(r => 
            `<li>${r}</li>`
        ).join('') || '<li>No recommendations at this time</li>';

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Copilot Metrics</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            padding: 10px;
            color: var(--vscode-foreground);
            background: var(--vscode-editor-background);
        }
        .metric-card {
            background: var(--vscode-editor-inactiveSelectionBackground);
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 12px;
        }
        .metric-card h3 {
            margin: 0 0 8px 0;
            font-size: 12px;
            text-transform: uppercase;
            opacity: 0.7;
        }
        .metric-value {
            font-size: 24px;
            font-weight: bold;
        }
        .metric-subtitle {
            font-size: 11px;
            opacity: 0.6;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            color: white;
        }
        .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        .chart-container {
            height: 60px;
            display: flex;
            align-items: flex-end;
            gap: 2px;
        }
        .bar {
            flex: 1;
            background: var(--vscode-button-background);
            min-height: 2px;
            border-radius: 2px 2px 0 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
        }
        th, td {
            text-align: left;
            padding: 6px 8px;
            border-bottom: 1px solid var(--vscode-widget-border);
        }
        th {
            opacity: 0.7;
            font-weight: normal;
        }
        ul {
            margin: 0;
            padding-left: 20px;
        }
        li {
            margin: 4px 0;
            font-size: 12px;
        }
        .section-title {
            font-size: 14px;
            font-weight: bold;
            margin: 16px 0 8px 0;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .refresh-btn {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        }
        .refresh-btn:hover {
            background: var(--vscode-button-hoverBackground);
        }
        .diagnostics {
            font-size: 10px;
            opacity: 0.5;
            margin-top: 16px;
        }
    </style>
</head>
<body>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h2 style="margin: 0;">📊 Copilot Metrics</h2>
        <button class="refresh-btn" onclick="refresh()">↻ Refresh</button>
    </div>

    <!-- Health Score -->
    <div class="metric-card">
        <h3>Context Health</h3>
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div class="metric-value" style="color: ${statusColor}">${analysis.healthScore}/100</div>
            <span class="status-badge" style="background: ${statusColor}">${analysis.status.toUpperCase()}</span>
        </div>
        <div class="metric-subtitle">Token trend: ${analysis.tokenTrend}</div>
    </div>

    <!-- Key Metrics Grid -->
    <div class="grid-2">
        <div class="metric-card">
            <h3>Requests (24h)</h3>
            <div class="metric-value">${metrics.totalRequests}</div>
            <div class="metric-subtitle">${diagnostics.sessionCount} sessions</div>
        </div>
        <div class="metric-card">
            <h3>Cache Hit Rate</h3>
            <div class="metric-value" style="color: ${cacheRateColor}">${(metrics.cacheHitRate * 100).toFixed(1)}%</div>
            <div class="metric-subtitle">${this.formatNumber(metrics.totalCachedTokens)} cached</div>
        </div>
        <div class="metric-card">
            <h3>Total Tokens</h3>
            <div class="metric-value">${this.formatNumber(metrics.totalTokens)}</div>
            <div class="metric-subtitle">Avg: ${this.formatNumber(Math.round(metrics.totalTokens / Math.max(1, metrics.totalRequests)))}/req</div>
        </div>
        <div class="metric-card">
            <h3>Avg Response</h3>
            <div class="metric-value">${(metrics.avgResponseTime / 1000).toFixed(1)}s</div>
            <div class="metric-subtitle">per request</div>
        </div>
    </div>

    <!-- Hourly Distribution -->
    <div class="section-title">📈 Hourly Activity</div>
    <div class="metric-card">
        <div class="chart-container">
            ${hourlyBars}
        </div>
        <div class="metric-subtitle" style="display: flex; justify-content: space-between; margin-top: 4px;">
            <span>00:00</span>
            <span>12:00</span>
            <span>23:00</span>
        </div>
    </div>

    <!-- Model Breakdown -->
    <div class="section-title">🤖 By Model</div>
    <div class="metric-card">
        <table>
            <thead>
                <tr>
                    <th>Model</th>
                    <th>Requests</th>
                    <th>Tokens</th>
                    <th>Avg Time</th>
                </tr>
            </thead>
            <tbody>
                ${modelRows || '<tr><td colspan="4">No data</td></tr>'}
            </tbody>
        </table>
    </div>

    <!-- Issues -->
    <div class="section-title">⚠️ Issues</div>
    <div class="metric-card">
        <ul>${issueItems}</ul>
    </div>

    <!-- Recommendations -->
    <div class="section-title">💡 Recommendations</div>
    <div class="metric-card">
        <ul>${recommendationItems}</ul>
    </div>

    <!-- Diagnostics -->
    <div class="diagnostics">
        Log path: ${diagnostics.logPath}<br>
        Last scan: ${diagnostics.lastScan?.toLocaleString() || 'Never'}<br>
        Total indexed: ${diagnostics.requestCount} requests
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        function refresh() {
            vscode.postMessage({ command: 'refresh' });
        }
    </script>
</body>
</html>`;
    }

    /**
     * Generate error HTML
     */
    private getErrorHtml(error: unknown): string {
        return `<!DOCTYPE html>
<html>
<head>
    <style>
        body { 
            font-family: var(--vscode-font-family);
            padding: 20px;
            color: var(--vscode-errorForeground);
        }
    </style>
</head>
<body>
    <h3>⚠️ Error Loading Metrics</h3>
    <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
    <p>Make sure GitHub Copilot Chat extension is installed and active.</p>
</body>
</html>`;
    }

    /**
     * Format large numbers
     */
    private formatNumber(num: number): string {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }
}
