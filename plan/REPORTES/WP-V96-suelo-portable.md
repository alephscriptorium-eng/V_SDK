# WP-V96 · P1 — la rama que medía distinto en cada plataforma

> **El instrumento no estaba roto: medía bien dos cosas distintas. Lo que faltaba
> era un test que decidiera cuál de las dos se mide.**

---

## 0 · Qué es de fiar aquí y qué no

- **MEDIDO en esta máquina** (Windows 11, 12 CPU, node v22.21.1, jest 29.7.0,
  árbol `C:/S_LAB/wt/v-v96`): todo lo que lleva la palabra **MEDIDO**, con la
  orden exacta al lado y su salida literal.
- **REPRODUZCO LA CONDICIÓN, NO LA PLATAFORMA.** No he corrido nada en Linux ni
  en node 20, y no puedo: no empujo. Lo que reproduzco es **la condición que
  produce la diferencia** —que el entorno no defina `HOMEPATH`/`HOMEDRIVE`—,
  igual que WP-V95 reprodujo la suya montando una raíz con forma de runner.
  Está dicho en cada tabla que lo usa.
- **Sin tocar**: `src/**` (verificado: `git diff --stat -- src` vacío),
  `scripts/rojos-jest.mjs` y `scripts/rojos-jest.baseline.txt` (verificado:
  `git diff --stat` vacío sobre los dos). El defecto de este WP **no** estaba en
  el instrumento ni en el código de producto.
- **Tres ficheros tocados**, los tres dentro del ALCANCE_DIFF:
  `tests/unit/core/logging/redact.test.ts`, `scripts/tests/rojos-jest.test.ts`,
  `scripts/cobertura.suelo.json`.

---

## 1 · La rama, por fichero y línea

### `src/core/logging/redact.ts:267`

```ts
function homePrefixes(): string[] {
    const raw = [
        process.env.HOME,                                     // :265
        process.env.USERPROFILE,                              // :266
        process.env.HOMEPATH && process.env.HOMEDRIVE         // :267  ← LA RAMA
            ? `${process.env.HOMEDRIVE}${process.env.HOMEPATH}`
            : undefined
    ].filter((p): p is string => typeof p === 'string' && p.length > 3);
```

La rama es el **operando derecho del `&&`** de la línea 267, columnas 32-53
(`process.env.HOMEDRIVE`). Istanbul instrumenta un `&&` como `binary-expr` con
una localización por operando, y cuenta cubierta cada una que se **ejecuta**:

- **en Windows** `HOMEPATH` existe → el `&&` no corta → el derecho se evalúa →
  **2 de 2** localizaciones cubiertas;
- **sin `HOMEPATH`** (Linux) → el `&&` corta en el izquierdo → el derecho **no
  se evalúa jamás** → **1 de 2**.

**Diferencia: exactamente una rama.** Y explica por qué las otras tres métricas
coincidían *exactamente*: todo esto ocurre **dentro de una sola sentencia**
(`const raw = [...]`), así que ni `statements`, ni `lines`, ni `functions` se
mueven. El **ternario** de las líneas 267-269 (`cond-expr`) sale empatado: una
localización a cada lado, una en cada plataforma.

Ningún test fijaba esas cuatro variables de entorno, de modo que **la medida la
decidía la máquina**. Ésa era toda la enfermedad.

### La prueba, contador a contador

Sonda sobre `coverage/coverage-final.json` (guion de scratchpad, no commiteado;
lee `branchMap`/`b` y filtra por fichero y línea). **Antes del arreglo**:

| condición | `#6` cond-expr (267) | `#7` binary-expr (267) | `#8` filter (270) |
|---|---|---|---|
| **A** · Windows tal cual | `[99, 0]` → 1 cubierta | `[99, 99]` → **2 cubiertas** | `[297, 297]` → 2 |
| **B** · sin `HOMEPATH`/`HOMEDRIVE` | `[0, 99]` → 1 cubierta | `[99, 0]` → **1 cubierta** | `[297, 198]` → 2 |

