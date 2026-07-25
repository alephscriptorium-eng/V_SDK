# REPORTE · WP-V13 · Poda (Ola F · CORTE)

| dato | valor |
| ---- | ----- |
| WP | **WP-V13 · Poda** |
| Rama | `wp/v13-poda` |
| Worktree | `C:/S_LAB/.worktrees/v/v-sdk-wp-v13` |
| Base | `4766523` (main con censo V12 + V16 + V17 fusionados) |
| Tag de archivo (DV-12) | **`archive/pre-poda-ola-f` → `4766523bc739d5f5e51d787e4f0767220dec311e`**, creado **antes** de tocar nada |
| Fuente única de qué se poda | `plan/CENSO-V12.md` (69 filas · 23 con veredicto **poda**) |
| DV que gobiernan | **DV-11** ✅ poda ahora, re-lore a wishlist · **DV-12** ✅ tag de archivo + `git rm` con acta |
| Identidad | `worker-V <alephscriptorium@gmail.com>` (verificada tras el primer commit) |
| SHA del tip de **obra** | `9172d078ac4a4e3e0a3241cdebc309a25d7aba4b` |
| VEREDICTO_REVISOR | **⏳ pendiente** |

---

## 1 · Resumen en una línea

Se han ejecutado **las 23 filas con veredicto «poda»** del censo V12 —
**23/23, ninguna omitida y ninguna añadida** — más su arrastre obligado.
El árbol pasa de **552 a 300 ficheros trackeados**: **252 borrados**
(de los cuales 72 son destrackeo de `coverage/`, no borrado de disco) y
**4 ficheros modificados**. El bundle minificado cae de **3,1 MB a
692 KB** y el `.vsix` de **1,27 MB a 591,81 KB**.

`compile` verde · probes **V07/V08/V09 PASS** · `vsce package` **OK**.
`compile:tests` y `jest` salen en rojo por fallos **preexistentes,
verificados uno a uno contra el tag de archivo**: la poda no añade ni uno
(§5).

---

## 2 · Control de recuento

| medida | pre-poda (`archive/pre-poda-ola-f`) | post-poda (`9172d07`) |
| ------ | ----------------------------------- | --------------------- |
| ficheros trackeados | **552** | **300** |
| trackeados-e-ignorados (`git ls-files -i -c --exclude-standard`) | **72** (todas `coverage/`) | **0** |
| `contributes.commands` | **115** (86 `alephscript` · 12 `copilotLogs` · 7 `zigurat` · 6 `mcpSocketManager` · 4 `ArrakisTheater`) | **99** (86 · 7 · 6) |
| `contributes.chatParticipants` | **6** | **0** (clave retirada) |
| vistas del contenedor `arrakisTheater` | **12** | **11** |
| `dist/extension.js` (minificado) | **3,1 MB** | **692,31 KB** |
| `.vsix` | 32 ficheros · **1,27 MB** | 32 ficheros · **591,81 KB** |

`git diff --shortstat archive/pre-poda-ola-f HEAD` →
`256 files changed, 8 insertions(+), 109772 deletions(-)`
(252 `D` + 4 `M`).

**Comprobación de CA-1 — cero entradas «poda» vivas.** `git ls-files` da
`tracked=0` para las 23 entradas:

```
.config .esbuild.config.js ArrakisTheater_OperaConfig.json FEATURE_CONFIGS
INSTALL.md PLANIFICACION README-LEGACY-EXTENSION.md build-and-install.sh
coverage demo nvm-exec.sh pics prompts sample-config.json
setup-vscode-path.sh test-extension.js theatrical-content vibecoding
src/configEditor.ts src/copilotLogs src/examples src/mcpChatParticipant.ts
src/statusManager.ts
```

---

## 3 · ACTA (DV-12) · entrada → fila del censo → comando

Seis commits de obra, por lotes coherentes (código + tests + arrastre
juntos). **Ningún borrado sin fila de censo.**

### Lote 1 · `f615434` — 18 entradas inertes de primer nivel

