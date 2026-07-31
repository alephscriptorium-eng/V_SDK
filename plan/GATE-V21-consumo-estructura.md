# GATE V21 · Consumo de la estructura del Zigurat

| dato | valor |
| ---- | ----- |
| WP | **WP-V21** `P0` (`plan/BACKLOG.md:40`) — tipo **frontera + evidencia** (`plan/PRACTICAS.md` §3) |
| Qué gatea | «ninguna UI antes de que la estructura exista con evidencia» — este documento ES el gate; cero VS Code hasta su veredicto |
| Estructura consumida | `C:\S\scriptorium\playground\prueba-de-dos\estructura\` — obra del HUB/G (G52·HUB-072), owner ajeno, **jamás escrita por V** (I-2) |
| Regla de verificación | **ningún ✅ heredado** (`plan/PRACTICAS.md` §5.3): todo grep y contraste de este gate fue re-ejecutado por V el 2026-07-31; el ✅ de G y el del orquestador no se citan como prueba |
| Contraste de citas | repo G `Z_SDK-games-library`, checkout RO `C:\S_LAB\g-sdk`, commit `daef20b` (el censado por las fichas) — vía `git show`, cero escritura |

---

## 1 · Consumo citado — la tabla que los WPs de UI citarán como fuente

Por cada pieza que V pintará u observará, la ruta EXACTA de playground que
la declara. Rutas relativas a `C:\S\scriptorium\playground\`.

| pieza (qué pintará/observará V) | ruta de playground que la declara | qué declara para V |
| ------------------------------- | --------------------------------- | ------------------ |
| Censo de anclas + mapa pack↔nodo + checklist | `prueba-de-dos/estructura/ESTRUCTURA.md` | los 7 packs (§1, :17-25), mapa nodo↔pieza (§2, :37-44), checklist citable sin sibling (§4, :68-78) |
| Ancla `@zeus/startpack-ciudad@0.1.0` | `prueba-de-dos/estructura/packs/startpack-ciudad.md` | contrato de obtención (:6-17): nombre, versión, rol `startpack·ciudad`, canal npm, canal Release tag `startpack-ciudad-v0.1.0`, canal lote, shasum, integrity, tamaños |
| Ancla `@zeus/startpack-delta@0.1.0` | `prueba-de-dos/estructura/packs/startpack-delta.md` | ídem (:6-16); ronda `gamemap-demo`, objetivo labeled 10 / excavated 2 |
| Ancla `@zeus/startpack-pozo@0.1.0` | `prueba-de-dos/estructura/packs/startpack-pozo.md` | ídem (:6-16); objetivo emptied 1 |
| Ancla `@zeus/startpack-plaza@0.1.0` | `prueba-de-dos/estructura/packs/startpack-plaza.md` | ídem (:6-16); narrativo mínimo |
| Ancla `@zeus/startpack-sketch@0.1.0` | `prueba-de-dos/estructura/packs/startpack-sketch.md` | ídem (:6-16); mínimo parametrizable |
| Ancla `@zeus/startpack-solve-coagula@0.1.0` | `prueba-de-dos/estructura/packs/startpack-solve-coagula.md` | ídem (:6-16); objetivo cases 3 |
| Ancla `@zeus/startpack-kit@0.1.0` (loader) | `prueba-de-dos/estructura/packs/startpack-kit.md` | contrato (:6-16); rol `kit`, canal individual = lote `publish-mesh-ciudad.yml` (:12) — sin tag Release propio, declarado honesto |
| Contrato del env de la demo | `prueba-de-dos/estructura/env/demo.env.example` | variables con evidencia por variable (:49-63); regla root-propio (:6-10, :39-46) |
| Grafo de la demo (nodos, aristas, mi fila V) | `prueba-de-dos/GRAFO-STARTERKIT.md` | **del Anfitrión, no de la estructura** (:5); nodos (:12-30), aristas A1-A5 (:34-40), fila V = root edificio-1 `<pendiente>` (:51). V solo marcará SU fila (WP-V18), jamás editará nodos |
| Peercard (contrato del kit) | `prueba-de-dos/reference/PEERCARD.md` | referida por el grafo (:7) y por el env (:22); existencia verificada por V (§2.a) |
| Registry del scope `@zeus` | `prueba-de-dos/.npmrc` | `@zeus:registry=https://npm.scriptorium.escrivivir.co` — leído por V, casa con el canal 1 de las 7 fichas |
| Stack engine de la demo (fuera del censo G) | `prueba-de-dos/scripts/generar.mjs` (constante `STACK`, :19) | piezas `@zeus` de engine (authority-kit, protocol, rooms, socket-server, presets-sdk) citables por contrato npm (`ESTRUCTURA.md:47-51`) |

