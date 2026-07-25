# CENSO-V12 · lo absorbido en WP-V02, con veredicto por entrada

| dato | valor |
| ---- | ----- |
| WP | **WP-V12 · Censo y veredicto** (Ola F · CORTE) |
| Rama | `wp/v12-censo-veredicto` |
| Worktree | `C:/S_LAB/.worktrees/v/v-sdk-wp-v12` |
| Árbol censado | `HEAD` = `1c90c43bfeafe6cabbc71a04440b4a962544aa83` |
| Qué es | el documento que la decisión **D-1** del custodio exige antes de podar nada |
| Qué NO es | una poda. **V12 decide; V13 ejecuta. Este WP no borra ni mueve nada.** |
| Escrituras de este WP | `plan/CENSO-V12.md` y `plan/REPORTES/WP-V12-censo-veredicto.md`, y ningún otro fichero |
| Procedencia | borrador de una sesión anterior que murió antes de commitear, **verificado fila a fila contra el disco** por la sesión que lo entrega (§9, y detalle en el reporte) |

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
| `.claude` | **queda** | 138 ficheros de espejo de skills; **no es legado** (ausente del tag del import: entró con `5c9348c merge: aceptar WP-V09`, justo como declara V-L4-08). Queda fuera del alcance de la amputación: esta es higiene nuestra, no contenido ajeno. Lo que sigue abierto no es el veredicto sino el **modo de versionado** (cola S · **V-L4-08** / DA-S19: canon-ignorado vs desviación-versionada); si se resuelve «canon-ignorado», el mecanismo es `git rm -r --cached .claude` —misma forma que `coverage/`, sin borrar del disco | disco (`git log --reverse -- .claude`) | no (`.vscodeignore:55`) |
| `.config` | **poda** | un solo fichero, `configstore/update-notifier-yo.json`: caché del *update-notifier* del generador `yo` en la máquina del autor del legado. Intacta desde el import; cero lectores en el repo | disco | no (`:54`) |
| `.esbuild.config.js` | **poda** | **está muerto.** El build real es el script `esbuild-base` con flags en línea (`package.json`); las dos únicas apariciones de la cadena `esbuild.config` en todo el repo son `.vscodeignore:35-36`, excluyéndolo del paquete | disco | no (`:36`) |
| `.eslintrc.cjs` | **queda** | nuestro, placeholder con `ignorePatterns: ['**/*']` que sostiene `npm run lint`. **WP-V16 (c)** decide si recibe reglas reales o el paso sale del CI (**V-L1-03**); en ninguno de los dos caminos se poda | disco | no (`:38`) |
| `.gitattributes` | **queda** | nuestro (`b208ab1`): fuerza LF en `*.sh`. Sin él, `core.autocrlf=true` saca `slot.sh` y `evidencia.sh` con CRLF y Git-Bash los rompe. Es infraestructura viva del lote | disco | sí — ningún patrón lo cubre; ruido para V13 |
| `.github` | **queda** | nuestro: `workflows/ci.yml` y `workflows/release.yml`. **WP-V16 (b)(c)(d)(e)** los corrige (nombre del `.vsix`, `lint`, guarda del dispatch, qué declara verificar); la carcasa se queda | disco | no (`:53`) |
| `.gitignore` | **queda** | legado pero ya modificado por nosotros: lleva `.slot.lock/`, `.slot.log` y `EVIDENCIA.md`. Su contradicción con `coverage/` trackeado se resuelve en la fila de `coverage` | disco | no (`:40`) |
| `.npmrc` | **queda** | nuestro (no está en el import): registra los scopes `@alephscript` y `@zeus`. **Necesario y comprobado**: `dependencies` incluye `@alephscript/mcp-core-sdk`, `@zeus/protocol` y `@zeus/reparto-kit` | disco | no (`:41`) |
| `.vscode` | **re-contenido** | mixto. `launch.json`/`tasks.json` son genéricos y útiles (F5 + `npm: compile`), aunque `launch.json` apunta a `out/**/*.js` y el bundle real es `dist/extension.js`. Lo legado que se va es `settings.json` (rutas absolutas de la máquina del autor: `/Users/morente/Desktop/NUEVA_BASE/…`) y `mcp.json` (declara `copilot-logs-mcp-server` en `localhost:3100`, que pertenece a la fila 17) | disco (§2 no lo lista) | no (`:10`) |
| `.vscodeignore` | **queda** | controla el empaquetado y ya lleva nuestro bloque «Gobierno / CI / ruido». Lleva duplicados declarados —`coverage/**` y `vibecoding/**` dos veces— en **V-L4-05** | disco | ⏳ ningún patrón lo cubre; `vsce` suele excluirlo por defecto. No verificable sin empaquetar |
| `ArrakisTheater_OperaConfig.json` | **poda** | config de la ópera del producto ajeno, intacta desde el import. La citan `.vscode/settings.json:2-3` y `demo/dummy_workspace/.vscode/settings.json`, ambas también fuera. **Corrección al borrador heredado:** además tiene consumidor en código vivo — `src/core/mcpConfigurationManager.ts:58-65` la busca como config por defecto, aunque **en el workspace del usuario** y con `fs.existsSync`, así que la poda degrada en silencio y no rompe (ver §6·D16, donde ese mismo código miente sobre qué fichero busca) | §2 fila 20 + disco | no (`:64`) |
| `FEATURE_CONFIGS` | **poda** | 4 documentos de arquitectura y planes del producto ajeno, intactos desde el import | §2 fila 20 | no (`:26`) |
| `INSTALL.md` | **poda** | «Manual de Empaquetado e Instalación Local» del producto ajeno, intacto desde el import. Cero referencias en el repo; su función la cubren `docs/GUIA-PRUEBA-v1.md` y los scripts `package:*` | disco (§2 no lo lista) | no (`:28`, `*.md`) |
| `LICENSE.md` | **re-contenido** | **es una licencia-broma y viaja en el paquete.** «Animus Iocandi Public License (AIPL) v1.0»: su preámbulo declara estar «diseñada para ser visualmente similar a una licencia de software libre legítima» y su §3.2 «no crea obligaciones legales reales». `package.json:7` declara `license: "SEE LICENSE IN LICENSE.md"` y `.vscodeignore:30` la re-incluye a propósito. Su §Aviso Legal (`:56`) se autodescribe «parodia […] no debe ser interpretado como una licencia legal válida», y **cierra con un marcador sin rellenar**: `Copyright © [Año] [Nombre del Autor]`. El producto propio necesita licencia propia — ver §7 (escalado) | disco (§2 no lo lista) | **sí** (`:30`, re-inclusión explícita) |
| `PLANIFICACION` | **poda** | 15 ficheros de iteraciones y políticas de *vibecoding* del producto ajeno, intactos desde el import | §2 fila 20 | no (`:22`) |
| `README-LEGACY-EXTENSION.md` | **poda** | es el README del producto ajeno, renombrado por el propio commit del import (`ecedaa2`) para dejar sitio al nuestro. Su único enlace vivo es `README.md:13`, que V14 reescribe | disco (§2 no lo lista) | no (`:28`) |
| `README.md` | **re-contenido** | nuestro y **viaja en el paquete** (`:29`). V14 lo pasa a **Aleph-0** (DV-16), **V-L4-07** le añade el puntero a la guía de prueba, y pierde el enlace a `README-LEGACY-EXTENSION.md` cuando esa fila se ejecute | disco | **sí** (`:29`) |
| `build-and-install.sh` | **poda** | script de build del producto ajeno, intacto desde el import. Sustituido por `npm run build:local` / `package:v1` | §2 fila 20 | no (`:59`) |
| `coverage` | **poda** | 72 ficheros de informe de cobertura de las pruebas del legado, congelados en el import (entraron con `6b77afb IT 1 - 10`, historia ajena). **Está en `.gitignore:2` y a la vez trackeado**, y `jest.config.js:12-13` corre con `collectCoverage: true` + `coverageDirectory: 'coverage'`: cada `npm test` reescribe 72 ficheros trackeados. La poda es `git rm -r --cached coverage` **además** del borrado. Adjudicación de **V17-B**: `git ls-files -i -c --exclude-standard` devuelve **72 rutas y las 72 son `coverage/`** — es el único camino trackeado-e-ignorado del repo, así que el hallazgo empieza y acaba en esta fila | disco (`git ls-files -i -c --exclude-standard` = 72, todas `coverage/`) | no (`:12` y `:56`) |
| `demo` | **poda** | `dummy_workspace` del producto ajeno (2 ficheros), que a su vez apunta a `ArrakisTheater_OperaConfig.json`. Intacto desde el import | §2 fila 20 | no (`:25`) |
| `docs` | **queda** | nuestro: `GUIA-PRUEBA-v1.md`, la guía del carril. **V-L5-01..03** la enmiendan (un solo artefacto en el paso 1, fixture adjunto, declarar que su barra de PASS exige runtime); ninguna la poda | disco (§2 no lo lista) | no (`:27`) |
| `fixtures` | **queda** | nuestro: `reparto-v1-demo.json`, fixture del probe V09 y del paso 10 de la guía. **V-L5-02** pide adjuntarlo al Release **precisamente porque** `.vscodeignore:16` lo excluye del paquete | disco (§2 no lo lista) | no (`:16`) |
| `jest.config.js` | **queda** | legado intacto, pero es el runner que **WP-V17** necesita para su prueba nueva. Al ejecutar la fila 21, V13 debe revisar `collectCoverageFrom` y el `coverageThreshold` global (75/80/85/85) — ver §6 | disco (§2 no lo lista) | no (`:37`) |
| `media` | **re-contenido** | **está vivo y viaja en el paquete.** De sus 23 ficheros, **17 son CSS/JS** que cargan superficies vivas (`BaseHackerPanelProvider.ts:84-87` para los 4 paneles, `AgentConfigEditorProvider.ts:83-84` y `AgentContentEditorProvider.ts:80-81` para los editores) y un **18º asset vivo es `mcp.svg`** (`mcpChatParticipant.ts:83`) — el borrador heredado decía «18 son CSS/JS», y son 17 + el svg. Los 5 restantes son marca legada: los 4 `arrakis-theater-icon*.png` que V14 sustituye (`package.json:34` `icon`) más `ICON_CREATION_GUIDE.md` | disco (§2 no lo lista) | **23 de 23** *(errata post-fusión, contrarrevisión de V13 con `unzip -l` sobre el paquete real: `ICON_CREATION_GUIDE.md` SÍ viaja — el razonamiento por glob de la contrarrevisión de V12 estaba equivocado; misma semántica que hace real a R-7 de V13)* |
| `nvm-exec.sh` | **poda** | envoltorio de `nvm` del producto ajeno, intacto desde el import | §2 fila 20 | no (`:60`) |
| `package-lock.json` | **queda** | lockfile del árbol de dependencias vigente (modificado por nosotros desde el import). V13 lo regenera si la poda quita dependencias | disco (§2 no lo lista) | sí — ningún patrón lo cubre; ruido para V13 |
| `package.json` | **re-contenido** | el manifiesto, y la mayor concentración de legado del repo: **115 comandos en 5 prefijos** (`alephscript` 86 · `copilotLogs` 12 · `zigurat` 7 · `mcpSocketManager` 6 · `ArrakisTheater` 4), `configuration.title: "Arrakis Theater Configuration"`, contenedor `arrakisTheater` titulado `🎭 Arrakis Theater`, `icon: ./media/arrakis-theater-icon.png`, 6 `chatParticipants`, 3 `jsonValidation` legados y 2 `customEditors`. Lo reescriben V13 (comandos podados), V14 (marca) y V15 (prefijos). **pend. DV-16 / DV-16.a** en lo que toca a nombres. **Dato que V15 necesita y que los documentos vigentes dan mal** (§6·D17): los comandos con prefijo `alephscript.` son **86**, no «~113»; 113 se acerca al total de prefijos legados (108 de 115) | §2 filas 1, 9-14, 16-19 + disco (`node -e` sobre `contributes`) | **sí** (manifiesto obligatorio) |
| `pics` | **poda** | 6 capturas del producto ajeno (`ARRAKIS_THEATER.png`, `THEATER_INSTALL_1.png`, …), intactas desde el import. Sólo las cita `README-LEGACY-EXTENSION.md`, que también se va | §2 fila 20 | no (`:48`) |
| `plan` | **queda** | gobierno del carril (26 ficheros). Registro **interno** por DV-16, fuera del alcance de la revisión de nombre por construcción | disco (§2 no lo lista) | no (`:52`) |
| `prompts` | **poda** | 17 ficheros de prompts del producto ajeno, intactos desde el import | §2 fila 20 | no (`:23`) |
| `sample-config.json` | **poda** | plantilla de config del producto ajeno, intacta desde el import. **Corregida la evidencia del borrador heredado, que era doblemente falsa** (§6·D15 y §6·D16): (1) `src/core/mcpConfigurationManager.ts:58-65` **no busca este fichero** —busca `ArrakisTheater_OperaConfig.json`, aunque el comentario y el log digan «sample-config.json»—; (2) `HackerConfigPanelProvider.ts:233` sí la lista, pero resuelve contra **el workspace del usuario** (`:228`) y filtra con `fs.existsSync` (`:241`), así que la poda **no** deja el panel SETTINGS ofreciendo un fichero inexistente: deja una búsqueda que nunca acierta. Nada vivo se rompe; lo que queda es una convención ajena muerta que V15 debe barrer | §2 fila 20 + disco | no (`:63`) |
| `schemas` | **re-contenido** | los 3 schemas del legado (`xplus1-config`, `socket-config`, `webrtc-ui-config`), intactos desde el import, **cableados en `contributes.jsonValidation` y viajando en el paquete**. Ahí está la dependencia dura: las 3 entradas del manifiesto apuntan a `./schemas/*.schema.json` **relativo al paquete**, así que borrarlos sin sustituirlos deja 3 declaraciones colgando. La cita del borrador heredado a `HackerConfigPanelProvider.ts:234-236` se mantiene pero **degradada**: ese panel resuelve contra el workspace y filtra con `fs.existsSync` (§6·D15), no se rompe. §2 ya dice «sustituir», no «poda» | §2 fila 16 + disco | **sí** — ningún patrón lo cubre, y `jsonValidation` lo necesita |
| `scripts` | **queda** | nuestro: los 3 probes (V07/V08/V09) que son la regresión con la que V13 demuestra que la poda no cambió el comportamiento, más `slot.sh` y `evidencia.sh`, la economía del swarm | disco (§2 no lo lista) | no (`:15`) |
| `setup-vscode-path.sh` | **poda** | script de PATH del producto ajeno, intacto desde el import. **Ya está roto**: `package.json` lo invoca como `sh ./setup-vscode-path`, sin la extensión `.sh` | §2 fila 20 + disco | no (`:61`) |
| `src` | **queda** | la raíz del código. Su veredicto se desglosa módulo a módulo en la **Tabla B**; la carcasa no se discute | §2 filas 2-19 | no como fuente (`:2-3`); lo que viaja es `dist/extension.js` |
| `test-extension.js` | **poda** | script de prueba manual del producto ajeno, intacto desde el import. Sólo lo citan `.vscodeignore` y `README-LEGACY-EXTENSION.md` | §2 fila 20 | no (`:62`) |
| `tests` | **re-contenido** | **no se puede podar entera.** `jest.config.js:33` depende de `tests/setup.ts` (`setupFilesAfterEnv`) y `:36-37` de `tests/mocks/vscode.mock.js` (`moduleNameMapper` de `^vscode$`); WP-V17 escribe `tests/unit/parseEditorInfo.test.ts` sobre ese mismo andamio. Lo que se va es el contenido legado (`basic`, `DonAlvaroValidation`, `integration/`, `performance/`, `unit/core/`, `unit/mcpChatParticipant`), que es la única cobertura del repo y es toda ajena. §2 fila 21 dice «poda **+ reemplazo**»: en el vocabulario de este censo, eso es re-contenido | §2 fila 21 + disco | no (`:11`) |
| `theatrical-content` | **poda** | 3 ficheros de contenido de agentes del legado (`isaac`), intactos desde el import. El código vivo los busca **en el workspace del usuario**, no en el paquete, así que borrar la copia del repo no rompe el cableado. **Corrección de recuento al borrador heredado:** las referencias no son 3 sino **7** — `extensionBootstrap.ts:1444,1529,1569,1610,1614`, `AgentConfigEditorProvider.ts:371` y `AgentContentEditorProvider.ts:249`—, y en el manifiesto son **dos** patrones de `customEditors`, no uno: `package.json:1446` (`*.agent.md`, que además casa con los 5 `src/theatrical/agents/*.agent.md`) y `package.json:1456` (`**/theatrical-content/configurations/agents/*.config.json`). Todo eso más `HackerConfigPanelProvider.ts:291-293` queda apuntando a una convención ajena que V13/V15 deben re-contener | §2 fila 20 + disco | no (`:58`) |
| `tsconfig.build.json` | **queda** | config de compilación legada e intacta, pero neutra: el producto propio compila igual | disco (§2 no lo lista) | no (`:34`) |
| `tsconfig.json` | **queda** | legado e intacto, y vivo: `compile:tests` es `tsc -p tsconfig.json`, y `ts-jest` lo usa | disco (§2 no lo lista) | no (`:33`) |
| `vibecoding` | **poda** | 68 ficheros de rondas de *vibecoding* del producto ajeno, intactos desde el import | §2 fila 20 | no (`:24` y `:57`) |

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
| `src/commandPaletteManager.ts` | **re-contenido** | legado intacto y vivo (511 líneas). Es la paleta heredada que describe y despacha los comandos `alephscript.*`; V15 la reescribe al unificar prefijos, y §2 fila 10 la re-contenta como paleta de capacidades (§9·C2 la baja de cableado a presentación) | §2 fila 10 | no (fuente) · código en `dist`: **sí** |
| `src/config` | **queda** | nuestro (WP-V05): `ziguratSettings.ts`, resolución de ajustes y `ZIGURAT_PENDING`. **Corrección al borrador heredado, que contaba 3 consumidores: son 7** — `core/AracneBotService.ts:15`, `core/mcpConfigurationManager.ts:11`, `elenco/RepartoElencoService.ts:17`, `identity/roomSettings.ts:1`, `launcher/settings.ts:1`, `mutation/settings.ts:1` y `processManager.ts:4`. Es el módulo del que cuelga todo lo nuestro. **pend. DV-16.a**: si se cierra en (b), las claves `zigurat.*` pasan a `aleph0.*` dentro de V15 — y el coste real es esos 7 sitios, no 3, más la re-verificación de la CA de V05 (§9·C5) | disco (`grep -rn ziguratSettings src/`) | no (fuente) · código en `dist`: **sí** |
| `src/configEditor.ts` | **poda** | legado intacto y **muerto**: 423 líneas que no se alcanzan desde `src/extension.ts`. Los editores vivos son los de `src/editors/`, registrados como `customEditors` | disco | no (fuente) · código en `dist`: **no** |
| `src/copilotLogs` | **poda** | legado intacto y vivo (15 `.ts`, todos alcanzables): los 12 comandos `copilotLogs.*` y el panel `copilotMetrics`. §2 lo poda sin reemplazo — no cablea nada de la ciudad. Arrastra `.vscode/mcp.json` (`localhost:3100`) | §2 fila 17 | no (fuente) · código en `dist`: **sí** |
| `src/core` | **queda** | **legado en su origen, pero es donde vive nuestro cableado.** Está en el tag del import, y lo hemos modificado en 3 de sus 10 ficheros: `extensionBootstrap.ts` (+173 líneas: registra elenco, catálogo, identidad), `mcpConfigurationManager.ts` (169 líneas cambiadas) y `AracneBotService.ts` (+56). Es el único camino por el que nuestros módulos entran en el producto — ver §6·D2 | disco (corrige el HANDOFF) | no (fuente) · código en `dist`: **sí** |
| `src/editors` | **re-contenido** | legado intacto y vivo: `AgentConfigEditorProvider` y `AgentContentEditorProvider`, los dos `customEditors` `alephscript.agent*Editor`. §2 fila 15 los reusa con agentes reales de la ciudad, y lo pone en wishlist: la carcasa se queda | §2 fila 15 | no (fuente) · código en `dist`: **sí** |
| `src/elenco` | **queda** | nuestro (WP-V09): `RepartoElencoService` + `ElencoTreeDataProvider`, entrando por `core/extensionBootstrap.ts:39`. §2 fila 7 lo marca «hecho» y el disco lo confirma | §2 fila 7 | no (fuente) · código en `dist`: **sí** |
| `src/examples` | **poda** | legado intacto y **muerto**: `loggingExample.ts`, 205 líneas de ejemplo de uso del logger, no alcanzables desde `src/extension.ts` | disco (§2 no lo lista) | no (fuente) · código en `dist`: **no** |
| `src/extension.ts` | **queda** | **byte-idéntica al legado** (`git diff --quiet` contra el tag del import pasa). Son 2 imports y el arranque: delega todo en `core/extensionBootstrap`. No hay nada ajeno que amputar en ella, y es el punto de entrada declarado — ver §6·D3 | disco | no (fuente) · código en `dist`: **sí** |
| `src/identity` | **queda** | nuestro (WP-V07): `RoomIdentityService`, `MeshAuthorityTransport`, `IdentityStatusBar`, `protocolApi`. Lo consume `treeViews/mcpTreeView.ts:6-7`. Es la base de la Ola I | disco | no (fuente) · código en `dist`: **sí** |
| `src/launcher` | **queda** | nuestro (WP-V06): `CatalogService` + `LauncherCatalogClient`, que ya leen `launcher://info|catalog|ports` y llaman a `list_capabilities`/`resolve_capability` (§9·C2 y C3 lo verificaron). 4 de sus 5 `.ts` entran en el bundle; `index.ts` es un barril propio sin consumidor, y eso es higiene nuestra, no legado | §2 fila 2 + §9·C2/C3 | no (fuente) · código en `dist`: **parcial** (4/5) |
| `src/libs` | **re-contenido** | legado modificado por nosotros: `alephscript-client.ts` (+53 líneas) es un **stub local** de cliente Socket.IO, vivo en el bundle y usado por `socketMonitor.ts`. §2 filas 4-5 lo re-contentan con `socket-core`/`firehose-core`. Su `index.ts` no se alcanza | §2 filas 4-5 + disco | no (fuente) · código en `dist`: **parcial** (1/2) |
| `src/loggingManager.ts` | **queda** | legado intacto, vivo y neutro: el logger por categorías que consumen `commandPaletteManager`, `terminalManager`, `mcpWebViewManager` y otros. No es contenido ajeno, es plomería | disco (§2 no lo lista) | no (fuente) · código en `dist`: **sí** |
| `src/mcpChatParticipant.ts` | **poda (pend. DV-11)** | legado intacto y vivo: crea `mcp-vscode-ext.mcp-assistant` (`:77`), uno de los 6 `chatParticipants` de la fila 19. Veredicto propuesto: poda ahora, re-lore a wishlist (propuesta por defecto de §6). **La decisión es del custodio** | §2 fila 19 | no (fuente) · código en `dist`: **sí** |
| `src/mcpServerManager.ts` | **re-contenido** | legado intacto y vivo (411 líneas): arranca servidores MCP por gestión de procesos heredada. §9·C3 lo señala como el hueco real: V19 lo sustituye por `launch_mcp_server`/`stop`/`restart`, que están a cero. **Además importa `MCPConfiguration` de `./theatrical/core/interfaces` (`:4`)** — ver §6·D11 | §2 fila 2 + §9·C3 | no (fuente) · código en `dist`: **sí** |
| `src/mcpTypes.ts` | **queda** | legado intacto y vivo: 102 líneas de interfaces de config MCP, sin contenido de marca. Su docstring (`:15`) referencia la forma de `sample-config.json`, que se poda; el tipo sobrevive | disco (§2 no lo lista) | no (fuente) · código en `dist`: **sí** |
| `src/mcpWebViewManager.ts` | **re-contenido** | legado intacto y vivo (398 líneas): gestiona las webviews MCP. §2 fila 13 las re-contenta como el mapa de la ciudad (`game-engine`/`ui-3d-kit`, hoy a cero por §9·C4) | §2 fila 13 | no (fuente) · código en `dist`: **sí** |
| `src/mutation` | **queda** | nuestro (WP-V08): `AuthorshipService`, `LineaEditorClient`, `parseEditorInfo`. Es el corazón del contrato de autoría y **WP-V17 lo endurece** (L2-01: la ausencia de información no concede permiso). No se toca aquí | disco | no (fuente) · código en `dist`: **sí** |
| `src/processManager.ts` | **re-contenido** | legado **modificado por nosotros** (importa `resolveLauncherPort` y `ZIGURAT_PENDING` de `./config/ziguratSettings`, `:4`) y vivo. Es la gestión de procesos heredada de la que cuelgan los botones de los árboles; §9·C3 dice que ahí está **G2** en su forma exacta, y V19 la re-contenta | §2 fila 14 + §9·C3 | no (fuente) · código en `dist`: **sí** |
| `src/resources` | **queda** | nuestro (WP-V06): `McpResourceClient` + `ResourceProjectionService`, consumido por `treeViews/mcpTreeView.ts:8-9`. Es la proyección de recursos del launcher | disco | no (fuente) · código en `dist`: **sí** |
| `src/socketMonitor.ts` | **re-contenido** | legado intacto y vivo (686 líneas): panel webview de monitorización Socket.IO, ya refactorizado en el legado para usar `AlephScriptClient`. §2 filas 4 y 13 lo re-contentan como salas/peers y como el mapa | §2 filas 4, 13 | no (fuente) · código en `dist`: **sí** |
| `src/statusManager.ts` | **poda** | legado intacto y **muerto**: 453 líneas no alcanzables desde `src/extension.ts`. La barra de estado viva es `core/HackerStatusBarManager.ts`, y V22 planifica la nuestra | disco | no (fuente) · código en `dist`: **no** |
| `src/terminalManager.ts` | **queda** | legado intacto, vivo y neutro (232 líneas): abre y sigue terminales. Lo usan `processManager` y `statusManager`; no lleva contenido ajeno | disco (§2 no lo lista) | no (fuente) · código en `dist`: **sí** |
| `src/theatrical` | **re-contenido** | el módulo más mixto del repo, 33 ficheros y 19 `.ts` de los que **sólo 5 se alcanzan**. Vivo: `TheatricalChatManager.ts`, que crea los 5 personajes del legado con identidades **escritas a mano en `:42-86`** (poda pend. **DV-11**), y `core/interfaces/`, del que depende `mcpServerManager.ts:4`. Muerto: los 5 `agents/*ChatParticipant.ts`, sus 5 `*AgentManager.ts`, `ChatParticipantFactory.ts`, `TheatricalAgent*.ts` y `core/schemas/validation.ts` — 14 ficheros. **Dos cosas que el borrador heredado no vio:** (1) lo único que hemos tocado aquí es `core/interfaces/ICompany.ts` (+7 líneas), y es una **declaración de frontera de WP-V09** («ICompany es el Modelo B […] NO es `reparto/1`; prohibido fusionar con elenco de dominio») — V13 no puede perderla al podar; (2) de los 14 ficheros no-`.ts` del módulo, 10 son contenido de agentes del legado (`agents/*.agent.md` + `*.config.json`) y uno es **`core/managers/TheatricalAgent.ts.backup`**, un fichero de respaldo trackeado (§6·D18). La carcasa se queda porque algo vivo cuelga de ella; el contenido se va — ver §6·D5 | §2 filas 6, 19 + disco | no (fuente) · código en `dist`: **parcial** (5/19) |
| `src/treeViews` | **re-contenido** | legado **modificado por nosotros** y vivo (5/5 alcanzables): `mcpTreeView.ts` (+483 líneas cambiadas) ya consume nuestros `CatalogService`, `RoomIdentityService`, `ResourceProjectionService` y `AuthorshipService` (`:4-11`). §2 filas 2-8 y §9·C3 son exactamente este módulo: lee el catálogo y **no manda** sobre él | §2 filas 2-8 + §9·C3 | no (fuente) · código en `dist`: **sí** |
| `src/uiManager.ts` | **re-contenido** | legado intacto y vivo (427 líneas): gestiona instancias de UI sobre `processManager`. §2 fila 3 lo re-contenta con las ventanas del mesh, que §9·C4 confirma a cero | §2 fila 3 | no (fuente) · código en `dist`: **sí** |
| `src/views` | **re-contenido** | legado **modificado por nosotros** y vivo (7/7 `.ts` alcanzables): los 4 paneles hacker (MENU/CMD/SETTINGS/TASKS) más `BaseHackerPanelProvider` y las dos vistas de teatro. `HackerTasksPanelProvider.ts` (+165 líneas) ya consume nuestro `CatalogService`. §2 filas 9-12 lo re-contentan, y la fila 9 es la joya 1 | §2 filas 9-12 | no (fuente) · código en `dist`: **sí** |
| `src/webViewManager.ts` | **re-contenido** | legado intacto y vivo (513 líneas): abre las webviews 3D/WebRTC/Driver del legado. §2 fila 13 (joya 2) las re-contenta con `game-engine`/`ui-3d-kit`, hoy a cero (§9·C4) | §2 fila 13 | no (fuente) · código en `dist`: **sí** |

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
cableado (V05–V09) entra por `src/core/extensionBootstrap.ts:35,39`. No
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
(excluidos `node_modules`, `.git` y `coverage`) son `.vscodeignore:35-36`,
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
- `.vscodeignore:28-30` excluye `*.md` **y re-incluye `LICENSE.md` a
  propósito** («keep README + LICENSE for vsce»): es la licencia que lee
  quien instale el paquete.
