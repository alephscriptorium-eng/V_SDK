# WP-V66 · Seguridad de webviews (CSP) — reporte

| dato | valor |
| ---- | ----- |
| agente | worker-V (swarm, rol WORKER — corrección de devolución) |
| fecha | 2026-08-01 |
| rama | `wp/v66-csp` (worktree `C:\S_LAB\wt\v-v66`) |
| base | `336f481` · obra previa `2bc8cbc..9f0a5d7` (7 commits) |
| commits de esta corrección | `4c2453f` (corrección D1–D5) · este reporte |
| eje(s) CA | tipo **seguridad** (PRACTICAS §4.4.4: *intenta el bypass, no releas la declaración*) + de facto sobre el HTML renderizado |
| revisor distinto del worker | `⏳ pendiente` — **contrarrevisión adversarial obligatoria** (misma clase), debe reintentar los ocho vectores |
| estado propuesto | listo para contrarrevisión |

> **Nota de procedencia.** Este reporte se escribe en la corrección. El intento
> anterior **no dejó reporte** en `plan/REPORTES/` (no existía fichero que
> ampliar), así que aquí va el WP completo: primero lo que ya resistía, luego la
> sección **Corrección de la devolución**. El **informe original de
> contrarrevisión no está en el worktree**; la única fuente disponible es
> `plan/DEVOLUCION-V66-csp.md` (en `main`), y de ahí se reconstruyen los ocho
> vectores. Donde el enunciado exacto de un vector no consta, se dice.

---

## Parte 1 · Lo que ya estaba hecho y resiste (no se rehízo)

Enumerado por la devolución y verificado de nuevo aquí:

- Helper único `src/webview/security.ts` con **nonce criptográfico** por render
  (`crypto.randomBytes(16)`).
- `default-src 'none'` como base de toda CSP; cada permiso se añade por
  necesidad real.
- `unsafe-inline` / `unsafe-eval` **lanzan** desde cualquier campo del helper.
- **Cerco de iframes** local-first: `data:text/html`, `javascript:`,
  `http://localhost@evil.com`, `vscode-webview://` y cualquier origen externo
  degradan a **página inerte** (texto, sin iframe, sin ancla viva).
- Entradas degeneradas **fail-closed**.
- Endurecimiento real de paneles: 5 paneles a `{enableScripts:false,
  localResourceRoots:[]}` y `localResourceRoots` estrechado de `extensionUri` a
  `media/`.
- Cero contrabando: `package.json`, tablas de V80 y `tests/exthost/` sin tocar;
  ids de comandos 61 = 61.

Nada de lo anterior se ha modificado en esta corrección.

---

## Parte 2 · Corrección de la devolución

### Resumen del cambio de fondo

El defecto raíz (D1) no era una regla mal escrita sino **la unidad equivocada**:
el censo cerraba *ficheros* mediante una regex textual sobre el fuente. La
corrección cambia la unidad a **punto de render** y sustituye la lista escrita a
mano por una **enumeración derivada del AST** (compilador de TypeScript, ya
presente como devDep 5.9.3 — no se añadió ninguna dependencia).

Además, la guarda de ejecución y el test dejan de tener criterios distintos:
ambos llaman al **mismo motor**, `findWebviewHtmlViolations`
(`src/webview/security.ts:257`). No puede volver a ocurrir que «el test
comprueba una cosa y la guarda otra».

### Ficheros tocados

- `src/webview/security.ts` — motor de invariantes + lista blanca de fuentes (D2/D3/D4/D5)
- `src/webViewManager.ts` — guarda de HTML de disco y scripts opt-in (D3)
- `tests/unit/webview/renderPointAnalysis.ts` — **creado**: derivación del censo desde el AST (D1)
- `tests/unit/webview/webviewCsp.test.ts` — reescrito el censo; añadidos los casos rojos D1–D5

---

### D1 · El censo cerraba FICHEROS, no PUNTOS DE RENDER *(bloqueante, estructural)*