Salida literal de la sonda, condición B:

```
redact.ts #6 cond-expr   linea 267 counts=[0,99]   locs=["268:14..268:63","269:14..269:23"]
redact.ts #7 binary-expr linea 267 counts=[99,0]   locs=["267:8..267:28","267:32..267:53"]
redact.ts #8 binary-expr linea 270 counts=[297,198] locs=["270:33..270:54","270:58..270:70"]
```

---

## 2 · El síntoma, reproducido antes de tocar nada

**Orden**: `node node_modules/jest/bin/jest.js` y después
`node scripts/cobertura-trinquete.mjs`, sobre el árbol **sin modificar**.

```
censo: 95 ficheros en src · 86 en el mapa · 9 ausentes (9 declarados)
  statements  1541 cubiertas (suelo 1541) · 26.1 %  informativo, NO decide
  branches     545 cubiertas (suelo 544) · 25.13 % informativo, NO decide
  functions    272 cubiertas (suelo 272) · 21.51 % informativo, NO decide
  lines       1519 cubiertas (suelo 1519) · 26.55 % informativo, NO decide

TRINQUETE · la cobertura SUBIÓ y el suelo no lo recoge:
    branches: 545 cubiertas > suelo 544+0  (sobran 1)
```
`EXIT=1`

Es **literalmente** el rojo que `cobertura.suelo.json` declaraba como
consecuencia viva. El trinquete tenía razón: veía una diferencia real.

**Orden** para la condición B (misma máquina, mismo árbol sin modificar):

```
unset HOMEPATH && unset HOMEDRIVE && node node_modules/jest/bin/jest.js --coverageDirectory=cov-sin-homepath
```

```
Test Suites: 12 passed, 12 total
Tests:       1 skipped, 422 passed, 423 total
{"lines":1519,"statements":1541,"functions":272,"branches":544}
```

| métrica | A · Windows | B · condición de CI | ¿difiere? |
|---|---|---|---|
| statements | 1541 | 1541 | no |
| **branches** | **545** | **544** | **sí, en 1** |
| functions | 272 | 272 | no |
| lines | 1519 | 1519 | no |

Coincide **exactamente** con lo que el orquestador midió contra el runner real.
La condición está bien elegida: no es «Windows contra Linux», es «con `HOMEPATH`
contra sin `HOMEPATH`».

---

## 3 · El arreglo: dejar de suponer el entorno, imponerlo

`tests/unit/core/logging/redact.test.ts`, un `describe` nuevo con **tres** tests
que fijan las cuatro variables (`HOME`, `USERPROFILE`, `HOMEDRIVE`, `HOMEPATH`)
en `beforeEach` y las restauran en `afterEach`:

| test | `&&` derecho | ternario | qué asevera además |
|---|---|---|---|
| `HOMEDRIVE` + `HOMEPATH` | **se evalúa** | consecuente | `Q:\Users\v96\proyectos\config.json` → `~\proyectos\config.json` |
| sin `HOMEPATH`, con `HOMEDRIVE` | corta | alternativa | tapa `/home/v96` **y** deja intacta una ruta bajo `Q:` — o sea, no compuso |
| con `HOMEPATH`, sin `HOMEDRIVE` | **se evalúa** (y da falso) | alternativa | no queda medio home suelto: el texto sale entero |

Con eso, **las dos localizaciones del `&&` y las dos del ternario se ejecutan en
cualquier plataforma**. El número deja de depender del entorno.

No es sólo contabilidad: la composición `HOMEDRIVE+HOMEPATH` es **código de
Windows que en CI no se ejecutaba jamás**, y ahora sí se vigila. El redactor es
la garantía de «nada de secretos en el log»; el nombre de cuenta del usuario es
justo lo que tapa.

**El número sube, y va con su medida al lado** — MEDIDO, suite entera:

| | statements | branches | functions | lines |
|---|---|---|---|---|
| antes · condición A | 1541 | 545 | 272 | 1519 |
| antes · condición B | 1541 | **544** | 272 | 1519 |
| **después · condición A** | 1541 | **546** | 272 | 1519 |
| **después · condición B** | 1541 | **546** | 272 | 1519 |

