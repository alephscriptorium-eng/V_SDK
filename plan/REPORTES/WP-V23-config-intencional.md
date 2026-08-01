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
| `VEREDICTO_REVISOR` | **DEVUELTO 3 veces** · 1ª: D1-D6 → §11 · 2ª: DD-1…DD-6 → §12 · 3ª (cierre, sólo documentación): D-1/D-2/D-3 → **§13**. Cierre verificado por el orquestador |

> ⚠️ **Este reporte se lee de atrás adelante: §13 manda, luego §12, §11 y 0-10.** La devolución tumbó dos
> afirmaciones centrales de las secciones 1-10. **No se ha borrado nada**:
> cada frase caída lleva marca `⛔ CAÍDA (D-n)` en su sitio y el texto
> corregido vive en **§11** y, lo que §11 dejó incompleto, en **§12**. Las
> cifras y afirmaciones vigentes son las de **§13** (y §12 donde §13 no lo toca).

---

## 0 · Resumen en una tabla

> ⛔ **CAÍDA parcial (D1, D6)** — las cifras de claves y de demoliciones
> cambian tras la devolución. Tabla vigente: **§11.0**.

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

> ✅ **RESUELTA por el custodio (D5 → DV-17)** — esta sección se escribió
> como decisión zanjada cuando aún no lo estaba (la contrarrevisión tenía
> razón: mi cita de DV-16.a elidía «*dentro de WP-V15*»). **Ahora sí lo
> está**: **DV-17** aplaza el namespace y **V23 cierra con `aleph0`**. Lo
> de abajo es la lectura que el custodio ha respaldado. Ver **§11.5**.

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
| ~~8~~ | ~~`aleph0.ollama.baseUrl`~~ | ⛔ **CAÍDA (D1)** — no se renombra: **se demuele**. Su única cadena de lectura estaba muerta. Fila vigente en **§11.1** | — |
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

### 2.3 · Demolidas sin sustituta — ~~6~~ **7** claves, ningún lector

> ⛔ **CORREGIDO (D1)** — son **7**: se suma `aleph0.ollama.baseUrl`, cuya
> cadena de lectura completa está muerta. Fila y prueba en **§11.1**.

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
| `aleph0.ciudad.host` / `.port` / `.baseUrl` | ⛔ **CAÍDA (D2)** — «sí» sólo para 3 de sus 4 caminos. El cuarto (`getDefaultSocketUrl()`) **sustituye por `ws://localhost:<puerto>`**: ni ⏳, ni clave, ni log. Fila vigente y caso rojo reproducido en **§11.2** | ⛔ |
| `aleph0.pieza.launcher.host` / `.port` | `⏳ setting ausente: aleph0.pieza.launcher.port (sin inventar puerto)` (`src/launcher/settings.ts:29,37`) + aviso modal al arrancar launcher (`src/processManager.ts:181,184`) | **sí** |
| `aleph0.pieza.lineaEditor.host` / `.port` | `⏳ configure aleph0.pieza.lineaEditor.host+…` (`src/mutation/settings.ts:56`) | **sí** |
| `aleph0.pieza.reparto.path` | el panel elenco queda en ⏳ con la ruta vacía (`src/elenco/RepartoElencoService.ts:24`) | **sí** |
| `aleph0.room.id` | `⏳ aleph0.room.id no configurado` — **pero esta clave no cambió**, nadie la pierde | n/a |
| ~~`aleph0.pieza.ollama.baseUrl`~~ | ⛔ **sin objeto (D1)**: la clave ya no existe. Nadie la pierde porque nunca hizo nada — **§11.1** | — |
| `aleph0.mcp.configPath` | `⏳ Sin archivo Opera ni flota inventada…` (`src/core/mcpConfigurationManager.ts:60`); el aviso **no nombra la clave nueva**. ⚠️ **incompleta (D4)**: antes de ese aviso hay una **adopción automática** de un fichero de la raíz, que además se **auto-escribe** en los ajustes — ver **§11.4** | **parcial**, y peor de lo que decía |
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

### 4.1 · Claves declaradas sin efecto: ~~**0 después**~~ (había 6, §2.3)

> ⛔ **CAÍDA (D1)** — el «0 después» era falso: `aleph0.pieza.ollama.baseUrl`
> quedaba declarada con un lector **muerto** (`getOllamaUrl()`, 0 llamadas).
> Tabla vigente y cadena verificada en **§11.1**. Tras la corrección el «0»
> sí se sostiene, sobre **18** claves.

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

> ⚠️ **D6** — en §9 esta cifra aparecía como «115»; **el bueno es 116**
> (líneas; 121 ocurrencias). Y de la clase **C**, en **código** hay **4**
> `*.focus`; la quinta ocurrencia es prosa. Corregido en §11.6.

**Y el manifiesto, medido en positivo:**

```text
$ node -e "const p=require('./package.json'); const k=Object.keys(p.contributes.configuration.properties); \
           console.log(k.length, k.filter(x=>!x.startsWith('aleph0.')).length)"
19 0
```

### 5.2 · CA-3 · CA de WP-V05 re-verificada de facto (no citada)

> ⛔ **CAÍDA parcial (D3)** — los tres greps se re-ejecutaron de verdad, pero
> **el patrón de V05 es ciego a los puertos interpolados** (`localhost:${…}`),
> así que su verde es un **verde vacío** justo sobre la línea de D2. Patrón
> corregido, salida y alcance real en **§11.3**.

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
literal del volcado de `package.json`.

> 📌 **EVIDENCIA RANCIA (DD-5)** — este volcado es **de antes de la
> corrección D1**: aún lista `aleph0.pieza.ollama.baseUrl` y cuenta 19
> claves. Hoy son **18** y esa clave no existe. Volcado vigente en §11.1 y
> §12.5. Se conserva porque es la salida que se citó, no el estado actual.

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

> 📌 **EVIDENCIA RANCIA y, en parte, VERDE VACÍO (DD-5, DD-3)** — esta
> salida es **de antes de la corrección D1** (el campo `ollamaBaseUrl` ya no
> existe) y sus dos líneas `endpoint launcher:` / `endpoint lineaEd.` vienen
> de `resolveMcpEndpoint`, que es **código inalcanzable** desde la extensión
> (`src/mcp/` no lo importa nadie fuera de `tests/`): ese mensaje **no lo ve
> ningún usuario**. Sonda re-ejecutada y evidencia sustituida por la **viva**
> en **§12.3**. Se conserva porque es lo que se citó.

Lectura ~~**cero valores inventados, cero throw**~~ — vigente sólo en lo que
§12.3 vuelve a probar con lectores alcanzables; y **matizada por §12.2**: en
el árbol de sockets sí se inventa un valor.

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

> ⚠️ **DESVÍO DE MÉTODO, declarado (apunte del orquestador).** Usar
> `git stash` para medir el «antes» es **incorrecto en un swarm**: la pila
> de stash es del **repositorio**, no del worktree, y había otro worker
> operando en paralelo sobre el mismo repo. Hoy no hubo daño (pila vacía
> antes y después, `git status` limpio, `stash pop` sin conflicto), pero
> la práctica correcta es leer la base sin tocar el árbol compartido:
> `git show <base>:<ruta>`, o un worktree desechable. **No lo repito.**

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

   > ✅ **Destino fijado (DV-17)**: este residuo **no es deuda suelta ni WP
   > propio**. El custodio lo aplaza **al mismo momento** que la raíz del
   > namespace, para moverlo de una vez con el extension-id (§11.5).
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

   > ⚠️ **Enmarcado corregido (apunte del orquestador).** Llamarlo «lista de
   > rótulos» se queda corto: es un **cambio observable de superficie**. El
   > panel de Ajustes del IDE pasa de **12 filas a 8**: desaparecen «Theater
   > Config Path», «Auto Start Theater», «Hacker Mode» y «Status Bar:
   > Animation». Ninguna hacía nada (§2.3), así que no se pierde conducta —
   > pero **el usuario ve cuatro filas menos**, y eso se declara como cambio
   > observable, no como retoque cosmético.

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

> ⛔ **CAÍDA (D1, D2, D3, D6)** — esta tabla se firmó con **siete ✅** y
> tres no se sostenían. Tabla vigente, con lo que de verdad está verde y lo
> que queda ⚠️, en **§11.9**. Se conserva abajo para que se vea qué se
> afirmó de más.

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

- **R-1** · ~~La lectura de «los 3 prefijos se demuelen» (§1) es
  interpretativa…~~ ✅ **CERRADO por el custodio: DV-17** — el namespace se
  aplaza al momento de fijar la identidad pública, y **V23 cierra con
  `aleph0`**. Ya no hay riesgo abierto aquí; ningún worker lo reabre.
  Detalle y cita en **§11.5**.
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

