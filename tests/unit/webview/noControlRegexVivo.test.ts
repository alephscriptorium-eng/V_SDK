/**
 * WP-V94 · VECTOR: la regla `no-control-regex` sigue VIVA.
 *
 * V94 puso DOS exenciones `eslint-disable-next-line` en
 * `src/webview/security.ts` porque las dos regex de allí casan caracteres de
 * control por exigencia de la norma WHATWG, no por descuido (el porqué está
 * escrito junto a las líneas).
 *
 * Una exención sin vigilancia es exactamente el patrón que este swarm lleva
 * siete olas cazando: se declara acotada y con el tiempo se convierte en
 * ceguera. Este fichero es la vigilancia. Demuestra CUATRO cosas, y las
 * demuestra ejecutando el linter de verdad sobre la configuración del repo,
 * no leyendo el fichero de config:
 *
 *   1. `security.ts`, tal cual está hoy, no tiene errores de `no-control-regex`.
 *   2. La exención es POR LÍNEA: una regex de control NUEVA metida en ESE MISMO
 *      fichero se caza igual. Las dos líneas eximidas no eximen al fichero.
 *   3. Las exenciones son LO ÚNICO que calla los dos hallazgos: quitando los dos
 *      comentarios, los dos errores vuelven. O sea que no se ha «arreglado» el
 *      código deletreándolo de otra forma — las regex siguen siendo las mismas.
 *   4. La regla sigue en `error` para cualquier otro fichero de `src`, y no está
 *      apagada ni rebajada en `.eslintrc.cjs`.
 *
 * Si alguien apaga la regla para todo el repo, o convierte estas exenciones en
 * una exención de fichero, este test se pone rojo.
 */
import * as fs from 'fs';
import * as path from 'path';

// `eslint` 8 no publica tipos propios y el repo no trae `@types/eslint`; se
// carga por `require`. (`tests/**` no se linta — ver cabecera de .eslintrc.cjs.)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ESLint } = require('eslint');

const RAIZ = path.resolve(__dirname, '..', '..', '..');
const RUTA_SECURITY = path.join(RAIZ, 'src', 'webview', 'security.ts');
const MARCA_EXENCION = 'eslint-disable-next-line no-control-regex';

interface MensajeLint {
    ruleId: string | null;
    severity: number;
    line: number;
    message: string;
}

/**
 * Una regex de control NUEVA, ensamblada en tiempo de ejecución para que ESTE
 * fichero de test no contenga bytes de control (que cualquier editor o
 * normalización de fin de línea podría alterar sin que nadie lo note).
 * U+0001 no aparece en `security.ts`: si se caza, es esta línea.
 */
const CONTRABANDO = 'export const CONTRABANDO_V94 = new RegExp("[' + String.fromCharCode(1) + ']");';

let eslint: { lintText(code: string, opts: { filePath: string }): Promise<Array<{ messages: MensajeLint[] }>> };

beforeAll(() => {
    eslint = new ESLint({ cwd: RAIZ });
});

/** Hallazgos de `no-control-regex` al lintar `codigo` como si fuera `rutaComoSi`. */
async function hallazgos(codigo: string, rutaComoSi: string): Promise<MensajeLint[]> {
    const [resultado] = await eslint.lintText(codigo, { filePath: rutaComoSi });
    return (resultado?.messages ?? []).filter(m => m.ruleId === 'no-control-regex');
}

const fuenteSecurity = (): string => fs.readFileSync(RUTA_SECURITY, 'utf8');

describe('WP-V94 · la exención de no-control-regex es acotada y la regla sigue viva', () => {
    test('1 · security.ts tal cual: cero errores de no-control-regex', async () => {
        expect(await hallazgos(fuenteSecurity(), RUTA_SECURITY)).toEqual([]);
    }, 60000);

    test('2 · la exención es POR LÍNEA: una regex de control nueva en ESE fichero sí se caza', async () => {
        const conContrabando = fuenteSecurity() + '\n' + CONTRABANDO + '\n';
        const encontrados = await hallazgos(conContrabando, RUTA_SECURITY);

        expect(encontrados).toHaveLength(1);
        expect(encontrados[0].severity).toBe(2); // 2 = error, no warning
        expect(encontrados[0].message).toContain('\\x01');
    }, 60000);

    test('3 · sin los dos comentarios de exención, los dos errores vuelven', async () => {
        const fuente = fuenteSecurity();
        const sinExenciones = fuente
            .split('\n')
            .filter(l => !l.includes(MARCA_EXENCION))
            .join('\n');

        // sanity: los comentarios existían y se han quitado los dos
        expect(fuente.split(MARCA_EXENCION).length - 1).toBe(2);
        expect(sinExenciones).not.toContain(MARCA_EXENCION);

        const encontrados = await hallazgos(sinExenciones, RUTA_SECURITY);
        expect(encontrados).toHaveLength(2);
        expect(encontrados.every(m => m.severity === 2)).toBe(true);
        // Son las DOS regex de la WHATWG, no otra cosa que se haya colado.
        expect(encontrados[0].message).toContain('\\x09');
        expect(encontrados[1].message).toContain('\\x00');
    }, 60000);

    test('4 · la regla es ERROR en cualquier otro fichero de src', async () => {
        const encontrados = await hallazgos(CONTRABANDO, path.join(RAIZ, 'src', 'otroFicheroCualquiera.ts'));

        expect(encontrados).toHaveLength(1);
        expect(encontrados[0].severity).toBe(2);
    }, 60000);

    test('5 · no hay exención de FICHERO ni de repo para esta regla', () => {
        // (a) en security.ts las dos exenciones son de LÍNEA, no de bloque
        const fuente = fuenteSecurity();
        expect(fuente).not.toMatch(/\/\*\s*eslint-disable\s+no-control-regex/);
        expect(fuente).not.toMatch(/eslint-disable-next-line\s*$/m); // sin regla nombrada

        // (b) en NINGÚN fichero de src hay un apagado en bloque de la regla
        //     (ni un `eslint-disable` a secas, que apaga todo de golpe)
        const ficheros: string[] = [];
        const recorrer = (dir: string): void => {
            for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
                const p = path.join(dir, e.name);
                if (e.isDirectory()) {
                    recorrer(p);
                } else if (e.name.endsWith('.ts')) {
                    ficheros.push(p);
                }
            }
        };
        recorrer(path.join(RAIZ, 'src'));
        expect(ficheros.length).toBeGreaterThan(50); // el recorrido encontró src de verdad

        const apagadosEnBloque = ficheros.filter(f => {
            const t = fs.readFileSync(f, 'utf8');
            return (
                /\/\*\s*eslint-disable\s*\*\//.test(t) ||
                /\/\*\s*eslint-disable\s+[^*]*no-control-regex/.test(t)
            );
        });
        expect(apagadosEnBloque).toEqual([]);

        // (c) la config no rebaja la regla: si alguien la pone en 'off' o 'warn',
        //     aquí se ve. (Se lee el texto: el objeto exportado no dice nada de
        //     las reglas que hereda de `eslint:recommended`, donde vive en error.)
        const config = fs.readFileSync(path.join(RAIZ, '.eslintrc.cjs'), 'utf8');
        expect(config).not.toMatch(/['"]no-control-regex['"]\s*:/);
    });
});
