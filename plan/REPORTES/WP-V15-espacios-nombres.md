# REPORTE · WP-V15 · Espacios de nombres (Ola F · CORTE)

| dato | valor |
| ---- | ----- |
| agente | worker-V |
| fecha | 2026-07-25 |
| rama | `wp/v15-espacios-nombres` |
| base | `9690102` (main con poda V13 + marca V14) |
| commits | `808be04` (obra) · tip: ver §12 |
| gobierno | DV-16.a **CERRADA en (b)** — ejecución aquí |
| riesgo de revisión | **independiente** (config / empaquetado) |
| `VEREDICTO_REVISOR` | **⏳ pendiente** — contrarrevisión por agente distinto |

---

## 1 · Resumen en una tabla

| eje | antes | después |
| --- | ----- | ------- |
| extension-id | `scriptorium.zigurat` | **`scriptorium.aleph-0`** |
| artefacto | `scriptorium-zigurat-0.1.0.vsix` | **`aleph-0-0.1.0.vsix`** (derivado) |
| claves de settings con marca vetada | 13 (`zigurat.*` ×10, `arrakisTheater.*` ×3) | **0** |
| prefijos de comando | 3 (`alephscript.` 86, `zigurat.` 7, `mcpSocketManager.` 6) | **1** (`aleph0.` ×99) |
| identidad del lockfile | `scriptorium-vscode-extension` / `0.1.0-scriptorium` | **`aleph-0` / `0.1.0`** |
| `zigurat` / `arrakis` en `dist/extension.js` | 32 / 15 | **4 / 11** (todos identificadores de código) |

---

## 2 · Conteos del renombrado

### 2.1 · Comandos

| medida | valor |
| ------ | ----- |
| entradas en `contributes.commands` | **99** |
| ids únicos declarados | **98** (`aleph0.analytics.export` está **duplicado**; ver R-V15-3) |
| ids con prefijo `aleph0.` tras el WP | **99 / 99 = 100 %** |
| ids canónicos (prefijo `aleph0.`, sin excepción) | **98** |
| **excepciones declaradas** (no renombradas) | **4** — §2.3 |
| **retirados del manifiesto** | **0** — §4 explica por qué la premisa no se sostuvo |
| ids adicionales renombrados que sólo viven en `src/` | **6** (5 registrados sin declarar + 1 referencia colgante) |
| **ids distintos mapeados en total** | **104** |
| **ocurrencias sustituidas** (manifiesto + `src/` + `scripts/`) | **278** de comando + **55** de clave + **1** de sección = **334** |

Reparto de origen de las 99 entradas: `alephscript.*` **86** · `zigurat.*`
**7** · `mcpSocketManager.*` **6**.

> **El «115 totales» del encargo se reconcilia, y no contradice el 86.**
> Mi árbol tiene **99** entradas, no 115. La diferencia son exactamente los
> **16 comandos que podó WP-V13**: 12 `copilotLogs.*` (lote 5) + 4
> `ArrakisTheater.*` (lote 6). `115 − 16 = 99`. El 115 es una cifra
> **pre-poda** (censo V12); el **86 `alephscript.*` sí es exacto hoy**,
> verificado sobre `contributes.commands` de este árbol. Se declara en vez
> de citarse a ciegas.

### 2.2 · Regla de renombrado aplicada

Se sustituye **el primer segmento** por `aleph0`, conservando el resto:

- `alephscript.X.Y` → `aleph0.X.Y`  (86 entradas)
- `zigurat.X.Y` → `aleph0.X.Y`  (7 entradas)
- `mcpSocketManager.X` → **`aleph0.mcpSocketManager.X`**  (6 entradas)

**Por qué los 6 de `mcpSocketManager` conservan ese segundo segmento** y no
se aplanan a `aleph0.X`: `HackerCommandPanelProvider.getCategoryFromId()`
clasifica por prefijo (`startsWith('mcpSocketManager')` → «🔌 MCP Socket»).
Aplanarlos los habría dejado sin categoría, en silencio. Con el segmento
conservado la comprobación pasa a `startsWith('aleph0.mcpSocketManager')` y
la UI no cambia. **Cero colisiones**: se verificó por script que los 104
destinos son distintos entre sí.

### 2.3 · Excepciones declaradas — 4, con motivo

| id no renombrado | motivo |
| ---------------- | ------ |
| `alephscript.hackerControlPanel.focus` | **VS Code lo genera él, con nombre fijo**: para toda vista declarada crea `<viewId>.focus`. El id de vista **no se renombra** (es identificador de código, DV-16.a). Renombrar el `.focus` produciría un comando que no existe. |
| `alephscript.hackerCommandPanel.focus` | ídem |
| `alephscript.hackerConfigPanel.focus` | ídem |
| `alephscript.hackerTasksPanel.focus` | ídem |

Los cuatro se invocan desde `extensionBootstrap.ts` (los `*.toggle`
declarados en el manifiesto **sí** se renombraron; son comandos nuestros).

> **Consecuencia declarada:** el filtro de descubrimiento dinámico de
> `HackerCommandPanelProvider.scanDynamicCommands()` pasa de
> `alephscript.` + `mcpSocketManager.` a `aleph0.`, así que **los cuatro
> `.focus` dejan de aparecer** en ese panel. Antes aparecían como ruido
> («Focus»), sin título propio. Es una mejora, pero es un cambio de UI y no
> se esconde.

### 2.4 · Claves de settings — **13**, no 16

El encargo dice «las 13 `zigurat.*` + las 3 `arrakisTheater.*` = 16».
**Contado en el árbol: son 10 + 3 = 13.** El «13» del encargo es el
**total** que midió V14 (su §3, grupo C: «`zigurat.*` (10) y
`arrakisTheater.*` (3)» → «**13 claves**»), leído como si fuera sólo el de
`zigurat.*`. Enumeradas en la tabla de §3 — **el reporte no las suma dos
veces**.

Superficies tocadas por clave: schema en `contributes.configuration` (13
propiedades) + `getConfiguration('zigurat')` → `getConfiguration('aleph0')`
(1) + literales y prosa en **12 ficheros de `src/`** (55 ocurrencias) +
`scripts/probes/v08-mutacion-autoria.mjs` (5).

