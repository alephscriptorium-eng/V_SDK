#!/usr/bin/env node
// =============================================================================
// rojos-jest.mjs · el conjunto de rojos de jest, POR NOMBRE — WP-V90
// =============================================================================
//
// MOTIVO
//   Hasta hoy el estado de la suite se comparaba con un CARDINAL («5 rojos»).
//   Sobre una suite que flapea, un cardinal es ruido: da falsos rojos y —mucho
//   peor— deja que un rojo REAL se confunda con flapeo. Un conjunto de rojos
//   identificado POR NOMBRE es información: cualquier cambio, en cualquier
//   dirección, aparece como una línea de diff que alguien tiene que justificar.
//
// USO
//   node scripts/rojos-jest.mjs <resultado.json>
//       Emite el conjunto canónico, una línea por rojo, ordenado, y NADA MÁS:
//       ni conteos, ni porcentajes, ni tiempos, ni fechas, ni rutas absolutas.
//       Salida byte a byte igual entre corridas y entre sistemas operativos.
//
//   node scripts/rojos-jest.mjs --check <baseline.txt> <resultado.json>
//       Compara contra el conjunto declarado. Sale 0 si son idénticos; 1 si
//       hay CUALQUIER diferencia, en cualquier dirección, con el diff.
//
//   node scripts/rojos-jest.mjs --repetir <N> [-- <args extra de jest>]
//       Corre jest N veces EN PARALELO (los workers por defecto de jest, que
//       es la configuración que produce contención y por tanto la que puede
//       destapar flapeo) y dice si las N corridas dieron el MISMO conjunto.
//
// POR QUÉ NO SE PUEDE BURLAR
//   El conjunto no contiene sólo los tests en rojo. Contiene cuatro clases, y
//   cada una tapa una forma barata de falsear el gate:
//
//     FALLA      el rojo propiamente dicho.
//     OMITE      test saltado (skip/todo/disabled). Sin esta clase, `it.skip`
//                de una línea borra un rojo del conjunto y el gate aplaude.
//     SUITE      suite que muere sin llegar a ejecutar un solo test (no
//                compila, no importa). No produce NINGUNA aserción fallida:
//                sin esta clase el conjunto ENCOGE y un apagón parece mejora.
//     SINNOMBRE  la corrida fracasó y ninguna línea anterior lo explica. Es
//                el caso MEDIDO de los umbrales de cobertura: jest sale con
//                código 1 y `success:false`, y en el JSON no queda ni rastro
//                del motivo. Sin esta clase, ese rojo es invisible.
//
//   Y borrar un test tampoco cuela: el conjunto se compara contra un baseline
//   declarado, así que una línea que desaparece es un diff igual que una que
//   aparece. No hay dirección «buena» que pase sin firma.
//
// EL ÚNICO HUECO CONOCIDO, DICHO EN VOZ ALTA
//   `SINNOMBRE` sólo puede saltar cuando NINGUNA otra línea explica el fallo,
//   porque jest no deja en el JSON ni rastro de por qué fracasó una corrida sin
//   tests rojos (MEDIDO: con `collectCoverage: true` y los umbrales incumplidos,
//   el JSON trae `success:false`, `numFailedTests:0` y `numFailedTestSuites:0`,
//   y nada más). Corolario: si el gate se corre CON cobertura y además hay
//   algún rojo con nombre, el fallo de umbral queda TAPADO por él.
//   Por eso el comando canónico del gate lleva `--coverage=false` y la
//   cobertura se comprueba aparte, con sus propios números. No es un detalle
//   de eficiencia: es lo que impide que un rojo se lave en otro.
//
// CÓDIGOS DE SALIDA
//   0   conjunto emitido / conjunto idéntico al baseline / N corridas iguales
//   1   diferencia contra el baseline, o corridas discrepantes
//   2   error de uso, o el JSON de jest falta o es ilegible (NUNCA se emite
//       un conjunto vacío por no haber podido leer: un instrumento mudo que
//       parece verde es exactamente el fallo que este WP viene a corregir)
//
// QUIÉN VIGILA A ESTE VIGILANTE — WP-V91
//   `scripts/tests/rojos-jest.test.ts`, que corre con `npm test` como una suite
//   más. Cada clase y cada guarda tiene su caso rojo, y cada una está anclada a
//   un MUTANTE: la suite exige que, si se desactiva el trozo que dice vigilar,
//   el test se ponga rojo. Un test que sobrevive a su propia mutación no
//   vigilaba nada, y la suite lo denuncia por su nombre.
//
//   Si editas este fichero y la suite se queja de «MUTACIÓN SIN ANCLA», no es
//   un falso positivo: una mutación dejó de apuntar a código real. Reapúntala.
// =============================================================================

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const RAIZ = process.cwd();

