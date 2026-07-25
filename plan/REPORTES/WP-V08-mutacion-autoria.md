# WP-V08 · mutacion-autoria — reporte

| dato | valor |
| ---- | ----- |
| agente | worker-V |
| fecha | 2026-07-25 |
| rama | `wp/v08-mutacion-autoria` |
| commits | `80c75b1b49964fef82a7206c27080db6abdd515e` |
| eje(s) CA | hostil-omite (sin editor://info / sin motivos_deny) |
| riesgo de revisión | `independiente` |
| revisor distinto del worker | `sí` |
| estado propuesto | listo para revisión |

## Qué se hizo

- Tools de mutación/autoría hacia `@zeus/linea-editor`: `crear_linea` y
  `export_story_board` vía MCP Streamable HTTP, con **gate visible** en
  árbol MCP + mensajes de error (gate_line, rule, motivo).
- `motivos_deny` **leídos de `editor://info` en runtime**
  (`parseEditorInfo` / `AuthorshipService.refreshGate`) — **cero hardcode**
  de la lista de 8; la lista del servidor manda (probe N=2).
- Deny sin efecto colateral: heurística `isDeniedWithoutWrite` + UI que
  no asume escritura; comando muestra gate textual al denegar.
- Endpoint: settings `zigurat.lineaEditor.*` o catálogo launcher
  (`linea-editor`); sin inventar puerto 4115.
- Probe `scripts/probes/v08-mutacion-autoria.mjs` + `npm run probe:v08`.
- Smoke vivo con `ZEUS_LINEA_EDITOR_REQUIRE_REPARTO`: **⏳** (runtime
  ausente en sesión). z-sdk **SOLO LECTURA**. Sin panel elenco/cast/ICompany.

## Archivos tocados

- `src/mutation/*` — client MCP, parse editor://info, AuthorshipService (creado)
- `src/config/ziguratSettings.ts` — `lineaEditor.host/port`
- `src/identity/RoomIdentityService.ts` — `getSessionCardRaw()` para autoría
- `src/treeViews/mcpTreeView.ts` — nodos Autoría (gate + motivos runtime)
- `src/core/extensionBootstrap.ts` — boot + commands V08
- `package.json` — commands/settings/script `probe:v08`
- `scripts/probes/v08-mutacion-autoria.mjs` — probe CA (creado)
- `plan/REPORTES/WP-V08-mutacion-autoria.md` — este reporte

## Evidencia

```text
identidad-raiz: PASS
PAUSED=false · STANDING_GO=true (despacho)

npm install → exit 0
npm run compile → verde
  dist/extension.js 5.1mb · Done in ~15262ms

npm run probe:v08 → exit 0
  PASS: hostil-omite sin editor://info → sin motivos
  PASS: hostil-omite sin motivos_deny → pending (no inventa 8)
  PASS: 8 motivos desde runtime (fixture editor://info)
  PASS: lista del servidor manda (N=2)
  PASS: deny sin efecto escritura
  PASS: código V08 no hardcodea array motivos_deny de 8
  PASS: commands + settings + cero fuga V09
  ⏳ linea-editor 127.0.0.1:4115 ECONNREFUSED
  ⏳ ZEUS_LINEA_EDITOR_REQUIRE_REPARTO ausente — demo verde/rojo pendiente
```

### Keys settings (V08)

| key | uso |
| --- | --- |
| `zigurat.lineaEditor.host` | override host linea-editor (vacío → catálogo) |
| `zigurat.lineaEditor.port` | override puerto (vacío → catálogo / ⏳) |
| `zigurat.launcher.*` | resolución vía catálogo `linea-editor` |

## Evidencia de riesgo y contrarrevisión

- `CASOS_ADVERSARIALES`:
  - `[automatizado]` sin `editor://info` → motivos vacíos / pending
  - `[automatizado]` sin `motivos_deny` → no inventa los 8
  - `[automatizado]` deny payload sin `lineDir` → sin efecto escritura
  - `[sin verificar]` demo verde/rojo vivo con
    `ZEUS_LINEA_EDITOR_REQUIRE_REPARTO` (runtime ausente)
- `DEPENDENCIAS_DIRECTAS_VERIFICADAS`: `@modelcontextprotocol/sdk`
  (resources/tools); consumo contrato z-sdk SOLO LECTURA; sin deps nuevas npm
- `INSTALACION_LIMPIA`: `npm install` en worktree + compile
- `TEST_AUTOMATIZADO_VS_EVIDENCIA_MANUAL`:
  - Automatizado: `npm run compile` + `npm run probe:v08`
  - Manual UI / smoke REQUIRE_REPARTO: ⏳
- `VEREDICTO_REVISOR`: `⏳ pendiente de revisor distinto`

## Auto-revisión (PRACTICAS del mundo — con honestidad)

- [x] Diff solo dentro de ALCANCE_DIFF V08 (mutation + gate UI + probes)
- [x] z-sdk SOLO LECTURA; cero obra elenco/cast/ICompany (V09)
- [x] motivos_deny desde runtime; sellos con evidencia probe
- [x] Hostil-omite evidenciado; demo REQUIRE_REPARTO = ⏳ honesto
- [x] Compile verde · probe:v08 PASS · push rama WP
- [x] No BACKLOG / no merge main

## Hallazgos fuera de alcance

- Runtime linea-editor / flag `ZEUS_LINEA_EDITOR_REQUIRE_REPARTO` no
  estaban arriba → demo verde/rojo end-to-end queda ⏳ (custodio DV-07).
- Panel elenco / ICompany = V09 (no tocado).

## Dudas / bloqueos

Ninguno para CA automatizable. Smoke vivo pendiente de runtime.

---

## Revisión del orquestador

_(la rellena el orquestador: aceptado ✅ / devuelto con lista numerada)_
