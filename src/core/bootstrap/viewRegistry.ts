/**
 * WP-V80 · DATOS del bootstrap — tabla declarativa de vistas.
 *
 * Cada fila declara UNA contribución de superficie (tree view, webview view
 * o editor custom) con su id, su proveedor (selector sobre el contexto) y
 * sus opciones. El orden de la tabla ES el orden de registro del monolito
 * original (`setupTreeViews`), preservado fila a fila.
 */
import * as vscode from 'vscode';
import { ExtensionContext } from './context';
import { TeatroWebViewProvider } from '../../views/TeatroWebViewProvider';
import { HackerControlPanelProvider } from '../../views/HackerControlPanelProvider';
import { HackerCommandPanelProvider } from '../../views/HackerCommandPanelProvider';
import { HackerConfigPanelProvider } from '../../views/HackerConfigPanelProvider';
import { HackerTasksPanelProvider } from '../../views/HackerTasksPanelProvider';

/** Opciones comunes de todos los tree views del monolito original. */
const TREE_VIEW_OPTIONS = {
    showCollapseAll: true,
    canSelectMany: false
} as const;

/** Opciones comunes de los dos editores custom del monolito original. */
const CUSTOM_EDITOR_OPTIONS = {
    webviewOptions: {
        retainContextWhenHidden: true,
        enableFindWidget: true
    },
    supportsMultipleEditorsPerDocument: false
} as const;

export type ViewRegistration =
    | {
          kind: 'treeView';
          viewId: string;
          provider: (ctx: ExtensionContext) => vscode.TreeDataProvider<any>;
          options: typeof TREE_VIEW_OPTIONS;
      }
    | {
          kind: 'webviewView';
          viewType: string;
          provider: (ctx: ExtensionContext) => vscode.WebviewViewProvider;
      }
    | {
          kind: 'customEditor';
          viewType: string;
          provider: (
              ctx: ExtensionContext
          ) => vscode.CustomTextEditorProvider | vscode.CustomReadonlyEditorProvider;
          options: typeof CUSTOM_EDITOR_OPTIONS;
      };

/**
 * Tabla de vistas — mismo orden de registro que el monolito:
 * teatro (tree) · teatro (webview) · 4 paneles hacker (webview) ·
 * 2 editores de agente (custom) · 6 tree views de gamificación/dominio.
 */
export const viewRegistrations: ViewRegistration[] = [
    {
        kind: 'treeView',
        viewId: 'alephscript.teatro',
        provider: ctx => ctx.teatroTreeProvider,
        options: TREE_VIEW_OPTIONS
    },
    {
        kind: 'webviewView',
        viewType: TeatroWebViewProvider.viewType,
        provider: ctx => ctx.teatroWebViewProvider
    },
    {
        kind: 'webviewView',
        viewType: HackerControlPanelProvider.viewType,
        provider: ctx => ctx.hackerControlPanelProvider
    },
    {
        kind: 'webviewView',
        viewType: HackerCommandPanelProvider.viewType,
        provider: ctx => ctx.hackerCommandPanelProvider
    },
    {
        kind: 'webviewView',
        viewType: HackerConfigPanelProvider.viewType,
        provider: ctx => ctx.hackerConfigPanelProvider
    },
    {
        kind: 'webviewView',
        viewType: HackerTasksPanelProvider.viewType,
        provider: ctx => ctx.hackerTasksPanelProvider
    },
    {
        kind: 'customEditor',
        viewType: 'alephscript.agentContentEditor',
        provider: ctx => ctx.agentContentEditor,
        options: CUSTOM_EDITOR_OPTIONS
    },
    {
        kind: 'customEditor',
        viewType: 'alephscript.agentConfigEditor',
        provider: ctx => ctx.agentConfigEditor,
        options: CUSTOM_EDITOR_OPTIONS
    },
    {
        kind: 'treeView',
        viewId: 'alephscript.sockets',
        provider: ctx => ctx.socketsTreeProvider,
        options: TREE_VIEW_OPTIONS
    },
    {
        kind: 'treeView',
        viewId: 'alephscript.uis',
        provider: ctx => ctx.uisTreeProvider,
        options: TREE_VIEW_OPTIONS
    },
    {
        kind: 'treeView',
        viewId: 'alephscript.configs',
        provider: ctx => ctx.configsTreeProvider,
        options: TREE_VIEW_OPTIONS
    },
    {
        kind: 'treeView',
        viewId: 'alephscript.logs',
        provider: ctx => ctx.logsTreeProvider,
        options: TREE_VIEW_OPTIONS
    },
    {
        kind: 'treeView',
        viewId: 'alephscript.mcptree',
        provider: ctx => ctx.mcpTreeProvider,
        options: TREE_VIEW_OPTIONS
    },
    {
        kind: 'treeView',
        viewId: 'alephscript.elenco',
        provider: ctx => ctx.elencoTreeProvider,
        options: TREE_VIEW_OPTIONS
    },
    {
        kind: 'treeView',
        viewId: 'alephscript.experiencia',
        provider: ctx => ctx.experienciaTreeProvider,
        options: TREE_VIEW_OPTIONS
    },
    {
        kind: 'webviewView',
        viewType: 'alephscript.experiencia.webview',
        provider: ctx => ctx.experienciaWebViewProvider
    }
];

/**
 * Intérprete de una fila (flujo mínimo, sin datos): registra la contribución
 * contra la API de VS Code y devuelve su Disposable.
 */
export function registerViewContribution(
    entry: ViewRegistration,
    ctx: ExtensionContext
): vscode.Disposable {
    switch (entry.kind) {
        case 'treeView':
            return vscode.window.createTreeView(entry.viewId, {
                treeDataProvider: entry.provider(ctx),
                ...entry.options
            });
        case 'webviewView':
            return vscode.window.registerWebviewViewProvider(
                entry.viewType,
                entry.provider(ctx)
            );
        case 'customEditor':
            return vscode.window.registerCustomEditorProvider(
                entry.viewType,
                entry.provider(ctx),
                entry.options
            );
    }
}
