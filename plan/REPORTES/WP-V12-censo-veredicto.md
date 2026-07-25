# REPORTE · WP-V12 · Censo y veredicto

| dato | valor |
| ---- | ----- |
| WP | **WP-V12 · Censo y veredicto** (Ola F · CORTE) |
| Rama | `wp/v12-censo-veredicto` |
| Worktree | `C:/S_LAB/.worktrees/v/v-sdk-wp-v12` |
| Base | `1c90c43bfeafe6cabbc71a04440b4a962544aa83` |
| Entregable | `plan/CENSO-V12.md` |
| Circunstancia | **relevo**: la sesión que despachó este WP murió antes de commitear y dejó `plan/CENSO-V12.md` sin trackear |
| `VEREDICTO_REVISOR` | **⏳ pendiente** |

---

## 1 · Qué se ha hecho

Se ha encontrado un borrador de censo **sin trackear** en el worktree,
obra del worker anterior. La instrucción de relevo era explícita:
«créelo poco, verifícalo TODO contra el disco». Eso es lo que se ha
hecho, y este reporte separa las dos cosas — **qué se verificó** y **qué
se corrigió** — porque un censo que gobierna una amputación no puede
heredar confianza.

El resultado: el borrador era **bueno**. Su estructura, sus recuentos y
su hallazgo más caro (la medición de código muerto) se sostienen sin un
solo ajuste. Pero tenía **8 filas con evidencia defectuosa**, y **dos de
ellas apoyaban su conclusión en código que dice lo contrario de lo que
el borrador afirmaba**. Ninguna de las 8 cambia un veredicto; todas
cambian lo que V13 tiene que hacer al ejecutarlo.

---

## 2 · Lo que se verificó del borrador heredado

Cada afirmación comprobable del borrador se ha vuelto a medir. Nada se
ha dado por bueno por estar escrito.

| bloque | comprobación | resultado |
| ------ | ------------ | --------- |
| recuento Tabla A | `git ls-tree --name-only HEAD` | **41**, y 41 filas ✅ |
| recuento Tabla B | `git ls-tree --name-only HEAD src/` | **28**, y 28 filas ✅ |
| control del brief (40 en `d0323fb`) | `diff` de los dos `ls-tree` | 40 vs 41; la diferencia es exactamente `.gitattributes` (`b208ab1`) ✅ |
| procedencia primer nivel | `git cat-file -e <tag>:<ruta>` sobre las 41 | **31 legado / 10 nuestro** ✅ |
| procedencia `src/` | ídem sobre los 28 | **22 legado / 6 nuestro** ✅ |
| «intacta desde el import» | `git diff --quiet <tag> HEAD -- <ruta>` | ✅ en las 41 + 28 |
| código muerto (D4) | BFS de imports relativos desde `src/extension.ts`, reimplementado desde cero | **102 `.ts`, 83 alcanzables, 19 no**, y la **lista idéntica** ✅ |
| `.vscodeignore` (34 citas de línea) | lectura numerada del fichero | ✅ las 34 |
| `jest.config.js` (`:12-13`, `:23-28`, `:33`, `:36-37`) | lectura numerada | ✅ |
| `package.json`: 115 comandos, 5 prefijos, 6 `chatParticipants`, 3 `jsonValidation`, `configuration.title`, `icon` | `node -e` sobre `contributes` | ✅ exacto, incluido el reparto 86/12/7/6/4 |
| la 13ª vista (D14) | `contributes.views` | ✅ 12 en `arrakisTheater` + 1 en `explorer` |
| `LICENSE.md` es licencia-broma (D7) | lectura íntegra | ✅ y **peor de lo dicho** (ver §3·C7) |
| `coverage` trackeado + ignorado (D8) | `git ls-files -i -c --exclude-standard` | ✅ y **cerrado por enumeración** (ver §3·C6) |
| `src/core` es legado (D2) | tag + `diff --stat` | ✅ 3 de 10 ficheros modificados por nosotros |
| `src/extension.ts` byte-idéntica (D3) | `git diff --quiet` | ✅ (47 líneas) |
| `.esbuild.config.js` muerto (D6) | `grep -rn esbuild.config` | ✅ sólo `.vscodeignore:35-36` |
| `setup-vscode-path.sh` roto (D13) | `package.json` script `unix:code` | ✅ `sh ./setup-vscode-path`, sin `.sh` |
| `.claude` no es legado | ausente del tag + `git log --reverse` | ✅ entró en `5c9348c merge: aceptar WP-V09` |
| conteos por directorio (138 `.claude`, 72 `coverage`, 68 `vibecoding`, 23 `media`, 15 `PLANIFICACION`, 17 `prompts`, 12 `tests`, 5 `scripts`, …) | `git ls-files <dir> \| wc -l` | ✅ los 20 |
| líneas de los módulos citados (511, 411, 686, 453, 423, 232, 427, 513, 398, 205, 102) | `wc -l` | ✅ las 11 |
| diffstats citados (mcpTreeView +483, HackerTasks +165, alephscript-client +53) | `git diff --stat <tag> HEAD` | ✅ |
| IDs de cola citados (V-L1-03, V-L4-05, V-L4-08, V-L5-01..03) | `grep` en el HANDOFF | ✅ los 6 existen y dicen lo que se les atribuye |
| DV-11/12/16/16.a abiertas | `plan/DECISIONES.md:14-60` | ✅ las cuatro ⬜ |
| «a cero» de §9·C4 | `grep` de `city_*`, `launch_mcp_server`, `health` | ✅ cero coincidencias |

