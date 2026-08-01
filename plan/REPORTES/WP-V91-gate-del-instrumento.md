# WP-V91 · P1 — el instrumento que vigila la suite pasa a tener quien lo vigile a él

| dato | valor |
| ---- | ----- |
| Carril | **V** · Aleph-0 (ℵ₀) |
| Encargo | `plan/BACKLOG.md:105` |
| Rama | `wp/v91-gate-del-instrumento` · base `629d502` |
| Obra | `b8f341c` |
| Árbol de medida | `C:/S_LAB/wt/v-v91` · Windows 11 · 12 CPUs |
| Herramienta | node v22.21.1 · jest 29.7.0 · ts-jest 29.2.5 |
| Fecha de todas las medidas | **2026-08-01** |

---

## 0 · Qué es de fiar aquí y qué no

Todo lo marcado **MEDIDO** se ejecutó en este árbol y su salida está pegada. Lo marcado **CITA**
viene de otro reporte y no se ha vuelto a medir. Las citas `fichero:línea` se comprobaron abriendo
el fichero.

Una advertencia sobre el alcance de este WP, por delante de todo lo demás: **la suite que entrego
prueba el instrumento, no el producto.** Está hecha así a propósito y el precio está en §5.

---

## 1 · El resumen en una tabla

`scripts/tests/rojos-jest.test.ts` — **28 tests, 16 s**, corre con `npm test` como una suite más.

| lo que había que cubrir | test(s) | mutación que lo mata | ¿muere? |
| ----------------------- | ------- | -------------------- | ------- |
| clase **FALLA** | `FALLA · el rojo sale con su nombre completo…` | se borra el `push('FALLA …')` | ✅ 12 rojos |
| clase **OMITE** | `OMITE · skip y todo entran al conjunto…` | `t.status !== 'passed'` → `false` | ✅ 5 rojos |
| clase **SUITE** | `SUITE · una suite que muere…` + real | `suite.status === 'failed' && fallidas === 0` → `false` | ✅ 3 rojos |
| clase **SINNOMBRE** | `SINNOMBRE · sin esta clase…` + real | `informe.success === false && !explicado` → `false` | ✅ 2 rojos |
| guarda **multiplicidad** | `GUARDA 1` + real | `contar()` devuelto a semántica de `Set` | ✅ 2 rojos |
| guarda **ejecución efectiva** | `GUARDA 2` + real | `numTotalTests < 1` → `false` | ✅ 2 rojos |
| guarda **frescura** (rancio) | `GUARDA 3` | `edad > maxSeg` → `false` | ✅ 3 rojos |
| guarda **frescura** (futuro) | `GUARDA 3.ter` | `edad < -60` → `false` | ✅ 1 rojo |
| guarda **frescura** (`--edad-max` NaN) | `GUARDA 3.quater` | `Number.isFinite(n)` → `false` | ✅ 1 rojo |
| guarda **cobertura** (M7) | `COBERTURA` | `trae && !permitir` → `false` | ✅ 1 rojo |
| guarda **paralelismo** (M6) | `PARALELISMO` | `culpables` → `[]` | ✅ 2 rojos |
| **orden canónico** | `ORDEN CANÓNICO` | `sort(ordenEstable)` → `.reverse()` | ✅ 1 rojo |
| **ruta normalizada** | `RAÍZ AJENA` | `lastIndexOf('tests')` → `-1` | ✅ 1 rojo |
| **`--gate` fuerza `--coverage=false`** | test homónimo | se borra el `unshift` | ✅ 1 rojo |
| **nunca mudo** | `NUNCA MUDO ·…` | se borra el `existsSync` del JSON | ✅ 1 rojo |

**Censo de mutación completo: 15 mutaciones, CERO supervivientes** (§4).
**El baseline no se mueve**: `--gate` sobre la suite completa → `IDENTICO`, exit 0, 403 tests (§6).

