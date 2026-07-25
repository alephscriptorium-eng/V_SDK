/**
 * WP-V07 · Identidad de sesión (peer-card de autoridad).
 * La identidad durable es ssbId en la card; la card NO se cachea como identidad.
 */

export const ZIGURAT_ROOM_ID_KEY = 'zigurat.room.id';

export type IdentityAvailability =
    | 'pending_settings'
    | 'pending_mesh'
    | 'pending_card'
    | 'seat_invalid'
    | 'expired'
    | 'ready';

/** Vista de card en estado de sesión (no almacén durable de identidad). */
export interface PeerCardSessionView {
    roomId: string;
    endpoint: string;
    token: string;
    scopes: string[];
    expiresAt: string;
    issuedAt?: string;
    displayName?: string;
    sessionId?: string;
    ssbId: string;
    /** Presente solo para verificación; no se trata como identidad durable. */
    hasSeatSignature: boolean;
}

export interface IdentitySnapshot {
    availability: IdentityAvailability;
    statusMessage: string;
    roomId: string;
    /** ssbId visible cuando hay card con seat OK. */
    ssbId: string | null;
    phase: string;
    seatOk: boolean;
    card: PeerCardSessionView | null;
    joinCount: number;
    fetchedAt: string;
}

export function emptyIdentitySnapshot(
    availability: IdentityAvailability,
    statusMessage: string,
    extras: Partial<IdentitySnapshot> = {}
): IdentitySnapshot {
    return {
        availability,
        statusMessage,
        roomId: extras.roomId ?? '',
        ssbId: null,
        phase: 'none',
        seatOk: false,
        card: null,
        joinCount: extras.joinCount ?? 0,
        fetchedAt: extras.fetchedAt ?? new Date().toISOString(),
        ...extras
    };
}

/**
 * Transporte de join: pide a la autoridad una peer-card.
 * El IDE jamás acuña ssbId; solo recibe y verifica.
 */
export interface AuthorityCardTransport {
    joinAndReceiveCard(input: {
        roomId: string;
        endpoint: string;
    }): Promise<unknown | null>;
}
