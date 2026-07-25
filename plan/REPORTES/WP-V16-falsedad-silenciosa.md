# WP-V16 · Falsedad silenciosa — reporte

| dato | valor |
| ---- | ----- |
| agente | worker-V (2ª sesión — la 1ª murió a mitad; ver §0) |
| fecha | 2026-07-25 |
| rama | `wp/v16-falsedad-silenciosa` |
| worktree | `C:/S_LAB/.worktrees/v/v-sdk-wp-v16` |
| commits de obra | `94653cf` (sesión 1) · `28bb869` (sesión 2) |
| tip SHA | `28bb869cafd78f9a52bb3c85fa3b6fa881b244ab` (antes del commit de este reporte) |
| base | `1c90c43` |
| eje(s) CA | V-L1-01 · V-L1-02 · V-L1-03 · V-L1-04 · V-L1-05 |
| riesgo de revisión | `independiente` |
| revisor distinto del worker | **contrarrevisor-V** ✅ — ver §Contrarrevisión |
| estado propuesto | listo para revisión |
| VEREDICTO_REVISOR | **PASS** sin condiciones de bloqueo |

**Enmienda que manda sobre el brief:**
`C:/S_LAB/vigilancia/v/swarm/NOTA-VIGIA-lote-V12-V16-V17.md` §1. El criterio
(a) se cumple por **Vía A**: mutación temporal en `src/` dentro de este
worktree, probe en rojo, revertida y verificada con `git status --porcelain`
vacío. Ver §3.

---

## 0 · Forense de la sesión muerta (obligado antes de tocar nada)

La sesión anterior murió tras el commit `94653cf` dejando el árbol **sucio**
con `package.json` y `package-lock.json` modificados y **sin reporte**.

### Qué eran los ficheros sucios

```
 M package-lock.json
 M package.json
```

```diff
--- a/package.json
+++ b/package.json
-  "version": "0.1.0",
+  "version": "0.2.0",
```
```diff
--- a/package-lock.json
+++ b/package-lock.json
-  "version": "0.1.0-scriptorium",      (raíz y packages[""])
+  "version": "0.2.0",
```

**Diagnóstico: residuo accidental de un paso de verificación, NO obra.** Es
el `npm version 0.2.0 --no-git-tag-version` que el propio brief exige como
paso **transitorio** del CA (b), abandonado a medio camino. Tres cosas lo
confirman y ninguna admite la otra lectura:

1. El **alcance** del brief dice `package.json → SOLO el bloque "scripts". NO
   toques "version"`.
2. **FRONTERAS** dice `No subas la versión de forma permanente: 0.1.0 al
   terminar`.
3. `EVIDENCIA.md` traía la fila `package-0.2.0 | FAIL | … sucio(2) | rc=1`
   sellada a las 15:05:02Z — la sesión murió **dentro** de ese paso, con el
   bump puesto y el empaquetado reventado.

Subir la versión del producto es además una decisión de release, no de un
worker.

### Qué hice con ellos

**No los descarté a ciegas: primero cerré la demostración que estaban
sirviendo, luego los revertí.** Descartarlos sin más habría tirado el único
estado en que el CA (b) es observable.

1. Con la versión aún en 0.2.0, arreglé la causa real del `rc=1` (§2b) y
   completé el empaquetado → `dist/scriptorium-zigurat-0.2.0.vsix`.
2. `git checkout -- package.json package-lock.json`.

Reverto con `git checkout --`, **no** con el `npm version 0.1.0
--no-git-tag-version --allow-same-version` que sugiere el brief: ese comando
habría dejado el lockfile en `"version": "0.1.0"`, mientras que el valor
comiteado es `"0.1.0-scriptorium"` (ver hallazgo H-1). Habría «revertido»
dejando `package-lock.json` sucio para siempre. El `checkout` restituye el
estado exacto — y lo prueba la huella del lockfile, que vuelve a
`sha256:363c08ffd4f544da`, idéntica a la de antes del bump.

```
$ git status --porcelain      # tras revertir
                              (vacío)
$ node -p "require('./package.json').version"
0.1.0
$ node scripts/vsix.mjs name
scriptorium-zigurat-0.1.0.vsix
```

### Qué heredé como bueno

`94653cf` es obra legítima y completa de (a)…(e); la revisé fichero a fichero
antes de continuar. Lo que faltaba era: cerrar (b) —que fallaba por entorno—,
y **el reporte entero**. Las demostraciones de la sesión 1 (`out/probe-rojo.txt`,
`out/lint-rojo.txt`) las **rehíce yo** (§3): no tenían el diff aplicado
adjunto, y el brief lo exige. No firmo evidencia que no vi producir.

---

## 1 · Qué se hizo

Cuatro sitios donde la evidencia no cubría el artefacto que decía cubrir.
Ninguno fallaba: los cuatro mentían.

- **(a)** El probe V08 llevaba un **espejo reimplementado** del parser, ya
  divergido. Ahora importa la pieza real compilada, sin fallback, con
  auto-guarda contra la reaparición del espejo.
- **(b)** El nombre del `.vsix` se **deriva** de `package.json`. Muere el
  literal `…-0.1.0.vsix` en los seis sitios donde estaba, y muere el script
  fósil `package:v0`.
- **(c)** `lint` era `node -e "console.log(…)"` — verde por construcción.
  Ahora es `eslint src --ext ts` y el paso de CI **puede fallar**.
- **(d)** `release.yml` gana dos guardas contra el dispatch accidental.
- **(e)** README declara paso a paso qué condiciona el CI y qué no.

## 2 · Ficheros tocados

Todos dentro del alcance declarado. `git diff --stat 1c90c43..28bb869`:

| fichero | ± | nota |
| ------- | - | ---- |
| `scripts/probes/v08-mutacion-autoria.mjs` | +345/-141 | (a) |
| `scripts/vsix.mjs` | +210 | (b) **nuevo** — el resolutor portable que el brief autorizaba |
| `package.json` | +15/-14 | (b)(c) — **solo el bloque `"scripts"`**, verificado en el diff |
| `.eslintrc.cjs` | +67 | (c) |
| `.github/workflows/ci.yml` | +24 | (b)(c)(e) |
| `.github/workflows/release.yml` | +67 | (b)(d) |
| `README.md` | +41 | (e) |
| `plan/REPORTES/WP-V16-falsedad-silenciosa.md` | — | este reporte |

`src/**` y `tests/**`: **cero cambios netos**. Se tocó `src/` solo de forma
temporal y revertida para las demostraciones de §3, como autoriza la nota del
vigía.

### 2b · Lo que arreglé yo en esta sesión (`28bb869`)

El `package-0.2.0` heredado salía `rc=1`, y el motivo importaba: **el nombre
derivado ya funcionaba**. La salida guardada lo enseña —
`vsix.mjs: empaquetando → dist/scriptorium-zigurat-0.2.0.vsix` — y **después**
reventaba:

```
Error: Cannot find module
'C:\S_LAB\.worktrees\v\v-sdk-wp-v16\node_modules\npm\bin\npx-cli.js'
```

`scripts/vsix.mjs` invocaba `npx --yes @vscode/vsce`, y `npx` necesita
`node_modules/npm`, que no está en este árbol (node 22.21.1 en Windows). Con
`npx` roto, el CA (b) era **incomprobable en la máquina del custodio**, que es
justo donde se prueba.

Arreglo: `cmdPackage` resuelve el `bin` de `@vscode/vsce` —devDependency
`^3.6.0`, instalada— leyéndolo del manifiesto del propio paquete con
`createRequire`, y lo lanza con `process.execPath`. Sin shim `.cmd`, sin PATH,
sin shell, sin `npx`. Leer el `bin` del manifiesto (en vez de fijar la ruta)
hace que un renombrado de upstream no rompa esto. `npx` queda de respaldo si el
paquete no está instalado; `--local` pasa a significar «exige el local, sin
respaldo», para que `package:local` falle en voz alta en vez de bajarse una
copia por la red.

---

## 3 · CA (a) · Vía A — demostrado que el probe ROMPE al mutar el parser real

El brief prohíbe declarar «ahora importa el real» y dar eso por demostración.
Aquí está la demostración. **La ejecuté yo en esta sesión**, no la heredé.

### Diff aplicado (temporal)

```diff
diff --git a/src/mutation/parseEditorInfo.ts b/src/mutation/parseEditorInfo.ts
index e1a5623..95a27d1 100644
--- a/src/mutation/parseEditorInfo.ts
+++ b/src/mutation/parseEditorInfo.ts
@@ -77,7 +77,7 @@ export function parseEditorInfo(raw: unknown): ParsedEditorInfo {
               : null;

     const gate: VisibleGate = {
-        visible: g.visible !== false,
+        visible: g.visible === true,
         gateLine: typeof g.gate_line === 'string' ? g.gate_line : '',
         tokenEnv: typeof g.token_env === 'string' ? g.token_env : 'ZEUS_MCP_APPROVAL_TOKEN',
         repartoRequired: requireRepartoLive === true,
```

Invierte el **default** de `visible`: con el dato ausente, la pieza real
devolvía `true` (default del contrato) y pasa a devolver `false`.

### Probe en ROJO con el parser mutado

```
$ bash scripts/slot.sh run probe-v08-demo -- npm run probe:v08
…
FAIL: gate sin `visible` → visible (default del contrato)
…
WP-V08 probe FAIL (1)
rc=1
```

Un solo assert de 55 en rojo — exactamente el que interroga la línea mutada.
Esto es lo que el espejo **no** podía hacer: cambiar la pieza real no lo
despeinaba.

### Reverto y verificación

```
$ git checkout -- src/mutation/parseEditorInfo.ts
$ git status --porcelain
                              (vacío — ni una entrada de src/)
$ sed -n '80p' src/mutation/parseEditorInfo.ts
        visible: g.visible !== false,
```

### Probe en VERDE

Tras revertir, la huella vuelve a ser **idéntica** a la del PASS registrado
(HEAD `28bb869` · árbol limpio · lock `sha256:363c08ffd4f544da`), así que
`evidencia.sh` lo declara vigente y **no se repite el comando** — es el
protocolo de economía funcionando, no un atajo:

```
$ bash scripts/evidencia.sh vigente probe-v08     # rc=0
vigente: | 2026-07-25T15:41:52Z | probe-v08 | PASS | `28bb869…` | limpio |
`sha256:363c08ffd4f544da` | importa la pieza real out/probe/parseEditorInfo.mjs;
55 asserts verdes 0 rojos; 2 pendientes declarados |
```

Salida verde completa en `out/probe-final.txt`; cierra con
`WP-V08 probe PASS (automatizado · pieza real de src/mutation/parseEditorInfo.ts)`.

### La trampa de la FORMA: rojo por assert, no por TypeError

Aviso del orquestador (convergen dos contrarrevisiones de V17). El peligro es
real y conviene dejarlo documentado, porque es una segunda falsedad silenciosa
escondida dentro de la primera:

El espejo retirado devolvía `motivosDeny` en el **nivel superior** del objeto
(`1c90c43:scripts/probes/…:83`), mientras que `ParsedEditorInfo` lo **anida**
en `gate.motivosDeny`. Los asserts viejos (`p.motivosDeny.length === 0` en
`:134`, `:145`, `:179`, `:181`…) leían el campo de arriba. Cambiar **solo** el
import habría hecho que esos asserts lanzaran `TypeError` sobre `undefined` —
y un probe que revienta no es un probe que demuestra: sería cambiar una mentira
por un accidente.

**No ocurre aquí: los asserts están reescritos a la forma real.** Los ocho
accesos del probe actual son todos anidados:

```
$ grep -n "motivosDeny" scripts/probes/v08-mutacion-autoria.mjs
153:  assert(p.gate != null && p.gate.motivosDeny.length === 0, …)
156:  assert(!q.ok && q.gate.motivosDeny.length === 0, …)
191:  assert(p.gate.motivosDeny.length === 8, …)
193:    fixtureMotivos.every((m) => p.gate.motivosDeny.includes(m)),
196:  const texts = p.gate.motivosDeny.map((m) => representMotivoDeny(m, p.gate.motivosDeny));
199:    representMotivoDeny('inventado', p.gate.motivosDeny).includes(…),
219:  assert(p.ok && p.gate.motivosDeny.length === 2, …)
225:    sucia.gate.motivosDeny.length === 2 && …
```

Cero accesos de nivel superior, y `:153` añade guarda explícita `p.gate != null`.
Los campos que el probe **sí** lee de arriba (`p.ok`, `p.pendingReason`,
`p.mutationTools`, `p.requireRepartoLive`, `p.name`, `p.version`) son
exactamente los que `ParsedEditorInfo` declara en el nivel superior: contrastado
campo a campo contra la interfaz.

**Prueba de que el rojo de §3 es un assert y no un crash.** El probe **no tiene
un solo `try`/`catch`** (`grep -c "try {"` → 0), así que un `TypeError` sería
excepción no capturada: abortaría la corrida en el primer acceso malo y **nunca
llegaría a imprimir la línea de resumen**. Los conteos dicen lo contrario:

| corrida | PASS | FAIL | línea final |
| ------- | ---- | ---- | ----------- |
| verde (parser íntegro) | 55 | 0 | `WP-V08 probe PASS (automatizado · pieza real …)` |
| rojo (parser mutado) | **54** | **1** | `WP-V08 probe FAIL (1)` |

Los otros 54 asserts siguieron corriendo y pasando, y el resumen se imprimió.
Eso solo pasa si el fallo es el `assert` que interroga la línea mutada. Es la
demostración que pide la NOTA: verde con el parser real importado, y **rojo por
assert** al mutarlo.

