import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { McpConfigurationManager } from './mcpConfigurationManager';
import { AlephScriptConfiguration } from '../mcpTypes';
import { LoggingManager, LogCategory, createLogger } from '../loggingManager';

export class ConfigurationCommandsService {
    private static instance: ConfigurationCommandsService;
    private readonly logger = createLogger(LogCategory.EXTENSION, 'ConfigurationCommandsService');
    private configManager: McpConfigurationManager;

    private constructor() {
        this.configManager = McpConfigurationManager.getInstance();
    }

    static getInstance(): ConfigurationCommandsService {
        if (!ConfigurationCommandsService.instance) {
            ConfigurationCommandsService.instance = new ConfigurationCommandsService();
        }
        return ConfigurationCommandsService.instance;
    }

    /**
     * Command: ArrakisTheater.LoadConfig
     * Allow user to select a JSON configuration file and restart extension with it
     */
    async loadConfigCommand(): Promise<void> {
        try {
            // Show file picker for JSON files
            const fileUri = await vscode.window.showOpenDialog({
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false,
                filters: {
                    'JSON Configuration Files': ['json'],
                    'ArrakisTheater Opera Config': ['json']
                },
                openLabel: 'Load Arrakis Theater Configuration',
                title: 'Select Configuration File'
            });

            if (!fileUri || fileUri.length === 0) {
                this.logger.info('User cancelled configuration file selection');
                return;
            }

            const configPath = fileUri[0].fsPath;
            this.logger.info(`Loading configuration from: ${configPath}`);

            // Validate the configuration file
            await this.validateConfigurationFile(configPath);

            // Update VS Code settings to point to this configuration
            await this.updateConfigurationSettings(configPath);

            // Reload the configuration manager
            await this.configManager.reloadConfig();

            // Show success message with option to restart
            const action = await vscode.window.showInformationMessage(
                `Configuration loaded from ${path.basename(configPath)}. Would you like to restart the extension to apply all changes?`,
                'Restart Extension',
                'Continue Without Restart'
            );

            if (action === 'Restart Extension') {
                await this.restartExtension();
            } else {
                vscode.window.showInformationMessage('Configuration loaded. Some changes may require a restart to take full effect.');
            }

        } catch (error) {
            this.logger.error('Failed to load configuration:', error);
            vscode.window.showErrorMessage(`Failed to load configuration: ${error}`);
        }
    }

    /**
     * Command: ArrakisTheater.DownloadConfig  
     * Export current configuration to a JSON file
     */
    async downloadConfigCommand(): Promise<void> {
        try {
            // Ensure configuration is loaded
            if (!this.configManager.isConfigLoaded()) {
                await this.configManager.initialize();
            }

            const currentConfig = this.configManager.getFullConfig();
            if (!currentConfig) {
                throw new Error('No configuration currently loaded');
            }

            // Show save dialog
            const saveUri = await vscode.window.showSaveDialog({
                filters: {
                    'JSON Configuration Files': ['json'],
                    'ArrakisTheater Opera Config': ['json']
                },
                defaultUri: vscode.Uri.file('ArrakisTheater_OperaConfig.json'),
                saveLabel: 'Download Configuration',
                title: 'Save Arrakis Theater Configuration'
            });

            if (!saveUri) {
                this.logger.info('User cancelled configuration download');
                return;
            }

            // Write configuration to file with pretty formatting
            const configJson = JSON.stringify(currentConfig, null, 2);
            fs.writeFileSync(saveUri.fsPath, configJson, 'utf8');

            this.logger.info(`Configuration exported to: ${saveUri.fsPath}`);
            
            const action = await vscode.window.showInformationMessage(
                `Configuration downloaded to ${path.basename(saveUri.fsPath)}`,
                'Open File',
                'Open Folder'
            );

            if (action === 'Open File') {
                await vscode.window.showTextDocument(saveUri);
            } else if (action === 'Open Folder') {
                await vscode.commands.executeCommand('revealFileInOS', saveUri);
            }

        } catch (error) {
            this.logger.error('Failed to download configuration:', error);
            vscode.window.showErrorMessage(`Failed to download configuration: ${error}`);
        }
    }

