# WP-V71 · OutputChannel + log estructurado — reporte

| dato | valor |
| ---- | ----- |
| agente | worker V · rama única, worktree `C:\S_LAB\wt\v-v71` |
| fecha | 2026-08-01 |
| rama | `wp/v71-log-estructurado` (base `main` = `ef86fba`) |
| commits | obra: `dbae546` · `e319ae3` · `322997a` · `8bc976d` · `b2a2ebf` · `84009f5` · `e78c1a1` · `717b840` — corrección: `b8f6ec3` · `0acf7fd` · `3a5166e` · `2277283` |
| eje(s) CA | **estructural** (pieza ancha, «cero cambio observable») + roce de **frontera de confianza** (secretos en el log) |
| riesgo de revisión | `independiente` — §4.5 de `plan/PRACTICAS.md`: «cero cambio observable» sobre pieza ancha |
| revisor distinto del worker | 1ª contrarrevisión: **DEVUELTO** · 2ª: `⏳ pendiente` (acotada a D1, D2, `auth`/`tokenEnv`, castellano y las dos formas del gate) |
| estado propuesto | **devuelto-corregido** — desvío D1 **aprobado por el orquestador**; los 6 puntos de la devolución, cerrados (§−1) |

---

## §−1 · CORRECCIÓN DE LA DEVOLUCIÓN

Seis puntos, seis commits de corrección. Nada de lo que el contrarrevisor
declaró «resiste» se ha tocado.

| # | qué pedía | qué hice | commit |
| - | --------- | -------- | ------ |
| **D1** | tres sitios re-nivelados a `warn` contra lo que declaraba el reporte → volver a `info` | hecho, **y verificado mecánicamente que no había un cuarto** | `b8f6ec3` |
| **D2** | `id` y `pid` desaparecidos del log de procesos | restaurados; `terminal` es ya la única exclusión, dicho así | `b8f6ec3` |
| **D5** | la justificación de `auth` no la sostiene el árbol; y `tokenEnv` se cegaba | comparación **por palabras**: `auth` entra, `author` no se toca, `tokenEnv` sobrevive | `0acf7fd` |
| **D4** | castellano, `Basic`, `ENV` en minúsculas, incoherencia entre patrones | un solo vocabulario para los cuatro caminos; huecos cerrados; límites declarados **y fijados por test** | `0acf7fd` |
| **D3** | el comentario promete `-p X` y el patrón no lo cubre | corregido el **comentario**: `-p` no se tapa a propósito (es «port» en medio ecosistema) → límite L4 | `0acf7fd` |
| **gate** | cerrar `process.stdout/stderr` y el alias de `globalThis`; declarar el resto; corregir el «9/9» | dos selectores nuevos; sonda ampliada a 19 formas; afirmación reescrita | `3a5166e` |
| **D6** | decidir y declarar lo del `dispose` en `deactivate` | **se retira**: el canal ya no se cierra. Razonado en el código y en §8bis | `2277283` |
| — | acotar la afirmación de `forOperation` (multi-módulo) | acotada en cabecera, jsdoc **y fijada por test** | `2277283` |

### Sobre D1 — lo que de verdad se rompía

El contrarrevisor tiene razón en el diagnóstico y agradezco la precisión: el
daño era **cero** (`WARN < INFO`, nada se silenciaba), pero lo que se rompía no
era el comportamiento sino **la prueba**. Mi conclusión «ninguna línea queda
silenciada» estaba demostrada *por la regla 1:1*, y una regla con tres
excepciones no demuestra nada. Con el umbral en `warn` —clave que
`structuredLog.ts` ya lee— esas tres se habrían comportado distinto de lo
prometido.

No me limité a arreglar los tres que me señalaron: escribí un **comparador
mecánico** que saca de `git show main:<fichero>` la secuencia de métodos de
consola y de la versión actual la secuencia de niveles del canal, y las coteja
**en orden**. Así la afirmación 1:1 deja de ser una inspección y pasa a ser una
medida:

```
OK  src/processManager.ts                          base=16 canal=16
OK  src/core/AracneBotService.ts                   base=14 canal=14
DIF src/views/HackerControlPanelProvider.ts        base=18 canal=18
OK  src/views/HackerTasksPanelProvider.ts          base=13 canal=13
DIF src/views/HackerCommandPanelProvider.ts        base= 8 canal= 8
DIF src/views/HackerConfigPanelProvider.ts         base= 7 canal= 7
OK  src/libs/alephscript-client.ts                 base= 6 canal= 6
OK  src/extension.ts                               base= 6 canal= 6
OK  src/core/managerFactory.ts                     base= 3 canal= 3
OK  src/core/extensionBootstrap.ts                 base= 2 canal= 2
OK  src/treeViews/configsTreeView.ts               base= 2 canal= 2

TOTAL base=95 canal=95
DESVIOS DE NIVEL (3):
  src/views/HackerControlPanelProvider.ts  #9  esperado=info  actual=warn
  src/views/HackerCommandPanelProvider.ts  #8  esperado=info  actual=warn
  src/views/HackerConfigPanelProvider.ts  #7  esperado=info  actual=warn
```

**Exactamente los tres, ningún cuarto.** Tras el arreglo, `DESVIOS DE NIVEL (0)`.

**Seguimiento propuesto (no lo hago aquí):** «comando desconocido llegado desde
un webview» **merece** `warn` — es una superficie que manda algo que no
existe. Las tres rutas, para quien coja el WP:
`src/views/HackerCommandPanelProvider.ts:129`,
`src/views/HackerConfigPanelProvider.ts:107`,
`src/views/HackerControlPanelProvider.ts:109`. Primero la equivalencia
demostrable; luego la mejora.

