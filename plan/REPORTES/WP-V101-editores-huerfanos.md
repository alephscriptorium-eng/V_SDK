# WP-V101 · Los editores no estaban huérfanos donde la ficha decía — y donde sí lo estaban, no los miraba nadie

**Worker V** · rama `wp/v101-editores-huerfanos` · árbol `C:/S_LAB/wt/v-v101`
· **rebasada sobre `main` `e989716`** · 2026-08-02

> **2ª entrega.** La 1ª cerró con 3 bloqueantes, **dos de ellos de carrera**:
> `WP-V102` entró en `main` a las 22:49:04 y mi commit era de las 22:29:55, sobre
> el mismo fichero (`HackerConfigPanelProvider.ts`) y el mismo trinquete. §9
> lleva el detalle de qué cambió en esta vuelta.

---

## 0 · Identidad y herramientas

```
$ WORLD_ROOT=C:/S_LAB/wt/v-v101 CANONICAL_WORLD_ROOT=C:/S_LAB/wt/v-v101 \
  READ_ONLY_ROOTS='["C:/S_LAB/g-sdk","C:/S_LAB/a-sdk","C:/S_LAB/e-sdk"]' \
  DOWNSTREAM_PATTERNS='[]' node .../verificar-identidad-raiz.mjs
identidad-raiz: PASS
world-real: c:/s_lab/wt/v-v101
```

`npm ci` una vez (el worktree no traía `node_modules`), con
`npm_config_logs_dir` dentro del árbol; el directorio se borró al terminar y no
entra en el diff. Después, jest siempre por `./node_modules/.bin/jest` y
`--coverage=false` salvo las corridas de medición del suelo (§6).

**No toqué `src/views/HackerConfigPanelProvider.ts`** — es de `WP-V102`. Lo
único que hago con él es **anclarlo** (§3), y eso resultó ser lo que destapó B1.

---

## 1 · Tres correcciones al brief; la primera cambia el veredicto

### 1.1 · «apuntando a un directorio podado» es falso: la convención está viva y **la escribimos nosotros**

`aleph0.agents.createNew` es un comando **vivo, en nuestro espacio de nombres**,
y su handler (`src/core/bootstrap/commands/agentManagementCommands.ts:46`)
**crea el directorio y escribe los dos ficheros en el workspace del usuario**:

```
:100  await vscode.workspace.fs.createDirectory(…, 'content', 'agents')
:101  await vscode.workspace.fs.createDirectory(…, 'configurations', 'agents')
:104  await vscode.workspace.fs.writeFile(contentPath, …)   // *.agent.md
:105  await vscode.workspace.fs.writeFile(configPath, …)    // *.config.json
```

V13 podó **la copia de ejemplo del repo**, no la convención. El selector
señalado por la ficha apuntaba exactamente a lo que producimos. Respuesta
medida a la pregunta del brief: **sigue siendo la nuestra, porque es la única
que sabemos crear.**

### 1.2 · El defecto real era **el otro** selector, y ése sí dañaba al usuario

El editor de contenido declaraba `filenamePattern: "*.agent.md"` **sin
directorio**, con `priority: "default"` — que sustituye al editor de texto.
Todas las demás referencias del árbol nombran la convención completa; **el
manifiesto era la única que no**. Estrechado a
`**/theatrical-content/content/agents/*.agent.md` (`package.json:1114`).

**Verificado por la contrarrevisión contra la autoridad, no contra un
sustituto**: portó `globMatchesResource` y el motor de glob del VS Code
instalado y ejecutó el handler real. El selector estrechado abre los dos
ficheros en raíz, anidado profundo, con espacios, con mayúsculas y bajo
`vscode-remote`/`vscode-vfs`; y el patrón viejo casaba **por basename**, o sea
cualquier `.agent.md` **incluso en `node_modules/` y `.git/`**. **Cero regresión
de producto.**

### 1.3 · Los `viewType` del manifiesto no se renombran — con la atribución corregida

**R-V15-7** (`plan/REPORTES/WP-V15-espacios-nombres.md:709`) ya los declaró no
renombrables sin coste. **Corrijo mi propia atribución de la 1ª entrega**: la
razón literal de R-V15-7 son los **`<viewId>.focus` y el `globalState` del
tema**, *no* `workbench.editorAssociations`, que es lo que yo escribí. El
razonamiento de fondo se sostiene —un identificador persistido no se renombra
sin migración—, pero **atribuir mal es de la misma familia que citar mal**, y
por eso se corrige en los tres sitios donde lo escribí.

