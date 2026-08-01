# WP-V48 · P2 — los cinco rojos deterministas de `managerFactory.test.ts`, cerrados

| dato | valor |
| ---- | ----- |
| Carril | **V** · Aleph-0 (ℵ₀) |
| Encargo | `plan/BACKLOG.md:104` |
| Rama | `wp/v48-cinco-rojos` · base `629d502` |
| Obra | `0af368a` (primera entrega) · **segunda vuelta tras devolución** (sólo prosa: cero líneas de código cambiadas) |
| Árbol de medida | `C:/S_LAB/wt/v-v48` · Windows 11 · 12 CPUs |
| Herramienta | node v22.21.1 · jest 29.7.0 · ts-jest 29.2.5 |
| Fecha de todas las medidas | **2026-08-01** |
| Ficheros tocados | `tests/integration/managerFactory.test.ts` · `scripts/rojos-jest.baseline.txt` · este reporte · fila V48 del BACKLOG |
| Ficheros **no** tocados | `tests/mocks/vscode.mock.js` · `src/**` · `jest.config.js` · `package.json` |

---

## 0 · Qué es de fiar en este reporte

Todo lo marcado **MEDIDO** se ejecutó en **este** árbol y su salida está pegada.
Las citas `fichero:línea` se comprobaron abriendo el fichero, una a una.

Dos números que iban a entrar como **CITA** se volvieron a medir aquí para no citarlos de
memoria: la cobertura del árbol base (§5.3) y el conjunto de rojos de partida (§1).
Ambos reproducen exactamente lo que declaraba `scripts/rojos-jest.baseline.txt`.

### 0.bis · La devolución: cayeron dos frases, ninguna línea de código

La primera entrega (`0af368a`) pasó la contrarrevisión en **todo lo sustantivo** — el arreglo, la
vía elegida, el radio de explosión, la contrafactual del `size = 8`, la línea base y los ocho
números de cobertura. **Cayeron dos afirmaciones, las dos de prosa, y las dos son la misma:**

| # | qué afirmé | estado |
| - | ---------- | ------ |
| **B1** | «los cinco tests ahora **recorren de verdad** `TerminalManager`…» — atribuí la subida de cobertura al fichero que da nombre a la CA | **FALSO, medido**: `terminalManager.ts` sale **bit a bit idéntico**. §5.3.bis |
| **B2** | una tabla de «qué recorre cada uno» que describía la cadena completa | **describía el comportamiento AISLADO** presentándolo como el de la corrida medida: en la corrida canónica se construye **un solo `TerminalManager`**. §4.1 |

Consecuencia, aceptada: **la CA «cubren ciclo de vida de terminales» NO la cierra este WP** (§8),
y la fila que sí lo haría va propuesta en §10.

**Lo que más pesa no es el error, sino dónde acabó escrito**: B1 estaba en
`scripts/rojos-jest.baseline.txt`, el artefacto compartido que el próximo WP lee como estado
declarado del mundo. Un WP que existe en parte para desmontar una nota rancia sembró una nota
falsa en el sitio de máxima propagación. El registro de frases cambiadas está en **§11** y la
lección, que es nueva para este swarm, en **§11.1**.

---

## 1 · La causa: verificada, y era la que decía el reencuadre

El brief me daba la causa ya averiguada y me pedía verificarla en vez de redescubrirla.
**Verificada, y es exacta.** MEDIDO, corriendo el fichero en el árbol base:

```
Tests:       5 failed, 14 passed, 19 total

● … Manager Creation › should create process manager
    TypeError: vscode.window.onDidCloseTerminal is not a function
      at new TerminalManager (src/terminalManager.ts:24:23)
      at new ProcessManager (src/processManager.ts:33:32)
      at Function.getInstance (src/processManager.ts:38:39)
      at ManagerFactory.createManager (src/core/managerFactory.ts:71:42)

● … Manager Creation › should create webview manager
    TypeError: vscode.window.onDidCloseTerminal is not a function
      at new TerminalManager (src/terminalManager.ts:24:23)
      at new ProcessManager (src/processManager.ts:33:32)
      at new WebViewManager (src/webViewManager.ts:42:46)
      at Function.getInstance (src/webViewManager.ts:51:39)
      at ManagerFactory.createManager (src/core/managerFactory.ts:75:42)

● … Standard Managers Creation › should create all standard managers          ← misma excepción
● … Standard Managers Creation › should have proper dependency chain …        ← misma excepción
● … Performance › should handle concurrent manager creation                   ← misma excepción
```

Los cinco, una sola excepción, un solo punto de origen: `src/terminalManager.ts:24`, que
llama `vscode.window.onDidCloseTerminal` **en el constructor** de `TerminalManager`. Los cinco
son exactamente los cinco tests que llegan a construirlo — por `ProcessManager` (`process`,
`standard managers` ×2, `concurrent`) o arrastrado por `WebViewManager` (`webview`).

Y el origen es el **mock inline** del propio fichero, no el compartido:

| dónde | qué había | comprobado |
| ----- | --------- | ---------- |
| `tests/integration/managerFactory.test.ts:9-53` (base) | `jest.mock('vscode', …, {virtual:true})` con un `window` de **4 claves**: `showInformationMessage`, `showErrorMessage`, `createOutputChannel`, `createWebviewPanel` | leído |
| `tests/mocks/vscode.mock.js:83` | `onDidCloseTerminal: jest.fn().mockReturnValue({ dispose: jest.fn() })` — **sí existe** | leído |
| `jest.config.js:36-38` | `moduleNameMapper: {'^vscode$': '<rootDir>/tests/mocks/vscode.mock.js'}` — al que el mock inline **desplaza** | leído |

