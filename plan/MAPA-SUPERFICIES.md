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
