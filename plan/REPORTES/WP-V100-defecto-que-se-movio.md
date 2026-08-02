# WP-V100 · El defecto D16 no se arregló: se movió, y la cita rancia lo tapaba

**Worker V** · rama `wp/v100-defecto-que-se-movio` · árbol `C:/S_LAB/wt/v-v100`
· base `088155a` · 2026-08-02

---

## 0 · Identidad, y por qué esta vez se comprueba antes de tocar nada

El intento anterior se abortó porque el worktree colgaba del repositorio
equivocado. Primera orden de esta sesión, antes de leer una sola línea de
producto:

```
$ cd /c/S_LAB/wt/v-v100 && cat .git
gitdir: C:/S_LAB/v-sdk/.git/worktrees/v-v100

$ git rev-parse --abbrev-ref HEAD
wp/v100-defecto-que-se-movio

$ git status --short
(vacío)
```

`ALCANCE_DIFF` respetado: `src/core/mcpConfigurationManager.ts` + su test +
este reporte. **Una excepción, autorizada por el BRIEF**:
`scripts/cobertura.suelo.json` se mueve, firmado, en §6.

**Herramientas declaradas** (el BRIEF exige declarar `npx`):

- `npx jest --coverage` — **una vez, al principio, y falló**: `Preset ts-jest
  not found relative to rootDir`. Ahí se descubrió que el worktree **no tenía
  `node_modules`** (git no copia lo ignorado). Sin efecto sobre el árbol.
- `npm ci` — instalación de dependencias en el worktree. `node_modules/` está
  en `.gitignore:1`, así que **no entra en el diff**.
- A partir de ahí, jest **siempre** por `./node_modules/.bin/jest`, y **siempre
  con `--coverage=false`** salvo las cuatro corridas de medición del suelo
  (§6), que es cuando el BRIEF lo permite.

---

## 1 · El defecto, re-medido: eran tres mentiras, no dos

El BRIEF ya traía la corrección (el brief anterior sólo citaba dos). **La
confirmo, íntegra**, sobre el fichero en `HEAD` (365 líneas):

| línea | qué es | qué dice | ¿verdad? |
| --- | --- | --- | --- |
| L34 | docstring | «Initialize configuration from **sample-config.json**…» | **FALSA** |
| L42 | comentario | «look for **sample-config.json** in workspace» | **FALSA** |
| L45 | **código** | `path.join(workspaceRoot, 'ArrakisTheater_OperaConfig.json')` | verdad |
| L49 | **log** | `` `Found sample-config.json at: ${configPath}` `` | **FALSA** |
| L59 | aviso al usuario | nombra `ArrakisTheater_OperaConfig.json` | verdad |

**Tres menciones muertas contra dos vivas**, y las cinco sobre el mismo hecho.

Lo que hace a D16 el caso límite de la clase B de V98: la coordenada del censo
(`:58-65`) hoy **resuelve y contiene código inocente**, así que el barrido de
citas la aprueba mientras el defecto vive quince líneas más arriba.

### 1.1 · El dato que cierra la puerta a «buscar el que dice el comentario»

```
$ ls sample-config.json ArrakisTheater_OperaConfig.json
ls: cannot access 'sample-config.json': No such file or directory
ls: cannot access 'ArrakisTheater_OperaConfig.json': No such file or directory

$ git show --stat f615434 | grep -iE "sample-config|OperaConfig"
 ArrakisTheater_OperaConfig.json                    |  120 -
 .../ArrakisTheater_OperaConfig.json                |  110 -
 sample-config.json                                 |  110 -
```

V13 podó **los dos** (`f615434`, «chore(poda): retirar 18 entradas inertes del
legado»). **Ninguno de los dos candidatos existe**, así que «alinear hacia el
nombre del comentario» no era una opción disponible: era elegir entre dos
fantasmas.

Y la búsqueda no apunta al repo de la extensión sino a
`vscode.workspace.workspaceFolders[0].uri.fsPath` — **el workspace del
usuario**. Por eso la poda **degrada, no rompe**, exactamente como lo registra
`plan/CENSO-V12.md:363`:

> «…la busca como config por defecto, aunque **en el workspace del usuario** y
> con `fs.existsSync`, así que la poda degrada en silencio y no rompe»

---

## 2 · La decisión, con su argumento

**Sigo la recomendación medida del BRIEF** —alinear L34+L42+L49 a
`ArrakisTheater_OperaConfig.json`— **y no invado WP-V47 ni WP-V32**. El
argumento, en cuatro datos:

1. **Es el único nombre que el sistema usa de verdad.** Lo compone `L45` y lo
   anuncia `L59`. Dos sitios vivos contra tres muertos: se alinea hacia lo que
   el código hace, no hacia lo que la prosa decía.
2. **Cambia cero conducta.** Ni una rama, ni una ruta, ni un valor. La única
   diferencia observable es que el log deja de mentir.
3. **Las alternativas tienen dueño abierto, y lo verifiqué**:
   - retirar la marca «Arrakis» → **WP-V47** (`plan/BACKLOG.md:103`, P2,
     «Retirar la marca previa de las 5 superficies (`ARRAKIS_*`)»).
   - que el usuario elija el fichero, y que `initialize()` deje de adoptarlo y
     auto-escribirlo sin preguntar → **WP-V32**, vía el hallazgo **H-11** de
     V23: `plan/REPORTES/WP-V23-config-intencional.md:1027` lo enruta
     literalmente a «**V32** (+ **V47** por la marca)».
4. **Hacer cualquiera de las dos aquí sería cambio de producto sin ficha.**

### 2.1 · Dónde me desvío del BRIEF, y con qué dato

El BRIEF dice «alinear L34+L42+L49». **Hice eso y una cosa más**, y lo declaro
porque es una desviación real:

> **Re-sincronizar tres copias a mano deja intacto el mecanismo que las
> desincronizó.** El nombre estaba escrito una vez y descrito tres. Si sólo
> corrijo las tres descripciones, mañana vuelven a derivar — que es
> **literalmente lo que ya pasó**: D16 se marcó como cerrado, y reapareció
> quince líneas más abajo.

Por eso el nombre pasa a ser **una constante**, `OPERA_CONFIG_FILENAME`, y los
tres sitios *ejecutables* la interpolan en vez de repetirla:

- el `path.join` que compone la ruta,
- el log que anuncia el hallazgo,
- el aviso ⏳ que se le muestra al usuario.

Tras esto **el log y el aviso no pueden divergir del fichero que se abre: son la
misma expresión, no cadenas gemelas**. Lo único que sigue pudiendo derivar es la
**prosa** (docstring y comentario), que no puede interpolar — y ésa es
exactamente la que vigila el test de §4·2.

**Esto no invade V47 ni V32.** Al contrario: V47 pasa de tener dos literales que
cambiar a tener **uno**.

### 2.2 · Una convención que el módulo ya practicaba, ahora explícita

El fichero ya nombraba cosas muertas **declarándolas muertas** (los comandos
podados del constructor, la clave demolida de `launcher`). WP-V100 lo convierte
en regla comprobable:

> **un nombre muerto se escribe entre comillas angulares —«así»—; uno vivo va
> con la constante o con su literal.**

Es lo que permite que el test distinga «narro el nombre histórico equivocado»
de «afirmo este nombre». Su punto débil está declarado en §7.

---

## 3 · Censo con denominador

Regla declarada (mecánica, reproducible): una línea **porta un nombre** si
contiene un **token literal** que nombre (a) un fichero `*.json|*.ts|*.md`,
(b) una clave o glob de clave `aleph0.…`, o (c) un comando `ArrakisTheater.…`.
Los **identificadores** (`ALEPH0_SECTION`, `MCP_CONFIG_PATH_SUBKEY`) quedan
fuera: no son nombres literales, y DV-16.a dice que no se renombran.

### 3.1 · Antes (fichero en `HEAD`, **365 líneas**)

Con la regla **estrecha** del BRIEF —artefactos que el manager *consume o
anuncia*, sin las referencias cruzadas a código fuente—: **10 líneas**.

