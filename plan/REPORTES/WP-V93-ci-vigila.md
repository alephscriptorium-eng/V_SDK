# WP-V93 · P0 — la integración continua de este mundo no vigilaba nada

| dato | valor |
| ---- | ----- |
| Carril | **V** · Aleph-0 (ℵ₀) |
| Encargo | `plan/BACKLOG.md:106` |
| Rama | `wp/v93-ci-vigila` · base `a0fb1d8` |
| Obra | `0363097` (primera entrega) · **segunda vuelta tras devolución de 4 bloqueantes** |
| Árbol de medida | `C:/S_LAB/wt/v-v93` · Windows 11 · 12 CPU |
| Herramienta | node v22.21.1 · jest 29.7.0 · ts-jest 29.2.5 |
| Fecha de todas las medidas | **2026-08-01** |

---

## 0 · Qué es de fiar aquí y qué no

**MEDIDO** = se ejecutó en este árbol y la salida está pegada. **LECTURA** = afirmación
sobre el contenido de un fichero que abrí, no una ejecución. **CITA** = viene de otro
reporte y no lo he vuelto a medir. Son tres cosas distintas y aquí no se mezclan.

Dos acotaciones que valen para el documento entero:

1. **Ninguna medida es de un runner de GitHub.** Todos los vectores corren en local con el
   **comando exacto** del flujo. Lo que queda sin demostrar está en §7.
2. **Esta máquina está bajo carga variable** (hay más worktrees vivos). El ruido de las
   medidas de tiempo es de ±50 %, y eso limita lo que puedo afirmar del coste (§5).

---

## 0.bis · La devolución: los cuatro bloqueantes tenían razón, y los cuatro son el mismo error

La primera entrega acertó el esqueleto —el orden de los pasos aguantó un ataque a fondo, las
dos direcciones del gate quedaron probadas, y el rechazo de la alternativa C se verificó en
el fuente—. **Lo que cayó fue el eje: el número del suelo y su grano.** Y los cuatro
bloqueantes son la misma falta repetida en cuatro órganos:

> **puse una cifra donde hacía falta una medida, y luego argumenté sobre la cifra.**

| # | qué entregué | qué medí ahora | estado |
| - | ------------ | -------------- | ------ |
| **B1** | «el trinquete tiene grano de **1 punto**», en seis sitios | el margen real era **0,10 puntos = 6 sentencias de 5903** | **cerrado** · §1.3 |
| **B2** | un trinquete de **porcentaje** sobre un denominador que creía estable | **9 de 95** ficheros de `src` fuera del mapa; **arreglar** 3 errores de tipos **ponía CI en rojo** | **cerrado** · §1.4 |
| **B3** | el suelo como cuatro dígitos en un comentario, sin declarar sus límites | nada lo vigilaba, y **sólo podía moverse a la baja** | **cerrado** · §6 |
| **B4** | «no toco la línea base» — y dejé en pie **3 citas que mi diff falsificó** | una de ellas dentro del recuadro «**LO QUE ESTE FICHERO NO GARANTIZA**» | **cerrado** · §1.5 |

**B1 es el que más duele**, porque el argumento era bueno y el número no lo sostenía: vendí
el truncado al entero como *el colchón que evita el rojo falso al pasar de Windows a Linux*,
y ese colchón eran **seis sentencias**. La decisión estaba bien tomada y mal fundada, que a
efectos de este swarm es estar mal.

**B4 es el más vergonzoso**, porque este WP nace exactamente de eso: una afirmación honesta
el día que se escribió, que dejó de serlo y siguió ahí. La regla ya estaba escrita en este
mundo —*una cita medida por grep caduca*— y la incumplí en el peor sitio posible.

---

## 1 · El estado real, medido

### 1.1 Los tres datos del encargo: verificados

| # | afirmación del encargo | veredicto |
| - | ---------------------- | --------- |
| a | `ci.yml:70` lleva `continue-on-error: true` sobre el paso que corre la suite | **exacto** (LECTURA, antes de mi diff) |
| b | ningún paso de CI ejecuta el gate | **exacto** (MEDIDO) |
| c | ese paso está permanentemente en rojo | **exacto** (MEDIDO, §1.2) |

