import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { BaseHackerPanelProvider } from './BaseHackerPanelProvider';
import { LogCategory } from '../loggingManager';
import { getLogger } from '../core/logging';

/**
 * WP-V71 · `handleMessage` recibe mensajes del webview, que es superficie no
 * confiable: el payload sale al canal por el redactor (WP-V71 CA4).
 */
const log = getLogger('HackerConfigPanel', LogCategory.WEBVIEW);

export interface ConfigGroup {
    name: string;
    icon: string;
    description: string;
    configs: ConfigItem[];
}

export interface ConfigItem {
    id: string;
    name: string;
    description: string;
    type: 'vscode-setting' | 'config-file';
    icon: string;
    value?: any;
    filePath?: string;
    settingKey?: string;
    category: string;
}

export class HackerConfigPanelProvider extends BaseHackerPanelProvider {
    public static readonly viewType = 'alephscript.hackerConfigPanel';

    constructor(
        extensionUri: vscode.Uri,
        context: vscode.ExtensionContext
    ) {
        super(extensionUri, context);
    }

    public get viewType(): string {
        return HackerConfigPanelProvider.viewType;
    }

    protected initializePanel(): void {
        setTimeout(() => this._updateConfigs(), 1000);
    }

    protected getHtmlContent(webview: vscode.Webview): string {
        const bodyContent = `
            <div class="config-panels" id="configPanels">
                <div class="loading-message">
                    <span class="blinking-text">>>> SCANNING QUANTUM CONFIGURATIONS...</span>
                </div>
            </div>
            
            <div class="system-controls">
                <button class="hacker-btn primary" data-action="refreshConfigs">
                    🔄 RESCAN_CONFIG_MATRIX
                </button>
                <button class="hacker-btn secondary" data-action="openWorkspaceSettings">
                    ⚙️ WORKSPACE_SETTINGS
                </button>
                <button class="hacker-btn secondary" data-action="openUserSettings">
                    👤 USER_SETTINGS
                </button>
            </div>
        `;

        return this.generateBaseHtml(
            webview,
            'hacker-config-panel.js',
            'hacker-config-panel.css',
            'ARRAKIS_CONFIG_MATRIX',
            bodyContent
        );
    }

    protected handleMessage(message: any): void {
        log.info('Received message from webview', { message });
        vscode.window.showInformationMessage(`HackerConfigPanel received: ${message.command}`);
        
        switch (message.command) {
            case 'openVSCodeSetting':
                log.info('Opening VS Code setting', { settingKey: message.settingKey });
                this._openVSCodeSetting(message.settingKey);
                break;
            case 'openConfigFile':
                log.info('Opening config file', { filePath: message.filePath });
                this._openConfigFile(message.filePath);
                break;
            case 'refreshConfigs':
                log.info('Refreshing configs');
                this._refreshConfigs();
                break;
            case 'openWorkspaceSettings':
                log.info('Opening workspace settings');
                this._openWorkspaceSettings();
                break;
            case 'openUserSettings':
                log.info('Opening user settings');
                this._openUserSettings();
                break;
            default:
                log.warn('Unknown command from webview', { command: message.command });
                vscode.window.showWarningMessage(`Unknown command: ${message.command}`);
        }
    }

