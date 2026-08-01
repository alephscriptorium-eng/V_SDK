/**
 * Probe WP-V71 · doble mínimo de la API de VS Code.
 *
 * NO es un mock de test: es el arnés que permite arrancar el código VIVO
 * (`src/processManager.ts`, `src/core/logging/`) fuera del Extension Host para
 * capturar lo que de verdad se escribe en el OutputChannel.
 *
 * El canal recoge las líneas en un array en vez de pintarlas: la probe las
 * imprime al final, para que la salida del reporte sea la del canal y no un
 * `console.log` disfrazado.
 */

/**
 * Líneas realmente entregadas al OutputChannel, en orden.
 *
 * Vive en `globalThis` a propósito: esbuild EMPOTRA este stub dentro del
 * bundle, así que el guion y la probe cargan dos instancias del módulo. El
 * array compartido hace que la probe lea lo que escribió el código vivo, y no
 * un segundo array vacío.
 */
export const canal = (globalThis.__V71_CANAL__ ??= []);

const disposable = { dispose() {} };

/** Config del workspace: todo ausente → la extensión debe decir ⏳, no inventar. */
const configuracion = {
    get(_key, valorPorDefecto) {
        return valorPorDefecto;
    },
    has() {
        return false;
    },
    update() {
        return Promise.resolve();
    },
    inspect() {
        return undefined;
    }
};

export const window = {
    createOutputChannel(name) {
        return {
            name,
            appendLine(linea) {
                canal.push(linea);
            },
            append() {},
            clear() {
                canal.length = 0;
            },
            show() {},
            hide() {},
            dispose() {}
        };
    },
    createTerminal(opciones) {
        return {
            name: opciones?.name ?? 'terminal',
            processId: Promise.resolve(4242),
            creationOptions: opciones ?? {},
            exitStatus: undefined,
            sendText() {},
            show() {},
            hide() {},
            dispose() {}
        };
    },
    onDidCloseTerminal() {
        return disposable;
    },
    onDidOpenTerminal() {
        return disposable;
    },
    showInformationMessage() {
        return Promise.resolve(undefined);
    },
    showWarningMessage() {
        return Promise.resolve(undefined);
    },
    showErrorMessage() {
        return Promise.resolve(undefined);
    },
    activeTextEditor: undefined,
    visibleTextEditors: []
};

export const workspace = {
    workspaceFolders: undefined,
    name: undefined,
    getConfiguration() {
        return configuracion;
    },
    onDidChangeConfiguration() {
        return disposable;
    },
    createFileSystemWatcher() {
        return {
            onDidCreate: () => disposable,
            onDidChange: () => disposable,
            onDidDelete: () => disposable,
            dispose() {}
        };
    }
};

export const commands = {
    registerCommand() {
        return disposable;
    },
    executeCommand() {
        return Promise.resolve(undefined);
    },
    getCommands() {
        return Promise.resolve([]);
    }
};

export const extensions = {
    all: [],
    getExtension(id) {
        // La versión sale del manifiesto real en el host; aquí se declara el
        // valor que se está simulando, sin fingir que se leyó de disco.
        return id === 'scriptorium.aleph-0'
            ? { packageJSON: { version: '0.2.0 (simulada en probe)' } }
            : undefined;
    },
    onDidChange() {
        return disposable;
    }
};

export const version = '1.95.0 (simulada en probe)';

export const Uri = {
    file: p => ({ fsPath: p, path: p, scheme: 'file', toString: () => `file://${p}` }),
    joinPath: (base, ...partes) => ({
        fsPath: `${base.fsPath}/${partes.join('/')}`,
        path: `${base.path}/${partes.join('/')}`
    }),
    parse: u => ({ fsPath: u, path: u, scheme: 'file' })
};

export class EventEmitter {
    constructor() {
        this._oyentes = [];
        this.event = oyente => {
            this._oyentes.push(oyente);
            return disposable;
        };
    }
    fire(dato) {
        for (const oyente of this._oyentes) {
            oyente(dato);
        }
    }
    dispose() {}
}

export const ViewColumn = { Active: -1, Beside: -2, One: 1, Two: 2, Three: 3 };
export const ConfigurationTarget = { Global: 1, Workspace: 2, WorkspaceFolder: 3 };
export const RelativePattern = class {};

export default {
    window,
    workspace,
    commands,
    extensions,
    version,
    Uri,
    EventEmitter,
    ViewColumn,
    ConfigurationTarget,
    RelativePattern
};
