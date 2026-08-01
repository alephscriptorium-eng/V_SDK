# WP-V90 · P0 — la suite de jest se vuelve determinista y el gate pasa a comparar NOMBRES

| dato | valor |
| ---- | ----- |
| Carril | **V** · Aleph-0 (ℵ₀) |
| Encargo | `plan/BACKLOG.md:153` |
| Rama | `wp/v90-jest-determinista` · base `c241c22` |
| Obra | `70a54b0` |
| Árbol de medida | `C:/S_LAB/wt/v-v90` · Windows 11 · 12 CPUs · 17 GB |
| Herramienta | node v22.21.1 · jest 29.7.0 · ts-jest 29.2.5 · @sinonjs/fake-timers 10.3.0 |
| Fecha de todas las medidas | **2026-08-01** |

---

## 0 · Qué es de fiar en este reporte y qué no

Todo lo que aparece aquí como **MEDIDO** se ejecutó en este árbol y su salida está pegada.
Todo lo que aparece como **CITA** viene de otro reporte y **no** se ha vuelto a medir; va marcado.

Dos cosas que el brief daba por sabidas resultaron **falsas o incompletas al medirlas**, y se
corrigen abajo con la prueba delante: el efecto de los relojes falsos sobre `process.hrtime`
(§2) y cuál de las dos aserciones de `basic.test.ts` es la que flapea de verdad (§3.4).

Las citas `fichero:línea` de este reporte se comprobaron **abriendo el fichero**, una a una.

---

## 1 · El censo, por OPERACIÓN

La lección cara: una regla que reconoce una **notación** se evade con una variante de una línea.
Así que el censo no busca `toBeLessThan`: busca **dos operaciones**.

- **OP-1 — aseverar sobre tiempo transcurrido**: leer un reloj dos veces y meter el delta en una aserción.
- **OP-2 — aseverar sobre delta de montón**: leer `process.memoryUsage()` dos veces y meter el delta en una aserción.

### 1.1 · Barrido, y por qué es exhaustivo

Cinco barridos independientes, no uno. MEDIDO sobre el árbol base:

```
A) grep -rnE 'toBeLessThan|toBeGreaterThan' tests --include=*.test.ts     → 22 aciertos
B) grep -rnE 'Date\.now|process\.hrtime|performance\.now' tests/          →  9 aciertos
C) grep -rnE '(duration|elapsed|creationTime|memoryGrowth|memoryIncrease|took|ms)\s*[<>]|expect\([^)]*[<>][^)]*\)\.toBe' tests --include=*.ts
                                                                          →  0 aciertos
D) grep -rnE 'Promise\.race|setTimeout|jest\.setTimeout|jest\.useFakeTimers' tests --include=*.ts → 5 aciertos
E) grep -rnE 'memoryUsage|global\.gc' tests --include=*.ts                →  8 aciertos
```

El barrido **(C)** es el que cierra el flanco de la notación: busca la comparación escrita a mano
(`expect(duration < 100).toBe(true)`, `if (duration > x) throw`) en lugar del *matcher*. **Cero
aciertos**: en este árbol no hay ninguna variante escondida. El censo por sintaxis y el censo por
operación coinciden, y ahora se sabe **por qué**, no por suerte.

Queda una tercera vía de aserción temporal que no es de nadie y conviene nombrar: **`testTimeout: 10000`**
(`jest.config.js:46`) es una aserción de reloj de pared de la que ningún test es dueño — cualquier test que
tarde más de 10 s cae. Es el margen que le queda al reloj en esta suite. MEDIDO sobre la corrida canónica
(379 tests con duración registrada): el más lento es
`WP-V28 · CA1 — conectar contra servidor del catálogo` con **149 ms**, o sea un margen de **×67** contra el
tope. Hoy no muerde, pero **×67 no es infinito**: bajo carga se midió una espera de 10 ms tardando
**109 ms** de reloj de pared (§3.4), un factor de ~×11 sobre una sola espera. Es el reloj que sigue vivo en
la suite y no lo cierra este WP; queda dicho para que, si alguna vez aparece un rojo por *timeout*, se sepa
de dónde sale y no se despache como flapeo.

### 1.2 · Los 22 aciertos de (A), clasificados uno a uno

| clase | aciertos | dónde |
| ----- | -------- | ----- |
| **OP-1 duración** | **8** | `basic:31`, `basic:32`, `serviceStartup:17`, `serviceStartup:54`, `serviceStartup:85`, `serviceStartup:107`, `aiAssistantService:233`, `managerFactory:309` |
| **OP-2 montón** | **4** | `basic:131`, `basic:132`, `serviceStartup:37`, `aiAssistantService:287` |
| dominio (no es reloj ni montón) | 10 | `aiAssistantService:202,212,213` (estadísticas), `serviceStartup:106` (cardinal del `slice`), `structuredLog:246` (anillo de log), `webviewCsp:423,424,523,649,1158` (analizador) |

**Son DOCE, no nueve.** Lo confirmo contándolas yo, como pedía el brief: ocho de duración y **cuatro**
de montón. Que el pecado original de este WP fuera un cardinal mal contado en un censo sobre cardinales
mal contados es la ironía que justifica todo lo demás.

### 1.3 · Veredicto por línea — las doce

Sin eufemismos. «Borrada» quiere decir borrada; en ningún caso se ha **subido el techo**.

