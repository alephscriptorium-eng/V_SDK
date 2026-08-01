# WP-V93 · P0 — la integración continua de este mundo no vigilaba nada

| dato | valor |
| ---- | ----- |
| Carril | **V** · Aleph-0 (ℵ₀) |
| Encargo | `plan/BACKLOG.md:106` |
| Rama | `wp/v93-ci-vigila` · base `a0fb1d8` |
| Árbol de medida | `C:/S_LAB/wt/v-v93` · Windows 11 · 12 CPU |
| Herramienta | node v22.21.1 · jest 29.7.0 · ts-jest 29.2.5 |
| Fecha de todas las medidas | **2026-08-01** |

---

## 0 · Qué es de fiar aquí y qué no

Todo lo marcado **MEDIDO** se ejecutó en este árbol y su salida está pegada tal cual.
Lo marcado **CITA** viene de otro reporte o del encargo y **no** se ha vuelto a medir.
Lo marcado **LECTURA** es una afirmación sobre el contenido de un fichero que abrí, no
una ejecución. Las tres cosas son distintas y aquí no se mezclan.

Dos acotaciones que valen para el documento entero, dichas por delante:

1. **Ninguna medida es de un runner de GitHub.** Todos los vectores se ejecutan en local
   con el **comando exacto** que corre CI, que es lo más cerca que puedo llegar desde
   aquí. Lo que **no** queda demostrado está en §7.
2. **Esta máquina está bajo carga variable** (hay más worktrees vivos). El ruido de las
   medidas de tiempo es de ±50 %, y eso condiciona lo que puedo afirmar del coste (§5).

---

## 1 · El estado real, medido antes de tocar nada

### 1.1 Los tres datos del encargo: verificados

| # | afirmación del encargo | veredicto |
| - | ---------------------- | --------- |
| a | `ci.yml:70` lleva `continue-on-error: true` sobre el paso que corre la suite | **exacto** (LECTURA, línea 70 antes de mi diff) |
| b | ningún paso de CI ejecuta el gate | **exacto** (MEDIDO, abajo) |
| c | ese paso está permanentemente en rojo | **exacto** (MEDIDO, §1.2) |

```
$ grep -c "rojos-jest\|--gate" .github/workflows/*.yml
.github/workflows/ci.yml:0
.github/workflows/release.yml:0
```

Y el censo de pasos blandos en **todo** el directorio de flujos, no sólo en `ci.yml`:

```
$ grep -rn "continue-on-error" .github/workflows/
.github/workflows/ci.yml:67:      # `continue-on-error`: el resultado de este paso NO condiciona el job.
.github/workflows/ci.yml:70:        continue-on-error: true
```

**Uno solo, y es el del encargo.** No había otros escondidos.

### 1.2 La suite, y por qué el paso estaba rojo

MEDIDO — `npm test --if-present`, o sea el comando literal que corría CI:

```
Jest: "global" coverage threshold for statements (85%) not met: 26.1%
Jest: "global" coverage threshold for branches (75%) not met: 25.13%
Jest: "global" coverage threshold for lines (85%) not met: 26.55%
Jest: "global" coverage threshold for functions (80%) not met: 21.51%
Test Suites: 11 passed, 11 total
Tests:       1 skipped, 410 passed, 411 total
Time:        62.929 s
EXIT=1
```

**411 tests · 410 pass · 1 skip · 0 fail, y EXIT 1.** El rojo no lo ponía ningún test:
lo ponían los cuatro umbrales. El encargo lo decía y lo confirmo con la salida delante.

MEDIDO — el gate contra su línea base declarada, antes de tocar nada:

```
$ node scripts/rojos-jest.mjs --gate
conjunto de rojos IDENTICO al declarado
EXIT=0
```

El baseline declara **exactamente una línea**, y es la clase `OMITE` que corresponde al
único test saltado de los 411 (`clienteMcp.test.ts :: [pending] … skip-honesto`). O sea:
**el conjunto de rojos por nombre ya está en su sitio y el instrumento ya lo confirma.**
Lo único que faltaba era que alguien lo corriera donde importa.

### 1.3 Dos correcciones de cita al propio encargo

La regla de oro de este swarm es abrir el fichero antes de citar `fichero:línea`. Lo hice,
y el encargo tiene un desliz menor:

