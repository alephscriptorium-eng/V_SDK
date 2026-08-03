# RH-18 · VSIX experiencia H — reporte

| dato | valor |
| ---- | ----- |
| agente | worker-RH-18 |
| fecha | 2026-08-03 |
| rama | `worker-RH-18` → merge `main` |
| tip base | `f54be58` (RH-17) |
| eje(s) CA | IV · hostil-omite |
| estado propuesto | listo para aceptación orquestador H / custodio |

## Qué se hizo

1. Empaquetado VSIX instalable: `dist/aleph-0-0.2.0.vsix`
   (`npm run package:local` → vsce).
2. Fases UI alineadas a CA RH-18 (distinción visual):
   `connecting` · `connected` · `pending_external_contract` · `failed` ·
   `complete` (renombre desde pending/error; CSS/`data-phase` distintos).
3. Prueba contra H/M reales: **no** — transport MCP producto H→V sigue
   `<pendiente>` (resources in-process en H; sin endpoint en catálogo).
   Evidencia con fixtures MCP + fail-closed `connecting` +
   `transportPending: true`.
4. Anti-stale / anti-inventario: `complete` solo con `fresh`; sin Teatro;
   sin actores/escenas inventados cuando transport falta.

## Artefacto

```text
path: C:\S_LAB\v-sdk\dist\aleph-0-0.2.0.vsix
size: ~300 KB (44 files)
extension-id: scriptorium.aleph-0@0.2.0
install: npm run install:local  # o code --install-extension <path>
```

## Evidencia de estados (fixtures)

| fase | cómo se observa | success fingido? |
| ---- | --------------- | ---------------- |
| `connecting` | catálogo sin H / sin puerto / refresh in-flight; CSS `phase-connecting` | no |
| `pending_external_contract` | fixture MCP estado actual H (gaps E/línea/HUB) | no (`≠ connected/complete`) |
| `connected` | resources frescos sin gaps ni complete | no en H vivo (sin endpoint) |
| `failed` | resource omitido / shape inválido (hostil-omite) | no |
| `complete` | solo fixture sintético fresco declarado | no representa H vivo |

```text
identidad-raiz: PASS · WORLD_ROOT=C:/S_LAB/v-sdk

npx jest tests/unit/experiencia tests/unit/webview/webviewCsp.test.ts \
  tests/unit/core/bootstrap/commands/censoComandos.test.ts --no-coverage
  → 181 passed, 1 skipped (skip-honesto transport real)

npm run lint → 0 errors
npm run compile → verde
npm run package:local → dist/aleph-0-0.2.0.vsix
```

## Transport / bloqueos

| ítem | estado |
| ---- | ------ |
| Transport MCP producto H→V | `<pendiente>` (owner H; AlmacenResources in-process) |
| Endpoint H en catálogo launcher | ausente → `connecting` + `transportPending` |
| LORE-HM / provider E / evidencia HUB | `pending_external_contract` (owners externos) |
| Instalación VSIX en VS Code UI | empaquetado OK; smoke UI manual opcional post-merge |

## Prohibiciones respetadas

- Sin fingir `complete` / `connected` con transport pendiente o resources stale
- Sin Teatro / IPlay / ICompany como costura
- Sin import sibling h-sdk
- Sin inventar actores/escenas