| entrada (nº ficheros) | fila del censo | comando |
| --------------------- | -------------- | ------- |
| `.config` (1) | Tabla A · `.config` · poda | `git rm -r .config` |
| `.esbuild.config.js` (1) | Tabla A · `.esbuild.config.js` · poda (D6: muerto) | `git rm .esbuild.config.js` |
| `FEATURE_CONFIGS` (4) | Tabla A · `FEATURE_CONFIGS` · poda | `git rm -r FEATURE_CONFIGS` |
| `INSTALL.md` (1) | Tabla A · `INSTALL.md` · poda | `git rm INSTALL.md` |
| `PLANIFICACION` (15) | Tabla A · `PLANIFICACION` · poda | `git rm -r PLANIFICACION` |
| `README-LEGACY-EXTENSION.md` (1) | Tabla A · idem · poda | `git rm README-LEGACY-EXTENSION.md` |
| `build-and-install.sh` (1) | Tabla A · idem · poda | `git rm build-and-install.sh` |
| `demo` (2) | Tabla A · `demo` · poda | `git rm -r demo` |
| `nvm-exec.sh` (1) | Tabla A · idem · poda | `git rm nvm-exec.sh` |
| `pics` (6) | Tabla A · `pics` · poda | `git rm -r pics` |
| `prompts` (17) | Tabla A · `prompts` · poda | `git rm -r prompts` |
| `sample-config.json` (1) | Tabla A · idem · poda (D15: nada obligatorio detrás) | `git rm sample-config.json` |
| `setup-vscode-path.sh` (1) | Tabla A · idem · poda (D13: ya roto) | `git rm setup-vscode-path.sh` |
| `test-extension.js` (1) | Tabla A · idem · poda | `git rm test-extension.js` |
| `vibecoding` (68) | Tabla A · `vibecoding` · poda | `git rm -r vibecoding` |
| `ArrakisTheater_OperaConfig.json` (1) | Tabla A · idem · poda | `git rm ArrakisTheater_OperaConfig.json` |
| `theatrical-content` (3) | Tabla A · idem · poda | `git rm -r theatrical-content` |
| **arrastre** `.vscode/settings.json` (1) | §8 fila `ArrakisTheater_OperaConfig.json` (la cita en `:2-3`) + Tabla A fila `.vscode` («lo legado que se va es `settings.json`») | `git rm .vscode/settings.json` |
| **arrastre** `README.md:13` | Tabla A fila `README.md` («pierde el enlace a `README-LEGACY-EXTENSION.md` cuando esa fila se ejecute») + §8 («único enlace vivo») | edición: el enlace muerto se sustituye por el puntero al tag de archivo |
| **arrastre** `package.json` script `unix:code` | Tabla A fila `setup-vscode-path.sh` + D13 (`sh ./setup-vscode-path`) | edición: script retirado — invocaba un fichero recién podado |

### Lote 2 · `d876296` — `coverage/` (destrackeo, no borrado)

| entrada | fila del censo | comando |
| ------- | -------------- | ------- |
| `coverage/` (72 rutas) | Tabla A · `coverage` · poda; **D8** (jest lo regenera) y **D20** (adjudica V17-B) mandan destrackear | `git rm -r --cached coverage` |

Sigue en disco a propósito: está en `.gitignore:2` y `jest.config.js:12-13`
lo reescribe. Comprobado: `git ls-files -i -c --exclude-standard` pasa de
**72 a 0**, y `ls coverage` sigue devolviendo los ficheros.

### Lote 3 · `c164731` — código muerto

| entrada (nº ficheros) | fila del censo | comando |
| --------------------- | -------------- | ------- |
| `src/configEditor.ts` (1) | Tabla B · poda · muerto (D4) | `git rm src/configEditor.ts` |
| `src/examples/` (1) | Tabla B · poda · muerto (D4) | `git rm -r src/examples` |
| `src/statusManager.ts` (1) | Tabla B · poda · muerto (D4) | `git rm src/statusManager.ts` |
| `src/theatrical/agents/` (20) | Tabla B · fila `src/theatrical` («el contenido se va») + D4 (10 `.ts` muertos) + D18 (10 ficheros de contenido de agentes) | `git rm -r src/theatrical/agents` |
| `src/theatrical/core/managers/` (3) | idem · D4 (`TheatricalAgent.ts`, `TheatricalAgentCore.ts`) + **D18** (`TheatricalAgent.ts.backup`) | `git rm -r src/theatrical/core/managers` |
| `src/theatrical/core/schemas/` (4) | idem · D4 (`validation.ts`) + D18 (3 schemas de teatro sin lector vivo) | `git rm -r src/theatrical/core/schemas` |
| `src/theatrical/core/vscode/` (1) | idem · D4 (`ChatParticipantFactory.ts`) | `git rm -r src/theatrical/core/vscode` |
| **arrastre** `tests/DonAlvaroValidation.test.ts` | §8 «orden de ejecución»: `:11` importa `DonAlvaroChatParticipant` — mismo commit | `git rm tests/DonAlvaroValidation.test.ts` |