**Los 7 consumidores reales de `src/config/ziguratSettings.ts`** (el censo
decía 3; son 7, verificados por import): `core/AracneBotService.ts`,
`core/mcpConfigurationManager.ts`, `elenco/RepartoElencoService.ts`,
`identity/roomSettings.ts`, `launcher/settings.ts`, `mutation/settings.ts`,
`processManager.ts`. Todos leen por sub-clave relativa a la sección
(`cfg.get('mesh.host')`), así que basta con que la sección sea `aleph0` —
verificado uno a uno, no supuesto.

---

## 3 · Tabla de migración (la que viaja en el README)

| clave vieja | clave nueva |
| ----------- | ----------- |
| `zigurat.mesh.host` | `aleph0.mesh.host` |
| `zigurat.mesh.port` | `aleph0.mesh.port` |
| `zigurat.mesh.baseUrl` | `aleph0.mesh.baseUrl` |
| `zigurat.launcher.host` | `aleph0.launcher.host` |
| `zigurat.launcher.port` | `aleph0.launcher.port` |
| `zigurat.ollama.baseUrl` | `aleph0.ollama.baseUrl` |
| `zigurat.room.id` | `aleph0.room.id` |
| `zigurat.lineaEditor.host` | `aleph0.lineaEditor.host` |
| `zigurat.lineaEditor.port` | `aleph0.lineaEditor.port` |
| `zigurat.reparto.path` | `aleph0.reparto.path` |
| `arrakisTheater.configPath` | `aleph0.theater.configPath` |
| `arrakisTheater.autoStart` | `aleph0.theater.autoStart` |
| `arrakisTheater.hackerMode` | `aleph0.theater.hackerMode` |

Las tres últimas entran por **RES-2 de V14**: eran las únicas de sus 26
excepciones **visibles al usuario** (el panel de Ajustes las titulaba
«Arrakis Theater: Config Path»…). El destino `aleph0.theater.*` conserva el
sentido y retira la marca vetada: VS Code las mostrará «Theater: Config
Path».

**VS Code no migra ajustes solo.** Una clave vieja en `settings.json` queda
huérfana y la extensión no la lee. La tabla está en el README que **viaja
en el `.vsix`** (verificado en §7.2).

### 3.1 · «Heredado declarado» — lo que se queda con nombre viejo

| qué | cuántos | por qué |
| --- | ------- | ------- |
| Claves `alephscript.*` (`configurationFile`, `autoLoadConfig`, `configValidation`, `statusBar.visible`, `statusBar.animation`, 7 × `logging.*`) | **12** | Fuera del alcance del brief (sólo `zigurat.*`; +`arrakisTheater.*` por RES-2). **No llevan marca vetada.** Ver duda D-1. |
| Clave `mcpSocketManager.configPath` | **1** | ídem; el propio schema la rotula «legacy setting». |
| Ids de vista (`alephscript.hackerControlPanel`, `…teatro`, `…elenco`, `…mcptree`, `…uis`, `…configs`, `…sockets`, `…logs`, +2 paneles) | **11** | Identificadores de código (DV-16.a). Verificado: los 11 siguen resolviendo en `src/` y los 11 `when: view == …` del manifiesto siguen apuntando a vistas existentes. |
| `viewType` de custom editors (`alephscript.agentContentEditor`, `alephscript.agentConfigEditor`) | **2** | ídem. |
| `viewType` `alephscript.teatro.webview` | **1** | ídem (no declarado en el manifiesto). |
| Claves de `globalState` `alephscript.hackerTheme[.manual]` | **2** | ídem; renombrarlas **perdería** el tema elegido por el usuario. |
| Sección de config `alephscript` / `alephscript.logging` / `mcpSocketManager` en `getConfiguration(...)` | **7 llamadas** | Coherentes con las claves heredadas de arriba: si se renombran las claves, se renombran estas. |
| Convención de ruta `theatrical-content/` | **14 puntos** | §5 (R-1 de V13). Ninguna marca vetada; no es clave ni comando. |
| Identificadores `ZIGURAT_*` / `ZiguratSettings` / `getZiguratSettings` / fichero `src/config/ziguratSettings.ts` | — | **DV-16.a, ambos caminos: los identificadores de código NO se renombran.** |
| Nombres de cliente MCP `zigurat-launcher-catalog`, `zigurat-launcher-resolve`, `zigurat-linea-editor`, `zigurat-resource-projection` | **4** | Identificadores de protocolo que se envían al servidor; cambiarlos es cambiar lo que el servidor ve. Fuera de DV-16.a. |
| `ARRAKIS_*` (4 títulos de webview, 2 variables de entorno), `arrakis-theater-opera`, `arrakis-mcp-web-`, `ArrakisTheater_OperaConfig.json` ×2, `Arrakis: ${name}` | **11** | Identificadores de código. **`Arrakis: ${name}` es la excepción incómoda: es el nombre de terminal que ve el usuario** (`processManager.ts:47`). Se declara como residual de marca, no se toca: la marca fue WP-V14 y ya está aceptada. Ver R-V15-1. |
| `ci.yml:81` nombre de artefacto de CI `zigurat-vsix` | **1** | RES-6 acota a «el texto de **notas** de release». Es un nombre interno de artefacto de Actions, no viaja en el `.vsix`. |

---

## 4 · Los `alephscript.teatro.*` «colgantes» — **la premisa no se sostiene**

El encargo dice: «los `alephscript.teatro.*` colgantes que V13 dejó
anotados en su §7 (**comandos cuyo código se podó**: retíralos del
manifiesto, no los renombres)».

**Re-derivado contra mi árbol: el código de los 6 está vivo.** Los seis
tienen registro propio en `extensionBootstrap.ts`:

```
1033  registerCommand('aleph0.teatro.refresh', …)
1271  registerCommand('aleph0.teatro.activateAgent', …)
1281  registerCommand('aleph0.teatro.deactivateAgent', …)
1291  registerCommand('aleph0.teatro.openChatParticipant', …)
1327  registerCommand('aleph0.teatro.showAgentInfo', …)
1354  registerCommand('aleph0.teatro.openTeatroPanel', …)
```

