# REPORTE · WP-V12 · Censo y veredicto

| dato | valor |
| ---- | ----- |
| WP | **WP-V12 · Censo y veredicto** (Ola F · CORTE) |
| Rama | `wp/v12-censo-veredicto` |
| Worktree | `C:/S_LAB/.worktrees/v/v-sdk-wp-v12` |
| Base | `1c90c43bfeafe6cabbc71a04440b4a962544aa83` |
| Entregable | `plan/CENSO-V12.md` |
| Circunstancia | **relevo**: la sesión que despachó este WP murió antes de commitear y dejó `plan/CENSO-V12.md` sin trackear |
| `VEREDICTO_REVISOR` | **DEVOLUCIÓN** — contrarrevisor-V, §12 |

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
`package.json:1446` ⛔ *(cita rancia: coordenada caducada: `package.json` tiene hoy 1248 líneas. RE-MEDIDO: el `customEditor` de `*.agent.md` vive hoy en `package.json:1165`; lo afirmado (que son dos `customEditors`) sigue siendo cierto. Se conserva porque era cierta al escribirse)* (`*.agent.md`) además del `:1456` citado. El primero
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
   `MCPConfiguration` de ahí (D11), `ICompany.ts` lleva una declaración
   de frontera de V09 (C8), y su parte viva está instanciada en
   `src/core/extensionBootstrap.ts:12,58,118`. **Y lo mismo vale para las
   otras dos podas pesadas**: `copilotLogs` (`:41,:42,:1773,:1776-1779`)
   y `mcpChatParticipant` (`:11,:57,:115`), más la fila 18 en
   `configurationCommandsService.ts:256-259` con sus llamadores
   `:21,:1770`. Todo eso vive en `src/core`, módulo **«queda»**: si no se
   edita, no compila. Mapa completo en el §8 del censo.
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
| Commit del censo | `a1fa0c8ed2096d19197b4461910f3224570595b6` — `docs(v12): censo con veredicto por entrada, verificado contra el disco` (2 ficheros, ambos del alcance) |
| Tip de la rama | el commit que cierra este reporte, hijo de `a1fa0c8` |
| Base | `1c90c43` (sin rebase, sin reescritura de historia) |
| Fusiones hechas | **ninguna** — no es de mi rol |
| Push | **no** — el brief lo prohíbe en este relevo |
| Identidad de commit | `worker-V <alephscriptorium@gmail.com>`, sin placeholders |
| `VEREDICTO_REVISOR` | **DEVOLUCIÓN** — contrarrevisor-V, §12 |

Nota de proceso: el monitor huérfano que pulsa los worktrees cada 15 s
estuvo presente durante todo el WP. No interfirió con ninguna
comprobación y no se ha tocado.

---

## 12 · Contrarrevisión

**Agente:** contrarrevisor-V · **Objeto:** `wp/v12-censo-veredicto`, tip
`c34022e` (censo `a1fa0c8` + cierre `c34022e`) · **Método:** re-ejecución
independiente, no relectura.

### Veredicto: DEVOLUCIÓN

Devolución **estrecha y aditiva**. Que quede dicho antes de la lista,
porque el reparto de culpa importa: **no he encontrado ni un veredicto
mal puesto, ni un recuento mal hecho, ni una cita falsa** en todo lo que
he muestreado — y he muestreado duro. Los 69 veredictos se sostienen. El
motivo de la devolución es **una omisión en §8 del censo**, la sección
que gobierna cómo V13 ejecuta la amputación, y se arregla añadiendo
líneas: **ningún veredicto cambia**.

### 1 · [BLOQUEANTE] §8 omite el cableado vivo de las tres podas más pesadas

`plan/CENSO-V12.md:583-594` — la tabla «si V13 poda… / tiene que tocar
también», que el propio censo define como «la lista de sitios donde
borrar una entrada rompe otra» (`:581`). Para el caso pequeño la lista es
explícita; para los tres grandes, calla.

Lo que el censo **sí** dice (`:588`):

> `src/theatrical` → mover `MCPConfiguration` fuera antes:
> `src/mcpServerManager.ts:4` — **rompe la compilación**