### Sobre D5 — la justificación se autoalimentaba, y lo comprobé yo

El contrarrevisor lo contó bien y lo verifiqué de primera mano antes de tocar
nada:

```
$ grep -rnE "^\s*(author|authorship)\s*[?:]" src --include=*.ts | wc -l
0
```

`AuthorshipSnapshot` (`src/mutation/types.ts:33-44`) no tiene campo `author`;
`AuthorshipService` ni siquiera está migrado al canal. **El único `author:` del
árbol era el que yo mismo planté en el test que fijaba la decisión** — la
justificación se sostenía sobre su propia prueba. Y la dicotomía era falsa:

```
$ node -e "const re=/\bauth\b/i; ['author','authorship','authorId','auth'].forEach(s=>console.log(re.test(s),s))"
false author      false authorship      false authorId      true auth
```

Mientras tanto el patrón **sí** cegaba un campo real: `VisibleGate.tokenEnv`
(`src/mutation/types.ts:24`) es el **nombre** de una variable de entorno y salía
como `«redactado»`. Protegía un campo inventado a costa de uno que existe.

El arreglo no es añadir `\bauth\b` sino cambiar el **criterio**: las claves se
comparan ahora **por palabras** (camelCase, snake, kebab, acrónimos). `authToken`
→ `auth|token` (tapa); `author` → `author` (no tapa), sin excluir nada. Como
efecto, se puede meter `pin` sin cazar `spinner` ni `pingInterval` — cosa que un
patrón por subcadena no permitía. Y los sufijos de referencia (`env`, `name`,
`var`, `field`…) marcan «esta clave nombra **dónde** vive el valor»: `tokenEnv`
conserva el suyo.

---

## §0 · DESVÍOS — antes que nada

### D1 · Toqué 4 ficheros de `src/views/` pese al «no toques las webviews» del BRIEF

> **APROBADO por el orquestador** en la devolución: verificó que la intersección
> con el carril de webviews es **vacía**. El `git revert 8bc976d` que dejé
> preparado no se usa. Se conserva el apartado como registro de cómo se midió.

El BRIEF dice: «Tampoco toques `src/config` ni las webviews (otros carriles)».
**56 de los 105 `console.*` vivos estaban en `src/views/`.** Respetarlo al pie
de la letra dejaba el WP en 49/105 — menos de la mitad del encargo.

Lo que hice, y por qué creo que respeta el *propósito* de la prohibición
(que es no pisar a un escritor vivo, invariante I-2):

| fichero | ¿obra viva de otro carril? | medida | qué hice |
| ------- | -------------------------- | ------ | -------- |
| `src/views/BaseHackerPanelProvider.ts` | **SÍ** — V66 | `git diff --stat main...wp/v66-csp` lo lista | **NO tocado** |
| `src/views/TeatroWebViewProvider.ts` | **SÍ** — V66 | idem | **NO tocado** |
| `src/views/HackerControlPanelProvider.ts` | no | ausente del diff de V66 | migrado |
| `src/views/HackerTasksPanelProvider.ts` | no | ausente del diff de V66 | migrado |
| `src/views/HackerCommandPanelProvider.ts` | no | ausente del diff de V66 | migrado |
| `src/views/HackerConfigPanelProvider.ts` | no | ausente del diff de V66 | migrado |

Worktrees vivos medidos en el momento de escribir esto (`git worktree list`):
`v-v23` (`wp/v23-config-intencional`, diff **vacío** contra main), `v-v66`
(`wp/v66-csp`), `v-v71` (yo). V37/V38/V39 (los «3 inquilinos» de la fila de
webviews) son **ola F2-5**: sin rama y sin worktree.

**Está aislado en un solo commit (`8bc976d`) a propósito**: si el orquestador
lee la frontera en sentido estricto, `git revert 8bc976d` lo deshace entero y
el WP queda en 49/105 sin tocar nada más. No lo revierto yo porque no me
corresponde decidirlo.

### D2 · El log cambia de destino y de formato — esa ES la obra, no un efecto colateral

«Cero cambio observable» lo interpreto como **cero cambio en el comportamiento
del programa** (control de flujo, valores de retorno, efectos sobre VS Code),
no como «el log sale igual que antes»: cambiar el log es el encargo. Lo que se
midió y salió idéntico está en §4. Lo que sí cambia, declarado:

- el destino pasa de la consola del Extension Host al canal «Aleph-0»;
- el formato pasa a estructurado (ver §3);
- tres puntos cambian el *contenido* del dato, y ninguno el flujo:
  - `src/processManager.ts` · `showProcessLogs` enumeraba el objeto entero;
    ahora lista campos, porque `ProcessInfo.terminal` es un `vscode.Terminal`
    vivo y volcarlo ensucia sin diagnosticar;
  - `src/core/AracneBotService.ts` y `src/libs/alephscript-client.ts` pierden
    el prefijo `[AracneBot]` / `[nombre]` del texto: ahora lo lleva el campo
    «origen» (y el nombre de instancia va como dato `client`);
  - los secretos salen tapados (§5) — es CA4.

### D3 · Sin re-nivelar: mapeo 1:1 — **ahora sí, y medido**

`console.log → info`, `console.warn → warn`, `console.error → error`. El umbral
por defecto es INFO, así que **ninguna línea que antes se imprimía queda ahora
silenciada**.

En la primera entrega esta afirmación era **falsa en 3 de 95 sitios**; la
devolución la cazó. Corregido y verificado con el comparador mecánico de §−1:
`TOTAL base=95 canal=95`, `DESVIOS DE NIVEL (0)`. La afirmación ya no es una
inspección, es una medida reproducible.

