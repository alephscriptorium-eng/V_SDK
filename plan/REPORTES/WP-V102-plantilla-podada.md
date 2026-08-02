# WP-V102 · No era una plantilla muerta: el panel buscaba en el workspace del usuario cosas que viajan en el paquete

**Worker V** · rama `wp/v102-plantilla-podada` · árbol `C:/S_LAB/wt/v-v102`
· base `12be68e` · 2026-08-02

---

## 0 · Identidad, antes de leer una línea de producto

```
$ WORLD_ROOT=C:/S_LAB/wt/v-v102 CANONICAL_WORLD_ROOT=C:/S_LAB/wt/v-v102 \
  READ_ONLY_ROOTS='["C:/S_LAB/g-sdk","C:/S_LAB/a-sdk","C:/S_LAB/e-sdk"]' \
  DOWNSTREAM_PATTERNS='[]' \
  node C:/S_LAB/skills-library/skills/vigilancia/scripts/verificar-identidad-raiz.mjs

identidad-raiz: PASS
world-real:    c:/s_lab/wt/v-v102
git-toplevel:  c:/s_lab/wt/v-v102
```

**Herramientas declaradas.** El worktree no traía `node_modules` (git no copia
lo ignorado): `npm ci` con `npm_config_logs_dir` dentro del árbol, y el
directorio de logs borrado al terminar. A partir de ahí jest **siempre** por
`./node_modules/.bin/jest`, y con `--coverage=false` salvo las tres corridas de
medición del suelo (§6). **No se ha empujado nada.**

**Frontera respetada.** `package.json` **no se toca** — es de WP-V101. Lo que
mi análisis necesita de ahí va declarado en §8 para que el orquestador lo cruce.

---

## 1 · La medición, que contesta la pregunta del encargo

El encargo pedía decidir, midiendo, si el defecto es «una plantilla muerta de
cuatro» o «un panel que resuelve activos del paquete contra el workspace».

**Es lo segundo, y es peor de lo que decía la ficha.** Sonda ejecutable sobre
el árbol en `HEAD`, sin tocar nada: se construye el provider, se le monta un
workspace **de verdad en disco** y se llama a `_getConfigGroups()`.

| grupo | workspace = **este repositorio** | workspace = **proyecto ajeno** |
| --- | --- | --- |
| EXTENSION SETTINGS | 8 | 8 |
| **WEBVIEW CONFIGURATIONS** | **3** — los 3 `schemas/*.schema.json` | **0** |
| **SCHEMA DEFINITIONS** | **3** — *los mismos 3, misma ruta absoluta* | **0** |
| **THEATRICAL CONTENT** | **0** | **0** |
| DEVELOPMENT CONFIGS | 6 | 2 |

Volcado literal de la corrida, caso «repositorio»:

```
[WEBVIEW CONFIGURATIONS] n=3
    schemas/socket-config.schema.json    -> C:\S_LAB\wt\v-v102\schemas\socket-config.schema.json
    schemas/webrtc-ui-config.schema.json -> C:\S_LAB\wt\v-v102\schemas\webrtc-ui-config.schema.json
    schemas/xplus1-config.schema.json    -> C:\S_LAB\wt\v-v102\schemas\xplus1-config.schema.json
[SCHEMA DEFINITIONS] n=3
    socket-config.schema.json            -> C:\S_LAB\wt\v-v102\schemas\socket-config.schema.json
    webrtc-ui-config.schema.json         -> C:\S_LAB\wt\v-v102\schemas\webrtc-ui-config.schema.json
    xplus1-config.schema.json            -> C:\S_LAB\wt\v-v102\schemas\xplus1-config.schema.json
```

**Tres hechos que ninguna ficha decía, y que cambian el veredicto:**

1. **Los tres schemas viven en el PAQUETE, no en el workspace.** `.vscodeignore`
   no contiene la palabra `schemas` —medido, cero coincidencias—, así que
   `schemas/` viaja en el `.vsix`; y `contributes.jsonValidation`
   (`package.json:966`, rutas en `:969`, `:973`, `:977`) los cablea con
   `./schemas/*`, **relativo al paquete**. El panel los buscaba bajo
   `workspaceFolders[0]`.

