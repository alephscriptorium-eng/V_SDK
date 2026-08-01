# WP-V91 · P1 — el instrumento que vigila la suite pasa a tener quien lo vigile a él

| dato | valor |
| ---- | ----- |
| Carril | **V** · Aleph-0 (ℵ₀) |
| Encargo | `plan/BACKLOG.md:105` |
| Rama | `wp/v91-gate-del-instrumento` · base `629d502` |
| Obra | `b8f341c` (primera entrega) · `d44617f` (reporte) · **segunda vuelta tras devolución** |
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

## 0.bis · La devolución: qué cayó, y por qué las tres tenían razón

La primera entrega pasó el censo de mutación, los tres vectores del encargo y los dos defectos del
instrumento. **Cayeron tres cosas, y las tres son la misma cosa dicha de tres maneras**:

> **el conjunto de mutantes lo elegí yo, así que la suite cubría exactamente las vías que se me
> habían ocurrido.**

Que es —y esto es lo que duele— **literalmente la lección que yo mismo escribí en §7.2 de la primera
entrega**, después de encontrar cuatro mutantes supervivientes. La escribí, la firmé, y volví a
caer en ella tres veces más. Escribir la lección no es aplicarla.

| # | qué dejaba pasar | estado |
| - | ---------------- | ------ |
| **B1** | la dirección **`−` del diff** —un rojo que DESAPARECE— tenía **cero** aserciones. Mutándola: «IDÉNTICO», EXIT 0, y mis 28 tests en verde | **cerrado** · §3.4 |
| **B2** | la guarda de paralelismo se esquivaba por **siete formas más**; mi arreglo cerró 2 de 9. Y mi comentario afirmaba lo contrario | **cerrado** · §7.1 |
| **B3** | el mutante de orden **por comparador de locale** sobrevivía 28/28: mi fixture era todo ASCII minúscula, donde los dos comparadores **coinciden** | **cerrado** · §7.2.bis |

**B1 es el peor, y hay que decirlo entero.** Es una de las **cuatro garantías que mi propio reporte
enumeraba** en §8 y que la cabecera del instrumento promete desde V90 («borrar un test tampoco
cuela»). Entregué un gate contra el encogimiento del conjunto **sin un solo test de encogimiento**,
y en el mismo documento presenté esa garantía como cubierta. Las cuatro aserciones de diff que tenía
eran todas de la rama `+`.

**B3 tiene la moraleja más útil del WP**, y es una regla que me llevo:

> **Una fixture que no distingue dos implementaciones no vigila ninguna.** Antes de dar por cubierta
> una promesa hay que preguntarse *con qué dato divergirían las dos versiones* — y meter ese dato.

Mi fixture de orden era `aaa`, `mmm`, `zzz`. Con eso, `a < b` y `a.localeCompare(b)` dan el mismo
resultado, así que el test no distinguía «orden por unidad de código» de «orden por locale» — que es
**exactamente** la distinción que la promesa de portabilidad necesita. Basta una mayúscula y una eñe
(MEDIDO: unidad de código → `Zulu, aaa, mmm, zzz, ñu`; locale → `aaa, mmm, ñu, Zulu, zzz`).

Lo que el revisor **verificó y no hay que rehacer**: la suite no reintrodujo flapeo (5 corridas,
403 tests, mismo conjunto, con su propio parser); mi censo **no es tautológico** (12 casos con
mutación literal y equivalente); los cuatro supervivientes declarados mueren; D1 y D2 son defectos
reales; el JSON sintético se parece al real en lo que la guarda mira; y `scripts/tests/` es la única
ubicación posible.

---

## 1 · El resumen en una tabla

`scripts/tests/rojos-jest.test.ts` — **36 tests**, corre con `npm test` como una suite más.

