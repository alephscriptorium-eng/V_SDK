#!/usr/bin/env bash
# =============================================================================
# evidencia.sh · registro de evidencia con huella — carril V (Zigurat)
# =============================================================================
#
# MOTIVO
#   «No fiarse» no debe significar «repetirlo». Si la huella del árbol es
#   idéntica a la del último PASS, el registro anterior ES la evidencia:
#   repetir el comando no aporta nada y quema la máquina. Si la huella
#   cambió, hay que repetir. **Eso lo decide este script, no el criterio de
#   cada agente.**
#
# USO
#   bash scripts/evidencia.sh registrar <etiqueta> <resultado> [nota]
#   bash scripts/evidencia.sh vigente   <etiqueta>      # 0 = no hace falta repetir
#   bash scripts/evidencia.sh huella                    # imprime la huella actual
#   bash scripts/evidencia.sh listar    [etiqueta]
#
#   Patrón del worker, antes de gastar CPU:
#
#     if bash scripts/evidencia.sh vigente compile; then
#       echo "compile ya PASS con esta misma huella — se cita el registro"
#     else
#       bash scripts/slot.sh run compile -- npm run compile:production \
#         && bash scripts/evidencia.sh registrar compile PASS \
#         || bash scripts/evidencia.sh registrar compile FAIL
#     fi
#
# LA HUELLA
#   huella = HEAD + árbol limpio + hash del package-lock.json
#
#   - HEAD      `git rev-parse HEAD` del worktree actual
#   - árbol     `limpio` si `git status --porcelain` (sin contar EVIDENCIA.md)
#               está vacío; si no, `sucio(N)` con N entradas modificadas
#   - lockfile  primeros 16 hex del sha256 de `package-lock.json`
#               (respaldo `blob:` = `git hash-object`, prefijo distinto para
#               que dos algoritmos nunca se comparen entre sí)
#
#   **Un árbol sucio nunca está vigente.** Dos árboles sucios distintos
#   producirían la misma etiqueta `sucio`, así que no es una huella: con el
#   árbol sucio, `vigente` siempre sale 1 y el comando se repite.
#
# LÍMITE CONOCIDO (declarado, no escondido)
#   La huella es **conservadora**: un commit de solo documentación mueve HEAD
#   e invalida un PASS que seguiría siendo válido. Se prefiere gastar de más
#   a mentir. Recomendación: registrar tras el último commit de código del WP.
#
# DÓNDE ESCRIBE
#   `EVIDENCIA.md` en la raíz del worktree actual (override: EVIDENCIA_FILE).
#   Está en `.gitignore`: es un libro de a bordo por worktree. Lo que perdura
#   es la tabla transcrita al reporte del WP.
#
# CÓDIGOS DE SALIDA
#   registrar → 0 siempre que consiga escribir
#   vigente   → 0 hay PASS con la misma huella · 1 no lo hay · 2 error de uso
# =============================================================================

set -uo pipefail

die() { printf 'evidencia.sh: %s\n' "$*" >&2; exit 2; }

now_iso() { date -u +%Y-%m-%dT%H:%M:%SZ; }

repo_root() {
    git rev-parse --show-toplevel 2>/dev/null || printf '%s' "$PWD"
}

ROOT="$(repo_root)"
FILE="${EVIDENCIA_FILE:-$ROOT/EVIDENCIA.md}"

# --- componentes de la huella -------------------------------------------------
huella_head() {
    git rev-parse HEAD 2>/dev/null || printf 'sin-head'
}

huella_arbol() {
    local n
    if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
        printf 'sin-git'
        return 0
    fi
    # EVIDENCIA.md no cuenta: registrar no puede ensuciar su propia huella.
    n=$(git status --porcelain 2>/dev/null | grep -v -e 'EVIDENCIA\.md$' | grep -c .)
    if [ "$n" -eq 0 ]; then
        printf 'limpio'
    else
        printf 'sucio(%s)' "$n"
    fi
}

huella_lockfile() {
    local lock="$ROOT/package-lock.json" h
    if [ ! -f "$lock" ]; then
        printf 'sin-lockfile'
        return 0
    fi
    if command -v sha256sum >/dev/null 2>&1; then
        h=$(sha256sum "$lock" | cut -c1-16)
        printf 'sha256:%s' "$h"
    elif command -v shasum >/dev/null 2>&1; then
        h=$(shasum -a 256 "$lock" | cut -c1-16)
        printf 'sha256:%s' "$h"
    else
        h=$(git hash-object "$lock" 2>/dev/null | cut -c1-16)
        printf 'blob:%s' "${h:-?}"
    fi
}

