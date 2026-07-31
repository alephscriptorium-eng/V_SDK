/**
 * Socket Monitor - WebView panel for monitoring Socket.IO connections
 * 
 * Refactorizado para usar AlephScriptClient en lugar de socket.io-client directo.
 * @épica MCP-CHANNELS-1.0.0
 */
import * as vscode from 'vscode';
import { AlephScriptClient, AlephScriptClientConfig } from './libs/alephscript-client';
import { McpConfigurationManager } from './core/mcpConfigurationManager';
import { buildCspMeta, createNonce, escapeHtml } from './webview/security';

export interface SocketMessage {
    id: string;
    timestamp: Date;
    room: string;
    channel: 'Application' | 'System' | 'UserInterface';
    type: string;
    data: any;
    source?: string;
    target?: string;
}

export interface SocketRoomInfo {
    name: string;
    clientCount: number;
    isJoined: boolean;
}

export class SocketMonitor {
    private panel: vscode.WebviewPanel | undefined;
    private client: AlephScriptClient | undefined;
    private messages: SocketMessage[] = [];
    private isConnected = false;
    private rooms: Map<string, SocketRoomInfo> = new Map();
    private configManager: McpConfigurationManager;
    
    // Event emitters for TreeView integration
    private _onConnectionChange: vscode.EventEmitter<boolean> = new vscode.EventEmitter<boolean>();
    private _onRoomsChange: vscode.EventEmitter<Map<string, SocketRoomInfo>> = new vscode.EventEmitter<Map<string, SocketRoomInfo>>();
    private _onMessageReceived: vscode.EventEmitter<SocketMessage> = new vscode.EventEmitter<SocketMessage>();

    public readonly onConnectionChange: vscode.Event<boolean> = this._onConnectionChange.event;
    public readonly onRoomsChange: vscode.Event<Map<string, SocketRoomInfo>> = this._onRoomsChange.event;
    public readonly onMessageReceived: vscode.Event<SocketMessage> = this._onMessageReceived.event;

    constructor() {
        this.configManager = McpConfigurationManager.getInstance();
    }

    public async createOrShowPanel(extensionUri: vscode.Uri) {
        if (this.panel) {
            this.panel.reveal();
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            'mcpSocketMonitor',
            'Socket.io Monitor',
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                // WP-V66: la página no carga recursos locales.
                localResourceRoots: []
            }
        );

        this.panel.webview.html = await this.getWebviewContent();

        this.panel.onDidDispose(() => {
            this.disconnect();
            this.panel = undefined;
        });

