// =============================================================================
// scripts/tests/citas-rancias.test.ts · el gate del barrido de citas — WP-V99
// =============================================================================
//
// QUÉ VIGILA ESTO
//   `scripts/citas-rancias.mjs` revisa toda cita `ruta[:linea]` de los `.md` de
//   un ámbito y decide, preguntando a git, si una cita que no resuelve nació
//   muerta (acta) o se pudrió (deuda). WP-V92 lo escribió y midió 1518 citas /
//   27 rancias — pero su `ALCANCE_DIFF` le prohibía `scripts/`, así que el
//   instrumento quedó EMBEBIDO LITERAL dentro de un reporte. Sin fichero no hay
//   test, y sin test una edición cualquiera deshace sus correcciones en silencio.
//
// LO QUE SU AUTOR YA HABÍA CENSADO — Y QUE AQUÍ SE PRUEBA, NO SE REPITE
//   V92 §1.3 dejó escritos tres errores propios, con su coste medido:
//     1. `js` casando antes que `json` en la alternancia   -> 10 falsos positivos
//     2. los ficheros de raíz fuera del denominador        -> 367 citas sin mirar,
//        y con ellas 5 rancias que nadie había visto (la grave: un denominador
//        que miente por defecto da un PASS que no significa nada)
//     3. el prefijo de mundo (z:`plan/BACKLOG.md:248`)     -> 12 falsos positivos;
//        estuvo a punto de enrutarse como hallazgo un defecto inexistente
//   Un instrumento que arregló un bug sin dejar el test no ha arreglado nada.
//   Las tres tienen aquí caso rojo propio (§ 2), y cada uno está anclado a un
//   MUTANTE: se desactiva la corrección y se EXIGE que el test caiga.
//
// LA FORMA DE CADA TEST: LA PINZA (misma que `scripts/tests/rojos-jest.test.ts`)
//   Un test que sólo comprueba «el instrumento dice X» no prueba que vigile
//   nada: un instrumento que imprimiera siempre X lo pasaría. Cada regla se
//   comprueba con DOS brazos:
//     1. el instrumento REAL cumple la aserción;
//     2. un MUTANTE —copia con ese trozo concreto desactivado— NO la cumple.
//
// EL MUNDO SINTÉTICO, Y POR QUÉ NO SE BARRE EL REPO DE VERDAD
//   El veredicto de este barrido depende de la HISTORIA de git: cuándo nació el
//   informe, cuándo murió el fichero, cuántas líneas tenía aquel día. Sobre el
//   repo real eso cambia con cada commit, así que un test escrito contra él
//   caducaría exactamente igual que las citas que el barrido persigue — sería
//   el chiste que este WP viene a cerrar. En su lugar, § 0 construye un
//   repositorio git DE VERDAD en un temporal, con seis commits en un orden
//   escogido para que cada clase salga por su propia razón y no de rebote.
//   Consecuencia buscada: esta suite se pone roja cuando se rompe el
//   INSTRUMENTO, jamás cuando cambia el contenido de `plan/REPORTES/`.
//
// LO QUE ESTA SUITE **NO** PRUEBA, dicho antes de que lo pregunten
//   No prueba que las citas del repo digan la verdad: eso es la ceguera
//   irreducible, y no se cierra con tests sino con otro instrumento (§ 5 exige
//   que el barrido la declare en cada corrida). Tampoco prueba el número 1676
//   de hoy: un cardinal medido caduca, y por eso vive en el reporte del WP como
//   corrida fechada, no aquí como aserción.
// =============================================================================

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const RAIZ = path.resolve(__dirname, '..', '..');
const INSTRUMENTO = path.join(RAIZ, 'scripts', 'citas-rancias.mjs');

/** Cada test lanza de uno a tres subprocesos, y cada subproceso lanza varios
 *  `git`. El tope de la casa son 10 s (`jest.config.js:79`); bajo la contención
 *  de la propia suite eso es poco margen para algo que sólo puede fallar por
 *  impaciencia — el mismo argumento que subió el suelo en `rojos-jest.test.ts`. */
jest.setTimeout(120_000);

interface Salida {
    code: number;
    out: string;
    err: string;
    todo: string;
}

let TMP = '';
let MUNDO = '';
/** La corrida REAL sobre el mundo sintético, calculada una sola vez. */
let REAL: Salida;

// --- § 0 · arnés --------------------------------------------------------------

function correr(args: string[], guion: string = INSTRUMENTO): Salida {
    const r = spawnSync(process.execPath, [guion, ...args], {
        cwd: RAIZ,
        encoding: 'utf8',
        windowsHide: true,
        env: { ...process.env, FORCE_COLOR: '0' }
    });
    if (r.error) throw r.error;
    const out = r.stdout || '';
    const err = r.stderr || '';
    return { code: r.status === null ? -1 : r.status, out, err, todo: out + err };
}

/** Los argumentos con que se barre el mundo sintético. Uno solo, y siempre igual. */
function args(...extra: string[]): string[] {
    return ['--raiz', MUNDO, '--verbose', ...extra];
}

