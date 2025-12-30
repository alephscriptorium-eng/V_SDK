/**
 * WISH-01: Copilot Log Exporter MCP
 * ccreq Document Resolver - Access Copilot request content via VS Code's TextDocumentContentProvider
 */

import * as vscode from 'vscode';

/**
 * URI scheme used by GitHub Copilot Chat for request logs
 */
export const CCREQ_SCHEME = 'ccreq';

/**
 * Configuration for cache behavior
 */
export interface CacheConfig {
    /** Maximum number of requests to keep in cache (default: 5) */
    maxCacheSize: number;
}

/** Default cache configuration */
const DEFAULT_CACHE_CONFIG: CacheConfig = {
    maxCacheSize: 5
};

/** Current cache configuration */
let cacheConfig: CacheConfig = { ...DEFAULT_CACHE_CONFIG };

/**
 * Update cache configuration
 */
export function setCacheConfig(config: Partial<CacheConfig>): void {
    cacheConfig = { ...cacheConfig, ...config };
    // Trim cache if new size is smaller
    trimCache();
}

/**
 * Get current cache configuration
 */
export function getCacheConfig(): CacheConfig {
    return { ...cacheConfig };
}

/**
 * Parsed content from a ccreq document
 */
export interface CcreqDocumentContent {
    /** Raw markdown content */
    raw: string;
    /** Request ID */
    requestId: string;
    /** Format (copilotmd or json) */
    format: 'copilotmd' | 'json';
    /** Parsed metadata section */
    metadata?: {
        model?: string;
        promptTokens?: number;
        cachedTokens?: number;
        completionTokens?: number;
        timestamp?: string;
    };
    /** System message content */
    systemMessage?: string;
    /** User messages */
    userMessages: string[];
    /** Assistant responses */
    assistantResponses: string[];
    /** Tool calls */
    toolCalls: Array<{
        name: string;
        arguments?: string;
        result?: string;
    }>;
    /** Timestamp when cached */
    cachedAt?: number;
}

/**
 * Global cache for resolved ccreq documents
 * Populated when documents are successfully resolved via VS Code API
 * Accessible by MCP server for HTTP requests
 * Limited to maxCacheSize entries (default: 5)
 */
const contentCache: Map<string, CcreqDocumentContent> = new Map();

/**
 * Order of cache entries (for LRU eviction)
 */
const cacheOrder: string[] = [];

/**
 * Trim cache to configured max size (LRU eviction)
 */
function trimCache(): void {
    while (cacheOrder.length > cacheConfig.maxCacheSize) {
        const oldestId = cacheOrder.shift();
        if (oldestId) {
            contentCache.delete(oldestId);
            console.log(`[CcreqResolver] Cache evicted: ${oldestId} (limit: ${cacheConfig.maxCacheSize})`);
        }
    }
}

/**
 * Get cached content for a request ID (used by MCP server)
 */
export function getCachedRequestContent(requestId: string): CcreqDocumentContent | null {
    const content = contentCache.get(requestId);
    if (content) {
        // Move to end of cache order (LRU touch)
        const idx = cacheOrder.indexOf(requestId);
        if (idx > -1) {
            cacheOrder.splice(idx, 1);
            cacheOrder.push(requestId);
        }
    }
    return content || null;
}

/**
 * Get all cached request IDs (most recent last)
 */
export function getCachedRequestIds(): string[] {
    return [...cacheOrder];
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; maxSize: number; ids: string[] } {
    return {
        size: contentCache.size,
        maxSize: cacheConfig.maxCacheSize,
        ids: [...cacheOrder]
    };
}

/**
 * Manually cache content (used by commands and resolver)
 * Respects maxCacheSize limit with LRU eviction
 */
export function cacheRequestContent(requestId: string, content: CcreqDocumentContent): void {
    // Remove if already exists (will re-add at end)
    const existingIdx = cacheOrder.indexOf(requestId);
    if (existingIdx > -1) {
        cacheOrder.splice(existingIdx, 1);
    }
    
    // Add with timestamp
    content.cachedAt = Date.now();
    contentCache.set(requestId, content);
    cacheOrder.push(requestId);
    
    // Evict oldest if over limit
    trimCache();
    
    console.log(`[CcreqResolver] Cached ${requestId} (${cacheOrder.length}/${cacheConfig.maxCacheSize})`);
}