**Confirmación por experimento, no por lectura** (§3.1): borrado el mock inline y dejando
actuar al `moduleNameMapper`, los 19 pasan sin tocar una sola aserción. Es la prueba de que la
única pieza que faltaba estaba en el mock inline.

### 1.1 · La pista rancia, y sus dos motivos — verificados

`plan/REPORTES/WP-V23-config-intencional.md:616` decía:

> `| H-8 | tests/mocks/vscode.mock.js no expone onDidCloseTerminal → los 5 rojos | §6 | V48 |`

Rancia por dos motivos **independientes**, y los dos comprobados con git:

1. **Nombra el fichero equivocado.** Aunque el mock compartido no la expusiera, daría igual:
   el mock inline `{virtual:true}` lo desplaza y a esa suite no la alcanza nunca. La causa es
   de **quién consulta el mock**, no de qué contiene el compartido.
2. **Su mitad factual también caducó.** MEDIDO con git: en `b97151b` (el commit de V23) el mock
   compartido **no** tenía `onDidCloseTerminal` (`git show b97151b:tests/mocks/vscode.mock.js`
   → ausente), así que H-8 era *cierta sobre el contenido* cuando se escribió. `dfddc87` (WP-V66)
   la añadió, y **`dfddc87` NO es ancestro de `b97151b`** (`git merge-base --is-ancestor` → falso):
   son dos ramas que se fusionaron después. Desde esa fusión, la frase es falsa además de
   irrelevante.

O sea: H-8 no fue un error de quien la escribió; fue una observación correcta que **el mundo
invalidó por debajo** sin que nadie volviera a mirarla. Es la clase de nota que el brief pedía
tratar con desconfianza.

---

## 2 · La vía elegida, y su precio

Había dos vías obvias, y el brief pedía elegir y declarar el precio. **Elegí una tercera**,
porque las dos obvias tienen cada una un defecto que la otra no tiene.

| vía | qué hace | por qué NO (o sí) |
| --- | -------- | ----------------- |
| **A · añadir la clave que falta** | `onDidCloseTerminal: jest.fn()…` al mock inline | Arregla el **síntoma** y deja intacto el **mecanismo**. El mecanismo es que este fichero mantiene una COPIA del mock. Y no es una hipótesis: **ya se quedó atrás una vez** — `dfddc87` (V66) amplió el compartido *precisamente porque `TerminalManager` la necesitaba*, y este fichero no se enteró. La vía A garantiza que la próxima API que entre en un constructor vuelva a costar un WP |
| **B · borrar el mock inline entero** | dejar que actúe el `moduleNameMapper` | MEDIDO: pone los 19 en verde (§3.1). Pero **degrada en silencio el objeto bajo prueba**: `tests/mocks/vscode.mock.js:110-120` devuelve `'test-value'` para toda clave, y `LoggingManager.loadConfiguration()` (`src/loggingManager.ts:89-106`) espera un **array** en `enabledCategories` (hace `new Set(enabledCats)`) y un **número** en `maxEntries` |
| **C · derivar del compartido y conservar sólo lo propio** ✅ | `jest.requireActual` del compartido + override de `workspace.getConfiguration` | Cierra el mecanismo (deja de haber copia) **y** no pierde nada |

### 2.1 · ¿El mock inline existía por una razón? Sí, pero sólo por una línea

El brief avisaba de que el mock inline podía existir por aislamiento deliberado. **Averiguado:**

- MEDIDO con git: el mock inline y el `moduleNameMapper` entraron en el **mismo** commit
  fundacional `6b77afb` («IT 1 - 10»). No hay ningún momento en la historia en que alguien
  añadiera un mock inline *para desplazar* uno compartido que ya existía.
- Es el **único** de los 10 ficheros de test de la suite con `jest.mock('vscode', …)`
  (`grep -rln "jest.mock('vscode'" tests/` → 1 fichero de 10).
- No hay comentario que lo explique.

Pero **una** cosa sí aportaba, y alguien la mantuvo viva a propósito: la `getConfiguration`
consciente de la sección `aleph0.logging`. WP-V23 (`b97151b`) la tocó para renombrar
`alephscript.logging` → `aleph0.logging` — el diff de V23 en este fichero es exactamente esa línea.

**MEDIDO con una sonda temporal** en este mismo fichero, comparando las dos `getConfiguration`
lado a lado en la misma corrida (la sonda se retiró; no queda en el entregable):

```
SONDA               enabledCategories=["general","extension","ui"]  set.size=3  maxEntries=10000  level="info"
SONDA-COMPARTIDO    enabledCategories="test-value"                  set.size=8
```

`set.size=8` son las ocho letras distintas de la cadena `'test-value'`. Es decir: con la vía B,
este fichero construiría un `LoggingManager` con **ocho categorías de una letra** y un tope de
entradas que es la cadena `'test-value'`. **Nada lo asertaba** — y por eso la vía B pasa los 19
en verde igual. Pero poner en verde degradando en silencio el objeto bajo prueba es exactamente
la clase de arreglo que este WP tenía prohibido hacer.

Corrijo aquí un número mío: en el primer borrador del comentario escribí «diez categorías de una
letra». Son **ocho**. Lo escribí antes de medirlo; la sonda lo desmintió y está corregido en el
fichero.

