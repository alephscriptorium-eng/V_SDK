import * as vscode from 'vscode';
import { BaseHackerPanelProvider } from './BaseHackerPanelProvider';

export interface CommandInfo {
    id: string;
    title: string;
    category: string;
    description?: string;
    icon?: string;
    shortcut?: string;
    requiresInput?: boolean;
    inputType?: 'string' | 'number' | 'boolean' | 'pick' | 'file' | 'folder';
    pickOptions?: string[];
    lastExecuted?: Date;
    executionCount?: number;
}

export interface CommandCategory {
    name: string;
    commands: CommandInfo[];
    icon: string;
    description: string;
}

export class HackerCommandPanelProvider extends BaseHackerPanelProvider {
    public static readonly viewType = 'alephscript.hackerCommandPanel';

    private commands: Map<string, CommandInfo> = new Map();
    private categories: Map<string, CommandCategory> = new Map();

    public get viewType(): string {
        return HackerCommandPanelProvider.viewType;
    }

    protected initializePanel(): void {
        this.scanRegisteredCommands();
        this.updateCommandDisplay();
        
        // Refresh commands every 30 seconds
        setInterval(() => {
            this.scanRegisteredCommands();
            this.updateCommandDisplay();
        }, 30000);
    }

    protected getHtmlContent(webview: vscode.Webview): string {
        const bodyContent = `
            <div class="command-panels" id="commandPanels">
                <div class="loading-message">
                    <span class="blinking-text">>>> SCANNING COMMAND REGISTRY...</span>
                </div>
            </div>
            
            <div class="command-controls">
                <button class="hacker-btn primary" data-action="refreshCommands">
                    🔄 RESCAN_COMMANDS
                </button>
                <button class="hacker-btn info" data-action="showAllCommands">
                    📋 SHOW_ALL_REGISTRY
                </button>
                <button class="hacker-btn warning" data-action="exportCommands">
                    📤 EXPORT_COMMAND_LIST
                </button>
            </div>

            <div class="command-stats">
                <div class="stat-item">
                    <span class="stat-label">TOTAL_COMMANDS:</span>
                    <span class="stat-value" id="totalCommands">0</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">CATEGORIES:</span>
                    <span class="stat-value" id="totalCategories">0</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">EXECUTIONS:</span>
                    <span class="stat-value" id="totalExecutions">0</span>
                </div>
            </div>
        `;

        return this.generateBaseHtml(
            webview,
            'hacker-command-panel.js',
            'hacker-command-panel.css',
            'ARRAKIS_COMMAND_TERMINAL',
            bodyContent
        );
    }

    protected handleMessage(message: any): void {
        console.log('HackerCommandPanel received message:', message);
        vscode.window.showInformationMessage(`HackerCommandPanel received: ${message.command}`);
        
        switch (message.command) {
            case 'executeCommand':
                console.log('Executing command:', message.commandId);
                this.executeCommand(message.commandId, message.args);
                break;
            case 'refreshCommands':
                console.log('Refreshing commands');
                this.refreshCommands();
                break;
            case 'getCommandInfo':
                console.log('Getting command info:', message.commandId);
                this.sendCommandInfo(message.commandId);
                break;
            case 'requestInput':
                console.log('Requesting input for command:', message.commandId);
                this.requestCommandInput(message.commandId, message.inputType, message.options);
                break;
            case 'exportCommands':
                console.log('Exporting commands');
                this.exportCommandList();
                break;
            case 'showAllCommands':
                console.log('Showing all commands');
                this.showAllCommands();
                break;
            default:
                console.log('Unknown command:', message.command);
                vscode.window.showWarningMessage(`Unknown command: ${message.command}`);
        }
    }

    private async scanRegisteredCommands(): Promise<void> {
        // Clear existing commands
        this.commands.clear();
        this.categories.clear();

        // Scan commands from package.json contributions
        const packageJson = require(this.context.extensionPath + '/package.json');
        
        if (packageJson.contributes && packageJson.contributes.commands) {
            for (const cmd of packageJson.contributes.commands) {
                const commandInfo: CommandInfo = {
                    id: cmd.command,
                    title: cmd.title || cmd.command,
                    category: cmd.category || 'General',
                    description: cmd.description,
                    icon: cmd.icon,
                    requiresInput: this.detectRequiresInput(cmd.command),
                    inputType: this.detectInputType(cmd.command),
                    executionCount: 0
                };

                this.commands.set(cmd.command, commandInfo);
                this.addToCategory(commandInfo);
            }
        }

        // Add additional commands that might not be in package.json but are registered
        await this.scanDynamicCommands();
    }