### 1.4 · Y había **dos `viewType` huérfanos de verdad** — el artefacto literal del título

Los encontró la contrarrevisión, y mi 1ª entrega no los mencionaba pese a
titularse «editores huérfanos»:

```
src/editors/AgentContentEditorProvider.ts:21   'theatrical.agentContentEditor'
src/editors/AgentConfigEditorProvider.ts:21    'theatrical.agentConfigEditor'
```

Vivían en sendos `public static register()` **que no llamaba nadie** (el
registro real lo hace `src/core/bootstrap/viewRegistry.ts` con los `viewType`
del manifiesto, sobre las instancias de `assembleContext.ts:60,61`), y **ninguno
de los dos nombres existe en `contributes.customEditors`**. Era **el defecto de
este WP al revés**: allí el manifiesto prometía lo que el código no cumplía;
aquí el código nombraba lo que el manifiesto no promete.

**Podados**, no renombrados: código inalcanzable con un identificador
inexistente no tiene nada que conservar. Los nombres muertos quedan narrados
con la convención «…» de V100 en el docblock que ocupa su sitio.

---

## 2 · La fila `schemas/`: se quedan, y la premisa del censo era falsa

```
$ grep -rn "xplus1-config\|socket-config\|webrtc-ui-config" src/
src/treeViews/configsTreeView.ts:51,52,53      createFileSystemWatcher(...)
src/treeViews/configsTreeView.ts:193,194,195   scanWorkspaceForConfigs(...)
src/treeViews/configsTreeView.ts:442,461,475   createFromTemplate(...)   <- LOS ESCRIBE
$ grep -rn "ConfigsTreeDataProvider" src/core/bootstrap/
src/core/bootstrap/assembleContext.ts:22   import { ConfigsTreeDataProvider }
```

No es legado sin lector: es una **convención viva del workspace que generamos
nosotros**, y `contributes.jsonValidation` es su mitad de validación.
**Decisión: se quedan.**

### 2.1 · Y al medirlo salió un defecto vivo

```
===== defaultSocketUrl = "" =====
  xplus1-config.json  ->  RECHAZADO: /socketIO/url must match pattern "^wss?://"
  socket-config.json  ->  RECHAZADO: /url must match pattern "^wss?://"
  webrtc-ui-config.json  ->  VALIDA        (required: [] — no tiene url)
```

`isConfigLoaded()` pregunta «¿hay fichero de ópera?», no «¿tengo URL?», y el
`''` acababa persistido en un campo `required` con `pattern`. **Escribíamos en
el disco del usuario un fichero que nuestro propio schema marca en rojo.**
Cerrado con `SOCKET_URL_PLANTILLA`.

**Desviación de alcance, declarada**: toqué **una expresión** de
`configsTreeView.ts` porque decidir «los `jsonValidation` se quedan» y dejar la
promesa rota sería certificar como coherente un par que había medido
incoherente. **No invado `WP-V31`**: no cambio qué URL producimos cuando hay
una; sólo dejo de escribir la vacía. La contrarrevisión lo verificó por los dos
lados con su propio probe y confirmó que **el caso legítimo sin url
(`webrtc-ui-config.json`, `required: []`) no lo toca mi arreglo**.

---

## 3 · CA-3 · El instrumento de anclas, y **la deriva real que cazó**

### 3.1 · Son cuatro generaciones, no tres

| # | dónde | qué decía |
| --- | --- | --- |
| 1 | cuerpo del censo heredado | `package.json:1446` y `:1456` |
| 2 | `WP-V15`, 2026-07-25 | `package.json:1219` |
| 3 | acta ⛔ del censo, escrita **para arreglar la 1** | `:1165` y `:1175`, «1248 líneas» |
| 4 | medido hoy | `:1110` y `:1120`, **1197 líneas** |

**El diagnóstico**: un número de línea es *dónde estaba el hecho ayer*.
`plan/ANCLAS.json` declara el **hecho** (qué token, en qué fichero, **cuántas
veces**) y `scripts/anclas-censo.mjs` **deriva** la coordenada.

### 3.2 · `veces` caza la deriva que ningún re-medidor de coordenadas ve

