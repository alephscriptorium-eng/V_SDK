#!/usr/bin/env node
// =============================================================================
// verificacion-paridad.mjs · lo que CI verifica, la publicación lo verifica
//                            también, y ANTES de publicar — WP-V97
// =============================================================================
//
// MOTIVO
//   WP-V97 mete la cadena de verificación entera dentro de `release.yml`, que
//   hasta hoy iba `npm ci` → compilar → empaquetar → publicar y no ejecutaba
//   ni un test. Duplicar pasos abre un agujero nuevo el día siguiente: `ci.yml`
//   gana un control en la ola 8, `release.yml` no se entera, y volvemos a
//   publicar por debajo de lo que el mundo cree que vigila — esta vez en
//   silencio, porque los dos ficheros están «verdes».
//
//   Un comentario que diga «mantener en sync» es exactamente la clase de
//   declaración que este mundo lleva siete olas pagando. Esto lo COMPRUEBA.
//
// QUÉ COMPRUEBA — dos cosas, y la segunda es la que importa
//
//   1) COBERTURA DE COMANDOS. Todo comando `run:` de `ci.yml` —de CUALQUIERA
//      de sus jobs— tiene que aparecer, con el mismo texto, en `release.yml`.
//      Faltar sólo es legítimo si está DECLARADO abajo en `EXCLUIDOS`, con su
//      motivo. La lista de exclusiones es dato visible en el diff, no una
//      excepción enterrada en una condición.
//
//   2) ORDEN. Cada uno de esos comandos tiene que estar ANTES del paso que
//      publica. Sin esta comprobación, alguien podría satisfacer (1) pegando
//      la cadena DESPUÉS de crear el release y el fichero pasaría por bueno:
//      un gate que corre después de publicar no es un gate. Los pasos de
//      publicación se detectan por patrón (`PUBLICACION`) y se toma el
//      PRIMERO: si mañana entra un `vsce publish` antes de la suite, cae aquí.
//
//   Las dos fallan cerrado. Si este instrumento no reconoce el flujo —no
//   encuentra el paso de publicación, no puede leer un fichero— sale con
//   error, nunca en verde.
//
// LO QUE **NO** GARANTIZA — léase antes de confiar en él
//   · NO comprueba la dirección contraria. `release.yml` puede tener pasos que
//     `ci.yml` no tiene, y debe: las dos guardas del tag son suyas. Un gate de
//     dos direcciones aquí sólo produciría ruido.
//   · NO juzga si un comando verifica algo. Si `ci.yml` cambia `npm test` por
//     `echo ok`, este instrumento exige felizmente ese `echo ok` en los dos
//     ficheros. Quien vigila que los pasos muerdan es el propio `ci.yml`
//     (gate de rojos, trinquete, guarda anti-blandas); esto sólo vigila que la
//     publicación no verifique MENOS que la rama.
//   · NO corre en `ci.yml`: `ci.yml` no está en el ALCANCE_DIFF de WP-V97 más
//     que si la vía elegida exigiera dispararlo con etiquetas, y no lo exige.
//     Consecuencia declarada: la deriva se caza al PUBLICAR, no al empujar.
//     Es tarde para avisar y a tiempo para impedir — que es lo que se pedía.
//     Moverlo a `ci.yml` es una línea, y es de otro WP.
//   · NO es un parser de YAML. Es un escáner de líneas que entiende las dos
//     formas que estos dos ficheros usan (`run: cmd` y `run: |` con bloque).
//     Un flujo escrito con anclas, flujos JSON o `run: >` plegado lo
//     despistaría — y por eso, si no encuentra NINGÚN comando en `ci.yml`,
//     muere en vez de aplaudir.
//   · NO tiene tests propios: `tests/**` no está en el ALCANCE_DIFF de V97.
//     Deuda dicha, no disimulada. Sus dos direcciones están demostradas a mano
//     en `plan/REPORTES/WP-V97-publicar-con-red.md` §6.
//   · Al normalizar, quita las líneas que son SÓLO comentario de shell. Si
//     algún día un bloque lleva un heredoc con `#` significativo al principio
//     de línea, esa línea desaparecería de la comparación.
//
// USO
//   node scripts/verificacion-paridad.mjs [<ci.yml>] [<release.yml>]
//       Sin argumentos usa los dos flujos del repo. Los argumentos existen
//       para poder atacar el instrumento con ficheros de prueba; NO son un
//       interruptor de bypass: el flujo lo invoca sin argumentos y cualquier
//       ruta que se le pase se imprime en la salida.
//
// CÓDIGOS DE SALIDA
//   0  todos los comandos de ci.yml están en release.yml y antes de publicar
//   1  falta algún comando, o alguno está después del paso que publica
//   2  error de uso: fichero ilegible, flujo irreconocible, cero comandos
// =============================================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ── DATO 1 · exclusiones declaradas ──────────────────────────────────────────
// Comandos de ci.yml que NO tienen por qué estar en release.yml. Cada entrada
// se firma con su motivo, y el instrumento las imprime en cada corrida para que
// nadie tenga que abrir este fichero para saber qué se está perdonando.
const EXCLUIDOS = [
    {
        patron: /has_npm=/,
        motivo:
            'detección de credenciales del registro privado: no verifica el producto, ' +
            'y su ::notice:: dice cosas distintas en cada flujo a propósito'
    }
];

