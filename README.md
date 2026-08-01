# Aleph-0 · ℵ₀

**Aleph-0: host IDE de la ciudad — consumidor opt-in del contrato Z**

Extensión de VS Code que consume el contrato Z de la ciudad: identidad
(peer-card), catálogo MCP, autoría y elenco. Se instala desde el `.vsix`;
todavía **no** está publicada en ningún marketplace (deferred, DV-10).

Repo canónico: [`alephscriptorium-eng/V_SDK`](https://github.com/alephscriptorium-eng/V_SDK)

Plan y gobierno: [`plan/`](./plan/). Meta del carril: `.vsix` v1
contract-compliant lista para probar.

Semilla de producto importada desde
`escrivivir-co/vscode-alephscript-extension` @ `integration/beta/scriptorium`
(DV-03: historial preservado; tag `import/scriptorium-*`). El README legado
de la extensión se podó en WP-V13; queda en el historial y en el tag
`archive/pre-poda-ola-f`.

## Ajustes: un solo espacio de nombres (WP-V23)

Los ajustes viven en **un único espacio de nombres**, `aleph0.*`, y sus
segmentos salen del léxico del dominio
([`plan/LEXICO-ZIGURAT.md`](./plan/LEXICO-ZIGURAT.md)), no del gusto:

| grupo | qué contiene |
| ----- | ------------ |
| `aleph0.ciudad.*` | dónde escucha el runtime de la Ciudad (socket-server de Z) |
| `aleph0.room.id` | la room a la que el IDE hace join |
| `aleph0.pieza.<pieza>.*` | dónde vive cada **pieza** ajena que V consume |
| `aleph0.mcp.configPath` | fichero heredado que declara piezas MCP locales |
| `aleph0.superficie.*` | ajustes de las superficies de periferia de V |
| `aleph0.logging.*` | diagnóstico de la propia extensión |

Los otros dos prefijos que convivían —`alephscript.*` y
`mcpSocketManager.*`— **ya no existen** como ajustes.

**VS Code no migra ajustes solo.** Una clave vieja en `settings.json` queda
huérfana (aparece como *Unknown Configuration Setting*) y la extensión
**no** la lee: **no hay migración automática, hay pérdida declarada**
(invariante I-5: nadie ha usado nunca este código; no se preserva
compatibilidad). Si tenías claves puestas, reescríbelas con esta tabla.

En casi todos los casos la extensión te dirá qué falta: cada camino ⏳
**nombra la clave nueva**. ⚠️ **Salvo el árbol de sockets**: sin
`aleph0.ciudad.*` inventa un endpoint local en vez de decir ⏳ —
`localhost:7777` (el puerto de la UI primaria de tu fichero de ópera, sin
esquema) o `localhost:3000` si no hay ópera o no hay UI primaria. Y **2 de
las 3 plantillas** de configuración **escriben** ese valor inventado en el
fichero que generan. Defecto preexistente, documentado con su caso rojo en
el acta (§12-§13) y enrutado a WP-V31.

| clave vieja | clave nueva |
| ----------- | ----------- |
| `aleph0.mesh.host` | `aleph0.ciudad.host` |
| `aleph0.mesh.port` | `aleph0.ciudad.port` |
| `aleph0.mesh.baseUrl` | `aleph0.ciudad.baseUrl` |
| `aleph0.room.id` | `aleph0.room.id` *(sin cambio)* |
| `aleph0.launcher.host` | `aleph0.pieza.launcher.host` |
| `aleph0.launcher.port` | `aleph0.pieza.launcher.port` |
| `aleph0.lineaEditor.host` | `aleph0.pieza.lineaEditor.host` |
| `aleph0.lineaEditor.port` | `aleph0.pieza.lineaEditor.port` |
| `aleph0.reparto.path` | `aleph0.pieza.reparto.path` |
| `alephscript.configurationFile` | `aleph0.mcp.configPath` *(fusionada)* |
| `mcpSocketManager.configPath` | `aleph0.mcp.configPath` *(fusionada)* |
| `alephscript.statusBar.visible` | `aleph0.superficie.statusBar.visible` |
| `alephscript.logging.level` | `aleph0.logging.level` |
| `alephscript.logging.enabledCategories` | `aleph0.logging.enabledCategories` |
| `alephscript.logging.showTimestamp` | `aleph0.logging.showTimestamp` |
| `alephscript.logging.showLevel` | `aleph0.logging.showLevel` |
| `alephscript.logging.showCategory` | `aleph0.logging.showCategory` |
| `alephscript.logging.showSource` | `aleph0.logging.showSource` |
| `alephscript.logging.maxEntries` | `aleph0.logging.maxEntries` |

**Siete claves desaparecen sin sustituta** porque estaban declaradas y
**ningún código vivo las leía** — prometían un efecto que no existía:
`aleph0.theater.configPath`, `aleph0.theater.autoStart`,
`aleph0.theater.hackerMode`, `aleph0.ollama.baseUrl`,
`alephscript.autoLoadConfig`, `alephscript.configValidation`,
`alephscript.statusBar.animation`.
Ponerlas nunca hizo nada; quitarlas tampoco quita nada.
(La de `ollama` se sumó tras la contrarrevisión: su cadena de lectura
terminaba en dos métodos sin una sola llamada.)

26 claves antes → **18 después**. El acta completa, con el porqué de cada
nombre y qué ve el usuario que pierde la suya, está en
[`plan/REPORTES/WP-V23-config-intencional.md`](./plan/REPORTES/WP-V23-config-intencional.md).

El renombrado previo de `zigurat.*` / `arrakisTheater.*` a `aleph0.*`
(WP-V15 · DV-16.a) queda como historia: su tabla está en
`plan/REPORTES/WP-V15-espacios-nombres.md` §3 *[cita inerte]*.

### Comandos

Los **99** comandos del manifiesto cuelgan ahora de un prefijo único
**`aleph0.`** (antes `alephscript.` ×86, `zigurat.` ×7 y
`mcpSocketManager.` ×6). Los seis heredados de `mcpSocketManager` conservan
ese segundo segmento (`aleph0.mcpSocketManager.*`) porque es el
discriminante de categoría del panel de comandos.

Si tenías atajos propios en `keybindings.json` apuntando a
`alephscript.*` / `zigurat.*` / `mcpSocketManager.*`, cámbialos: el
identificador viejo ya no existe y el atajo queda mudo.

## Fronteras

- **z-sdk** y OASIS: solo lectura (contrato / referencia).
- Sin gitlink a-sdk en este repo (DV-04: señal «moved» es obra del carril A).
- Marketplace: deferred (fuera de este sprint).

## Qué verifica el pipeline

Un CI en verde **no** quiere decir «el producto funciona». Esto es lo que
comprueba de verdad, y lo que no. Escrito así a propósito: un reporte que
dice «CI PASS» a secas afirma más de lo que el flujo sostiene.

### `ci.yml` — push a `main` / `wp/**` y PR contra `main`

| Paso | Qué comprueba | ¿Condiciona el resultado? |
| ---- | ------------- | ------------------------- |
| `npm ci` | Las dependencias se instalan (incluye el registro privado). | **Sí** |
| `npm run lint` | `eslint` sobre `src/**/*.ts`. | **Sí** |
| `npm run compile:production` | El bundle de esbuild se genera. | **Sí** |
| `npm run probe:v08` | Compila `src/mutation/parseEditorInfo.ts` e importa **esa** pieza; contrato de `editor://info`. | **Sí** |
| `node scripts/rojos-jest.mjs --gate` | El **conjunto de tests en rojo, por nombre**, contra [`scripts/rojos-jest.baseline.txt`](./scripts/rojos-jest.baseline.txt). Falla en las **dos** direcciones: un rojo nuevo, y un rojo declarado que desaparece. Corre jest sin cobertura. | **Sí** |
| `npm test` | Segunda corrida de la suite, **instrumentada**: escribe el informe de cobertura. Por sí sola **no juzga** la cobertura. | **Sí** |
| `node scripts/cobertura-trinquete.mjs` | **El trinquete.** (1) **Censo**: ningún fichero de `src` puede desaparecer del mapa de cobertura sin declararse. (2) **Unidades cubiertas** contra [`scripts/cobertura.suelo.json`](./scripts/cobertura.suelo.json). Falla si bajan **y si suben sin registrarse**. | **Sí** |
| `grep continue-on-error` | Que no vuelva a entrar un paso blando en el flujo. | **Sí** |
| `npm run package:v1` | `vsce package` produce el `.vsix` y se sube como artefacto. | **Sí** |

**No queda ningún paso con `continue-on-error` en `ci.yml`** (WP-V93). Hasta
ese WP había uno, sobre el único paso que corría la suite — declarado en este
mismo README y aun así sin vigilar nada: su resultado no condicionaba el job,
el gate de rojos no se ejecutaba en CI, y el paso estaba **permanentemente en
rojo** por deuda de cobertura, con lo que su aportación real era cero.

Sobre la cobertura: **el trinquete no mide porcentajes, mide unidades
cubiertas** (hoy `statements 1541 · branches 545 · functions 272 ·
lines 1519`, MEDIDO). No exige **subir** la cobertura; exige que **no baje** —
y también que una **mejora se registre**, porque un trinquete que sólo se
mueve a la baja es una pendiente.

Por qué unidades y no porcentaje, con la medida delante: el denominador de
este repo **no es estable**. Tres ficheros de `src` son código real que no
compila (`TS2353`), así que no se instrumentan y sus sentencias no entran en
el total. MEDIDO: al entrar al mapa, el denominador crece **+135 sentencias y
+67 ramas** sin que lo cubierto se mueva ni una unidad. Con un umbral de
porcentaje eso significaba que **arreglar dos errores de tipos ponía CI en
rojo**, y que **romper la compilación de un fichero mal cubierto subía el
porcentaje** con la suite en verde. La meta histórica —85 %— era además deuda
disfrazada de umbral: al no cumplirse ningún día, no vigilaba ninguno.

Razonado entero, con las medidas, en [`jest.config.js`](./jest.config.js) y en
la cabecera de
[`scripts/cobertura-trinquete.mjs`](./scripts/cobertura-trinquete.mjs).

Sobre el lint: hay ocho reglas que el legado viola (`no-explicit-any` 248,
`no-unused-vars` 107 y seis más con 16 en total) y están en `warn` con su
recuento en [`.eslintrc.cjs`](./.eslintrc.cjs) — deuda visible en cada
corrida, no silenciada. El resto del conjunto recomendado está en `error`:
el paso **puede fallar** y falla en cuanto código nuevo lo viola.

### Lo que el pipeline NO comprueba

- **No linta `tests/**` ni `scripts/**`**: solo `src`. El instrumento del
  gate y sus 36 tests propios **no pasan por eslint en ningún paso**.
- **El gate no juzga si un test es bueno**, solo si el conjunto de rojos
  cambió. 410 tests en verde que no comprueben nada seguirían en verde.
- **La cobertura no bloquea por ser baja**, solo por bajar. El ~26 % actual
  es deuda declarada, y el trinquete no la reduce: **la congela**. Nada en el
  pipeline empuja hacia el 85 %.
- **El trinquete no vigila `scripts/` ni `tests/`**: `collectCoverageFrom` es
  solo `src/**`. El propio instrumento del gate queda fuera del número.
- **El suelo se puede bajar**: el trinquete impide que baje *sin firma*, no
  que baje. La firma es un diff en `scripts/cobertura.suelo.json`.
- **El trinquete no tiene tests propios**, al contrario que el gate de rojos
  (36). Deuda dicha, no disimulada.
- **`release.yml` no corre ni un test, ni lint, ni el gate**: `npm ci` →
  compilar → empaquetar → publicar. Y `ci.yml` **no se dispara con tags**
  (solo `main`, `wp/**` y PR), así que un `push` de tag ejecuta **únicamente**
  `release.yml`. **Se puede publicar un `.vsix` de un ref cuya suite no ha
  corrido nunca.** Es el hueco más grande que queda.
- El smoke vivo del probe V08 contra el servidor `linea-editor` sale `⏳`
  cuando no hay servidor: en CI **nunca** lo hay.
- No publica en ningún marketplace (deferred, DV-10).

### `ci.yml` — job `exthost`

Job aparte, en paralelo con `build`: descarga un VS Code real en el runner y
carga la extensión de dos maneras —desde el fuente (`dist/`) y desde el
`.vsix` instalado en un `extensions-dir` aislado—, bajo `xvfb`. Sus dos pasos
**condicionan el resultado** y la suite deja acta JSON: sin acta, el lanzador
falla. Es lo que cubre el hueco «no arranca la extensión en un VS Code real»
que este README declaraba antes de WP-V68.

### `release.yml` — tags `v*` y `workflow_dispatch`

El nombre del `.vsix` lo deriva [`scripts/vsix.mjs`](./scripts/vsix.mjs) de
`package.json` (`<name>-<version>.vsix`, hoy `aleph-0-0.1.0.vsix`): subir la
versión no deja flujos apuntando a un fichero inexistente. Dos guardas: el dispatch
manual aborta fuera de `main`, y el flujo aborta si el tag resuelto ya tiene
un release publicado (no se pisa un asset ya distribuido).
