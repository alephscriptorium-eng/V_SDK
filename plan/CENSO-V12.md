> # ⛔ ACTA CERRADA — ESTE DOCUMENTO YA NO ES EL CENSO VIGENTE
>
> **Cerrado por WP-V98 el 2026-08-02.** Todo lo que sigue a partir de §1 se lee
> **EN PASADO**: describe el árbol `1c90c43`, **anterior a la poda de WP-V13**.
> El árbol de hoy es otro — 25 entradas de primer nivel donde este censo contó 41,
> y 25 módulos en `src/` donde contó 28.
>
> **No planifiques sobre este documento.** Su función —sostener la decisión **D-1**
> del custodio antes de podar— **está consumida**: V13 ejecutó las 23 podas, V14 la
> marca y V15 los espacios de nombres, y las decisiones DV-11..DV-16.a se cerraron
> en bloque el 2026-07-25 (`plan/DECISIONES.md`).
>
> **La reconciliación con el árbol de hoy, fila a fila y re-medida, está en §0.**
> Lo único que este censo levantó y **sigue vivo sin resolver** es **D16**, en §0.6.

# CENSO-V12 · lo absorbido en WP-V02, con veredicto por entrada

| dato | valor |
| ---- | ----- |
| **Estado** | **ACTA CERRADA** desde 2026-08-02 (WP-V98). No es el censo vigente; no hay censo vigente. Ver §0 |
| **Fecha de medición del cuerpo** | 2026-07 · árbol `1c90c43`, **pre-poda** |
| **Fecha de la reconciliación** | **2026-08-02** · §0, re-medida entrada por entrada |
| WP | **WP-V12 · Censo y veredicto** (Ola F · CORTE) |
| Rama | `wp/v12-censo-veredicto` |
| Worktree | `C:/S_LAB/.worktrees/v/v-sdk-wp-v12` |
| Árbol censado | `HEAD` = `1c90c43bfeafe6cabbc71a04440b4a962544aa83` |
| Qué es | el documento que la decisión **D-1** del custodio exige antes de podar nada |
| Qué NO es | una poda. **V12 decide; V13 ejecuta. Este WP no borra ni mueve nada.** |
| Escrituras de este WP | `plan/CENSO-V12.md` y `plan/REPORTES/WP-V12-censo-veredicto.md`, y ningún otro fichero |
| Procedencia | borrador de una sesión anterior que murió antes de commitear, **verificado fila a fila contra el disco** por la sesión que lo entrega (§9, y detalle en el reporte) |

---

## 0 · Reconciliación con el árbol de hoy · WP-V98 · medido 2026-08-02

Esta sección **no** la escribió WP-V12. La añade **WP-V98** al cerrar el
documento. Todo lo que hay en ella está **medido hoy**, abriendo el árbol y
contando; **ninguna cifra se copia del cuerpo del censo**.

### 0.1 · El veredicto, y por qué

El brief de V98 daba dos salidas: **corregir** el documento como censo vigente,
o **cerrarlo** como acta. Se cierra como acta. La razón no es de estilo:

1. **Su función está consumida.** El censo existía para sostener la decisión
   **D-1** antes de podar. Las **23** filas con veredicto *poda* están
   **ejecutadas las 23** —verificadas una a una hoy, §0.3 y §0.4—, y las
   decisiones que dejaba abiertas (**DV-11**, **DV-12**, **DV-16**, **DV-16.a**)
   se cerraron en bloque el 2026-07-25 con GO del custodio
   (`plan/DECISIONES.md`).
2. **Ya nadie planifica sobre él.** Los consumidores del documento son
   `plan/BRIEFS/WP-V13-poda.md`, `plan/BRIEFS/WP-V14-marca-producto.md` y
   `plan/BRIEFS/WP-V15-espacios-nombres.md` — los tres **ejecutados y
   aceptados**. La única referencia viva en `plan/BACKLOG.md` es la fila de
   **este mismo WP**.
3. **Corregirlo no sería corregirlo, sería escribir otro.** El cuerpo censa
   **41** entradas de primer nivel y **28** módulos de `src/`. Hoy hay **25** y
   **25**. De las 41 filas, **18** hablan de entradas que ya no existen; de las
   28, **5**. Un documento en el que el 33 % de las filas describe cosas
   borradas no se «actualiza»: se cierra, y quien necesite un censo del árbol
   de hoy levanta uno nuevo.

**Consecuencia declarada, para que no quede ambigua: hoy el carril NO tiene
censo vigente.** Eso es un hecho, no un descuido de este WP; si alguien lo
necesita, es un WP nuevo. Lo que sí queda es esta acta, fechada y reconciliada.

Se mantiene la regla de `plan/PRACTICAS.md` §7 en la forma que le corresponde a
un acta: **se anota, no se borra.** Las **76** marcas `⛔` del cuerpo conservan
literalmente lo que se dijo y añaden por qué caducó y qué se mide hoy. **Cero
palabras borradas.**

### 0.2 · Re-medición de las magnitudes globales

| magnitud | censo (`1c90c43`, 2026-07) | **hoy (2026-08-02)** | cómo se midió |
| -------- | -------------------------- | -------------------- | ------------- |
| entradas de primer nivel | 41 | **25** | `git ls-tree --name-only HEAD` |
| módulos de `src/` | 28 | **25** | `git ls-tree --name-only HEAD src/` |
| ficheros `.ts` en `src/` | 102 | **95** | `git ls-files src` |
| alcanzables desde `src/extension.ts` | 83 | **88** | BFS de imports relativos, mismo método que §5 |
| **no** alcanzables | 19 | **7** | los 2 barriles propios (`launcher/index.ts`, `libs/index.ts`) y los 5 de `src/mcp/` |
| comandos en `contributes.commands` | 115 en 5 prefijos | **99 en UNO**: `aleph0.` | `node -e` sobre `contributes` |
| `contributes.chatParticipants` | 6 | **0** | ídem — DV-11 ejecutada |
| `contributes.customEditors` | 2 | **2** | ídem — hoy en `package.json:1165` y `:1175` ⛔ *(RE-MEDIDO 2026-08-02 por WP-V101, **tercera vez que esta coordenada caduca**: los `viewType` viven hoy en `package.json:1110` y `package.json:1120`, y los dos selectores nombran ya la convención — `package.json:1114` y `:1124`. Ancladas por `plan/ANCLAS.json` (A1, A2, A3): a partir de ahora la deriva sale en rojo, no en silencio)* |
| `contributes.jsonValidation` | 3 | **3** | ídem — **sin sustituir**, ver §0.6 ⛔ *(RESUELTO 2026-08-02 por WP-V101: **se quedan, y no por inercia**. Las 3 `url` viven en `package.json:969`, `:973` y `:977`. El veredicto «sustituir» presuponía legado sin lector vivo, y eso es falso — ver §0.6·2)* |
| vistas declaradas | 13 (12 + 1 en `explorer`) | **11**, todas en el contenedor `aleph0` | ídem — D14 queda sin objeto |
| `package.json` · líneas | ~1527 al nacer | **1248** | `wc -l` ⛔ *(RE-MEDIDO 2026-08-02: **1197**. Esta cifra ya se había re-medido una vez y volvió a caducar; es el mismo mecanismo que las coordenadas de la fila `customEditors`. Un recuento de líneas no se puede anclar —cambia con cada edición legítima— y por eso `plan/ANCLAS.json` ancla HECHOS y no cifras: ver §0.6·4)* |
| `package.json` · `license` | `SEE LICENSE IN LICENSE.md` | **`GPL-3.0-or-later`** (`package.json:7`) | lectura |
| `package.json` · `icon` | `./media/arrakis-theater-icon.png` | **`./media/aleph-0-icon.png`** (`package.json:34`) | lectura |
| `configuration.title` | `Arrakis Theater Configuration` | **`Aleph-0`** | lectura |
| `LICENSE.md` | AIPL «licencia-broma», con `[Año] [Nombre del Autor]` sin rellenar | **13 líneas**: puntero a GPL-3.0-or-later + Animus Iocandi | `wc -l` + lectura — **D7 y D19 cerrados** |
| `coverage/` trackeado-e-ignorado | 72 rutas | **0 rutas** | `git ls-files -i -c --exclude-standard` |
| `coverageThreshold` de jest | 75/80/85/85 | **no existe** — WP-V93 lo retiró; el trinquete es `scripts/cobertura-trinquete.mjs` contra `scripts/cobertura.suelo.json` | lectura de `jest.config.js` |
| `jest.config.js` · líneas | (setup citado en `:33`) | **106** — `setupFilesAfterEnv` en `jest.config.js:66`, `moduleNameMapper` en `:69-71` | `wc -l` + lectura |
| `.vscodeignore` · líneas | 64 | **68** | `wc -l` — **de aquí sale el desfase +4 de §0.5·C** |
| `media/` · ficheros | 23 | **19** (9 css · 8 js · `aleph-0-icon.png` · `aleph-0-activitybar.svg`) | `git ls-files media` |
| consumidores de `src/config/ziguratSettings.ts` | 7 | **13** | `grep -rn` sobre `src/` |
| `plan/` · ficheros | 26 | **59** | `git ls-files plan` |
| `.claude/` · ficheros | 138 | **138** *(sin cambio)* | `git ls-files .claude` |
| `tests/` · ficheros | contenido legado | **21**, ninguno legado | `git ls-files tests` |

### 0.3 · Tabla A · las 41 filas, una a una

**Las 18 podas: ejecutadas las 18.** Comprobado hoy con `test -e` sobre cada
ruta; ninguna existe: `.config`, `.esbuild.config.js`,
`ArrakisTheater_OperaConfig.json`, `FEATURE_CONFIGS`, `INSTALL.md`,
`PLANIFICACION`, `README-LEGACY-EXTENSION.md`, `build-and-install.sh`,
`coverage`, `demo`, `nvm-exec.sh`, `pics`, `prompts`, `sample-config.json`,
`setup-vscode-path.sh`, `test-extension.js`, `theatrical-content`, `vibecoding`.

**Las 23 restantes, re-medidas:**

| entrada | veredicto V12 | estado medido 2026-08-02 |
| ------- | ------------- | ------------------------ |
| `.claude` | queda | vive · **138** ficheros, igual que entonces |
| `.eslintrc.cjs` | queda | vive · sigue siendo el placeholder que sostiene `npm run lint` |
| `.gitattributes` | queda | vive |
| `.github` | queda | vive · 2 workflows: `.github/workflows/ci.yml` y `.github/workflows/release.yml` |
| `.gitignore` | queda | vive · `coverage/` sigue en `.gitignore:2`, pero **ya sin ficheros trackeados detrás** |
| `.npmrc` | queda | vive |
| `.vscode` | re-contenido | **EJECUTADO** · quedan `launch.json` y `tasks.json`; `settings.json` (rutas del macOS ajeno) y `mcp.json` (`localhost:3100`) retirados. **D12 cerrado** |
| `.vscodeignore` | queda | vive · **68** líneas, eran 64 |
| `LICENSE.md` | re-contenido | **EJECUTADO** · 13 líneas, GPL-3.0-or-later + Animus Iocandi. **D7 y D19 cerrados** |
| `README.md` | re-contenido | **EJECUTADO** · Aleph-0; ya no enlaza el README legado |
| `docs` | queda | vive · hoy `docs/GUIA-PRUEBA-v2.md`; V15 retiró la v1 |
| `fixtures` | queda | vive · `fixtures/reparto-v1-demo.json` |
| `jest.config.js` | queda | vive · **106** líneas y **sin `coverageThreshold`**: D9 quedó superada por WP-V93 |
| `media` | re-contenido | **EJECUTADO** · **19** ficheros, eran 23; los 4 iconos ajenos y `ICON_CREATION_GUIDE.md` los retiró V14 |
| `package-lock.json` | queda | vive |
| `package.json` | re-contenido | **EJECUTADO** · 1248 líneas · 99 comandos en el único prefijo `aleph0.` · 0 `chatParticipants` |
| `plan` | queda | vive · **59** ficheros, eran 26 |
| `schemas` | re-contenido | ⚠️ **NO EJECUTADO** · siguen los 3 schemas legados y sus 3 `jsonValidation`. Ver §0.6 ⛔ *(**FILA RETIRADA CON ACTA 2026-08-02 · WP-V101**: el veredicto «re-contenido» se emitió sobre una premisa que hoy es falsa. Los 3 nombres de fichero (`xplus1-config.json`, `socket-config.json`, `webrtc-ui-config.json`) **no son legado sin lector**: `src/treeViews/configsTreeView.ts` —vivo, cableado en `src/core/bootstrap/assembleContext.ts:22`— los vigila, los escanea y **los GENERA** desde plantilla. `contributes.jsonValidation` es la mitad de validación de esa función viva. **Se quedan.** Lo que sí estaba roto era otra cosa, y se arregló: la plantilla podía escribir `url: ""` y el schema que nosotros mismos empaquetamos lo rechaza. Ver §0.6·2)* |
| `scripts` | queda | vive · 17 ficheros; los probes V07/V08/V09 siguen, y se les han sumado los de V71 y el trinquete de cobertura |
| `src` | queda | vive · **25** módulos, eran 28 |
| `tests` | re-contenido | **EJECUTADO** · 21 ficheros, contenido legado fuera, `setup.ts` y `mocks/` conservados como pedía D10 |
| `tsconfig.build.json` | queda | vive |
| `tsconfig.json` | queda | vive |

**Entradas de hoy que este censo no pudo tener fila para** (nacieron después):
`CHANGELOG.md` y `sincronia/`. Se hacen constar para que el recuento cuadre:
23 supervivientes + 2 nuevas = **25**.

### 0.4 · Tabla B · las 28 filas, una a una

**Las 5 podas: ejecutadas las 5.** Comprobado hoy con `test -e`; las cinco rutas
se nombran para dar el acta de su poda:

- ⛔ `src/configEditor.ts` — ya no existe (V13, `c164731`)
- ⛔ `src/copilotLogs` — ya no existe (V13)
- ⛔ `src/examples` — ya no existe (V13)
- ⛔ `src/mcpChatParticipant.ts` — ya no existe (V13, `f6ae634`)
- ⛔ `src/statusManager.ts` — ya no existe (V13, `c164731`)

Las dos que el brief de V98 denunciaba en presente («423 líneas» y «453
líneas») están anotadas en el cuerpo, ⛔ en las filas `src/configEditor.ts` y
⛔ `src/statusManager.ts` de la Tabla B (§5) — las dos rutas ya no existen.
Se referencian **por contenido y no por número de línea a propósito**: añadir
esta §0 desplazó todo el cuerpo, y una coordenada escrita hoy nacería caducada
— que es el defecto que este WP vino a cerrar.

**Las 23 restantes, re-medidas:**

| módulo | veredicto V12 | estado medido 2026-08-02 |
| ------ | ------------- | ------------------------ |
| `src/commandPaletteManager.ts` | re-contenido | vive · **527** líneas, eran 511 · V15 ya unificó los prefijos |
| `src/config` | queda | vive · **13** consumidores, eran 7 · DV-16.a cerrada en (b) |
| `src/core` | queda | vive · **28** ficheros, eran 10 · `extensionBootstrap.ts` son hoy **297** líneas |
| `src/editors` | re-contenido | vive · 2 `.ts`; los `customEditors` siguen declarados — pero con `viewType` `alephscript.*`, ver §0.6 |
| `src/elenco` | queda | vive · 4 `.ts` |
| `src/extension.ts` | queda | vive · **72** líneas · ⚠️ **D3 desmentido**: ya **no** es byte-idéntica al import |
| `src/identity` | queda | vive · 7 `.ts` |
| `src/launcher` | queda | vive · 5 `.ts`; `index.ts` sigue sin alcanzarse |
| `src/libs` | re-contenido | vive · 2 `.ts`; `index.ts` sigue sin alcanzarse |
| `src/loggingManager.ts` | queda | vive · **357** líneas |
| `src/mcpServerManager.ts` | re-contenido | vive · **444** líneas, eran 411 · `src/mcpServerManager.ts:4` **sigue siendo exacta** |
| `src/mcpTypes.ts` | queda | vive · **102** líneas, igual · `src/mcpTypes.ts:15` sigue nombrando el `sample-config.json` ya podado |
| `src/mcpWebViewManager.ts` | re-contenido | vive · **432** líneas, eran 398 |
| `src/mutation` | queda | vive · 6 `.ts` |
| `src/processManager.ts` | re-contenido | vive · **353** líneas |
| `src/resources` | queda | vive · 4 `.ts` |
| `src/socketMonitor.ts` | re-contenido | vive · **717** líneas, eran 686 |
| `src/terminalManager.ts` | queda | vive · **232** líneas, igual · ⚠️ su segundo consumidor declarado, `statusManager`, **no existe desde `c164731`** |
| `src/theatrical` | re-contenido | vive **reducido a la carcasa**: 4 ficheros (`core/interfaces/`), eran 33. `ICompany.ts` —la frontera de WP-V09— **conservada**, como el censo exigía. **D5 y D11 cerrados** |
| `src/treeViews` | re-contenido | vive · 5 `.ts` |
| `src/uiManager.ts` | re-contenido | vive · **461** líneas, eran 427 |
| `src/views` | re-contenido | vive · 7 `.ts` + `README.md` |
| `src/webViewManager.ts` | re-contenido | vive · **583** líneas, eran 513 |

**Módulos de hoy sin fila en este censo** (nacieron después): `src/mcp/`
(5 `.ts`) y `src/webview/` (4 `.ts`). 23 supervivientes + 2 nuevos = **25**.

### 0.5 · Las citas del documento: tres clases y tres denominadores

El barrido de WP-V92 (`plan/REPORTES/WP-V92-citas-rancias.md` §1.4) corre tal
cual con `AMBITO=plan`. **Medido sobre este documento tal como estaba antes de
WP-V98**, extraía **189** citas `ruta[:línea]`. Pero **el barrido sólo caza una
de las tres clases de cita defectuosa que este documento tenía.** Las tres, con
su denominador —todos los denominadores son de la versión pre-V98—:

| clase | cómo se detecta | denominador | defectuosas | quedan |
| ----- | --------------- | ----------- | ----------- | ------ |
| **A · la cita no resuelve** | el barrido de V92, automático | **189** citas extraídas del documento | **21** `RANCIA` | **0** — anotadas |
| **B · resuelve y miente** | a mano; el barrido la da por buena | **33** citas que resuelven **con coordenada** (de las 189; otras 94 resuelven sin coordenada y no hay línea que contrastar) | **24** | **0** — anotadas |
| **C · retro-referencia desnuda `:NN`** | a mano; el barrido **no la ve por construcción** (no lleva ruta, así que ni siquiera entra en las 189) | **36** en la columna «¿viaja en el `.vsix`?» de la Tabla A | **34** | anotadas en bloque, aquí |

**Suma: 79 referencias defectuosas en un solo documento**, de las que el
instrumento automático veía 21. Ése es el tamaño real de lo que había, y es el
argumento de por qué la clase B no es una curiosidad teórica.

**Clase C, el desfase de +4.** Las 36 retro-referencias `(`:NN`)` de la columna
`.vsix` de la Tabla A apuntan todas a `.vscodeignore`, que pasó de **64** a
**68** líneas. Comprobadas hoy las 36 contra el fichero: **34 apuntan a otra
cosa** y sólo 2 siguen siendo correctas (`.vscode` → `.vscodeignore:10`, y
`src` → `.vscodeignore:2-3`, que están antes del punto de crecimiento). Ejemplos:
la fila de `plan` dice `:52` y hoy `:52` es `pics/**`; la de `tsconfig.json`
dice `:33` y hoy `:33` es `!README.md`. **Toda la columna se lee en pasado.**

**Clase B es la que importaba**, y es exactamente la clase que
`plan/PRACTICAS.md` §7 dice que ningún barrido caza: la coordenada resuelve, el
barrido dice verde, y el contenido es falso. **24 de 33.** Las peores tres, por
lo que costaría creerlas:

- `jest.config.js:23-28` — el censo dice que ahí está el `coverageThreshold`
  75/80/85/85. Hoy resuelve, y lo que hay es el comentario de WP-V93
  explicando **que no hay ningún umbral y que es a propósito**. La coordenada
  no sólo caducó: el hecho se invirtió.
- `package.json:7` — sigue siendo **la clave `license`**, la línea exacta. Pero
  su valor es hoy `GPL-3.0-or-later`, no `SEE LICENSE IN LICENSE.md`. Es el
  caso más difícil de detectar de todos: coordenada correcta, clave correcta,
  afirmación falsa.
- `src/core/mcpConfigurationManager.ts:58-65` — citada **4 veces** como prueba
  de la falsedad D16. Hoy resuelve y contiene código inocente. **El defecto no
  se arregló: se movió.** Ver §0.6.

### 0.6 · Lo único que sigue vivo — enrutado, no arreglado

`ALCANCE_DIFF` de WP-V98 es este fichero y su reporte: **cero código**. Estos
tres hallazgos se señalan con nombre y ruta, sin tocar.

1. **D16 sigue vivo, y la cita rancia lo estaba tapando** 🔴 — en
   `src/core/mcpConfigurationManager.ts:42-49` el comentario dice
   `sample-config.json`, el log **afirma** `Found sample-config.json at: …`, y
   lo que se abre es `ArrakisTheater_OperaConfig.json`. Es la misma falsedad
   silenciosa que el censo levantó como D16 hace un mes, intacta, sólo que 16
   líneas más arriba. **Y agrava**: el fichero que abre fue podado del repo por
   V13, así que el log miente sobre un fichero que ya no existe en el árbol.
   **Enrutado a `WP-V100`** (familia «falsedad silenciosa»). El cuerpo de este
   censo lo atribuye a `WP-V16`, que **nunca llegó a existir**: se deja el texto
   original intacto por ser acta, y la ruta viva es ésta.
2. **`schemas/` tiene veredicto re-contenido y nadie lo re-contuvo** ⚠️ — los 3
   schemas del legado (`xplus1-config`, `socket-config`, `webrtc-ui-config`)
   siguen en el árbol y siguen cableados en `contributes.jsonValidation`
   apuntando a `./schemas/*.schema.json`. Es la única fila *re-contenido* de la
   Tabla A que quedó sin ejecutar.

   ⛔ **CERRADO 2026-08-02 · WP-V101 — y la premisa era falsa.** No es legado
   sin lector: los tres nombres de fichero son una **convención viva del
   workspace que escribimos nosotros**. `src/treeViews/configsTreeView.ts`
   —cableado en `src/core/bootstrap/assembleContext.ts:22`— los vigila con
   `createFileSystemWatcher`, los escanea, y **los genera desde plantilla** en
   `createFromTemplate`. `contributes.jsonValidation` (`package.json:969`,
   `:973`, `:977`) es la mitad de validación de esa función. **Decisión: se
   quedan**, porque borrarlos dejaría sin validar unos ficheros que la propia
   extensión sigue creando. Lo que sí estaba roto —y se arregló— es que la
   plantilla podía persistir `url: ""` en un campo que esos mismos schemas
   declaran `required` con `pattern: "^wss?://"`: **escribíamos un fichero que
   nuestro propio schema marcaba en rojo al abrirlo.** Sigue abierto, y es de
   **WP-V31**: si el ajuste trae un valor sin esquema (`localhost:7777`) el
   schema lo rechaza igual.
3. **Los dos `customEditors` sobrevivieron a la unificación de nombres** ⚠️ —
   V15 llevó los 99 comandos a `aleph0.`, pero sus `viewType` siguen siendo
   `alephscript.agentContentEditor` y `alephscript.agentConfigEditor`
   (`package.json:1165` y `:1175`), y el segundo selecciona por
   `**/theatrical-content/configurations/agents/*.config.json` — una convención
   cuyo directorio V13 podó del repo.

   ⛔ **RE-MEDIDO Y CERRADO 2026-08-02 · WP-V101.** Dos correcciones, y la
   segunda cambia el veredicto:

   - **Las coordenadas caducaron por tercera vez.** Los `viewType` viven hoy en
     `package.json:1110` y `package.json:1120`. Este mismo párrafo es un acta
     escrita para arreglar la generación anterior (`:1446`/`:1456`), y caducó
     igual. Ancladas ahora en `plan/ANCLAS.json`.
   - **«una convención cuyo directorio V13 podó del repo» es engañoso.** Lo que
     V13 podó fue **la copia de ejemplo que había en el repo**. La convención
     **está viva y la escribimos nosotros**: el comando `aleph0.agents.createNew`
     (`src/core/bootstrap/commands/agentManagementCommands.ts:46`) **crea
     `theatrical-content/content/agents/` y
     `theatrical-content/configurations/agents/` en el workspace del usuario** y
     escribe los dos ficheros. Todo esto resuelve contra la carpeta abierta por
     el usuario, nunca contra el paquete. Así que el selector **no apuntaba a
     una ruta inexistente**: apuntaba exactamente a lo que producimos.

   **El defecto real era el otro selector.** El editor de contenido decía
   `*.agent.md` **a secas** —sin directorio—, mientras su propio código
   (`AgentContentEditorProvider.getConfigPath`,
   `src/editors/AgentContentEditorProvider.ts:251`) asume que el gemelo vive en
   `theatrical-content/configurations/agents/`. Con `priority: "default"` eso
   **sustituía al editor de texto del usuario en cualquier `*.agent.md` del
   workspace**, incluidos los que no tienen nada que ver con la convención, y
   les ofrecía un botón «abrir configuración» que apuntaba a un fichero que no
   podía existir. WP-V101 lo estrecha a
   `**/theatrical-content/content/agents/*.agent.md` (`package.json:1114`), con
   lo que **las dos mitades del par nombran por fin la misma convención**.

   **Lo que NO se toca, y por qué**: los `viewType` siguen bajo `alephscript.`.
   No es olvido — **R-V15-7** (`plan/REPORTES/WP-V15-espacios-nombres.md:709`)
   ya declaró los 11 ids de vista y los 3 `viewType` **no renombrables sin
   coste**, y su razón literal es que **los `<viewId>.focus` de VS Code y el
   `globalState` del tema cuelgan de ellos**. Un `viewType` es un identificador,
   no una ruta: no apunta a nada que pueda no existir, así que no puede quedar
   huérfano en el sentido de CA-1.

   *(Corrección de WP-V101 a sí mismo: la primera redacción atribuía a R-V15-7
   un argumento sobre `workbench.editorAssociations` que **R-V15-7 no hace**. El
   razonamiento de fondo se sostiene —un identificador persistido no se renombra
   sin migración— pero la atribución era falsa, y atribuir mal es la misma
   familia que citar mal.)*

   **Lo que sí se cerró, y era el artefacto literal del título del WP**: había
   **dos `viewType` huérfanos de verdad**, `«theatrical.agentContentEditor»` y
   `«theatrical.agentConfigEditor»`, en sendos `static register()` de
   `src/editors/` **que no llamaba nadie** y que no existen en
   `contributes.customEditors`. Podados. El registro real lo hace
   `src/core/bootstrap/viewRegistry.ts` con los `viewType` del manifiesto.
