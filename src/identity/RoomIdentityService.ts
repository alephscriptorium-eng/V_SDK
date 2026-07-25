import * as vscode from 'vscode';
import {
    isPeerCardShaped,
    isSsbId,
    peerCardPhase,
    PEER_CARD_PHASE,
    verifySeat
} from './protocolApi';
import { readRoomEndpointSettings } from './roomSettings';
import { MeshAuthorityTransport } from './MeshAuthorityTransport';
import {
    emptyIdentitySnapshot,
    type AuthorityCardTransport,
    type IdentitySnapshot,
    type PeerCardSessionView
} from './types';

/**
 * Identidad de sesión WP-V07:
 * join → peer-card de autoridad → seat vía @zeus/protocol · card renovada por join.
 * No persiste la card como identidad durable; ssbId se lee de la card vigente.
 */
export class RoomIdentityService implements vscode.Disposable {
    private static instance: RoomIdentityService | undefined;

    private readonly _onDidChange = new vscode.EventEmitter<IdentitySnapshot>();
    readonly onDidChange = this._onDidChange.event;

    private snapshot: IdentitySnapshot = emptyIdentitySnapshot(
        'pending_settings',
        '⏳ identidad no unida aún'
    );
    /** Card de sesión actual — nunca se trata como identidad durable. */
    private sessionCard: Record<string, unknown> | null = null;
    private joinCount = 0;
    private transport: AuthorityCardTransport;
    private joinInFlight: Promise<IdentitySnapshot> | undefined;

    constructor(transport?: AuthorityCardTransport) {
        this.transport = transport ?? new MeshAuthorityTransport();
    }

    static getInstance(): RoomIdentityService {
        if (!RoomIdentityService.instance) {
            RoomIdentityService.instance = new RoomIdentityService();
        }
        return RoomIdentityService.instance;
    }

    static resetInstanceForTests(): void {
        RoomIdentityService.instance?.dispose();
        RoomIdentityService.instance = undefined;
    }

    /** Solo tests: inyectar transporte (mock autoridad). */
    setTransportForTests(transport: AuthorityCardTransport): void {
        this.transport = transport;
    }

    getSnapshot(): IdentitySnapshot {
        return this.snapshot;
    }

    /** ssbId visible en UI cuando seat OK. */
    getVisibleSsbId(): string | null {
        return this.snapshot.ssbId;
    }

    /**
     * Join de room → recibe peer-card de autoridad → verifica seat.
     * Sin settings/mesh/card/seat → ⏳ / seat_invalid (hostil-omite).
     */
    async join(): Promise<IdentitySnapshot> {
        if (this.joinInFlight) {
            return this.joinInFlight;
        }
        this.joinInFlight = this.doJoin().finally(() => {
            this.joinInFlight = undefined;
        });
        return this.joinInFlight;
    }

    /**
     * Acepta card emitida por autoridad (sin mint local).
     * Hostil-omite: sin card / sin seat → no ready.
     */
    acceptAuthorityPeerCard(raw: unknown, opts: { countJoin?: boolean } = {}): IdentitySnapshot {
        if (opts.countJoin !== false) {
            this.joinCount += 1;
        }
        if (raw == null) {
            return this.publish(
                emptyIdentitySnapshot('pending_card', '⏳ sin peer-card de autoridad (omitida)', {
                    joinCount: this.joinCount,
                    roomId: readRoomEndpointSettings().roomId
                })
            );
        }
        if (!isPeerCardShaped(raw)) {
            return this.publish(
                emptyIdentitySnapshot('pending_card', '⏳ peer-card malformada u omitida', {
                    joinCount: this.joinCount
                })
            );
        }

        const card = raw as Record<string, unknown>;
        const phase = peerCardPhase(card);
        if (phase === PEER_CARD_PHASE.EXPIRED) {
            this.sessionCard = null;
            return this.publish(
                emptyIdentitySnapshot('expired', '⏳ peer-card expirada — re-join requerido', {
                    joinCount: this.joinCount,
                    roomId: String(card.roomId ?? ''),
                    phase
                })
            );
        }

        const seat = verifySeat(card);
        if (!seat.ok) {
            this.sessionCard = null;
            return this.publish(
                emptyIdentitySnapshot(
                    'seat_invalid',
                    `⏳ seat inválido u omitido: ${seat.error}`,
                    {
                        joinCount: this.joinCount,
                        roomId: String(card.roomId ?? ''),
                        phase,
                        seatOk: false
                    }
                )
            );
        }

        if (!isSsbId(card.ssbId)) {
            this.sessionCard = null;
            return this.publish(
                emptyIdentitySnapshot('seat_invalid', '⏳ ssbId ausente o malformado', {
                    joinCount: this.joinCount,
                    roomId: String(card.roomId ?? ''),
                    phase,
                    seatOk: false
                })
            );
        }

        // Sesión fresca por join — no cache durable de identidad.
        this.sessionCard = { ...card };
        const view = toSessionView(card);
        return this.publish({
            availability: 'ready',
            statusMessage: `identidad · ${view.ssbId}`,
            roomId: view.roomId,
            ssbId: view.ssbId,
            phase,
            seatOk: true,
            card: view,
            joinCount: this.joinCount,
            fetchedAt: new Date().toISOString()
        });
    }

