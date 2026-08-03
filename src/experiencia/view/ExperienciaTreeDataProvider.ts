/**
 * RH-17 · TreeView diagnóstico `alephscript.experiencia`.
 * Proyecta fase + superficies desde ExperienciaSession; sin Teatro.
 */

import * as vscode from 'vscode';
import { ExperienciaSession } from './ExperienciaSession';
import { buildExperienciaViewModel } from './experienciaModel';
import type { ExperienciaPhase } from '../types';

export interface ExperienciaTreeItem {
    id: string;
    label: string;
    description?: string;
    tooltip?: string;
    iconPath?: vscode.ThemeIcon;
    children?: ExperienciaTreeItem[];
}

function phaseIcon(phase: ExperienciaPhase): vscode.ThemeIcon {
    switch (phase) {
        case 'complete':
            return new vscode.ThemeIcon('pass');
        case 'connected':
            return new vscode.ThemeIcon('debug-connect');
        case 'pending_external_contract':
            return new vscode.ThemeIcon('info');
        case 'failed':
            return new vscode.ThemeIcon('error');
        case 'connecting':
        default:
            return new vscode.ThemeIcon('loading~spin');
    }
}

export class ExperienciaTreeDataProvider
    implements vscode.TreeDataProvider<ExperienciaTreeItem>, vscode.Disposable
{
    private readonly _onDidChangeTreeData = new vscode.EventEmitter<
        ExperienciaTreeItem | undefined | null | void
    >();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
    private readonly sub: vscode.Disposable;

    constructor(private readonly session: ExperienciaSession) {
        this.sub = this.session.onDidChange(() => this.refresh());
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    dispose(): void {
        this.sub.dispose();
        this._onDidChangeTreeData.dispose();
    }

    getTreeItem(element: ExperienciaTreeItem): vscode.TreeItem {
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

    getChildren(element?: ExperienciaTreeItem): ExperienciaTreeItem[] {
        if (element) {
            return element.children ?? [];
        }
        return this.buildRoots();
    }

    private buildRoots(): ExperienciaTreeItem[] {
        const snap = this.session.getSnapshot();
        const model = buildExperienciaViewModel(snap);
        const tools = this.session.getTools();

        const phase: ExperienciaTreeItem = {
            id: 'exp-phase',
            label: `Fase · ${model.phase}`,
            description: model.transportPending ? 'transport ⏳' : model.fresh ? 'fresh' : 'stale',
            tooltip: model.reason,
            iconPath: phaseIcon(model.phase),
            children: [
                {
                    id: 'exp-reason',
                    label: model.reason,
                    iconPath: new vscode.ThemeIcon('comment')
                },
                {
                    id: 'exp-server',
                    label: `server: ${model.serverLabel}`,
                    iconPath: new vscode.ThemeIcon('server')
                }
            ]
        };

        const surfaces: ExperienciaTreeItem = {
            id: 'exp-surfaces',
            label: 'Superficies',
            description: `${model.surfaces.length}`,
            iconPath: new vscode.ThemeIcon('list-tree'),
            children: model.surfaces.map((s) => ({
                id: `exp-s-${s.id}`,
                label: s.label,
                description: s.value,
                tooltip: `status: ${s.status}`,
                iconPath: new vscode.ThemeIcon(
                    s.status === 'ok'
                        ? 'check'
                        : s.status === 'external'
                          ? 'info'
                          : s.status === 'error'
                            ? 'error'
                            : 'clock'
                )
            }))
        };

        const escena: ExperienciaTreeItem = {
            id: 'exp-escena',
            label: 'Escena',
            description: model.escena.disponible ? 'disponible' : '⏳',
            tooltip: model.escena.stageStatus,
            iconPath: new vscode.ThemeIcon(
                model.escena.disponible ? 'map' : 'map-filled'
            ),
            children: [
                {
                    id: 'exp-escena-status',
                    label: model.escena.stageStatus,
                    description: model.escena.sesionId
                        ? `sesion ${model.escena.sesionId}`
                        : undefined
                }
            ]
        };

        const gaps: ExperienciaTreeItem = {
            id: 'exp-gaps',
            label: 'pending_external',
            description: `${model.pendingExternal.length}`,
            iconPath: new vscode.ThemeIcon('warning'),
            children:
                model.pendingExternal.length > 0
                    ? model.pendingExternal.map((g, i) => ({
                          id: `exp-gap-${i}`,
                          label: g,
                          iconPath: new vscode.ThemeIcon('circle-outline')
                      }))
                    : [
                          {
                              id: 'exp-gap-none',
                              label: 'ninguno en snapshot',
                              iconPath: new vscode.ThemeIcon('check')
                          }
                      ]
        };

        const toolsNode: ExperienciaTreeItem = {
            id: 'exp-tools',
            label: 'Tools MCP',
            description: `${tools.length}`,
            iconPath: new vscode.ThemeIcon('tools'),
            children:
                tools.length > 0
                    ? tools.map((t) => ({
                          id: `exp-tool-${t.name}`,
                          label: t.name,
                          description: t.description,
                          tooltip: 'comando = tool MCP publicado',
                          iconPath: new vscode.ThemeIcon('play')
                      }))
                    : [
                          {
                              id: 'exp-tools-empty',
                              label: model.transportPending
                                  ? '⏳ transport producto <pendiente>'
                                  : 'sin tools listados',
                              iconPath: new vscode.ThemeIcon('clock')
                          }
                      ]
        };

        return [phase, surfaces, escena, gaps, toolsNode];
    }
}
