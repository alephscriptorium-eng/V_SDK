/**
 * RH-16 · Servicio experiencia H + fixtures MCP + env producto H_SDK_MCP_*.
 */

import { MinimalMcpClient } from '../../../src/mcp/client';
import { ExperienciaHService } from '../../../src/experiencia/ExperienciaHService';
import {
    mergeCatalogWithHEnv,
    readHExperienceEnv
} from '../../../src/experiencia/catalogFromEnv';
import { discoverHExperienceServer } from '../../../src/experiencia/discover';
import {
    URI_EXPERIENCIA_ESCENA,
    URI_EXPERIENCIA_ESTADO,
    URI_EXPERIENCIA_EVIDENCIA
} from '../../../src/experiencia/types';
import type { CatalogServerEntry } from '../../../src/launcher/types';
import {
    fixtureEstadoCompleteSintetico,
    fixtureEscenaDisponible,
    fixtureEvidenciaVerificada,
    startFixtureExperienciaH
} from './fixtureExperienciaH';

describe('RH-16 · discoverHExperienceServer', () => {
    it('encuentra por id h-sdk / capability', () => {
        const byId: CatalogServerEntry[] = [
            { id: 'linea-editor', name: 'linea-editor', port: 1 },
            { id: 'h-sdk', name: 'prueba-hm', port: 2, capabilities: ['h.experiencia'] }
        ];
        expect(discoverHExperienceServer(byId)?.id).toBe('h-sdk');

        const byCap: CatalogServerEntry[] = [
            { id: 'other', name: 'other', port: 3, capabilities: ['h.experiencia'] }
        ];
        expect(discoverHExperienceServer(byCap)?.id).toBe('other');
    });

    it('sin fila → undefined (no inventa)', () => {
        expect(discoverHExperienceServer([{ id: 'linea-editor', name: 'x', port: 1 }])).toBeUndefined();
    });
});

