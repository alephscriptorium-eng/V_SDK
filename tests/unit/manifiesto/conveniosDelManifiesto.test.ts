/**
 * WP-V101 · Los convenios que el MANIFIESTO le promete al usuario
 * =============================================================================
 *
 * QUE VIGILA
 *   `package.json` declara dos convenios sobre el workspace DEL USUARIO:
 *
 *     · `contributes.customEditors`  — «un fichero que se llame ASI y viva AHI
 *        se abre con nuestro editor»
 *     · `contributes.jsonValidation` — «un fichero que se llame ASI se valida
 *        contra ESTE schema, que viaja dentro del .vsix»
 *
 *   Los dos son promesas sobre ficheros que **escribe la propia extension**.
 *   Este fichero comprueba que lo prometido y lo escrito son lo mismo.
 *
 * POR QUE ASI Y NO LEYENDO EL FUENTE
 *   `WP-V100` lo dejo fijado y `WP-V98` lo pago caro: un test que hace grep
 *   sobre el fichero **aprueba todo lo que resuelve**, y las nueve coordenadas
 *   falsas de V98 resolvian. Aqui:
 *
 *     §1 EJECUTA el handler de `aleph0.agents.createNew` y captura las rutas
 *        que llegan a `vscode.workspace.fs.writeFile`.
 *     §2 EJECUTA `ConfigsTreeDataProvider.createFromTemplate` y captura el
 *        contenido que llega a `fs.promises.writeFile`, y lo valida con ajv
 *        contra el schema que el manifiesto ata a ese nombre de fichero.
 *
 *   En ningun caso se lee el texto de `package.json` buscando una cadena: se
 *   lee el manifiesto como DATOS y se confronta con lo que el codigo produce.
 *
 * DEPENDENCIAS TRANSITIVAS, DECLARADAS
 *   `ajv` y `minimatch` no son dependencias directas de este paquete; entran
 *   por `eslint` y por `jest`. Si un dia desaparecen, este fichero **no
 *   compila y la suite enrojece** — falla cerrado, que es como debe fallar.
 *   Se usan porque son los matchers de verdad: reimplementar el globbing o la
 *   validacion de JSON Schema aqui probaria mi reimplementacion, no VS Code.
 */
import * as path from 'path';
import * as fs from 'fs';
import Ajv from 'ajv';
import { minimatch } from 'minimatch';

const RAIZ = path.resolve(__dirname, '..', '..', '..');
const manifiesto = JSON.parse(fs.readFileSync(path.join(RAIZ, 'package.json'), 'utf8'));

/**
 * La convencion de directorio que la extension escribe en el workspace del
 * usuario. NO es una ruta del repo: `theatrical-content/` fue podado del arbol
 * por V13 y no existe aqui. Lo crea `aleph0.agents.createNew` en la carpeta
 * abierta por el usuario, y por eso el manifiesto puede nombrarlo sin mentir.
 */
const CONVENCION = 'theatrical-content';

/**
 * Un `filenamePattern` del manifiesto contra una ruta del workspace, con las
 * MISMAS reglas que VS Code:
 *
 *   · un patron SIN `/` casa contra el **basename** (por eso `*.agent.md` a
 *     secas capturaba cualquier fichero, en cualquier carpeta: era el defecto);
 *   · un patron CON `/` casa contra la ruta, absoluta o relativa al workspace.
 *
 * Modelar la primera regla no es un detalle: sin ella este test le atribuiria
 * al manifiesto viejo un fallo que no tenia («no abre ni nuestro propio
 * fichero») y taparia el fallo que si tenia («abre los ajenos tambien»).
 */
function casa(patron: string, rutaAbsoluta: string, raizWorkspace: string): boolean {
    const posix = rutaAbsoluta.split(path.sep).join('/');
    if (!patron.includes('/')) return minimatch(path.posix.basename(posix), patron);
    const rel = path.posix.relative(raizWorkspace, posix);
    return minimatch(rel, patron) || minimatch(posix, patron);
}

