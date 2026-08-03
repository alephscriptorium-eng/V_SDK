# RH-17 · vista experiencia H — reporte

| dato | valor |
| ---- | ----- |
| agente | worker-RH-17 |
| fecha | 2026-08-03 |
| rama | `wp/rh-17-vista-experiencia` → merge `main` |
| tip base | `f12ac76` (RH-16) |
| eje(s) CA | I · vista data-driven sin Teatro |
| estado propuesto | listo para aceptación orquestador H / custodio |

## Qué se hizo

- TreeView `alephscript.experiencia` (diagnóstico) + webview
  `alephscript.experiencia.webview` (experiencia).
- Render data-driven desde `ExperienciaHService` / `ExperienciaSession`:
  Ciudad, escena (tipos `@zeus/arg-view-kit` si hay geometría; sin inventar
  stage 3D), M, Ónfalo, análisis, línea, evidencia.
- Fases visibles: `pending` · `connected` · `pending_external_contract` ·
  `error` · `complete`.
- Comandos = tools MCP (`listTools` / `callTool` en `MinimalMcpClient`);
  `aleph0.experiencia.refresh` · `aleph0.experiencia.callTool`.
- CSP/nonce vía `webview/security` (punto de render censado WP-V66).
- Teatro hardcodeado fuera del cambio; cero import sibling h-sdk.

## Archivos clave

- `src/experiencia/view/ExperienciaSession.ts`
- `src/experiencia/view/ExperienciaTreeDataProvider.ts`
- `src/experiencia/view/ExperienciaWebViewProvider.ts`
- `src/experiencia/view/renderExperienciaDocument.ts`
- `src/experiencia/view/experienciaModel.ts`
- `src/experiencia/view/escenaPanel.ts`
- `tests/unit/experiencia/experienciaView.test.ts`

## Evidencia

```text
identidad-raiz: PASS · WORLD_ROOT=C:/S_LAB/v-sdk

npx jest tests/unit/experiencia tests/unit/webview/webviewCsp.test.ts \
  tests/unit/core/bootstrap/commands/censoComandos.test.ts --no-coverage
  → 180 passed, 1 skipped

npm run lint → 0 errors
npm run compile → verde
```

## Gaps (no rellenados)

| ítem | estado |
| ---- | ------ |
| Transport MCP producto H→V | `<pendiente>` (owner H) |
| Geometría ArgViewScene en resource escena | ausente en H 0.1.0 → stage ⏳ |
| Provider E / línea / evidencia HUB | `pending_external_contract` visible |
| createDeltaStage THREE en webview | diferido (tipos sí; runtime 3D no en este WP) |

## Prohibiciones respetadas

- Sin import sibling h-sdk
- Sin Teatro/IPlay/ICompany como costura
- Sin fingir complete / sin implementar E/HUB en V