— **V** · Aleph-0 (ℵ₀) · WP-V23 *(secciones 0-10: entrega original, con las marcas ⛔ de la devolución)*

---

# 11 · Corrección de la devolución

| dato | valor |
| ---- | ----- |
| Devolución | contrarrevisión adversarial read-only · **2 bloqueantes (D1, D2)** + **D3, D4, D6** menores + **D5** · 2 apuntes de método |
| D5 | **CERRADA por el custodio: DV-17** — el namespace se aplaza y V23 cierra con `aleph0`. Ya no es interpretación mía (§11.5) |
| Commits de corrección | `1718404` (D1, obra) · `cc4c462` (D2, docs de usuario) · `dd609ae` + este (reporte) |
| Qué NO se rehace | lo que la contrarrevisión declaró que resiste (§11.10) |

Los dos bloqueantes eran ciertos y los verifiqué **contra el código, no
contra el reporte**, antes de tocar nada. Los dos atacaban afirmaciones
mías, no el trabajo: el acta aplicaba su propio criterio en un sentido y
no en el otro (D1), y una fila de la tabla de silencios decía «sí» donde
la conducta real es peor que un silencio (D2).

## 11.0 · Resumen vigente (sustituye a §0)

| eje | antes | después **(vigente)** |
| --- | ----- | --------------------- |
| prefijos vivos en `contributes.configuration` | **3** (`aleph0.` 13 · `alephscript.` 12 · `mcpSocketManager.` 1) | **1** (`aleph0.`) |
| claves declaradas | **26** | **18** *(era 19 antes de D1)* |
| claves renombradas | — | **16** *(era 17; ollama sale)* |
| claves **fusionadas** (2 → 1) | — | **2 → 1** |
| claves **demolidas sin sustituta** | — | **7** *(era 6)* |
| claves con nombre intacto | — | **1** (`aleph0.room.id`) |
| claves declaradas **sin lector vivo** | 7 | **0** |
| residuales `alephscript|mcpSocketManager` clasificadas | — | **116 líneas / 121 ocurrencias · 0 configuración** |
| jest | 5 rojos · 1 skip · 111 verdes · 117 total | **idéntico** (§11.7) |
| `tsc --noEmit` | 8 errores preexistentes | **los mismos 8** (§11.7) |

Comprobación: 16 renombradas + 2 fusionadas + 7 demolidas + 1 intacta =
**26**, las 26 de la base. Y 16 + 1 (fusionada) + 1 (intacta) = **18**
declaradas.

## 11.1 · D1 — `aleph0.pieza.ollama.baseUrl` **se demuele** (7ª demolición)

**El cargo era correcto.** Verificado en cadena, sobre el árbol.

> 📌 **Las líneas de este bloque son de ANTES de la corrección** (rama en
> `82ba4b2`). Quien re-ejecute estos greps hoy obtendrá **0** para
> `resolveOllamaBaseUrl`: la función ya no existe. Se conservan porque son
> la prueba del cargo, no el estado actual. El estado actual está al final
> de este §11.1.

```text
$ grep -rn --include="*.ts" "resolveOllamaBaseUrl" src/ tests/
src/config/ziguratSettings.ts:107   (definición)
src/core/mcpConfigurationManager.ts:90,174   (2 consumidores)

$ grep -rn --exclude-dir={node_modules,.git,dist,out,plan} "getOllamaUrl" .
src/core/mcpConfigurationManager.ts:173      ← su propia definición. CERO llamadas.

$ grep -rn --include="*.ts" "getLauncherConfig|getFullConfig" src/ tests/
src/core/mcpConfigurationManager.ts:166      ← definición. CERO llamadas.
src/core/mcpConfigurationManager.ts:244      ← definición. CERO llamadas.
```

El camino `:90` escribe `this.config.launcher.ollamaUrl`, que sólo se lee
desde `getLauncherConfig()` (0 llamadas) y desde `getOllamaUrl()` (0
llamadas). **Las dos salidas del dato están tapiadas.** La clave estaba
declarada en el panel de Ajustes prometiendo un efecto inexistente.

**Elección, con su motivo (la devolución pedía elegir):** **demoler**, no
cablear. Cablear un consumidor sería **inventar funcionalidad** — no hay
en todo `src/` ni un cliente de Ollama (`grep -rin "ollama" src/` fuera de
la propia cadena → **1 línea**, y es un comentario). Inventar conducta es
justo el contrabando que la CA-6 prohíbe. Demoler es aplicar **el mismo
criterio de §2.3 en la dirección incómoda**, que es lo que faltaba.

**Fila del acta (se suma a §2.3):**

| # | clave demolida | prueba de que no tenía lector vivo |
| - | -------------- | ----------------------------------- |
| 8 | `aleph0.pieza.ollama.baseUrl` | cadena de arriba: `resolveOllamaBaseUrl` → `getOllamaUrl()` (0 llamadas) y → `config.launcher.ollamaUrl` → `getLauncherConfig()` (0 llamadas). **Ninguna salida viva** |

**Demolida entera, no sólo el schema.** Quitar la clave y dejar el lector
habría creado una **huérfana nº 22** — exactamente el defecto que §4.2
denuncia. Así que cae la cadena completa:

| fichero | qué se quita |
| ------- | ------------ |
| `package.json` | la propiedad `aleph0.pieza.ollama.baseUrl` |
| `src/config/ziguratSettings.ts` | el campo `ollamaBaseUrl` de `ZiguratSettings`, su `cfg.get(...)` y la función `resolveOllamaBaseUrl()` |
| `src/core/mcpConfigurationManager.ts` | el import, la lectura de `:90` (pasa a `"ollamaUrl": ""` con nota) y la rama de ajustes de `getOllamaUrl()` |

**Lo que NO cambia**: si hay fichero de ópera con `launcher.ollamaUrl`,
`getOllamaUrl()` lo sigue devolviendo. Sólo desaparece el camino por
ajustes, que no llegaba a ningún sitio.

**Verificación de facto** (sonda temporal, borrada al cerrar):

```text
√ el schema no la declara y el módulo de config no la lee
  claves declaradas: 18
  ¿queda alguna ollama? []
```

Estado **actual** del árbol (post-corrección, re-ejecutado):

```text
$ grep -rn -i --include="*.ts" --include="*.json" "ollama" src/ package.json
src/core/mcpConfigurationManager.ts:96,98   (mi nota de la corrección D1)
src/core/mcpConfigurationManager.ts:99     "ollamaUrl": ""   ← ya no viene de ajustes
src/core/mcpConfigurationManager.ts:172,176,177  (getOllamaUrl: sólo fichero de ópera)
src/mcpTypes.ts:40                          (campo del tipo del fichero de ópera)
package.json                                → SIN COINCIDENCIAS
→ cero claves de configuración, cero lecturas de ajustes
```

**Consecuencia declarada**: quien tuviera `aleph0.ollama.baseUrl` o
`zigurat.ollama.baseUrl` puesta la pierde **y no pasa nada**, porque nunca
hizo nada. Es la fila más honesta del acta y también la más aburrida.

**Anotado**: `getMcpServiceLauncherPort()` (`mcpConfigurationManager.ts`)
tiene el mismo patrón «ajuste → fichero» y **cero llamadas** hoy. No lo
toco: su clave (`aleph0.pieza.launcher.port`) **sí** tiene lectores vivos
por otras vías (`launcher/settings.ts`, `mcp/endpoint.ts`, `processManager.ts`),
así que no es una clave sin efecto — es un método muerto. Va a poda, no a
demolición de clave: **H-9**.

## 11.2 · D2 — el quinto silencio no es silencio: es sustitución por `localhost`

**El cargo era correcto y la fila de §3.1 era falsa.** `aleph0.ciudad.*`
tiene **cuatro** caminos de consumo, no tres. Los tres primeros nombran la
clave que falta. El cuarto, `getDefaultSocketUrl()`, hace otra cosa:

```ts
// src/core/mcpConfigurationManager.ts (conducta, sin cambios)
const fromSettings = resolveMeshSocketUrl();
if (fromSettings) { return fromSettings; }
const primaryUi = this.config?.ui?.find(ui => ui.config.isPrimary);
const port = primaryUi?.config?.port;
if (typeof port === 'number' && port > 0) {
    return `ws://localhost:${port}`;      // ← host INVENTADO
}
return '';
```

**Caso rojo reproducido por mí** (sonda temporal): usuario que tenía su
mesh real puesto **con las claves viejas**, y un fichero de ópera con una
UI primaria en 7777.

```text
SONDA V23 · D2 · CASO ROJO: sustitución silenciosa por localhost
  √ sin ciudad configurada + UI primaria en 7777 → devuelve ws://localhost:7777, sin ⏳
      getDefaultSocketUrl() = "ws://localhost:7777"
      ¿nombra alguna clave?  false
      ¿lleva ⏳?             false
  √ sin ciudad y SIN UI primaria → sí devuelve vacío (el camino que sí cumple el contrato)
      getDefaultSocketUrl() = ""
