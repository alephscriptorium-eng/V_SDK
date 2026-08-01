# WP-V97 · P0 — publicar una versión no ejecutaba ni un test

| dato | valor |
| ---- | ----- |
| Carril | **V** · Aleph-0 (ℵ₀) |
| Encargo | `plan/BACKLOG.md:111` |
| Rama | `wp/v97-publicar-con-red` · base `a647ecd` |
| Obra | `bf957ee` |
| Árbol de medida | `C:/S_LAB/wt/v-v97` · Windows 11 · 12 CPU |
| Herramienta | node v22.21.1 · npm 10.9.4 · jest 29.7.0 · `gh` autenticado |
| Repo remoto | `alephscriptorium-eng/V_SDK` |
| Fecha de todas las medidas | **2026-08-01 / 2026-08-02** |

---

## 0 · Qué es de fiar aquí y qué no

**MEDIDO** = se ejecutó y la salida está pegada. **LECTURA** = afirmación sobre un
fichero que abrí, no una ejecución. **REMOTO** = viene de `gh` contra GitHub, no de
esta máquina. **CITA** = viene de otro reporte y no lo he vuelto a medir.

Cuatro acotaciones que valen para el documento entero:

1. **No he provocado una publicación real.** No empujo (regla 5 del encargo) y una
   etiqueta crearía un release de verdad. Lo que hay son: los **comandos exactos** del
   flujo corridos en local, los **mismos textos** corridos en el runner vía `ci.yml`, y
   el historial remoto leído con `gh`. Lo que eso deja sin demostrar está en §7.1.
2. **Esta máquina está bajo carga variable** (hay más worktrees vivos). Los tiempos
   locales sirven para ordenar magnitudes, no para presupuestar CI. **Todos los costes
   de §5 salen de runs reales de GitHub**, no de aquí.
3. **`ci.yml` no lo toco.** La vía elegida no exige dispararlo con etiquetas, así que
   queda fuera del diff. El porqué, en §4.4.
4. El aparato de vigilancia (`rojos-jest.mjs`, `cobertura-trinquete.mjs`,
   `cobertura.suelo.json`) **está cerrado y no lo he tocado**: se usa, tal cual.

---

## 1 · El estado real, verificado abriendo los ficheros

### 1.1 Los dos datos del encargo: los dos ciertos

| afirmación del encargo | comprobación | veredicto |
| ---------------------- | ------------ | --------- |
| `ci.yml:3-7` dispara en ramas y PR, **nunca en etiquetas** | LECTURA: `on: push: branches: [main, 'wp/**']` · `pull_request: branches: [main]`. Cero `tags:` | **cierto** |
| `release.yml` va `npm ci` → compilar → empaquetar → publicar, **sin lint, sin tests, sin probes** | LECTURA del fichero base: sus únicos pasos de trabajo eran `Install` (`npm ci`), `Compile production`, `Package v1 .vsix` y `Create GitHub Release` | **cierto** |

### 1.2 Y la consecuencia, que no es lectura sino medida

El encargo deduce que «un `push` de etiqueta ejecuta **sólo** `release.yml`». No hace
falta deducirlo: está en el remoto.

**REMOTO** — todos los runs asociados al sha del único release del repo:

```
$ gh run list --commit f11ffda8aebee7b148944395f53185a60ba72f5d
  Release · event=push · headBranch=v0.1.0              · success · 30158829091
  ci      · event=push · headBranch=wp/v10-v1-release   · success · 30158827844
```

Dos runs, dos eventos distintos: el `ci` lo disparó el push de la **rama**
(`wp/v10-v1-release`), no la etiqueta. **El push de la etiqueta produjo exactamente un
run: `Release`.** El encargo tiene razón, y ahora es dato.

### 1.3 El instrumento nuevo lo dice mecánicamente

Antes de escribir una línea de flujo, la guarda de paridad de §3.2 sobre el
`release.yml` **de base** — **MEDIDO**, salida recortada:

```
PARIDAD ROTA · 8 comando(s) que .github/workflows/ci.yml ejecuta y release.yml NO:
  · ci.yml:57  «Lint (eslint · src)»                          npm run lint
  · ci.yml:65  «Probe V08 (parser real)»                      npm run probe:v08
  · ci.yml:92  «Gate · conjunto de rojos por nombre (BLOQUEA)» node scripts/rojos-jest.mjs --gate
  · ci.yml:101 «Suite instrumentada … (BLOQUEA)»              npm test
  · ci.yml:112 «Trinquete de cobertura … (BLOQUEA)»           node scripts/cobertura-trinquete.mjs
  · ci.yml:123 «Guarda · ningún paso blando en este flujo»    (bloque grep)
  · ci.yml:193 «Arnés Extension Host — modo fuente»           xvfb-run -a npm run test:exthost
  · ci.yml:196 «Arnés Extension Host — modo .vsix empaquetado» xvfb-run -a npm run test:exthost:vsix
```

**Ocho.** Los tres pasos que sí compartían (`npm ci`, `compile:production`,
`package:v1`) no verifican nada del producto: instalan, compilan y empaquetan.

---

## 2 · Las publicaciones anteriores, leídas con `gh`

**REMOTO.** Hay **un** release y **un** run de `release.yml` en toda la historia del
repo:

```
$ gh release list
Zigurat v0.1.0   Latest   v0.1.0   2026-07-25T12:57:45Z

$ gh run list --workflow=release.yml
success · 30158829091 · push · tag v0.1.0 · sha f11ffda8 · 2026-07-25T12:57:06Z
```

### 2.1 El dato que convierte el WP en P0

Cronología del sha `f11ffda8`, minuto a minuto (**REMOTO**, `gh run view` +
`gh api …/check-runs`):

| hora (UTC) | qué pasó |
| ---------- | -------- |
| `12:57:06` | arranca el run de `Release` (push de la etiqueta) |
| `12:57:06` | arranca el `build` de `ci` (push de la rama, otro evento) |
| `12:57:37` | `Release`: acaba `npm ci` |
| `12:57:41` | `Release`: acaba `Package v1 .vsix` |
| **`12:57:45`** | **`Release`: el `.vsix` queda publicado y descargable** |
| `12:57:47` | `Release`: job completo |
| **`12:58:02`** | **`ci`: `build` concluye — el primer veredicto sobre esa revisión** |

> **El artefacto estuvo descargable 17 segundos antes de que existiera veredicto sobre
> él.** Salió verde por suerte: nada en el flujo lo condicionaba, y las dos corridas
> eran carreras independientes que empezaron el mismo segundo.

Es el enunciado del mundo hecho reloj: *un gate que corre después de publicar no es un
gate*. Aquí ni siquiera corría después — corría **al lado**.

### 2.2 Lo que la muestra NO sostiene

`n = 1`. **No** puedo afirmar «históricamente se publica desde refs sin verificar»: la
única etiqueta de este repo apuntaba a un sha que **sí** fue punta de rama y **sí** tuvo
un `ci` verde (tarde, pero verde). Lo que la muestra sostiene es más estrecho y basta:
**nada en el flujo lo garantizaba**, y el orden de los relojes lo demuestra.

---

## 3 · La obra

### 3.1 `release.yml`: la cadena entera, antes de publicar

21 pasos. Los de verificación son **el mismo comando y el mismo texto** que `ci.yml`
—esa identidad literal es lo que la guarda de paridad comprueba— y todos van **antes**
de empaquetar (20) y de publicar (21):

```
 1. Guarda · dispatch manual solo desde main          ← WP-V16, sin tocar
 2. checkout / 3. setup-node
 4. Resolve release tag / 5. Resolve .vsix name
 6. Guarda · el tag no puede tener release publicado  ← WP-V16, sin tocar
 7. Guarda · la publicación verifica lo mismo que ci.yml   ← NUEVO (node puro, 0,2 s)
 8. Detect registry credentials / 9. Configure registry basic-auth
10. Install                                    npm ci
11. Lint (eslint · src)                        npm run lint                        ← NUEVO
12. Compile production                         npm run compile:production
13. Probe V08 (parser real)                    npm run probe:v08                   ← NUEVO
14. Gate · conjunto de rojos por nombre        node scripts/rojos-jest.mjs --gate  ← NUEVO
15. Suite instrumentada                        npm test                            ← NUEVO
16. Trinquete de cobertura                     node scripts/cobertura-trinquete.mjs ← NUEVO
17. Guarda · ningún paso blando en este flujo  (grep sobre .github/workflows/)     ← NUEVO
18. Arnés Extension Host — modo fuente         xvfb-run -a npm run test:exthost    ← NUEVO
19. Arnés Extension Host — modo .vsix          xvfb-run -a npm run test:exthost:vsix ← NUEVO
20. Package v1 .vsix                           npm run package:v1
21. Create GitHub Release with .vsix           softprops/action-gh-release@v2
```