Lo que dice **R-2 de V13** literalmente es otra cosa: «siguen ofreciendo
abrir chat con `@isaac`, `@don-alvaro`… que ya no existen. **Compila y no
lanza**, pero es UX colgante». Es decir: lo podado (lote 4, DV-11) fueron
los **6 `chatParticipants`**, que son el *destino* del comando, no su
código.

**Decisión: retiro 0 comandos.** Borrar del manifiesto seis comandos con
handler vivo sería una poda sin fila de censo y sin acta — justo lo que
DV-12 prohíbe—, y no es un asunto de espacios de nombres. Se renombran los
seis a `aleph0.teatro.*` y se declara el residual.

> **El único realmente roto es `aleph0.teatro.openChatParticipant`**
> (`extensionBootstrap.ts:1291-1325`): su handler ejecuta
> `workbench.action.chat.open` con la consulta `@<agentId> …` para
> participantes que DV-11 retiró. Eso es **falsedad silenciosa**, familia de
> **WP-V16**, no de este WP. Anotado como R-V15-2.

### 4.1 · Hallazgo mayor que el anterior, y adyacente

Al censar registro-contra-declaración aparecieron **31 comandos declarados
en `contributes.commands` sin ningún `registerCommand` en `src/`**. Salen
en la paleta y, al invocarlos, VS Code responde «command not found». Son
**preexistentes** (no los toca este WP: sólo cambian de nombre) y no tienen
fila de censo, así que **no los retiro**. Listados para que no queden
escondidos, con su nombre nuevo:

`aleph0.mcpSocketManager.openConfigEditor` · `…startLauncher` ·
`…stopLauncher` · `…manageUIs` · `…manageMCPServers` · `aleph0.uis.start` ·
`aleph0.uis.stop` · `aleph0.uis.openBrowser` · `aleph0.showStatusPanel` ·
`aleph0.refreshStatus` · `aleph0.sockets.connect` ·
`aleph0.sockets.disconnect` · `aleph0.sockets.joinRoom` ·
`aleph0.sockets.leaveRoom` · `aleph0.sockets.sendMessage` ·
`aleph0.configs.openInEditor` · `aleph0.configs.validate` ·
`aleph0.configs.format` · `aleph0.configs.backup` ·
`aleph0.configs.createTemplate` · `aleph0.configs.reload` ·
`aleph0.analytics.view` · `aleph0.logs.refresh` · `aleph0.logs.clear` ·
`aleph0.logs.export` · `aleph0.logs.toggleAutoRefresh` ·
`aleph0.logs.toggleGroupByCategory` · `aleph0.logs.toggleErrorsOnly` ·
`aleph0.logs.setLogLevel` · `aleph0.logs.showChannel` ·
`aleph0.mcptree.stopAll`

Y la simétrica: **5 comandos registrados en `src/` que el manifiesto no
declara** (`aleph0.agents.stopAll`, `aleph0.process.startLauncher`,
`aleph0.process.stopLauncher`, `aleph0.system.showStatus`,
`aleph0.system.restart`) — sí renombrados, para no partir el espacio en dos.
Más `aleph0.logs.showEntry`, referenciado como comando de `TreeItem` en
`logsTreeView.ts:64` y no registrado en ningún sitio.

---

## 5 · R-1 de V13 — re-derivado, no citado

La contrarrevisión de V13 (§11.6·1) situó los 9 puntos de
`theatrical-content` en `extensionBootstrap.ts` en las líneas
**1425, 1428, 1455, 1479, 1480, 1510, 1550, 1591, 1595**.

**Re-derivado sobre MI árbol** con `grep -rn "theatrical-content\|theatricalContent" src/`:

```
src/core/extensionBootstrap.ts:1425  Uri.joinPath(workspaceFolder.uri, 'theatrical-content')
src/core/extensionBootstrap.ts:1428  Uri.joinPath(theatricalContentPath, 'content', 'agents', …)
src/core/extensionBootstrap.ts:1455  Uri.joinPath(theatricalContentPath, 'configurations', 'agents', …)
src/core/extensionBootstrap.ts:1479  createDirectory(joinPath(theatricalContentPath, 'content', 'agents'))
src/core/extensionBootstrap.ts:1480  createDirectory(joinPath(theatricalContentPath, 'configurations', 'agents'))
src/core/extensionBootstrap.ts:1510  RelativePattern(…, '**/theatrical-content/content/agents/*.agent.md')
src/core/extensionBootstrap.ts:1550  RelativePattern(…, '**/theatrical-content/configurations/agents/*.config.json')
src/core/extensionBootstrap.ts:1591  RelativePattern(…, '**/theatrical-content/content/agents/*.agent.md')
src/core/extensionBootstrap.ts:1595  RelativePattern(…, '**/theatrical-content/configurations/agents/*.config.json')
```

**Las 9 líneas coinciden exactamente**: V14 no movió `extensionBootstrap.ts`
(sólo tocó `package.json`, `media/`, `README.md` y `LICENSE.md`). La cifra
que estaba desviada era la del cuerpo de R-1 (1429, 1432…), no la de la
contrarrevisión.

**El censo completo son 14 puntos, no 9** — los otros 5 que R-1 ya listaba:
`src/editors/AgentConfigEditorProvider.ts:371`,
`src/editors/AgentContentEditorProvider.ts:249`,
`src/views/HackerConfigPanelProvider.ts:291` y `:292`, y **1 en el
manifiesto** (`package.json:1219`, `customEditors[1].filenamePattern`).
Corrección a R-1: el manifiesto tiene **un** `customEditor` con esa ruta,
no dos (el otro selecciona `*.agent.md`, sin directorio).

