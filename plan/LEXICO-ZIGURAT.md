# LÉXICO-ZIGURAT — glosario del dominio que V pinta

| dato | valor |
| ---- | ----- |
| Entregable de | **WP-V27** · Léxico del Zigurat (`plan/BACKLOG.md:42`) |
| Papel | glosario **citable** de los términos de la ontología (barrio, zona, ámbito, edificio, pieza, corpus) y de los que el plan de V ya usa; tabla de colisiones como **insumo de V23** (claves→ontología) y V19 — este doc **no** corrige código |
| Invariante que refleja | `plan/PRACTICAS.md:61-63` §2.2 — «Ámbitos, no cadenas de mando»: ningún término definido aquí implica jerarquía de autoridad (verificación en §2) |
| Convención de citas | sin prefijo = este repo (v-sdk) · `z:` = `C:\S_LAB\z-sdk` (RO) · `pg:` = `C:\S\scriptorium\playground` (RO) |
| Greps | ejecutados 2026-07-31 sobre `src/` y `plan/` de este repo y sobre las fuentes RO; conteos por ocurrencia (`grep -rio … | wc -l`), no por línea, salvo nota |

---

## 1 · Glosario

Orden alfabético. **Estatus**: `ontología` = definido en la fuente ajena
citada (z-sdk / playground); `acuñación V` = término acuñado por este
carril, sin fuente externa que lo defina; `consumido` = término ajeno que
V usa tal cual, sin redefinirlo.

