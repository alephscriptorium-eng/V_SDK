#!/usr/bin/env node
/**
 * Probe WP-V08 · Mutación + autoría (fases 3-4)
 *
 * - motivos_deny LEÍDOS de editor://info (no hardcode de los 8)
 * - hostil-omite: sin info / sin motivos_deny → pending, no inventa lista
 * - deny sin efecto de escritura (ok:false sin lineDir/refs)
 * - smoke vivo linea-editor + ZEUS_LINEA_EDITOR_REQUIRE_REPARTO → verde/rojo o ⏳
 *
 * ─── WP-V16 (a) · V-L1-01 ───────────────────────────────────────────────
 * QUÉ CAMBIÓ Y POR QUÉ
 *   Este probe llevaba un ESPEJO del parser: una reimplementación local de
 *   `parseEditorInfo`. El espejo ya había divergido de la pieza real —
 *   hacía `!!g.reparto_required` mientras `src/mutation/parseEditorInfo.ts`
 *   lee `g.reparto_required` O `reparto.required` y devuelve `null` cuando
 *   el dato falta. El PASS del probe atestiguaba el espejo, no el código
 *   que viaja en el .vsix: la evidencia no cubría el artefacto que decía
 *   cubrir.
 *
 *   Ahora el probe IMPORTA la pieza real, compilada a
 *   `out/probe/parseEditorInfo.mjs`. No hay fallback: si el artefacto falta
 *   o está más viejo que el fuente, el probe FALLA. Un fallback al espejo
 *   reintroduciría exactamente la mentira que este WP viene a cortar.
 *
 *   Camino elegido: esbuild (no `tsc -p tsconfig.json`). Tres razones:
 *     1. El .vsix se produce con esbuild (`esbuild-base`); `out/` de tsc no
 *        viaja nunca. Compilar la pieza con esbuild ejerce la misma
 *        transformación que la del artefacto publicado.
 *     2. `tsc -p tsconfig.json` typechequea también `tests/**`: ataría la
 *        capacidad de correr el probe al estado del legado de pruebas.
 *     3. Salida ESM → sin trampa de interop CJS↔ESM al importarla desde .mjs.
 *
 *   Sobre `repartoRequired` ante AUSENCIA de dato: este probe NO fija el
 *   valor esperado. Lee la política del parser y comprueba que sea
 *   consistente entre formas distintas de ausencia. WP-V17 está invirtiendo
 *   esa política (hoy falla abierto, pasará a fallar cerrado) y el probe
 *   debe sobrevivir a la fusión en cualquier orden.
 * ────────────────────────────────────────────────────────────────────────
 *
 * Exit 0 si probes automatizados PASS (runtime vivo opcional).
 */
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SELF = fileURLToPath(import.meta.url);
const pkgRoot = path.resolve(path.dirname(SELF), '..', '..');

const FUENTE_REAL = path.join(pkgRoot, 'src/mutation/parseEditorInfo.ts');
const ARTEFACTO = path.join(pkgRoot, 'out/probe/parseEditorInfo.mjs');
const COMO_COMPILAR = 'npm run probe:v08:build   (o directamente: npm run probe:v08)';

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    failed += 1;
  } else {
    console.log(`PASS: ${msg}`);
  }
}

function abortar(motivo) {
  console.error(`\nFAIL: ${motivo}`);
  console.error('El probe NO tiene espejo de repuesto: sin la pieza real no hay nada que atestiguar.');
  console.error(`Compila con: ${COMO_COMPILAR}`);
  process.exit(1);
}

// --- Carga de la pieza real (sin fallback) -----------------------------------
if (!fs.existsSync(ARTEFACTO)) {
  abortar(`no existe el artefacto compilado ${path.relative(pkgRoot, ARTEFACTO)}`);
}
if (!fs.existsSync(FUENTE_REAL)) {
  abortar(`no existe el fuente ${path.relative(pkgRoot, FUENTE_REAL)}`);
}
{
  // Un artefacto viejo mentiría igual que el espejo: diría PASS sobre código
  // que ya no es el que hay en src/.
  const tFuente = fs.statSync(FUENTE_REAL).mtimeMs;
  const tArtefacto = fs.statSync(ARTEFACTO).mtimeMs;
  if (tFuente > tArtefacto) {
    abortar(
      `artefacto OBSOLETO: src/mutation/parseEditorInfo.ts es más reciente que ` +
        `${path.relative(pkgRoot, ARTEFACTO)} (${new Date(tFuente).toISOString()} > ${new Date(tArtefacto).toISOString()})`
    );
  }
}