Tres decisiones de orden, razonadas:

- **La guarda de paridad (7) va antes de `npm ci`**: es node puro, sin dependencias, y
  aborta en 0,2 s sin gastar el runner. Mismo criterio que las dos guardas de WP-V16.
- **El arnés (18-19) va antes del empaquetado final (20)**: `test:exthost` recompila con
  sourcemaps y `test:exthost:vsix` empaqueta por su cuenta; `package:v1` vuelve a compilar
  en modo producción después, así que **el asset que se sube es el minificado**. Al revés,
  se publicaría un bundle con sourcemaps.
- **El arnés entra aunque en `ci.yml` viva en un job aparte**: es lo único que comprueba
  que **el artefacto que se va a distribuir** arranca en un VS Code real y se instala. En
  un flujo de publicación es el control más pertinente que existe. El precio de meterlo
  en el mismo job (serie en vez de paralelo) está en §5.

**Cero marcas blandas nuevas.** Ni un `continue-on-error` en el fichero, y además el paso
17 lo comprueba: su `grep` barre `.github/workflows/` entero, así que desde hoy una marca
blanda en **cualquier** flujo también tumba la publicación. **MEDIDO** sobre el árbol
real: `cero pasos con continue-on-error funcional en .github/workflows/`, rc 0.

### 3.2 `scripts/verificacion-paridad.mjs`: para que la copia no se pudra

Los pasos 11-19 son una **copia** de `ci.yml`, y una copia se pudre: `ci.yml` gana un
control en la ola 8, `release.yml` no se entera, y se vuelve a publicar por debajo de lo
que el mundo cree que vigila — en silencio, con los dos ficheros «verdes». Un comentario
que dijera «mantener en sync» sería exactamente la clase de declaración que este mundo
lleva siete olas pagando.

Comprueba **dos** cosas, y falla cerrado en las dos:

1. **Cobertura**: todo comando `run:` de `ci.yml` (de cualquiera de sus dos jobs) tiene
   que aparecer, con el mismo texto normalizado, en `release.yml`.
2. **Orden**: cada uno de ellos, **antes** del primer paso que publica. Sin esto, alguien
   satisface (1) pegando la cadena detrás del release y el fichero pasa por bueno.

Las **exclusiones son dato firmado dentro del script** y se imprimen en cada corrida. Hoy
hay **una** regla (`/has_npm=/`, la detección de credenciales del registro: no verifica el
producto y su `::notice::` dice cosas distintas en cada flujo a propósito), que casa con
dos pasos de `ci.yml`. Todo lo demás se exige.

Si no reconoce el flujo —no encuentra paso de publicación, no extrae ni un comando— sale
con código 2. **Nunca verde por no haber sabido leer.** Sus límites están escritos en su
cabecera y resumidos en §7.

---

## 4 · La decisión: reejecutar, y el precio de lo descartado

### 4.1 Las dos familias, con su coste medido

| | **A · reejecutar la verificación al publicar** *(elegida)* | **B · exigir que la revisión etiquetada ya tenga un run verde)** |
| - | - | - |
| coste por publicación | **+85 s** (§5) | **0,8–1,1 s** — MEDIDO, 3 consultas `gh api …/check-runs` |
| qué verifica | el árbol que se está empaquetando, en el mismo job | que existe un **registro** verde para ese sha |
| modos de fallo | ninguno nuevo: o pasa o no pasa | tres (§4.3) |
| ahorro acumulado a día de hoy | — | **84 segundos**, repartidos en **una** publicación en toda la historia del repo |

### 4.2 Por qué A

El argumento del encargo a favor de B es bueno y hay que decirlo entero: **B verifica
*ese* ref y no una corrida nueva**, que es más honesto que fiarse de que la corrida nueva
reproduzca. Y es ~85 veces más barato.

