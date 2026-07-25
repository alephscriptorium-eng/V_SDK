import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { EDITOR_INFO_URI } from './types';
import { lineaEditorMcpUrl } from './settings';

const CONNECT_TIMEOUT_MS = 8_000;

function parseResourceJson(result: unknown): unknown {
    const contents = (result as { contents?: Array<{ text?: string }> })?.contents;
    const text = contents?.[0]?.text;
    if (typeof text !== 'string') {
        throw new Error('resource sin contents[0].text');
    }
    return JSON.parse(text);
}

function parseToolJson(result: unknown): unknown {
    const content = (result as { content?: Array<{ type?: string; text?: string }> })?.content;
    const text = content?.[0]?.text;
    if (typeof text !== 'string') {
        // Algunos servers devuelven structuredContent
        const structured = (result as { structuredContent?: unknown })?.structuredContent;
        if (structured !== undefined) {
            return structured;
        }
        throw new Error('tool result sin content[0].text');
    }
    try {
        return JSON.parse(text);
    } catch {
        return { ok: false, error: text, rawText: true };
    }
}

/**
 * Cliente MCP → @zeus/linea-editor (SOLO consumo; z-sdk no se modifica).
 */
export class LineaEditorClient {
    async readEditorInfo(host: string, port: number): Promise<
        { ok: true; data: unknown } | { ok: false; error: string }
    > {
        return this.withClient(host, port, async (client) => {
            const data = parseResourceJson(await client.readResource({ uri: EDITOR_INFO_URI }));
            return { ok: true as const, data };
        });
    }

    async callMutationTool(
        host: string,
        port: number,
        name: string,
        args: Record<string, unknown>
    ): Promise<{ ok: true; data: unknown } | { ok: false; error: string }> {
        return this.withClient(host, port, async (client) => {
            const data = parseToolJson(await client.callTool({ name, arguments: args }));
            return { ok: true as const, data };
        });
    }

    private async withClient<T>(
        host: string,
        port: number,
        fn: (client: Client) => Promise<T>
    ): Promise<T | { ok: false; error: string }> {
        let client: Client | undefined;
        try {
            client = new Client(
                { name: 'zigurat-linea-editor', version: '0.1.0' },
                { capabilities: { resources: {}, tools: {} } }
            );
            const transport = new StreamableHTTPClientTransport(
                new URL(lineaEditorMcpUrl(host, port))
            );
            await Promise.race([
                client.connect(transport),
                new Promise<never>((_, reject) =>
                    setTimeout(
                        () => reject(new Error(`timeout connect ${CONNECT_TIMEOUT_MS}ms`)),
                        CONNECT_TIMEOUT_MS
                    )
                )
            ]);
            return await fn(client);
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            return { ok: false, error: msg };
        } finally {
            if (client) {
                try {
                    await client.close();
                } catch {
                    /* ignore */
                }
            }
        }
    }
}