---

## 2 · La forma de cada test: la pinza

Un test que sólo comprueba «el instrumento dice X» no prueba que vigile nada — un instrumento que
imprimiera siempre X lo pasaría. Es exactamente el error que WP-V90 cometió con su propio gate. Así
que **cada** clase y **cada** guarda se comprueba con dos brazos:

1. el instrumento **real** cumple la aserción;
2. un **mutante** —copia del instrumento con ese trozo concreto desactivado— **no** la cumple.

El brazo 2 es la CA del WP dicha al derecho. Si un mutante sobrevive, el test se pone rojo con el
mensaje `MUTANTE SUPERVIVIENTE` y dice qué argumentos y qué salida.

Hay una segunda trampa cazada de paso: si un ancla de mutación no aparece **exactamente una vez** en
el instrumento, el helper revienta con `MUTACIÓN SIN ANCLA` en lugar de mutar a ciegas. Una mutación
que ya no apunta a código real no prueba nada, y eso tiene que ser ruidoso, no silencioso. **Coste
declarado**: quien refactorice el instrumento tendrá que reapuntar mutaciones. El mensaje dice cuál.

**Por qué subproceso y no `import`.** El instrumento es un ejecutable: despacha sobre `process.argv`
y termina con `process.exit()` (`scripts/rojos-jest.mjs:402-403` en adelante). Importarlo dentro de jest
ejecutaría ese despacho **con los argumentos de jest** y mataría al worker. Además, lo que el mundo
consume es su contrato de línea de órdenes —salida y código de salida—, no sus funciones.

---

## 3 · Los tres vectores del encargo, reproducidos antes de darlos por buenos

### 3.1 · Multiplicidad — reproducido, y con jest real

Con el instrumento devuelto a semántica de `Set`, y dos rojos homónimos contra un baseline que
declara uno (MEDIDO):

```
conjunto de rojos IDENTICO al declarado          EXIT=0     ← el rojo nuevo pasa entero
```

Con el instrumento tal como está hoy:

```
conjunto de rojos DISTINTO del declarado:
+ FALLA tests/unit/clon.test.ts :: V91 clonado   [sobran 1 de 2]        EXIT=1
```

Y **con jest de verdad**, no sólo con JSON sintético: el proyecto mínimo `paqueteA` declara dos
`test('rojo clonado')` homónimos, ambos en rojo. Sobre el informe que escribe jest:

```
+ FALLA rojo.test.js :: V91-A rojo clonado   [sobran 1 de 2]            EXIT=1
```

### 3.2 · Ejecución efectiva — el vector real, tal cual

MEDIDO, `--repetir 2` con una config inexistente (el vector literal del encargo):

```
rojos-jest: corrida 1/2: jest no llegó a escribir el JSON (exit=1).
  N fallos catastróficos reproducibles NO son determinismo: son N veces sin medir.
Error: Can't find a root directory while resolving a config file path.
                                                                        EXIT=2
```

Y el caso hermano, con JSON escrito pero sin tests: `{ success: true, numTotalTests: 0 }`, que es lo
que deja jest cuando `--passWithNoTests` se junta con un patrón que no casa. Contra un baseline
vacío, **sin la guarda el gate sale 0 y firma que el mundo está bien** (MEDIDO sobre el mutante):

```
instrumento real  → rojos-jest: la corrida NO ejecutó ni un solo test (numTotalTests=0)   EXIT=2
mutante           → conjunto de rojos IDENTICO al declarado                               EXIT=0
```

### 3.3 · Frescura

MEDIDO, informe de hace una hora en la ruta esperada:

```
rojos-jest: el informe es VIEJO: arrancó hace 3609 s (tope 900 s) — …/rancio.json    EXIT=2
```

con el mutante: `conjunto de rojos IDENTICO al declarado`, EXIT 0.