**Qué cambió.** `tests/unit/webview/renderPointAnalysis.ts` (creado, 288 líneas)
recorre el AST de cada `.ts` de `src/` y deriva dos cosas:

- **Puntos de render** — `analyzeSource` (`:150`) atribuye a cada función los
  literales que le pertenecen (excluyendo funciones anidadas), los **concatena**
  y aplica `DOC_SIGNAL` (`:23`) / `FRAG_SIGNAL` (`:26`). El identificador es
  `fichero::función`, la misma clave que usa el censo.
- **Sumideros** — toda asignación a `.html` (cualquiera que sea el objeto) y
  todo `{ html }` pasado como argumento de llamada.

Sobre eso, `tests/unit/webview/webviewCsp.test.ts:360` impone cinco reglas
**derivadas** (ninguna lista de ficheros):

1. todo documento derivado está en el censo con render de facto;
2. el censo no lista puntos muertos;
3. todo fragmento derivado está conectado a un render censado;
4. la contabilidad (21 documentos + 4 cuerpos de panel, 18 ficheros productores,
   4 asignadores) se **calcula**, no se declara;
5. todo sumidero delega en un render censado y **ningún intermediario del camino
   fabrica contenido** (`pathToCensus` reconstruye la cadena real de llamadas;
   un intermediario que no delega en limpio debe validar).

Por qué mata los tres bypass: el aliasado es irrelevante (no se mira *a qué* se
asigna, se mira el texto literal producido) y los literales partidos se
concatenan **antes** de mirar.

**Caso rojo.** Dos capas. (a) Tests sintéticos que alimentan `analyzeSource` con
los vectores literales del informe (`webviewCsp.test.ts:503`). (b) Prueba de
inyección real: se escribieron los tres bypass en `src/` y se corrió la suite.

```
# bypass 1B (fichero nuevo, alias + literales partidos)
# bypass 7  (render hostil añadido a aiCommands.ts, asignador censado)
# bypass 8  (render nº 26 exportado desde bootstrapPages.ts, productor censado)

● censo derivado del AST › todo documento de webview derivado de src/ está cubierto por el censo
● censo derivado del AST › la contabilidad declarada del censo se sostiene y es derivada
● censo derivado del AST › todo sumidero `.html =` de src/ delega en un render censado
● D1 › el mismo criterio está VERDE sobre src/ (no es un test que siempre falla)
Tests:       4 failed, 83 passed, 87 total

Huecos de cobertura detectados:
  "src/bypassProbe.ts::abrirPanelHostil",
  "src/core/bootstrap/commands/aiCommands.ts::registerAiDebugPanel",
  "src/webview/bootstrapPages.ts::renderPanelExtra",

Sumideros injustificados detectados:
  "src/bypassProbe.ts:3 — el HTML no procede de una llamada: wv.html = '<!DOCTYPE ' + 'html>' + ...",
  "src/core/bootstrap/commands/aiCommands.ts:190 — el HTML no procede de una llamada: panel.webview.html = `<!DOCTYPE html>...",
```

Los tres caen por **dos reglas independientes** a la vez (cobertura y sumidero).
Retirados los ficheros hostiles, la suite vuelve a 87/87.

---

### D2 · Script externo CON nonce pasaba *(bloqueante, explotable)*

**Qué cambió.** La invariante miraba que todo `<script>` llevara nonce y **nunca
miraba el `src`** — y `script-src 'nonce-X'` autoriza al navegador a ejecutar el
script remoto que porte ese nonce. Ahora `findWebviewHtmlViolations`
(`src/webview/security.ts:313`) resuelve **todo atributo que carga recurso**
(`URL_BEARING`, `:232`: script/link/iframe/embed/object/source/img/form) contra
`isExtensionResourceUrl` (`:211`): relativo o esquema de recurso de VS Code sí;
origen externo no, lleve nonce o no. `//host` no cuela como «relativo» y `<base>`
queda prohibido (reescribiría todas las URLs relativas).