Hay puntos claramente ruidosos (p. ej. «Received message from webview» en cada
mensaje) que *pedirían* bajar a `debug`, y tres que pedirían subir a `warn`
(§−1); no lo hice porque eso sí sería un cambio observable. Queda como
candidato a WP (§8).

---

## §1 · Módulo nacido

| ruta | papel |
| ---- | ----- |
| `src/core/logging/redact.ts` | pieza **pura** (sin `vscode`, sin E/S, sin estado): redacción de secretos y serialización |
| `src/core/logging/structuredLog.ts` | el canal: `OutputChannel` propio, cabecera de sesión, formato de línea, correlación, anillo en memoria |
| `src/core/logging/index.ts` | **única** puerta de entrada del código vivo |

El nombre del canal es `Aleph-0` (identidad nueva, invariante I-4), no el scope
viejo `AlephScript` de los 9 canales de `src/loggingManager.ts`.

Invariantes de la pieza, las tres verificadas por test (§4):

1. **Nunca lanza** — un fallo del logger no puede tumbar al llamante.
2. **Nunca cae de vuelta a `console`** — ni en su propio camino de error.
3. **Perezoso** — el canal se crea al primer log, no al importar: importar el
   módulo en un test no crea superficie de VS Code.

Reutiliza `LogLevel` y `LogCategory` de `src/loggingManager.ts` en vez de
declarar una taxonomía nueva: gate de dedup, una sola definición de cada
símbolo en el árbol.

---

## §2 · Inventario de puntos migrados, por fichero

Censo de partida (rama `main`): **109 apariciones textuales** de `console.` en
`src/**/*.ts`, de las cuales **105 son llamadas reales** según el AST de ESLint
(las otras 4 se desglosan en §3.2).

| fichero | migrados | quedan |
| ------- | -------: | -----: |
| `src/processManager.ts` | 16 | 0 |
| `src/core/AracneBotService.ts` | 14 | 0 |
| `src/views/HackerControlPanelProvider.ts` | 18 | 0 |
| `src/views/HackerTasksPanelProvider.ts` | 13 | 0 |
| `src/views/HackerCommandPanelProvider.ts` | 8 | 0 |
| `src/views/HackerConfigPanelProvider.ts` | 7 | 0 |
| `src/libs/alephscript-client.ts` | 6 | 0 |
| `src/extension.ts` | 6 | 0 |
| `src/core/managerFactory.ts` | 3 | 0 |
| `src/core/extensionBootstrap.ts` | 2 | 0 |
| `src/treeViews/configsTreeView.ts` | 2 | 0 |
| **TOTAL migrado** | **95** | **0** |
| `src/views/BaseHackerPanelProvider.ts` | 0 | **6** ← carve-out V66 |
| `src/views/TeatroWebViewProvider.ts` | 0 | **4** ← carve-out V66 |

`src/core/mcpConfigurationManager.ts:20` no era una llamada sino un **comentario**
de WP-V13 que citaba el símbolo literal; lo reformulé («el volcado heredado a la
consola») porque una cita literal dentro de un comentario **falsea el censo del
grep** — exactamente el tipo de cosa que un contrarrevisor buscaría.

Cuadre: 109 textuales = 95 migradas + 10 del carve-out + 1 comentario +
2 de `socketMonitor` + 1 de `aiAssistantService`. Reales AST: 105 = 95 + 10.

---

## §3 · CA1 · Cero `console.log` sueltos — el gate, su patrón y su salida

### 3.1 · Sensor primario: reglas AST, no regex

Un regex sobre el texto es el sensor equivocado aquí: da falso positivo con
`console.log` escrito **dentro de un literal** (JS de webview embebido) y falso
negativo con el **alias**. El gate vive en `.eslintrc.cjs` y son **tres reglas**,
las tres en `error`.

Escribí el gate pensando en quien intente esquivarlo, y lo **medí con una sonda**
(fichero temporal, ejecutado y borrado). La devolución señaló con razón que mi
«9/9» describía nueve formas **todas de la familia `console.*`** — o sea, la
sonda se había autoseleccionado los casos que iba a ganar. Sonda ampliada a **19
formas** y afirmación reescrita:

```
familia console.* (9)                    no-console  +globals  +properties  +syntax
 1  console.log('a')                          ✓          ✓          ✓          ✓
 2  console\n  .log('b')                      ✓          ✓          ✓          ✓
 3  console['log']('c')                       ✓          ✓          ✓          ✓
 4  console["er"+"ror"]('d')                  ✓          ✓          ✓          ✓
 5  (console).warn('e')                       ✓          ✓          ✓          ✓
 6  console?.log('f')                         ✓          ✓          ✓          ✓
 7  globalThis.console.log('g')               ✗          ✗          ✓          ✓
 8  const c = console; c.log('h')             ✗          ✓          ✓          ✓
 9  const {log} = console; log('i')           ✗          ✓          ✓          ✓
                                           ─────      ─────      ─────      ─────
                                            6/9        8/9        9/9        9/9

fuera de la familia — CERRADAS en la corrección (5)
10  process.stdout.write('j')                 ✗          ✗          ✗          ✓
11  process.stderr.write('k')                 ✗          ✗          ✗          ✓
12  const o = process.stdout; o.write('l')    ✗          ✗          ✗          ✓
13  const g = globalThis; g.console.log('m')  ✗          ✗          ✗          ✓
14  const {console:k} = globalThis; k.log()   ✗          ✗          ✗          ✓
                                                                             ─────
                                                                              5/5
```

**Afirmación acotada: 9/9 de la familia `console.*`, más 5 cerradas fuera de
ella (14/14 de lo cerrable), y 5 declaradas como límite** — no «9/9» a secas.

