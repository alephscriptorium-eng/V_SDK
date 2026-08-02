#!/usr/bin/env node
// =============================================================================
// scripts/anclas-censo.mjs · el ancla de texto que `citas-rancias` pedia — WP-V101
// =============================================================================
//
// MOTIVO, CON LAS CUATRO GENERACIONES MEDIDAS
//   `scripts/citas-rancias.mjs` declara en cada corrida su ceguera irreducible:
//   comprueba que una cita APUNTA A ALGO QUE EXISTE, no que diga la verdad, y
//   nombra el remedio que no estaba hecho — «un ancla de texto guardada junto a
//   cada cita». Esto es ese ancla.
//
//   El caso que la exige: DONDE VIVEN LOS DOS `customEditors` del manifiesto.
//     1. cuerpo del censo heredado ... package.json:1446 y :1456
//     2. WP-V15 ...................... package.json:1219
//     3. acta ⛔ del censo ........... package.json:1165 y :1175, «1248 lineas»
//     4. medido el 2026-08-02 ........ package.json:1110 y :1120, 1197 lineas
//   La tercera es un ACTA escrita PARA ARREGLAR la segunda, y caduco igual. Las
//   cuatro resuelven, asi que el barrido de citas las aprueba todas.
//
// LA IDEA: EL HECHO NO ES LA COORDENADA
//   Un numero de linea es donde el hecho estaba ayer. Pincharlo es lo que fallo
//   las cuatro veces. Aqui se declara el HECHO —que token, en que fichero,
//   cuantas veces— en `plan/ANCLAS.json`, y el gate DERIVA la coordenada de hoy.
//   Entonces puede hacer dos cosas que ningun barrido de coordenadas hace:
//
//     (a) VERIFICAR EL HECHO. Si el token desaparece o cambia de recuento,
//         rojo. Inmune a que el fichero se mueva: mover lineas no lo enrojece,
//         que es justo lo que hacia insostenibles los gates de linea.
//
//     (b) VERIFICAR LA CITA DEL DOCUMENTO VIVO. Compara la coordenada que el
//         documento AFIRMA con la que se acaba de medir, y si no coinciden
//         imprime la correccion exacta que hay que escribir. Eso ES la deriva
//         de las cuatro generaciones, convertida en rojo.
//
//   `veces` no es decorativo: caza la deriva de COMPOSICION, que es peor que la
//   de linea y que ningun re-medidor de coordenadas ve. El censo declaraba 7
//   puntos de `theatrical-content` con 5 en `extensionBootstrap.ts`; ese fichero
//   tiene hoy CERO menciones y los puntos vivos estan repartidos en otros
//   cuatro. Las coordenadas no se habian desplazado: el inventario era otro.
//
// AMBITO, Y POR QUE NO TOCA LOS REPORTES
//   `plan/PRACTICAS.md` §7: un reporte es ACTA y solo se anota; un censo o un
//   documento de gobierno se CORRIGE, porque alguien planifica sobre el. Por eso
//   `citas` solo apunta a documentos vivos. Anclar un acta seria pedir que se
//   reescriba la historia.
//
// LO QUE UN VERDE DE AQUI **NO** SIGNIFICA
//   Solo cubre las anclas REGISTRADAS. No descubre hechos que nadie anclo, y el
//   denominador sale en cada corrida para que eso se vea. Un ancla de mas es
//   trabajo; un ancla de menos es una deriva que nadie vera. Tampoco juzga si el
//   `porque` de un ancla es cierto: eso es prosa y no se mecaniza.
//
// USO
//   node scripts/anclas-censo.mjs              verifica (por defecto)
//   node scripts/anclas-censo.mjs --verbose    imprime cada ancla con su coordenada
//   node scripts/anclas-censo.mjs --anclas     censo de anclas, una por linea
//   node scripts/anclas-censo.mjs --raiz <dir> verifica OTRO arbol (lo usan los tests)
//
// CODIGOS DE SALIDA
//   0  todas las anclas se sostienen y todas las citas vivas estan al dia
//   1  alguna ancla se rompio, o alguna cita viva derivo (DEUDA)
//   2  error de uso, o el registro de anclas no se puede leer / esta vacio
//      (un gate sin anclas daria un PASS que no significa nada: calla y sale 2)
//
// QUIEN VIGILA A ESTE VIGILANTE
//   `scripts/tests/anclas-censo.test.ts`, con `npm test`: cada modo de fallo
//   tiene un caso rojo montado sobre un arbol de mentira.
// =============================================================================

