// =============================================================================
// scripts/tests/rojos-jest.test.ts · el gate del gate — WP-V91
// =============================================================================
//
// QUÉ VIGILA ESTO
//   `scripts/rojos-jest.mjs` decide si el conjunto de rojos de la suite cambió.
//   Emite CUATRO clases (FALLA / OMITE / SUITE / SINNOMBRE) y tiene TRES guardas
//   (multiplicidad, ejecución efectiva, frescura), más dos laterales (cobertura,
//   paralelismo). Hasta este fichero, ninguna de ellas tenía un test.
//
//   Y no eran precaución teórica: las tres guardas existen porque las tres
//   FALLARON en la contrarrevisión de WP-V90. Son cicatrices. Sin test, la
//   próxima edición del instrumento las deshace sin que nada se ponga rojo.
//
// LA FORMA DE CADA TEST: LA PINZA
//   Un test que sólo comprueba «el instrumento dice X» no prueba que vigile
//   nada: un instrumento que imprimiera siempre X lo pasaría. Así que cada
//   clase y cada guarda se comprueba con DOS brazos:
//
//     1. el instrumento REAL cumple la aserción;
//     2. un MUTANTE —copia del instrumento con ese trozo concreto desactivado—
//        NO la cumple.
//
//   El brazo 2 es la CA de este WP dicha al derecho: **mutar el instrumento
//   pone roja su propia suite.** Si un mutante sobrevive, el test que lo
//   descubre se pone rojo con el nombre del superviviente.
//
// POR QUÉ SE INVOCA COMO SUBPROCESO Y NO SE IMPORTA
//   El instrumento es un ejecutable: despacha sobre `process.argv` y termina
//   con `process.exit()`. Importarlo dentro de jest ejecutaría ese despacho con
//   los argumentos de JEST y mataría al worker. Además, lo que el mundo
//   consume del instrumento es su CONTRATO DE LÍNEA DE ÓRDENES —salida y código
//   de salida—, no sus funciones. Se prueba lo que se usa.
//
// AISLAMIENTO DEL PRODUCTO (y su precio, declarado)
//   Este fichero NO corre la suite del producto. Ni una vez. Trabaja con
//   informes sintéticos con forma de jest y con proyectos jest MÍNIMOS en un
//   directorio temporal fuera del árbol. Consecuencia buscada: estos tests se
//   ponen rojos cuando se rompe el INSTRUMENTO, y no cuando cambia el PRODUCTO.
//   El precio está escrito en el reporte del WP (§ «qué queda sin cubrir»).
// =============================================================================

import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const RAIZ = path.resolve(__dirname, '..', '..');
const INSTRUMENTO = path.join(RAIZ, 'scripts', 'rojos-jest.mjs');

/** Tope para lo que arranca un jest de verdad. Generoso a propósito: bajo la
 *  contención de la propia suite un jest mínimo puede tardar bastante, y un
 *  rojo por impaciencia sería exactamente el flapeo que WP-V90 vino a matar. */
const TOPE_JEST_REAL = 180_000;

interface Salida {
    code: number;
    out: string;
    err: string;
    todo: string;
}

let TMP = '';

// --- § 0 · arnés --------------------------------------------------------------

/**
 * Tope por defecto de TODO este fichero.
 *
 * Cada test de aquí lanza al menos un subproceso, y varios lanzan dos. El tope
 * de la casa son 10 s (`jest.config.js:46`); bajo la contención de la propia
 * suite el peor margen medido para los tests «rápidos» de este fichero cae a
 * ~3×, que es poco margen para algo que sólo puede fallar por impaciencia. El
 * mismo argumento por el que los siete tests con jest real llevan 180 s vale
 * para los demás, así que se sube el suelo de todo el fichero.
 */
jest.setTimeout(60_000);

/** Invoca el instrumento (o un mutante suyo) como lo invoca el mundo. */
function correr(args: string[], guion: string = INSTRUMENTO, entorno: Record<string, string> = {}): Salida {
    const r = spawnSync(process.execPath, [guion, ...args], {
        cwd: RAIZ,
        encoding: 'utf8',
        windowsHide: true,
        env: { ...process.env, FORCE_COLOR: '0', ...entorno }
    });
    if (r.error) throw r.error;
    const out = r.stdout || '';
    const err = r.stderr || '';
    return { code: r.status === null ? -1 : r.status, out, err, todo: out + err };
}

/** Ruta absoluta DENTRO del árbol: el instrumento la relativiza a `tests/…`. */
function enElArbol(rel: string): string {
    return path.join(RAIZ, rel);
}

/** Escribe un informe con forma de jest. `startTime` = ahora salvo que se diga. */
function informe(nombre: string, cuerpo: Record<string, unknown>): string {
    const ruta = path.join(TMP, nombre);
    fs.writeFileSync(ruta, JSON.stringify({ startTime: Date.now(), ...cuerpo }, null, 1));
    return ruta;
}

function baseline(nombre: string, lineas: string[]): string {
    const ruta = path.join(TMP, nombre);
    fs.writeFileSync(ruta, lineas.length ? lineas.join('\n') + '\n' : '');
    return ruta;
}

let nMutantes = 0;

/**
 * Copia del instrumento con uno o varios trozos sustituidos.
 *
 * Si un ancla no aparece EXACTAMENTE una vez, este helper revienta en lugar de
 * mutar a ciegas. Es deliberado: una mutación que ya no apunta a nada no
 * prueba nada, y el fallo tiene que ser ruidoso. Si alguien refactoriza el
 * instrumento, el mensaje dice qué reapuntar.
 */
