# REPORTE · WP-V14 · Marca del producto

| dato | valor |
| ---- | ----- |
| WP | **WP-V14 · Marca del producto** (Ola F · CORTE) |
| Rama | `wp/v14-marca-producto` |
| Worktree | `C:/S_LAB/.worktrees/v/v-sdk-wp-v14` |
| Base | `61eeee6` (main post-poda) |
| Tip de obra | `d409e0a` — `feat(marca): la cara de usuario pasa a Aleph-0 (ℵ₀)` |
| Gobierno | **DV-16** cerrada (cara usuario = `Aleph-0` / `ℵ₀`) · **DV-16.a** cerrada en (b), pero **su ejecución es WP-V15** |
| Qué NO es | no renombra extension-id, ni claves de settings, ni prefijos de comandos. No toca `src/`. No fusiona, no pushea |
| `VEREDICTO_REVISOR` | **⏳ pendiente** |

---

## 1 · Resumen en una tabla

| | antes | después |
| ---- | ----- | ------- |
| `displayName` | `Zigurat` | **`Aleph-0`** |
| `description` | «Zigurat — host IDE… Publisher scriptorium (DV-05).» | «Aleph-0 (ℵ₀) — host IDE… elenco.» |
| `configuration.title` | `Arrakis Theater Configuration` | **`Aleph-0`** |
| contenedor barra de actividad | id `arrakisTheater` · título `🎭 Arrakis Theater` · icono `arrakis-theater-icon.png` | id **`aleph0`** · título **`Aleph-0`** · icono **`aleph-0-activitybar.svg`** |
| `icon` (marketplace) | `./media/arrakis-theater-icon.png` | **`./media/aleph-0-icon.png`** (128×128, propio) |
| categorías de comando `Zigurat` | 7 | **0** (→ `Aleph-0`) |
| categorías de comando `🎭 Arrakis Theater` | 6 | **0** (→ `🎭 Teatro`) |
| vista muerta `🎭 Theater Engine` (explorer) | declarada, **sin proveedor** | **retirada del manifiesto** |
| `LICENSE.md` | licencia-broma AIPL + `Copyright © [Año] [Nombre del Autor]` | **puntero canónico: Animus Iocandi + GPL-3.0-or-later**, con titular real (§4.3) |
| `media/` | 23 ficheros (5 de marca legada + `mcp.svg` huérfano) | **19 ficheros**, 2 de ellos marca propia |
| `.vsix` | 32 ficheros · 591,81 KB | **28 ficheros · 243,92 KB** |

**Superficies de usuario cambiadas: 14** (contadas en §2). **Excepciones
declaradas que quedan para V15: 26 líneas** (contadas en §3, sobre el
**paquete real**).

---

## 2 · Qué superficies cambié, una a una

Alcance tocado: `package.json`, `README.md`, `LICENSE.md`, `media/`. Nada más
— `git status --porcelain` sale **vacío** al cierre (§6.4).

### 2.1 · `package.json` — 10 superficies

| # | superficie | antes | después |
| - | ---------- | ----- | ------- |
| 1 | `displayName` | `Zigurat` | `Aleph-0` |
| 2 | `description` | `Zigurat — host IDE de la ciudad: … Publisher scriptorium (DV-05).` | `Aleph-0 (ℵ₀) — host IDE de la ciudad: consumidor opt-in del contrato Z (identidad, catálogo MCP, autoría, elenco).` |
| 3 | `icon` | `./media/arrakis-theater-icon.png` | `./media/aleph-0-icon.png` |
| 4 | `license` | `SEE LICENSE IN LICENSE.md` | `GPL-3.0-or-later` |
| 5 | `contributes.commands[].category` ×7 | `Zigurat` | `Aleph-0` |
| 6 | `contributes.commands[].category` ×6 | `🎭 Arrakis Theater` | `🎭 Teatro` |
| 7 | `contributes.configuration.title` | `Arrakis Theater Configuration` | `Aleph-0` |
| 8 | `configuration.properties["alephscript.configurationFile"].description` | `Path to the Arrakis Theater configuration file (ArrakisTheater_OperaConfig.json)` | `Ruta al fichero de configuración de la ópera MCP. Vacío = se busca en la raíz del workspace el fichero de configuración heredado (convención legada, pendiente de barrer).` |
| 9 | `viewsContainers.activitybar[0]` | id `arrakisTheater` · title `🎭 Arrakis Theater` · icon `./media/arrakis-theater-icon.png` | id `aleph0` · title `Aleph-0` · icon `./media/aleph-0-activitybar.svg` |
| 10 | `views` | clave de contenedor `arrakisTheater` + bloque `explorer` con la vista muerta | clave `aleph0`; bloque `explorer` **suprimido** |

Sobre **#2**: quité además la coletilla `Publisher scriptorium (DV-05)`. Es
una cita de gobierno **interno** en la descripción que lee el usuario que
instala. DV-16 saca `Zigurat` de la cara de usuario por el mismo motivo, y
`publisher` sigue valiendo `scriptorium` en su propio campo: no se pierde
ningún dato. **Es un juicio mío, no una exigencia de la CA** — se declara
para que el orquestador lo pueda revertir de un tirón si no lo comparte.

Sobre **#8**: no podía dejar `Arrakis` ahí, y **tampoco podía borrar el dato
sin más**: `src/core/mcpConfigurationManager.ts:50` sigue buscando
`ArrakisTheater_OperaConfig.json` **en el workspace del usuario**. La
redacción nueva no nombra el fichero legado pero **tampoco miente**: dice que
hay una búsqueda heredada pendiente de barrer. El barrido del literal es de
V15 (R-1 de V13 / D15-D16 del censo), y `src/` está fuera de mi alcance.

Sobre **#9**: la CA-1 enumera las excepciones de forma cerrada —«extension-id,
claves `zigurat.*`, comandos»—. El **id del contenedor** no es ninguna de las
tres, así que dejarlo en `arrakisTheater` habría sido un fallo de la CA, no
una excepción. Lo renombré a `aleph0` (convención de DV-16.a (b) para claves).
**Comprobado que no rompe nada**: `grep -rn "workbench.view.extension" src/ media/ package.json` da **0**; el id sólo vivía en las dos entradas del
manifiesto que cambié a la vez. Un id de contenedor no es un id de settings ni
un prefijo de comando: no invade a V15.

Sobre **#6**: elegí `🎭 Teatro` y no `🎭 Aleph-0 Teatro` porque los comandos
que agrupa son `alephscript.teatro.*` y porque convive con
`🎭 Theater Control` / `🎭 Theater Interfaces` / `🖥️ Theater System`, que
**no cambié** (ver residual **RES-1**): «Theater» a secas no está vetado por
la CA, «Arrakis Theater» sí.

### 2.2 · `media/` — 4 superficies

