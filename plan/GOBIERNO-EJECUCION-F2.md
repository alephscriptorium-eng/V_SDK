# GOBIERNO DE EJECUCIÓN F2 — grafo de contención (WP-V77) + gates y definición de terminada (WP-V78)

| dato | valor |
| ---- | ----- |
| Carril | **V** · Aleph-0 (ℵ₀) |
| Entregable de | **WP-V77** (§1–§3) y **WP-V78** (§4–§5) |
| Estado | 🔶 preparado en sesión de asentamiento · **pendiente de aceptación del custodio** |
| Regla que lo motiva | en la Ola F, tres WPs tocando `package.json` se secuenciaron a mano **y aun así el lote se rompió**. Con 64 WPs, sin grafo no se despacha |

---

## §1 · Puntos calientes de contención (ficheros que comparten WPs)

**Regla de despacho: dos WPs de la misma fila NUNCA van en paralelo**,
salvo partición de secciones declarada en ambos briefs.

| fichero / zona | WPs que lo tocan | estrategia |
| -------------- | ---------------- | ---------- |
| `package.json` (manifiesto) | **V23** (claves→ontología) · **V25** (comandos) · **V62** (activationEvents) · **V72** (menus/when) · **V74** (engines) · **V52** (versión) | ⛔ **serial estricto**. Orden propuesto: V23 → V25 → V62 → V72 → V74 → V52. Es la cadena crítica del plan |
| `src/core/extensionBootstrap.ts` (~2200 líneas) | **V25** · **V62** · **V64** · **V71** | ver **V80** (§2): trocear primero convierte esta cadena serial en paralelo |
| webviews + `media/` | **V66** (CSP) · **V67** (tema) · **V37/V38/V39** (inquilinos) | V66 y V67 primero (marco común); después los 3 inquilinos **en paralelo** (un panel = un fichero) |
| `src/config` + resolución env | **V23** · **V31** · **V32** · **V26** | V23 fija nombres → V31 quita literales → V32 valida → V26 edita. Serial |
| docs (guía/README) | **V49** (cerco) · **V70** (primer arranque) · **V52** (release) | serial corto, barato |
| CI / `scripts/` | **V50** · **V51** · **V53** | V51 (gate de artefacto) antes que V50 (guardas) — el gate verifica a las guardas. V53 al final |
| `tests/` + arnés | **V68** · **V48** · **V76** | V68 crea el arnés; V48 y V76 lo consumen → V68 estrictamente primero |
| `GRAFO-STARTERKIT.md` (playground) | **V18** | un solo escritor por diseño (mi fila) — sin contención |

## §2 · WP habilitador nuevo — **WP-V80** (alta en LANE G)

**Trocear `extensionBootstrap.ts`: separar DATOS de FLUJO** (registro
declarativo de comandos/vistas). Era la primera costura del mapa de
transformación y F2 la dejó implícita. Hacerla explícita y **temprana**
tiene retorno estructural: la fila 2 de §1 deja de ser cadena serial —
V25, V62, V64 y V71 pasan a tocar módulos distintos.

## §3 · Grafo de dependencias y olas propuestas (★ propuesta, el custodio corta)

Dependencias externas (no las controla V): `O-c` (fichero env, O propone/Z
valida) → **V26** · respuesta de Z (¿rooms o signaling?) + Z-runtime →
**V18** · detalle de Z (4 no-lanzables) → **V19** · material de G → **V21**
· contrato de import de Z → LANE F.

```text
OLA F2-0 · GOBIERNO (esta sesión)      V77 · V78 · V79      [docs, hechos 🔶]
OLA F2-1 · CIMIENTOS (paralelo real)   V68 arnés · V80 troceo · V66 CSP ·
                                       V28 cliente MCP · V21 playground
OLA F2-2 · SUPERFICIE BASE             V22 mapa · V27 léxico · V67 tema ·
                                       V71 log · V62 ciclo de vida
OLA F2-3 · CADENA DEL MANIFIESTO       V23 → V25 → V72   (+V31→V32 en config)
OLA F2-4 · CIUDAD                      V18 (si Z responde) · V26 (si O-c) ·
                                       V29 · V30 · V34 · V35 · V36 · V19 · V20
OLA F2-5 · VENTANAS Y VOLUMES          V37∥V38∥V39 · V64 · V65 · V42 · V43 · V45
OLA F2-6 · VERDAD Y CIERRE             V76 · V48 · V44 · V49 · V51 → V50 ·
                                       V63 · V47 · V25-resto
OLA F2-7 · PRODUCTO Y CANAL (P2)       V70 · V73 · V74 · V75 · V52 · V53 · V11 ·
                                       V33 · V40 · V41 · V46 · lanes I/J/K
```

Invariantes de despacho: techo **3 workers** (DV-15 sigue) · un WP = una
rama = un worktree · contrarrevisión independiente en contrato/config/
empaquetado · comandos caros por ranura · **un escritor por worktree**.

---

## §4 · Gates por lane (WP-V78) — qué evidencia cierra cada uno

| gate | lane | evidencia de facto que exige |
| ---- | ---- | ---------------------------- |
| **R7-V** | F2-1 cimientos | arnés corre un test trivial de activación **en CI** · bootstrap troceado compila · CSP presente en los 4 paneles (verificada por test, no por lectura) |
| **R8-V** | manifiesto | cero comandos sin handler · cero entradas de menú huérfanas · claves = ontología con tabla de migración · CA de V05 re-verificada |
| **R9-V** | ciudad | fila V marcada en el grafo (modalidad declarada) · launch/stop de un barrio real · salud con ⏳ honesto sin runtime |
| **R10-V** | ventanas/volumes | 3 inquilinos con pieza real · manifiesto≠estado visible · root por env (dos cwd → mismo resultado, probado) |
| **R11-V** | producto | checklist §5 completa |

Regla transversal heredada de la Ola F: **ningún gate cita PASS de
reporte** — se re-verifica de facto (grep/unzip/arnés/runtime), y el
artefacto se inspecciona **construido**, nunca por su patrón de ignore.

## §5 · DEFINICIÓN DE TERMINADA — lista de CAs, no opinión

La extensión está **lista** cuando TODO esto es verde **en máquina limpia**:

```text
[ ] instala desde .vsix en VS Code limpio y activa sin errores
[ ] arnés de Extension Host verde en CI (activación · comandos · vistas)
[ ] guía de prueba ejecutable ENTERA sin ⏳ estructurales (los pasos
    interactivos los cubre el arnés; el ojo humano confirma, no descubre)
[ ] cero comandos/menús que prometan lo que no hacen
[ ] CSP verificada por test en todo webview
[ ] centro vacío probado (V76): la activación no abre nada en el editor
[ ] modalidad de identidad siempre visible (anónimo/card) y cada
    capacidad denegada dice por qué
[ ] sin runtime: todo ⏳ honesto, cero errores fatales, cero datos inventados
[ ] artefacto == manifiesto (unzip -l en CA; sin .map, sin locks, sin secretos)
[ ] guardas de release probadas (tag≠versión FALLA de verdad)
[ ] migración de ajustes desde claves viejas probada · engines.vscode real
[ ] desinstalación no deja procesos, ficheros ni ajustes huérfanos
[ ] cero anclas externas vivas como dependencia de arranque (cerco)
[ ] los 5 jest rojos históricos en verde (V48) y guardando el mando
```

Trece casillas y una regla: **la que no se pueda marcar con evidencia,
no se marca** — se lista como ⏳ con su motivo, y «lista» espera.

— **V** · Aleph-0 (ℵ₀)
