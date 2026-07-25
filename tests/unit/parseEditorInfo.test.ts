/**
 * WP-V17 · Puerta de permisos — invariantes de contrato de parseEditorInfo.
 * V-L2-01 (la ausencia de información no concede permiso) · V-L2-02 (una
 * prueba por invariante del contrato).
 *
 * Los motivos_deny de los fixtures son la lista que publica el SERVIDOR:
 * viven aquí, nunca en src/ (invariante del carril: cero motivos_deny
 * hardcodeados en código de producción).
 */

import { describe, it, expect } from '@jest/globals';
import {
    parseEditorInfo,
    representMotivoDeny,
    isDeniedWithoutWrite,
    extractMotivoFromDeny
} from '../../src/mutation/parseEditorInfo';

/** Catálogo vigente al sellar el contrato v1. Fixture de prueba, no catálogo del IDE. */
const MOTIVOS_FIXTURE: string[] = [
    'reparto_requerido',
    'card_no_vigente',
    'identidad_ausente',
    'seat_invalido',
    'seat_ausente',
    'personaje_desconocido',
    'personaje_no_en_reparto',
    'rol_sin_permiso'
];

/** Bloque `gate.reparto` bien formado; `extra` añade o pisa campos. */
function repartoConMotivos(extra: Record<string, unknown> = {}): Record<string, unknown> {
    return {
        motivos_deny: MOTIVOS_FIXTURE,
        permiso: 'reparto:interpretar',
        engages_when: 'crear_linea',
        ...extra
    };
}

/** editor://info bien formado salvo por el `gate` que se le pase. */
function infoConGate(gate: Record<string, unknown>): Record<string, unknown> {
    return {
        name: 'linea-editor',
        version: '0.1.0',
        mutationTools: ['crear_linea', 'export_story_board'],
        gate
    };
}

describe('parseEditorInfo · la ausencia de información no concede permiso (V-L2-01)', () => {
    it('con motivos_deny presente y `required` ausente exige reparto, no lo concede', () => {
        const parsed = parseEditorInfo(
            infoConGate({
                visible: true,
                gate_line: 'approve + token',
                reparto: repartoConMotivos()
            })
        );

        expect(parsed.gate?.repartoRequired).toBe(true);
    });

    it('marca ⏳ que el servidor NO declaró la exigencia y que el IDE asume lo estricto', () => {
        const parsed = parseEditorInfo(
            infoConGate({
                visible: true,
                gate_line: 'approve + token',
                reparto: repartoConMotivos()
            })
        );

        expect(parsed.ok).toBe(false);
        expect(parsed.pendingReason ?? '').toContain('⏳');
        expect(parsed.pendingReason ?? '').toContain('reparto_required');
    });

    it('las dos caras del gate fallan en la MISMA dirección ante ausencia de dato', () => {
        const parsed = parseEditorInfo(
            infoConGate({ gate_line: 'approve + token', reparto: repartoConMotivos() })
        );

        expect(parsed.gate?.visible).toBe(true);
        expect(parsed.gate?.repartoRequired).toBe(true);
        expect(parsed.gate?.repartoRequired).toBe(parsed.gate?.visible);
    });

    it('sólo un `false` EXPLÍCITO del servidor declara que no se exige reparto', () => {
        const parsed = parseEditorInfo(
            infoConGate({
                visible: true,
                reparto_required: false,
                reparto: repartoConMotivos()
            })
        );

        expect(parsed.requireRepartoLive).toBe(false);
        expect(parsed.gate?.repartoRequired).toBe(false);
        expect(parsed.ok).toBe(true);
    });

    it('no confunde «no declarado» (null) con «declarado no requerido» (false)', () => {
        const noDeclarado = parseEditorInfo(
            infoConGate({ visible: true, reparto: repartoConMotivos() })
        );
        const declaradoFalse = parseEditorInfo(
            infoConGate({ visible: true, reparto_required: false, reparto: repartoConMotivos() })
        );

        expect(noDeclarado.requireRepartoLive).toBeNull();
        expect(declaradoFalse.requireRepartoLive).toBe(false);
        expect(noDeclarado.gate?.repartoRequired).toBe(true);
        expect(declaradoFalse.gate?.repartoRequired).toBe(false);
    });

    it('`visible: false` explícito se respeta (la simetría no es «siempre true»)', () => {
        const parsed = parseEditorInfo(
            infoConGate({
                visible: false,
                reparto_required: true,
                reparto: repartoConMotivos()
            })
        );

        expect(parsed.gate?.visible).toBe(false);
    });
});

