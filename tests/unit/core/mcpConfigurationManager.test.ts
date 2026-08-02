/**
 * WP-V100 · El defecto D16 no se arregló: se movió, y la cita rancia lo tapaba.
 *
 * PRIMER TEST DEL MANAGER. Hasta este WP, `src/core/mcpConfigurationManager.ts`
 * no tenía NINGUNO: 12 ficheros en `tests/` y ninguno lo nombraba, así que la
 * rama de `initialize()` que este WP corrige no se ejercitaba jamás. Por eso
 * este fichero mueve el suelo de cobertura, y el movimiento va firmado en
 * `scripts/cobertura.suelo.json`.
 *
 * QUÉ VIGILA, Y POR QUÉ ASÍ
 *
 * 1) EL INVARIANTE DE VERDAD, EN EJECUCIÓN (§1). El nombre que el log ANUNCIA
 *    tiene que ser el basename del fichero que el código ABRE. No se comprueba
 *    leyendo el fuente: se corre `initialize()`, se captura la ruta que llega a
 *    `fs.existsSync` y el mensaje que llega al logger, y se comparan. Ése era
 *    exactamente D16: el log decía «sample-config.json» mientras se abría
 *    `ArrakisTheater_OperaConfig.json`, y ningún gate lo veía porque nadie
 *    ejecutaba la rama.
 *
 * 2) LA PROSA, QUE NO PUEDE INTERPOLAR (§2). El docstring y el comentario no
 *    pueden llevar la constante, así que repiten el nombre a mano y pueden
 *    volver a derivar. La regla que se impone es la convención del módulo: un
 *    nombre de fichero MUERTO se escribe entre comillas angulares —«así»—; uno
 *    VIVO tiene que ser el valor de `OPERA_CONFIG_FILENAME`.
 *
 * 3) LAS COORDENADAS DEL DOCSTRING DE V23 (§3). El hallazgo heredado: 5 citas
 *    que RESUELVEN y MIENTEN. Un barrido que sólo comprueba que el fichero
 *    tiene esa línea las aprueba todas; éste comprueba que la línea citada
 *    NOMBRA lo que la cita dice que nombra. Y fija el conteo («6 llamadas»),
 *    que era el único dato verdadero del bloque.
 */

// `fs.existsSync` no se puede espiar con `jest.spyOn` en node ≥20: los export
// del módulo no son reconfigurables («Cannot redefine property»). Se sustituye
// el módulo entero conservando el resto de la implementación real.
jest.mock('fs', () => {
    const real = jest.requireActual('fs');
    return {
        ...real,
        existsSync: jest.fn(real.existsSync),
        readFileSync: jest.fn(real.readFileSync),
    };
});

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { LoggingManager } from '../../../src/loggingManager';
import {
    McpConfigurationManager,
    OPERA_CONFIG_FILENAME,
} from '../../../src/core/mcpConfigurationManager';

/** `fs` sin doblar: §2 y §3 leen fuentes de verdad, pase lo que pase en §1. */
const fsReal = jest.requireActual('fs') as typeof import('fs');

const RAIZ = path.resolve(__dirname, '../../..');
const RUTA_MANAGER = path.join(RAIZ, 'src/core/mcpConfigurationManager.ts');

const FUENTE_MANAGER = fsReal.readFileSync(RUTA_MANAGER, 'utf8');

/** Lee un fichero de `src` sin pasar por el doble de `fs` de §1. */
function leerFuente(rel: string): string[] {
    return fsReal.readFileSync(path.join(RAIZ, rel), 'utf8').split(/\r?\n/);
}

function reiniciarSingleton(): void {
    (McpConfigurationManager as unknown as { instance?: unknown }).instance = undefined;
}

// =============================================================================
// §1 · EL NOMBRE QUE SE ANUNCIA ES EL FICHERO QUE SE ABRE (en ejecución)
// =============================================================================

