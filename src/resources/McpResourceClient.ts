import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { ProjectedMcpResource } from './types';

const CONNECT_TIMEOUT_MS = 6_000;

/**
 * Lista resources MCP de un servidor (Streamable HTTP).
 * Cero invención: si falla → lista vacía + error para el caller.
 */
export class McpResourceClient {
    async listFromServer(input: {
        serverId: string;
        host: string;
        port: number;
    }): Promise<{ resources: ProjectedMcpResource[]; error?: string }> {
        const url = `http://${input.host}:${input.port}/mcp`;
        let client: Client | undefined;
        try {
            client = new Client(
                { name: 'zigurat-resource-projection', version: '0.1.0' },
                { capabilities: { resources: {} } }
            );
            const transport = new StreamableHTTPClientTransport(new URL(url));
            await Promise.race([
                client.connect(transport),
                new Promise<never>((_, reject) =>
                    setTimeout(
                        () => reject(new Error(`timeout connect ${CONNECT_TIMEOUT_MS}ms`)),
                        CONNECT_TIMEOUT_MS
                    )
                )
            ]);

            const listed = await client.listResources();
            const resources: ProjectedMcpResource[] = (listed.resources ?? []).map((r) => ({
                uri: r.uri,
                name: r.name || r.uri,
                description: r.description,
                mimeType: r.mimeType,
                serverId: input.serverId,
                serverPort: input.port
            }));
            return { resources };
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            return { resources: [], error: msg };
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