El test de frescura se ejecuta también **sobre un informe que ha escrito jest de verdad**: el único
retoque es `startTime`, que es precisamente lo que hace el paso del tiempo. Esperar 900 s dentro de
un test no es una opción, y se dice en el fichero.

---

## 4 · El censo de mutación completo (la CA: mutar el instrumento pone roja su propia suite)

No basta con las pinzas: éstas mutan **copias**. Aquí se mutó `scripts/rojos-jest.mjs` **en el
árbol**, se corrió su suite, y se restauró. MEDIDO, 15 mutaciones:

```
clase FALLA                        | 12 rojos
clase OMITE                        |  5 rojos
clase SUITE                        |  3 rojos
clase SINNOMBRE                    |  2 rojos
orden canonico                     |  1 rojo
normalizacion de ruta              |  1 rojo
guarda 1 multiplicidad             |  2 rojos
guarda 2 ejecucion efectiva        |  2 rojos
guarda 3 frescura (rancio)         |  3 rojos
guarda 3 frescura (futuro)         |  1 rojo
guarda 3 edad-max NaN              |  1 rojo
guarda cobertura                   |  1 rojo
guarda paralelismo                 |  2 rojos
gate impone --coverage=false       |  1 rojo
nunca mudo (JSON ausente)          |  1 rojo

=== instrumento restaurado? === IDENTICO
```

**Cero supervivientes.** Y lo que importa no es el cardinal: es que **los rojos son los tests que
nombran esa pieza**. Desactivar `SINNOMBRE` enrojece los dos tests de `SINNOMBRE` —el sintético y el
de jest real— y ninguno más. Desactivar la multiplicidad enrojece `GUARDA 1` y el test de jest real
que la reproduce. No hay rojos por simpatía.

*(Método: `git stash` no se usó. La restauración es una copia del fichero en el scratchpad de la
sesión, restaurada tras cada mutación y verificada con `diff -q`.)*

### 4.1 · La CA al nivel que importa: **el gate del mundo**

Lo anterior corre la suite del instrumento a mano. La prueba que de verdad pedía el encargo es que
romper el instrumento ponga rojo **el gate**, no un comando suelto. MEDIDO: instrumento mutado en el
árbol (orden canónico invertido), y a continuación el comando canónico sobre la suite completa:

```
$ node scripts/rojos-jest.mjs --gate
conjunto de rojos DISTINTO del declarado:
+ FALLA scripts/tests/rojos-jest.test.ts :: WP-V91 · las cuatro clases del conjunto ORDEN CANÓNICO · la salida va ordenada, que es lo que la hace comparable
GATE_EXIT=1
```

Contra el `IDENTICO` / exit 0 del árbol sano (§6). **El gate pasa a rojo, con una línea que nombra
exactamente la pieza rota.** Y tiene una propiedad que merece decirse: **el instrumento averiado
denuncia su propia avería** — el mismo binario que se acaba de mutar es el que emite el `FALLA` que
lo delata. El día que la mutación sea lo bastante profunda para impedirle emitir nada, las guardas
de «nunca mudo» y de ejecución efectiva lo mandan a **exit 2**, que tampoco es verde.

*(Instrumento restaurado y verificado con `diff -q` tras la medida.)*

---

## 5 · Cómo aislé el test del producto, y **qué precio pago**

**La decisión.** La suite **no corre la suite del producto ni una vez**. Trabaja con dos cosas:

1. **informes sintéticos con forma de jest** — 9 ficheros JSON construidos en el propio test;
2. **proyectos jest MÍNIMOS** en un directorio temporal fuera del árbol (`os.tmpdir()`), de dos o
   tres ficheros `.js` cada uno, contra los que se invoca **jest 29 de verdad**.

El resultado buscado: estos tests se ponen rojos cuando se rompe el **instrumento**, y no cuando
cambia el **producto**. Coste temporal: **16 s** frente a los ~90 s que cuesta una corrida completa.

