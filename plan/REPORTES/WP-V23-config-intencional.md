# REPORTE · WP-V23 · Primera configuración intencional

| dato | valor |
| ---- | ----- |
| agente | worker-V (background) |
| fecha | 2026-08-01 |
| rama | `wp/v23-config-intencional` · worktree `C:\S_LAB\wt\v-v23` |
| base | `ef86fba` — tip de la rama al arrancar. `main` avanzó a `52e0de6` durante el turno (obra ajena de V66); **no rebaso ni fusiono**: eso es del orquestador |
| commits | `b97151b` (obra) · `82ba4b2` (docs) · este reporte |
| tipo(s) de WP | **estructural** (espacio de nombres) + **evidencia** (acta) — `plan/PRACTICAS.md:82-88` |
| riesgo de revisión | **independiente** — clase contrato/configuración (`plan/PRACTICAS.md:105-116` §4.3) |
| `VEREDICTO_REVISOR` | ⏳ **pendiente de contrarrevisión adversarial read-only** |

---

## 0 · Resumen en una tabla

| eje | antes | después |
| --- | ----- | ------- |
| prefijos vivos en `contributes.configuration` | **3** (`aleph0.` 13 · `alephscript.` 12 · `mcpSocketManager.` 1) | **1** (`aleph0.` 19) |
| claves declaradas | **26** | **19** |
| claves renombradas | — | **17** |
| claves **fusionadas** (2 viejas → 1 nueva) | — | **2 → 1** |
| claves **demolidas sin sustituta** (0 lectores) | — | **6** |
| claves que conservan su nombre exacto | — | **1** (`aleph0.room.id`, declarada abajo) |
| secciones `getConfiguration(...)` en `src/` | 3 (`alephscript`, `alephscript.logging`, `mcpSocketManager`) | **1** (`aleph0`) + `aleph0.logging` |
| jest | 5 rojos · 1 skip · 111 verdes · 117 total | **idéntico** (§6) |
| `tsc --noEmit` | 8 errores preexistentes | **los mismos 8** (§6) |

---

## 1 · Qué es «un solo espacio de nombres» aquí, y por qué el prefijo es `aleph0`

Esta es la decisión que un lector hostil debe poder atacar con toda la
información delante, así que va primero.

**El encargo dice «los 3 prefijos actuales se demuelen»**
(`plan/BACKLOG.md:100`) y la CA-1 del brief dice «un namespace, uno solo;
grep que demuestre que **los otros dos** ya no existen». Las dos frases
sólo son compatibles con una lectura, y es la que aplico:

- La **raíz** `aleph0` **no la elige este WP**: la cerró el custodio en
  **DV-16.a**, opción (b) — «claves → `aleph0.*`»
  (`plan/DECISIONES.md:47-50`). `plan/PRACTICAS.md:73` reserva el cierre
  de decisiones al custodio; un worker no reabre una decisión cerrada.
  Además la raíz tiene que ser la **cara de usuario**, y la cara de
  usuario es `Aleph-0`, no `Zigurat` (DV-16 · `plan/REPORTES/WP-V14-marca-producto.md:20`:
  `displayName` `Zigurat` → `Aleph-0`). Poner `zigurat.*` en el panel de
  Ajustes resucitaría un nombre retirado de la superficie.
- Lo que **sí demuele este WP** son los **tres espacios tal como estaban**:
  `alephscript.` y `mcpSocketManager.` desaparecen enteros, y el `aleph0.`
  de hoy se reconstruye — **12 de sus 13 claves cambian** (9 renombradas
  + 3 demolidas); sólo `aleph0.room.id` sobrevive intacta. Eso
  es lo que la nota de emisión R3 anunció a O:
  «afectará a… los 3 prefijos actuales, **incluido `aleph0.*`**»
  (`sincronia/notas/archivo/NOTA-V-2026-07-26-R3-refactor-emision.md:37,75-78`).
- Los **segmentos** salen del léxico ya aceptado
  (`plan/LEXICO-ZIGURAT.md` §1), no del gusto. §2 justifica uno a uno.

**Regla del espacio, en una frase:**
`aleph0.<término del léxico>.<detalle técnico>`.

**Lo que esta lectura NO tapa** (dicho aquí, no escondido en un pie):
`aleph0.room.id` conserva su nombre exacto. No es un descuido: `room` es
término del léxico con fuente ajena (`plan/LEXICO-ZIGURAT.md:34`, z:`plan/VISION.md:89`)
y la clave ya era ontológica antes de este WP. Renombrarla para que la
cifra «26 de 26 cambian» quedara redonda habría sido exactamente el
«gusto» que la CA-4 prohíbe.

---

## 2 · ACTA DE DEMOLICIÓN — clave vieja → clave nueva, una por una

26 filas. Ninguna clave del schema anterior queda sin fila. Columna
«fuente del nombre» = por qué se llama así, citando el léxico.

### 2.1 · Renombradas (17)