function mutante(...reemplazos: Array<[string, string]>): string {
    let texto = fs.readFileSync(INSTRUMENTO, 'utf8');
    for (const [de, a] of reemplazos) {
        const veces = texto.split(de).length - 1;
        if (veces !== 1) {
            throw new Error(
                'MUTACIÓN SIN ANCLA: «' + de + '» aparece ' + veces + ' veces en ' +
                'scripts/rojos-jest.mjs (se esperaba 1).\n' +
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
function elMutanteDebeCaer(
    guion: string,
    args: string[],
    comprobar: (s: Salida) => void
): Salida {
    const s = correr(args, guion);
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
            '  argumentos : ' + args.join(' ') + '\n' +
            '  código     : ' + s.code + '\n' +
            '  salida     : ' + (s.todo.trim() || '(vacía)')
        );
    }
    return s;
}

/**
 * La pinza: el instrumento real cumple, el mutante no.
 * Devuelve la salida del MUTANTE, para poder aseverar además QUÉ hace de malo.
 */
function pinza(
    args: string[],
    comprobar: (s: Salida) => void,
    ...mutacion: Array<[string, string]>
): Salida {
    comprobar(correr(args));
    return elMutanteDebeCaer(mutante(...mutacion), args, comprobar);
}

/** El binario de jest, resuelto como lo resuelve el instrumento (sin `npx`). */
function binarioJest(): string {
    const require_ = createRequire(path.join(RAIZ, 'package.json'));
    return require_.resolve('jest/bin/jest');
}

/** Corre jest de verdad sobre un proyecto mínimo y devuelve la ruta del JSON. */
function correrJestMinimo(config: string, salidaJson: string): Salida {
    const r = spawnSync(
        process.execPath,
        [binarioJest(), '--json', '--outputFile=' + salidaJson, '--config=' + config],
        { cwd: RAIZ, encoding: 'utf8', windowsHide: true }
    );
    return {
        code: r.status === null ? -1 : r.status,
        out: r.stdout || '',
        err: r.stderr || '',
        todo: (r.stdout || '') + (r.stderr || '')
    };
}

// --- proyectos jest mínimos, fuera del árbol -----------------------------------

interface Mini {
    dir: string;
    config: string;
}

function escribirMini(nombre: string, ficheros: Record<string, string>, extraConfig: Record<string, unknown> = {}): Mini {
    const dir = path.join(TMP, nombre);
    fs.mkdirSync(dir, { recursive: true });
    for (const [f, contenido] of Object.entries(ficheros)) {
        fs.writeFileSync(path.join(dir, f), contenido);
    }
    const config = path.join(TMP, nombre + '.config.json');
    fs.writeFileSync(
        config,
        JSON.stringify({
            rootDir: dir,
            testEnvironment: 'node',
            testMatch: ['**/*.test.js'],
            transform: {},
            ...extraConfig
        })
    );
    return { dir, config };
}

let miniA: Mini;
let miniRota: Mini;
let miniSoloRota: Mini;
let miniSinNombre: Mini;
let miniCobertura: Mini;
let miniAlterna: Mini;
let espiaCobertura = '';
let contadorAlterna = '';

// Informes sintéticos, nombrados una vez y reutilizados.
let fxClases = '';
let fxSinNombre = '';
let fxClon = '';
let fxSinMedida = '';
let fxRancio = '';
let fxCobertura = '';
let fxOrden = '';
let fxRaizAjena = '';
let fxFuturo = '';
let baseClonUno = '';
let baseVacia = '';

beforeAll(() => {
    TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'v91-instrumento-'));

    // ---- informes sintéticos con forma de jest --------------------------------
    fxClases = informe('clases.json', {
        success: false,
        numTotalTests: 4,
        testResults: [
            {
                name: enElArbol('tests/unit/uno.test.ts'),
                status: 'failed',
                assertionResults: [
                    // El nombre trae un salto de línea y espacios de más a propósito:
                    // una línea del conjunto tiene que ser UNA línea.
                    { fullName: 'V91 grupo  rojo\n  llano', title: 'rojo llano', status: 'failed' },
                    { fullName: 'V91 grupo verde', title: 'verde', status: 'passed' },
                    { fullName: 'V91 grupo saltado', title: 'saltado', status: 'pending' },
                    { fullName: 'V91 grupo por hacer', title: 'por hacer', status: 'todo' }
                ]
            },
            {
                name: enElArbol('tests/unit/rota.test.ts'),
                status: 'failed',
                assertionResults: [],
                // Con ANSI dentro: el conjunto no puede llevar códigos de color.
                message: '\u001b[31m● Test suite failed to run\u001b[39m\n\n  Cannot find module ./no-existe'
            }
        ]
    });

    fxSinNombre = informe('sinnombre.json', {
        success: false,
        numTotalTests: 7,
        testResults: [
            {
                name: enElArbol('tests/unit/todoverde.test.ts'),
                status: 'passed',
                assertionResults: [{ fullName: 'V91 todo verde', title: 'v', status: 'passed' }]
            }
        ]
    });

    fxClon = informe('clon.json', {
        success: false,
        numTotalTests: 2,
        testResults: [
            {
                name: enElArbol('tests/unit/clon.test.ts'),
                status: 'failed',
                assertionResults: [
                    { fullName: 'V91 clonado', title: 'clonado', status: 'failed' },
                    { fullName: 'V91 clonado', title: 'clonado', status: 'failed' }
                ]
            }
        ]
    });
    baseClonUno = baseline('clon.base.txt', ['FALLA tests/unit/clon.test.ts :: V91 clonado']);

    // «success: true, numTotalTests: 0» NO es rebuscado: es lo que deja jest
    // cuando `--passWithNoTests` se junta con un patrón que no casa con nada.
    // Sin la guarda, eso es un conjunto vacío que coincide con un baseline
    // vacío: «no medí» presentado como «verde».
    fxSinMedida = informe('sinmedida.json', { success: true, numTotalTests: 0, testResults: [] });
    baseVacia = baseline('base-vacia.txt', []);

    fxRancio = informe('rancio.json', {
        success: false,
        numTotalTests: 2,
        startTime: Date.now() - 3600 * 1000,
        testResults: [
            {
                name: enElArbol('tests/unit/clon.test.ts'),
                status: 'failed',
                assertionResults: [{ fullName: 'V91 clonado', title: 'clonado', status: 'failed' }]
            }
        ]
    });

    fxCobertura = informe('cobertura.json', {
        success: false,
        numTotalTests: 2,
        coverageMap: { 'src/a.ts': { path: 'src/a.ts' } },
        testResults: [
            {
                name: enElArbol('tests/unit/clon.test.ts'),
                status: 'failed',
                assertionResults: [{ fullName: 'V91 clonado', title: 'clonado', status: 'failed' }]
            }
        ]
    });

    // El orden de ENTRADA está a propósito al revés del orden canónico.
    fxOrden = informe('orden.json', {
        success: false,
        numTotalTests: 4,
        testResults: [
            {
                name: enElArbol('tests/unit/zeta.test.ts'),
                status: 'failed',
                assertionResults: [
                    { fullName: 'V91 zzz', title: 'zzz', status: 'failed' },
                    { fullName: 'V91 aaa', title: 'aaa', status: 'failed' },
                    // MAYÚSCULA y EÑE: sin ellas, el orden por unidad de código y
                    // el orden por locale COINCIDEN, y la fixture no distingue las
                    // dos implementaciones — o sea, no vigila nada. MEDIDO:
                    //   unidad de código → Zulu, aaa, mmm, zzz, ñu
                    //   locale           → aaa, mmm, ñu, Zulu, zzz
                    { fullName: 'V91 Zulu', title: 'Zulu', status: 'failed' },
                    { fullName: 'V91 ñu', title: 'ñu', status: 'failed' }
                ]
            },
            {
                name: enElArbol('tests/unit/alfa.test.ts'),
                status: 'failed',
                assertionResults: [
                    { fullName: 'V91 mmm', title: 'mmm', status: 'failed' },
                    { fullName: 'V91 bbb', title: 'bbb', status: 'pending' }
                ]
            }
        ]
    });

    // Una ruta de CI (linux) sobre un baseline escrito en Windows: el informe
    // viene de OTRA raíz y aun así tiene que dar la misma línea.
    fxRaizAjena = informe('raiz-ajena.json', {
        success: false,
        numTotalTests: 1,
        testResults: [
            {
                name: '/home/runner/work/V_SDK/V_SDK/tests/unit/ci.test.ts',
                status: 'failed',
                assertionResults: [{ fullName: 'V91 rojo nacido en CI', title: 'x', status: 'failed' }]
            }
        ]
    });

    fxFuturo = informe('futuro.json', {
        success: false,
        numTotalTests: 1,
        startTime: Date.now() + 600 * 1000,
        testResults: [
            {
                name: enElArbol('tests/unit/clon.test.ts'),
                status: 'failed',
                assertionResults: [{ fullName: 'V91 clonado', title: 'clonado', status: 'failed' }]
            }
        ]
    });

    // ---- proyectos jest mínimos ----------------------------------------------
    miniA = escribirMini('paqueteA', {
        'verde.test.js':
            "describe('V91-A', () => { test('verde que no debe salir', () => { expect(1).toBe(1); }); });\n",
        'rojo.test.js':
            "describe('V91-A', () => {\n" +
            "  test('rojo llano', () => { expect(1).toBe(2); });\n" +
            // Dos `it` HOMÓNIMOS, ambos en rojo: el vector B1 con jest de verdad.
            "  test('rojo clonado', () => { expect('a').toBe('b'); });\n" +
            "  test('rojo clonado', () => { expect('a').toBe('c'); });\n" +
            "  test.skip('saltado a proposito', () => {});\n" +
            "  test.todo('por escribir');\n" +
            '});\n'
    });

    // Con un verde al lado: la corrida SÍ ejecuta tests, así que la clase SUITE
    // llega a emitirse. (Si la suite rota va sola, gana la guarda 2 — se prueba
    // aparte, con `miniSoloRota`.)
    miniRota = escribirMini('paqueteRota', {
        'verde.test.js': "test('V91 verde que sí se ejecuta', () => { expect(1).toBe(1); });\n",
        'rota.test.js': "require('./no_existe_en_absoluto');\ntest('nunca llega', () => {});\n"
    });

    miniSoloRota = escribirMini('paqueteSoloRota', {
        'rota.test.js': "require('./no_existe_en_absoluto');\ntest('nunca llega', () => {});\n"
    });

    // Proyecto que da un conjunto DISTINTO en cada corrida sin usar azar: lleva
    // la cuenta en disco y sólo falla la primera vez. Así el detector de
    // discrepancias de `--repetir` se puede probar con una secuencia
    // determinista, sin meter un test que flapee en la suite del mundo.
    contadorAlterna = path.join(TMP, 'contador-alterna.txt');
    miniAlterna = escribirMini('paqueteAlterna', {
        'alterna.test.js':
            "const fs = require('fs');\n" +
            'const contador = ' + JSON.stringify(contadorAlterna) + ';\n' +
            'let n = 0;\n' +
            "try { n = Number(fs.readFileSync(contador, 'utf8')) || 0; } catch { n = 0; }\n" +
            'n += 1;\n' +
            'fs.writeFileSync(contador, String(n));\n' +
            "test('V91 rojo sólo en la primera corrida', () => { expect(n).toBeGreaterThan(1); });\n"
    });

    // Corrida en la que TODO pasa y aun así jest fracasa: un reportero que
    // declara error. Es una de las tres causas que el propio instrumento nombra
    // en el texto de SINNOMBRE, y no depende del producto ni de la cobertura.
    miniSinNombre = escribirMini(
        'paqueteSinNombre',
        {
            'verde.test.js': "test('V91 verde y aun asi la corrida fracasa', () => { expect(1).toBe(1); });\n",
            'reportero.js':
                'class ReporteroQueFalla {\n' +
                '  onRunComplete() {}\n' +
                "  getLastError() { return new Error('V91: el reportero declara la corrida fallida'); }\n" +
                '}\n' +
                'module.exports = ReporteroQueFalla;\n'
        },
        {}
    );
    // El reportero se declara con ruta absoluta, ya conocido el directorio.
    fs.writeFileSync(
        miniSinNombre.config,
        JSON.stringify({
            rootDir: miniSinNombre.dir,
            testEnvironment: 'node',
            testMatch: ['**/*.test.js'],
            transform: {},
            reporters: [path.join(miniSinNombre.dir, 'reportero.js')]
        })
    );

    // Proyecto que PIDE cobertura en su config, con un reportero que delata qué
    // cobertura resolvió jest de verdad. Sirve para comprobar que `--gate`
    // impone `--coverage=false` por encima de la config.
    espiaCobertura = path.join(TMP, 'espia-cobertura.json');
    miniCobertura = escribirMini('paqueteCobertura', {
        'verde.test.js': "test('V91 verde', () => { expect(1).toBe(1); });\n",
        'espia.js':
            "const fs = require('fs');\n" +
            'class EspiaDeCobertura {\n' +
            '  constructor(globalConfig) {\n' +
            '    fs.writeFileSync(' +
            JSON.stringify(espiaCobertura) +
            ", JSON.stringify({ collectCoverage: globalConfig.collectCoverage }));\n" +
            '  }\n' +
            '  onRunComplete() {}\n' +
            '}\n' +
            'module.exports = EspiaDeCobertura;\n'
    });
    fs.writeFileSync(
        miniCobertura.config,
        JSON.stringify({
            rootDir: miniCobertura.dir,
            testEnvironment: 'node',
            testMatch: ['**/*.test.js'],
            transform: {},
            collectCoverage: true,
            reporters: ['default', path.join(miniCobertura.dir, 'espia.js')]
        })
    );
});