**El precio, dicho entero.** Lo que compro con lo sintético es velocidad y aislamiento; lo que
pago es que *«el JSON sintético se parece al de jest»* es una **hipótesis mía**. Por eso la mitad de
la suite (§4 del fichero de tests, 7 tests) no usa JSON sintético en absoluto: corre jest y le deja
escribir el informe. Las cuatro clases, la multiplicidad y la guarda 2 están medidas **también**
contra jest real. Lo que queda apoyado **sólo** en JSON sintético es:

| apoyado sólo en sintético | por qué se aceptó |
| ------------------------- | ----------------- |
| guarda de **frescura** (rancio y futuro) | jest no produce informes viejos a petición; el caso real se cubre backdateando `startTime` de un informe **que sí escribió jest** |
| guarda de **cobertura** (`coverageMap`) | se intentó reproducir con jest real y **no se consiguió en este árbol** (§7.2) |
| **raíz ajena** (ruta de CI en linux) | no hay un linux aquí; la ruta se inyecta a mano |
| `--edad-max` con valor ilegible | es un fallo de análisis de argumentos, anterior a cualquier jest |

**Y lo que queda sin cubrir del todo, sin adornos:**

- **La suite del producto en sí.** Si `jest.config.js` cambiara de forma que el JSON dejara de tener
  la estructura esperada, mis proyectos mínimos —que traen su propia config— **no se enterarían**.
  Lo cubre en la práctica el `--gate` del mundo, no esta suite.
- **`--repetir N` con N > 1 y discrepancia real.** Se prueba `--repetir 1` y `--repetir 2` en el
  camino de error. **No hay test de dos corridas que discrepen**: fabricar flapeo a demanda pide un
  test no determinista, que es justo lo que este carril lleva dos WP erradicando. El bloque de
  `diff()` que imprime las discrepancias queda cubierto sólo por la vía de `--check`.
- **`--gate` bajo interrupción.** Que borre su directorio temporal si lo matan a mitad no se prueba.
- **La cifra de cobertura del producto** (24,91 %, CITA de WP-V90) no se remide aquí.

---

## 6 · Que el baseline no se mueve, y por qué mi suite vive donde vive

MEDIDO tras la obra, comando canónico:

```
$ node scripts/rojos-jest.mjs --repetir 1 -- --coverage=false
--- corrida 1/1 (jest exit=1, 403 tests ejecutados) ---
FALLA tests/integration/managerFactory.test.ts :: … should create process manager
FALLA tests/integration/managerFactory.test.ts :: … should create webview manager
FALLA tests/integration/managerFactory.test.ts :: … should handle concurrent manager creation
FALLA tests/integration/managerFactory.test.ts :: … should create all standard managers
FALLA tests/integration/managerFactory.test.ts :: … should have proper dependency chain in standard managers
OMITE tests/unit/mcp/clienteMcp.test.ts :: [pending] WP-V28 · contra runtime real (skip-honesto) …

$ node scripts/rojos-jest.mjs --gate
conjunto de rojos IDENTICO al declarado          GATE_EXIT=0
```

**375 → 403 tests** (los 28 míos), **el conjunto declarado intacto**. `scripts/rojos-jest.baseline.txt`
**no se ha tocado**, que era la predicción: lo que el baseline declara son rojos y omisiones, y mis
28 tests son verdes.

### 6.1 · Por qué el fichero está en `scripts/tests/` — decisión, no descuido

La CA dice «mutar el instrumento pone **roja su propia suite**». Para que eso signifique algo, la
suite del instrumento tiene que correr en el gate del mundo, o sea con `npm test`. El descubrimiento
de jest es `testMatch: ['**/tests/**/*.test.ts']` (`jest.config.js:6-9`), y **`package.json` y
`jest.config.js` son zona prohibida para mí**. La única ruta que está a la vez dentro de mi alcance
(`scripts/`) y dentro del descubrimiento de jest es `scripts/tests/`.

