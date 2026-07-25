import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { BaseHackerPanelProvider } from './BaseHackerPanelProvider';

/**
 * Default embedded tasks (fallback when tasks.json can't be read)
 * SYNC with .vscode/tasks.json - Last sync: 2026-04-11
 */
const DEFAULT_TASKS = [
    { label: "SCP: Start Full Stack", dependsOn: ["MCP: Start [Launcher]", "APB: Start [Service]", "APB: Start [App]", "NOV: Start [Server]"], detail: "Compound - Full stack" },
    { label: "MCP: Start [Launcher]", type: "shell", command: "npm", args: ["run", "start:launcher"], isBackground: true, detail: "Puerto 3050" },
    { label: "MCP: Start [Model]", type: "shell", command: "npm", args: ["start"], isBackground: true, detail: "Puerto 4001" },
    { label: "MCP: Start [DevOps]", type: "shell", command: "npm", args: ["run", "start"], isBackground: true, detail: "Puerto 3003 - DevOps Server con persistencia" },
    { label: "BHS: Start [Server]", type: "shell", command: "npm", args: ["run", "start:bothub"], isBackground: true, detail: "Puerto 3010 - BotHub MCP Server (BotHubSDK + IACM)" },
    { label: "BHS: Open [Browser]", type: "shell", command: "open", args: ["http://localhost:3010"], detail: "Abrir BotHub MCP Server health endpoint" },
    { label: "BHS: Setup [Examples]", type: "shell", command: "npm", args: ["run", "examples:install"], detail: "Instalar dependencias de console-app, dashboard e iacm-demo" },
    { label: "BHS: Start [Console]", type: "shell", command: "npm", args: ["run", "dev"], detail: "BotHubSDK console-app headless (build:sdk + ejemplo)" },
    { label: "BHS: Start [Dashboard]", type: "shell", command: "npm", args: ["run", "dev:dashboard"], detail: "BotHubSDK dashboard TUI (build:sdk + ejemplo interactivo)" },
    { label: "APB: Start [Service]", type: "shell", command: "npm", args: ["run", "start:backend"], isBackground: true, detail: "Puerto 8000" },
    { label: "APB: Start [App]", type: "shell", command: "npm", args: ["run", "start:frontend"], isBackground: true, detail: "Puerto 5001" },
    { label: "APB: Build [Chain]", type: "shell", command: "bash", args: ["-c", "npm run build"], detail: "Build chain" },
    { label: "APB: Health Check", type: "shell", command: "bash", args: ["./scripts/apb-health-check.sh"], detail: "Verificar" },
    { label: "APB: Open [Browser]", type: "shell", command: "open", args: ["http://localhost:5001"], detail: "Abrir" },
    { label: "NOV: Start [Server]", type: "shell", command: "npm", args: ["start"], isBackground: true, detail: "Puerto 3066" },
    { label: "NOV: Start [UI]", type: "shell", command: "npm", args: ["run", "docs:serve"], isBackground: true, detail: "Puerto 8080" },
    { label: "NOV: Open [Browser]", type: "shell", command: "open", args: ["http://localhost:8080"], detail: "Abrir" },
    { label: "TPE: Start [Server]", type: "shell", command: "npm", args: ["run", "dev"], isBackground: true, detail: "Puerto 3019" },
    { label: "TPE: Start [MCP]", type: "shell", command: "npm", args: ["run", "start:typed-prompt"], isBackground: true, detail: "Puerto 3020" },
    { label: "TPE: Open [Browser]", type: "shell", command: "open", args: ["http://localhost:3019"], detail: "Abrir" },
    { label: "OAE: Start [Swagger]", type: "shell", command: "npx", args: ["@redocly/cli", "preview-docs"], isBackground: true, detail: "Puerto 3021" },
    { label: "OAE: Start [AsyncAPI]", type: "shell", command: "npx", args: ["@asyncapi/cli", "start", "studio"], isBackground: true, detail: "Puerto 3022" },
    { label: "OAE: Open [Swagger]", type: "shell", command: "open", args: ["http://localhost:3021"], detail: "Abrir" },
    { label: "OAE: Open [AsyncAPI]", type: "shell", command: "open", args: ["http://localhost:3022"], detail: "Abrir" },
    { label: "NRE: Start [Editor]", type: "shell", command: "node-red", args: [], isBackground: true, detail: "Puerto 1880" },
    { label: "NRE: Start [GamifyUI]", type: "shell", command: "npm", args: ["run", "dev:ui"], isBackground: true, detail: "Puerto 3088" },
    { label: "NRE: Open [Editor]", type: "shell", command: "open", args: ["http://localhost:1880"], detail: "Abrir" },
    { label: "NRE: Open [Dashboard]", type: "shell", command: "open", args: ["http://localhost:1880/ui"], detail: "Abrir" },
    { label: "BLE: Start [Editor]", type: "shell", command: "npm", args: ["run", "dev:ui"], isBackground: true, detail: "Puerto 4200" },
    { label: "BLE: Start [Runtime]", type: "shell", command: "npm", args: ["run", "dev:runtime-ui"], isBackground: true, detail: "Puerto 5000" },
    { label: "BLE: Open [Editor]", type: "shell", command: "open", args: ["http://localhost:4200"], detail: "Abrir" },
    { label: "JKL: Start [Site]", type: "shell", command: "./scripts/serve-site.sh", isBackground: true, detail: "Puerto 4000" },
    { label: "JKL: Open [Browser]", type: "shell", command: "open", args: ["http://localhost:4000/aleph-scriptorium/"], detail: "Abrir" },
    { label: "ZEU: Start [UI]", type: "shell", command: "npm", args: ["start"], isBackground: true, detail: "Puerto 3012" },
    { label: "ZEU: Open [Browser]", type: "shell", command: "open", args: ["http://localhost:3012"], detail: "Abrir" },
    { label: "AIA: Start [Backend]", type: "shell", command: "npm", args: ["run", "start:dev"], isBackground: true, detail: "Puerto 8007 - AAIA Backend Gateway" },
    { label: "AIA: Start [Frontend]", type: "shell", command: "npm", args: ["start"], isBackground: true, detail: "Puerto 4200 - AAIA Frontend" },
    { label: "AIA: Open [Browser]", type: "shell", command: "open", args: ["http://localhost:3007"], detail: "Abrir AAIA Server" },
    { label: "AIA: Open [Frontend]", type: "shell", command: "open", args: ["http://localhost:4200"], detail: "Abrir AAIA Frontend" },
    { label: "CHS: Start [Server]", type: "shell", command: "npm", args: ["run", "dev"], isBackground: true, detail: "Puerto 3000 - Socket.IO" },
    { label: "CHS: Start [AdminUI]", type: "shell", command: "npm", args: ["run", "start"], isBackground: true, detail: "Puerto 3100 - Admin UI" },
    { label: "CHS: Open [Server]", type: "shell", command: "open", args: ["http://localhost:3000"], detail: "Abrir" },
    { label: "CHS: Open [AdminUI]", type: "shell", command: "open", args: ["http://localhost:3100"], detail: "Abrir" },
    { label: "INS: Start [Inspector]", type: "shell", command: "npm", args: ["start"], isBackground: true, detail: "Puerto 6274" },
    { label: "INS: Open [Browser]", type: "shell", command: "open", args: ["http://localhost:6274"], detail: "Abrir" },
    { label: "DMO: Start Full Stack", dependsOn: ["JKL: Start [Site]", "MCP: Start [Launcher]"], detail: "Demo stack" }
];