Lo que decide en contra es que **el ahorro se cobra una vez cada varios meses y los modos
de fallo se pagan todos los días**. Un release en toda la historia del repo; 85 segundos.
A cambio, A no necesita saber nada de la API de GitHub, no tiene ventanas de carrera, no
tiene timeout, no depende de la cola del runner, y **empaqueta exactamente lo que acaba de
verificar**, con el mismo `node_modules`, en el mismo job.

### 4.3 Los tres modos de fallo de B, con la evidencia de cada uno

1. **La carrera — y no es hipotética, es la única publicación real que existe.** El
   `.vsix` de `v0.1.0` se publicó a las `12:57:45` y el `ci` de ese mismo sha concluyó a
   las `12:58:02` (§2.1). Un gate B habría consultado a las `12:57:4x` y habría visto un
   run **en curso**, no verde. Sus dos salidas son malas: **fallar** paraliza el flujo
   natural de este mundo —empujar la rama y la etiqueta a la vez—, y **esperar** convierte
   el veredicto en función de la cola del runner, con un timeout que al vencer tiene que
   fallar igual.

2. **La etiqueta sobre una revisión que el remoto no conoce.** El encargo pedía
   contemplarlo; está **MEDIDO**:

   ```
   $ gh api repos/alephscriptorium-eng/V_SDK/commits/<sha-local>/check-runs
   {"message":"No commit found for SHA: bf957ee5…","status":"422"}
   ```

   Un `git tag v1.2.3 <sha>` sobre una revisión que nunca fue rama ni PR deja a B sin nada
   que exigir, para siempre. B tendría que elegir entre bloquear ese caso siempre —y
   entonces hay que montar A de todos modos como salida— o abrir un bypass. **Un bypass es
   una marca blanda con otro nombre**, y este mundo acaba de dejarlas a cero.

3. **B comprueba un registro, no un árbol.** Entre la consulta y el `vsce package` hay un
   `npm ci` y un `compile:production` que B no ha visto. A empaqueta lo que verificó.

Consideré también el **híbrido** (preguntar por el verde y reejecutar sólo si no existe):
lo descarté porque obliga a mantener **las dos** vías —la barata sigue teniendo los modos
1 y 3— para ahorrar 85 segundos en un evento que ha ocurrido una vez.

### 4.4 Y por qué NO toco `ci.yml`

Mi ALCANCE permite tocarlo **sólo** si la vía exige dispararlo con etiquetas. A no lo
exige: la verificación corre dentro de `release.yml`. Añadir `tags: ['v*']` a `ci.yml`
sería una **tercera** familia —«que la etiqueta dispare el CI y que el release espere»—
que reejecuta igual (mismo coste) y además necesita un bucle de sondeo entre workflows,
que es el modo de fallo 1 otra vez. Se queda fuera, dicho y razonado.

**Consecuencia declarada**: un push de etiqueta sigue ejecutando **un solo flujo**. La
diferencia es que ese flujo ahora verifica.

---

## 5 · El coste en minutos, medido

### 5.1 Lo que tardaba publicar

**REMOTO**, run `30158829091` (único release, 2026-07-25):

| | segundos |
| - | -------- |
| job `release` | **38 s** |
| run completo (con encolado) | **42 s** |

Desglose: setup 2 · checkout 1 · setup-node 6 · `npm ci` **19** · `compile:production` 1 ·
`package:v1` 3 · resolve tag 0 · crear release 4.

⚠️ **Acotación honesta**: ese run es **anterior a WP-V16**. Su lista de pasos (LECTURA de
`gh run view`) no incluye `Resolve .vsix name` ni las dos guardas del tag, que sí están en
el fichero de base. Esas tres son baratas (`gh release view` ≈ 1 s), así que la línea de
partida real es **~40 s**, no 38.

### 5.2 Lo que añade la red

**REMOTO**, tiempos por paso del run verde `30719606823` (`main` @ `c9025c5`,
2026-08-01) — el mismo runner `ubuntu-latest` y los mismos comandos:

| paso añadido a `release.yml` | de dónde sale la medida | segundos |
| ---------------------------- | ----------------------- | -------- |
| Guarda de paridad | MEDIDO local, node puro (207–337 ms) | **~0** |
| `npm run lint` | `ci.yml` job `build` | **3** |
| `npm run probe:v08` | `ci.yml` job `build` | **1** |
| gate de rojos por nombre | `ci.yml` job `build` | **22** |
| suite instrumentada (`npm test`) | `ci.yml` job `build` | **33** |
| trinquete de cobertura | `ci.yml` job `build` | **0** |
| guarda anti-marcas-blandas | `ci.yml` job `build` | **0** |
| arnés exthost — fuente | `ci.yml` job `exthost` | **17** |
| arnés exthost — `.vsix` | `ci.yml` job `exthost` | **9** |
| | **total añadido** | **85 s** |