    private async scanDynamicCommands(): Promise<void> {
        // Get all available commands from VS Code
        const allCommands = await vscode.commands.getCommands(true);
        
        // Filter for our extension commands
        const extensionCommands = allCommands.filter(cmd => 
            cmd.startsWith('alephscript.') || 
            cmd.startsWith('mcpSocketManager.') ||
            cmd.startsWith('theatrical.')
        );

        for (const cmdId of extensionCommands) {
            if (!this.commands.has(cmdId)) {
                const commandInfo: CommandInfo = {
                    id: cmdId,
                    title: this.generateTitleFromId(cmdId),
                    category: this.getCategoryFromId(cmdId),
                    description: `Dynamically discovered command: ${cmdId}`,
                    requiresInput: this.detectRequiresInput(cmdId),
                    inputType: this.detectInputType(cmdId),
                    executionCount: 0
                };

                this.commands.set(cmdId, commandInfo);
                this.addToCategory(commandInfo);
            }
        }
    }

    private addToCategory(command: CommandInfo): void {
        const categoryName = command.category;
        
        if (!this.categories.has(categoryName)) {
            this.categories.set(categoryName, {
                name: categoryName,
                commands: [],
                icon: this.getCategoryIcon(categoryName),
                description: this.getCategoryDescription(categoryName)
            });
        }

        this.categories.get(categoryName)!.commands.push(command);
    }

    private detectRequiresInput(commandId: string): boolean {
        // Commands that typically require input
        const inputCommands = [
            'createNew', 'create', 'add', 'edit', 'connect', 'join', 
            'send', 'search', 'find', 'filter', 'set', 'configure'
        ];
        
        return inputCommands.some(keyword => 
            commandId.toLowerCase().includes(keyword)
        );
    }

    private detectInputType(commandId: string): 'string' | 'number' | 'boolean' | 'pick' | 'file' | 'folder' {
        if (commandId.includes('file') || commandId.includes('File')) return 'file';
        if (commandId.includes('folder') || commandId.includes('directory')) return 'folder';
        if (commandId.includes('port') || commandId.includes('Port')) return 'number';
        if (commandId.includes('enable') || commandId.includes('toggle')) return 'boolean';
        if (commandId.includes('select') || commandId.includes('choose')) return 'pick';
        return 'string';
    }

    private generateTitleFromId(commandId: string): string {
        // Convert alephscript.webview.openWebRTC -> "Open WebRTC"
        const parts = commandId.split('.');
        const lastPart = parts[parts.length - 1];
        
        // Convert camelCase to Title Case
        return lastPart
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }

    private getCategoryFromId(commandId: string): string {
        if (commandId.startsWith('alephscript.webview')) return '🎭 Theater Interfaces';
        if (commandId.startsWith('alephscript.teatro')) return '🎭 Theater Control';
        if (commandId.startsWith('alephscript.agents')) return '🤖 Agent Management';
        if (commandId.startsWith('alephscript.mcptree')) return '🤖 MCP Management';
        if (commandId.startsWith('alephscript.sockets')) return '🔌 Neural Networks';
        if (commandId.startsWith('alephscript.configs')) return '⚙️ Configuration';
        if (commandId.startsWith('alephscript.logs')) return '📡 System Logs';
        if (commandId.startsWith('alephscript.uis')) return '🖥️ UI Management';
        if (commandId.startsWith('alephscript.analytics')) return '📊 Analytics';
        if (commandId.startsWith('mcpSocketManager')) return '🔌 MCP Socket';
        if (commandId.startsWith('theatrical')) return '🎭 Theatrical';
        return '⚡ General Commands';
    }

    private getCategoryIcon(category: string): string {
        const iconMap: { [key: string]: string } = {
            '🎭 Theater Interfaces': '🎭',
            '🎭 Theater Control': '🎪',
            '🤖 Agent Management': '🤖',
            '🔌 Neural Networks': '🧠',
            '⚙️ Configuration': '⚙️',
            '📡 System Logs': '📡',
            '🖥️ UI Management': '🖥️',
            '📊 Analytics': '📊',
            '🔌 MCP Socket': '🔌',
            '🎭 Theatrical': '🎭',
            '⚡ General Commands': '⚡'
        };
        return iconMap[category] || '⚡';
    }

    private getCategoryDescription(category: string): string {
        const descMap: { [key: string]: string } = {
            '🎭 Theater Interfaces': 'WebView-based theatrical interfaces',
            '🎭 Theater Control': 'Core theater management commands',
            '🤖 Agent Management': 'AI agent lifecycle and configuration',
            '🔌 Neural Networks': 'Socket and network communications',
            '⚙️ Configuration': 'System configuration and setup',
            '📡 System Logs': 'Logging and debugging tools',
            '🖥️ UI Management': 'User interface control commands',
            '📊 Analytics': 'Performance monitoring and analytics',
            '🔌 MCP Socket': 'Model Context Protocol socket management',
            '🎭 Theatrical': 'Advanced theatrical features',
            '⚡ General Commands': 'Miscellaneous utility commands'
        };
        return descMap[category] || 'General extension commands';
    }