const real = await import(pathToFileURL(ARTEFACTO).href);
const { parseEditorInfo, representMotivoDeny, isDeniedWithoutWrite, extractMotivoFromDeny } = real;

for (const [nombre, fn] of Object.entries({
  parseEditorInfo,
  representMotivoDeny,
  isDeniedWithoutWrite,
  extractMotivoFromDeny
})) {
  if (typeof fn !== 'function') {
    abortar(`el artefacto real no exporta «${nombre}» como función (got ${typeof fn})`);
  }
}

console.log('=== WP-V08 probe · mutación + autoría ===');
console.log(`pieza real: ${path.relative(pkgRoot, ARTEFACTO)} ← src/mutation/parseEditorInfo.ts`);

// --- Auto-guarda: el probe no puede volver a reimplementar el parser ---------
{
  const propio = fs.readFileSync(SELF, 'utf8');
  const reimplementacion =
    /^\s*(?:async\s+)?function\s+(parseEditorInfo|representMotivoDeny|isDeniedWithoutWrite|extractMotivoFromDeny)\s*\(/m;
  const m = reimplementacion.exec(propio);
  assert(
    m === null,
    `sin reimplementación local del parser en el propio probe${m ? ` (reaparecido: ${m[1]})` : ''}`
  );
}

// --- Hostil-omite: sin editor://info ---
{
  const p = parseEditorInfo(null);
  assert(!p.ok && p.gate === null, 'hostil-omite sin editor://info → sin gate');
  assert(typeof p.pendingReason === 'string' && p.pendingReason.includes('omitido'), 'pendingReason declara la omisión');
  assert(p.requireRepartoLive === null, 'sin info → requireRepartoLive null (no inventa dato)');
}

// --- Hostil-malformado: no-objeto y array ---
{
  for (const raw of ['{}', 42, [1, 2, 3]]) {
    const p = parseEditorInfo(raw);
    assert(!p.ok && p.gate === null, `editor://info malformado (${JSON.stringify(raw)}) → pending sin gate`);
  }
}

// --- Hostil: gate ausente / gate array ---
{
  const p = parseEditorInfo({ name: 'linea-editor', mutationTools: ['crear_linea'] });
  assert(!p.ok && p.gate === null, 'info sin gate → pending');
  assert(p.mutationTools.length === 1, 'mutationTools se conserva aunque falte el gate');
  const q = parseEditorInfo({ gate: ['no', 'soy', 'objeto'] });
  assert(!q.ok && q.gate === null, 'gate array → pending sin gate');
}

// --- Hostil-omite: gate sin motivos_deny ---
{
  const p = parseEditorInfo({
    name: 'linea-editor',
    mutationTools: ['crear_linea', 'export_story_board'],
    gate: { visible: true, gate_line: 'x', reparto_required: true, reparto: { permiso: 'reparto:interpretar' } }
  });
  assert(!p.ok, 'hostil-omite sin motivos_deny → pending (no inventa 8)');
  assert(p.gate != null && p.gate.motivosDeny.length === 0, 'sin motivos_deny → lista vacía, no catálogo inventado');
  // `reparto` presente pero SIN el array: sigue siendo ausencia.
  const q = parseEditorInfo({ gate: { visible: true, reparto: [] } });
  assert(!q.ok && q.gate.motivosDeny.length === 0, 'reparto array → ausencia de motivos_deny');
}

// --- Runtime shape: 8 motivos desde editor://info (fixture = shape servidor, no hardcode UI) ---
{
  const fixtureMotivos = [
    'reparto_requerido',
    'card_no_vigente',
    'identidad_ausente',
    'seat_invalido',
    'seat_ausente',
    'personaje_desconocido',
    'personaje_no_en_reparto',
    'rol_sin_permiso'
  ];
  const info = {
    name: 'linea-editor',
    version: '1.2.3',
    mutationTools: ['crear_linea', 'export_story_board'],
    gate: {
      visible: true,
      gate_line: 'approve + token',
      reparto_required: true,
      reparto_policy_env: 'ZEUS_LINEA_EDITOR_REQUIRE_REPARTO',
      reparto: {
        motivos_deny: fixtureMotivos,
        permiso: 'reparto:interpretar',
        engages_when: 'siempre',
        required: true
      }
    }
  };
  const p = parseEditorInfo(info);
  assert(p.ok, 'editor://info con motivos_deny → ok');
  assert(p.name === 'linea-editor' && p.version === '1.2.3', 'name/version propagados desde info');
  assert(p.gate.motivosDeny.length === 8, `8 motivos desde runtime (got ${p.gate.motivosDeny.length})`);
  assert(
    fixtureMotivos.every((m) => p.gate.motivosDeny.includes(m)),
    'los 8 motivos del fixture representados textualmente'
  );
  const texts = p.gate.motivosDeny.map((m) => representMotivoDeny(m, p.gate.motivosDeny));
  assert(texts.every((t) => t.startsWith('deny · ')), 'representación textual de cada motivo');
  assert(
    representMotivoDeny('inventado', p.gate.motivosDeny).includes('no estaba en motivos_deny'),
    'motivo fuera de la lista del runtime se marca como tal'
  );
  assert(p.requireRepartoLive === true, 'reparto_required reflejado desde info');
  assert(p.gate.gateLine === 'approve + token', 'gate_line propagado');
  assert(p.gate.permiso === 'reparto:interpretar', 'permiso propagado');
  assert(p.gate.engagesWhen === 'siempre', 'engages_when propagado');
  assert(p.gate.repartoPolicyEnv === 'ZEUS_LINEA_EDITOR_REQUIRE_REPARTO', 'reparto_policy_env propagado');
  assert(p.gate.tokenEnv === 'ZEUS_MCP_APPROVAL_TOKEN', 'token_env con su valor por defecto');
}

// --- Lista del servidor manda: si el server publica 2, el IDE usa 2 (no fuerza 8) ---
{
  const p = parseEditorInfo({
    gate: {
      visible: true,
      reparto_required: false,
      reparto: { motivos_deny: ['reparto_requerido', 'seat_ausente'] }
    }
  });
  assert(p.ok && p.gate.motivosDeny.length === 2, 'lista del servidor manda (N=2, no fuerza 8)');
  assert(p.requireRepartoLive === false, 'reparto_required=false se respeta (no se coacciona a true)');
  const sucia = parseEditorInfo({
    gate: { reparto: { motivos_deny: ['seat_ausente', 42, null, { x: 1 }, 'rol_sin_permiso'] } }
  });
  assert(
    sucia.gate.motivosDeny.length === 2 && sucia.gate.motivosDeny.every((m) => typeof m === 'string'),
    'motivos no-string descartados sin romper'
  );
}

// --- Default de `visible` cuando el gate no trae el dato ---
// El contrato hoy es: ausencia de `visible` ⇒ visible. Queda fijado a
// propósito (no es la política que WP-V17 mueve).
{
  const p = parseEditorInfo({ gate: { reparto: { motivos_deny: [] } } });
  assert(p.gate.visible === true, 'gate sin `visible` → visible (default del contrato)');
  const q = parseEditorInfo({ gate: { visible: false, reparto: { motivos_deny: [] } } });
  assert(q.gate.visible === false, 'gate con `visible:false` → no visible');
}

// --- reparto_required: las DOS rutas del dato, y la ausencia ---
// El espejo retirado solo leía `gate.reparto_required`. La pieza real acepta
// también `gate.reparto.required`. Esta es la divergencia que hizo falso el
// PASS anterior.
{
  const porGate = parseEditorInfo({
    gate: { reparto_required: true, reparto: { motivos_deny: [] } }
  });
  assert(porGate.requireRepartoLive === true, 'dato por gate.reparto_required → true');

  const porReparto = parseEditorInfo({
    gate: { reparto: { motivos_deny: [], required: true } }
  });
  assert(porReparto.requireRepartoLive === true, 'dato por gate.reparto.required → true (ruta que el espejo ignoraba)');

  const precedencia = parseEditorInfo({
    gate: { reparto_required: false, reparto: { motivos_deny: [], required: true } }
  });
  assert(precedencia.requireRepartoLive === false, 'gate.reparto_required manda sobre reparto.required');

  // Tipo equivocado NO es dato: `!!'sí'` sería `true` — la trampa del espejo.
  const tipoMalo = parseEditorInfo({
    gate: { reparto_required: 'sí', reparto: { motivos_deny: [], required: 'sí' } }
  });
  assert(tipoMalo.requireRepartoLive === null, 'reparto_required no-booleano → null (no se coacciona con !!)');

  // --- Política ante AUSENCIA: se LEE del parser, no se clava aquí. --------
  // WP-V17 la está invirtiendo (hoy abierto → cerrado). Lo que el probe sí
  // exige es que no se invente el dato y que la política sea una sola.
  const ausenteA = parseEditorInfo({ gate: { reparto: { motivos_deny: [] } } });
  const ausenteB = parseEditorInfo({
    gate: { visible: true, gate_line: 'x', reparto: { motivos_deny: [], permiso: 'p' } }
  });
  assert(ausenteA.requireRepartoLive === null, 'ausencia total del dato → requireRepartoLive null');
  assert(tipoMalo.gate.repartoRequired === ausenteA.gate.repartoRequired, 'tipo inválido se trata como ausencia');
  assert(
    ausenteA.gate.repartoRequired === ausenteB.gate.repartoRequired,
    `política de ausencia consistente entre formas (observada: repartoRequired=${ausenteA.gate.repartoRequired})`
  );
  console.log(
    `NOTA: política del parser ante ausencia de dato → repartoRequired=${ausenteA.gate.repartoRequired} ` +
      '(leída de la pieza real, no fijada por el probe — WP-V17 la puede invertir)'
  );
}

// --- Deny sin efecto colateral ---
{
  const denied = {
    ok: false,
    error: 'Mutation refused: server policy requires a reparto',
    rule: 'linea-editor.reparto_requerido',
    gate: {
      tool: 'crear_linea',
      reparto_required: true,
      reparto: { motivo: 'reparto_requerido' }
    },
    decision: { ok: false, motivo: 'reparto_requerido' }
  };
  assert(isDeniedWithoutWrite(denied), 'deny sin lineDir/refs → sin efecto escritura');
  assert(!isDeniedWithoutWrite({ ...denied, lineDir: '/tmp/LEAK' }), 'con lineDir NO cuenta como deny-sin-escritura');
  assert(!isDeniedWithoutWrite({ ...denied, outPath: '/tmp/LEAK.md' }), 'con outPath NO cuenta como deny-sin-escritura');
  assert(
    !isDeniedWithoutWrite({ ...denied, refs: { linea: 'L-1' } }),
    'con refs.linea NO cuenta como deny-sin-escritura'
  );
  assert(!isDeniedWithoutWrite({ ok: true }), 'ok:true no es un deny');
  assert(!isDeniedWithoutWrite(null), 'null no es un deny');

  // Extracción del motivo: las tres rutas y el vacío.
  assert(extractMotivoFromDeny(denied) === 'reparto_requerido', 'motivo desde decision.motivo');
  assert(
    extractMotivoFromDeny({ ok: false, gate: { reparto: { motivo: 'seat_ausente' } } }) === 'seat_ausente',
    'motivo desde gate.reparto.motivo'
  );
  assert(
    extractMotivoFromDeny({ ok: false, rule: 'linea-editor.reparto_card_no_vigente' }) === 'card_no_vigente',
    'motivo derivado de rule'
  );
  assert(extractMotivoFromDeny({ ok: false }) === undefined, 'sin pistas → undefined (no inventa motivo)');
}

/** Source guard: código de producción no hardcodea la lista de 8 motivos. */
{
  const roots = [
    path.join(pkgRoot, 'src/mutation'),
    path.join(pkgRoot, 'src/treeViews/mcpTreeView.ts'),
    path.join(pkgRoot, 'src/core/extensionBootstrap.ts')
  ];
  const banned =
    /motivos_deny\s*[:=]\s*\[\s*['"]reparto_requerido['"]\s*,\s*['"]card_no_vigente['"]/;
  let hits = 0;
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    const files = fs.statSync(root).isDirectory()
      ? fs.readdirSync(root).map((f) => path.join(root, f))
      : [root];
    for (const f of files) {
      if (!f.endsWith('.ts') && !f.endsWith('.js')) continue;
      const text = fs.readFileSync(f, 'utf8');
      if (banned.test(text)) {
        hits += 1;
        console.error(`FAIL hardcode en ${f}`);
      }
    }
  }
  assert(hits === 0, 'código V08 no hardcodea array motivos_deny de 8');
}

// --- Tools declarados en package / src ---
{
  const pkg = JSON.parse(fs.readFileSync(path.join(pkgRoot, 'package.json'), 'utf8'));
  const cmds = (pkg.contributes?.commands || []).map((c) => c.command);
  assert(cmds.includes('aleph0.authorship.refreshGate'), 'command refreshGate');
  assert(cmds.includes('aleph0.authorship.crearLinea'), 'command crearLinea');
  assert(cmds.includes('aleph0.authorship.exportStoryBoard'), 'command exportStoryBoard');
  assert(
    pkg.contributes?.configuration?.properties?.['aleph0.pieza.lineaEditor.port'] != null,
    'setting aleph0.pieza.lineaEditor.port'
  );
  assert(pkg.scripts?.['probe:v08'] != null, 'script probe:v08');
  assert(pkg.scripts?.['probe:v08:build'] != null, 'script probe:v08:build (compila la pieza real)');
}

// --- Smoke vivo opcional (z-sdk SOLO LECTURA; no bloquea) ---
async function tryLiveSmoke() {
  const host = process.env.ZIGURAT_LINEA_EDITOR_HOST || '127.0.0.1';
  const port = Number(process.env.ZIGURAT_LINEA_EDITOR_PORT || 4115);
  const requireReparto = process.env.ZEUS_LINEA_EDITOR_REQUIRE_REPARTO;

  const reachable = await new Promise((resolve) => {
    const req = http.get({ host, port, path: '/mcp', timeout: 1200 }, (res) => {
      res.resume();
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });

  if (!reachable) {
    console.log(
      `⏳ linea-editor ${host}:${port} ECONNREFUSED/timeout — smoke vivo no ejecutado`
    );
    if (requireReparto == null || requireReparto === '') {
      console.log(
        '⏳ ZEUS_LINEA_EDITOR_REQUIRE_REPARTO ausente — demo verde/rojo documentada como pendiente'
      );
    }
    return;
  }

  console.log(`SMOKE: linea-editor alcanzable en ${host}:${port}`);
  if (requireReparto == null || String(requireReparto).trim() === '') {
    console.log(
      '⏳ runtime alcanzable pero ZEUS_LINEA_EDITOR_REQUIRE_REPARTO ausente — demo verde/rojo ⏳'
    );
    return;
  }
  console.log(
    `SMOKE: ${'ZEUS_LINEA_EDITOR_REQUIRE_REPARTO'}=${requireReparto} (demo verde/rojo requiere tools/call MCP; ⏳ parcial sin cliente MCP en probe)`
  );
}

await tryLiveSmoke();

// Guard: no archivos V09 en el diff de obra (elenco)
{
  const v09Leak = ['cast-table', 'panel-elenco', 'ICompany', 'filasCastDesdeReparto'];
  const mutDir = path.join(pkgRoot, 'src/mutation');
  let leak = 0;
  if (fs.existsSync(mutDir)) {
    for (const f of fs.readdirSync(mutDir)) {
      const text = fs.readFileSync(path.join(mutDir, f), 'utf8');
      for (const p of v09Leak) {
        if (text.includes(p)) {
          leak += 1;
          console.error(`FAIL V09 leak (${p}) en ${f}`);
        }
      }
    }
  }
  assert(leak === 0, 'cero fuga V09 (elenco/cast/ICompany) en src/mutation');
}

if (failed > 0) {
  console.error(`\nWP-V08 probe FAIL (${failed})`);
  process.exit(1);
}
console.log('\nWP-V08 probe PASS (automatizado · pieza real de src/mutation/parseEditorInfo.ts)');
process.exit(0);
