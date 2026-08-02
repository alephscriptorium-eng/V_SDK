// =============================================================================
// scripts/tests/anclas-censo.test.ts · el gate del ancla — WP-V101
// =============================================================================
//
// QUÉ VIGILA ESTO
//   `scripts/anclas-censo.mjs` cierra la ceguera que `scripts/citas-rancias.mjs`
//   declara en cada corrida: aquél comprueba que una cita apunta a algo que
//   EXISTE, no que diga la verdad, y pedía «un ancla de texto guardada junto a
//   cada cita». El ancla declara el HECHO (qué token, en qué fichero, cuántas
//   veces), deriva la coordenada de hoy, y la compara con la que el documento
//   vivo afirma.
//
// LA FORMA: LA PINZA (misma que `citas-rancias.test.ts` y `rojos-jest.test.ts`)
//   Un test que sólo comprueba «el instrumento dice PASS» no prueba que vigile
//   nada: un instrumento que imprimiera siempre PASS lo pasaría. Cada regla se
//   comprueba con DOS brazos:
//     1. el instrumento REAL la cumple;
//     2. un MUTANTE —copia con ese trozo concreto desactivado— NO la cumple.
//   Sin el segundo brazo, esta suite aprobaría un gate desconectado.
//
// EL MUNDO SINTÉTICO, Y POR QUÉ NO SE ANCLA EL REPO DE VERDAD
//   Las anclas del repo apuntan a coordenadas que cambian con cada commit
//   legítimo. Un test escrito contra ellas caducaría exactamente igual que las
//   citas que este instrumento persigue — sería el chiste que el WP viene a
//   cerrar. Aquí cada caso monta su propio arbolito en un temporal.
//
// LO QUE ESTA SUITE **NO** PRUEBA
//   No prueba que las 8 anclas de `plan/ANCLAS.json` sean las correctas ni
//   suficientes: eso es criterio, y el propio instrumento lo declara como su
//   ceguera (sólo cubre lo registrado). Que el registro real esté al día lo
//   comprueba el gate al correr, no esta suite.
// =============================================================================

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const RAIZ = path.resolve(__dirname, '..', '..');
const INSTRUMENTO = path.join(RAIZ, 'scripts', 'anclas-censo.mjs');

jest.setTimeout(120_000);

interface Salida { code: number; todo: string; }

function correr(raiz: string, instrumento = INSTRUMENTO, args: string[] = []): Salida {
    const r = spawnSync(process.execPath, [instrumento, '--raiz', raiz, ...args], { encoding: 'utf8' });
    return { code: r.status ?? -1, todo: (r.stdout || '') + (r.stderr || '') };
}

/** Un arbolito con un fuente, un documento vivo y un registro de anclas. */
function mundo(opciones: {
    fuente?: string;
    doc?: string;
    anclas?: unknown;
    registroCrudo?: string;
}): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'anclas-'));
    fs.mkdirSync(path.join(dir, 'plan'), { recursive: true });
    fs.mkdirSync(path.join(dir, 'src'), { recursive: true });

    fs.writeFileSync(path.join(dir, 'src', 'cosa.ts'),
        opciones.fuente ?? ['linea uno', 'const X = MARCA_VIVA;', 'linea tres'].join('\n'));
    fs.writeFileSync(path.join(dir, 'plan', 'DOC.md'),
        opciones.doc ?? 'El hecho vive en `src/cosa.ts:2`, medido hoy.\n');

    if (opciones.registroCrudo !== undefined) {
        fs.writeFileSync(path.join(dir, 'plan', 'ANCLAS.json'), opciones.registroCrudo);
    } else {
        fs.writeFileSync(path.join(dir, 'plan', 'ANCLAS.json'), JSON.stringify(opciones.anclas ?? {
            anclas: [{
                id: 'A1', fichero: 'src/cosa.ts', debeNombrar: ['MARCA_VIVA'], veces: 1,
                porque: 'el hecho de prueba',
                citas: [{ doc: 'plan/DOC.md', dice: 'src/cosa.ts:2' }]
            }]
        }, null, 1));
    }
    return dir;
}

/** Copia del instrumento con un trozo desactivado. Aborta si el patrón no está
 *  — la lección de V100: una mutación que no se aplica sale «verde» y no dice
 *  nada. */
function mutante(de: string, a: string): string {
    const src = fs.readFileSync(INSTRUMENTO, 'utf8');
    if (!src.includes(de)) {
        throw new Error(`MUTANTE INVÁLIDO: el patrón no está en el instrumento:\n${de}`);
    }
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'anclas-mut-'));
    const destino = path.join(dir, 'anclas-censo.mjs');
    fs.writeFileSync(destino, src.replace(de, a));
    return destino;
}