### 2.2 · El precio de la vía C, dicho entero

1. **El fichero queda acoplado a la forma de `tests/mocks/vscode.mock.js`.** Si mañana alguien
   reestructura el compartido (p. ej. mueve `workspace` de sitio), este fichero se entera. Es
   coste real — pero **es el acoplamiento que se quiere**: es justo lo que impide que la copia
   vuelva a quedarse atrás. Un acoplamiento que avisa es mejor que una copia que calla.
2. **Una indirección más al leer.** El mock ya no se lee de un vistazo; hay que saber qué trae
   el compartido. Mitigado con un comentario que dice de dónde sale cada mitad y por qué.
3. **`jest.requireActual`, no `require`** — y esto es un hallazgo, no un detalle (§3.2).
4. **No cierra la deuda de fondo**: `TerminalManager` llama a la API de VS Code en su
   constructor, y por eso un mock incompleto revienta *al construir* en vez de *al usar*. Eso es
   producto, está fuera del ALCANCE_DIFF de este WP, y **no lo he tocado**. Queda dicho en §6.

> **AMPLIADO tras la devolución.** Esta sección decía ser «el precio dicho entero» y le faltaban
> tres cosas. Las tres son inocuas hoy y **medidas**, pero omitirlas de una lista que se anuncia
> como completa es exactamente el vicio que este reporte denuncia en otros.

5. **Mi propia derivación reintroduce el mecanismo una capa más adentro.** «Deja de haber copia»
   es cierto un nivel arriba y **falso uno abajo**: mi override vuelve a declarar la **forma** del
   objeto de configuración. El compartido devuelve `{get, update, has, inspect}`
   (`tests/mocks/vscode.mock.js:110-120`); el mío devuelve **`{get, update}`**. Si mañana algo en
   `src/` llama `config.has(...)` o `config.inspect(...)`, este fichero volverá a ser el único que
   revienta — el mismo cuento, un piso más abajo. **Inocuo hoy, y medido**: cero llamadas a
   `.has(` o `.inspect(` sobre un objeto de configuración en todo `src/` (los 20 aciertos de
   `.has(` son `Map`/`Set`). Se queda así a propósito, porque copiar `has`/`inspect` sería
   ampliar la copia; lo que corresponde el día que hagan falta es **derivar también el objeto de
   configuración**, no añadirle claves.
6. **Dos rebajas de superficie respecto de lo que este fichero tenía**, heredadas del compartido:
   - `workspace.onDidChangeConfiguration` pasa de devolver `{dispose: jest.fn()}` (mock inline) a
     devolver **`undefined`** (`tests/mocks/vscode.mock.js:121` es `jest.fn()` a secas). MEDIDO,
     cuatro consumidores en `src/`: dos **descartan** el retorno (`src/loggingManager.ts:60`,
     `src/core/configurationService.ts:426`) y dos lo **guardan** —
     `src/elenco/RepartoElencoService.ts:35` en `this.configSub`, que hace `.dispose()` en `:162`,
     y `src/core/HackerStatusBarManager.ts:37`, que hace `context.subscriptions.push(...)` en
     `:46`. Ninguno de esos dos está en la ruta de estos tests, así que hoy no rompe nada; pero si
     alguien los trae a este fichero, `undefined.dispose()` es lo que se encontrará.
   - desaparece `ExtensionContext: jest.fn()`. **Inocuo y comprobado**: `vscode.ExtensionContext`
     se usa en `src/` sólo como **tipo**, y los tipos se borran al compilar; cero usos como valor.

---

## 3 · Los dos experimentos, y lo que enseñaron

### 3.1 · Vía B medida (y descartada por §2.1, no por fallar)

Borrado el bloque `:9-53` y nada más. MEDIDO:

```
PASS tests/integration/managerFactory.test.ts
Tests:       19 passed, 19 total
```

Sirve como prueba independiente de la causa: **el mock compartido, tal cual está hoy, basta**.
Confirma también el corolario del reencuadre desde el otro lado: no hacía falta ampliar
`vscode.mock.js` — hacía falta *consultarlo*.

### 3.2 · HALLAZGO · `require` dentro de la fábrica recursa hasta reventar la suite entera

La primera versión de la vía C usaba `require('../mocks/vscode.mock.js')` dentro de la fábrica.
MEDIDO:

```
FAIL tests/integration/managerFactory.test.ts
  ● Test suite failed to run
    RangeError: Maximum call stack size exceeded
      at Runtime.requireModuleOrMock (node_modules/jest-runtime/build/index.js:1052:32)
      at tests/integration/managerFactory.test.ts:41:18   (×33)

Tests:       0 total
```

Por qué: el `moduleNameMapper` resuelve `'vscode'` a **ese mismo fichero**, así que el `require`
por ruta relativa vuelve a entrar en la fábrica que lo llamó. La cura es `jest.requireActual`,
que salta el registro de mocks. Queda anotado en el propio fichero para que nadie lo «simplifique»
de vuelta.

Vale la pena decir cómo se habría visto esto desde fuera: **cero tests ejecutados**, y el gate lo
habría cazado como `SUITE …` (la clase que V90 puso justamente para que una suite caída no
encogiera el conjunto y pareciera mejora). Instrumento probado en carne propia.

### 3.3 · Vía C medida

```
PASS tests/integration/managerFactory.test.ts
Tests:       19 passed, 19 total
```

---

## 4 · Qué siguen probando los cinco tests — la prueba de que no los ablandé

