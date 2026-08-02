# WP-V90 · P0 — la suite de jest se vuelve determinista y el gate pasa a comparar NOMBRES

| dato | valor |
| ---- | ----- |
| Carril | **V** · Aleph-0 (ℵ₀) |
| Encargo | `plan/BACKLOG.md:153` |
| Rama | `wp/v90-jest-determinista` · base `c241c22` |
| Obra | `70a54b0` (primera entrega) · `ccf1d08` (reporte) · **segunda vuelta tras devolución** |
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

## 0.bis · La devolución: qué cayó, y por qué tenía toda la razón

La primera entrega pasó el censo, los tres brazos y la reasignación del encargo ajeno. **Cayó el
gate, que era el blanco principal.** Los tres bloqueantes eran la misma cosa dicha de tres maneras:

> **el instrumento se fiaba de su propia salida sin comprobar que la salida fuese real.**

Que es, literalmente, la pregunta que este WP existe para contestar. Lo escribo sin adornos porque el
detalle importa más que la vergüenza:

| # | qué dejaba pasar | estado |
| - | ---------------- | ------ |
| **B1** | `diff()` comparaba **conjuntos sin multiplicidad**: un rojo NUEVO con el mismo nombre que uno ya declarado pasaba invisible | **cerrado** · §5.5 |
| **B2** | `--repetir` proclamaba «mismo conjunto» cuando jest **no había ejecutado ni un test** | **cerrado** · §5.5 |
| **B3** | `--check` leía el JSON **sin prueba de frescura**: un JSON bueno anterior bendecía una corrida que había reventado | **cerrado** · §5.5 |
| **B4** | dije «cuatro nombres prometen de más». Eran **nueve** | **corregido** · §8.5 |

**B1 es el que duele, y hay que decirlo entero**: en ese vector concreto **el cardinal que este WP
vino a abolir era estrictamente más fuerte que el conjunto que puse en su lugar**. El conteo pasaba
de 5 a 6 y lo cazaba; mi gate decía «IDÉNTICO» y salía 0. Un WP cuya tesis es «un cardinal es ruido»
entregó un sustituto que, para esa familia de fallos, era ruido peor. Está medido y reproducido en
§5.5 antes y después del arreglo.

**B4 tiene su propia moraleja, y es la mejor del WP**: conté mal un cardinal, en el reporte de un WP
cuyo pecado original declarado es un cardinal mal contado en un censo sobre cardinales. Lo llamativo
no es el error: es que **el gate que construí habría cazado ese error si se lo hubiera aplicado a mi
propio reporte**. Un conjunto declarado, comparado por diff, no se equivoca al contar; la prosa sí.

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

**Una CUARTA clase de reloj que el barrido original no nombraba** (señalada en la devolución).
Existe una vía más de dependencia temporal: **un temporizador de PRODUCTO con plazo, aseverado por su
efecto**. Barrido dedicado (`timeoutMs|timeout:|plazo|AbortSignal|setTimeout\(` sobre `tests/`):
**una sola instancia**, `tests/unit/mcp/clienteMcp.test.ts:210-226` — un cliente MCP construido con
`{ timeoutMs: 100 }` (`:219`) contra un servidor que jamás responde, y la aserción es
`expect(res.reason).toContain('100ms')` (`:225`).