| # | clave vieja | clave nueva | fuente del nombre (léxico) |
| - | ----------- | ----------- | -------------------------- |
| 1 | `aleph0.mesh.host` | `aleph0.ciudad.host` | **ciudad** = «el dominio entero que el runtime de Z corre y que V observa y manda por contrato» (`plan/LEXICO-ZIGURAT.md:27`). El ajuste dice **dónde escucha ese runtime**; `plan/VISION.md:58` declara «Runtime de la Ciudad — no posee, consume — Z». `mesh` **no tiene fila** en §1 del léxico: dejarlo habría chocado con la regla al pie (`plan/LEXICO-ZIGURAT.md:90`) |
| 2 | `aleph0.mesh.port` | `aleph0.ciudad.port` | ídem |
| 3 | `aleph0.mesh.baseUrl` | `aleph0.ciudad.baseUrl` | ídem |
| 4 | `aleph0.launcher.host` | `aleph0.pieza.launcher.host` | **pieza** = «unidad de obra con owner declarado: lo que un mundo posee, consume u observa» (`plan/LEXICO-ZIGURAT.md:33`). Género = `pieza`; nombre propio de la pieza = `launcher`, que **C5** reserva para la pieza de Z (`plan/LEXICO-ZIGURAT.md:74`) |
| 5 | `aleph0.launcher.port` | `aleph0.pieza.launcher.port` | ídem |
| 6 | `aleph0.lineaEditor.host` | `aleph0.pieza.lineaEditor.host` | `pieza` + nombre propio de la pieza ajena `@zeus/linea-editor` |
| 7 | `aleph0.lineaEditor.port` | `aleph0.pieza.lineaEditor.port` | ídem |
| 8 | `aleph0.ollama.baseUrl` | `aleph0.pieza.ollama.baseUrl` | `pieza`; **owner externo al producto**, declarado como tal en la descripción del schema |
| 9 | `aleph0.reparto.path` | `aleph0.pieza.reparto.path` | `pieza`; `reparto/1` es dato con owner declarado (`@zeus/reparto-kit`) que V **observa** |
| 10 | `alephscript.statusBar.visible` | `aleph0.superficie.statusBar.visible` | **superficie** = «lugar de la periferia del editor donde V pinta… vista/panel de árbol, comando de paleta, webview/editor, **statusbar**, terminal gestionado» (`plan/LEXICO-ZIGURAT.md:35`). `statusBar` sigue siendo el nombre técnico de la API: **C7** deja los tipos VS Code como técnica (`plan/LEXICO-ZIGURAT.md:76`) |
| 11 | `alephscript.logging.level` | `aleph0.logging.level` | `logging` **no es término de dominio**: es diagnóstico técnico de la propia extensión. La regla al pie del léxico (`:90`) rige *términos de dominio*; C7 y C10 dejan lo técnico como técnico. Sólo se mueve la raíz |
| 12 | `alephscript.logging.enabledCategories` | `aleph0.logging.enabledCategories` | ídem |
| 13 | `alephscript.logging.showTimestamp` | `aleph0.logging.showTimestamp` | ídem |
| 14 | `alephscript.logging.showLevel` | `aleph0.logging.showLevel` | ídem |
| 15 | `alephscript.logging.showCategory` | `aleph0.logging.showCategory` | ídem |
| 16 | `alephscript.logging.showSource` | `aleph0.logging.showSource` | ídem |
| 17 | `alephscript.logging.maxEntries` | `aleph0.logging.maxEntries` | ídem |

### 2.2 · Fusionadas — 2 claves viejas → 1 nueva

| # | claves viejas | clave nueva | por qué |
| - | ------------- | ----------- | ------- |
| 18-19 | `alephscript.configurationFile` **+** `mcpSocketManager.configPath` | `aleph0.mcp.configPath` | **Apuntaban al mismo fichero.** `src/core/mcpConfigurationManager.ts` (antes `:38-44`) leía primero `mcpSocketManager.configPath` y, si venía vacía, `alephscript.configurationFile`; y `:274-279` **escribía las dos con el mismo valor**. Dos claves para un dato es el arquetipo de lo que este WP demuele. Nombre: `mcp` es acrónimo de protocolo, término **técnico** — **C1** autoriza el nombre técnico «cuando se nombra el proceso técnico concreto» (`plan/LEXICO-ZIGURAT.md:70`) |

**Consecuencia declarada de la fusión**: quien tuviera puesta *sólo*
`alephscript.configurationFile` y no `mcpSocketManager.configPath` (o al
revés) pierde igual: la clave nueva es una y hay que escribirla. Y ya no
existe el orden de precedencia entre ambas — deja de haber precedencia
porque deja de haber dos.

### 2.3 · Demolidas sin sustituta — 6 claves, ningún lector

Estas seis estaban **declaradas en el manifiesto y ningún código las
leía**: ponerlas nunca hizo nada. Retirarlas es cumplir «nada promete lo
que no hace» (`plan/PRACTICAS.md:84`, `plan/GOBIERNO-EJECUCION-F2.md:88`),
no perder funcionalidad.

| # | clave demolida | prueba de que no tenía lector |
| - | -------------- | ----------------------------- |
| 20 | `aleph0.theater.configPath` | `grep -rn "theater.configPath" src/` → sólo la lista de rótulos del panel de Ajustes (`src/views/HackerConfigPanelProvider.ts`, que la **mostraba** sin que nadie la usara) |
| 21 | `aleph0.theater.autoStart` | ídem. El `autoStart` que sí tiene efecto es otro: `extensionBootstrap.ts:190` lee `process.autoStart` vía `ConfigurationService` — clave **no declarada** (ver §4) |
| 22 | `aleph0.theater.hackerMode` | ídem; `grep -rn "hackerMode" src/` → 1 sola línea, la del rótulo |
| 23 | `alephscript.autoLoadConfig` | `grep -rn "autoLoadConfig" src/ tests/ scripts/` → **0** |
| 24 | `alephscript.configValidation` | `grep -rn "configValidation" src/ tests/ scripts/` → **0** |
| 25 | `alephscript.statusBar.animation` | El comando `aleph0.statusBar.animate` (`src/core/bootstrap/commands/hackerPanelCommands.ts:147-153`) llama `animateButtons()` **incondicionalmente**; jamás consulta el ajuste |

