/**
 * WISH-01/02/03: Copilot Log Exporter Module
 * SCRIPT-2.2.0: Added Model Config Service
 * Main entry point for the copilotLogs module
 * 
 * Refactorizado: Tipos modulares en types/
 */

// Types
export * from './types';
export * from './types/snapshot.types';
export * from './types/model.types';

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

// SCRIPT-2.2.0: Model Config Service
export {
    ModelConfigService,
    getModelConfigService,
    resetModelConfigService
} from './ModelConfigService';

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

// Templates
export { 
    generateMetricsPanelHtml,
    generateErrorHtml,
    MetricsPanelData,
    PanelDiagnostics
} from './templates/MetricsPanelTemplate';

// MCP Server
export { 
    CopilotLogsMCPServer,
    getCopilotLogsMCPServer,
    startCopilotLogsMCPServer,
    stopCopilotLogsMCPServer,
    isCopilotLogsMCPServerRunning,
    getCopilotLogsMCPServerUrl
} from './CopilotLogsMCPServer';

// FEATURE-SNAPSHOTS-1.0.0: Snapshot Manager
export {
    SnapshotManager,
    getSnapshotManager
} from './SnapshotManager';