**El cardinal DOCE resiste**, y por una razón de clase, no de conveniencia: ahí no se asevera sobre
un delta medido, sino sobre el **error tipado** que produce un plazo configurado. El servidor nunca
responde, así que el temporizador vence siempre: es robusto por construcción, no por suerte. Pero es
reloj de pared vivo en la suite y queda **declarado**, que es lo que faltaba.

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
| 3 | `tests/performance/serviceStartup.test.ts:17` | `expect(duration).toBeLessThan(100)` | **FICHERO BORRADO** (§7.5) | **SÍ**, MEDIDO (§3.3) |
| 4 | `tests/performance/serviceStartup.test.ts:54` | `expect(duration).toBeLessThan(500)` | **FICHERO BORRADO** | no observado |
| 5 | `tests/performance/serviceStartup.test.ts:85` | `expect(duration).toBeLessThan(50)` | **FICHERO BORRADO** | **SÍ**, MEDIDO (§3.3) |
| 6 | `tests/performance/serviceStartup.test.ts:107` | `expect(duration).toBeLessThan(100)` | **FICHERO BORRADO** | no observado |
| 7 | `tests/unit/core/aiAssistantService.test.ts:233` | `expect(duration).toBeLessThan(500)` | **BORRADA** | no observado |
| 8 | `tests/integration/managerFactory.test.ts:309` | `expect(creationTime).toBeLessThan(100)` | **BORRADA** | no observado |
| 9 | `tests/basic.test.ts:131` | `expect(memoryGrowth).toBeGreaterThan(0)` | **BORRADA** | no observado |
| 10 | `tests/basic.test.ts:132` | `expect(memoryGrowth).toBeLessThan(10 MB)` | **BORRADA** | no observado |
| 11 | `tests/performance/serviceStartup.test.ts:37` | `expect(memoryGrowth).toBeLessThan(5 MB)` | **FICHERO BORRADO** | no observado |
| 12 | `tests/unit/core/aiAssistantService.test.ts:287` | `expect(memoryIncrease).toBeLessThan(10 MB)` | **BORRADA** | no observado |

*(Las cinco de `serviceStartup.test.ts` se retiraron primero una a una; en la segunda vuelta el
fichero entero se ha borrado — §7.5. El veredicto de cada línea no cambia, cambia el radio.)*

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
| a | `serviceStartup.test.ts:46` | `setTimeout(resolve, Math.random() * 10)` | primero → `i % 5`; ahora **fichero borrado** |
| b | `serviceStartup.test.ts:94` | `value: Math.random()` en 10.000 elementos | primero → rampa `i / 10000`; ahora **fichero borrado** |

La (b) importa más de lo que parece: con valores aleatorios, **cuántos** elementos pasaban el filtro
cambiaba en cada corrida, y la única aserción de contenido (`result.forEach(...)`) no aseveraba
**nada** si el filtro salía vacío. Con la rampa el cardinal es conocido (`toHaveLength(100)`,
`result[0].id === 5001`) y la aserción por fin muerde.

### 1.4 · Cómo queda el árbol (CA-2, MEDIDO tras la obra)

`grep -rnE 'Date\.now|process\.hrtime|performance\.now' tests/` pasa de **9** lecturas de reloj a
**2**, y las dos son el mismo reloj **controlado**:

| hoy | dónde | por qué se queda |
| --- | ----- | ---------------- |
| `basic.test.ts:48`, `:54` | `Date.now()` | bajo `jest.useFakeTimers()`: reloj **controlado**, no de pared |

En la primera entrega quedaban además `setup.ts:136` y `:138` (`process.hrtime.bigint()` dentro de
`measurePerformance`), justificadas con un «ninguna aserción la mira». Al borrar
`serviceStartup.test.ts` ese helper se quedó **sin un solo consumidor**
(`grep -rn measurePerformance tests/ src/`), así que se ha ido con él (§7.5). Resultado:

> **`tests/` no contiene ni una sola lectura de reloj de PARED.** Las dos que quedan son de un reloj
> falso que el propio test gobierna.

Y: **cero** `process.memoryUsage()`, **cero** `Math.random()` (los aciertos residuales del grep son
mis propios comentarios citando lo que se borró). Cero aserciones cuyo operando sea un delta de reloj
de pared o de montón.

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

### 3.3.bis · Re-medido tras la devolución (el árbol cambió, la evidencia se rehace)

Borrar `serviceStartup.test.ts` y renombrar cuatro tests cambia la suite: **375 tests en 10 suites**,
antes 380 en 11. La evidencia anterior ya no cubre este árbol, así que las diez corridas se
**repitieron enteras** sobre el árbol final, con workers en paralelo (10:56:56Z → 10:59:21Z):