Salida literal de las dos comprobaciones de conteo cero:

```text
$ grep -rn --include="*.ts" --include="*.mjs" "autoLoadConfig\|configValidation" src/ tests/ scripts/
(sin salida)  exit=1
```

### 2.4 · Sin cambio — 1

| # | clave | por qué se queda igual |
| - | ----- | ---------------------- |
| 26 | `aleph0.room.id` | **room** tiene fila en el léxico con fuente ajena: «canal de una partida en el socket-server; UNA autoridad por room» (`plan/LEXICO-ZIGURAT.md:34`, z:`plan/VISION.md:89`). Ya era el nombre correcto. **C2** prohíbe además traducir `room` por `barrio` y viceversa (`plan/LEXICO-ZIGURAT.md:71`), así que la alternativa «ontológica» tentadora estaba vetada de antemano |

### 2.5 · Colisión C1 saldada — la superficie deja de decir «servidor»

El léxico dejó **C1** como insumo explícito de este WP: «la UI en español
dice *servidor/servicio* donde el plan dice *pieza*»
(`plan/LEXICO-ZIGURAT.md:70`; canónico propuesto: **pieza**). Aplicado en
las **descripciones del schema** (lo que el usuario lee en Ajustes):

| antes (`package.json`, base `ef86fba`) | ahora (`package.json:621,627`) |
| -------------------------------------- | ------------------------------ |
| «Host del **MCP service launcher**» | «Host de la **pieza** launcher de Z (publica el catálogo)» |
| «Puerto del **MCP service launcher**» | «Puerto de la **pieza** launcher de Z» |
| «Host de `@zeus/linea-editor`» | «Host de la **pieza** `@zeus/linea-editor`» |
| «URL base de Ollama» | «URL base de la **pieza** Ollama (owner externo al producto)» |

`grep -inE "servidor|servicio" package.json` sobre el bloque
`contributes.configuration` → **0**. C1 queda saldada **en configuración**;
sigue viva fuera (40 «servidor» en `src/`, según el censo de V27), y eso es
alcance de V19, no de este WP (§8).

---

## 3 · Qué pasa con la configuración de un usuario que ya tenía las viejas

**Decisión: PÉRDIDA DECLARADA. No hay migración automática, y no la habrá.**

Razón, citada: invariante **I-5** del custodio — «nadie ha usado nunca
este código; **prohibido preservar compatibilidades** o razonar en
términos de legacy» (`plan/PRACTICAS.md:51-52`). Un shim que leyera las
claves viejas para reescribirlas sería exactamente la compatibilidad que
I-5 prohíbe.

**Pero la pérdida no es silenciosa**, y esto sí se ha probado de facto
(§5.3): la extensión ya nombra, en cada camino ⏳, **la clave nueva que
falta**. Un usuario con `aleph0.mesh.host` puesta no ve «funciona a
medias» ni un default inventado: ve

```text
⏳ endpoint MCP 'launcher' sin configurar — falta:
   aleph0.pieza.launcher.host | ZEUS_HOST · aleph0.pieza.launcher.port | ZEUS_MCP_LAUNCHER
   (V consume, no inventa)
```

y en el `settings.json` VS Code le marca la clave vieja como *Unknown
Configuration Setting*. Las dos señales llegan sin abrir el plan.

### 3.1 · Dónde la pérdida es ruidosa y dónde no — tabla honesta

| clave nueva | ¿qué ve quien la perdió? | ¿ruidosa? |
| ----------- | ------------------------ | --------- |
| `aleph0.ciudad.host` / `.port` / `.baseUrl` | `⏳ aleph0.ciudad.baseUrl (o host+port) no configurado` (`src/core/AracneBotService.ts:102,246`, `src/identity/roomSettings.ts:33`, `src/libs/alephscript-client.ts:62`) | **sí**, nombra la clave nueva |
| `aleph0.pieza.launcher.host` / `.port` | `⏳ setting ausente: aleph0.pieza.launcher.port (sin inventar puerto)` (`src/launcher/settings.ts:29,37`) + aviso modal al arrancar launcher (`src/processManager.ts:181,184`) | **sí** |
| `aleph0.pieza.lineaEditor.host` / `.port` | `⏳ configure aleph0.pieza.lineaEditor.host+…` (`src/mutation/settings.ts:56`) | **sí** |
| `aleph0.pieza.reparto.path` | el panel elenco queda en ⏳ con la ruta vacía (`src/elenco/RepartoElencoService.ts:24`) | **sí** |
| `aleph0.room.id` | `⏳ aleph0.room.id no configurado` — **pero esta clave no cambió**, nadie la pierde | n/a |
| `aleph0.pieza.ollama.baseUrl` | `getOllamaUrl()` devuelve `''` y cae al fichero de ópera si lo hay (`src/core/mcpConfigurationManager.ts:173-179`). **No hay mensaje propio** | **NO** — silencio parcial, declarado |
| `aleph0.mcp.configPath` | `⏳ Sin archivo Opera ni flota inventada…` (`src/core/mcpConfigurationManager.ts:60`); el aviso **no nombra la clave nueva** | **parcial** — avisa, pero no dice qué escribir |
| `aleph0.superficie.statusBar.visible` | quien la tenía en `false` vuelve a ver la barra de estado. Literalmente visible; ningún mensaje | **NO** — pero el efecto es la propia UI reapareciendo |
| `aleph0.logging.*` | el log vuelve a los defaults (nivel `info`, todas las categorías) | **NO** — sin mensaje |
| las 6 demolidas (§2.3) | **nada**, porque nunca hicieron nada | n/a |

