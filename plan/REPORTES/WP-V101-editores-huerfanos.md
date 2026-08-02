# WP-V101 · Los editores no estaban huérfanos: el manifiesto prometía dos convenciones distintas para el mismo par

**Worker V** · rama `wp/v101-editores-huerfanos` · árbol `C:/S_LAB/wt/v-v101`
· base `12be68e` · 2026-08-02

---

## 0 · Identidad, antes de leer nada de producto

```
$ WORLD_ROOT=C:/S_LAB/wt/v-v101 CANONICAL_WORLD_ROOT=C:/S_LAB/wt/v-v101 \
  READ_ONLY_ROOTS='["C:/S_LAB/g-sdk","C:/S_LAB/a-sdk","C:/S_LAB/e-sdk"]' \
  DOWNSTREAM_PATTERNS='[]' node .../verificar-identidad-raiz.mjs
identidad-raiz: PASS
world-real: c:/s_lab/wt/v-v101
git-toplevel: c:/s_lab/wt/v-v101
```

**Herramientas declaradas.** `npm ci` una vez (el worktree no traía
`node_modules`: git no copia lo ignorado — mismo tropiezo que V100), con
`npm_config_logs_dir` dentro del árbol; el directorio de logs se borró al
terminar y **no entra en el diff**. A partir de ahí jest **siempre** por
`./node_modules/.bin/jest`, y siempre `--coverage=false` salvo las tres corridas
de medición del suelo (§6).

**No toqué `src/views/HackerConfigPanelProvider.ts`** — reparto del orquestador,
es de `WP-V102`. Lo que necesitaba de ahí va declarado en §8.

---

## 1 · Tres correcciones más al brief, y la tercera cambia el veredicto

El brief ya traía una corrección de la ficha (un `customEditor` apuntaba al
directorio, no dos) y la confirmo íntegra. Añado tres.

### 1.1 · «apuntando a un directorio podado» es falso — la convención está viva y **la escribimos nosotros**

Éste es el dato que decide el WP, y no estaba en ningún documento.

```
$ node -e "…contributes.commands…" | grep agents
aleph0.agents.createNew  |  >>> Spawn New Agent
```

`aleph0.agents.createNew` es un comando **vivo, en nuestro propio espacio de
nombres** (V15 lo trajo a `aleph0.`), y su handler
—`src/core/bootstrap/commands/agentManagementCommands.ts:46`— hace esto en el
workspace **del usuario**:

```
:100  await vscode.workspace.fs.createDirectory(…, 'content', 'agents')
:101  await vscode.workspace.fs.createDirectory(…, 'configurations', 'agents')
:104  await vscode.workspace.fs.writeFile(contentPath, …)   // *.agent.md
:105  await vscode.workspace.fs.writeFile(configPath, …)    // *.config.json
```

Lo que V13 podó fue **la copia de ejemplo que había en el repo**. La
*convención* no sólo sigue viva: es que **la producimos nosotros**. Así que el
selector `**/theatrical-content/configurations/agents/*.config.json` **no
apuntaba a una ruta inexistente** — apuntaba exactamente a lo que la extensión
escribe. La pregunta del brief («¿qué convención le está prometiendo el
manifiesto al usuario, y sigue siendo la nuestra?») tiene respuesta medida:
**sigue siendo la nuestra, porque es la única que sabemos crear.**

### 1.2 · El defecto real era **el otro** selector, y es el que sí dañaba al usuario

El editor de contenido declaraba `filenamePattern: "*.agent.md"` **a secas, sin
directorio**, con `priority: "default"` — que **sustituye al editor de texto**.
Mientras tanto su propio código asume la convención:

```
$ grep -rn "agent\.md" --include="*.ts" --include="*.json" .
package.json:1114                                 "*.agent.md"          <- el intruso
agentManagementCommands.ts:49,133,218   theatrical-content/content/agents/…
AgentContentEditorProvider.ts:248,251   theatrical-content/configurations/agents/…
```

