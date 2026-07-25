import * as vscode from 'vscode';
import { createStandardManagers, ManagerFactory } from './managerFactory';
import { ConfigurationService } from './configurationService';
import { ErrorBoundary } from './errorBoundary';
import { AnalyticsService, AnalyticsEventType } from './analyticsService';
import { AIAssistantService, AICapability, AIInteractionType } from './aiAssistantService';
import { LoggingManager, LogCategory, LogLevel, createLogger } from '../loggingManager';
import { ProcessManager } from '../processManager';
import { WebViewManager } from '../webViewManager';
import { CommandPaletteManager } from '../commandPaletteManager';
import { McpChatParticipant } from '../mcpChatParticipant';
import { TheatricalChatManager } from '../theatrical/TheatricalChatManager';
import { TeatroTreeDataProvider } from '../views/TeatroTreeDataProvider';
import { TeatroWebViewProvider } from '../views/TeatroWebViewProvider';
import { HackerControlPanelProvider } from '../views/HackerControlPanelProvider';
import { HackerCommandPanelProvider } from '../views/HackerCommandPanelProvider';
import { HackerConfigPanelProvider } from '../views/HackerConfigPanelProvider';
import { HackerTasksPanelProvider } from '../views/HackerTasksPanelProvider';
import { HackerStatusBarManager } from './HackerStatusBarManager';
import { AgentContentEditorProvider } from '../editors/AgentContentEditorProvider';
import { ConfigurationCommandsService } from './configurationCommandsService';
import { AgentConfigEditorProvider } from '../editors/AgentConfigEditorProvider';
import { McpConfigurationManager } from './mcpConfigurationManager';
// Gamification TreeDataProviders (First Era)
import { SocketsTreeDataProvider } from '../treeViews/socketsTreeView';
import { UIsTreeDataProvider } from '../treeViews/uisTreeView';
import { ConfigsTreeDataProvider } from '../treeViews/configsTreeView';
import { LogsTreeDataProvider } from '../treeViews/logsTreeView';
import { MCPTreeDataProvider } from '../treeViews/mcpTreeView';
import { SocketMonitor } from '../socketMonitor';
import { UIManager } from '../uiManager';
import { MCPServerManager } from '../mcpServerManager';
import { MCPWebViewManager } from '../mcpWebViewManager';
import { AracneBotService } from './AracneBotService';
import { CatalogService } from '../launcher/CatalogService';
import { RoomIdentityService, IdentityStatusBar } from '../identity';
import { ResourceProjectionService } from '../resources';
import { AuthorshipService } from '../mutation';
import { RepartoElencoService, ElencoTreeDataProvider } from '../elenco';
// WISH-01/02/03: Copilot Log Exporter
import { registerCopilotLogCommands } from '../copilotLogs/commands';
import { CopilotMetricsPanelProvider, getCopilotLogExporterService } from '../copilotLogs';

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
    chatParticipant: McpChatParticipant;
    theatricalChat: TheatricalChatManager;
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

export class ExtensionBootstrap {
    private static instance: ExtensionBootstrap;
    private extensionContext?: ExtensionContext;
    private vsCodeContext?: vscode.ExtensionContext;

    private constructor() {}

    static getInstance(): ExtensionBootstrap {
        if (!ExtensionBootstrap.instance) {
            ExtensionBootstrap.instance = new ExtensionBootstrap();
        }
        return ExtensionBootstrap.instance;
    }

    /**
     * Initializes the extension with all managers and core services
     */
    async initialize(context: vscode.ExtensionContext): Promise<ExtensionContext> {
        this.vsCodeContext = context;
        
        const logger = createLogger(LogCategory.EXTENSION, 'Bootstrap');
        const startTime = Date.now();
        logger.info('AlephScript extension activation started');

        try {
            // Initialize MCP Configuration Manager first
            const mcpConfigManager = McpConfigurationManager.getInstance();
            await mcpConfigManager.initialize();
            
            // Create all standard managers
            const managers = await createStandardManagers(context);
            
            // Initialize the MCP Chat Participant
            const chatParticipant = new McpChatParticipant(context);
            
            // Initialize Theatrical Chat Manager (Teatro VS Code)
            const theatricalChat = new TheatricalChatManager(context);
            
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
            
            // Initialize AracneBot - Socket.IO client for mesh communication
            const aracneBotService = AracneBotService.getInstance();
            aracneBotService.initialize({
                socketUrl: mcpConfigManager.getDefaultSocketUrl(),
                botName: 'vscode-extension',
                autoConnect: false // Will connect when user triggers or on demand
            });
            
            this.extensionContext = {
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
                chatParticipant,
                theatricalChat,
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
                logger
            };

            // Initialize core services
            await this.initializeCoreServices();
            
            // Initialize Hacker Status Bar (must be after core services)
            this.extensionContext.hackerStatusBarManager.initialize(context);
            logger.info('🚀 Hacker Status Bar initialized');
            
            // Initialize Theatrical Chat Participants (Teatro VS Code)
            await this.extensionContext.theatricalChat.initialize();
            logger.info('🎭 Theatrical Chat Participants initialized');
            
            // Log AracneBot initialization (connects on demand)
            logger.info('🕷️ AracneBot initialized - ready to connect to mesh');
            
            // Track extension activation
            await this.extensionContext.managers.analytics.trackEvent(
                AnalyticsEventType.EXTENSION_ACTIVATED,
                'extension',
                {
                    activation_time: Date.now() - startTime,
                    context_type: 'vscode_extension',
                    managers_count: Object.keys(this.extensionContext.managers).length
                }
            );
            
            // Register all commands
            await this.registerCommands();
            
            // Setup TreeViews
            await this.setupTreeViews();
            
            // Initialize auto-start if configured
            await this.handleAutoStart();

            logger.info('AlephScript extension activation completed successfully');
            
            if (!this.extensionContext) {
                throw new Error('Extension context not initialized');
            }
            
            return this.extensionContext;

        } catch (error) {
            const errorMessage = `Failed to initialize AlephScript extension: ${error}`;
            logger.error(errorMessage);
            
            // Try to show error to user
            try {
                vscode.window.showErrorMessage(errorMessage, 'Show Details').then(selection => {
                    if (selection === 'Show Details') {
                        logger.error('Extension initialization failed', error);
                    }
                });
            } catch (uiError) {
                console.error('Failed to show error UI:', uiError);
            }

            throw error;
        }
    }

    /**
     * Initializes core services
     */
    private async initializeCoreServices(): Promise<void> {
        if (!this.extensionContext) throw new Error('Extension context not initialized');
        
        const { managers } = this.extensionContext;
        
        // Configure logging based on user settings
        const logLevel = managers.config.get('logging.level');
        const enabledCategories = managers.config.get('logging.enabledCategories');
        
        managers.logging.setLogLevelFromString(logLevel);
        managers.logging.setEnabledCategories(this.stringArrayToLogCategories(enabledCategories));

        // Setup error handling
        managers.errorBoundary; // Just initialize it

        this.extensionContext.logger.info('Core services initialized');
    }

    /**
     * Registers all extension commands
     */
    private async registerCommands(): Promise<void> {
        if (!this.extensionContext || !this.vsCodeContext) {
            throw new Error('Extension context not initialized');
        }

        const { managers } = this.extensionContext;
        const commands: vscode.Disposable[] = [];

        // WebView commands
        commands.push(
            vscode.commands.registerCommand('alephscript.webview.showDashboard', () => {
                const panel = vscode.window.createWebviewPanel(
                    'webview-dashboard',
                    'WebView Dashboard',
                    vscode.ViewColumn.One,
                    { enableScripts: true }
                );
                panel.webview.html = '<h1>WebView Dashboard</h1><p>WebView management interface</p>';
            }),

            vscode.commands.registerCommand('alephscript.webview.openWebRTC', async () => {
                try {
                    const config = managers.webView.getWebRTCConfig();
                    const webview = await managers.webView.createWebView(config);
                    if (webview) {
                        vscode.window.showInformationMessage('WebRTC UI opened successfully');
                    } else {
                        vscode.window.showErrorMessage('Failed to open WebRTC UI');
                    }
                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error, 
                        'webview.openWebRTC', 
                        LogCategory.WEBVIEW
                    );
                }
            }),

            vscode.commands.registerCommand('alephscript.webview.openThreeJS', async () => {
                try {
                    const config = managers.webView.getThreeJSConfig();
                    const webview = await managers.webView.createWebView(config);
                    if (webview) {
                        vscode.window.showInformationMessage('ThreeJS UI opened successfully');
                    } else {
                        vscode.window.showErrorMessage('Failed to open ThreeJS UI');
                    }
                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error, 
                        'webview.openThreeJS', 
                        LogCategory.WEBVIEW
                    );
                }
            }),

