/**
 * WISH-01: Copilot Log Exporter Commands
 * VS Code commands for the Copilot Log Exporter functionality
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { 
    getCopilotLogExporterService, 
    getAgentAutoDebugService,
    CopilotMetricsPanelProvider,
    startCopilotLogsMCPServer,
    stopCopilotLogsMCPServer,
    isCopilotLogsMCPServerRunning,
    getCopilotLogsMCPServerUrl,
    getSnapshotManager
} from './index';

/**
 * Auto-register the Copilot Logs MCP Server in .vscode/mcp.json
 * Creates the file if it doesn't exist, or adds the server if not present
 */
async function ensureMCPServerRegistered(): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        console.log('No workspace folder found, skipping mcp.json registration');
        return;
    }

    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    const vscodeDir = path.join(workspaceRoot, '.vscode');
    const mcpJsonPath = path.join(vscodeDir, 'mcp.json');

    const serverEntry = {
        "copilot-logs-mcp-server": {
            "type": "http",
            "url": "http://localhost:3100"
        }
    };

    try {
        // Ensure .vscode directory exists
        if (!fs.existsSync(vscodeDir)) {
            fs.mkdirSync(vscodeDir, { recursive: true });
        }

        let mcpConfig: { servers?: Record<string, any> } = { servers: {} };

        // Read existing mcp.json if it exists
        if (fs.existsSync(mcpJsonPath)) {
            const existingContent = fs.readFileSync(mcpJsonPath, 'utf8');
            try {
                mcpConfig = JSON.parse(existingContent);
                if (!mcpConfig.servers) {
                    mcpConfig.servers = {};
                }
            } catch (parseError) {
                console.error('Failed to parse existing mcp.json, creating new one');
                mcpConfig = { servers: {} };
            }
        }

        // Check if our server is already registered
        if (mcpConfig.servers?.['copilot-logs-mcp-server']) {
            console.log('Copilot Logs MCP Server already registered in mcp.json');
            return;
        }

        // Add our server
        mcpConfig.servers = {
            ...mcpConfig.servers,
            ...serverEntry
        };

        // Write back
        fs.writeFileSync(mcpJsonPath, JSON.stringify(mcpConfig, null, 2));
        console.log('✅ Copilot Logs MCP Server registered in .vscode/mcp.json');

    } catch (error) {
        console.error('Failed to register MCP server in mcp.json:', error);
    }
}

/**
 * Auto-start the Copilot Logs MCP Server on extension activation
 * Runs async and non-blocking to not delay extension startup
 */
async function autoStartMCPServer(context: vscode.ExtensionContext): Promise<void> {
    // Check if auto-start is enabled in settings (default: true)
    const config = vscode.workspace.getConfiguration('alephscript.copilotLogs');
    const autoStart = config.get<boolean>('autoStartMCPServer', true);

    if (!autoStart) {
        console.log('MCP Server auto-start disabled by configuration');
        return;
    }

    // Small delay to let extension fully initialize
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        if (isCopilotLogsMCPServerRunning()) {
            console.log('MCP Server already running');
            return;
        }

        const server = await startCopilotLogsMCPServer(context);
        console.log(`✅ Copilot Logs MCP Server auto-started at ${getCopilotLogsMCPServerUrl()}`);
        
        // Show subtle notification (not intrusive)
        vscode.window.setStatusBarMessage('$(radio-tower) Copilot Logs MCP Server ready on :3100', 5000);

    } catch (error) {
        console.error('Failed to auto-start MCP server:', error);
        // Don't show error to user on auto-start failure - they can start manually
    }
}

/**
 * Register all Copilot Log Exporter commands
 */
