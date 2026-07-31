/**
 * WP-V71 · OutputChannel propio + log estructurado.
 *
 * Sustituye a los `console.*` sueltos del árbol vivo. El destino es un
 * `OutputChannel` de VS Code — visible para el operador en «Output → Aleph-0»
 * sin abrir las DevTools del Extension Host.
 *
 * Qué lleva cada línea, y por qué (criterio: **depurable en máquina ajena**,
 * a partir de un log pegado en un issue, sin acceso al equipo):
 *
 * ```
 * [2026-08-01T09:14:22.418Z] [INFO ] [ProcessManager] [s=a3f19c2b #7 op=proc-3] Process started | {"name":"launcher"}
 *  └ marca de tiempo         └ nivel └ origen         └ correlación            └ mensaje       └ datos redactados
 * ```
 *
 * - **marca de tiempo**: ISO-8601 en **UTC**. No `toLocaleTimeString()`: la
 *   hora local del emisor es ilegible para quien diagnostica desde otro huso.
 * - **nivel**: ancho fijo, para que `grep '\[ERROR\]'` case siempre.
 * - **origen**: el módulo emisor, poblado en el sitio de llamada.
 * - **correlación**: `s=` sesión del Extension Host (agrupa líneas de un mismo
 *   arranque cuando el usuario pega un fragmento), `#` secuencia monótona
 *   (delata líneas perdidas o reordenadas) y `op=` operación, que hilvana las
 *   líneas de un mismo flujo multi-módulo.
 * - **datos**: JSON de una línea, ya pasado por `redact.ts`.
 *
 * Invariantes de la pieza:
 * 1. **Nunca lanza.** Un fallo del logger no puede tumbar al llamante.
 * 2. **Nunca escribe en `console`.** Ni siquiera en su propio camino de error.
 * 3. **Perezoso.** El canal se crea al primer uso, no al importar el módulo:
 *    importar esto en un test no crea superficie de VS Code.
 */
import * as vscode from 'vscode';
import { LogLevel, LogCategory } from '../../loggingManager';
import { redactString, serializeData } from './redact';

/** Nombre del canal en «Output». Es la identidad nueva (I-4), no el scope viejo. */
export const DIAGNOSTIC_CHANNEL_NAME = 'Aleph-0';

/** Entrada ya formada, tal y como se emite y se retiene en el anillo. */
export interface StructuredEntry {
    timestamp: string;
    level: LogLevel;
    category: LogCategory;
    source: string;
    session: string;
    seq: number;
    operation?: string;
    message: string;
    data?: string;
}

/** Superficie que consumen los sitios de llamada migrados. */
export interface StructuredLogger {
    error(message: string, data?: unknown): void;
    warn(message: string, data?: unknown): void;
    info(message: string, data?: unknown): void;
    debug(message: string, data?: unknown): void;
    trace(message: string, data?: unknown): void;
    /**
     * Sub-logger atado a un id de operación: hilvana en el log las líneas de un
     * flujo que atraviesa varios módulos o varios instantes.
     */
    forOperation(operation: string): StructuredLogger;
}

/** Tamaño del anillo en memoria (diagnóstico y tests; no es el canal). */
const RING_CAPACITY = 500;

function randomId(bytes: number): string {
    let out = '';
    for (let i = 0; i < bytes; i++) {
        out += Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
    }
    return out;
}

function parseLevel(raw: unknown): LogLevel | undefined {
    if (typeof raw !== 'string') {
        return undefined;
    }
    switch (raw.trim().toLowerCase()) {
        case 'error': return LogLevel.ERROR;
        case 'warn': return LogLevel.WARN;
        case 'info': return LogLevel.INFO;
        case 'debug': return LogLevel.DEBUG;
        case 'trace': return LogLevel.TRACE;
        default: return undefined;
    }
}

/**
 * Núcleo del log estructurado. Singleton perezoso: no hay canal hasta que
 * alguien loguea.
 */
class StructuredLog {
    private static instance: StructuredLog | undefined;

