# PLANTILLA · BRIEF de WP para el swarm F2 — con el censo de trampas pagadas (WP-V79)

Estado: ✅ **ACEPTADA 2026-08-02** por el orquestador, **con cuatro
correcciones medidas** (§CORRECCIONES al pie). Uso: el orquestador copia esto
por WP y rellena. **Las secciones IDENTIDAD-RAÍZ, TRAMPAS, GIT y ECONOMÍA no
se recortan**: cada línea costó una devolución, una fuga o una sesión muerta.

> **Las trampas caducan.** Cada una lleva fecha de medición. Una trampa citada
> sin re-medir es exactamente el defecto que este mundo persigue: *una cifra o
> una cita «medida por grep» caduca — o se re-mide al citarla, o se cita el
> gate que la sostiene*. Tres de las nueve del censo original ya habían
> caducado cuando se aceptó esta plantilla.

```text
(rol) .claude/skills/swarm-orquestacion/reference/roles/WORKER.md
      ✓ verificado presente 2026-08-02

WP: WP-Vnn · <título> (<lane> · bloque B<n>)
Rama: wp/vnn-<slug>
Worktree: C:/S_LAB/wt/v-<nn>          ← convención VIVA (medida 2026-08-02)
Reporte: plan/REPORTES/WP-Vnn-<slug>.md
DEPS verificadas contra plan/GOBIERNO-EJECUCION-F2.md §1:
  <lista: qué WPs deben estar fusionados; qué filas de contención comparte
   este WP y con quién — si comparte fila con un WP vivo, NO se despacha>

── IDENTIDAD-RAÍZ (sin esto NO hay despacho) ───────────────────────────
El skill de orquestación lo exige literalmente: «el orquestador adjunta a
cada despacho la calibración explícita; si falta cualquiera, no hay
despacho ni boot». Orden obligatorio: DETECTOR → PASS|LOCK → EFECTOS.

  WORLD_ROOT           = C:/S_LAB/wt/v-<nn>     ← EL WORKTREE, no el mundo
  CANONICAL_WORLD_ROOT = C:/S_LAB/wt/v-<nn>     ← el mismo
  READ_ONLY_ROOTS      = ["C:/S_LAB/z-sdk","C:/S_LAB/g-sdk","C:/S_LAB/o-sdk",
                          "C:/S_LAB/s-sdk","C:/S_LAB/a-sdk","C:/S_LAB/e-sdk",
                          "C:/S_LAB/skills-library","C:/S/scriptorium"]
  DOWNSTREAM_PATTERNS  = []                     ← lista VACÍA EXPLÍCITA

  detector: C:/S_LAB/skills-library/skills/vigilancia/scripts/
            verificar-identidad-raiz.mjs

Rutas con «/», nunca «\». Las cuatro entradas son obligatorias, incluida
la lista vacía: distingue «sin raíces» de «calibración ausente».
DOWNSTREAM_PATTERNS que cubra el propio WORLD_ROOT ⇒ LOCK. LOCK es
fail-closed: cero efectos, se devuelve al custodio.

QUÉ ES / QUÉ NO ES
  <2-4 líneas. Qué transformación hace. Qué queda explícitamente fuera.>

ALCANCE — ficheros que puedes escribir (y ningún otro):
  <lista cerrada. Al terminar, git status --porcelain solo puede mostrar
   estos ficheros. Uno de más = hallazgo del contrarrevisor.>

CA DE CIERRE (verificable, cada punto con su comando)
  1. <...>
  n. git status limpio fuera de alcance · evidencia transcrita al reporte

── TRAMPAS CENSADAS (todas ocurrieron; no re-descubrirlas) ─────────────
Formato: · [medida AAAA-MM-DD] trampa.

· [2026-08-02] npx RESPONDE en esta máquina (10.9.4). La trampa vieja
  decía «npx está ROTO» y ya no es cierta. La regla viva es otra y sigue
  en pie: regla 4-ter del gobierno — `npx <binario>` NO DECLARADO está
  prohibido. Declararlo o esquivarlo (createRequire + process.execPath,
  como hace scripts/vsix.mjs).
· [2026-07-26, sin re-medir] jest SIEMPRE con --coverage=false. La
  cobertura ensucia el árbol e invalida la huella de evidencia.sh de
  TODOS los worktrees.
· [2026-08-02] el conjunto declarado de rojos de jest tiene HOY **una
  sola entrada, y es un OMITE honesto** (WP-V28, contra runtime real de
  la Ciudad). CERO fallos. La trampa vieja hablaba de «5 tests rojos
  preexistentes cuyo arreglo es WP-V48»: **V48 está aceptado y los cinco
  están a cero**. No los cites como preexistentes.
· [2026-07-26, sin re-medir] el artefacto se verifica CONSTRUIDO
  (unzip -l), jamás razonando el patrón de ignore. Dos fugas reales lo
  probaron: *.map no cruzaba «/» y .slot.lock/ viajó dentro del .vsix.
  Purgar dist/ antes de compile:production + package.
· [2026-07-26, sin re-medir] MSYS_NO_PATHCONV=1 para git cat-file con
  rutas que empiezan por punto (Git Bash convierte y MIENTE — caso D21).
· [2026-07-26, sin re-medir] rutas Windows en línea de shell: printf
  '%s\n' con comillas simples, o Add-Content -Value literal — \n dentro
  de una ruta parte la línea.
· [2026-08-02] escritura de ficheros compartidos: UTF-8 explícito,
  append puro; jamás releer-y-reescribir entero (doble codificación
  Â· documentada). Añadido tras un caso nuevo: una ficha de BACKLOG
  llegó a llevar dentro los bytes de control que describía —dos NUL y
  dos saltos— y las herramientas declararon el fichero «binario».
  Los caracteres de control se transcriben (U+0000), no se pegan.
· [2026-08-02] UN ESCRITOR POR WORKTREE. Si detectas un commit que no es
  tuyo en tu rama, PARA y repórtalo — hubo un caso real de doble
  contrarrevisor y evidencia.sh no puede detectar la contaminación
  cruzada. Y `git stash` está PROHIBIDO: la pila es del REPOSITORIO, no
  del worktree, y aquí siempre hay varios vivos.
· [2026-07-26, sin re-medir] CRLF: los .sh van con LF forzado por
  .gitattributes. No lo toques.

── IDENTIDAD Y GIT ─────────────────────────────────────────────────────
· Commit con -c user.name=worker-V -c user.email=alephscriptorium@gmail.com
  (verifica con git log -1 --format='%an' — cero placeholders).
  Precedente caro: 37 commits ya publicados llevan autoría
  `you@example.com` por config global; reescribirlos exigiría push-force,
  que está prohibido. Se arregló hacia delante, no hacia atrás.
· Commits convencionales · obra y reporte SEPARADOS.
· NO fusiones a main · NO push (a ningún remoto, nunca — norma del
  custodio; empujar es del orquestador) · NO tags · NO reescribas
  historia.
· z-sdk, s-sdk, el hub, el espejo OASIS y las sincronia/ ajenas: SOLO
  LECTURA (y las sincronia/ ajenas, ni eso salvo tick).

── ECONOMÍA DE CPU ─────────────────────────────────────────────────────
· Caro (npm ci · compile · jest · vsce) SOLO por ranura:
    bash scripts/evidencia.sh vigente <etiqueta>   # 0 ⇒ cita, no repitas
    bash scripts/slot.sh run <etiqueta> -- <cmd>
    bash scripts/evidencia.sh registrar <etiqueta> PASS|FAIL
· Transcribe la tabla de EVIDENCIA.md al reporte (el fichero está
  gitignorado a propósito).

── HONESTIDAD ──────────────────────────────────────────────────────────
· Lo no verificado va ⏳ CON MOTIVO. Un ✅ sin comando que lo respalde es
  una devolución segura.
· El defecto casi nunca está en el código: está en la FRASE que lo
  describe. De ~40 contrarrevisiones en este programa, sólo 2 pasaron a
  la primera, y casi todos los bloqueantes fueron alcance declarado más
  ancho que la evidencia. Escribe menos de lo que puedas demostrar.
· Si el criterio del brief está mal planteado, dilo en el reporte — hay
  precedente admitido de briefs con errores (uno nombró el fichero
  equivocado y el worker encontró el correcto). Corregir al brief con
  dato es mérito, no insubordinación.
· Cierra con: VEREDICTO_REVISOR: ⏳ pendiente
  (contrarrevisión independiente si el WP toca contrato/config/
  empaquetado o cualquier frontera de confianza)
```