// =============================================================================
describe('§0 · el caso sano', () => {
    it('con el hecho en pie y la cita al día: PASS y exit 0', () => {
        const r = correr(mundo({}));
        expect(r.todo).toContain('VEREDICTO: PASS');
        expect(r.code).toBe(0);
    });

    it('el denominador sale SIEMPRE, sin bandera que lo apague', () => {
        // Un PASS sin denominador no se puede leer: es la lección que
        // `citas-rancias` pagó con 367 citas fuera del recuento.
        const r = correr(mundo({}));
        expect(r.todo).toContain('anclas declaradas          : 1');
        expect(r.todo).toContain('citas de documento vivo    : 1');
    });

    it('la ceguera se declara en CADA corrida, no en un acta que nadie abre', () => {
        expect(correr(mundo({})).todo).toContain('LO QUE ESTE VEREDICTO NO SIGNIFICA');
    });
});

// =============================================================================
describe('§1 · el HECHO: recuento por fichero (la deriva de COMPOSICIÓN)', () => {
    // Éste es el modo de fallo que ningún re-medidor de coordenadas ve: el censo
    // declaraba 5 puntos en `extensionBootstrap.ts` y hoy hay 0, repartidos en
    // otros ficheros. Las coordenadas no se habían movido: el inventario era otro.
    const mundoConDosMarcas = () => mundo({
        fuente: ['const X = MARCA_VIVA;', 'const Y = MARCA_VIVA;'].join('\n'),
        doc: 'El hecho vive en `src/cosa.ts:1`.\n',
        anclas: {
            anclas: [{
                id: 'A1', fichero: 'src/cosa.ts', debeNombrar: ['MARCA_VIVA'], veces: 1,
                citas: [{ doc: 'plan/DOC.md', dice: 'src/cosa.ts:1' }]
            }]
        }
    });

    it('si el token aparece en MÁS sitios de los anclados: FAIL', () => {
        const r = correr(mundoConDosMarcas());
        expect(r.todo).toContain('VEREDICTO: FAIL');
        expect(r.todo).toMatch(/esperaba 1 sitio\(s\).*hay 2/);
        expect(r.code).toBe(1);
    });

    it('si el token DESAPARECE: FAIL', () => {
        const r = correr(mundo({ fuente: 'ya no dice nada\n' }));
        expect(r.todo).toContain('VEREDICTO: FAIL');
        expect(r.todo).toMatch(/hay 0/);
        expect(r.code).toBe(1);
    });

    it('si el fichero anclado no existe: FAIL', () => {
        const dir = mundo({});
        fs.rmSync(path.join(dir, 'src', 'cosa.ts'));
        const r = correr(dir);
        expect(r.todo).toContain('el fichero no existe');
        expect(r.code).toBe(1);
    });

    it('MUTANTE · sin la comprobación de recuento, la deriva de composición pasa', () => {
        const m = mutante('if (coords.length !== a.veces) {', 'if (false) {');
        const r = correr(mundoConDosMarcas(), m);
        expect(r.todo).toContain('VEREDICTO: PASS');   // el gate desconectado aprueba
        expect(r.code).toBe(0);
    });

    it('mover el hecho de línea, sin cambiar el hecho, NO enrojece', () => {
        // La razón de ser del diseño: pinchar líneas es lo que falló las cuatro
        // veces. Un gate que enrojece con cada edición legítima se desactiva solo.
        const r = correr(mundo({
            fuente: ['cabecera nueva', 'otra', 'const X = MARCA_VIVA;'].join('\n'),
            doc: 'El hecho vive en `src/cosa.ts:3`.\n',
            anclas: {
                anclas: [{
                    id: 'A1', fichero: 'src/cosa.ts', debeNombrar: ['MARCA_VIVA'], veces: 1,
                    citas: [{ doc: 'plan/DOC.md', dice: 'src/cosa.ts:3' }]
                }]
            }
        }));
        expect(r.todo).toContain('VEREDICTO: PASS');
    });
});

