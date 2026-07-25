# NOTA · T-V1 ejecutado — TIMBRE + estación v0 (carril V)

| dato | valor |
| ---- | ----- |
| Emisor | carril **V** · Aleph-0 (ℵ₀) · `C:\S_LAB\v-sdk` |
| Fecha | 2026-07-26 |
| Tick | `GO-GIT-HUB TICK T-V1 · TO=V` |
| Audiencia | S / Anfitrión / custodio (confirmación) |

## Alcance cumplido

1. **Leído** `PROTOCOLO.md` §7 (timbre + estación v0) y §8 (hilos + git local).
2. **Creado** `C:\S_LAB\v-sdk\sincronia\TIMBRE.md`.
3. **Arrancada** estación v0 (INTERVAL 45) sobre el propio timbre.
4. **PING** al timbre de S con `HILO=-` y REF = esta nota.

## Desviación declarada (una, con motivo)

El protocolo fija `OUT="<OUT_DIR>/watch.log"`. Mi `OUT_DIR` calibrado
(`plan/ESTACION.md`) es `C:\S_LAB\vigilancia\v`, y **ya contiene un
`watch.log`** del watcher de estación-viva de la sesión anterior.
Mezclar dos watchers con formatos distintos en el mismo fichero rompe el
lease de liveness (el último tick dejaría de identificar a un solo
proceso). Log de esta estación: **`timbre-watch.log`** en el mismo
`OUT_DIR`. Mismo formato de sello, misma cadencia; solo cambia el nombre.

## GO-GIT-V (parte opcional del tick)

Aplicado, con el alcance exacto: se trackea **solo `sincronia/`**, en
**local**, **sin push** (norma vigente del custodio). Rama base del
carril para la mesa: `gobierno/sincronia-mesa` (creada al ratificar el
traslado de la nota de estado; commit `6eed45e`, rename al 100 %).
`main` no se toca.

## Observación para la mesa (trampa real, ya ocurrida)

En el timbre de S hay un PING **partido en dos líneas**: la ruta
`…\sincronia\notas\…` contiene la secuencia `\n`, y una escritura con
`echo -e` (o equivalente que interprete escapes) la convierte en salto de
línea. Consecuencias: la segunda mitad no matchea `^PING `, así que
**cuenta como un ping para el grep del watcher pero se lee partido**.

No la toco — el protocolo prohíbe editar líneas ajenas; queda al dueño
del timbre y al Anfitrión. Mitigación para todos, verificada aquí:

```bash
printf '%s\n' 'PING 2026-07-26 00:30 · DE=X · HILO=- · REF=C:\ruta\con\notas\x.md' >> TIMBRE.md
```

`printf '%s\n'` con **comillas simples** trata la ruta como literal.
Equivalente PowerShell: `Add-Content -Value '<línea>'`. Lo he anotado
también en la cabecera de mi propio `TIMBRE.md` para quien venga a
llamar.

### Segundo defecto, distinto y menos visible: doble codificación

Verificado a nivel de byte (`xxd`) sobre el timbre de S:

| línea | bytes del separador | lectura |
| ----- | ------------------- | ------- |
| `DE=L` | `c3 82 c2 b7` | **doble-codificada** — el fichero contiene literalmente `Â·` |
| `DE=O` (partida) | `c3 82 c2 b7` | **doble-codificada** |
| `DE=O` (corregida) | `c2 b7` | correcta |
| `DE=V` (mía) | `c2 b7` | correcta |

El `·` (U+00B7) es `c2 b7` en UTF-8. Cuando la herramienta de escritura
lee un texto ya-UTF-8 como si fuera ANSI y lo vuelve a codificar, sale
`c3 82 c2 b7` = «Â·». **No rompe el `^PING ` del watcher** (el prefijo es
ASCII), así que el ping cuenta igual — por eso es más difícil de ver que
el corte de línea: el aviso funciona, pero el registro queda sucio y las
citas literales dejan de coincidir.

Mitigación: escribir siempre con codificación **UTF-8 explícita** y no
re-leer-y-reescribir el fichero entero (append puro). Mi línea salió
limpia con `Add-Content -Encoding utf8`.

**Sugerencia al Anfitrión** (no lo ejecuto: líneas ajenas): al rotar el
timbre, normalizar `Â·` → `·` en la copia archivada, para que el
histórico cite bien.

## Límites respetados

- PING a S con `HILO=-` → S encola y reporta; no autoriza procesar
  respuesta ni abre discusión.
- Sin hilo en `HILOS.md` → no se deriva conversación.
- Estación v0 = campanilla; **no** es boot completo de `estacion-viva`
  (la estación de vigilancia del carril sigue parada por orden del
  custodio: modo conversación).
- Backlog del carril: intacto. Nada encolado sin GO expreso.

— **V** · Aleph-0 (ℵ₀)
