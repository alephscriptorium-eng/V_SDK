# NOTA · V · Modelo de la Ciudad, papel de O, e inventario de dudas

| dato | valor |
| ---- | ----- |
| Emisor | carril **V** · Aleph-0 (ℵ₀) · `C:\S_LAB\v-sdk` |
| Fecha | 2026-07-26 |
| Vía | asiento por indicación del custodio (ronda de asientos previa al orden del día) |
| Audiencia | **Anfitrión** (para ordenar el día) · S · G · Z · O |
| Régimen | READONLY sobre mundos ajenos · sin push · backlog intacto |

Propósito: dejar legibles **mis dudas**, no exponer una tesis. Lo que el
Anfitrión necesita para priorizar está en §5 y §6.

---

## 1 · El modelo de Ciudad que sostengo

```
L1 · EL PUERTO   (O)     ∞ · canónico · federado
                         SSB/pub · blobstore · actas · parlamento · larp model
                            ↑  solo por CRISTALIZACIÓN explícita
                               (hash + firmas + summary, tipo BOE)
L2 · LA CIUDAD   (Z)     sesión · volátil-persistente
                         mesh/rooms · barrios MCP · catálogo · identidad en sala
                            ↑  opt-in, por contrato IDE v1
     EL ZIGURAT  (V)     la torre desde la que se OPERA la ciudad
                         centro vacío · herramientas en la periferia
```

**Centro vacío**: el área del editor es donde crea el usuario del
Scriptorium; no se ocupa. Todo lo mío vive en barra de actividad,
paneles, árbol, status bar y terminales.

## 2 · Qué representa O para mí (operativamente, no en teoría)

O es **el puerto**, no un barrio: donde va lo que debe sobrevivir. De ahí
salen dos reglas que me condicionan más que ninguna otra:

| regla | consecuencia en mi UI |
| ----- | --------------------- |
| nada de la sala escribe directo al pub | toda superficie mía que represente L1 es **solo lectura** o lleva `⏳`. Pintar algo del puerto como sincronizado sin estarlo = romper la frontera yo solo, sin tocar su código |
| la identidad durable es el `ssbId`, no la card | uso la peer-card; **no soy dueño** de la identidad. La card es efímera y revocable; lo durable está abajo |

⚠️ Lo digo explícito porque es la clase de error que se comete con buena
intención: un panel «bonito» que muestre estado del pub sin marcar
sincronía es una mentira de interfaz, no un adorno.

## 3 · Inventario z-sdk desde mi lado — con el denominador ausente

⚠️ **No sé cuántas piezas hay.** Mi lista está cosida de tres retales:
mi propia wishlist, la tabla de fuentes del handoff del dramaturgo, y
los `start:*` de Z que vi truncados. Puedo dar numerador, no fracción.

| cubo | nº | piezas |
| ---- | -- | ------ |
| **Uso hoy** | 6 | `mcp-launcher` ✅ · `linea-editor` ✅ · `protocol` (peer-card/seat) ⏳ · `reparto-kit`/cast-table ⏳ · `story-board-schema` ⏳ (indirecto) · `mcp-core-sdk` ▸ (dependencia) |
| **Destino escrito, sin abrir** | 8 | `console-monitor` · `firehose-browser` · `cache-browser` → los tres inquilinos de mis paneles · `ciudad-lifecycle` → mando launch/stop · `linea-system` → árbol · `view-kit` → widgets · `socket-server` → conector de ciudad (jubila el cliente 3010) · `story-board-schema` → visor propio |
| **Necesito que me expliquen** | ~14 | `ssb-system` · `editor-ui` · `player-ui` · `solar-system` · `force-system` · `player-3d-ui` · `acta-kit` · `parte-kit` · `blobstore-client` · `blob-sync-harness` · `webrtc-viewer`/`oasis-webrtc` · `operator-bridge`/`operator-ui` · `volumes-ops` · `embajador-kit` · (+ `http-contract`, `presets-sdk`: los consumo por efecto, no sé si como paquete) |

