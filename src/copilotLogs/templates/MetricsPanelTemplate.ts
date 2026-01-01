/**
 * WISH-03 + FEATURE-SNAPSHOTS-1.0.0: Plantilla HTML del Panel de Métricas
 * 
 * Separado del Provider para mejor mantenibilidad
 */

import { CopilotUsageMetrics, ContextBloatAnalysis } from '../types';
import { SnapshotMetadata, CacheStats } from '../types/snapshot.types';

// =============================================================================
// Template Data Types
// =============================================================================

export interface PanelDiagnostics {
    logPath: string;
    lastScan: Date | null;
    requestCount: number;
    sessionCount: number;
}

export interface MetricsPanelData {
    metrics: CopilotUsageMetrics;
    analysis: ContextBloatAnalysis;
    diagnostics: PanelDiagnostics;
    cacheStats: CacheStats;
    snapshots: SnapshotMetadata[];
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Formatear números grandes (1000 -> 1K, 1000000 -> 1M)
 */
export function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

/**
 * Formatear tiempo relativo
 */
export function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'ahora';
    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffHours < 24) return `hace ${diffHours}h`;
    if (diffDays === 1) return 'ayer';
    return `hace ${diffDays} días`;
}

/**
 * Escapar HTML para prevenir XSS
 */
export function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// =============================================================================
// CSS Styles
// =============================================================================

const PANEL_STYLES = `
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
    /* Snapshot styles */
    .snapshot-list {
        max-height: 200px;
        overflow-y: auto;
    }
    .snapshot-item {
        padding: 8px;
        border: 1px solid var(--vscode-widget-border);
        border-radius: 4px;
        margin-bottom: 6px;
    }
    .snapshot-item:hover {
        background: var(--vscode-list-hoverBackground);
    }
    .snapshot-header {
        font-weight: bold;
        font-size: 12px;
    }
    .snapshot-name {
        color: var(--vscode-textLink-foreground);
    }
    .snapshot-meta {
        font-size: 10px;
        opacity: 0.7;
        margin: 4px 0;
    }
    .snapshot-actions {
        display: flex;
        gap: 4px;
    }
    .snapshot-actions button {
        background: var(--vscode-button-secondaryBackground);
        color: var(--vscode-button-secondaryForeground);
        border: none;
        padding: 2px 8px;
        border-radius: 3px;
        cursor: pointer;
        font-size: 10px;
    }
    .snapshot-actions button:hover {
        background: var(--vscode-button-secondaryHoverBackground);
    }
    .snapshot-actions button.danger {
        background: transparent;
    }
    .snapshot-actions button.danger:hover {
        background: var(--vscode-inputValidation-errorBackground);
    }
    .snapshot-empty {
        text-align: center;
        opacity: 0.5;
        padding: 12px;
        font-style: italic;
    }
`;

// =============================================================================
// JavaScript (Client-side)
// =============================================================================

const PANEL_SCRIPTS = `
    const vscode = acquireVsCodeApi();
    let isRefreshing = false;
    
    function refresh() {
        if (isRefreshing) return;
        
        const btn = document.querySelector('.refresh-btn');
        btn.textContent = '⏳ Refreshing...';
        btn.disabled = true;
        isRefreshing = true;
        
        vscode.postMessage({ command: 'refresh' });
        
        setTimeout(() => {
            isRefreshing = false;
            btn.textContent = '↻ Refresh';
            btn.disabled = false;
        }, 500);
    }

    function captureSnapshot() {
        vscode.postMessage({ command: 'captureSnapshot' });
    }

    function viewSnapshot(snapshotId) {
        vscode.postMessage({ command: 'viewSnapshot', snapshotId });
    }

    function exportSnapshot(snapshotId) {
        vscode.postMessage({ command: 'exportSnapshot', snapshotId });
    }

    function deleteSnapshot(snapshotId) {
        if (confirm('¿Eliminar este snapshot?')) {
            vscode.postMessage({ command: 'deleteSnapshot', snapshotId });
        }
    }
`;

// =============================================================================
// Section Generators
// =============================================================================

function generateHealthSection(analysis: ContextBloatAnalysis): string {
    const statusColors: Record<string, string> = {
        optimal: '#4caf50',
        acceptable: '#8bc34a',
        warning: '#ff9800',
        critical: '#f44336'
    };
    const statusColor = statusColors[analysis.status];

    return `
    <div class="metric-card">
        <h3>Context Health</h3>
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div class="metric-value" style="color: ${statusColor}">${analysis.healthScore}/100</div>
            <span class="status-badge" style="background: ${statusColor}">${analysis.status.toUpperCase()}</span>
        </div>
        <div class="metric-subtitle">Token trend: ${analysis.tokenTrend}</div>
    </div>`;
}

