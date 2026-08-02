# WP-V98 · El censo estaba vivo y mentía en presente

| dato | valor |
| ---- | ----- |
| rama | `wp/v98-censo-vivo` |
| alcance del diff | `plan/CENSO-V12.md` + este reporte — **cero** código, cero `src/`, `tests/`, `scripts/`, `plan/BACKLOG.md` |
| encargo | 21 citas rancias en `plan/CENSO-V12.md`, y decidir qué es ese documento |
| entregado | **79** referencias defectuosas localizadas en **tres clases** (el barrido veía 21), las 69 filas re-medidas hoy, y el documento **cerrado como acta** |
| veredicto del punto 4 | **ACTA CERRADA** — el censo cumplió su función; hoy el carril **no tiene censo vigente**, y eso queda declarado |
| barrido con `AMBITO=plan` | `plan/CENSO-V12.md` → **RANCIA = 0**. El ámbito sale `FAIL` por **3** rancias en `plan/BACKLOG.md`, fuera de `ALCANCE_DIFF` — §3.3 |
| estado propuesto | listo para revisión |

---

## 0 · Qué se encontró, en una línea

El encargo hablaba de 21 citas rotas. Lo que había era **79 referencias
defectuosas**, porque el barrido automático sólo ve **una de las tres clases**
de cita que este documento tenía rotas — y la clase más peligrosa, la que
`plan/PRACTICAS.md` §7 nombra sin poder cazar, tenía **24 casos de 33**.

---

## 1 · El instrumento: el barrido de V92, sin tocarlo

`ALCANCE_DIFF` prohíbe `scripts/`, así que el barrido sigue sin casa (deuda
**E-4** de V92, aún abierta). Se extrajo **literal** del reporte que lo
contiene, sin editar una coma:

```
$ sed -n '116,269p' plan/REPORTES/WP-V92-citas-rancias.md > barrido-citas.mjs
$ AMBITO=plan node barrido-citas.mjs .
```

**No se ha escrito un segundo barrido.** Las clases B y C de §3 no son otro
instrumento: son **lectura a mano** sobre el universo que el barrido delimita,
que es justo lo que V92 dejó enrutado en **E-3**.

### 1.1 · Un cuarto defecto del barrido, para la lista de su autor

V92 censó tres defectos propios (`js` casando antes que `json`, los ficheros de
raíz sin barra fuera del denominador, el prefijo de mundo `z:`). Aquí sale un
**cuarto**, y es de construcción, no de regex:

> **`RAIZ` se construye con `readdirSync(ROOT)` sobre los ficheros que existen
> HOY.** Un fichero de raíz **borrado** no entra en la alternancia, así que una
> cita a `sample-config.json` o a `ArrakisTheater_OperaConfig.json` —los dos
> podados por V13— **no se extrae siquiera**: no cuenta como rancia, y tampoco
> como denominador.

Es el simétrico exacto del defecto nº 2 de V92: aquél dejaba fuera los ficheros
de raíz **vivos**; éste deja fuera los **muertos**, que son precisamente los que
más se citan en presente. No es hipotético: `plan/CENSO-V12.md` cita ambos, y el
barrido no los ve. Se anotaron igual, por lectura.

**No lo he arreglado** — el barrido no es mío y tocarlo invalidaría la
comparación con la corrida de V92. Enrutado en §6 (**E-98-1**).

---

## 2 · La decisión del punto 4: se cierra como ACTA

El brief daba dos salidas y prohibía la ambigüedad. **Se cierra como acta.** La
razón está escrita en el propio documento (`plan/CENSO-V12.md` §0.1) y se resume
en tres hechos medidos, no en una preferencia:

| # | hecho | medido |
| - | ----- | ------ |
| 1 | **su función está consumida** | las **23** filas con veredicto *poda* están ejecutadas **las 23** (`test -e` sobre cada ruta, §4); las decisiones que dejaba abiertas —DV-11, DV-12, DV-16, DV-16.a— se cerraron **en bloque el 2026-07-25** con GO del custodio (`plan/DECISIONES.md`) |
| 2 | **ya nadie planifica sobre él** | sus consumidores son los briefs de V13, V14 y V15, **los tres ejecutados y aceptados**. La única referencia viva en `plan/BACKLOG.md` es la fila de **este mismo WP** |
| 3 | **corregirlo sería escribir otro documento** | censa **41** entradas de primer nivel y **28** módulos; hoy hay **25** y **25**. **23 de sus 69 filas** (33 %) describen cosas borradas |

