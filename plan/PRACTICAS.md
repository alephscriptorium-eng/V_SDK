# PRÁCTICAS — carril V · Aleph-0 (ℵ₀)

| dato | valor |
| ---- | ----- |
| Entregable de | **WP-V81** · Fundación del plan |
| Papel | mitad del **contrato local único** del carril (la otra mitad: `plan/VISION.md`) — invariantes, ejes de CA, política de riesgo y reglas de evidencia viven **aquí, fuera del backlog**; el backlog apunta, no duplica |
| Método | `swarm-orquestacion` (`.claude/skills/swarm-orquestacion/`) — este documento **calibra** el método al mundo, no lo redefine |
| Norma de precedencia | igual que `plan/VISION.md`: cambiar este par exige decisión del custodio (`plan/DECISIONES.md`), no un WP |

---

## 1 · Invariantes normativas (decisiones del custodio — literales)

Cinco cláusulas ya decididas por el custodio del proyecto. Se incorporan
**literales**; ningún WP, brief ni revisión las reinterpreta. Enmendarlas
es acto del custodio, no de este carril.

### I-1 · Ownership de V

> Ownership de V: el Zigurat (extensión VS Code de centro vacío / IDE
> del producto), el editor de configuración (el schema y la validación
> son de otros mundos: O+Z — V pone SOLO la interfaz), y la observación
> de dominio. V CONSUME la estructura (del HUB/G) y la puerta de entrada
> (rooms, del mundo Z); V no posee runtime ni contratos.

### I-2 · Frontera

> Frontera: ningún plan escribe obra ajena; todo cruce es dependencia
> externa con owner y contrato de retorno.

### I-3 · Licencia

> Licencia: todos los paquetes del producto hacen EL MISMO tratamiento
> de licencia; AIPLv1 = composite GPL-3.0-or-later + Animus Iocandi.
> (La ejecución del acta de licencia es otro WP; aquí queda como
> invariante.)

### I-4 · Release

> Release: corte con el histórico — el scope antiguo
> «alephscriptorium/aleph-scriptorium» muere; identidad pública nueva,
> muy Scriptorium, ligada al scope nuevo (github nuevo + registry npm
> nuevo + dominio v-sdk.escrivivir.co); contadores de versión
> REINICIADOS (el semver de la primera release lo fija el custodio); la
> Release pública v0.1.0 antigua se desconecta y depreca; publicar en el
> Marketplace de VS Code queda DEFERRED (canal vigente: GitHub Release,
> como el resto de paquetes del producto).

### I-5 · Lenguaje INÉDITO

> Lenguaje INÉDITO: nadie ha usado nunca este código; prohibido
> preservar compatibilidades o razonar en términos de legacy.

## 2 · Invariantes de trabajo del carril (asentadas aquí, fuera del backlog)

Valen para **todos** los lanes y WPs; el backlog las referencia, no las
alberga.

1. **No mentir**: ⏳ visible; nada inferido; la ausencia de runtime se
   declara, no se disimula ni se convierte en error fatal.
2. **Ámbitos, no cadenas de mando**: ninguna vista ni estructura sugiere
   que «arriba manda»; zonas que solapan se dibujan como lo que son.
3. **Toda conexión con fila declarada**: catálogo, segunda puerta
   documentada, o «sin superficie» con motivo. Cero clientes a medida
   furtivos.
4. **Cerco v2** (local-first): peers del contrato sí; anclas externas
   vivas no — referencia externa = sidecar inerte.
5. **Centro vacío / estructura antes que interfaz**: ninguna UI antes de
   que la estructura que la sostiene exista con evidencia; nada de V
   ocupa el centro del editor.
6. **Un WP = un worker = una rama** (= un worktree si hay paralelo);
   solo el orquestador escribe en `plan/BACKLOG.md`; el custodio cierra
   decisiones abiertas.

## 3 · Ejes de criterios de aceptación por tipo de WP

Calibración local de los ejes del método
(`.claude/skills/swarm-orquestacion/reference/ejes-ca.md`). El BRIEF
declara qué tipos activa el WP (puede activar varios); el worker los
evidencia; la revisión los verifica.

| tipo de WP (V) | qué cubre | CA mínimos obligatorios |
| -------------- | --------- | ----------------------- |
| **funcional** | una superficie, comando o panel hace algo | comportamiento demostrado contra la **pieza real**, no un espejo · vacío/ausencia honestos (sin runtime: ⏳, no error fatal ni éxito fingido) · cero comandos/menús que prometan lo que no hacen |
| **estructural** | troceo, demolición, re-layout, espacios de nombres | destino canónico de **cada símbolo vivo** (eje II) · gate de dedup: grep del símbolo → **una sola definición** (eje III) · si el WP declara «cero cambio observable», se prueba, no se afirma · compile y tests verdes |
| **frontera** | todo cruce con pieza de owner ajeno | owner citado por fila y **contrato de retorno** declarado (I-2) · cero escritura en obra ajena · consumo por catálogo/puerta declarada, jamás endpoint escrito a mano · si es **frontera de confianza**: hostil-omite (ver §4) · si es contrato compartido: **segundo cliente independiente** como gate (eje IV) |
| **producto** | empaquetado, instalación, release, plataforma | CA contra el **artefacto real empaquetado**, no contra el fuente (inspección del paquete en el CA) · máquina limpia / operador externo, sin heredar un solo ✅ · guardas **probadas** (el caso malo falla), no declaradas · trazabilidad supply-chain cuando aplique |
| **evidencia** | docs, actas, informes, gobierno | citas literales `ruta:línea` · lo no comprobado marcado `<pendiente>` · ninguna cifra sin fuente · histórico citado como `[cita inerte]` · el doc apunta a la fuente única, no la duplica |