| # | fichero:línea (base) | aserción | veredicto | ¿flapeó de facto? |
| - | -------------------- | -------- | --------- | ----------------- |
| 1 | `tests/basic.test.ts:31` | `expect(duration).toBeGreaterThanOrEqual(10)` | **RELOJ CONTROLADO** | **no** — fragilidad no observada |
| 2 | `tests/basic.test.ts:32` | `expect(duration).toBeLessThan(100)` | **RELOJ CONTROLADO** | **SÍ**, MEDIDO (§3.4) |
| 3 | `tests/performance/serviceStartup.test.ts:17` | `expect(duration).toBeLessThan(100)` | **BORRADA** | **SÍ**, MEDIDO (§3.3) |
| 4 | `tests/performance/serviceStartup.test.ts:54` | `expect(duration).toBeLessThan(500)` | **BORRADA** | no observado |
| 5 | `tests/performance/serviceStartup.test.ts:85` | `expect(duration).toBeLessThan(50)` | **BORRADA** | **SÍ**, MEDIDO (§3.3) |
| 6 | `tests/performance/serviceStartup.test.ts:107` | `expect(duration).toBeLessThan(100)` | **BORRADA** | no observado |
| 7 | `tests/unit/core/aiAssistantService.test.ts:233` | `expect(duration).toBeLessThan(500)` | **BORRADA** | no observado |
| 8 | `tests/integration/managerFactory.test.ts:309` | `expect(creationTime).toBeLessThan(100)` | **BORRADA** | no observado |
| 9 | `tests/basic.test.ts:131` | `expect(memoryGrowth).toBeGreaterThan(0)` | **BORRADA** | no observado |
| 10 | `tests/basic.test.ts:132` | `expect(memoryGrowth).toBeLessThan(10 MB)` | **BORRADA** | no observado |
| 11 | `tests/performance/serviceStartup.test.ts:37` | `expect(memoryGrowth).toBeLessThan(5 MB)` | **BORRADA** | no observado |
| 12 | `tests/unit/core/aiAssistantService.test.ts:287` | `expect(memoryIncrease).toBeLessThan(10 MB)` | **BORRADA** | no observado |

**Se dice claro: sólo 3 de las 12 se vieron flapear.** Las otras 9 se retiran por argumento, no por
flagrancia. El argumento es el mismo en las nueve —miden la máquina, no el producto— pero la
diferencia entre «lo vi caer» y «razono que puede caer» es exactamente la que este swarm cobra
cara, así que va en la tabla y no en la prosa. Ninguna de las **cuatro de montón** se observó caer
en 10 corridas cargadas: se retiran porque `heapUsed` depende de cuándo entre el GC de V8 —el delta
puede salir **negativo** y tumbar la cota inferior de la #9 sin que nada esté roto—, no porque las
haya visto caer.

Además, y sin ser aserciones, se retiran **dos entradas aleatorias**:

| extra | fichero:línea (base) | qué era | veredicto |
| ----- | -------------------- | ------- | --------- |
| a | `serviceStartup.test.ts:46` | `setTimeout(resolve, Math.random() * 10)` | sustituido por `i % 5` |
| b | `serviceStartup.test.ts:94` | `value: Math.random()` en 10.000 elementos | sustituido por rampa `i / 10000` |

La (b) importa más de lo que parece: con valores aleatorios, **cuántos** elementos pasaban el filtro
cambiaba en cada corrida, y la única aserción de contenido (`result.forEach(...)`) no aseveraba
**nada** si el filtro salía vacío. Con la rampa el cardinal es conocido (`toHaveLength(100)`,
`result[0].id === 5001`) y la aserción por fin muerde.

### 1.4 · Cómo queda el árbol (CA-2, MEDIDO tras la obra)

`grep -rnE 'Date\.now|process\.hrtime|performance\.now' tests/` pasa de **9** lecturas de reloj a
**4**, y las cuatro justificadas una a una:

| hoy | dónde | por qué se queda |
| --- | ----- | ---------------- |
| `basic.test.ts:39`, `:45` | `Date.now()` | bajo `jest.useFakeTimers()`: es reloj **controlado**, no de pared |
| `setup.ts:136`, `:138` | `process.hrtime.bigint()` | `measurePerformance` sigue devolviendo `duration`, pero **ninguna aserción la mira** |

Y: **cero** `process.memoryUsage()` y **cero** `Math.random()` en `tests/` (los aciertos residuales del
grep son mis propios comentarios citando lo que se borró). Cero aserciones cuyo operando sea un delta
de reloj de pared o de montón.

---

## 2 · Los relojes falsos: el brief estaba a medias, y esto lo cambia todo

El brief ordenaba comprobarlo de facto antes que nada. Hecho. **La corrección del crítico era
correcta en el fondo y equivocada en el mecanismo**, y la diferencia no es cosmética.

MEDIDO (sonda temporal, borrada tras medir):

```
PROBE-REAL      hrtime delta ms = 31.155        ← timers reales, setTimeout(10)
PROBE-FAKE      hrtime delta ms = 1234          ← useFakeTimers + advanceTimersByTime(1234)
PROBE-FAKE      Date.now delta ms = 1234
PROBE-FAKE      performance.now delta ms = 1234
PROBE-FAKE      hrtime is mock? REEMPLAZADO
PROBE-FAKE-AWAIT hrtime delta ms = 10           ← setTimeout(10) + advance(10) + await
PROBE-DONOTFAKE hrtime delta ms = 0.0189        ← useFakeTimers({doNotFake:['hrtime','performance']}) + advance(5000)
```

Lo que sale de ahí:

1. **Sí**: los fake timers modernos de jest 29.7.0 **reemplazan** `process.hrtime.bigint`, igual que
   `Date.now` y `performance.now`. El brief acierta.
2. **No**: `duration` **no sale 0**. Sale **exactamente lo que el propio test haya avanzado**.
3. Por tanto el peligro no es un verde vacuo por casualidad: es que **la aserción se convierte en una
   tautología sobre el guion del propio test**. `expect(duration).toBeLessThan(100)` pasa a decir
   «el reloj que yo avancé 10 vale menos de 100». Verde perpetuo que no mide nada.
4. Existe salida (`doNotFake: ['hrtime','performance']`), pero devuelve el reloj de pared y con él el problema.