```

> ⛔ **BENDICIÓN RETIRADA (DD-2)** — llamar a esa rama «el camino que sí
> cumple el contrato» es falso **en superficie**: `socketsTreeView.ts:92`
> convierte ese `''` en `localhost:3000`, y ocurre también **sin fichero de
> ópera**. Además `configsTreeView.ts:430` **escribe** `ws://localhost:3000`
> en el fichero que genera. Escala real en **§12.2**.

**Por qué es peor que las cuatro filas «NO» que sí declaré**: aquéllas
degradan a **vacío** y la superficie pinta ⏳. Ésta degrada a un valor
**plausible y equivocado**, y se propaga:

```text
$ grep -rn --include="*.ts" "getDefaultSocketUrl" src/
src/core/bootstrap/assembleContext.ts:109   ← socketUrl del contexto de TODA la extensión
src/core/mcpConfigurationManager.ts:214     ← definición
src/socketMonitor.ts:276,280,284,643
src/treeViews/configsTreeView.ts:429
src/treeViews/socketsTreeView.ts:85,232
→ 8 sitios de consumo        ⛔ MAL CONTADO (DD-6): son 6 llamadas + 2
                             definiciones (una es un wrapper homónimo).
                             Recuento correcto en §12.6
```

El usuario que pierde el mesh no ve un hueco: ve un monitor de sockets
apuntando a su propia máquina.

**Agravante reconocido**: la afirmación falsa se propagó a superficie de
usuario en `docs/GUIA-PRUEBA-v2.md`. **Corregido** en el mismo commit.

**Fila vigente de §3.1:**

| clave nueva | ¿qué ve quien la perdió? | ¿ruidosa? |
| ----------- | ------------------------ | --------- |
| `aleph0.ciudad.host` / `.port` / `.baseUrl` | **3 de 4 caminos**: `⏳ aleph0.ciudad.baseUrl (o host+port) no configurado` (`AracneBotService.ts:102,246`, `identity/roomSettings.ts:33`, `libs/alephscript-client.ts:62`). **El 4º (`getDefaultSocketUrl()`) no**: si el fichero de ópera trae UI primaria, devuelve `ws://localhost:<puerto>` sin ⏳, sin log y sin nombrar clave — y ese valor alimenta 8 sitios | **NO en 1 de 4**, y es el peor caso de todo el WP |

**Qué corrijo y qué no, con el motivo:**

- ✅ **La mentira del comentario.** El docstring decía literalmente
  «*Vacío si nada configurado (⏳ — no inventa localhost:puerto)*» encima
  de la línea que inventa `localhost`. Eso **sí** es «prometer lo que no
  se hace» y **sí** es mío: el comentario ahora describe el defecto, cita
  los 8 consumidores y apunta a este §11.2.
- ❌ **La conducta.** Quitar el `localhost` es **cambio de conducta** sobre
  8 sitios de consumo, sin prueba en VS Code real, y cae de lleno en la
  fila de **WP-V31** («endpoints por variable, nunca por número»,
  `plan/BACKLOG.md:58`). Hacerlo aquí sería el contrabando que la CA-6
  prohíbe. **Es una línea**: si el orquestador lo quiere en este WP, lo
  pide y lo hago; no lo decido yo por mi cuenta. Enrutado como **H-10**
  con el caso rojo y las 8 llamadas ya listadas, para que V31 no repita el
  trabajo de encontrarlo.

## 11.3 · D3 — el patrón de V05 es ciego, y su verde era vacío

**El cargo era correcto.** El patrón de V05 exige `localhost:\d+`, así que
**no puede ver** `ws://localhost:${port}`: puerto interpolado, no dígitos.
Mi §5.2 lo re-ejecutó tal cual y firmó un ✅ sobre un patrón que no mira
donde está el defecto — y encima sobre uno de los cinco ficheros que la
propia CA cubre.

```text
### patrón V05 ORIGINAL, sobre sus 5 ficheros
$ rg -n 'localhost:\d+|127\.0\.0\.1:\d+|:\s*30(10|50|01|02|03|12)\b|port:\s*30\d\d|,\s*3050\)|http://localhost:\d+' <5 ficheros>
exit=1   → 0 coincidencias   ← VERDE VACÍO

### patrón CORREGIDO: host literal en una URL (lo que la CA quería medir)
$ rg -n '(ws|http)s?://(localhost|127\.0\.0\.1)' <los mismos 5 ficheros>
src/core/mcpConfigurationManager.ts:215     (mi comentario nuevo, describe el defecto)
src/core/mcpConfigurationManager.ts:231     ← ws://localhost:${port}   ← EL DEFECTO (D2)
exit=0
```

**Afirmación vigente sobre la CA de V05**, sin maquillaje:

- Los tres greps de V05 se **re-ejecutaron** y dan 0 **con su patrón** —
  eso es cierto y sigue siéndolo.
- Pero **su patrón es defectuoso desde V05**: con el patrón corregido hay
  **1 hit real** en su propio alcance, `mcpConfigurationManager.ts:231`,
  **preexistente** y anterior a este WP (era `getDefaultSocketUrl()` ya en
  la base). Es decir: **la CA de V05 llevaba verde por ceguera del patrón,
  no por limpieza del código.**
- Por tanto la CA-3 de este WP pasa de ✅ a **✅ con excepción declarada**
  (§11.9), y el defecto va a V31 como **H-10**.

**Regalo colateral para V31** — con el patrón corregido, el censo real de
hosts literales en `src/` no son 3 líneas sino **6 sitios**:

```text
$ rg -n '(ws|http)s?://(localhost|127\.0\.0\.1)|["'\''`](localhost|127\.0\.0\.1):' --glob '*.ts' src/
src/mcpServerManager.ts:381            http://localhost:${server.port || 'N/A'}
src/webViewManager.ts:246              http://localhost:${config.port}
src/core/mcpConfigurationManager.ts:231  ws://localhost:${port}          ← D2
src/treeViews/socketsTreeView.ts:92    'localhost:3000'  (fallback)
src/uiManager.ts:217                   http://localhost:${ui.port}
src/treeViews/configsTreeView.ts:430   "ws://localhost:3000"
```

Mi §8 H-3 decía «3 líneas, 2 ficheros». **Era incompleto por el mismo
patrón ciego.** H-3 queda sustituido por esta lista.

> ⛔ **TAMBIÉN CORTO (DD-4)** — llamé «censo real» a un patrón que sigue sin
> cazar `hostname: 'localhost'` (`src/mcpServerManager.ts:171`). Son **7
> sitios**, no 6. Barrido ancho y lista completa en **§12.4**.

## 11.4 · D4 — adopción y auto-escritura de un fichero que el usuario no eligió

**El cargo era correcto y la fila de §3.1 estaba incompleta.** Con
`aleph0.mcp.configPath` vacía, antes de llegar al aviso ⏳ que sí declaré,
`initialize()` hace esto:

1. Busca `ArrakisTheater_OperaConfig.json` en la raíz del workspace.
2. Si existe, **lo adopta** como configuración.
3. Y llama a `updateVSCodeSettings(configPath)`, que **escribe la ruta en
   los ajustes del workspace** — sin preguntar.

**Fila vigente de §3.1:**

| clave nueva | ¿qué ve quien la perdió? | ¿ruidosa? |
| ----------- | ------------------------ | --------- |
| `aleph0.mcp.configPath` | Si hay `ArrakisTheater_OperaConfig.json` en la raíz: **se adopta en silencio y se auto-escribe** en `settings.json` (workspace). El usuario que había perdido sus dos claves viejas puede acabar **apuntando a otro fichero**, persistido sin pedirlo. Si no lo hay: `⏳ Sin archivo Opera ni flota inventada…`, que **no nombra la clave nueva** | **NO** — y además **escribe** |

Es preexistente (V23 sólo fusionó las dos claves en una), pero mi tabla lo
presentaba como «parcial: avisa, pero no dice qué escribir», y eso se
quedaba corto: **antes de avisar, decide y persiste**. Enrutado como
**H-11** (junto a H-4, que ya señalaba la marca retirada en esa misma
ruta).

## 11.5 · D5 — **CERRADA por el custodio: DV-17.** El namespace se aplaza; V23 cierra con `aleph0`

Enruté esto como riesgo (R-1) y la contrarrevisión lo elevó. **El custodio
ha respondido**, y ya no es interpretación mía que haya que defender:

> **DV-17 · Namespace de configuración: se APLAZA; V23 cierra con `aleph0`**
> — decisión del custodio **2026-07-31** (decisión ⑦ del plan del hub).
> […] **La resolución**: **aplazar**. El namespace se decide **junto con la
> identidad pública del nuevo scope** (decisión ③: «hacerla muy
> Scriptorium»), no antes. Razón: cambiar el namespace dos veces es peor que
> cambiarlo tarde, y renombrarlo hoy costaría 19 claves que habría que
> volver a mover al cerrar la identidad. Cuando se cierre, el cambio se hace
> **de una vez con el extension-id**.
> **Consecuencia operativa**: **V23 cierra con `aleph0` tal cual** y su obra
> es válida como está; ningún worker reabre esto. El residuo declarado
> (identificadores de código que no se renombran, p. ej. el campo `meshHost`
> leyendo `ciudad.host`) queda igualmente aplazado a ese momento.
>
> — `plan/DECISIONES.md:29-47` en `main` (commit `0c08eed`). **Aún no está
> en mi rama**: mi base es `ef86fba` y no rebaso (§0). Citado leyendo
> `git show main:plan/DECISIONES.md`, sin tocar el árbol.

**Qué cambia en este reporte:**

- **§1 deja de ser una lectura a defender** y pasa a ser la aplicación de
  una decisión cerrada. La duda que planteé —si DV-16.a, cerrada «dentro
  de WP-V15», ataba a V23— queda respondida: **no se reabre ahora**, se
  reabre cuando se cierre la identidad pública, y entonces se mueve todo
  junto.
- **El dato incómodo que yo mismo puse por delante sigue siendo cierto y
  el custodio lo tuvo delante al decidir**: `aleph0` **no tiene fila** en
  `plan/LEXICO-ZIGURAT.md` §1; **`Zigurat` sí** (`:38`). DV-17 lo recoge
  literalmente. La raíz, por tanto, **no está justificada por la ontología
  sino por gobierno**, y eso se dice tal cual: es lo único del espacio de
  nombres que no sale del léxico, y es deliberado.
- **El residuo de identificadores de código** (§7.2 punto 1: el campo TS
  `meshHost` leyendo la clave `ciudad.host`) **no va a un WP suelto**:
  DV-17 lo aplaza **al mismo momento**, para que se mueva de una vez con
  la raíz y el extension-id. Corregido en §11.8 — ya no lo enruto a poda.
- **CA-4 pasa a ✅ sin ⏳** (§11.9): los segmentos salen del léxico con
  cita, y la raíz tiene ahora respaldo de gobierno explícito.

**Nota de exactitud sobre la cifra de DV-17**: la decisión habla de «19
claves que habría que volver a mover». Tras la corrección D1 (§11.1) son
**18** — la decisión se tomó con el número pre-devolución. El argumento no
depende de la cifra: 18 o 19, moverlas dos veces sigue siendo peor que
moverlas tarde. Lo anoto para que nadie lea el desajuste como una
contradicción.

## 11.6 · D6 — contabilidad

- **116, no 115.** El §9 decía «115 restos»; §5.1 decía 116. El bueno es
  **116 líneas** (y **121 ocurrencias**, porque cinco líneas contienen dos
  apariciones). Corregido en §5.1 y en §11.9.
- **Clase C = 4 en código, no 5.** Los `*.focus` que genera VS Code son
  **cuatro** (`hackerControlPanel`, `hackerCommandPanel`, `hackerConfigPanel`,
  `hackerTasksPanel`), invocados desde
  `src/core/bootstrap/commands/hackerPanelCommands.ts:18,39,60,81`. La
  quinta ocurrencia que mi script metió en ese cubo es **prosa** ya contada
  en otra clase: el clasificador ordenaba `.focus` antes que el cubo de
  ids de vista y se llevó una línea prestada. **El total 116 no cambia**;
  cambia el reparto entre dos cubos.

## 11.7 · Tests y compilación tras la corrección

| medida | base `ef86fba` | tras V23 (pre-devolución) | **tras la corrección** |
| ------ | -------------- | ------------------------- | ---------------------- |
| Test Suites | 1 failed / 7 passed / 8 | 1 / 7 / 8 | **1 / 7 / 8** |
| Tests | 5 failed · 1 skipped · 111 passed · **117** | idéntico | **idéntico** |
| `tsc --noEmit` | 8 errores | 8 | **8** (mismos ficheros y códigos) |
| `npm run compile` | exit 0 | exit 0 | **exit 0** |
| `npm run compile:production` | exit 0 | exit 0 | **exit 0** |
| `npm run lint` | 0 err / 159 warn | igual | **igual** |

Los 5 rojos siguen siendo los mismos cinco por nombre, con la misma causa
única (`vscode.window.onDidCloseTerminal is not a function`), listados en
§6. **La demolición de la clave de ollama no movió un solo test**, lo cual
es coherente con que su cadena estuviera muerta.

## 11.8 · Hallazgos nuevos o corregidos

| # | hallazgo | evidencia | destino |
| - | -------- | --------- | ------- |
| **H-3** | ⛔ **sustituido**: decía «3 líneas, 2 ficheros» por patrón ciego. Son **6 sitios** con host literal en `src/` | §11.3 | **V31** |
| **H-9** | `getMcpServiceLauncherPort()`: mismo patrón «ajuste → fichero», **0 llamadas**. Método muerto (no clave sin efecto: su clave sí tiene lectores vivos por otras vías) | §11.1 | poda (**V13/V47**) |
| **H-13** | ⛔ **re-enrutado**: el residuo de §7.2 punto 1 (identificadores de código sin renombrar — el campo `meshHost` leyendo `ciudad.host`) **ya no va a un WP suelto**. **DV-17** lo aplaza al mismo momento que la raíz, para moverlo de una vez con el extension-id | `plan/DECISIONES.md:29-47` (en `main`) | **aplazado con la identidad pública** — no es deuda suelta |
| **H-10** | `getDefaultSocketUrl()` **inventa `ws://localhost:<puerto>`** contra su propio contrato; 8 sitios de consumo; caso rojo ya reproducido | §11.2 | **V31** — es una línea, con el caso rojo ya escrito |
| **H-11** | `initialize()` **adopta y auto-escribe** `ArrakisTheater_OperaConfig.json` de la raíz en los ajustes del workspace, sin preguntar | §11.4 | **V32** (+ **V47** por la marca) |
| **H-12** | `getOllamaUrl()`, `getLauncherConfig()`, `getFullConfig()`: **0 llamadas** cada uno. Superficie pública muerta en `McpConfigurationManager` | §11.1 | poda (**V13/V47**) |

Los demás (H-1, H-2, H-4 … H-8) siguen vigentes tal como están en §8.

## 11.9 · Auto-revisión vigente (sustituye a §9)

| CA | estado | dónde |
| -- | ------ | ----- |
| 1 · un namespace, grep con patrón y salida | ✅ | §5.1 — G1 `exit=1`; G2 **116 líneas / 121 ocurrencias** clasificadas sin resto (clase C = 4 en código); G3; manifiesto en positivo, ahora **18/0** |
| 2 · acta clave a clave, sin huecos, con decisión sobre el usuario | ✅ | §2 + **§11.1** (26 filas: 16 + 2→1 + **7** + 1) · §3 + **§11.2/§11.4** (pérdida declarada, con los silencios corregidos) |
| 3 · CA de V05 re-verificada de facto | ✅ **con excepción declarada** | §5.2 (re-ejecutada con su patrón) + **§11.3**: el patrón de V05 es ciego a puertos interpolados; con el corregido hay **1 hit preexistente** en su alcance, que es D2 |
| 4 · nombres desde la ontología, con cita | ✅ | §2.1 columna «fuente del nombre»: los **segmentos** salen del léxico con cita uno a uno. **La raíz `aleph0` no sale del léxico** (no tiene fila; `Zigurat` sí) y se sostiene por **gobierno, no por ontología**: el custodio la ratificó y aplazó su revisión en **DV-17** (§11.5). Dicho así de claro para que nadie lo lea como que el léxico avala la raíz |
| 5 · nada promete lo que no hace | ✅ | **§11.1** (7ª demolición; ahora sí **0** claves declaradas sin lector vivo, sobre 18) · §4.2 (las 21 huérfanas, el defecto inverso) · **§11.2/§11.4** (los dos silencios que faltaban) |
| 6 · cero contrabando | ✅ | §7.1 · §7.2 · §8 + **§11.8**. La corrección de D1 toca 3 ficheros y **borra** código; la de D2 toca **un comentario**, no la conducta |
| 7 · tests, números exactos antes → después | ✅ | §6 + **§11.7** |

