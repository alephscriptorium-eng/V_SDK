/**
 * WP-V102 · El panel SETTINGS ofrecía un fichero que el árbol no puede producir
 * — y, medido, el defecto era mayor: resolvía activos DEL PAQUETE contra el
 * WORKSPACE del usuario.
 *
 * QUÉ VIGILA ESTE FICHERO, Y POR QUÉ ASÍ
 *
 * No lee el fuente del panel: lo EJECUTA. Construye el provider, le pone un
 * workspace de verdad en disco, llama a la composición de grupos y mira dos
 * cosas: las rutas que llegan a `fs.existsSync`/`fs.readdirSync` y los
 * `filePath` que el panel devuelve. Eso es lo que falló antes: la coordenada
 * del censo (`plan/CENSO-V12.md:383`) derivó +6 líneas sola, y ningún barrido
 * de citas lo vio porque la línea citada seguía resolviendo.
 *
 * LA REGLA QUE SE IMPONE
 *
 *   NOMBRAR UN FICHERO ES UNA PROMESA; ENUMERAR UN DIRECTORIO ES UNA PREGUNTA.
 *
 * §1 · Un activo del PAQUETE tiene que aparecer aunque el workspace del usuario
 *      no tenga nada. Ése era el defecto de fondo: para cualquiera cuyo
 *      workspace no fuese este repositorio, los schemas NO SE VEÍAN.
 * §2 · Todo `filePath` devuelto existe en disco, en los dos workspaces.
 * §3 · Todo nombre de FICHERO codificado —el que lleva extensión— se comprueba
 *      contra el árbol del propio producto y tiene que resolver. Si el producto
 *      no puede producirlo, nadie puede. Ahí enrojece «sample-config.json».
 * §4 · Ningún `filePath` se ofrece dos veces.
 * §5 · La prosa de `src/mcpTypes.ts`, que no puede interpolar: ningún nombre
 *      `.json` vivo, y el nombre del fichero se cita por su CONSTANTE.
 */

// `fs.existsSync` no se puede espiar con `jest.spyOn` en node >= 20 («Cannot
// redefine property»). Se sustituye el módulo entero conservando lo real, para
// que las sondas se capturen SIN falsear el disco: todo lo que el panel
// comprueba se comprueba de verdad.
jest.mock('fs', () => {
    const real = jest.requireActual('fs');
    return {
        ...real,
        existsSync: jest.fn(real.existsSync),
        readdirSync: jest.fn(real.readdirSync),
    };
});

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import {
    ConfigGroup,
    ConfigItem,
    HackerConfigPanelProvider,
} from '../../../src/views/HackerConfigPanelProvider';
import { OPERA_CONFIG_FILENAME } from '../../../src/core/mcpConfigurationManager';

const fsReal = jest.requireActual('fs') as typeof import('fs');

/** Raíz del árbol del producto. Es también la raíz del PAQUETE en desarrollo. */
const RAIZ = path.resolve(__dirname, '../../..');

const existsSync = fs.existsSync as unknown as jest.Mock;
const readdirSync = fs.readdirSync as unknown as jest.Mock;

interface Corrida {
    grupos: ConfigGroup[];
    items: ConfigItem[];
    sondas: string[];
}

/**
 * Ejecuta la composición de grupos con `workspace` montado y devuelve, además
 * de lo ofrecido, TODAS las rutas que el panel fue a mirar al disco.
 */
function correr(workspace: string): Corrida {
    existsSync.mockClear();
    readdirSync.mockClear();

    (vscode.workspace as { workspaceFolders?: unknown }).workspaceFolders = [
        { uri: { fsPath: workspace, path: workspace }, name: 'ws', index: 0 },
    ];

    const provider = new HackerConfigPanelProvider(
        { fsPath: RAIZ, path: RAIZ } as unknown as vscode.Uri,
        {} as unknown as vscode.ExtensionContext
    );

    const grupos = (provider as unknown as {
        _getConfigGroups(): ConfigGroup[];
    })._getConfigGroups();

    return {
        grupos,
        items: grupos.flatMap(g => g.configs),
        sondas: [
            ...existsSync.mock.calls.map(c => String(c[0])),
            ...readdirSync.mock.calls.map(c => String(c[0])),
        ],
    };
}

/** Un workspace de usuario de verdad: NO es este repositorio. */
function workspaceAjeno(): string {
    const dir = fsReal.mkdtempSync(path.join(os.tmpdir(), 'v102-ws-'));
    fsReal.writeFileSync(path.join(dir, 'package.json'), '{}');
    fsReal.writeFileSync(path.join(dir, 'tsconfig.json'), '{}');
    return dir;
}

const ficheros = (items: ConfigItem[]) => items.filter(i => i.type === 'config-file');

// =============================================================================
// §1 · LOS ACTIVOS DEL PAQUETE SALEN DEL PAQUETE
// =============================================================================

