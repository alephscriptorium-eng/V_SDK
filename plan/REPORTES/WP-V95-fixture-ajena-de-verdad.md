# WP-V95 · P0 — la fixture de raíz ajena era ajena en una plataforma sola

> **Una fixture que simula «el otro entorno» deja de simular nada cuando te toca
> correr en el otro entorno.**

---

## 0 · Qué es de fiar aquí y qué no

- **Medido en esta máquina** (Windows 11, node v22.21.1, 12 CPU, locale `es-ES`,
  `os.tmpdir()` = `C:\Users\aleph\AppData\Local\Temp`): todo lo que en este
  reporte lleva la palabra **MEDIDO**, con el comando al lado.
- **Medido en el remoto**: sólo el síntoma, leído con `gh` (`run 30717696234`).
  **No he empujado nada** — la rama la empuja el orquestador.
- **Reproducido en local, no observado en Linux**: la condición de CI. Lo que
  reproduzco no es *el sistema operativo*, es **la condición que produce el
  fallo** — que la raíz del proceso sea ancestro de la ruta que el informe
  declara. Está dicho con precisión en §2 y §3, y es la única forma que tengo de
  enseñar el rojo sin poder empujar.
- **Deducido de código, no medido**: exactamente **una** afirmación de este
  reporte (§5, eje F, la mitad que habla de Linux). Va marcada como deducción y
  con su premisa medida al lado.
- **Sin tocar**: `scripts/rojos-jest.mjs` (no hay defecto ahí: §1),
  `scripts/rojos-jest.baseline.txt` (el conjunto declarado **no se toca**: este
  WP devuelve un verde a verde, no legaliza un rojo).

---

## 1 · La causa, confirmada — no redescubierta

El encargo traía el diagnóstico hecho. Lo he confirmado abriendo los dos
ficheros y midiendo, que es lo que pedía la regla de oro.

**El síntoma, en el remoto** (`gh run view 30717696234 --log-failed`, paso
*«Gate · conjunto de rojos por nombre (BLOQUEA)»*):

```
conjunto de rojos DISTINTO del declarado:
+ FALLA scripts/tests/rojos-jest.test.ts :: WP-V91 · las cuatro clases del conjunto RAÍZ AJENA · un informe hecho en CI da la MISMA línea que uno hecho aquí
```

Una línea, una sola. Ningún otro test de los 36 cae en CI.

**La fixture** (`scripts/tests/rojos-jest.test.ts:374-384`, antes de este WP)
declaraba el informe como venido de
`/home/runner/work/V_SDK/V_SDK/tests/unit/ci.test.ts`. El repo se llama `V_SDK`
(`git remote -v`) y `ci.yml` corre en `ubuntu-latest` con `actions/checkout@v4`,
así que esa ruta **es literalmente la raíz del checkout en el runner**.

**El mecanismo**, en `rutaRelativa` (`scripts/rojos-jest.mjs:118-132`):

```js
r = path.relative(RAIZ, absoluta);          // RAIZ = process.cwd()  (:82)
if (!r || r.startsWith('..')) {             // ← la rama de reserva
    const partes = String(absoluta).split(/[\\/]/);
    const i = partes.lastIndexOf('tests');  // ← lo que el mutante borra
    r = i >= 0 ? partes.slice(i).join('/') : partes[partes.length - 1];
}
```

MEDIDO (`node -e` sobre `path.relative`):

| raíz del proceso | `path.relative(raíz, fixture)` | ¿ajena? | rama de reserva |
|---|---|---|---|
| `C:\S_LAB\wt\v-v95` (aquí) | `..\..\..\home\runner\work\…` | **sí** | **se ejecuta** |
| `/home/runner/work/V_SDK/V_SDK` (CI) | `tests\unit\ci.test.ts` | **no** | **muerta** |

En CI la rama de reserva no se ejecuta jamás, así que el mutante
`const i = -1` **no cambia una coma de la salida**, `elMutanteDebeCaer` lo
denuncia como superviviente y el test cae.

**El código de producción está bien.** `rutaRelativa` hace exactamente lo que
promete en las dos plataformas; lo que no se ejercitaba en las dos era **la
fixture**. No he tocado `scripts/rojos-jest.mjs` (§8 lo verifica byte a byte).