| # | superficie | acción |
| - | ---------- | ------ |
| 11 | `aleph-0-icon.png` (128×128) | **añadido** — icono de marketplace propio (§4.4) |
| 12 | `aleph-0-activitybar.svg` (24×24) | **añadido** — icono de barra de actividad propio (§4.4) |
| 13 | `arrakis-theater-icon{,-aleph,-dark,-original}.png` + `ICON_CREATION_GUIDE.md` | **retirados** (`git rm`) — marca legada que viajaba en el `.vsix` |
| 14 | `hacker-config-panel.js:330` | `>>> ARRAKIS CONFIG MATRIX INITIALIZED <<<` → `>>> ALEPH-0 CONFIG MATRIX INITIALIZED <<<` |

`ICON_CREATION_GUIDE.md` no era sólo marca legada: eran **instrucciones de
build** («Open the SVG file `arrakis-theater-icon-simple.svg`…») que **viajaban
al usuario** dentro del paquete y que describían un fichero que ni siquiera
existía en el árbol. Se va con los iconos que documentaba.

**#14 es discutible y lo declaro como tal**: un `console.log` sólo se ve
abriendo las devtools del webview. Lo cambié porque la CA-1 es un `grep`
sobre lo que viaja y `media/hacker-config-panel.js` **viaja** (confirmado en
el `unzip -l` de §6.3). Cambio de una cadena, cero riesgo de comportamiento,
ningún test lo cubre (§6.5).

### 2.3 · `README.md` — la cabecera

`# V_SDK · Zigurat` → `# Aleph-0 · ℵ₀`, y la línea de misión
`**V · Zigurat: host IDE…**` → `**Aleph-0: host IDE…**`. Añadí tres líneas
que dicen **qué es** y que **no está en ningún marketplace** (DV-10), porque
el README que viaja es la página que ve quien instala y hasta ahora empezaba
directamente por el gobierno del carril.

**Observación honesta (RES-4)**: este README hace doble oficio —README del
repo y descripción del paquete—. Lo que viaja incluye la tabla del CI y la
sección «Lo que el pipeline NO comprueba», que es material de desarrollador.
No lo separé porque partir el README en dos ficheros no está en el brief y
tocaría el contrato de `.vscodeignore`. Se deja anotado.

### 2.4 · `LICENSE.md` — sustitución completa

Ver §4.3.

---

## 3 · Excepciones declaradas (IDs internos que renombra V15)

**Medidas sobre el paquete real**, no sobre el árbol: se extrajo
`dist/scriptorium-zigurat-0.1.0.vsix` y se grepeó lo extraído, excluyendo
`extension/dist/` por derivado (así lo manda el brief). **Es la lección de la
errata de V12/V13: la columna «¿viaja?» se verifica contra el `.vsix`, no
contra `.vscodeignore`.**

```
$ unzip -q dist/scriptorium-zigurat-0.1.0.vsix -d /tmp/v14pkg
$ grep -rniE "arrakis|zigurat" /tmp/v14pkg --exclude-dir=dist
```

**26 líneas**, todas excepción declarada, ninguna es superficie de usuario en
el sentido de DV-16 (nombres visibles); son identificadores que DV-16.a (b)
manda renombrar **en WP-V15**:

| grupo | qué es | líneas | detalle |
| ----- | ------ | ------ | ------- |
| **A · extension-id** | `scriptorium.zigurat` | **4** | `extension/package.json:2` (`"name": "zigurat"`) · `:1249` y `:1254` (scripts `uninstall:*`) · `extension.vsixmanifest:4` (`Id="zigurat"`, derivado de `name`) |
| **B · prefijos de comando** | `zigurat.*` | **8** | `commands[].command` en `:71 :77 :83 :89 :95 :101 :107` (**7 comandos distintos**) + la referencia de menú `:968` |
| **C · claves de settings** | `zigurat.*` (10) y `arrakisTheater.*` (3) | **14** | claves en `:594 :600 :609 :615 :621 :630 :636 :642 :648 :657` y `:687 :692 :697` (**13 claves**) + `:612`, una `description` que **nombra dos de esas claves** (`zigurat.mesh.host` + `zigurat.mesh.port`) y que sólo se puede corregir cuando las claves cambien |
| | | **26** | |

Las 13 claves, enumeradas para que V15 no tenga que recontarlas:

```
zigurat.mesh.host        zigurat.launcher.host    zigurat.room.id
zigurat.mesh.port        zigurat.launcher.port    zigurat.lineaEditor.host
zigurat.mesh.baseUrl     zigurat.ollama.baseUrl   zigurat.lineaEditor.port
zigurat.reparto.path
arrakisTheater.configPath   arrakisTheater.autoStart   arrakisTheater.hackerMode
```

> ⚠️ **Aviso a V15 sobre las 3 claves `arrakisTheater.*`.** DV-16.a (b) dice
> «claves → `aleph0.*`» nombrando `zigurat.*`. Estas tres **también son claves
> de settings** y llevan la marca vetada **en el nombre que el usuario ve en
> el panel de Ajustes** (VS Code las titula «Arrakis Theater: Config Path»…).
> Yo no podía tocarlas —el brief me lo prohíbe explícitamente— pero son las
> únicas excepciones de esta lista que **sí son visibles al usuario**. Tienen
> además consumidor en código: `src/views/HackerConfigPanelProvider.ts:195-197`.
> **No las dejo escondidas: son el residual de mayor cara de usuario que
> queda.**

**Dato informativo, fuera de la CA** (`dist/extension.js` es derivado del
código que renombra V15): el bundle contiene **32** ocurrencias de `zigurat`
y **15** de `arrakis`, todas provenientes de `src/`.

---

## 4 · Las cuatro decisiones que el brief me pedía tomar

### 4.1 · La «13ª vista» (`arrakisTheater` en `explorer`) → **RETIRADA**

El manifiesto declaraba, en el contenedor `explorer`:

```json
{ "id": "arrakisTheater", "name": "🎭 Theater Engine",
  "icon": "$(symbol-operator)",
  "when": "resourceExtname == .json || resourceExtname == .md" }
```

Verificado antes de decidir:

- **No tiene proveedor.** `grep -rn "arrakisTheater" src/` devuelve sólo las
  3 claves de settings de `HackerConfigPanelProvider.ts:195-197` y dos
  comentarios/literales de `mcpConfigurationManager.ts`. Ningún
  `registerTreeDataProvider` ni `createTreeView` con ese id.
- **Tampoco lo tenía antes de la poda** — dato heredado de la contrarrevisión
  de V13 (observación 2), que lo comprobó contra el tag `archive/pre-poda-ola-f`.
  **No lo re-verifiqué**: es evidencia ajena y se cita como tal.