Lo que **no** dice, comprobado con
`git grep -n "McpChatParticipant\|TheatricalChatManager\|registerCopilotLogCommands\|CopilotMetricsPanelProvider\|getCopilotLogExporterService" -- src/core/extensionBootstrap.ts`:

| poda | sitios vivos que hay que editar y §8 no nombra |
| ---- | ---------------------------------------------- |
| `src/copilotLogs` (fila 17 · 15/15 `.ts` en el bundle) | `src/core/extensionBootstrap.ts:41`, `:42` (imports), `:1773` (`registerCopilotLogCommands`), `:1776` (`getCopilotLogExporterService`) |
| `src/mcpChatParticipant.ts` ⛔ *(cita rancia: podado por V13 (`f6ae634`, DV-11). Se conserva porque era cierta al escribirse)* (fila 19 · vivo) | `src/core/extensionBootstrap.ts:11` (import), `:57` (campo de interfaz), `:115` (`new McpChatParticipant`) |
| parte viva de `src/theatrical` (`TheatricalChatManager`) | `src/core/extensionBootstrap.ts:12`, `:58`, `:118` |
| los 4 `ArrakisTheater.*` (fila 18, vía `package.json`) | `src/core/configurationCommandsService.ts:256-259` ⛔ *(cita rancia: podado por V13 (`9172d07`). Se conserva porque era cierta al escribirse)* (`registerCommand` × 4) |

Son **14 puntos de edición**, todos dentro de `src/core`, un módulo cuyo
veredicto es **queda** y del que el propio censo dice que es «el único
camino por el que nuestros módulos entran en el producto» (`:169`) y
lleva nuestras +173 líneas.

Por qué esto es devolución y no una nota al pie:

- **La asimetría se lee como permiso.** §8 marca «rompe la compilación»
  para un import de tipo (`mcpServerManager.ts:4`) y calla sobre catorce
  sitios de instanciación y registro. Un V13 que trabaje contra §8 —que
  es para lo que se escribió— concluirá que podar `src/copilotLogs` es
  manifiesto + `.vscode/mcp.json`, y `:589` se lo confirma por escrito.
- **El censo ya aplica el estándar correcto en el caso análogo menor.**
  Eleva `ICompany.ts` (+7 líneas) a «V13 no puede perderla al podar»
  (`:188`) y no eleva las 14 ediciones en el fichero de +173 líneas del
  mismo módulo. Es el estándar del propio worker, aplicado desigual.
- **El coste de arreglarlo ahora es una tabla; después, una pasada de
  V13** — y, peor, ediciones no anticipadas sobre código nuestro.

Qué debe cambiar: añadir a `plan/CENSO-V12.md:583-594` las cuatro
entradas de arriba con sus `fichero:línea`, y que el §10·4 del reporte
(«`src/theatrical` no se poda en bloque») nombre también
`extensionBootstrap.ts`. La sección DV-11 (`:555-558`), que enumera lo
que la salida «poda» retira, debe nombrar el mismo cableado.

### 2 · [MENOR] D18 declara 17 ficheros y enumera 14

`plan/CENSO-V12.md:451-466`. `git ls-files src | grep -v '\.ts$'` da
**17** — lo confirmé, el número es correcto. La enumeración que sigue
cubre 3 «esperables» + `TheatricalAgent.ts.backup` + 10 de contenido de
agentes = **14**. Faltan `src/theatrical/core/schemas/agent.schema.json` ⛔ *(cita rancia: podado por V13 (`c164731`). Se conserva porque era cierta al escribirse)*,
`company.schema.json` y `play.schema.json`. Importa porque el propósito
declarado de D18 es enumerar «material de poda que ningún documento había
enumerado», y esos tres son exactamente eso.

### 3 · [MENOR] La celda `.vsix` de `media` es imprecisa en 1 de 23

`plan/CENSO-V12.md:129`: «**sí** — ningún patrón lo cubre». `*.md`
(`.vscodeignore:28`) sí cubre `media/ICON_CREATION_GUIDE.md` ⛔ *(cita rancia: borrado por V14 (`d409e0a`). Se conserva porque era cierta al escribirse)*, y no hay
re-inclusión para él (`:29-30` sólo reinstauran README y LICENSE). Viajan
22 de 23. La columna es informativa y está fuera de la CA por el brief;
se anota porque V14 trabaja sobre esta fila.

---

### Qué comprobé, y con qué comando