**Intocado a propósito:** `src/theatrical/core/interfaces/` (4 ficheros).
`src/mcpServerManager.ts:4` importa `MCPConfiguration` de ahí (D11) y
`ICompany.ts` lleva la declaración de frontera de WP-V09. Verificado tras
la poda: `ICompany.ts:6-7,18` («ICompany es el Modelo B … NO es
`reparto/1` … Prohibido fusionar con elenco de dominio») siguen en el
árbol, y ningún fichero de `interfaces/` importaba nada de lo borrado.

### Lote 4 · `f6ae634` — DV-11 · los 6 `chatParticipants`

| entrada | fila del censo | comando |
| ------- | -------------- | ------- |
| `src/mcpChatParticipant.ts` | Tabla B · **poda (pend. DV-11 → CERRADA: poda ahora)** | `git rm src/mcpChatParticipant.ts` |
| `src/theatrical/TheatricalChatManager.ts` | Tabla B fila `src/theatrical`, «la parte viva … poda pend. DV-11» + §7 (crea los 5 personajes en `:42-86`) | `git rm src/theatrical/TheatricalChatManager.ts` |
| `package.json` · `contributes.chatParticipants` (6 ids, 128 líneas) | §7 tabla de DV-11 + Tabla A fila `package.json` («lo reescriben V13 (comandos podados)…») | edición quirúrgica preservando formato y CRLF |
| **arrastre** `src/core/extensionBootstrap.ts` | §8 (`:11,:57,:115` · `:12,:58,:118`) **+ 5 puntos que §8 no listaba** (`:199,:200,:231,:2170,:2173`) — ver discrepancia **DISC-1** | ediciones |
| **arrastre** `tests/unit/mcpChatParticipant.test.ts` | §8 «orden de ejecución» (`:3` importa `McpChatParticipant`) | `git rm` |
| **arrastre** `tests/integration/extensionChatIntegration.test.ts` | §8 «nota adyacente» (`:3` importa `ExtensionBootstrap`; `:108` usa `context.chatParticipant`) | `git rm` |

### Lote 5 · `eea6825` — `src/copilotLogs` (fila 17)

| entrada (nº ficheros) | fila del censo | comando |
| --------------------- | -------------- | ------- |
| `src/copilotLogs/` (16) | Tabla B · `src/copilotLogs` · poda («§2 lo poda sin reemplazo — no cablea nada de la ciudad») | `git rm -r src/copilotLogs` |
| **arrastre** `.vscode/mcp.json` | la propia fila («arrastra `.vscode/mcp.json` (`localhost:3100`)») + §8 + fila `.vscode` | `git rm .vscode/mcp.json` |
| **arrastre** `package.json` · 12 comandos `copilotLogs.*` | §8 + **D17** + fila `package.json` («V13 (comandos podados)») | edición |
| **arrastre** `package.json` · vista `copilotMetrics.panel` | §8 (su proveedor real era `copilotLogs/commands.ts:485-488`, que se va) | edición |
| **arrastre** `src/core/extensionBootstrap.ts` `:41,:42,:1773,:1776-1779,:1781` | §8 («no basta con el manifiesto … rompe la compilación de `src/core`») | ediciones |

El import `:42` de `CopilotMetricsPanelProvider` era el **import muerto**
que §8 anota como anomalía: cero usos, se borró la línea entera sin
re-cablear nada, tal y como el censo predice.

### Lote 6 · `9172d07` — los 4 `ArrakisTheater.*` y su servicio huérfano

