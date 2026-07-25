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
| VEREDICTO_REVISOR | **PASS** — contrarrevisor-V, §11 (3 observaciones no bloqueantes + 1 hallazgo contra el censo ya fusionado) |

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

**VEREDICTO_REVISOR: PASS** — contrarrevisor-V, §11. Riesgo de revisión
independiente (amputación del árbol) atendido: el worker no se aprobó a sí
mismo y la revisión la firma otro agente.

---

## 11 · Contrarrevisión

**Agente:** contrarrevisor-V · **Objeto:** `wp/v13-poda`, tip `af85669`
(obra `9172d07` + reporte) contra `archive/pre-poda-ola-f` = `4766523` ·
**Método:** derivación independiente y re-ejecución, no relectura.

### Veredicto: PASS

Con **3 observaciones no bloqueantes** y **1 hallazgo contra el censo ya
fusionado** que el orquestador debe asentar (y del que soy responsable
yo, no el worker — ver §11.4).

La amputación es correcta en todos los ejes que he sabido atacar,
incluidos **cinco que el reporte no reclama** y que habrían delatado una
poda chapucera: imports relativos colgantes, referencias colgantes de
menús/atajos a comandos borrados, propiedades de configuración huérfanas,
integridad del barril de `interfaces/` y tipado de los ficheros
modificados. Ninguno falla.

### 11.1 · Las 23 filas — derivadas por mí, no leídas del reporte

Extraje las filas `poda` del censo con
`sed -n '106,146p' plan/CENSO-V12.md | awk -F'|' '$3 ~ /poda/ {...}'` y
lo mismo sobre `165,192p` para la Tabla B: **18 + 5 = 23**, y la lista
coincide entrada por entrada con la del reporte. Después:

- **Cero filas vivas.** `git ls-files <entrada>` sobre las 23 →
  `tracked=0` en las 23.
- **Cero podas sin fila.** Calculé los 252 borrados
  (`git diff --name-status archive/pre-poda-ola-f 9172d07`) y crucé cada
  ruta contra las 23 como prefijo: quedan **35 borrados de arrastre**, y
  los revisé uno a uno contra el texto del censo. Los 35 están amparados
  por texto **explícito**, no por analogía:
  - `.vscode/settings.json` y `.vscode/mcp.json` → la fila `.vscode`
    (re-contenido) los nombra literalmente como «lo legado que se va»;
    `launch.json` y `tasks.json` sobreviven, que es lo que «re-contenido»
    exige.
  - 29 de `src/theatrical/**` → fila `src/theatrical` («el contenido se
    va»), D4 (los 14 `.ts` muertos), D18 (el `.ts.backup`, los 10 de
    contenido de agentes **y los 3 `core/schemas/*.json`** que la
    corrección de V12 añadió a la enumeración).
  - 3 de `tests/` → la fila `tests/` nombra `DonAlvaroValidation`,
    `integration/` y `unit/mcpChatParticipant` entre el contenido legado.
    **Y sólo esos 3**: `basic`, `performance/` y `unit/core/` —también
    nombrados— siguen en pie porque no los fuerza ninguna poda. Es el
    recorte conservador correcto para una fila que es re-contenido.
  - `src/core/configurationCommandsService.ts` → DISC-2, juzgada abajo.
- Recuentos: **552 → 300** trackeados en `9172d07` (301 en `af85669` por
  el propio reporte); `git ls-files -i -c --exclude-standard` **72 → 0**;
  `git diff --shortstat` = `256 files changed … 109772 deletions`, con
  **252 `D` + 4 `M`**. Los cuatro modificados son los declarados.

Manifiesto tras la poda (`node -e` sobre `package.json`): **99** comandos
(`alephscript` 86 · `zigurat` 7 · `mcpSocketManager` 6 — los 12
`copilotLogs.*` y los 4 `ArrakisTheater.*` fuera), clave
`chatParticipants` **ausente**, **11** vistas en `arrakisTheater`,
`customEditors` 2 y `jsonValidation` 3 intactos, script `unix:code`
retirado.

### 11.2 · Fronteras críticas — las tres aguantan