// =============================================================================
describe('WP-V101 §1 · customEditors: lo que el manifiesto abre es lo que la extension escribe', () => {
    const WS = '/test/workspace';
    let escritas: string[] = [];

    beforeEach(() => {
        jest.resetModules();
        escritas = [];
    });

    /** Ejecuta de verdad el handler del comando y devuelve las rutas escritas. */
    async function ejecutarCreateNew(): Promise<string[]> {
        const vscode = require('vscode');
        vscode.window.showInputBox = jest.fn()
            .mockResolvedValueOnce('isaac')            // agent id
            .mockResolvedValueOnce('Isaac El Marinero'); // display name
        vscode.workspace.fs.writeFile = jest.fn(async (uri: any) => {
            escritas.push(uri.fsPath);
        });
        vscode.workspace.fs.createDirectory = jest.fn().mockResolvedValue(undefined);
        vscode.workspace.openTextDocument = jest.fn().mockResolvedValue({ uri: {} });
        vscode.window.showTextDocument = jest.fn().mockResolvedValue(undefined);

        const { agentManagementCommands } = require('../../../src/core/bootstrap/commands/agentManagementCommands');
        const entrada = agentManagementCommands.find((c: any) => c.id === 'aleph0.agents.createNew');
        expect(entrada).toBeDefined();

        const deps: any = {
            managers: { errorBoundary: { handleError: jest.fn(async (e: Error) => { throw e; }) } },
            getContext: () => undefined,
            getVsCodeContext: () => undefined,
            showSystemStatus: () => undefined,
            restartExtension: async () => undefined
        };
        await entrada.handler(deps)();
        return escritas;
    }

    it('el comando escribe EXACTAMENTE los dos ficheros de la convencion', async () => {
        const rutas = await ejecutarCreateNew();
        expect(rutas).toHaveLength(2);
        expect(rutas[0]).toBe(`${WS}/${CONVENCION}/content/agents/isaac.agent.md`);
        expect(rutas[1]).toBe(`${WS}/${CONVENCION}/configurations/agents/isaac.config.json`);
    });

    it('cada fichero escrito lo abre UN customEditor, y es el suyo', async () => {
        const rutas = await ejecutarCreateNew();
        const editores = manifiesto.contributes.customEditors as any[];

        const abridores = (ruta: string) => editores
            .filter(e => e.selector.some((s: any) => casa(s.filenamePattern, ruta, WS)))
            .map(e => e.viewType);

        // Ni cero (promesa incumplida) ni dos (ambiguedad que resuelve VS Code
        // por orden de declaracion, o sea: por azar).
        expect(abridores(rutas[0])).toEqual(['alephscript.agentContentEditor']);
        expect(abridores(rutas[1])).toEqual(['alephscript.agentConfigEditor']);
    });

    it('NINGUN customEditor secuestra un fichero fuera de la convencion', () => {
        // El defecto que cerro WP-V101: el selector del editor de contenido era
        // `*.agent.md` a secas —cualquier fichero, en cualquier sitio— mientras
        // su propio codigo (`AgentContentEditorProvider.getConfigPath`) asumia
        // que el gemelo vivia en `theatrical-content/configurations/agents/`.
        // Con `priority: "default"` eso SUSTITUYE al editor de texto del
        // usuario en ficheros que no tienen nada que ver con nosotros.
        const editores = manifiesto.contributes.customEditors as any[];
        const ajenos = [
            `${WS}/docs/notas/cualquiera.agent.md`,
            `${WS}/cualquiera.agent.md`,
            `${WS}/otro-sitio/agents/cualquiera.config.json`
        ];
        for (const ruta of ajenos) {
            const abridores = editores
                .filter(e => e.selector.some((s: any) => casa(s.filenamePattern, ruta, WS)))
                .map(e => e.viewType);
            expect(abridores).toEqual([]);
        }
    });

    it('los dos selectores nombran la MISMA convencion de directorio', () => {
        // No es cosmetica: son las dos mitades de un par que se navega mutuamente
        // (`getConfigPath` / `getContentPath`). Si una nombra la convencion y la
        // otra no, el par abre ficheros cuyo gemelo no puede existir.
        const patrones = (manifiesto.contributes.customEditors as any[])
            .flatMap(e => e.selector.map((s: any) => s.filenamePattern));
        expect(patrones).toHaveLength(2);
        for (const p of patrones) {
            expect(p).toContain(`${CONVENCION}/`);
        }
    });
});