```
--- corrida 1/10 (jest exit=1, 375 tests ejecutados) ---
FALLA tests/integration/managerFactory.test.ts :: ManagerFactory Integration Tests Manager Creation should create process manager
FALLA tests/integration/managerFactory.test.ts :: ManagerFactory Integration Tests Manager Creation should create webview manager
FALLA tests/integration/managerFactory.test.ts :: ManagerFactory Integration Tests Performance should handle concurrent manager creation
FALLA tests/integration/managerFactory.test.ts :: ManagerFactory Integration Tests Standard Managers Creation should create all standard managers
FALLA tests/integration/managerFactory.test.ts :: ManagerFactory Integration Tests Standard Managers Creation should have proper dependency chain in standard managers
OMITE tests/unit/mcp/clienteMcp.test.ts :: [pending] WP-V28 · contra runtime real (skip-honesto) skip-honesto: conectar/listar/leer contra mcp-launcher y linea-editor VIVOS de z-sdk — exige runtime real de la Ciudad arrancado (no disponible en este arnés unit); no se simula como verde
…corridas 2 a 10, el mismo bloque de seis líneas…

VEREDICTO: las 10 corridas ejecutaron 375 tests y dieron el MISMO conjunto por nombre
```

Nótese el veredicto nuevo: **dice cuántos tests se ejecutaron**. Ésa es la cicatriz de B2 — antes
podía proclamar «mismo conjunto» sobre diez corridas que no habían ejecutado nada.

**El conjunto declarado no cambia**, y era la predicción: los cinco tests borrados y los cuatro
renombrados estaban todos en verde, y lo que el baseline declara son rojos y omisiones.

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
node scripts/rojos-jest.mjs --gate
```

Eso es todo. **El instrumento corre jest él mismo**, a un fichero con nonce en `os.tmpdir()` que
escribe y borra, y luego compara. Se hace así por B3: mientras el JSON lo escribiera otro y el
instrumento se limitara a leerlo de una ruta convenida, siempre existía la corrida que revienta sin
escribir y deja que el **JSON de la vez anterior** pase por bueno. Un gate que no controla su propia
medida no es un gate. Sale **0** si el conjunto coincide con el declarado, **1** si difiere, **2** si
no hubo medida válida.

La forma en dos pasos sigue existiendo para quien ya tenga un JSON, pero **ahora exige pruebas**:

```bash
npx jest --coverage=false --json --outputFile="$TMP/jest.json"
node scripts/rojos-jest.mjs --check scripts/rojos-jest.baseline.txt "$TMP/jest.json"
```

y ese `--check` rechaza (con salida **2**, no con un veredicto) un informe que: no ejecutó ni un test,
trae `coverageMap`, o arrancó hace más de 900 s. Cada rechazo es uno de los tres bloqueantes.

Sin `--runInBand`: workers en paralelo, que es la configuración que produce contención y por tanto la
única bajo la que el resultado significa algo. El atajo para reproducir la CA de un tirón:

```bash
node scripts/rojos-jest.mjs --repetir 10 -- --coverage=false
```

que ahora **se niega** si alguien le cuela `--runInBand`, `-i` o `--maxWorkers=1` (M6): ese atajo
convertía la CA en un trámite, y es justo el que declaré haber evitado a mano.

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
como flapeo. Desde la devolución también es inmune al caso contrario: **dos rojos con el mismo
nombre ya no colapsan en uno** (§5.5, B1).

#### 5.2.bis · Y la frase que faltaba: **un rojo nuevo se legaliza con una línea**

Lo anterior describe una sola dirección, y por eso se quedaba corto. La otra, dicha entera:

> **Cualquiera puede legalizar un rojo nuevo añadiendo su línea al baseline. Una línea. Y nada en
> este mecanismo le obliga a arreglarlo nunca.**

Está medido y **es diseño, no descuido**: la firma va en el diff, y un humano tiene que ver pasar esa
línea en una revisión. Pero un mecanismo cuya única defensa es «alguien mirará el diff» tiene que
decirlo, porque hoy:

- `scripts/rojos-jest.baseline.txt` es **un `.txt` sin *checksum*** — nada ata su contenido a una revisión;
- **no tiene dueño por línea**: ninguna línea dice quién la metió, cuándo, ni con qué justificación;
- **no hay gate en CI** que lo vigile (`ci.yml:70` lleva `continue-on-error: true`, §8.3), así que
  añadir una línea no dispara ninguna alarma automática.

O sea: el gate convierte «el mundo empeoró en silencio» en «alguien firmó que el mundo empeoró». Eso
es una mejora real y es lo que se pedía; **no** es una garantía de que el mundo no empeore. Quien
quiera lo segundo tiene tres palancas, ninguna en el alcance de V90 y las tres baratas: fecha y WP
obligatorios por línea, revisión humana obligatoria sobre el fichero (`CODEOWNERS`), y quitar el
`continue-on-error` de CI.

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

### 5.5 · Los cuatro vectores de la devolución: reproducidos, y cerrados

Ninguno se arregló «por si acaso»: primero se reprodujo con jest de verdad, luego se arregló, luego
se volvió a disparar el mismo vector.

**B1 · multiplicidad.** Dos `it` con el mismo nombre, ambos en rojo, y un baseline que declara uno:

```
ANTES                                                    DESPUÉS
Tests: 2 failed, 2 total                                 (mismo JSON, mismo baseline)
conjunto de rojos IDENTICO al declarado                  conjunto de rojos DISTINTO del declarado:
GATE_EXIT=0     ← el rojo nuevo pasa invisible           + FALLA …VECTOR B1 rojo clonado  [sobran 1 de 2]
                                                         GATE_EXIT=1
