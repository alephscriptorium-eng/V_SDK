/**
 * WISH-02: Auto-Debug de Agentes
 * Service for agent self-debugging using Copilot logs
 */

import * as vscode from 'vscode';
import { getCopilotLogExporterService } from './CopilotLogExporterService';
import { ContextBloatAnalysis } from './types';

/**
 * Auto-debug report for agent self-analysis
 */
export interface AgentDebugReport {
    /** When the debug was run */
    timestamp: Date;
    /** Request ID being analyzed */
    requestId: string;
    /** Summary of the analysis */
    summary: string;
    /** Context bloat analysis */
    contextAnalysis: ContextBloatAnalysis;
    /** Detected issues in the request */
    issues: AgentDebugIssue[];
    /** Tool usage analysis */
    toolUsage: ToolUsageAnalysis;
    /** Suggestions for improvement */
    suggestions: string[];
}

/**
 * Specific debug issue
 */
export interface AgentDebugIssue {
    category: 'context' | 'tools' | 'instructions' | 'response';
    severity: 'info' | 'warning' | 'error';
    title: string;
    description: string;
    location?: string;
}

/**
 * Tool usage analysis
 */
export interface ToolUsageAnalysis {
    /** Total tools called */
    totalCalls: number;
    /** Successful tool calls */
    successfulCalls: number;
    /** Failed tool calls */
    failedCalls: number;
    /** Tools used */
    toolsUsed: string[];
    /** Average calls per request */
    avgCallsPerRequest: number;
    /** Most used tool */
    mostUsedTool?: string;
}

/**
 * Service for agent self-debugging
 */
export class AgentAutoDebugService {
    private logService = getCopilotLogExporterService();

    /**
     * Debug the most recent request
     */
    async debugLatestRequest(): Promise<AgentDebugReport | null> {
        const latest = await this.logService.getLatestRequest();
        if (!latest) {
            return null;
        }
        return this.debugRequest(latest.requestId);
    }

    /**
     * Debug a specific request
     */
    async debugRequest(requestId: string): Promise<AgentDebugReport | null> {
        const doc = await this.logService.getRequest(requestId);
        if (!doc) {
            return null;
        }

        const issues: AgentDebugIssue[] = [];
        const suggestions: string[] = [];

        // Analyze context
        const contextAnalysis = await this.logService.analyzeSession();

        // Check for context issues
        if (contextAnalysis.status === 'critical' || contextAnalysis.status === 'warning') {
            issues.push({
                category: 'context',
                severity: contextAnalysis.status === 'critical' ? 'error' : 'warning',
                title: 'Context Bloat Detected',
                description: `Health score: ${contextAnalysis.healthScore}/100. ${contextAnalysis.issues.length} issues found.`
            });
        }

        // Analyze tool usage
        const toolUsage = this.analyzeToolUsage(doc.toolCalls);

        if (toolUsage.failedCalls > 0) {
            issues.push({
                category: 'tools',
                severity: 'warning',
                title: 'Tool Call Failures',
                description: `${toolUsage.failedCalls} tool call(s) may have failed or returned errors.`
            });
        }

        if (toolUsage.totalCalls > 20) {
            issues.push({
                category: 'tools',
                severity: 'info',
                title: 'High Tool Usage',
                description: `${toolUsage.totalCalls} tool calls in this request. Consider batching operations.`
            });
            suggestions.push('Consider using multi_replace_string_in_file for batch edits');
        }

        // Check for instruction issues
        if (doc.systemMessage) {
            const instructionIssues = this.analyzeInstructions(doc.systemMessage);
            issues.push(...instructionIssues);
        }

        // Check response quality
        const responseIssues = this.analyzeResponses(doc.assistantResponses);
        issues.push(...responseIssues);

        // Generate summary
        const summary = this.generateSummary(issues, contextAnalysis, toolUsage);

        // Add context-based suggestions
        suggestions.push(...contextAnalysis.recommendations);

        return {
            timestamp: new Date(),
            requestId,
            summary,
            contextAnalysis,
            issues,
            toolUsage,
            suggestions
        };
    }