// --- el censo de mutación -----------------------------------------------------
//
// ESTA TABLA ES EL CONTRATO, no documentación. `--reglas` enumera las reglas del
// instrumento; § 7 exige que los dos conjuntos coincidan y que NINGÚN mutante
// sobreviva. Una regla nueva sin mutación pone la suite roja con su nombre; una
// mutación que deja de apuntar a código real revienta en `mutante()` en vez de
// mutar a ciegas, que es la única forma de que una mutación muerta se note.
type Mutacion = Array<[string, string]>;

const CENSO: Record<string, Mutacion> = {
    // CEGUERA 1 de V92: `js` antes que `json` — `fixtures/x.json` casa como `.js`.
    R1: [["const EXT = 'jsonc|json|tsx|yaml|snap|vsix|html|yml|mjs|cjs|css|log|txt|ts|js|md';",
        "const EXT = 'jsonc|tsx|yaml|snap|vsix|html|yml|mjs|cjs|css|log|txt|ts|js|json|md';"]],
    // CEGUERA 2 de V92: el patrón vuelve a exigir al menos un directorio, o sea
    // que los ficheros de la raíz salen del denominador SIN DECIRLO.
    R2: [["|${FICHEROS_RAIZ.join('|')})`", ')`']],
    // CEGUERA 3 de V92: z:`ruta` se comprueba contra el árbol equivocado.
    R3: [['if (ajenaPorMundo) { B.otroMundo++; continue; }', 'if (false) { B.otroMundo++; continue; }']],
    R4: [["if (ruta.includes('/') && !TOPDIRS.includes(ruta.split('/')[0])) { B.fueraDelArbol++; continue; }",
        'if (false) { B.fueraDelArbol++; continue; }']],
    R5: [["if (c.enBloque) c.clase = 'TRANSCRIP';", "if (false) c.clase = 'TRANSCRIP';"]],
    R6: [["else if (c.marcada) c.clase = 'ANOTADA';", "else if (false) c.clase = 'ANOTADA';"]],
    R7: [["else if (!existio(c.ruta)) c.clase = 'EFIMERA';", "else if (false) c.clase = 'EFIMERA';"]],
    R8: [["else if (esAncestro(muere(c.ruta), nace(c.inf))) c.clase = 'ACTA';", "else if (false) c.clase = 'ACTA';"]],
    R9: [["c.clase = (max0 > 0 && c.maxCitada > max0) ? 'ACTA' : 'RANCIA';", "c.clase = 'RANCIA';"]],
    R10: [["    else c.clase = 'RANCIA';", "    else c.clase = 'ACTA';"],
        ['process.exit(rancias.length ? 1 : 0);', 'process.exit(0);']],
    R11: [["|| git('rev-parse', 'HEAD'));", "|| '');"]],
    R12: [["p('citas ruta[:linea] extraidas : ' + B.total);", '/* R12 desactivada */;']],
    R13: [['for (const l of CEGUERA) p(l);', '/* R13 desactivada */;']],
    // R14 va EN PAREJA a propósito, y es la única así. La regla del cuadre no se
    // puede desactivar sola: sobre una corrida sana no cambia nada y el mutante
    // sobreviviría. Se retira junto con el contador que ella vigila, que es como
    // se pierde una cita de verdad — en silencio. § 6 lo separa en sus dos mitades.
    R14: [['if (!motivo) { B.ok++; continue; }', 'if (!motivo) { continue; }'],
        ['const cuadra = B.ok + B.noResuelve + noMiradas === B.total && B.conDirectorio + B.deLaRaiz === B.total;',
            'const cuadra = true;']]
};

let nMutantes = 0;

/**
 * Copia del instrumento con uno o varios trozos sustituidos.
 *
 * Si un ancla no aparece EXACTAMENTE una vez, revienta en lugar de mutar a
 * ciegas: una mutación que ya no apunta a nada no prueba nada, y ese fallo tiene
 * que ser ruidoso. Si alguien refactoriza el instrumento, el mensaje dice qué
 * reapuntar.
 */
function mutante(...reemplazos: Mutacion): string {
    let texto = fs.readFileSync(INSTRUMENTO, 'utf8');
    for (const [de, a] of reemplazos) {
        const veces = texto.split(de).length - 1;
        if (veces !== 1) {
            throw new Error(
                'MUTACIÓN SIN ANCLA: «' + de + '» aparece ' + veces + ' veces en ' +
                'scripts/citas-rancias.mjs (se esperaba 1).\n' +
                'El instrumento se ha editado y esta mutación ya no apunta a nada. ' +
                'Reapúntala al código nuevo: una mutación que no muerde no vigila nada.'
            );
        }
        texto = texto.replace(de, a);
    }
    const destino = path.join(TMP, 'mutante-' + ++nMutantes + '.mjs');
    fs.writeFileSync(destino, texto);
    return destino;
}

