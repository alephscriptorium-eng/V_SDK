# BACKLOG — carril V · Aleph-0 (ℵ₀)

| dato | valor |
| ---- | ----- |
| Mundo | `C:\S_LAB\v-sdk` — el **Zigurat**: el IDE desde el que se opera la Ciudad |
| Serie | `WP-Vnn` · método `swarm-orquestacion` · estados ⬜ pendiente · 🔶 en curso · ✅ aceptado |
| Fuente normativa | **INFORME-R4** (R1–R3 `[cita inerte]`) |
| Proyección | **F2** (2026-07-26) — mundo acabado proyectado a lanes; **nada despachado sin GO del custodio** |
| Doctrina | INÉDITO (romper sin duelo) · CERCO EXTERIOR (§10.8) · estructura en playground **antes** que interfaz · centro vacío |

---

## Visión del mundo acabado

> El editor es del usuario del Scriptorium: **el centro se mantiene vacío**.
> Todo lo mío vive en la periferia — barra, paneles, árbol, status, terminales.
> Acabado significa: **desde este IDE se entra a la Ciudad, se la ve entera
> sin que la vista mienta, se la manda, y se edita lo que el contrato
> declare editable — sin salir del cerco y sin heredar un solo `✅`.**

Cuatro invariantes que gobiernan todos los lanes:

1. **No mentir.** Lo no verificado se muestra `⏳`; lo no declarado no se
   infiere; un `✅` ajeno no se pinta como propio.
2. **Ámbitos, no cadenas de mando.** La UI representa alcance y
   suscripción; nunca autoridad por posición.
3. **Una puerta declarada.** Todo entra por catálogo, o por la segunda
   puerta **con fila en el documento**. Cero clientes a medida furtivos.
4. **Cerco.** Nada arranca colgando de un ancla externa viva.

---

# F2 · Lanes hacia el mundo acabado

## LANE A · ESTRUCTURA (antes que interfaz) — **P0**

| WP | brief | CA tentativo |
| -- | ----- | ------------ |
| **WP-V21** `P0` | Asentar en el `PLAYGROUND` la **estructura del Zigurat**: qué es estructura y qué es lienzo. Prerrequisito declarado de todo lo demás (R2 §2.b) | estructura navegable en playground · frontera estructura/lienzo explícita · **cero VS Code** en este WP |
| **WP-V22** `P0` | **Mapa barrio → superficie**: por cada entrada del catálogo, a qué superficie va (árbol/panel/status/terminal) y **cuál no va a ninguna** | tabla completa sin `<pendiente>` · cada «no va» con motivo · ninguna fila implica jerarquía |
| **WP-V27** `P1` | **Léxico del Zigurat**: vocabulario de la extensión derivado de la ontología del Scriptorium (barrio, zona, ámbito, edificio, pieza, corpus) | glosario citable · cada término con su fuente · cero sinónimos compitiendo en la UI |

## LANE B · ENTRADA E IDENTIDAD — **P0**

| WP | brief | CA tentativo |
| -- | ----- | ------------ |
| **WP-V28** `P0` | **Cliente MCP mínimo** de la extensión: conectar, listar resources/tools, leer. Prerrequisito de V18 | conecta a un servidor del catálogo · lee `editor://info` y `launcher://catalog` · falla honesto sin runtime |
| **WP-V18** `P0` **BLOQUEA:** holón-7 | **Entrar al grafo como edificio-1** y marcar mi fila en `GRAFO-STARTERKIT.md` | fila V marcada · **modalidad declarada** (anónima u opt-in) · cero escritura fuera de mi fila · evidencia de facto |
| **WP-V29** `P1` | **Peercard opt-in**: emitir/portar card, seat verificado vía API del protocol (cero cripto propia), renovada por join | join→card→resources demostrado · card expirada ⇒ re-join · sin card, funciona en anónimo |
| **WP-V30** `P1` | **Anónimo honesto**: la UI declara en todo momento en qué modalidad está y qué capacidades faltan por no tener card | modalidad visible siempre · toda capacidad denegada dice **por qué** · ausencia de card ≠ error |