`compile:production` y `package:v1` ya estaban en `release.yml`: no se cuentan dos veces.
Los dos pasos del arnés no arrastran un segundo `npm ci` porque corren en el **mismo** job.

### 5.3 El número

> **Publicar pasa de ~40 s a ~2 min 5 s.** Multiplicador ×3,1. **PROYECCIÓN**, no medida:
> suma de tiempos por paso de runs reales del mismo runner. La primera etiqueta que se
> empuje dará el número de verdad.

Por qué el multiplicador no asusta: el `ci.yml` completo tarda **103 s** de reloj de pared
(dos jobs en paralelo: `build` 97 s, `exthost` 57 s). El release queda en ~125 s porque los
mete **en serie** en un job. Los ~20 s de diferencia son el precio de no duplicar `npm ci`
en un job paralelo, y a cambio el arnés prueba **el mismo árbol** que se va a empaquetar.

**Dónde está el umbral de esta decisión**: si la suite creciera hasta hacer que publicar
pase de ~10 minutos, la vía B vuelve a la mesa, porque a partir de ahí la gente esquiva el
flujo a mano y volveríamos aquí por otra puerta. Hoy, con 2 minutos, no.

### 5.4 Los mismos comandos en local (contexto, no presupuesto)

**MEDIDO** en `C:/S_LAB/wt/v-v97`, Windows, máquina con otros worktrees vivos:
lint 16 s · compile 5 s · probe 6 s · gate **157 s** · suite **152 s** · trinquete 0 s ·
exthost fuente 67 s · exthost vsix 28 s. Sirven para ordenar magnitudes; el runner es
entre 4× y 7× más rápido en las corridas de jest. **Los costes de §5.2 no salen de aquí.**

---

## 6 · Los vectores

### 6.1 El que demuestra que BLOQUEA — con una revisión real, no inventada

No hace falta fabricar una revisión rota: hay varias en `main`. Uso
`6f792c70e9a8cd521f6bad03adbf6b09ecb90a8c` (`aceptacion(V91)`, 2026-08-01 13:44), que es
exactamente el caso del encargo — una revisión que el custodio podía haber etiquetado.

**REMOTO** — esa revisión no tiene verde:

```
$ gh run list --commit 6f792c70e9a8cd521f6bad03adbf6b09ecb90a8c
  ci · failure · 30702323323        (paso que cayó: «Lint (eslint · src)»)
```

**(a) Lo que hacía el flujo viejo.** `git checkout` de esa revisión —cuyo `release.yml`
es el de antes de V97, LECTURA verificada: `Install → Compile production → Package v1 →
Create Release`— y corro **sus** pasos. **MEDIDO**:

```
--- [npm run compile:production] rc=0  3s
--- [npm run package:v1]         rc=0 10s
     DONE  Packaged: dist/aleph-0-0.2.0.vsix (44 files, 287.35 KB)
=== ARTEFACTO PRODUCIDO ===
-rw-r--r--  294244  dist/aleph-0-0.2.0.vsix
```

> **El flujo viejo produce un `.vsix` instalable, de 294 244 bytes, desde una revisión
> cuya suite está en rojo.** Ese fichero es lo que se habría subido al release.

**(b) Lo que hace la cadena de V97 sobre la MISMA revisión.** **MEDIDO**:

```
--- [Lint (eslint · src)] rc=1 8s
C:\S_LAB\wt\v-v97\src\core\errorBoundary.ts
  61:35  error  Unexpected control character(s) in regular expression: \x09, \x0a, \x0d  no-control-regex
  63:33  error  Unexpected control character(s) in regular expression: \x00, \x00        no-control-regex
✖ 184 problems (2 errors, 182 warnings)
```

Y es la misma caída que vio el runner — **REMOTO**, log del run `30702323323`:

```
##[error]  61:35  error  Unexpected control character(s) …  no-control-regex
##[error]  63:33  error  Unexpected control character(s) …  no-control-regex
✖ 184 problems (2 errors, 182 warnings)
```

Línea a línea idéntico. En `release.yml` ese paso es el **11 de 21**: el job muere
**nueve pasos antes de empaquetar** y **diez antes de publicar**.

**ACOTACIÓN (§7.1)**: esto es la cadena del flujo, con sus comandos exactos, en su orden,
sobre el ref exacto — **no** es un run de GitHub disparado por una etiqueta. No he
empujado ni etiquetado nada.

### 6.2 El que demuestra que NO PARALIZA

Publicación legítima = revisión verde. **MEDIDO** sobre el árbol de la rama:

| paso del flujo | rc | nota |
| -------------- | -- | ---- |
| Guarda de paridad | **0** | `paridad OK · 14 comando(s) … todos antes de la línea 220` |
| `npm run lint` | **0** | 0 errores, 182 avisos (la deuda declarada de `.eslintrc.cjs`) |
| `npm run compile:production` | **0** | `dist/extension.js 712.3kb` |
| `npm run probe:v08` | **0** | `WP-V08 probe PASS` |
| gate de rojos por nombre | **0** | `conjunto de rojos IDENTICO al declarado` |
| suite instrumentada | **0** | `12 passed, 422 passed, 1 skipped, 423 total` |
| trinquete de cobertura | **1** | ⚠️ ver abajo — delta de plataforma ya declarado, **no** lo introduzco yo |
| guarda anti-marcas-blandas | **0** | `cero pasos con continue-on-error funcional` |
| arnés exthost — fuente | **0** | `arnés VERDE (modo source)` · 0 fallos, 2 avisos |
| arnés exthost — `.vsix` | **0** | `arnés VERDE (modo vsix)` · 0 fallos, 2 avisos |

**El rc=1 del trinquete en Windows es el delta de plataforma que este mundo ya tiene
firmado**, no una regresión mía: reporta `branches 545 cubiertas (suelo 544) … la
cobertura SUBIÓ`, que es literalmente el caso descrito en
`scripts/cobertura.suelo.json:14-18` («una corrida LOCAL en Windows puede reportar
*SUBIÓ* por esa rama — no es una mejora, es la plataforma», enrutado a **WP-V96**). En el
runner Linux ese mismo paso, sobre este mismo estado del árbol, sale verde — **REMOTO**,
run `30719606823`: los **14** pasos del job `build` y los **7** del `exthost` en
`success`, trinquete incluido.

Y el puente entre las dos columnas: `release.yml` ejecuta **los mismos textos** de comando
que ese run verde, cosa que no afirmo sino que comprueba la guarda de paridad (rc 0, 14
comandos). Una publicación desde una revisión verde pasa la cadena entera.

### 6.3 La guarda de paridad, en sus dos direcciones

Sobre copias adulteradas del flujo (en el scratchpad; el árbol no se toca). **MEDIDO**:

| ataque | salida | rc |
| ------ | ------ | -- |
| quitar el paso de la suite de `release.yml` | `PARIDAD ROTA · 1 comando(s) … ci.yml:101 «Suite instrumentada…» npm test` | **1** |
| mover el paso que publica **delante** de toda la verificación | `ORDEN ROTO · 10 comando(s) que se ejecutan DESPUÉS de publicar` + `Un gate que corre después de publicar no es un gate: el .vsix ya está fuera.` | **1** |
| ficheros reales, sin tocar | `paridad OK · 14 comando(s)` | **0** |

### 6.4 La guarda anti-marcas-blandas, en sus dos direcciones

| ataque | salida | rc |
| ------ | ------ | -- |
| inyectar `continue-on-error: true` en el paso de la suite de `release.yml` (copia) | `release.yml:183: continue-on-error: true` + `::error::ha vuelto un paso con continue-on-error` | **1** |
| árbol real | `cero pasos con continue-on-error funcional en .github/workflows/` | **0** |

### 6.5 Higiene

`git status --porcelain` vacío antes y después de correr la suite, el arnés, los
empaquetados y el `checkout` de ida y vuelta a la revisión roja. **Nada de lo ejecutado
ensucia rastreados** (`dist/`, `coverage/`, `.vscode-test/` y los `.vsix` están en
`.gitignore`). Cero `git stash`.

---

