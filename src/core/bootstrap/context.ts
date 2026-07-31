/**
 * WP-V80 · DATOS del bootstrap — forma del contexto de la extensión.
 *
 * Destino canónico único de la interfaz `ExtensionContext` (antes definida
 * inline en `src/core/extensionBootstrap.ts`). El bootstrap la consume; no
 * la redefine ni la re-exporta.
 */
import { ManagerFactory } from '../managerFactory';
import { ConfigurationService } from '../configurationService';
import { ErrorBoundary } from '../errorBoundary';
import { AnalyticsService } from '../analyticsService';
import { AIAssistantService } from '../aiAssistantService';
import { LoggingManager, createLogger } from '../../loggingManager';
import { ProcessManager } from '../../processManager';
import { WebViewManager } from '../../webViewManager';
import { CommandPaletteManager } from '../../commandPaletteManager';
import { TeatroTreeDataProvider } from '../../views/TeatroTreeDataProvider';
import { TeatroWebViewProvider } from '../../views/TeatroWebViewProvider';
import { HackerControlPanelProvider } from '../../views/HackerControlPanelProvider';
import { HackerCommandPanelProvider } from '../../views/HackerCommandPanelProvider';
import { HackerConfigPanelProvider } from '../../views/HackerConfigPanelProvider';
import { HackerTasksPanelProvider } from '../../views/HackerTasksPanelProvider';
import { HackerStatusBarManager } from '../HackerStatusBarManager';
import { AgentContentEditorProvider } from '../../editors/AgentContentEditorProvider';
import { AgentConfigEditorProvider } from '../../editors/AgentConfigEditorProvider';
import { SocketsTreeDataProvider } from '../../treeViews/socketsTreeView';
import { UIsTreeDataProvider } from '../../treeViews/uisTreeView';
import { ConfigsTreeDataProvider } from '../../treeViews/configsTreeView';
import { LogsTreeDataProvider } from '../../treeViews/logsTreeView';
import { MCPTreeDataProvider } from '../../treeViews/mcpTreeView';
import { SocketMonitor } from '../../socketMonitor';
import { MCPWebViewManager } from '../../mcpWebViewManager';
import { AracneBotService } from '../AracneBotService';
import { ElencoTreeDataProvider } from '../../elenco';

export interface ExtensionContext {
    managers: {
        factory: ManagerFactory;
        errorBoundary: ErrorBoundary;
        config: ConfigurationService;
        logging: LoggingManager;
        process: ProcessManager;
        webView: WebViewManager;
        commandPalette: CommandPaletteManager;
        analytics: AnalyticsService;
        aiAssistant: AIAssistantService;
    };
    // Segunda Época - Teatralización
    // WP-V13 (DV-11): chatParticipant/theatricalChat podados; re-lore a wishlist
    teatroTreeProvider: TeatroTreeDataProvider;
    teatroWebViewProvider: TeatroWebViewProvider;
    hackerControlPanelProvider: HackerControlPanelProvider;
    hackerCommandPanelProvider: HackerCommandPanelProvider;
    hackerConfigPanelProvider: HackerConfigPanelProvider;
    hackerTasksPanelProvider: HackerTasksPanelProvider;
    hackerStatusBarManager: HackerStatusBarManager;
    agentContentEditor: AgentContentEditorProvider;
    agentConfigEditor: AgentConfigEditorProvider;
    // Primera Época - Socket.io Gamification
    socketMonitor: SocketMonitor;
    socketsTreeProvider: SocketsTreeDataProvider;
    uisTreeProvider: UIsTreeDataProvider;
    configsTreeProvider: ConfigsTreeDataProvider;
    logsTreeProvider: LogsTreeDataProvider;
    mcpTreeProvider: MCPTreeDataProvider;
    mcpWebViewManager: MCPWebViewManager;
    aracneBotService: AracneBotService;
    /** WP-V09 · panel elenco (reparto/1 → cast-table); SEPARADO de ICompany */
    elencoTreeProvider: ElencoTreeDataProvider;
    logger: ReturnType<typeof createLogger>;
}
