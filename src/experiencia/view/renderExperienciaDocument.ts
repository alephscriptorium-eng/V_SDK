/**
 * RH-17 · Documento HTML de la webview experiencia (CSP/nonce existentes).
 * Punto de render puro — censado por WP-V66. Sin Teatro hardcodeado.
 */

import { buildCspMeta, createNonce, escapeHtml } from '../../webview/security';
import type { ExperienciaSnapshot } from '../types';
import type { McpToolDescriptor } from '../../mcp/types';
import { buildExperienciaViewModel } from './experienciaModel';

export interface RenderExperienciaOptions {
    /** `webview.cspSource` de VS Code. */
    readonly cspSource: string;
    /** Nonce criptográfico; si se omite se genera uno. */
    readonly nonce?: string;
    readonly snapshot: ExperienciaSnapshot;
    readonly tools?: readonly McpToolDescriptor[];
    /** Geometría opcional ArgViewScene (no inventada). */
    readonly sceneGeometry?: unknown;
}

const PHASE_CLASS: Record<string, string> = {
    connecting: 'phase-connecting',
    connected: 'phase-connected',
    pending_external_contract: 'phase-external',
    failed: 'phase-failed',
    complete: 'phase-complete'
};

function statusClass(status: string): string {
    switch (status) {
        case 'ok':
            return 'st-ok';
        case 'external':
            return 'st-external';
        case 'error':
            return 'st-error';
        default:
            return 'st-pending';
    }
}

/**
 * Render del documento completo de la webview experiencia H.
 * Fail-closed CSP: default-src 'none' + nonce en script/style.
 */
