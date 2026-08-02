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

/**
 * Invoca el instrumento (o un mutante suyo) como lo invoca el mundo.
 *
 * `cwd` es PARÁMETRO desde WP-V95, y no por comodidad: el instrumento toma su
 * raíz de `process.cwd()` (`scripts/rojos-jest.mjs:82`), así que el cwd de la
 * invocación **es** la condición que separa «informe de esta raíz» de «informe
 * de otra raíz». Mientras estuvo clavado en `RAIZ`, la única condición que esta
 * suite sabía medir era la de la máquina donde se corriera — y así fue como un
 * test de PORTABILIDAD pasaba aquí y caía en CI.
 */
function correr(
    args: string[],
    guion: string = INSTRUMENTO,
    entorno: Record<string, string> = {},
    cwd: string = RAIZ
): Salida {
    const r = spawnSync(process.execPath, [guion, ...args], {
        cwd,
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

/**
 * ¿Viene esta ruta de OTRA raíz? Con el criterio EXACTO del instrumento
 * (`scripts/rojos-jest.mjs:118-130`): la rama de reserva salta cuando
 * `path.relative` no devuelve nada, o devuelve algo que empieza por «..».
 *
 * Existe para que la suite pueda DEMOSTRAR que su fixture es ajena en el
 * entorno donde se la está corriendo, en lugar de suponerlo. Ésa es la lección
 * de WP-V95, y conviene dejarla dicha aquí: **una fixture que simula «el otro
 * entorno» deja de simular nada cuando te toca correr en el otro entorno.**
 */
function vieneDeOtraRaiz(raiz: string, absoluta: string): boolean {
    let r: string;
    try {
        r = path.relative(raiz, absoluta);
    } catch {
        return true;
    }
    return !r || r.startsWith('..');
}

// --- WP-V96 · el porcentaje de `--maxWorkers`, sin suponer la máquina ---------
//
// `trabajadoresPedidos` (`scripts/rojos-jest.mjs:357-367`) resuelve un
// porcentaje con `Math.floor(os.cpus().length * pct / 100)` — sin suelo de 1 —
// y `argumentosSeriales` rechaza todo lo que dé `<= 1`. Los tests de § 3
// clavaban porcentajes calculados a ojo, y con UNA CPU se contradecían: el
// «porcentaje serial» y el control «holgado» resultaban ser el mismo, `100 %`.
// Censado por WP-V95 (eje E) y no arreglado allí. Estas tres funciones ponen la
// aritmética donde se puede recorrer, con el recuento de CPU inyectable, para
// aseverar la condición sin necesitar la máquina.

/** Procesos que jest resuelve para `--maxWorkers=<pct>%`, con la aritmética del instrumento. */
function procesosDePorcentaje(pct: number, cpus: number = os.cpus().length): number {
    return Math.floor((cpus * pct) / 100);
}

/** El MAYOR porcentaje que todavía deja a jest en un proceso (o menos). Siempre existe. */
function pctQueSerializa(cpus: number = os.cpus().length): number {
    for (let pct = 100; pct >= 1; pct--) {
        if (procesosDePorcentaje(pct, cpus) <= 1) return pct;
    }
    return 1;
}

/**
 * El MENOR porcentaje que saca a jest de un solo proceso, o `null` si no existe
 * ninguno. `null` es el caso de 1 CPU, y no es una excusa: es que allí jest no
 * puede paralelizar, así que rechazar cualquier porcentaje es lo correcto.
 */
function pctQueParaleliza(cpus: number = os.cpus().length): number | null {
    for (let pct = 1; pct <= 100; pct++) {
        if (procesosDePorcentaje(pct, cpus) > 1) return pct;
    }
    return null;
}

/**
 * Una raíz ajena POR CONSTRUCCIÓN: hermana del árbol de trabajo, jamás
 * descendiente suya, esté el checkout donde esté y sea cual sea la plataforma.
 *
 * Hasta WP-V95 aquí había una CONSTANTE, `/home/runner/work/V_SDK/V_SDK`, que
 * es la ruta EXACTA donde GitHub Actions hace el checkout de este repo. En
 * Windows era ajena; en el runner era la raíz del propio proceso. Derivarla de
 * `RAIZ` es lo que la hace ajena en las dos plataformas a la vez.
 *
 * LÍMITE, dicho en voz alta: en Windows `path.relative` entre UNIDADES
 * distintas no devuelve «..» sino la ruta absoluta de destino, así que la
 * hermandad no bastaría si `RAIZ` viviera en otra unidad que el temporal. Por
 * eso los tests que la usan COMPRUEBAN la ajenidad antes de aseverar nada.
 */
const RAIZ_AJENA = path.join(path.dirname(RAIZ), path.basename(RAIZ) + '-de-otro-checkout');

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
    comprobar: (s: Salida) => void,
    cwd: string = RAIZ
): Salida {
    const s = correr(args, guion, {}, cwd);
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
            '  argumentos      : ' + args.join(' ') + '\n' +
            // WP-V95: la raíz del proceso es parte del caso, no del decorado.
            // Sin ella, el superviviente de CI era un mensaje que no decía en
            // qué condición había sobrevivido.
            '  raíz del proceso: ' + cwd + '\n' +
            '  código          : ' + s.code + '\n' +
            '  salida          : ' + (s.todo.trim() || '(vacía)')
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

/**
 * WP-V96 · POR QUÉ LOS PROYECTOS MÍNIMOS CUELGAN DE UN SEGMENTO «tests» PROPIO.
 *
 * `rutaRelativa` (`scripts/rojos-jest.mjs:118-131`) no puede relativizar una
 * ruta que viene de fuera del árbol, así que rescata **desde el último segmento
 * llamado `tests`**, y si no hay ninguno se queda con el basename:
 *
 *     const i = partes.lastIndexOf('tests');
 *     r = i >= 0 ? partes.slice(i).join('/') : partes[partes.length - 1];
 *
 * Hasta este WP los proyectos mínimos colgaban de `TMP` a secas, y los oráculos
 * de § 4 decían `FALLA rojo.test.js` — el basename. Eso sólo es cierto si
 * NINGÚN ancestro de `os.tmpdir()` se llama `tests`, cosa que nadie comprobaba.
 * MEDIDO por WP-V95 con `TEMP`/`TMP`/`TMPDIR` = `…\tests\tmp`: **4 rojos**, y
 * eran exactamente los cuatro tests de § 4 con oráculo escrito a mano.
 *
 * Colgándolos de un `tests` NUESTRO la suposición desaparece: `lastIndexOf`
 * devuelve SIEMPRE el segmento más profundo, o sea el nuestro, haya los que
 * haya por encima. El oráculo pasa a ser `tests/<paquete>/<fichero>` y vale
 * literal en cualquier temporal y en cualquier plataforma. El caso del basename
 * —la sub-rama `i < 0`— no se pierde: deja de estar cubierto «de rebote» y pasa
 * a tener test propio con una ruta sintética sin segmento `tests` (§ 1).
 */
const SEGMENTO_TESTS = 'tests';

function escribirMini(nombre: string, ficheros: Record<string, string>, extraConfig: Record<string, unknown> = {}): Mini {
    const dir = path.join(TMP, SEGMENTO_TESTS, nombre);
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
let fxFuturo = '';
let baseClonUno = '';
let baseVacia = '';

/** Un informe que dice venir de otra raíz, con la ruta que declara — WP-V95. */
interface DeOtraRaiz {
    /** Qué estilo de separador trae la ruta declarada. */
    estilo: string;
    /** La ruta ABSOLUTA que el informe pone en `testResults[].name`. */
    declarada: string;
    /** El JSON sintético que la contiene. */
    json: string;
}
let ajenas: DeOtraRaiz[] = [];

/**
 * Una raíz de proceso con FORMA de runner de CI, que existe de verdad para
 * poder pasarla como `cwd` — WP-V95.
 *
 * No hace falta ser Linux para reproducir el fallo de CI: lo que lo produce no
 * es el sistema operativo, es que la raíz del proceso sea ANCESTRO de la ruta
 * que el informe declara. Eso se monta en cualquier plataforma.
 */
let RAIZ_SIMULADA_CI = '';

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

    // ---- WP-V95 · la raíz ajena, ajena DE VERDAD en las dos plataformas ------
    //
    // El informe viene de OTRA raíz y aun así tiene que dar la misma línea: es
    // la promesa de portabilidad del instrumento, la que sostiene que un
    // baseline escrito aquí valga para juzgar una corrida hecha en CI.
    //
    // Aquí había UNA constante — `/home/runner/work/V_SDK/V_SDK/tests/unit/…` —
    // y era la ruta EXACTA del checkout de este repo en GitHub Actions. En
    // Windows resultaba ajena y todo parecía bien; en el runner era la raíz del
    // propio proceso, o sea que la fixture NO simulaba otra raíz: simulaba la
    // suya. Ahora se deriva de `RAIZ`, que es lo único que la hace ajena en las
    // dos plataformas, y va en DOS estilos de separador porque la rama de
    // reserva parte por `[\\/]` y hasta hoy sólo se la probaba con barras.
    RAIZ_SIMULADA_CI = path.join(TMP, 'runner', 'work', 'V_SDK', 'V_SDK');
    fs.mkdirSync(RAIZ_SIMULADA_CI, { recursive: true });

    ajenas = [
        {
            estilo: 'barras — un informe nacido en un runner POSIX',
            declarada: RAIZ_AJENA.split(path.sep).join('/') + '/tests/unit/ci.test.ts'
        },
        {
            estilo: 'contrabarras — un informe nacido en otro checkout Windows',
            declarada: RAIZ_AJENA + '\\tests\\unit\\ci.test.ts'
        }
    ].map((x, i) => ({
        ...x,
        json: informe('raiz-ajena-' + (i + 1) + '.json', {
            success: false,
            numTotalTests: 1,
            testResults: [
                {
                    name: x.declarada,
                    status: 'failed',
                    assertionResults: [{ fullName: 'V91 rojo nacido en CI', title: 'x', status: 'failed' }]
                }
            ]
        })
    }));

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
        //
        // WP-V96 · LA SUPOSICIÓN, DICHA AL DERECHO. Este mutante sólo puede
        // caer si en ESTE node `localeCompare` ordena distinto que la unidad de
        // código. Un node sin ICU con collation (`--without-intl`) degrada
        // `localeCompare` a comparación por unidad de código, y entonces el
        // mutante SOBREVIVE y el test sale rojo sin que nada esté mal — el
        // mismo modo de fallo que cerró WP-V95, por otro eje (censado allí,
        // eje D, y enrutado aquí). No puedo probar un node así: en esta máquina
        // no hay ninguno, y `--without-intl` es una opción de COMPILACIÓN, no
        // de arranque. Lo que sí puedo es que la suposición deje de ser tácita:
        // se comprueba con los dos pares de la fixture que la sostienen, y si
        // falla lo dice CON SU NOMBRE y con el ICU delante, en vez de aparecer
        // treinta líneas más allá disfrazado de «MUTANTE SUPERVIVIENTE».
        const porUnidadDeCodigo = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);
        const paresQueDistinguen = [
            ['V91 Zulu', 'V91 aaa'], // unidad de código: 'Z'(90) < 'a'(97) · locale: al revés
            ['V91 zzz', 'V91 ñu'] //    unidad de código: 'z'(122) < 'ñ'(241) · locale: al revés
        ].filter(([a, b]) => Math.sign(porUnidadDeCodigo(a, b)) !== Math.sign(a.localeCompare(b)));
        const icu = (process.versions as unknown as Record<string, string | undefined>).icu;
        expect({
            icu: icu ?? '(este node no trae ICU)',
            paresDeLaFixtureQueDistinguenLosDosComparadores: paresQueDistinguen.length
        }).toEqual({
            icu: icu ?? '(este node no trae ICU)',
            paresDeLaFixtureQueDistinguenLosDosComparadores: 2
        });

        elMutanteDebeCaer(
            mutante(['    return a < b ? -1 : a > b ? 1 : 0;', '    return a.localeCompare(b);']),
            [fxOrden],
            comprobar
        );
    });

    it('RAÍZ AJENA · un informe de OTRA raíz da la MISMA línea, corra el gate donde corra', () => {
        // El baseline se escribe en un árbol y se compara en otro. Si la ruta
        // no se normaliza igual, TODO el conjunto sale distinto y el gate se
        // vuelve inservible justo donde más falta hace. Otro superviviente.
        //
        // WP-V95 · LO QUE ESTE TEST TUVO QUE APRENDER. Hasta hoy la fixture era
        // la constante `/home/runner/work/V_SDK/V_SDK/tests/unit/ci.test.ts`, o
        // sea la ruta exacta del checkout de este repo en GitHub Actions. Aquí
        // era ajena, la rama de reserva se ejecutaba y el mutante caía; ALLÍ era
        // la raíz del propio proceso, `path.relative` acertaba, la rama de
        // reserva no se ejecutaba jamás y el mutante SOBREVIVÍA. El test de
        // portabilidad se ponía rojo exactamente en el entorno que decía
        // vigilar. MEDIDO en CI (run 30717696234, paso «Gate · conjunto de rojos
        // por nombre»): «+ FALLA scripts/tests/rojos-jest.test.ts :: … RAÍZ
        // AJENA · un informe hecho en CI da la MISMA línea que uno hecho aquí».
        //
        // Así que ahora se miden LAS DOS condiciones, y en cualquier plataforma:
        // lo que produce el fallo no es el sistema operativo, es que la raíz del
        // proceso sea ANCESTRO de la ruta declarada. La raíz se pasa por `cwd`,
        // que es de donde el instrumento saca la suya (`rojos-jest.mjs:82`).
        const comprobar = (s: Salida): void => {
            expect(s.out).toBe('FALLA tests/unit/ci.test.ts :: V91 rojo nacido en CI\n');
        };

        // Un solo mutante para las cuatro condiciones: el que borra la rama de
        // reserva, que es la normalización que sólo entra cuando el informe
        // viene de otra raíz.
        const sinReserva = mutante(["const i = partes.lastIndexOf('tests');", 'const i = -1;']);

        for (const raizDelProceso of [RAIZ, RAIZ_SIMULADA_CI]) {
            for (const fx of ajenas) {
                // DEMOSTRADO, no supuesto. Si esta fixture dejara de ser ajena
                // en algún entorno, lo dice con su nombre y con las dos rutas
                // delante, en vez de disfrazarse de «mutante superviviente» a
                // 300 líneas de aquí — que es como se leía el fallo en CI.
                expect({
                    raizDelProceso,
                    declarada: fx.declarada,
                    esAjena: vieneDeOtraRaiz(raizDelProceso, fx.declarada)
                }).toEqual({ raizDelProceso, declarada: fx.declarada, esAjena: true });

                comprobar(correr([fx.json], INSTRUMENTO, {}, raizDelProceso));
                elMutanteDebeCaer(sinReserva, [fx.json], comprobar, raizDelProceso);
            }
        }
    });

    it('RAÍZ AJENA · el vicio que cerró V95: una fixture BAJO la raíz del proceso no vigila nada', () => {
        // El defecto de V95, escrito como test para que no vuelva a entrar por
        // la puerta de atrás. No hay que creerse el relato: se reproduce aquí,
        // en cualquier plataforma, corriendo el instrumento DESDE la raíz que
        // la fixture declara como suya.
        const bajoLaRaizDelProceso = path.join(RAIZ_SIMULADA_CI, 'tests', 'unit', 'ci.test.ts');
        // Precondición del caso: esta ruta NO es ajena a esa raíz. Es el
        // supuesto entero de la fixture vieja, dicho al derecho.
        expect(vieneDeOtraRaiz(RAIZ_SIMULADA_CI, bajoLaRaizDelProceso)).toBe(false);

        const fx = informe('v95-bajo-la-raiz-del-proceso.json', {
            success: false,
            numTotalTests: 1,
            testResults: [
                {
                    name: bajoLaRaizDelProceso,
                    status: 'failed',
                    assertionResults: [{ fullName: 'V91 rojo nacido en CI', title: 'x', status: 'failed' }]
                }
            ]
        });
        const sinReserva = mutante(["const i = partes.lastIndexOf('tests');", 'const i = -1;']);

        const real = correr([fx], INSTRUMENTO, {}, RAIZ_SIMULADA_CI);
        const delMutante = correr([fx], sinReserva, {}, RAIZ_SIMULADA_CI);

        // La línea sale bien —la normalización nativa basta—, así que un test
        // escrito sobre esta fixture PASARÍA…
        expect(real.out).toBe('FALLA tests/unit/ci.test.ts :: V91 rojo nacido en CI\n');
        // …y sale IDÉNTICA con la normalización cruzada borrada. El mutante
        // sobrevive: la fixture no vigila la rama que dice vigilar. Nada de
        // esto se ve desde una plataforma donde la ruta sí resulte ajena.
        expect(delMutante.out).toBe(real.out);

        // Y el contraste, en esa MISMA raíz de proceso: con las fixtures de
        // V95 el mutante sí cae. La diferencia no está en la plataforma; está
        // en si la ruta es ajena a la raíz del proceso o no.
        for (const fxAjena of ajenas) {
            const conAjena = correr([fxAjena.json], sinReserva, {}, RAIZ_SIMULADA_CI);
            expect(conAjena.out).not.toBe(real.out);
        }
    });

    it('SIN SEGMENTO «tests» · un informe ajeno que no trae ninguno cae al BASENAME', () => {
        // WP-V96. La rama de reserva de `rutaRelativa` tiene DOS salidas:
        //
        //     r = i >= 0 ? partes.slice(i).join('/') : partes[partes.length - 1];
        //
        // La primera la vigila el test de RAÍZ AJENA. La segunda —el basename—
        // no tenía test propio: la ejercitaban DE REBOTE los cuatro tests de
        // § 4, porque sus proyectos mínimos vivían en `os.tmpdir()` y se daba
        // por hecho que ningún ancestro del temporal se llamaba `tests`. Ese
        // supuesto era justo el que WP-V95 midió y denunció (4 rojos con
        // `TEMP=…\tests\tmp`). Al quitárselo a § 4 (los proyectos cuelgan ahora
        // de un `tests` propio), la sub-rama se queda sin nadie: aquí tiene su
        // test, y por diseño en vez de por casualidad.
        //
        // La ruta es SINTÉTICA a propósito: ni sale de `os.tmpdir()` ni de
        // `RAIZ`, así que ningún entorno puede meterle un segmento `tests` por
        // debajo. Arranca en `/`, que es absoluta en las DOS plataformas y en
        // las dos queda fuera de cualquier raíz de checkout razonable — y aun
        // así no se supone: se comprueba antes de aseverar nada. Los dos
        // estilos de separador van, porque la reserva parte por `[\\/]`.
        const declaradas = [
            '/v96-sin-segmento/paquete/suelto.test.js',
            '/v96-sin-segmento\\paquete\\suelto.test.js'
        ];
        declaradas.forEach((declarada, i) => {
            const segmentos = declarada.split(/[\\/]/);
            // Precondición 1: NINGÚN segmento se llama «tests».
            expect(segmentos).not.toContain('tests');
            // Precondición 2: es ajena a la raíz del proceso, o sea que la rama
            // de reserva entra de verdad. DEMOSTRADO, no supuesto.
            expect({ declarada, esAjena: vieneDeOtraRaiz(RAIZ, declarada) })
                .toEqual({ declarada, esAjena: true });

            const fx = informe('v96-sin-segmento-' + (i + 1) + '.json', {
                success: false,
                numTotalTests: 1,
                testResults: [
                    {
                        name: declarada,
                        status: 'failed',
                        assertionResults: [{ fullName: 'V96 rojo sin segmento tests', title: 'x', status: 'failed' }]
                    }
                ]
            });

            const comprobar = (s: Salida): void => {
                expect(s.out).toBe('FALLA suelto.test.js :: V96 rojo sin segmento tests\n');
            };

            // El mutante: quien borre el basename y devuelva la ruta entera.
            pinza([fx], comprobar, [': partes[partes.length - 1];', ': String(absoluta);']);
        });
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

        // Y las que NO serializan no se rechazan. Sin estos controles la guarda
        // podría cazarlo todo y parecería correcta.
        //
        // WP-V96 · el cuarto control era `--maxWorkers=50%`, clavado. Con 12 CPU
        // resuelve a 6 procesos, pero con UNA resuelve a CERO y la guarda lo
        // rechaza — con razón—, de modo que el control se caía en la máquina
        // donde el instrumento sigue siendo correcto. Ahora el porcentaje se
        // deriva, y si la máquina no puede paralelizar el control desaparece
        // porque allí NO ES UN CONTROL: es un caso serial más, y lo asevera el
        // test de § 3 «un porcentaje que resuelve a un proceso».
        const noSerializan: string[][] = [['--maxWorkers=6'], ['--maxWorkers', '4'], ['--runInBand=false']];
        const pctParalelo = pctQueParaleliza();
        if (pctParalelo !== null) noSerializan.push(['--maxWorkers=' + pctParalelo + '%']);
        for (const forma of noSerializan) {
            const s = correr(['--repetir', '2', '--', ...forma, '--config=v91-no-existe.json']);
            expect(s.todo).not.toContain('estos argumentos serializan jest');
        }

        pinza(
            ['--repetir', '2', '--', '--maxWorkers', '1', '--config=v91-no-existe.json'],
            comprobar,
            ['const culpables = argumentosSeriales(extra);', 'const culpables = [];']
        );
    });

    it('PARALELISMO · la aritmética del porcentaje, en SIETE recuentos de CPU — WP-V96', () => {
        // Reproduzco LA CONDICIÓN, no la máquina: no tengo una de 1 CPU, pero
        // la decisión entera está en `Math.floor(cpus × pct / 100)`, y eso se
        // puede recorrer aquí. La tabla fija los dos porcentajes de los que
        // depende el test siguiente, y de paso deja escrito el caso que hasta
        // hoy lo ponía rojo sin que nada estuviera mal: con 1 CPU **no existe**
        // porcentaje que saque a jest de un proceso.
        const tabla = [1, 2, 3, 4, 8, 12, 16].map((c) => [c, pctQueSerializa(c), pctQueParaleliza(c)]);
        expect(tabla).toEqual([
            [1, 100, null], //  ← una sola CPU: NINGÚN porcentaje paraleliza
            [2, 99, 100],
            [3, 66, 67],
            [4, 49, 50],
            [8, 24, 25],
            [12, 16, 17],
            [16, 12, 13]
        ]);
        // Y los cinco puntos que midió WP-V91 con 12 CPU, tal cual los anotó.
        expect([9, 10, 20, 25, 50].map((p) => procesosDePorcentaje(p, 12))).toEqual([1, 1, 2, 3, 6]);
    });

    it('PARALELISMO · un porcentaje que resuelve a un proceso también serializa', () => {
        // Esto quedó DECLARADO como hueco conocido en la primera vuelta y no
        // cerrado, con el argumento de que depende de la máquina. El argumento
        // era malo: depende de la máquina, sí, y la máquina que importa es
        // ESTA, donde se está tomando la medida.
        //
        // WP-V96 · lo que le faltaba. El porcentaje serial se clavaba en
        // `Math.max(1, floor(100 / cpus))`, que con UNA CPU da 100 — o sea el
        // MISMO argumento que el control de más abajo, `--maxWorkers=100%`. En
        // una máquina de 1 CPU este test se contradecía a sí mismo y salía rojo
        // sin que nada estuviera mal (censado por WP-V95, eje E). Ahora los dos
        // porcentajes se derivan de la aritmética del instrumento, y el caso de
        // 1 CPU no se salta: se asevera lo que allí es VERDAD — que jest no
        // puede paralelizar y la guarda tiene razón en rechazarlo todo.
        const pctSerial = pctQueSerializa();
        expect(procesosDePorcentaje(pctSerial)).toBeLessThanOrEqual(1); // la premisa, medida aquí
        const s = correr(['--repetir', '2', '--', '--maxWorkers=' + pctSerial + '%', '--config=v91-no-existe.json']);
        expect(s.code).toBe(2);
        expect(s.todo).toContain('estos argumentos serializan jest');

        const pctParalelo = pctQueParaleliza();
        const tope = correr(['--repetir', '2', '--', '--maxWorkers=100%', '--config=v91-no-existe.json']);
        if (pctParalelo === null) {
            // Máquina de 1 CPU. Ningún porcentaje —tampoco el 100 %— saca a
            // jest de un proceso, así que rechazarlos TODOS es lo correcto.
            expect(os.cpus().length).toBe(1);
            expect(tope.code).toBe(2);
            expect(tope.todo).toContain('estos argumentos serializan jest');
        } else {
            // Con dos o más CPU hay un porcentaje mínimo que ya paraleliza, y
            // ni él ni el 100 % pueden rechazarse: sin este control la guarda
            // podría cazarlo todo y parecería correcta.
            const holgado = correr([
                '--repetir', '2', '--', '--maxWorkers=' + pctParalelo + '%', '--config=v91-no-existe.json'
            ]);
            expect(holgado.todo).not.toContain('estos argumentos serializan jest');
            expect(tope.todo).not.toContain('estos argumentos serializan jest');
        }
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
    it('PRECONDICIÓN · los oráculos de § 4 no dependen de cómo se llame el temporal — WP-V96', () => {
        // Los cuatro tests que siguen llevan el oráculo ESCRITO A MANO, con la
        // ruta dentro. Hasta WP-V96 esa ruta era el basename, y sólo era el
        // basename si ningún ancestro de `os.tmpdir()` se llamaba `tests`
        // —supuesto que nadie comprobaba y que WP-V95 midió: 4 rojos con
        // `TEMP`/`TMP`/`TMPDIR` = `…\tests\tmp`—. Ahora los proyectos cuelgan
        // de un segmento `tests` PROPIO, y `lastIndexOf` devuelve siempre el
        // más profundo. Este test lo deja demostrado en vez de supuesto: si
        // alguien deshace el anidamiento, el rojo sale aquí y con su nombre, no
        // cuatro tests más allá disfrazado de conjunto distinto.
        for (const mini of [miniA, miniRota, miniSoloRota, miniAlterna]) {
            const segmentos = mini.dir.split(/[\\/]/);
            // El último segmento `tests` de la ruta es el NUESTRO: el que va
            // justo encima del paquete. Da igual cuántos haya por encima.
            expect(segmentos[segmentos.lastIndexOf(SEGMENTO_TESTS) + 1]).toBe(path.basename(mini.dir));
            // Y la reserva entra de verdad: el proyecto es ajeno a la raíz del
            // proceso, que es la condición que hace que la ruta se rescate.
            expect({ dir: mini.dir, esAjeno: vieneDeOtraRaiz(RAIZ, mini.dir) })
                .toEqual({ dir: mini.dir, esAjeno: true });
        }
    });

    it(
        'las clases y la multiplicidad, sobre un informe que ha escrito jest',
        () => {
            const json = path.join(TMP, 'realA.json');
            const jest = correrJestMinimo(miniA.config, json);
            expect(fs.existsSync(json)).toBe(true);
            expect(jest.code).toBe(1); // hay rojos, jest sale 1

            const completo = baseline('realA.base.txt', [
                'FALLA tests/paqueteA/rojo.test.js :: V91-A rojo clonado',
                'FALLA tests/paqueteA/rojo.test.js :: V91-A rojo clonado',
                'FALLA tests/paqueteA/rojo.test.js :: V91-A rojo llano',
                'OMITE tests/paqueteA/rojo.test.js :: [pending] V91-A saltado a proposito',
                'OMITE tests/paqueteA/rojo.test.js :: [todo] V91-A por escribir'
            ]);

            // El oráculo se escribió A MANO antes de correr; si el conjunto real
            // coincide, es que las clases hacen lo que dicen sobre jest real.
            const ok = correr(['--check', completo, json]);
            expect(ok.out).toContain('conjunto de rojos IDENTICO al declarado');
            expect(ok.code).toBe(0);

            // Y el vector B1 con jest de verdad: dos `it` homónimos en rojo, un
            // baseline que declara uno. El cardinal sube; el gate tiene que verlo.
            const soloUno = baseline('realA.base-menos.txt', [
                'FALLA tests/paqueteA/rojo.test.js :: V91-A rojo clonado',
                'FALLA tests/paqueteA/rojo.test.js :: V91-A rojo llano',
                'OMITE tests/paqueteA/rojo.test.js :: [pending] V91-A saltado a proposito',
                'OMITE tests/paqueteA/rojo.test.js :: [todo] V91-A por escribir'
            ]);
            const multi = correr(['--check', soloUno, json]);
            expect(multi.code).toBe(1);
            expect(multi.out).toContain('+ FALLA tests/paqueteA/rojo.test.js :: V91-A rojo clonado   [sobran 1 de 2]');

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
                'FALLA tests/paqueteA/rojo.test.js :: V91-A rojo clonado',
                'FALLA tests/paqueteA/rojo.test.js :: V91-A rojo clonado',
                'FALLA tests/paqueteA/rojo.test.js :: V91-A rojo llano',
                'OMITE tests/paqueteA/rojo.test.js :: [pending] V91-A saltado a proposito',
                'OMITE tests/paqueteA/rojo.test.js :: [todo] V91-A por escribir'
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
            expect(s.out).toContain('SUITE tests/paqueteRota/rota.test.js :: ● Test suite failed to run');
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
                expect(x.out).toContain('- FALLA tests/paqueteAlterna/alterna.test.js :: V91 rojo sólo en la primera corrida');
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
