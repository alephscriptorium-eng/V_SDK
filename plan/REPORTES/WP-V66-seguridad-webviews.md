# WP-V66 · Seguridad de webviews (CSP) — reporte

| dato | valor |
| ---- | ----- |
| agente | worker-V (swarm, rol WORKER — corrección de devolución) |
| fecha | 2026-08-01 |
| rama | `wp/v66-csp` (worktree `C:\S_LAB\wt\v-v66`) |
| base | `336f481` · obra previa `2bc8cbc..9f0a5d7` (7 commits) |
| commits | `4c2453f` (D1–D5) · `3aef24b` (reporte) · `8ca02ee` (DD4/DD5: tokenizador + ruta de disco sin scripts) · `453a422` (D-1..D-4 + `srcdoc`) · `84b0d77` (D-1 clasificador de URL + D-3 superficie) · `692f7c6` (D-A/D-B/D-C) · este reporte |
| eje(s) CA | tipo **seguridad** (PRACTICAS §4.4.4: *intenta el bypass, no releas la declaración*) + de facto sobre el HTML renderizado |
| revisor distinto del worker | `⏳ pendiente` — cierre, acotado a D-A (falso positivo de `a href`), D-B (`background`/`<image>` y la palabra «exhaustiva»), D-C (la frase de los límites) y que no se haya roto lo que resiste |
| estado propuesto | listo para contrarrevisión final |
| alcance | **DD1/DD2/DD3 excluidos por decisión del orquestador** → WP nuevo **V89** (ver Parte 3 quater) |

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

- `src/webview/security.ts` — motor de invariantes + lista blanca de fuentes (D2/D3/D4/D5); reescrito sobre el tokenizador y con el modelo de amenaza en la cabecera (DD4/DD5)
- `src/webview/htmlScan.ts` — **creado**: tokenizador HTML fail-closed (DD4/DD5); decodificación de referencias de carácter, rechazo de contenido extranjero, RAWTEXT en autocerrados y cabecera reescrita con sus límites (D-1..D-3)
- `src/webViewManager.ts` — guarda de HTML de disco y scripts opt-in (D3); ruta de disco sin scripts y `getDriverUIConfig` inerte (DD4/DD5)
- `tests/unit/webview/renderPointAnalysis.ts` — **creado**: derivación del censo desde el AST (D1)
- `tests/unit/webview/webviewCsp.test.ts` — reescrito el censo; casos rojos D1–D5 y DD4/DD5

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
(`URL_BEARING`: script/link/iframe/frame/embed/object/source/img/form, más los
añadidos en la 4ª ronda — ver Parte 3 bis-3, D-3) contra
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

- `stripHtmlComments` — una meta dentro de un comentario HTML deja de contar.
  *(Superado en la 2ª corrección: era una regex y se desincronizaba del
  tokenizador; ver DD5 en la Parte 3 bis. Hoy no existe — el escáner resuelve
  los comentarios.)*
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

> **Corrección exigida por la 2ª contrarrevisión.** La versión anterior de esta
> tabla decía «cazado — era rojo, ahora cae» en las filas 1B, 6, 7 y 8. Eso es
> **cierto para el payload enunciado y falso para la familia**: la revisión
> encontró variantes de una línea que siguen pasando. Reformulado abajo. No se
> vende más de lo que se cubre.

| # | vector | estado | dónde queda cazado / qué sigue abierto |
| - | ------ | ------ | -------------------------------------- |
| 1 | nonce hardcodeado / no criptográfico *(inferido)* | **cazado** (ya resistía) | `createNonce` + test «nonce distinto entre renders» por cada uno de los 25 puntos |
| 1B | alias del objeto webview + literales partidos | **cazado el payload enunciado** | cobertura derivada del AST + regla de sumideros, probado por inyección real en `src/`. **Abierto**: la regla de sumideros reconoce una *gramática*, no una operación — ver DD1/DD2/DD3, enrutados a **V89** |
| 2 | `unsafe-inline`/`unsafe-eval` por cualquier campo del helper *(inferido)* | **cazado** (ya resistía) | `assertSafeSource` lanza; e invariante sobre el documento entero |
| 3 | iframe a origen externo (`data:text/html`, `javascript:`, `http://localhost@evil.com`, `vscode-webview://`) *(inferido)* | **cazado** (ya resistía) | `requireLocalOrigin` + degradación a página inerte |
| 4 | entradas degeneradas *(inferido)* | **cazado** (ya resistía) | fail-closed del helper |
| 5 | `<script>`/`<style>` sin nonce *(inferido)* | **cazado** (ya resistía, ahora sobre atributos tokenizados) | `findWebviewHtmlViolations` §5 |
| 6 | **script externo CON nonce** (D2) | **cazado, ahora sí para la familia** | `URL_BEARING` + `isExtensionResourceUrl`. La 2ª revisión mostró que sólo cubría **valores entrecomillados** (DD4); con el tokenizador cubre también los valores sin comillas. Resiste `//host`, esquema en mayúsculas, `src` compuesto, `<link>`, `<img>`, `<iframe>`, `<form>`, `<base>` |
| 7 | render hostil en un ASIGNADOR ya censado | **cazado el payload enunciado** | cobertura derivada, probado inyectando en `aiCommands.ts`. **Abierto**: variantes que no son `EqualsToken` + `.html`, y colisión de nombre simple en `pathToCensus` → **V89** |
| 8 | render nº 26 en un PRODUCTOR ya censado | **cazado el payload enunciado** | cobertura derivada, probado inyectando en `bootstrapPages.ts`. **Abierto**: mismas variantes → **V89** |