`no-console` sola habría dejado pasar 3 de 9 dentro de su propia familia, y las
5 de fuera. Las dos que cerró la corrección no son exóticas: `process.stdout.write`
escribe en la **misma** consola que el gate destierra y es idiomático; y aliasar
`globalThis` es la **misma clase** de evasión que me obligó a añadir
`no-restricted-globals` para `console`, un nivel más arriba — cerré el alias de
`console` y no probé el de `globalThis`.

### Límites conocidos del gate (declarados, no callados)

Ningún lint **estático** puede con estos, y así hay que decirlo:

```
15  eval('console.log(1)')                            ✗ — cadena en tiempo de ejecución
16  new Function('console.log(1)')()                  ✗ — idem
17  Reflect.get(globalThis, 'console').log('o')       ✗ — acceso reflexivo
18  (globalThis as any)['con'+'sole'].log('p')        ✗ — clave computada por concatenación
19  const n='console'; (globalThis as any)[n].log()   ✗ — clave computada por variable
```

Cerrarlos exigiría análisis con tipos o en tiempo de ejecución, no un
`.eslintrc`. Los cinco son **deliberadamente hostiles**: quien escriba
`Reflect.get(globalThis,'console')` en este repo no se está saltando un lint por
descuido. Salida literal de la sonda con la configuración real:

```
$ npx eslint src/__bypass_probe.ts -f compact
L4 L5 L7 L8 L9 L10   (no-console + no-restricted-globals)
L11                  (no-restricted-properties · globalThis.console)
L12 L13              (no-restricted-globals · alias y destructuring de console)
L15 L16 L17          (no-restricted-syntax · process.stdout/stderr, incl. alias)
L18 L19              (no-restricted-syntax · alias y destructuring de globalThis)
   → 14 formas cazadas; L21–L25 (los 5 límites) no aparecen, como está declarado
```

### Salida del gate sobre el árbol

```
$ npx eslint src --ext ts
✖ 179 problems (0 errors, 179 warnings)
$ echo $?
0
```

**0 errores.** Los 179 warnings son 159 de deuda preexistente censada
(`.eslintrc.cjs:12-20`) + 20 nuevos: los 10 sitios del carve-out V66, que
disparan 2 reglas cada uno. **No se silencian con `off`**: quedan en `warn`,
visibles en cada corrida. `npm run lint` sigue en exit 0 → CI verde.

### 3.2 · Sensor secundario: el grep textual, con TODO lo que quedó enumerado

No doy un grep que dé 0 por arte de un patrón astuto. Doy el grep más ancho
posible y **enumero cada superviviente**:

```
$ grep -rnE "console\s*[.[]" src --include=*.ts       →  16 líneas
$ grep -rn  "console"        src --include=*.ts       →  19 líneas
```

Las 19, una por una:

| ruta:línea | qué es | ¿llamada viva del Extension Host? |
| ---------- | ------ | --------------------------------- |
| `src/views/BaseHackerPanelProvider.ts` :61,64,67,145,148,199 | 6 llamadas reales | **SÍ** — carve-out de frontera V66 |
| `src/views/TeatroWebViewProvider.ts` :71,74,77,258 | 4 llamadas reales | **SÍ** — carve-out de frontera V66 |
| `src/core/logging/structuredLog.ts` :4,29,147,272 | comentarios del propio módulo | no |
| `src/extension.ts` :61 | comentario que razona D6 (§8bis) | no |
| `src/socketMonitor.ts` :613,616 | JS **del webview** dentro de una plantilla (`console.log(\`…\`)`) | no — otro proceso |
| `src/core/aiAssistantService.ts` :771 | fragmento de código que el asistente **inserta en el documento del usuario** | no — es producto, no log |
| `src/treeViews/uisTreeView.ts` :38 | `case 'console':` — nombre de un **tipo de UI** | no |

Sube de 18 a 19 respecto de la primera entrega porque la corrección añadió un
comentario que **nombra** el símbolo (el razonamiento de D6). Que un comentario
cuente es justo lo que se busca: el censo textual no distingue, y por eso el
sensor que manda es el AST.

**Qué excluye el gate y por qué:**

- **`tests/`, `scripts/`, `.claude/`, `coverage/`** — el lint del repo solo
  alcanza `src/**/*.ts` por decisión previa documentada en `.eslintrc.cjs:29-33`
  (WP-V16), no por conveniencia mía. No son código embarcado: no viajan en el
  `.vsix` ni corren en la máquina del operador.
- **`media/*.js` (53 apariciones) y el JS de webview embebido en plantillas de
  `src/`** — corren en el **proceso del webview**, no en el Extension Host. Desde
  ahí el `OutputChannel` es inalcanzable: migrarlos exige un puente
  webview→extensión, que es obra de la fila de webviews (V66/V67/V37-39), no de
  V71. Ver §8.

---

## §4 · CA3 · Cero cambio observable — medido antes → después

Todo re-verificado de facto en este worktree; ningún ✅ heredado.

### Suite

| | antes (`main`) | después (`HEAD`) | delta |
| --- | --- | --- | --- |
| Test Suites | 1 failed, 7 passed, **8** | 1 failed, 9 passed, **10** | +2 (los míos) |
| Tests | **117** | **234** | +117 (los míos) |
| passed | 111 | 228 | +117 |
| **failed** | **5** | **5** | **0** |
| skipped | 1 | 1 | 0 |

### Los 5 rojos históricos, por nombre — idénticos

```
● ManagerFactory Integration Tests › Manager Creation › should create process manager
● ManagerFactory Integration Tests › Manager Creation › should create webview manager
● ManagerFactory Integration Tests › Performance › should handle concurrent manager creation
● ManagerFactory Integration Tests › Standard Managers Creation › should create all standard managers
● ManagerFactory Integration Tests › Standard Managers Creation › should have proper dependency chain in standard managers
```

