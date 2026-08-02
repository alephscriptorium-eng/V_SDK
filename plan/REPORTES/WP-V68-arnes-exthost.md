# WP-V68 · arnes-exthost — reporte

| dato | valor |
| ---- | ----- |
| agente | worker-V (swarm, rol WORKER) |
| fecha | 2026-07-31 |
| rama | `wp/v68-arnes-exthost` |
| commits | `5182988` (arnés + scripts + higiene ignore) · `5544533` (job CI) · este reporte |
| eje(s) CA | tipo **producto** (PRACTICAS §3: CA contra el artefacto real empaquetado) + de facto **funcional** (activación/comandos/vistas contra pieza real) |
| riesgo de revisión | el brief no traía los 4 campos de `revision-adversarial.md`; por PRACTICAS §4.2 (empaquetado/CI) esto **apunta a `independiente`** — clasificación final del orquestador, no mía |
| revisor distinto del worker | `⏳ pendiente de revisor distinto` (si el orquestador confirma `independiente`) |
| estado propuesto | listo para revisión |

## Qué se hizo

Arnés Extension Host con `@vscode/test-electron` (2.5.2, devDep **ya
declarada** en `package.json:1271` ⛔ *(cita rancia: coordenada caducada: `package.json` tiene hoy 1248 líneas. RE-MEDIDO: lo afirmado sigue en pie — `@vscode/test-electron` sigue siendo devDep ya declarada, hoy en `package.json:1229`, rango `^2.4.1`. Se conserva porque era cierta al escribirse)* — no se añadió ninguna): descarga un
VS Code real (1.131.0 stable), lo lanza con perfiles aislados bajo
`.vscode-test/` y ejecuta una suite dentro del Extension Host que prueba
de facto: presencia, activación sin errores, manifiesto↔registro de
comandos, ejecución real de un comando benigno, existencia de las 11
vistas y apertura del contenedor. Dos modos: **fuente** (development
path = repo) y **artefacto** (`vsce package` → `--install-extension`
del `.vsix` en extensions-dir aislado → la suite verifica que corre
desde lo instalado, no desde el fuente). La suite deja **acta JSON**;
sin acta el lanzador falla (mata el verde por construcción). Job
`exthost` añadido a `ci.yml` (ambos modos bajo `xvfb-run`).

Desvíos declarados ANTES de nada: ver §Desvíos.

## Archivos tocados

- `tests/exthost/runTests.js` — creado: lanzador (descarga VS Code, modo fuente/vsix, instala el artefacto, exige acta, veredicto)
- `tests/exthost/suite/index.js` — creado: suite que corre dentro del Extension Host + acta JSON
- `tests/exthost/harness-vsix/package.json` — creado: mini-extensión de desarrollo vacía para que el modo vsix no cargue el fuente
- `tests/exthost/harness-vsix/extension.js` — creado: activate/deactivate no-op del mini-arnés
- `package.json` — modificado: SOLO 2 líneas en `scripts` (`test:exthost`, `test:exthost:vsix`); cero devDeps nuevas
- `.github/workflows/ci.yml` — modificado: job `exthost` nuevo (checkout, node, auth registry como el job `build`, `npm ci`, ambos modos con xvfb)
- `.gitignore` — modificado: `+.vscode-test/` (VS Code descargado + perfiles del arnés)
- `.vscodeignore` — modificado: `+.vscode-test/**` (sin esto, empaquetar tras correr el arnés metería un VS Code entero en el `.vsix`)

## Evidencia

> Salida literal de las ejecuciones definitivas (estado final del código),
> 2026-07-31. Logs completos: quedaron en el scratchpad de sesión
> (`exthost-source.log`, `exthost-vsix.log`, `exthost-strict.log`); lo
> perdurable es esta transcripción.

### CA-1 · Arnés corre local — modo fuente (VERDE)