    private async executeCommand(commandId: string, args?: any[]): Promise<void> {
        try {
            const command = this.commands.get(commandId);
            if (!command) {
                vscode.window.showErrorMessage(`Command not found: ${commandId}`);
                return;
            }

            // Update execution stats
            command.executionCount = (command.executionCount || 0) + 1;
            command.lastExecuted = new Date();

            // Execute the command
            if (args && args.length > 0) {
                await vscode.commands.executeCommand(commandId, ...args);
            } else {
                await vscode.commands.executeCommand(commandId);
            }

            // Show success message
            this.postMessage({
                command: 'commandExecuted',
                commandId: commandId,
                success: true,
                message: `✅ Command executed: ${command.title}`
            });

            // Update display
            this.updateCommandDisplay();

        } catch (error) {
            const errorMessage = `❌ Failed to execute ${commandId}: ${error}`;
            vscode.window.showErrorMessage(errorMessage);
            
            this.postMessage({
                command: 'commandExecuted',
                commandId: commandId,
                success: false,
                message: errorMessage
            });
        }
    }

    private async requestCommandInput(commandId: string, inputType: string, options?: string[]): Promise<void> {
        let input: any;

        try {
            switch (inputType) {
                case 'string':
                    input = await vscode.window.showInputBox({
                        prompt: `Enter input for command: ${commandId}`,
                        placeHolder: 'Type your input here...'
                    });
                    break;

                case 'number':
                    const numberInput = await vscode.window.showInputBox({
                        prompt: `Enter number for command: ${commandId}`,
                        placeHolder: 'Enter a number...',
                        validateInput: (value) => {
                            return isNaN(Number(value)) ? 'Please enter a valid number' : null;
                        }
                    });
                    input = numberInput ? Number(numberInput) : undefined;
                    break;

                case 'boolean':
                    input = await vscode.window.showQuickPick(['true', 'false'], {
                        placeHolder: 'Select true or false'
                    });
                    input = input === 'true';
                    break;

                case 'pick':
                    input = await vscode.window.showQuickPick(options || ['Option 1', 'Option 2'], {
                        placeHolder: 'Select an option'
                    });
                    break;

                case 'file':
                    const fileUri = await vscode.window.showOpenDialog({
                        canSelectFiles: true,
                        canSelectFolders: false,
                        canSelectMany: false
                    });
                    input = fileUri?.[0]?.fsPath;
                    break;

                case 'folder':
                    const folderUri = await vscode.window.showOpenDialog({
                        canSelectFiles: false,
                        canSelectFolders: true,
                        canSelectMany: false
                    });
                    input = folderUri?.[0]?.fsPath;
                    break;
            }

            if (input !== undefined) {
                await this.executeCommand(commandId, [input]);
            }

        } catch (error) {
            vscode.window.showErrorMessage(`Failed to get input for command: ${error}`);
        }
    }

    private refreshCommands(): void {
        this.postMessage({
            command: 'showMessage',
            message: '>>> RESCANNING COMMAND REGISTRY...'
        });

        this.scanRegisteredCommands().then(() => {
            this.updateCommandDisplay();
            this.postMessage({
                command: 'showMessage',
                message: '>>> COMMAND REGISTRY UPDATED'
            });
        });
    }

    private sendCommandInfo(commandId: string): void {
        const command = this.commands.get(commandId);
        if (command) {
            this.postMessage({
                command: 'commandInfo',
                data: command
            });
        }
    }

    private updateCommandDisplay(): void {
        const categoriesArray = Array.from(this.categories.values());
        
        this.postMessage({
            command: 'updateCommands',
            data: {
                categories: categoriesArray,
                totalCommands: this.commands.size,
                totalCategories: this.categories.size,
                totalExecutions: Array.from(this.commands.values())
                    .reduce((sum, cmd) => sum + (cmd.executionCount || 0), 0)
            }
        });
    }

    private async exportCommandList(): Promise<void> {
        const commandsList = Array.from(this.commands.values());
        const exportData = {
            timestamp: new Date().toISOString(),
            totalCommands: commandsList.length,
            categories: Array.from(this.categories.keys()),
            commands: commandsList
        };

        const content = JSON.stringify(exportData, null, 2);
        
        // Create a new document with the command list
        const doc = await vscode.workspace.openTextDocument({
            content: content,
            language: 'json'
        });
        
        await vscode.window.showTextDocument(doc);
        vscode.window.showInformationMessage('📤 Command list exported to new document');
    }

    private async showAllCommands(): Promise<void> {
        const allCommands = await vscode.commands.getCommands(true);
        const quickPickItems = allCommands.map(cmd => ({
            label: cmd,
            description: this.commands.has(cmd) ? '(Registered by extension)' : '(System command)'
        }));

        const selected = await vscode.window.showQuickPick(quickPickItems, {
            placeHolder: 'Select a command to execute',
            matchOnDescription: true
        });

        if (selected) {
            await this.executeCommand(selected.label);
        }
    }
}