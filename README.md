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

## Migración de ajustes (WP-V15 · DV-16.a)

El extension-id pasa a **`scriptorium.aleph-0`** y los ajustes al espacio de
nombres **`aleph0.*`**. La v0.1.0 tiene 0 descargas conocidas, así que esto
no rescata a nadie: se escribe porque un renombrado sin tabla es una
migración escondida.

**VS Code no migra ajustes solo.** Una clave vieja en `settings.json` queda
huérfana (aparece como *Unknown Configuration Setting*) y la extensión
**no** la lee. Hay que reescribirlas a mano.

| clave vieja | clave nueva |
| ----------- | ----------- |
| `zigurat.mesh.host` | `aleph0.mesh.host` |
| `zigurat.mesh.port` | `aleph0.mesh.port` |
| `zigurat.mesh.baseUrl` | `aleph0.mesh.baseUrl` |
| `zigurat.launcher.host` | `aleph0.launcher.host` |
| `zigurat.launcher.port` | `aleph0.launcher.port` |
| `zigurat.ollama.baseUrl` | `aleph0.ollama.baseUrl` |
| `zigurat.room.id` | `aleph0.room.id` |
| `zigurat.lineaEditor.host` | `aleph0.lineaEditor.host` |
| `zigurat.lineaEditor.port` | `aleph0.lineaEditor.port` |
| `zigurat.reparto.path` | `aleph0.reparto.path` |
| `arrakisTheater.configPath` | `aleph0.theater.configPath` |
| `arrakisTheater.autoStart` | `aleph0.theater.autoStart` |
| `arrakisTheater.hackerMode` | `aleph0.theater.hackerMode` |

**13 claves.** Las tres `arrakisTheater.*` se renombran porque el panel de
Ajustes las titulaba «Arrakis Theater: …» — nombre vetado a la vista del
usuario (RES-2 de WP-V14).

**Claves que NO cambian** (heredadas, sin marca vetada; el brief de V15 no
las incluye): `alephscript.configurationFile`, `alephscript.autoLoadConfig`,
`alephscript.configValidation`, `alephscript.statusBar.visible`,
`alephscript.statusBar.animation`, las siete `alephscript.logging.*` y
`mcpSocketManager.configPath` (**14 claves**). El espacio de ajustes queda
por tanto **mixto** hasta que el custodio decida sobre ellas.

### Comandos

Los **99** comandos del manifiesto cuelgan ahora de un prefijo único
**`aleph0.`** (antes `alephscript.` ×86, `zigurat.` ×7 y
`mcpSocketManager.` ×6). Los seis heredados de `mcpSocketManager` conservan
ese segundo segmento (`aleph0.mcpSocketManager.*`) porque es el
discriminante de categoría del panel de comandos.

Si tenías atajos propios en `keybindings.json` apuntando a
`alephscript.*` / `zigurat.*` / `mcpSocketManager.*`, cámbialos: el
identificador viejo ya no existe y el atajo queda mudo.

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
`package.json` (`<name>-<version>.vsix`, hoy `aleph-0-0.1.0.vsix`): subir la
versión no deja flujos apuntando a un fichero inexistente. Dos guardas: el dispatch
manual aborta fuera de `main`, y el flujo aborta si el tag resuelto ya tiene
un release publicado (no se pisa un asset ya distribuido).
