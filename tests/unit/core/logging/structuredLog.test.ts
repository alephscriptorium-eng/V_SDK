/**
 * WP-V71 · el canal: forma de la línea, correlación, redacción de punta a
 * punta y las dos invariantes duras (no lanza · no cae de vuelta a consola).
 */
import * as vscode from 'vscode';
import {
    getLogger,
    getLogSessionId,
    getRecentLogEntries,
    renderRecentLogEntries,
    disposeStructuredLog,
    __resetStructuredLogForTests,
    DIAGNOSTIC_CHANNEL_NAME,
    REDACTED
} from '../../../../src/core/logging';

/** Líneas realmente entregadas al OutputChannel de VS Code. */
function channelLines(): string[] {
    const results = (vscode.window.createOutputChannel as jest.Mock).mock.results;
    const lines: string[] = [];
    for (const r of results) {
        const appendLine = r.value?.appendLine as jest.Mock | undefined;
        for (const call of appendLine?.mock?.calls ?? []) {
            lines.push(String(call[0]));
        }
    }
    return lines;
}

beforeEach(() => {
    __resetStructuredLogForTests();
});

afterAll(() => {
    __resetStructuredLogForTests();
});

describe('WP-V71 · canal', () => {
    it('no crea ningún OutputChannel por el mero hecho de importar/obtener el logger', () => {
        const spy = vscode.window.createOutputChannel as jest.Mock;
        spy.mockClear();
        getLogger('SoloObtenido');
        expect(spy).not.toHaveBeenCalled();
    });

    it('crea el canal con el nombre de la identidad nueva al primer log', () => {
        const spy = vscode.window.createOutputChannel as jest.Mock;
        spy.mockClear();
        getLogger('Arranque').info('hola');
        expect(spy).toHaveBeenCalledWith(DIAGNOSTIC_CHANNEL_NAME);
    });

    it('abre con una cabecera de sesión con lo necesario para una máquina ajena', () => {
        getLogger('Arranque').info('hola');
        const cabecera = channelLines().join('\n');
        expect(cabecera).toContain('Aleph-0 · diagnóstico · sesión');
        expect(cabecera).toContain('iniciada');
        expect(cabecera).toContain('extensión');
        expect(cabecera).toContain('vs code');
        expect(cabecera).toContain('plataforma');
    });
});