afterAll(() => {
    if (TMP) fs.rmSync(TMP, { recursive: true, force: true });
});

// =============================================================================
// § 1 · LAS CUATRO CLASES
// =============================================================================

describe('WP-V91 · las cuatro clases del conjunto', () => {
    it('FALLA · el rojo sale con su nombre completo, en UNA línea, y el verde no sale', () => {
        const comprobar = (s: Salida): void => {
            expect(s.code).toBe(0);
            // El salto de línea y los espacios dobles del nombre se han colapsado.
            expect(s.out).toContain('FALLA tests/unit/uno.test.ts :: V91 grupo rojo llano');
        };

        // Y, de paso, lo que NO debe aparecer nunca (esto lo cumple el real).
        const real = correr([fxClases]);
        expect(real.out).not.toContain('V91 grupo verde');
        expect(real.out.split('\n').filter(Boolean)).toHaveLength(4);

        pinza(
            [fxClases],
            comprobar,
            ["lineas.push('FALLA ' + fichero + ' :: ' + nombre);", '/* clase FALLA desactivada */;']
        );
    });

    it('OMITE · skip y todo entran al conjunto con su estado — si no, un `it.skip` borra un rojo', () => {
        const comprobar = (s: Salida): void => {
            expect(s.out).toContain('OMITE tests/unit/uno.test.ts :: [pending] V91 grupo saltado');
            expect(s.out).toContain('OMITE tests/unit/uno.test.ts :: [todo] V91 grupo por hacer');
        };

        const delMutante = pinza(
            [fxClases],
            comprobar,
            ["} else if (t.status !== 'passed') {", '} else if (false) {']
        );
        // Sin la clase, las dos omisiones desaparecen y el conjunto ENCOGE.
        expect(delMutante.out).not.toContain('OMITE');
    });

    it('SUITE · una suite que muere sin ejecutar un test no encoge el conjunto (y sin ANSI)', () => {
        const comprobar = (s: Salida): void => {
            expect(s.out).toContain('SUITE tests/unit/rota.test.ts :: ● Test suite failed to run');
        };

        const real = correr([fxClases]);
        expect(real.out).not.toContain('\u001b['); // ni un código de color en el conjunto

        const delMutante = pinza(
            [fxClases],
            comprobar,
            ["if (suite.status === 'failed' && fallidas === 0) {", 'if (false) {']
        );
        expect(delMutante.out).not.toContain('SUITE');
    });

    it('SINNOMBRE · sin esta clase el instrumento emite CERO líneas y el gate aplaude', () => {
        const comprobar = (s: Salida): void => {
            expect(s.out).toContain('SINNOMBRE (toda la corrida) ::');
        };

        const real = correr([fxSinNombre]);
        expect(real.out.split('\n').filter(Boolean)).toHaveLength(1); // es la ÚNICA línea

        const delMutante = pinza(
            [fxSinNombre],
            comprobar,
            ['if (informe.success === false && !explicado) {', 'if (false) {']
        );
        // Éste es el punto entero de la clase: una corrida que jest da por
        // FALLIDA y de la que el instrumento no sabría decir absolutamente nada.
        expect(delMutante.out).toBe('');
        expect(delMutante.code).toBe(0);
    });

    // --- los dos siguientes NACEN de un mutante que sobrevivió a la suite -----

    it('ORDEN CANÓNICO · por unidad de código, no por locale', () => {
        // La promesa de cabecera del instrumento es «salida byte a byte igual
        // entre corridas y entre sistemas operativos» (`rojos-jest.mjs:17`), y
        // la sostiene UNA línea: `lineas.sort(ordenEstable)`.
        //
        // Este test se ha tenido que reescribir dos veces, y la segunda es la
        // lección: la primera versión sólo mataba al mutante que INVIERTE el
        // orden. El mutante realista —cambiar el comparador por uno sensible a
        // la locale, que es como se rompe de verdad la portabilidad— SOBREVIVÍA
        // 28/28, porque la fixture era todo ASCII minúscula y ahí los dos
        // comparadores dan el mismo resultado. Una fixture que no distingue dos
        // implementaciones no vigila ninguna. Ahora lleva mayúscula y eñe.
        const esperado =
            [
                'FALLA tests/unit/alfa.test.ts :: V91 mmm',
                'FALLA tests/unit/zeta.test.ts :: V91 Zulu',
                'FALLA tests/unit/zeta.test.ts :: V91 aaa',
                'FALLA tests/unit/zeta.test.ts :: V91 zzz',
                'FALLA tests/unit/zeta.test.ts :: V91 ñu',
                'OMITE tests/unit/alfa.test.ts :: [pending] V91 bbb'
            ].join('\n') + '\n';

        const comprobar = (s: Salida): void => {
            expect(s.out).toBe(esperado);
        };

        // Mutante 1: el orden invertido.
        pinza([fxOrden], comprobar, ['    lineas.sort(ordenEstable);', '    lineas.sort(ordenEstable).reverse();']);

        // Mutante 2, el que importa: un comparador por locale. Es la vía por la
        // que esta promesa se rompe de verdad — nadie invierte un `sort` a
        // propósito, pero cambiar `a < b` por `a.localeCompare(b)` parece una
        // mejora inocente.
        elMutanteDebeCaer(
            mutante(['    return a < b ? -1 : a > b ? 1 : 0;', '    return a.localeCompare(b);']),
            [fxOrden],
            comprobar
        );
    });

    it('RAÍZ AJENA · un informe hecho en CI da la MISMA línea que uno hecho aquí', () => {
        // El baseline se escribe en un árbol y se compara en otro. Si la ruta
        // no se normaliza igual, TODO el conjunto sale distinto y el gate se
        // vuelve inservible justo donde más falta hace. Otro superviviente.
        const comprobar = (s: Salida): void => {
            expect(s.out).toBe('FALLA tests/unit/ci.test.ts :: V91 rojo nacido en CI\n');
        };
        pinza([fxRaizAjena], comprobar, ["const i = partes.lastIndexOf('tests');", 'const i = -1;']);
    });
});