| frontera | comprobación | resultado |
| -------- | ------------ | --------- |
| `ICompany.ts` | `git diff archive/pre-poda-ola-f HEAD -- src/theatrical/core/interfaces/ICompany.ts` | **diff vacío**; las +7 líneas de V09 («Modelo B», «NO es `reparto/1`», «Prohibido fusionar con elenco de dominio», puntero a `DOS-MODELOS.md`) siguen en `:6-9,18` |
| `mcpServerManager.ts:4` | lectura + `ls src/theatrical/core/interfaces/` | `import { MCPConfiguration } from './theatrical/core/interfaces'` **resoluble**: el barril `index.ts` existe, re-exporta `MCPConfiguration` en `:17`, y el tipo vive en `ITheatricalAgent.ts:96`. El barril **sólo** exporta de los 3 ficheros supervivientes: no quedó colgando |
| andamio de jest | `git ls-files tests` + `jest.config.js:33,36-37` | `tests/setup.ts` y `tests/mocks/vscode.mock.js` **vivos**; y también `tests/unit/parseEditorInfo.test.ts`, la prueba nueva de WP-V17 |

**Comprobación estructural propia** (script node fuera del repo): resolví
**todos** los imports relativos de **todos** los `.ts` de `src/` contra el
disco → **cero imports colgantes**. Es la prueba de que la amputación no
dejó un solo cabo suelto, y no depende de creerle nada al worker.

**Comprobaciones que el reporte no reclama y también pasan:**
`0` entradas de `menus`/`keybindings` apuntando a comandos no declarados;
`0` propiedades `copilotLogs.*` huérfanas en `configuration`; las 3
`arrakisTheater.*` conservadas a propósito (marca → V14/V15);
`copilotMetrics.panel` retirada del manifiesto **y** su proveedor del
código, sin residuo (`git grep copilotMetrics` = vacío).

### 11.3 · La preexistencia de los FAIL — verificada por vía propia y más barata

El worker la probó extrayendo el tag a un temporal. El método es válido,
pero el temporal ya no existe, así que **no lo di por bueno: lo probé de
otra forma**, que además es más fuerte.

1. **Los ficheros que cargan los fallos son byte-idénticos al tag.**
   `git diff --quiet archive/pre-poda-ola-f HEAD -- <fichero>` sobre los
   11 implicados —`RepartoElencoService.ts`, `protocolApi.ts`,
   `LauncherCatalogClient.ts`, `LineaEditorClient.ts`,
   `McpResourceClient.ts`, `tests/mocks/vscode.mock.js`,
   `src/terminalManager.ts`, `managerFactory.test.ts`, `tests/setup.ts`,
   `jest.config.js`, `tsconfig.json`— sale **INTACTO en los 11**. Si el
   fichero que falla no ha cambiado y su configuración tampoco, el fallo
   no puede ser de la poda.
2. **Re-ejecución dirigida del caso barato**, por ranura
   (`bash scripts/slot.sh run contrarrev-tsc -- npx tsc -p tsconfig.json --noEmit`;
   `evidencia.sh vigente compile-tests` daba 1 porque `af85669` movió el
   HEAD, así que no había registro citable). Resultado: **exactamente 8
   errores, en exactamente los 5 ficheros declarados, con los códigos
   declarados** (2 × TS1479 en `RepartoElencoService`, 2 × TS1479 en
   `protocolApi`, 2 × TS2353 en `LauncherCatalogClient`, 1 × TS2353 en
   `LineaEditorClient`, 1 × TS2353 en `McpResourceClient`).

Lo decisivo no es el 8: es que **hay cero errores en los cuatro ficheros
modificados**. `esbuild` no tipa, así que el `compile` verde no lo
demostraba; esto sí. La edición de 25 puntos sobre `extensionBootstrap.ts`
tipa limpia.

*Nota de método:* usé `--noEmit` donde el worker usó `tsc -p` a secas.
Cambia la emisión, no el conjunto de errores. No re-ejecuté `jest`: el
argumento (1) lo cubre y el reporte declara `--coverage=false`.

**Vigencia de la evidencia.** `evidencia.sh vigente` sale **1** para
todas las etiquetas porque la huella es por HEAD y `af85669` lo movió.
Verifiqué que ese commit **sólo añade el reporte**
(`git diff --stat 9172d07 af85669` → 1 fichero, 376 inserciones), así que
la huella de `9172d07` cubre el árbol de código exacto que se entrega. No
es defecto; es cómo está construida la huella.