**Todas las demás referencias del árbol nombran la convención completa; el
manifiesto era la única que no.** Consecuencia para el usuario: cualquier
`*.agent.md` suyo, en cualquier carpeta, perdía el editor de texto y recibía el
nuestro, con un botón «abrir configuración» que resolvía a
`<workspace>/theatrical-content/configurations/agents/<nombre>.config.json` —
un fichero que no tenía por qué existir.

**Decisión**: el selector se estrecha a
`**/theatrical-content/content/agents/*.agent.md` (`package.json:1114`). Ahora
**las dos mitades del par nombran la misma convención**, que es lo que su código
ya suponía.

### 1.3 · Los `viewType` NO se renombran, y no es olvido

`R-V15-7` ya lo había declarado: los `viewType` son **identificadores**, no
rutas, y no son renombrables sin coste — los `workbench.editorAssociations` del
usuario y el estado de editor persistido cuelgan de esa cadena, y no hay
migración. Un `viewType` no puede «apuntar a una ruta inexistente» porque no
apunta a ninguna ruta. **CA-1 se cumple resolviendo el selector, que es lo que
sí nombra rutas.**

---

## 2 · La fila `schemas/`: se quedan, y la premisa del censo era falsa

El censo la marcaba «re-contenido, nadie lo re-contuvo», tratándola como legado
sin lector. **Medido, eso no se sostiene.**

```
$ grep -rn "xplus1-config\|socket-config\|webrtc-ui-config" src/
src/treeViews/configsTreeView.ts:51,52,53      createFileSystemWatcher(...)
src/treeViews/configsTreeView.ts:193,194,195   scanWorkspaceForConfigs(...)
src/treeViews/configsTreeView.ts:442,461,475   createFromTemplate(...)   <- LOS ESCRIBE
$ grep -rn "ConfigsTreeDataProvider" src/core/bootstrap/
src/core/bootstrap/assembleContext.ts:22   import { ConfigsTreeDataProvider }
```

`ConfigsTreeDataProvider` está **cableado y vivo**, y sobre esos tres nombres de
fichero **vigila, escanea y genera**. `contributes.jsonValidation` es la mitad
de validación de esa función. **Decisión: se quedan.** Borrarlos dejaría sin
validar unos ficheros que la propia extensión sigue creando — que es lo
contrario de lo que el veredicto «sustituir» perseguía.

### 2.1 · Y al medirlo salió un defecto vivo: **escribíamos un fichero que nuestro propio schema rechaza**

```
$ node probe.mjs      # ajv contra los schemas empaquetados
===== defaultSocketUrl = "ws://localhost:3000" =====
  xplus1-config.json  ->  VALIDA
  socket-config.json  ->  VALIDA
  webrtc-ui-config.json  ->  VALIDA
===== defaultSocketUrl = "" =====
  xplus1-config.json  ->  RECHAZADO: /socketIO/url must match pattern "^wss?://"
  socket-config.json  ->  RECHAZADO: /url must match pattern "^wss?://"
```

El ternario de `createFromTemplate` preguntaba `isConfigLoaded()` —«¿hay fichero
de ópera cargado?»— cuando lo que necesitaba saber era «¿tengo URL?».
`getDefaultSocketUrl()` devuelve `''` si no hay ajuste y la UI primaria no trae
puerto, y ese `''` se persistía en un campo que los schemas declaran `required`
con `pattern: "^wss?://"`.

**Es la familia de D16 y de V102, pero un escalón más arriba**: no miente en
prosa ni en un log, **escribe en el disco del usuario un fichero que el propio
editor marca en rojo al abrirlo**, por un schema que empaquetamos nosotros.

