# WP-V94 · P0 — el CI de este mundo está ROJO por dos errores de lint en código de producto

| dato | valor |
| ---- | ----- |
| Carril | **V** · Aleph-0 (ℵ₀) |
| Encargo | `plan/BACKLOG.md:107` |
| Rama | `wp/v94-lint-produccion` · base `7d8e39b` |
| Árbol de medida | `C:/S_LAB/wt/v-v94` · Windows 11 |
| Herramienta | node v22.21.1 · eslint **8.57.1** · jest 29.7.0 |
| Fecha de todas las medidas | **2026-08-01** |

---

## 0 · Qué es de fiar aquí y qué no

**MEDIDO** = se ejecutó en este árbol y la salida está pegada. **LECTURA** = afirmación
sobre el contenido de un fichero que abrí. **CITA** = viene de otro sitio y no lo he vuelto
a medir.

Dos acotaciones que valen para el documento entero:

1. **Ninguna medida de las mías es de un runner de GitHub.** Corren en local con el
   **comando exacto** de `.github/workflows/ci.yml`. Lo que eso deja sin demostrar está
   en §8. El estado de CI que sí es de un runner (§7) se lee con `gh`, no se supone.
2. Este árbol es **Windows / node 22**; CI es **ubuntu / node 20**. Es el mismo eje no
   medido que ya declaró V93, y lo heredo sin fingir que lo he cerrado.

---

## 1 · El diagnóstico del encargo acertó la regla y las líneas, y **erró el fichero**

El encargo (y la fila del BACKLOG) sitúan los dos errores en `src/core/errorBoundary.ts`.
**No están ahí.** Están en `src/webview/security.ts`.

Esto no es una objeción de estilo: quien fuera a arreglarlo abriendo `errorBoundary.ts`
no habría encontrado **ninguna** regex de control, y el fichero entero tiene **una sola**
expresión regular (`/[^a-zA-Z0-9]/g`, línea 144), que no casa ningún carácter de control.

**Cómo se estableció (MEDIDO).** El log de CI agrupa por fichero y el encargo tomó el
encabezado equivocado: el log lista **38 ficheros** con hallazgos, y entre el encabezado de
`errorBoundary.ts` y las dos líneas de `##[error]` hay **25 ficheros más**. Reconstruyendo
la correspondencia encabezado→hallazgos
del log de `gh run view 30714794390 --log-failed`:

```
línea  83 del log:  …/src/core/errorBoundary.ts
                     18:12  warning  Unexpected any…                 no-explicit-any
                    211:17  warning  Unexpected lexical declaration… no-case-declarations
                    224:17  warning  Unexpected lexical declaration… no-case-declarations
        ↑ TRES WARNINGS Y CERO ERRORES

línea 266 del log:  …/src/webview/security.ts
línea 267:          ##[error]  61:35  error  …: \x09, \x0a, \x0d  no-control-regex
línea 268:          ##[error]  63:33  error  …: \x00, \x00        no-control-regex
```

**Contraprueba (MEDIDO)**, por si el checkout de CI difiriera del mío: las tres líneas que
CI reporta para `errorBoundary.ts` son en mi árbol exactamente lo que dice que son —

```
 18:  data?: any;                                              → no-explicit-any
211:  const criticalResult = await vscode.window.showErrorMessage(   → dentro de un case
224:  const highResult = await vscode.window.showErrorMessage(       → dentro de un case
```

— o sea que el fichero **está como CI lo vio**, y sigue sin tener errores. Y `61:35` /
`63:33` caen en `security.ts` sobre las dos declaraciones exactas que la regla nombra.
**Los números de línea del encargo eran correctos; el nombre del fichero, no.**

---

## 2 · Qué hacen las dos regex

Son `src/webview/security.ts:61` y `:63`, y las consume una sola función:

```ts
const TAB_OR_NEWLINE = new RegExp('[\u0009\u000A\u000D]', 'g');
const EDGE_CONTROL   = new RegExp('^[\u0000-\u0020]+|[\u0000-\u0020]+$', 'g');

export function normalizeUrlForClassification(rawUrl: string): string {
    return rawUrl.replace(TAB_OR_NEWLINE, EMPTY).replace(EDGE_CONTROL, EMPTY);
}
```

**Son saneamiento de entrada, y son superficie de seguridad.** Transcriben el preprocesado
del *basic URL parser* de la WHATWG —el que aplica el navegador antes de mirar nada— para
que este módulo clasifique un URL **igual que lo clasificará quien lo cargue**:

