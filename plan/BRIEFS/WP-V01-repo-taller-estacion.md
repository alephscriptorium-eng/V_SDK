# BRIEF · WP-V01 · Repo + taller + estación

```text
(rol) swarm-orquestacion/reference/roles/WORKER.md

WP: WP-V01 · Repo + taller + estación
Rama: wp/v01-repo-taller-estacion
Worktree: C:/S_LAB/.worktrees/v/v-sdk-wp-v01
Reporte: plan/REPORTES/WP-V01-repo-taller-estacion.md

Lecturas:
- plan/BACKLOG.md (WP-V01)
- plan/DECISIONES.md (DV-01, DV-02, DV-04 ✅ opción 1)
- plan/ESTACION.md
- Handoff: C:/S_LAB/vigilancia/v/ADDENDA-R0-V-WP-V01-arranque-obra.md §WP
- Eje CA aplicable: ninguno de I–V (fundación repo/estación; CA del BACKLOG)

Notas del orquestador:
- WORLD_ROOT = C:/S_LAB/v-sdk
- CANONICAL_WORLD_ROOT = C:/S_LAB/v-sdk
- READ_ONLY_ROOTS = ["C:/S_LAB/.worktrees","C:/S/scriptorium/codebase"]
- DOWNSTREAM_PATTERNS = [".worktrees/*","codebase/*"]
- OUT_DIR = C:/S_LAB/vigilancia/v
- ALCANCE_DIFF = plan/ · README.md · .gitignore · package.json · .npmrc
  (gobierno; NO semilla producto; NO a-sdk; NO atlas codebase/v-sdk)
- Chicken-egg identidad: pre-git LOCK esperado; tras primer commit
  correr verificar-identidad-raiz → PASS obligatorio para CA.
- Identidad commits: NO placeholders. Usar env GIT_AUTHOR_* /
  GIT_COMMITTER_* (patrón taller: rol + alephscriptorium@gmail.com).
  NO escribir git config.
- Crear remoto alephscriptorium-eng/V_SDK (gh); init en WORLD_ROOT
  preservando plan/; primer commit gobierno plan/ + README misión DV-02;
  push main; worktree bajo C:/S_LAB/.worktrees/v.
- Watcher estación-viva ya vivo: NO matar; confirmar lease.
- No despachar V02+; no secrets NPM en este WP; marketplace deferred.
- RIESGO_REVISION: independiente (crea frontera repo/remoto/identidad)
- MOTIVO_RIESGO: fundación de repo + identidad fail-closed + push remoto
- CONTRAEVIDENCIA_REQUERIDA:
  - remoto existe y main tiene plan/ + README
  - identidad-raiz PASS (no LOCK)
  - preflight verificar-identidad sin placeholder efectivo
  - watcher lease vivo; plan/ preservado
  - cero gitlink a-sdk; cero obra en z-sdk/atlas
- REVISOR_DISTINTO_WORKER: sí (orquestador hace contrarrevisión read-only)

Empieza: crea remoto → init git → rama/worktree → commit gobierno →
push → evidencia identidad + watcher → reporte.
```
