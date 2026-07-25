/**
 * WISH-01: Copilot Log Exporter MCP
 * Main service that orchestrates all Copilot log functionality
 */

import * as vscode from 'vscode';
import { DiskLogScanner } from './DiskLogScanner';
import { CcreqDocumentResolver, CcreqDocumentContent } from './CcreqDocumentResolver';
import { ContextBloatAnalyzer } from './ContextBloatAnalyzer';
import {
    CopilotRequestIndex,
    CopilotSession,
    ContextBloatAnalysis,
    CopilotLogSearchQuery,
    CopilotLogSearchResult,
    ExportedConversation,
    CopilotUsageMetrics
} from './types';

/**
 * Main service for Copilot Log Exporter functionality
 * Implements all MCP tools defined in WISH-01
 */
export class CopilotLogExporterService {
    private diskScanner: DiskLogScanner;
    private documentResolver: CcreqDocumentResolver;
    private contextAnalyzer: ContextBloatAnalyzer;
    private sessions: Map<string, CopilotSession> = new Map();

    constructor() {
        this.diskScanner = new DiskLogScanner();
        this.documentResolver = new CcreqDocumentResolver();
        this.contextAnalyzer = new ContextBloatAnalyzer();
    }

    /**
     * Initialize the service and scan for existing logs
     */
    async initialize(): Promise<void> {
        await this.refresh();
    }

    /**
     * Refresh log data from disk
     */
    async refresh(): Promise<void> {
        await this.diskScanner.scanLogFile();
        this.buildSessions();
    }

    // =========================================================================
    // MCP Tool: list_copilot_sessions
    // =========================================================================

    /**
     * List all available Copilot sessions
     */
    async listSessions(): Promise<CopilotSession[]> {
        await this.refresh();
        return Array.from(this.sessions.values())
            .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
    }

    // =========================================================================
    // MCP Tool: list_copilot_requests
    // =========================================================================

