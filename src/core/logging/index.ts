/**
 * WP-V71 · Superficie pública del log estructurado.
 *
 * El código vivo importa SIEMPRE desde aquí (`../core/logging`), nunca de los
 * ficheros internos: así el destino del log se puede cambiar en un solo sitio.
 */
export {
    DIAGNOSTIC_CHANNEL_NAME,
    getLogger,
    getLogSessionId,
    getRecentLogEntries,
    renderRecentLogEntries,
    showDiagnosticChannel,
    disposeStructuredLog,
    __resetStructuredLogForTests
} from './structuredLog';
export type { StructuredLogger, StructuredEntry } from './structuredLog';
export { REDACTED, redactString, redactValue, serializeData, isSecretKey, maskHomePath } from './redact';
