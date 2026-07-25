# DECISIONES — carril V

Serie **DV-nn**. Las §abiertas las resuelve el CUSTODIO; el carril no
improvisa sobre ellas (bloquean lo indicado). Origen: las 10 preguntas
del borrador de fundación, trianguladas por el vigía-S con el gobierno
del taller (2026-07-26). Cada una lleva propuesta por defecto — un
tick del custodio la cierra tal cual, o la enmienda.

Asiento custodio 2026-07-25 (canal vigía-V · OUT_DIR
`C:/S_LAB/vigilancia/v/PRESET-GO-CARRIL-V.md`).

## Abiertas

_(vacío — la serie DV-11..DV-16.a se cerró en bloque el 2026-07-25;
ver «Cerradas». El replan de la Ola F queda copiado en
`C:/S_LAB/vigilancia/v/REPLAN-V-ciudad-zigurat.md`.)_

### Pendiente de ratificación (no es decisión de carril)

- **¿La conexión portal ↔ IDE es intencional?** — `Aleph-0` no es nombre
  nuevo: el portal publicado ya lleva `stamp: ℵ₀` con
  `issue: NÚMERO 0 · 2026`
  (`plan/SPRINTS/PORTAL-NUMERO-0/INFORME-VIGIA-R13-S.md:24`, carril S).
  §8 lo deja «a ratificación del custodio: intencional o coincidencia
  feliz». No bloquea nada; se anota para que nadie lo dé por supuesto.

## Cerradas

- **DV-11..DV-16.a · CERRADAS EN BLOQUE** — GO custodio 2026-07-25
  (sesión debug; ventana vigilante-S con gorro de operador V, relevo
  `C:/S_LAB/vigilancia/v/RELEVO-GORRO-2026-07-25-debug.md`). Las seis
  con su **propuesta por defecto**; DV-14 con matiz deferred:
  - **DV-11** ✅ poda ahora; re-lore de los 6 `chatParticipants` a la
    wishlist.
  - **DV-12** ✅ tag de archivo + `git rm` con acta.
  - **DV-13** ✅ re-release tras Ola F y otro tras Ola K.
  - **DV-14** ✅ WP-V11 desbloquea con **R6-V PASS + acta de
    re-release** (enmienda DV-06). Además, el tick de validación del
    vigía-S pasa a **DEFERRED reencolado en el plan de S**: la guía de
    prueba se ejecuta contra el `.vsix` LOCAL del re-release; la
    equivalencia con el asset público queda diferida (anomalía
    ARTEFACTO-NO-EQUIVALENTE heredada, no re-verificada ahora).
  - **DV-15** ✅ techo **tres workers** (procesos caros ya
    serializados a 1 por `slot.sh`).
  - **DV-16** ✅ precedente Aleph-0/ℵ₀ asentado; declarado en
    `plan/ESTACION.md` (observación, no gate).
  - **DV-16.a** ✅ opción **(b)** dentro de WP-V15: extension-id →
    `scriptorium.aleph-0`, claves → `aleph0.*`; identificadores de
    código no se renombran; la CA de WP-V05 se re-verifica con las
    claves nuevas y el reporte de V15 lo declara.
- **Desviaciones fase-1 del orquestador · RATIFICADAS** — las 4
  declaradas en `C:/S_LAB/vigilancia/v/PARTE-ORQ-fase1.md` (ramas
  desde `1c90c43` y no `d0323fb` · 3 commits locales en main sin push ·
  `.gitattributes` LF forzado · `EVIDENCIA.md` gitignorado con tabla
  transcrita al reporte): GO custodio 2026-07-25, mismo asiento.
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
