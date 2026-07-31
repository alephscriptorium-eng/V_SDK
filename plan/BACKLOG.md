# BACKLOG — carril V · Aleph-0 (ℵ₀)

| dato | valor |
| ---- | ----- |
| Mundo | `C:\S_LAB\v-sdk` — el **Zigurat**: el IDE desde el que se opera la Ciudad |
| Serie | `WP-Vnn` · método `swarm-orquestacion` · estados ⬜ pendiente · 🔶 en curso (exige worker+claim) · ✅ aceptado |
| Fuente normativa | **INFORME-R4** + consenso H-01 (env obligatorio · 4a · C1 preferente · CA en ticks nuevos) |
| Edición | **F2-unificada** (2026-07-26) — refactor del Anfitrión sobre F2 de V + revisión Temis; un solo plan Scriptorium, seis carpetas |
| Doctrina | INÉDITO (primera versión; nadie migra porque nadie usó) · CERCO v2 (§10.8 local-first) · estructura antes que interfaz · centro vacío |

---

## Visión del mundo acabado

> El editor es del usuario del Scriptorium: **el centro se mantiene vacío**.
> Todo lo mío vive en la periferia. Acabado significa: **desde este IDE se
> entra a la Ciudad, se la ve entera sin que la vista mienta, se la manda,
> y se edita lo que el contrato declare editable — instalable por un
> desconocido en una máquina limpia, sin heredar un solo `✅`.**

Invariantes de todos los lanes: **no mentir** (⏳ visible, nada inferido) ·
**ámbitos, no cadenas de mando** · **toda conexión con fila declarada**
(catálogo, segunda puerta documentada, o «sin superficie» con motivo) ·
**cerco v2** (local-first; peers del contrato sí, anclas vivas no).

**Dependencias externas de este plan** (un solo Scriptorium): la puerta del
grafo y sus 2 modalidades = **Z-D1/U233-235** · estructura playground =
**HUB/G52** · fichero env = **O-c** (O posee schema con Z; V posee editor) ·
orquestador de arranque que el mando de ciudad consume = **U234** · matriz
de canal/puertas = **U236**.

---

# F2 · Lanes hacia el mundo acabado

## LANE A · ESTRUCTURA (antes que interfaz) — **P0**

| WP | brief | CA tentativo |
| -- | ----- | ------------ |
| **WP-V21** `P0` ✅ | **Gate de consumo de la estructura del Zigurat — VEREDICTO: ABIERTO** (`plan/GATE-V21-consumo-estructura.md`): 13 rutas citables verificadas con ojos propios (greps con exit code · contraste de citas contra el repo G vía `git show` · mapa↔grafo↔V22 fila a fila). El gate tuvo dientes: **H1/H2/O2/O3 enrutados a G** (base de `ZEUS_STARTPACK_ROOT` sin declarar · fallback dev pre-throw en `startpack.mjs:21-25` · censo no machine-readable · ruta relativa cosmética) y **O4 a V19/V20** (4 packs sin entrada en CATALOG_SEED → las vistas pintan ⏳, no fingen). **La UI de V queda desbloqueada.** Aceptado 2026-07-31 (rama `wp/v21-gate-consumo`) | estructura citada por ruta ✓ · frontera estructura/lienzo ✓ (cero fugas) · cero VS Code hasta el gate ✓ (diff = 1 doc) |
| **WP-V22** `P0` ✅ | **Mapa barrio → superficie**: `plan/MAPA-SUPERFICIES.md` — las 14 entradas de `CATALOG_SEED` mapeadas (4 «no va (aún)» por `workspace: null`, destino V19 contra V20; filas solar condicionadas a V57/V20 y así declaradas); 43/50 piezas del workspace fuera del catálogo (denominador cerrado por U179: 51 = 50 workspace + 1 anidada). Aceptado por el orquestador 2026-07-31 (rama `wp/v22-mapa-superficies`) | tabla completa sin `<pendiente>` ✓ · cada «no va» con motivo ✓ · ninguna fila implica jerarquía ✓ (citas muestreadas por el orquestador contra z-sdk) |
| **WP-V27** `P1` ✅ | **Léxico del Zigurat**: `plan/LEXICO-ZIGURAT.md` — 17 términos con fuente ruta:línea (acuñaciones declaradas: pieza·superficie·Zigurat); la «ontología» no existe como doc único — el glosario cita cada fragmento donde vive. **Tabla de 10 colisiones** con greps y conteos: C1 la crítica (UI dice «servidor»×40 donde el plan dice «pieza» — contradice U217 de Z; canónico = pieza → **insumo de V23**) · C3 peercard con 3 grafías · C4 «asiento» polisémico (regla: prohibido sin calificar) · C5 `src/launcher/` alberga catálogo (→V19/V23). Regla al pie: término nuevo sin fila = FAIL. ⏳ «maquinaria» reservada hasta que G la fije (U216). Aceptado 2026-07-31 (rama `wp/v27-lexico`) | glosario citable ✓ · cada término con fuente ✓ · colisiones detectadas exhaustivas ✓ · sin jerarquía ✓ |

