# WP-V10 · v1-release — reporte

| dato | valor |
| ---- | ----- |
| agente | worker-V |
| fecha | 2026-07-25 |
| rama | `wp/v10-v1-release` |
| commits | obra `f11ffda` · reporte `29c2759` · tip = HEAD rama |
| tip SHA | `5773b736029c03f945fd5b27a1e0169223484e16` (HEAD al escribir; commits docs posteriores solo tip) |
| extension-id | `scriptorium.zigurat` |
| vsix | `scriptorium-zigurat-0.1.0.vsix` (semver **0.1.0**) |
| eje(s) CA | ninguno (checkpoint release) |
| riesgo de revisión | `independiente` |
| revisor distinto del worker | `sí` |
| estado propuesto | listo para revisión |

## Qué se hizo

- `package.json`: `publisher="scriptorium"` (DV-05), `name="zigurat"`,
  `displayName="Zigurat"`, `version="0.1.0"` → extension-id
  `scriptorium.zigurat` (elegido frente a `v-sdk`).
- `.vscodeignore` endurecido (excluye `plan/`, `.github/`, `.claude/`,
  `scripts/`, `fixtures/`, `docs/`, fuentes TS, etc.).
- Pipeline v1: `npm ci` → `compile:production` → `vsce package`
  (`npm run package:v1` → `dist/scriptorium-zigurat-0.1.0.vsix`).
- CI actualizado + workflow **Release** (tag `v*`); marketplace **deferred**
  (DV-10) — no VS Marketplace / Open VSX.
- Guía de prueba ≤10 pasos: `docs/GUIA-PRUEBA-v1.md` (también abajo).
- Smoke local: install `.vsix` → `scriptorium.zigurat@0.1.0` listada;
  probes V07/V08/V09 automatizados PASS; smokes vivos V07/V08 ⏳.
- **Aviso carril S / vigía-S:** tick de validación del `.vsix` v1 pendiente
  en el plan de S (DV-06 / gate post-v1). Carril V no opera el tick.

## Archivos tocados

- `package.json` — publisher/name/displayName/semver + `package:v1` + ids install
- `.vscodeignore` — endurecido v1
- `.github/workflows/ci.yml` — auth NPM (nombres secret) + package v1 artifact
- `.github/workflows/release.yml` — GitHub Release + adjunto `.vsix` (creado)
- `docs/GUIA-PRUEBA-v1.md` — guía custodio ≤10 pasos (creado)
- `plan/REPORTES/WP-V10-v1-release.md` — este reporte

## GUÍA DE PRUEBA (custodio · ≤10 pasos)

Runtime: `C:\S_LAB\z-sdk` (DV-07). Artifact:
https://github.com/alephscriptorium-eng/V_SDK/releases/tag/v0.1.0

Settings ejemplo:

```json
{
  "zigurat.mesh.host": "127.0.0.1",
  "zigurat.mesh.port": 3010,
  "zigurat.launcher.host": "127.0.0.1",
  "zigurat.launcher.port": 3050,
  "zigurat.room.id": "<room-zeus-local>",
  "zigurat.reparto.path": "<ruta>/fixtures/reparto-v1-demo.json"
}
```

1. Descargar `scriptorium-zigurat-0.1.0.vsix` del Release `v0.1.0`.
2. `code --install-extension scriptorium-zigurat-0.1.0.vsix` (quitar legado
   `escrivivir-co.scriptorium-vscode-extension` si existe).
3. Pegar settings de ejemplo en el workspace de prueba.
4. Reload Window → comprobar `scriptorium.zigurat` activa.
5. Arrancar mesh/launcher en z-sdk local (~3010 / ~3050).
6. `Zigurat: Refresh MCP resource projection` → catálogo en caliente u ⏳.
7. `Zigurat: Join room (peer-card)` → `ssbId` o ⏳ (residual V07 smoke vivo).
8. `Zigurat: Refresh authorship gate` → `motivos_deny` desde `editor://info`.
9. `Zigurat: crear_linea (gated)` sin card/reparto → **deny** visible, sin
   escritura (demo `ZEUS_LINEA_*` = residual V08 ⏳).
10. `Zigurat: Refresh elenco` con path fixture → filas cast-table ≠ ICompany.

## Evidencia