// =============================================================================
describe('§2 · la CITA del documento vivo (la deriva de las 4 generaciones)', () => {
    /** El hecho está en :3, y el documento sigue diciendo :2. */
    const mundoDerivado = () => mundo({
        fuente: ['cabecera nueva', 'otra', 'const X = MARCA_VIVA;'].join('\n'),
        doc: 'El hecho vive en `src/cosa.ts:2`, medido hace tiempo.\n'
    });

    it('cuando el documento sitúa mal el hecho: FAIL con la corrección escrita', () => {
        const r = correr(mundoDerivado());
        expect(r.todo).toContain('VEREDICTO: FAIL');
        expect(r.todo).toContain('CITAS DERIVADAS');
        expect(r.todo).toContain('-> corregir la cita a: src/cosa.ts:3');
        expect(r.code).toBe(1);
    });

    it('MUTANTE · sin la comparación de coordenada, la deriva pasa', () => {
        const m = mutante('if (!coords.includes(Number(lineaCitada))) {', 'if (false) {');
        const r = correr(mundoDerivado(), m);
        expect(r.todo).toContain('VEREDICTO: PASS');
        expect(r.code).toBe(0);
    });
});

// =============================================================================
describe('§3 · el lazo: el registro no puede estar de acuerdo consigo mismo', () => {
    // Sin esta comprobación, `dice` sería una copia de la medición —siempre
    // conforme— mientras el documento vivo afirma otra cosa. El gate parecería
    // verde y el censo seguiría mintiendo: exactamente el estado de partida.
    const mundoRegistroMiente = () => mundo({
        doc: 'Aquí no se cita ninguna coordenada.\n'
    });

    it('si el documento NO contiene la cita que el registro le atribuye: FAIL', () => {
        const r = correr(mundoRegistroMiente());
        expect(r.todo).toContain('VEREDICTO: FAIL');
        expect(r.todo).toContain('NO esta en el documento');
        expect(r.code).toBe(1);
    });

    it('si el documento vivo citado no existe: FAIL', () => {
        const dir = mundo({});
        fs.rmSync(path.join(dir, 'plan', 'DOC.md'));
        const r = correr(dir);
        expect(r.todo).toContain('el documento vivo citado no existe');
        expect(r.code).toBe(1);
    });

    it('MUTANTE · sin el lazo, el registro se aprueba a sí mismo', () => {
        const m = mutante('if (!textoDoc.some(l => l.includes(c.dice))) {', 'if (false) {');
        const r = correr(mundoRegistroMiente(), m);
        expect(r.todo).toContain('VEREDICTO: PASS');
        expect(r.code).toBe(0);
    });
});

// =============================================================================
describe('§4 · un gate sin anclas no emite veredicto', () => {
    it('registro vacío: exit 2, sin PASS y sin FAIL', () => {
        const r = correr(mundo({ anclas: { anclas: [] } }));
        expect(r.code).toBe(2);
        expect(r.todo).not.toContain('VEREDICTO: PASS');
        expect(r.todo).toContain('ni un ancla');
    });

    it('registro ilegible: exit 2, sin veredicto', () => {
        const r = correr(mundo({ registroCrudo: '{ esto no es json' }));
        expect(r.code).toBe(2);
        expect(r.todo).not.toContain('VEREDICTO');
    });

    it('registro ausente: exit 2', () => {
        const dir = mundo({});
        fs.rmSync(path.join(dir, 'plan', 'ANCLAS.json'));
        expect(correr(dir).code).toBe(2);
    });

    it('MUTANTE · sin el guardián del registro vacío, sale un PASS que no significa nada', () => {
        const m = mutante('if (anclas.length === 0) {', 'if (false) {');
        const r = correr(mundo({ anclas: { anclas: [] } }), m);
        expect(r.todo).toContain('VEREDICTO: PASS');
        expect(r.code).toBe(0);
    });
});

// =============================================================================
describe('§5 · el registro real de este repo', () => {
    it('`--anclas` lista el censo, una por línea, y todas tienen fichero y recuento', () => {
        const r = spawnSync(process.execPath, [INSTRUMENTO, '--anclas'], { encoding: 'utf8' });
        expect(r.status).toBe(0);
        const filas = (r.stdout || '').trim().split('\n').filter(Boolean);
        expect(filas.length).toBeGreaterThan(0);
        for (const f of filas) {
            const [id, fichero, token, veces] = f.split('\t');
            expect(id).toBeTruthy();
            expect(fichero).toBeTruthy();
            expect(token).toBeTruthy();
            expect(Number(veces)).toBeGreaterThan(0);
        }
    });

    it('el registro real está AL DÍA: el gate pasa sobre este árbol', () => {
        // Éste es el único caso que mira el repo de verdad, y es a propósito:
        // es el que enrojece cuando una coordenada del censo vuelve a derivar.
        const r = spawnSync(process.execPath, [INSTRUMENTO], { encoding: 'utf8' });
        expect((r.stdout || '') + (r.stderr || '')).toContain('VEREDICTO: PASS');
        expect(r.status).toBe(0);
    });
});