/** Corre el mutante y EXIGE que las mismas aserciones ya NO se cumplan. */
function elMutanteDebeCaer(guion: string, argumentos: string[], comprobar: (s: Salida) => void): Salida {
    const s = correr(argumentos, guion);
    let cayo = false;
    try {
        comprobar(s);
    } catch {
        cayo = true;
    }
    if (!cayo) {
        throw new Error(
            'MUTANTE SUPERVIVIENTE.\n' +
            'Se ha desactivado a propósito el trozo del instrumento que este test dice vigilar,\n' +
            'y las mismas aserciones han seguido pasando. Entonces este test NO lo vigila.\n' +
            '  argumentos : ' + argumentos.join(' ') + '\n' +
            '  código     : ' + s.code + '\n' +
            '  salida     : ' + (s.todo.trim().slice(0, 1200) || '(vacía)')
        );
    }
    return s;
}

/**
 * La pinza: el instrumento real cumple, el mutante de la regla `id` no.
 * Devuelve la salida del MUTANTE, para poder aseverar además QUÉ hace de malo.
 */
function pinza(id: string, comprobar: (s: Salida) => void, argumentos?: string[]): Salida {
    // Con los argumentos de siempre se usa la corrida real CACHEADA: es
    // determinista, y volver a lanzarla en cada test multiplicaría por dos el
    // número de subprocesos sin añadir una sola aserción.
    const usados = argumentos ?? args();
    comprobar(argumentos ? correr(argumentos) : REAL);
    return elMutanteDebeCaer(mutante(...CENSO[id]), usados, comprobar);
}

// --- lectura de la salida ------------------------------------------------------

/** Los contadores del bloque de denominador/miradas, por su etiqueta literal. */
function cifras(out: string): Record<string, number> {
    const pares: Array<[string, RegExp]> = [
        ['extraidas', /citas ruta\[:linea\] extraidas : (\d+)/],
        ['conDirectorio', /con directorio\s+: (\d+)/],
        ['deLaRaiz', /de la raiz del repo\s+: (\d+)/],
        ['ok', /resuelven contra el arbol\s+: (\d+)/],
        ['noResuelve', /NO resuelven\s+: (\d+)/],
        ['TRANSCRIP', /TRANSCRIP \(en bloque cod\)\s+: (\d+)/],
        ['ANOTADA', /ANOTADA {2}\(marca en linea\)\s+: (\d+)/],
        ['EFIMERA', /EFIMERA {2}\(nunca existio\)\s+: (\d+)/],
        ['ACTA', /ACTA {5}\(ya no valia\)\s+: (\d+)/],
        ['RANCIA', /RANCIA {3}\(valia y caduco\)\s+: (\d+)/],
        ['noMiradas', /total no miradas\s+: (\d+)/],
        ['otroMundo', /OTRO-MUNDO {6}\(z:`\.\.\.`\) {2}: (\d+)/],
        ['fueraDelArbol', /FUERA-DEL-ARBOL \(1er seg\.\) : (\d+)/]
    ];
    const r: Record<string, number> = {};
    for (const [k, re] of pares) {
        const m = out.match(re);
        r[k] = m ? Number(m[1]) : -1;
    }
    return r;
}

/** El veredicto por cita del bloque `--verbose`: «informe.md:linea cita» -> clase. */
function veredictos(out: string): Record<string, string> {
    const r: Record<string, string> = {};
    for (const m of out.matchAll(/^\[(\w+)\s*\] (\S+) {2}(\S+) {2}\(mata:/gm)) {
        r[m[2] + ' ' + m[3]] = m[1];
    }
    return r;
}

// --- § 0.1 · el mundo sintético ------------------------------------------------
//
// Seis commits, y el ORDEN es el experimento entero: cada clase sale por su
// propia razón. `temprano.ts` muere ANTES de que nazca ningún informe (acta);
// `podado.ts` muere DESPUÉS (deuda); `largo.ts` y `package.json` encogen entre
// dos informes, así que la MISMA coordenada `:40` es acta en uno y rancia en el
// otro — que es la mitad silenciosa del problema y la que V92 tuvo que añadir
// para que el barrido no se denunciara a sí mismo.

const G = ['-c', 'user.name=v99', '-c', 'user.email=v99@local',
    '-c', 'commit.gpgsign=false', '-c', 'core.autocrlf=false'];

function git(...a: string[]): string {
    const r = spawnSync('git', ['-C', MUNDO, ...G, ...a], { encoding: 'utf8', windowsHide: true });
    if (r.status !== 0) {
        throw new Error('git ' + a.join(' ') + ' -> ' + r.status + '\n' + (r.stdout || '') + (r.stderr || ''));
    }
    return (r.stdout || '').trim();
}

function esc(rel: string, cuerpo: string): void {
    const p = path.join(MUNDO, ...rel.split('/'));
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, cuerpo);
}

const relleno = (n: number, q: string): string =>
    Array.from({ length: n }, (_, i) => q + ' ' + (i + 1)).join('\n') + '\n';