Las cuatro filas «NO/parcial» son el precio declarado de la decisión. **No
las arreglo en este WP** y digo por qué: añadir avisos nuevos a
`mcpConfigurationManager` o al logging sería obra fuera del alcance de
configuración/nombres (CA-6) y pisaría al worker que trabaja el logging en
paralelo. Quedan anotadas para V32 («validación honesta del env»,
`plan/BACKLOG.md:59`) en §8.

---

## 4 · Lo que promete y no hace — inventario completo (CA-5)

### 4.1 · Claves declaradas sin efecto: **0 después** (había 6, §2.3)

Las 19 claves del schema tienen lector verificado:

```text
$ node -e "… Object.keys(contributes.configuration.properties) …"
19 claves · claves fuera de `aleph0.`: 0
```

| clave | lector citado |
| ----- | ------------- |
| `aleph0.ciudad.{host,port,baseUrl}` | `src/config/ziguratSettings.ts:66-68` → `resolveMeshBaseUrl` (`:83`) |
| `aleph0.room.id` | `src/config/ziguratSettings.ts:72` · `src/identity/roomSettings.ts:17` |
| `aleph0.pieza.launcher.{host,port}` | `src/config/ziguratSettings.ts:69-70` · `src/launcher/settings.ts:24` · `src/mcp/endpoint.ts:50` |
| `aleph0.pieza.lineaEditor.{host,port}` | `src/config/ziguratSettings.ts:73-74` · `src/mutation/settings.ts:25` · `src/mcp/endpoint.ts:51` |
| `aleph0.pieza.ollama.baseUrl` | `src/config/ziguratSettings.ts:71` · `src/core/mcpConfigurationManager.ts:174` |
| `aleph0.pieza.reparto.path` | `src/config/ziguratSettings.ts:75` · `src/elenco/RepartoElencoService.ts:24,36` |
| `aleph0.mcp.configPath` | `src/core/mcpConfigurationManager.ts:41,273` · `src/uiManager.ts:69` |
| `aleph0.superficie.statusBar.visible` | `src/core/HackerStatusBarManager.ts:33,38-41` · `src/core/bootstrap/commands/hackerPanelCommands.ts:170,173` |
| `aleph0.logging.*` (7) | `src/loggingManager.ts:90-102` |

### 4.2 · El defecto inverso: **21 claves que el código LEE y nadie declara**

Esto no lo introduce V23 — lo hereda, y lo saca a la luz porque el acta
sería mentirosa sin ello. `src/core/configurationService.ts` define **25**
claves en un schema propio; sólo **4** existen en
`contributes.configuration` (las `logging.*`). Las otras **21** se leen de
una sección que no las declara: siempre devuelven su `defaultValue`, y el
usuario **no puede descubrirlas** en el panel de Ajustes.

```text
aleph0.process.{autoStart,configPath,maxRetries,timeout}
aleph0.webview.{retainContextWhenHidden,enableScripts,basePort,maxInstances}
aleph0.mcp.{serverTimeout,retryCount,autoReconnect}
aleph0.ui.{theme,animations,compactMode}
aleph0.development.{debugMode,verboseLogging,hotReload}
aleph0.analytics.{enabled,trackPerformance,exportPath,retentionDays}
```

**Dos de ellas gobiernan conducta real**: `process.autoStart` y
`process.configPath` deciden si al activar se arranca el launcher
(`src/core/extensionBootstrap.ts:190-194`) y alimentan un comando
(`src/core/bootstrap/commands/processCommands.ts:31`). Es decir: hay una
conducta de arranque gobernada por un ajuste que **el usuario no puede ver
ni poner desde la UI**.

**Qué hago y qué no**: muevo la sección de `alephscript` a `aleph0`
(`src/core/configurationService.ts:64`) — obligado, si no sobrevivía un
prefijo viejo en código vivo — y **no invento las 21 entradas de schema
que faltan**: declararlas sería prometer un contrato que este WP no ha
diseñado. Queda dicho en el propio código
(`src/core/configurationService.ts:59-63`, aviso en el sitio del defecto) y
enrutado a **V32** en §8.

**Efecto colateral declarado**: `aleph0.mcp.configPath` (declarada) queda
como hermana de `aleph0.mcp.{serverTimeout,retryCount,autoReconnect}` (no
declaradas). Antes vivían en prefijos distintos; ahora comparten grupo. No
cambia ninguna conducta —las tres siguen resolviendo a su `defaultValue`—
pero es un solape que un lector debe conocer antes de que se lo encuentre.

**Quien tuviera escritas a mano** `alephscript.process.autoStart` o
cualquiera de esas 21 en su `settings.json` (VS Code deja escribir claves
no declaradas) **las pierde**, y sin ningún aviso. Es el punto más silencioso
de todo el WP y por eso está aquí y no en un anexo.

