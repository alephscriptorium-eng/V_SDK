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
    coverageReporters: ['text', 'lcov', 'html', 'json'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/**/*.test.ts',
        '!src/**/*.spec.ts'
    ],
    
    // Trinquete de cobertura — WP-V93.
    //
    // Estos números NO son una meta: son el SUELO MEDIDO. Hasta hoy decían
    // 75/80/85/85 contra un ~26 % real, así que `npm test` salía 1 SIEMPRE, y
    // por una razón que no tenía nada que ver con los tests. Un umbral que no
    // se cumple ningún día no vigila ninguno: se ignora. En CI ese mismo paso
    // iba marcado `continue-on-error`, de modo que la deuda de cobertura
    // mantenía en rojo perpetuo al ÚNICO paso que corría la suite — y un rojo
    // perpetuo tapa cualquier rojo nuevo.
    //
    // MEDIDO el 2026-08-01 en este árbol (411 tests · 410 pass · 1 skip ·
    // 0 fail · node v22.21.1 · jest 29.7.0 · Windows 11, 12 CPU):
    //
    //     statements 26.1 · branches 25.13 · lines 26.55 · functions 21.51
    //
    // El suelo se declara TRUNCADO al entero inferior. Ese punto de holgura no
    // es descuido, es el precio de una acotación que hay que decir en voz alta:
    // la medida es de Windows y CI corre en `ubuntu-latest`. Un suelo con
    // decimales calibrado en una plataforma es una fábrica de rojos falsos en
    // la otra, y un rojo falso en el estreno del trinquete lo mata el primer
    // día. Consecuencia declarada: **el trinquete tiene grano de 1 punto** —
    // una caída menor que eso pasa. Cuando haya una corrida verde en el runner
    // se puede apretar al decimal con su número medido allí.
    //
    // La meta 75/80/85/85 sigue siendo deuda viva, y NO está aquí a propósito:
    // deuda y defecto son cosas distintas, y sólo el defecto bloquea.
    coverageThreshold: {
        global: {
            branches: 25,
            functions: 21,
            lines: 26,
            statements: 26
        }
    },
    
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
