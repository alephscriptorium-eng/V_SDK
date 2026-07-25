/**
 * FEATURE-SNAPSHOTS-1.0.0: Tipos para el sistema de snapshots
 * 
 * Módulo dedicado a interfaces y tipos del SnapshotManager
 */

import { CcreqDocumentContent } from '../CcreqDocumentResolver';

// =============================================================================
// Core Types
// =============================================================================

/**
 * Metadata de un snapshot guardado
 */
export interface SnapshotMetadata {
    /** ID único: YYYY-MM-DD_HH-MM_nombre */
    id: string;
    /** Nombre legible dado por el usuario */
    name: string;
    /** Descripción opcional */
    description?: string;
    /** Timestamp de creación */
    createdAt: Date;
    /** Número de requests en el snapshot */
    requestCount: number;
    /** Modelos LLM usados */
    models: string[];
    /** ID de backlog vinculado (opcional) */
    linkedBacklog?: string;
    /** Tokens totales (prompt + completion) */
    totalTokens: TokenCount;
}

/**
 * Conteo de tokens (reutilizable)
 */
export interface TokenCount {
    prompt: number;
    completion: number;
}

/**
 * Contenido completo de un snapshot
 */
export interface Snapshot {
    /** Metadata del snapshot */
    metadata: SnapshotMetadata;
    /** Requests capturados */
    requests: CcreqDocumentContent[];
}

// =============================================================================
// Operation Types
// =============================================================================

/**
 * Opciones para crear un snapshot
 */
export interface CaptureSnapshotOptions {
    /** Nombre del snapshot (se sanitiza automáticamente) */
    name: string;
    /** Descripción opcional */
    description?: string;
    /** ID de backlog a vincular */
    linkedBacklog?: string;
}

/**
 * Resultado de la operación de captura
 */
export interface CaptureResult {
    success: boolean;
    snapshotId?: string;
    requestCount?: number;
    error?: string;
}

/**
 * Resultado genérico de operación
 */
export interface OperationResult<T = void> {
    success: boolean;
    data?: T;
    error?: string;
}

// =============================================================================
// Stats Types
// =============================================================================

/**
 * Estadísticas del sistema de snapshots
 */
export interface SnapshotStats {
    /** Número de snapshots guardados */
    snapshotCount: number;
    /** Tamaño actual del cache */
    cacheSize: number;
    /** Tamaño máximo del cache */
    cacheMaxSize: number;
    /** IDs en cache */
    cachedIds: string[];
}

/**
 * Estadísticas de cache (del CcreqDocumentResolver)
 */
export interface CacheStats {
    size: number;
    maxSize: number;
    ids: string[];
}

// =============================================================================
// Backlog Linking
// =============================================================================

/**
 * Opción de backlog para QuickPick
 */
export interface BacklogOption {
    label: string;
    value: string | undefined;
}

/**
 * Backlogs predefinidos para el QuickPick
 */
export const PREDEFINED_BACKLOGS: BacklogOption[] = [
    { label: '$(dash) Sin vincular', value: undefined },
    { label: '$(git-pull-request) FEATURE-SNAPSHOTS-1.0.0', value: 'FEATURE-SNAPSHOTS-1.0.0' },
    { label: '$(bug) BUG-MCLOGS-1.0.0', value: 'BUG-MCLOGS-1.0.0' },
    { label: '$(beaker) SCRIPT-2.2.0', value: 'SCRIPT-2.2.0' },
    { label: '$(edit) Escribir manualmente...', value: '__custom__' }
];

// =============================================================================
// Export Formats
// =============================================================================

/**
 * Formato de exportación soportado
 */
export type ExportFormat = 'json' | 'markdown' | 'copilotmd';

/**
 * Opciones de exportación
 */
export interface ExportOptions {
    format: ExportFormat;
    /** Incluir requests completos o solo metadata */
    includeRequests?: boolean;
    /** Truncar contenido largo */
    truncateAt?: number;
}