```
$ grep -c "rojos-jest\|--gate" .github/workflows/*.yml
.github/workflows/ci.yml:0
.github/workflows/release.yml:0

$ grep -rn "continue-on-error" .github/workflows/
.github/workflows/ci.yml:67:      # `continue-on-error`: el resultado de este paso NO condiciona el job.
.github/workflows/ci.yml:70:        continue-on-error: true
```

**Uno solo, y es el del encargo.**

### 1.2 La suite, y por qué el paso estaba rojo

MEDIDO — `npm test --if-present`, el comando literal que corría CI:

```
Jest: "global" coverage threshold for statements (85%) not met: 26.1%
Jest: "global" coverage threshold for branches (75%) not met: 25.13%
Jest: "global" coverage threshold for lines (85%) not met: 26.55%
Jest: "global" coverage threshold for functions (80%) not met: 21.51%
Tests:       1 skipped, 410 passed, 411 total          EXIT=1
```

**411 tests · 410 pass · 1 skip · 0 fail, y EXIT 1.** El rojo no lo ponía ningún test.

MEDIDO — el gate contra su línea base, antes de tocar nada: `IDENTICO`, EXIT 0. El baseline
declara **una sola línea**, la clase `OMITE` del único test saltado.

### 1.3 · B1 · Jest compara a DOS DECIMALES: el colchón que vendí no existía

**LECTURA** de `node_modules/@jest/reporters/build/CoverageReporter.js:313-324`: el umbral se
compara contra `actuals[key].pct`, que ya viene redondeado a dos decimales, con
`actual < threshold`.

**MEDIDO** — umbrales puestos a lo medido **+0,01**, sin tocar un solo fichero:

```
$ node node_modules/jest/bin/jest.js --coverage \
    --coverageThreshold='{"global":{"statements":26.11,"branches":25.14,"lines":26.56,"functions":21.52}}'
Jest: "global" coverage threshold for statements (26.11%) not met: 26.1%
Jest: "global" coverage threshold for branches (25.14%) not met: 25.13%
Jest: "global" coverage threshold for lines (26.56%) not met: 26.55%
Jest: "global" coverage threshold for functions (21.52%) not met: 21.51%
Tests:       1 skipped, 410 passed, 411 total          EXIT=1
```

**Un déficit de 0,01 bloquea, con los 411 tests en verde.** Y el margen real que dejaba el
truncado al entero, MEDIDO en unidades:

| métrica | cubierto/total | pct | margen hasta el suelo entero |
| ------- | -------------- | --- | ---------------------------- |
| statements | 1541/5903 | 26.10 | **6** |
| branches | 545/2168 | 25.13 | **3** |
| functions | 272/1264 | 21.51 | **6** |
| lines | 1519/5720 | 26.55 | **31** |

Seis sentencias de 5903 no son «un punto de holgura para cambiar de sistema operativo». Es
ruido. **El argumento con el que justifiqué el eje del WP no lo sostenía el número.**

### 1.4 · B2 · El denominador no es estable: arreglar `src` tumbaba el trinquete

MEDIDO — **9 de los 95** ficheros de `src/**/*.ts` (sin `.d/.test/.spec`) no aparecen en el
mapa de cobertura. Clasificados abriéndolos, no suponiéndolos:

- **6 son sólo tipos** (`commands/types.ts`, `bootstrap/context.ts`, `mcpTypes.ts`,
  `ICompany.ts`, `IPlay.ts`, `ITheatricalAgent.ts`): cero declaraciones ejecutables, no emiten
  JavaScript. **Ausencia legítima y permanente.**
- **3 son código real que NO COMPILA**, y los tres por el mismo error — `TS2353` sobre
  `capabilities: { resources: {} }` contra los tipos de `@modelcontextprotocol/sdk`:
  `src/launcher/LauncherCatalogClient.ts:57` · `src/mutation/LineaEditorClient.ts:69` ·
  `src/resources/McpResourceClient.ts:22`. La corrida lo dice en pantalla («Failed to collect
  coverage from …») **mientras el porcentaje sale limpio**.

