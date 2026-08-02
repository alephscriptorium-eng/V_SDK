/**
 * =============================================================================
 * WP-V25 · GATE — ningún comando promete lo que no cumple
 * =============================================================================
 *
 * QUÉ VIGILA
 *   Un comando que aparece en `contributes.commands` de `package.json` sale en
 *   la paleta del usuario. Si nadie lo registra con
 *   `vscode.commands.registerCommand`, invocarlo no hace NADA —o levanta el
 *   error crudo «command 'x' not found» si lo llama otro código—. Eso es la
 *   forma más literal del defecto que este programa persigue: algo que promete
 *   más de lo que cumple. Antes de este WP había 31 así.
 *
 * DE DÓNDE SALEN LOS DATOS — NADA INFERIDO
 *   · Declarados: se LEE `package.json` y se recorre `contributes.commands`.
 *     NO se hace grep de `"command":`, porque esa clave aparece también en
 *     `contributes.menus` y el número sale inflado (158 en vez de 99 el día
 *     que se midió).
 *   · Registrados: se IMPORTA `commandTable` —el módulo de verdad, no su
 *     texto— y se INSTANCIA `CommandPaletteManager`, que registra 16 comandos
 *     más por su cuenta desde el constructor. Contar sólo la tabla es contar
 *     mal: son dos fuentes, y el cruce necesita las dos.
 *
 * LAS DOS DIRECCIONES, Y POR QUÉ NO SON SIMÉTRICAS (WP-V25 CA4)
 *   · DECLARADO SIN HANDLER → ROJO, SIEMPRE, SIN EXCEPCIONES. Es la dirección
 *     que MIENTE al usuario: se le ofrece algo que no existe.
 *   · REGISTRADO SIN DECLARAR → ROJO TAMBIÉN, salvo que el id esté en
 *     `REGISTRO_INTERNO` de aquí abajo CON MOTIVO ESCRITO. Esta dirección no
 *     miente a nadie —no promete nada—, pero esconde: un comando que nadie
 *     declara es invisible en la paleta y sólo lo alcanza quien conoce su id.
 *     Hay un uso legítimo (el `treeItem.command` de un ítem de árbol, que VS
 *     Code no exige contribuir), y por eso la excepción existe; existe COMO
 *     LISTA CON NOMBRE para que añadir una sea una línea de diff que alguien
 *     firma, igual que el suelo del trinquete de cobertura.
 *
 * LO QUE ESTE GATE **NO** MIRA
 *   Si el handler hace algo ÚTIL. Aquí se vigila el cable, no la utilidad. Un
 *   handler que llama a un método del proveedor que hoy simula la conexión
 *   (`SocketsTreeDataProvider.connectToServer` dice «Would use
 *   SocketMonitor.connect() in real implementation») pasa este gate y debe
 *   pasarlo: es otra ficha. Lo que no puede volver a pasar es que no haya
 *   cable.
 */
import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// POR QUÉ ESTOS TRES `jest.mock` — Y POR QUÉ NO TOCAN NADA DE LO QUE SE MIDE
//
// `commandTable` arrastra `mcpDomainCommands`, que importa CatalogService /
// AuthorshipService / ResourceProjectionService, y cada uno de ésos importa uno
// de los TRES ficheros que hoy NO COMPILAN en este repo (TS2353 sobre
// `capabilities: { resources: {} }` contra los tipos de @modelcontextprotocol/
// sdk). Están declarados como deuda con nombre y apellidos en
// `scripts/cobertura.suelo.json` → `censo.NO-COMPILA`, y arreglarlos es de otro
// WP: `src/launcher`, `src/mutation` y `src/resources` no están en el
// ALCANCE_DIFF de V25. Sin estos mocks, ts-jest tumba la SUITE ENTERA antes de
// ejecutar un solo test — que es exactamente por qué las tablas de comandos
// llevaban desde V80 sin una sola prueba.
//
// El mock es una fábrica (no `jest.mock` a secas): así jest ni siquiera CARGA
// el módulo roto, y por tanto ts-jest no lo transforma. Y no falsea la medida:
// las tres clases sólo se instancian dentro de los servicios, que este test no
// llama; lo que se mide aquí son `entry.id` y que `entry.handler(deps)` fabrique
// una función. Si algún día compilan, borrar estas tres líneas no cambia ni un
// id del censo.
// ---------------------------------------------------------------------------
jest.mock('../../../../../src/launcher/LauncherCatalogClient', () => ({
    LauncherCatalogClient: class { }
}));
jest.mock('../../../../../src/mutation/LineaEditorClient', () => ({
    LineaEditorClient: class { }
}));
jest.mock('../../../../../src/resources/McpResourceClient', () => ({
    McpResourceClient: class { }
}));