- **`jest.config.js:14` — no.** `collectCoverage: true` está en la **línea 12**; la 14 es
  `coverageReporters`. El hecho de fondo (la cobertura se recoge por defecto, así que
  `npm test` evalúa los umbrales siempre) es **correcto**.
- **`jest.config.js:23-30`** para los umbrales: **exacto** antes de mi diff.
- **`ci.yml:70`**: **exacto**.

CITA no re-medida por mí: «5 corridas, 2 de ellas bajo carga, mismo conjunto» (de V90/V91).
Mi trabajo se apoya en esa estabilidad pero no la vuelve a probar.

---

## 2 · Qué decido que vigile CI, y por qué

> **CI vigila dos cosas, las dos bloquean, y miden cosas distintas:**
> **(1) el conjunto de tests en rojo POR NOMBRE**, y **(2) que la cobertura no baje.**

El paso blando se parte en dos. Ninguno lleva `continue-on-error` — y en `ci.yml` ya no
queda ni uno.

```yaml
- name: Gate · conjunto de rojos por nombre (BLOQUEA)
  run: node scripts/rojos-jest.mjs --gate

- name: Trinquete de cobertura (BLOQUEA si baja)
  run: npm test
```

### 2.1 Por qué el gate y no el cardinal

Porque **falla en las dos direcciones** y eso es lo que lo hace firmable: un rojo nuevo
aparece con `+`, y un rojo declarado que desaparece aparece con `−`. Las dos exigen que
alguien toque el baseline y firme el cambio. Un `npm test` a secas sólo caza la primera.

### 2.2 Por qué la cobertura es trinquete y no acantilado

Un umbral que no se cumple **ningún** día no vigila **ninguno**. Los 75/80/85/85 contra un
26 % real no eran una defensa: eran la causa del rojo perpetuo que mantenía en `continue-on-error`
al único paso que corría la suite. Y un rojo perpetuo **tapa** cualquier rojo nuevo.

Así que los umbrales pasan a ser **el suelo medido**, no la meta:

| métrica | antes (meta) | ahora (suelo) | medido hoy |
| ------- | ------------ | ------------- | ---------- |
| statements | 85 | **26** | 26.1 |
| branches | 75 | **25** | 25.13 |
| lines | 85 | **26** | 26.55 |
| functions | 80 | **21** | 21.51 |

El razonamiento entero, con la medida, está escrito **en `jest.config.js` al lado de los
números**, que es donde lo va a leer quien los toque.

**Efecto colateral que importa:** `npm test` pasa de EXIT 1 perpetuo a **EXIT 0**. El rojo
local que nadie miraba desaparece, y el rojo que quede a partir de ahora significa algo.

### 2.3 Por qué el `--if-present` también se va

`npm test --if-present` convierte «el script `test` ya no existe» en un **verde**. Es la
misma familia de fallo que este WP viene a corregir, en pequeño. Sin el flag, que la suite
desaparezca rompe el job.

### 2.4 Por qué el gate corre SIN cobertura, y la cobertura aparte

No es eficiencia, es una condición para que el gate signifique algo, y la impone el propio
instrumento (`exigirSinCobertura`, LECTURA de `scripts/rojos-jest.mjs:286-297`): con
cobertura activa, un fallo de umbral **no deja rastro con nombre** en el JSON de jest —
sale `success:false`, `numFailedTests:0`— y sólo puede aflorar como la clase `SINNOMBRE`,
que por definición **sólo salta si ninguna otra línea explica el fallo**. Con un solo rojo
con nombre presente, la caída de cobertura queda tapada. Por eso son dos medidas separadas,
cada una con sus propios números.

---

## 3 · Las alternativas descartadas, con su precio

| # | alternativa | por qué no |
| - | ----------- | ---------- |
| **A** | Quitar `continue-on-error` y dejar los umbrales en 75/80/85/85 | Job **rojo perpetuo** por deuda de cobertura. Se ignora igual que hoy, con otra cara. Es literalmente lo que el encargo advierte. |
| **B** | Quitar `continue-on-error` y poner `collectCoverage: false` | El job pasa a verde, sí — pero la cobertura **deja de medirse en cualquier sitio** y nada impide que baje. Cambia una mentira por una ceguera. |
| **C** | **Una sola corrida**: `--gate --permitir-cobertura -- --coverage` | Ahorra una corrida completa de la suite (≈ la mitad del tiempo de test, §5). Se descarta por tres precios, y el tercero es el que lo mata. |
| **D** | El trinquete en un **job paralelo** aparte | Ahorraría reloj de pared, pero duplica `checkout` + `setup-node` + `npm ci` en un runner nuevo. **No medido por mí** — razono, no afirmo — pero un `npm ci` de este repo difícilmente baja de la corrida de suite que ahorra. |