```text
identidad-raiz: PASS
WORLD_ROOT=C:/S_LAB/v-sdk · CANONICAL=C:/S_LAB/v-sdk
READ_ONLY_ROOTS=["C:/S_LAB/.worktrees","C:/S/scriptorium/codebase"]
DOWNSTREAM_PATTERNS=[".worktrees/*","codebase/*"]

tip base origin/main @ b5a5f87 (R4-V PASS; brief citaba ~66df08f+)
worktree C:/S_LAB/.worktrees/v/v-sdk-wp-v10 · rama wp/v10-v1-release

npm ci → exit 0
npm run package:v1 → Packaged: dist/scriptorium-zigurat-0.1.0.vsix (32 files, 1.27 MB)
extension-id: scriptorium.zigurat

SMOKE_INSTALL_OK:
  code --install-extension dist/scriptorium-zigurat-0.1.0.vsix
  → scriptorium.zigurat@0.1.0

npm run probe:v07 → PASS automatizado
  ⏳ mesh :3010 ECONNREFUSED · launcher :3050 ECONNREFUSED
  ⏳ flujo join→card→resources z-sdk vivo

npm run probe:v08 → PASS automatizado (deny sin escritura OK)
  ⏳ linea-editor :4115 ECONNREFUSED
  ⏳ ZEUS_LINEA_EDITOR_REQUIRE_REPARTO / demo verde-rojo

npm run probe:v09 → PASS

CI run-id PASS: 30158827844
  https://github.com/alephscriptorium-eng/V_SDK/actions/runs/30158827844
Release run-id PASS: 30158829091
  https://github.com/alephscriptorium-eng/V_SDK/actions/runs/30158829091
GitHub Release: https://github.com/alephscriptorium-eng/V_SDK/releases/tag/v0.1.0
  asset: scriptorium-zigurat-0.1.0.vsix

Secrets: NPM_USERNAME + NPM_PASSWORD usados en CI/Release (nombres only; sin valores).
Marketplace: NO publicado (DV-10 deferred).
```

### Residuales documentados (OK ⏳)

| residual | estado |
| -------- | ------ |
| Smoke z-sdk vivo V07 (join→card→resources) | ⏳ mesh/launcher ausentes en sesión worker |
| Demo ZEUS_LINEA / REQUIRE_REPARTO V08 | ⏳ runtime linea-editor ausente |
| Higiene `.claude/skills/` en main (Ola C) | ⏳ hallazgo: skills entraron por merge; **no** se añadió gitignore espejo en V10 para no romper skills locales de estación; candidato higiene post-v1 |

## Evidencia de riesgo y contrarrevisión

- `CASOS_ADVERSARIALES`:
  - `[automatizado]` V07/V08 hostil-omite (probes)
  - `[manual]` install `.vsix` → extension-id correcto
  - `[sin verificar]` UI deny toast en host IDE vivo con linea-editor
- `DEPENDENCIAS_DIRECTAS_VERIFICADAS`: sin bump runtime; packaging
  `--no-dependencies`; registry auth CI vía secrets sembrados
- `INSTALACION_LIMPIA`: `npm ci` local + CI/Release
- `TEST_AUTOMATIZADO_VS_EVIDENCIA_MANUAL`:
  - Automatizado: `package:v1` + probes V07/V08/V09 + CI/Release
  - Manual: install CLI OK; guía custodio para activación/catálogo/deny
- `VEREDICTO_REVISOR`: `⏳ pendiente de revisor distinto`

## Auto-revisión (PRACTICAS del mundo — con honestidad)

- [x] Diff solo alcance V10 (package/ignore/CI/Release/guía/reporte)
- [x] publisher canónico `scriptorium` (no alephscriptorium-eng)
- [x] semver 0.1.0 · .vsix instalable · guía ≤10 pasos
- [x] Marketplace no tocado
- [x] Secrets no impresos
- [x] Residuales V07/V08 + higiene skills documentados ⏳
- [x] CI + Release run-ids + aviso vigía-S
- [x] No BACKLOG / no merge main
- [x] Commits convencionales · GIT_* worker-V

## Hallazgos fuera de alcance

- Annotation GHA: Node 20 deprecated en runners (forzado a 24) — bump
  `node-version` post-v1 si el orquestador lo pide.
- Test legado sigue soft (`continue-on-error`); annotation exit 1 en test
  no tumba el job (mismo patrón V04).
- Higiene `.claude/skills/` en main (gitignore espejo) diferida.

## Dudas / bloqueos

Ninguno para CA de V10. Tick vigía-S = frontera carril S.

## Aviso · carril S (vigía)

**Para vigía-S / plan S:** `.vsix` v1 publicado en GitHub Release
`v0.1.0` (`scriptorium.zigurat@0.1.0`). Solicitar **tick de validación**
del artifact (DV-06 bloquea atlas WP-V11 hasta ese tick). Carril V no
ejecuta el tick.

## Entrega worker

| campo | valor |
| ----- | ----- |
| veredicto propuesto | **PASS** (CA automatizable + Release; residuales ⏳ documentados) |
| SHA tip rama | `5773b736029c03f945fd5b27a1e0169223484e16` |
| versión vsix | `0.1.0` · `scriptorium-zigurat-0.1.0.vsix` |
| CI | https://github.com/alephscriptorium-eng/V_SDK/actions/runs/30158827844 |
| Release | https://github.com/alephscriptorium-eng/V_SDK/releases/tag/v0.1.0 |
| Release run | https://github.com/alephscriptorium-eng/V_SDK/actions/runs/30158829091 |
| merge main | **NO** (orquestador post-✅) |

---

## Revisión del orquestador

_(la rellena el orquestador: aceptado ✅ / devuelto con lista numerada)_