// ── DATO 2 · qué cuenta como publicar ────────────────────────────────────────
// Se toma la PRIMERA aparición de cualquiera de estos patrones en release.yml.
// Todo comando de verificación tiene que quedar por encima de esa línea.
const PUBLICACION = [
    /uses:\s*softprops\/action-gh-release/,
    /\bgh\s+release\s+create\b/,
    /\bvsce\s+publish\b/,
    /\bovsx\s+publish\b/,
    /\bnpm\s+publish\b/
];

function morir(msg) {
    console.error(`verificacion-paridad: ${msg}`);
    process.exit(2);
}

function leer(rel) {
    const abs = path.isAbsolute(rel) ? rel : path.join(REPO_ROOT, rel);
    try {
        return fs.readFileSync(abs, 'utf8');
    } catch (err) {
        morir(`no se pudo leer ${abs}: ${err.message}`);
    }
}

/** Indentación (en espacios) de una línea; Infinity si está en blanco. */
function sangria(linea) {
    if (linea.trim() === '') return Infinity;
    return linea.length - linea.trimStart().length;
}

/**
 * Normaliza el cuerpo de un `run:`: quita la sangría común, tira las líneas en
 * blanco y las que son SÓLO comentario de shell, y une con «\n». Dos pasos con
 * el mismo shell y distinta sangría o distintos comentarios salen iguales.
 */
function normalizar(lineas) {
    const utiles = lineas.filter((l) => l.trim() !== '' && !l.trimStart().startsWith('#'));
    if (utiles.length === 0) return '';
    const comun = Math.min(...utiles.map(sangria));
    return utiles.map((l) => l.slice(comun).trimEnd()).join('\n');
}

/**
 * Escanea un flujo y devuelve sus comandos `run:` en orden, cada uno con el
 * `name:` del paso al que pertenece y la línea (1-based) donde empieza.
 */
function comandos(texto) {
    const lineas = texto.split(/\r?\n/);
    const salida = [];
    let nombre = '(sin nombre)';

    for (let i = 0; i < lineas.length; i++) {
        const linea = lineas[i];

        const mNombre = linea.match(/^\s*-?\s*name:\s*(.+?)\s*$/);
        if (mNombre) {
            nombre = mNombre[1];
            continue;
        }

        const mRun = linea.match(/^(\s*)run:\s*(.*)$/);
        if (!mRun) continue;

        const [, sangriaRun, resto] = mRun;
        const nivel = sangriaRun.length;

        // Forma A: `run: comando` en una línea.
        if (resto.trim() !== '' && !/^[|>][-+]?\d*\s*$/.test(resto.trim())) {
            salida.push({ nombre, linea: i + 1, texto: resto.trim() });
            continue;
        }

        // Forma B: `run: |` y un bloque más sangrado que el propio `run:`.
        const bloque = [];
        let j = i + 1;
        while (j < lineas.length && (sangria(lineas[j]) > nivel || lineas[j].trim() === '')) {
            bloque.push(lineas[j]);
            j++;
        }
        salida.push({ nombre, linea: i + 1, texto: normalizar(bloque) });
        i = j - 1;
    }

    return salida;
}