Sube **dos** en la condición de CI y **una** aquí, y acaba **en el mismo sitio**:
el ternario pasa a estar cubierto por los dos lados en las dos condiciones, cosa
que antes no pasaba en ninguna.

### 3.1 · Que nadie lea «el suelo subió» como «se ablandó algo»

Conviene decirlo con todas las letras, porque un lector futuro verá `544 → 546`
y el reflejo correcto ante un suelo que se mueve es desconfiar:

> **546 no es un suelo relajado: es una rama que antes no vigilaba nadie y ahora
> sí.**

Un suelo se ablanda cuando **baja** para dejar pasar una pérdida. Aquí **sube**,
y sube porque hay **más código ejercitado que ayer**, no menos exigencia. Las dos
localizaciones nuevas son la composición `HOMEDRIVE + HOMEPATH` de
`redact.ts:267-269`: **código de Windows que en CI no se ejecutaba jamás** y que,
en la máquina donde sí se ejecutaba, lo hacía por accidente del entorno y no
porque ningún test lo pidiera. Hoy lo piden tres tests, con su oráculo, en
cualquier plataforma.

Y el trinquete queda **más estricto, no menos**: con el suelo en 546, el informe
que ayer pasaba —545 ramas— hoy es rechazado por regresión (§4.3, MEDIDO,
`exit 1`). Si alguien borra esos tres tests, el gate lo caza. Antes no había
nada que cazar, porque los dos números legítimos convivían y el instrumento no
podía saber cuál mirar.

---

## 4 · El trinquete, mismo veredicto en las dos condiciones

Las dos corridas son **sobre el mismo árbol y la misma máquina**; lo único que
cambia entre ellas son dos variables de entorno. Reproduzco **la condición**, no
la plataforma.

### 4.1 · Condición A — Windows tal cual

```
$ node -e "…"
HOMEPATH="\\Users\\aleph"  HOMEDRIVE="C:"  platform=win32  node=v22.21.1  cpus=12

$ node node_modules/jest/bin/jest.js
Test Suites: 12 passed, 12 total
Tests:       1 skipped, 428 passed, 429 total

$ node scripts/cobertura-trinquete.mjs
censo: 95 ficheros en src · 86 en el mapa · 9 ausentes (9 declarados)
  statements  1541 cubiertas (suelo 1541) · 26.1 %  informativo, NO decide
  branches     546 cubiertas (suelo 546) · 25.18 % informativo, NO decide
  functions    272 cubiertas (suelo 272) · 21.51 % informativo, NO decide
  lines       1519 cubiertas (suelo 1519) · 26.55 % informativo, NO decide

cobertura: censo COMPLETO y unidades cubiertas EN EL SUELO declarado
EXIT_TRINQUETE_A=0
```

### 4.2 · Condición B — la condición de CI, reproducida

```
$ ( unset HOMEPATH; unset HOMEDRIVE; … )
HOMEPATH=undefined  HOMEDRIVE=undefined  platform=win32  node=v22.21.1

$ node node_modules/jest/bin/jest.js --coverageDirectory=cov-ci
Test Suites: 12 passed, 12 total
Tests:       1 skipped, 428 passed, 429 total

$ node scripts/cobertura-trinquete.mjs --cobertura cov-ci
censo: 95 ficheros en src · 86 en el mapa · 9 ausentes (9 declarados)
  statements  1541 cubiertas (suelo 1541) · 26.1 %  informativo, NO decide
  branches     546 cubiertas (suelo 546) · 25.18 % informativo, NO decide
  functions    272 cubiertas (suelo 272) · 21.51 % informativo, NO decide
  lines       1519 cubiertas (suelo 1519) · 26.55 % informativo, NO decide

cobertura: censo COMPLETO y unidades cubiertas EN EL SUELO declarado
EXIT_TRINQUETE_B=0
```

