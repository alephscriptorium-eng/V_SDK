#!/usr/bin/env node
/**
 * Probe WP-V71 · PARIDAD DE NIVEL 1:1 entre la base y el árbol migrado.
 *
 * Sostiene el CA más importante del WP: «ninguna línea que antes se imprimía
 * queda ahora silenciada». Sin este instrumento esa frase es una inspección;
 * con él es una medida que cualquiera repite.
 *
 * (Existe porque la 1ª contrarrevisión encontró 3 sitios re-nivelados a `warn`
 * contra lo que el reporte declaraba; y viaja en el entregable porque la 2ª
 * señaló que sin él la «medida» era una cita — el revisor tuvo que escribir
 * el suyo para confirmarla.)
 *
 * CÓMO MIDE
 *   Barre **todo** `src/**\/*.ts` — no una lista de ficheros elegida a mano,
 *   que es justo el sesgo que hay que evitar. Para cada fichero saca, EN
 *   ORDEN, la secuencia de niveles efectivos de sus llamadas de log, en la
 *   base y en el árbol actual, y las coteja posición a posición.
 *
 *   El extractor es UNO SOLO y se aplica igual a los dos lados, así que la
 *   comparación es simétrica por construcción: reconoce tanto `console.*`
 *   (sitio sin migrar) como una llamada al canal (sitio migrado), y les asigna
 *   el mismo nivel efectivo. Por eso los 10 sitios del carve-out de V66, que
 *   siguen en `console.*` en ambos lados, cuadran igual que los migrados.
 *
 *   Mapa de equivalencia — el contrato de la migración:
 *       console.log   → info      console.warn  → warn
 *       console.info  → info      console.error → error
 *       console.debug → debug     console.trace → trace
 *
 * Exit 0 si no hay ni un desvío de nivel.
 *
 *   node scripts/probes/v71-paridad-niveles.mjs [ref-base]     (por defecto: main)
 */
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const raiz = process.cwd();
const refBase = process.argv[2] || 'main';

function git(...args) {
    return execFileSync('git', args, { cwd: raiz, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

/** Ficheros `.ts` bajo `src/` en la base y en el árbol actual, unidos. */
function ficheros() {
    const enBase = git('ls-tree', '-r', '--name-only', refBase, 'src')
        .split('\n')
        .filter(f => f.endsWith('.ts'));
    const enArbol = [];
    (function recorrer(dir) {
        for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
            const p = path.join(dir, entrada.name);
            if (entrada.isDirectory()) recorrer(p);
            else if (entrada.name.endsWith('.ts')) enArbol.push(p.replace(/\\/g, '/'));
        }
    })(path.join(raiz, 'src'));
    const rel = enArbol.map(f => path.relative(raiz, f).replace(/\\/g, '/'));
    return [...new Set([...enBase, ...rel])].sort();
}

const NIVEL_DE_CONSOLA = {
    log: 'info',
    info: 'info',
    warn: 'warn',
    error: 'error',
    debug: 'debug',
    trace: 'trace'
};

/**
 * Un único extractor, aplicado igual a la base y al árbol.
 *
 * `console.<m>(`                      → sitio sin migrar
 * `(log|opLog|bootstrapLog).<n>(`     → sitio migrado al canal
 *
 * Se exige que el identificador del canal sea exactamente uno de esos tres,
 * para no arrastrar los `this.logger.*` preexistentes del `LoggingManager`
 * (que no son obra de este WP). `\blog\.` no casa dentro de `logger.`.
 */
const LLAMADA = /(?:\bconsole\.(log|info|warn|error|debug|trace)\s*\(|(?:^|[^.\w])(?:log|opLog|bootstrapLog)\.(info|warn|error|debug|trace)\s*\()/g;

function niveles(fuente) {
    const salida = [];
    for (const m of fuente.matchAll(LLAMADA)) {
        salida.push(m[1] ? NIVEL_DE_CONSOLA[m[1]] : m[2]);
    }
    return salida;
}

function versionBase(fichero) {
    try {
        // stdio: el fichero puede no existir en la base (es nuevo del WP) y
        // git lo grita por stderr; aquí eso es normal, no un fallo.
        return execFileSync('git', ['show', `${refBase}:${fichero}`], {
            cwd: raiz,
            encoding: 'utf8',
            maxBuffer: 64 * 1024 * 1024,
            stdio: ['ignore', 'pipe', 'ignore']
        });
    } catch {
        return ''; // no existía en la base (fichero nuevo del WP)
    }
}

function versionArbol(fichero) {
    const p = path.join(raiz, fichero);
    return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
}

let totalBase = 0;
let totalArbol = 0;
const desvios = [];
const filas = [];

for (const f of ficheros()) {
    const b = niveles(versionBase(f));
    const a = niveles(versionArbol(f));
    totalBase += b.length;
    totalArbol += a.length;
    if (b.length === 0 && a.length === 0) continue;

    let estado = 'OK ';
    if (b.length !== a.length) {
        estado = 'DIF';
        desvios.push(`${f} · conteo base=${b.length} árbol=${a.length}`);
    } else {
        for (let i = 0; i < b.length; i++) {
            if (b[i] !== a[i]) {
                estado = 'DIF';
                desvios.push(`${f} · llamada #${i + 1}: base=${b[i]} árbol=${a[i]}`);
            }
        }
    }
    filas.push(`${estado} ${f.padEnd(46)} base=${String(b.length).padStart(3)} árbol=${String(a.length).padStart(3)}`);
}

process.stdout.write(`PARIDAD DE NIVEL · base=${refBase} · todo src/**/*.ts\n\n`);
for (const fila of filas) process.stdout.write(`  ${fila}\n`);
process.stdout.write(`\n  TOTAL base=${totalBase}  árbol=${totalArbol}\n`);
process.stdout.write(
    '\n  Nota de cuadre: este barrido es TEXTUAL, así que cuenta también las 3\n' +
        '  apariciones que viven dentro de literales de cadena y no son llamadas\n' +
        '  (src/core/aiAssistantService.ts ×1 · src/socketMonitor.ts ×2). De ahí\n' +
        `  ${totalBase} = 105 llamadas reales del Extension Host + 3 en literal. Se cuentan\n` +
        '  igual en los dos lados, así que la paridad no se ve afectada.\n'
);
process.stdout.write(`\nDESVÍOS DE NIVEL: ${desvios.length}\n`);
for (const d of desvios) process.stdout.write(`  ${d}\n`);

const cuadra = totalBase === totalArbol && desvios.length === 0;
process.stdout.write(`\n${cuadra ? 'PASS' : 'FAIL'} · ninguna línea cambió de nivel en la migración\n`);
process.exit(cuadra ? 0 : 1);
