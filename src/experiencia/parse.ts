/**
 * RH-16 · Parseo y validación de shapes H→V (resourceVersion `0.1.0`).
 * Fallo tipado: nunca inventa payload ni declara connected/complete.
 */

import {
    EXPERIENCIA_RESOURCE_VERSION,
    EXPERIENCIA_URIS,
    URI_EXPERIENCIA_ESCENA,
    URI_EXPERIENCIA_ESTADO,
    URI_EXPERIENCIA_EVIDENCIA,
    type ExperienciaPayloads,
    type ExperienciaPhase,
    type ExperienciaResourceUri,
    type PayloadEscena,
    type PayloadEstado,
    type PayloadEvidencia
} from './types';

export type ParseOk<T> = { ok: true; data: T };
export type ParseFail = { ok: false; reason: string };
export type ParseResult<T> = ParseOk<T> | ParseFail;

function asRecord(v: unknown): Record<string, unknown> | null {
    return v !== null && typeof v === 'object' && !Array.isArray(v)
        ? (v as Record<string, unknown>)
        : null;
}

function requireVersion(o: Record<string, unknown>, uri: string): ParseFail | null {
    if (typeof o.resourceVersion !== 'string') {
        return {
            ok: false,
            reason: `${uri}: resourceVersion ausente (hostil-omite → no connected)`
        };
    }
    if (o.resourceVersion !== EXPERIENCIA_RESOURCE_VERSION) {
        return {
            ok: false,
            reason: `${uri}: resourceVersion '${o.resourceVersion}' ≠ '${EXPERIENCIA_RESOURCE_VERSION}'`
        };
    }
    return null;
}

export function parsePayloadEstado(raw: unknown): ParseResult<PayloadEstado> {
    const o = asRecord(raw);
    if (o === null) {
        return { ok: false, reason: `${URI_EXPERIENCIA_ESTADO}: payload no es objeto` };
    }
    const ver = requireVersion(o, URI_EXPERIENCIA_ESTADO);
    if (ver) {
        return ver;
    }
    if (typeof o.estado !== 'string') {
        return { ok: false, reason: `${URI_EXPERIENCIA_ESTADO}: falta estado string` };
    }
    if (!Array.isArray(o.pending_external)) {
        return {
            ok: false,
            reason: `${URI_EXPERIENCIA_ESTADO}: falta pending_external[]`
        };
    }
    const pending = o.pending_external.filter((x): x is string => typeof x === 'string');
    if (pending.length !== o.pending_external.length) {
        return {
            ok: false,
            reason: `${URI_EXPERIENCIA_ESTADO}: pending_external con entradas no-string`
        };
    }
    const acople = asRecord(o.acople);
    if (
        acople === null ||
        typeof acople.ciudad !== 'string' ||
        typeof acople.delta !== 'string' ||
        typeof acople.m !== 'string'
    ) {
        return {
            ok: false,
            reason: `${URI_EXPERIENCIA_ESTADO}: acople.{ciudad,delta,m} strings requeridos`
        };
    }
    return {
        ok: true,
        data: {
            resourceVersion: o.resourceVersion as string,
            estado: o.estado,
            ...(typeof o.motivo === 'string' ? { motivo: o.motivo } : {}),
            ...(typeof o.superficie === 'string' ? { superficie: o.superficie } : {}),
            pending_external: pending,
            acople: {
                ciudad: acople.ciudad,
                delta: acople.delta,
                m: acople.m
            }
        }
    };
}

export function parsePayloadEscena(raw: unknown): ParseResult<PayloadEscena> {
    const o = asRecord(raw);
    if (o === null) {
        return { ok: false, reason: `${URI_EXPERIENCIA_ESCENA}: payload no es objeto` };
    }
    const ver = requireVersion(o, URI_EXPERIENCIA_ESCENA);
    if (ver) {
        return ver;
    }
    if (!('sesionId' in o) || (o.sesionId !== null && typeof o.sesionId !== 'string')) {
        return {
            ok: false,
            reason: `${URI_EXPERIENCIA_ESCENA}: sesionId debe ser string|null`
        };
    }
    if (typeof o.disponible !== 'boolean') {
        return {
            ok: false,
            reason: `${URI_EXPERIENCIA_ESCENA}: falta disponible boolean`
        };
    }
    return {
        ok: true,
        data: {
            resourceVersion: o.resourceVersion as string,
            sesionId: o.sesionId as string | null,
            disponible: o.disponible,
            ...(typeof o.motivo === 'string' ? { motivo: o.motivo } : {})
        }
    };
}

