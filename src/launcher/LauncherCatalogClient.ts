import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type {
    CapabilitiesListing,
    CatalogServerEntry,
    CatalogSnapshot,
    LauncherInfo
} from './types';
import { emptyPendingSnapshot } from './types';
import { launcherMcpUrl, readLauncherEndpointSettings } from './settings';

const CONNECT_TIMEOUT_MS = 8_000;

function parseToolJson(result: unknown): unknown {
    const content = (result as { content?: Array<{ type?: string; text?: string }> })?.content;
    const text = content?.[0]?.text;
    if (typeof text !== 'string') {
        throw new Error('tool result sin content[0].text');
    }
    return JSON.parse(text);
}

function parseResourceJson(result: unknown): unknown {
    const contents = (result as { contents?: Array<{ text?: string; mimeType?: string }> })?.contents;
    const text = contents?.[0]?.text;
    if (typeof text !== 'string') {
        throw new Error('resource sin contents[0].text');
    }
    return JSON.parse(text);
}

/**
 * Cliente MCP hacia @zeus/mcp-launcher (Streamable HTTP).
 * Lee launcher://info|catalog|ports y tools resolve_capability / list_capabilities.
 * Sin launcher o sin settings → snapshot ⏳ (no lanza fatal, no inventa flota).
 */
export class LauncherCatalogClient {
    /**
     * Refresco único. Nunca propaga excepción al caller de UI.
     */
    async fetchSnapshot(): Promise<CatalogSnapshot> {
        const endpoint = readLauncherEndpointSettings();
        if (!endpoint.configured || endpoint.port === undefined || !endpoint.host) {
            return emptyPendingSnapshot(
                'pending_settings',
                endpoint.reason || '⏳ aleph0.launcher.port no configurado'
            );
        }

        const { host, port } = endpoint;
        const url = launcherMcpUrl(host, port);
        let client: Client | undefined;

        try {
            client = new Client(
                { name: 'zigurat-launcher-catalog', version: '0.1.0' },
                { capabilities: { resources: {}, tools: {} } }
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

            const [infoRaw, catalogRaw, portsRaw, capsRaw] = await Promise.all([
                client.readResource({ uri: 'launcher://info' }).then(parseResourceJson),
                client.readResource({ uri: 'launcher://catalog' }).then(parseResourceJson),
                client.readResource({ uri: 'launcher://ports' }).then(parseResourceJson),
                client
                    .callTool({ name: 'list_capabilities', arguments: {} })
                    .then(parseToolJson)
                    .catch(() => undefined)
            ]);

            const info = infoRaw as LauncherInfo;
            const servers = normalizeServers(catalogRaw);
            const ports =
                portsRaw && typeof portsRaw === 'object' && !Array.isArray(portsRaw)
                    ? (portsRaw as Record<string, number>)
                    : undefined;
            const capabilities = normalizeCapabilities(capsRaw);

            return {
                availability: 'ready',
                statusMessage: `catálogo en caliente · ${servers.length} servidor(es)`,
                expectedSettingKeys: emptyPendingSnapshot('pending_settings', '').expectedSettingKeys,
                host,
                port,
                info,
                servers,
                ports,
                capabilities,
                fetchedAt: new Date().toISOString()
            };
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            return emptyPendingSnapshot('pending_launcher', `⏳ launcher ausente o no responde (${host}:${port})`, {
                host,
                port,
                lastError: msg,
                fetchedAt: new Date().toISOString()
            });
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

    /**
     * resolve_capability contra launcher vivo. Si no hay launcher → ⏳.
     */
    async resolveCapability(capability: string): Promise<
        | { ok: true; data: unknown }
        | { ok: false; pending: true; statusMessage: string }
        | { ok: false; pending: false; error: string }
    > {
        const endpoint = readLauncherEndpointSettings();
        if (!endpoint.configured || endpoint.port === undefined || !endpoint.host) {
            return {
                ok: false,
                pending: true,
                statusMessage: endpoint.reason || '⏳ aleph0.launcher.port no configurado'
            };
        }

        let client: Client | undefined;
        try {
            client = new Client(
                { name: 'zigurat-launcher-resolve', version: '0.1.0' },
                { capabilities: { tools: {} } }
            );
            const transport = new StreamableHTTPClientTransport(
                new URL(launcherMcpUrl(endpoint.host, endpoint.port))
            );
            await Promise.race([
                client.connect(transport),
                new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('timeout connect')), CONNECT_TIMEOUT_MS)
                )
            ]);
            const data = parseToolJson(
                await client.callTool({
                    name: 'resolve_capability',
                    arguments: { capability }
                })
            );
            return { ok: true, data };
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            return {
                ok: false,
                pending: true,
                statusMessage: `⏳ resolve_capability no disponible: ${msg}`
            };
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

function normalizeServers(catalogRaw: unknown): CatalogServerEntry[] {
    if (!catalogRaw || typeof catalogRaw !== 'object') {
        return [];
    }
    const servers = (catalogRaw as { servers?: unknown }).servers;
    if (!Array.isArray(servers)) {
        return [];
    }
    const out: CatalogServerEntry[] = [];
    for (const raw of servers) {
        if (!raw || typeof raw !== 'object') {
            continue;
        }
        const e = raw as Record<string, unknown>;
        if (typeof e.id !== 'string' || e.id.length === 0) {
            continue;
        }
        out.push({
            id: e.id,
            name: typeof e.name === 'string' ? e.name : e.id,
            port: typeof e.port === 'number' ? e.port : undefined,
            workspace: typeof e.workspace === 'string' ? e.workspace : undefined,
            spawnGroup: typeof e.spawnGroup === 'string' ? e.spawnGroup : undefined,
            capabilities: Array.isArray(e.capabilities)
                ? e.capabilities.filter((c): c is string => typeof c === 'string')
                : undefined,
            tree: (e.tree as CatalogServerEntry['tree']) ?? null
        });
    }
    return out;
}

function normalizeCapabilities(raw: unknown): CapabilitiesListing | undefined {
    if (!raw || typeof raw !== 'object') {
        return undefined;
    }
    const o = raw as Record<string, unknown>;
    return {
        fromCatalog: Array.isArray(o.fromCatalog)
            ? o.fromCatalog.filter((c): c is string => typeof c === 'string')
            : [],
        fromMap: Array.isArray(o.fromMap)
            ? o.fromMap.filter((c): c is string => typeof c === 'string')
            : []
    };
}