| regex | cláusula de la norma | conjunto exacto |
| ----- | -------------------- | --------------- |
| `TAB_OR_NEWLINE` | «remove **all** ASCII tab or newline from input» | *ASCII tab or newline* ≡ U+0009, U+000A, U+000D |
| `EDGE_CONTROL` | «remove any **leading and trailing** C0 control or space from input» | *C0 control or space* ≡ U+0000‥U+001F **+** U+0020 |

Los dos rangos son la definición literal de la norma: ni un carácter de más ni de menos.
Nótese que **U+000B y U+000C NO entran** en el primero aunque sean C0 — y el código no los
borra en posición interior, que es lo correcto.

**Para qué sirve, en concreto.** Es el arreglo del defecto D-1 de WP-V66: el módulo tenía
dos clasificadores con criterios distintos, y `isExtensionResourceUrl` comparaba el esquema
con una regex escrita a mano que **no** normalizaba. Consecuencia: `htt<TAB>ps://evil` no
casaba ningún esquema, se daba por **relativo** —o sea, recurso propio de la extensión— y
el navegador lo cargaba como **https externo**. Las dos regex son la puerta que cierra eso.
Quien pueda escribir el `index.html` que sirve `webViewManager` desde disco es el
adversario contra el que este fichero se declara fail-closed.

**Conclusión: no son un defecto.** Casar caracteres de control **es el requisito**.

---

## 3 · ¿Y el orden de las dos pasadas? (lo único que sí podía ser un defecto)

La norma enuncia las dos operaciones en el orden **recortar extremos → borrar tab/salto**.
El código las aplica **al revés**. Eso sí merecía mirarse, porque una divergencia de orden
frente al navegador es exactamente la clase de fallo que este módulo existe para no tener.

**No hay divergencia, y se demuestra.** Sea `T = {09,0A,0D}` y `C = {00..20}`; nótese
`T ⊂ C`. Un carácter `c ∉ T` sobrevive en un orden si y sólo si sobrevive en el otro:

* si `c` está dentro de la tirada inicial de `C` de la entrada, todo lo que le precede está
  en `C`; borrar los de `T` sólo acorta ese prefijo sin sacar a `c` de él → cae en los dos;
* si `c` sobrevive al recorte, existe un `d ∉ C` antes y un `e ∉ C` después; como `T ⊂ C`,
  ni `d` ni `e` se borran, así que `c` sigue teniendo frontera no-`C` a los dos lados → se
  salva en los dos.

Borrar antes sólo puede **destapar** más `C` en los bordes, y el recorte posterior se lo
lleva igual. **MEDIDO además como test** (§5.2, «el ORDEN de las dos pasadas no cambia el
resultado»): 1000 entradas construidas con las dos implementaciones, **cero divergencias**.

---

## 4 · La decisión: **exención por línea**. Y el precio de la descartada, medido

### 4.1 · Lo que se ha hecho

Dos `eslint-disable-next-line no-control-regex`, **uno por línea, con su razón al lado**, y
un bloque encima que explica por qué la regla acierta en el hallazgo y falla en la
conclusión. `.eslintrc.cjs` **no se ha tocado** — la regla sigue donde estaba, en `error`
para todo el repo, por herencia de `eslint:recommended`.

Son las **dos primeras** exenciones de lint del árbol: antes de este WP,
`grep -rn "eslint-disable" src/` daba **cero** (MEDIDO). El comentario de `.eslintrc.cjs:97`
ya había anticipado que la primera llegaría.

### 4.2 · Por qué NO se reescribieron, con la sonda delante

La alternativa era reescribirlas para que la regla no dispare. **Funciona, y además es
equivalente** — así que no se descarta por sospecha, se descarta por lo que cuesta. Sonda
sobre la configuración real del repo (`ESLint.lintText`, filePath `src/__probe__.ts`):

| forma escrita | ¿la regla dispara? |
| ------------- | ------------------ |
| `new RegExp('[\u0009\u000A\u000D]','g')` ← **la actual** | **ERROR** `\x09, \x0a, \x0d` |
| `new RegExp('^[\u0000-\u0020]+…','g')` ← **la actual** | **ERROR** `\x00, \x00` |
| `/[\t\n\r]/g` | *sin hallazgo* |
| `/^[\0-\x20]+|[\0-\x20]+$/g` | *sin hallazgo* |
| **`/[\x09\x0a\x0d]/g`** ← **los MISMOS caracteres** | **ERROR** `\x09, \x0a, \x0d` |
| `new RegExp('[\\u0009…]','g')` (escape textual) | **ERROR** `\x09, \x0a, \x0d` |

