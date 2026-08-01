#!/usr/bin/env node
// =============================================================================
// cobertura-trinquete.mjs · la cobertura no puede bajar — WP-V93, 2ª vuelta
// =============================================================================
//
// MOTIVO
//   La primera entrega de este WP puso el trinquete en `coverageThreshold` de
//   jest, como PORCENTAJE, y lo vendió con un colchón de «1 punto». Las dos
//   cosas eran falsas, y la devolución las midió:
//
//     · El colchón real era de 0,10 puntos — SEIS sentencias sobre 5903 —
//       porque jest compara con dos decimales (`CoverageReporter.js:324`,
//       `actual < threshold` sobre un `pct` ya redondeado a 2). Un déficit de
//       0,01 bloquea. O sea: el argumento con el que se justificaba bajar el
//       umbral no lo sostenía el número.
//
//     · Y el denominador NO es estable. 3 ficheros de `src` son código real
//       que no compila (TS2353), así que istanbul no los instrumenta y sus
//       sentencias no entran en el total. MEDIDO: al entrar, el denominador
//       crece +135 sentencias / +67 ramas sin que lo cubierto se mueva. Es
//       decir: **arreglar dos errores de tipos ponía CI en rojo**, y romper la
//       compilación de un fichero mal cubierto SUBÍA el porcentaje con la
//       suite en verde. Exactamente el vicio con el que este mismo WP mató la
//       alternativa «una sola corrida» — en otro órgano y sin declarar.
//
// QUÉ HACE ESTE INSTRUMENTO, ENTONCES
//   Dos comprobaciones, las dos de dos direcciones, sobre el informe que acaba
//   de escribir jest. Ninguna usa porcentajes para decidir.
//
//   1) CENSO. Todo fichero de `src/**/*.ts` (sin .d/.test/.spec) tiene que
//      aparecer en el mapa de cobertura. Faltar sólo es legítimo si está
//      DECLARADO en `scripts/cobertura.suelo.json` con su clase y su motivo.
//         · falta y no está declarado  → ERROR (estrechamiento silencioso)
//         · está declarado y ya aparece → ERROR (declaración caduca)
//      La segunda dirección importa tanto como la primera: es la que hace que
//      arreglar un TS2353 se cobre como UNA LÍNEA que borrar, en vez de como
//      un rojo de porcentaje que nadie sabe leer.
//
//   2) TRINQUETE sobre UNIDADES CUBIERTAS ABSOLUTAS, no sobre porcentaje.
//      Inmune al denominador: sólo baja si se pierde cobertura de verdad.
//         · cubierto < suelo          → ERROR (regresión)
//         · cubierto > suelo + colchón → ERROR (mejora sin registrar)
//      La segunda dirección es la que hace que esto sea un TRINQUETE y no una
//      pendiente: sin ella el suelo sólo se movería a la baja, porque nadie
//      propone subirlo cuando la cobertura mejora. Con ella, una mejora es un
//      diff de una línea que alguien firma — igual que el conjunto de rojos.
//
// LO QUE ESTE INSTRUMENTO **NO** GARANTIZA — léase antes de confiar en él
//   · NO exige que la cobertura suba. El 26 % es deuda CONGELADA, no reducida.
//     La meta histórica (75/80/85/85) no la vigila nadie, a propósito: un
//     umbral que no se cumple ningún día no vigila ninguno.
//   · NO prueba su propia frescura tan bien como el gate de rojos. Aquél corre
//     jest él mismo; éste LEE el informe que dejó el paso anterior y sólo puede
//     mirar el `mtime` del fichero. Un `touch` lo engañaría; una corrida que
//     reventó sin escribir, no (el informe viejo caduca y el instrumento muere
//     con código 2, nunca en verde). Se eligió leer en vez de correr para no
//     meter una TERCERA corrida completa de la suite en CI.
//   · NO vigila la cobertura de `scripts/` ni de `tests/`: `collectCoverageFrom`
//     es sólo `src/**`. El propio instrumento del gate queda fuera del número.
//   · NO impide que alguien baje el suelo: impide que baje SIN FIRMA. El
//     fichero de datos existe para que esa firma sea visible en el diff.
//   · NO se vigila a sí mismo con tests propios, al contrario que
//     `scripts/rojos-jest.mjs` (36 tests). `tests/**` no está en el ALCANCE_DIFF
//     de este WP. Queda dicho como deuda, no disimulado.
//
// CÓDIGOS DE SALIDA
//   0  censo completo y cubiertas exactamente en el suelo declarado
//   1  censo o trinquete incumplidos (con el detalle y el JSON que hay que pegar)
//   2  error de uso, o el informe falta / es ilegible / está rancio
//      (NUNCA verde por no haber podido leer: un instrumento mudo que parece
//      verde es el fallo que este WP entero viene a corregir)
// =============================================================================

import fs from 'node:fs';
import path from 'node:path';