**Desviación de alcance, declarada.** El brief acota mi superficie al
manifiesto. Toqué **una expresión** de `src/treeViews/configsTreeView.ts` porque
decidir «los `jsonValidation` se quedan» y dejar la promesa rota sería certificar
como coherente un par que había medido incoherente. El vacío cae ahora a la
constante `SOCKET_URL_PLANTILLA` (convención de V100: el literal vive en un solo
sitio y las dos ramas ya no pueden divergir). **No invado `WP-V31`**: no cambio
qué URL producimos cuando hay una; sólo dejo de escribir la vacía.

---

## 3 · CA-3 · El hallazgo de método: por qué pinchar coordenadas no funcionó **ninguna** de las cuatro veces

El brief hablaba de tres generaciones. **Son cuatro**, y la segunda no estaba en
el brief:

| # | dónde | qué decía |
| --- | --- | --- |
| 1 | cuerpo del censo heredado | `package.json:1446` y `:1456` |
| 2 | `WP-V15` §, 2026-07-25 | `package.json:1219` — **y ya corregía el recuento** |
| 3 | acta ⛔ del censo, escrita **para arreglar la 1** | `package.json:1165` y `:1175`, «1248 líneas» |
| 4 | medido hoy | `package.json:1110` y `:1120`, **1197 líneas** |

**Las cuatro resuelven** salvo la 2ª, y por eso `scripts/citas-rancias.mjs` las
aprobaba: su ceguera está declarada en cada corrida —comprueba que una cita
apunta a algo que **existe**, no que diga la verdad— y **nombra el remedio que
no estaba hecho**: «un ancla de texto guardada junto a cada cita».

### 3.1 · El diagnóstico: la coordenada no es el hecho

Un número de línea es **dónde estaba el hecho ayer**. Pincharlo produce un gate
que enrojece con cada edición legítima, y un gate así se desactiva solo. Por eso
el instrumento **declara el HECHO** (qué token, en qué fichero, **cuántas
veces**) y **deriva** la coordenada de hoy:

- `plan/ANCLAS.json` — el registro, 8 anclas sobre 5 ficheros.
- `scripts/anclas-censo.mjs` — el gate.
- `scripts/tests/anclas-censo.test.ts` — quién lo vigila (19 casos).

### 3.2 · `veces` es lo que caza la deriva que **ningún re-medidor de coordenadas ve**

El brief lo señalaba como «el hallazgo más gordo», y lo confirmo. El censo
declaraba 7 puntos de `theatrical-content` **con 5 en `extensionBootstrap.ts`**:

```
$ grep -c "theatrical-content" src/core/extensionBootstrap.ts
0
```

Los puntos vivos son **11 en 5 ficheros**. No es que las coordenadas se
desplazaran: **el inventario era otro**. Un barrido que re-mida coordenadas
seguiría sin verlo; un recuento por fichero lo ve, y por eso `veces` es
obligatorio en cada ancla.

### 3.3 · El lazo, que es lo que impide que el registro se apruebe a sí mismo

Sin él, `dice` sería una copia de la medición —siempre conforme consigo misma—
mientras el documento vivo afirma otra cosa: el gate saldría verde y el censo
seguiría mintiendo, o sea **el estado de partida**. El gate exige que el
documento **contenga literalmente** la cita que el registro le atribuye. Lo
comprobé porque **me cazó a mí**: registré `package.json:966` para
`jsonValidation` y el gate lo rechazó — `:966` es la línea que abre el array, no
una que nombre `./schemas/`.

### 3.4 · Ámbito: sólo documentos vivos

`PRACTICAS §7`: un reporte es **acta** y sólo se anota; un censo se **corrige**.
Por eso `citas` no apunta jamás a `plan/REPORTES/`. Anclar un acta sería pedir
que se reescriba la historia.

### 3.5 · La prueba A/B cayó sola, dentro de este mismo commit

No la busqué. Al añadir 20 líneas de comentario a `configsTreeView.ts`:

- **el test de V100 se puso rojo en 4 casos** — pincha `configsTreeView.ts:436,
  437, 447, 463`, y mi edición no cambió **ningún hecho**, sólo los desplazó.
  V100 había declarado exactamente ese coste («si alguien mueve esas líneas, el
  rojo aparece aquí»), y se cumplió **en el WP siguiente**. Es la **5ª
  generación**.
