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

- 🔶 **WP-V10 · v1 + Release** — `package.json` (publisher DV-05,
  name/displayName, semver 0.1.0), `.vscodeignore` endurecido,
  pipeline `npm ci → compile:production → vsce package`; smoke
  DOCUMENTADO en REPORTES (activación + catálogo en caliente + un
  deny de autoría visible); **GUÍA DE PRUEBA para el custodio**
  (pasos numerados, requisitos de runtime local z-sdk, settings
  ejemplo); GitHub Release con .vsix adjunto (GO Release custodio).
  **CA:** .vsix v1 instalable · guía de prueba de ≤10 pasos ·
  CI+Release verdes con run-ids · **aviso al carril S para el tick
  de validación del vigía**. Dep: V05+V06+V07+V08+V09. Brief: `plan/BRIEFS/WP-V10-v1-release.md`. R4-V PASS · STANDING_GO · publisher DV-05 scriptorium.

## Ola E · Constelación (post-v1 · GOs aparte, NO bloquea v1)

- ⬜ **WP-V11 · Atlas y punteros** — gitlink `codebase/v-sdk` en
  scriptorium (GO DA-S11 aparte) · nota en a-sdk (ancla
  VsCodeExtension → V_SDK, sin duplicar obra; frontera: la ejecuta
  a-sdk) · actualizar path canónico en cantera 00-ZIGURAT de s-sdk
  (frontera: s-sdk) · nota corta a Z («consumidor IDE materializado;
  contrato v1 sin cambios»). **CA:** según DV-06.

## Fuera de alcance (heredado del borrador, vigente)

Reabrir U73/U172-U177 en Z · publish npm de paquetes Z · capa
federada L1↔L2 · identidad nueva · force-push/reescritura ·
obra en el atlas · marketplace (post-GO Release, ops PAT aparte).
