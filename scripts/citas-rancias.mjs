#!/usr/bin/env node
// =============================================================================
// scripts/citas-rancias.mjs · el barrido de citas `ruta:linea` — WP-V92 / V99
// =============================================================================
//
// MOTIVO
//   Un reporte de este mundo cita el arbol constantemente: `src/x.ts:120`,
//   `package.json:1446`, `plan/BACKLOG.md:153`. Cada una de esas citas es una
//   afirmacion comprobable, y todas caducan solas: nadie las toca y un dia
//   dejan de apuntar a donde apuntaban. Este barrido las extrae todas, las
//   resuelve contra el arbol, y para las que no resuelven decide CON GIT —no a
//   ojo— si la cita nacio muerta (acta) o si se pudrio (deuda).
//
//   WP-V92 lo escribio y midio 1518 citas / 27 rancias. Pero su ALCANCE_DIFF le
//   prohibia `scripts/`, asi que el instrumento quedo EMBEBIDO LITERAL dentro de
//   `plan/REPORTES/WP-V92-citas-rancias.md` §1.4. Un gate que hay que copiar y
//   pegar para ejecutar no lo ejecuta nadie, no se versiona, no se testea y no
//   entra en CI. WP-V99 le da casa, tests y censo de mutacion. La logica de
//   clasificacion es la de V92, verificada: reproduce su veredicto (§ REPRODUCE).
//
// USO
//   node scripts/citas-rancias.mjs                    los reportes (por defecto)
//   node scripts/citas-rancias.mjs --ambito plan      los documentos vivos de plan/
//   node scripts/citas-rancias.mjs --verbose          detalle de cada cita que no resuelve
//   node scripts/citas-rancias.mjs --json-out f.json  vuelca las rancias a JSON
//   node scripts/citas-rancias.mjs --raiz <dir>       barre OTRO arbol (lo usan los tests)
//   node scripts/citas-rancias.mjs --reglas           censo de reglas, una por linea
//   node scripts/citas-rancias.mjs --help
//
//   Se admiten tambien las variables de entorno con que se invocaba en V92
//   (`AMBITO`, `VERBOSE`, `JSON_OUT`); las banderas mandan sobre ellas.
//
// LA IDEA: GIT DECIDE, NO YO
//   Una cita que no resuelve puede ser dos cosas muy distintas, y confundirlas
//   es lo que hace inutil a un barrido de este tipo:
//
//     (a) el fichero YA NO EXISTE
//         muere(fichero) <= nace(reporte)  -> ACTA   (el que escribia lo sabia)
//         muere(fichero) >  nace(reporte)  -> RANCIA (era cierta y caduco)
//
//     (b) el fichero SIGUE VIVO y no cuadra la LINEA
//         linea_citada >  lineas_en(nace(reporte))  -> ACTA   (ya no cabia)
//         linea_citada <= lineas_en(nace(reporte))  -> RANCIA (cabia y dejo de caber)
//
//   Sin (b) el barrido denuncia al reporte que DOCUMENTA una cita rota por el
//   mero hecho de mencionarla, y entonces hay que mentir para pasarlo.
//
// LO QUE UN VERDE DE AQUI **NO** SIGNIFICA — LA CEGUERA IRREDUCIBLE
//   Este barrido comprueba que una cita APUNTA A ALGO QUE EXISTE. No comprueba
//   que diga la verdad. Son cosas distintas y la diferencia tiene un caso con
//   nombre y ruta, RE-MEDIDO el 2026-08-02:
//
//     `plan/REPORTES/WP-V90-jest-determinista.md:357` dice
//         «...y con el encargo (`plan/BACKLOG.md:153`, que nombra `duration < 100 ms`)»
//
//     `plan/BACKLOG.md` tiene hoy 217 lineas, luego `:153` RESUELVE y este
//     barrido la da por buena. Pero la linea 153 de hoy es
//         «| WP | brief | CA tentativo |»
//     —la cabecera de una tabla—, que no nombra ningun `duration < 100 ms`.
//
//     La cita es verificable, PASA la verificacion, y es FALSA.
//
//   Corolario operativo: `RANCIA = 0` garantiza que ninguna cita apunta al
//   vacio, NUNCA que todas digan la verdad. Cerrar esa clase exige comparar el
//   CONTENIDO citado, no su existencia —un ancla de texto guardada junto a cada
//   cita—. No esta hecho, y por eso el instrumento lo dice en cada corrida en
//   vez de dejarlo escrito en un acta que nadie abre.
//
// EL DENOMINADOR NO ES OPCIONAL
//   Sale siempre, y desglosado en TRES cosas distintas: cuantas miro, cuantas
//   fallaron, y cuantas NO PUDO MIRAR con su clase. La razon es historica y esta
//   medida: la segunda ceguera de V92 —los ficheros de la raiz se citan sin
//   barra, y el patron exigia al menos un directorio— dejaba 367 citas FUERA del
//   denominador sin decirlo, y con ellas 5 rancias. Un denominador silencioso da
//   un PASS que no significa nada. Aqui el reparto por origen va en la salida:
//   si la rama de la raiz vuelve a romperse, su contador cae a 0 A LA VISTA.
//
// LAS TRES CEGUERAS QUE V92 SE CENSO A SI MISMO (hoy, cada una con test rojo)
//   1. `js` casando antes que `json` en la alternancia -> 10 falsos positivos.
//   2. los ficheros de raiz fuera del denominador -> 367 citas sin mirar, 5 rancias.
//   3. el prefijo de mundo (z:`plan/BACKLOG.md:248`) -> 12 falsos positivos; estuvo
//      a punto de enrutar un defecto inexistente.
//   Un instrumento que arreglo un bug sin dejar el test no ha arreglado nada:
//   las tres tienen caso rojo en `scripts/tests/citas-rancias.test.ts`, cada uno
//   anclado a un MUTANTE que desactiva la correccion y exige que el test caiga.
//
// CODIGOS DE SALIDA
//   0   cero RANCIA
//   1   hay RANCIA: deuda, con la lista
//   2   error de uso, ambito inexistente, o el CUADRE del denominador no cierra
//       (miradas + no-miradas != extraidas). Un instrumento cuyo propio recuento
//       no cuadra no puede emitir veredicto: calla y sale 2.
//
// QUIEN VIGILA A ESTE VIGILANTE
//   `scripts/tests/citas-rancias.test.ts`, con `npm test`. Cada REGLA de las que
//   lista `--reglas` tiene mutacion registrada, y hay un test que compara las dos
//   listas: una regla nueva sin mutacion pone la suite roja.
// =============================================================================