| entrada | fila del censo | comando |
| ------- | -------------- | ------- |
| `package.json` · 4 comandos `ArrakisTheater.*` | §2 **fila 18** (poda), citada por **D17** («V13 poda 16 de esos comandos … 4 `ArrakisTheater.*` de la fila 18») y por §8 — ver discrepancia **DISC-2** | edición |
| `src/core/configurationCommandsService.ts` (263 líneas) | §8 («el fichero entero existe sólo para esos 4 comandos —`:25,80,136,167` los documentan uno a uno— así que la poda lo deja huérfano») | `git rm src/core/configurationCommandsService.ts` |
| **arrastre** `src/core/extensionBootstrap.ts` `:21,:1770` | §8 («y sus dos llamadores») | ediciones |
| **arrastre** `src/core/mcpConfigurationManager.ts:22,28` | §8 («los cita como cadenas dentro de un `console.log`») | edición: el `console.log` del constructor anunciaba dos comandos ya inexistentes — instrucción falsa tras la poda |

**No tocado:** las 3 propiedades de configuración `arrakisTheater.*`. Son
marca/prefijos: **V14/V15**, no este WP.

---

## 4 · Ficheros modificados (4) — deben coincidir con el alcance

```
M  README.md                           (enlace muerto al README legado)
M  package.json                        (6 chatParticipants · 16 comandos · 1 vista · 1 script)
M  src/core/extensionBootstrap.ts      (20 puntos de arrastre del §8 + 5 no listados)
M  src/core/mcpConfigurationManager.ts (console.log que anunciaba comandos podados)
```

`git status --porcelain` al cierre de la obra: **vacío** (árbol limpio;
`dist/`, `out/`, `coverage/`, `node_modules/` y `EVIDENCIA.md` están
gitignorados).

---

## 5 · Evidencia (huella transcrita de `EVIDENCIA.md`)

Huella común a todas las filas:
**HEAD `9172d078ac4a4e3e0a3241cdebc309a25d7aba4b` · árbol `limpio` ·
lockfile `sha256:363c08ffd4f544da`**.

| sello (UTC) | etiqueta | resultado | nota |
| ----------- | -------- | --------- | ---- |
| 2026-07-25T16:29:36Z | `compile` | **PASS** | esbuild bundle 692.3kb (`npm run compile`, sourcemap) |
| 2026-07-25T16:29:37Z | `compile-tests` | **FAIL** | `tsc -p tsconfig.json`: 8 errores, **todos preexistentes** (idénticos en `archive/pre-poda-ola-f`, que tenía 10). La poda no añade ninguno |
| 2026-07-25T16:29:37Z | `test` | **FAIL** | `jest --coverage=false`: 5 fallos en `tests/integration/managerFactory.test.ts`, **idénticos pre-poda**. 90/95 PASS |
| 2026-07-25T16:29:38Z | `probe-v07` | **PASS** | `npm run probe:v07` exit 0 |
| 2026-07-25T16:29:38Z | `probe-v08` | **PASS** | `npm run probe:v08` exit 0 (compila la pieza real de `src/mutation`) |
| 2026-07-25T16:29:38Z | `probe-v09` | **PASS** | `npm run probe:v09` exit 0 |
| 2026-07-25T16:29:39Z | `package` | **PASS** | `npm run package:v1` → `dist/scriptorium-zigurat-0.1.0.vsix`, 32 ficheros, 591,81 KB (pre-poda: 32 / 1,27 MB) |

Todo se ejecutó por ranura (`bash scripts/slot.sh run <etiqueta> -- …`).
`evidencia.sh vigente compile` salió **1** («aún no hay EVIDENCIA.md» —
worktree recién creado), así que no había registro previo que citar y
hubo que ejecutar. `jest` se corrió **siempre con `--coverage=false`**.
`npx` no se usa en ningún sitio: el empaquetado va por `scripts/vsix.mjs`.

### 5.1 · Por qué los dos FAIL no son de la poda — método adversarial

No basta con afirmarlo. Se extrajo el **árbol pre-poda completo** desde el
tag de archivo a un directorio temporal fuera del worktree
(`git archive archive/pre-poda-ola-f | tar -x -C …`), se le enlazó
`node_modules` y se corrieron **los mismos dos comandos**:

| comando | pre-poda (`archive/pre-poda-ola-f`) | post-poda (`9172d07`) |
| ------- | ----------------------------------- | --------------------- |
| `tsc -p tsconfig.json` | **10 errores**: 8 en `src/` + 2 en `tests/DonAlvaroValidation.test.ts` | **8 errores**, exactamente los mismos 8 |
| `jest --coverage=false` | 3 suites FAIL · 5 tests FAIL · 94 PASS / 99 | 1 suite FAIL · **los mismos 5** tests FAIL · 90 PASS / 95 |