## LANE B · ENTRADA E IDENTIDAD — **P0**

| WP | brief | CA tentativo |
| -- | ----- | ------------ |
| **WP-V28** `P0` ✅ | **Cliente MCP mínimo**: `src/mcp/` (fetch nativo, JSON-RPC HTTP, resultado honesto tipado; endpoints por config→env central de Z por NOMBRE, cero literales). Contratos citados de z-sdk RO (`editor://info` editor-server.mjs:135 · `launcher://catalog` launcher-server.mjs:42). Verificación contra runtime real = skip-honesto, cierra con V18/Z-D1. Candidato dedup anotado: migrar `src/launcher/`+`src/resources/` a consumir `src/mcp/` (mataría los 8 errores TS preexistentes). Aceptado 2026-07-31 (rama `wp/v28-cliente-mcp`; re-verificado por orquestador: 21+1skip, grep literales=0, deps-diff=0) | conecta ✓ (fixture declarado) · lee ambos resources con forma citada ✓ · falla honesto sin runtime ✓ (⏳ tipado, cero throw) |
| **WP-V18** `P0` **BLOQUEA:** holón-7 | **Entrar al grafo como edificio-1** y marcar mi fila. **Sin dilema** (consenso): la puerta es `rooms`/`socket-server` (`CLIENT_REGISTER`, la card **viaja** — verificado por Z); anónimo base y card opt-in son **las dos modalidades del mismo contrato** (§2.a) y el CA de Z-D1 exige ambas. El torno WebRTC es otra capa con dueño y WP (Z·U186); no condiciona esta entrada | fila V marcada · modalidad usada declarada en la marca · evidencia de facto contra runtime (dep **Z-D1**) · cero escritura fuera de mi fila |
| **WP-V29** `P1` | **Peercard opt-in**: emitir/portar card, seat vía API del protocol (cero cripto propia) | join→card→resources demostrado · card expirada ⇒ re-join · sin card, anónimo funcional |
| **WP-V30** `P1` | **Anónimo honesto**: la UI declara modalidad y capacidades ausentes | modalidad visible siempre · denegación con porqué · ausencia de card ≠ error |

## LANE C · CONFIGURACIÓN — el editor de la demo — **P0**

| WP | brief | CA tentativo |
| -- | ----- | ------------ |
| **WP-V26** `P0` | **Editor del fichero env real** del playground (O-c): **V implementa el editor; el schema/validación son de O+Z**. Única interfaz V↔O, nace ahora | edita el fichero real generado desde `presets-sdk/env` · cero ajustes locales compitiendo · resuelve dentro del cerco · schema consumido, no inventado |
| **WP-V31** `P1` | **Endpoints por variable, nunca por número** | grep de puertos literales fuera de defaults de schema = 0 |
| **WP-V32** `P1` | **Validación honesta del env** | cada clave ✅/⏳/⛔ · ninguna inventada · sin red sigue diciendo verdad |
| **WP-V33** `P2` | **Perfiles de entorno** (local/lab/vps) por contrato, no por path | cambiar perfil no edita rutas a mano · perfil activo visible |

## LANE D · CATÁLOGO Y MANDO DE CIUDAD — **P0/P1**

