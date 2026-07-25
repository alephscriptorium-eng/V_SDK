/**
 * WISH-01: Copilot Log Exporter MCP
 * Context Bloat Analyzer - Analyzes sessions for context bloat issues
 */

import {
    CopilotRequestIndex,
    CopilotSession,
    ContextBloatAnalysis,
    ContextBloatIssue
} from './types';
import { CcreqDocumentContent } from './CcreqDocumentResolver';

/**
 * Thresholds for context bloat detection
 */
const THRESHOLDS = {
    /** Maximum healthy prompt tokens */
    HIGH_TOKENS: 50000,
    /** Critical token count */
    CRITICAL_TOKENS: 100000,
    /** Minimum acceptable cache hit rate */
    LOW_CACHE_RATE: 0.5,
    /** Maximum healthy response time (ms) */
    LONG_DURATION: 30000,
    /** Token growth rate per request that indicates bloat */
    TOKEN_GROWTH_THRESHOLD: 0.2
};

/**
 * Analyzes Copilot sessions for context bloat and usage patterns
 */
export class ContextBloatAnalyzer {

    /**
     * Analyze a session for context bloat
     */
    analyzeSession(
        requests: CopilotRequestIndex[],
        documents?: CcreqDocumentContent[]
    ): ContextBloatAnalysis {
        if (requests.length === 0) {
            return this.createEmptyAnalysis();
        }

        const issues: ContextBloatIssue[] = [];
        
        // Calculate metrics
        const tokensArray = requests
            .filter(r => r.promptTokens !== undefined)
            .map(r => r.promptTokens!);
        
        const cachedArray = requests
            .filter(r => r.cachedTokens !== undefined)
            .map(r => r.cachedTokens!);

        const avgPromptTokens = tokensArray.length > 0
            ? tokensArray.reduce((a, b) => a + b, 0) / tokensArray.length
            : 0;

        const totalTokens = tokensArray.reduce((a, b) => a + b, 0);
        const totalCached = cachedArray.reduce((a, b) => a + b, 0);
        const cacheHitRate = totalTokens > 0 ? totalCached / totalTokens : 0;

        // Detect token trend
        const tokenTrend = this.detectTokenTrend(tokensArray);

        // Check for high token issues
        const highTokenRequests = requests.filter(
            r => r.promptTokens && r.promptTokens > THRESHOLDS.HIGH_TOKENS
        );
        if (highTokenRequests.length > 0) {
            issues.push({
                type: 'high_tokens',
                severity: highTokenRequests.some(r => r.promptTokens! > THRESHOLDS.CRITICAL_TOKENS) 
                    ? 'error' : 'warning',
                message: `${highTokenRequests.length} request(s) have high token count (>${THRESHOLDS.HIGH_TOKENS})`,
                affectedRequests: highTokenRequests.map(r => r.id)
            });
        }

        // Check for low cache hit rate
        if (cacheHitRate < THRESHOLDS.LOW_CACHE_RATE && requests.length > 3) {
            issues.push({
                type: 'low_cache',
                severity: cacheHitRate < 0.2 ? 'error' : 'warning',
                message: `Low cache hit rate: ${(cacheHitRate * 100).toFixed(1)}% (expected >${THRESHOLDS.LOW_CACHE_RATE * 100}%)`,
                affectedRequests: requests.map(r => r.id)
            });
        }

        // Check for growing context
        if (tokenTrend === 'increasing' && avgPromptTokens > THRESHOLDS.HIGH_TOKENS / 2) {
            issues.push({
                type: 'growing_context',
                severity: 'warning',
                message: 'Context size is consistently growing - consider summarizing or starting new session',
                affectedRequests: requests.slice(-3).map(r => r.id)
            });
        }

        // Check for long duration requests
        const slowRequests = requests.filter(
            r => r.durationMs && r.durationMs > THRESHOLDS.LONG_DURATION
        );
        if (slowRequests.length > 0) {
            issues.push({
                type: 'long_duration',
                severity: 'info',
                message: `${slowRequests.length} request(s) took longer than ${THRESHOLDS.LONG_DURATION / 1000}s`,
                affectedRequests: slowRequests.map(r => r.id)
            });
        }

        // Check for repeated content (if documents available)
        if (documents && documents.length > 1) {
            const repeatedContentIssue = this.detectRepeatedContent(documents);
            if (repeatedContentIssue) {
                issues.push(repeatedContentIssue);
            }
        }

        // Calculate health score
        const healthScore = this.calculateHealthScore(
            avgPromptTokens,
            cacheHitRate,
            tokenTrend,
            issues
        );

        // Generate recommendations
        const recommendations = this.generateRecommendations(issues, {
            avgPromptTokens,
            cacheHitRate,
            tokenTrend
        });

        return {
            healthScore,
            status: this.scoreToStatus(healthScore),
            cacheHitRate,
            avgPromptTokens,
            tokenTrend,
            issues,
            recommendations
        };
    }

