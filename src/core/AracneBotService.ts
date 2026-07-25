/**
 * AracneBot - Socket.IO client for VS Code Extension mesh communication
 * 
 * Aracne (la tejedora) es el bot que conecta la extensión VS Code
 * con el AlephScript mesh, permitiendo comunicación bidireccional
 * entre el IDE y los servidores MCP.
 * 
 * Sigue el patrón de:
 * - ProserpinaBot (DevOpsServer)
 * - EuridiceBot (MCPPrologServer)
 * 
 * @épica MCP-CHANNELS-1.0.0
 */
import * as vscode from 'vscode';
import { AlephScriptClient, AlephScriptClientConfig } from '../libs/alephscript-client';

export interface AracneBotConfig {
    socketUrl?: string;
    botName?: string;
    namespace?: string;
    autoConnect?: boolean;
    capabilities?: string[];
}

export const DEFAULT_ARACNE_CONFIG: AracneBotConfig = {
    socketUrl: "http://localhost:3010",
    botName: "vscode-extension",
    namespace: "/runtime",
    autoConnect: false,
    capabilities: [
        "VSCODE_COMMAND",
        "VSCODE_STATUS",
        "VSCODE_NOTIFICATION",
        "COPILOT_CHAT",
        "EXTENSION_HEALTH"
    ]
};

/**
 * AracneBot Service - Singleton para gestionar la conexión Socket.IO
 */
export class AracneBotService {
    private static instance: AracneBotService;
    private client: AlephScriptClient | undefined;
    private config: AracneBotConfig;
    private roomName: string;
    
    // VS Code event emitters
    private _onConnectionChange = new vscode.EventEmitter<boolean>();
    private _onMessage = new vscode.EventEmitter<{ event: string; data: any }>();
    private _onError = new vscode.EventEmitter<Error>();
    
    public readonly onConnectionChange = this._onConnectionChange.event;
    public readonly onMessage = this._onMessage.event;
    public readonly onError = this._onError.event;

    private constructor() {
        this.config = DEFAULT_ARACNE_CONFIG;
        this.roomName = `${this.config.botName}_ROOM`;
    }

    public static getInstance(): AracneBotService {
        if (!AracneBotService.instance) {
            AracneBotService.instance = new AracneBotService();
        }
        return AracneBotService.instance;
    }

    /**
     * Initialize AracneBot with custom configuration
     */
    public initialize(config?: Partial<AracneBotConfig>): void {
        if (config) {
            this.config = { ...DEFAULT_ARACNE_CONFIG, ...config };
            this.roomName = `${this.config.botName}_ROOM`;
        }

        try {
            const clientConfig: AlephScriptClientConfig = {
                name: this.config.botName,
                url: this.config.socketUrl,
                namespace: this.config.namespace,
                autoConnect: false,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 2000
            };

            this.client = new AlephScriptClient(clientConfig);
            
            // Setup connection handlers
            this.client.onConnect((socketId) => {
                console.log(`[AracneBot] Connected with id: ${socketId}`);
                this._onConnectionChange.fire(true);
                this.registerWithMesh();
            });

            this.client.onDisconnect(() => {
                console.log(`[AracneBot] Disconnected from mesh`);
                this._onConnectionChange.fire(false);
            });

            this.client.onError((error) => {
                console.error(`[AracneBot] Error:`, error);
                this._onError.fire(error);
            });

            // Setup init triggers (AlephScript protocol)
            this.client.initTriggersDefinition.push(() => {
                this.setupEventListeners();
            });

            console.log(`[AracneBot] Initialized - ready to connect to ${this.config.socketUrl}`);
            
            // Auto-connect if configured
            if (this.config.autoConnect) {
                this.connect();
            }
        } catch (error) {
            console.error(`[AracneBot] Failed to initialize:`, error);
            throw error;
        }
    }