- El Release `v0.1.0` ya se publicó con ella (checkpoint interno sin
  validar, 0 descargas).

Veredicto **re-contenido**, y **escalado al custodio** (§7): elegir la
licencia de un producto propio no es decisión de un worker.

### D8 · `coverage/` trackeado + ignorado tiene una consecuencia operativa no dicha

La pista del orquestador se confirma: 72 ficheros trackeados en `HEAD` y
`coverage/` en `.gitignore:2`. Lo que añade el disco es el mecanismo:
`jest.config.js:12-13` corre con `collectCoverage: true` y
`coverageDirectory: 'coverage'`, así que **cualquier `npm test`
reescribe esos 72 ficheros trackeados y ensucia el árbol**. Eso invalida
la huella de `scripts/evidencia.sh` para el resto del lote, que es
justamente la herramienta con la que el carril evita recompilar.

La poda de esta fila necesita `git rm -r --cached coverage` además del
borrado; si no, vuelve a aparecer en el siguiente `npm test`.

### D9 · Podar `tests/` hace fallar `npm test` por umbral, no por prueba roja

`jest.config.js:23-28` fija `coverageThreshold` global en
branches 75 · functions 80 · lines 85 · statements 85, con
`collectCoverageFrom: ['src/**/*.ts']`. Retirar la cobertura legada
—que §2 fila 21 llama «única cobertura del repo»— sin reemplazo hace
que `jest` salga en rojo por umbral incumplido. V13 debe decidir si baja
el umbral con acta o si el reemplazo llega antes. No es un bloqueo del
censo; es un dato que a V13 le habría costado una pasada descubrir.