| # | línea | token | veredicto |
| --- | --- | --- | --- |
| 1 | L22 | `ArrakisTheater.LoadConfig` / `.DownloadConfig` | **muerta y DECLARADA muerta** |
| 2 | L34 | `sample-config.json` | **FALSA** |
| 3 | L42 | `sample-config.json` | **FALSA** |
| 4 | L45 | `ArrakisTheater_OperaConfig.json` | verdadera |
| 5 | L49 | `sample-config.json` | **FALSA** |
| 6 | L59 | `ArrakisTheater_OperaConfig.json` **+** `aleph0.*` | verdadera **+ viva** |
| 7 | L96 | `aleph0.ollama.baseUrl` | **muerta y DECLARADA muerta** |
| 8 | L108 | `aleph0.*` | viva |
| 9 | L181 | `aleph0.pieza.launcher.port` | viva |
| 10 | L210 | `aleph0.ciudad.*` | viva |

**CORRECCIÓN AL BRIEF, medida.** El BRIEF dice «**11** líneas», con el desglose
3 falsas + 2 verdaderas + 2 declaradas + 4 vivas. **El desglose es correcto; el
total no**: son **10 líneas**, porque **L59 se cuenta dos veces** — lleva un
nombre de fichero verdadero *y* una clave viva. Es decir: **10 líneas / 11
tokens-en-rol**. Todo lo demás del censo del BRIEF se confirma sin cambios.

Las 4 vivas, verificadas contra `package.json` (no de memoria):

| token | dónde vive |
| --- | --- |
| `aleph0.*` (L59, L108) | la sección tiene 19 claves declaradas |
| `aleph0.pieza.launcher.port` | `package.json:591` |
| `aleph0.ciudad.*` | `package.json:558`, `:564`, `:573` |

**Dato que ningún censo previo registró**: la única clave que `initialize()`
realmente lee —`aleph0.mcp.configPath` (`package.json:621`)— **no aparecía
literalmente en el fichero**; sólo compuesta desde dos identificadores. No es un
defecto, pero explica por qué era fácil perderle la pista.

### 3.2 · Bajo la regla ancha (todo token literal): 17 líneas

Las 7 restantes son el docstring de V23 (`L218-221`, `L223`, `L225`, `L233`):
referencias cruzadas a código fuente, no artefactos de configuración. Son
justamente el **hallazgo heredado** de §5. Doy los dos números para que la regla
no haga trampa con el denominador.

### 3.3 · Después (fichero entregado, **419 líneas**)

**13 líneas** portan nombre bajo la regla estrecha, y **CERO son falsas**:

- **3 verdaderas** — L51 (la constante), L73 (docstring), L85 (comentario).
- **4 declaradas muertas** — L20, L45, L75 («sample-config.json»), L61
  (comandos podados), L139 (clave demolida).
- **5 vivas** — L16 (`aleph0.mcp.configPath`, **ahora sí nombrada**), L102,
  L151, L224, L253.
- **El log ya no porta literal alguno**: interpola la constante. La falsedad no
  se corrigió, **se volvió inexpresable**.

---

## 4 · El test: qué vigila y por qué así

`tests/unit/core/mcpConfigurationManager.test.ts` — **fichero nuevo**. Antes de
él, `tests/` tenía **12 ficheros de test y ninguno nombraba el manager**:

```
$ find tests -name "*.test.ts" -o -name "*.spec.ts" | wc -l
12
$ grep -ril "mcpConfigurationManager" tests/
(sin resultados)
```

**§1 · El invariante, EN EJECUCIÓN.** Se corre `initialize()` de verdad, se
captura la ruta que llega a `fs.existsSync`/`readFileSync` y el mensaje que
llega al logger, y se comprueba que **el nombre que el log anuncia es el
basename del fichero que el código abre**. No lee el fuente: ejecuta. Eso *es*
D16.