**Mismo veredicto, mismos cuatro números, exit 0 en las dos.** Antes de este WP
la misma pareja de corridas daba `545 / 544` y **exit 1 en la condición A**.

### 4.3 · Y el guardián sigue mordiendo — no lo he ablandado

Que salga verde en las dos condiciones no vale si ha dejado de fallar. Las dos
direcciones, MEDIDAS contra el suelo nuevo:

```
$ node scripts/cobertura-trinquete.mjs --cobertura <informe PREVIO al arreglo> --edad-max 0
TRINQUETE · la cobertura BAJÓ:
    branches: 545 cubiertas < suelo 546  (faltan 1)
  Se perdieron unidades cubiertas. Esto NO se arregla bajando el suelo: …
EXIT=1

$ node scripts/cobertura-trinquete.mjs --cobertura <informe con una rama de más> --edad-max 0
TRINQUETE · la cobertura SUBIÓ y el suelo no lo recoge:
    branches: 547 cubiertas > suelo 546+0  (sobran 1)
EXIT=1
```

*(`--edad-max 0` es necesario porque esos dos informes son copias guardadas; el
propio instrumento lo anuncia en voz alta —`AVISO — prueba de frescura
DESACTIVADA a petición`—, que es exactamente para lo que existe esa línea.)*

### 4.4 · El gate de rojos, intacto

```
$ node scripts/rojos-jest.mjs --gate
conjunto de rojos IDENTICO al declarado
EXIT_GATE=0
```

`scripts/rojos-jest.baseline.txt` **no se ha tocado**: los tres tests nuevos
entran en verde, no se legaliza ningún rojo.

### 4.5 · Y el diff de tests no ablanda nada — CA 5

```
$ git diff -- scripts/tests tests | grep -E '^\+' \
    | grep -E '(it|test|describe)\.(skip|todo|failing)\(|(^|[^a-zA-Z])x(it|describe)\(|(^|[^a-zA-Z])f(it|describe)\('
$ echo $?
1        ← ninguna coincidencia
```

Sobre los **ficheros enteros** aparecen dos coincidencias, y las dos están
**dentro de una cadena**: son el contenido del proyecto mínimo `rojo.test.js`
(`"  test.skip('saltado a proposito', …)"` y `"  test.todo('por escribir');"`),
o sea la **fixture** que el instrumento debe clasificar como `OMITE`. Existían
antes de este WP y no son tests saltados de esta suite. Ningún umbral bajado:
el único número que se mueve es el suelo, **hacia arriba**, y va con su medida.

| corrida | tests |
|---|---|
| antes | `1 skipped, 422 passed, 423 total` |
| después | `1 skipped, 428 passed, 429 total` |

El `1 skipped` es **el mismo de siempre**: no lo he añadido yo (`git diff` no
introduce ningún `.skip`).

---

## 5 · Los vecinos censados por V95 y enrutados aquí

Cuatro **cerrados con medida**, dos **enrutados con razón escrita**. Ninguno
queda sólo declarado.

### 5.1 · CERRADO · las 4 fixtures que suponían el nombre del temporal

**El supuesto**: los cuatro tests de § 4 de `scripts/tests/rojos-jest.test.ts`
llevan el oráculo **escrito a mano** con la ruta dentro —`FALLA rojo.test.js`,
`SUITE rota.test.js`, `FALLA alterna.test.js`—, y eso sólo es el basename si
**ningún ancestro de `os.tmpdir()` se llama `tests`**. Lo dice `rutaRelativa`
(`scripts/rojos-jest.mjs:127-129`):

```js
const partes = String(absoluta).split(/[\\/]/);
const i = partes.lastIndexOf('tests');
r = i >= 0 ? partes.slice(i).join('/') : partes[partes.length - 1];
```

**El arreglo**: los proyectos mínimos cuelgan ahora de un segmento `tests`
**propio** (`escribirMini`: `path.join(TMP, 'tests', nombre)`), y `lastIndexOf`
devuelve **siempre el más profundo**, haya los que haya por encima. El oráculo
pasa a ser literal y portable: `tests/paqueteA/rojo.test.js`. **No se toca el
instrumento.**