---

## 2 · Reproducir la condición sin poder empujar

El defecto es **estructural**, no de sistema operativo: se da cuando la raíz del
proceso es **ancestro** de la ruta que el informe declara. Eso se monta aquí.
Lo he montado de **dos** maneras independientes, porque la primera no llega a
ejecutar jest de verdad y la segunda sí.

### 2.1 · Raíz parametrizada (el instrumento real, la fixture real)

> **Los guiones de esta sección viven en el scratchpad de la sesión y NO se
> commitean** — son andamio, no obra. Se describen enteros para que cualquiera
> los rehaga en dos minutos.

Copia del instrumento con **una** línea cambiada
—`const RAIZ = process.cwd()` → `const RAIZ = process.env.V95_RAIZ || process.cwd()`—
y nada más. Todo lo demás es el original: la fixture, la aserción y la mutación
(`lastIndexOf('tests')` → `-1`). Se corre el par real/mutante contra las dos
raíces y se compara la salida:

```
=== fixture VIEJA (V91) ===
  VERDE · Windows · raíz = este árbol
        real     : "FALLA tests/unit/ci.test.ts :: V91 rojo nacido en CI"   (cumple)
        mutante  : "FALLA ci.test.ts :: V91 rojo nacido en CI"              (cae)
  ROJO  · CI      · raíz = /home/runner/work/V_SDK/V_SDK
        real     : "FALLA tests/unit/ci.test.ts :: V91 rojo nacido en CI"   (cumple)
        mutante  : "FALLA tests/unit/ci.test.ts :: V91 rojo nacido en CI"   ← SOBREVIVE
```

### 2.2 · El árbol copiado a una raíz con forma de runner (jest de verdad)

Copia completa del worktree fuera de él, `node_modules` por unión, y la suite
corrida allí con el binario de jest del proyecto.

**Un intento fallido que conviene dejar escrito**, porque es una trampa fina:
monté un disco virtual con `subst V:` y puse el árbol en
`V:\home\runner\work\V_SDK\V_SDK`, de modo que en Windows `/home/runner/...`
resolviera contra esa unidad y la reproducción fuese **literal**. **No sirve**:
jest resuelve `__dirname` por `realpath`, así que deshace el `subst` y `RAIZ`
vuelve a ser la ruta real en `C:`. MEDIDO con una sonda dentro de jest:

```
RAIZ que ve jest: C:\Users\...\runner-root\home\runner\work\V_SDK\V_SDK
cwd de jest     : V:\home\runner\work\V_SDK\V_SDK
```

Así que **transpuse** la condición en vez de imitarla: en la copia sustituí la
constante de la fixture por **la raíz real de la copia** — que es exactamente la
sustitución que hace el runner al hacer checkout. Con eso, la condición es la
misma y jest la ve.

*(El `subst` se deshizo, la unión se borró y las copias se eliminaron: §8.)*

---

## 3 · El rojo antes y el verde después, en las dos condiciones

Comando en los cuatro casos:
`node node_modules/jest/bin/jest.js scripts/tests/rojos-jest.test.ts --coverage=false`

| | **fichero de V91 (antes)** | **fichero de V95 (después)** |
|---|---|---|
| **Condición A** · raíz = este árbol (Windows) | **36 passed** | **37 passed** |
| **Condición B** · raíz = ancestro de la fixture | **1 failed, 35 passed** | **37 passed** |

El rojo de la condición B, tal cual salió — y es **el mismo** que el de CI:

```
× RAÍZ AJENA · un informe hecho en CI da la MISMA línea que uno hecho aquí (155 ms)
● WP-V91 · las cuatro clases del conjunto › RAÍZ AJENA · …
  MUTANTE SUPERVIVIENTE.
    argumentos : C:\Users\…\v91-instrumento-ww2I7R\raiz-ajena.json
    salida     : FALLA tests/unit/ci.test.ts :: V91 rojo nacido en CI
```

**Y el gate del mundo, aquí, después del arreglo:**

```
$ node scripts/rojos-jest.mjs --gate
conjunto de rojos IDENTICO al declarado          (exit 0)
```