describe('WP-V102 §1 · el panel resuelve los activos del paquete contra el paquete', () => {
    it('con un workspace ajeno y vacío, los schemas del paquete SE OFRECEN', () => {
        const { items } = correr(workspaceAjeno());

        const delPaquete = ficheros(items).filter(i => i.origen === 'paquete');

        // ÉSTE es el defecto medido. Antes de este WP daba 0: los tres
        // `schemas/*.schema.json` se buscaban bajo el workspace del usuario,
        // así que el panel sólo se los enseñaba a quien desarrolla la extensión.
        expect(delPaquete.length).toBeGreaterThan(0);
        for (const item of delPaquete) {
            expect(fsReal.existsSync(item.filePath as string)).toBe(true);
            expect(path.resolve(item.filePath as string).startsWith(path.resolve(RAIZ))).toBe(true);
        }
    });

    it('ninguna sonda contra la raíz del PAQUETE falla', () => {
        const ajeno = workspaceAjeno();
        const { sondas } = correr(ajeno);

        // Un activo del paquete que no resuelve es un defecto de empaquetado, no
        // algo que se pueda filtrar en silencio.
        const fallidas = sondas
            .filter(p => path.resolve(p).startsWith(path.resolve(RAIZ)))
            .filter(p => !path.resolve(p).startsWith(path.resolve(ajeno)))
            .filter(p => !fsReal.existsSync(p));

        expect(fallidas).toEqual([]);
    });

    it('todo item de fichero declara su origen', () => {
        for (const ws of [RAIZ, workspaceAjeno()]) {
            const { items } = correr(ws);
            const sinOrigen = ficheros(items).filter(i => i.origen === undefined);
            expect(sinOrigen.map(i => i.id)).toEqual([]);
        }
    });
});

// =============================================================================
// §2 · LO QUE SE OFRECE EXISTE
// =============================================================================

describe('WP-V102 §2 · todo filePath ofrecido existe en disco', () => {
    it.each([
        ['workspace = el repositorio del producto', () => RAIZ],
        ['workspace = un proyecto ajeno', workspaceAjeno],
    ])('%s', (_etiqueta, ws) => {
        const { items } = correr(ws());
        const inexistentes = ficheros(items)
            .filter(i => !fsReal.existsSync(i.filePath as string))
            .map(i => `${i.id} -> ${i.filePath}`);

        expect(inexistentes).toEqual([]);
    });
});

// =============================================================================
// §3 · UN NOMBRE DE FICHERO CODIFICADO ES UNA PROMESA
// =============================================================================

describe('WP-V102 §3 · el árbol del producto produce todo fichero que el panel nombra', () => {
    /**
     * Con el workspace apuntando al árbol del propio producto, toda sonda que
     * lleve extensión —o sea, todo NOMBRE DE FICHERO codificado en el panel—
     * tiene que resolver. Si este árbol no puede producirlo, ninguno puede.
     *
     * Los directorios (sondas sin extensión) quedan fuera a propósito: enumerar
     * un directorio no promete ningún fichero concreto, y su ausencia es
     * descubrimiento. Ésa es la línea que separa `theatrical-content/`, que es
     * del usuario, de «sample-config.json», que el producto prometía y no tenía.
     */
    it('ninguna sonda a un nombre de fichero queda sin resolver', () => {
        const { sondas } = correr(RAIZ);

        const promesasRotas = sondas
            .filter(p => path.extname(p) !== '')
            .filter(p => !fsReal.existsSync(p));

        expect(promesasRotas).toEqual([]);
    });

    it('el panel no nombra ningún fichero podado en `f615434`', () => {
        const podados = ['sample-config.json', OPERA_CONFIG_FILENAME];

        for (const ws of [RAIZ, workspaceAjeno()]) {
            const { sondas, items } = correr(ws);
            const nombrados = [
                ...sondas.map(p => path.basename(p)),
                ...ficheros(items).map(i => path.basename(i.filePath as string)),
            ];
            expect(nombrados.filter(n => podados.includes(n))).toEqual([]);
        }
    });
});

// =============================================================================
// §4 · SIN DUPLICADOS
// =============================================================================

describe('WP-V102 §4 · ningún fichero se ofrece dos veces', () => {
    it('con el repositorio abierto como workspace, paquete y workspace no se duplican', () => {
        const { items } = correr(RAIZ);
        const rutas = ficheros(items).map(i => path.resolve(i.filePath as string));
        const repetidas = rutas.filter((r, i) => rutas.indexOf(r) !== i);

        // Hasta este WP los 3 schemas salían DOS veces —en «WEBVIEW
        // CONFIGURATIONS» y en «SCHEMA DEFINITIONS»— con la misma ruta absoluta.
        expect(repetidas).toEqual([]);
    });
});

// =============================================================================
// §5 · LA PROSA DE mcpTypes.ts, QUE NO PUEDE INTERPOLAR
// =============================================================================

describe('WP-V102 §5 · src/mcpTypes.ts nombra el fichero por su constante', () => {
    const FUENTE = fsReal.readFileSync(path.join(RAIZ, 'src/mcpTypes.ts'), 'utf8');

    it('ningún nombre de fichero .json vivo (los muertos van entre «comillas angulares»)', () => {
        const infractoras: string[] = [];

        FUENTE.split(/\r?\n/).forEach((linea, i) => {
            for (const nombre of linea.match(/[A-Za-z0-9_.-]+\.json\b/g) || []) {
                if (linea.includes(`«${nombre}»`)) { continue; }
                infractoras.push(`L${i + 1}: ${nombre} — ${linea.trim()}`);
            }
        });

        expect(infractoras).toEqual([]);
    });

    it('cita la constante que nombra el fichero que el manager abre de verdad', () => {
        expect(FUENTE).toContain('OPERA_CONFIG_FILENAME');
        // Y la constante existe y sigue siendo un nombre de fichero.
        expect(OPERA_CONFIG_FILENAME).toMatch(/\.json$/);
    });
});
