#!/usr/bin/env bash
# =============================================================================
# slot.sh · despachador de ranura para procesos caros — carril V (Zigurat)
# =============================================================================
#
# MOTIVO
#   Hoy tres agentes compilan y prueban lo mismo en paralelo y saturan la
#   máquina. Con ranura, los comandos caros se serializan sin serializar el
#   resto del trabajo: los workers siguen leyendo, escribiendo y razonando en
#   paralelo; solo `npm ci`, `compile`, `test` y `vsce package` hacen cola.
#
# USO
#   bash scripts/slot.sh acquire <etiqueta>
#   bash scripts/slot.sh release <etiqueta>
#   bash scripts/slot.sh run     <etiqueta> -- <comando…>     # forma preferida
#   bash scripts/slot.sh status
#
#   `run` es la forma que usan los workers: toma la ranura, ejecuta y la
#   libera SIEMPRE (trap), aunque el comando falle o lo maten. Propaga el
#   código de salida del comando.
#
# DÓNDE VIVE EL BLOQUEO
#   La ranura es **compartida por todos los worktrees del mismo repo**: eso es
#   justamente lo que se quiere (tres worktrees, una sola compilación a la
#   vez). Por eso el bloqueo NO vive en el worktree actual sino en la raíz del
#   worktree principal, que se resuelve con `git rev-parse --git-common-dir`.
#   Se puede forzar con SLOT_ROOT.
#
#     $SLOT_ROOT/.slot.lock/slot-N/owner   ← el bloqueo (mkdir es atómico)
#     $SLOT_ROOT/.slot.log                 ← quién, cuándo, con qué etiqueta
#
#   Ambos están en `.gitignore`.
#
# VARIABLES
#   SLOT_MAX    ranuras simultáneas (por defecto 1)
#   MAX_WAIT    segundos máximos de espera antes de rendirse (por defecto 1800)
#   SLOT_POLL   segundos entre sondeos (por defecto 3)
#   SLOT_STALE  segundos tras los que una ranura se considera caducada aunque
#               su PID parezca vivo (por defecto 7200; 0 = sin caducidad)
#   SLOT_ROOT   raíz del bloqueo (por defecto: raíz del worktree principal)
#
# BLOQUEO HUÉRFANO
#   Si el proceso dueño ya no existe —o la ranura lleva más de SLOT_STALE
#   segundos tomada, o su fichero `owner` es ilegible— la ranura se reclama y
#   el reclamo queda anotado en `.slot.log`. Un huérfano nunca bloquea el
#   carril en silencio.
#
# CÓDIGOS DE SALIDA
#   0   ranura tomada / liberada / comando ejecutado (se propaga su código)
#   2   error de uso
#   75  no hubo ranura dentro de MAX_WAIT (temporal: reintentar más tarde)
# =============================================================================

set -uo pipefail

SLOT_MAX="${SLOT_MAX:-1}"
MAX_WAIT="${MAX_WAIT:-1800}"
SLOT_POLL="${SLOT_POLL:-3}"
SLOT_STALE="${SLOT_STALE:-7200}"

die() { printf 'slot.sh: %s\n' "$*" >&2; exit 2; }
note() { printf 'slot.sh: %s\n' "$*" >&2; }

now_iso() { date -u +%Y-%m-%dT%H:%M:%SZ; }
now_epoch() { date -u +%s; }

# --- raíz compartida ---------------------------------------------------------
resolve_slot_root() {
    if [ -n "${SLOT_ROOT:-}" ]; then
        printf '%s' "$SLOT_ROOT"
        return 0
    fi
    local common
    common=$(git rev-parse --git-common-dir 2>/dev/null) || common=""
    if [ -n "$common" ] && [ -d "$common" ]; then
        common=$(cd "$common" && pwd)
        dirname "$common"
        return 0
    fi
    # Sin git: la ranura es local a este directorio. Se anota al usarla.
    printf '%s' "$PWD"
}

SLOT_ROOT_RESOLVED="$(resolve_slot_root)"
LOCK_ROOT="$SLOT_ROOT_RESOLVED/.slot.lock"
LOG_FILE="$SLOT_ROOT_RESOLVED/.slot.log"

# --- registro ----------------------------------------------------------------
# slot_log <accion> <slot> <etiqueta> <pid> [detalle]
slot_log() {
    local accion="$1" slot="$2" label="$3" pid="$4" detalle="${5:-}"
    printf '%s\t%-14s\tslot=%s\tetiqueta=%s\tpid=%s\twt=%s\t%s\n' \
        "$(now_iso)" "$accion" "$slot" "$label" "$pid" "$(pwd)" "$detalle" \
        >> "$LOG_FILE" 2>/dev/null || true
}