**El detalle de C**, porque es la única que de verdad tentaba:

1. Pelea con el contrato explícito del instrumento, cuya propia bandera se documenta como
   «si de verdad sabes lo que haces».
2. Empeora el **diagnóstico**: con cualquier rojo con nombre presente, la caída de cobertura
   es invisible (§2.4). El job caería igual, pero diciendo otra cosa.
3. **Y esto es lo que lo mata:** acopla el **baseline** al estado de la cobertura. Quien
   regenerara el baseline un día con el umbral incumplido dejaría `SINNOMBRE` **declarado
   como rojo esperado** — y desde ese momento una **mejora** de cobertura rompería el gate.
   El baseline es valioso justamente porque es estable y por nombre; colgarlo de un número
   global flotante lo estropea.

---

## 4 · El vector: la prueba de que BLOQUEA

Tres vectores, los tres MEDIDOS con el **comando exacto** que corre CI. Acotación honesta
y repetida: **son locales, no de un runner**.

### 4.1 Vector A — un rojo que DESAPARECE (dirección `−`)

Cero mutación del repositorio: se usa `--baseline` contra una copia en scratchpad que
declara un rojo que no existe.

```
$ node scripts/rojos-jest.mjs --gate --baseline <copia>/baseline-vectorA.txt
conjunto de rojos DISTINTO del declarado:
- FALLA tests/unit/inventado.test.ts :: rojo declarado que ya no existe
EXIT=1
```

### 4.2 Vector B — un rojo NUEVO (dirección `+`)

Fichero **transitorio** (`tests/unit/__vector-v93-transitorio.test.ts`, un `expect(1).toBe(2)`),
creado para la medida y borrado en cuanto terminó. **Nunca entra en un commit** — `tests/**`
no es mío en este WP.

```
$ node scripts/rojos-jest.mjs --gate
conjunto de rojos DISTINTO del declarado:
+ FALLA tests/unit/__vector-v93-transitorio.test.ts :: vector V93 rojo nuevo introducido a proposito
EXIT=1
```

Y la limpieza, comprobada y no supuesta:

```
$ rm tests/unit/__vector-v93-transitorio.test.ts && git status --short
(vacío)
```

### 4.3 Vector C — la cobertura BAJA

Simular una caída real de un punto exigiría borrar tests; es equivalente y no invasivo
subir el suelo un punto por encima de lo medido. Cero mutación de ficheros:

```
$ node node_modules/jest/bin/jest.js --coverage \
      --coverageThreshold='{"global":{"statements":27,"branches":26,"lines":27,"functions":22}}'
Jest: "global" coverage threshold for statements (27%) not met: 26.1%
Jest: "global" coverage threshold for branches (26%) not met: 25.13%
Jest: "global" coverage threshold for lines (27%) not met: 26.55%
Jest: "global" coverage threshold for functions (22%) not met: 21.51%
Tests:       1 skipped, 410 passed, 411 total
EXIT=1
```

**Los 411 tests en verde y el paso cae igual.** Que es exactamente el punto del trinquete.

### 4.4 El eslabón que NO mido: de EXIT 1 a job rojo

Que un paso sin `continue-on-error` que sale distinto de cero tumba el job es **semántica
documentada de GitHub Actions**, y aquí es **LECTURA del flujo**, no una medida mía. Lo que
sí demuestro es lo que estaba en mi mano: que el comando que CI ejecuta **sale 1** en los
tres vectores. Y lo que quedaba sin demostrar antes de este WP era justo lo contrario: con
`continue-on-error: true`, el paso podía salir 1 **y el job seguía verde** — por eso ese
eslabón era el problema y no el que ahora queda sin medir.

### 4.5 El estado final, medido

Los dos pasos nuevos, con el comando literal del flujo, sobre el árbol tal como se entrega:

```
$ node scripts/rojos-jest.mjs --gate
conjunto de rojos IDENTICO al declarado          EXIT=0

$ npm test
Test Suites: 11 passed, 11 total
Tests:       1 skipped, 410 passed, 411 total
All files    |  26.1 |  25.13 |  21.51 |  26.55 |     EXIT=0
```

**No entrego un rojo.** `npm test` sale 0 por primera vez.

---

## 5 · El coste en tiempo: antes y después

MEDIDO, tres corridas de cada cosa, reloj de pared:

| medida | corridas | jest dice |
| ------ | -------- | --------- |
| `npm test` (con cobertura) — **el paso de ANTES** | 64 s · 78 s · 101 s | 62.9 · 73.7 · 98.7 s |
| gate (sin cobertura) — **el paso NUEVO** | 52 s · 93 s · 66 s | — |
| **los dos juntos, en pareja** | **171 s** · **167 s** | — |

**Lo que NO puedo afirmar:** que la corrida sin instrumentar sea más barata. El ruido de
esta máquina (±50 %, hay más worktrees trabajando) es **mayor** que la diferencia entre
instrumentar y no instrumentar. Las parejas se cruzan: en una el gate tardó más que
`npm test`. Sería fácil elegir la pareja que me conviene y no lo voy a hacer.

**Lo que sí es estructural y cierto:** CI pasa de **una** corrida completa de la suite a
**dos**. La porción de test del job **aproximadamente se dobla**. En esta máquina, de
~60-100 s a ~170 s. En un runner de GitHub los absolutos serán otros y **no los he medido**.

**Un matiz que no puedo cerrar y por tanto no vendo:** el job `exthost` corre **en paralelo**
con `build` y descarga un VS Code real **dos veces** bajo `xvfb`. Si es él quien marca el
reloj de pared del flujo, la corrida extra de `build` puede no mover el total ni un segundo.
**No lo he medido** —no puedo: necesita Linux y display— y no hay cifra en el reporte de
WP-V68. Queda como incógnita declarada, no como consuelo.

---

## 6 · El mecanismo anti-retroceso, con su valor de partida

- **Mecanismo:** `coverageThreshold.global` en `jest.config.js`. Jest falla cuando la
  cobertura real cae por debajo del suelo. No hace falta script nuevo ni script npm nuevo.
- **Valor de partida, MEDIDO hoy** (no citado): `statements 26.1 · branches 25.13 ·
  lines 26.55 · functions 21.51`.
- **Suelo declarado:** `26 / 25 / 26 / 21` — el entero **truncado hacia abajo**.
- **Por qué truncado, y su precio dicho en voz alta:** la medida es de **Windows** y CI corre
  en **`ubuntu-latest`**. Un suelo al decimal calibrado en una plataforma es una fábrica de
  rojos falsos en la otra, y un rojo falso el día del estreno mata el trinquete. **Precio:
  el trinquete tiene grano de 1 punto** — una caída menor que eso pasa sin bloquear. Cuando
  haya una corrida verde en el runner se puede apretar al decimal con el número medido allí.
- **Riesgo de plataforma acotado, no supuesto:** busqué las ramas dependientes de plataforma
  y las dos que hay en `src` (`processManager.ts:336`, `terminalManager.ts:148`) caen dentro
  de rangos **sin cubrir** (`336-352` y `25-230` en el informe de cobertura), así que hoy no
  aportan varianza. Los otros dos usos de `process.platform` son valores, no ramas.
- **Alcance del trinquete:** `collectCoverageFrom` es **sólo `src/**`**. La cobertura de
  `scripts/` y `tests/` —incluido el propio instrumento del gate— **no entra en el número**.

La meta 75/80/85/85 **no desaparece del mundo, desaparece de los umbrales**: queda escrita
como deuda viva en `jest.config.js` y en el README. Deuda y defecto son cosas distintas, y
sólo el defecto bloquea.

---

## 7 · Qué sigue SIN vigilarse

Un gate se abre por lo que midió; esto es lo que **no** mide. Lo que no corre en CI, hoy
no corre en ningún sitio salvo que alguien se acuerde.