**Consecuencia de método** —y es el eje de este WP—: *un reloj falso no salva una aserción de
rendimiento*. Sólo sirve donde **el sujeto del test es el idioma de medida**, no la velocidad del
producto. Eso ocurre en **un** sitio de los ocho: `basic.test.ts`, cuyo `it` se llama literalmente
`should measure performance` y cuyo cometido declarado es verificar que el arnés sabe medir. Ahí el
reloj controlado es honesto y la cota se **aprieta a igualdad**:

```ts
expect(duration).toBe(10);   // antes: >= 10 y < 100
```

que es estrictamente más fuerte que el par que sustituye. En los otros siete, un reloj falso habría
sido maquillaje, así que la aserción se retira.

---

## 3 · La prueba: tres brazos, no uno

La CA pide 10 corridas idénticas por nombre. **Diez corridas idénticas, por sí solas, no prueban
nada**: eligiendo `--runInBand` o una máquina tranquila salen idénticas *sin haber tocado una sola
aserción*. Así que se ejecutaron **tres brazos**, todos con **workers en PARALELO** (los de jest por
defecto: **11** sobre 12 CPUs; sin `--runInBand`, que es justo lo que habría regalado el resultado).

| brazo | árbol | máquina | resultado |
| ----- | ----- | ------- | --------- |
| **A** (control) | **sin arreglar** (`c241c22`) | **cargada** (16 quemadores de CPU) | **6 de 10 corridas discrepantes** |
| **B** (tratamiento) | arreglado (`70a54b0`) | **la misma carga** | **10 de 10 idénticas** |
| **C** (CA) | arreglado (`70a54b0`) | tranquila | **10 de 10 idénticas** |

El brazo **A** es lo que le faltaba a la CA para poder fallar. Sin él, «10 corridas iguales» es una
afirmación sobre la máquina; con él, es una afirmación sobre la obra.

### 3.1 · Brazo A — árbol SIN ARREGLAR, cargado (el control)

Comando: `node scripts/rojos-jest.mjs --repetir 10 -- --coverage=false`, con los ficheros de test
devueltos a `c241c22` (`git checkout c241c22 -- tests/…`; **no** se usó `git stash`, prohibido) y
restaurados después (`git checkout HEAD -- tests/`, árbol limpio verificado).

```
corrida  1 | FALLA= 5 | extra sobre los 5 historicos: —
corrida  2 | FALLA= 5 | extra sobre los 5 historicos: —
corrida  3 | FALLA= 5 | extra sobre los 5 historicos: —
corrida  4 | FALLA= 5 | extra sobre los 5 historicos: —
corrida  5 | FALLA= 7 | extra: basic :: should measure performance + serviceStartup :: Service Initialization should initialize services within time threshold
corrida  6 | FALLA= 7 | extra: basic :: should measure performance + serviceStartup :: Service Initialization should initialize services within time threshold
corrida  7 | FALLA= 7 | extra: basic :: should measure performance + serviceStartup :: Resource Cleanup should cleanup resources efficiently
corrida  8 | FALLA= 6 | extra: basic :: should measure performance
corrida  9 | FALLA= 6 | extra: basic :: should measure performance
corrida 10 | FALLA= 7 | extra: serviceStartup :: Resource Cleanup should cleanup resources efficiently + serviceStartup :: Service Initialization should initialize services within time threshold

VEREDICTO: corridas discrepantes respecto de la 1: 5, 6, 7, 8, 9, 10
--- diff corrida 1 -> corrida 5 ---
+ FALLA tests/basic.test.ts :: Jest Setup Verification should measure performance
+ FALLA tests/performance/serviceStartup.test.ts :: Performance Tests Service Initialization should initialize services within time threshold
--- diff corrida 1 -> corrida 6 ---
+ FALLA tests/basic.test.ts :: Jest Setup Verification should measure performance
+ FALLA tests/performance/serviceStartup.test.ts :: Performance Tests Service Initialization should initialize services within time threshold
--- diff corrida 1 -> corrida 7 ---
+ FALLA tests/basic.test.ts :: Jest Setup Verification should measure performance
+ FALLA tests/performance/serviceStartup.test.ts :: Performance Tests Resource Cleanup should cleanup resources efficiently
--- diff corrida 1 -> corrida 8 ---
+ FALLA tests/basic.test.ts :: Jest Setup Verification should measure performance
--- diff corrida 1 -> corrida 9 ---
+ FALLA tests/basic.test.ts :: Jest Setup Verification should measure performance
--- diff corrida 1 -> corrida 10 ---
+ FALLA tests/performance/serviceStartup.test.ts :: Performance Tests Resource Cleanup should cleanup resources efficiently
+ FALLA tests/performance/serviceStartup.test.ts :: Performance Tests Service Initialization should initialize services within time threshold
```

Cardinales del brazo A: **5, 5, 5, 5, 7, 7, 7, 6, 6, 7**. La forma de la serie histórica (CITA,
WP-V23:1440 → `5,5,5,6,7,5,…`) se reproduce en este árbol y en esta máquina.

**Y lo importante no es el cardinal: son los nombres.** Los tres flapeadores son **exactamente**
las líneas censadas #2, #3 y #5. El censo no es una lista plausible: es la lista de los culpables,
con confesión.

### 3.2 · Brazo B — árbol ARREGLADO, LA MISMA carga

```
corrida  1..10 | FALLA= 5 | extra sobre los 5 historicos: —   (las diez)

VEREDICTO: las 10 corridas dieron el MISMO conjunto por nombre
```

Mismo generador de carga, misma máquina, mismo comando, mismos workers en paralelo. **Cero
discrepancias.** Duración del brazo: 6 min 33 s (10:00:47Z → 10:07:20Z).

### 3.3 · Brazo C — la CA, salida real y completa

Comando canónico, máquina tranquila, 2 min 44 s (09:45:55Z → 09:48:39Z), `VEREDICTO_EXIT=0`:

```
--- corrida 1/10 (jest exit=1) ---
FALLA tests/integration/managerFactory.test.ts :: ManagerFactory Integration Tests Manager Creation should create process manager
FALLA tests/integration/managerFactory.test.ts :: ManagerFactory Integration Tests Manager Creation should create webview manager
FALLA tests/integration/managerFactory.test.ts :: ManagerFactory Integration Tests Performance should handle concurrent manager creation
FALLA tests/integration/managerFactory.test.ts :: ManagerFactory Integration Tests Standard Managers Creation should create all standard managers
FALLA tests/integration/managerFactory.test.ts :: ManagerFactory Integration Tests Standard Managers Creation should have proper dependency chain in standard managers
OMITE tests/unit/mcp/clienteMcp.test.ts :: [pending] WP-V28 · contra runtime real (skip-honesto) skip-honesto: conectar/listar/leer contra mcp-launcher y linea-editor VIVOS de z-sdk — exige runtime real de la Ciudad arrancado (no disponible en este arnés unit); no se simula como verde
```

…y las corridas **2, 3, 4, 5, 6, 7, 8, 9 y 10** emitieron ese mismo bloque de seis líneas, byte a
byte. La salida íntegra de las diez es ese bloque repetido diez veces; el instrumento la compara él
mismo y cierra con:

```
VEREDICTO: las 10 corridas dieron el MISMO conjunto por nombre
```

### 3.4 · Cuál de las dos aserciones de `basic.test.ts` cae — el punto que el crítico disputaba

El brief exigía no dar por bueno el argumento del tick de Windows y tratar `:31` como fragilidad no
observada. **MEDIDO**: 12 corridas de `tests/basic.test.ts` sobre el fichero base, con la máquina
cargada:

```
corrida  1: should measure performance @ basic.test.ts:32:26  Expected: < 100 / Received: 109
corrida  2..12: verde

corridas con rojo: 1 de 12
```

Cae **`:32`**, la cota **superior**, con `Received: 109`. **Nunca `:31`.** Coincide con toda la
evidencia del repo (CITA, WP-V23:1383 y :1412) y con el encargo (`plan/BACKLOG.md:153`, que nombra
`duration < 100 ms`). Queda por tanto confirmado y firmado: **`:31` entra al censo como fragilidad
no observada**, no como flapeo probado, y así figura en la tabla de §1.3.

---

## 4 · El conjunto determinista, por NOMBRE y por CAUSA

Vive en **`scripts/rojos-jest.baseline.txt`**, que es lo que el gate compara. Aquí, en prosa:

**Cinco FALLA, todos en `tests/integration/managerFactory.test.ts`:**

1. `ManagerFactory Integration Tests Manager Creation should create process manager`
2. `ManagerFactory Integration Tests Manager Creation should create webview manager`
3. `ManagerFactory Integration Tests Performance should handle concurrent manager creation`
4. `ManagerFactory Integration Tests Standard Managers Creation should create all standard managers`
5. `ManagerFactory Integration Tests Standard Managers Creation should have proper dependency chain in standard managers`

**Una CAUSA para los cinco.** MEDIDO leyendo los cinco `failureMessages`: los cinco lanzan

```
TypeError: vscode.window.onDidCloseTerminal is not a function
    at new TerminalManager        (src/terminalManager.ts:24:23)
    at new ProcessManager         (src/processManager.ts:33:32)
    at Function.getInstance       (src/processManager.ts:38:39)
    at ManagerFactory.createManager(src/core/managerFactory.ts:71:42)   ← #1, #3, #4, #5
    at new WebViewManager         (src/webViewManager.ts:42:46) → :51:39
    at ManagerFactory.createManager(src/core/managerFactory.ts:75:42)   ← #2
```

**El origen NO es el mock compartido.** `tests/integration/managerFactory.test.ts:9-53` declara su
**propio** mock con `jest.mock('vscode', …)`, que **desplaza** al `moduleNameMapper` de
`jest.config.js:36-38`. Ese mock inline da un `window` con **cuatro** claves —
`showInformationMessage`, `showErrorMessage`, `createOutputChannel`, `createWebviewPanel` — y
ninguna es `onDidCloseTerminal` (verificado: `grep -n onDidCloseTerminal tests/integration/managerFactory.test.ts`
→ **0 aciertos**). El mock compartido `tests/mocks/vscode.mock.js` **sí** la expone, en `:83`.

**Para V48, que es quien los tiene que arreglar: tocar `vscode.mock.js` no mueve ni uno de los cinco.**
Lo que hay que ampliar es el mock inline de `:9-53`.

**Una OMITE declarada:** el `skip-honesto` de WP-V28 en `tests/unit/mcp/clienteMcp.test.ts`. Figura
en el conjunto **a propósito**: un `skip` es un rojo escondido salvo que esté firmado. Éste lo está.

### 4.1 · H-8 de WP-V23 queda RANCIA

`plan/REPORTES/WP-V23-config-intencional.md:616` dice:

> | H-8 | `tests/mocks/vscode.mock.js` no expone `onDidCloseTerminal` → los 5 rojos | §6 | **V48** |

Es falso por **dos** motivos independientes, ambos verificados hoy:

1. **Sí la expone**, en `tests/mocks/vscode.mock.js:83`, desde el commit `dfddc87`, cuya fecha real
   es **2026-07-31 19:33:29 +0200** (`git log -1 --format='%H %ad' --date=iso dfddc87`).
2. Aunque no la expusiera, **daría igual**: ese mock nunca llega a esa suite, desplazado por el
   `jest.mock('vscode', …)` inline.

**No he editado el reporte de V23** (es de otro escritor y está aceptado). Se declara aquí y el
orquestador enruta. La corrección de fondo, para quien reescriba H-8: *el origen es el mock inline de
`managerFactory.test.ts:9-53`, no `tests/mocks/vscode.mock.js`.*

---

