/**
 * WP-V80 · DATOS — tablas de comandos del dominio MCP:
 * catálogo (WP-V06), identidad + resources (WP-V07), autoría (WP-V08),
 * elenco (WP-V09) y servidores del árbol MCP.
 * Handlers transcritos literalmente del monolito.
 */
import * as vscode from 'vscode';
import { LogCategory } from '../../../loggingManager';
import { CatalogService } from '../../../launcher/CatalogService';
import { RoomIdentityService } from '../../../identity';
import { ResourceProjectionService } from '../../../resources';
import { AuthorshipService } from '../../../mutation';
import { RepartoElencoService } from '../../../elenco';
import { ExperienciaSession } from '../../../experiencia/view';
import { CommandEntry } from './types';

export const mcpCatalogCommands: CommandEntry[] = [
    // MCP Commands
    {
        id: 'aleph0.mcptree.refresh',
        handler: deps => async () => {
            try {
                const ctx = deps.getContext();
                if (ctx) {
                    const snap = await CatalogService.getInstance().refresh();
                    ctx.mcpTreeProvider.refresh();
                    ctx.logger.info(
                        `MCP catalog refresh: ${snap.availability} — ${snap.statusMessage}`
                    );
                    vscode.window.showInformationMessage(
                        snap.availability === 'ready'
                            ? `📡 Catálogo: ${snap.servers.length} servidor(es)`
                            : `⏳ ${snap.statusMessage}`
                    );
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'agents.refresh',
                    LogCategory.EXTENSION
                );
            }
        }
    },
    // WP-V07 · identidad + resources
    {
        id: 'aleph0.identity.join',
        handler: deps => async () => {
            const snap = await RoomIdentityService.getInstance().join();
            if (snap.availability === 'ready') {
                await ResourceProjectionService.getInstance().refresh();
                deps.getContext()?.mcpTreeProvider.refresh();
                vscode.window.showInformationMessage(`Identidad: ${snap.ssbId}`);
            } else {
                vscode.window.showWarningMessage(snap.statusMessage);
            }
        }
    },
    {
        id: 'aleph0.identity.refresh',
        handler: deps => async () => {
            const snap = await RoomIdentityService.getInstance().ensureFresh();
            if (snap.availability === 'ready') {
                await ResourceProjectionService.getInstance().refresh();
                deps.getContext()?.mcpTreeProvider.refresh();
                vscode.window.showInformationMessage(
                    `Identidad vigente: ${snap.ssbId} (join #${snap.joinCount})`
                );
            } else {
                vscode.window.showWarningMessage(snap.statusMessage);
            }
        }
    },
    {
        id: 'aleph0.resources.refresh',
        handler: deps => async () => {
            const snap = await ResourceProjectionService.getInstance().refresh();
            deps.getContext()?.mcpTreeProvider.refresh();
            vscode.window.showInformationMessage(
                snap.availability === 'ready'
                    ? snap.statusMessage
                    : snap.statusMessage
            );
        }
    },
    // WP-V08 · mutación + autoría (gate visible; motivos_deny desde runtime)
    {
        id: 'aleph0.authorship.refreshGate',
        handler: deps => async () => {
            const snap = await AuthorshipService.getInstance().refreshGate();
            deps.getContext()?.mcpTreeProvider.refresh();
            if (snap.availability === 'ready' && snap.gate) {
                const motivos = snap.gate.motivosDeny.join(' · ');
                vscode.window.showInformationMessage(
                    `${snap.statusMessage}${motivos ? ` · ${motivos}` : ''}`
                );
            } else {
                vscode.window.showWarningMessage(snap.statusMessage);
            }
        }
    },
    {
        id: 'aleph0.authorship.crearLinea',
        handler: deps => async () => {
            const auth = AuthorshipService.getInstance();
            await auth.refreshGate();
            const id = await vscode.window.showInputBox({
                prompt: 'id de línea (crear_linea)',
                placeHolder: 'juguete'
            });
            if (!id) {
                return;
            }
            const token = await vscode.window.showInputBox({
                prompt: 'approvalToken (ZEUS_MCP_APPROVAL_TOKEN)',
                password: true
            });
            if (token == null) {
                return;
            }
            const result = await auth.crearLinea({
                id,
                approve: true,
                approvalToken: token,
                includeSessionCard: true
            });
            deps.getContext()?.mcpTreeProvider.refresh();
            if (result.ok) {
                vscode.window.showInformationMessage(`crear_linea OK · ${id}`);
            } else {
                vscode.window.showErrorMessage(auth.formatDenyForUi(result), { modal: true });
            }
        }
    },
    {
        id: 'aleph0.authorship.exportStoryBoard',
        handler: deps => async () => {
            const auth = AuthorshipService.getInstance();
            await auth.refreshGate();
            const lineDir = await vscode.window.showInputBox({
                prompt: 'lineDir absoluto (export_story_board)',
                placeHolder: 'C:/path/to/LINEAS/juguete'
            });
            if (!lineDir) {
                return;
            }
            const token = await vscode.window.showInputBox({
                prompt: 'approvalToken (ZEUS_MCP_APPROVAL_TOKEN)',
                password: true
            });
            if (token == null) {
                return;
            }
            const result = await auth.exportStoryBoard({
                lineDir,
                approve: true,
                approvalToken: token,
                includeSessionCard: true
            });
            deps.getContext()?.mcpTreeProvider.refresh();
            if (result.ok) {
                vscode.window.showInformationMessage('export_story_board OK');
            } else {
                vscode.window.showErrorMessage(auth.formatDenyForUi(result), { modal: true });
            }
        }
    },
    // WP-V09 · elenco (reparto → cast-table); no toca V08
    {
        id: 'aleph0.elenco.refresh',
        handler: deps => async () => {
            const snap = await RepartoElencoService.getInstance().refresh();
            deps.getContext()?.elencoTreeProvider.refresh();
            vscode.window.showInformationMessage(snap.statusMessage);
        }
    },
    // RH-17 · experiencia H (resources + tools MCP; no Teatro)
    {
        id: 'aleph0.experiencia.refresh',
        handler: deps => async () => {
            const snap = await ExperienciaSession.getInstance().refresh();
            deps.getContext()?.experienciaTreeProvider.refresh();
            vscode.window.showInformationMessage(
                `${snap.phase}: ${snap.reason}`
            );
        }
    },
    {
        id: 'aleph0.experiencia.callTool',
        handler: deps => async () => {
            const session = ExperienciaSession.getInstance();
            await session.refresh();
            const tools = session.getTools();
            if (tools.length === 0) {
                vscode.window.showWarningMessage(
                    '⏳ sin tools MCP publicados (transport H <pendiente> o server sin tools)'
                );
                return;
            }
            const picked = await vscode.window.showQuickPick(
                tools.map((t) => ({
                    label: t.name,
                    description: t.description
                })),
                { placeHolder: 'Tool MCP publicado (comando = tool)' }
            );
            if (!picked) {
                return;
            }
            const result = await session.callPublishedTool(picked.label, {});
            deps.getContext()?.experienciaTreeProvider.refresh();
            if (result.ok) {
                vscode.window.showInformationMessage(result.message);
            } else {
                vscode.window.showWarningMessage(result.message);
            }
        }
    }
];