    /**
     * Detect token usage trend
     */
    private detectTokenTrend(tokens: number[]): 'increasing' | 'stable' | 'decreasing' {
        if (tokens.length < 3) return 'stable';

        const firstHalf = tokens.slice(0, Math.floor(tokens.length / 2));
        const secondHalf = tokens.slice(Math.floor(tokens.length / 2));

        const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

        const growthRate = (avgSecond - avgFirst) / avgFirst;

        if (growthRate > THRESHOLDS.TOKEN_GROWTH_THRESHOLD) return 'increasing';
        if (growthRate < -THRESHOLDS.TOKEN_GROWTH_THRESHOLD) return 'decreasing';
        return 'stable';
    }

    /**
     * Detect repeated content across requests
     */
    private detectRepeatedContent(documents: CcreqDocumentContent[]): ContextBloatIssue | null {
        // Simple heuristic: check if user messages repeat significantly
        const userMessages = documents.flatMap(d => d.userMessages);
        const messageCounts = new Map<string, number>();
        
        for (const msg of userMessages) {
            // Normalize message (first 100 chars)
            const normalized = msg.slice(0, 100).toLowerCase().trim();
            messageCounts.set(normalized, (messageCounts.get(normalized) || 0) + 1);
        }

        const repeatedMessages = Array.from(messageCounts.entries())
            .filter(([_, count]) => count > 2);

        if (repeatedMessages.length > 0) {
            return {
                type: 'repeated_content',
                severity: 'info',
                message: `Detected ${repeatedMessages.length} repeated message patterns - consider using references instead`,
                affectedRequests: documents.map(d => d.requestId)
            };
        }

        return null;
    }

    /**
     * Calculate overall health score (0-100)
     */
    private calculateHealthScore(
        avgTokens: number,
        cacheRate: number,
        trend: 'increasing' | 'stable' | 'decreasing',
        issues: ContextBloatIssue[]
    ): number {
        let score = 100;

        // Deduct for high token usage
        if (avgTokens > THRESHOLDS.CRITICAL_TOKENS) {
            score -= 40;
        } else if (avgTokens > THRESHOLDS.HIGH_TOKENS) {
            score -= 20;
        } else if (avgTokens > THRESHOLDS.HIGH_TOKENS / 2) {
            score -= 10;
        }

        // Deduct for low cache rate
        if (cacheRate < 0.2) {
            score -= 30;
        } else if (cacheRate < THRESHOLDS.LOW_CACHE_RATE) {
            score -= 15;
        }

        // Deduct for increasing trend
        if (trend === 'increasing') {
            score -= 10;
        }

        // Deduct for issues
        for (const issue of issues) {
            switch (issue.severity) {
                case 'error': score -= 15; break;
                case 'warning': score -= 8; break;
                case 'info': score -= 3; break;
            }
        }

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Convert score to status
     */
    private scoreToStatus(score: number): 'optimal' | 'acceptable' | 'warning' | 'critical' {
        if (score >= 80) return 'optimal';
        if (score >= 60) return 'acceptable';
        if (score >= 40) return 'warning';
        return 'critical';
    }

    /**
     * Generate recommendations based on analysis
     */
    private generateRecommendations(
        issues: ContextBloatIssue[],
        metrics: { avgPromptTokens: number; cacheHitRate: number; tokenTrend: string }
    ): string[] {
        const recommendations: string[] = [];

        // Check for specific issues
        const issueTypes = new Set(issues.map(i => i.type));

        if (issueTypes.has('high_tokens')) {
            recommendations.push(
                '💡 Consider using @workspace or semantic search instead of reading entire files'
            );
            recommendations.push(
                '💡 Use file ranges (startLine/endLine) when reading large files'
            );
        }

        if (issueTypes.has('low_cache')) {
            recommendations.push(
                '💡 Keep consistent context between requests to improve cache hit rate'
            );
            recommendations.push(
                '💡 Avoid adding large, temporary content that changes each request'
            );
        }

        if (issueTypes.has('growing_context')) {
            recommendations.push(
                '💡 Consider starting a new chat session to reset context'
            );
            recommendations.push(
                '💡 Use @summarize or todo lists to compress context'
            );
        }

        if (issueTypes.has('repeated_content')) {
            recommendations.push(
                '💡 Reference previous messages instead of repeating content'
            );
        }

        if (issueTypes.has('long_duration')) {
            recommendations.push(
                '💡 Long response times may indicate complex requests - try breaking into smaller steps'
            );
        }

        // General recommendations
        if (metrics.avgPromptTokens > 30000) {
            recommendations.push(
                '💡 Current average context size is large - monitor for performance impact'
            );
        }

        return recommendations;
    }

    /**
     * Create empty analysis for empty sessions
     */
    private createEmptyAnalysis(): ContextBloatAnalysis {
        return {
            healthScore: 100,
            status: 'optimal',
            cacheHitRate: 0,
            avgPromptTokens: 0,
            tokenTrend: 'stable',
            issues: [],
            recommendations: ['No requests to analyze yet']
        };
    }
}
