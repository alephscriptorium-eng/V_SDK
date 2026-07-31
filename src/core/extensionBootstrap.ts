/**
 * WP-V80 · bootstrap del Zigurat = FLUJO puro.
 *
 * Los DATOS viven en `src/core/bootstrap/`:
 * - `context.ts` — forma del ExtensionContext
 * - `assembleContext.ts` — construcción/wire-up de componentes
 * - `commands/` — tablas declarativas de los 56 comandos
 * - `viewRegistry.ts` — tabla declarativa de las 14 vistas/editores
 * - `analyticsDashboardHtml.ts`, `logSettings.ts` — plantillas y mapeos
 *
 * Aquí solo queda el ciclo: ensamblar → leer tablas → registrar → arrancar.
 */
import * as vscode from 'vscode';
import { AnalyticsEventType } from './analyticsService';
import { LogCategory, createLogger } from '../loggingManager';
import { ExtensionContext } from './bootstrap/context';
import { assembleExtensionContext } from './bootstrap/assembleContext';
import { commandTable, CommandDeps } from './bootstrap/commands';
import { registerViewContribution, viewRegistrations } from './bootstrap/viewRegistry';
import { stringArrayToLogCategories } from './bootstrap/logSettings';

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
            // Construcción y wire-up de todos los componentes (bootstrap/assembleContext)
            this.extensionContext = await assembleExtensionContext(context, logger);

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
        managers.logging.setEnabledCategories(stringArrayToLogCategories(enabledCategories));

        // Setup error handling
        managers.errorBoundary; // Just initialize it

        this.extensionContext.logger.info('Core services initialized');
    }

    /**
     * Registers all extension commands
     * WP-V80: flujo puro — inyecta deps y registra la tabla declarativa
     * (`bootstrap/commands`), en el mismo orden que el monolito original.
     */
    private async registerCommands(): Promise<void> {
        if (!this.extensionContext || !this.vsCodeContext) {
            throw new Error('Extension context not initialized');
        }

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