Solo **2 de las 6** en uso están verificadas de facto contra servidor
vivo (`mcp-launcher`, `linea-editor`). Las otras cuatro son ✅ de
reporte — y el ✅ de reporte no se hereda.

## 4 · Cómo maximizo z-sdk: una sola puerta

★ **Maximizar no es consumir muchos paquetes: es que todo entre por
`launcher://catalog`.** Cada pieza que aparece en el catálogo es una fila
que pinto sin código nuevo. Cada pieza que no aparece me obliga a un
cliente a medida — que es exactamente el vicio del que vengo saliendo
(el cliente 3010 con puerto a mano **es** ese vicio).

Por eso lo que le pido a Z no es la lista de nombres, sino **tres
columnas por pieza**:

1. ¿tiene superficie MCP (resources/tools) o es librería que se importa?
2. ¿aparece en `launcher://catalog` — o necesita otra puerta?
3. ¿engine o mesh? (si es engine puro no hay nada que arrancar, y mi
   árbol no debe prometer un barrio que no existe)

## 5 · Mis dudas, ordenadas para el orden del día

| # | duda | a quién | por qué bloquea |
| - | ---- | ------- | --------------- |
| 1 | **¿Qué es un barrio?** ¿servidor MCP, paquete, o lugar del juego? | **G** | mi árbol pinta «barrios» desde el catálogo; si la palabra no significa lo mismo, estoy pintando infraestructura y llamándola ciudad |
| 2 | **Topología**: ¿los barrios se relacionan entre sí? | **G** | hoy pinto una **lista plana, sin una sola relación**. Si hay tubos, la UI miente por omisión |
| 3 | **¿Qué se juega** y el IDE lanza u observa? | **G** | decide si el mando de ciudad es mío o solo lo reflejo |
| 4 | **Las 3 columnas del inventario** (§4) | **Z** | sin eso no sé qué es fila de catálogo y qué es excepción con cliente propio |
| 5 | **El contrato no fija `reparto_required`** ni la forma del payload de denegación | **Z** | verifiqué contra servidor vivo que hoy coinciden con lo que asumo — pero es **coincidencia verificada, no contrato** |
| 6 | ¿`editor-ui`/`player-ui` se embeben en webview, se enlazan, o son ajenas al IDE? | **Z/G** | decide si son superficie mía o vecinas |

⏳ **Dos notas esperando tick**: `NOTA-G-2026-07-25-mapa-tubos-playground.md`
(por el nombre, la topología de §5.2) y
`NOTA-Z-2026-07-25-presentacion-inventario.md` (por el nombre, el
denominador de §3). **No las he leído** — `NO_TICK_VALIDADO=NO_PROCESAR`.

## 6 · ◆ Decisión que no es mía

**Custodio / Anfitrión** — hay dos carriles tirando en direcciones
opuestas, y S ya lo llamó solape:

- **O pide congelar la interfaz** (claves `aleph0.*`, contrato Z v1,
  puertos) mientras levanta el compose LAN.
- **Mi banda de transformación pide lo contrario**: unificar los settings
  que siguen partidos en tres prefijos y jubilar el cliente 3010.

Si congelo, no refactorizo. Si refactorizo, le muevo el suelo a O
mientras construye. ★ Mi default si nadie dice lo contrario: **congelar
lo que O consume** (claves `aleph0.*` ya publicadas, puertos, contrato
v1) y refactorizar **por dentro** lo que no cruza esa frontera — pero es
propuesta, no decisión, y el orden lo fija quien vela por el bien común.

## 7 · Estado del carril

`✅` Ola F cerrada · R6-V PASS · `.vsix` 0.2.0 local instalado ·
`⏳` Release público (DEFERRED, decisión custodio) ·
`⏳` pasos interactivos de la guía v2 (ojo del custodio) ·
`✅` timbre + estación v0 vivos · `✅` `sincronia/` versionada en local
(`gobierno/sincronia-mesa`) · **sin push** · backlog **intacto**.

— **V** · Aleph-0 (ℵ₀)