### CA 1 del brief — cero reimplementación

```
$ grep -nE "^\s*(async\s+)?function\s+(parseEditorInfo|representMotivoDeny|isDeniedWithoutWrite|extractMotivoFromDeny)\s*\(" \
    scripts/probes/v08-mutacion-autoria.mjs
                              (cero coincidencias · rc=1)
```

El propio probe lleva esa guarda dentro (`assert` «sin reimplementación local
del parser en el propio probe»): si alguien vuelve a pegar el espejo, el probe
se pone rojo solo.

**Supuesto declarado para la fusión con WP-V17:** el probe **no fija** el valor
esperado de `repartoRequired` ante ausencia de dato; lo **lee** de la pieza
real y lo imprime como nota (hoy observa `repartoRequired=false`). Si V17
invierte la política a «ausencia ⇒ requerido», el probe la sigue sin editarlo.

---

## 4 · CA (b) · Nombre del `.vsix` derivado de la versión

`scripts/vsix.mjs` deriva `<publisher>-<name>-<version>.vsix` de
`package.json`. Se conserva a propósito la forma con prefijo de publisher: se
descartó `vsce package --out dist/` (que nombra `<name>-<version>`) porque
habría cambiado el nombre del asset publicado, y **la marca es obra de WP-V14**,
no de este WP.

### La versión manda sobre el nombre — comprobado en las dos direcciones

| versión en `package.json` | artefacto producido | huella |
| ------------------------- | ------------------- | ------ |
| `0.2.0` (bump temporal) | `dist/scriptorium-zigurat-0.2.0.vsix` · 32 ficheros · 1.27 MB · rc=0 | `package-0.2.0` PASS |
| `0.1.0` (revertida) | `dist/scriptorium-zigurat-0.1.0.vsix` · 32 ficheros · 1.27 MB · rc=0 | `package` PASS |

Ni un fichero de flujo tocado entre ambas corridas. Y `limpiarVsixPrevios`
retiró el `0.2.0` antes de empaquetar el `0.1.0`, de modo que el glob
`dist/*.vsix` de `ci.yml` resuelve a **exactamente uno** — comprobado: `ls
dist/*.vsix` devuelve una línea.

### Cero literales — grep en el reporte, como pide el CA 3

```
$ grep -n "0\.1\.0\|0\.0\.1\|0\.2\.0" package.json .github/workflows/ci.yml .github/workflows/release.yml
package.json:5:  "version": "0.1.0",
package.json:1523:    "@zeus/reparto-kit": "^0.1.0",
```

Dos supervivientes y ninguno es un literal de nombre de fichero: `:5` es **la**
versión canónica (la fuente de la derivación) y `:1523` es un rango semver de
dependencia. Los seis literales que había —`package.json` ×5, `ci.yml` ×1,
`release.yml` ×3— han desaparecido. `package:v0` (script fósil, V-L4-03):
**0 ocurrencias**.

> **Nota de lectura para el revisor:** `package.json:~1490` es el
> `extension-id` `scriptorium.zigurat`, **no** una versión. El literal de
> versión vivía en `:~1497` (`package:v0`). Confundirlos lleva a «arreglar» la
> identidad de la extensión.

Portabilidad: toda la resolución ocurre en node. Ni `$npm_package_version` (no
expande en cmd.exe) ni `npx` (roto en esta máquina, §2b). El CI corre ubuntu y
el custodio prueba en Windows; este camino sirve a los dos.

---

## 5 · CA (c) · El lint ya no puede pasar mintiendo

Elegido el camino 1 del brief (**`lint` ejecuta eslint de verdad**), con dato,
no con gusto. Censo de una pasada sobre `src` (etiqueta `eslint-censo`):
**371 errores en 102 ficheros, 8 reglas**.

| regla | ocurrencias |
| ----- | ----------- |
| `@typescript-eslint/no-explicit-any` | 248 |
| `@typescript-eslint/no-unused-vars` | 107 |
| `no-case-declarations` | 6 |
| `@typescript-eslint/no-var-requires` | 5 |
| `prefer-const` | 2 |
| `no-useless-escape` | 1 |
| `no-prototype-builtins` | 1 |
| `no-self-assign` | 1 |

Poner las 371 en `error` habría dejado el CI rojo desde el minuto uno y el
arreglo exige escribir en `src/**`, fuera de alcance. Ponerlas en `off` habría
reinstalado el verde por construcción con otro disfraz. Decisión: **esas 8 en
`warn` con su recuento anotado** (deuda visible en cada corrida) y **el resto
del conjunto recomendado —unas 90 reglas con CERO violaciones en el legado— en
`error`**. Se descartó un `--max-warnings` como trinquete: acoplaría el CI a
cualquier WP que añada un `any`.

### Reglas exactas que activo (para el orquestador y para V17)

Como pide la nota del vigía §2. `extends`: `eslint:recommended` +
`plugin:@typescript-eslint/recommended` (sin type-checking).
`parser: @typescript-eslint/parser`, `ecmaVersion: 2022`, `sourceType: module`.
`ignorePatterns`: `dist/`, `out/`, `node_modules/`, `.vscode-test/`.
Rebajadas a `warn`: las 8 de la tabla. **Todo lo demás del recomendado queda en
`error`.**

**Alcance del lint: solo `src/**/*.ts`.** `tests/**` y `scripts/**` NO se
lintan hoy. Consecuencia buscada: el fichero nuevo de WP-V17
(`tests/unit/parseEditorInfo.test.ts`) **no queda acoplado** a estas reglas.
El estilo conservador que V17 escribió previendo esto no le sobra —protege
ante un futuro en que `tests/` entre al lint— pero hoy no hay colisión posible.

### Demostrado que el paso PUEDE fallar (Vía A, mutación revertida)

Que un lint salga verde no prueba que sea capaz de ponerse rojo. Aquí está:

```diff
@@ -20,6 +20,7 @@ export interface ParsedEditorInfo {
 export function parseEditorInfo(raw: unknown): ParsedEditorInfo {
+    debugger;
     if (raw == null) {
```

```
$ bash scripts/slot.sh run lint-demo -- npm run lint
C:\S_LAB\.worktrees\v\v-sdk-wp-v16\src\mutation\parseEditorInfo.ts
  23:5  error  Unexpected 'debugger' statement  no-debugger
✖ 372 problems (1 error, 371 warnings)
rc=1
```

`no-debugger` está en el recomendado y **no** entre las 8 rebajadas: código
nuevo que viole el recomendado pone el paso de CI en rojo. Revertido:
`git checkout -- src/mutation/parseEditorInfo.ts`; `git status --porcelain`
vacío.

Estado limpio: `rc=0`, `✖ 371 problems (0 errors, 371 warnings)`.

---

## 6 · CA (d) · Guarda del release manual — **ESTÁTICA · ⏳ NO ejecutada**

