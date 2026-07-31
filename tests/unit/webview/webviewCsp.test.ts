/**
 * WP-V66 · CSP de webviews — test DE FACTO sobre el HTML generado.
 *
 * Dos cercos:
 *
 * 1. CENSO CERRADO: se escanea `src/` en busca de productores/asignadores
 *    de HTML de webview. Un fichero que produzca webview fuera del censo
 *    pone la suite en ROJO (así, añadir un webview sin pasar por aquí
 *    — y por el helper de CSP — no puede entrar en verde).
 *
 * 2. INVARIANTES POR RENDER, para CADA productor del censo:
 *    - meta CSP presente, arrancando en `default-src 'none'`
 *    - cero `unsafe-inline` / `unsafe-eval` en TODO el documento
 *    - cero orígenes http:/https: externos en la CSP (solo peers locales)
 *    - cero handlers inline (`onclick=` etc.) y cero atributos `style="`
 *    - todo `<script>`/`<style>` lleva el nonce de la CSP
 *    - nonce presente y DISTINTO entre renders (criptográfico por render)
 */
import * as fs from 'fs';
import * as path from 'path';

// El panel de tasks arrastra el catálogo del launcher (cliente MCP real);
// aquí solo se verifica el HTML, así que se sustituye por un doble mínimo.
jest.mock('../../../src/launcher/CatalogService', () => ({
    CatalogService: {
        getInstance: jest.fn().mockReturnValue({
            onDidChange: jest.fn().mockReturnValue({ dispose: jest.fn() }),
            getSnapshot: jest.fn().mockReturnValue({ status: 'pending_settings', servers: [] }),
            refresh: jest.fn()
        })
    }
}));

import {
    buildCspContent,
    buildCspMeta,
    createNonce,
    escapeHtml,
    hasCspMeta,
    isLocalOrigin,
    requireLocalOrigin
} from '../../../src/webview/security';
import { renderInertExternalPage } from '../../../src/webview/commonPages';
import {
    renderAgentValidationPage,
    renderAiCodeAnalysisPage,
    renderAiResponsePage,
    renderAiStatsPage,
    renderAiWorkflowPage,
    renderWebviewDashboardPage
} from '../../../src/webview/bootstrapPages';
import { generateAnalyticsDashboard } from '../../../src/core/bootstrap/analyticsDashboardHtml';
import { renderAnalyticsSummaryPage } from '../../../src/core/analyticsService';
import { renderCommandDashboardPage } from '../../../src/commandPaletteManager';
import { renderMcpManagerPage } from '../../../src/mcpServerManager';
import { renderUiManagerPage } from '../../../src/uiManager';
import { renderSocketMonitorPage } from '../../../src/socketMonitor';
import { renderMcpWebViewPage } from '../../../src/mcpWebViewManager';
import {
    renderLocalIframePage,
    renderWebviewErrorPage,
    renderWebviewPlaceholderPage,
    WebViewManager
} from '../../../src/webViewManager';
import { HackerCommandPanelProvider } from '../../../src/views/HackerCommandPanelProvider';
import { HackerConfigPanelProvider } from '../../../src/views/HackerConfigPanelProvider';
import { HackerControlPanelProvider } from '../../../src/views/HackerControlPanelProvider';
import { HackerTasksPanelProvider } from '../../../src/views/HackerTasksPanelProvider';
import { TeatroWebViewProvider } from '../../../src/views/TeatroWebViewProvider';
import { AgentConfigEditorProvider } from '../../../src/editors/AgentConfigEditorProvider';
import { AgentContentEditorProvider } from '../../../src/editors/AgentContentEditorProvider';

// ---------------------------------------------------------------------------
// Fakes mínimos (estructurales) para renderizar fuera del Extension Host
// ---------------------------------------------------------------------------

const FAKE_CSP_SOURCE = 'vscode-resource:';

const fakeWebview: any = {
    cspSource: FAKE_CSP_SOURCE,
    asWebviewUri: (uri: any) => `vscode-resource:${(uri && (uri.path || uri.fsPath)) || ''}`,
    html: '',
    postMessage: jest.fn(),
    onDidReceiveMessage: jest.fn()
};

const fakeUri: any = { path: '/ext', fsPath: '/ext' };

