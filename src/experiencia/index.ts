/**
 * RH-16 · Superficie experiencia H (consumo V de resources H→V).
 */

export {
    EXPERIENCIA_RESOURCE_VERSION,
    URI_EXPERIENCIA_ESTADO,
    URI_EXPERIENCIA_ESCENA,
    URI_EXPERIENCIA_EVIDENCIA,
    EXPERIENCIA_URIS,
    emptyExperienciaSnapshot,
    type ExperienciaPhase,
    type ExperienciaPayloads,
    type ExperienciaResourceUri,
    type ExperienciaSnapshot,
    type PayloadEscena,
    type PayloadEstado,
    type PayloadEvidencia
} from './types';

export {
    assertExperienciaUrisListed,
    collectPendingExternal,
    deriveExperienciaPhase,
    parsePayloadEscena,
    parsePayloadEstado,
    parsePayloadEvidencia,
    type ParseResult
} from './parse';

export {
    H_EXPERIENCIA_CAPABILITY,
    H_EXPERIENCIA_SERVER_IDS,
    discoverHExperienceServer,
    serverHasPort
} from './discover';

export {
    ExperienciaHService,
    type ExperienciaRefreshInput
} from './ExperienciaHService';