```
$ grep -c "theatrical-content" src/core/extensionBootstrap.ts
0
```

El censo declaraba 7 puntos **con 5 en `extensionBootstrap.ts`**. No es que las
coordenadas se desplazaran: **el inventario era otro**.

### 3.3 · **B1 · El ancla se rompió de verdad, y la rompió otro WP en vuelo**

Ésta es la mejor prueba que tiene el instrumento, y no la fabriqué yo.
`WP-V102` reescribió `HackerConfigPanelProvider.ts` mientras V101 estaba en
vuelo. Al rebasar:

```
$ node scripts/anclas-censo.mjs
A8-convencion-en-el-panel  [esperaba 2 sitio(s) que nombren ["theatrical-content"], hay 3]
VEREDICTO: FAIL (1 rotas + 0 derivadas / 8 anclas, 8 citas)   EXIT=1
```

Cadena completa: gate exit 1 → `scripts/tests/anclas-censo.test.ts` §5 rojo →
`npm test` rojo → paso «Suite instrumentada (BLOQUEA)» de `ci.yml` rojo.
**Re-anclado a `veces: 3`, cita `:352`.** Un cambio que nadie le anunció al
instrumento, detectado sin que nadie fuera a buscarlo.

### 3.4 · El lazo, que impide que el registro se apruebe a sí mismo

Sin él, `dice` sería una copia de la medición —siempre conforme consigo misma—
mientras el documento vivo afirma otra cosa. **Me cazó a mí**: registré
`package.json:966` y el gate lo rechazó, porque `:966` abre el array y no nombra
`./schemas/`.

### 3.5 · **B3 · Adelgazar el registro era la forma trivial de poner el gate verde**

La contrarrevisión borró 7 de las 8 anclas y **la suite entera siguió verde**, y
con el registro adelgazado el gate **ya no cazaba la regresión que este WP
arregla**. Lo declaraba en §8 pero no estaba mecanizado, y esto **es** CA-3.
Cerrado con un suelo en §5 (`toBeGreaterThanOrEqual(8)`). Verificado:

```
$ (registro adelgazado a 1 ancla)
gate solo            → EXIT=0        (por eso no bastaba el gate)
suite                → ● §5 · `--anclas` lista el censo…    Tests: 1 failed, 24 passed
```

Un solo test dispara: señal limpia, no un rojo global.

### 3.6 · Corrijo una afirmación mía que era cierta como hecho y **engañosa como argumento**

Escribí que el gate de anclas «se quedó verde» sobre mi edición de
`configsTreeView.ts` mientras el test de V100 enrojecía, y lo vendí como
inmunidad al desplazamiento. **La contrarrevisión midió que no**: quedó verde
**porque ningún ancla cubre ese fichero**. Inyectando una línea antes de
`customEditors` —recuentos intactos— el gate da `FAIL (0 rotas + 3 derivadas)`,
exit 1.

**La versión honesta, que es la que queda escrita en el instrumento, en el
censo y en el fuente**: *anclar el HECHO es inmune a mover líneas; anclar la
CITA de un documento vivo no lo es, y a cambio te escribe la corrección exacta.*

Agrava que yo hubiera escrito la versión ancha **en fuente de producto**
(`src/core/mcpConfigurationManager.ts`): prosa que afirma de más es la familia
D16 que esta casa persigue. Corregida ahí, en el censo y aquí.

### 3.7 · Dos cegueras más, medidas y **declaradas en cada corrida**

- **Recuento correcto, sitio equivocado.** Apuntar el selector a
  `**/theatrical-content/CARPETA-QUE-NO-ESCRIBIMOS/*.config.json` deja el
  recuento en 2 y el gate sale **PASS**. Lo caza el test que **ejecuta**, no el
  gate: aquí se vigila el inventario, allí la conducta. Tiene test de ceguera
  propio (§4.c) para que nadie lea el gate como más de lo que es.
- **Ancla vacua.** `debeNombrar: [""]` casa con todas las líneas y **inflaba el
  contador «anclas declaradas»**, que es justo lo que el instrumento vende como
  su mecanismo de honestidad. Ahora es **error de uso: exit 2, sin veredicto**,
  igual que el registro vacío.

---

## 4 · Los tests: **ejecutan**, no leen el fuente