```
√ Validated version: 1.131.0
- Downloading (319.94 MB)
√ Downloaded VS Code into C:\S_LAB\wt\v-v68\.vscode-test\vscode-win32-x64-archive-1.131.0
[exthost] ── acta de la suite (source · vscode 1.131.0 · 2026-07-31) ──
[exthost]   PASS  extensión scriptorium.aleph-0 presente (0.2.0) en C:\S_LAB\wt\v-v68
[exthost]   PASS  activación sin errores (activate() resolvió · isActive === true)
[exthost]   AVISO 31/99 comandos contribuidos NO registrados (el manifiesto promete lo que no responde — candidato WP-V72): [lista completa en §Hallazgos]
[exthost]   AVISO 5 comandos aleph0.* registrados SIN fila en el manifiesto: [§Hallazgos]
[exthost]   PASS  comando aleph0.statusBar.toggle ejecutó (×2, ida y vuelta) sin lanzar
[exthost]   PASS  las 11 vistas contribuidas existen para el workbench (comando <id>.focus presente)
[exthost]   PASS  contenedor aleph0 abre de facto (workbench.view.extension.aleph0)
[exthost] resumen del acta: 0 fallo/s · 2 aviso/s
[exthost] arnés VERDE (modo source) · exit code 0
```

### CA-2 · Modo .vsix EMPAQUETADO (VERDE — probado, no `<pendiente>`)

```
vsix.mjs: OK dist/aleph-0-0.2.0.vsix
[exthost] instalando artefacto: C:\S_LAB\wt\v-v68\dist\aleph-0-0.2.0.vsix
Installing extensions...
Extension 'aleph-0-0.2.0.vsix' was successfully installed.
[exthost] extensiones instaladas: scriptorium.aleph-0
[exthost]   PASS  extensión scriptorium.aleph-0 presente (0.2.0) en C:\S_LAB\wt\v-v68\.vscode-test\extensions-vsix\scriptorium.aleph-0-0.2.0
[exthost]   PASS  modo vsix: corre desde el artefacto instalado en C:\S_LAB\wt\v-v68\.vscode-test\extensions-vsix\scriptorium.aleph-0-0.2.0, no desde el fuente
[exthost]   PASS  activación sin errores (activate() resolvió · isActive === true)
[exthost]   PASS  comando aleph0.statusBar.toggle ejecutó (×2, ida y vuelta) sin lanzar
[exthost]   PASS  las 11 vistas contribuidas existen para el workbench (comando <id>.focus presente)
[exthost]   PASS  contenedor aleph0 abre de facto (workbench.view.extension.aleph0)
[exthost] resumen del acta: 0 fallo/s · 2 aviso/s
[exthost] arnés VERDE (modo vsix) · exit code 0
```

La identidad de artefacto es una aserción de la suite (no una declaración):
en modo vsix exige `extensionPath` dentro del extensions-dir aislado y
distinto de la raíz del repo.

### CA-3 · Workflow CI

- Job `exthost` escrito en `.github/workflows/ci.yml` (ambos modos con
  `xvfb-run -a`); YAML validado local (`js-yaml` → `YAML OK`).
- **Run verde en CI: ⏳ sin verificar** — honesto: no hay push en este WP
  (prohibido por brief); se verifica en el primer push de la rama.

### CA-4 · Diff de package.json = solo scripts

```
git diff (pre-commit) — package.json:
+    "test:exthost": "npm run compile && node tests/exthost/runTests.js",
+    "test:exthost:vsix": "npm run package:v1 && node tests/exthost/runTests.js --vsix",
```

Cero devDependencies añadidas: `@vscode/test-electron` ya estaba declarada
(`^2.4.1`, resuelta a 2.5.2 por el lockfile intacto — `package-lock.json`
sin diff). Manifiesto funcional (commands/menus/engines/versión): intacto.

## Evidencia de riesgo y contrarrevisión

- `CASOS_ADVERSARIALES`:
  - `[automatizado]` Guarda estricta con el caso malo: `EXTHOST_STRICT=1
    npm run test:exthost` → `resumen del acta: 1 fallo/s` · `arnés ROJO` ·
    `exit_npm=1`. La divergencia manifiesto↔registro tumba el proceso de
    verdad, no de palabra.
  - `[automatizado]` Camino rojo del lanzador ejercitado de facto: durante
    el desarrollo, la aserción de identidad de artefacto falló con falso
    positivo (extensions-dir aislado vive bajo el repo) y el arnés salió
    `arnés ROJO (modo vsix): 1 fallo/s` + exit 1 — el rojo se propaga; la
    aserción se corrigió a «dentro del extensions-dir Y distinto de la raíz
    del repo» y se re-ejecutó verde.
  - `[automatizado]` Anti-«verde por construcción»: la primera ejecución
    salió 0 sin salida visible de la suite; se añadió acta JSON obligatoria
    — sin acta, el lanzador muere aunque VS Code salga 0.
  - `[sin verificar]` Simulación de acta ausente por sabotaje deliberado
    del runner: no ejecutada (exigiría mutar el arnés para romperlo).
