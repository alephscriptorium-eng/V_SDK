# WP-V99 · El barrido de citas, con casa y con sus cegueras medidas

| dato | valor |
| ---- | ----- |
| rama | `wp/v99-barrido-con-casa` |
| alcance del diff | `scripts/**` + este reporte. Cero `src/`, cero `plan/BACKLOG.md`, cero `plan/CENSO-V12.md`, cero `plan/REPORTES/WP-V92-*.md` |
| encargo | E-4 de V92: el barrido vive embebido en un acta y no se puede ejecutar, versionar, testear ni poner en CI |
| entregado | `scripts/citas-rancias.mjs` + `scripts/tests/citas-rancias.test.ts` (29 tests, 14 reglas, 14 mutaciones, **0 supervivientes**) |
| equivalencia con V92 | demostrada cita a cita: **198 / 198** líneas de veredicto idénticas en `plan/REPORTES`, **38 / 38** en `plan` |
| veredicto del barrido | `plan/REPORTES` → **0 rancias / 1795 citas**, `exit 0` · `plan` → **24 rancias / 430**, `exit 1` (E-1, ajeno) |
| gates de la casa | `rojos-jest --gate` IDÉNTICO `exit 0` · `npm test` 457 verdes + 1 saltado / 13 suites · trinquete de cobertura `exit 0` |
| estado propuesto | listo para revisión |

---

## 0 · El encargo: un instrumento que vive en un acta no es un instrumento

WP-V92 barrió **1 518 citas** de `plan/REPORTES/` y halló 27 rancias. Funciona, y
su clasificación es buena. Pero su `ALCANCE_DIFF` le prohibía `scripts/`, así que
el barrido quedó **escrito literal dentro de un reporte**, y su propio autor lo
enrutó como **E-4**: «un gate que hay que copiar y pegar para ejecutar no lo
ejecuta nadie».

Eso no es una molestia de forma. Un instrumento sin fichero:

- **no se ejecuta** — hay que extraerlo a mano de un bloque markdown;
- **no se versiona** — si alguien lo mejora, el diff no existe;
- **no se testea** — y sus tres correcciones conocidas se pueden deshacer sin que
  nada se ponga rojo;
- **no entra en CI** — o sea que su veredicto vale sólo en la máquina de quien se
  acuerde de invocarlo.

Este WP cierra las cuatro. Y la tercera es la que importa: V92 **se censó tres
errores propios** con su coste medido, y esa es la parte valiosa del legado. Un
instrumento que arregló un bug sin dejar el test **no ha arreglado nada**.

---

## 1 · Dónde vive ahora

```
scripts/citas-rancias.mjs          el barrido, invocable, con --help y --reglas
scripts/tests/citas-rancias.test.ts  su suite, bajo el arnés de la casa (npm test)
```

```
$ node scripts/citas-rancias.mjs                    # los reportes (por defecto)
$ node scripts/citas-rancias.mjs --ambito plan      # los documentos vivos de plan/
$ node scripts/citas-rancias.mjs --verbose          # detalle de cada cita que no resuelve
$ node scripts/citas-rancias.mjs --json-out f.json  # las rancias, para un anotador
$ node scripts/citas-rancias.mjs --raiz <dir>       # otro árbol (lo usan los tests)
$ node scripts/citas-rancias.mjs --reglas           # censo de reglas, legible por máquina
$ node scripts/citas-rancias.mjs --help
```

Salidas: `0` sin rancias · `1` con rancias · `2` uso, ámbito inexistente **o
cuadre roto** (§ 6).

Tres decisiones de forma que no son cosméticas:

1. **La raíz por defecto es la del repo, no `process.cwd()`.** Un gate que cambia
   de objeto según desde dónde lo invoques no es un gate. Comprobado con un test
   que corre el instrumento desde dos directorios distintos y exige la misma raíz
   resuelta — no supuesta, impresa por el propio instrumento.
2. **Las banderas mandan, pero `AMBITO` / `VERBOSE` / `JSON_OUT` siguen valiendo**,
   que es como se invocaba en V92: quien copie una orden de aquel reporte no se
   encuentra un instrumento que no le contesta.
3. **La lectura de líneas es tolerante a `\r`.** Este árbol es CRLF
   (`core.autocrlf=true`) y V92 partía por `'\n'`, dejando un `\r` colgando al
   final de cada línea. Era inofensivo aquí y no lo sería en un checkout LF.
   **MEDIDO**: sobre este árbol las dos formas dan las mismas 13 cifras y el
   mismo veredicto — el cambio es robustez, no comportamiento.

---

## 2 · Equivalencia con V92: demostrada, no inspeccionada

La lógica de clasificación es la de V92. Eso no se afirma leyendo los dos
ficheros en paralelo: se **mide**, extrayendo el barrido literal del bloque `js`
de `plan/REPORTES/WP-V92-citas-rancias.md` a un fichero suelto y corriendo los
dos sobre **el mismo árbol y en el mismo instante**.

Los dos emiten, con `--verbose`, una línea por cita que no resuelve, con el mismo
formato: `[CLASE] informe.md:línea  cita  (mata:hash)`. Se comparan **ordenadas y
con multiplicidad**, no como conjuntos:

```
plan/REPORTES: V92=198 lineas  V99=198 lineas  identicas=true
plan         : V92=38 lineas   V99=38 lineas   identicas=true
```

Y los agregados, en los dos ámbitos:

| ámbito | | denominador | resuelven | no resuelven | no verificables | RANCIA | exit |
| ------ | - | ----------- | --------- | ------------ | --------------- | ------ | ---- |
| `plan/REPORTES` | V92 | 1795 | 1344 | 198 | 253 | 0 | 0 |
| `plan/REPORTES` | V99 | 1795 | 1344 | 198 | 253 | 0 | 0 |
| `plan` | V92 | 430 | 278 | 38 | 114 | 24 | 1 |
| `plan` | V99 | 430 | 278 | 38 | 114 | 24 | 1 |