// =============================================================================
// § 2 · LAS TRES GUARDAS — las tres son cicatrices de la contrarrevisión de V90
// =============================================================================

describe('WP-V91 · las tres guardas', () => {
    it('GUARDA 1 · MULTIPLICIDAD: un rojo nuevo homónimo de uno declarado no pasa', () => {
        const args = ['--check', baseClonUno, fxClon];
        const comprobar = (s: Salida): void => {
            expect(s.code).toBe(1);
            expect(s.out).toContain('conjunto de rojos DISTINTO del declarado');
            expect(s.out).toContain('+ FALLA tests/unit/clon.test.ts :: V91 clonado   [sobran 1 de 2]');
        };

        // La mutación devuelve `diff()` a la semántica de `Set`: exactamente
        // como estaba escrito hasta la devolución de V90.
        const delMutante = pinza(
            args,
            comprobar,
            ['for (const l of lineas) m.set(l, (m.get(l) || 0) + 1);', 'for (const l of lineas) m.set(l, 1);']
        );

        // Y así es como se veía el fallo B1: dos rojos, uno declarado, EXIT 0.
        expect(delMutante.out).toContain('conjunto de rojos IDENTICO al declarado');
        expect(delMutante.code).toBe(0);
    });

    it('DIRECCIÓN «−» · un rojo que DESAPARECE también es un diff', () => {
        // BLOQUEANTE de la devolución, y era el agujero más grande: la suite
        // tenía cuatro aserciones sobre la rama `+` de `diff()` y CERO sobre la
        // rama `−`. Mutando esa rama, el instrumento decía «IDÉNTICO», EXIT 0,
        // y los 28 tests seguían en verde. Es una de las cuatro garantías que
        // la cabecera promete —«borrar un test tampoco cuela»— y no la vigilaba
        // nadie: un gate contra el encogimiento del conjunto, sin un solo test
        // de encogimiento.
        //
        // Importa porque es la dirección de la MEJORA APARENTE: apagar una
        // suite, borrar un test o un `describe.skip` encogen el conjunto, y sin
        // esta rama el gate lo aplaude.
        const declaraDos = baseline('encoge.base.txt', [
            'FALLA tests/unit/clon.test.ts :: V91 clonado',
            'FALLA tests/unit/uno.test.ts :: V91 rojo que alguien borró'
        ]);
        const informeConUno = informe('encoge.json', {
            success: false,
            numTotalTests: 2,
            testResults: [
                {
                    name: enElArbol('tests/unit/clon.test.ts'),
                    status: 'failed',
                    assertionResults: [{ fullName: 'V91 clonado', title: 'clonado', status: 'failed' }]
                }
            ]
        });

        const comprobar = (s: Salida): void => {
            expect(s.code).toBe(1);
            expect(s.out).toContain('conjunto de rojos DISTINTO del declarado');
            expect(s.out).toContain("- FALLA tests/unit/uno.test.ts :: V91 rojo que alguien borró");
        };

        const delMutante = pinza(
            ['--check', declaraDos, informeConUno],
            comprobar,
            ["if (tiene < n) fuera.push('- ' + l", "if (false) fuera.push('- ' + l"]
        );
        // Sin la rama, el conjunto encoge y el gate firma que todo sigue igual.
        expect(delMutante.out).toContain('conjunto de rojos IDENTICO al declarado');
        expect(delMutante.code).toBe(0);
    });

    it('DIRECCIÓN «−» · con multiplicidad: de dos rojos homónimos desaparece uno', () => {
        // La otra mitad de la rama `−`: no que falte la línea entera, sino que
        // falte UNA DE LAS DOS. El contador tiene que decir cuántas faltan.
        const declaraDos = baseline('encoge-multi.base.txt', [
            'FALLA tests/unit/clon.test.ts :: V91 clonado',
            'FALLA tests/unit/clon.test.ts :: V91 clonado'
        ]);
        const informeConUno = informe('encoge-multi.json', {
            success: false,
            numTotalTests: 2,
            testResults: [
                {
                    name: enElArbol('tests/unit/clon.test.ts'),
                    status: 'failed',
                    assertionResults: [{ fullName: 'V91 clonado', title: 'clonado', status: 'failed' }]
                }
            ]
        });
        const s = correr(['--check', declaraDos, informeConUno]);
        expect(s.code).toBe(1);
        expect(s.out).toContain('- FALLA tests/unit/clon.test.ts :: V91 clonado   [faltan 1 de 2]');
    });

    it('GUARDA 2 · EJECUCIÓN EFECTIVA: «no medí» no es «verde»', () => {
        const args = ['--check', baseVacia, fxSinMedida];
        const comprobar = (s: Salida): void => {
            expect(s.code).toBe(2);
            expect(s.todo).toContain('NO ejecutó ni un solo test');
            expect(s.out).toBe(''); // no se emite conjunto alguno
        };

        const delMutante = pinza(
            args,
            comprobar,
            ['if (!informe.numTotalTests || informe.numTotalTests < 1) {', 'if (false) {']
        );

        // Sin la guarda: cero tests ejecutados, cero rojos, baseline vacío…
        // y el gate firma que el mundo está bien.
        expect(delMutante.out).toContain('conjunto de rojos IDENTICO al declarado');
        expect(delMutante.code).toBe(0);
    });

    it('GUARDA 3 · FRESCURA: un informe rancio en la ruta esperada no pasa por medida', () => {
        const args = ['--check', baseClonUno, fxRancio];
        const comprobar = (s: Salida): void => {
            expect(s.code).toBe(2);
            expect(s.todo).toContain('el informe es VIEJO');
            expect(s.todo).toMatch(/arrancó hace 3\d{3} s \(tope 900 s\)/);
            expect(s.out).toBe('');
        };

        const delMutante = pinza(args, comprobar, ['if (edad > maxSeg) {', 'if (false) {']);

        // Sin la guarda, el JSON de hace una hora bendice la corrida de ahora.
        expect(delMutante.out).toContain('conjunto de rojos IDENTICO al declarado');
        expect(delMutante.code).toBe(0);
    });

    it('GUARDA 3.bis · un informe sin `startTime` no puede probar que sea fresco', () => {
        const sinMarca = informe('sin-starttime.json', {
            success: false,
            numTotalTests: 1,
            startTime: 0,
            testResults: [
                {
                    name: enElArbol('tests/unit/clon.test.ts'),
                    status: 'failed',
                    assertionResults: [{ fullName: 'V91 clonado', title: 'clonado', status: 'failed' }]
                }
            ]
        });
        const s = correr(['--check', baseClonUno, sinMarca]);
        expect(s.code).toBe(2);
        expect(s.todo).toContain('no trae startTime');
        expect(s.out).toBe('');
    });

    it('GUARDA 3.ter · un informe que dice venir del FUTURO tampoco es medida', () => {
        // La otra mitad de la guarda de frescura, y otro mutante superviviente:
        // un reloj adelantado (VM, CI, contenedor) haría que CUALQUIER informe
        // pareciera recién hecho para siempre. `edad` sale negativa y `edad >
        // maxSeg` nunca se cumple, así que hace falta mirarlo aparte.
        const comprobar = (s: Salida): void => {
            expect(s.code).toBe(2);
            expect(s.todo).toContain('haber arrancado en el futuro');
            expect(s.out).toBe('');
        };
        pinza(['--check', baseClonUno, fxFuturo], comprobar, ['if (edad < -60) morir(', 'if (false) morir(']);
    });

    it('GUARDA 3.quinquies · desactivar la frescura se puede, pero se dice en voz alta', () => {
        const s = correr(['--check', '--edad-max', '0', baseClonUno, fxRancio]);
        expect(s.code).toBe(0);
        expect(s.err).toContain('prueba de frescura DESACTIVADA a petición');
        expect(s.out).toContain('conjunto de rojos IDENTICO al declarado');
    });

    it('GUARDA 3.quater · `--edad-max` sin número NO puede apagar la guarda en silencio', () => {
        // DEFECTO HALLADO POR ESTE WP. `sacarValor` hacía `Number(v)` sin mirar:
        // con `--edad-max` al final (sin valor), o con «900s», salía NaN, y
        // `NaN > maxSeg` es false, así que la guarda se apagaba SIN AVISO y el
        // informe rancio pasaba con EXIT 0. Un dedo gordo desarmaba la guarda.
        const comprobar = (s: Salida): void => {
            expect(s.code).toBe(2);
            expect(s.todo).toContain('necesita un número de segundos');
            expect(s.out).toBe('');
        };

        for (const cola of [['--edad-max', '900s'], ['--edad-max', 'xyz']]) {
            comprobar(correr(['--check', baseClonUno, fxRancio, ...cola]));
        }

        // El caso sin valor ninguno, que es el más fácil de teclear sin querer.
        const delMutante = pinza(
            ['--check', baseClonUno, fxRancio, '--edad-max'],
            comprobar,
            ['if (!Number.isFinite(n)) {', 'if (false) {']
        );
        // Así se veía el defecto: la guarda muda y el informe rancio bendecido.
        expect(delMutante.code).toBe(0);
        expect(delMutante.out).toContain('conjunto de rojos IDENTICO al declarado');

        // Y con un número de verdad la guarda sigue funcionando como siempre.
        const sano = correr(['--check', baseClonUno, fxRancio, '--edad-max', '900']);
        expect(sano.code).toBe(2);
        expect(sano.todo).toContain('el informe es VIEJO');
    });
});

