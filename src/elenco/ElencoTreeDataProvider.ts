/**
 * Panel elenco (WP-V09) — TreeView `alephscript.elenco`.
 * Filas = proyección cast-table desde reparto/1.
 * Zona UI disjunta de alephscript.teatro (ICompany).
 */
import * as vscode from 'vscode';
import { RepartoElencoService } from './RepartoElencoService';
import type { CastTableRow, ElencoSnapshot } from './types';
import { CAST_TABLE_WIDGET_ALIAS, CAST_TABLE_WIDGET_ID } from './types';

export interface ElencoTreeItem {
    id: string;
    label: string;
    description?: string;
    tooltip?: string;
    iconPath?: vscode.ThemeIcon;
    children?: ElencoTreeItem[];
}

export class ElencoTreeDataProvider
    implements vscode.TreeDataProvider<ElencoTreeItem>, vscode.Disposable
{
    private readonly _onDidChangeTreeData = new vscode.EventEmitter<
        ElencoTreeItem | undefined | null | void
    >();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
    private readonly sub: vscode.Disposable;

    constructor(private readonly elencoService: RepartoElencoService) {
        this.sub = this.elencoService.onDidChange(() => this.refresh());
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    dispose(): void {
        this.sub.dispose();
        this._onDidChangeTreeData.dispose();
    }

    getTreeItem(element: ElencoTreeItem): vscode.TreeItem {
        const item = new vscode.TreeItem(
            element.label,
            element.children?.length
                ? vscode.TreeItemCollapsibleState.Expanded
                : vscode.TreeItemCollapsibleState.None
        );
        item.id = element.id;
        item.description = element.description;
        item.tooltip = element.tooltip;
        item.iconPath = element.iconPath;
        return item;
    }

    getChildren(element?: ElencoTreeItem): ElencoTreeItem[] {
        if (element) {
            return element.children ?? [];
        }
        return this.buildRoots(this.elencoService.getSnapshot());
    }

    private buildRoots(snap: ElencoSnapshot): ElencoTreeItem[] {
        const header: ElencoTreeItem = {
            id: 'elenco-header',
            label: `Elenco · ${snap.widgetId}`,
            description: snap.availability === 'ready' ? 'ready' : '⏳',
            tooltip: [
                snap.statusMessage,
                `widget: ${CAST_TABLE_WIDGET_ID} (alias ${CAST_TABLE_WIDGET_ALIAS})`,
                'Modelo A · reparto/1 — SEPARADO de ICompany',
            ].join('\n'),
            iconPath: new vscode.ThemeIcon(
                snap.availability === 'ready' ? 'organization' : 'clock'
            ),
            children: [],
        };

        if (snap.availability !== 'ready') {
            header.children = [
                {
                    id: 'elenco-pending',
                    label: snap.statusMessage,
                    iconPath: new vscode.ThemeIcon('warning'),
                },
            ];
            return [header];
        }

        header.children = snap.rows.map((row, i) => this.rowItem(row, i));
        if (header.children.length === 0) {
            header.children = [
                {
                    id: 'elenco-empty',
                    label: 'elenco vacío',
                    description: 'reparto sin personajes',
                    iconPath: new vscode.ThemeIcon('circle-slash'),
                },
            ];
        }
        return [header];
    }

    private rowItem(row: CastTableRow, index: number): ElencoTreeItem {
        const participant = row.participant || '—';
        const role = row.role || '—';
        const oldid = row.oldid || '—';
        return {
            id: `cast-row-${index}-${oldid}`,
            label: `${participant}`,
            description: `${role} · ${oldid}`,
            tooltip: [
                `participant: ${participant}`,
                `role: ${role}`,
                `oldid: ${oldid}`,
                'schema: cast-table ← filasCastDesdeReparto',
            ].join('\n'),
            iconPath: new vscode.ThemeIcon(
                row.participant ? 'person' : 'person-add'
            ),
        };
    }
}