Se admite explícitamente el `cspSource` real de VS Code (`vscode-resource:`,
`vscode-webview-resource:`, `https://*.vscode-cdn.net`) para no romper los
paneles que sí cargan `media/` por `asWebviewUri`.

**Caso rojo.** Inyectando el vector exacto del informe en un productor censado
(`src/uiManager.ts`, el `<body>` del render):

```
<script nonce="${nonce}" src="https://evil.example/x.js"></script>

● CSP de facto por punto de render censado › src/uiManager.ts::renderUiManagerPage
    — sin violaciones de la política de webview
Tests:       1 failed, 86 passed, 87 total
```

Y por mutación (desactivando el bucle de recursos remotos):

```
● D2 › <script nonce src="https://evil.example/x.js"> es violación
● D2 › CSS, iframe y form remotos también caen
Tests:       2 failed, 85 passed, 87 total
```

Hay además un test que comprueba que **no es un rechazo indiscriminado**: un
`<script src="vscode-resource:/ext/media/x.js">` nonceado sigue pasando.

---

### D3 · `hasCspMeta` validaba presencia, no política; y se servía disco con scripts

**Qué cambió.** `hasCspMeta` (era `security.ts:119-121`, regex de presencia)
**se elimina**. En su lugar:

- `stripHtmlComments` (`security.ts:177`) — una meta dentro de un comentario HTML
  deja de contar.
- `extractCspMetaContents` (`:201`) — extrae el `content` respetando el tipo de
  comilla (el `content="… 'none' …"` ya no se corta en la primera comilla simple).
- `findWebviewHtmlViolations` (`:257`) — exige `default-src 'none'` de arranque y
  valida la política completa; la meta vacía y la permisiva caen.
- `isSafeWebviewHtml` (`:338`) — predicado para el llamador.
- `src/webViewManager.ts:437` — `verifyDiskHtml`, función **pura y exportada**
  (es su propio caso de prueba): si el HTML de disco viola algo, devuelve la
  página de error en su lugar; el HTML hostil no llega al webview
  (`webViewManager.ts:245-246`).
- `src/webViewManager.ts:104` — `enableScripts: config.enableScripts === true`.
  Los scripts pasan a ser **opt-in**; omitir el campo ya no concede ejecución a
  contenido de disco de terceros (antes `!== false`, es decir true por omisión).

**Caso rojo.** Test directo con los tres HTML que antes daban `true`
(`webviewCsp.test.ts:636`), más mutación del quitado de comentarios:

```
# mutación: stripHtmlComments devuelve el html sin tocar
● D3 › meta CSP dentro de un comentario HTML NO cuenta
Tests:       1 failed, 86 passed, 87 total
```

`verifyDiskHtml` se prueba con cuatro entradas hostiles (meta comentada + script,
CSP permisiva, script remoto, `<body onload=>`): en las cuatro devuelve la página
de error, esa página tiene **cero** violaciones, no queda ningún `<script>` sin
nonce ni handler inline, y la URL hostil no aparece dentro de ninguna etiqueta
(sólo escapada como texto en un `<p>`). Y se comprueba que el HTML de disco que
**sí** cumple pasa intacto.

---

### D4 · El helper no validaba origen ni escapaba en `styleSource`/`imgSource`/`fontSource`

**Qué cambió.** `assertSafeSource` (`security.ts:94`) pasa de mirar sólo
`unsafe-*` a **lista blanca de tokens** (`CSP_SOURCE_TOKEN`, `:33`;
`isAllowedCspSourceToken`, `:84`): `'none'`, `'self'`, `'nonce-…'`, los tres
esquemas de `cspSource` de VS Code y los peers locales del cerco. Además rechaza
de plano `;` `"` `<` `>` y saltos de línea. Los nonces se validan aparte como
base64 puro (`assertSafeNonce`, `:117`).

