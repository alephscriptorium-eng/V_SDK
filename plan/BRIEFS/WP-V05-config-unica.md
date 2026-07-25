# BRIEF · WP-V05 · Config única

```text
(rol) .claude/skills/swarm-orquestacion/reference/roles/WORKER.md

WP: WP-V05 · Config única
Rama: wp/v05-config-unica
Worktree: C:/S_LAB/.worktrees/v/v-sdk-wp-v05
Reporte: plan/REPORTES/WP-V05-config-unica.md
Lane: Ola B · paralelo con WP-V06 (ficheros DISJUNTOS)

Lecturas:
- plan/BACKLOG.md (WP-V05)
- package.json contributes.configuration
- Cirugía censo: src/libs/alephscript-client.ts (~3010) ·
  src/core/AracneBotService.ts · src/core/mcpConfigurationManager.ts ·
  src/processManager.ts
- Eje: hostil-omite (sin settings → ⏳ honesto)

Notas del orquestador:
- WORLD_ROOT / CANONICAL = C:/S_LAB/v-sdk
- READ_ONLY_ROOTS = ["C:/S_LAB/.worktrees","C:/S/scriptorium/codebase"]
- DOWNSTREAM_PATTERNS = [".worktrees/*","codebase/*"]
- OUT_DIR = C:/S_LAB/vigilancia/v · STANDING_GO=true · PAUSED=false
- ALCANCE_DIFF (SOLO V05 — no tocar ficheros V06):
  - package.json (solo contributes.configuration / zigurat.*)
  - src/libs/alephscript-client.ts
  - src/core/AracneBotService.ts
  - src/core/mcpConfigurationManager.ts
  - src/processManager.ts
  - (schema/settings helpers NUEVOS bajo src/config/ si hace falta)
  PROHIBIDO: DEFAULT_TASKS, árbol MCP/tasks de catálogo, cliente
  launcher:// (eso es V06)
- CA: grep rutas absolutas de máquina + puertos hardcodeados fuera de
  defaults de schema = 0 · arranque con settings vacíos → ⏳ ·
  compile verde · reporte con evidencia hostil-omite
- Identidad commits: env GIT_AUTHOR/COMMITTER = worker-V /
  alephscriptorium@gmail.com (NO git config write)
- No matar watcher · no marketplace · publisher queda para V10
- Hallazgos previos (README-SCRIPTORIUM, Jest soft): no bloquean salvo
  impacto directo — documentar si aparece
- Ante PAUSE en OUT_DIR: parar y dejar rama limpia
- RIESGO_REVISION: independiente · REVISOR_DISTINTO_WORKER: sí
  (orquestador)

Empieza: worktree desde main tip · implementa · commit · push rama ·
reporte listo para revisión. NO merges a main.
```