```

Aquí está la humillación útil: **el cardinal iba de 1 a 2 y lo cazaba; mi conjunto no.** `diff()`
construía `Set`. Ahora cuenta multiplicidades y las anota (`[sobran 1 de 2]`, `[faltan 1 de 2]`).

**B2 · ejecución efectiva.** `--repetir 3` con una config inexistente:

```
ANTES  → 3× "jest no llegó a escribir el JSON (code=1)"
       → "las 3 corridas dieron el MISMO conjunto por nombre"    EXIT=0
DESPUÉS→ rojos-jest: corrida 1/3: jest no llegó a escribir el JSON (exit=1).
           N fallos catastróficos reproducibles NO son determinismo: son N veces sin medir.
                                                                  EXIT=2
```

Tres catástrofes idénticas se presentaban como determinismo demostrado — con el comando que yo
proponía publicar como evidencia de la CA principal. Ahora una corrida sin JSON, o con
`numTotalTests === 0`, **corta**; y el veredicto declara cuántos tests se ejecutaron.

**B3 · frescura.** Un JSON bueno anterior en la ruta esperada:

```
DESPUÉS→ rojos-jest: el informe es VIEJO: arrancó hace 3894 s (tope 900 s) — …/gate.json
           Un JSON rancio en la ruta esperada es exactamente como una corrida que revienta sin
           escribir pasa por verde.                               EXIT=2
```

Se usa `startTime`, la marca que jest pone al arrancar: es la corrida hablando de sí misma y **no la
mueve un `touch`**. Y el modo `--gate` elimina la clase entera, porque escribe él el fichero.

**M7 · cobertura.** El dato estaba en el JSON desde el principio y el instrumento no lo miraba:

```
DESPUÉS→ rojos-jest: el informe trae cobertura (coverageMap): …/baseline.json
           Con cobertura activa, un fallo de umbral NO deja rastro con nombre en el JSON y queda
           tapado por cualquier rojo con nombre.                  EXIT=2
```

**M6 · paralelismo.** `--repetir` prometía paralelo y no lo imponía:

```
DESPUÉS→ rojos-jest: estos argumentos serializan jest: --runInBand
           `--repetir` existe para medir determinismo BAJO CONTENCIÓN. En serie la suite sale
           idéntica sin que nadie haya arreglado nada.            EXIT=2
