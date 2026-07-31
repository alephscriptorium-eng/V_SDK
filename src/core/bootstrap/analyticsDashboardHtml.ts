/**
 * WP-V80 · DATOS — plantilla HTML del dashboard de analytics.
 * Movida literal desde `extensionBootstrap.generateAnalyticsDashboard`.
 *
 * WP-V66: CSP del helper único (`default-src 'none'` + estilo con nonce),
 * cero `style=` inline (las barras de uso usan clases generadas en el
 * bloque de estilo con nonce) y datos interpolados con escape.
 */
import { buildCspMeta, createNonce, escapeHtml } from '../../webview/security';

/** Ancho saneado 0-100 para las barras de uso (nunca texto del dato). */
function usageWidth(percentage: unknown): number {
    const n = Number(percentage);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, n));
}

export function generateAnalyticsDashboard(aggregation: any): string {
    const nonce = createNonce();
    const commands: any[] = aggregation.most_used_commands;
    const usageBarCss = commands
        .map((cmd: any, i: number) => `.usage-fill-${i} { width: ${usageWidth(cmd.percentage)}%; }`)
        .join('\n            ');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>AlephScript Analytics</title>
        ${buildCspMeta({ styleNonce: nonce })}
        <style nonce="${nonce}">
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0; padding: 20px; background: #1e1e1e; color: #d4d4d4;
            }
            .header { margin-bottom: 30px; }
            .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
            .metric-card {
                background: #2d2d30; border-radius: 8px; padding: 20px; border: 1px solid #404040;
            }
            .metric-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #4fc1ff; }
            .metric-value { font-size: 32px; font-weight: bold; margin-bottom: 10px; }
            .metric-list { list-style: none; padding: 0; margin: 0; }
            .metric-list li {
                display: flex; justify-content: space-between; padding: 8px 0;
                border-bottom: 1px solid #404040;
            }
            .metric-list li:last-child { border-bottom: none; }
            .usage-bar {
                background: #404040; height: 8px; border-radius: 4px; margin-top: 5px;
            }
            .usage-fill {
                background: #4fc1ff; height: 100%; border-radius: 4px;
            }
            ${usageBarCss}
            .error-item { color: #ff6b6b; }
            .success-item { color: #51cf66; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🔍 AlephScript Analytics Dashboard</h1>
            <p>Extension usage metrics and performance insights</p>
        </div>

        <div class="metric-grid">
            <div class="metric-card">
                <div class="metric-title">Most Used Commands</div>
                <ul class="metric-list">
                    ${commands.map((cmd: any, i: number) => `
                        <li>
                            <span>${escapeHtml(cmd.command)}</span>
                            <span>${escapeHtml(cmd.count)} uses (${escapeHtml(cmd.percentage)}%)</span>
                        </li>
                        <div class="usage-bar">
                            <div class="usage-fill usage-fill-${i}"></div>
                        </div>
                    `).join('')}
                </ul>
            </div>

            <div class="metric-card">
                <div class="metric-title">WebView Usage</div>
                <ul class="metric-list">
                    ${aggregation.most_opened_webviews.map((wv: any) => `
                        <li>
                            <span>${escapeHtml(wv.webview)}</span>
                            <span>${escapeHtml(wv.count)} opens (${escapeHtml(wv.avg_duration)}ms avg)</span>
                        </li>
                    `).join('')}
                </ul>
            </div>

            <div class="metric-card">
                <div class="metric-title">Performance Metrics</div>
                <ul class="metric-list">
                    <li><span>Avg Startup Time</span><span class="success-item">${escapeHtml(aggregation.performance_summary.avg_startup_time)}ms</span></li>
                    <li><span>Avg Command Time</span><span class="success-item">${escapeHtml(aggregation.performance_summary.avg_command_execution_time)}ms</span></li>
                    <li><span>Memory Usage Trend</span><span>${escapeHtml(aggregation.performance_summary.memory_usage_trend.length)} samples</span></li>
                </ul>
            </div>

            <div class="metric-card">
                <div class="metric-title">Error Summary</div>
                <ul class="metric-list">
                    ${aggregation.error_frequency.map((err: any) => `
                        <li class="error-item">
                            <span>${escapeHtml(err.error_type)}</span>
                            <span>${escapeHtml(err.count)} occurrences</span>
                        </li>
                    `).join('')}
                </ul>
            </div>

            <div class="metric-card">
                <div class="metric-title">Usage Patterns</div>
                <ul class="metric-list">
                    <li><span>Peak Hours</span><span>${escapeHtml(aggregation.usage_patterns.peak_usage_hours.join(', '))}</span></li>
                    <li><span>Active Days</span><span>${escapeHtml(aggregation.usage_patterns.most_active_days.join(', '))}</span></li>
                    <li><span>Session Duration</span><span>${Math.round(aggregation.usage_patterns.session_duration_avg / 1000)}s</span></li>
                </ul>
            </div>

            <div class="metric-card">
                <div class="metric-title">Slowest Operations</div>
                <ul class="metric-list">
                    ${aggregation.performance_summary.slowest_operations.slice(0, 5).map((op: any) => `
                        <li>
                            <span>${escapeHtml(op.operation)}</span>
                            <span>${escapeHtml(op.avg_duration)}ms</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        </div>
    </body>
    </html>
    `;
}