const RAIZ = process.cwd();
const METRICAS = ['statements', 'branches', 'functions', 'lines'];

function morir(msg) {
    process.stderr.write('cobertura-trinquete: ' + msg + '\n');
    process.exit(2);
}

function leerJson(ruta, que) {
    if (!fs.existsSync(ruta)) {
        morir(
            'no existe ' + que + ': ' + ruta +
            '\n  Este instrumento LEE el informe que deja `npm test`. Si no está, no hay medida que' +
            '\n  comparar — y no hay nada que declarar. Corre la suite instrumentada antes.'
        );
    }
    try {
        return JSON.parse(fs.readFileSync(ruta, 'utf8'));
    } catch (e) {
        morir('no se pudo interpretar ' + que + ' (' + ruta + '): ' + e.message);
    }
}

/**
 * Igual que en `rojos-jest.mjs`: un valor ilegible deja NaN, y NaN no es mayor
 * que nada, así que la guarda se apagaría SOLA y en silencio. Sólo se apaga a
 * propósito y en voz alta.
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
            '\n  Para desactivar la guarda a propósito, y que conste en la salida: `' + nombre + ' 0`.'
        );
    }
    return n;
}

function exigirFrescura(ruta, maxSeg) {
    if (maxSeg <= 0) {
        process.stderr.write('cobertura-trinquete: AVISO — prueba de frescura DESACTIVADA a petición (--edad-max 0)\n');
        return;
    }
    const edad = (Date.now() - fs.statSync(ruta).mtimeMs) / 1000;
    if (edad > maxSeg) {
        morir(
            'el informe de cobertura es VIEJO: ' + Math.round(edad) + ' s (tope ' + maxSeg + ' s) — ' + ruta +
            '\n  Un informe rancio en la ruta esperada es exactamente cómo una corrida que revienta sin' +
            '\n  escribir pasa por verde. Vuelve a correr `npm test`, o sube el tope con `--edad-max`.'
        );
    }
}

/** Los ficheros que `collectCoverageFrom` dice recoger. Se deriva, no se copia. */
function censoDeFuentes(dir, out = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = dir + '/' + e.name;
        if (e.isDirectory()) censoDeFuentes(p, out);
        else if (e.name.endsWith('.ts') && !/\.(d|test|spec)\.ts$/.test(e.name)) out.push(p);
    }
    return out;
}

const argv = process.argv.slice(2);
if (argv[0] === '-h' || argv[0] === '--help') {
    process.stdout.write(
        'uso:\n' +
        '  node scripts/cobertura-trinquete.mjs [--suelo <f.json>] [--cobertura <dir>] [--edad-max <seg>]\n' +
        '      Lee el informe que dejó `npm test` y aplica censo + trinquete.\n'
    );
    process.exit(0);
}

function sacarRuta(argv, nombre, pordefecto) {
    const i = argv.indexOf(nombre);
    if (i < 0) return pordefecto;
    const v = argv[i + 1];
    argv.splice(i, 2);
    if (!v || v.startsWith('-')) morir(nombre + ' necesita una ruta y no la recibió');
    return v;
}

const maxSeg = sacarValor(argv, '--edad-max', 900);
const rutaSuelo = sacarRuta(argv, '--suelo', 'scripts/cobertura.suelo.json');
const dirCob = sacarRuta(argv, '--cobertura', 'coverage');
if (argv.length) morir('argumento no reconocido: ' + argv.join(' '));

const rutaResumen = path.join(dirCob, 'coverage-summary.json');
const rutaFinal = path.join(dirCob, 'coverage-final.json');

const declarado = leerJson(rutaSuelo, 'el suelo declarado');
const resumen = leerJson(rutaResumen, 'el resumen de cobertura');
const final = leerJson(rutaFinal, 'el mapa de cobertura');
exigirFrescura(rutaResumen, maxSeg);

if (!resumen.total || typeof resumen.total !== 'object') {
    morir('el resumen no trae `total`: no parece de jest (' + rutaResumen + ')');
}

const fallos = [];

// --- 1 · CENSO ---------------------------------------------------------------
const enMapa = new Set(
    Object.keys(final).map((p) => path.relative(RAIZ, p).split(path.sep).join('/'))
);
if (enMapa.size === 0) morir('el mapa de cobertura está vacío: no hay medida (' + rutaFinal + ')');

const declaradosAusentes = new Map();
for (const [clase, bloque] of Object.entries(declarado.censo || {})) {
    if (clase === '_') continue;
    for (const f of bloque.ficheros || []) declaradosAusentes.set(f, clase);
}

const fuentes = censoDeFuentes('src');
const ausentes = fuentes.filter((f) => !enMapa.has(f));

const ausentesSinDeclarar = ausentes.filter((f) => !declaradosAusentes.has(f));
const declaradosQueYaEstan = [...declaradosAusentes.keys()].filter((f) => enMapa.has(f));
const declaradosQueNoExisten = [...declaradosAusentes.keys()].filter((f) => !fs.existsSync(f));