## 11.10 · Lo que la contrarrevisión declaró que resiste — **no lo he tocado**

Verificado que sigue en pie tras los commits de corrección:

- **Ninguna clave vieja sobrevive**: patrón G1 → `exit=1` (re-ejecutado).
- **El acta es completa**: las 26 filas cubren las 26 claves de la base.
- **Las 7 demoliciones están fundadas** contra la base, no contra el reporte.
- **Las 21 huérfanas siguen siendo 21**: la corrección de D1 **no crea una
  nº 22** — por eso cae la cadena entera de lectura, no sólo el schema.
- **El léxico se respeta**: no he añadido ningún segmento nuevo; la
  demolición de ollama sólo **quita**.
- **C1 sigue saldada**: `servidor|servicio` en las descripciones del
  schema → **0** (ahora sobre 18 descripciones).
- **Los números siguen siendo honestos**: §11.7.
- **Sigue sin haber contrabando**: la corrección de D2 es un comentario.

---

— **V** · Aleph-0 (ℵ₀) · WP-V23 · corrección de la 1ª devolución *(§12 corrige lo que aquí quedó incompleto)*

---

# 12 · Corrección de la 2ª devolución (DD-1 … DD-6)

| dato | valor |
| ---- | ----- |
| Devolución | **2 bloqueantes (DD-1, DD-2)** + DD-3 (menor-alto) + DD-4, DD-5, DD-6 |
| Qué **no** vuelve a revisarse | **D1 está aceptada**: demolición completa, sin huérfana nº 22, 18 claves con lector vivo trazado una a una |
| Naturaleza de los dos bloqueantes | los dos dicen lo mismo: **declaré la corrección de D2 como completa y no lo estaba**. Uno en la línea que yo mismo edité; el otro por quedarme corto al describir el defecto que estaba denunciando |

Los seis cargos son ciertos. Los verifiqué contra el código antes de tocar
nada, y **DD-2 y DD-3 son peores de lo que yo había escrito**, no mejores.

## 12.1 · DD-1 — la promesa que D2 refuta seguía viva, en mi propia línea

`docs/GUIA-PRUEBA-v2.md` decía, 47 líneas por debajo del aviso que acababa
de añadir:

> «Vacío/`null` en ciudad/pieza/room ⇒ la UI marca ⏳ (**no inventa
> endpoints**)»

**Y esa línea la editó este WP** (`mesh/launcher/room` → `ciudad/pieza/room`,
commit `82ba4b2`). Es decir: pasé por encima de la frase, la actualicé en su
parte de nombres y **dejé intacta la parte que D2 refuta**. Añadir un aviso
nuevo arriba no borra una promesa categórica abajo; un lector de la guía se
encuentra las dos y se queda con la que le conviene.

**Corregido** — texto vigente en la guía:

> Vacío/`null` en ciudad/pieza/room ⇒ **casi toda** la UI marca ⏳ y nombra
> la clave que falta. ⚠️ **No toda**: el árbol de sockets y las plantillas
> de configuración inventan `localhost:3000` en vez de decir ⏳.

Lección, sin adornos: **editar media frase es peor que no tocarla.** Al
renombrar dentro de una afirmación se hereda la afirmación entera, y pasa a
ser mía. Lo aplico al resto del diff: repasé las demás líneas de prosa que
este WP tocó buscando promesas heredadas del mismo tipo (§12.7).

## 12.2 · DD-2 — la condición sobraba, hay un sexto silencio, y uno **persiste** el invento

Mi aviso decía «si no pones `aleph0.ciudad.*` **y** tienes un fichero de
ópera con una UI primaria». **La `y` sobra.** Sonda propia, re-ejecutada:

```text
DD-2 · el invento de localhost ocurre CON y SIN fichero de ópera
  √ CON ópera + UI primaria → ws://localhost:7777
      getDefaultSocketUrl() = "ws://localhost:7777"
  √ SIN UI primaria → getDefaultSocketUrl() da "" … pero la SUPERFICIE pinta localhost:3000
      getDefaultSocketUrl() = ""            <- el contrato SÍ se cumple aquí
      socketsTreeView pinta = "localhost:3000"   <- ...pero la superficie NO
  √ SIN fichero de ópera en absoluto → la superficie pinta localhost:3000 igual
      isConfigLoaded()      = false
      socketsTreeView pinta = "localhost:3000"
```

**Retiro una bendición que di en §11.2.** Ahí escribí que la rama sin ciudad
y sin UI primaria era «**el camino que sí cumple el contrato**». Cumple el
contrato **del método** —devuelve `''`— y **no cumple nada en superficie**:
`src/treeViews/socketsTreeView.ts:83-93` convierte ese `''` en
`'localhost:3000'` porque la regex no casa con la cadena vacía y cae al
`return 'localhost:3000'; // fallback`. Bendecir una rama mirando sólo el
método y no la superficie es exactamente el error que la contrarrevisión me
señaló en D3 con otro nombre.

**Y hay un gemelo peor, que no pinta: escribe.**
`src/treeViews/configsTreeView.ts:426-430`, `createFromTemplate()`:

```ts
const defaultSocketUrl = this.configManager.isConfigLoaded()
    ? this.configManager.getDefaultSocketUrl()
    : "ws://localhost:3000";
```

Ese valor va **dentro del fichero de configuración que la extensión genera
para el usuario**. No es una etiqueta equivocada en un árbol: es un invento
**persistido en disco**, que el usuario se llevará puesto.

**Escala real del defecto, corregida:**

| condición | qué devuelve el método | qué ve/obtiene el usuario |
| --------- | ---------------------- | ------------------------- |
| ciudad puesta | la URL real | correcto |
| sin ciudad · con ópera y UI primaria | `ws://localhost:7777` | endpoint inventado en el árbol |
| sin ciudad · con ópera sin UI primaria | `''` ✔ | **`localhost:3000`** en el árbol |
| sin ciudad · **sin ópera** | `''` ✔ | **`localhost:3000`** en el árbol |
| cualquiera de las anteriores + «crear desde plantilla» | — | **`ws://localhost:3000` escrito en el fichero generado** |

**Corregido en las dos superficies de usuario** (guía y README): la condición
pasa a «**con o sin fichero de ópera**», con las tres variantes y la
persistencia dichas por su nombre. Y el docstring de `getDefaultSocketUrl()`
añade que devolver `''` **tampoco salva la superficie**.

**Sigue sin tocarse la conducta** — es de V31 —, pero el enrutado ya lleva el
mapa completo: **H-10 ampliado** (§12.6).

## 12.3 · DD-3 — mi evidencia de titular era verde sobre código muerto

**El cargo es correcto y es el más incómodo de los seis**, porque es el
mismo defecto que yo denuncié en D3, cometido por mí.

```text
$ grep -rn --include="*.ts" -E "from '[^']*\.\./mcp['/]|from '\./mcp['/]" src/ tests/ | grep -v "^src/mcp/"
exit=1   → CERO importadores de src/mcp/ desde src/

$ grep -rn --include="*.ts" "src/mcp/" tests/ | wc -l
7        → los únicos importadores están en tests/
```

Es decir: **todo `src/mcp/` es inalcanzable desde la extensión**. El mensaje
que puse como prueba estrella en §3.1, §4.1 y §5.3 —
`⏳ endpoint MCP 'launcher' sin configurar — falta: aleph0.pieza.launcher.host | ZEUS_HOST …` —
**no lo puede ver ningún usuario**. Y mi sonda lo importaba directo, así que
daba verde sobre código muerto.

**La conclusión aguanta; la evidencia no.** Las claves sobreviven por
lectores que **sí** están cableados al arranque, y esta vez lo trazo entero
en vez de citar el módulo más bonito:

```text
core/bootstrap/assembleContext.ts:32 → ResourceProjectionService
    → :70  readLauncherEndpointSettings()  → launcher/settings.ts:29,37
core/bootstrap/assembleContext.ts:30 → CatalogService → LauncherCatalogClient
    → :42,128 readLauncherEndpointSettings() · :46,133 mensajes ⏳
core/bootstrap/assembleContext.ts:33 → AuthorshipService
    → :148,213 resolveLineaEditorEndpoint() → mutation/settings.ts:56
```

