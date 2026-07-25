# WP-V06 · catalogo-dinamico — reporte

| dato | valor |
| ---- | ----- |
| agente | worker-V |
| fecha | 2026-07-25 |
| rama | `wp/v06-catalogo-dinamico` |
| commits | `ac7eb7a3b94cfacfd5de2b92a3e97ea1efc4a890` |
| eje(s) CA | hostil-omite (sin launcher → ⏳) |
| riesgo de revisión | `independiente` |
| revisor distinto del worker | `sí` |
| estado propuesto | listo para revisión |

## Qué se hizo

- Cliente MCP Streamable HTTP bajo `src/launcher/` hacia contrato
  `@zeus/mcp-launcher`: resources `launcher://info|catalog|ports` + tools
  `list_capabilities` / `resolve_capability` (vía `@modelcontextprotocol/sdk`
  ya declarado; **no** se añadió dep npm `@zeus/mcp-launcher`).
- Settings canónicos V05: `zigurat.launcher.port` + `zigurat.launcher.host`
  vía `getZiguratSettings()` (`src/config/ziguratSettings.ts`); sin setting →
  ⏳ `pending_settings`, **cero host/puerto inventado**.
- Árbol MCP y tasks alimentados por `CatalogService`; sin launcher → ⏳.
- `DEFAULT_TASKS` → `FALLBACK_DEFAULT_TASKS_MARKED`.
- **Devolución orquestador:** rebase `origin/main` (V05 ✅) + corrección keys
  flat `launcherPort`/`launcherHost` → nested `launcher.port`/`launcher.host`.

## Archivos tocados

- `src/launcher/types.ts` — keys `zigurat.launcher.port` / `.host`
- `src/launcher/settings.ts` — lectura vía helper V05; host vacío = ⏳
- `src/launcher/LauncherCatalogClient.ts` — mensajes con keys canónicas
- `src/launcher/CatalogService.ts` / `index.ts` — feed (sin cambio keys)
- `src/treeViews/mcpTreeView.ts` — árbol desde catálogo
- `src/views/HackerTasksPanelProvider.ts` — catálogo + fallback marcado
- `src/core/extensionBootstrap.ts` — start CatalogService
- `plan/REPORTES/WP-V06-catalogo-dinamico.md` — este reporte

## Evidencia

```text
identidad-raiz: PASS
PAUSED=false

git rebase origin/main → OK (base 5c11b85 aceptar WP-V05 ✅)

grep keys erróneas en src/launcher:
  (vacío — cero launcherPort/launcherHost)

keys canónicas en types.ts:
  ZIGURAT_LAUNCHER_PORT_KEY = 'zigurat.launcher.port'
  ZIGURAT_LAUNCHER_HOST_KEY = 'zigurat.launcher.host'

settings.ts lee:
  getZiguratSettings() → launcher.port / launcher.host
  (mismo path que package.json contributes.configuration V05)

npm run compile → verde (ver tip)

SMOKE sin launcher (:59999):
  SMOKE_LAUNCHER_ABSENT_OK: fetch failed → pending_launcher / ⏳

schema main (lectura):
  "zigurat.launcher.host" / "zigurat.launcher.port" presentes tras V05
```

### Keys settings (canónicas V05)

| key | uso |
| --- | --- |
| `zigurat.launcher.port` | requerido (null/ausente → ⏳) |
| `zigurat.launcher.host` | requerido (vacío → ⏳; no default 127.0.0.1) |

## Evidencia de riesgo y contrarrevisión

- `CASOS_ADVERSARIALES`:
  - `[automatizado]` launcher ausente → fetch failed / ⏳
  - `[código]` sin `zigurat.launcher.port` o host vacío → `pending_settings`
  - `[sin verificar]` launcher z-sdk vivo con inventario en caliente
- `DEPENDENCIAS_DIRECTAS_VERIFICADAS`: `@modelcontextprotocol/sdk` + helper
  `src/config/ziguratSettings.ts` (V05, solo lectura/consumo)
- `INSTALACION_LIMPIA`: npm ci previo en worktree; compile post-fix
- `TEST_AUTOMATIZADO_VS_EVIDENCIA_MANUAL`:
  - Automatizado: compile + smoke ausente + grep keys
  - Manual UI: ⏳ sin verificar (sin host IDE)
- `VEREDICTO_REVISOR`: `⏳ pendiente de revisor distinto`

## Auto-revisión

- [x] Diff V06 + consumo schema V05 (sin reeditar package.json / lane V05)
- [x] Keys alineadas a `zigurat.launcher.port` / `zigurat.launcher.host`
- [x] Hostil-omite: sin settings/launcher → ⏳
- [x] Compile verde
- [x] Rebase main con V05

## Hallazgos fuera de alcance

- Smoke con launcher z-sdk vivo: ⏳

## Dudas / bloqueos

Ninguno.

---

## Revisión del orquestador

**Aceptado ✅** (2026-07-25 · orquestador-V).

Devolución 1 corregida (keys canónicas V05). Gate V06: **PASS**.
Ola B completa → **R3-V PASS**.
