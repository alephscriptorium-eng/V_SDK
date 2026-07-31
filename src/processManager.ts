import * as vscode from 'vscode';
import * as path from 'path';
import { TerminalManager } from './terminalManager';
import { resolveLauncherPort, ZIGURAT_PENDING } from './config/ziguratSettings';
import { LogCategory } from './loggingManager';
import { getLogger } from './core/logging';

/**
 * WP-V71 · el ciclo de vida de procesos es lo primero que se pide cuando algo
 * falla en una máquina ajena; cada arranque y cada parada llevan `op=` para
 * poder aislar un lanzamiento concreto entre el ruido.
 */
const log = getLogger('ProcessManager', LogCategory.PROCESS);

export interface ProcessInfo {
    id?: string;
    name: string;
    pid?: number;  // Made optional since VS Code terminals don't always expose PID
    command: string;
    status: 'running' | 'stopped' | 'unknown';
    port?: number;
    workingDirectory: string;
    startTime?: Date;
    terminal?: vscode.Terminal;  // Added terminal reference
}

export class ProcessManager {
    private static instance: ProcessManager;
    private processInfo: Map<string, ProcessInfo> = new Map();
    private terminalManager: TerminalManager;

    private constructor() {
        this.terminalManager = new TerminalManager();
    }

    static getInstance(): ProcessManager {
        if (!ProcessManager.instance) {
            ProcessManager.instance = new ProcessManager();
        }
        return ProcessManager.instance;
    }

    async startProcess(name: string, command: string, args: string[], workingDir: string, port?: number): Promise<boolean> {
        const opLog = log.forOperation('start');
        try {
            // Check if process is already running
            if (this.processInfo.has(name) && this.processInfo.get(name)?.status === 'running') {
                opLog.info('Process is already running', { name });
                return false;
            }

            const fullCommand = `${command} ${args.join(' ')}`;
            // La línea de comando puede traer `--token …` o `API_KEY=…` en los
            // args; el redactor del canal los tapa antes de emitir (WP-V71 CA4).
            opLog.info('Process launching', { name, workingDir, command: fullCommand, port });

            // Create terminal using VS Code's terminal API
            const terminal = vscode.window.createTerminal({
                name: `Arrakis: ${name}`,
                cwd: workingDir,
                shellPath: this.getShellPath(),
                env: {
                    ...process.env,
                    ARRAKIS_PROCESS: name,
                    ARRAKIS_PORT: port?.toString() || ''
                }
            });

            // Store process info
            const processInfo: ProcessInfo = {
                id: name,
                name,
                command: fullCommand,
                status: 'running',
                port,
                workingDirectory: workingDir,
                startTime: new Date(),
                terminal
            };

            this.processInfo.set(name, processInfo);

            // Show terminal and execute command
            terminal.show();
            terminal.sendText(fullCommand);

            // Listen for terminal disposal (when user closes it)
            const disposable = vscode.window.onDidCloseTerminal((closedTerminal) => {
                if (closedTerminal === terminal) {
                    const info = this.processInfo.get(name);
                    if (info) {
                        info.status = 'stopped';
                        this.processInfo.set(name, info);
                    }
                    opLog.info('Terminal process was closed', { name });
                    disposable.dispose();
                }
            });

            opLog.info('Process started in terminal', { name });
            return true;
        } catch (error) {
            opLog.error('Failed to start process', { name, error });
            return false;
        }
    }

    async stopProcess(name: string): Promise<boolean> {
        const opLog = log.forOperation('stop');
        try {
            const processInfo = this.processInfo.get(name);
            if (!processInfo) {
                opLog.info('Process not found', { name });
                return false;
            }

            if (processInfo.status !== 'running') {
                opLog.info('Process is not running', { name, status: processInfo.status });
                return false;
            }

            // Use TerminalManager to stop the terminal gracefully
            if (processInfo.terminal) {
                // Send Ctrl+C to gracefully stop the process
                processInfo.terminal.sendText('\u0003'); // Ctrl+C
                
                // Wait a moment for graceful shutdown
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Then dispose the terminal
                processInfo.terminal.dispose();
                opLog.info('Terminal for process disposed', { name });
            }
            
            // Update status
            processInfo.status = 'stopped';
            processInfo.terminal = undefined;
            this.processInfo.set(name, processInfo);
            
            opLog.info('Process stopped successfully', { name });
            return true;
        } catch (error) {
            opLog.error('Failed to stop process', { name, error });
            
            // Mark as stopped even if there was an error, to prevent zombie entries
            const processInfo = this.processInfo.get(name);
            if (processInfo) {
                processInfo.status = 'stopped';
                processInfo.terminal = undefined;
                this.processInfo.set(name, processInfo);
            }
            
            return false;
        }
    }

    getProcessInfo(name: string): ProcessInfo | undefined {
        return this.processInfo.get(name);
    }

    getAllProcesses(): ProcessInfo[] {
        return Array.from(this.processInfo.values());
    }

    isProcessRunning(name: string): boolean {
        const processInfo = this.processInfo.get(name);
        return processInfo !== undefined && processInfo.status === 'running';
    }

    async killAllProcesses(): Promise<void> {
        const allProcessNames = Array.from(this.processInfo.keys());
        const promises = allProcessNames.map(name => this.stopProcess(name));
        await Promise.all(promises);
        
        log.info('All processes stopped', { count: allProcessNames.length });
    }

    getRunningProcessesCount(): number {
        return Array.from(this.processInfo.values())
            .filter(info => info.status === 'running').length;
    }