## 5 · El gate nuevo

### 5.1 · Comando canónico

```bash
npx jest --coverage=false --json --outputFile="$TMP/jest.json"
node scripts/rojos-jest.mjs --check scripts/rojos-jest.baseline.txt "$TMP/jest.json"
```

Sale **0** si el conjunto obtenido es idéntico al declarado; **1** ante cualquier diferencia.
Sin `--runInBand`: workers en paralelo, que es la configuración que produce contención y por tanto
la única bajo la que el resultado significa algo.

Y el atajo para reproducir la CA de un tirón:

```bash
node scripts/rojos-jest.mjs --repetir 10 -- --coverage=false
```

### 5.2 · Por qué no se puede burlar

El instrumento (`scripts/rojos-jest.mjs`) no emite «los tests en rojo». Emite **cuatro clases**, y
cada una tapa una evasión de una línea:

| clase | qué recoge | qué evasión cierra |
| ----- | ---------- | ------------------ |
| `FALLA` | el rojo | — |
| `OMITE` | test saltado (`pending` / `todo` / `disabled`) | **`it.skip` de una línea borraría un rojo del conjunto y el gate aplaudiría** |
| `SUITE` | suite caída **sin producir una sola aserción** (no compila, no importa) | una suite apagada no produce fallos: sin esta clase el conjunto **encoge** y un apagón parece mejora |
| `SINNOMBRE` | la corrida fracasó y **ninguna** línea anterior lo explica | el caso **medido** de los umbrales de cobertura: jest sale 1 y en su JSON no queda ni rastro del motivo |

Y sobre todo: **se compara contra un baseline declarado, no contra un cardinal.** Por tanto

- un rojo nuevo → línea `+` → falla;
- un rojo que **desaparece** → línea `−` → **también falla**;
- un test renombrado → `+` y `−` → falla;
- un test **borrado** → línea `−` → falla.

**No hay dirección «buena» que pase sin firma.** Arreglar los cinco rojos *exige* borrar sus cinco
líneas del baseline en el mismo commit. Eso es la funcionalidad, no un efecto secundario: el cambio
de estado del mundo lo firma alguien, con nombre y en el diff.

Contra el pecado original —comparar cardinales— el conjunto es inmune por construcción: **dos rojos
distintos con el mismo cardinal dan diff**, y era exactamente eso lo que dejaba pasar un rojo real
como flapeo.

### 5.3 · El único hueco conocido, dicho en voz alta

`SINNOMBRE` **sólo** puede saltar cuando ninguna otra línea explica el fallo. MEDIDO: con
`collectCoverage: true` y los umbrales incumplidos, el JSON trae `success:false`,
`numFailedTests:0`, `numFailedTestSuites:0` **y nada más** — el motivo no está en ninguna parte del
JSON. Corolario incómodo: **si el gate se corriera CON cobertura y además hubiera algún rojo con
nombre, el fallo de umbral quedaría tapado por él.**

Por eso el comando canónico lleva `--coverage=false` y la cobertura se comprueba aparte. No es
eficiencia: es lo que impide que un rojo se lave dentro de otro. Está escrito en la cabecera del
propio instrumento para que no se pierda.

### 5.4 · Prueba de que el gate puede fallar (CA-5, con oráculo)

Un `diff` de dos salidas no prueba nada: un instrumento que imprime siempre la cadena vacía lo pasa.
Así que se le puso **oráculo**: se escribió a mano el conjunto esperado **antes de correr**, con un
fichero de rojos conocidos —dos llanos, tres parametrizados con `it.each`, un `it.skip` y un
`it.todo`, más un verde que no debe aparecer— y una segunda suite que no compila.

```
=== ORACULO: conjunto emitido ===
FALLA tests/zz_oraculo_v90.test.ts :: ORACULO V90 rojo llano dos
FALLA tests/zz_oraculo_v90.test.ts :: ORACULO V90 rojo llano uno
FALLA tests/zz_oraculo_v90.test.ts :: ORACULO V90 rojo parametrizado con «alfa»
FALLA tests/zz_oraculo_v90.test.ts :: ORACULO V90 rojo parametrizado con «beta»
FALLA tests/zz_oraculo_v90.test.ts :: ORACULO V90 rojo parametrizado con «gamma»
OMITE tests/zz_oraculo_v90.test.ts :: [pending] ORACULO V90 saltado a proposito
OMITE tests/zz_oraculo_v90.test.ts :: [todo] ORACULO V90 pendiente de escribir
=== DIFF contra el conjunto PREDICHO A MANO ANTES DE CORRER ===
(diff VACIO — el oraculo acierta)
```

Los tres `it.each` salen **ya interpolados** (`«alfa»`, `«beta»`, `«gamma»`), que era la exigencia
concreta de la CA. El verde no aparece. Las otras dos clases, también medidas:

```
=== CLASE SUITE ===
SUITE tests/zz_oraculo_rota.test.ts :: ● Test suite failed to run tests/zz_oraculo_rota.test.ts:2:36 - error TS2307: Cannot find module './zz_no_existe_en_absoluto'…

=== CLASE SINNOMBRE (todo verde, umbral de cobertura incumplido) ===
jest exit=1 · success= false · numFailedTests= 0 · numFailedTestSuites= 0
SINNOMBRE (toda la corrida) :: jest terminó en fallo y ningún test lo explica — revisar umbrales de cobertura, globalSetup o reporteros
```

Esa última es la demostración de que la clase hacía falta: **una corrida que jest da por fallida y
en la que el conjunto de rojos con nombre está vacío.** Sin `SINNOMBRE`, el instrumento habría
emitido cero líneas y el gate habría dicho que todo va bien.

Y el gate, contra el árbol real, en las dos direcciones:

```
$ node scripts/rojos-jest.mjs --check scripts/rojos-jest.baseline.txt $TMP/gate.json
conjunto de rojos IDENTICO al declarado          → EXIT=0

$ node scripts/rojos-jest.mjs --check scripts/rojos-jest.baseline.txt $TMP/or1.json
conjunto de rojos DISTINTO del declarado:
- FALLA …managerFactory… (×5)      ← los que faltan
- OMITE …clienteMcp…
+ FALLA …zz_oraculo… (×5)          ← los que sobran
+ OMITE …zz_oraculo… (×2)          → EXIT=1
```

Los ficheros del oráculo eran temporales y **están borrados**; el árbol quedó limpio (verificado
con `git status`).

---

## 6 · La cobertura: el rojo sin nombre, medido y declarado (no cerrado)

MEDIDO hoy, corrida completa con `collectCoverage: true`:

```
Jest: "global" coverage threshold for statements (85%) not met: 24.91%
Jest: "global" coverage threshold for branches   (75%) not met: 24.9%
Jest: "global" coverage threshold for lines      (85%) not met: 25.33%
Jest: "global" coverage threshold for functions  (80%) not met: 20.49%
Test Suites: 1 failed, 10 passed, 11 total
Tests:       5 failed, 1 skipped, 374 passed, 380 total
Time:        84.22 s
```

Cuatro rojos **sin nombre**. La cifra que circulaba (12,6 %, CITA de WP-V71:815) **no se sostiene
hoy**: lo medido es **24,91 %** de sentencias. Sea porque el árbol cambió o porque la cita ya era de
otra cosa, quien la reutilice debería remedirla.

Aparecen además **tres ficheros de los que jest no consigue recoger cobertura** por errores de tipos
(`src/launcher/LauncherCatalogClient.ts`, `src/mutation/LineaEditorClient.ts`,
`src/resources/McpResourceClient.ts`, todos `TS2353` sobre `capabilities`). No es de V90; se señala.

**V90 no cierra este rojo y no lo tapa: lo saca del gate de nombres y lo deja a la vista**, con sus
números, en este reporte y en la cabecera de `scripts/rojos-jest.baseline.txt`. Es rojo abierto y
documentado desde V13 (CITA: `WP-V13-poda.md:322`, `:636-637`).

**No he puesto `collectCoverage: false` en `jest.config.js`**, aunque el fichero está en mi alcance:
habría hecho desaparecer un rojo documentado de la corrida por defecto, que es exactamente el tipo
de mejora aparente que este WP existe para impedir.

---

## 7 · Lo que NO he tocado

### 7.1 · `jest.config.js`: intacto, y por qué (fue una decisión, no un olvido)

Está en mi alcance y lo dejo **sin cambiar**. Consideré cuatro cambios y los descarté con motivo:

| candidato | por qué NO |
| --------- | ---------- |
| `maxWorkers` explícito | tentador, pero **innecesario**: el brazo B demuestra determinismo con los workers **por defecto** (11) y bajo carga. Fijarlo habría sido atribuirle a la config un mérito que es de la obra — y habría cambiado la conducta en CI (`ubuntu-latest`, otro número de CPUs) sin evidencia que lo pidiera |
| `collectCoverage: false` | haría desaparecer un rojo documentado (§6) |
| `randomize: false` | ya es el valor por defecto en jest 29; escribirlo no cambia nada |
| `testSequencer` fijo | el secuenciador por defecto ordena según una caché de tiempos, así que **el reparto de ficheros entre workers varía entre corridas**. Es no-determinismo de *planificación*, real pero inocuo mientras los tests sean independientes — y los brazos B y C dicen que hoy lo son. Fijarlo sería tratar un síntoma que no se ha manifestado |

Se deja anotado el del secuenciador por si alguna vez aparece un test sensible al orden: sería el
primer sospechoso.

### 7.2 · Territorio ajeno — no-determinismo encontrado y **reportado, no arreglado**

`tests/unit/webview/webviewCsp.test.ts` y `tests/unit/webview/renderPointAnalysis.ts` son el motor de
un WP vivo. Están prohibidos para mí. Hay no-determinismo, y aquí queda, con las líneas comprobadas
abriendo el fichero:

| dónde | qué | por qué importa |
| ----- | --- | --------------- |
| `tests/unit/webview/renderPointAnalysis.ts:261` | `for (const name of fs.readdirSync(dir))` **sin ordenar** | el orden de `readdirSync` lo fija el sistema de ficheros, no el programa. Cambia entre plataformas (y puede cambiar en la misma) → el orden del censo de puntos de render es no-determinista **por construcción**. Hoy no tiñe ninguna aserción **porque las aserciones son sobre cardinales y conjuntos**, pero es una bomba con la espoleta puesta: bastaría una aserción sobre «el primero» o sobre una lista ordenada. Arreglo de una línea: `.sort()` |
| `tests/unit/webview/webviewCsp.test.ts:386`, `:387`, `:390` | `toBe(21)`, `toBe(25)`, `toBe(18)` | cardinales duros del censo. **Verde hoy**, MEDIDO en las 30 corridas de los tres brazos. Pero son exactamente la clase de aserción que este WP viene a desaconsejar: un cardinal no dice *cuál* falta cuando cae |
| `tests/unit/webview/webviewCsp.test.ts:257-262` | el `Map` `byName`, alimentado en el orden de `analysis.functions` | hereda el orden de `listTsFiles`, y por tanto el de `readdirSync` |

*(Nota de encaje con el brief: la cita del brief situaba el `Map byName` en `renderPointAnalysis.ts:257-262`;
está en `webviewCsp.test.ts:257-262`. Verificado abriendo ambos.)*

### 7.3 · Zonas prohibidas, respetadas