Y la equivalencia de la reescritura **está medida**, no supuesta: comparando
`/[\t\n\r]/` contra la actual y `/^[\0-\x20]+…/` contra la suya sobre **U+0000‥U+02FF**,
**0 divergencias** en las dos.

**El precio, entonces, es exactamente éste**: la reescritura compra el verde con la
**ortografía**, no con el contenido. Las tres últimas filas de la tabla lo dicen solas —
los *mismos* caracteres escritos con escape hexadecimal vuelven a dar error, y el escape
textual también. La regla no juzga qué casa la expresión; juzga **cómo se deletrea**
(`no-control-regex.js:30-40`: dispara si el byte del patrón es el control literal o si el
trozo empieza por `\x` o `\u` — y `\t`, `\n`, `\0` no están en esa lista).

Comprar el verde así habría tenido dos costes que la exención escrita no tiene:

1. **Borra del fichero todo rastro de que aquí hubo una regla.** Un lector futuro no tiene
   forma de saber que estas dos líneas son un punto donde el linter y la norma discrepan.
2. **Es una exención sin caducidad y sin alcance.** El rango quedaría invisible para la
   regla *para siempre*, incluso si alguien lo ensanchara después a algo que sí fuera un
   defecto. La exención escrita muere con la línea que la justifica.

> **Nota honesta para quien revise:** el rechazo de la reescritura es un juicio, no un
> hecho. Es defendible preferir `/[\t\n\r]/g` por ser literal de regex en vez de
> `new RegExp` de cadena. Dejo la sonda para que ese juicio se pueda revisar con los
> mismos datos con los que lo tomé.

**Lo que en ningún caso se ha hecho** es apagar la regla en `.eslintrc.cjs`. Eso cambiaba
un rojo honesto por ceguera permanente, y además habría cegado los **otros 83 ficheros**
`.ts` de `src` (84 rastreados en total, MEDIDO con `git ls-files 'src/**/*.ts'`).

### 4.3 · Una trampa de lectura que conviene dejar anotada

En el **fichero** se lee `'\u0009'`; lo que recibe `RegExp` es un **byte de control crudo**,
porque el literal de cadena ya resolvió el escape. Por eso la regla las ve, y por eso quien
busque bytes de control en el fuente con `grep -P '[\x00-\x08...]'` **no encuentra nada**
(MEDIDO: 0 líneas) y puede concluir que el error no existe.

---

## 5 · Los dos tests

### 5.1 · El vector que demuestra que **la regla sigue viva**

`tests/unit/webview/noControlRegexVivo.test.ts` (5 tests, **nuevo**). Ejecuta ESLint de
verdad con la configuración del repo — no lee el fichero de config y afirma cosas de él:

| # | qué fija | MEDIDO |
| - | -------- | ------ |
| 1 | `security.ts` tal cual: **0** errores de `no-control-regex` | ✓ |
| 2 | **La exención es por LÍNEA**: una regex de control **nueva** inyectada en *ese mismo fichero* se caza, con severidad **2 (error)** | ✓ |
| 3 | **Las exenciones son lo único que calla los dos hallazgos**: quitando los dos comentarios vuelven **exactamente 2** errores, `\x09` y `\x00` | ✓ |
| 4 | La regla es **error** en cualquier otro fichero de `src` | ✓ |
| 5 | No hay `eslint-disable` de bloque ni sin regla nombrada en **ningún** fichero de `src`, y `.eslintrc.cjs` no menciona la regla | ✓ |

El caso **3** es el que impide el autoengaño: prueba que el código de las dos regex **no ha
cambiado** y que sigue siendo material que la regla condena — lo único que se ha añadido es
la declaración. El caso **2** es el que impide que la exención se ensanche a fichero.

### 5.2 · El test que fija el comportamiento de las regex

En `tests/unit/webview/webviewCsp.test.ts`, describe `WP-V94 · normalizeUrlForClassification
≡ preprocesado de URL de la WHATWG` (**6 tests nuevos**). Antes de este WP la función tenía
**una sola aserción** en toda la suite (`:969`), y no tocaba ni U+0000 ni el borde del rango.
Ahora quedan fijados:

* los **tres** caracteres borrables, en cualquier posición (no sólo al principio);
* que **U+000B y U+000C se CONSERVAN** en posición interior — el error fácil sería borrar
  todo el C0 en cualquier posición, y eso divergiría del navegador **por exceso**;
* que el resto de C0 se recorta **sólo en los extremos** y **se conserva dentro**;
* que el rango recortado es **exactamente** U+0000‥U+0020 (bucle sobre los 33), con U+0021
  y U+00A0 como controles negativos;
