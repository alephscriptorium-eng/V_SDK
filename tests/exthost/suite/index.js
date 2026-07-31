/**
 * WP-V68 · Arnés Extension Host — suite (corre DENTRO del Extension Host).
 *
 * Prueba de facto contra el VS Code real (no mocks):
 *   1. la extensión `scriptorium.aleph-0` está presente;
 *      en modo vsix, además, corre desde el ARTEFACTO instalado, no del repo;
 *   2. activa sin errores (`activate()` resuelve e `isActive`);
 *   3. comandos: los contribuidos en el manifiesto vs los realmente
 *      registrados (`vscode.commands.getCommands`), y un comando benigno
 *      (`aleph0.statusBar.toggle`) EJECUTA sin lanzar;
 *   4. vistas contribuidas: el workbench conoce cada vista (`<id>.focus`)
 *      y el contenedor de activity bar abre de verdad.
 *
 * Contrato de honestidad (PRACTICAS §2.1 / §5): lo que falla se lista, no se
 * tapa. La divergencia manifiesto↔registro se reporta SIEMPRE con lista
 * completa; por defecto es AVISO (el defecto es del manifiesto, obra de
 * WP-V72), con EXTHOST_STRICT=1 se vuelve fallo.
 */
'use strict';

const path = require('path');
const fs = require('fs');

const EXT_ID = 'scriptorium.aleph-0';

function norm(p) {
    return path.normalize(p || '').replace(/[\\/]+$/, '').toLowerCase();
}