// =============================================================================
// § 3 · LAS GUARDAS LATERALES Y EL «NUNCA MUDO»
// =============================================================================

describe('WP-V91 · cobertura, paralelismo y el instrumento mudo', () => {
    it('COBERTURA · con `coverageMap` el fallo de umbral queda tapado, así que se corta', () => {
        const args = ['--check', baseClonUno, fxCobertura];
        const comprobar = (s: Salida): void => {
            expect(s.code).toBe(2);
            expect(s.todo).toContain('el informe trae cobertura (coverageMap)');
        };
        pinza(args, comprobar, ['if (trae && !permitir) {', 'if (false) {']);

        // Se puede levantar a mano, y entonces el conjunto sí se compara.
        const permitido = correr(['--check', '--permitir-cobertura', baseClonUno, fxCobertura]);
        expect(permitido.code).toBe(0);
        expect(permitido.out).toContain('conjunto de rojos IDENTICO al declarado');
    });

    it('PARALELISMO · `--repetir` se niega a medir determinismo en serie', () => {
        // MEDIDO en este árbol (6 suites que anotan su PID): `--maxWorkers=1`,
        // `--maxWorkers 1`, `-w 1` y `--runInBand` dejan jest en UN solo proceso.
        // Las cuatro formas serializan igual, así que las cuatro se rechazan.
        const comprobar = (s: Salida): void => {
            expect(s.code).toBe(2);
            expect(s.todo).toContain('estos argumentos serializan jest');
        };

        // Las ONCE formas que dejan jest en UN SOLO PROCESO. No es una lista de
        // formas imaginadas: es la lista MEDIDA con el arnés de 6 suites que
        // anotan su PID (jest 29.7.0, `--no-cache`, 12 CPU). La primera versión
        // de esta guarda cazaba las cuatro de la izquierda y dejaba pasar las
        // siete de la derecha — y con cualquiera de ellas `--repetir 10` habría
        // publicado «las 10 corridas dieron el MISMO conjunto» medido EN SERIE.
        const serializan = [
            ['--runInBand'], ['-i'], ['--maxWorkers=1'], ['-w', '1'],
            ['--max-workers=1'], ['--max-workers', '1'], ['--runInBand=true'], ['-i=true'],
            ['--maxWorkers=01'], ['--maxWorkers=1.0'], ['--maxWorkers=+1']
        ];
        for (const forma of serializan) {
            comprobar(correr(['--repetir', '2', '--', ...forma, '--config=v91-no-existe.json']));
        }

        // Y las que NO serializan no se rechazan (MEDIDO: 6 procesos las tres).
        // Sin estos controles la guarda podría cazarlo todo y parecería correcta.
        for (const forma of [['--maxWorkers=6'], ['--maxWorkers', '4'], ['--runInBand=false'], ['--maxWorkers=50%']]) {
            const s = correr(['--repetir', '2', '--', ...forma, '--config=v91-no-existe.json']);
            expect(s.todo).not.toContain('estos argumentos serializan jest');
        }

        pinza(
            ['--repetir', '2', '--', '--maxWorkers', '1', '--config=v91-no-existe.json'],
            comprobar,
            ['const culpables = argumentosSeriales(extra);', 'const culpables = [];']
        );
    });

    it('PARALELISMO · un porcentaje que resuelve a un proceso también serializa', () => {
        // Esto quedó DECLARADO como hueco conocido en la primera vuelta y no
        // cerrado, con el argumento de que depende de la máquina. El argumento
        // era malo: depende de la máquina, sí, y la máquina que importa es
        // ESTA, donde se está tomando la medida. MEDIDO con 12 CPU:
        //   9 % → 1 proceso · 10 % → 1 · 20 % → 2 · 25 % → 3 · 50 % → 6,
        // o sea floor(cpus × pct / 100), en cinco puntos.
        const cpus = os.cpus().length;
        const pctSerial = Math.max(1, Math.floor((100 * 1) / cpus)); // el mayor % que da 1
        const s = correr(['--repetir', '2', '--', '--maxWorkers=' + pctSerial + '%', '--config=v91-no-existe.json']);
        expect(s.code).toBe(2);
        expect(s.todo).toContain('estos argumentos serializan jest');

        // Y un porcentaje holgado no se rechaza en ninguna máquina razonable.
        const holgado = correr(['--repetir', '2', '--', '--maxWorkers=100%', '--config=v91-no-existe.json']);
        expect(holgado.todo).not.toContain('estos argumentos serializan jest');
    });

    it('PARALELISMO · medir en serie a petición sale 1: no vale como evidencia', () => {
        // El veredicto de `--repetir` sale 1 aunque las corridas coincidan, si
        // se midieron en serie. Sin este test, `seriales.length ? 1 : 0` → `0`
        // sobrevivía: el instrumento publicaría como evidencia de determinismo
        // una medida que él mismo declara inservible.
        const args = ['--repetir', '1', '--permitir-serial', '--', '--runInBand', '--config=' + miniRota.config];
        const comprobar = (s: Salida): void => {
            expect(s.out).toContain('corriendo EN SERIE a petición');
            expect(s.out).toContain('EN SERIE, no vale como evidencia');
            expect(s.code).toBe(1);
        };
        pinza(args, comprobar, ['process.exit(seriales.length ? 1 : 0);', 'process.exit(0);']);
    }, TOPE_JEST_REAL);

    it('`--repetir` exige un entero >= 1', () => {
        // Estaba en el reporte como «sonda que no dio nada», pero sin test: la
        // validación se podía borrar entera sin que nada se pusiera rojo.
        const comprobar = (s: Salida): void => {
            expect(s.code).toBe(2);
            expect(s.todo).toContain('--repetir necesita un entero >= 1');
        };
        for (const n of ['0', '-1', '1.5', 'abc', '']) {
            comprobar(correr(['--repetir', n, '--', '--config=v91-no-existe.json']));
        }
        pinza(
            ['--repetir', '0', '--', '--config=v91-no-existe.json'],
            comprobar,
            ['if (!Number.isInteger(n) || n < 1) morir(', 'if (false) morir(']
        );
    });

    it('PARALELISMO · con `--permitir-serial` se puede, pero el veredicto no vale como evidencia', () => {
        const s = correr(['--repetir', '2', '--permitir-serial', '--', '--runInBand', '--config=v91-no-existe.json']);
        // Corta más tarde (jest no escribe JSON), pero NO por la guarda de serie.
        expect(s.todo).not.toContain('estos argumentos serializan jest');
        expect(s.todo).toContain('corriendo EN SERIE a petición');
    });

    it('NUNCA MUDO · sin informe legible no se emite un conjunto vacío, se sale con 2', () => {
        const ausente = correr(['--check', baseClonUno, path.join(TMP, 'no-existe.json')]);
        expect(ausente.code).toBe(2);
        expect(ausente.out).toBe('');
        expect(ausente.todo).toContain('no existe el JSON de jest');

        const roto = path.join(TMP, 'roto.json');
        fs.writeFileSync(roto, '{ esto no es json');
        const ilegible = correr(['--check', baseClonUno, roto]);
        expect(ilegible.code).toBe(2);
        expect(ilegible.out).toBe('');
        expect(ilegible.todo).toContain('no se pudo interpretar');

        const ajeno = informe('ajeno.json', { success: false, numTotalTests: 3, testResults: undefined });
        const noEsDeJest = correr(['--check', baseClonUno, ajeno]);
        expect(noEsDeJest.code).toBe(2);
        expect(noEsDeJest.out).toBe('');
        expect(noEsDeJest.todo).toContain('no parece de jest');
    });

    it('NUNCA MUDO · sin baseline no hay comparación que valga', () => {
        const s = correr(['--check', path.join(TMP, 'no-existe.txt'), fxClon]);
        expect(s.code).toBe(2);
        expect(s.todo).toContain('no existe el baseline');
    });

    it('sin argumentos el instrumento no calla: uso y salida 2', () => {
        const s = correr([]);
        expect(s.code).toBe(2);
        expect(s.out).toContain('uso:');
    });
});