function construirMundo(): void {
    fs.mkdirSync(MUNDO, { recursive: true });
    git('init', '-q');

    // c1 · el árbol
    esc('package.json', relleno(40, '// manifiesto'));
    esc('jest.config.js', relleno(12, '// config'));
    esc('fixtures/vector.json', relleno(5, '// vector'));
    esc('src/vivo.ts', relleno(30, '// vivo'));
    esc('src/podado.ts', relleno(10, '// podado'));
    esc('src/largo.ts', relleno(50, '// largo'));
    esc('src/temprano.ts', relleno(10, '// temprano'));
    git('add', '-A');
    git('commit', '-qm', 'c1 el arbol');

    // c2 · muere temprano.ts, ANTES de que exista informe alguno
    fs.rmSync(path.join(MUNDO, 'src', 'temprano.ts'));
    git('add', '-A');
    git('commit', '-qm', 'c2 muere temprano');

    // c3 · nacen los informes r01..r08 y r10
    esc('plan/REPORTES/r01-extensiones.md',
        '# r01\n\nEl vector vive en `fixtures/vector.json` y resuelve.\n');
    esc('plan/REPORTES/r02-raiz.md',
        '# r02\n\nEl manifiesto lo dice en `package.json:35`.\nY el arnes en `jest.config.js:3`.\n');
    esc('plan/REPORTES/r03-mundo.md',
        '# r03\n\nEl otro mundo lo tiene en z:`src/podado.ts`, que no es el mio.\n');
    esc('plan/REPORTES/r04-topdir.md',
        '# r04\n\nLa dependencia trae `node_modules/paquete/indice.js`.\n');
    esc('plan/REPORTES/r05-bloque.md',
        '# r05\n\nSalida literal de aquel dia:\n\n```\n$ wc -l src/podado.ts\n10 src/podado.ts\n```\n');
    esc('plan/REPORTES/r06-marca.md',
        '# r06\n\nCitaba `src/podado.ts` ⛔ *(cita rancia: podado en c4)*.\n');
    esc('plan/REPORTES/r07-efimera.md',
        '# r07\n\nLa sonda propuesta seria `src/__sonda__.ts`, que nunca se creo.\n');
    esc('plan/REPORTES/r08-acta-borrado.md',
        '# r08\n\nActa de la poda: `src/temprano.ts` ya no estaba al escribir esto.\n');
    esc('plan/REPORTES/r10-rancia.md',
        '# r10\n\nEl modulo `src/podado.ts` es la pieza viva.\nEl umbral esta en `src/largo.ts:40`.\n');
    git('add', '-A');
    git('commit', '-qm', 'c3 nacen los informes');

    // c4 · muere podado.ts, DESPUÉS de que los informes lo citaran
    fs.rmSync(path.join(MUNDO, 'src', 'podado.ts'));
    git('add', '-A');
    git('commit', '-qm', 'c4 muere podado');

    // c5 · encogen largo.ts (50 -> 20) y package.json (40 -> 20)
    esc('src/largo.ts', relleno(20, '// largo'));
    esc('package.json', relleno(20, '// manifiesto'));
    git('add', '-A');
    git('commit', '-qm', 'c5 encogen largo y manifiesto');

    // c6 · nace r09, cuando `:40` YA era imposible
    esc('plan/REPORTES/r09-acta-deriva.md',
        '# r09\n\nAquel umbral vivia en `src/largo.ts:40`, coordenada ya imposible hoy.\n');
    git('add', '-A');
    git('commit', '-qm', 'c6 nace r09');

    // sin commitear · r11 se está escribiendo AHORA, así que nace en HEAD
    esc('plan/REPORTES/r11-head.md',
        '# r11\n\nEste informe no esta commiteado y cita `src/podado.ts`.\n');
}

beforeAll(() => {
    TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'v99-citas-'));
    MUNDO = path.join(TMP, 'mundo');
    construirMundo();
    REAL = correr(args());
});

afterAll(() => {
    if (TMP) fs.rmSync(TMP, { recursive: true, force: true });
});

// =============================================================================
// § 1 · EL MUNDO SINTÉTICO ES EL QUE CREO
// =============================================================================

describe('WP-V99 · § 1 · la fixture, demostrada y no supuesta', () => {
    it('el mundo es un repositorio git PROPIO, no un rincón de otro', () => {
        // La lección de WP-V95 aplicada aquí: una fixture que simula un
        // repositorio deja de simular nada si `git init` falló y las preguntas
        // se están respondiendo contra el repo de arriba. El instrumento
        // pregunta con `git -C <raiz>`, y git sube por los ancestros hasta
        // encontrar un `.git`. Se comprueba, no se supone.
        expect(fs.existsSync(path.join(MUNDO, '.git'))).toBe(true);
        expect(fs.realpathSync(git('rev-parse', '--show-toplevel')))
            .toBe(fs.realpathSync(MUNDO));
        expect(git('log', '--oneline').split('\n')).toHaveLength(6);
    });

    it('la corrida real da el reparto exacto para el que se construyeron los seis commits', () => {
        // Si la fixture deriva, lo dice ESTE test con las trece cifras delante,
        // en vez de veinte tests contradiciéndose por separado.
        expect(cifras(REAL.out)).toEqual({
            extraidas: 14,
            conDirectorio: 12,
            deLaRaiz: 2,
            ok: 2,
            noResuelve: 10,
            TRANSCRIP: 2,
            ANOTADA: 1,
            EFIMERA: 1,
            ACTA: 3,
            RANCIA: 3,
            noMiradas: 2,
            otroMundo: 1,
            fueraDelArbol: 1
        });
        expect(REAL.out).toContain('documentos barridos : 11');
        expect(REAL.code).toBe(1); // hay rancias a propósito: § 3 las necesita
    });
});

