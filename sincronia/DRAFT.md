# DRAFT · carril V — borrador de backlog encolable

| dato | valor |
| ---- | ----- |
| Carril | **V** · Aleph-0 (ℵ₀) · `C:\S_LAB\v-sdk` |
| Estado | **borrador** · nada encolado (§9.5) · serie `WP-Vnn`, siguiente libre **V18** |
| Fuente normativa | **INFORME-R3** (R1 y R2 = `[cita inerte]`) |
| Compactado | **R7** (gate post-R3) — sustituye al de R5 |

---

## A · `BLOQUEA:` — cherry-pick

### WP-V18 · Entrar al grafo (edificio-1) y marcar mi fila

**BLOQUEA:** holón-7 · **a quién:** a los 6 (convergencia declarada en R2 §1).
Vía **resuelta** (R2 §2.a): **anónimo base, peercard opt-in** — el nodo no
exige card. Alcance: entrar y marcar mi fila en `GRAFO-STARTERKIT.md`.
CA: fila V marcada · modalidad usada declarada (anónima u opt-in) · cero
escritura fuera de mi fila · evidencia de facto.
⏳ Depende de **Z-runtime** (R2 §4) — sin él la marca no sería honesta.
⚠️ **Riesgo declarado (R4):** si mi entrada va por `webrtc-signaling`, su
`peer-card-gate.mjs` **exige** card (ADDENDA de O) y la modalidad anónima
no existe para mí. Resolver en el cruce: ¿entro por `rooms`/`socket-server`
(card viaja) o por signaling (card requisito)?
Necesita: **tick** + ficha de los 3 servicios + esa respuesta de Z.

### WP-V20 · Segunda puerta (lo que no está en el catálogo)

**BLOQUEA:** mi modelo de integración · **a quién:** V, Z, O.
`socket-server`, `ciudad-lifecycle` y UIs quedan fuera del catálogo: o
entran, o se declara la otra puerta con criterio explícito.
CA: documento de dos puertas · cero clientes a medida sin fila en él.
Necesita: **tick de cruce V↔Z(+O)** — ya en cola de R2 §4.

## B · Estructura antes que interfaz (orden vigente)

| id | qué | necesita |
| -- | --- | -------- |
| **WP-V21** | estructura del Zigurat en el `PLAYGROUND` (qué es estructura, qué es lienzo) — prerrequisito de toda mi banda de transformación | tick + material de G |
| **WP-V22** | mapa barrio → superficie mía (árbol/panel/status/terminal), incluido **cuál no va a ninguna**. ★ Criterio R4: la UI representa **ámbitos de suscripción, no cadenas de mando** — zonas solapadas y enlaces horizontales deben poder dibujarse; un árbol estricto `ciudad ⊃ barrio ⊃ edificio` sería mentira de interfaz (✎ TEMIS en nota de O). ★ Añadido R5 («el poder que existe, se ve», §E.6 de O): un cambio de ámbito que altere lo que alguien ve **debe poder mostrarse**; alcance invisible = misma familia que un `✅` heredado | tick + V21 |
| **WP-V19** | las 4 entradas del catálogo que no lanzan: causa nombrada y destino o descarte | tick + detalle de Z |

## C · Refactor interno — **DESBLOQUEADO** (INFORME-R3 §1)

✅ **O↔V ZANJADO**: el acoplamiento **no existía en código**; V queda
**libre en su REFACTOR**. Los 4 datos que pedí a O dejan de ser
prerrequisito. Única interfaz futura con O = **fichero env de la demo**
(WP-V26).

| id | qué | estado |
| -- | --- | ------ |
| **WP-V23** | **mapear los ajustes a la ontología del nuevo Scriptorium** — hoy 3 prefijos (`aleph0.` 13 · `alephscript.` 12 · `mcpSocketManager.` 1). No es unificar a un prefijo mío: el nombre sale de la ontología | ✅ **desbloqueado** (R3 §1) · espera solo tick |
| **WP-V24** | jubilar el cliente 3010 legado → conector por catálogo/segunda puerta. Formulación de O (R4): **no se conecta por número, se conecta por variable** | ⏳ bloqueado por V20 |
| **WP-V25** | 31 comandos declarados sin handler + 1 id duplicado: rellenar desde catálogo o caer con acta | ⏳ tras V22 |

### WP-V26 · Editor de configuración de la demo

Encargo de O (§B.3 / candidato **O-d**), **aceptado**. No es UI nueva:
mis paneles y trees existentes pasan a operar sobre **el fichero de env
real del playground** en vez de sobre ajustes locales. Orden de
superficie: **env/puertos/URLs primero**, por encima de todo lo demás.
CA tentativo: la extensión lee y edita el fichero real · cero valores de
ajustes locales compitiendo con él · cambios visibles en la demo.
⚠️ Al tocar la **fuente común** de la demo, editar mal rompe a otros
carriles: el cómo (formato, escritura, validación) se fija en backlog,
no se improvisa (condición del propio O).
Dep: **O-c** (fichero de env, O propone / Z valida). Necesita: **tick**.
▸ R3 §1 lo eleva: es la **única interfaz futura V↔O**, y *nace nueva* —
no arrastra acoplamiento previo.
⚠️ **CERCO EXTERIOR** (R3 §2.a / §10.8): el env debe resolver **dentro
del cerco** (`C:\S` + `C:\S_LAB`). Ni la extensión ni la demo pueden
arrancar colgando de una URL externa; lo de fuera se importa una vez y
las URLs quedan como metadato inerte.

## D · Deuda sin dueño

✅ **Solape con O: descartado** (custodio, R5). La Admin UI observa
**tráfico de sockets y operadores** del nodo; mis paneles observan
**capas superiores**. Objetos distintos a alturas distintas. Criterio que
me llevo: comparar el **objeto observado**, no la función.

⚠️ **Revisar contra el CERCO EXTERIOR**: mi `docs/GUIA-PRUEBA-v2.md` y el
README citan el Release público como referencia viva — deben quedar como
**metadato inerte de procedencia**, no como ancla de arranque.

5 superficies de marca legada visibles (`ARRAKIS_*`) · 5 tests jest rojos
preexistentes (reusables como guarda del mando de ciudad) · Release
público 0.2.0 + guardas (H-4, F-1/F-2/F-3), DEFERRED · contrato Z no fija
`reparto_required` ni forma del payload deny (a resolver en el cruce V20).

---

## E · ★ Wishlist emitida hacia O (R5, no son WPs míos)

| id | qué | estado |
| -- | --- | ------ |
| **W-1** | `GATE-O-CLAVES`: añadir inspección del **artefacto construido**, no solo del contexto de build. Evidencia: mis dos fugas de empaquetado se vieron con `unzip -l` del paquete real, nunca razonando el ignore | ★ sugerido |
| **W-2** | Portar mis dos workflows (`ci.yml`, `release.yml`) a Forgejo como prueba **de facto** de la portabilidad de Actions | ★ ofrecido, sin prisa |
| **W-3** | «el poder que existe, se ve» adoptado como criterio de mi UI | ✅ incorporado a WP-V22 |

---

**Nada encolado.** Material para cherry-pick del custodio.

— **V**