Sobre el punto 3 conviene ser explícito, porque es donde estuvo la tentación:
«re-medir» la fila de `pics/` no da un dato nuevo, da «no existe». Un censo cuyo
tercio superior sólo puede decir «no existe» no es un censo con datos viejos: es
el **acta de una amputación consumada**, que es exactamente lo que V12 dijo que
era («V12 decide; V13 ejecuta») y lo que el paso del tiempo confirmó.

### 2.1 · Lo que este veredicto obliga a declarar, y se declara

> **Hoy el carril NO tiene censo vigente.**

Está escrito en `plan/CENSO-V12.md` §0.1 con esas palabras. Es la consecuencia
honesta de cerrar el único que había, y **no** se disimula convirtiendo el acta
en un censo a medias. Si alguien necesita un censo del árbol de hoy, es un WP
nuevo, y ahora se sabe.

### 2.2 · Por qué anotar y no reescribir, siendo un documento «vivo»

`plan/PRACTICAS.md` §7 dice que los reportes se anotan y los documentos vivos se
corrigen. Al declararlo **acta**, cae del lado de «se anota» — y ésa es
justamente la coherencia que el brief pedía: el documento deja de estar a
caballo. Las **76** anotaciones del cuerpo **conservan literalmente lo que se
dijo** y añaden qué se mide hoy.

```
$ git diff --stat plan/CENSO-V12.md
 plan/CENSO-V12.md | 388 +++++++++++++++++++++++++++++++++++-----------
 1 file changed, 312 insertions(+), 76 deletions(-)
```

Las **76 «deletions» son las 76 líneas anotadas** (git cuenta una línea
modificada como borrada + añadida). **Cero palabras retiradas**: verificado
comprobando que el texto previo de cada una de esas 76 líneas sigue contenido en
la línea nueva, y que **ninguna fila de tabla cambió su número de `|`** —la
errata que V92 estuvo a punto de cometer:

```
filas con numero de | distinto : 0   (debe ser 0)
lineas antes: 700  despues: 700
```

Las anotaciones se aplicaron **con un script de tabla explícita**, no a mano
(mismo motivo que V92 §2: 76 ediciones a mano son un sitio excelente para colar
una errata). La tabla `linea -> nota` va entera en §7.

---

## 3 · Las tres clases, con sus tres denominadores

El hallazgo central del WP. El barrido de V92 es correcto y su `PASS` significa
lo que dice — pero significa **menos de lo que parece**, y aquí está medido
cuánto menos.

| clase | quién la caza | denominador | defectuosas | tras el WP |
| ----- | ------------- | ----------- | ----------- | ---------- |
| **A · la cita no resuelve** | el barrido, automático | **189** citas extraídas del documento | **21** | **0** |
| **B · resuelve y miente** | a mano | **33** de esas 189 resuelven **con coordenada** | **24** | **0** |
| **C · retro-referencia desnuda `:NN`** | a mano; **el barrido no la ve por construcción** | **36** en la columna «¿viaja en el `.vsix`?» | **34** | **0** |

**79 referencias defectuosas. El instrumento veía 21.**

### 3.1 · Clase B — la que el punto 5 del brief pedía buscar

**24 falsas sobre 33 miradas.** Se miraron **las 33**, no una muestra: son todas
las citas del censo que resuelven *y* llevan coordenada, es decir, el universo
completo donde la clase puede darse. Las 9 restantes se verificaron correctas y
se dejan sin tocar (`.vscodeignore:2-3`, `.gitignore:2` ×3, `jest.config.js:12-13`
×2, `src/mcpServerManager.ts:4` ×2, `src/mcpTypes.ts:15`).

Las tres peores, por lo que costaría no creerlas:

| cita | qué afirmaba el censo | qué hay hoy en esa coordenada |
| ---- | --------------------- | ----------------------------- |
| `jest.config.js:23-28` | «fija `coverageThreshold` global en 75/80/85/85» | el comentario de WP-V93 explicando **que no hay ningún umbral y que es a propósito**. No caducó el número: **se invirtió el hecho** |
| `package.json:7` | «declara `license: "SEE LICENSE IN LICENSE.md"`» | sigue siendo **la clave `license`, la línea exacta** — con valor `GPL-3.0-or-later`. Coordenada correcta, clave correcta, afirmación falsa |
| `src/core/mcpConfigurationManager.ts:58-65` (citada **4 veces**) | el bloque que prueba la falsedad silenciosa **D16** | código inocente. **El defecto no se arregló: se movió** a `:42-49`, y la cita rancia lo estaba tapando — §5 |

El caso `package.json:7` es el más instructivo del lote: es el contraejemplo
perfecto a la idea de que «coordenada + hecho» (la forma intermedia de la tabla
de V92 §5) basta. Aquí **el hecho citado era la clave, y la clave sigue ahí**;
lo que cambió fue el valor. Sólo un gate lo habría cogido.

### 3.2 · Clase C — la que ningún barrido de citas puede ver

La columna «¿viaja en el `.vsix`?» de la Tabla A no cita rutas: cita
**coordenadas desnudas**, `no (`:54`)`, `sí (`:29`)`. Sin token de ruta, el
regex del barrido **no las extrae**, así que ni siquiera entran en el
denominador de 189.

Su referente es `.vscodeignore`, que pasó de **64** a **68** líneas. Comprobadas
**las 36 contra el fichero de hoy**:

```
.vscodeignore tiene HOY 69 lineas
...
total retro-referencias en la columna .vsix : 36
  siguen apuntando a su patron              : 2
  apuntan a otra cosa (STALE)               : 34
```

Las 2 supervivientes (`.vscode` → `:10`, `src` → `:2-3`) lo son porque están
**antes** del punto donde el fichero creció. Todas las demás están desplazadas.
Muestra:

| fila | decía | hoy esa línea es |
| ---- | ----- | ---------------- |
| `plan` | `no (:52)` | `pics/**` |
| `tsconfig.json` | `no (:33)` | `!README.md` |
| `fixtures` | `no (:16)` | `**/*.map` |
| `coverage` | `no (:12 y :56)` | `tests/**` y `plan/**` |

**Lección que sale de aquí y que no estaba en V92:** una retro-referencia
`(`:NN`)` es **peor** que una coordenada completa, porque además de caducar
igual, es **invisible al único instrumento que las vigila**. Enrutada como
**E-98-2**.

### 3.3 · El barrido, salida literal · ANTES

```
ambito                       : plan
documentos barridos          : 11
citas ruta[:linea] extraidas : 430    <-- DENOMINADOR
  resuelven contra el arbol  : 278
  ajenas a este repo         : 114    (otro mundo; no verificables aqui)
  NO resuelven               : 38
    TRANSCRIP (en bloque cod): 7   evidencia grabada, pasado
    ANOTADA  (marca en linea): 0   ya declara su caducidad
    EFIMERA  (nunca existio) : 7   sonda/vector/propuesta
    ACTA     (muere<=reporte): 0   el que escribia ya lo sabia
    RANCIA   (muere >reporte): 24   <-- DEUDA, debe ser 0

VEREDICTO: FAIL
exit=1
```

**24, no las 21 del encargo.** Las 3 de más están en `plan/BACKLOG.md`, y **2 de
ellas las introdujo la fila de este mismo WP** al citar `src/configEditor.ts` y
`src/statusManager.ts` para describir el defecto. El brief decía «1 en
`plan/BACKLOG.md`»; hoy son 3. Se hace constar porque es el mismo fenómeno que
V92 documentó en su §1.1: **describir una cita rota crea una cita rota.**

### 3.4 · El barrido, salida literal · DESPUÉS