function makeFakeContext(): any {
    return {
        subscriptions: [],
        extensionUri: fakeUri,
        extensionPath: '/ext',
        globalState: { get: jest.fn().mockReturnValue(undefined), update: jest.fn() },
        workspaceState: { get: jest.fn(), update: jest.fn() }
    };
}

const fakeConfigDocument: any = {
    getText: () => '{"agentId":"probe-agent"}',
    fileName: '/w/probe.config.json',
    uri: { fsPath: '/w/probe.config.json', toString: () => 'file:///w/probe.config.json' },
    lineCount: 1
};

const fakeContentDocument: any = {
    getText: () => '---\nname: Probe\n---\n# hola',
    fileName: '/w/probe.agent.md',
    uri: { fsPath: '/w/probe.agent.md', toString: () => 'file:///w/probe.agent.md' },
    lineCount: 4
};

const aggregationFixture = {
    most_used_commands: [{ command: 'x<b>', count: 3, percentage: 60 }],
    most_opened_webviews: [{ webview: 'panel', count: 2, avg_duration: 12 }],
    performance_summary: {
        avg_startup_time: 5,
        avg_command_execution_time: 7,
        memory_usage_trend: [1, 2],
        slowest_operations: [{ operation: 'op', avg_duration: 9 }]
    },
    error_frequency: [{ error_type: 'E', count: 1 }],
    usage_patterns: {
        peak_usage_hours: [9, 10],
        most_active_days: ['mon'],
        session_duration_avg: 60000
    }
};

const aiResponseFixture = {
    confidence: 80,
    content: { message: 'hola <script>alert(1)</script>' },
    metadata: { processing_time: 12 }
};

const aiStatsFixture = {
    total_requests: 5,
    success_rate: 0.8,
    avg_confidence: 0.7,
    avg_processing_time: 30,
    capabilities_used: { chat: 3 }
};

// ---------------------------------------------------------------------------
// CENSO — fuente única: productores (con render) y asignadores (solo consumo)
// ---------------------------------------------------------------------------

interface CensoEntry {
    id: string;
    file: string; // relativo a la raíz del repo
    render: () => string;
}

function hackerPanelRender(ProviderCtor: any): () => string {
    return () => {
        const provider = new ProviderCtor(fakeUri, makeFakeContext());
        return (provider as any).getHtmlContent(fakeWebview);
    };
}