---

## 5 · Evidencia

### 5.1 · CA-1 · un namespace, uno solo — greps con patrón y salida

**Patrón G1 — uso de los otros dos prefijos como sección o clave de
configuración.** Cubre las cuatro formas en que un prefijo puede seguir
vivo: `getConfiguration('x')`, `affectsConfiguration('x…')`, clave `"x.y":`
en el manifiesto, y la forma sin ámbito `getConfiguration().get('x')`.

```text
$ grep -rnE --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist \
    --exclude-dir=out --exclude-dir=coverage --exclude-dir=plan \
    --exclude=package-lock.json \
    "getConfiguration\(\s*['\"](alephscript|mcpSocketManager)|affectsConfiguration\(\s*['\"](alephscript|mcpSocketManager)|\"(alephscript|mcpSocketManager)\.[a-zA-Z]+\"\s*:|getConfiguration\(\)\.get\(\s*['\"](alephscript|mcpSocketManager)['\"]" .
(sin salida)
exit=1
```

`exit=1` es la medida canónica de «cero coincidencias»
(`plan/PRACTICAS.md:136-137` regla 4), no un `| head` maquillado.

**Patrón G2 — toda aparición de las dos palabras, sin filtrar.** Un grep
estrecho probaría poco. Éste enseña los restos **enteros** y los clasifica
hasta el último: **116 líneas / 121 ocurrencias** (excluyendo `plan/`,
`README.md` y artefactos generados). Ninguna es configuración.

```text
$ grep -rnE --exclude-dir={node_modules,.git,dist,out,coverage,plan} \
    --exclude=package-lock.json --exclude=README.md \
    "alephscript|mcpSocketManager" . | wc -l
116
```

Clasificación **exhaustiva** (script sobre esa misma salida; la suma da 116,
no una muestra):

| clase | nº | qué es · por qué no es configuración |
| ----- | -- | ----------------------------------- |
| **B** | **70** | **ids de vista y de editor custom**: `views[].id`, `viewType`, las cláusulas `when` de menú que los citan (`view == alephscript.mcptree`), `viewRegistry.ts` y la prosa que los nombra. Son **identificadores de código**: DV-16.a los excluye (`plan/DECISIONES.md:48-49`) y renombrarlos rompería los `when` y los `*.focus` |
| **E** | **21** | nombres de **módulo, paquete npm, fichero o modelo**: `alephscript-client.ts`, `@alephscript/*`, `alephscript-skills-sync`, `blockly-alephscript-sdk`, `alephscript-logs-*.json`, `alephscript-ai-v1`, la URL `alephscriptorium-eng/V_SDK` |
| **A** | **10** | ids de comando **`aleph0.mcpSocketManager.*`** (6 en el manifiesto, 4 en `src/`). El prefijo vivo es `aleph0.`; `mcpSocketManager` es su **segundo segmento**, conservado a propósito porque discrimina la categoría del panel de comandos (`src/views/HackerCommandPanelProvider.ts:239`). Alcance **V25** |
| **C** | **5** | los `*.focus` que **genera VS Code** por cada vista declarada — excepciones ya declaradas en `plan/REPORTES/WP-V15-espacios-nombres.md:72-80` *[cita inerte]* |
| **F** | **5** | prosa histórica (`sincronia/`), `LICENSE.md`, schemas ajenos, `.npmrc` (registro npm privado), CI y un skill |
| **D** | **4** | `alephscript.hackerTheme[.manual]`: claves de **`globalState` (Memento)**, no de `contributes.configuration` (`src/views/BaseHackerPanelProvider.ts:10-11`). Superficie de nombres paralela → **H-7** en §8 |
| — | **1** | `src/config/ziguratSettings.ts:22`: **comentario de este WP** citando las dos claves fusionadas |
| | **116** | **total, sin resto sin clasificar** |

**Patrón G3 — `mcpSocketManager` que no sea id de comando:**

```text
$ grep -rnE … "mcpSocketManager" . | grep -v "aleph0\.mcpSocketManager"
docs/GUIA-PRUEBA-v2.md:13         (prosa: anuncia que desaparece)
sincronia/notas/…-R3-…md:37       (nota archivada, [cita inerte])
src/config/ziguratSettings.ts:22  (comentario del propio WP)
→ 3 · ninguna es una clave ni una sección
```

**Y el manifiesto, medido en positivo:**

```text
$ node -e "const p=require('./package.json'); const k=Object.keys(p.contributes.configuration.properties); \
           console.log(k.length, k.filter(x=>!x.startsWith('aleph0.')).length)"
19 0
```

### 5.2 · CA-3 · CA de WP-V05 re-verificada de facto (no citada)

Los tres greps de `plan/REPORTES/WP-V05-config-unica.md:58-85`,
**re-ejecutados hoy sobre este árbol**, con el mismo alcance de ficheros:

```text
$ rg -n '/c/Users/|/Users/oracl|C:\\Users\\|/Users/[^/]+/Documents/REPOS' \
    src/libs/alephscript-client.ts src/core/AracneBotService.ts \
    src/core/mcpConfigurationManager.ts src/processManager.ts \
    src/config/ziguratSettings.ts package.json
exit=1   → 0 coincidencias

$ rg -n 'localhost:\d+|127\.0\.0\.1:\d+|:\s*30(10|50|01|02|03|12)\b|port:\s*30\d\d|,\s*3050\)|http://localhost:\d+' \
    src/libs/alephscript-client.ts src/core/AracneBotService.ts \
    src/core/mcpConfigurationManager.ts src/processManager.ts \
    src/config/ziguratSettings.ts
exit=1   → 0 coincidencias

$ rg -n '3010|11434|3050|/c/Users/oracl' \
    src/libs/alephscript-client.ts src/core/AracneBotService.ts \
    src/core/mcpConfigurationManager.ts src/processManager.ts
exit=1   → 0 coincidencias
```