Comprobado por diff de los nombres capturados antes y después:

```
$ diff baseline-red.txt final-red.txt && echo IDENTICOS
IDENTICOS
```

Causa (preexistente, ajena a V71): `vscode.window.onDidCloseTerminal is not a
function` en `tests/mocks/vscode.mock.js` — el doble no implementa ese método.
Es el rojo que V48 tiene encomendado.

### Compilación

```
$ npx tsc -p tsconfig.json --noEmit  |  grep -c "error TS"
8                    ← mismos 8 preexistentes ajenos (los que V80 ya censó)
$ diff baseline-tsc.txt final-tsc.txt
                     ← diff VACÍO, error por error
$ npm run esbuild-base
  dist\extension.js  1.3mb   ✓
```

### Cobertura

`npm test` (con cobertura) fallaba ya en `main` los 4 umbrales globales
(statements 12.6% vs 85% exigido). Sigue fallándolos: es condición preexistente,
no la introduzco ni la arreglo (sería contrabando).

---

## §5 · CA4 · Nada de secretos en el log

### Puntos de log que PODÍAN imprimir credenciales — encontrados y cerrados

| ruta | qué podía filtrar |
| ---- | ----------------- |
| `src/processManager.ts` (`Process launching`) | la **línea de comando** completa: `--token X`, `API_KEY=…` en los args |
| `src/libs/alephscript-client.ts` (`Connected`) | la **URL del mesh**: credenciales inline `user:pass@` o `?token=` |
| `src/core/AracneBotService.ts` (`Connecting`, `Initialized`) | `config.socketUrl`, misma vía |
| `src/core/AracneBotService.ts` (`Received VSCODE_COMMAND request`, `Event received`) | `data` y `args` de **pares del mesh que no controlamos** — la superficie más ancha |
| `src/views/Hacker*PanelProvider.ts` (`Received message from webview`) | payload del webview |
| `src/views/HackerTasksPanelProvider.ts` | tareas de `.vscode/tasks.json` del usuario: líneas de comando |
| `src/treeViews/configsTreeView.ts` | rutas absolutas → filtran el nombre de cuenta del SO |

Se cierran **en el canal**, no en cada sitio de llamada: la redacción es del
emisor, así que un punto de log nuevo la hereda sin acordarse de nada.

`src/core/logging/redact.ts` tapa: claves secretas **por palabras** (a cualquier
profundidad, también en `Map`/array), credenciales inline de URL, query params
sensibles, cabeceras `Bearer`/`Basic`/`Digest`/`Negotiate`, banderas de CLI,
asignaciones de entorno, bloques PEM, y sustituye el home del usuario por `~`.

**Reescrito tras la devolución** (D4/D5, ver §−1). Lo que cambió de fondo:

| antes | ahora |
| ----- | ----- |
| 4 listas paralelas que no coincidían (`?auth=` se tapaba, `--auth` no) | **un** vocabulario del que derivan claves, banderas, entorno y query |
| comparación por **subcadena** → había que sacrificar `auth` para salvar `author` | comparación por **palabras** → `auth` entra y `author` no se toca |
| `tokenEnv` cegado (falso positivo sobre un campo real) | sufijos de referencia (`env`, `name`, `var`…): `tokenEnv` conserva su valor |
| solo inglés; `contraseña` fugaba y `secreto` se salvaba de casualidad | castellano explícito: `clave`, `contraseña`, `credenciales`, `pwd`, `pin`, `firma` |
| solo `Bearer` | `Basic` incluido — viaja con `usuario:contraseña` en base64 |
| `ENV=` solo en MAYÚSCULAS | `/i` + delimitación por `_`: `token=x` se tapa, `SPINNER=x` no |

Matriz hostil verificada (tests permanentes): **37 claves secretas** detectadas,
**20 claves limpias** intactas (`author`, `authorship`, `tokenEnv`, `settingKey`,
`pingInterval`, `spinner`, `passengers`, `monkey`, `turnkey`…), **18 cadenas
hostiles** tapadas, **6 cadenas limpias** sin tocar (`--port 3000`,
`NODE_ENV=production`, `docker run -p 8080:80`…). Cero falsos positivos.

### Límites del redactor — declarados **y fijados por test**

Ningún redactor **por nombre** puede con estos. Están en la cabecera de
`redact.ts` y además hay un `describe('LÍMITES CONOCIDOS')` que los **fija**: si
alguien los cierra, el test falla y obliga a actualizar la documentación. Un
límite callado es un hueco; uno fijado por test es una decisión.

| | caso | por qué no se cierra |
| - | ---- | -------------------- |
| **L1** | secreto en el PATH de una URL | nada en el nombre lo anuncia |
| **L2** | blob base64/hex suelto | indistinguible de un hash, un id o contenido legítimo; taparlo por su forma cegaría más de lo que protege |
| **L3** | secreto usado como **clave** (`{ 'ghp_…': 'activo' }`) | se redacta el valor, no el nombre del campo |
| **L4** | `-p valor` | en medio ecosistema `-p` es «port» (`docker run -p 8080:80`); taparlo sería una fábrica de falsos positivos. **El comentario que prometía cubrirlo estaba mal y se corrigió** (D3) |
| **L5** | secreto en prosa sin etiqueta | «la clave es hunter2» se tapa; «hunter2» a secas, no |

La probe planta 4 secretos reales por caminos distintos y verifica que ninguno
sale (§6).

---

## §6 · CA2 · Depurable en máquina ajena — **salida real**, no un ejemplo

Reproducible: `node scripts/probes/v71-canal-estructurado.mjs` (exit 0 si PASS).
La probe **bundlea el código vivo** con esbuild sustituyendo únicamente `vscode`
por un doble mínimo, y ejercita `ProcessManager` **por su API pública**: las
líneas de abajo las emite el módulo real, no el guion.

