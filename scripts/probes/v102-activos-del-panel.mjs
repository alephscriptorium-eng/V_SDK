/**
 * WP-V102 · Verificación de los negativos: se DESACTIVA cada guardián y se
 * comprueba que enrojece, y que enrojece POR SU MOTIVO.
 *
 * Un test verde no dice nada hasta que se ha visto rojo por la causa que dice
 * vigilar. Cada mutación de aquí reintroduce un defecto concreto —el histórico
 * cuando existe— y se anota qué prueba cae.
 *
 * DOS PRECAUCIONES, LAS DOS APRENDIDAS DE UN FALSO VERDE
 *
 * 1) LAS RUTAS SE DERIVAN DE `import.meta.url`, NUNCA DE `process.cwd()` NI DE
 *    UN ARGUMENTO POSIX. En WP-V100 el script recibía `/c/S_LAB/…`, Windows lo
 *    resolvía como `C:\c\S_LAB\…`, las mutaciones NO SE APLICABAN y los cuatro
 *    casos salían verdes: un verde que sólo decía que no se había tocado nada.
 * 2) SI EL PATRÓN NO ESTÁ, SE ABORTA CON CÓDIGO 3. Una mutación que no muerde
 *    tiene que ser un error ruidoso, no un caso que pasa.
 *
 * Uso:  node scripts/probes/v102-activos-del-panel.mjs
 */

import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

const PANEL = join(RAIZ, 'src', 'views', 'HackerConfigPanelProvider.ts');
const TIPOS = join(RAIZ, 'src', 'mcpTypes.ts');
// Con barras NORMALES a proposito: jest trata el argumento como una expresion
// regular, y `tests\unit\...` de Windows no casa con nada.
const TEST = 'tests/unit/views/hackerConfigPanelActivos.test.ts';
const JEST = join(RAIZ, 'node_modules', 'jest', 'bin', 'jest.js');

/**
 * Los fuentes de este repositorio estan en CRLF. Los patrones se escriben con
 * `\n` porque es lo legible; aqui se traducen al fin de linea REAL del fichero.
 * Sin esto, ningun patron multilinea casa y todas las mutaciones abortarian con
 * 3 — ruidoso, que es lo correcto, pero inutil.
 */
function alEolDe(texto, patron) {
    return texto.includes('\r\n') ? patron.replace(/\n/g, '\r\n') : patron;
}

/** @type {{nombre: string, fichero: string, de: string, a: string, espera: string}[]} */
const MUTACIONES = [
    {
        nombre: 'M1 · vuelve la plantilla fantasma «sample-config.json» tal cual estaba',
        fichero: PANEL,
        de: "        const devFiles = [\n            { file: 'package.json',",
        a: "        const devFiles = [\n            { file: 'sample-config.json', name: 'Sample Configuration', description: 'Sample webview configuration template' },\n            { file: 'package.json',",
        espera: '§3 — el arbol del producto no produce ese fichero, y ademas esta en la lista de podados',
    },
    {
        nombre: 'M2 · los schemas del PAQUETE vuelven a resolverse contra el WORKSPACE',
        fichero: PANEL,
        de: "        return origen === 'paquete'\n            ? this._extensionUri.fsPath\n            : vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;",
        a: '        return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;',
        espera: '§1 — con un workspace ajeno el panel no ofrece ningun activo del paquete',
    },
    {
        nombre: 'M3 · se retira la de-duplicacion: los schemas se ofrecen dos veces',
        fichero: PANEL,
        de: '                if (vistos.has(filePath)) { continue; }',
        a: '                if (false) { continue; }',
        espera: '§4 — con el repositorio como workspace, cada schema sale por paquete y por workspace',
    },
    {
        nombre: 'M4 · el paquete declara un activo que no envia',
        fichero: PANEL,
        de: "            const schemaDir = path.join(raiz, 'schemas');",
        a: "            const schemaDir = path.join(raiz, 'schemas');\n            if (origen === 'paquete') { fs.existsSync(path.join(raiz, 'plantilla-que-no-viaja.json')); }",
        espera: '§1 — hay una sonda contra la raiz del paquete que no resuelve',
    },
    {
        nombre: 'M5 · mcpTypes.ts vuelve a decir que las interfaces casan con el fichero podado',
        fichero: TIPOS,
        de: '// Configuration interfaces to match the structure of the file named by\n// OPERA_CONFIG_FILENAME',
        a: '// Configuration interfaces to match sample-config.json structure',
        espera: '§5 — nombre .json vivo, no declarado muerto con «…»',
    },
    {
        nombre: 'M6 · los items del paquete dejan de declarar su origen',
        fichero: PANEL,
        de: "                    category: 'schema',\n                    origen\n",
        a: "                    category: 'schema',\n",
        espera: '§1 — hay items de fichero sin origen (y ninguno cuenta como del paquete)',
    },
];