**Honestidad sobre esta predicción:** se deriva de leer la configuración,
**no de ejecutar `jest`** — el brief prohíbe los comandos caros y este WP
no ha corrido ninguno. Lo verificado es la configuración (`jest.config.js:15-30`);
que el umbral se incumpla al retirar la cobertura es la consecuencia
esperada, y V13 la confirmará al ejecutarla. ⏳ como medición.

### D10 · `tests/` no se puede podar entera

`jest.config.js:33` (`setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']`)
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
consumidor vivo. En `src/core/mcpConfigurationManager.ts:58-65`:

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
`src/copilotLogs/config/models-config.json`), aparecen:

- **`src/theatrical/core/managers/TheatricalAgent.ts.backup`** — un
  respaldo manual versionado, del import, junto a su `.ts` vivo-pero-muerto.
- **10 ficheros de contenido de agentes** en `src/theatrical/agents/`
  (`{isaac,don-alvaro,capitan-didac,indra,backend-agent}.agent.md` y sus
  `.config.json`), que son lore ajeno viviendo dentro del código fuente,
  y que **casan con el `filenamePattern` `*.agent.md` de
  `package.json:1446`**.
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
| **DV-11** · chatParticipants heredados | `src/mcpChatParticipant.ts` (poda) · `src/theatrical` (re-contenido, su parte viva) · `package.json` (6 `chatParticipants`) | si sale re-lore en vez de poda, D5 dice que el coste no es cambiar datos sino escribir el lector que hoy está muerto |
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
| `mcp-vscode-ext.mcp-assistant` | `src/mcpChatParticipant.ts:77-79` | **sí** |
| `mcp-vscode-ext.isaac` | `src/theatrical/TheatricalChatManager.ts:45` | **sí** |
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