export function renderExperienciaDocument(opts: RenderExperienciaOptions): string {
    const nonce = opts.nonce ?? createNonce();
    const model = buildExperienciaViewModel(opts.snapshot, opts.sceneGeometry);
    const tools = opts.tools ?? [];
    const phaseClass = PHASE_CLASS[model.phase] ?? 'phase-connecting';

    const surfacesHtml = model.surfaces
        .map(
            (s) => `<div class="row ${statusClass(s.status)}" data-surface="${escapeHtml(s.id)}">
  <span class="lbl">${escapeHtml(s.label)}</span>
  <span class="val">${escapeHtml(s.value)}</span>
</div>`
        )
        .join('\n');

    const pendingHtml =
        model.pendingExternal.length > 0
            ? `<ul class="pending-list">${model.pendingExternal
                  .map((p) => `<li>${escapeHtml(p)}</li>`)
                  .join('')}</ul>`
            : '<p class="muted">sin gaps pending_external en snapshot</p>';

    const toolsHtml =
        tools.length > 0
            ? tools
                  .map(
                      (t) =>
                          `<button type="button" class="tool-btn" data-tool="${escapeHtml(t.name)}" title="${escapeHtml(t.description ?? t.name)}">${escapeHtml(t.name)}</button>`
                  )
                  .join('\n')
            : `<p class="muted">${
                  model.transportPending
                      ? '⏳ tools MCP: transport producto H &lt;pendiente&gt; — no se inventan comandos'
                      : '⏳ sin tools publicados en el server H descubierto'
              }</p>`;

    const escenaBits = [
        `disponible: ${model.escena.disponible ? 'sí' : 'no'}`,
        `sesionId: ${model.escena.sesionId ?? 'null'}`,
        model.escena.argViewSummary
            ? `arg-view-kit: ${model.escena.argViewSummary}`
            : null,
        model.escena.stageStatus
    ]
        .filter(Boolean)
        .map((line) => `<div class="escena-line">${escapeHtml(line as string)}</div>`)
        .join('\n');

    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
${buildCspMeta({ scriptNonce: nonce, styleNonce: nonce, styleSource: opts.cspSource })}
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Experiencia H</title>
<style nonce="${nonce}">
body { font-family: var(--vscode-font-family, system-ui, sans-serif); font-size: 13px; color: var(--vscode-foreground); background: var(--vscode-editor-background); margin: 0; padding: 12px; }
h1 { font-size: 1.1rem; margin: 0 0 8px; font-weight: 600; }
h2 { font-size: 0.95rem; margin: 16px 0 6px; font-weight: 600; }
.phase { display: inline-block; padding: 2px 8px; border-radius: 2px; font-weight: 600; letter-spacing: 0.02em; }
.phase-connecting, .st-pending { background: var(--vscode-editorWarning-background, #5a4a00); }
.phase-connected, .st-ok { background: var(--vscode-testing-iconPassed, #2d5a2d); }
.phase-external, .st-external { background: var(--vscode-editorInfo-background, #0e3a5a); }
.phase-failed, .st-error { background: var(--vscode-inputValidation-errorBackground, #5a1d1d); }
.phase-complete { background: var(--vscode-testing-iconPassed, #1a4d1a); outline: 1px solid var(--vscode-focusBorder); }
.reason { margin: 8px 0; opacity: 0.9; }
.meta { opacity: 0.75; font-size: 0.85em; margin-bottom: 8px; }
.row { display: grid; grid-template-columns: 9em 1fr; gap: 8px; padding: 4px 6px; margin: 2px 0; border-left: 3px solid transparent; }
.row.st-ok { border-left-color: var(--vscode-testing-iconPassed, #3c3); }
.row.st-pending { border-left-color: var(--vscode-editorWarning-foreground, #cc0); }
.row.st-external { border-left-color: var(--vscode-editorInfo-foreground, #4af); }
.row.st-error { border-left-color: var(--vscode-errorForeground, #f44); }
.lbl { opacity: 0.8; }
.val { word-break: break-word; }
.pending-list { margin: 4px 0 0 1.2em; padding: 0; }
.muted { opacity: 0.7; }
.tools { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.tool-btn, .action-btn { font: inherit; color: var(--vscode-button-foreground); background: var(--vscode-button-background); border: none; padding: 4px 10px; cursor: pointer; }
.tool-btn:hover, .action-btn:hover { background: var(--vscode-button-hoverBackground); }
.escena-box { padding: 6px 8px; border: 1px solid var(--vscode-widget-border, #444); margin-top: 4px; }
.actions { margin-top: 12px; display: flex; gap: 8px; }
</style>
</head>
<body>
<header>
  <h1>Experiencia H</h1>
  <div class="phase ${phaseClass}" data-phase="${escapeHtml(model.phase)}">${escapeHtml(model.phase)}</div>
  <p class="reason">${escapeHtml(model.reason)}</p>
  <div class="meta">server: ${escapeHtml(model.serverLabel)} · fresh: ${model.fresh ? 'sí' : 'no'} · ${escapeHtml(model.fetchedAt)}${model.transportPending ? ' · transport &lt;pendiente&gt;' : ''}</div>
</header>

<section>
  <h2>Superficies</h2>
  ${surfacesHtml}
</section>

<section>
  <h2>Escena (delta / arg-view-kit)</h2>
  <div class="escena-box" data-escena-disponible="${model.escena.disponible ? '1' : '0'}">
    ${escenaBits}
  </div>
</section>

<section>
  <h2>pending_external</h2>
  ${pendingHtml}
</section>

<section>
  <h2>Comandos = tools MCP</h2>
  <div class="tools" id="tools">
    ${toolsHtml}
  </div>
</section>

<div class="actions">
  <button type="button" class="action-btn" id="btnRefresh" data-action="refresh">Refresh</button>
</div>

<script nonce="${nonce}">
(function () {
  const vscode = acquireVsCodeApi();
  document.getElementById('btnRefresh').addEventListener('click', function () {
    vscode.postMessage({ command: 'refresh' });
  });
  document.getElementById('tools').addEventListener('click', function (ev) {
    var t = ev.target;
    if (!t || !t.getAttribute) return;
    var name = t.getAttribute('data-tool');
    if (name) {
      vscode.postMessage({ command: 'callTool', tool: name, args: {} });
    }
  });
})();
</script>
</body>
</html>`;
}