| WP | brief | CA tentativo |
| -- | ----- | ------------ |
| **WP-V20** `P0` **BLOQUEA:** modelo de integración | **Documento de puertas, conjunto con Z** (dep U236): todo lo consumible tiene fila — catálogo, segunda puerta declarada, o «sin superficie» con motivo. Cero clientes a medida furtivos | documento con fila por pieza consumida · firmado por ambos lados (V consume · Z posee canal) · V24 y V28 lo citan |
| **WP-V19** `P1` | Las 4 entradas del catálogo que no lanzan: causa y destino o descarte | cada una con causa · destino o «sin superficie» razonado |
| **WP-V34** `P1` | **Mando de ciudad**: launch/stop/restart de barrios **consumiendo el orquestador de Z (U234)** — el IDE manda, el runtime orquesta; cero spawn a mano en la extensión | arranca y para un barrio real vía contrato · estado real, no optimista · terminal por barrio |
| **WP-V35** `P1` | **Salud de barrios** con ⏳ honesto | salud real · sin runtime, ⏳ y no error fatal |
| **WP-V36** `P1` | **Árbol de ámbitos**: zonas que solapan y enlaces horizontales dibujables | una zona en dos sitios se ve como una · nada sugiere que arriba manda |

## LANE E · OBSERVACIÓN DE CAPAS SUPERIORES — **P1**

*(dominio; el transporte lo observa la Admin UI de O — sin solape, cerrado en R5)*

| WP | brief | CA tentativo |
| -- | ----- | ------------ |
| **WP-V37** `P1` | `console-monitor` → panel 1 | pieza real, no espejo · vacío honesto |
| **WP-V38** `P1` | `firehose-browser` → panel 2, **por cursor** (flujo, no pozo) | navega por cursor · no promete totales incontables |
| **WP-V39** `P1` | `cache-browser` → panel 3 | cacheado Y no-cacheado visibles · cache miss visible |
| **WP-V40** `P2` | Visor de story-boards, personajes refs-only | refs-only · ciclo raw→triaged→canon visible |
| **WP-V41** `P2` | **Elenco vivo** con `ICompany` separada por contrato | dos modelos documentados · reparto real |

## LANE F · VOLUMES DESDE EL IDE — **P1** *(consenso H-01 aplicado)*

| WP | brief | CA tentativo |
| -- | ----- | ------------ |
| **WP-V42** `P1` | **Lector del adaptador**: namespace lógico, root por **env obligatorio** (◆5 votada; jamás cwd) | pieza citada por nombre lógico · root usado visible · dos cwd, mismo resultado |
| **WP-V43** `P1` | **Manifiesto ≠ estado** como dos hechos; la deriva es dato | ambos a la vez · divergencia visible, no fatal |
| **WP-V44** `P1` · compromiso **T9** | **Evidencia de réplica verificable por tercero** (HUB-084 consume esta evidencia) | verificación desde fuera de A y B · autocertificación rechazada por diseño |
| **WP-V45** `P1` | **Procedencia + hash tras import** legibles | cada pieza dice qué es y de dónde vino · URL externa = sidecar inerte |
| **WP-V46** `P2` | **Curación humana declarada**; el import nunca la pisa | opt-in explícito · import respeta o falla ruidoso |

## LANE G · PRIMERA VERSIÓN INTENCIONAL (deuda → demolición) — **P1**

*(INÉDITO: no hay usuarios que migrar; hay caminos que retirar con acta)*

