import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { AlephScriptConfiguration, MCPServerConfig, MCPServersConfig, MCPWebsConfig, UIConfig } from '../mcpTypes';
import { LogCategory, createLogger } from '../loggingManager';
import {
    resolveMeshSocketUrl,
    resolveOllamaBaseUrl,
    resolveLauncherPort,
    ZIGURAT_PENDING,
} from '../config/ziguratSettings';

export class McpConfigurationManager {
    private static instance: McpConfigurationManager;
    private config: AlephScriptConfiguration | null = null;
    private configPath: string | null = null;
    private readonly logger = createLogger(LogCategory.EXTENSION, 'McpConfigurationManager');

    private constructor() {
        // WP-V13: el console.log heredado anunciaba los comandos
        // ArrakisTheater.LoadConfig / .DownloadConfig, podados en este WP
        // (censo V12 §8, fila 18). Sin ellos el mensaje era una instrucción falsa.
    }

    static getInstance(): McpConfigurationManager {
        if (!McpConfigurationManager.instance) {
            McpConfigurationManager.instance = new McpConfigurationManager();
        }
        return McpConfigurationManager.instance;
    }

    /**
     * Initialize configuration from sample-config.json or VS Code settings
     */
    async initialize(): Promise<void> {
        try {
            // First try to get config path from VS Code settings
            const vscodeConfig = vscode.workspace.getConfiguration('mcpSocketManager');
            let configPath = vscodeConfig.get<string>('configPath');

            // Also check the alephscript configuration for backward compatibility
            if (!configPath) {
                const alephConfig = vscode.workspace.getConfiguration('alephscript');
                configPath = alephConfig.get<string>('configurationFile');
            }

            // If no path in settings, look for sample-config.json in workspace
            if (!configPath && vscode.workspace.workspaceFolders) {
                const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
                const defaultConfigPath = path.join(workspaceRoot, 'ArrakisTheater_OperaConfig.json');

                if (fs.existsSync(defaultConfigPath)) {
                    configPath = defaultConfigPath;
                    this.logger.info(`Found sample-config.json at: ${configPath}`);
                    // Auto-update settings to remember this path
                    await this.updateVSCodeSettings(configPath);
                }
            }

            if (configPath && fs.existsSync(configPath)) {
                await this.loadConfigFromFile(configPath);
            } else {
                this.logger.warn(
                    `${ZIGURAT_PENDING} Sin archivo Opera ni flota inventada — configure zigurat.* o cargue ArrakisTheater_OperaConfig.json`
                );
                this.setEmptyPendingConfiguration();
            }
        } catch (error) {
            this.logger.error('Failed to initialize configuration:', error);
            this.setEmptyPendingConfiguration();
        }
    }

    /**
     * Load configuration from file
     */
    private async loadConfigFromFile(filePath: string): Promise<void> {
        try {
            const configContent = fs.readFileSync(filePath, 'utf8');
            this.config = JSON.parse(configContent) as AlephScriptConfiguration;
            this.configPath = filePath;
            this.logger.info(`Configuration loaded from: ${filePath}`);
        } catch (error) {
            this.logger.error(`Failed to load config from ${filePath}:`, error);
            throw error;
        }
    }

    /**
     * Configuración vacía / pendiente (hostil-omite).
     * Sin rutas absolutas de otra máquina, sin flota fija, sin puertos inventados.
     */
    private setEmptyPendingConfiguration(): void {
        const ollamaFromSettings = resolveOllamaBaseUrl();
        const launcherPort = resolveLauncherPort();

        this.config = {
            "app": {
                "type": "arrakis-theater-opera"
            },
            "launcher": {
                "ollamaUrl": ollamaFromSettings,
                "requiredModel": "",
                "mcpServiceLauncherPort": launcherPort ?? 0,
                "healthCheckTimeout": 30000,
                "shutdownGracePeriod": 5000
            },
            "game": {
                "id": "",
                "name": "",
                "description": `${ZIGURAT_PENDING} sin configuración — zigurat.* / OperaConfig`,
                "mcpServerId": "",
                "graphId": "",
                "userId": "",
                "sessionId": "",
                "agentConfigs": []
            },
            "mcp": {
                "servers": {},
                "webs": {}
            },
            "orchestration": {
                "enableReplay": false,
                "replayBufferSize": 0,
                "enableLogging": true,
                "enableCrossChannelRouting": false,
                "messageTimeout": 10000
            },
            "ui": []
        };
        this.configPath = null;
        this.logger.info(`${ZIGURAT_PENDING} McpConfigurationManager en modo pendiente (servers/webs vacíos)`);
    }

    /**
     * Get MCP servers configuration
     */
    getMcpServers(): MCPServersConfig {
        return this.config?.mcp?.servers || {};
    }

    getMcpWebs(): MCPWebsConfig {
        return this.config?.mcp?.webs || {};
    }

    /**
     * Get specific MCP server configuration
     */
    getMcpServer(serverId: string): MCPServerConfig | undefined {
        return this.config?.mcp?.servers?.[serverId];
    }

    /**
     * Get all MCP server IDs
     */
    getMcpServerIds(): string[] {
        return Object.keys(this.config?.mcp?.servers || {});
    }