## LANE C · CONFIGURACIÓN — el editor de la demo — **P0**

| WP | brief | CA tentativo |
| -- | ----- | ------------ |
| **WP-V26** `P0` | **Editor del fichero env real del playground** (encargo O · O-d): mis paneles y trees operan sobre él, no sobre ajustes locales. **Única interfaz V↔O** | lee y edita el fichero real · cero ajustes locales compitiendo · cambios visibles en la demo · resuelve **dentro del cerco** |
| **WP-V31** `P1` | **Endpoints por variable, nunca por número**: toda conexión resuelve por env/catálogo | grep de puertos literales fuera de defaults de schema = 0 |
| **WP-V32** `P1` | **Validación honesta del env**: qué falta, qué sobra, qué no se puede verificar | cada clave con estado ✅/⏳/⛔ · ninguna inventada · sin red, sigue diciendo la verdad |
| **WP-V33** `P2` | **Perfiles de entorno** (local/lab/vps) por **contrato, no por path** | cambiar perfil no edita rutas a mano · el perfil activo es visible |

## LANE D · CATÁLOGO Y MANDO DE CIUDAD — **P0/P1**

| WP | brief | CA tentativo |
| -- | ----- | ------------ |
| **WP-V20** `P0` **BLOQUEA:** modelo de integración | **Segunda puerta**: `socket-server`, `ciudad-lifecycle` y UIs quedan fuera del catálogo — o entran, o se declara la otra puerta con criterio | documento de dos puertas · **cero clientes a medida sin fila en él** |
| **WP-V19** `P1` | Las **4 entradas del catálogo que no lanzan**: causa nombrada y destino o descarte | cada una con causa · fila de destino o «no tiene superficie», con motivo |
| **WP-V34** `P1` | **Mando de ciudad**: `launch/stop/restart/launch_all` de barrios — el hueco real (hoy a cero) | arranca y para un barrio de verdad · estado real, no optimista · terminal por barrio |
| **WP-V35** `P1` | **Salud de barrios**: `health` enlazado y pintado, con ⏳ cuando no responde | salud real por barrio · sin runtime, ⏳ honesto y no error fatal |
| **WP-V36** `P1` | **Árbol de ámbitos**: zonas que **solapan** y enlaces **horizontales** dibujables. Un árbol estricto sería mentira de interfaz | una zona en dos sitios se ve como una · ningún widget sugiere que arriba manda |

## LANE E · OBSERVACIÓN DE CAPAS SUPERIORES — **P1**

*(observabilidad de **dominio**; el transporte lo observa la Admin UI de O — sin solape)*

| WP | brief | CA tentativo |
| -- | ----- | ------------ |
| **WP-V37** `P1` | **console-monitor** → ventana 1 de los cuatro paneles | consume la pieza real, no un espejo · vacío honesto cuando no hay datos |
| **WP-V38** `P1` | **firehose-browser** → ventana 2, con **cursor** (es flujo, no pozo) | navega por cursor · nunca promete totales que no puede contar |
| **WP-V39** `P1` | **cache-browser** → ventana 3 | muestra qué está cacheado **y qué no** · cache miss visible |
| **WP-V40** `P2` | **Visor de story-boards** (`story-board-schema`) con personajes refs-only | refs-only, jamás corpus embebido · ciclo raw→triaged→canon visible |
| **WP-V41** `P2` | **Elenco vivo**: panel alimentado por reparto real, `ICompany` separada por contrato | dos modelos de datos distintos y documentados · reparto real, no fixture |

## LANE F · VOLUMES DESDE EL IDE — **P1**

*(observación por defecto **read-only**; edición **opt-in y declarada**)*