**Cero divergencias en clase, cero citas de más, cero de menos.** Lo que cambia
de V92 a V99 es la **casa** (fichero, tests, CLI), el **desglose de la salida**
(§ 4 y § 6) y la **declaración de la ceguera** (§ 5) — no el veredicto.

---

## 3 · Reproducir el resultado de V92, y la cifra que hay que explicar

**CA-5 pedía dos cosas: cero rancias hoy, y un denominador mayor que 1 518.** Las
dos se cumplen —**0 rancias**, **1 676 citas**— pero la razón que traía el
encargo **no es la correcta**, y como el encargo dice que aquí el que se explica
soy yo, lo explico.

### 3.1 · El 1 518 **ya contaba** los ficheros de raíz

El encargo suponía que 1 518 era menor porque «el error nº2 dejaba 367 fuera».
No: el 1 518 de `WP-V92 §3.1` es la corrida **ANTES de las correcciones de
V92 a los reportes**, pero **DESPUÉS de que su autor arreglara el patrón**. Se
demuestra sin discutirlo, con el propio reporte de V92: de sus 27 rancias, las
filas 4, 9-11 y 23-24 de su tabla son coordenadas de **`package.json`** — un
fichero de la raíz, que se cita sin barra. Si el patrón no los hubiera mirado,
esas rancias no habrían aparecido en esa misma corrida. Los 367 estaban dentro.

### 3.2 · Entonces, ¿de dónde salen los 158 de diferencia?

De documentos nuevos, y se cierra **exacto**:

| corrida | documentos | denominador | RANCIA |
| ------- | ---------- | ----------- | ------ |
| V92 §3.1 «ANTES» | 28 | 1518 | 27 |
| V92 §3.2 «DESPUÉS» (ya con su propio reporte) | 29 | 1625 | 0 |
| **hoy, WP-V99** | **30** | **1676** | **0** |

`1625 → 1676` es **+51 citas por un solo documento**: el único reporte añadido
desde entonces es `plan/REPORTES/WP-V96-suelo-portable.md`, y **MEDIDO** con el
extractor del barrido aporta **exactamente 51** citas. `1625 + 51 = 1676`.

La otra edición de `plan/REPORTES/` posterior a V92 —una corrección de dos líneas
en el propio reporte de V92— **no añade ninguna cita**: su diff no contiene un
solo `ruta.ext`. Comprobado sobre el diff, no supuesto.

### 3.3 · Y una cita que cambió de clase por existir este WP

Antes de que este WP creara nada, el barrido daba `resuelven 1272` /
`EFIMERA 19`. Después: `1273` / `18`. La cita que se movió es la de **E-4**:
V92 escribió que el sitio natural del barrido era `scripts/citas-rancias.mjs`, y
mientras ese fichero no existió, el barrido clasificaba esa cita como **EFIMERA
— una propuesta**. Hoy resuelve.

**El instrumento mide que su propio encargo se ha cumplido.** No es una
casualidad simpática: es lo que significa que un reporte pueda citar el árbol.

---

## 4 · Las tres cegueras de V92: medidas hoy y con caso rojo

V92 dejó escritas tres equivocaciones propias con su coste de entonces. Aquí no
se repiten: se **vuelven a medir** contra el árbol de hoy —retirando la
corrección del instrumento y comparando— y se **anclan a un test**.

### 4.1 · Lo que cuesta cada ceguera HOY, medido

Se retira cada corrección del instrumento y se corre sobre el **árbol de este
commit**, en los **dos** ámbitos. Las cifras de la izquierda son las de V92, de
su día; las de la derecha están re-medidas hoy — que es lo que exige § 7 de
`plan/PRACTICAS.md`, y con más razón en el reporte que trae el gate.

Ámbito `plan/REPORTES` (31 documentos, denominador sano **1795**):

| ceguera | coste que V92 midió entonces | coste **re-medido hoy** |
| ------- | ---------------------------- | ----------------------- |
| **1 · `js` antes que `json`** | 10 falsos positivos | denominador intacto, pero `resuelven` cae **1344 → 1328**: **16 citas vivas** dejan de resolver (`EFIMERA` 24 → 38, `TRANSCRIP` 101 → 104) |
| **2 · ficheros de raíz sin barra** | **367 citas fuera**, 5 rancias ocultas | denominador **1795 → 1364**: **431 citas desaparecen** sin una línea de aviso. `de la raiz del repo` **435 → 4** |
| **3 · prefijo de mundo** | 12 falsos positivos | `OTRO-MUNDO` **4 → 0**; las 4 pasan a juzgarse contra el árbol equivocado (`ACTA` 39 → 40, `resuelven` 1344 → 1346) |

Ámbito `plan` (11 documentos, denominador sano **430**, y con **24 rancias
vivas** que son de otro — § 8.2). Aquí las tres duelen mucho más, porque es un
ámbito con deuda de verdad:

| ceguera | coste **re-medido hoy** sobre `plan` |
| ------- | ----------------------------------- |
| **1** | `RANCIA` **24 → 23**: una deuda real se disfraza de `EFIMERA` (7 → 10) |
| **2** | denominador **430 → 323** (−107) y `RANCIA` **24 → 20**: **cuatro deudas reales desaparecen del informe**. Es la reproducción viva, hoy, de las «5 rancias ocultas» que V92 midió |
| **3** | `OTRO-MUNDO` **40 → 0**: las 40 citas del léxico de otro mundo se juzgan contra este árbol; **16** pasan a «no resuelve» (`ACTA` 0 → 12, `EFIMERA` 7 → 11) |

Dos cosas que hay que leer juntas:

- **Sobre `plan/REPORTES` ninguna de las tres produce hoy una `RANCIA` falsa**,
  porque V92 ya corrigió todo lo que había. Su daño ahí es el denominador y la
  clasificación, no la deuda. Decirlo al revés sería vender una alarma que hoy no
  suena.
- **Sobre `plan` sí:** la ceguera 2 esconde **4 rancias reales** y la 1 esconde
  **1**. O sea que el modo de fallo de V92 no es historia — sigue vivo en el otro
  ámbito, y ahí es donde un `PASS` silencioso haría daño.

Aun así, los casos rojos **no** se escriben contra el árbol real: sobre un árbol
que alguien corrija mañana, una ceguera puede dejar de producir veredicto falso y
el test se volvería verde sin que nadie arregle nada. Se escriben contra un mundo
sintético donde **siempre** lo produce.

### 4.2 · El mundo sintético, y por qué no se barre el repo de verdad

El veredicto de este barrido depende de la **historia de git**: cuándo nació el
informe, cuándo murió el fichero, cuántas líneas tenía aquel día. Sobre el repo
real eso cambia con cada commit, así que un test escrito contra él **caducaría
igual que las citas que el barrido persigue** — sería el chiste que este WP viene
a cerrar.

`scripts/tests/citas-rancias.test.ts` construye en un temporal un **repositorio
git de verdad** con seis commits, y el orden es el experimento entero:

| commit | qué pasa | para qué |
| ------ | -------- | -------- |
| c1 | nace el árbol: `package.json` (40 líneas), `src/largo.ts` (50), `src/podado.ts`, `src/temprano.ts`, `fixtures/vector.json` | el suelo |
| c2 | **muere `temprano.ts`** | antes de que exista ningún informe → `ACTA` |
| c3 | **nacen los informes** r01…r08 y r10 | citan lo que entonces era cierto |
| c4 | **muere `podado.ts`** | después de citarlo → `RANCIA` |
| c5 | **encogen** `largo.ts` (50→20) y `package.json` (40→20) | deriva de coordenada |
| c6 | nace r09, citando `largo.ts:40` | la coordenada **ya** era imposible → `ACTA` |
| — | r11 se escribe **sin commitear** | nace en HEAD → no se denuncia a sí mismo |

Con eso, **la misma coordenada `src/largo.ts:40` es `ACTA` en r09 y `RANCIA` en
r10**, y no hay forma de distinguirlas mirando el árbol de hoy: sólo git lo sabe.
Ésa es la rama (b) de V92 —la mitad silenciosa del problema— convertida en test.

El reparto de la fixture se fija en **un** test con las trece cifras delante, para
que una deriva de la fixture se lea en un sitio y no en veinte contradiciéndose.

### 4.3 · La prueba que pedía el encargo: retirar la corrección, no el mutante

Cada ceguera tiene su test con **pinza** —el instrumento real cumple, un mutante
con esa corrección desactivada no—. Pero la CA pide algo más fuerte: **que el test
se ponga rojo si la corrección se retira**. Así que se retira de verdad, en
`scripts/citas-rancias.mjs`, y se corre la suite:

| corrección retirada del instrumento | tests rojos de 29 | el test que la nombra |
| ----------------------------------- | ----------------- | --------------------- |
| ceguera 1 (`json` antes que `js`) | **6** | `CEGUERA 1 · json va antes que js…` ✅ rojo |
| ceguera 2 (ficheros de raíz) | **12** | `CEGUERA 2 · sin los ficheros de raíz…` ✅ rojo |
| ceguera 3 (prefijo de mundo) | **10** | `CEGUERA 3 · el prefijo de mundo…` ✅ rojo |

Con la ceguera 2 puesta, el fallo se lee así —y dice la cifra exacta que se ha
perdido, no «algo va mal»:

```
● WP-V99 · § 2 · las tres cegueras medidas de V92, como casos rojos › CEGUERA 2 ·
  sin los ficheros de raíz el DENOMINADOR encoge y se lleva una rancia consigo

    expect(received).toBe(expected) // Object.is equality
    Expected: 2
    Received: 0
    > 409 |             expect(c.deLaRaiz).toBe(2);
```

Restaurado el instrumento —comprobado byte a byte contra el respaldo— la suite
vuelve a **29 / 29**.

---

## 5 · La clase irreducible, declarada EN EL INSTRUMENTO

CA-3 pedía que la ceguera que este diseño **no** puede cerrar viva donde la lea
quien ejecuta. Vive en **tres** sitios, y los tres tienen test:

1. **En la salida de cada corrida**, sin bandera que la pida (regla `R13`).
2. **En `--help`**, que es donde mira quien aún no ha corrido nada.
3. **En la cabecera del fichero**, para quien lo abre a editarlo.

El texto, con el caso **re-medido hoy** —porque un caso de caducidad citado sin
re-medir sería el chiste otra vez—:

```
--- LO QUE ESTE VEREDICTO NO SIGNIFICA (ceguera irreducible) ---------------
Esto comprueba que una cita APUNTA A ALGO QUE EXISTE. No que diga la verdad.
Caso con nombre y ruta, de este mismo repo:
    plan/REPORTES/WP-V90-jest-determinista.md:357 cita plan/BACKLOG.md:153
    «que nombra `duration < 100 ms`». El fichero tiene 217 lineas, asi que
    :153 RESUELVE y este barrido la da por buena — pero hoy esa linea es la
    cabecera de una tabla y no nombra ningun `duration < 100 ms`.
    Verificable, pasa la verificacion, y falsa.
Cerrarla exige comparar el CONTENIDO citado (un ancla de texto por cita).
NO ESTA HECHO. RANCIA=0 significa «ninguna apunta al vacio», nunca «todas
dicen la verdad».
```

**La re-medición de hoy, 2026-08-02** (V92 la midió con `plan/BACKLOG.md` en 215
líneas y la línea 153 siendo «la fila de WP-V68»):