    /**
     * Register with AlephScript mesh as MASTER of the room
     */
    private registerWithMesh(): void {
        if (!this.client) return;

        // Register client
        this.client.register(this.config.botName);
        
        // Subscribe to room
        this.client.joinRoom(this.roomName);
        
        // Declare as MASTER with capabilities
        this.client.makeMaster(this.config.capabilities || [], this.roomName);

        console.log(`[AracneBot] Registered as MASTER of ${this.roomName}`, {
            capabilities: this.config.capabilities
        });
    }

    /**
     * Setup event listeners for incoming messages
     */
    private setupEventListeners(): void {
        if (!this.client) return;

        // Handle capability requests from other bots
        this.client.on("GET_VSCODE_COMMAND", async (data: any) => {
            console.log("[AracneBot] Received VSCODE_COMMAND request:", data);
            this._onMessage.fire({ event: "GET_VSCODE_COMMAND", data });
            
            // Execute VS Code command if provided
            if (data?.command) {
                try {
                    const result = await vscode.commands.executeCommand(data.command, ...(data.args || []));
                    this.client?.room("SET_VSCODE_COMMAND", { 
                        success: true, 
                        command: data.command,
                        result 
                    }, this.roomName);
                } catch (error) {
                    this.client?.room("SET_VSCODE_COMMAND", { 
                        success: false, 
                        command: data.command,
                        error: String(error) 
                    }, this.roomName);
                }
            }
        });

        this.client.on("GET_VSCODE_STATUS", () => {
            console.log("[AracneBot] Received STATUS request");
            this._onMessage.fire({ event: "GET_VSCODE_STATUS", data: {} });
            
            this.client?.room("SET_VSCODE_STATUS", {
                connected: true,
                extensionVersion: vscode.extensions.getExtension('escrivivir-co.scriptorium-vscode-extension')?.packageJSON?.version || 'unknown',
                vscodeVersion: vscode.version,
                workspace: vscode.workspace.name || 'no-workspace',
                timestamp: new Date().toISOString()
            }, this.roomName);
        });

        this.client.on("GET_EXTENSION_HEALTH", () => {
            console.log("[AracneBot] Received HEALTH request");
            this._onMessage.fire({ event: "GET_EXTENSION_HEALTH", data: {} });
            
            this.client?.room("SET_EXTENSION_HEALTH", {
                status: "healthy",
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
                timestamp: new Date().toISOString()
            }, this.roomName);
        });

        // Subscribe to all events for debugging
        this.client.onAny((eventName: string, ...args: any[]) => {
            if (!['connect', 'disconnect', 'connect_error'].includes(eventName)) {
                console.log(`[AracneBot] Event: ${eventName}`, args);
            }
        });
    }

    /**
     * Connect to the AlephScript mesh
     */
    public connect(): void {
        if (!this.client) {
            console.warn("[AracneBot] Not initialized. Call initialize() first.");
            return;
        }
        console.log(`[AracneBot] Connecting to ${this.config.socketUrl}${this.config.namespace}...`);
        this.client.connect();
    }

    /**
     * Disconnect from the mesh
     */
    public disconnect(): void {
        if (this.client) {
            this.client.disconnect();
        }
    }

    /**
     * Check if connected
     */
    public isConnected(): boolean {
        return this.client?.isConnected() || false;
    }

    /**
     * Get the underlying client for advanced operations
     */
    public getClient(): AlephScriptClient | undefined {
        return this.client;
    }

    /**
     * Send a message to a specific room
     */
    public sendToRoom(event: string, data: any, roomName?: string): void {
        if (!this.client || !this.isConnected()) {
            console.warn("[AracneBot] Cannot send - not connected");
            return;
        }
        this.client.room(event, data, roomName || this.roomName);
    }

    /**
     * Broadcast notification to mesh
     */
    public broadcastNotification(type: 'info' | 'warning' | 'error', message: string, data?: any): void {
        this.sendToRoom("VSCODE_NOTIFICATION", {
            type,
            message,
            data,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Dispose resources
     */
    public dispose(): void {
        this.disconnect();
        this._onConnectionChange.dispose();
        this._onMessage.dispose();
        this._onError.dispose();
    }
}
