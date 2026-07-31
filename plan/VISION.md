# VISIÓN — carril V · Aleph-0 (ℵ₀)

| dato | valor |
| ---- | ----- |
| Mundo | `v-sdk` — el **Zigurat**: el IDE desde el que se opera la Ciudad |
| Entregable de | **WP-V81** · Fundación del plan |
| Papel | mitad del **contrato local único** del carril (la otra mitad: `plan/PRACTICAS.md`) — el backlog apunta aquí, no duplica |
| Norma de precedencia | si otro documento del carril contradice a este par, manda este par; cambiarlo exige decisión del custodio (`plan/DECISIONES.md`), no un WP |

---

## 1 · Qué es V dentro del producto

V es el **Zigurat**: la extensión de VS Code que hace de **IDE del
producto**. Es la cara con la que un operador humano entra a la Ciudad,
la ve entera sin que la vista mienta, la manda por contrato y edita lo
que el contrato declare editable.

Doctrina de **centro vacío**: el editor es del usuario del Scriptorium.
Todo lo de V vive en la periferia — vistas, paneles, barra de estado,
comandos. V jamás ocupa el centro del editor ni abre pestañas por
iniciativa propia.

Doctrina **INÉDITO**: nadie ha usado nunca este código; no existe
usuario que migrar ni compatibilidad que preservar (invariante I-5 en
`plan/PRACTICAS.md`).

**Realidad citable del árbol** (estado observado, no aspiración):

- Una sola extensión, no monorepo: `package.json:2` (`"name": "aleph-0"`),
  `package.json:6` (`"publisher": "scriptorium"`), fuente en `src/`.
- Superficies existentes: editores custom (`src/editors/`), vistas de
  árbol (`src/treeViews/`, `src/views/`), identidad de sala
  (`src/identity/`), catálogo (`src/launcher/`), observación de dominio
  (`src/elenco/`, `src/mutation/`, `src/resources/`).
- Bootstrap monolítico medido: `src/core/extensionBootstrap.ts`
  (2150 líneas por `wc -l`, 2026-07-31) — su troceo es obra del backlog,
  no de este documento.
- `package.json:5` aún declara `0.2.0` y `package.json:10` el repo del
  scope previo: el **corte de release** (invariante I-4) está decidido
  pero su ejecución vive en los WPs del LANE H del backlog. Este
  documento no la duplica; la registra como estado transitorio.

## 2 · Qué posee / qué consume — tabla de fronteras

Derivada de la invariante I-1 (`plan/PRACTICAS.md` §1, literal del
custodio). Cada fila declara owner; ningún cruce sin fila.

| pieza | relación de V | owner | contrato de retorno / evidencia en árbol |
| ----- | ------------- | ----- | ---------------------------------------- |
| El Zigurat (extensión VS Code de centro vacío) | **posee** | **V** | `package.json` + `src/` completos |
| Editor de configuración (la **interfaz**) | **posee solo la interfaz** | **V** (interfaz) · **O+Z** (schema y validación) | dep externa **O-c** · `src/editors/AgentConfigEditorProvider.ts`, `src/config/ziguratSettings.ts` — el schema se consume, no se inventa |
| Observación de dominio (paneles, elenco, recursos) | **posee la superficie**; las piezas observadas son ajenas | **V** (superficie) · mundos del dominio (piezas) | `src/elenco/`, `src/resources/`, `src/views/` — pieza real, no espejo |
| Estructura (playground) | **consume y verifica** | **HUB/G** | dep **G52·HUB-072** (`plan/BACKLOG.md:27-28`) |
| Puerta de entrada (rooms) | **consume** | **Z** | dep **Z-D1/U233-235** (`plan/BACKLOG.md:26-27`) · `src/identity/RoomIdentityService.ts` |
| Orquestador de arranque de barrios | **consume** | **Z** | dep **U234** (`plan/BACKLOG.md:29-30`) |
| Matriz de canal/puertas | **consume** (documento conjunto) | **Z** posee canal · V consume | dep **U236** (`plan/BACKLOG.md:30`) |
| Runtime de la Ciudad | **no posee** — consume | **Z** | sin runtime, V dice la verdad (⏳), no finge |
| Contratos (identidad, catálogo, env, import) | **no posee** — consume | cada mundo dueño | todo consumo por catálogo o puerta declarada |
| Artefacto `.vsix` y su canal de release | **posee** | **V** | canal vigente GitHub Release; Marketplace DEFERRED (invariante I-4) |
| Tratamiento de licencia | **aplica el común del producto** — no lo decide | custodio / producto | invariante I-3 · `LICENSE.md:1` (composite Animus Iocandi, pointer) |

## 3 · Qué NO es (anti-alcance explícito)

- **No es runtime**: V no orquesta procesos por su cuenta ni posee el
  ciclo de vida de la Ciudad; manda a través del orquestador de Z.
- **No posee contratos**: ni el schema del env, ni la identidad, ni el
  protocolo de rooms, ni el import de volumes. Los consume con fila
  declarada.
- **No valida schema**: en el editor de configuración V pone SOLO la
  interfaz; schema y validación son de O+Z.
- **No escribe obra ajena**: ningún WP de V toca repos, planes ni
  ficheros de otros mundos; todo cruce es dependencia externa con owner
  y contrato de retorno (invariante I-2).
- **No es cliente furtivo**: cero conectores a medida por puerto o ruta
  escrita a mano; toda conexión entra por catálogo, segunda puerta
  documentada, o queda «sin superficie» con motivo.
- **No es centro ocupado**: nada de V compite con el trabajo del usuario
  en el área central del editor.
- **No es guardián de legacy**: no preserva compatibilidades, no razona
  en términos de usuarios previos (no los hay), no arrastra la
  identidad pública antigua (invariantes I-4 e I-5).
- **No es marketplace-first**: publicar en el Marketplace de VS Code
  está DEFERRED; el canal es GitHub Release como el resto del producto.

## 4 · Criterio de acabado — la cara V del test del operador externo

V está acabado cuando un **desconocido**, en una **máquina limpia** y
**sin hablar con los autores**:

1. **Obtiene e instala** el artefacto empaquetado por el canal público
   vigente, en un VS Code cuya versión mínima está verificada, sin
   clonar el repo ni leer este plan.
2. **Abre el editor y el centro sigue vacío**: nada suyo fue ocupado;
   todo lo de V está en la periferia y se entiende sin README.
3. **Sin runtime de la Ciudad, lee la verdad**: cada superficie declara
   ⏳ o ausencia con motivo; cero errores fatales por no haber Ciudad,
   cero éxito fingido, y ni un solo ✅ heredado de la máquina de los
   autores.
4. **Con runtime, entra y opera**: entra por la puerta declarada
   (rooms, en cualquiera de sus dos modalidades), ve la Ciudad entera
   sin que la vista mienta, la manda por contrato y edita lo que el
   contrato declare editable — el env real, con schema ajeno consumido.
5. **Sale limpio**: desinstalar no deja procesos, ficheros fuera de
   ámbito ni ajustes huérfanos.

La medida de cada punto no es opinión: son los CA y gates del backlog
(`plan/BACKLOG.md`) y de `plan/GOBIERNO-EJECUCION-F2.md` — este
documento fija el criterio; aquellos, la verificación WP a WP.

---

— **V** · Aleph-0 (ℵ₀) · fundación WP-V81