    /**
     * Get MCP server port
     */
    getMcpServerPort(serverId: string): number | undefined {
        return this.config?.mcp?.servers?.[serverId]?.port;
    }

    /**
     * Get launcher configuration
     */
    getLauncherConfig() {
        return this.config?.launcher;
    }

    /**
     * Get Ollama URL — zigurat.ollama.baseUrl, luego archivo; vacío = ⏳.
     */
    getOllamaUrl(): string {
        const fromSettings = resolveOllamaBaseUrl();
        if (fromSettings) {
            return fromSettings;
        }
        return this.config?.launcher?.ollamaUrl || '';
    }

    /**
     * Get MCP service launcher port — zigurat.launcher.port, luego archivo; undefined = ⏳.
     */
    getMcpServiceLauncherPort(): number | undefined {
        const fromSettings = resolveLauncherPort();
        if (fromSettings !== undefined) {
            return fromSettings;
        }
        const fromFile = this.config?.launcher?.mcpServiceLauncherPort;
        if (typeof fromFile === 'number' && fromFile > 0) {
            return fromFile;
        }
        return undefined;
    }

    /**
     * Get UI configurations
     */
    getUiConfigs(): UIConfig[] {
        return this.config?.ui || [];
    }

    /**
     * Get specific UI configuration
     */
    getUiConfig(uiId: string): UIConfig | undefined {
        return this.config?.ui?.find(ui => ui.id === uiId);
    }

    /**
     * Socket URL por defecto: zigurat.mesh.*, luego UI primaria del archivo.
     * Vacío si nada configurado (⏳ — no inventa localhost:puerto).
     */
    getDefaultSocketUrl(): string {
        const fromSettings = resolveMeshSocketUrl();
        if (fromSettings) {
            return fromSettings;
        }
        const primaryUi = this.config?.ui?.find(ui => ui.config.isPrimary);
        const port = primaryUi?.config?.port;
        if (typeof port === 'number' && port > 0) {
            return `ws://localhost:${port}`;
        }
        return '';
    }

    /**
     * Get orchestration configuration
     */
    getOrchestrationConfig() {
        return this.config?.orchestration;
    }

    /**
     * Get game configuration
     */
    getGameConfig() {
        return this.config?.game;
    }

    /**
     * Get the full configuration object
     */
    getFullConfig(): AlephScriptConfiguration | null {
        return this.config;
    }

    /**
     * Check if configuration is loaded
     */
    isConfigLoaded(): boolean {
        return this.config !== null;
    }

    /**
     * Reload configuration from file
     */
    async reloadConfig(): Promise<void> {
        if (this.configPath) {
            await this.loadConfigFromFile(this.configPath);
        } else {
            await this.initialize();
        }
    }

    /**
     * Update VS Code settings to point to the configuration file
     */
    async updateVSCodeSettings(configPath: string): Promise<void> {
        const config = vscode.workspace.getConfiguration('mcpSocketManager');
        await config.update('configPath', configPath, vscode.ConfigurationTarget.Workspace);

        // Also update the extension-specific setting for better visibility
        const alephConfig = vscode.workspace.getConfiguration('alephscript');
        await alephConfig.update('configurationFile', configPath, vscode.ConfigurationTarget.Workspace);

        this.logger.info(`Updated VS Code settings to use configuration file: ${configPath}`);
    }

    /**
     * Get the current configuration file path
     */
    getConfigurationPath(): string | null {
        return this.configPath;
    }

    /**
     * Save current configuration to the loaded file (if any)
     */
    async saveConfiguration(): Promise<void> {
        if (!this.configPath || !this.config) {
            throw new Error('No configuration file loaded or no configuration to save');
        }

        try {
            const configJson = JSON.stringify(this.config, null, 2);
            fs.writeFileSync(this.configPath, configJson, 'utf8');
            this.logger.info(`Configuration saved to: ${this.configPath}`);
        } catch (error) {
            this.logger.error(`Failed to save configuration to ${this.configPath}:`, error);
            throw error;
        }
    }

    /**
     * Update a specific section of the configuration
     */
    async updateConfiguration(updates: Partial<AlephScriptConfiguration>): Promise<void> {
        if (!this.config) {
            throw new Error('No configuration loaded');
        }

        // Deep merge the updates
        this.config = this.mergeConfigurations(this.config, updates);

        // Save if we have a file path
        if (this.configPath) {
            await this.saveConfiguration();
        }
    }

    /**
     * Deep merge two configuration objects
     */
    private mergeConfigurations(base: AlephScriptConfiguration, updates: Partial<AlephScriptConfiguration>): AlephScriptConfiguration {
        const result = JSON.parse(JSON.stringify(base)); // Deep clone

        for (const key in updates) {
            if (updates.hasOwnProperty(key)) {
                const value = updates[key as keyof AlephScriptConfiguration];
                if (value !== undefined) {
                    if (typeof value === 'object' && !Array.isArray(value)) {
                        result[key as keyof AlephScriptConfiguration] = {
                            ...result[key as keyof AlephScriptConfiguration],
                            ...value
                        };
                    } else {
                        result[key as keyof AlephScriptConfiguration] = value;
                    }
                }
            }
        }

        return result;
    }
}
