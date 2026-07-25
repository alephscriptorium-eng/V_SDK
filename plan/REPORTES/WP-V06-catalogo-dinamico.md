# WP-V06 · catalogo-dinamico — reporte

| dato | valor |
| ---- | ----- |
| agente | worker-V |
| fecha | 2026-07-25 |
| rama | `wp/v06-catalogo-dinamico` |
| commits | _(tip post-commit)_ |
| eje(s) CA | hostil-omite (sin launcher → ⏳) |
| riesgo de revisión | `independiente` |
| revisor distinto del worker | `sí` |
| estado propuesto | listo para revisión |

## Qué se hizo

- Cliente MCP Streamable HTTP bajo `src/launcher/` hacia contrato
  `@zeus/mcp-launcher`: resources `launcher://info|catalog|ports` + tools
  `list_capabilities` / `resolve_capability` (vía `@modelcontextprotocol/sdk`
  ya declarado; **no** se añadió dep npm `@zeus/mcp-launcher` — es el
  servidor remoto, no librería cliente).
- Puerto/host leídos de settings esperados `zigurat.launcherPort` /
  `zigurat.launcherHost` (schema V05 aún no en main → sin setting = ⏳
  `pending_settings`, **cero puerto fijo nuevo inventado**).
- Árbol MCP (`mcpTreeView`) y panel tasks alimentados por
  `CatalogService` (poll 15s + refresh comando); sin launcher → nodos/tareas
  ⏳ honestos, no error fatal de activación.
- `DEFAULT_TASKS` degradado a `FALLBACK_DEFAULT_TASKS_MARKED` (marca
  explícita); solo si no hay catálogo ni `tasks.json`.
- Wiring mínimo en `extensionBootstrap` (arranca feed; no toca lane V05).

## Archivos tocados

- `src/launcher/types.ts` — creado: snapshot / keys zigurat.*
- `src/launcher/settings.ts` — creado: lectura settings fail-closed
- `src/launcher/LauncherCatalogClient.ts` — creado: cliente MCP
- `src/launcher/CatalogService.ts` — creado: feed singleton + poll
- `src/launcher/index.ts` — creado: reexport
- `src/treeViews/mcpTreeView.ts` — modificado: árbol desde catálogo
- `src/views/HackerTasksPanelProvider.ts` — modificado: catálogo + fallback marcado
- `src/core/extensionBootstrap.ts` — modificado: start CatalogService + refresh
- `plan/REPORTES/WP-V06-catalogo-dinamico.md` — creado: este reporte

## Evidencia

```text
identidad-raiz: PASS (preflight despacho)
PAUSED=false (OUT_DIR C:/S_LAB/vigilancia/v)

npm run compile
  dist/extension.js  5.1mb
  Done in ~700ms–5s (verde)

SMOKE sin launcher (puerto 59999 sin listener):
  SMOKE_LAUNCHER_ABSENT_OK: fetch failed
  → path de cliente captura error → snapshot pending_launcher / ⏳
    (no throw fatal al caller UI)

Settings sin zigurat.launcherPort:
  → pending_settings + mensaje con key esperada
  → servers[] vacío (no inventa flota 3001–3066)

package.json: sin cambios a contributes.configuration / zigurat.*
  (lane V05). Sin dep nueva @zeus/mcp-launcher.
```

### Keys settings documentadas (⏳ hasta merge V05)

| key | uso |
| --- | --- |
| `zigurat.launcherPort` | requerido para conectar |
| `zigurat.launcherHost` | opcional; si hay port y no host → `127.0.0.1` |

## Evidencia de riesgo y contrarrevisión

- `CASOS_ADVERSARIALES`:
  - `[automatizado]` launcher ausente (connect a :59999) →
    `SMOKE_LAUNCHER_ABSENT_OK: fetch failed` (no flota inventada)
  - `[manual / código]` sin `zigurat.launcherPort` → `pending_settings`
  - `[sin verificar]` launcher z-sdk vivo con inventario en caliente
    (requiere runtime z-sdk local; no arrancado en este WP)
- `DEPENDENCIAS_DIRECTAS_VERIFICADAS`:
  `@modelcontextprotocol/sdk` (ya en package.json) para Client +
  StreamableHTTPClientTransport. Contrato leído SOLO LECTURA en
  `C:/S_LAB/z-sdk/packages/mesh/mcp-launcher`.
- `INSTALACION_LIMPIA`: `npm ci` en worktree → OK (compile posterior verde)
- `TEST_AUTOMATIZADO_VS_EVIDENCIA_MANUAL`:
  - Automatizado: `npm run compile` verde; smoke connect ausente
  - Manual: UI tree/tasks con/sin launcher en VS Code = ⏳ sin verificar
    en este agente (sin host IDE)
- `VEREDICTO_REVISOR`: `⏳ pendiente de revisor distinto`

## Auto-revisión (PRACTICAS del mundo — con honestidad)

- [x] Diff solo dentro de ALCANCE_DIFF V06 (launcher + treeViews + tasks +
      bootstrap wiring; sin V05 files / sin schema zigurat.*)
- [x] Cero copia de árboles ajenos
- [x] Sellos con fuente; z-sdk solo lectura
- [x] Sin promesa de flota sin launcher
- [x] Eje hostil-omite: sin launcher → ⏳
- [x] Gate compile ejecutado de verdad
- [x] Commits convencionales (post-commit)
- [x] Riesgo independiente dejado a revisor distinto
- [x] Automatizado vs manual separados arriba

## Hallazgos fuera de alcance

- Schema `zigurat.*` aún no en main (V05 paralelo) — documentado, no inventado.
- Jest soft / README-SCRIPTORIUM: sin impacto directo en este WP.
- Smoke con launcher z-sdk vivo: ⏳ (runtime no levantado aquí).

## Dudas / bloqueos

- Ninguno bloqueante. Dep implícita: merge V05 para que el setting exista
  en contributes.configuration; hasta entonces el usuario puede setear
  `zigurat.launcherPort` en settings.json user/workspace y el cliente lo lee.

---

## Revisión del orquestador

_(la rellena el orquestador: aceptado ✅ / devuelto con lista numerada)_
