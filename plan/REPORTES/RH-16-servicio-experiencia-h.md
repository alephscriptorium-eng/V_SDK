# RH-16 · servicio experiencia H — reporte

| dato | valor |
| ---- | ----- |
| agente | worker-RH-16 |
| fecha | 2026-08-03 |
| rama | `wp/rh-16-experiencia-h` → merge `main` |
| tip base | `7eecfd4` |
| handoff H | tip H `9bfd7ff` · BRIEF+HANDOFF en h-sdk `plan/REPORTES/` |
| eje(s) CA | I, IV · hostil-omite |
| riesgo de revisión | `independiente` |
| revisor distinto del worker | `sí` |
| estado propuesto | listo para aceptación orquestador H / custodio |

## Qué se hizo

- Servicio `ExperienciaHService` sobre `MinimalMcpClient`: descubre server H
  en catálogo (`h-sdk` / `prueba-hm` / capability `h.experiencia`), conecta,
  lista y lee `h-sdk://experiencia/{estado,escena,evidencia}`, valida
  `resourceVersion` `0.1.0` y shapes.
- Fases: `pending` · `connected` · `pending_external_contract` · `error` ·
  `complete`. `pending_external_contract` distinto de connected/complete.
- Anti-stale: `complete` solo si `fresh` (tres lecturas en el mismo refresh).
- Fixtures MCP sintéticos (estado actual H = pending_external; camino
  complete solo sintético declarado).
- Transport MCP de producto H: **`<pendiente>`** (AlmacenResources
  in-process en H). Sin fila/puerto en catálogo → `pending` +
  `transportPending: true`; no se finge connected/complete.

## Archivos clave

- `src/experiencia/types.ts` — URIs, shapes, fases
- `src/experiencia/parse.ts` — parseo + derive phase
- `src/experiencia/discover.ts` — descubrimiento en catálogo
- `src/experiencia/ExperienciaHService.ts` — orquestación
- `src/experiencia/index.ts` — barrel
- `tests/unit/experiencia/fixtureExperienciaH.ts`
- `tests/unit/experiencia/parseExperiencia.test.ts`
- `tests/unit/experiencia/experienciaHService.test.ts`

## Evidencia

```text
identidad-raiz: PASS
WORLD_ROOT=C:/S_LAB/v-sdk · worktree C:/S_LAB/wt/v-rh-16

npx jest tests/unit/experiencia --no-coverage
  Test Suites: 2 passed
  Tests: 17 passed, 1 skipped (skip-honesto transport real)

npx eslint src/experiencia --ext ts → limpio
npm run compile → verde (dist/ gitignored)

grep imports src/experiencia: cero IPlay/ICompany/theatrical; cero path sibling h-sdk
```

## Transport / bloqueos

| ítem | estado |
| ---- | ------ |
| Transport MCP producto H → V | `<pendiente>` (owner H) |
| LORE-HM / provider E / línea tipada / evidencia HUB | `pending_external_contract` (owners externos; visible en fixture) |
| RH-17 vista | no despachado en este chat |

## Prohibiciones respetadas

- Sin import sibling h-sdk
- Sin reutilizar IPlay/ICompany/Teatro como costura
- Sin fingir complete con resources stale
- Sin implementar provider E / línea / evidencia en V