    /**
     * List requests, optionally filtered by session
     */
    async listRequests(sessionId?: string): Promise<CopilotRequestIndex[]> {
        await this.refresh();

        if (sessionId) {
            const session = this.sessions.get(sessionId);
            if (!session) {
                return [];
            }
            return session.requestIds
                .map(id => this.diskScanner.getRequestMetadata(id))
                .filter((r): r is CopilotRequestIndex => r !== undefined);
        }

        return Array.from(this.diskScanner.getKnownRequestIds())
            .map(id => this.diskScanner.getRequestMetadata(id))
            .filter((r): r is CopilotRequestIndex => r !== undefined)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    // =========================================================================
    // MCP Tool: get_copilot_request
    // =========================================================================

    /**
     * Get the full content of a specific request
     */
    async getRequest(
        requestId: string,
        format: 'copilotmd' | 'json' = 'copilotmd'
    ): Promise<CcreqDocumentContent | null> {
        return this.documentResolver.resolveDocument(requestId, format);
    }

    /**
     * Get the latest request content
     */
    async getLatestRequest(): Promise<CcreqDocumentContent | null> {
        return this.documentResolver.resolveLatest();
    }

    // =========================================================================
    // MCP Tool: analyze_session
    // =========================================================================

    /**
     * Analyze a session for context bloat and best practices
     */
    async analyzeSession(sessionId?: string): Promise<ContextBloatAnalysis> {
        const requests = await this.listRequests(sessionId);
        
        // Optionally load document content for deeper analysis
        const documents: CcreqDocumentContent[] = [];
        
        // Only load documents for smaller sessions to avoid performance issues
        if (requests.length <= 10) {
            for (const req of requests) {
                const doc = await this.getRequest(req.id);
                if (doc) {
                    documents.push(doc);
                }
            }
        }

        return this.contextAnalyzer.analyzeSession(requests, documents);
    }

    // =========================================================================
    // MCP Tool: search_requests
    // =========================================================================

    /**
     * Search for patterns in Copilot request content
     */
    async searchRequests(query: CopilotLogSearchQuery): Promise<CopilotLogSearchResult[]> {
        const results: CopilotLogSearchResult[] = [];
        const requests = await this.listRequests();

        // Apply filters
        let filteredRequests = requests;

        if (query.model) {
            filteredRequests = filteredRequests.filter(r => r.model === query.model);
        }

        if (query.dateRange) {
            filteredRequests = filteredRequests.filter(
                r => r.timestamp >= query.dateRange!.start && r.timestamp <= query.dateRange!.end
            );
        }

        if (query.minTokens) {
            filteredRequests = filteredRequests.filter(
                r => r.promptTokens && r.promptTokens >= query.minTokens!
            );
        }

        // Limit processing
        const limit = query.limit || 20;
        filteredRequests = filteredRequests.slice(0, limit * 2);

        // Search in document content
        if (query.pattern) {
            const regex = query.isRegex 
                ? new RegExp(query.pattern, 'gi')
                : new RegExp(this.escapeRegex(query.pattern), 'gi');

            for (const req of filteredRequests) {
                if (results.length >= limit) break;

                const doc = await this.getRequest(req.id);
                if (!doc) continue;

                const searchResults = this.searchInDocument(doc, regex, query.field);
                for (const sr of searchResults) {
                    if (results.length >= limit) break;
                    results.push({
                        ...sr,
                        metadata: req
                    });
                }
            }
        }

        return results;
    }

    // =========================================================================
    // MCP Tool: export_conversation
    // =========================================================================

    /**
     * Export a complete conversation thread
     */
    async exportConversation(sessionId: string): Promise<ExportedConversation | null> {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return null;
        }

        const messages: ExportedConversation['messages'] = [];
        let totalTokens = 0;
        let totalDuration = 0;
        const models = new Set<string>();

        for (const requestId of session.requestIds) {
            const metadata = this.diskScanner.getRequestMetadata(requestId);
            const doc = await this.getRequest(requestId);

            if (!metadata) continue;

            if (metadata.model) models.add(metadata.model);
            if (metadata.promptTokens) totalTokens += metadata.promptTokens;
            if (metadata.durationMs) totalDuration += metadata.durationMs;

            if (doc) {
                // Add system message (only from first request)
                if (messages.length === 0 && doc.systemMessage) {
                    messages.push({
                        requestId,
                        role: 'system',
                        content: doc.systemMessage,
                        timestamp: metadata.timestamp
                    });
                }

                // Add user messages
                for (const userMsg of doc.userMessages) {
                    messages.push({
                        requestId,
                        role: 'user',
                        content: userMsg,
                        timestamp: metadata.timestamp
                    });
                }

                // Add tool calls
                for (const tool of doc.toolCalls) {
                    messages.push({
                        requestId,
                        role: 'tool',
                        content: tool.result || '',
                        timestamp: metadata.timestamp,
                        toolCall: {
                            name: tool.name,
                            arguments: tool.arguments || '',
                            result: tool.result
                        }
                    });
                }

                // Add assistant responses
                for (const assistantMsg of doc.assistantResponses) {
                    messages.push({
                        requestId,
                        role: 'assistant',
                        content: assistantMsg,
                        timestamp: metadata.timestamp
                    });
                }
            }
        }

        return {
            exportedAt: new Date(),
            sessionId,
            messages,
            stats: {
                totalRequests: session.requestCount,
                totalTokens,
                totalDurationMs: totalDuration,
                models: Array.from(models)
            }
        };
    }

    // =========================================================================
    // WISH-03: Usage Metrics
    // =========================================================================

    /**
     * Get usage metrics for a time period
     */
    async getUsageMetrics(
        start: Date = new Date(Date.now() - 24 * 60 * 60 * 1000),
        end: Date = new Date()
    ): Promise<CopilotUsageMetrics> {
        const requests = this.diskScanner.getRequestsInRange(start, end);

        const byModel = new Map<string, { requests: number; tokens: number; avgDuration: number }>();
        const hourlyDistribution = new Array(24).fill(0);

        let totalTokens = 0;
        let totalCached = 0;
        let totalDuration = 0;

        for (const req of requests) {
            // Aggregate tokens
            if (req.promptTokens) {
                totalTokens += req.promptTokens;
            }
            if (req.cachedTokens) {
                totalCached += req.cachedTokens;
            }
            if (req.durationMs) {
                totalDuration += req.durationMs;
            }

            // By model
            if (req.model) {
                const existing = byModel.get(req.model) || { requests: 0, tokens: 0, avgDuration: 0 };
                existing.requests++;
                existing.tokens += req.promptTokens || 0;
                existing.avgDuration = 
                    (existing.avgDuration * (existing.requests - 1) + (req.durationMs || 0)) / existing.requests;
                byModel.set(req.model, existing);
            }

            // Hourly distribution
            const hour = req.timestamp.getHours();
            hourlyDistribution[hour]++;
        }

        return {
            period: { start, end },
            totalRequests: requests.length,
            totalTokens,
            totalCachedTokens: totalCached,
            cacheHitRate: totalTokens > 0 ? totalCached / totalTokens : 0,
            avgResponseTime: requests.length > 0 ? totalDuration / requests.length : 0,
            byModel,
            hourlyDistribution
        };
    }