- **Colisionaba de nombre con el contenedor**: el mismo string `arrakisTheater`
  era a la vez id del `viewsContainer` e id de esta vista del explorador.

Es decir: una sección vacía con **marca vetada** aparecía en el Explorador de
cualquiera que abriese un `.json` o un `.md`. Retirarla no huerfaniza nada
(no había nada) y elimina una superficie falsa. **Retirada.** El contenedor
propio pasa de 11 vistas declaradas + 1 muerta a **11 vistas, todas con
proveedor** — comprobado por mí, id a id, no heredado:

```
alephscript.hackerControlPanel → 1   alephscript.configs   → 2
alephscript.hackerCommandPanel → 1   alephscript.sockets   → 2
alephscript.hackerConfigPanel  → 1   alephscript.logs      → 2
alephscript.hackerTasksPanel   → 1   alephscript.mcptree   → 2
alephscript.teatro             → 2   alephscript.uis       → 2
alephscript.elenco             → 1
                                          (referencias en src/)
```

> Precisión de recuento: el censo la bautizó «la 13ª vista» (**D14**) cuando
> el contenedor tenía 12 entradas. La poda de V13 se llevó `copilotMetrics.panel`,
> así que en el árbol que recibo era la **12ª** declarada. Es la misma vista;
> el ordinal del censo ya no cuadra y se anota para que nadie busque una
> decimotercera que no existe.

### 4.2 · `media/mcp.svg` → **RETIRADO DEL PAQUETE**

Perdió su único consumidor (`mcpChatParticipant.ts:83`) cuando V13 podó ese
fichero por DV-11. Re-verificado en **este** árbol: `grep -rn "mcp\.svg"` sobre
`**/*.{ts,js,json,md}` no devuelve **ninguna** referencia viva — sólo citas en
`plan/` (censo y reportes), que es documentación de gobierno.

Miré su contenido antes de decidir, por si era neutro: no lo es. Es el
«**Hacker Emblem** Hexagon» del legado, con sus sectores
«hardware/software/wetware» y su gradiente rojo-verde-azul. Es marca legada de
la misma familia que los iconos de Arrakis, sin referente en el producto
propio y sin un solo lector.

**Retirado.** 2.015 B que dejan de viajar y una decisión menos para V15.

### 4.3 · `LICENSE.md` → **puntero a la composite Animus Iocandi + GPL-3.0-or-later**

> ⚠️ **Esta decisión se rehízo en `7ab97a0` por corrección del custodio en
> sesión. Léase el §4.3-bis: el primer intento fue `UNLICENSED` y estaba
> mal.** Lo que sigue describe el estado **final**.

El fichero pasa de la «Animus Iocandi Public License (AIPL) v1.0» —que se
autodescribe «parodia […] no debe ser interpretado como una licencia legal
válida» y cerraba con `Copyright © [Año] [Nombre del Autor]` **literal, con los
corchetes** (hallazgos **D7** y **D19** del censo)— al **patrón de puntero de la
constelación**, calcado del de `g-sdk` y adaptado al alcance de este repo:

```markdown
# LICENSE — Animus Iocandi (pointer)

**Scope:** `V_SDK` — extensión **Aleph-0** (ℵ₀), host IDE de la ciudad.

Licencia **GPL-3.0-or-later** más la capa **Animus Iocandi**, alineada con el
monorepo Zeus.

- Texto completo (composite): https://github.com/alephscriptorium-eng/Z_SDK/blob/main/LICENSE.md
- GPL-3.0: https://www.gnu.org/licenses/gpl-3.0.html
- SPDX: `GPL-3.0-or-later`

Copyright © 2026 alephscriptorium
```

`package.json` `"license"` pasa de `SEE LICENSE IN LICENSE.md` a
**`GPL-3.0-or-later`**: SPDX válido, y manifiesto y fichero dicen lo mismo.
La línea de copyright con **titular real** es el añadido propio sobre el patrón
de `g-sdk` (que no la lleva): es lo que cierra **D19**, el marcador sin rellenar.

### 4.3-bis · Por qué esta decisión se rehízo — asiento de la corrección

Mi encargo traía una directiva explícita del orquestador: sustituir la
licencia-broma por «texto corto **UNLICENSED** — derechos reservados al
productor del paquete + titular real + nota de que la licencia definitiva
viaja con el release público diferido», y «**NO inventes una licencia FOSS**».
La ejecuté tal cual en `d409e0a`, y levanté como **RES-5** que en disco no
encontraba ese patrón en ningún repo de la constelación.

**El custodio corrigió la premisa en sesión, y la corrección es esta:**

> «La constelación **sí** tiene un patrón claro de licencia […] Usamos el
> compose creado ad-hoc **Animus Iocandi + GPLv3** porque pensamos que somos
> FOSS y la GPLv3 por el vibecoding ya no protege. **Eso ya está discutido.**»

Es decir: lo que yo leí como «no hay patrón» era **desconocimiento mío de una
discusión ya cerrada**, no ausencia de patrón. El `UNLICENSED` era además lo
contrario de la directriz asentada «**Todo FOSS** — default publicar».

Rehecho en consecuencia. **Se declara sin adornos: cambié la obra por encima
de la directiva escrita de mi encargo, porque la contradijo el custodio, que
es de quien es la licencia** — mi propio §4.3 original ya decía que «cerrar la
licencia de un producto no es de un worker». El orquestador debe saber que su
directiva de `UNLICENSED` quedó revocada en origen, no ignorada por mí.

Evidencia en disco del patrón, re-leída para calcarlo:

| repo | fichero | qué dice |
| ---- | ------- | -------- |
| `z-sdk` | `LICENSE.md` | **la composite**: GPL-3.0-or-later como base copyleft + capa Animus Iocandi (marca, atribución, transición). 48 líneas |
| `g-sdk` | `LICENSE.md` | **el puntero** para un repo hermano: 12 líneas, `SPDX: GPL-3.0-or-later`, enlace a la composite ← **el que he calcado** |
| `v-sdk` | `LICENSE.md` | **ahora, el puntero** + línea de copyright con titular real |
| `a-sdk` | `LICENSE.md` | sigue con la **licencia-broma AIPL** ← ver RES-5 |
| `o-sdk` | `LICENSE` | sigue con la **licencia-broma AIPL** ← ver RES-5 |
| `s-sdk`, `e-sdk` | — | sin fichero de licencia ← ver RES-5 |

Empaquetado con el valor nuevo: **⏳ pendiente** — la enmienda se aplicó
sin re-empaquetar (sesión interrumpida antes de ese paso); la
verificación de facto (`vsce package` verde + `LICENSE.md` viajando) la
ejecuta el gate R6-V, que empaqueta desde main de todos modos. El
`unzip -l` de §6.3 corresponde al `.vsix` con la licencia anterior.

