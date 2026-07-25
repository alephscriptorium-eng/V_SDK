import * as vscode from 'vscode';
import { LauncherCatalogClient } from './LauncherCatalogClient';
import type { CatalogSnapshot } from './types';
import { emptyPendingSnapshot } from './types';

const DEFAULT_POLL_MS = 15_000;

/**
 * Feed singleton: snapshot en caliente del catálogo launcher.
 * UI (árbol MCP / tasks) se suscribe; sin launcher → ⏳ honesto.
 */
export class CatalogService implements vscode.Disposable {
    private static instance: CatalogService | undefined;

    private readonly client = new LauncherCatalogClient();
    private readonly _onDidChange = new vscode.EventEmitter<CatalogSnapshot>();
    readonly onDidChange = this._onDidChange.event;

    private snapshot: CatalogSnapshot = emptyPendingSnapshot(
        'pending_settings',
        '⏳ catálogo no refrescado aún'
    );
    private pollTimer: ReturnType<typeof setInterval> | undefined;
    private refreshInFlight: Promise<CatalogSnapshot> | undefined;
    private started = false;

    static getInstance(): CatalogService {
        if (!CatalogService.instance) {
            CatalogService.instance = new CatalogService();
        }
        return CatalogService.instance;
    }

    /** Solo tests / worktree isolation */
    static resetInstanceForTests(): void {
        CatalogService.instance?.dispose();
        CatalogService.instance = undefined;
    }

    getSnapshot(): CatalogSnapshot {
        return this.snapshot;
    }

    start(pollMs: number = DEFAULT_POLL_MS): void {
        if (this.started) {
            return;
        }
        this.started = true;
        void this.refresh();
        this.pollTimer = setInterval(() => {
            void this.refresh();
        }, pollMs);
    }

    async refresh(): Promise<CatalogSnapshot> {
        if (this.refreshInFlight) {
            return this.refreshInFlight;
        }
        this.refreshInFlight = this.client
            .fetchSnapshot()
            .then((next) => {
                this.snapshot = next;
                this._onDidChange.fire(next);
                return next;
            })
            .finally(() => {
                this.refreshInFlight = undefined;
            });
        return this.refreshInFlight;
    }

    resolveCapability(capability: string) {
        return this.client.resolveCapability(capability);
    }

    dispose(): void {
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = undefined;
        }
        this._onDidChange.dispose();
        this.started = false;
    }
}