describe('parseEditorInfo · divergencia que el espejo del probe no ve (REVISIÓN §1.1)', () => {
    it('lee `reparto.required: true` aunque falte `gate.reparto_required`', () => {
        const parsed = parseEditorInfo(
            infoConGate({
                visible: true,
                reparto: repartoConMotivos({ required: true })
            })
        );

        expect(parsed.requireRepartoLive).toBe(true);
        expect(parsed.gate?.repartoRequired).toBe(true);
        expect(parsed.ok).toBe(true);
    });

    it('lee `reparto.required: false` como declaración explícita del servidor', () => {
        const parsed = parseEditorInfo(
            infoConGate({
                visible: true,
                reparto: repartoConMotivos({ required: false })
            })
        );

        expect(parsed.requireRepartoLive).toBe(false);
        expect(parsed.gate?.repartoRequired).toBe(false);
    });

    it('`gate.reparto_required` tiene precedencia sobre `reparto.required`', () => {
        const parsed = parseEditorInfo(
            infoConGate({
                visible: true,
                reparto_required: false,
                reparto: repartoConMotivos({ required: true })
            })
        );

        expect(parsed.requireRepartoLive).toBe(false);
    });

    it('ignora un `required` no booleano y lo trata como no declarado', () => {
        const parsed = parseEditorInfo(
            infoConGate({
                visible: true,
                reparto: repartoConMotivos({ required: 'true' })
            })
        );

        expect(parsed.requireRepartoLive).toBeNull();
        expect(parsed.gate?.repartoRequired).toBe(true);
        expect(parsed.ok).toBe(false);
    });
});

describe('parseEditorInfo · catálogo de motivos (cláusula viva)', () => {
    it('sin `motivos_deny` devuelve ok:false y ⏳ sin inventar catálogo', () => {
        const parsed = parseEditorInfo(
            infoConGate({
                visible: true,
                reparto_required: true,
                reparto: { permiso: 'reparto:interpretar' }
            })
        );

        expect(parsed.ok).toBe(false);
        expect(parsed.pendingReason ?? '').toContain('⏳');
        expect(parsed.gate?.motivosDeny).toEqual([]);
    });

    it('sin bloque `reparto` tampoco inventa catálogo', () => {
        const parsed = parseEditorInfo(
            infoConGate({ visible: true, reparto_required: true })
        );

        expect(parsed.ok).toBe(false);
        expect(parsed.gate?.motivosDeny).toEqual([]);
    });

    it('usa la lista del servidor tal cual (N=2, no fuerza los ocho)', () => {
        const parsed = parseEditorInfo(
            infoConGate({
                visible: true,
                reparto_required: true,
                reparto: { motivos_deny: ['reparto_requerido', 'seat_ausente'] }
            })
        );

        expect(parsed.ok).toBe(true);
        expect(parsed.gate?.motivosDeny).toEqual(['reparto_requerido', 'seat_ausente']);
    });

    it('descarta elementos no-string de motivos_deny sin sustituirlos', () => {
        const parsed = parseEditorInfo(
            infoConGate({
                visible: true,
                reparto_required: true,
                reparto: { motivos_deny: ['seat_ausente', 42, null, { m: 'x' }, 'rol_sin_permiso'] }
            })
        );

        expect(parsed.gate?.motivosDeny).toEqual(['seat_ausente', 'rol_sin_permiso']);
    });

    it('un motivos_deny vacío es lista del servidor, no catálogo ausente', () => {
        const parsed = parseEditorInfo(
            infoConGate({
                visible: true,
                reparto_required: true,
                reparto: { motivos_deny: [] }
            })
        );

        expect(parsed.ok).toBe(true);
        expect(parsed.gate?.motivosDeny).toEqual([]);
    });

    it('propaga permiso y engages_when tal como los publica el servidor', () => {
        const parsed = parseEditorInfo(
            infoConGate({
                visible: true,
                reparto_required: true,
                reparto: repartoConMotivos()
            })
        );

        expect(parsed.gate?.permiso).toBe('reparto:interpretar');
        expect(parsed.gate?.engagesWhen).toBe('crear_linea');
        expect(parsed.gate?.motivosDeny).toHaveLength(MOTIVOS_FIXTURE.length);
    });
});