| WP | brief | CA tentativo |
| -- | ----- | ------------ |
| **WP-V23** `P1` | **Primera configuración intencional**: un solo espacio de nombres salido de la ontología; los 3 prefijos actuales se **demuelen** | un namespace · acta de demolición · CA de V05 re-verificada |
| **WP-V24** `P1` | **Demoler el cliente 3010** → conector por catálogo/puerta declarada (dep V20) | cero puertos a mano · endpoint resuelto, no escrito |
| **WP-V25** `P1` | **31 comandos sin handler** + 1 id duplicado: rellenar desde catálogo o caer con acta | cero comandos que prometan lo que no hacen |
| **WP-V47** `P2` | **Retirar la marca previa** de las 5 superficies (`ARRAKIS_*`) | quien instala no lee marca ajena en ninguna superficie |
| **WP-V48** `P2` | 5 jest rojos → **guarda del mando de ciudad** (V34) | los 5 en verde · cubren ciclo de vida de terminales |
| **WP-V49** `P1` | **Cerco en documentos**: referencias vivas a canales externos → sidecar inerte | cero anclas externas como dependencia |
| **WP-V80** `P1` ✅ | **Trocear `extensionBootstrap.ts`**: 2150 → **290 líneas** de flujo; DATOS en `src/core/bootstrap/` (16 módulos: tabla de 56 comandos por dominio + registry de 14 vistas). **La cadena serial V25·V62·V64·V71 queda habilitada como paralelo.** Base no compilaba limpia (8 err TS preexistentes ajenos) → invariante aplicado: misma salida EXACTA antes/después (tsc diff vacío · esbuild 0/0 · mismos 5 jest rojos por nombre), verificado en cada uno de los 7 commits. **Contrarrevisión adversarial PASS** (base regenerada por el revisor · 56/56 extracción propia mismo orden · 14/14 vistas campo a campo · captura-viva equivalente con citas · 286 literales rastreados globalmente · obs menor: trailing whitespace en 2 template literals, sin conducta). ⏳ verificación en host real la cubre el arnés V68 en CI. Aceptado 2026-07-31 (rama `wp/v80-troceo-bootstrap`) | bootstrap <300 ✓ (290) · misma salida exacta ✓ · dedup 1-definición ✓ · cero cambio observable ✓ (probado) |

## LANE H · EMPAQUETADO Y CANAL — **P0/P1**

| WP | brief | CA tentativo |
| -- | ----- | ------------ |
| **WP-V50** `P1` | **Guardas del release**: tag≠versión, check-then-act, `shell:true`, publish sin gates | tag falso **falla** · guardas probadas, no declaradas |
| **WP-V51** `P1` | **Gate de artefacto** (W-1): verificar contra el paquete real | `unzip -l` en el CA · las dos fugas históricas cubiertas por test |
| **WP-V83** `P1` | **Supply-chain del VSIX**: SBOM, checksums, audit de deps, provenance | vsix inspeccionado y trazable · deps auditadas en CI |
| **WP-V86** `P0` | **PRIMERA release pública aceptada** — absorbe al viejo V52: semver lo decide el custodio (no hay 0.1/0.2 que salvar); artefacto firmado/hash; guía apunta al artefacto. **Decisión ③ (custodio 2026-07-31): corte con el histórico** — scope `alephscriptorium/aleph-scriptorium` muerto; identidad pública muy Scriptorium, ligada al scope nuevo (github + registry npm nuevos · v-sdk.escrivivir.co); contadores reiniciados; la Release v0.1.0 antigua se desconecta y depreca; canal = GitHub Release; Marketplace **DEFERRED** (spike market propio → O96) | DoD R11-V completa · sha asset = sha local · anomalía del v0.1.0 extinguida |
| **WP-V53** `P2` | **Portar workflows a Forgejo** (W-2): prueba de facto de portabilidad | los dos workflows verdes en la forja sin reescribir |
| **WP-V11** `P2` | **Atlas y punteros**: gitlink `codebase/v-sdk` + notas | R6-V PASS ya ✅ · falta GO DA-S11 |

## LANE I · LA CAMPANA — la mesa como caso de uso — **P2**

| WP | brief | CA tentativo |
| -- | ----- | ------------ |
| **WP-V54** `P2` | **Hospedar la campana**: campanilla FS → `parte-kit` sobre mesh vía `operator-bridge` | un PING llega por mesh · la mesa se notifica con piezas que censa |
| **WP-V55** `P2` | **Sincronía como superficie** desde el IDE | sala legible sin salir del editor · escritura sigue en estrella |

## LANE J · JUEGO Y 3D — **P2 (horizonte)**

| WP | brief | CA tentativo |
| -- | ----- | ------------ |
| **WP-V56** `P2` | **Catálogo de juegos de G** en el IDE: existe ≠ tiene datos | sin inventar disponibilidad |
| **WP-V57** `P2` | **Ventanas 3D** (`solar/force/player-3d`): la decisión superficie-o-enlace se toma **por pieza contra V20** — habrá de ambas | cada pieza con fila y motivo · si enlace, dentro del cerco |
| **WP-V58** `P2` | **`editor-ui`/`player-ui`**: frontera declarada por pieza (webview, enlace o vecina — según contrato Z/G, no por preferencia) | frontera declarada · cero duplicación de función |

