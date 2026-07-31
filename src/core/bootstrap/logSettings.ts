/**
 * WP-V80 · DATOS — mapeos de configuración de logging (config-keys → enums).
 * Movidos literales desde los privados de `ExtensionBootstrap`.
 * `stringToLogLevel` ya no tenía llamadores en el monolito; se conserva aquí
 * como mapeo exportado (sin resucitarle llamadores).
 */
import { LogCategory, LogLevel } from '../../loggingManager';

/** Converts string log level to LogLevel enum */
export function stringToLogLevel(level: string): LogLevel {
    switch (level.toLowerCase()) {
        case 'error': return LogLevel.ERROR;
        case 'warn': return LogLevel.WARN;
        case 'info': return LogLevel.INFO;
        case 'debug': return LogLevel.DEBUG;
        case 'trace': return LogLevel.TRACE;
        default: return LogLevel.INFO;
    }
}

/** Converts string array to LogCategory array */
export function stringArrayToLogCategories(categories: string[]): LogCategory[] {
    return categories.map(cat => {
        const upperCat = cat.toUpperCase();
        return Object.values(LogCategory).find(lc => lc.toUpperCase() === upperCat) || LogCategory.GENERAL;
    });
}
