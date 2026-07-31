/**
 * WP-V66 · Páginas de webview de los comandos del bootstrap.
 *
 * Las tablas de comandos (WP-V80 · DATOS) conservan su registro
 * (`id` + flujo del handler); el HTML que antes vivía inline como dato
 * pasa aquí como funciones puras de render — testeables de facto y con
 * CSP del helper único (`src/webview/security.ts`).
 *
 * Ninguna de estas páginas ejecuta scripts: CSP sin `script-src` y los
 * paneles se crean con `enableScripts: false`.
 */
import { buildCspMeta, createNonce, escapeHtml } from './security';

/** Confianza → clase (nada de colores interpolados en atributos style). */
function confidenceClass(confidence: number): string {
    if (confidence > 70) return 'conf-high';
    if (confidence > 40) return 'conf-mid';
    return 'conf-low';
}

const CONFIDENCE_CSS = `
    .conf-high { color: green; }
    .conf-mid { color: orange; }
    .conf-low { color: red; }
`;

/** `aleph0.ai.askAssistant` — respuesta del asistente. */
export function renderAiResponsePage(response: {
    confidence: number;
    content: { message?: string };
    metadata: { processing_time: number };
}): string {
    const nonce = createNonce();
    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            ${buildCspMeta({ styleNonce: nonce })}
            <style nonce="${nonce}">
                body { font-family: Arial, sans-serif; padding: 20px; }
                .response { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0; }
                .metadata { font-size: 0.9em; color: #666; margin-top: 10px; }
                ${CONFIDENCE_CSS}
            </style>
        </head>
        <body>
            <h2>AI Assistant Response</h2>
            <div class="response">
                <h3>Answer:</h3>
                <p>${escapeHtml(response.content.message || 'No response message available')}</p>
                <div class="metadata">
                    <span class="${confidenceClass(response.confidence)}">Confidence: ${Math.round(response.confidence)}%</span> |
                    Processing Time: ${escapeHtml(response.metadata.processing_time)}ms
                </div>
            </div>
        </body>
        </html>`;
}

/** `aleph0.ai.codeAnalysis` — análisis de código. */
export function renderAiCodeAnalysisPage(
    response: {
        confidence: number;
        content: { message?: string; analysis?: { summary?: string } };
        metadata: { processing_time: number };
    },
    code: string,
    language: string
): string {
    const nonce = createNonce();
    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            ${buildCspMeta({ styleNonce: nonce })}
            <style nonce="${nonce}">
                body { font-family: Arial, sans-serif; padding: 20px; }
                .analysis { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }
                .code-block { background: #2d2d30; color: #cccccc; padding: 10px; border-radius: 3px; font-family: monospace; white-space: pre-wrap; }
                .metadata { font-size: 0.9em; color: #666; margin-top: 10px; }
                ${CONFIDENCE_CSS}
            </style>
        </head>
        <body>
            <h2>AI Code Analysis Results</h2>
            <div class="analysis">
                <h3>Analysis:</h3>
                <p>${escapeHtml(response.content.message || response.content.analysis?.summary || 'No analysis available')}</p>
                <div class="metadata">
                    <span class="${confidenceClass(response.confidence)}">Confidence: ${Math.round(response.confidence)}%</span> |
                    Language: ${escapeHtml(language)} |
                    Processing Time: ${escapeHtml(response.metadata.processing_time)}ms
                </div>
            </div>
            <div>
                <h3>Analyzed Code:</h3>
                <div class="code-block">${escapeHtml(code)}</div>
            </div>
        </body>
        </html>`;
}

/** `aleph0.ai.optimizeWorkflow` — sugerencias de optimización. */
export function renderAiWorkflowPage(response: {
    confidence: number;
    content: { message?: string };
    metadata: { processing_time: number };
}): string {
    const nonce = createNonce();
    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            ${buildCspMeta({ styleNonce: nonce })}
            <style nonce="${nonce}">
                body { font-family: Arial, sans-serif; padding: 20px; }
                .optimization { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #28a745; }
                .metadata { font-size: 0.9em; color: #666; margin-top: 10px; }
                ${CONFIDENCE_CSS}
            </style>
        </head>
        <body>
            <h2>AI Workflow Optimization Suggestions</h2>
            <div class="optimization">
                <h3>Optimization Recommendations:</h3>
                <p>${escapeHtml(response.content.message || 'No optimization suggestions available')}</p>
                <div class="metadata">
                    <span class="${confidenceClass(response.confidence)}">Confidence: ${Math.round(response.confidence)}%</span> |
                    Processing Time: ${escapeHtml(response.metadata.processing_time)}ms
                </div>
            </div>
        </body>
        </html>`;
}

/** `aleph0.ai.viewStats` — estadísticas del asistente. */
export function renderAiStatsPage(stats: {
    total_requests: number;
    success_rate: number;
    avg_confidence: number;
    avg_processing_time: number;
    capabilities_used: Record<string, number>;
}): string {
    const nonce = createNonce();
    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            ${buildCspMeta({ styleNonce: nonce })}
            <style nonce="${nonce}">
                body { font-family: Arial, sans-serif; padding: 20px; }
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
                .stat-card { background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #007acc; }
                .stat-title { font-weight: bold; color: #333; margin-bottom: 5px; }
                .stat-value { font-size: 1.2em; color: #007acc; }
                .capabilities { background: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0; }
                .capability-list { list-style-type: none; padding: 0; }
                .capability-list li { background: #b3d9ff; margin: 5px 0; padding: 8px; border-radius: 3px; }
            </style>
        </head>
        <body>
            <h2>AI Assistant Statistics</h2>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-title">Total Requests</div>
                    <div class="stat-value">${escapeHtml(stats.total_requests)}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">Success Rate</div>
                    <div class="stat-value">${Math.round(stats.success_rate * 100)}%</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">Avg Confidence</div>
                    <div class="stat-value">${Math.round(stats.avg_confidence * 100)}%</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">Avg Processing Time</div>
                    <div class="stat-value">${Math.round(stats.avg_processing_time)}ms</div>
                </div>
            </div>

            <div class="capabilities">
                <h3>Capabilities Usage</h3>
                <ul class="capability-list">
                    ${Object.entries(stats.capabilities_used).map(([capability, count]) =>
                        `<li>${escapeHtml(capability)}: ${escapeHtml(count)} uses</li>`
                    ).join('')}
                </ul>
            </div>
        </body>
        </html>`;
}

/** `aleph0.agents.validateAll` — resultados de validación de agentes. */
export function renderAgentValidationPage(
    contentCount: number,
    configCount: number,
    validationResults: string[]
): string {
    const nonce = createNonce();
    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            ${buildCspMeta({ styleNonce: nonce })}
            <style nonce="${nonce}">
                body { font-family: Arial, sans-serif; padding: 20px; }
                .result { margin: 8px 0; padding: 8px; border-radius: 4px; }
                .success { background: #d4edda; color: #155724; }
                .error { background: #f8d7da; color: #721c24; }
            </style>
        </head>
        <body>
            <h2>🎭 Agent Validation Results</h2>
            <p>Found ${escapeHtml(contentCount)} content files and ${escapeHtml(configCount)} config files</p>
            ${validationResults.map(result =>
                `<div class="result ${result.includes('✅') ? 'success' : 'error'}">${escapeHtml(result)}</div>`
            ).join('')}
        </body>
        </html>`;
}

/** `aleph0.webview.showDashboard` — placeholder del gestor de webviews. */
export function renderWebviewDashboardPage(): string {
    const nonce = createNonce();
    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            ${buildCspMeta({ styleNonce: nonce })}
            <style nonce="${nonce}">
                body { font-family: Arial, sans-serif; padding: 20px; }
            </style>
        </head>
        <body>
            <h1>WebView Dashboard</h1>
            <p>WebView management interface</p>
        </body>
        </html>`;
}
