# ESTACIÓN · calibración del mundo v-sdk (Zigurat)

Instancia del consumidor. El método vive en
`@alephscript/skills-scriptorium` (>=0.11.0: skills `vigilancia` +
`estacion-viva` con contrato ONCE y liveness por lease). Esta
calibración NO va en el skill.

## Params

| param | valor |
| ----- | ----- |
| `MUNDO_RAIZ` / `WORLD_ROOT` | `C:/S_LAB/v-sdk` |
| `CANONICAL_WORLD_ROOT` | `C:/S_LAB/v-sdk` |
| `READ_ONLY_ROOTS` | `["C:/S_LAB/.worktrees","C:/S/scriptorium/codebase"]` |
| `DOWNSTREAM_PATTERNS` | `[".worktrees/*","codebase/*"]` |
| `WORKTREE_BASE` | `C:/S_LAB/.worktrees/v` |
| `OUT_DIR` | `C:/S_LAB/vigilancia/v` |
| `INTERVAL` | `45` |
| `SIBLING_ROOT` | *(no calibrado — un solo root V; sin territorio hermano)* |
| `GAME_MCP` | `<pendiente>` — estación vigía-V no usa juego; boot fases 1–4+7 |
| `BITACORA` | `<pendiente>` — no hay `bitacora/` en WORLD_ROOT ni OUT_DIR |

### Identidad (fail-closed · skill `vigilancia`)

Origen de los valores (no inventados):

- `CANONICAL_WORLD_ROOT` = mismo checkout de obra que `WORLD_ROOT`
  (patrón Z en briefs U168–U171; `plan/BACKLOG.md` · FS taller).
- `READ_ONLY_ROOTS`: base de worktrees del taller
  (`C:/S_LAB/.worktrees`, existe) + atlas de gitlinks
  (`C:/S/scriptorium/codebase`, existe; MAPA-TALLER / veto obra en
  `codebase/v-sdk`). **No** se lista `…/codebase/v-sdk` aún: el path
  no existe (atlas sin gitlink V; WP-V11 / DA-S11).
- `DOWNSTREAM_PATTERNS`: `.worktrees/*` (precedente Z) + `codebase/*`
  (segmentos del atlas RO). Listas vacías `[]` serían calibración
  explícita «sin raíces»; aquí hay raíces reales → arrays no vacíos.

Preflight:

```bash
WORLD_ROOT=C:/S_LAB/v-sdk \
CANONICAL_WORLD_ROOT=C:/S_LAB/v-sdk \
READ_ONLY_ROOTS='["C:/S_LAB/.worktrees","C:/S/scriptorium/codebase"]' \
DOWNSTREAM_PATTERNS='[".worktrees/*","codebase/*"]' \
node .claude/skills/vigilancia/scripts/verificar-identidad-raiz.mjs
```

Tras WP-V01 el detector debe dar **identidad-raiz: PASS** (git
toplevel = WORLD_ROOT). Si vuelve a LOCK, no hay despacho. Calibración
de params ≠ omitir el preflight.

## Espejo de skills

Tras el primer `npm install` del carril: dependencia
`@alephscript/skills-scriptorium` rango `>=0.11.0 <1.0.0` (registry
`https://npm.scriptorium.escrivivir.co`) + `npm run skills:sync` →
`.claude/skills/` (política de espejo: decidir trackeado vs gitignore
en R1-V; precedente DA-S19 del taller: solo el carril canon va
gitignore).

## Watcher

```text
# One-shot (pulso; el contrato ONCE 0.11.0 SIEMPRE refresca pulso.txt)
WORLD_ROOT=C:/S_LAB/v-sdk OUT_DIR=C:/S_LAB/vigilancia/v ONCE=1 \
  bash .claude/skills/estacion-viva/scripts/watcher-sesion.sh

# Sesión (liveness por lease en watch.log; PID = pista secundaria)
WORLD_ROOT=C:/S_LAB/v-sdk OUT_DIR=C:/S_LAB/vigilancia/v INTERVAL=45 \
  bash .claude/skills/estacion-viva/scripts/watcher-sesion.sh

# Vigilancia canónica (exige identidad PASS; no arrancar en pre-git)
WORLD_ROOT=C:/S_LAB/v-sdk CANONICAL_WORLD_ROOT=C:/S_LAB/v-sdk \
READ_ONLY_ROOTS='["C:/S_LAB/.worktrees","C:/S/scriptorium/codebase"]' \
DOWNSTREAM_PATTERNS='[".worktrees/*","codebase/*"]' \
OUT_DIR=C:/S_LAB/vigilancia/v INTERVAL=45 \
  bash .claude/skills/vigilancia/scripts/watcher.sh
```

## Gates

Serie `Rn-V` (vigía del carril V). Sin PASS no hay 🔶. Cadencia por
ola: R1-V fundación · R2-V checkpoint v0 · R3-V desacople · R4-V
contrato · R5-V «lista para probar» (dispara el tick de validación
del vigía-S, asentado en el plan de S) · R6-V corte Ola F (sin R6-V
no hay re-release; tick público del vigía-S = DEFERRED, DV-14).

## Dos registros de nombre (precedente DV-16)

Cara al usuario: **Aleph-0** (símbolo **ℵ₀**; nunca «Aleph 0»,
«Aleph0», «A0»). **Zigurat** es registro interno: carril, `plan/`,
briefs, reportes, identificadores y rutas de código. Alcance de la
revisión: lo que viaja en el `.vsix` + notas de release; `plan/`,
estación y cantera quedan fuera por construcción. NO entra en el
vocabulario de la prueba de ceguera — incumplimiento = observación,
no devolución ni fallo de gate. Profundidad: DV-16.a opción (b)
dentro de WP-V15 (extension-id `scriptorium.aleph-0`, claves
`aleph0.*`; identificadores de código no se renombran).