4. **La deriva de coordenadas tiene ya instrumento** ⛔ *(nuevo, WP-V101)* — las
   dos entradas de arriba llevan **cuatro generaciones** de la misma cita
   caducando (`:1446`/`:1456` → `:1219` en V15 → `:1165`/`:1175` en esta acta →
   `:1110`/`:1120` hoy), y **las cuatro resuelven**, así que
   `scripts/citas-rancias.mjs` las aprueba todas: su ceguera declarada es que
   comprueba que una cita apunta a algo que **existe**, no que diga la verdad, y
   pedía «un ancla de texto guardada junto a cada cita». Eso es
   `plan/ANCLAS.json` + `scripts/anclas-censo.mjs`: se declara el **hecho**
   (qué token, en qué fichero, cuántas veces) y el gate **deriva la coordenada
   de hoy**, compara con la que este censo afirma, y enrojece con la corrección
   ya escrita. **El recuento por fichero no es decorativo**: es lo que caza la
   deriva de *composición*, que es peor que la de línea — este censo declaraba
   7 puntos de `theatrical-content` con 5 en `extensionBootstrap.ts`, fichero
   que hoy tiene **cero** menciones; los **12** puntos vivos están repartidos
   en otros cinco ficheros. Un barrido que sólo re-mide coordenadas **no lo
   habría visto nunca**.

   *(La cifra decía **11** hasta el 2026-08-03, y era la de antes de que V102
   reescribiera el panel: el rebase la movió a 12 en §8 y **este sitio no se
   actualizó**, dejando el censo contradiciéndose consigo mismo por uno. Lo
   apunto en vez de sólo corregirlo porque **es de mi propia doctrina**: una
   cifra no se puede anclar —cambia con cada edición legítima— y por eso
   `scripts/anclas-censo.mjs` ancla el recuento **por fichero**, donde el gate
   sí puede verlo, y no el total, donde no puede. La misma cifra repetida en
   dos sitios es un gemelo desincronizable, exactamente lo que V100 arregló
   con una constante.)*

---

## 1 · Vocabulario de veredictos

| veredicto | significa |
| --------- | --------- |
| **queda** | la entrada se mantiene tal cual. Es nuestra, o es carcasa neutra que el producto propio necesita igual |
| **re-contenido** | la carcasa se mantiene y su contenido se sustituye por contenido nuestro. Borrarla rompería algo vivo |
| **poda** | la entrada sale del árbol. Nada vivo depende de ella, o lo que depende también se va |

Una fila que dice **«pend. DV-nn»** tiene veredicto propuesto y bloqueo
nombrado: no es un hueco. Lo que la decisión abierta cambia es el
*detalle*, no el veredicto.

## 2 · Método — y por qué la tabla §2 del replan no es la respuesta

El brief manda verificar cada fila contra el disco. El discriminador
duro que se ha usado es el **tag del import**: el árbol que WP-V02
absorbió está congelado en `import/scriptorium-793de5e92527`, así que la
procedencia de cada entrada no es opinión, es una comprobación.

| comprobación | comando | para qué |
| ------------ | ------- | -------- |
| procedencia | `git cat-file -e import/scriptorium-793de5e92527:<ruta>` | ¿legado o nuestro? |
| intacta desde el import | `git diff --quiet import/scriptorium-793de5e92527 HEAD -- <ruta>` | ¿la hemos tocado? |
| ¿entra en el bundle? | BFS de imports relativos desde `src/extension.ts` | ¿el código vive o es muerto? |
| ¿viaja en el paquete? | patrones de `.vscodeignore` | columna informativa para V13/V14 |
| trackeado **y** ignorado | `git ls-files -i -c --exclude-standard` | adjudica el hallazgo **V17-B** |

**Resultado de procedencia:** de las **41** entradas de primer nivel,
**31** vienen del import y **10** son nuestras o posteriores. De los
**28** módulos de `src/`, **22** vienen del import y **6** son nuestros.

**Precisión sobre esos 31/10.** La medida es *existencia del nombre en el
tag*, y hay exactamente un par que se cruza: el commit del import
(`ecedaa2`) renombró el `README.md` ajeno a `README-LEGACY-EXTENSION.md`
y dejó el hueco para el nuestro. Por nombre, `README.md` cuenta como
legado y `README-LEGACY-EXTENSION.md` como nuestro; **por contenido es al
revés**. Los totales se sostienen porque los dos se cancelan, y las dos
filas de la Tabla A están adjudicadas por contenido, no por nombre.

> ⚠️ **Trampa de verificación — leer antes de re-comprobar este censo.**
> Bajo Git-Bash, `git cat-file -e <tag>:<ruta>` **miente en silencio**
> cuando la ruta empieza por punto: MSYS convierte el argumento y git
> recibe `import\scriptorium-…;.gitignore`, que falla con «Not a valid
> object name». Efecto: los 10 dotfiles de primer nivel salen como «no
> está en el import», y la procedencia se subestima en 5 entradas
> (`31/10` se convierte en un falso `26/15`). Se comprueba con
> `MSYS_NO_PATHCONV=1` o con `<tag>:./<ruta>`. Quien re-verifique sin
> esto va a «desmentir» un dato correcto.

**Cobertura de §2 del replan:** de las 31 entradas legadas de primer
nivel, §2 sólo tiene fila para **15** (fila 20 cubre 13, fila 21 cubre
`tests/`, fila 16 cubre `schemas/`). Las **16** restantes son legado sin
fila y se resuelven aquí. Ver §5.

### Aviso sobre la columna «¿viaja en el `.vsix`?»

Esa columna se ha **derivado leyendo `.vscodeignore`**, no verificado
contra un paquete construido: el brief prohíbe comandos caros y `vsce
package` es uno. Es informativa para V13/V14 y no forma parte de la CA.
Donde el resultado no se puede afirmar por lectura, la celda dice ⏳ con
el motivo. Ninguna celda de esta columna afirma un dato que no venga de
un patrón concreto del fichero.

## 3 · Control de recuento

| tabla | fuente | recuento fuente | filas de la tabla |
| ----- | ------ | --------------- | ----------------- |
| A · entradas de primer nivel | `git ls-tree --name-only HEAD` | **41** | **41** |
| B · módulos de `src/` | `git ls-tree --name-only HEAD src/` | **28** | **28** |

El brief cita 40 para la Tabla A en `d0323fb`. Verificado: en `d0323fb`
son **40** y en `HEAD` son **41**. La diferencia es exactamente una
entrada, `.gitattributes`, añadida por `b208ab1` («chore(repo): forzar LF
en `*.sh`») después de `d0323fb`:

```
$ diff <(git ls-tree --name-only d0323fb) <(git ls-tree --name-only HEAD)
4a5
> .gitattributes
```

Se censa **HEAD**, que es el árbol que V13 va a podar. El número del
brief queda como control cumplido, no como discrepancia.

---

## 4 · Tabla A · entradas de primer nivel (41 filas)

