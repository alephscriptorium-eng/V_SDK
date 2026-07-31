/* eslint-env node */
/**
 * ESLint · carril V (Zigurat) — WP-V16 (c) · V-L1-03
 *
 * POR QUÉ ASÍ (decidido con censo, no con gusto)
 *   `npm run lint` era `node -e "console.log(…)"`: salía 0 siempre. El paso
 *   de CI que lo ejecutaba (ci.yml «Lint») era, por construcción, verde.
 *
 *   Censo de una pasada sobre `src` (eslint 8.57 · recommended +
 *   @typescript-eslint/recommended, sin type-checking):
 *
 *     371 errores · 102 ficheros analizados · 60 con al menos un error
 *     248  @typescript-eslint/no-explicit-any
 *     107  @typescript-eslint/no-unused-vars
 *       6  no-case-declarations
 *       5  @typescript-eslint/no-var-requires
 *       2  prefer-const
 *       1  no-useless-escape
 *       1  no-prototype-builtins
 *       1  no-self-assign
 *
 *   Ocho reglas disparan; las ~90 restantes del conjunto recomendado tienen
 *   CERO violaciones en el legado. Esas ~90 quedan en `error`: el lint
 *   PUEDE fallar y falla en cuanto código nuevo las viola. Las ocho pasan a
 *   `warn` con su recuento: deuda declarada y visible en cada corrida, no
 *   silenciada. Arreglarlas exige escribir en `src/**`, que está fuera del
 *   alcance de este WP.
 *
 * ALCANCE DEL LINT
 *   Solo `src/**\/*.ts`. `tests/**` y `scripts/**` NO se lintan hoy — está
 *   declarado en README y en el reporte. Consecuencia buscada: el fichero
 *   de pruebas nuevo de WP-V17 (`tests/unit/…`) no queda acoplado a estas
 *   reglas (nota del vigía-S, §2).
 *
 * SIGUIENTE PASO (no de este WP)
 *   Bajar la deuda y subir las ocho a `error` una por una. Un tope
 *   `--max-warnings` como trinquete se descartó aquí: acoplaría el CI a
 *   cualquier WP que añada un `any` en `src`.
 */
module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
    },
    plugins: ['@typescript-eslint'],
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    env: {
        node: true,
        es2022: true,
        browser: true
    },
    ignorePatterns: ['dist/', 'out/', 'node_modules/', '.vscode-test/'],
    rules: {
        // --- Deuda del legado: censada, visible, NO silenciada. -------------
        '@typescript-eslint/no-explicit-any': 'warn', // 248
        '@typescript-eslint/no-unused-vars': 'warn', // 107
        'no-case-declarations': 'warn', //   6
        '@typescript-eslint/no-var-requires': 'warn', //   5
        'prefer-const': 'warn', //   2
        'no-useless-escape': 'warn', //   1
        'no-prototype-builtins': 'warn', //   1
        'no-self-assign': 'warn' //   1
        ,
        /**
         * WP-V71 · TRINQUETE del log estructurado — TRES sensores.
         *
         * El destino del diagnóstico es el OutputChannel propio
         * (`src/core/logging`), no la consola del Extension Host: un
         * `console.log` no se ve sin abrir DevTools, así que en la máquina de
         * un tercero equivale a no haber logueado.
         *
         * Se eligen REGLAS y no un grep porque leen el AST: a la vez cazan
         * formas que un regex no ve y NO dan falso positivo con el texto
         * «console.log» dentro de un literal (JS de webview embebido en una
         * plantilla, p. ej. `src/socketMonitor.ts:613`).
         *
         * Por qué tres y no una: `no-console` sola deja pasar el ALIAS. Medido
         * con una sonda de 9 formas de evasión (reporte de V71, CA1):
         *   `no-console` .................... caza 6/9
         *   + `no-restricted-globals` ....... caza 8/9 (añade `const c = console`
         *                                     y `const { log } = console`)
         *   + `no-restricted-properties` .... caza 9/9 (añade `globalThis.console`)
         *
         * Los tres en `error`: el lint FALLA en cuanto código nuevo los viola.
         */
        'no-console': 'error',
        'no-restricted-globals': ['error', {
            name: 'console',
            message: 'Usa el canal estructurado: getLogger() de src/core/logging (WP-V71).'
        }],
        'no-restricted-properties': [
            'error',
            ...['globalThis', 'global', 'window', 'self'].map(object => ({
                object,
                property: 'console',
                message: 'Usa el canal estructurado: getLogger() de src/core/logging (WP-V71).'
            }))
        ]
    },
    overrides: [
        {
            /**
             * WP-V71 · carve-out temporal de FRONTERA, no de criterio.
             *
             * Estos dos ficheros son obra VIVA del carril V66 (CSP) en
             * `wp/v66-csp` mientras se escribe esto; V71 no escribe obra ajena
             * (invariante I-2 de `plan/PRACTICAS.md`). Sus 10 `console.*`
             * quedan inventariados en `plan/REPORTES/WP-V71-log-estructurado.md`
             * con la migración exacta ya redactada.
             *
             * AL CERRAR V66: borrar este bloque entero y migrar esos 10 sitios.
             * Mientras tanto siguen VISIBLES como warning en cada corrida — la
             * deuda se declara, no se silencia (`off` sería esconderla).
             */
            files: ['src/views/BaseHackerPanelProvider.ts', 'src/views/TeatroWebViewProvider.ts'],
            rules: {
                'no-console': 'warn',
                'no-restricted-globals': 'warn',
                'no-restricted-properties': 'warn'
            }
        }
    ]
};