```
========================================================================
Aleph-0 · diagnóstico · sesión 7a07d33e
  iniciada    2026-07-31T23:18:14.078Z
  extensión   scriptorium.aleph-0 0.2.0 (simulada en probe)
  vs code     1.95.0 (simulada en probe)
  plataforma  win32 x64 · node 22.21.1
  nivel       INFO
  las credenciales van redactadas como «redactado» (WP-V71)
========================================================================
[2026-07-31T23:18:14.082Z] [INFO ] [extension] [s=7a07d33e #1] AlephScript Extension is activating...
[2026-07-31T23:18:14.087Z] [INFO ] [ProcessManager] [s=7a07d33e #2 op=start-1] Process launching | {"name":"launcher","workingDir":"/home/ada/proyectos/zigurat","command":"node launcher.js --api-key «redactado» --port 3000","port":3000}
[2026-07-31T23:18:14.090Z] [INFO ] [ProcessManager] [s=7a07d33e #3 op=start-1] Process started in terminal | {"name":"launcher"}
[2026-07-31T23:18:14.090Z] [INFO ] [ProcessManager] [s=7a07d33e #4 op=start-2] Process is already running | {"name":"launcher"}
[2026-07-31T23:18:15.092Z] [INFO ] [ProcessManager] [s=7a07d33e #5 op=stop-3] Terminal for process disposed | {"name":"launcher"}
[2026-07-31T23:18:15.092Z] [INFO ] [ProcessManager] [s=7a07d33e #6 op=stop-3] Process stopped successfully | {"name":"launcher"}
[2026-07-31T23:18:15.092Z] [INFO ] [ProcessManager] [s=7a07d33e #7 op=stop-4] Process not found | {"name":"no-existe"}
[2026-07-31T23:18:15.093Z] [ERROR] [ManagerFactory] [s=7a07d33e #8] Error disposing manager | {"managerId":"webView","error":{"name":"Error","message":"ECONNREFUSED 127.0.0.1:3000","stack":"Error: ECONNREFUSED 127.0.0.1:3000\n    at conducir (C:\\S_LAB\\wt\\v-v71\\out\\probe\\v71-canal.cjs:1397:17)\n    at async file:///C:/S_LAB/wt/v-v71/scripts/probes/v71-canal-estructurado.mjs:59:5"}}
[2026-07-31T23:18:15.093Z] [INFO ] [AracneBot] [s=7a07d33e #9] Received VSCODE_COMMAND request | {"data":{"command":"aleph0.abrirPanel","authorization":"«redactado»","author":"ada@lovelace.dev"}}
[2026-07-31T23:18:15.093Z] [INFO ] [AlephScriptClient] [s=7a07d33e #10] Connected | {"client":"vscode-extension","url":"https://«redactado»@mesh.local:3000/runtime?token=«redactado»","socketId":"k3Jd9"}
[2026-07-31T23:18:15.093Z] [WARN ] [AracneBot] [s=7a07d33e #11] ⏳ aleph0.mesh.baseUrl (o host+port) no configurado — sin cliente Socket.IO
```

**Qué de esto sirve para diagnosticar sin acceso al equipo:**

- **cabecera** — versión de la extensión, de VS Code y plataforma: sin esto, un
  log pegado en un issue no dice ni sobre qué corría;
- **marca de tiempo ISO-8601 en UTC** — deliberadamente **no**
  `toLocaleTimeString()` (que es lo que hace `src/loggingManager.ts:181`): la
  hora local del emisor es ilegible desde otro huso;
- **nivel de ancho fijo** — `grep '\[ERROR\]'` casa siempre;
- **origen** — `[ProcessManager]`, `[AracneBot]`… qué módulo habló;
- **correlación**: `s=7a07d33e` agrupa las líneas de un mismo arranque cuando el
  usuario pega solo un fragmento; `#1..#11` es monótona y **delata líneas
  perdidas o reordenadas**; `op=start-1` / `op=stop-3` hilvanan las líneas de
  una misma operación — se ve que `#5` y `#6` son el mismo `stop`, y que
  `#2/#3` y `#4` son **dos arranques distintos** aunque hablen del mismo proceso.
  **Alcance acotado tras la devolución**: `op=` correlaciona **dentro de un
  módulo**. Cada `forOperation()` acuña un id nuevo, no hay propagación: dos
  módulos del mismo flujo obtienen operaciones distintas y un hijo no hereda del
  padre. Mi primera redacción decía «multi-módulo» y la API no lo sostiene — ni
  esta probe lo demostraba, porque todas sus líneas correlacionadas salen de
  `ProcessManager`. Hay test que **fija** el límite; correlacionar entre módulos
  exige propagar el id por la cadena de llamadas y es diseño de otro WP;
- **la pila del error** llega entera: `JSON.stringify(new Error('x'))` devuelve
  `{}`, que es inútil; por eso el serializador trata `Error` aparte;
- **los secretos, tapados**: `--api-key «redactado»`,
  `https://«redactado»@mesh.local:3000/runtime?token=«redactado»`,
  `authorization: «redactado»` — y `author: ada@lovelace.dev` **sobrevive**,
  porque tapar de más también ciega.

Las 24 aserciones de la probe pasan, incluida **«cero escrituras por `console`
durante la corrida»** (vigila los tres métodos mientras corre el código vivo).

---

## §7 · Dependencias pendientes — lo que habría necesitado `package.json`

No edité `package.json` (otro worker es su único escritor esta ola). Dos cosas
lo habrían necesitado; van con la **línea exacta**:

**1 · Comando para abrir el canal.** Hoy el operador llega por «Output → Aleph-0».
La función ya existe (`showDiagnosticChannel()` en `src/core/logging/index.ts`),
solo le falta la puerta. En `contributes.commands`:

```json
{ "command": "aleph0.mostrarDiagnostico", "title": "Mostrar diagnóstico", "category": "Aleph-0" }
```

**2 · Nivel de log configurable.** `structuredLog.ts` ya **lee**
`aleph0.log.level` y cae a INFO si no existe. Para que sea ajustable de verdad,
en `contributes.configuration.properties`:

```json
"aleph0.log.level": {
  "type": "string",
  "enum": ["error", "warn", "info", "debug", "trace"],
  "default": "info",
  "description": "Nivel del canal de diagnóstico Aleph-0."
}
```

Ninguna de las dos bloquea los CA de este WP; sin ellas el canal funciona y se
lee. **Ojo de frontera:** ambas claves entran en el terreno de **V23**
(claves→ontología) — el nombre `aleph0.log.level` es propuesta mía, no acuerdo.

---

## §8 · Lo que NO hice (y por qué)

1. **Los 10 `console.*` de `BaseHackerPanelProvider.ts` y `TeatroWebViewProvider.ts`.**
   Obra viva de V66. Migración exacta, ya redactada, para quien cierre esa fila:
   añadir `import { LogCategory } from '../loggingManager';` +
   `import { getLogger } from '../core/logging';` +
   `const log = getLogger('BaseHackerPanel', LogCategory.WEBVIEW);` y sustituir
   `console.log(x)` → `log.info(x)`. Medí el solape: los hunks de V66 en esos dos
   ficheros **no tocan ninguna de las 10 líneas**; el único conflicto sería el
   bloque de imports. **Al cerrarlos hay que borrar el bloque `overrides` de
   `.eslintrc.cjs`** — está dicho en el propio fichero.
2. **El JS de webview (`media/*.js`, 53 sitios; plantillas embebidas, 2 sitios).**
   Otro proceso; el `OutputChannel` no le llega. Exige un puente
   webview→extensión: candidato a WP de la fila de webviews.
3. **No unifiqué con `src/loggingManager.ts`.** Conviven dos sistemas de log: el
   nuevo canal `Aleph-0` (destino de los ex-`console.*`) y los 9 canales
   `AlephScript - *` del `LoggingManager` (que usan `webViewManager`,
   `configurationService`, `terminalManager`…). Unificarlos es un WP en sí mismo
   y habría sido contrabando aquí. **Es el hallazgo más gordo** (§9.1).
4. **No re-nivelé nada** (§0/D3) ni toqué `src/config`, `package.json`, ni las
   webviews de V66.
5. **No verifiqué en un Extension Host real.** La probe corre el código vivo con
   un doble de `vscode`; el canal en un VS Code de verdad queda
   **⏳ sin verificar** — lo cubre el arnés de V68 en CI.
6. **No propagué la correlación entre módulos** (ver §6): `forOperation` aísla
   una operación dentro de un módulo y nada más. Hacerlo cruzar módulos exige
   propagar el id por la cadena de llamadas o un contexto asíncrono; es diseño
   de otro WP.

---

## §8bis · D6 · El canal **no** se cierra en `deactivate` — decisión, no olvido

La primera versión hacía `disposeStructuredLog()` en un `finally` de
`deactivate`. **Se retira.** El razonamiento, que también queda escrito en
`src/extension.ts` para que no haya que venir aquí a buscarlo:

- **Contra cerrarlo (decisivo).** Cerrar el canal lo retira del desplegable de
  «Output» **con todo su contenido**. En un «Reload Window» —o justo después de
  un fallo de desactivación— el operador pierde el log en el instante exacto en
  que iba a copiarlo a un issue. Ese log es el entregable central de este WP
  (CA2). El `console.log` que sustituimos **sobrevivía** en el log del Extension
  Host: degradar eso sería un retroceso disfrazado de higiene.
- **A favor de cerrarlo: nada que sostenga el peso.** Un `OutputChannel` no es
  un proceso, ni un puerto, ni un descriptor de fichero — es un panel de texto
  que VS Code destruye solo al terminar el host, que es justo lo que viene
  después de `deactivate`. Cerrarlo a mano solo **adelanta la pérdida** sin
  liberar nada.
- **El criterio «sale limpio»** (`plan/VISION.md` §4.5) habla de *procesos,
  ficheros fuera de ámbito y ajustes huérfanos*. Un panel de salida no es
  ninguno de los tres.
- **Consecuencia coherente:** tampoco se registra en `context.subscriptions` —
  eso lo cerraría por la puerta de atrás. `disposeStructuredLog()` sigue
  exportado para los tests y para el futuro comando de limpieza (§7).

**⏳ sin verificar en host real**: que el canal sobreviva a un «Reload Window»
con su contenido es la conducta que espero de la API, no algo que haya medido en
un VS Code de verdad. Lo cubre el arnés de V68.

---

## §9 · Hallazgos fuera de alcance (NO se arreglaron aquí)

1. **Dos sistemas de log conviviendo.** `src/loggingManager.ts` formatea con
   `toLocaleTimeString()` (`:181`) — hora local, sin zona: **el mismo defecto
   que V71 corrige en el canal nuevo**. Además filtra por categoría y **descarta
   entradas en silencio** (`:144`) cuando una categoría está deshabilitada, sin
   dejar rastro de que las descartó. Candidato a WP: unificar bajo el canal nuevo.
2. **Los 9 canales `AlephScript - *`** siguen anunciando el scope viejo, contra
   la invariante I-4 (identidad nueva). Es renombrado de superficie: V23/V86.