El baseline **no se ha tocado**: el test vuelve a estar verde, no se ha
legalizado su rojo.

---

## 4 · Que el mutante siga cayendo — que no haya cambiado un rojo honesto por un verde mudo

Éste es el riesgo real del WP: hacer pasar el test rompiendo lo que el test
vigila. Tres cosas lo impiden, y las tres se comprueban solas.

### 4.1 · La fixture es ajena **por construcción**, no por suerte

```ts
const RAIZ_AJENA = path.join(path.dirname(RAIZ), path.basename(RAIZ) + '-de-otro-checkout');
```

Hermana del árbol de trabajo, **jamás descendiente suya**, esté el checkout
donde esté. `path.relative` devuelve `../<nombre>-de-otro-checkout/…` en las dos
plataformas, así que la rama de reserva entra siempre.

### 4.2 · Y la ajenidad se **demuestra**, no se supone

El test comprueba, antes de aseverar nada, que la ruta es ajena **en el entorno
donde se le está corriendo**, con el criterio *exacto* del instrumento
(`vieneDeOtraRaiz`, copia literal de `rojos-jest.mjs:118-130`):

```ts
expect({ raizDelProceso, declarada, esAjena: vieneDeOtraRaiz(raizDelProceso, declarada) })
    .toEqual({ raizDelProceso, declarada, esAjena: true });
```

No es adorno. MEDIDO forzando el caso (temporal en otra unidad de Windows, donde
`path.relative` devuelve la ruta absoluta en vez de `..`), el fallo sale así:

```
- "esAjena": true,
+ "esAjena": false,
  "declarada":      "C:/Users/.../V_SDK-de-otro-checkout/tests/unit/ci.test.ts",
  "raizDelProceso": "V:\\tmp-con-tests\\tests\\tmp\\v91-instrumento-EOn9oT\\runner\\work\\V_SDK\\V_SDK"
```

Es decir: **la fixture denuncia por su nombre que ha dejado de simular otra
raíz**, con las dos rutas delante — en vez de disfrazarse de «mutante
superviviente» trescientas líneas más allá, que es exactamente como se leía el
fallo en CI y por lo que costó verlo.

### 4.3 · El mutante se mata en **cuatro** condiciones, no en una

El test recorre `2 raíces de proceso × 2 estilos de separador`:

| raíz del proceso | separador de la ruta declarada | real | mutante |
|---|---|---|---|
| el árbol de trabajo | barras (informe de un runner POSIX) | cumple | **cae** |
| el árbol de trabajo | contrabarras (otro checkout Windows) | cumple | **cae** |
| raíz con forma de runner (`<tmp>/runner/work/V_SDK/V_SDK`, existe de verdad) | barras | cumple | **cae** |
| ídem | contrabarras | cumple | **cae** |

Los dos estilos de separador son **nuevos**: la fixture de V91 sólo probaba
barras, y la rama de reserva parte por `[\\/]`. Ahora las dos mitades del
partidor se ejercitan **en cualquier plataforma**.

### 4.4 · Y el defecto queda escrito **como test**

Test nuevo: *«RAÍZ AJENA · el vicio que cerró V95: una fixture BAJO la raíz del
proceso no vigila nada»*. Corre el instrumento desde una raíz que **contiene** la
ruta de la fixture y asevera que **el mutante sobrevive**:

```ts
expect(real.out).toBe('FALLA tests/unit/ci.test.ts :: V91 rojo nacido en CI\n');
expect(delMutante.out).toBe(real.out);   // ← sobrevive: la fixture no vigila nada
```

y, en esa **misma** raíz, que con las fixtures de V95 el mutante sí cae. Prueba
en el propio fichero, y en cualquier plataforma, que **la diferencia no es el
sistema operativo: es si la ruta es ajena a la raíz del proceso o no**.

---

## 5 · El barrido de las demás — las 36, con nombre y veredicto

Lo que de verdad cierra el WP. La pregunta: **¿cuántas suponen un entorno, y
cuáles se volverían vacuas o rojas en el otro?**

He medido **seis ejes**. Los cinco primeros con corridas reales; el sexto tiene
la mitad medida y la mitad deducida, y va marcada.

### 5.0 · Los ejes, y cómo se midieron