Nada de esto se cita del reporte: se volvió a ejecutar.

| comprobación | comando | resultado |
| ------------ | ------- | --------- |
| cobertura A | `git ls-tree --name-only HEAD \| wc -l` | **41** |
| cobertura B | `git ls-tree --name-only HEAD src/ \| wc -l` | **28** |
| **filas ↔ entradas, una a una** | `diff <(sed -n '106,146p' … \| sed 's/^\| `\([^`]*\)`.*/\1/' \| sort) <(git ls-tree --name-only HEAD \| sort)`, ídem para B | **0 divergencias** (la única línea del diff es un artefacto de mi propio `sed` en la fila `package.json`) |
| reparto | recuento de veredictos por tabla | A 16/7/18=41 · B 11/12/5=28 · **27/19/23=69** ✅ |
| CA 2 | `grep -c "<pendiente>" plan/CENSO-V12.md` | **0** |
| CA 5 · alcance | `git log --stat` de `a1fa0c8` y `c34022e` | sólo `plan/CENSO-V12.md` y el reporte; `git status --porcelain` vacío |
| control del brief | `git ls-tree --name-only d0323fb \| wc -l` | **40**; la diferencia con 41 es `.gitattributes` ✅ |

**BFS de alcanzabilidad, re-implementado desde cero** (`/tmp/bfs_contra.js`,
fuera del repo; resuelve `import` / `export … from` / `require()` /
`import()` relativos, con `.ts`, `.tsx` e `index.ts`):

```
TOTAL .ts en src: 102 · ALCANZABLES: 83 · NO ALCANZABLES: 19
```

y la **lista de 19 es idéntica** a la de D4, fichero a fichero. Entry
point derivado por mi cuenta de `package.json`: `main: ./dist/extension.js`,
`activationEvents: ["onStartupFinished"]`, `esbuild-base: esbuild
src/extension.ts --bundle …`.

Como el worker y yo podíamos compartir el mismo punto ciego, ataqué la
premisa en vez de repetirla:

- **`tsconfig.json` / `tsconfig.build.json` no tienen `baseUrl` ni
  `paths`** → ningún import no-relativo puede resolver a `src/`. El BFS
  relativo es completo.
- **Carga dinámica**: `grep -rE "require\(\s*[^'\")]|import\(\s*[^'\")]|readdirSync|createRequire|__dirname" src` — los únicos casos son
  `HackerCommandPanelProvider.ts:132` (requiere `package.json`),
  `ModelConfigService.ts:49-50` (un `.json`) y dos `path.join(__dirname)`
  en ficheros que ya están muertos. **Ningún módulo `.ts` de `src` se
  carga por ruta construida.**
- **Referencias entrantes**, una por una, para las 5 filas que más caro
  costarían si el «muerto» fuera falso — `ChatParticipantFactory.ts`
  (sostiene todo el argumento de D5), `TheatricalAgent.ts` (tiene un
  `.backup` al lado), `TheatricalAgentCore.ts`, `IsaacChatParticipant.ts`
  y `statusManager.ts` (453 líneas) — con `git grep` sobre **todo el
  repo**: cero referencias desde código. Sólo las nombran
  `PLANIFICACION/`, `prompts/`, `vibecoding/` y `test-extension.js`, los
  cuatro podados. **Los 19 muertos están muertos.**
- Sub-recuentos por módulo derivados de mi BFS: `views` 7/7 · `treeViews`
  5/5 · `copilotLogs` 15/15 · `core` 10/10 · `theatrical` **5/19** ·
  `launcher` **4/5** · `libs` **1/2** · `examples` 0/1 — **los ocho
  coinciden** con la Tabla B.

**Filas obligatorias del muestreo, verificadas contra el disco:**

- **`sample-config.json` — el desmentido del worker es correcto y lo
  confirmo línea a línea.** `mcpConfigurationManager.ts:58` es el
  comentario «look for sample-config.json in workspace»; `:61` construye
  `path.join(workspaceRoot, 'ArrakisTheater_OperaConfig.json')`; `:63` es
  el `fs.existsSync`; `:65` registra `Found sample-config.json at:
  ${configPath}` **sobre la otra ruta**. D16 es exacto, y es un hallazgo
  de primer orden. `HackerConfigPanelProvider.ts:228`
  (`workspaceFolders?.[0]?.uri.fsPath`), `:233` (la entrada
  `sample-config.json`) y `:241` (`if (fs.existsSync(filePath))`):
  exactos. El panel no puede ofrecer un fichero inexistente. **El
  borrador estaba mal y el worker tenía razón.**
- **`src/theatrical`** — `mcpServerManager.ts:4` es
  `import { MCPConfiguration } from './theatrical/core/interfaces';` ✅.
  `git diff import/… HEAD -- src/theatrical` devuelve **un solo fichero**,
  `core/interfaces/ICompany.ts | 7 +++++++`, y las 7 líneas son la
  declaración de frontera de WP-V09 ✅. `TheatricalAgent.ts.backup`
  trackeado ✅. 33 ficheros, 19 `.ts` ✅.
- **`coverage/`** — `git ls-files -i -c --exclude-standard | wc -l` =
  **72**; `| sed 's|/.*||' | sort -u` = **`coverage`** y nada más. D20
  queda adjudicado ✅. `.gitignore:2` = `coverage/` ✅.
  `jest.config.js:12-13` ✅.
- **`tests/`** — `jest.config.js:33`
  (`setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']`) y `:36-37`
  (`moduleNameMapper: {'^vscode$': '<rootDir>/tests/mocks/vscode.mock.js'}`)
  ✅; ambos ficheros existen en `git ls-files tests` (12 ficheros) ✅.
  `coverageThreshold` 75/80/85/85 en `:23-28` ✅.
- **Los 6 `chatParticipants`** — `TheatricalChatManager.ts:42-86` es un
  array literal con los 5 ids en `:45`, `:53`, `:61`, `:69`, `:77` ✅;
  `mcpChatParticipant.ts:77-79` crea `mcp-vscode-ext.mcp-assistant` ✅.
  Y confirmo lo que hace el expediente DV-11 útil: **los 5
  `agents/*ChatParticipant.ts` no tienen un solo import entrante en todo
  el repo** — están muertos, como dice el censo.

**Conteos que alimentan a otros WP** (`node -e` sobre `package.json`):

- **115 comandos**, reparto `alephscript` **86** · `copilotLogs` 12 ·
  `zigurat` 7 · `mcpSocketManager` 6 · `ArrakisTheater` 4. **D17 es
  correcto y el «~113» de los documentos vigentes es falso**: lo verifiqué
  también en la fuente, `REPLAN-V-ciudad-zigurat.md:289` y
  `HANDOFF-…-post-R5V.md:48`. Prefijos legados = 108 ✅.
- **7 consumidores de `src/config`** — `git grep -n ziguratSettings -- src`
  devuelve exactamente los 7 de C4, ni uno más ✅. Dimensionado de DV-16.a
  correcto.
- **13ª vista** ✅ — `contributes.views`: 12 en `arrakisTheater` + 1 en
  `explorer` (`arrakisTheater` · `🎭 Theater Engine`).

**Procedencia** — con `MSYS_NO_PATHCONV=1` sobre las 41+28 entradas:
**31/10** y **22/6**, y las 10 «nuestras» son exactamente las que el
censo nombra. **D21 es real y lo reproduje**: sin la variable,
`git cat-file -e import/…:.gitignore` responde
`fatal: Not a valid object name import\scriptorium-793de5e92527;.gitignore`.
El aviso del worker evitó un falso desmentido; queda confirmado, no
heredado. `src/extension.ts` byte-idéntica ✅ (47 líneas).

**Otras citas verificadas** (muestreo ampliado porque salían todas
limpias): las **34 líneas de `.vscodeignore`** de la columna `.vsix`, una
por una, sobre el fichero de 64 líneas — **34/34 correctas** salvo el
matiz de `media` (punto 3); `package.json:1446` ⛔ *(cita rancia: coordenada caducada: `package.json` tiene hoy 1248 líneas. RE-MEDIDO: el `customEditor` de `*.agent.md` vive hoy en `package.json:1165`; lo afirmado (que son dos `customEditors`) sigue siendo cierto. Se conserva porque era cierta al escribirse)* y `:1456` (los dos
`customEditors`) ✅; los **7 puntos de código de `theatrical-content`** de
C3 ✅ exactos; `LICENSE.md` termina en `Copyright © [Año] [Nombre del
Autor]` ✅ (D19); `package.json:1494` ⛔ *(cita rancia: coordenada caducada y afirmación caducada. RE-MEDIDO: hoy `package.json` no declara ningún script `unix:code` (`grep -c unix:code package.json` -> 0). Se conserva porque era cierta al escribirse)* = `"unix:code": "sh
./setup-vscode-path"` ✅ (D13); `.vscode/settings.json:2-3` con la ruta
`/Users/morente/…` ✅ (D12); `.vscode/mcp.json` con `localhost:3100` ✅;
`esbuild.config` sólo en `.vscodeignore:35-36` ✅ (D6); las **11 cuentas
de líneas** (511, 411, 686, 453, 423, 232, 427, 513, 398, 205, 102)
✅ **11/11**; los diffstats (+483, +165, +53, +173, +56, 169) ✅; **17 de
los 18 conteos por directorio** ✅ (`plan` da 28 y no 26 porque este WP
añadió sus dos ficheros — coherente con censar `1c90c43`).

**Contra el replan, no contra el censo:** leí §2 completa
(`REPLAN-V-ciudad-zigurat.md:34-58`). La fila 20 cubre **13** entradas de
primer nivel, la 21 `tests/` y la 16 `schemas/` = **15**; 31 − 15 = **16**
sin fila, y la lista de D1 es **exactamente** esas 16. Las «fuentes» de
las podas caras son fieles: fila 17 = `copilotLogs` ⛔poda, fila 18 =
`ArrakisTheater.*` ⛔poda, fila 19 = chatParticipants, fila 21 = tests
«poda + reemplazo», fila 16 = schemas «sustituir». §9·C4 y §9·C5 dicen lo
que se les atribuye. `plan/DECISIONES.md`: DV-11, DV-12, DV-16 y DV-16.a
las cuatro ⬜ **abiertas** — el censo no cierra ninguna.

### Hallazgos fuera del alcance de este WP

1. **El brief no pedía el mapa de dependencias.** Su CA (5 puntos) exige
   cobertura, cero `<pendiente>`, veredicto+motivo, «lo que el disco
   desmiente» y alcance limpio — **nada que garantice que V13 pueda
   ejecutar sin romper**. §8 del censo es voluntaria. Es decir: el WP
   cumple su CA y aun así podía entregar el agujero del punto 1. Si otro
   WP de esta ola gobierna una ejecución posterior, su CA debería exigir
   el mapa de arrastre, no confiar en que el worker lo añada de su
   cosecha. Esto es del vigía-S, no del worker.
2. **`tests/` engancha con lo podado, y coherentemente.**
   `tests/DonAlvaroValidation.test.ts:11` ⛔ *(cita rancia: podado por V13 (`c164731`). Se conserva porque era cierta al escribirse)* importa
   `DonAlvaroChatParticipant` (uno de los 19 muertos) y
   `tests/unit/mcpChatParticipant.test.ts:3` ⛔ *(cita rancia: podado por V13 (`f6ae634`). Se conserva porque era cierta al escribirse)* importa `McpChatParticipant`
   (poda). Ambos ficheros están en el contenido legado que se va, así que
   no hay contradicción — pero **V13 debe retirarlos en la misma pasada**
   o `tsc -p tsconfig.json` / `compile:tests` se cae. No es defecto del
   censo; es orden de ejecución que nadie ha escrito.
3. **`src/core/configurationCommandsService.ts` ⛔ *(cita rancia: podado por V13 (`9172d07`). Se conserva porque era cierta al escribirse)*** no aparece en ningún
   sitio del censo y es donde vive la fila 18. Ver punto 1.
4. **D16 confirmado como material de WP-V16** (el reporte ya lo deriva en
   §10·12): el log que afirma haber encontrado un fichero distinto del
   que abre es falsedad silenciosa de manual, y está en un camino que
   V16 no tiene en alcance.

### Qué NO pude comprobar, y por qué

- **La columna «¿viaja en el `.vsix`?» sigue sin contrastarse contra un
  paquete construido.** He verificado las 34 citas de `.vscodeignore`
  —que es lo que la columna dice derivar— pero `vsce package` es un
  comando caro y el brief lo prohíbe; el reporte lo declara en §9 y el
  brief la deja fuera de la CA. Queda igual de no verificada que antes:
  no lo cuento como defecto, lo cuento como límite heredado.
- **D9 (umbral de cobertura) sigue siendo predicción.** He verificado la
  configuración (`jest.config.js:15-30`) pero **no he corrido `jest`** —
  economía de CPU. La marca ⏳ del worker es honesta y la mantengo.
- **Nada de runtime.** «Vivo» aquí significa alcanzable estáticamente
  desde el punto de entrada; un módulo alcanzable puede no ejecutarse
  jamás. El censo ya lo declara (§9 del reporte) y no lo he mejorado.
- **No he auditado las 21 divergencias de §6 una por una**, sino 16 de
  ellas (D1–D3, D6, D8, D10–D21 completas o en su cita central). D4 y D5
  los re-derivé enteros. Las no auditadas en profundidad son D7 (leí el
  cierre del fichero, no la licencia íntegra) y las partes narrativas de
  D2.

### Lo que esta devolución NO es

No he arreglado nada, no he fusionado, no he cerrado ninguna DV y no he
tocado `z-sdk`, `scriptorium/**` ni el espejo OASIS. Mi única escritura es
esta sección y la línea `VEREDICTO_REVISOR`.

Y que conste el reparto: este censo es **bueno**. Reproduje su parte más
cara —el BFS— desde cero y salió idéntica; ataqué sus dos desmentidos más
agresivos (C1/D15/D16) y el worker tenía razón contra el borrador;
comprobé unas 90 citas de `fichero:línea` y **todas menos una** (el
matiz de `media`) son exactas. Devuelvo por una omisión de 14 líneas en
la tabla que gobierna la ejecución, no por desconfianza en el juicio.
Arreglados los tres puntos, esto es PASS sin más discusión.

---

## 13 · Corrección post-devolución

Los tres puntos, atendidos en la misma rama y con el mismo alcance (sólo
`plan/CENSO-V12.md` y este reporte). **Ningún veredicto cambia**; el
reparto sigue siendo **27 / 19 / 23 = 69**.

Método: la devolución trae una lista de `fichero:línea`. **No la he
copiado.** He aplicado la misma disciplina que apliqué al borrador
heredado —re-medir en vez de heredar— y he buscado *todas* las
referencias, no sólo las nombradas, para no arreglar el agujero a medias:

```
$ grep -rn "copilotLogs\|CopilotMetrics\|registerCopilotLogCommands\|\
getCopilotLogExporterService\|CopilotLogExporter" src/ --include='*.ts' \
  | grep -v "^src/copilotLogs/"
$ grep -rn "mcpChatParticipant\|McpChatParticipant" src/ --include='*.ts' \
  | grep -v "^src/mcpChatParticipant.ts"
$ grep -rn "TheatricalChatManager" src/ --include='*.ts' | grep -v "^src/theatrical/"
$ grep -rn "ArrakisTheater\." src/ --include='*.ts'
$ grep -rn "ConfigurationCommandsService" src/ --include='*.ts'
```

### Punto 1 · [BLOQUEANTE] mapa de arrastre — resuelto, y ampliado

Los **14 puntos** de la devolución: **verificados uno a uno, los 14
exactos**. `extensionBootstrap.ts:41,42,1773,1776` · `:11,57,115` ·
`:12,58,118` · `configurationCommandsService.ts:256-259`.

Al recontar aparecieron **6 puntos más** que la devolución no listaba, y
los añado porque el defecto era precisamente ése —que V13 creyera que la
lista está completa—:

| añadido | qué es | por qué importa |
| ------- | ------ | --------------- |
| `extensionBootstrap.ts:21` y `:1770` | import y llamada de `ConfigurationCommandsService.registerCommands` | la fila 18 no se ejecuta sólo en `configurationCommandsService.ts`: tiene dos llamadores |
| `configurationCommandsService.ts` **entero (263 líneas)** | el fichero existe **sólo** para los 4 `ArrakisTheater.*` (`:25,80,136,167` los documentan) | podar los 4 comandos deja 263 líneas huérfanas **dentro de `src/core`**, módulo «queda» |
| `mcpConfigurationManager.ts:22,28` | los dos ids como cadenas en un `console.log` de constructor | sobreviven al borrado y siguen imprimiendo comandos que ya no existen |
| `extensionBootstrap.ts:1776-1779` (no sólo `:1776`) | la llamada arrastra `initialize().catch(…)` | se borra el bloque, no la línea |
| `extensionBootstrap.ts:1781` | el log dice «+ Copilot Log Exporter» | texto que miente tras la poda |

Y una **anomalía nueva**: `extensionBootstrap.ts:42` importa
`CopilotMetricsPanelProvider` **y no lo usa nunca** — el registro real de
la vista `copilotMetrics.panel` está en `copilotLogs/commands.ts:485-488`.
Import muerto en código vivo. No cambia veredicto; evita que V13 busque
un re-cableado que no existe.

Escrito en `plan/CENSO-V12.md` §8: cuatro filas nuevas en la tabla de
arrastre, una tabla-resumen de puntos de edición por poda, la anomalía
del import muerto, y el cierre que contrasta «lo muerto sale gratis; lo
vivo de las filas 17, 18 y 19 se paga en `src/core`». El expediente
DV-11 (§7) nombra ahora el mismo cableado en su salida «poda».

### Punto 2 · [MENOR] D18 — resuelto

`git ls-files src | grep -v '\.ts$'` = **17** (re-verificado). Añadidos
los 3 que faltaban: `src/theatrical/core/schemas/{agent,company,play}.schema.json`,
con la aritmética explícita (3 + 1 + 10 + 3 = 17) y una precisión que la
devolución no pedía pero evita un error caro: **no son el `schemas/` de
primer nivel** —ése es re-contenido y está cableado en
`contributes.jsonValidation`—; a éstos sólo los leería `validation.ts`,
que está entre los 19 muertos.

### Punto 3 · [MENOR] celda `.vsix` de `media` — resuelto

Verificado: `.vscodeignore:28` es `*.md`, y `:29-30` re-incluyen **sólo**
README y LICENSE. `git ls-files media | grep -c '\.md$'` = **1**
(`ICON_CREATION_GUIDE.md`). La celda pasa de «sí — ningún patrón lo
cubre» a **«22 de 23»**, con el patrón citado.

### Observación de orden de ejecución para V13 — anotada

Verificada en el disco: `tests/DonAlvaroValidation.test.ts:11` ⛔ *(cita rancia: podado por V13 (`c164731`). Se conserva porque era cierta al escribirse)* importa
`DonAlvaroChatParticipant` y `tests/unit/mcpChatParticipant.test.ts:3` ⛔ *(cita rancia: podado por V13 (`f6ae634`). Se conserva porque era cierta al escribirse)*
importa `McpChatParticipant`. Ambos van en el contenido legado que se
poda, así que no hay contradicción, pero **la poda de esos tests debe ir
en el mismo commit que la de su código, o antes**, o `compile:tests` se
cae entre commits. Añadido en §8 del censo, junto con el dato adyacente
de que `tests/integration/extensionChatIntegration.test.ts:3` ⛔ *(cita rancia: podado por V13 (`f6ae634`). Se conserva porque era cierta al escribirse)* importa
`ExtensionBootstrap` y por tanto también acusa las ediciones de la tabla.

### Lo que esta corrección NO toca

Ni un veredicto, ni un recuento, ni `src/`, ni el alcance. Sigue sin
ejecutarse un solo comando caro y sin `git rm`. `VEREDICTO_REVISOR` se
deja **como está**: lo levanta el contrarrevisor al verificar, no yo.

---

## Aceptación del orquestador (2026-07-25 · sesión debug)

Devolución `99159ff` **levantada** tras la corrección `48cc874`:
verificación puntual del orquestador sobre el diff estrecho (alcance =
2 ficheros; puntos 1-3 presentes con citas; spot-check propio del
import muerto `src/core/extensionBootstrap.ts:42` → cero usos, registro
real en `copilotLogs/commands.ts:485-488` — exacto). Los 6 puntos extra
del re-conteo y la anomalía nueva refuerzan el mapa; ningún veredicto
de fila cambió (27/19/23 = 69).

VEREDICTO FINAL: **✅ ACEPTADO**. El censo gobierna V13; el orden de
poda de tests acompaña al de su código (mismo commit o antes).