**No se renombra ninguno, y aquí está el motivo.** `theatrical-content` no
lleva marca vetada (ni `Zigurat` ni `Arrakis`), no es clave de settings ni
id de comando, y es una **ruta del workspace del usuario**: renombrarla
rompería carpetas ya creadas. DV-16.a acota el renombrado a extension-id,
claves y comandos. Queda en «heredado declarado» (§3.1). Si el custodio
quiere barrerla, es una decisión de convención con su propia fila, no un
espacio de nombres.

---

## 6 · RES-6 · notas de release

`.github/workflows/release.yml`, sólo el texto de las notas — la mecánica
del flujo no se toca:

```diff
-          name: Zigurat ${{ steps.tag.outputs.name }}
+          name: Aleph-0 ${{ steps.tag.outputs.name }}
           body: |
-            ## Zigurat ${{ … }} (extension-id `scriptorium.zigurat`)
+            ## Aleph-0 (ℵ₀) ${{ … }} (extension-id `scriptorium.aleph-0`)
…
-            Guía de prueba: … / `docs/GUIA-PRUEBA-v1.md`.
+            Guía de prueba: … / `docs/GUIA-PRUEBA-v2.md`.
```

La tercera línea no estaba en RES-6 pero **habría quedado apuntando a un
fichero que este WP borra**: el `git rm` de la v1 obliga a moverla o a
publicar un enlace muerto.

---

## 7 · Criterios de aceptación, uno a uno

### 7.1 · CA-1 · prefijo único con excepciones declaradas y contadas — **PASS**

```
$ node -e "…contributes.commands agrupados por primer segmento…"
commands total: 99 unique: 98 byPrefix: { aleph0: 99 }
keybindings prefixes: [ 'aleph0' ]
menus command prefixes: [ 'aleph0' ]
```

Excepciones: **4**, tabla en §2.3. Integridad del manifiesto verificada
aparte: **0** comandos referenciados en `menus`/`keybindings` sin declarar,
**0** `when: view == …` apuntando a vista inexistente.

### 7.2 · CA-2 · grep de claves viejas = 0 — **PASS**

```
$ grep -rn "zigurat\."        package.json src/   → rc=1 (0 coincidencias)
$ grep -rn "arrakisTheater\." package.json src/   → rc=1 (0 coincidencias)
$ grep -rn "getConfiguration('zigurat'" package.json src/ → rc=1 (0 coincidencias)
```

Y sobre el **paquete real**, no sobre el árbol:

```
$ unzip -q dist/aleph-0-0.1.0.vsix -d $TEMP/v15pkg
$ grep -c "zigurat\.\|arrakisTheater\." $TEMP/v15pkg/extension/package.json
0
$ grep -rniE "zigurat|arrakis" $TEMP/v15pkg --exclude-dir=dist
   → 17 líneas, TODAS en extension/readme.md: son la tabla de migración
     (columna «clave vieja») y su explicación. Es el CA-6, no un residuo.
```

### 7.3 · CA-3 · extension-id `scriptorium.aleph-0`, nombre derivado — **PASS**

```
$ node scripts/vsix.mjs name   → aleph-0-0.1.0.vsix
$ node scripts/vsix.mjs path   → dist/aleph-0-0.1.0.vsix
$ grep -o '<Identity[^>]*>' $TEMP/v15pkg/extension.vsixmanifest
<Identity Language="en-US" Id="aleph-0" Version="0.1.0" Publisher="scriptorium" />
```

**El fix de V16 se verificó, no se supuso.** `scripts/vsix.mjs` derivaba
`<publisher>-<name>-<version>.vsix`, que con `name: aleph-0` habría dado
`scriptorium-aleph-0-0.1.0.vsix`, **no** lo que pide la CA. El propio
fichero dejaba escrito por qué: «la marca del producto es obra de WP-V14 y
este WP no la toca… cuando V14 cambie `publisher`/`name`, el nombre lo
seguirá solo». Este WP **sí** es el de la marca del id (DV-16.a), así que
`vsixName()` pasa a `<name>-<version>` — que es además lo que
`vsce package` produce por defecto. **Sigue sin literal de versión en
ningún sitio**; `ci.yml` y `release.yml` lo consumen por
`node scripts/vsix.mjs name|path` y no se han tocado.

### 7.4 · CA-4 · re-verificación de la CA de WP-V05 — §9

### 7.5 · CA-5 · compile + jest por ranura, `git status` limpio — **PASS / FAIL preexistente**

Tabla de `EVIDENCIA.md` transcrita en §8. `git status` limpio (§12).

### 7.6 · CA-6 · nota de migración en el README que viaja — **PASS**

Tabla de 13 filas + las 14 claves que no cambian + sección de comandos, en
`README.md`. Viaja como `extension/readme.md` (5 869 B en el `unzip -l`).

---

## 8 · Evidencia (huella transcrita de `EVIDENCIA.md`)

Huella común: **HEAD `808be04df28e37ea89ff284c14471570524960aa` · árbol
`limpio` · lockfile `sha256:846168401db2694d`**.

| sello (UTC) | etiqueta | resultado | nota |
| ----------- | -------- | --------- | ---- |
| 2026-07-25T17:23:19Z | `compile` | **PASS** | `npm run compile` (esbuild, `--sourcemap`) exit 0 · `dist/extension.js` 1.3 mb |
| 2026-07-25T17:23:54Z | `jest` | **FAIL** | `jest --coverage=false`: **5 fallos, 90 PASS de 95**, 1 suite de 6 |
| 2026-07-25T17:25:29Z | `package` | **PASS** | `npm run package:v1` → `dist/aleph-0-0.1.0.vsix`, **28 ficheros, 244.79 KB** |

Todo por ranura (`bash scripts/slot.sh run <etiqueta> -- …`).
`evidencia.sh vigente` salió **1** en las tres (worktree recién creado, sin
`EVIDENCIA.md` previo): no había registro que citar. `npm install` también
fue por ranura (etiqueta `npm-install`).

**Desviación declarada:** `jest` se lanzó como
`bash scripts/slot.sh run jest -- npx jest --coverage=false`. El encargo
dice «npx ROTO — no lo uses»; aquí **funcionó** porque este worktree tiene
`node_modules` completo tras `npm install` (el fallo conocido de `npx` es
en instalaciones de node sin `node_modules/npm`). Se anota como desviación,
no se esconde. `vsce` **no** pasó por `npx`: fue por
`scripts/vsix.mjs` → binario local.