/**
 * Parsed task from tasks.json
 */
export interface TaskInfo {
    label: string;
    type?: string;
    command?: string;
    args?: string[];
    detail?: string;
    group?: string | { kind: string; isDefault?: boolean };
    isBackground?: boolean;
    dependsOn?: string[];
    options?: {
        cwd?: string;
        env?: Record<string, string>;
    };
    presentation?: {
        reveal?: string;
        panel?: string;
        group?: string;
    };
    // Computed properties
    prefix: string;
    action: string;
    target: string;
    port?: string;
    isCompound: boolean;
    isRunning: boolean;
}

/**
 * Task category (grouped by prefix)
 */
export interface TaskCategory {
    prefix: string;
    name: string;
    description: string;
    icon: string;
    tasks: TaskInfo[];
    ports: string[];
}

/**
 * Tasks.json structure
 */
interface TasksJsonContent {
    version: string;
    tasks: any[];
    inputs?: any[];
    options?: any;
    presentation?: any;
}

/**
 * Hacker-themed Tasks Panel Provider
 * Dynamically reads tasks.json and provides a UI to execute tasks
 */
export class HackerTasksPanelProvider extends BaseHackerPanelProvider {
    public static readonly viewType = 'alephscript.hackerTasksPanel';

    private categories: Map<string, TaskCategory> = new Map();
    private allTasks: Map<string, TaskInfo> = new Map();
    private fileWatcher?: vscode.FileSystemWatcher;
    private taskExecutions: Map<string, vscode.TaskExecution> = new Map();
    private tasksLoadPromise?: Promise<void>;