- `plan/BACKLOG.md` tiene hoy **217** líneas → `:153` **resuelve**;
- su línea 153 es hoy `| WP | brief | CA tentativo |`, la **cabecera de una
  tabla**;
- luego la cita sigue siendo **verificable, verificada y falsa**, y ha cambiado
  de contenido dos veces desde que se escribió.

El caso se conserva porque **empeora con el tiempo**, que es precisamente lo que
lo hace buen ejemplo. Y el test que lo vigila no comprueba «que haya un párrafo»:
comprueba que estén **la ruta, la coordenada y la frase citada**, y mata a un
mutante que borra la declaración de la salida.

---

## 6 · El denominador no es una opción, y el cuadre tampoco

CA-4: el denominador va en la salida **siempre**, con lo que revisó, lo que falló
y **lo que no pudo mirar, por clase**. La razón es la ceguera 2: existió porque
el denominador era **silencioso**.

Tres cosas que V92 no separaba y aquí sí:

- **Por origen**: `con directorio` frente a `de la raiz del repo`. Si la rama de
  la raíz vuelve a romperse, su contador cae a **0 a la vista** — y el
  instrumento además **grita**: `la ceguera 2 ha vuelto y el denominador está
  mintiendo otra vez`.
- **Las no miradas, por clase**: `OTRO-MUNDO` (prefijo de mundo: es otro repo) y
  `FUERA-DEL-ARBOL` (primer segmento desconocido: `node_modules/`, `out/`, rutas
  de ejemplo). V92 las sumaba en un único «ajenas»; separarlas es lo que permite
  medir la ceguera 3 sin desmontar nada.
- **El alcance del extractor**: extensiones, directorios de primer nivel y cuántos
  ficheros de raíz conoce. Lo que un barrido **no sabe ver** no se puede contar
  —ésa es la trampa de fondo—, pero sí se puede **publicar su forma** para que el
  límite sea legible en vez de tácito.

### 6.1 · El cuadre: un recuento que no cierra no emite veredicto

Regla `R14`. En cada corrida:

```
cuadre: miradas(1423) + no-miradas(253) = 1676   |   por origen: 1260 + 416 = 1676   OK
```

Si no cierra, el barrido **calla**: `exit 2`, sin `PASS` y sin `FAIL`. Es el modo
de fallo de la ceguera 2 convertido en ruido audible: citas que se pierden por el
camino sin que nadie lo note.

Y es la única regla cuya mutación va **en pareja**, a propósito, porque no se
puede probar de otra manera: el cuadre a solas, desactivado sobre una corrida
sana, no cambia nada y su mutante **sobreviviría**. Los dos tests de § 6 lo parten
en sus dos mitades:

- se rompe **un contador** → el instrumento real lo caza: `exit 2`, `CUADRE ROTO`,
  ni una línea de veredicto;
- se rompe el contador **y además** se retira el cuadre → vuelve el `VEREDICTO`,
  sobre un recuento que no cierra, **firmado como `OK`**.

Un mutante que sobreviviría a solas y cae en pareja no es una excusa: es la forma
correcta de probar una guarda cuyo trabajo es no hacer nada mientras todo va bien.

---

## 7 · Censo de mutación: 14 reglas, 14 mutaciones, 0 supervivientes

CA-6. El instrumento **declara sus reglas** en un formato legible por máquina, y
la suite exige que los dos conjuntos coincidan:

```
$ node scripts/citas-rancias.mjs --reglas
R1	orden-extensiones	las extensiones se alternan de mas larga a mas corta: `json` antes que `js` (ceguera 1)
R2	ficheros-de-raiz	los ficheros sin barra (package.json, jest.config.js) entran al denominador (ceguera 2)
R3	prefijo-de-mundo	z:`ruta` es de OTRO repo: NO-MIRADA, jamas RANCIA (ceguera 3)
R4	topdir-conocido	una ruta cuyo primer segmento no es directorio de este arbol es NO-MIRADA
R5	bloque-de-codigo	una cita dentro de ``` es TRANSCRIP: evidencia grabada, se lee en pasado
R6	marca-de-caducidad	una linea que ya declara su caducidad es ANOTADA, no deuda
R7	nunca-existio	un fichero que jamas estuvo en el arbol es EFIMERA: sonda, vector o propuesta
R8	acta-por-borrado	si el fichero murio ANTES de nacer el reporte, es ACTA
R9	acta-por-deriva	si la linea ya no cabia el dia que se escribio el reporte, es ACTA
R10	rancia-es-deuda	lo que valia al nacer el reporte y hoy no es RANCIA, y RANCIA sale 1
R11	nace-en-head	un reporte aun sin commitear nace en HEAD: no se denuncia a si mismo
R12	denominador-en-la-salida	el denominador y las NO-MIRADAS salen SIEMPRE, no bajo bandera
R13	ceguera-declarada	la clase irreducible sale en CADA corrida, con su caso con nombre
R14	cuadre-del-denominador	miradas + no-miradas debe dar las extraidas; si no cuadra, exit 2 sin veredicto
```

Dos tests cierran el censo, y cierran cosas distintas:

1. **`--reglas` ≡ tabla de mutaciones.** Una regla añadida sin su caso rojo pone
   la suite roja **con su id**. Una mutación de una regla que ya no existe,
   también.
2. **Cada regla, rota, cambia lo que el instrumento hace.** Se construyen las 14
   mutaciones, se corren las 14 contra el mundo sintético y se exige que
   **ninguna** produzca la misma salida y el mismo código que el instrumento
   real. Un superviviente sale **con su id** en el fallo.

Resultado, y qué cambia cada una sobre el mundo sintético (14 citas / 3 rancias):

| regla | qué le pasa al veredicto al romperla |
| ----- | ------------------------------------- |
| R1 | `resuelven` 2 → 1; `fixtures/vector.json` se lee como `.js` y sale `EFIMERA` |
| R2 | denominador 14 → **12**; `de la raiz` 2 → **0**; **una rancia desaparece** (3 → 2) |
| R3 | `OTRO-MUNDO` 1 → 0; la cita del otro mundo sale **`RANCIA`** (3 → 4) |
| R4 | `FUERA-DEL-ARBOL` 1 → 0; `node_modules/…` sale `EFIMERA` |
| R5 | `TRANSCRIP` 2 → 0; la salida grabada de un `wc -l` se convierte en 2 deudas (3 → 5) |
| R6 | `ANOTADA` 1 → 0; corregir una cita ya no la saca del gate (3 → 4) |
| R7 | `EFIMERA` 1 → 0; una sonda propuesta pasa a deuda (3 → 4) |
| R8 | `ACTA` 3 → 1; el acta de una poda se denuncia a sí misma (3 → 5) |
| R9 | `ACTA` 3 → 2; `r09` y `r10` dejan de distinguirse (3 → 4) |
| R10 | `RANCIA` 3 → 2 y **`exit 0` pase lo que pase**: el gate como adorno |
| R11 | el informe sin commitear se denuncia a sí mismo (`ACTA` → `RANCIA`) |
| R12 | desaparece la línea del denominador |
| R13 | desaparece la declaración de la ceguera irreducible |
| R14 | el veredicto sale sobre `miradas(10)+no-miradas(2)=14`, firmado `OK` |

```
Test Suites: 1 passed, 1 total
Tests:       29 passed, 29 total
```

---

## 8 · Salida literal del barrido

### 8.1 · `plan/REPORTES` — la corrida que incluye este reporte

Ésta es la corrida que verá quien re-ejecute, **y se incluye a sí misma**: el
bloque de abajo está dentro de este `.md`, así que sus citas cuentan. Se ha
iterado hasta el punto fijo — pegar la salida y volver a correr da **la misma**
salida, y eso está comprobado, no supuesto.

```
barrido de citas rancias · scripts/citas-rancias.mjs
raiz                : C:\S_LAB\wt\v-v99
ambito              : plan/REPORTES
documentos barridos : 31