**MEDIDO**, misma máquina, mismo comando, sólo cambia el temporal:

```
TEMP=TMP=TMPDIR=…\scratchpad\tmp-con-tests\tests\tmp
node node_modules/jest/bin/jest.js scripts/tests/rojos-jest.test.ts --coverage=false
```

| fichero | resultado |
|---|---|
| **antes** (el de V95, restaurado con `git checkout --`, sin `stash`) | `Tests: 4 failed, 33 passed, 37 total` |
| **después** (este WP) | `Tests: 40 passed, 40 total` |

Y los cuatro rojos de la corrida «antes» son **exactamente** los cuatro que V95
había censado:

```
× las clases y la multiplicidad, sobre un informe que ha escrito jest
× el comando canónico `--gate` corre jest él mismo y compara
× SUITE · una suite que revienta al importarse, con jest real
× DISCREPANCIA · dos corridas que dan conjuntos distintos se denuncian
```

**Dos tests nuevos para que no vuelva a entrar en silencio:**

- `PRECONDICIÓN · los oráculos de § 4 no dependen de cómo se llame el temporal`
  — demuestra, para los cuatro proyectos, que el segmento inmediatamente
  posterior al último `tests` es el paquete, y que el proyecto es **ajeno** a la
  raíz del proceso (o sea que la rama de reserva entra de verdad). Si alguien
  deshace el anidamiento, el rojo sale **aquí y con su nombre**.
- `SIN SEGMENTO «tests» · un informe ajeno que no trae ninguno cae al BASENAME`
  — la sub-rama `i < 0` estaba cubierta **de rebote** por esos cuatro tests
  (lo señaló V95 §7.7). Al quitarles el supuesto se habría quedado sin nadie:
  ahora tiene test propio, con ruta **sintética** (`/v96-sin-segmento/…`, en los
  dos estilos de separador), sus dos precondiciones comprobadas y su mutante
  (`: partes[partes.length - 1];` → `: String(absoluta);`), que cae.

### 5.2 · CERRADO · el que suponía ≥ 2 CPU — y un segundo caso que no estaba censado

**El supuesto**: el test `PARALELISMO · un porcentaje que resuelve a un proceso`
calculaba el porcentaje serial como `Math.max(1, Math.floor(100 / cpus))`. Con
**1 CPU** eso da **100**, o sea **el mismo argumento** que su propio control
`--maxWorkers=100%`: el test se contradecía y salía rojo sin que nada estuviera
mal.

**Y hay un segundo caso que V95 no marcó**: el test de las once formas seriales
llevaba `--maxWorkers=50%` como control de «esto NO se rechaza». Con 1 CPU,
`Math.floor(1 × 50 / 100)` = **0**, la guarda lo rechaza —con razón— y ese
control también se cae. Son dos, no uno.

**Reproduzco la condición, no la máquina** (no tengo una de 1 CPU). La decisión
entera está en `trabajadoresPedidos` (`scripts/rojos-jest.mjs:363`), una sola
línea con un solo `os.cpus().length`. Copia del instrumento en el scratchpad con
**una** sustitución anclada (`os.cpus().length` → `1`) y nada más. **MEDIDO**:

| instrumento | orden | salida | exit |
|---|---|---|---|
| real (12 CPU) | `--repetir 2 -- --maxWorkers=100% --config=v91-no-existe.json` | no lo rechaza: llega a lanzar jest (`jest no llegó a escribir el JSON`) | 0 |
| **1 CPU reproducida** | ídem | `rojos-jest: estos argumentos serializan jest: --maxWorkers=100%` | **2** |

O sea: con 1 CPU el control viejo **fallaba de verdad**, y el instrumento
**tenía razón**. No es una suposición mía: está medido.

