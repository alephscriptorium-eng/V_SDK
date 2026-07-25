# ACTA · Gate R6-V + re-release local 0.2.0 · Ola F

| dato | valor |
| ---- | ----- |
| Fecha | 2026-07-25 · sesión debug (gorro custodio→operador, relevo en estación V) |
| Gate | **R6-V — PASS** |
| Artefacto | `dist/aleph-0-0.2.0.vsix` · **28 ficheros · 244,69 KB** |
| sha256 | `3500AC8029B33CA5A3DECBAF7C2342854AC719D6E2657B593A6EC512A4D8480B` |
| Release público | **DEFERRED** (DV-14): sin tag `v0.2.0`, sin Release GitHub; el asset público vigente sigue siendo el v0.1.0 antiguo (no equivalente, anomalía heredada declarada) |

## Higiene §8 (pre-gate)

6 worktrees fusionados retirados con chequeo previo de reparse points
(0 junctions) · 6 ramas `wp/*` borradas tras merge · tag
`archive/pre-poda-ola-f` conservado · sin locks.

## Evidencia de facto (todas por ranura, registradas en EVIDENCIA.md)

| etiqueta | resultado |
| -------- | --------- |
| gate-npm-ci | PASS (lockfile nuevo `sha256:633e3ba1693f4130` tras bump) |
| gate-compile (production) | PASS · bundle 692 KB |
| gate-lint | PASS · 0 errores / 156 warnings (deuda declarada V16, reducida por la poda) |
| gate-jest | **FAIL honesto**: 5/95 — los 5 preexistentes demostrados dos veces contra el tag pre-poda (hueco mock `vscode.window.onDidCloseTerminal`); no son de la ola |
| gate-probe-v07 · v08 (parser real) · v09 | PASS · PASS · PASS |
| gate-package-020 | PASS a la **tercera** pasada — ver incidencias |

## Incidencias del gate (cazadas y cerradas)

1. **R-7 confirmada en vivo**: la primera pasada empaquetó 1,83 MB (30
   ficheros) por el sourcemap del build previo del probe. Purga de
   `dist/` + `compile:production` antes de `package:v1`.
2. **Polizón nuevo**: `.slot.lock/` (el lock del propio slot.sh durante
   el empaquetado) viajaba en el `.vsix`. Cerrado en `.vscodeignore`
   (`.slot.lock/**`, `EVIDENCIA.md`, `**/*.map`) — commit `b7a8729`.
3. `npx` funcionó en el gate (H-2 no reproducido aquí); se mantiene la
   mitigación de `vsix.mjs` y el aviso.

## Instalación y runtime (guía v2, tramo automatizable)

- `scriptorium.zigurat` (id viejo) desinstalado · **`scriptorium.aleph-0@0.2.0` instalada** y listada por `code --list-extensions`.
- Runtime z-sdk local (DV-07): `mcp-launcher` vivo en `:3050/mcp`
  (health ok, catalogSize 14) · `linea-editor` vivo en `:4115/mcp`
  (health ok, 7 tools / 2 resources).
- **Primera verificación del contrato contra servidor VIVO**
  (`resources/read editor://info` por MCP): el payload real publica
  `gate.reparto_required` **literal** (false, declarado) y los **8
  motivos_deny exactos** de los fixtures. El riesgo residual principal
  de WP-V17 («ningún payload real ha pasado por el parser»; hallazgo
  C-2: clave no fijada por contrato) queda **desactivado en los
  hechos**: clave real = clave del parser. La cláusula que lo fije en
  el contrato sigue pedida a Z (nota de cierre).

## ⏳ Deferred / pendiente (declarado, no fingido)

- **Pasos 5–10 de la guía v2** (activación, catálogo en UI, join,
  gate de autoría, deny visible, elenco): exigen Extension Host
  interactivo — **quedan para el ojo del custodio**, con runtime ya
  arrancado y extensión ya instalada. La guía v2 (`docs/GUIA-PRUEBA-v2.md`)
  es el instrumento.
- **Tick público**: equivalencia asset-Release ↔ local + Release
  0.2.0 + endurecimiento de guardas (H-4 + F-1/F-2/F-3) + licencia en
  Release notes — reencolado en el plan de S.
- 5 superficies de marca legada visibles (R-V15-1) → micro-tick V14-familia.
- Ola E (WP-V11 atlas) desbloqueada por **DV-14: R6-V PASS + esta acta**
  — queda ⬜ a criterio del custodio (gitlink = GO DA-S11 aparte).

## Residuales que heredan las olas siguientes

Ver `plan/BACKLOG.md` (filas ✅ de la ola) y
`C:/S_LAB/vigilancia/v/NOTAS-CIERRE-OLA-F.md` (acumulador: nota a Z ·
wishlist método · entorno npx · marca · E-1/E-2 · R-V15-2/3).