| WP | brief | CA tentativo |
| -- | ----- | ------------ |
| **WP-V42** `P1` | **Lector del adaptador**: namespace lógico + mounts plurales, root por `ZEUS_VOLUMES_ROOT` (nunca por `cwd`) | cita una pieza por nombre lógico · el root usado es **visible** · dos cwd distintos dan el mismo resultado |
| **WP-V43** `P1` | **Manifiesto ≠ estado**: mostrarlos como **dos hechos separados**, y la deriva entre ambos como dato | declarado y actual se ven a la vez · divergencia visible, no fatal · nunca se presenta uno como el otro |
| **WP-V44** `P1` · compromiso **T9** | **Evidencia de réplica verificable por un tercero**: que un observador ajeno a A y B pueda afirmar que la réplica ocurrió sin preguntarles | verificación desde fuera de ambos nodos · autocertificación **rechazada** por diseño |
| **WP-V45** `P1` | **Procedencia + hash tras import** legibles sin salir del cerco | cada pieza responde qué es y de dónde vino · URL externa = metadato inerte |
| **WP-V46** `P2` | **Curación humana**: si V edita, es capacidad **declarada**, y el import **nunca** la pisa | edición es opt-in explícito · import respeta lo curado o falla ruidoso |

## LANE G · DEUDA Y VERDAD (refactor interno) — **P1**

| WP | brief | CA tentativo |
| -- | ----- | ------------ |
| **WP-V23** `P1` | **Ajustes → ontología del Scriptorium**: hoy 3 prefijos (`aleph0.` 13 · `alephscript.` 12 · `mcpSocketManager.` 1). El nombre sale de la ontología, no de mi prefijo | un solo espacio de nombres · tabla de migración · CA de V05 re-verificada |
| **WP-V24** `P1` | **Jubilar el cliente 3010 legado** → conector por catálogo/segunda puerta | cero puertos escritos a mano · endpoint resuelto, no escrito |
| **WP-V25** `P1` | **31 comandos declarados sin handler** + 1 id duplicado: rellenar desde catálogo o **caer con acta** | cero comandos que prometan lo que no hacen |
| **WP-V47** `P2` | **5 superficies de marca legada** visibles (`ARRAKIS_*` en títulos de panel y terminal) | quien instala no lee marca legada en ninguna superficie |
| **WP-V48** `P2` | **5 jest rojos preexistentes** (hueco del mock de terminal) → reusados como **guarda del mando de ciudad** | los 5 en verde · cubren ciclo de vida de terminales, que es lo que V34 necesita blindado |
| **WP-V49** `P1` | **Cerco en mis documentos**: guía de prueba y README citan el Release público como referencia viva → pasan a **metadato inerte** | cero anclas externas como dependencia de arranque |

## LANE H · EMPAQUETADO Y CANAL — **P1/P2**

| WP | brief | CA tentativo |
| -- | ----- | ------------ |
| **WP-V50** `P1` | **Guardas del release**: tag≠versión (F-1), check-then-act (F-2), citado con `shell:true` (F-3), publish sin lint/tests (H-4) | un tag `v9.9.9` con package en otra versión **falla** · guardas probadas, no declaradas |
| **WP-V51** `P1` | **Gate de artefacto** (mi W-1): verificar contra el **paquete real**, nunca razonando el patrón de ignore | `unzip -l` en el CA · dos fugas históricas cubiertas por test |
| **WP-V52** `P2` | **Release público 0.2.0** + equivalencia asset↔local (extingue la anomalía del v0.1.0) | sha del asset = sha local · guía apunta al artefacto publicado |
| **WP-V53** `P2` | **Portar mis workflows a Forgejo** (W-2): prueba **de facto** de la portabilidad de Actions | los dos workflows corren verdes en la forja nueva sin reescribir |
| **WP-V11** `P2` | **Atlas y punteros**: gitlink `codebase/v-sdk` + notas a a-sdk/s-sdk/Z | según DV-14: R6-V PASS + acta ✅ ya cumplido; falta GO DA-S11 |

## LANE I · LA CAMPANA — la mesa como caso de uso — **P2**

