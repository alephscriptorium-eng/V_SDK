# BRIEF · WP-V10 · v1 + Release

```text
(rol) .claude/skills/swarm-orquestacion/reference/roles/WORKER.md

WP: WP-V10 · v1 + Release
Rama: wp/v10-v1-release
Worktree: C:/S_LAB/.worktrees/v/v-sdk-wp-v10
Reporte: plan/REPORTES/WP-V10-v1-release.md

Lecturas:
- plan/BACKLOG.md WP-V10
- plan/DECISIONES.md DV-05 (publisher = "scriptorium"), DV-08, DV-09
- OUT_DIR SECRETS-NPM-CHECK.md (NPM_USERNAME/PASSWORD ya sembrados)
- R4-V PASS · STANDING_GO

Notas del orquestador:
- WORLD_ROOT=C:/S_LAB/v-sdk · tip: fetch origin/main (~66df08f+)
- ALCANCE: package.json publisher/name/displayName/semver 0.1.0 ·
  .vscodeignore · pipeline package v1 · smoke doc · GUÍA DE PRUEBA ≤10
  pasos · GitHub Release con .vsix (si GO Release implícito standing /
  DV-08: GO Release = v1 — proceder con Release; marketplace deferred)
- publisher canónico: "scriptorium" (NO alephscriptorium-eng)
- extension-id: scriptorium.<name> (elige zigurat o v-sdk; documenta)
- Secrets: usar los sembrados; NO imprimir valores; NO inventar credenciales
- Marketplace: deferred — no publicar a VS Marketplace/Open VSX
- Residuales documentar: smoke z-sdk V07 ⏳ · demo ZEUS_LINEA V08 ⏳
- Hallazgo: .claude/skills/ entró en main por merge Ola C — si toca
  higiene, gitignore espejo sin romper skills locales (opcional en V10)
- CA: .vsix v1 instalable · guía ≤10 pasos · CI+Release run-ids ·
  aviso carril S en reporte
- GIT_* worker-V · NO merge main
- RIESGO_REVISION: independiente

Empieza: worktree · implementa · push · reporte.
```