---

## 3 · Lo que se corrigió — 8 filas

Las dos primeras son errores de fondo: el borrador citaba código que
dice lo contrario de lo que él afirmaba. Las otras seis son recuentos y
alcances mal medidos.

### C1 · `sample-config.json` — la evidencia era doblemente falsa 🔴

El borrador escribía: «el código vivo la busca en el workspace del
usuario (`src/core/mcpConfigurationManager.ts:58-65`) […] pero
`HackerConfigPanelProvider.ts:233` la lista como plantilla y V13 debe
quitar esa entrada, **o el panel SETTINGS ofrecerá un fichero
inexistente**».

Las dos mitades son falsas:

1. `mcpConfigurationManager.ts:58-65` **no busca `sample-config.json`**.
   Busca `ArrakisTheater_OperaConfig.json`. El comentario y el log dicen
   `sample-config.json`; la ruta que se construye es la otra. La cita
   señala el sitio correcto y concluye lo contrario del código.
2. `HackerConfigPanelProvider` resuelve contra
   `vscode.workspace.workspaceFolders` (`:228`) y filtra con
   `fs.existsSync` (`:241`). El panel **no puede** ofrecer un fichero
   inexistente: sólo lista lo que existe en la carpeta del usuario.

Efecto: la fila sigue siendo **poda**, pero deja de ser una poda con
arrastre obligatorio. Es un `<no hace nada>` que V15 barre.
→ censo §6·**D15** y §6·**D16**.

### C2 · `schemas/` y `theatrical-content/` heredaban el mismo error de método

El borrador decía que podar `schemas/` «rompe 3 declaraciones del
manifiesto **y 3 filas del panel SETTINGS**». Lo primero es cierto y es
lo que sostiene el veredicto (`contributes.jsonValidation` apunta a
`./schemas/*`, relativo al paquete). Lo segundo no: mismo guardado que
C1. Igual para `theatrical-content/`. Los veredictos
(**re-contenido** / **poda**) no cambian; la tabla «lo que V13 necesita
saber» sí, y estaba inflada.

### C3 · `theatrical-content/` — 3 referencias contadas, 7 reales

El borrador citaba `extensionBootstrap.ts:1444,1529,1569` y
`AgentConfigEditorProvider.ts:371`. Faltaban
`extensionBootstrap.ts:1610,1614` y `AgentContentEditorProvider.ts:249`.
Y en el manifiesto no hay **un** `customEditors` sino **dos**:
`package.json:1446` (`*.agent.md`) además del `:1456` citado. El primero
importa porque también casa con los 5 `src/theatrical/agents/*.agent.md`.

### C4 · `src/config` — 3 consumidores contados, 7 reales

