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

---

## Contrarrevisión

| dato | valor |
| ---- | ----- |
| agente | contrarrevisor-V (distinto del worker) |
| fecha | 2026-07-25 |
| rango revisado | `1c90c43..02467b5` (obra en `411777a`) |
| **VEREDICTO** | **PASS** |

> Nota de alcance: sólo escribo esta sección. La fila
> `VEREDICTO_REVISOR` de la cabecera y el cierre del §13 quedan con el
> texto del worker a propósito — cambiarlos es acto del orquestador al
> aceptar, no mío.

### A · Qué comprobé, y CÓMO

Ninguna comprobación de abajo se apoya en lo que dice este reporte: cada
una se contrasta contra el fichero, el `git` o una ejecución.

| # | afirmación | cómo la comprobé | resultado |
| - | ---------- | ---------------- | --------- |
| 1 | alcance = 3 ficheros | `git diff --name-status 1c90c43..02467b5`; `git diff --name-only 411777a^ 411777a` | ✅ `parseEditorInfo.ts` + `parseEditorInfo.test.ts` en la obra, el reporte en el commit de docs. **Cero ficheros de más.** `package.json`, `jest.config.js`, `.github/**`, `scripts/probes/**`: intactos |
| 2 | las dos caras fallan cerrado | leído en el fichero real, no en el reporte: `:90 visible: g.visible !== false` · `:93 repartoRequired: requireRepartoLive !== false` | ✅ mismo operador, misma dirección. `null ⇒ true` en ambas; sólo un `false` explícito abre |
| 3 | la distinción `null`/`false` sigue intacta | leídas `:76-81` (las `:72-77` del brief, desplazadas por los comentarios) | ✅ `reparto_required` booleano → él; si no, `reparto?.required` booleano → él; si no, `null`. Sin colapsar |
| 4 | el argumento de `AuthorshipService.ts:174-186` | leído `:173-206` | ✅ **cierto**: `pendingReason` se lee sólo en `:178`, dentro de `if (!parsed.ok \|\| !parsed.gate)`. La rama `ready` (`:195-206`) construye su `statusMessage` a mano en `:197` y nunca mira `pendingReason`. Un `ok:true` + `pendingReason` **se descarta en silencio** — el worker no exagera |
| 5 | CA 4 · cero motivos en `src/` | grep de los ocho sobre `src/`, sin filtros | ✅ **0** |
| 6 | los 36 tests pasan hoy | **reejecutados por mí**: `evidencia.sh vigente jest-parseEditorInfo` → **rc=1** (HEAD se movió a `02467b5`), así que no cité el registro: `slot.sh run jest-parseEditorInfo-contrarrevision -- npx jest … --coverage=false` | ✅ **36/36**, 2.555 s, en el HEAD actual. Registrado en `EVIDENCIA.md` |
| 7 | sin residuo de las mutaciones M1/M2 | `git status --porcelain` al abrir y tras cada ejecución mía | ✅ vacío siempre. `src/` nunca aparece |
| 8 | `EVIDENCIA.md` no tiene filas ajenas | `cat EVIDENCIA.md` contra la tabla del §8 | ✅ transcripción **literal**, 3 filas, todas del worker. Ninguna que no reconozca (nota del vigía §3) |
| 9 | identidad de los commits | `git log -3 --format='%an <%ae>'` | ✅ `worker-V`, no el placeholder |

### B · Los 5 casos mínimos del CA — y si prueban lo que dicen

Comprobé uno por uno que el fixture **omite** el campo, no que lo
malforme (es el eje del método y era fácil colarla aquí):

| caso | test | ¿prueba ausencia? |
| ---- | ---- | ----------------- |
| 1 · `required` ausente | `:52-62` | ✅ `repartoConMotivos()` no lleva `required` y el gate no lleva `reparto_required` — ausencia real |
| 2 · `reparto.required` sin `reparto_required` | `:130-141` | ✅ `reparto_required` omitido |
| 3 · `motivos_deny` ausente | `:182-194` | ✅ `reparto` presente **sin** `motivos_deny`; y `:196-203` va más lejos: bloque `reparto` entero ausente |
| 4 · motivo fuera de lista | `:263-268` | ✅ y en los dos sentidos (`:259`, `:270`) |
| 5 · `visible` ausente | `:78-86` | ✅ y `:116-126` fija que la simetría **no** es «siempre true» |

