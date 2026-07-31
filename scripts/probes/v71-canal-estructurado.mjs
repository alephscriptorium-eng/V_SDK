#!/usr/bin/env node
/**
 * Probe WP-V71 · OutputChannel + log estructurado
 *
 * Qué demuestra, contra el código VIVO y no contra un espejo:
 *  - el canal produce líneas con nivel, marca de tiempo UTC, origen y
 *    correlación (sesión · secuencia · operación);
 *  - la cabecera de sesión lleva el contexto que hace falta para diagnosticar
 *    en una máquina ajena (versión, VS Code, plataforma);
 *  - ningún secreto llega al canal (CA4), ni desde los datos ni desde el
 *    mensaje ni desde una línea de comando;
 *  - nada se escapa por `console` (se vigilan los tres métodos durante la
 *    corrida entera).
 *
 * La salida que imprime es literalmente el contenido del OutputChannel.
 *
 * Exit 0 si todas las aserciones pasan.
 *
 *   node scripts/probes/v71-canal-estructurado.mjs
 */
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import * as esbuild from 'esbuild';

const raiz = process.cwd();
const salida = path.join(raiz, 'out', 'probe', 'v71-canal.cjs');
const stub = path.join(raiz, 'scripts', 'probes', 'v71-vscode-stub.mjs');
const guion = path.join(raiz, 'scripts', 'probes', 'v71-driver.ts');

fs.mkdirSync(path.dirname(salida), { recursive: true });

// El bundle sustituye `vscode` por el doble mínimo; TODO lo demás es el
// código real del árbol. Se usa la API de esbuild (no el binario) para no
// depender del shell: en Windows `spawnSync npx.cmd` da EINVAL.
await esbuild.build({
    entryPoints: [guion],
    bundle: true,
    // CJS y no ESM: `src/processManager.ts` hace `require('fs')` dentro de
    // `getShellPath()`; en un bundle ESM eso muere con «Dynamic require», y la
    // probe estaría midiendo su propio arnés en vez del código vivo.
    format: 'cjs',
    platform: 'node',
    alias: { vscode: stub },
    outfile: salida,
    logLevel: 'warning'
});

const { conducir } = await import(pathToFileURL(salida).href);
const { canal } = await import(pathToFileURL(stub).href);

// Vigilancia: durante toda la corrida, nada puede salir por consola.
const fugas = [];
const originales = { log: console.log, warn: console.warn, error: console.error };
for (const metodo of ['log', 'warn', 'error']) {
    console[metodo] = (...args) => fugas.push([metodo, args.map(String).join(' ')]);
}
try {
    await conducir();
} finally {
    Object.assign(console, originales);
}

let fallos = 0;
function comprobar(condicion, mensaje) {
    if (!condicion) {
        fallos++;
        process.stdout.write(`  FALLO · ${mensaje}\n`);
    } else {
        process.stdout.write(`  ok    · ${mensaje}\n`);
    }
}

const texto = canal.join('\n');
const lineas = canal.filter(l => l.startsWith('['));

process.stdout.write('\n════════ SALIDA REAL DEL CANAL «Aleph-0» ════════\n');
process.stdout.write(texto + '\n');
process.stdout.write('═════════════════════════════════════════════════\n\n');

process.stdout.write('ASERCIONES\n');

// --- Cabecera: contexto de la máquina ajena --------------------------------
comprobar(/Aleph-0 · diagnóstico · sesión [0-9a-f]{8}/.test(texto), 'cabecera con id de sesión');
comprobar(/extensión\s+scriptorium\.aleph-0/.test(texto), 'cabecera declara la extensión y su versión');
comprobar(/vs code\s+\S+/.test(texto), 'cabecera declara la versión de VS Code');
comprobar(/plataforma\s+\S+\s+\S+ · node/.test(texto), 'cabecera declara plataforma y node');

// --- Forma de la línea ------------------------------------------------------
const FORMA = /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[(ERROR|WARN |INFO |DEBUG|TRACE)\] \[[^\]]+\] \[s=[0-9a-f]{8} #\d+( op=[^\]]+)?\]/;
comprobar(lineas.length > 0, `el canal recibió ${lineas.length} líneas de log`);
comprobar(
    lineas.length > 0 && lineas.every(l => FORMA.test(l)),
    'TODAS las líneas cumplen la forma [ts UTC] [nivel] [origen] [correlación]'
);
comprobar(
    lineas.length > 0 && lineas.every(l => !l.slice(1).includes('\n')),
    'una línea de log es siempre UNA línea'
);

// --- Correlación ------------------------------------------------------------
const seqs = lineas.map(l => Number(l.match(/#(\d+)/)[1]));
comprobar(
    seqs.length > 0 && seqs.every((n, i) => i === 0 || n === seqs[i - 1] + 1),
    'la secuencia es monótona y sin huecos'
);
const sesiones = new Set(lineas.map(l => l.match(/s=([0-9a-f]{8})/)[1]));
comprobar(sesiones.size === 1, 'todas las líneas comparten el id de sesión');
const ops = new Set(lineas.map(l => (l.match(/op=([^\]]+)/) || [])[1]).filter(Boolean));
comprobar(ops.size >= 2, `hay ≥2 operaciones distintas correlacionadas (${[...ops].join(', ')})`);

// --- Origen -----------------------------------------------------------------
for (const origen of ['ProcessManager', 'ManagerFactory', 'AracneBot', 'AlephScriptClient', 'extension']) {
    comprobar(texto.includes(`[${origen}]`), `el origen «${origen}» aparece como emisor`);
}

// --- CA4 · nada de secretos -------------------------------------------------
for (const secreto of [
    'sk-live-NO-DEBE-APARECER',
    'CONTRASENA',
    'abc123',
    'eyJhbGciOiJIUzI1NiJ9'
]) {
    comprobar(!texto.includes(secreto), `el secreto «${secreto}» NO llega al canal`);
}
comprobar(texto.includes('«redactado»'), 'los huecos tapados se ven como «redactado»');
comprobar(texto.includes('ada@lovelace.dev'), 'lo que NO es secreto sobrevive (author, para no cegar el diagnóstico)');

// --- Diagnóstico en remoto --------------------------------------------------
comprobar(texto.includes('ECONNREFUSED'), 'el mensaje del error llega');
comprobar(/"stack":"Error: ECONNREFUSED/.test(texto), 'la PILA del error llega (sin ella no se diagnostica en remoto)');

// --- Sin fugas por consola --------------------------------------------------
comprobar(fugas.length === 0, `cero escrituras por console durante la corrida (observadas: ${fugas.length})`);

process.stdout.write(`\n${fallos === 0 ? 'PASS' : `FAIL (${fallos})`} · probe WP-V71\n`);
process.exit(fallos === 0 ? 0 : 1);
