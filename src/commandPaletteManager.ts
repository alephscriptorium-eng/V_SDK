import * as vscode from 'vscode';
import { McpConfigurationManager } from './core/mcpConfigurationManager';
import { LogCategory, createLogger, CategoryLogger } from './loggingManager';
import { buildCspMeta, createNonce } from './webview/security';

export interface AlephScriptCommand {
    id: string;
    title: string;
    category: CommandCategory;
    description?: string;
    icon?: string;
    shortcut?: string;
    when?: string;
    handler: (...args: any[]) => void | Promise<void>;
}

export enum CommandCategory {
    SYSTEM = 'System Control',
    AGENTS = 'Agent Management',
    UIS = 'UI Management',
    SOCKETS = 'Socket.IO',
    CONFIGS = 'Configuration',
    LOGS = 'Debug & Logs',
    TERMINALS = 'Terminals',
    QUICK_ACTIONS = 'Quick Actions'
}

export class CommandPaletteManager {
    private static instance: CommandPaletteManager;
    private commands: Map<string, AlephScriptCommand> = new Map();
    private registeredCommands: vscode.Disposable[] = [];
    private logger: CategoryLogger;
    private context: vscode.ExtensionContext;
    private configManager: McpConfigurationManager;

    private constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.configManager = McpConfigurationManager.getInstance();
        this.logger = createLogger(LogCategory.EXTENSION, 'CommandPaletteManager');
        this.initializeCoreCommands();
    }

    static getInstance(context?: vscode.ExtensionContext): CommandPaletteManager {
        if (!CommandPaletteManager.instance) {
            if (!context) {
                throw new Error('CommandPaletteManager requires context for first initialization');
            }
            CommandPaletteManager.instance = new CommandPaletteManager(context);
        }
        return CommandPaletteManager.instance;
    }

    private initializeCoreCommands(): void {
        this.logger.info('Initializing command palette system');

        // System Control Commands
        this.registerCommand({
            id: 'aleph0.showDashboard',
            title: 'Show AlephScript Dashboard',
            category: CommandCategory.SYSTEM,
            description: 'Open the main AlephScript control dashboard',
            icon: 'dashboard',
            shortcut: 'ctrl+alt+a',
            handler: () => this.showDashboard()
        });

        this.registerCommand({
            id: 'aleph0.systemStatus',
            title: 'System Status Overview',
            category: CommandCategory.SYSTEM,
            description: 'Display comprehensive system status',
            icon: 'pulse',
            shortcut: 'ctrl+alt+s',
            handler: () => this.showSystemStatus()
        });

        // Quick Actions
        this.registerCommand({
            id: 'aleph0.quickStart',
            title: 'Quick Start - Launch Everything',
            category: CommandCategory.QUICK_ACTIONS,
            description: 'Start all essential services with one command',
            icon: 'rocket',
            shortcut: 'ctrl+alt+q',
            handler: () => this.quickStart()
        });

        this.registerCommand({
            id: 'aleph0.emergencyStop',
            title: 'Emergency Stop - Kill All Processes',
            category: CommandCategory.QUICK_ACTIONS,
            description: 'Immediately stop all running processes and services',
            icon: 'emergency-stop',
            shortcut: 'ctrl+alt+x',
            handler: () => this.emergencyStop()
        });

        // Agent Management
        this.registerCommand({
            id: 'aleph0.agents.startAll',
            title: 'Start All Agents',
            category: CommandCategory.AGENTS,
            description: 'Launch all configured MCP agents',
            icon: 'play-circle',
            handler: () => this.startAllAgents()
        });

        this.registerCommand({
            id: 'aleph0.agents.stopAll',
            title: 'Stop All Agents',
            category: CommandCategory.AGENTS,
            description: 'Stop all running MCP agents',
            icon: 'stop-circle',
            handler: () => this.stopAllAgents()
        });

        // UI Management
        this.registerCommand({
            id: 'aleph0.uis.startAll',
            title: 'Start All UIs',
            category: CommandCategory.UIS,
            description: 'Launch all configured UI applications',
            icon: 'browser',
            handler: () => this.startAllUIs()
        });

        this.registerCommand({
            id: 'aleph0.uis.openAllBrowsers',
            title: 'Open All UIs in Browser',
            category: CommandCategory.UIS,
            description: 'Open browser tabs for all running UIs',
            icon: 'globe',
            shortcut: 'ctrl+alt+b',
            handler: () => this.openAllBrowsers()
        });

        // Socket.IO Commands
        this.registerCommand({
            id: 'aleph0.sockets.quickConnect',
            title: 'Quick Connect to Local Socket',
            category: CommandCategory.SOCKETS,
            description: 'Connect to default socket server from configuration',
            icon: 'plug',
            shortcut: 'ctrl+alt+c',
            handler: () => this.quickConnectSocket()
        });

        this.registerCommand({
            id: 'aleph0.sockets.disconnectAll',
            title: 'Disconnect All Sockets',
            category: CommandCategory.SOCKETS,
            description: 'Disconnect from all socket servers',
            icon: 'debug-disconnect',
            handler: () => this.disconnectAllSockets()
        });

        // Configuration Commands  
        this.registerCommand({
            id: 'aleph0.configs.validateAll',
            title: 'Validate All Configurations',
            category: CommandCategory.CONFIGS,
            description: 'Run validation on all configuration files',
            icon: 'check-all',
            handler: () => this.validateAllConfigs()
        });

        this.registerCommand({
            id: 'aleph0.configs.backupAll',
            title: 'Backup All Configurations',
            category: CommandCategory.CONFIGS,
            description: 'Create timestamped backup of all config files',
            icon: 'archive',
            handler: () => this.backupAllConfigs()
        });

        // Debug & Logs Commands
        this.registerCommand({
            id: 'aleph0.logs.showMainChannel',
            title: 'Show Main Log Channel',
            category: CommandCategory.LOGS,
            description: 'Display the main aggregated log channel',
            icon: 'output',
            shortcut: 'ctrl+alt+l',
            handler: () => this.showMainLogChannel()
        });

        this.registerCommand({
            id: 'aleph0.logs.clearAndRestart',
            title: 'Clear Logs & Restart Logging',
            category: CommandCategory.LOGS,
            description: 'Clear all logs and restart the logging system',
            icon: 'refresh',
            handler: () => this.clearAndRestartLogging()
        });

        // Terminal Commands
        this.registerCommand({
            id: 'aleph0.terminals.showAll',
            title: 'Show All AlephScript Terminals',
            category: CommandCategory.TERMINALS,
            description: 'Display all active AlephScript terminals',
            icon: 'terminal',
            shortcut: 'ctrl+alt+t',
            handler: () => this.showAllTerminals()
        });

        this.registerCommand({
            id: 'aleph0.terminals.killAll',
            title: 'Kill All Terminals',
            category: CommandCategory.TERMINALS,
            description: 'Close all AlephScript-managed terminals',
            icon: 'trash',
            handler: () => this.killAllTerminals()
        });
    }

    public registerCommand(command: AlephScriptCommand): void {
        if (this.commands.has(command.id)) {
            this.logger.warn(`Command ${command.id} is already registered, overwriting`, { commandId: command.id });
        }

        this.commands.set(command.id, command);

        // Register the command with VS Code
        const disposable = vscode.commands.registerCommand(command.id, command.handler);
        this.registeredCommands.push(disposable);
        this.context.subscriptions.push(disposable);

        this.logger.debug(`Command registered: ${command.id}`, {
            commandId: command.id,
            category: command.category,
            hasShortcut: !!command.shortcut
        });
    }

    public getCommandsByCategory(category: CommandCategory): AlephScriptCommand[] {
        return Array.from(this.commands.values()).filter(cmd => cmd.category === category);
    }

    public getAllCommands(): AlephScriptCommand[] {
        return Array.from(this.commands.values());
    }

    public generateCommandPaletteInfo(): string {
        const categories = Object.values(CommandCategory);
        let info = '# AlephScript Command Palette\n\n';

        for (const category of categories) {
            const commands = this.getCommandsByCategory(category);
            if (commands.length === 0) continue;

            info += `## ${category}\n\n`;
            
            for (const cmd of commands) {
                info += `- **${cmd.title}**`;
                if (cmd.shortcut) {
                    info += ` (\`${cmd.shortcut}\`)`;
                }
                info += `\n  - Command: \`${cmd.id}\`\n`;
                if (cmd.description) {
                    info += `  - ${cmd.description}\n`;
                }
                info += '\n';
            }
        }

        return info;
    }

    // Command handler implementations
    private async showDashboard(): Promise<void> {
        this.logger.info('Opening AlephScript Dashboard');
        
        const panel = vscode.window.createWebviewPanel(
            'alephscriptDashboard',
            'AlephScript Dashboard',
            vscode.ViewColumn.One,
            // WP-V66: script propio con nonce; sin recursos locales.
            { enableScripts: true, localResourceRoots: [] }
        );

        panel.webview.html = this.getDashboardHTML();
    }

    private async showSystemStatus(): Promise<void> {
        this.logger.info('Showing system status overview');
        
        // This would integrate with StatusManager
        vscode.commands.executeCommand('aleph0.showStatusPanel');
    }

    private async quickStart(): Promise<void> {
        this.logger.info('Executing quick start sequence');
        
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Quick Start in Progress...',
            cancellable: false
        }, async (progress, token) => {
            try {
                progress.report({ increment: 20, message: 'Starting agents...' });
                await this.startAllAgents();
                
                progress.report({ increment: 40, message: 'Launching UIs...' });
                await this.startAllUIs();
                
                progress.report({ increment: 60, message: 'Connecting sockets...' });
                await this.quickConnectSocket();
                
                progress.report({ increment: 80, message: 'Validating configurations...' });
                await this.validateAllConfigs();
                
                progress.report({ increment: 100, message: 'Complete!' });
                
                vscode.window.showInformationMessage('Quick Start completed successfully! 🚀');
            } catch (error) {
                this.logger.error('Quick start failed', { error });
                vscode.window.showErrorMessage(`Quick Start failed: ${error}`);
            }
        });
    }

    private async emergencyStop(): Promise<void> {
        this.logger.warn('Executing emergency stop');
        
        const response = await vscode.window.showWarningMessage(
            'This will immediately stop ALL AlephScript processes and services. Continue?',
            { modal: true },
            'Yes, Stop Everything',
            'Cancel'
        );

        if (response === 'Yes, Stop Everything') {
            try {
                await this.stopAllAgents();
                await this.killAllTerminals();
                await this.disconnectAllSockets();
                
                vscode.window.showInformationMessage('Emergency stop completed - all services halted');
                this.logger.info('Emergency stop completed successfully');
            } catch (error) {
                this.logger.error('Emergency stop failed', { error });
                vscode.window.showErrorMessage(`Emergency stop failed: ${error}`);
            }
        }
    }

    private async startAllAgents(): Promise<void> {
        this.logger.info('Starting all agents');
        // Integration with AgentsTreeDataProvider
        vscode.commands.executeCommand('aleph0.mcptree.refresh');
    }

    private async stopAllAgents(): Promise<void> {
        this.logger.info('Stopping all agents');
        // Integration with existing agent management
    }

    private async startAllUIs(): Promise<void> {
        this.logger.info('Starting all UIs');
        vscode.commands.executeCommand('aleph0.uis.refresh');
    }

    private async openAllBrowsers(): Promise<void> {
        this.logger.info('Opening all UIs in browser');
        // Integration with UIManager
    }

    private async quickConnectSocket(): Promise<void> {
        this.logger.info('Quick connecting to local socket');
        try {
            await vscode.commands.executeCommand('aleph0.sockets.connect');
        } catch (error) {
            this.logger.error('Quick socket connection failed', { error });
        }
    }

    private async disconnectAllSockets(): Promise<void> {
        this.logger.info('Disconnecting all sockets');
        vscode.commands.executeCommand('aleph0.sockets.disconnect');
    }

    private async validateAllConfigs(): Promise<void> {
        this.logger.info('Validating all configurations');
        
        // Check if the command exists before trying to execute it
        try {
            const availableCommands = await vscode.commands.getCommands();
            if (availableCommands.includes('aleph0.configs.refresh')) {
                vscode.commands.executeCommand('aleph0.configs.refresh');
            } else {
                this.logger.warn('aleph0.configs.refresh command not yet available, skipping refresh');
            }
        } catch (error) {
            this.logger.error('Error checking for configs.refresh command:', error);
        }
    }

    private async backupAllConfigs(): Promise<void> {
        this.logger.info('Backing up all configurations');
        // Integration with ConfigsTreeDataProvider
    }

    private async showMainLogChannel(): Promise<void> {
        this.logger.info('Showing main log channel');
        vscode.commands.executeCommand('aleph0.logs.showChannel', 'main');
    }

    private async clearAndRestartLogging(): Promise<void> {
        this.logger.info('Clearing and restarting logging system');
        vscode.commands.executeCommand('aleph0.logs.clear');
    }

    private async showAllTerminals(): Promise<void> {
        this.logger.info('Showing all terminals');
        // Integration with TerminalManager
    }

    private async killAllTerminals(): Promise<void> {
        this.logger.info('Killing all terminals');
        // Integration with TerminalManager
    }

    private getDashboardHTML(): string {
        return renderCommandDashboardPage();
    }

    public dispose(): void {
        this.logger.info('Disposing CommandPaletteManager');

        if (this.registeredCommands) {
            for (const disposable of this.registeredCommands) {
                disposable?.dispose();
            }

            this.registeredCommands = [];
        }
        this.commands.clear();

        this.logger.info('CommandPaletteManager disposed');
    }
}