| lo que había que cubrir | test(s) | mutación que lo mata | ¿muere? |
| ----------------------- | ------- | -------------------- | ------- |
| clase **FALLA** | `FALLA · el rojo sale con su nombre completo…` | se borra el `push('FALLA …')` | ✅ 14 rojos |
| clase **OMITE** | `OMITE · skip y todo entran al conjunto…` | `t.status !== 'passed'` → `false` | ✅ 5 |
| clase **SUITE** | `SUITE · una suite que muere…` + real | `suite.status === 'failed' && fallidas === 0` → `false` | ✅ 3 |
| clase **SINNOMBRE** | `SINNOMBRE · sin esta clase…` + real | `informe.success === false && !explicado` → `false` | ✅ 2 |
| guarda **multiplicidad** | `GUARDA 1` + real | `contar()` devuelto a semántica de `Set` | ✅ 3 |
| guarda **ejecución efectiva** | `GUARDA 2` + real | `numTotalTests < 1` → `false` | ✅ 2 |
| guarda **frescura** (rancio) | `GUARDA 3` | `edad > maxSeg` → `false` | ✅ 3 |
| guarda **frescura** (futuro) | `GUARDA 3.ter` | `edad < -60` → `false` | ✅ 1 |
| guarda **frescura** (`--edad-max` NaN) | `GUARDA 3.quater` | `Number.isFinite(n)` → `false` | ✅ 1 |
| guarda **cobertura** (M7) | `COBERTURA` | `trae && !permitir` → `false` | ✅ 1 |
| **orden canónico** (invertido **y por locale**) | `ORDEN CANÓNICO` | `sort` → `.reverse()` · comparador → `localeCompare` | ✅ 1 y 1 |
| **ruta normalizada** | `RAÍZ AJENA` | `lastIndexOf('tests')` → `-1` | ✅ 1 |
| **`--gate` fuerza `--coverage=false`** | test homónimo | se borra el `unshift` | ✅ 1 |
| **nunca mudo** | `NUNCA MUDO ·…` | se borra el `existsSync` del JSON | ✅ 1 |

**Lo que la devolución añadió** (§0.bis):

| lo que faltaba | test(s) | mutación que lo mata | ¿muere? |
| -------------- | ------- | -------------------- | ------- |
| **dirección `−`: un rojo que DESAPARECE** | `DIRECCIÓN «−»` ×2 + `--gate` a secas | `if (tiene < n)` → `if (false)` | ✅ 4 rojos |
| dirección `+`, por simetría | los de multiplicidad | `if (n > esperadas)` → `if (false)` | ✅ 4 |
| **guarda de paralelismo, 11 formas medidas** | `PARALELISMO` ×2 | 4 mutaciones (guarda, booleanas, numéricas, porcentaje, canon) | ✅ 4/3/2/1/4 |
| veredicto en serie sale **1** | `PARALELISMO · medir en serie…` | `seriales.length ? 1 : 0` → `0` | ✅ 1 |
| **detector de discrepancias** de `--repetir` | `DISCREPANCIA` | `texto(…) !== primero` → `false` | ✅ 1 |
| validación de `--repetir N` | `--repetir exige un entero >= 1` | se borra la validación | ✅ 1 |
| **`--gate` A SECAS** (baseline por defecto) | test homónimo | se cambia la ruta por defecto | ✅ 1 |
| **M4** · no dejar directorios temporales | `M4 · una corrida abortada…` | `process.on('exit')` → `('jamas')` | ✅ 1 |

**Censo de mutación completo: 27 mutaciones, CERO supervivientes** (§4).
**El baseline no se mueve**: `--gate` sobre la suite completa → `IDENTICO`, exit 0, **411 tests** (§6).
**Coste**: la suite del gate pasa de ~25 s a ~50 s, y este fichero es el camino crítico (§5.1).

---

## 2 · La forma de cada test: la pinza

Un test que sólo comprueba «el instrumento dice X» no prueba que vigile nada — un instrumento que
imprimiera siempre X lo pasaría. Es exactamente el error que WP-V90 cometió con su propio gate. Así
que **cada** clase y **cada** guarda se comprueba con dos brazos:

1. el instrumento **real** cumple la aserción;
2. un **mutante** —copia del instrumento con ese trozo concreto desactivado— **no** la cumple.

El brazo 2 es la CA del WP dicha al derecho. Si un mutante sobrevive, el test se pone rojo con el
mensaje `MUTANTE SUPERVIVIENTE` y dice qué argumentos y qué salida.

### 2.1 · Lo que la pinza NO da, y me costó tres bloqueantes aprender

La pinza garantiza que el test vigila **al mutante que yo escribí**. No garantiza nada sobre los
mutantes que no se me ocurrieron, y ahí está todo el peligro, porque **la pinza se siente como
cobertura demostrada**. Un test con su mutante muerto parece cerrado, y en los tres bloqueantes lo
parecía y no lo estaba:

| lo que yo tenía | lo que faltaba |
| --------------- | -------------- |
| mutante que **invierte** el orden | mutante que cambia el **comparador** (B3) |
| cuatro aserciones sobre la rama `+` del diff | ninguna sobre la rama `−` (B1) |
| mutante que apaga la guarda de paralelismo entera | las **siete formas** de esquivarla sin apagarla (B2) |

De ahí salen dos reglas que aplico ahora y que están escritas en el propio fichero de tests:

1. **Antes de dar por cubierta una promesa, preguntarse con qué dato divergirían las dos
   implementaciones — y meter ese dato.** Una fixture que no las distingue no vigila ninguna.
2. **Para una guarda que reconoce argumentos, la lista de formas no se imagina: se mide.** Las once
   formas que hoy caza la guarda de paralelismo salen del arnés de PID (§7.1), no de mi cabeza.

Hay una segunda trampa cazada de paso: si un ancla de mutación no aparece **exactamente una vez** en
el instrumento, el helper revienta con `MUTACIÓN SIN ANCLA` en lugar de mutar a ciegas. Una mutación
que ya no apunta a código real no prueba nada, y eso tiene que ser ruidoso, no silencioso. **Coste
declarado**: quien refactorice el instrumento tendrá que reapuntar mutaciones. El mensaje dice cuál.

**Por qué subproceso y no `import`.** El instrumento es un ejecutable: despacha sobre `process.argv`
y termina con `process.exit()` (`scripts/rojos-jest.mjs:468-469` en adelante). Importarlo dentro de jest
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

### 3.4 · Y el cuarto vector, que el encargo no pedía y mi suite no cubría: **la dirección `−`**

Es el bloqueante **B1**. El encargo nombraba tres vectores y los cubrí los tres; lo que no cubrí es
una garantía que el instrumento promete desde V90 y que mi propio §8 enumeraba: **un rojo que
DESAPARECE también tiene que dar diff**. Es la dirección de la *mejora aparente* —apagar una suite,
borrar un test, un `describe.skip`— y es la que un gate contra el maquillaje más necesita.

MEDIDO **con la rama mutada**, baseline que declara dos rojos e informe que trae uno:

```
conjunto de rojos IDENTICO al declarado          EXIT=0     ← el rojo borrado no deja rastro
```

Con el instrumento tal como está:

```
conjunto de rojos DISTINTO del declarado:
- FALLA tests/unit/uno.test.ts :: V91 rojo que alguien borró                    EXIT=1
```

y la variante con multiplicidad, que también faltaba —de dos homónimos declarados desaparece uno—:

```
- FALLA tests/unit/clon.test.ts :: V91 clonado   [faltan 1 de 2]                EXIT=1
```

Con jest **real** lo cubre además el test de `--gate` **a secas**, que mata dos pájaros: al comparar
el proyecto mínimo contra el baseline **por defecto** del repo, todas las líneas declaradas salen por
la rama `−`. Prueba a la vez la resolución del baseline por defecto —la invocación literal del mundo,
que tampoco tenía test— y la dirección `−` sobre un informe que ha escrito jest. El test cuenta las
líneas **leyendo el fichero**, no fijando su contenido, para que el día que V48 arregle los cinco
rojos no se ponga rojo de rebote.

---

## 4 · El censo de mutación completo (la CA: mutar el instrumento pone roja su propia suite)

No basta con las pinzas: éstas mutan **copias**. Aquí se mutó `scripts/rojos-jest.mjs` **en el
árbol**, se corrió su suite, y se restauró. MEDIDO, **27 mutaciones** (15 en la primera vuelta, 12
añadidas en la segunda):

```
clase FALLA                          | 14 rojos      B2 paralelismo: guarda entera   |  4 rojos
clase OMITE                          |  5 rojos      B2 paralelismo: solo booleanas  |  3 rojos
clase SUITE                          |  3 rojos      B2 paralelismo: solo numericas  |  2 rojos
clase SINNOMBRE                      |  2 rojos      B2 paralelismo: porcentaje      |  1 rojo
B3 orden: invertido                  |  1 rojo       B2 paralelismo: canon           |  4 rojos
B3 orden: comparador de LOCALE       |  1 rojo       veredicto serial sale 1         |  1 rojo
normalizacion de ruta                |  1 rojo       detector de discrepancias       |  1 rojo
B1 diff: rama '-' (encoge)           |  4 rojos      validacion de --repetir N       |  1 rojo
diff: rama '+' (crece)               |  4 rojos      M4 gancho de limpieza           |  1 rojo
guarda 1 multiplicidad               |  3 rojos      gate impone --coverage=false    |  1 rojo
guarda 2 ejecucion efectiva          |  2 rojos      gate: baseline por defecto      |  1 rojo (*)
guarda 3 frescura (rancio)           |  3 rojos      nunca mudo (JSON ausente)       |  1 rojo
guarda 3 frescura (futuro)           |  1 rojo
guarda 3 edad-max NaN                |  1 rojo
guarda cobertura                     |  1 rojo

=== instrumento restaurado? === IDENTICO
```

