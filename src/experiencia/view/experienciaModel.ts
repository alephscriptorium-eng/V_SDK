/**
 * RH-17 · Modelo de proyección UI desde ExperienciaSnapshot.
 * Data-driven: Ciudad, M, Ónfalo, análisis, línea, evidencia.
 * Gaps externos → pending_external_contract visible; cero fingir complete.
 */

import type { ExperienciaPhase, ExperienciaSnapshot } from '../types';
import { buildEscenaPanel, type EscenaPanelModel } from './escenaPanel';

export interface SurfaceRow {
    readonly id: string;
    readonly label: string;
    readonly value: string;
    readonly status: 'ok' | 'pending' | 'error' | 'external';
}

export interface ExperienciaViewModel {
    readonly phase: ExperienciaPhase;
    readonly reason: string;
    readonly fresh: boolean;
    readonly transportPending: boolean;
    readonly serverLabel: string;
    readonly fetchedAt: string;
    readonly pendingExternal: readonly string[];
    readonly surfaces: readonly SurfaceRow[];
    readonly escena: EscenaPanelModel;
}

function hasGap(pending: readonly string[], needle: string): boolean {
    const n = needle.toLowerCase();
    return pending.some((p) => p.toLowerCase().includes(n));
}

function statusForGap(
    pending: readonly string[],
    needles: readonly string[],
    okValue: string | undefined,
    pendingLabel: string
): SurfaceRow['status'] {
    if (needles.some((n) => hasGap(pending, n))) {
        return 'external';
    }
    if (!okValue || okValue.trim() === '') {
        return 'pending';
    }
    return 'ok';
}

export function buildExperienciaViewModel(
    snap: ExperienciaSnapshot,
    sceneGeometry?: unknown
): ExperienciaViewModel {
    const payloads = snap.payloads;
    const pending = snap.pendingExternal;
    const estado = payloads?.estado;
    const evidencia = payloads?.evidencia;
    const acople = estado?.acople;

    const ciudadStatus = statusForGap(
        pending,
        ['ciudad'],
        acople?.ciudad,
        'Ciudad'
    );
    const mStatus = statusForGap(pending, ['player-mcp', 'm-'], acople?.m, 'M');
    const onfaloStatus = hasGap(pending, 'onfalo')
        ? 'external'
        : acople?.m
          ? 'ok'
          : 'pending';
    const analisisStatus = hasGap(pending, 'provider') || hasGap(pending, 'lore')
        ? 'external'
        : 'pending';
    const lineaStatus =
        hasGap(pending, 'linea') || hasGap(pending, 'line')
            ? 'external'
            : 'pending';
    const evidenciaStatus = evidencia?.verificado
        ? 'ok'
        : evidencia?.pending_external || hasGap(pending, 'evidencia') || hasGap(pending, 'hub')
          ? 'external'
          : 'pending';

    const surfaces: SurfaceRow[] = [
        {
            id: 'ciudad',
            label: 'Ciudad (entrada)',
            value: acople?.ciudad ?? '⏳ sin acople',
            status: acople ? ciudadStatus : 'pending'
        },
        {
            id: 'm',
            label: 'Estado M',
            value: acople?.m ?? '⏳ sin acople M',
            status: acople ? mStatus : 'pending'
        },
        {
            id: 'onfalo',
            label: 'Ónfalo',
            value: hasGap(pending, 'onfalo')
                ? '⏳ pending_external (Ónfalo)'
                : acople?.m
                  ? `vía M/acople: ${acople.m}`
                  : '⏳ identidad/hash no proyectada aún',
            status: onfaloStatus
        },
        {
            id: 'analisis',
            label: 'Análisis (E)',
            value: hasGap(pending, 'provider') || hasGap(pending, 'lore')
                ? `⏳ pending_external: ${pending.filter((p) => /provider|lore/i.test(p)).join(', ') || 'E/LORE'}`
                : '⏳ sin análisis — V no implementa provider E',
            status: analisisStatus
        },
        {
            id: 'linea',
            label: 'Línea',
            value: hasGap(pending, 'linea') || hasGap(pending, 'line')
                ? `⏳ pending_external: ${pending.filter((p) => /linea|line/i.test(p)).join(', ') || 'linea'}`
                : '⏳ sin materialización — V no implementa line.materialize',
            status: lineaStatus
        },
        {
            id: 'evidencia',
            label: 'Evidencia',
            value: evidencia
                ? evidencia.verificado
                    ? `verificado · ${evidencia.evidenciaId ?? 'sin id'}`
                    : evidencia.motivo ??
                      (evidencia.pending_external
                          ? `⏳ ${evidencia.pending_external}`
                          : '⏳ no verificada')
                : '⏳ sin payload evidencia',
            status: evidencia ? evidenciaStatus : 'pending'
        }
    ];

    return {
        phase: snap.phase,
        reason: snap.reason,
        fresh: snap.fresh,
        transportPending: snap.transportPending === true,
        serverLabel: snap.serverId
            ? `${snap.serverId}${snap.serverVersion ? `@${snap.serverVersion}` : ''}`
            : '—',
        fetchedAt: snap.fetchedAt,
        pendingExternal: pending,
        surfaces,
        escena: buildEscenaPanel(payloads?.escena, sceneGeometry)
    };
}
