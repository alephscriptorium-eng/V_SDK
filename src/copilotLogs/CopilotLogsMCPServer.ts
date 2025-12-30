/**
 * CopilotLogsMCPServer
 * 
 * MCP Server for Copilot Log Exporter functionality.
 * Extends BaseMCPServer from mcp-core-sdk and runs INSIDE the VS Code extension,
 * providing full access to VS Code APIs (ccreq: URIs, workspace, etc.).
 * 
 * Architecture:
 * - Sibling of DevOpsServer, MCPLauncherServer in mcp-mesh-sdk
 * - Follows same patterns: BaseMCPServerConfig, setupServerSpecifics()
 * - Runs in Extension Host (Node.js process with http.createServer)
 * 
 * @see MCPGallery/mcp-mesh-sdk/src/DevOpsServerImpl.ts - reference implementation
 * @see mcp-core-sdk/src/server/BaseMCPServer.ts - base class
 */

import { z } from 'zod';
import * as vscode from 'vscode';
import { BaseMCPServer, MCPLogger } from '@alephscript/mcp-core-sdk/server';
import { BaseMCPServerConfig } from '@alephscript/mcp-core-sdk/server';
import { CopilotLogExporterService, getCopilotLogExporterService } from './CopilotLogExporterService';
import { CopilotLogSearchQuery } from './types';
import { getCacheStats, getCacheConfig, setCacheConfig } from './CcreqDocumentResolver';

/**
 * Default configuration for the Copilot Logs MCP Server
 */
const COPILOT_LOGS_SERVER_CONFIG: BaseMCPServerConfig = {
    id: 'copilot-logs-mcp-server',
    name: 'Copilot Logs MCP Server',
    version: '1.0.0',
    description: 'MCP Server for accessing and analyzing Copilot Chat request logs',
    port: 3100, // Dedicated port for this server
    capabilities: {
        tools: [],
        resources: [],
        prompts: []
    },
    capabilitiesCheck: {
        tools: true,
        resources: true,
        prompts: false
    },
    features: {
        enableManagers: false,
        enableWebConsole: true,
        enableHealthChecks: true
    }
};

/**
 * VS Code Output Channel logger adapter
 */
function createVSCodeLogger(outputChannel: vscode.OutputChannel): MCPLogger {
    return {
        info: (message: string, ...args: any[]) => {
            outputChannel.appendLine(`[INFO] ${message} ${args.length ? JSON.stringify(args) : ''}`);
        },
        error: (message: string, ...args: any[]) => {
            outputChannel.appendLine(`[ERROR] ${message} ${args.length ? JSON.stringify(args) : ''}`);
        },
        debug: (message: string, ...args: any[]) => {
            outputChannel.appendLine(`[DEBUG] ${message} ${args.length ? JSON.stringify(args) : ''}`);
        },
        verbose: (message: string, ...args: any[]) => {
            outputChannel.appendLine(`[VERBOSE] ${message} ${args.length ? JSON.stringify(args) : ''}`);
        }
    };
}

/**
 * CopilotLogsMCPServer
 * 
 * Exposes Copilot log analysis tools via MCP protocol.
 * Runs inside VS Code extension for full API access.
 */
export class CopilotLogsMCPServer extends BaseMCPServer {
    private logService: CopilotLogExporterService;
    private outputChannel: vscode.OutputChannel;

    constructor(outputChannel?: vscode.OutputChannel) {
        // Create or use existing output channel
        const channel = outputChannel || vscode.window.createOutputChannel('Copilot Logs MCP');
        
        // Initialize with VS Code logger
        super(COPILOT_LOGS_SERVER_CONFIG, createVSCodeLogger(channel));
        
        this.outputChannel = channel;
        this.logService = getCopilotLogExporterService();
    }