*(\*) Esa fila salió «SUPERVIVIENTE» en la primera pasada por un fallo MÍO al escribir la mutación,
no del instrumento ni de la suite. Se cuenta en §4.2, con la medida que lo demuestra.*

**Cero supervivientes**, y hay que precisar qué significa eso y qué no.

En la primera entrega escribí «**no hay rojos por simpatía**». **Es falso y lo retiro.** Apagar la
clase `FALLA` enrojece **14** tests, muchos de los cuales no la nombran: la fixture de orden, la de
raíz ajena, las de frescura, la de cobertura… todas llevan líneas `FALLA` dentro y aseveran sobre la
salida completa, así que caen de rebote. Lo mismo con la rama `−` del diff (4 rojos) o la guarda de
paralelismo (4).

Lo que sí se sostiene, y es lo que hace útil al censo, es lo contrario de una afirmación de
precisión: **ninguna mutación pasa desapercibida**, y en todas ellas **el test que nombra la pieza
está entre los rojos**. Desactivar `SINNOMBRE` enrojece exactamente sus dos tests —el sintético y el
de jest real—; desactivar el comparador de locale, exactamente el de orden. Que además caigan otros
es ruido de diagnóstico, no un problema de cobertura: se ve en cuanto se lee la lista, porque el
primero de la lista es el que da el nombre.

### 4.2 · Una mutación mía no mordía, y lo digo porque es el mismo error otra vez

En la primera pasada de este censo ampliado una fila salió **SUPERVIVIENTE**: «gate: baseline por
defecto». No lo era. **La mutación que escribí era un no-op**: cambiaba
`baseline = 'scripts/rojos-jest.baseline.txt'` por
`baseline = 'scripts/…baseline.txt'; baseline = process.argv[99] || baseline;`, y como `process.argv[99]`
es `undefined`, el valor **no cambiaba**. Verificado aparte:

```
baseline tras la mutacion: scripts/rojos-jest.baseline.txt -> SIN CAMBIO (no-op)
```

Repetida con una mutación de verdad (apuntar a `scripts/rojos-jest.OTRO.txt`):

```
× `--gate` A SECAS: la invocación del mundo, con su baseline por defecto
Tests: 1 failed, 35 passed, 36 total
```

Muere, y muere en el test que le toca. Lo cuento porque es **la misma clase de error que los tres
bloqueantes**, un escalón más arriba: el arnés de tests comprueba que un ancla exista una vez, pero
**nadie comprueba que la mutación cambie la conducta**. Una mutación que no muerde se lee igual que
una laguna de cobertura, y sólo se distingue mirándola. Va dicho para quien herede el censo.

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
cambia el **producto**.

### 5.1 · El precio TEMPORAL, bien contado esta vez

La primera entrega decía «**16 s** frente a los ~90 s que cuesta una corrida completa». Estaba mal
**dos veces**, y el revisor tenía razón en las dos:

- los **16 s** eran el fichero corriendo **solo**. Dentro de la suite, compartiendo máquina con las
  otras diez, tarda mucho más;
- los **~90 s** no son de `npm test`: son del comando **con cobertura**, que es otro. Comparaba mi
  coste contra un total que no es el que yo engordo.

MEDIDO hoy en este árbol, dos corridas de cada (reloj de pared, `--coverage=false`, que es lo que
corre el gate):

```
SIN el fichero de V91        30,9 s  ·  24,8 s
CON el fichero de V91        51,3 s  ·  47,2 s
jest --coverage (otro comando, el de los «~90 s»)      65,4 s
```

y el reparto por suite de la corrida completa:

```
  47,1 s  scripts/tests/rojos-jest.test.ts     ← camino crítico
  22,6 s  tests/unit/webview/webviewCsp.test.ts
  20,8 s  tests/integration/managerFactory.test.ts
  …
```

**Dicho sin adornos: la suite del gate pasa de ~25 s a ~50 s, o sea que se DUPLICA, y mi fichero es
el camino crítico** — el resto termina en ~25 s y la corrida espera a que yo acabe. La causa es
estructural y no la disimulo: 36 tests que lanzan **entre uno y cuatro subprocesos cada uno**, y
once de ellos arrancan un jest entero. El arranque de jest bajo contención es casi todo el gasto.

**La palanca, que no la aplico y explico por qué.** jest reparte por FICHERO, no por `describe`: un
solo fichero se ejecuta entero en un worker y por eso es el camino crítico. **Partirlo en tres
ficheros** (clases · guardas · jest real) con el arnés en un módulo compartido —`scripts/tests/arnes.ts`,
que al no acabar en `.test.ts` no lo recoge jest— dejaría a los tres corriendo en paralelo y bajaría
el reloj de pared a algo cercano al segundo más lento. No lo hago **en esta ronda**: es una
reestructuración de la suite entera, entra sin más contrarrevisión por delante, y el riesgo de
romper por descuido un fichero cuyo único mérito es ser hermético supera lo que se gana. **Queda
propuesto**, es barato, y no toca ninguna zona prohibida ni degrada la CA.

### 5.2 · El precio de lo SINTÉTICO

Lo que compro con lo sintético es velocidad y aislamiento; lo que pago es que *«el JSON sintético se
parece al de jest»* es una **hipótesis mía** (el revisor la verificó: se parece en lo que la guarda
mira). Por eso **once de los 36 tests** lanzan jest de verdad, y en **ocho** de ellos jest llega a
ejecutar tests. Las cuatro clases, la multiplicidad, la guarda 2, el detector de discrepancias y las
dos formas del `--gate` están medidas **también** contra jest 29 real. Lo que queda apoyado **sólo**
en JSON sintético es:

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
- **`--gate` bajo interrupción (SIGINT/SIGKILL).** El gancho de limpieza cuelga de `process.on('exit')`,
  que cubre la salida por `process.exit()` —que era el agujero real, §7.3— pero **no** un `kill -9`.
  No se prueba y no se arregla: un `SIGKILL` no ejecuta nada, ahí no hay defensa posible.
- **La cifra de cobertura del producto** (24,91 %, CITA de WP-V90) no se remide aquí.

*(Lo que en la primera entrega figuraba aquí como no cubierto —«`--repetir` con dos corridas que
discrepan»— **está cubierto desde esta ronda**. Lo declaré imposible sin un test que flapee, y era
una excusa: no hace falta azar, basta una secuencia determinista. El proyecto mínimo lleva un
contador en disco y falla **sólo en su primera corrida**, así que las dos corridas dan conjuntos
distintos siempre, y el detector se ejercita de verdad.)*

---

## 6 · Que el baseline no se mueve, y por qué mi suite vive donde vive

MEDIDO tras la obra, comando canónico:

```
$ node scripts/rojos-jest.mjs --repetir 1 -- --coverage=false
--- corrida 1/1 (jest exit=1, 411 tests ejecutados) ---
FALLA tests/integration/managerFactory.test.ts :: … should create process manager
FALLA tests/integration/managerFactory.test.ts :: … should create webview manager
FALLA tests/integration/managerFactory.test.ts :: … should handle concurrent manager creation
FALLA tests/integration/managerFactory.test.ts :: … should create all standard managers
FALLA tests/integration/managerFactory.test.ts :: … should have proper dependency chain in standard managers
OMITE tests/unit/mcp/clienteMcp.test.ts :: [pending] WP-V28 · contra runtime real (skip-honesto) …

$ node scripts/rojos-jest.mjs --gate
conjunto de rojos IDENTICO al declarado          GATE_EXIT=0
```

**375 → 411 tests** (los 36 míos), **el conjunto declarado intacto**. `scripts/rojos-jest.baseline.txt`
**no se ha tocado**, que era la predicción: lo que el baseline declara son rojos y omisiones, y mis
36 tests son verdes.

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

**(D2) La guarda de PARALELISMO se esquivaba de NUEVE maneras, y en la primera vuelta cerré dos.**