- **Poda:** retirar `src/mcpChatParticipant.ts`, la parte viva de
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
| `ArrakisTheater_OperaConfig.json` | `.vscode/settings.json:2-3`, `demo/dummy_workspace/.vscode/settings.json` y `src/core/mcpConfigurationManager.ts:58-65` | las dos primeras citan la ruta; la tercera la abre si existe en el workspace (guardada con `fs.existsSync`: degrada, no rompe) |
| `sample-config.json` | **nada obligatorio.** `HackerConfigPanelProvider.ts:233` la lista, pero contra el workspace y con `fs.existsSync` (D15); `src/mcpTypes.ts:15` sólo la nombra en un comentario | el borrador heredado decía que el panel «ofrecería un fichero inexistente»: **falso**, D15 |
| `theatrical-content/` | `package.json:1446` **y** `:1456` (los dos `customEditors`), `extensionBootstrap.ts:1444,1529,1569,1610,1614`, `AgentConfigEditorProvider.ts:371`, `AgentContentEditorProvider.ts:249`, `HackerConfigPanelProvider.ts:291-293` | convención ajena que sobrevive al borrado — 7 puntos de código y 2 del manifiesto, no los 3+1 del borrador |
| `src/theatrical` | mover `MCPConfiguration` fuera antes: `src/mcpServerManager.ts:4`. **Y la parte viva** (`TheatricalChatManager`) está cableada en `src/core/extensionBootstrap.ts:12` (import), `:58` (campo de `ExtensionContext`) y `:118` (`new TheatricalChatManager`) | rompe la compilación en los cuatro sitios |
| `src/copilotLogs` | **no basta con el manifiesto.** Código vivo: `src/core/extensionBootstrap.ts:41` y `:42` (imports), `:1773` (`registerCopilotLogCommands`), `:1776-1779` (`getCopilotLogExporterService()` + `initialize().catch`), `:1781` (el log nombra «Copilot Log Exporter»). Y además `.vscode/mcp.json` (`localhost:3100`) y los 12 comandos `copilotLogs.*` de `package.json` | **rompe la compilación** de `src/core`, que es módulo «queda». El manifiesto y la config sólo quedan huérfanos |
| `src/mcpChatParticipant.ts` | `src/core/extensionBootstrap.ts:11` (import), `:57` (campo de `ExtensionContext`), `:115` (`new McpChatParticipant`) | rompe la compilación de `src/core` |
| los 4 comandos `ArrakisTheater.*` (fila 18) | `src/core/configurationCommandsService.ts:256-259` (los 4 `registerCommand`) **y sus dos llamadores**: `extensionBootstrap.ts:21` (import) y `:1770` (`ConfigurationCommandsService.registerCommands`). El fichero entero (**263 líneas**) existe sólo para esos 4 comandos —`:25,80,136,167` los documentan uno a uno— así que la poda lo deja huérfano **dentro de `src/core`, módulo «queda»**. Además `src/core/mcpConfigurationManager.ts:22,28` los cita como cadenas dentro de un `console.log` | §2 fila 18 poda los comandos; nadie había dicho dónde viven |
| `tests/` (contenido legado) | conservar `tests/setup.ts` y `tests/mocks/`; decidir el `coverageThreshold` | `jest.config.js:23-28,33,36-37` |
| `coverage/` | `git rm -r --cached coverage`, no sólo borrar | está en `.gitignore:2` y jest lo regenera |
| `schemas/` | **no podar sin sustituir**: `contributes.jsonValidation` (3 entradas, rutas `./schemas/*` relativas al paquete). `HackerConfigPanelProvider.ts:234-236` está guardado y no cuenta (D15) | §2 fila 16 dice «sustituir» |
| `media/` | **no podar**: sólo los 4 iconos `arrakis-theater-icon*.png` y `ICON_CREATION_GUIDE.md`, en V14 | 18 de 23 ficheros los cargan paneles y editores vivos (17 CSS/JS + `mcp.svg`) |
| `README-LEGACY-EXTENSION.md` | `README.md:13` | único enlace vivo |