    private async _openVSCodeSetting(settingKey: string): Promise<void> {
        try {
            // Use an exact ID query to reveal the specific setting in the Settings UI
            const query = `@id:${settingKey}`;
            await vscode.commands.executeCommand('workbench.action.openSettings', query);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to open setting: ${error}`);
        }
    }

    private async _openConfigFile(filePath: string): Promise<void> {
        try {
            const uri = vscode.Uri.file(filePath);
            await vscode.window.showTextDocument(uri);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to open config file: ${error}`);
        }
    }

    private async _openWorkspaceSettings(): Promise<void> {
        try {
            await vscode.commands.executeCommand('workbench.action.openWorkspaceSettings');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to open workspace settings: ${error}`);
        }
    }

    private async _openUserSettings(): Promise<void> {
        try {
            await vscode.commands.executeCommand('workbench.action.openSettings');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to open user settings: ${error}`);
        }
    }

    private _refreshConfigs(): void {
        this._updateConfigs();
    }

    private _updateConfigs(): void {
        if (this._view) {
            const configGroups = this._getConfigGroups();
            this.postMessage({
                command: 'updateConfigs',
                data: configGroups
            });
        }
    }

    private _getConfigGroups(): ConfigGroup[] {
        return [
            {
                name: "EXTENSION SETTINGS",
                icon: "⚡",
                description: "VS Code settings specific to Aleph-0",
                configs: this._getExtensionSettings()
            },
            {
                name: "WEBVIEW CONFIGURATIONS",
                icon: "🌐",
                description: "Webview and socket configurations",
                configs: this._getWebviewConfigs()
            },
            {
                name: "SCHEMA DEFINITIONS",
                icon: "📋",
                description: "JSON schema validation files",
                configs: this._getSchemaConfigs()
            },
            {
                name: "THEATRICAL CONTENT",
                icon: "🎭",
                description: "Theatrical agent configurations and content",
                configs: this._getTheatricalConfigs()
            },
            {
                name: "DEVELOPMENT CONFIGS",
                icon: "🛠️",
                description: "Build, test, and development configurations",
                configs: this._getDevConfigs()
            }
        ];
    }

    private _getExtensionSettings(): ConfigItem[] {
    // Use unscoped configuration to allow fetching values from multiple sections
    const allConfig = vscode.workspace.getConfiguration();
        const settings: ConfigItem[] = [];

        // Core extension settings (must match contributes.configuration in package.json)
        const extensionSettings = [
            { key: 'aleph0.theater.configPath', name: 'Theater Config Path', description: 'Path to the Theater configuration file' },
            { key: 'aleph0.theater.autoStart', name: 'Auto Start Theater', description: 'Auto-start Theater services when opening workspace' },
            { key: 'aleph0.theater.hackerMode', name: 'Hacker Mode', description: 'Enable hacker-style terminal aesthetics and green color scheme' },
            { key: 'alephscript.statusBar.visible', name: 'Status Bar: Visible', description: 'Show/hide the hacker panel quick access buttons in status bar' },
            { key: 'alephscript.statusBar.animation', name: 'Status Bar: Animation', description: 'Enable animations and effects for status bar buttons' },
            { key: 'alephscript.logging.level', name: 'Logging Level', description: 'Minimum log level to display' },
            { key: 'alephscript.logging.enabledCategories', name: 'Logging Categories', description: 'Log categories to enable' },
            { key: 'alephscript.logging.showTimestamp', name: 'Logging: Show Timestamp', description: 'Show timestamp in log entries' },
            { key: 'alephscript.logging.showLevel', name: 'Logging: Show Level', description: 'Show log level in log entries' },
            { key: 'alephscript.logging.showCategory', name: 'Logging: Show Category', description: 'Show category in log entries' },
            { key: 'alephscript.logging.showSource', name: 'Logging: Show Source', description: 'Show source in log entries' },
            { key: 'alephscript.logging.maxEntries', name: 'Logging: Max Entries', description: 'Maximum number of log entries to keep in memory' }
        ];

        extensionSettings.forEach(setting => {
            const value = allConfig.get(setting.key);
            settings.push({
                id: setting.key,
                name: setting.name,
                description: setting.description,
                type: 'vscode-setting',
                icon: '⚙️',
                value: value,
                settingKey: setting.key,
                category: 'extension'
            });
        });

        return settings;
    }

    private _getWebviewConfigs(): ConfigItem[] {
        const configs: ConfigItem[] = [];
        const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

        if (!workspacePath) return configs;

        const configFiles = [
            { file: 'sample-config.json', name: 'Sample Configuration', description: 'Sample webview configuration template' },
            { file: 'schemas/socket-config.schema.json', name: 'Socket Config Schema', description: 'Socket.io configuration validation schema' },
            { file: 'schemas/webrtc-ui-config.schema.json', name: 'WebRTC Config Schema', description: 'WebRTC UI configuration schema' },
            { file: 'schemas/xplus1-config.schema.json', name: 'XPlus1 Config Schema', description: 'XPlus1 gaming configuration schema' }
        ];

        configFiles.forEach(configFile => {
            const filePath = path.join(workspacePath, configFile.file);
            if (fs.existsSync(filePath)) {
                configs.push({
                    id: configFile.file,
                    name: configFile.name,
                    description: configFile.description,
                    type: 'config-file',
                    icon: '📄',
                    filePath: filePath,
                    category: 'webview'
                });
            }
        });

        return configs;
    }

    private _getSchemaConfigs(): ConfigItem[] {
        const configs: ConfigItem[] = [];
        const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

        if (!workspacePath) return configs;

        const schemaDir = path.join(workspacePath, 'schemas');
        if (fs.existsSync(schemaDir)) {
            const schemaFiles = fs.readdirSync(schemaDir).filter(file => file.endsWith('.schema.json'));
            
            schemaFiles.forEach(file => {
                const filePath = path.join(schemaDir, file);
                configs.push({
                    id: file,
                    name: file.replace('.schema.json', '').replace(/-/g, ' ').toUpperCase(),
                    description: `JSON schema for ${file.replace('.schema.json', '')} validation`,
                    type: 'config-file',
                    icon: '📋',
                    filePath: filePath,
                    category: 'schema'
                });
            });
        }

        return configs;
    }

    private _getTheatricalConfigs(): ConfigItem[] {
        const configs: ConfigItem[] = [];
        const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

        if (!workspacePath) return configs;

        const theatricalFiles = [
            { dir: 'theatrical-content/configurations', pattern: '*.json', name: 'Agent Configurations' },
            { dir: 'theatrical-content/content', pattern: '*.json', name: 'Content Definitions' },
            { dir: 'src/theatrical', pattern: '*.ts', name: 'Theatrical TypeScript' }
        ];

        theatricalFiles.forEach(config => {
            const dirPath = path.join(workspacePath, config.dir);
            if (fs.existsSync(dirPath)) {
                const files = fs.readdirSync(dirPath).filter(file => {
                    if (config.pattern === '*.json') return file.endsWith('.json');
                    if (config.pattern === '*.ts') return file.endsWith('.ts');
                    return false;
                });

                files.forEach(file => {
                    const filePath = path.join(dirPath, file);
                    configs.push({
                        id: `theatrical-${file}`,
                        name: file,
                        description: `${config.name} - ${file}`,
                        type: 'config-file',
                        icon: '🎭',
                        filePath: filePath,
                        category: 'theatrical'
                    });
                });
            }
        });

        return configs;
    }

    private _getDevConfigs(): ConfigItem[] {
        const configs: ConfigItem[] = [];
        const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

        if (!workspacePath) return configs;

        const devFiles = [
            { file: 'package.json', name: 'Package Configuration', description: 'NPM package and extension manifest' },
            { file: 'tsconfig.json', name: 'TypeScript Config', description: 'TypeScript compiler configuration' },
            { file: 'tsconfig.build.json', name: 'Build TypeScript Config', description: 'TypeScript build configuration' },
            { file: 'jest.config.js', name: 'Jest Configuration', description: 'Jest testing framework configuration' },
            { file: '.vscode/tasks.json', name: 'VS Code Tasks', description: 'VS Code task runner configuration' },
            { file: '.vscode/launch.json', name: 'Debug Configuration', description: 'VS Code debug launch configuration' }
        ];

        devFiles.forEach(configFile => {
            const filePath = path.join(workspacePath, configFile.file);
            if (fs.existsSync(filePath)) {
                configs.push({
                    id: configFile.file,
                    name: configFile.name,
                    description: configFile.description,
                    type: 'config-file',
                    icon: '🛠️',
                    filePath: filePath,
                    category: 'development'
                });
            }
        });

        return configs;
    }
}