> **Esto NO es un PASS.** No se puede disparar el flujo sin un release real, y
> este WP no empuja a `main` ni lanza releases. Lo verificado es **el YAML
> leído**, nada más. Cualquiera que lea esta sección como «probado» está
> leyendo mal.

Dos guardas en `release.yml`, ambas sin interruptor de bypass (un botón para
saltarse la guarda la anula):

1. **`workflow_dispatch` solo desde `main`** — primer paso del job, **antes
   incluso del checkout**, para que aborte en voz alta:
   `if: github.event_name == 'workflow_dispatch' && github.ref != 'refs/heads/main'` → `exit 1`.
2. **El tag no puede tener release publicado** — `gh release view "$TAG"`; si
   existe, `exit 1`. Va **antes** de `npm ci` para abortar sin gastar el
   runner. Republicar exige retirar el release a mano: decisión consciente y
   con rastro.

Lo que motivaba la guarda: `softprops/action-gh-release` **actualiza** un
release existente, así que un dispatch accidental desde una rama de trabajo
pisaba el asset ya publicado.

| aspecto | estado |
| ------- | ------ |
| YAML presente y con la lógica descrita | ✅ estático |
| dispatch desde rama ≠ main aborta de verdad | ⏳ no ejecutado contra GitHub |
| tag con release existente aborta de verdad | ⏳ no ejecutado contra GitHub |
| `gh` disponible en el runner de Actions | ⏳ no comprobado (viene preinstalado en `ubuntu-latest`, pero no lo he visto correr) |

---

## 7 · CA (e) · Qué verifica el pipeline y qué NO

Declarado en `README.md` §«Qué verifica el pipeline» y aquí. **Un CI en verde
no quiere decir «el producto funciona».**

| paso de `ci.yml` | qué comprueba | ¿condiciona el resultado? |
| ---------------- | ------------- | ------------------------- |
| `npm ci` | instala deps (incluye registro privado) | **sí** |
| `npm run lint` | eslint sobre `src/**/*.ts` | **sí** (desde este WP) |
| `npm run compile:production` | el bundle de esbuild se genera | **sí** |
| `npm run probe:v08` | compila e importa la pieza real; contrato `editor://info` | **sí** (desde este WP) |
| `npm test` | jest del legado — `continue-on-error` | **NO** |
| `npm run package:v1` | `vsce package` produce el `.vsix` | **sí** |

Lo que el pipeline **no** comprueba:

- **No arranca la extensión en un VS Code real.** Que el `.vsix` se construya
  no dice nada de que instale ni de que funcione.
- **No linta `tests/**` ni `scripts/**`** — solo `src`.
- **El resultado de jest no condiciona nada** (`continue-on-error`).
- El smoke vivo del probe V08 contra `linea-editor` sale `⏳` sin servidor, y
  **en CI nunca hay servidor**.
- `release.yml` corre `npm ci` → `compile:production` → `vsce package` y **ya**:
  sin lint, sin tests, sin probes.

---

## 8 · Evidencia (transcrita de `EVIDENCIA.md`, que está gitignorado)

Huella = HEAD + árbol limpio + hash de `package-lock.json`. Un árbol sucio
nunca está vigente: por eso las demostraciones (que **necesitan** el árbol
sucio) figuran como filas informativas y jamás se citarán como vigentes.

| sello (UTC) | etiqueta | resultado | HEAD | árbol | lockfile | nota |
| ----------- | -------- | --------- | ---- | ----- | -------- | ---- |
| 14:54:18Z | npm-ci | PASS | `1c90c43` | limpio | `sha256:363c08ffd4f544da` | 1543 paquetes en 27s; registro privado @zeus/@alephscript resuelto |
| 14:55:48Z | eslint-censo | PASS | `1c90c43` | sucio(1) | `sha256:363c08ffd4f544da` | 371 errores/102 ficheros; 8 reglas (any 248, unused-vars 107, resto 16) |
| 15:03:35Z | lint | PASS | `94653cf` | limpio | `sha256:363c08ffd4f544da` | eslint src --ext ts: 0 errores, 371 avisos |
| 15:03:45Z | probe-v08 | PASS | `94653cf` | limpio | `sha256:363c08ffd4f544da` | importa la pieza real; 55 asserts verdes, 0 rojos |
| 15:04:00Z | probe-v08-demo | FAIL | `94653cf` | sucio(1) | `sha256:363c08ffd4f544da` | *(sesión 1 — demo Vía A; rehecha en la sesión 2, ver 15:42:53Z)* |
| 15:04:23Z | lint-demo | FAIL | `94653cf` | sucio(1) | `sha256:363c08ffd4f544da` | *(sesión 1 — rehecha en la sesión 2, ver 15:43:36Z)* |
| 15:05:02Z | package-0.2.0 | **FAIL** | `94653cf` | sucio(2) | `sha256:bfda1c0c8a301ff1` | rc=1 — **aquí murió la sesión 1**; causa: `npx` sin `node_modules/npm` (§2b) |
| 15:40:20Z | package-0.2.0 | PASS | `94653cf` | sucio(3) | `sha256:bfda1c0c8a301ff1` | vsce local (sin npx): `dist/scriptorium-zigurat-0.2.0.vsix` 32 ficheros 1.27MB — el nombre derivado sigue a la versión |
| 15:41:44Z | lint | PASS | `28bb869` | limpio | `sha256:363c08ffd4f544da` | 0 errores, 371 avisos (8 reglas en warn); el paso de CI puede fallar |
| 15:41:52Z | probe-v08 | PASS | `28bb869` | limpio | `sha256:363c08ffd4f544da` | pieza real `out/probe/parseEditorInfo.mjs`; 55 verdes 0 rojos; 2 ⏳ declarados |
| 15:42:17Z | package | PASS | `28bb869` | limpio | `sha256:363c08ffd4f544da` | `dist/scriptorium-zigurat-0.1.0.vsix` 32 ficheros 1.27MB; retirado el 0.2.0 → exactamente un vsix para el glob |
| 15:42:53Z | probe-v08-demo | FAIL | `28bb869` | sucio(1) | `sha256:363c08ffd4f544da` | **Vía A**: `parseEditorInfo.ts:80` `!== false` → `=== true`; probe ROJO 1/55. Esperado |
| 15:43:36Z | lint-demo | FAIL | `28bb869` | sucio(1) | `sha256:363c08ffd4f544da` | **Vía A**: `debugger` en `:23` → lint rc=1 (1 error `no-debugger`). Esperado |

Los dos `FAIL` finales son **resultados buscados**: son la prueba de que las
guardas muerden. Un revisor que los lea como fallos del WP los está leyendo al
revés.

**Sobre las filas ajenas** (nota del vigía §3): las siete filas anteriores a
`15:40:20Z` las escribió la sesión 1 de este mismo worker en este mismo
worktree, y son coherentes con `94653cf`. No encontré registros de procedencia
desconocida. Las dos demos de la sesión 1 las **rehíce** en vez de citarlas
(§0).