| eje | qué supone | cómo lo medí | resultado |
|---|---|---|---|
| **A · raíz del proceso** | que la fixture sea ajena a `process.cwd()` | suite completa con la condición de CI transpuesta (§2.2) | **1 de 36 cae** |
| **B · dónde vive el árbol** | que `RAIZ` esté en un sitio concreto | suite completa con `RAIZ` movido a una ruta profunda con forma de runner | **0 de 36 caen** |
| **C · `os.tmpdir()`** | que ningún ancestro del temporal se llame `tests` | suite con `TEMP`/`TMP`/`TMPDIR` = `…\tests\tmp`, misma unidad | **4 de 37 caen** |
| **C.bis · unidad (sólo Windows)** | que temporal y árbol compartan unidad | ídem con el temporal en `V:` | **5 de 37 caen** (las 4 de C + la guarda de §4.2, que avisa por su nombre) |
| **D · ICU / locale** | que `localeCompare` tenga collation de verdad | orden de la fixture por unidad de código vs. por locale, en 5 locales | **distinguen las 5** |
| **E · nº de CPU** | que la máquina tenga ≥ 2 | aritmética de la propia fixture sobre `cpus ∈ {1,2,3,4,8,12,16}` | **falla sólo con 1 CPU** |
| **F · separador** | que `path.relative` devuelva contrabarras | mutar la normalización de separadores y correr la suite | **14 de 37 caen aquí; 0 caerían en POSIX** |

### 5.1 · El veredicto, test por test

Leyenda: **·** = no supone entorno · **A/B/C/D/E/F** = eje que supone ·
**vacua** = fuera de aquí seguiría en verde sin vigilar lo que dice vigilar ·
**roja** = fuera de aquí se pondría roja sin que nada esté mal.

| § | test | supone | fuera de aquí |
|---|---|---|---|
| 1 | FALLA · el rojo sale con su nombre completo… | F | **vacua en POSIX** (para la normalización de separadores; su propio mutante sigue cayendo) |
| 1 | OMITE · skip y todo entran al conjunto… | F | ídem |
| 1 | SUITE · una suite que muere sin ejecutar un test… | F | ídem |
| 1 | SINNOMBRE · sin esta clase el instrumento emite CERO líneas | · | igual en todas partes |
| 1 | ORDEN CANÓNICO · por unidad de código, no por locale | D, F | **roja** si el node no trae ICU con collation (`localeCompare` degradaría a unidad de código y el mutante sobreviviría) |
| 1 | **RAÍZ AJENA · un informe de OTRA raíz…** | **A (era)** · ahora C.bis | **ERA EL DEFECTO.** Arreglado; hoy demuestra la ajenidad y avisa por su nombre si se pierde |
| 1 | **RAÍZ AJENA · el vicio que cerró V95** *(nuevo)* | F | vacua en POSIX para la normalización; su aserción central (el mutante sobrevive) vale en todas partes |
| 2 | GUARDA 1 · MULTIPLICIDAD | F | vacua en POSIX para separadores |
| 2 | DIRECCIÓN «−» · un rojo que DESAPARECE | F | ídem |
| 2 | DIRECCIÓN «−» · con multiplicidad | F | ídem |
| 2 | GUARDA 2 · EJECUCIÓN EFECTIVA | · | igual en todas partes |
| 2 | GUARDA 3 · FRESCURA | F, **G (reloj)** | la regex `arrancó hace 3\d{3} s` tolera **0–399 s** entre `beforeAll` y la aserción; §2 corre antes que los tests de 180 s, así que hoy sobra margen |
| 2 | GUARDA 3.bis · sin `startTime` | · | igual |
| 2 | GUARDA 3.ter · informe del FUTURO | **G (reloj)** | tolera **< 540 s** de retraso |
| 2 | GUARDA 3.quinquies · `--edad-max 0` | F | vacua en POSIX para separadores |
| 2 | GUARDA 3.quater · `--edad-max` sin número | F | ídem |
| 3 | COBERTURA · `coverageMap` corta | F | ídem |
| 3 | PARALELISMO · las 11 formas que serializan | · | igual (usa `--config` inexistente; jest no llega a correr) |
| 3 | **PARALELISMO · un porcentaje que resuelve a un proceso** | **E** | **roja con 1 CPU**: su propio control (`--maxWorkers=100%`) también resolvería a 1 proceso y se rechazaría. Con ≥ 2 CPU es sano (MEDIDO en 2/3/4/8/12/16) |
| 3 | PARALELISMO · medir en serie sale 1 | · | igual |
| 3 | `--repetir` exige un entero ≥ 1 | · | igual |
| 3 | PARALELISMO · `--permitir-serial` | · | igual |
| 3 | NUNCA MUDO · sin informe legible | · | igual |
| 3 | NUNCA MUDO · sin baseline | · | igual |
| 3 | sin argumentos: uso y salida 2 | · | igual |
| 4 | **las clases y la multiplicidad, con jest real** | **C, C.bis** | **roja** si algún ancestro de `os.tmpdir()` se llama `tests`, o si el temporal está en otra unidad de Windows |
| 4 | **el comando canónico `--gate`** | **C, C.bis** | ídem |
| 4 | **SUITE · con jest real** | **C, C.bis** | ídem |
| 4 | SUITE · si la suite rota va SOLA | · | igual (asevera la guarda 2, sin rutas en el oráculo) |
| 4 | SINNOMBRE · con jest real | · | igual (la línea `SINNOMBRE` no lleva ruta) |
| 4 | `--gate` impone `--coverage=false` | · | igual (lee el espía, no rutas) |
| 4 | `--gate` A SECAS · baseline por defecto | · | igual; cuenta líneas contra el fichero, no contra su contenido |
| 4 | **DISCREPANCIA · dos corridas distintas** | **C, C.bis** | **roja** por la misma causa |
| 4 | M4 · no deja temporales atrás | · | igual — y está bien escrito: fija `TEMP`, `TMP` **y** `TMPDIR`, o sea las tres que mira `os.tmpdir()` en los dos sistemas |
| 4 | GUARDA 2 · N corridas catastróficas | · | igual |
| 5 | un rojo nuevo se LEGALIZA con una línea | F | vacua en POSIX para separadores |
| 5 | los comentarios del baseline se ignoran | F | ídem |