Defaults del schema (V05 exigía vacío/null en los endpoints) — salida
literal del volcado de `package.json`:

```text
aleph0.ciudad.host                  default = ""
aleph0.ciudad.port                  default = null
aleph0.ciudad.baseUrl               default = ""
aleph0.room.id                      default = ""
aleph0.pieza.launcher.host          default = ""
aleph0.pieza.launcher.port          default = null
aleph0.pieza.lineaEditor.host       default = ""
aleph0.pieza.lineaEditor.port       default = null
aleph0.pieza.ollama.baseUrl         default = ""
aleph0.pieza.reparto.path           default = ""
aleph0.mcp.configPath               default = ""
aleph0.superficie.statusBar.visible default = true
aleph0.logging.level                default = "info"
aleph0.logging.enabledCategories    default = [8 categorías]
aleph0.logging.{showTimestamp,showLevel,showCategory,showSource} default = true
aleph0.logging.maxEntries           default = 10000
```

Los **11 endpoints/rutas** salen vacíos o `null` — la CA de V05. Las 8
restantes (`statusBar` y `logging`) tienen default funcional, **igual que
antes de este WP**: no son endpoints y V05 nunca las cubrió.

`npm run compile` → `exit 0`; `npm run compile:production` → `exit 0`
(`dist/extension.js 688.9kb`).

### 5.3 · Hostil-omite **de facto** (V05 lo dejó como inspección de código)

V05 declaró este eje por **inspección** (`WP-V05-config-unica.md:98-107`).
Aquí se ejecuta. Sonda temporal fuera del repo (creada, corrida y
**borrada** — `git status` limpio, §7), que monta el API de VS Code con los
**defaults del schema** y, en un segundo escenario, con las **claves
viejas puestas a mano**. Salida literal:

```text
PASS sonda-v23/probe.test.ts
  SONDA V23 · hostil-omite con las claves nuevas
    √ sin ajustes: todo ⏳, nada inventado, cero throw (59 ms)
    √ usuario con las claves VIEJAS puestas: NO resucitan (pérdida ruidosa, no silenciosa) (6 ms)
Tests: 2 passed, 2 total

-- escenario 1 · sin ajustes --
settings leídos  : {"meshHost":"","meshBaseUrl":"","launcherHost":"","ollamaBaseUrl":"","roomId":"","lineaEditorHost":"","repartoPath":""}
mesh configurado : false | etiqueta: ⏳
mesh baseUrl     : ""
launcher         : {"configured":false,"reason":"⏳ setting ausente: aleph0.pieza.launcher.port (sin inventar puerto)"}
room             : {"configured":false,"roomId":"","endpoint":"","reason":"⏳ aleph0.room.id no configurado"}
endpoint launcher: {"configured":false,"reason":"⏳ endpoint MCP 'launcher' sin configurar — falta: aleph0.pieza.launcher.host | ZEUS_HOST · aleph0.pieza.launcher.port | ZEUS_MCP_LAUNCHER (V consume, no inventa)"}
endpoint lineaEd.: {"configured":false,"reason":"⏳ endpoint MCP 'lineaEditor' sin configurar — falta: aleph0.pieza.lineaEditor.host | ZEUS_HOST · aleph0.pieza.lineaEditor.port | ZEUS_MCP_LINEA_EDITOR (V consume, no inventa)"}

-- escenario 2 · settings.json con mesh.host/mesh.port/launcher.* /lineaEditor.* /reparto.path (las VIEJAS) --
settings leídos  : {"meshHost":"","meshBaseUrl":"","launcherHost":"","ollamaBaseUrl":"","roomId":"","lineaEditorHost":"","repartoPath":""}
endpoint launcher: {"configured":false,"reason":"⏳ endpoint MCP 'launcher' sin configurar — falta: aleph0.pieza.launcher.host | …"}
room             : {"configured":false,…,"reason":"⏳ aleph0.room.id no configurado"}
```

Lectura: **cero valores inventados, cero throw**, y una clave vieja puesta
a mano **no revive nada** — el motivo nombra la clave nueva. Es la prueba
directa de que la pérdida de §3 es visible, no callada.

### 5.4 · Otras verificaciones de facto

```text
$ npm run probe:v08        (paso de CI)
  …
  PASS: setting aleph0.pieza.lineaEditor.port
  WP-V08 probe PASS (automatizado · pieza real de src/mutation/parseEditorInfo.ts)

$ npm run lint             (paso de CI)
  ✖ 159 problems (0 errors, 159 warnings)     ← 0 errores, igual que la base
```

---

## 6 · Suite de tests — números exactos antes → después (CA-7)

Medido en el **mismo árbol y la misma máquina**: la base con
`git stash` puesto, el después con el trabajo aplicado.