**Hostil-omite, veredicto:** la suite prueba la AUSENCIA además de la
malformación, y esa era mi sospecha principal. Ausencias cubiertas: `raw`
(`:276`), `gate` (`:301`), `reparto` (`:196`), `motivos_deny` (`:182`),
`required` (`:52`,`:78`,`:102`), `reparto_required` (`:130`), `visible`
(`:78`). Malformaciones cubiertas aparte (array, cadena, no-booleano,
no-string). Único hueco menor: `mutationTools` **ausente** no tiene aserto
propio (`:326` prueba basura y no-array, no omisión). Trivial, no lo
devuelvo.

### C · ¿Pueden fallar los 36 tests? — tres mutaciones MÍAS

El worker aportó M1 (fail-open) y M2 (rama ⏳ muerta). Ésas demuestran que
la puerta no se puede **abrir** sin que salte la alarma. No demuestran lo
contrario: que no se pueda **tapiar**. Un `repartoRequired: true` constante
pasaría M1 y M2 y sería igual de falso — un muro no es una puerta. Así que
corrí tres que el worker no corrió, por Vía A de la nota del vigía §2
(mutar · ejecutar · `git checkout --` · verificar árbol):

| # | mutación | resultado | qué demuestra |
| - | -------- | --------- | ------------- |
| **M3** | `repartoRequired: true` (constante) | **3 failed / 33 passed** — *sólo un `false` EXPLÍCITO…* · *no confunde «no declarado» (null)…* · *lee `reparto.required: false`…* | la suite distingue **fallar cerrado** de **estar siempre cerrado**. Es una puerta, no un muro |
| **M4** | `visible: true` (constante) | **1 failed / 35 passed** — *`visible: false` explícito se respeta* | la cara `visible` está fijada en los dos sentidos, no sólo en la ausencia |
| **M5** | eliminado el fallback a `reparto.required` | **2 failed / 34 passed** — los dos de *divergencia que el espejo del probe no ve* | el caso mínimo 2 del CA está realmente vigilado, no decorado |

Tras cada una, `git status --porcelain` **vacío**. Árbol limpio al cerrar.
Con M1+M2 del worker son **cinco** mutaciones independientes: las dos
mitades del arreglo y las dos direcciones de cada cara están cubiertas.
Descarto que estas pruebas sean de las que no pueden fallar.

### D · La decisión de diseño (`ok:false` en vez de `ok:true` + ⏳)

**Es la lectura correcta del contrato. No la devuelvo.** Tres razones,
comprobadas:

1. El argumento del worker es **verdadero en el código** (fila 4 de §A):
   con `ok:true` el ⏳ se pierde. El brief `:52-54` ofrecía esa salida
   como admisible — y **no lo era**: ver §F.
2. La cláusula transversal 1 del contrato («lo no desplegado se muestra
   ⏳; el IDE nunca presenta como sincronizado lo que no lo está») se
   aplica de lleno: un `reparto_required` no declarado es exactamente
   estado no sabido.
3. El precio está **declarado** (§3) y es el correcto para una puerta de
   permisos: un servidor que calle queda en `pending_info` con motivo
   visible, no en `ready` con una suposición. Un permiso que se degrada a
   «pendiente y dicho» es un buen fallo; uno que se degrada a «concedido y
   callado» es el que este WP existe para matar.

**Además cierra un fail-open que el brief no nombró** (nadie lo declaró,
lo encontré leyendo aguas abajo): `AuthorshipService.ts:191`
`const policy = parsed.requireRepartoLive ? '…=ON' : '…=off …'` es un test
de *truthiness* sobre `boolean | null`. **Antes** de este WP el `null`
llegaba a esa línea y la barra de estado afirmaba `=off` a partir de una
ausencia. **Después**, `ready` es inalcanzable con `null`, así que `:191`
sólo ve booleanos de verdad. Segundo orden a favor del cambio; conviene
que quede escrito para que un refactor futuro no lo reintroduzca.