**§2 · La prosa, que no puede interpolar.** Ningún token `*.json` del módulo
puede ser distinto de `OPERA_CONFIG_FILENAME` salvo que esté declarado muerto
con «…». Más: el literal `'ArrakisTheater_OperaConfig.json'` debe aparecer
**exactamente una vez** en todo el fichero.

**§3 · Las coordenadas del docstring de V23** (el hallazgo heredado, §5).

Detalle técnico que puede morder a quien lo toque: `fs.existsSync` **no se puede
espiar con `jest.spyOn` en node ≥ 20** (`Cannot redefine property`). Se sustituye
el módulo entero conservando lo real, y §2/§3 leen fuentes por
`jest.requireActual('fs')` para no depender del doble.

---

## 5 · El hallazgo heredado: **CERRADO**, no enrutado

El BRIEF lo dejaba a mi criterio. **Lo cierro**, porque la falsedad vive **en mi
propio fichero** (el docstring de `getDefaultSocketUrl`) y corregirla no exige
tocar `socketMonitor.ts` ni `configsTreeView.ts` — que **no toqué**:
`git status` sólo lista dos ficheros modificados y uno nuevo.

**Re-medido, y corrijo el conteo del BRIEF.** El BRIEF dice «8 citas, 4 falsas».
Yo mido **9 coordenadas, 5 falsas**:

| citado | real | veredicto |
| --- | --- | --- |
| `assembleContext.ts:109` | :109 | ✅ |
| `socketMonitor.ts:276` (wrapper) | :278 | ❌ +2 |
| `socketMonitor.ts:280` | :282 | ❌ +2 |
| `socketMonitor.ts:643` | :308 | ❌ **otro sitio entero** — `:643` es JS de la webview |
| `configsTreeView.ts:429` | :437 | ❌ +8 |
| `socketsTreeView.ts:85` | :85 | ✅ |
| `socketsTreeView.ts:232` | :232 | ✅ |
| `socketsTreeView.ts:92` | :92 | ✅ |
| `configsTreeView.ts:428-430` | :436-438 | ❌ +8 (**la novena, que el BRIEF no contaba**) |

**Las 9 resuelven.** Ése es el punto: un barrido que sólo comprueba que el
fichero tiene esa línea **las aprueba todas**.

**El conteo sí era verdadero**, y lo confirmo mecánicamente: `6` llamadas
consumen el valor. También confirmo el «2 de sus 3 plantillas»:
`defaultSocketUrl` se escribe en `configsTreeView.ts:447` y `:463`.

El test de §3 fija las **11** coordenadas con **lo que cada una debe nombrar**
—no sólo que resuelva— y prohíbe que el docstring cite ninguna que la tabla no
haya medido.

---

## 6 · Movimiento del suelo, firmado

⚠️ El BRIEF avisaba de que este WP movería el trinquete, y lo mueve.

**Cuatro corridas, misma máquina, suite entera.** La primera existe para probar
que **el suelo declarado reproduce en este árbol** antes de moverlo — sin eso, el
delta no significa nada:

| corrida | fuente | test nuevo | statements / branches / functions / lines |
| --- | --- | --- | --- |
| A | `HEAD` | no | **1816 / 547 / 352 / 1780** ← **reproduce el suelo exacto** |
| B | este WP | no | 1817 / 547 / 352 / 1781 |
| C | este WP | sí | **1844 / 558 / 357 / 1808** |

```
$ git show HEAD:src/core/mcpConfigurationManager.ts > src/core/mcpConfigurationManager.ts
$ ./node_modules/.bin/jest --coverage --testPathIgnorePatterns "/node_modules/" "/out/" "/dist/" "mcpConfigurationManager.test.ts"
Test Suites: 14 passed, 14 total
Tests:       1 skipped, 477 passed, 478 total
BASELINE PRISTINO: statements 1816  branches 547  functions 352  lines 1780
```

**La corrida B no es decorativa.** Aísla **+1 sentencia y +1 línea que NO son
test**: la declaración `export const OPERA_CONFIG_FILENAME`, que se ejecuta al
importar el módulo y por eso la cuentan los tests que ya existían. Sin B, ese +1
se habría vendido como cobertura nueva.