- **el gate de anclas siguió en verde**, porque los hechos que ancla no
  cambiaron.

Es la comparación que justifica el diseño, medida sobre la misma edición. Corregí
las 4 coordenadas de V100 (`:472, :474, :483, :499`) y su docstring, porque
dejarlas rojas no era una opción; queda anotado en `mcpConfigurationManager.ts`
que el remedio sin ese coste es anclar.

**Y la convención «…» de V100 también se defendió sola**: su §2 prohíbe nombres
`.json` vivos ajenos en ese módulo, y me tumbó cuando escribí el nombre del
registro de anclas en el docstring. **No lo silencié con «…»** —eso marca
nombres MUERTOS y habría sido mentir—: reescribí la frase para nombrar el
instrumento (`.mjs`) y dejé dicho por qué.

---

## 4 · Los tests: **ejecutan**, no leen el fuente

`tests/unit/manifiesto/conveniosDelManifiesto.test.ts` — 15 casos.

- **§1 `customEditors`** — corre **de verdad** el handler de
  `aleph0.agents.createNew`, captura las rutas que llegan a
  `vscode.workspace.fs.writeFile`, y comprueba que cada fichero escrito lo abre
  **exactamente un** `customEditor` y es el suyo. Ni cero (promesa incumplida)
  ni dos (ambigüedad que VS Code resuelve por orden de declaración, o sea por
  azar). Más el caso negativo: ningún editor secuestra un fichero fuera de la
  convención.
- **§2 `jsonValidation`** — corre **de verdad** `createFromTemplate` en sus 3
  plantillas × 3 condiciones de URL, captura lo que llega a
  `fs.promises.writeFile`, busca **en el manifiesto** qué schema le corresponde
  a ese nombre de fichero, y lo valida con `ajv`. Nada cableado: el emparejado
  sale de `contributes.jsonValidation`.
- **§3** — cada `url` resuelve, y `.vscodeignore` no excluye `schemas/` (las
  `url` son relativas **al paquete**: un ignore que se llevara `schemas/` dejaría
  tres declaraciones colgando dentro del `.vsix`, y eso no lo ve ningún test que
  sólo mire el árbol de fuentes).

**Detalle de método que cambió un resultado.** Mi primer matcher no modelaba la
regla de VS Code de que un patrón **sin `/` casa contra el basename**. Con esa
versión, el mutante M1 daba 3 fallos — pero uno era **artefacto mío**: le
atribuía al manifiesto viejo un fallo que no tenía («no abre ni nuestro propio
fichero»). Corregido el matcher, M1 da 2 y aíslan el defecto real. Un modelo
equivocado del sistema bajo prueba fabrica evidencia a favor.

---

## 5 · Los negativos, **verificados desactivando su guardián**

Seis mutaciones sobre el árbol real, cada una revertida después. El arnés
**aborta con código 3 si el patrón no está** (lección de V100) — y **abortó de
verdad** en el primer intento de M2: los fuentes van con CRLF y el patrón
multilínea no casaba. Sin ese guardián habría salido «verde» sin haber mutado
nada.

| # | mutación | fallan | qué prueba |
| --- | --- | --- | --- |
| **M1** | el selector vuelve a `*.agent.md` — **el defecto exacto de partida** | **2** | el secuestro de ficheros ajenos y la asimetría del par |
| **M2** | vuelve el ternario que escribía `""` | **2** | sólo caen los 2 casos de «config cargada sin url»; los otros 7 siguen verdes → el guardián **discrimina**, no es un rojo global |
| **M3** | la constante pierde el esquema (`localhost:3000`) | **4** | el literal de relleno está sujeto al schema |
| **M4** | el comando escribe en otro directorio | **2** | el manifiesto se contrasta contra lo que el código **hace** |
| **M5** | una `url` apunta a un schema inexistente | **4** | 3 de §2 + 1 de §3: la promesa y su fichero |
| **M6** | `.vscodeignore` se lleva `schemas/` | **1** | y **sólo** ésa: el resto del árbol no lo nota |

