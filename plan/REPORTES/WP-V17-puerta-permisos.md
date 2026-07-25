# WP-V17 · Puerta de permisos — reporte

| dato | valor |
| ---- | ----- |
| agente | worker-V |
| fecha | 2026-07-25 |
| rama | `wp/v17-puerta-permisos` |
| worktree | `C:/S_LAB/.worktrees/v/v-sdk-wp-v17` |
| commit de obra | `411777a5b28829934b4ea831bafefd4c78aba5a8` |
| tip de la rama | el commit de este reporte, encima de `411777a` (SHA en el cierre del worker; no se inventa aquí) |
| lote | V12 ∥ V16 ∥ V17 · ficheros en alcance disjuntos |
| eje(s) CA | V-L2-01 (puerta) · V-L2-02 (prueba por invariante) |
| riesgo de revisión | `independiente` — WP de contrato |
| revisor distinto del worker | **obligatorio** |
| estado propuesto | listo para contrarrevisión |
| VEREDICTO_REVISOR | ⏳ pendiente |

---

## 1 · Qué se hizo

### (a) V-L2-01 · La ausencia de información deja de conceder permiso

`repartoRequired` pasa de `requireRepartoLive === true` a
`requireRepartoLive !== false`, y se añade una rama `ok:false` + `⏳`
cuando el servidor **no declaró** la exigencia.

### (b) V-L2-02 · Prueba unitaria por invariante del contrato

`tests/unit/parseEditorInfo.test.ts` (nuevo): **36 casos**, los 5 mínimos
del brief más 31 añadidos. `grep parseEditorInfo tests/` pasa de 0 a
cubrir el módulo entero, incluidos `representMotivoDeny`,
`isDeniedWithoutWrite` y `extractMotivoFromDeny`.

---

## 2 · CA 1 · Las dos líneas, lado a lado (antes y después)

**ANTES** (`411777a^`, líneas 80 y 83 — contiguas en el mismo literal):

```ts
visible: g.visible !== false,                    // :80  ausencia ⇒ true   CERRADO ✔
repartoRequired: requireRepartoLive === true,    // :83  ausencia ⇒ false  ABIERTO ✘
```

**DESPUÉS** (`411777a`, líneas 90 y 93 del mismo literal):

```ts
visible: g.visible !== false,                    // :90  ausencia ⇒ true   CERRADO ✔
repartoRequired: requireRepartoLive !== false,   // :93  ausencia ⇒ true   CERRADO ✔
```

Las dos caras fallan ya en la misma dirección: **sólo un `false`
explícito del servidor abre**. Fijado por el test *«las dos caras del
gate fallan en la MISMA dirección ante ausencia de dato»*, que además
asserta `gate.repartoRequired === gate.visible` ante ausencia de ambos.

**Lo que NO se tocó:** la distinción de `:72-77` (ahora `:76-81`) entre
`null` (no declarado) y `false` (declarado no requerido) queda intacta.
El bug estaba en cómo la colapsaba `:83`, no en ella. Dos tests la fijan
(`no confunde «no declarado» (null) con «declarado no requerido» (false)`
y `sólo un `false` EXPLÍCITO…`).

---

## 3 · La decisión, y por qué

El brief admitía dos salidas. **Se implementan las dos, y no por
prudencia decorativa: la salida (1) a solas no era honesta dentro de mi
alcance.**

- **(1) ausencia ⇒ requerido** — `repartoRequired: requireRepartoLive !== false`.
- **(2) `ok:false` explícito** — cuando `requireRepartoLive === null`,
  con `pendingReason`:
  `⏳ editor://info no declara reparto_required — el IDE asume reparto EXIGIDO (la ausencia no concede permiso)`.

**Justificación de (2), que es la parte discutible.** El brief exige que,
si se elige (1) dejando `ok:true`, el parser marque «visiblemente» que el
IDE está asumiendo lo estricto. Ese canal visible **no existe hoy aguas
abajo dentro de mi alcance**: `src/mutation/AuthorshipService.ts:174-186`
sólo lee `parsed.pendingReason` en la rama `if (!parsed.ok || !parsed.gate)`.
Un `pendingReason` con `ok:true` sería descartado en silencio — justo lo
que el brief prohíbe — y arreglar `AuthorshipService.ts` está **fuera de
mi alcance** (no figura en mi lista de ficheros). Con `ok:false`, el ⏳
viaja por un canal ya cableado: `emptyAuthorshipSnapshot('pending_info',
parsed.pendingReason…)` lo publica como `statusMessage`. La honestidad
no depende de un WP futuro.