**El arreglo**: tres funciones con el recuento de CPU **inyectable**
—`procesosDePorcentaje`, `pctQueSerializa`, `pctQueParaleliza`— que reproducen
la aritmética del instrumento, y `null` cuando **no existe** porcentaje que
paralelice. Los dos tests derivan de ahí sus porcentajes en vez de clavarlos, y
el caso de 1 CPU **no se salta**: se asevera lo que allí es verdad —que jest no
puede paralelizar y rechazarlo todo es correcto—. Test nuevo:

```
PARALELISMO · la aritmética del porcentaje, en SIETE recuentos de CPU — WP-V96
    [1, 100, null]   ← una sola CPU: NINGÚN porcentaje paraleliza
    [2, 99, 100] · [3, 66, 67] · [4, 49, 50] · [8, 24, 25] · [12, 16, 17] · [16, 12, 13]
```
y, de paso, los cinco puntos que V91 había anotado a mano con 12 CPU
(`9 % → 1 · 10 % → 1 · 20 % → 2 · 25 % → 3 · 50 % → 6`) quedan fijados como test.

### 5.3 · CERRADO A MEDIAS · el que supone ICU con collation

**No se puede cerrar del todo desde aquí y lo digo antes que nada.** El mutante
que importa en `ORDEN CANÓNICO` es `a < b` → `a.localeCompare(b)`. En un node
sin ICU con collation (`--without-intl`), `localeCompare` degrada a comparación
por unidad de código, los dos comparadores coinciden, **el mutante sobrevive** y
el test sale rojo sin que nada esté mal. **No hay fixture que lo arregle**: si
los dos comparadores son la misma función, ninguna cadena los distingue. Y no
puedo probarlo: `--without-intl` es opción de **compilación**, no de arranque, y
en esta máquina no hay un node así.

**Lo que sí he hecho**: que la suposición deje de ser tácita. El test comprueba
ahora, **antes** de invocar al mutante, que en ESTE node los dos pares de la
fixture que lo sostienen (`V91 Zulu`/`V91 aaa`, `V91 zzz`/`V91 ñu`) se ordenan
distinto con los dos comparadores, y enseña el ICU en el mensaje. Si algún día
falla, dirá **por su nombre** que el node no trae collation, en vez de aparecer
treinta líneas más allá como `MUTANTE SUPERVIVIENTE` — que es exactamente cómo
se leyó el fallo de CI que costó ver en V95.

**Residual enrutado**: probarlo de verdad exige un node sin ICU en CI. Hoy no
hace falta (`setup-node@v4` con node 20 trae ICU completa), pero el día que
cambie, el rojo saldrá explicado.

### 5.4 · ENRUTADO · `path.relative` entre unidades distintas de Windows

Es **hueco de producción** de `rutaRelativa`, no de fixture, y **no es el
defecto de este WP**. MEDIDO (V95 §5.2·3, verificado aquí):

```
path.win32.relative('C:\\a', 'D:\\b\\tests\\x.test.ts')  ===  'D:\\b\\tests\\x.test.ts'
```

No empieza por `..`, así que la rama de reserva **no entra** y un informe nacido
en otra unidad no se detecta como ajeno: su línea sale con la ruta absoluta
entera y el conjunto declarado deja de casar.

**Por qué no lo arreglo**: (a) mi ALCANCE_DIFF sólo me deja tocar el instrumento
si demuestro que el defecto de **este** WP está ahí, y no lo está —el defecto de
este WP estaba en `redact.ts` y en dos ficheros de test—; (b) el arreglo **no es
una línea**: hay que decidir el contrato (¿`path.parse(x).root !== path.parse(RAIZ).root`
cuenta como ajena?, ¿qué se emite entonces?), y esa decisión debe firmarse, no
colarse en un WP de cobertura; (c) **no produce el rojo de CI**: el runner es un
solo sistema de ficheros. Queda con su medida para quien le dé un WP.

---

## 6 · Qué NO cubro

1. **No he corrido nada en Linux ni en node 20.** Reproduzco **la condición**
   —ausencia de `HOMEPATH`/`HOMEDRIVE`, un temporal con ancestro `tests`, un
   instrumento que ve 1 CPU—, no la plataforma. La comprobación de verdad es el
   próximo run del remoto, que **no puedo lanzar**: no empujo.
