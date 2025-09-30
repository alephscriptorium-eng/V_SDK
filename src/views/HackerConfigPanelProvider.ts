import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { BaseHackerPanelProvider } from './BaseHackerPanelProvider';

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
                <button class="hacker-btn primary" onclick="refreshConfigs()">
                    🔄 RESCAN_CONFIG_MATRIX
                </button>
                <button class="hacker-btn secondary" onclick="openWorkspaceSettings()">
                    ⚙️ WORKSPACE_SETTINGS
                </button>
                <button class="hacker-btn secondary" onclick="openUserSettings()">
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
        switch (message.command) {
            case 'openVSCodeSetting':
                this._openVSCodeSetting(message.settingKey);
                break;
            case 'openConfigFile':
                this._openConfigFile(message.filePath);
                break;
            case 'refreshConfigs':
                this._refreshConfigs();
                break;
            case 'openWorkspaceSettings':
                this._openWorkspaceSettings();
                break;
            case 'openUserSettings':
                this._openUserSettings();
                break;
        }
    }

    private async _openVSCodeSetting(settingKey: string): Promise<void> {
        try {
            await vscode.commands.executeCommand('workbench.action.openSettings', settingKey);
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
                description: "VS Code settings specific to Arrakis Theater",
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
        const config = vscode.workspace.getConfiguration('alephscript');
        const settings: ConfigItem[] = [];

        // Core extension settings
        const extensionSettings = [
            { key: 'alephscript.enableTeatroMode', name: 'Teatro Mode', description: 'Enable theatrical AI agent mode' },
            { key: 'alephscript.webview.autoStart', name: 'Auto Start Webviews', description: 'Automatically start webview servers' },
            { key: 'alephscript.webview.defaultPort', name: 'Default Port', description: 'Default port for webview servers' },
            { key: 'alephscript.socket.enableMonitoring', name: 'Socket Monitoring', description: 'Enable real-time socket monitoring' },
            { key: 'alephscript.mcp.serverPath', name: 'MCP Server Path', description: 'Path to MCP server executable' },
            { key: 'alephscript.debug.verbose', name: 'Verbose Logging', description: 'Enable verbose debug logging' },
            { key: 'alephscript.ui.theme', name: 'UI Theme', description: 'UI theme preference (dark/light/hacker)' },
            { key: 'alephscript.gamification.enabled', name: 'Gamification', description: 'Enable gamification features' }
        ];

        extensionSettings.forEach(setting => {
            const value = config.get(setting.key);
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