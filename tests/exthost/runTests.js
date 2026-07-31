#!/usr/bin/env node
/**
 * WP-V68 · Arnés Extension Host — lanzador (@vscode/test-electron)
 *
 * Descarga un VS Code real, lo lanza con la extensión y ejecuta la suite
 * de `tests/exthost/suite/index.js` DENTRO del Extension Host.
 *
 * Dos modos:
 *   node tests/exthost/runTests.js           → modo FUENTE: la extensión se
 *     carga como development extension desde la raíz del repo (dist/ ya
 *     compilado por `npm run compile`).
 *   node tests/exthost/runTests.js --vsix    → modo ARTEFACTO: instala el
 *     `.vsix` EMPAQUETADO (dist/<name>-<version>.vsix, derivado por
 *     scripts/vsix.mjs — no se duplica la derivación) en un extensions-dir
 *     aislado y prueba ESO; el development path pasa a ser el mini-arnés
 *     `tests/exthost/harness-vsix/`, que solo hospeda el runner.
 *
 * Aislamiento: user-data-dir y extensions-dir propios por modo bajo
 * `.vscode-test/` (ignorado por git). No toca el VS Code del operador.
 *
 * Variables:
 *   VSCODE_TEST_VERSION  versión a descargar (por defecto: 'stable')
 *   EXTHOST_STRICT=1     los avisos (manifiesto vs registro) se vuelven fallo
 */
'use strict';

const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');
const {
    runTests,
    downloadAndUnzipVSCode,
    resolveCliArgsFromVSCodeExecutablePath
} = require('@vscode/test-electron');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SUITE = path.resolve(__dirname, 'suite', 'index.js');
const HARNESS_VSIX = path.resolve(__dirname, 'harness-vsix');
const VSCODE_VERSION = process.env.VSCODE_TEST_VERSION || 'stable';

function die(msg) {
    console.error(`[exthost] ${msg}`);
    process.exit(1);
}

/** Deriva la ruta del .vsix con el resolutor canónico (scripts/vsix.mjs). */
function vsixPath() {
    const r = spawnSync(process.execPath, [path.join(REPO_ROOT, 'scripts', 'vsix.mjs'), 'path'], {
        cwd: REPO_ROOT,
        encoding: 'utf8'
    });
    if (r.status !== 0 || !r.stdout.trim()) {
        die(`scripts/vsix.mjs path falló: ${r.stderr || r.status}`);
    }
    return path.resolve(REPO_ROOT, r.stdout.trim());
}

/** En Windows el CLI de VS Code es un shim .cmd: hace falta shell (mismo patrón que scripts/vsix.mjs). */
function runCli(cmd, args) {
    const win = process.platform === 'win32';
    const r = spawnSync(win ? `"${cmd}"` : cmd, win ? args.map((a) => `"${a}"`) : args, {
        cwd: REPO_ROOT,
        encoding: 'utf8',
        shell: win
    });
    if (r.error) {
        die(`no se pudo ejecutar «${cmd}»: ${r.error.message}`);
    }
    return r;
}

