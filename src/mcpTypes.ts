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

// Configuration interfaces to match sample-config.json structure
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
