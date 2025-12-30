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
        try {
            const uri = CcreqDocumentResolver.buildUri(requestId, format);
            const document = await vscode.workspace.openTextDocument(uri);
            const content = document.getText();

            return this.parseContent(content, requestId, format);
        } catch (error) {
            console.error(`Failed to resolve ccreq document for ${requestId}:`, error);
            return null;
        }
    }

    /**
     * Get the latest request content
     */
    async resolveLatest(): Promise<CcreqDocumentContent | null> {
        try {
            const uri = CcreqDocumentResolver.buildLatestUri();
            const document = await vscode.workspace.openTextDocument(uri);
            const content = document.getText();

            // Extract request ID from content
            const idMatch = content.match(/Request ID:\s*`?([a-f0-9]+)`?/i);
            const requestId = idMatch ? idMatch[1] : 'latest';

            return this.parseContent(content, requestId, 'copilotmd');
        } catch (error) {
            console.error('Failed to resolve latest ccreq document:', error);
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