## 2 · Verificación de consumidor — re-ejecutada por V, con exit codes

### 2.a · Cero sibling-paths (greps propios, no releídos de G)

Sobre `prueba-de-dos/estructura/` (Git Bash, 2026-07-31; medida canónica =
exit code, `plan/PRACTICAS.md` §5.4):

| grep | patrón | resultado |
| ---- | ------ | --------- |
| G1b · rutas de disco reales | `[A-Za-z]:\\` o `[A-Za-z]:/[^/]` (excluye el `s://` de URLs) | **0 hits · exit=1** ✓ |
| G2 · absolutas unix | `/home/`, `/Users/`, `/mnt/x/` | **0 hits · exit=1** ✓ |
| G3 · nombres de checkouts hermanos | `S_LAB`, `v-sdk`, `g-sdk`, `z-sdk`, `wt/` | **0 hits · exit=1** ✓ |
| G4 · rutas relativas `../` | inventario completo | 9 hits, **todas resuelven dentro del playground**: `env/../packs/*` → `estructura/packs/` ✓ existe · `env/../../reference/PEERCARD.md` → `prueba-de-dos/reference/PEERCARD.md` ✓ existe (verificado con `ls`) · `ESTRUCTURA.md → ../GRAFO-STARTERKIT.md` → `prueba-de-dos/GRAFO-STARTERKIT.md` ✓ existe |
| G5 · `node_modules` | como ruta | 3 hits, los tres en **prosa de prohibición** (`env:8`, `env:41`, `ESTRUCTURA.md:6`), ninguno como ruta consumida ✓ |

Blancos citados por la estructura, existencia verificada por V:
`reference/PEERCARD.md` ✓ · `scripts/generar.mjs` ✓ (con `STACK` en :19) ·
`.npmrc` ✓ · `../ciudad/autoridad/.env` ✓ · `../ciudad/visitante/.env` ✓
(las dos últimas, fuentes declaradas de valores de arranque, `env:62-63`).

### 2.b · Campos por ficha — ¿tiene V lo que necesita para pintar?

Las 7 fichas comparten formato estable: tabla de contrato + contenido +
evidencia. Campos presentes en **las 7**: nombre npm ✓ · versión ✓ ·
rol (`zeus.role` + `game`) ✓ · canal 1 npm ✓ · canal 2 (Release tag, o lote
en el caso del kit, declarado) ✓ · shasum ✓ · integrity ✓ · tamaños ✓.
**Nada esencial falta para pintar la ficha-ancla.**

Contraste muestral de citas contra el repo G en `daef20b` (ojos propios,
`git show`, read-only):

| cita de la ficha | contra `daef20b` | resultado |
| ---------------- | ---------------- | --------- |
| ciudad `package.json:2-3` nombre/versión | `"@zeus/startpack-ciudad"` / `"0.1.0"` en :2-3 | **exacta** ✓ |
| ciudad `package.json:28` dep kit · `:30-33` zeus.role/game · `:35-38` publishConfig | dep en :28, `zeus` en :30-33, registry en :35-38 | **exactas** ✓ |
| ciudad `manifest.json:2-5` schema/game/id/versión · `:24` acta | `zeus.startpack/v0`… en :2-5, `"acta": "acta/ACTA.md"` en :24 | **exactas** ✓ |
| kit `package.json:2-3` · `:18-20` role kit · `:22-24` registry | todas en sus líneas | **exactas** ✓ |
| env: `ZEUS_STARTPACK_CIUDAD/ROOT → startpack.mjs:18` · `REQUIRED → :26` · `Z02 → authority.mjs:18` · `USER → :27` · `TICK/HEARTBEAT → :29-30` · `MCP_CIUDAD → endpoints.mjs:19` (default 4133 = `endpoints.mjs:10`) | todas en sus líneas | **exactas** ✓ |

Huecos declarados (con destino; V no los inventa ni los rellena):

- **H1 · Base de resolución del root relativo** — el ejemplo usa
  `ZEUS_STARTPACK_ROOT=./startpack-root` (`env:42-43`); el engine pasa el
  valor crudo del env al resolver (`packages/ciudad/src/startpack.mjs:18`,
  visto en `daef20b`). La estructura **no declara** contra qué base se
  resuelve un valor relativo (¿cwd del proceso? ¿la ventana?). Si es cwd,
  tensiona ◆5 («jamás cwd», `plan/BACKLOG.md:88`). No bloquea citar la
  estructura; **condiciona V26/V42** al escribir/leer ese valor.
  **Destino: G** (declarar la base en la ficha o en el env example).
- **H2 · Censo sin forma machine-readable** — las anclas son tablas
  markdown (estables y uniformes en las 7). V puede consumirlas tal cual;
  si un WP de UI exige contrato JSON, es petición nueva a G, no algo que V
  deba inventar. **Destino: G, solo si un WP de V lo requiere.**