### 5.2 · Los tres hallazgos del barrido, dichos aparte

**(1) Cuatro tests de §4 suponen una propiedad de `os.tmpdir()`.** Sus oráculos
están escritos a mano —`FALLA rojo.test.js`, `SUITE rota.test.js`,
`FALLA alterna.test.js`— y dependen de que `rutaRelativa` caiga en el
**basename**, cosa que sólo pasa si **ningún** segmento ancestro se llama
`tests`. MEDIDO con `TEMP=…\tests\tmp` (misma unidad): **4 rojos de 37**, y son
exactamente esos cuatro. No es la misma enfermedad que V95 —aquí no hay entorno
que lo convierta en vacuo, sólo en rojo— pero es el mismo género: **un oráculo
que supone una propiedad del entorno que nadie comprueba**. Lo dejo señalado,
**no arreglado**: cambiarlo toca cuatro tests que hoy están verdes en los dos
sistemas, y el WP pedía que un verde volviera a verde, no un refactor.

**(2) En Windows la suite es más estricta que en Linux, y nadie lo sabía.**
MEDIDO mutando `rutaRelativa`:

| mutación | resultado en Windows |
|---|---|
| fuera `.split(path.sep).join('/')` | **37 passed** — redundante aquí |
| fuera `.split('\\').join('/')` | **37 passed** — redundante aquí |
| fuera **las dos** | **14 failed** |

O sea: las dos mitades son **individualmente redundantes** (cada plataforma sólo
necesita una), y el par sostiene 14 aserciones **en Windows**.
**DEDUCCIÓN, marcada como tal**: en POSIX esas 14 no lo sostienen, porque la
rama nativa no produce ni una contrabarra y la normalización es la identidad.
La premisa **sí** está medida:
`path.posix.relative('/home/runner/work/V_SDK/V_SDK', …)` → `"tests/unit/uno.test.ts"`,
frente a `path.win32.relative(…)` → `"tests\\unit\\uno.test.ts"`.
Es **el espejo exacto de V95**, pero en la dirección buena: allí Windows tapaba
un hueco de CI; aquí Windows tapa un hueco de POSIX **sin producir falsos
rojos**. Y no es defecto del instrumento: es que en cada plataforma sólo una de
las dos líneas trabaja. **No lo he tocado** — está fuera de mi ALCANCE_DIFF y no
hay defecto que demostrar.

