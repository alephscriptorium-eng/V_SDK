/**
 * RH-17 · Panel escena data-driven.
 *
 * Usa tipos de `@zeus/arg-view-kit` cuando el payload trae geometría
 * `ArgViewScene` (browser-safe). H hoy publica sólo
 * `{ sesionId, disponible, motivo? }` — sin inventar nodos/ríos/mar ni
 * montar `createDeltaStage` (THREE) hasta que H proyecte escena real.
 */

import type { ArgViewScene } from '@zeus/arg-view-kit';
import type { PayloadEscena } from '../types';

export interface EscenaPanelModel {
    readonly disponible: boolean;
    readonly sesionId: string | null;
    readonly motivo?: string;
    /** Resumen tipado si hay geometría ArgViewScene; si no, null. */
    readonly argViewSummary: string | null;
    /** Motivo honesto cuando no hay stage browser. */
    readonly stageStatus: string;
}

function asRecord(v: unknown): Record<string, unknown> | null {
    return v !== null && typeof v === 'object' && !Array.isArray(v)
        ? (v as Record<string, unknown>)
        : null;
}

/** ¿`raw` tiene la forma mínima de `ArgViewScene` (tipos view-kit)? */
export function isArgViewScene(raw: unknown): raw is ArgViewScene {
    const o = asRecord(raw);
    if (o === null) {
        return false;
    }
    if (
        asRecord(o.nodos) === null ||
        asRecord(o.enlaces) === null ||
        asRecord(o.taps) === null ||
        asRecord(o.rios) === null
    ) {
        return false;
    }
    const mar = asRecord(o.mar);
    const cantera = asRecord(o.cantera);
    if (mar === null || cantera === null) {
        return false;
    }
    const origin = asRecord(cantera.origin);
    return (
        origin !== null &&
        typeof cantera.cols === 'number' &&
        typeof cantera.spacing === 'number'
    );
}

export function summarizeArgViewScene(scene: ArgViewScene): string {
    const nodos = Object.keys(scene.nodos).length;
    const rios = Object.keys(scene.rios).length;
    const taps = Object.keys(scene.taps).length;
    const enlaces = Object.keys(scene.enlaces).length;
    const id = typeof scene.id === 'string' ? scene.id : 'sin-id';
    return `${id}: ${nodos} nodos · ${rios} ríos · ${taps} grifos · ${enlaces} enlaces`;
}

/**
 * Construye el modelo del panel escena.
 * `sceneGeometry` es opcional (resource futuro / extensión); no se inventa.
 */
export function buildEscenaPanel(
    escena: PayloadEscena | undefined,
    sceneGeometry?: unknown
): EscenaPanelModel {
    if (!escena) {
        return {
            disponible: false,
            sesionId: null,
            argViewSummary: null,
            stageStatus: '⏳ escena no leída — sin payload H'
        };
    }
    if (!escena.disponible) {
        return {
            disponible: false,
            sesionId: escena.sesionId,
            motivo: escena.motivo,
            argViewSummary: null,
            stageStatus:
                escena.motivo ??
                '⏳ sesión delta no disponible — stage arg-view-kit no montado'
        };
    }
    if (isArgViewScene(sceneGeometry)) {
        return {
            disponible: true,
            sesionId: escena.sesionId,
            motivo: escena.motivo,
            argViewSummary: summarizeArgViewScene(sceneGeometry),
            stageStatus: 'geometría ArgViewScene tipada (view-kit); stage 3D diferido a host browser'
        };
    }
    return {
        disponible: true,
        sesionId: escena.sesionId,
        motivo: escena.motivo,
        argViewSummary: null,
        stageStatus:
            '⏳ sesion abierta sin geometría ArgViewScene en resource — no se inventa escena ni createDeltaStage'
    };
}