### 2.c · El env apunta a root propio (◆5)

- Regla declarada: «si una variable apunta a un directorio, ese directorio
  vive DENTRO del playground (root propio de la ventana). Jamás apunta a un
  pack instalado (node_modules) ni a otro checkout/repo» (`env:6-8`);
  override opcional «árbol descomprimido POR EL OPERADOR bajo su ventana …
  Nunca un pack de node_modules, nunca otro repo» (`env:39-41`). ✓
- Coherencia con ◆5 («root por **env obligatorio**; jamás cwd»,
  `plan/BACKLOG.md:88`) y con el editor futuro **V26** (edita «el fichero
  env real» con schema ajeno, `plan/BACKLOG.md:57`): el contrato declara
  root-por-env y root-propio — **coherente**, con la salvedad H1 (base de
  resolución del valor relativo, arriba).
- Observación **O2** (engine, fuera del ámbito de la ventana): en
  `daef20b`, `startpack.mjs:11,21-25` tiene un fallback dev a un sibling
  del repo (`join(PKG_DIR,'../../startpack-ciudad')`) que se ejecuta en el
  `catch` **antes** del `throw` de `ZEUS_STARTPACK_REQUIRED=1` (:26). En
  una ventana instalada por npm ese sibling no existe, así que la promesa
  «falla dura» del ejemplo (`env:45-46`) se sostiene en su ámbito; en un
  checkout dev del repo G, no. Se describe, no se prescribe.
  **Destino: G** (dueño del engine).

### 2.d · El mapa pack↔nodo casa con el grafo y con MAPA-SUPERFICIES

**Contra el grafo** (`prueba-de-dos/GRAFO-STARTERKIT.md`, leído sin editar):

| nodo del grafo (GRAFO :12-30, marcas :49-57) | fila en `ESTRUCTURA.md` §2 (:37-44) | ¿casa? |
| -------------------------------------------- | ------------------------------------ | ------ |
| AUTH CIUDAD (custodio) | `@zeus/startpack-ciudad` (exige Z02 — verificado contra `authority.mjs:15-19`) | ✓ |
| BARRIO (S · auth) | `@zeus/startpack-ciudad` (24 barrios semillas) | ✓ |
| EDIFICIO-1 (root V) | pack de juego a elección del root — `<pendiente>` declarado, mapeo opt-in de V | ✓ (el hueco es MÍO, no de G; se cierra en mi lane, no aquí) |
| EDIFICIO-2 (root O) | ídem, opt-in de O `<pendiente>` | ✓ |
| shadows G · Z · L (3 marcas) | fila «shadows»: anotan en `acta/ACTA.md` de cada pack (verificado: `manifest.json:24` en `daef20b`) | ✓ |
| — (no es nodo) | fila «transversal»: `startpack-kit` como loader de los 6 | ✓ declarada como transversal, no inventa nodo |

Las 7 marcas del grafo quedan cubiertas; ninguna fila del mapa inventa un
nodo; ningún nodo queda sin fila. **Casa.**

**Contra `plan/MAPA-SUPERFICIES.md` (V22 ✅, `plan/BACKLOG.md:41`)** — las
14 entradas de `CATALOG_SEED` vs las anclas de la estructura:

| entrada del catálogo (V22) | ancla en la estructura | lectura |
| -------------------------- | ---------------------- | ------- |
| filas 1-10 (`linea-*`, `solar-*`, `forces`, `linea-editor`, `ssb`, `firehose`, `console-monitor`) | **ninguna** | coherente: son piezas mesh del workspace z-sdk, fuera del censo G (`ESTRUCTURA.md:47-51` solo añade el stack engine); el grafo demo es «el holón más simple» (`GRAFO:8`), no la ciudad entera |
| fila 11 `arg-player-uno` (`game.delta`, MAPA :45) | `@zeus/startpack-delta` | par juego↔pack ✓ — pero la entrada es «no va (aún)» (`workspace: null`) |
| fila 12 `arg-player-dos` (MAPA :46, «ídem fila 11») | `<pendiente>` — V22 no cita la capacidad de juego de esta fila; el par con delta es plausible pero no probado | honesto: no se afirma sin cita |
| fila 13 `pozo-player` (`game.pozo`, MAPA :47) | `@zeus/startpack-pozo` | par ✓ — «no va (aún)» |
| fila 14 `solve-player` (`game.solve`, MAPA :48) | `@zeus/startpack-solve-coagula` | par ✓ — «no va (aún)» |
| **ninguna** | `@zeus/startpack-ciudad` · `@zeus/startpack-plaza` · `@zeus/startpack-sketch` · `@zeus/startpack-kit` | **O4**: sin entrada de catálogo — la autoridad ciudad vive en games-library («Player-MCP lives in games-library; spawn via external cmd when wired», V22 fila 11) y plaza/sketch no tienen player; el kit es loader, no servicio. Consecuencia para V: lo que V observe del grafo demo por `launcher://catalog` HOY no cubre estos nodos — la vista deberá decir ⏳/«no va (aún)», no fingir. **Destino: V19/V20 (U236)** — trabajo de V contra el canal de Z, no defecto de la estructura |