| término | definición (1-3 líneas) | fuente | estatus |
| ------- | ----------------------- | ------ | ------- |
| **ámbito** | Un *dónde* semántico que agrupa sin mandar: el género común de barrio y zona. Las vistas de V lo dibujan como pertenencia, nunca como cadena de mando; ámbitos que solapan se dibujan como solapes. | `plan/PRACTICAS.md:61-63` (invariante §2.2) · z:`plan/BACKLOG.md:248` (U196 «Zonas como ámbito real») · z:`plan/BACKLOG.md:286` (U217 «Barrio = ámbito, no proceso») | ontología (Z) + invariante V |
| **asiento (seat)** | Sello de identidad de una peercard: la firma `ssbId` que el caller adjunta vía protocol y que se verifica al entrar («`sig` — firma / sello del asiento»). Cuándo es obligatoria es obra de Z (U190). | pg:`prueba-de-dos/reference/PEERCARD.md:19,26-28` · z:`plan/BACKLOG.md:237` (U190 «`seat` y firma de asiento») · z:`plan/GOBIERNO-EJECUCION-F2.md:118` (`peer-card-seat.mjs`) · uso en V: `src/identity/RoomIdentityService.ts:81,131` | ontología (Z) — ⚠️ polisemia, ver §3 C4 |
| **barrio** | Ámbito del dominio de la Ciudad donde se monta obra; **no es un proceso ni un servicio** (U217: «ningún consumidor confunde barrio con servicio»). En la topología demo hay 24, con `estado` jugable; en el grafo, un barrio **aloja** edificios. A V le llega como dato del catálogo (`tree.barrio`). | z:`plan/BACKLOG.md:286` (U217) · pg:`prueba-de-dos/estructura/packs/startpack-ciudad.md:22` («24 barrios con `estado` jugable») · pg:`prueba-de-dos/GRAFO-STARTERKIT.md:19-22` (BARRIO · aloja) · uso en V: `src/launcher/types.ts:21` | ontología (Z/G) |
| **card / peercard** | Credencial no-crypto de ciclo de vida corto que la **autoridad** emite a un peer; campos mínimos `id`, `sig`, `issuedAt`, `features`. No hay servicio emisor aparte: «la card viaja con quien entra». | pg:`prueba-de-dos/reference/PEERCARD.md:11-21` · pg:`prueba-de-dos/GRAFO-STARTERKIT.md:44-45` · uso en V: `src/identity/protocolApi.ts:3-31` (tipo `PeerCard`) | ontología (Z) — grafías en §3 C3 |
| **catálogo** | Inventario declarativo de piezas del mesh («Actuator data only») que el launcher de Z publica como resource `launcher://catalog`; V lo consume en caliente para construir su inventario, no lo posee ni lo importa como módulo. | z:`packages/mesh/mcp-launcher/src/catalog.mjs:4,59` (`CATALOG_SEED`, verificado de primera mano 2026-07-31) · z:`packages/mesh/mcp-launcher/src/launcher-server.mjs:42` (`uri: 'launcher://catalog'`) · `plan/MAPA-SUPERFICIES.md:7-17` | ontología (Z) |
| **ciudad** | El dominio entero que el runtime de Z corre y que V observa y manda **por contrato**. Su topología demo la trae `@zeus/startpack-ciudad`: plaza + zigurat (gobernanza), 6 distritos, 24 barrios; en el grafo, la autoridad de ciudad **conecta** el barrio (topología, no mando). | `plan/VISION.md:5` («el IDE desde el que se opera la Ciudad») · pg:`prueba-de-dos/estructura/packs/startpack-ciudad.md:21-25` · pg:`prueba-de-dos/GRAFO-STARTERKIT.md:14-19,39` | ontología (G/Z) |
| **corpus** | Conjunto de datos con identidad propia dentro de un volumen, medible y direccionable (`firehose://corpus/{corpusId}`; «tamaño por volumen/corpus/línea»). Las *forces* y *cotas* de Z son corpus con rol. | z:`plan/DATOS.md:88` · z:`docs/contracts/mcp-resources.md:22-23` · z:`plan/VISION.md:101-102` | ontología (Z) |
| **edificio** | Nodo del grafo **alojado** en un barrio donde un root ancla su ronda con un pack de juego (edificio-1 = root V; edificio-2 = root O); en el gamemap ciudad, entrada del catálogo `arbol`. En el catálogo del launcher es clave reservada e ignorada hasta que G fije semántica (U216). | pg:`prueba-de-dos/GRAFO-STARTERKIT.md:22-27` · pg:`prueba-de-dos/estructura/ESTRUCTURA.md:41` · pg:`prueba-de-dos/estructura/packs/startpack-ciudad.md:23` · z:`plan/BACKLOG.md:285` (U216) · uso en V: `src/launcher/types.ts:22`, `plan/BACKLOG.md:49` (V18 «entrar al grafo como edificio-1») | ontología (G/Z) |
| **grafo** | Las conexiones previstas del starter-kit: nodos (auth ciudad, barrio, edificios, shadows), aristas y la tabla de MARCAS append-only donde **cada carril marca solo su fila**. La estructura la mantiene el Anfitrión; marcar sin entrada real = falsedad de interfaz. | pg:`prueba-de-dos/GRAFO-STARTERKIT.md:5-6,10-30,47-61` | ontología (hub) |
| **holón** | Unidad de una cadena que es a la vez todo y parte (método `holarquia`: cadena regida por dos leyes, crecimiento solo por junturas). El **holón-7** = las 7 marcas del grafo completadas — «el holón más simple de la cadena que explica L — el 7 (la casa del método)». | pg:`prueba-de-dos/GRAFO-STARTERKIT.md:8` · `.claude/skills/holarquia/SKILL.md:14-15,27` · uso en V: `plan/BACKLOG.md:49` (V18 BLOQUEA holón-7) | ontología (método) |
| **maquinaria** | Tercera clave del catálogo `arbol` del gamemap ciudad junto a edificio («edificios / maquinarias»); en el catálogo del launcher, reservada e ignorada como `tree.maquinaria` hasta U216. Semántica de dominio: ⏳ sin fijar. | pg:`prueba-de-dos/estructura/packs/startpack-ciudad.md:23` · z:`plan/BACKLOG.md:285` (U216) · uso en V: `src/launcher/types.ts:23` | ontología (G/Z) — ⏳ |
| **pieza** | Unidad de obra con **owner declarado**: lo que un mundo posee, consume u observa. V pinta piezas ajenas sin espejarlas («pieza real, no un espejo»); toda pieza cruzada lleva fila de frontera. | `plan/VISION.md:49` (columna «pieza» de la tabla de fronteras) · `plan/PRACTICAS.md:84` · uso paralelo en G: pg:`prueba-de-dos/estructura/ESTRUCTURA.md:11` («Censo de piezas G») | **acuñación V** (compartida de facto con G; sin definición en z-sdk) |
| **room** | «Canal de una partida en el socket-server; UNA autoridad por room, N vistas/actores» — glosario canónico de Z. Es **transporte**, no territorio: la puerta de entrada que V consume (I-1). | z:`plan/VISION.md:89` · `plan/VISION.md:55` (fila «Puerta de entrada (rooms)») · uso en V: `src/identity/RoomIdentityService.ts` | consumido (Z) — relación con barrio en §3 C2 |
| **superficie** | Lugar de la **periferia** del editor donde V pinta lo que consume: vista/panel de árbol, comando de paleta, webview/editor, statusbar, terminal gestionado — o «sin superficie» / «no va (aún)» con motivo. Es la clase; los tipos VS Code son sus instancias. | `plan/MAPA-SUPERFICIES.md:19-26` · `plan/PRACTICAS.md:84` (tipo funcional: «una superficie, comando o panel hace algo») | **acuñación V** |
| **volumen** | «Dataset canónico en disco bajo un slot DISK, registrado en `volumes.json`, compartido por todos los juegos del mesh» — contiene corpus. V no lo posee; si lo pinta, lo pinta por canal. | z:`plan/VISION.md:103` · z:`plan/DATOS.md:88` | consumido (Z) |
| **Zigurat** | Nombre propio del mundo V: la extensión VS Code de **centro vacío**, IDE del producto — la cara con la que un operador entra a la Ciudad. Con mayúscula y artículo («el Zigurat») refiere siempre al IDE, no al nodo del gamemap (§3 C6). | `plan/VISION.md:5,14-17` | **acuñación V** |
| **zona** | Interés lógico **opaco** declarado al suscribirse a una room (`zones` en `CLIENT_SUSCRIBE`; «logical filter; physical fan-out remains room-wide until authority slices»). Destino declarado por Z: ámbito real de conversación — mismo topic × 2 zonas = 2 conversaciones; las zonas **no se filtran mutuamente** (el solape es solape). | z:`packages/engine/rooms/src/index.mjs:47,50-51` (verificado de primera mano 2026-07-31) · z:`plan/BACKLOG.md:248` (U196) · `plan/PRACTICAS.md:62-63` | ontología (Z) |