- `DEPENDENCIAS_DIRECTAS_VERIFICADAS`: `@vscode/test-electron` 2.5.2
  (única runtime del arnés; ya declarada) — verificada de facto por las 4
  ejecuciones; `@vscode/vsce` ejercitada vía `package:v1`. El arnés no
  añade ninguna dependencia al árbol.
- `INSTALACION_LIMPIA`: worktree sin `node_modules` → `npm ci --no-audit
  --no-fund` → `added 1543 packages in 3m` (registry público +
  `npm.scriptorium.escrivivir.co` para `@zeus/@alephscript`, lectura
  anónima).
- `TEST_AUTOMATIZADO_VS_EVIDENCIA_MANUAL`:
  - Automatizado: `npm run test:exthost` (verde), `npm run
    test:exthost:vsix` (verde), `EXTHOST_STRICT=1 npm run test:exthost`
    (rojo esperado, exit 1) — repetibles.
  - Manual: inspección del acta JSON en `.vscode-test/acta-*.json`; lectura
    de `.vscodeignore` para confirmar que `tests/**` y `.vscode-test/**` no
    viajan en el artefacto.
- `VEREDICTO_REVISOR`: `⏳ pendiente de revisor distinto` (si el
  orquestador clasifica `independiente`; el brief no traía los 4 campos).

## Auto-revisión (PRACTICAS del mundo — con honestidad)

- [x] Diff solo dentro del alcance: `tests/exthost/`, `scripts` de
  package.json, `ci.yml`, `.gitignore`, `.vscodeignore` — cero en `src/`,
  cero en `plan/BACKLOG.md`, `extensionBootstrap.ts` intacto (solo leído).
- [x] Cero árboles/ficheros copiados de otros mundos: arnés escrito aquí;
  la derivación del nombre del `.vsix` se REUTILIZA de `scripts/vsix.mjs`
  (spawn), no se duplica.
- [x] Sellos con fuente: rutas y líneas citadas existen
  (`package.json:1271` ⛔ *(cita rancia: coordenada caducada: `package.json` tiene hoy 1248 líneas. RE-MEDIDO: lo afirmado sigue en pie — `@vscode/test-electron` sigue siendo devDep ya declarada, hoy en `package.json:1229`, rango `^2.4.1`. Se conserva porque era cierta al escribirse)*, salidas literales arriba).
- [x] Sin promesa de futuro sin `<pendiente>`/⏳: run verde de CI marcado
  ⏳; sabotaje de acta marcado sin verificar.
- [x] Eje producto evidenciado: CA-2 contra el artefacto empaquetado e
  instalado, con aserción de identidad.
- [x] Gates ejecutados de verdad: 4 ejecuciones completas del arnés
  (fuente ×2, vsix ×2 tras fix) + guarda estricta.
- [x] Commits convencionales `wp(V68): ...`, atómicos (arnés / CI /
  reporte).
- [x] Diff solo del alcance del WP: sí (ver primer punto).
- [x] Riesgo cubierto: casos adversariales arriba; clasificación final
  devuelta al orquestador.
- [x] Automatizado separado de manual: sí (bloque anterior).

## Hallazgos fuera de alcance (ORO — no se arreglaron aquí)