2. **El eje node 20 vs node 22 sigue sin medir.** Lo que demuestro es que la
   diferencia de UNA rama que este mundo tenía firmada se explica **entera** por
   `HOMEPATH`, y que las otras tres métricas no se mueven. Si node 20
   instrumentara alguna rama distinta, este WP no lo vería. Nadie lo ha medido
   nunca, y sigue así.
3. **El eje ICU** (§5.3): la suposición queda dicha y autodenunciante, no
   eliminada. No se puede eliminar sin cambiar el mutante, y el mutante es lo
   que da valor al test.
4. **El hueco entre unidades de Windows** (§5.4): medido, enrutado, sin arreglar.
5. **La asimetría Windows/POSIX de la normalización de separadores** (V95
   §5.2·2): sigue igual. Las dos mitades de
   `.split(path.sep).join('/').split('\\').join('/')` son individualmente
   redundantes, cada plataforma sólo ejercita una, y en POSIX esas 14
   aserciones no las sostiene nadie. No produce falsos rojos, así que no es
   defecto — pero tampoco lo vigila nadie. **No lo he tocado.**
6. **`scripts/cobertura-trinquete.mjs` sigue sin tests propios.** Deuda heredada
   de V93. Este WP no la paga: lo he ejercitado a mano, en las dos direcciones y
   en las dos condiciones (§4), pero eso no es un test.
7. **El trinquete sigue leyendo el informe en vez de correrlo.** Un `touch` lo
   engañaría. Es una decisión de V93, con su motivo escrito, y no la reabro.
8. **No he tocado `src/`**, y la línea 267 de `redact.ts` **sigue escrita igual**.
   Se podría argumentar que el código también debería ser indiferente al
   entorno; yo sostengo que no: leer `HOMEDRIVE`/`HOMEPATH` sólo cuando existen
   es correcto, y el defecto no estaba en el código sino en que **nadie lo
   fijaba desde un test**. Cambiar producción para que un contador salga redondo
   habría sido el error.
9. **`git push`, `plan/BACKLOG.md`, `plan/REPORTES/` de otros WPs**: intactos.
   **Cero `git stash`** (para medir el «antes» usé `git checkout --` sobre un
   fichero previamente copiado al scratchpad, y lo restauré). **Cero `npx`**:
   jest se invoca por su binario, `node node_modules/jest/bin/jest.js`.

---

## 7 · Registro de evidencia — la orden exacta de cada medida

Todas desde `C:/S_LAB/wt/v-v96`. Jest siempre por su binario, **nunca `npx`**.