    /**
     * Setup server-specific tools, resources, and prompts
     * Called by BaseMCPServer.initialize()
     */
    protected async setupServerSpecifics(): Promise<void> {
        this.outputChannel.appendLine('🔧 Setting up Copilot Logs MCP tools...');

        // Initialize the log service
        await this.logService.initialize();

        // Register all MCP tools
        this.registerTools();
        
        // Register resources
        this.registerResources();

        this.outputChannel.appendLine('✅ Copilot Logs MCP tools registered');
    }

    /**
     * Register all MCP tools
     */
    private registerTools(): void {
        // =====================================================================
        // Tool: list_copilot_sessions
        // =====================================================================
        this.server.tool(
            'list_copilot_sessions',
            'List all available Copilot Chat sessions grouped by time',
            {},
            async () => {
                try {
                    const sessions = await this.logService.listSessions();
                    return {
                        content: [{
                            type: 'text',
                            text: JSON.stringify({
                                count: sessions.length,
                                sessions: sessions.map(s => ({
                                    sessionId: s.sessionId,
                                    startTime: s.startTime.toISOString(),
                                    endTime: s.endTime.toISOString(),
                                    requestCount: s.requestCount,
                                    totalTokens: s.totalTokens,
                                    totalCachedTokens: s.totalCachedTokens
                                }))
                            }, null, 2)
                        }]
                    };
                } catch (error) {
                    return {
                        content: [{
                            type: 'text',
                            text: `Error listing sessions: ${error}`
                        }],
                        isError: true
                    };
                }
            }
        );

        // =====================================================================
        // Tool: list_copilot_requests
        // =====================================================================
        this.server.tool(
            'list_copilot_requests',
            'List Copilot requests, optionally filtered by session',
            {
                sessionId: z.string().optional().describe('Filter by session ID')
            },
            async ({ sessionId }) => {
                try {
                    const requests = await this.logService.listRequests(sessionId);
                    return {
                        content: [{
                            type: 'text',
                            text: JSON.stringify({
                                count: requests.length,
                                requests: requests.map(r => ({
                                    id: r.id,
                                    timestamp: r.timestamp.toISOString(),
                                    model: r.model,
                                    promptTokens: r.promptTokens,
                                    cachedTokens: r.cachedTokens,
                                    durationMs: r.durationMs
                                }))
                            }, null, 2)
                        }]
                    };
                } catch (error) {
                    return {
                        content: [{
                            type: 'text',
                            text: `Error listing requests: ${error}`
                        }],
                        isError: true
                    };
                }
            }
        );

        // =====================================================================
        // Tool: get_copilot_request
        // =====================================================================
        this.server.tool(
            'get_copilot_request',
            'Get the full content of a specific Copilot request (system message, user messages, tool calls, responses)',
            {
                requestId: z.string().describe('The request ID to retrieve'),
                format: z.enum(['copilotmd', 'json']).optional().default('json').describe('Output format')
            },
            async ({ requestId, format }) => {
                try {
                    // First try the direct service method
                    let doc = await this.logService.getRequest(requestId, format as 'copilotmd' | 'json');
                    
                    // If direct resolution failed, try via VS Code command (Extension Host context)
                    if (!doc) {
                        this.outputChannel.appendLine(`Direct resolution failed for ${requestId}, trying VS Code command...`);
                        try {
                            const cmdResult = await vscode.commands.executeCommand<{
                                success: boolean;
                                error?: string;
                                requestId?: string;
                                raw?: string;
                                metadata?: any;
                                systemMessage?: string;
                                systemMessageLength?: number;
                                userMessages?: string[];
                                assistantResponses?: string[];
                                toolCalls?: any[];
                            }>('copilotLogs.getRequestContent', requestId, format);
                            
                            if (cmdResult?.success) {
                                // Command succeeded - use its result
                                return {
                                    content: [{
                                        type: 'text',
                                        text: format === 'copilotmd' 
                                            ? cmdResult.raw || ''
                                            : JSON.stringify({
                                                requestId: cmdResult.requestId,
                                                systemMessageLength: cmdResult.systemMessageLength || 0,
                                                userMessages: cmdResult.userMessages || [],
                                                assistantResponses: cmdResult.assistantResponses || [],
                                                toolCalls: cmdResult.toolCalls?.map((t: any) => ({
                                                    name: t.name,
                                                    argumentsLength: t.arguments?.length || 0,
                                                    resultLength: t.result?.length || 0
                                                })) || []
                                            }, null, 2)
                                    }]
                                };
                            }
                        } catch (cmdError) {
                            this.outputChannel.appendLine(`VS Code command fallback also failed: ${cmdError}`);
                        }
                    }
                    
                    if (!doc) {
                        return {
                            content: [{
                                type: 'text',
                                text: `Request not found: ${requestId}. Try opening it first with copilotLogs.viewRequest command.`
                            }],
                            isError: true
                        };
                    }

                    return {
                        content: [{
                            type: 'text',
                            text: format === 'copilotmd' 
                                ? doc.raw || ''
                                : JSON.stringify({
                                    requestId: doc.requestId,
                                    model: doc.metadata?.model,
                                    systemMessageLength: doc.systemMessage?.length || 0,
                                    userMessages: doc.userMessages,
                                    assistantResponses: doc.assistantResponses,
                                    toolCalls: doc.toolCalls.map(t => ({
                                        name: t.name,
                                        argumentsLength: t.arguments?.length || 0,
                                        resultLength: t.result?.length || 0
                                    })),
                                    promptTokens: doc.metadata?.promptTokens,
                                    cachedTokens: doc.metadata?.cachedTokens
                                }, null, 2)
                        }]
                    };
                } catch (error) {
                    return {
                        content: [{
                            type: 'text',
                            text: `Error getting request: ${error}`
                        }],
                        isError: true
                    };
                }
            }
        );

        // =====================================================================
        // Tool: get_latest_request
        // =====================================================================
        this.server.tool(
            'get_latest_request',
            'Get the most recent Copilot request from the current session (system message, user messages, tool calls, responses)',
            {},
            async () => {
                try {
                    this.outputChannel.appendLine('[MCP] Getting latest request via ccreq:latest...');
                    
                    // Use the VS Code command which has Extension Host context
                    const cmdResult = await vscode.commands.executeCommand<{
                        success: boolean;
                        error?: string;
                        requestId?: string;
                        raw?: string;
                        metadata?: any;
                        systemMessage?: string;
                        systemMessageLength?: number;
                        userMessages?: string[];
                        assistantResponses?: string[];
                        toolCalls?: any[];
                    }>('copilotLogs.getLatestRequestContent');
                    
                    if (cmdResult?.success && cmdResult.requestId) {
                        this.outputChannel.appendLine(`[MCP] Latest request found: ${cmdResult.requestId}`);
                        return {
                            content: [{
                                type: 'text',
                                text: JSON.stringify({
                                    requestId: cmdResult.requestId,
                                    model: cmdResult.metadata?.model,
                                    systemMessageLength: cmdResult.systemMessageLength || 0,
                                    systemMessagePreview: cmdResult.systemMessage?.substring(0, 500) || '',
                                    userMessages: cmdResult.userMessages || [],
                                    assistantResponses: cmdResult.assistantResponses || [],
                                    toolCallsCount: cmdResult.toolCalls?.length || 0,
                                    toolCalls: cmdResult.toolCalls?.map((t: any) => ({
                                        name: t.name,
                                        argumentsLength: t.arguments?.length || 0
                                    })) || [],
                                    promptTokens: cmdResult.metadata?.promptTokens,
                                    cachedTokens: cmdResult.metadata?.cachedTokens
                                }, null, 2)
                            }]
                        };
                    }
                    
                    return {
                        content: [{
                            type: 'text',
                            text: 'No active request found. This tool only works for the current Copilot Chat session.'
                        }],
                        isError: true
                    };
                } catch (error) {
                    this.outputChannel.appendLine(`[MCP] Error getting latest request: ${error}`);
                    return {
                        content: [{
                            type: 'text',
                            text: `Error getting latest request: ${error}`
                        }],
                        isError: true
                    };
                }
            }
        );

        // =====================================================================
        // Tool: analyze_session
        // =====================================================================
        this.server.tool(
            'analyze_session',
            'Analyze a Copilot session for context bloat, patterns, and recommendations',
            {
                sessionId: z.string().optional().describe('Session to analyze (all if not specified)')
            },
            async ({ sessionId }) => {
                try {
                    const analysis = await this.logService.analyzeSession(sessionId);
                    return {
                        content: [{
                            type: 'text',
                            text: JSON.stringify({
                                sessionId: sessionId || 'all',
                                healthScore: analysis.healthScore,
                                status: analysis.status,
                                cacheHitRate: analysis.cacheHitRate,
                                avgPromptTokens: analysis.avgPromptTokens,
                                tokenTrend: analysis.tokenTrend,
                                issuesCount: analysis.issues.length,
                                issues: analysis.issues.map(i => ({
                                    type: i.type,
                                    severity: i.severity,
                                    message: i.message
                                })),
                                recommendations: analysis.recommendations
                            }, null, 2)
                        }]
                    };
                } catch (error) {
                    return {
                        content: [{
                            type: 'text',
                            text: `Error analyzing session: ${error}`
                        }],
                        isError: true
                    };
                }
            }
        );

        // =====================================================================
        // Tool: search_requests
        // =====================================================================
        this.server.tool(
            'search_requests',
            'Search for patterns in Copilot request content',
            {
                pattern: z.string().describe('Search pattern (text or regex)'),
                isRegex: z.boolean().optional().default(false).describe('Treat pattern as regex'),
                field: z.enum(['all', 'system', 'user', 'assistant', 'tools']).optional().default('all').describe('Field to search in'),
                model: z.string().optional().describe('Filter by model'),
                limit: z.number().optional().default(20).describe('Max results')
            },
            async ({ pattern, isRegex, field, model, limit }) => {
                try {
                    const query: CopilotLogSearchQuery = {
                        pattern,
                        isRegex,
                        field: field as CopilotLogSearchQuery['field'],
                        model,
                        limit
                    };
                    const results = await this.logService.searchRequests(query);
                    return {
                        content: [{
                            type: 'text',
                            text: JSON.stringify({
                                pattern,
                                matchCount: results.length,
                                results: results.map(r => ({
                                    requestId: r.requestId,
                                    matchLocation: r.matchLocation,
                                    snippet: r.snippet,
                                    timestamp: r.metadata?.timestamp?.toISOString()
                                }))
                            }, null, 2)
                        }]
                    };
                } catch (error) {
                    return {
                        content: [{
                            type: 'text',
                            text: `Error searching: ${error}`
                        }],
                        isError: true
                    };
                }
            }
        );

        // =====================================================================
        // Tool: export_conversation
        // =====================================================================
        this.server.tool(
            'export_conversation',
            'Export a complete conversation thread from a session',
            {
                sessionId: z.string().describe('Session ID to export')
            },
            async ({ sessionId }) => {
                try {
                    const exported = await this.logService.exportConversation(sessionId);
                    if (!exported) {
                        return {
                            content: [{
                                type: 'text',
                                text: `Session not found: ${sessionId}`
                            }],
                            isError: true
                        };
                    }

                    return {
                        content: [{
                            type: 'text',
                            text: JSON.stringify({
                                exportedAt: exported.exportedAt.toISOString(),
                                sessionId: exported.sessionId,
                                messageCount: exported.messages.length,
                                stats: exported.stats,
                                messages: exported.messages.map(m => ({
                                    role: m.role,
                                    contentPreview: m.content.substring(0, 200) + (m.content.length > 200 ? '...' : ''),
                                    timestamp: m.timestamp?.toISOString(),
                                    toolCall: m.toolCall ? { name: m.toolCall.name } : undefined
                                }))
                            }, null, 2)
                        }]
                    };
                } catch (error) {
                    return {
                        content: [{
                            type: 'text',
                            text: `Error exporting: ${error}`
                        }],
                        isError: true
                    };
                }
            }
        );

        // =====================================================================
        // Tool: get_usage_metrics
        // =====================================================================
        this.server.tool(
            'get_usage_metrics',
            'Get Copilot usage metrics for a time period',
            {
                hoursBack: z.number().optional().default(24).describe('Hours to look back')
            },
            async ({ hoursBack }) => {
                try {
                    const start = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
                    const end = new Date();
                    const metrics = await this.logService.getUsageMetrics(start, end);

                    // Convert Map to object for JSON serialization
                    const byModelObj: Record<string, any> = {};
                    metrics.byModel.forEach((value, key) => {
                        byModelObj[key] = value;
                    });

                    return {
                        content: [{
                            type: 'text',
                            text: JSON.stringify({
                                period: {
                                    start: metrics.period.start.toISOString(),
                                    end: metrics.period.end.toISOString()
                                },
                                totalRequests: metrics.totalRequests,
                                totalTokens: metrics.totalTokens,
                                totalCachedTokens: metrics.totalCachedTokens,
                                cacheHitRate: metrics.cacheHitRate,
                                avgResponseTime: metrics.avgResponseTime,
                                byModel: byModelObj,
                                hourlyDistribution: metrics.hourlyDistribution
                            }, null, 2)
                        }]
                    };
                } catch (error) {
                    return {
                        content: [{
                            type: 'text',
                            text: `Error getting metrics: ${error}`
                        }],
                        isError: true
                    };
                }
            }
        );

        // =====================================================================
        // Tool: get_diagnostics
        // =====================================================================
        this.server.tool(
            'get_diagnostics',
            'Get diagnostic information about the Copilot Logs service',
            {},
            async () => {
                try {
                    const diag = this.logService.getDiagnostics();
                    const isAvailable = await this.logService.isAvailable();
                    const cacheStats = getCacheStats();

                    return {
                        content: [{
                            type: 'text',
                            text: JSON.stringify({
                                status: isAvailable ? 'available' : 'limited',
                                logPath: diag.logPath,
                                lastScan: diag.lastScan?.toISOString() || 'never',
                                requestCount: diag.requestCount,
                                sessionCount: diag.sessionCount,
                                serverPort: this.config.port,
                                serverName: this.config.name,
                                cache: {
                                    size: cacheStats.size,
                                    maxSize: cacheStats.maxSize,
                                    cachedIds: cacheStats.ids
                                }
                            }, null, 2)
                        }]
                    };
                } catch (error) {
                    return {
                        content: [{
                            type: 'text',
                            text: `Error getting diagnostics: ${error}`
                        }],
                        isError: true
                    };
                }
            }
        );

        // =====================================================================
        // Tool: configure_cache
        // =====================================================================
        this.server.tool(
            'configure_cache',
            'Configure the request content cache size (default: 5, increase for more history)',
            {
                maxSize: z.number().min(1).max(100).describe('Maximum number of requests to cache (1-100)')
            },
            async ({ maxSize }) => {
                try {
                    const oldConfig = getCacheConfig();
                    setCacheConfig({ maxCacheSize: maxSize });
                    const newConfig = getCacheConfig();
                    const stats = getCacheStats();
                    
                    this.outputChannel.appendLine(`[MCP] Cache config updated: ${oldConfig.maxCacheSize} → ${newConfig.maxCacheSize}`);
                    
                    return {
                        content: [{
                            type: 'text',
                            text: JSON.stringify({
                                message: `Cache size updated from ${oldConfig.maxCacheSize} to ${newConfig.maxCacheSize}`,
                                previousMaxSize: oldConfig.maxCacheSize,
                                newMaxSize: newConfig.maxCacheSize,
                                currentCacheSize: stats.size,
                                cachedIds: stats.ids
                            }, null, 2)
                        }]
                    };
                } catch (error) {
                    return {
                        content: [{
                            type: 'text',
                            text: `Error configuring cache: ${error}`
                        }],
                        isError: true
                    };
                }
            }
        );
    }

