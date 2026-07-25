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