3. **`src/core/AracneBotService.ts:225`** busca la extensión por el id antiguo
   `escrivivir-co.scriptorium-vscode-extension`; el id real es
   `scriptorium.aleph-0` (`package.json:2,6`). Siempre devuelve `'unknown'` al
   mesh. Es falsedad de interfaz, pero no es un `console.*`: no lo toqué.
4. **Umbrales de cobertura de `jest.config.js`** (85/80/75) son ficción contra un
   12,6% real: `npm test` falla siempre por eso. O se bajan a la realidad o se
   suben cubriendo. Candidato para V48/V68.

---

## §10 · Auto-revisión

- [x] **Diff solo dentro del alcance**: `src/core/logging/` (nuevo),
      11 ficheros migrados, `.eslintrc.cjs` (el gate), `tests/unit/core/logging/`,
      `scripts/probes/v71-*`, este reporte. **Desvío D1 aprobado (§0).**
- [x] **Cero ficheros copiados de otros mundos**: nada importado de fuera.
- [x] **Rutas citadas existentes**: todas verificadas en este árbol; la única
      que había derivado (`AracneBotService.ts`) se corrigió a `:225`.
- [x] **Eje estructural evidenciado**: «cero cambio observable» **probado**
      (§4), no afirmado — suite, rojos por nombre, diff de tsc, esbuild. Y la
      regla 1:1 que lo sostiene, **medida** con el comparador de §−1, no
      inspeccionada.
- [x] **Gate de dedup**: no se duplica `LogLevel`/`LogCategory`; se reutilizan.
- [x] **Gates ejecutados de verdad**: lint, sonda de evasión (19 formas),
      117 tests del módulo, probe, tsc, esbuild — todas las salidas pegadas son
      literales.
- [x] **Commits convencionales**: 12, todos `wp(V71): …`.
- [x] **Afirmaciones acotadas a lo que la evidencia sostiene**: el «9/9» del
      gate y el «multi-módulo» de `forOperation` se estrecharon tras la
      devolución; ambos límites están **fijados por test**.
- [ ] **Verificación en host real**: ⏳ sin verificar (arnés V68). Incluye D6
      (que el canal sobreviva al «Reload Window»).

## §11 · Evidencia de riesgo y contrarrevisión

- `CASOS_ADVERSARIALES`:
  - `[automatizado]` **19 formas de evasión del gate** → 14/14 de lo cerrable
    cazadas; 5 declaradas como límite de cualquier lint estático (§3.1).
  - `[automatizado]` **matriz hostil del redactor**: 37 claves secretas,
    20 limpias, 18 cadenas hostiles, 6 limpias → cero fugas, cero falsos
    positivos. 5 límites **fijados por test** (§5).
  - `[automatizado]` **canal roto** (`appendLine` lanza) → el logger no propaga
    y **no** cae a `console` (espías sobre los 3 métodos).
  - `[automatizado]` **sin API de `OutputChannel`** → no lanza; el anillo retiene.
  - `[automatizado]` **valor hostil** (getter que lanza, ciclo, `Error` anidado,
    mensaje no-string) → nunca lanza, siempre una sola línea.
  - `[automatizado]` **4 secretos plantados** en línea de comando, URL, cabecera
    y dato → ninguno llega al canal; `author` sí (no cegar).
  - `[automatizado]` **paridad de nivel 1:1** sobre los 95 sitios, cotejada en
    orden contra `main` (§−1) → 0 desvíos.
  - `[manual]` **solape con V66** inspeccionado hunk a hunk: ninguna de las 10
    líneas del carve-out cae dentro de un hunk de V66.
- `DEPENDENCIAS_DIRECTAS_VERIFICADAS`: el módulo nuevo usa **solo** `vscode` y
  built-ins de Node (`process`). Cero dependencias nuevas; `package.json` y
  `package-lock.json` **intactos** (`npm ci`, no `npm install`).
- `INSTALACION_LIMPIA`: `no aplica` — este WP no toca empaquetado. `npm ci` en
  worktree limpio + `npm run esbuild-base` verde.
- `TEST_AUTOMATIZADO_VS_EVIDENCIA_MANUAL`:
  - Automatizado: 117 tests jest nuevos · probe de 24 aserciones · sonda de
    evasión de 19 casos · comparador de niveles · diffs de tsc y de rojos.
  - Manual: lectura de los hunks de `wp/v66-csp`; enumeración de las 18
    apariciones textuales de `console` supervivientes; verificación de primera
    mano del censo de `author`/`tokenEnv` que desmontó mi propia justificación.
- `VEREDICTO_REVISOR`: 1ª contrarrevisión **DEVUELTO** (6 puntos, todos
  cerrados en §−1) · 2ª `⏳ pendiente`, acotada a D1, D2, `auth`/`tokenEnv`, el
  castellano y las dos formas del gate.

## §12 · Dudas / bloqueos para el orquestador

1. ~~**§0/D1 exige decisión**~~ — **resuelto**: el orquestador aprobó el desvío
   tras verificar que la intersección con el carril de webviews es vacía.
2. **Los nombres `aleph0.log.level` y `aleph0.mostrarDiagnostico`** (§7) pisan el
   terreno de V23 (claves→ontología). Son propuesta, no acuerdo.
3. **CA1 no da un 0 absoluto**: da 0 errores del gate AST con un carve-out de
   frontera de 10 sitios, declarado y visible como warning. Si el orquestador
   quiere el 0 absoluto, hay que autorizar tocar los 2 ficheros de V66.
4. **Seguimiento propuesto (§−1)**: subir a `warn` los tres «comando desconocido
   desde webview». Lo pide el criterio; lo bloquea, hoy, la demostrabilidad de
   la regla 1:1. Va como WP aparte, no de tapadillo aquí.

---

## Revisión del orquestador

_(la rellena el orquestador)_
