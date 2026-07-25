import * as vscode from 'vscode';
import { RoomIdentityService } from '../identity/RoomIdentityService';
import { LineaEditorClient } from './LineaEditorClient';
import {
    extractMotivoFromDeny,
    isDeniedWithoutWrite,
    parseEditorInfo,
    representMotivoDeny
} from './parseEditorInfo';
import { resolveLineaEditorEndpoint } from './settings';
import {
    emptyAuthorshipSnapshot,
    TOOL_CREAR_LINEA,
    TOOL_EXPORT_STORY_BOARD,
    type AuthorshipSnapshot,
    type MutationCallResult
} from './types';

/**
 * Autoría linea-editor (WP-V08): lee gate/motivos_deny de editor://info,
 * llama crear_linea / export_story_board, representa deny en UI sin ocultar gate.
 */
export class AuthorshipService implements vscode.Disposable {
    private static instance: AuthorshipService | undefined;

    private readonly client = new LineaEditorClient();
    private readonly _onDidChange = new vscode.EventEmitter<AuthorshipSnapshot>();
    readonly onDidChange = this._onDidChange.event;

    private snapshot: AuthorshipSnapshot = emptyAuthorshipSnapshot(
        'pending_settings',
        '⏳ autoría no sincronizada'
    );
    private refreshInFlight: Promise<AuthorshipSnapshot> | undefined;

    static getInstance(): AuthorshipService {
        if (!AuthorshipService.instance) {
            AuthorshipService.instance = new AuthorshipService();
        }
        return AuthorshipService.instance;
    }

    static resetInstanceForTests(): void {
        AuthorshipService.instance?.dispose();
        AuthorshipService.instance = undefined;
    }

    getSnapshot(): AuthorshipSnapshot {
        return this.snapshot;
    }

    /** Motivos actuales desde último editor://info (nunca hardcodeados). */
    getMotivosDenyFromRuntime(): string[] {
        return this.snapshot.gate?.motivosDeny ?? [];
    }

    async refreshGate(): Promise<AuthorshipSnapshot> {
        if (this.refreshInFlight) {
            return this.refreshInFlight;
        }
        this.refreshInFlight = this.doRefresh().finally(() => {
            this.refreshInFlight = undefined;
        });
        return this.refreshInFlight;
    }

    /**
     * crear_linea gateado. Deny del servidor ⇒ sin efecto colateral local.
     */
    async crearLinea(input: {
        id: string;
        approve: boolean;
        approvalToken: string;
        etiqueta?: string;
        personajeId?: string;
        reparto?: Record<string, unknown>;
        includeSessionCard?: boolean;
    }): Promise<MutationCallResult> {
        return this.callTool(TOOL_CREAR_LINEA, {
            id: input.id,
            approve: input.approve,
            approvalToken: input.approvalToken,
            etiqueta: input.etiqueta,
            personajeId: input.personajeId,
            reparto: input.reparto,
            card: input.includeSessionCard
                ? RoomIdentityService.getInstance().getSessionCardRaw()
                : undefined
        });
    }

    async exportStoryBoard(input: {
        lineDir: string;
        approve: boolean;
        approvalToken: string;
        outPath?: string;
        personajeId?: string;
        reparto?: Record<string, unknown>;
        includeSessionCard?: boolean;
    }): Promise<MutationCallResult> {
        return this.callTool(TOOL_EXPORT_STORY_BOARD, {
            lineDir: input.lineDir,
            approve: input.approve,
            approvalToken: input.approvalToken,
            outPath: input.outPath,
            personajeId: input.personajeId,
            reparto: input.reparto,
            card: input.includeSessionCard
                ? RoomIdentityService.getInstance().getSessionCardRaw()
                : undefined
        });
    }

    /** Mensaje UI con gate + motivo (textual desde runtime). */
    formatDenyForUi(result: MutationCallResult): string {
        const known = this.getMotivosDenyFromRuntime();
        const motivo = result.motivo
            ? representMotivoDeny(result.motivo, known)
            : result.error || result.rule || 'deny';
        const gateLine =
            result.gate &&
            typeof result.gate === 'object' &&
            !Array.isArray(result.gate) &&
            typeof (result.gate as Record<string, unknown>).gate_line === 'string'
                ? String((result.gate as Record<string, unknown>).gate_line)
                : this.snapshot.gate?.gateLine || '';
        const tools = this.snapshot.mutationTools.join(', ') || result.tool;
        return [
            `⛔ mutación denegada · ${result.tool}`,
            gateLine ? `gate: ${gateLine}` : '',
            motivo,
            result.rule ? `rule: ${result.rule}` : '',
            result.deniedWithoutWrite ? 'sin efecto de escritura (deny pre-write)' : '',
            `tools: ${tools}`,
            known.length
                ? `motivos_deny (runtime): ${known.join(' · ')}`
                : '⏳ motivos_deny no leídos aún'
        ]
            .filter(Boolean)
            .join('\n');
    }