    private channel: vscode.OutputChannel | undefined;
    private channelAttempted = false;
    private headerWritten = false;
    private readonly session = randomId(4);
    private readonly startedAt = new Date().toISOString();
    private seq = 0;
    private operationCounter = 0;
    private threshold: LogLevel = LogLevel.INFO;
    private thresholdLoaded = false;
    private readonly ring: StructuredEntry[] = [];

    static get(): StructuredLog {
        if (!StructuredLog.instance) {
            StructuredLog.instance = new StructuredLog();
        }
        return StructuredLog.instance;
    }

    /** Solo para tests: descarta el singleton y su canal. */
    static resetForTests(): void {
        StructuredLog.instance?.dispose();
        StructuredLog.instance = undefined;
    }

    get sessionId(): string {
        return this.session;
    }

    nextOperationId(prefix: string): string {
        this.operationCounter += 1;
        return `${prefix}-${this.operationCounter}`;
    }

    /**
     * Umbral de nivel. Se lee de `aleph0.log.level` si existe; mientras esa
     * clave no esté declarada en el manifiesto (dependencia pendiente del WP,
     * `package.json` tiene otro escritor esta ola) el valor efectivo es INFO.
     *
     * INFO es deliberado: **todos** los puntos migrados desde `console.*` se
     * emiten en INFO o por encima, así que ninguna línea que antes se imprimía
     * queda ahora silenciada.
     */
    private getThreshold(): LogLevel {
        if (this.thresholdLoaded) {
            return this.threshold;
        }
        this.thresholdLoaded = true;
        try {
            const configured = vscode.workspace
                ?.getConfiguration?.('aleph0.log')
                ?.get?.('level');
            const parsed = parseLevel(configured);
            if (parsed !== undefined) {
                this.threshold = parsed;
            }
        } catch {
            // Sin configuración accesible: se queda en INFO.
        }
        return this.threshold;
    }

    private getChannel(): vscode.OutputChannel | undefined {
        if (this.channelAttempted) {
            return this.channel;
        }
        this.channelAttempted = true;
        try {
            const created = vscode.window?.createOutputChannel?.(DIAGNOSTIC_CHANNEL_NAME);
            // En arneses con dobles parciales esto puede no ser un canal usable.
            if (created && typeof created.appendLine === 'function') {
                this.channel = created;
            }
        } catch {
            this.channel = undefined;
        }
        return this.channel;
    }

    /**
     * Cabecera de sesión: el contexto de la máquina ajena. Sin esto, un log
     * pegado en un issue no dice ni qué versión ni sobre qué VS Code corría.
     */
    private writeHeader(channel: vscode.OutputChannel): void {
        if (this.headerWritten) {
            return;
        }
        this.headerWritten = true;
        let extensionVersion = 'desconocida';
        let vscodeVersion = 'desconocida';
        try {
            extensionVersion =
                vscode.extensions?.getExtension?.('scriptorium.aleph-0')?.packageJSON?.version ??
                'desconocida';
        } catch {
            /* se queda en «desconocida» */
        }
        try {
            vscodeVersion = vscode.version ?? 'desconocida';
        } catch {
            /* se queda en «desconocida» */
        }
        const lines = [
            '='.repeat(72),
            `Aleph-0 · diagnóstico · sesión ${this.session}`,
            `  iniciada    ${this.startedAt}`,
            `  extensión   scriptorium.aleph-0 ${extensionVersion}`,
            `  vs code     ${vscodeVersion}`,
            `  plataforma  ${process.platform} ${process.arch} · node ${process.versions?.node ?? '?'}`,
            `  nivel       ${LogLevel[this.getThreshold()]}`,
            '  las credenciales van redactadas como «redactado» (WP-V71)',
            '='.repeat(72)
        ];
        for (const line of lines) {
            channel.appendLine(line);
        }
    }

    private format(entry: StructuredEntry): string {
        const level = LogLevel[entry.level].padEnd(5, ' ');
        const correlation = entry.operation
            ? `s=${entry.session} #${entry.seq} op=${entry.operation}`
            : `s=${entry.session} #${entry.seq}`;
        const head = `[${entry.timestamp}] [${level}] [${entry.source}] [${correlation}] ${entry.message}`;
        return entry.data ? `${head} | ${entry.data}` : head;
    }

