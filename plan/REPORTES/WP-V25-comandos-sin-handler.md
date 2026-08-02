# REPORTE · WP-V25 · Comandos que prometen lo que no hacen

| dato | valor |
| ---- | ----- |
| agente | worker-V |
| fecha | 2026-08-02 |
| rama | `wp/v25-comandos-sin-handler` · worktree `C:/S_LAB/wt/v-v25` |
| base | `342ce5e` — tip al arrancar |
| tipo de WP | **defecto** (algo prometido que no responde) + **gate** (que no vuelva) |
| ALCANCE_DIFF | `package.json` (comandos) · `src/core/bootstrap/commands/**` y sus tests · este reporte · **+1 excepción firmada**: `scripts/cobertura.suelo.json` (§7) |

---

## 0 · Resumen en una tabla

| eje | antes (`342ce5e`) | después |
| --- | ----- | ------- |
| entradas en `contributes.commands` | **99** | **91** |
| ids únicos declarados | **98** | **91** |
| ids con handler registrado | **72** (56 tabla V80 + 16 paleta) | **93** (77 tabla + 16 paleta) |
| **declarados SIN handler** | **31** | **0** |
| registrados sin declarar | **5** | **2**, con motivo escrito (§4.3) |
| ids declarados dos veces | **1** (`aleph0.analytics.export`) | **0** |
| referencias de menús/atajos a comandos no declarados | 0 | **0** |
| gate automático que lo vigile | **ninguno** | **20** tests, `npm test` (§4) |
| tests de `src/core/bootstrap/commands/**` | **0** desde V80 | **20** |
| suite jest | 429 · 428 pass · 1 skip · 0 fail | **449 · 448 pass · 1 skip · 0 fail** |
| conjunto de rojos por nombre | baseline | **IDÉNTICO** (§8) |
| arnés Extension Host (VS Code real) | «31/99 contribuidos NO registrados» (V68) | **«todos los comandos contribuidos están registrados»** · 0 fallos (§8.1) |

**La cifra de la ficha era correcta: 31.** El troceo de V80 no la movió, porque
V80 movió el registro de sitio sin añadir ni quitar ids. Lo que sí estaba mal
era el método de conteo con el que se dudó de ella (§1.1).

---

## 1 · El censo, con denominador y con método

### 1.1 · Por qué `grep '"command":'` da 158 y por qué eso no es un número

`"command"` es clave en **cuatro** sitios de `contributes`: `commands`,
`menus` (cada fila de menú apunta a un comando), `keybindings` y los propios
`treeItem.command` que el código pone en runtime. Contar la clave suelta mezcla
la **declaración** con sus **usos**. El denominador correcto es la longitud del
array `contributes.commands`, y se obtiene parseando el JSON, no rascando texto.

**El otro lado del cruce también tenía trampa, y es el hallazgo de método de
este WP:** contar los registros leyendo sólo `commandTable`
(`src/core/bootstrap/commands/index.ts`) da **56** y es igualmente falso.
`CommandPaletteManager` (`src/commandPaletteManager.ts:225`) llama a
`vscode.commands.registerCommand` **desde su propio constructor** y registra
**16 comandos más** que no pasan por la tabla. El propio `index.ts` afirmaba
—cita rancia— que «ningún módulo registra por su cuenta». Corregido en el
fichero, y el censo automático cruza **las dos fuentes**.

### 1.2 · El censo medido

Reproducible sobre el árbol base sin necesidad de checkout (`git show HEAD:…`):

```
ANTES (HEAD=342ce5e)
  entradas declaradas: 99   ids únicos: 98
  registrados: tabla 56 + paleta 16 = 72
  declarados SIN handler: 31
  registrados SIN declarar: 5
  duplicados: aleph0.analytics.export  (índices 48 y 93 del array)
```

**Denominador: 98 ids únicos declarados. 67 tenían handler. 31 no.**

**Corroboración independiente, y no es mía.** Dos WPs anteriores midieron lo
mismo y lo dejaron escrito:

- `plan/REPORTES/WP-V15-espacios-nombres.md:199-226` — 31 y los mismos 5, más
  `aleph0.logs.showEntry`. Medido estáticamente.
- `plan/REPORTES/WP-V68-arnes-exthost.md:169-190` — 31 de 99 y los mismos 5,
  **medidos de facto dentro de un VS Code real** con
  `vscode.commands.getCommands()`. V68 lo llamó «candidato directo a WP-V72».

Tres medidas por tres métodos distintos coinciden en la lista **exacta**. La
ficha de V25 no había caducado.

### 1.3 · Los 31, y por qué esto se ve

Nueve de ellos no son adorno de paleta: **son el destino de un clic o de una
llamada que ya existe en el código**, así que hoy no producen «no pasa nada»
sino el error crudo *«command 'x' not found»*:

| id sin handler | quién lo invoca hoy | qué ve el usuario |
| --- | --- | --- |
| `aleph0.configs.openInEditor` | `src/treeViews/configsTreeView.ts:313` — `treeItem.command` de **cada** fichero del árbol de configuraciones | clic normal en una config → error |
| `aleph0.showStatusPanel` | `src/commandPaletteManager.ts:289` | `aleph0.systemStatus` (con entrada de paleta) muere |
| `aleph0.sockets.connect` | `src/commandPaletteManager.ts:372` | `sockets.quickConnect` (**atajo `ctrl+alt+c`**) muere |
| `aleph0.sockets.disconnect` | `src/commandPaletteManager.ts:380` | `sockets.disconnectAll` muere |
| `aleph0.logs.showChannel` | `src/commandPaletteManager.ts:406` | `logs.showMainChannel` (**atajo `ctrl+alt+l`**) muere |
| `aleph0.logs.clear` | `src/commandPaletteManager.ts:411` | `logs.clearAndRestart` muere |
| `aleph0.mcpSocketManager.openConfigEditor` | `src/views/HackerControlPanelProvider.ts:243` | botón «MCP Config» del panel hacker muere |
| `aleph0.uis.start` / `.stop` / `.openBrowser` | `contributes.menus.view/item/context` de `alephscript.uis` | botones inline del árbol de UIs no hacen nada |
| `aleph0.logs.*` (6) + `aleph0.configs.*` (5) + `aleph0.sockets.*` (3) | `contributes.menus` de las vistas `alephscript.logs` / `.configs` / `.sockets` | barra de título y menús contextuales muertos |

Es decir: **cuatro comandos que sí tenían handler estaban rotos** porque
llamaban a uno que no lo tenía, y dos de ellos con atajo de teclado.

### 1.4 · Una tercera clase que el brief no pedía y que apareció al censar

`aleph0.logs.showEntry` **no estaba declarado ni registrado**, y sin embargo
`src/treeViews/logsTreeView.ts:64` lo pone como `treeItem.command` de **cada
entrada de log**. Clicar una línea del panel de logs levantaba «command not
found». No cuenta en los 31 (no estaba declarado), pero es el mismo defecto y
se cierra aquí (§3.3).

---

## 2 · El id duplicado: **confirmado, es exactamente uno**

`aleph0.analytics.export`, en los **índices 48 y 93** del array
`contributes.commands`. No hay ningún otro id repetido — ni antes ni después.

Las dos filas, literales:

```jsonc
// índice 48  ·  bloque RANCIO
{ "command": "aleph0.analytics.export",
  "title": "Alephscript: Export Analytics Data", "category": "Analytics" }

// índice 93  ·  bloque VIVO
{ "command": "aleph0.analytics.export",
  "title": "Export Analytics Data", "category": "AlephScript Analytics",
  "icon": "$(export)" }
```

**Orden y veredicto.** No son dos comandos: son dos generaciones del mismo. El
índice 48 pertenece a un bloque de dos filas (47 `analytics.view` + 48
`analytics.export`) con el prefijo de título `Alephscript: ` y categoría
`Analytics`; el índice 92-94 es el bloque actual de tres filas
(`showDashboard`, `export`, `clear`) con categoría `AlephScript Analytics` e
iconos. En la paleta, el título 48 se renderizaba «*Analytics: Alephscript:
Export Analytics Data*» — el tartamudeo delata la fila vieja.

**Se retira el índice 48** (y con él, su hermana 47 `analytics.view`, que era
un declarado-sin-handler del mismo bloque: lo que prometía lo cumple
`analytics.showDashboard`, que sí tiene handler). Sobrevive la fila 93.

---

## 3 · Los 31, resueltos por una de dos vías y ninguna otra

**20 reciben handler desde capacidad ya existente · 11 se retiran con acta.**
Cero handlers vacíos: cada uno de los 20 llama a un método público que ya
estaba escrito, y los cuatro que no pueden actuar sin argumento (`joinRoom`,
`leaveRoom`, `sendMessage`, `validate`…) **dicen por qué** con un mensaje, en
vez de callar.

### 3.1 · Vía A — handler desde el catálogo (20)

| # | id | capacidad que ya existía | dónde |
| -- | -- | -- | -- |
| 1 | `aleph0.sockets.connect` | `SocketsTreeDataProvider.connectToServer(url?)` | `src/treeViews/socketsTreeView.ts:226` |
| 2 | `aleph0.sockets.disconnect` | `.disconnectFromServer()` | `:251` |
| 3 | `aleph0.sockets.joinRoom` | `.joinRoom(room)` | `:258` |
| 4 | `aleph0.sockets.leaveRoom` | `.leaveRoom(room)` | `:269` |
| 5 | `aleph0.sockets.sendMessage` | `.sendTestMessage(room)` | `:280` |
| 6 | `aleph0.configs.openInEditor` | `workspace.openTextDocument` + `window.showTextDocument` | API de VS Code |
| 7 | `aleph0.configs.validate` | `ConfigsTreeDataProvider.validateConfiguration(path)` | `src/treeViews/configsTreeView.ts:369` |
| 8 | `aleph0.configs.format` | `.formatConfiguration(path)` | `:420` |
| 9 | `aleph0.configs.backup` | `.createBackup(path)` | `:410` |
| 10 | `aleph0.configs.createTemplate` | `.createFromTemplate('xplus1'\|'socket'\|'ui')` | `:434` |
| 11 | `aleph0.configs.reload` | `.reloadConfiguration(path)` | `:400` |
| 12 | `aleph0.logs.refresh` | `LogsTreeDataProvider.refresh()` | `src/treeViews/logsTreeView.ts:262` |
| 13 | `aleph0.logs.clear` | `.clearLogs()` | `:253` |
| 14 | `aleph0.logs.export` | `.exportLogs()` | `:258` |
| 15 | `aleph0.logs.toggleAutoRefresh` | `.toggleAutoRefresh()` | `:218` |
| 16 | `aleph0.logs.toggleGroupByCategory` | `.toggleGroupByCategory()` | `:229` |
| 17 | `aleph0.logs.toggleErrorsOnly` | `.toggleErrorsOnly()` | `:234` |
| 18 | `aleph0.logs.setLogLevel` | `LoggingManager.setLogLevelFromString(level)` | `src/loggingManager.ts:126` |
| 19 | `aleph0.logs.showChannel` | `LoggingManager.showChannel(cat\|'main')` | `src/loggingManager.ts:232` |
| 20 | `aleph0.showStatusPanel` | `deps.showSystemStatus()` — el mismo destino que `aleph0.system.showStatus` | `src/core/bootstrap/commands/types.ts` |