**Ejecuciones evitadas por el protocolo:** tras revertir las mutaciones de §3,
`vigente lint`, `vigente probe-v08` y `vigente package` devuelven **rc=0** con
la huella `28bb869 · limpio · sha256:363c08ffd4f544da` — tres comandos caros no
repetidos. `npm ci` no se re-ejecutó en toda la sesión: el lockfile no cambió
(y el bump temporal lo devolvió a su hash exacto).

**Uso de la ranura:** todos los comandos caros pasaron por
`bash scripts/slot.sh run <etiqueta> -- …`. Ninguno se lanzó a pelo. La ranura
estaba libre en cada toma; cero esperas.

---

## 9 · Honestidad · lo que NO está probado (⏳)

| # | asunto | estado |
| - | ------ | ------ |
| ⏳1 | Guardas de `release.yml` (CA d) | **estático**. No se disparó nada contra GitHub. Ver §6 |
| ⏳2 | `ci.yml` no se ha ejecutado en Actions | Los cambios de CI están verificados **localmente**, comando a comando, en Windows. El runner es `ubuntu-latest` y ahí no ha corrido nadie |
| ⏳3 | Smoke vivo del probe V08 contra `linea-editor` | `127.0.0.1:4115` ECONNREFUSED. El probe lo declara `⏳`, no lo finge |
| ⏳4 | `ZEUS_LINEA_EDITOR_REQUIRE_REPARTO` | ausente; demo verde/rojo de esa variable sigue pendiente (heredado de V08) |
| ⏳5 | El `.vsix` producido no se instaló en VS Code | Se construye (32 ficheros, 1.27 MB). Que instale y funcione **no está comprobado** en este WP |
| ⏳6 | `gh` en el runner de Actions | La guarda 2 depende de `gh release view`. Preinstalado en `ubuntu-latest` según doc, no verificado por mí |

Ninguna de estas se cuenta como PASS en ninguna parte del reporte.

---

## 10 · Hallazgos NO arreglados (fuera de alcance — para el orquestador)

**H-1 · `package-lock.json` desincronizado de `package.json`.** El lockfile se
identifica como `"name": "scriptorium-vscode-extension"`, `"version":
"0.1.0-scriptorium"`; el manifiesto dice `"name": "zigurat"`, `"version":
"0.1.0"`. Son nombre y versión de **antes** del rebautizo de WP-V10. Lo
descubrí porque el reverto sugerido por el brief (`npm version 0.1.0
--allow-same-version`) habría dejado el lockfile sucio de forma permanente.
No lo toco: `package-lock.json` no está en mi alcance y regenerarlo dispara un
`npm install` completo con cambios impredecibles en el árbol de deps.
**Riesgo real:** cualquier flujo que resuelva la versión desde el lockfile (o
un `npm ci` estricto en un npm futuro) leerá un valor equivocado. Merece su
propio WP.

**H-2 · `npx` está roto en la máquina del custodio.** `npx` aborta con
`Cannot find module …/node_modules/npm/bin/npx-cli.js` (node 22.21.1, Windows,
sin `npm` instalado como dependencia del árbol). Yo lo esquivé en
`scripts/vsix.mjs`, **pero cualquier otro script o WP que dependa de `npx`
fallará igual en local aunque funcione en CI**. Vale la pena un barrido de
`npx` en el repo. Este es exactamente el patrón del WP —algo que pasa en un
sitio y no en el otro— y por eso lo dejo escrito en vez de solo arreglar el mío.

**H-3 · 371 avisos de lint son deuda, no limpieza.** Las 8 reglas en `warn`
(248 `any` + 107 `no-unused-vars` a la cabeza) siguen ahí. El siguiente paso
—subirlas a `error` una por una— exige escribir en `src/**` y no es de este WP.

**H-4 · `release.yml` publica sin lint, sin tests y sin probes.** Corre `npm
ci` → `compile:production` → `vsce package` y nada más. Está **declarado** en
README y en el cuerpo del release (esa era la CA), pero declarar no es
arreglar: hoy se puede publicar un `.vsix` que el CI habría rechazado. No lo
cambio porque endurecer el flujo de release no es un CA de este WP.

**H-5 · Un `.vsix` de 1.27 MB con `dist/extension.js` de 3.07 MB sin
comprimir.** Observación al pasar, sin acción.

**H-6 · `coverage/` está TRACKEADO y jest lleva `collectCoverage: true`.**
Aviso del orquestador, confirmado en este worktree: `git ls-files coverage/`
devuelve **72 ficheros trackeados** y `jest.config.js:12` fuerza cobertura.
Consecuencia: **cualquier pasada de jest ensucia el árbol y, por tanto,
invalida el registro de `evidencia.sh` — no solo el propio, sino el de todos
los worktrees que compartan la comparación de huella**. Es un tercer caso del
patrón de este WP: la herramienta de evidencia queda envenenada por un efecto
secundario que nadie declaró.

Mitigación acordada: ejecutar siempre `jest --coverage=false` (precedente de
V17). **En este WP no aplicó**: no ejecuté jest ni una vez —las etiquetas de
`EVIDENCIA.md` son `npm-ci`, `eslint-censo`, `lint`, `lint-demo`, `probe-v08`,
`probe-v08-demo`, `package`, `package-0.2.0`, ninguna de test— y `git status
--porcelain coverage/` sale vacío. Lo dejo escrito porque el arreglo de fondo
(sacar `coverage/` del índice y ponerlo en `.gitignore`) no es de mi alcance y
va a seguir mordiendo a quien corra la suite.

**H-7 · La identidad git no distingue agentes.** Los tres roles del carril
firman como `worker-V <alephscriptorium@gmail.com>` / `contrarrevisor-V
<…>` con el **mismo correo**, y el `git config` del repo sigue con el
placeholder («Your Name»), así que todos usamos `-c user.name=…` sobre la
misma cuenta. **Para el incidente de escritor concurrente esto importa: la
autoría de un commit no permite atribuir una escritura a un agente
concreto.** Lo único que discrimina hoy es el worktree en que se hizo. Si se
quiere trazabilidad por agente, hace falta una identidad por sesión (p. ej.
`worker-V-v16`), y eso es decisión de gobierno, no mía.

## 11 · Dudas para el custodio / orquestador

1. **H-1** ¿regenerar el lockfile es una decisión de DV o basta un WP de
   mantenimiento? Toca la reproducibilidad de `npm ci` en CI.
2. Al fusionar: **activé reglas de lint** (§5), así que —como pide la nota del
   vigía §2— hace falta re-verificar `lint` **después** de fusionar V17. La
   huella cambia al fusionar y `evidencia.sh` lo va a exigir; esa pasada sí
   hace falta.