Vectores nuevos cerrados de paso, no pedidos: `<base href>`, protocol-relative
`//host`, `<link>`/`<iframe>`/`<form>`/`<img>` remotos, segunda meta CSP,
sumidero que no procede de una llamada (HTML traído de la red).

---

## Parte 3 bis · Segunda contrarrevisión: DD4 y DD5

La 2ª contrarrevisión encontró cinco defectos. El orquestador partió el WP: **DD4
y DD5 se cierran aquí** (son vulnerabilidades reales, explotables **sin tocar
`src/`**); **DD1, DD2 y DD3 se van a V89** (son del censo, defensa contra
regresión, y merecen diseño en vez de parche).

### Por qué DD4 y DD5 eran vulnerabilidades de verdad

No hace falta ser colaborador del repo. `getDriverUIConfig()`
(`src/webViewManager.ts:404`) sirve el `index.html` de un **repo vecino**
(`…/state-machine-mcp-driver/public`) y pedía `enableScripts: true`. Quien pueda
escribir ese fichero ejecutaba JS —incluido JS remoto— dentro de un webview con
`acquireVsCodeApi()`. Eso es **entrada externa**, no un insider.

### La causa común: se estaba analizando HTML hostil con expresiones regulares

- **DD4** — `attrOf` (era `security.ts:186`) sólo leía valores **entrecomillados**.
  `src=https://evil.example/x.js` devolvía `undefined` y el bucle de
  `URL_BEARING` hacía `continue`: **se saltaba en silencio**. Igual con
  `onclick=alert(1)` (`:293`, la regex exigía comilla o backtick tras el `=`) y
  con `style=color:red` (`:297`).
- **DD5** — `stripHtmlComments` (era `:177`) se desincronizaba del tokenizador.
  `<!-->` es *abrupt-closing-of-empty-comment*: el navegador cierra el
  comentario ahí, la regex se comía hasta el `-->` siguiente. Y un `<!--` dentro
  de un **valor de atributo entrecomillado** no abre comentario para el
  navegador, pero sí para la regex. En ambos casos desaparecía del análisis
  marcado que el navegador ejecuta.

### La respuesta: tokenizar, y rechazar lo que no se pueda tokenizar

Se crea `src/webview/htmlScan.ts` (**creado**, 240 líneas): una máquina de
estados léxica que recorre el documento como lo hace un navegador para lo que
aquí importa — etiquetas, atributos **con y sin comillas**, comentarios **con sus
cierres abruptos**, y contenido RAWTEXT/RCDATA que **no se re-tokeniza**.
`findWebviewHtmlViolations` opera ahora sobre **atributos tokenizados**, no sobre
el texto crudo. Se elimina `stripHtmlComments`.

Y, siguiendo la instrucción de fondo del orquestador, el escáner **declara sus
errores**: comentario sin cerrar, valor de atributo sin cerrar, etiqueta sin
cerrar, RAWTEXT sin cierre. Ante cualquiera de ellos
`findWebviewHtmlViolations` **rechaza el documento** en vez de aprobarlo
(`security.ts`, §0 de la función). Aprobar lo que no se ha podido analizar era
el fallo de fondo, y ese sí queda cerrado por construcción.

**Alcance declarado**: `htmlScan.ts` no es un parser HTML5 completo (no construye
árbol, no hace *foster parenting*, no reconstruye elementos formateados). Cubre
el nivel **léxico**, que es donde viven estas invariantes. Un vector que dependa
de la construcción del árbol y no del léxico no está cubierto; se dice aquí en
vez de dejar que se descubra.

### La capa que no depende del parser

Un tokenizador mejor sigue siendo un tokenizador, así que la ruta de disco deja
de depender de él:

- `src/webViewManager.ts:104` — `enableScripts: config.enableScripts === true &&
  !config.localPath`. Si el contenido viene de disco, **no hay scripts, diga lo
  que diga la config**. Sin scripts no hay ejecución ni `acquireVsCodeApi()`
  aunque un documento burle el escáner.
- `src/webViewManager.ts:404` — `getDriverUIConfig()` pasa a `enableScripts:
  false`. **Cambio de comportamiento declarado**: ese panel queda inerte. Es la
  decisión correcta para HTML de terceros, y se anota como tal por si el
  propietario del driver UI necesita otra vía (servirlo por plantilla propia en
  vez de crudo, que es la alternativa que apuntaba el orquestador).

### Evidencia: los payloads contra el motor ANTERIOR y el actual

Ejecutando los mismos documentos contra `findWebviewHtmlViolations` de
`4c2453f` (motor con regex) y de `8ca02ee` (motor tokenizado):

