/**
 * Cable a @zeus/protocol — cero cripto propia.
 * Seat: verifyTravelingPeerCard · TTL: peerCardPhase / isPeerCardFresh.
 */
import {
    isPeerCardShaped,
    isPeerCardFresh,
    isSsbId,
    peerCardPhase,
    peerCardRemainingMs,
    PEER_CARD_PHASE,
    type PeerCard
} from '@zeus/protocol/peer-card';
import { verifyTravelingPeerCard } from '@zeus/protocol/peer-card-seat';

export {
    isPeerCardShaped,
    isPeerCardFresh,
    isSsbId,
    peerCardPhase,
    peerCardRemainingMs,
    PEER_CARD_PHASE,
    verifyTravelingPeerCard
};
export type { PeerCard };

export type SeatVerifyResult = { ok: true } | { ok: false; error: string };

/** Verifica asiento vía API del protocol (no firma local). */
export function verifySeat(card: unknown): SeatVerifyResult {
    return verifyTravelingPeerCard(card);
}
