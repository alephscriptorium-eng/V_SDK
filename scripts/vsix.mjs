#!/usr/bin/env node
/**
 * Resolutor portable del artefacto .vsix — WP-V16 (b) · V-L1-02
 *
 * PROBLEMA QUE RESUELVE
 *   El nombre del .vsix estaba escrito a mano, con la versión dentro, en
 *   seis sitios (package.json ×5, ci.yml, release.yml ×3). Subir la versión
 *   dejaba los flujos apuntando a un fichero que ya no existe: el CI habría
 *   fallado al subir el artefacto, y el release habría publicado un cuerpo
 *   que nombra un asset distinto del que adjunta.
 *
 *   Aquí el nombre se DERIVA de package.json. Ningún script ni flujo repite
 *   la versión.
 *
 * FORMA DEL NOMBRE
 *   `<publisher>-<name>-<version>.vsix` — la misma forma que se venía
 *   produciendo a mano. Se conserva a propósito: la marca del producto es
 *   obra de WP-V14 y este WP no la toca. Cuando V14 cambie
 *   `publisher`/`name`/`displayName`, el nombre del artefacto la seguirá
 *   solo, sin editar flujos.
 *
 *   (Se descartó `vsce package --out dist/`, que nombra con `<name>-<version>`
 *   y habría dejado caer el prefijo del publisher del asset: eso es un cambio
 *   de marca, y la marca no es de este WP.)
 *
 * PORTABILIDAD
 *   Nada de `$npm_package_version` ni de interpolación de shell: no expande
 *   en cmd.exe y el custodio prueba en Windows mientras el CI corre en
 *   ubuntu. Toda la resolución ocurre en node.
 *
 *   Tampoco se pasa por `npx`: en la máquina del custodio (Windows, node
 *   22.21.1 sin `node_modules/npm` en el árbol) `npx` aborta con
 *   `Cannot find module …/node_modules/npm/bin/npx-cli.js` y el empaquetado
 *   moría DESPUÉS de derivar bien el nombre. `@vscode/vsce` es
 *   devDependency: se resuelve su `bin` con `createRequire` y se lanza con
 *   `process.execPath`. Sin shim `.cmd`, sin PATH, sin shell. `npx` queda
 *   solo como respaldo para el caso de que no esté instalado.
 *
 * USO
 *   node scripts/vsix.mjs path                 → dist/<publisher>-<name>-<version>.vsix
 *   node scripts/vsix.mjs name                 → <publisher>-<name>-<version>.vsix
 *   node scripts/vsix.mjs ensure-dist          → crea dist/ si falta
 *   node scripts/vsix.mjs package [--local]    → vsce package con el nombre derivado
 *                                                (--local: exige vsce instalado, sin respaldo npx)
 *   node scripts/vsix.mjs install [--insiders] → code --install-extension <derivado>
 *
 *   `package` borra los `*.vsix` previos de dist/ antes de empaquetar, para
 *   que el glob `dist/*.vsix` de los flujos resuelva a exactamente uno.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = 'dist';

function die(msg) {
    console.error(`vsix.mjs: ${msg}`);
    process.exit(1);
}

function manifest() {
    const file = path.join(REPO_ROOT, 'package.json');
    let pkg;
    try {
        pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (err) {
        die(`no se pudo leer ${file}: ${err.message}`);
    }
    for (const campo of ['publisher', 'name', 'version']) {
        if (typeof pkg[campo] !== 'string' || pkg[campo].trim() === '') {
            die(`package.json sin «${campo}»: no se puede derivar el nombre del .vsix`);
        }
    }
    return pkg;
}

function vsixName() {
    const pkg = manifest();
    return `${pkg.publisher}-${pkg.name}-${pkg.version}.vsix`;
}

/** Ruta relativa a la raíz del repo, con «/» también en Windows. */
function vsixPath() {
    return `${OUT_DIR}/${vsixName()}`;
}

function ensureDist() {
    const dir = path.join(REPO_ROOT, OUT_DIR);
    fs.mkdirSync(dir, { recursive: true });
    return dir;
}

