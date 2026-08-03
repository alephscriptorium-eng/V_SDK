/**
 * RH-17 · Vista experiencia: modelo data-driven + documento CSP + escena tipada.
 */

import { findWebviewHtmlViolations } from '../../../src/webview/security';
import {
    emptyExperienciaSnapshot,
    EXPERIENCIA_RESOURCE_VERSION,
    type ExperienciaSnapshot
} from '../../../src/experiencia/types';
import { buildExperienciaViewModel } from '../../../src/experiencia/view/experienciaModel';
import {
    buildEscenaPanel,
    isArgViewScene,
    summarizeArgViewScene
} from '../../../src/experiencia/view/escenaPanel';
import { renderExperienciaDocument } from '../../../src/experiencia/view/renderExperienciaDocument';

function snapPendingExternal(): ExperienciaSnapshot {
    return {
        phase: 'pending_external_contract',
        reason: '⏳ gaps E/línea/HUB',
        fetchedAt: '2026-08-03T00:00:00.000Z',
        fresh: true,
        serverId: 'fixture-h',
        serverVersion: '0.0.0',
        pendingExternal: ['LORE-HM', 'provider-E', 'linea-kit-types', 'evidencia-HUB'],
        transportPending: false,
        payloads: {
            estado: {
                resourceVersion: EXPERIENCIA_RESOURCE_VERSION,
                estado: 'pending_external_contract',
                motivo: 'gaps',
                pending_external: [
                    'LORE-HM',
                    'provider-E',
                    'linea-kit-types',
                    'evidencia-HUB'
                ],
                acople: {
                    ciudad: 'registry',
                    delta: 'arg-runtime',
                    m: 'onfalo-fixture'
                }
            },
            escena: {
                resourceVersion: EXPERIENCIA_RESOURCE_VERSION,
                sesionId: null,
                disponible: false,
                motivo: 'sesion no abierta'
            },
            evidencia: {
                resourceVersion: EXPERIENCIA_RESOURCE_VERSION,
                verificado: false,
                evidenciaId: null,
                pending_external: 'evidencia-HUB',
                motivo: 'ausente'
            }
        }
    };
}

describe('RH-17 · buildExperienciaViewModel', () => {
    test('pending_external_contract distingue superficies y no finge complete', () => {
        const model = buildExperienciaViewModel(snapPendingExternal());
        expect(model.phase).toBe('pending_external_contract');
        expect(model.phase).not.toBe('complete');
        expect(model.phase).not.toBe('connected');
        const byId = Object.fromEntries(model.surfaces.map((s) => [s.id, s]));
        expect(byId.ciudad.value).toBe('registry');
        expect(byId.m.value).toBe('onfalo-fixture');
        expect(byId.analisis.status).toBe('external');
        expect(byId.linea.status).toBe('external');
        expect(byId.evidencia.status).toBe('external');
        expect(model.escena.disponible).toBe(false);
        expect(model.escena.stageStatus).toMatch(/sesion/i);
    });

    test('connecting + transportPending no inventa ciudades/escenas', () => {
        const model = buildExperienciaViewModel(
            emptyExperienciaSnapshot('connecting', 'transport <pendiente>', {
                transportPending: true,
                fresh: false
            })
        );
        expect(model.transportPending).toBe(true);
        expect(model.phase).toBe('connecting');
        expect(model.surfaces.every((s) => s.status !== 'ok' || s.value.includes('⏳'))).toBe(
            true
        );
        expect(model.escena.argViewSummary).toBeNull();
    });
});

describe('RH-17 · escena + arg-view-kit types', () => {
    test('isArgViewScene rechaza payload H mínimo (sin geometría)', () => {
        expect(
            isArgViewScene({
                resourceVersion: '0.1.0',
                sesionId: 'x',
                disponible: true
            })
        ).toBe(false);
    });

    test('isArgViewScene + summarize cuando hay geometría tipada', () => {
        const scene = {
            id: 'mini',
            nodos: { a: { position: { x: 0, y: 0, z: 0 } } },
            enlaces: {},
            taps: { t1: { id: 't1', summitNodeId: 'a' } },
            rios: {},
            mar: {},
            cantera: { origin: { x: 0, y: 0, z: 0 }, cols: 2, spacing: 1 }
        };
        expect(isArgViewScene(scene)).toBe(true);
        expect(summarizeArgViewScene(scene)).toMatch(/mini/);
        const panel = buildEscenaPanel(
            {
                resourceVersion: EXPERIENCIA_RESOURCE_VERSION,
                sesionId: 's1',
                disponible: true
            },
            scene
        );
        expect(panel.argViewSummary).toMatch(/1 nodos/);
        expect(panel.stageStatus).toMatch(/ArgViewScene/);
    });

    test('sesión disponible sin geometría → stage pending honesto', () => {
        const panel = buildEscenaPanel({
            resourceVersion: EXPERIENCIA_RESOURCE_VERSION,
            sesionId: 's1',
            disponible: true
        });
        expect(panel.argViewSummary).toBeNull();
        expect(panel.stageStatus).toMatch(/no se inventa/);
    });
});

describe('RH-17 · renderExperienciaDocument', () => {
    test('documento CSP-safe y fases visibles en DOM', () => {
        const html = renderExperienciaDocument({
            cspSource: 'https://example.vscode-cdn.net',
            nonce: 'dGVzdC1ub25jZS1yaDE3',
            snapshot: snapPendingExternal(),
            tools: [{ name: 'ping', description: 'fixture tool' }]
        });
        expect(findWebviewHtmlViolations(html)).toEqual([]);
        expect(html).toContain('data-phase="pending_external_contract"');
        expect(html).toContain('data-surface="ciudad"');
        expect(html).toContain('data-surface="evidencia"');
        expect(html).toContain('data-tool="ping"');
        expect(html).not.toContain('Teatro');
        expect(html).not.toContain('IPlay');
        expect(html).not.toContain('ICompany');
    });

    test('complete sintético exige fresh en snapshot (anti-stale UI)', () => {
        const html = renderExperienciaDocument({
            cspSource: 'https://example.vscode-cdn.net',
            nonce: 'dGVzdC1ub25jZS1yaDE3',
            snapshot: emptyExperienciaSnapshot('complete', 'solo fixture', {
                fresh: true,
                pendingExternal: []
            })
        });
        expect(html).toContain('data-phase="complete"');
        expect(findWebviewHtmlViolations(html)).toEqual([]);
    });

    test('RH-18 · cinco fases con clases CSS distintas (sin inventar éxito)', () => {
        const phases = [
            'connecting',
            'connected',
            'pending_external_contract',
            'failed',
            'complete'
        ] as const;
        const classes = new Set<string>();
        for (const phase of phases) {
            const html = renderExperienciaDocument({
                cspSource: 'https://example.vscode-cdn.net',
                nonce: 'dGVzdC1ub25jZS1yaDE4',
                snapshot: emptyExperienciaSnapshot(phase, `fase ${phase}`, {
                    fresh: phase === 'complete' || phase === 'connected',
                    transportPending: phase === 'connecting',
                    pendingExternal:
                        phase === 'pending_external_contract' ? ['provider-E'] : []
                })
            });
            expect(html).toContain(`data-phase="${phase}"`);
            const m = html.match(/class="phase ([^"]+)"/);
            expect(m).not.toBeNull();
            classes.add(m![1]);
            expect(html).not.toContain('Teatro');
            if (phase !== 'complete') {
                expect(html).not.toMatch(/data-phase="complete"[^]*solo fixture inventado/);
            }
        }
        expect(classes.size).toBe(5);
    });
});
