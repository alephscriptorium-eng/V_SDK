/**
 * Tipos del panel elenco (Modelo A · reparto/1).
 * Schema de fila = contrato cast-table vía filasCastDesdeReparto.
 * NO mezclar con ICompany (Modelo B) — ver DOS-MODELOS.md.
 */

/** Fila del cast-table (salida de filasCastDesdeReparto). */
export interface CastTableRow {
    participant: string;
    role: string;
    oldid: string;
    axis?: string;
    href?: string;
    cached?: boolean;
}

export type ElencoAvailability =
    | 'ready'
    | 'pending_path'
    | 'pending_shape'
    | 'error';

export interface ElencoSnapshot {
    availability: ElencoAvailability;
    statusMessage: string;
    /** Widget canónico del contrato (no alias). */
    widgetId: 'cast-table';
    rows: CastTableRow[];
    /** Path configurado (vacío si pending_path). */
    repartoPath: string;
    expectedSettingKeys: { path: string };
}

export const CAST_TABLE_WIDGET_ID = 'cast-table' as const;
export const CAST_TABLE_WIDGET_ALIAS = 'panel-elenco' as const;
