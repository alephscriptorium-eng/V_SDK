# DRAFT · carril V — borrador de backlog encolable

| dato | valor |
| ---- | ----- |
| Carril | **V** · Aleph-0 (ℵ₀) · `C:\S_LAB\v-sdk` |
| Estado | **borrador** — nada encolado. Encolar exige check final del custodio (§9.5) |
| Serie | `WP-Vnn` (siguiente libre: **V18**) |
| Régimen | sprint de **docs y estructura**, no de código (INFORME-R1 §4) |
| Base | decisión **REFACTOR** (custodio, R2) · orden obligado playground→interfaz (§2.b) |

---

## A · Bloqueantes del hilado común (cherry-pick primero)

### WP-V18 · Entrar al grafo como edificio-1

**BLOQUEA:** la prueba del holón-7 completa (INFORME-R1 §2.c) — sin mi
fila marcada no hay holón. **A quién:** a toda la mesa; y a G en
particular, que es mi contraparte de peercard en el grafo.

Alcance: cliente MCP desde la extensión (o mínimo viable equivalente) que
entre a la sala del starter-kit, emita/porte peercard y **marque mi fila**
en `playground/prueba-de-dos/GRAFO-STARTERKIT.md`.
CA tentativo: fila V marcada con peercard verificable · `ssbId` visible ·
cero escritura fuera de mi fila · evidencia de facto (no reporte).
Necesita: **tick** + confirmación de qué extremo pone G.

### WP-V19 · Cablear las 4 piezas del catálogo que no lanzan

**BLOQUEA:** el salto del 4 % al 100 % del censo (§2.a) por mi lado.
**A quién:** a Z (que da) y a mí (que consumo).

Alcance: de las 14 entradas / 7 paquetes del catálogo, las **4 no
lanzables** — identificar por qué no lanzan y qué falta de cableado.
CA tentativo: cada una con causa nombrada y fila de destino en mi UI o
declaración explícita de que no la tiene.
Necesita: **tick** + el detalle de Z (cuáles son las 4).

### WP-V20 · Puerta para lo que NO está en el catálogo

**BLOQUEA:** mi modelo de integración entero. **A quién:** a mí, y a O
—que consume mesh— y a Z.

Alcance: `socket-server`, `ciudad-lifecycle` y las UIs quedan **fuera**
del catálogo (INFORME-R1 §1). Mi «una sola puerta» no se sostiene:
definir la **segunda puerta** declarada, o pedir que entren al catálogo.
CA tentativo: documento de dos puertas con criterio explícito de cuál usa
cada pieza · cero clientes a medida sin fila en ese documento.
Necesita: **tick** + decisión conjunta con Z.

## B · Estructura antes que interfaz (orden §2.b)

### WP-V21 · Estructura del Zigurat en el playground

Alcance: asentar en `PLAYGROUND` la estructura del Zigurat —qué es
estructura y qué es lienzo— **antes** de tocar UI. Es el prerrequisito
declarado de toda mi banda de transformación.
CA tentativo: estructura navegable en playground · frontera
estructura/lienzo explícita · nada de VS Code todavía.
Necesita: **tick**. ⏳ Depende de material de G (ficha Ciudad) que aún no
he leído.

### WP-V22 · Mapa de barrio → superficie

Alcance: por cada entrada del catálogo, a qué superficie mía va (árbol,
panel, status bar, terminal) y **cuál no va a ninguna**.
CA tentativo: tabla completa sin `<pendiente>` · cada «no va» con motivo.
Necesita: **tick** + WP-V21 asentado.

## C · Refactor interno (decisión REFACTOR ya tomada)

### WP-V23 · Unificar el espacio de ajustes

Alcance: los settings siguen partidos en tres prefijos (`aleph0.` 13 ·
`alephscript.` 12 · `mcpSocketManager.` 1). Unificar a `aleph0.*`.
⚠️ Consecuencia declarada: O pidió congelar interfaz; el custodio decidió
**refactor**, así que esto se mueve — **O debe saber qué se mueve y
cuándo**.
CA tentativo: un solo prefijo · tabla de migración en README · CA de
WP-V05 re-verificada.
Necesita: **tick** + aviso a O antes de ejecutar.

### WP-V24 · Jubilar el cliente 3010 legado

Alcance: `libs/alephscript-client` (socket con puerto a mano) → conector
de ciudad por catálogo + peercard. ⏳ Bloqueado de hecho por WP-V20:
`socket-server` no está en el catálogo, así que hoy **no hay puerta
buena** a la que migrar.
CA tentativo: cero puertos literales · endpoint resuelto, no escrito.
Necesita: **tick** + WP-V20 resuelto.

### WP-V25 · Los 31 comandos declarados sin handler

Alcance: 31 entradas de `contributes.commands` sin `registerCommand` + 1
id duplicado (preexistentes, censados en V15). Cada uno: se rellena desde
el catálogo, o cae con acta.
CA tentativo: cero comandos que prometan lo que no hacen.
Necesita: **tick** + WP-V22 (para saber cuáles tienen destino).

## D · Deuda sin dueño todavía

| id | qué | estado |
| -- | --- | ------ |
| — | 5 superficies de marca legada visibles (`ARRAKIS_*` en títulos de panel + terminal) | ⏳ micro-tick de marca |
| — | 5 tests jest rojos preexistentes (hueco del mock de terminal) | ⏳ se reusan como guarda del mando de ciudad (WP futuro) |
| — | Release público 0.2.0 + guardas endurecidas (H-4, F-1/F-2/F-3) | ⏳ DEFERRED, decisión custodio |
| — | contrato Z no fija `reparto_required` ni forma del payload deny | ⏳ elevado a Z, sin hilo abierto |

---

**Nada de este documento está encolado.** Es material para cherry-pick
del custodio (§9.5).

— **V**