import { readFileSync, readdirSync, existsSync, statSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// --- censo de reglas ---------------------------------------------------------
//
// Esta lista NO es documentacion: es el contrato con la suite. `--reglas` la
// imprime, y `scripts/tests/citas-rancias.test.ts` exige que cada id tenga una
// mutacion registrada. Anadir una regla sin su caso rojo pone la suite roja.
const REGLAS = [
    ['R1', 'orden-extensiones', 'las extensiones se alternan de mas larga a mas corta: `json` antes que `js` (ceguera 1)'],
    ['R2', 'ficheros-de-raiz', 'los ficheros sin barra (package.json, jest.config.js) entran al denominador (ceguera 2)'],
    ['R3', 'prefijo-de-mundo', 'z:`ruta` es de OTRO repo: NO-MIRADA, jamas RANCIA (ceguera 3)'],
    ['R4', 'topdir-conocido', 'una ruta cuyo primer segmento no es directorio de este arbol es NO-MIRADA'],
    ['R5', 'bloque-de-codigo', 'una cita dentro de ``` es TRANSCRIP: evidencia grabada, se lee en pasado'],
    ['R6', 'marca-de-caducidad', 'una linea que ya declara su caducidad es ANOTADA, no deuda'],
    ['R7', 'nunca-existio', 'un fichero que jamas estuvo en el arbol es EFIMERA: sonda, vector o propuesta'],
    ['R8', 'acta-por-borrado', 'si el fichero murio ANTES de nacer el reporte, es ACTA'],
    ['R9', 'acta-por-deriva', 'si la linea ya no cabia el dia que se escribio el reporte, es ACTA'],
    ['R10', 'rancia-es-deuda', 'lo que valia al nacer el reporte y hoy no es RANCIA, y RANCIA sale 1'],
    ['R11', 'nace-en-head', 'un reporte aun sin commitear nace en HEAD: no se denuncia a si mismo'],
    ['R12', 'denominador-en-la-salida', 'el denominador y las NO-MIRADAS salen SIEMPRE, no bajo bandera'],
    ['R13', 'ceguera-declarada', 'la clase irreducible sale en CADA corrida, con su caso con nombre'],
    ['R14', 'cuadre-del-denominador', 'miradas + no-miradas debe dar las extraidas; si no cuadra, exit 2 sin veredicto']
];

const CEGUERA = [
    '--- LO QUE ESTE VEREDICTO NO SIGNIFICA (ceguera irreducible) ---------------',
    'Esto comprueba que una cita APUNTA A ALGO QUE EXISTE. No que diga la verdad.',
    'Caso con nombre y ruta, de este mismo repo:',
    '    plan/REPORTES/WP-V90-jest-determinista.md:357 cita plan/BACKLOG.md:153',
    '    «que nombra `duration < 100 ms`». El fichero tiene 217 lineas, asi que',
    '    :153 RESUELVE y este barrido la da por buena — pero hoy esa linea es la',
    '    cabecera de una tabla y no nombra ningun `duration < 100 ms`.',
    '    Verificable, pasa la verificacion, y falsa.',
    'Cerrarla exige comparar el CONTENIDO citado (un ancla de texto por cita).',
    'NO ESTA HECHO. RANCIA=0 significa «ninguna apunta al vacio», nunca «todas',
    'dicen la verdad».'
];

// --- argumentos --------------------------------------------------------------
const argv = process.argv.slice(2);

function sacarBandera(nombre) {
    const i = argv.indexOf(nombre);
    if (i < 0) return false;
    argv.splice(i, 1);
    return true;
}

function sacarValor(nombre, pordefecto) {
    const i = argv.indexOf(nombre);
    if (i < 0) return pordefecto;
    const v = argv[i + 1];
    if (v === undefined || String(v).startsWith('--')) {
        process.stderr.write('citas-rancias: ' + nombre + ' necesita un valor\n');
        process.exit(2);
    }
    argv.splice(i, 2);
    return v;
}

const AYUDA = [
    'uso:',
    '  node scripts/citas-rancias.mjs [--ambito <dir>] [--raiz <dir>] [--verbose] [--json-out <f>]',
    '  node scripts/citas-rancias.mjs --reglas     censo de reglas (una por linea, id<TAB>nombre<TAB>que hace)',
    '',
    'Extrae toda cita `ruta[:linea]` de los .md del ambito, la resuelve contra el',
    'arbol y clasifica las que no resuelven preguntando a git —no a ojo— si la cita',
    'nacio muerta (ACTA) o se pudrio (RANCIA). Solo RANCIA es deuda: sale 1.',
    '',
    'salidas: 0 sin rancias · 1 con rancias · 2 uso, ambito inexistente o cuadre roto',
    ''
].concat(CEGUERA).join('\n') + '\n';

if (sacarBandera('--help') || sacarBandera('-h')) {
    process.stdout.write(AYUDA);
    process.exit(0);
}

if (sacarBandera('--reglas')) {
    for (const [id, nombre, que] of REGLAS) process.stdout.write(id + '\t' + nombre + '\t' + que + '\n');
    process.exit(0);
}

// Por defecto la raiz es la del REPO —el padre de `scripts/`—, no `process.cwd()`:
// un gate que cambia de objeto segun desde donde lo invoques no es un gate.
const RAIZ_REPO = resolve(fileURLToPath(new URL('..', import.meta.url)));
const ROOT = resolve(sacarValor('--raiz', argv[0] && !argv[0].startsWith('--') ? argv.shift() : RAIZ_REPO));
const AMBITO = String(sacarValor('--ambito', process.env.AMBITO ?? 'plan/REPORTES')).replace(/[\\/]+$/, '');
const VERBOSE = sacarBandera('--verbose') || Boolean(process.env.VERBOSE);
const JSON_OUT = sacarValor('--json-out', process.env.JSON_OUT ?? '');

if (argv.length) {
    process.stderr.write('citas-rancias: argumento no reconocido: ' + argv[0] + '\n\n' + AYUDA);
    process.exit(2);
}

const DIR_AMBITO = join(ROOT, ...AMBITO.split('/'));
if (!existsSync(DIR_AMBITO) || !statSync(DIR_AMBITO).isDirectory()) {
    process.stderr.write('citas-rancias: el ambito no existe o no es un directorio: ' + DIR_AMBITO + '\n');
    process.exit(2);
}

// --- 1 · que cuenta como cita a este repo ------------------------------------
const TOPDIRS = ['src', 'tests', 'scripts', 'plan', 'docs', 'fixtures',
                 'media', 'schemas', 'sincronia', '.github'];

// REGLA R1 · CEGUERA 1, MEDIDA: `js` antes que `json` hace que `fixtures/x.json`
// case como `fixtures/x.js` y salga «fichero inexistente». Costo: 10 falsos
// positivos. La alternancia va de MAS LARGA A MAS CORTA y no es cosmetica.
const EXT = 'jsonc|json|tsx|yaml|snap|vsix|html|yml|mjs|cjs|css|log|txt|ts|js|md';

// REGLA R2 · CEGUERA 2, LA GRAVE: los ficheros de la raiz se citan SIN BARRA
// (`package.json:1446`, `jest.config.js:12`, `.vscodeignore:28`) y el patron
// exigia al menos un directorio, asi que no los miraba NI UNO. Eran 367 citas
// fuera del denominador y 5 rancias escondidas. Un denominador que miente por
// defecto es peor que no tener barrido: da un PASS que no significa nada.
const FICHEROS_RAIZ = readdirSync(ROOT, { withFileTypes: true })
    .filter(d => d.isFile()).map(d => d.name)
    .sort((a, b) => b.length - a.length)                       // mas larga primero
    .map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

const RE = new RegExp(
    `(?<![\\w./-])((?:\\.?/)?(?:[\\w.@-]+/)+[\\w.@-]+\\.(?:${EXT})|${FICHEROS_RAIZ.join('|')})` +
    `(?::(\\d+(?:[-,]\\d+)*))?`, 'g');

// --- 2 · preguntas a git -----------------------------------------------------
const git = (...a) => {
    try { return execFileSync('git', ['-C', ROOT, ...a], { encoding: 'utf8' }).trim(); }
    catch { return ''; }
};
const memo = (fn, c = new Map()) => k => (c.has(k) || c.set(k, fn(k)), c.get(k));

const muere = memo(p => git('log', '--diff-filter=D', '-1', '--format=%H', '--', p));
const existio = memo(p => git('log', '--all', '-1', '--format=%H', '--', p) !== '');

// REGLA R11 · un reporte aun sin commitear se esta escribiendo AHORA: nace en
// HEAD. Sin este respaldo, el reporte que documenta una poda se denuncia a si
// mismo por citarla, y hay que mentir para pasar el gate.
const nace = memo(f => git('log', '--diff-filter=A', '-1', '--format=%H', '--', AMBITO + '/' + f)
                       || git('rev-parse', 'HEAD'));

// cuantas lineas tenia <ruta> en <commit> (-1 si no se puede saber)
const lineasEn = memo(k => {
    const i = k.indexOf('\0');
    const t = git('show', `${k.slice(0, i)}:${k.slice(i + 1)}`);
    return t ? t.split('\n').length : -1;
});

const esAncestro = (a, b) => {
    if (!a || !b) return false;
    if (a === b) return true;
    try { execFileSync('git', ['-C', ROOT, 'merge-base', '--is-ancestor', a, b], { stdio: 'ignore' }); return true; }
    catch { return false; }
};

// --- 3 · barrido -------------------------------------------------------------
const informes = readdirSync(DIR_AMBITO).filter(f => f.endsWith('.md')).sort();
const nLineas = memo(abs => { try { return readFileSync(abs, 'utf8').split('\n').length; } catch { return -1; } });

// REGLA R6 · una cita que YA declara su caducidad en la misma linea no es deuda:
// esta anotada, y volver a denunciarla convierte la correccion en ruido.
const MARCA = /FICHERO BORRADO|fichero borrado|⛔|ya no existe|CADUCADA|BORRADO ENTERO/i;

const B = {
    total: 0,           // DENOMINADOR
    conDirectorio: 0,   // origen: la rama `dir/fichero.ext` del patron
    deLaRaiz: 0,        // origen: la rama de FICHEROS_RAIZ (R2)
    ok: 0,
    noResuelve: 0,
    otroMundo: 0,       // NO MIRADA: R3
    fueraDelArbol: 0    // NO MIRADA: R4
};
const noOk = [];

for (const inf of informes) {
    let enBloque = false;
    readFileSync(join(DIR_AMBITO, inf), 'utf8').split(/\r?\n/).forEach((linea, i) => {
        // REGLA R5 · dentro de un bloque de codigo la cita es la SALIDA LITERAL de
        // una orden que se ejecuto ese dia. Reescribirla seria falsificar la prueba.
        if (/^\s*(```|~~~)/.test(linea)) { enBloque = !enBloque; return; }
        for (const m of linea.matchAll(RE)) {
            const ruta = m[1].replace(/^\.\//, ''), spec = m[2];
            B.total++;
            if (ruta.includes('/')) B.conDirectorio++; else B.deLaRaiz++;

            // REGLA R3 · CEGUERA 3: z:`plan/BACKLOG.md:248` es el BACKLOG **de Z**,
            // no el mio. Sin esto, las 12 citas del LEXICO salian rancias por
            // comprobarlas contra el arbol equivocado. Fue el falso positivo mas
            // caro: estuvo a punto de enrutarse como hallazgo un defecto inexistente.
            const ajenaPorMundo = /\b[a-z]{1,3}:`?$/.test(linea.slice(0, m.index));
            if (ajenaPorMundo) { B.otroMundo++; continue; }
            // REGLA R4 · primer segmento desconocido: node_modules/, out/, rutas de
            // ejemplo. No son de este arbol; comprobarlas aqui no significa nada.
            if (ruta.includes('/') && !TOPDIRS.includes(ruta.split('/')[0])) { B.fueraDelArbol++; continue; }

            const abs = join(ROOT, ruta.split('/').join(sep));
            const hay = existsSync(abs) && statSync(abs).isFile();
            let motivo = null;
            if (!hay) motivo = 'fichero inexistente';
            else if (spec) {
                const max = nLineas(abs), fuera = spec.split(/[-,]/).map(Number).filter(n => n > max);
                if (fuera.length) motivo = `linea ${fuera.join(',')} > ${max} lineas`;
            }
            if (!motivo) { B.ok++; continue; }
            B.noResuelve++;
            noOk.push({
                inf, ln: i + 1, cita: ruta + (spec ? ':' + spec : ''), ruta, motivo, hay,
                maxCitada: spec ? Math.max(...spec.split(/[-,]/).map(Number)) : 0,
                txt: linea.trim(), enBloque, marcada: MARCA.test(linea)
            });
        }
    });
}

// --- 4 · dictamen automatico por git -----------------------------------------
for (const c of noOk) {
    c.mata = muere(c.ruta).slice(0, 7);
    if (c.enBloque) c.clase = 'TRANSCRIP';                    // R5 · evidencia grabada
    else if (c.marcada) c.clase = 'ANOTADA';                  // R6 · ya declara que caduco
    // REGLA R7 · nunca estuvo en el arbol: sonda, vector de prueba o propuesta.
    else if (!existio(c.ruta)) c.clase = 'EFIMERA';
    else if (c.hay) {
        // REGLA R9 · el fichero SIGUE vivo: lo que no resuelve es la COORDENADA.
        // Mismo principio, aplicado a la deriva de linea: ¿valia el dia que se
        // escribio? Sin esta rama, un reporte que DOCUMENTA una cita rota se
        // denuncia a si mismo por mencionarla.
        const max0 = lineasEn(nace(c.inf) + '\0' + c.ruta);
        c.clase = (max0 > 0 && c.maxCitada > max0) ? 'ACTA' : 'RANCIA';
    }
    // REGLA R8 · el fichero ya no estaba cuando se escribio el reporte: acta.
    else if (esAncestro(muere(c.ruta), nace(c.inf))) c.clase = 'ACTA';
    // REGLA R10 · era cierta y caduco sin que nadie la tocara: DEUDA.
    else c.clase = 'RANCIA';
}

// --- 5 · salida --------------------------------------------------------------
const n = k => noOk.filter(c => c.clase === k).length;
const rancias = noOk.filter(c => c.clase === 'RANCIA');
const noMiradas = B.otroMundo + B.fueraDelArbol;
const p = s => process.stdout.write(s + '\n');

p('barrido de citas rancias · scripts/citas-rancias.mjs');
p('raiz                : ' + ROOT);
p('ambito              : ' + AMBITO);
p('documentos barridos : ' + informes.length);
p('');
p('--- ALCANCE DEL EXTRACTOR (que forma de cita sabe ver) ---------------------');
p('extensiones            : ' + EXT.split('|').join(','));
p('directorios de 1er niv : ' + TOPDIRS.join(','));
p('ficheros de la raiz    : ' + FICHEROS_RAIZ.length);
p('');
// REGLA R12 · el denominador y las NO-MIRADAS salen SIEMPRE. No hay bandera que
// los apague, y esto no es estilo: la ceguera 2 existio porque el denominador
// era silencioso. Un PASS sin denominador no se puede leer.
p('--- DENOMINADOR -----------------------------------------------------------');
p('citas ruta[:linea] extraidas : ' + B.total);
p('  con directorio             : ' + B.conDirectorio);
p('  de la raiz del repo        : ' + B.deLaRaiz + '   <-- ceguera 2: si esto cae a 0, el denominador miente');
p('');
p('--- MIRADAS ---------------------------------------------------------------');
p('resuelven contra el arbol    : ' + B.ok);
p('NO resuelven                 : ' + B.noResuelve);
p('  TRANSCRIP (en bloque cod)  : ' + n('TRANSCRIP') + '   evidencia grabada; se lee en pasado');
p('  ANOTADA  (marca en linea)  : ' + n('ANOTADA') + '   la propia linea ya declara su caducidad');
p('  EFIMERA  (nunca existio)   : ' + n('EFIMERA') + '   sonda / vector / propuesta');
p('  ACTA     (ya no valia)     : ' + n('ACTA') + '   el que escribia ya lo sabia');
p('  RANCIA   (valia y caduco)  : ' + n('RANCIA') + '   <-- DEUDA, debe ser 0');
p('');
p('--- NO MIRADAS (extraidas, NO verificables aqui) ---------------------------');
p('total no miradas             : ' + noMiradas);
p('  OTRO-MUNDO      (z:`...`)  : ' + B.otroMundo + '   otro repo; comprobarlas aqui da falso positivo');
p('  FUERA-DEL-ARBOL (1er seg.) : ' + B.fueraDelArbol + '   node_modules/, out/, rutas de ejemplo');
p('');

// REGLA R14 · el cuadre. Un instrumento cuyo propio recuento no cierra no puede
// emitir veredicto: es exactamente el modo de fallo de la ceguera 2 —citas que
// se pierden por el camino sin que nadie lo note—, y aqui se convierte en ruido
// audible. Si no cuadra: exit 2, sin PASS y sin FAIL.
const cuadra = B.ok + B.noResuelve + noMiradas === B.total && B.conDirectorio + B.deLaRaiz === B.total;
p('cuadre: miradas(' + (B.ok + B.noResuelve) + ') + no-miradas(' + noMiradas + ') = ' + B.total +
  '   |   por origen: ' + B.conDirectorio + ' + ' + B.deLaRaiz + ' = ' + B.total +
  '   ' + (cuadra ? 'OK' : 'ROTO'));

if (B.total > 0 && B.deLaRaiz === 0 && FICHEROS_RAIZ.length > 0) {
    p('AVISO: ni una sola cita a los ' + FICHEROS_RAIZ.length + ' ficheros de la raiz. O no las hay,');
    p('       o la ceguera 2 ha vuelto y el denominador esta mintiendo otra vez.');
}
p('');

// REGLA R13 · la ceguera irreducible se declara EN CADA CORRIDA, no en un acta.
// Quien lee el veredicto tiene que leer a la vez lo que el veredicto no cubre.
for (const l of CEGUERA) p(l);
p('');

if (VERBOSE) {
    for (const k of ['RANCIA', 'ACTA', 'EFIMERA', 'ANOTADA', 'TRANSCRIP']) {
        for (const c of noOk.filter(x => x.clase === k)) {
            p(`[${k.padEnd(9)}] ${c.inf}:${c.ln}  ${c.cita}  (mata:${c.mata || '-'})`);
            p(`            | ${c.txt.slice(0, 130)}`);
        }
    }
    p('');
}

if (rancias.length) {
    p('--- RANCIAS SIN ANOTAR (anadir la marca ⛔ junto a la cita) ---');
    for (const c of rancias) {
        p(`${c.inf}:${c.ln}  ${c.cita}  [${c.motivo}]`);
        p(`     | ${c.txt.slice(0, 140)}`);
    }
    p('');
}

if (JSON_OUT) {
    writeFileSync(JSON_OUT, JSON.stringify(rancias.map(c => ({ inf: c.inf, ln: c.ln, cita: c.cita })), null, 1));
}

if (!cuadra) {
    process.stderr.write(
        'citas-rancias: CUADRE ROTO — el recuento propio del barrido no cierra.\n' +
        '  extraidas=' + B.total + ' ok=' + B.ok + ' noResuelve=' + B.noResuelve +
        ' noMiradas=' + noMiradas + ' conDirectorio=' + B.conDirectorio + ' deLaRaiz=' + B.deLaRaiz + '\n' +
        '  Se pierden citas por el camino. NO se emite veredicto: un PASS sobre un\n' +
        '  denominador que no cuadra es justo el fallo que este instrumento vigila.\n');
    process.exit(2);
}

p('VEREDICTO: ' + (rancias.length ? 'FAIL' : 'PASS') + ' (' + rancias.length + ' rancias / ' + B.total + ' citas)');
process.exit(rancias.length ? 1 : 0);
