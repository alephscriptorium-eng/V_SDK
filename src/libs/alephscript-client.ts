/**
 * AlephScriptClient - Socket.IO client for MCP mesh communication
 * 
 * Stub local para VsCodeExtension siguiendo el patrón de:
 * - MCPGallery/mcp-mesh-sdk/src/libs/alephscript-client.ts
 * - StateMachine/src/clients/alephscript-client.ts
 * 
 * @épica MCP-CHANNELS-1.0.0
 */
import { io, Socket } from 'socket.io-client';

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

export const DEFAULT_CONFIG: AlephScriptClientConfig = {
    name: "VsCodeExtension",
    url: "http://localhost:3010",
    namespace: "/runtime",
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
};

export class AlephScriptClient {
    public io: Socket;
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

    constructor(config: AlephScriptClientConfig = DEFAULT_CONFIG) {
        const mergedConfig = { ...DEFAULT_CONFIG, ...config };
        
        this.name = mergedConfig.name!;
        this.url = mergedConfig.url!;
        this.namespace = mergedConfig.namespace!;
        
        const fullUrl = this.url + this.namespace;
        
        this.io = io(fullUrl, { 
            autoConnect: mergedConfig.autoConnect,
            reconnection: mergedConfig.reconnection,
            reconnectionAttempts: mergedConfig.reconnectionAttempts,
            reconnectionDelay: mergedConfig.reconnectionDelay
        });

        this.io.on("connect", () => {
            console.log(`[${this.name}] Connected to ${fullUrl} (id: ${this.io.id})`);
            this.configurationSet = true;
            this.initTriggers = [...this.initTriggersDefinition];
            
            this.interval = setInterval(() => {
                while (this.initTriggers.length > 0) {
                    const f = this.initTriggers.pop();
                    if (f) f();
                }
            }, 1000);
            
            if (this._onConnect) {
                this._onConnect(this.io.id || '');
            }
        });

        this.io.on("disconnect", () => {
            console.log(`[${this.name}] Disconnected`);
            if (this.interval) {
                clearInterval(this.interval);
            }
            if (this._onDisconnect) {
                this._onDisconnect();
            }
        });

        this.io.on("connect_error", (error) => {
            console.error(`[${this.name}] Connection error:`, error.message);
            if (this._onError) {
                this._onError(error);
            }
        });
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
        if (!this.io.connected) {
            this.io.connect();
        }
    }

    disconnect(): void {
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.io.disconnect();
    }

    isConnected(): boolean {
        return this.io.connected;
    }

    getSocketId(): string | undefined {
        return this.io.id;
    }

    // Room operations (AlephScript protocol)
    room(event: string, data: any, roomName?: string): void {
        const targetRoom = roomName || `${this.name}_ROOM`;
        this.io.emit("room", { event, data, room: targetRoom });
    }

    joinRoom(roomName: string): void {
        this.io.emit("CLIENT_SUSCRIBE", { room: roomName });
    }

    leaveRoom(roomName: string): void {
        this.io.emit("CLIENT_UNSUSCRIBE", { room: roomName });
    }

    register(usuario?: string): void {
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
        this.io.on(event, callback);
    }

    off(event: string, callback?: (...args: any[]) => void): void {
        this.io.off(event, callback);
    }

    emit(event: string, ...args: any[]): void {
        this.io.emit(event, ...args);
    }

    onAny(callback: (eventName: string, ...args: any[]) => void): void {
        this.io.onAny(callback);
    }
}