`tests/unit/manifiesto/conveniosDelManifiesto.test.ts` — **18 casos**.

- **§1 `customEditors`** — corre el handler real de `aleph0.agents.createNew`,
  captura lo que llega a `vscode.workspace.fs.writeFile`, y exige que cada
  fichero escrito lo abra **exactamente un** editor y sea el suyo. Ni cero ni
  dos.
- **§2 `jsonValidation`** — corre `createFromTemplate` en 3 plantillas × 3
  condiciones de URL, captura lo escrito, busca **en el manifiesto** qué schema
  le toca a ese nombre y valida con `ajv`.
- **§4 `manifiesto ↔ registro`** — **nueva en esta vuelta.** La contrarrevisión
  renombró `viewRegistry.ts:92` a `alephscript.agentContentEditorV2` —el código
  registrando lo que el manifiesto no declara— y **nadie disparó**: mis tests
  ataban manifiesto↔comando pero **nunca manifiesto↔registro**. Ahora se
  comparan **conjuntos** (sobrar es tan defecto como faltar), con guarda
  anti-vacuidad, más un barrido de `src/editors/` que impide que vuelva un
  `viewType` que el manifiesto no declare.
- **§3** — cada `url` resuelve y `.vscodeignore` no excluye `schemas/`.

**Detalle de método que cambió un resultado**: mi primer matcher no modelaba la
regla de VS Code de que un patrón **sin `/` casa contra el basename**. Con esa
versión M1 daba 3 fallos, y uno era **artefacto mío**. Corregido, da 2 y aíslan
el defecto real. **Un modelo equivocado del sistema bajo prueba fabrica
evidencia a favor.**

---

## 5 · Los negativos, desactivando su guardián — **8 mutaciones**

Todas sobre el árbol real, revertidas después, y **corridas contra las dos
suites** (manifiesto + anclas) para poder separar quién dispara.

| # | mutación | fallan | guardián propio | ¿saltó OTRO? |
| --- | --- | --- | --- | --- |
| **M1** | el selector vuelve a `*.agent.md` | **3** | §1 ×2 | **sí**, anclas §5 (A3 cae de 2 a 1) |
| **M2** | vuelve el ternario que escribía `""` | **2** | §2 ×2 | no |
| **M3** | la constante pierde el esquema | **4** | §2 ×4 | no |
| **M4** | el comando escribe en otro directorio | **3** | §1 ×2 | **sí**, anclas §5 (A5 cae de 5 a 4) |
| **M5** | una `url` a un schema inexistente | **4** | §2 ×3 + §3 ×1 | no |
| **M6** | `.vscodeignore` se lleva `schemas/` | **1** | §3 ×1 | no |
| **M7** | el código registra un `viewType` que el manifiesto no declara | **1** | §4 ×1 | no |
| **M8** | vuelve un `viewType` huérfano a `src/editors/` | **2** | §4 ×1 | **sí**, anclas §5 |

**«Saltó otro guardián» está separado, y en los tres casos el guardián propio
disparó también** — ninguno queda enmascarado. Los tres son explicables y los
explico, porque un rojo que no se sabe por qué salta vale poco:

- **M1 y M4** rompen el **hecho** anclado: cambian el recuento de
  `theatrical-content` en `package.json` y en `agentManagementCommands.ts`.
- **M8 no cambia ningún recuento** (`theatrical.agentContentEditor` no contiene
  `theatrical-content`): lo que rompe es la **cita** — inserta una línea y
  desplaza `AgentContentEditorProvider.ts:251`. Es **exactamente el coste de
  §3.6**, ocurriendo en vivo. Lo dejo en la tabla en vez de esconderlo porque es
  la demostración de la ceguera que declaro.

```
############ CONTROL · todo restaurado, debe volver a verde ############
Tests:       43 passed, 43 total
```

**La guarda anti-falso-verde funcionó dos veces**: abortó con `MUTANTE
INVÁLIDO` cuando el patrón de M2 no casaba (los fuentes van con CRLF), y la
contrarrevisión la comprobó rompiendo un patrón a propósito — **se puso roja, no
verde**. Y el CONTROL estuvo a punto de ser ilegible: jest escribe el resumen en
**stderr también cuando pasa**, y mi arnés capturaba sólo stdout en la rama de
éxito. Corregido con `spawnSync`.