```
ambito                       : plan
documentos barridos          : 11
citas ruta[:linea] extraidas : 573    <-- DENOMINADOR
  resuelven contra el arbol  : 396
  ajenas a este repo         : 118    (otro mundo; no verificables aqui)
  NO resuelven               : 59
    TRANSCRIP (en bloque cod): 7   evidencia grabada, pasado
    ANOTADA  (marca en linea): 42   ya declara su caducidad
    EFIMERA  (nunca existio) : 7   sonda/vector/propuesta
    ACTA     (muere<=reporte): 0   el que escribia ya lo sabia
    RANCIA   (muere >reporte): 3   <-- DEUDA, debe ser 0

--- RANCIAS SIN ANOTAR (anadir la marca ⛔ junto a la cita) ---
BACKLOG.md:112  src/configEditor.ts  [fichero inexistente]
BACKLOG.md:112  src/statusManager.ts  [fichero inexistente]
BACKLOG.md:162  tests/performance/serviceStartup.test.ts  [fichero inexistente]

VEREDICTO: FAIL
exit=1
```

**Atribución de las 3 que quedan — dicho, no disimulado:**

```
$ ... | grep '^[A-Za-z].*\.md:[0-9]' | sed 's/:.*//' | sort | uniq -c
      3 BACKLOG.md
```

> **`plan/CENSO-V12.md` aporta `RANCIA = 0`.** Las 3 restantes están **todas**
> en `plan/BACKLOG.md`, que `ALCANCE_DIFF` me prohíbe tocar y que el brief
> reserva expresamente («ésa no la toques, es mía»).

No puedo entregar `exit 0` sobre el ámbito completo sin escribir en un fichero
que tengo prohibido. Entrego lo que sí es demostrable y comprobable en un
comando: **cero rancias imputables a este WP y cero en el documento de su
alcance.** El `FAIL` que queda tiene dueño y tiene línea.

**Movimiento del denominador, 430 → 573 (+143), declarado:** son las citas de
las **76 anotaciones** y de la nueva **§0** —que cita mucho por naturaleza, como
le pasó a V92 con su propio reporte—. **Las 143 resuelven**: mis correcciones
entran al barrido como cualquier otra cita y ninguna añadió deuda. `ANOTADA`
pasa de 0 a **42**, que son las citas caducadas que ahora declaran su caducidad.

**Un detalle honesto sobre esas 143:** dos de ellas las introduje yo mismo, al
escribir en §0.4 «anotadas en las filas `src/configEditor.ts` y
`src/statusManager.ts`». El barrido las cazó **como rancias** en la corrida
siguiente, y hubo que marcarlas. Es la tercera vez en este WP que **nombrar el
defecto crea el defecto** —le pasó a V90, le pasó a V92, y me ha pasado a mí—,
y es la mejor prueba de que el instrumento hace su trabajo sobre quien lo usa.

---

## 4 · Las 69 filas: re-medidas o retiradas con acta

La tabla completa vive en `plan/CENSO-V12.md` §0.3 y §0.4, que es donde sirve.
Aquí, el resultado y el método.

**Método:** se abrió el árbol y se contó. **Ninguna cifra se copió del censo.**
`git ls-tree`, `git ls-files`, `wc -l`, `node -e` sobre `contributes`, y un BFS
de imports desde `src/extension.ts` con el mismo criterio que declara §5 del
censo.

| | Tabla A | Tabla B | total |
| - | ------- | ------- | ----- |
| filas censadas | 41 | 28 | **69** |
| **retiradas con acta** (poda ejecutada, la entrada ya no existe) | 18 | 5 | **23** |
| **re-medidas** (siguen vivas) | 23 | 23 | **46** |
| entradas de hoy **sin fila** en el censo | 2 (`CHANGELOG.md`, `sincronia/`) | 2 (`src/mcp/`, `src/webview/`) | **4** |

**Las 23 podas: ejecutadas las 23.** Sin excepción, comprobado ruta a ruta.

**Lo que la re-medición desmintió** — no son cifras que envejecen, son
afirmaciones que se dieron la vuelta:

| dato | censo | hoy | quién lo cambió |
| ---- | ----- | --- | --------------- |
| comandos del manifiesto | 115 en **5** prefijos | **99 en uno**, `aleph0.` | V15 |
| `contributes.chatParticipants` | 6 | **0** | V13 (DV-11) |
| `package.json` · `license` | `SEE LICENSE IN LICENSE.md` | **`GPL-3.0-or-later`** | invariante I-3 — **D7 y D19 cerrados** |
| `LICENSE.md` | licencia-broma con `[Año] [Nombre del Autor]` sin rellenar | **13 líneas**, puntero GPL + Animus Iocandi | ídem |
| `coverageThreshold` | 75/80/85/85 | **no existe**; el trinquete es `scripts/cobertura-trinquete.mjs` | V93 — **D9 superada** |
| `coverage/` trackeado-e-ignorado | 72 rutas | **0** | V13 — **D8 y D20 cerrados** |
| `.ts` de `src/` no alcanzables | 19 | **7** | V13 — **D4 consumida** |
| `src/extension.ts` | «**byte-idéntica** al import» | **ya no lo es** | ⚠️ **D3 desmentido** |
| `src/terminalManager.ts` | «lo usan `processManager` y `statusManager`» | `statusManager` **no existe desde `c164731`** | ⚠️ el arrastre que señalaba el brief |
| consumidores de `src/config` | 7 | **13** | crecimiento propio |
| `media/` | 23 ficheros | **19** | V14 |

Los dos últimos casos son los que el brief nombraba, y los dos están anotados en
sus filas de la Tabla B (`src/extension.ts` y `src/terminalManager.ts`) —
referenciadas **por contenido, no por línea**, por el motivo de §7.

---

## 5 · Lo que sigue vivo: tres hallazgos enrutados, ninguno tocado

`ALCANCE_DIFF` es cero código. Se señalan con nombre y ruta.

### 5.1 · D16 sigue vivo, y la cita rancia lo estaba tapando 🔴

El hallazgo más serio del WP, y **sólo aparece porque la clase B se buscó a
mano.** El censo marcó **D16** como falsedad silenciosa en
`src/core/mcpConfigurationManager.ts:58-65`. Esa coordenada **hoy resuelve** y
contiene código inocente: el barrido la da por buena, y un lector concluiría que
el defecto se corrigió.

**No se corrigió.** Está en `src/core/mcpConfigurationManager.ts:42-49`, intacto:

```js
// If no path in settings, look for sample-config.json in workspace
const defaultConfigPath = path.join(workspaceRoot, 'ArrakisTheater_OperaConfig.json');
if (fs.existsSync(defaultConfigPath)) {
    configPath = defaultConfigPath;
    this.logger.info(`Found sample-config.json at: ${configPath}`);
```

El comentario dice un fichero, el log **afirma** ese fichero, y se abre otro. Y
**agrava desde entonces**: el que se abre, `ArrakisTheater_OperaConfig.json`, lo
podó V13, así que hoy el log miente sobre un fichero que ya no existe en el
árbol. **Enrutado a `WP-V100`**, la ficha viva de la familia «falsedad
silenciosa» — el censo lo atribuía a `WP-V16`, que **no existe**, y enrutar ahí
lo habría dejado sin dueño: la misma clase de defecto que este WP destapa.

> Esto es la demostración empírica de por qué la clase B importa: **una cita
> rancia no sólo se equivoca, puede archivar un defecto vivo como resuelto.**

### 5.2 · `schemas/` tiene veredicto *re-contenido* y nadie lo re-contuvo ⚠️

Los 3 schemas del legado (`xplus1-config`, `socket-config`, `webrtc-ui-config`)
siguen en el árbol y siguen cableados en `contributes.jsonValidation` apuntando
a `./schemas/*.schema.json`. Es **la única fila *re-contenido* de la Tabla A que
quedó sin ejecutar** — las otras 6 están hechas. **Enrutado a:** quien planifique
la ola siguiente.

### 5.3 · Los dos `customEditors` sobrevivieron a la unificación de nombres ⚠️

V15 llevó los 99 comandos a `aleph0.`, pero los `viewType` siguen siendo
`alephscript.agentContentEditor` y `alephscript.agentConfigEditor`
(`package.json:1165` y `:1175`). El segundo selecciona por
`**/theatrical-content/configurations/agents/*.config.json`, una convención cuyo
directorio V13 podó. **Enrutado a:** el linaje de V15.

