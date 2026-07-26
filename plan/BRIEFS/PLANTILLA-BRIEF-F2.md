# PLANTILLA · BRIEF de WP para el swarm F2 — con el censo de trampas pagadas (WP-V79)

Estado: 🔶 preparada en asentamiento · pendiente de aceptación del custodio.
Uso: el orquestador copia esto por WP y rellena. **Las secciones TRAMPAS,
IDENTIDAD y ECONOMÍA no se recortan**: cada línea costó una devolución,
una fuga o una sesión muerta.

```text
(rol) .claude/skills/swarm-orquestacion/reference/roles/WORKER.md

WP: WP-Vnn · <título> (<lane> · ola F2-n)
Rama: wp/vnn-<slug> · Worktree: C:/S_LAB/.worktrees/v/v-sdk-wp-vnn
Reporte: plan/REPORTES/WP-Vnn-<slug>.md
DEPS verificadas contra plan/GOBIERNO-EJECUCION-F2.md §1:
  <lista: qué WPs deben estar fusionados; qué filas de contención comparte
   este WP y con quién — si comparte fila con un WP vivo, NO se despacha>

QUÉ ES / QUÉ NO ES
  <2-4 líneas. Qué transformación hace. Qué queda explícitamente fuera.>

ALCANCE — ficheros que puedes escribir (y ningún otro):
  <lista cerrada. Al terminar, git status --porcelain solo puede mostrar
   estos ficheros. Uno de más = hallazgo del contrarrevisor.>

CA DE CIERRE (verificable, cada punto con su comando)
  1. <...>
  n. git status limpio fuera de alcance · evidencia transcrita al reporte

── TRAMPAS CENSADAS (todas ocurrieron; no re-descubrirlas) ─────────────
· npx está ROTO en esta máquina (npm/bin/npx-cli.js ausente por
  momentos). No introduzcas usos: scripts/vsix.mjs ya lo esquiva con
  createRequire + process.execPath.
· jest SIEMPRE con --coverage=false. La cobertura ensucia el árbol e
  invalida la huella de evidencia.sh de TODOS los worktrees.
· Los 5 tests rojos de managerFactory/terminal son PREEXISTENTES
  (demostrado dos veces contra tag). Se citan, no se arreglan de paso —
  su arreglo es WP-V48 y tiene dueño.
· El artefacto se verifica CONSTRUIDO (unzip -l), jamás razonando el
  patrón de ignore. Dos fugas reales lo probaron: *.map no cruzaba «/»
  y .slot.lock/ viajó dentro del .vsix. Purgar dist/ antes de
  compile:production + package.
· MSYS_NO_PATHCONV=1 para git cat-file con rutas que empiezan por punto
  (Git Bash convierte y MIENTE — caso D21).
· Rutas Windows en línea de shell: printf '%s\n' con comillas simples o
  Add-Content -Value literal — \n dentro de una ruta parte la línea.
· Escritura de ficheros compartidos: UTF-8 explícito, append puro; jamás
  releer-y-reescribir entero (doble codificación Â· documentada).
· UN ESCRITOR POR WORKTREE. Si detectas un commit que no es tuyo en tu
  rama, PARA y repórtalo — hubo un caso real de doble contrarrevisor y
  evidencia.sh no puede detectar la contaminación cruzada.
· CRLF: los .sh van con LF forzado por .gitattributes. No lo toques.

── IDENTIDAD Y GIT ─────────────────────────────────────────────────────
· Commit con -c user.name=worker-V -c user.email=alephscriptorium@gmail.com
  (verifica con git log -1 --format='%an' — cero placeholders).
· Commits convencionales · obra y reporte SEPARADOS.
· NO fusiones a main · NO push (a ningún remoto, nunca — norma custodio)
  · NO tags · NO reescribas historia.
· z-sdk, scriptorium/codebase/**, espejo OASIS y las sincronia/ ajenas:
  SOLO LECTURA (y las sincronia/ ajenas, ni eso salvo tick).

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
· Si el criterio del brief está mal planteado, dilo en el reporte — hay
  precedente admitido de briefs con errores; corregir al brief con dato
  es mérito, no insubordinación.
· Cierra con: VEREDICTO_REVISOR: ⏳ pendiente
  (contrarrevisión independiente si el WP toca contrato/config/empaquetado)
```

— **V** · Aleph-0 (ℵ₀)