Los 8 errores de `tsc` viven en ficheros que este WP **no toca** y que no
tienen relación con lo podado:

```
src/elenco/RepartoElencoService.ts   (2 × TS1479 · ESM/CJS de @zeus/reparto-kit)
src/identity/protocolApi.ts          (2 × TS1479 · ESM/CJS de @zeus/protocol)
src/launcher/LauncherCatalogClient.ts(2 × TS2353 · shape de capabilities del MCP SDK)
src/mutation/LineaEditorClient.ts    (1 × TS2353)
src/resources/McpResourceClient.ts   (1 × TS2353)
```

Los 5 fallos de `jest` son todos `vscode.window.onDidCloseTerminal is not
a function` en `tests/integration/managerFactory.test.ts` — un hueco del
mock `tests/mocks/vscode.mock.js` que alcanza a `src/terminalManager.ts:24`,
fichero intacto.

Y las 2 suites que la poda hizo desaparecer **ya estaban en rojo antes**
(`DonAlvaroValidation.test.ts`, `extensionChatIntegration.test.ts`). La
única suite verde retirada es `tests/unit/mcpChatParticipant.test.ts`, que
se va con su código por DV-11.

**Lectura honesta:** el `compile` que construye el `.vsix` (esbuild) está
**verde**; `compile:tests` (tsc) está en rojo **antes y después**, y la
poda lo mejora de 10 a 8. Estos 8 no son de este WP y no se han tocado.

### 5.2 · Smoke de activación

⏳ **no ejecutado.** El `.vsix` se construye sin error y su contenido es el
esperado (`dist/` 1 fichero, `media/` 23, `schemas/` 3, `package.json`,
`README.md`, `LICENSE.md`), pero **instalarlo y activarlo en un VS Code
real no se ha hecho**: exige un VS Code interactivo, que no es barato en
este entorno, y el brief autoriza declararlo ⏳ con motivo. Lo que sí está
comprobado es que el manifiesto parsea, que las 99 entradas de
`contributes.commands` sobreviven, que ninguna vista declarada quedó sin
proveedor y que el bundle contiene el punto de entrada.

---

## 6 · Discrepancias (anotadas, NO re-decididas)

### DISC-1 · §8 subestima los puntos de arrastre de `chatParticipant`/`theatricalChat` 🔴

§8 declara **6** puntos de edición en `extensionBootstrap.ts` para las dos
podas de DV-11 (`:11,:57,:115` y `:12,:58,:118`) y lo presenta como
recuento verificado con `grep -rn` («no muestreo: todas las referencias
del repo»). El disco da **11**:

| símbolo | §8 dice | disco |
| ------- | ------- | ----- |
| `McpChatParticipant` / `chatParticipant` | `:11`, `:57`, `:115` | + `:199` (literal del objeto `ExtensionContext`), `:2170` (`dispose`) |
| `TheatricalChatManager` / `theatricalChat` | `:12`, `:58`, `:118` | + `:200` (literal), `:231` (`theatricalChat.initialize()`), `:2173` (`dispose`) |

No cambia ningún veredicto y no ha bloqueado nada —los 5 puntos extra son
del mismo fichero y del mismo lote— pero **un V13 que hubiera confiado en
el «20 puntos de edición vivos» del brief habría dejado el árbol sin
compilar**. Se anota porque el censo presume exhaustividad en ese recuento
y no la tiene. El total real de puntos de arrastre vivos es **25**, no 20.

### DISC-2 · Los 4 comandos `ArrakisTheater.*` no tienen fila propia en el censo 🔄

El brief manda ejecutar «solo filas con veredicto **poda**», y el reparto
de §9 son **23 filas de fichero** (18 de Tabla A + 5 de Tabla B). Los 4
comandos `ArrakisTheater.*` **no son ninguna de esas 23**: viven dentro de
`package.json`, cuya fila es **re-contenido**. El amparo para podarlos es
indirecto pero explícito y triple:

- la fila `package.json` asigna a este WP «V13 (**comandos podados**)»;
- **D17**: «V13 poda 16 de esos comandos por otras filas (12
  `copilotLogs.*` de la fila 17 y **4 `ArrakisTheater.*` de la fila 18**)
  antes de que V15 renombre nada»;