El nº 20 es **mixto y se dice**: recibe handler **y se retira de lo declarado**.
Motivo: es un alias heredado de `aleph0.system.showStatus`; dejarlo contribuido
pondría dos entradas de paleta con el mismo título para el mismo panel. Pero
retirarlo entero era imposible: `commandPaletteManager.ts:289` lo invoca, y sin
handler `aleph0.systemStatus` seguiría muriendo. Queda **registrado y no
declarado**, con motivo escrito en `REGISTRO_INTERNO` (§4.3) y con el
follow-up que lo mata del todo (§6).

Los 19 restantes conservan su fila en `contributes.commands` tal cual estaba:
mismo id, mismo título, mismo icono. **Ninguna promesa nueva.**

### 3.2 · Vía B — retirados, con acta (11)

| id | por qué se declaró | por qué se retira |
| --- | --- | --- |
| `aleph0.mcpSocketManager.openConfigEditor` | familia del producto anterior (`mcpSocketManager.*`), la que V23 demolió en `contributes.configuration` y nadie demolió en comandos | **no existe la capacidad**: `McpConfigurationManager` expone `initialize` / `reloadConfig` / `updateVSCodeSettings` / `saveConfiguration` / `updateConfiguration` — ningún «abrir editor». Darle handler sería inventar una pantalla |
| `aleph0.mcpSocketManager.startLauncher` | nombre viejo del arranque del launcher | **ya existe con handler** bajo el nombre nuevo: `aleph0.process.startLauncher`. Dos ids, una cosa. Se retira el muerto y **se declara el vivo** (§3.4) |
| `aleph0.mcpSocketManager.stopLauncher` | ídem | ídem con `aleph0.process.stopLauncher` |
| `aleph0.mcpSocketManager.manageUIs` | pantalla «UI Manager» del producto anterior | la capacidad **existe** (`UIManager.showUIManager()`, público) pero `uiManager` es una **variable local de `assembleContext.ts:65`** y no está en `ExtensionContext`; alcanzarla desde `commands/**` exige tocar `context.ts` y `assembleContext.ts`, fuera del ALCANCE_DIFF. **Retirado, no perdido**: follow-up F-2 (§6) |
| `aleph0.mcpSocketManager.manageMCPServers` | ídem, para servidores | redundante y sin cable: lo que prometía lo cubre hoy la vista `alephscript.mcptree` con `mcptree.start` / `.stop` / `.web.open`, los tres declarados **y** registrados |
| `aleph0.uis.start` | botón inline del árbol de UIs | `UIManager.startUI()` es **privado** (`src/uiManager.ts:108`), sólo alcanzable desde el webview del UI Manager. Follow-up F-3 |
| `aleph0.uis.stop` | ídem | `UIManager.stopUI()` privado (`src/uiManager.ts:191`). Follow-up F-3 |
| `aleph0.uis.openBrowser` | ídem | la apertura de navegador vive dentro de un método privado (`src/uiManager.ts:220`). Follow-up F-3 |
| `aleph0.refreshStatus` | pareja de `showStatusPanel` en el bloque «AlephScript» heredado | **cero consumidores**: no aparece en `src/`, ni en `menus`, ni en `keybindings`, y no hay capacidad «refrescar estado» separada del panel. Nadie lo echa de menos porque nadie lo llama |
| `aleph0.analytics.view` | mitad huérfana del bloque rancio de analytics (índices 47-48) | lo que prometía lo cumple `aleph0.analytics.showDashboard`, que **sí** tiene handler y está declarado con icono. Ver §2 |
| `aleph0.mcptree.stopAll` | **error de id**: se declaró como `mcptree.*` una fila cuyo título es «>>> Shutdown Agent Matrix», cuya categoría es «🤖 Agent Matrix» y que está escrita **justo detrás de `aleph0.agents.startAll`** | no es un comando de mcptree: es el gemelo de `agents.startAll`. Y el gemelo correcto **existe con handler** en `CommandPaletteManager` (`stopAllAgents()`) y no estaba declarado. Se **corrige el id de la fila** a `aleph0.agents.stopAll`, conservando título, categoría e icono |

