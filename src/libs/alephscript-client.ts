/**
 * AlephScriptClient - Socket.IO client for MCP mesh communication
 * 
 * Stub local para VsCodeExtension siguiendo el patrón de:
 * - MCPGallery/mcp-mesh-sdk/src/libs/alephscript-client.ts
 * - StateMachine/src/clients/alephscript-client.ts
 * 
 * URL del mesh: caller / aleph0.ciudad.* — sin puerto hardcodeado.
 * Sin url → no se crea Socket (⏳ hostil-omite).
 * 
 * @épica MCP-CHANNELS-1.0.0
 */
import { io, Socket } from 'socket.io-client';
import { LogCategory } from '../loggingManager';
import { getLogger } from '../core/logging';

/**
 * WP-V71 · el prefijo `[nombre]` de estos mensajes pasa a ser el campo `client`
 * del dato: el origen de la línea ya dice `AlephScriptClient`, y el nombre de la
 * instancia se conserva como dato greppable en vez de empotrado en el texto.
 *
 * Superficie sensible: la URL del mesh puede traer credenciales inline o un
 * `?token=…`; sale por el redactor (WP-V71 CA4).
 */
const log = getLogger('AlephScriptClient', LogCategory.SOCKET);

function getHash(key: string): string {
    const l = (s: string) => s.substring(s.length - 2);
    const a = new Date().getTime().toString();
    const b = Math.random().toString();
    return key + ">" + l(a) + l(b);
}

export interface IUserDetails {
    usuario: string;
    sesion?: string;
}

export interface AlephScriptClientConfig {
    name?: string;
    url?: string;
    namespace?: string;
    autoConnect?: boolean;
    reconnection?: boolean;
    reconnectionAttempts?: number;
    reconnectionDelay?: number;
}

/** Defaults sin host/puerto — la URL la aporta aleph0.ciudad.* o el caller. */
export const DEFAULT_CONFIG: AlephScriptClientConfig = {
    name: "VsCodeExtension",
    url: undefined,
    namespace: "/runtime",
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
};

export class AlephScriptClient {
    public io: Socket | undefined;
    public name: string;
    public url: string;
    public namespace: string;
    
    initTriggers: (() => void)[] = [];
    initTriggersDefinition: (() => void)[] = [];
    
    private interval: NodeJS.Timeout | undefined;
    private configurationSet = false;
    private _onConnect: ((socketId: string) => void) | undefined;
    private _onDisconnect: (() => void) | undefined;
    private _onError: ((error: Error) => void) | undefined;
    private readonly pendingReason = '⏳ aleph0.ciudad.baseUrl (o host+port) no configurado';

    constructor(config: AlephScriptClientConfig = DEFAULT_CONFIG) {
        const mergedConfig = { ...DEFAULT_CONFIG, ...config };
        
        this.name = mergedConfig.name!;
        this.url = (mergedConfig.url || '').trim();
        this.namespace = mergedConfig.namespace!;

        if (!this.url) {
            log.warn(`${this.pendingReason} — cliente diferido`, { client: this.name });
            return;
        }
        
        const fullUrl = this.url + this.namespace;
        
        this.io = io(fullUrl, { 
            autoConnect: mergedConfig.autoConnect,
            reconnection: mergedConfig.reconnection,
            reconnectionAttempts: mergedConfig.reconnectionAttempts,
            reconnectionDelay: mergedConfig.reconnectionDelay
        });

        this.io.on("connect", () => {
            log.info('Connected', { client: this.name, url: fullUrl, socketId: this.io?.id });
            this.configurationSet = true;
            this.initTriggers = [...this.initTriggersDefinition];
            
            this.interval = setInterval(() => {
                while (this.initTriggers.length > 0) {
                    const f = this.initTriggers.pop();
                    if (f) f();
                }
            }, 1000);
            
            if (this._onConnect) {
                this._onConnect(this.io?.id || '');
            }
        });

        this.io.on("disconnect", () => {
            log.info('Disconnected', { client: this.name });
            if (this.interval) {
                clearInterval(this.interval);
            }
            if (this._onDisconnect) {
                this._onDisconnect();
            }
        });

        this.io.on("connect_error", (error) => {
            log.error('Connection error', { client: this.name, error: error.message });
            if (this._onError) {
                this._onError(error);
            }
        });
    }

    isConfigured(): boolean {
        return !!this.url && !!this.io;
    }

    // Event handlers
    onConnect(callback: (socketId: string) => void): void {
        this._onConnect = callback;
    }

    onDisconnect(callback: () => void): void {
        this._onDisconnect = callback;
    }

    onError(callback: (error: Error) => void): void {
        this._onError = callback;
    }

    connect(): void {
        if (!this.io) {
            log.warn(this.pendingReason, { client: this.name });
            return;
        }
        if (!this.io.connected) {
            this.io.connect();
        }
    }

    disconnect(): void {
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.io?.disconnect();
    }

    isConnected(): boolean {
        return this.io?.connected || false;
    }

    getSocketId(): string | undefined {
        return this.io?.id;
    }

    // Room operations (AlephScript protocol)
    room(event: string, data: any, roomName?: string): void {
        if (!this.io) {
            log.warn(this.pendingReason, { client: this.name });
            return;
        }
        const targetRoom = roomName || `${this.name}_ROOM`;
        this.io.emit("room", { event, data, room: targetRoom });
    }

    joinRoom(roomName: string): void {
        this.io?.emit("CLIENT_SUSCRIBE", { room: roomName });
    }

    leaveRoom(roomName: string): void {
        this.io?.emit("CLIENT_UNSUSCRIBE", { room: roomName });
    }

    register(usuario?: string): void {
        if (!this.io) {
            return;
        }
        const payload: IUserDetails = { 
            usuario: usuario || this.name, 
            sesion: this.getHash("xS")
        };
        this.io.emit("CLIENT_REGISTER", payload);
    }

    makeMaster(features: string[], roomName?: string): void {
        const targetRoom = roomName || `${this.name}_ROOM`;
        this.room("MAKE_MASTER", { features }, targetRoom);
    }

    // Utility
    getHash(key: string): string {
        return getHash(key);
    }

    // Raw socket access for custom events
    on(event: string, callback: (...args: any[]) => void): void {
        this.io?.on(event, callback);
    }

    off(event: string, callback?: (...args: any[]) => void): void {
        this.io?.off(event, callback);
    }

    emit(event: string, ...args: any[]): void {
        this.io?.emit(event, ...args);
    }

    onAny(callback: (eventName: string, ...args: any[]) => void): void {
        this.io?.onAny(callback);
    }
}
