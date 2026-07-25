# BRIEF · WP-V15 · Espacios de nombres

```text
(rol) .claude/skills/swarm-orquestacion/reference/roles/WORKER.md

WP: WP-V15 · Espacios de nombres (Ola F · CORTE)
Rama: wp/v15-espacios-nombres
Worktree: C:/S_LAB/.worktrees/v/v-sdk-wp-v15
Reporte: plan/REPORTES/WP-V15-espacios-nombres.md
Dep: V14 fusionado. Cierra la secuencia V13 → V14 → V15.

Lecturas:
- plan/DECISIONES.md · DV-16.a (CERRADA en (b): ejecución AQUÍ)
- plan/BRIEFS/WP-V05-config-unica.md + plan/REPORTES/WP-V05-config-unica.md
  (la CA que re-verificas)
- plan/CENSO-V12.md (qué sobrevive y con qué nombre)

QUÉ ES ESTO — DV-16.a opción (b), coherencia completa
1. extension-id → `scriptorium.aleph-0` (`publisher` ya es
   `scriptorium`, DV-05; `name` pasa a `aleph-0`).
2. Claves de settings `zigurat.*` → `aleph0.*` — TODAS: schema en
   `contributes.configuration` + cada lectura en src/
   (`getConfiguration('zigurat')` etc.). Cero claves viejas vivas.
3. Prefijo único en `contributes.commands`: los ~113 comandos
   `alephscript.*` (y cualquier otro prefijo superviviente) → un solo
   prefijo canónico `aleph0.` — salvo excepciones DECLARADAS (p. ej.
   comandos que VS Code exige con nombre fijo). Cada excepción, listada
   con motivo.
4. Lo heredado que se queda con nombre viejo: declarado en el reporte
   (tabla «heredado declarado»).
5. Identificadores de CÓDIGO (clases, ficheros, variables) NO se
   renombran (DV-16.a, ambos caminos).

RE-VERIFICACIÓN CA DE WP-V05 (§9·C5 — obligatoria, en tu reporte)
Con las claves nuevas: grep de rutas absolutas de máquina y puertos
hardcodeados fuera de defaults de schema = 0 · la extensión arranca con
settings vacíos mostrando ⏳ honesto. Declara ambas comprobaciones con
su salida.

CA DE CIERRE
1. `contributes.commands` con prefijo único salvo excepciones declaradas
   (conteo en el reporte: total, canónicos, excepciones).
2. grep de claves viejas (`"zigurat\.` y `getConfiguration('zigurat'`,
   y variantes) en package.json + src/ = 0.
3. extension-id `scriptorium.aleph-0`; el nombre del `.vsix` sale
   derivado (fix de V16): `vsce package` por ranura produce
   `aleph-0-<version>.vsix` sin literal de versión a mano.
4. CA de V05 re-verificada y declarada (arriba).
5. `compile` + `jest` (unit) verdes por ranura; `git status` limpio.
6. Nota de migración de ajustes en el README que viaja (una tabla
   clave vieja → clave nueva; la v0.1.0 tiene 0 descargas pero la
   honestidad es gratis).

IDENTIDAD · FRONTERAS · ECONOMÍA
Config local worker-V fijada (verifica). Comandos caros solo por
ranura (slot.sh / evidencia.sh, vigente antes de repetir). NO fusiones,
NO push, NO tags. z-sdk/atlas/OASIS solo lectura.
RIESGO_REVISION: independiente (config/empaquetado — contrarrevisión
por agente distinto antes de aceptar).

Termina: commits en tu rama (obra / reporte) · VEREDICTO_REVISOR: ⏳
pendiente. NO pushees.
```
