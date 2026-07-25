# Guía de prueba · Zigurat v1 (`scriptorium.zigurat` 0.1.0)

≤10 pasos para el custodio. Runtime local: `C:\S_LAB\z-sdk` (DV-07).
Marketplace: **no** — instalar solo el `.vsix` del GitHub Release.

## Settings de ejemplo (`.vscode/settings.json` del workspace de prueba)

```json
{
  "zigurat.mesh.host": "127.0.0.1",
  "zigurat.mesh.port": 3010,
  "zigurat.launcher.host": "127.0.0.1",
  "zigurat.launcher.port": 3050,
  "zigurat.room.id": "<room-zeus-local>",
  "zigurat.reparto.path": "<ruta-absoluta>/fixtures/reparto-v1-demo.json",
  "zigurat.lineaEditor.host": "",
  "zigurat.lineaEditor.port": null
}
```

Vacío/`null` en mesh/launcher/room ⇒ UI marca ⏳ (no inventa endpoints).

## Pasos

1. Descargar `scriptorium-zigurat-0.1.0.vsix` del GitHub Release de `V_SDK` (o `dist/` tras `npm run package:v1`).
2. Instalar: `code --install-extension scriptorium-zigurat-0.1.0.vsix` (desinstalar antes cualquier `escrivivir-co.scriptorium-vscode-extension` legado).
3. Abrir un workspace de prueba y pegar los settings de ejemplo (ajustar room/reparto).
4. Recargar ventana (`Developer: Reload Window`) y comprobar activación: extensión `scriptorium.zigurat` en *Extensions* + status bar Zigurat (identidad ⏳ si no hay mesh).
5. Arrancar runtime Z local (`C:\S_LAB\z-sdk`) con mesh ~3010 y launcher ~3050.
6. Comando `Zigurat: Refresh MCP resource projection` — catálogo/resources en caliente (nodos launcher://info|catalog|ports u ⏳ si launcher caído).
7. Comando `Zigurat: Join room (peer-card)` con `zigurat.room.id` válido — `ssbId` visible si autoridad responde; si no, ⏳ (residual smoke V07).
8. Comando `Zigurat: Refresh authorship gate` — lista `motivos_deny` desde `editor://info` (no inventada).
9. Comando `Zigurat: crear_linea (gated)` sin reparto/card vigente — debe **deny** visible (toast/log); sin efecto de escritura. Demo verde/rojo `ZEUS_LINEA_*` = residual V08 ⏳.
10. Comando `Zigurat: Refresh elenco` con `zigurat.reparto.path` al fixture — filas cast-table; panel Elenco ≠ compañía teatral (ICompany).

**PASS custodio:** activación + catálogo en caliente + un deny de autoría visible. Tick validación vigía-S aparte (aviso en reporte WP-V10).
