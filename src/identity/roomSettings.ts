import { getZiguratSettings, resolveMeshBaseUrl, ZIGURAT_PENDING } from '../config/ziguratSettings';
import { ZIGURAT_ROOM_ID_KEY } from './types';

export interface RoomEndpointSettings {
    configured: boolean;
    roomId: string;
    endpoint: string;
    reason?: string;
}

/**
 * Settings para join: zigurat.room.id + mesh endpoint (zigurat.mesh.*).
 * Sin room o sin mesh → ⏳ (hostil-omite).
 */
export function readRoomEndpointSettings(): RoomEndpointSettings {
    const settings = getZiguratSettings();
    const roomId = settings.roomId;
    const endpoint = resolveMeshBaseUrl(settings);

    if (!roomId) {
        return {
            configured: false,
            roomId: '',
            endpoint: '',
            reason: `${ZIGURAT_PENDING} ${ZIGURAT_ROOM_ID_KEY} no configurado`
        };
    }
    if (!endpoint) {
        return {
            configured: false,
            roomId,
            endpoint: '',
            reason: `${ZIGURAT_PENDING} zigurat.mesh.baseUrl (o host+port) no configurado`
        };
    }
    return { configured: true, roomId, endpoint };
}