/**
 * Clear all cached content
 */
export function clearCache(): void {
    contentCache.clear();
    cacheOrder.length = 0;
    console.log('[CcreqResolver] Cache cleared');
}

/**
 * Resolves ccreq: URIs to get Copilot request content
 */
export class CcreqDocumentResolver {
    
    /**
     * Build a ccreq URI for a request ID
     */
    static buildUri(requestId: string, format: 'copilotmd' | 'json' = 'copilotmd'): vscode.Uri {
        const extension = format === 'json' ? '.json' : '.copilotmd';
        return vscode.Uri.parse(`${CCREQ_SCHEME}:${requestId}${extension}`);
    }

    /**
     * Build URI for the latest request
     */
    static buildLatestUri(): vscode.Uri {
        return vscode.Uri.parse(`${CCREQ_SCHEME}:latest.copilotmd`);
    }

    /**
     * Open and read a ccreq document
     * Note: This requires the Copilot Chat extension to be active and have registered its TextDocumentContentProvider
     */
    async resolveDocument(requestId: string, format: 'copilotmd' | 'json' = 'copilotmd'): Promise<CcreqDocumentContent | null> {
        // First check cache
        const cached = contentCache.get(requestId);
        if (cached) {
            console.log(`[CcreqResolver] Cache HIT for ${requestId}`);
            return cached;
        }

        try {
            const uri = CcreqDocumentResolver.buildUri(requestId, format);
            console.log(`[CcreqResolver] Attempting to open: ${uri.toString()}`);
            
            const document = await vscode.workspace.openTextDocument(uri);
            const content = document.getText();
            
            console.log(`[CcreqResolver] Document opened, content length: ${content.length} chars`);
            
            // Log first 200 chars for debugging
            if (content.length > 0) {
                console.log(`[CcreqResolver] Content preview: ${content.substring(0, 200)}...`);
            } else {
                console.warn(`[CcreqResolver] WARNING: Document is empty for ${requestId}`);
            }

            const parsed = this.parseContent(content, requestId, format);
            
            // Cache successful resolution
            if (parsed && parsed.raw && parsed.raw.length > 0) {
                contentCache.set(requestId, parsed);
                console.log(`[CcreqResolver] Parsed and cached: systemMessage=${parsed.systemMessage?.length || 0} chars, userMessages=${parsed.userMessages.length}`);
            }
            
            return parsed;
        } catch (error) {
            console.error(`[CcreqResolver] Failed to resolve ccreq document for ${requestId}:`, error);
            return null;
        }
    }

    /**
     * Get the latest request content
     */
    async resolveLatest(): Promise<CcreqDocumentContent | null> {
        try {
            const uri = CcreqDocumentResolver.buildLatestUri();
            console.log(`[CcreqResolver] Attempting to open LATEST: ${uri.toString()}`);
            
            const document = await vscode.workspace.openTextDocument(uri);
            const content = document.getText();
            
            console.log(`[CcreqResolver] Latest document opened, content length: ${content.length} chars`);

            // Extract request ID from content
            const idMatch = content.match(/Request ID:\s*`?([a-f0-9]+)`?/i);
            const requestId = idMatch ? idMatch[1] : 'latest';
            
            console.log(`[CcreqResolver] Extracted request ID: ${requestId}`);

            const parsed = this.parseContent(content, requestId, 'copilotmd');
            
            // Cache successful resolution (only if we got a real ID)
            if (parsed && requestId !== 'latest') {
                contentCache.set(requestId, parsed);
                console.log(`[CcreqResolver] Latest cached with ID ${requestId}`);
            }
            
            return parsed;
        } catch (error) {
            console.error('[CcreqResolver] Failed to resolve latest ccreq document:', error);
            return null;
        }
    }

