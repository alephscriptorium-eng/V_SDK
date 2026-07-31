/**
 * WP-V28 · Resolución de endpoint por configuración (CA4: cero literales —
 * los valores de estos tests son sintéticos del test, inyectados; los NOMBRES
 * son los citados del env central de z-sdk: env/index.mjs:59,61,175-178).
 */

import * as vscode from 'vscode';
import {
    MCP_HEALTH_PATH,
    MCP_HTTP_PATH,
    mcpHealthUrl,
    mcpHttpUrl,
    resolveMcpEndpoint,
    ZEUS_ENV_HOST,
    ZEUS_ENV_PORT_BY_TARGET
} from '../../../src/mcp/endpoint';

const SETTINGS_VACIOS = {
    launcherHost: '',
    launcherPort: undefined,
    lineaEditorHost: '',
    lineaEditorPort: undefined
};

describe('WP-V28 · resolveMcpEndpoint', () => {
    it('nombres de env consumidos = los del contrato central de z-sdk', () => {
        // env/index.mjs:61 y :59 (MCP_PORT_ENV); :175-178 (resolveZeusHost).
        expect(ZEUS_ENV_PORT_BY_TARGET.launcher).toBe('ZEUS_MCP_LAUNCHER');
        expect(ZEUS_ENV_PORT_BY_TARGET.lineaEditor).toBe('ZEUS_MCP_LINEA_EDITOR');
        expect(ZEUS_ENV_HOST).toBe('ZEUS_HOST');
    });

    it('settings del IDE tienen prioridad (fuente declarada)', () => {
        const r = resolveMcpEndpoint('launcher', {
            settings: {
                ...SETTINGS_VACIOS,
                launcherHost: 'host-de-settings',
                launcherPort: 1234 // valor sintético inyectado por el test
            },
            env: { ZEUS_HOST: 'host-de-env', ZEUS_MCP_LAUNCHER: '4321' }
        });
        expect(r).toEqual({
            configured: true,
            source: 'settings',
            host: 'host-de-settings',
            port: 1234
        });
    });

    it('sin settings, cae al env central ZEUS_* (fuente declarada)', () => {
        const r = resolveMcpEndpoint('lineaEditor', {
            settings: SETTINGS_VACIOS,
            env: { ZEUS_HOST: 'host-de-env', ZEUS_MCP_LINEA_EDITOR: '4321' }
        });
        expect(r).toEqual({
            configured: true,
            source: 'env',
            host: 'host-de-env',
            port: 4321
        });
    });

    it('mezcla declarada: host de settings + puerto de env', () => {
        const r = resolveMcpEndpoint('launcher', {
            settings: { ...SETTINGS_VACIOS, launcherHost: 'host-de-settings' },
            env: { ZEUS_MCP_LAUNCHER: '4321' }
        });
        expect(r).toEqual({
            configured: true,
            source: 'env',
            host: 'host-de-settings',
            port: 4321
        });
    });

    it('env con puerto no numérico o vacío NO configura (semántica readEnvPort citada)', () => {
        for (const raw of ['', 'abc', '-1', '0']) {
            const r = resolveMcpEndpoint('launcher', {
                settings: SETTINGS_VACIOS,
                env: { ZEUS_HOST: 'host-de-env', ZEUS_MCP_LAUNCHER: raw }
            });
            expect(r.configured).toBe(false);
        }
    });

    it('sin host tampoco configura: V no replica el fallback localhost del servidor', () => {
        const r = resolveMcpEndpoint('launcher', {
            settings: SETTINGS_VACIOS,
            env: { ZEUS_MCP_LAUNCHER: '4321' } // puerto sí, host no
        });
        expect(r.configured).toBe(false);
        if (!r.configured) {
            expect(r.reason).toContain('⏳');
            expect(r.reason).toContain('aleph0.launcher.host');
            expect(r.reason).toContain('ZEUS_HOST');
        }
    });

    it('ausencia total → ⏳ con ambas fuentes nombradas (no inventa)', () => {
        const r = resolveMcpEndpoint('lineaEditor', {
            settings: SETTINGS_VACIOS,
            env: {}
        });
        expect(r.configured).toBe(false);
        if (!r.configured) {
            expect(r.reason).toContain('aleph0.lineaEditor.port');
            expect(r.reason).toContain('ZEUS_MCP_LINEA_EDITOR');
            expect(r.reason).toContain('no inventa');
        }
    });

    it('por defecto lee los settings reales del IDE (getZiguratSettings)', () => {
        // mock del API vscode (arnés existente): valores sintéticos del test.
        (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({
            get: (key: string) =>
                ({
                    'launcher.host': 'host-del-ide',
                    'launcher.port': 1234
                })[key]
        });
        const r = resolveMcpEndpoint('launcher', { env: {} });
        expect(r).toEqual({
            configured: true,
            source: 'settings',
            host: 'host-del-ide',
            port: 1234
        });
    });
});

describe('WP-V28 · URLs derivadas del endpoint resuelto (rutas del contrato)', () => {
    it('mcpHttpUrl compone host:puerto de config + ruta citada /mcp', () => {
        expect(mcpHttpUrl({ host: 'h', port: 7 })).toBe(`http://h:7${MCP_HTTP_PATH}`);
        expect(MCP_HTTP_PATH).toBe('/mcp'); // create-app.mjs:65
    });
    it('mcpHealthUrl usa la ruta canónica de health', () => {
        expect(mcpHealthUrl({ host: 'h', port: 7 })).toBe(
            `http://h:7${MCP_HEALTH_PATH}`
        );
        expect(MCP_HEALTH_PATH).toBe('/mcp/health'); // create-app.mjs:25
    });
});
