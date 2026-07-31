import * as vscode from 'vscode';
import { createStandardManagers } from './managerFactory';
import { AnalyticsEventType } from './analyticsService';
import { LogCategory, LogLevel, createLogger } from '../loggingManager';
import { ExtensionContext } from './bootstrap/context';
import { commandTable, CommandDeps } from './bootstrap/commands';
import { registerViewContribution, viewRegistrations } from './bootstrap/viewRegistry';
import { TeatroTreeDataProvider } from '../views/TeatroTreeDataProvider';
import { TeatroWebViewProvider } from '../views/TeatroWebViewProvider';
import { HackerControlPanelProvider } from '../views/HackerControlPanelProvider';
import { HackerCommandPanelProvider } from '../views/HackerCommandPanelProvider';
import { HackerConfigPanelProvider } from '../views/HackerConfigPanelProvider';
import { HackerTasksPanelProvider } from '../views/HackerTasksPanelProvider';
import { HackerStatusBarManager } from './HackerStatusBarManager';
import { AgentContentEditorProvider } from '../editors/AgentContentEditorProvider';
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

        // WP-V80: flujo puro — inyectar deps y registrar la tabla declarativa
        // (`bootstrap/commands`), en el mismo orden que el monolito original.
        const deps: CommandDeps = {
            managers: this.extensionContext.managers,
            getContext: () => this.extensionContext,
            getVsCodeContext: () => this.vsCodeContext,
            showSystemStatus: () => this.showSystemStatus(),
            restartExtension: () => this.restartExtension()
        };

        const commands: vscode.Disposable[] = commandTable.map(entry =>
            vscode.commands.registerCommand(entry.id, entry.handler(deps))
        );

        // Add all commands to context subscriptions
        this.vsCodeContext.subscriptions.push(...commands);

        this.extensionContext.logger.info(`Registered ${commands.length} commands`);
    }

    /**
     * Sets up TreeViews and related UI elements
     * WP-V80: flujo puro — lee la tabla `viewRegistrations` y registra fila a fila.
     */
    private async setupTreeViews(): Promise<void> {
        if (!this.extensionContext || !this.vsCodeContext) {
            throw new Error('Extension context not initialized');
        }

        try {
            for (const entry of viewRegistrations) {
                this.vsCodeContext.subscriptions.push(
                    registerViewContribution(entry, this.extensionContext)
                );
            }

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
     * Disposes the extension
     */
    async dispose(): Promise<void> {
        if (this.extensionContext) {
            this.extensionContext.logger.info('AlephScript extension deactivation started');
            
            try {
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