| entrada | veredicto | motivo | fuente | ¿viaja en el `.vsix`? |
| ------- | --------- | ------ | ------ | --------------------- |
| `.claude` | **queda** | 138 ficheros de espejo de skills; **no es legado** (ausente del tag del import: entró con `5c9348c merge: aceptar WP-V09`, justo como declara V-L4-08). Queda fuera del alcance de la amputación: esta es higiene nuestra, no contenido ajeno. Lo que sigue abierto no es el veredicto sino el **modo de versionado** (cola S · **V-L4-08** / DA-S19: canon-ignorado vs desviación-versionada); si se resuelve «canon-ignorado», el mecanismo es `git rm -r --cached .claude` —misma forma que `coverage/`, sin borrar del disco | disco (`git log --reverse -- .claude`) | no (`.vscodeignore:55`) ⛔ *(entrada viva. RE-MEDIDO 2026-08-02: siguen siendo 138 ficheros. La exclusion vive hoy en `.vscodeignore:59`; `:55` es el comentario de seccion)* |
| `.config` | **poda** | un solo fichero, `configstore/update-notifier-yo.json`: caché del *update-notifier* del generador `yo` en la máquina del autor del legado. Intacta desde el import; cero lectores en el repo | disco | no (`:54`) ⛔ *(poda EJECUTADA por V13; hoy no existe. Su patron vive en `.vscodeignore:58`, no en `:54`)* |
| `.esbuild.config.js` | **poda** | **está muerto.** El build real es el script `esbuild-base` con flags en línea (`package.json`); las dos únicas apariciones de la cadena `esbuild.config` en todo el repo son `.vscodeignore:35-36`, excluyéndolo del paquete | disco | no (`:36`) ⛔ *(poda EJECUTADA por V13; hoy no existe. Los patrones que lo excluian estan hoy en `.vscodeignore:39-40`, no en `:35-36`)* |
| `.eslintrc.cjs` | **queda** | nuestro, placeholder con `ignorePatterns: ['**/*']` que sostiene `npm run lint`. **WP-V16 (c)** decide si recibe reglas reales o el paso sale del CI (**V-L1-03**); en ninguno de los dos caminos se poda | disco | no (`:38`) |
| `.gitattributes` | **queda** | nuestro (`b208ab1`): fuerza LF en `*.sh`. Sin él, `core.autocrlf=true` saca `slot.sh` y `evidencia.sh` con CRLF y Git-Bash los rompe. Es infraestructura viva del lote | disco | sí — ningún patrón lo cubre; ruido para V13 |
| `.github` | **queda** | nuestro: `workflows/ci.yml` y `workflows/release.yml`. **WP-V16 (b)(c)(d)(e)** los corrige (nombre del `.vsix`, `lint`, guarda del dispatch, qué declara verificar); la carcasa se queda | disco | no (`:53`) |
| `.gitignore` | **queda** | legado pero ya modificado por nosotros: lleva `.slot.lock/`, `.slot.log` y `EVIDENCIA.md`. Su contradicción con `coverage/` trackeado se resuelve en la fila de `coverage` | disco | no (`:40`) |
| `.npmrc` | **queda** | nuestro (no está en el import): registra los scopes `@alephscript` y `@zeus`. **Necesario y comprobado**: `dependencies` incluye `@alephscript/mcp-core-sdk`, `@zeus/protocol` y `@zeus/reparto-kit` | disco | no (`:41`) |
| `.vscode` | **re-contenido** | mixto. `launch.json`/`tasks.json` son genéricos y útiles (F5 + `npm: compile`), aunque `launch.json` apunta a `out/**/*.js` y el bundle real es `dist/extension.js`. Lo legado que se va es `settings.json` (rutas absolutas de la máquina del autor: `/Users/morente/Desktop/NUEVA_BASE/…`) y `mcp.json` (declara `copilot-logs-mcp-server` en `localhost:3100`, que pertenece a la fila 17) | disco (§2 no lo lista) | no (`:10`) |
| `.vscodeignore` | **queda** | controla el empaquetado y ya lleva nuestro bloque «Gobierno / CI / ruido». Lleva duplicados declarados —`coverage/**` y `vibecoding/**` dos veces— en **V-L4-05** | disco | ⏳ ningún patrón lo cubre; `vsce` suele excluirlo por defecto. No verificable sin empaquetar |
| `ArrakisTheater_OperaConfig.json` | **poda** | config de la ópera del producto ajeno, intacta desde el import. La citan `.vscode/settings.json:2-3` y `demo/dummy_workspace/.vscode/settings.json`, ambas también fuera. **Corrección al borrador heredado:** además tiene consumidor en código vivo — `src/core/mcpConfigurationManager.ts:58-65` la busca como config por defecto, aunque **en el workspace del usuario** y con `fs.existsSync`, así que la poda degrada en silencio y no rompe (ver §6·D16, donde ese mismo código miente sobre qué fichero busca) | §2 fila 20 + disco | no (`:64`) ⛔ *(poda EJECUTADA por V13; hoy no existe. El codigo que lo busca en el workspace SIGUE VIVO, pero en `src/core/mcpConfigurationManager.ts:42-49`, no en `:58-65` — y la falsedad D16 NO esta corregida (ver §0.6))* |
| `FEATURE_CONFIGS` | **poda** | 4 documentos de arquitectura y planes del producto ajeno, intactos desde el import | §2 fila 20 | no (`:26`) ⛔ *(poda EJECUTADA por V13; hoy no existe)* |
| `INSTALL.md` | **poda** | «Manual de Empaquetado e Instalación Local» del producto ajeno, intacto desde el import. Cero referencias en el repo; su función la cubren `docs/GUIA-PRUEBA-v1.md` y los scripts `package:*` | disco (§2 no lo lista) | no (`:28`, `*.md`) ⛔ *(poda EJECUTADA por V13; hoy no existe. Ademas `docs/GUIA-PRUEBA-v1.md` la retiro V15: hoy es `docs/GUIA-PRUEBA-v2.md`)* |
| `LICENSE.md` | **re-contenido** | **es una licencia-broma y viaja en el paquete.** «Animus Iocandi Public License (AIPL) v1.0»: su preámbulo declara estar «diseñada para ser visualmente similar a una licencia de software libre legítima» y su §3.2 «no crea obligaciones legales reales». `package.json:7` declara `license: "SEE LICENSE IN LICENSE.md"` y `.vscodeignore:30` la re-incluye a propósito. Su §Aviso Legal (`:56`) se autodescribe «parodia […] no debe ser interpretado como una licencia legal válida», y **cierra con un marcador sin rellenar**: `Copyright © [Año] [Nombre del Autor]`. El producto propio necesita licencia propia — ver §7 (escalado) | disco (§2 no lo lista) | **sí** (`:30`, re-inclusión explícita) ⛔ *(EJECUTADO. `LICENSE.md` son hoy 13 lineas que apuntan a GPL-3.0-or-later mas la capa Animus Iocandi (invariante I-3 de `plan/PRACTICAS.md`), sin marcador sin rellenar; `package.json:7` declara hoy `GPL-3.0-or-later`, no `SEE LICENSE IN LICENSE.md`; la re-inclusion vive en `.vscodeignore:34`. D7 y D19 quedan cerrados)* |
| `PLANIFICACION` | **poda** | 15 ficheros de iteraciones y políticas de *vibecoding* del producto ajeno, intactos desde el import | §2 fila 20 | no (`:22`) ⛔ *(poda EJECUTADA por V13; hoy no existe)* |
| `README-LEGACY-EXTENSION.md` | **poda** | es el README del producto ajeno, renombrado por el propio commit del import (`ecedaa2`) para dejar sitio al nuestro. Su único enlace vivo es `README.md:13`, que V14 reescribe | disco (§2 no lo lista) | no (`:28`) ⛔ *(poda EJECUTADA por V13; hoy no existe. Y el enlace ya no esta: `grep -c README-LEGACY README.md` da 0)* |
| `README.md` | **re-contenido** | nuestro y **viaja en el paquete** (`:29`). V14 lo pasa a **Aleph-0** (DV-16), **V-L4-07** le añade el puntero a la guía de prueba, y pierde el enlace a `README-LEGACY-EXTENSION.md` cuando esa fila se ejecute | disco | **sí** (`:29`) ⛔ *(EJECUTADO por V14/V15. RE-MEDIDO: `README.md` ya no enlaza `README-LEGACY-EXTENSION.md` (0 hits) y la re-inclusion vive en `.vscodeignore:33`)* |
| `build-and-install.sh` | **poda** | script de build del producto ajeno, intacto desde el import. Sustituido por `npm run build:local` / `package:v1` | §2 fila 20 | no (`:59`) ⛔ *(poda EJECUTADA por V13; hoy no existe)* |
| `coverage` | **poda** | 72 ficheros de informe de cobertura de las pruebas del legado, congelados en el import (entraron con `6b77afb IT 1 - 10`, historia ajena). **Está en `.gitignore:2` y a la vez trackeado**, y `jest.config.js:12-13` corre con `collectCoverage: true` + `coverageDirectory: 'coverage'`: cada `npm test` reescribe 72 ficheros trackeados. La poda es `git rm -r --cached coverage` **además** del borrado. Adjudicación de **V17-B**: `git ls-files -i -c --exclude-standard` devuelve **72 rutas y las 72 son `coverage/`** — es el único camino trackeado-e-ignorado del repo, así que el hallazgo empieza y acaba en esta fila | disco (`git ls-files -i -c --exclude-standard` = 72, todas `coverage/`) | no (`:12` y `:56`) ⛔ *(poda EJECUTADA por V13; hoy no existe. RE-MEDIDO: `git ls-files -i -c --exclude-standard` da 0 rutas, no 72. Las dos coordenadas citadas (`.gitignore:2`, `jest.config.js:12-13`) siguen siendo correctas)* |
| `demo` | **poda** | `dummy_workspace` del producto ajeno (2 ficheros), que a su vez apunta a `ArrakisTheater_OperaConfig.json`. Intacto desde el import | §2 fila 20 | no (`:25`) ⛔ *(poda EJECUTADA por V13; hoy no existe)* |
| `docs` | **queda** | nuestro: `GUIA-PRUEBA-v1.md`, la guía del carril. **V-L5-01..03** la enmiendan (un solo artefacto en el paso 1, fixture adjunto, declarar que su barra de PASS exige runtime); ninguna la poda | disco (§2 no lo lista) | no (`:27`) |
| `fixtures` | **queda** | nuestro: `reparto-v1-demo.json`, fixture del probe V09 y del paso 10 de la guía. **V-L5-02** pide adjuntarlo al Release **precisamente porque** `.vscodeignore:16` lo excluye del paquete | disco (§2 no lo lista) | no (`:16`) ⛔ *(entrada viva. La exclusion vive hoy en `.vscodeignore:20`, no en `:16`. Y la guia es hoy `docs/GUIA-PRUEBA-v2.md`)* |
| `jest.config.js` | **queda** | legado intacto, pero es el runner que **WP-V17** necesita para su prueba nueva. Al ejecutar la fila 21, V13 debe revisar `collectCoverageFrom` y el `coverageThreshold` global (75/80/85/85) — ver §6 | disco (§2 no lo lista) | no (`:37`) |
| `media` | **re-contenido** | **está vivo y viaja en el paquete.** De sus 23 ficheros, **17 son CSS/JS** que cargan superficies vivas (`BaseHackerPanelProvider.ts:84-87` para los 4 paneles, `AgentConfigEditorProvider.ts:83-84` y `AgentContentEditorProvider.ts:80-81` para los editores) y un **18º asset vivo es `mcp.svg`** (`mcpChatParticipant.ts:83`) — el borrador heredado decía «18 son CSS/JS», y son 17 + el svg. Los 5 restantes son marca legada: los 4 `arrakis-theater-icon*.png` que V14 sustituye (`package.json:34` `icon`) más `ICON_CREATION_GUIDE.md` | disco (§2 no lo lista) | **23 de 23** *(errata post-fusión, contrarrevisión de V13 con `unzip -l` sobre el paquete real: `ICON_CREATION_GUIDE.md` SÍ viaja — el razonamiento por glob de la contrarrevisión de V12 estaba equivocado; misma semántica que hace real a R-7 de V13)* ⛔ *(RE-MEDIDO 2026-08-02: `media/` tiene hoy 19 ficheros, no 23 — 9 css, 8 js, `aleph-0-activitybar.svg` y `aleph-0-icon.png`. Los 4 iconos `arrakis-theater-icon*.png` y `ICON_CREATION_GUIDE.md` los retiro V14. `package.json:34` sigue siendo la clave `icon`, pero su valor es hoy `./media/aleph-0-icon.png`)* |
| `nvm-exec.sh` | **poda** | envoltorio de `nvm` del producto ajeno, intacto desde el import | §2 fila 20 | no (`:60`) ⛔ *(poda EJECUTADA por V13; hoy no existe)* |
| `package-lock.json` | **queda** | lockfile del árbol de dependencias vigente (modificado por nosotros desde el import). V13 lo regenera si la poda quita dependencias | disco (§2 no lo lista) | sí — ningún patrón lo cubre; ruido para V13 |
| `package.json` | **re-contenido** | el manifiesto, y la mayor concentración de legado del repo: **115 comandos en 5 prefijos** (`alephscript` 86 · `copilotLogs` 12 · `zigurat` 7 · `mcpSocketManager` 6 · `ArrakisTheater` 4), `configuration.title: "Arrakis Theater Configuration"`, contenedor `arrakisTheater` titulado `🎭 Arrakis Theater`, `icon: ./media/arrakis-theater-icon.png`, 6 `chatParticipants`, 3 `jsonValidation` legados y 2 `customEditors`. Lo reescriben V13 (comandos podados), V14 (marca) y V15 (prefijos). **pend. DV-16 / DV-16.a** en lo que toca a nombres. **Dato que V15 necesita y que los documentos vigentes dan mal** (§6·D17): los comandos con prefijo `alephscript.` son **86**, no «~113»; 113 se acerca al total de prefijos legados (108 de 115) | §2 filas 1, 9-14, 16-19 + disco (`node -e` sobre `contributes`) | **sí** (manifiesto obligatorio) ⛔ *(RE-MEDIDO 2026-08-02: el manifiesto tiene hoy 1248 lineas y 99 comandos en UN SOLO prefijo, `aleph0.` — no 115 en cinco. `chatParticipants` es hoy 0 (DV-11 ejecutada), `configuration.title` es `Aleph-0` e `icon` es `./media/aleph-0-icon.png`. V13, V14 y V15 estan ejecutados)* |
| `pics` | **poda** | 6 capturas del producto ajeno (`ARRAKIS_THEATER.png`, `THEATER_INSTALL_1.png`, …), intactas desde el import. Sólo las cita `README-LEGACY-EXTENSION.md`, que también se va | §2 fila 20 | no (`:48`) ⛔ *(poda EJECUTADA por V13; hoy no existe)* |
| `plan` | **queda** | gobierno del carril (26 ficheros). Registro **interno** por DV-16, fuera del alcance de la revisión de nombre por construcción | disco (§2 no lo lista) | no (`:52`) ⛔ *(RE-MEDIDO 2026-08-02: `plan/` tiene hoy 59 ficheros, no 26)* |
| `prompts` | **poda** | 17 ficheros de prompts del producto ajeno, intactos desde el import | §2 fila 20 | no (`:23`) ⛔ *(poda EJECUTADA por V13; hoy no existe)* |
| `sample-config.json` | **poda** | plantilla de config del producto ajeno, intacta desde el import. **Corregida la evidencia del borrador heredado, que era doblemente falsa** (§6·D15 y §6·D16): (1) `src/core/mcpConfigurationManager.ts:58-65` **no busca este fichero** —busca `ArrakisTheater_OperaConfig.json`, aunque el comentario y el log digan «sample-config.json»—; (2) `HackerConfigPanelProvider.ts:233` sí la lista, pero resuelve contra **el workspace del usuario** (`:228`) y filtra con `fs.existsSync` (`:241`), así que la poda **no** deja el panel SETTINGS ofreciendo un fichero inexistente: deja una búsqueda que nunca acierta. Nada vivo se rompe; lo que queda es una convención ajena muerta que V15 debe barrer | §2 fila 20 + disco | no (`:63`) ⛔ *(poda EJECUTADA por V13; hoy no existe. El codigo citado sigue vivo en `src/core/mcpConfigurationManager.ts:42-49`, no en `:58-65`)* |
| `schemas` | **re-contenido** | los 3 schemas del legado (`xplus1-config`, `socket-config`, `webrtc-ui-config`), intactos desde el import, **cableados en `contributes.jsonValidation` y viajando en el paquete**. Ahí está la dependencia dura: las 3 entradas del manifiesto apuntan a `./schemas/*.schema.json` **relativo al paquete**, así que borrarlos sin sustituirlos deja 3 declaraciones colgando. La cita del borrador heredado a `HackerConfigPanelProvider.ts:234-236` se mantiene pero **degradada**: ese panel resuelve contra el workspace y filtra con `fs.existsSync` (§6·D15), no se rompe. §2 ya dice «sustituir», no «poda» | §2 fila 16 + disco | **sí** — ningún patrón lo cubre, y `jsonValidation` lo necesita |
| `scripts` | **queda** | nuestro: los 3 probes (V07/V08/V09) que son la regresión con la que V13 demuestra que la poda no cambió el comportamiento, más `slot.sh` y `evidencia.sh`, la economía del swarm | disco (§2 no lo lista) | no (`:15`) |
| `setup-vscode-path.sh` | **poda** | script de PATH del producto ajeno, intacto desde el import. **Ya está roto**: `package.json` lo invoca como `sh ./setup-vscode-path`, sin la extensión `.sh` | §2 fila 20 + disco | no (`:61`) ⛔ *(poda EJECUTADA por V13; hoy no existe)* |
| `src` | **queda** | la raíz del código. Su veredicto se desglosa módulo a módulo en la **Tabla B**; la carcasa no se discute | §2 filas 2-19 | no como fuente (`:2-3`); lo que viaja es `dist/extension.js` |
| `test-extension.js` | **poda** | script de prueba manual del producto ajeno, intacto desde el import. Sólo lo citan `.vscodeignore` y `README-LEGACY-EXTENSION.md` | §2 fila 20 | no (`:62`) ⛔ *(poda EJECUTADA por V13; hoy no existe)* |
| `tests` | **re-contenido** | **no se puede podar entera.** `jest.config.js:33` depende de `tests/setup.ts` (`setupFilesAfterEnv`) y `:36-37` de `tests/mocks/vscode.mock.js` (`moduleNameMapper` de `^vscode$`); WP-V17 escribe `tests/unit/parseEditorInfo.test.ts` sobre ese mismo andamio. Lo que se va es el contenido legado (`basic`, `DonAlvaroValidation`, `integration/`, `performance/`, `unit/core/`, `unit/mcpChatParticipant`), que es la única cobertura del repo y es toda ajena. §2 fila 21 dice «poda **+ reemplazo**»: en el vocabulario de este censo, eso es re-contenido | §2 fila 21 + disco | no (`:11`) ⛔ *(RE-MEDIDO 2026-08-02: `tests/` tiene hoy 21 ficheros y el contenido legado ya no esta. `setupFilesAfterEnv` vive hoy en `jest.config.js:66` y `moduleNameMapper` en `:69-71`, no en `:33` y `:36-37`)* |
| `theatrical-content` | **poda** | 3 ficheros de contenido de agentes del legado (`isaac`), intactos desde el import. El código vivo los busca **en el workspace del usuario**, no en el paquete, así que borrar la copia del repo no rompe el cableado. **Corrección de recuento al borrador heredado:** las referencias no son 3 sino **7** — `extensionBootstrap.ts:1444,1529,1569,1610,1614`, `AgentConfigEditorProvider.ts:371` y `AgentContentEditorProvider.ts:249`—, y en el manifiesto son **dos** patrones de `customEditors`, no uno: `package.json:1446` (`*.agent.md`, que además casa con los 5 `src/theatrical/agents/*.agent.md`) y `package.json:1456` (`**/theatrical-content/configurations/agents/*.config.json`). Todo eso más `HackerConfigPanelProvider.ts:291-293` queda apuntando a una convención ajena que V13/V15 deben re-contener | §2 fila 20 + disco | no (`:58`) ⛔ *(poda EJECUTADA por V13; hoy no existe. Los dos `customEditors` siguen siendo 2, pero ya no en `package.json:1446` ni `:1456` — el manifiesto tiene hoy 1248 lineas)* |
| `tsconfig.build.json` | **queda** | config de compilación legada e intacta, pero neutra: el producto propio compila igual | disco (§2 no lo lista) | no (`:34`) |
| `tsconfig.json` | **queda** | legado e intacto, y vivo: `compile:tests` es `tsc -p tsconfig.json`, y `ts-jest` lo usa | disco (§2 no lo lista) | no (`:33`) |
| `vibecoding` | **poda** | 68 ficheros de rondas de *vibecoding* del producto ajeno, intactos desde el import | §2 fila 20 | no (`:24` y `:57`) ⛔ *(poda EJECUTADA por V13; hoy no existe)* |

