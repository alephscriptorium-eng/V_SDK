/**
 * WP-V80 · tabla única de comandos del Zigurat.
 *
 * El orden de concatenación reproduce EXACTAMENTE el orden de registro del
 * monolito original (`extensionBootstrap.registerCommands`): webview ·
 * hacker/statusbar · analytics · process/demo/system · AI · teatro.refresh ·
 * catálogo/identidad/autoría/elenco · servidores mcptree · uis.refresh ·
 * teatro (agentes/panel) · gestión de agentes · sockets · aracne · configs.
 * WP-V25 añade la tabla `logs` al final.
 *
 * WP-V25 · CORRECCIÓN DE UNA CITA RANCIA. Aquí ponía «ningún módulo registra
 * por su cuenta», y era FALSO ya cuando se escribió: `CommandPaletteManager`
 * (`src/commandPaletteManager.ts`) llama a `vscode.commands.registerCommand`
 * desde su propio constructor y registra 16 comandos que NO pasan por esta
 * tabla. Quien cuente comandos leyendo sólo `commandTable` contará mal, así
 * que el censo automático —`tests/unit/core/bootstrap/commands/
 * censoComandos.test.ts`— cruza LAS DOS fuentes contra `package.json`.
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
import { logsCommands } from './logsCommands';

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
    ...configsCommands,
    // WP-V25 · tabla nueva, AL FINAL a propósito: así los 56 ids que dejó V80
    // conservan su orden relativo exacto dentro de `commandTable`, y eso se
    // demuestra —no se afirma— en `tests/unit/core/bootstrap/commands/
    // censoComandos.test.ts` («los 56 de V80, en su orden»).
    ...logsCommands
];

export { CommandDeps, CommandEntry } from './types';
