module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    
    // Test file patterns
    testMatch: [
        '**/tests/**/*.test.ts',
        '**/tests/**/*.spec.ts'
    ],
    
    // Coverage configuration
    collectCoverage: true,
    coverageDirectory: 'coverage',
    // `json-summary` NO es decorativo: es la entrada del trinquete
    // (`scripts/cobertura-trinquete.mjs`), que lee `coverage-summary.json`.
    // Estaba apareciendo por su cuenta y el instrumento no puede depender de
    // un fichero que nadie declaró. WP-V93, 2ª vuelta.
    coverageReporters: ['text', 'lcov', 'html', 'json', 'json-summary'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/**/*.test.ts',
        '!src/**/*.spec.ts'
    ],
    
    // AQUÍ NO HAY `coverageThreshold`, Y ES A PROPÓSITO — WP-V93, 2ª vuelta.
    //
    // Hasta este WP decía 75/80/85/85 contra un ~26 % real, así que `npm test`
    // salía 1 SIEMPRE por un motivo que no tenía nada que ver con los tests. Un
    // umbral que no se cumple ningún día no vigila ninguno: en CI ese paso iba
    // marcado `continue-on-error`, de modo que la deuda de cobertura mantenía en
    // rojo perpetuo al ÚNICO paso que corría la suite, y ese rojo tapaba
    // cualquier otro.
    //
    // La primera entrega de V93 lo bajó al «suelo medido» 26/25/26/21. La
    // decisión de fondo era correcta; el instrumento, no — y por DOS medidas:
    //
    //   · jest compara el umbral con el `pct` YA REDONDEADO a dos decimales
    //     (`@jest/reporters/build/CoverageReporter.js:324`, `actual < threshold`),
    //     así que un déficit de 0,01 bloquea. El «colchón de 1 punto» que
    //     aquella entrega anunciaba eran en realidad SEIS sentencias de 5903.
    //     MEDIDO: con umbrales 26.11/25.14/26.56/21.52 caen las cuatro métricas
    //     con los 411 tests en verde.
    //
    //   · Y el porcentaje es una razón sobre un denominador INESTABLE: 3
    //     ficheros de `src` son código real que no compila (TS2353), no se
    //     instrumentan, y sus sentencias no entran en el total. MEDIDO: al
    //     entrar al mapa el denominador crece +135 sentencias / +67 ramas sin
    //     que lo cubierto se mueva. O sea que ARREGLAR dos errores de tipos
    //     ponía CI en rojo, y ROMPER la compilación de un fichero mal cubierto
    //     SUBÍA el porcentaje con la suite en verde.
    //
    // Por eso el trinquete se va de aquí a `scripts/cobertura-trinquete.mjs`,
    // que no usa porcentajes: compara UNIDADES CUBIERTAS ABSOLUTAS —inmunes al
    // denominador— contra `scripts/cobertura.suelo.json`, y falla en las DOS
    // direcciones (si baja, y si sube sin registrarse). Y comprueba además que
    // ningún fichero de `src` desaparezca del mapa sin declararlo.
    //
    // CONSECUENCIA QUE HAY QUE SABER: `npm test` a secas YA NO COMPRUEBA NADA
    // de cobertura. La recoge y la informa; quien la juzga es el trinquete, y
    // CI lo corre en el paso siguiente. La meta histórica 75/80/85/85 sigue
    // siendo deuda viva y no la vigila nadie, también a propósito: deuda y
    // defecto son cosas distintas, y sólo el defecto bloquea.
    
    // Setup files
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
    
    // Module name mapping
    moduleNameMapper: {
        '^vscode$': '<rootDir>/tests/mocks/vscode.mock.js'
    },
    
    // Transform configuration
    transform: {
        '^.+\\.ts$': 'ts-jest'
    },
    
    // Test timeout
    testTimeout: 10000,
    
    // Verbose output
    verbose: true,
    
    // Ignore patterns
    testPathIgnorePatterns: [
        '/node_modules/',
        '/out/',
        '/dist/'
    ],
    
    // Module file extensions
    moduleFileExtensions: ['ts', 'js', 'json'],
    
    // Clear mocks automatically
    clearMocks: true,
    
    // Restore mocks after each test
    restoreMocks: true,
    
    // Jest environment options
    testEnvironmentOptions: {
        node: {
            global: true
        }
    }
};