function limpiarVsixPrevios(dir) {
    for (const f of fs.readdirSync(dir)) {
        if (f.endsWith('.vsix')) {
            fs.rmSync(path.join(dir, f));
            console.log(`vsix.mjs: retirado artefacto previo dist/${f}`);
        }
    }
}

/** En Windows los binarios de npm son shims .cmd: hace falta shell. */
function run(cmd, args) {
    const win = process.platform === 'win32';
    const r = spawnSync(win ? `"${cmd}"` : cmd, win ? args.map((a) => `"${a}"`) : args, {
        cwd: REPO_ROOT,
        stdio: 'inherit',
        shell: win
    });
    if (r.error) {
        die(`no se pudo ejecutar «${cmd}»: ${r.error.message}`);
    }
    return r.status ?? 1;
}

/**
 * Ruta absoluta al `bin` de `@vscode/vsce` instalado en este árbol, o null.
 * Se lee del propio manifiesto del paquete: si upstream renombra su bin, esto
 * lo sigue sin editar nada aquí.
 */
function vsceLocalBin() {
    const require_ = createRequire(import.meta.url);
    let manifiesto;
    try {
        manifiesto = require_.resolve('@vscode/vsce/package.json');
    } catch {
        return null;
    }
    let bin;
    try {
        bin = JSON.parse(fs.readFileSync(manifiesto, 'utf8')).bin;
    } catch {
        return null;
    }
    const rel = typeof bin === 'string' ? bin : bin && bin.vsce;
    if (typeof rel !== 'string') {
        return null;
    }
    const abs = path.join(path.dirname(manifiesto), rel);
    return fs.existsSync(abs) ? abs : null;
}

function cmdPackage(argv) {
    const dir = ensureDist();
    limpiarVsixPrevios(dir);
    const destino = vsixPath();
    const exigirLocal = argv.includes('--local');
    const vsceArgs = ['package', '--no-dependencies', '--out', destino];

    // Preferido siempre: el vsce del árbol, lanzado con este mismo node.
    const bin = vsceLocalBin();
    let cmd, args;
    if (bin) {
        cmd = process.execPath;
        args = [bin, ...vsceArgs];
        console.log(`vsix.mjs: vsce local ${path.relative(REPO_ROOT, bin)}`);
    } else if (exigirLocal) {
        die('@vscode/vsce no está instalado en este árbol y se pidió --local (ejecuta `npm ci`)');
    } else {
        // Respaldo. Ojo: `npx` falla en instalaciones de node sin
        // `node_modules/npm` — por eso no es el camino por defecto.
        cmd = 'npx';
        args = ['--yes', '@vscode/vsce', ...vsceArgs];
        console.log('vsix.mjs: @vscode/vsce no instalado — respaldo por npx');
    }

    console.log(`vsix.mjs: empaquetando → ${destino}`);
    const rc = run(cmd, args);
    if (rc !== 0) {
        die(`vsce salió con ${rc}`);
    }
    if (!fs.existsSync(path.join(REPO_ROOT, destino))) {
        die(`vsce salió 0 pero ${destino} no existe`);
    }
    console.log(`vsix.mjs: OK ${destino}`);
}

function cmdInstall(argv) {
    const destino = vsixPath();
    if (!fs.existsSync(path.join(REPO_ROOT, destino))) {
        die(`${destino} no existe — empaqueta antes (npm run package:v1)`);
    }
    const bin = argv.includes('--insiders') ? 'code-insiders' : 'code';
    process.exit(run(bin, ['--install-extension', destino]));
}

const [accion = '', ...resto] = process.argv.slice(2);

switch (accion) {
    case 'path':
        console.log(vsixPath());
        break;
    case 'name':
        console.log(vsixName());
        break;
    case 'ensure-dist':
        console.log(ensureDist());
        break;
    case 'package':
        cmdPackage(resto);
        break;
    case 'install':
        cmdInstall(resto);
        break;
    default:
        die(`acción desconocida: «${accion}» — usa path|name|ensure-dist|package|install`);
}
