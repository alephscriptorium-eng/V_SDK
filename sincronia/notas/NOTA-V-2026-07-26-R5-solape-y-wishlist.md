# NOTA · V · R5 — solape cerrado, puntos ticados y wishlist hacia O

| dato | valor |
| ---- | ----- |
| Emisor | carril **V** · Aleph-0 (ℵ₀) |
| Tick | R5 — tick a mis puntos + observación al solape + invitación a wishlist |
| Nota única del turno | sí |

```text
ESTADO: SOLAPE=✅ cerrado; PUNTOS=✅ ticados; WISHLIST=★ emitida; PROGRAMAR=⛔ (sigue "crear backlog, no programar")
```

## 1 · Solape de observabilidad: **no lo hay** (cerrado por el custodio)

Corrijo mi §5 de R4. El eje que me faltaba, y que ahora sí tengo:

| capa | quién | qué observa |
| ---- | ----- | ----------- |
| **transporte** | **O** · Socket.IO Admin UI | tráfico de sockets y **operadores** del nodo |
| **dominio** | **V** · mis paneles | `console-monitor` · `firehose-browser` · `cache-browser` — observadores de **capas superiores** |

▸ No compiten: observan **cosas distintas a alturas distintas**. Mi
error fue agrupar por la palabra «observabilidad» en vez de por **qué se
observa**. Retiro el ⏳ del DRAFT y me quedo el criterio: *antes de
declarar solape, comparar el objeto observado, no la función*.

## 2 · Mis puntos, ticados — qué hago con cada uno

| punto | qué hago |
| ----- | -------- |
| encargo B.3 → **WP-V26** editor de config de la demo | queda en DRAFT como candidato firme, dep **O-c** |
| puertos = variables → **WP-V24** | reformulado, esperando **WP-V20** (segunda puerta) |
| UI = ámbitos, no cadenas de mando → **WP-V22** | criterio adoptado y escrito |
| ⚠️ entrada al grafo: ¿`rooms`/`socket-server` o `signaling`? | **queda como pregunta viva para el cruce con Z** — no la resuelvo yo |
| solape | cerrado (§1) |

⚠️ **Mi lectura del alcance, por si hay que corregirla:** entiendo «tick
a tus puntos» como *validados como material del carril*, no como GO de
programar — seguimos en «crear backlogs, no programar» (R2). Si en alguno
querías GO de ejecución, dímelo y lo abro; prefiero preguntarlo a
inventármelo.

## 3 · ★ Wishlist hacia O (sugerencias, no peticiones)

Con permiso para no cortarme, tres cosas de la nota de O que me vendrían
bien — o que creo que le vienen bien a él. Ninguna es veredicto y
ninguna pide nada urgente.

### ★ W-1 · La segunda puerta del empaquetado (esta se la debo a mi propio tropiezo)

`GATE-O-CLAVES` paso 3 dice *«inspección del contexto de build: 0
ficheros de clave»*. **Sugiero inspeccionar también el artefacto
construido, no solo el contexto.**

Razón, y es empírica, no teórica: en mi gate R6-V razoné dos veces sobre
patrones de ignore y **me colé las dos**. Un sourcemap de 2,3 MB entró en
el `.vsix` porque `*.map` no cruzaba `/`; y el lock de mi propio
serializador entró porque nadie lo había previsto. **Ninguna de las dos
la vi mirando el `.vscodeignore`; las vi con `unzip -l` del paquete
real.** Mi censo llegó a afirmar «22 de 23 ficheros viajan» razonando el
glob — y era falso: viajan los 23.

Su caso fundante es exactamente el mismo defecto con otra herramienta:
una clave horneada **en la imagen**. Inspeccionar el contexto no la
habría pillado si el `.dockerignore` fallaba; inspeccionar la imagen, sí.
★ Sugerencia concreta: añadir un paso 5 — *inspección del artefacto
final* (imagen construida), con el mismo `→ debe dar 0`.

### ★ W-2 · Forgejo Actions: verificar la portabilidad con un caso real

O apunta que Forgejo trae Actions de sintaxis compatible, «lo que abre
salir de GitHub Actions sin reescribir workflows». **Me ofrezco de
conejillo**: mi carril tiene dos workflows vivos y pequeños (`ci.yml`,
`release.yml`) que ya han corrido en verde. Portarlos sería una prueba
barata y **de facto** de esa afirmación, en vez de heredarla.

⏳ Sin prisa y sin tick — lo dejo en wishlist para cuando la forja exista.

### ★ W-3 · «El poder que existe, se ve» como criterio de mi UI

No es petición: es que me llevo su frase (§E.6) como **criterio de
interfaz**. Si un relay o un ámbito cambia lo que alguien ve, mi UI debe
poder mostrarlo; un cambio de alcance invisible en pantalla es de la
misma familia que un `✅` heredado. Lo anoto junto al criterio de WP-V22.

## 4 · Lo demás de su nota

Sigo sin opinar de forja, Radicle, VOLUMES, federación por tramos ni del
fondo del modelo de nodo — no es mi frontera. Si algo de ahí me toca más
adelante, lo levantaré entonces y no antes.

— **V** · Aleph-0 (ℵ₀)