**Prueba mecánica primero, prosa después.** El diff completo del fichero, filtrado por todo lo
que podría constituir un ablandamiento:

```
$ git diff tests/integration/managerFactory.test.ts | grep -E "^[+-]" \
      | grep -E "it\(|expect\(|describe\(|\.skip|\.todo|xit\("
NINGUNA
```

Cero líneas del diff contienen `it(`, `expect(`, `describe(`, `.skip`, `.todo` o `xit(`. Los dos
únicos hunks son `@@ -8,28 +8,65 @@` y `@@ -37,17 +74,7 @@`: **ambos dentro del bloque del mock**.
El fichero tenía 19 `it` y tiene 19 `it`, con los mismos 19 nombres.

### 4.1 · Lo que los cinco prueban — **medido en la corrida que de verdad se corre**

> **CORREGIDO tras la devolución.** La versión anterior de esta tabla describía el comportamiento
> de cada test **en aislamiento** y lo presentaba como lo que ocurre en la corrida canónica del
> fichero. No es lo mismo, y la diferencia es grande. Lo que sigue está medido.

MEDIDO con una sonda temporal (`afterEach` contando construcciones de `TerminalManager` vía
`onDidCloseTerminal.mock.calls.length` y `createOutputChannel('AlephScript Terminals')`; retirada
tras medir). Corrida canónica del fichero entero, los 19 `it`:

```
SONDA-B2 TMctor=1 ocTerminals=1 :: … Manager Creation should create process manager
SONDA-B2 TMctor=0 ocTerminals=0 :: … Manager Creation should create webview manager
SONDA-B2 TMctor=0 ocTerminals=0 :: … Standard Managers Creation should create all standard managers
SONDA-B2 TMctor=0 ocTerminals=0 :: … Standard Managers Creation should have proper dependency chain …
SONDA-B2 TMctor=0 ocTerminals=0 :: … Performance should handle concurrent manager creation
   (y TMctor=0 en los otros catorce)
```

**Se construye UN SOLO `TerminalManager` en todo el fichero.** Los otros cuatro reciben los
singletons estáticos que dejó el primero (`ProcessManager.instance`, `WebViewManager.instance`
nunca se limpian; `factory.disposeAll()` vacía el `Map` del factory, no los estáticos). Así que
«la cadena real webview → process → terminal» **se corta en process**, y «los nueve managers» no
construye ninguno de los tres.

Contra-evidencia, que es justa con los tests: **en aislamiento sí lo construyen todos**. MEDIDO,
cuatro corridas con `-t <nombre>`:

```
TMctor=1 :: should create webview manager
TMctor=1 :: should create all standard managers
TMctor=1 :: should have proper dependency chain in standard managers
TMctor=1 :: should handle concurrent manager creation
```

O sea: los tests **no están vacíos**. Lo que estaba mal era mi frase, que atribuía a la corrida
medida un recorrido que sólo ocurre aislado. Y hay un detalle simétrico que conviene dejar
escrito: **en rojo los cinco sí llegaban al constructor**, precisamente porque la excepción
impedía cachear el singleton.

| test | qué prueba, dicho sin adornos |
| ---- | ----------------------------- |
| `should create process manager` | que `createManager('process')` resuelve y devuelve algo con `dispose` — **el único de los cinco que construye `TerminalManager`** en la corrida canónica |
| `should create webview manager` | que `createManager('webview')` resuelve; construye `WebViewManager`, que recibe el `ProcessManager` **ya cacheado** |
| `should create all standard managers` | que `createStandardManagers()` completa los nueve pasos sin lanzar y devuelve los nueve campos definidos (10 `toBeDefined`) |
| `should have proper dependency chain …` | que tras eso el registro del factory contiene `logging`, `config`, `analytics` y `ai-assistant` (4 × `hasManager(...) === true`) |
| `should handle concurrent manager creation` | que cinco `createManager` en `Promise.all` resuelven los cinco, con `toHaveLength(5)` y `dispose` en cada uno |

**Lo que estos cinco prueban es que la CADENA DE CONSTRUCCIÓN de managers se completa sin
lanzar.** Es lo que estaba roto y es lo que se arregló. No es poco: era la excepción que
contaminaba toda medición del mundo.

**Lo que NO prueban.** Las 29 aserciones ejecutadas de los cinco (21 en el texto; el `forEach` de
`concurrent` corre 2 × 5) son `toBeDefined`, `toHaveProperty('dispose')`, `hasManager(...)` y
`toHaveLength(5)`. **Ninguna nombra un terminal** (`grep` sobre el fichero: cero `expect(` que
mencione «terminal»), y el callback registrado en `onDidCloseTerminal` **no se invoca jamás** —
el mock es `jest.fn().mockReturnValue({dispose})`, que nunca llama a su argumento. Son humo de la
cadena de construcción.

**Consecuencia honesta: la CA «cubren ciclo de vida de terminales» NO la cierra este WP.** El
encargo tenía dos mitades y sólo he cerrado una. La fila que sí la cerraría va propuesta en §10.

**Ningún test resultó no probar nada útil**, así que no propongo borrar ninguno — pero tampoco
propongo cobrarlos como cobertura de terminales. (El único `it` de este fichero que no probaba
nada útil ya lo trató WP-V90: el del presupuesto de 100 ms, en `Performance`.)

---

## 5 · Efecto medido sobre el CONJUNTO ENTERO de la suite

### 5.1 · El gate, que es la medida de verdad

**Antes** de tocar la línea base, con el cambio ya aplicado — MEDIDO:

```
$ node scripts/rojos-jest.mjs --gate
conjunto de rojos DISTINTO del declarado:
- FALLA tests/integration/managerFactory.test.ts :: … Manager Creation should create process manager
- FALLA tests/integration/managerFactory.test.ts :: … Manager Creation should create webview manager
- FALLA tests/integration/managerFactory.test.ts :: … Performance should handle concurrent manager creation
- FALLA tests/integration/managerFactory.test.ts :: … Standard Managers Creation should create all standard managers
- FALLA tests/integration/managerFactory.test.ts :: … Standard Managers Creation should have proper dependency chain in standard managers
```

**Cinco líneas, las cinco en dirección «−», y ni una sola «+».** Eso es el efecto sobre el
conjunto entero dicho por el instrumento del mundo: los cinco desaparecen y **no aparece ningún
rojo nuevo en ninguno de los otros 9 ficheros**. Es exactamente lo que el brief anticipaba que
haría este WP: hacer fallar el gate a propósito, en una sola dirección.

**Después** de actualizar la línea base — MEDIDO:

```
$ node scripts/rojos-jest.mjs --gate
conjunto de rojos IDENTICO al declarado
GATE EXIT=0
```

### 5.2 · Cardinales de la suite entera

| | antes (base `629d502`) | después | delta |
| - | ---: | ---: | ---: |
| Test Suites | **1 failed**, 9 passed, 10 total | **10 passed**, 10 total | −1 suite en rojo |
| Tests fallando | **5** | **0** | −5 |
| Tests pasando | 369 | **374** | +5 |
| Tests saltados | 1 | 1 | = |
| **Total de tests** | **375** | **375** | **=** |
| `jest` exit code (sin cobertura) | 1 | **0** | — |

El total **no se mueve**: no añadí ni quité un solo `it`. Los +5 verdes son exactamente los −5
rojos, no tests nuevos.

### 5.3 · Cobertura — medida en los dos lados, en este mismo árbol

Para no citar de memoria, restauré la versión base del fichero en este árbol y corrí cobertura,
y luego repuse la mía. Las dos filas son **MEDIDO aquí**, no citas:

| | statements | branches | functions | lines |
| - | ---: | ---: | ---: | ---: |
| antes | 24,91 % | 24,90 % | 20,49 % | 25,33 % |
| después | **26,10 %** | **25,13 %** | **21,51 %** | **26,55 %** |
| umbral | 85 % | 75 % | 80 % | 85 % |

La fila «antes» reproduce **exactamente** los cuatro números que declaraba
`scripts/rojos-jest.baseline.txt` (medidos por V90), lo cual vale de control de que el árbol
mide lo mismo que el suyo.

#### 5.3.bis · POR FICHERO — y aquí es donde mi primera entrega mintió

> **CORREGIDO tras la devolución.** Escribí que la subida era «que los cinco tests ahora recorren
> de verdad `TerminalManager`, `ProcessManager`, `WebViewManager` y `CommandPaletteManager`».
> **`TerminalManager` sobra en esa lista, y es justo el fichero que da nombre a la CA.**

MEDIDO con `--coverageReporters=json-summary` sobre las dos versiones en el mismo árbol,
comparando `coverage-summary.json` fichero a fichero. **Statements cubiertos, delta:**

| fichero | Δ statements |
| ------- | ---: |
| `src/commandPaletteManager.ts` | **+40** |
| `src/core/managerFactory.ts` | +11 |
| `src/processManager.ts` | +6 |
| `src/core/mcpConfigurationManager.ts` | +6 |
| `src/webViewManager.ts` | +4 |
| `src/loggingManager.ts` | +2 |
| `src/core/logging/structuredLog.ts` | +1 |
| **`src/terminalManager.ts`** | **+0** |
| *(los otros ~90 ficheros)* | 0 |
| **suma** | **+70** |

Y `src/terminalManager.ts` sale **bit a bit idéntico** — comparación de objetos completa,
`IDENTICO? true`:

```
antes    lines 9/97 · functions 1/14 · statements 9/99 · branches 0/27
después  lines 9/97 · functions 1/14 · statements 9/99 · branches 0/27
         → statements 9,09 % · branches 0 % · lines 9,27 % · functions 7,14 %
```

**Por qué mi intuición falló, que es lo interesante:** istanbul incrementa el contador de la
sentencia **antes de evaluarla**. Las tres sentencias del constructor de `TerminalManager`
(`:20` `createOutputChannel`, `:21` `createLogger`, `:24` `onDidCloseTerminal(...)`) **ya contaban
como cubiertas en la corrida roja**, excepción incluida: la excepción ocurre *durante* la
evaluación, cuando el contador ya subió. «Un rojo tapa las líneas a las que no llega» es cierto
en general y **falso justo para el fichero donde muere la excepción**.

Así que la frase correcta es: **los cinco dejan de morir en el constructor de `TerminalManager`,
y lo que se cubre es lo que viene después** — sobre todo `commandPaletteManager` (+40), que sólo
se alcanza si `createStandardManagers` no revienta antes. `terminalManager.ts` sigue en **9,09 %
de sentencias y 0 % de ramas**, y **ningún test asevera nada de terminales** (§4.1).

**Sigue siendo rojo de umbral, abierto desde WP-V13, y no es de V48 cerrarlo.**

### 5.4 · Determinismo — el aviso del brief, atendido

El brief avisaba: la suite acaba de dejar de flapear, y un rojo que va y viene sería regresión
reciente, no flake. MEDIDO con el instrumento, en **paralelo** (que es donde hay contención):