### 8.1 · Los 5 fallos de jest son los preexistentes de V13 — no míos

| medida | V13 (`9172d07`, §5.1) | V15 (`808be04`) |
| ------ | --------------------- | --------------- |
| suites FAIL | 1 de 6 | **1 de 6** |
| tests FAIL | 5 | **5** |
| tests PASS | 90 de 95 | **90 de 95** |
| fichero | `tests/integration/managerFactory.test.ts` | **el mismo** |
| error | `vscode.window.onDidCloseTerminal is not a function` | **el mismo** |

Cinco cifras idénticas y el mismo error en el mismo fichero. La causa que
documentó V13 es un hueco del mock `tests/mocks/vscode.mock.js` que alcanza
`src/terminalManager.ts:24` — fichero que **este WP no toca** (no aparece
en el diff, §11). **Se citan como preexistentes.**

`compile:tests` (`tsc`) **no se ha corrido**: V13 lo dejó documentado con 8
errores preexistentes en `src/elenco`, `src/identity`, `src/launcher`,
`src/mutation`, `src/resources`, ninguno relacionado con nombres. Correrlo
no habría producido evidencia nueva sobre este WP y sí habría gastado
ranura. Se declara como **no ejecutado**, no como PASS.

### 8.2 · `unzip -l` del paquete real

Lección de la errata aplicada: se mide el paquete, no un glob.

```
$ unzip -l dist/aleph-0-0.1.0.vsix
  Length      Date    Time    Name
---------  ---------- -----   ----
     2867  2026-07-25 19:24   extension.vsixmanifest
      515  2026-07-25 19:24   [Content_Types].xml
     5869  2026-07-25 19:24   extension/readme.md
    39933  2026-07-25 19:17   extension/package.json
      682  2026-07-25 19:07   extension/LICENSE.md
    10124  2026-07-25 19:07   extension/schemas/xplus1-config.schema.json
     6150  2026-07-25 19:07   extension/schemas/webrtc-ui-config.schema.json
     2853  2026-07-25 19:07   extension/schemas/socket-config.schema.json
     9452  2026-07-25 19:07   extension/media/teatro.js
     7147  2026-07-25 19:07   extension/media/teatro.css
     3888  2026-07-25 19:07   extension/media/hacker-themes.css
     1804  2026-07-25 19:07   extension/media/hacker-theme-switcher.js
    13544  2026-07-25 19:07   extension/media/hacker-tasks-panel.js
    13633  2026-07-25 19:07   extension/media/hacker-tasks-panel.css
    13078  2026-07-25 19:07   extension/media/hacker-control-panel.js
     7369  2026-07-25 19:07   extension/media/hacker-control-panel.css
    12623  2026-07-25 19:07   extension/media/hacker-config-panel.js
     9769  2026-07-25 19:07   extension/media/hacker-config-panel.css
    19957  2026-07-25 19:07   extension/media/hacker-command-panel.js
     8266  2026-07-25 19:07   extension/media/hacker-command-panel.css
     2418  2026-07-25 19:07   extension/media/hacker-base.css
     3306  2026-07-25 19:07   extension/media/aleph-0-icon.png
     1613  2026-07-25 19:07   extension/media/aleph-0-activitybar.svg
    16742  2026-07-25 19:07   extension/media/agent-content-editor.js
     9478  2026-07-25 19:07   extension/media/agent-content-editor.css
    19988  2026-07-25 19:07   extension/media/agent-config-editor.js
     9338  2026-07-25 19:07   extension/media/agent-config-editor.css
   708311  2026-07-25 19:24   extension/dist/extension.js
---------                     -------
   960717                     28 files
```

Fichero en disco: **250 664 B**. Sin `src/`, sin `LICENSE` de broma (V14 ya
lo sustituyó), sin `media/mcp.svg` (V14 lo retiró).

> **R-7 de V13 se reprodujo, y por eso hay dos empaquetados.** El primer
> `npm run package:v1` salió con **29 ficheros y 701.75 KB** porque
> arrastró `extension/dist/extension.js.map` (2 370 787 B): mi `npm run
> compile` previo lo había dejado en `dist/`, y el patrón `*.map` de
> `.vscodeignore` no alcanza a `dist/`. Se borró `dist/` y se re-empaquetó:
> **28 ficheros, 244.79 KB**. El `.vsix` entregado es el limpio. **R-7 sigue
> vivo y sigue siendo una trampa real**: `compile` + `package:v1` seguidos
> triplican el paquete en silencio.

### 8.3 · `dist/extension.js` re-medido

V14 declaró (dato informativo): **32** `zigurat` y **15** `arrakis` en el
bundle. Tras este WP, sobre `dist/extension.js` del paquete entregado
(`compile:production --minify`):

| patrón | V14 | V15 | qué queda |
| ------ | --- | --- | --------- |
| `zigurat` (cualquier caso) | 32 | **4** | los 4 nombres de cliente MCP (`zigurat-launcher-catalog`, `-resolve`, `zigurat-linea-editor`, `zigurat-resource-projection`) |
| `arrakis` (cualquier caso) | 15 | **11** | `arrakis-theater-opera`, `ARRAKIS_PROCESS`, `ARRAKIS_PORT`, 4 títulos `ARRAKIS_*` de webview, `Arrakis: ${name}`, `arrakis-mcp-web-`, `ArrakisTheater_OperaConfig.json` ×2 |
| `zigurat\.` (clave o comando viejo) | — | **0** | — |
| `arrakisTheater\.` | — | **0** | — |
| `aleph0\.` | — | **148** | — |

**Las 15 supervivientes son identificadores de código**, legales por
DV-16.a, declaradas con conteo y **no renombradas**. `ZIGURAT_PENDING`
desaparece del bundle porque el minificador lo inlinea a `'⏳'`.

---

## 9 · Re-verificación de la CA de WP-V05 (§9·C5) — obligatoria