El campo del gate se mantiene además fail-closed porque el `gate` se
publica también en la rama `pending_info` (`AuthorshipService.ts:184`):
si sólo hubiera puesto `ok:false` y dejado `=== true`, el objeto que
llega a la UI seguiría diciendo «reparto no requerido».

**Precio, declarado:** un servidor que publique `motivos_deny` pero no
declare `reparto_required` ya no alcanza `availability: 'ready'`; queda
en `pending_info` con ⏳. Es intencionado — es la cláusula transversal 1
del contrato (*«lo no desplegado se muestra ⏳; el IDE nunca presenta
como sincronizado lo que no lo está»*) — pero es un cambio de
comportamiento observable y el revisor debe verlo como tal, no como
efecto colateral.

---

## 4 · A quién afecto (grep declarado, exigido por el brief)

`grep -rn "repartoRequired\|requireRepartoLive\|reparto_required" src tests scripts`:

| consumidor | qué lee | efecto de mi cambio |
| ---------- | ------- | ------------------- |
| `src/mutation/AuthorshipService.ts:184,191,204` | `parsed.requireRepartoLive` | **ninguno en el tipo** (sigue `boolean\|null`, sigue reflejando sólo lo DECLARADO). Sí cambia el flujo: con `required` no declarado ahora entra por `pending_info` en vez de `ready`. |
| `src/treeViews/mcpTreeView.ts:309-315` | `snap.gate.repartoRequired` | con `required` no declarado el árbol pasa a mostrar `…=ON` / `reparto_required`. Ver residual **R-1**. |
| `src/mutation/types.ts:25,41` | tipos | **no tocado**: `repartoRequired` sigue siendo `boolean`. El tipado no exigió cambio, así que no ejercí la autorización condicional del brief. |
| `scripts/probes/v08-mutacion-autoria.mjs` | espejo propio | no importa `src/`; ver §7. |

---

## 5 · Ficheros tocados (CA 5)

```
 src/mutation/parseEditorInfo.ts    |  27 ++-
 tests/unit/parseEditorInfo.test.ts | 422 +++++++++++++++++++++++++++++++++++++
 2 files changed, 448 insertions(+), 1 deletion(-)
```

Más este reporte (`plan/REPORTES/WP-V17-puerta-permisos.md`). **Cero
ficheros fuera del alcance.** `git status --porcelain` tras la última
pasada de pruebas: **vacío** (0 entradas) — ver §8 sobre el susto de
`coverage/`.

`package.json`, `.github/**`, `scripts/probes/**` y `jest.config.js`: **no
tocados**. Se usó `test:unit`, que ya existía; no hizo falta script nuevo.

---

## 6 · CA 3 · Pruebas — salida de jest

Los **5 casos mínimos** del brief, y dónde están:

| # | caso mínimo | test |
| - | ----------- | ---- |
| 1 | `required` ausente ⇒ requerido (o `ok:false`) | *con motivos_deny presente y `required` ausente exige reparto, no lo concede* + *marca ⏳ que el servidor NO declaró…* |
| 2 | `reparto.required: true` sin `reparto_required` ⇒ requerido | *lee `reparto.required: true` aunque falte `gate.reparto_required`* |
| 3 | `motivos_deny` ausente ⇒ `ok:false` + ⏳ | *sin `motivos_deny` devuelve ok:false y ⏳ sin inventar catálogo* |
| 4 | motivo fuera de lista ⇒ representado COMO tal | *marca explícitamente el motivo que el servidor NO publicó* (+ los otros dos de ese bloque) |
| 5 | `visible` ausente ⇒ `visible: true` | *las dos caras del gate fallan en la MISMA dirección…* (+ *`visible: false` explícito se respeta*) |