/** Línea (1-based) del primer paso que publica, o null si no hay ninguno. */
function lineaDePublicacion(texto) {
    const lineas = texto.split(/\r?\n/);
    for (let i = 0; i < lineas.length; i++) {
        if (PUBLICACION.some((p) => p.test(lineas[i]))) return i + 1;
    }
    return null;
}

// ── programa ─────────────────────────────────────────────────────────────────
const [argCi, argRelease, ...sobra] = process.argv.slice(2);
if (sobra.length > 0) {
    morir(`sobran argumentos: ${sobra.join(' ')} — uso: [<ci.yml>] [<release.yml>]`);
}

const rutaCi = argCi ?? '.github/workflows/ci.yml';
const rutaRelease = argRelease ?? '.github/workflows/release.yml';

const textoCi = leer(rutaCi);
const textoRelease = leer(rutaRelease);

console.log(`verificación exigida por : ${rutaCi}`);
console.log(`flujo que debe cumplirla : ${rutaRelease}`);

const deCi = comandos(textoCi);
if (deCi.length === 0) {
    morir(`cero comandos «run:» en ${rutaCi} — o el flujo cambió de forma o este escáner ya no lo entiende; no se aplaude por no haber sabido leer`);
}

const corte = lineaDePublicacion(textoRelease);
if (corte === null) {
    morir(`no encuentro en ${rutaRelease} ningún paso que publique (${PUBLICACION.map(String).join(', ')}) — sin saber DÓNDE se publica no puedo comprobar que la verificación va antes`);
}
console.log(`paso que publica         : ${rutaRelease}:${corte}`);

// Índice del release: texto normalizado → primera línea donde aparece.
const enRelease = new Map();
for (const c of comandos(textoRelease)) {
    if (!enRelease.has(c.texto)) enRelease.set(c.texto, c.linea);
}

const perdonados = [];
const ausentes = [];
const tardios = [];
let exigidos = 0;

for (const c of deCi) {
    const excusa = EXCLUIDOS.find((e) => e.patron.test(c.texto));
    if (excusa) {
        perdonados.push({ ...c, motivo: excusa.motivo });
        continue;
    }
    exigidos++;
    const donde = enRelease.get(c.texto);
    if (donde === undefined) {
        ausentes.push(c);
    } else if (donde > corte) {
        tardios.push({ ...c, donde });
    }
}

if (perdonados.length > 0) {
    console.log('');
    console.log(`exclusiones declaradas (${perdonados.length}) — no se exigen en la publicación:`);
    for (const p of perdonados) {
        console.log(`  · ${rutaCi}:${p.linea} «${p.nombre}»`);
        console.log(`    motivo: ${p.motivo}`);
    }
}

let fallo = false;

if (ausentes.length > 0) {
    fallo = true;
    console.error('');
    console.error(`PARIDAD ROTA · ${ausentes.length} comando(s) que ${rutaCi} ejecuta y ${rutaRelease} NO:`);
    for (const a of ausentes) {
        console.error(`  · ${rutaCi}:${a.linea} «${a.nombre}»`);
        for (const l of a.texto.split('\n')) console.error(`      ${l}`);
    }
    console.error('');
    console.error(`  Se publicaría verificando MENOS de lo que se exige a una rama. Añade el paso`);
    console.error(`  a ${rutaRelease} (antes de la línea ${corte}) o declara la exclusión con su`);
    console.error(`  motivo en EXCLUIDOS de scripts/verificacion-paridad.mjs.`);
}

if (tardios.length > 0) {
    fallo = true;
    console.error('');
    console.error(`ORDEN ROTO · ${tardios.length} comando(s) que se ejecutan DESPUÉS de publicar:`);
    for (const t of tardios) {
        console.error(`  · «${t.nombre}» está en ${rutaRelease}:${t.donde}, y se publica en la ${corte}`);
    }
    console.error('');
    console.error('  Un gate que corre después de publicar no es un gate: el .vsix ya está fuera.');
}

if (fallo) process.exit(1);

console.log('');
console.log(`paridad OK · ${exigidos} comando(s) de ${rutaCi} presentes en ${rutaRelease} y todos antes de la línea ${corte}`);