// =============================================================================
// § 2 · LAS TRES CEGUERAS QUE V92 SE CENSÓ — cada una con su caso rojo
// =============================================================================

describe('WP-V99 · § 2 · las tres cegueras medidas de V92, como casos rojos', () => {
    it('CEGUERA 1 · `json` va antes que `js`: si no, un `.json` vivo se denuncia por inexistente', () => {
        // `fixtures/vector.json` existe. Con `js` primero en la alternancia, el
        // patrón se queda con `fixtures/vector.js` —que no existe— y la cita
        // pasa a EFIMERA: un falso positivo por un orden de alternancia.
        const comprobar = (s: Salida): void => {
            expect(veredictos(s.out)['r01-extensiones.md:3 fixtures/vector.json']).toBeUndefined();
            expect(s.out).not.toContain('fixtures/vector.js ');
            expect(cifras(s.out).ok).toBe(2);
        };

        const delMutante = pinza('R1', comprobar);
        expect(veredictos(delMutante.out)['r01-extensiones.md:3 fixtures/vector.js']).toBe('EFIMERA');
        expect(cifras(delMutante.out).ok).toBe(1);
        expect(cifras(delMutante.out).EFIMERA).toBe(2);
    });

    it('CEGUERA 2 · sin los ficheros de raíz el DENOMINADOR encoge y se lleva una rancia consigo', () => {
        // La grave, y la razón de que el denominador salga desglosado por origen.
        // `package.json:35` cabía cuando se escribió r02 (40 líneas) y hoy no
        // (20): es deuda. Con el patrón exigiendo un directorio, esa cita
        // NI SIQUIERA SE EXTRAE — no aparece como fallo, aparece como si no
        // existiera. Eso es lo que costó 367 citas y 5 rancias en V92.
        const comprobar = (s: Salida): void => {
            const c = cifras(s.out);
            expect(c.deLaRaiz).toBe(2);
            expect(c.extraidas).toBe(14);
            expect(veredictos(s.out)['r02-raiz.md:3 package.json:35']).toBe('RANCIA');
        };

        const delMutante = pinza('R2', comprobar);
        const c = cifras(delMutante.out);
        expect(c.deLaRaiz).toBe(0);          // ni una: el extractor está ciego
        expect(c.extraidas).toBe(12);        // el denominador MIENTE, y hacia abajo
        expect(c.RANCIA).toBe(2);            // la deuda no se corrige: se esconde
        expect(delMutante.out).not.toContain('package.json:35');
        // Y el aviso que el instrumento imprime justo para este caso.
        expect(delMutante.out).toContain('la ceguera 2 ha vuelto y el denominador esta mintiendo otra vez');
    });

    it('CEGUERA 3 · el prefijo de mundo: sin él se enruta un defecto que no existe', () => {
        // z:`src/podado.ts` es el árbol de OTRO mundo. Aquí `src/podado.ts`
        // murió después de nacer r03, así que comprobarla contra este árbol la
        // declara RANCIA — un hallazgo redondo, con su fichero y su commit
        // asesino, sobre un defecto que no existe. Fue el falso positivo más
        // caro de V92 y el único que estuvo a punto de enrutarse.
        const comprobar = (s: Salida): void => {
            expect(cifras(s.out).otroMundo).toBe(1);
            expect(veredictos(s.out)['r03-mundo.md:3 src/podado.ts']).toBeUndefined();
        };

        const delMutante = pinza('R3', comprobar);
        expect(cifras(delMutante.out).otroMundo).toBe(0);
        expect(veredictos(delMutante.out)['r03-mundo.md:3 src/podado.ts']).toBe('RANCIA');
        expect(cifras(delMutante.out).RANCIA).toBe(4);
    });

    it('CEGUERA 3 bis · una ruta de primer segmento desconocido tampoco se juzga aquí', () => {
        // La hermana de la anterior: `node_modules/…` no es de este árbol. Sin
        // la regla se convierte en EFIMERA, que es una acusación con otro nombre.
        const comprobar = (s: Salida): void => {
            expect(cifras(s.out).fueraDelArbol).toBe(1);
            expect(cifras(s.out).EFIMERA).toBe(1);
        };

        const delMutante = pinza('R4', comprobar);
        expect(cifras(delMutante.out).fueraDelArbol).toBe(0);
        expect(veredictos(delMutante.out)['r04-topdir.md:3 node_modules/paquete/indice.js']).toBe('EFIMERA');
    });
});

// =============================================================================
// § 3 · LAS CINCO CLASES, Y LAS DOS RAMAS QUE SEPARAN ACTA DE RANCIA
// =============================================================================