| fichero | estado |
| ------- | ------ |
| `package.json` | **intacto** — cadena serial de WPs. Propuesta en §8.1 |
| `.github/workflows/ci.yml` | **intacto** — owner ajeno. Observación en §8.3 |
| `plan/GOBIERNO-EJECUCION-F2.md` | **intacto** — entregable aceptado. Texto propuesto en §8.2, a la espera de tu visto bueno |
| `plan/REPORTES/WP-V23-config-intencional.md` | **intacto** — H-8 se declara rancia aquí (§4.1), no allí |
| `tests/mocks/vscode.mock.js` | **intacto** — y además §4 demuestra que tocarlo no habría servido de nada |
| `tests/integration/managerFactory.test.ts` | tocado **sólo** el `it` de `:303-310`. Los cinco rojos históricos, incluido `should handle concurrent manager creation` del mismo `describe`, **intactos** — lo prueban las **20 corridas del árbol arreglado** (brazos B y C), en las que el conjunto fue exactamente esos cinco, ni uno más ni uno menos; y el diff del commit, que en ese fichero es de **6 líneas borradas y 13 añadidas** (9 de ellas comentario), **todas dentro de ese único `it`** |

### 7.4 · Comprobaciones de método

- **`git stash`: no usado.** El brazo A se hizo con `git checkout <commit> -- <ficheros>` y restauración
  con `git checkout HEAD -- tests/`, verificando árbol limpio después. La pila de stash del repositorio
  no se tocó (hay más worktrees vivos).
- **`npx`**: sólo `npx jest`, declarado en `package.json:1234`. El instrumento **no usa `npx`**: resuelve
  el binario de jest con `createRequire` y lo lanza con el node actual.
- **Nada escrito fuera del worktree** salvo la carpeta de scratch de la sesión.
- **Regla 4 comprobada**: MEDIDO, correr la suite en este worktree **no** ensucia ningún fichero
  rastreado (`git status` vacío tras la corrida completa; `coverage/` y `node_modules/` están en
  `.gitignore`). El `--repetir` del instrumento escribe sus JSON temporales en `os.tmpdir()`, **fuera
  del árbol**, para no dejar contrabando ni aunque se interrumpa.
- **Ranura**: las corridas caras se lanzaron con `bash scripts/slot.sh run …`; la ranura quedó libre.

---

## 8 · Lo que pido, con el texto exacto

### 8.1 · `package.json` — script propuesto (NO escrito)

Zona prohibida por la cadena serial. Que lo aplique quien tenga el turno; texto listo para pegar
junto a `"test": "jest"` (`package.json:1195`):

```json
"test:rojos": "jest --coverage=false --json --outputFile=.jest-rojos.json && node scripts/rojos-jest.mjs --check scripts/rojos-jest.baseline.txt .jest-rojos.json",
"test:rojos:diez": "node scripts/rojos-jest.mjs --repetir 10 -- --coverage=false"
```

Aviso para quien lo aplique: `jest` sale con código **1** cuando hay rojos, así que con `&&` el
segundo tramo no correría. La forma robusta en npm es `;` o separar en dos scripts. Lo dejo dicho en
vez de dejarlo roto. Y `.jest-rojos.json` querría una línea en `.gitignore`.

### 8.2 · `plan/GOBIERNO-EJECUCION-F2.md` — texto propuesto, **pendiente de tu visto bueno**

Documento aceptado (V77/V78, cabecera `:7`). **No lo he tocado.** Dos sitios:

**(a) `:69` — fila del gate R7-V.** Hoy dice:

> | **R7-V** | F2-1 cimientos | arnés corre un test trivial de activación **en CI** · bootstrap troceado compila · CSP presente en los 4 paneles (verificada por test, no por lectura) |

Propuesto (añade la cláusula que faltaba; **no** toca las tres existentes):

> | **R7-V** | F2-1 cimientos | arnés corre un test trivial de activación **en CI** · bootstrap troceado compila · CSP presente en los 4 paneles (verificada por test, no por lectura) · **el conjunto de rojos de jest es IDÉNTICO POR NOMBRE al declarado en `scripts/rojos-jest.baseline.txt`, verificado con `node scripts/rojos-jest.mjs --check` sobre una corrida con `--coverage=false` y workers en paralelo. Nunca por cardinal: un cardinal no distingue un rojo nuevo de un rojo que se fue** |

**(b) `:99` — casilla de la checklist.** Hoy dice:

> ```
> [ ] los 5 jest rojos históricos en verde (V48) y guardando el mando
> ```

Propuesto:

> ```
> [ ] los 5 jest rojos históricos en verde (V48) y guardando el mando — al cerrarlos,
>     sus cinco líneas se borran de scripts/rojos-jest.baseline.txt en el MISMO commit;
>     el gate falla igual si sobran rojos que si faltan. Los cinco comparten una sola
>     causa: el mock inline de tests/integration/managerFactory.test.ts:9-53, que no
>     expone onDidCloseTerminal (NO es tests/mocks/vscode.mock.js, que sí la expone)
> ```

Los cinco nombres que se inscribirían los **he medido yo en este árbol**, hoy 2026-08-01, con
`npx jest --coverage=false --json` y `node scripts/rojos-jest.mjs`, treinta veces (§3). No se
inscribe ni un nombre que no haya salido de una corrida propia — que es justo lo que le pasó a H-8.

### 8.3 · Observación sobre CI (no es mi fichero)

`.github/workflows/ci.yml:69-71` corre `npm test --if-present` con **`continue-on-error: true`**: el
resultado de jest **no condiciona el job** (`runs-on: ubuntu-latest`, `:11`). Mientras siga así, el
gate de nombres **no** está vigilado por CI: es una herramienta local. Convertirlo en gate real es
decisión del owner de `ci.yml`; con `--check` ya hay un comando con código de salida honesto que
puede sustituir al paso blando cuando se quiera.

### 8.4 · Una libertad que me he tomado, y la deshago si dices