`grep -rn ziguratSettings src/` devuelve 7: el borrador tenía
`AracneBotService.ts:15`, `mcpConfigurationManager.ts:11` y
`processManager.ts:4`, y le faltaban `elenco/RepartoElencoService.ts:17`,
`identity/roomSettings.ts:1`, `launcher/settings.ts:1` y
`mutation/settings.ts:1`. **Esto no es cosmético**: es el
dimensionado de DV-16.a. Si el custodio elige el camino (b), el
renombrado `zigurat.*` → `aleph0.*` toca 7 puntos de código, no 3.

### C5 · `media/` — «18 de 23 son CSS/JS» son 17 + un `.svg`

CSS/JS son **17**. El 18º asset vivo es `media/mcp.svg`
(`mcpChatParticipant.ts:83`). El total de vivos que el borrador daba era
correcto; la etiqueta, no. Se corrige porque V14 va a tocar
exactamente este directorio y necesita saber qué es marca (5 ficheros) y
qué es superficie (18).

### C6 · `coverage/` — se pasa de «confirmado» a «agotado»

El borrador confirmaba la pista del orquestador. Se ha cerrado el
hallazgo **V17-B** por enumeración:
`git ls-files -i -c --exclude-standard` devuelve **72 rutas, y las 72
son `coverage/`**. No hay un segundo camino trackeado-e-ignorado en el
repo, así que la fila de `coverage` **adjudica el hallazgo entero**.
→ censo §6·**D20**.

### C7 · `LICENSE.md` — falta el dato que remata el escalado

Además de ser la «Animus Iocandi Public License», el fichero **termina**
con `Copyright © [Año] [Nombre del Autor]`, literal, con corchetes. El
`.vsix` `v0.1.0` viajó con una licencia de broma **y sin titular**.
→ censo §6·**D19**.

### C8 · `src/theatrical` — dos cosas que el borrador no vio

1. Lo **único** que hemos modificado dentro del módulo es
   `core/interfaces/ICompany.ts` (+7 líneas), y es una **declaración de
   frontera de WP-V09** («ICompany es el Modelo B […] prohibido fusionar
   con elenco de dominio»). Si V13 poda el módulo en bloque, borra una
   declaración nuestra, no legado ajeno.
2. Hay un **`core/managers/TheatricalAgent.ts.backup`** trackeado y 10
   ficheros de contenido de agentes (`agents/*.agent.md`,
   `*.config.json`) dentro de `src/`.
   → censo §6·**D18**.

---

## 4 · Lo que se añadió por encima del borrador

- **§2 · aviso de trampa de verificación** (censo §6·**D21**). Bajo
  Git-Bash, `git cat-file -e <tag>:<ruta>` **falla en silencio** para
  toda ruta que empiece por punto: MSYS convierte el argumento y git
  recibe `import\scriptorium-…;.gitignore`. Esta sesión cayó en ella: la
  primera medición de procedencia dio `26/15` en vez de `31/10` y
  «desmentía» cinco filas correctas. Se corrige con
  `MSYS_NO_PATHCONV=1`. Queda escrito **porque el contrarrevisor de este
  WP va a tropezar con lo mismo** y concluiría que el censo se equivoca.
- **§7 · expediente DV-11**: los 6 `chatParticipants` uno por uno, con
  quién los declara, quién los crea y si ese creador está vivo. El dato
  que cambia la decisión: los 5 ficheros
  `src/theatrical/agents/*ChatParticipant.ts` —los que parecen
  responsables— **están muertos**; los 5 personajes salen de un array
  literal en `TheatricalChatManager.ts:42-86` con dos `switch` encima.
  El «re-lore» de la fila 19 no es cambiar datos: es escribir el lector
  que hoy no existe.
- **§6·D17 · `alephscript.*` son 86, no «~113»**. El replan §8 y el
  HANDOFF dan ese número mal. Reparto real: 115 comandos = `alephscript`
  86 · `copilotLogs` 12 · `zigurat` 7 · `mcpSocketManager` 6 ·
  `ArrakisTheater` 4. Lo que se acerca a 113 es el total de prefijos
  legados (108). **V15 planifica sobre este número.**
- **§9 · nota de doble pasada**: el censo declara que se escribió en dos
  turnos y qué cambió en el segundo.