async function run() {
    const vscode = require('vscode');
    const modo = process.env.EXTHOST_MODE || 'source';
    const fallos = [];
    const avisos = [];
    const pasos = [];
    const ok = (msg) => {
        console.log(`[exthost:suite] PASS  ${msg}`);
        pasos.push(`PASS  ${msg}`);
    };
    const ko = (msg) => {
        console.error(`[exthost:suite] FAIL  ${msg}`);
        pasos.push(`FAIL  ${msg}`);
        fallos.push(msg);
    };
    const aviso = (msg) => {
        console.warn(`[exthost:suite] AVISO ${msg}`);
        pasos.push(`AVISO ${msg}`);
        avisos.push(msg);
    };
    // Acta de ejecución: sin ella, el lanzador considera el verde «por
    // construcción» y falla. Se escribe SIEMPRE, pase lo que pase.
    const acta = () => {
        const fichero = process.env.EXTHOST_RESULT_FILE;
        if (!fichero) return;
        fs.writeFileSync(fichero, JSON.stringify({
            modo,
            vscodeVersion: vscode.version,
            fecha: new Date().toISOString(),
            pasos,
            fallos,
            avisos
        }, null, 2));
    };

    console.log(`[exthost:suite] modo=${modo} · vscode=${vscode.version}`);

    // ── 1 · presencia (y, en modo vsix, identidad de artefacto) ──────────
    const ext = vscode.extensions.getExtension(EXT_ID);
    if (!ext) {
        ko(`extensión ${EXT_ID} NO presente en el host`);
        acta();
        throw new Error(`[exthost:suite] aborto: sin extensión no hay nada que probar (${fallos.length} fallo/s)`);
    }
    ok(`extensión ${EXT_ID} presente (${ext.packageJSON.version}) en ${ext.extensionPath}`);

    if (modo === 'vsix') {
        const repo = norm(process.env.EXTHOST_REPO_ROOT);
        const extDir = norm(process.env.EXTHOST_EXTENSIONS_DIR);
        const extPath = norm(ext.extensionPath);
        // Identidad de artefacto: corre desde el extensions-dir aislado donde
        // se instaló el .vsix — y NO desde la raíz del repo (development path).
        if (extPath === repo) {
            ko(`modo vsix pero la extensión corre desde el repo (${ext.extensionPath}), no desde el artefacto instalado`);
        } else if (!extDir || !extPath.startsWith(extDir)) {
            ko(`modo vsix pero la extensión no corre desde el extensions-dir aislado (${ext.extensionPath} vs ${process.env.EXTHOST_EXTENSIONS_DIR})`);
        } else {
            ok(`modo vsix: corre desde el artefacto instalado en ${ext.extensionPath}, no desde el fuente`);
        }
    }

    // ── 2 · activación sin errores ───────────────────────────────────────
    let errorActivacion = null;
    try {
        await ext.activate();
    } catch (e) {
        errorActivacion = e;
    }
    if (errorActivacion) {
        ko(`activate() rechazó: ${errorActivacion && errorActivacion.stack ? errorActivacion.stack : errorActivacion}`);
    } else if (!ext.isActive) {
        ko('activate() resolvió pero isActive === false');
    } else {
        ok('activación sin errores (activate() resolvió · isActive === true)');
    }

    // ── 3 · comandos: manifiesto vs registro real + ejecución de facto ───
    const contribuidos = ((ext.packageJSON.contributes || {}).commands || []).map((c) => c.command);
    const todos = await vscode.commands.getCommands(true);
    const registrados = new Set(todos);

    const sinRegistrar = contribuidos.filter((c) => !registrados.has(c));
    const contribSet = new Set(contribuidos);
    const fantasma = todos.filter((c) => c.startsWith('aleph0.') && !contribSet.has(c));

    console.log(`[exthost:suite] comandos contribuidos en manifiesto: ${contribuidos.length}`);
    console.log(`[exthost:suite] comandos aleph0.* registrados de facto: ${todos.filter((c) => c.startsWith('aleph0.')).length}`);

    if (sinRegistrar.length === 0) {
        ok('todos los comandos contribuidos están registrados');
    } else {
        const msg =
            `${sinRegistrar.length}/${contribuidos.length} comandos contribuidos NO registrados ` +
            `(el manifiesto promete lo que no responde — candidato WP-V72):\n` +
            sinRegistrar.map((c) => `        - ${c}`).join('\n');
        if (process.env.EXTHOST_STRICT === '1') {
            ko(msg);
        } else {
            aviso(msg);
        }
    }
    if (fantasma.length > 0) {
        aviso(
            `${fantasma.length} comandos aleph0.* registrados SIN fila en el manifiesto:\n` +
            fantasma.map((c) => `        - ${c}`).join('\n')
        );
    }

    // Un comando registrado RESPONDE de facto (benigno: toggle de status bar,
    // ida y vuelta para no dejar estado).
    const CMD_BENIGNO = 'aleph0.statusBar.toggle';
    if (!registrados.has(CMD_BENIGNO)) {
        ko(`comando benigno ${CMD_BENIGNO} no está registrado: no se puede probar respuesta`);
    } else {
        try {
            await vscode.commands.executeCommand(CMD_BENIGNO);
            await vscode.commands.executeCommand(CMD_BENIGNO);
            ok(`comando ${CMD_BENIGNO} ejecutó (×2, ida y vuelta) sin lanzar`);
        } catch (e) {
            ko(`comando ${CMD_BENIGNO} lanzó al ejecutar: ${e}`);
        }
    }

    // ── 4 · vistas contribuidas existen ──────────────────────────────────
    const vistasPorContenedor = (ext.packageJSON.contributes || {}).views || {};
    const vistas = Object.values(vistasPorContenedor).flat();
    let vistasOk = 0;
    for (const v of vistas) {
        // El workbench registra `<viewId>.focus` para cada vista contribuida
        // que conoce: su ausencia = la vista no existe para VS Code.
        if (registrados.has(`${v.id}.focus`)) {
            vistasOk += 1;
        } else {
            ko(`vista contribuida ${v.id} desconocida para el workbench (falta comando ${v.id}.focus)`);
        }
    }
    if (vistas.length > 0 && vistasOk === vistas.length) {
        ok(`las ${vistas.length} vistas contribuidas existen para el workbench (comando <id>.focus presente)`);
    }
    if (vistas.length === 0) {
        ko('el manifiesto no contribuye ninguna vista — nada que verificar (¿regresión?)');
    }

    const contenedores = (((ext.packageJSON.contributes || {}).viewsContainers || {}).activitybar || []).map((c) => c.id);
    for (const id of contenedores) {
        const cmd = `workbench.view.extension.${id}`;
        if (!registrados.has(cmd)) {
            ko(`contenedor de activity bar ${id} sin comando ${cmd}`);
            continue;
        }
        try {
            await vscode.commands.executeCommand(cmd);
            ok(`contenedor ${id} abre de facto (${cmd})`);
        } catch (e) {
            ko(`contenedor ${id} lanzó al abrir: ${e}`);
        }
    }

    // ── resumen ──────────────────────────────────────────────────────────
    console.log(`[exthost:suite] resumen: ${fallos.length} fallo/s · ${avisos.length} aviso/s`);
    acta();
    if (fallos.length > 0) {
        throw new Error(`[exthost:suite] ${fallos.length} fallo/s — ver FAIL arriba`);
    }
}

module.exports = { run };