    // Prefix metadata for known categories
    private static readonly PREFIX_METADATA: Record<string, { name: string; icon: string; description: string }> = {
        'SCP': { name: 'Scriptorium', icon: '📜', description: 'Main compound tasks' },
        'MCP': { name: 'MCP Servers', icon: '🔌', description: 'Model Context Protocol servers' },
        'BHS': { name: 'BotHub', icon: '📬', description: 'BotHub SDK examples + MCP server' },
        'AIA': { name: 'AAIA Gallery', icon: '🤖', description: 'Autonomous AI Agents stack' },
        'APB': { name: 'Agent Prolog Brain', icon: '🧠', description: 'PrologEditor stack' },
        'NOV': { name: 'Novelist', icon: '📖', description: 'NovelistEditor services' },
        'TPE': { name: 'TypedPrompts', icon: '📝', description: 'TypedPromptsEditor stack' },
        'OAE': { name: 'OpenAsyncAPI', icon: '📋', description: 'API specs visualization' },
        'NRE': { name: 'Node-RED', icon: '🔴', description: 'Wiring/Flow editor' },
        'BLE': { name: 'Blockly', icon: '🧩', description: 'Visual programming editor' },
        'JKL': { name: 'Jekyll', icon: '📄', description: 'Documentation site' },
        'ZEU': { name: 'Zeus', icon: '⚡', description: 'MCP Gallery UI' },
        'INS': { name: 'Inspector', icon: '🔍', description: 'MCP Inspector tools' },
        'CHS': { name: 'Channels', icon: '📡', description: 'Socket.IO channels' },
        'DMO': { name: 'Demo', icon: '🎬', description: 'Demo compound tasks' },
        'DEMO': { name: 'Demo', icon: '🎬', description: 'Demo compound tasks' },
        'ZEUS': { name: 'Zeus', icon: '⚡', description: 'MCP Gallery UI' },
    };

    public get viewType(): string {
        return HackerTasksPanelProvider.viewType;
    }

    protected initializePanel(): void {
        // Load tasks initially - async but we'll update display when 'ready' message comes
        // The 'ready' message handler will call updateTaskDisplay after ensuring tasks are loaded
        this.tasksLoadPromise = this.loadTasksFromWorkspace();

        // Watch for changes to tasks.json
        this.setupFileWatcher();

        // Listen for task start/end events
        this.setupTaskListeners();

        // Update running status periodically
        setInterval(() => this.updateRunningStatus(), 5000);
    }

    /**
     * Setup file watcher for tasks.json changes
     */
    private setupFileWatcher(): void {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) return;

        // Watch all .vscode/tasks.json files in workspace
        this.fileWatcher = vscode.workspace.createFileSystemWatcher(
            new vscode.RelativePattern(workspaceFolders[0], '.vscode/tasks.json')
        );

        this.fileWatcher.onDidChange(() => {
            console.log('tasks.json changed, reloading...');
            this.loadTasksFromWorkspace();
            this.updateTaskDisplay();
        });

        this.fileWatcher.onDidCreate(() => {
            console.log('tasks.json created, loading...');
            this.loadTasksFromWorkspace();
            this.updateTaskDisplay();
        });

        this.fileWatcher.onDidDelete(() => {
            console.log('tasks.json deleted, clearing tasks...');
            this.categories.clear();
            this.allTasks.clear();
            this.updateTaskDisplay();
        });

