# WP-V22 · Mapa barrio → superficie

**Qué es**: por cada entrada del catálogo real del runtime, a qué superficie
del Zigurat va — y cuál no va a ninguna, con motivo. El mapa **declara
consumo**: qué pinta el IDE de lo que el canal expone. No ordena mundos.

## Fuente del catálogo

- **Catálogo**: `C:\S_LAB\z-sdk\packages\mesh\mcp-launcher\src\catalog.mjs`,
  constante `CATALOG_SEED` (catalog.mjs:59) — **14 entradas** declarativas
  («Actuator data only (id, port, spawn, deps, capabilities)», catalog.mjs:4).
- **Canal de consumo**: el Zigurat no importa este módulo; consume el
  catálogo publicado como resource `launcher://catalog`
  (`packages/mesh/mcp-launcher/src/launcher-server.mjs:42`), como fija el
  contrato IDE opt-in: «El IDE consume `launcher://catalog` … para construir
  su inventario de servicios EN CALIENTE»
  (`plan/REPORTES/CONTRATO-IDE-OPT-IN-v1.md:23-26`).

## Superficies del Zigurat (VS Code de centro vacío)

- **vista/panel de árbol** — TreeView contribuido en sidebar/panel: lista jerárquica navegable de datos leídos por el canal.
- **comando de paleta** — acción invocable desde la Command Palette: entrada puntual con argumentos y resultado, sin UI persistente.
- **webview/editor** — pestaña con render propio (HTML) o documento virtual de solo lectura abierto en el editor.
- **statusbar** — item de la barra de estado: un dato pequeño y vivo, con click opcional hacia un comando.
- **terminal gestionado** — terminal creado por la extensión atado al ciclo de vida de un proceso; en este mapa queda **sin asignación** (ver nota al pie).
- **sin superficie** — la pieza se consume por canal sin pintarse; la variante honesta «**no va (aún)**» marca que hoy no hay nada observable que pintar, con motivo.

## Tabla: entrada del catálogo → superficie(s)

Rutas relativas a `C:\S_LAB\z-sdk`. El orden de filas es el orden literal de
`CATALOG_SEED` — no es prioridad ni rango.