### E · Hallazgos declarados — verificados de facto

- **V17-A · confirmado, y la gravedad está bien acotada.**
  `parseEditorInfo.ts:194-196` recorta los 21 caracteres de
  `'linea-editor.reparto_'`, así que `'linea-editor.reparto_requerido'` →
  `'requerido'`, que no está en los ocho. **Sí llega al usuario**: lo seguí
  hasta la UI — `AuthorshipService.ts:279` `motivo: extractMotivoFromDeny(data)`
  → `:118` `representMotivoDeny(result.motivo, known)` → el usuario lee
  *«no estaba en motivos_deny de editor://info»* de un motivo que el
  servidor **sí** publica. La contención que alega el worker es real: leí
  el orden de precedencia en `:177-197` y `decision.motivo` gana, así que
  sólo muerde cuando llega `rule` a solas. Acotación correcta; a cola,
  no a este WP.
- **V17-B · confirmado, y su alcance es MAYOR que «invalida la huella».**
  `git ls-files coverage | wc -l` = **72** ficheros trackeados, y
  `coverage/` está en `.gitignore:2` — inerte, porque `.gitignore` no
  aplica a lo ya trackeado. Con `jest.config.js:12 collectCoverage: true`,
  **toda** pasada completa los reescribe y ensucia el árbol. Consecuencia
  real: ninguna etiqueta que lleve cobertura podrá registrar jamás un PASS
  con árbol limpio, **en ninguno de los tres worktrees**, así que
  `evidencia.sh` exigirá repetir para siempre el comando más caro del
  lote. No es una fila fea: **anula la función de caché de la herramienta
  de economía**. Se arregla con `git rm -r --cached coverage/`.
  **¿Invalida la huella de evidencia del lote? NO la de V17.** La fila
  decisiva (`jest-parseEditorInfo`) se corrió con `--coverage=false` y
  árbol limpio, y yo la reproduje aparte en el HEAD actual. La única fila
  `sucio(66)` es un **FAIL** declarado, no sostiene ninguna afirmación.

### F · Hallazgos NUEVOS (míos)

1. **C-1 · `R-1` es un residual que no existe. Bórrese antes de que
   alguien abra un WP para él.** `mcpTreeView.ts:288-289` abre con
   `if (snap.availability !== 'ready' || !snap.gate)` → devuelve el nodo
   *«⏳ Autoría no ready»*. Como el caso no declarado ahora da `ok:false` →
   `pending_info`, las líneas `:309-315` son **inalcanzables justo en el
   caso que R-1 teme**. En `ready`, `gate.repartoRequired` es siempre
   declaración genuina del servidor. La propia decisión del worker dejó R-1
   sin objeto y él no lo advirtió: el arreglo que propone
   (`repartoRequiredDeclared` + rama en el árbol) sería trabajo tirado.
   Comprobado también que no hay otro consumidor: el grep de
   `gate.repartoRequired` en `src/` da sólo `mcpTreeView.ts:309,312,315`.
2. **C-2 · El campo del que cuelga toda la puerta NO está en el contrato.**
   `grep -n "reparto_required\|reparto\.required"` sobre
   `CONTRATO-IDE-OPT-IN-v1.md` = **0 aciertos**; lo único parecido es
   `resolveRequireReparto` en `:110`, que es el nombre de una función del
   servidor, no una clave del payload. El contrato fija
   `gate.reparto.motivos_deny` y el env del operador, pero **nunca fija la
   clave que transporta la exigencia**. Es decir: los fixtures del worker
   no salen del contrato (como dice §9) sino de la forma que asume el
   espejo del probe. Efecto de V17 sobre este hueco: si el servidor real
   publica la bandera con otra clave, **todo servidor real queda ahora
   permanentemente en `pending_info`** (antes el mismo desajuste producía
   apertura silenciosa). La dirección sigue siendo la correcta —cerrado y
   dicho— pero el radio creció, y eso refuerza la duda 1 del §12 con el
   motivo que allí falta. **A cola Z, junto con V17-A: el contrato debe
   nombrar el campo.** Mientras no lo haga, el prefijo y la clave son
   adivinables, no citables.