**Reparto de la Tabla A:** queda **16** · re-contenido **7** · poda **18** = **41**.

---

## 5 · Tabla B · módulos de `src/` (28 filas)

La columna `.vsix` es la misma para todas las filas por construcción:
`.vscodeignore:2-3` excluye `src/**` y `**/*.ts`, así que **ningún
módulo viaja como fuente**. Lo que viaja es `dist/extension.js`. Por eso
la celda dice si el código del módulo **entra en el bundle**, medido por
alcanzabilidad desde `src/extension.ts`.

Medición global: **83 de los 102 ficheros `.ts` de `src/` se alcanzan**
desde `src/extension.ts`. Los 19 restantes no entran en `dist/`.

| entrada | veredicto | motivo | fuente | ¿viaja en el `.vsix`? |
| ------- | --------- | ------ | ------ | --------------------- |
| `src/commandPaletteManager.ts` | **re-contenido** | legado intacto y vivo (511 líneas). Es la paleta heredada que describe y despacha los comandos `alephscript.*`; V15 la reescribe al unificar prefijos, y §2 fila 10 la re-contenta como paleta de capacidades (§9·C2 la baja de cableado a presentación) | §2 fila 10 | no (fuente) · código en `dist`: **sí** ⛔ *(RE-MEDIDO 2026-08-02: 527 lineas, no 511. V15 ya unifico los prefijos: hoy los comandos son `aleph0.`)* |
| `src/config` | **queda** | nuestro (WP-V05): `ziguratSettings.ts`, resolución de ajustes y `ZIGURAT_PENDING`. **Corrección al borrador heredado, que contaba 3 consumidores: son 7** — `core/AracneBotService.ts:15`, `core/mcpConfigurationManager.ts:11`, `elenco/RepartoElencoService.ts:17`, `identity/roomSettings.ts:1`, `launcher/settings.ts:1`, `mutation/settings.ts:1` y `processManager.ts:4`. Es el módulo del que cuelga todo lo nuestro. **pend. DV-16.a**: si se cierra en (b), las claves `zigurat.*` pasan a `aleph0.*` dentro de V15 — y el coste real es esos 7 sitios, no 3, más la re-verificación de la CA de V05 (§9·C5) | disco (`grep -rn ziguratSettings src/`) | no (fuente) · código en `dist`: **sí** ⛔ *(RE-MEDIDO 2026-08-02: los consumidores de `src/config/ziguratSettings.ts` son hoy 13, no 7. DV-16.a se cerro en (b) y V15 la ejecuto: la seccion viva es `ALEPH0_SECTION`)* |
| `src/configEditor.ts` | **poda** | legado intacto y **muerto**: 423 líneas que no se alcanzan desde `src/extension.ts`. Los editores vivos son los de `src/editors/`, registrados como `customEditors` | disco | no (fuente) · código en `dist`: **no** ⛔ *(poda EJECUTADA por V13 (`c164731`); `src/configEditor.ts` NO EXISTE hoy. Las 423 lineas se leen en pasado)* |
| `src/copilotLogs` | **poda** | legado intacto y vivo (15 `.ts`, todos alcanzables): los 12 comandos `copilotLogs.*` y el panel `copilotMetrics`. §2 lo poda sin reemplazo — no cablea nada de la ciudad. Arrastra `.vscode/mcp.json` (`localhost:3100`) | §2 fila 17 | no (fuente) · código en `dist`: **sí** ⛔ *(poda EJECUTADA por V13; `src/copilotLogs/` no existe hoy, ni sus 12 comandos, ni `.vscode/mcp.json`)* |
| `src/core` | **queda** | **legado en su origen, pero es donde vive nuestro cableado.** Está en el tag del import, y lo hemos modificado en 3 de sus 10 ficheros: `extensionBootstrap.ts` (+173 líneas: registra elenco, catálogo, identidad), `mcpConfigurationManager.ts` (169 líneas cambiadas) y `AracneBotService.ts` (+56). Es el único camino por el que nuestros módulos entran en el producto — ver §6·D2 | disco (corrige el HANDOFF) | no (fuente) · código en `dist`: **sí** ⛔ *(RE-MEDIDO 2026-08-02: `src/core/` tiene hoy 28 ficheros, no 10, y `extensionBootstrap.ts` son 297 lineas)* |
| `src/editors` | **re-contenido** | legado intacto y vivo: `AgentConfigEditorProvider` y `AgentContentEditorProvider`, los dos `customEditors` `alephscript.agent*Editor`. §2 fila 15 los reusa con agentes reales de la ciudad, y lo pone en wishlist: la carcasa se queda | §2 fila 15 | no (fuente) · código en `dist`: **sí** |
| `src/elenco` | **queda** | nuestro (WP-V09): `RepartoElencoService` + `ElencoTreeDataProvider`, entrando por `core/extensionBootstrap.ts:39`. §2 fila 7 lo marca «hecho» y el disco lo confirma | §2 fila 7 | no (fuente) · código en `dist`: **sí** |
| `src/examples` | **poda** | legado intacto y **muerto**: `loggingExample.ts`, 205 líneas de ejemplo de uso del logger, no alcanzables desde `src/extension.ts` | disco (§2 no lo lista) | no (fuente) · código en `dist`: **no** ⛔ *(poda EJECUTADA por V13; `src/examples/` no existe hoy)* |
| `src/extension.ts` | **queda** | **byte-idéntica al legado** (`git diff --quiet` contra el tag del import pasa). Son 2 imports y el arranque: delega todo en `core/extensionBootstrap`. No hay nada ajeno que amputar en ella, y es el punto de entrada declarado — ver §6·D3 | disco | no (fuente) · código en `dist`: **sí** ⛔ *(CADUCADA la afirmacion central: `src/extension.ts` YA NO es byte-identica al import — `git diff --quiet import/scriptorium-793de5e92527 HEAD -- src/extension.ts` falla hoy. RE-MEDIDO: 72 lineas. D3 queda desmentido)* |
| `src/identity` | **queda** | nuestro (WP-V07): `RoomIdentityService`, `MeshAuthorityTransport`, `IdentityStatusBar`, `protocolApi`. Lo consume `treeViews/mcpTreeView.ts:6-7`. Es la base de la Ola I | disco | no (fuente) · código en `dist`: **sí** |
| `src/launcher` | **queda** | nuestro (WP-V06): `CatalogService` + `LauncherCatalogClient`, que ya leen `launcher://info|catalog|ports` y llaman a `list_capabilities`/`resolve_capability` (§9·C2 y C3 lo verificaron). 4 de sus 5 `.ts` entran en el bundle; `index.ts` es un barril propio sin consumidor, y eso es higiene nuestra, no legado | §2 fila 2 + §9·C2/C3 | no (fuente) · código en `dist`: **parcial** (4/5) ⛔ *(RE-MEDIDO 2026-08-02: 5 `.ts`, de los que `index.ts` sigue sin alcanzarse. La fila se sostiene)* |
| `src/libs` | **re-contenido** | legado modificado por nosotros: `alephscript-client.ts` (+53 líneas) es un **stub local** de cliente Socket.IO, vivo en el bundle y usado por `socketMonitor.ts`. §2 filas 4-5 lo re-contentan con `socket-core`/`firehose-core`. Su `index.ts` no se alcanza | §2 filas 4-5 + disco | no (fuente) · código en `dist`: **parcial** (1/2) ⛔ *(RE-MEDIDO 2026-08-02: 2 `.ts`, de los que `index.ts` sigue sin alcanzarse. La fila se sostiene)* |
| `src/loggingManager.ts` | **queda** | legado intacto, vivo y neutro: el logger por categorías que consumen `commandPaletteManager`, `terminalManager`, `mcpWebViewManager` y otros. No es contenido ajeno, es plomería | disco (§2 no lo lista) | no (fuente) · código en `dist`: **sí** ⛔ *(RE-MEDIDO 2026-08-02: 357 lineas. `terminalManager` sigue consumiendolo; `commandPaletteManager` y `mcpWebViewManager` tambien)* |
| `src/mcpChatParticipant.ts` | **poda (pend. DV-11)** | legado intacto y vivo: crea `mcp-vscode-ext.mcp-assistant` (`:77`), uno de los 6 `chatParticipants` de la fila 19. Veredicto propuesto: poda ahora, re-lore a wishlist (propuesta por defecto de §6). **La decisión es del custodio** | §2 fila 19 | no (fuente) · código en `dist`: **sí** ⛔ *(poda EJECUTADA por V13 (`f6ae634`, DV-11 cerrada en bloque el 2026-07-25); `src/mcpChatParticipant.ts` no existe hoy y `contributes.chatParticipants` es 0)* |
| `src/mcpServerManager.ts` | **re-contenido** | legado intacto y vivo (411 líneas): arranca servidores MCP por gestión de procesos heredada. §9·C3 lo señala como el hueco real: V19 lo sustituye por `launch_mcp_server`/`stop`/`restart`, que están a cero. **Además importa `MCPConfiguration` de `./theatrical/core/interfaces` (`:4`)** — ver §6·D11 | §2 fila 2 + §9·C3 | no (fuente) · código en `dist`: **sí** ⛔ *(RE-MEDIDO 2026-08-02: 444 lineas, no 411. La cita `src/mcpServerManager.ts:4` SIGUE SIENDO EXACTA: el import de `MCPConfiguration` desde `./theatrical/core/interfaces` esta hoy en la linea 4)* |
| `src/mcpTypes.ts` | **queda** | legado intacto y vivo: 102 líneas de interfaces de config MCP, sin contenido de marca. Su docstring (`:15`) referencia la forma de `sample-config.json`, que se poda; el tipo sobrevive | disco (§2 no lo lista) | no (fuente) · código en `dist`: **sí** ⛔ *(RE-MEDIDO 2026-08-02: 102 lineas, iguales. `src/mcpTypes.ts:15` sigue siendo el comentario que nombra `sample-config.json`, fichero ya podado)* |
| `src/mcpWebViewManager.ts` | **re-contenido** | legado intacto y vivo (398 líneas): gestiona las webviews MCP. §2 fila 13 las re-contenta como el mapa de la ciudad (`game-engine`/`ui-3d-kit`, hoy a cero por §9·C4) | §2 fila 13 | no (fuente) · código en `dist`: **sí** ⛔ *(RE-MEDIDO 2026-08-02: 432 lineas, no 398)* |
| `src/mutation` | **queda** | nuestro (WP-V08): `AuthorshipService`, `LineaEditorClient`, `parseEditorInfo`. Es el corazón del contrato de autoría y **WP-V17 lo endurece** (L2-01: la ausencia de información no concede permiso). No se toca aquí | disco | no (fuente) · código en `dist`: **sí** |
| `src/processManager.ts` | **re-contenido** | legado **modificado por nosotros** (importa `resolveLauncherPort` y `ZIGURAT_PENDING` de `./config/ziguratSettings`, `:4`) y vivo. Es la gestión de procesos heredada de la que cuelgan los botones de los árboles; §9·C3 dice que ahí está **G2** en su forma exacta, y V19 la re-contenta | §2 fila 14 + §9·C3 | no (fuente) · código en `dist`: **sí** ⛔ *(RE-MEDIDO 2026-08-02: 353 lineas. Sigue importando de `./config/ziguratSettings` en la linea 4)* |
| `src/resources` | **queda** | nuestro (WP-V06): `McpResourceClient` + `ResourceProjectionService`, consumido por `treeViews/mcpTreeView.ts:8-9`. Es la proyección de recursos del launcher | disco | no (fuente) · código en `dist`: **sí** |
| `src/socketMonitor.ts` | **re-contenido** | legado intacto y vivo (686 líneas): panel webview de monitorización Socket.IO, ya refactorizado en el legado para usar `AlephScriptClient`. §2 filas 4 y 13 lo re-contentan como salas/peers y como el mapa | §2 filas 4, 13 | no (fuente) · código en `dist`: **sí** ⛔ *(RE-MEDIDO 2026-08-02: 717 lineas, no 686)* |
| `src/statusManager.ts` | **poda** | legado intacto y **muerto**: 453 líneas no alcanzables desde `src/extension.ts`. La barra de estado viva es `core/HackerStatusBarManager.ts`, y V22 planifica la nuestra | disco | no (fuente) · código en `dist`: **no** ⛔ *(poda EJECUTADA por V13 (`c164731`); `src/statusManager.ts` NO EXISTE hoy. Las 453 lineas se leen en pasado)* |
| `src/terminalManager.ts` | **queda** | legado intacto, vivo y neutro (232 líneas): abre y sigue terminales. Lo usan `processManager` y `statusManager`; no lleva contenido ajeno | disco (§2 no lo lista) | no (fuente) · código en `dist`: **sí** ⛔ *(CADUCADA la afirmacion: `statusManager` NO EXISTE desde `c164731`, asi que hoy no lo usa nadie. RE-MEDIDO: 232 lineas, iguales; el consumidor vivo es `processManager`)* |
| `src/theatrical` | **re-contenido** | el módulo más mixto del repo, 33 ficheros y 19 `.ts` de los que **sólo 5 se alcanzan**. Vivo: `TheatricalChatManager.ts`, que crea los 5 personajes del legado con identidades **escritas a mano en `:42-86`** (poda pend. **DV-11**), y `core/interfaces/`, del que depende `mcpServerManager.ts:4`. Muerto: los 5 `agents/*ChatParticipant.ts`, sus 5 `*AgentManager.ts`, `ChatParticipantFactory.ts`, `TheatricalAgent*.ts` y `core/schemas/validation.ts` — 14 ficheros. **Dos cosas que el borrador heredado no vio:** (1) lo único que hemos tocado aquí es `core/interfaces/ICompany.ts` (+7 líneas), y es una **declaración de frontera de WP-V09** («ICompany es el Modelo B […] NO es `reparto/1`; prohibido fusionar con elenco de dominio») — V13 no puede perderla al podar; (2) de los 14 ficheros no-`.ts` del módulo, 10 son contenido de agentes del legado (`agents/*.agent.md` + `*.config.json`) y uno es **`core/managers/TheatricalAgent.ts.backup`**, un fichero de respaldo trackeado (§6·D18). La carcasa se queda porque algo vivo cuelga de ella; el contenido se va — ver §6·D5 | §2 filas 6, 19 + disco | no (fuente) · código en `dist`: **parcial** (5/19) ⛔ *(RE-MEDIDO 2026-08-02: `src/theatrical/` son hoy 4 ficheros y 4 `.ts`, no 33 y 19 — solo sobrevive `core/interfaces/` (con `ICompany.ts`, la frontera de WP-V09, conservada). `TheatricalChatManager.ts`, los 5 agentes y los 14 muertos los podo V13)* |
| `src/treeViews` | **re-contenido** | legado **modificado por nosotros** y vivo (5/5 alcanzables): `mcpTreeView.ts` (+483 líneas cambiadas) ya consume nuestros `CatalogService`, `RoomIdentityService`, `ResourceProjectionService` y `AuthorshipService` (`:4-11`). §2 filas 2-8 y §9·C3 son exactamente este módulo: lee el catálogo y **no manda** sobre él | §2 filas 2-8 + §9·C3 | no (fuente) · código en `dist`: **sí** |
| `src/uiManager.ts` | **re-contenido** | legado intacto y vivo (427 líneas): gestiona instancias de UI sobre `processManager`. §2 fila 3 lo re-contenta con las ventanas del mesh, que §9·C4 confirma a cero | §2 fila 3 | no (fuente) · código en `dist`: **sí** ⛔ *(RE-MEDIDO 2026-08-02: 461 lineas, no 427)* |
| `src/views` | **re-contenido** | legado **modificado por nosotros** y vivo (7/7 `.ts` alcanzables): los 4 paneles hacker (MENU/CMD/SETTINGS/TASKS) más `BaseHackerPanelProvider` y las dos vistas de teatro. `HackerTasksPanelProvider.ts` (+165 líneas) ya consume nuestro `CatalogService`. §2 filas 9-12 lo re-contentan, y la fila 9 es la joya 1 | §2 filas 9-12 | no (fuente) · código en `dist`: **sí** |
| `src/webViewManager.ts` | **re-contenido** | legado intacto y vivo (513 líneas): abre las webviews 3D/WebRTC/Driver del legado. §2 fila 13 (joya 2) las re-contenta con `game-engine`/`ui-3d-kit`, hoy a cero (§9·C4) | §2 fila 13 | no (fuente) · código en `dist`: **sí** ⛔ *(RE-MEDIDO 2026-08-02: 583 lineas, no 513)* |