        // Handle messages from the webview
        this.panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'connect':
                        this.connect(message.url);
                        break;
                    case 'disconnect':
                        this.disconnect();
                        break;
                    case 'clearMessages':
                        this.clearMessages();
                        break;
                    case 'joinRoom':
                        this.joinRoom(message.room);
                        break;
                    case 'leaveRoom':
                        this.leaveRoom(message.room);
                        break;
                    case 'sendMessage':
                        this.sendMessage(message.room, message.channel, message.data);
                        break;
                }
            }
        );
    }

    private async connect(url: string) {
        try {
            if (this.client) {
                this.client.disconnect();
            }

            // Parse URL to extract namespace if present
            const urlObj = new URL(url);
            const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
            const namespace = urlObj.pathname || '/';

            const config: AlephScriptClientConfig = {
                name: 'SocketMonitor',
                url: baseUrl,
                namespace: namespace,
                autoConnect: false,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            };

            this.client = new AlephScriptClient(config);

            this.client.onConnect((socketId) => {
                this.isConnected = true;
                this.panel?.webview.postMessage({
                    command: 'connectionStatus',
                    connected: true,
                    socketId: socketId
                });
                this._onConnectionChange.fire(true);
                
                // Subscribe to default rooms
                this.client?.joinRoom('Application');
                this.client?.joinRoom('System');
                this.client?.joinRoom('UserInterface');
            });

            this.client.onDisconnect(() => {
                this.isConnected = false;
                this.panel?.webview.postMessage({
                    command: 'connectionStatus',
                    connected: false
                });
                this._onConnectionChange.fire(false);
            });

            this.client.onError((error) => {
                this.panel?.webview.postMessage({
                    command: 'connectionError',
                    error: error.message
                });
            });

            // Listen for all message types
            this.client.onAny((eventName, ...args) => {
                if (!['connect', 'disconnect', 'connect_error'].includes(eventName)) {
                    this.handleMessage(eventName, args[0]);
                }
            });

            // Listen specifically for channel events
            this.client.on('Application', (data) => this.handleMessage('Application', data));
            this.client.on('System', (data) => this.handleMessage('System', data));
            this.client.on('UserInterface', (data) => this.handleMessage('UserInterface', data));

            // Connect
            this.client.connect();

        } catch (error) {
            this.panel?.webview.postMessage({
                command: 'connectionError',
                error: `Failed to connect: ${error}`
            });
        }
    }

    private disconnect() {
        if (this.client) {
            this.client.disconnect();
            this.client = undefined;
            this.isConnected = false;
        }
    }

    private handleMessage(eventName: string, data: any) {
        const message: SocketMessage = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            timestamp: new Date(),
            room: data?.room || 'unknown',
            channel: this.determineChannel(eventName, data),
            type: eventName,
            data: data,
            source: data?.source,
            target: data?.target
        };

        this.messages.unshift(message);
        
        if (this.messages.length > 1000) {
            this.messages = this.messages.slice(0, 1000);
        }

        this.panel?.webview.postMessage({
            command: 'newMessage',
            message: message
        });
        
        this._onMessageReceived.fire(message);
    }

    private determineChannel(eventName: string, data: any): 'Application' | 'System' | 'UserInterface' {
        if (data?.channel) {
            return data.channel;
        }

        if (eventName.includes('ui') || eventName.includes('UI') || eventName.includes('interface')) {
            return 'UserInterface';
        } else if (eventName.includes('system') || eventName.includes('server') || eventName.includes('process')) {
            return 'System';
        } else {
            return 'Application';
        }
    }

    private clearMessages() {
        this.messages = [];
        this.panel?.webview.postMessage({
            command: 'messagesCleared'
        });
    }

    private joinRoom(room: string) {
        if (this.client && this.isConnected) {
            this.client.joinRoom(room);
            this.panel?.webview.postMessage({
                command: 'roomJoined',
                room: room
            });
            
            const roomInfo: SocketRoomInfo = {
                name: room,
                clientCount: 1,
                isJoined: true
            };
            this.rooms.set(room, roomInfo);
            this._onRoomsChange.fire(this.rooms);
        }
    }

    private leaveRoom(room: string) {
        if (this.client && this.isConnected) {
            this.client.leaveRoom(room);
            this.panel?.webview.postMessage({
                command: 'roomLeft',
                room: room
            });
            
            this.rooms.delete(room);
            this._onRoomsChange.fire(this.rooms);
        }
    }

    private sendMessage(room: string, channel: string, data: any) {
        if (this.client && this.isConnected) {
            const message = {
                room: room,
                channel: channel,
                timestamp: new Date().toISOString(),
                source: 'vscode-extension',
                data: data
            };
            
            this.client.emit(channel, message);
        }
    }

    private async getDefaultSocketUrl(): Promise<string> {
        if (!this.configManager.isConfigLoaded()) {
            await this.configManager.initialize();
        }
        return this.configManager.getDefaultSocketUrl();
    }

    private async getWebviewContent(): Promise<string> {
        const defaultUrl = await this.getDefaultSocketUrl();
        return renderSocketMonitorPage(defaultUrl);
    }

    // Public methods for TreeView integration
    public getConnectionStatus(): boolean {
        return this.isConnected;
    }

    public getRooms(): Map<string, SocketRoomInfo> {
        return this.rooms;
    }

    public getRecentMessages(count: number = 10): SocketMessage[] {
        return this.messages.slice(0, count);
    }

    public async connectToSocket(url?: string): Promise<boolean> {
        if (!url) {
            if (!this.configManager.isConfigLoaded()) {
                await this.configManager.initialize();
            }
            url = this.configManager.getDefaultSocketUrl();
        }
        
        return new Promise((resolve, reject) => {
            try {
                this.connect(url!);
                const checkConnection = setInterval(() => {
                    if (this.isConnected) {
                        clearInterval(checkConnection);
                        resolve(true);
                    }
                }, 100);
                
                setTimeout(() => {
                    clearInterval(checkConnection);
                    if (!this.isConnected) {
                        reject(new Error('Connection timeout'));
                    }
                }, 5000);
            } catch (error) {
                reject(error);
            }
        });
    }

    public disconnectFromSocket(): void {
        this.disconnect();
        this.rooms.clear();
        this._onConnectionChange.fire(false);
        this._onRoomsChange.fire(this.rooms);
    }

    public joinSocketRoom(roomName: string): void {
        this.joinRoom(roomName);
    }

    public leaveSocketRoom(roomName: string): void {
        this.leaveRoom(roomName);
    }

    public sendSocketMessage(roomName: string, eventType: string, data: any): void {
        this.sendMessage(roomName, eventType, data);
    }
}


/**
 * WP-V66: página del monitor de sockets con CSP del helper único.
 * Exportada como función pura para el test de facto del censo.
 */
