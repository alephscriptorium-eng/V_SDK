/**
 * WP-V66 · Páginas comunes de seguridad de webviews.
 *
 * Cerco v2 (PRACTICAS §2.4, local-first): los webviews solo embeben
 * peers locales; una referencia externa se muestra como sidecar INERTE
 * (texto plano, sin ancla viva, sin iframe, sin scripts).
 */
import { buildCspMeta, createNonce, escapeHtml } from './security';

/** Página inerte para URLs no locales: la referencia se muestra, no se embebe. */
export function renderInertExternalPage(url: string, title: string): string {
    const nonce = createNonce();
    return `<!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            ${buildCspMeta({ styleNonce: nonce })}
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${escapeHtml(title)}</title>
            <style nonce="${nonce}">
                body {
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                    padding: 20px;
                }
                .inert-ref {
                    font-family: var(--vscode-editor-font-family);
                    background: var(--vscode-textCodeBlock-background);
                    padding: 8px 12px;
                    border-radius: 4px;
                    word-break: break-all;
                }
                .note { color: var(--vscode-descriptionForeground); }
            </style>
        </head>
        <body>
            <h2>${escapeHtml(title)}</h2>
            <p class="note">Referencia externa no embebida (cerco local-first).
            El destino se registra como sidecar inerte:</p>
            <p class="inert-ref">${escapeHtml(url)}</p>
            <p class="note">Solo los peers locales del contrato se abren dentro del editor.</p>
        </body>
        </html>`;
}