| medida | ANTES (base `ef86fba`) | DESPUÉS (`82ba4b2`) |
| ------ | ---------------------- | ------------------- |
| Test Suites | 1 failed, 7 passed, **8 total** | 1 failed, 7 passed, **8 total** |
| Tests | **5 failed**, 1 skipped, 111 passed, **117 total** | **5 failed**, 1 skipped, 111 passed, **117 total** |
| `tsc -p tsconfig.json --noEmit` | **8 errores** | **8 errores** |
| `npm run compile` | exit 0 | exit 0 |
| `npm run lint` | 0 errores / 159 warnings | 0 errores / 159 warnings |

**Los 5 rojos, por nombre** (los mismos antes y después):

```text
ManagerFactory Integration Tests › Manager Creation › should create process manager
ManagerFactory Integration Tests › Manager Creation › should create webview manager
ManagerFactory Integration Tests › Standard Managers Creation › should create all standard managers
ManagerFactory Integration Tests › Standard Managers Creation › should have proper dependency chain in standard managers
ManagerFactory Integration Tests › Performance › should handle concurrent manager creation
```

**Causa, idéntica en los cinco, antes y después:**

```text
TypeError: vscode.window.onDidCloseTerminal is not a function
  at new TerminalManager (src/terminalManager.ts:24:23)
```

Es un hueco del mock (`tests/mocks/vscode.mock.js` no expone
`onDidCloseTerminal`), sin relación con configuración; son los «5 jest
rojos históricos» que `plan/GOBIERNO-EJECUCION-F2.md:99` asigna a **V48**.

**Los 8 errores de `tsc`, idénticos** (2 `RepartoElencoService` + 2
`protocolApi` + 2 `LauncherCatalogClient` + 1 `LineaEditorClient` + 1
`McpResourceClient`; todos `TS1479` de ESM/CJS o `TS2353` del SDK MCP).
Coinciden con los «8 err TS preexistentes ajenos» que declaró V80
(`plan/BACKLOG.md:106`).

**Un rojo transitorio, declarado**: al renombrar, `tests/unit/mcp/endpoint.test.ts`
pasó a 6 rojos porque su *fixture* mockeaba las sub-claves viejas
(`'launcher.host'`). Se corrigió el fixture a `'pieza.launcher.host'`
(`tests/unit/mcp/endpoint.test.ts:114-120`) — **no** se tocó la aserción ni
el código de producción. Vuelta a 5. Se cuenta aquí porque un reporte que
sólo enseña el estado final esconde la mitad del trabajo.

---

## 7 · Alcance: qué toqué y qué NO

### 7.1 · Diff (28 ficheros · +221 / −202)

| grupo | ficheros |
| ----- | -------- |
| manifiesto | `package.json` (sólo `contributes.configuration`) |
| módulo de config | `src/config/ziguratSettings.ts` (sección + 3 constantes de clave) |
| lectores de clave | `core/{mcpConfigurationManager,HackerStatusBarManager,configurationService}.ts`, `uiManager.ts`, `loggingManager.ts`, `core/bootstrap/commands/{aiCommands,hackerPanelCommands}.ts`, `views/HackerConfigPanelProvider.ts` |
| literales/⏳ que nombran claves | `core/AracneBotService.ts`, `identity/roomSettings.ts`, `launcher/{settings,types,LauncherCatalogClient}.ts`, `libs/alephscript-client.ts`, `mcp/endpoint.ts`, `mutation/settings.ts`, `processManager.ts`, `resources/ResourceProjectionService.ts`, `elenco/RepartoElencoService.ts` |
| tests (fixtures) | `tests/unit/mcp/{endpoint,clienteMcp}.test.ts`, `tests/integration/managerFactory.test.ts` |
| docs | `README.md`, `docs/GUIA-PRUEBA-v2.md`, `src/elenco/DOS-MODELOS.md`, `scripts/probes/v08-mutacion-autoria.mjs` |

`git status --porcelain` al cierre: **vacío** (la sonda de §5.3 y los
`dist/` y `coverage/` generados se borraron).

### 7.2 · Lo que NO hice, y por qué

1. **No renombré identificadores de código.** `meshHost`, `resolveMeshBaseUrl`,
   `ziguratSettings.ts`, `ZIGURAT_LAUNCHER_PORT_KEY` siguen igual: DV-16.a
   lo excluye en sus dos caminos (`plan/DECISIONES.md:48-49`). **Consecuencia
   declarada**: el campo TS `meshHost` lee ahora la clave `ciudad.host`. Es
   una incoherencia interna real, acotada a `src/config/ziguratSettings.ts`
   y sus 7 consumidores, y no la tapo.
2. **No toqué comandos ni menús.** Los 6 `aleph0.mcpSocketManager.*` y los
   4 `alephscript.*.focus` siguen como estaban: son **V25**
   (`plan/BACKLOG.md:102`) y `plan/GOBIERNO-EJECUCION-F2.md:19` los
   secuencia después de mí.
3. **No toqué ids de vista.** `alephscript.mcptree`, `.teatro`, `.elenco`…
   son identificadores de código; renombrarlos rompería los `when` y los
   `*.focus` que VS Code genera.
4. **No inventé las 21 entradas de schema que faltan** (§4.2).
5. **No añadí migración automática** (§3) — I-5.
6. **No edité `plan/LEXICO-ZIGURAT.md`.** Elegí a propósito **sólo términos
   con fila en §1**, de modo que la regla al pie (`:90`, «término nuevo sin
   fila = FAIL») no se activa y no hay que tocar el entregable de V27.