async function main() {
    const modoVsix = process.argv.includes('--vsix');
    const modo = modoVsix ? 'vsix' : 'source';

    // Directorios aislados por modo (no contaminan ni el VS Code del operador
    // ni el otro modo).
    const base = path.join(REPO_ROOT, '.vscode-test');
    const userDataDir = path.join(base, `user-data-${modo}`);
    const extensionsDir = path.join(base, `extensions-${modo}`);
    const workspaceDir = path.join(base, 'workspace-vacio');
    for (const d of [userDataDir, extensionsDir, workspaceDir]) {
        fs.mkdirSync(d, { recursive: true });
    }

    console.log(`[exthost] modo: ${modo} · VS Code: ${VSCODE_VERSION}`);
    const vscodeExecutablePath = await downloadAndUnzipVSCode(VSCODE_VERSION);
    console.log(`[exthost] ejecutable: ${vscodeExecutablePath}`);

    let extensionDevelopmentPath = REPO_ROOT;

    if (modoVsix) {
        const vsix = vsixPath();
        if (!fs.existsSync(vsix)) {
            die(`no existe ${vsix} — empaqueta antes (npm run package:v1)`);
        }
        const [cli, ...cliArgs] = resolveCliArgsFromVSCodeExecutablePath(vscodeExecutablePath);
        console.log(`[exthost] instalando artefacto: ${vsix}`);
        const inst = runCli(cli, [
            ...cliArgs,
            '--user-data-dir', userDataDir,
            '--extensions-dir', extensionsDir,
            '--install-extension', vsix
        ]);
        process.stdout.write(inst.stdout || '');
        process.stderr.write(inst.stderr || '');
        if (inst.status !== 0) {
            die(`--install-extension salió con ${inst.status}`);
        }
        // Verificación de facto: el id queda listado en el extensions-dir aislado.
        const lista = runCli(cli, [
            ...cliArgs,
            '--user-data-dir', userDataDir,
            '--extensions-dir', extensionsDir,
            '--list-extensions'
        ]);
        const instaladas = (lista.stdout || '').trim().split(/\r?\n/).filter(Boolean);
        console.log(`[exthost] extensiones instaladas: ${instaladas.join(', ') || '(ninguna)'}`);
        if (!instaladas.includes('scriptorium.aleph-0')) {
            die('scriptorium.aleph-0 no aparece en --list-extensions tras instalar el .vsix');
        }
        extensionDevelopmentPath = HARNESS_VSIX;
    } else if (!fs.existsSync(path.join(REPO_ROOT, 'dist', 'extension.js'))) {
        die('dist/extension.js no existe — compila antes (npm run compile)');
    }

    // Acta de la suite: si al final no existe, el verde es «por construcción»
    // (la suite jamás corrió) y el arnés FALLA (PRACTICAS §5.2).
    const actaFile = path.join(base, `acta-${modo}.json`);
    fs.rmSync(actaFile, { force: true });

    let runError = null;
    let exitCode = null;
    try {
        exitCode = await runTests({
            vscodeExecutablePath,
            extensionDevelopmentPath,
            extensionTestsPath: SUITE,
            launchArgs: [
                workspaceDir,
                '--user-data-dir', userDataDir,
                '--extensions-dir', extensionsDir,
                '--disable-workspace-trust',
                '--skip-welcome',
                '--skip-release-notes',
                '--disable-gpu'
            ],
            extensionTestsEnv: {
                EXTHOST_MODE: modo,
                EXTHOST_REPO_ROOT: REPO_ROOT,
                EXTHOST_EXTENSIONS_DIR: extensionsDir,
                EXTHOST_STRICT: process.env.EXTHOST_STRICT || '',
                EXTHOST_RESULT_FILE: actaFile
            }
        });
    } catch (e) {
        runError = e;
    }

    if (!fs.existsSync(actaFile)) {
        die(`la suite no dejó acta (${actaFile}) — la ejecución no es demostrable; ` +
            (runError ? `runTests: ${runError.message}` : `exit code ${exitCode}`));
    }
    const acta = JSON.parse(fs.readFileSync(actaFile, 'utf8'));
    console.log(`[exthost] ── acta de la suite (${acta.modo} · vscode ${acta.vscodeVersion} · ${acta.fecha}) ──`);
    for (const paso of acta.pasos) {
        console.log(`[exthost]   ${paso}`);
    }
    console.log(`[exthost] resumen del acta: ${acta.fallos.length} fallo/s · ${acta.avisos.length} aviso/s`);
    if (runError || acta.fallos.length > 0) {
        die(`arnés ROJO (modo ${modo}): ${acta.fallos.length} fallo/s` +
            (runError ? ` · runTests: ${runError.message}` : ''));
    }
    console.log(`[exthost] arnés VERDE (modo ${modo}) · exit code ${exitCode}`);
}

main().catch((err) => {
    console.error('[exthost] FALLO del arnés:');
    console.error(err && err.stack ? err.stack : String(err));
    process.exit(1);
});
