# DECISIONES — carril V

Serie **DV-nn**. Las §abiertas las resuelve el CUSTODIO; el carril no
improvisa sobre ellas (bloquean lo indicado). Origen: las 10 preguntas
del borrador de fundación, trianguladas por el vigía-S con el gobierno
del taller (2026-07-26). Cada una lleva propuesta por defecto — un
tick del custodio la cierra tal cual, o la enmienda.

Asiento custodio 2026-07-25 (canal vigía-V · OUT_DIR
`C:/S_LAB/vigilancia/v/PRESET-GO-CARRIL-V.md`).

## Abiertas

Serie **DV-11..DV-16**, abierta por el replan de la Ola F
(`C:/S/vigilancia/REPLAN-V-ciudad-zigurat.md` §6 y §8), transcrita por el
orquestador-V el 2026-07-25. **Todas abiertas: las cierra el custodio.**
Cada una trae la propuesta por defecto del replan — un tick la cierra tal
cual, o la enmienda. El carril **no las da por ticadas** por traer
propuesta: lo que dependa de ellas queda ⬜.

- ⬜ **DV-11 · Participantes de chat heredados** *(bloquea WP-V13; el
  censo de WP-V12 lo deja marcado, no resuelto)* — los 6
  `chatParticipants` del legado (fila 19 de §2 del replan): ¿**poda** o
  **re-lore** con personajes reales del reparto (reparto-kit)?
  *Propuesta por defecto (§6):* **poda ahora, re-lore a la wishlist.**
- ⬜ **DV-12 · Forma de la poda** *(bloquea WP-V13)* — ¿la poda **borra
  del árbol** o **archiva** en rama/tag antes de borrar? Sin esto, V13 no
  tiene criterio para «cero borrados sin acta».
  *Propuesta por defecto (§6):* **tag de archivo + `git rm` con acta.**
- ⬜ **DV-13 · Alcance del re-release** *(orienta dónde para el swarm)* —
  ¿re-release tras la **Ola F** (mínimo honesto) o tras la **Ola K**
  (producto)? *(el replan dice «tras ola A / tras ola F» en sus propias
  letras; con el renombrado de §4 son **F** y **K**).*
  *Propuesta por defecto (§6):* **re-release tras F y otro tras K.**
- ⬜ **DV-14 · Enmienda de DV-06** *(bloquea WP-V11)* — DV-06 cerró
  «bump del atlas SOLO tras `.vsix` v1 validada por el vigía-S», y el
  custodio ha resuelto **no ejecutar el tick**
  (`HANDOFF-S-COLA-LIMPIEZA-post-R5V.md`, D-8): la condición no se cumple
  nunca y `v-sdk` no entra en el atlas. ¿Qué desbloquea WP-V11 en su
  lugar? *Propuesta por defecto (§6):* **R6-V PASS + acta de
  re-release.**
- ⬜ **DV-15 · Techo de concurrencia del swarm** — ¿cuántos workers a la
  vez? Sin techo hay riesgo de colisión de worktrees y de saturar la
  máquina. *Propuesta por defecto (§6):* **tres workers.** Nota del
  orquestador: el techo de **procesos caros** simultáneos es cosa
  distinta y ya está serializado a 1 por `scripts/slot.sh` (`SLOT_MAX`);
  DV-15 decide cuántos **workers** trabajan en paralelo, no cuántos
  compilan a la vez.
- ⬜ **DV-16 · Dos registros de nombre: el usuario ve Aleph-0** *(no
  bloquea; guía de revisión)* — petición del custodio 2026-07-25 (§8):
  cara al usuario **Aleph-0** (símbolo **ℵ₀**; nunca «Aleph 0»,
  «Aleph0», «A0»); **Zigurat** es registro **interno** (carril, `plan/`,
  briefs, reportes, identificadores y rutas de código). Alcance de la
  revisión: **lo que viaja en el `.vsix` + las notas de release**; todo
  `plan/`, estación y cantera quedan **fuera por construcción**. **NO
  entra en el vocabulario prohibido de la prueba de ceguera**: el
  incumplimiento es **observación**, no devolución ni fallo de gate.
  *Propuesta por defecto (§8):* **asentar el precedente y declararlo en
  `plan/ESTACION.md`.**