**(3) Un hueco de producción que este barrido destapa y NO he tocado.** En
Windows, `path.relative` entre **unidades distintas** no devuelve `..` sino la
ruta absoluta de destino:

```
path.win32.relative('C:\\a', 'D:\\b\\tests\\x.test.ts')  ===  'D:\\b\\tests\\x.test.ts'
```

Así que un informe nacido en **otra unidad** no se detecta como ajeno y su línea
sale con la ruta absoluta entera. Es un hueco real de `rutaRelativa`, no de las
fixtures. **No lo arreglo**: mi ALCANCE_DIFF sólo me deja tocar
`scripts/rojos-jest.mjs` si demuestro que el defecto está ahí *y entonces me
paro y lo digo* — el defecto **de este WP** no está ahí, y éste es otro,
distinto, que no produce el rojo de CI (el runner es un solo sistema de
ficheros). Queda **declarado**, con su medida, para quien quiera darle un WP.

---

## 6 · El arreglo, en cuatro piezas

1. **`correr()` y `elMutanteDebeCaer()` reciben `cwd`** (antes clavado en
   `RAIZ`). No es comodidad: el instrumento saca su raíz de `process.cwd()`, así
   que **el cwd de la invocación es la condición bajo prueba**. Mientras estuvo
   clavado, la única condición que la suite sabía medir era la de la máquina
   donde se corriera. Los otros 35 tests siguen invocando con el valor por
   defecto: el cambio es aditivo.
2. **`vieneDeOtraRaiz(raiz, ruta)`**: el criterio del instrumento, copiado
   literal, para que la suite **demuestre** la ajenidad en vez de suponerla.
3. **`RAIZ_AJENA`** derivada de `RAIZ` (hermana, nunca descendiente) y
   **`RAIZ_SIMULADA_CI`** (`<tmp>/runner/work/V_SDK/V_SDK`, directorio que existe
   de verdad para poder ser `cwd`). Dos fixtures, una por estilo de separador.
4. **Un test nuevo** que deja el defecto escrito: con la fixture bajo la raíz del
   proceso, **el mutante sobrevive**. 36 → 37 tests.

El mensaje de `MUTANTE SUPERVIVIENTE` ahora dice **en qué raíz** sobrevivió. El
de CI no lo decía, y por eso el fallo se leía como un misterio.

---

## 7 · Qué queda sin cubrir

1. **No he corrido nada en Linux.** Reproduzco la **condición**, no la
   plataforma. Los ejes de POSIX que quedan sin observación directa:
   `path.sep`, el comportamiento de `path.posix.relative` dentro de jest, y el
   node 20 de CI frente al 22 de aquí. La comprobación de verdad es el próximo
   run del remoto — que **no puedo lanzar**: no empujo.
2. **Los cuatro tests de §4 que suponen `os.tmpdir()`** (§5.2·1) quedan
   señalados y **no arreglados**.
3. **La asimetría Windows/POSIX de la normalización de separadores** (§5.2·2)
   queda señalada y **no arreglada**: las 14 aserciones que en Windows la
   sostienen no la sostienen en POSIX. Nadie vigila esa línea allí.
4. **El hueco entre unidades de Windows** (§5.2·3): declarado, medido, sin WP.
5. **El eje de reloj** (`GUARDA 3` y `GUARDA 3.ter`): tolerancias de 399 s y
   540 s, holgadas hoy, no vigiladas por nadie. Si algún día §2 corriera después
   de los tests de jest real, habría que volver a mirarlo.
6. **El eje ICU**: `localeCompare` discrimina en los 5 locales probados y en el
   de esta máquina, pero **no he podido probar un node sin ICU completa** (aquí
   no hay uno). Si CI lo tuviera, `ORDEN CANÓNICO` saldría **rojo por mutante
   superviviente** — el mismo modo de fallo que V95, por otro eje. Hoy no pasa:
   CI usa `setup-node@v4` con node 20, que trae ICU completa de serie.
