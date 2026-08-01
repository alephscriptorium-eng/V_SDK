/**
 * Integration tests for ManagerFactory
 */

import { ManagerFactory, createStandardManagers } from '../../src/core/managerFactory';
import { createMockContext } from '../setup';

// WP-V48 · EL MOCK DE `vscode` DE ESTE FICHERO ES **DERIVADO**, NO PARALELO.
//
// Aquí vivió, desde el commit fundacional 6b77afb, un mock inline COMPLETO y
// `{virtual: true}` que desplazaba al `moduleNameMapper` de jest.config.js:36-38.
// Declaraba un `window` de CUATRO claves —showInformationMessage,
// showErrorMessage, createOutputChannel, createWebviewPanel— y ninguna era
// `onDidCloseTerminal`. Ésa fue la causa ÚNICA de los cinco rojos deterministas
// del mundo: `TerminalManager` (src/terminalManager.ts:24) la llama en su
// constructor, y los cinco tests que llegan hasta él por `ProcessManager`
// (src/processManager.ts:33) o por `WebViewManager` (src/webViewManager.ts:42)
// morían con `TypeError: vscode.window.onDidCloseTerminal is not a function`.
//
// El mock COMPARTIDO —tests/mocks/vscode.mock.js:83— sí la expone desde
// dfddc87 (WP-V66), que la añadió justamente porque `TerminalManager` la
// necesitaba. Es decir: el mundo ya reparó esto una vez, y este fichero no se
// enteró porque tenía su propia copia. Ése es el mecanismo, y no se cierra
// añadiendo la clave que falta: se cierra dejando de tener una copia.
//
// Por qué queda un `jest.mock` en vez de borrarlo entero: de las cuarenta y
// cinco líneas que había, UNA aportaba algo que el mock compartido no da.
// `tests/mocks/vscode.mock.js:110-120` devuelve `get: () => 'test-value'` para
// TODA clave; `LoggingManager.loadConfiguration()` (src/loggingManager.ts:89-106)
// lee `enabledCategories` esperando un ARRAY —hace `new Set(enabledCats)`— y
// `maxEntries` esperando un NÚMERO.
//
// MEDIDO con una sonda temporal en este mismo fichero, comparando las dos
// `getConfiguration('aleph0.logging')` lado a lado en la misma corrida:
//
//   con este override : enabledCategories=["general","extension","ui"]
//                       new Set(…).size = 3 · maxEntries = 10000 · level="info"
//   compartido a secas: enabledCategories="test-value"
//                       new Set(…).size = 8   ← las 8 letras distintas de la cadena
//
// O sea que sin este trozo, este fichero construiría un LoggingManager con
// OCHO categorías de una letra y un tope de entradas que es la cadena
// 'test-value'. Nada lo asertaba, pero degradar en silencio el objeto bajo
// prueba no es arreglar un test.
//
// Así que se conserva EXACTAMENTE ese trozo —la `getConfiguration` consciente
// de la sección `aleph0.logging`, que WP-V23 (b97151b) ya mantuvo viva al
// renombrar el espacio de nombres— y todo lo demás se toma del compartido.
// El resto de la suite no se ve afectado: aquí no se toca vscode.mock.js.
//
// `requireActual` y no `require`: el `moduleNameMapper` resuelve 'vscode' a
// ESTE MISMO fichero, así que un `require` normal vuelve a entrar en esta
// fábrica y recursa. MEDIDO: `RangeError: Maximum call stack size exceeded`,
// suite entera caída, cero tests ejecutados.
jest.mock('vscode', () => {
    const base = jest.requireActual('../mocks/vscode.mock.js');
    return {
        ...base,
        workspace: {
            ...base.workspace,
            getConfiguration: jest.fn().mockImplementation((section?: string) => ({
                get: jest.fn().mockImplementation((key: string, defaultValue?: any) => {
                    // Return appropriate values based on the section and key
                    if (section === 'aleph0.logging') {
                        switch (key) {
                            case 'level': return 'info';
                            case 'enabledCategories': return ['general', 'extension', 'ui'];
                            case 'showTimestamp': return true;
                            case 'showLevel': return true;
                            case 'showCategory': return true;
                            default: return defaultValue;
                        }
                    }
                    return defaultValue || true;
                }),
                update: jest.fn()
            }))
        }
    };
});