MEDIDO — la misma suite con los diagnósticos de ts-jest apagados, o sea **el mundo en que
esos tres ficheros están arreglados**:

| métrica | hoy (3 fuera) | con los 3 dentro | Δ total | **cubierto** |
| ------- | ------------- | ---------------- | ------- | ------------ |
| statements | 1541/5903 = **26.10** | 1541/6038 = **25.52** | +135 | **idéntico** |
| branches | 545/2168 = **25.13** | 545/2235 = **24.38** | +67 | **idéntico** |
| functions | 272/1264 = **21.51** | 272/1291 = **21.06** | +27 | **idéntico** |
| lines | 1519/5720 = **26.55** | 1519/5853 = **25.95** | +133 | **idéntico** |

Contra los suelos de mi primera entrega (26/25/26/21): **caen statements, branches y lines**.
O sea: **arreglar dos errores de tipos —una mejora, sin tocar un test— ponía CI en rojo.** Y
el inverso: romper la compilación de un fichero mal cubierto lo saca del denominador y **sube**
el porcentaje con la suite en verde.

Es **exactamente el vicio con el que yo mismo maté la alternativa C** —«una mejora rompería el
gate»— cometido en otro órgano y sin declararlo.

### 1.5 · B4 · Tres citas que mi propio diff volvió falsas

En `scripts/rojos-jest.baseline.txt`, LECTURA: `:34` afirmaba que CI no vigila el gate citando
la línea del `continue-on-error` —**hoy es un comentario**— y estaba **dentro del recuadro
«LO QUE ESTE FICHERO NO GARANTIZA — léase antes de confiar en él»**; `:57` daba los umbrales
viejos; `:85` decía que el rojo de umbral seguía abierto, **cerrado por mí**.

Corregidas las tres, **sin tocar la línea del conjunto de rojos** (verificado: el diff del
fichero no contiene una sola línea que no empiece por `#`).

### 1.6 Dos correcciones de cita al propio encargo

- **`jest.config.js:14` — no.** `collectCoverage: true` estaba en la **línea 12**; la 14 era
  `coverageReporters`. El hecho de fondo, correcto.
- `jest.config.js:23-30` y `ci.yml:70`: **exactos** antes de mi diff.

CITA no re-medida: «5 corridas, 2 bajo carga, mismo conjunto» (V90/V91).

---

## 2 · Qué vigila CI ahora, y por qué

> **Cuatro pasos, los cuatro bloquean:** el conjunto de rojos **por nombre** · la suite
> instrumentada · el **trinquete de cobertura** (censo + unidades cubiertas) · y una guarda
> de que no vuelva a entrar un paso blando.

```yaml
- name: Gate · conjunto de rojos por nombre (BLOQUEA)
  run: node scripts/rojos-jest.mjs --gate

- name: Suite instrumentada · escribe el informe de cobertura (BLOQUEA)
  run: npm test

- name: Trinquete de cobertura · censo + unidades cubiertas (BLOQUEA)
  run: node scripts/cobertura-trinquete.mjs

- name: Guarda · ningún paso blando en este flujo
  run: |
    if grep -rnE '^[[:space:]]*continue-on-error' .github/workflows/; then … exit 1; fi
```

### 2.1 El gate, sin cobertura, y la cobertura aparte

Lo impone el propio instrumento (LECTURA de `scripts/rojos-jest.mjs:286-297`): con cobertura
activa un fallo de umbral **no deja rastro con nombre** en el JSON, y sólo puede aflorar como
`SINNOMBRE`, que por definición **sólo salta si ninguna otra línea explica el fallo**. Con un
rojo con nombre presente, la caída queda tapada.

### 2.2 El trinquete mide **unidades cubiertas**, no porcentaje

Es la corrección de fondo de esta vuelta, y §1.4 es su prueba. Un porcentaje es una razón
sobre un denominador que en este repo **se mueve por motivos que no son cobertura**. Las
unidades cubiertas son inmunes: sólo bajan si se pierde cobertura de verdad.