1. **`release.yml` no corre ni un test.** MEDIDO (`grep` = 0 gate) y LECTURA de sus pasos:
   `npm ci` → `compile:production` → `package:v1` → publicar release. **Se puede publicar un
   `.vsix` de un tag cuya suite no ha corrido nunca en ese ref.** Está fuera de mi
   ALCANCE_DIFF —no toco `release.yml`— y lo dejo señalado como el hueco más grande que veo.
2. **`eslint` sólo mira `src`.** `tests/**` y `scripts/**` no pasan por lint en ningún paso —
   incluidos `scripts/rojos-jest.mjs` y sus 36 tests. **El instrumento que vigila la suite no
   está vigilado por el lint.**
3. **El gate no juzga si un test es bueno**, sólo si el conjunto de rojos cambió. 410 tests
   verdes que no comprobaran nada seguirían verdes y el gate aplaudiría.
4. **La cobertura no bloquea por ser baja**, sólo por bajar. El 26 % es deuda congelada, no
   reducida. Nada en CI empuja hacia el 85 %.
5. **El trinquete no ve caídas menores de 1 punto** (§6).
6. **El suelo está calibrado en Windows.** Si Linux midiera por debajo del entero, la primera
   corrida de CI saldría roja — y sería un rojo **de calibración**, no una regresión. Queda
   escrito aquí para que nadie lo confunda: se arregla midiendo en el runner y ajustando el
   suelo, no relajándolo «por si acaso».
7. **El baseline es un fichero declarado.** El gate protege contra el cambio **silencioso**,
   no contra el **firmado**: quien regenere el baseline puede consagrar un rojo nuevo. Eso es
   deliberado —para eso existe una firma— pero conviene saberlo.
8. **Ningún vector se ejecutó en un runner de GitHub** (§0, §4.4). El eslabón «EXIT 1 → job
   rojo» es lectura del flujo, no medida.
9. **El smoke vivo del probe V08** contra `linea-editor` sale `⏳` en CI: nunca hay servidor.
10. **Nadie mide cuánto tarda el job `exthost`** (§5), y por tanto nadie sabe hoy cuál es el
    reloj de pared real del flujo.

---

## 8 · Diff entregado

| fichero | qué |
| ------- | --- |
| `.github/workflows/ci.yml` | el paso blando → dos pasos que bloquean; fuera `continue-on-error` y `--if-present`; el porqué escrito al lado |
| `jest.config.js` | umbrales 75/80/85/85 → suelo medido 26/25/26/21, con la medida y la acotación de plataforma al lado de los números |
| `README.md` | §«Qué verifica el pipeline»: la tabla ya no documenta la marca blanda; se añaden las dos filas nuevas, el job `exthost` (que faltaba) y §«lo que NO comprueba» reescrita |
| `plan/BACKLOG.md` | sólo la fila **WP-V93** |
| `plan/REPORTES/WP-V93-ci-vigila.md` | este documento |

**No tocado, a propósito:** `package.json` (zona prohibida) · `tests/**` · `scripts/rojos-jest.mjs`
y su línea base · `release.yml`.

### 8.1 Propuesta de script npm — NO escrita, para que la escriba quien posea el fichero

El diseño **no necesita** ningún script npm nuevo: el gate se invoca por su ruta y el
trinquete es `npm test`. Si aun así se quisiera un atajo local, el texto exacto sería:

```json
"gate:rojos": "node scripts/rojos-jest.mjs --gate"
```

Sería **comodidad, no requisito**: CI no lo usaría, para que el comando del flujo y el
comando que yo he medido sigan siendo el mismo carácter a carácter.

---

## 9 · La lección que me llevo

El encargo la traía y la confirmo con la obra hecha: **declarar no es proteger.** El
`continue-on-error` de este repo estaba **documentado en el README, comentado en el flujo y
justificado** — y no vigilaba nada. La honestidad del comentario no le daba fuerza ninguna.

Y una segunda, que es la que de verdad decidía este WP: **un umbral que no se cumple ningún
día no vigila ninguno.** El 85 % de cobertura parecía la parte exigente de esta configuración
y era la parte inerte: al no cumplirse nunca, mantenía en rojo perpetuo al único paso que
corría la suite, y ese rojo perpetuo era el que tapaba todo lo demás. Bajar el umbral a lo
que de verdad hay es, contra toda intuición, **lo que hace que empiece a vigilar**.