Lo digo explícitamente porque roza la prohibición de `tests/**`: **no he tocado el árbol de tests
del producto**, ni he metido en él ningún test que falle a propósito. Los tests que fallan a
propósito viven en directorios temporales, como pedía el encargo. Verificado: `git status` sólo
muestra `scripts/`.

**Alternativa, si el custodio prefiere no tener tests bajo `scripts/`**: un script propio en
`package.json` —zona prohibida, así que se propone y no se hace—

```json
"test:instrumento": "jest --config jest.instrumento.config.js"
```

Tiene un coste que conviene ver antes de elegirlo: un script aparte **no corre con `npm test`**, y
entonces romper el instrumento deja de poner rojo el gate del mundo. O sea que degrada exactamente
la CA de este WP. Mi recomendación es dejarlo donde está.

---

## 7 · Atacar el instrumento por vías que mi propia suite no contemplaba

Ésta es la parte del encargo que más ha dado. **Atacarlo una vez no basta si el ataque lo diseñas
tú**, así que después de tener la suite verde la ataqué a ella.

### 7.1 · Dos defectos REALES en el instrumento, hallados atacando y arreglados

Son los dos únicos cambios de conducta en `scripts/rojos-jest.mjs` (diff de 51 líneas), y los dos
tienen test.

**(D1) La guarda de FRESCURA se apagaba sola con un dedo gordo.** `sacarValor` hacía `Number(v)` sin
mirar. `Number(undefined)` —`--edad-max` escrito al final, sin valor— y `Number('900s')` valen
**NaN**, y `NaN > maxSeg` es **false**. MEDIDO **antes** del arreglo, con un informe de hace una
hora:

```
$ node scripts/rojos-jest.mjs --check base.txt rancio.json --edad-max
conjunto de rojos IDENTICO al declarado          EXIT=0
$ … --edad-max 900s   → conjunto de rojos IDENTICO al declarado    EXIT=0
$ … --edad-max xyz    → conjunto de rojos IDENTICO al declarado    EXIT=0
$ … --edad-max 900    → rojos-jest: el informe es VIEJO…           EXIT=2   ← control
```

Tres formas de escribirlo mal, tres veces el informe rancio bendecido, **y ni una línea de aviso**.
Compárese con la vía legítima de apagarla, `--edad-max 0`, que lo grita por stderr. Una guarda sólo
puede apagarse a propósito y en voz alta. **Arreglado**: valor no finito → `morir`, EXIT 2.

**(D2) La guarda de PARALELISMO se esquivaba separando la bandera de su valor.** `ARGS_SERIALES` se
aplicaba argumento a argumento, y ni `--maxWorkers` ni `1` casan por separado. MEDIDO **antes** del
arreglo: `--repetir 2 -- --maxWorkers 1` y `-w 1` **pasaban la guarda entera**.

Antes de arreglarlo comprobé que la evasión es real, no cosmética — que esas formas **serializan
jest de verdad**. MEDIDO con 6 suites que anotan su PID en un fichero:

```
--maxWorkers=6   -> pids distintos: 6
--maxWorkers=1   -> pids distintos: 1
--maxWorkers 1   -> pids distintos: 1        ← se colaba
-w 1             -> pids distintos: 1        ← se colaba
--runInBand      -> pids distintos: 1
```

Las cuatro formas serializadoras dejan jest en **un** proceso. La guarda cazaba dos y dejaba pasar
dos, y con las que dejaba pasar `--repetir 10` habría publicado «las 10 corridas dieron el MISMO
conjunto» medido **en serie** — el resultado exacto que la guarda existe para no dejar publicar.
**Arreglado**: se normaliza el par `--maxWorkers 1` → `--maxWorkers=1` antes de mirar.

### 7.2 · Cuatro MUTANTES que sobrevivieron a mi propia suite