**Sonda re-ejecutada usando SÓLO esos lectores** (salida literal):

```text
DD-3 · hostil-omite por lectores ALCANZABLES desde el arranque
  √ cada ⏳ nombra la clave nueva, y el lector es alcanzable
    settings          : {"meshHost":"","meshBaseUrl":"","launcherHost":"","roomId":"","lineaEditorHost":"","repartoPath":""}
    launcher (vivo)   : {"configured":false,"reason":"⏳ setting ausente: aleph0.pieza.launcher.port (sin inventar puerto)"}
    lineaEditor (vivo): {"configured":false,"reason":"⏳ configure aleph0.pieza.lineaEditor.host+aleph0.pieza.lineaEditor.port o arranque launcher con linea-editor en catálogo"}
    room (vivo)       : {"configured":false,"roomId":"","endpoint":"","reason":"⏳ aleph0.room.id no configurado"}
```

**Ésta es la evidencia vigente** de que la pérdida de §3 es ruidosa: tres
caminos que un usuario **sí** recorre, cada uno nombrando su clave nueva.
Las citas de `src/mcp/endpoint.ts` en §3.1 y §4.1 quedan **degradadas a
secundarias** y marcadas; los bloques rancios llevan banner (DD-5).

`src/mcp/` entero se enruta como superficie muerta: **H-14**. Tenía razón la
devolución en que se me quedó fuera un módulo completo habiendo declarado
H-9 y H-12 por métodos sueltos.

> Nota de método: la sonda de este §12 corre con `diagnostics: false` en
> ts-jest **sólo dentro de la sonda**, porque importar la cadena viva arrastra
> `LauncherCatalogClient.ts:57,141`, que son **2 de los 8 errores TS
> preexistentes** del SDK MCP. No oculta nada: `tsc --noEmit` sigue
> contándolos aparte y sigue dando **8** (§12.8).

## 12.4 · DD-4 — «censo real» exige barrido ancho: son **7**, no 6

Cierto, y el fallo es de vocabulario con consecuencia: llamé «**censo real**»
a la salida de un patrón que sigue siendo estrecho. `hostname: 'localhost'`
no es una URL, así que ni el patrón corregido lo caza.

```text
$ grep -rn --include="*.ts" -iE "localhost|127\.0\.0\.1" src/
src/core/mcpConfigurationManager.ts:231   ws://localhost:${port}            ← D2
src/mcpServerManager.ts:171               hostname: 'localhost',            ← el que faltaba
src/mcpServerManager.ts:381               http://localhost:${server.port…}
src/treeViews/configsTreeView.ts:430      "ws://localhost:3000"             ← PERSISTIDO
src/treeViews/socketsTreeView.ts:92       'localhost:3000'  (fallback)      ← DD-2
src/uiManager.ts:217                      http://localhost:${ui.port}
src/webViewManager.ts:246                 http://localhost:${config.port}
→ 7 sitios  (+3 líneas de comentario, mías, describiendo el defecto)
```

**7 sitios.** Regla que me aplico: si escribo «censo», el barrido es ancho y
el patrón se enseña; si es estrecho, se llama «muestra» y se dice de qué es
ciega. H-3 queda con los 7.

## 12.5 · DD-5 — evidencia rancia sin marcador

Tres bloques de las secciones 5.x seguían mostrando la clave y el campo
demolidos por D1, sin decir que eran de antes. §4.1 y §5.1 sí llevaban
banner; éstos se me quedaron sin él. **Marcados**:

| bloque | qué mostraba de más | marca puesta |
| ------ | ------------------- | ------------ |
| volcado de defaults del schema (§5.2) | `aleph0.pieza.ollama.baseUrl` y 19 claves | 📌 evidencia rancia · vigente en §11.1 y aquí |
| salida de la sonda (§5.3), escenarios 1 y 2 | el campo `ollamaBaseUrl` | 📌 evidencia rancia **y** verde vacío (DD-3) |
| lectura al pie de la sonda (§5.3) | «cero valores inventados» | ⛔ matizada por §12.2 |

Volcado **vigente** (18 claves, re-ejecutado hoy):

```text
aleph0.ciudad.host                  ""      aleph0.pieza.reparto.path           ""
aleph0.ciudad.port                  null    aleph0.mcp.configPath               ""
aleph0.ciudad.baseUrl               ""      aleph0.superficie.statusBar.visible true
aleph0.room.id                      ""      aleph0.logging.level                "info"
aleph0.pieza.launcher.host          ""      aleph0.logging.enabledCategories    [8]
aleph0.pieza.launcher.port          null    aleph0.logging.show{Timestamp,Level,Category,Source} true
aleph0.pieza.lineaEditor.host       ""      aleph0.logging.maxEntries           10000
aleph0.pieza.lineaEditor.port       null
→ 18 claves · 0 fuera de `aleph0.` · 0 `ollama`
```

Regla que me aplico: **toda salida citada lleva fecha o commit**, o se
re-ejecuta al cerrar. Una salida sin marca envejece y se convierte en una
afirmación falsa sin que nadie la escriba.

## 12.6 · DD-6 — 6 llamadas, no 8; y la definición es `:223`

Conté mal por leer `grep | wc -l` como «llamadas». Las 9 líneas del grep
son: **2 definiciones** (la del manager y un **wrapper privado homónimo** en
`socketMonitor.ts:276`) y **7 usos**, de los cuales uno (`:284`) llama al
wrapper, no al manager.

```text
$ grep -rn --include="*.ts" "getDefaultSocketUrl" src/
  core/mcpConfigurationManager.ts:223   ← DEFINICIÓN (yo cité :214, que cae dentro de mi docstring)
  socketMonitor.ts:276                  ← 2ª definición: wrapper privado homónimo
  socketMonitor.ts:284                  ← llama al WRAPPER, no al manager
  --- llamadas reales al método del manager: 6 ---
  core/bootstrap/assembleContext.ts:109
  socketMonitor.ts:280
  socketMonitor.ts:643
  treeViews/configsTreeView.ts:429
  treeViews/socketsTreeView.ts:85
  treeViews/socketsTreeView.ts:232
```

**Corregido en los dos sitios**: el docstring de `getDefaultSocketUrl()` y
H-10. El docstring además nombra ahora los dos sitios donde el `''` tampoco
salva (`socketsTreeView.ts:92`, `configsTreeView.ts:430`).

## 12.7 · Barrido propio: ¿queda alguna otra promesa heredada?

DD-1 nace de editar media frase. Revisé **todas** las líneas de prosa que
este WP tocó, buscando afirmaciones categóricas sobre ⏳ o sobre invención
de endpoints que hubiera heredado al renombrar:

```text
$ grep -rniE "no inventa|sin inventar|⏳ honesto|marca ⏳|nada inventado" \
    README.md docs/ src/ --include=*.md --include=*.ts
```

| dónde | texto | veredicto |
| ----- | ----- | --------- |
| `docs/GUIA-PRUEBA-v2.md` | «no inventa endpoints» | ⛔ **era DD-1** → corregido (§12.1) |
| `README.md` | «cada camino ⏳ nombra la clave nueva» | ⚠️ corregido en §12.2: lleva su excepción |
| `src/launcher/settings.ts:29,37` | «sin inventar puerto» / «sin inventar host» | ✅ **cierto**: ese módulo no inventa (probado en §12.3) |
| `src/processManager.ts:181` | «no se arranca launcher con puerto inventado» | ✅ **cierto**: devuelve `false` |
| `src/mcp/endpoint.ts` | «V consume, no inventa» | ✅ cierto **pero inalcanzable** (H-14) |
| `src/config/ziguratSettings.ts:3` | «sin inventar hosts/puertos» | ✅ cierto para ese módulo |
| `src/core/mcpConfigurationManager.ts` | «no inventa localhost:puerto» | ⛔ era D2 → ya corregido |

> ⛔ **CAÍDA (D-1)** — el barrido **no estaba cerrado**: mi propio patrón
> devuelve **23 líneas en 15 ficheros** y esta tabla cubría 7. Faltaba una
> octava afirmación falsa, en el docblock de `AracneBotService` que este WP
> editó. **Eran dos heredadas falsas, no una.** Tabla vigente en **§13.4**.

## 12.8 · Nada roto — re-verificación tras DD-1…DD-6