**La prueba de que el eje nuevo es el correcto** — el mismo trinquete, contra el mundo de
§1.4 en el que los tres ficheros sí compilan:

```
$ node scripts/cobertura-trinquete.mjs --cobertura <cov-con-los-3-dentro>
  statements  1541 cubiertas (suelo 1541) · 25.52 % informativo, NO decide
  branches     545 cubiertas (suelo 545) · 24.38 % informativo, NO decide
  functions    272 cubiertas (suelo 272) · 21.06 % informativo, NO decide
  lines       1519 cubiertas (suelo 1519) · 25.95 % informativo, NO decide

CENSO · 3 fichero/s declarados como ausentes YA APARECEN en el mapa:
    - src/launcher/LauncherCatalogClient.ts
    - src/mutation/LineaEditorClient.ts
    - src/resources/McpResourceClient.ts
  Buena noticia: alguien lo arregló. Bórralo/s de scripts/cobertura.suelo.json.
EXIT=1
```

**El trinquete no se mueve** —las cubiertas son idénticas— y lo que salta es el **censo**,
nombrando los tres ficheros y diciendo que la corrección es **borrar tres líneas**. Donde el
diseño viejo daba un rojo de porcentaje que nadie sabía leer, el nuevo da una acción con
nombre. Ése era el «lado fuerte» que pedía la devolución.

### 2.3 El censo: que un fichero no instrumentable sea un ERROR

`scripts/cobertura.suelo.json` declara los 9 ausentes con su **clase** y su **motivo**
(`TIPOS`, permanente · `NO-COMPILA`, deuda con el código de error). Y se comprueba en las
**tres** direcciones: falta y no está declarado → error · está declarado y ya aparece → error ·
está declarado y ya no existe → error. Ninguna dirección pasa sin firma.

### 2.4 Y el `--if-present` también se fue

Convertía «el script `test` ya no existe» en un **verde**. Misma familia de fallo, en pequeño.

---

## 3 · Las alternativas descartadas, con su precio

| # | alternativa | por qué no |
| - | ----------- | ---------- |
| **A** | Quitar `continue-on-error` y dejar 75/80/85/85 | Job **rojo perpetuo**. Se ignora igual que hoy, con otra cara. |
| **B** | Quitar `continue-on-error` y `collectCoverage: false` | La cobertura **deja de medirse en cualquier sitio**. Cambia una mentira por una ceguera. |
| **C** | **Una sola corrida**: `--gate --permitir-cobertura -- --coverage` | Ahorra una corrida completa. Se descarta por tres precios (abajo). |
| **D** | El trinquete en un **job paralelo** | Duplica `checkout` + `setup-node` + `npm ci` para ahorrar una corrida. **No medido** — razono, no afirmo. |
| **E** | Mantener el trinquete como **porcentaje**, sólo afinando el número | **Medido imposible** en §1.4: el denominador se mueve solo. Cualquier número sería correcto hoy y falso al arreglar un fichero. |
| **F** | Excluir del `collectCoverageFrom` los 3 que no compilan | Sube el porcentaje **sin cubrir una línea** y esconde deuda real detrás de una config. Es el estrechamiento silencioso que el censo existe para impedir. |

**El detalle de C**, verificado en el fuente y no supuesto:

1. Pelea con el contrato del instrumento, cuya bandera se documenta como «si de verdad sabes
   lo que haces».
2. Empeora el diagnóstico: con cualquier rojo con nombre, la caída de cobertura es invisible.
3. **Y esto es lo que lo mata:** acopla el **baseline** al estado de la cobertura. Quien lo
   regenerara con el umbral incumplido dejaría `SINNOMBRE` declarado como rojo esperado, y
   desde ahí una **mejora** de cobertura daría `−` y rompería el gate.

---

## 4 · Los vectores: la prueba de que bloquea

**Nueve**, todos MEDIDOS con el comando exacto del flujo. Acotación repetida: **son locales**.