**Tres retiradas arrastran menú.** `aleph0.uis.start` / `.stop` / `.openBrowser`
tenían fila en `contributes.menus.view/item/context`. Se retiran también esas
tres filas: dejar un menú apuntando a un comando inexistente sería la misma
mentira en otro sitio. Es la única salida de este WP del literal «sección de
comandos» de `package.json`, y va dentro del mismo fichero y del mismo defecto.
La vista `alephscript.uis` conserva su `aleph0.uis.refresh`, que funciona.

### 3.3 · La tercera clase (`logs.showEntry`), cerrada

Recibe handler (`LogsTreeDataProvider.showLogEntry(entry)`, que ya existía en
`src/treeViews/logsTreeView.ts:266`) y **no** se declara: VS Code no exige
contribuir los comandos que sólo son `treeItem.command`, y en la paleta —sin
entrada seleccionada— no tendría sentido. Queda en `REGISTRO_INTERNO` con
motivo. Invocado sin argumento, dice qué hacer en vez de callar.

### 3.4 · Los 5 registrados sin declarar, resueltos

| id | resolución |
| --- | --- |
| `aleph0.process.startLauncher` | **declarado** (título «Start Launcher», categoría «AlephScript») — ocupa el hueco de `mcpSocketManager.startLauncher` |
| `aleph0.process.stopLauncher` | **declarado** — ídem |
| `aleph0.system.showStatus` | **declarado** («Show System Status Panel») — ocupa el hueco de `showStatusPanel` |
| `aleph0.system.restart` | **declarado** («Restart Extension») |
| `aleph0.agents.stopAll` | **declarado** corrigiendo el id de la fila `mcptree.stopAll` (§3.2) |

Esto **suma capacidad visible sin añadir código**: cinco cosas que ya
funcionaban y que el usuario no podía encontrar.

### 3.5 · Cuadre aritmético

```
declarados 99 − 11 retirados − 1 duplicado + 5 declarados nuevos = 92
                                      − 1 (showStatusPanel, pasa a interno) = 91
registrados  56 tabla + 16 paleta = 72
           + 19 vía A + 1 showStatusPanel + 1 logs.showEntry = 93   (77 tabla + 16 paleta)
declarados 91 + REGISTRO_INTERNO 2 = 93   ✔ biyección
```

---

## 4 · El gate

`tests/unit/core/bootstrap/commands/censoComandos.test.ts` — **20 tests, corre
con `npm test`**, y por tanto en el paso que CI marca BLOQUEA.

### 4.1 · De dónde saca los datos

- **Declarados**: parsea `package.json` y recorre `contributes.commands`. No
  hay grep.
- **Registrados**: **importa** `commandTable` (el módulo, no su texto) e
  **instancia** `CommandPaletteManager` — cuyo constructor *es* quien registra —
  y lee `getAllCommands()`. Las dos fuentes.

Nada inferido: si mañana alguien añade una tabla nueva al índice, el gate la ve
sin tocarlo.

### 4.2 · Los vectores plantados

El instrumento es una función pura, `censar(declarados, tabla, paleta)`, y el
punto por el que se pone rojo es `exigirCensoLimpio(censo)`. **El censo real y
los vectores plantados pasan por el MISMO camino** — no hay un gate para el
repo y otro de mentira para el test.

| vector | qué se planta | qué exige el test |
| --- | --- | --- |
| **dirección 1** | `aleph0.vector.fantasma` en los declarados | `sinHandler == ['aleph0.vector.fantasma']` y `exigirCensoLimpio` lanza con `/DECLARADOS SIN HANDLER \(1\)/` |
| **dirección 2** | `aleph0.vector.mudo` en los registrados | `sinDeclarar == ['aleph0.vector.mudo']` y lanza con `/REGISTRADOS SIN DECLARAR \(1\)/` |
| **dirección 2, excepción** | el mismo, pero listado en `REGISTRO_INTERNO` | **no** lanza |
| **dirección 2, exención sin motivo** | el id en `REGISTRO_INTERNO` con motivo `''`, `'   '`, `undefined` o `null` | **lanza igual**: la exención pide motivo, no llave (§10 ②) |
| **dirección 2, prototipo** | ids `toString`, `constructor`, `hasOwnProperty` | lanzan: `Object.prototype` no regala exenciones (§10 ②) |
| duplicado | un id declarado dos veces | lanza con `/por duplicado/` |
| colisión entre fuentes | mismo id registrado por tabla **y** paleta | lanza con `/DOS VECES/` (VS Code revienta al activar) |
| **colisión dentro de la paleta** | mismo id dos veces en `CommandPaletteManager` | lanza (§10 ①) |
| **colisión dentro de la tabla** | mismo id dos veces en `commandTable` | lanza |
| **ancla de la medida** | se registra dos veces por la API pública real del manager | el **host ve 2 llamadas** y el **Map ve 1**: por eso la medida espía `registerCommand` y no lee `getAllCommands()` (§10 ①) |
| **anti-verde-de-adorno** | `contributes.commands` **vacío** | el censo sale limpio por la dirección 1 y **aun así lanza**, porque los 93 registrados quedan sin declarar. Un gate que compara dos listas vacías no vigila nada |

### 4.3 · Dirección 2: qué decidí que pase, y por qué no es simétrica

**Declarado sin handler → ROJO siempre, sin excepción posible.** Es la
dirección que miente al usuario.

