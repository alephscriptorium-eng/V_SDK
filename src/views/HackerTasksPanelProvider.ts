import * as vscode from 'vscode';
import { BaseHackerPanelProvider } from './BaseHackerPanelProvider';
import { CatalogService } from '../launcher/CatalogService';
import type { CatalogSnapshot } from '../launcher/types';

const FALLBACK_MARK = '[FALLBACK MARCADO — no es catálogo launcher]';

/**
 * FALLBACK MARCADO (WP-V06): tabla estática histórica 3001–3066.
 * NO es inventario en caliente. Solo si no hay catálogo ni tasks.json.
 * Puertos aquí son legado embebido, no fuente de verdad de flota.
 */
const FALLBACK_DEFAULT_TASKS_MARKED = [
    { label: "SCP: Start Full Stack", dependsOn: ["MCP: Start [Launcher]", "APB: Start [Service]", "APB: Start [App]", "NOV: Start [Server]"], detail: `${FALLBACK_MARK} Compound` },
    { label: "MCP: Start [Launcher]", type: "shell", command: "npm", args: ["run", "start:launcher"], isBackground: true, detail: `${FALLBACK_MARK} legado 3050` },
    { label: "MCP: Start [Model]", type: "shell", command: "npm", args: ["start"], isBackground: true, detail: `${FALLBACK_MARK} legado 4001` },
    { label: "MCP: Start [DevOps]", type: "shell", command: "npm", args: ["run", "start"], isBackground: true, detail: `${FALLBACK_MARK} legado 3003` },
    { label: "BHS: Start [Server]", type: "shell", command: "npm", args: ["run", "start:bothub"], isBackground: true, detail: `${FALLBACK_MARK} legado 3010` },
    { label: "APB: Start [Service]", type: "shell", command: "npm", args: ["run", "start:backend"], isBackground: true, detail: `${FALLBACK_MARK} legado 8000` },
    { label: "APB: Start [App]", type: "shell", command: "npm", args: ["run", "start:frontend"], isBackground: true, detail: `${FALLBACK_MARK} legado 5001` },
    { label: "NOV: Start [Server]", type: "shell", command: "npm", args: ["start"], isBackground: true, detail: `${FALLBACK_MARK} legado 3066` },
    { label: "NOV: Start [UI]", type: "shell", command: "npm", args: ["run", "docs:serve"], isBackground: true, detail: `${FALLBACK_MARK} legado 8080` },
    { label: "ZEU: Start [UI]", type: "shell", command: "npm", args: ["start"], isBackground: true, detail: `${FALLBACK_MARK} legado 3012` },
    { label: "DMO: Start Full Stack", dependsOn: ["MCP: Start [Launcher]"], detail: `${FALLBACK_MARK} Demo stack` }
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
    private catalogService = CatalogService.getInstance();
    private catalogSub?: vscode.Disposable;
    private catalogStatusMessage = '⏳ catálogo no refrescado';

    // Prefix metadata for known categories
    private static readonly PREFIX_METADATA: Record<string, { name: string; icon: string; description: string }> = {
        'CAT': { name: 'Launcher catalog', icon: '📡', description: 'Tasks from launcher://catalog (hot)' },
        'WAIT': { name: 'Pending', icon: '⏳', description: 'Honest pending — no live catalog' },
        'FB': { name: 'Fallback marcado', icon: '⚠️', description: 'Static legacy fallback — NOT live fleet' },
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
        this.catalogSub = this.catalogService.onDidChange(() => {
            this.tasksLoadPromise = this.loadTasksFromWorkspace();
            void this.tasksLoadPromise.then(() => this.updateTaskDisplay());
        });
        this.context.subscriptions.push(this.catalogSub);

        // Load tasks initially - async but we'll update display when 'ready' message comes
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
     * Prioridad (WP-V06):
     * 1) catálogo launcher en caliente
     * 2) tasks.json del workspace (autoría usuario)
     * 3) FALLBACK MARCADO (tabla fija legado) + fila ⏳
     */
    private async loadTasksFromWorkspace(): Promise<void> {
        this.categories.clear();
        this.allTasks.clear();

        const snap = this.catalogService.getSnapshot();
        this.catalogStatusMessage = snap.statusMessage;
        let catalogLoaded = false;

        if (snap.availability === 'ready' && snap.servers.length > 0) {
            this.ingestCatalogTasks(snap);
            catalogLoaded = true;
            console.log(`Loaded ${snap.servers.length} catalog servers as tasks`);
        } else {
            const pending = this.parseTask({
                label: 'WAIT: Catalog [Pending]',
                detail: snap.statusMessage,
                type: 'shell',
                command: 'echo',
                args: [snap.statusMessage]
            });
            this.allTasks.set(pending.label, pending);
            this.addTaskToCategory(pending);
        }

        let workspaceLoaded = false;
        const workspaceFolders = vscode.workspace.workspaceFolders;

        if (workspaceFolders) {
            const folder = workspaceFolders[0];
            const tasksPath = vscode.Uri.joinPath(folder.uri, '.vscode', 'tasks.json');
            try {
                const content = await vscode.workspace.fs.readFile(tasksPath);
                const text = Buffer.from(content).toString('utf8');
                const jsonText = this.stripJsonComments(text);
                const tasksJson: TasksJsonContent = JSON.parse(jsonText);

                if (tasksJson.tasks && Array.isArray(tasksJson.tasks)) {
                    for (const rawTask of tasksJson.tasks) {
                        const task = this.parseTask(rawTask);
                        if (!this.allTasks.has(task.label)) {
                            this.allTasks.set(task.label, task);
                            this.addTaskToCategory(task);
                        }
                    }
                    workspaceLoaded = true;
                    console.log(`Merged workspace tasks.json`);
                }
            } catch (error) {
                console.log(`Could not load tasks.json from workspace:`, error);
            }
        }

        // Fallback MARCADO solo si no hay catálogo ni tasks.json
        if (!catalogLoaded && !workspaceLoaded) {
            console.log('Using FALLBACK MARCADO embedded tasks (not live catalog)');
            for (const rawTask of FALLBACK_DEFAULT_TASKS_MARKED) {
                const task = this.parseTask(rawTask);
                // Re-prefix category visually under FB when from marked fallback
                if (task.prefix !== 'WAIT') {
                    task.detail = task.detail?.includes(FALLBACK_MARK)
                        ? task.detail
                        : `${FALLBACK_MARK} ${task.detail || ''}`.trim();
                }
                this.allTasks.set(task.label, task);
                this.addTaskToCategory(task);
            }
        }

        console.log(`Final: ${this.allTasks.size} tasks in ${this.categories.size} categories`);
    }

    private ingestCatalogTasks(snap: CatalogSnapshot): void {
        for (const entry of snap.servers) {
            const barrio = entry.tree?.barrio;
            const barrioNote = barrio ? ` · barrio ${barrio}` : '';
            const portNote =
                entry.port !== undefined
                    ? `port ${entry.port} (from catalog)`
                    : '⏳ sin puerto en catálogo (barrio no montado)';
            const task = this.parseTask({
                label: `CAT: Start [${entry.id}]`,
                type: 'shell',
                command: 'echo',
                args: [`catalog:${entry.id}`],
                isBackground: true,
                detail: `${portNote}${barrioNote} · ${entry.workspace || entry.name}`
            });
            if (entry.port !== undefined) {
                task.port = String(entry.port);
            }
            this.allTasks.set(task.label, task);
            this.addTaskToCategory(task);
        }
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
            runningCount: Array.from(this.allTasks.values()).filter(t => t.isRunning).length,
            catalogStatus: this.catalogStatusMessage
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