function corre() {
    // jest escribe el resumen por STDERR: hay que juntar las dos, o la linea
    // «Tests:» no aparece y el script cree que el arbol esta roto.
    const r = spawnSync(process.execPath, [JEST, '--coverage=false', TEST], {
        cwd: RAIZ,
        encoding: 'utf8',
    });
    return `${r.stdout ?? ''}\n${r.stderr ?? ''}`;
}

function resumen(salida) {
    const fallos = [...salida.matchAll(/^\s+●\s(.+)$/gm)].map(m => m[1].trim());
    const linea = salida.split(/\r?\n/).find(l => l.startsWith('Tests:')) ?? '(sin linea Tests:)';
    return { fallos: [...new Set(fallos)], linea };
}

let codigo = 0;

console.log('############ CONTROL PREVIO · el arbol sin mutar debe estar VERDE ############');
{
    const { fallos, linea } = resumen(corre());
    console.log(`  ${linea}`);
    if (fallos.length > 0 || /failed/.test(linea)) {
        fallos.forEach(f => console.log(`    ● ${f}`));
        console.error('ABORTA (2): el arbol sin mutar ya esta rojo. Un rojo de partida invalida todo lo demas.');
        process.exit(2);
    }
}

for (const m of MUTACIONES) {
    console.log(`\n############ ${m.nombre} ############`);
    console.log(`  espera: ${m.espera}`);

    const original = readFileSync(m.fichero, 'utf8');
    const de = alEolDe(original, m.de);
    const a = alEolDe(original, m.a);
    if (!original.includes(de)) {
        console.error(`ABORTA (3): el patron no esta en ${m.fichero}. La mutacion NO se aplico.`);
        console.error(`  patron: ${JSON.stringify(m.de.slice(0, 90))}`);
        process.exit(3);
    }

    writeFileSync(m.fichero, original.replace(de, a), 'utf8');

    // Se imprime lo que quedo escrito ANTES de correr jest: es la unica prueba
    // de que la mutacion mordio.
    const mutado = readFileSync(m.fichero, 'utf8').split(/\r?\n/);
    const primera = m.a.split('\n')[0].trim() || m.a.split('\n')[1].trim();
    const idx = mutado.findIndex(l => l.trim() === primera);
    console.log(`  mutado OK -> L${idx + 1}: ${mutado[idx]?.trim()}`);

    const { fallos, linea } = resumen(corre());
    console.log(`  ${linea}`);
    fallos.forEach(f => console.log(`    ● ${f}`));

    if (fallos.length === 0) {
        console.error('  !! NADIE DISPARO: la mutacion no la caza ningun guardian.');
        codigo = 1;
    }

    writeFileSync(m.fichero, original, 'utf8');
}

console.log('\n############ CONTROL FINAL · restaurado, debe volver a VERDE ############');
{
    const { fallos, linea } = resumen(corre());
    console.log(`  ${linea}`);
    if (fallos.length > 0) {
        fallos.forEach(f => console.log(`    ● ${f}`));
        console.error('  !! el arbol NO quedo restaurado.');
        codigo = 1;
    }
}

process.exit(codigo);
