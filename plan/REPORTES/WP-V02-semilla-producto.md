# WP-V02 · semilla-producto — reporte

| dato | valor |
| ---- | ----- |
| agente | worker-V |
| fecha | 2026-07-25 |
| rama | `wp/v02-semilla-producto` |
| commits | merge tip `ecedaa2` · seed `793de5e9252736edd9924a8b1bf189305c00b9f8` |
| tag | `import/scriptorium-793de5e92527` |
| eje(s) CA | ninguno I–V |
| riesgo de revisión | `independiente` |
| revisor distinto del worker | `sí` |
| estado propuesto | listo para revisión |

## Qué se hizo

- Fetch + merge `--allow-unrelated-histories` de
  `escrivivir-co/vscode-alephscript-extension` @ `integration/beta/scriptorium`.
- Tag anotado `import/scriptorium-793de5e92527` → tip semilla (DV-03).
- Conflictos resueltos: producto seed (`package.json`/`lock`); `.gitignore`
  unión; README misión V + `README-LEGACY-EXTENSION.md` (README seed).
- `repository.url` → `alephscriptorium-eng/V_SDK`.
- `plan/` preservado.
- README-SCRIPTORIUM.md huérfano: **no hallado** tras búsqueda (ver abajo).

## Archivos tocados (alto nivel)

- Árbol producto semilla (src/, media/, scripts, PLANIFICACION/, …)
- `.gitignore`, `README.md`, `README-LEGACY-EXTENSION.md`, `package.json`
- `plan/REPORTES/WP-V02-semilla-producto.md`

## Evidencia

```text
seed tip: 793de5e9252736edd9924a8b1bf189305c00b9f8
tag: import/scriptorium-793de5e92527
ANCESTOR_OK: merge-base --is-ancestor 793de5e… HEAD → 0
.gitignore: node_modules/ coverage/ dist/ out/ *.vsix .DS_Store

README-SCRIPTORIUM.md búsqueda (no inventado):
- tip seed: ausente (gh contents 404)
- codebase/a-sdk/VsCodeExtension: gitlink vacío (no checkout)
- cantera 01-VsCodeExtension.md marca ✅ path pero fichero no en tip
- find S_LAB + codebase (excl. node_modules): solo o-sdk README-SCRIPTORIUM
  (Oasis Network — otro producto)
→ <pendiente> incorporar si aparece copia fiel; no bloquea CA tip+tag+árbol
```

## Evidencia de riesgo y contrarrevisión

- `CASOS_ADVERSARIALES`:
  - `[automatizado]` ancestor seed en HEAD
  - `[manual]` plan/ sigue en árbol; sin gitlink a-sdk
- `DEPENDENCIAS_DIRECTAS_VERIFICADAS`:
  - `@alephscript/mcp-core-sdk`: `file:../MCPGallery/...` (roto standalone;
    alcance **WP-V03**)
- `INSTALACION_LIMPIA`: `no aplica` V02 (CA = import); V03
- `VEREDICTO_REVISOR`: `⏳ pendiente`

## Hallazgos fuera de alcance

- Dep `file:../MCPGallery` → WP-V03
- Publisher `escrivivir-co` aún en package.json → DV-05 / WP-V10
- coverage/ trackeado en semilla (gitignore lo cubre a futuro)
- README-SCRIPTORIUM huérfano no localizado → candidato idle

## Dudas / bloqueos

- Ninguno bloqueante para CA V02 (tip+tag+árbol+procedencia).
- Secrets NPM: no necesarios en V02.

---

## Revisión del orquestador

_(pendiente)_