Consecuencia: los tres vectores probados por el contrarrevisor lanzan —
origen https externo y comodín `*`; `styleSource` con `;` (que inyectaba
`script-src *`, token que no contiene ninguna palabra prohibida); y `styleSource`
con `"`, que rompía el atributo `content=` e **inyectaba un `<script>` vivo en el
`<head>`**.

**Caso rojo.** `webviewCsp.test.ts:692`, y por mutación (desactivando la lista
blanca y dejando sólo el guardián de metacaracteres):

```
● D4 › orígenes externos y comodines LANZAN en style/img/font
Tests:       1 failed, 86 passed, 87 total
```

Hay test de que **las fuentes legítimas siguen pasando** (`vscode-resource:`,
`vscode-webview-resource:`, `https://*.vscode-cdn.net`, `'self'`): la lista
blanca no rompe a los cuatro llamadores reales, que pasan `webview.cspSource`.

> Observación honesta: el guardián de metacaracteres (`:97`) es redundante con la
> lista blanca — mutarlo solo no pone nada en rojo. Se deja como segunda barrera,
> pero la que sostiene la propiedad es la lista blanca.

---

### D5 · El test sólo inspeccionaba la PRIMERA meta CSP *(menor)*

**Qué cambió.** `extractCspMetaContents` (`security.ts:201`) usa `match` global y
devuelve **todas** las metas; `findWebviewHtmlViolations` valida cada una y
acumula los nonces de todas.

**Caso rojo.** `webviewCsp.test.ts:733`, y por mutación (`.slice(0,1)`):

```
● D5 › una segunda meta permisiva pone el documento en rojo
● D5 › una segunda meta con fuente externa también cae
Tests:       2 failed, 85 passed, 87 total
```

---

## Parte 3 · Los ocho vectores, estado final

Reconstruidos desde `plan/DEVOLUCION-V66-csp.md` (el informe original no está en
el worktree; la numeración 1B/7/8 es literal del documento, el resto se infiere
de su §«Lo que SÍ resiste» y se marca como tal).

| # | vector | estado | dónde queda cazado |
| - | ------ | ------ | ------------------ |
| 1 | nonce hardcodeado / no criptográfico *(inferido)* | **cazado** (ya resistía) | `createNonce` + test «nonce distinto entre renders» por cada uno de los 25 puntos |
| 1B | alias del objeto webview + literales partidos | **cazado — era rojo, ahora cae** | cobertura derivada del AST + regla de sumideros; probado por inyección real en `src/` |
| 2 | `unsafe-inline`/`unsafe-eval` por cualquier campo del helper *(inferido)* | **cazado** (ya resistía) | `assertSafeSource` lanza; e invariante sobre el documento entero |
| 3 | iframe a origen externo (`data:text/html`, `javascript:`, `http://localhost@evil.com`, `vscode-webview://`) *(inferido)* | **cazado** (ya resistía) | `requireLocalOrigin` + degradación a página inerte |
| 4 | entradas degeneradas *(inferido)* | **cazado** (ya resistía) | fail-closed del helper |
| 5 | `<script>`/`<style>` sin nonce *(inferido)* | **cazado** (ya resistía, ahora en el motor común) | `findWebviewHtmlViolations` §5 |
| 6 | **script externo CON nonce** (D2) | **cazado — era rojo, ahora cae** | `URL_BEARING` + `isExtensionResourceUrl`; probado inyectando en `src/uiManager.ts` |
| 7 | render hostil en un ASIGNADOR ya censado | **cazado — era rojo, ahora cae** | cobertura derivada; probado inyectando en `aiCommands.ts` |
| 8 | render nº 26 en un PRODUCTOR ya censado | **cazado — era rojo, ahora cae** | cobertura derivada; probado inyectando en `bootstrapPages.ts` |