describe('RH-16 · ExperienciaHService', () => {
    it('sin servidor H en catálogo → connecting + transportPending', async () => {
        const prevHost = process.env.H_SDK_MCP_HOST;
        const prevPort = process.env.H_SDK_MCP_PORT;
        delete process.env.H_SDK_MCP_HOST;
        delete process.env.H_SDK_MCP_PORT;
        try {
            const svc = new ExperienciaHService();
            const snap = await svc.refresh({
                catalogServers: [{ id: 'linea-editor', name: 'linea-editor', port: 3051 }],
                host: '127.0.0.1'
            });
            expect(snap.phase).toBe('connecting');
            expect(snap.transportPending).toBe(true);
            expect(snap.reason).toMatch(/catálogo|transport ausente|H_SDK_MCP/);
            expect(snap.phase).not.toBe('connected');
            expect(snap.phase).not.toBe('complete');
        } finally {
            if (prevHost === undefined) delete process.env.H_SDK_MCP_HOST;
            else process.env.H_SDK_MCP_HOST = prevHost;
            if (prevPort === undefined) delete process.env.H_SDK_MCP_PORT;
            else process.env.H_SDK_MCP_PORT = prevPort;
        }
    });

    it('fixture MCP actual H → pending_external_contract (no complete)', async () => {
        const fixture = await startFixtureExperienciaH();
        try {
            const client = new MinimalMcpClient({ host: fixture.host, port: fixture.port });
            const svc = new ExperienciaHService();
            const snap = await svc.refresh({
                catalogServers: [],
                host: fixture.host,
                fixtureClient: client,
                fixtureServerId: 'h-sdk'
            });
            expect(snap.phase).toBe('pending_external_contract');
            expect(snap.fresh).toBe(true);
            expect(snap.pendingExternal.length).toBeGreaterThan(0);
            expect(snap.payloads?.estado.resourceVersion).toBe('0.1.0');
            expect(snap.phase).not.toBe('complete');
            expect(snap.phase).not.toBe('connected');
        } finally {
            await fixture.close();
        }
    });

    it('descubrimiento por catálogo + puerto del fixture → misma fase', async () => {
        const fixture = await startFixtureExperienciaH();
        try {
            const catalog: CatalogServerEntry[] = [
                {
                    id: 'h-sdk',
                    name: 'prueba-hm',
                    port: fixture.port,
                    capabilities: ['h.experiencia']
                }
            ];
            const svc = new ExperienciaHService();
            const snap = await svc.refresh({
                catalogServers: catalog,
                host: fixture.host
            });
            expect(snap.phase).toBe('pending_external_contract');
            expect(snap.serverId).toBe('h-sdk');
            expect(snap.transportPending).toBe(false);
        } finally {
            await fixture.close();
        }
    });

    it('hostil-omite: resource omitido → failed (no connected)', async () => {
        const fixture = await startFixtureExperienciaH({
            omitUris: [URI_EXPERIENCIA_EVIDENCIA]
        });
        try {
            const client = new MinimalMcpClient({ host: fixture.host, port: fixture.port });
            const svc = new ExperienciaHService();
            const snap = await svc.refresh({
                catalogServers: [],
                host: fixture.host,
                fixtureClient: client
            });
            expect(snap.phase).toBe('failed');
            expect(snap.reason).toContain('omitido');
            expect(snap.phase).not.toBe('connected');
        } finally {
            await fixture.close();
        }
    });

    it('hostil-omite: version ausente en payload → failed', async () => {
        const bad = {
            estado: 'idle',
            pending_external: [],
            acople: { ciudad: 'a', delta: 'b', m: 'c' }
        };
        const fixture = await startFixtureExperienciaH({
            resourceOverrides: { [URI_EXPERIENCIA_ESTADO]: bad }
        });
        try {
            const client = new MinimalMcpClient({ host: fixture.host, port: fixture.port });
            const svc = new ExperienciaHService();
            const snap = await svc.refresh({
                catalogServers: [],
                host: fixture.host,
                fixtureClient: client
            });
            expect(snap.phase).toBe('failed');
            expect(snap.reason).toContain('resourceVersion');
        } finally {
            await fixture.close();
        }
    });

    it('camino complete sintético fresco (no representa H vivo)', async () => {
        const fixture = await startFixtureExperienciaH({
            resourceOverrides: {
                [URI_EXPERIENCIA_ESTADO]: fixtureEstadoCompleteSintetico(),
                [URI_EXPERIENCIA_ESCENA]: fixtureEscenaDisponible(),
                [URI_EXPERIENCIA_EVIDENCIA]: fixtureEvidenciaVerificada()
            }
        });
        try {
            const client = new MinimalMcpClient({ host: fixture.host, port: fixture.port });
            const svc = new ExperienciaHService();
            const snap = await svc.refresh({
                catalogServers: [],
                host: fixture.host,
                fixtureClient: client
            });
            expect(snap.phase).toBe('complete');
            expect(snap.fresh).toBe(true);
            expect(snap.pendingExternal).toEqual([]);
        } finally {
            await fixture.close();
        }
    });

    it('servidor H sin puerto → connecting transportPending', async () => {
        const svc = new ExperienciaHService();
        const snap = await svc.refresh({
            catalogServers: [{ id: 'prueba-hm', name: 'prueba-hm' }],
            host: '127.0.0.1'
        });
        expect(snap.phase).toBe('connecting');
        expect(snap.transportPending).toBe(true);
    });
});