- **§8** les dedica una fila entera del mapa de arrastre.

Se han ejecutado sobre esa base, y con ellos `configurationCommandsService.ts`
(263 líneas, huérfano por construcción). **Si el contrarrevisor entiende
que «fila 18 de §2 del replan» no es «fila del censo», este lote —y sólo
este— es el que hay que revertir**; el resto de la poda es independiente
de él (commit aislado `9172d07`).

### DISC-3 · La fila `.npmrc` («queda», «necesario y comprobado») pierde uno de sus tres apoyos 🔄

La fila justifica `.npmrc` porque «`dependencies` incluye
`@alephscript/mcp-core-sdk`, `@zeus/protocol` y `@zeus/reparto-kit`». Tras
la poda, **`@alephscript/mcp-core-sdk` tiene cero importadores en `src/`**
(su único consumidor era `src/copilotLogs`), y lo mismo `zod`. El
veredicto de `.npmrc` no cambia —los dos scopes `@zeus/*` siguen vivos—
pero el motivo escrito ya no es exacto. **No se ha tocado ninguna
dependencia**: retirar una declaración de `dependencies` no tiene fila de
censo y es decisión de otro (ver residual R-6).

### DISC-4 · `media/mcp.svg` pierde su único consumidor por efecto de DV-11

El censo corrige explícitamente al borrador para decir que `media/` tiene
**18** assets vivos: 17 CSS/JS **+ `mcp.svg`**, cuyo único consumidor es
`mcpChatParticipant.ts:83`. Podado ese fichero por DV-11, `mcp.svg` queda
**sin ningún consumidor en el árbol** (comprobado con `grep` sobre todos
los ficheros trackeados: los únicos aciertos son los propios documentos
del censo). `media/` es «no podar · sólo los 4 iconos, en V14», así que
**no se ha tocado**: el asset viaja en el `.vsix` sin que nadie lo cargue.
Material para V14.

---

## 7 · Residuales — listados, no escondidos

| id | residual | dueño según el censo |
| -- | -------- | -------------------- |
| **R-1** | La convención `theatrical-content/` sobrevive al borrado en 7 puntos de código (`extensionBootstrap.ts:1429,1432,1459,1483-1484,1514,1554,1595,1599`, `AgentConfigEditorProvider.ts:371`, `AgentContentEditorProvider.ts:249`, `HackerConfigPanelProvider.ts:291-293`) y en los 2 `customEditors` del manifiesto. **No rompe nada**: todos resuelven contra el workspace del usuario y filtran con `fs.existsSync` (D15) | §8 lo declara así de antemano; V15 «lo barre como convención muerta» |
| **R-2** | Los comandos `alephscript.teatro.*` y `TeatroTreeDataProvider` siguen ofreciendo abrir chat con `@isaac`, `@don-alvaro`… que ya no existen. Compila y no lanza, pero es UX colgante | `src/views` y `commandPaletteManager` son **re-contenido** (V14/V15) + re-lore a wishlist (DV-11) |
| **R-3** | `.vscodeignore` conserva 15 patrones que apuntan a rutas ya inexistentes (`PLANIFICACION/**`, `prompts/**`, `vibecoding/**`, `demo/**`, `FEATURE_CONFIGS/**`, `pics/**`, `.config/**`, `theatrical-content/**`, `build-and-install.sh`, `nvm-exec.sh`, `setup-vscode-path.sh`, `test-extension.js`, `sample-config.json`, `ArrakisTheater_OperaConfig.json`, `.esbuild.config.js`). Son no-ops inofensivos | `.vscodeignore` es **queda**; sus duplicados ya están en **V-L4-05** |
| **R-4** | `src/core/mcpConfigurationManager.ts:58-65` sigue buscando `ArrakisTheater_OperaConfig.json` **y diciendo en el log que encontró `sample-config.json`** (D16). Tras podar los dos ficheros, la búsqueda simplemente nunca acierta: **degrada, no rompe** | **D16** lo asigna a la familia de **WP-V16** (falsedades silenciosas) |
| **R-5** | `jest.config.js` conserva `collectCoverage: true` y `coverageThreshold` 75/80/85/85 (**D9**). `npm test` **sin** `--coverage=false` saldrá rojo por umbral. **No se ha bajado el umbral**: `tests/` es fila **re-contenido** y el brief la excluye del alcance de V13 | fila `tests/` (re-contenido) + **WP-V17** escribe el reemplazo |
| **R-6** | `@alephscript/mcp-core-sdk` y `zod` quedan en `dependencies` con cero importadores en `src/`. **`package-lock.json` NO se ha regenerado** porque la poda **no ha quitado ninguna declaración de dependencia** (la fila de `package-lock.json` condiciona la regeneración a que las quite) | sin fila de censo; queda para quien decida limpiar `dependencies` |
| **R-7** | Hallazgo nuevo al medir el paquete: si se corre `npm run compile` (con `--sourcemap`) y después `npm run package:v1`, el `.vsix` **se lleva `dist/extension.js.map` (2,3 MB)**. El patrón `*.map` de `.vscodeignore` no alcanza a `dist/`. Con `dist/` limpio el paquete son 591,81 KB; con el `.map` dentro, 1,02 MB | no tiene fila; es material de **V16 / V-L4-05** (`.vscodeignore`) |
| **R-8** | `LICENSE.md` (licencia-broma AIPL con `Copyright © [Año] [Nombre del Autor]`, **D7/D19**) sigue viajando en el `.vsix`. Fila **re-contenido** y **escalada al custodio** en §7 del censo | custodio / V14 |