**El `.vsix` corresponde al HEAD de obra.** `dist/scriptorium-zigurat-0.1.0.vsix`
son **606.013 bytes = 591,81 KB**, exactamente la cifra del reporte;
`unzip -l` da **32 ficheros**, con `extension/dist/extension.js` de
708.928 B (= 692,3 KB, la cifra del `compile`) y **sin ningún `.map`
dentro**. El paquete entregado está limpio.

### 11.4 · Juicio de las cuatro discrepancias

**DISC-1 · CONFIRMADA al carácter, y es hallazgo contra el censo
fusionado.** Extraje `src/core/extensionBootstrap.ts` del tag
(`git show archive/pre-poda-ola-f:…`) y grepeé los identificadores en
minúscula, no sólo los nombres de clase:

```
McpChatParticipant/chatParticipant → :11 :57 :115 :199 :2170     (5)
TheatricalChatManager/theatricalChat → :12 :58 :118 :200 :231 :2173 (6)
```

**11 puntos**, y los 5 extra son exactamente los que el worker declara.
§8 del censo dice **6** y presenta el recuento como exhaustivo
(«`grep -rn` … no muestreo: todas las referencias del repo»). No lo es.
El total real de arrastre vivo es **25**, no 20.

Y el reparto de culpa, que importa para que esto se asiente bien:
**la subestimación es sólo de las dos filas de DV-11.** Verifiqué las
otras dos y son **exactas**: `copilotLogs` → `:41,:42,:1773,:1776-1779,:1781`
(comprobado, incluida `:1781`, que es el `logger.info` que nombra «Copilot
Log Exporter») y `ArrakisTheater.*` → `:21,:1770`. La causa del fallo es
identificable: un grep por nombres de clase encuentra el import, el campo
y el `new`, pero **no** el literal de objeto (`:199`, `:200`), la llamada
por campo (`:231`) ni los `dispose()` (`:2170`, `:2173`), que usan el
identificador en minúscula. **Mi propia contrarrevisión de V12 cometió
exactamente ese error**: los seis puntos que cité salieron de
`git grep "McpChatParticipant\|TheatricalChatManager\|…"`, y por eso se me
escaparon los cinco. El censo heredó mi grep incompleto. Que conste.

**DISC-2 · Amparo suficiente. NO se revierte `9172d07`.** La duda es
legítima y estaba bien planteada —aislar el lote fue lo correcto—, pero
la respuesta es que sí:

- La fila `package.json` del censo asigna a este WP, literalmente,
  «lo reescriben **V13 (comandos podados)**». Es un mandato de fila, no
  una inferencia.
- **D17** nombra el caso: «V13 poda 16 de esos comandos por otras filas
  (12 `copilotLogs.*` de la fila 17 y **4 `ArrakisTheater.*` de la fila
  18**)». El censo es «la fuente única de qué se poda» según el brief, y
  D17 es censo.
- Es **la misma lógica que ya gobierna los 12 `copilotLogs.*`**, que
  nadie discute. Rechazar una y aceptar la otra sería incoherente.
- `configurationCommandsService.ts` queda huérfano **por construcción**:
  §8 documenta que el fichero entero (263 líneas) existe sólo para esos 4
  comandos (`:25,80,136,167` los documentan uno a uno). Dejarlo habría
  sido dejar código muerto en el WP cuyo objeto es retirar código muerto.

Lo que sí pido que el orquestador **asiente**, porque afecta a la
contabilidad que heredan V14/V15: `src/core` tiene veredicto **queda** y
ha perdido un fichero (10 → 9). El acta honesta de este WP no es «23
filas» a secas, sino **23 filas de fichero + 1 poda de nivel comando
amparada en D17/§8, con su fichero huérfano**. Que quede escrito para que
nadie recuente 23 y crea que `src/core` está intacto.

**DISC-3 · Bien anotada y bien NO actuada.** `git grep` en `src/` de
`mcp-core-sdk` y `'zod'` → **cero importadores** (los únicos aciertos en
el repo son `package.json`, `package-lock.json`, `.vscodeignore`,
`tsconfig.build.json` y documentos de `plan/`). El motivo escrito de la
fila `.npmrc` ya no es exacto, el veredicto «queda» sí lo sigue siendo
(los dos scopes `@zeus/*` viven), y **no tocar `dependencies`** es la
decisión correcta: no hay fila que lo ampare y el brief no lo pide. R-6
lo recoge.