// Y estos dos son el paquete `@zeus/protocol`, que se publica como ESM puro
// (`.mjs`) y jest —configurado en CJS -- no sabe parsear: «Cannot use import
// statement outside a module». Se sustituye el PAQUETE, no código nuestro:
// `src/identity/protocolApi.ts` y `RoomIdentityService` se cargan de verdad.
// Nada de esto se invoca al cargar el módulo; el censo no depende de ello.
jest.mock('@zeus/protocol/peer-card', () => ({
    isPeerCardShaped: () => false,
    isPeerCardFresh: () => false,
    isSsbId: () => false,
    peerCardPhase: () => 'expired',
    peerCardRemainingMs: () => 0,
    PEER_CARD_PHASE: { EXPIRED: 'expired' }
}));
jest.mock('@zeus/protocol/peer-card-seat', () => ({
    verifyTravelingPeerCard: () => ({ ok: false, error: 'stub de test' })
}));
jest.mock('@zeus/reparto-kit/filas', () => ({
    filasCastDesdeReparto: () => []
}));
jest.mock('@zeus/reparto-kit/tipos', () => ({
    isRepartoShaped: () => false,
    REPARTO_VERSION: 'reparto/1'
}));

/* eslint-disable import/first */
import { commandTable, CommandDeps } from '../../../../../src/core/bootstrap/commands';
import { CommandPaletteManager } from '../../../../../src/commandPaletteManager';

const RAIZ = path.resolve(__dirname, '../../../../..');

/**
 * Comandos REGISTRADOS a propósito sin contribuir a `contributes.commands`.
 * Cada uno con su motivo. Añadir una línea aquí es una decisión firmada.
 */
const REGISTRO_INTERNO: Record<string, string> = {
    'aleph0.logs.showEntry':
        'destino de `treeItem.command` de cada entrada de la vista alephscript.logs ' +
        '(src/treeViews/logsTreeView.ts). VS Code no exige contribuir los comandos de ' +
        'ítem de árbol, y en la paleta —sin entrada seleccionada— no tendría sentido.',
    'aleph0.showStatusPanel':
        'alias heredado de aleph0.system.showStatus; lo invoca por `executeCommand` ' +
        'CommandPaletteManager.showSystemStatus(). Registrado para que aleph0.systemStatus ' +
        'no muera con «command not found»; NO contribuido para no duplicar la entrada de ' +
        'paleta. Se retira entero cuando se pueda tocar src/commandPaletteManager.ts.'
};

