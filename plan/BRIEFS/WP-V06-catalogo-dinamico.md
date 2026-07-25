# BRIEF · WP-V06 · Catálogo dinámico

```text
(rol) .claude/skills/swarm-orquestacion/reference/roles/WORKER.md

WP: WP-V06 · Catálogo dinámico
Rama: wp/v06-catalogo-dinamico
Worktree: C:/S_LAB/.worktrees/v/v-sdk-wp-v06
Reporte: plan/REPORTES/WP-V06-catalogo-dinamico.md
Lane: Ola B · paralelo con WP-V05 (ficheros DISJUNTOS)

Lecturas:
- plan/BACKLOG.md (WP-V06)
- CONTRATO IDE / launcher (z-sdk SOLO LECTURA)
- Cliente MCP launcher://info|catalog|ports ·
  resolve_capability / list_capabilities (@zeus/mcp-launcher)
- Eje: hostil-omite (sin launcher → ⏳)

Notas del orquestador:
- WORLD_ROOT / CANONICAL = C:/S_LAB/v-sdk
- READ_ONLY_ROOTS = ["C:/S_LAB/.worktrees","C:/S/scriptorium/codebase"]
- DOWNSTREAM_PATTERNS = [".worktrees/*","codebase/*"]
- OUT_DIR = C:/S_LAB/vigilancia/v · STANDING_GO=true · PAUSED=false
- ALCANCE_DIFF (SOLO V06 — no tocar ficheros V05):
  - src/ treeViews / tasks / theatrical panels que alimentan MCP/tasks
  - DEFAULT_TASKS y tablas fijas 3001-3066 (degradar a fallback MARCADO)
  - nuevo cliente launcher bajo src/ (p.ej. src/launcher/ o similar)
  - package.json SOLO si hace falta dep @zeus/mcp-launcher (coordenar:
    no editar contributes.configuration — eso es V05)
  PROHIBIDO editar: alephscript-client.ts · AracneBotService.ts ·
  mcpConfigurationManager.ts · processManager.ts · schema zigurat.*
- Puerto launcher: LEER de settings (zigurat.*); si V05 aún no mergeó,
  usar setting key documentada + fallback ⏳ sin inventar flota
- CA: con launcher vivo inventario en caliente · sin launcher ⏳
  honesto · cero puertos fijos NUEVOS · compile verde · reporte
- Identidad: GIT_* env worker-V / alephscriptorium@gmail.com
- No matar watcher · marketplace deferred · publisher = V10
- Jest soft / README-SCRIPTORIUM: no bloquean; documentar impacto
- Ante PAUSE: parar
- RIESGO_REVISION: independiente · REVISOR_DISTINTO_WORKER: sí

Empieza: worktree desde main tip · implementa · commit · push rama ·
reporte. NO merges a main.
```