- **Honestidad en D9**: la predicción «podar `tests/` hace fallar el
  umbral» se deriva de leer `jest.config.js`, **no de ejecutar `jest`**.
  Queda marcada ⏳ como medición; V13 la confirmará.

---

## 5 · Criterios de aceptación

| # | CA | estado | evidencia |
| - | -- | ------ | --------- |
| 1 | una fila por entrada de A y de B, recuentos coincidentes | ✅ | `ls-tree` = 41 / 28; filas = 41 / 28; y comprobación cruzada entrada por entrada: **0 entradas sin fila** |
| 2 | cero `<pendiente>` | ✅ | `grep -c "<pendiente>" plan/CENSO-V12.md` → **0** |
| 3 | cada fila con veredicto ∈ {queda, re-contenido, poda} y motivo | ✅ | A: 16+7+18 = 41 · B: 11+12+5 = 28 |
| 4 | sección «Lo que el disco desmiente» | ✅ | §6, **21 divergencias** (14 heredadas y verificadas + 7 nuevas) |
| 5 | cero borrados y cero cambios fuera del alcance | ✅ | `git status --porcelain` (§6) |

Recuento final: **queda 27 · re-contenido 19 · poda 23 = 69**.
Idéntico al del borrador: las 8 correcciones tocan evidencia, no
veredictos.

---

## 6 · Ficheros tocados y estado del árbol

Antes del commit — los dos ficheros del alcance y nada más. `CENSO-V12.md`
aparece como `??` porque el worker anterior murió **antes de commitear**:
nunca llegó a estar trackeado, y este WP es quien lo introduce.

```
$ git status --porcelain
?? plan/CENSO-V12.md
?? plan/REPORTES/WP-V12-censo-veredicto.md
```

Después del commit, `git status --porcelain` queda **vacío**.

Sólo los dos ficheros del alcance. **Cero escrituras** en `src/`,
`tests/`, `package.json`, `.github/`, `scripts/`, `docs/`. **Cero
`git rm`**: este WP decide, V13 ejecuta.

---

## 7 · Economía de CPU

**No se ha ejecutado ni un comando caro.** Cero `npm ci`, cero `compile`,
cero `test`, cero `vsce package`, y por tanto **no se ha usado
`slot.sh`** ni se ha registrado nada en `evidencia.sh` — no había nada
que registrar. Todo el censo es `git ls-tree`, `git ls-files`,
`git cat-file`, `git diff --stat`, `grep`, `wc` y dos lecturas de JSON
con `node -e`.

El único guion propio (el BFS de alcanzabilidad) se escribió **fuera del
repo**, en `%TEMP%/v12/bfs2.js`, para no tocar el árbol.

Aviso del vigía atendido: **no se ha encontrado ningún `EVIDENCIA.md`**
en este worktree, ni con registros reconocibles ni desconocidos.

---

## 8 · Casos adversariales probados

- **No fiarse del borrador.** Se re-implementó el BFS de alcanzabilidad
  desde cero en vez de comprobar su lista: coincide fichero a fichero
  (19/19). Si hubiera bastado con «parece razonable», C1 y C2 habrían
  pasado.
- **Contar en vez de muestrear.** Los 20 conteos por directorio, los 34
  números de línea de `.vscodeignore` y las 41+28 filas se verificaron
  íntegros, no por muestra. Ahí aparecieron C3, C4 y C5.
- **Desconfiar de la propia herramienta.** La primera medición de
  procedencia contradecía al borrador. En vez de anotarlo como
  corrección, se investigó el desacuerdo — y el equivocado era el método
  nuevo (D21), no el borrador.
- **Leer el código citado, no sólo su número de línea.** Todas las citas
  del borrador apuntaban a líneas existentes. C1 se encontró leyendo lo
  que esas líneas *hacen*.

---

## 9 · Lo que NO se pudo hacer, y por qué

- **La columna «¿viaja en el `.vsix`?» no está verificada contra un
  paquete construido.** Se deriva de leer `.vscodeignore`, porque
  `vsce package` es un comando caro y el brief lo prohíbe. El propio
  brief la declara informativa y fuera de la CA. Donde la lectura no
  decide, la celda dice ⏳ (caso de `.vscodeignore` sobre sí mismo).