/** Los 56 ids que dejó WP-V80, en su orden exacto de registro. */
const LOS_56_DE_V80 = [
    'aleph0.webview.showDashboard',
    'aleph0.webview.openWebRTC',
    'aleph0.webview.openThreeJS',
    'aleph0.webview.openSocket',
    'aleph0.webview.openDriver',
    'aleph0.webview.reloadAll',
    'aleph0.hackerControlPanel.toggle',
    'aleph0.hackerCommandPanel.toggle',
    'aleph0.hackerConfigPanel.toggle',
    'aleph0.hackerTasksPanel.toggle',
    'aleph0.hackerTasksPanel.refresh',
    'aleph0.hackerTasksPanel.runDefault',
    'aleph0.hackerTasksPanel.stopAll',
    'aleph0.statusBar.animate',
    'aleph0.statusBar.toggle',
    'aleph0.analytics.showDashboard',
    'aleph0.analytics.export',
    'aleph0.analytics.clear',
    'aleph0.process.startLauncher',
    'aleph0.process.stopLauncher',
    'aleph0.demo.runAll',
    'aleph0.demo.stopAll',
    'aleph0.system.showStatus',
    'aleph0.system.restart',
    'aleph0.ai.askAssistant',
    'aleph0.ai.codeAnalysis',
    'aleph0.ai.optimizeWorkflow',
    'aleph0.ai.viewStats',
    'aleph0.teatro.refresh',
    'aleph0.mcptree.refresh',
    'aleph0.identity.join',
    'aleph0.identity.refresh',
    'aleph0.resources.refresh',
    'aleph0.authorship.refreshGate',
    'aleph0.authorship.crearLinea',
    'aleph0.authorship.exportStoryBoard',
    'aleph0.elenco.refresh',
    'aleph0.mcptree.start',
    'aleph0.mcptree.stop',
    'aleph0.mcptree.web.open',
    'aleph0.uis.refresh',
    'aleph0.teatro.activateAgent',
    'aleph0.teatro.deactivateAgent',
    'aleph0.teatro.openChatParticipant',
    'aleph0.teatro.showAgentInfo',
    'aleph0.teatro.openTeatroPanel',
    'aleph0.agents.createNew',
    'aleph0.agents.editContent',
    'aleph0.agents.editConfig',
    'aleph0.agents.validateAll',
    'aleph0.mcpSocketManager.openSocketMonitor',
    'aleph0.sockets.refresh',
    'aleph0.aracne.connect',
    'aleph0.aracne.disconnect',
    'aleph0.aracne.status',
    'aleph0.configs.refresh'
];

// ---------------------------------------------------------------------------
// El instrumento: una función pura. La usan igual el censo real y los vectores
// plantados, para que no haya dos códigos y uno sin probar.
// ---------------------------------------------------------------------------

interface Censo {
    /** Declarados en package.json que nadie registra. Miente al usuario. */
    sinHandler: string[];
    /** Registrados que nadie declara y no están en REGISTRO_INTERNO. */
    sinDeclarar: string[];
    /** Ids declarados más de una vez en contributes.commands. */
    duplicados: string[];
    /** Ids registrados por DOS fuentes: VS Code revienta al activar. */
    colisiones: string[];
}

function censar(
    declarados: string[],
    tabla: string[],
    paleta: string[],
    interno: Record<string, string> = REGISTRO_INTERNO
): Censo {
    const declSet = new Set(declarados);
    const registrados = [...tabla, ...paleta];
    const regSet = new Set(registrados);

    const vistos = new Set<string>();
    const duplicados: string[] = [];
    for (const id of declarados) {
        if (vistos.has(id) && !duplicados.includes(id)) {
            duplicados.push(id);
        }
        vistos.add(id);
    }

    const enTabla = new Set(tabla);

    return {
        sinHandler: declarados.filter(id => !regSet.has(id)).filter((id, i, a) => a.indexOf(id) === i),
        sinDeclarar: [...regSet].filter(id => !declSet.has(id) && !(id in interno)),
        duplicados,
        colisiones: paleta.filter(id => enTabla.has(id))
    };
}