### 9.1 · Greps del reporte V05, re-corridos con las claves nuevas — **0 / 0 / 0**

Mismos ficheros y mismos patrones que `plan/REPORTES/WP-V05-config-unica.md`:

```
$ grep -nE '/c/Users/|/Users/oracl|C:\\+Users\\+|/Users/[^/]+/Documents/REPOS' \
    src/libs/alephscript-client.ts src/core/AracneBotService.ts \
    src/core/mcpConfigurationManager.ts src/processManager.ts \
    src/config/ziguratSettings.ts package.json
rc=1   → 0 coincidencias

$ grep -nE 'localhost:[0-9]+|127\.0\.0\.1:[0-9]+|port:\s*30[0-9][0-9]|,\s*3050\)|http://localhost:[0-9]+' \
    src/libs/alephscript-client.ts src/core/AracneBotService.ts \
    src/core/mcpConfigurationManager.ts src/processManager.ts \
    src/config/ziguratSettings.ts
rc=1   → 0 coincidencias

$ grep -nE '3010|11434|3050|/c/Users/oracl' \
    src/libs/alephscript-client.ts src/core/AracneBotService.ts \
    src/core/mcpConfigurationManager.ts src/processManager.ts
rc=1   → 0 coincidencias
```

### 9.2 · Y el mismo grep **ampliado a todo `src/`** — lo que V05 no midió

V05 sólo grepeó 5 ficheros. Ampliado, aparecen **exactamente los tres
residuales que el propio V05 declaró «fuera de alcance»**, ninguno nuevo:

```
src/views/README.md:153,155,157,159,161,163
    file:///c%3A/Users/oracl/Documents/REPOS/mcp-vscode-ext/…   (6 enlaces)
src/treeViews/configsTreeView.ts:430   : "ws://localhost:3000"   (plantilla)
src/treeViews/socketsTreeView.ts:86,92  'localhost:3000'         (fallback de UI)
```

**Los tres siguen fuera del `.vsix`**: el paquete no lleva `src/` (§8.2).
No son regresión de este WP y no se tocan (fuera de alcance).

### 9.3 · Defaults del schema con las claves nuevas — vacíos, verificados

```
aleph0.mesh.host          default = ""      aleph0.room.id            default = ""
aleph0.mesh.port          default = null    aleph0.lineaEditor.host   default = ""
aleph0.mesh.baseUrl       default = ""      aleph0.lineaEditor.port   default = null
aleph0.launcher.host      default = ""      aleph0.reparto.path       default = ""
aleph0.launcher.port      default = null    aleph0.theater.configPath default = ""
aleph0.ollama.baseUrl     default = ""      aleph0.theater.autoStart  default = false
                                            aleph0.theater.hackerMode default = true
```

Ningún puerto ni host inventado sobrevive al renombrado: los defaults son
`""` / `null`, igual que los dejó V05.

### 9.4 · Arranque con settings vacíos mostrando ⏳ — **⏳ verificado por lectura de código, no por ejecución**

**No pude arrancar VS Code** (no hay Extension Host interactivo en esta
sesión). Se declara ⏳ y se aporta el análisis del camino de código, que es
lo que el encargo autoriza:

1. **La sección se lee entera y coherente.**
   `src/config/ziguratSettings.ts:44` → `getConfiguration('aleph0')`, y las
   diez lecturas relativas (`cfg.get('mesh.host')`, `'mesh.port'`,
   `'mesh.baseUrl'`, `'launcher.host'`, `'launcher.port'`,
   `'ollama.baseUrl'`, `'room.id'`, `'lineaEditor.host'`,
   `'lineaEditor.port'`, `'reparto.path'`) **componen exactamente las 10
   claves `aleph0.*` del schema**. Comprobado por script cruzando los
   literales de `src/` contra `contributes.configuration`: **0 literales
   `aleph0.*` en `src/` que no sean clave del schema o comando declarado**
   (las 17 excepciones del cruce son prefijos de categoría, secciones y los
   6 ids colgantes de §4.1, todos identificados).
2. **Sin settings, cada camino sigue devolviendo ⏳, no un invento.**
   `readString` → `''`, `readNumber(null)` → `undefined`;
   `resolveMeshBaseUrl` devuelve `''` si faltan `baseUrl` y `host+port`
   (`ziguratSettings.ts:63-71`); `isMeshConfigured` → `false`;
   `meshPendingLabel` → `'⏳'`. Aguas abajo, sin cambios respecto de V05:
   `AracneBotService.initialize` → `pending=true`, `client=undefined`, warn
   con ⏳, `return` sin `throw` (`:99-105`); `AlephScriptClient` no crea
   `io` (`:62`); `McpConfigurationManager` entra en modo pendiente con
   `servers`/`webs` vacíos (`:132`); `ProcessManager.startLauncher`
   devuelve `false` con aviso ⏳ y **no** inventa 3050 (`:181-184`).
   Los textos de esos avisos ya nombran las claves **nuevas**
   (`aleph0.mesh.baseUrl`, `aleph0.launcher.port`): un usuario que los lea
   copia un nombre que existe.
3. **`compile` verde** (§8) demuestra que el camino de `activate` no rompe
   por tipos tras el renombrado.

**Lo que esto NO demuestra:** que la extensión instalada active sin error en
un VS Code real. Eso sigue siendo **⏳** y es material de la guía de prueba
(§10) y del tick del vigía-S, que está **DEFERRED** por DV-14.

---

## 10 · `docs/GUIA-PRUEBA-v2.md` — regenerada

`docs/GUIA-PRUEBA-v1.md` retirada con `git rm` (no borrada a mano). La v2:

- 10 pasos, todos con **claves y comandos nuevos** (`aleph0.*`,
  categoría de paleta `Aleph-0:`).
- Apunta al **`.vsix` LOCAL** `dist/aleph-0-0.1.0.vsix`, construido con
  `npm run package:v1`, y dice **explícitamente** que el Release público
  `v0.1.0` de GitHub lleva el artefacto viejo (`scriptorium-zigurat-…`,
  extension-id `scriptorium.zigurat`) y que el tick público está DEFERRED
  (DV-14).