CABECERA_ESCRITA=0
asegurar_fichero() {
    [ -f "$FILE" ] && return 0
    cat > "$FILE" <<EOF
# EVIDENCIA · $(basename "$ROOT")

Libro de a bordo de los comandos caros de este worktree. Lo escribe
\`scripts/evidencia.sh\`; está en \`.gitignore\`. **Al cerrar el WP, esta
tabla se transcribe al reporte** — ahí es donde la evidencia perdura.

Huella = HEAD + árbol limpio + hash del \`package-lock.json\`. Si la huella
no ha cambiado desde el último PASS de una etiqueta,
\`evidencia.sh vigente <etiqueta>\` sale 0 y **el comando no se repite**: se
cita la fila de abajo. Un árbol \`sucio\` nunca está vigente.

| sello (UTC) | etiqueta | resultado | HEAD | árbol | lockfile | nota |
| ----------- | -------- | --------- | ---- | ----- | -------- | ---- |
EOF
    CABECERA_ESCRITA=1
}

cmd_registrar() {
    [ $# -ge 2 ] || die "registrar necesita <etiqueta> <resultado> [nota]"
    local label="$1" resultado="$2" nota="${3:-}"
    local head arbol lock sello

    case "$label" in *'|'*) die "la etiqueta no puede contener «|»";; esac
    case "$resultado" in *'|'*) die "el resultado no puede contener «|»";; esac
    nota="${nota//|//}"

    head="$(huella_head)"
    arbol="$(huella_arbol)"
    lock="$(huella_lockfile)"
    sello="$(now_iso)"

    asegurar_fichero
    printf '| %s | %s | %s | `%s` | %s | `%s` | %s |\n' \
        "$sello" "$label" "$resultado" "$head" "$arbol" "$lock" "$nota" >> "$FILE" \
        || die "no se pudo escribir en $FILE"

    printf 'registrado: %s = %s · HEAD=%s · árbol=%s · lock=%s\n' \
        "$label" "$resultado" "${head:0:12}" "$arbol" "$lock"
    if [ "$arbol" != "limpio" ]; then
        printf 'aviso: árbol %s — esta fila NUNCA contará como vigente.\n' "$arbol" >&2
    fi
    return 0
}

cmd_vigente() {
    [ $# -eq 1 ] || die "vigente necesita exactamente una etiqueta"
    local label="$1" head arbol lock

    arbol="$(huella_arbol)"
    if [ "$arbol" != "limpio" ]; then
        printf 'no vigente: árbol %s (un árbol sucio no es una huella)\n' "$arbol" >&2
        return 1
    fi

    [ -f "$FILE" ] || { printf 'no vigente: aún no hay %s\n' "$FILE" >&2; return 1; }

    head="$(huella_head)"
    lock="$(huella_lockfile)"

    awk -F'|' \
        -v lab="$label" -v head="$head" -v arbol="$arbol" -v lock="$lock" '
        function trim(s) { gsub(/^[ \t`]+|[ \t`]+$/, "", s); return s }
        /^\|/ {
            if (trim($3) == lab \
                && toupper(trim($4)) == "PASS" \
                && trim($5) == head \
                && trim($6) == arbol \
                && trim($7) == lock) { fila = $0; found = 1 }
        }
        END {
            if (found) { print "vigente: " fila; exit 0 }
            exit 1
        }
    ' "$FILE"
    return $?
}

cmd_huella() {
    printf 'worktree : %s\n' "$ROOT"
    printf 'HEAD     : %s\n' "$(huella_head)"
    printf 'árbol    : %s\n' "$(huella_arbol)"
    printf 'lockfile : %s\n' "$(huella_lockfile)"
    printf 'registro : %s\n' "$FILE"
}

cmd_listar() {
    [ -f "$FILE" ] || { printf 'aún no hay %s\n' "$FILE" >&2; return 1; }
    if [ $# -eq 1 ]; then
        awk -F'|' -v lab="$1" '
            function trim(s) { gsub(/^[ \t`]+|[ \t`]+$/, "", s); return s }
            /^\|/ && trim($3) == lab { print }
        ' "$FILE"
    else
        cat "$FILE"
    fi
}

usage() {
    cat >&2 <<'EOF'
uso:
  evidencia.sh registrar <etiqueta> <resultado> [nota]
  evidencia.sh vigente   <etiqueta>
  evidencia.sh huella
  evidencia.sh listar    [etiqueta]
EOF
    exit 2
}

[ $# -ge 1 ] || usage
ACCION="$1"; shift

case "$ACCION" in
    registrar) cmd_registrar "$@" ;;
    vigente)   cmd_vigente "$@" ;;
    huella)    cmd_huella ;;
    listar)    cmd_listar "$@" ;;
    -h|--help|help) usage ;;
    *) die "acción desconocida: $ACCION" ;;
esac
