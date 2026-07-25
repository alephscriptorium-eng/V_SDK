#!/usr/bin/env node
/**
 * Probe WP-V08 · Mutación + autoría (fases 3-4)
 *
 * - motivos_deny LEÍDOS de editor://info (no hardcode de los 8)
 * - hostil-omite: sin info / sin motivos_deny → pending, no inventa lista
 * - deny sin efecto de escritura (ok:false sin lineDir/refs)
 * - smoke vivo linea-editor + ZEUS_LINEA_EDITOR_REQUIRE_REPARTO → verde/rojo o ⏳
 *
 * Exit 0 si probes automatizados PASS (runtime vivo opcional).
 */
import http from 'node:http';
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';

const pkgRoot = process.cwd();
const require = createRequire(import.meta.url);

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    failed += 1;
  } else {
    console.log(`PASS: ${msg}`);
  }
}

/** Espejo de src/mutation/parseEditorInfo.ts (misma política: no hardcode). */
function parseEditorInfo(raw) {
  if (raw == null) {
    return {
      ok: false,
      pendingReason: '⏳ editor://info omitido',
      mutationTools: [],
      gate: null,
      motivosDeny: []
    };
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    return {
      ok: false,
      pendingReason: '⏳ editor://info malformado',
      mutationTools: [],
      gate: null,
      motivosDeny: []
    };
  }
  const mutationTools = Array.isArray(raw.mutationTools)
    ? raw.mutationTools.filter((t) => typeof t === 'string')
    : [];
  const g = raw.gate;
  if (g == null || typeof g !== 'object') {
    return {
      ok: false,
      pendingReason: '⏳ editor://info sin gate',
      mutationTools,
      gate: null,
      motivosDeny: []
    };
  }
  const reparto =
    g.reparto != null && typeof g.reparto === 'object' ? g.reparto : null;
  const motivosDeny =
    reparto && Array.isArray(reparto.motivos_deny)
      ? reparto.motivos_deny.filter((m) => typeof m === 'string')
      : [];
  if (!reparto || !Array.isArray(reparto.motivos_deny)) {
    return {
      ok: false,
      pendingReason: '⏳ motivos_deny ausente (no hardcode)',
      mutationTools,
      gate: g,
      motivosDeny: [],
      requireRepartoLive: typeof g.reparto_required === 'boolean' ? g.reparto_required : null
    };
  }
  return {
    ok: true,
    mutationTools,
    gate: g,
    motivosDeny,
    requireRepartoLive: !!g.reparto_required
  };
}

function isDeniedWithoutWrite(payload) {
  if (payload == null || typeof payload !== 'object') return false;
  if (payload.ok !== false) return false;
  if (payload.lineDir != null || payload.outPath != null) return false;
  if (payload.refs?.linea != null) return false;
  return true;
}

function representMotivoDeny(motivo, known) {
  return known.includes(motivo)
    ? `deny · ${motivo}`
    : `deny · ${motivo} (no estaba en motivos_deny de editor://info)`;
}

/** Source guard: código de producción no hardcodea la lista de 8 motivos. */
function assertNoHardcodedMotivosInSrc() {
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

console.log('=== WP-V08 probe · mutación + autoría ===');

// --- Hostil-omite: sin editor://info ---
{
  const p = parseEditorInfo(null);
  assert(!p.ok && p.motivosDeny.length === 0, 'hostil-omite sin editor://info → sin motivos');
}

// --- Hostil-omite: gate sin motivos_deny ---
{
  const p = parseEditorInfo({
    name: 'linea-editor',
    mutationTools: ['crear_linea', 'export_story_board'],
    gate: { visible: true, gate_line: 'x', reparto_required: true, reparto: { permiso: 'reparto:interpretar' } }
  });
  assert(
    !p.ok && p.motivosDeny.length === 0,
    'hostil-omite sin motivos_deny → pending (no inventa 8)'
  );
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
    mutationTools: ['crear_linea', 'export_story_board'],
    gate: {
      visible: true,
      gate_line: 'approve + token',
      reparto_required: true,
      reparto_policy_env: 'ZEUS_LINEA_EDITOR_REQUIRE_REPARTO',
      reparto: {
        motivos_deny: fixtureMotivos,
        permiso: 'reparto:interpretar',
        required: true
      }
    }
  };
  const p = parseEditorInfo(info);
  assert(p.ok, 'editor://info con motivos_deny → ok');
  assert(p.motivosDeny.length === 8, `8 motivos desde runtime (got ${p.motivosDeny.length})`);
  assert(
    fixtureMotivos.every((m) => p.motivosDeny.includes(m)),
    'los 8 motivos del fixture representados textualmente'
  );
  const texts = p.motivosDeny.map((m) => representMotivoDeny(m, p.motivosDeny));
  assert(
    texts.every((t) => t.startsWith('deny · ')),
    'representación textual de cada motivo'
  );
  assert(p.requireRepartoLive === true, 'reparto_required reflejado desde info');
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
  assert(p.ok && p.motivosDeny.length === 2, 'lista del servidor manda (N=2, no fuerza 8)');
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
  const leaked = { ...denied, lineDir: '/tmp/LEAK' };
  assert(!isDeniedWithoutWrite(leaked), 'con lineDir NO cuenta como deny-sin-escritura');
}

assertNoHardcodedMotivosInSrc();

// --- Tools declarados en package / src ---
{
  const pkg = require(path.join(pkgRoot, 'package.json'));
  const cmds = (pkg.contributes?.commands || []).map((c) => c.command);
  assert(cmds.includes('zigurat.authorship.refreshGate'), 'command refreshGate');
  assert(cmds.includes('zigurat.authorship.crearLinea'), 'command crearLinea');
  assert(cmds.includes('zigurat.authorship.exportStoryBoard'), 'command exportStoryBoard');
  assert(
    pkg.contributes?.configuration?.properties?.['zigurat.lineaEditor.port'] != null,
    'setting zigurat.lineaEditor.port'
  );
  assert(pkg.scripts?.['probe:v08'] != null, 'script probe:v08');
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
console.log('\nWP-V08 probe PASS (automatizado)');
process.exit(0);
