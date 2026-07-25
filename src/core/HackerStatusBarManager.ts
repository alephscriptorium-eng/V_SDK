import * as vscode from 'vscode';

/**
 * Manages the Hacker Panel Quick Access Status Bar
 */
export class HackerStatusBarManager {
    private static instance: HackerStatusBarManager;
    private statusBarItems: Map<string, vscode.StatusBarItem> = new Map();
    private isInitialized: boolean = false;
    
    private constructor() {}

    public static getInstance(): HackerStatusBarManager {
        if (!HackerStatusBarManager.instance) {
            HackerStatusBarManager.instance = new HackerStatusBarManager();
        }
        return HackerStatusBarManager.instance;
    }

    /**
     * Initialize the status bar with hacker panel buttons
     */
    public initialize(context: vscode.ExtensionContext): void {
        if (this.isInitialized) {
            return; // Prevent double initialization
        }
        
        this.createHackerPanelButtons(context);
        
        // Respect initial visibility configuration
        const config = vscode.workspace.getConfiguration('alephscript');
        const isVisible = config.get<boolean>('statusBar.visible', true);
        this.setVisible(isVisible);
        
        // Listen for configuration changes
        const configWatcher = vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('alephscript.statusBar.visible')) {
                const newVisibility = vscode.workspace.getConfiguration('alephscript').get<boolean>('statusBar.visible', true);
                this.setVisible(newVisibility);
            }
        });
        
        context.subscriptions.push(configWatcher);
        this.isInitialized = true;
    }

    /**
     * Create the three hacker panel status bar buttons
     */
    private createHackerPanelButtons(context: vscode.ExtensionContext): void {
        // Control Panel Button (Neural Control Matrix)
        const controlButton = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left, 
            200
        );
        controlButton.command = 'alephscript.hackerControlPanel.toggle';
        controlButton.text = '$(pulse) Neural';
        controlButton.tooltip = '🚀 Open Neural Control Matrix - Manage Webviews';
        controlButton.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
        controlButton.show();
        
        // Command Panel Button (Command Terminal)
        const commandButton = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left, 
            199
        );
        commandButton.command = 'alephscript.hackerCommandPanel.toggle';
        commandButton.text = '$(terminal-cmd) Terminal';
        commandButton.tooltip = '⚡ Open Command Terminal - Execute Commands';
        commandButton.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
        commandButton.show();

        // Config Panel Button (Config Matrix)
        const configButton = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left, 
            198
        );
        configButton.command = 'alephscript.hackerConfigPanel.toggle';
        configButton.text = '$(settings-gear) Config';
        configButton.tooltip = '⚙️ Open Config Matrix - Manage Settings';
        configButton.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
        configButton.show();

        // Store references for cleanup
        this.statusBarItems.set('control', controlButton);
        this.statusBarItems.set('command', commandButton);
        this.statusBarItems.set('config', configButton);

        // Register for cleanup
        context.subscriptions.push(controlButton, commandButton, configButton);
    }

    /**
     * Update button states based on panel visibility
     */
    public updateButtonStates(activePanels: string[]): void {
        const buttons = [
            { key: 'control', text: '$(pulse) Neural', activeText: '$(pulse) Neural*' },
            { key: 'command', text: '$(terminal-cmd) Terminal', activeText: '$(terminal-cmd) Terminal*' },
            { key: 'config', text: '$(settings-gear) Config', activeText: '$(settings-gear) Config*' }
        ];

        buttons.forEach(button => {
            const statusBarItem = this.statusBarItems.get(button.key);
            if (statusBarItem) {
                const isActive = activePanels.includes(button.key);
                statusBarItem.text = isActive ? button.activeText : button.text;
                
                // Update background color for active state
                statusBarItem.backgroundColor = isActive 
                    ? new vscode.ThemeColor('statusBarItem.prominentBackground')
                    : undefined;
            }
        });
    }

    /**
     * Show/hide the hacker panel buttons
     */
    public setVisible(visible: boolean): void {
        this.statusBarItems.forEach(item => {
            if (visible) {
                item.show();
            } else {
                item.hide();
            }
        });
    }

    /**
     * Animate buttons (for effects)
     */
    public animateButtons(): void {
        const originalTexts = [
            { key: 'control', text: '$(pulse) Neural' },
            { key: 'command', text: '$(terminal-cmd) Terminal' },
            { key: 'config', text: '$(settings-gear) Config' }
        ];

        // Flash effect
        this.statusBarItems.forEach((item, key) => {
            const animatedText = key === 'control' ? '$(loading~spin) Neural' :
                               key === 'command' ? '$(loading~spin) Terminal' :
                               '$(loading~spin) Config';
            
            item.text = animatedText;
            item.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        });

        // Restore after animation
        setTimeout(() => {
            originalTexts.forEach(({ key, text }) => {
                const item = this.statusBarItems.get(key);
                if (item) {
                    item.text = text;
                    item.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
                }
            });
        }, 1000);
    }

    /**
     * Show status message in status bar
     */
    public showMessage(message: string, timeout: number = 3000): void {
        const messageItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left, 
            197
        );
        messageItem.text = `$(info) ${message}`;
        messageItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        messageItem.show();

        setTimeout(() => {
            messageItem.dispose();
        }, timeout);
    }

    /**
     * Dispose all status bar items
     */
    public dispose(): void {
        this.statusBarItems.forEach(item => item.dispose());
        this.statusBarItems.clear();
    }
}