/**
 * WP-V80 · wire-up del bootstrap — construcción y ensamblaje de TODOS los
 * componentes del Zigurat en un `ExtensionContext`. Cuerpo movido literal
 * desde `extensionBootstrap.initialize`; el bootstrap orquesta, aquí se
 * construye.
 */
import * as vscode from 'vscode';
import { createStandardManagers } from '../managerFactory';
import { McpConfigurationManager } from '../mcpConfigurationManager';
import { TeatroTreeDataProvider } from '../../views/TeatroTreeDataProvider';
import { TeatroWebViewProvider } from '../../views/TeatroWebViewProvider';
import { HackerControlPanelProvider } from '../../views/HackerControlPanelProvider';
import { HackerCommandPanelProvider } from '../../views/HackerCommandPanelProvider';
import { HackerConfigPanelProvider } from '../../views/HackerConfigPanelProvider';
import { HackerTasksPanelProvider } from '../../views/HackerTasksPanelProvider';
import { HackerStatusBarManager } from '../HackerStatusBarManager';
import { AgentContentEditorProvider } from '../../editors/AgentContentEditorProvider';
import { AgentConfigEditorProvider } from '../../editors/AgentConfigEditorProvider';
// Gamification TreeDataProviders (First Era)
import { SocketsTreeDataProvider } from '../../treeViews/socketsTreeView';
import { UIsTreeDataProvider } from '../../treeViews/uisTreeView';
import { ConfigsTreeDataProvider } from '../../treeViews/configsTreeView';
import { LogsTreeDataProvider } from '../../treeViews/logsTreeView';
import { MCPTreeDataProvider } from '../../treeViews/mcpTreeView';
import { SocketMonitor } from '../../socketMonitor';
import { UIManager } from '../../uiManager';
import { MCPServerManager } from '../../mcpServerManager';
import { MCPWebViewManager } from '../../mcpWebViewManager';
import { AracneBotService } from '../AracneBotService';
import { CatalogService } from '../../launcher/CatalogService';
import { RoomIdentityService, IdentityStatusBar } from '../../identity';
import { ResourceProjectionService } from '../../resources';
import { AuthorshipService } from '../../mutation';
import { RepartoElencoService, ElencoTreeDataProvider } from '../../elenco';
import {
    ExperienciaSession,
    ExperienciaTreeDataProvider,
    ExperienciaWebViewProvider
} from '../../experiencia/view';
import { ExtensionContext } from './context';

export async function assembleExtensionContext(
    context: vscode.ExtensionContext,
    logger: ExtensionContext['logger']
): Promise<ExtensionContext> {
    // Initialize MCP Configuration Manager first
    const mcpConfigManager = McpConfigurationManager.getInstance();
    await mcpConfigManager.initialize();

    // Create all standard managers
    const managers = await createStandardManagers(context);

    // Initialize Teatro components
    const teatroTreeProvider = new TeatroTreeDataProvider();
    const teatroWebViewProvider = new TeatroWebViewProvider(context.extensionUri, context, teatroTreeProvider);
    const hackerControlPanelProvider = new HackerControlPanelProvider(context.extensionUri, context);
    const hackerCommandPanelProvider = new HackerCommandPanelProvider(context.extensionUri, context);
    const hackerConfigPanelProvider = new HackerConfigPanelProvider(context.extensionUri, context);
    const hackerTasksPanelProvider = new HackerTasksPanelProvider(context.extensionUri, context);

    // Initialize Hacker Status Bar Manager
    const hackerStatusBarManager = HackerStatusBarManager.getInstance();

    // Initialize Agent Editors
    const agentContentEditor = new AgentContentEditorProvider(context);
    const agentConfigEditor = new AgentConfigEditorProvider(context);

    // Initialize Gamification components (First Era Restoration)
    const socketMonitor = new SocketMonitor();
    const uiManager = new UIManager(managers.processManager);
    const mcpServerManager = new MCPServerManager(managers.processManager);
    const mcpWebViewManager = MCPWebViewManager.getInstance();
    const socketsTreeProvider = new SocketsTreeDataProvider(socketMonitor);
    const uisTreeProvider = new UIsTreeDataProvider(uiManager);
    const configsTreeProvider = new ConfigsTreeDataProvider();
    const logsTreeProvider = new LogsTreeDataProvider();
    const mcpTreeProvider = new MCPTreeDataProvider(mcpServerManager);

    // WP-V06: catálogo launcher en caliente (sin launcher → ⏳, no fatal)
    const catalogService = CatalogService.getInstance();
    catalogService.start();
    context.subscriptions.push(catalogService);

    // WP-V07: identidad (peer-card) + proyección resources MCP
    const identityService = RoomIdentityService.getInstance();
    const resourceService = ResourceProjectionService.getInstance();
    // WP-V08: autoría linea-editor (gate + motivos_deny desde editor://info)
    const authorshipService = AuthorshipService.getInstance();
    const identityStatusBar = new IdentityStatusBar(identityService);
    context.subscriptions.push(
        identityService,
        resourceService,
        authorshipService,
        identityStatusBar
    );
    // Join diferido: sin settings → ⏳; no inventa room/mesh.
    void identityService.join().then(async (snap) => {
        if (snap.availability === 'ready') {
            await resourceService.refresh();
        }
        // Gate autoría: sin linea-editor → ⏳ (no fatal)
        await authorshipService.refreshGate();
    });

    // WP-V09: elenco desde reparto/1 (cast-table); SEPARADO de ICompany/teatro
    const elencoService = RepartoElencoService.getInstance();
    const elencoTreeProvider = new ElencoTreeDataProvider(elencoService);
    context.subscriptions.push(elencoService, elencoTreeProvider);
    void elencoService.refresh();

    // RH-17: vista experiencia H (TreeView + webview); Teatro hardcodeado fuera
    const experienciaSession = ExperienciaSession.getInstance();
    const experienciaTreeProvider = new ExperienciaTreeDataProvider(experienciaSession);
    const experienciaWebViewProvider = new ExperienciaWebViewProvider(
        context.extensionUri,
        experienciaSession
    );
    context.subscriptions.push(
        experienciaSession,
        experienciaTreeProvider,
        experienciaWebViewProvider
    );
    void experienciaSession.refresh();

    // Initialize AracneBot - Socket.IO client for mesh communication
    const aracneBotService = AracneBotService.getInstance();
    aracneBotService.initialize({
        socketUrl: mcpConfigManager.getDefaultSocketUrl(),
        botName: 'vscode-extension',
        autoConnect: false // Will connect when user triggers or on demand
    });

    return {
        managers: {
            factory: managers.factory,
            errorBoundary: managers.errorBoundary,
            config: managers.configService,
            logging: managers.loggingManager,
            process: managers.processManager,
            webView: managers.webViewManager,
            commandPalette: managers.commandPaletteManager,
            analytics: managers.analyticsService,
            aiAssistant: managers.aiAssistantService
        },
        // Segunda Época - Teatralización
        teatroTreeProvider,
        teatroWebViewProvider,
        hackerControlPanelProvider,
        hackerCommandPanelProvider,
        hackerConfigPanelProvider,
        hackerTasksPanelProvider,
        hackerStatusBarManager,
        agentContentEditor,
        agentConfigEditor,
        // Primera Época - Socket.io Gamification
        socketMonitor,
        socketsTreeProvider,
        uisTreeProvider,
        configsTreeProvider,
        logsTreeProvider,
        mcpTreeProvider,
        mcpWebViewManager,
        aracneBotService,
        elencoTreeProvider,
        experienciaTreeProvider,
        experienciaWebViewProvider,
        logger
    };
}