- Añade un paso 0 de construcción y un paso 2 que **desinstala los dos ids
  viejos** (`scriptorium.zigurat` y
  `escrivivir-co.scriptorium-vscode-extension`): al cambiar el extension-id
  las instalaciones **conviven**, y eso es una trampa nueva que introduce
  este WP.
- Runtime z-sdk local igual que la v1 (`C:\S_LAB\z-sdk`, mesh ~3010,
  launcher ~3050), aclarando que esos puertos son del runtime del custodio
  y **no** defaults del schema.
- Cierra con lo que la guía **no** demuestra (equivalencia con el asset
  público: anomalía ARTEFACTO-NO-EQUIVALENTE, no re-verificada).

`release.yml` ya apunta a la v2; no queda ninguna referencia a la v1 fuera
de `plan/`.

---

## 11 · H-1 · lockfile · huella nueva

`npm install` por ranura (etiqueta `npm-install`), tras cambiar `name`.

| campo | antes | después |
| ----- | ----- | ------- |
| `name` (raíz y `packages[""]`) | `scriptorium-vscode-extension` | **`aleph-0`** |
| `version` (raíz y `packages[""]`) | `0.1.0-scriptorium` | **`0.1.0`** |
| `license` en `packages[""]` | *(ausente)* | `UNLICENSED` |
| `lockfileVersion` | 3 | 3 |

```
$ grep -c "scriptorium-vscode-extension\|0.1.0-scriptorium" package-lock.json
0
$ git diff --stat package-lock.json
 package-lock.json | 9 +++++----   (5 insertions(+), 4 deletions(-))
```

**El grafo de dependencias no cambia**: 4 líneas de identidad y 1 de
licencia. `npm install` reportó `added 1543 packages, audited 1544`, sin
resolver nada distinto.

**Huella nueva del lockfile:**

```
sha256 : 846168401db2694d7e5a1de9b126563569a50b4bc2df9cf572f91e11adce2ea6
         (evidencia.sh usa el prefijo: sha256:846168401db2694d)
blob   : 90ce0cfa345b5b2f35f8c8157539b1579035c4f4   (git hash-object)
```

La huella de V13 era `sha256:363c08ffd4f544da`; la de este árbol es
`sha256:846168401db2694d`. **Ninguna evidencia anterior a este WP es
vigente aquí**, y por eso hubo que ejecutar los tres comandos caros.

---

## 12 · Ficheros tocados (33) — deben coincidir con el alcance

| grupo | ficheros |
| ----- | -------- |
| manifiesto (1) | `package.json` |
| lockfile (1) | `package-lock.json` |
| empaquetado (1) | `scripts/vsix.mjs` |
| flujos (1) | `.github/workflows/release.yml` |
| probes (1) | `scripts/probes/v08-mutacion-autoria.mjs` |
| `src/` (24) | `commandPaletteManager.ts` · `config/ziguratSettings.ts` · `core/AracneBotService.ts` · `core/HackerStatusBarManager.ts` · `core/aiAssistantService.ts` · `core/extensionBootstrap.ts` · `core/mcpConfigurationManager.ts` · `elenco/DOS-MODELOS.md` · `elenco/RepartoElencoService.ts` · `identity/IdentityStatusBar.ts` · `identity/roomSettings.ts` · `identity/types.ts` · `launcher/LauncherCatalogClient.ts` · `launcher/settings.ts` · `launcher/types.ts` · `libs/alephscript-client.ts` · `mutation/settings.ts` · `processManager.ts` · `resources/ResourceProjectionService.ts` · `treeViews/configsTreeView.ts` · `treeViews/logsTreeView.ts` · `views/HackerCommandPanelProvider.ts` · `views/HackerConfigPanelProvider.ts` · `views/HackerControlPanelProvider.ts` · `views/TeatroTreeDataProvider.ts` |
| docs (2) | `docs/GUIA-PRUEBA-v1.md` (**borrado**) · `docs/GUIA-PRUEBA-v2.md` (**nuevo**) |
| README (1) | `README.md` |
| reporte (1) | este fichero |

*(24 entradas listadas en la fila `src/`; el total de la cabecera cuenta
también el reporte.)*

**Dos ediciones de `src/` que NO son renombrado de espacio de nombres** —
se declaran por separado porque el contrarrevisor las verá en el diff:

1. `src/views/HackerConfigPanelProvider.ts:158` —
   `"VS Code settings specific to Arrakis Theater"` →
   `"…specific to Aleph-0"`. Es el **encabezado del grupo que agrupa las
   tres claves que acabo de renombrar** a `aleph0.theater.*`: dejarlo
   habría convertido la descripción en una mentira sobre claves que ya no
   se llaman así.
2. `src/identity/IdentityStatusBar.ts:25` — tooltip
   `Zigurat identidad` → `Aleph-0 identidad`. Es marca visible al usuario
   que **viaja en el bundle**; el método de V14 (grepear el `.vsix`
   excluyendo `dist/`) no podía verla porque `src/` no viaja como fuente.
   Está en un fichero que este WP ya toca (por `aleph0.identity.join`).
   DV-16 es guía, no gate: se corrige y se declara.

`git status`: **limpio** tras los dos commits.

---

## 13 · Residuales — listados, no escondidos