```
=== DD4 · <script src=… SIN COMILLAS>, nonce válido y entrecomillado ===
  payload: <script nonce="AAAA…==" src=https://evil.example/x.js></script>
  ANTES (4c2453f): []                          ← 0 violaciones: VULNERABLE
  AHORA (8ca02ee): ["recurso remoto en <script src>: \"https://evil.example/x.js\""]

=== DD4 · onclick sin comillas ===
  ANTES: *** PASA 0 violaciones - VULNERABLE ***
  AHORA: handler inline presente: <div onclick=…>

=== DD4 · style sin comillas ===
  ANTES: *** PASA 0 violaciones - VULNERABLE ***
  AHORA: atributo style= inline presente en <div>

=== DD5 · <!--> cierre abrupto ===
  ANTES: *** PASA 0 violaciones - VULNERABLE ***
  AHORA: 2 violaciones -> <script> sin nonce | recurso remoto en <script src>

=== DD5 · <!-- en valor de atributo ===
  ANTES: *** PASA 0 violaciones - VULNERABLE ***
  AHORA: 2 violaciones -> <script> sin nonce | recurso remoto en <script src>
```

Y por mutación del arreglo (revertido, el caso rojo cae):

```
# el valor sin comillas vuelve a ser invisible
● DD4 › el tokenizador lee el valor sin comillas (antes: undefined)
# sin los cierres abruptos del spec
● DD5 › `<!-->` cierra el comentario ahí (abrupt-closing), no en el `-->` siguiente
```

Hay además tests de que **no es rechazo indiscriminado**: un comentario normal
—con `<script>` dentro— se ignora sin violaciones, un `<div onclick=…>` dentro
de una cadena JS de un `<script>` no cuenta como handler, y un `<script
src="vscode-resource:…">` nonceado sigue pasando.

---

## Parte 3 bis-2 · Tercera devolución: D-1, D-2, los dos falsos positivos y `srcdoc`

DD4 y DD5 quedaron cerrados en todas sus formas devueltas. La 3ª revisión
encontró **dos instancias nuevas de la misma clase** (confirmadas contra
`parse5`) y **dos falsos positivos**.

### La regla de cierre, y cómo ordena los arreglos

> «Escribir un tokenizador que empate con el navegador es una carrera que no se
> gana. Ésta es la última ronda en que la respuesta es *mejorar el tokenizador*.
> A partir de aquí, cualquier divergencia nueva se resuelve **estrechando la
> entrada**.»

Acatada, y se nota en el reparto: de los cuatro arreglos, **dos son rechazar** y
sólo uno es analizar mejor.

| # | defecto | respuesta | por qué esa y no la otra |
| - | ------- | --------- | ------------------------ |
| D-1 | referencias de carácter sin decodificar en valores de atributo | **analizar mejor** | afecta a **todos** los documentos, incluidos los renders propios, y rompía una invariante que el reporte publica y testea (la 6). No se puede estrechar la entrada sin prohibir `&amp;` |
| D-2 | `<svg>`/`<math>`: RCDATA aplicado sin contexto de namespace | **rechazar** | emular el constructor del árbol es exactamente perseguir al navegador |
| D-3 | `<script/>` autocerrado | corregir falso positivo | el navegador ignora el `/` y entra en RAWTEXT |
| D-4 | `<form action="">` | corregir falso positivo | es HTML válido; un falso positivo en una guarda es la vía por la que alguien la desactiva |
| `srcdoc` | superficie no cubierta | **rechazar** | es un documento entero dentro de un atributo: analizarlo sería volver a perseguir al navegador |

### D-1 · decodificación de referencias de carácter

`decodeAttributeValue` (`htmlScan.ts`) se aplica a los tres estados de valor de
atributo. Decodifica numéricas decimales y hexadecimales, con o sin `;`, y las
con nombre de `NAMED_REFS` — donde se incluyen a propósito las que sirven para
disfrazar un esquema o un separador: `Tab`, `NewLine`, `colon`, `sol`, `semi`,
`num`. Implementa la regla heredada del spec para el contexto de atributo (un
nombre sin `;` seguido de `=` o de alfanumérico **no** se decodifica).

*(Rectificado en la 4ª ronda: meterlas en la tabla cubría **sólo la posición 0**
del payload. El disfraz de esquema no era un problema de la tabla de entidades
sino del clasificador de URL — ver Parte 3 bis-3, D-1.)*

Lo que no está en la tabla **no se adivina**: se marca como no resuelta y
`findWebviewHtmlViolations` rechaza el documento si aparece donde importa —una
URL o el `content=` de una meta—, dejándola pasar donde es inocua (un `title=`).
Así el fail-closed muerde donde hay riesgo sin convertir cada `&eacute;` de un
tooltip en un rechazo.

### D-2 · contenido extranjero: se rechaza, no se emula

Todo documento con `<svg>` o `<math>` se rechaza. **Medido sobre 210 ficheros HTML del árbol** (202 de `coverage/`, 8 de
`node_modules/`; ver la rectificación en la Parte 3 bis-3 — no son un corpus
diverso): **209 tokenizan limpio** y el único rechazado es `Svg.html`, un fixture
*sobre* SVG, el límite declarado disparando donde se declara. Ninguno de los 25 puntos de render propios lo
usa, y hay un test que lo comprueba render a render en vez de afirmarlo.

### Evidencia: payloads contra el motor anterior (`8ca02ee`) y el actual

