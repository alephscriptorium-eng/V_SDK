# Dos modelos de elenco (WP-V09) — separación obligatoria

Cláusula del contrato IDE (fase 5 / separación de elencos): el elenco del
dominio (`reparto/1`) y la compañía teatral del IDE (`ICompany`) son
**objetos distintos**. El IDE no los fusiona en un mismo modelo de datos.

## Modelo A · Reparto de dominio (`reparto/1`)

| campo | valor |
| ----- | ----- |
| contrato | `@zeus/reparto-kit` shape `reparto/1` |
| proyección visual | `filasCastDesdeReparto` → schema filas cast-table |
| widget canónico | `cast-table` (`@zeus/view-kit`; alias `panel-elenco`) |
| actor | `ssbId` de peer-card (identidad durable Zeus) |
| relación | 1 actor (`actorSsbId`) – N personajes |
| panel IDE | `alephscript.elenco` (TreeView alimentado por filas reales) |

Filas del cast-table (schema consumido, no reinventado):

```text
{ participant: string, role: string, oldid: string }
```

Fuente de verdad: JSON `reparto/1` (setting `aleph0.reparto.path`).
Sin path / shape inválido → `⏳` (hostil-omite).

## Modelo B · Compañía teatral IDE (`ICompany`)

| campo | valor |
| ----- | ----- |
| contrato | `src/theatrical/core/interfaces/ICompany.ts` |
| UI | `alephscript.teatro` (Automatons / ChatParticipants) |
| actores | agentes teatrales IDE (`ITheatricalAgent`), no `ssbId` |
| propósito | compañías de ChatParticipants del teatro VS Code |

`ICompany` **no** se lee ni se escribe como `reparto/1`. No hay mapeo
automático compañía↔reparto. El panel elenco (Modelo A) ignora
`ICompany`; el árbol teatro (Modelo B) ignora `reparto/1`.

## Prohibiciones

- Fusionar agentes `ICompany` como filas de cast-table.
- Tratar `ITheatricalAgent.id` como `actorSsbId`.
- Mutar `linea-editor` / leer `motivos_deny` / `editor://info` (carril V08).
