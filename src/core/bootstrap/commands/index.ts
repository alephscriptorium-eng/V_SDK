/**
 * WP-V80 · tabla única de comandos del Zigurat.
 *
 * El orden de concatenación reproduce EXACTAMENTE el orden de registro del
 * monolito original (`extensionBootstrap.registerCommands`): webview ·
 * hacker/statusbar · analytics · process/demo/system · AI · teatro.refresh ·
 * catálogo/identidad/autoría/elenco · servidores mcptree · uis.refresh ·
 * teatro (agentes/panel) · gestión de agentes · sockets · aracne · configs.
 * El flujo del bootstrap consume `commandTable`; ningún módulo registra por
 * su cuenta.
 */
import { CommandEntry } from './types';
import { webviewCommands } from './webviewCommands';
import { hackerPanelCommands } from './hackerPanelCommands';
import { analyticsCommands } from './analyticsCommands';
import { processCommands } from './processCommands';
import { aiCommands } from './aiCommands';
import { teatroCoreCommands, teatroAgentCommands } from './teatroCommands';
import { mcpCatalogCommands, mcpServerCommands } from './mcpDomainCommands';
import { agentManagementCommands } from './agentManagementCommands';
import { uisCommands, socketCommands, aracneCommands, configsCommands } from './gamificationCommands';

export const commandTable: CommandEntry[] = [
    ...webviewCommands,
    ...hackerPanelCommands,
    ...analyticsCommands,
    ...processCommands,
    ...aiCommands,
    ...teatroCoreCommands,
    ...mcpCatalogCommands,
    ...mcpServerCommands,
    ...uisCommands,
    ...teatroAgentCommands,
    ...agentManagementCommands,
    ...socketCommands,
    ...aracneCommands,
    ...configsCommands
];

export { CommandDeps, CommandEntry } from './types';