---

## 8 · Lo que NO pude hacer, y por qué

1. **Smoke de activación del `.vsix`** — ⏳. Exige un VS Code interactivo;
   el brief autoriza el ⏳ declarado. Lo que sí se demuestra: el paquete se
   construye, el manifiesto parsea y ninguna vista quedó sin proveedor.
2. **Dejar `compile:tests` y `jest` en verde** — no es alcanzable en este
   WP: los 8 errores de `tsc` y los 5 fallos de `jest` son **preexistentes
   y ajenos a la poda** (§5.1), y arreglarlos toca ficheros fuera de mi
   alcance (`src/elenco`, `src/identity`, `src/launcher`, `src/mutation`,
   `src/resources`, `tests/mocks/`). No los he tocado.
3. **Bajar el `coverageThreshold`** (D9 lo ofrecía como opción a V13) — no
   se ha hecho: `tests/` es fila re-contenido y el brief dice
   explícitamente que las re-contenido no son de este WP. Queda como R-5.
4. **Regenerar `package-lock.json`** — no procedía: no se retiró ninguna
   dependencia (R-6).

## 9 · Dudas para el revisor

- **DISC-2** es la única duda de alcance real: ¿cuenta «§2 fila 18» como
  fila de censo a efectos de la regla «borrado sin fila de censo = FAIL»?
  El lote está aislado en `9172d07` precisamente para que se pueda
  revertir solo si la respuesta es no.
- **DISC-1** sugiere que el recuento de arrastre de §8 no es exhaustivo
  pese a declararse así. Si el contrarrevisor re-verifica el censo, ése es
  el punto donde encontrará divergencia con el disco.
- Recordatorio de la **trampa D21** para quien re-compruebe procedencia
  bajo Git-Bash: `MSYS_NO_PATHCONV=1` o `<tag>:./<ruta>`.

---

## 10 · Fronteras respetadas

- **No** se ha fusionado a `main`, **no** hay rebase sobre main, **no** hay
  push, **no** hay force-push y **no** se ha reescrito historia. El tag
  `archive/pre-poda-ola-f` es aditivo y apunta a la base intacta.
- `C:/S_LAB/z-sdk` y `C:/S/scriptorium/**`: sólo lectura (los probes V07 y
  V09 los leen y lo declaran en su salida).
- **No** se ha tocado `plan/BACKLOG.md`, **no** se ha cerrado ninguna DV,
  **no** se ha tocado marca (V14) ni espacios de nombres (V15).
- Todo el trabajo ocurre dentro de `C:/S_LAB/.worktrees/v/v-sdk-wp-v13`.
  La única escritura fuera fue un árbol temporal de verificación en
  `%TEMP%\v13-precheck`, **eliminado al terminar**.
- `npx` no se ha introducido en ningún sitio.

---

**VEREDICTO_REVISOR: ⏳ pendiente** — riesgo de revisión independiente
(amputación del árbol). El worker no se aprueba a sí mismo.
