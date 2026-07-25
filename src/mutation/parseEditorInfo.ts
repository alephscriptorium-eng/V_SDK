/**
 * Parseo puro de editor://info (contrato fase 4).
 * PROHIBIDO hardcodear motivos_deny: si el resource no los trae → lista vacía / pending.
 */

import type { VisibleGate } from './types';

export interface ParsedEditorInfo {
    ok: boolean;
    pendingReason?: string;
    name?: string;
    version?: string;
    mutationTools: string[];
    gate: VisibleGate | null;
    requireRepartoLive: boolean | null;
}

/**
 * Extrae gate + motivos_deny del JSON de editor://info.
 * Hostil-omite: sin info / sin gate.reparto.motivos_deny → no inventa catálogo.
 */
export function parseEditorInfo(raw: unknown): ParsedEditorInfo {
    if (raw == null) {
        return {
            ok: false,
            pendingReason: '⏳ editor://info omitido',
            mutationTools: [],
            gate: null,
            requireRepartoLive: null
        };
    }
    if (typeof raw !== 'object' || Array.isArray(raw)) {
        return {
            ok: false,
            pendingReason: '⏳ editor://info malformado',
            mutationTools: [],
            gate: null,
            requireRepartoLive: null
        };
    }

    const o = raw as Record<string, unknown>;
    const mutationTools = Array.isArray(o.mutationTools)
        ? o.mutationTools.filter((t): t is string => typeof t === 'string')
        : [];

    const gateRaw = o.gate;
    if (gateRaw == null || typeof gateRaw !== 'object' || Array.isArray(gateRaw)) {
        return {
            ok: false,
            pendingReason: '⏳ editor://info sin gate visible',
            mutationTools,
            gate: null,
            requireRepartoLive: null,
            name: typeof o.name === 'string' ? o.name : undefined,
            version: typeof o.version === 'string' ? o.version : undefined
        };
    }

    const g = gateRaw as Record<string, unknown>;
    const reparto =
        g.reparto != null && typeof g.reparto === 'object' && !Array.isArray(g.reparto)
            ? (g.reparto as Record<string, unknown>)
            : null;

    // Cláusula viva: lista del servidor. Sin array → [] (no hardcode de los 8).
    const motivosDeny =
        reparto && Array.isArray(reparto.motivos_deny)
            ? reparto.motivos_deny.filter((m): m is string => typeof m === 'string')
            : [];

    const requireRepartoLive =
        typeof g.reparto_required === 'boolean'
            ? g.reparto_required
            : typeof reparto?.required === 'boolean'
              ? (reparto.required as boolean)
              : null;

    const gate: VisibleGate = {
        visible: g.visible !== false,
        gateLine: typeof g.gate_line === 'string' ? g.gate_line : '',
        tokenEnv: typeof g.token_env === 'string' ? g.token_env : 'ZEUS_MCP_APPROVAL_TOKEN',
        repartoRequired: requireRepartoLive === true,
        repartoPolicyEnv:
            typeof g.reparto_policy_env === 'string'
                ? g.reparto_policy_env
                : 'ZEUS_LINEA_EDITOR_REQUIRE_REPARTO',
        motivosDeny,
        permiso: typeof reparto?.permiso === 'string' ? reparto.permiso : undefined,
        engagesWhen: typeof reparto?.engages_when === 'string' ? reparto.engages_when : undefined
    };

    if (!reparto || !Array.isArray(reparto.motivos_deny)) {
        return {
            ok: false,
            pendingReason: '⏳ editor://info.gate.reparto.motivos_deny ausente (no hardcode)',
            mutationTools,
            gate,
            requireRepartoLive,
            name: typeof o.name === 'string' ? o.name : undefined,
            version: typeof o.version === 'string' ? o.version : undefined
        };
    }

    return {
        ok: true,
        mutationTools,
        gate,
        requireRepartoLive,
        name: typeof o.name === 'string' ? o.name : undefined,
        version: typeof o.version === 'string' ? o.version : undefined
    };
}

/** Representación textual de un motivo (para UI/errores). Sin inventar motivos. */
export function representMotivoDeny(motivo: string, knownFromRuntime: string[]): string {
    const listed = knownFromRuntime.includes(motivo);
    return listed
        ? `deny · ${motivo}`
        : `deny · ${motivo} (no estaba en motivos_deny de editor://info)`;
}

/**
 * ¿El resultado de tools/call denegó sin efecto de escritura?
 * Heurística: ok===false y ausentes lineDir / refs.linea / outPath.
 */
export function isDeniedWithoutWrite(payload: unknown): boolean {
    if (payload == null || typeof payload !== 'object') {
        return false;
    }
    const o = payload as Record<string, unknown>;
    if (o.ok !== false) {
        return false;
    }
    if (o.lineDir != null || o.outPath != null) {
        return false;
    }
    const refs = o.refs;
    if (refs != null && typeof refs === 'object' && !Array.isArray(refs)) {
        if ((refs as Record<string, unknown>).linea != null) {
            return false;
        }
    }
    return true;
}

export function extractMotivoFromDeny(payload: unknown): string | undefined {
    if (payload == null || typeof payload !== 'object') {
        return undefined;
    }
    const o = payload as Record<string, unknown>;
    const decision = o.decision;
    if (decision != null && typeof decision === 'object' && !Array.isArray(decision)) {
        const m = (decision as Record<string, unknown>).motivo;
        if (typeof m === 'string') {
            return m;
        }
    }
    const gate = o.gate;
    if (gate != null && typeof gate === 'object' && !Array.isArray(gate)) {
        const reparto = (gate as Record<string, unknown>).reparto;
        if (reparto != null && typeof reparto === 'object' && !Array.isArray(reparto)) {
            const m = (reparto as Record<string, unknown>).motivo;
            if (typeof m === 'string') {
                return m;
            }
        }
    }
    if (typeof o.rule === 'string' && o.rule.startsWith('linea-editor.reparto_')) {
        return o.rule.slice('linea-editor.reparto_'.length);
    }
    return undefined;
}