    emit(
        level: LogLevel,
        category: LogCategory,
        source: string,
        operation: string | undefined,
        message: string,
        data?: unknown
    ): void {
        try {
            if (level > this.getThreshold()) {
                return;
            }
            this.seq += 1;
            const entry: StructuredEntry = {
                timestamp: new Date().toISOString(),
                level,
                category,
                source,
                session: this.session,
                seq: this.seq,
                operation,
                message: redactString(String(message ?? '')),
                data: serializeData(data)
            };

            this.ring.push(entry);
            if (this.ring.length > RING_CAPACITY) {
                this.ring.shift();
            }

            const channel = this.getChannel();
            if (channel) {
                this.writeHeader(channel);
                channel.appendLine(this.format(entry));
            }
        } catch {
            // Invariante 1: el logger nunca propaga un fallo al llamante.
            // Invariante 2: tampoco cae de vuelta a `console`.
        }
    }

    /** Últimas entradas retenidas (diagnóstico y tests). */
    recent(count = RING_CAPACITY): StructuredEntry[] {
        return this.ring.slice(-count);
    }

    /** Render de las últimas entradas, idéntico al que recibe el canal. */
    renderRecent(count = RING_CAPACITY): string[] {
        return this.recent(count).map(entry => this.format(entry));
    }

    show(): void {
        try {
            this.getChannel()?.show?.(true);
        } catch {
            /* sin canal no hay nada que mostrar */
        }
    }

    dispose(): void {
        try {
            this.channel?.dispose?.();
        } catch {
            /* nada que hacer */
        }
        this.channel = undefined;
        this.channelAttempted = false;
        this.headerWritten = false;
        this.ring.length = 0;
    }
}

class ChannelLogger implements StructuredLogger {
    constructor(
        private readonly source: string,
        private readonly category: LogCategory,
        private readonly operation?: string
    ) {}

    private emit(level: LogLevel, message: string, data?: unknown): void {
        StructuredLog.get().emit(level, this.category, this.source, this.operation, message, data);
    }

    error(message: string, data?: unknown): void {
        this.emit(LogLevel.ERROR, message, data);
    }
    warn(message: string, data?: unknown): void {
        this.emit(LogLevel.WARN, message, data);
    }
    info(message: string, data?: unknown): void {
        this.emit(LogLevel.INFO, message, data);
    }
    debug(message: string, data?: unknown): void {
        this.emit(LogLevel.DEBUG, message, data);
    }
    trace(message: string, data?: unknown): void {
        this.emit(LogLevel.TRACE, message, data);
    }

    forOperation(operation: string): StructuredLogger {
        return new ChannelLogger(
            this.source,
            this.category,
            StructuredLog.get().nextOperationId(operation)
        );
    }
}

/**
 * Logger del módulo `source`. Es la única puerta de entrada al canal desde el
 * código vivo; ningún sitio de llamada construye entradas a mano.
 */
export function getLogger(source: string, category: LogCategory = LogCategory.GENERAL): StructuredLogger {
    return new ChannelLogger(source, category);
}

/** Id de la sesión del Extension Host (el `s=` de cada línea). */
export function getLogSessionId(): string {
    return StructuredLog.get().sessionId;
}

/** Últimas entradas retenidas en memoria. */
export function getRecentLogEntries(count?: number): StructuredEntry[] {
    return StructuredLog.get().recent(count);
}

/** Últimas entradas ya formateadas, tal y como las recibió el canal. */
export function renderRecentLogEntries(count?: number): string[] {
    return StructuredLog.get().renderRecent(count);
}

/** Revela el canal en «Output». */
export function showDiagnosticChannel(): void {
    StructuredLog.get().show();
}

/** Cierra el canal. Se llama en `deactivate`. */
export function disposeStructuredLog(): void {
    StructuredLog.get().dispose();
}

/** Solo para tests: descarta el singleton. */
export function __resetStructuredLogForTests(): void {
    StructuredLog.resetForTests();
}