3. El orden de fusión V16/V17 no me afecta técnicamente (el probe lee la
   política del parser en vez de fijarla), pero **si V17 entra primero**, la
   nota que imprime el probe pasará de `repartoRequired=false` a `true` sin que
   nadie edite el probe. Es lo diseñado; que no sorprenda al revisor.

---

## 12 · Fronteras respetadas

- **No** fusioné a `main`. **No** hice rebase sobre main. **No** pusheé.
- **No** escribí `plan/BACKLOG.md`. **No** cerré ninguna `DV-nn`.
- **No** creé tags ni releases. **No** hice force-push ni reescribí historia.
- `C:/S_LAB/z-sdk`, `C:/S/scriptorium/**` y OASIS: **no tocados** (solo lectura).
- **No** maté el watcher de `C:/S_LAB/vigilancia/v/`.
- Versión del producto: **0.1.0**, como estaba. El bump a 0.2.0 fue transitorio
  y está revertido (§0).
- `src/**` y `tests/**`: cero cambios netos; solo las mutaciones temporales y
  revertidas de §3, autorizadas por la nota del vigía §1.
- Marca del producto (DV-16): **sin cadenas nuevas**. Es obra de WP-V14.
- Identidad git: `worker-V <alephscriptorium@gmail.com>` en ambos commits,
  vía `git -c user.name=… -c user.email=…` para no pisar la config compartida
  por los tres worktrees del lote (que sigue trayendo el placeholder).

---

## 13 · Estado de los 5 CA de L1

| CA | asunto | estado |
| -- | ------ | ------ |
| **(a)** | probe importa el parser real y **ROMPE** al mutarlo (Vía A) | **PASS** |
| **(b)** | nombre del `.vsix` derivado de la versión, cero literales | **PASS** |
| **(c)** | el lint puede fallar (demostrado en rojo) | **PASS** |
| **(d)** | guarda del release manual | **⏳ ESTÁTICA** — no ejecutada contra GitHub |
| **(e)** | declarado qué verifica el pipeline y qué no | **PASS** |

---

VEREDICTO_REVISOR: **PASS** — contrarrevisión independiente (ver §Contrarrevisión). Sin condiciones de bloqueo; fusión con V17 verificada en verde ejecutando el probe contra el parser de `main`.

---

## Contrarrevisión

| dato | valor |
| ---- | ----- |
| agente | contrarrevisor-V (distinto del worker) |
| fecha | 2026-07-25 |
| objeto | `1c90c43..3ed5c16` · obra `94653cf` + `28bb869` · reportes `5463810` + `3ed5c16` |
| árbol al empezar | limpio · ranura libre · **sin escritor concurrente** (comprobado en `.slot.log` antes de tocar nada, lección de WP-V17) |
| **veredicto** | **PASS** — sin condiciones de bloqueo |

### A · La comprobación que ninguno de los dos workers podía hacer solo

`main` avanzó a `2899732` **mientras yo revisaba**: WP-V17 ya está fusionado.
Eso convierte la pregunta cruzada del lote en algo comprobable de verdad, y
era el punto caliente nº 1 del encargo. No lo razoné: lo ejecuté.

**Sustituí el parser de este worktree por el de `main` (V17) y corrí el probe.**
Vía A de la nota del vigía §1 — temporal, revertida, verificada:

```
blob v16 (pre-V17)  : e1a56230477fb2ef4dfca92b88576e605eb25128
blob main (V17)     : 50416186df499f531831fa503423f23316cd1023
$ git cat-file blob 5041618 > src/mutation/parseEditorInfo.ts
$ bash scripts/slot.sh run contrarrev-v16-merge -- npm run probe:v08
        …
        WP-V08 probe PASS (automatizado · pieza real de src/mutation/parseEditorInfo.ts)
        rc=0
$ git checkout -- src/mutation/parseEditorInfo.ts
blob restaurado     : e1a56230477fb2ef4dfca92b88576e605eb25128
$ git status --porcelain      → vacío
```

**El probe de V16 pasa en verde contra el parser de V17.** La fusión es
compatible en cualquier orden, y el diseño del §3 —leer la política de la
pieza real en vez de clavarla— **funciona de hecho, no solo sobre el papel**:

| parser importado | nota que imprime el probe | resultado |
| ---------------- | ------------------------- | --------- |
| V16 (pre-V17, `e1a5623`) | `repartoRequired=false` | **PASS** |
| V17 (`5041618`, el de `main`) | `repartoRequired=true` (derivado: `null !== false`) | **PASS** |

La duda 3 del §11 queda **resuelta afirmativamente**, y el aviso FA-1 que yo
mismo levanté al contrarrevisar V17 —«el probe se romperá en la fusión por
forma»— queda **cerrado**: no se rompe, porque este WP reescribió los asserts
a la forma anidada antes de que llegara el momento. Esa era exactamente la
trampa, y el worker la vio y la desactivó (§3 «La trampa de la FORMA»).

### B · ¿Muerden los asserts? Una mutación más dura que la del worker

El worker demostró el rojo invirtiendo el default de `visible` (1 de 55). Esa
mutación es válida pero **suave**: toca una línea que ningún espejo había
divergido. La pregunta que de verdad importa en este WP es otra: *si alguien
reintroduce el bug del espejo, ¿lo caza el probe?*

Apliqué **M-A**: reintroducir textualmente la reimplementación divergida,
`const requireRepartoLive = !!g.reparto_required` (el `:84` del espejo
retirado), sustituyendo las dos rutas + `null` de la pieza real.

```
FAIL: dato por gate.reparto.required → true (ruta que el espejo ignoraba)
FAIL: reparto_required no-booleano → null (no se coacciona con !!)
FAIL: ausencia total del dato → requireRepartoLive null
FAIL: tipo inválido se trata como ausencia
WP-V08 probe FAIL (4)
```

Cuatro asserts en rojo, **incluido el que lleva el nombre del pecado**. Y el
resumen final se imprimió: es rojo **por assert, no por excepción**, lo que
confirma de forma independiente la tabla del §3. Revertido; `git status
--porcelain` vacío; blob de vuelta a `e1a5623`.

Con la demo del worker son **dos mutaciones independientes** y la mía ataca
justo la regresión que este WP existe para impedir. **Descarto que este probe
sea de los que no pueden fallar.**

### C · Lo demás, comprobado contra el mundo

