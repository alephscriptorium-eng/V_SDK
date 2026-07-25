# WP-V03 · deps-standalone — reporte

| dato | valor |
| ---- | ----- |
| agente | worker-V |
| fecha | 2026-07-25 |
| rama | `wp/v03-deps-standalone` |
| eje(s) CA | deps / higiene DX |
| riesgo de revisión | `independiente` |
| revisor distinto del worker | `sí` |
| estado propuesto | listo para revisión |

## Qué se hizo

- Sustituido `@alephscript/mcp-core-sdk` `file:../MCPGallery/...` →
  registry `1.3.0` (`https://npm.scriptorium.escrivivir.co`).
- Regenerado `package-lock.json` (resolved registry tgz).
- Higiene DX:
  - `debug:view` → `code --extensionDevelopmentPath=. --new-window`
    (eliminado path `c:/Users/oracl/...`).
  - `uninstall:local|insiders` →
    `escrivivir-co.scriptorium-vscode-extension` (antes
    `arrakis-theater.arrakis-theater-chat`).
- CA: `npm ci` limpio OK · `npm run compile` verde → `dist/extension.js`.

## Evidencia

```text
mcp-core-sdk resolved:
  https://npm.scriptorium.escrivivir.co/@alephscript/mcp-core-sdk/-/mcp-core-sdk-1.3.0.tgz
file: en package.json: ausente
MCPGallery en lock: ausente
npm ci: added 1536 packages (exit 0)
npm run compile: Done in ~5408ms · dist/extension.js 4.8mb
```

## Evidencia de riesgo y contrarrevisión

- `DEPENDENCIAS_DIRECTAS_VERIFICADAS`: mcp-core-sdk 1.3.0 desde registry
  (pin = versión del tarball semilla).
- `INSTALACION_LIMPIA`: `npm ci` sin hermanos externos — PASS
- `TEST_AUTOMATIZADO_VS_EVIDENCIA_MANUAL`:
  - Automatizado: npm ci + compile
  - Manual: scripts debug/uninstall inspeccionados
- `VEREDICTO_REVISOR`: `PASS` (orquestador-V)

## Hallazgos

- `@alephscript/skills-scriptorium` quedó en package.json (estación;
  presente desde merge V02). No bloquea.
- Publisher sigue `escrivivir-co` (DV-05/`scriptorium` = WP-V10).
- Secrets NPM: **no sembrados**. Registry público del taller respondió
  sin credenciales en esta sesión. Si CI futuro exige auth, documentar
  `NPM_USERNAME`/`NPM_PASSWORD` (DV-09) — no V03.

## Dudas / bloqueos

- Ninguno para CA V03.

---

## Revisión del orquestador

**Aceptado ✅** (2026-07-25 · orquestador-V).

Contrarrevisión: registry resolve, cero file:/MCPGallery, npm ci +
compile verdes, scripts DX corregidos. Gate V03: **PASS**.
Ola 0 completa → **R1-V PASS** (evidencia V01–V03).