**Registrado sin declarar → ROJO también, salvo que el id esté en
`REGISTRO_INTERNO` con motivo escrito.** Esta dirección no promete nada a
nadie, pero esconde: un comando que nadie declara es invisible en la paleta.
Hay un uso legítimo —el `treeItem.command` de un ítem de árbol, que VS Code no
exige contribuir— y por eso la excepción existe. Existe **como lista con
nombre y motivo**, de modo que añadir una es una línea de diff que alguien
firma; es el mismo mecanismo que el suelo del trinquete de cobertura.

Hoy tiene exactamente **dos** entradas, las dos con su follow-up para morir:

```
aleph0.logs.showEntry   → treeItem.command de logsTreeView.ts:64
aleph0.showStatusPanel  → alias que invoca commandPaletteManager.ts:289
```

### 4.4 · Lo que hubo que sortear para importar `commandTable`, dicho en voz alta

**Ninguna prueba de este repo importaba `src/core/bootstrap/commands/` — la
tabla de V80 llevaba desde entonces sin un solo test**, y no por descuido: al
importarla, ts-jest tumbaba la suite entera. Dos causas, las dos deuda ajena a
este WP:

1. Los **tres ficheros que no compilan** (TS2353 contra los tipos del SDK de
   MCP), ya declarados con nombre en `scripts/cobertura.suelo.json` →
   `censo.NO-COMPILA`. `mcpDomainCommands.ts` los arrastra vía
   `CatalogService` / `AuthorshipService` / `ResourceProjectionService`.
2. Dos paquetes **ESM puros** (`@zeus/protocol`, `@zeus/reparto-kit`) que jest,
   configurado en CJS, no sabe parsear.

Se sortean con **cinco `jest.mock` de fábrica** en la cabecera del test, cada
uno comentado. Fábrica y no automock: así jest ni carga el módulo, y ts-jest no
lo transforma. **No falsean la medida**: ninguna de esas clases se instancia al
cargar, y lo que el test lee son `entry.id` y que `entry.handler(deps)` fabrique
una función. Si algún día compilan y el bundler acepta ESM, borrar esas cinco
líneas no cambia ni un id del censo.

### 4.5 · El otro gate que ya existía, y qué pasa con él

`tests/exthost/suite/index.js:118-130` **ya medía esto de facto** dentro de un
VS Code real, y por eso V68 pudo listar los 31. Pero está en **AVISO** por
defecto: sólo falla con `EXTHOST_STRICT=1`, precisamente porque cuando se
escribió había 31 y habría dejado el arnés en rojo perpetuo.

**Ese motivo ya no existe.** Con V25 el conjunto `sinRegistrar` es vacío, así
que ese paso puede pasar a `ko()` sin escape. **No lo cambio**: `tests/exthost/`
está fuera del ALCANCE_DIFF y no debo tocar el arnés de otro WP. Queda como
follow-up **F-1** (§6), que es un cambio de una línea.

---

## 5 · CA5 · Cero regresión visible

### 5.1 · La tabla de 56 de V80, demostrada equivalente

Sí toqué la tabla. La equivalencia **se demuestra, no se afirma**, con dos
tests:

- **«los 56 ids de V80 siguen ahí»** — los 56 literales, escritos en el test,
  y ninguno falta.
- **«los 56 ids de V80 conservan su orden relativo exacto»** — se filtra
  `commandTable` a esos 56 y se compara con la lista literal:
  `expect(soloLos56).toEqual(LOS_56_DE_V80)`. V25 sólo **inserta** filas; no
  reordena ninguna. Es una comprobación de subsecuencia, que es exactamente la
  propiedad que hay que conservar.

La tabla nueva (`logsCommands`) va **al final** del índice a propósito, para no
mover nada. Las inserciones en `socketCommands` y `configsCommands` van detrás
de sus `*.refresh` respectivos.

Además: **«la tabla no repite ningún id»** y **«ningún id se registra por dos
fuentes a la vez»** — una colisión tabla↔paleta haría que
`registerCommand` lanzara al activar la extensión, que es una regresión mucho
peor que un comando muerto.

### 5.2 · Lo que sigue igual

- Los 19 comandos de la vía A conservan **id, título, categoría e icono**
  exactos de su fila original. Lo único que cambia es que ahora responden.
- Los 4 comandos que hoy funcionan y estaban rotos por llamar a un ausente
  (`systemStatus`, `sockets.quickConnect`, `logs.showMainChannel`,
  `logs.clearAndRestart` — dos con atajo) **dejan de estar rotos**. Es mejora,
  no regresión.
- `npm run compile:production` verde. `eslint src` **0 errores** (**192** avisos
  preexistentes de estilo; los `any` que añado siguen el idioma ya establecido
  en `mcpDomainCommands.ts` y `teatroCommands.ts` para los ítems de árbol).
- Suite: **0 fallos**, conjunto de rojos por nombre **idéntico** al baseline.

---

## 6 · Qué NO cubro (léase entero antes de aceptar)