| medida | base `ef86fba` | vigente |
| ------ | -------------- | ------- |
| claves declaradas | 26 | **18** · 0 fuera de `aleph0.` · 0 `ollama` |
| G1 (prefijos viejos como config) | — | **`exit=1`** |
| residuales clasificadas | — | **116 líneas / 121 ocurrencias** |
| huérfanas de `ConfigurationService` | 21 | **21** (ninguna nueva) |
| `servidor|servicio` en descripciones | — | **0** sobre 18 |
| Test Suites | 1 failed / 7 passed / 8 | **1 / 7 / 8** (ver §12.11) |
| Tests | 5 failed · 1 skipped · 111 passed · **117** | **idéntico en el conjunto determinista**; la suite además *flapea* — §12.11 |
| `tsc --noEmit` | 8 | **8** |
| `npm run lint` | 0 err / 159 warn | **igual** |
| `npm run compile` · `compile:production` | exit 0 | **exit 0** |
| `npm run probe:v08` | PASS | **PASS** |

**Alcance del diff de esta corrección**: `docs/GUIA-PRUEBA-v2.md`,
`README.md`, `src/core/mcpConfigurationManager.ts` (**sólo el docstring**) y
este reporte. **Cero conducta**, cero logging, cero webviews.

## 12.11 · Hallazgo de la propia re-verificación: la suite **flapea**

No me lo pidió la devolución; salió al re-verificar, y si no lo escribo
estoy repitiendo el pecado de DD-5 (dar por buena una medición de una sola
corrida).

**Cinco corridas consecutivas, mismo árbol, sin tocar nada entre ellas:**

```text
corrida 1: Tests: 5 failed, 1 skipped, 111 passed, 117 total
corrida 2: Tests: 5 failed, 1 skipped, 111 passed, 117 total
corrida 3: Tests: 5 failed, 1 skipped, 111 passed, 117 total
corrida 4: Tests: 6 failed, 1 skipped, 110 passed, 117 total   ← flapeo
corrida 5: Tests: 5 failed, 1 skipped, 111 passed, 117 total
```

En una tanda anterior, con la máquina más cargada, llegué a ver **8 fallos
y 3 suites**. El sexto rojo que aparece y desaparece tiene nombre:

```text
● Jest Setup Verification › should measure performance      (tests/basic.test.ts:23-33)
```

Es una aserción de **reloj de pared**: mide un `setTimeout(10)` y exige
`duration < 100 ms`. Bajo carga, no.

**Por qué no es mío, probado y no afirmado:**

```text
$ git diff --name-only ef86fba HEAD -- tests/
tests/integration/managerFactory.test.ts
tests/unit/mcp/clienteMcp.test.ts
tests/unit/mcp/endpoint.test.ts          ← los 3 únicos que toqué

$ git diff --quiet ef86fba HEAD -- tests/basic.test.ts                 → IDÉNTICO a la base
$ git diff --quiet ef86fba HEAD -- tests/performance/serviceStartup.test.ts → IDÉNTICO a la base
```

Los ficheros que flapean son **byte a byte los de la base**, y sus
aserciones son de tiempo y memoria, sin relación con configuración:

| fichero | umbral |
| ------- | ------ |
| `tests/basic.test.ts:32` | `duration < 100 ms` |
| `tests/basic.test.ts:132` | crecimiento de memoria `< 10 MB` |
| `tests/performance/serviceStartup.test.ts:17,54` | `< 100 ms`, `< 500 ms` |
| `tests/performance/serviceStartup.test.ts:37` | memoria `< 5 MB` |
| `tests/integration/managerFactory.test.ts:309` | `< 100 ms` |

**Afirmación vigente sobre CA-7**, ya sin redondear:

- **Conjunto determinista: 5 rojos**, los mismos cinco por nombre y con la
  misma causa única, **antes y después** (§6). Eso es lo que la CA compara
  y eso sí es idéntico.
- **Encima de eso, la suite no es determinista**: hay ≥1 test sensible a
  carga que entra y sale del rojo en el mismo árbol. Cualquier reporte de
  este mundo que diga «117/5/1/111» a secas —incluido el mío hasta ahora—
  está citando **una corrida**, no una medida.
- Mi «idéntico» de §11.7 y §12.8 se lee con esta nota: idéntico **en el
  conjunto determinista**; el flapeo es ruido heredado, no señal.

Enrutado como **H-15** → **V48** (que ya posee los 5 rojos) y **V76**: una
suite con umbrales de reloj no puede ser la guarda del mando de ciudad. Y
un apunte para el gate **R7-V**: si el arnés de CI compara conteos exactos
de jest, va a dar falsos rojos por esto.

## 12.9 · Hallazgos actualizados

| # | hallazgo | estado |
| - | -------- | ------ |
| **H-3** | hosts literales en `src/`: **7 sitios** (era «6», antes «3 líneas»). ⚠️ la mención «6 sitios» de §11.8 quedó sin marca: **el bueno es 7** | ampliado 2ª vez (DD-4) → **V31** |
| **H-10** | ⚠️ *líneas rancias, vigentes en §13.6* — `getDefaultSocketUrl()` inventa host. **6 llamadas** (no 8), definición ~~`:223`~~ → `:235`. **Y devolver `''` no salva**: `socketsTreeView.ts:92` pinta `localhost:3000` y `configsTreeView.ts:430` lo **escribe** en el fichero generado. Ocurre **con o sin ópera** | ampliado (DD-2, DD-6) → **V31** |
| **H-15** | **la suite jest no es determinista**: ≥1 test con umbral de reloj (`tests/basic.test.ts:32`) flapea bajo carga; ficheros idénticos a la base | **nuevo** (§12.11) → **V48 / V76**, y aviso al gate R7-V |
| **H-14** | **`src/mcp/` entero es inalcanzable**: cero importadores desde `src/`; sus únicos consumidores están en `tests/`. Módulo completo de superficie muerta — incluida la resolución de endpoint que V28 entregó | **nuevo** (DD-3) → poda / **V28-revisita** |

H-1, H-2, H-4 … H-9, H-11 … H-13 siguen como estaban.

## 12.10 · Auto-revisión vigente (sustituye a §11.9)

| CA | estado | dónde |
| -- | ------ | ----- |
| 1 · un namespace, uno solo | ✅ | §5.1 · G1 `exit=1` · 18/0 · 116 residuales clasificadas |
| 2 · acta clave a clave + decisión sobre el usuario | ✅ | §2 + §11.1 (26 = 16+2→1+7+1 → 18) · §3 + §11.2 + **§12.2** (los silencios, ya sin subestimar) |
| 3 · CA de V05 re-verificada de facto | ✅ **con excepción declarada** | §5.2 + §11.3 + **§12.4**: patrón ciego declarado, 7 sitios reales |
| 4 · nombres desde la ontología | ✅ | §2.1 (segmentos con cita) · §11.5 (la raíz, por gobierno: **DV-17**) |
| 5 · nada promete lo que no hace | ✅ | §11.1 (0 claves sin lector vivo sobre 18) · §4.2 (21 huérfanas) · **§12.1/§12.2/§12.7** (las promesas de prosa, barridas) |
| 6 · cero contrabando | ✅ | §12.8: esta corrección toca 2 docs y **un docstring** |
| 7 · tests antes → después | ✅ **con matiz declarado** | §12.8 (conjunto determinista idéntico: 5 rojos por nombre, misma causa) + **§12.11** (la suite flapea; medido en 5 corridas y probado que los ficheros que flapean son los de la base) |

---

— **V** · Aleph-0 (ℵ₀) · WP-V23 · corrección de la 2ª devolución *(§13 cierra lo que aquí quedó corto)*

---

# 13 · Corrección de cierre (D-1 · D-2 · D-3)

| dato | valor |
| ---- | ----- |
| Naturaleza | **documentación pura — cero conducta**, confirmado por el revisor |
| Qué resiste | DD-2 (3 variantes exactas), DD-3 entero, DD-4 (7 sitios, sin octavo), DD-5, DD-6, alcance limpio, y el flapeo (11 corridas del revisor: `5,5,5,6,7,5,5,5,5,5,5`) |
| Citas de línea | **al commit de cierre**. Donde se puede, la cita es por **símbolo**; la línea acompaña, no es la referencia (lección de D-2) |

## 13.1 · D-1 — había una octava, y estaba en el docblock que edité

**Mi §12.7 afirmó un barrido cerrado y no lo estaba.** Mi propio patrón
devuelve **23 líneas en 15 ficheros** (el revisor lo acotó a 12/7 con alcance
más estrecho; con el mío es peor). **Mi tabla cubría 7 filas.** Y la que
faltaba es DD-1 otra vez, letra por letra:

**`src/core/AracneBotService.ts:9`** (antes de esta corrección) —
`* Sin settings → ⏳ honesto, sin crash.`

Edité `:8` —**la línea de encima, mismo docblock**— cambiándole
`aleph0.mesh.*` → `aleph0.ciudad.*`, y dejé intacta la de debajo. Y edité
**directamente** el docstring de `isPending()`, falso por la misma vía.