```
D-1 · src="&#104;ttps://…"          ANTES []  → AHORA recurso remoto en <script src>: "https://evil.example/x.js"
D-1 · src="&#x68;ttps://…"          ANTES []  → AHORA recurso remoto en <script src>
D-1 · src="&Tab;https://…"          ANTES []  → AHORA recurso remoto en <script src>
D-1 · baliza <img src="&#104;…">    ANTES []  → AHORA recurso remoto en <img src>
D-2 · <svg><title> esconde marcado  ANTES []  → AHORA documento no analizable, se rechaza: contenido extranjero <svg>
srcdoc · documento anidado          ANTES []  → AHORA <iframe srcdoc> no admitido: documento anidado sin analizar

--- falsos positivos, deben desaparecer ---
D-3 · <script/> con cuerpo          ANTES  handler inline presente: <div onclick=…>   → AHORA []
D-4 · <form action="">              ANTES  recurso remoto en <form action>: ""        → AHORA []
```

### La declaración del módulo, reescrita

La cabecera decía que implementaba «la misma máquina de estados que usa un
navegador para lo que aquí importa». **Esa frase es la que convertía cada
divergencia en defecto**, y era falsa en el sentido que importa: ningún parser a
mano cumple esa promesa. Ahora declara lo que de verdad es —un tokenizador
**acotado y deliberadamente incompleto**— y explicita su contrato como una
**asimetría**: *puede rechazar HTML válido; no puede aprobar HTML que no haya
entendido*. Debajo van enumerados los límites conocidos: contenido extranjero,
ausencia de construcción de árbol, tabla de referencias con nombre acotada, y
`srcdoc`.

### Por qué D-1 y D-2 fueron deuda y no incidente

Conviene que conste, porque es el argumento para seguir invirtiendo en la capa
arquitectónica antes que en el tokenizador. El revisor buscó caminos alternativos
de disco por todo `src/` y no encontró ninguno: `webViewManager.ts:246` es la
única lectura de disco que alimenta un `webview.html`, y `enableScripts` se niega
sobre el mismo campo del mismo objeto en la misma llamada. Es decir: **ni D-1 ni
D-2 daban ejecución de JS**, porque la ruta de disco ya iba sin scripts.

Esa capa la introduje en la corrección anterior (`8ca02ee`) por decisión propia,
no porque estuviera en la devolución: la devolución pedía cerrar DD4/DD5, y
añadí encima una defensa que no depende de que el análisis sea correcto. El
resultado es que los dos hallazgos siguientes de la misma clase llegaron como
deuda y no como incidente. La lección, para V89 y para quien herede esto: **una
capa que no depende del parser vale más que un parser mejor**.

---

## Parte 3 bis-3 · Cuarta devolución: D-1 (bloqueante), corpus y superficie de URLs

### D-1 · «arreglé el payload, no la clase» — el diagnóstico es correcto

La ronda anterior metió `Tab`, `NewLine`, `colon`, `sol` y `semi` en la tabla de
entidades y este reporte afirmó (`:426-428`) que estaban ahí «a propósito, las
que sirven para disfrazar un esquema». **Cubrí exactamente la posición 0** —donde
estaba el payload literal del informe— y nada más. Bastaba mover la entidad un
carácter:

```html
<img src="htt&Tab;ps://evil.example/x.png">
```

Y el control que zanja de quién era la culpa: **con un TAB literal crudo, sin
ninguna referencia de carácter de por medio, también se aprobaba**. El
tokenizador entregaba el valor correcto. El que fallaba era el **clasificador de
URL**, que daba por «relativo» todo lo que no casara su regex de esquema, cuando
el parser de la WHATWG borra TAB/LF/CR **en cualquier posición** antes de mirar
nada. Por eso la regla de cierre no lo ampara: no era una divergencia del
tokenizador.

**La delación estaba en casa**, y el revisor la señaló: el módulo tenía **dos
clasificadores de URL con dos criterios**. `isLocalOrigin` usaba `new URL` —que
normaliza— y `isExtensionResourceUrl` una regex escrita a mano —que no—.

**Arreglo por convergencia**, no por parche:

- `normalizeUrlForClassification` (`security.ts`) es ahora la **puerta de entrada
  única**: borra TAB/LF/CR en cualquier posición y recorta C0 y espacio en los
  extremos, igual que la WHATWG.
- La usan **los dos** clasificadores.
- En el caso `https`, el host lo extrae el **mismo parser** (`new URL().hostname`)
  que usa `isLocalOrigin`, en lugar de una segunda regex.

Evidencia contra el motor anterior (`b8ce346`):

```
D-1 · TAB LITERAL crudo (sin entidad)   ANTES []  → AHORA recurso remoto en <img src>
D-1 · htt&Tab;ps (entidad interior)     ANTES []  → AHORA recurso remoto en <img src>
D-1 · htt&#9;ps                         ANTES []  → AHORA recurso remoto en <img src>
D-1 · java&Tab;script: en <iframe>      ANTES []  → AHORA recurso remoto en <iframe src>
D-1 · <link href> con TAB               ANTES []  → AHORA recurso remoto en <link href>
```

Y un test que barre **las ocho posiciones** del esquema (`\thttps`, `h\tttps`,
`ht\ttps`, … `https:/\t/`), para que la próxima vez no valga cubrir una sola.