| # | Entrada (catálogo) | Qué expone (evidencia) | Superficie(s) propuesta(s) | Motivo observable |
|---|---|---|---|---|
| 1 | `linea-espana` (catalog.mjs:61) | Tool `get_nodo` por año (`packages/mesh/linea-system/src/logic.mjs:19`); resources `linea://info` (`src/linea-server.mjs:101`), `linea://nodo/{year}` (:127), `linea://parte/{id}` (:139) | vista/panel de árbol · comando de paleta | Lectura navegable y determinista (nodos por año, partes por id): estructura enumerable → árbol; la consulta puntual por año («resolución determinista de nodo», logic.mjs:22) → comando. |
| 2 | `linea-wp-historia` (catalog.mjs:72) | Tools `get_oldid` (logic.mjs:30), `get_registros_for_nodo` (:44), `get_registros_for_year` (:57), `cache_wikitext` (:70, asíncrona: «poll linea://wikitext/{oldid} until cached», :74); resources `linea://wikitext/{oldid}` (linea-server.mjs:163), `linea://registro/{id}` (:171), `linea://registros/nodo/{nodo_id}` (:179) | vista/panel de árbol · webview/editor · comando de paleta | Listas de registros por nodo/año → árbol; el wikitext cacheado es documento largo de solo lectura → webview/editor; `cache_wikitext` es acción puntual con polling → comando. |
| 3 | `solar-sun` (catalog.mjs:83) | Tools `get_position` (`packages/mesh/solar-system/src/logic.mjs:62`) y `get_rotation` (:72): «posición heliocéntrica determinista … coordenadas cartesianas en AU» (:65) | webview/editor (escena 3D compartida del grupo solar) | Devuelve magnitudes continuas por timestamp, no texto enumerable: su lectura natural es render gráfico. La alternativa superficie-o-enlace se resuelve por pieza contra V20 (`plan/BACKLOG.md:131`, WP-V57); esta fila propone webview. |
| 4 | `solar-moon` (catalog.mjs:93) | Ídem fila 3: mismas tools por cuerpo (logic.mjs:62, :72), mismo `spawnGroup: 'solar-system'` (catalog.mjs:96) | webview/editor (la misma escena 3D que fila 3) | Mismo contrato que `solar-sun`; tres entradas del catálogo alimentan una sola escena — compartir superficie es consumo compartido, no rango entre cuerpos. |
| 5 | `solar-earth` (catalog.mjs:103) | Ídem fila 3 (logic.mjs:62, :72; `spawnGroup` catalog.mjs:106) | webview/editor (la misma escena 3D que fila 3) | Ídem fila 4. |
| 6 | `forces` (catalog.mjs:113) | Tools `get_force_registry` (`packages/mesh/force-system/src/logic.mjs:19`), `get_force` (:30), `get_force_scene` (:43): «capas prompt/think/output de una escena» (:47) | vista/panel de árbol · webview/editor | Registro → carta → escenas es jerarquía enumerable de ids → árbol; las capas de escena son texto largo por capa → webview/editor de solo lectura. |
| 7 | `linea-editor` (catalog.mjs:123) | Tools de mutación gateadas `crear_linea` y `export_story_board` (`packages/mesh/linea-editor/src/tools.mjs:13-14`; registro en `src/editor-server.mjs:177` y :216) con `approve` + `approvalToken` (:189-192); resource `editor://info` con «visible approval gate» (:135, :139) | comando de paleta · statusbar | La pieza expone mutación con aprobación explícita, no lectura masiva: acción puntual con confirmación → comando; el gate debe estar siempre a la vista — «el IDE debe representar el estado del gate, no ocultarlo» (`plan/REPORTES/CONTRATO-IDE-OPT-IN-v1.md:56-57`) → statusbar. |
| 8 | `ssb` (catalog.mjs:134) | Tools `ssb_browse` (`packages/mesh/ssb-system/src/logic.mjs:21`), `ssb_list_messages` (:39), `ssb_get_message` (:54) sobre corpus `tribes/parliament/votes` paginados (:28-31) | vista/panel de árbol · webview/editor | Corpus paginado de mensajes exportados → árbol con paginación; el mensaje individual es JSON de solo lectura → documento virtual en el editor. |
| 9 | `firehose` (catalog.mjs:144) | Tools `firehose_browse` (`packages/mesh/linea-firehose/src/logic.mjs:31`), `firehose_list_posts` (:51), `firehose_get_post` (:69); resource `firehose://stats` (:87) | vista/panel de árbol · statusbar | Corpus/batches/posts con paginación → árbol; `firehose://stats` es un agregado pequeño del volumen → dato vivo en statusbar. |
| 10 | `console-monitor` (catalog.mjs:155) | Tools de transporte `set_playhead` (`packages/mesh/console-monitor/src/logic.mjs:29`), `transport_play` (:44), `transport_pause` (:57), `sync_toggle` (:70), `deck_load` (:83), `registro_select` (:101); de sesión `bootstrap_decks` (`src/logic-session.mjs:54`), `goto_parte` (:95), `goto_year` (:179), `session_report` (:332). Puerto declarado como `playerDebug.monitor` (catalog.mjs:222) | comando de paleta · statusbar | Es transporte de sesión de debug (play/pause/goto): acciones puntuales → comandos; playhead y estado play/pause son un dato pequeño y vivo → statusbar. |
| 11 | `arg-player-uno` (catalog.mjs:165) | Nada lanzable en este workspace: `workspace: null` (catalog.mjs:167); `buildSpawnSpec` rechaza: «has no workspace spawn (player-MCP / external). Cannot launch.» (catalog.mjs:320-323); nota: «Player-MCP lives in games-library; spawn via external cmd when wired» (catalog.mjs:173) | **no va (aún)** | La entrada solo declara puerto/salud/capacidades (`game.delta`, catalog.mjs:170); no hay servidor en el workspace cuyas tools/resources citar — no existe nada observable que pintar. Su causa y destino son objeto de WP-V19 contra V20 (`plan/BACKLOG.md:67`). |
| 12 | `arg-player-dos` (catalog.mjs:176) | Ídem fila 11: `workspace: null` (catalog.mjs:178); mismo rechazo de spawn (catalog.mjs:320-323) | **no va (aún)** | Ídem fila 11: declaración de puerto sin pieza observable en el workspace. |
| 13 | `pozo-player` (catalog.mjs:186) | `workspace: null` (catalog.mjs:188); capacidad `game.pozo` (:191); mismo rechazo de spawn (catalog.mjs:320-323) | **no va (aún)** | Ídem fila 11: no hay servidor en el workspace que exponga algo que una superficie pueda mostrar. |
| 14 | `solve-player` (catalog.mjs:196) | `workspace: null` (catalog.mjs:198); capacidad `game.solve` (:201); mismo rechazo de spawn (catalog.mjs:320-323) | **no va (aún)** | Ídem fila 11. |