function generateKeyMetricsGrid(metrics: CopilotUsageMetrics, diagnostics: PanelDiagnostics): string {
    const cacheRateColor = metrics.cacheHitRate > 0.7 ? '#4caf50' : 
                          metrics.cacheHitRate > 0.5 ? '#ff9800' : '#f44336';
    const avgTokens = Math.round(metrics.totalTokens / Math.max(1, metrics.totalRequests));

    return `
    <div class="grid-2">
        <div class="metric-card">
            <h3>Requests (24h)</h3>
            <div class="metric-value">${metrics.totalRequests}</div>
            <div class="metric-subtitle">${diagnostics.sessionCount} sessions</div>
        </div>
        <div class="metric-card">
            <h3>Cache Hit Rate</h3>
            <div class="metric-value" style="color: ${cacheRateColor}">${(metrics.cacheHitRate * 100).toFixed(1)}%</div>
            <div class="metric-subtitle">${formatNumber(metrics.totalCachedTokens)} cached</div>
        </div>
        <div class="metric-card">
            <h3>Total Tokens</h3>
            <div class="metric-value">${formatNumber(metrics.totalTokens)}</div>
            <div class="metric-subtitle">Avg: ${formatNumber(avgTokens)}/req</div>
        </div>
        <div class="metric-card">
            <h3>Avg Response</h3>
            <div class="metric-value">${(metrics.avgResponseTime / 1000).toFixed(1)}s</div>
            <div class="metric-subtitle">per request</div>
        </div>
    </div>`;
}

function generateHourlyChart(hourlyDistribution: number[]): string {
    const maxHourly = Math.max(...hourlyDistribution, 1);
    const bars = hourlyDistribution.map((count, hour) => {
        const height = (count / maxHourly) * 100;
        return `<div class="bar" style="height: ${height}%" title="${hour}:00 - ${count} requests"></div>`;
    }).join('');

    return `
    <div class="section-title">📈 Hourly Activity</div>
    <div class="metric-card">
        <div class="chart-container">${bars}</div>
        <div class="metric-subtitle" style="display: flex; justify-content: space-between; margin-top: 4px;">
            <span>00:00</span>
            <span>12:00</span>
            <span>23:00</span>
        </div>
    </div>`;
}

function generateModelTable(byModel: Map<string, { requests: number; tokens: number; avgDuration: number }>): string {
    const rows = Array.from(byModel.entries()).map(([model, data]) => `
        <tr>
            <td>${model}</td>
            <td>${data.requests}</td>
            <td>${formatNumber(data.tokens)}</td>
            <td>${(data.avgDuration / 1000).toFixed(1)}s</td>
        </tr>
    `).join('');

    return `
    <div class="section-title">🤖 By Model</div>
    <div class="metric-card">
        <table>
            <thead>
                <tr><th>Model</th><th>Requests</th><th>Tokens</th><th>Avg Time</th></tr>
            </thead>
            <tbody>${rows || '<tr><td colspan="4">No data</td></tr>'}</tbody>
        </table>
    </div>`;
}

function generateIssuesSection(issues: ContextBloatAnalysis['issues']): string {
    const items = issues.map(issue => {
        const icon = issue.severity === 'error' ? '🔴' : 
                    issue.severity === 'warning' ? '🟠' : '🔵';
        return `<li>${icon} ${issue.message}</li>`;
    }).join('') || '<li>✅ No issues detected</li>';

    return `
    <div class="section-title">⚠️ Issues</div>
    <div class="metric-card"><ul>${items}</ul></div>`;
}

function generateRecommendationsSection(recommendations: string[]): string {
    const items = recommendations.map(r => `<li>${r}</li>`).join('') 
        || '<li>No recommendations at this time</li>';

    return `
    <div class="section-title">💡 Recommendations</div>
    <div class="metric-card"><ul>${items}</ul></div>`;
}