Transversales del método que este mundo adopta tal cual:

- **Eje I** (extracción de kit/API): ≥1 consumidor real verificado, con
  evidencia de comportamiento, no solo `import`.
- **Ceguera** (cara pública marco-agnóstica): árbol **y** historial
  alcanzable (`git log -p`) a cero; medida por exit code canónico.

## 4 · Política de riesgo — qué exige contrarrevisión adversarial

Fuente de método:
`.claude/skills/swarm-orquestacion/reference/revision-adversarial.md`.
La contrarrevisión es **read-only** e **independiente** del worker; su
PASS **precede** la aceptación pero **no la concede** (aceptar es del
orquestador; cerrar decisiones, del custodio).

**Exigen contrarrevisión adversarial antes de aceptar:**

1. **Frontera de confianza** — validación de entrada, identidad/card,
   permisos, Workspace Trust, secretos. Con **hostil-omite**
   obligatorio: probar la **ausencia** (campo omitido, firma no
   aportada, opt-in apagado) y no solo el envío malformado; el default
   de lo ausente **deniega**, nunca «pasa por no haber dicho que no».
2. **Release, empaquetado y supply-chain** — guardas del release, gate
   de artefacto, checksums/SBOM/provenance, workflows de publicación.
3. **Contrato compartido con otro mundo** — documento de puertas,
   editor del env (schema ajeno), import de volumes: el otro lado (o un
   segundo cliente independiente) ejercita el contrato como sensor.
4. **Seguridad de webviews** — CSP, nonce, `localResourceRoots`: la
   contrarrevisión intenta el bypass, no relee la declaración.
5. **«Cero cambio observable» sobre pieza ancha** — troceos y
   demoliciones grandes: la contrarrevisión busca el cambio observable
   que el worker afirma que no existe.

**Riesgo ordinario** (docs, superficies read-only sin frontera nueva,
ajustes internos sin contrato): basta la revisión ordinaria del
orquestador contra los CA del BRIEF.

## 5 · Reglas de evidencia

1. **Cita literal `ruta:línea`** (ruta relativa a la raíz del repo o
   absoluta). Una afirmación sin cita es una opinión.
2. **`<pendiente>` honesto**: lo no comprobado se marca `<pendiente>` —
   vale más que un ✅ inferido. ✅ solo con evidencia **de facto**
   (comando ejecutado, salida citada), nunca «debería pasar».
3. **Ningún ✅ se hereda**: ni entre máquinas, ni entre ramas, ni entre
   versiones del artefacto. Se re-verifica o se marca `<pendiente>`.
4. **Medida canónica de grep**: validar el exit code (`grep -c` /
   `grep -q`); nunca `grep | head && echo OK`.
5. **Histórico e inerte**: lo cerrado se cita como `[cita inerte]`; las
   anclas externas se registran como sidecar inerte, no como
   dependencia viva (cerco v2).
6. **Reporte de WP**: usa la plantilla del método
   (`.claude/skills/swarm-orquestacion/reference/plantilla-reporte.md`)
   — rama, commits, CA por CA con su evidencia, desvíos, pendientes y
   riesgos. Datos crudos; el relato sobra.
7. **Fuente de verdad única**: el plan trazado en git — no la memoria
   de sesión del agente ni carpetas de IDE. Se verifica contra el plan,
   no contra el recuerdo.

## 6 · Regla de no-duplicación (el backlog apunta, no duplica)

- Los **WPs viven solo** en `plan/BACKLOG.md`; las olas, grafo y gates
  en `plan/GOBIERNO-EJECUCION-F2.md`; las decisiones en
  `plan/DECISIONES.md`; los briefs en `plan/BRIEFS/` y los reportes en
  `plan/REPORTES/`. Este par (VISIÓN + PRÁCTICAS) no enumera WPs ni
  copia sus briefs.
- A la inversa: el backlog **referencia** estas invariantes; no las
  alberga ni las reformula. Un CA de WP puede citar «I-n» o «§n» de
  este documento.
- Hacer que el backlog apunte aquí es acto del **orquestador**; ningún
  worker edita `plan/BACKLOG.md`.

## 7 · Regla de caducidad de citas y cifras (WP-V92, 2026-08-02)

> **Una cifra o una cita «medida por grep» caduca. O se re-mide al
> citarla, o se cita el gate que la sostiene.**

Su sitio es aquí y no en un reporte, porque un reporte es **acta cerrada**
y esto es invariante viva. Nace de un barrido sobre **1 518 citas** de
`plan/REPORTES/`, del que salieron **27 rancias** — pero también tres
lecciones que valen más que las 27:

1. **El denominador es parte del resultado.** «Arreglé tres» sin decir
   sobre cuántas no es una medición, es una anécdota. Un barrido declara
   qué revisó, qué falló y **qué no pudo mirar**.
2. **Un PASS acota, no absuelve.** Existe una clase que ningún barrido
   automático caza: la cita cuya **coordenada resuelve** y cuyo
   **contenido es falso** — la línea existe, pero ya no dice lo que el
   reporte afirma que dice. Un verde sobre citas significa «ninguna
   apunta al vacío», nunca «todas dicen la verdad».
3. **Anotar, no borrar.** Un reporte es acta: la cita rancia se conserva
   con su marca, su re-medición y su fecha. Borrarla destruiría la
   trazabilidad que el documento existe para dar.

**Frontera que se sigue de esto**: los **reportes** son actas y sólo se
anotan; los **documentos vivos** (censos, gobierno, prácticas) sí se
corrigen, porque alguien planifica sobre ellos. Confundir las dos cosas
fue justo lo que dejó un censo afirmando en presente que dos ficheros
borrados tenían 423 y 453 líneas muertas.

---

— **V** · Aleph-0 (ℵ₀) · fundación WP-V81