describe('representMotivoDeny · la cláusula viva en los dos sentidos', () => {
    it('representa como listado el motivo que sí publicó el servidor', () => {
        expect(representMotivoDeny('seat_ausente', MOTIVOS_FIXTURE)).toBe('deny · seat_ausente');
    });

    it('marca explícitamente el motivo que el servidor NO publicó', () => {
        const texto = representMotivoDeny('motivo_inedito', MOTIVOS_FIXTURE);

        expect(texto).toContain('motivo_inedito');
        expect(texto).toContain('no estaba en motivos_deny');
    });

    it('con lista vacía, ningún motivo se da por conocido', () => {
        expect(representMotivoDeny('seat_ausente', [])).toContain('no estaba en motivos_deny');
    });
});

describe('parseEditorInfo · entradas hostiles', () => {
    it('sin editor://info (null) no hay gate ni exigencia declarada', () => {
        const parsed = parseEditorInfo(null);

        expect(parsed.ok).toBe(false);
        expect(parsed.gate).toBeNull();
        expect(parsed.requireRepartoLive).toBeNull();
        expect(parsed.mutationTools).toEqual([]);
        expect(parsed.pendingReason ?? '').toContain('⏳');
    });

    it('editor://info como array es malformado', () => {
        const parsed = parseEditorInfo([{ gate: { visible: true } }]);

        expect(parsed.ok).toBe(false);
        expect(parsed.gate).toBeNull();
        expect(parsed.pendingReason ?? '').toContain('malformado');
    });

    it('editor://info como cadena es malformado', () => {
        const parsed = parseEditorInfo('{"gate":{"visible":true}}');

        expect(parsed.ok).toBe(false);
        expect(parsed.gate).toBeNull();
    });

    it('sin `gate` no hay puerta visible y no se infiere ninguna', () => {
        const parsed = parseEditorInfo({ name: 'linea-editor', mutationTools: ['crear_linea'] });

        expect(parsed.ok).toBe(false);
        expect(parsed.gate).toBeNull();
        expect(parsed.requireRepartoLive).toBeNull();
        expect(parsed.mutationTools).toEqual(['crear_linea']);
        expect(parsed.pendingReason ?? '').toContain('⏳');
    });

    it('un `gate` array se trata como gate ausente', () => {
        const parsed = parseEditorInfo({ gate: ['visible'] });

        expect(parsed.ok).toBe(false);
        expect(parsed.gate).toBeNull();
    });

    it('un `reparto` array no aporta motivos ni exigencia', () => {
        const parsed = parseEditorInfo(infoConGate({ visible: true, reparto: ['motivos'] }));

        expect(parsed.ok).toBe(false);
        expect(parsed.gate?.motivosDeny).toEqual([]);
        expect(parsed.gate?.repartoRequired).toBe(true);
    });

    it('filtra mutationTools no-string y tolera que no sea array', () => {
        const conBasura = parseEditorInfo({
            mutationTools: ['crear_linea', 7, null],
            gate: { visible: true, reparto_required: true, reparto: repartoConMotivos() }
        });
        const sinArray = parseEditorInfo({
            mutationTools: 'crear_linea',
            gate: { visible: true, reparto_required: true, reparto: repartoConMotivos() }
        });

        expect(conBasura.mutationTools).toEqual(['crear_linea']);
        expect(sinArray.mutationTools).toEqual([]);
    });

    it('conserva name y version cuando son cadenas, y los omite si no', () => {
        const conNombre = parseEditorInfo(
            infoConGate({ visible: true, reparto_required: true, reparto: repartoConMotivos() })
        );
        const sinNombre = parseEditorInfo({
            name: 42,
            gate: { visible: true, reparto_required: true, reparto: repartoConMotivos() }
        });

        expect(conNombre.name).toBe('linea-editor');
        expect(conNombre.version).toBe('0.1.0');
        expect(sinNombre.name).toBeUndefined();
    });
});

