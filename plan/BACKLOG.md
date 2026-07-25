# BACKLOG — carril V (v-sdk · Zigurat / host VS Code)

Estados: ⬜ pendiente · 🔶 en curso · ✅ aceptado. Serie: **WP-Vnn**.
Semilla: `fundar_v-sdk_zigurat_f84c7f99.plan.md` (borrador de agente
básico, arquitectura válida) **refinado a este backlog** por el vigía-S
(2026-07-26). Fuente de verdad de comportamiento:
`C:\S_LAB\z-sdk\plan\REPORTES\CONTRATO-IDE-OPT-IN-v1.md` (U177).
Decisiones abiertas que BLOQUEAN lo indicado: `plan/DECISIONES.md`
(las resuelve el custodio; no improvisar sobre ellas).

**Meta del carril:** `.vsix` v1 contract-compliant **lista para
probar** → validación por el vigía-S (tick asentado en el plan de S).

## Reglas duras del carril

- Método: skills `@alephscript/skills-scriptorium@>=0.11.0` (v0.7:
  claim pre-emulación · poda-junction · hostil-omite · evidencia
  enmascarada · guard identidad opt-in).
- Un WP = un worker = una rama `wp/vNN-<slug>` = worktree en
  `C:\S_LAB\.worktrees\v\` · contrarrevisión independiente en WPs de
  contrato/config/empaquetado · gate `Rn-V` por ola · solo el
  orquestador escribe este BACKLOG.
- z-sdk y OASIS: **SOLO LECTURA** (z se consume por contrato/servicios;
  el espejo OASIS es referencia). Cero obra en
  `C:\S\scriptorium\codebase\v-sdk` (atlas RO).
- Identidad de commits: usar preflight `verificar-identidad.mjs`
  (0.11.0) — nada de placeholders.

## Ola 0 · Fundación (secuencial) — gate R1-V al cierre

- ✅ **WP-V01 · Repo + taller + estación** — crear
  `alephscriptorium-eng/V_SDK` (DV-01), clone a `C:\S_LAB\v-sdk`
  PRESERVANDO este `plan/`, primer commit de gobierno (plan/ +
  README misión), calibrar `plan/ESTACION.md`, boot estación-viva +
  watcher (contrato ONCE 0.11.0). **CA:** repo main con plan/ ·
  watcher vivo con lease · identidad-raiz PASS post-commit.
  *(R1-V = cierre Ola 0 tras V01–V03; no inventar R1-V PASS en V01.)*
  Brief: `plan/BRIEFS/WP-V01-repo-taller-estacion.md`.
  Reporte: `plan/REPORTES/WP-V01-repo-taller-estacion.md`. Merge
  `90fffd9`.
- ✅ **WP-V02 · Semilla del producto** — importar tip de
  `escrivivir-co/vscode-alephscript-extension` @
  `integration/beta/scriptorium` según DV-03 (historial preservado +
  tag `import/scriptorium-<sha>`); incorporar el
  `README-SCRIPTORIUM.md` huérfano del espejo OASIS; `.gitignore`
  (*.vsix, dist/, node_modules/). **CA:** tip importado con tag ·
  árbol completo · procedencia documentada en el reporte. Dep:
  V01. Brief: `plan/BRIEFS/WP-V02-semilla-producto.md`.
  Reporte: `plan/REPORTES/WP-V02-semilla-producto.md`.
  Tag: `import/scriptorium-793de5e92527`. Merge tip post-V02 en main.
  STANDING_GO=true. README-SCRIPTORIUM: no hallado (documentado).
- ✅ **WP-V03 · Dependencia standalone + higiene DX** — romper
  `file:../MCPGallery` de `@alephscript/mcp-core-sdk`: preferido
  registry `npm.scriptorium.escrivivir.co` si el paquete existe
  (comprobar `npm view`); si no, vendor `vendor/*.tgz` interno.
  Higiene del mismo lote: script `debug:view` con path `oracl`,
  mismatch de uninstall ID. **CA:** `npm ci` limpio en checkout
  fresco sin hermanos externos · `npm run compile` verde ·
  contrarrevisión (dependencias usadas↔declaradas). Dep: V02. Brief: `plan/BRIEFS/WP-V03-deps-standalone.md`. STANDING_GO=true. Reporte: `plan/REPORTES/WP-V03-deps-standalone.md`. Gate V03 PASS · R1-V PASS.

## Ola A · Checkpoint `.vsix` v0 — gate R2-V

- ✅ **WP-V04 · Empaquetado v0 + CI** — `vsce package` standalone →
  `dist/zigurat-0.0.x.vsix`; smoke install (`code
  --install-extension`: activación sin errores); CI
  (`ci.yml` lint/compile/test + artifact .vsix en Actions). **CA:**
  .vsix instalable en VS Code limpio · CI verde con run-id ·
  smoke documentado en REPORTES. Dep: V03. **Checkpoint v0: el
  esqueleto vive standalone.** Brief: `plan/BRIEFS/WP-V04-empaquetado-v0.md`. R1-V PASS · STANDING_GO. Reporte: `plan/REPORTES/WP-V04-empaquetado-v0.md`. CI `30157700368`. R2-V PASS.

## Ola B · Pedido 2 — desacople (∥ posible entre V05 y V06) — gate R3-V

- ✅ **WP-V05 · Config única** — settings schema del workspace
  (`zigurat.*`): hosts/puertos/baseUrl; ELIMINAR defaults absolutos y
  de otra máquina. Cirugía mínima conocida (del censo Zigurat):
  `src/libs/alephscript-client.ts:36` (3010 fijo) ·
  `src/core/AracneBotService.ts:26` ·
  `src/core/mcpConfigurationManager.ts:101,103,129-164` (ollama,
  launcher, flota fija con wdir ajenos) · `src/processManager.ts:178`.
  **CA:** grep de rutas absolutas de máquina y puertos hardcodeados
  fuera de defaults de schema = 0 · extensión arranca con settings
  vacíos mostrando ⏳ honesto · contrarrevisión (eje hostil-omite:
  ¿qué pasa sin settings?). Dep: V04. Brief: `plan/BRIEFS/WP-V05-config-unica.md`. Lane ∥ V06. Reporte: `plan/REPORTES/WP-V05-config-unica.md`. Gate V05 PASS.
- ✅ **WP-V06 · Catálogo dinámico** — cliente MCP a
  `launcher://info|catalog|ports` + tools
  `resolve_capability`/`list_capabilities` de `@zeus/mcp-launcher`
  (puerto por settings); árbol MCP y tasks alimentados por catálogo
  en caliente; `DEFAULT_TASKS`/tablas fijas 3001-3066 eliminadas o
  degradadas a fallback MARCADO como tal; barrios no montados = `⏳`.
  **CA:** con launcher vivo, inventario en caliente · sin launcher,
  ⏳ honesto (no error fatal, no datos inventados) · cero puertos
  fijos nuevos. Dep: V04 (∥ V05, ficheros disjuntos declarados en
  briefs). Brief: `plan/BRIEFS/WP-V06-catalogo-dinamico.md`. Lane ∥ V05. Reporte: `plan/REPORTES/WP-V06-catalogo-dinamico.md`. Gate V06 PASS · R3-V PASS.

## Ola C · Contrato IDE fases 1–5 — gate R4-V

- ✅ **WP-V07 · Identidad + lectura (fases 1-2)** — join de room →
  peer-card emitida por la autoridad; seat verificado VÍA API del
  protocol (cero cripto propia); card renovada por join (no cacheada
  como identidad); ssbId visible; resources MCP proyectados en
  UI/estado. **CA:** flujo join→card→resources demostrado contra
  z-sdk local · card expirada ⇒ re-join (probado) · contrarrevisión
  (hostil-omite: sin card, sin seat). Dep: V06. Brief: `plan/BRIEFS/WP-V07-identidad-lectura.md`. R3-V PASS · STANDING_GO. Reporte: `plan/REPORTES/WP-V07-identidad-lectura.md`. Gate V07 PASS.
- ✅ **WP-V08 · Mutación + autoría (fases 3-4)** — tools de mutación
  con gate visible en errores/UI; autoría linea-editor
  (`crear_linea`/`export_story_board`); **motivos_deny LEÍDOS de
  `editor://info` en runtime** (cláusula viva del contrato — la
  lista del servidor manda, hoy 8 motivos) y representados
  textualmente; deny sin efecto colateral visible. **CA:** los 8
  motivos actuales representados desde runtime (no hardcodeados) ·
  demo verde/rojo contra despliegue con
  `ZEUS_LINEA_EDITOR_REQUIRE_REPARTO` activo · contrarrevisión.
  Dep: V07. Brief: `plan/BRIEFS/WP-V08-mutacion-autoria.md`. Lane ∥ V09. Reporte: `plan/REPORTES/WP-V08-mutacion-autoria.md`. Gate V08 PASS.
- ✅ **WP-V09 · Elenco (fase 5) + separación** — panel de elenco
  alimentado por datos del carril Z (`filasCastDesdeReparto` /
  contrato cast-table); la compañía teatral IDE (ICompany) queda
  como capa propia SEPARADA — prohibido fusionarla con `reparto/1`
  (cláusula del contrato). **CA:** dos modelos de datos distintos y
  documentados · panel elenco desde reparto real · contrarrevisión.
  Dep: V07 (∥ V08 posible, zonas UI distintas). Brief: `plan/BRIEFS/WP-V09-elenco-separacion.md`. Lane ∥ V08. Reporte: `plan/REPORTES/WP-V09-elenco-separacion.md`. Gate V09 PASS · R4-V PASS.

## Ola D · Checkpoint `.vsix` v1 «lista para probar» — gate R5-V

- ✅ **WP-V10 · v1 + Release** — `package.json` (publisher DV-05,
  name/displayName, semver 0.1.0), `.vscodeignore` endurecido,
  pipeline `npm ci → compile:production → vsce package`; smoke
  DOCUMENTADO en REPORTES (activación + catálogo en caliente + un
  deny de autoría visible); **GUÍA DE PRUEBA para el custodio**
  (pasos numerados, requisitos de runtime local z-sdk, settings
  ejemplo); GitHub Release con .vsix adjunto (GO Release custodio).
  **CA:** .vsix v1 instalable · guía de prueba de ≤10 pasos ·
  CI+Release verdes con run-ids · **aviso al carril S para el tick
  de validación del vigía**. Dep: V05+V06+V07+V08+V09. Brief: `plan/BRIEFS/WP-V10-v1-release.md`. R4-V PASS · STANDING_GO · publisher DV-05 scriptorium. Reporte: `plan/REPORTES/WP-V10-v1-release.md`. CI `30158827844` · Release `v0.1.0` · Gate V10 PASS · **R5-V PASS**.

## Ola E · Constelación (post-v1 · GOs aparte, NO bloquea v1)

- ⬜ **WP-V11 · Atlas y punteros** — gitlink `codebase/v-sdk` en
  scriptorium (GO DA-S11 aparte) · nota en a-sdk (ancla
  VsCodeExtension → V_SDK, sin duplicar obra; frontera: la ejecuta
  a-sdk) · actualizar path canónico en cantera 00-ZIGURAT de s-sdk
  (frontera: s-sdk) · nota corta a Z («consumidor IDE materializado;
  contrato v1 sin cambios»). **CA:** según DV-06.

## Ola F · CORTE — prerequisito de todo y de un re-release honesto

Origen: `C:/S/vigilancia/REPLAN-V-ciudad-zigurat.md` §4, transcrito por el
orquestador-V (§9·C6: el replan es handoff; lo transcribe el orquestador).
**Renombrado de olas aplicado** (aviso §4 + §9·C1): las olas A–F del replan
son aquí **F–K**, porque este backlog ya usaba 0·A·B·C·D·E. La **Ola E
vigente** («Constelación», WP-V11) no se toca: sigue ⬜ y queda reencolada
tras el re-release de esta ola, por decisión del custodio.

Gate al cierre de la ola: **R6-V**. **Sin R6-V no hay re-release.**

- ⬜ **WP-V12 · Censo y veredicto** — censo de lo absorbido en WP-V02:
  una fila por **entrada de primer nivel** del repo y por **módulo de
  `src/`**, con veredicto *queda* / *re-contenido* / *poda* y motivo. Es
  el documento que **D-1** exige (alcance de la amputación). La tabla §2
  del replan es **punto de partida, no respuesta**: se verifica contra el
  disco. **No borra nada — V12 solo decide.** **CA:** cero
  `<pendiente>` · una fila por entrada y por módulo · cada fila con
  motivo y con la fuente que la respalda. Dep: —.
  Brief: `plan/BRIEFS/WP-V12-censo-veredicto.md`.
- ⬜ **WP-V13 · Poda** — retirar del árbol lo marcado *poda* por el censo
  (filas 17, 18, 20, 21 de §2 del replan como punto de partida).
  **CA:** `git rm` con acta · probes V07/V08/V09 siguen PASS · el `.vsix`
  arranca igual. Dep: V12. **Bloqueado por DV-11 y DV-12 (abiertas).**
- ⬜ **WP-V14 · Marca del producto** — barra de actividad,
  `configuration.title`, icono, `README.md`. **CA:** quien lo instala lee
  **Aleph-0** y no lee «Arrakis Theater» **ni «Zigurat»** en ninguna
  superficie de usuario (§8 · DV-16; guía de revisión, no gate). Dep: V12.
- ⬜ **WP-V15 · Espacios de nombres** — lo que sobreviva pasa a un solo
  prefijo; declarar lo heredado que se quede. Absorbe el renombrado de
  claves de settings si **DV-16.a** se cierra en (b) —
  `extension-id → scriptorium.aleph-0`, claves → `aleph0.*`— y entonces
  **re-verifica la CA de WP-V05** con las claves nuevas (§9·C5). **CA:**
  un solo prefijo en `contributes.commands` salvo excepciones declaradas.
  Dep: V13. **Bloqueado por DV-16.a (abierta).**
- ⬜ **WP-V16 · Falsedad silenciosa** — ola L1 de
  `HANDOFF-S-COLA-LIMPIEZA-post-R5V.md`: (a) el probe importa el parser
  real en vez de reimplementarlo · (b) nombre del `.vsix` derivado de la
  versión, cero literales `0.1.0` · (c) `lint` que puede fallar o sale del
  CI · (d) guarda del release manual · (e) declarar qué verifica el
  pipeline. **CA:** los 5 CA de L1; en particular, un cambio en el parser
  real **rompe** el probe (demostrado) y `npm version 0.2.0` produce asset
  `…-0.2.0.vsix`. Dep: —.
  Brief: `plan/BRIEFS/WP-V16-falsedad-silenciosa.md`.
- ✅ **WP-V17 · Puerta de permisos** — (a) la ausencia de información no
  concede permiso: `parseEditorInfo.ts:83` falla abierto mientras `:80`
  falla cerrado, en el mismo literal · (b) pruebas unitarias de los
  invariantes del contrato. **CA:** L2-01 y L2-02; casos mínimos
  `required` ausente · `reparto.required` sin `reparto_required` ·
  `motivos_deny` ausente · motivo fuera de lista · `visible` ausente.
  Dep: —. Brief: `plan/BRIEFS/WP-V17-puerta-permisos.md`.
  Reporte: `plan/REPORTES/WP-V17-puerta-permisos.md`. Obra `411777a` ·
  doble contrarrevisión convergente (`6208d5e` PASS + `977bea5`
  devolución documental) · aceptación `8acc409` · merge `2899732`.
  V17-A → cola Z (contrato debe fijar forma del payload deny) ·
  V17-B → censo V12/V13 (coverage/).

**Primer lote despachable:** V12 ∥ V16 ∥ V17 (independientes, ficheros en
alcance disjuntos declarados en los briefs). V13 · V14 · V15 en cuanto
V12 cierre y el custodio resuelva DV-11 / DV-12 / DV-16.a.

## Olas G–K · planificadas, sin desarrollar

Títulos asentados para constancia del plan completo
(`REPLAN-V-ciudad-zigurat.md` §4, letras ya renombradas). Ninguna se
desarrolla hasta que su ola previa cierre; el detalle vive en el replan.

- ⬜ **Ola G · MANDO DE CIUDAD** (WP-V18…V22) — gate **R7-V**. Joya 1.
  Cierra G1, G2, G3. Dep: Ola F. Enmendada por §9·C3: V18 se reduce a
  enlazar `health` y pintar estado (el árbol ya se alimenta del catálogo,
  CA de V06); **V19 es el hueco de verdad** (`launch_mcp_server` /
  `stop_mcp_server` / `restart_mcp_server` / `launch_all` a cero).
- ⬜ **Ola H · BARRIOS Y VENTANAS** (WP-V23…V26) — gate **R8-V**. Dep: G.
- ⬜ **Ola I · IDENTIDAD Y AUTORÍA** (WP-V27…V29) — gate **R9-V**. Dep: H.
  Cierra G7, G8.
- ⬜ **Ola J · EL MAPA** (WP-V30…V32) — gate **R10-V**. Joya 2. Cierra G9.
  Dep: G.
- ⬜ **Ola K · ENTRADA** (WP-V33…V36) — gate **R11-V**. Cierra G4, G5,
  G6 (rebajado a hueco de UX por §9·C2), G10. Al cerrar K: **re-release**
  y solo entonces **WP-V11** (atlas), con **DV-06 enmendado** (DV-14).

## Wishlist (§5 del replan · fuera de esta tanda, sin fecha)

- ⬜ Editor de agentes de la ciudad (`customEditors` re-contenido, fila 15)
- ⬜ Participantes de chat con personajes reales del reparto (fila 19)
- ⬜ 3D del jugador: player-3d-ui · solar-system · force-system
- ⬜ Firehose navegable con filtros (firehose-browser)
- ⬜ Actas y partes como superficie propia (acta-kit · parte-kit)
- ⬜ Almacén y caché (blobstore-client · cache-browser · blob-sync-harness)
- ⬜ Visor WebRTC (webrtc-viewer · oasis-webrtc)
- ⬜ Puente de operador (operator-bridge · operator-ui)
- ⬜ Volúmenes (volumes-ops) · embajador (embajador-kit) · SSB (ssb-system)
- ⬜ Marketplace (sigue diferido, DV-10)

## Economía de CPU (obligatoria en todos los WP desde la Ola F)

Señalado por el custodio: tres agentes compilando y probando lo mismo en
paralelo saturan la máquina y no producen evidencia nueva.

1. **Ranura de proceso caro.** `npm ci`, `compile*`, `test`, `vsce
   package` y cualquier comando de coste comparable se ejecutan con
   `bash scripts/slot.sh run <etiqueta> -- <comando…>`. Nunca dos a la
   vez: la ranura es compartida por todos los worktrees del repo.
2. **Evidencia con huella.** Todo resultado caro se registra con
   `bash scripts/evidencia.sh registrar <etiqueta> PASS|FAIL` →
   `EVIDENCIA.md` del worktree (HEAD + árbol limpio + hash del lockfile +
   sello).
3. **No repetir sin causa.** Antes de gastar, `bash scripts/evidencia.sh
   vigente <etiqueta>`: si sale 0, la huella no ha cambiado desde el
   último PASS y **se cita el registro anterior en vez de re-ejecutar**.
   Lo decide el script, no el criterio de cada agente.

## Fuera de alcance (heredado del borrador, vigente)

Reabrir U73/U172-U177 en Z · publish npm de paquetes Z · capa
federada L1↔L2 · identidad nueva · force-push/reescritura ·
obra en el atlas · marketplace (post-GO Release, ops PAT aparte).