if (ausentesSinDeclarar.length) {
    fallos.push(
        'CENSO · ' + ausentesSinDeclarar.length + ' fichero/s de src NO aparecen en el mapa de cobertura y NO están declarados:\n' +
        ausentesSinDeclarar.map((f) => '    + ' + f).join('\n') +
        '\n  Un fichero fuera del mapa no cuenta ni arriba ni abajo: desaparece del número sin que\n' +
        '  nadie lo note. Mira la salida de `npm test` («Failed to collect coverage from …»): si no\n' +
        '  compila, es DEUDA y va al censo con su motivo; si sólo tiene tipos, es ausencia legítima.'
    );
}
if (declaradosQueYaEstan.length) {
    fallos.push(
        'CENSO · ' + declaradosQueYaEstan.length + ' fichero/s declarados como ausentes YA APARECEN en el mapa:\n' +
        declaradosQueYaEstan.map((f) => '    - ' + f).join('\n') +
        '\n  Buena noticia: alguien lo arregló. Bórralo/s de scripts/cobertura.suelo.json. Esta\n' +
        '  dirección existe para que una mejora se cobre como una línea que borrar, y no como un\n' +
        '  rojo que nadie sabe leer.'
    );
}
if (declaradosQueNoExisten.length) {
    fallos.push(
        'CENSO · ' + declaradosQueNoExisten.length + ' fichero/s declarados ya NO EXISTEN en src:\n' +
        declaradosQueNoExisten.map((f) => '    ? ' + f).join('\n') +
        '\n  Una excepción que apunta a un fichero borrado no exime de nada: quítala.'
    );
}

// --- 2 · TRINQUETE sobre unidades cubiertas ----------------------------------
const colchon = Number(declarado.colchon);
if (!Number.isFinite(colchon) || colchon < 0) {
    morir('`colchon` del suelo declarado no es un número >= 0: ' + JSON.stringify(declarado.colchon));
}

const actual = {};
for (const m of METRICAS) {
    const bloque = resumen.total[m];
    if (!bloque || typeof bloque.covered !== 'number') morir('el resumen no trae `total.' + m + '.covered`');
    actual[m] = bloque.covered;
}

const bajadas = [];
const subidas = [];
for (const m of METRICAS) {
    const suelo = declarado.cubiertas?.[m];
    if (typeof suelo !== 'number') morir('el suelo declarado no trae `cubiertas.' + m + '`');
    if (actual[m] < suelo) bajadas.push(`${m}: ${actual[m]} cubiertas < suelo ${suelo}  (faltan ${suelo - actual[m]})`);
    else if (actual[m] > suelo + colchon) subidas.push(`${m}: ${actual[m]} cubiertas > suelo ${suelo}+${colchon}  (sobran ${actual[m] - suelo - colchon})`);
}

const jsonParaPegar = '  "cubiertas": ' + JSON.stringify(actual, null, 4).replace(/\n/g, '\n  ');

if (bajadas.length) {
    fallos.push(
        'TRINQUETE · la cobertura BAJÓ:\n' + bajadas.map((l) => '    ' + l).join('\n') +
        '\n  Se perdieron unidades cubiertas. Esto NO se arregla bajando el suelo: se arregla\n' +
        '  devolviendo la cobertura, o firmando la pérdida en scripts/cobertura.suelo.json con\n' +
        '  el motivo escrito al lado.'
    );
}
if (subidas.length) {
    fallos.push(
        'TRINQUETE · la cobertura SUBIÓ y el suelo no lo recoge:\n' + subidas.map((l) => '    ' + l).join('\n') +
        '\n  Un trinquete que sólo se mueve a la baja es una pendiente. Registra la mejora — pega\n' +
        '  esto en scripts/cobertura.suelo.json:\n\n' + jsonParaPegar
    );
}

// --- veredicto ---------------------------------------------------------------
const pct = (m) => (resumen.total[m].pct + ' %').padEnd(8);
process.stdout.write(
    'censo: ' + fuentes.length + ' ficheros en src · ' + enMapa.size + ' en el mapa · ' +
    ausentes.length + ' ausentes (' + declaradosAusentes.size + ' declarados)\n' +
    METRICAS.map((m) =>
        '  ' + m.padEnd(11) + String(actual[m]).padStart(5) + ' cubiertas (suelo ' +
        declarado.cubiertas[m] + ') · ' + pct(m) + 'informativo, NO decide'
    ).join('\n') + '\n'
);

if (fallos.length) {
    process.stdout.write('\n' + fallos.join('\n\n') + '\n');
    process.exit(1);
}
process.stdout.write('\ncobertura: censo COMPLETO y unidades cubiertas EN EL SUELO declarado\n');
process.exit(0);