import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);

function sacarBandera(n) {
    const i = argv.indexOf(n);
    if (i < 0) return false;
    argv.splice(i, 1);
    return true;
}
function sacarValor(n, pordefecto) {
    const i = argv.indexOf(n);
    if (i < 0) return pordefecto;
    const v = argv[i + 1];
    if (v === undefined || String(v).startsWith('--')) {
        process.stderr.write('anclas-censo: ' + n + ' necesita un valor\n');
        process.exit(2);
    }
    argv.splice(i, 2);
    return v;
}

const CEGUERA = [
    '--- LO QUE ESTE VEREDICTO NO SIGNIFICA --------------------------------------',
    'Solo cubre las anclas REGISTRADAS en plan/ANCLAS.json. No descubre hechos que',
    'nadie anclo: un ancla de menos es una deriva que nadie vera. Por eso el',
    'denominador sale siempre. Tampoco juzga si el `porque` de un ancla es cierto.',
    '',
    'CEGUERA MEDIDA · RECUENTO CORRECTO, SITIO EQUIVOCADO. Un ancla fija QUE token',
    'aparece y CUANTAS veces, no que diga algo sensato. Apuntar el selector a',
    '`**/theatrical-content/CARPETA-QUE-NO-ESCRIBIMOS/*.config.json` deja el',
    'recuento en 2 y este gate sale PASS. Eso lo caza el TEST que ejecuta',
    '(tests/unit/manifiesto/), no este instrumento: aqui se vigila el inventario,',
    'alli la conducta. Las dos mitades hacen falta.',
    '',
    'Y ANCLAR LA CITA NO ES GRATIS: la mitad `citas` compara la coordenada que el',
    'documento vivo afirma, asi que un desplazamiento que no cambia ningun hecho',
    'SI la enrojece. Anclar el HECHO es inmune a mover lineas; anclar la CITA no',
    'lo es — y a cambio te escribe la correccion exacta que hay que poner.'
];

const AYUDA = [
    'uso:',
    '  node scripts/anclas-censo.mjs [--raiz <dir>] [--verbose]',
    '  node scripts/anclas-censo.mjs --anclas     censo de anclas (id<TAB>fichero<TAB>token<TAB>veces)',
    '',
    'Verifica HECHOS anclados (token + recuento por fichero), DERIVA la coordenada',
    'de hoy, y comprueba que lo que afirman los DOCUMENTOS VIVOS sigue siendo esa.',
    '',
    'salidas: 0 al dia · 1 ancla rota o cita derivada · 2 uso / registro ilegible',
    ''
].concat(CEGUERA).join('\n') + '\n';

if (sacarBandera('--help') || sacarBandera('-h')) { process.stdout.write(AYUDA); process.exit(0); }

const RAIZ_REPO = resolve(fileURLToPath(new URL('..', import.meta.url)));
const ROOT = resolve(sacarValor('--raiz', RAIZ_REPO));
const VERBOSE = sacarBandera('--verbose');
const SOLO_CENSO = sacarBandera('--anclas');

if (argv.length) {
    process.stderr.write('anclas-censo: argumento no reconocido: ' + argv[0] + '\n\n' + AYUDA);
    process.exit(2);
}