* la **equivalencia de orden** de §3 (1000 entradas, 0 divergencias);
* la consecuencia de seguridad: ningún carácter de control cuela un origen externo.

Los caracteres se construyen con `String.fromCharCode`, a propósito: así el fichero de test
no contiene bytes de control que un editor o una normalización de fin de línea pudieran
cambiar sin que nadie lo viera.

---

## 6 · Los hermanos: qué más había detrás

### 6.1 · Detrás del primer error de lint: **nada**

ESLint **no para en el primer hallazgo**, así que no había errores escondidos tras él. El
propio log lo cuenta, y el recuento local coincide con el del runner:

```
CI (30714794390):  ✖ 184 problems (2 errors, 182 warnings)
local, antes:      ✖ 184 problems (2 errors, 182 warnings)
local, después:    ✖ 182 problems (0 errors, 182 warnings)   ← exit 0
```

**Los 182 warnings no se han tocado**: el recuento es idéntico antes y después. Nada se ha
silenciado de paso. Son la deuda del legado que `.eslintrc.cjs` censa (8 reglas en `warn`).

### 6.2 · Detrás del **paso** de lint: **ocho pasos que nunca llegaron a correr**

Ahí sí estaban los hermanos, y son el motivo real de que esto sea P0. `gh run view
30715004146` sobre el job `build`:

```
✓ Install
X Lint (eslint · src)
- Compile production                    ← never ran
- Probe V08 (parser real)               ← never ran
- Gate · conjunto de rojos por nombre (BLOQUEA)      ← never ran
- Suite instrumentada · … (BLOQUEA)                  ← never ran
- Trinquete de cobertura · … (BLOQUEA)               ← never ran
- Guarda · ningún paso blando en este flujo          ← never ran
- Package v1 .vsix                                   ← never ran
- Upload .vsix artifact                              ← never ran
```

**Todo el aparato que WP-V93 acababa de montar para que CI bloqueara de verdad no se ha
ejecutado ni una sola vez en el remoto.** Un lint rojo lo dejaba inalcanzable. Ésa es la
frase que justifica la prioridad: V93 hizo que CI vigilara, y el lint hacía que no llegara
a vigilar.

He corrido **los ocho** en local con el comando exacto del flujo, para saber si detrás del
lint había un segundo rojo esperando:

| paso del flujo | comando exacto | resultado local |
| -------------- | -------------- | --------------- |
| Lint | `npm run lint` | **exit 0** · 0 errores / 182 warnings |
| Compile production | `npm run compile:production` | **exit 0** |
| Probe V08 | `npm run probe:v08` | **exit 0** · `WP-V08 probe PASS` |
| Gate de rojos | `node scripts/rojos-jest.mjs --gate` | **exit 0** · `conjunto de rojos IDENTICO al declarado` |
| Suite instrumentada | `npm test` | **exit 0** · 12 suites · **422 tests** (421 pass · 1 skip) · 91 s |
| Trinquete | `node scripts/cobertura-trinquete.mjs` | **exit 0** · censo COMPLETO · unidades **en el suelo** |
| Guarda de pasos blandos | `grep -rnE '^[[:space:]]*continue-on-error' .github/workflows/` | **exit 0** · cero apariciones funcionales |
| Package v1 | `npm run package:v1` | **exit 0** · `dist/aleph-0-0.2.0.vsix` (44 ficheros) |

**Detrás del lint no había un segundo rojo esperando: los ocho pasos salen 0.**

El job `exthost` **ya estaba en verde** (`✓ exthost in 55s`): el rojo era sólo de `build`.

**El trinquete no se ha movido, y eso es una comprobación, no una casualidad.** Falla en
las **dos** direcciones —si la cobertura baja y si sube sin registrarse—, así que unos
tests nuevos que tocaran código no cubierto lo habrían puesto rojo. Salida literal:

```
censo: 95 ficheros en src · 86 en el mapa · 9 ausentes (9 declarados)
  statements  1541 cubiertas (suelo 1541)
  branches     545 cubiertas (suelo 545)
  functions    272 cubiertas (suelo 272)
  lines       1519 cubiertas (suelo 1519)
cobertura: censo COMPLETO y unidades cubiertas EN EL SUELO declarado
```

Es el resultado buscado: los 11 tests nuevos ejercitan funciones **ya cubiertas**
(`normalizeUrlForClassification` es una sola sentencia, y ya tenía una aserción), y el
fichero del vector **no importa `src/`** en absoluto — lee y lintea texto. Suite: **411 →
422 tests** (+11), **0 rojos nuevos**, gate `IDENTICO`. `scripts/cobertura.suelo.json` y
`scripts/rojos-jest.baseline.txt` **no se han tocado** (están fuera del alcance, y no ha
hecho falta).