### 4.4 · El icono → **generado, verificado y reproducible**

No había material de marca propio: los cuatro PNG eran de Arrakis Theater y
la única «guía» era el `ICON_CREATION_GUIDE.md` legado, que mandaba abrir un
SVG inexistente y hacerle una captura de pantalla.

**Qué generé — dos artefactos del mismo contorno:**

| fichero | tamaño | uso | por qué así |
| ------- | ------ | --- | ----------- |
| `media/aleph-0-icon.png` | 128×128, 3.306 B | `package.json` `icon` (marketplace) | VS Code **exige PNG** para el icono del paquete |
| `media/aleph-0-activitybar.svg` | 24×24, 1.610 B | `viewsContainers.activitybar[0].icon` | VS Code **recomienda SVG** en la barra de actividad: lo usa como máscara y lo **recolorea con el tema**. El PNG legado no se adaptaba al tema |

**Diseño**: `ℵ₀` en hueso `#E8E6E3` sobre tinta `#111318`, dentro de un aro
de 4 px (el PNG); el SVG es sólo el glifo, en `currentColor`, para que el
tema mande.

**Método** (esto es lo que sustituye a la «guía» legada). El truco importante:
el SVG **no lleva `<text>`**, lleva el **contorno del glifo volcado a un
`path`**, extraído de la fuente con `GraphicsPath.AddString` y serializado a
comandos `M/L/C`. Consecuencia: **el SVG no depende de que el cliente tenga
una fuente con `ℵ` (U+2135) ni `₀` (U+2080)**.

**Verificación — y aquí es donde no me fío del código de salida:**

1. `GraphicsPath` devolvió **107 puntos** y un `bounds` de 251,1×176,1 sobre
   un em de 256. Un glifo ausente («tofu») da un rectángulo de 4-8 puntos:
   107 puntos es un contorno real, no un cuadro de sustitución.
2. **Miré el PNG.** Se ve `ℵ₀` dentro del aro.
3. **Rendericé el SVG en un motor de navegador ajeno a quien lo generó** —
   `msedge --headless=new --screenshot` sobre un HTML que lo carga como
   `<img>`— y **miré el resultado**: sale `ℵ₀`. Eso prueba que la
   serialización del `path` es correcta y que el SVG se dibuja sin fuente.
4. Ambos ficheros están **dentro del `.vsix`** (§6.3) y **referenciados** desde
   el manifiesto (§6.2).

**Lo que NO está verificado (⏳)**: cómo se ve el SVG **dentro de la barra de
actividad de un VS Code real**, con el enmascarado y el recoloreado del tema.
Este WP no arranca VS Code. Es exactamente el hueco que el README del repo ya
declara («el pipeline no arranca la extensión»). Va a la guía de prueba del
vigía-S.

**Reproducible.** El generador está aquí entero, en el reporte y no en el
árbol, porque `scripts/` **no está en mi alcance** y añadir ficheros fuera de
alcance es lo que mi rol prohíbe. Se ejecuta con
`powershell -NoProfile -ExecutionPolicy Bypass -File icono-aleph0.ps1 -Out media`:

```powershell
# icono-aleph0.ps1 · genera la marca de Aleph-0 (ℵ₀) — WP-V14
param(
    [string]$Out = ".",
    [string]$FontName = "Segoe UI Symbol",
    [string]$Glyph = [char]0x2135 + [string][char]0x2080   # ℵ₀
)
Add-Type -AssemblyName System.Drawing
$FG = [System.Drawing.Color]::FromArgb(255, 232, 230, 227)   # #E8E6E3 hueso
$BG = [System.Drawing.Color]::FromArgb(255, 17, 19, 24)      # #111318 tinta

function Get-GlyphPath([string]$text, [string]$font, [single]$em) {
    $gp = New-Object System.Drawing.Drawing2D.GraphicsPath
    $ff = New-Object System.Drawing.FontFamily($font)
    $gp.AddString($text, $ff, [int][System.Drawing.FontStyle]::Regular, $em,
                  (New-Object System.Drawing.PointF(0, 0)),
                  [System.Drawing.StringFormat]::GenericTypographic)
    return $gp
}
$gp = Get-GlyphPath $Glyph $FontName 256
$bounds = $gp.GetBounds()
Write-Output ("glifo: {0} pts · bounds {1:N1},{2:N1} {3:N1}x{4:N1}" -f `
    $gp.PointCount, $bounds.X, $bounds.Y, $bounds.Width, $bounds.Height)
if ($gp.PointCount -eq 0) { throw "la fuente '$FontName' no dibujo nada para el glifo" }