**Dónde se concentra el arrastre: `src/core/extensionBootstrap.ts`.** Las
tres podas más pesadas (`copilotLogs`, `mcpChatParticipant`, la parte viva
de `theatrical`) más la fila 18 convergen en **un solo fichero de un
módulo cuyo veredicto es «queda»** y que lleva nuestras +173 líneas.
Recuento de puntos de edición vivos, verificados con
`grep -rn` sobre `src/` (no muestreo: todas las referencias del repo):

| poda | puntos en `extensionBootstrap.ts` | otros |
| ---- | --------------------------------- | ----- |
| `src/copilotLogs` | `:41`, `:42`, `:1773`, `:1776-1779`, `:1781` | — |
| `src/mcpChatParticipant.ts` | `:11`, `:57`, `:115` | — |
| `TheatricalChatManager` | `:12`, `:58`, `:118` | — |
| 4 × `ArrakisTheater.*` | `:21`, `:1770` | `configurationCommandsService.ts:256-259` (+ fichero entero) · `mcpConfigurationManager.ts:22,28` |

**Anomalía encontrada al recontar** (no la tenía ni el censo ni la
contrarrevisión): `extensionBootstrap.ts:42` importa
`CopilotMetricsPanelProvider` **y no lo usa nunca** — el registro real de
la vista `copilotMetrics.panel` ocurre en
`src/copilotLogs/commands.ts:485-488`. Es un import muerto en código
vivo; irrelevante para el veredicto, pero V13 debe saber que esa línea se
borra entera y no hay que re-cablear nada detrás.

**Orden de ejecución de la poda** (observación, no cambio de veredicto):
`tests/DonAlvaroValidation.test.ts:11` importa `DonAlvaroChatParticipant`
y `tests/unit/mcpChatParticipant.test.ts:3` importa `McpChatParticipant`.
Los dos ficheros están en el contenido legado que se va, así que no hay
contradicción — pero **la poda de esos tests tiene que ir en el mismo
commit que la de su código, o antes**, o `compile:tests`
(`tsc -p tsconfig.json`) se cae entre commits. Nota adyacente:
`tests/integration/extensionChatIntegration.test.ts:3` importa
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

