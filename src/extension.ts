import * as vscode from 'vscode';
import { ExtensionBootstrap } from './core/extensionBootstrap';
import { LogCategory } from './loggingManager';
import { getLogger, disposeStructuredLog } from './core/logging';

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
    } finally {
        // WP-V71: el canal es un recurso propio de la extensión; se cierra
        // en el último suspiro, después de la última línea de ambos caminos.
        disposeStructuredLog();
    }
}