// =============================================================================
// § 4 · JEST DE VERDAD, sobre proyectos mínimos fuera del árbol
//
// Todo lo anterior es sintético: rápido y aislado, pero escrito por mí. Estos
// cinco tests cierran el flanco — que el JSON sintético se parezca al de jest
// es una hipótesis, y aquí se comprueba contra jest 29 real. Ninguno toca la
// suite del producto: cada uno corre su propio proyecto de dos ficheros.
// =============================================================================

describe('WP-V91 · contra jest de verdad (proyecto mínimo, no el producto)', () => {
    it(
        'las clases y la multiplicidad, sobre un informe que ha escrito jest',
        () => {
            const json = path.join(TMP, 'realA.json');
            const jest = correrJestMinimo(miniA.config, json);
            expect(fs.existsSync(json)).toBe(true);
            expect(jest.code).toBe(1); // hay rojos, jest sale 1

            const completo = baseline('realA.base.txt', [
                'FALLA rojo.test.js :: V91-A rojo clonado',
                'FALLA rojo.test.js :: V91-A rojo clonado',
                'FALLA rojo.test.js :: V91-A rojo llano',
                'OMITE rojo.test.js :: [pending] V91-A saltado a proposito',
                'OMITE rojo.test.js :: [todo] V91-A por escribir'
            ]);

            // El oráculo se escribió A MANO antes de correr; si el conjunto real
            // coincide, es que las clases hacen lo que dicen sobre jest real.
            const ok = correr(['--check', completo, json]);
            expect(ok.out).toContain('conjunto de rojos IDENTICO al declarado');
            expect(ok.code).toBe(0);

            // Y el vector B1 con jest de verdad: dos `it` homónimos en rojo, un
            // baseline que declara uno. El cardinal sube; el gate tiene que verlo.
            const soloUno = baseline('realA.base-menos.txt', [
                'FALLA rojo.test.js :: V91-A rojo clonado',
                'FALLA rojo.test.js :: V91-A rojo llano',
                'OMITE rojo.test.js :: [pending] V91-A saltado a proposito',
                'OMITE rojo.test.js :: [todo] V91-A por escribir'
            ]);
            const multi = correr(['--check', soloUno, json]);
            expect(multi.code).toBe(1);
            expect(multi.out).toContain('+ FALLA rojo.test.js :: V91-A rojo clonado   [sobran 1 de 2]');

            // Frescura sobre un informe REAL: el único retoque es `startTime`,
            // que es justo lo que hace el paso del tiempo. Esperar 900 s dentro
            // de un test no es una opción.
            const real = JSON.parse(fs.readFileSync(json, 'utf8'));
            const rancio = informe('realA-rancio.json', { ...real, startTime: Date.now() - 3600 * 1000 });
            const viejo = correr(['--check', completo, rancio]);
            expect(viejo.code).toBe(2);
            expect(viejo.todo).toContain('el informe es VIEJO');
        },
        TOPE_JEST_REAL
    );

    it(
        'el comando canónico `--gate` corre jest él mismo y compara',
        () => {
            const completo = baseline('gateA.base.txt', [
                'FALLA rojo.test.js :: V91-A rojo clonado',
                'FALLA rojo.test.js :: V91-A rojo clonado',
                'FALLA rojo.test.js :: V91-A rojo llano',
                'OMITE rojo.test.js :: [pending] V91-A saltado a proposito',
                'OMITE rojo.test.js :: [todo] V91-A por escribir'
            ]);
            const s = correr(['--gate', '--baseline', completo, '--', '--config=' + miniA.config]);
            expect(s.out).toContain('conjunto de rojos IDENTICO al declarado');
            expect(s.code).toBe(0);
        },
        TOPE_JEST_REAL
    );

    it(
        'SUITE · una suite que revienta al importarse, con jest real',
        () => {
            const s = correr(['--repetir', '1', '--', '--config=' + miniRota.config, '--coverage=false']);
            expect(s.code).toBe(0);
            // El mensaje exacto es de jest y cambia entre versiones: se asevera
            // la clase, el fichero y la causa, no la cadena entera.
            expect(s.out).toContain('SUITE rota.test.js :: ● Test suite failed to run');
            expect(s.out).toContain("Cannot find module './no_existe_en_absoluto'");
            // La cicatriz B2: el veredicto dice CUÁNTOS tests se ejecutaron.
            expect(s.out).toMatch(/las 1 corridas ejecutaron \d+ tests/);
        },
        TOPE_JEST_REAL
    );

    it(
        'SUITE · si la suite rota va SOLA no hay clase SUITE: gana la guarda 2, y está bien',
        () => {
            // Hallazgo de este WP, no previsto al escribir la suite. Una suite que
            // muere al importarse no ejecuta NI UN test; si es la única del
            // proyecto, `numTotalTests` vale 0 y la guarda de ejecución efectiva
            // corta ANTES de que la clase SUITE llegue a emitirse. Sale 2 («no
            // medí»), no 1 («el conjunto cambió»).
            //
            // Es el orden correcto —2 es más grave que 1— pero conviene tenerlo
            // escrito: la clase SUITE sólo aparece cuando ALGÚN otro test se
            // ejecutó. No es un conjunto de rojos completo de un mundo apagado.
            const s = correr(['--repetir', '1', '--', '--config=' + miniSoloRota.config, '--coverage=false']);
            expect(s.code).toBe(2);
            expect(s.todo).toContain('NO ejecutó ni un solo test');
            expect(s.out).not.toContain('SUITE');
        },
        TOPE_JEST_REAL
    );

    it(
        'SINNOMBRE · todos los tests en verde y aun así la corrida fracasa, con jest real',
        () => {
            const s = correr(['--gate', '--baseline', baseVacia, '--', '--config=' + miniSinNombre.config]);
            // Baseline VACÍO y ni un solo test en rojo: sin la clase SINNOMBRE
            // esto saldría 0 y el gate diría que el mundo está perfecto.
            expect(s.code).toBe(1);
            expect(s.out).toContain('+ SINNOMBRE (toda la corrida) ::');
        },
        TOPE_JEST_REAL
    );

    it(
        '`--gate` impone `--coverage=false` aunque la config del proyecto pida cobertura',
        () => {
            // Cuarto mutante superviviente. Esta línea del `--gate` es la que
            // impide que un fallo de umbral de cobertura —que en el JSON de jest
            // no deja rastro con nombre— quede TAPADO por cualquier rojo con
            // nombre. Sin ella, `SINNOMBRE` deja de poder saltar.
            const ejecutar = (guion: string): { collectCoverage: boolean } => {
                fs.rmSync(espiaCobertura, { force: true });
                correr(['--gate', '--baseline', baseVacia, '--', '--config=' + miniCobertura.config], guion);
                return JSON.parse(fs.readFileSync(espiaCobertura, 'utf8'));
            };

            // La config dice `collectCoverage: true`; el gate la desmiente.
            expect(ejecutar(INSTRUMENTO).collectCoverage).toBe(false);

            // Y si se le quita esa línea, jest corre CON cobertura: la config
            // del proyecto manda y el hueco de `SINNOMBRE` vuelve a abrirse.
            const sinImposicion = mutante([
                "if (!extra.some((a) => a.startsWith('--coverage'))) extra.unshift('--coverage=false');",
                ';'
            ]);
            expect(ejecutar(sinImposicion).collectCoverage).toBe(true);
        },
        TOPE_JEST_REAL
    );

    it(
        '`--gate` A SECAS: la invocación del mundo, con su baseline por defecto',
        () => {
            // La invocación real es `node scripts/rojos-jest.mjs --gate`, sin más.
            // Los otros tests le pasan `--baseline` explícito, así que la
            // resolución del baseline POR DEFECTO no la probaba nadie.
            //
            // Se corre contra el proyecto mínimo, no contra el producto: el
            // conjunto obtenido no se parece en nada al declarado, así que TODAS
            // las líneas del baseline real salen por la rama `−`. Prueba dos
            // cosas de una: que el baseline por defecto se lee, y la dirección
            // `−` con jest de verdad.
            //
            // Se cuenta contra el fichero, no contra su contenido: así el día que
            // V48 arregle los cinco rojos este test no se pone rojo de rebote.
            const declaradas = fs
                .readFileSync(path.join(RAIZ, 'scripts', 'rojos-jest.baseline.txt'), 'utf8')
                .split(/\r?\n/)
                .map((l) => l.trim())
                .filter((l) => l && !l.startsWith('#'));
            expect(declaradas.length).toBeGreaterThan(0);

            const s = correr(['--gate', '--', '--config=' + miniA.config]);
            expect(s.code).toBe(1);
            const menos = s.out.split('\n').filter((l) => l.startsWith('- '));
            expect(menos).toHaveLength(declaradas.length);
        },
        TOPE_JEST_REAL
    );

    it(
        'DISCREPANCIA · dos corridas que dan conjuntos distintos se denuncian',
        () => {
            // El detector de discrepancias de `--repetir` —la razón de ser del
            // modo— no tenía test: se podía borrar entero y la suite seguía
            // verde. Declararlo «no cubierto porque haría falta un test que
            // flapea» era una excusa: no hace falta azar, basta una secuencia
            // determinista. Este proyecto lleva un contador en disco y falla
            // SÓLO en su primera corrida.
            fs.rmSync(contadorAlterna, { force: true });
            const s = correr(['--repetir', '2', '--', '--config=' + miniAlterna.config, '--coverage=false']);

            const comprobar = (x: Salida): void => {
                expect(x.code).toBe(1);
                expect(x.out).toContain('VEREDICTO: corridas discrepantes respecto de la 1: 2');
                expect(x.out).toContain('--- diff corrida 1 -> corrida 2 ---');
                expect(x.out).toContain('- FALLA alterna.test.js :: V91 rojo sólo en la primera corrida');
                expect(x.out).not.toContain('MISMO conjunto');
            };
            comprobar(s);

            // Y sin el detector, dos conjuntos distintos se proclaman iguales.
            fs.rmSync(contadorAlterna, { force: true });
            const delMutante = elMutanteDebeCaer(
                mutante(['if (texto(conjuntos[i]) !== primero) discrepantes.push(i + 1);', 'if (false) discrepantes.push(i + 1);']),
                ['--repetir', '2', '--', '--config=' + miniAlterna.config, '--coverage=false'],
                comprobar
            );
            expect(delMutante.out).toContain('MISMO conjunto por nombre');
            expect(delMutante.code).toBe(0);
        },
        TOPE_JEST_REAL
    );

    it(
        'M4 · una corrida abortada no deja directorios temporales atrás',
        () => {
            // `process.exit()` NO ejecuta los `finally`, y el instrumento sale
            // por `morir()` desde dentro del `try` que debía limpiar. Cada
            // corrida abortada dejaba su directorio —con el JSON de jest
            // dentro— en `os.tmpdir()`. El fallo es heredado, pero esta suite
            // recorre esos caminos cinco veces por corrida, así que lo convertía
            // de raro en «cada `npm test`».
            //
            // La medida es hermética: se le da al subproceso un `os.tmpdir()`
            // propio, y se cuenta sólo lo que deja el instrumento (jest crea ahí
            // su caché, que no es asunto de este test).
            const tmpPrivado = path.join(TMP, 'tmp-privado');
            fs.rmSync(tmpPrivado, { recursive: true, force: true });
            fs.mkdirSync(tmpPrivado, { recursive: true });
            const restos = (): string[] =>
                fs.readdirSync(tmpPrivado).filter((n) => n.startsWith('rojos-jest'));
            const entorno = { TEMP: tmpPrivado, TMP: tmpPrivado, TMPDIR: tmpPrivado };

            // Config inexistente: jest muere sin escribir el JSON y el
            // instrumento sale por `morir()` desde dentro del `try`.
            const args = ['--gate', '--baseline', baseVacia, '--', '--config=v91-no-existe.json'];
            const comprobar = (s: Salida): void => {
                expect(s.code).toBe(2);
                expect(restos()).toHaveLength(0);
            };
            comprobar(correr(args, INSTRUMENTO, entorno));

            // Y sin el gancho de salida, el directorio se queda ahí.
            const sinGancho = mutante(["    process.on('exit', () => {", "    process.on('jamas', () => {"]);
            fs.rmSync(tmpPrivado, { recursive: true, force: true });
            fs.mkdirSync(tmpPrivado, { recursive: true });
            let cayo = false;
            try {
                comprobar(correr(args, sinGancho, entorno));
            } catch {
                cayo = true;
            }
            expect(cayo).toBe(true);
        },
        TOPE_JEST_REAL
    );

    it(
        'GUARDA 2 · el vector real: N corridas catastróficas no son determinismo',
        () => {
            // Config inexistente: jest muere antes de ejecutar un test y sin
            // escribir el JSON. Antes de la devolución de V90, esto se
            // proclamaba «las 2 corridas dieron el MISMO conjunto», EXIT 0.
            const s = correr(['--repetir', '2', '--', '--config=v91-config-que-no-existe.json']);
            expect(s.code).toBe(2);
            expect(s.todo).toContain('jest no llegó a escribir el JSON');
            expect(s.todo).toContain('NO son determinismo');
            expect(s.out).not.toContain('MISMO conjunto');
        },
        TOPE_JEST_REAL
    );
});