    // =========================================================================
    // Helper Methods
    // =========================================================================

    /**
     * Build session groupings from requests
     */
    private buildSessions(): void {
        this.sessions.clear();

        const requests = Array.from(this.diskScanner.getKnownRequestIds())
            .map(id => this.diskScanner.getRequestMetadata(id))
            .filter((r): r is CopilotRequestIndex => r !== undefined)
            .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

        if (requests.length === 0) return;

        // Group requests into sessions (30 minute gap = new session)
        const SESSION_GAP_MS = 30 * 60 * 1000;
        let currentSession: CopilotSession | null = null;

        for (const req of requests) {
            if (!currentSession || 
                req.timestamp.getTime() - currentSession.endTime.getTime() > SESSION_GAP_MS) {
                // Start new session
                const sessionId = `session-${req.timestamp.getTime()}`;
                currentSession = {
                    sessionId,
                    startTime: req.timestamp,
                    endTime: req.timestamp,
                    requestCount: 0,
                    requestIds: [],
                    totalTokens: 0,
                    totalCachedTokens: 0
                };
                this.sessions.set(sessionId, currentSession);
            }

            // Add request to current session
            currentSession.requestIds.push(req.id);
            currentSession.requestCount++;
            currentSession.endTime = req.timestamp;
            currentSession.totalTokens += req.promptTokens || 0;
            currentSession.totalCachedTokens += req.cachedTokens || 0;
        }
    }

    /**
     * Search within a document
     */
    private searchInDocument(
        doc: CcreqDocumentContent,
        regex: RegExp,
        field?: 'all' | 'system' | 'user' | 'assistant' | 'tools'
    ): Omit<CopilotLogSearchResult, 'metadata'>[] {
        const results: Omit<CopilotLogSearchResult, 'metadata'>[] = [];

        const searchIn = (content: string, location: CopilotLogSearchResult['matchLocation']) => {
            const matches = content.matchAll(regex);
            for (const match of matches) {
                const start = Math.max(0, match.index! - 50);
                const end = Math.min(content.length, match.index! + match[0].length + 50);
                results.push({
                    requestId: doc.requestId,
                    snippet: '...' + content.slice(start, end) + '...',
                    matchLocation: location
                });
            }
        };

        if (!field || field === 'all' || field === 'system') {
            if (doc.systemMessage) searchIn(doc.systemMessage, 'system');
        }
        if (!field || field === 'all' || field === 'user') {
            for (const msg of doc.userMessages) searchIn(msg, 'user');
        }
        if (!field || field === 'all' || field === 'assistant') {
            for (const msg of doc.assistantResponses) searchIn(msg, 'assistant');
        }
        if (!field || field === 'all' || field === 'tools') {
            for (const tool of doc.toolCalls) {
                if (tool.arguments) searchIn(tool.arguments, 'tools');
                if (tool.result) searchIn(tool.result, 'tools');
            }
        }

        return results;
    }

    /**
     * Escape regex special characters
     */
    private escapeRegex(str: string): string {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Check if the service is available
     */
    async isAvailable(): Promise<boolean> {
        return this.documentResolver.isSchemeAvailable();
    }

    /**
     * Get diagnostic info
     */
    getDiagnostics(): {
        logPath: string;
        lastScan: Date | null;
        requestCount: number;
        sessionCount: number;
    } {
        return {
            logPath: this.diskScanner.getLogBasePath(),
            lastScan: this.diskScanner.getLastScanTime(),
            requestCount: this.diskScanner.getKnownRequestIds().length,
            sessionCount: this.sessions.size
        };
    }
}

// Singleton instance
let serviceInstance: CopilotLogExporterService | null = null;

/**
 * Get the singleton service instance
 */
export function getCopilotLogExporterService(): CopilotLogExporterService {
    if (!serviceInstance) {
        serviceInstance = new CopilotLogExporterService();
    }
    return serviceInstance;
}