/** Convierte el censo en rojo. Es EL punto por el que pasa el gate. */
function exigirCensoLimpio(c: Censo): void {
    const partes: string[] = [];
    if (c.duplicados.length) {
        partes.push(`ids declarados por duplicado en contributes.commands: ${c.duplicados.join(', ')}`);
    }
    if (c.sinHandler.length) {
        partes.push(
            `COMANDOS DECLARADOS SIN HANDLER (${c.sinHandler.length}) — el usuario los ve en la ` +
            `paleta y no hacen nada: ${c.sinHandler.join(', ')}`
        );
    }
    if (c.sinDeclarar.length) {
        partes.push(
            `COMANDOS REGISTRADOS SIN DECLARAR (${c.sinDeclarar.length}) — invisibles en la paleta; ` +
            `decláralos en package.json o justifícalos en REGISTRO_INTERNO: ${c.sinDeclarar.join(', ')}`
        );
    }
    if (c.colisiones.length) {
        partes.push(
            `MISMO ID REGISTRADO DOS VECES (${c.colisiones.length}) — VS Code lanza al activar la ` +
            `extensión: ${c.colisiones.join(', ')}`
        );
    }
    if (partes.length) {
        throw new Error('WP-V25 · censo de comandos sucio:\n  · ' + partes.join('\n  · '));
    }
}

// ---------------------------------------------------------------------------
// Las tres fuentes reales
// ---------------------------------------------------------------------------

function declaradosDePackageJson(): string[] {
    const pkg = JSON.parse(fs.readFileSync(path.join(RAIZ, 'package.json'), 'utf8'));
    return (pkg.contributes.commands as Array<{ command: string }>).map(c => c.command);
}

function idsDeLaPaleta(): string[] {
    const contextoFalso = {
        subscriptions: [] as unknown[],
        extensionUri: { fsPath: '/test', path: '/test' },
        extensionPath: '/test'
    };
    // El constructor es quien registra: instanciarlo ES la medida.
    const paleta = CommandPaletteManager.getInstance(contextoFalso as never);
    return paleta.getAllCommands().map(c => c.id);
}