export const mcpServerCommands: CommandEntry[] = [
    {
        id: 'aleph0.mcptree.start',
        handler: deps => async (item?: any) => {
            try {
                const ctx = deps.getContext();
                if (ctx) {
                    const serverId = item?.id || item?.serverId || item?.label;
                    if (!serverId) {
                        vscode.window.showErrorMessage('No MCP server ID provided for start command');
                        return;
                    }

                    // Use the new startMCPServer method from mcpTreeProvider
                    await ctx.mcpTreeProvider.startMCPServer(serverId);

                    ctx.logger.info(`MCP Server ${serverId} start command executed`);
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'mcptree.start',
                    LogCategory.EXTENSION
                );
            }
        }
    },
    {
        id: 'aleph0.mcptree.stop',
        handler: deps => async (item?: any) => {
            try {
                const ctx = deps.getContext();
                if (ctx) {
                    const serverId = item?.id || item?.serverId || item?.label;
                    if (!serverId) {
                        vscode.window.showErrorMessage('No MCP server ID provided for stop command');
                        return;
                    }

                    // Use the new stopMCPServer method from mcpTreeProvider
                    await ctx.mcpTreeProvider.stopMCPServer(serverId);

                    ctx.logger.info(`MCP Server ${serverId} stop command executed`);
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'mcptree.stop',
                    LogCategory.EXTENSION
                );
            }
        }
    },
    {
        id: 'aleph0.mcptree.web.open',
        handler: deps => async (item?: any) => {
            try {
                const ctx = deps.getContext();
                if (ctx) {
                    let webId = item?.id || item?.webId || item?.label;
                    if (!webId) {
                        vscode.window.showErrorMessage('No MCP web ID provided for open command');
                        return;
                    }

                    // Remove the 'web-' prefix if present
                    if (webId.startsWith('web-')) {
                        webId = webId.replace('web-', '');
                    }

                    // Use the MCPWebViewManager to open the web interface
                    const success = await ctx.mcpWebViewManager.openMCPWeb(webId);

                    if (success) {
                        ctx.logger.info(`MCP Web ${webId} opened successfully`);
                    } else {
                        vscode.window.showErrorMessage(`Failed to open MCP Web ${webId}`);
                    }
                }
            } catch (error) {
                await deps.managers.errorBoundary.handleError(
                    error as Error,
                    'mcptree.web.open',
                    LogCategory.EXTENSION
                );
            }
        }
    }
];