describe('ManagerFactory Integration Tests', () => {
    let mockContext: any;
    let factory: ManagerFactory;

    beforeEach(() => {
        jest.clearAllMocks();
        mockContext = createMockContext();
        
        // Ensure clean factory state
        if (factory) {
            factory.disposeAll().catch(() => {});
        }
    });

    afterEach(async () => {
        if (factory) {
            await factory.disposeAll();
        }
    });

    describe('Factory Creation', () => {
        it('should create factory instance with context', () => {
            factory = ManagerFactory.getInstance({
                context: mockContext
            });

            expect(factory).toBeInstanceOf(ManagerFactory);
        });

        it('should return same instance (singleton)', () => {
            const factory1 = ManagerFactory.getInstance({
                context: mockContext
            });
            const factory2 = ManagerFactory.getInstance({
                context: mockContext
            });

            expect(factory1).toBe(factory2);
            factory = factory1;
        });
    });

    describe('Manager Creation', () => {
        beforeEach(() => {
            factory = ManagerFactory.getInstance({
                context: mockContext
            });
        });

        it('should create logging manager', async () => {
            const loggingManager = await factory.createManager('logging');
            
            expect(loggingManager).toBeDefined();
            expect(loggingManager).toHaveProperty('dispose');
        });

        it('should create configuration service', async () => {
            const configService = await factory.createManager('config');
            
            expect(configService).toBeDefined();
            expect(configService).toHaveProperty('dispose');
        });

        it('should create error boundary', async () => {
            const errorBoundary = await factory.createManager('error-boundary');
            
            expect(errorBoundary).toBeDefined();
            expect(errorBoundary).toHaveProperty('dispose');
        });

        it('should create process manager', async () => {
            const processManager = await factory.createManager('process');
            
            expect(processManager).toBeDefined();
            expect(processManager).toHaveProperty('dispose');
        });

        it('should create webview manager', async () => {
            const webViewManager = await factory.createManager('webview');
            
            expect(webViewManager).toBeDefined();
            expect(webViewManager).toHaveProperty('dispose');
        });

        it('should throw error for unknown manager type', async () => {
            await expect(
                factory.createManager('unknown' as any)
            ).rejects.toThrow('Unknown manager type: unknown');
        });
    });

    describe('Manager Dependencies', () => {
        beforeEach(() => {
            factory = ManagerFactory.getInstance({
                context: mockContext
            });
        });

        it('should create analytics after logging and config', async () => {
            // Create dependencies first
            const loggingManager = await factory.createManager('logging');
            const configService = await factory.createManager('config');
            
            // Set dependencies with proper type casting
            factory.config.loggingManager = loggingManager as any;
            factory.config.configService = configService as any;
            
            // Create analytics
            const analytics = await factory.createManager('analytics');
            expect(analytics).toBeDefined();
        });

        it('should create AI assistant after prerequisites', async () => {
            // Create all dependencies
            const loggingManager = await factory.createManager('logging');
            const configService = await factory.createManager('config');
            
            factory.config.loggingManager = loggingManager as any;
            factory.config.configService = configService as any;
            
            const analytics = await factory.createManager('analytics');
            const aiAssistant = await factory.createManager('ai-assistant');
            
            expect(aiAssistant).toBeDefined();
        });
    });

    describe('Standard Managers Creation', () => {
        it('should create all standard managers', async () => {
            const managers = await createStandardManagers(mockContext);

            expect(managers).toBeDefined();
            expect(managers.factory).toBeDefined();
            expect(managers.errorBoundary).toBeDefined();
            expect(managers.configService).toBeDefined();
            expect(managers.loggingManager).toBeDefined();
            expect(managers.processManager).toBeDefined();
            expect(managers.webViewManager).toBeDefined();
            expect(managers.commandPaletteManager).toBeDefined();
            expect(managers.analyticsService).toBeDefined();
            expect(managers.aiAssistantService).toBeDefined();

            // Cleanup
            await managers.factory.disposeAll();
        });

        it('should have proper dependency chain in standard managers', async () => {
            const managers = await createStandardManagers(mockContext);

            // Verify all managers are initialized
            expect(managers.factory.hasManager('logging')).toBe(true);
            expect(managers.factory.hasManager('config')).toBe(true);
            expect(managers.factory.hasManager('analytics')).toBe(true);
            expect(managers.factory.hasManager('ai-assistant')).toBe(true);

            await managers.factory.disposeAll();
        });
    });

    describe('Manager Lifecycle', () => {
        beforeEach(() => {
            factory = ManagerFactory.getInstance({
                context: mockContext
            });
        });

        it('should track active managers', async () => {
            const loggingManager = await factory.createManager('logging');
            const configManager = await factory.createManager('config');

            const activeManagers = factory.getActiveManagers();
            expect(activeManagers).toContain('logging');
            expect(activeManagers).toContain('config');
            expect(activeManagers.length).toBe(2);
        });

        it('should dispose specific manager', async () => {
            const loggingManager = await factory.createManager('logging');
            expect(factory.hasManager('logging')).toBe(true);

            await factory.disposeManager('logging');
            expect(factory.hasManager('logging')).toBe(false);
        });

        it('should dispose all managers', async () => {
            await factory.createManager('logging');
            await factory.createManager('config');

            expect(factory.getActiveManagers().length).toBe(2);

            await factory.disposeAll();

            expect(factory.getActiveManagers().length).toBe(0);
        });
    });

    describe('Error Handling', () => {
        beforeEach(() => {
            factory = ManagerFactory.getInstance({
                context: mockContext
            });
        });

        describe('Error Handling', () => {
        it('should handle analytics creation without dependencies', async () => {
            // Create a separate factory instance for error testing
            // Clear dependencies to test error conditions
            const originalLogging = factory.config.loggingManager;
            const originalConfig = factory.config.configService;
            
            factory.config.loggingManager = undefined;
            factory.config.configService = undefined;
            
            await expect(
                factory.createManager('analytics')
            ).rejects.toThrow('Analytics manager requires logging and config services');
            
            // Restore dependencies
            factory.config.loggingManager = originalLogging;
            factory.config.configService = originalConfig;
        });

        it('should handle AI assistant creation without dependencies', async () => {
            // Clear dependencies to test error conditions  
            const originalLogging = factory.config.loggingManager;
            const originalConfig = factory.config.configService;
            
            factory.config.loggingManager = undefined;
            factory.config.configService = undefined;
            
            await expect(
                factory.createManager('ai-assistant')
            ).rejects.toThrow('AI Assistant manager requires logging and config services');
            
            // Restore dependencies
            factory.config.loggingManager = originalLogging;
            factory.config.configService = originalConfig;
        });
    });
    });

    describe('Performance', () => {
        beforeEach(() => {
            factory = ManagerFactory.getInstance({
                context: mockContext
            });
        });

        it('should create a manager through the factory', async () => {
            // WP-V90 (censo #8): borrada `expect(creationTime).toBeLessThan(100)`
            // y renombrado el test, que prometía un umbral que ya no comprueba.
            // OJO: se renombra el `it`, NUNCA el `describe('Performance')` — el
            // nombre del describe forma parte del nombre completo de uno de los
            // cinco rojos declarados («…Performance should handle concurrent
            // manager creation»), y tocarlo movería el baseline.
            // con su par de lecturas de `Date.now()`. Era la única aserción del
            // test. Un presupuesto de 100 ms de reloj de pared mide la carga de
            // la máquina, no `createManager`; y este fichero es precisamente el
            // que aloja los cinco rojos deterministas del mundo, así que aquí un
            // rojo por flapeo es el que más daño hace: se confunde con ellos.
            // ALCANCE: V90 sólo toca ESTE `it`. El resto del fichero —incluido
            // «should handle concurrent manager creation», que es uno de los
            // cinco rojos históricos— es territorio de otro WP y queda intacto.
            const manager = await factory.createManager('logging');

            expect(manager).toBeDefined();
            expect(manager).toHaveProperty('dispose');
        });

        it('should handle concurrent manager creation', async () => {
            const promises = [
                factory.createManager('logging'),
                factory.createManager('config'),
                factory.createManager('error-boundary'),
                factory.createManager('process'),
                factory.createManager('webview')
            ];

            const managers = await Promise.all(promises);
            expect(managers).toHaveLength(5);
            managers.forEach(manager => {
                expect(manager).toBeDefined();
                expect(manager).toHaveProperty('dispose');
            });
        });
    });
});