Añadidos: raw `null` · raw array · raw cadena · `gate` ausente · `gate`
array · `reparto` array · `motivos_deny` con no-strings · `motivos_deny`
vacío · `required` no booleano · precedencia `reparto_required` sobre
`reparto.required` · `mutationTools` basura o no-array · `name`/`version`
no-string · los tres caminos de `extractMotivoFromDeny`.

```
PASS tests/unit/parseEditorInfo.test.ts
  parseEditorInfo · la ausencia de información no concede permiso (V-L2-01)
    √ con motivos_deny presente y `required` ausente exige reparto, no lo concede (2 ms)
    √ marca ⏳ que el servidor NO declaró la exigencia y que el IDE asume lo estricto (1 ms)
    √ las dos caras del gate fallan en la MISMA dirección ante ausencia de dato
    √ sólo un `false` EXPLÍCITO del servidor declara que no se exige reparto
    √ no confunde «no declarado» (null) con «declarado no requerido» (false) (1 ms)
    √ `visible: false` explícito se respeta (la simetría no es «siempre true»)
  parseEditorInfo · divergencia que el espejo del probe no ve (REVISIÓN §1.1)
    √ lee `reparto.required: true` aunque falte `gate.reparto_required` (1 ms)
    √ lee `reparto.required: false` como declaración explícita del servidor
    √ `gate.reparto_required` tiene precedencia sobre `reparto.required`
    √ ignora un `required` no booleano y lo trata como no declarado
  parseEditorInfo · catálogo de motivos (cláusula viva)
    √ sin `motivos_deny` devuelve ok:false y ⏳ sin inventar catálogo
    √ sin bloque `reparto` tampoco inventa catálogo
    √ usa la lista del servidor tal cual (N=2, no fuerza los ocho)
    √ descarta elementos no-string de motivos_deny sin sustituirlos (1 ms)
    √ un motivos_deny vacío es lista del servidor, no catálogo ausente
    √ propaga permiso y engages_when tal como los publica el servidor (1 ms)
  representMotivoDeny · la cláusula viva en los dos sentidos
    √ representa como listado el motivo que sí publicó el servidor
    √ marca explícitamente el motivo que el servidor NO publicó
    √ con lista vacía, ningún motivo se da por conocido (1 ms)
  parseEditorInfo · entradas hostiles
    √ sin editor://info (null) no hay gate ni exigencia declarada
    √ editor://info como array es malformado
    √ editor://info como cadena es malformado (3 ms)
    √ sin `gate` no hay puerta visible y no se infiere ninguna (1 ms)
    √ un `gate` array se trata como gate ausente
    √ un `reparto` array no aporta motivos ni exigencia (1 ms)
    √ filtra mutationTools no-string y tolera que no sea array
    √ conserva name y version cuando son cadenas, y los omite si no
  isDeniedWithoutWrite · inferencia vigente (V-L2-04 en cola, no la fija el contrato)
    √ infiere «sin escritura» cuando faltan lineDir, outPath y refs.linea
    √ con lineDir o refs.linea NO cuenta como deny sin escritura
    √ un payload ok:true nunca es deny sin escritura
  extractMotivoFromDeny · motivo del servidor, sin inventarlo
    √ lee decision.motivo
    √ lee gate.reparto.motivo cuando no hay decision
    √ deriva el motivo de `rule` recortando «linea-editor.reparto_» (vigente)
    √ el motivo derivado sólo de `rule` no casa con el catálogo del servidor (V17-A) (1 ms)
    √ decision.motivo tiene precedencia sobre rule, y ese sí es del catálogo
    √ sin ninguna de las tres vías no devuelve motivo

Test Suites: 1 passed, 1 total
Tests:       36 passed, 36 total
Time:        3.99 s
```

**CA 4 · cero motivos hardcodeados en `src/`.** Grep de los ocho motivos
(`reparto_requerido|card_no_vigente|identidad_ausente|seat_invalido|seat_ausente|personaje_desconocido|personaje_no_en_reparto|rol_sin_permiso`)
sobre `src/` = **0 hits**, sin filtros. Los ocho viven en
`MOTIVOS_FIXTURE` del test. El probe `assertNoHardcodedMotivosInSrc()`
también sigue en PASS.

---

## 7 · Casos adversariales — ¿las pruebas atrapan de verdad el fallo?