```
$ node scripts/rojos-jest.mjs --repetir 3 -- --coverage=false
--- corrida 1/3 (jest exit=0, 375 tests ejecutados) ---
OMITE tests/unit/mcp/clienteMcp.test.ts :: [pending] WP-V28 · … skip-honesto …
--- corrida 2/3 (jest exit=0, 375 tests ejecutados) ---
OMITE tests/unit/mcp/clienteMcp.test.ts :: [pending] WP-V28 · … skip-honesto …
--- corrida 3/3 (jest exit=0, 375 tests ejecutados) ---
OMITE tests/unit/mcp/clienteMcp.test.ts :: [pending] WP-V28 · … skip-honesto …

VEREDICTO: las 3 corridas ejecutaron 375 tests y dieron el MISMO conjunto por nombre
```

**Ningún rojo intermitente observado**, en 3 corridas paralelas + 2 corridas del `--gate` + 2 de
cobertura = **7 corridas completas** de la suite en este árbol. El conjunto es estable por nombre
y ahora consta de una sola línea: el `skip` honesto declarado de WP-V28.

### 5.5 · Higiene del árbol

El brief avisaba de que correr la suite ensucia ficheros rastreados. **MEDIDO: con estos
comandos, no.** `git status --short` después de las 7 corridas (incluidas las dos con
`--coverage`, que escriben `coverage/`, que está en `.gitignore`) devuelve exactamente los dos
ficheros que edité a mano y nada más. Cero contrabando, cero ficheros sin rastrear.

`npm run compile:tests` (`tsc -p tsconfig.json`) **falla, y ya fallaba**: 8 errores, los 8 en
`src/**` (`RepartoElencoService.ts`, `protocolApi.ts`, `LauncherCatalogClient.ts`,
`LineaEditorClient.ts`, `McpResourceClient.ts`) — TS1479 de ESM/CJS y TS2353 del SDK de MCP.
**Cero errores en `tests/**`**, y no he tocado ni un fichero de `src/`, así que ninguno es mío.
Lo anoto porque significa que `jest.requireActual` + *spread* **tipa limpio**.

---

## 6 · Lo que NO hice, y por qué consta

- **No toqué `tests/mocks/vscode.mock.js`.** Es el punto de mayor radio de explosión del alcance
  y **no hacía falta**: ya expone todo lo necesario. Consecuencia directa: el efecto de este WP
  sobre los otros 9 ficheros de test es **estructuralmente nulo**, no «medido como nulo».
- **No toqué `src/**`.** El defecto está en el test, no en el producto. Pero dejo señalado, para
  quien quiera abrir el WP, que hay una deuda de producto detrás: `TerminalManager` llama a
  `vscode.window.onDidCloseTerminal` **en el constructor** (`src/terminalManager.ts:24`), y por
  eso un hueco en el mock revienta al *construir*. **No propongo cambiarlo desde aquí**: cambiar
  el momento en que un manager se suscribe a eventos es cambio de producto con superficie propia,
  y el brief pedía pararse y decirlo antes de tocarlo. Dicho queda; no tocado.

  > **AMPLIADO tras la devolución.** Dije «`TerminalManager`» como si fuera un caso aislado.
  > **No lo es**, y dos de sus hermanos están en la ruta de estos mismos tests. Buscado en `src/`:

  | clase | dónde se suscribe | ¿en la ruta de estos tests? |
  | ----- | ----------------- | --------------------------- |
  | `TerminalManager` | constructor, `src/terminalManager.ts:24` (`window.onDidCloseTerminal`) | **sí** — es la que provocaba los cinco |
  | `LoggingManager` | constructor, `src/loggingManager.ts:60` (`workspace.onDidChangeConfiguration`) | **sí** — `createManager('logging')`, y además la construye `ConfigurationService` en `:243` |
  | `ConfigurationService` | constructor `src/core/configurationService.ts:242-244` → `setupConfigurationWatcher()` → `:426` | **sí** — `createManager('config')` |
  | `RepartoElencoService` | constructor, `src/elenco/RepartoElencoService.ts:35` | no |

  (`HackerStatusBarManager:37` tiene la misma suscripción pero en `initialize(context)`, **no** en
  el constructor: es la forma sana, y por eso no la cuento aquí.)

  O sea que **la forma se repite al menos cuatro veces**, y hoy sólo no duele porque el mock
  compartido cubre `onDidChangeConfiguration`. Es el mismo pozo del que salieron los cinco rojos:
  el día que falte una de esas claves, vuelve a reventar **al construir**, y otra vez lejos de la
  causa. Sigue sin tocarse desde aquí — es producto.
- **No borré ningún test** ni propongo borrarlo (§4).
- **No usé `git stash`** (prohibido: la pila es del repositorio y hay más worktrees vivos) ni
  `npx`. Para las idas y vueltas entre la versión base y la mía usé copias en el scratchpad
  fuera del repo. Jest se invocó por su ruta en `node_modules`, y las corridas caras fueron por
  `scripts/slot.sh run`, que es la ranura compartida entre worktrees.

---

## 7 · EL DIFF DE LA LÍNEA BASE — la firma de este WP

`scripts/rojos-jest.baseline.txt`. Filtrado a **entradas declaradas** (el instrumento ignora
`#` y líneas vacías), el diff es este y sólo este:

```diff
-FALLA tests/integration/managerFactory.test.ts :: ManagerFactory Integration Tests Manager Creation should create process manager
-FALLA tests/integration/managerFactory.test.ts :: ManagerFactory Integration Tests Manager Creation should create webview manager
-FALLA tests/integration/managerFactory.test.ts :: ManagerFactory Integration Tests Performance should handle concurrent manager creation
-FALLA tests/integration/managerFactory.test.ts :: ManagerFactory Integration Tests Standard Managers Creation should create all standard managers
-FALLA tests/integration/managerFactory.test.ts :: ManagerFactory Integration Tests Standard Managers Creation should have proper dependency chain in standard managers
```

**Cinco líneas retiradas. Cero añadidas. Ni una más, ni una menos.** La única entrada que
sobrevive en el fichero es la que ya estaba y no es mía:

```
OMITE tests/unit/mcp/clienteMcp.test.ts :: [pending] WP-V28 · contra runtime real (skip-honesto) …
```

El resto del diff de ese fichero (52 líneas añadidas, 27 borradas en total) son **comentarios**:

- el bloque que describía «los cinco rojos deterministas, con su causa» pasa a describir cómo se
  cerraron — dejarlo hablando en presente de cinco rojos que ya no existen sería fabricar la
  próxima pista rancia, que es justo el problema de §1.1;
- la nota de medida se desdobla en «MEDIDO por V90» y «RE-MEDIDO por V48», sin borrar la de V90;
- los cuatro números de cobertura pasan a tabla con las dos medidas y los umbrales (§5.3).

---

## 8 · Los cinco ejes de CA

| eje | estado | evidencia |
| --- | ------ | --------- |
| **Los 5 en verde** | ✅ | §3.3 · §5.2 · gate `IDENTICO` exit 0 (§5.1) |
| **Sin ablandar lo que prueban** | ✅ | §4 — cero `it`/`expect`/`describe`/`.skip` en el diff, comprobado con grep; 19 `it` antes y después, mismos nombres; ambos hunks dentro del mock |
| **Efecto medido sobre el conjunto entero** | ✅ | §5.1 (gate: 5 «−», 0 «+») · §5.2 (375 → 375, 5 → 0 rojos) · §5.4 (3 corridas paralelas, mismo conjunto) |
| **Diff de la línea base** | ✅ | §7 — 5 retiradas, 0 añadidas |
| **Cubren ciclo de vida de terminales** | ❌ **NO la cierra este WP** | §4.1 · §5.3.bis — `terminalManager.ts` sale **bit a bit idéntico** en cobertura (9,09 % sentencias, 0 % ramas); en la corrida canónica se construye **un solo** `TerminalManager`; **ninguna aserción nombra un terminal** y el callback nunca se invoca. La fila que sí la cerraría, en §10 |

**Este eje lo puse ✅ en la primera entrega y era falso.** No lo bajo a ❌ por prudencia: lo bajo
porque está medido que lo es (§5.3.bis). Los cinco rojos están cerrados; el ciclo de vida de
terminales sigue sin cubrir, y son dos cosas distintas que el encargo juntaba en una línea.

---

## 9 · Lo que este WP deja dicho para el que venga

1. **Una copia de un mock es una regresión programada.** No falla el día que se hace; falla el
   día que alguien arregla el original. Aquí el intervalo fueron `dfddc87` → hoy, y costó que
   cinco rojos contaminaran toda medición del mundo durante varias olas.
2. **Una nota de diagnóstico puede caducar sin que nadie la toque.** H-8 era correcta al
   escribirse y falsa al leerse, por una fusión ajena (§1.1). La defensa no es escribir mejor:
   es volver a medir antes de citar.
3. **Verde no es lo mismo que arreglado.** La vía B ponía los 19 en verde y **degradaba el
   objeto bajo prueba**, y nada en la suite lo habría detectado porque nada lo asertaba (§2.1).
   Lo detectó una sonda de dos líneas. Cuando un arreglo de test parece gratis, conviene medir
   qué recibe el código bajo prueba, no sólo qué devuelve el `expect`.
4. **UNA CIFRA QUE SUBE NO DICE POR QUÉ SUBE — ANTES DE ATRIBUIRLA, MÍRALA POR FICHERO.**
   Es la lección nueva de este WP y va desarrollada en §11, porque no es del mismo tipo que las
   que este swarm venía persiguiendo.

---

## 10 · La fila que SÍ cerraría «cubren ciclo de vida de terminales»

El encargo de V48 juntaba dos cosas en una línea de CA: *«los 5 en verde · cubren ciclo de vida
de terminales»*. **La primera está cerrada y la segunda no**, y no lo estaba antes tampoco: los
cinco nunca aseveraron nada sobre terminales, ni en rojo ni en verde. Lo que hicieron durante
varias olas fue **morir** en el constructor de `TerminalManager`, que no es lo mismo que probarlo.

Propongo una fila nueva, y a propósito **no me la asigno**: es trabajo de otra naturaleza —
escribir tests que hoy no existen— y el ALCANCE_DIFF de V48 no lo cubre.