**El gate de anclas tiene censo de mutación propio** en la suite
(`scripts/tests/anclas-censo.test.ts`, **25 casos**): cinco mutantes desactivan
cada guardián load-bearing y exigen que el gate **deje de detectar** — sin el
recuento cuela la deriva de composición; sin la comparación de coordenada cuela
la deriva; sin el lazo el registro se aprueba a sí mismo; sin el guardián del
registro vacío sale un PASS que no significa nada; sin la validación, el ancla
vacua pasa **e infla el denominador**.

---

## 6 · **B2 · El suelo, re-medido sobre `main`** (la primera firma colisionaba)

Mi 1ª entrega firmó **1918/562/367/1881** midiendo contra la base de mi rama
(1844/558/357/1808) y decía «sube en las cuatro». **Cierto contra mi base y
falso contra `main`**: `V102` ya declaraba `branches: 563`, así que aquel merge
**habría bajado una rama** — justo lo que el trinquete existe para impedir. Es
un fallo **de carrera**, no de medición.

Re-medido sobre `main` rebasado, borrando `coverage/` antes de cada corrida:

| corrida | fuente | tests nuevos | statements / branches / functions / lines |
| --- | --- | --- | --- |
| A | `main` | no | **1888 / 563 / 367 / 1850** ← **reproduce el suelo de main** |
| B | este WP | no | **1886 / 563 / 367 / 1848** |
| C | este WP | sí | **1960 / 567 / 377 / 1921** |

**La corrida B baja 2 sentencias y 2 líneas, y no es una pérdida de cobertura**:
este WP poda los dos `static register()` muertos, y con ellos los dos
`private static readonly viewType` — **inicializadores de campo estático, que se
ejecutan al importar la clase** y por eso estaban cubiertos (los cuerpos de
`register()` no: nadie los llamaba). Desaparecen 2 sentencias **del árbol**, no
2 del alcance de los tests.

**Atribución medida, no razonada** — restaurando **sólo** esos dos ficheros
desde `main` y dejando todo lo demás de este WP:

```
B con los 2 editores DE MAIN: 1888 563 367 1850     ← exacto
```

Descontado eso, los **+74/+4/+10/+73** sobre B son íntegramente código de
producto que no ejercitaba nadie. **Sube en las cuatro contra `main`.** Censo
intacto: los mismos 9 ausentes.

```
$ node scripts/cobertura-trinquete.mjs
censo: 96 ficheros en src · 87 en el mapa · 9 ausentes (9 declarados)
cobertura: censo COMPLETO y unidades cubiertas EN EL SUELO declarado
```

---

## 7 · Cero regresión

```
$ ./node_modules/.bin/jest --coverage=false
Test Suites: 18 passed, 18 total
Tests:       1 skipped, 549 passed, 550 total
```

`main` traía 16 suites / 507. Ahora **18 / 550**: **+2 suites, +43 tests, 0
fallos**, el mismo skip de siempre. `tsc -p tsconfig.json --noEmit`: **0 errores
en los ficheros tocados**; los que salen son los preexistentes y declarados.

---

## 8 · Qué NO cubro — los límites, declarados

1. **No toqué `HackerConfigPanelProvider.ts`** (V102). Queda **anclado, no
   editado** (A8, `veces: 3`, `:352`/`:371`/`:372` tras su reescritura).
2. **`WP-V31` sigue intacto y mejor acotado**: si el ajuste trae un valor **sin
   esquema** (`localhost:7777`), el schema lo rechaza igual. Medido, en el probe
   de §2.1. Normalizar eso cambia qué URL producimos, y es de V31.
3. **Los `viewType` del manifiesto siguen bajo `alephscript.`** (§1.3),
   declarado desde V15 con su razón correcta.
4. **`ajv` y `minimatch`: la procedencia que declaré era falsa.** Dije que
   entraban «por eslint y por jest». **Medido en `package-lock.json`**:
   `node_modules/ajv` 8.17.1 es **`dev: false`** —lo suben
   `@alephscript/mcp-core-sdk` y `@modelcontextprotocol/sdk`, dependencias de
   **producción**; eslint lleva su propia copia anidada `6.12.6`—, y
   `node_modules/minimatch` 9.0.5 **no es el de jest** (los de jest son `3.1.2`
   anidados): lo sube `@typescript-eslint/parser`. Hay **3 `ajv` y 13
   `minimatch`** en el árbol. **La decisión de no promoverlas sigue siendo la
   misma** —tocar el lock con un `npm ci` local incompleto arriesga más de lo
   que evita— **pero el motivo que había escrito era falso y queda reescrito.**
   Siguen fallando cerrado: si desaparecen, el fichero no compila.