describe('WP-V99 · § 3 · las cinco clases', () => {
    it('TRANSCRIP · una cita dentro de un bloque de código es evidencia grabada, no deuda', () => {
        const comprobar = (s: Salida): void => {
            expect(cifras(s.out).TRANSCRIP).toBe(2);
            expect(veredictos(s.out)['r05-bloque.md:6 src/podado.ts']).toBe('TRANSCRIP');
        };

        const delMutante = pinza('R5', comprobar);
        // Sin la clase, la salida literal de un `wc -l` de aquel día se convierte
        // en dos deudas. Reescribirla para «arreglarlas» sería falsificar la prueba.
        expect(veredictos(delMutante.out)['r05-bloque.md:6 src/podado.ts']).toBe('RANCIA');
        expect(cifras(delMutante.out).RANCIA).toBe(5);
    });

    it('ANOTADA · una línea que ya declara su caducidad no se vuelve a denunciar', () => {
        const comprobar = (s: Salida): void => {
            expect(veredictos(s.out)['r06-marca.md:3 src/podado.ts']).toBe('ANOTADA');
        };

        const delMutante = pinza('R6', comprobar);
        // Sin la clase, corregir una cita rancia no la saca del informe: el gate
        // sigue rojo por la corrección misma, y la única salida es borrar lo que
        // se dijo, que es justo lo que la marca `⛔` existe para evitar.
        expect(veredictos(delMutante.out)['r06-marca.md:3 src/podado.ts']).toBe('RANCIA');
    });

    it('EFIMERA · un fichero que nunca estuvo en el árbol es una propuesta, no una deuda', () => {
        const comprobar = (s: Salida): void => {
            expect(veredictos(s.out)['r07-efimera.md:3 src/__sonda__.ts']).toBe('EFIMERA');
        };

        const delMutante = pinza('R7', comprobar);
        expect(veredictos(delMutante.out)['r07-efimera.md:3 src/__sonda__.ts']).toBe('RANCIA');
    });

    it('ACTA (a) · el fichero ya estaba muerto al escribirse el informe: el informe ES el acta', () => {
        // `temprano.ts` murió en c2; r08 nació en c3. Quien escribía lo sabía.
        const comprobar = (s: Salida): void => {
            expect(veredictos(s.out)['r08-acta-borrado.md:3 src/temprano.ts']).toBe('ACTA');
        };

        const delMutante = pinza('R8', comprobar);
        expect(veredictos(delMutante.out)['r08-acta-borrado.md:3 src/temprano.ts']).toBe('RANCIA');
    });

    it('ACTA (b) · la MISMA coordenada `:40` es acta en un informe y deuda en otro', () => {
        // Ésta es la rama que da respetabilidad al veredicto sobre la deriva de
        // línea, y la que impide que un informe que DOCUMENTA una cita rota se
        // denuncie a sí mismo por mencionarla. `largo.ts` tenía 50 líneas en c3
        // y 20 desde c5:
        //   · r10 nació en c3 -> `:40` cabía y dejó de caber  -> RANCIA
        //   · r09 nació en c6 -> `:40` ya no cabía aquel día  -> ACTA
        // No hay forma de distinguirlas mirando el árbol de hoy: sólo git sabe.
        const comprobar = (s: Salida): void => {
            const v = veredictos(s.out);
            expect(v['r09-acta-deriva.md:3 src/largo.ts:40']).toBe('ACTA');
            expect(v['r10-rancia.md:4 src/largo.ts:40']).toBe('RANCIA');
        };

        const delMutante = pinza('R9', comprobar);
        // Sin la rama, las dos son deuda: el instrumento pierde la capacidad de
        // hablar de una cita rota sin cometerla.
        expect(veredictos(delMutante.out)['r09-acta-deriva.md:3 src/largo.ts:40']).toBe('RANCIA');
    });

    it('RANCIA · es la única clase que es deuda, y arrastra el código de salida', () => {
        const comprobar = (s: Salida): void => {
            expect(cifras(s.out).RANCIA).toBe(3);
            expect(s.out).toContain('VEREDICTO: FAIL (3 rancias / 14 citas)');
            expect(s.code).toBe(1);
        };

        const delMutante = pinza('R10', comprobar);
        // El mutante hace las dos cosas que convierten un gate en un adorno:
        // reclasifica la deuda como acta, y sale 0 pase lo que pase.
        expect(delMutante.code).toBe(0);
        expect(cifras(delMutante.out).RANCIA).toBe(2);
    });

    it('NACE EN HEAD · un informe aún sin commitear no se denuncia a sí mismo', () => {
        // r11 se está escribiendo AHORA: no tiene commit de alta, así que nace
        // en HEAD. Sin ese respaldo `nace()` devuelve vacío, `esAncestro` dice
        // que no, y todo lo que cite un fichero podado sale rancio — o sea que
        // el acta de una poda no se puede escribir sin romper su propio gate.
        const comprobar = (s: Salida): void => {
            expect(veredictos(s.out)['r11-head.md:3 src/podado.ts']).toBe('ACTA');
        };

        const delMutante = pinza('R11', comprobar);
        expect(veredictos(delMutante.out)['r11-head.md:3 src/podado.ts']).toBe('RANCIA');
    });
});

// =============================================================================
// § 4 · EL DENOMINADOR NO ES UNA OPCIÓN
// =============================================================================