// =============================================================================
describe('WP-V101 §2 · jsonValidation: lo que la extension escribe pasa el schema que empaqueta', () => {
    const WS = '/test/workspace';

    /**
     * Ejecuta `createFromTemplate` de verdad y devuelve {fichero, contenido}.
     * `urlDevuelta === null` significa «no hay config cargada».
     */
    async function ejecutarPlantilla(tipo: 'xplus1' | 'socket' | 'ui', urlDevuelta: string | null) {
        jest.resetModules();
        const vscode = require('vscode');
        vscode.workspace.findFiles = jest.fn().mockResolvedValue([]);
        vscode.window.showTextDocument = jest.fn().mockResolvedValue(undefined);
        vscode.window.showInformationMessage = jest.fn();
        vscode.window.showErrorMessage = jest.fn();

        const capturado: { fichero: string; contenido: string }[] = [];
        const fsReal = jest.requireActual('fs');
        jest.doMock('fs', () => ({
            ...fsReal,
            promises: {
                ...fsReal.promises,
                writeFile: jest.fn(async (p: string, c: string) => {
                    capturado.push({ fichero: path.basename(p), contenido: c });
                })
            }
        }));

        const { ConfigsTreeDataProvider } = require('../../../src/treeViews/configsTreeView');
        const proveedor: any = new ConfigsTreeDataProvider();
        proveedor.configManager = {
            isConfigLoaded: () => urlDevuelta !== null,
            getDefaultSocketUrl: () => urlDevuelta ?? ''
        };
        await proveedor.createFromTemplate(tipo);
        proveedor.dispose?.();

        expect(capturado).toHaveLength(1);
        return capturado[0];
    }

    /** El schema que EL MANIFIESTO ata a ese nombre de fichero. Nada cableado. */
    function schemaDelManifiesto(nombreFichero: string) {
        const entradas = (manifiesto.contributes.jsonValidation as any[])
            .filter(e => minimatch(nombreFichero, e.fileMatch) ||
                         minimatch(`${WS}/${nombreFichero}`, e.fileMatch));
        expect(entradas).toHaveLength(1);
        const rel = entradas[0].url.replace(/^\.\//, '');
        const abs = path.join(RAIZ, rel);
        expect(fs.existsSync(abs)).toBe(true);
        return JSON.parse(fs.readFileSync(abs, 'utf8'));
    }

    function validar(schema: any, dato: any): string[] {
        // Un Ajv nuevo por schema: los tres traen `$id` y colisionan al reusar.
        const validador = new Ajv({ strict: false, allErrors: true, logger: false }).compile(schema);
        return validador(dato) ? [] : (validador.errors ?? [])
            .map(e => `${e.instancePath || '/'} ${e.message}`);
    }

    const TIPOS: ('xplus1' | 'socket' | 'ui')[] = ['xplus1', 'socket', 'ui'];

    describe.each([
        ['sin config cargada', null],
        ['con URL configurada', 'wss://mesh.example:443'],
        // EL CASO QUE ESTABA ROTO. `isConfigLoaded()` pregunta «¿hay fichero de
        // opera?», no «¿tengo URL?». `getDefaultSocketUrl()` devuelve `''`
        // cuando no hay ajuste y la UI primaria no trae puerto, y ese vacio se
        // persistia en un campo `required` con `pattern: "^wss?://"`.
        ['con config cargada pero SIN url (el agujero de V101)', '']
    ])('%s', (_titulo, url) => {
        it.each(TIPOS)('la plantilla %s valida contra el schema que el manifiesto le ata', async (tipo) => {
            const { fichero, contenido } = await ejecutarPlantilla(tipo, url as string | null);
            const errores = validar(schemaDelManifiesto(fichero), JSON.parse(contenido));
            expect({ fichero, errores }).toEqual({ fichero, errores: [] });
        });
    });
});

// =============================================================================
describe('WP-V101 §3 · los schemas existen y VIAJAN en el .vsix', () => {
    it('cada url de jsonValidation resuelve a un fichero del arbol', () => {
        const entradas = manifiesto.contributes.jsonValidation as any[];
        expect(entradas.length).toBeGreaterThan(0);
        for (const e of entradas) {
            const abs = path.join(RAIZ, e.url.replace(/^\.\//, ''));
            expect({ url: e.url, existe: fs.existsSync(abs) })
                .toEqual({ url: e.url, existe: true });
        }
    });

    it('`.vscodeignore` NO excluye schemas/ — si lo excluyera, las 3 urls colgarian en el paquete', () => {
        // La dependencia dura que el censo señalaba: las urls son RELATIVAS AL
        // PAQUETE, no al workspace. Un `.vscodeignore` que se lleve `schemas/`
        // deja tres declaraciones apuntando al vacio dentro del .vsix, y eso no
        // lo ve ningun test que solo mire el arbol de fuentes.
        const ignore = fs.readFileSync(path.join(RAIZ, '.vscodeignore'), 'utf8')
            .split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#'));
        const excluyentes = ignore.filter(p => /^!?schemas(\/|$)/.test(p) && !p.startsWith('!'));
        expect(excluyentes).toEqual([]);
    });
});