Un test que pasa no prueba que vigile nada. Se mutó el arreglo **ya
commiteado**, dos veces, en mi propio worktree, revirtiendo con
`git checkout --` y verificando `git status --porcelain` vacío después de
cada una.

**M1** — devolver el campo a fail-open (`requireRepartoLive === true`):

```
Tests: 5 failed, 31 passed, 36 total
  ● … › con motivos_deny presente y `required` ausente exige reparto, no lo concede
  ● … › las dos caras del gate fallan en la MISMA dirección ante ausencia de dato
  ● … › no confunde «no declarado» (null) con «declarado no requerido» (false)
  ● … › ignora un `required` no booleano y lo trata como no declarado
  ● … › un `reparto` array no aporta motivos ni exigencia
```

**M2** — dejar la rama ⏳ sin dispararse (`=== null` → `=== false`):

```
Tests: 3 failed, 33 passed, 36 total
  ● … › marca ⏳ que el servidor NO declaró la exigencia y que el IDE asume lo estricto
  ● … › sólo un `false` EXPLÍCITO del servidor declara que no se exige reparto
  ● … › ignora un `required` no booleano y lo trata como no declarado
```

Las dos mitades del arreglo están vigiladas por separado. Tras cada
mutación: `git status --porcelain` **vacío**; `src/` no aparece.

**El probe `npm run probe:v08` sale PASS — y ese PASS NO atestigua mi
cambio.** En mi rama el probe sigue siendo el **espejo** que reimplementa
el parser (`scripts/probes/v08-mutacion-autoria.mjs:30-31,84`) y no
importa nada de `src/`. Lo corrí como señal de regresión del resto del
carril, nada más. **Mi evidencia son las pruebas unitarias, no el probe.**

Lectura estática para el orquestador (no es ejecución): los cuatro
fixtures del probe declaran `reparto_required` explícitamente
(`:142`, `:168`, `:197`, `:212`), así que **cuando V16 haga que el probe
importe el parser real, mi cambio no debería alterar sus asserts** —
`:197` usa `reparto_required: false`, que sigue dando `ok:true`. Es una
lectura del código, no una prueba: quien fusione debe re-ejecutarlo.

---

## 8 · Evidencia y economía de CPU

Tabla de `EVIDENCIA.md` transcrita íntegra (el fichero está en
`.gitignore`; aquí es donde perdura):

| sello (UTC) | etiqueta | resultado | HEAD | árbol | lockfile | nota |
| ----------- | -------- | --------- | ---- | ----- | -------- | ---- |
| 2026-07-25T14:53:28Z | npm-ci | PASS | `1c90c43bfeafe6cabbc71a04440b4a962544aa83` | limpio | `sha256:363c08ffd4f544da` | node v22.21.1 · npm 10.9.4 · worktree v17 |
| 2026-07-25T14:58:23Z | jest-parseEditorInfo | PASS | `411777a5b28829934b4ea831bafefd4c78aba5a8` | limpio | `sha256:363c08ffd4f544da` | 36/36 · `npx jest tests/unit/parseEditorInfo.test.ts --coverage=false` |
| 2026-07-25T14:59:25Z | jest-test-unit-umbral | FAIL | `411777a5b28829934b4ea831bafefd4c78aba5a8` | sucio(66) | `sha256:363c08ffd4f544da` | `npm run test:unit` · rc=1 · umbral global de cobertura del legado |

**Al empezar no había `EVIDENCIA.md`** en este worktree: ningún registro
ajeno que no reconociera (nota del vigía §3). Las tres filas son mías.

Antes de cada comando caro se consultó `evidencia.sh vigente <etiqueta>`:
las tres salieron **1 (no vigente)**, así que los tres se ejecutaron, los
tres por `slot.sh run`. `npm ci` era obligado: este worktree no tenía
`node_modules`. Las vueltas de iteración fueron
`npx jest <un fichero> --coverage=false` (~4 s, sin ranura, como autoriza
el brief).

### La trampa de `jest.config.js`, observada y no supuesta

`npm run test:unit` **sale rojo con mis pruebas en verde**:

```
Jest: "global" coverage threshold for statements (85%) not met: 3.47%
Jest: "global" coverage threshold for branches   (75%) not met: 4.02%
Jest: "global" coverage threshold for lines      (85%) not met: 3.57%
Jest: "global" coverage threshold for functions  (80%) not met: 3.41%
Test Suites: 4 passed, 4 total
Tests:       65 passed, 65 total
```

65/65 pruebas pasan y el proceso devuelve `rc=1`. La causa es
`collectCoverage: true` + `coverageThreshold` global sobre `src/**`
(`jest.config.js:12-30`) con el legado de V01–V10 sin cubrir. **Es deuda
conocida del legado, no la introduce este WP y V-L2-02 no la resuelve.**
Lo ejecuté una vez para poder afirmarlo como observación en vez de como
lectura del fichero.

**`npm test` completo: ⏳ NO ejecutado** (el brief lo desaconseja por caro
y por rojo garantizado). No afirmo nada sobre `tests/integration` ni
`tests/performance`.

**Susto de `coverage/` — anotado por si le sirve al vigía.** Esa pasada
dejó el árbol `sucio(66)`: `coverage/` está en `.gitignore:2` **pero sus
ficheros están TRACKEADOS** en el repo, así que cualquier ejecución con
cobertura modifica 66 ficheros versionados. Por eso esa fila salió con
huella `sucio(66)` y nunca contará como vigente — correcto y honesto: la
ensució el propio comando. Restaurado con `git checkout -- coverage/`;
árbol limpio verificado después. **No lo arreglo** (fuera de alcance), lo
elevo como **V17-B**.

---

## 9 · Lo que NO pude hacer, y por qué

- **`npm test` completo:** ⏳ no ejecutado. Caro y rojo por el umbral
  global del legado. Declarado arriba con la evidencia parcial que sí
  obtuve (`test:unit`).
- **Comprobación contra un `linea-editor` vivo:** ⏳ imposible.
  `127.0.0.1:4115` da ECONNREFUSED y `ZEUS_LINEA_EDITOR_REQUIRE_REPARTO`
  no está en el entorno (lo dice el propio probe). **Ningún payload real
  de servidor ha pasado por este parser**: todos mis fixtures son
  sintéticos y salen del contrato leído, no de una observación. Si el
  servidor real publicase una forma que el contrato no fija (REVISIÓN
  §3.1), mis fixtures no lo sabrían.
- **`tsc` completo:** ⏳ no ejecutado. `compile:tests` typechequea todo el
  legado y es caro. Lo que sí tengo: `ts-jest` typechequea en cada pasada
  `parseEditorInfo.ts`, `types.ts` y el test, en `strict: true`, sin
  errores. Para mis dos ficheros eso es typecheck real; para el resto del
  árbol no afirmo nada.
- **Corregir el consumidor de UI** (`mcpTreeView.ts`, residual R-1) y
  **el hallazgo V17-A**: fuera de alcance. Los dejo listados, no
  arreglados; tocarlos rompería la disjunción del lote.
- **`lint` con reglas de V16:** ⏳ no verificable aquí. `npm run lint` es
  hoy un `console.log` placeholder y `.eslintrc.cjs` tiene
  `ignorePatterns: ['**/*']`. Escribí el test en estilo conservador
  (sin `any`, sin variables sin usar, comillas simples, punto y coma,
  indentación de 4 como `src/`), pero **no puedo afirmar que pase reglas
  que aún no existen**. Le toca al orquestador re-verificar el `lint`
  después de fusionar, como pide la nota del vigía §2.

---

## 10 · Hallazgos elevados (no arreglados aquí)

- **V17-A · `extractMotivoFromDeny` produce un motivo que no existe en el
  catálogo.** `parseEditorInfo.ts:169-171` recorta el prefijo
  `'linea-editor.reparto_'`, así que `rule: 'linea-editor.reparto_requerido'`
  devuelve **`requerido`**, no `reparto_requerido`. Ese valor no está en
  los ocho motivos, y al pasarlo por `representMotivoDeny` la UI dirá
  *«no estaba en motivos_deny de editor://info»* de un motivo que **sí**
  está publicado. Lo encontré porque mi test lo esperaba al revés y
  falló. **Gravedad acotada:** `decision.motivo` tiene precedencia y es
  la vía que usan los payloads realistas (fixture del probe `:206-216`);
  el fallo sólo muerde cuando llega `rule` a solas. **No lo arreglo**: no
  es V-L2-01 ni V-L2-02, y el prefijo correcto depende de una forma de
  payload que el contrato **no fija** (REVISIÓN §3.1 → cola Z). Dejo el
  comportamiento vigente fijado por dos tests que lo nombran, para que
  quien lo arregle vea qué está cambiando.
