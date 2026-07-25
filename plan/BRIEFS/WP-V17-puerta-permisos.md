# BRIEF · WP-V17 · Puerta de permisos

```text
(rol) .claude/skills/swarm-orquestacion/reference/roles/WORKER.md

WP: WP-V17 · Puerta de permisos (Ola F · CORTE · ola L2 de la cola S)
Rama: wp/v17-puerta-permisos
Worktree: C:/S_LAB/.worktrees/v/v-sdk-wp-v17
Reporte: plan/REPORTES/WP-V17-puerta-permisos.md
Lote: V12 ∥ V16 ∥ V17 (independientes · ficheros en alcance disjuntos)

Lecturas:
- plan/BACKLOG.md · Ola F · WP-V17
- C:/S/vigilancia/HANDOFF-S-COLA-LIMPIEZA-post-R5V.md · ola L2 (V-L2-01, -02)
- C:/S/vigilancia/REVISION-S-WP-V10-v1.md · §2.1 y §2.9
- C:\S_LAB\z-sdk\plan\REPORTES\CONTRATO-IDE-OPT-IN-v1.md (SOLO LECTURA)
- src/mutation/parseEditorInfo.ts (la pieza)

QUÉ ES ESTO
Dos campos contiguos del mismo literal fallan en direcciones opuestas:
  :80  visible: g.visible !== false          → ausencia ⇒ true  (cerrado ✔)
  :83  repartoRequired: requireRepartoLive === true
                                             → ausencia ⇒ false (ABIERTO ✘)
Decidir «no hay permiso que pedir» a partir de una ausencia de
información es una puerta de permisos fallando abierta. Y no es
inalcanzable: un payload con `motivos_deny` presente como array y
`required` ausente da `ok:true` + `repartoRequired:false`.

ALCANCE — ficheros que puedes escribir (y ningún otro):
- src/mutation/parseEditorInfo.ts
- tests/unit/parseEditorInfo.test.ts        (nuevo)
- plan/REPORTES/WP-V17-puerta-permisos.md
Y, si el tipado lo exige, src/mutation/types.ts — solo si lo justificas
en el reporte.

FUERA DE TU ALCANCE (son de otros WP del mismo lote):
- package.json      → WP-V16 (bloque scripts). Ya existe `test:unit`;
                      úsalo. Si de verdad necesitas un script nuevo, NO lo
                      añadas: pídelo al orquestador y sigue sin él.
- .github/**, scripts/probes/** → WP-V16
- jest.config.js    → nadie en este lote. No lo toques.

TRABAJO

(a) La ausencia de información no concede permiso — V-L2-01
    Que las dos líneas fallen en la misma dirección. Dos salidas
    admitidas por la CA, elige una y justifícala:
      1. ausencia de `required` ⇒ requerido (`repartoRequired: true`),
      2. o `ok:false` explícito.
    Si eliges (1) y dejas `ok:true`, la honestidad ⏳ es obligatoria: el
    parser debe marcar visiblemente que el servidor NO declaró la
    exigencia y que el IDE está asumiendo lo estricto (`pendingReason` u
    otro canal visible). Nada silencioso.
    Ojo: `requireRepartoLive` ya distingue `null` (desconocido) de
    `false` (declarado no requerido) en :72-77. Esa distinción es
    correcta y hay que conservarla: el bug está en cómo :83 la colapsa.
    Antes de tocar, `grep -rn "repartoRequired\|requireRepartoLive" src
    tests scripts` y declara en el reporte a quién afectas.

(b) Prueba unitaria por invariante del contrato — V-L2-02
    tests/ hoy es herencia del legado: `grep parseEditorInfo tests/` = 0.
    El código crítico del contrato no tiene ni prueba ni puerta que la
    exija. Casos MÍNIMOS (todos, con nombre legible):
      1. `required` ausente                    ⇒ requerido (o ok:false)
      2. `reparto.required: true` sin `reparto_required` ⇒ requerido
         (es la divergencia que el espejo del probe no ve — REVISIÓN §1.1)
      3. `motivos_deny` ausente                ⇒ ok:false + ⏳
      4. motivo fuera de la lista del servidor ⇒ representado COMO tal
         (representMotivoDeny, :116-121 — la cláusula viva en los dos
         sentidos; es lo mejor del entregable, no lo rompas)
      5. `visible` ausente                     ⇒ visible true (cerrado)
    Añade los que encuentres: raw null, raw array, gate ausente,
    motivos_deny con elementos no-string. Cero motivos hardcodeados en
    src/ sigue siendo invariante del carril: si tu test necesita la lista
    de ocho, va en el FIXTURE del test, nunca en src/.

TRAMPA CONOCIDA — cómo correr las pruebas sin quemar la máquina
jest.config.js tiene `collectCoverage: true` y `coverageThreshold` global
(branches 75 · functions 80 · lines 85 · statements 85) sobre TODO
src/**. Un `npm test` completo recoge cobertura del repo entero y
fallará por umbral aunque tus pruebas pasen — y es caro. Para iterar:
  npx jest tests/unit/parseEditorInfo.test.ts --coverage=false
Solo la pasada final va por la ranura. En el reporte declara ambas cosas:
qué corriste y que el `npm test` completo sigue en rojo por el umbral
global del legado (es deuda conocida, no tuya; V-L2-02 no la resuelve).

FUERA DE ALCANCE DE ESTE WP (quedan en cola, no los toques)
- V-L2-03 · defaults de nombres de variable de entorno (:82, :86-87).
- V-L2-04 · «deny sin escritura» es heurística (:123-145): depende de
  Z-02 (campo afirmativo `wrote:false` en el contrato). Mientras no
  exista, el docstring y el reporte dicen que es inferencia — ya lo dicen.
Si los arreglas «de paso», rompes la disjunción del lote. No lo hagas.

COORDINACIÓN CON WP-V16 (mismo lote, se encuentran en la fusión)
- V16 hace que el probe v08 importe el parser REAL en vez del espejo. En
  TU rama el probe sigue siendo el espejo: si corres `npm run probe:v08`
  como regresión y sale PASS, ese PASS NO atestigua tu cambio. Decláralo
  así en el reporte, con esas palabras. Tu evidencia son las pruebas
  unitarias, no el probe.
- No fijes en tu rama nada que dependa del probe nuevo. Ficheros
  disjuntos; semántica cruzada; el orden de fusión lo decide el
  orquestador.

CA DE CIERRE
1. `parseEditorInfo.ts:80` y la línea de `repartoRequired` fallan en la
   MISMA dirección ante ausencia de dato (mostrado lado a lado en el
   reporte, antes y después).
2. Payload con `motivos_deny` presente y `required` ausente ⇒ requerido
   (o `ok:false`), con prueba que lo fija.
3. Los 5 casos mínimos de (b) existen y pasan; salida de jest en el
   reporte.
4. Cero motivos_deny hardcodeados en src/ (grep de los ocho = 0, como en
   R5-V). Los fixtures de test no cuentan como src/.
5. Cambios limitados a los ficheros del alcance
   (`git status --porcelain` en el reporte).

ECONOMÍA DE CPU (obligatorio)
Comandos caros: npm ci · compile* · jest (pasada completa). NUNCA sueltos:
  bash scripts/evidencia.sh vigente <etiqueta>   # 0 ⇒ NO repetir; cita la fila
  bash scripts/slot.sh run <etiqueta> -- <comando…>
  bash scripts/evidencia.sh registrar <etiqueta> PASS|FAIL [nota]
Etiquetas sugeridas: npm-ci · compile · jest-parseEditorInfo.
Las iteraciones con `--coverage=false` sobre un solo fichero de test son
baratas: no hace falta ranura para cada vuelta, sí para la pasada final.
La ranura es ÚNICA y compartida por los tres worktrees del lote.
El reporte transcribe la tabla de EVIDENCIA.md (fichero local, en
.gitignore; la evidencia perdura en el reporte).

IDENTIDAD (preflight, antes del primer commit)
El `git config` del repo trae placeholder («Your Name» / you@example.com).
  git -c user.name=worker-V -c user.email=alephscriptorium@gmail.com commit …
Verifica con `git log -1 --format='%an <%ae>'`. Commits convencionales.

FRONTERAS
- NO fusiones a main. NO tags. NO force-push.
- C:/S_LAB/z-sdk, C:/S/scriptorium/codebase/** y OASIS: SOLO LECTURA. El
  contrato se LEE; si crees que el contrato debe cambiar, eso es cola Z
  (Z-01/Z-02), no obra tuya.
- No mates el watcher (C:/S_LAB/vigilancia/v/).
- RIESGO_REVISION: independiente — WP de contrato; contrarrevisión
  obligatoria por un agente distinto.

Empieza: worktree · implementa · prueba · push · reporte.
```