export function parsePayloadEvidencia(raw: unknown): ParseResult<PayloadEvidencia> {
    const o = asRecord(raw);
    if (o === null) {
        return { ok: false, reason: `${URI_EXPERIENCIA_EVIDENCIA}: payload no es objeto` };
    }
    const ver = requireVersion(o, URI_EXPERIENCIA_EVIDENCIA);
    if (ver) {
        return ver;
    }
    if (typeof o.verificado !== 'boolean') {
        return {
            ok: false,
            reason: `${URI_EXPERIENCIA_EVIDENCIA}: falta verificado boolean`
        };
    }
    if (
        !('evidenciaId' in o) ||
        (o.evidenciaId !== null && typeof o.evidenciaId !== 'string')
    ) {
        return {
            ok: false,
            reason: `${URI_EXPERIENCIA_EVIDENCIA}: evidenciaId debe ser string|null`
        };
    }
    if (
        !('pending_external' in o) ||
        (o.pending_external !== null && typeof o.pending_external !== 'string')
    ) {
        return {
            ok: false,
            reason: `${URI_EXPERIENCIA_EVIDENCIA}: pending_external debe ser string|null`
        };
    }
    return {
        ok: true,
        data: {
            resourceVersion: o.resourceVersion as string,
            verificado: o.verificado,
            evidenciaId: o.evidenciaId as string | null,
            pending_external: o.pending_external as string | null,
            ...(typeof o.motivo === 'string' ? { motivo: o.motivo } : {})
        }
    };
}

/** Comprueba que `resources/list` declara los tres URIs H (hostil-omite). */
export function assertExperienciaUrisListed(
    listedUris: readonly string[]
): ParseResult<readonly ExperienciaResourceUri[]> {
    const set = new Set(listedUris);
    const missing = EXPERIENCIA_URIS.filter((u) => !set.has(u));
    if (missing.length > 0) {
        return {
            ok: false,
            reason: `resource(s) omitido(s): ${missing.join(', ')} (hostil-omite → no connected)`
        };
    }
    return { ok: true, data: EXPERIENCIA_URIS };
}

export function collectPendingExternal(payloads: ExperienciaPayloads): string[] {
    const out: string[] = [...payloads.estado.pending_external];
    if (payloads.evidencia.pending_external !== null) {
        out.push(payloads.evidencia.pending_external);
    }
    return out;
}

/**
 * Deriva fase desde payloads frescos y válidos.
 * - pending_external visible → `pending_external_contract` (≠ connected/complete)
 * - complete solo con evidencia verificada + escena disponible + estado complete + sin gaps
 * - en otro caso → connected
 *
 * Nunca promover a complete sin `fresh === true` (anti-stale); el caller lo exige.
 */
export function deriveExperienciaPhase(
    payloads: ExperienciaPayloads,
    opts: { fresh: boolean }
): { phase: Exclude<ExperienciaPhase, 'connecting' | 'failed'>; reason: string } {
    const pending = collectPendingExternal(payloads);
    const estadoDeclaresPending =
        payloads.estado.estado === 'pending_external_contract' ||
        payloads.estado.estado === 'pending_external';

    if (pending.length > 0 || estadoDeclaresPending) {
        return {
            phase: 'pending_external_contract',
            reason: `⏳ pending_external_contract: ${
                pending.length > 0 ? pending.join(', ') : payloads.estado.estado
            }`
        };
    }

    const wantsComplete =
        payloads.estado.estado === 'complete' &&
        payloads.escena.disponible === true &&
        payloads.evidencia.verificado === true;

    if (wantsComplete) {
        if (!opts.fresh) {
            return {
                phase: 'connected',
                reason:
                    'resources leídos pero no fresh en este refresh — no se declara complete (anti-stale)'
            };
        }
        return {
            phase: 'complete',
            reason: 'experiencia H complete (resources frescos, sin pending_external)'
        };
    }

    return {
        phase: 'connected',
        reason: `experiencia H connected (estado=${payloads.estado.estado})`
    };
}