Con la suite en 24/24 verde, mutué el instrumento por vías que no había pensado. **Cuatro mutaciones
dejaron la suite entera en verde** (MEDIDO):

```
=== ¿sobrevive el mutante a MI PROPIA suite? ===
orden canonico invertido                             Tests: 24 passed, 24 total
--gate deja de forzar --coverage=false               Tests: 24 passed, 24 total
rutaRelativa: se pierde el ancla 'tests'             Tests: 24 passed, 24 total
reloj en el futuro: deja de mirarse                  Tests: 24 passed, 24 total
```

Los cuatro importan, y el primero más que ninguno:

| superviviente | por qué era grave | qué lo cubre ahora |
| ------------- | ----------------- | ------------------ |
| **orden canónico** | la promesa de cabecera del instrumento es «salida byte a byte igual entre corridas y entre sistemas operativos» (`rojos-jest.mjs:17`). Esa promesa la sostiene **una** línea, `lineas.sort(ordenEstable)` — y mi suite la ignoraba porque comparaba con `toContain` y con multiconjuntos, las dos cosas ciegas al orden | `ORDEN CANÓNICO`, que asevera la **salida completa**, no un fragmento |
| **`--gate` deja de imponer `--coverage=false`** | es lo que impide que un fallo de umbral de cobertura —que en el JSON no deja rastro con nombre— quede tapado por cualquier rojo con nombre. Sin esa línea, `SINNOMBRE` **deja de poder saltar** | test propio, con un **reportero espía** que delata qué `collectCoverage` resolvió jest de verdad |
| **normalización de ruta** | el baseline se escribe en un árbol y se compara en otro. Si la ruta no se normaliza igual, **todo** el conjunto sale distinto y el gate se vuelve inservible justo en CI, que es donde más falta hace | `RAÍZ AJENA`, con una ruta de CI en linux |
| **reloj en el futuro** | la otra mitad de la frescura: un reloj adelantado (VM, contenedor) haría que **cualquier** informe pareciera recién hecho, para siempre. `edad` sale negativa y `edad > maxSeg` nunca se cumple | `GUARDA 3.ter` |

Tras añadir los cuatro tests, los cuatro mutantes mueren (§4). La lección, que es la del encargo: **mi
primera suite cubría exactamente las vías que yo ya había imaginado.** Sólo atacándola apareció que
la promesa más publicitada del instrumento —el orden— era la que menos vigilada estaba.

### 7.3 · Un hallazgo no previsto: la guarda 2 tapa a la clase SUITE

Al escribir el test real de `SUITE` monté un proyecto con **sólo** la suite rota. Salió **2**, no la
línea `SUITE`. La causa es correcta y no la he cambiado: una suite que muere al importarse no ejecuta
ni un test, así que si es la única del proyecto `numTotalTests` vale 0 y **la guarda de ejecución
efectiva corta antes de que la clase llegue a emitirse**.

El orden es el bueno —«no medí» (2) es más grave que «el conjunto cambió» (1)—, pero conviene
tenerlo escrito, porque acota la clase: **`SUITE` sólo aparece cuando algún otro test se ejecutó.**
No es el conjunto de rojos de un mundo apagado. Queda como test propio
(`SUITE · si la suite rota va SOLA…`) para que nadie lo redescubra a base de susto.

### 7.4 · Ataques que NO dieron nada (para que no se repitan)

| vector probado | resultado |
| -------------- | --------- |
| `--outputFile=otro.json` colado en los args extra | falla cerrado: el JSON no aparece donde el gate lo espera → `morir` |
| `--json=false` colado en los args extra | falla cerrado, misma vía |
| baseline con BOM, espacios de sobra, comentarios `#` y líneas vacías | tolerado y correcto (hay test) |
| `--baseline` sin valor | `no existe el baseline: undefined`, EXIT 2 |
| `--repetir 0` / `--repetir -1` / no entero | EXIT 2 |