--- ALCANCE DEL EXTRACTOR (que forma de cita sabe ver) ---------------------
extensiones            : jsonc,json,tsx,yaml,snap,vsix,html,yml,mjs,cjs,css,log,txt,ts,js,md
directorios de 1er niv : src,tests,scripts,plan,docs,fixtures,media,schemas,sincronia,.github
ficheros de la raiz    : 14

--- DENOMINADOR -----------------------------------------------------------
citas ruta[:linea] extraidas : 1795
  con directorio             : 1360
  de la raiz del repo        : 435   <-- ceguera 2: si esto cae a 0, el denominador miente

--- MIRADAS ---------------------------------------------------------------
resuelven contra el arbol    : 1344
NO resuelven                 : 198
  TRANSCRIP (en bloque cod)  : 101   evidencia grabada; se lee en pasado
  ANOTADA  (marca en linea)  : 34   la propia linea ya declara su caducidad
  EFIMERA  (nunca existio)   : 24   sonda / vector / propuesta
  ACTA     (ya no valia)     : 39   el que escribia ya lo sabia
  RANCIA   (valia y caduco)  : 0   <-- DEUDA, debe ser 0

--- NO MIRADAS (extraidas, NO verificables aqui) ---------------------------
total no miradas             : 253
  OTRO-MUNDO      (z:`...`)  : 4   otro repo; comprobarlas aqui da falso positivo
  FUERA-DEL-ARBOL (1er seg.) : 249   node_modules/, out/, rutas de ejemplo

cuadre: miradas(1542) + no-miradas(253) = 1795   |   por origen: 1360 + 435 = 1795   OK

--- LO QUE ESTE VEREDICTO NO SIGNIFICA (ceguera irreducible) ---------------
Esto comprueba que una cita APUNTA A ALGO QUE EXISTE. No que diga la verdad.
Caso con nombre y ruta, de este mismo repo:
    plan/REPORTES/WP-V90-jest-determinista.md:357 cita plan/BACKLOG.md:153
    «que nombra `duration < 100 ms`». El fichero tiene 217 lineas, asi que
    :153 RESUELVE y este barrido la da por buena — pero hoy esa linea es la
    cabecera de una tabla y no nombra ningun `duration < 100 ms`.
    Verificable, pasa la verificacion, y falsa.
Cerrarla exige comparar el CONTENIDO citado (un ancla de texto por cita).
NO ESTA HECHO. RANCIA=0 significa «ninguna apunta al vacio», nunca «todas
dicen la verdad».

VEREDICTO: PASS (0 rancias / 1795 citas)
```

### 8.2 · `--ambito plan` — los documentos vivos, que NO son míos

```
barrido de citas rancias · scripts/citas-rancias.mjs
raiz                : C:\S_LAB\wt\v-v99
ambito              : plan
documentos barridos : 11

--- ALCANCE DEL EXTRACTOR (que forma de cita sabe ver) ---------------------
extensiones            : jsonc,json,tsx,yaml,snap,vsix,html,yml,mjs,cjs,css,log,txt,ts,js,md
directorios de 1er niv : src,tests,scripts,plan,docs,fixtures,media,schemas,sincronia,.github
ficheros de la raiz    : 14

--- DENOMINADOR -----------------------------------------------------------
citas ruta[:linea] extraidas : 430
  con directorio             : 323
  de la raiz del repo        : 107   <-- ceguera 2: si esto cae a 0, el denominador miente

--- MIRADAS ---------------------------------------------------------------
resuelven contra el arbol    : 278
NO resuelven                 : 38
  TRANSCRIP (en bloque cod)  : 7   evidencia grabada; se lee en pasado
  ANOTADA  (marca en linea)  : 0   la propia linea ya declara su caducidad
  EFIMERA  (nunca existio)   : 7   sonda / vector / propuesta
  ACTA     (ya no valia)     : 0   el que escribia ya lo sabia
  RANCIA   (valia y caduco)  : 24   <-- DEUDA, debe ser 0