| # | qué se provoca | resultado |
| - | -------------- | --------- |
| **A** | un rojo declarado que **desaparece** (`−`) | `- FALLA tests/unit/inventado.test.ts …` · **EXIT 1** |
| **B** | un rojo **nuevo** (`+`) | `+ FALLA tests/unit/__vector-v93-transitorio.test.ts …` · **EXIT 1** |
| **C** | umbral **+0,01** (§1.3) | las 4 métricas caen con 411 tests verdes · **EXIT 1** |
| **D** | la cobertura **baja** (suelo 1542 vs 1541) | `statements: 1541 < suelo 1542 (faltan 1)` · **EXIT 1** |
| **E** | la cobertura **sube** sin registrarse | `branches: 545 > suelo 540+0 (sobran 5)` + el JSON que pegar · **EXIT 1** |
| **F** | un fichero de `src` sale del mapa **sin declararse** | nombra los 2 · **EXIT 1** |
| **G** | una **declaración caduca** (el fichero ya está en el mapa) | nombra el fichero · **EXIT 1** |
| **H** | informe de cobertura **rancio** (`--edad-max 1`) | `el informe es VIEJO: 44 s (tope 1 s)` · **EXIT 2** |
| **I** | `--edad-max xyz` (la guarda **no se apaga sola**) | `necesita un número de segundos` · **EXIT 2** |

A y B usan el gate; C-I, el trinquete. **B** usó un fichero transitorio
(`tests/unit/__vector-v93-transitorio.test.ts`) creado para la medida y borrado en cuanto
terminó — **nunca entra en un commit**; `git status` limpio comprobado. **D-G** usan copias del
suelo en scratchpad vía `--suelo`: **cero mutación del repositorio**.

### 4.1 El eslabón que NO mido: de EXIT 1 a job rojo

Que un paso sin `continue-on-error` que sale distinto de cero tumba el job es **semántica
documentada de GitHub Actions**, aquí **LECTURA del flujo**, no medida mía. Lo que demuestro
es lo que estaba en mi mano: que el comando que CI ejecuta **sale 1** en los nueve vectores.

### 4.2 El estado final, medido

```
paso 1  node scripts/rojos-jest.mjs --gate     → IDENTICO                 EXIT=0    85 s
paso 2  npm test                               → 410 pass, 1 skip         EXIT=0    87 s
paso 3  node scripts/cobertura-trinquete.mjs   → censo COMPLETO,
                                                 cubiertas EN EL SUELO    EXIT=0   185 ms
paso 4  guarda de pasos blandos                → cero                     EXIT=0
```

**No entrego un rojo.**

---

## 5 · El coste en tiempo

MEDIDO, reloj de pared, varias corridas:

| medida | corridas |
| ------ | -------- |
| `npm test` (con cobertura) — **el paso de ANTES** | 64 · 78 · 101 · 87 s |
| gate (sin cobertura) — **paso nuevo** | 52 · 93 · 66 · 85 s |
| **trinquete** (lee, no corre la suite) | **185 ms** |
| **la cadena entera** | **171 · 167 · 172 s** |

**Lo que NO puedo afirmar:** que la corrida sin instrumentar sea más barata. El ruido de esta
máquina es **mayor** que esa diferencia, y las parejas se cruzan. Sería fácil elegir la que me
conviene y no lo voy a hacer.

**Lo que sí es estructural:** CI pasa de **una** corrida completa de la suite a **dos**. La
porción de test **se dobla**: de ~60-100 s a ~170 s en esta máquina. **El trinquete no añade
una tercera corrida** — por eso lee el informe en vez de generarlo, y por eso paga el precio
declarado de una guarda de frescura más débil (§6.1). En un runner de GitHub los absolutos
serán otros y **no los he medido**.

**Incógnita declarada:** el job `exthost` corre **en paralelo** y descarga un VS Code real dos
veces bajo `xvfb`. Si es él quien marca el reloj de pared, la corrida extra puede no mover el
total. **No lo he medido** —necesita Linux y display— y no hay cifra en el reporte de V68.

---