Y **dos cosas que dejo señaladas sin arreglar**, porque no son defectos claros y tocarlas sería
ensanchar el WP:

1. **`--maxWorkers=10%`** puede resolver a 1 worker en una máquina pequeña y **no** lo caza la guarda
   de paralelismo. Cazarlo obligaría al instrumento a saber cuántas CPU hay, que es una medida del
   entorno, no del argumento. Queda dicho.
2. **`--repetir 1`** proclama «las 1 corridas dieron el MISMO conjunto». No es falso, pero es una
   afirmación de determinismo sobre una sola corrida. Yo mismo lo uso así en un test (para leer el
   conjunto emitido), lo cual es honesto pero conviene que conste.

---

## 8 · Qué garantiza el gate y qué NO — la línea que debía sobrevivir

Sobrevive, y además **es un test**, no una frase en un comentario que nadie relee:

> `un rojo nuevo se LEGALIZA añadiendo UNA línea al baseline, y nada obliga a arreglarlo`

MEDIDO. Mismo informe, mismo mundo, mismo rojo; lo único que cambia es una línea de un `.txt`:

```
baseline sin la línea  → conjunto de rojos DISTINTO del declarado
                         + FALLA tests/unit/clon.test.ts :: V91 clonado        EXIT=1
baseline con la línea  → conjunto de rojos IDENTICO al declarado               EXIT=0
```

Entonces, dicho entero:

**Lo que el gate SÍ garantiza**

- Cualquier cambio del conjunto de rojos, **en cualquier dirección**, produce un diff: un rojo nuevo,
  un rojo que desaparece, un test renombrado, uno saltado, una suite que deja de compilar.
- Un rojo nuevo **con el mismo nombre** que uno ya declarado tampoco pasa (multiplicidad).
- Una corrida que no midió **no se presenta como verde**: sale 2, no 0.
- Un informe rancio, o del futuro, o con cobertura, **no cuenta como medida**.
- **Y desde este WP**: si alguien deshace cualquiera de esas piezas, **la suite del instrumento se
  pone roja y el gate del mundo también** — porque `scripts/tests/rojos-jest.test.ts` corre con
  `npm test`, y un rojo suyo es una línea `FALLA` nueva que el conjunto declarado no tiene.
  *(Con una salvedad sobre CI, en la lista de abajo: allí ese rojo no tumba el job.)*

**Lo que el gate NO garantiza**

- **Que el mundo no empeore.** `scripts/rojos-jest.baseline.txt` es un `.txt` **sin suma de
  verificación**, **sin dueño por línea** —ninguna dice quién la metió, cuándo, ni por qué— y **sin
  gate en CI**. Esto último lo daba WP-V90 §5.2.bis y **lo he verificado abriendo el fichero**:
  `.github/workflows/ci.yml:70` es literalmente `continue-on-error: true`, en el paso
  `Test (legado — soft, no condiciona el resultado)` cuyo `run` es `npm test --if-present`.
  Un rojo nuevo se legaliza con una línea y **nada obliga a arreglarlo nunca**.

  Corolario que me toca decir, porque es sobre mi propia obra: **mi suite corre en ese `npm test`**,
  o sea en el paso que lleva `continue-on-error`. Que romper el instrumento ponga rojo el gate es
  cierto **localmente**; en CI, hoy, ese rojo no tumba el job. No está en mi alcance tocarlo
  (`.github/workflows/` es zona prohibida) y no lo he tocado, pero sin esta frase la anterior sería
  más ancha que la evidencia.

> **El gate convierte «el mundo empeoró en silencio» en «alguien firmó que el mundo empeoró». Eso es
> lo que se pedía. No es una garantía de que el mundo no empeore.**

Es **diseño legítimo** —la firma queda en el diff y un humano tiene que verla pasar— y el encargo
pedía explícitamente no cambiarlo. No lo he cambiado. Lo he vuelto **ejecutable**: ahora esa frase
no es una nota al pie, es un test con nombre que alguien tiene que borrar a propósito para quitarla.