function generateCacheSection(cacheStats: CacheStats): string {
    const recentIds = cacheStats.ids.slice(-3).map(id => `<code>${id}</code>`).join(', ');

    return `
    <div class="section-title">💾 Request Cache</div>
    <div class="metric-card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <span class="metric-value" style="font-size: 18px;">${cacheStats.size}/${cacheStats.maxSize}</span>
                <span class="metric-subtitle"> requests cached</span>
            </div>
            <div class="status-badge" style="background: ${cacheStats.size > 0 ? '#4caf50' : '#666'}">
                ${cacheStats.size > 0 ? 'ACTIVE' : 'EMPTY'}
            </div>
        </div>
        ${cacheStats.ids.length > 0 ? `
        <div class="metric-subtitle" style="margin-top: 8px;">Recent: ${recentIds}</div>
        ` : ''}
    </div>`;
}

function generateSnapshotsSection(snapshots: SnapshotMetadata[], cacheStats: CacheStats): string {
    const lastSnapshot = snapshots.length > 0 ? snapshots[0] : null;
    const timeSinceLastSnapshot = lastSnapshot 
        ? formatTimeAgo(new Date(lastSnapshot.createdAt)) 
        : 'nunca';

    const listItems = snapshots.slice(0, 5).map(s => `
        <div class="snapshot-item">
            <div class="snapshot-header">
                <span class="snapshot-name">📁 ${escapeHtml(s.name)}</span>
            </div>
            <div class="snapshot-meta">
                ${s.requestCount} requests · ${s.models?.join(', ') || 'unknown'} · ${formatTimeAgo(new Date(s.createdAt))}
            </div>
            <div class="snapshot-actions">
                <button onclick="viewSnapshot('${s.id}')">Ver</button>
                <button onclick="exportSnapshot('${s.id}')">Exportar</button>
                <button onclick="deleteSnapshot('${s.id}')" class="danger">🗑️</button>
            </div>
        </div>
    `).join('') || '<div class="snapshot-empty">No hay snapshots guardados</div>';

    return `
    <div class="section-title">📸 Snapshots</div>
    <div class="metric-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div>
                <span class="metric-value" style="font-size: 18px;">${snapshots.length}</span>
                <span class="metric-subtitle"> snapshots guardados</span>
            </div>
            <button class="refresh-btn" onclick="captureSnapshot()">📸 Nuevo</button>
        </div>
        <div class="metric-subtitle" style="margin-bottom: 8px;">
            Último snapshot: ${timeSinceLastSnapshot}
            ${cacheStats.size > 3 ? '<br>⚠️ <em>Recuerda tomar snapshot para conservar contexto</em>' : ''}
        </div>
        <div class="snapshot-list">${listItems}</div>
    </div>`;
}

function generateDiagnosticsSection(diagnostics: PanelDiagnostics): string {
    return `
    <div class="section-title">🔧 Diagnostics</div>
    <div class="metric-card diagnostics" style="opacity: 1; font-size: 11px;">
        <div><strong>Log path:</strong> ${diagnostics.logPath}</div>
        <div><strong>Last scan:</strong> ${diagnostics.lastScan?.toLocaleString() || 'Never'}</div>
        <div><strong>Indexed:</strong> ${diagnostics.requestCount} requests in ${diagnostics.sessionCount} sessions</div>
        <div><strong>MCP Server:</strong> http://localhost:3100</div>
    </div>`;
}

// =============================================================================
// Main Template Generator
// =============================================================================

/**
 * Genera el HTML completo del panel de métricas
 */
export function generateMetricsPanelHtml(data: MetricsPanelData): string {
    const { metrics, analysis, diagnostics, cacheStats, snapshots } = data;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Copilot Metrics</title>
    <style>${PANEL_STYLES}</style>
</head>
<body>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h2 style="margin: 0;">📊 Copilot Metrics</h2>
        <button class="refresh-btn" onclick="refresh()">↻ Refresh</button>
    </div>

    ${generateHealthSection(analysis)}
    ${generateKeyMetricsGrid(metrics, diagnostics)}
    ${generateHourlyChart(metrics.hourlyDistribution)}
    ${generateModelTable(metrics.byModel)}
    ${generateIssuesSection(analysis.issues)}
    ${generateRecommendationsSection(analysis.recommendations)}
    ${generateCacheSection(cacheStats)}
    ${generateSnapshotsSection(snapshots, cacheStats)}
    ${generateDiagnosticsSection(diagnostics)}

    <script>${PANEL_SCRIPTS}</script>
</body>
</html>`;
}

/**
 * Genera HTML de error
 */
export function generateErrorHtml(error: unknown): string {
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