## 6 · El mecanismo anti-retroceso, con su valor de partida

- **Dónde vive:** `scripts/cobertura.suelo.json` (dato) + `scripts/cobertura-trinquete.mjs`
  (instrumento). **Ya no son cuatro dígitos en un comentario**: mover el suelo es una línea de
  diff en un fichero de datos, que es lo que hace la firma visible.
- **Qué compara:** **unidades cubiertas absolutas**, no porcentaje (§1.4, §2.2).
- **Valor de partida, MEDIDO hoy** (no citado):
  `statements 1541 · branches 545 · functions 272 · lines 1519`
  (porcentajes informativos: 26.1 / 25.13 / 21.51 / 26.55).
- **Colchón: `0`.** Cero de verdad, y por eso está escrito como número en el fichero de datos y
  no como adjetivo en un comentario. Perder **una** unidad cubierta bloquea.
- **Determinismo del dato, MEDIDO:** cuatro corridas completas de la suite en este árbol dieron
  las **mismas cuatro cifras de cubiertas**. La métrica del trinquete no flapea.
- **Es un trinquete de verdad, no una pendiente:** falla también **hacia arriba**. Una mejora
  que no se registre bloquea, y el mensaje imprime el JSON exacto que hay que pegar. Sin esa
  dirección el suelo sólo podría moverse a la baja — que era el B3 de la devolución.

### 6.1 Lo que este suelo **NO** garantiza

- **No exige subir la cobertura.** El ~26 % es deuda **congelada**, no reducida. La meta
  75/80/85/85 **no la vigila nadie**, a propósito.
- **No prueba su frescura tan bien como el gate.** Aquél corre jest él mismo; éste **lee** el
  informe del paso anterior y sólo puede mirar el `mtime`. Un `touch` lo engañaría; una corrida
  que revienta sin escribir, no (MEDIDO, vector H: muere con EXIT 2, **nunca en verde**). Se
  eligió leer para no meter una tercera corrida de la suite en CI. **Precio declarado.**
- **No impide bajar el suelo**: impide bajarlo **sin firma**.
- **No tiene tests propios**, al contrario que `scripts/rojos-jest.mjs` (36). `tests/**` no está
  en mi ALCANCE_DIFF. Deuda dicha, no disimulada.
- **No vigila `scripts/` ni `tests/`**: `collectCoverageFrom` es sólo `src/**`.
- **Dos ejes de calibración sin medir** (M2 de la devolución, y tiene razón): el suelo se midió
  en **Windows con node 22**, y CI corre en **`ubuntu-latest` con node 20** (`ci.yml:17`; no hay
  `engines.node` ni `.nvmrc` que lo aten). Busqué node 20 en esta máquina y **no hay**, así que
  **no puedo medirlo y no lo finjo**. Acoto lo que sí sé: las dos ramas dependientes de
  plataforma de `src` (`processManager.ts:336`, `terminalManager.ts:148`) están **sin cubrir**
  (leído del informe), así que no aportan varianza. **Si la primera corrida en el runner
  discrepa, será un rojo de CALIBRACIÓN, no una regresión** — y el instrumento lo distingue
  solo: imprime las cifras del runner y el JSON exacto que hay que pegar. El arreglo es
  registrar la medida del runner, **no relajar el colchón «por si acaso»**.

---

## 7 · Qué sigue SIN vigilarse

1. **`release.yml` no corre ni un test, ni lint, ni el gate** (MEDIDO `grep`=0; LECTURA de sus
   pasos: `npm ci` → compilar → empaquetar → publicar). **Y `ci.yml:3-7` sólo dispara en
   `main`, `wp/**` y PR — nunca en tags**, así que un `push` de tag ejecuta **únicamente**
   `release.yml`. **Se puede publicar un `.vsix` de un ref cuya suite no ha corrido nunca.**
   Fuera de mi ALCANCE_DIFF; es el hueco más grande que queda.
2. **`eslint` sólo mira `src`.** `tests/**` y `scripts/**` no pasan por lint — incluidos
   `rojos-jest.mjs`, sus 36 tests y el trinquete nuevo.
