export interface IMcpServerDescriptor {
  id: string;
  name: string;
  url?: string;
  port?: number;
}

export interface IMcpClient {
  listServers(): Promise<IMcpServerDescriptor[]>;
  healthCheck(id: string): Promise<{ ok: boolean; status: number; details?: any }>; 
}

export type McpStatus = 'running' | 'stopped' | 'error';

// WP-V102 · Esta línea decía «sample-config.json», y era falso por partida
// doble: ningún código busca ese nombre (D16, cerrado en WP-V100) y el fichero
// no existe (lo podó WP-V13 en `f615434`). Lo que estas interfaces describen es
// la forma del fichero que `McpConfigurationManager` carga y parsea de verdad
// —`JSON.parse(configContent) as AlephScriptConfiguration`,
// `src/core/mcpConfigurationManager.ts`—, cuyo nombre vive en la constante
// OPERA_CONFIG_FILENAME de ese módulo.
//
// Se nombra la CONSTANTE, no su valor: es la convención de WP-V100 —un nombre
// vivo va con la constante, uno muerto entre «comillas angulares»— y es lo que
// impide que esta frase vuelva a divergir del fichero que se abre.
// Configuration interfaces to match the structure of the file named by
// OPERA_CONFIG_FILENAME
export interface MCPServerConfig {
  port: number;
  wdir: string
  cmd: string;
  args: string[];
  desc: string;
}

export interface MCPWebConfig {
  host:string;
  port: number;
  args: string[];
  desc: string;
}

export interface MCPServersConfig {
  [serverId: string]: MCPServerConfig;
}

export interface MCPWebsConfig {
  [serverId: string]: MCPWebConfig;
}

export interface LauncherConfig {
  ollamaUrl: string;
  requiredModel: string;
  mcpServiceLauncherPort: number;
  healthCheckTimeout: number;
  shutdownGracePeriod: number;
}

export interface GameConfig {
  id: string;
  name: string;
  description: string;
  mcpServerId: string;
  graphId: string;
  userId: string;
  sessionId: string;
  agentConfigs: AgentConfig[];
}

export interface AgentConfig {
  id: string;
  name: string;
  role: string;
  description: string;
  mcpServerId: string;
  autoStart: boolean;
  priority: number;
}

export interface UIConfig {
  id: string;
  name: string;
  type: 'custom' | 'html5';
  enabled: boolean;
  config: {
    isPrimary?: boolean;
    autoStart: boolean;
    port: number;
  };
}

export interface OrchestrationConfig {
  enableReplay: boolean;
  replayBufferSize: number;
  enableLogging: boolean;
  enableCrossChannelRouting: boolean;
  messageTimeout: number;
}

export interface AppConfig {
  type: string;
}

export interface AlephScriptConfiguration {
  app: AppConfig;
  launcher: LauncherConfig;
  game: GameConfig;
  mcp: {
    servers: MCPServersConfig;
    webs: MCPWebsConfig;
  };
  orchestration: OrchestrationConfig;
  ui: UIConfig[];
}
