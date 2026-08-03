/**
 * RH-16 · Servicio experiencia H + fixtures MCP.
 * Transport producto H = <pendiente>; fixtures bastan para arrancar.
 */

import { MinimalMcpClient } from '../../../src/mcp/client';
import { ExperienciaHService } from '../../../src/experiencia/ExperienciaHService';
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
        const svc = new ExperienciaHService();
        const snap = await svc.refresh({
            catalogServers: [{ id: 'linea-editor', name: 'linea-editor', port: 3051 }],
            host: '127.0.0.1'
        });
        expect(snap.phase).toBe('connecting');
        expect(snap.transportPending).toBe(true);
        expect(snap.reason).toContain('<pendiente>');
        expect(snap.phase).not.toBe('connected');
        expect(snap.phase).not.toBe('complete');
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

describe('RH-16 · integración real H (skip-honesto)', () => {
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('skip-honesto: transport MCP producto H que proyecte AlmacenResources — <pendiente> en H (tip 9bfd7ff in-process); no se finge connected/complete', () => {
        /* intencionadamente vacío */
    });
});