2. **Para cualquier usuario cuyo workspace no sea este repositorio, DOS de los
   cinco grupos salían vacíos**, no sólo una entrada. El panel enseñaba los
   schemas **únicamente a quien desarrolla la extensión**.

3. **`_getWebviewConfigs()` no aportó jamás un elemento propio.** En el único
   caso en que devolvía algo, sus 3 resultados eran **los mismos ficheros, con
   la misma ruta absoluta**, que ya listaba `_getSchemaConfigs()`. El cuarto era
   el fantasma. O sea: **un fantasma y tres duplicados**, nunca otra cosa.

Y un cuarto, que la ficha no pedía y sale de la misma sonda:

4. **`THEATRICAL CONTENT` daba 0 incluso aquí.** `theatrical-content/` lo podó
   WP-V13 en el mismísimo `f615434`, y la tercera entrada —`src/theatrical` con
   patrón `*.ts`— tampoco produce nada: `readdirSync` **no es recursiva** y ese
   directorio sólo contiene `core/`.

   ```
   $ node -e "console.log(require('fs').readdirSync('src/theatrical'))"
   [ 'core' ]                      → filtrado .ts = []
   ```

**Conclusión escrita, como se pedía**: el defecto no es una plantilla muerta.
Es que **el panel no distinguía sus propios activos de los del usuario**, y la
plantilla podada era sólo el síntoma que se veía.

---

## 2 · Corrección al BRIEF, con dato

El BRIEF dice: *«el censo cita `HackerConfigPanelProvider.ts:291-293` para los
directorios de agentes; hoy son `:297-298`, y son **dos entradas, no tres**»*.

**Son tres, y la deriva es un +6 uniforme como todo lo demás de ese fichero.**
Medido sobre `HEAD` (361 líneas), con la cita del censo al lado:

| lo que cita el censo | en `HEAD` | deriva |
| --- | --- | --- |
| `:233` — `sample-config.json` (`CENSO-V12.md:383`) | **`:239`** | +6 |
| `:234` — `schemas/socket-config.schema.json` (`:384`, `:854`) | **`:240`** | +6 |
| `:291` — `theatrical-content/configurations` (`:390`) | **`:297`** | +6 |
| `:293` — `src/theatrical`, `*.ts` (`:390`) | **`:299`** | +6 |

Las tres entradas del array estaban en `:297`, `:298` y `:299`. Lo que sí es
cierto —y probablemente es lo que el BRIEF quería decir— es que **sólo dos de
las tres apuntan a `theatrical-content/`**; la tercera apunta a `src/theatrical`,
que es otra cosa y con otro problema (§1.4). La coordenada del BRIEF para el
defecto principal, `:239`, es **exacta**. La de `mcpTypes.ts:15`, **exacta y sin
deriva**.

### 2.1 · Una tercera cita de clase B dentro del censo, que nadie había anotado

`plan/CENSO-V12.md`, D15, dice literalmente:

> «El mismo patrón en `_getSchemaConfigs` y en `_getTheatricalConfigs`
> (`:286-289`, `:299`).»

Aplicando la **misma deriva +6** que las cuatro coordenadas de arriba, `:286-289`
cae en `HEAD:292-295` y `:299` en `HEAD:305`. Medido:

```
HEAD:290  private _getTheatricalConfigs(): ConfigItem[] {
HEAD:292      const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
HEAD:305      const files = fs.readdirSync(dirPath).filter(file => {
```

`_getSchemaConfigs` ocupaba `HEAD:263-288`. **Las dos coordenadas caen dentro de
`_getTheatricalConfigs`**: el censo ofrece dos citas para dos métodos y las dos
son del segundo. Es la misma clase B —cita que resuelve y miente— y vive, otra
vez, **en el documento que se cerró como acta**.