3. **El gate no juzga si un test es bueno**, sólo si el conjunto de rojos cambió.
4. **La cobertura no bloquea por ser baja**, sólo por bajar (§6.1).
5. **La guarda de pasos blandos no puede protegerse de sí misma**: un `continue-on-error` sobre
   **ese mismo paso** lo silenciaría, porque un paso blando no puede tumbar su propio job.
   Convierte una regresión silenciosa en un diff visible; no la hace imposible. Declarado
   también en el flujo, al lado del paso.
6. **«Bloquea» está probado sobre el JOB, no sobre el MERGE.** Que `ci` sea comprobación
   obligatoria de la rama es configuración de servidor, **no medible desde aquí**. La CA del
   encargo dice «bloquea»: queda acotada a eso.
7. **El baseline es un fichero declarado**: el gate protege contra el cambio **silencioso**, no
   contra el **firmado**.
8. **Ningún vector se ejecutó en un runner de GitHub** (§0, §4.1).
9. **Nadie mide cuánto tarda `exthost`** (§5), así que nadie sabe el reloj real del flujo.
10. **Los 3 `TS2353` siguen sin arreglar**: son de `src/`, fuera de mi alcance. El censo los
    tiene declarados con nombre y motivo, y avisará en cuanto alguien los cierre.

---

## 8 · Diff entregado

| fichero | qué |
| ------- | --- |
| `.github/workflows/ci.yml` | el paso blando → **cuatro** pasos que bloquean; fuera `continue-on-error` y `--if-present`; guarda contra su regreso |
| `jest.config.js` | **fuera `coverageThreshold`** (con las dos medidas que lo condenan al lado); `json-summary` declarado porque es la entrada del trinquete |
| `scripts/cobertura-trinquete.mjs` | **nuevo** · censo + trinquete sobre unidades cubiertas, dos direcciones, con su recuadro «lo que NO garantiza» |
| `scripts/cobertura.suelo.json` | **nuevo** · el suelo medido y los 9 ausentes declarados por clase y motivo |
| `scripts/rojos-jest.baseline.txt` | **sólo comentarios**: las 3 citas que mi diff falsificó (verificado: ni una línea sin `#` tocada) |
| `README.md` | §«Qué verifica el pipeline» rehecha; fuera el «grano de 1 punto»; §«lo que NO comprueba» ampliada |
| `plan/BACKLOG.md` | sólo la fila **WP-V93** (corregida además la tupla que M1 señalaba) |
| `plan/REPORTES/WP-V93-ci-vigila.md` | este documento |

**No tocado, a propósito:** `package.json` (zona prohibida) · `tests/**` · `src/**` ·
`release.yml` · **el conjunto de rojos** de la línea base · `scripts/rojos-jest.mjs`.

### 8.1 Propuesta de script npm — NO escrita, para quien posea el fichero

El diseño **no lo necesita**. Si se quisiera un atajo local:

```json
"gate:rojos": "node scripts/rojos-jest.mjs --gate",
"cobertura:trinquete": "npm test && node scripts/cobertura-trinquete.mjs"
```

Comodidad, **no requisito**: CI invoca las rutas, para que el comando del flujo y el que he
medido sigan siendo el mismo carácter a carácter.

---

## 9 · La lección

La de la primera entrega sigue en pie: **declarar no es proteger** — el `continue-on-error`
estaba documentado, comentado y justificado, y no vigilaba nada.

Pero la que me llevo de verdad es la de la devolución, y es peor porque la cometí **mientras
escribía la otra**:

> **Una decisión correcta apoyada en una cifra sin medir sigue siendo una cifra sin medir.**

Bajar el umbral era lo correcto. El «colchón de 1 punto» con el que lo justifiqué eran seis
sentencias, y no lo comprobé porque el argumento *sonaba* bien. Escribí seis veces un número
que no había medido **en el mismo documento en el que exigía medir antes de citar**. La forma
de no repetirlo no es prometer más cuidado: es que **el número viva en un fichero de datos que
un instrumento comprueba**, que es donde ha acabado.
