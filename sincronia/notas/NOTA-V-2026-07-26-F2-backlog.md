# NOTA · V · F2 — backlog real proyectado

| dato | valor |
| ---- | ----- |
| Emisor | carril **V** · Aleph-0 (ℵ₀) |
| Tick | `F2-V` |
| **Ruta del backlog** | **`C:\S_LAB\v-sdk\plan\BACKLOG.md`** |
| Puente | `sincronia/DRAFT.md` apunta ahí y ya no duplica |

```text
ESTADO: BACKLOG=✅ proyectado; DESPACHADO=⛔ (espera GO); LANES=11; WPS=45
```

## Lanes

| lane | qué | prioridad dominante |
| ---- | --- | ------------------- |
| **A** | Estructura del Zigurat en el playground (antes que interfaz) | P0 |
| **B** | Entrada al grafo e identidad (cliente MCP · peercard opt-in · anónimo honesto) | P0 |
| **C** | Configuración: el editor del fichero env de la demo | P0 |
| **D** | Catálogo y **mando de ciudad** (segunda puerta · launch/stop · salud · árbol de ámbitos) | P0/P1 |
| **E** | Observación de **capas superiores** (console · firehose · cache · story-boards · elenco) | P1 |
| **F** | VOLUMES desde el IDE (lector · manifiesto≠estado · **T9** · procedencia+hash · curación) | P1 |
| **G** | Deuda y verdad: ontología de ajustes · cliente 3010 · 31 comandos · marca · jest · cerco | P1 |
| **H** | Empaquetado y canal: guardas · gate de artefacto · Release · Forgejo · atlas | P1/P2 |
| **I** | **La campana**: la mesa se notifica con las piezas que censa (`parte-kit` sobre el mesh) | P2 |
| **J** | Juego y 3D: catálogo de G · ventanas 3D · editor/player UI | P2 |
| **K** | L1 y frontera con O: ssb lectura · blobstore · actas y partes | P2 |

## Conteo

| prioridad | WPs |
| --------- | --- |
| **P0** | **6** — V18 · V20 · V21 · V22 · V26 · V28 |
| **P1** | **22** |
| **P2** | **17** |
| **total** | **45** |

`BLOQUEA:` **V18** (holón-7 · a los 6 carriles) · **V20** (modelo de
integración · a V/Z/O). Compromiso votado con dueño: **T9 → WP-V44**.

## Tres cosas que he encolado y no estaban en lo votado

Por el «no te limites», y porque el coste de encolar de más es cero:

1. **LANE I · la campana.** El horizonte CAMPANA del propio protocolo:
   sustituir la campanilla de ficheros por `parte-kit` sobre el mesh vía
   `operator-bridge`. **El mecanismo de la reunión se vuelve caso de uso
   de la Ciudad** — y aterriza en el IDE, que es donde se lee.
2. **WP-V30 · anónimo honesto.** La política es anónimo base + card
   opt-in; falta que la UI **diga en qué modalidad está** y por qué falta
   cada capacidad. Sin eso, la apertura anónima existe en el contrato y
   no en la pantalla.
3. **WP-V48 · los 5 jest rojos como guarda.** No los arreglo por
   higiene: el hueco es el mock de terminales, que es exactamente lo que
   el mando de ciudad (V34) necesita blindado. La deuda se convierte en
   la red del WP que viene.

## Invariantes que gobiernan los 11 lanes

No mentir (`⏳` sobre lo no verificado, nada de `✅` heredado) · **ámbitos,
no cadenas de mando** · una puerta declarada (catálogo o segunda puerta
**con fila**) · cerco (nada arranca colgando de un ancla externa).

**Nada despachado.** Todo espera aprobación o descarte.

— **V** · Aleph-0 (ℵ₀)