describe('RH-16 · contraevidencia (grep contractual en este arnés)', () => {
    it('módulo experiencia no importa theatrical / IPlay / ICompany', () => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const fs = require('node:fs') as typeof import('node:fs');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const path = require('node:path') as typeof import('node:path');
        const dir = path.join(__dirname, '../../../src/experiencia');
        const files = fs.readdirSync(dir).filter((f: string) => f.endsWith('.ts'));
        for (const f of files) {
            const text = fs.readFileSync(path.join(dir, f), 'utf8');
            const importLines = text
                .split('\n')
                .filter((l: string) => /^\s*import\b/.test(l))
                .join('\n');
            expect(importLines).not.toMatch(/IPlay|ICompany|TeatroWebView|theatrical/);
            expect(importLines).not.toMatch(/h-sdk\/packages|file:.*h-sdk|\.\.\/\.\.\/h-sdk/);
        }
    });
});

describe('RH-16 · env H_SDK_MCP_* (contrato mínimo)', () => {
    it('readHExperienceEnv exige host+puerto (sin defaults)', () => {
        expect(readHExperienceEnv({})).toBeUndefined();
        expect(readHExperienceEnv({ H_SDK_MCP_HOST: '127.0.0.1' })).toBeUndefined();
        expect(readHExperienceEnv({ H_SDK_MCP_PORT: '9' })).toBeUndefined();
        const ep = readHExperienceEnv({
            H_SDK_MCP_HOST: '127.0.0.1',
            H_SDK_MCP_PORT: '9876'
        });
        expect(ep?.port).toBe(9876);
        expect(ep?.entry.id).toBe('h-sdk');
        expect(ep?.entry.capabilities).toContain('h.experiencia');
    });

    it('mergeCatalogWithHEnv prioriza fila env', () => {
        const merged = mergeCatalogWithHEnv(
            [{ id: 'h-sdk', name: 'stale', port: 1 }],
            { H_SDK_MCP_HOST: '10.0.0.2', H_SDK_MCP_PORT: '4444' }
        );
        expect(merged.fromEnv).toBe(true);
        expect(merged.hostOverride).toBe('10.0.0.2');
        expect(merged.servers[0]?.port).toBe(4444);
    });

    it('descubrimiento por env → proyecta fixture como producto', async () => {
        const fixture = await startFixtureExperienciaH();
        const prevHost = process.env.H_SDK_MCP_HOST;
        const prevPort = process.env.H_SDK_MCP_PORT;
        process.env.H_SDK_MCP_HOST = fixture.host;
        process.env.H_SDK_MCP_PORT = String(fixture.port);
        try {
            const svc = new ExperienciaHService();
            const snap = await svc.refresh({
                catalogServers: [],
                host: ''
            });
            expect(snap.transportPending).toBe(false);
            expect(snap.serverId).toBe('h-sdk');
            expect(snap.phase).toBe('pending_external_contract');
            expect(snap.phase).not.toBe('complete');
            expect(snap.payloads?.estado.resourceVersion).toBe('0.1.0');
        } finally {
            await fixture.close();
            if (prevHost === undefined) delete process.env.H_SDK_MCP_HOST;
            else process.env.H_SDK_MCP_HOST = prevHost;
            if (prevPort === undefined) delete process.env.H_SDK_MCP_PORT;
            else process.env.H_SDK_MCP_PORT = prevPort;
        }
    });
});

describe('RH-16 · integración producto H (env-gated)', () => {
    const host = process.env.H_SDK_MCP_HOST;
    const port = process.env.H_SDK_MCP_PORT;
    const gated = !(host && port && Number(port) > 0);

    (gated ? it.skip : it)(
        'MinimalMcpClient lee resources reales del server H (H_SDK_MCP_* set)',
        async () => {
            const client = new MinimalMcpClient({
                host: host as string,
                port: Number(port)
            });
            const svc = new ExperienciaHService();
            const snap = await svc.refresh({
                catalogServers: [],
                host: '',
                fixtureClient: client,
                fixtureServerId: 'h-sdk'
            });
            expect(snap.fresh).toBe(true);
            expect(snap.payloads?.estado.resourceVersion).toBe('0.1.0');
            expect(snap.phase).not.toBe('complete');
            expect(['pending_external_contract', 'connected', 'failed', 'connecting']).toContain(
                snap.phase
            );
        }
    );
});