1. **31 de 99 comandos contribuidos NO están registrados** — el manifiesto
   promete lo que no responde (rompe PRACTICAS §2.3 «cero comandos que
   prometan lo que no hacen»). Candidato directo a **WP-V72** (y toca el
   troceo V80). Lista completa medida de facto en VS Code real:
   `aleph0.mcpSocketManager.openConfigEditor`, `.startLauncher`,
   `.stopLauncher`, `.manageUIs`, `.manageMCPServers`; `aleph0.uis.start`,
   `.stop`, `.openBrowser`; `aleph0.showStatusPanel`;
   `aleph0.refreshStatus`; `aleph0.sockets.connect`, `.disconnect`,
   `.joinRoom`, `.leaveRoom`, `.sendMessage`;
   `aleph0.configs.openInEditor`, `.validate`, `.format`, `.backup`,
   `.createTemplate`, `.reload`; `aleph0.analytics.view`;
   `aleph0.logs.refresh`, `.clear`, `.export`, `.toggleAutoRefresh`,
   `.toggleGroupByCategory`, `.toggleErrorsOnly`, `.setLogLevel`,
   `.showChannel`; `aleph0.mcptree.stopAll`.
2. **5 comandos registrados SIN fila en el manifiesto** (invisibles en la
   paleta): `aleph0.agents.stopAll`, `aleph0.process.startLauncher`,
   `aleph0.process.stopLauncher`, `aleph0.system.showStatus`,
   `aleph0.system.restart`. Nótese el patrón: parecen los gemelos
   renombrados de contribuciones rotas del punto 1
   (`showStatusPanel`↔`system.showStatus`,
   `mcpSocketManager.startLauncher`↔`process.startLauncher`).
3. **Extension host transitoriamente `unresponsive` durante la
   activación** (VS Code llegó a arrancar el profiler): señal temprana
   para WP-V73/WP-V88 (presupuestos de activación).
4. El manifiesto contribuye 99 comandos — coincide con la cifra que
   WP-V73 cita de memoria; ahora hay medida de facto reproducible.

## Desvíos

1. **Preflight de identidad**: el detector canónico exige
   `WORLD_ROOT == CANONICAL_WORLD_ROOT` (semántica de estación). En modo
   worker la raíz autorizada a mutar ES el worktree; se calibró
   `WORLD_ROOT = CANONICAL = C:\S_LAB\wt\v-v68` con el clon canónico
   (`C:\S_LAB\v-sdk`) en `READ_ONLY_ROOTS` y `DOWNSTREAM_PATTERNS=[]` →
   `identidad-raiz: PASS` literal antes de todo efecto.
2. **`.gitignore` y `.vscodeignore` tocados** (no listados en la regla de
   ola): higiene exigida por el propio arnés — sin `.vscodeignore:
   .vscode-test/**`, empaquetar después de correr los tests metería el
   VS Code descargado (320 MB) dentro del `.vsix`.
3. **Red usada** (declaración exacta): (a) `npm ci` de las dependencias YA
   declaradas del manifiesto (1543 paquetes; registry público npm +
   `npm.scriptorium.escrivivir.co` para los scopes `@zeus`/`@alephscript`)
   — necesario para compilar, empaquetar y correr el arnés; (b) descarga
   de VS Code 1.131.0 stable (319.94 MB) por `@vscode/test-electron` — es
   la función del arnés («descarga/lanza VS Code real»). **No se instaló
   ninguna devDependency nueva**: `@vscode/test-electron` ya estaba en el
   manifiesto.
4. La divergencia manifiesto↔registro se dejó como **AVISO por defecto**
   (con `EXTHOST_STRICT=1` para volverla fallo): el defecto es del
   manifiesto (obra de WP-V72), y un arnés rojo permanente por defecto
   ajeno taparía regresiones nuevas. No se tapa: se imprime SIEMPRE con
   lista completa y queda en §Hallazgos. Si la revisión prefiere estricto
   por defecto, es un flip de una línea en los scripts.

## Dudas / bloqueos

- El brief no traía los 4 campos de `revision-adversarial.md`
  (clasificación de riesgo, etc.); por PRACTICAS §4.2 el empaquetado/CI
  apunta a contrarrevisión `independiente`. Queda al orquestador.
- CA-3 «run verde en CI»: ⏳ hasta el primer push de la rama (push
  prohibido a este worker). El job puede necesitar ajuste fino de xvfb en
  el runner real; el arnés en sí está probado local en Windows.

---

## Revisión del orquestador

_(la rellena el orquestador: aceptado ✅ / devuelto con lista numerada)_