// --- 1 · registro ------------------------------------------------------------
const REGISTRO = join(ROOT, 'plan', 'ANCLAS.json');
if (!existsSync(REGISTRO)) {
    process.stderr.write('anclas-censo: no hay registro de anclas en ' + REGISTRO + '\n');
    process.exit(2);
}
let registro;
try { registro = JSON.parse(readFileSync(REGISTRO, 'utf8')); }
catch (e) {
    process.stderr.write('anclas-censo: el registro no es JSON valido: ' + e.message + '\n');
    process.exit(2);
}
const anclas = Array.isArray(registro.anclas) ? registro.anclas : [];
if (anclas.length === 0) {
    // Un gate sin anclas pasa siempre. Ese PASS no significa nada y por eso no
    // se emite: es el mismo modo de fallo que un denominador silencioso.
    process.stderr.write('anclas-censo: el registro no declara ni un ancla. Sin veredicto.\n');
    process.exit(2);
}

// ANCLA VACUA: `debeNombrar: [""]` casa con TODAS las lineas del fichero, asi
// que con `veces` = numero de lineas sale PASS sin vigilar nada — y de paso
// INFLA el contador «anclas declaradas», que es justo lo que este instrumento
// vende como su mecanismo de honestidad. Un denominador que se puede engordar
// con anclas que no miran nada es peor que no tenerlo. Se rechaza en el
// registro, no en el veredicto: es un error de uso, no una deuda del arbol.
const invalidas = [];
for (const a of anclas) {
    const tokens = Array.isArray(a.debeNombrar) ? a.debeNombrar : [];
    if (!a.id) invalidas.push(`(sin id) · falta \`id\``);
    else if (!a.fichero) invalidas.push(`${a.id} · falta \`fichero\``);
    else if (tokens.length === 0) invalidas.push(`${a.id} · \`debeNombrar\` vacio`);
    else if (tokens.some(t => typeof t !== 'string' || t.trim() === ''))
        invalidas.push(`${a.id} · \`debeNombrar\` trae un token vacio: casaria con TODAS las lineas`);
    else if (!Number.isInteger(a.veces) || a.veces < 1)
        invalidas.push(`${a.id} · \`veces\` debe ser un entero >= 1, y es ${JSON.stringify(a.veces)}`);
}
if (invalidas.length) {
    process.stderr.write('anclas-censo: el registro tiene anclas invalidas. Sin veredicto.\n');
    for (const l of invalidas) process.stderr.write('  - ' + l + '\n');
    process.exit(2);
}

if (SOLO_CENSO) {
    for (const a of anclas) {
        process.stdout.write([a.id, a.fichero, (a.debeNombrar || []).join(' + '), a.veces].join('\t') + '\n');
    }
    process.exit(0);
}

// --- 2 · medir el hecho, derivar la coordenada -------------------------------
const lineasDe = f => {
    const abs = join(ROOT, f.split('/').join(sep));
    if (!existsSync(abs) || !statSync(abs).isFile()) return null;
    return readFileSync(abs, 'utf8').split(/\r?\n/);
};

const rotas = [];       // el HECHO ya no se sostiene
const derivadas = [];   // el hecho se sostiene, la CITA de un documento vivo no
const medidas = [];

