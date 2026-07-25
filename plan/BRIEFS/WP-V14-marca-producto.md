# BRIEF · WP-V14 · Marca del producto

```text
(rol) .claude/skills/swarm-orquestacion/reference/roles/WORKER.md

WP: WP-V14 · Marca del producto (Ola F · CORTE)
Rama: wp/v14-marca-producto
Worktree: C:/S_LAB/.worktrees/v/v-sdk-wp-v14
Reporte: plan/REPORTES/WP-V14-marca-producto.md
Dep: V13 fusionado. Secuencia del lote 2: V13 → V14 → V15 (los tres
tocan package.json; no van en paralelo).

Lecturas:
- plan/DECISIONES.md · DV-16 (CERRADA) y DV-16.a (CERRADA en (b), pero
  su ejecución es de V15 — NO tuya)
- plan/ESTACION.md · «Dos registros de nombre»
- plan/CENSO-V12.md (qué quedó tras la poda)

QUÉ ES ESTO
La cara de usuario. Quien instala el paquete lee **Aleph-0** (símbolo
ℵ₀; nunca «Aleph 0», «Aleph0», «A0») y no lee «Arrakis Theater» ni
«Zigurat» en NINGUNA superficie de usuario: displayName, description,
barra de actividad (título + icono), `configuration.title`, títulos y
categorías de comandos/vistas/paneles, README que viaja en el paquete,
CHANGELOG de release si existe.

QUÉ NO ES
- NO renombras extension-id, claves de settings ni prefijos de comandos
  (`alephscript.*` sigue igual): eso es V15 y va DESPUÉS.
- NO tocas identificadores de código.
- `plan/`, briefs, reportes y estación quedan fuera por construcción
  (DV-16): «Zigurat» ahí es legal.

CA DE CIERRE
1. grep -riE "arrakis|zigurat" sobre LO QUE VIAJA EN EL PAQUETE
   (respeta .vscodeignore: package.json campos de display, README
   incluido, media/, dist/ excluido por derivado) = 0 en superficies de
   usuario. Los IDs internos que aún digan zigurat (hasta V15) se listan
   como excepciones declaradas, no cuentan como fallo (DV-16 =
   observación, no gate), pero se enumeran.
2. grep -E "Aleph ?0|Aleph0|A0\b" en esas superficies = 0 (la forma
   canónica es Aleph-0 / ℵ₀).
3. Icono de barra de actividad presente y referenciado.
4. `compile` verde por ranura (slot.sh + evidencia.sh; vigente antes de
   repetir).
5. `git status --porcelain` limpio al cierre fuera de tu alcance.

IDENTIDAD · FRONTERAS · ECONOMÍA
Como todo el carril: config local worker-V ya fijada (verifica);
comandos caros solo por ranura; NO fusiones, NO push, NO tags de
release; z-sdk/atlas/OASIS solo lectura. Revisión ordinaria (no
requiere contrarrevisor independiente; DV-16 es guía, no gate).

Termina: commits en tu rama · VEREDICTO_REVISOR: ⏳ pendiente. NO pushees.
```
