# BRIEF · WP-V13 · Poda

```text
(rol) .claude/skills/swarm-orquestacion/reference/roles/WORKER.md

WP: WP-V13 · Poda (Ola F · CORTE)
Rama: wp/v13-poda
Worktree: C:/S_LAB/.worktrees/v/v-sdk-wp-v13
Reporte: plan/REPORTES/WP-V13-poda.md (incluye el ACTA)
Dep: censo WP-V12 fusionado en main. Secuencia del lote 2: V13 → V14 →
V15 (los tres tocan package.json; no van en paralelo).

Lecturas:
- plan/CENSO-V12.md (fusionado · fuente ÚNICA de qué se poda)
- plan/DECISIONES.md · DV-11 y DV-12 (CERRADAS: poda ahora, re-lore a
  wishlist · tag de archivo + git rm con acta)
- plan/REPORTES/WP-V12-censo-veredicto.md

QUÉ ES ESTO
Ejecutar la amputación que el censo decidió. V12 decidió; tú ejecutas.
Solo filas con veredicto «poda». Las «re-contenido» NO son tuyas (V14/V15
o wishlist). Si una fila te parece mal decidida, NO la re-decidas: anótala
en el reporte como discrepancia y sáltala.

FORMA (DV-12, no negociable)
1. ANTES de borrar nada: tag de archivo en tu rama
     git tag archive/pre-poda-ola-f
   (el tag viaja al fusionar; nada se pierde del historial).
2. `git rm` (o `git rm -r`) por fila del censo — nunca rm de FS a secas.
3. ACTA en el reporte: una línea por entrada retirada → fila del censo
   que la ampara + comando ejecutado. Borrado sin fila de censo = FAIL.
4. `coverage/` (trackeado Y gitignorado): ejecuta lo que el censo haya
   decidido para él (destrackear con `git rm -r --cached` si el veredicto
   es ese). Ídem `.claude/` según su fila.

CA DE CIERRE
1. Cero entradas «poda» del censo vivas en el árbol (comprobación en el
   reporte: lista censo-poda vs `git ls-files`).
2. Acta completa: cada rm con su fila de censo.
3. Probes V07/V08/V09 siguen PASS y `compile` verde — por ranura:
     bash scripts/evidencia.sh vigente <etiqueta>  (0 ⇒ cita, no repitas)
     bash scripts/slot.sh run <etiqueta> -- <comando…>
     bash scripts/evidencia.sh registrar <etiqueta> PASS|FAIL
4. El paquete arranca igual: `vsce package` por ranura + smoke de
   activación si es barato; si no lo es, declara ⏳ honesto con motivo.
5. Cero cambios fuera del alcance de la poda + reporte
   (`git status --porcelain` al reporte).

IDENTIDAD (preflight, antes del primer commit)
El `git config` local del repo ya está fijado (worker-V). Verifica con
`git log -1 --format='%an <%ae>'` tras tu primer commit; cero placeholders.

FRONTERAS
- NO fusiones a main. NO force-push. NO reescribas historia (el tag de
  archivo es aditivo).
- C:/S_LAB/z-sdk, C:/S/scriptorium/codebase/** y espejo OASIS: SOLO
  LECTURA.
- NO toques marca (V14) ni espacios de nombres (V15).
- RIESGO_REVISION: independiente (amputación del árbol).

Termina: commits en tu rama (obra y reporte separados) ·
VEREDICTO_REVISOR: ⏳ pendiente. NO pushees.
```