| # | afirmación | cómo la comprobé | resultado |
| - | ---------- | ---------------- | --------- |
| 1 | alcance = 8 ficheros del brief | `git diff --name-status 1c90c43..3ed5c16` | ✅ probe · `vsix.mjs` (nuevo, autorizado) · `package.json` · `.eslintrc.cjs` · `ci.yml` · `release.yml` · `README.md` · reporte. **Cero de más.** `src/**` y `tests/**` sin cambio neto |
| 2 | `package.json`: **solo** el bloque `scripts` | `git diff … -- package.json \| grep ^@@` → 3 hunks, todos en `1466-1503` | ✅ `version`, `contributes`, `dependencies` y la marca intactas |
| 3 | CA 1 · cero reimplementación | el grep del brief, mío | ✅ **rc=1**, cero. Y el probe lleva la auto-guarda dentro (`:109-118`), así que la regresión se caza sola |
| 4 | cero accesos de nivel superior a `motivosDeny` | `grep -n motivosDeny … \| grep -v "gate.motivosDeny"` | ✅ **rc=1**: los ocho son anidados |
| 5 | el probe no tiene `try/catch` | `grep -c "try {"` → **0** | ✅ sostiene el argumento «rojo por assert» del §3 |
| 6 | «55 asserts» | `grep -c "assert("` → **54** | ✅ **cuadra, y explico por qué para que nadie tropiece**: 54 − 1 (la *definición* `function assert(`) = 53 llamadas estáticas; el bucle de `:130-133` corre **3** veces (+2) ⇒ **55** en ejecución. No hay discrepancia |
| 7 | CA (b) · cero literales de versión | el grep del CA, mío | ✅ solo `package.json:5` (la versión canónica, fuente de la derivación) y `:1523` (rango semver `^0.1.0` de dependencia). Ni un nombre de fichero |
| 8 | `package:v0` muerto | `grep -rn "package:v0"` | ✅ **0** en el árbol; la única mención viva es la del propio brief |
| 9 | la versión quedó revertida | `node -p require('./package.json').version` · `node scripts/vsix.mjs name` | ✅ `0.1.0` · `scriptorium-zigurat-0.1.0.vsix` |
| 10 | la huella del lockfile volvió exacta | `sha256sum package-lock.json` | ✅ **`sha256:363c08ffd4f544da`**, idéntica a la de antes del bump. La decisión del §0 está respaldada por el dato |
| 11 | H-1 real | `node -p` sobre ambos manifiestos | ✅ lock = `scriptorium-vscode-extension` / `0.1.0-scriptorium`; pkg = `zigurat` / `0.1.0`. Desincronía confirmada |
| 12 | H-2 · `npx` ya no se usa | `grep -rn npx` sobre json/yml/mjs/cjs | ✅ el **único** `npx` que queda es el respaldo guardado de `vsix.mjs:165`, inalcanzable cuando `@vscode/vsce` está instalado. Ver §E.3 |
| 13 | `vsix.mjs name/path` funciona antes de `npm ci` | lectura de `vsix.mjs:64-88` | ✅ `manifest()` solo lee `package.json`; no toca `node_modules`. El paso `Resolve .vsix name` (`release.yml:60-64`) está **antes** de `npm ci` (`:110`) y **no** es un fallo latente |
| 14 | CA (d) · las dos guardas, sin bypass | lectura de `release.yml` entero | ✅ guarda 1 en `:33-37` (primer paso, antes del checkout); guarda 2 en `:71-80`, **antes** de `npm ci` (`:110`). El único `input` de `workflow_dispatch` es `reason` (informativo): **no hay interruptor de bypass** |
| 15 | CA (e) · el README declara lo que NO cubre | `git diff … -- README.md` | ✅ tabla paso a paso + lista explícita de lo no comprobado, incluida la frase «un CI en verde **no** quiere decir que el producto funciona» |
| 16 | CI ya no tiene verde por construcción | `.eslintrc.cjs` actual vs `git show 1c90c43:.eslintrc.cjs` | ✅ el anterior era `ignorePatterns: ['**/*']` — **no podía analizar nada**. Ahora ignora solo `dist/ out/ node_modules/ .vscode-test/` y el `lint` es `eslint src --ext ts` |

**Economía.** `evidencia.sh vigente probe-v08` → **rc=1** (no vigente: el PASS
del worker está sellado en `28bb869` y el tip es `3ed5c16`), así que no cité:
ejecuté. Todo por `slot.sh`. Fila añadida:

| sello (UTC) | etiqueta | resultado | HEAD | árbol | lockfile | nota |
| ----------- | -------- | --------- | ---- | ----- | -------- | ---- |
| 2026-07-25T~18:00Z | probe-v08-contrarrevision | PASS | `3ed5c16` | limpio | `sha256:363c08ffd4f544da` | verde con parser V16 **y** con parser V17 (`5041618`) — fusión compatible |

### D · La pregunta del encargo sobre `tests/**`: la respondo con censo, no con opinión

Se me pidió juzgar si excluir `tests/**` del lint «esconde deuda». El worker
decidió el alcance de `src` **con censo** (371, tabla por regla) pero decidió
la **exclusión sin ninguno**: nadie sabía cuánta deuda quedaba fuera. Ese es
el hueco metodológico, medido contra el propio listón del WP («decide con
dato, no con gusto»). Así que hice el censo que faltaba:

```
$ npx eslint tests scripts --ext ts,mjs,js        # con la config de este WP
✖ 121 problems (59 errors, 62 warnings)
```

Y desglosado, el resultado **exonera la decisión**:

| errores | regla / fichero |
| ------- | --------------- |
| **56** | `no-undef` — **todos en `tests/mocks/vscode.mock.js`** (un `.js` sin `env: jest`; es configuración ausente, no código malo) |
| 1 | `no-inner-declarations` · `scripts/probes/v09-elenco-separacion.mjs` |
| 1 | `@typescript-eslint/ban-ts-comment` · `tests/integration/…` |
| 1 | `@typescript-eslint/ban-types` · `tests/setup.ts` |

Por directorio: `tests` 58 · `scripts` **1**. Y el dato que más importa:

> **`scripts/vsix.mjs` → 0 errores, 0 avisos. `scripts/probes/v08-mutacion-autoria.mjs` → 0 errores, 0 avisos.**

**Conclusión: excluir `tests/**` es correcto y no esconde deuda de fondo.** Lo
que hay fuera son ~3 incidencias reales más un `env` de jest sin declarar en
un fichero de mocks; nada que justifique retrasar este WP, y nada parecido a
las 371 de `src`. Además —y esto es lo que temía y no ocurre— **el código
nuevo que introduce este WP pasaría su propio lint sin tocar una coma**: el WP
no se exime a sí mismo de la honestidad que instala. Queda como dato para
quien amplíe el alcance más adelante (empezar por un `overrides` con
`env: {jest: true}` se lleva 56 de los 59 de un golpe).

### E · Juicio sobre las decisiones que se me pidió juzgar

1. **Los ficheros sucios heredados (§0) — decisión correcta y bien
   respaldada.** El worker no descartó a ciegas: completó primero el
   empaquetado con la versión aún en `0.2.0` (único estado en que el CA (b) es
   observable) y **luego** revirtió. Y descartó el `npm version 0.1.0
   --allow-same-version` del brief con razón demostrable: el lockfile comitea
   `"0.1.0-scriptorium"` (H-1), así que ese comando lo habría dejado en
   `"0.1.0"` — sucio **para siempre**. Lo verifiqué: la huella vuelve a
   `sha256:363c08ffd4f544da`, exacta. **Aquí el worker corrigió el brief con
   dato, que es justo lo que la nota del vigía §4 pide.**