---

## 6 · Hallazgos sobre el instrumento

### E-98-1 · El barrido no ve las citas a ficheros de raíz **borrados**

Detallado en §1.1. `RAIZ` se construye con `readdirSync` sobre lo que existe
hoy, así que `sample-config.json` y `ArrakisTheater_OperaConfig.json` —podados—
no entran ni como cita ni como denominador. Es el simétrico del defecto nº 2 que
V92 censó. **No lo he arreglado**: el barrido no es mío, y modificarlo
invalidaría la comparación con su corrida. **Enrutado a:** el dueño de **E-4**,
junto con darle casa en `scripts/`.

### E-98-2 · La retro-referencia desnuda `(:NN)` es el peor formato de cita

Peor que `fichero:línea`, porque caduca igual **y es invisible al instrumento**.
34 de 36 rotas en un solo documento (§3.2). Merece una línea en
`plan/PRACTICAS.md` §5-§7, junto a la tabla «de peor a mejor» de V92 — que hoy
empieza en «coordenada sola» y debería empezar un escalón más abajo.
**No he tocado `plan/PRACTICAS.md`** (fuera de `ALCANCE_DIFF`). **Enrutado a:**
el dueño de **E-5**.

### E-98-3 · «Coordenada + hecho» no basta, y hay contraejemplo

La tabla de V92 §5 propone «coordenada + hecho» como forma intermedia aceptable.
`package.json:7` es el contraejemplo (§3.1): el hecho citado era **la clave**, la
clave sigue en su línea, y lo falso es **el valor**. Sólo un gate lo coge.
**Enrutado a:** el mismo dueño que E-98-2.

### E-98-4 · `plan/BACKLOG.md` mantiene 3 rancias, 2 nacidas al describir este WP

§3.3. Prohibido tocarlo. **Enrutado a:** el orquestador.

---

## 7 · La tabla de anotaciones, íntegra

76 anotaciones, todas por **inserción**. Se listan por línea para que la
corrección sea auditable y no haya que fiarse del diff.

> ⚠️ **Los números de línea de esta sección son los de la versión PRE-V98** del
> censo — la que vio el script de anotación, y contra la que se comprueban:
> `git show HEAD:plan/CENSO-V12.md`. **En el documento de hoy no valen**, porque
> la §0 que se añadió después desplazó todo el cuerpo unas 240 líneas.
>
> Se dejan así **a propósito y declarado**, en vez de reescribirlos a las
> coordenadas de hoy: son la clave de auditoría de una edición concreta sobre un
> estado concreto, es decir un **acta**, y un acta se lee contra su objeto. Si
> se «actualizaran» a las líneas de hoy, volverían a caducar en la siguiente
> edición — que es exactamente el defecto que este WP cierra. Para navegar el
> documento vigente, úsense los nombres de fila; para auditar esta edición,
> estos números contra `HEAD`.

**Filas Tabla A · poda ejecutada (18):** `:107` `.config` · `:108`
`.esbuild.config.js` · `:116` `ArrakisTheater_OperaConfig.json` · `:117`
`FEATURE_CONFIGS` · `:118` `INSTALL.md` · `:120` `PLANIFICACION` · `:121`
`README-LEGACY-EXTENSION.md` · `:123` `build-and-install.sh` · `:124` `coverage`
· `:125` `demo` · `:130` `nvm-exec.sh` · `:133` `pics` · `:135` `prompts` ·
`:136` `sample-config.json` · `:139` `setup-vscode-path.sh` · `:141`
`test-extension.js` · `:143` `theatrical-content` · `:146` `vibecoding`

**Filas Tabla A · supervivientes con cifra o cita caducada (8):** `:106`
`.claude` · `:119` `LICENSE.md` · `:122` `README.md` · `:127` `fixtures` ·
`:129` `media` · `:132` `package.json` · `:134` `plan` · `:142` `tests`

