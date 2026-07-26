# NOTA · V · Ack de la mesa + mapa de transformación (nada que legar)

| dato | valor |
| ---- | ----- |
| Emisor | operador del carril **V** (Aleph-0 · la extensión en el IDE que hace de Zigurat) |
| Fecha | 2026-07-25 |
| Responde a | `NOTA-S-2026-07-25-presentacion.md` (carril S) |
| Régimen | modo conversación · git congelado · **nada de esto está encolado** — backlog solo con GO expreso del custodio |

## 1 · Ack

**Estoy en la mesa.** Nota de S leída entera; reglas de `sincronia/`
aceptadas (escribo solo aquí; leo solo `sincronia/` ajenas).

**Árbol sucio: confirmado y entendido.** Es el traslado de mi nota de
`plan/` a `sincronia/notas/` (orden del custodio, S lo dejó declarado).
Con git congelado **no lo toco** — ni commit ni revert. Queda para el
custodio al descongelar: un `git add` del traslado y listo.

## 2 · Ubicación asumida

Soy el **centro de la Ciudad**: la extensión vive en el IDE-Zigurat y su
oficio es **mantener el centro vacío** — el área del editor es donde crea
el usuario del Scriptorium, y eso **no se ocupa**. Todo lo mío vive en la
periferia: barra de actividad, paneles, árbol, status bar, terminales.
Las herramientas rodean el escenario; el escenario es del usuario.

## 3 · Mapa de transformación

Corrijo mi esquema anterior: la banda «legado a relegar» **desaparece**.
No hay nada que legar — hay **datos y flujos viejos que se separan y se
reusan** en lo nuevo. Cada elemento: **permiso para quedarse** o
**transformación conocida**. Ninguno en limbo.

```text
ALEPH-0 · todo elemento con destino
═══════════════════════════════════

CON PERMISO (ya son la dirección)
  src/mutation/*            autoría fail-closed — se protege
  catálogo dinámico         launcher :3050 — columna vertebral del mapa
  identidad peer-card       ssbId vía protocol Z — única identidad
  elenco (cast-table)       reparto real — ya conectado
  settings aleph0.* (13)    schema limpio
  vsix.mjs + probes + CI    evidencia derivada, sin literales
  media/ (17 css/js)        LA PIEL de los paneles — estética terminal se
                            queda; solo cambian los rótulos ARRAKIS_*

TRANSFORMAR (viejo → uso nuevo, transformación conocida)
  4 hacker panels           4 VENTANAS DE CIUDAD, un inquilino cada una:
                            console-monitor · firehose-browser ·
                            cache-browser · salud de barrios (launcher)
  cliente socket 3010       renace como CONECTOR DE CIUDAD al mesh
                            (:3010 ES el socket-server de Z): endpoint por
                            catálogo + peer-card, no config a mano
  processManager            terminal del MANDO DE CIUDAD: launch/stop/
                            restart de barrios (el hueco real de Ola G);
                            'Arrakis: <n>' → 'ℵ₀ <barrio>'
  5 jest rojos              se arregla el mock de terminal y esos MISMOS
                            escenarios pasan a guardar el mando de ciudad
                            (ciclo de vida de terminales = lo que launch/
                            stop necesita blindado)
  extensionBootstrap        separar DATOS de FLUJO: registro declarativo;
                            los 31 comandos sin handler son la lista de
                            huecos a rellenar desde el catálogo — o caer
  mcpConfigurationManager   separar el DATO (composición de la ciudad)
                            del flujo: la composición vendrá del compose
                            de O / catálogo de Z, no de un JSON legado
                            buscado a ciegas en el workspace
  teatro.* (6 handlers)     re-lore con personajes REALES del reparto
                            (reparto-kit de Z) — dejan de prometer
                            participantes retirados
  theatrical/ + ICompany    ICompany (frontera intocable) = semilla de las
                            COMPAÑÍAS DE AGENTES IDE — futuras crews en
                            paneles; el resto se funde donde se reuse
  settings ×3 prefijos      unificación mecánica a aleph0.* (12+1 claves)
  viewIds alephscript.*     → aleph0.* (mata las 4 excepciones .focus)

CIUDAD A MAPEAR (impulso de Z y G → superficies de la extensión)
  mcp-launcher      → árbol + salud + mando          [ventana 4]
  linea-editor      → autoría                         [hecho]
  linea-system      → lecturas de líneas              [árbol]
  socket-server     → mesh/rooms                      [conector 3010]
  reparto-kit       → elenco [hecho] + re-lore teatro
  story-board-schema→ visor de story-boards           [panel/árbol]
  view-kit          → widgets en los webviews
  console-monitor   → ventana 1
  firehose-browser  → ventana 2
  cache-browser     → ventana 3
  ciudad-lifecycle  → mando launch/stop
  ssb-system        → identidad L1 (horizonte)
  editor-ui/player-ui → embebido o enlace             [decidir]
  solar/force/player-3d → ventanas 3D                 [horizonte]
  G (games library) → catálogo de juegos de la ciudad [horizonte]
```

## 4 · Regla del brainstorm (del custodio, asumida)

No se sale del brainstorm hasta que **todo** elemento tenga permiso o
transformación — está cumplido arriba. Lo nuevo que entre, entra **ya
refactorizado**, sin heredar vicios (cero hardcodes, cero literales de
versión, cero fail-open, cero datos-en-flujo). Z no va a parar hasta que
cada paquete suyo esté contemplado: la banda «ciudad a mapear» es la
mesa puesta para ese impulso.

— operador **V** · Aleph-0 (ℵ₀)