⛔ Las coordenadas de esta sección son del árbol **anterior** a este WP; hoy el
fichero tiene 417 líneas y ninguna de ellas significa lo mismo.

---

## 3 · La decisión sobre la plantilla, con su razón

**No debe haber plantilla, y el producto no debe ofrecer ninguna.** El BRIEF
pedía elegir; elijo esto y lo argumento en cuatro datos, no en preferencia:

1. **No era elegir entre dos opciones sino entre dos fantasmas**, como ya midió
   WP-V100: `f615434` podó `sample-config.json` **y**
   `ArrakisTheater_OperaConfig.json` en el mismo commit. Ninguno existe.

2. **`sample-config.json` nunca describió a este producto.** El censo lo fija:
   *«plantilla de config del producto ajeno, intacta desde el import»*
   (`CENSO-V12.md:383`). Reconstruirla sería importar de nuevo una convención
   ajena que ya se había decidido retirar.

3. **La superficie de configuración de este producto ya está decidida, y no es
   un fichero JSON.** WP-V23 la cerró: espacio de nombres único `aleph0.*`, 26
   claves a 18, aceptado en `12de442`. Ofrecer una plantilla JSON abriría una
   **segunda** superficie de configuración compitiendo con la que se acaba de
   cerrar. Y el panel ya expone la verdadera: el grupo `EXTENSION SETTINGS`.

4. **El fichero que el producto sí carga tiene dueño abierto.**
   `McpConfigurationManager` sigue buscando `OPERA_CONFIG_FILENAME` en el
   workspace y adoptándolo sin preguntar; eso es **WP-V32** (hallazgo H-11 de
   V23). Construir aquí una plantilla se metería en su ficha.

**Consecuencia**: la entrada se **retira**, no se re-apunta. Y para que la
decisión no dependa de que alguien la recuerde, se retira también **el mecanismo
que la hizo posible** (§4).

---

## 4 · El cambio, y por qué así

### 4.1 · La regla que queda escrita

> **Nombrar un fichero es una promesa; enumerar un directorio es una pregunta.**

Un nombre de fichero codificado promete algo que el árbol del producto tiene que
poder producir. Un directorio enumerado no promete ningún fichero concreto: su
ausencia es **descubrimiento**, no mentira. De ahí se sigue la distinción que
este WP defiende y que el test impone:

> **Filtrar por existencia el árbol del USUARIO es descubrimiento; filtrar por
> existencia los activos del PROPIO PRODUCTO es tapar un fallo.**

Ésa es la línea entre `theatrical-content/` —del usuario, puede faltar sin
mentir— y «sample-config.json» —que el producto prometía y no tenía.

### 4.2 · Qué se hizo, en cuatro movimientos

1. **`_getWebviewConfigs()` se retira entera**, con su grupo. Medido en §1: un
   fantasma y tres duplicados; nunca aportó un elemento propio.

   **No desaparece ni un elemento de la interfaz.** Con el repositorio abierto,
   la unión de lo ofrecido es la misma (los 3 schemas, **una vez** en lugar de
   dos). Con un workspace ajeno, se **añaden** 3 que antes no se veían nunca.

2. **`_getSchemaConfigs()` (`:281`) enumera los DOS orígenes** —el paquete vía
   `_extensionUri` y el workspace del usuario—, de-duplicando por ruta resuelta,
   y **sin un solo nombre de fichero codificado**. Aquí está el argumento de
   WP-V100 aplicado: *re-sincronizar la lista a mano deja intacto el mecanismo
   que la desincronizó*. Con enumeración de directorio, **un nombre no puede
   quedarse rancio porque no hay ningún nombre**. La falsedad no se corrige: se
   vuelve inexpresable.

   Y cuando el paquete **no** trae `schemas/`, no se filtra en silencio: se avisa
   (`:295`), porque eso sería un defecto de empaquetado.

3. **El origen pasa a ser dato, no suposición.** `export type OrigenActivo`
   (`:52`) y `_raizDe()` (`:266`). Todo item de tipo `config-file` declara de
   dónde salió, y el test lo comprueba **ejecutando**.