            vscode.commands.registerCommand('alephscript.webview.openSocket', async () => {
                try {
                    const config = managers.webView.getSocketWebAppConfig();
                    const webview = await managers.webView.createWebView(config);
                    if (webview) {
                        vscode.window.showInformationMessage('Socket WebApp opened successfully');
                    } else {
                        vscode.window.showErrorMessage('Failed to open Socket WebApp');
                    }
                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error, 
                        'webview.openSocket', 
                        LogCategory.WEBVIEW
                    );
                }
            }),

            vscode.commands.registerCommand('alephscript.webview.openDriver', async () => {
                try {
                    const config = managers.webView.getDriverUIConfig();
                    const webview = await managers.webView.createWebView(config);
                    if (webview) {
                        vscode.window.showInformationMessage('Driver UI opened successfully');
                    } else {
                        vscode.window.showErrorMessage('Failed to open Driver UI');
                    }
                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error, 
                        'webview.openDriver', 
                        LogCategory.WEBVIEW
                    );
                }
            }),

            vscode.commands.registerCommand('alephscript.webview.reloadAll', async () => {
                try {
                    const webviews = managers.webView.getAllWebViews();
                    const reloadPromises = webviews.map((w: any) => managers.webView.reloadWebView(w.id));
                    const results = await Promise.all(reloadPromises);
                    const successCount = results.filter((r: any) => r).length;
                    vscode.window.showInformationMessage(`Reloaded ${successCount} of ${webviews.length} webviews`);
                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error, 
                        'webview.reloadAll', 
                        LogCategory.WEBVIEW
                    );
                }
            }),

            // Hacker Control Panel Commands
            vscode.commands.registerCommand('alephscript.hackerControlPanel.toggle', async () => {
                try {
                    // Focus the hacker control panel view
                    await vscode.commands.executeCommand('alephscript.hackerControlPanel.focus');
                    vscode.window.showInformationMessage('🚀 Neural Control Matrix activated');
                    
                    // Update status bar to indicate active panel
                    if (this.extensionContext?.hackerStatusBarManager) {
                        this.extensionContext.hackerStatusBarManager.updateButtonStates(['control']);
                    }
                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error,
                        'hackerControlPanel.toggle',
                        LogCategory.EXTENSION
                    );
                }
            }),

            vscode.commands.registerCommand('alephscript.hackerCommandPanel.toggle', async () => {
                try {
                    // Focus the hacker command panel view
                    await vscode.commands.executeCommand('alephscript.hackerCommandPanel.focus');
                    vscode.window.showInformationMessage('⚡ Command Terminal activated');
                    
                    // Update status bar to indicate active panel
                    if (this.extensionContext?.hackerStatusBarManager) {
                        this.extensionContext.hackerStatusBarManager.updateButtonStates(['command']);
                    }
                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error,
                        'hackerCommandPanel.toggle',
                        LogCategory.EXTENSION
                    );
                }
            }),

            vscode.commands.registerCommand('alephscript.hackerConfigPanel.toggle', async () => {
                try {
                    // Focus the hacker config panel view
                    await vscode.commands.executeCommand('alephscript.hackerConfigPanel.focus');
                    vscode.window.showInformationMessage('⚙️ Config Matrix activated');
                    
                    // Update status bar to indicate active panel
                    if (this.extensionContext?.hackerStatusBarManager) {
                        this.extensionContext.hackerStatusBarManager.updateButtonStates(['config']);
                    }
                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error,
                        'hackerConfigPanel.toggle',
                        LogCategory.EXTENSION
                    );
                }
            }),

            // ===== Hacker Tasks Panel Commands =====
            vscode.commands.registerCommand('alephscript.hackerTasksPanel.toggle', async () => {
                try {
                    await vscode.commands.executeCommand('alephscript.hackerTasksPanel.focus');
                    vscode.window.showInformationMessage('📋 Tasks Runner activated');
                    
                    if (this.extensionContext?.hackerStatusBarManager) {
                        this.extensionContext.hackerStatusBarManager.updateButtonStates(['tasks']);
                    }
                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error,
                        'hackerTasksPanel.toggle',
                        LogCategory.EXTENSION
                    );
                }
            }),

            vscode.commands.registerCommand('alephscript.hackerTasksPanel.refresh', async () => {
                try {
                    if (this.extensionContext?.hackerTasksPanelProvider) {
                        await this.extensionContext.hackerTasksPanelProvider.refresh();
                        vscode.window.showInformationMessage('🔄 Tasks refreshed');
                    }
                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error,
                        'hackerTasksPanel.refresh',
                        LogCategory.EXTENSION
                    );
                }
            }),

            vscode.commands.registerCommand('alephscript.hackerTasksPanel.runDefault', async () => {
                try {
                    // Execute the default build task
                    await vscode.commands.executeCommand('workbench.action.tasks.build');
                    vscode.window.showInformationMessage('▶️ Running default build task...');
                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error,
                        'hackerTasksPanel.runDefault',
                        LogCategory.EXTENSION
                    );
                }
            }),

            vscode.commands.registerCommand('alephscript.hackerTasksPanel.stopAll', async () => {
                try {
                    // Terminate all running tasks
                    await vscode.commands.executeCommand('workbench.action.tasks.terminate');
                    vscode.window.showInformationMessage('⏹️ All tasks stopped');
                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error,
                        'hackerTasksPanel.stopAll',
                        LogCategory.EXTENSION
                    );
                }
            }),

            // Hacker Status Bar Commands
            vscode.commands.registerCommand('alephscript.statusBar.animate', async () => {
                try {
                    if (this.extensionContext?.hackerStatusBarManager) {
                        this.extensionContext.hackerStatusBarManager.animateButtons();
                        this.extensionContext.hackerStatusBarManager.showMessage('🚀 Neural Interface Synchronized');
                    }
                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error,
                        'statusBar.animate',
                        LogCategory.EXTENSION
                    );
                }
            }),

            vscode.commands.registerCommand('alephscript.statusBar.toggle', async () => {
                try {
                    if (this.extensionContext?.hackerStatusBarManager) {
                        const config = vscode.workspace.getConfiguration('alephscript');
                        const isVisible = config.get<boolean>('statusBar.visible', true);
                        const newVisibility = !isVisible;
                        
                        await config.update('statusBar.visible', newVisibility, vscode.ConfigurationTarget.Global);
                        this.extensionContext.hackerStatusBarManager.setVisible(newVisibility);
                        
                        vscode.window.showInformationMessage(
                            newVisibility ? '🚀 Hacker Status Bar Enabled' : '💫 Hacker Status Bar Disabled'
                        );
                    }
                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error,
                        'statusBar.toggle',
                        LogCategory.EXTENSION
                    );
                }
            }),

            // Analytics Commands
            vscode.commands.registerCommand('alephscript.analytics.showDashboard', async () => {
                if (!this.extensionContext) return;
                
                const tracker = this.extensionContext.managers.analytics.startTracking('analytics_dashboard_open');
                try {
                    const aggregation = await this.extensionContext.managers.analytics.getAnalyticsAggregation();
                    
                    const panel = vscode.window.createWebviewPanel(
                        'analytics-dashboard',
                        'AlephScript Analytics',
                        vscode.ViewColumn.One,
                        { enableScripts: true }
                    );
                    
                    panel.webview.html = this.generateAnalyticsDashboard(aggregation);
                    
                    await this.extensionContext.managers.analytics.trackEvent(
                        AnalyticsEventType.WEBVIEW_OPENED,
                        'analytics',
                        { webview_type: 'analytics_dashboard' }
                    );
                    
                    await tracker(true);
                } catch (error) {
                    await tracker(false, (error as Error).message);
                    throw error;
                }
            }),

            vscode.commands.registerCommand('alephscript.analytics.export', async () => {
                if (!this.extensionContext) return;
                
                const tracker = this.extensionContext.managers.analytics.startTracking('analytics_export');
                try {
                    const exportData = await this.extensionContext.managers.analytics.exportAnalytics();
                    
                    const uri = await vscode.window.showSaveDialog({
                        defaultUri: vscode.Uri.file(`alephscript-analytics-${Date.now()}.json`),
                        filters: { 'JSON Files': ['json'] }
                    });
                    
                    if (uri) {
                        await vscode.workspace.fs.writeFile(uri, Buffer.from(exportData, 'utf8'));
                        vscode.window.showInformationMessage(`Analytics exported to ${uri.fsPath}`);
                        
                        await this.extensionContext.managers.analytics.trackEvent(
                            AnalyticsEventType.USER_INTERACTION,
                            'analytics',
                            { action: 'export', file_path: uri.fsPath }
                        );
                        
                        await tracker(true);
                    } else {
                        await tracker(false, 'Export cancelled');
                    }
                } catch (error) {
                    await tracker(false, (error as Error).message);
                    throw error;
                }
            }),

            vscode.commands.registerCommand('alephscript.analytics.clear', async () => {
                if (!this.extensionContext) return;
                
                const tracker = this.extensionContext.managers.analytics.startTracking('analytics_clear');
                try {
                    const confirmation = await vscode.window.showWarningMessage(
                        'Are you sure you want to clear all analytics data?',
                        { modal: true },
                        'Yes, Clear Data'
                    );
                    
                    if (confirmation === 'Yes, Clear Data') {
                        await this.extensionContext.managers.analytics.clearAnalytics();
                        vscode.window.showInformationMessage('Analytics data cleared successfully');
                        
                        await this.extensionContext.managers.analytics.trackEvent(
                            AnalyticsEventType.USER_INTERACTION,
                            'analytics',
                            { action: 'clear_data' }
                        );
                        
                        await tracker(true);
                    } else {
                        await tracker(false, 'Clear cancelled');
                    }
                } catch (error) {
                    await tracker(false, (error as Error).message);
                    throw error;
                }
            }),

            // Process management commands
            vscode.commands.registerCommand('alephscript.process.startLauncher', async () => {
                try {
                    const configPath = managers.config.get('process.configPath');
                    if (!configPath) {
                        const result = await vscode.window.showOpenDialog({
                            canSelectFiles: true,
                            canSelectFolders: false,
                            canSelectMany: false,
                            filters: { 'JSON Files': ['json'] }
                        });
                        
                        if (result && result[0]) {
                            await managers.process.startLauncher(result[0].fsPath);
                        }
                    } else {
                        await managers.process.startLauncher(configPath);
                    }
                    vscode.window.showInformationMessage('Launcher started successfully');
                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error, 
                        'process.startLauncher', 
                        LogCategory.PROCESS
                    );
                }
            }),

            vscode.commands.registerCommand('alephscript.process.stopLauncher', async () => {
                try {
                    await managers.process.stopLauncher();
                    vscode.window.showInformationMessage('Launcher stopped successfully');
                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error, 
                        'process.stopLauncher', 
                        LogCategory.PROCESS
                    );
                }
            }),

            // Demo commands - Run All Servers (DEMO-1.0.0-F002)
            vscode.commands.registerCommand('alephscript.demo.runAll', async () => {
                try {
                    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
                    if (!workspaceRoot) {
                        vscode.window.showErrorMessage('No workspace folder found');
                        return;
                    }
                    
                    const terminals: { name: string; cwd: string; command: string }[] = [
                        { name: '🌐 Jekyll Site', cwd: `${workspaceRoot}`, command: './scripts/serve-site.sh' },
                        { name: '🚀 MCP Launcher', cwd: `${workspaceRoot}/MCPGallery`, command: 'npm run start:launcher' },
                        { name: '🤖 MCP Model', cwd: `${workspaceRoot}/MCPGallery`, command: 'npm run start:model' },
                        { name: '⚡ Zeus', cwd: `${workspaceRoot}/MCPGallery`, command: 'npm run start:zeus' },
                        { name: '📝 Novelist', cwd: `${workspaceRoot}/NovelistEditor`, command: 'npm start' },
						{ name: '📝 Novelist UI', cwd: `${workspaceRoot}/NovelistEditor`, command: 'npm run docs:serve' }
                    ];
                    
                    for (const config of terminals) {
                        const terminal = vscode.window.createTerminal({
                            name: config.name,
                            cwd: config.cwd
                        });
                        terminal.show(false);
                        terminal.sendText(config.command);
                    }
                    
                    vscode.window.showInformationMessage('🎬 All 5 demo servers started!');
                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error,
                        'demo.runAll',
                        LogCategory.PROCESS
                    );
                }
            }),
            
            vscode.commands.registerCommand('alephscript.demo.stopAll', async () => {
                try {
                    const demoTerminals = vscode.window.terminals.filter(t => 
                        ['🌐 Jekyll Site', '🚀 MCP Launcher', '🤖 MCP Model', '⚡ Zeus', '📝 Novelist'].includes(t.name)
                    );
                    
                    for (const terminal of demoTerminals) {
                        terminal.dispose();
                    }
                    
                    vscode.window.showInformationMessage(`🛑 Stopped ${demoTerminals.length} demo servers`);
                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error,
                        'demo.stopAll',
                        LogCategory.PROCESS
                    );
                }
            }),

            // System commands
            vscode.commands.registerCommand('alephscript.system.showStatus', () => {
                this.showSystemStatus();
            }),

            vscode.commands.registerCommand('alephscript.system.restart', async () => {
                try {
                    await this.restartExtension();
                    vscode.window.showInformationMessage('AlephScript extension restarted successfully');
                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error, 
                        'system.restart', 
                        LogCategory.EXTENSION
                    );
                }
            }),

            // AI Assistant commands
            vscode.commands.registerCommand('alephscript.ai.askAssistant', async () => {
                try {
                    const input = await vscode.window.showInputBox({
                        prompt: 'Ask the AI Assistant a question',
                        placeHolder: 'e.g., How can I optimize my code?'
                    });
                    
                    if (input) {
                        const response = await managers.aiAssistant.processRequest({
                            id: Date.now().toString(),
                            type: AIInteractionType.CHAT,
                            capability: AICapability.COMMAND_SUGGESTION,
                            context: {
                                workspace: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath,
                                activeFile: vscode.window.activeTextEditor?.document.uri.fsPath,
                                userIntent: input
                            },
                            data: {
                                query: input,
                                editor_language: vscode.window.activeTextEditor?.document.languageId
                            },
                            timestamp: new Date().toISOString(),
                            session_id: 'default'
                        });
                        
                        const panel = vscode.window.createWebviewPanel(
                            'ai-assistant-response',
                            'AI Assistant Response',
                            vscode.ViewColumn.Two,
                            { enableScripts: true }
                        );
                        
                        panel.webview.html = `
                            <html>
                            <head>
                                <style>
                                    body { font-family: Arial, sans-serif; padding: 20px; }
                                    .response { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0; }
                                    .confidence { color: ${response.confidence > 70 ? 'green' : response.confidence > 40 ? 'orange' : 'red'}; }
                                    .metadata { font-size: 0.9em; color: #666; margin-top: 10px; }
                                </style>
                            </head>
                            <body>
                                <h2>AI Assistant Response</h2>
                                <div class="response">
                                    <h3>Answer:</h3>
                                    <p>${response.content.message || 'No response message available'}</p>
                                    <div class="metadata">
                                        <span class="confidence">Confidence: ${Math.round(response.confidence)}%</span> | 
                                        Processing Time: ${response.metadata.processing_time}ms
                                    </div>
                                </div>
                            </body>
                            </html>
                        `;
                    }
                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error,
                        'ai.askAssistant',
                        LogCategory.EXTENSION
                    );
                }
            }),

            vscode.commands.registerCommand('alephscript.ai.codeAnalysis', async () => {
                try {
                    const editor = vscode.window.activeTextEditor;
                    if (!editor) {
                        vscode.window.showErrorMessage('No active text editor found');
                        return;
                    }

                    const selection = editor.selection;
                    const code = selection.isEmpty ? editor.document.getText() : editor.document.getText(selection);
                    
                    if (!code.trim()) {
                        vscode.window.showErrorMessage('No code selected for analysis');
                        return;
                    }

                    const response = await managers.aiAssistant.processRequest({
                        id: Date.now().toString(),
                        type: AIInteractionType.ANALYSIS,
                        capability: AICapability.CODE_ANALYSIS,
                        context: {
                            activeFile: editor.document.uri.fsPath,
                            selection: code,
                            workspace: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
                        },
                        data: {
                            code,
                            language: editor.document.languageId,
                            file_path: editor.document.uri.fsPath
                        },
                        timestamp: new Date().toISOString(),
                        session_id: 'default'
                    });

                    const panel = vscode.window.createWebviewPanel(
                        'ai-code-analysis',
                        'AI Code Analysis',
                        vscode.ViewColumn.Two,
                        { enableScripts: true }
                    );

                    panel.webview.html = `
                        <html>
                        <head>
                            <style>
                                body { font-family: Arial, sans-serif; padding: 20px; }
                                .analysis { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }
                                .code-block { background: #2d2d30; color: #cccccc; padding: 10px; border-radius: 3px; font-family: monospace; white-space: pre-wrap; }
                                .confidence { color: ${response.confidence > 70 ? 'green' : response.confidence > 40 ? 'orange' : 'red'}; }
                            </style>
                        </head>
                        <body>
                            <h2>AI Code Analysis Results</h2>
                            <div class="analysis">
                                <h3>Analysis:</h3>
                                <p>${response.content.message || response.content.analysis?.summary || 'No analysis available'}</p>
                                <div style="font-size: 0.9em; color: #666; margin-top: 10px;">
                                    <span class="confidence">Confidence: ${Math.round(response.confidence)}%</span> | 
                                    Language: ${editor.document.languageId} |
                                    Processing Time: ${response.metadata.processing_time}ms
                                </div>
                            </div>
                            <div>
                                <h3>Analyzed Code:</h3>
                                <div class="code-block">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
                            </div>
                        </body>
                        </html>
                    `;
                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error,
                        'ai.codeAnalysis',
                        LogCategory.EXTENSION
                    );
                }
            }),

            vscode.commands.registerCommand('alephscript.ai.optimizeWorkflow', async () => {
                try {
                    const response = await managers.aiAssistant.processRequest({
                        id: Date.now().toString(),
                        type: AIInteractionType.OPTIMIZATION,
                        capability: AICapability.WORKFLOW_OPTIMIZATION,
                        context: {
                            workspace: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath,
                            userIntent: 'workflow optimization analysis'
                        },
                        data: {
                            workspace_folders: vscode.workspace.workspaceFolders?.map(f => f.uri.fsPath),
                            extensions: vscode.extensions.all.filter(ext => ext.isActive).map(ext => ext.id),
                            settings: vscode.workspace.getConfiguration().get('alephscript') || {}
                        },
                        timestamp: new Date().toISOString(),
                        session_id: 'default'
                    });

                    const panel = vscode.window.createWebviewPanel(
                        'ai-workflow-optimization',
                        'AI Workflow Optimization',
                        vscode.ViewColumn.Two,
                        { enableScripts: true }
                    );

                    panel.webview.html = `
                        <html>
                        <head>
                            <style>
                                body { font-family: Arial, sans-serif; padding: 20px; }
                                .optimization { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #28a745; }
                                .confidence { color: ${response.confidence > 70 ? 'green' : response.confidence > 40 ? 'orange' : 'red'}; }
                            </style>
                        </head>
                        <body>
                            <h2>AI Workflow Optimization Suggestions</h2>
                            <div class="optimization">
                                <h3>Optimization Recommendations:</h3>
                                <p>${response.content.message || 'No optimization suggestions available'}</p>
                                <div style="font-size: 0.9em; color: #666; margin-top: 10px;">
                                    <span class="confidence">Confidence: ${Math.round(response.confidence)}%</span> | 
                                    Processing Time: ${response.metadata.processing_time}ms
                                </div>
                            </div>
                        </body>
                        </html>
                    `;
                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error,
                        'ai.optimizeWorkflow',
                        LogCategory.EXTENSION
                    );
                }
            }),

            vscode.commands.registerCommand('alephscript.ai.viewStats', async () => {
                try {
                    const stats = managers.aiAssistant.getStatistics();

                    const panel = vscode.window.createWebviewPanel(
                        'ai-assistant-stats',
                        'AI Assistant Statistics',
                        vscode.ViewColumn.Two,
                        { enableScripts: true }
                    );

                    panel.webview.html = `
                        <html>
                        <head>
                            <style>
                                body { font-family: Arial, sans-serif; padding: 20px; }
                                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
                                .stat-card { background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #007acc; }
                                .stat-title { font-weight: bold; color: #333; margin-bottom: 5px; }
                                .stat-value { font-size: 1.2em; color: #007acc; }
                                .capabilities { background: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0; }
                                .capability-list { list-style-type: none; padding: 0; }
                                .capability-list li { background: #b3d9ff; margin: 5px 0; padding: 8px; border-radius: 3px; }
                            </style>
                        </head>
                        <body>
                            <h2>AI Assistant Statistics</h2>
                            
                            <div class="stats-grid">
                                <div class="stat-card">
                                    <div class="stat-title">Total Requests</div>
                                    <div class="stat-value">${stats.total_requests}</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-title">Success Rate</div>
                                    <div class="stat-value">${Math.round(stats.success_rate * 100)}%</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-title">Avg Confidence</div>
                                    <div class="stat-value">${Math.round(stats.avg_confidence * 100)}%</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-title">Avg Processing Time</div>
                                    <div class="stat-value">${Math.round(stats.avg_processing_time)}ms</div>
                                </div>
                            </div>

                            <div class="capabilities">
                                <h3>Capabilities Usage</h3>
                                <ul class="capability-list">
                                    ${Object.entries(stats.capabilities_used).map(([capability, count]) => 
                                        `<li>${capability}: ${count} uses</li>`
                                    ).join('')}
                                </ul>
                            </div>
                        </body>
                        </html>
                    `;
                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error,
                        'ai.viewStats',
                        LogCategory.EXTENSION
                    );
                }
            }),

            // Teatro Commands
            vscode.commands.registerCommand('alephscript.teatro.refresh', () => {
                if (!this.extensionContext) return;
                this.extensionContext.teatroTreeProvider.refresh();
                vscode.window.showInformationMessage('🎭 Teatro actualizado');
            }),

            // MCP Commands
            vscode.commands.registerCommand('alephscript.mcptree.refresh', async () => {
                try {
                    if (this.extensionContext) {
                        const snap = await CatalogService.getInstance().refresh();
                        this.extensionContext.mcpTreeProvider.refresh();
                        this.extensionContext.logger.info(
                            `MCP catalog refresh: ${snap.availability} — ${snap.statusMessage}`
                        );
                        vscode.window.showInformationMessage(
                            snap.availability === 'ready'
                                ? `📡 Catálogo: ${snap.servers.length} servidor(es)`
                                : `⏳ ${snap.statusMessage}`
                        );
                    }
                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error,
                        'agents.refresh',
                        LogCategory.EXTENSION
                    );
                }
            }),

            // WP-V07 · identidad + resources
            vscode.commands.registerCommand('zigurat.identity.join', async () => {
                const snap = await RoomIdentityService.getInstance().join();
                if (snap.availability === 'ready') {
                    await ResourceProjectionService.getInstance().refresh();
                    this.extensionContext?.mcpTreeProvider.refresh();
                    vscode.window.showInformationMessage(`Identidad: ${snap.ssbId}`);
                } else {
                    vscode.window.showWarningMessage(snap.statusMessage);
                }
            }),
            vscode.commands.registerCommand('zigurat.identity.refresh', async () => {
                const snap = await RoomIdentityService.getInstance().ensureFresh();
                if (snap.availability === 'ready') {
                    await ResourceProjectionService.getInstance().refresh();
                    this.extensionContext?.mcpTreeProvider.refresh();
                    vscode.window.showInformationMessage(
                        `Identidad vigente: ${snap.ssbId} (join #${snap.joinCount})`
                    );
                } else {
                    vscode.window.showWarningMessage(snap.statusMessage);
                }
            }),
            vscode.commands.registerCommand('zigurat.resources.refresh', async () => {
                const snap = await ResourceProjectionService.getInstance().refresh();
                this.extensionContext?.mcpTreeProvider.refresh();
                vscode.window.showInformationMessage(
                    snap.availability === 'ready'
                        ? snap.statusMessage
                        : snap.statusMessage
                );
            }),

            // WP-V08 · mutación + autoría (gate visible; motivos_deny desde runtime)
            vscode.commands.registerCommand('zigurat.authorship.refreshGate', async () => {
                const snap = await AuthorshipService.getInstance().refreshGate();
                this.extensionContext?.mcpTreeProvider.refresh();
                if (snap.availability === 'ready' && snap.gate) {
                    const motivos = snap.gate.motivosDeny.join(' · ');
                    vscode.window.showInformationMessage(
                        `${snap.statusMessage}${motivos ? ` · ${motivos}` : ''}`
                    );
                } else {
                    vscode.window.showWarningMessage(snap.statusMessage);
                }
            }),
            vscode.commands.registerCommand('zigurat.authorship.crearLinea', async () => {
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
                this.extensionContext?.mcpTreeProvider.refresh();
                if (result.ok) {
                    vscode.window.showInformationMessage(`crear_linea OK · ${id}`);
                } else {
                    vscode.window.showErrorMessage(auth.formatDenyForUi(result), { modal: true });
                }
            }),
            vscode.commands.registerCommand('zigurat.authorship.exportStoryBoard', async () => {
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
                this.extensionContext?.mcpTreeProvider.refresh();
                if (result.ok) {
                    vscode.window.showInformationMessage('export_story_board OK');
                } else {
                    vscode.window.showErrorMessage(auth.formatDenyForUi(result), { modal: true });
                }
            }),
            // WP-V09 · elenco (reparto → cast-table); no toca V08
            vscode.commands.registerCommand('zigurat.elenco.refresh', async () => {
                const snap = await RepartoElencoService.getInstance().refresh();
                this.extensionContext?.elencoTreeProvider.refresh();
                vscode.window.showInformationMessage(snap.statusMessage);
            }),

            vscode.commands.registerCommand('alephscript.mcptree.start', async (item?: any) => {
                try {
                    if (this.extensionContext) {
                        const serverId = item?.id || item?.serverId || item?.label;
                        if (!serverId) {
                            vscode.window.showErrorMessage('No MCP server ID provided for start command');
                            return;
                        }

                        // Use the new startMCPServer method from mcpTreeProvider
                        await this.extensionContext.mcpTreeProvider.startMCPServer(serverId);
                        
                        this.extensionContext.logger.info(`MCP Server ${serverId} start command executed`);
                    }
                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error,
                        'mcptree.start',
                        LogCategory.EXTENSION
                    );
                }
            }),

            vscode.commands.registerCommand('alephscript.mcptree.stop', async (item?: any) => {
                try {
                    if (this.extensionContext) {
                        const serverId = item?.id || item?.serverId || item?.label;
                        if (!serverId) {
                            vscode.window.showErrorMessage('No MCP server ID provided for stop command');
                            return;
                        }

                        // Use the new stopMCPServer method from mcpTreeProvider
                        await this.extensionContext.mcpTreeProvider.stopMCPServer(serverId);
                        
                        this.extensionContext.logger.info(`MCP Server ${serverId} stop command executed`);
                    }
                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error,
                        'mcptree.stop',
                        LogCategory.EXTENSION
                    );
                }
            }),

            vscode.commands.registerCommand('alephscript.mcptree.web.open', async (item?: any) => {
                try {
                    if (this.extensionContext) {
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
                        const success = await this.extensionContext.mcpWebViewManager.openMCPWeb(webId);
                        
                        if (success) {
                            this.extensionContext.logger.info(`MCP Web ${webId} opened successfully`);
                        } else {
                            vscode.window.showErrorMessage(`Failed to open MCP Web ${webId}`);
                        }
                    }
                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error,
                        'mcptree.web.open',
                        LogCategory.EXTENSION
                    );
                }
            }),

            // UIs Commands
            vscode.commands.registerCommand('alephscript.uis.refresh', async () => {
                try {
                    if (this.extensionContext) {
                        this.extensionContext.uisTreeProvider.refresh();
                        this.extensionContext.logger.info('UIs TreeView refreshed');
                        vscode.window.showInformationMessage('🎨 UIs refreshed');
                    }
                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error,
                        'uis.refresh',
                        LogCategory.EXTENSION
                    );
                }
            }),

            vscode.commands.registerCommand('alephscript.teatro.activateAgent', (arg: any) => {
                if (!this.extensionContext) return;
                const agentId = typeof arg === 'string' ? arg : arg?.agent?.id ?? arg?.id ?? arg?.label ?? '';
                if (!agentId || typeof agentId !== 'string') {
                    vscode.window.showErrorMessage('No se pudo determinar el agente a activar');
                    return;
                }
                this.extensionContext.teatroTreeProvider.activateAgent(agentId);
            }),

            vscode.commands.registerCommand('alephscript.teatro.deactivateAgent', (arg: any) => {
                if (!this.extensionContext) return;
                const agentId = typeof arg === 'string' ? arg : arg?.agent?.id ?? arg?.id ?? arg?.label ?? '';
                if (!agentId || typeof agentId !== 'string') {
                    vscode.window.showErrorMessage('No se pudo determinar el agente a desactivar');
                    return;
                }
                this.extensionContext.teatroTreeProvider.deactivateAgent(agentId);
            }),

            vscode.commands.registerCommand('alephscript.teatro.openChatParticipant', async (arg: any, command?: string) => {
                try {
                    if (!this.extensionContext) return;
                    const agentId = typeof arg === 'string' ? arg : arg?.agent?.id ?? arg?.id ?? '';
                    const agent = this.extensionContext.teatroTreeProvider.getAgent(agentId);
                    if (!agent) {
                        vscode.window.showErrorMessage(`Agente ${agentId} no encontrado`);
                        return;
                    }

                    // Focus chat panel
                    await vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
                    
                    // Prepare chat message
                    const message = command ? `@${agentId} /${command}` : `@${agentId} Hola, estoy listo para trabajar contigo`;
                    
                    // Show info about the agent
                    vscode.window.showInformationMessage(
                        `🎭 Conectando con ${agent.fullName}`, 
                        'Abrir Chat'
                    ).then(selection => {
                        if (selection === 'Abrir Chat') {
                            vscode.commands.executeCommand('workbench.action.chat.open', {
                                query: message
                            });
                        }
                    });
                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error,
                        'teatro.openChatParticipant',
                        LogCategory.EXTENSION
                    );
                }
            }),

            vscode.commands.registerCommand('alephscript.teatro.showAgentInfo', (arg: any) => {
                if (!this.extensionContext) return;
                const agentId = typeof arg === 'string' ? arg : arg?.agent?.id ?? arg?.id ?? '';
                if (agentId === 'system') {
                    const status = this.extensionContext.teatroTreeProvider.getAgentsStatus();
                    vscode.window.showInformationMessage(
                        `🎭 Teatro: ${status.active}/${status.total} agentes activos`
                    );
                    return;
                }

                const agent = this.extensionContext.teatroTreeProvider.getAgent(agentId);
                if (agent) {
                    const commands = agent.commands.map(cmd => `• /${cmd.name}: ${cmd.description}`).join('\n');
                    vscode.window.showInformationMessage(
                        `🎭 ${agent.fullName}\n\n${agent.description}\n\nComandos disponibles:\n${commands}`,
                        'Abrir Chat'
                    ).then(selection => {
                        if (selection === 'Abrir Chat') {
                            vscode.commands.executeCommand('alephscript.teatro.openChatParticipant', agentId);
                        }
                    });
                } else {
                    vscode.window.showErrorMessage(`Agente ${agentId} no encontrado`);
                }
            }),

            vscode.commands.registerCommand('alephscript.teatro.openTeatroPanel', async () => {
                try {
                    if (!this.extensionContext) return;
                    
                    // Create Teatro control panel
                    const panel = vscode.window.createWebviewPanel(
                        'teatro-panel',
                        '🎭 Panel del Teatro',
                        vscode.ViewColumn.One,
                        { 
                            enableScripts: true,
                            localResourceRoots: [this.vsCodeContext!.extensionUri]
                        }
                    );
                    
                    // Use the same HTML as our WebView provider
                    if (this.extensionContext?.teatroWebViewProvider) {
                        const webview = {
                            webview: panel.webview,
                            onDidChangeViewState: panel.onDidChangeViewState,
                            visible: panel.visible,
                            viewType: 'teatro-panel'
                        } as any;
                        
                        // Resolve the webview manually
                        this.extensionContext.teatroWebViewProvider.resolveWebviewView(
                            webview, 
                            {} as vscode.WebviewViewResolveContext, 
                            new vscode.CancellationTokenSource().token
                        );
                    }
                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error,
                        'teatro.openTeatroPanel',
                        LogCategory.EXTENSION
                    );
                }
            }),

            // Agent Management Commands
            vscode.commands.registerCommand('alephscript.agents.createNew', async () => {
                try {
                    // Ask for agent ID
                    const agentId = await vscode.window.showInputBox({
                        prompt: 'Enter Agent ID (e.g., isaac, backend-agent)',
                        validateInput: (value) => {
                            if (!value || !/^[a-z][a-z0-9-]*[a-z0-9]$/.test(value)) {
                                return 'Agent ID must start with a letter, contain only lowercase letters, numbers, and hyphens';
                            }
                            return null;
                        }
                    });

                    if (!agentId) return;

                    // Ask for agent name
                    const agentName = await vscode.window.showInputBox({
                        prompt: 'Enter Agent Display Name (e.g., Isaac - El Marinero)',
                        value: agentId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                    });

                    if (!agentName) return;

                    // Create agent files
                    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
                    if (!workspaceFolder) {
                        vscode.window.showErrorMessage('No workspace folder found');
                        return;
                    }

                    const theatricalContentPath = vscode.Uri.joinPath(workspaceFolder.uri, 'theatrical-content');
                    
                    // Create content file
                    const contentPath = vscode.Uri.joinPath(theatricalContentPath, 'content', 'agents', `${agentId}.agent.md`);
                    const contentTemplate = `---
id: ${agentId}
name: "${agentName}"
version: "1.0.0"
description: "Description for ${agentName}"
role: "assistant"
specialization: "General"
---

# ${agentName}

## Descripción
Describe aquí las capacidades y propósito de este agente.

## Comandos Disponibles
- \`/example\`: Comando de ejemplo

## Configuración Especializada
Detalles específicos sobre cómo configurar y usar este agente.

## Ejemplos de Uso
\`\`\`
/example parameter
\`\`\`
`;

                    const configPath = vscode.Uri.joinPath(theatricalContentPath, 'configurations', 'agents', `${agentId}.config.json`);
                    const configTemplate = {
                        id: agentId,
                        name: agentName,
                        description: `Description for ${agentName}`,
                        role: "assistant",
                        version: "1.0.0",
                        enabled: true,
                        tools: [],
                        capabilities: [],
                        commands: [
                            {
                                name: "example",
                                description: "Example command"
                            }
                        ],
                        specialization: "General",
                        mcp: {
                            enabled: false,
                            servers: {}
                        }
                    };

                    // Create directories if they don't exist
                    await vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(theatricalContentPath, 'content', 'agents'));
                    await vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(theatricalContentPath, 'configurations', 'agents'));

                    // Write files
                    await vscode.workspace.fs.writeFile(contentPath, Buffer.from(contentTemplate, 'utf8'));
                    await vscode.workspace.fs.writeFile(configPath, Buffer.from(JSON.stringify(configTemplate, null, 2), 'utf8'));

                    // Open content file for editing
                    const document = await vscode.workspace.openTextDocument(contentPath);
                    await vscode.window.showTextDocument(document);

                    vscode.window.showInformationMessage(`Agent ${agentName} created successfully!`);

                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error,
                        'agents.createNew',
                        LogCategory.EXTENSION
                    );
                }
            }),

            vscode.commands.registerCommand('alephscript.agents.editContent', async () => {
                try {
                    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
                    if (!workspaceFolder) {
                        vscode.window.showErrorMessage('No workspace folder found');
                        return;
                    }

                    const agentFiles = await vscode.workspace.findFiles(
                        new vscode.RelativePattern(workspaceFolder, '**/theatrical-content/content/agents/*.agent.md')
                    );

                    if (agentFiles.length === 0) {
                        vscode.window.showInformationMessage('No agent content files found. Create a new agent first.');
                        return;
                    }

                    const selected = await vscode.window.showQuickPick(
                        agentFiles.map(file => ({
                            label: file.fsPath.split('/').pop()?.replace('.agent.md', '') || 'Unknown',
                            description: file.fsPath,
                            uri: file
                        })),
                        { placeHolder: 'Select agent to edit content' }
                    );

                    if (selected) {
                        const document = await vscode.workspace.openTextDocument(selected.uri);
                        await vscode.window.showTextDocument(document);
                    }

                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error,
                        'agents.editContent',
                        LogCategory.EXTENSION
                    );
                }
            }),

            vscode.commands.registerCommand('alephscript.agents.editConfig', async () => {
                try {
                    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
                    if (!workspaceFolder) {
                        vscode.window.showErrorMessage('No workspace folder found');
                        return;
                    }

                    const configFiles = await vscode.workspace.findFiles(
                        new vscode.RelativePattern(workspaceFolder, '**/theatrical-content/configurations/agents/*.config.json')
                    );

                    if (configFiles.length === 0) {
                        vscode.window.showInformationMessage('No agent configuration files found. Create a new agent first.');
                        return;
                    }

                    const selected = await vscode.window.showQuickPick(
                        configFiles.map(file => ({
                            label: file.fsPath.split('/').pop()?.replace('.config.json', '') || 'Unknown',
                            description: file.fsPath,
                            uri: file
                        })),
                        { placeHolder: 'Select agent to edit configuration' }
                    );

                    if (selected) {
                        const document = await vscode.workspace.openTextDocument(selected.uri);
                        await vscode.window.showTextDocument(document);
                    }

                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error,
                        'agents.editConfig',
                        LogCategory.EXTENSION
                    );
                }
            }),

            vscode.commands.registerCommand('alephscript.agents.validateAll', async () => {
                try {
                    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
                    if (!workspaceFolder) {
                        vscode.window.showErrorMessage('No workspace folder found');
                        return;
                    }

                    // Find all agent files
                    const contentFiles = await vscode.workspace.findFiles(
                        new vscode.RelativePattern(workspaceFolder, '**/theatrical-content/content/agents/*.agent.md')
                    );
                    
                    const configFiles = await vscode.workspace.findFiles(
                        new vscode.RelativePattern(workspaceFolder, '**/theatrical-content/configurations/agents/*.config.json')
                    );

                    const validationResults = [];

                    // Validate that each content file has a corresponding config file
                    for (const contentFile of contentFiles) {
                        const agentId = contentFile.fsPath.split('/').pop()?.replace('.agent.md', '');
                        const correspondingConfig = configFiles.find(config => 
                            config.fsPath.includes(`${agentId}.config.json`)
                        );

                        if (!correspondingConfig) {
                            validationResults.push(`❌ Missing config file for agent: ${agentId}`);
                        } else {
                            validationResults.push(`✅ Agent ${agentId} has both content and config files`);
                        }
                    }

                    // Show validation results
                    const panel = vscode.window.createWebviewPanel(
                        'agent-validation',
                        'Agent Validation Results',
                        vscode.ViewColumn.One,
                        { enableScripts: false }
                    );

                    panel.webview.html = `
                        <html>
                        <head>
                            <style>
                                body { font-family: Arial, sans-serif; padding: 20px; }
                                .result { margin: 8px 0; padding: 8px; border-radius: 4px; }
                                .success { background: #d4edda; color: #155724; }
                                .error { background: #f8d7da; color: #721c24; }
                            </style>
                        </head>
                        <body>
                            <h2>🎭 Agent Validation Results</h2>
                            <p>Found ${contentFiles.length} content files and ${configFiles.length} config files</p>
                            ${validationResults.map(result => 
                                `<div class="result ${result.includes('✅') ? 'success' : 'error'}">${result}</div>`
                            ).join('')}
                        </body>
                        </html>
                    `;

                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error,
                        'agents.validateAll',
                        LogCategory.EXTENSION
                    );
                }
            }),

            // Socket.io Gamification Commands (First Era Restoration)
            vscode.commands.registerCommand('mcpSocketManager.openSocketMonitor', async () => {
                try {
                    if (this.extensionContext && this.vsCodeContext) {
                        await this.extensionContext.socketMonitor.createOrShowPanel(this.vsCodeContext.extensionUri);
                        this.extensionContext.logger.info('Socket Monitor opened');
                    }
                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error,
                        'socket.openMonitor',
                        LogCategory.SOCKET
                    );
                }
            }),

            vscode.commands.registerCommand('alephscript.sockets.refresh', async () => {
                try {
                    if (this.extensionContext) {
                        this.extensionContext.socketsTreeProvider.refresh();
                        this.extensionContext.logger.info('Sockets TreeView refreshed');
                    }
                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error,
                        'sockets.refresh',
                        LogCategory.SOCKET
                    );
                }
            }),

            // AracneBot Commands - Socket.IO mesh integration
            vscode.commands.registerCommand('alephscript.aracne.connect', async () => {
                try {
                    if (this.extensionContext) {
                        this.extensionContext.aracneBotService.connect();
                        vscode.window.showInformationMessage('🕷️ AracneBot connecting to mesh...');
                    }
                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error,
                        'aracne.connect',
                        LogCategory.SOCKET
                    );
                }
            }),

            vscode.commands.registerCommand('alephscript.aracne.disconnect', async () => {
                try {
                    if (this.extensionContext) {
                        this.extensionContext.aracneBotService.disconnect();
                        vscode.window.showInformationMessage('🕷️ AracneBot disconnected from mesh');
                    }
                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error,
                        'aracne.disconnect',
                        LogCategory.SOCKET
                    );
                }
            }),

            vscode.commands.registerCommand('alephscript.aracne.status', async () => {
                try {
                    if (this.extensionContext) {
                        const connected = this.extensionContext.aracneBotService.isConnected();
                        const status = connected ? '🟢 Connected' : '🔴 Disconnected';
                        vscode.window.showInformationMessage(`🕷️ AracneBot: ${status}`);
                    }
                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error,
                        'aracne.status',
                        LogCategory.SOCKET
                    );
                }
            }),

            // Configs Commands
            vscode.commands.registerCommand('alephscript.configs.refresh', async () => {
                try {
                    if (this.extensionContext) {
                        this.extensionContext.configsTreeProvider.refresh();
                        this.extensionContext.logger.info('Configs TreeView refreshed');
                        vscode.window.showInformationMessage('⚙️ Configurations refreshed');
                    }
                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error,
                        'configs.refresh',
                        LogCategory.EXTENSION
                    );
                }
            })
        );

        // Add all commands to context subscriptions
        this.vsCodeContext.subscriptions.push(...commands);

        // Register configuration commands
        ConfigurationCommandsService.registerCommands(this.vsCodeContext);

        // WISH-01/02/03: Register Copilot Log Exporter commands
        registerCopilotLogCommands(this.vsCodeContext);
        
        // Initialize Copilot Log Exporter service
        const copilotLogService = getCopilotLogExporterService();
        copilotLogService.initialize().catch(err => {
            this.extensionContext?.logger.warn('Failed to initialize Copilot Log Exporter:', err);
        });

        this.extensionContext.logger.info(`Registered ${commands.length} commands + configuration commands + Copilot Log Exporter`);
    }

    /**
     * Sets up TreeViews and related UI elements
     */
    private async setupTreeViews(): Promise<void> {
        if (!this.extensionContext || !this.vsCodeContext) {
            throw new Error('Extension context not initialized');
        }

        try {
            // Register Teatro TreeView
            this.vsCodeContext.subscriptions.push(
                vscode.window.createTreeView('alephscript.teatro', {
                    treeDataProvider: this.extensionContext.teatroTreeProvider,
                    showCollapseAll: true,
                    canSelectMany: false
                })
            );

            // Register Teatro WebView Provider  
            this.vsCodeContext.subscriptions.push(
                vscode.window.registerWebviewViewProvider(
                    TeatroWebViewProvider.viewType, 
                    this.extensionContext.teatroWebViewProvider
                )
            );

            // Register Hacker Control Panel WebView Provider
            this.vsCodeContext.subscriptions.push(
                vscode.window.registerWebviewViewProvider(
                    HackerControlPanelProvider.viewType,
                    this.extensionContext.hackerControlPanelProvider
                )
            );

            // Register Hacker Command Panel WebView Provider
            this.vsCodeContext.subscriptions.push(
                vscode.window.registerWebviewViewProvider(
                    HackerCommandPanelProvider.viewType,
                    this.extensionContext.hackerCommandPanelProvider
                )
            );

            // Register Hacker Config Panel WebView Provider
            this.vsCodeContext.subscriptions.push(
                vscode.window.registerWebviewViewProvider(
                    HackerConfigPanelProvider.viewType,
                    this.extensionContext.hackerConfigPanelProvider
                )
            );

            // Register Hacker Tasks Panel WebView Provider (dynamic tasks.json reader)
            this.vsCodeContext.subscriptions.push(
                vscode.window.registerWebviewViewProvider(
                    HackerTasksPanelProvider.viewType,
                    this.extensionContext.hackerTasksPanelProvider
                )
            );

            // Register Agent Content Editor (for .agent.md files)
            this.vsCodeContext.subscriptions.push(
                vscode.window.registerCustomEditorProvider(
                    'alephscript.agentContentEditor',
                    this.extensionContext.agentContentEditor,
                    {
                        webviewOptions: {
                            retainContextWhenHidden: true,
                            enableFindWidget: true
                        },
                        supportsMultipleEditorsPerDocument: false
                    }
                )
            );

            // Register Agent Config Editor (for .config.json files in agent contexts)
            this.vsCodeContext.subscriptions.push(
                vscode.window.registerCustomEditorProvider(
                    'alephscript.agentConfigEditor',
                    this.extensionContext.agentConfigEditor,
                    {
                        webviewOptions: {
                            retainContextWhenHidden: true,
                            enableFindWidget: true
                        },
                        supportsMultipleEditorsPerDocument: false
                    }
                )
            );

            // Register Gamification TreeViews (First Era Restoration)
            this.vsCodeContext.subscriptions.push(
                vscode.window.createTreeView('alephscript.sockets', {
                    treeDataProvider: this.extensionContext.socketsTreeProvider,
                    showCollapseAll: true,
                    canSelectMany: false
                })
            );

            this.vsCodeContext.subscriptions.push(
                vscode.window.createTreeView('alephscript.uis', {
                    treeDataProvider: this.extensionContext.uisTreeProvider,
                    showCollapseAll: true,
                    canSelectMany: false
                })
            );

            this.vsCodeContext.subscriptions.push(
                vscode.window.createTreeView('alephscript.configs', {
                    treeDataProvider: this.extensionContext.configsTreeProvider,
                    showCollapseAll: true,
                    canSelectMany: false
                })
            );

            this.vsCodeContext.subscriptions.push(
                vscode.window.createTreeView('alephscript.logs', {
                    treeDataProvider: this.extensionContext.logsTreeProvider,
                    showCollapseAll: true,
                    canSelectMany: false
                })
            );

            this.vsCodeContext.subscriptions.push(
                vscode.window.createTreeView('alephscript.mcptree', {
                    treeDataProvider: this.extensionContext.mcpTreeProvider,
                    showCollapseAll: true,
                    canSelectMany: false
                })
            );

            this.vsCodeContext.subscriptions.push(
                vscode.window.createTreeView('alephscript.elenco', {
                    treeDataProvider: this.extensionContext.elencoTreeProvider,
                    showCollapseAll: true,
                    canSelectMany: false
                })
            );

            this.extensionContext.logger.info('🎭 Teatro TreeViews and WebViews registered successfully');
            this.extensionContext.logger.info('🔧 Agent Editors registered successfully');
            this.extensionContext.logger.info('🎮 Gamification TreeViews restored successfully');
            this.extensionContext.logger.info('🎭 Elenco TreeView (reparto/1 · cast-table) registered');
        } catch (error) {
            this.extensionContext.logger.error('Failed to setup TreeViews:', error);
            throw error;
        }
    }

    /**
     * Handles auto-start configuration
     */
    private async handleAutoStart(): Promise<void> {
        if (!this.extensionContext) return;

        const { managers } = this.extensionContext;
        
        if (managers.config.get('process.autoStart')) {
            const configPath = managers.config.get('process.configPath');
            if (configPath) {
                try {
                    await managers.process.startLauncher(configPath);
                    this.extensionContext.logger.info('Auto-start completed successfully');
                } catch (error) {
                    await managers.errorBoundary.handleError(
                        error as Error, 
                        'autoStart', 
                        LogCategory.PROCESS,
                        { showToUser: false } // Don't show auto-start errors to user
                    );
                }
            }
        }
    }

    /**
     * Shows system status
     */
    private showSystemStatus(): void {
        if (!this.extensionContext) return;

        const { managers } = this.extensionContext;
        const healthStatus = managers.factory.getHealthStatus();
        const activeManagers = managers.factory.getActiveManagers();

        const statusInfo = {
            activeManagers: activeManagers.length,
            managerHealth: healthStatus,
            webViewCount: managers.webView.getAllWebViews().length,
            processCount: managers.process.getRunningProcessesCount(),
        };

        const statusMessage = `
AlephScript Extension Status:
- Active Managers: ${statusInfo.activeManagers}
- WebViews: ${statusInfo.webViewCount}
- Running Processes: ${statusInfo.processCount}
        `.trim();

        vscode.window.showInformationMessage(statusMessage, 'Show Details').then(selection => {
            if (selection === 'Show Details') {
                vscode.workspace.openTextDocument({
                    content: JSON.stringify(statusInfo, null, 2),
                    language: 'json'
                }).then(doc => {
                    vscode.window.showTextDocument(doc, { preview: true });
                });
            }
        });
    }

    /**
     * Restarts the extension
     */
    private async restartExtension(): Promise<void> {
        if (!this.extensionContext) return;

        const { managers } = this.extensionContext;
        
        this.extensionContext.logger.info('Restarting extension...');
        
        // Dispose all managers
        await managers.factory.disposeAll();
        
        // Reinitialize
        if (this.vsCodeContext) {
            await this.initialize(this.vsCodeContext);
        }
    }

    /**
     * Converts string log level to LogLevel enum
     */
    private stringToLogLevel(level: string): LogLevel {
        switch (level.toLowerCase()) {
            case 'error': return LogLevel.ERROR;
            case 'warn': return LogLevel.WARN;
            case 'info': return LogLevel.INFO;
            case 'debug': return LogLevel.DEBUG;
            case 'trace': return LogLevel.TRACE;
            default: return LogLevel.INFO;
        }
    }

    /**
     * Converts string array to LogCategory array
     */
    private stringArrayToLogCategories(categories: string[]): LogCategory[] {
        return categories.map(cat => {
            const upperCat = cat.toUpperCase();
            return Object.values(LogCategory).find(lc => lc.toUpperCase() === upperCat) || LogCategory.GENERAL;
        });
    }

    /**
     * Gets the current extension context
     */
    getExtensionContext(): ExtensionContext | undefined {
        return this.extensionContext;
    }

    /**
     * Generates HTML for analytics dashboard
     */
    private generateAnalyticsDashboard(aggregation: any): string {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>AlephScript Analytics</title>
            <style>
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    margin: 0; padding: 20px; background: #1e1e1e; color: #d4d4d4; 
                }
                .header { margin-bottom: 30px; }
                .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
                .metric-card { 
                    background: #2d2d30; border-radius: 8px; padding: 20px; border: 1px solid #404040; 
                }
                .metric-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #4fc1ff; }
                .metric-value { font-size: 32px; font-weight: bold; margin-bottom: 10px; }
                .metric-list { list-style: none; padding: 0; margin: 0; }
                .metric-list li { 
                    display: flex; justify-content: space-between; padding: 8px 0; 
                    border-bottom: 1px solid #404040; 
                }
                .metric-list li:last-child { border-bottom: none; }
                .usage-bar { 
                    background: #404040; height: 8px; border-radius: 4px; margin-top: 5px; 
                }
                .usage-fill { 
                    background: #4fc1ff; height: 100%; border-radius: 4px; 
                }
                .error-item { color: #ff6b6b; }
                .success-item { color: #51cf66; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🔍 AlephScript Analytics Dashboard</h1>
                <p>Extension usage metrics and performance insights</p>
            </div>
            
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-title">Most Used Commands</div>
                    <ul class="metric-list">
                        ${aggregation.most_used_commands.map((cmd: any) => `
                            <li>
                                <span>${cmd.command}</span>
                                <span>${cmd.count} uses (${cmd.percentage}%)</span>
                            </li>
                            <div class="usage-bar">
                                <div class="usage-fill" style="width: ${cmd.percentage}%"></div>
                            </div>
                        `).join('')}
                    </ul>
                </div>
                
                <div class="metric-card">
                    <div class="metric-title">WebView Usage</div>
                    <ul class="metric-list">
                        ${aggregation.most_opened_webviews.map((wv: any) => `
                            <li>
                                <span>${wv.webview}</span>
                                <span>${wv.count} opens (${wv.avg_duration}ms avg)</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                
                <div class="metric-card">
                    <div class="metric-title">Performance Metrics</div>
                    <ul class="metric-list">
                        <li><span>Avg Startup Time</span><span class="success-item">${aggregation.performance_summary.avg_startup_time}ms</span></li>
                        <li><span>Avg Command Time</span><span class="success-item">${aggregation.performance_summary.avg_command_execution_time}ms</span></li>
                        <li><span>Memory Usage Trend</span><span>${aggregation.performance_summary.memory_usage_trend.length} samples</span></li>
                    </ul>
                </div>
                
                <div class="metric-card">
                    <div class="metric-title">Error Summary</div>
                    <ul class="metric-list">
                        ${aggregation.error_frequency.map((err: any) => `
                            <li class="error-item">
                                <span>${err.error_type}</span>
                                <span>${err.count} occurrences</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                
                <div class="metric-card">
                    <div class="metric-title">Usage Patterns</div>
                    <ul class="metric-list">
                        <li><span>Peak Hours</span><span>${aggregation.usage_patterns.peak_usage_hours.join(', ')}</span></li>
                        <li><span>Active Days</span><span>${aggregation.usage_patterns.most_active_days.join(', ')}</span></li>
                        <li><span>Session Duration</span><span>${Math.round(aggregation.usage_patterns.session_duration_avg / 1000)}s</span></li>
                    </ul>
                </div>
                
                <div class="metric-card">
                    <div class="metric-title">Slowest Operations</div>
                    <ul class="metric-list">
                        ${aggregation.performance_summary.slowest_operations.slice(0, 5).map((op: any) => `
                            <li>
                                <span>${op.operation}</span>
                                <span>${op.avg_duration}ms</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Disposes the extension
     */
    async dispose(): Promise<void> {
        if (this.extensionContext) {
            this.extensionContext.logger.info('AlephScript extension deactivation started');
            
            try {
                // Dispose chat participant first
                this.extensionContext.chatParticipant.dispose();
                
                // Dispose theatrical chat participants
                this.extensionContext.theatricalChat.dispose();
                this.extensionContext.logger.info('🎭 Theatrical Chat Participants disposed');
                
                // Dispose AracneBot Socket.IO client
                this.extensionContext.aracneBotService.dispose();
                this.extensionContext.logger.info('🕷️ AracneBot disposed');
                
                // Then dispose all managers
                await this.extensionContext.managers.factory.disposeAll();
                this.extensionContext.logger.info('AlephScript extension deactivation completed');
            } catch (error) {
                console.error('Error during extension disposal:', error);
            }
        }
    }
}
