# BRIEF · WP-V02 · Semilla del producto

```text
(rol) swarm-orquestacion/reference/roles/WORKER.md

WP: WP-V02 · Semilla del producto
Rama: wp/v02-semilla-producto
Worktree: C:/S_LAB/.worktrees/v/v-sdk-wp-v02
Reporte: plan/REPORTES/WP-V02-semilla-producto.md

Lecturas:
- plan/BACKLOG.md (WP-V02)
- plan/DECISIONES.md (DV-03 ✅)
- OUT_DIR STANDING_GO=true
- Eje CA: ninguno I–V (import fundación; CA del BACKLOG)

Notas del orquestador:
- WORLD_ROOT = C:/S_LAB/v-sdk
- CANONICAL_WORLD_ROOT = C:/S_LAB/v-sdk
- READ_ONLY_ROOTS = ["C:/S_LAB/.worktrees","C:/S/scriptorium/codebase"]
- DOWNSTREAM_PATTERNS = [".worktrees/*","codebase/*"]
- OUT_DIR = C:/S_LAB/vigilancia/v
- ALCANCE_DIFF = árbol producto importado + .gitignore + README* gobierno
  (PRESERVAR plan/; no tocar z-sdk/a-sdk/atlas)
- Semilla: escrivivir-co/vscode-alephscript-extension @
  integration/beta/scriptorium (tip conocido 793de5e9…)
- DV-03: merge historial + tag import/scriptorium-<sha>
- README-SCRIPTORIUM.md huérfano OASIS: incorporar si existe en espejo;
  si no, documentar búsqueda y <pendiente> sin inventar
- STANDING_GO=true; no pedir GO; no matar watcher; no secrets NPM
- RIESGO_REVISION: independiente (import historial + tip ajeno)
- MOTIVO_RIESGO: merge unrelated + tag de procedencia
- CONTRAEVIDENCIA_REQUERIDA:
  - tag import/scriptorium-<sha> apunta al tip semilla
  - git log muestra historial semilla reachable desde main post-merge
  - plan/ intacto
  - .gitignore cubre *.vsix dist/ node_modules/
- REVISOR_DISTINTO_WORKER: sí

Empieza: worktree → fetch seed → merge --allow-unrelated-histories →
tag → README huérfano si existe → reporte.
```