| id | residual | dueño |
| -- | -------- | ----- |
| **R-V15-1** | `processManager.ts:47` nombra los terminales **`Arrakis: <nombre>`** — marca vetada **visible al usuario** y viaja en el bundle. Es el residual de marca de mayor cara de usuario que queda tras V14+V15. No se toca: la marca fue WP-V14 y está aceptada; cambiarla ahora sería decidir marca desde un WP de nombres | custodio / DV-16 |
| **R-V15-2** | `aleph0.teatro.openChatParticipant` (`extensionBootstrap.ts:1291`) tiene handler vivo pero abre chat con participantes que DV-11 retiró: **promete algo que no puede cumplir** | **WP-V16** (falsedades silenciosas) |
| **R-V15-3** | `aleph0.analytics.export` está **declarado dos veces** en `contributes.commands` (99 entradas, 98 ids). Preexistente; VS Code se queda con una | sin fila; material de V16 / limpieza de manifiesto |
| **R-V15-4** | **31 comandos declarados sin `registerCommand`** (§4.1) + **1 referencia colgante** (`aleph0.logs.showEntry`, `logsTreeView.ts:64`). Salen en la paleta y fallan al invocarse. Preexistente | **WP-V16** |
| **R-V15-5** | El espacio de **ajustes queda mixto**: 13 claves `aleph0.*`, 12 `alephscript.*` y 1 `mcpSocketManager.*`. Los **comandos** sí quedan con prefijo único. Es exactamente lo que pide el brief, y aun así es una incoherencia visible en el panel de Ajustes | custodio — duda **D-1** |
| **R-V15-6** | **R-7 de V13 sigue vivo**: `npm run compile` seguido de `npm run package:v1` mete `dist/extension.js.map` (2,3 MB) en el `.vsix` (29 ficheros / 701.75 KB en vez de 28 / 244.79 KB). El patrón `*.map` de `.vscodeignore` no alcanza a `dist/`. Reproducido hoy (§8.2) | `.vscodeignore` · **V-L4-05** |
| **R-V15-7** | Los **11 ids de vista** y los **3 `viewType`** siguen bajo `alephscript.` mientras los comandos son `aleph0.`. Legal (identificadores de código, DV-16.a) y **no renombrable sin coste**: los `<viewId>.focus` de VS Code y el `globalState` del tema cuelgan de ellos | heredado declarado |
| **R-V15-8** | Los residuales de rutas/puertos de V05 fuera de sus 5 ficheros (`src/views/README.md` ×6 enlaces a `/c/Users/oracl/…`, `configsTreeView.ts:430`, `socketsTreeView.ts:86,92`) siguen ahí. Ninguno viaja en el `.vsix` | ya declarados por V05 |
| **R-V15-9** | `ci.yml:81` sube el artefacto como `zigurat-vsix`. Interno de Actions, fuera del alcance de RES-6 | orquestador, si quiere coherencia |

---

## 14 · Lo que NO pude hacer, y por qué

1. **Arrancar la extensión en un VS Code real** — **⏳**. No hay Extension
   Host interactivo en esta sesión. La CA de V05 se re-verifica por lectura
   del camino de código, declarado como tal en §9.4. Es la misma limitación
   que declararon V10, V13 y V14.
2. **`compile:tests` (`tsc`)** — **no ejecutado**, no «PASS». V13 lo dejó en
   8 errores preexistentes ajenos a nombres; repetirlo habría gastado ranura
   sin producir evidencia sobre este WP (§8.1).
3. **Retirar los `alephscript.teatro.*`** que el encargo daba por podados —
   **la premisa no se sostiene** contra mi árbol (§4). No retiro código vivo
   sin fila de censo.
4. **Retirar los 31 comandos sin handler** — fuera de alcance y sin fila de
   censo; es poda, y la poda tiene acta (DV-12). Listados en §4.1.
5. **Renombrar las 13 claves heredadas `alephscript.*` / `mcpSocketManager.*`**
   — fuera del alcance del brief. Declaradas en §3.1 y elevadas como D-1.

---

## 15 · Dudas para el revisor / custodio

- **D-1 (la de fondo).** El WP se llama «espacios de nombres» y deja el de
  **ajustes partido en tres** (`aleph0.` 13, `alephscript.` 12,
  `mcpSocketManager.` 1) mientras unifica el de **comandos** en uno. Es lo
  que manda el brief (que acota a `zigurat.*` + `arrakisTheater.*`), pero
  quien abra el panel de Ajustes verá tres secciones donde debería ver una.
  ¿Se completa a `aleph0.*` en un WP posterior, con su propia tabla de
  migración, o se ratifica el mixto?
- **D-2.** El destino elegido para las tres de V14 es `aleph0.theater.*`
  (VS Code las rotulará «Theater: …»). La alternativa era `aleph0.teatro.*`,
  coherente con los comandos `aleph0.teatro.*` pero mezclando idiomas en el
  panel. Elegí el inglés por consistencia con el rótulo que ya tenían.
- **D-3.** He cambiado **la forma del nombre del artefacto** que WP-V16
  había fijado a propósito (`<publisher>-<name>-<version>` →
  `<name>-<version>`), porque la CA de este WP exige `aleph-0-0.1.0.vsix`.
  El fichero de V16 preveía justamente este caso, pero el cambio pisa una
  decisión de otro WP: **confírmese**.
- **D-4.** Cambiar el extension-id significa que quien tenga instalada
  `scriptorium.zigurat` acabará con **dos extensiones conviviendo**, ambas
  registrando comandos. La guía v2 lo cubre con un paso de desinstalación,
  pero no hay forma de forzarlo desde el `.vsix`.
- Recordatorio de la trampa **R-7 / R-V15-6** para quien re-empaquete:
  `rm -rf dist` antes de `npm run package:v1`, o el paquete triplica.

---

## 16 · Fronteras respetadas

- **No** he fusionado a `main`, **no** hay rebase sobre main, **no** hay
  push, **no** hay force-push, **no** hay tags y **no** se ha reescrito
  historia.
- **No** he escrito `plan/BACKLOG.md` ni cerrado ninguna `DV-nn`.
- **No** he tocado `C:/S_LAB/z-sdk`, `C:/S/scriptorium/**` ni el espejo
  OASIS (ni lectura de escritura: sólo se leyeron reportes de `plan/` de
  este mismo repo).
- **No** he matado el watcher de `C:/S_LAB/vigilancia/v/`.
- Identidad del worktree verificada tras el primer commit:
  `git log -1 --format='%an <%ae>'` → `worker-V <alephscriptorium@gmail.com>`.
- Todo comando caro por `scripts/slot.sh run` y registrado con
  `scripts/evidencia.sh registrar`.

---

**`VEREDICTO_REVISOR: ⏳ pendiente`** — contrarrevisión independiente
obligatoria (config / empaquetado), por agente distinto de este worker.