    /**
     * Analyze tool usage patterns
     */
    private analyzeToolUsage(toolCalls: Array<{ name: string; arguments?: string; result?: string }>): ToolUsageAnalysis {
        const toolCounts = new Map<string, number>();
        let failedCalls = 0;

        for (const call of toolCalls) {
            toolCounts.set(call.name, (toolCounts.get(call.name) || 0) + 1);
            
            // Heuristic for failed calls
            if (call.result && (
                call.result.includes('error') ||
                call.result.includes('failed') ||
                call.result.includes('not found')
            )) {
                failedCalls++;
            }
        }

        const toolsUsed = Array.from(toolCounts.keys());
        let mostUsedTool: string | undefined;
        let maxCount = 0;

        for (const [tool, count] of toolCounts) {
            if (count > maxCount) {
                maxCount = count;
                mostUsedTool = tool;
            }
        }

        return {
            totalCalls: toolCalls.length,
            successfulCalls: toolCalls.length - failedCalls,
            failedCalls,
            toolsUsed,
            avgCallsPerRequest: toolCalls.length,
            mostUsedTool
        };
    }

    /**
     * Analyze system instructions for issues
     */
    private analyzeInstructions(systemMessage: string): AgentDebugIssue[] {
        const issues: AgentDebugIssue[] = [];

        // Check for very long system message
        if (systemMessage.length > 50000) {
            issues.push({
                category: 'instructions',
                severity: 'warning',
                title: 'Very Long System Message',
                description: `System message is ${systemMessage.length} characters. This may impact performance.`
            });
        }

        // Check for duplicate instructions
        const lines = systemMessage.split('\n');
        const seen = new Set<string>();
        let duplicates = 0;

        for (const line of lines) {
            const normalized = line.trim().toLowerCase();
            if (normalized.length > 20 && seen.has(normalized)) {
                duplicates++;
            }
            seen.add(normalized);
        }

        if (duplicates > 5) {
            issues.push({
                category: 'instructions',
                severity: 'info',
                title: 'Duplicate Instructions Detected',
                description: `Found ${duplicates} potentially duplicate instruction lines.`
            });
        }

        return issues;
    }

    /**
     * Analyze response quality
     */
    private analyzeResponses(responses: string[]): AgentDebugIssue[] {
        const issues: AgentDebugIssue[] = [];

        for (const response of responses) {
            // Check for error patterns in responses
            if (response.includes('I cannot') || response.includes("I'm unable to")) {
                issues.push({
                    category: 'response',
                    severity: 'info',
                    title: 'Refusal Pattern Detected',
                    description: 'Response contains refusal language - may need adjusted instructions.'
                });
            }

            // Check for repeated content
            if (response.length > 5000) {
                const chunks = response.match(/.{500}/g) || [];
                const chunkSet = new Set(chunks);
                if (chunks.length > chunkSet.size * 1.5) {
                    issues.push({
                        category: 'response',
                        severity: 'info',
                        title: 'Repetitive Response',
                        description: 'Response may contain repetitive content.'
                    });
                }
            }
        }

        return issues;
    }

    /**
     * Generate a human-readable summary
     */
    private generateSummary(
        issues: AgentDebugIssue[],
        contextAnalysis: ContextBloatAnalysis,
        toolUsage: ToolUsageAnalysis
    ): string {
        const errorCount = issues.filter(i => i.severity === 'error').length;
        const warningCount = issues.filter(i => i.severity === 'warning').length;

        let summary = `## Auto-Debug Summary\n\n`;
        summary += `- **Context Health**: ${contextAnalysis.status} (${contextAnalysis.healthScore}/100)\n`;
        summary += `- **Cache Hit Rate**: ${(contextAnalysis.cacheHitRate * 100).toFixed(1)}%\n`;
        summary += `- **Tool Calls**: ${toolUsage.totalCalls} (${toolUsage.failedCalls} potential failures)\n`;
        summary += `- **Issues Found**: ${errorCount} errors, ${warningCount} warnings\n`;

        if (errorCount > 0) {
            summary += `\n⚠️ **Critical issues detected** - review required.\n`;
        } else if (warningCount > 0) {
            summary += `\n⚡ **Minor issues detected** - consider optimization.\n`;
        } else {
            summary += `\n✅ **No significant issues detected.**\n`;
        }

        return summary;
    }
}

// Singleton
let debugServiceInstance: AgentAutoDebugService | null = null;

export function getAgentAutoDebugService(): AgentAutoDebugService {
    if (!debugServiceInstance) {
        debugServiceInstance = new AgentAutoDebugService();
    }
    return debugServiceInstance;
}
