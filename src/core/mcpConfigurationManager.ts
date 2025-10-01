import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { AlephScriptConfiguration, MCPServerConfig, MCPServersConfig, UIConfig } from '../mcpTypes';
import { LoggingManager, LogCategory, createLogger } from '../loggingManager';

export class McpConfigurationManager {
    private static instance: McpConfigurationManager;
    private config: AlephScriptConfiguration | null = null;
    private configPath: string | null = null;
    private readonly logger = createLogger(LogCategory.EXTENSION, 'McpConfigurationManager');

    private constructor() {
        console.log(`McpConfigurationManager, to init you can use:
        {
            "command": "ArrakisTheater.LoadConfig",
            "title": "🎭 Load Opera Configuration",
            "category": "⚙️ Arrakis Configuration",
            "icon": "$(folder-opened)"
        },
        {
            "command": "ArrakisTheater.DownloadConfig",
            "title": "🎭 Download Configuration",
            "category": "⚙️ Arrakis Configuration",
            "icon": "$(save)"
        }
        `)
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
                this.logger.warn('No configuration file found, using default values');
                this.setDefaultConfiguration();
            }
        } catch (error) {
            this.logger.error('Failed to initialize configuration:', error);
            this.setDefaultConfiguration();
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
     * Set default configuration values
     */
    private setDefaultConfiguration(): void {
        this.config = {
            "app": {
                "type": "arrakis-theater-opera"
            },
            "launcher": {
                "ollamaUrl": "http://localhost:11434",
                "requiredModel": "GPT-OSS:20b",
                "mcpServiceLauncherPort": 3050,
                "healthCheckTimeout": 30000,
                "shutdownGracePeriod": 5000
            },
            "game": {
                "id": "arrakis-theater-opera-demo",
                "name": "X+1 Demo Game",
                "description": "Demo configuration for testing the VS Code extension",
                "mcpServerId": "state-machine-server",
                "graphId": "arrakis-theater-opera-game",
                "userId": "player-1",
                "sessionId": "demo-session",
                "agentConfigs": [
                    {
                        "id": "test-agent",
                        "name": "TestAgent",
                        "role": "narrator",
                        "description": "Test agent for demonstration",
                        "mcpServerId": "state-machine-server",
                        "autoStart": true,
                        "priority": 10
                    }
                ]
            },
            "mcp": {
                "servers": {
                    "state-machine-server": {
                        "port": 3001,
                        "wdir": "/c/Users/oracl/Documents/REPOS/mcp-mesh-sdk",
                        "cmd": "npm",
                        "args": ["start"],
                        "desc": ""
                    },
                    "wiki-mcp-browser": {
                        "port": 3002,
                        "wdir": "/c/Users/oracl/Documents/REPOS/mcp-mesh-sdk",
                        "cmd": "npm",
                        "args": ["start"],
                        "desc": ""
                    },
                    "devops-mcp-server": {
                        "port": 3003,
                        "wdir": "/c/Users/oracl/Documents/REPOS/mcp-mesh-sdk",
                        "cmd": "npm",
                        "args": ["start"],
                        "desc": ""
                    },
                    "mcp-mesh-sdk": {
                        "port": 3010,
                        "wdir": "/c/Users/oracl/Documents/REPOS/mcp-mesh-sdk",
                        "cmd": "npm",
                        "args": ["start"],
                        "desc": ""
                    }
                }
            },
            "orchestration": {
                "enableReplay": true,
                "replayBufferSize": 200,
                "enableLogging": true,
                "enableCrossChannelRouting": true,
                "messageTimeout": 10000
            },
            "ui": [
                {
                    "id": "console-demo",
                    "name": "Demo Console UI",
                    "type": "custom",
                    "enabled": true,
                    "config": {
                        "isPrimary": true,
                        "autoStart": true,
                        "port": 8080
                    }
                },
                {
                    "id": "web-demo",
                    "name": "Demo Web UI",
                    "type": "html5",
                    "enabled": true,
                    "config": {
                        "port": 8081,
                        "autoStart": false
                    }
                }
            ]
        }
    }

    /**
     * Get MCP servers configuration
     */
    getMcpServers(): MCPServersConfig {
        return this.config?.mcp?.servers || {};
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
     * Get Ollama URL from launcher config
     */
    getOllamaUrl(): string {
        return this.config?.launcher?.ollamaUrl || 'http://localhost:11434';
    }

    /**
     * Get MCP service launcher port
     */
    getMcpServiceLauncherPort(): number {
        return this.config?.launcher?.mcpServiceLauncherPort || 3050;
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
     * Get default socket URL for WebSocket connections
     */
    getDefaultSocketUrl(): string {
        // Look for the primary UI port, fallback to 3000
        const primaryUi = this.config?.ui?.find(ui => ui.config.isPrimary);
        const port = primaryUi?.config.port || 3000;
        return `ws://localhost:${port}`;
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