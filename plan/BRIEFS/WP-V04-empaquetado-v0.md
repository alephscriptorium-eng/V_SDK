# BRIEF · WP-V04 · Empaquetado v0 + CI

```text
(rol) swarm-orquestacion/reference/roles/WORKER.md

WP: WP-V04 · Empaquetado v0 + CI
Rama: wp/v04-empaquetado-v0
Worktree: C:/S_LAB/.worktrees/v/v-sdk-wp-v04
Reporte: plan/REPORTES/WP-V04-empaquetado-v0.md

Lecturas:
- plan/BACKLOG.md (WP-V04) · R1-V PASS
- package.json scripts package/compile
- DV-05 publisher canónico = WP-V10 (v0 puede conservar publisher actual)
- Eje: empaquetado / CI

Notas del orquestador:
- STANDING_GO=true · R1-V PASS → Ola A autorizada
- ALCANCE_DIFF = .github/workflows/ci.yml · scripts package · dist/ (artifact
  local no commitear *.vsix si gitignore) · REPORTES smoke
- CA: vsce package → dist/zigurat-0.0.x.vsix · smoke
  code --install-extension · CI verde con run-id
- *.vsix en .gitignore — documentar path local + Actions artifact
- NO marketplace · NO secrets NPM salvo que CI lo exija (entonces
  documentar bloqueo; no sembrar)
- RIESGO_REVISION: independiente
- REVISOR_DISTINTO_WORKER: sí

Empieza: worktree → ci.yml → vsce package → smoke → push → verificar
Actions run-id → reporte.
```