Vectores nuevos cerrados de paso, no pedidos: `<base href>`, protocol-relative
`//host`, `<link>`/`<iframe>`/`<form>`/`<img>` remotos, segunda meta CSP,
sumidero que no procede de una llamada (HTML traído de la red).

---

## Parte 4 · Números de suite

Medidos con `npx jest --coverage=false` en el worktree.

| | antes (`9f0a5d7`) | después (`4c2453f`) |
| - | - | - |
| Test Suites | 1 failed, 8 passed, **9** | 1 failed, 8 passed, **9** |
| Tests | **5 failed**, 1 skipped, 173 passed, **179** | **5 failed**, 1 skipped, 198 passed, **204** |
| `webviewCsp.test.ts` | 62 | **87** |

**+25 tests, +25 verdes, 0 rojos nuevos.**

Los **5 rojos históricos** son exactamente los mismos antes y después, todos en
el mismo fichero de integración, **ninguno tocado por este WP**:

1. `ManagerFactory Integration Tests › Manager Creation › should create process manager`
2. `ManagerFactory Integration Tests › Manager Creation › should create webview manager`
3. `ManagerFactory Integration Tests › Standard Managers Creation › should create all standard managers`
4. `ManagerFactory Integration Tests › Standard Managers Creation › should have proper dependency chain in standard managers`
5. `ManagerFactory Integration Tests › Performance › should handle concurrent manager creation`

### Nota de estabilidad (declarada, no escondida)

La suite se corrió **6 veces**. En 5 de las 6 el resultado fue exactamente
`5 failed, 1 skipped, 198 passed`. En **una** aparecieron 2 rojos adicionales:

- `Jest Setup Verification › should measure performance` (`tests/basic.test.ts`)
- `Performance Tests › Service Initialization › should initialize services within time threshold` (`tests/performance/serviceStartup.test.ts:9`)

Ambos son **aserciones de reloj de pared preexistentes**: hacen
`await setTimeout(…, 10)` y exigen `duration < 100`, es decir 90 ms de margen.
Cualquier carga de CPU en la máquina los tumba, y no dependen de este WP (en el
baseline `9f0a5d7` existen y pasan igual). Lo que sí aporta este WP es carga: el
análisis de AST parsea los 91 ficheros de `src/` una vez al cargar el módulo,
**1,25 s** de CPU, y jest corre las suites en paralelo. No se han tocado esos dos
tests (sería contrabando); se deja constancia de que **si el contrarrevisor ve 7
rojos en vez de 5, debe reintentar o usar `--runInBand`** antes de considerarlo
una regresión: los dos extras se identifican por nombre arriba.

`tsc --noEmit`: 8 errores, **los mismos 8 de antes** (ESM/CJS en
`src/elenco/RepartoElencoService.ts` e `src/identity/protocolApi.ts`; tipos del
SDK MCP en `LauncherCatalogClient` / `LineaEditorClient` / `McpResourceClient`).
Cero errores nuevos.

---

## Parte 5 · Contabilidad corregida

La devolución exigía rectificar las cifras y las afirmaciones. Ahora las cifras
**las calcula el test** (`webviewCsp.test.ts:383`), no el reporte:

- **25 puntos de render** = 21 documentos completos + 4 cuerpos de panel
  (`getHtmlContent` de los cuatro paneles hacker, que inyectan su fragmento en
  `BaseHackerPanelProvider::generateBaseHtml`).
- **18 ficheros productores** únicos (los 21 documentos no están en 21 ficheros:
  `bootstrapPages.ts` aporta 6 y `webViewManager.ts` 3).
- **4 ficheros asignadores** derivados —`aiCommands.ts`,
  `agentManagementCommands.ts`, `analyticsCommands.ts`, `webviewCommands.ts`—
  y no 6: `teatroCommands.ts` no asigna `.html` (reutiliza el provider) y
  `security.ts` es el helper, no un asignador. La cifra «6 asignadores / 24
  ficheros» del documento de devolución incluía esos dos; la enumeración
  derivada no los cuenta como tales.