describe('WP-V25 · censo de comandos', () => {
    const declarados = declaradosDePackageJson();
    const tabla = commandTable.map(e => e.id);
    const paleta = idsDeLaPaleta();

    describe('el gate', () => {
        it('ningún comando declarado se queda sin handler, y ningún handler sin declarar', () => {
            expect(() => exigirCensoLimpio(censar(declarados, tabla, paleta))).not.toThrow();
        });

        it('ningún id se declara dos veces en contributes.commands', () => {
            expect(censar(declarados, tabla, paleta).duplicados).toEqual([]);
        });

        it('ningún id se registra por dos fuentes a la vez', () => {
            expect(censar(declarados, tabla, paleta).colisiones).toEqual([]);
        });

        it('todo lo que menús y atajos invocan está declarado', () => {
            const pkg = JSON.parse(fs.readFileSync(path.join(RAIZ, 'package.json'), 'utf8'));
            const referidos = new Set<string>();
            for (const entradas of Object.values(pkg.contributes.menus) as Array<Array<{ command?: string }>>) {
                for (const e of entradas) {
                    if (e.command) {
                        referidos.add(e.command);
                    }
                }
            }
            for (const k of (pkg.contributes.keybindings ?? []) as Array<{ command: string }>) {
                referidos.add(k.command);
            }
            const declSet = new Set(declarados);
            expect([...referidos].filter(id => !declSet.has(id))).toEqual([]);
        });

        it('cada fila de la tabla fabrica una función de verdad', () => {
            const deps = {
                managers: {} as CommandDeps['managers'],
                getContext: () => undefined,
                getVsCodeContext: () => undefined,
                showSystemStatus: () => undefined,
                restartExtension: async () => undefined
            } as CommandDeps;
            for (const fila of commandTable) {
                expect(typeof fila.handler).toBe('function');
                expect(typeof fila.handler(deps)).toBe('function');
            }
        });
    });

    // -----------------------------------------------------------------------
    // VECTORES PLANTADOS — la prueba de que el gate MUERDE.
    // Un gate verde sobre un árbol limpio no demuestra nada: podría estar
    // comparando dos listas vacías. Aquí se le mete el defecto a mano, por las
    // dos direcciones, y se exige que salte POR EL MISMO camino que protege el
    // repo (`exigirCensoLimpio`), no por uno de mentira escrito para el test.
    // -----------------------------------------------------------------------
    describe('vectores plantados', () => {
        it('DIRECCIÓN 1 · declarar un comando sin handler pone rojo', () => {
            const conFantasma = [...declarados, 'aleph0.vector.fantasma'];
            const c = censar(conFantasma, tabla, paleta);
            expect(c.sinHandler).toEqual(['aleph0.vector.fantasma']);
            expect(() => exigirCensoLimpio(c)).toThrow(/DECLARADOS SIN HANDLER \(1\)/);
            expect(() => exigirCensoLimpio(c)).toThrow(/aleph0\.vector\.fantasma/);
        });

        it('DIRECCIÓN 2 · registrar un comando sin declararlo pone rojo', () => {
            const c = censar(declarados, [...tabla, 'aleph0.vector.mudo'], paleta);
            expect(c.sinDeclarar).toEqual(['aleph0.vector.mudo']);
            expect(() => exigirCensoLimpio(c)).toThrow(/REGISTRADOS SIN DECLARAR \(1\)/);
        });

        it('DIRECCIÓN 2 · … salvo que esté en REGISTRO_INTERNO con motivo', () => {
            const c = censar(declarados, [...tabla, 'aleph0.vector.mudo'], paleta, {
                ...REGISTRO_INTERNO,
                'aleph0.vector.mudo': 'motivo de prueba'
            });
            expect(c.sinDeclarar).toEqual([]);
            expect(() => exigirCensoLimpio(c)).not.toThrow();
        });

        it('un id declarado dos veces pone rojo', () => {
            const c = censar([...declarados, declarados[0]], tabla, paleta);
            expect(c.duplicados).toEqual([declarados[0]]);
            expect(() => exigirCensoLimpio(c)).toThrow(/por duplicado/);
        });

        it('el mismo id registrado por las dos fuentes pone rojo', () => {
            const c = censar([...declarados, 'aleph0.vector.doble'], [...tabla, 'aleph0.vector.doble'], [
                ...paleta,
                'aleph0.vector.doble'
            ]);
            expect(c.colisiones).toEqual(['aleph0.vector.doble']);
            expect(() => exigirCensoLimpio(c)).toThrow(/DOS VECES/);
        });

        it('el gate NO se conforma con listas vacías (no es un verde de adorno)', () => {
            // Si alguien vacía `contributes.commands`, el censo sale limpio por
            // la dirección 1 pero TODO lo registrado queda sin declarar.
            const c = censar([], tabla, paleta);
            expect(c.sinHandler).toEqual([]);
            expect(c.sinDeclarar.length).toBeGreaterThan(50);
            expect(() => exigirCensoLimpio(c)).toThrow();
        });
    });

    // -----------------------------------------------------------------------
    // CA5 · cero regresión visible sobre la tabla que dejó V80
    // -----------------------------------------------------------------------
    describe('equivalencia con WP-V80', () => {
        it('los 56 ids de V80 siguen ahí', () => {
            expect(LOS_56_DE_V80.filter(id => !tabla.includes(id))).toEqual([]);
            expect(LOS_56_DE_V80).toHaveLength(56);
        });

        it('los 56 ids de V80 conservan su orden relativo exacto', () => {
            // Subsecuencia: V25 sólo INSERTA filas; no reordena ninguna.
            const soloLos56 = tabla.filter(id => LOS_56_DE_V80.includes(id));
            expect(soloLos56).toEqual(LOS_56_DE_V80);
        });

        it('la tabla no repite ningún id', () => {
            expect(tabla.length).toBe(new Set(tabla).size);
        });
    });

    // -----------------------------------------------------------------------
    // El denominador, escrito. Si estos números se mueven, alguien lo firma.
    // -----------------------------------------------------------------------
    describe('el denominador declarado', () => {
        it('las cifras del censo son las del reporte de V25', () => {
            expect(declarados.length).toBe(91);
            expect(new Set(declarados).size).toBe(91);
            expect(tabla).toHaveLength(77);
            expect(paleta).toHaveLength(16);
            expect(Object.keys(REGISTRO_INTERNO)).toHaveLength(2);
        });
    });
});