**Filas Tabla B · poda ejecutada (5):** `:167` `configEditor.ts` · `:168`
`copilotLogs` · `:172` `examples` · `:178` `mcpChatParticipant.ts` · `:186`
`statusManager.ts`

**Filas Tabla B · supervivientes re-medidas (16):** `:165` · `:166` · `:169` ·
`:173` · `:175` · `:176` · `:177` · `:179` · `:180` · `:181` · `:183` · `:185` ·
`:187` · `:188` · `:190` · `:192`

**§5, §6 y §8 · texto corrido (29):** `:241` · `:284` · `:308` · `:320` ·
`:332` · `:342` · `:348` · `:415` · `:455` · `:457` · `:463` · `:533` · `:547` ·
`:548` · `:563` · `:598` · `:600` · `:601` · `:602` · `:603` · `:604` · `:605` ·
`:606` · `:609` · `:621` · `:629` · `:634` · `:635` · `:640`

18 + 8 + 5 + 16 + 29 = **76**.

Forma de la marca, sin `**` anidada y sin `|` (las dos lecciones de V92 §2.1):

```
 ⛔ *(poda EJECUTADA por V13 (`c164731`); `src/configEditor.ts` NO EXISTE hoy.
     Las 423 lineas se leen en pasado)*
```

En filas de tabla la marca se inserta **antes de la barra final** — si se
apendiza al final de la línea, el texto cae fuera de la tabla. Comprobado que
ninguna fila cambió su número de `|`.

---

## 8 · Auto-verificación

| # | criterio (CA del brief) | estado | evidencia |
| - | ----------------------- | ------ | --------- |
| 1 | cero afirmaciones en presente sobre ficheros inexistentes | ✅ | doble cobertura: **marco temporal global** en la cabecera («todo lo que sigue se lee EN PASADO») **y** las 23 filas de entradas borradas anotadas una a una (§7). El barrido no encuentra ninguna cita sin anotar en el documento |
| 2 | cada fila re-medida o retirada con acta | ✅ | **69/69**: 23 retiradas con acta (poda verificada con `test -e`), 46 re-medidas hoy abriendo el árbol. Tablas en `plan/CENSO-V12.md` §0.3-§0.4; **ninguna cifra copiada** (§4) |
| 3 | barrido de V92 con `AMBITO=plan` en verde, salida literal, con denominador | ⚠️ **verde en mi alcance, FAIL en el ámbito** | §3.3 y §3.4, salidas literales · denominador **430 → 573** · `plan/CENSO-V12.md` = **RANCIA 0**; las 3 restantes son **todas** de `plan/BACKLOG.md`, con atribución impresa. **Declarado, no disimulado** |
| 4 | decidir y declarar qué es el documento | ✅ | **ACTA CERRADA**, con la razón medida en §2 y la línea al principio del documento. Y la consecuencia dicha: **no hay censo vigente** (§2.1) |
| 5 | la clase que el barrido no caza: cuántas sobre cuántas | ✅ | **24 falsas sobre 33 miradas** — el universo completo, no una muestra (§3.1). Y una tercera clase que V92 no había nombrado: **34 de 36** (§3.2) |
| — | alcance del diff | ✅ | `git status --porcelain` → sólo ` M plan/CENSO-V12.md`, más este reporte. Cero `src/`, `tests/`, `scripts/`, `plan/BACKLOG.md`, `plan/PRACTICAS.md` |
| — | sin `git push`, sin `git stash`, sin `npx` | ✅ | sólo `git` de lectura, `node` y `sed`. El barrido y los dos scripts auxiliares viven fuera del árbol |

**Lo que este WP NO garantiza**, dicho antes de que lo pregunten:

- Que las **94** citas que resuelven **sin coordenada** digan la verdad. La
  clase B sólo es verificable donde hay línea que contrastar; una cita a `ruta`
  pelada afirma existencia, y la existencia sí está comprobada.
- Que no haya clase B en los **otros 10** documentos de `plan/`. Aquí se ha
  agotado el universo de **este** documento, que es el del encargo. El método
  está en §3.1 y es repetible.
- Que `plan/BACKLOG.md` quede limpio: no puedo tocarlo (§3.3, **E-98-4**).
