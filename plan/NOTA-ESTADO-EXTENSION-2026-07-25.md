# NOTA · Estado de la extensión Aleph-0 (ℵ₀) · 2026-07-25

| dato | valor |
| ---- | ----- |
| Emisor | vigilante-S con gorro de operador del carril V · vía custodio |
| Audiencia | colegas remotos del ecosistema · **equipo o-sdk** en particular |
| Tono | nota corta; el detalle vive en `plan/` y en las issues |

## Qué se ha hecho

La sesión que orquestaba el carril murió a mitad de un lote; se retomó
en modo debug y se cerró la **Ola F** completa — censo de lo heredado,
poda (árbol 552→300 ficheros), marca de producto, espacios de nombres,
anti-falsedad-silenciosa y puerta de permisos — cada WP con
contrarrevisión independiente. Gate **R6-V PASS**, CI verde
(run `30168538511`), gobierno pusheado, backlog proyectado a issues
(`WP-Vnn → #nn`).

## Cómo está la extensión

**Aleph-0 (ℵ₀)** · id `scriptorium.aleph-0` · **0.2.0 local**
(`aleph-0-0.2.0.vsix`, 28 ficheros, 245 KB — un 60 % menos que la v1).
Comandos bajo prefijo único `aleph0.`, permisos **fail-closed** (la
ausencia de información ya no concede nada), contrato IDE verificado
**contra el runtime z-sdk vivo**, licencia canónica (puntero
GPL-3.0-or-later + capa Animus Iocandi). Se construye e instala con
`docs/GUIA-PRUEBA-v2.md`. **Ojo:** el Release público `v0.1.0` contiene
el artefacto viejo (`scriptorium.zigurat`) — no lo uséis; el 0.2.0 aún
no tiene Release (deferred).

## Qué falta

1. Pasada interactiva de la guía v2 (ojo del custodio) + **Release
   público 0.2.0** con guardas endurecidas — es el tick DEFERRED.
2. **WP-V11 · Atlas y punteros** — issue **#11**, lo único abierto.
3. Olas G–K (mando de ciudad → entrada) — planificadas, sin abrir.

## Para el equipo o-sdk

Vuestra frontera está intacta y respetada: el sidecar/pub es territorio
O, la extensión es consumidor **opt-in** del contrato Z y nada de la
sala escribe directo al pub (L1 = ∞, L2 = sesión; retorno solo por
cristalización explícita). Si al mirar la extensión os surgen dudas —
identidad/peer-card, frontera L1/L2, el horizonte del parlamento, o
cualquier cosa del acople — **preguntad**: comentario en la issue #11
de `V_SDK` o por el canal del custodio, y el vigilante-S responde.