# --- PNG 128x128 (marketplace) ---
$size = 128
$bmp = New-Object System.Drawing.Bitmap($size, $size)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear($BG)
$pen = New-Object System.Drawing.Pen($FG, 4)
$g.DrawEllipse($pen, 10, 10, $size - 20, $size - 20)
$target = 70.0
$scale = [Math]::Min($target / $bounds.Width, $target / $bounds.Height)
$m = New-Object System.Drawing.Drawing2D.Matrix
$m.Translate(($size - $bounds.Width * $scale) / 2, ($size - $bounds.Height * $scale) / 2)
$m.Scale($scale, $scale)
$m.Translate(-$bounds.X, -$bounds.Y)
$gp2 = $gp.Clone(); $gp2.Transform($m)
$g.FillPath((New-Object System.Drawing.SolidBrush($FG)), $gp2)
$bmp.Save((Join-Path $Out "aleph-0-icon.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()

# --- SVG 24x24: contorno volcado, sin dependencia de fuente en el cliente ---
# PathData: Types 0=inicio, 1=linea, 3=bezier cubico (de 3 en 3); bit 0x80 = cerrar.
function ConvertTo-SvgPath([System.Drawing.Drawing2D.GraphicsPath]$path) {
    $d = New-Object System.Text.StringBuilder
    $pts = $path.PathPoints; $tps = $path.PathTypes; $i = 0
    while ($i -lt $pts.Length) {
        $t = $tps[$i] -band 0x07
        if ($t -eq 0) {
            [void]$d.AppendFormat([Globalization.CultureInfo]::InvariantCulture,
                "M{0:0.###} {1:0.###} ", $pts[$i].X, $pts[$i].Y)
            if ($tps[$i] -band 0x80) { [void]$d.Append("Z ") }
            $i++
        } elseif ($t -eq 1) {
            [void]$d.AppendFormat([Globalization.CultureInfo]::InvariantCulture,
                "L{0:0.###} {1:0.###} ", $pts[$i].X, $pts[$i].Y)
            if ($tps[$i] -band 0x80) { [void]$d.Append("Z ") }
            $i++
        } elseif ($t -eq 3) {
            [void]$d.AppendFormat([Globalization.CultureInfo]::InvariantCulture,
                "C{0:0.###} {1:0.###} {2:0.###} {3:0.###} {4:0.###} {5:0.###} ",
                $pts[$i].X, $pts[$i].Y, $pts[$i+1].X, $pts[$i+1].Y, $pts[$i+2].X, $pts[$i+2].Y)
            if ($tps[$i+2] -band 0x80) { [void]$d.Append("Z ") }
            $i += 3
        } else { throw "tipo de punto inesperado: $($tps[$i])" }
    }
    return $d.ToString().Trim()
}
$box = 24.0; $pad = 2.0; $avail = $box - 2 * $pad
$s = [Math]::Min($avail / $bounds.Width, $avail / $bounds.Height)
$m2 = New-Object System.Drawing.Drawing2D.Matrix
$m2.Translate(($box - $bounds.Width * $s) / 2, ($box - $bounds.Height * $s) / 2)
$m2.Scale($s, $s); $m2.Translate(-$bounds.X, -$bounds.Y)
$gp3 = $gp.Clone(); $gp3.Transform($m2)
$svg = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <title>Aleph-0</title>
  <path fill="currentColor" fill-rule="evenodd" d="$(ConvertTo-SvgPath $gp3)"/>
</svg>
"@
[System.IO.File]::WriteAllText((Join-Path $Out "aleph-0-activitybar.svg"), $svg,
    (New-Object System.Text.UTF8Encoding($false)))
```

Verificación del propio script (salida real):

```
glifo: 107 pts · bounds 13,8,132,9 251,1x176,1
escrito …\aleph-0-icon.png (128 x 128)
escrito …\aleph-0-activitybar.svg (1610 B)
```

---

## 5 · Criterios de aceptación, uno a uno

| CA | enunciado | veredicto | evidencia |
| -- | --------- | --------- | --------- |
| **1** | `grep -riE "arrakis\|zigurat"` sobre superficies de usuario de lo que viaja = 0, con excepciones declaradas | ✅ **PASS** | §3: **26** líneas, **todas** en los 3 grupos de excepción (extension-id 4 · comandos 8 · claves 14). **0** en `displayName`, `description`, títulos, categorías, contenedor, `README.md`, `LICENSE.md`, `media/`, `schemas/` |
| **2** | `grep -E "Aleph ?0\|Aleph0\|A0\b"` = 0 (forma canónica `Aleph-0` / `ℵ₀`) | ✅ **PASS** | §6.1: **0 resultados** sobre el paquete real y sobre el árbol |
| **3** | Icono de barra de actividad presente y referenciado | ✅ **PASS** (con ⏳ acotado) | `extension/media/aleph-0-activitybar.svg` (1.610 B) en el `unzip -l`; `viewsContainers.activitybar[0].icon` lo referencia. **⏳**: no verificado *en una barra de actividad viva* — este WP no arranca VS Code (§4.4) |
| **4** | `compile` verde por ranura + `vsce package` por ranura + `unzip -l` en el reporte | ✅ **PASS** | §6.2 y §6.3. `compile:production` → 692,3 kb; `package:v1` → 28 ficheros / 243,92 KB; listado íntegro en §6.3 |
| **5** | `git status` limpio fuera de alcance | ✅ **PASS** | §6.4: `git status --porcelain` **vacío**; los 12 ficheros del diff están todos en `package.json` / `README.md` / `LICENSE.md` / `media/` |

`jest` **no se ejecutó**: no toqué nada con cobertura (§6.5). Y sigue vigente
**R-5 de V13** — `npm test` sale rojo por umbral de cobertura, no por prueba
roja; no es efecto de este WP.

---

## 6 · Evidencia

Huella del cierre:

```
worktree : C:/S_LAB/.worktrees/v/v-sdk-wp-v14
HEAD     : d409e0ad94c1fdd7502d1d78b6ab5241060b08d6
árbol    : limpio
lockfile : sha256:363c08ffd4f544da
```

`bash scripts/evidencia.sh vigente compile` y `… vigente package` salieron **1**
(no vigente) antes de gastar: este worktree no tenía `EVIDENCIA.md` y el HEAD
era nuevo. No había nada que citar; se ejecutó. Tabla transcrita de
`EVIDENCIA.md` (gitignorado):

| sello (UTC) | etiqueta | resultado | HEAD | árbol | lockfile | nota |
| ----------- | -------- | --------- | ---- | ----- | -------- | ---- |
| 2026-07-25T16:58:44Z | `compile` | **PASS** | `d409e0ad94c1fdd7502d1d78b6ab5241060b08d6` | limpio | `sha256:363c08ffd4f544da` | `npm run compile:production` — `dist/extension.js` 692,3 kb |
| 2026-07-25T16:58:58Z | `package` | **PASS** | `d409e0ad94c1fdd7502d1d78b6ab5241060b08d6` | limpio | `sha256:363c08ffd4f544da` | `npm run package:v1` — 28 ficheros, 243,92 KB |
| 2026-07-25T17:00:11Z | `npm-ci` | **PASS** | `d409e0ad94c1fdd7502d1d78b6ab5241060b08d6` | limpio | `sha256:363c08ffd4f544da` | `npm ci --no-audit --no-fund` — added 1543 packages in 27s |

> **Honestidad sobre el orden de esa tabla**: la fila `npm-ci` tiene sello
> **posterior** a las otras dos porque la registré **a posteriori** — el
> `npm ci` se ejecutó **antes** que el `compile` (este worktree no traía
> `node_modules`), pero se me pasó registrarlo en su momento. La huella es la
> misma en las tres (mismo HEAD, árbol limpio, mismo lockfile), así que la
> fila sigue siendo válida como evidencia; el sello no refleja el orden real
> de ejecución y se dice en vez de disimularlo.

Los tres por ranura (`bash scripts/slot.sh run <etiqueta> -- …`); `slot.sh status`
mostraba `slot-1: libre` antes de cada toma. `npx` **no** se usó: `scripts/vsix.mjs`
resuelve el bin local de `@vscode/vsce` (`vsix.mjs: vsce local node_modules\@vscode\vsce\vsce`).

### 6.1 · Los dos greps de la CA, sobre el paquete real

```
$ grep -rniE "arrakis|zigurat" /tmp/v14pkg --exclude-dir=dist
… 26 líneas, todas en §3 …

$ grep -rnE "Aleph ?0|Aleph0|A0\b" /tmp/v14pkg --exclude-dir=dist
(sin resultados)
```

### 6.2 · Manifiesto empaquetado — comprobación estructural

```
$ node -e "…" sobre /tmp/v14pkg/extension/package.json
displayName : Aleph-0
description : Aleph-0 (ℵ₀) — host IDE de la ciudad: consumidor opt-in del contrato Z (…)
icon        : ./media/aleph-0-icon.png
cfg.title   : Aleph-0
containers  : [{"id":"aleph0","title":"Aleph-0","icon":"./media/aleph-0-activitybar.svg"}]
views       : 11 vistas, contenedor único «aleph0»
license     : GPL-3.0-or-later
name/pub    : zigurat / scriptorium      ← excepción declarada (V15)
comandos    : 99   ·   claves zigurat.* 10   ·   claves arrakisTheater.* 3
```

### 6.3 · `unzip -l` del paquete real

```
$ unzip -l dist/scriptorium-zigurat-0.1.0.vsix
  Length      Date    Time    Name
---------  ---------- -----   ----
     2867  2026-07-25 18:58   extension.vsixmanifest
      515  2026-07-25 18:58   [Content_Types].xml
     3431  2026-07-25 18:58   extension/readme.md
    40631  2026-07-25 18:57   extension/package.json
      665  2026-07-25 18:56   extension/LICENSE.md
    10124  2026-07-25 18:48   extension/schemas/xplus1-config.schema.json
     6150  2026-07-25 18:48   extension/schemas/webrtc-ui-config.schema.json
     2853  2026-07-25 18:48   extension/schemas/socket-config.schema.json
     9452  2026-07-25 18:48   extension/media/teatro.js
     7147  2026-07-25 18:48   extension/media/teatro.css
     3888  2026-07-25 18:48   extension/media/hacker-themes.css
     1804  2026-07-25 18:48   extension/media/hacker-theme-switcher.js
    13544  2026-07-25 18:48   extension/media/hacker-tasks-panel.js
    13633  2026-07-25 18:48   extension/media/hacker-tasks-panel.css
    13078  2026-07-25 18:48   extension/media/hacker-control-panel.js
     7369  2026-07-25 18:48   extension/media/hacker-control-panel.css
    12623  2026-07-25 18:56   extension/media/hacker-config-panel.js
     9769  2026-07-25 18:48   extension/media/hacker-config-panel.css
    19957  2026-07-25 18:48   extension/media/hacker-command-panel.js
     8266  2026-07-25 18:48   extension/media/hacker-command-panel.css
     2418  2026-07-25 18:48   extension/media/hacker-base.css
     3306  2026-07-25 18:54   extension/media/aleph-0-icon.png
     1610  2026-07-25 18:54   extension/media/aleph-0-activitybar.svg
    16742  2026-07-25 18:48   extension/media/agent-content-editor.js
     9478  2026-07-25 18:48   extension/media/agent-content-editor.css
    19988  2026-07-25 18:48   extension/media/agent-config-editor.js
     9338  2026-07-25 18:48   extension/media/agent-config-editor.css
   708928  2026-07-25 18:58   extension/dist/extension.js
---------                     -------
   959574                     28 files
```

**Lo que el listado prueba y conviene leer despacio:**

- **28 ficheros / 243,92 KB**, frente a los **32 / 591,81 KB** de V13. Los
  −348 KB son casi todos `arrakis-theater-icon-original.png` (323.615 B).
  Cuentas: se van 6 ficheros (4 PNG + `ICON_CREATION_GUIDE.md` + `mcp.svg`),
  entran 2 → 32 − 4 = **28** ✅.
- **`media/` viaja entero**: 19 de 19. La errata de V12/V13 queda otra vez
  confirmada al alza — `.vscodeignore` **no** filtra dentro de `media/`, ni
  siquiera los `.md`. Por eso `ICON_CREATION_GUIDE.md` viajaba y por eso tenía
  que salir del árbol, no de `.vscodeignore`.
- **Ningún `.map`** dentro (se empaquetó tras `compile:production`, no tras
  `compile`; R-7 de V13 sigue siendo material de V16).
- **`.vscodeignore` no viaja** — importante, porque ese fichero **sí** contiene
  `ArrakisTheater_OperaConfig.json` (línea de exclusión heredada, ya obsoleta
  tras la poda) y por tanto **no cuenta** para la CA-1. Anotado como **RES-3**.
- `extension/readme.md`: `vsce` reescribió el enlace relativo `./plan/` a la
  URL absoluta del repo. Efecto colateral bueno: el enlace no queda roto para
  quien lea el README dentro del paquete.

### 6.4 · Alcance y limpieza

```
$ git status --porcelain
(vacío)

$ git show --stat --format="" d409e0a
 LICENSE.md                              |  67 ++++++--------------------------
 README.md                               |   8 +++-
 media/ICON_CREATION_GUIDE.md            |  32 ---------------
 media/aleph-0-activitybar.svg           |   4 ++
 media/aleph-0-icon.png                  | Bin 0 -> 3306 bytes
 media/arrakis-theater-icon-aleph.png    | Bin 4336 -> 0 bytes
 media/arrakis-theater-icon-dark.png     | Bin 24039 -> 0 bytes
 media/arrakis-theater-icon-original.png | Bin 323615 -> 0 bytes
 media/arrakis-theater-icon.png          | Bin 5433 -> 0 bytes
 media/hacker-config-panel.js            |   2 +-
 media/mcp.svg                           |  42 --------------------
 package.json                            |  54 +++++++++++--------------
 12 files changed, 46 insertions(+), 163 deletions(-)
```

**12 rutas, todas dentro de mi alcance** (`package.json`, `README.md`,
`LICENSE.md`, `media/`). Cero ficheros en `src/`, `scripts/`, `.github/`,
`tests/`, `docs/`, `plan/BACKLOG.md`, `plan/DECISIONES.md`.

### 6.5 · Por qué no corrí `jest`

`grep -rln "media/\|package.json\|LICENSE\|README" tests/` → **0 ficheros**.
Ninguna prueba del repo mira nada de lo que toqué. Ejecutar `jest` habría
gastado la ranura para reproducir el rojo por umbral que **R-5 de V13** ya
tiene asentado. No se ejecutó y no se afirma nada sobre él.

---

## 7 · Residuales — listados, no escondidos

| id | qué queda | dónde | de quién es |
| -- | --------- | ----- | ----------- |
| **RES-1** | **5 categorías con estética legada** que **no** están vetadas por la CA-1 (no dicen «Arrakis») pero siguen siendo cara de usuario: `🎭 Theater Control` (9 comandos), `🎭 Theater Interfaces` (6), `🤖 Agent Matrix` (6), `🖥️ Theater System` (2), `⚡ Quick Hack` (2) = **25 comandos**. Más **8 categorías `AlephScript*`** (20 comandos) que V15 unifica, y **29 comandos sin categoría ninguna** — esos salen en la paleta sin prefijo de producto | `package.json` `contributes.commands[].category` | **V15** (nombres) |
| **RES-2** | Las **3 claves `arrakisTheater.*`**: las únicas excepciones de §3 **visibles al usuario** (panel de Ajustes). Consumidor en `src/views/HackerConfigPanelProvider.ts:195-197` | `package.json` + `src/` | **V15** (DV-16.a b) |
| **RES-3** | `.vscodeignore` conserva exclusiones de ficheros que V13 ya podó, una con marca legada: `pics/**` (`:48`) y `ArrakisTheater_OperaConfig.json` (`:64`). **`.vscodeignore` no viaja en el `.vsix`** (confirmado en §6.3), así que no afecta a la CA-1; es higiene | `.vscodeignore:48,64` | **V16** (ya tiene `V-L4-05` sobre este fichero) |
| **RES-4** | El `README.md` que viaja hace doble oficio: mitad página de producto, mitad documentación del CI del repo | `README.md` | orquestador (¿partirlo?) |
| **RES-5** | **Reescrito tras la corrección del custodio (§4.3-bis).** El patrón sí existe y está discutido: composite **Animus Iocandi + GPL-3.0-or-later**, y `v-sdk` ya lo apunta. Lo que queda es que **`a-sdk` y `o-sdk` siguen con la licencia-broma AIPL** que aquí se retira, y **`s-sdk` y `e-sdk` no tienen fichero de licencia** | fuera del carril V | **custodio** (no es carril V; se anota por haberlo visto al calcar el patrón) |
| **RES-6** | **`release.yml` nombra «Zigurat» en las notas de release** — y las notas de release **sí** están en el alcance de DV-16: `.github/workflows/release.yml:122` (`name: Zigurat ${{ … }}`) y `:124` (`## Zigurat … (extension-id \`scriptorium.zigurat\`)`). **NO lo he tocado**: `.github/` es alcance de **WP-V16** y mi rol me prohíbe ficheros fuera de mi lista. **2 puntos** | `.github/workflows/release.yml:122,124` | **V16** o **V15** — *el orquestador debe adjudicarlo, porque hoy no está en el brief de ninguno de los dos* |
| **RES-7** | `docs/GUIA-PRUEBA-v1.md` está escrita entera sobre «Zigurat» y sobre las claves `zigurat.*` (10 líneas). No viaja en el `.vsix` (`.vscodeignore:27`), así que no es CA-1, pero es el documento con el que el vigía-S valida | `docs/GUIA-PRUEBA-v1.md` | **V15** (cuando cambien las claves, la guía deja de funcionar) |

**No existe `CHANGELOG.md`** en el árbol: la CA-1 lo mencionaba como posible
superficie («CHANGELOG de release si existe») y **no existe**. Verificado con
`ls`. No lo he creado: crear un changelog no está en mi encargo.

---

## 8 · Lo que NO pude hacer, y por qué

1. **⏳ Ver el icono en una barra de actividad viva.** Verifiqué el PNG a ojo
   y el SVG renderizado en un motor de navegador (§4.4), pero **no arranqué
   VS Code**: no está en el encargo y el paso «instalar y mirar» pertenece a
   la guía de prueba del vigía-S. **No afirmo que se vea bien en el IDE.**
2. **⏳ La marca en `dist/extension.js`.** El bundle lleva 32 `zigurat` y 15
   `arrakis` heredados de `src/`. Es derivado y el brief lo excluye de la CA,
   pero **hasta que V15 no pase por `src/`, la marca vetada sigue dentro del
   binario que se instala**. Que no cuente para mi CA no lo hace inexistente.
3. **No toqué `release.yml`** aun siendo notas de release y aun estando en el
   alcance de DV-16 → **RES-6**, sin adjudicar.
4. **No cerré la cuestión de la licencia**: ejecuté la directiva y escalé la
   contradicción con la constelación → **RES-5**.

---

## 9 · Dudas para el orquestador

1. **`🎭 Teatro` vs `Aleph-0`** para las 6 categorías del grupo `alephscript.teatro.*`
   (§2.1 #6). Elegí quedarme en la familia visual existente en vez de meter la
   marca en cada categoría. Si el criterio es «una sola marca visible», hay que
   pasar por RES-1 entero, y eso son 20 comandos más.
2. **¿Se revierte el recorte de `(DV-05)` en la `description`?** (§2.1 #2). Es
   un juicio mío.
3. ~~**`license: UNLICENSED` en el manifiesto**~~ — **duda resuelta por el
   custodio** (§4.3-bis y §11): el manifiesto declara `GPL-3.0-or-later`.
4. **RES-6 no tiene dueño.** Alguien tiene que llevarse los 2 puntos de
   `release.yml`.

---

## 10 · Cierre

- **Rama**: `wp/v14-marca-producto`
- **SHA del tip de obra**: `d409e0ad94c1fdd7502d1d78b6ab5241060b08d6`
- **SHA del tip de la rama**: ver el commit de este reporte, inmediatamente
  posterior a `d409e0a`
- **No fusionado. No pusheado. No se tocó `plan/BACKLOG.md` ni `plan/DECISIONES.md`.**

`VEREDICTO_REVISOR: ⏳ pendiente`

---

## Aceptación del orquestador (2026-07-25 · sesión debug)

Revisión ordinaria con spot-check propio (displayName/license/icon/
contenedor `aleph0`/CA-2=0/3 claves `arrakisTheater.*` como única
arrakis-superficie restante/alcance 12 rutas): **✅ ACEPTADO**.
Adjudicaciones de los hallazgos: RES-2 (3 claves `arrakisTheater.*`) y
RES-6 (release.yml:122,124 notas «Zigurat») → **V15** · RES-5 (licencia:
sin patrón de constelación; tensión Todo-FOSS vs UNLICENSED, precedente
z-sdk GPL-3.0-or-later) → **escalada al custodio con el tick público
DEFERRED** · CHANGELOG inexistente → acta del re-release.

---

## 11 · Corrección POST-ACEPTACIÓN · la licencia (custodio, misma sesión)

> **Aviso al lector: esto cambia una pieza que ya estaba aceptada en
> `48d9267`.** El bloque de aceptación de arriba se conserva íntegro y sin
> tocar; esta sección lo enmienda en un punto y sólo en uno.

### 11.1 · Qué pasó

La aceptación mandó **RES-5** «al tick público DEFERRED». Antes de que eso se
consumara, **el custodio respondió en sesión** y la respuesta no era un
deferido, era una **corrección de premisa**:

> «La constelación **sí** tiene un patrón claro de licencia […] Usamos el
> compose creado ad-hoc **Animus Iocandi + GPLv3** porque pensamos que somos
> FOSS y la GPLv3 por el vibecoding ya no protege. **Eso ya está discutido.**»

Y, ante mi pregunta de dónde estaba asentado, señaló la fuente:

> «ver skill de skills-scriptorium **"site-web"**: en información para header o
> footer debe indicar la Licencia correcta basada en compose.»

### 11.2 · La fuente, verificada

Encontrada y leída. `.claude/skills/site-web/reference/pack-marca.md:46-54`
—espejo de `@alephscript/skills-scriptorium`— tiene una sección titulada
**«ADVERTENCIA · licencia canónica ≠ lore»**:

| pieza | rol | NUNCA |
| ----- | --- | ----- |
| `LICENSE.md` (raíz) | **puntero canónico** (p. ej. **GPL-3.0-or-later + capa AI / composite**) | lore / broma editorial |
| página `/licencia` del zine | puede citar lore AIPL como **pieza narrativa** | sustituir el puntero canónico |
| lore AIPL en cantera | solo narrativa del zine | copiarse a `LICENSE.md` |

> Regla: **licencia canónica (puntero/composite) ≠ lore AIPL**.

Dos cosas que esto asienta, y conviene que queden escritas:

1. **El patrón existe, está escrito y es normativo** — no era una convención
   tácita ni un accidente de `z-sdk`. Mi **RES-5** («la constelación no tiene
   un patrón único») era **falso**, y lo era por no haber buscado en el sitio
   correcto: busqué ficheros `LICENSE*` por los repos y no busqué en los
   skills. **Se corrige, no se maquilla.**
2. **Nombra exactamente el hallazgo D7/D19 del censo**: la AIPL es *lore*, y
   el skill dice literalmente que el lore **NUNCA** va en `LICENSE.md`. Lo que
   V14 retiró no era «una licencia que había que sustituir»: era una pieza
   narrativa ocupando el sitio del puntero canónico. La `LICENSE.md` de este
   repo llevaba años incumpliendo una regla escrita del propio ecosistema.

### 11.3 · Qué cambia en la obra

| pieza | aceptado en `48d9267` | **estado final** |
| ----- | --------------------- | ---------------- |
| `LICENSE.md` | `UNLICENSED — derechos reservados al productor del paquete` (16 líneas) | **puntero canónico** Animus Iocandi + GPL-3.0-or-later → composite de `Z_SDK`, `SPDX: GPL-3.0-or-later`, + `Copyright © 2026 alephscriptorium` (13 líneas) |
| `package.json` `license` | `UNLICENSED` | **`GPL-3.0-or-later`** |

Nada más se toca. Las 13 superficies restantes de §2, los iconos, la 13ª
vista, `mcp.svg` y las 26 excepciones **quedan exactamente como se aceptaron**.

### 11.4 · Lo que hay que decir sin adornos

- **Cambié obra ya aceptada.** No es una errata de redacción: el `.vsix` que
  se aceptó declaraba `UNLICENSED` y el que queda declara `GPL-3.0-or-later`.
  Es lo contrario. El orquestador **debe re-mirar esta pieza**; el resto del
  spot-check de `48d9267` sigue en pie.
- **Ejecuté contra la directiva escrita de mi encargo** («texto corto
  UNLICENSED… NO inventes una licencia FOSS»). Lo hice porque la revocó el
  custodio, que es de quien es la licencia — mi propio §4.3 ya decía que
  cerrarla no es de un worker. **La directiva quedó revocada en origen, no
  ignorada por mí.**
- **Tampoco he inventado nada ahora**: el texto está calcado del puntero de
  `g-sdk` y respaldado por la regla del skill. Lo único mío es la línea de
  copyright con titular real, que es lo que cierra **D19**.
- **RES-5 pierde su parte principal.** Lo que sobrevive de ese residual es
  sólo el arrastre ajeno: `a-sdk` y `o-sdk` **siguen con la AIPL en
  `LICENSE.md`**, es decir, siguen incumpliendo la regla del skill; `s-sdk` y
  `e-sdk` no tienen fichero. No es carril V, pero ahora hay una regla escrita
  con la que medirlo.
- **El tick DEFERRED de RES-5 ya no aplica**: la escalada tiene respuesta.

### 11.5 · Evidencia de la re-verificación

Tras el cambio se repitieron los comandos caros por ranura (el árbol cambió,
así que la huella anterior **no** estaba vigente y no se podía citar):

`bash scripts/evidencia.sh vigente compile` salió **1** (no vigente): el árbol
había cambiado, así que **no se podía citar** la corrida anterior. Se ejecutó.

| sello (UTC) | etiqueta | resultado | HEAD | árbol | lockfile | nota |
| ----------- | -------- | --------- | ---- | ----- | -------- | ---- |
| 2026-07-25T17:36:19Z | `compile` | **PASS** | `7ab97a0004ea7acff717894daba575a82f5caf53` | limpio | `sha256:363c08ffd4f544da` | `dist/extension.js` 692,3 kb — **byte a byte sin cambio**: `license` no entra en el bundle |
| 2026-07-25T17:36:34Z | `package` | **PASS** | `7ab97a0004ea7acff717894daba575a82f5caf53` | limpio | `sha256:363c08ffd4f544da` | 28 ficheros · **243,82 KB** (antes 243,92 KB: −100 B, la licencia corta) |

Re-corridos los dos greps de la CA sobre el **paquete real nuevo**:

```
$ grep -rniE "arrakis|zigurat" /tmp/v14pkg2 --exclude-dir=dist | wc -l
26                      ← idéntico: las mismas 26 excepciones declaradas de §3

$ grep -rnE "Aleph ?0|Aleph0|A0\b" /tmp/v14pkg2 --exclude-dir=dist
(sin resultados)        ← CA-2 sigue en 0
```

Y comprobado que la licencia **viaja y es la correcta**, no sólo que el
comando salió 0:

```
$ unzip -l dist/scriptorium-zigurat-0.1.0.vsix | grep -i license
      432  2026-07-25 19:32   extension/LICENSE.md      ← viaja (antes 665 B)

$ grep -n '"license"' /tmp/v14pkg2/extension/package.json
7:  "license": "GPL-3.0-or-later",

$ grep -i license /tmp/v14pkg2/extension.vsixmanifest
… <Asset Type="Microsoft.VisualStudio.Services.Content.License"
       Path="extension/LICENSE.md" …>   ← vsce la registra como asset de licencia
```

El texto extraído del `.vsix` es el puntero canónico íntegro (§4.3),
con `SPDX: GPL-3.0-or-later` y `Copyright © 2026 alephscriptorium`.

> Nota de huella: las filas de §6 (sello `16:58`, HEAD `d409e0a`) **quedan
> obsoletas** y se conservan sólo como historia de la primera pasada. Las
> vigentes son estas dos. Y las de `7ab97a0` quedarán a su vez con HEAD
> anterior al tip final de la rama, porque el commit que arregla este mismo
> reporte mueve HEAD sin tocar código: es el límite conservador que
> `evidencia.sh` declara en su cabecera, no una discrepancia.

`VEREDICTO_REVISOR (de esta corrección): ⏳ pendiente`
