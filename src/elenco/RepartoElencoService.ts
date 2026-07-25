/**
 * WP-V09 · Servicio de elenco desde reparto real (carril Z).
 *
 * Proyecta `reparto/1` → filas cast-table con `filasCastDesdeReparto`
 * de `@zeus/reparto-kit` (reutiliza, no reimplementa).
 * SEPARADO de ICompany / alephscript.teatro — ver DOS-MODELOS.md.
 */
import * as vscode from 'vscode';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { filasCastDesdeReparto } from '@zeus/reparto-kit/filas';
import {
    isRepartoShaped,
    REPARTO_VERSION,
    type RepartoV1,
} from '@zeus/reparto-kit/tipos';
import { getZiguratSettings } from '../config/ziguratSettings';
import {
    CAST_TABLE_WIDGET_ID,
    type CastTableRow,
    type ElencoSnapshot,
} from './types';

const SETTING_PATH = 'zigurat.reparto.path';

export class RepartoElencoService implements vscode.Disposable {
    private static instance: RepartoElencoService | undefined;
    private readonly _onDidChange = new vscode.EventEmitter<ElencoSnapshot>();
    readonly onDidChange = this._onDidChange.event;
    private snapshot: ElencoSnapshot;
    private readonly configSub: vscode.Disposable;

    private constructor() {
        this.snapshot = this.buildPendingPath('');
        this.configSub = vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('zigurat.reparto')) {
                void this.refresh();
            }
        });
    }

    static getInstance(): RepartoElencoService {
        if (!RepartoElencoService.instance) {
            RepartoElencoService.instance = new RepartoElencoService();
        }
        return RepartoElencoService.instance;
    }

    getSnapshot(): ElencoSnapshot {
        return this.snapshot;
    }

    async refresh(): Promise<ElencoSnapshot> {
        const pathCfg = getZiguratSettings().repartoPath;
        if (!pathCfg) {
            this.snapshot = this.buildPendingPath('');
            this._onDidChange.fire(this.snapshot);
            return this.snapshot;
        }

        const resolved = this.resolvePath(pathCfg);
        if (!resolved) {
            this.snapshot = {
                availability: 'error',
                statusMessage: `⏳ path de reparto no resoluble: ${pathCfg}`,
                widgetId: CAST_TABLE_WIDGET_ID,
                rows: [],
                repartoPath: pathCfg,
                expectedSettingKeys: { path: SETTING_PATH },
            };
            this._onDidChange.fire(this.snapshot);
            return this.snapshot;
        }

        let raw: unknown;
        try {
            const text = await fs.promises.readFile(resolved, 'utf8');
            raw = JSON.parse(text);
        } catch (err) {
            this.snapshot = {
                availability: 'error',
                statusMessage: `⏳ no se pudo leer reparto: ${(err as Error).message}`,
                widgetId: CAST_TABLE_WIDGET_ID,
                rows: [],
                repartoPath: resolved,
                expectedSettingKeys: { path: SETTING_PATH },
            };
            this._onDidChange.fire(this.snapshot);
            return this.snapshot;
        }

        if (!isRepartoShaped(raw)) {
            this.snapshot = {
                availability: 'pending_shape',
                statusMessage: `⏳ shape inválido (se espera ${REPARTO_VERSION})`,
                widgetId: CAST_TABLE_WIDGET_ID,
                rows: [],
                repartoPath: resolved,
                expectedSettingKeys: { path: SETTING_PATH },
            };
            this._onDidChange.fire(this.snapshot);
            return this.snapshot;
        }

        const rows = filasCastDesdeReparto(raw as RepartoV1) as CastTableRow[];
        this.snapshot = {
            availability: 'ready',
            statusMessage: `elenco: ${rows.length} fila(s) · ${CAST_TABLE_WIDGET_ID} · ${REPARTO_VERSION}`,
            widgetId: CAST_TABLE_WIDGET_ID,
            rows,
            repartoPath: resolved,
            expectedSettingKeys: { path: SETTING_PATH },
        };
        this._onDidChange.fire(this.snapshot);
        return this.snapshot;
    }

    /**
     * Proyección pura (tests / probes): sin VS Code settings.
     * Hostil-omite: sin reparto → filas vacías + availability pending_shape.
     */
    static projectFromReparto(reparto: unknown): {
        ok: boolean;
        rows: CastTableRow[];
        reason?: string;
    } {
        if (reparto == null) {
            return { ok: false, rows: [], reason: 'pending_reparto' };
        }
        if (!isRepartoShaped(reparto)) {
            return { ok: false, rows: [], reason: 'pending_shape' };
        }
        return {
            ok: true,
            rows: filasCastDesdeReparto(reparto as RepartoV1) as CastTableRow[],
        };
    }

    private resolvePath(pathCfg: string): string {
        if (path.isAbsolute(pathCfg)) {
            return pathCfg;
        }
        const folder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!folder) {
            return '';
        }
        return path.resolve(folder, pathCfg);
    }

    private buildPendingPath(pathCfg: string): ElencoSnapshot {
        return {
            availability: 'pending_path',
            statusMessage: `⏳ configure ${SETTING_PATH} (JSON ${REPARTO_VERSION})`,
            widgetId: CAST_TABLE_WIDGET_ID,
            rows: [],
            repartoPath: pathCfg,
            expectedSettingKeys: { path: SETTING_PATH },
        };
    }

    dispose(): void {
        this.configSub.dispose();
        this._onDidChange.dispose();
        RepartoElencoService.instance = undefined;
    }
}