7. **No edité `plan/BACKLOG.md`** — sólo el orquestador
   (`plan/PRACTICAS.md:72`).
8. **Logging y webviews**: toqué **2 literales** en `src/loggingManager.ts:61,90`
   (`'alephscript.logging'` → `'aleph0.logging'`) y la lista de rótulos de
   `src/views/HackerConfigPanelProvider.ts:193-205`. Sin ellos, la CA-1
   sería falsa: el prefijo viejo seguiría vivo en código. **No es obra de
   logging ni de webview**: no toqué formato, niveles, canales, HTML, CSP ni
   `media/`. Se declara por el paralelismo con el otro worker.

---

## 8 · Hallazgos fuera de alcance (CA-6 — lo que vi mal y no arreglé)

| # | hallazgo | evidencia | destino propuesto |
| - | -------- | --------- | ----------------- |
| H-1 | **21 claves leídas y no declaradas**, dos de ellas gobernando el arranque | §4.2 · `src/core/configurationService.ts:66-240` · `src/core/extensionBootstrap.ts:190-194` | **V32** (validación honesta del env) — o un WP propio: es un contrato de configuración entero sin schema |
| H-2 | 4 caminos donde perder la config **no dice nada** (ollama, mcp.configPath, statusBar, logging) | §3.1 | **V32** |
| H-3 | `src/treeViews/configsTreeView.ts:430` y `socketsTreeView.ts:86,92` siguen con `ws://localhost:3000` literal | `rg 'localhost:[0-9]+' src/` → 3 líneas, 2 ficheros | **V31** (endpoints por variable) — ya estaban en «fuera de alcance» de V05 |
| H-4 | `mcpConfigurationManager.ts:46,60` busca y nombra `ArrakisTheater_OperaConfig.json` en el workspace del usuario: **marca retirada viva en código y en un aviso al usuario** | `grep -n ArrakisTheater src/core/mcpConfigurationManager.ts` → `:23,46,60` | **V47** (retirar la marca previa) |
| H-5 | C1 sigue viva **fuera** de configuración: «servidor» ×40 en `src/` (censo V27) | `plan/LEXICO-ZIGURAT.md:70` | **V19** |
| H-6 | `src/launcher/` alberga el cliente del **catálogo** (colisión C5) | `plan/LEXICO-ZIGURAT.md:74` | **V19** |
| H-7 | `alephscript.hackerTheme[.manual]` como clave de `globalState`: superficie de nombres paralela, invisible al usuario y no cubierta por ningún acta | `src/views/BaseHackerPanelProvider.ts:10-11` | **V67** (tema) |
| H-8 | `tests/mocks/vscode.mock.js` no expone `onDidCloseTerminal` → los 5 rojos | §6 | **V48** |

---

## 9 · Auto-revisión contra el encargo

| CA | estado | dónde |
| -- | ------ | ----- |
| 1 · un namespace, grep con patrón y salida | ✅ | §5.1 — G1 `exit=1`, G2 clasificación completa de los 115 restos, G3, y el manifiesto medido en positivo (19/0) |
| 2 · acta clave a clave, sin huecos, con decisión sobre el usuario | ✅ | §2 (26 filas: 17 + 2→1 + 6 + 1) y §3 (**pérdida declarada**, con la tabla de qué se ve y qué no) |
| 3 · CA de V05 re-verificada de facto | ✅ | §5.2 (3 greps re-ejecutados + defaults + compile) y §5.3 (hostil-omite **ejecutado**, que V05 sólo inspeccionó) |
| 4 · nombres desde la ontología, con cita | ✅ | §2.1 columna «fuente del nombre» · §1 para la raíz · §2.5 para C1 |
| 5 · nada promete lo que no hace | ✅ | §2.3 (6 demolidas) · §4.1 (19/19 con lector citado) · §4.2 (el defecto inverso, con nombres) |
| 6 · cero contrabando | ✅ | §7.1 diff · §7.2 los 8 «no» · §8 los 8 hallazgos enrutados |
| 7 · tests, números exactos antes → después | ✅ | §6, con los 5 rojos por nombre, su causa idéntica y el rojo transitorio declarado |

### Riesgos que dejo señalados para la contrarrevisión

- **R-1** · La lectura de «los 3 prefijos se demuelen» (§1) es
  interpretativa. Si el orquestador o el custodio quieren que `aleph0`
  también muera, el trabajo es un `sed` sobre 19 claves — pero exige
  reabrir **DV-16.a**, que es acto del custodio, no mío.
- **R-2** · `aleph0.room.id` conserva su nombre. Está declarado en §2.4;
  no es una clave vieja superviviente por descuido.
- **R-3** · Los `alephscript.*` y `mcpSocketManager.*` que quedan en el
  árbol son **ids de vista y de comando**, alcance V25/V19. Están contados
  y clasificados uno a uno en §5.1-G2; ninguno responde al patrón G1.
- **R-4** · Nadie ha probado esto en un VS Code real. El arnés de V68
  (`tests/exthost/`) lo cubriría; **no lo ejecuté** (⏳). El gate **R8-V**
  (`plan/GOBIERNO-EJECUCION-F2.md:70`) exige re-verificación de facto, no
  cita de este reporte.
- **R-5** · La sonda de §5.3 monta el API de VS Code; **no es** VS Code.
  Prueba la lógica de resolución con las claves nuevas, no el binding del
  manifiesto.

---

— **V** · Aleph-0 (ℵ₀) · WP-V23
