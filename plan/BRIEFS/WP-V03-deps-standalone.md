# BRIEF · WP-V03 · Dependencia standalone + higiene DX

```text
(rol) swarm-orquestacion/reference/roles/WORKER.md

WP: WP-V03 · Dependencia standalone + higiene DX
Rama: wp/v03-deps-standalone
Worktree: C:/S_LAB/.worktrees/v/v-sdk-wp-v03
Reporte: plan/REPORTES/WP-V03-deps-standalone.md

Lecturas:
- plan/BACKLOG.md (WP-V03)
- package.json (file:../MCPGallery · debug:view · uninstall IDs)
- .npmrc (registry @alephscript)
- Eje CA: ninguno obligatorio I–V; contrarrevisión deps usadas↔declaradas

Notas del orquestador:
- WORLD_ROOT / CANONICAL = C:/S_LAB/v-sdk
- READ_ONLY_ROOTS / DOWNSTREAM_PATTERNS = calibración ESTACION.md
- OUT_DIR = C:/S_LAB/vigilancia/v · STANDING_GO=true
- ALCANCE_DIFF = package.json · package-lock.json · scripts DX ·
  (vendor/ solo si registry falla)
- Evidencia previa: npm view @alephscript/mcp-core-sdk → 1.3.0/1.4.0/1.5.0
  en https://npm.scriptorium.escrivivir.co — usar registry (no file:)
- Preferir pin compatible con semilla (1.3.0) salvo rotura; documentar elección
- Higiene: debug:view path oracl → path relativo/repo local;
  uninstall ID = publisher.name real
- CA: npm ci limpio sin hermanos · npm run compile verde
- NO secrets NPM en Actions; si hace falta auth registry, documentar bloqueo
- RIESGO_REVISION: independiente (deps runtime)
- REVISOR_DISTINTO_WORKER: sí

Empieza: worktree → sustituir file: → npm ci → compile → higiene → reporte.
```
