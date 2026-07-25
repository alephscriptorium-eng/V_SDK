# Aleph-0 · ℵ₀

**Aleph-0: host IDE de la ciudad — consumidor opt-in del contrato Z**

Extensión de VS Code que consume el contrato Z de la ciudad: identidad
(peer-card), catálogo MCP, autoría y elenco. Se instala desde el `.vsix`;
todavía **no** está publicada en ningún marketplace (deferred, DV-10).

Repo canónico: [`alephscriptorium-eng/V_SDK`](https://github.com/alephscriptorium-eng/V_SDK)

Plan y gobierno: [`plan/`](./plan/). Meta del carril: `.vsix` v1
contract-compliant lista para probar.

Semilla de producto importada desde
`escrivivir-co/vscode-alephscript-extension` @ `integration/beta/scriptorium`
(DV-03: historial preservado; tag `import/scriptorium-*`). El README legado
de la extensión se podó en WP-V13; queda en el historial y en el tag
`archive/pre-poda-ola-f`.

## Fronteras

- **z-sdk** y OASIS: solo lectura (contrato / referencia).
- Sin gitlink a-sdk en este repo (DV-04: señal «moved» es obra del carril A).
- Marketplace: deferred (fuera de este sprint).

## Qué verifica el pipeline

Un CI en verde **no** quiere decir «el producto funciona». Esto es lo que
comprueba de verdad, y lo que no. Escrito así a propósito: un reporte que
dice «CI PASS» a secas afirma más de lo que el flujo sostiene.

### `ci.yml` — push a `main` / `wp/**` y PR contra `main`

| Paso | Qué comprueba | ¿Condiciona el resultado? |
| ---- | ------------- | ------------------------- |
| `npm ci` | Las dependencias se instalan (incluye el registro privado). | **Sí** |
| `npm run lint` | `eslint` sobre `src/**/*.ts`. | **Sí** |
| `npm run compile:production` | El bundle de esbuild se genera. | **Sí** |
| `npm run probe:v08` | Compila `src/mutation/parseEditorInfo.ts` e importa **esa** pieza; contrato de `editor://info`. | **Sí** |
| `npm test` | Jest del legado. Marcado `continue-on-error`. | **No** |
| `npm run package:v1` | `vsce package` produce el `.vsix` y se sube como artefacto. | **Sí** |

Sobre el lint: hay ocho reglas que el legado viola (`no-explicit-any` 248,
`no-unused-vars` 107 y seis más con 16 en total) y están en `warn` con su
recuento en [`.eslintrc.cjs`](./.eslintrc.cjs) — deuda visible en cada
corrida, no silenciada. El resto del conjunto recomendado está en `error`:
el paso **puede fallar** y falla en cuanto código nuevo lo viola.

### Lo que el pipeline NO comprueba

- **No arranca la extensión** en un VS Code real. Que el `.vsix` se
  construya no dice nada de que instale ni de que funcione.
- **No linta `tests/**` ni `scripts/**`**: solo `src`.
- **El resultado de Jest no condiciona nada** (`continue-on-error`).
- El smoke vivo del probe V08 contra el servidor `linea-editor` sale `⏳`
  cuando no hay servidor: en CI **nunca** lo hay.
- No publica en ningún marketplace (deferred, DV-10).

### `release.yml` — tags `v*` y `workflow_dispatch`

El nombre del `.vsix` lo deriva [`scripts/vsix.mjs`](./scripts/vsix.mjs) de
`package.json` (`<publisher>-<name>-<version>.vsix`): subir la versión no
deja flujos apuntando a un fichero inexistente. Dos guardas: el dispatch
manual aborta fuera de `main`, y el flujo aborta si el tag resuelto ya tiene
un release publicado (no se pisa un asset ya distribuido).
