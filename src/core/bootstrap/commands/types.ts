/**
 * WP-V80 · tipos del registro declarativo de comandos.
 *
 * Una fila de tabla = id de comando + fábrica de handler. El FLUJO
 * (`extensionBootstrap.registerCommands`) inyecta `CommandDeps` y registra;
 * las tablas solo DECLARAN.
 */
import * as vscode from 'vscode';
import { ExtensionContext } from '../context';

/** Dependencias que el flujo inyecta a los handlers en el momento del registro. */
export interface CommandDeps {
    /**
     * Managers capturados al registrar (mismo objeto que capturaba el
     * monolito con `const { managers } = this.extensionContext`).
     */
    managers: ExtensionContext['managers'];
    /** Acceso VIVO al contexto (equivalente a `this.extensionContext`). */
    getContext(): ExtensionContext | undefined;
    /** Acceso VIVO al contexto de VS Code (equivalente a `this.vsCodeContext`). */
    getVsCodeContext(): vscode.ExtensionContext | undefined;
    /** Flujo del bootstrap: estado del sistema (comando system.showStatus). */
    showSystemStatus(): void;
    /** Flujo del bootstrap: reinicio (comando system.restart). */
    restartExtension(): Promise<void>;
}

/** Fila de la tabla de comandos. */
export interface CommandEntry {
    /** Id del comando tal como se registra en VS Code. */
    id: string;
    /** Fábrica del handler real; se evalúa una vez, al registrar. */
    handler(deps: CommandDeps): (...args: any[]) => any;
}