Éste es el bloqueante **B2** y conviene contarlo en orden, porque el error de método está en el
medio. En la primera vuelta encontré que `--maxWorkers 1` en **dos argumentos** se colaba —la lista
de expresiones regulares se aplicaba argumento a argumento— lo medí, lo arreglé, y escribí en el
código: *«las cuatro formas serializan igual, así que las cuatro tienen que caer igual»*.

**Esa frase era falsa cuando la escribí.** No hay cuatro formas: hay al menos nueve, y mi arreglo
cerró dos. MEDIDO con el arnés de 6 suites que anotan su PID (jest 29.7.0, `--no-cache`, 12 CPU):

```
=== controles: paralelismo de verdad ===        === las que dejan UN solo proceso ===
--maxWorkers=6      -> 6 procesos               --maxWorkers=1     -> 1     (cazada)
--runInBand=false   -> 6 procesos               -w 1               -> 1     (cazada)
--maxWorkers=50%    -> 6 procesos               --runInBand        -> 1     (cazada)
                                                -i                 -> 1     (cazada)
                                                --max-workers=1    -> 1     ← COLADA
                                                --max-workers 1    -> 1     ← COLADA
                                                --runInBand=true   -> 1     ← COLADA
                                                -i=true            -> 1     ← COLADA
                                                --maxWorkers=01    -> 1     ← COLADA
                                                --maxWorkers=1.0   -> 1     ← COLADA
                                                --maxWorkers=+1    -> 1     ← COLADA
                                                --maxWorkers=10%   -> 1     ← COLADA (y declarada)
```

*(La primera medida de los controles salió mal: con tests rápidos jest se pasa a modo in-band por su
propia heurística de tiempos y `--maxWorkers=6` daba **1** proceso, lo que habría hecho creer que
todo serializa. Se repitió con tests de 1,2 s y `--no-cache`, y ahí los controles dan 6.)*

**El error de método, que es lo que hay que aprender**: la guarda comparaba la **forma literal** del
argumento contra una lista de expresiones regulares, y la forma literal de una bandera de jest tiene
muchas variantes —alias corto, kebab-case, `=valor` frente a valor suelto, ceros a la izquierda,
decimales, signo, porcentaje, booleana explícita—. Una lista de formas sólo caza las que a alguien
se le ocurrieron, y **a mí se me ocurrieron cuatro de once**.

**Arreglado de raíz**: la guarda ya no compara formas, **analiza el argumento** — canonicaliza el
nombre (sin guiones, sin mayúsculas: `--max-workers`, `--maxWorkers` y `-w` son lo mismo), separa el
valor venga pegado o suelto, y pregunta **cuántos procesos deja**. Las booleanas sólo cuentan si no
llevan `=false`/`=0`/`=no`; las numéricas se resuelven con `Number()` —que se come `01`, `1.0` y
`+1`— y los porcentajes con `floor(cpus × pct / 100)`, fórmula **medida en cinco puntos** (9 % → 1,
10 % → 1, 20 % → 2, 25 % → 3, 50 % → 6 sobre 12 CPU).

El porcentaje merece una nota, porque en la primera vuelta lo **declaré como hueco conocido y no lo
cerré**, con el argumento de que depende de la máquina. El argumento era malo: depende de la
máquina, sí, y **la máquina que importa es aquella en la que se está tomando la medida**. Si ahí
resuelve a un proceso, la corrida es en serie y el veredicto no vale. Cerrado.

Los once casos y los cuatro controles están en el test `PARALELISMO · …se niega a medir determinismo
en serie`, y el porcentaje en uno propio que se calcula contra `os.cpus().length` para no depender
de esta máquina en concreto.

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

Tras añadir los cuatro tests, los cuatro mutantes mueren (§4).

### 7.2.bis · Y otros TRES que sobrevivieron a la segunda suite — los encontró el revisor, no yo

Aquí es donde la lección se cobra. Escribí, al cerrar §7.2: *«mi primera suite cubría exactamente
las vías que yo ya había imaginado»*. Escribí la frase **y volví a hacerlo**: la suite de 28 tests
tenía otros tres supervivientes, y los tres son los bloqueantes de la devolución.