## 2 · Invariante: ámbitos, no cadenas de mando (PRACTICAS §2.2)

Verificación sobre las definiciones de §1 — ninguna implica jerarquía de
autoridad:

- Los verbos de relación usados son los de las fuentes: **aloja**
  (pg:`GRAFO-STARTERKIT.md:20-22`), **conecta** (pg:`GRAFO-STARTERKIT.md:17,39`),
  **contiene** (volumen ⊃ corpus), **consume/publica** (catálogo). Ninguna
  definición usa «manda», «gobierna», «depende de» ni «está por encima de»;
  alojar y contener declaran topología, no mando.
- **Solapes nombrados como solapes**: zonas que comparten topic no se
  filtran mutuamente (z:`plan/BACKLOG.md:248`); superficies compartidas por
  varias entradas del catálogo «no establecen rango, propiedad ni
  precedencia» (`plan/MAPA-SUPERFICIES.md:52-60`, pie aceptado de V22).
- La única «autoridad» que aparece (room, card, grafo) es la **autoridad
  técnica de mutación** del dominio de Z (z:`plan/VISION.md:90`): un rol de
  proceso por contrato, no un rango entre barrios, mundos o piezas — V la
  consume como puerta (I-1, `plan/PRACTICAS.md:20-24`), no la replica en
  sus vistas.

## 3 · Colisiones de sinónimos — greps reales (2026-07-31)

Alcance del barrido: `src/` y `plan/` de este repo (worktree V) + fuentes
RO consumidas (z-sdk, playground). Conteos por ocurrencia,
case-insensitive salvo nota. **Este doc no corrige código**: la columna
«canónico propuesto» es el insumo de **V23** (claves→ontología,
`plan/BACKLOG.md:100`) y de los WPs de naming que el orquestador encole.

