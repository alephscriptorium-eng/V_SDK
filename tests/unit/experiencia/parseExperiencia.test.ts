/**
 * RH-16 · Tests de parseo/estados de resources H (version/shape).
 */

import {
    assertExperienciaUrisListed,
    collectPendingExternal,
    deriveExperienciaPhase,
    parsePayloadEscena,
    parsePayloadEstado,
    parsePayloadEvidencia
} from '../../../src/experiencia/parse';
import {
    EXPERIENCIA_RESOURCE_VERSION,
    URI_EXPERIENCIA_ESCENA,
    URI_EXPERIENCIA_ESTADO,
    URI_EXPERIENCIA_EVIDENCIA
} from '../../../src/experiencia/types';
import {
    fixtureEstadoCompleteSintetico,
    fixtureEstadoPendingExternal,
    fixtureEscenaDisponible,
    fixtureEscenaNoDisponible,
    fixtureEvidenciaPending,
    fixtureEvidenciaVerificada
} from './fixtureExperienciaH';

describe('RH-16 · parseo shapes H 0.1.0', () => {
    it('parsea estado/escena/evidencia con resourceVersion 0.1.0', () => {
        const e = parsePayloadEstado(fixtureEstadoPendingExternal());
        expect(e.ok).toBe(true);
        if (e.ok) {
            expect(e.data.resourceVersion).toBe(EXPERIENCIA_RESOURCE_VERSION);
            expect(e.data.pending_external).toContain('provider-E');
        }
        const s = parsePayloadEscena(fixtureEscenaNoDisponible());
        expect(s.ok).toBe(true);
        const v = parsePayloadEvidencia(fixtureEvidenciaPending());
        expect(v.ok).toBe(true);
        if (v.ok) {
            expect(v.data.pending_external).toBe('evidencia-HUB');
        }
    });

    it('hostil-omite: version ausente → no ok (no connected)', () => {
        const raw = { ...fixtureEstadoPendingExternal() };
        delete (raw as { resourceVersion?: string }).resourceVersion;
        const e = parsePayloadEstado(raw);
        expect(e.ok).toBe(false);
        if (!e.ok) {
            expect(e.reason).toContain('resourceVersion ausente');
            expect(e.reason).toContain('no connected');
        }
    });

    it('hostil-omite: version distinta → no ok', () => {
        const e = parsePayloadEstado({
            ...fixtureEstadoPendingExternal(),
            resourceVersion: '9.9.9'
        });
        expect(e.ok).toBe(false);
        if (!e.ok) {
            expect(e.reason).toContain('9.9.9');
        }
    });

    it('hostil-omite: URI omitida en list → no connected', () => {
        const r = assertExperienciaUrisListed([
            URI_EXPERIENCIA_ESTADO,
            URI_EXPERIENCIA_ESCENA
            // evidencia omitida
        ]);
        expect(r.ok).toBe(false);
        if (!r.ok) {
            expect(r.reason).toContain(URI_EXPERIENCIA_EVIDENCIA);
            expect(r.reason).toContain('no connected');
        }
    });

    it('pending_external_contract distinto de connected/complete', () => {
        const payloads = {
            estado: parsePayloadEstado(fixtureEstadoPendingExternal()),
            escena: parsePayloadEscena(fixtureEscenaNoDisponible()),
            evidencia: parsePayloadEvidencia(fixtureEvidenciaPending())
        };
        expect(payloads.estado.ok && payloads.escena.ok && payloads.evidencia.ok).toBe(true);
        if (!payloads.estado.ok || !payloads.escena.ok || !payloads.evidencia.ok) {
            return;
        }
        const data = {
            estado: payloads.estado.data,
            escena: payloads.escena.data,
            evidencia: payloads.evidencia.data
        };
        const derived = deriveExperienciaPhase(data, { fresh: true });
        expect(derived.phase).toBe('pending_external_contract');
        expect(derived.phase).not.toBe('connected');
        expect(derived.phase).not.toBe('complete');
        expect(collectPendingExternal(data).length).toBeGreaterThan(0);
    });

    it('complete solo con fresh + sin pending + verificado + disponible', () => {
        const data = {
            estado: parsePayloadEstado(fixtureEstadoCompleteSintetico()),
            escena: parsePayloadEscena(fixtureEscenaDisponible()),
            evidencia: parsePayloadEvidencia(fixtureEvidenciaVerificada())
        };
        expect(data.estado.ok && data.escena.ok && data.evidencia.ok).toBe(true);
        if (!data.estado.ok || !data.escena.ok || !data.evidencia.ok) {
            return;
        }
        const payloads = {
            estado: data.estado.data,
            escena: data.escena.data,
            evidencia: data.evidencia.data
        };
        expect(deriveExperienciaPhase(payloads, { fresh: true }).phase).toBe('complete');
        // anti-stale: sin fresh no se declara complete
        const stale = deriveExperienciaPhase(payloads, { fresh: false });
        expect(stale.phase).toBe('connected');
        expect(stale.phase).not.toBe('complete');
        expect(stale.reason).toContain('anti-stale');
    });

    it('no inventa complete si falta evidencia verificada', () => {
        const data = {
            estado: parsePayloadEstado(fixtureEstadoCompleteSintetico()),
            escena: parsePayloadEscena(fixtureEscenaDisponible()),
            evidencia: parsePayloadEvidencia(fixtureEvidenciaPending())
        };
        if (!data.estado.ok || !data.escena.ok || !data.evidencia.ok) {
            throw new Error('fixture parse fail');
        }
        const derived = deriveExperienciaPhase(
            {
                estado: data.estado.data,
                escena: data.escena.data,
                evidencia: data.evidencia.data
            },
            { fresh: true }
        );
        expect(derived.phase).toBe('pending_external_contract');
    });
});
