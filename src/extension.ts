import * as vscode from 'vscode';
import { ExtensionBootstrap } from './core/extensionBootstrap';
import { LogCategory } from './loggingManager';
import { getLogger } from './core/logging';

/** WP-V71 · primer emisor del arranque: precede a cualquier manager. */
const log = getLogger('extension', LogCategory.EXTENSION);

// Global extension bootstrap instance
let extensionBootstrap: ExtensionBootstrap | undefined;

/**
 * VS Code extension activation function
 */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
    log.info('AlephScript Extension is activating...');

    try {
        // Initialize extension bootstrap using getInstance
        extensionBootstrap = ExtensionBootstrap.getInstance();

        // Initialize with VS Code context
        await extensionBootstrap.initialize(context);

        log.info('AlephScript Extension activated successfully!');

    } catch (error) {
        log.error('Failed to activate AlephScript Extension', { error });
        vscode.window.showErrorMessage(`Failed to activate AlephScript Extension: ${error}`);
        throw error;
    }
}

/**
 * VS Code extension deactivation function
 */
export async function deactivate(): Promise<void> {
    log.info('AlephScript Extension is deactivating...');

    try {
        if (extensionBootstrap) {
            await extensionBootstrap.dispose();
            extensionBootstrap = undefined;
        }

        log.info('AlephScript Extension deactivated successfully!');

    } catch (error) {
        log.error('Error during extension deactivation', { error });
        throw error;
    }

    // WP-V71 (corrección de devolución, D6) · EL CANAL NO SE CIERRA AQUÍ, y es
    // una decisión, no un olvido.
    //
    // La primera versión hacía `disposeStructuredLog()` en un `finally`. Eso
    // retira el canal del desplegable de «Output» **con todo su contenido**, así
    // que en un «Reload Window» —o justo después de un fallo de desactivación—
    // el operador pierde el log en el instante exacto en que iba a copiarlo a un
    // issue. Y ese log es el entregable central de este WP (CA2: depurable en
    // máquina ajena). El `console.log` que sustituimos sobrevivía en el log del
    // Extension Host; degradar eso sería un retroceso.
    //
    // No hay fuga que justifique el cierre: un `OutputChannel` no es un proceso,
    // ni un puerto, ni un descriptor de fichero — es un panel de texto que VS
    // Code destruye solo al terminar el host, que es justo lo que viene después
    // de `deactivate`. Cerrarlo a mano solo ADELANTA la pérdida.
    //
    // Por eso tampoco se registra en `context.subscriptions`: eso lo cerraría
    // por la puerta de atrás. `disposeStructuredLog()` sigue exportado para los
    // tests y para el futuro comando de limpieza (ver §7 del reporte).
}