4. **`_getTheatricalConfigs()` (`:340`) pierde la entrada `src/theatrical`**,
   por tres razones medidas: producía cero ficheros incluso aquí (§1.4), `src/**`
   está en `.vscodeignore` así que ese directorio **no viaja en el paquete** —
   ningún usuario instalado puede tenerlo—, y ofrecía **código fuente `.ts`** bajo
   el rótulo «configuración». Las dos entradas `theatrical-content/*`
   **se quedan** resueltas contra el workspace, y eso es correcto: son convención
   del usuario y siguen cableadas en `contributes.customEditors`.

5. **`_getDevConfigs()` (`:384`) no se toca** salvo para declarar su origen.
   `package.json`, `tsconfig.json`, `jest.config.js`, `.vscode/*.json` son
   convenciones de terceros sobre el árbol del usuario: nombrarlas es legítimo, y
   el test comprueba —ejecutando— que **el árbol del producto las produce todas**.

### 4.3 · `src/mcpTypes.ts`

Decía `// Configuration interfaces to match sample-config.json structure`. Falso
por partida doble: nadie busca ese nombre (D16, cerrado en WP-V100) y el fichero
no existe. Medido: las interfaces **están vivas** —`mcpConfigurationManager.ts`,
`mcpServerManager.ts`, `mcpWebViewManager.ts` las importan— y describen lo que
`JSON.parse(configContent) as AlephScriptConfiguration` produce.

Se aplica la convención de WP-V100 **en su forma fuerte**: el comentario nombra
la **constante** `OPERA_CONFIG_FILENAME` (`mcpTypes.ts:21`, `:27`), no su valor.
El nombre muerto queda entre «comillas angulares». Así esta frase **no puede**
volver a divergir del fichero que se abre.

Nota deliberada: **no** escribí `ArrakisTheater_OperaConfig.json` entre «…».
Sería aplicar mal la convención — ese nombre está **vivo**, y un nombre vivo va
con la constante.

---

## 5 · El test: qué vigila, y por qué EJECUTA

`tests/unit/views/hackerConfigPanelActivos.test.ts` — **fichero nuevo**. Antes
de él ningún test nombraba este panel: estaba al **10,81 %** de sentencias, con
las líneas 82-359 —todo lo que compone los grupos— sin ejecutar jamás. Por eso
el defecto pudo vivir a la vista.

No lee el fuente del panel. Construye el provider, le monta workspaces **reales
en disco** (este repositorio y un `mkdtemp` recién creado con `package.json` y
`tsconfig.json`), llama a `_getConfigGroups()` y captura **las rutas que llegan
a `fs.existsSync`/`readdirSync`** más los `filePath` devueltos.

| § | qué fija |
| --- | --- |
| §1 | con workspace ajeno, los activos del **paquete** se ofrecen; ninguna sonda contra la raíz del paquete falla; todo item de fichero declara su origen |
| §2 | **todo `filePath` devuelto existe en disco**, en los dos workspaces |
| §3 | con el workspace en el árbol del producto, **toda sonda con extensión resuelve** — si este árbol no puede producirlo, ninguno puede — y el panel no nombra ninguno de los dos ficheros podados en `f615434` |
| §4 | ningún `filePath` se ofrece dos veces |
| §5 | `mcpTypes.ts`: ningún nombre `.json` vivo, y el fichero se cita por su **constante** |

Detalle técnico heredado de V100 y confirmado aquí: `fs.existsSync` **no se
puede espiar con `jest.spyOn`** en node ≥ 20 («Cannot redefine property»). Se
sustituye el módulo conservando la implementación real, para que las sondas se
capturen **sin falsear el disco**: todo lo que el panel comprueba se comprueba
de verdad.

---

## 6 · Los negativos, verificados DESACTIVANDO su guardián

`scripts/probes/v102-activos-del-panel.mjs` — se entrega, para que sea
reproducible. **Seis mutaciones, cada una revertida después**, con control
previo y control final.