| superviviente | por qué mi suite era ciega | qué lo cubre ahora |
| ------------- | -------------------------- | ------------------ |
| **rama `−` del diff** (B1) | mis cuatro aserciones de diff eran **todas de la rama `+`**. Nunca escribí un caso en que el conjunto ENCOGE, que es la dirección de la mejora aparente | dos tests: línea que desaparece entera, y una de dos homónimas (`[faltan 1 de 2]`) |
| **comparador de locale** (B3) | mi fixture era `aaa`/`mmm`/`zzz`: **ASCII minúscula, donde los dos comparadores coinciden**. El test distinguía «ordenado» de «invertido», no «por unidad de código» de «por locale» | la fixture lleva `Zulu` y `ñu`, y hay un segundo mutante con `localeCompare` |
| **siete formas de serializar** (B2) | probé las formas que se me ocurrieron en vez de **medir** cuáles serializan | las once formas medidas, más cuatro controles que no deben caer |

La diferencia entre esta tanda y la anterior es quién las encontró, y por eso la regla que me llevo
no es «ataca tu suite» —eso ya lo hice— sino la más concreta:

> **Una fixture que no distingue dos implementaciones no vigila ninguna.** Y para una guarda que
> reconoce argumentos, la lista de formas **se mide, no se imagina**.

Con esos tres cerrados, y con los mutantes nuevos que añadí de paso —la rama `+`, las cuatro piezas
por separado de la guarda de paralelismo, el detector de discrepancias, la validación de
`--repetir N`, el veredicto en serie, el gancho de limpieza y la resolución del baseline por
defecto—, el censo pasa de 15 mutaciones a **27, con cero supervivientes** (§4).

### 7.3 · M4 · el instrumento dejaba basura en `os.tmpdir()`, y yo lo empeoré

Denunciado en la devolución y confirmado: `--gate` y `--repetir` crean un directorio temporal y lo
borran en un `finally`. Pero **`process.exit()` no ejecuta los `finally`**, y el instrumento sale
por `morir()` desde DENTRO de ese `try` en cinco caminos distintos (jest no escribió el JSON, la
corrida no ejecutó tests, el informe trae cobertura…). Cada una de esas salidas dejaba su
directorio, con el JSON de jest dentro.

**El fallo es heredado de V90, pero es mío el haberlo convertido de raro en cotidiano**: mi suite
recorre justamente esos caminos, así que pasaba a fugar cinco directorios **en cada `npm test`**.
Y contradecía de plano mi propio §9.1 («nada escrito fuera del worktree»), que era falso.

**Arreglado** con un `tmpEfimero()` que cuelga el borrado de `process.on('exit')` —que sí corre en
`process.exit()`—. El `finally` se queda, redundante y sin estorbar. El test es hermético: le da al
subproceso un `os.tmpdir()` propio y cuenta sólo lo que deja el instrumento, así que no depende de
qué más haya en el temporal de la máquina.

Lo que **no** cubre, dicho: un `SIGKILL` no ejecuta ganchos de salida. Ahí no hay defensa y no la
finjo.

### 7.4 · Un hallazgo no previsto: la guarda 2 tapa a la clase SUITE

Al escribir el test real de `SUITE` monté un proyecto con **sólo** la suite rota. Salió **2**, no la
línea `SUITE`. La causa es correcta y no la he cambiado: una suite que muere al importarse no ejecuta
ni un test, así que si es la única del proyecto `numTotalTests` vale 0 y **la guarda de ejecución
efectiva corta antes de que la clase llegue a emitirse**.

El orden es el bueno —«no medí» (2) es más grave que «el conjunto cambió» (1)—, pero conviene
tenerlo escrito, porque acota la clase: **`SUITE` sólo aparece cuando algún otro test se ejecutó.**
No es el conjunto de rojos de un mundo apagado. Queda como test propio
(`SUITE · si la suite rota va SOLA…`) para que nadie lo redescubra a base de susto.

### 7.5 · Ataques que NO dieron nada (para que no se repitan)

| vector probado | resultado |
| -------------- | --------- |
| `--outputFile=otro.json` colado en los args extra | falla cerrado: el JSON no aparece donde el gate lo espera → `morir` |
| `--json=false` colado en los args extra | falla cerrado, misma vía |
| baseline con BOM, espacios de sobra, comentarios `#` y líneas vacías | tolerado y correcto (hay test) |
| `--baseline` sin valor | `no existe el baseline: undefined`, EXIT 2 |

Y **una sola cosa que dejo señalada sin arreglar**:

- **`--repetir 1`** proclama «las 1 corridas dieron el MISMO conjunto». No es falso, pero es una
  afirmación de determinismo sobre una sola corrida. Yo mismo lo uso así en dos tests (para leer el
  conjunto emitido), lo cual es honesto pero conviene que conste.

*(De la lista anterior salen dos entradas que ya no pertenecen aquí: **`--maxWorkers=10%`** estaba
declarado como hueco conocido y **ahora está cerrado** (§7.1); y **`--repetir 0 / -1 / no entero`**
figuraba como «sonda que no dio nada» pero **no tenía test**, así que la validación se podía borrar
entera sin consecuencias. Ahora lo tiene. Presentar una sonda manual como cobertura era, en
pequeño, el mismo pecado que B1.)*

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

  Y la devolución añade dos datos que lo empeoran y que conviene dejar juntos: **ningún paso de CI
  corre el gate** (`--gate` no aparece en el workflow), y **ese paso está permanentemente en rojo
  hoy**, así que su aportación es cero. O sea que, a día de hoy, **toda la fuerza de este gate es
  local**: vive en que alguien corra `npm test` o `--gate` y mire el resultado. Eso no invalida el
  WP —el gate hace lo que promete cuando se ejecuta— pero sí acota dónde muerde.

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
  `createRequire`, igual que hace `scripts/rojos-jest.mjs:238-255`, y se lanza con el node actual.
- **Fuera del worktree**: el scratchpad de la sesión, y `os.tmpdir()`, que es donde viven los
  proyectos jest mínimos y los mutantes mientras corre la suite (se crean con `mkdtemp` y se borran
  en `afterAll`). **En la primera entrega esta línea decía «nada escrito fuera del worktree» y era
  falsa**: además de lo anterior, el instrumento **fugaba cinco directorios temporales por corrida**
  (§7.3). El fallo está arreglado y la frase, corregida.
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
| `gate` | **PASS** | 2.ª vuelta | limpio | conjunto `IDENTICO`, exit 0, **411 tests** (375 + los 36 de V91) |
| `test-instrumento` | **PASS** | 2.ª vuelta | limpio | `scripts/tests/rojos-jest.test.ts` **36/36** |
| `censo-mutacion` | **PASS** | 2.ª vuelta | limpio | **27 mutaciones**, 0 supervivientes (§4.2) |

---

## 10 · Para el orquestador

**Nada que enrutar a otro WP.** Salen **dos propuestas**, ninguna aplicada, las dos fuera de mi
alcance o de esta ronda:

| # | propuesta | recomendación |
| - | --------- | ------------- |
| 1 | un `test:instrumento` propio en `package.json` (§6.1) | **NO aplicarla**: un script aparte no corre con `npm test`, y entonces romper el instrumento deja de poner rojo el gate. Degrada la CA de este WP |
| 2 | **partir `rojos-jest.test.ts` en tres ficheros** con el arnés en `scripts/tests/arnes.ts` (§5.1) | **sí, pero no ahora**. jest reparte por fichero: partirlo devolvería el reloj de pared de ~50 s a cerca de ~25 s. Es barato y no toca zona prohibida, pero es reestructurar la suite entera sin contrarrevisión por delante |

Queda señalado, sin reclamar arreglo, **un** flanco: la afirmación de determinismo de `--repetir 1`
(§7.5). El que quedaba de la primera vuelta, `--maxWorkers=10%`, **está cerrado** (§7.1).

**Sobre CI**, y agradeciendo los dos datos que sumaste: que ningún paso corra el gate y que el paso
del `npm test` esté permanentemente en rojo convierte mi «la suite corre en CI» en una afirmación sin
consecuencias prácticas. Está dicho en §8 con esas palabras. No he tocado `.github/workflows/` — es
zona prohibida — y queda enteramente en tu carril.

Un apunte que puede interesar a quien lleve la cobertura: **no conseguí que jest recogiera cobertura
con `rootDir` en un directorio temporal** en esta máquina (`coverageMap` vacío, `coverage-summary`
con `total: 0` en las tres variantes de `collectCoverageFrom` que probé). Por eso la guarda M7 se
prueba con JSON sintético y la clase `SINNOMBRE` se reproduce con jest real por otra vía —**un
reportero que declara la corrida fallida**, que es una de las tres causas que el propio instrumento
nombra— y no por umbrales. Es una limitación de mi arnés, no un defecto del producto, y así consta.