    /**
     * Register MCP resources
     */
    private registerResources(): void {
        // Resource: Latest request content
        this.server.resource(
            'copilot://latest-request',
            'Latest Copilot Request',
            async () => {
                const doc = await this.logService.getLatestRequest();
                return {
                    contents: [{
                        uri: 'copilot://latest-request',
                        mimeType: 'application/json',
                        text: doc ? JSON.stringify({
                            requestId: doc.requestId,
                            model: doc.metadata?.model,
                            userMessages: doc.userMessages,
                            assistantResponses: doc.assistantResponses
                        }, null, 2) : '{"error": "No requests found"}'
                    }]
                };
            }
        );

        // Resource: Session list
        this.server.resource(
            'copilot://sessions',
            'Copilot Sessions Overview',
            async () => {
                const sessions = await this.logService.listSessions();
                return {
                    contents: [{
                        uri: 'copilot://sessions',
                        mimeType: 'application/json',
                        text: JSON.stringify({
                            count: sessions.length,
                            sessions: sessions.slice(0, 10).map(s => ({
                                id: s.sessionId,
                                requests: s.requestCount,
                                tokens: s.totalTokens
                            }))
                        }, null, 2)
                    }]
                };
            }
        );
    }

    /**
     * Get the output channel for logging
     */
    getOutputChannel(): vscode.OutputChannel {
        return this.outputChannel;
    }

