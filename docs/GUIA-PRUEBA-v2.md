# Guía de prueba · Aleph-0 ℵ₀ v2 (`scriptorium.aleph-0` 0.1.0)

≤10 pasos para el custodio. Runtime local: `C:\S_LAB\z-sdk` (DV-07).

**Qué cambia respecto de la v1** (WP-V15 · DV-16.a): extension-id
`scriptorium.zigurat` → **`scriptorium.aleph-0`**; artefacto
`scriptorium-zigurat-0.1.0.vsix` → **`aleph-0-0.1.0.vsix`**; claves
`zigurat.*` / `arrakisTheater.*` → **`aleph0.*`** (tabla completa de
migración en el README); comandos con prefijo único **`aleph0.`** y
categoría de paleta «Aleph-0».

**Qué cambia además con WP-V23**: los ajustes tienen ya **un solo espacio de
nombres**; `alephscript.*` y `mcpSocketManager.*` desaparecen y los segmentos
salen del léxico (`aleph0.ciudad.*`, `aleph0.pieza.<pieza>.*`,
`aleph0.superficie.*`). Las claves de esta guía son las nuevas. Sin
migración automática: una clave vieja en tu `settings.json` queda huérfana y
**casi siempre** la extensión marca ⏳ nombrando la clave nueva que falta.

⚠️ **Con una excepción que conviene conocer antes de probar.** Si no pones
`aleph0.ciudad.*` **y** tienes un fichero de ópera con una UI primaria, el
monitor de sockets **no dice ⏳**: se inventa `ws://localhost:<puerto de esa
UI>` y lo da por bueno. Es un defecto preexistente, no lo arregla este WP
(cae en WP-V31) y está documentado con su caso rojo en
`plan/REPORTES/WP-V23-config-intencional.md` §11.2. Si ves el monitor
apuntando a tu propia máquina sin haberlo pedido, es esto — no es que haya
encontrado tu Ciudad.

Tabla completa de migración en el README y acta en
`plan/REPORTES/WP-V23-config-intencional.md`.

**El `.vsix` es LOCAL.** Se construye en este árbol; **no** se descarga del
Release `v0.1.0` de GitHub. Ese release publica el artefacto viejo
(`scriptorium-zigurat-0.1.0.vsix`, extension-id `scriptorium.zigurat`) y
**no** contiene ninguno de estos nombres. El re-release es DV-13 y el tick
público del vigía-S está **DEFERRED** (DV-14): esta guía no lo sustituye.

Marketplace: **no** (deferred, DV-10).

## 0 · Construir el artefacto

```
npm ci
npm run package:v1          # compile:production + vsce package
node scripts/vsix.mjs path  # -> dist/aleph-0-0.1.0.vsix
```

El nombre lo **deriva** `scripts/vsix.mjs` de `package.json`
(`<name>-<version>.vsix`). No se escribe a mano en ningún sitio: si no
coincide con lo de arriba, el manifiesto cambió y esta guía se queda corta.

## Settings de ejemplo (`.vscode/settings.json` del workspace de prueba)

```json
{
  "aleph0.ciudad.host": "127.0.0.1",
  "aleph0.ciudad.port": 3010,
  "aleph0.pieza.launcher.host": "127.0.0.1",
  "aleph0.pieza.launcher.port": 3050,
  "aleph0.room.id": "<room-zeus-local>",
  "aleph0.pieza.reparto.path": "<ruta-absoluta>/fixtures/reparto-v1-demo.json",
  "aleph0.pieza.lineaEditor.host": "",
  "aleph0.pieza.lineaEditor.port": null
}
```

Vacío/`null` en ciudad/pieza/room ⇒ la UI marca ⏳ (no inventa endpoints).
Los puertos `3010`/`3050` son los del runtime local del custodio, **no**
defaults del schema: el schema entrega `""` / `null`.

## Pasos

1. Empaquetar en local: `npm run package:v1` — debe aparecer
   `dist/aleph-0-0.1.0.vsix` (y sólo ése: el script borra `.vsix` previos).
2. Desinstalar lo viejo antes de instalar:
   `code --uninstall-extension scriptorium.zigurat` y
   `code --uninstall-extension escrivivir-co.scriptorium-vscode-extension`
   (fallan sin ruido si no estaban; **son ids distintos del nuevo**, así que
   conviven y confunden si no se retiran).
3. Instalar: `code --install-extension dist/aleph-0-0.1.0.vsix`
   (o `npm run install:local`, que resuelve la misma ruta derivada).
4. Abrir un workspace de prueba y pegar los settings de ejemplo (ajustar
   room y ruta de reparto). Si vienes de la v1, **reescribe** las claves:
   las `zigurat.*` quedan huérfanas y no se leen.
5. Recargar ventana (`Developer: Reload Window`) y comprobar activación:
   extensión **`scriptorium.aleph-0`** en *Extensions* + status bar Aleph-0
   (identidad ⏳ si aún no hay mesh). En la paleta, `Aleph-0:` debe listar
   los comandos; ningún `Zigurat:` debe quedar.
6. Arrancar el runtime Z local (`C:\S_LAB\z-sdk`) con mesh ~3010 y
   launcher ~3050.
7. `Aleph-0: Refresh MCP resource projection` — catálogo/resources en
   caliente (nodos `launcher://info|catalog|ports`, o ⏳ si el launcher está
   caído).
8. `Aleph-0: Join room (peer-card)` con `aleph0.room.id` válido — `ssbId`
   visible si la autoridad responde; si no, ⏳ (residual smoke V07).
9. `Aleph-0: Refresh authorship gate (editor://info)` — lista
   `motivos_deny` leídos de `editor://info`, no inventados. Después
   `Aleph-0: crear_linea (gated)` sin reparto/card vigente: debe **denegar**
   de forma visible (toast/log) y no escribir nada. Demo verde/rojo
   `ZEUS_LINEA_*` = residual V08 ⏳.
10. `Aleph-0: Refresh elenco (reparto → cast-table)` con
    `aleph0.pieza.reparto.path` apuntando al fixture — filas de cast-table; el
    panel Elenco es ≠ compañía teatral (`ICompany`).

**PASS custodio:** activación con el id nuevo + catálogo en caliente + un
deny de autoría visible + cero claves/comandos con nombre viejo en la UI.

**Lo que esta guía NO demuestra:** que el asset público del Release v0.1.0
equivalga a este `.vsix` (anomalía ARTEFACTO-NO-EQUIVALENTE, heredada y
**no** re-verificada; tick del vigía-S DEFERRED por DV-14).