1. **La utilidad de los handlers. Vigilo el cable, no lo que hay al otro
   lado.** Y el número exacto, porque decirlo de pasada sería el mismo vicio
   que este WP persigue: **5 de los 20 cableados — el 25 %** — no llegan a
   ningún socket. Son los cinco de `SocketsTreeDataProvider`, y **`socketMonitor`
   no se invoca ni una vez en todo el fichero** (`grep 'socketMonitor\.'` →
   cero). Cuatro llevan el sello literal *«Would use SocketMonitor.X() in real
   implementation»*: `connectToServer` (:239, llama a `simulateConnection()`),
   `joinRoom` (:264), `leaveRoom` (:275) y `sendTestMessage` (:292, que
   **construye el objeto `message` y no lo usa jamás**). El quinto,
   `disconnectFromServer`, no lleva comentario pero tampoco habla con nadie:
   baja un campo local y anuncia «Disconnected from Socket.IO server».

   **Los cinco le afirman al usuario haber hecho algo que no hicieron** —
   «Connected to…», «Joined room:», «Test message sent to room:»— y desde V25
   son alcanzables desde el menú contextual del árbol y, vía
   `sockets.quickConnect`, desde **`ctrl+alt+c`**. Antes eran inalcanzables. Es
   otra ficha, pero el saldo hay que decirlo entero: este WP cambia «no
   responde» por «responde una simulación» en el 25 % de lo que cablea. **Los
   otros 15 sí delegan en capacidad real**, método a método.
2. **`src/commandPaletteManager.ts` no se toca** (fuera del ALCANCE_DIFF). Sus
   16 comandos se **miden** pero no se auditan. Que registre por su cuenta,
   fuera de la tabla que V80 creó para centralizar, es deuda estructural viva.
3. **El botón «MCP Config» del panel hacker sigue roto.**
   `HackerControlPanelProvider.ts:243` invoca
   `aleph0.mcpSocketManager.openConfigEditor`, que retiro. Antes de V25 fallaba
   igual (el comando estaba declarado pero sin handler); después de V25 falla
   igual. **No mejora y no empeora, pero no lo arreglo**, y `src/views/` está
   fuera de alcance. Follow-up F-4.
4. **`contributes.menus` sólo se toca donde apuntaba a un comando retirado**
   (3 filas de `uis.*`). No he auditado si las **37** referencias de menú
   restantes tienen sentido de UX; sólo que apuntan a comandos declarados.
5. **No he comprobado que cada comando haga lo que su título dice.** El gate
   comprueba que exista handler, no que el handler corresponda al título.
6. **El único efecto DESTRUCTIVO que este WP hace alcanzable, dicho por su
   nombre: `aleph0.configs.format`.** Estaba declarado, con fila de menú y sin
   handler: no hacía nada. Ahora llama a
   `ConfigsTreeDataProvider.formatConfiguration`, que hace `readFile` →
   `JSON.parse` → `JSON.stringify(…, null, 2)` → **`writeFile` sobre el fichero
   original, sin confirmación y sin copia** (`src/treeViews/configsTreeView.ts:420`).
   Y el árbol escanea `**/package.json` y `**/tsconfig.json` (`:54-55`), que
   casan el `when` del menú (`viewItem =~ /^configFile/`). O sea: reformatea el
   `package.json` del usuario a dos espacios de un clic.
   **No es regresión** —la capacidad y la fila de menú son anteriores a V25, y
   §6.1 declara que no cubro la utilidad del handler— pero un reporte que
   nombra hasta el tartamudeo de un título tiene que nombrar esto.
   Hermano menor: `configs.backup` deja ficheros `.backup.<epoch>` sueltos
   junto al original, sin entrada en `.gitignore`.
   **No toco `configsTreeView.ts`**: me sacaría del alcance y abre el debate de
   confirmación y deshacer, que es otra ficha.
7. **El arnés de Extension Host no se ha endurecido** (§4.5, F-1). Sí se ha
   **corrido**, y sale verde con el cruce limpio (§8.1); lo que no he hecho es
   quitarle el escape `EXTHOST_STRICT`, que está fuera de mi alcance.
8. **Sólo he corrido el arnés en modo `source`**, no `test:exthost:vsix` (que
   exige empaquetar). El manifiesto es el mismo fichero en los dos modos.

**Follow-ups nombrados** (no los abro yo; los dejo escritos con su cambio
exacto):

| id | qué | dónde |
| -- | --- | ----- |
| **F-1** | `sinRegistrar.length > 0` pasa de `aviso()` a `ko()` sin `EXTHOST_STRICT` | `tests/exthost/suite/index.js:125-129` |
| **F-2** | exponer `uiManager` en `ExtensionContext` y devolver `manageUIs` | `bootstrap/context.ts` + `assembleContext.ts:65` |
| **F-3** | hacer públicos `startUI` / `stopUI` / apertura de navegador y devolver los 3 `uis.*` | `src/uiManager.ts:108,191,220` |
| **F-4** | que `HackerControlPanelProvider` apunte a un comando vivo | `src/views/HackerControlPanelProvider.ts:243` |
| **F-5** | que `commandPaletteManager` llame a `aleph0.system.showStatus` y muera `showStatusPanel` | `src/commandPaletteManager.ts:289` |
| **F-6** | mover los 16 comandos de la paleta a la tabla de V80 y vaciar `REGISTRO_INTERNO` a 1 | `src/commandPaletteManager.ts` |

---

## 7 · El suelo de cobertura se mueve, y lo firmo

**Excepción declarada al ALCANCE_DIFF**, prevista por el brief: *«si tu cambio
mueve la cobertura, el suelo se mueve con una línea de diff que alguien firma,
y tú lo declaras en el reporte»*.

