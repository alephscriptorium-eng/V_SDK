import * as vscode from 'vscode';
import { RoomIdentityService } from './RoomIdentityService';
import type { IdentitySnapshot } from './types';

/**
 * Status bar: ssbId visible cuando ready; ⏳ si sin card/seat/settings.
 */
export class IdentityStatusBar implements vscode.Disposable {
    private readonly item: vscode.StatusBarItem;
    private readonly sub: vscode.Disposable;

    constructor(private readonly identity: RoomIdentityService = RoomIdentityService.getInstance()) {
        this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 88);
        this.item.command = 'aleph0.identity.join';
        this.sub = this.identity.onDidChange((snap) => this.render(snap));
        this.render(this.identity.getSnapshot());
        this.item.show();
    }

    private render(snap: IdentitySnapshot): void {
        if (snap.availability === 'ready' && snap.ssbId) {
            const short =
                snap.ssbId.length > 28 ? `${snap.ssbId.slice(0, 12)}…${snap.ssbId.slice(-10)}` : snap.ssbId;
            this.item.text = `$(account) ${short}`;
            this.item.tooltip = `Aleph-0 identidad\nssbId: ${snap.ssbId}\nroom: ${snap.roomId}\nphase: ${snap.phase}\n(join #${snap.joinCount})`;
            this.item.backgroundColor = undefined;
            return;
        }
        this.item.text = `$(account) ⏳ identidad`;
        this.item.tooltip = snap.statusMessage;
        this.item.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    }

    dispose(): void {
        this.sub.dispose();
        this.item.dispose();
    }
}
