/**
 * WP-V28 · Lecturas de los dos resources del CA, con contrato citado
 * (z-sdk, READ-ONLY — `C:\S_LAB\z-sdk`):
 *
 * `editor://info` — packages/mesh/linea-editor/src/editor-server.mjs:135
 * (uri), :137 (`mimeType: 'application/json'`); forma en `editorInfo()`
 * :83-128: `{ name, version, lineasRoot, mutationTools[], gate{...},
 * personajes, frontier }`.
 *
 * `launcher://catalog` — packages/mesh/mcp-launcher/src/launcher-server.mjs:42
 * (uri), :44 (`mimeType`); forma :46-56:
 * `{ servers: [{ id, name, port, workspace, spawnGroup, capabilities, tree }] }`.
 *
 * Validación mínima de forma (no política): la política del gate de
 * `editor://info` es de `src/mutation/parseEditorInfo.ts` (fase 4); la
 * normalización rica del catálogo es de `src/launcher/`. Aquí solo se
 * garantiza que lo leído ES lo citado — si no, fallo tipado, jamás datos
 * inventados.
 */

import type { CatalogServerEntry } from '../launcher/types';
import type { MinimalMcpClient } from './client';
import { mcpFailure, McpClientResult } from './types';

/** URI citada: editor-server.mjs:135. */
export const EDITOR_INFO_URI = 'editor://info';

/** URI citada: launcher-server.mjs:42. */
export const LAUNCHER_CATALOG_URI = 'launcher://catalog';

/** Forma citada de editor://info (editorInfo(), editor-server.mjs:83-128). */
export interface EditorInfoContrato {
    name: string;
    version?: string;
    lineasRoot?: string;
    mutationTools: string[];
    gate: Record<string, unknown>;
    [k: string]: unknown;
}

/** Forma citada de launcher://catalog (launcher-server.mjs:46-56). */
export interface LauncherCatalogContrato {
    servers: CatalogServerEntry[];
}

/** Lee y valida la forma de editor://info. */
export async function readEditorInfo(
    client: MinimalMcpClient
): Promise<McpClientResult<EditorInfoContrato>> {
    const res = await client.readResourceJson(EDITOR_INFO_URI);
    if (!res.ok) {
        return res;
    }
    const o = asRecord(res.data);
    if (o === null || typeof o.name !== 'string') {
        return mcpFailure(
            'contrato_invalido',
            `${EDITOR_INFO_URI} sin campo \`name\` string (editor-server.mjs:84)`
        );
    }
    if (!Array.isArray(o.mutationTools)) {
        return mcpFailure(
            'contrato_invalido',
            `${EDITOR_INFO_URI} sin array \`mutationTools\` (editor-server.mjs:87)`
        );
    }
    const gate = asRecord(o.gate);
    if (gate === null) {
        return mcpFailure(
            'contrato_invalido',
            `${EDITOR_INFO_URI} sin objeto \`gate\` (editor-server.mjs:88)`
        );
    }
    return {
        ok: true,
        data: {
            ...o,
            name: o.name,
            mutationTools: o.mutationTools.filter(
                (t): t is string => typeof t === 'string'
            ),
            gate
        }
    };
}

/** Lee y valida la forma de launcher://catalog. */
export async function readLauncherCatalog(
    client: MinimalMcpClient
): Promise<McpClientResult<LauncherCatalogContrato>> {
    const res = await client.readResourceJson(LAUNCHER_CATALOG_URI);
    if (!res.ok) {
        return res;
    }
    const o = asRecord(res.data);
    const servers = o?.servers;
    if (!Array.isArray(servers)) {
        return mcpFailure(
            'contrato_invalido',
            `${LAUNCHER_CATALOG_URI} sin array \`servers\` (launcher-server.mjs:47)`
        );
    }
    const out: CatalogServerEntry[] = [];
    for (const raw of servers) {
        const e = asRecord(raw);
        if (e === null || typeof e.id !== 'string' || e.id === '') {
            return mcpFailure(
                'contrato_invalido',
                `${LAUNCHER_CATALOG_URI} con entrada sin \`id\` string (launcher-server.mjs:48-49)`
            );
        }
        out.push({
            id: e.id,
            name: typeof e.name === 'string' ? e.name : e.id,
            port: typeof e.port === 'number' ? e.port : undefined,
            workspace: typeof e.workspace === 'string' ? e.workspace : undefined,
            spawnGroup: typeof e.spawnGroup === 'string' ? e.spawnGroup : undefined,
            capabilities: Array.isArray(e.capabilities)
                ? e.capabilities.filter((c): c is string => typeof c === 'string')
                : undefined,
            tree: (e.tree as CatalogServerEntry['tree']) ?? null
        });
    }
    return { ok: true, data: { servers: out } };
}

function asRecord(v: unknown): Record<string, unknown> | null {
    return v !== null && typeof v === 'object' && !Array.isArray(v)
        ? (v as Record<string, unknown>)
        : null;
}