## LANE K · L1 Y FRONTERA CON O — **P2 (horizonte)**

| WP | brief | CA tentativo |
| -- | ----- | ------------ |
| **WP-V59** `P2` | `ssb-system` en lectura: L1 visible, jamás escritura desde la sala | cero escritura al pub · L1 marcado |
| **WP-V60** `P2` | `blobstore-client` en lectura con frontera O | CID visible · el IDE no posee el blob |
| **WP-V61** `P2` | `acta-kit`/`parte-kit` como superficie | acta legible entera · cristalización nunca desde aquí |

## LANE L · PRODUCTO — instalable por un desconocido — **P0/P1**

| WP | brief | CA tentativo |
| -- | ----- | ------------ |
| **WP-V68** `P0` ✅ | **Arnés Extension Host**: `tests/exthost/` (lanzador + suite in-host + acta JSON anti-verde-por-construcción) sobre VS Code 1.131.0 real; **modo `.vsix` probado** — corre desde el artefacto instalado, no del fuente. Job `exthost` en ci.yml (run verde en CI = ⏳ honesto hasta el primer push — se verifica en el gate R7-V). Guardas probadas de facto (caso malo → ROJO exit 1). **Hallazgo ORO → V25/V72**: **31/99 comandos contribuidos SIN registrar + 5 registrados sin fila en el manifiesto** (lista en `plan/REPORTES/WP-V68-arnes-exthost.md`) · host transitoriamente unresponsive en activación (→V73/V88). Aceptado 2026-07-31 (rama `wp/v68-arnes-exthost`; diff package.json = 2 líneas de scripts, 0 devDeps nuevas — `@vscode/test-electron` ya estaba) | activación/comandos/vistas probados en VS Code real ✓ (local ambos modos; CI ⏳ primer push) · el ⏳ estructural de la guía muere ✓ |
| **WP-V84** `P0` | **Matriz limpia de plataforma**: VS Code mínimo real, Windows/Linux, `.vsix` sin repo ni node_modules | instala y activa en máquina limpia · `engines.vscode` verificado, no supuesto (absorbe la mitad viva del viejo V74) |
| **WP-V82** `P0` | **Workspace Trust + secretos + permisos**: workspace no confiable no ejecuta procesos; secretos en SecretStorage/env | untrusted = cero spawn · cero secretos en settings/logs |
| **WP-V62** `P1` | **Ciclo de vida**: activación por evento real, `deactivate`/`dispose` completos | cerrar la ventana no deja procesos ni watchers |
| **WP-V63** `P1` | **Estado declarado y regenerable** | inventario de estado · borrarlo no rompe · nada contradice al env |
| **WP-V64** `P1` | **Superficie de error**: qué pasó y qué hacer, siempre | cero excepciones mudas · cero éxito parcial fingido |
| **WP-V65** `P1` | **Resiliencia**: reconexión con backoff, sin tormentas ni zombis | sobrevive caída y vuelta · el corte se ve mientras dura |
| **WP-V66** `P1` 🔶 **DEVUELTO** | **Seguridad de webviews**: CSP, nonce, `localResourceRoots`. Obra sustancial **viva en rama `wp/v66-csp`** (tip `9f0a5d7`, worktree conservado) — **no mergeada**: la contrarrevisión adversarial halló 3 bypass no cazados (censo por fichero y no por punto de render · **script externo CON nonce, explotable** · `hasCspMeta` burlable con comentario HTML) + inyección de directivas en el helper. Defectos numerados y lo que SÍ resiste: **`plan/DEVOLUCION-V66-csp.md`** | cero `unsafe-inline` · CSP verificada por test |
| **WP-V67** `P1` | **Tema y accesibilidad** | legible en claro/oscuro · navegación por teclado |
| **WP-V71** `P1` | **OutputChannel + log estructurado** | depurable en máquina ajena · cero `console.log` sueltos |
| **WP-V72** `P1` | **Menús/keybindings/`when`** coherentes con lo real | cero menús a comandos inexistentes |
| **WP-V85** `P1` | **Privacidad y datos**: inventario de datos/red/logs; opt-in explícito | cero telemetría accidental · inventario publicado |
| **WP-V87** `P1` | **Actualización/rollback**: update fallido no pierde env/estado | rollback probado · uninstall coordina V75 |
| **WP-V88** `P1` | **Presupuestos de recursos**: activación, memoria, refrescos medidos en CI | presupuesto declarado y vigilado · refrescos sin bucle |
| **WP-V69** `P2` | Multi-root y workspace sin carpeta | abre sin carpeta · multi-root declarado |
| **WP-V70** `P2` | **Primer arranque** comprensible sin README | camino claro al env |
| **WP-V73** `P2` | **Coste**: 99 comandos, árboles, activación — medir antes de crecer | presupuesto de activación declarado |
| **WP-V74** `P2` | **Plataforma soportada** (lo que queda del viejo V74 tras V84): política de versiones VS Code hacia delante | política escrita · cero deuda de «migrar usuarios» inexistentes |
| **WP-V75** `P2` | **Desinstalación limpia** | ni procesos, ni ficheros fuera de ámbito, ni ajustes huérfanos |
| **WP-V76** `P1` | **CA del centro vacío** verificable (dep V68) | cero pestañas abiertas por la extensión · el test falla si un WP futuro rompe la doctrina |

