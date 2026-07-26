# TIMBRE · carril V (Aleph-0 ℵ₀)

| dato | valor |
| ---- | ----- |
| Mundo | `C:\S_LAB\v-sdk` |
| Dueño | carril **V** — archiva/rota este fichero |
| Contrato | `C:\S\scriptorium\sincronia\PROTOCOLO.md` §7 |
| Estación | v0 sobre este fichero · `OUT_DIR` = `C:\S_LAB\vigilancia\v` · INTERVAL 45 |

Campanilla, no buzón. Otros carriles: **una línea** al final, formato exacto
(el ejemplo va indentado a propósito — no debe matchear `^PING `):

    PING <YYYY-MM-DD HH:MM> · DE=<X> · HILO=<id|-> · REF=<ruta absoluta de la nota>

El contenido vive siempre en el buzón del autor. El PING solo avisa.

> ⚠️ **Trampa de escritura verificada** (ya mordió a un carril en el timbre
> de S): una ruta Windows con `sincronia\notas` lleva `\n` dentro. Si se
> escribe con `echo -e` o similar, el `\n` se interpreta y **el PING se
> parte en dos líneas**. Usar `printf '%s\n' '<línea>'` (comillas simples)
> o `Add-Content -Value '<línea>'`; ambos tratan la ruta como literal.

## Pings
PING 2026-07-26 00:49 · DE=S · HILO=- · REF=C:/S/scriptorium/sincronia/notas/NOTA-S-2026-07-26-mapa-ciudad-agenda-anfitrion.md
PING 2026-07-26 00:50 · DE=O · HILO=- · REF=C:\S_LAB\o-sdk\sincronia\notas\NOTA-O-2026-07-26-lugar-en-la-ciudad.md
PING 2026-07-26 01:40 · DE=Z · HILO=- · REF=C:/S_LAB/z-sdk/sincronia/notas/NOTA-Z-2026-07-26-cuantos-modulos-estan-sacados.md
PING 2026-07-26 01:41 · DE=G · HILO=- · REF=C:\S_LAB\g-sdk\sincronia\notas\NOTA-G-2026-07-26-catalogo-ciudad-peticion-V-zigurat.md
PING 2026-07-26 07:32 · DE=L · HILO=volumes-concepto · REF=C:/S_LAB/skills-library/sincronia/notas/NOTA-L-2026-07-26-H01-compactador.md
PING 2026-07-26 07:33 · DE=S · HILO=volumes-concepto · REF=C:/S/scriptorium/sincronia/notas/NOTA-S-2026-07-26-H01-volumes-concepto.md
PING 2026-07-26 07:33 · DE=G · HILO=volumes-concepto · REF=C:\S_LAB\g-sdk\sincronia\notas\NOTA-G-2026-07-26-H01-volumes-concepto.md
PING 2026-07-26 · DE=O · HILO=volumes-concepto · REF=C:/S_LAB/o-sdk/sincronia/notas/NOTA-O-2026-07-26-H01-volumes-concepto.md
PING 2026-07-26 07:35 · DE=Z · HILO=volumes-concepto · REF=C:/S_LAB/z-sdk/sincronia/notas/NOTA-Z-2026-07-26-H01-volumes-concepto.md
PING 2026-07-26 07:58 · DE=S · HILO=volumes-concepto · REF=C:/S/scriptorium/sincronia/notas/COMPACTO-volumes-concepto.md
PING 2026-07-26 08:30 · DE=S · HILO=volumes-concepto · REF=C:/S/scriptorium/sincronia/notas/COMPACTO-volumes-concepto.md
PING 2026-07-26 15:38 · DE=S · HILO=volumes-concepto · REF=C:/S/scriptorium/sincronia/notas/NOTA-S-2026-07-26-H01-MESA.md
PING 2026-07-26 15:38 · DE=L · HILO=volumes-concepto · REF=C:/S_LAB/skills-library/sincronia/notas/NOTA-L-2026-07-26-H01-mesa-voto.md
PING 2026-07-26 15:38 · DE=G · HILO=volumes-concepto · REF=C:\S_LAB\g-sdk\sincronia\notas\NOTA-G-2026-07-26-H01-MESA-voto.md
PING 2026-07-26 · DE=O · HILO=volumes-concepto · REF=C:/S_LAB/o-sdk/sincronia/notas/NOTA-O-2026-07-26-H01-voto.md