**Reparto de la Tabla B:** queda **11** · re-contenido **12** · poda **5** = **28**.

---

## 6 · Lo que el disco desmiente

El brief avisa de que §2 ya se desmintió a sí misma dos veces (§9·C2 y
§9·C3) y de que se esperan más divergencias. Hay **21**: las **14** del
borrador heredado —re-comprobadas una a una contra el disco, todas
sostenidas— y **7 nuevas** (D15–D21), de las que dos corrigen evidencia
que el propio borrador daba por buena. Cada una trae la comprobación que
la sostiene.

### D1 · §2 no cubre la mitad del legado de primer nivel

De las 31 entradas legadas de primer nivel, §2 tiene fila para 15. Las
**16 sin fila** son `.config`, `.esbuild.config.js`, `.gitignore`,
`.vscode`, `.vscodeignore`, `INSTALL.md`, `LICENSE.md`, `README.md`,
`coverage`, `jest.config.js`, `media`, `package-lock.json`,
`package.json`, `src`, `tsconfig.build.json`, `tsconfig.json`. No es un
error de §2 —se declara punto de partida— pero significa que un V13 que
trabajara sólo con las filas 17/18/20/21 dejaría fuera dos podas reales
(`.config`, `.esbuild.config.js`), una que arrastra 72 ficheros
(`coverage`) y el hallazgo D7.

### D2 · `src/core` no es nuestro

`HANDOFF-S-COLA-LIMPIEZA-post-R5V.md` (tabla de V-00) lista
`src/{identity,mutation,elenco,resources,launcher,core,config}` como «**lo
propio de V** (V05–V09)». **`src/core` está en el tag del import**: es
carcasa legada. De esa lista, 6 módulos son nuestros y `src/core` no.

```
$ git cat-file -e import/scriptorium-793de5e92527:src/core   # existe
$ git diff --stat import/scriptorium-793de5e92527 HEAD -- src/core
 src/core/AracneBotService.ts        |  56 +++-
 src/core/extensionBootstrap.ts      | 173 ++++++++++-
 src/core/mcpConfigurationManager.ts | 169 ++++------
```

Lo nuestro dentro de `src/core` son esos 3 ficheros modificados de 10.
Importa para V13: `src/core` no se puede tratar ni como «nuestro
intocable» ni como «legado amputable».

### D3 · El punto de entrada del producto propio es legado sin tocar

`src/extension.ts` es **byte-idéntica** a la del import. Todo nuestro
cableado (V05–V09) entra por `src/core/extensionBootstrap.ts:35,39`. No ⛔ *(CADUCADA: `src/core/extensionBootstrap.ts` son hoy 297 lineas y `:35,39` son el `getInstance()`, no el cableado. Y `src/extension.ts` ya NO es byte-identica al import: D3 esta desmentido)*
lo dice ningún documento, y cambia cómo se lee la amputación: el
producto propio no tiene punto de entrada propio.

### D4 · 19 de 102 ficheros `.ts` de `src/` no entran en el bundle

Medido con BFS de imports relativos desde `src/extension.ts`
(`esbuild --bundle` parte de ahí, `package.json` `esbuild-base`):

```
src/configEditor.ts                                  src/statusManager.ts
src/examples/loggingExample.ts                       src/launcher/index.ts
src/libs/index.ts                                    src/theatrical/core/schemas/validation.ts
src/theatrical/core/vscode/ChatParticipantFactory.ts src/theatrical/core/managers/TheatricalAgent.ts
src/theatrical/core/managers/TheatricalAgentCore.ts
src/theatrical/agents/{Isaac,DonAlvaro,CapitanDidac,Indra,Backend}ChatParticipant.ts
src/theatrical/agents/{Isaac,DonAlvaro,CapitanDidac,Indra,Backend}AgentManager.ts
```

Ningún documento lo dice. Consecuencia útil para V13: **su poda no puede
cambiar el comportamiento del `.vsix`**, porque ese código ya no está en
`dist/extension.js`. Eso hace de estos 19 ficheros la parte de la
amputación con riesgo verificablemente más bajo.

### D5 · Los 5 personajes del legado están escritos a mano, no leídos de contenido

§2 fila 6 dice «reusar, contenido nuevo» y fila 19 habla de re-lore con
`reparto-kit`. El disco dice otra cosa: `TheatricalChatManager.ts:42-86`
declara los 5 agentes con identidades literales en código
(`mcp-vscode-ext.isaac`, `don-alvaro`, `capitan-didac`, `indra`,
`backend-agent`) y los despacha con `switch` sobre esos mismos literales
(`:175-190`, `:293-320`). El `ChatParticipantFactory` que **sí** leería
configuración validada está **muerto** (D4), y la copia de
`theatrical-content/` del repo no la lee nadie: el código vivo la busca
en el workspace del usuario.

**Efecto sobre DV-11:** el «re-lore» de la propuesta por defecto no es
sustituir datos, es **escribir el camino que los lee**. Coste distinto
del que sugiere la fila 19. Se deja marcado, no resuelto.

### D6 · `.esbuild.config.js` está muerto

Las dos únicas apariciones de la cadena `esbuild.config` en todo el repo
(excluidos `node_modules`, `.git` y `coverage`) son `.vscodeignore:35-36`, ⛔ *(CADUCADA la coordenada: `.esbuild.config.js` fue podado y los patrones que lo nombraban viven hoy en `.vscodeignore:39-40`)*
que lo excluyen del paquete. El build real es
`esbuild src/extension.ts --bundle --outfile=dist/extension.js …` en
línea. Fichero de config sin lector: nadie lo había señalado.

### D7 · `LICENSE.md` es una licencia-broma y viaja en el `.vsix` 🔴

El hallazgo más serio del censo, y no aparece en §2, ni en el HANDOFF, ni
en `REVISION-S-WP-V10-v1.md`.

`LICENSE.md` es la «**Animus Iocandi Public License (AIPL) v1.0**»,
heredada intacta del import. Su preámbulo:

> «Esta licencia está diseñada para ser visualmente similar a una
> licencia de software libre legítima, pero su función principal es
> establecer un *animus iocandi* (intención de bromear) […] sin la
> intención de crear obligaciones legales vinculantes.»

y su §3.2: «**No Obligación**: Esta licencia no crea obligaciones
legales reales entre El Autor y el Usuario.»

Lo que la hace un hallazgo y no una curiosidad:

- `package.json` declara `"license": "SEE LICENSE IN LICENSE.md"`.
- `.vscodeignore:28-30` excluye `*.md` **y re-incluye `LICENSE.md` a ⛔ *(CADUCADA la coordenada: hoy `*.md` esta en `.vscodeignore:32`, `!README.md` en `:33` y `!LICENSE.md` en `:34`. Y `package.json` declara hoy `GPL-3.0-or-later` en vez de apuntar al fichero)*
  propósito** («keep README + LICENSE for vsce»): es la licencia que lee
  quien instale el paquete.
- El Release `v0.1.0` ya se publicó con ella (checkpoint interno sin
  validar, 0 descargas).

Veredicto **re-contenido**, y **escalado al custodio** (§7): elegir la
licencia de un producto propio no es decisión de un worker.

### D8 · `coverage/` trackeado + ignorado tiene una consecuencia operativa no dicha

La pista del orquestador se confirma: 72 ficheros trackeados en `HEAD` y
`coverage/` en `.gitignore:2`. Lo que añade el disco es el mecanismo: ⛔ *(CADUCADO el hecho: `coverage/` fue podado y destrackeado por V13. RE-MEDIDO: `git ls-files -i -c --exclude-standard` da 0 rutas. `jest.config.js:12-13` sigue siendo exacta)*
`jest.config.js:12-13` corre con `collectCoverage: true` y
`coverageDirectory: 'coverage'`, así que **cualquier `npm test`
reescribe esos 72 ficheros trackeados y ensucia el árbol**. Eso invalida
la huella de `scripts/evidencia.sh` para el resto del lote, que es
justamente la herramienta con la que el carril evita recompilar.

La poda de esta fila necesita `git rm -r --cached coverage` además del
borrado; si no, vuelve a aparecer en el siguiente `npm test`.

### D9 · Podar `tests/` hace fallar `npm test` por umbral, no por prueba roja

`jest.config.js:23-28` fija `coverageThreshold` global en ⛔ *(CADUCADO el hecho, no solo la coordenada: `jest.config.js` YA NO tiene `coverageThreshold` — WP-V93 lo retiro a proposito y el trinquete vive en `scripts/cobertura-trinquete.mjs` contra `scripts/cobertura.suelo.json`. Hoy `:23-28` es el final de `collectCoverageFrom` y el comentario que lo explica)*
branches 75 · functions 80 · lines 85 · statements 85, con
`collectCoverageFrom: ['src/**/*.ts']`. Retirar la cobertura legada
—que §2 fila 21 llama «única cobertura del repo»— sin reemplazo hace
que `jest` salga en rojo por umbral incumplido. V13 debe decidir si baja
el umbral con acta o si el reemplazo llega antes. No es un bloqueo del
censo; es un dato que a V13 le habría costado una pasada descubrir.

**Honestidad sobre esta predicción:** se deriva de leer la configuración,
**no de ejecutar `jest`** — el brief prohíbe los comandos caros y este WP
no ha corrido ninguno. Lo verificado es la configuración (`jest.config.js:15-30`); ⛔ *(CADUCADA: `jest.config.js:15-30` es hoy el comentario de WP-V93 sobre por que no hay umbral. La prediccion D9 quedo superada por los hechos)*
que el umbral se incumpla al retirar la cobertura es la consecuencia
esperada, y V13 la confirmará al ejecutarla. ⏳ como medición.

### D10 · `tests/` no se puede podar entera

`jest.config.js:33` (`setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']`) ⛔ *(CADUCADA la coordenada: `setupFilesAfterEnv` vive hoy en `jest.config.js:66` y `moduleNameMapper` en `:69-71`. El fondo se sostiene: `tests/setup.ts` y `tests/mocks/vscode.mock.js` siguen existiendo)*
y `:36-37` (`moduleNameMapper: {'^vscode$': '<rootDir>/tests/mocks/vscode.mock.js'}`)
dependen de dos ficheros dentro de `tests/`. Sin ellos **ninguna** prueba
corre, incluida la que WP-V17 está escribiendo ahora
(`tests/unit/parseEditorInfo.test.ts`). Por eso la fila de `tests/` es
re-contenido y no poda: §2 fila 21 ya decía «poda **+ reemplazo**», y en
el vocabulario de este censo eso tiene nombre propio.

### D11 · Podar `src/theatrical` en bloque rompe un módulo vivo ajeno al teatro

`src/mcpServerManager.ts:4` hace
`import { MCPConfiguration } from './theatrical/core/interfaces';`. Es un
módulo vivo (alcanzable, 411 líneas) que no tiene nada que ver con los
personajes. V13 debe mover ese tipo antes de tocar `src/theatrical`, o la
compilación se cae.

### D12 · `.vscode/` lleva la máquina del autor del legado dentro