export function renderSocketMonitorPage(defaultUrl: string): string {
    const nonce = createNonce();
    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            ${buildCspMeta({ scriptNonce: nonce, styleNonce: nonce })}
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Socket.io Monitor</title>
            <style nonce="${nonce}">
                body {
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                    padding: 10px;
                    margin: 0;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid var(--vscode-panel-border);
                }
                .connection-panel {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 20px;
                }
                .status {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: bold;
                }
                .status.connected {
                    background: var(--vscode-terminal-ansiGreen);
                    color: black;
                }
                .status.disconnected {
                    background: var(--vscode-terminal-ansiRed);
                    color: white;
                }
                .btn {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                }
                .btn:hover {
                    background: var(--vscode-button-hoverBackground);
                }
                .btn-secondary {
                    background: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                }
                input, select {
                    background: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    border: 1px solid var(--vscode-input-border);
                    padding: 6px 10px;
                    border-radius: 4px;
                    font-size: 12px;
                }
                input:focus, select:focus {
                    outline: 1px solid var(--vscode-focusBorder);
                }
                .section {
                    margin-bottom: 20px;
                }
                .section-title {
                    font-weight: bold;
                    margin-bottom: 10px;
                    color: var(--vscode-foreground);
                }
                .filters {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 15px;
                    flex-wrap: wrap;
                }
                .messages-container {
                    max-height: 500px;
                    overflow-y: auto;
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 4px;
                }
                .message {
                    padding: 8px 12px;
                    border-bottom: 1px solid var(--vscode-panel-border);
                    font-size: 12px;
                }
                .message:last-child {
                    border-bottom: none;
                }
                .message-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 4px;
                }
                .message-type {
                    font-weight: bold;
                    color: var(--vscode-textLink-foreground);
                }
                .message-time {
                    color: var(--vscode-descriptionForeground);
                    font-size: 11px;
                }
                .message-channel {
                    display: inline-block;
                    padding: 2px 6px;
                    border-radius: 3px;
                    font-size: 10px;
                    margin-right: 5px;
                }
                .channel-Application { background: var(--vscode-terminal-ansiBlue); color: white; }
                .channel-System { background: var(--vscode-terminal-ansiYellow); color: black; }
                .channel-UserInterface { background: var(--vscode-terminal-ansiMagenta); color: white; }
                .message-data {
                    background: var(--vscode-textCodeBlock-background);
                    padding: 6px 8px;
                    border-radius: 4px;
                    font-family: var(--vscode-editor-font-family);
                    font-size: 11px;
                    white-space: pre-wrap;
                    word-break: break-all;
                    max-height: 100px;
                    overflow-y: auto;
                }
                .room-controls {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 15px;
                }
                .send-panel {
                    display: flex;
                    gap: 10px;
                    margin-top: 15px;
                    flex-wrap: wrap;
                }
                .send-panel textarea {
                    flex: 1;
                    min-width: 200px;
                    height: 60px;
                    resize: vertical;
                    background: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    border: 1px solid var(--vscode-input-border);
                    padding: 6px 10px;
                    border-radius: 4px;
                    font-family: var(--vscode-editor-font-family);
                    font-size: 12px;
                }
                .empty-state {
                    text-align: center;
                    padding: 40px;
                    color: var(--vscode-descriptionForeground);
                }
                .grow-wide { flex: 1; min-width: 250px; }
                .grow { flex: 1; }
                .w-120 { width: 120px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>🔌 Socket.io Monitor</h2>
                <span id="connectionStatus" class="status disconnected">Disconnected</span>
            </div>

            <div class="connection-panel">
                <input type="text" id="socketUrl" value="${escapeHtml(defaultUrl)}" placeholder="Socket URL" class="grow-wide">
                <button class="btn" data-action="connect">Connect</button>
                <button class="btn btn-secondary" data-action="disconnect">Disconnect</button>
            </div>

            <div class="section">
                <div class="section-title">Room Controls</div>
                <div class="room-controls">
                    <input type="text" id="roomName" placeholder="Room name" class="grow">
                    <button class="btn" data-action="joinRoom">Join</button>
                    <button class="btn btn-secondary" data-action="leaveRoom">Leave</button>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Messages</div>
                <div class="filters">
                    <select id="channelFilter">
                        <option value="">All Channels</option>
                        <option value="Application">Application</option>
                        <option value="System">System</option>
                        <option value="UserInterface">UserInterface</option>
                    </select>
                    <input type="text" id="searchFilter" placeholder="Search messages...">
                    <button class="btn btn-secondary" data-action="clearMessages">Clear</button>
                </div>
                <div id="messagesContainer" class="messages-container">
                    <div class="empty-state">No messages yet. Connect to start monitoring.</div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Send Message</div>
                <div class="send-panel">
                    <input type="text" id="sendRoom" placeholder="Target Room" class="w-120">
                    <select id="sendChannel" class="w-120">
                        <option value="Application">Application</option>
                        <option value="System">System</option>
                        <option value="UserInterface">UserInterface</option>
                    </select>
                    <textarea id="sendData" placeholder='{"type": "test", "message": "Hello"}'></textarea>
                    <button class="btn" data-action="sendMessage">Send</button>
                </div>
            </div>

            <script nonce="${nonce}">
                const vscode = acquireVsCodeApi();
                let allMessages = [];

                // WP-V66 (CSP): cero handlers inline — delegación y listeners.
                document.addEventListener('click', event => {
                    const btn = event.target.closest('[data-action]');
                    if (!btn) return;
                    switch (btn.getAttribute('data-action')) {
                        case 'connect': connect(); break;
                        case 'disconnect': disconnect(); break;
                        case 'joinRoom': joinRoom(); break;
                        case 'leaveRoom': leaveRoom(); break;
                        case 'clearMessages': clearMessages(); break;
                        case 'sendMessage': sendMessage(); break;
                    }
                });
                document.getElementById('channelFilter').addEventListener('change', filterMessages);
                document.getElementById('searchFilter').addEventListener('input', filterMessages);

                function connect() {
                    const url = document.getElementById('socketUrl').value;
                    vscode.postMessage({ command: 'connect', url });
                }

                function disconnect() {
                    vscode.postMessage({ command: 'disconnect' });
                }

                function clearMessages() {
                    vscode.postMessage({ command: 'clearMessages' });
                }

                function joinRoom() {
                    const room = document.getElementById('roomName').value;
                    if (room) {
                        vscode.postMessage({ command: 'joinRoom', room });
                    }
                }

                function leaveRoom() {
                    const room = document.getElementById('roomName').value;
                    if (room) {
                        vscode.postMessage({ command: 'leaveRoom', room });
                    }
                }

                function sendMessage() {
                    const room = document.getElementById('sendRoom').value;
                    const channel = document.getElementById('sendChannel').value;
                    const dataStr = document.getElementById('sendData').value;
                    
                    try {
                        const data = JSON.parse(dataStr);
                        vscode.postMessage({ command: 'sendMessage', room, channel, data });
                    } catch (e) {
                        alert('Invalid JSON data');
                    }
                }

                function filterMessages() {
                    const channelFilter = document.getElementById('channelFilter').value;
                    const searchFilter = document.getElementById('searchFilter').value.toLowerCase();
                    
                    const filtered = allMessages.filter(msg => {
                        if (channelFilter && msg.channel !== channelFilter) return false;
                        if (searchFilter) {
                            const dataStr = JSON.stringify(msg.data).toLowerCase();
                            const typeStr = msg.type.toLowerCase();
                            if (!dataStr.includes(searchFilter) && !typeStr.includes(searchFilter)) {
                                return false;
                            }
                        }
                        return true;
                    });

                    renderMessages(filtered);
                }

                function renderMessages(messages) {
                    const container = document.getElementById('messagesContainer');
                    
                    if (messages.length === 0) {
                        container.innerHTML = '<div class="empty-state">No messages match your filter.</div>';
                        return;
                    }

                    container.innerHTML = messages.map(msg => \`
                        <div class="message">
                            <div class="message-header">
                                <span>
                                    <span class="message-channel channel-\${msg.channel}">\${msg.channel}</span>
                                    <span class="message-type">\${msg.type}</span>
                                </span>
                                <span class="message-time">\${new Date(msg.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <div class="message-data">\${JSON.stringify(msg.data, null, 2)}</div>
                        </div>
                    \`).join('');
                }

                window.addEventListener('message', event => {
                    const message = event.data;
                    switch (message.command) {
                        case 'connectionStatus':
                            const status = document.getElementById('connectionStatus');
                            if (message.connected) {
                                status.textContent = \`Connected (\${message.socketId})\`;
                                status.className = 'status connected';
                            } else {
                                status.textContent = 'Disconnected';
                                status.className = 'status disconnected';
                            }
                            break;
                        case 'connectionError':
                            alert(\`Connection error: \${message.error}\`);
                            break;
                        case 'newMessage':
                            allMessages.unshift(message.message);
                            if (allMessages.length > 1000) {
                                allMessages = allMessages.slice(0, 1000);
                            }
                            filterMessages();
                            break;
                        case 'messagesCleared':
                            allMessages = [];
                            filterMessages();
                            break;
                        case 'roomJoined':
                            console.log(\`Joined room: \${message.room}\`);
                            break;
                        case 'roomLeft':
                            console.log(\`Left room: \${message.room}\`);
                            break;
                    }
                });
            </script>
        </body>
        </html>`;
}
