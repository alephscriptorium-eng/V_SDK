# WP-V09 · elenco-separacion — reporte

| dato | valor |
| ---- | ----- |
| agente | worker-V |
| fecha | 2026-07-25 |
| rama | `wp/v09-elenco-separacion` |
| commits | `bbbfd2185201686d08137bc59cd5c8aa05cef1a4` |
| eje(s) CA | hostil-omite (sin path / shape inválido / ICompany≠reparto) |
| riesgo de revisión | `independiente` |
| revisor distinto del worker | `sí` |
| estado propuesto | listo para revisión |

## Qué se hizo

- Panel elenco (`alephscript.elenco`) alimentado por `reparto/1` vía
  `filasCastDesdeReparto` de `@zeus/reparto-kit@0.1.0` (reutiliza proyección
  cast-table; no reimplementa el mapper).
- Consumo verificado del widget `cast-table` de `@zeus/view-kit` (alias
  `panel-elenco`) con las mismas filas (probe).
- `ICompany` documentado y marcado como Modelo B SEPARADO de `reparto/1`
  (`src/elenco/DOS-MODELOS.md` + comentario en `ICompany.ts`).
- Setting `zigurat.reparto.path` (vacío → ⏳). Fixture demo
  `fixtures/reparto-v1-demo.json`.
- Cero superficie V08 (`linea-editor` / `motivos_deny` / `editor://info`)
  en código de elenco. z-sdk SOLO LECTURA.

## Archivos tocados

- `package.json` / `package-lock.json` — `@zeus/reparto-kit`, view
  `alephscript.elenco`, command/setting, `probe:v09`
- `src/elenco/*` — servicio, TreeView, tipos, DOS-MODELOS (creado)
- `src/config/ziguratSettings.ts` — `repartoPath`
- `src/core/extensionBootstrap.ts` — boot + TreeView + command refresh
- `src/theatrical/core/interfaces/ICompany.ts` — marca separación
- `fixtures/reparto-v1-demo.json` — fixture `reparto/1` (creado)
- `scripts/probes/v09-elenco-separacion.mjs` — probe CA (creado)
- `plan/REPORTES/WP-V09-elenco-separacion.md` — este reporte

## Evidencia

```text
identidad-raiz: PASS
WORLD_ROOT=C:/S_LAB/v-sdk · CANONICAL=C:/S_LAB/v-sdk
READ_ONLY_ROOTS=["C:/S_LAB/.worktrees","C:/S/scriptorium/codebase"]
DOWNSTREAM_PATTERNS=[".worktrees/*","codebase/*"]

git fetch origin/main → tip 5d95257
worktree C:/S_LAB/.worktrees/v/v-sdk-wp-v09 · rama wp/v09-elenco-separacion

npm install @zeus/reparto-kit@0.1.0 → ok (registry scriptorium)

npm run compile → verde
  dist/extension.js 5.1mb · Done in ~19873ms

npm run probe:v09 → exit 0
  PASS: REPARTO_VERSION = reparto/1
  PASS: hostil-omite sin reparto → pending_reparto
  PASS: hostil-omite shape inválido → pending_shape
  PASS: proyección ok desde reparto/1
  PASS: filasCastDesdeReparto → schema cast-table
  PASS: fixture → filas cast-table
  PASS: separación: ICompany-like NO es reparto/1
  PASS: DOS-MODELOS documenta ambos modelos
  PASS: CAST_TABLE_WIDGET_IDS = cast-table + panel-elenco
  PASS: view-kit cast-table renderiza filas
  PASS: z-sdk RO: filas.mjs visible
  PASS: V09 no toca superficie V08 en *.ts
```

### Keys settings (V09)

| key | uso |
| --- | --- |
| `zigurat.reparto.path` | JSON `reparto/1` → panel elenco (vacío → ⏳) |

## Evidencia de riesgo y contrarrevisión

- `CASOS_ADVERSARIALES`:
  - `[automatizado]` sin reparto → `pending_reparto`
  - `[automatizado]` shape inválido → `pending_shape`
  - `[automatizado]` objeto ICompany-like → no proyecta filas
  - `[sin verificar]` UI TreeView en host IDE vivo
- `DEPENDENCIAS_DIRECTAS_VERIFICADAS`: `@zeus/reparto-kit@0.1.0`
  (`filas`/`tipos`); consumo RO de `@zeus/view-kit` cast-table en probe;
  `@zeus/protocol` (transitiva shape ssbId)
- `INSTALACION_LIMPIA`: `npm install @zeus/reparto-kit@0.1.0` en worktree
- `TEST_AUTOMATIZADO_VS_EVIDENCIA_MANUAL`:
  - Automatizado: `npm run compile` + `npm run probe:v09`
  - Manual UI: ⏳ sin host IDE en esta sesión
- `VEREDICTO_REVISOR`: `⏳ pendiente de revisor distinto`

## Auto-revisión (PRACTICAS del mundo — con honestidad)

- [x] Diff solo alcance V09 (elenco / settings reparto / docs separación)
- [x] z-sdk SOLO LECTURA
- [x] Dos modelos documentados; ICompany no fusionado con reparto/1
- [x] Panel desde `filasCastDesdeReparto` + schema cast-table
- [x] Hostil-omite evidenciado en probe
- [x] Compile verde · push rama WP
- [x] Prohibido V08 respetado en código elenco
- [x] No BACKLOG / no merge main

## Hallazgos fuera de alcance

- UI live del TreeView en Extension Host queda ⏳ (smoke manual).
- Path de reparto es fichero local; fetch runtime desde mesh/resources = WP futuro si el orquestador lo pide.

## Dudas / bloqueos

Ninguno para CA automatizable.

---

## Revisión del orquestador

**Aceptado ✅** (2026-07-25 · orquestador-V).

probe:v09 PASS. Gate V09: **PASS**. Ola C → **R4-V PASS**.