    /**
     * Check if the ccreq scheme is available (Copilot Chat extension is active)
     */
    async isSchemeAvailable(): Promise<boolean> {
        try {
            // Try to open a test document - if scheme is not registered, this will fail
            const testUri = vscode.Uri.parse(`${CCREQ_SCHEME}:test.copilotmd`);
            await vscode.workspace.openTextDocument(testUri);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Parse ccreq document content
     */
    private parseContent(
        raw: string, 
        requestId: string, 
        format: 'copilotmd' | 'json'
    ): CcreqDocumentContent {
        if (format === 'json') {
            return this.parseJsonContent(raw, requestId);
        }
        return this.parseMarkdownContent(raw, requestId);
    }

    /**
     * Parse markdown format (.copilotmd)
     */
    private parseMarkdownContent(raw: string, requestId: string): CcreqDocumentContent {
        const result: CcreqDocumentContent = {
            raw,
            requestId,
            format: 'copilotmd',
            userMessages: [],
            assistantResponses: [],
            toolCalls: []
        };

        // Parse metadata block
        const metadataMatch = raw.match(/## Metadata\s*\n([\s\S]*?)(?=\n##|$)/);
        if (metadataMatch) {
            const metadataBlock = metadataMatch[1];
            result.metadata = {};

            const modelMatch = metadataBlock.match(/Model:\s*`?([^`\n]+)`?/);
            if (modelMatch) result.metadata.model = modelMatch[1].trim();

            const promptTokensMatch = metadataBlock.match(/Prompt Tokens:\s*(\d+)/);
            if (promptTokensMatch) result.metadata.promptTokens = parseInt(promptTokensMatch[1], 10);

            const cachedTokensMatch = metadataBlock.match(/Cached Tokens:\s*(\d+)/);
            if (cachedTokensMatch) result.metadata.cachedTokens = parseInt(cachedTokensMatch[1], 10);

            const completionTokensMatch = metadataBlock.match(/Completion Tokens:\s*(\d+)/);
            if (completionTokensMatch) result.metadata.completionTokens = parseInt(completionTokensMatch[1], 10);
        }

        // Parse system message
        const systemMatch = raw.match(/## System Message\s*\n([\s\S]*?)(?=\n##|$)/);
        if (systemMatch) {
            result.systemMessage = systemMatch[1].trim();
        }

        // Parse user messages
        const userMatches = raw.matchAll(/### User\s*\n([\s\S]*?)(?=\n###|##|$)/g);
        for (const match of userMatches) {
            result.userMessages.push(match[1].trim());
        }

        // Parse assistant responses
        const assistantMatches = raw.matchAll(/### Assistant\s*\n([\s\S]*?)(?=\n###|##|$)/g);
        for (const match of assistantMatches) {
            result.assistantResponses.push(match[1].trim());
        }

        // Parse tool calls
        const toolMatches = raw.matchAll(/### Tool Call:\s*(\w+)\s*\n([\s\S]*?)(?=\n###|##|$)/g);
        for (const match of toolMatches) {
            result.toolCalls.push({
                name: match[1],
                arguments: match[2].trim()
            });
        }

        return result;
    }

    /**
     * Parse JSON format
     */
    private parseJsonContent(raw: string, requestId: string): CcreqDocumentContent {
        const result: CcreqDocumentContent = {
            raw,
            requestId,
            format: 'json',
            userMessages: [],
            assistantResponses: [],
            toolCalls: []
        };

        try {
            const parsed = JSON.parse(raw);
            
            result.metadata = {
                model: parsed.model,
                promptTokens: parsed.usage?.prompt_tokens,
                cachedTokens: parsed.usage?.prompt_tokens_details?.cached_tokens,
                completionTokens: parsed.usage?.completion_tokens
            };

            if (parsed.messages) {
                for (const msg of parsed.messages) {
                    switch (msg.role) {
                        case 'system':
                            result.systemMessage = msg.content;
                            break;
                        case 'user':
                            result.userMessages.push(msg.content);
                            break;
                        case 'assistant':
                            result.assistantResponses.push(msg.content);
                            break;
                        case 'tool':
                            result.toolCalls.push({
                                name: msg.name || 'unknown',
                                result: msg.content
                            });
                            break;
                    }
                }
            }
        } catch (error) {
            console.error('Failed to parse JSON ccreq content:', error);
        }

        return result;
    }
}