# --- utilidades de dueño ------------------------------------------------------
owner_get() {
    # owner_get <fichero> <clave>
    [ -f "$1" ] || return 1
    awk -v k="$2" -F= '$1 == k { sub("^" k "=", ""); print; exit }' "$1"
}

pid_alive() {
    [ -n "$1" ] || return 1
    kill -0 "$1" 2>/dev/null
}

# reclaim_if_orphan <dir_ranura> → 0 si la reclamó (queda libre), 1 si no
reclaim_if_orphan() {
    local d="$1" owner="$1/owner" pid epoch label age motivo=""
    [ -d "$d" ] || return 0

    if [ ! -f "$owner" ]; then
        motivo="sin fichero owner"
    else
        pid="$(owner_get "$owner" PID || true)"
        epoch="$(owner_get "$owner" EPOCH || true)"
        label="$(owner_get "$owner" LABEL || true)"
        if [ -n "$pid" ] && ! pid_alive "$pid"; then
            motivo="dueño (pid $pid) ya no existe"
        elif [ "$SLOT_STALE" -gt 0 ] && [ -n "$epoch" ]; then
            age=$(( $(now_epoch) - epoch ))
            if [ "$age" -gt "$SLOT_STALE" ]; then
                motivo="tomada hace ${age}s (> SLOT_STALE=${SLOT_STALE}s)"
            fi
        fi
    fi

    [ -n "$motivo" ] || return 1

    rm -rf "$d" 2>/dev/null || return 1
    slot_log "RECLAMO" "$(basename "$d")" "${label:-?}" "${pid:-?}" "huérfano: $motivo"
    note "ranura $(basename "$d") reclamada — $motivo (anotado en .slot.log)"
    return 0
}

ACQUIRED_DIR=""

# write_owner <dir> <etiqueta> <pid> <modo>
write_owner() {
    {
        printf 'LABEL=%s\n' "$2"
        printf 'PID=%s\n' "$3"
        printf 'MODE=%s\n' "$4"
        printf 'HOST=%s\n' "$(hostname 2>/dev/null || echo '?')"
        printf 'WORKTREE=%s\n' "$(pwd)"
        printf 'SINCE=%s\n' "$(now_iso)"
        printf 'EPOCH=%s\n' "$(now_epoch)"
    } > "$1/owner" 2>/dev/null || true
}

# try_acquire <etiqueta> <pid> <modo> → 0 y deja ACQUIRED_DIR puesto
try_acquire() {
    local label="$1" pid="$2" modo="$3" i d
    mkdir -p "$LOCK_ROOT" 2>/dev/null || true
    i=1
    while [ "$i" -le "$SLOT_MAX" ]; do
        d="$LOCK_ROOT/slot-$i"
        if mkdir "$d" 2>/dev/null; then
            write_owner "$d" "$label" "$pid" "$modo"
            ACQUIRED_DIR="$d"
            slot_log "TOMA" "slot-$i" "$label" "$pid" "modo=$modo"
            return 0
        fi
        # Ocupada: ¿huérfana? Si la reclamamos, reintentamos esta misma ranura.
        if reclaim_if_orphan "$d"; then
            if mkdir "$d" 2>/dev/null; then
                write_owner "$d" "$label" "$pid" "$modo"
                ACQUIRED_DIR="$d"
                slot_log "TOMA" "slot-$i" "$label" "$pid" "modo=$modo tras-reclamo"
                return 0
            fi
        fi
        i=$(( i + 1 ))
    done
    return 1
}

quien_ocupa() {
    local i d out=""
    i=1
    while [ "$i" -le "$SLOT_MAX" ]; do
        d="$LOCK_ROOT/slot-$i"
        if [ -f "$d/owner" ]; then
            out="$out slot-$i:$(owner_get "$d/owner" LABEL || echo '?')"
        fi
        i=$(( i + 1 ))
    done
    printf '%s' "${out# }"
}

# acquire_blocking <etiqueta> <pid> <modo>
acquire_blocking() {
    local label="$1" pid="$2" modo="$3" deadline avisado=0
    deadline=$(( $(now_epoch) + MAX_WAIT ))
    while :; do
        if try_acquire "$label" "$pid" "$modo"; then
            return 0
        fi
        if [ "$avisado" -eq 0 ]; then
            slot_log "ESPERA" "-" "$label" "$pid" "ocupadas: $(quien_ocupa)"
            note "esperando ranura para «$label» (ocupadas: $(quien_ocupa); MAX_WAIT=${MAX_WAIT}s)"
            avisado=1
        fi
        if [ "$(now_epoch)" -ge "$deadline" ]; then
            slot_log "TIMEOUT" "-" "$label" "$pid" "MAX_WAIT=${MAX_WAIT}s agotado"
            note "sin ranura tras ${MAX_WAIT}s para «$label» — NO se ejecuta nada"
            return 75
        fi
        sleep "$SLOT_POLL"
    done
}