```

Con `--permitir-serial` se puede forzar, pero entonces la salida lo grita y el veredicto sale **1**:
una medida en serie no se convierte en evidencia por haberla pedido.

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

### 7.5 · Lo que SÍ he borrado en la segunda vuelta, y por qué (M3)

**`tests/performance/serviceStartup.test.ts` ⛔ *(cita rancia: fichero borrado entero por V90 (`c989de8`, §7.5). Se conserva porque era cierta al escribirse)* — fichero entero, cinco tests.**

La devolución señaló que mi frase «cada test conserva la aserción funcional que sí podía demostrar»
era **más ancha que la evidencia**, y tenía razón: ahí no había función de producto que demostrar.
MEDIDO:

```
$ grep -nE "^import|require\(" tests/performance/serviceStartup.test.ts
5:import { measurePerformance } from '../setup';
$ (imports desde src/) → CERO
```

Un solo import, y del arnés. Tras retirar las cinco aserciones de reloj y montón, los cinco tests
aseveraban **únicamente sobre datos que el propio test construía**: que `setTimeout` resuelve, que
`Promise.all` resuelve, que `Array.filter` filtra. Eso no prueba nada del producto: prueba Node.
Cinco verdes perpetuos en un fichero titulado «Performance tests for critical extension operations».

Y un verde que no mide nada es peor que un rojo — que es, palabra por palabra, el argumento con el
que este mismo reporte rechazó tapar las aserciones con relojes falsos (§2). Aplicármelo a mí mismo
era lo coherente. **Borrado.**

**`measurePerformance` en `tests/setup.ts` — se va con él.** Era su único consumidor
(`grep -rn measurePerformance tests/ src/`). Sin él quedaba código muerto, pero de una clase
peculiar: un cronómetro de reloj de PARED ofrecido por el fichero que carga toda la suite. El arma
cargada que este WP existe para descargar, dejada sobre la mesa. Es el cambio de mayor radio que he
hecho en `setup.ts` y **es un solo hunk, trivial de revertir** si algún worktree vivo lo necesitaba;
lo señalo aquí precisamente para que se vea antes de fusionar.

**Consecuencias, dichas y no escondidas:**

- La suite pasa de **380 tests / 11 suites** a **375 / 10**. Cualquier reporte que cite «374 passed»
  o «380 total» queda rancio — y es la mejor ilustración posible de por qué el gate **no** compara
  cardinales: ninguno de esos números estaba en el baseline, y el baseline **no ha cambiado**.
- **`WP-V66:813` queda RANCIA**: cita `Performance Tests › Service Initialization › should initialize
  services within time threshold` (`tests/performance/serviceStartup.test.ts:9` ⛔ *(cita rancia: fichero borrado entero por V90 (`c989de8`, §7.5). Se conserva porque era cierta al escribirse)*), y ese test ya no
  existe. No he tocado ese reporte (aceptado, otro escritor); lo declaro aquí y enrutas tú.
- `WP-V23:1375` («`git diff --quiet … → IDÉNTICO a la base`») y `WP-V23:1385-1386` (la tabla de
  umbrales) hablan de un fichero que ya no está. Misma situación.
- **`WP-V71:523`** citaba ya ese mismo `grep` de imports. O sea: que este fichero no tocaba producto
  **estaba documentado desde V71** y nadie sacó la conclusión. Ahora está sacada.

---

## 8 · Lo que pido, con el texto exacto

### 8.1 · `package.json` — script propuesto (NO escrito)

Zona prohibida por la cadena serial. Que lo aplique quien tenga el turno; texto listo para pegar
junto a `"test": "jest"` (`package.json:1195`):

```json
"test:rojos": "node scripts/rojos-jest.mjs --gate",
"test:rojos:diez": "node scripts/rojos-jest.mjs --repetir 10 -- --coverage=false"
```

**Esta propuesta ha cambiado respecto de la primera entrega, y el motivo es un bloqueante.** Antes
proponía encadenar `jest … && node scripts/rojos-jest.mjs --check …`, y advertía de que `jest` sale
**1** cuando hay rojos, así que el `&&` cortaría y había que usar `;`. Ese `;` era **exactamente el
vector de B3**: con `;`, una corrida que revienta sin escribir el JSON deja que el fichero de la vez
anterior pase por bueno. La solución no era elegir mejor el operador: era que **el instrumento corra
jest él mismo**. Con `--gate` no hay encadenado, no hay fichero intermedio en el árbol, y no hace
falta una línea en `.gitignore`.

### 8.2 · `plan/GOBIERNO-EJECUCION-F2.md` — texto propuesto, **pendiente de tu visto bueno**

Documento aceptado (V77/V78, cabecera `:7`). **No lo he tocado.** Dos sitios:

**(a) `:69` — fila del gate R7-V.** Hoy dice:

> | **R7-V** | F2-1 cimientos | arnés corre un test trivial de activación **en CI** · bootstrap troceado compila · CSP presente en los 4 paneles (verificada por test, no por lectura) |

Propuesto (añade la cláusula que faltaba; **no** toca las tres existentes):

> | **R7-V** | F2-1 cimientos | arnés corre un test trivial de activación **en CI** · bootstrap troceado compila · CSP presente en los 4 paneles (verificada por test, no por lectura) · **el conjunto de rojos de jest es IDÉNTICO POR NOMBRE al declarado en `scripts/rojos-jest.baseline.txt`, verificado con `node scripts/rojos-jest.mjs --gate` (que corre jest él mismo, con workers en paralelo y sin cobertura, y rechaza toda corrida que no ejecutara tests). Nunca por cardinal: un cardinal no distingue un rojo nuevo de un rojo que se fue — y un conjunto sin multiplicidad tampoco distingue dos rojos homónimos de uno** |

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

### 8.5 · Los NUEVE nombres que prometían de más — B4, corregido y resuelto

Escribí «cuatro». **Eran nueve.** Un cardinal mal contado, en el reporte del WP que existe porque
alguien contó mal un cardinal en un censo sobre cardinales. No lo escondo: lo dejo como la mejor
prueba de la tesis. Un conjunto declarado y comparado por diff no se equivoca al contar; la prosa sí.

Aquí están los nueve, **todos**, y qué se ha hecho con cada uno. Ya no es una propuesta: está hecho.

| # | test (nombre original) | fichero | qué perdió | resolución |
| - | ---------------------- | ------- | ---------- | ---------- |
| 1 | `should initialize services within time threshold` | serviceStartup | duración | **fichero borrado** (§7.5) |
| 2 | `should not cause significant memory leaks` | serviceStartup | montón | **fichero borrado** |
| 3 | `should handle concurrent requests efficiently` | serviceStartup | duración | **fichero borrado** |
| 4 | `should cleanup resources efficiently` | serviceStartup | duración | **fichero borrado** |
| 5 | `should process large datasets efficiently` | serviceStartup | duración | **fichero borrado** |
| 6 | `should validate memory usage patterns` | basic | montón ×2 | **renombrado** → `should build and release a large object graph` |
| 7 | `should process requests within performance threshold` | aiAssistantService | duración | **renombrado** → `should resolve a request with success status` |
| 8 | `should handle large number of requests without memory leaks` | aiAssistantService | montón | **renombrado** → `should resolve fifty concurrent requests` |
| 9 | `should create managers within performance threshold` | managerFactory | duración | **renombrado** → `should create a manager through the factory` |

Los nueve eran verdes, así que **el baseline no se mueve** — verificado con las diez corridas de
§3.3.bis. En el renombrado #9 hubo que tener cuidado: se renombra el `it`, **jamás** el
`describe('Performance')` que lo contiene, porque ese `describe` forma parte del nombre completo de
uno de los cinco rojos declarados (`…Performance should handle concurrent manager creation`).
Tocarlo habría movido el baseline sin que nadie lo pidiera. Queda dicho en el propio fichero.

**El décimo, que no está en la lista y merece párrafo (M4):** `Jest Setup Verification › should
measure performance` **conserva su nombre**, y el nombre promete de más. Bajo reloj controlado ese
test verifica el *idioma* de medida y ya no mide nada del mundo: es, en rigor, la misma tautología
que §2 reprocha en otros sitios. Se mantiene porque **`WP-V23:1346-1354` lo cita literalmente** como
el flapeador histórico del mundo, y renombrarlo rompería esa cita en un reporte aceptado. Prefiero un
nombre ancho **documentado en el propio fichero** a una cita rota en silencio — pero es una decisión
discutible y la dejo señalada, no escondida en un comentario.

---

## 9 · Auto-revisión contra las CA

| CA | veredicto | evidencia |
| -- | --------- | --------- |
| **CA-1** · las doce censadas, con tabla y veredicto | ✅ | §1.2 (los 22 aciertos clasificados) y §1.3 (las 12 con veredicto y con la columna «¿flapeó de facto?») |
| **CA-2** · (a) cero deltas de reloj en aserciones; (b) cada lectura de reloj justificada | ✅ | §1.4: de 9 lecturas a **2**, y las dos de reloj controlado. **Cero** lecturas de reloj de pared en `tests/`. Y la cuarta clase (temporizador de producto) declarada en §1.1 |
| **CA-3** · 10 corridas, mismo conjunto por nombre | ✅ | §3.3 y, sobre el árbol final, §3.3.bis: `375 tests ejecutados`, `VEREDICTO_EXIT=0` |
| **CA-4** · veredicto de **obra** para las cuatro de montón | ✅ | las cuatro **borradas** (§1.3 #9-#12), no un párrafo. Dicho también lo que no puedo demostrar: ninguna se observó caer |
| **CA-5** · oráculo del instrumento, con `it.each` | ✅ | §5.4: conjunto **predicho a mano antes de correr**, diff vacío; interpolados incluidos; verde ausente; `SUITE` y `SINNOMBRE` medidas aparte; y §5.5, los cuatro vectores de la devolución reproducidos antes y después |
| **CA-6** · gobierno, con visto bueno previo y nombres medidos | ⏳ | §8.2: texto exacto propuesto, **documento intacto**. Espera tu GO |
| **CA-7** · comando canónico escrito | ✅ | §5.1 — ahora `--gate`, que corre jest él mismo (cierra B3 por construcción) |
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
- **30 corridas no son una prueba de determinismo**, son 30 corridas (40 contando las diez de
  §3.3.bis sobre el árbol final). Lo que sí son es 40 más de las que tenía el gate anterior, y con el
  control del brazo A al lado.
- **El baseline se puede engordar con una línea y nadie lo impide** (§5.2.bis). El gate garantiza
  *firma*, no *mejora*. Es diseño, pero es un límite y ahora está escrito.
- **Los brazos A y B se midieron sobre el árbol de la primera entrega**, que aún tenía
  `serviceStartup.test.ts`. El árbol final se re-midió (§3.3.bis, 10/10) pero **sin el generador de
  carga**: no he vuelto a correr el brazo B contra el árbol final. Lo que sostiene el resultado bajo
  carga sigue siendo la medida de la primera entrega, y las líneas responsables del flapeo ya no
  existen — pero la distinción es real y la dejo dicha.
- **El instrumento no se autocomprueba en CI.** Sus cuatro clases y sus tres guardas están probadas
  a mano en §5.4 y §5.5; no hay un test que las vigile de aquí en adelante. Un `rojos-jest.test.ts`
  sería lo suyo, y no está en el alcance de V90.

---

## 10 · Ficheros de la obra

| fichero | qué |
| ------- | --- |
| `scripts/rojos-jest.mjs` | **nuevo** · el instrumento. Modos: emitir, `--gate` (recomendado: corre jest él mismo), `--check`, `--repetir N`. Diff de **multiconjuntos**; guardas de ejecución efectiva, frescura, cobertura y paralelismo |
| `scripts/rojos-jest.baseline.txt` | **nuevo** · el conjunto declarado, con la causa de los cinco |
| `tests/basic.test.ts` | censo #1, #2 (reloj controlado) · #9, #10 (borradas) · un test renombrado (B4 #6) |
| `tests/performance/serviceStartup.test.ts` | **BORRADO ENTERO** (§7.5) · contenía el censo #3, #4, #5, #6, #11 y los dos `Math.random()`; cero imports de producto |
| `tests/unit/core/aiAssistantService.test.ts` | censo #7, #12 (borradas) · rama muerta `if (global.gc)` retirada · dos tests renombrados (B4 #7, #8) |
| `tests/integration/managerFactory.test.ts` | censo #8 (borrada) · un test renombrado (B4 #9) · **sólo** el `it` de `:303-310`; el `describe` NO se toca |
| `tests/unit/core/analyticsService.test.ts` | marca explícita en `Performance Tracking`; **sin cambio de conducta** |
| `tests/setup.ts` | **`measurePerformance` eliminado** al quedarse sin consumidor (§7.5) — es el cambio de mayor radio del WP y es un solo hunk, reversible |