describe('isDeniedWithoutWrite · inferencia vigente (V-L2-04 en cola, no la fija el contrato)', () => {
    it('infiere «sin escritura» cuando faltan lineDir, outPath y refs.linea', () => {
        const denied = {
            ok: false,
            rule: 'linea-editor.reparto_requerido',
            decision: { ok: false, motivo: 'reparto_requerido' }
        };

        expect(isDeniedWithoutWrite(denied)).toBe(true);
    });

    it('con lineDir o refs.linea NO cuenta como deny sin escritura', () => {
        expect(isDeniedWithoutWrite({ ok: false, lineDir: '/tmp/linea' })).toBe(false);
        expect(isDeniedWithoutWrite({ ok: false, refs: { linea: 'linea/1' } })).toBe(false);
    });

    it('un payload ok:true nunca es deny sin escritura', () => {
        expect(isDeniedWithoutWrite({ ok: true })).toBe(false);
        expect(isDeniedWithoutWrite(null)).toBe(false);
    });
});

describe('extractMotivoFromDeny · motivo del servidor, sin inventarlo', () => {
    it('lee decision.motivo', () => {
        expect(extractMotivoFromDeny({ decision: { motivo: 'seat_invalido' } })).toBe(
            'seat_invalido'
        );
    });

    it('lee gate.reparto.motivo cuando no hay decision', () => {
        expect(extractMotivoFromDeny({ gate: { reparto: { motivo: 'card_no_vigente' } } })).toBe(
            'card_no_vigente'
        );
    });

    // HALLAZGO V17-A (elevado en el reporte, NO arreglado aquí): el prefijo que
    // se recorta incluye «reparto_», así que la vía `rule` devuelve «requerido»
    // y nunca coincide con el motivo «reparto_requerido» del catálogo. Se fija
    // el comportamiento VIGENTE; arreglarlo en este WP rompería la disjunción
    // del lote y toca una forma de payload que el contrato no fija (REVISIÓN §3.1).
    it('deriva el motivo de `rule` recortando «linea-editor.reparto_» (vigente)', () => {
        expect(extractMotivoFromDeny({ rule: 'linea-editor.reparto_requerido' })).toBe('requerido');
    });

    it('el motivo derivado sólo de `rule` no casa con el catálogo del servidor (V17-A)', () => {
        const motivo = extractMotivoFromDeny({ rule: 'linea-editor.reparto_requerido' }) ?? '';

        expect(MOTIVOS_FIXTURE).toContain('reparto_requerido');
        expect(MOTIVOS_FIXTURE).not.toContain(motivo);
        expect(representMotivoDeny(motivo, MOTIVOS_FIXTURE)).toContain('no estaba en motivos_deny');
    });

    it('decision.motivo tiene precedencia sobre rule, y ese sí es del catálogo', () => {
        const motivo =
            extractMotivoFromDeny({
                rule: 'linea-editor.reparto_requerido',
                decision: { motivo: 'reparto_requerido' }
            }) ?? '';

        expect(motivo).toBe('reparto_requerido');
        expect(MOTIVOS_FIXTURE).toContain(motivo);
    });

    it('sin ninguna de las tres vías no devuelve motivo', () => {
        expect(extractMotivoFromDeny({ ok: false })).toBeUndefined();
        expect(extractMotivoFromDeny(null)).toBeUndefined();
    });
});
