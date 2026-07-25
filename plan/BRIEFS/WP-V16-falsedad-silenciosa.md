# BRIEF · WP-V16 · Falsedad silenciosa

```text
(rol) .claude/skills/swarm-orquestacion/reference/roles/WORKER.md

WP: WP-V16 · Falsedad silenciosa (Ola F · CORTE · ola L1 de la cola S)
Rama: wp/v16-falsedad-silenciosa
Worktree: C:/S_LAB/.worktrees/v/v-sdk-wp-v16
Reporte: plan/REPORTES/WP-V16-falsedad-silenciosa.md
Lote: V12 ∥ V16 ∥ V17 (independientes · ficheros en alcance disjuntos)

Lecturas:
- plan/BACKLOG.md · Ola F · WP-V16
- C:/S/vigilancia/HANDOFF-S-COLA-LIMPIEZA-post-R5V.md · ola L1 (V-L1-01..05)
- C:/S/vigilancia/REVISION-S-WP-V10-v1.md · §1.1, §1.4, §2.8, §2.10, §2.11
  (ahí está el detalle fichero:línea; es la fuente de los CA)

QUÉ ES ESTO
El patrón que el revisor externo llamó «la evidencia no cubre el artefacto
que dice cubrir». Cuatro instancias en este repo. Ninguna falla: mienten.
Van antes de cualquier siguiente release.

ALCANCE — ficheros que puedes escribir (y ningún otro):
- scripts/probes/v08-mutacion-autoria.mjs
- package.json  → SOLO el bloque "scripts". NO toques "version",
                  "contributes", "dependencies" ni la marca.
- .github/workflows/ci.yml
- .github/workflows/release.yml
- .eslintrc.cjs        (solo si eliges el camino «lint con reglas», ver (c))
- README.md            (solo la declaración de qué verifica el pipeline)
- scripts/*.mjs nuevo  (permitido si necesitas un resolutor de nombre de
                        .vsix portable; declara el fichero en el reporte)
- plan/REPORTES/WP-V16-falsedad-silenciosa.md

FUERA DE TU ALCANCE (son de otros WP del mismo lote):
- src/**            → WP-V17 toca src/mutation/parseEditorInfo.ts
- tests/**          → WP-V17
- la marca del producto (título, icono, «Arrakis Theater» / «Zigurat»)
  → WP-V14. Si reescribes el cuerpo del release, NO añadas cadenas de
  marca nuevas y deja constancia de que la marca la arregla V14.

TRABAJO

(a) El probe importa la pieza real — V-L1-01 · REVISIÓN §1.1
    Hoy scripts/probes/v08-mutacion-autoria.mjs:30-31 declara
    «Espejo de src/mutation/parseEditorInfo.ts» y reimplementa el parser.
    Y el espejo YA divergió: :84 hace `!!g.reparto_required` mientras
    src/mutation/parseEditorInfo.ts:72-77 lee `g.reparto_required` O
    `reparto.required`, con `null` cuando falta. El PASS del probe no
    atestigua el código que va en el .vsix.
    - El probe importa la pieza real. Camino recomendado: `tsc -p
      tsconfig.json` emite a out/ con rootDir "." →
      out/src/mutation/parseEditorInfo.js; el probe hace import dinámico
      con pathToFileURL (ojo al interop CJS↔ESM: el .mjs importa CJS).
      Alternativa válida: bundle esbuild de la pieza a un artefacto
      temporal. Elige y justifica.
    - PROHIBIDO cualquier resto de reimplementación en el probe.
    - Si el artefacto compilado no existe, el probe FALLA con mensaje
      claro. Jamás un fallback al espejo: eso reintroduce la mentira.
    - DEMOSTRACIÓN exigida por la CA: cambia temporalmente el parser real
      (p. ej. invierte el default de `visible` en :80), corre el probe,
      enséñalo ROJO, revierte, corre otra vez, enséñalo VERDE. El reporte
      lleva el diff exacto que aplicaste y las dos salidas.
    - Al escribir asserts, NO fijes el valor esperado de `repartoRequired`
      ante ausencia de dato: eso es exactamente lo que WP-V17 está
      cambiando en paralelo (ausencia ⇒ requerido). Comprueba la política
      leyéndola del parser, no clavándola en el probe. Ver COORDINACIÓN.

(b) Nombre del .vsix derivado de la versión — V-L1-02 · REVISIÓN §1.4
    Literales verificados hoy en HEAD d0323fb:
      package.json:1473 package:local · :1484 install:local
      :1489 install:insiders · :1498 package:v1   → «…-0.1.0.vsix»
      package.json:1497 package:v0 → «dist/zigurat-0.0.1.vsix» (script
        muerto, nombre y versión anteriores: V-L4-03; mátalo aquí)
      ci.yml:69 path: dist/scriptorium-zigurat-0.1.0.vsix
      release.yml:91,94,97 (cuerpo + files:)
    - `vsce package --out dist/` (vsce nombra solo) o nombre derivado de
      la versión. En los flujos, `dist/*.vsix`.
    - CUIDADO CON WINDOWS: `$npm_package_version` no expande en cmd.exe y
      el custodio prueba en Windows mientras el CI corre en ubuntu. Si
      necesitas interpolar, hazlo con node, no con el shell.
    - CA: `npm version 0.2.0 --no-git-tag-version` ⇒ el empaquetado
      produce `…-0.2.0.vsix`. DESPUÉS revierte a 0.1.0
      (`npm version 0.1.0 --no-git-tag-version --allow-same-version`) y
      demuestra en el reporte que `git diff` no deja la versión tocada.
      Este es el único comando caro imprescindible del WP: por la ranura.

(c) El lint no puede pasar mintiendo — V-L1-03 · REVISIÓN §2.8
    package.json:1481 `lint` es `node -e "console.log(…)"`: siempre sale 0.
    Y `lint:fix` (:1482) sí ejecuta eslint de verdad — el que miente es el
    que corre en CI (ci.yml:52-53).
    Dos caminos honestos, y solo dos:
      1. `lint` ejecuta eslint de verdad y el paso de CI puede fallar.
      2. El paso sale del CI y se declara por qué.
    Decide con dato, no con gusto: corre eslint UNA vez (por la ranura),
    cuenta errores sobre el legado y elige. El reporte lleva el recuento
    que justificó la elección. Lo que NO vale es que quede un verde por
    construcción.

(d) Guarda del release manual — V-L1-05 · REVISIÓN §2.10
    release.yml tiene `workflow_dispatch` sin restricción de rama y
    `permissions: contents: write`; el tag se resuelve de package.json y
    softprops/action-gh-release ACTUALIZA el release existente. Un
    dispatch accidental desde cualquier rama pisa el asset publicado.
    - O el dispatch aborta fuera de main, o aborta si el tag resuelto ya
      existe. Vale hacer las dos.
    - HONESTIDAD: esto no se puede probar sin disparar el flujo, y este WP
      no empuja a main ni lanza releases. Declara la verificación como
      ESTÁTICA (el YAML) y el resto ⏳ «no ejecutado contra GitHub».
      No escribas «PASS» de algo que no corriste.

(e) Declarar qué verifica el pipeline — V-L1-04
    El reporte no puede decir «CI PASS» a secas: hoy el CI solo comprueba
    que instala, compila y empaqueta (`test` va `continue-on-error`, y el
    lint miente hasta (c)). Dilo en el reporte y en README.md.

COORDINACIÓN CON WP-V17 (mismo lote, se encuentran en la fusión)
V16 hace que el probe importe el parser real; V17 cambia el
comportamiento del parser ante ausencia de `required` (hoy falla abierto,
pasará a fallar cerrado). Los ficheros en alcance son disjuntos, pero la
semántica se cruza. Regla: el probe de V16 NO fija el default de
`repartoRequired`. Si al fusionar el orden importa, lo resuelve el
orquestador; tu reporte declara el supuesto con el que trabajaste.

CA DE CIERRE (los 5 de L1)
1. scripts/probes/v08-mutacion-autoria.mjs no contiene reimplementación
   del parser (grep del cuerpo del espejo = 0) e importa la pieza real.
2. Un cambio en el parser real ROMPE el probe: demostrado en el reporte
   con el diff aplicado y las dos salidas (roja y verde).
3. `npm version 0.2.0` ⇒ asset `…-0.2.0.vsix`; cero literales de nombre
   de fichero con versión en package.json, ci.yml y release.yml (deja el
   grep en el reporte). La versión queda revertida a 0.1.0.
4. El CI no tiene un verde por construcción: o lint puede fallar, o lint
   sale del CI y se declara.
5. release.yml no permite pisar un release publicado desde un dispatch
   accidental (verificación estática declarada como tal).

ECONOMÍA DE CPU (obligatorio)
Comandos caros: npm ci · compile* · test · eslint sobre todo src ·
vsce package · el probe cuando exige compilar. NUNCA sueltos:
  bash scripts/evidencia.sh vigente <etiqueta>   # 0 ⇒ NO repetir; cita la fila
  bash scripts/slot.sh run <etiqueta> -- <comando…>
  bash scripts/evidencia.sh registrar <etiqueta> PASS|FAIL [nota]
Etiquetas sugeridas: npm-ci · compile · probe-v08 · probe-v08-demo ·
eslint-censo · package-0.2.0.
La ranura es ÚNICA y compartida por los tres worktrees del lote: si está
ocupada, esperas. No la esquives lanzando el comando a pelo — es
exactamente el despilfarro que este lote viene a cortar.
El reporte transcribe la tabla de EVIDENCIA.md (el fichero es local y está
en .gitignore; la evidencia perdura en el reporte).

IDENTIDAD (preflight, antes del primer commit)
El `git config` del repo trae placeholder («Your Name» / you@example.com).
  git -c user.name=worker-V -c user.email=alephscriptorium@gmail.com commit …
Verifica con `git log -1 --format='%an <%ae>'`. Commits convencionales.

FRONTERAS
- NO fusiones a main. NO tags. NO releases. NO force-push.
- No subas la versión de forma permanente: 0.1.0 al terminar.
- C:/S_LAB/z-sdk, C:/S/scriptorium/codebase/** y OASIS: SOLO LECTURA.
- No mates el watcher (C:/S_LAB/vigilancia/v/).
- RIESGO_REVISION: independiente — WP de empaquetado, config y flujos;
  contrarrevisión obligatoria por un agente distinto.

Empieza: worktree · implementa · demuestra · push · reporte.
```