## 7 · Qué sigue sin cubrirse

1. **No hay ninguna publicación real detrás de esto.** Es la acotación mayor. No empujo
   (regla 5) y etiquetar crearía un release de verdad. **La primera etiqueta que se empuje
   será la primera ejecución de este flujo**, y con ella caen dos incógnitas del runner que
   aquí no puedo tocar: que `xvfb-run` sirva igual en el job de release que en el de
   `exthost` (mismo `ubuntu-latest`, mismo comando — LECTURA, no medida), y el número real
   de §5.3.
2. **`ci.yml` sigue sin dispararse con etiquetas.** Decidido y razonado (§4.4), no
   olvidado. Un push de etiqueta ejecuta un solo flujo; la diferencia es que ahora verifica.
3. **La guarda de paridad sólo corre al publicar.** Caza la deriva **tarde** —al publicar,
   no al empujar—: a tiempo de impedir, tarde para avisar. Meterla en `ci.yml` es una línea
   y está fuera de mi ALCANCE.
4. **La guarda de paridad puede bloquear una publicación legítima**, y hay que decirlo: si
   alguien cambia en `ci.yml` un paso que **no** verifica nada (por ejemplo el bloque del
   `.npmrc`) y no lo replica, el release se para. Es tensión deliberada, no un descuido —
   la salida nombra el comando y su línea, y arreglarlo es pegar el paso o firmar la
   exclusión— pero es un modo de bloqueo real que no existía ayer.
5. **La paridad no juzga si un comando verifica algo.** Si `ci.yml` cambiara `npm test` por
   `echo ok`, exigiría felizmente ese `echo ok` en los dos ficheros. Quien vigila que los
   pasos muerdan es el propio aparato de `ci.yml`.
6. **La paridad sólo mira `run:`.** Un `uses:` (por ejemplo un action de escaneo) no se
   compara. Si mañana la verificación de `ci.yml` llega en forma de action, este
   instrumento no se entera.
7. **`verificacion-paridad.mjs` no tiene tests propios** (`tests/**` fuera de ALCANCE).
   Sus dos direcciones están demostradas a mano en §6.3. Deuda dicha, no disimulada.
8. **El paso 17 no puede protegerse de que alguien marque blando ESE MISMO paso** —
   límite heredado de WP-V93 y ahora presente en los dos flujos.
9. **El trinquete en Windows sigue reportando +1 rama** (§6.2). No es de este WP: el
   aparato está cerrado y la ruta es **WP-V96**.
10. **Un verde de `release.yml` no dice «el producto funciona».** Hereda **entero** el
    §«Lo que el pipeline NO comprueba» del README: cobertura congelada al ~26 %, `tests/`
    y `scripts/` sin lint, el gate juzga el conjunto de rojos y no la calidad de un test.
    Publicar verifica **lo mismo** que empujar una rama, ni una comprobación más.
11. **Nada de esto exige revisión humana.** El gate mira la verificación, no quién aprobó.
    Y un `workflow_dispatch` desde `main` sigue publicando la versión de `package.json` sin
    que exista etiqueta — ahora, eso sí, pasando la cadena entera.
12. **`package.json` es zona prohibida y no lo he tocado**: la cadena no necesita ningún
    script nuevo. Los diez comandos de verificación ya existían.

---

## 8 · Diff

| fichero | qué |
| ------- | --- |
| `.github/workflows/release.yml` | la cadena de verificación entera antes de empaquetar y publicar; guarda de paridad; guarda anti-marcas-blandas; cuerpo del release reescrito (decía «Sin lint, sin tests y sin probes», que ya sería mentira) |
| `scripts/verificacion-paridad.mjs` | **nuevo** · cobertura + orden entre `ci.yml` y `release.yml`, falla cerrado |
| `README.md` | la viñeta que declaraba el hueco ya no es cierta; §`release.yml` describe la cadena, el coste y la vía descartada |
| `plan/BACKLOG.md` | sólo la fila **WP-V97** |
| `plan/REPORTES/WP-V97-publicar-con-red.md` | este documento |

**Sin tocar**: `ci.yml` (§4.4) · `package.json` · `scripts/rojos-jest.mjs` ·
`scripts/cobertura-trinquete.mjs` · `scripts/cobertura.suelo.json` · `src/**` · `tests/**`.