    /**
     * Si la card de sesión expiró ⇒ limpia y re-join (renueva card).
     * CA: card expirada ⇒ re-join.
     */
    async ensureFresh(now: number = Date.now()): Promise<IdentitySnapshot> {
        if (!this.sessionCard) {
            return this.join();
        }
        const phase = peerCardPhase(this.sessionCard, now);
        if (phase === PEER_CARD_PHASE.EXPIRED) {
            this.sessionCard = null;
            this.publish(
                emptyIdentitySnapshot('expired', '⏳ peer-card expirada — re-join', {
                    joinCount: this.joinCount,
                    phase
                })
            );
            return this.join();
        }
        // Re-publica snapshot vigente (ssbId visible) sin contar join.
        return this.acceptAuthorityPeerCard(this.sessionCard, { countJoin: false });
    }

    /** Limpia sesión (no toca identidad durable — no hay). */
    clearSession(reason = 'cleared'): void {
        this.sessionCard = null;
        this.publish(
            emptyIdentitySnapshot('pending_card', `⏳ sesión limpia (${reason})`, {
                joinCount: this.joinCount
            })
        );
    }

    dispose(): void {
        this._onDidChange.dispose();
        this.sessionCard = null;
    }

    private async doJoin(): Promise<IdentitySnapshot> {
        const endpoint = readRoomEndpointSettings();
        if (!endpoint.configured) {
            const availability =
                !endpoint.roomId ? 'pending_settings' : 'pending_mesh';
            return this.publish(
                emptyIdentitySnapshot(availability, endpoint.reason || '⏳ settings incompletos', {
                    roomId: endpoint.roomId,
                    joinCount: this.joinCount
                })
            );
        }

        try {
            const raw = await this.transport.joinAndReceiveCard({
                roomId: endpoint.roomId,
                endpoint: endpoint.endpoint
            });
            return this.acceptAuthorityPeerCard(raw);
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            return this.publish(
                emptyIdentitySnapshot(
                    'pending_card',
                    `⏳ join falló / autoridad ausente: ${msg}`,
                    { roomId: endpoint.roomId, joinCount: this.joinCount }
                )
            );
        }
    }

    private publish(next: IdentitySnapshot): IdentitySnapshot {
        this.snapshot = next;
        this._onDidChange.fire(next);
        return next;
    }
}

function toSessionView(card: Record<string, unknown>): PeerCardSessionView {
    return {
        roomId: String(card.roomId),
        endpoint: String(card.endpoint),
        token: String(card.token),
        scopes: Array.isArray(card.scopes)
            ? card.scopes.filter((s): s is string => typeof s === 'string')
            : [],
        expiresAt:
            typeof card.expiresAt === 'string'
                ? card.expiresAt
                : new Date(Number(card.expiresAt)).toISOString(),
        issuedAt:
            card.issuedAt == null
                ? undefined
                : typeof card.issuedAt === 'string'
                  ? card.issuedAt
                  : new Date(Number(card.issuedAt)).toISOString(),
        displayName: typeof card.displayName === 'string' ? card.displayName : undefined,
        sessionId: typeof card.sessionId === 'string' ? card.sessionId : undefined,
        ssbId: String(card.ssbId),
        hasSeatSignature: typeof card.seatSignature === 'string' && !!card.seatSignature
    };
}