**Las dos precauciones del script, y por qué están:**

1. **Las rutas se derivan de `import.meta.url`, jamás de `process.cwd()` ni de
   un argumento POSIX.** Es la trampa que ya se pisó en WP-V100: `/c/S_LAB/…`
   que Windows resolvía como `C:\c\S_LAB\…`, mutaciones que no se aplicaban y
   cuatro casos «verdes» que sólo decían que no se había tocado nada.
2. **Si el patrón no está, aborta con código 3.** Y aquí *sirvió*: la primera
   corrida abortó con 3 porque los fuentes de este repositorio están en **CRLF**
   y los patrones estaban escritos con `\n`. Un script sin esa guarda habría
   dicho «ninguna mutación falla» y lo habría vendido como robustez. El script
   traduce ahora los patrones al fin de línea real del fichero.

Además, **imprime la línea mutada antes de correr jest** — es la única prueba de
que la mutación mordió.

```
############ CONTROL PREVIO · el arbol sin mutar debe estar VERDE ############
  Tests:       10 passed, 10 total

############ M1 · vuelve la plantilla fantasma «sample-config.json» tal cual estaba ############
  mutado OK -> L390: const devFiles = [
  Tests:       2 failed, 8 passed, 10 total
    ● §3 › ninguna sonda a un nombre de fichero queda sin resolver
    ● §3 › el panel no nombra ningún fichero podado en `f615434`

############ M2 · los schemas del PAQUETE vuelven a resolverse contra el WORKSPACE ############
  mutado OK -> L267: return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  Tests:       1 failed, 9 passed, 10 total
    ● §1 › con un workspace ajeno y vacío, los schemas del paquete SE OFRECEN

############ M3 · se retira la de-duplicacion: los schemas se ofrecen dos veces ############
  mutado OK -> L306: if (false) { continue; }
  Tests:       1 failed, 9 passed, 10 total
    ● §4 › con el repositorio abierto como workspace, paquete y workspace no se duplican

############ M4 · el paquete declara un activo que no envia ############
  mutado OK -> L289: const schemaDir = path.join(raiz, 'schemas');
  Tests:       2 failed, 8 passed, 10 total
    ● §1 › ninguna sonda contra la raíz del PAQUETE falla
    ● §3 › ninguna sonda a un nombre de fichero queda sin resolver

############ M5 · mcpTypes.ts vuelve a decir que casan con el fichero podado ############
  mutado OK -> L26: // Configuration interfaces to match sample-config.json structure
  Tests:       1 failed, 9 passed, 10 total
    ● §5 › ningún nombre de fichero .json vivo (los muertos van entre «comillas angulares»)

############ M6 · los items del paquete dejan de declarar su origen ############
  mutado OK -> L317: category: 'schema',
  Tests:       2 failed, 8 passed, 10 total
    ● §1 › con un workspace ajeno y vacío, los schemas del paquete SE OFRECEN
    ● §1 › todo item de fichero declara su origen

############ CONTROL FINAL · restaurado, debe volver a VERDE ############
  Tests:       10 passed, 10 total
exit=0
```

**Las seis enrojecen, y ninguna es un «saltó otro guardián»**: cada fallo lo
firma la sección que dice vigilar ese defecto. **M1 y M2 son las que importan**:
M1 es el estado exacto del árbol antes de este WP —la plantilla fantasma tal
cual—, y M2 es el defecto de fondo que la ficha no nombraba.

---

## 7 · El suelo de cobertura, movido y firmado

⚠️ Este WP mueve el trinquete. **Tres corridas, misma máquina, suite entera.**
La primera existe para probar que **el suelo declarado reproduce aquí antes de
moverlo** — sin eso el delta no significa nada.

| corrida | fuente | test nuevo | statements / branches / functions / lines |
| --- | --- | --- | --- |
| **A** | `HEAD` | no | **1844 / 558 / 357 / 1808** ← reproduce el suelo exacto |
| **B** | este WP | no | **1844 / 558 / 357 / 1808** |
| **C** | este WP | sí | **1888 / 563 / 367 / 1850** (entrega) |