### D-2 · el corpus: lo que medí no era lo que dije

El reporte decía «210 ficheros HTML reales **del árbol**». Medido de verdad:
**202 son de `coverage/`** —salida generada por istanbul, ignorada por git, todas
del mismo plantillazo—, **8 de `node_modules/`**, y **0 ficheros HTML propios**:
este repo no tiene ninguno fuera de esas dos carpetas.

**La cifra era real pero la palabra «corpus» no**: 202 copias de una misma
plantilla generada no son diversidad, son una muestra de tamaño ~3. Redactado
como lo que es. La evidencia buena de esta propiedad **no es mía sino del
revisor**: 40 HTML legítimos escritos a mano, 0 falsos positivos — medidos
contra el `URL_BEARING` **de aquella ronda**, sin `a href` (ver Parte 3 bis-4,
D-A: la cita no cubre las ampliaciones posteriores).

Lo que sí sostiene mi medición, y sólo eso: sobre esos 210 ficheros el
**tokenizador** no rompe (209 sin error; el único rechazo es `Svg.html`, un
fixture *sobre* SVG, es decir el límite declarado disparando donde se declara).
Tras los cambios de esta ronda la cifra sigue siendo 209/210.

> Nota de método: medir «falsos positivos de la política» sobre HTML de terceros
> no tiene sentido y no lo he intentado — la política exige una meta CSP
> fail-closed y scripts nonceados, así que rechazaría casi todo HTML del mundo
> **por diseño**. La única medición honesta de FP es (a) sobre el tokenizador y
> (b) sobre los 25 puntos de render propios, que siguen en verde.

### D-3 · decidido: se acota la promesa y se cierra, no se aplaza

«Una URL» prometía más que los 9 pares de `URL_BEARING`. Elegí **cerrarlo aquí**
en vez de enrutarlo, porque se resuelve con la regla que ya existe:

- **Añadidos** (una sola URL por atributo): `<a ping>`, `formaction` de
  `<button>` y `<input>`, `<input src>`, `<video src>`, `<video poster>`,
  `<audio src>`, `<track src>`, y —desde la 5ª ronda— `background`.
  *(`<a href>`/`<area href>`/`cite` se añadieron aquí como recurso remoto y eso
  fue un error de categoría: ver Parte 3 bis-4, D-A.)*
- **Rechazados** (llevan varias URLs o una URL embebida en otra sintaxis, y
  analizarlos pediría un mini-parser por sintaxis, o sea volver a perseguir al
  navegador): `srcset`, `imagesrcset` y `<meta http-equiv="refresh">`.

*(Rectificado en la 5ª ronda: llamar a la lista «exhaustiva» era falso —`<image>`
y `background` la desmentían—. Ahora se declara **cerrada sobre tres
categorías**, con lo que queda fuera enumerado. Ver Parte 3 bis-4, D-B.)*

### Los cuatro límites anotados por el revisor

Añadidos a la cabecera de `htmlScan.ts`. `&#128;` frente a la tabla
windows-1252 (el revisor verificó carácter a carácter que ninguno de esos 32
code points puede formar esquema ni separador); ausencia de *longest match* en
referencias con nombre; y el cierre de RAWTEXT sin exigir delimitador detrás —
estas dos **rechazan de más, nunca de menos**.

*(El cuarto era `<image>`, y esta redacción lo contaba mal: iba en dirección
INSEGURA, como decía el propio código. En la 5ª ronda se cerró en vez de
anotarse — ver Parte 3 bis-4, D-B/D-C.)*

---

## Parte 3 bis-4 · Quinta devolución: una regresión mía y dos frases que no se sostenían

Esta ronda no trae caza nueva. Trae **una regresión que introdujo mi arreglo
anterior** y dos afirmaciones de este reporte que el código desmentía.

### D-A · el falso positivo que introduje con el mismo argumento con que maté otro

En la ronda anterior metí `a href` en `URL_BEARING` y lo vendí como «misma regla,
cero parsing nuevo». Es un **error de categoría**: un `<a href>` **no carga
nada**. La navegación externa en un webview abre el navegador del sistema, que es
una función intencionada.

Lo medido, y reproduzco la cifra del revisor: **202 de los 209 ficheros
analizables del árbol disparaban esa regla y sólo ésa** —un pie de página con un
enlace—. Caían `https://code.visualstudio.com/docs`, `mailto:`, `tel:`,
`vscode://` y **`command:`, el idiom documentado de los webviews de VS Code**.

Lo que lo hace peor: es **exactamente** el falso positivo que yo maté en
`<form action="">`, con un argumento que dejé escrito en el propio fichero — *un
falso positivo en una guarda es la vía por la que alguien acaba desactivándola*.
Lo introduje en la misma ronda, sin declararlo, mientras citaba esa frase.

**Arreglo.** Los atributos de URL se clasifican ahora por **lo que la URL hace**:

| categoría | atributos | política |
| --------- | --------- | -------- |
| `resource` — el navegador carga solo | `script src`, `link href`, `iframe`/`frame src`, `embed src`, `object data`, `source src`, `img src`, `input src`, `video src`/`poster`, `audio src`, `track src`, **`background`** | sólo recurso de la extensión (o peer local donde el cerco lo permite) |
| `resource` — petición de red con datos, aunque la dispare el usuario | `a ping` (baliza), `form action`, `formaction` | igual de estricto: es exfiltración, no navegación |
| `navigation` — no carga nada | `a href`, `area href`, `cite` | sólo se prohíben los esquemas que **ejecutan**: `javascript:`, `data:`, `vbscript:` (y su disfraz con TAB) |

```
regla <a href> disparada sobre los 209 analizables:   ANTES 202  →  AHORA 0

<a href="https://code.visualstudio.com/docs">   pasa      (legítimo)
<a href="command:aleph0.abrir">                 pasa      (idiom de VS Code)
<a href="javascript:alert(1)">                  CAE       esquema ejecutable en <a href>
<a href="java&Tab;script:alert(1)">             CAE       (el disfraz tampoco cuela por aquí)
<a ping="https://evil.example/p">               CAE       recurso remoto en <a ping>
```

**Contabilidad, corregida como se me pide**: los «40 HTML legítimos, cero falsos
positivos» del revisor se midieron contra un `URL_BEARING` **sin** `a href`.
Citarlos junto a la ronda que lo amplió era evidencia caducada. La cita queda
acotada a lo que cubría, y la evidencia de esta ronda es la propia: 202 → 0 sobre
los 209 analizables del árbol, más los casos dirigidos de arriba.

### D-B · «exhaustiva» era falso, y el primer contraejemplo era mío

- **`<image src>`** devolvía `[]` mientras mi propia cabecera admitía que el
  navegador lo construye como `<img>`. Un atributo que porta URL, mirado en
  silencio. **Cerrado en el tokenizador** con un renombre de una línea
  (`image` → `img`) en vez de dejarlo anotado: rechazaba **de menos**, y eso no
  se documenta, se arregla.
- **`background`** (en `body`, `table`, `thead`, `tbody`, `tfoot`, `tr`, `td`,
  `th`) lo cargan los tres navegadores como imagen de fondo, y no estaba ni en
  `URL_BEARING` ni entre los no soportados. **Añadido** como `resource`.

Y la palabra, corregida: la lista **ya no se declara exhaustiva sobre todo el
HTML** —no se puede demostrar— sino **cerrada sobre tres categorías**: carga de
subrecursos, destinos de navegación y envío de formularios. Lo que porta URL y
queda fuera está **enumerado y rechazado** (`srcset`, `imagesrcset`,
`meta http-equiv=refresh`, `srcdoc`), no mirado en silencio.

### D-C · el reporte decía lo contrario que el código

Escribí que `&#128;`/windows-1252 era «la única divergencia conocida en dirección
insegura» y que las otras tres «rechazan de más, nunca de menos», cuando
`htmlScan.ts` decía de `<image>`: *«va en dirección insegura sólo para
`img-src`»*. **Eran dos, no una**, y la ejecución le daba la razón al código.

Es, otra vez, la lección de esta ola: **el código lo sabía y el reporte no**. Con
`<image>` cerrado la frase vuelve a ser cierta —la divergencia insegura conocida
es una sola, la tabla windows-1252, que el revisor verificó carácter a carácter—
pero lo es porque se arregló el código, no porque se reescribiera la frase.

---

## Parte 3 ter · Modelo de amenaza (qué defiende cada capa)

Queda escrito aquí y en el contrato del helper (`src/webview/security.ts`,
cabecera) porque la confusión entre las dos capas es lo que produjo la primera
devolución y parte de la segunda.

**La guarda de ejecución** (`security.ts` + `htmlScan.ts` + `verifyDiskHtml`)
defiende **contra entrada externa**: HTML que la extensión no ha escrito y que
llega en tiempo de ejecución — hoy, el `index.html` de disco que sirve
`webViewManager` para un `localPath` de un repo vecino. El adversario es quien
pueda escribir ese fichero. Contra él las invariantes **son una frontera de
seguridad de verdad**, y por eso son fail-closed: lo que no se puede analizar se
rechaza, y la ruta de disco además va sin scripts.

**El censo de puntos de render** (`tests/unit/webview/webviewCsp.test.ts` +
`renderPointAnalysis.ts`) defiende otra cosa: **regresión en `src/`**. Detecta
que alguien añada un render sin CSP o con marcado inseguro por descuido. **No es
una frontera de seguridad** y no pretende resistir a un contribuyente hostil
deliberado: quien puede editar `src/` puede editar el test. Es análisis estático
contra código que el propio adversario escribe — una carrera sin final cerrado.
Vale como red contra el error, no contra el atacante. **No debe leerse ni citarse
como si protegiera de un atacante.**

Consecuencia práctica para quien lea el verde de la suite: los 25 puntos de
render en verde dicen «no ha entrado una regresión», no «esto es inexpugnable».

---

## Parte 3 quater · Insumo para V89 · por qué el censo es sintáctico donde debería ser semántico

Escrito por quien conoce el terreno, como pide el orquestador. DD1/DD2/DD3 **no
se corrigen aquí**. Lo que sigue es el diagnóstico para que V89 los rediseñe.

El error de diseño es uniforme: **la implementación reconoce una gramática
cuando debería reconocer una operación**. Tres manifestaciones concretas:

1. **La regla de sumideros reconoce una forma sintáctica, no una operación.**
   `analyzeSource` (`renderPointAnalysis.ts:214`) detecta un sumidero cuando ve
   un `ts.BinaryExpression` cuyo operador es `EqualsToken` y cuya izquierda es un
   `PropertyAccessExpression` **cuyo identificador se llama `html`**; y
   (`:231`) una clave `html` **sin comillas** en un literal de objeto que sea
   argumento de llamada. Lo que importa —«se está escribiendo la propiedad `html`
   de un objeto `Webview`»— no se comprueba en ningún sitio. Por tanto se le
   escapa toda forma que exprese la misma operación con otra sintaxis:
   `wv['ht'+'ml'] = …`, `{ 'html': … }` con la clave entrecomillada, un
   `Object.defineProperty`, un setter intermedio, desestructuración con
   renombrado, o cualquier alias por índice. La vía correcta es el **type
   checker** (`ts.createProgram` + `getTypeAtLocation`): preguntar si el objeto
   es un `vscode.Webview` y si el símbolo escrito es su propiedad `html`. Eso
   reconoce la operación y es indiferente a la sintaxis.

2. **`pathToCensus` resuelve por NOMBRE SIMPLE GLOBAL, y basta colisionar un
   nombre.** El grafo de llamadas se indexa en `byName` (`webviewCsp.test.ts`),
   un `Map<string, FnInfo[]>` de **nombre simple** → implementaciones. La
   consecuencia grave no es sólo que confunda dos funciones homónimas de módulos
   distintos: es que **la comprobación de intermediarios se evapora**. Si el
   primer salto ya encuentra *alguna* implementación censada con ese nombre, el
   camino tiene longitud 1, `chain.slice(0, -1)` queda vacío y **no se inspecciona
   ni un solo intermediario**. Es decir: nombrar una función igual que un render
   censado desactiva la regla de pureza entera. La vía correcta es resolver por
   **símbolo** (módulo + declaración), no por cadena.

3. **La detección de productores depende de literales adyacentes.** El criterio
   es «los literales propios de la función, concatenados, contienen `<html` o
   `<!DOCTYPE html`». Es robusto frente al troceado (por eso cazó 1B) pero no
   frente a que el HTML **no esté en literales de esa función**: constantes de
   módulo, `String.fromCharCode`, plantillas cargadas de disco, o simplemente
   repartir el documento entre dos funciones que se llaman. No hay análisis de
   flujo de datos, y sin él «esta función produce un documento» no es decidible
   sintácticamente.

4. **Aserción-por-grep, la misma fragilidad en otro sitio.** Los tests de la capa
   arquitectónica (`webviewCsp.test.ts:681` y `:976`) verifican una propiedad de
   **seguridad** —que la ruta de disco deniega scripts— leyendo el fichero
   fuente con `readFileSync` y buscando cadenas con `indexOf`/`slice`. Un
   reformateo los rompe; peor, un cambio semántico que conserve el texto los deja
   pasar en falso. Es exactamente el vicio del censo aplicado a otra cosa. V89
   debería sustituirlos por una comprobación sobre el **comportamiento**
   (invocar `createWebView` con un `localPath` contra un doble de `vscode` y
   observar las opciones con las que se creó el panel), no sobre el texto.

Recomendación para V89, en orden de valor: (a) mover el análisis al **type
checker** y resolver por símbolo; (b) hacer que la unidad sea la **operación**
(escritura sobre `Webview.html`) y no la forma; (c) plantearse si la garantía
debe seguir siendo estática o si conviene un **chokepoint de ejecución** —ver
Parte 6.1, donde explico por qué no lo hice aquí—, porque un único punto
validado en runtime hace irrelevante casi todo lo anterior; y (d) **decidir y
escribir qué adversario se persigue**, porque contra un contribuyente hostil el
análisis estático del propio repo no puede ganar, y perseguirlo consume esfuerzo
que rinde más en la guarda de ejecución.

Y una recomendación transversal, que es la lección de las tres rondas: cuando una
comprobación y la realidad puedan divergir, **invertir en que la divergencia no
importe** (capas que no dependen del análisis) rinde más que en cerrar la
divergencia.

---

## Parte 4 · Números de suite

Medidos con `npx jest --coverage=false` en el worktree.

| | antes (`9f0a5d7`) | 1ª (`4c2453f`) | 2ª DD4/DD5 (`8ca02ee`) | 3ª D-1..D-4 (`453a422`) | 4ª D-1/D-3 (`84b0d77`) | 5ª D-A/D-B (`HEAD`) |
| - | - | - | - | - | - | - |
| Test Suites | 1 failed, 8 passed, **9** | 1 failed, 8 passed, **9** | 1 failed, 8 passed, **9** | 1 failed, 8 passed, **9** | 1 failed, 8 passed, **9** | 1 failed, 8 passed, **9** |
| Tests | **5 failed**, 1 skipped, 173 passed, **179** | **5 failed**, 1 skipped, 198 passed, **204** | **5 failed**, 1 skipped, 213 passed, **219** | **5 failed**, 1 skipped, 226 passed, **232** | **5 failed**, 1 skipped, 234 passed, **240** | **5 failed**, 1 skipped, 239 passed, **245** |
| `webviewCsp.test.ts` | 62 | 87 | 102 | 115 | 123 | **128** |