3. **C-3 · Aviso de fusión para el orquestador (toca a V16, no a V17).**
   Cuando V16 haga que el probe importe el parser real, no basta con
   cambiar el import: el espejo devuelve `motivosDeny` **en el nivel
   superior** (`scripts/probes/v08-mutacion-autoria.mjs:75,84`) mientras
   que `ParsedEditorInfo` (`parseEditorInfo.ts:8-17`) **no tiene** ese
   campo — lo anida en `gate.motivosDeny`. El probe lee `p.motivosDeny` en
   `:134, :145, :179, :181, :184, :201`. Con el parser real eso es
   `undefined.length` → **TypeError, no un probe verde**. La lectura
   estática del worker (§7) comprobó los **valores** de los cuatro
   fixtures —la verifiqué y es exacta: `:142`, `:168`, `:212` con
   `reparto_required: true` y `:197` con `false`— pero no la **forma**.
   Sólo lo miré en la copia de la rama V17; V16 puede haberlo resuelto ya
   en su worktree.
4. **C-4 · Defecto del brief (§8 de mi encargo, y lo mismo que le pasó a
   V16).** El brief `:52-54` ofrece como salida admisible «(1) con
   `ok:true` + `pendingReason` u otro canal visible». Esa opción **no era
   implementable dentro del alcance del WP**: `pendingReason` con `ok:true`
   es código muerto aguas abajo (`AuthorshipService.ts:174-188`) y el otro
   canal, `statusMessage`, está escrito a mano en `:197`. El brief ofrecía
   una elección con una rama trampa, igual que el criterio de V16 que el
   propio vigía corrigió. **El worker lo detectó y eligió bien**; lo dejo
   escrito porque el acierto fue suyo y el defecto del brief no debe
   heredarse al siguiente WP que cite este patrón. Lo demás del brief lo
   verifiqué correcto: la conducta pre-arreglo que describe (`:26-27`,
   `ok:true` + `repartoRequired:false`) es exactamente lo que hacía
   `requireRepartoLive === true` con `null`.

### G · Qué NO pude comprobar, y por qué

- **Nada ha pasado nunca por este parser desde un servidor real.** Sin
  `linea-editor` vivo (ECONNREFUSED en `:4115`) no pude remediarlo, y con
  **C-2** encima —el contrato no fija la clave— éste es el riesgo residual
  principal del WP. El worker lo declara honestamente en §9; lo confirmo y
  lo subo de importancia.
- **`npm test` completo y `tsc` completo:** no ejecutados. Caros y rojos
  por el umbral heredado, y ejecutarlos habría ensuciado los 72 ficheros de
  **V17-B**. Acepto la observación del §8 como del worker: **no la
  reproduje**.
- **`lint` con las reglas futuras de V16:** no verificable aquí
  (`.eslintrc.cjs` con `ignorePatterns: ['**/*']`). Lo que sí verifiqué de
  la nota del vigía §2: el test no tiene `any` (0 aciertos de `: any`,
  `as any`, `<any>`), no tiene tabuladores (0), usa comillas simples y la
  indentación de 4 de `src/`. Estilo conservador **cumplido**.
- **Ramas V12 y V16:** no las inspeccioné. **C-3** está dicho desde la
  copia de V17 y puede estar ya resuelto en el worktree de V16.

### H · Veredicto

**PASS.** El arreglo hace lo que dice, en el fichero que dice, y las
pruebas que lo respaldan pueden fallar —lo demostré con tres mutaciones
propias además de las dos del worker—. El alcance es exacto, los cinco
casos mínimos existen y prueban ausencia y no sólo malformación, el CA se
cumple punto por punto, y el reporte no contiene ninguna afirmación que se
me haya caído al contrastarla con el mundo: la única corrección es que el
worker se declaró **un residual de más** (C-1), no de menos.

Sin condiciones de bloqueo. Para el orquestador, en orden: **C-3** antes
de fusionar V16, **C-1** al depurar el backlog, y **C-2 + V17-A** a cola Z
como una sola pieza — el contrato tiene que nombrar los campos de los que
ya depende el IDE. **V17-B** es higiene del swarm y cuanto antes, mejor:
cada día que siga trackeado, los tres carriles repiten la pasada cara.