| WP | brief | CA tentativo |
| -- | ----- | ------------ |
| **WP-V54** `P2` | **Hospedar la campana**: sustituir la campanilla de ficheros por `parte-kit` (`campanasDesdeParte`) sobre el mesh vía `operator-bridge`. El mecanismo de reunión se vuelve **caso de uso de la Ciudad** | un PING llega por el mesh, no por FS · la mesa se notifica con las piezas que censa |
| **WP-V55** `P2` | **Sincronía como superficie**: buzón, timbre y compactos legibles desde el IDE | leer la sala sin salir del editor · escritura sigue en estrella (un buzón, un dueño) |

## LANE J · JUEGO Y 3D — **P2 (horizonte)**

| WP | brief | CA tentativo |
| -- | ----- | ------------ |
| **WP-V56** `P2` | **Catálogo de juegos de G** en el IDE: qué juegos hay y cuáles tienen datos | distingue «existe» de «tiene datos» · sin inventar disponibilidad |
| **WP-V57** `P2` | **Ventanas 3D**: `solar-system`, `force-system`, `player-3d-ui` — ¿superficie propia o enlace? | decisión declarada con motivo · si es enlace, respeta el cerco |
| **WP-V58** `P2` | **`editor-ui` / `player-ui`**: embebido en webview o vecina enlazada | frontera declarada · cero duplicación de la misma función |

## LANE K · L1 Y FRONTERA CON O — **P2 (horizonte)**

| WP | brief | CA tentativo |
| -- | ----- | ------------ |
| **WP-V59** `P2` | **`ssb-system` en lectura**: identidad L1 visible, **jamás** escritura desde la sala | cero escritura al pub · todo lo de L1 marcado como tal |
| **WP-V60** `P2` | **`blobstore-client`**: lectura de blobs con frontera O declarada | CID visible · nada que sugiera que el IDE posee el blob |
| **WP-V61** `P2` | **`acta-kit` / `parte-kit`**: actas y partes como superficie propia | un acta se lee entera desde el IDE · cristalización hacia L1 **nunca** desde aquí |

---

## Conteo

| prioridad | WPs |
| --------- | --- |
| **P0** | **6** — V18 · V20 · V21 · V22 · V26 · V28 |
| **P1** | **22** — V19 · V23 · V24 · V25 · V27 · V29 · V30 · V31 · V32 · V34 · V35 · V36 · V37 · V38 · V39 · V42 · V43 · V44 · V45 · V49 · V50 · V51 |
| **P2** | **17** — V11 · V33 · V40 · V41 · V46 · V47 · V48 · V52 · V53 · V54 · V55 · V56 · V57 · V58 · V59 · V60 · V61 |
| **total F2** | **45** en **11 lanes** |

`BLOQUEA:` — **V18** (holón-7, a los 6 carriles) · **V20** (modelo de
integración, a V/Z/O).

**Compromiso votado con dueño:** **T9 → WP-V44**.

---

## Histórico (cerrado · `[cita inerte]`)

| ola | WPs | cierre |
| --- | --- | ------ |
| 0 · Fundación | V01–V03 | ✅ R1-V |
| A · checkpoint v0 | V04 | ✅ R2-V |
| B · desacople | V05–V06 | ✅ R3-V |
| C · contrato IDE | V07–V09 | ✅ R4-V |
| D · v1 «lista para probar» | V10 | ✅ R5-V · Release `v0.1.0` |
| F · corte | V12–V17 | ✅ **R6-V** · re-release local `aleph-0-0.2.0.vsix` · acta `plan/REPORTES/ACTA-RE-RELEASE-0.2.0.md` |
| E · constelación | V11 | ⬜ → reencolado en LANE H |

Detalle por WP en `plan/REPORTES/`. Decisiones: `plan/DECISIONES.md`.

---

**Nada despachado.** Todo este backlog espera aprobación o descarte del
custodio (F2 · INFORME-R4 §2.4).

— **V** · Aleph-0 (ℵ₀)
