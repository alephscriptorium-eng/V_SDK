# WP-V92 · Citas rancias en los reportes

| dato | valor |
| ---- | ----- |
| rama | `wp/v92-citas-rancias` |
| alcance del diff | `plan/REPORTES/**` — **cero** código, cero `scripts/`, cero `plan/BACKLOG.md` |
| encargo | 3 citas denunciadas por V90 |
| entregado | **27** citas rancias localizadas y anotadas, sobre un denominador de **1518** |
| veredicto del barrido | `RANCIA = 0` · `exit 0` · re-ejecutable |
| estado propuesto | listo para revisión |

---

## 0 · El encargo y por qué no bastaba

El encargo traía tres líneas. Las tres son reales y están corregidas. Pero
«arreglé tres» no es una afirmación comprobable: no dice **de cuántas**. Este WP
sustituye el número tres por un **denominador** y por un instrumento que lo
vuelve a medir cuando alguien quiera.

Las tres denunciadas, localizadas por contenido (las líneas habían derivado):

| # | denuncia | dónde estaba de verdad |
| - | -------- | ---------------------- |
| 1 | V66 «~813», test de un fichero que V90 borró | `WP-V66-seguridad-webviews.md:813` — la línea no se había movido |
| 2 | V23 «~1375» | **no era una cita rancia**: `:1375` está dentro de un bloque `$ git diff …`, es transcripción de una orden ejecutada entonces. La cita rancia de esa zona es **`:1385`** |
| 3 | V23 «~1385-1386» | `:1385` y `:1386`, correctas ambas |

Es decir: de las tres denunciadas, **una estaba mal denunciada** y el barrido lo
demuestra en vez de discutirlo. Ver §3, clase `TRANSCRIP`.

---

## 1 · El instrumento

`ALCANCE_DIFF` prohíbe tocar `scripts/`, así que el barrido **no vive en el
árbol**: vive aquí, literal y completo, y se ejecuta copiándolo a un fichero
suelto. Que no tenga casa es deuda, y va enrutada en §6 (**E-4**).

```
$ node barrido-citas.mjs .              # los reportes
$ AMBITO=plan node barrido-citas.mjs .  # los documentos vivos de plan/
$ VERBOSE=1 …                           # detalle de cada cita que no resuelve
```

### 1.1 · La idea: git decide, no yo

Una cita `ruta:línea` que no resuelve puede ser dos cosas muy distintas, y
confundirlas es lo que hace inútil a un barrido de este tipo:

- la cita **ya era imposible cuando se escribió el reporte** → el que escribía
  lo sabía, y lo escribió a propósito: es un **acta**, no un error;
- la cita **era buena y dejó de serlo** → **se pudrió**: deuda.

Eso no se juzga a ojo. Se pregunta a git, y hay **dos** preguntas según lo que
falle, la ruta o la coordenada:

```
nace(reporte) = git log --diff-filter=A -1 -- <ambito>/<informe>   (o HEAD si aun no esta commiteado)

# (a) el fichero YA NO EXISTE
muere(fichero) = git log --diff-filter=D -1 -- <ruta>
ACTA si   git merge-base --is-ancestor  muere(fichero)  nace(reporte)

# (b) el fichero SIGUE VIVO y lo que no cuadra es la linea
lineas0 = git show <nace(reporte)>:<ruta> | wc -l
ACTA si   linea_citada > lineas0        # ya no cabia el dia que se escribio
```

La rama (b) es la que da respetabilidad al veredicto sobre la **deriva de
línea**, que es la mitad silenciosa del problema. Comprobada en tres puntos
independientes:

| reporte | `package.json` al nacer | cita | veredicto | ¿correcto? |
| ------- | ----------------------- | ---- | --------- | ---------- |
| `WP-V12` (`a1fa0c8`) | **1527** líneas | `:1446`, `:1494` | `RANCIA` | sí — cabían entonces, hoy no |
| `WP-V68` (`cfef34c`) | **1292** líneas | `:1271` | `RANCIA` | sí — cabía entonces, hoy no |
| este reporte (HEAD) | **1248** líneas | `:1446` (citada al describir el defecto) | `ACTA` | sí — no cabía ya al escribirla |

Sin la rama (b), este mismo reporte se denunciaba a sí mismo por **citar el
defecto que documenta**. Un barrido que no distingue «mencionar una cita rota»
de «tener una cita rota» obliga a mentir para pasar.

### 1.2 · Las cinco clases

| clase | criterio | por qué no es deuda |
| ----- | -------- | ------------------- |
| `TRANSCRIP` | la cita está dentro de un bloque de código | es **evidencia grabada**: la salida literal de una orden que se ejecutó ese día. Se lee en pasado. Reescribirla sería falsificar la prueba |
| `ANOTADA` | la línea ya declara su caducidad (`FICHERO BORRADO`, `⛔`, …) | ya se corrigió — así quedan las 27 de este WP |
| `EFIMERA` | el fichero **nunca** estuvo en el árbol | sonda, vector de prueba o propuesta: `src/__probe__.ts`, `tests/unit/inventado.test.ts`, `scripts/tests/arnes.ts` |
| `ACTA` | la cita ya era imposible al nacer el reporte — §1.1 (a) o (b) | el reporte **es** el acta de esa muerte (todo `WP-V13-poda.md`), o la menciona para documentarla |
| `RANCIA` | la cita era buena al nacer el reporte y hoy no | **deuda.** Caducó sin que nadie la tocara |

