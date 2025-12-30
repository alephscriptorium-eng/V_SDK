/**
 * WISH-01/02/03: Copilot Log Exporter Module
 * Main entry point for the copilotLogs module
 */

// Types
export * from './types';

// Core services
export { DiskLogScanner } from './DiskLogScanner';
export { 
    CcreqDocumentResolver, 
    CCREQ_SCHEME, 
    CcreqDocumentContent,
    getCachedRequestContent,
    getCachedRequestIds,
    cacheRequestContent,
    getCacheStats,
    clearCache,
    setCacheConfig,
    getCacheConfig,
    CacheConfig
} from './CcreqDocumentResolver';
export { ContextBloatAnalyzer } from './ContextBloatAnalyzer';
export { 
    CopilotLogExporterService, 
    getCopilotLogExporterService 
} from './CopilotLogExporterService';

// WISH-02: Auto-Debug
export { 
    AgentAutoDebugService, 
    getAgentAutoDebugService,
    AgentDebugReport,
    AgentDebugIssue,
    ToolUsageAnalysis
} from './AgentAutoDebugService';

// WISH-03: Metrics Panel
export { CopilotMetricsPanelProvider } from './CopilotMetricsPanelProvider';

// MCP Server
export { 
    CopilotLogsMCPServer,
    getCopilotLogsMCPServer,
    startCopilotLogsMCPServer,
    stopCopilotLogsMCPServer,
    isCopilotLogsMCPServerRunning,
    getCopilotLogsMCPServerUrl
} from './CopilotLogsMCPServer';