    /**
     * Override shutdown to clean up VS Code resources
     */
    async shutdown(): Promise<void> {
        this.outputChannel.appendLine('🔌 Copilot Logs MCP Server shutting down...');
        await super.shutdown();
    }
}

// ============================================================================
// Singleton management
// ============================================================================

let serverInstance: CopilotLogsMCPServer | null = null;
let isServerRunning = false;

/**
 * Get or create the Copilot Logs MCP Server instance
 */
export function getCopilotLogsMCPServer(outputChannel?: vscode.OutputChannel): CopilotLogsMCPServer {
    if (!serverInstance) {
        serverInstance = new CopilotLogsMCPServer(outputChannel);
    }
    return serverInstance;
}

/**
 * Start the MCP server
 */
export async function startCopilotLogsMCPServer(
    context: vscode.ExtensionContext,
    outputChannel?: vscode.OutputChannel
): Promise<CopilotLogsMCPServer> {
    if (isServerRunning && serverInstance) {
        return serverInstance;
    }

    const server = getCopilotLogsMCPServer(outputChannel);
    
    try {
        await server.start();
        isServerRunning = true;
        
        // Register shutdown on extension deactivation
        context.subscriptions.push({
            dispose: async () => {
                await stopCopilotLogsMCPServer();
            }
        });

        server.getOutputChannel().appendLine(`✅ MCP Server started on port ${COPILOT_LOGS_SERVER_CONFIG.port}`);
        
        return server;
    } catch (error) {
        server.getOutputChannel().appendLine(`❌ Failed to start MCP server: ${error}`);
        throw error;
    }
}

/**
 * Stop the MCP server
 */
export async function stopCopilotLogsMCPServer(): Promise<void> {
    if (serverInstance && isServerRunning) {
        await serverInstance.shutdown();
        isServerRunning = false;
    }
}

/**
 * Check if server is running
 */
export function isCopilotLogsMCPServerRunning(): boolean {
    return isServerRunning;
}

/**
 * Get server URL
 */
export function getCopilotLogsMCPServerUrl(): string {
    return `http://localhost:${COPILOT_LOGS_SERVER_CONFIG.port}`;
}