## LANE M · GOBIERNO Y FUNDACIÓN — **P0**

| WP | brief | CA tentativo |
| -- | ----- | ------------ |
| **WP-V81** `P0` ✅ | **Fundación del plan**: `plan/VISION.md` + `plan/PRACTICAS.md` — contrato local único del carril (invariantes I-1..I-5 literales en PRACTICAS §1; ejes CA §3; riesgo §4; evidencia §5). **El backlog apunta a ese par y no lo duplica.** Aceptado por el orquestador 2026-07-31 (rama `wp/v81-fundacion`) | contrato local único ✓ · invariantes fuera del backlog ✓ (worker no tocó BACKLOG; verificado) |
| **WP-V77** `P0` ✅ | **Grafo de deps y contención**: `plan/GOBIERNO-EJECUCION-F2.md` §1–§3 — **aceptado por el orquestador (2026-07-31, GO ola 0)**; correcciones de forma aplicadas (V52→V86 · puerta=rooms) | lotes paralelos con alcance disjunto verificado |
| **WP-V78** `P0` ✅ | **Gates por lane + definición de terminada**: íd. §4–§5 — **aceptado por el orquestador (2026-07-31, GO ola 0)** | cada lane con gate y evidencia · «terminada» = CAs, no opinión |
| **WP-V79** `P1` ⬜ | **Plantilla de brief**. Entregable preparado: `plan/BRIEFS/PLANTILLA-BRIEF-F2.md` — pendiente de aceptación | un worker nuevo no repite las 9 trampas censadas |

---

## Conteo

| prioridad | WPs |
| --------- | --- |
| **P0** | **13** — V18 · V20 · V21 · V22 · V26 · V28 · V68 · V77 · V78 · **V81 · V82 · V84 · V86** |
| **P1** | **37** — V19 · V23 · V24 · V25 · V27 · V29 · V30 · V31 · V32 · V34 · V35 · V36 · V37 · V38 · V39 · V42 · V43 · V44 · V45 · V49 · V50 · V51 · V62 · V63 · V64 · V65 · V66 · V67 · V71 · V72 · V76 · V79 · V80 · **V83 · V85 · V87 · V88** |
| **P2** | **21** — V11 · V33 · V40 · V41 · V46 · V47 · V48 · V53 · V54 · V55 · V56 · V57 · V58 · V59 · V60 · V61 · V69 · V70 · V73 · V74 · V75 |
| **total F2-unificada** | **71** en **13 lanes** *(V52 absorbido por V86)* |

`BLOQUEA:` — **V18** (holón-7) · **V20** (modelo de integración) ·
**V86** (nada es producto sin primera release aceptada).

Compromisos externos: **T9 → V44** (evidencia a HUB-084) · V26 consume
schema de O+Z · V34 consume U234 · V18 consume Z-D1.

---

## Histórico (cerrado · `[cita inerte]`)

Olas 0–F (V01–V17) ✅ hasta R6-V · detalle en `plan/REPORTES/` ·
decisiones en `plan/DECISIONES.md`.

---

**Nada despachado.** Todo espera aprobación o descarte del custodio.

— **V** · Aleph-0 (ℵ₀) · *edición F2-unificada por el Anfitrión*
