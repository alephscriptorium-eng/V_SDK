# WP-V05 · config-unica — reporte

| dato | valor |
| ---- | ----- |
| agente | worker-V |
| fecha | 2026-07-25 |
| rama | `wp/v05-config-unica` |
| commits | `3514f63` |
| eje(s) CA | hostil-omite (sin settings → ⏳) |
| riesgo de revisión | `independiente` |
| revisor distinto del worker | `sí` |
| estado propuesto | listo para revisión |

## Qué se hizo

Schema workspace `zigurat.*` (mesh host/port/baseUrl, launcher host/port,
ollama.baseUrl) con defaults vacíos/null. Cirugía del censo: eliminados
`http://localhost:3010` en alephscript-client y AracneBotService; flota fija
con `wdir` de otra máquina y puertos inventados en
`mcpConfigurationManager.setDefaultConfiguration`; puerto `3050` en
`processManager.startLauncher`. Helper nuevo `src/config/ziguratSettings.ts`.
Sin settings → modo ⏳ (cliente diferido / launcher no arranca / servers vacíos),
sin crash. Diff solo alcance V05 (no DEFAULT_TASKS ni launcher:// de V06).

## Archivos tocados

- `package.json` — modificado: properties `zigurat.*` en contributes.configuration
- `src/config/ziguratSettings.ts` — creado: lectura tipada + resolve mesh/launcher/ollama
- `src/libs/alephscript-client.ts` — modificado: sin URL default; Socket opcional si ⏳
- `src/core/AracneBotService.ts` — modificado: resuelve zigurat.mesh.*; isPending()
- `src/core/mcpConfigurationManager.ts` — modificado: config vacía pendiente; getters sin fallback inventado
- `src/processManager.ts` — modificado: startLauncher lee zigurat.launcher.port o ⏳
- `plan/REPORTES/WP-V05-config-unica.md` — creado: este reporte

## Evidencia

> No inventes observaciones. Salida literal o `⏳ sin verificar`.

### Identidad + PAUSE

```text
identidad-raiz: PASS
PAUSED=false (ORQUESTADOR-ESTADO.md)
STANDING_GO=true
```

### compile

```text
$ cd C:/S_LAB/.worktrees/v/v-sdk-wp-v05 && npm run compile
> esbuild src/extension.ts --bundle --outfile=dist/extension.js ...
  dist\extension.js      4.8mb
  dist\extension.js.map  7.6mb
Done in 6949ms
(exit 0)
```

### grep — rutas absolutas de máquina (alcance V05) = 0

```text
$ rg -n '/c/Users/|/Users/oracl|C:\\Users\\|/Users/[^/]+/Documents/REPOS' \
  src/libs/alephscript-client.ts src/core/AracneBotService.ts \
  src/core/mcpConfigurationManager.ts src/processManager.ts \
  src/config/ziguratSettings.ts package.json
(0 matches)
```

### grep — puertos hardcodeados fuera de schema (TS V05) = 0

```text
$ rg -n 'localhost:\d+|127\.0\.0\.1:\d+|:\s*30(10|50|01|02|03|12)\b|port:\s*30\d\d|,\s*3050\)|http://localhost:\d+' \
  src/libs/alephscript-client.ts src/core/AracneBotService.ts \
  src/core/mcpConfigurationManager.ts src/processManager.ts \
  src/config/ziguratSettings.ts
(0 matches)
```

### grep — líneas del censo (3010 / 11434 / 3050 / oracl) en TS V05 = 0

```text
$ rg -n '3010|11434|3050|/c/Users/oracl' \
  src/libs/alephscript-client.ts src/core/AracneBotService.ts \
  src/core/mcpConfigurationManager.ts src/processManager.ts
(0 matches)
```

### schema defaults vacíos

```text
zigurat.mesh.host default ""
zigurat.mesh.port default null
zigurat.mesh.baseUrl default ""
zigurat.launcher.host default ""
zigurat.launcher.port default null
zigurat.ollama.baseUrl default ""
```

### hostil-omite (inspección código — sin settings)

- `AracneBotService.initialize()` sin `zigurat.mesh.*` ni socketUrl →
  `pending=true`, `client=undefined`, warn con `⏳`, return (no throw).
- `AlephScriptClient` sin url → no crea `io`, métodos no-op + warn.
- `McpConfigurationManager` sin OperaConfig → `setEmptyPendingConfiguration()`
  (`mcp.servers`/`webs` = `{}`, sin wdir ajenos).
- `ProcessManager.startLauncher` sin `zigurat.launcher.port` → `false` +
  warningMessage `⏳` (no inventa 3050).

## Evidencia de riesgo y contrarrevisión

- `CASOS_ADVERSARIALES`:
  - `[manual]` settings vacíos (defaults schema) → caminos ⏳ arriba; compile
    verde implica activate path no rompe por tipos. Runtime UI ⏳ pendiente de
    revisor con Extension Host.
  - `[automatizado]` greps censo = 0; `npm run compile` exit 0.
- `DEPENDENCIAS_DIRECTAS_VERIFICADAS`: lectura via
  `vscode.workspace.getConfiguration('zigurat')` (built-in API); socket.io-client
  solo si hay URL.
- `INSTALACION_LIMPIA`: `npm ci` en worktree OK (pre-compile).
- `TEST_AUTOMATIZADO_VS_EVIDENCIA_MANUAL`:
  - Automatizado: compile + greps
  - Manual: inspección hostil-omite en código; Extension Host sin settings =
    `⏳ sin verificar` en sesión IDE
- `VEREDICTO_REVISOR`: `⏳ pendiente de revisor distinto`

## Auto-revisión (PRACTICAS del mundo — con honestidad)

- [x] Diff solo dentro de `ALCANCE_DIFF`: package.json configuration + 4 src +
  helper `src/config/` + reporte
- [x] Cero árboles/ficheros copiados de otros mundos sin procedencia
- [x] Sellos con fuente; rutas citadas existentes
- [x] Sin fluff ni promesa de futuro sin `<pendiente>`
- [x] Eje hostil-omite evidenciado (código + greps)
- [x] Gates ejecutados de verdad: compile + greps
- [x] Commits convencionales
- [x] Diff solo del alcance del WP (no V06)
- [x] Riesgo y contraevidencia del brief cubiertos
- [x] Pruebas automatizadas separadas de evidencia manual

## Hallazgos fuera de alcance

- `HackerTasksPanelProvider` / DEFAULT_TASKS con puertos fijos → WP-V06
- `socketsTreeView.ts` fallback UI `localhost:3000` (fuera de alcance V05)
- `configsTreeView.ts` template default `ws://localhost:3000` (fuera V05)
- `src/views/README.md` links file:///c/Users/oracl/... (docs, fuera censo)
- Publisher `escrivivir-co` / DV-05 → WP-V10
- Jest soft / README-SCRIPTORIUM: sin impacto directo en este WP
- Marketplace: deferred

## Dudas / bloqueos

Ninguno. PAUSED=false. No merge a main.

---

## Revisión del orquestador

_(la rellena el orquestador: aceptado ✅ / devuelto con lista numerada)_