| # | términos en tensión | dónde vive cada uso (medido) | veredicto | canónico propuesto |
| - | ------------------- | ---------------------------- | --------- | ------------------ |
| C1 | **pieza** vs **servicio/servidor** vs **service/server** | `pieza` en `src/` = **0**; en `plan/` = 75 líneas / 26 ficheros. Español en `src/`: `servidor` = 40, `servicio` = 4 (p. ej. `src/treeViews/mcpTreeView.ts:88` «⏳ servidor … (barrio no montado)», `src/views/TeatroTreeDataProvider.ts`). Inglés en `src/`: `service` = 353, `server` = 459 (identificadores y API VS Code incluidos) | **colisión real en superficie**: la UI en español dice «servidor/servicio» donde el plan dice «pieza»; choca además con U217 (z:`plan/BACKLOG.md:286` «ningún consumidor confunde barrio con servicio») | **pieza** en toda superficie y doc en español; «servidor MCP» solo cuando se nombra el proceso técnico concreto; `service`/`server` en identificadores de código quedan como término técnico (su sustitución es obra de V23/V19, no de aquí) |
| C2 | **barrio** vs **room** | `barrio` en `src/` = 9 líneas / 3 ficheros (`src/launcher/types.ts:21`, `src/treeViews/mcpTreeView.ts:88,399-407`, `src/views/HackerTasksPanelProvider.ts:290-302`); `room` (palabra) en `src/` = 88 (concentrado en `src/identity/`); en `plan/` `room|Room` = 18 líneas / 9 ficheros | **no son sinónimos** — capas distintas: barrio = ámbito del dominio (U217), room = canal del transporte (z:`plan/VISION.md:89`). El riesgo es traducirlos entre sí | mantener ambos, cada uno en su capa; prohibido «room» como traducción de barrio y viceversa en superficie |
| C3 | **peercard**: `PeerCard` / `peer-card` / `peerCard` (+ **credencial**) | En `src/` (exacto, case-sensitive): `PeerCard` = 25 · `peer-card` = 18 · `peerCard` = 15 (58 en total, 3 grafías, concentradas en `src/identity/`). `credencial` en `src/` = 0; en `plan/` = 2 (`plan/REPORTES/WP-V03-deps-standalone.md:53`, `plan/BRIEFS/WP-V10-v1-release.md:25` — ambas en sentido genérico de secrets CI, **no** la card) | grafías múltiples del **mismo** término, no sinónimos compitiendo; «credencial» no compite hoy (0 usos como card) — PEERCARD.md la usa solo como género («credencial no-crypto») | **peercard** en prosa española · `PeerCard` como tipo TS · `peerCard` como propiedad (payload de Z: z:`packages/engine/rooms/src/index.mjs:48`) · «peer-card» solo en prosa inglesa heredada; «credencial» reservada al sentido genérico |
| C4 | **asiento**: seat de card vs asiento del ledger vs asiento de gobierno | En `src/` solo el sentido *seat de card*: `seat` = 33 (`src/identity/types.ts:12,28,38`, `src/identity/RoomIdentityService.ts:81-137`); «asiento» (es) en `src/` = 0. En Z conviven: seat de card (z:`plan/BACKLOG.md:237` U190), asiento contable del ledger (z:`plan/DATOS.md:95` «Nada se borra sin asiento») y asiento de acta de gobierno (z:`plan/DECISIONES.md:570,578`) | **polisemia real** de tres sentidos en las fuentes; en V hoy solo vive uno (seat de card), así que no hay colisión en código — el riesgo es al pintar ledger en el futuro | en superficie de V, «asiento» a secas queda **prohibido**: decir «asiento de card (seat)» o «asiento del ledger»; el tercer sentido (gobierno) no entra en superficie |
| C5 | **catálogo** vs **launcher** | `catalog` en `src/` = 165 · `launcher` = 226 (la carpeta `src/launcher/` alberga `CatalogService.ts` y `LauncherCatalogClient.ts`) | **no son sinónimos**: catálogo = el dato (resource `launcher://catalog`); launcher = la pieza de Z que lo publica (`@zeus/mcp-launcher`). El nombre de carpeta `src/launcher/` para código que consume el *catálogo* es naming interno confuso | «catálogo» para el inventario; «launcher» solo para la pieza de Z; renombrar `src/launcher/` es candidato para V19/V23, no de este doc |
| C6 | **Zigurat** (IDE, mundo V) vs **zigurat** (nodo del gamemap ciudad) | V: `plan/VISION.md:5,14` y superficie entera. G: pg:`prueba-de-dos/estructura/packs/startpack-ciudad.md:21` («plaza + zigurat (gobernanza)» dentro de la topología demo) | **homónimo entre mundos**: el mismo sustantivo nombra el IDE (V) y un lugar del gamemap (G) | «el Zigurat» (mayúscula, artículo) = el IDE; el nodo del juego se nombra siempre calificado: «el zigurat del gamemap ciudad» |
| C7 | **superficie** vs view/panel/webview/statusbar | `superficie` en `plan/` = 55 líneas / 12 ficheros; en `src/` = 0. Los tipos técnicos (`TreeView`, `WebviewPanel`, `StatusBarItem`) viven en `src/` por API de VS Code | **no colisión**: género (superficie) vs especies (tipos VS Code), tipología ya fijada en `plan/MAPA-SUPERFICIES.md:19-26` | «superficie» como término de plan/UI; los nombres de API quedan como técnica |
| C8 | **zona** (runtime) vs «Zona» coloquial de UI | En `src/` una única ocurrencia y es coloquial: `src/elenco/ElencoTreeDataProvider.ts:4` («Zona UI disjunta…»); la zona del runtime (z: U196) aún no se pinta en V | colisión **latente**: un solo uso coloquial hoy, pero cuando V pinte zonas de room el comentario ambiguo confunde | reservar «zona» para el sentido del runtime (U196); para áreas de la UI decir «superficie» — el comentario de ElencoTreeDataProvider es candidato a reescritura en V19 |
| C9 | **grafo** (starter-kit) vs `graphId` (config heredada) | `graph` en `src/` = 2: `src/mcpTypes.ts:52` (`graphId: string`) y `src/core/mcpConfigurationManager.ts:113` (`"graphId": ""`) — contrato de config previo, sin relación con el grafo del starter-kit (pg:`GRAFO-STARTERKIT.md`) | homónimo débil: 2 restos de la config heredada | «grafo» = el del starter-kit; `graphId` es clave legacy cuyo destino lo fija V23 (demolición o mapeo), aquí solo queda censado |
| C10 | **ámbito** vs **scope** (card) | `ámbito` en `src/` = 0; `scope` en `src/` = 10 líneas: capacidades de la card (`src/identity/types.ts:21` `scopes: string[]`, `src/identity/RoomIdentityService.ts:257-258`) + `ConfigurationTarget` de VS Code (`src/core/aiAssistantService.ts`) + théatrical legacy | **no traducir**: los `scopes` de la card son capacidades (pg:`PEERCARD.md:63-67` `cap:destructive:…`), no el «ámbito» territorial de §1 | «ámbito» = territorio semántico (barrio/zona); `scope` de card se dice «scopes de la card» — nunca «ámbitos de la card» |

Resumen del CA «cero sinónimos compitiendo»: **1 colisión real en
superficie hoy** (C1: «servidor/servicio» donde el plan dice «pieza»),
**2 latentes** (C4 asiento al pintar ledger; C8 zona coloquial), **3
homónimos que se resuelven calificando** (C2, C6, C9), **1 problema de
naming interno** (C5), y **3 grafías/géneros sin competencia** (C3, C7,
C10). Ninguna se corrige aquí: tabla = insumo de V23/V19.

## 4 · Regla al pie

**Término de dominio nuevo en una superficie de V sin fila en §1 = FAIL**
— mismo patrón que los mapas de territorio (`plan/MAPA-SUPERFICIES.md`
pie, y los MAPA-* del método). El WP que introduzca el término añade la
fila con fuente citada o acuñación declarada **en el mismo cambio**; las
sustituciones en código que esta tabla sugiere son obra de los WPs de
V23/V19, nunca de una edición silenciosa de este doc.

---

— **V** · Aleph-0 (ℵ₀) · WP-V27