describe('WP-V100 §1 · initialize(): el log anuncia el fichero que realmente abre', () => {
    const WORKSPACE = '/test/workspace';

    const existsSync = fs.existsSync as unknown as jest.Mock;
    const readFileSync = fs.readFileSync as unknown as jest.Mock;
    let infoSpy: jest.SpyInstance;
    let warnSpy: jest.SpyInstance;
    let updateAjustes: jest.Mock;

    beforeEach(() => {
        reiniciarSingleton();

        updateAjustes = jest.fn().mockResolvedValue(undefined);
        // Sin ruta en ajustes: es la precondición de la rama que se audita.
        // El resto de claves devuelve SU DEFECTO — si se devolviera `undefined`
        // a todo, `LoggingManager` reventaría al parsear el nivel y el fallo
        // parecería del manager.
        (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({
            get: jest.fn((clave: string, porDefecto?: unknown) =>
                clave === 'mcp.configPath' ? undefined : porDefecto
            ),
            update: updateAjustes,
            has: jest.fn().mockReturnValue(false),
            inspect: jest.fn().mockReturnValue(undefined),
        });
        (vscode.workspace as { workspaceFolders?: unknown }).workspaceFolders = [
            { uri: { fsPath: WORKSPACE, path: WORKSPACE }, name: 'test-workspace', index: 0 },
        ];

        const gestor = LoggingManager.getInstance();
        infoSpy = jest.spyOn(gestor, 'info').mockImplementation(() => undefined);
        warnSpy = jest.spyOn(gestor, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => {
        jest.restoreAllMocks();
        reiniciarSingleton();
    });

    it('anuncia en el log EXACTAMENTE el basename de la ruta que comprueba en disco', async () => {
        const rutaEsperada = path.join(WORKSPACE, OPERA_CONFIG_FILENAME);

        existsSync.mockImplementation((p: unknown) => String(p) === rutaEsperada);
        readFileSync.mockReturnValue('{"app":{"type":"arrakis-theater-opera"}}');

        await McpConfigurationManager.getInstance().initialize();

        // (a) la ruta que se COMPRUEBA en disco
        const rutasComprobadas = existsSync.mock.calls.map(c => String(c[0]));
        expect(rutasComprobadas[0]).toBe(rutaEsperada);

        // (b) la ruta que se ABRE
        const rutasLeidas = readFileSync.mock.calls.map(c => String(c[0]));
        expect(rutasLeidas).toContain(rutaEsperada);

        // (c) el nombre que se ANUNCIA
        const mensajes: string[] = infoSpy.mock.calls.map(c => String(c[1]));
        const anuncioHallazgo = mensajes.find(m => m.startsWith('Found '));
        expect(anuncioHallazgo).toBeDefined();

        const nombreAnunciado = (anuncioHallazgo as string).match(/[A-Za-z0-9_.-]+\.json/)?.[0];
        const nombreAbierto = path.basename(rutasLeidas[0]);

        // ÉSTE es D16. Si divergen, enrojece.
        expect(nombreAnunciado).toBe(nombreAbierto);
        expect(nombreAnunciado).toBe(OPERA_CONFIG_FILENAME);
    });

    it('el aviso al usuario nombra el mismo fichero cuando NO hay ninguno en disco', async () => {
        existsSync.mockReturnValue(false);

        await McpConfigurationManager.getInstance().initialize();

        const avisos: string[] = warnSpy.mock.calls.map(c => String(c[1]));
        const aviso = avisos.find(m => m.includes('.json'));
        expect(aviso).toBeDefined();
        expect((aviso as string).match(/[A-Za-z0-9_.-]+\.json/)?.[0]).toBe(OPERA_CONFIG_FILENAME);
    });
});

// =============================================================================
// §2 · LA PROSA CONCUERDA CON LA CONSTANTE
// =============================================================================

describe('WP-V100 §2 · docstring y comentario nombran el fichero que se busca', () => {
    /** Un nombre muerto se declara muerto encerrándolo en «comillas angulares». */
    function esNombreDeclaradoMuerto(linea: string, nombre: string): boolean {
        return linea.includes(`«${nombre}»`);
    }

    it('ningún nombre de fichero .json vivo distinto de OPERA_CONFIG_FILENAME', () => {
        const lineas = FUENTE_MANAGER.split(/\r?\n/);
        const infractoras: string[] = [];

        lineas.forEach((linea, i) => {
            const nombres = linea.match(/[A-Za-z0-9_.-]+\.json\b/g) || [];
            for (const nombre of nombres) {
                if (nombre === OPERA_CONFIG_FILENAME) { continue; }
                if (esNombreDeclaradoMuerto(linea, nombre)) { continue; }
                infractoras.push(`L${i + 1}: ${nombre} — ${linea.trim()}`);
            }
        });

        expect(infractoras).toEqual([]);
    });

    it('el docstring de initialize() nombra el fichero que initialize() compone', () => {
        const docstring = FUENTE_MANAGER.split('async initialize()')[0].split('/**').pop() as string;
        expect(docstring).toContain(OPERA_CONFIG_FILENAME);
    });

    it('el comentario de la rama de búsqueda nombra ese mismo fichero', () => {
        const comentario = FUENTE_MANAGER.split(/\r?\n/).find(l =>
            l.includes('// If no path in settings, look for')
        );
        expect(comentario).toBeDefined();
        expect(comentario).toContain(OPERA_CONFIG_FILENAME);
    });

    it('la ruta se compone con la constante, no con un literal gemelo', () => {
        expect(FUENTE_MANAGER).toContain('path.join(workspaceRoot, OPERA_CONFIG_FILENAME)');
        // El literal vive en UN solo sitio: la declaración de la constante.
        const literales = FUENTE_MANAGER.match(/'ArrakisTheater_OperaConfig\.json'/g) || [];
        expect(literales).toHaveLength(1);
    });
});

// =============================================================================
// §3 · LAS COORDENADAS DEL DOCSTRING DE V23 RESUELVEN **Y DICEN LA VERDAD**
// =============================================================================

describe('WP-V100 §3 · las citas de getDefaultSocketUrl() nombran lo que dicen nombrar', () => {
    // Coordenadas re-medidas en WP-V100, con LO QUE CADA UNA DEBE NOMBRAR.
    // El docstring del método las repite en prosa; aquí son dato ejecutable.
    const CITAS: Array<{ fichero: string; linea: number; nombra: string }> = [
        // las 6 llamadas + el wrapper privado
        { fichero: 'src/core/bootstrap/assembleContext.ts', linea: 109, nombra: 'getDefaultSocketUrl' },
        { fichero: 'src/socketMonitor.ts', linea: 278, nombra: 'getDefaultSocketUrl' },
        { fichero: 'src/socketMonitor.ts', linea: 282, nombra: 'getDefaultSocketUrl' },
        { fichero: 'src/socketMonitor.ts', linea: 308, nombra: 'getDefaultSocketUrl' },
        { fichero: 'src/treeViews/configsTreeView.ts', linea: 472, nombra: 'getDefaultSocketUrl' },
        { fichero: 'src/treeViews/socketsTreeView.ts', linea: 85, nombra: 'getDefaultSocketUrl' },
        { fichero: 'src/treeViews/socketsTreeView.ts', linea: 232, nombra: 'getDefaultSocketUrl' },
        // lo que el docstring dice sobre devolver '' — mismo rasero
        { fichero: 'src/treeViews/socketsTreeView.ts', linea: 92, nombra: "'localhost:3000'" },
        { fichero: 'src/treeViews/configsTreeView.ts', linea: 474, nombra: 'defaultSocketUrl' },
        { fichero: 'src/treeViews/configsTreeView.ts', linea: 483, nombra: 'defaultSocketUrl' },
        { fichero: 'src/treeViews/configsTreeView.ts', linea: 499, nombra: 'defaultSocketUrl' },
    ];

    it.each(CITAS)('$fichero:$linea nombra $nombra', ({ fichero, linea, nombra }) => {
        const lineas = leerFuente(fichero);
        expect(lineas.length).toBeGreaterThanOrEqual(linea);
        // Resolver NO basta: la línea tiene que NOMBRAR lo que la cita afirma.
        // Ésa es la diferencia entre el barrido que aprobó las citas falsas
        // (todas resolvían) y este test.
        expect(lineas[linea - 1]).toContain(nombra);
    });

    it('el docstring no cita ninguna coordenada fuera de la tabla (salvo las declaradas muertas)', () => {
        const doc = FUENTE_MANAGER
            .split('getDefaultSocketUrl(): string')[0]
            .split('**6 llamadas**')
            .pop() as string;

        const citadas = new Set<string>();
        for (const linea of doc.split(/\r?\n/)) {
            for (const cita of linea.match(/[A-Za-z0-9_/]+\.ts:[0-9,\-]+/g) || []) {
                // Convención del módulo: «…» marca coordenada muerta / narrada.
                if (linea.includes(`«${cita}»`)) { continue; }
                const [fich, nums] = cita.split(':');
                for (const trozo of nums.split(',')) {
                    citadas.add(`${path.basename(fich)}:${trozo.split('-')[0]}`);
                }
            }
        }

        const esperadas = new Set(CITAS.map(c => `${path.basename(c.fichero)}:${c.linea}`));
        // El docstring puede citar menos de las que la tabla fija, pero NUNCA
        // una que la tabla no haya medido.
        expect([...citadas].filter(c => !esperadas.has(c))).toEqual([]);
    });

    it('siguen siendo 6 las llamadas que consumen el valor', () => {
        const ficheros = [
            'src/core/bootstrap/assembleContext.ts',
            'src/socketMonitor.ts',
            'src/treeViews/configsTreeView.ts',
            'src/treeViews/socketsTreeView.ts',
        ];
        const total = ficheros.reduce((acc, f) => {
            const texto = leerFuente(f).join('\n');
            return acc + (texto.match(/\b(?:configManager|mcpConfigManager)\.getDefaultSocketUrl\(\)/g) || []).length;
        }, 0);
        expect(total).toBe(6);
    });
});