    dispose(): void {
        this._onDidChange.dispose();
    }

    private async doRefresh(): Promise<AuthorshipSnapshot> {
        const endpoint = resolveLineaEditorEndpoint();
        if (!endpoint.configured || !endpoint.host || endpoint.port === undefined) {
            return this.publish(
                emptyAuthorshipSnapshot(
                    endpoint.reason?.includes('catálogo') ? 'pending_catalog' : 'pending_settings',
                    endpoint.reason || '⏳ linea-editor sin endpoint'
                )
            );
        }

        const read = await this.client.readEditorInfo(endpoint.host, endpoint.port);
        if (!read.ok) {
            return this.publish(
                emptyAuthorshipSnapshot(
                    'pending_editor',
                    `⏳ linea-editor ausente (${endpoint.host}:${endpoint.port})`,
                    {
                        host: endpoint.host,
                        port: endpoint.port,
                        lastError: read.error
                    }
                )
            );
        }

        const parsed = parseEditorInfo(read.data);
        if (!parsed.ok || !parsed.gate) {
            return this.publish(
                emptyAuthorshipSnapshot(
                    'pending_info',
                    parsed.pendingReason || '⏳ editor://info incompleto',
                    {
                        host: endpoint.host,
                        port: endpoint.port,
                        mutationTools: parsed.mutationTools,
                        gate: parsed.gate,
                        requireRepartoLive: parsed.requireRepartoLive
                    }
                )
            );
        }

        const n = parsed.gate.motivosDeny.length;
        const policy = parsed.requireRepartoLive
            ? `${parsed.gate.repartoPolicyEnv}=ON`
            : `${parsed.gate.repartoPolicyEnv}=off (demo verde/rojo ⏳ si flag ausente)`;

        return this.publish({
            availability: 'ready',
            statusMessage: `autoría · ${n} motivo(s) deny desde editor://info · ${policy}`,
            host: endpoint.host,
            port: endpoint.port,
            mutationTools: parsed.mutationTools.length
                ? parsed.mutationTools
                : [TOOL_CREAR_LINEA, TOOL_EXPORT_STORY_BOARD],
            gate: parsed.gate,
            requireRepartoLive: parsed.requireRepartoLive,
            fetchedAt: new Date().toISOString()
        });
    }

    private async callTool(
        tool: string,
        args: Record<string, unknown>
    ): Promise<MutationCallResult> {
        const endpoint = resolveLineaEditorEndpoint();
        if (!endpoint.configured || !endpoint.host || endpoint.port === undefined) {
            return {
                ok: false,
                tool,
                gate: this.snapshot.gate,
                error: endpoint.reason || '⏳ sin endpoint',
                deniedWithoutWrite: true,
                raw: null
            };
        }

        // Quitar undefined para no enviar campos omitidos (hostil-omite limpio).
        const cleaned: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(args)) {
            if (v !== undefined) {
                cleaned[k] = v;
            }
        }

        const res = await this.client.callMutationTool(
            endpoint.host,
            endpoint.port,
            tool,
            cleaned
        );
        if (!res.ok) {
            return {
                ok: false,
                tool,
                gate: this.snapshot.gate,
                error: res.error,
                deniedWithoutWrite: true,
                raw: null
            };
        }

        const data = res.data;
        const denied = isDeniedWithoutWrite(data);
        const okFlag =
            data != null &&
            typeof data === 'object' &&
            (data as Record<string, unknown>).ok === true;
        const gate =
            data != null && typeof data === 'object'
                ? (data as Record<string, unknown>).gate
                : undefined;
        const rule =
            data != null &&
            typeof data === 'object' &&
            typeof (data as Record<string, unknown>).rule === 'string'
                ? String((data as Record<string, unknown>).rule)
                : undefined;
        const error =
            data != null &&
            typeof data === 'object' &&
            typeof (data as Record<string, unknown>).error === 'string'
                ? String((data as Record<string, unknown>).error)
                : undefined;

        return {
            ok: okFlag,
            tool,
            gate: gate ?? this.snapshot.gate,
            rule,
            error,
            motivo: extractMotivoFromDeny(data),
            deniedWithoutWrite: denied || !okFlag,
            raw: data
        };
    }

    private publish(next: AuthorshipSnapshot): AuthorshipSnapshot {
        this.snapshot = next;
        this._onDidChange.fire(next);
        return next;
    }
}