export function registerCopilotLogCommands(context: vscode.ExtensionContext): void {
    const logService = getCopilotLogExporterService();
    const debugService = getAgentAutoDebugService();

    // Auto-register MCP server in mcp.json on extension activation
    ensureMCPServerRegistered();

    // Auto-start MCP server on extension activation (async, non-blocking)
    autoStartMCPServer(context);

    // Command: List Sessions
    context.subscriptions.push(
        vscode.commands.registerCommand('copilotLogs.listSessions', async () => {
            const sessions = await logService.listSessions();
            
            if (sessions.length === 0) {
                vscode.window.showInformationMessage('No Copilot sessions found.');
                return;
            }

            const items = sessions.map(s => ({
                label: `Session ${s.sessionId.slice(-8)}`,
                description: `${s.requestCount} requests`,
                detail: `${s.startTime.toLocaleString()} - ${s.endTime.toLocaleString()}`,
                sessionId: s.sessionId
            }));

            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: 'Select a session to view'
            });

            if (selected) {
                vscode.commands.executeCommand('copilotLogs.viewSession', selected.sessionId);
            }
        })
    );

    // Command: List Requests
    context.subscriptions.push(
        vscode.commands.registerCommand('copilotLogs.listRequests', async () => {
            const requests = await logService.listRequests();
            
            if (requests.length === 0) {
                vscode.window.showInformationMessage('No Copilot requests found.');
                return;
            }

            const items = requests.slice(0, 50).map(r => ({
                label: `${r.id}`,
                description: r.model || 'unknown model',
                detail: `${r.timestamp.toLocaleString()} - ${r.durationMs}ms - ${r.promptTokens || '?'} tokens`,
                requestId: r.id
            }));

            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: 'Select a request to view'
            });

            if (selected) {
                vscode.commands.executeCommand('copilotLogs.viewRequest', selected.requestId);
            }
        })
    );

    // Command: View Request
    context.subscriptions.push(
        vscode.commands.registerCommand('copilotLogs.viewRequest', async (requestId: string) => {
            const doc = await logService.getRequest(requestId);
            
            if (!doc) {
                vscode.window.showErrorMessage(`Could not load request ${requestId}`);
                return;
            }

            // Create a virtual document to display the content
            const uri = vscode.Uri.parse(`untitled:copilot-request-${requestId}.md`);
            const document = await vscode.workspace.openTextDocument(uri);
            const editor = await vscode.window.showTextDocument(document);
            
            await editor.edit((editBuilder: vscode.TextEditorEdit) => {
                editBuilder.insert(new vscode.Position(0, 0), doc.raw);
            });
        })
    );

    // Command: Get Request Content (for MCP server access)
    // This command runs in Extension Host context and can access ccreq: scheme
    context.subscriptions.push(
        vscode.commands.registerCommand('copilotLogs.getRequestContent', async (requestId: string, format: 'copilotmd' | 'json' = 'copilotmd') => {
            try {
                const doc = await logService.getRequest(requestId, format);
                
                if (!doc) {
                    return { 
                        success: false, 
                        error: `Request not found: ${requestId}`,
                        requestId 
                    };
                }

                // Return the full content for MCP consumption
                return {
                    success: true,
                    requestId: doc.requestId,
                    format: doc.format,
                    raw: doc.raw,
                    metadata: doc.metadata,
                    systemMessage: doc.systemMessage,
                    systemMessageLength: doc.systemMessage?.length || 0,
                    userMessages: doc.userMessages,
                    assistantResponses: doc.assistantResponses,
                    toolCalls: doc.toolCalls
                };
            } catch (error) {
                return {
                    success: false,
                    error: `Failed to resolve: ${error}`,
                    requestId
                };
            }
        })
    );

    // Command: Get Latest Request Content (for MCP server access)
    context.subscriptions.push(
        vscode.commands.registerCommand('copilotLogs.getLatestRequestContent', async () => {
            try {
                const doc = await logService.getLatestRequest();
                
                if (!doc) {
                    return { 
                        success: false, 
                        error: 'No latest request available'
                    };
                }

                return {
                    success: true,
                    requestId: doc.requestId,
                    format: doc.format,
                    raw: doc.raw,
                    metadata: doc.metadata,
                    systemMessage: doc.systemMessage,
                    systemMessageLength: doc.systemMessage?.length || 0,
                    userMessages: doc.userMessages,
                    assistantResponses: doc.assistantResponses,
                    toolCalls: doc.toolCalls
                };
            } catch (error) {
                return {
                    success: false,
                    error: `Failed to resolve latest: ${error}`
                };
            }
        })
    );

    // Command: Analyze Session
    context.subscriptions.push(
        vscode.commands.registerCommand('copilotLogs.analyzeSession', async (sessionId?: string) => {
            const analysis = await logService.analyzeSession(sessionId);
            
            const statusEmoji = {
                optimal: '✅',
                acceptable: '🟢',
                warning: '🟠',
                critical: '🔴'
            };

            let message = `${statusEmoji[analysis.status]} Context Health: ${analysis.healthScore}/100\n\n`;
            message += `Cache Hit Rate: ${(analysis.cacheHitRate * 100).toFixed(1)}%\n`;
            message += `Token Trend: ${analysis.tokenTrend}\n`;
            message += `Issues: ${analysis.issues.length}\n\n`;
            
            if (analysis.recommendations.length > 0) {
                message += `Recommendations:\n${analysis.recommendations.join('\n')}`;
            }

            // Show in output channel for full content
            const channel = vscode.window.createOutputChannel('Copilot Analysis');
            channel.appendLine(message);
            channel.show();

            vscode.window.showInformationMessage(
                `Context Health: ${analysis.healthScore}/100 (${analysis.status})`,
                'View Details'
            ).then((selection: string | undefined) => {
                if (selection === 'View Details') {
                    channel.show();
                }
            });
        })
    );

    // Command: Search Requests
    context.subscriptions.push(
        vscode.commands.registerCommand('copilotLogs.searchRequests', async () => {
            const pattern = await vscode.window.showInputBox({
                prompt: 'Enter search pattern',
                placeHolder: 'e.g., read_file, error, function name...'
            });

            if (!pattern) return;

            const results = await logService.searchRequests({ 
                pattern,
                limit: 20 
            });

            if (results.length === 0) {
                vscode.window.showInformationMessage(`No results found for "${pattern}"`);
                return;
            }

            const items = results.map(r => ({
                label: r.requestId,
                description: r.matchLocation,
                detail: r.snippet.slice(0, 100),
                result: r
            }));

            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: `${results.length} results found`
            });

            if (selected) {
                vscode.commands.executeCommand('copilotLogs.viewRequest', selected.result.requestId);
            }
        })
    );

    // Command: Export Conversation
    context.subscriptions.push(
        vscode.commands.registerCommand('copilotLogs.exportConversation', async (sessionId?: string) => {
            if (!sessionId) {
                const sessions = await logService.listSessions();
                if (sessions.length === 0) {
                    vscode.window.showInformationMessage('No sessions to export.');
                    return;
                }

                const items = sessions.map(s => ({
                    label: `Session ${s.sessionId.slice(-8)}`,
                    description: `${s.requestCount} requests`,
                    sessionId: s.sessionId
                }));

                const selected = await vscode.window.showQuickPick(items, {
                    placeHolder: 'Select session to export'
                });

                if (!selected) return;
                sessionId = selected.sessionId;
            }

            const exported = await logService.exportConversation(sessionId!);
            
            if (!exported) {
                vscode.window.showErrorMessage('Failed to export conversation');
                return;
            }

            // Generate markdown
            let md = `# Copilot Conversation Export\n\n`;
            md += `**Exported**: ${exported.exportedAt.toLocaleString()}\n`;
            md += `**Session**: ${exported.sessionId}\n`;
            md += `**Requests**: ${exported.stats.totalRequests}\n`;
            md += `**Total Tokens**: ${exported.stats.totalTokens}\n`;
            md += `**Models**: ${exported.stats.models.join(', ')}\n\n`;
            md += `---\n\n`;

            for (const msg of exported.messages) {
                const roleEmoji = {
                    system: '⚙️',
                    user: '👤',
                    assistant: '🤖',
                    tool: '🔧'
                };
                md += `### ${roleEmoji[msg.role]} ${msg.role.toUpperCase()}\n\n`;
                md += `${msg.content.slice(0, 2000)}${msg.content.length > 2000 ? '...(truncated)' : ''}\n\n`;
            }

            // Save to file
            const saveUri = await vscode.window.showSaveDialog({
                defaultUri: vscode.Uri.file(`copilot-conversation-${sessionId!.slice(-8)}.md`),
                filters: { 'Markdown': ['md'] }
            });

            if (saveUri) {
                await vscode.workspace.fs.writeFile(saveUri, new TextEncoder().encode(md));
                vscode.window.showInformationMessage(`Exported to ${saveUri.fsPath}`);
            }
        })
    );

    // Command: Auto-Debug Latest
    context.subscriptions.push(
        vscode.commands.registerCommand('copilotLogs.autoDebug', async () => {
            const report = await debugService.debugLatestRequest();
            
            if (!report) {
                vscode.window.showWarningMessage('No request to debug. Make a Copilot request first.');
                return;
            }

            const channel = vscode.window.createOutputChannel('Agent Auto-Debug');
            channel.appendLine(report.summary);
            channel.appendLine('\n## Issues\n');
            
            for (const issue of report.issues) {
                const emoji = issue.severity === 'error' ? '🔴' : 
                             issue.severity === 'warning' ? '🟠' : '🔵';
                channel.appendLine(`${emoji} [${issue.category}] ${issue.title}`);
                channel.appendLine(`   ${issue.description}\n`);
            }

            channel.appendLine('\n## Tool Usage\n');
            channel.appendLine(`- Total calls: ${report.toolUsage.totalCalls}`);
            channel.appendLine(`- Successful: ${report.toolUsage.successfulCalls}`);
            channel.appendLine(`- Failed: ${report.toolUsage.failedCalls}`);
            channel.appendLine(`- Tools used: ${report.toolUsage.toolsUsed.join(', ')}`);

            channel.appendLine('\n## Suggestions\n');
            for (const suggestion of report.suggestions) {
                channel.appendLine(`- ${suggestion}`);
            }

            channel.show();
        })
    );

    // Command: Refresh Metrics
    context.subscriptions.push(
        vscode.commands.registerCommand('copilotLogs.refreshMetrics', async () => {
            await logService.refresh();
            vscode.window.showInformationMessage('Copilot metrics refreshed');
        })
    );

    // Command: Show Diagnostics
    context.subscriptions.push(
        vscode.commands.registerCommand('copilotLogs.diagnostics', async () => {
            const diag = logService.getDiagnostics();
            const available = await logService.isAvailable();

            const message = [
                `Copilot Log Exporter Diagnostics`,
                `--------------------------------`,
                `ccreq: scheme available: ${available ? '✅ Yes' : '❌ No'}`,
                `Log base path: ${diag.logPath}`,
                `Last scan: ${diag.lastScan?.toLocaleString() || 'Never'}`,
                `Indexed requests: ${diag.requestCount}`,
                `Sessions: ${diag.sessionCount}`
            ].join('\n');

            const channel = vscode.window.createOutputChannel('Copilot Log Diagnostics');
            channel.appendLine(message);
            channel.show();
        })
    );

    // Register the metrics panel
    const metricsProvider = new CopilotMetricsPanelProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            CopilotMetricsPanelProvider.viewType,
            metricsProvider
        )
    );

    // =========================================================================
    // MCP Server Commands
    // =========================================================================

    // Command: Start MCP Server
    context.subscriptions.push(
        vscode.commands.registerCommand('copilotLogs.startMCPServer', async () => {
            try {
                if (isCopilotLogsMCPServerRunning()) {
                    vscode.window.showInformationMessage(
                        `MCP Server already running at ${getCopilotLogsMCPServerUrl()}`
                    );
                    return;
                }

                const server = await startCopilotLogsMCPServer(context);
                server.getOutputChannel().show();
                vscode.window.showInformationMessage(
                    `✅ Copilot Logs MCP Server started at ${getCopilotLogsMCPServerUrl()}`
                );
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to start MCP server: ${error}`);
            }
        })
    );

    // Command: Stop MCP Server
    context.subscriptions.push(
        vscode.commands.registerCommand('copilotLogs.stopMCPServer', async () => {
            try {
                if (!isCopilotLogsMCPServerRunning()) {
                    vscode.window.showInformationMessage('MCP Server is not running');
                    return;
                }

                await stopCopilotLogsMCPServer();
                vscode.window.showInformationMessage('Copilot Logs MCP Server stopped');
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to stop MCP server: ${error}`);
            }
        })
    );

    // Command: Show MCP Server Status
    context.subscriptions.push(
        vscode.commands.registerCommand('copilotLogs.mcpServerStatus', async () => {
            const isRunning = isCopilotLogsMCPServerRunning();
            const url = getCopilotLogsMCPServerUrl();

            const message = isRunning
                ? `✅ MCP Server is running at ${url}`
                : '❌ MCP Server is not running';

            const action = isRunning ? 'Stop Server' : 'Start Server';
            const selected = await vscode.window.showInformationMessage(message, action);

            if (selected === 'Start Server') {
                vscode.commands.executeCommand('copilotLogs.startMCPServer');
            } else if (selected === 'Stop Server') {
                vscode.commands.executeCommand('copilotLogs.stopMCPServer');
            }
        })
    );

    // =========================================================================
    // Snapshot Commands (FEATURE-SNAPSHOTS-1.0.0)
    // =========================================================================

    // Command: Capture Snapshot
    context.subscriptions.push(
        vscode.commands.registerCommand('copilotLogs.captureSnapshot', async () => {
            const snapshotManager = getSnapshotManager();
            
            // 1. Prompt for snapshot name (required)
            const name = await vscode.window.showInputBox({
                prompt: '💾 Snapshot name',
                placeHolder: 'e.g., Debug session for issue #42',
                validateInput: (value) => value.trim() ? null : 'Name is required'
            });

            if (!name) return;

            // 2. Prompt for optional description
            const description = await vscode.window.showInputBox({
                prompt: '📝 Description (optional)',
                placeHolder: 'e.g., Investigating context bloat issue'
            });

            // 3. Link to backlog (QuickPick)
            const backlogOptions = [
                { label: '$(dash) No link', value: undefined },
                { label: '$(git-pull-request) FEATURE-SNAPSHOTS-1.0.0', value: 'FEATURE-SNAPSHOTS-1.0.0' },
                { label: '$(bug) BUG-MCLOGS-1.0.0', value: 'BUG-MCLOGS-1.0.0' },
                { label: '$(beaker) SCRIPT-2.2.0', value: 'SCRIPT-2.2.0' },
                { label: '$(edit) Enter manually...', value: '__custom__' }
            ];

            const selectedBacklog = await vscode.window.showQuickPick(backlogOptions, {
                placeHolder: '🔗 Link to backlog (optional)'
            });

            let linkedBacklog: string | undefined;
            if (selectedBacklog?.value === '__custom__') {
                linkedBacklog = await vscode.window.showInputBox({
                    prompt: 'Backlog ID',
                    placeHolder: 'e.g., SCRIPT-2.1.1'
                }) || undefined;
            } else {
                linkedBacklog = selectedBacklog?.value;
            }

            try {
                const result = await snapshotManager.captureSnapshot({ name, description, linkedBacklog });
                
                if (!result.success) {
                    vscode.window.showErrorMessage(`Failed to capture snapshot: ${result.error}`);
                    return;
                }

                const action = await vscode.window.showInformationMessage(
                    `✅ Snapshot captured: ${result.snapshotId} (${result.requestCount} requests)`,
                    'View', 'Export MD', 'Open Folder'
                );

                if (action === 'View' && result.snapshotId) {
                    const snapshot = await snapshotManager.getSnapshot(result.snapshotId);
                    if (snapshot) {
                        const doc = await vscode.workspace.openTextDocument({
                            content: JSON.stringify(snapshot, null, 2),
                            language: 'json'
                        });
                        await vscode.window.showTextDocument(doc);
                    }
                } else if (action === 'Export MD' && result.snapshotId) {
                    const mdPath = await snapshotManager.exportToMarkdown(result.snapshotId);
                    if (mdPath) {
                        const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(mdPath));
                        await vscode.window.showTextDocument(doc);
                    }
                } else if (action === 'Open Folder') {
                    const snapshotsDir = snapshotManager.getSnapshotsDirectory();
                    vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(snapshotsDir));
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to capture snapshot: ${error}`);
            }
        })
    );

    // Command: List Snapshots
    context.subscriptions.push(
        vscode.commands.registerCommand('copilotLogs.listSnapshots', async () => {
            const snapshotManager = getSnapshotManager();
            const snapshots = await snapshotManager.listSnapshots();

            if (snapshots.length === 0) {
                const create = await vscode.window.showInformationMessage(
                    'No snapshots found. Would you like to capture one now?',
                    'Capture Now'
                );
                if (create) {
                    vscode.commands.executeCommand('copilotLogs.captureSnapshot');
                }
                return;
            }

            const items = snapshots.map(s => ({
                label: s.name,
                description: `${s.requestCount} requests`,
                detail: `${new Date(s.createdAt).toLocaleString()} | ${s.models?.join(', ') || 'unknown model'}`,
                snapshotId: s.id
            }));

            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: `${snapshots.length} snapshots available`
            });

            if (selected) {
                const action = await vscode.window.showQuickPick(
                    ['View JSON', 'Export Markdown', 'Delete'],
                    { placeHolder: `Action for "${selected.label}"` }
                );

                if (action === 'View JSON') {
                    const snapshot = await snapshotManager.getSnapshot(selected.snapshotId);
                    if (snapshot) {
                        const doc = await vscode.workspace.openTextDocument({
                            content: JSON.stringify(snapshot, null, 2),
                            language: 'json'
                        });
                        await vscode.window.showTextDocument(doc);
                    }
                } else if (action === 'Export Markdown') {
                    const mdPath = await snapshotManager.exportToMarkdown(selected.snapshotId);
                    if (mdPath) {
                        const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(mdPath));
                        await vscode.window.showTextDocument(doc);
                    }
                } else if (action === 'Delete') {
                    const confirm = await vscode.window.showWarningMessage(
                        `Delete snapshot "${selected.label}"?`,
                        { modal: true },
                        'Delete'
                    );
                    if (confirm) {
                        const deleted = await snapshotManager.deleteSnapshot(selected.snapshotId);
                        if (deleted) {
                            vscode.window.showInformationMessage('Snapshot deleted');
                        } else {
                            vscode.window.showErrorMessage('Failed to delete snapshot');
                        }
                    }
                }
            }
        })
    );

    // Command: Open Snapshots Folder
    context.subscriptions.push(
        vscode.commands.registerCommand('copilotLogs.openSnapshotsFolder', async () => {
            const snapshotManager = getSnapshotManager();
            const snapshotsDir = snapshotManager.getSnapshotsDirectory();
            
            // Ensure directory exists
            if (!fs.existsSync(snapshotsDir)) {
                fs.mkdirSync(snapshotsDir, { recursive: true });
            }

            vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(snapshotsDir));
        })
    );

    // Command: Generate Abstract (T009)
    context.subscriptions.push(
        vscode.commands.registerCommand('copilotLogs.generateAbstract', async () => {
            const snapshotManager = getSnapshotManager();
            
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Generando ABSTRACT.md con resúmenes semánticos...',
                cancellable: false
            }, async () => {
                const abstractPath = await snapshotManager.generateAbstract();
                
                if (abstractPath) {
                    const action = await vscode.window.showInformationMessage(
                        '✅ ABSTRACT.md generado con resúmenes semánticos',
                        'Abrir'
                    );
                    if (action === 'Abrir') {
                        const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(abstractPath));
                        await vscode.window.showTextDocument(doc);
                    }
                } else {
                    vscode.window.showWarningMessage('No hay snapshots para generar abstract. Captura algunos primero.');
                }
            });
        })
    );

    console.log('✅ Copilot Log Exporter commands registered');
}