El alcance decía «`scripts/` — fichero **NUEVO** para el instrumento». He creado **dos**:
`scripts/rojos-jest.mjs` (el instrumento) y `scripts/rojos-jest.baseline.txt` (el conjunto declarado
que compara). Sin el segundo el gate es una propuesta, no una cosa que corra. No he tocado ningún
fichero existente de `scripts/`. **Si lo prefieres en otro sitio** (`plan/`, por ejemplo), es mover
un fichero de texto y cambiar una ruta.

### 8.5 · Cuatro nombres de test que ahora prometen de más

He **mantenido todos los nombres de test** a propósito, para no crear citas rancias: renombrar
`should initialize services within time threshold` dejaría desfasada `WP-V66:813`, que lo cita por
su nombre completo. Pero conviene decirlo: cuatro nombres han quedado más anchos que lo que su test
verifica, y cada uno lleva debajo un comentario `WP-V90` explicando exactamente qué se le quitó.

| nombre actual | nombre honesto propuesto | coste |
| ------------- | ------------------------ | ----- |
| `should initialize services within time threshold` | `should initialize services` | deja rancia `WP-V66:813` |
| `should cleanup resources efficiently` | `should cleanup all resources` | ninguno |
| `should process large datasets efficiently` | `should process large datasets` | ninguno |
| `should create managers within performance threshold` | `should create a manager through the factory` | ninguno |

Son verdes, así que renombrarlos **no** toca el baseline. Decides tú; yo no lo hago por mi cuenta.

---

## 9 · Auto-revisión contra las CA

| CA | veredicto | evidencia |
| -- | --------- | --------- |
| **CA-1** · las doce censadas, con tabla y veredicto | ✅ | §1.2 (los 22 aciertos clasificados) y §1.3 (las 12 con veredicto y con la columna «¿flapeó de facto?») |
| **CA-2** · (a) cero deltas de reloj en aserciones; (b) cada lectura de reloj justificada | ✅ | §1.4: de 9 lecturas a 4, justificadas una a una; cero aserciones sobre delta |
| **CA-3** · 10 corridas, mismo conjunto por nombre | ✅ | §3.3, salida real, `VEREDICTO_EXIT=0` |
| **CA-4** · veredicto de **obra** para las cuatro de montón | ✅ | las cuatro **borradas** (§1.3 #9-#12), no un párrafo. Dicho también lo que no puedo demostrar: ninguna se observó caer |
| **CA-5** · oráculo del instrumento, con `it.each` | ✅ | §5.4: conjunto **predicho a mano antes de correr**, diff vacío; interpolados incluidos; verde ausente; y las clases `SUITE` y `SINNOMBRE` medidas aparte |
| **CA-6** · gobierno, con visto bueno previo y nombres medidos | ⏳ | §8.2: texto exacto propuesto, **documento intacto**. Espera tu GO |
| **CA-7** · comando canónico escrito | ✅ | §5.1 |
| **CA-8** · la cadena completa en el reporte + H-8 rancia con fecha correcta | ✅ | §4 (cadena medida desde los `failureMessages`) y §4.1 (`dfddc87`, **2026-07-31 19:33:29 +0200**) |
| **CA-9** · las diez **en paralelo** | ✅ **y con control** | §3: 11 workers, sin `--runInBand`. Y el brazo A —árbol sin arreglar, misma máquina, misma carga— **discrepa en 6 de 10**, que es lo que hacía falta para que esta CA pudiera fallar |
| **CA-10** · territorio respetado | ✅ | §7.3, `git status` limpio, y los 5 rojos exactamente iguales en las **20 corridas del árbol arreglado** |

### 9.1 · Lo que este WP NO ha establecido

Para que nadie lo lea como más ancho de lo que es:

- **Nueve de las doce líneas no se vieron flapear**; se retiran por argumento (§1.3). Sólo `basic:32`,
  `serviceStartup:17` y `serviceStartup:85` cayeron delante de mí.
- **Las cuatro de montón nunca se observaron caer.** Ni aquí ni en ningún reporte previo.
- **Todo se midió en una sola máquina**, Windows, 12 CPUs. El gate corre en `ubuntu-latest`. Los
  nombres son estables entre plataformas por construcción (el instrumento normaliza rutas y ordena
  por unidad de código), pero **eso no lo he medido en ubuntu**.
- **No he tocado los cinco rojos** ni comprobado que la ampliación del mock inline los arregle: eso
  es de V48. Lo que dejo es la causa, medida, y el aviso de que `vscode.mock.js` es una pista falsa.
- **La cobertura sigue roja** y no la cierro (§6).
- **El no-determinismo de `readdirSync`** en el territorio del WP vecino sigue vivo: reportado, no
  arreglado (§7.2).
- **30 corridas no son una prueba de determinismo**, son 30 corridas. Lo que sí son es 30 más de las
  que tenía el gate anterior, y con el control del brazo A al lado.

---

## 10 · Ficheros de la obra

| fichero | qué |
| ------- | --- |
| `scripts/rojos-jest.mjs` | **nuevo** · el instrumento: JSON de jest → conjunto de rojos por nombre. Modos: emitir, `--check`, `--repetir N` |
| `scripts/rojos-jest.baseline.txt` | **nuevo** · el conjunto declarado, con la causa de los cinco |
| `tests/basic.test.ts` | censo #1, #2 (reloj controlado) · #9, #10 (borradas) |
| `tests/performance/serviceStartup.test.ts` | censo #3, #4, #5, #6, #11 (borradas) · dos `Math.random()` retirados |
| `tests/unit/core/aiAssistantService.test.ts` | censo #7, #12 (borradas) · rama muerta `if (global.gc)` retirada |
| `tests/integration/managerFactory.test.ts` | censo #8 (borrada) · **sólo** el `it` de `:303-310` |
| `tests/unit/core/analyticsService.test.ts` | marca explícita en `Performance Tracking`; **sin cambio de conducta** |
| `tests/setup.ts` | marca explícita sobre `measurePerformance`; **sin cambio de conducta** — es el fichero que carga toda la suite |