5. **El gate sólo cubre lo registrado**, y ahora además **no puede adelgazarse en
   silencio** (§3.5). Las 8 anclas cubren la superficie de este WP y la ya
   sabida derivada; **no son un censo del repo**.
6. **Las dos cegueras de §3.7** (sitio equivocado con recuento correcto; coste de
   desplazamiento en la mitad `citas`) salen impresas en **cada corrida** del
   instrumento, no enterradas en un acta.
7. **`scripts/citas-rancias.mjs` sigue en FAIL con 3, y no son mías.** Estaban
   antes de tocar nada. Anoté la que **es** mi asunto (la 2ª generación de esta
   deriva, `WP-V15-espacios-nombres.md:259`). Las 3 restantes van **re-medidas**:
   `WP-V90-jest-determinista.md:712` cita `package.json:1234` para
   `"test": "jest"`, hoy en **`package.json:1144`**; `WP-V92-citas-rancias.md:457`
   y `:556` citan `package.json:1229` para `@vscode/test-electron`, hoy en
   **`package.json:1178`**. **Las dos afirmaciones de fondo siguen siendo
   ciertas**: sólo caducó la coordenada.
8. **1197 vs 1198, reconciliado.** Mi reporte dice 1197 líneas y el gate imprime
   «> 1198 líneas» en la misma sesión. Las dos son correctas y miden cosas
   distintas: `package.json` tiene **1197 saltos de línea**, su última línea es
   `}` (la 1197), y como el fichero termina en salto, `split('\n')` devuelve
   **1198 elementos, el último la cadena vacía**. `citas-rancias.mjs:248,260`
   usan `split('\n').length`, así que el gate es **permisivo en exactamente una
   línea**: aceptaría una cita a `:1198`, que no existe. **Preexistente, no es
   mío, y va a `WP-V103`** — pero queda medido en vez de callado.
9. **No añadí paso de CI**: el gate entra por `npm test`, y su §5 lo corre
   **sobre el árbol real exigiendo PASS** — cosa que `citas-rancias.test.ts` no
   hace. Es lo que puso B1 en rojo.
10. **Suelo medido en una sola plataforma** (Windows 11 / node v22.21.1). No
    reproduje la condición de CI; si CI discrepa, este número no es el árbitro.
11. **No migré la tabla de coordenadas de V100 a anclas.** Con §3.6 medido, el
    beneficio es menor de lo que la 1ª entrega sugería: la mitad `citas` tiene el
    mismo coste de desplazamiento. Lo que sí valdría es migrar la mitad de
    **hechos**. Queda dicho, sin venderlo de más.

---

## 9 · Qué cambió en esta 2ª entrega

| bloqueante | cierre |
| --- | --- |
| **B1** · A8 caducada respecto de `main`; el propio gate ponía CI en rojo | Rebasado sobre `e989716`; A8 a `veces: 3` y cita `:352`; censo corregido. **La deriva la provocó `V102` y la cazó mi gate** (§3.3) |
| **B2** · el suelo colisionaba hacia abajo (562 < 563 de `main`) | Re-medido sobre `main` con corrida A de control; nuevo suelo **1960/567/377/1921**, sube en las cuatro. El −2 de la corrida B, **atribuido con medición** (§6) |
| **B3** · el registro se adelgazaba y nadie se enteraba | Suelo de anclas en §5 (`>= 8`), con su negativo verificado (§3.5) |

**Menores cerrados**: la afirmación ancha de §3.6 corregida en fuente de
producto, censo y reporte; los **dos `viewType` huérfanos** podados (§1.4); la
tercera mitad **manifiesto↔registro** ahora tiene test y dos mutantes (§4, M7 y
M8); procedencia de `ajv`/`minimatch` re-medida (§8.4); **ancla vacua** rechazada
con exit 2 y su mutante; ceguera «sitio equivocado» con test propio y declarada
en cada corrida (§3.7); **1197/1198** reconciliado y enrutado (§8.8); atribución
de **R-V15-7** corregida (§1.3).