/** PRODUCTORES: cada punto que genera HTML de webview, con su render de facto. */
const PRODUCTORES: CensoEntry[] = [
    { id: 'panel-hacker-command', file: 'src/views/HackerCommandPanelProvider.ts', render: hackerPanelRender(HackerCommandPanelProvider) },
    { id: 'panel-hacker-config', file: 'src/views/HackerConfigPanelProvider.ts', render: hackerPanelRender(HackerConfigPanelProvider) },
    {
        id: 'panel-hacker-control',
        file: 'src/views/HackerControlPanelProvider.ts',
        render: () => {
            WebViewManager.getInstance(makeFakeContext());
            return hackerPanelRender(HackerControlPanelProvider)();
        }
    },
    { id: 'panel-hacker-tasks', file: 'src/views/HackerTasksPanelProvider.ts', render: hackerPanelRender(HackerTasksPanelProvider) },
    { id: 'base-hacker (via 4 paneles)', file: 'src/views/BaseHackerPanelProvider.ts', render: hackerPanelRender(HackerCommandPanelProvider) },
    {
        id: 'teatro-webview',
        file: 'src/views/TeatroWebViewProvider.ts',
        render: () => {
            const p: any = new TeatroWebViewProvider(fakeUri, makeFakeContext(), {} as any);
            return p._getHtmlForWebview(fakeWebview);
        }
    },
    {
        id: 'editor-agent-config',
        file: 'src/editors/AgentConfigEditorProvider.ts',
        render: () => {
            const p: any = new (AgentConfigEditorProvider as any)(makeFakeContext());
            return p.getHtmlForWebview(fakeWebview, fakeConfigDocument);
        }
    },
    {
        id: 'editor-agent-content',
        file: 'src/editors/AgentContentEditorProvider.ts',
        render: () => {
            const p: any = new (AgentContentEditorProvider as any)(makeFakeContext());
            return p.getHtmlForWebview(fakeWebview, fakeContentDocument);
        }
    },
    { id: 'analytics-dashboard (V80)', file: 'src/core/bootstrap/analyticsDashboardHtml.ts', render: () => generateAnalyticsDashboard(aggregationFixture) },
    { id: 'analytics-summary', file: 'src/core/analyticsService.ts', render: () => renderAnalyticsSummaryPage([['Total Events', 3], ['Sesión', 's<x>']]) },
    { id: 'pages-ai-response', file: 'src/webview/bootstrapPages.ts', render: () => renderAiResponsePage(aiResponseFixture) },
    { id: 'pages-ai-code-analysis', file: 'src/webview/bootstrapPages.ts', render: () => renderAiCodeAnalysisPage(aiResponseFixture, 'const a = "<script>"', 'ts') },
    { id: 'pages-ai-workflow', file: 'src/webview/bootstrapPages.ts', render: () => renderAiWorkflowPage(aiResponseFixture) },
    { id: 'pages-ai-stats', file: 'src/webview/bootstrapPages.ts', render: () => renderAiStatsPage(aiStatsFixture) },
    { id: 'pages-agent-validation', file: 'src/webview/bootstrapPages.ts', render: () => renderAgentValidationPage(1, 1, ['✅ ok', '❌ <img src=x onerror=alert(1)>']) },
    { id: 'pages-webview-dashboard', file: 'src/webview/bootstrapPages.ts', render: () => renderWebviewDashboardPage() },
    { id: 'command-palette-dashboard', file: 'src/commandPaletteManager.ts', render: () => renderCommandDashboardPage() },
    { id: 'mcp-server-manager', file: 'src/mcpServerManager.ts', render: () => renderMcpManagerPage() },
    { id: 'ui-manager', file: 'src/uiManager.ts', render: () => renderUiManagerPage() },
    { id: 'socket-monitor', file: 'src/socketMonitor.ts', render: () => renderSocketMonitorPage('http://localhost:3000') },
    { id: 'mcp-webview (iframe local)', file: 'src/mcpWebViewManager.ts', render: () => renderMcpWebViewPage('http://localhost:4200', 'Web Local') },
    { id: 'webview-manager-iframe-local', file: 'src/webViewManager.ts', render: () => renderLocalIframePage('http://127.0.0.1:4201', 'UI Local') },
    { id: 'webview-manager-error', file: 'src/webViewManager.ts', render: () => renderWebviewErrorPage('boom <script>') },
    { id: 'webview-manager-placeholder', file: 'src/webViewManager.ts', render: () => renderWebviewPlaceholderPage('Titulo') },
    { id: 'pagina-inerte-externa', file: 'src/webview/commonPages.ts', render: () => renderInertExternalPage('https://example.com/x', 'Externo') }
];

/**
 * ASIGNADORES: ficheros que asignan `webview.html` o participan del marco
 * pero cuyo HTML procede de un PRODUCTOR del censo (o son el helper mismo).
 */
const ASIGNADORES: string[] = [
    'src/core/bootstrap/commands/aiCommands.ts',           // consume bootstrapPages
    'src/core/bootstrap/commands/agentManagementCommands.ts', // consume bootstrapPages
    'src/core/bootstrap/commands/webviewCommands.ts',      // consume bootstrapPages
    'src/core/bootstrap/commands/analyticsCommands.ts',    // consume analyticsDashboardHtml
    'src/core/bootstrap/commands/teatroCommands.ts',       // reusa TeatroWebViewProvider
    'src/webview/security.ts'                              // helper (meta CSP)
];

const CENSO_FILES = new Set<string>([
    ...PRODUCTORES.map(p => p.file),
    ...ASIGNADORES
]);

// ---------------------------------------------------------------------------
// Utilidades de verificación
// ---------------------------------------------------------------------------

const CSP_META_RE = /<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]*)"/;

function extractCsp(html: string): string {
    const m = html.match(CSP_META_RE);
    expect(m).not.toBeNull();
    return m![1];
}

function extractCspNonces(csp: string): string[] {
    return Array.from(csp.matchAll(/'nonce-([^']+)'/g)).map(m => m[1]);
}

