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

function diff(esperado, obtenido) {
    const eSet = new Set(esperado);
    const oSet = new Set(obtenido);
    const fuera = [];
    for (const l of esperado) if (!oSet.has(l)) fuera.push('- ' + l);
    for (const l of obtenido) if (!eSet.has(l)) fuera.push('+ ' + l);
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

// --- despacho ----------------------------------------------------------------
const argv = process.argv.slice(2);

if (argv.length === 0 || argv[0] === '-h' || argv[0] === '--help') {
    process.stdout.write(
        'uso:\n' +
        '  node scripts/rojos-jest.mjs <resultado.json>\n' +
        '  node scripts/rojos-jest.mjs --check <baseline.txt> <resultado.json>\n' +
        '  node scripts/rojos-jest.mjs --repetir <N> [-- <args de jest>]\n'
    );
    process.exit(argv.length === 0 ? 2 : 0);
}

if (argv[0] === '--check') {
    const rutaBase = argv[1];
    const rutaJson = argv[2];
    if (!rutaBase || !rutaJson) morir('--check necesita <baseline.txt> y <resultado.json>');
    if (!fs.existsSync(rutaBase)) morir('no existe el baseline: ' + rutaBase);
    const esperado = fs.readFileSync(rutaBase, 'utf8')
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#'));
    const obtenido = conjuntoDeRojos(leerInforme(rutaJson));
    const d = diff(esperado, obtenido);
    if (d.length === 0) {
        process.stdout.write('conjunto de rojos IDENTICO al declarado\n');
        process.exit(0);
    }
    process.stdout.write('conjunto de rojos DISTINTO del declarado:\n' + d.join('\n') + '\n');
    process.exit(1);
}

if (argv[0] === '--repetir') {
    const n = Number(argv[1]);
    if (!Number.isInteger(n) || n < 1) morir('--repetir necesita un entero >= 1');
    const sep = argv.indexOf('--');
    const extra = sep >= 0 ? argv.slice(sep + 1) : [];
    // Fuera del árbol de trabajo: una corrida no deja contrabando en el repo.
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rojos-jest-'));
    const conjuntos = [];
    try {
        for (let i = 1; i <= n; i++) {
            const salida = path.join(tmp, 'run-' + i + '.json');
            const r = correrJest(salida, extra);
            const c = fs.existsSync(salida) ? conjuntoDeRojos(leerInforme(salida)) : ['SINNOMBRE (toda la corrida) :: jest no llegó a escribir el JSON (code=' + r.code + ')'];
            conjuntos.push(c);
            process.stdout.write('--- corrida ' + i + '/' + n + ' (jest exit=' + r.code + ') ---\n' + texto(c));
        }
    } finally {
        fs.rmSync(tmp, { recursive: true, force: true });
    }
    const primero = texto(conjuntos[0]);
    const discrepantes = [];
    for (let i = 1; i < conjuntos.length; i++) if (texto(conjuntos[i]) !== primero) discrepantes.push(i + 1);
    if (discrepantes.length === 0) {
        process.stdout.write('\nVEREDICTO: las ' + n + ' corridas dieron el MISMO conjunto por nombre\n');
        process.exit(0);
    }
    process.stdout.write('\nVEREDICTO: corridas discrepantes respecto de la 1: ' + discrepantes.join(', ') + '\n');
    for (const i of discrepantes) {
        process.stdout.write('--- diff corrida 1 -> corrida ' + i + ' ---\n' + diff(conjuntos[0], conjuntos[i - 1]).join('\n') + '\n');
    }
    process.exit(1);
}

process.stdout.write(texto(conjuntoDeRojos(leerInforme(argv[0]))));