describe('WP-V99 · § 4 · el denominador y las no-miradas salen siempre', () => {
    it('la corrida por defecto —sin una sola bandera— ya trae las tres cifras', () => {
        // CA-4 dicho al derecho: cuántas revisó, cuántas fallaron, y cuántas NO
        // PUDO MIRAR con su clase. Sin banderas: si hiciera falta pedirlo, el
        // que no lo pide vuelve a tener el denominador silencioso de la ceguera 2.
        const s = correr(['--raiz', MUNDO]);
        expect(s.out).toContain('citas ruta[:linea] extraidas : 14');
        expect(s.out).toContain('resuelven contra el arbol    : 2');
        expect(s.out).toContain('NO resuelven                 : 10');
        expect(s.out).toContain('total no miradas             : 2');
        expect(s.out).toContain('OTRO-MUNDO');
        expect(s.out).toContain('FUERA-DEL-ARBOL');
        // y el desglose por ORIGEN, que es el que delata la ceguera 2
        expect(s.out).toContain('de la raiz del repo        : 2');
    });

    it('el denominador no se puede quitar sin que esto se ponga rojo', () => {
        const comprobar = (s: Salida): void => {
            expect(s.out).toContain('citas ruta[:linea] extraidas : 14');
        };
        pinza('R12', comprobar);
    });

    it('la suma de las tres cifras es el denominador, y el instrumento lo dice en voz alta', () => {
        expect(REAL.out).toContain('cuadre: miradas(12) + no-miradas(2) = 14   |   por origen: 12 + 2 = 14   OK');
    });
});

// =============================================================================
// § 5 · LA CEGUERA IRREDUCIBLE, DECLARADA EN EL INSTRUMENTO
// =============================================================================

describe('WP-V99 · § 5 · lo que un verde de aquí no significa', () => {
    /** Lo que tiene que estar, corra donde corra: la clase y su caso con nombre. */
    const exigirCeguera = (t: string): void => {
        expect(t).toContain('ceguera irreducible');
        expect(t).toContain('APUNTA A ALGO QUE EXISTE');
        expect(t).toContain('plan/REPORTES/WP-V90-jest-determinista.md:357');
        expect(t).toContain('plan/BACKLOG.md:153');
        expect(t).toContain('duration < 100 ms');
    };

    it('sale en CADA corrida, no en un acta que nadie abre', () => {
        const comprobar = (s: Salida): void => exigirCeguera(s.out);
        // El brazo del mutante es el que importa: la declaración es una línea de
        // salida, o sea lo más fácil del mundo de borrar «para limpiar ruido».
        pinza('R13', comprobar);
    });

    it('sale también en `--help`, que es donde mira quien no ha corrido nada todavía', () => {
        const s = correr(['--help']);
        expect(s.code).toBe(0);
        exigirCeguera(s.out);
    });

    it('y está en la cabecera del fichero, para quien lo abre a editarlo', () => {
        const fuente = fs.readFileSync(INSTRUMENTO, 'utf8');
        const cabecera = fuente.slice(0, fuente.indexOf("import { readFileSync"));
        expect(cabecera).toContain('CEGUERA IRREDUCIBLE');
        expect(cabecera).toContain('WP-V90-jest-determinista.md:357');
        expect(cabecera).toContain('plan/BACKLOG.md:153');
    });
});

// =============================================================================
// § 6 · EL CUADRE — un recuento que no cierra no emite veredicto
// =============================================================================

describe('WP-V99 · § 6 · el cuadre del denominador', () => {
    it('si se pierde una cita por el camino, el barrido CALLA y sale 2', () => {
        // Se rompe UN contador —exactamente el modo de fallo de la ceguera 2,
        // citas que desaparecen sin que nadie lo note— y el instrumento se niega
        // a dar veredicto. Un PASS sobre un denominador que no cuadra es el
        // fallo que este instrumento existe para vigilar.
        const soloContador = mutante(CENSO.R14[0]);
        const s = correr(args(), soloContador);
        expect(s.code).toBe(2);
        expect(s.err).toContain('CUADRE ROTO');
        expect(s.out).not.toContain('VEREDICTO:');
    });

    it('y si además se retira el cuadre, la pérdida vuelve a ser silenciosa', () => {
        // La otra mitad de la pinza: quien quita el cuadre no rompe nada visible
        // hoy —por eso el mutante del cuadre a solas sobreviviría— pero devuelve
        // al instrumento la capacidad de perder citas en silencio. El par
        // demuestra qué línea es la que lo impide.
        const conCuadreQuitado = mutante(...CENSO.R14);
        const s = correr(args(), conCuadreQuitado);
        expect(s.code).not.toBe(2);
        expect(s.todo).not.toContain('CUADRE ROTO');
        expect(s.out).toContain('VEREDICTO:');
        // El veredicto sale sobre un recuento que no cierra, y lo firma como OK.
        expect(cifras(s.out).ok).toBe(0);
        expect(cifras(s.out).extraidas).toBe(14);
        expect(s.out).toContain('cuadre: miradas(10) + no-miradas(2) = 14');
        expect(s.out).toContain('OK');
    });
});

// =============================================================================
// § 7 · CENSO DE MUTACIÓN — ninguna regla sin caso rojo, ningún superviviente
// =============================================================================