**DISC-4 · Bien anotada y bien NO actuada.** `git grep "mcp\.svg"` sobre
todo el árbol: los únicos aciertos son documentos de `plan/`. El asset
quedó sin consumidor y **viaja igual en el `.vsix`** — lo veo en el
paquete (`extension/media/mcp.svg`, 2.015 B). `media/` es «no podar ·
sólo los 4 iconos, en V14» y está **intacto** (`git diff` vs tag vacío,
23 ficheros). Correcto: anotar y no tocar.

### 11.5 · R-7 — el mecanismo es real, y el paquete entregado está limpio

Verificado por lectura, sin empaquetar:

- `package:v1` = `npm run compile:production && node scripts/vsix.mjs package`;
  `compile:production` = `esbuild … --minify` (**sin** sourcemap) y
  `compile` = `esbuild … --sourcemap` (**sí** produce
  `dist/extension.js.map`).
- `compile:production` **sobrescribe** `extension.js` pero no borra un
  `.map` preexistente, y `vsix.mjs` sólo limpia `*.vsix` previos
  (`limpiarVsixPrevios`, `:97-102`) — no el resto de `dist/`.
- `.vscodeignore:14` es `*.map`, y **`*` no cruza `/`**, así que no
  alcanza `dist/extension.js.map`. `dist/` no está excluido (es donde
  vive el `main`).

Luego sí: un `npm run compile` seguido de `npm run package:v1` mete el
`.map`. **Hallazgo real y bien clasificado** (`.vscodeignore` es fila
«queda»; el arreglo sería `**/*.map`, y es de V16/V-L4-05, no de este WP).
El `.vsix` que se entrega **no** lo lleva: lo confirmé con `unzip -l`.
No he verificado los 2,3 MB del `.map` ni el 1,02 MB del paquete sucio —
exigiría compilar, y no hay causa.

### 11.6 · Observaciones no bloqueantes

**1 · Los números de línea de R-1 son de un commit intermedio.**
`plan/REPORTES/WP-V13-poda.md:318` cita
`extensionBootstrap.ts:1429,1432,1459,1483-1484,1514,1554,1595,1599`. En
el árbol entregado las referencias están en
**`1425,1428,1455,1479,1480,1510,1550,1591,1595`**. Rastreé el desfase
commit a commit:

```
f6ae634 → 1429 1432 1459 1483 1484 1514 1554 1595 1599   ← lo que dice R-1
eea6825 → 1426 1429 1456 1480 1481 1511 1551 1592 1596
9172d07 → 1425 1428 1455 1479 1480 1510 1550 1591 1595   ← el árbol entregado
```

R-1 se escribió tras el lote 4 y no se refrescó tras los lotes 5 y 6.
Está **4 líneas desviado** en lo que se entrega. No rompe nada —el
residual mismo dice que no rompe nada— pero R-1 es el encargo que recibe
**V15** para «barrer la convención muerta», y es la clase de literal
escrito a mano que ya miente el día de la entrega. Recalcular con
`git grep -n "theatrical-content\|theatricalContent" -- src` cuesta un
comando. (Dato de paso: son **9** puntos en ese fichero, no 7, porque 4
usan la variable `theatricalContentPath`.)

**2 · «Ninguna vista declarada quedó sin proveedor» (§5.2) es literalmente
falsa.** Recorrí las 12 vistas declaradas buscando su id en `src/`: las 11
del contenedor `arrakisTheater` tienen registro; la 13ª —`arrakisTheater`
en el contenedor `explorer`, la «🎭 Theater Engine» de **D14**— tiene
**cero**. Comprobé el tag: **tampoco lo tenía antes**. Es preexistente y
la poda no la causó, así que el fondo de la frase (la poda no huerfanizó
ninguna vista) es cierto y está bien probado —`copilotMetrics.panel` se
fue con su proveedor—. Lo que sobra es el alcance del enunciado, y ese
enunciado está sosteniendo el ⏳ del smoke de activación. Redáctese como
«la poda no dejó sin proveedor ninguna vista que lo tuviera», y anótese la
13ª como material de V14 (ya es D14).

