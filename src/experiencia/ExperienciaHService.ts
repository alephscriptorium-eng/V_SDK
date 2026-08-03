/**
 * RH-16 · Servicio de experiencia H sobre MinimalMcpClient.
 *
 * Flujo: catálogo → descubrir server H → connect → list/read resources →
 * validar version/shape → fase connecting|connected|pending_external_contract|failed|complete.
 *
 * Descubrimiento: launcher://catalog y/o env H_SDK_MCP_HOST+H_SDK_MCP_PORT.
 * Sin fila ni env → `connecting` + `transportPending` (no fingir connected).
 * Cero costura teatral hardcodeada; cero import sibling del repo H.
 */

import { MinimalMcpClient } from '../mcp/client';
import type { McpEndpoint } from '../mcp/types';
import type { CatalogServerEntry } from '../launcher/types';
import { mergeCatalogWithHEnv } from './catalogFromEnv';
import { discoverHExperienceServer, serverHasPort } from './discover';
import {
    assertExperienciaUrisListed,
    collectPendingExternal,
    deriveExperienciaPhase,
    parsePayloadEscena,
    parsePayloadEstado,
    parsePayloadEvidencia
} from './parse';
import {
    URI_EXPERIENCIA_ESCENA,
    URI_EXPERIENCIA_ESTADO,
    URI_EXPERIENCIA_EVIDENCIA,
    emptyExperienciaSnapshot,
    type ExperienciaPayloads,
    type ExperienciaSnapshot
} from './types';

export interface ExperienciaRefreshInput {
    /** Servidores del catálogo launcher (ResourceProjectionService / CatalogService). */
    catalogServers: readonly CatalogServerEntry[];
    /** Host del launcher (settings); puerto viene de la entrada descubierta. */
    host: string;
    /** Inyección de cliente (tests / fixtures). */
    createClient?: (endpoint: McpEndpoint) => MinimalMcpClient;
    /**
     * Cliente ya apuntado a un fixture MCP cuando el transport de producto
     * está `<pendiente>` — solo tests; no inventa flota en runtime.
     */
    fixtureClient?: MinimalMcpClient;
    fixtureServerId?: string;
}

export class ExperienciaHService {
    private snapshot: ExperienciaSnapshot = emptyExperienciaSnapshot(
        'connecting',
        'experiencia H no refrescada aún',
        { transportPending: true, fresh: false }
    );
    private refreshInFlight: Promise<ExperienciaSnapshot> | undefined;

    getSnapshot(): ExperienciaSnapshot {
        return this.snapshot;
    }

    async refresh(input: ExperienciaRefreshInput): Promise<ExperienciaSnapshot> {
        if (this.refreshInFlight) {
            return this.refreshInFlight;
        }
        // UI observa connecting antes del resultado (RH-18).
        this.publish(
            emptyExperienciaSnapshot('connecting', 'conectando a experiencia H…', {
                transportPending: this.snapshot.transportPending,
                fresh: false,
                serverId: this.snapshot.serverId
            })
        );
        this.refreshInFlight = this.doRefresh(input).finally(() => {
            this.refreshInFlight = undefined;
        });
        return this.refreshInFlight;
    }

    private async doRefresh(input: ExperienciaRefreshInput): Promise<ExperienciaSnapshot> {
        if (input.fixtureClient) {
            return this.publish(
                await this.projectFromClient(
                    input.fixtureClient,
                    input.fixtureServerId ?? 'fixture-h-experiencia'
                )
            );
        }

        const merged = mergeCatalogWithHEnv(input.catalogServers);
        const entry = discoverHExperienceServer(merged.servers);
        if (!entry) {
            return this.publish(
                emptyExperienciaSnapshot(
                    'connecting',
                    'servidor H no aparece en catálogo ni env H_SDK_MCP_* — transport ausente',
                    { transportPending: true, fresh: false }
                )
            );
        }
        if (!serverHasPort(entry)) {
            return this.publish(
                emptyExperienciaSnapshot(
                    'connecting',
                    `servidor H '${entry.id}' sin puerto en catálogo — set H_SDK_MCP_PORT o fila launcher`,
                    { transportPending: true, serverId: entry.id, fresh: false }
                )
            );
        }
        const host = (merged.hostOverride ?? input.host ?? '').trim();
        if (!host) {
            return this.publish(
                emptyExperienciaSnapshot(
                    'connecting',
                    'host H vacío — set H_SDK_MCP_HOST o host launcher (no se inventa)',
                    { transportPending: true, serverId: entry.id, fresh: false }
                )
            );
        }

        const endpoint: McpEndpoint = { host, port: entry.port };
        const factory = input.createClient ?? ((ep) => new MinimalMcpClient(ep));
        const client = factory(endpoint);
        return this.publish(await this.projectFromClient(client, entry.id));
    }