**+66 tests sobre el baseline, +66 verdes, 0 rojos nuevos.** Ninguno de los 8
errores de `tsc` está en `src/webview/`.

Falsos positivos del **tokenizador**: 210 ficheros HTML del árbol (202 generados
por istanbul en `coverage/`, 8 de `node_modules/`, **0 propios** — el repo no
tiene HTML fuera de ahí), **209 sin error**; el único rechazo es `Svg.html`,
fixture sobre SVG. **No es un corpus diverso** y así se dice: la evidencia buena
de esta propiedad es la del revisor (40 HTML legítimos a mano, 0 falsos
positivos, medidos contra el `URL_BEARING` previo a `a href`). La medida propia
de la 5ª ronda sí es de la política: la regla `<a href>` pasó de dispararse en
**202 de 209** ficheros analizables a **0**.

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
- `Performance Tests › Service Initialization › should initialize services within time threshold` (`tests/performance/serviceStartup.test.ts:9` ⛔ *(cita rancia: fichero borrado entero por V90 (`c989de8`, §7.5). Se conserva porque era cierta al escribirse)*)

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
6. **No se corrigieron DD1, DD2 ni DD3** — decisión del orquestador, no mía:
   van a **V89 · endurecimiento del censo de puntos de render**, con su propio
   brief, porque son de otra clase (defensa contra regresión, no frontera de
   seguridad) y merecen diseño en vez de parche. El diagnóstico técnico para ese
   WP queda en la **Parte 3 quater**.
7. **`htmlScan.ts` no es un parser HTML5 completo.** Cubre el nivel léxico. No
   construye árbol ni implementa reglas de inserción, así que un vector que
   dependa de la construcción del árbol (y no del léxico) no está cubierto. Se
   compensa con la capa que no depende del parser: la ruta de disco va sin
   scripts.

### Observaciones anotadas, no corregidas (fuera de alcance)

- **Perilla muerta**: `'webview.enableScripts'` está declarada en
  `src/core/configurationService.ts:29` (tipo) y `:125` (default `true`) y **no
  la consume nadie**. No es explotable —precisamente porque nadie la lee— pero
  es una perilla de seguridad que aparenta existir y no existe. Candidata a poda
  o a cableado consciente; no la toco aquí porque no es de este WP.
- **Backstop accidental, no defensa**: el test de contabilidad
  (`webviewCsp.test.ts:394-399`) lleva la lista de ficheros asignadores
  **escrita a mano**, así que rompe ante cualquier fichero nuevo con `.html =`.
  Eso es un efecto colateral de una aserción de contabilidad, **no la regla de
  sumideros funcionando**. Se dice explícitamente para que nadie lo cuente como
  cobertura: si V89 sustituye esa aserción, no se pierde ninguna defensa, porque
  no la había.

---

## Parte 7 · Para el contrarrevisor

La contrarrevisión **final** está acotada a **D-1, D-2, los dos falsos positivos**
y a que no se haya roto lo que resiste. Cinco avisos para que el reintento sea
justo:

- **Rige la regla de cierre.** Si aparece otra divergencia del tokenizador,
  **no se persigue**: se estrecha la entrada. Una divergencia nueva no es
  automáticamente un defecto de esta entrega; es una entrada que hay que
  rechazar, y el módulo ya declara que puede rechazar HTML válido.
- **D-1 (4ª ronda) vive en `security.ts`, no en el tokenizador**: la puerta es
  `normalizeUrlForClassification` y los dos clasificadores que ahora la comparten.
  Un bypass aquí sería una normalización de URL que el navegador haga y ésta no.
- **D-2 vive en `src/webview/htmlScan.ts`.** Ganchos: `decodeAttributeValue`
  (numéricas, tabla `NAMED_REFS`, regla heredada del `;`), el marcado de
  referencias **no resueltas**, y `FOREIGN_CONTENT_ROOTS`. Recordar el alcance
  declarado en la cabecera: tokenizador **léxico**, sin árbol, con la tabla de
  nombres acotada a propósito.
- **El motor sigue siendo `findWebviewHtmlViolations`**: si se encuentra un HTML
  hostil que devuelva lista vacía, eso es el bypass. Si devuelve
  `documento no analizable, se rechaza: …`, eso es el comportamiento correcto,
  no un fallo.
- **Un rechazo no es un fallo.** Si un documento devuelve `documento no
  analizable, se rechaza: …` o `contenido extranjero <svg>…`, eso es el
  comportamiento contratado. El fallo sería lo contrario: un HTML que el
  navegador ejecuta y que devuelva `[]`.
- **No hace falta reintentar DD1/DD2/DD3**: están reconocidos como abiertos y
  enrutados a V89 (Parte 3 quater). Reintentarlos aquí encontrará lo ya
  admitido. Y **el censo no es una frontera de seguridad** (Parte 3 ter): un
  bypass que requiera editar `src/` no es una vulnerabilidad de la guarda.
- La suite entera debe correrse con `npx jest --coverage=false` (los umbrales de
  cobertura global están por debajo del mínimo desde antes de este WP y ensucian
  la salida).