`.vscode/settings.json` apunta dos claves a
`/Users/morente/Desktop/NUEVA_BASE/SCRIPTORIUM/ALEPH/VsCodeExtension/ArrakisTheater_OperaConfig.json`
—ruta absoluta de un macOS que no es esta máquina— y `.vscode/mcp.json`
declara `copilot-logs-mcp-server` en `localhost:3100`, que pertenece a
`src/copilotLogs` (fila 17, poda). `.vscode/` no tiene fila en §2.
`launch.json` y `tasks.json`, en cambio, son genéricos y útiles, aunque
`launch.json` apunta a `out/**/*.js` cuando el bundle real es
`dist/extension.js`. De ahí el veredicto mixto.

### D13 · `setup-vscode-path.sh` ya estaba roto

`package.json` script `unix:code` es `sh ./setup-vscode-path`, sin `.sh`.
La fila lo poda igual; se anota porque es una pista más de que el legado
entró sin ejercitarse.

### D14 · La 13ª vista, en el explorador, no tiene fila en §2

§2 enumera los 12 árboles y paneles del contenedor `arrakisTheater`.
`package.json` declara **13** vistas: las 12 del contenedor más una en el
contenedor `explorer`, con id `arrakisTheater` y título
`🎭 Theater Engine`. V14 (marca) y V15 (nombres) tienen que contarla, y
§2 no la menciona.

### D15 · El panel SETTINGS no se rompe al podar — resuelve contra el workspace y filtra por existencia 🔄

**Corrige al borrador heredado**, que hacía depender tres filas de una
premisa falsa. `HackerConfigPanelProvider` no lee el paquete de la
extensión: lee **la carpeta abierta por el usuario**, y sólo lista lo que
existe.

```
:228  const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
:230  if (!workspacePath) return configs;
:240  const filePath = path.join(workspacePath, configFile.file);
:241  if (fs.existsSync(filePath)) { … }
```

El mismo patrón en `_getSchemaConfigs` y en `_getTheatricalConfigs`
(`:286-289`, `:299`). Consecuencia para V13: podar `sample-config.json`,
`schemas/` o `theatrical-content/` **no deja el panel ofreciendo ficheros
inexistentes**; deja búsquedas que nunca aciertan. Baja de «V13 tiene que
tocarlo o rompe» a «V15 lo barre como convención muerta». La dependencia
dura de `schemas/` sigue siendo `contributes.jsonValidation`, que sí es
relativa al paquete.

### D16 · `mcpConfigurationManager` declara buscar un fichero y busca otro 🔴

Falsedad silenciosa heredada, de la familia que trabaja **WP-V16**, y en
el camino que decide si `ArrakisTheater_OperaConfig.json` tiene
consumidor vivo. En `src/core/mcpConfigurationManager.ts:58-65`: ⛔ *(CADUCADA la coordenada, VIVO el defecto: el bloque esta hoy en `src/core/mcpConfigurationManager.ts:42-49` y sigue diciendo `Found sample-config.json` mientras abre `ArrakisTheater_OperaConfig.json`. D16 NO esta corregido — enrutado en §0.6)*

```js
// If no path in settings, look for sample-config.json in workspace
const defaultConfigPath = path.join(workspaceRoot, 'ArrakisTheater_OperaConfig.json');
if (fs.existsSync(defaultConfigPath)) {
    configPath = defaultConfigPath;
    this.logger.info(`Found sample-config.json at: ${configPath}`);
```

El comentario dice `sample-config.json`, el log **afirma** haber
encontrado `sample-config.json`, y lo que se abre es
`ArrakisTheater_OperaConfig.json`. Un operador que lea la salida obtiene
un dato falso sobre qué configuración está cargada. El borrador heredado
citó estas mismas líneas como prueba de que el código vivo busca
`sample-config.json`: la cita señala el sitio correcto y concluye lo
contrario de lo que dice el código.

### D17 · `alephscript.*` son 86 comandos, no «~113» 🔄

Dato de dimensionado que dos documentos vigentes dan mal, y que **V15**
usa para planificar la unificación de prefijos:

- `REPLAN-V-ciudad-zigurat.md` §8: «conviven todavía los **~113 comandos
  `alephscript.*`**».
- `HANDOFF-S-COLA-LIMPIEZA-post-R5V.md` (tabla de V-00): «~113 de ~120
  comandos».

Recuento sobre `contributes.commands` de `package.json`: **115 comandos**
repartidos en `alephscript` **86** · `copilotLogs` **12** · `zigurat`
**7** · `mcpSocketManager` **6** · `ArrakisTheater` **4**. Lo que se
acerca a 113 es el total de prefijos legados (**108** de 115), no
`alephscript.*`. La confusión importa porque V13 poda 16 de esos
comandos por otras filas (12 `copilotLogs.*` de la fila 17 y 4
`ArrakisTheater.*` de la fila 18) antes de que V15 renombre nada.

### D18 · Un fichero de respaldo trackeado y contenido de agentes dentro de `src/`

`git ls-files src | grep -v '\.ts$'` devuelve 17 ficheros. Además de los
esperables (`src/views/README.md`, `src/elenco/DOS-MODELOS.md`,
`src/copilotLogs/config/models-config.json`), aparecen: ⛔ *(CADUCADA: `src/copilotLogs/` fue podado por V13, con su `config/models-config.json`)*

- **`src/theatrical/core/managers/TheatricalAgent.ts.backup`** — un ⛔ *(CADUCADA: `TheatricalAgent.ts.backup` y su `.ts` los podo V13; hoy `src/theatrical/` son 4 ficheros)*
  respaldo manual versionado, del import, junto a su `.ts` vivo-pero-muerto.
- **10 ficheros de contenido de agentes** en `src/theatrical/agents/`
  (`{isaac,don-alvaro,capitan-didac,indra,backend-agent}.agent.md` y sus
  `.config.json`), que son lore ajeno viviendo dentro del código fuente,
  y que **casan con el `filenamePattern` `*.agent.md` de
  `package.json:1446`**. ⛔ *(CADUCADA la coordenada: el manifiesto tiene hoy 1248 lineas y los 10 ficheros de contenido de agentes fueron podados)*
- **3 schemas de teatro** en `src/theatrical/core/schemas/`:
  `agent.schema.json`, `company.schema.json` y `play.schema.json` — los
  valida `validation.ts`, que está en los 19 muertos (D4), así que son
  contrato ajeno sin lector vivo. **No se confundan con `schemas/` de
  primer nivel** (fila re-contenido, cableada en
  `contributes.jsonValidation`): éstos no los referencia el manifiesto.

Enumeración: 3 esperables + `TheatricalAgent.ts.backup` + 10 de contenido
+ 3 schemas = **17**, que cuadra con el recuento. Ninguno cambia el
veredicto de `src/theatrical` (re-contenido), pero son material de poda
que ningún documento había enumerado.

### D19 · La licencia que viaja en el paquete lleva un marcador sin rellenar

Además de lo dicho en D7, `LICENSE.md` **termina** con
`Copyright © [Año] [Nombre del Autor]` — literal, con los corchetes. Es
decir: el `.vsix` publicado como `v0.1.0` viajó con una licencia de broma
**y sin titular**. Refuerza el escalado de §7: no es sólo elegir licencia,
es que la actual no identifica a nadie.

### D20 · `coverage/` es el único camino trackeado-e-ignorado — V17-B queda adjudicado aquí

El hallazgo **V17-B** se cierra por enumeración, no por muestreo:

```
$ git ls-files -i -c --exclude-standard | wc -l
72
$ git ls-files -i -c --exclude-standard | sed 's|/.*||' | sort -u
coverage
```

Las 72 rutas trackeadas que `.gitignore` ignora están **todas** bajo
`coverage/`. No hay un segundo sitio con el mismo problema, así que la
fila de `coverage` en la Tabla A agota el hallazgo. Con el mecanismo de
D8, la instrucción para V13 es completa.

### D21 · La comprobación de procedencia tiene una trampa que la invierte

Documentada con detalle en el aviso de §2. En resumen: bajo Git-Bash,
`git cat-file -e <tag>:<ruta>` falla para toda ruta que empiece por punto
porque MSYS convierte el argumento, y el resultado es que los 10
dotfiles de primer nivel se clasifican como «no legados». Una
re-verificación ingenua obtiene `26/31` legados en vez de `31`, y
concluiría —falsamente— que este censo se equivoca en cinco filas
(`.config`, `.esbuild.config.js`, `.gitignore`, `.vscode`,
`.vscodeignore`, todas ellas legado real). Se anota como divergencia
porque es una divergencia entre *el disco* y *lo que una herramienta
razonable dice del disco*, y porque el contrarrevisor de este WP va a
tropezar con ella si no la lee antes.

### Nota sobre una pista del brief

El brief lista `examples/` entre las entradas «que no aparecen en §2 y
tienes que resolver tú». **No hay `examples/` de primer nivel**: es
`src/examples`, y está resuelto en la Tabla B (poda, módulo muerto). Las
otras cinco pistas —`README-LEGACY-EXTENSION.md`, `INSTALL.md`,
`schemas/`, `media/`, `fixtures/`— sí existen y están resueltas en la
Tabla A, dos de ellas contra lo que su nombre sugiere (`schemas/` y
`media/` están vivas y viajan en el paquete).

---

## 7 · Filas que dependen de una decisión abierta

Ninguna de estas decisiones la cierra este WP. Cada fila tiene veredicto
propuesto y bloqueo nombrado.

| decisión | filas afectadas | qué cambia el cierre |
| -------- | --------------- | -------------------- |
| **DV-11** · chatParticipants heredados | `src/mcpChatParticipant.ts` (poda) · `src/theatrical` (re-contenido, su parte viva) · `package.json` (6 `chatParticipants`) | si sale re-lore en vez de poda, D5 dice que el coste no es cambiar datos sino escribir el lector que hoy está muerto ⛔ *(DV-11 CERRADA en bloque el 2026-07-25 (GO custodio, `plan/DECISIONES.md`): poda ahora, re-lore a wishlist. Ejecutada por V13: `src/mcpChatParticipant.ts` no existe y `chatParticipants` es 0)* |
| **DV-12** · forma de la poda (borrar vs archivar en tag) | las **23** filas con veredicto *poda* | no cambia **ningún** veredicto de este censo: cambia cómo V13 lo ejecuta y qué acta levanta |
| **DV-16 / DV-16.a** · marca y nombres | `package.json` · `README.md` · `media` (los 4 iconos) · `src/config` (claves `zigurat.*`) | V14 y V15 lo ejecutan. Aquí sólo se marca *re-contenido* donde toca; el censo no elige camino (a) ni (b) |

### Los 6 `chatParticipants` de la fila 19, uno por uno (expediente DV-11)

La fila 19 de §2 los trata como un bloque. Para que el custodio decida
sobre datos y no sobre una etiqueta, aquí está cada uno con **quién lo
declara, quién lo crea y si ese creador está vivo**. Veredicto propuesto
para los seis: **poda**, re-lore a wishlist. **Decisión DV-11** — el
censo los marca, no los cierra.

| id (`package.json` · `contributes.chatParticipants`) | lo crea | ¿vivo en el bundle? |
| ---------------------------------------------------- | ------- | ------------------- |
| `mcp-vscode-ext.mcp-assistant` | `src/mcpChatParticipant.ts:77-79` | **sí** ⛔ *(CADUCADA: `src/mcpChatParticipant.ts` fue podado por V13; el participante ya no se declara)* |
| `mcp-vscode-ext.isaac` | `src/theatrical/TheatricalChatManager.ts:45` | **sí** ⛔ *(CADUCADA toda la tabla que sigue: `src/theatrical/TheatricalChatManager.ts` fue podado por V13 y ninguno de los 6 `chatParticipants` existe hoy)* |
| `mcp-vscode-ext.don-alvaro` | `TheatricalChatManager.ts:53` | **sí** |
| `mcp-vscode-ext.capitan-didac` | `TheatricalChatManager.ts:61` | **sí** |
| `mcp-vscode-ext.indra` | `TheatricalChatManager.ts:69` | **sí** |
| `mcp-vscode-ext.backend-agent` | `TheatricalChatManager.ts:77` | **sí** |

Los seis están vivos, pero **no por donde parece**: los cinco ficheros
dedicados `src/theatrical/agents/*ChatParticipant.ts` —los que un lector
supondría responsables— **no entran en el bundle** (D4). Los cinco
personajes salen de un array literal de 45 líneas dentro de
`TheatricalChatManager.ts:42-86` y se despachan con dos `switch` sobre
esos mismos literales (`:175-190` y `:293-317`).

Lo que eso significa para las dos salidas de DV-11:

- **Poda:** retirar `src/mcpChatParticipant.ts`, la parte viva de ⛔ *(EJECUTADO: esta es la salida que se tomo. Nada de lo que enumera existe ya)*
  `src/theatrical` y las 6 entradas de `contributes.chatParticipants`
  — **más su cableado vivo en `src/core/extensionBootstrap.ts`**, que es
  donde se instancian los dos gestores: `:11`, `:57`, `:115`
  (`McpChatParticipant`) y `:12`, `:58`, `:118`
  (`TheatricalChatManager`). Seis puntos de edición en un módulo cuyo
  veredicto es «queda»; sin ellos no compila. Ver §8.
  Los 14 ficheros muertos del módulo (D4) caen sin efecto observable.
- **Re-lore:** el coste **no** es sustituir datos por los del
  `reparto-kit`, porque no hay ningún camino que lea datos: hay literales
  y `switch`. Es escribir el lector que hoy está muerto
  (`ChatParticipantFactory.ts`, D5). El censo no dimensiona ese trabajo;
  sólo hace constar que la fila 19 lo describe como si fuera más barato
  de lo que el disco enseña.

### Escalado al custodio · licencia del producto (D7)