```
############ M1 · el selector vuelve a `*.agent.md` (el defecto de V101) ############
mutado OK en package.json
Tests:       2 failed, 13 passed, 15 total
  ● … › NINGUN customEditor secuestra un fichero fuera de la convencion
  ● … › los dos selectores nombran la MISMA convencion de directorio

############ M2 · vuelve el ternario que escribia "" ############
Tests:       2 failed, 13 passed, 15 total
  ● … › con config cargada pero SIN url (el agujero de V101) › la plantilla xplus1 …
  ● … › con config cargada pero SIN url (el agujero de V101) › la plantilla socket …

############ CONTROL · todo restaurado, debe volver a verde ############
Tests:       15 passed, 15 total
```

**El control estuvo a punto de ser ilegible**, y lo cuento porque es el modo de
fallo que esta casa persigue: jest escribe el resumen en **stderr también cuando
pasa**, y mi arnés capturaba sólo stdout en la rama de éxito — el CONTROL salía
sin línea `Tests:`. Un control que no se puede leer es exactamente cómo una
corrida que no prueba nada pasa por verde. Corregido con `spawnSync`.

**El gate de anclas tiene su propio censo de mutación**, en la suite
(`scripts/tests/anclas-censo.test.ts`, 19 casos): cada guardián load-bearing
tiene un **mutante** que lo desactiva y exige que el gate **deje de detectar**.
Los cuatro pasan: sin el recuento, la deriva de composición cuela; sin la
comparación de coordenada, la deriva cuela; sin el lazo, el registro se aprueba a
sí mismo; sin el guardián del registro vacío, sale un PASS que no significa nada.

---

## 6 · El suelo se mueve, firmado con tres corridas

`coverage/` **se borra antes de cada corrida**: un informe rancio en la ruta
esperada es exactamente cómo una corrida que revienta sin escribir pasa por
verde.

| corrida | fuente | tests nuevos | statements / branches / functions / lines |
| --- | --- | --- | --- |
| A | `HEAD` | no | **1844 / 558 / 357 / 1808** ← **reproduce el suelo exacto** |
| B | este WP | no | **1844 / 558 / 357 / 1808** |
| C | este WP | sí | **1918 / 562 / 367 / 1881** |

**La corrida B da cero delta, y eso es un resultado, no un trámite.** En V100 la
corrida intermedia aisló +1 sentencia (la constante, que los tests ya
importaban). Aquí `SOCKET_URL_PLANTILLA` **no suma ninguna**, y el motivo está
medido: vive en un módulo que **no importaba ningún test**. Sin B eso sería
conjetura; con B, los **+74/+4/+10/+73 son íntegramente código de producto que
hasta hoy no ejercitaba nadie**.

Antes de mover el suelo comprobé que el trinquete **rechaza la subida no
registrada** (falla en las dos direcciones, como debe):

```
$ node scripts/cobertura-trinquete.mjs        # con el suelo viejo
TRINQUETE · la cobertura SUBIÓ y el suelo no lo recoge:
    statements: 1918 cubiertas > suelo 1844+0  (sobran 74)

$ node scripts/cobertura-trinquete.mjs        # con el suelo nuevo
censo: 96 ficheros en src · 87 en el mapa · 9 ausentes (9 declarados)
cobertura: censo COMPLETO y unidades cubiertas EN EL SUELO declarado
```

**Censo intacto**: los mismos 9 ausentes (6 TIPOS + 3 NO-COMPILA).

---

## 7 · Cero regresión

```
$ ./node_modules/.bin/jest --coverage=false
Test Suites: 17 passed, 17 total
Tests:       1 skipped, 530 passed, 531 total
```

Antes: 15 suites / 497 (496 pass, 1 skip). Después: **17 / 531** (530 pass, el
mismo skip de siempre). **+2 suites, +34 tests, 0 fallos.**

