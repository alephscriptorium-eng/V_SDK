/**
 * AracneBot - Socket.IO client for VS Code Extension mesh communication
 * 
 * Aracne (la tejedora) es el bot que conecta la extensión VS Code
 * con el AlephScript mesh, permitiendo comunicación bidireccional
 * entre el IDE y los servidores MCP.
 * 
 * URL: aleph0.ciudad.* / config.socketUrl — sin puerto hardcodeado.
 *
 * ⚠️ WP-V23 · D-1 — «Sin settings → ⏳ honesto» es FALSO por una vía:
 * `bootstrap/assembleContext.ts:109` inyecta `socketUrl` desde
 * `McpConfigurationManager.getDefaultSocketUrl()`, que sin `aleph0.ciudad.*`
 * puede devolver un `ws://localhost:<puerto>` inventado (ver el docblock de
 * ese método). Con ese valor, `initialize()` toma la rama normal:
 * `pending = false`, estado `ready`, y `connect()` no dispara su guarda —
 * hay un comando de usuario que llega hasta aquí. Sin settings Y sin ese
 * invento, el ⏳ sí es honesto. Quitar el invento es WP-V31; aquí sólo se
 * corrige la afirmación. Ver `plan/REPORTES/WP-V23-config-intencional.md` §13.
 * 
 * @épica MCP-CHANNELS-1.0.0
 */
import * as vscode from 'vscode';
import { AlephScriptClient, AlephScriptClientConfig } from '../libs/alephscript-client';
import { resolveMeshBaseUrl, ZIGURAT_PENDING } from '../config/ziguratSettings';
import { LogCategory } from '../loggingManager';
import { getLogger } from './logging';

/**
 * WP-V71 · el prefijo `[AracneBot]` que llevaban estos mensajes lo pone ahora
 * el campo «origen» de la línea; se retira del texto para no duplicarlo.
 *
 * Superficie sensible: por aquí entran `data` y `args` de pares del mesh que no
 * controlamos. Van al canal por el redactor (WP-V71 CA4), nunca en crudo.
 */
const log = getLogger('AracneBot', LogCategory.SOCKET);

export interface AracneBotConfig {
    socketUrl?: string;
    botName?: string;
    namespace?: string;
    autoConnect?: boolean;
    capabilities?: string[];
}

/** Defaults sin URL — se resuelve desde aleph0.ciudad.* en initialize. */
export const DEFAULT_ARACNE_CONFIG: AracneBotConfig = {
    socketUrl: undefined,
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
    private pending = true;
    
    // VS Code event emitters
    private _onConnectionChange = new vscode.EventEmitter<boolean>();
    private _onMessage = new vscode.EventEmitter<{ event: string; data: any }>();
    private _onError = new vscode.EventEmitter<Error>();
    
    public readonly onConnectionChange = this._onConnectionChange.event;
    public readonly onMessage = this._onMessage.event;
    public readonly onError = this._onError.event;

    private constructor() {
        this.config = { ...DEFAULT_ARACNE_CONFIG };
        this.roomName = `${this.config.botName}_ROOM`;
    }

    public static getInstance(): AracneBotService {
        if (!AracneBotService.instance) {
            AracneBotService.instance = new AracneBotService();
        }
        return AracneBotService.instance;
    }

    /**
     * true si falta aleph0.ciudad.* Y socketUrl. ⚠️ D-1: NO basta con que
     * falte el ajuste — si `assembleContext` inyectó el `ws://localhost:<puerto>`
     * inventado, esto devuelve `false` aunque el usuario no haya configurado
     * nada. Ver el docblock de cabecera.
     */
    public isPending(): boolean {
        return this.pending;
    }

    public getPendingStatus(): string {
        return this.pending ? ZIGURAT_PENDING : 'ready';
    }

    /**
     * Initialize AracneBot with custom configuration
     */
    public initialize(config?: Partial<AracneBotConfig>): void {
        this.config = { ...DEFAULT_ARACNE_CONFIG, ...config };
        this.roomName = `${this.config.botName}_ROOM`;

        const fromSettings = resolveMeshBaseUrl();
        const explicit = (this.config.socketUrl || '').trim();
        // Prefer settings; accept explicit non-empty caller URL (incl. ws→http)
        let socketUrl = fromSettings || explicit;
        if (socketUrl.startsWith('ws://')) {
            socketUrl = 'http://' + socketUrl.slice('ws://'.length);
        } else if (socketUrl.startsWith('wss://')) {
            socketUrl = 'https://' + socketUrl.slice('wss://'.length);
        }
        this.config.socketUrl = socketUrl || undefined;

        if (!this.config.socketUrl) {
            this.pending = true;
            this.client = undefined;
            log.warn(
                `${ZIGURAT_PENDING} aleph0.ciudad.baseUrl (o host+port) no configurado — sin cliente Socket.IO`
            );
            return;
        }

        this.pending = false;

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
                log.info('Connected to mesh', { socketId });
                this._onConnectionChange.fire(true);
                this.registerWithMesh();
            });

            this.client.onDisconnect(() => {
                log.info('Disconnected from mesh');
                this._onConnectionChange.fire(false);
            });

            this.client.onError((error) => {
                log.error('Client error', { error });
                this._onError.fire(error);
            });

            // Setup init triggers (AlephScript protocol)
            this.client.initTriggersDefinition.push(() => {
                this.setupEventListeners();
            });

            log.info('Initialized - ready to connect', { socketUrl: this.config.socketUrl });
            
            // Auto-connect if configured
            if (this.config.autoConnect) {
                this.connect();
            }
        } catch (error) {
            log.error('Failed to initialize', { error });
            this.pending = true;
            this.client = undefined;
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

        log.info('Registered as MASTER of room', {
            room: this.roomName,
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
            log.info('Received VSCODE_COMMAND request', { data });
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
            log.info('Received STATUS request');
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
            log.info('Received HEALTH request');
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
                log.info('Event received', { event: eventName, args });
            }
        });
    }

    /**
     * Connect to the AlephScript mesh
     */
    public connect(): void {
        if (this.pending || !this.client) {
            log.warn(
                `${ZIGURAT_PENDING} sin mesh configurado. Configure aleph0.ciudad.baseUrl (o host+port).`
            );
            return;
        }
        log.info('Connecting to mesh', { url: `${this.config.socketUrl}${this.config.namespace}` });
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
            log.warn('Cannot send - not connected');
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
