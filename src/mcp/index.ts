/**
 * WP-V28 · Cliente MCP mínimo (lib interna del Zigurat; sin UI aquí —
 * centro vacío). Conectar · listar · leer. Prerrequisito de V18.
 */

export {
    mcpFailure,
    type McpClientFailure,
    type McpClientFailureCode,
    type McpClientResult,
    type McpClientSuccess,
    type McpEndpoint,
    type McpEndpointResolution,
    type McpEndpointSource,
    type McpResourceDescriptor,
    type McpServerIdentity
} from './types';

export {
    MCP_HEALTH_PATH,
    MCP_HTTP_PATH,
    mcpHealthUrl,
    mcpHttpUrl,
    resolveMcpEndpoint,
    SETTING_KEYS_BY_TARGET,
    ZEUS_ENV_HOST,
    ZEUS_ENV_PORT_BY_TARGET,
    type EndpointSources,
    type McpCatalogTarget
} from './endpoint';

export {
    CLIENT_INFO,
    MCP_PROTOCOL_VERSION,
    MinimalMcpClient,
    type MinimalMcpClientOptions
} from './client';

export {
    EDITOR_INFO_URI,
    LAUNCHER_CATALOG_URI,
    readEditorInfo,
    readLauncherCatalog,
    type EditorInfoContrato,
    type LauncherCatalogContrato
} from './contracts';
