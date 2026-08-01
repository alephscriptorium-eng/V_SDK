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
| **WP-V23** `P1` ✅ | **ACEPTADO 2026-08-01** (merge `12de442`, 4 rondas · 3 contrarrevisiones). **26 claves → 18**, un solo namespace, y **ninguna clave vieja sobrevive** (el revisor lo midió con patrón más ancho y reclasificó las 116 residuales **desde cero**). **Siete demoliciones**, no seis: la séptima nace al hallar una clave con el lector **tapiado por los dos extremos** — eligió **demoler y no cablear**, porque no hay un solo cliente de esa integración y cablear habría sido **inventar funcionalidad**. Colisión **C1** saldada (19 descripciones, `servidor\|servicio` = 0). Y **saca a la luz el defecto inverso**: 21 claves leídas de una sección que no las declara, **dos gobernando el arranque** sin que el usuario pueda verlas. **Donde más se aprendió fue en lo que no arregló**: declaró cinco pérdidas silenciosas y había **seis** — la sexta no era silencio sino **sustitución** por un valor plausible que alimenta el contexto de toda la extensión; **retiró su propia bendición** (cumplía el contrato del *método* y lo rompía la *superficie*); y no tocó conducta, arregló **la mentira** — el docstring que decía «no inventa localhost:puerto» **escrito encima de la línea que lo inventa**. Su hallazgo mayor ni era del WP: **la suite no es determinista** (11 corridas `5,5,5,6,7,5,…`) → **V90**. Cierra con `aleph0` por **DV-17**. ✎ **Conflicto de carriles resuelto por el orquestador** (la rama llevaba 4 rondas mientras V66 y V71 aterrizaban en los mismos ficheros): 4 conflictos mecánicos, resueltos conservando **las tres intenciones**, con cero claves viejas resucitadas y cero `console.*` nuevos. ✎ Histórico: **Entregado y devuelto** (2026-07-31). Resiste con nota: **ninguna clave vieja sobrevive** — el revisor reclasificó las 116 residuales **desde cero** con cubos disyuntos y patrón más ancho, cero configuración · acta completa (26 filas = 26 claves de la base) · las 6 demoliciones **verificadas contra la base**, ninguna función rota · las 21 huérfanas son 21 y el renombrado no crea ninguna · léxico con citas exactas y **C1 saldada de verdad** (19 descripciones, `servidor\|servicio` = 0) · números honestos · cero contrabando. Pero dos bloqueantes: **D1** `aleph0.pieza.ollama.baseUrl` es **clave declarada sin efecto** (su lector es código muerto en cadena de 3 saltos) — y el acta demolió 6 claves con ese mismo criterio, **tres de ellas con más lector que ésta**: o son 7 demoliciones, o se cablea · **D2** el **quinto silencio**, que no es silencio sino **sustitución**: `getDefaultSocketUrl()` (`mcpConfigurationManager.ts:214-225`) cae a `ws://localhost:${port}` sin ⏳ ni log, y ese valor alimenta el `socketUrl` de **toda** la extensión — el usuario que pierde el mesh ve su monitor apuntando a su propia máquina. Menores: la CA de V05 se dio por re-verificada con un patrón que **no ve el `localhost` interpolado** que hay (verde vacío) · la fusión omite que se **auto-adopta y auto-escribe** un fichero de la raíz en los ajustes. **Pregunta abierta al custodio** (D5): la cita de DV-16.a es verbatim correcta pero elide «**dentro de WP-V15**», que es la cláusula que decide si ata a V23; y `aleph0` **no tiene fila en el léxico** mientras `Zigurat` sí. | **Primera configuración intencional**: un solo espacio de nombres salido de la ontología; los 3 prefijos actuales se **demuelen**. **Ola 3, despachado 2026-07-31** (`wp/v23-config-intencional`, worktree `wt/v-v23`) — **único escritor de `package.json` esta ola** (cadena crítica §1); consume la colisión **C1** del léxico (*servidor* → *pieza*) · **contrarrevisión obligatoria** (contrato/config) | un namespace · acta de demolición · CA de V05 re-verificada |
| **WP-V24** `P1` | **Demoler el cliente 3010** → conector por catálogo/puerta declarada (dep V20) | cero puertos a mano · endpoint resuelto, no escrito |
| **WP-V25** `P1` | **31 comandos sin handler** + 1 id duplicado: rellenar desde catálogo o caer con acta | cero comandos que prometan lo que no hacen |
| **WP-V47** `P2` | **Retirar la marca previa** de las 5 superficies (`ARRAKIS_*`) | quien instala no lee marca ajena en ninguna superficie |
| **WP-V48** `P2` | 5 jest rojos → **guarda del mando de ciudad** (V34). **✎ REENCUADRE 2026-08-01 (de V90, verificado de primera mano por su contrarrevisión leyendo los cinco `failureMessages`)**: los cinco tienen **UNA SOLA CAUSA** y **no es el mock compartido** — los cinco son el mismo `TypeError: vscode.window.onDidCloseTerminal is not a function`, y el origen es el **mock inline** de `tests/integration/managerFactory.test.ts:9-53` (`{virtual:true}`, 4 claves), mientras `tests/mocks/vscode.mock.js:83` **sí expone** esa función. **Tocar el mock compartido NO mueve ninguno de los cinco.** La pista que circulaba (`H-8` de `WP-V23:616`) queda **rancia por dos motivos independientes**. Leer esto antes de despachar, o se gasta una ronda en el fichero equivocado | los 5 en verde · cubren ciclo de vida de terminales |
| **WP-V91** `P1` | **El instrumento de rojos no tiene gate propio** (declarado por el worker de V90 en §9.1 al cerrar, no hallado por nadie contra él). `scripts/rojos-jest.mjs` vigila la suite entera y **sus cuatro clases (`FALLA`/`OMITE`/`SUITE`/`SINNOMBRE`) y sus tres guardas (multiplicidad, ejecución efectiva, frescura) no tienen un solo test que las ejercite**. Es un gate sin gate — y las tres guardas existen **precisamente porque las tres fallaron** en contrarrevisión. ✎ Añadir a la vez la frase que V90 dejó escrita y que este WP debe sostener: **el gate convierte «empeoró en silencio» en «alguien firmó que empeoró»; NO garantiza que no empeore** — el baseline es un `.txt` sin checksum, sin dueño por línea y sin gate en CI, así que un rojo nuevo se legaliza añadiendo una línea | cada clase y cada guarda con su caso rojo · mutar el instrumento pone rojo su propia suite | P1 |
| **WP-V92** `P2` | **Tres citas rancias en reportes ajenos**, todas dejadas por V90 sin tocar (regla «un escritor por worktree»): `WP-V66:813` citaba un test del fichero que V90 **borró entero**, y `WP-V23:1375` y `:1385-1386`. Ninguna afecta a código; son deuda de trazabilidad. ✎ Regla que sale de la ola 4 (de U237-B3, misma clase): **una cifra o una cita «medida por grep» caduca — o se re-mide al citarla, o se cita el gate que la sostiene** | cero citas que apunten a ficheros o líneas inexistentes en los reportes vivos | P2 |
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
| **WP-V90** **`P0`** ✅ | **ACEPTADO 2026-08-01** (merge `a0ca305`, 1 contrarrevisión adversarial con 4 bloqueantes + ronda de corrección + verificación del orquestador sobre informe **real** de jest). **El método es lo mejor del WP: el worker se negó a hacer lo que le pedí.** Yo pedía diez corridas idénticas; respondió que **diez corridas iguales no prueban nada** porque en serie salen iguales sin arreglar nada, y montó **tres brazos** — A (sin arreglar, cargada) **6 de 10 discrepantes** · B (arreglado, misma carga) **10/10 por nombre** · C (arreglado, tranquila) **10/10**. Con control, no sólo con tratamiento. Y **los tres flapeadores del brazo A son exactamente tres de los censados**: el censo no es una lista plausible, es la lista de los culpables con confesión. El brazo C lo reprodujo el contrarrevisor **con contención real**. **Corrigió dos cosas del brief que resultaron falsas al medirlas**: los relojes falsos **no dejan la duración en 0** — la dejan valiendo *exactamente lo avanzado*, o sea que vuelven la aserción **tautología sobre el guion del propio test** (por eso reloj controlado en **un** sitio y retirada en los otros siete); y cae la **cota superior**, nunca la inferior. **Honestidad que consta**: declara que **sólo 3 de las 12** se vieron caer y que las otras 9 se retiran **por argumento**, en columna propia. El contrarrevisor verificó los nueve: las nueve dependen de la máquina, ninguna determinista se retiró sin motivo. **Los cuatro bloqueantes**, el primero con mucha ironía: **(B1)** el gate comparaba **conjuntos sin multiplicidad**, así que un rojo nuevo con nombre ya declarado pasaba entero — **el cardinal subió de 5 a 6 y el gate que vino a abolir el cardinal no se enteró**; en ese vector el instrumento viejo era **estrictamente más fuerte**. **(B2)** `--repetir` declaraba «las N corridas dieron el MISMO conjunto» con EXIT=0 **cuando jest no había ejecutado un solo test**. **(B3)** leía el JSON **sin prueba de frescura** — cerrado por el lado fuerte: `--gate` **corre jest él mismo** a un fichero con nonce fuera del árbol, con lo que la clase entera desaparece porque el gate controla su propia medida (y retiró su recomendación de encadenar con `;`, que **era** el vector). **(B4)** decía «cuatro nombres que prometen de más»; eran **nueve** — un cardinal mal contado en el reporte de un WP cuyo pecado original es un cardinal mal contado en un censo sobre cardinales. Lo llamativo: **su propio gate lo habría cazado si se lo hubiera aplicado a su reporte**. **Verificación del orquestador** sobre informe real: control → `IDENTICO`, exit 0; duplicado inyectado → exit 1 con `[sobran 1 de 2]`; `--repetir` sin ejecución → exit 2; JSON rancio → exit 2 citando la edad; `--runInBand` en args extra → exit 2. Árbol del worker limpio todo el tiempo. **Cambio de mayor radio, señalado por él para que se viera antes de fusionar**: borró `tests/performance/serviceStartup.test.ts` **entero** — importaba **cero líneas de producto**, así que sin los relojes sus tests sólo aseveraban sobre datos que ellos mismos construían: cinco verdes perpetuos en un fichero llamado «Performance Tests». Con él se fue `measurePerformance` de `setup.ts`, sin un solo consumidor. **El árbol final no contiene ni una lectura de reloj de pared** fuera del reloj falso, y el baseline no se movió. Cobertura real **24,91 %**, no el 12,6 % que circulaba. Sale a **V91** (el instrumento sin gate propio) y **V92** (citas rancias); reasigna **V48** | las aserciones de reloj de pared sustituidas o marcadas ✓ · 10 corridas con el mismo conjunto **por nombre** ✓ (medido en dos brazos) · el gate compara **nombres, no cardinales** ✓ |
| **WP-V89** `P1` | **Endurecimiento del censo de puntos de render** (nace de la 2.ª contrarrevisión de V66, 2026-07-31 — **partido a propósito**). El censo derivado del AST cazó los tres bypass enunciados, pero es **sintáctico donde debe ser semántico** y cae con variantes de una línea: **DD1** la regla de sumideros reconoce una *gramática* (`EqualsToken` + `.html` como identificador, clave `html` sin comillas) y no una *operación* → evaden clave entrecomillada, clave calculada, `Object.defineProperty`, `+=` · **DD2** `pathToCensus` resuelve por **nombre simple global** y sólo inspecciona el camino más corto: colisionar un nombre deja `chain.slice(0,-1)` vacío y **cero** intermediarios verificados; una llamada señuelo a cualquier render censado cortocircuita el BFS · **DD3** `DOC_SIGNAL`/`FRAG_SIGNAL` son textuales sobre literales propios: `String.fromCharCode(60)` deja la función en `kind:'none'`. **Modelo de amenaza a fijar**: el censo defiende contra **regresión en `src/`**, no contra un contribuyente hostil deliberado (quien edita `src/` edita el test) — la frontera de seguridad real es la guarda de ejecución. Insumo: apartado de aprendizaje que escribe el worker de V66 | la unidad verificada es la **operación** de asignación, no su sintaxis · resolución por identidad de módulo, no por nombre simple · el señuelo no cortocircuita · modelo de amenaza escrito en el contrato |
| **WP-V66** `P1` ✅ | **Seguridad de webviews · ACEPTADO 2026-08-01** (merge `299e197`, 5 rondas · 5 contrarrevisiones). Verificado por el orquestador: webviews **128/128**, conjunto completo **245** con los 5 rojos históricos y cero regresión. **Cierra la guarda de ejecución**, que es la frontera real contra entrada externa: tokenizador con **fail-closed** (lo no analizable se rechaza, y aun así **209/210** del árbol pasan) · **normalización de URL convergente** — una puerta, dos clasificadores — tras **1026 casos dirigidos y 15.350 mutaciones** contra el parser WHATWG sin una divergencia insegura · atributos clasificados **por lo que la URL hace** (`resource` vs `navigation`): el falso positivo de `<a href>` pasó de **202/209 ficheros a 0** sin relajar `ping` ni `form action`, que son exfiltración · `<image>` **arreglado en vez de anotado** (rechazaba de menos) · y la capa que no depende del análisis: **si el contenido viene de disco no hay scripts**, diga lo que diga la config. Esa capa —decisión propia del worker— es la razón de que cuatro rondas de hallazgos en el analizador dieran **cero incidentes de ejecución**. Lección que deja escrita: *la prisa por cerrar un hallazgo produce el siguiente, y el reporte tiende a describir la intención en vez del código*. El censo sale a **V89** | ~~cero `unsafe-inline`~~ ✓ · CSP verificada por test ✓ · los bypass en rojo ✓ |
| ~~**WP-V66**~~ (histórico de la devolución) | **Seguridad de webviews**: CSP, nonce, `localResourceRoots`. **La 2.ª contrarrevisión halló 4 bypass**; el orquestador **parte el WP**: V66 cierra solo las **vulnerabilidades reales** — **DD4** `attrOf` (`security.ts:186`) sólo parsea valores **entrecomillados**, así que `src=https://evil.example/x.js` sin comillas devuelve `undefined` y el bucle de `URL_BEARING` hace `continue` (ídem `onXXX=` y `style=`) · **DD5** `stripHtmlComments` (`:177`) **desincroniza con el tokenizador HTML** (`<!-->` abrupt-closing y `<!--` dentro de valor de atributo) → marcado que el navegador ejecuta desaparece del análisis. **Ambas explotables sin tocar `src/`**, por el HTML de disco que `getDriverUIConfig()` sirve con `enableScripts:true`. Lo estructural (censo) sale a **V89**. Instrucción de fondo: dejar de analizar HTML hostil con regex — **si no se puede analizar con confianza, se rechaza**. Obra sustancial **viva en rama `wp/v66-csp`** (tip `9f0a5d7`, worktree conservado) — **no mergeada**: la contrarrevisión adversarial halló 3 bypass no cazados (censo por fichero y no por punto de render · **script externo CON nonce, explotable** · `hasCspMeta` burlable con comentario HTML) + inyección de directivas en el helper. Defectos numerados y lo que SÍ resiste: **`plan/DEVOLUCION-V66-csp.md`**. **Corrección despachada 2026-07-31 al deshielo** (worker fresco, misma rama y worktree, commits nuevos; al cerrar, **nueva contrarrevisión adversarial obligatoria** que reintente los 8 vectores) | cero `unsafe-inline` · CSP verificada por test · los 3 bypass en rojo |
| **WP-V67** `P1` | **Tema y accesibilidad** | legible en claro/oscuro · navegación por teclado |
| **WP-V71** `P1` ✅ | **OutputChannel + log estructurado · ACEPTADO 2026-08-01** (merge `56b5265`, 3 rondas · 2 contrarrevisiones). Verificado por el orquestador: logging **135/135**, conjunto **252** con los 5 rojos históricos, y la **probe de paridad ejecutada por mí: 0 desvíos de nivel**. **La equivalencia 1:1 dejó de ser inspección y pasó a ser medida** — comparador que cotea base y árbol llamada a llamada, y que tras la devolución **viaja en el entregable** (`scripts/probes/`), porque una medida que nadie puede repetir es una cita. **La redacción se arregló de raíz a la segunda**: desaparece la lista aparte para claves y queda **un solo vocabulario** del que salen las dos mitades, con el invariante fijado **en pareja** por término — la frontera que se había roto dos veces (`?auth=` sí y `--auth` no; luego `apikey` en claro junto a `apiKey` tapado **en la misma línea**). Los **límites van fijados por test**: cerrarlos pone rojo. El gate es AST, no regex (descubrió que la regla estándar sola caza 6 de 9 alias). **Dos gestos que constan**: probó restringir `globalThis` entero, vio que rompía un uso legítimo y **lo deshizo** declarando que su «cero usos» venía de un grep truncado; y declaró que sus 135 tests nuevos **agravan el flapeo de reloj del mundo** (→ V90), efecto real de su cambio dicho sin que nadie preguntara | cero `console.log` sueltos ✓ · depurable en máquina ajena ✓ · cero cambio observable **demostrado** ✓ |
| ~~**WP-V71**~~ (histórico) | **OutputChannel + log estructurado**. **Ola 3, despachado 2026-07-31** (`wp/v71-log-estructurado`, worktree `wt/v-v71`) — habilitado por V80 (troceo del bootstrap: ya no colisiona con V25/V62/V64); **prohibido tocar `package.json`** (lo tiene V23) · **contrarrevisión obligatoria** §4.5 cero-cambio-observable | depurable en máquina ajena · cero `console.log` sueltos |
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