# release_dir <dir>
release_dir() {
    local d="$1" label pid
    [ -n "$d" ] || return 0
    [ -d "$d" ] || return 0
    label="$(owner_get "$d/owner" LABEL 2>/dev/null || echo '?')"
    pid="$(owner_get "$d/owner" PID 2>/dev/null || echo '?')"
    rm -rf "$d" 2>/dev/null || true
    slot_log "LIBERA" "$(basename "$d")" "$label" "$pid" ""
}

release_by_label() {
    local label="$1" i d
    i=1
    while [ "$i" -le "$SLOT_MAX" ]; do
        d="$LOCK_ROOT/slot-$i"
        if [ -f "$d/owner" ] && [ "$(owner_get "$d/owner" LABEL || true)" = "$label" ]; then
            release_dir "$d"
            return 0
        fi
        i=$(( i + 1 ))
    done
    slot_log "LIBERA-VACIO" "-" "$label" "$$" "no había ranura con esa etiqueta"
    note "no había ranura tomada con la etiqueta «$label» (nada que liberar)"
    return 0
}

cmd_status() {
    printf 'SLOT_ROOT : %s\n' "$SLOT_ROOT_RESOLVED"
    printf 'SLOT_MAX  : %s   MAX_WAIT: %ss   SLOT_POLL: %ss   SLOT_STALE: %ss\n' \
        "$SLOT_MAX" "$MAX_WAIT" "$SLOT_POLL" "$SLOT_STALE"
    local i d libres=0
    i=1
    while [ "$i" -le "$SLOT_MAX" ]; do
        d="$LOCK_ROOT/slot-$i"
        if [ -d "$d" ]; then
            if [ -f "$d/owner" ]; then
                printf 'slot-%s    : OCUPADA  etiqueta=%s pid=%s desde=%s wt=%s\n' \
                    "$i" \
                    "$(owner_get "$d/owner" LABEL || echo '?')" \
                    "$(owner_get "$d/owner" PID || echo '?')" \
                    "$(owner_get "$d/owner" SINCE || echo '?')" \
                    "$(owner_get "$d/owner" WORKTREE || echo '?')"
            else
                printf 'slot-%s    : OCUPADA  (sin owner — huérfana)\n' "$i"
            fi
        else
            printf 'slot-%s    : libre\n' "$i"
            libres=$(( libres + 1 ))
        fi
        i=$(( i + 1 ))
    done
    printf 'libres    : %s/%s\n' "$libres" "$SLOT_MAX"
    printf 'registro  : %s\n' "$LOG_FILE"
}

usage() {
    cat >&2 <<'EOF'
uso:
  slot.sh acquire <etiqueta>
  slot.sh release <etiqueta>
  slot.sh run     <etiqueta> -- <comando…>
  slot.sh status
EOF
    exit 2
}

# --- despacho ----------------------------------------------------------------
[ $# -ge 1 ] || usage
ACCION="$1"; shift

case "$ACCION" in
    acquire)
        [ $# -eq 1 ] || die "acquire necesita exactamente una etiqueta"
        # El dueño de una ranura tomada con `acquire` es el shell que llama:
        # este proceso muere en cuanto termina. Si PPID no sirve, el respaldo
        # es SLOT_STALE.
        acquire_blocking "$1" "${PPID:-$$}" "acquire"
        rc=$?
        [ $rc -eq 0 ] && printf '%s\n' "$ACQUIRED_DIR"
        exit $rc
        ;;
    release)
        [ $# -eq 1 ] || die "release necesita exactamente una etiqueta"
        release_by_label "$1"
        exit 0
        ;;
    run)
        [ $# -ge 3 ] || usage
        LABEL="$1"; shift
        [ "$1" = "--" ] || die "falta el separador «--» antes del comando"
        shift
        [ $# -ge 1 ] || die "no hay comando que ejecutar tras «--»"

        cleanup() {
            if [ -n "$ACQUIRED_DIR" ]; then
                release_dir "$ACQUIRED_DIR"
                ACQUIRED_DIR=""
            fi
        }
        trap cleanup EXIT
        trap 'cleanup; exit 130' INT
        trap 'cleanup; exit 143' TERM

        acquire_blocking "$LABEL" "$$" "run" || exit 75

        "$@"
        rc=$?
        slot_log "FIN" "$(basename "$ACQUIRED_DIR")" "$LABEL" "$$" "rc=$rc cmd=$*"
        cleanup
        trap - EXIT
        exit $rc
        ;;
    status)
        cmd_status
        exit 0
        ;;
    -h|--help|help)
        usage
        ;;
    *)
        die "acción desconocida: $ACCION"
        ;;
esac