- **V17-B · `coverage/` versionado y a la vez en `.gitignore`.**
  Cualquier pasada con cobertura ensucia 66 ficheros trackeados e
  invalida la huella de `evidencia.sh` para **todos** los worktrees del
  lote. Candidato a higiene (¿V16, que ya toca CI?). Fuera de mi alcance.

## 11 · Residuales

- **R-1 · El árbol dice `=ON` de lo que nadie declaró.**
  `mcpTreeView.ts:309-315` sólo mira `gate.repartoRequired`, así que con
  `required` no declarado mostrará `ZEUS_LINEA_EDITOR_REQUIRE_REPARTO=ON`
  / `reparto_required` — presentando como declarado lo que es una
  asunción del IDE. El ⏳ sí llega al usuario por el `statusMessage` de
  `pending_info`, así que **el estado no es silencioso**, pero las dos
  superficies no dicen lo mismo. Arreglo natural: un campo tipo
  `repartoRequiredDeclared` en `VisibleGate` + rama en el árbol. Exige
  `types.ts` **y** `mcpTreeView.ts`; el segundo está fuera de mi alcance,
  y añadir el campo sin consumidor sería código muerto. **No lo hice.**
- **R-2 ·** Si faltan `motivos_deny` **y** `required` a la vez, gana el
  `pendingReason` de `motivos_deny` (se comprueba antes). Un solo motivo,
  determinista y con test; no se acumulan las dos causas en el mensaje.
- **R-3 ·** V-L2-03 (defaults de nombres de env, `:82`, `:86-87`) y
  V-L2-04 (heurística de «deny sin escritura») **siguen en cola, sin
  tocar**, como manda el brief. Los tests que escribí sobre
  `isDeniedWithoutWrite` fijan la inferencia **vigente** y llevan en el
  nombre y en un comentario que V-L2-04 la cambiará: habrá que
  actualizarlos, no son un candado.

## 12 · Dudas para el custodio / orquestador

1. **¿Es aceptable el precio de `ok:false`?** Un servidor que publique
   catálogo sin declarar `reparto_required` ya no llega a `ready`. Yo
   sostengo que es la cláusula transversal 1 del contrato aplicada, pero
   cambia el comportamiento visible del producto y no es decisión que un
   worker deba cerrar solo. Si se prefiere `ok:true` + ⏳, hace falta
   además abrir `AuthorshipService.ts` a otro WP para que el ⏳ no se
   pierda.
2. **V17-A** — ¿va a cola V (arreglar el recorte del prefijo) o a cola Z
   (que el contrato fije la forma del payload de denegación, §3.1) antes
   de tocar el IDE? Recomiendo Z primero: hoy el prefijo correcto es
   adivinable, no citable.
3. **V17-B** — ¿quién des-trackea `coverage/`? Afecta a la herramienta de
   economía de todo el swarm, no sólo a este WP.

---

## 13 · CA de cierre, punto por punto

| # | criterio | estado |
| - | -------- | ------ |
| 1 | `:80` y la línea de `repartoRequired` fallan en la misma dirección, mostradas lado a lado antes/después | ✅ §2 |
| 2 | `motivos_deny` presente + `required` ausente ⇒ requerido (o `ok:false`), con prueba | ✅ ambas cosas; §2, §6 |
| 3 | Los 5 casos mínimos existen y pasan; salida de jest en el reporte | ✅ 36/36; §6 |
| 4 | Cero `motivos_deny` hardcodeados en `src/` (grep de los ocho = 0) | ✅ §6 |
| 5 | Cambios limitados al alcance (`git status --porcelain`) | ✅ §5, árbol limpio |

**VEREDICTO_REVISOR: ⏳ pendiente** — el worker no se aprueba a sí mismo.
Contrarrevisión obligatoria por agente distinto (riesgo `independiente`,
WP de contrato).