**Los otros +27 / +11 / +5 / +27** son código de producto que hasta hoy no
ejercitaba nadie: `initialize()` en sus dos salidas, y con ella
`loadConfigFromFile`, `setEmptyPendingConfiguration`, `updateVSCodeSettings` y
`getMcpServiceLauncherPort`.

**Sube en las cuatro métricas: no es un ablandamiento.** Con 1844 declarado, el
informe de ayer (1816) se rechaza por regresión. **El censo no se tocó**: los
mismos 9 ausentes (6 TIPOS + 3 NO-COMPILA).

```
$ node scripts/cobertura-trinquete.mjs
censo: 96 ficheros en src · 87 en el mapa · 9 ausentes (9 declarados)
  statements  1844 cubiertas (suelo 1844) · 30.29 % informativo, NO decide
  branches     558 cubiertas (suelo 558) · 25.12 % informativo, NO decide
  functions    357 cubiertas (suelo 357) · 27.29 % informativo, NO decide
  lines       1808 cubiertas (suelo 1808) · 30.62 % informativo, NO decide

cobertura: censo COMPLETO y unidades cubiertas EN EL SUELO declarado
exit=0
```

---

## 7 · Los negativos, **verificados desactivando su guardián**

El BRIEF: *«un negativo no está verificado hasta que DESACTIVAS su guardián y
compruebas que enrojece»*. Cuatro mutaciones, cada una revertida después.

**Nota de método, porque el primer intento fue un falso verde**: la primera
versión del script pasaba a `node` una ruta POSIX (`/c/S_LAB/...`) que Windows
resolvía como `C:\c\S_LAB\...`. **Las mutaciones no se aplicaban y los cuatro
casos salían «verde»** — un verde que sólo decía que no se había tocado nada. Se
detectó porque el script imprime con `grep` la línea mutada **antes** de correr
jest, y la línea no había cambiado. La versión final **aborta con código 3 si el
patrón no está**.

| # | mutación | resultado |
| --- | --- | --- |
| **M1** | el log vuelve al literal histórico: `` `Found sample-config.json at: ${configPath}` `` — **D16 tal cual** | **2 fallan** ✅ |
| **M2** | el docstring vuelve a «Initialize configuration from sample-config.json» | **2 fallan** ✅ |
| **M3** | vuelve una coordenada falsa **que resuelve**: `configsTreeView.ts:437` → `:429` | **1 falla** ✅ |
| **M4** | la ruta compuesta se desvía: `path.join(workspaceRoot, 'otro.json')` | **3 fallan** ✅ |

```
############ M1 · el log vuelve al literal historico (D16 tal cual) ############
mutado OK
92:                    this.logger.info(`Found sample-config.json at: ${configPath}`);
  ● WP-V100 §1 · … › anuncia en el log EXACTAMENTE el basename de la ruta que comprueba en disco
  ● WP-V100 §2 · … › ningún nombre de fichero .json vivo distinto de OPERA_CONFIG_FILENAME
Tests:       2 failed, 17 passed, 19 total

############ M3 · vuelve una coordenada falsa que RESUELVE (:429) ############
mutado OK
263:     * `socketMonitor.ts:308`, `treeViews/configsTreeView.ts:429`,
  ● WP-V100 §3 · … › el docstring no cita ninguna coordenada fuera de la tabla (salvo las declaradas muertas)
Tests:       1 failed, 18 passed, 19 total

############ CONTROL · restaurado, debe volver a verde ############
Tests:       19 passed, 19 total
```

**M1 es la prueba que importa**: es el estado exacto del fichero antes de este
WP, y §1 lo caza **en ejecución**.

**Debilidad declarada de la convención «…»**: alguien podría silenciar §2
envolviendo un nombre vivo equivocado en comillas angulares. **§1 lo cazaría
igual**, porque no lee el fuente: ejecuta y compara. La convención protege la
prosa; la ejecución protege la conducta.

---

## 8 · Cero regresión

```
$ ./node_modules/.bin/jest --coverage
Test Suites: 15 passed, 15 total
Tests:       1 skipped, 496 passed, 497 total
```