## CORRECCIONES DE LA ACEPTACIÓN (2026-08-02)

La plantilla se aceptó **midiéndola, no leyéndola**. Cuatro defectos, los
cuatro comprobados con orden y salida:

| # | qué decía | qué se midió | efecto |
| - | --------- | ------------ | ------ |
| 1 | `Worktree: C:/S_LAB/.worktrees/v/v-sdk-wp-vnn` | `C:/S_LAB/.worktrees/v` **existe y está VACÍO**; los worktrees vivos cuelgan de `C:/S_LAB/wt/`. Es peor que una ruta inexistente: parece plausible y no falla al mirarla | corregido a la convención viva |
| 2 | «npx está ROTO en esta máquina» | `npx --version` → **10.9.4** | reemplazado por la regla que sí rige: 4-ter, `npx` no declarado prohibido |
| 3 | «los 5 tests rojos son PREEXISTENTES · su arreglo es WP-V48 y tiene dueño» | **V48 aceptado**; el conjunto declarado tiene hoy **1 entrada y es un OMITE honesto**, cero fallos | corregido con la medida de hoy |
| 4 | *(nada)* | la plantilla **no traía la calibración de identidad-raíz**, que el skill exige literalmente en cada despacho | sección nueva, la primera del bloque |

El defecto de fondo era uno solo y es el que da nombre a la regla nueva del
encabezado: **un censo de trampas sin fechas envejece en silencio**. Tres de
las nueve estaban caducadas y nada lo delataba. Ahora cada trampa lleva su
fecha de medición, y las que no se re-midieron lo dicen.

— **V** · Aleph-0 (ℵ₀)