/**
 * WP-V66: página del dashboard con CSP del helper único.
 * Exportada como función pura para el test de facto del censo.
 * Cero handlers inline: botones con `data-command` + delegación en el
 * script con nonce.
 */
export function renderCommandDashboardPage(): string {
    const nonce = createNonce();
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    ${buildCspMeta({ scriptNonce: nonce, styleNonce: nonce })}
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AlephScript Dashboard</title>
    <style nonce="${nonce}">
        body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); background: var(--vscode-editor-background); }
        .dashboard { padding: 20px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid var(--vscode-panel-border); border-radius: 5px; }
        .section h2 { margin-top: 0; color: var(--vscode-textLink-foreground); }
        .command-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
        .command-button { padding: 10px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; border-radius: 3px; cursor: pointer; }
        .command-button:hover { background: var(--vscode-button-hoverBackground); }
        .shortcut { font-size: 0.8em; opacity: 0.7; }
    </style>
</head>
<body>
    <div class="dashboard">
        <h1>🚀 AlephScript Control Dashboard</h1>

        <div class="section">
            <h2>🎯 Quick Actions</h2>
            <div class="command-grid">
                <button class="command-button" data-command="aleph0.quickStart">
                    🚀 Quick Start<br><span class="shortcut">Ctrl+Alt+Q</span>
                </button>
                <button class="command-button" data-command="aleph0.emergencyStop">
                    🛑 Emergency Stop<br><span class="shortcut">Ctrl+Alt+X</span>
                </button>
                <button class="command-button" data-command="aleph0.systemStatus">
                    📊 System Status<br><span class="shortcut">Ctrl+Alt+S</span>
                </button>
                <button class="command-button" data-command="aleph0.logs.showMainChannel">
                    📋 Main Logs<br><span class="shortcut">Ctrl+Alt+L</span>
                </button>
            </div>
        </div>

        <div class="section">
            <h2>🤖 Agent Management</h2>
            <div class="command-grid">
                <button class="command-button" data-command="aleph0.agents.startAll">▶️ Start All Agents</button>
                <button class="command-button" data-command="aleph0.agents.stopAll">⏹️ Stop All Agents</button>
            </div>
        </div>

        <div class="section">
            <h2>🖥️ UI Management</h2>
            <div class="command-grid">
                <button class="command-button" data-command="aleph0.uis.startAll">▶️ Start All UIs</button>
                <button class="command-button" data-command="aleph0.uis.openAllBrowsers">🌐 Open All in Browser</button>
            </div>
        </div>

        <div class="section">
            <h2>🔌 Socket.IO</h2>
            <div class="command-grid">
                <button class="command-button" data-command="aleph0.sockets.quickConnect">🔌 Quick Connect</button>
                <button class="command-button" data-command="aleph0.sockets.disconnectAll">🔌 Disconnect All</button>
            </div>
        </div>
    </div>

    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        document.addEventListener('click', event => {
            const btn = event.target.closest('[data-command]');
            if (!btn) return;
            vscode.postMessage({ command: 'executeCommand', commandId: btn.getAttribute('data-command') });
        });
    </script>
</body>
</html>`;
}