```
statements 1541 → 1816      functions 272 → 352
lines      1519 → 1780      branches 546 → 547   (+1, explicada en §10)
```

**Qué lo movió**: nada de lo que este WP haya escrito como test de
comportamiento. Lo movió que, por primera vez, **un test importa
`src/core/bootstrap/commands/`**; al importarlo se ejecutan las declaraciones
de módulo de las once tablas y de lo que arrastran. **Las ramas no se mueven**
—546 → 546— y eso es la comprobación de que la lectura es correcta: la
ramificación vive en los **cuerpos** de los handlers, que el test fabrica y no
invoca.

El suelo **sube**, no se ablanda: con 1813 declarado, el informe que ayer
pasaba con 1541 hoy se rechaza. El `censo` de ficheros ausentes **no se toca**:
siguen siendo los mismos 9 (6 `TIPOS` + 3 `NO-COMPILA`);
`logsCommands.ts`, que este WP crea, entra en el mapa.

La firma queda dentro del propio fichero, en
`scripts/cobertura.suelo.json` → `firma_del_ultimo_movimiento`.

> **Aviso al orquestador**: hay otros worktrees vivos. Si alguno mueve también
> el suelo, esto conflicta en la fusión y hay que **re-medir**, no elegir un
> lado.

---

## 8 · Evidencia

Todo con `--coverage=false` salvo la corrida instrumentada, que el trinquete
exige. Todos los procesos caros por `scripts/slot.sh run`.

| # | comando | resultado |
| - | ------- | --------- |
| 1 | `node scripts/rojos-jest.mjs --gate` **antes de tocar nada** (HEAD `342ce5e`) | exit 0 — «conjunto de rojos IDENTICO al declarado» |
| 2 | `jest tests/unit/core/bootstrap/commands --coverage=false` | **20/20 PASS** |
| 3 | `eslint src --ext ts` | **0 errores**, **192** avisos (preexistentes) |
| 4 | `npm run compile:production` | OK · `dist/extension.js` 718.1 kb |
| 5 | `node scripts/rojos-jest.mjs --gate` **después** | exit 0 — «conjunto de rojos IDENTICO al declarado» |
| 6 | `jest` instrumentado | **13 suites · 449 tests · 448 pass · 1 skip · 0 fail** |
| 7 | `node scripts/cobertura-trinquete.mjs` | primero **rechazó** («la cobertura SUBIÓ y el suelo no lo recoge»); tras firmar el suelo, «censo COMPLETO y unidades cubiertas EN EL SUELO declarado» |
| 8 | censo «antes» reproducible desde `git show HEAD:…` | 99/98 · 72 registrados · **31** sin handler · 5 sin declarar · 1 duplicado |
| 9 | `npm run test:exthost` (VS Code 1.131.0 real) | **arnés VERDE** · 0 fallos · 1 aviso · «todos los comandos contribuidos están registrados» (§8.1) |

El paso 7 merece un renglón: **el trinquete falló primero, en la dirección
«subió»**, y por eso el suelo se movió con una firma en vez de a escondidas.
Es el instrumento haciendo su trabajo, no un tropiezo.

### 8.1 · Arnés de Extension Host — la prueba de facto, dentro de un VS Code real

`npm run test:exthost` (modo `source`, VS Code **1.131.0**, Windows) —
**arnés VERDE, exit 0, 0 fallos · 1 aviso**. Acta literal:

```
[exthost:suite] comandos contribuidos en manifiesto: 91
[exthost:suite] comandos aleph0.* registrados de facto: 93
[exthost:suite] PASS  todos los comandos contribuidos están registrados
[exthost:suite] AVISO 2 comandos aleph0.* registrados SIN fila en el manifiesto:
        - aleph0.showStatusPanel
        - aleph0.logs.showEntry
[exthost:suite] PASS  activación sin errores (activate() resolvió · isActive === true)
[exthost:suite] PASS  comando aleph0.statusBar.toggle ejecutó (×2, ida y vuelta) sin lanzar
[exthost:suite] PASS  las 11 vistas contribuidas existen para el workbench
[exthost:suite] PASS  contenedor aleph0 abre de facto
```

Esto no es una inferencia sobre el manifiesto: es
`vscode.commands.getCommands(true)` preguntándole al host **qué hay registrado
de verdad tras activar la extensión**. Tres cosas quedan probadas de facto:

1. **`todos los comandos contribuidos están registrados`** — el mismo paso que
   en V68 listaba **31 ausentes** ahora sale limpio. Es el CA principal, medido
   fuera de jest y fuera de mis mocks.
2. **91 contribuidos · 93 registrados · aviso de 2** — cuadra al id con §3.5 y
   con `REGISTRO_INTERNO`. La biyección que afirma el gate de §4 se confirma en
   el host, y los 2 huecos son exactamente los 2 declarados, ni uno más.
3. **La extensión sigue activando sin errores, las 11 vistas siguen existiendo
   y el contenedor sigue abriendo** — CA5 (cero regresión visible) verificado
   en el producto, no sólo en la suite.

El aviso de 2 es informativo por diseño (`index.js:131-136`, nunca falla) y es
justo lo que F-1 (§6) deja intacto al endurecer la otra dirección.

---