**Sobre el aviso de contrabando del encargo** («correr la suite puede ensuciar
rastreados»): MEDIDO en este árbol, **no ensucia**. `git status --porcelain` antes y
después de las dos corridas completas devuelve exactamente los ficheros de mi obra y nada
más. El `.vsix` cae en `dist/`, que está ignorado.

### 6.3 · ¿Desde cuándo? — la fila del BACKLOG dice «los tres runs anteriores»; son más

MEDIDO con `gh run list`. El primer `failure` de la serie es `30675762405`
(2026-08-01T00:31:53Z) y el último `success` anterior es `30674820317` (00:09:35Z):

```
failure  30715004146   plan(V): V93 aceptada y V94 P0 …
failure  30714794390   aceptacion(V93): CI deja de mirar y empieza a vigilar
failure  30702323323   aceptacion(V91): el instrumento que vigila la suite …
failure  30697839877   plan(V): cierre de la ola 4 …
failure  30676671932   plan(V): V23 aceptado …
failure  30675762405   plan(V): V66 y V71 aceptados          ← primer rojo
success  30674820317   plan(V): alta de V90 (P0) …           ← último verde
```

Son **seis** runs en rojo consecutivos, no tres. Y la ventana señala a la causa: el rojo
entra con el merge de **V66**, que es el WP que escribió `src/webview/security.ts`. Encaja
con que el fichero sea obra de V66 (su cabecera lo dice) y con que el defecto D-1 —el que
introdujo estas dos regex— se arreglara en ese carril. **No lo he verificado commit a
commit**: es una correlación de ventana, no un `git bisect`. La afirmación segura es la
del encargo, y se confirma: **no lo introduce ningún WP reciente**.

---

## 7 · Estado de CI, leído con `gh`

**Antes** (MEDIDO, `gh run view 30715004146`, último run de `main`):

```
X main ci · 30715004146
JOBS
  ✓ exthost in 55s
  X build in 32s
      X Lint (eslint · src)     ← ✖ 184 problems (2 errors, 182 warnings) · exit 1
```

**Después**: **NO MEDIDO, y es lo único que falta.** El encargo reserva el `push` al
orquestador («la rama la empujo yo para que CI la juzgue **antes** de aterrizar»), así que
esta rama **no se ha empujado** y **no hay un run de CI que yo pueda enseñar**. Sería
deshonesto presentar mi árbol como prueba de lo que hace un runner.

Lo que sí puedo afirmar, y con qué fuerza:

* **MEDIDO**: los **ocho** pasos del job `build` salen **exit 0** en local con el comando
  exacto del flujo (§6.2), incluido el que estaba rojo.
* **MEDIDO**: el paso que falla en el remoto, `npm run lint`, pasa de `2 errors` a
  `0 errors` **sin mover el recuento de warnings** (184 → 182 problemas).
* **NO MEDIDO**: que el runner (ubuntu / node 20) reproduzca lo mismo. Los dos ejes que
  V93 dejó declarados siguen sin cerrarse, y este WP tampoco los cierra.

`.github/workflows/ci.yml` dispara con `push` sobre `wp/**`, así que el empujón del
orquestador basta para obtener el veredicto sin abrir PR. **La CA «`gh run view` sobre
`main` da `success`» no la puedo cerrar yo**: depende de un push y de un merge que no me
corresponden.

---

## 8 · Lo que este WP NO demuestra

1. **Ninguna medida mía es de un runner.** Windows/node 22 aquí, ubuntu/node 20 allí. Lo
   que corre en CI lo juzga CI, y por eso la rama se empuja antes de aterrizar.
2. **No he hecho `git bisect`** del commit que introdujo el rojo (§6.3): la ventana es
   `30674820317`→`30675762405` y el sospechoso es V66, pero eso es correlación.
3. **El rechazo de la reescritura es un juicio** (§4.2), no un hecho medido. Lo medido es
   que funciona, que es equivalente, y que su silencio viene de la ortografía.
4. **`tests/**` y `scripts/**` siguen sin lintarse** (`eslint src --ext ts`). Los tests que
   añado aquí no pasan por ninguna de estas reglas — ya declarado por V16 y por V93; no lo
   toco porque está fuera del alcance.
5. **El test 5.1 fija el estado de HOY**: si un WP futuro necesita un `eslint-disable`
   legítimo en `src`, ese test se pondrá rojo y habrá que decidirlo a la vista. Es
   deliberado —ése es el punto— pero es fricción que hereda quien venga.