function morir(msg) {
    process.stderr.write('rojos-jest: ' + msg + '\n');
    process.exit(2);
}

/**
 * Directorio temporal que se borra PASE LO QUE PASE — WP-V91, segunda vuelta.
 *
 * Un `finally` no basta y aquí estaba el escape: `process.exit()` **no ejecuta
 * los `finally`**, y este instrumento sale por `morir()` desde DENTRO del `try`
 * (jest no escribió el JSON, la corrida no ejecutó tests, el informe trae
 * cobertura…). Cada una de esas salidas dejaba su directorio en `os.tmpdir()`,
 * con el JSON de jest dentro. `process.on('exit')` sí corre en `process.exit()`,
 * así que el borrado se cuelga de ahí y el `finally` pasa a ser redundante.
 */
function tmpEfimero(prefijo) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefijo));
    process.on('exit', () => {
        try {
            fs.rmSync(dir, { recursive: true, force: true });
        } catch { /* al salir ya no hay a quién quejarse */ }
    });
    return dir;
}

// Una línea es una línea: ni saltos, ni ANSI, ni espacios de más.
function unaLinea(s) {
    return String(s === undefined || s === null ? '' : s)
        // eslint-disable-next-line no-control-regex
        .replace(/\u001b\[[0-9;]*[A-Za-z]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function rutaRelativa(absoluta) {
    let r;
    try {
        r = path.relative(RAIZ, absoluta);
    } catch {
        r = absoluta;
    }
    if (!r || r.startsWith('..')) {
        // El JSON viene de otra raíz: quédate desde el primer segmento «tests».
        const partes = String(absoluta).split(/[\\/]/);
        const i = partes.lastIndexOf('tests');
        r = i >= 0 ? partes.slice(i).join('/') : partes[partes.length - 1];
    }
    return r.split(path.sep).join('/').split('\\').join('/');
}

// Orden por unidad de código: independiente de la locale y del sistema.
function ordenEstable(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
}

/** Del JSON de jest al conjunto canónico de líneas. */
export function conjuntoDeRojos(informe) {
    const lineas = [];
    let explicado = false;

    for (const suite of informe.testResults || []) {
        const fichero = rutaRelativa(suite.name);
        const aserciones = suite.assertionResults || [];

        for (const t of aserciones) {
            const nombre = unaLinea(t.fullName || t.title);
            if (t.status === 'failed') {
                lineas.push('FALLA ' + fichero + ' :: ' + nombre);
                explicado = true;
            } else if (t.status !== 'passed') {
                // pending / skipped / todo / disabled / focused…
                lineas.push('OMITE ' + fichero + ' :: [' + t.status + '] ' + nombre);
            }
        }

        // Suite caída sin haber producido una sola aserción fallida.
        const fallidas = aserciones.filter((t) => t.status === 'failed').length;
        if (suite.status === 'failed' && fallidas === 0) {
            const motivo = unaLinea(suite.message || suite.failureMessage || '').slice(0, 200);
            lineas.push('SUITE ' + fichero + ' :: ' + (motivo || 'la suite falló sin mensaje'));
            explicado = true;
        }
    }

    // La corrida fracasó y nada de lo anterior lo explica.
    if (informe.success === false && !explicado) {
        lineas.push(
            'SINNOMBRE (toda la corrida) :: jest terminó en fallo y ningún test lo explica ' +
            '— revisar umbrales de cobertura, globalSetup o reporteros'
        );
    }

    lineas.sort(ordenEstable);
    return lineas;
}

function leerInforme(ruta) {
    if (!ruta) morir('falta la ruta al JSON de jest');
    if (!fs.existsSync(ruta)) morir('no existe el JSON de jest: ' + ruta);
    let crudo;
    try {
        crudo = fs.readFileSync(ruta, 'utf8');
    } catch (e) {
        morir('no se pudo leer ' + ruta + ': ' + e.message);
    }
    try {
        return JSON.parse(crudo);
    } catch (e) {
        morir('el JSON de jest no se pudo interpretar (' + ruta + '): ' + e.message);
    }
}

function texto(lineas) {
    return lineas.length ? lineas.join('\n') + '\n' : '';
}

/**
 * Diff de MULTICONJUNTOS, no de conjuntos.
 *
 * Con `Set` —como estaba escrito hasta la devolución de este WP— dos rojos con
 * el MISMO nombre completo colapsan en uno, y el gate deja pasar un rojo NUEVO
 * a condición de que se llame igual que uno ya declarado. Jest permite dos `it`
 * homónimos sin rechistar, así que el vector es de una línea. MEDIDO: con dos
 * `it` homónimos en rojo y un baseline que declaraba uno, el gate decía
 * «IDENTICO» y salía 0 mientras el cardinal pasaba de 1 a 2.
 *
 * Es el peor fallo posible en este instrumento: en ese vector el conteo viejo
 * —el que este WP vino a sustituir por ser ruido— era ESTRICTAMENTE MÁS FUERTE.
 * Se cuentan repeticiones y se anotan con su multiplicidad.
 */
function contar(lineas) {
    const m = new Map();
    for (const l of lineas) m.set(l, (m.get(l) || 0) + 1);
    return m;
}

function diff(esperado, obtenido) {
    const e = contar(esperado);
    const o = contar(obtenido);
    const fuera = [];
    for (const [l, n] of e) {
        const tiene = o.get(l) || 0;
        if (tiene < n) fuera.push('- ' + l + (n - tiene > 1 || n > 1 ? '   [faltan ' + (n - tiene) + ' de ' + n + ']' : ''));
    }
    for (const [l, n] of o) {
        const esperadas = e.get(l) || 0;
        if (n > esperadas) fuera.push('+ ' + l + (n - esperadas > 1 || esperadas > 0 ? '   [sobran ' + (n - esperadas) + ' de ' + n + ']' : ''));
    }
    fuera.sort(ordenEstable);
    return fuera;
}

// --- corrida de jest sin npx: se invoca su binario con el node actual --------
function correrJest(salidaJson, extra) {
    const require_ = createRequire(path.join(RAIZ, 'package.json'));
    // jest 29 declara `exports`, así que hay que pedirle el especificador que
    // publica («jest/bin/jest»), no la ruta cruda del fichero.
    let binJest;
    for (const spec of ['jest/bin/jest', 'jest/bin/jest.js']) {
        try {
            binJest = require_.resolve(spec);
            break;
        } catch { /* siguiente */ }
    }
    if (!binJest) {
        try {
            binJest = path.join(path.dirname(require_.resolve('jest/package.json')), 'bin', 'jest.js');
        } catch {
            morir('no encuentro el binario de jest — ¿faltan las dependencias (npm ci)?');
        }
    }
    if (!fs.existsSync(binJest)) morir('el binario de jest no existe: ' + binJest);
    const args = [binJest, '--json', '--outputFile=' + salidaJson, ...extra];
    const r = spawnSync(process.execPath, args, { encoding: 'utf8', cwd: RAIZ });
    return { code: r.status, stderr: r.stderr || '', stdout: r.stdout || '' };
}

// --- ¿de verdad medí lo que creo que medí? -----------------------------------
//
// Los tres bloqueantes de la devolución eran la misma pregunta: el instrumento
// se fiaba de su propia salida sin comprobar que la salida fuese real.
// Multiplicidad (arriba), ejecución efectiva y frescura (aquí).

/** El informe tiene que venir de una corrida que EJECUTÓ tests. */
function exigirCorridaEfectiva(informe, de) {
    if (!informe || typeof informe !== 'object') morir('informe ilegible: ' + de);
    if (!Array.isArray(informe.testResults)) morir('el JSON no parece de jest (sin testResults): ' + de);
    if (!informe.numTotalTests || informe.numTotalTests < 1) {
        morir(
            'la corrida NO ejecutó ni un solo test (numTotalTests=' + (informe.numTotalTests || 0) + '): ' + de +
            '\n  Un fallo catastrófico no es un conjunto de rojos vacío: es la ausencia de medida. No se declara nada.'
        );
    }
}

/**
 * El informe tiene que venir SIN cobertura.
 * Si trae `coverageMap`, los umbrales pudieron tumbar la corrida sin dejar
 * rastro con nombre en el JSON, y entonces `SINNOMBRE` queda tapado por
 * cualquier rojo con nombre. El dato estaba ahí desde el principio y el
 * instrumento no lo miraba: hasta ahora la única defensa era un flag a mano.
 */
function exigirSinCobertura(informe, de, permitir) {
    const cm = informe.coverageMap;
    const trae = cm && typeof cm === 'object' && Object.keys(cm).length > 0;
    if (trae && !permitir) {
        morir(
            'el informe trae cobertura (coverageMap): ' + de +
            '\n  Con cobertura activa, un fallo de umbral NO deja rastro con nombre en el JSON y queda' +
            '\n  tapado por cualquier rojo con nombre. Corre el gate con `--coverage=false`,' +
            '\n  o pasa `--permitir-cobertura` si de verdad sabes lo que haces.'
        );
    }
}

/**
 * Prueba de FRESCURA: el informe tiene que ser de hace un rato.
 * Sin esto, una corrida que revienta sin escribir el JSON deja en la ruta el
 * JSON BUENO de la corrida anterior y el gate lo bendice. El vector lo arma el
 * propio encadenado con `;` que este instrumento recomendaba.
 * `startTime` es la marca que pone jest al arrancar: es la corrida hablando de
 * sí misma, y no la mueve un `touch`.
 */
function exigirFrescura(informe, rutaJson, maxSeg) {
    if (maxSeg <= 0) {
        process.stderr.write('rojos-jest: AVISO — prueba de frescura DESACTIVADA a petición (--edad-max 0)\n');
        return;
    }
    const ahora = Date.now();
    const arranque = Number(informe.startTime) || 0;
    if (!arranque) morir('el informe no trae startTime: no se puede probar que sea fresco (' + rutaJson + ')');
    const edad = (ahora - arranque) / 1000;
    if (edad > maxSeg) {
        morir(
            'el informe es VIEJO: arrancó hace ' + Math.round(edad) + ' s (tope ' + maxSeg + ' s) — ' + rutaJson +
            '\n  Un JSON rancio en la ruta esperada es exactamente como una corrida que revienta sin escribir' +
            '\n  pasa por verde. Vuelve a correr jest, o sube el tope con `--edad-max <segundos>`.'
        );
    }
    if (edad < -60) morir('el informe dice haber arrancado en el futuro (' + Math.round(-edad) + ' s): reloj inconsistente');
}

// --- M6 · `--repetir` promete PARALELO; que no lo desactive un argumento -----
//
// WP-V91, SEGUNDA VUELTA. Aquí había una lista de EXPRESIONES REGULARES contra
// la forma literal del argumento, y esa era la equivocación de fondo: la forma
// literal de una bandera de jest tiene muchas variantes y la lista sólo cazaba
// las que a alguien se le ocurrieron. MEDIDO con 6 suites que anotan su PID
// (jest 29.7.0, `--no-cache`, esta máquina de 12 CPU), NUEVE formas dejan jest
// en UN SOLO PROCESO y la lista sólo cazaba cuatro:
//
//   cazadas  : --maxWorkers=1 · -w 1 · --runInBand · -i
//   coladas  : --max-workers=1 · --max-workers 1 · --runInBand=true · -i=true
//              --maxWorkers=01 · --maxWorkers=1.0 · --maxWorkers=+1 · --maxWorkers=10%
//
// Así que no se compara la forma: se ANALIZA el argumento y se pregunta cuántos
// procesos deja. Los controles, también medidos: `--maxWorkers=6` → 6,
// `--maxWorkers=50%` → 6, `--runInBand=false` → 6. Esos no se tocan.

/** Nombre canónico de una bandera: sin guiones, sin mayúsculas. */
function canon(nombre) {
    return nombre.replace(/^-+/, '').replace(/-/g, '').toLowerCase();
}

/**
 * Cuántos procesos deja jest con este valor de `--maxWorkers`.
 * `null` = el valor no lo fija (y entonces no hay nada que reprochar).
 *
 * El porcentaje se resuelve con las CPU de ESTA máquina, que es el criterio
 * correcto: lo que importa es si LA CORRIDA QUE SE ESTÁ MIDIENDO es paralela.
 * MEDIDO contra jest 29.7.0 con 12 CPU — 9 % → 1, 10 % → 1, 20 % → 2,
 * 25 % → 3, 50 % → 6 — o sea `floor(cpus × pct / 100)`, en cinco puntos.
 */
function trabajadoresPedidos(valor) {
    if (valor === undefined || valor === null || valor === '') return null;
    const s = String(valor).trim();
    if (s.endsWith('%')) {
        const pct = Number(s.slice(0, -1));
        if (!Number.isFinite(pct)) return null;
        return Math.floor((os.cpus().length * pct) / 100);
    }
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
}

/** Los argumentos que dejan a jest en un solo proceso, con su forma original. */
function argumentosSeriales(extra) {
    const culpables = [];
    for (let i = 0; i < extra.length; i++) {
        const bruto = String(extra[i]);
        if (!bruto.startsWith('-')) continue;
        const igual = bruto.indexOf('=');
        const nombre = canon(igual >= 0 ? bruto.slice(0, igual) : bruto);
        let valor = igual >= 0 ? bruto.slice(igual + 1) : undefined;

        // Booleanas: sin valor significa «sí»; sólo `=false`/`=0`/`=no` la apagan.
        if (nombre === 'runinband' || nombre === 'i') {
            if (valor === undefined || !/^(false|0|no)$/i.test(valor)) culpables.push(bruto);
            continue;
        }
        // Numéricas: el valor puede venir pegado o en el argumento siguiente.
        if (nombre === 'maxworkers' || nombre === 'w') {
            let mostrar = bruto;
            if (valor === undefined) {
                const siguiente = extra[i + 1];
                if (siguiente !== undefined && !String(siguiente).startsWith('-')) {
                    valor = String(siguiente);
                    mostrar = bruto + ' ' + valor;
                    i++;
                }
            }
            const n = trabajadoresPedidos(valor);
            if (n !== null && n <= 1) culpables.push(mostrar);
        }
    }
    return culpables;
}

function exigirParalelo(extra, permitir) {
    const culpables = argumentosSeriales(extra);
    if (culpables.length && !permitir) {
        morir(
            'estos argumentos serializan jest: ' + culpables.join(' ') +
            '\n  `--repetir` existe para medir determinismo BAJO CONTENCIÓN. En serie la suite sale idéntica' +
            '\n  sin que nadie haya arreglado nada, así que el resultado no valdría como evidencia.' +
            '\n  Si de verdad quieres medir en serie, dilo con `--permitir-serial` y que conste en la salida.'
        );
    }
    return culpables;
}

function leerBaseline(ruta) {
    if (!fs.existsSync(ruta)) morir('no existe el baseline: ' + ruta);
    return fs.readFileSync(ruta, 'utf8')
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#'));
}

function comparar(esperado, obtenido) {
    const d = diff(esperado, obtenido);
    if (d.length === 0) {
        process.stdout.write('conjunto de rojos IDENTICO al declarado\n');
        return 0;
    }
    process.stdout.write('conjunto de rojos DISTINTO del declarado:\n' + d.join('\n') + '\n');
    return 1;
}

function sacarBandera(argv, nombre) {
    const i = argv.indexOf(nombre);
    if (i < 0) return false;
    argv.splice(i, 1);
    return true;
}

/**
 * WP-V91 · aquí había un `Number(v)` a pelo, y era un agujero en la guarda de
 * frescura: `Number(undefined)` —`--edad-max` escrito al final, sin valor— y
 * `Number('900s')` valen **NaN**, y `NaN > maxSeg` es **false**. O sea que un
 * dedo gordo apagaba la prueba de frescura SIN UNA LÍNEA DE AVISO y el informe
 * rancio pasaba con EXIT 0, que es justo lo que la guarda existe para impedir.
 * MEDIDO antes del arreglo, con un informe de hace una hora: `--edad-max`,
 * `--edad-max 900s` y `--edad-max xyz` daban los tres «IDENTICO», EXIT 0.
 *
 * Una guarda sólo puede apagarse a propósito y en voz alta (`--edad-max 0`,
 * que lo grita por stderr). Nunca por un descuido.
 */
function sacarValor(argv, nombre, pordefecto) {
    const i = argv.indexOf(nombre);
    if (i < 0) return pordefecto;
    const v = argv[i + 1];
    argv.splice(i, 2);
    const n = Number(v);
    if (!Number.isFinite(n)) {
        morir(
            nombre + ' necesita un número de segundos, y recibió «' + (v === undefined ? '(nada)' : v) + '».' +
            '\n  Un valor ilegible deja NaN, y NaN no es mayor que nada: la guarda se apagaría sola.' +
            '\n  Para desactivarla a propósito, y que conste en la salida: `' + nombre + ' 0`.'
        );
    }
    return n;
}

// --- despacho ----------------------------------------------------------------
const argv = process.argv.slice(2);

if (argv.length === 0 || argv[0] === '-h' || argv[0] === '--help') {
    process.stdout.write(
        'uso:\n' +
        '  node scripts/rojos-jest.mjs --gate [--baseline <f.txt>] [-- <args de jest>]\n' +
        '      LA FORMA RECOMENDADA: corre jest él mismo y compara. Sin JSON que\n' +
        '      pueda quedarse rancio, porque lo escribe y lo borra él.\n' +
        '  node scripts/rojos-jest.mjs <resultado.json>\n' +
        '  node scripts/rojos-jest.mjs --check <baseline.txt> <resultado.json> [--edad-max <seg>] [--permitir-cobertura]\n' +
        '  node scripts/rojos-jest.mjs --repetir <N> [--permitir-serial] [-- <args de jest>]\n'
    );
    process.exit(argv.length === 0 ? 2 : 0);
}

if (argv[0] === '--gate') {
    argv.shift();
    const permitirCobertura = sacarBandera(argv, '--permitir-cobertura');
    let baseline = 'scripts/rojos-jest.baseline.txt';
    const iB = argv.indexOf('--baseline');
    if (iB >= 0) { baseline = argv[iB + 1]; argv.splice(iB, 2); }
    const sep = argv.indexOf('--');
    const extra = sep >= 0 ? argv.slice(sep + 1) : [];
    if (!extra.some((a) => a.startsWith('--coverage'))) extra.unshift('--coverage=false');

    const esperado = leerBaseline(baseline);
    // Fichero con nonce, fuera del árbol: no hay JSON previo que pueda colarse.
    const tmp = tmpEfimero('rojos-jest-gate-');
    const salida = path.join(tmp, 'jest-' + process.pid + '-' + Date.now() + '.json');
    let rc;
    try {
        const r = correrJest(salida, extra);
        if (!fs.existsSync(salida)) {
            morir('jest no llegó a escribir el JSON (exit=' + r.code + '). No hay medida que comparar.\n' + (r.stderr || '').slice(-800));
        }
        const informe = leerInforme(salida);
        exigirCorridaEfectiva(informe, salida);
        exigirSinCobertura(informe, salida, permitirCobertura);
        rc = comparar(esperado, conjuntoDeRojos(informe));
    } finally {
        fs.rmSync(tmp, { recursive: true, force: true });
    }
    process.exit(rc);
}

if (argv[0] === '--check') {
    argv.shift();
    const permitirCobertura = sacarBandera(argv, '--permitir-cobertura');
    const maxSeg = sacarValor(argv, '--edad-max', 900);
    const rutaBase = argv[0];
    const rutaJson = argv[1];
    if (!rutaBase || !rutaJson) morir('--check necesita <baseline.txt> y <resultado.json>');
    const esperado = leerBaseline(rutaBase);
    const informe = leerInforme(rutaJson);
    exigirCorridaEfectiva(informe, rutaJson);
    exigirSinCobertura(informe, rutaJson, permitirCobertura);
    exigirFrescura(informe, rutaJson, maxSeg);
    process.exit(comparar(esperado, conjuntoDeRojos(informe)));
}

if (argv[0] === '--repetir') {
    argv.shift();
    const permitirSerial = sacarBandera(argv, '--permitir-serial');
    const permitirCobertura = sacarBandera(argv, '--permitir-cobertura');
    const n = Number(argv[0]);
    if (!Number.isInteger(n) || n < 1) morir('--repetir necesita un entero >= 1');
    const sep = argv.indexOf('--');
    const extra = sep >= 0 ? argv.slice(sep + 1) : [];
    const seriales = exigirParalelo(extra, permitirSerial);
    if (seriales.length) {
        process.stdout.write('AVISO: corriendo EN SERIE a petición (' + seriales.join(' ') + ').\n' +
            'Este resultado NO vale como evidencia de determinismo: en serie no hay contención.\n\n');
    }

    // Fuera del árbol de trabajo: una corrida no deja contrabando en el repo.
    const tmp = tmpEfimero('rojos-jest-');
    const conjuntos = [];
    let ejecutados = 0;
    try {
        for (let i = 1; i <= n; i++) {
            const salida = path.join(tmp, 'run-' + i + '.json');
            const r = correrJest(salida, extra);
            if (!fs.existsSync(salida)) {
                // B2: esto NO es «un conjunto de rojos» que pueda coincidir con
                // otro. Es la ausencia de medida, y se corta aquí. Antes se
                // metía como una línea más y N catástrofes idénticas se
                // proclamaban «determinismo demostrado».
                morir(
                    'corrida ' + i + '/' + n + ': jest no llegó a escribir el JSON (exit=' + r.code + ').' +
                    '\n  N fallos catastróficos reproducibles NO son determinismo: son N veces sin medir.' +
                    '\n' + (r.stderr || '').slice(-800)
                );
            }
            const informe = leerInforme(salida);
            exigirCorridaEfectiva(informe, 'corrida ' + i);
            exigirSinCobertura(informe, 'corrida ' + i, permitirCobertura);
            ejecutados = informe.numTotalTests;
            const c = conjuntoDeRojos(informe);
            conjuntos.push(c);
            process.stdout.write('--- corrida ' + i + '/' + n + ' (jest exit=' + r.code + ', ' + informe.numTotalTests + ' tests ejecutados) ---\n' + texto(c));
        }
    } finally {
        fs.rmSync(tmp, { recursive: true, force: true });
    }
    const primero = texto(conjuntos[0]);
    const discrepantes = [];
    for (let i = 1; i < conjuntos.length; i++) if (texto(conjuntos[i]) !== primero) discrepantes.push(i + 1);
    if (discrepantes.length === 0) {
        process.stdout.write('\nVEREDICTO: las ' + n + ' corridas ejecutaron ' + ejecutados +
            ' tests y dieron el MISMO conjunto por nombre' + (seriales.length ? ' — EN SERIE, no vale como evidencia' : '') + '\n');
        process.exit(seriales.length ? 1 : 0);
    }
    process.stdout.write('\nVEREDICTO: corridas discrepantes respecto de la 1: ' + discrepantes.join(', ') + '\n');
    for (const i of discrepantes) {
        process.stdout.write('--- diff corrida 1 -> corrida ' + i + ' ---\n' + diff(conjuntos[0], conjuntos[i - 1]).join('\n') + '\n');
    }
    process.exit(1);
}

process.stdout.write(texto(conjuntoDeRojos(leerInforme(argv[0]))));