**3 · Material menor para el acta.** El script `test:coverage`
(`jest --coverage`) sigue en `package.json` y saldrá rojo por el umbral de
R-5, igual que `npm test` sin `--coverage=false`. Está implícito en R-5;
nombrarlo ahorra un susto.

### 11.7 · Hallazgo contra el censo ya fusionado — y contra mi propia revisión

**`media/ICON_CREATION_GUIDE.md` SÍ viaja en el `.vsix`.** Está dentro del
paquete entregado:

```
$ unzip -l dist/scriptorium-zigurat-0.1.0.vsix | grep -i '\.md'
   3208  extension/readme.md
   3610  extension/LICENSE.md
   1059  extension/media/ICON_CREATION_GUIDE.md
```

El censo fusionado dice lo contrario. Su fila `media`
(`plan/CENSO-V12.md:129`) afirma hoy: «**22 de 23**: … pero `*.md`
(`.vscodeignore:28`) sí atrapa `ICON_CREATION_GUIDE.md`». **Es falso**, y
por la **misma razón que hace verdadero a R-7**: en `.vscodeignore` el
comodín `*` no cruza `/`, así que `*.md` sólo alcanza los `.md` de primer
nivel — por eso las re-inclusiones `:29-30` son también de primer nivel.
Viajan **23 de 23**.

Esa frase la puso el worker de V12 obedeciendo el **punto 3 de mi
contrarrevisión de V12**, que estaba equivocado: razoné la semántica del
glob en vez de mirar un paquete, precisamente el error que mi rol existe
para cazar («un verde que se refiere a otra cosa»). El worker de V13 tenía
la prueba delante —construyó el `.vsix` y encontró R-7, que es el mismo
mecanismo— y no cerró el círculo; se lo apunto como cross-check no hecho,
no como defecto de su WP, porque `media/` no está en su alcance y no la
tocó.

**Para el orquestador:** hay que corregir `plan/CENSO-V12.md:129` en
`main` (volver a «23 de 23, ningún patrón cubre el directorio») y avisar a
**V14**, que planifica sobre esa celda. Yo no lo toco: es fichero fuera
del alcance de este WP y de mi rol.

### 11.8 · Qué NO pude comprobar, y por qué

- **El smoke de activación sigue sin hacerse.** Comparto el ⏳ del worker:
  exige un VS Code interactivo. Lo que sí queda probado por mi parte es
  más de lo que el reporte reclamaba: el manifiesto no tiene referencias
  colgantes, `src/` no tiene imports colgantes y los 4 ficheros
  modificados tipan. Sigue sin probarse que la extensión **arranque**.
- **`jest` no lo re-ejecuté.** La preexistencia queda probada por la
  identidad byte a byte de `managerFactory.test.ts`, `vscode.mock.js`,
  `terminalManager.ts`, `setup.ts` y `jest.config.js` con el tag. Ejecutar
  no habría añadido nada que ese argumento no dé, y cuesta ranura.
- **Las cifras de R-7 (2,3 MB de `.map`, 1,02 MB de paquete sucio)** no
  las verifiqué: exigen compilar con sourcemap y empaquetar. El
  **mecanismo** sí está verificado; las cifras las firma el worker.
- **No re-auditté el censo entero**, sólo los puntos que gobiernan esta
  poda (las 23 filas, §8 completa, D4/D17/D18, las filas de arrastre) más
  el hallazgo de §11.7.
- **No he escrito `EVIDENCIA.md`** pese a haber ejecutado por ranura: mi
  rol acota mi escritura a esta sección. La ejecución queda documentada
  aquí, con su comando.

### 11.9 · Fronteras de mi propio rol

No he arreglado nada, no he fusionado, no he revertido `9172d07`, no he
cerrado ninguna DV y no he tocado `z-sdk`, `scriptorium/**` ni el espejo
OASIS. Mi única escritura es esta sección y la línea `VEREDICTO_REVISOR`.
No hay push.

Y el reparto, para que quede justo: este WP **encontró un fallo del censo
que ni el censo ni yo habíamos visto** (DISC-1), lo declaró en vez de
taparlo, aisló en un commit revertible el único lote de alcance dudoso
(DISC-2) y anotó sin actuar las dos filas que la poda dejó desfasadas
(DISC-3, DISC-4). Eso es exactamente cómo se entrega una amputación.