- **No se ha comprobado el comportamiento en runtime de nada.** El censo
  afirma «vivo» / «muerto» en el sentido de *alcanzable desde el punto de
  entrada del bundle*, que es una propiedad estática. Un módulo
  alcanzable puede no ejecutarse nunca; el censo no distingue eso.
- **D9 (umbral de cobertura) es predicción, no medición.** Ver §4.
- **No se cierra ninguna DV.** DV-11, DV-12, DV-16 y DV-16.a siguen
  abiertas; el censo marca veredicto propuesto y bloqueo nombrado.
- **`LICENSE.md` no se resuelve**: el censo lo marca re-contenido y lo
  **escala al custodio** (§7 del censo). Elegir licencia no es de un
  worker, y no cabe en ninguna DV abierta.

---

## 10 · Dudas y cosas que pasan a otros WP

**Para el custodio**

1. **Licencia del producto (D7 + D19).** El `.vsix` viaja con una
   licencia declaradamente no vinculante y sin titular. ¿Se abre una
   decisión nueva antes de que V13/V14 toquen la superficie del paquete?
2. **DV-11.** El expediente de §7 del censo dice que la salida «re-lore»
   cuesta más de lo que sugiere la fila 19 del replan: no hay lector que
   alimentar, hay que escribirlo.

**Para V13 (poda)**

3. `coverage/` necesita `git rm -r --cached`, no sólo borrado, o vuelve
   con el siguiente `npm test` (D8) — y con él se ensucia la huella de
   `evidencia.sh` para todo el lote.
4. `src/theatrical` no se poda en bloque: `mcpServerManager.ts:4` importa
   `MCPConfiguration` de ahí (D11), y `ICompany.ts` lleva una
   declaración de frontera de V09 (C8).
5. `tests/` no se poda entera: `jest.config.js` depende de
   `tests/setup.ts` y `tests/mocks/vscode.mock.js` (D10), y WP-V17 está
   escribiendo sobre ese andamio ahora mismo.
6. Los **19 ficheros `.ts` fuera del bundle** (D4) son el tramo de la
   amputación con riesgo verificablemente más bajo: retirarlos no puede
   cambiar el comportamiento del `.vsix`.

**Para V14 (marca)**

7. `media/` tiene 5 ficheros de marca y 18 de superficie viva (C5): la
   poda de iconos es quirúrgica.
8. La **13ª vista** (`explorer` · `arrakisTheater` · «🎭 Theater
   Engine», D14) no está en §2 del replan y hay que contarla.

**Para V15 (nombres)**

9. `alephscript.*` son **86** comandos, no ~113 (D17).
10. Si DV-16.a sale (b), el renombrado de claves toca **7** puntos de
    código (C4), y re-verifica la CA de WP-V05 (§9·C5 del replan).
11. Quedan convenciones ajenas muertas que barrer aunque no rompan nada:
    las rutas `theatrical-content/` y `sample-config.json` de
    `HackerConfigPanelProvider` (D15).

**Para V16 (falsedad silenciosa)**

12. **D16 es material suyo**: `mcpConfigurationManager.ts:58-65` registra
    en el log haber encontrado un fichero que no es el que abrió. Es
    exactamente la clase de mentira silenciosa que ese WP persigue,
    encontrada en un camino distinto del que tiene en alcance. Se deja
    aquí anotado, sin tocarlo.

**Para el orquestador**

13. El **aviso D21** (trampa de `MSYS_NO_PATHCONV`) debería llegar al
    contrarrevisor de este WP antes de que verifique la procedencia, o
    va a reportar un falso desmentido de cinco filas.

---

## 11 · Cierre

| dato | valor |
| ---- | ----- |
| Tip de la rama | *(ver §6 y el `git log` del commit de este WP)* |
| Fusiones hechas | **ninguna** — no es de mi rol |
| Push | **no** — el brief lo prohíbe en este relevo |
| Identidad de commit | `worker-V <alephscriptorium@gmail.com>`, sin placeholders |
| `VEREDICTO_REVISOR` | **⏳ pendiente** — yo no me apruebo |

Nota de proceso: el monitor huérfano que pulsa los worktrees cada 15 s
estuvo presente durante todo el WP. No interfirió con ninguna
comprobación y no se ha tocado.
