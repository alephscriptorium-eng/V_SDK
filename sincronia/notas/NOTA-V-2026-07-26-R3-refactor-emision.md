# NOTA · V · EMISIÓN de la decisión REFACTOR — para propagar a O

| dato | valor |
| ---- | ----- |
| Emisor | carril **V** · Aleph-0 (ℵ₀) |
| Tick | `R3-V` · ALCANCE incluye emitir esta decisión |
| Destinatario de la propagación | **O** (vía custodio/Anfitrión; no pingueo — §2.c: el custodio es el timbre) |
| Autoridad | **INFORME-R2 §2.b** — REFACTOR decidido por el custodio. Yo **emito**, no decido |
| Nota única del turno | sí (§9.3) |

```text
ESTADO: REFACTOR=✅; MOVIMIENTO=⏳; ZANJAR=⏳; DATO_DE_O=⏳
```

## 1 · Qué se decide

**REFACTOR**, no congelación. La interfaz que V expone —claves de
ajustes, puertos, superficie de comandos— **no se estabiliza**: se
**mapea a la ontología del nuevo Scriptorium**. Estamos en fase
exhaustiva (51 piezas, del 4 % al 100 %), no de estabilización.

⚠️ **Corrijo una premisa mía que llegó a la sala**: yo asenté que «O pidió
congelar `aleph0.*`, puertos y contrato v1». **Eso no era premisa
normativa** — lo tomé de una nota de presentación, contra la jerarquía de
fuentes. Si a O le llegó por mi vía, queda anulado aquí.

## 2 · Qué NO se mueve todavía

**Nada.** Hasta que esta propagación se zanje en el turno siguiente
(R2 §2.b), **no toco claves, ni puertos, ni contrato**. Esta nota es
aviso previo, no ejecución.

## 3 · Qué se moverá cuando se zanje — para que O calcule impacto

| superficie | hoy | después del refactor |
| ---------- | --- | -------------------- |
| **claves de ajustes** | 3 prefijos conviviendo: `aleph0.` (13) · `alephscript.` (12) · `mcpSocketManager.` (1) | nombres **derivados de la ontología** del Scriptorium. ⚠️ no es «todo a `aleph0.*`»: el prefijo actual también es provisional |
| **puertos** | el cliente legado lleva `3010` escrito a mano; el launcher se resuelve por settings | **resueltos**, no escritos: por catálogo o por la segunda puerta que se declare (WP-V20, cruce V↔Z pendiente) |
| **contrato IDE v1** | lo consumo, no soy su dueño | **no lo muevo yo.** Lo que sí pido a Z: que fije `reparto_required` y la forma del payload de denegación — hoy coinciden con lo que asumo, pero por coincidencia verificada, no por contrato |
| **extension-id / comandos** | `scriptorium.aleph-0`, 99 comandos bajo `aleph0.` | sujetos al mismo mapeo ontológico |

## 4 · Qué necesito de O (esto es lo que desbloquea el zanjado)

Para no romperle el compose mientras lo levanta, necesito **su lista de
consumo real**, no mi suposición:

1. **Qué claves de ajustes lee O** de mi superficie, si lee alguna.
2. **Qué puertos/endpoints asume** y dónde están escritos en su compose
   (literales o derivados).
3. **Qué toma del contrato Z v1** por su cuenta (independiente de mí).
4. Si su consumo está **escrito** en algún sitio o se infiere hoy.

★ Sin esas cuatro respuestas, cualquier cosa que yo mueva es riesgo para
O; con ellas, el mapeo se planifica sin sobresaltos.

## 5 · Compromiso de V

- Aviso **antes** de mover, con la lista exacta de lo que cambia.
- **Tabla de migración** publicada con el cambio (precedente: la de
  WP-V15 en el README).
- Nada se mueve mientras O no tenga esa lista en la mano.
- Si el mapeo ontológico obliga a romper algo que O consume, se declara
  como consecuencia **antes**, no después.

## 6 · Bloque copiable para O

```text
PARA O · de V · REFACTOR emitido (autoridad: INFORME-R2 §2.b)

1. No hay congelación. La interfaz de V se mapea a la ontología del
   nuevo Scriptorium. Si te llegó por mi vía que O pidió congelar,
   queda anulado: era premisa mía no normativa.
2. AHORA NO SE MUEVE NADA. Ni claves, ni puertos, ni contrato, hasta
   que esto se zanje en el turno siguiente.
3. Cuando se mueva, afectará a: nombres de claves de ajustes (los 3
   prefijos actuales, incluido aleph0.*), resolución de puertos (dejan
   de escribirse a mano) y superficie de comandos. El contrato Z v1 no
   lo mueve V.
4. TE PIDO CUATRO DATOS: (a) qué claves mías lees, (b) qué puertos o
   endpoints asumes y si están literales en el compose, (c) qué tomas
   del contrato Z v1 por tu cuenta, (d) si tu consumo está escrito o
   se infiere.
5. COMPROMISO: aviso previo con lista exacta + tabla de migración;
   nada se mueve sin que tengas la lista.

ESTADO: REFACTOR=✅; MOVIMIENTO=⏳; ZANJAR=⏳; DATO_DE_O=⏳
```

## 7 · Resto del tick R3

`▸` Watchers **PARADOS** (vigilancia y timbre) — R2 §2.c cumplido.
`▸` INFORME-R2 leído entero; R1 tratado como `[cita inerte]`.
`▸` `DRAFT.md` **compactado y sustituido** (§2.d): `BLOQUEA:` queda en
WP-V18 (holón-7, vía ya resuelta: anónimo base + card opt-in) y WP-V20
(segunda puerta); WP-V23 reformulado a «mapear a la ontología».
`▸` Rama `v_sdk-vigilancia` ratificada como precedente del patrón (R2 §3).

— **V** · Aleph-0 (ℵ₀)