Antes: 14 suites / 478 tests (477 pass, 1 skip). Después: 15 / 497 (496 pass, 1
skip). **+1 suite, +19 tests, 0 fallos, el mismo skip de siempre.**

Compilación: `tsc -p tsconfig.json --noEmit` da **0 errores en el fichero
tocado**; los que salen son los preexistentes y ya declarados (3× TS2353 del
censo de cobertura, más TS1479 de `@zeus/*`). `npm run compile` (esbuild)
empaqueta `dist/extension.js` sin novedad.

---

## 9 · Qué NO cubro

1. **No retiro la marca «Arrakis»** — es **WP-V47**. Este WP la deja en **un
   solo literal**, así que V47 sale más barato.
2. **No hago el nombre configurable ni toco la adopción silenciosa con
   auto-escritura** — es **WP-V32** (H-11). `initialize()` sigue adoptando el
   fichero y escribiendo la ruta en los ajustes del workspace **sin preguntar**.
   Intacto y sin disimular.
3. **No arreglo `getDefaultSocketUrl()`**, que sigue inventando
   `ws://localhost:<puerto>` — es **WP-V31**. Sólo corregí las coordenadas de su
   docstring.
4. **No toco `socketMonitor.ts` ni `configsTreeView.ts`**, prohibido por el
   BRIEF. Sus coordenadas se fijan **desde el test**, no editándolos — con el
   coste de que si alguien mueve esas líneas, el rojo aparece **aquí**.
5. **`sample-config.json` sigue vivo en `src/`, en dos ficheros que no puedo
   tocar — y uno de los dos es MÁS GRAVE que el defecto que este WP venía a
   cerrar.** D16 mentía en prosa y en un log que sólo lee quien abre la
   consola. Esto otro es **dato vivo, no prosa**. Lo medí antes de afirmarlo:

   ```
   $ grep -rn "sample-config" src/
   src/core/mcpConfigurationManager.ts:20,45,75   ← míos, los tres «declarados muertos»
   src/mcpTypes.ts:15
   src/views/HackerConfigPanelProvider.ts:239
   ```

   - **`src/mcpTypes.ts:15`** — comentario, `// Configuration interfaces to
     match sample-config.json structure`. Coordenada **confirmada** contra
     `plan/CENSO-V12.md:427`, que decía `:15`. Inerte pero falso: describe la
     forma de un fichero podado.
   - **`src/views/HackerConfigPanelProvider.ts:239`** — **no es un comentario:
     es un dato vivo.** El panel SETTINGS ofrece `sample-config.json` como
     plantilla. **La coordenada del censo derivó**: `plan/CENSO-V12.md:383` la
     fija en `:233`, hoy está en **`:239`** (+6) — *otra* cita de la clase B, en
     el censo mismo. Confirmo el veredicto de fondo de V12: resuelve contra el
     workspace del usuario (`:234`) y filtra con `fs.existsSync` (`:247`), así
     que **degrada, no rompe**; ofrece un fichero que nunca aparecerá.

   **Las dos están fuera de `ALCANCE_DIFF` y las dos son la misma familia que
   D16.** Es la siguiente piedra de esta clase, y viene con la coordenada ya
   re-medida para que quien la coja no repita el trabajo.
6. **No corrijo `plan/BACKLOG.md`**, prohibido. La ficha de V100 cita
   `mcpConfigurationManager.ts:42-49`, que tras este WP **ya no es la
   coordenada** del bloque (hoy `:85-92`). Queda dicho: es exactamente el
   mecanismo que este WP combate, y se me prohíbe arreglarlo desde aquí.
7. **`aleph0.*` como glob no está verificado clave por clave.** Comprobé que la
   sección existe con 19 claves; no que las 19 sean todas alcanzables.
8. **Suelo medido en una sola plataforma** (Windows 11 / node v22.21.1). No
   reproduje la condición de CI. El precedente de WP-V96 dice que aquí ha habido
   divergencia antes; si CI discrepa, **el número de este reporte no es el
   árbitro**.