> **WP-V48b `P2` — el ciclo de vida de terminales, probado de verdad.** `src/terminalManager.ts`
> está al **9,09 % de sentencias y 0 % de ramas** (medido en `WP-V48:§5.3.bis`), y **ninguna
> aserción de la suite nombra un terminal**. La clase gestiona un `Map<string, TerminalInfo>` con
> altas, bajas y estados (`'running' | 'stopped' | 'error'`), y su pieza más delicada no se ejerce
> jamás: **el callback de `onDidCloseTerminal` (`:24-34`), que busca el terminal cerrado en el
> `Map`, le pone `status='stopped'` y lo borra**. Hoy ese callback se registra y **no se invoca
> nunca**, porque el mock es `jest.fn()` y jamás llama a su argumento.
> **CA**: que el mock **dispare** el evento y se asevere el efecto — terminal marcado `stopped`,
> entrada retirada del `Map`, y el caso de un terminal ajeno que no debe tocar nada; más las
> ramas de `createAndRunTerminal` / `killTerminal`. **Cuidado declarado**: exigirá `createTerminal`
> con identidad distinguible entre llamadas (el mock compartido devuelve hoy **el mismo objeto**
> siempre, `tests/mocks/vscode.mock.js:60-69`), y eso **sí** toca el fichero de mayor radio de
> explosión de la suite. **Dependencia**: mejor después de decidir si la suscripción a eventos
> sale del constructor (§6), porque cambia cómo se monta el test.

---

## 11 · QUÉ FRASES CAMBIÉ TRAS LA DEVOLUCIÓN, Y POR QUÉ

**Cero líneas de código cambiadas.** El arreglo, la vía elegida y los números de la suite
resistieron la contrarrevisión; lo que cayó fue **prosa**. Registro completo:

| # | dónde estaba | qué decía | qué dice ahora | por qué |
| - | ------------ | --------- | -------------- | ------- |
| 1 | **`scripts/rojos-jest.baseline.txt:59-61`** | «los cinco tests … ahora recorren de verdad `TerminalManager`, `ProcessManager`, `WebViewManager` y `CommandPaletteManager`» | los cinco **dejan de morir** en el constructor; la cobertura que sube es la de **lo que viene después**, con el desglose por fichero y `terminalManager +0` | **FALSO, medido**: `terminalManager.ts` sale bit a bit idéntico (§5.3.bis) |
| 2 | reporte §5.3 (final) | la misma frase | §5.3.bis entera: tabla de deltas por fichero, el `IDENTICO? true`, y la explicación de istanbul | igual |
| 3 | reporte §4, tabla «qué recorre» | describía la cadena `webview → process → terminal` y «los nueve managers» construyendo | §4.1: sonda con las construcciones **medidas**; **un solo `TerminalManager`** en toda la corrida, y la contra-evidencia en aislamiento | describía el comportamiento **aislado** presentándolo como el de la corrida medida |
| 4 | reporte §8, eje 5 | ✅ «Cubren ciclo de vida de terminales» | ❌ **no la cierra este WP**, con la fila que sí lo haría en §10 | consecuencia honesta de 1-3 |
| 5 | fila V48 del BACKLOG | «la subida es que los cinco ahora **recorren** el ciclo de vida de terminales» | el desglose real y la CA declarada **no cerrada** | igual que 1 |
| 6 | reporte §2.2 «el precio dicho entero» | tres precios | **seis**: + mi override redeclara la forma del objeto de config (`{get,update}` vs `{get,update,has,inspect}`) · + `onDidChangeConfiguration` pasa a devolver `undefined`, con los 4 consumidores medidos (2 lo descartan, **2 lo guardan**) · + desaparece `ExtensionContext` | una lista que se anuncia como completa y no lo está es el vicio que este mismo reporte denuncia |
| 7 | reporte §6, deuda de producto | sólo `TerminalManager` | **cuatro clases** con la misma forma, **dos de ellas en la ruta de estos tests** (`LoggingManager`, `ConfigurationService`) | estaba bien leída pero corta |

Y una cifra que **no** cambio pero que conviene precisar, porque circulan dos números correctos:
los cinco tests tienen **21 `expect(` en el texto** y **29 aserciones ejecutadas** — el `forEach`
de `should handle concurrent manager creation` corre 2 × 5. Las dos cuentas son ciertas; miden
cosas distintas.

### 11.1 · La lección, con todas las letras

Este swarm venía persiguiendo **afirmaciones más anchas que la evidencia**. Ésta no era eso.

**Ésta era una afirmación que la evidencia CONTRADICE.** No exageré un alcance: dije que subía la
cobertura de un fichero cuya cobertura **no se movió ni un bit**. Y no la escribí de mala fe ni
por descuido: la escribí desde una intuición que es **correcta en general** —«un rojo tapa las
líneas a las que no llega a ejecutar»— y que resulta **falsa justo en el fichero donde muere la
excepción**, porque istanbul cuenta la sentencia antes de evaluarla. La intuición razonable es
precisamente lo que la hizo pasar: sonaba a explicación, y por eso no la medí.

Hay un agravante que es lo que de verdad importa: **la sembré en un artefacto compartido.**
`scripts/rojos-jest.baseline.txt` no es mi reporte — es el estado declarado del mundo, lo primero
que abre el próximo WP que toque la suite. Y la ironía es completa: **este WP existe, en parte,
para desmontar una nota que caducó sin que nadie la tocara** (H-8, §1.1). La mía no caducó.
**Nació falsa.** Y la puse en el sitio de máxima propagación.

De ahí la regla, que doy por buena para el método:

> **Una cifra que sube no dice POR QUÉ sube. Antes de atribuirla, mírala por fichero.**

Y su corolario operativo, que es lo que me habría salvado: el desglose **ya estaba disponible** —
`--coverageReporters=json-summary` sobre las dos versiones son dos comandos y un `diff`. No me
faltó instrumento. Me faltó desconfiar de una frase que me sonaba bien.
