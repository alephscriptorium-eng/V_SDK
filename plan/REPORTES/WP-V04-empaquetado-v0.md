# WP-V04 · empaquetado-v0 — reporte

| dato | valor |
| ---- | ----- |
| agente | worker-V |
| fecha | 2026-07-25 |
| rama | `wp/v04-empaquetado-v0` |
| riesgo de revisión | `independiente` |
| revisor distinto del worker | `sí` |
| estado propuesto | listo para revisión |

## Qué se hizo

- Script `package:v0` → `dist/zigurat-0.0.1.vsix` (vsce `--no-dependencies`).
- `.vscodeignore` endurecido (excluye plan/, .github/, vibecoding/, etc.).
- CI: `.github/workflows/ci.yml` (lint if-present · compile · test if-present ·
  package v0 · artifact `zigurat-v0-vsix`).
- Smoke local: `code --install-extension dist/zigurat-0.0.1.vsix` →
  `escrivivir-co.scriptorium-vscode-extension` listada.

## Evidencia

```text
Packaged: dist/zigurat-0.0.1.vsix (32 files, 1.22 MB)
SMOKE_INSTALL_OK: ~/.vscode/extensions/escrivivir-co.scriptorium-vscode-extension-0.1.0-scriptorium/
CI run-id: <pendiente tras push — ver cierre orquestador>
```

## Notas

- Publisher sigue `escrivivir-co` (DV-05 `scriptorium` = WP-V10).
- `*.vsix` gitignored — artifact en Actions + path local.
- Secrets NPM: no requeridos para este CI (registry público en npm ci).
- Marketplace: deferred.

## Veredicto revisor

`⏳ pendiente` + run-id CI

---

## Revisión del orquestador

_(pendiente)_