--- NO MIRADAS (extraidas, NO verificables aqui) ---------------------------
total no miradas             : 114
  OTRO-MUNDO      (z:`...`)  : 40   otro repo; comprobarlas aqui da falso positivo
  FUERA-DEL-ARBOL (1er seg.) : 74   node_modules/, out/, rutas de ejemplo

cuadre: miradas(316) + no-miradas(114) = 430   |   por origen: 323 + 107 = 430   OK

--- LO QUE ESTE VEREDICTO NO SIGNIFICA (ceguera irreducible) ---------------
Esto comprueba que una cita APUNTA A ALGO QUE EXISTE. No que diga la verdad.
Caso con nombre y ruta, de este mismo repo:
    plan/REPORTES/WP-V90-jest-determinista.md:357 cita plan/BACKLOG.md:153
    «que nombra `duration < 100 ms`». El fichero tiene 217 lineas, asi que
    :153 RESUELVE y este barrido la da por buena — pero hoy esa linea es la
    cabecera de una tabla y no nombra ningun `duration < 100 ms`.
    Verificable, pasa la verificacion, y falsa.
Cerrarla exige comparar el CONTENIDO citado (un ancla de texto por cita).
NO ESTA HECHO. RANCIA=0 significa «ninguna apunta al vacio», nunca «todas
dicen la verdad».

--- RANCIAS SIN ANOTAR (anadir la marca ⛔ junto a la cita) ---
BACKLOG.md:112  src/configEditor.ts  [fichero inexistente]
     | | **WP-V98** `P1` ⬜ | **El CENSO esta vivo y miente en presente** (hallazgo E-1 de V92, verificado por el orquestador al aceptar). `plan/CEN
BACKLOG.md:112  src/statusManager.ts  [fichero inexistente]
     | | **WP-V98** `P1` ⬜ | **El CENSO esta vivo y miente en presente** (hallazgo E-1 de V92, verificado por el orquestador al aceptar). `plan/CEN