- ⬜ **DV-16.a · Profundidad del renombrado** *(bloquea WP-V15)* —
  **(a)** solo capa de presentación: `extension-id` sigue
  `scriptorium.zigurat` y las claves siguen `zigurat.*`; barato, pero la
  palabra se filtra a quien abra `settings.json`. **(b)** coherencia
  completa: `extension-id → scriptorium.aleph-0`, claves → `aleph0.*`;
  rompe la v0.1.0 publicada y exige migración de ajustes. Los
  **identificadores de código NO se renombran** en ninguno de los dos
  caminos. *Propuesta por defecto (§8):* **(b), dentro de WP-V15** —
  motivo: la v0.1.0 tiene 0 descargas, el coste del renombrado es cero
  hoy y distinto de cero para siempre después. *Secuencia obligada:* el
  renombrado de claves va **dentro de V15**, nunca antes (durante V15
  aún conviven ~113 comandos `alephscript.*`). *Efecto colateral (§9·C5):*
  si sale (b), la **CA de WP-V05** se re-verifica con las claves nuevas
  y el reporte de V15 lo declara.

### Pendiente de ratificación (no es decisión de carril)

- **¿La conexión portal ↔ IDE es intencional?** — `Aleph-0` no es nombre
  nuevo: el portal publicado ya lleva `stamp: ℵ₀` con
  `issue: NÚMERO 0 · 2026`
  (`plan/SPRINTS/PORTAL-NUMERO-0/INFORME-VIGIA-R13-S.md:24`, carril S).
  §8 lo deja «a ratificación del custodio: intencional o coincidencia
  feliz». No bloquea nada; se anota para que nadie lo dé por supuesto.

## Cerradas

- **DV-00 · Fundación del carril** — GO custodio 2026-07-26 (orden al
  vigía-S: plan mascado + carpetas + handoff). Meta: `.vsix` lista
  para probar; validación final = tick del vigía-S asentado en el
  plan de S.
- **DV-04 · Gitlink de a-sdk** *(no bloquea v1)* — ✅ tick custodio
  2026-07-25 opción **(1) / a) plan**: convivencia temporal + README
  «moved to V_SDK» en a-sdk; ejecución **carril A** (frontera). Carril
  V no toca a-sdk ni añade gitlink a-sdk en v-sdk. Ver
  `C:/S_LAB/vigilancia/v/DV-04-EXPLICACION.md`.
- **DV-01 · Org/nombre del repo** *(bloqueaba WP-V01)* — ✅ tick:
  `alephscriptorium-eng/V_SDK` + FS `v-sdk`.
- **DV-02 · Misión de la letra V** — ✅ tick: «V · Zigurat: host IDE
  de la ciudad — consumidor opt-in del contrato Z».
- **DV-03 · Historial del import** *(bloqueaba WP-V02)* — ✅ tick:
  preservar historial de `integration/beta/scriptorium` en `main` +
  tag `import/scriptorium-<sha>`.
- **DV-05 · Publisher del .vsix** *(bloquea WP-V10)* — ✅ enmienda
  custodio «scriptorium v-sdk»: valor canónico asentado
  `publisher = "scriptorium"` (token VSCE); extension-id
  `scriptorium.<name>` (`<name>` en WP-V10; candidatos `zigurat` |
  `v-sdk`). Org GitHub = DV-01 (distinto del campo publisher).
  Descartada la propuesta «publisher = alephscriptorium-eng».
- **DV-06 · Timing del bump atlas (DA-S11)** *(bloquea WP-V11)* — ✅
  tick: SOLO tras `.vsix` v1 validada por el vigía-S.
- **DV-07 · Runtime Z para smokes** — ✅ tick: smoke local contra
  `C:\S_LAB\z-sdk` basta para v0 y v1.
- **DV-08 · Alcance del primer GO Release** — ✅ tick: v0 =
  checkpoint interno; GO Release = v1.
- **DV-09 · Secrets/ops** — ✅ tick modo «como en los otros
  paquetes»: nombres exactos `NPM_USERNAME` + `NPM_PASSWORD`
  (alternativa `NPM_TOKEN` solo si el workflow del repo lo espera);
  sembrar cuando exista el remoto. PAT GitHub Release cuando toque
  WP-V10. El carril documenta QUÉ necesita, no los custodia.
- **DV-10 · Marketplace (VS Marketplace / Open VSX)** — ✅ tick +
  **GO-marketplace = deferred** (fuera de este sprint; no en Olas
  A–D ni Release v1).