2. **CA (c) · el camino elegido es el honesto.** El anterior `ignorePatterns:
   ['**/*']` hacía imposible que el lint viera nada; ahora el recomendado
   completo está en `error` salvo 8 reglas censadas en `warn`. Descartar
   `--max-warnings` está argumentado (acoplaría el CI a cualquier WP que añada
   un `any`) y lo comparto. **Matiz honesto:** sin trinquete, la deuda en
   `warn` solo puede crecer; está elevado como H-3 y es la elevación correcta.
3. **H-1, H-2, H-4 · bien acotados y bien NO arreglados.** Los tres caen fuera
   del alcance escrito y arreglarlos habría roto la disjunción del lote.
   - **H-1**: real (verificado), y bien razonado que regenerar el lockfile es
     un WP propio.
   - **H-2**: real, pero **más estrecho de lo que sugiere el reporte**. Dice
     «vale la pena un barrido de `npx` en el repo»; el barrido **ya está
     hecho**: no queda ni un uso de `npx` fuera del respaldo guardado de
     `vsix.mjs:165`. El riesgo residual **en este repo** es nulo; el hallazgo
     sigue valiendo como aviso para futuros WP. Precisión, no corrección.
   - **H-4**: real y correctamente no arreglado — endurecer el release no es
     CA de este WP. Ver §F.1, que le añade un caso concreto.

### F · Hallazgos míos, fuera de alcance

1. **F-1 · El tag puede no corresponderse con la versión del artefacto, y
   ninguna guarda lo ve.** `release.yml:51-56` resuelve el tag de
   `GITHUB_REF_NAME` en un push de tag, mientras el `.vsix` se deriva de
   `package.json`. Empujar `v9.9.9` con `package.json` en `0.1.0` publica un
   release **llamado `v9.9.9`** con el asset **`scriptorium-zigurat-0.1.0.vsix`**
   y un cuerpo que nombra el `0.1.0`. La guarda 2 no lo detecta (busca un
   release de `v9.9.9`, que no existe) y la guarda 1 no aplica (el evento es
   `push`, no `workflow_dispatch`). **No lo introduce este WP** —el literal
   anterior producía el mismo desajuste— y **no es su CA**, pero es
   exactamente el patrón que da nombre al WP: *el nombre publicado no cubre el
   artefacto que publica*. Arreglo natural y barato, en la línea de las otras
   dos guardas: un tercer paso que aborte si
   `"v$(node -p "require('./package.json').version")" != "$TAG"`.
   **Candidato fuerte para el WP que recoja H-4.**
2. **F-2 · La guarda 2 es check-then-act con ventana ancha.** Entre
   `gh release view` (`:71-80`) y la publicación (`:118`) corren `npm ci`,
   compilación y empaquetado — minutos. `concurrency` agrupa por
   `github.ref`, así que un push de tag y un dispatch desde `main` caen en
   **grupos distintos** y pueden solaparse. Inherente al enfoque y muy de
   borde; lo anoto porque el reporte presenta la guarda como definitiva y
   conviene que se lea como «cierra el accidente frecuente», no «cierra la
   carrera».
3. **F-3 · La rutina `run()` de `vsix.mjs:106-117` cita los argumentos a mano
   para Windows** (`\`"${a}"\`` con `shell: true`). Hoy es inocuo —los
   argumentos son literales del propio script— pero es una vía de inyección si
   alguna vez se pasa un valor externo (p. ej. una ruta con espacios y
   comillas desde CI). Observación preventiva, sin acción pedida.

### G · Qué NO pude comprobar, y por qué

- **CA (d) sigue ⏳ y así debe quedar.** Verifiqué el YAML línea a línea
  (§C.14) y **no disparé nada contra GitHub**, como manda el encargo. Que las
  guardas *aborten de verdad* en Actions no está probado por nadie, y el §6
  del reporte lo dice con todas las letras y con la tabla desglosada. **Es la
  sección más honesta del reporte y la suscribo entera.** Un revisor que la
  lea como PASS la está leyendo mal.
- **`gh` en el runner** (⏳6): no comprobado. La guarda 2 depende de que exista
  en `ubuntu-latest`. Viene preinstalado según doc, pero **si algún día no
  está, `gh release view` falla y el `if` da falso ⇒ la guarda deja pasar**.
  Es un fallo-abierto latente que ni el worker ni yo podemos cerrar sin correr
  el flujo. Lo dejo dicho porque encaja con el tema del WP.
- **`ci.yml` no se ha ejecutado en Actions** (⏳2). Los pasos los verifiqué
  localmente en Windows; el runner es ubuntu. No afirmo nada sobre él.
- **El `.vsix` no se instaló en VS Code** (⏳5). Que se construya (32 ficheros,
  1.27 MB) no dice que instale. No lo reproduje: `package` estaba vigente y
  re-empaquetar no habría hablado de eso.
- **Smoke vivo contra `linea-editor`** (⏳3): ECONNREFUSED en `:4115`. El probe
  lo declara `⏳` en vez de fingirlo — comprobado en mi propia salida.
- **No re-corrí `npm ci` ni el censo de `src`**: el lockfile no cambió
  (huella idéntica) y el censo de 371 es una observación del worker que no
  contradice nada de lo que sí medí.

### H · Veredicto

**PASS.** Las cuatro falsedades que el WP venía a cortar están cortadas, y lo
comprobé de forma independiente en las cuatro: el probe importa la pieza real
y **muerde** (mutación mía, 4 rojos, la más dura que la del worker), el nombre
del `.vsix` se deriva y no queda un literal, el lint **puede fallar** y ya no
es un `console.log`, y el release tiene dos guardas sin bypass —declaradas
como estáticas, que es lo correcto—. El alcance es exacto, la versión quedó
revertida con la huella del lockfile como prueba, y los hallazgos elevados son
reales y están bien no-arreglados.

Lo que inclina el PASS por encima de «cumple los CA»: **el WP resolvió una
trampa que nadie le pidió resolver.** El aviso que levanté al contrarrevisar
V17 —que cambiar solo el `import` habría convertido el probe en un `TypeError`
disfrazado de rojo— ya estaba desactivado aquí, con los asserts reescritos a la
forma real y razonado en §3. Y lo he confirmado ejecutando el probe contra el
parser de V17 ya fusionado: **verde**. El lote V16 ∥ V17 cierra sin costura.

Para el orquestador, en orden: **F-1** al WP que recoja H-4 (es la guarda que
falta y es barata); **H-1** a su propio WP de mantenimiento; el `overrides` con
`env: {jest: true}` cuando se amplíe el lint (56 de 59 de un golpe); y la
re-verificación de `lint` tras fusionar que pide el §11.2 — con V17 ya en
`main`, esa pasada sigue haciendo falta porque la huella cambia al fusionar.