BACKLOG.md:162  tests/performance/serviceStartup.test.ts  [fichero inexistente]
     | | **WP-V90** **`P0`** ✅ | **ACEPTADO 2026-08-01** (merge `a0ca305`, 1 contrarrevisión adversarial con 4 bloqueantes + ronda de corrección + 
CENSO-V12.md:118  docs/GUIA-PRUEBA-v1.md  [fichero inexistente]
     | | `INSTALL.md` | **poda** | «Manual de Empaquetado e Instalación Local» del producto ajeno, intacto desde el import. Cero referencias en el 
CENSO-V12.md:143  package.json:1446  [linea 1446 > 1249 lineas]
     | | `theatrical-content` | **poda** | 3 ficheros de contenido de agentes del legado (`isaac`), intactos desde el import. El código vivo los bu
CENSO-V12.md:143  package.json:1456  [linea 1456 > 1249 lineas]
     | | `theatrical-content` | **poda** | 3 ficheros de contenido de agentes del legado (`isaac`), intactos desde el import. El código vivo los bu
CENSO-V12.md:167  src/configEditor.ts  [fichero inexistente]
     | | `src/configEditor.ts` | **poda** | legado intacto y **muerto**: 423 líneas que no se alcanzan desde `src/extension.ts`. Los editores vivos
CENSO-V12.md:178  src/mcpChatParticipant.ts  [fichero inexistente]
     | | `src/mcpChatParticipant.ts` | **poda (pend. DV-11)** | legado intacto y vivo: crea `mcp-vscode-ext.mcp-assistant` (`:77`), uno de los 6 `c
CENSO-V12.md:186  src/statusManager.ts  [fichero inexistente]
     | | `src/statusManager.ts` | **poda** | legado intacto y **muerto**: 453 líneas no alcanzables desde `src/extension.ts`. La barra de estado vi
CENSO-V12.md:455  src/copilotLogs/config/models-config.json  [fichero inexistente]
     | `src/copilotLogs/config/models-config.json`), aparecen:
CENSO-V12.md:457  src/theatrical/core/managers/TheatricalAgent.ts  [fichero inexistente]
     | - **`src/theatrical/core/managers/TheatricalAgent.ts.backup`** — un
CENSO-V12.md:463  package.json:1446  [linea 1446 > 1249 lineas]
     | `package.json:1446`**.
CENSO-V12.md:533  src/mcpChatParticipant.ts  [fichero inexistente]
     | | **DV-11** · chatParticipants heredados | `src/mcpChatParticipant.ts` (poda) · `src/theatrical` (re-contenido, su parte viva) · `package.js
CENSO-V12.md:547  src/mcpChatParticipant.ts:77-79  [fichero inexistente]
     | | `mcp-vscode-ext.mcp-assistant` | `src/mcpChatParticipant.ts:77-79` | **sí** |
CENSO-V12.md:548  src/theatrical/TheatricalChatManager.ts:45  [fichero inexistente]
     | | `mcp-vscode-ext.isaac` | `src/theatrical/TheatricalChatManager.ts:45` | **sí** |
CENSO-V12.md:563  src/mcpChatParticipant.ts  [fichero inexistente]
     | - **Poda:** retirar `src/mcpChatParticipant.ts`, la parte viva de
CENSO-V12.md:600  package.json:1446  [linea 1446 > 1249 lineas]
     | | `theatrical-content/` | `package.json:1446` **y** `:1456` (los dos `customEditors`), `extensionBootstrap.ts:1444,1529,1569,1610,1614`, `Ag
CENSO-V12.md:603  src/mcpChatParticipant.ts  [fichero inexistente]
     | | `src/mcpChatParticipant.ts` | `src/core/extensionBootstrap.ts:11` (import), `:57` (campo de `ExtensionContext`), `:115` (`new McpChatParti
CENSO-V12.md:604  src/core/configurationCommandsService.ts:256-259  [fichero inexistente]
     | | los 4 comandos `ArrakisTheater.*` (fila 18) | `src/core/configurationCommandsService.ts:256-259` (los 4 `registerCommand`) **y sus dos lla
CENSO-V12.md:621  src/mcpChatParticipant.ts  [fichero inexistente]
     | | `src/mcpChatParticipant.ts` | `:11`, `:57`, `:115` | — |
CENSO-V12.md:629  src/copilotLogs/commands.ts:485-488  [fichero inexistente]
     | `src/copilotLogs/commands.ts:485-488`. Es un import muerto en código
CENSO-V12.md:634  tests/DonAlvaroValidation.test.ts:11  [fichero inexistente]
     | `tests/DonAlvaroValidation.test.ts:11` importa `DonAlvaroChatParticipant`
CENSO-V12.md:635  tests/unit/mcpChatParticipant.test.ts:3  [fichero inexistente]
     | y `tests/unit/mcpChatParticipant.test.ts:3` importa `McpChatParticipant`.
CENSO-V12.md:640  tests/integration/extensionChatIntegration.test.ts:3  [fichero inexistente]
     | `tests/integration/extensionChatIntegration.test.ts:3` importa

VEREDICTO: FAIL (24 rancias / 430 citas)
```

**Estas 24 rancias no se tocan.** Son el hallazgo **E-1** de V92, ya enrutado y
vivo en el BACKLOG como un WP con dueño; y `plan/CENSO-V12.md` está fuera de mi
alcance por encargo explícito. Se re-miden aquí y se dejan donde están: **21 en
`plan/CENSO-V12.md` y 3 en `plan/BACKLOG.md`**.

### 8.3 · Los denominadores, antes y después

| corrida | documentos | denominador | resuelven | no resuelven | no miradas | RANCIA |
| ------- | ---------- | ----------- | --------- | ------------ | ---------- | ------ |
| V92 §3.1 «ANTES» | 28 | 1518 | 1176 | 105 | 237 | **27** |
| V92 §3.2 «DESPUÉS» | 29 | 1625 | 1236 | 150 | 239 | 0 |
| WP-V99, antes de este reporte | 30 | 1676 | 1273 | 150 | 253 | 0 |
| **WP-V99, con este reporte** | **31** | **1795** | 1344 | 198 | 253 | **0** |
| ceguera 2 reintroducida (control) | 31 | **1364** | 935 | 176 | 253 | 0 |

Los movimientos, los cuatro declarados:

1. `1518 → 1625`: las anotaciones de V92 y su propio reporte (§ 3.2 de aquel).
2. `1625 → 1676`: **+51**, exactamente `plan/REPORTES/WP-V96-suelo-portable.md`.
3. `1676 → 1795`: **este reporte**, que cita mucho por naturaleza.
4. La fila de control es el instrumento **con la ceguera 2 puesta**, sobre este
   mismo árbol: **431 citas menos** sin una sola línea de aviso en V92. Ésa es la
   cifra que justifica que el denominador salga desglosado por origen — y en el
   ámbito `plan` esa misma ceguera se lleva por delante **4 rancias reales**
   (§ 4.1).

---

## 9 · Qué sigue sin ver

Escrito aquí y **también en el instrumento**, que es donde hace falta.

1. **La cita que resuelve y miente** (§ 5). Es la clase irreducible de este
   diseño, tiene su caso con nombre re-medido hoy, y **no está cerrada**. Cerrarla
   exige guardar junto a cada cita un **ancla de texto** y compararla; entonces el
   barrido pasaría de «apunta a algo» a «dice lo que dice». No está hecho.
2. **Lo que el extractor no sabe ver.** Una cita con una extensión fuera de la
   lista, o bajo un directorio de primer nivel nuevo, **no entra en el
   denominador** — y eso, por construcción, no se puede contar. Lo que sí se hace
   es **publicar la forma** del extractor en cada corrida y **desglosar el
   denominador por origen**, para que la próxima ceguera de este tipo sea visible
   en vez de silenciosa. Es una mitigación, no una cura.
3. **La suite no prueba las cifras de hoy.** 1795 es un cardinal medido, y un
   cardinal medido caduca (`plan/PRACTICAS.md` § 7) — el siguiente reporte que
   entre en `plan/REPORTES/` lo mueve. Vive aquí como corrida fechada; lo que
   vive en la suite son las **reglas**, que no caducan. Quien necesite la cifra
   que la vuelva a medir: para eso el barrido tiene casa.
4. **Las citas de otros mundos no se juzgan.** `OTRO-MUNDO` y `FUERA-DEL-ARBOL`
   se cuentan y se nombran, pero nadie las verifica: harían falta los otros
   árboles. Se declaran para que el `PASS` no se lea como «todo comprobado».
5. **El barrido no corre solo.** No hay paso de CI ni script de `npm` — § 10.

---

## 10 · Hallazgos enrutables — lo que NO he tocado

### E-4b · El barrido tiene casa, pero todavía no tiene turno

`.github/workflows/ci.yml` y `package.json` están **fuera de `ALCANCE_DIFF`**, y
no los he tocado. Falta, literalmente, esto:

```yaml
      - name: Gate · citas rancias en los reportes (BLOQUEA)
        run: node scripts/citas-rancias.mjs
```

Junto al gate de rojos y al trinquete de cobertura. El instrumento ya sale `1`
con deuda y `2` si su propio recuento no cuadra, así que sirve de gate **sin
tocarlo**. Y un `"citas": "node scripts/citas-rancias.mjs"` en `package.json`
para quien lo invoque a mano.

**Cuidado con el ámbito al enrutarlo**: `plan/REPORTES` da hoy `exit 0` y puede
bloquear desde ya. **`--ambito plan` da `exit 1`** por las 24 rancias de E-1, así
que ese segundo paso no se puede añadir hasta que E-1 se cierre — o entraría en
CI un rojo permanente, que es exactamente el vicio que WP-V93 quitó de este
flujo.

**Enrutado a:** quien posea `.github/` y `package.json`.

### E-1 (de V92) · sigue abierto y re-medido

`plan/CENSO-V12.md` afirma en presente cosas de ficheros borrados. Hoy son **24**
rancias en `plan` (21 en el censo, 3 en `plan/BACKLOG.md`), no 22: la lista
literal está en § 8.2. Tiene dueño y hay trabajo vivo ahí; **no se ha tocado ni
un carácter**. El instrumento le sirve tal cual: `--ambito plan --json-out f.json`.

### E-6 · La corrección automática (`anotar.mjs`) sigue sin casa

V92 aplicó sus 26 anotaciones con un segundo script, `anotar.mjs`, que consume el
JSON del barrido — y que **también quedó embebido en el reporte**. Este WP le ha
dado casa al barrido, no al anotador: `--json-out` está aquí y probado, pero el
que consume ese JSON sigue siendo copiar-y-pegar. Quien cierre E-1 lo va a
necesitar.

**Enrutado a:** el mismo dueño que E-1.

### E-7 · La regla de `plan/PRACTICAS.md` § 7 ya tiene gate

No es un hallazgo pendiente sino su contrario, y conviene dejarlo dicho: E-5 de
V92 («la regla no está donde se lee») **está cerrado** — `plan/PRACTICAS.md` § 7
la recoge. Lo que faltaba era el **gate que la sostiene**, y es esto. La propia
regla dice «o se re-mide al citarla, o se cita el gate que la sostiene»: a partir
de ahora hay gate que citar.

---

## 11 · Auto-verificación

| # | criterio (CA) | estado | evidencia |
| - | ------------- | ------ | --------- |
| 1 | el barrido en `scripts/`, invocable, con tests bajo el arnés del repo | ✅ | `scripts/citas-rancias.mjs` + `scripts/tests/citas-rancias.test.ts`; **29/29** con `npm test`; § 1 |
| 2 | las tres cegueras como casos rojos, rojos si la corrección se retira | ✅ | § 4.3: retirada real en el instrumento → **6 / 12 / 10** tests rojos de 29, y en los tres casos el test que lleva su nombre. Restaurado byte a byte → 29/29 |
| 3 | la clase irreducible declarada **en el instrumento** | ✅ | § 5: en la salida de cada corrida (`R13`), en `--help` y en la cabecera; **tres** tests, uno de ellos con mutante. Caso `WP-V90:357` → `plan/BACKLOG.md:153` **re-medido hoy** |
| 4 | denominador en la salida siempre: revisadas, fallidas y **no miradas por clase** | ✅ | § 6; test «la corrida por defecto —sin una sola bandera— ya trae las tres cifras»; mutante `R12` que borra el denominador **cae** |
| 5 | reproduce V92: cero rancias y denominador mayor | ✅ | § 2 (equivalencia cita a cita, **198/198** y **38/38**) y § 3: **0 rancias**; **1676 > 1518** sin este reporte y **1795 > 1518** con él (§ 8.3). La premisa del encargo se corrige y se explica en § 3.1: el 1518 **ya** contaba los 367 |
| 6 | censo de mutación: romper cada regla enrojece | ✅ | § 7: **14 reglas declaradas por `--reglas`, 14 mutaciones, 0 supervivientes**, con test que exige que los dos conjuntos coincidan |
| — | alcance del diff | ✅ | `scripts/citas-rancias.mjs`, `scripts/tests/citas-rancias.test.ts`, este reporte. **Cero** `src/`, `plan/BACKLOG.md`, `plan/CENSO-V12.md`, `plan/REPORTES/WP-V92-*.md`, `.github/`, `package.json` |
| — | los gates de la casa siguen verdes | ✅ | `node scripts/rojos-jest.mjs --gate` → `conjunto de rojos IDENTICO al declarado`, exit 0 · `npm test` → 457 pasados, 1 saltado, 13 suites · `node scripts/cobertura-trinquete.mjs` → `censo COMPLETO y unidades cubiertas EN EL SUELO`, exit 0 |
| — | sin `git push`, sin `git stash`, sin `npx` sin declarar | ✅ | § 12 |

**Lo que este WP NO garantiza**, dicho antes de que lo pregunten: que las citas
de `plan/REPORTES/` digan la verdad. Garantiza que **ninguna apunta al vacío**, y
ahora eso lo sostiene un fichero versionado con 29 tests y un censo de mutación
sin supervivientes — en vez de un bloque de markdown que había que copiar a mano.

---

## 12 · Órdenes ejecutadas (las que no son lectura)

```
npm ci --no-audit --no-fund            # el worktree no traía node_modules
npx --no-install jest scripts/tests/citas-rancias.test.ts --coverage=false
npm test
node scripts/rojos-jest.mjs --gate
node scripts/cobertura-trinquete.mjs
node scripts/citas-rancias.mjs [--ambito plan] [--verbose] [--json-out …]
git init / add / commit                # en un TEMPORAL: el mundo sintético de los
                                       # tests, con commit.gpgsign=false para que
                                       # la fixture sea hermética. En el repo, un
                                       # único commit: el de esta entrega, en la
                                       # rama del WP.
```

`npx` va **declarado** y siempre con `--no-install`: no descarga nada, resuelve
el `jest` que `npm ci` acaba de poner. Cero `git push`, cero `git stash`, cero
escrituras fuera de este worktree.

---

— **V** · WP-V99 · `wp/v99-barrido-con-casa` · 2026-08-02
