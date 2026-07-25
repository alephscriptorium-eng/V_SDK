# WP-V07 · identidad-lectura — reporte

| dato | valor |
| ---- | ----- |
| agente | worker-V |
| fecha | 2026-07-25 |
| rama | `wp/v07-identidad-lectura` |
| commits | `e1647492ef9bf1d2087a942e3f3d5ad62854ca3d` |
| eje(s) CA | hostil-omite (sin card / sin seat) |
| riesgo de revisión | `independiente` |
| revisor distinto del worker | `sí` |
| estado propuesto | listo para revisión |

## Qué se hizo

- Join de room → peer-card de autoridad (`RoomIdentityService` +
  `MeshAuthorityTransport`); seat verificado con
  `verifyTravelingPeerCard` de `@zeus/protocol/peer-card-seat` (**cero
  cripto propia**).
- Card de sesión renovada por join (no cacheada como identidad durable);
  `ssbId` visible en status bar + árbol MCP.
- Resources MCP proyectados en estado/UI (`ResourceProjectionService` →
  nodos Resources del árbol; incluye `launcher://info|catalog|ports` +
  `listResources` de servers del catálogo).
- Setting `zigurat.room.id` (vacío = ⏳). Dep runtime `@zeus/protocol@0.4.1`.
- Probe automatizado hostil-omite + expire⇒re-join. Smoke z-sdk vivo:
  **⏳** (mesh/launcher ausentes); código/probes listos.

## Archivos tocados

- `package.json` / `package-lock.json` — `@zeus/protocol`, settings/commands, `probe:v07`
- `src/config/ziguratSettings.ts` — `roomId`
- `src/identity/*` — protocol API, join, status bar (creado)
- `src/resources/*` — proyección MCP resources (creado)
- `src/treeViews/mcpTreeView.ts` — nodos Identidad + Resources
- `src/core/extensionBootstrap.ts` — boot + commands V07
- `scripts/probes/v07-identidad-lectura.mjs` — probe CA (creado)
- `plan/REPORTES/WP-V07-identidad-lectura.md` — este reporte

## Evidencia

```text
identidad-raiz: PASS
PAUSED=false · STANDING_GO=true

npm install @zeus/protocol@0.4.1 → 0.4.1 (registry scriptorium)

npm run compile → verde
  dist/extension.js 5.1mb · Done in ~3504ms

npm run probe:v07 → exit 0
  PASS: hostil-omite sin card → pending_card
  PASS: hostil-omite sin seat → seat_invalid
  PASS: seat vía verifyTravelingPeerCard (API protocol)
  PASS: ssbId visible
  PASS: card renovada por join (joinCount=1)
  PASS: expired ⇒ re-join ejecutado
  PASS: z-sdk protocol visible (read-only)
  ⏳ mesh :3010 ECONNREFUSED
  ⏳ launcher :3050 ECONNREFUSED
  ⏳ flujo join→card→resources contra z-sdk vivo
```

### Keys settings (V07)

| key | uso |
| --- | --- |
| `zigurat.room.id` | room de join (vacío → ⏳) |
| `zigurat.mesh.*` | endpoint de join (V05; vacío → ⏳) |
| `zigurat.launcher.*` | proyección resources (V05/V06) |

## Evidencia de riesgo y contrarrevisión

- `CASOS_ADVERSARIALES`:
  - `[automatizado]` sin card → `pending_card` / sin ssbId
  - `[automatizado]` sin seatSignature → `seat_invalid`
  - `[automatizado]` card expirada → re-join (joinCount↑, card nueva)
  - `[sin verificar]` join vivo contra autoridad z-sdk (runtime ausente)
- `DEPENDENCIAS_DIRECTAS_VERIFICADAS`: `@zeus/protocol@0.4.1` (peer-card +
  peer-card-seat); `@modelcontextprotocol/sdk` (resources); sin cripto local
- `INSTALACION_LIMPIA`: `npm install` en worktree con protocol; compile post-dep
- `TEST_AUTOMATIZADO_VS_EVIDENCIA_MANUAL`:
  - Automatizado: `npm run compile` + `npm run probe:v07`
  - Manual UI: ⏳ sin host IDE / runtime
- `VEREDICTO_REVISOR`: `⏳ pendiente de revisor distinto`

## Auto-revisión

- [x] Diff V07 (identidad + resources + settings room + probe)
- [x] Seat solo vía API protocol
- [x] Hostil-omite: sin card / sin seat → no ready
- [x] Expire ⇒ re-join evidenciado en probe
- [x] Compile verde · push rama WP
- [x] z-sdk SOLO LECTURA; smoke vivo ⏳ honesto
- [x] No BACKLOG / no merge main

## Hallazgos fuera de alcance

- Runtime mesh/launcher z-sdk no estaba arriba en esta sesión → demo
  end-to-end vivo queda ⏳ (DV-07 cuando el custodio levante z-sdk).
- Publisher / marketplace = V10 (no tocado).

## Dudas / bloqueos

Ninguno para CA automatizable. Smoke vivo pendiente de runtime.

---

## Revisión del orquestador

**Aceptado ✅** (2026-07-25 · orquestador-V).

Contrarrevisión: `npm run probe:v07` PASS (hostil-omite + expire⇒re-join
+ seat vía `@zeus/protocol`). Smoke mesh/launcher vivo = ⏳ (hallazgo,
no FAIL). Gate V07: **PASS**.
