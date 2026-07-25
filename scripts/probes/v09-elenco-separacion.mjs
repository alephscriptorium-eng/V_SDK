#!/usr/bin/env node
/**
 * Probe WP-V09 · elenco + separación
 *
 * - filasCastDesdeReparto de @zeus/reparto-kit (reutiliza, no copia)
 * - Schema filas = cast-table { participant, role, oldid }
 * - Hostil-omite: sin reparto / shape inválido
 * - Separación: ICompany no es fuente de filas
 * - cast-table widget de @zeus/view-kit consume filas (si disponible)
 *
 * Exit 0 si probes automatizados PASS.
 */
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const pkgRoot = process.cwd();

const {
  filasCastDesdeReparto,
  isRepartoShaped,
  crearReparto,
  REPARTO_VERSION,
} = await import(
  pathToFileURL(
    path.join(pkgRoot, 'node_modules/@zeus/reparto-kit/src/index.mjs')
  ).href
);

const { ssbIdFromPublicKeyBytes } = await import(
  pathToFileURL(
    path.join(pkgRoot, 'node_modules/@zeus/protocol/src/peer-card.mjs')
  ).href
);

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    failed += 1;
  } else {
    console.log(`PASS: ${msg}`);
  }
}

/** Espejo de RepartoElencoService.projectFromReparto (hostil-omite). */
function projectFromReparto(reparto) {
  if (reparto == null) {
    return { ok: false, rows: [], reason: 'pending_reparto' };
  }
  if (!isRepartoShaped(reparto)) {
    return { ok: false, rows: [], reason: 'pending_shape' };
  }
  return { ok: true, rows: filasCastDesdeReparto(reparto) };
}

const ssb = (seed) => ssbIdFromPublicKeyBytes(Buffer.alloc(32, seed));
const ACTOR = ssb(0xc3);

const repartoDemo = crearReparto({
  personajes: [
    { id: 'pj-prota', nombre: 'Protagonista', rol: 'protagonista' },
    { id: 'pj-fig', nombre: 'Figurante', rol: 'figurante' },
  ],
  asignaciones: [{ actorSsbId: ACTOR, personajeId: 'pj-prota' }],
  politica: {
    protagonista: ['reparto:leer'],
    figurante: ['reparto:leer'],
  },
});

assert(REPARTO_VERSION === 'reparto/1', 'REPARTO_VERSION = reparto/1');

// Hostil-omite
const omit = projectFromReparto(null);
assert(omit.ok === false && omit.reason === 'pending_reparto', 'hostil-omite sin reparto → pending_reparto');

const badShape = projectFromReparto({ version: 'reparto/1', personajes: 'nope' });
assert(
  badShape.ok === false && badShape.reason === 'pending_shape',
  'hostil-omite shape inválido → pending_shape'
);

// Proyección real
const proj = projectFromReparto(repartoDemo);
assert(proj.ok === true, 'proyección ok desde reparto/1');
assert(
  Array.isArray(proj.rows) &&
    proj.rows.length === 2 &&
    proj.rows[0].participant === ACTOR &&
    proj.rows[0].role === 'protagonista' &&
    proj.rows[0].oldid === 'pj-prota' &&
    proj.rows[1].participant === '' &&
    proj.rows[1].oldid === 'pj-fig',
  'filasCastDesdeReparto → schema cast-table'
);

// Fixture del repo
const fixturePath = path.join(pkgRoot, 'fixtures/reparto-v1-demo.json');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
assert(isRepartoShaped(fixture), 'fixture reparto-v1-demo.json shape ok');
const fromFixture = filasCastDesdeReparto(fixture);
assert(
  fromFixture.length === 2 && fromFixture[0].oldid === 'pj-prota',
  'fixture → filas cast-table'
);

// Separación ICompany: el modelo B no produce filas de cast-table
const fakeCompany = {
  id: 'framework-retro',
  name: 'Framework Retro',
  agents: [{ id: 'isaac', name: 'Isaac' }],
};
const fromCompany = projectFromReparto(fakeCompany);
assert(
  fromCompany.ok === false && fromCompany.reason === 'pending_shape',
  'separación: ICompany-like NO es reparto/1'
);

// Documentación de dos modelos presente
const dosModelos = path.join(pkgRoot, 'src/elenco/DOS-MODELOS.md');
assert(fs.existsSync(dosModelos), 'DOS-MODELOS.md existe');
const doc = fs.readFileSync(dosModelos, 'utf8');
assert(
  /reparto\/1/.test(doc) && /ICompany/.test(doc) && /[Ss]epar/.test(doc),
  'DOS-MODELOS menciona reparto/1, ICompany y separación'
);

// cast-table widget real de view-kit (si instalado vía dep transitiva)
try {
  const widgetsUrl = pathToFileURL(
    path.join(pkgRoot, 'node_modules/@zeus/view-kit/src/widgets.mjs')
  ).href;
  const { renderCastTableWidget, CAST_TABLE_WIDGET_IDS } = await import(widgetsUrl);
  assert(
    CAST_TABLE_WIDGET_IDS.includes('cast-table') &&
      CAST_TABLE_WIDGET_IDS.includes('panel-elenco'),
    'CAST_TABLE_WIDGET_IDS = cast-table + panel-elenco'
  );

  function fakeDoc() {
    function make(tag) {
      return {
        tagName: tag,
        children: [],
        attrs: {},
        id: '',
        className: '',
        textContent: '',
        parentNode: null,
        appendChild(c) {
          this.children.push(c);
          c.parentNode = this;
          return c;
        },
        setAttribute(k, v) {
          this.attrs[k] = v;
        },
        remove() {},
      };
    }
    return { createElement: make };
  }

  const docDom = fakeDoc();
  const mount = docDom.createElement('div');
  const inst = renderCastTableWidget({
    doc: docDom,
    mount,
    id: 'cast-table',
    data: { title: 'reparto', rows: proj.rows },
  });
  assert(inst.el.attrs['data-widget-id'] === 'cast-table', 'view-kit cast-table renderiza filas');
} catch (err) {
  console.log(`⏳ view-kit cast-table: ${err.message}`);
}

// z-sdk SOLO LECTURA: si existe clone local, citar contrato sin mutar
const zSdkFilas = path.resolve(pkgRoot, '../../z-sdk/packages/engine/reparto-kit/src/filas.mjs');
const zAlt = 'C:/S_LAB/z-sdk/packages/engine/reparto-kit/src/filas.mjs';
const zPath = fs.existsSync(zSdkFilas) ? zSdkFilas : fs.existsSync(zAlt) ? zAlt : null;
if (zPath) {
  const src = fs.readFileSync(zPath, 'utf8');
  assert(src.includes('filasCastDesdeReparto'), `z-sdk RO: filas.mjs visible (${zPath})`);
} else {
  console.log('⏳ z-sdk local no visible — dependencia npm @zeus/reparto-kit usada');
}

// Prohibido tocar superficie V08 en código de elenco (solo .ts; el doc
// puede nombrar la frontera como prohibición).
const elencoDir = path.join(pkgRoot, 'src/elenco');
for (const f of fs.readdirSync(elencoDir)) {
  if (!f.endsWith('.ts')) continue;
  const body = fs.readFileSync(path.join(elencoDir, f), 'utf8');
  assert(
    !/motivos_deny|editor:\/\/info|crear_linea|linea-editor/.test(body),
    `V09 no toca superficie V08 en ${f}`
  );
}

if (failed > 0) {
  console.error(`\nprobe:v09 FAIL (${failed})`);
  process.exit(1);
}
console.log('\nprobe:v09 PASS');
process.exit(0);