---

## 9 · Lo que NO he tocado

| fichero | estado |
| ------- | ------ |
| `package.json` | **intacto** — zona prohibida (cadena serial). Propuesta en §6.1, con su contraindicación |
| `jest.config.js` | **intacto** — zona prohibida. Condiciona §6.1 |
| `tests/**` | **intacto** — ni un fichero. Los tests que fallan a propósito viven en `os.tmpdir()` |
| `.github/workflows/` | **intacto** |
| `scripts/rojos-jest.baseline.txt` | **intacto** — y §6 demuestra que no hacía falta moverlo |
| reportes de otros WPs | **intactos** |

`scripts/rojos-jest.mjs` **sí** se ha tocado, y sólo por lo que autorizaba el encargo: **dos defectos
reales descubiertos por un test** (§7.1), más el bloque de cabecera que apunta a la suite nueva.
Ningún cambio altera el conjunto que el instrumento emite: §6 lo mide.

### 9.1 · Comprobaciones de método

- **`git stash`: no usado.** Las mutaciones en el árbol se restauraron con una copia en el scratchpad
  de la sesión y se verificaron con `diff -q` (§4). La pila del repositorio no se tocó.
- **`npx`: no usado.** Ni por mí ni por el instrumento. El binario de jest se resuelve con
  `createRequire`, igual que hace `scripts/rojos-jest.mjs:218-235`, y se lanza con el node actual.
- **Nada escrito fuera del worktree** salvo el scratchpad de la sesión.
- **Regla 4, comprobada por mí y no citada de nadie**: MEDIDO, `git status --porcelain` antes y
  después de una corrida completa de la suite da **exactamente lo mismo** (sólo mis dos entradas).
  Correr la suite en este árbol **no** ensucia ningún fichero rastreado.
- **Ranura**: `npm ci`, las corridas de la suite, el censo de mutación y el gate final se lanzaron
  con `bash scripts/slot.sh run …`; la ranura quedó libre.
- **`node_modules` no existía** en este worktree; se instaló con `npm ci` bajo ranura.

### 9.2 · Registro de evidencia

`EVIDENCIA.md` (por worktree, en `.gitignore`), transcrito aquí:

| etiqueta | resultado | HEAD | árbol | nota |
| -------- | --------- | ---- | ----- | ---- |
| `gate` | **PASS** | `b8f341c` | limpio | conjunto `IDENTICO`, exit 0, 403 tests (375 + los 28 de V91) |
| `test-instrumento` | **PASS** | `b8f341c` | limpio | `scripts/tests/rojos-jest.test.ts` 28/28 en 16 s |
| `censo-mutacion` | **PASS** | `b8f341c` | limpio | 15 mutaciones del instrumento, 0 supervivientes |

---

## 10 · Para el orquestador

**Nada que enrutar a otro WP.** Lo único que sale de aquí es la propuesta de §6.1 sobre
`package.json`, y viene con la recomendación de **no** aplicarla.

Queda señalado, sin reclamar arreglo: `--maxWorkers=10%` (§7.4) y la afirmación de determinismo de
`--repetir 1` (§7.4).

Un apunte que puede interesar a quien lleve la cobertura: **no conseguí que jest recogiera cobertura
con `rootDir` en un directorio temporal** en esta máquina (`coverageMap` vacío, `coverage-summary`
con `total: 0` en las tres variantes de `collectCoverageFrom` que probé). Por eso la guarda M7 se
prueba con JSON sintético y la clase `SINNOMBRE` se reproduce con jest real por otra vía —**un
reportero que declara la corrida fallida**, que es una de las tres causas que el propio instrumento
nombra— y no por umbrales. Es una limitación de mi arnés, no un defecto del producto, y así consta.