7. **La cobertura de `rutaRelativa` sigue siendo por mutación, no exhaustiva**:
   sólo se ancla la mutación `lastIndexOf('tests') → -1`. La sub-rama
   `i < 0 → basename` no tiene mutante propio; la ejercitan de hecho los cuatro
   tests de §4 (sus rutas de temporal no llevan segmento `tests`), pero **de
   rebote**, no por diseño.

---

## 8 · Comprobaciones de método

- **`git stash`**: no usado ni una vez.
- **`npx`**: no usado. Jest se invoca por su binario con el node actual
  (`node node_modules/jest/bin/jest.js`), como hace el propio instrumento.
- **`node_modules` faltaba** en el worktree: instalado con **`npm ci`**, nunca
  `npm install`. *(Nota de método: mi primera comprobación —`ls node_modules |
  head -3 && echo OK`— dio «OK» con el directorio ausente, porque el código de
  salida de una tubería es el del último mandato. Afirmación más ancha que la
  evidencia, en la primera línea del WP.)*
- **Contrabando**: `git status --short` tras `npm ci`, tras cinco corridas de la
  suite y tras el gate completo → **sólo `scripts/tests/rojos-jest.test.ts`**.
- **El instrumento no se ha tocado**: para medir el eje F hubo que mutarlo y
  restaurarlo; comprobado con `git status --short scripts/rojos-jest.mjs` →
  **vacío**, y con `diff` contra la copia previa → idéntico.
- **Fuera del worktree**: sólo el scratchpad de la sesión, y el WP lo autorizaba
  explícitamente («copia el árbol a una ruta que imite la del runner»). El disco
  virtual `subst V:` se **deshizo** (`subst V: /D`, comprobado con `subst` →
  vacío), la unión a `node_modules` se **borró** antes, y las dos copias
  (`runner-root`, `tmp-con-tests`) se **eliminaron**.
- **TypeScript**: `tsc -p tsconfig.json --noEmit` → 12 líneas de error, **todas
  preexistentes en `src/**`** (los 3 ficheros TS2353/TS1479 que documenta el
  encabezado del baseline). **Cero** en `scripts/tests/rojos-jest.test.ts`.
- **`eslint`** no mira `scripts/` (`npm run lint` = `eslint src --ext ts`), así
  que este fichero no pasa por ahí ni antes ni ahora.
- **`scripts/rojos-jest.baseline.txt`**: **no tocado**. Verificado por el propio
  gate: `conjunto de rojos IDENTICO al declarado`, exit 0.

### 8.1 · Registro de evidencia

| # | qué | mandato |
|---|---|---|
| 1 | el síntoma en el remoto | `gh run view 30717696234 --log-failed` |
| 2 | la asimetría de `path.relative` | `node -e "…path.relative…"` |
| 3 | repro con raíz parametrizada | guion de scratchpad, descrito entero en §2.1 |
| 4 | el `subst` no sirve (jest hace realpath) | sonda `sonda-raiz.test.ts` dentro de jest |
| 5 | **rojo antes**, condición B | jest sobre la copia con la fixture transpuesta → **1 failed / 36** |
| 6 | **verde después**, condición B | ídem con el fichero de V95 → **37 passed** |
| 7 | verde después, condición A | jest en el worktree → **37 passed** |
| 8 | eje B (dónde vive el árbol) | suite pre-arreglo en la copia → **36 passed** |
| 9 | eje C (`tests` en el temporal) | `TEMP=TMP=TMPDIR=…\tests\tmp` → **4 failed / 37** |
| 10 | eje C.bis (otra unidad) | temporal en `V:` → **5 failed / 37**, la 5ª avisa por su nombre |
| 11 | ejes D y E | guion de scratchpad: `localeCompare` sobre la fixture de `ORDEN`, y la aritmética de `PARALELISMO` sobre 7 valores de `os.cpus().length` |
| 12 | eje F (separadores) | 3 mutaciones × suite completa → 37 / 37 / **14 failed** |
| 13 | el gate del mundo | `node scripts/rojos-jest.mjs --gate` → **IDENTICO**, exit 0 |
