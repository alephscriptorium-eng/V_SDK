/** WP-V07 fase 2 · resources MCP proyectados en estado/UI. */

export type ResourceAvailability =
    | 'pending_settings'
    | 'pending_launcher'
    | 'pending_identity'
    | 'ready'
    | 'empty';

export interface ProjectedMcpResource {
    uri: string;
    name: string;
    description?: string;
    mimeType?: string;
    serverId: string;
    serverPort?: number;
}

export interface ResourceProjectionSnapshot {
    availability: ResourceAvailability;
    statusMessage: string;
    resources: ProjectedMcpResource[];
    fetchedAt: string;
}

export function emptyResourceSnapshot(
    availability: ResourceAvailability,
    statusMessage: string,
    extras: Partial<ResourceProjectionSnapshot> = {}
): ResourceProjectionSnapshot {
    return {
        availability,
        statusMessage,
        resources: extras.resources ?? [],
        fetchedAt: extras.fetchedAt ?? new Date().toISOString(),
        ...extras
    };
}