| # | qué mide | orden exacta | salida |
|---|---|---|---|
| 1 | dependencias del worktree (faltaban) | `npm ci` | exit 0 |
| 2 | el síntoma, antes de tocar nada | `node node_modules/jest/bin/jest.js` · `node scripts/cobertura-trinquete.mjs` | `branches 545 … (suelo 544) … SUBIÓ` · **exit 1** |
| 3 | la rama, contador a contador (A) | sonda de scratchpad sobre `coverage/coverage-final.json`, filtrando `redact.ts` líneas 255-285 | `#7 binary-expr linea 267 counts=[99,99]` |
| 4 | **la condición de CI, reproducida** (B) | `unset HOMEPATH && unset HOMEDRIVE && node node_modules/jest/bin/jest.js --coverageDirectory=cov-sin-homepath` | `branches 544` · las otras tres **idénticas** |
| 5 | la rama, contador a contador (B) | ídem sonda sobre `cov-sin-homepath/coverage-final.json` | `#7 … counts=[99,0]` ← **el operando derecho no se evalúa** |
| 6 | el arreglo, en el fichero solo | `node node_modules/jest/bin/jest.js tests/unit/core/logging/redact.test.ts --coverageDirectory=cov-probe` | `116 passed` · `#6 counts=[60,4]` `#7 counts=[64,62]` — **2/2 los dos** |
| 7 | vecino tmpdir · **después** | `TEMP=TMP=TMPDIR=…\tests\tmp` + `node node_modules/jest/bin/jest.js scripts/tests/rojos-jest.test.ts --coverage=false` | `40 passed, 40 total` |
| 8 | vecino tmpdir · **antes** | `git checkout -- scripts/tests/rojos-jest.test.ts` (copia previa en scratchpad, **sin `stash`**) + la misma orden | `4 failed, 33 passed, 37 total` — los cuatro censados por V95 |
| 9 | vecino CPU · **12 CPU** | `node scripts/rojos-jest.mjs --repetir 2 -- --maxWorkers=100% --config=v91-no-existe.json` | no lo rechaza (llega a lanzar jest) |
| 10 | vecino CPU · **1 CPU reproducida** | copia del instrumento con **una** sustitución anclada `os.cpus().length` → `1`, misma orden | `estos argumentos serializan jest: --maxWorkers=100%` · **exit 2** |
| 11 | **condición A, final** | `node node_modules/jest/bin/jest.js` · `node scripts/cobertura-trinquete.mjs` | `429 total` · `branches 546 (suelo 546)` · **exit 0** |
| 12 | **condición B, final** | `unset HOMEPATH; unset HOMEDRIVE; node …/jest.js --coverageDirectory=cov-ci` · `node scripts/cobertura-trinquete.mjs --cobertura cov-ci` | `429 total` · `branches 546 (suelo 546)` · **exit 0** |
| 13 | el trinquete sigue mordiendo, dirección «bajó» | `node scripts/cobertura-trinquete.mjs --cobertura <informe previo> --edad-max 0` | `BAJÓ · 545 < 546` · **exit 1** |
| 14 | ídem, dirección «subió» | ídem con un resumen retocado a 547 | `SUBIÓ · 547 > 546+0` · **exit 1** |
| 15 | gate de rojos | `node scripts/rojos-jest.mjs --gate` | `conjunto de rojos IDENTICO al declarado` · **exit 0** |
| 16 | ablandamiento | grep sobre las líneas `+` del diff de tests | **0 coincidencias**, exit 1 |

---

## 8 · Comprobaciones de método

- **`git stash`**: **no usado ni una vez**. Para medir el «antes» (evidencia 8)
  copié el fichero al scratchpad, `git checkout --` sobre ese fichero solo, medí
  y lo restauré con `cp`. Comprobado después con `git status --short`.
- **`npx`**: no usado. Jest se invoca por su binario con el node actual.
- **`git push`**: no. **`plan/BACKLOG.md`**: no tocado.
  **`plan/REPORTES/` de otros WPs**: no tocados (un solo fichero nuevo, el mío).
- **`node_modules` faltaba** en el worktree: instalado con **`npm ci`**.
- **Fuera del worktree**: sólo el scratchpad de la sesión (sonda de ramas,
  instrumento de 1 CPU, copias de informes, el temporal con forma
  `…\tests\tmp`). Nada de eso se commitea.
- **Contrabando**: `git status --short` al terminar da exactamente
  `M scripts/cobertura.suelo.json`, `M scripts/tests/rojos-jest.test.ts`,
  `M tests/unit/core/logging/redact.test.ts` y el reporte sin rastrear. Los
  directorios `cov-probe/`, `cov-sin-homepath/` y `cov-ci/` que usé para medir
  **están borrados** (no están en `.gitignore`, así que dejarlos habría
  ensuciado el árbol).
- **`src/**` intacto**, y `scripts/rojos-jest.mjs` + `scripts/rojos-jest.baseline.txt`
  intactos: `git diff --stat` vacío sobre los tres.
- **ts-jest type-checkea los dos ficheros de test en cada corrida**: las 12
  suites compilan y pasan, así que no hay error de tipos nuevo.
- **`eslint` no mira `scripts/` ni `tests/`** (`npm run lint` = `eslint src --ext ts`),
  así que estos ficheros no pasan por ahí — ni antes ni ahora. Dicho, no disimulado.