    private async projectFromClient(
        client: MinimalMcpClient,
        serverId: string
    ): Promise<ExperienciaSnapshot> {
        const identity = await client.connect();
        if (!identity.ok) {
            return emptyExperienciaSnapshot('failed', `connect H falló: ${identity.reason}`, {
                serverId,
                fresh: false
            });
        }

        const listed = await client.listResources();
        if (!listed.ok) {
            return emptyExperienciaSnapshot('failed', `listResources H falló: ${listed.reason}`, {
                serverId,
                serverName: identity.data.name,
                serverVersion: identity.data.version,
                fresh: false
            });
        }

        const urisOk = assertExperienciaUrisListed(listed.data.map((r) => r.uri));
        if (!urisOk.ok) {
            return emptyExperienciaSnapshot('failed', urisOk.reason, {
                serverId,
                serverName: identity.data.name,
                serverVersion: identity.data.version,
                fresh: false
            });
        }

        const estadoRaw = await client.readResourceJson(URI_EXPERIENCIA_ESTADO);
        const escenaRaw = await client.readResourceJson(URI_EXPERIENCIA_ESCENA);
        const evidenciaRaw = await client.readResourceJson(URI_EXPERIENCIA_EVIDENCIA);

        if (!estadoRaw.ok) {
            return emptyExperienciaSnapshot(
                'failed',
                `read ${URI_EXPERIENCIA_ESTADO}: ${estadoRaw.reason}`,
                { serverId, fresh: false }
            );
        }
        if (!escenaRaw.ok) {
            return emptyExperienciaSnapshot(
                'failed',
                `read ${URI_EXPERIENCIA_ESCENA}: ${escenaRaw.reason}`,
                { serverId, fresh: false }
            );
        }
        if (!evidenciaRaw.ok) {
            return emptyExperienciaSnapshot(
                'failed',
                `read ${URI_EXPERIENCIA_EVIDENCIA}: ${evidenciaRaw.reason}`,
                { serverId, fresh: false }
            );
        }

        const estado = parsePayloadEstado(estadoRaw.data);
        if (!estado.ok) {
            return emptyExperienciaSnapshot('failed', estado.reason, {
                serverId,
                fresh: false
            });
        }
        const escena = parsePayloadEscena(escenaRaw.data);
        if (!escena.ok) {
            return emptyExperienciaSnapshot('failed', escena.reason, {
                serverId,
                fresh: false
            });
        }
        const evidencia = parsePayloadEvidencia(evidenciaRaw.data);
        if (!evidencia.ok) {
            return emptyExperienciaSnapshot('failed', evidencia.reason, {
                serverId,
                fresh: false
            });
        }

        const payloads: ExperienciaPayloads = {
            estado: estado.data,
            escena: escena.data,
            evidencia: evidencia.data
        };
        // Tres lecturas OK en este refresh → fresh (anti-stale para complete).
        const fresh = true;
        const derived = deriveExperienciaPhase(payloads, { fresh });
        const pendingExternal = collectPendingExternal(payloads);

        return {
            phase: derived.phase,
            reason: derived.reason,
            fetchedAt: new Date().toISOString(),
            fresh,
            serverId,
            serverName: identity.data.name,
            serverVersion: identity.data.version,
            payloads,
            pendingExternal,
            transportPending: false
        };
    }

    private publish(next: ExperienciaSnapshot): ExperienciaSnapshot {
        this.snapshot = next;
        return next;
    }
}