/** Tokens de fuente admitidos en la CSP: nada externo vivo. */
function assertOnlyLocalSources(csp: string): void {
    const tokens = csp
        .split(';')
        .map(d => d.trim())
        .filter(Boolean)
        .flatMap(d => d.split(/\s+/).slice(1)); // descarta el nombre de la directiva
    for (const token of tokens) {
        const ok =
            token === "'none'" ||
            token === "'self'" ||
            /^'nonce-[^']+'$/.test(token) ||
            token === FAKE_CSP_SOURCE ||
            /^https?:\/\/localhost(:\d+)?$/.test(token) ||
            /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(token) ||
            /^https?:\/\/\[::1\](:\d+)?$/.test(token);
        if (!ok) {
            throw new Error(`Fuente no local en CSP: "${token}" (csp: ${csp})`);
        }
    }
}

function verifyCspInvariants(id: string, html: string): void {
    // 1. Meta CSP presente y fail-closed
    const csp = extractCsp(html);
    expect(csp.startsWith("default-src 'none'")).toBe(true);

    // 2. Cero unsafe-inline / unsafe-eval en TODO el documento
    expect(html).not.toMatch(/unsafe-inline/);
    expect(html).not.toMatch(/unsafe-eval/);

    // 3. Cero orígenes externos en la CSP
    assertOnlyLocalSources(csp);

    // 4. Cero handlers inline y cero style= inline (estático o inyectado)
    expect(html).not.toMatch(/\son\w+\s*=\s*["'`\\]/i);
    expect(html).not.toMatch(/\sstyle\s*=\s*["'`\\]/i);

    // 5. Todo <script>/<style> lleva el nonce declarado en la CSP
    const nonces = extractCspNonces(csp);
    for (const tag of html.match(/<script\b[^>]*>/g) ?? []) {
        const m = tag.match(/nonce="([^"]+)"/);
        expect(m).not.toBeNull();
        expect(nonces).toContain(m![1]);
    }
    for (const tag of html.match(/<style\b[^>]*>/g) ?? []) {
        const m = tag.match(/nonce="([^"]+)"/);
        expect(m).not.toBeNull();
        expect(nonces).toContain(m![1]);
    }

    // 6. Nonce presente (criptográfico por render)
    expect(nonces.length).toBeGreaterThan(0);
}

// ---------------------------------------------------------------------------
// 1 · Invariantes de CSP por productor del censo
// ---------------------------------------------------------------------------

describe('WP-V66 · CSP de facto por productor del censo', () => {
    for (const entry of PRODUCTORES) {
        test(`${entry.id} — meta CSP, cero unsafe-inline, cero externos, nonce`, () => {
            const html = entry.render();
            verifyCspInvariants(entry.id, html);
        });

        test(`${entry.id} — nonce distinto entre renders`, () => {
            const a = extractCspNonces(extractCsp(entry.render()));
            const b = extractCspNonces(extractCsp(entry.render()));
            expect(a.length).toBeGreaterThan(0);
            expect(b.length).toBeGreaterThan(0);
            expect(a[0]).not.toEqual(b[0]);
        });
    }
});

// ---------------------------------------------------------------------------
// 2 · Cerco local: iframes solo a peers locales; lo externo queda inerte
// ---------------------------------------------------------------------------

describe('WP-V66 · cerco local-first en iframes', () => {
    test('URL externa en mcpWebViewManager degrada a página inerte (sin iframe, sin ancla viva)', () => {
        const html = renderMcpWebViewPage('https://evil.example.com', 'Externo');
        verifyCspInvariants('mcp-webview-externo', html);
        expect(html).not.toMatch(/<iframe/i);
        expect(html).not.toMatch(/<a\s/i);
        expect(html).not.toMatch(/frame-src/);
    });

    test('URL externa en webViewManager degrada a página inerte', () => {
        const html = renderLocalIframePage('https://evil.example.com', 'Externo');
        verifyCspInvariants('webview-manager-externo', html);
        expect(html).not.toMatch(/<iframe/i);
        expect(html).not.toMatch(/frame-src/);
    });

    test('URL local sí produce frame-src acotado a su origen', () => {
        const html = renderLocalIframePage('http://localhost:4201/app', 'Local');
        const csp = extractCsp(html);
        expect(csp).toMatch(/frame-src http:\/\/localhost:4201/);
    });
});

// ---------------------------------------------------------------------------
// 3 · Helper: fail-closed (el intento de bypass LANZA, no degrada)
// ---------------------------------------------------------------------------

describe('WP-V66 · helper de CSP fail-closed', () => {
    test('createNonce: criptográfico, 22+ chars base64, distinto por llamada', () => {
        const a = createNonce();
        const b = createNonce();
        expect(a).toMatch(/^[A-Za-z0-9+/=]{22,}$/);
        expect(a).not.toEqual(b);
    });

    test('buildCspContent rechaza unsafe-inline colado por cualquier fuente', () => {
        expect(() => buildCspContent({ styleSource: "'unsafe-inline'" })).toThrow();
        expect(() => buildCspContent({ scriptNonce: "x' 'unsafe-inline" })).toThrow();
        expect(() => buildCspContent({ imgSource: "'unsafe-eval'" })).toThrow();
    });

    test('buildCspContent rechaza orígenes externos en frame/connect', () => {
        expect(() => buildCspContent({ frameOrigins: ['https://example.com'] })).toThrow();
        expect(() => buildCspContent({ connectOrigins: ['http://10.0.0.5:3000'] })).toThrow();
        expect(buildCspContent({ frameOrigins: ['http://localhost:4200'] }))
            .toContain('frame-src http://localhost:4200');
    });

    test('requireLocalOrigin / isLocalOrigin: solo peers locales', () => {
        expect(isLocalOrigin('http://localhost:3000')).toBe(true);
        expect(isLocalOrigin('http://127.0.0.1:8080/x')).toBe(true);
        expect(isLocalOrigin('https://example.com')).toBe(false);
        expect(isLocalOrigin('file:///etc/passwd')).toBe(false);
        expect(isLocalOrigin('javascript:alert(1)')).toBe(false);
        expect(isLocalOrigin('http://localhost.evil.com')).toBe(false);
        expect(() => requireLocalOrigin('https://example.com')).toThrow();
    });

    test('buildCspMeta emite default-src none como base', () => {
        expect(buildCspMeta({})).toContain(`content="default-src 'none';"`);
    });

    test('hasCspMeta detecta la ausencia de CSP (guarda de HTML de disco)', () => {
        expect(hasCspMeta('<html><head></head></html>')).toBe(false);
        expect(hasCspMeta(buildCspMeta({}))).toBe(true);
    });

    test('escapeHtml neutraliza los cinco metacaracteres', () => {
        expect(escapeHtml(`<script>"'&`)).toBe('&lt;script&gt;&quot;&#39;&amp;');
    });
});

// ---------------------------------------------------------------------------
// 4 · Censo cerrado: webview fuera del censo = ROJO
// ---------------------------------------------------------------------------

describe('WP-V66 · censo cerrado de productores de webview', () => {
    const SRC_ROOT = path.resolve(__dirname, '../../../src');
    const REPO_ROOT = path.resolve(__dirname, '../../..');

    function listTsFiles(dir: string): string[] {
        const out: string[] = [];
        for (const name of fs.readdirSync(dir)) {
            const full = path.join(dir, name);
            const stat = fs.statSync(full);
            if (stat.isDirectory()) {
                out.push(...listTsFiles(full));
            } else if (name.endsWith('.ts') && !name.endsWith('.d.ts')) {
                out.push(full);
            }
        }
        return out;
    }

    const WEBVIEW_SIGNAL = /webview\.html\s*=|<!DOCTYPE html|<html[\s>]/i;

    test('todo fichero de src/ que produce o asigna HTML de webview está en el censo', () => {
        const fueraDeCenso: string[] = [];
        for (const file of listTsFiles(SRC_ROOT)) {
            const rel = path.relative(REPO_ROOT, file).replace(/\\/g, '/');
            const content = fs.readFileSync(file, 'utf8');
            if (WEBVIEW_SIGNAL.test(content) && !CENSO_FILES.has(rel)) {
                fueraDeCenso.push(rel);
            }
        }
        expect(fueraDeCenso).toEqual([]);
    });

    test('el censo no lista ficheros muertos (todo censado sigue existiendo y produciendo)', () => {
        for (const rel of CENSO_FILES) {
            const full = path.join(REPO_ROOT, rel);
            expect(fs.existsSync(full)).toBe(true);
        }
    });
});