for (const a of anclas) {
    const lineas = lineasDe(a.fichero);
    if (lineas === null) {
        rotas.push({ a, motivo: `el fichero no existe: ${a.fichero}` });
        continue;
    }
    // Una linea cuenta una sola vez aunque lleve varios tokens: lo anclado es
    // «cuantos SITIOS lo nombran», que es el inventario, no cuantas apariciones.
    const coords = [];
    lineas.forEach((linea, i) => {
        if ((a.debeNombrar || []).some(t => linea.includes(t))) coords.push(i + 1);
    });
    medidas.push({ a, coords });

    if (coords.length !== a.veces) {
        rotas.push({
            a, coords,
            motivo: `esperaba ${a.veces} sitio(s) que nombren ${JSON.stringify(a.debeNombrar)}, hay ${coords.length}`
        });
        continue;   // sin el hecho, comparar coordenadas no significa nada
    }

    for (const c of a.citas || []) {
        const m = String(c.dice).match(/^(.*):(\d+)$/);
        if (!m) { derivadas.push({ a, c, motivo: `cita mal formada: ${c.dice}` }); continue; }
        const [, ficheroCitado, lineaCitada] = m;
        if (ficheroCitado !== a.fichero) {
            derivadas.push({ a, c, motivo: `la cita nombra ${ficheroCitado} y el ancla es de ${a.fichero}` });
            continue;
        }

        // ESTA COMPROBACION ES LA QUE HACE REAL EL LAZO, y sin ella el registro
        // no probaria nada: `dice` seria una copia de la medicion, siempre de
        // acuerdo consigo misma, mientras el documento dice otra cosa. Aqui se
        // exige que el documento vivo CONTENGA literalmente esa cita. Si no la
        // contiene, el que miente es el registro.
        const textoDoc = lineasDe(c.doc);
        if (textoDoc === null) {
            rotas.push({ a, motivo: `el documento vivo citado no existe: ${c.doc}` });
            continue;
        }
        if (!textoDoc.some(l => l.includes(c.dice))) {
            rotas.push({
                a,
                motivo: `el registro dice que ${c.doc} cita «${c.dice}», y ese texto NO esta en el documento`
            });
            continue;
        }

        if (!coords.includes(Number(lineaCitada))) {
            derivadas.push({
                a, c,
                motivo: `dice ${c.dice} y hoy el hecho vive en ${coords.map(n => a.fichero + ':' + n).join(', ')}`,
                corregir: `${a.fichero}:${coords[0]}`
            });
        }
    }
}

// --- 3 · salida --------------------------------------------------------------
const p = s => process.stdout.write(s + '\n');
const totalCitas = anclas.reduce((n, a) => n + (a.citas || []).length, 0);
const ficheros = [...new Set(anclas.map(a => a.fichero))];

p('anclas del censo · scripts/anclas-censo.mjs');
p('raiz     : ' + ROOT);
p('registro : plan/ANCLAS.json');
p('');
p('--- DENOMINADOR -----------------------------------------------------------');
p('anclas declaradas          : ' + anclas.length);
p('ficheros cubiertos         : ' + ficheros.length + '   (' + ficheros.join(', ') + ')');
p('citas de documento vivo    : ' + totalCitas);
p('');
p('--- VEREDICTO POR CLASE ---------------------------------------------------');
p('anclas ROTAS   (el hecho cambio)      : ' + rotas.length + '   <-- DEUDA, debe ser 0');
p('citas DERIVADAS (el documento miente) : ' + derivadas.length + '   <-- DEUDA, debe ser 0');
p('');

if (VERBOSE) {
    p('--- ANCLAS MEDIDAS --------------------------------------------------------');
    for (const { a, coords } of medidas) {
        p(`[${a.id}]  ${a.fichero}  x${coords.length}` +
          (coords.length ? '  ->  ' + coords.map(n => ':' + n).join(' ') : '  ->  (ninguna)'));
    }
    p('');
}

if (rotas.length) {
    p('--- ANCLAS ROTAS · el HECHO anclado ya no se sostiene ----------------------');
    for (const r of rotas) {
        p(`${r.a.id}  [${r.motivo}]`);
        p(`     | ${r.a.porque || ''}`.slice(0, 160));
    }
    p('');
}

if (derivadas.length) {
    p('--- CITAS DERIVADAS · el hecho esta, el documento vivo lo situa mal --------');
    p('Estos son documentos VIVOS: se corrigen (PRACTICAS §7). Escribe:');
    for (const d of derivadas) {
        p(`${d.c.doc}  ancla ${d.a.id}  [${d.motivo}]`);
        if (d.corregir) p(`     -> corregir la cita a: ${d.corregir}`);
    }
    p('');
}

for (const l of CEGUERA) p(l);
p('');

const mal = rotas.length + derivadas.length;
p('VEREDICTO: ' + (mal ? 'FAIL' : 'PASS') +
  ' (' + rotas.length + ' rotas + ' + derivadas.length + ' derivadas / ' +
  anclas.length + ' anclas, ' + totalCitas + ' citas)');
process.exit(mal ? 1 : 0);
