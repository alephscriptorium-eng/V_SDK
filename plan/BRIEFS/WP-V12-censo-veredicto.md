# BRIEF · WP-V12 · Censo y veredicto

```text
(rol) .claude/skills/swarm-orquestacion/reference/roles/WORKER.md

WP: WP-V12 · Censo y veredicto (Ola F · CORTE)
Rama: wp/v12-censo-veredicto
Worktree: C:/S_LAB/.worktrees/v/v-sdk-wp-v12
Reporte: plan/REPORTES/WP-V12-censo-veredicto.md
Entregable: plan/CENSO-V12.md
Lote: V12 ∥ V16 ∥ V17 (independientes · ficheros en alcance disjuntos)

Lecturas:
- plan/BACKLOG.md · Ola F · WP-V12
- plan/DECISIONES.md · DV-11, DV-12, DV-16 (ABIERTAS: no las cierres)
- C:/S/vigilancia/REPLAN-V-ciudad-zigurat.md §2 (tabla carcasa→contenido)
  y §9 (C2 y C3 corrigen el propio replan: verifica, no copies)
- C:/S/vigilancia/HANDOFF-S-COLA-LIMPIEZA-post-R5V.md · V-00 y ola L3
- C:/S/vigilancia/REVISION-S-WP-V10-v1.md · §2.4, §4

QUÉ ES ESTO
El censo de lo que WP-V02 absorbió del legado, con veredicto por entrada.
Es el documento que la decisión D-1 del custodio exige antes de podar nada.
V12 DECIDE; V13 ejecuta. **V12 NO BORRA NADA.**

ALCANCE — ficheros que puedes escribir (y ningún otro):
- plan/CENSO-V12.md            (nuevo · el entregable)
- plan/REPORTES/WP-V12-censo-veredicto.md
Todo lo demás del repo es SOLO LECTURA en este WP. En particular: cero
escrituras en src/, tests/, package.json, .github/, scripts/, docs/.
Al terminar, `git status --porcelain` solo puede mostrar esos dos ficheros.

FORMA DEL CENSO
Dos tablas. Una fila por entrada, sin excepción:

  Tabla A · entradas de primer nivel del repo
    fuente: git ls-tree --name-only HEAD
    (en d0323fb son 40 — cuéntalas tú; el número es control, no respuesta)

  Tabla B · módulos de src/
    fuente: git ls-tree --name-only HEAD src/
    (en d0323fb son 28 — ídem)

  Columnas: entrada | veredicto | motivo | fuente | ¿viaja en el .vsix?
    veredicto ∈ { queda · re-contenido · poda }
    motivo    = por qué, en una frase, referido a algo comprobable
    fuente    = fila de §2 del replan, o «disco» si es hallazgo tuyo
    .vsix     = sí / no, leído de .vscodeignore (columna informativa para
                V13/V14; no forma parte de la CA)

LA TABLA §2 DEL REPLAN ES PUNTO DE PARTIDA, NO RESPUESTA
Cada fila se verifica contra el disco. Añade una sección
«Lo que el disco desmiente» con toda divergencia entre §2 y lo que hay.
El replan ya se desmintió a sí mismo dos veces (§9·C2 y §9·C3): se espera
que encuentres más. Pistas verificadas por el orquestador al abrir el WP:
- `coverage/` está en .gitignore Y trackeado en HEAD (entró antes del
  ignore). El censo debe decir qué se hace con eso.
- `.claude/` está versionado por accidente (entró en la fusión de V09);
  hay deuda declarada al respecto (cola S · V-L4-08).
- `README-LEGACY-EXTENSION.md`, `INSTALL.md`, `schemas/`, `media/`,
  `fixtures/`, `examples/` no aparecen en §2: son filas que tienes que
  resolver tú.

DECISIONES ABIERTAS — NO LAS CIERRES
Las cierra el custodio. Si una fila depende de una:
- chatParticipants heredados (fila 19 de §2) → «poda (pend. DV-11)»
- forma de la poda: borrar vs archivar en tag → afecta a V13, no a tu
  veredicto; dilo en el motivo si cambia algo → «(pend. DV-12)»
- marca y nombres → DV-16 / DV-16.a; V14 y V15 los ejecutan, tú solo
  marcas «re-contenido» donde toque
Una fila «pend. DV-nn» NO cuenta como `<pendiente>`: tiene veredicto
propuesto y bloqueo nombrado. Un `<pendiente>` a secas es un fallo de CA.

CA DE CIERRE (verificable)
1. Una fila por cada entrada de la Tabla A y de la Tabla B, sin huecos:
   el reporte muestra el recuento de `git ls-tree` y el recuento de filas,
   y coinciden.
2. Cero `<pendiente>` en plan/CENSO-V12.md (grep = 0).
3. Cada fila lleva veredicto ∈ {queda, re-contenido, poda} y motivo.
4. Sección «Lo que el disco desmiente» presente (aunque sea para decir
   que no hay divergencias, con la comprobación que lo respalda).
5. Cero borrados y cero cambios fuera de los dos ficheros del alcance
   (`git status --porcelain` en el reporte).

ECONOMÍA DE CPU
Este WP NO necesita ni un solo comando caro: es lectura y juicio.
Cero `npm ci`, cero compile, cero test, cero vsce package. Si crees que
necesitas compilar para censar, no lo necesitas.
Si aun así aparece uno inevitable, va por la ranura y se registra:
  bash scripts/evidencia.sh vigente <etiqueta>   # 0 ⇒ NO repetir; cita
  bash scripts/slot.sh run <etiqueta> -- <comando…>
  bash scripts/evidencia.sh registrar <etiqueta> PASS|FAIL [nota]
y el reporte explica por qué era inevitable.

IDENTIDAD (preflight, antes del primer commit)
El `git config` del repo trae placeholder («Your Name» / you@example.com).
Commitea con identidad explícita, como el resto del carril:
  git -c user.name=worker-V -c user.email=alephscriptorium@gmail.com commit …
Verifica con `git log -1 --format='%an <%ae>'` antes de seguir.
Commits convencionales. Cero autores placeholder.

FRONTERAS
- NO fusiones a main. NO tags. NO force-push. NO reescribas historia.
- C:/S_LAB/z-sdk, C:/S/scriptorium/codebase/** y el espejo OASIS: SOLO
  LECTURA.
- No mates el watcher (C:/S_LAB/vigilancia/v/). Está vivo a propósito.
- RIESGO_REVISION: independiente — este censo gobierna una amputación;
  lo contrarrevisa un agente distinto del que lo escribe.

Empieza: worktree · censa contra el disco · escribe · push · reporte.
```