// =============================================================================
// § 5 · LO QUE EL GATE **NO** GARANTIZA
// =============================================================================

describe('WP-V91 · el límite del gate, escrito como test para que no se olvide', () => {
    it('un rojo nuevo se LEGALIZA añadiendo UNA línea al baseline, y nada obliga a arreglarlo', () => {
        // Mismo informe, mismo mundo, mismo rojo. Lo único que cambia es una
        // línea de un .txt sin suma de verificación y sin dueño por línea.
        const sinDeclarar = baseline('limite-antes.txt', []);
        const antes = correr(['--check', sinDeclarar, fxClon]);
        expect(antes.code).toBe(1);
        expect(antes.out).toContain('+ FALLA tests/unit/clon.test.ts :: V91 clonado');

        const declarado = baseline('limite-despues.txt', [
            'FALLA tests/unit/clon.test.ts :: V91 clonado',
            'FALLA tests/unit/clon.test.ts :: V91 clonado'
        ]);
        const despues = correr(['--check', declarado, fxClon]);
        expect(despues.code).toBe(0);
        expect(despues.out).toContain('conjunto de rojos IDENTICO al declarado');

        // Moraleja, y es la frase que este WP tiene que dejar en pie:
        // el gate convierte «empeoró en silencio» en «alguien firmó que
        // empeoró». NO garantiza que no empeore.
    });

    it('los comentarios y las líneas en blanco del baseline se ignoran (la firma va en prosa)', () => {
        const conProsa = path.join(TMP, 'con-prosa.txt');
        fs.writeFileSync(
            conProsa,
            '# esto es un comentario y no cuenta\n\n' +
            '   FALLA tests/unit/clon.test.ts :: V91 clonado   \n' +
            'FALLA tests/unit/clon.test.ts :: V91 clonado\n'
        );
        const s = correr(['--check', conProsa, fxClon]);
        expect(s.code).toBe(0);
        expect(s.out).toContain('conjunto de rojos IDENTICO al declarado');
    });
});