## 9 · Ficha corregida

> ~~«31 comandos sin handler + 1 id duplicado»~~ → **exacto, se confirma**:
> 31 declarados sin handler sobre un denominador de 98 ids únicos, y
> exactamente 1 id duplicado (`aleph0.analytics.export`, índices 48 y 93).
>
> **Lo que la ficha no decía y hay que añadirle**: la simétrica —**5**
> registrados sin declarar—, una **tercera clase** (`aleph0.logs.showEntry`,
> ni declarado ni registrado pero invocado desde el árbol de logs), y que el
> registro tiene **dos fuentes**, no una: `commandTable` (56) y
> `CommandPaletteManager` (16). Contar sólo la tabla de V80 da 56 y lleva a
> conclusiones falsas en las dos direcciones.

---

## 10 · Ronda de cierre de la contrarrevisión

Cuatro puntos devueltos. **Los cuatro se aceptan; ninguno se discute.** Los dos
de código llevan **ancla de mutación**: revertir cada arreglo pone rojo un test
concreto, y ningún otro.

### ① Punto ciego paleta↔paleta — **cierto, y peor de lo que parecía**

La colisión se calculaba como `paleta.filter(id => enTabla.has(id))`: sólo el
cruce **entre** fuentes. Un id registrado dos veces **dentro** de
`CommandPaletteManager` no lo veía nadie — y VS Code lanza al activar igual.

Pero el arreglo de la fórmula, solo, habría sido teatro: la medida venía de
`getAllCommands()`, que devuelve un `Map` clavado por id y por tanto
**deduplica**. Cualquier comprobación de duplicados sobre esa lista era
tautológica por construcción. Así que se arreglan **las dos cosas**:

- la **medida** pasa a espiar `vscode.commands.registerCommand` — el hecho que
  el host ve— en vez de leer el mapa interno;
- la **fórmula** pasa a contar el multiconjunto: cubre tabla∩paleta,
  tabla∩tabla **y** paleta∩paleta.

El ancla es real, no sintética: se registra dos veces el mismo id por la API
pública del manager y se exige ver la discrepancia exacta — `llamadas` = 2,
`getAllCommands().length` = +1. Es la demostración de por qué la medida vieja
no servía. Y tiene una huella medible: esa prueba ejercita **por primera vez en
la historia del repo** la rama `if (this.commands.has(command.id))` de
`registerCommand` (el `warn('… is already registered, overwriting')`,
`commandPaletteManager.ts:218-220`) — de ahí las **+1 rama** del suelo (§7).
El punto ciego no era sólo del gate: nadie había pasado nunca por ahí.

### ② La puerta comprobaba la llave, no el motivo — **cierto**

`!(id in interno)` tenía dos agujeros, los dos verificados con el propio
instrumento: motivo `''`, `'   '`, `undefined` y `null` pasaban en verde
—contra lo que la cabecera del fichero promete, «CON MOTIVO ESCRITO»— y `in`
recorre el prototipo, así que `toString`, `constructor` y `hasOwnProperty`
salían exentos gratis. Ahora:
`Object.prototype.hasOwnProperty.call(interno, id) && String(interno[id] ?? '').trim() !== ''`.

### Ancla de mutación de ① y ②

Revertidas las dos líneas al código anterior, **caen exactamente 4 tests de
20**, y sólo ésos:

```
× DIRECCIÓN 2 · la exención exige MOTIVO, no sólo llave
× DIRECCIÓN 2 · el prototipo no regala exenciones
× el mismo id registrado DOS VECES DENTRO DE LA PALETA pone rojo
× el mismo id registrado DOS VECES DENTRO DE LA TABLA pone rojo
Tests: 4 failed, 16 passed, 20 total
```

### ③ y ④ — las dos frases

Están en su sitio, no aquí: **§6.1** (el 25 % que no llega a ningún socket, con
los cinco nombrados y el matiz de que cuatro llevan el sello literal y el
quinto no lo lleva pero tampoco habla con nadie) y **§6.6** (`configs.format`
reescribiendo `package.json` sin confirmación ni copia). No toco
`configsTreeView.ts`, como se indicó.

### Enrutado

- **El gate mide la tabla, no el registro.** Cierto y consta: envolver
  `registerCommands()` en un `if` dejaría el gate verde con la paleta muerta.
  Hoy **no lo bloquea nadie** —ni este gate ni el arnés, cuyo paso está en
  `aviso()` salvo `EXTHOST_STRICT=1`—. Es **F-1**, fuera de alcance.
- **Los tres comandos de sala rechazaban el string que su propia superficie les
  manda: arreglado.** Verificado antes de tocar nada:
  `HackerCommandPanelProvider.promptAndExecute` invoca cualquier comando como
  `executeCommand(commandId, [input])` con lo que el usuario teclee
  (`src/views/HackerCommandPanelProvider.ts:394`), y `showAllCommands` (`:476`)
  deja elegir cualquiera de la lista. `nombreDeSala` acepta ya el string pelado
  — y `rutaDeConfig` también, porque era el mismo agujero en el mismo patrón y
  arreglar un gemelo y dejar el otro habría sido peor que no tocar ninguno.
- **Lint: 192, no 193.** Corregido en §5.2 y §8. Re-medido tras esta ronda:
  **192, 0 errores**.

---