**La cadena, verificada de punta a punta:**

```text
core/bootstrap/assembleContext.ts:109   socketUrl: mcpConfigManager.getDefaultSocketUrl()
   → sin `aleph0.ciudad.*` + ópera con UI primaria → "ws://localhost:7777"
AracneBotService.initialize()           socketUrl no vacío → pending = false
   → isPending() = false · getPendingStatus() = "ready"
   → connect() no dispara su guarda, y hay un comando de usuario que llega ahí
```

Es decir: **una cuarta superficie** —el bot Aracne— que ni la guía ni el
README nombraban, y que además **contradice el docstring que la promete**.

**Corregido (sólo prosa)**: el docblock de cabecera y el de `isPending()`
declaran ahora la vía por la que el ⏳ no es honesto, con la cadena citada y
el enrutado a V31. **Conducta intacta.**

**Lo que retiro**: la frase «una sola promesa heredada falsa, y era DD-1» de
§12.7. **Eran dos**, y la segunda estaba en un fichero que este WP editó dos
veces. Tabla vigente en §13.4.

## 13.2 · D-2 — cité líneas de antes de mi propio arreglo

Rompí en §12.4/§12.6 la regla que acababa de escribir en §12.5 («toda salida
citada lleva fecha o commit, o se re-ejecuta al cerrar»). El commit `7776b13`
alargó el docstring **+9 líneas** y el reporte se escribió **después**:

| dije | era cierto en | valor al cerrar |
| ---- | ------------- | --------------- |
| definición `:223` | el commit padre | **`:235`** |
| `ws://localhost:${port}` en `:231` | el commit padre | **`:243`** |
| «+3 líneas de comentario» | el commit padre | **4** (5 tras §13.1) |

**Corregido en los tres sitios, incluido H-10** — que es el que abrirá V31 y
el que más daño hacía: apuntaba a una línea de docstring.

**Regla reforzada, y esta vez aplicada**: la referencia primaria es el
**símbolo** (`McpConfigurationManager.getDefaultSocketUrl()`), no el número;
el número acompaña y se declara «al commit de cierre».

## 13.3 · D-3 — la plantilla no escribe lo que yo decía

Cierto: es un **ternario**, y `"ws://localhost:3000"` es sólo la rama «sin
config cargada». `src/treeViews/configsTreeView.ts` (`createFromTemplate`):

```ts
const defaultSocketUrl = this.configManager.isConfigLoaded()
    ? this.configManager.getDefaultSocketUrl()   // ← puede ser el invento, o ""
    : "ws://localhost:3000";                     // ← sólo si NO hay config
```

**Las tres variantes reales de lo que se persiste:**

| condición | valor escrito en el fichero generado |
| --------- | ------------------------------------ |
| ópera + UI primaria | **`"ws://localhost:7777"`** ← otro invento, que yo no había dicho |
| ópera sin UI primaria | **`""`** ← aquí mi aviso sobraba |
| sin ópera | **`"ws://localhost:3000"`** ← la única que coincidía con lo que escribí |

Y es en **2 de las 3 plantillas**: `xplus1` y `socket` (`url: defaultSocketUrl`);
la de `ui` no usa este valor.

**Corregido** en la guía, en el README, en el docstring de
`getDefaultSocketUrl()` y en la fila de §11 de donde salió.

**Contabilidad, también corregida:**

- `docs/GUIA-PRUEBA-v2.md` decía que el árbol pinta `ws://localhost:<puerto>`.
  El **método** devuelve eso; el **árbol** pinta **`localhost:7777`**, sin
  esquema — `socketsTreeView.ts:86-92` lo recorta con una regex. Es la misma
  distinción método/superficie que §12.2 dice haber aprendido, y la volví a
  mezclar en la línea de al lado.
- **H-3 descuadraba dentro del propio reporte**: §11.8 decía «6 sitios» y
  §12.9 «7». Marcado el sitio viejo; **el bueno es 7**.

## 13.4 · Tabla vigente del barrido de promesas (sustituye a §12.7)

Patrón, con su alcance declarado:

```text
$ grep -rniE "no inventa|sin inventar|⏳ honesto|marca ⏳|nada inventado" \
    README.md docs/ src/ --include=*.md --include=*.ts
→ 23 líneas · 15 ficheros
```

| # | dónde | veredicto |
| - | ----- | --------- |
| 1 | `docs/GUIA-PRUEBA-v2.md` «no inventa endpoints» | ⛔ falsa (DD-1) → corregida |
| 2 | `docs/GUIA-PRUEBA-v2.md` «casi toda la UI marca ⏳» | ✅ con su excepción |
| 3 | `docs/GUIA-PRUEBA-v2.md` «`motivos_deny` no inventados» | ✅ ajena (V08) |
| 4 | `README.md` «cada camino ⏳ nombra la clave» | ✅ con su excepción |
| 5 | **`src/core/AracneBotService.ts` cabecera** | ⛔ **falsa (D-1)** → corregida |
| 6 | **`src/core/AracneBotService.ts` `isPending()`** | ⛔ **falsa (D-1)** → corregida |
| 7 | `src/core/mcpConfigurationManager.ts` «no inventa localhost:puerto» | ⛔ era D2 → corregida |
| 8 | `src/config/ziguratSettings.ts:3` | ✅ cierta para ese módulo |
| 9 | `src/core/bootstrap/assembleContext.ts:91` «no inventa room/mesh» | ✅ cierta: es el *join*, no el `socketUrl` |
| 10 | `src/core/configurationService.ts:63` | ✅ mía, cierta |
| 11 | `src/identity/RoomIdentityService.ts:71` | ✅ cierta |
| 12 | `src/launcher/CatalogService.ts:10` | ✅ cierta |
| 13 | `src/launcher/LauncherCatalogClient.ts:35` | ✅ cierta |
| 14-16 | `src/launcher/settings.ts:14,29,37` | ✅ probadas en §12.3 |
| 17-19 | `src/mcp/endpoint.ts:6,14,131` | ✅ ciertas **pero inalcanzables** (H-14) |
| 20 | `src/mcp/types.ts:27` | ✅ cierta, mismo módulo muerto |
| 21 | `src/mutation/parseEditorInfo.ts:21,140` | ✅ ciertas |
| 22 | `src/mutation/settings.ts:21` | ✅ cierta |
| 23 | `src/treeViews/mcpTreeView.ts:25,75` | ✅ ciertas (árbol MCP, no el de sockets) |

**Dos falsas heredadas, no una** — y las dos en ficheros que este WP editó.

## 13.5 · Cierre verificado

| medida | vigente |
| ------ | ------- |
| claves declaradas | **18** · 0 fuera de `aleph0.` · 0 `ollama` |
| G1 (prefijos viejos como config) | **`exit=1`** |
| «no inventa endpoints» en docs | **0** |
| residuales clasificadas | **116 líneas / 121 ocurrencias** |
| huérfanas de `ConfigurationService` | **21** |
| `servidor` \| `servicio` en las 18 descripciones | **0** |
| `tsc --noEmit` | **8** (los mismos) |
| `npm run lint` | 0 errores |
| `compile` · `compile:production` · `probe:v08` | exit 0 · exit 0 · PASS |
| jest | 5 rojos deterministas · 117 total (flapeo declarado, §12.11) |

**Alcance de esta corrección**: `docs/GUIA-PRUEBA-v2.md`, `README.md`, este
reporte, y **comentarios** en `src/core/AracneBotService.ts` y
`src/core/mcpConfigurationManager.ts`. **Cero conducta.**

## 13.6 · Hallazgos actualizados

| # | hallazgo | estado |
| - | -------- | ------ |
| **H-10** | `McpConfigurationManager.getDefaultSocketUrl()` (def. `:235`, invento en `:243`) · **6 llamadas** · el `''` tampoco salva: `socketsTreeView.ts:92` pinta `localhost:3000` y **`configsTreeView.ts:428-430` persiste el valor en 2 de 3 plantillas** (3 variantes en §13.3) | ampliado, **líneas al cierre** → **V31** |
| **H-16** | **`AracneBotService` es la 4ª superficie afectada**: con el invento inyectado, `isPending()=false` y `getPendingStatus()="ready"`; hay un comando de usuario que llega a `connect()` sin guarda | **nuevo** (D-1) → **V31**, misma raíz que H-10 |

H-1 … H-9, H-11 … H-15 siguen como estaban. **H-3: 7 sitios** (§12.4).

---

— **V** · Aleph-0 (ℵ₀) · WP-V23 · corrección de cierre