describe('WP-V99 · § 7 · censo de mutación', () => {
    /** Las reglas que el instrumento declara, por su id. */
    function reglasDeclaradas(): string[] {
        const s = correr(['--reglas']);
        expect(s.code).toBe(0);
        return s.out.trim().split('\n').map(l => l.split('\t')[0]);
    }

    it('cada regla que el instrumento declara tiene mutación registrada, y al revés', () => {
        // Si alguien añade una regla a `--reglas` y no la mutación, este test
        // dice cuál. Si alguien registra una mutación de una regla que ya no
        // existe, también. Es el único punto donde el censo puede quedar cojo
        // sin que nada más se entere.
        const declaradas = reglasDeclaradas();
        expect(declaradas.length).toBeGreaterThan(0);
        expect([...declaradas].sort()).toEqual(Object.keys(CENSO).sort());
    });

    it('cada regla del instrumento, rota, cambia lo que el instrumento hace', () => {
        // La CA de este WP dicha al derecho: **romper una regla del barrido tiene
        // que enrojecer**. Aquí se rompen TODAS, una a una, y se exige que
        // ninguna sobreviva. Un mutante superviviente es una regla que nadie
        // vigila, y sale con su id.
        const supervivientes: string[] = [];
        for (const id of Object.keys(CENSO)) {
            const s = correr(args(), mutante(...CENSO[id]));
            if (s.out === REAL.out && s.code === REAL.code) supervivientes.push(id);
        }
        expect(supervivientes).toEqual([]);
    });
});

// =============================================================================
// § 8 · CONTRATO DE LÍNEA DE ÓRDENES — se prueba lo que el mundo usa
// =============================================================================

describe('WP-V99 · § 8 · el contrato de línea de órdenes', () => {
    it('sin rancias sale 0; con rancias sale 1', () => {
        // El ámbito `plan` del mundo sintético no tiene ningún `.md` suelto, así
        // que es el ámbito vacío: cero citas, cero rancias, exit 0.
        const vacio = correr(['--raiz', MUNDO, '--ambito', 'plan']);
        expect(vacio.code).toBe(0);
        expect(vacio.out).toContain('citas ruta[:linea] extraidas : 0');
        expect(vacio.out).toContain('VEREDICTO: PASS (0 rancias / 0 citas)');
        expect(REAL.code).toBe(1);
    });

    it('un ámbito que no existe sale 2, y no se inventa un PASS sobre cero documentos', () => {
        const s = correr(['--raiz', MUNDO, '--ambito', 'plan/NO-EXISTE']);
        expect(s.code).toBe(2);
        expect(s.err).toContain('el ambito no existe');
        expect(s.out).not.toContain('VEREDICTO');
    });

    it('un argumento no reconocido sale 2 en vez de barrer otra cosa', () => {
        const s = correr(['--raiz', MUNDO, '--anbito', 'plan']);
        expect(s.code).toBe(2);
        expect(s.err).toContain('argumento no reconocido');
    });

    it('`--reglas` es legible por máquina: id, nombre y qué hace, separados por tabulador', () => {
        const s = correr(['--reglas']);
        for (const l of s.out.trim().split('\n')) {
            expect(l.split('\t')).toHaveLength(3);
            expect(l).toMatch(/^R\d+\t[a-z-]+\t\S/);
        }
    });

    it('`--json-out` vuelca exactamente las rancias que la salida nombra', () => {
        const destino = path.join(TMP, 'rancias.json');
        const s = correr(args('--json-out', destino));
        expect(s.code).toBe(1);
        const json = JSON.parse(fs.readFileSync(destino, 'utf8')) as Array<{ inf: string; ln: number; cita: string }>;
        expect(json.map(r => r.inf + ':' + r.ln + ' ' + r.cita).sort()).toEqual([
            'r02-raiz.md:3 package.json:35',
            'r10-rancia.md:3 src/podado.ts',
            'r10-rancia.md:4 src/largo.ts:40'
        ]);
    });

    it('la raíz por defecto es la del REPO, no el directorio desde el que se invoque', () => {
        // Un gate que cambia de objeto según desde dónde lo llames no es un gate:
        // el mismo `node scripts/citas-rancias.mjs` tiene que barrer lo mismo
        // desde la raíz y desde un subdirectorio. Se comprueba con la línea
        // `raiz :` que el propio instrumento imprime, no suponiéndolo.
        const desdeLaRaiz = spawnSync(process.execPath, [INSTRUMENTO, '--ambito', 'plan/NO-EXISTE'],
            { cwd: RAIZ, encoding: 'utf8', windowsHide: true });
        const desdeOtroSitio = spawnSync(process.execPath, [INSTRUMENTO, '--ambito', 'plan/NO-EXISTE'],
            { cwd: TMP, encoding: 'utf8', windowsHide: true });
        // El mensaje de ámbito inexistente lleva la raíz resuelta dentro.
        expect(desdeOtroSitio.stderr).toBe(desdeLaRaiz.stderr);
        expect(desdeLaRaiz.stderr).toContain(path.join(RAIZ, 'plan', 'NO-EXISTE'));
    });
});
