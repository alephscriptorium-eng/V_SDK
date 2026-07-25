import { io, type Socket } from 'socket.io-client';
import type { AuthorityCardTransport } from './types';

const JOIN_TIMEOUT_MS = 8_000;

/**
 * Join de room vía mesh Socket.IO: emite intent `join` y espera peer-card
 * de la autoridad (`peer-card` / `PEER_CARD` / payload con peerCard).
 * Sin card en timeout → null (caller → ⏳ pending_card).
 */
export class MeshAuthorityTransport implements AuthorityCardTransport {
    async joinAndReceiveCard(input: {
        roomId: string;
        endpoint: string;
    }): Promise<unknown | null> {
        const base = input.endpoint.replace(/\/$/, '');
        const url = `${base}/runtime`;
        let socket: Socket | undefined;

        try {
            socket = io(url, {
                autoConnect: false,
                reconnection: false,
                timeout: JOIN_TIMEOUT_MS
            });

            const card = await new Promise<unknown | null>((resolve, reject) => {
                const timer = setTimeout(() => {
                    cleanup();
                    resolve(null);
                }, JOIN_TIMEOUT_MS);

                const onCard = (payload: unknown) => {
                    const extracted = extractPeerCard(payload);
                    if (extracted) {
                        cleanup();
                        resolve(extracted);
                    }
                };

                const cleanup = () => {
                    clearTimeout(timer);
                    socket?.off('peer-card', onCard);
                    socket?.off('PEER_CARD', onCard);
                    socket?.off('peerCard', onCard);
                    socket?.off('connect_error', onErr);
                };

                const onErr = (err: Error) => {
                    cleanup();
                    reject(err);
                };

                socket!.on('peer-card', onCard);
                socket!.on('PEER_CARD', onCard);
                socket!.on('peerCard', onCard);
                socket!.on('connect_error', onErr);

                socket!.on('connect', () => {
                    socket!.emit('CLIENT_SUSCRIBE', { room: input.roomId });
                    socket!.emit('intent', {
                        intent: 'join',
                        actorId: `vscode-${Date.now()}`,
                        role: 'player',
                        roomId: input.roomId
                    });
                    // Algunos meshes publican en envelope `room`
                    socket!.emit('room', {
                        event: 'join',
                        room: input.roomId,
                        data: { intent: 'join', role: 'player' }
                    });
                });

                socket!.connect();
            });

            return card;
        } finally {
            try {
                socket?.close();
            } catch {
                /* ignore */
            }
        }
    }
}

function extractPeerCard(payload: unknown): unknown | null {
    if (!payload || typeof payload !== 'object') {
        return null;
    }
    const o = payload as Record<string, unknown>;
    if (o.peerCard && typeof o.peerCard === 'object') {
        return o.peerCard;
    }
    if (typeof o.roomId === 'string' && typeof o.token === 'string') {
        return payload;
    }
    if (o.data && typeof o.data === 'object') {
        return extractPeerCard(o.data);
    }
    return null;
}