### 1.3 · Tres errores del propio instrumento, y lo que costaron

Se dejan escritos porque son la parte instructiva:

1. **`js` antes que `json` en la alternancia del regex.** `fixtures/x.json`
   casaba como `fixtures/x.js` → «fichero inexistente». **10 falsos positivos.**
   El regex ahora ordena las extensiones de más larga a más corta.
2. **Los ficheros de raíz se citan sin barra.** `package.json:1446`,
   `jest.config.js:12`, `.vscodeignore:28` no tenían `/`, así que el patrón
   —que exigía al menos un directorio— **no los miraba**. Eran **367 citas
   fuera del denominador**, y al entrar aparecieron **5 rancias nuevas** que
   nadie había visto. Un barrido con un denominador incompleto es peor que
   ninguno, porque da un `PASS` que no significa nada.
3. **El prefijo de mundo.** ``z:`plan/BACKLOG.md:248` `` es el BACKLOG **de Z**,
   no el mío. Sin detectarlo, las **12** citas del `LEXICO-ZIGURAT.md` salían
   rancias por comprobarlas contra el árbol equivocado. Fue el falso positivo
   más caro: estuve a punto de enrutar como hallazgo un defecto inexistente.

### 1.4 · El barrido, literal

```js
#!/usr/bin/env node
/* barrido-citas.mjs — barrido de citas rancias en plan/REPORTES/**
 *
 * Una cita `ruta[:linea]` en un reporte es comprobable: o resuelve contra el
 * arbol, o no. Este barrido las extrae todas, las resuelve, y para las que no
 * resuelven decide con git —no a ojo— si la cita nacio muerta o se pudrio.
 * Dos preguntas, segun falle la ruta o la coordenada:
 *
 *   (a) el fichero ya no existe:
 *       muere(fichero) <= nace(reporte)  -> ACTA   (el que escribia lo sabia)
 *       muere(fichero) >  nace(reporte)  -> RANCIA (era cierta y caduco)
 *
 *   (b) el fichero sigue vivo, no cuadra la linea:
 *       linea_citada >  lineas_en(nace(reporte))  -> ACTA   (ya no cabia)
 *       linea_citada <= lineas_en(nace(reporte))  -> RANCIA (cabia y dejo de caber)
 *
 * Sin (b) este barrido denuncia al reporte que DOCUMENTA una cita rota por el
 * hecho de mencionarla, y entonces hay que mentir para pasarlo.
 *
 * Solo las RANCIA son deuda: se anotan in situ con la marca ⛔ + por que caduco,
 * y entonces pasan a ANOTADA. Cualquier RANCIA viva es FAIL con exit 1.
 *
 * uso:  node barrido-citas.mjs [raiz-del-repo]
 *       VERBOSE=1   detalle de cada cita que no resuelve, por clase
 *       AMBITO=plan barrer los documentos vivos de plan/ en vez de los reportes
 *       JSON_OUT=f  volcar las rancias a JSON (lo consume anotar.mjs)
 */
import { readFileSync, readdirSync, existsSync, statSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve, sep } from 'node:path';

const ROOT = resolve(process.argv[2] ?? '.');
const REPORTES = join(ROOT, ...(process.env.AMBITO ?? 'plan/REPORTES').split('/'));

// ---- 1. que cuenta como cita a este repo -----------------------------------
const TOPDIRS = ['src', 'tests', 'scripts', 'plan', 'docs', 'fixtures',
                 'media', 'schemas', 'sincronia', '.github'];
// OJO: alternancia de mas larga a mas corta — `js` antes que `json` casaria `.js`
const EXT = 'jsonc|json|tsx|yaml|snap|vsix|html|yml|mjs|cjs|css|log|txt|ts|js|md';
// los ficheros de raiz (package.json, jest.config.js, .vscodeignore...) se citan sin
// barra: sin esta rama se quedaban FUERA del denominador y no se comprobaba ni uno.
const RAIZ = readdirSync(ROOT, { withFileTypes: true })
  .filter(d => d.isFile()).map(d => d.name)
  .sort((a, b) => b.length - a.length)                 // mas larga primero
  .map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
const RE = new RegExp(
  `(?<![\\w./-])((?:\\.?/)?(?:[\\w.@-]+/)+[\\w.@-]+\\.(?:${EXT})|${RAIZ.join('|')})` +
  `(?::(\\d+(?:[-,]\\d+)*))?`, 'g');

const git = (...a) => { try { return execFileSync('git', ['-C', ROOT, ...a], { encoding: 'utf8' }).trim(); } catch { return ''; } };
const memo = (fn, c = new Map()) => k => (c.has(k) || c.set(k, fn(k)), c.get(k));

const muere   = memo(p => git('log', '--diff-filter=D', '-1', '--format=%H', '--', p));
const existio = memo(p => git('log', '--all', '-1', '--format=%H', '--', p) !== '');
// un reporte aun sin commitear se esta escribiendo AHORA: nace en HEAD. Sin este
// fallback, el reporte que documenta una poda se denuncia a si mismo por citarla.
const nace    = memo(f => git('log', '--diff-filter=A', '-1', '--format=%H', '--',
                             `${(process.env.AMBITO ?? 'plan/REPORTES')}/${f}`) || git('rev-parse', 'HEAD'));
// cuantas lineas tenia <ruta> en <commit>  (-1 si no se puede saber)
const lineasEn = memo(k => { const i = k.indexOf('\0'); const t = git('show', `${k.slice(0, i)}:${k.slice(i + 1)}`); return t ? t.split('\n').length : -1; },
                      new Map());
const esAncestro = (a, b) => {                    // ¿a es ancestro-o-igual de b?
  if (!a || !b) return false;
  if (a === b) return true;
  try { execFileSync('git', ['-C', ROOT, 'merge-base', '--is-ancestor', a, b], { stdio: 'ignore' }); return true; }
  catch { return false; }
};

// ---- 2. barrido -------------------------------------------------------------
const informes = readdirSync(REPORTES).filter(f => f.endsWith('.md')).sort();
const nLineas = memo(abs => { try { return readFileSync(abs, 'utf8').split('\n').length; } catch { return -1; } });

const B = { total: 0, ok: 0, ajena: 0, noResuelve: 0 };
const noOk = [];

// una cita que YA declara su caducidad en la misma linea no es deuda: esta anotada
const MARCA = /FICHERO BORRADO|fichero borrado|⛔|ya no existe|CADUCADA|BORRADO ENTERO/i;

for (const inf of informes) {
  let enBloque = false;
  readFileSync(join(REPORTES, inf), 'utf8').split('\n').forEach((linea, i) => {
    if (/^\s*(```|~~~)/.test(linea)) { enBloque = !enBloque; return; }
    for (const m of linea.matchAll(RE)) {
      const ruta = m[1].replace(/^\.\//, ''), spec = m[2];
      B.total++;
      // prefijo de mundo:  z:`plan/BACKLOG.md:248`  es el BACKLOG de Z, no el mio.
      // Sin esto, 12 citas del LEXICO salian «rancias» por comprobarlas contra el
      // arbol equivocado — el falso positivo mas caro del barrido.
      const ajenaPorMundo = /\b[a-z]{1,3}:`?$/.test(linea.slice(0, m.index));
      if (ajenaPorMundo || (ruta.includes('/') && !TOPDIRS.includes(ruta.split('/')[0]))) { B.ajena++; continue; }
      const abs = join(ROOT, ruta.split('/').join(sep));
      const hay = existsSync(abs) && statSync(abs).isFile();
      let motivo = null;
      if (!hay) motivo = 'fichero inexistente';
      else if (spec) {
        const max = nLineas(abs), fuera = spec.split(/[-,]/).map(Number).filter(n => n > max);
        if (fuera.length) motivo = `linea ${fuera.join(',')} > ${max} lineas`;
      }
      if (!motivo) { B.ok++; continue; }
      B.noResuelve++;
      noOk.push({ inf, ln: i + 1, cita: ruta + (spec ? ':' + spec : ''), ruta, motivo, hay,
                  maxCitada: spec ? Math.max(...spec.split(/[-,]/).map(Number)) : 0,
                  txt: linea.trim(), enBloque, marcada: MARCA.test(linea) });
    }
  });
}

// ---- 3. dictamen automatico por git ----------------------------------------
for (const c of noOk) {
  c.mata = muere(c.ruta).slice(0, 7);
  if (c.enBloque)            c.clase = 'TRANSCRIP';         // evidencia grabada, se lee en pasado
  else if (c.marcada)        c.clase = 'ANOTADA';           // la propia linea declara que caduco
  else if (!existio(c.ruta)) c.clase = 'EFIMERA';           // nunca estuvo en el arbol
  else if (c.hay) {
    // el fichero SIGUE vivo: lo que no resuelve es la coordenada. Mismo principio
    // que arriba, aplicado a la deriva de linea: ¿valia la coordenada al escribirse?
    const max0 = lineasEn(nace(c.inf) + '\0' + c.ruta);
    c.clase = (max0 > 0 && c.maxCitada > max0) ? 'ACTA'     // ya no valia: se sabia
                                               : 'RANCIA';  // valia y se pudrio
  }
  else if (esAncestro(muere(c.ruta), nace(c.inf))) c.clase = 'ACTA';  // ya no estaba al escribir
  else                       c.clase = 'RANCIA';            // era cierta y caduco: DEUDA
}

// ---- 4. salida -------------------------------------------------------------
const n = k => noOk.filter(c => c.clase === k).length;
const rancias = noOk.filter(c => c.clase === 'RANCIA');

console.log(`ambito                       : ${process.env.AMBITO ?? 'plan/REPORTES'}`);
console.log(`documentos barridos          : ${informes.length}`);
console.log(`citas ruta[:linea] extraidas : ${B.total}    <-- DENOMINADOR`);
console.log(`  resuelven contra el arbol  : ${B.ok}`);
console.log(`  ajenas a este repo         : ${B.ajena}    (otro mundo; no verificables aqui)`);
console.log(`  NO resuelven               : ${B.noResuelve}`);
console.log(`    TRANSCRIP (en bloque cod): ${n('TRANSCRIP')}   evidencia grabada, pasado`);
console.log(`    ANOTADA  (marca en linea): ${n('ANOTADA')}   ya declara su caducidad`);
console.log(`    EFIMERA  (nunca existio) : ${n('EFIMERA')}   sonda/vector/propuesta`);
console.log(`    ACTA     (muere<=reporte): ${n('ACTA')}   el que escribia ya lo sabia`);
console.log(`    RANCIA   (muere >reporte): ${n('RANCIA')}   <-- DEUDA, debe ser 0`);

if (process.env.VERBOSE)
  for (const k of ['RANCIA', 'ACTA', 'EFIMERA', 'ANOTADA', 'TRANSCRIP'])
    for (const c of noOk.filter(x => x.clase === k))
      console.log(`[${k.padEnd(9)}] ${c.inf}:${c.ln}  ${c.cita}  (mata:${c.mata || '-'})\n            | ${c.txt.slice(0, 130)}`);

if (rancias.length) {
  console.log('\n--- RANCIAS SIN ANOTAR (anadir la marca ⛔ junto a la cita) ---');
  for (const c of rancias) console.log(`${c.inf}:${c.ln}  ${c.cita}  [${c.motivo}]\n     | ${c.txt.slice(0, 140)}`);
}
if (process.env.JSON_OUT)
  writeFileSync(process.env.JSON_OUT,
    JSON.stringify(rancias.map(c => ({ inf: c.inf, ln: c.ln, cita: c.cita })), null, 1));
console.log(rancias.length ? '\nVEREDICTO: FAIL' : '\nVEREDICTO: PASS');
process.exit(rancias.length ? 1 : 0);
```

---

## 2 · La corrección se aplicó con un segundo script, no a mano

26 ediciones a mano en 9 reportes es un sitio excelente para colar una errata.
Se hicieron con `anotar.mjs`, que consume el **JSON del propio barrido** — así la
corrección no puede tocar una línea que el barrido no haya señalado, y en
particular **no puede tocar un bloque de transcripción**.

```js
/* anotar.mjs — anota in situ las citas rancias que localiza barrido-citas.mjs.
 * Conserva lo que se dijo; anade por que caduco. No borra una sola palabra.
 *   node barrido-citas.mjs . ; JSON_OUT=rancias.json  ->  node anotar.mjs . rancias.json
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const R = join(process.argv[2] ?? '.', 'plan', 'REPORTES');

// nota por RUTA citada: quien la mato.
// SIN ** : la marca se inserta a veces dentro de un tramo YA en negrita, y
// un ** anidado rompe el render del reporte que se pretendia arreglar.
const NOTA = {
  'docs/GUIA-PRUEBA-v1.md': 'retirada por V15 (`808be04`); hoy `docs/GUIA-PRUEBA-v2.md`',
  'src/mcpChatParticipant.ts': 'podado por V13 (`f6ae634`, DV-11)',
  'src/core/configurationCommandsService.ts': 'podado por V13 (`9172d07`)',
  'src/theatrical/core/schemas/agent.schema.json': 'podado por V13 (`c164731`)',
  'media/ICON_CREATION_GUIDE.md': 'borrado por V14 (`d409e0a`)',
  'tests/DonAlvaroValidation.test.ts': 'podado por V13 (`c164731`)',
  'tests/unit/mcpChatParticipant.test.ts': 'podado por V13 (`f6ae634`)',
  'tests/integration/extensionChatIntegration.test.ts': 'podado por V13 (`f6ae634`)',
  'tests/performance/serviceStartup.test.ts': 'fichero borrado entero por V90 (`c989de8`, §7.5)',
};
// nota por CITA exacta cuando lo que caduco es la COORDENADA y no el fichero.
// Se RE-MIDE al anotar — que es justamente la regla que sale de este WP.
const NOTA_CITA = {
  'package.json:1446': 'coordenada caducada: `package.json` tiene hoy 1248 líneas. RE-MEDIDO: el `customEditor` de `*.agent.md` vive hoy en `package.json:1165`; lo afirmado (que son dos `customEditors`) sigue siendo cierto',
  'package.json:1456': 'coordenada caducada. RE-MEDIDO: el segundo `customEditor` vive hoy en `package.json:1175`',
  'package.json:1494': 'coordenada caducada y afirmación caducada. RE-MEDIDO: hoy `package.json` no declara ningún script `unix:code` (`grep -c unix:code package.json` -> 0)',
  'package.json:1271': 'coordenada caducada: `package.json` tiene hoy 1248 líneas. RE-MEDIDO: lo afirmado sigue en pie — `@vscode/test-electron` sigue siendo devDep ya declarada, hoy en `package.json:1229`, rango `^2.4.1`',
};

const rancias = JSON.parse(readFileSync(process.argv[3], 'utf8'));
const porInf = new Map();
for (const r of rancias) (porInf.get(r.inf) ?? porInf.set(r.inf, []).get(r.inf)).push(r);

let puestas = 0;
for (const [inf, lista] of porInf) {
  const p = join(R, inf);
  const lineas = readFileSync(p, 'utf8').split('\n');
  // dedupe (linea, cita): una linea con la misma cita dos veces se anota una vez
  const vistas = new Set();
  for (const { ln, cita } of lista) {
    const k = `${ln}::${cita}`;
    if (vistas.has(k)) continue;
    vistas.add(k);
    const nota = NOTA_CITA[cita] ?? NOTA[cita.replace(/:[\d,-]+$/, '')];
    if (!nota) { console.log(`SIN NOTA: ${inf}:${ln} ${cita}`); continue; }
    const marca = ` ⛔ *(cita rancia: ${nota}. Se conserva porque era cierta al escribirse)*`;
    const i = ln - 1, bt = '`' + cita + '`';
    if (lineas[i].includes(bt)) lineas[i] = lineas[i].replace(bt, bt + marca);
    else if (lineas[i].includes(cita)) lineas[i] = lineas[i].replace(cita, cita + marca);
    else { console.log(`NO CASA: ${inf}:${ln} ${cita}`); continue; }
    puestas++;
  }
  writeFileSync(p, lineas.join('\n'));
}
console.log(`anotaciones insertadas: ${puestas} en ${porInf.size} reportes`);
```

```
$ JSON_OUT=rancias.json node barrido-citas.mjs .   # (salida en §3.1)
$ node anotar.mjs . rancias.json
anotaciones insertadas: 26 en 9 reportes
```

**26 anotaciones para 27 detecciones**: `WP-V14-marca-producto.md:632` cita
`docs/GUIA-PRUEBA-v1.md` **dos veces en la misma línea** y se anota una sola vez.

**Comprobado que las 26 del disco salen de estas tablas y no de mi mano**
—extrayendo `NOTA`/`NOTA_CITA` del bloque de arriba y contrastándolas contra
cada marca real:

```
marcas en disco: 26 · generables por las tablas vigentes: 26 · divergentes: 0
```

### 2.1 · El error que casi meto, y por qué las notas no llevan `**`

La primera pasada escribía «podado por `**V13**`». En `WP-V13-poda.md:642` la
marca cae **dentro de un tramo que ya estaba en negrita**:

```
**`media/ICON_CREATION_GUIDE.md` ⛔ *(… por **V14** …)* SÍ viaja en el `.vsix`.**
```

Ese `**` anidado cierra la negrita exterior antes de tiempo: **rompe el render
del reporte que venía yo a arreglar.** Las notas van sin `**`; los nombres de WP
y los hashes van en `código`, que es seguro dentro de negrita y dentro de una
celda de tabla. Ninguna nota contiene `|`, así que ninguna tabla cambia de
columnas — comprobado: el diff no altera el número de `|` de ninguna fila.

---

## 3 · Salida literal del barrido

### 3.1 · ANTES

```
ambito                       : plan/REPORTES
documentos barridos          : 28
citas ruta[:linea] extraidas : 1518    <-- DENOMINADOR
  resuelven contra el arbol  : 1176
  ajenas a este repo         : 237    (otro mundo; no verificables aqui)
  NO resuelven               : 105
    TRANSCRIP (en bloque cod): 45   evidencia grabada, pasado
    ANOTADA  (marca en linea): 6   ya declara su caducidad
    EFIMERA  (nunca existio) : 8   sonda/vector/propuesta
    ACTA     (muere<=reporte): 19   el que escribia ya lo sabia
    RANCIA   (muere >reporte): 27   <-- DEUDA, debe ser 0

VEREDICTO: FAIL
exit=1
```

### 3.2 · DESPUÉS

Esta es la corrida que verá quien re-ejecute, y por eso **incluye este propio
reporte** (28 → 29 documentos):

```
ambito                       : plan/REPORTES
documentos barridos          : 29
citas ruta[:linea] extraidas : 1625    <-- DENOMINADOR
  resuelven contra el arbol  : 1236
  ajenas a este repo         : 239    (otro mundo; no verificables aqui)
  NO resuelven               : 150
    TRANSCRIP (en bloque cod): 59   evidencia grabada, pasado
    ANOTADA  (marca en linea): 34   ya declara su caducidad
    EFIMERA  (nunca existio) : 18   sonda/vector/propuesta
    ACTA     (muere<=reporte): 39   el que escribia ya lo sabia
    RANCIA   (muere >reporte): 0   <-- DEUDA, debe ser 0

VEREDICTO: PASS
exit=0
```

Tres movimientos del denominador, los tres declarados:

1. **1518 → 1532** por las **anotaciones**: citan `package.json:1165`, `:1175`,
   `:1229` y `docs/GUIA-PRUEBA-v2.md`. Mis correcciones **entran al barrido como
   cualquier otra cita**, y las 14 resuelven.
2. **1532 → 1625** por **este reporte**, que cita mucho por naturaleza.
3. `ANOTADA` 6 → 34 = las 6 que V90 ya había marcado a mano con
   `FICHERO BORRADO`, más las 27 de este WP, más 1 del texto de §1.2.

El salto de `ACTA` (19 → 39) y `EFIMERA` (8 → 18) es este reporte nombrando las
rutas muertas de las que habla: por §1.1 (a) y (b) son actas, no citas rotas.
**La comprobación de que eso no es una amnistía a medida está en §1.1**: la
misma regla, aplicada a V12 y V68, los sigue declarando `RANCIA`.

---

## 4 · Tabla de corregidas — las 27, con su denominador

Las 27 son `RANCIA`, es decir: **las 27 eran ciertas el día que se escribieron.**
Ninguna es un error del autor; todas son óxido.

| # | reporte | cita | qué la mató | qué decía, y por qué caducó |
| - | ------- | ---- | ----------- | --------------------------- |
| 1-3 | `WP-V10-v1-release.md:28,40,194` | `docs/GUIA-PRUEBA-v1.md` | **V15** `808be04` | V10 la creó y la citaba como entregable vivo. V15 la retiró con `git rm` al cambiar los espacios de nombres; hoy es `docs/GUIA-PRUEBA-v2.md` |
| 4 | `WP-V12-censo-veredicto.md:112` | `package.json:1446` | *coordenada* | el `customEditor` de `*.agent.md`. **RE-MEDIDO: hoy `package.json:1165`**; el manifiesto pasó de ~1500 a **1248** líneas. Lo afirmado (hay **dos** `customEditors`) sigue siendo cierto |
| 5 | `:402` | `src/mcpChatParticipant.ts` | **V13** `f6ae634` | fila 19 del censo, marcada «vivo». V13 la podó en DV-11 |
| 6 | `:404` | `src/core/configurationCommandsService.ts:256-259` | **V13** `9172d07` | los 4 `registerCommand` de `ArrakisTheater.*` |
| 7 | `:436` | `src/theatrical/core/schemas/agent.schema.json` | **V13** `c164731` | schema de agentes |
| 8 | `:444` | `media/ICON_CREATION_GUIDE.md` | **V14** `d409e0a` | la celda `.vsix` del censo. **Ojo**: la misma línea cita `.vscodeignore:28` como la regla `*.md`, y hoy esa regla está en **`.vscodeignore:32`** (el fichero pasó de 64 a **68** líneas). Ver **E-1** |
| 9-10 | `:561`, `:463`→`:600` | `package.json:1446` | *coordenada* | ídem #4 |
| 11 | `:564` | `package.json:1494` | *coordenada* **y afirmación** | decía `"unix:code": "sh ./setup-vscode-path"`. **RE-MEDIDO: `grep -c unix:code package.json` → 0.** El script ya no existe: aquí no caducó sólo el número, caducó el hecho |
| 12-13 | `:594`, `:715` | `tests/DonAlvaroValidation.test.ts:11` | **V13** `c164731` | arrastre de la poda |
| 14-15 | `:596`, `:716` | `tests/unit/mcpChatParticipant.test.ts:3` | **V13** `f6ae634` | arrastre de la poda |
| 16 | `:601` | `src/core/configurationCommandsService.ts` | **V13** `9172d07` | ídem #6 |
| 17 | `:721` | `tests/integration/extensionChatIntegration.test.ts:3` | **V13** `f6ae634` | arrastre de la poda |
| 18 | `WP-V13-poda.md:642` | `media/ICON_CREATION_GUIDE.md` | **V14** `d409e0a` | «**SÍ viaja en el `.vsix`**» — conclusión correcta entonces, sobre un fichero que V14 borró después |
| 19 | `WP-V14-marca-producto.md:632` | `docs/GUIA-PRUEBA-v1.md` | **V15** `808be04` | residual RES-7, en presente, sobre un fichero que V15 retiró |
| 20-21 | `WP-V23-config-intencional.md:1385,1386` | `serviceStartup.test.ts:17,54` y `:37` | **V90** `c989de8` | **denunciada.** Tabla de umbrales de reloj y memoria |
| 22 | `WP-V66-seguridad-webviews.md:813` | `serviceStartup.test.ts:9` | **V90** `c989de8` | **denunciada.** El test nombrado en la nota de estabilidad |
| 23-24 | `WP-V68-arnes-exthost.md:17,153` | `package.json:1271` | *coordenada* | «devDep **ya declarada**, no se añadió ninguna». **RE-MEDIDO: sigue siendo cierto** — `@vscode/test-electron` está hoy en **`package.json:1229`**, rango `^2.4.1`. Ver **E-2** |
| 25 | `WP-V71-log-estructurado.md:818` | `serviceStartup.test.ts` | **V90** `c989de8` | el `duration < 100` citado como ejemplo vivo |
| 26-27 | `WP-V90-jest-determinista.md:723,757` | `serviceStartup.test.ts`, `:9` | **V90** `c989de8` | **V90 se pudrió a sí mismo**: el reporte nació en `ccf1d08`, y el borrado llegó en `c989de8`, en la ronda de corrección posterior. V90 anotó 6 citas a mano (`FICHERO BORRADO`) y se dejó estas dos |

### 4.1 · Las que NO se tocaron, y por qué

`105 − 27 = 78` citas no resuelven y **ninguna es deuda**. Se declara para que el
`PASS` no se lea como «no había nada más»:

- **45 `TRANSCRIP`** — dentro de bloques de código. Ej.:
  `WP-V15:239-247` es la salida literal de un `grep -rn` que situaba 9 puntos en
  `extensionBootstrap.ts:1425…1595`; ese fichero tiene hoy **297** líneas. La
  salida no se toca: era verdad el día que se ejecutó, y es la prueba.
- **19 `ACTA`** — sobre todo `WP-V13-poda.md`, cuyo objeto **era** borrar.
  Un `git rm src/configEditor.ts` en el acta de la poda no es una cita rota.
- **8 `EFIMERA`** — `src/__probe__.ts` (V94), `tests/unit/inventado.test.ts` y
  `__vector-v93-transitorio.test.ts` (V93), `scripts/tests/arnes.ts` (propuesta
  de V91), `scripts/rojos-jest.OTRO.txt` (mutación de una prueba de V91).
- **6 `ANOTADA` previas** — V90 ya las había marcado.

### 4.2 · Comprobación de que la clase `TRANSCRIP` no está tapando nada

`WP-V66:123` cita `aiCommands.ts:190` y el fichero tiene hoy **187** líneas.
Se verificó a mano por si el barrido estuviera amnistiando un defecto de
seguridad: **no.** Esa línea es la salida del analizador **con un render hostil
inyectado a propósito** en `aiCommands.ts` (bypass 7, §«Retirados los ficheros
hostiles, la suite vuelve a 87/87»). Hoy el fichero tiene 4 asignaciones
`panel.webview.html = render…(…)`, todas **procedentes de una llamada**, que es
justo lo que la regla de V66 exige. Sin defecto.

---

## 5 · La regla que sale de esta clase de defecto

> **Una cifra o una cita «medida por grep» caduca.**
> Al citarla, o **se re-mide**, o **se cita el gate que la sostiene**.
> Un `fichero:línea` es una coordenada, no una prueba: nombra un sitio, no un hecho.

Las tres formas de citar, de peor a mejor:

| forma | ejemplo | aguanta |
| ----- | ------- | ------- |
| **coordenada sola** | «el umbral está en `jest.config.js:12`» | hasta el siguiente diff de ese fichero |
| **coordenada + hecho** | «`jest.config.js:12` — `collectCoverage: true`» | el hecho se puede volver a buscar aunque la línea se mueva |
| **gate** | «lo sostiene `scripts/cobertura-trinquete.mjs`, que falla si baja» | mientras el gate corra en CI |

Corolario, de este mismo WP: **`plan/BACKLOG.md:<n>` es la peor diana posible**,
porque ese fichero se reescribe entero cada ola. Ver **E-3**.

### 5.1 · Dónde queda escrita

`ALCANCE_DIFF` es `plan/REPORTES/**`, así que **no puedo escribirla en
`plan/PRACTICAS.md`**, que es donde alguien la leería antes de citar. Queda aquí
y va enrutada como **E-5**. No se ha tocado `plan/PRACTICAS.md`.

---

## 6 · Hallazgos enrutables — lo que NO he arreglado

Por CA-5: señalados con nombre y ruta, sin tocar.

### E-1 · `plan/CENSO-V12.md` — 22 citas rancias en un documento **vivo**, no un reporte

Fuera de `plan/REPORTES/**`, luego fuera de mi alcance. El barrido corre igual:

```
$ AMBITO=plan node barrido-citas.mjs .
ambito                       : plan
documentos barridos          : 11
citas ruta[:linea] extraidas : 425    <-- DENOMINADOR
  resuelven contra el arbol  : 275
  ajenas a este repo         : 114    (otro mundo; no verificables aqui)
  NO resuelven               : 36
    TRANSCRIP (en bloque cod): 7   evidencia grabada, pasado
    ANOTADA  (marca en linea): 0   ya declara su caducidad
    EFIMERA  (nunca existio) : 7   sonda/vector/propuesta
    ACTA     (muere<=reporte): 0   el que escribia ya lo sabia
    RANCIA   (muere >reporte): 22   <-- DEUDA, debe ser 0
```

**21 de las 22 están en `plan/CENSO-V12.md`** (líneas 118, 143×2, 167, 178, 186,
455, 457, 463, 533, 547, 548, 563, 600, 603, 604, 621, 629, 634, 635, 640) y **1
en `plan/BACKLOG.md:160`**. Importa más que las 27 de los reportes: un reporte es
un acta cerrada, pero `CENSO-V12.md` es **el censo vigente del repo**, y V14 y
V15 trabajaron sobre sus filas. Hoy afirma en presente que `src/configEditor.ts`
tiene 423 líneas muertas y que `src/statusManager.ts` tiene 453 — **los dos
llevan borrados desde `c164731`**.

**Enrutado a:** quien posea `plan/CENSO-V12.md`. El barrido y el anotador de §1-2
sirven tal cual: basta `AMBITO=plan`.

### E-2 · `WP-V68` selló su CA con una coordenada, y el sello es hoy falso

`plan/REPORTES/WP-V68-arnes-exthost.md:153`, en la lista de auto-verificación:

> `- [x] Sellos con fuente: rutas y líneas citadas existen (package.json:1271, salidas literales arriba).`

`package.json` tiene hoy **1248** líneas: la casilla marcada afirma exactamente
lo que hoy es falso. **El fondo se sostiene** —`@vscode/test-electron` sigue
siendo devDep ya declarada, hoy en `package.json:1229`— así que **no hay defecto
de código**; lo que falla es la forma del sello. Es el argumento más limpio a
favor de la regla de §5: una CA que se autocertifica con un `fichero:línea`
**se autocertifica con algo que caduca**.

**Enrutado a:** quien fije la plantilla de CA del swarm.

### E-3 · La clase que el barrido NO puede cazar: la cita que resuelve y miente

El caso, con nombre y ruta — `plan/REPORTES/WP-V90-jest-determinista.md:357`:

> «…y con el encargo (`plan/BACKLOG.md:153`, que nombra `duration < 100 ms`)»

`plan/BACKLOG.md` tiene hoy 215 líneas, así que `:153` **resuelve** y el barrido
la da por buena. Pero la línea 153 de hoy es la fila de **WP-V68, el arnés de
Extension Host**, que no menciona ningún `duration < 100 ms`.

> **La cita es verificable, pasa la verificación, y es falsa.**

Esto acota lo que vale mi `PASS`: garantiza que **ninguna cita apunta al vacío**,
no que ninguna cita mienta. Cerrarlo del todo exige comparar el *contenido*
citado, no sólo su existencia — un barrido que guarde junto a cada cita un ancla
de texto. No está hecho.

**Enrutado a:** el mismo dueño que E-5. Es la mitad que falta del instrumento.

### E-4 · El barrido no tiene casa

Vive en este `.md` porque `ALCANCE_DIFF` prohíbe `scripts/`. Un gate que hay que
copiar y pegar para ejecutar no lo ejecuta nadie. **Sitio natural:
`scripts/citas-rancias.mjs` + paso en `.github/workflows/ci.yml`**, junto al
trinquete de cobertura y al gate de rojos. Sale `1` con deuda, así que sirve de
gate sin tocarlo.

**Enrutado a:** quien posea `scripts/` y CI (linaje V93/V94).

### E-5 · La regla de §5 no está donde se lee

Su sitio es `plan/PRACTICAS.md`, fuera de mi alcance. **No se ha tocado.**

---

## 7 · Auto-verificación

| # | criterio | estado | evidencia |
| - | -------- | ------ | --------- |
| 1 | cero citas a ficheros o líneas inexistentes, por script re-ejecutable, salida literal | ✅ | §3.2 · `RANCIA = 0` · `exit 0` · script completo en §1.4 |
| 2 | el barrido dice cuántas revisó y cuántas falló, **con denominador** | ✅ | **27 rancias / 1518 citas** en 28 reportes (§3.1); el desglose de las otras 78 que no resuelven, en §4.1; los movimientos del denominador, en §3.2 |
| 3 | cada corrección conserva qué se dijo y por qué caducó | ✅ | **cero líneas borradas**: el diff es 26 líneas modificadas, todas por *inserción* de la marca `⛔ *(cita rancia: … Se conserva porque era cierta al escribirse)*`. `git diff --stat` = 26 `+` / 26 `−` sobre las mismas 26 líneas |
| 4 | la regla queda escrita donde alguien la lea | ⚠️ **parcial** | §5. Su sitio es `plan/PRACTICAS.md` y está **fuera de `ALCANCE_DIFF`** → enrutada como **E-5**. Declarado, no disimulado |
| 5 | cita rancia que afecte a código: señalar, no arreglar | ✅ | §6. **Ninguna de las 27 afecta a código** y se demuestra caso a caso (§4 col. 5, §4.2). Los 5 hallazgos van sin tocar |
| — | alcance del diff | ✅ | 9 reportes + este. Cero `src/`, `tests/`, `scripts/`, `plan/BACKLOG.md`, `plan/PRACTICAS.md`, `plan/CENSO-V12.md` |
| — | sin `git push`, sin `git stash`, sin `npx` | ✅ | sólo `node` y `git` de lectura |

**Lo que este WP NO garantiza**, dicho antes de que lo pregunten: que las citas
digan la verdad. Garantiza que **apuntan a algo que existe** (§3.2) y acota la
diferencia con un caso real y nombrado (**E-3**).