`tsc -p tsconfig.json --noEmit`: **0 errores en los ficheros tocados**. Los que
salen son los preexistentes y ya declarados (3 ficheros con TS2353 del censo de
cobertura, más TS1479 de `@zeus/*`).

---

## 8 · Qué NO cubro — los límites, declarados

1. **No toqué `src/views/HackerConfigPanelProvider.ts`** (reparto: `WP-V102`).
   **Lo que V102 debe saber, medido hoy**: ofrece `theatrical-content/configurations`
   y `theatrical-content/content` en `:297` y `:298`, y los tres schemas en
   `:240-242`. Mi §2 decide que **los schemas se quedan**, así que lo que ese
   panel ofrece de `schemas/` **existe de verdad** — su problema es otro (resuelve
   contra el workspace, donde no están). Queda **anclado pero no editado** (ancla
   A8): si el recuento cambia, el gate enrojece.
2. **`WP-V31` sigue intacto y ahora está mejor acotado.** Si el ajuste trae un
   valor **sin esquema** (`localhost:7777`), `getDefaultSocketUrl()` lo devuelve
   tal cual y el schema lo rechaza igual. **Medido**, está en el probe de §2.1.
   Normalizar eso es cambiar qué URL producimos, y es de V31. Yo sólo cerré el
   vacío.
3. **Los `viewType` siguen bajo `alephscript.`** (§1.3). Es incoherencia visible
   y declarada desde V15, no un descuido.
4. **`ajv` y `minimatch` son dependencias transitivas**, no directas (entran por
   `eslint` y `jest`). Si desaparecen, el test **no compila y la suite enrojece**
   — falla cerrado. No las promoví a `devDependencies` porque tocar el
   `package-lock` con un `npm ci` local incompleto es peor riesgo que el que
   evita. **Declarado, no disimulado.**
5. **El gate de anclas sólo cubre lo registrado**, y lo dice en cada corrida. Un
   ancla de menos es una deriva que nadie verá. Las 8 de hoy cubren la superficie
   de este WP y la que ya se sabía derivada; **no son un censo del repo**.
6. **`scripts/citas-rancias.mjs` sigue en FAIL, y no es mío.** Estaba en 4 rancias
   antes de tocar nada (`package.json` tiene **1197 líneas en `HEAD` y 1197 hoy**:
   cambié una línea, no añadí ninguna). Anoté la que **es** mi asunto —la 2ª
   generación de esta misma deriva, `WP-V15-espacios-nombres.md:259`— y quedan
   **3**, todas de otro asunto (coordenadas de `scripts`/`devDependencies`).
   **Las dejo re-medidas para que quien las coja no repita el trabajo**:
   `WP-V90-jest-determinista.md:712` cita `package.json:1234` para `"test": "jest"`,
   que hoy está en **`package.json:1144`**; `WP-V92-citas-rancias.md:457` y `:556`
   citan `package.json:1229` para `@vscode/test-electron`, que hoy está en
   **`package.json:1178`**. **Las dos afirmaciones de fondo siguen siendo ciertas**:
   sólo caducó la coordenada — la misma clase que este WP mecaniza.
7. **No añadí paso de CI.** El gate entra por `npm test` igual que
   `citas-rancias`: `scripts/tests/anclas-censo.test.ts` §5 lo corre **sobre el
   árbol real** y exige PASS. Ése es el caso que enrojece cuando una coordenada
   del censo vuelva a derivar.
8. **Suelo medido en una sola plataforma** (Windows 11 / node v22.21.1). No
   reproduje la condición de CI. Si CI discrepa, el número de este reporte no es
   el árbitro.
9. **No migré la tabla de coordenadas de V100 a anclas.** Habría sido lo
   coherente con §3.5, pero es reescribir el test de otro WP y excede el encargo.
   Queda dicho, con la prueba A/B delante, como el siguiente paso natural.