```
$ node scripts/cobertura-trinquete.mjs          # corrida A, antes de tocar nada
  statements 1844 (suelo 1844) · branches 558 (558) · functions 357 (357) · lines 1808 (1808)
  cobertura: censo COMPLETO y unidades cubiertas EN EL SUELO declarado
  exit=0
```

**La corrida B da un resultado que conviene leer: es IDÉNTICA a A.** El cambio
de producto **no aporta ni una unidad cubierta por su cuenta**, porque todo lo
que toca vivía en código que no ejercitaba nadie. Los **+44 / +5 / +10 / +42**
son, íntegros, código de producto que el test nuevo ejecuta por primera vez.
`HackerConfigPanelProvider.ts` pasa de **10,81 % a 52,83 %** de sentencias.

**Y un dato que justifica por qué este instrumento no usa porcentajes**: entre A
y B, con **las mismas 1844 unidades cubiertas**, el porcentaje de sentencias
subió de **30,29 % a 30,32 %**. No se cubrió nada nuevo: se **borró código
muerto** y el denominador encogió (6086 → 6081). Un umbral porcentual habría
leído una poda como una mejora de cobertura.

**El trinquete falla en las dos direcciones, verificado hoy, no citado:**

```
# subida sin firmar (estado real tras la corrida C, antes de firmar)
TRINQUETE · la cobertura SUBIÓ y el suelo no lo recoge:
    statements: 1888 cubiertas > suelo 1844+0  (sobran 44)
exit=1

# regresión (suelo falseado a 1900, revertido acto seguido)
TRINQUETE · la cobertura BAJÓ:
    statements: 1888 cubiertas < suelo 1900  (faltan 12)
exit=1

# firmado
cobertura: censo COMPLETO y unidades cubiertas EN EL SUELO declarado
exit=0
```

**No es un ablandamiento: sube en las cuatro métricas.** Con 1888 declarado, el
informe de ayer (1844) se rechaza por regresión. **El censo no se tocó**: los
mismos 9 ausentes (6 TIPOS + 3 NO-COMPILA), 96 ficheros en `src` · 87 en el
mapa. `src/mcpTypes.ts` sigue en TIPOS y con razón: sólo interfaces y prosa.

---

## 8 · Lo que necesito de `package.json` y no toco — para WP-V101

Ninguna de estas tres es un cambio que yo pida: son **hechos medidos** de los
que depende mi razonamiento, y el orquestador debería cruzarlos con V101.

1. **`contributes.jsonValidation` (`package.json:966`, rutas `:969`, `:973`,
   `:977`) es la razón por la que `schemas/` es un activo del paquete.** Si V101
   cambia esas rutas o mueve el directorio, mi `_getSchemaConfigs()` deja de
   encontrarlo — y **el test enrojece en §1**, que es lo que debe pasar.

2. **`.vscodeignore` conserva entradas de ficheros que WP-V13 ya podó**:
   `sample-config.json`, `ArrakisTheater_OperaConfig.json`, `theatrical-content/**`,
   `demo/**`, `prompts/**`, `FEATURE_CONFIGS/**`, `pics/**`, `vibecoding/**`,
   `build-and-install.sh`, `nvm-exec.sh`, `setup-vscode-path.sh`,
   `test-extension.js`, `.esbuild.config.js`. **Son inertes** —ignorar lo que no
   existe no rompe nada—, pero es la misma familia de residuo. No lo toco: el
   BRIEF me da el panel, no el empaquetado.

3. **`contributes.customEditors` (`package.json:1108`)** sigue cableando la
   convención `theatrical-content/`, y es lo que justifica que yo **mantenga**
   esas dos entradas resueltas contra el workspace. Si V101 la retira, mi
   `_getTheatricalConfigs()` se queda sin razón de ser y hay que retirarlo
   también. **Queda enrutado, no resuelto.**

---

## 9 · Cero regresión