    /**
     * Command: ArrakisTheater.ResetConfig
     * Reset to default configuration
     */
    async resetConfigCommand(): Promise<void> {
        try {
            const action = await vscode.window.showWarningMessage(
                'This will reset your Arrakis Theater configuration to defaults. This action cannot be undone.',
                'Reset to Defaults',
                'Cancel'
            );

            if (action !== 'Reset to Defaults') {
                return;
            }

            // Clear the configuration path from settings
            const config = vscode.workspace.getConfiguration('mcpSocketManager');
            await config.update('configPath', undefined, vscode.ConfigurationTarget.Workspace);

            // Reload configuration manager (will use defaults)
            await this.configManager.reloadConfig();

            vscode.window.showInformationMessage('Configuration reset to defaults. Consider restarting the extension for full effect.');

        } catch (error) {
            this.logger.error('Failed to reset configuration:', error);
            vscode.window.showErrorMessage(`Failed to reset configuration: ${error}`);
        }
    }

    /**
     * Command: ArrakisTheater.ShowCurrentConfig
     * Display current configuration in a new document
     */
    async showCurrentConfigCommand(): Promise<void> {
        try {
            if (!this.configManager.isConfigLoaded()) {
                await this.configManager.initialize();
            }

            const currentConfig = this.configManager.getFullConfig();
            if (!currentConfig) {
                vscode.window.showWarningMessage('No configuration currently loaded');
                return;
            }

            // Create a new untitled document with the configuration
            const configJson = JSON.stringify(currentConfig, null, 2);
            const doc = await vscode.workspace.openTextDocument({
                content: configJson,
                language: 'json'
            });

            await vscode.window.showTextDocument(doc);

        } catch (error) {
            this.logger.error('Failed to show current configuration:', error);
            vscode.window.showErrorMessage(`Failed to show current configuration: ${error}`);
        }
    }

    /**
     * Validate that a configuration file is valid
     */
    private async validateConfigurationFile(filePath: string): Promise<void> {
        try {
            const configContent = fs.readFileSync(filePath, 'utf8');
            const config = JSON.parse(configContent) as AlephScriptConfiguration;

            // Basic validation
            if (!config.mcp || !config.mcp.servers) {
                throw new Error('Configuration file must contain mcp.servers section');
            }

            if (!config.launcher) {
                this.logger.warn('Configuration file missing launcher section, will use defaults');
            }

            if (!config.ui || config.ui.length === 0) {
                this.logger.warn('Configuration file missing UI section, will use defaults');
            }

            this.logger.info('Configuration file validation passed');

        } catch (error) {
            if (error instanceof SyntaxError) {
                throw new Error(`Invalid JSON in configuration file: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Update VS Code settings to point to the configuration file
     */
    private async updateConfigurationSettings(configPath: string): Promise<void> {
        const config = vscode.workspace.getConfiguration('mcpSocketManager');
        await config.update('configPath', configPath, vscode.ConfigurationTarget.Workspace);
        
        // Also update the extension-specific setting for better visibility
        const alephConfig = vscode.workspace.getConfiguration('alephscript');
        await alephConfig.update('configurationFile', configPath, vscode.ConfigurationTarget.Workspace);
        
        this.logger.info(`Updated VS Code settings to use configuration file: ${configPath}`);
    }

    /**
     * Restart the extension (reload VS Code window)
     */
    private async restartExtension(): Promise<void> {
        await vscode.commands.executeCommand('workbench.action.reloadWindow');
    }

    /**
     * Register all configuration commands
     */
    static registerCommands(context: vscode.ExtensionContext): void {
        const service = ConfigurationCommandsService.getInstance();
        
        const commands = [
            vscode.commands.registerCommand('ArrakisTheater.LoadConfig', () => service.loadConfigCommand()),
            vscode.commands.registerCommand('ArrakisTheater.DownloadConfig', () => service.downloadConfigCommand()),
            vscode.commands.registerCommand('ArrakisTheater.ResetConfig', () => service.resetConfigCommand()),
            vscode.commands.registerCommand('ArrakisTheater.ShowCurrentConfig', () => service.showCurrentConfigCommand())
        ];

        commands.forEach(command => context.subscriptions.push(command));
    }
}