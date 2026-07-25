/**
 * WISH-01: Copilot Log Exporter MCP
 * Types and interfaces for Copilot log analysis
 */

/**
 * Represents a parsed Copilot request from disk logs
 */
export interface CopilotRequestIndex {
    /** Unique request ID (e.g., "715caa19") */
    id: string;
    /** Timestamp when request started */
    timestamp: Date;
    /** LLM model used (e.g., "claude-3.5-sonnet") */
    model: string;
    /** Duration in milliseconds */
    durationMs: number;
    /** Total prompt tokens */
    promptTokens?: number;
    /** Cached tokens (for context caching) */
    cachedTokens?: number;
    /** Completion tokens */
    completionTokens?: number;
    /** Session ID if available */
    sessionId?: string;
}

/**
 * Represents a Copilot chat session (group of related requests)
 */
export interface CopilotSession {
    /** Session identifier */
    sessionId: string;
    /** When session started */
    startTime: Date;
    /** When session ended (last request) */
    endTime: Date;
    /** Number of requests in session */
    requestCount: number;
    /** List of request IDs in this session */
    requestIds: string[];
    /** Total tokens used in session */
    totalTokens: number;
    /** Total cached tokens */
    totalCachedTokens: number;
}

/**
 * Context Bloat analysis result
 */
export interface ContextBloatAnalysis {
    /** Overall health score (0-100) */
    healthScore: number;
    /** Status classification */
    status: 'optimal' | 'acceptable' | 'warning' | 'critical';
    /** Average cache hit rate */
    cacheHitRate: number;
    /** Average prompt tokens per request */
    avgPromptTokens: number;
    /** Trend: increasing, stable, decreasing */
    tokenTrend: 'increasing' | 'stable' | 'decreasing';
    /** Specific issues detected */
    issues: ContextBloatIssue[];
    /** Recommendations for improvement */
    recommendations: string[];
}

/**
 * Specific context bloat issue
 */
export interface ContextBloatIssue {
    /** Issue type */
    type: 'high_tokens' | 'low_cache' | 'growing_context' | 'long_duration' | 'repeated_content';
    /** Severity level */
    severity: 'info' | 'warning' | 'error';
    /** Human-readable description */
    message: string;
    /** Affected request IDs */
    affectedRequests: string[];
}

/**
 * Search query for forensic analysis
 */
export interface CopilotLogSearchQuery {
    /** Text pattern to search */
    pattern?: string;
    /** Use regex matching */
    isRegex?: boolean;
    /** Field to search in */
    field?: 'all' | 'system' | 'user' | 'assistant' | 'tools';
    /** Filter by model */
    model?: string;
    /** Filter by date range */
    dateRange?: {
        start: Date;
        end: Date;
    };
    /** Minimum token count */
    minTokens?: number;
    /** Maximum results */
    limit?: number;
}

/**
 * Search result item
 */
export interface CopilotLogSearchResult {
    /** Request ID */
    requestId: string;
    /** Matched content snippet */
    snippet: string;
    /** Where the match was found */
    matchLocation: 'system' | 'user' | 'assistant' | 'tools';
    /** Line number in original content */
    lineNumber?: number;
    /** Request metadata */
    metadata: CopilotRequestIndex;
}

/**
 * Exported conversation format
 */
export interface ExportedConversation {
    /** Export timestamp */
    exportedAt: Date;
    /** Session ID */
    sessionId: string;
    /** All messages in order */
    messages: ConversationMessage[];
    /** Aggregate statistics */
    stats: {
        totalRequests: number;
        totalTokens: number;
        totalDurationMs: number;
        models: string[];
    };
}

/**
 * Single message in exported conversation
 */
export interface ConversationMessage {
    /** Request ID this message belongs to */
    requestId: string;
    /** Message role */
    role: 'system' | 'user' | 'assistant' | 'tool';
    /** Message content */
    content: string;
    /** Timestamp */
    timestamp: Date;
    /** Tool call info if applicable */
    toolCall?: {
        name: string;
        arguments: string;
        result?: string;
    };
}

/**
 * Metrics for WISH-03 panel display
 */
export interface CopilotUsageMetrics {
    /** Time period for metrics */
    period: {
        start: Date;
        end: Date;
    };
    /** Total requests in period */
    totalRequests: number;
    /** Total tokens consumed */
    totalTokens: number;
    /** Total cached tokens */
    totalCachedTokens: number;
    /** Cache hit rate percentage */
    cacheHitRate: number;
    /** Average response time ms */
    avgResponseTime: number;
    /** Breakdown by model */
    byModel: Map<string, {
        requests: number;
        tokens: number;
        avgDuration: number;
    }>;
    /** Hourly distribution */
    hourlyDistribution: number[];
}