describe('WP-V71 · forma de la línea', () => {
    it('lleva marca de tiempo ISO-8601 UTC, nivel, origen y correlación', () => {
        getLogger('ProcessManager').info('Process started', { name: 'launcher' });
        const linea = renderRecentLogEntries().pop()!;

        expect(linea).toMatch(
            /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[INFO \] \[ProcessManager\] \[s=[0-9a-f]{8} #\d+\] Process started \| \{"name":"launcher"\}$/
        );
    });

    it('la marca de tiempo es UTC, no hora local (un log de otro huso debe ser legible)', () => {
        getLogger('X').info('m');
        expect(renderRecentLogEntries().pop()!).toContain('Z] ');
    });

    it('el nivel va a ancho fijo para que el grep por [ERROR] case siempre', () => {
        const log = getLogger('X');
        log.info('a');
        log.error('b');
        const [info, error] = renderRecentLogEntries(2);
        expect(info).toContain('[INFO ]');
        expect(error).toContain('[ERROR]');
    });

    it('cada nivel emite en su nivel y todos los migrados (info/warn/error) salen', () => {
        const log = getLogger('X');
        log.info('i');
        log.warn('w');
        log.error('e');
        expect(getRecentLogEntries().map(e => e.message)).toEqual(['i', 'w', 'e']);
    });

    it('la secuencia es monótona: delata líneas perdidas', () => {
        const log = getLogger('X');
        log.info('1');
        log.info('2');
        log.info('3');
        expect(getRecentLogEntries().map(e => e.seq)).toEqual([1, 2, 3]);
    });

    it('todas las líneas de una sesión comparten el mismo id de sesión', () => {
        getLogger('A').info('a');
        getLogger('B').info('b');
        const session = getLogSessionId();
        expect(getRecentLogEntries().every(e => e.session === session)).toBe(true);
    });
});

describe('WP-V71 · correlación', () => {
    it('forOperation hilvana las líneas de un mismo flujo con el mismo op=', () => {
        const op = getLogger('ProcessManager').forOperation('start');
        op.info('lanzando');
        op.info('lanzado');
        const ops = getRecentLogEntries().map(e => e.operation);
        expect(ops[0]).toBeDefined();
        expect(ops[0]).toBe(ops[1]);
        expect(renderRecentLogEntries().pop()).toContain(`op=${ops[0]}`);
    });

    it('dos operaciones distintas no se confunden entre sí', () => {
        const log = getLogger('ProcessManager');
        const a = log.forOperation('start');
        const b = log.forOperation('start');
        a.info('a');
        b.info('b');
        const [ea, eb] = getRecentLogEntries(2);
        expect(ea.operation).not.toBe(eb.operation);
    });

    it('sin operación la línea no inventa un op=', () => {
        getLogger('X').info('suelta');
        expect(renderRecentLogEntries().pop()).not.toContain('op=');
    });
});

describe('WP-V71 · nada de secretos en el canal (CA4, de punta a punta)', () => {
    it('tapa un token pasado como dato estructurado', () => {
        getLogger('Mesh').info('conectando', { url: 'http://m.local', token: 'ghp_secreto' });
        const linea = renderRecentLogEntries().pop()!;
        expect(linea).not.toContain('ghp_secreto');
        expect(linea).toContain(REDACTED);
    });

    it('tapa credenciales incrustadas en el MENSAJE, no solo en los datos', () => {
        getLogger('Mesh').info('conectando a https://ada:s3cr3t@mesh.local/runtime');
        expect(renderRecentLogEntries().pop()).not.toContain('s3cr3t');
    });

    it('tapa la línea de comando de un proceso con credenciales', () => {
        getLogger('ProcessManager').info('Process launching', {
            command: 'node launcher.js --token sk-live-42'
        });
        expect(renderRecentLogEntries().pop()).not.toContain('sk-live-42');
    });

    it('una línea siempre es UNA línea: un dato multilínea no rompe el formato', () => {
        getLogger('X').info('m', { texto: 'uno\ndos\ntres' });
        expect(renderRecentLogEntries().pop()!.split('\n')).toHaveLength(1);
    });
});

describe('WP-V71 · invariantes duras', () => {
    it('NUNCA lanza aunque el canal falle al escribir', () => {
        (vscode.window.createOutputChannel as jest.Mock).mockReturnValueOnce({
            name: 'roto',
            appendLine: () => {
                throw new Error('canal roto');
            },
            append: jest.fn(),
            clear: jest.fn(),
            show: jest.fn(),
            hide: jest.fn(),
            dispose: jest.fn()
        });
        expect(() => getLogger('X').error('debe sobrevivir')).not.toThrow();
    });

    it('NUNCA lanza aunque no exista API de OutputChannel', () => {
        const original = vscode.window.createOutputChannel;
        (vscode.window as any).createOutputChannel = undefined;
        try {
            expect(() => getLogger('X').info('sin canal')).not.toThrow();
            expect(getRecentLogEntries()).toHaveLength(1); // el anillo sigue reteniendo
        } finally {
            (vscode.window as any).createOutputChannel = original;
        }
    });

    it('NUNCA cae de vuelta a la consola: ni siquiera cuando el canal está roto', () => {
        const spies = {
            log: jest.spyOn(console, 'log').mockImplementation(() => undefined),
            warn: jest.spyOn(console, 'warn').mockImplementation(() => undefined),
            error: jest.spyOn(console, 'error').mockImplementation(() => undefined)
        };
        (vscode.window.createOutputChannel as jest.Mock).mockReturnValueOnce({
            name: 'roto',
            appendLine: () => {
                throw new Error('canal roto');
            },
            append: jest.fn(),
            clear: jest.fn(),
            show: jest.fn(),
            hide: jest.fn(),
            dispose: jest.fn()
        });

        const log = getLogger('X');
        log.info('i');
        log.warn('w');
        log.error('e');

        expect(spies.log).not.toHaveBeenCalled();
        expect(spies.warn).not.toHaveBeenCalled();
        expect(spies.error).not.toHaveBeenCalled();
        spies.log.mockRestore();
        spies.warn.mockRestore();
        spies.error.mockRestore();
    });

    it('un mensaje no-string no rompe la línea', () => {
        expect(() => getLogger('X').info(undefined as unknown as string)).not.toThrow();
    });

    it('dispose cierra el canal y vacía el anillo', () => {
        getLogger('X').info('antes');
        expect(getRecentLogEntries().length).toBeGreaterThan(0);
        disposeStructuredLog();
        expect(getRecentLogEntries()).toHaveLength(0);
    });
});