Afirmaciones reformuladas al alcance real:

- ~~«TODOS con test»~~ → **los 25 puntos de render derivados del AST tienen
  render de facto y pasan el motor de invariantes**; lo que garantiza el test es
  que no exista un punto de render *fuera* de esa lista, no que cada rama
  interna de cada render esté ejercitada.
- ~~«guardas que lanzan ante orígenes externos»~~ → **lanzan** en
  `frameOrigins`/`connectOrigins` (`requireLocalOrigin`) y ahora también en
  `styleSource`/`imgSource`/`fontSource` (lista blanca). En cambio la guarda de
  HTML de disco **no lanza: degrada** a página de error. Y **no hay guarda de
  ejecución universal** sobre `webview.html` (ver §6).

---

## Parte 6 · Lo que NO se hizo, y por qué

1. **No hay chokepoint de ejecución universal para `webview.html`.** Lo evalué:
   encauzar los 24 sumideros por un `setWebviewHtml(webview, html)` que validara
   siempre sería la defensa más fuerte. No lo hice porque **no puedo probarlo en
   este entorno**: en VS Code moderno `asWebviewUri` devuelve
   `https://file+.vscode-resource.vscode-cdn.net/…` y `cspSource` es
   `https://*.vscode-cdn.net`; una lista blanca mal calibrada bloquearía **todos**
   los paneles reales, y el arnés de Extension Host (V68) no se puede correr aquí
   (requiere descargar VS Code). La validación en ejecución se limita por tanto a
   la frontera donde entra contenido ajeno: el HTML de disco (D3). El resto se
   sostiene **estáticamente** (reglas de cobertura y de sumideros). **Residuo
   conocido**: un `wv.html = f()` donde `f` traiga HTML de la red *y además* llame
   a un render censado para satisfacer la cadena pasaría el análisis estático —
   requiere lavado deliberado, y no hay hoy ningún caso así en `src/`.
2. **No se tocó `escapeHtml` del título en `generateBaseHtml`**
   (`src/views/BaseHackerPanelProvider.ts:104`): `<title>${title}</title>` y
   `${bodyContent}` se interpolan sin escapar. Hoy **no es explotable** (los
   cuatro llamadores pasan literales fijos y el `bodyContent` es fragmento propio,
   que el censo verifica), y escaparlo rompería el fragmento. Queda **anotado como
   deuda**, no corregido: está fuera de D1–D5 y habría sido contrabando.
3. **No se corrigieron los 5 rojos históricos de `ManagerFactory`** ni los 8
   errores de `tsc`: preexistentes y ajenos al alcance.
4. **No se tocó** `package.json`, tablas de V80, `tests/exthost/`, ni ninguna
   dependencia (el compilador de TypeScript ya estaba como devDep).
5. **No se reescribió historia**: los 7 commits previos siguen intactos; esta
   corrección son commits nuevos sobre `wp/v66-csp`.

---

## Parte 7 · Para el contrarrevisor

Los ocho vectores deben reintentarse. Tres avisos para que el reintento sea justo:

- El censo ya **no** tiene lista de ficheros que ampliar; para colar un render hay
  que hacer que el AST no lo vea. Los ganchos están en `renderPointAnalysis.ts`:
  `DOC_SIGNAL`/`FRAG_SIGNAL` (`:23`,`:26`), la atribución de literales a la
  función propietaria (`walkOwn`, `:139`, que no entra en funciones anidadas) y
  la detección de sumideros (`:214` para `.html =`, `:231` para `{ html }`).
- El motor de invariantes es `findWebviewHtmlViolations`; si se encuentra un HTML
  hostil que devuelva lista vacía, eso es el bypass.
- La suite entera debe correrse con `npx jest --coverage=false` (los umbrales de
  cobertura global están por debajo del mínimo desde antes de este WP y ensucian
  la salida).