`LICENSE.md` viaja en el `.vsix` y es una licencia declaradamente no
vinculante heredada del legado, con `package.json` apuntando a ella. El
censo la marca **re-contenido** porque no puede quedarse como está, pero
**no propone una licencia**: eso no es decisión de un worker ni cabe en
ninguna DV abierta. Se levanta aquí para que el custodio decida si abre
una decisión nueva antes de que V13/V14 toquen la superficie del
paquete.

---

## 8 · Lo que V13 necesita saber antes de podar

Resumen operativo de las dependencias que el censo ha encontrado. No es
un plan de poda —eso es V13— es la lista de sitios donde borrar una
entrada rompe otra.

| si V13 poda… | tiene que tocar también | evidencia |
| ------------ | ----------------------- | --------- |
| `ArrakisTheater_OperaConfig.json` | `.vscode/settings.json:2-3`, `demo/dummy_workspace/.vscode/settings.json` y `src/core/mcpConfigurationManager.ts:58-65` | las dos primeras citan la ruta; la tercera la abre si existe en el workspace (guardada con `fs.existsSync`: degrada, no rompe) ⛔ *(ACTA: V13 ya podo. El codigo citado vive hoy en `src/core/mcpConfigurationManager.ts:42-49`)* |
| `sample-config.json` | **nada obligatorio.** `HackerConfigPanelProvider.ts:233` la lista, pero contra el workspace y con `fs.existsSync` (D15); `src/mcpTypes.ts:15` sólo la nombra en un comentario | el borrador heredado decía que el panel «ofrecería un fichero inexistente»: **falso**, D15 |
| `theatrical-content/` | `package.json:1446` **y** `:1456` (los dos `customEditors`), `extensionBootstrap.ts:1444,1529,1569,1610,1614`, `AgentConfigEditorProvider.ts:371`, `AgentContentEditorProvider.ts:249`, `HackerConfigPanelProvider.ts:291-293` | convención ajena que sobrevive al borrado — 7 puntos de código y 2 del manifiesto, no los 3+1 del borrador ⛔ *(ACTA: V13 ya podo `theatrical-content/`. Las coordenadas `package.json:1446` y `:1456` caducaron — el manifiesto tiene hoy 1248 lineas y los 2 `customEditors` viven en `:1165` y `:1175`)* ⛔ *(**RE-MEDIDO 2026-08-02 · WP-V101 — y aquí no derivaron las líneas: derivó el INVENTARIO.** Esta fila declara 7 puntos de código con 5 en `extensionBootstrap.ts`; ese fichero tiene hoy **cero** menciones de `theatrical-content`. Los puntos vivos son **12 en 5 ficheros**: `src/core/bootstrap/commands/agentManagementCommands.ts:46` (×5), `src/editors/AgentConfigEditorProvider.ts:373`, `src/editors/AgentContentEditorProvider.ts:251`, `src/views/HackerConfigPanelProvider.ts:352` (×3, tras la reescritura de V102) y `package.json:1114` (×2, ya los dos selectores). **Ningún barrido que sólo re-mida coordenadas habría visto esto**, porque el fallo no es dónde está cada punto sino cuáles son. Anclado por composición —token + recuento por fichero— en `plan/ANCLAS.json` (A3, A5-A8). **Y el veredicto de fondo cambia**: «convención ajena» es falso, la escribe `aleph0.agents.createNew` en el workspace del usuario; ver §0.6·3)* ⛔ *(**PRIMERA DERIVA REAL CAZADA POR EL ANCLA, 2026-08-02**: A8 declaraba `veces: 2` y `WP-V102` reescribió `HackerConfigPanelProvider.ts` **mientras V101 estaba en vuelo**, dejándolo en 3. El gate salió `FAIL (1 rotas)` y con él `npm test` y CI. Re-anclado a 3. No es un ejemplo de laboratorio: es el instrumento haciendo su trabajo contra un cambio que nadie le anunció)* |
| `src/theatrical` | mover `MCPConfiguration` fuera antes: `src/mcpServerManager.ts:4`. **Y la parte viva** (`TheatricalChatManager`) está cableada en `src/core/extensionBootstrap.ts:12` (import), `:58` (campo de `ExtensionContext`) y `:118` (`new TheatricalChatManager`) | rompe la compilación en los cuatro sitios ⛔ *(ACTA: V13 ya podo la parte viva de `src/theatrical`. `src/mcpServerManager.ts:4` SIGUE siendo exacta; `extensionBootstrap.ts:12` no: son hoy 297 lineas y `:12` es el cierre del docblock)* |
| `src/copilotLogs` | **no basta con el manifiesto.** Código vivo: `src/core/extensionBootstrap.ts:41` y `:42` (imports), `:1773` (`registerCopilotLogCommands`), `:1776-1779` (`getCopilotLogExporterService()` + `initialize().catch`), `:1781` (el log nombra «Copilot Log Exporter»). Y además `.vscode/mcp.json` (`localhost:3100`) y los 12 comandos `copilotLogs.*` de `package.json` | **rompe la compilación** de `src/core`, que es módulo «queda». El manifiesto y la config sólo quedan huérfanos ⛔ *(ACTA: V13 ya podo `src/copilotLogs`. Ninguna de las coordenadas de `extensionBootstrap.ts` vale hoy: el fichero paso a 297 lineas)* |
| `src/mcpChatParticipant.ts` | `src/core/extensionBootstrap.ts:11` (import), `:57` (campo de `ExtensionContext`), `:115` (`new McpChatParticipant`) | rompe la compilación de `src/core` ⛔ *(ACTA: V13 ya podo `src/mcpChatParticipant.ts`. Ninguna de las tres coordenadas de `extensionBootstrap.ts` vale hoy)* |
| los 4 comandos `ArrakisTheater.*` (fila 18) | `src/core/configurationCommandsService.ts:256-259` (los 4 `registerCommand`) **y sus dos llamadores**: `extensionBootstrap.ts:21` (import) y `:1770` (`ConfigurationCommandsService.registerCommands`). El fichero entero (**263 líneas**) existe sólo para esos 4 comandos —`:25,80,136,167` los documentan uno a uno— así que la poda lo deja huérfano **dentro de `src/core`, módulo «queda»**. Además `src/core/mcpConfigurationManager.ts:22,28` los cita como cadenas dentro de un `console.log` | §2 fila 18 poda los comandos; nadie había dicho dónde viven ⛔ *(ACTA: V13 ya podo los 4 comandos y `src/core/configurationCommandsService.ts`. En `mcpConfigurationManager.ts:22,28` no queda ningun `console.log` con esos nombres: hoy `:20-25` es el comentario que documenta la poda)* |
| `tests/` (contenido legado) | conservar `tests/setup.ts` y `tests/mocks/`; decidir el `coverageThreshold` | `jest.config.js:23-28,33,36-37` ⛔ *(ACTA: se conservaron `tests/setup.ts` y `tests/mocks/`. El `coverageThreshold` no se bajo: WP-V93 lo retiro entero. Las coordenadas de `jest.config.js` caducaron todas)* |
| `coverage/` | `git rm -r --cached coverage`, no sólo borrar | está en `.gitignore:2` y jest lo regenera ⛔ *(ACTA: ejecutado. `coverage/` esta borrado y destrackeado; `git ls-files -i -c --exclude-standard` da 0. `.gitignore:2` sigue siendo exacta)* |
| `schemas/` | **no podar sin sustituir**: `contributes.jsonValidation` (3 entradas, rutas `./schemas/*` relativas al paquete). `HackerConfigPanelProvider.ts:234-236` está guardado y no cuenta (D15) | §2 fila 16 dice «sustituir» |
| `media/` | **no podar**: sólo los 4 iconos `arrakis-theater-icon*.png` y `ICON_CREATION_GUIDE.md`, en V14 | 18 de 23 ficheros los cargan paneles y editores vivos (17 CSS/JS + `mcp.svg`) |
| `README-LEGACY-EXTENSION.md` | `README.md:13` | único enlace vivo ⛔ *(ACTA: V13 podo el fichero y el enlace de `README.md` desaparecio con V14/V15; `grep -c README-LEGACY README.md` da 0)* |

**Dónde se concentra el arrastre: `src/core/extensionBootstrap.ts`.** Las
tres podas más pesadas (`copilotLogs`, `mcpChatParticipant`, la parte viva
de `theatrical`) más la fila 18 convergen en **un solo fichero de un
módulo cuyo veredicto es «queda»** y que lleva nuestras +173 líneas.
Recuento de puntos de edición vivos, verificados con
`grep -rn` sobre `src/` (no muestreo: todas las referencias del repo):

| poda | puntos en `extensionBootstrap.ts` | otros |
| ---- | --------------------------------- | ----- |
| `src/copilotLogs` | `:41`, `:42`, `:1773`, `:1776-1779`, `:1781` | — |
| `src/mcpChatParticipant.ts` | `:11`, `:57`, `:115` | — ⛔ *(ACTA: ejecutado. `src/mcpChatParticipant.ts` no existe y las coordenadas de `extensionBootstrap.ts` caducaron)* |
| `TheatricalChatManager` | `:12`, `:58`, `:118` | — |
| 4 × `ArrakisTheater.*` | `:21`, `:1770` | `configurationCommandsService.ts:256-259` (+ fichero entero) · `mcpConfigurationManager.ts:22,28` |

**Anomalía encontrada al recontar** (no la tenía ni el censo ni la
contrarrevisión): `extensionBootstrap.ts:42` importa
`CopilotMetricsPanelProvider` **y no lo usa nunca** — el registro real de
la vista `copilotMetrics.panel` ocurre en
`src/copilotLogs/commands.ts:485-488`. Es un import muerto en código ⛔ *(ACTA: ejecutado. `src/copilotLogs/commands.ts` fue podado con el modulo entero)*
vivo; irrelevante para el veredicto, pero V13 debe saber que esa línea se
borra entera y no hay que re-cablear nada detrás.

**Orden de ejecución de la poda** (observación, no cambio de veredicto):
`tests/DonAlvaroValidation.test.ts:11` importa `DonAlvaroChatParticipant` ⛔ *(ACTA: ejecutado. `tests/DonAlvaroValidation.test.ts` fue podado por V13 (`c164731`))*
y `tests/unit/mcpChatParticipant.test.ts:3` importa `McpChatParticipant`. ⛔ *(ACTA: ejecutado. `tests/unit/mcpChatParticipant.test.ts` fue podado por V13 (`f6ae634`))*
Los dos ficheros están en el contenido legado que se va, así que no hay
contradicción — pero **la poda de esos tests tiene que ir en el mismo
commit que la de su código, o antes**, o `compile:tests`
(`tsc -p tsconfig.json`) se cae entre commits. Nota adyacente:
`tests/integration/extensionChatIntegration.test.ts:3` importa ⛔ *(ACTA: ejecutado. `tests/integration/extensionChatIntegration.test.ts` fue podado por V13 (`f6ae634`))*
`ExtensionBootstrap`, así que también acusa las ediciones de la tabla de
arriba.

Y el dato que abarata el resto: los **19 ficheros `.ts` que no entran en
`dist/extension.js`** (D4) se pueden retirar sin que el comportamiento
del paquete cambie, porque ya no estaban dentro. Es el tramo de la
amputación con riesgo más bajo, y es verificable antes de ejecutarla.
Nótese el contraste con lo anterior: **lo muerto sale gratis; lo vivo de
las filas 17, 18 y 19 se paga en `src/core`.**

---

## 9 · Reparto final

| tabla | queda | re-contenido | poda | total |
| ----- | ----- | ------------ | ---- | ----- |
| A · primer nivel | 16 | 7 | 18 | **41** |
| B · módulos de `src/` | 11 | 12 | 5 | **28** |
| **total** | **27** | **19** | **23** | **69** |

De las **23** podas, **18** son entradas de primer nivel del producto
ajeno y **5** son módulos de `src/` (`configEditor.ts`, `copilotLogs`,
`examples`, `mcpChatParticipant.ts`, `statusManager.ts`), tres de ellos
código que ya está muerto en el bundle. Ninguna fila queda sin veredicto
y ninguna queda sin motivo referido a algo comprobable.

**Sobre la revisión de este censo.** El documento se escribió en dos
pasadas por dos trabajadores distintos: la primera dejó el borrador sin
trackear, la segunda lo verificó entero contra el disco. De las 69 filas,
**8 llevan evidencia corregida** y **2 de esas correcciones invalidaban
la prueba que el borrador daba** (D15 y D16). **Ningún veredicto cambió**:
las 8 correcciones afectan al motivo, a la fuente o al alcance del
arrastre, no a la columna «queda / re-contenido / poda». El reparto de
arriba es, por tanto, el mismo que proponía el borrador, pero ahora
sostenido por comprobaciones que se han ejecutado. El detalle de qué se
corrigió está en `plan/REPORTES/WP-V12-censo-veredicto.md`.

**Este documento no ha borrado nada.** V13 ejecuta.

---

## Errata post-fusión (asentada por el orquestador · 2026-07-25)

Dos correcciones surgidas de la ejecución (V13) y su contrarrevisión;
los veredictos no cambian:

1. **Celda `.vsix` de `media` (fila :129): viajan 23 de 23**, no 22
   — verificado con `unzip -l` sobre el paquete real. El «22 de 23»
   venía del punto 3 de la contrarrevisión de V12 (glob razonado, no
   mirado). Lección: la columna `.vsix` se verifica contra paquete,
   no contra `.vscodeignore`.
2. **§8, arrastre de DV-11: son 11 puntos en `extensionBootstrap.ts`,
   no 6** (faltaban `:199,:200` literales del objeto, `:231` llamada
   por campo, `:2170,:2173` dispose) — total real de arrastre vivo
   **25 puntos, no 20**. Causa: grep por nombres de clase no ve
   literales ni llamadas por campo. V13 los ejecutó todos (DISC-1,
   contrarrevisión `78fee64` los confirmó al carácter); esta errata
   deja el método corregido para las olas siguientes.