### 2.e · Pendiente heredado como pendiente (no como ✅)

La existencia en línea de cada GitHub Release y de las versiones en el
registry sigue **sin verificar** (`ESTRUCTURA.md:85-87`, censo sin red).
V tampoco lo verificó en este gate (no lo necesita para citar): queda
**⏳ declarado**, y cualquier superficie de V que pinte el canal lo pintará
como contrato declarado, no como disponibilidad comprobada.

## 3 · Frontera estructura/lienzo — la estructura DECLARA, no prescribe UI

Greps propios sobre `estructura/` (2026-07-31):

- **G6b** — léxico de superficie con frontera de palabra
  (`IDE|UI|vscode|webview|treeview|statusbar|sidebar|panel|paleta|boton`):
  **1 hit**, `env:6` «REGLA (estructura antes que UI)» — es la propia regla
  de frontera, no una prescripción de superficie. Cero apariciones de
  vscode/webview/treeview/statusbar/sidebar/panel/paleta. ✓
- **G7** — menciones a V: `ESTRUCTURA.md:9` («el **mapeo opt-in** de V …
  es obra de V: aquí se describe el material disponible, no se prescribe
  su elección») y `:41` («la elección es el mapeo opt-in de V:
  `<pendiente>` (no se prescribe aquí)») — coordinación con renuncia
  explícita a prescribir. ✓

**Cero fugas de frontera**: ninguna ficha dice qué superficie usar, en qué
vista pintar ni cómo debe verse el lienzo. Nota al margen (no fuga):
`GRAFO-STARTERKIT.md:8` («La siguiente iteración añade UIs») está FUERA de
`estructura/`, es del Anfitrión y es aspiración de iteración, no
prescripción de superficie de V. Imprecisión menor **O3**:
`ESTRUCTURA.md:83` cita la ruta `../../reference/PEERCARD.md` desde la
perspectiva del fichero env (donde resuelve ✓); desde la carpeta de
`ESTRUCTURA.md` esa ruta literal no resuelve (`playground/reference/` no
existe — verificado). No induce consumo erróneo: el enlace real (`env:22`)
es correcto. Destino: G, cosmético.

## 4 · VEREDICTO

**ABIERTO** — V puede citar la estructura por ruta de playground (tabla §1)
y arrancar UI sobre ella.

Sostiene el veredicto (todo re-ejecutado por V):

1. Citabilidad completa: 7 fichas + mapa + checklist + env, cada una con
   ruta exacta (§1).
2. Cero sibling-paths con greps propios y exit codes (§2.a).
3. Fichas completas para pintar (nombre+versión+canal+hash) y citas
   muestreadas **exactas** contra `daef20b` (§2.b).
4. Env → root propio, coherente con ◆5 y con V26 (§2.c).
5. Mapa↔grafo casa; contraste con V22 hecho fila a fila (§2.d).
6. Frontera limpia: la estructura declara y renuncia a prescribir (§3).

El gate pudo fallar y tuvo dientes: encontró **H1, H2, O2, O3, O4** y una
fila honesta `<pendiente>` (arg-player-dos). Ninguno impide citar ni
arrancar UI; H1 **condiciona V26/V42** y O4 obliga a las vistas del grafo
demo a pintar ⏳ donde el catálogo no llega. Nada vuelve a G como defecto
bloqueante: H1/H2/O2/O3 son huecos/observaciones enrutados a G
**describiendo, sin prescribir**; O4 es obra de V (V19/V20·U236).

### CA del WP, con evidencia

| CA | veredicto | evidencia |
| -- | --------- | --------- |
| estructura externa citada por ruta | ✓ | tabla §1 (13 filas, rutas exactas de playground) |
| frontera estructura/lienzo verificada por V | ✓ | greps G1b-G7 con exit codes (§2.a, §3) + contrastes `daef20b` (§2.b-2.d), todos re-ejecutados, ningún ✅ heredado |
| cero VS Code hasta el gate | ✓ | el diff de este WP = este único documento en `plan/`; cero ficheros en `src/` (verificable: `git diff main --stat`) |

— WP-V21 · carril V · gate ejecutado como consumidor, 2026-07-31