        this.context.subscriptions.push(this.fileWatcher);
    }

    /**
     * Setup VS Code task execution listeners
     */
    private setupTaskListeners(): void {
        vscode.tasks.onDidStartTask(e => {
            const taskName = e.execution.task.name;
            this.taskExecutions.set(taskName, e.execution);
            const task = this.allTasks.get(taskName);
            if (task) {
                task.isRunning = true;
                this.postMessage({ command: 'taskStarted', taskLabel: taskName });
            }
        });

        vscode.tasks.onDidEndTask(e => {
            const taskName = e.execution.task.name;
            this.taskExecutions.delete(taskName);
            const task = this.allTasks.get(taskName);
            if (task) {
                task.isRunning = false;
                this.postMessage({ command: 'taskEnded', taskLabel: taskName });
            }
        });
    }

    /**
     * Public method to refresh tasks (used by commands)
     */
    public async refresh(): Promise<void> {
        await this.loadTasksFromWorkspace();
        this.updateTaskDisplay();
    }

    /**
     * Load tasks from workspace tasks.json or use default fallback
     */
    private async loadTasksFromWorkspace(): Promise<void> {
        this.categories.clear();
        this.allTasks.clear();

        let tasksLoaded = false;
        const workspaceFolders = vscode.workspace.workspaceFolders;
        
        if (workspaceFolders) {
            // Only load from the first (root) workspace folder's .vscode/tasks.json
            const folder = workspaceFolders[0];
            const tasksPath = vscode.Uri.joinPath(folder.uri, '.vscode', 'tasks.json');
            try {
                const content = await vscode.workspace.fs.readFile(tasksPath);
                const text = Buffer.from(content).toString('utf8');
                // Remove comments (JSON with comments support)
                const jsonText = this.stripJsonComments(text);
                const tasksJson: TasksJsonContent = JSON.parse(jsonText);

                if (tasksJson.tasks && Array.isArray(tasksJson.tasks)) {
                    for (const rawTask of tasksJson.tasks) {
                        const task = this.parseTask(rawTask);
                        this.allTasks.set(task.label, task);
                        this.addTaskToCategory(task);
                    }
                    tasksLoaded = true;
                    console.log(`Loaded ${this.allTasks.size} tasks from workspace tasks.json`);
                }
            } catch (error) {
                console.log(`Could not load tasks.json from workspace:`, error);
            }
        }

        // Use default tasks as fallback
        if (!tasksLoaded) {
            console.log('Using default embedded tasks');
            for (const rawTask of DEFAULT_TASKS) {
                const task = this.parseTask(rawTask);
                this.allTasks.set(task.label, task);
                this.addTaskToCategory(task);
            }
        }

        console.log(`Final: ${this.allTasks.size} tasks in ${this.categories.size} categories`);
    }

    /**
     * Strip comments from JSON (VS Code tasks.json supports comments)
     */
    private stripJsonComments(text: string): string {
        // Remove single-line comments
        let result = text.replace(/\/\/.*$/gm, '');
        // Remove multi-line comments
        result = result.replace(/\/\*[\s\S]*?\*\//g, '');
        // Remove trailing commas before } or ]
        result = result.replace(/,(\s*[}\]])/g, '$1');
        return result;
    }

    /**
     * Parse a raw task object into TaskInfo
     */
    private parseTask(raw: any): TaskInfo {
        const label = raw.label || 'Unknown';
        const parsed = this.parseTaskLabel(label);
        
        // Extract port from detail if present
        let port: string | undefined;
        if (raw.detail) {
            const portMatch = raw.detail.match(/(?:Puerto|Port)\s*(\d+)/i);
            if (portMatch) {
                port = portMatch[1];
            }
        }

        return {
            label,
            type: raw.type,
            command: raw.command,
            args: raw.args,
            detail: raw.detail,
            group: raw.group,
            isBackground: raw.isBackground || false,
            dependsOn: raw.dependsOn,
            options: raw.options,
            presentation: raw.presentation,
            prefix: parsed.prefix,
            action: parsed.action,
            target: parsed.target,
            port,
            isCompound: Array.isArray(raw.dependsOn) && raw.dependsOn.length > 0,
            isRunning: this.taskExecutions.has(label)
        };
    }

    /**
     * Parse task label into prefix, action, target
     * Format: "XXX: Action [Target]" or "XXX: Action"
     */
    private parseTaskLabel(label: string): { prefix: string; action: string; target: string } {
        // Match pattern: "PREFIX: Action [Target]" or "PREFIX: Action"
        const match = label.match(/^([A-Z]{2,4}):\s*(.+?)(?:\s*\[(.+?)\])?$/);
        
        if (match) {
            return {
                prefix: match[1],
                action: match[2].trim(),
                target: match[3] || ''
            };
        }

        // Fallback: try to extract prefix from "shell: PREFIX: ..." format
        const shellMatch = label.match(/^(?:shell:\s*)?([A-Z]{2,4}):\s*(.+?)(?:\s*\[(.+?)\])?$/);
        if (shellMatch) {
            return {
                prefix: shellMatch[1],
                action: shellMatch[2].trim(),
                target: shellMatch[3] || ''
            };
        }

        return { prefix: 'OTHER', action: label, target: '' };
    }

    /**
     * Add task to its category
     */
    private addTaskToCategory(task: TaskInfo): void {
        let category = this.categories.get(task.prefix);
        
        if (!category) {
            const metadata = HackerTasksPanelProvider.PREFIX_METADATA[task.prefix] || {
                name: task.prefix,
                icon: '📦',
                description: `${task.prefix} tasks`
            };
            
            category = {
                prefix: task.prefix,
                name: metadata.name,
                description: metadata.description,
                icon: metadata.icon,
                tasks: [],
                ports: []
            };
            this.categories.set(task.prefix, category);
        }

        category.tasks.push(task);
        if (task.port && !category.ports.includes(task.port)) {
            category.ports.push(task.port);
        }
    }

    /**
     * Update running status of all tasks
     */
    private async updateRunningStatus(): Promise<void> {
        const activeTasks = vscode.tasks.taskExecutions;
        const runningNames = new Set(activeTasks.map(e => e.task.name));

        for (const task of this.allTasks.values()) {
            const wasRunning = task.isRunning;
            task.isRunning = runningNames.has(task.label);
            
            if (wasRunning !== task.isRunning) {
                this.postMessage({
                    command: task.isRunning ? 'taskStarted' : 'taskEnded',
                    taskLabel: task.label
                });
            }
        }
    }

    /**
     * Update the webview with current task data
     */
    private updateTaskDisplay(): void {
        const categoriesData = Array.from(this.categories.values()).map(cat => ({
            ...cat,
            tasks: cat.tasks.map(t => ({
                label: t.label,
                action: t.action,
                target: t.target,
                detail: t.detail,
                port: t.port,
                isCompound: t.isCompound,
                isBackground: t.isBackground,
                isRunning: t.isRunning,
                dependsOn: t.dependsOn
            }))
        }));

        this.postMessage({
            command: 'updateTasks',
            categories: categoriesData,
            totalTasks: this.allTasks.size,
            totalCategories: this.categories.size,
            runningCount: Array.from(this.allTasks.values()).filter(t => t.isRunning).length
        });
    }

    protected getHtmlContent(webview: vscode.Webview): string {
        const bodyContent = `
            <div class="tasks-filter">
                <input type="text" id="taskFilter" class="hacker-input" placeholder=">>> FILTER_TASKS..." />
                <div class="filter-stats">
                    <span class="stat-badge" id="visibleCount">0</span> / <span id="totalTasksDisplay">0</span> tasks
                </div>
            </div>

            <div class="tasks-panels" id="tasksPanels">
                <div class="loading-message">
                    <span class="blinking-text">>>> SCANNING TASKS.JSON...</span>
                </div>
            </div>
            
            <div class="tasks-controls">
                <button class="hacker-btn primary" data-action="refreshTasks">
                    🔄 RELOAD_TASKS
                </button>
                <button class="hacker-btn success" data-action="runDefault">
                    ▶️ RUN_DEFAULT
                </button>
                <button class="hacker-btn danger" data-action="stopAll">
                    ⏹️ STOP_ALL
                </button>
                <button class="hacker-btn info" data-action="openTasksJson">
                    📝 EDIT_TASKS.JSON
                </button>
            </div>

            <div class="tasks-stats">
                <div class="stat-item">
                    <span class="stat-label">TOTAL_TASKS:</span>
                    <span class="stat-value" id="totalTasks">0</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">CATEGORIES:</span>
                    <span class="stat-value" id="totalCategories">0</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">RUNNING:</span>
                    <span class="stat-value running" id="runningTasks">0</span>
                </div>
            </div>
        `;

        return this.generateBaseHtml(
            webview,
            'hacker-tasks-panel.js',
            'hacker-tasks-panel.css',
            'ARRAKIS_TASK_RUNNER',
            bodyContent
        );
    }

    protected handleMessage(message: any): void {
        console.log('HackerTasksPanel received message:', message);

        switch (message.command) {
            case 'runTask':
                this.runTask(message.taskLabel);
                break;
            case 'stopTask':
                this.stopTask(message.taskLabel);
                break;
            case 'refreshTasks':
                this.loadTasksFromWorkspace().then(() => this.updateTaskDisplay());
                break;
            case 'runDefault':
                this.runDefaultTask();
                break;
            case 'stopAll':
                this.stopAllTasks();
                break;
            case 'openTasksJson':
                this.openTasksJson();
                break;
            case 'ready':
                // Webview is ready, wait for tasks to load then send data
                console.log('HackerTasksPanel: webview ready, waiting for tasks to load...');
                if (this.tasksLoadPromise) {
                    this.tasksLoadPromise
                        .then(() => {
                            console.log('HackerTasksPanel: tasks loaded, updating display');
                            this.updateTaskDisplay();
                        })
                        .catch((err) => {
                            console.error('HackerTasksPanel: error loading tasks:', err);
                            // Still try to update display (will show defaults or empty)
                            this.updateTaskDisplay();
                        });
                } else {
                    console.log('HackerTasksPanel: no load promise, updating display directly');
                    this.updateTaskDisplay();
                }
                break;
        }
    }

    /**
     * Run a task by label
     */
    private async runTask(label: string): Promise<void> {
        const task = this.allTasks.get(label);
        if (!task) {
            vscode.window.showErrorMessage(`Task not found: ${label}`);
            return;
        }

        try {
            // Use VS Code's task execution
            await vscode.commands.executeCommand('workbench.action.tasks.runTask', label);
            vscode.window.showInformationMessage(`Started task: ${label}`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to run task ${label}: ${error}`);
        }
    }

    /**
     * Stop a running task
     */
    private async stopTask(label: string): Promise<void> {
        const execution = this.taskExecutions.get(label);
        if (execution) {
            execution.terminate();
            vscode.window.showInformationMessage(`Stopped task: ${label}`);
        } else {
            // Try to find in active executions
            const active = vscode.tasks.taskExecutions.find(e => e.task.name === label);
            if (active) {
                active.terminate();
                vscode.window.showInformationMessage(`Stopped task: ${label}`);
            }
        }
    }

    /**
     * Run the default build task
     */
    private async runDefaultTask(): Promise<void> {
        await vscode.commands.executeCommand('workbench.action.tasks.build');
    }

    /**
     * Stop all running tasks
     */
    private async stopAllTasks(): Promise<void> {
        const active = vscode.tasks.taskExecutions;
        for (const execution of active) {
            execution.terminate();
        }
        vscode.window.showInformationMessage(`Stopped ${active.length} tasks`);
    }

    /**
     * Open tasks.json in editor
     */
    private async openTasksJson(): Promise<void> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) return;

        const tasksPath = vscode.Uri.joinPath(workspaceFolders[0].uri, '.vscode', 'tasks.json');
        try {
            const doc = await vscode.workspace.openTextDocument(tasksPath);
            await vscode.window.showTextDocument(doc);
        } catch {
            vscode.window.showErrorMessage('Could not open tasks.json');
        }
    }

    public dispose(): void {
        super.dispose();
        if (this.fileWatcher) {
            this.fileWatcher.dispose();
        }
    }
}