    async getPortStatus(port: number): Promise<boolean> {
        // Simple implementation - could be enhanced with actual port checking
        return Array.from(this.processInfo.values())
            .some(info => info.port === port && info.status === 'running');
    }

    // Launcher-specific methods
    async startLauncher(configPath: string): Promise<boolean> {
        const launcherPort = resolveLauncherPort();
        if (launcherPort === undefined) {
            log.warn(
                `${ZIGURAT_PENDING} aleph0.launcher.port no configurado — no se arranca launcher con puerto inventado`
            );
            vscode.window.showWarningMessage(
                `${ZIGURAT_PENDING} Configure aleph0.launcher.port antes de arrancar el launcher`
            );
            return false;
        }
        const workingDir = path.dirname(configPath);
        return await this.startProcess('launcher', 'node', ['launcher.js', configPath], workingDir, launcherPort);
    }

    async stopLauncher(): Promise<boolean> {
        return await this.stopProcess('launcher');
    }

    // MCP Server methods
    async startMCPServer(serverId: string, port: number, workingDir: string, cmd: string, args: string[]): Promise<boolean> {
        return await this.startProcess(serverId, cmd || 'node', args || ['index.js'], workingDir, port);
    }

    async stopMCPServer(serverId: string): Promise<boolean> {
        return await this.stopProcess(serverId);
    }

    // UI-specific methods (reusing MCP server logic for now)
    async startUI(uiId: string, port: number): Promise<boolean> {
        const workingDir = path.join(__dirname, '..', '..', 'ui-servers', uiId);
        return await this.startProcess(uiId, 'node', ['server.js'], workingDir, port);
    }

    async stopUI(uiId: string): Promise<boolean> {
        return await this.stopProcess(uiId);
    }

    // MCP Web methods - these can track web server status
    async startMCPWeb(webId: string, host: string, port: number, workingDir?: string, cmd?: string, args?: string[]): Promise<boolean> {
        // For webs, we typically don't start them from here since they're already running servers
        // But we can track their status by attempting to check if the port is responding
        try {
            const processName = `mcp-web-${webId}`;
            
            // If we have actual startup commands, use them
            if (cmd && args && workingDir) {
                return await this.startProcess(processName, cmd, args, workingDir, port);
            }
            
            // Otherwise, just mark it as a tracked process (for status monitoring)
            const processInfo: ProcessInfo = {
                id: processName,
                name: `MCP Web: ${webId}`,
                command: `Web interface at http://${host}:${port}`,
                status: 'running',  // Assume running if we can reach it
                port,
                workingDirectory: workingDir || process.cwd(),
                startTime: new Date()
            };
            
            this.processInfo.set(processName, processInfo);
            log.info('MCP Web tracked', { webId, url: `http://${host}:${port}` });
            return true;
        } catch (error) {
            log.error('Failed to start/track MCP web', { webId, error });
            return false;
        }
    }

    async stopMCPWeb(webId: string): Promise<boolean> {
        const processName = `mcp-web-${webId}`;
        return await this.stopProcess(processName);
    }

    // Check if a MCP web is accessible (for status checking)
    async checkMCPWebStatus(webId: string, host: string, port: number): Promise<boolean> {
        try {
            // This is a simple implementation - could be enhanced with actual HTTP requests
            // For now, we'll just check if we have it tracked as running
            const processName = `mcp-web-${webId}`;
            const processInfo = this.processInfo.get(processName);
            return processInfo?.status === 'running';
        } catch (error) {
            log.error('Failed to check MCP web status', { webId, error });
            return false;
        }
    }

    // Get MCP Web info
    getMCPWebInfo(webId: string): ProcessInfo | undefined {
        const processName = `mcp-web-${webId}`;
        return this.getProcessInfo(processName);
    }

    // Check if MCP Web is running
    isMCPWebRunning(webId: string): boolean {
        const processName = `mcp-web-${webId}`;
        return this.isProcessRunning(processName);
    }

    // Process information methods
    getProcess(processId: string): ProcessInfo | undefined {
        return this.getProcessInfo(processId);
    }

    getProcesses(): ProcessInfo[] {
        return this.getAllProcesses();
    }

    // Show process logs (placeholder - could be enhanced)
    showProcessLogs(processId: string): void {
        const processInfo = this.getProcessInfo(processId);
        if (processInfo) {
            // Se enumeran los campos: `terminal` es un objeto vivo de la API de
            // VS Code, no un dato — volcarlo ensucia el canal sin diagnosticar.
            log.info('Logs for process', {
                processId,
                name: processInfo.name,
                command: processInfo.command,
                status: processInfo.status,
                port: processInfo.port,
                workingDirectory: processInfo.workingDirectory,
                startTime: processInfo.startTime
            });
        }
    }

    // Dispose method for cleanup
    dispose(): void {
        this.killAllProcesses();
        this.processInfo.clear();
    }

    private getShellPath(): string {
        // For Windows with bash.exe (user preference)
        if (process.platform === 'win32') {
            // Try common bash locations
            const bashPaths = [
                'C:\\Program Files\\Git\\bin\\bash.exe',
                'C:\\Windows\\System32\\bash.exe',
                'bash.exe' // Let PATH resolve it
            ];
            
            for (const bashPath of bashPaths) {
                if (bashPath === 'bash.exe' || require('fs').existsSync(bashPath)) {
                    return bashPath;
                }
            }
        }
        
        // Default shell for other platforms
        return process.env.SHELL || '/bin/bash';
    }
}