```
$ ./node_modules/.bin/jest --coverage
Test Suites: 16 passed, 16 total
Tests:       1 skipped, 506 passed, 507 total
```

Antes: 15 suites / 497 tests (496 pass, 1 skip). Después: **16 / 507** (506
pass, 1 skip). **+1 suite, +10 tests, 0 fallos, el mismo skip de siempre.**

- **`tsc -p tsconfig.json --noEmit`**: **0 errores en los ficheros tocados**. Los
  8 que salen son los preexistentes y ya declarados (4× TS1479 de `@zeus/*`, 4×
  TS2353 del censo NO-COMPILA).
- **`npm run lint`**: **0 errores**, 192 avisos — la línea base. Sobre mis dos
  ficheros: 3 avisos, **los tres preexistentes** (`value?: any`,
  `handleMessage(message: any)`, `details?: any`). Ninguno nuevo.
- **`npm run compile`** (esbuild): `dist/extension.js` 1.3 mb, sin novedad.

---

## 10 · Los límites, declarados

1. **El `.vsix` no se construyó.** Que `schemas/` viaja en el paquete está
   medido por **dos vías independientes** —`.vscodeignore` no lo excluye, y
   `contributes.jsonValidation` lo necesita con ruta relativa al paquete—, pero
   **no empaqueté y abrí el `.vsix` para verlo dentro**. Si alguien quiere el
   negativo cerrado del todo, ése es el paso que falta.

2. **`_extensionUri` se comprueba en desarrollo, no instalado.** En este árbol,
   raíz del paquete y raíz del repositorio **coinciden**. El test monta un
   workspace ajeno para separar las dos rutas, y ahí la distinción sí se ejerce;
   pero no he corrido la extensión instalada de verdad, donde `_extensionUri`
   apunta a `~/.vscode/extensions/…`. **El arnés `tests/exthost` existe y no lo
   usé.**

3. **La convención «…» sigue siendo débil, y lo declaro como lo declaró V100**:
   alguien puede silenciar §5 envolviendo entre comillas angulares un nombre vivo
   equivocado. Lo que lo tapa es §1-§4, que no leen prosa: ejecutan. **La
   convención protege la prosa; la ejecución protege la conducta.**

4. **§3 clasifica sonda-fichero vs sonda-directorio por `path.extname()`.** Es
   una heurística del lado del test —deliberadamente, para no meter un gancho de
   test en el código de producto— y **fallaría con un directorio con punto en el
   nombre** o un fichero sin extensión. Hoy no hay ninguno de los dos en este
   panel; si aparece, la regla hay que reforzarla.

5. **`_getSchemaConfigs()` de-duplica por ruta resuelta exacta.** Si el paquete y
   el workspace fuesen el mismo directorio alcanzado por rutas distintas —un
   symlink, un `subst`— saldrían duplicados. No lo he probado.

6. **`theatrical-content/` sigue siendo una convención sin dueño resuelto.** La
   mantengo porque `contributes.customEditors` la cablea (§8.3). Si esa
   decisión cae, esto cae con ella. **Enrutado, no cerrado.**

7. **`scripts/citas-rancias.mjs` sale FAIL con 4 rancias, y NO son mías.** Son
   `WP-V15-espacios-nombres.md:259`, `WP-V90-jest-determinista.md:712` y
   `WP-V92-citas-rancias.md:457,556`, todas citando `package.json` por encima de
   sus 1198 líneas actuales. **Rojo preexistente**: no he tocado ni un reporte ni
   el manifiesto. Lo dejo dicho porque un rojo heredado que nadie nombra es
   exactamente cómo se cuela el siguiente.

8. **Suelo medido en una sola plataforma** (Windows 11 · node v22.21.1 · jest
   29.7.0), y con un `npm ci` de esta máquina que el BRIEF avisa que puede estar
   incompleto. La suite salió íntegra en verde, así que no reporto ningún rojo
   local; pero **si CI discrepa en el suelo, el número de este reporte no es el
   árbitro** — precedente de WP-V96.
