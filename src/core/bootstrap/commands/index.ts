/**
 * WP-V80 · tabla única de comandos del Zigurat.
 *
 * El orden de concatenación reproduce EXACTAMENTE el orden de registro del
 * monolito original (`extensionBootstrap.registerCommands`). El flujo del
 * bootstrap consume `commandTable`; ningún módulo registra por su cuenta.
 */
import { CommandEntry } from './types';
import { webviewCommands } from './webviewCommands';
import { hackerPanelCommands } from './hackerPanelCommands';
import { analyticsCommands } from './analyticsCommands';
import { processCommands } from './processCommands';
import { aiCommands } from './aiCommands';

export const commandTable: CommandEntry[] = [
    ...webviewCommands,
    ...hackerPanelCommands,
    ...analyticsCommands,
    ...processCommands,
    ...aiCommands
];

export { CommandDeps, CommandEntry } from './types';
