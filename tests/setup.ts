/**
 * Global test setup configuration
 * This file runs before all tests to configure the testing environment
 */

// Mock VS Code API globally
const mockFunction = () => jest.fn();

const vscode = {
    // Mock window object
    window: {
        showInformationMessage: mockFunction(),
        showWarningMessage: mockFunction(),
        showErrorMessage: mockFunction(),
        showInputBox: mockFunction(),
        showQuickPick: mockFunction(),
        showOpenDialog: mockFunction(),
        showSaveDialog: mockFunction(),
        createWebviewPanel: mockFunction(),
        createTerminal: mockFunction(),
        createOutputChannel: mockFunction(),
        createStatusBarItem: mockFunction(),
        activeTextEditor: undefined,
        visibleTextEditors: [],
        onDidChangeActiveTextEditor: mockFunction(),
        onDidChangeVisibleTextEditors: mockFunction()
    },
    
    // Mock workspace object
    workspace: {
        workspaceFolders: undefined,
        rootPath: undefined,
        name: undefined,
        getConfiguration: jest.fn().mockReturnValue({
            get: mockFunction(),
            update: mockFunction(),
            inspect: mockFunction(),
            has: mockFunction()
        }),
        onDidChangeConfiguration: mockFunction(),
        onDidChangeWorkspaceFolders: mockFunction(),
        openTextDocument: mockFunction(),
        saveAll: mockFunction(),
        findFiles: mockFunction(),
        createFileSystemWatcher: mockFunction()
    },
    
    // Mock commands object
    commands: {
        registerCommand: mockFunction(),
        executeCommand: mockFunction(),
        getCommands: mockFunction()
    },
    
    // Mock extensions object
    extensions: {
        all: [],
        getExtension: mockFunction(),
        onDidChange: mockFunction()
    },
    
    // Mock ViewColumn enum
    ViewColumn: {
        Active: -1,
        Beside: -2,
        One: 1,
        Two: 2,
        Three: 3
    },
    
    // Mock ConfigurationTarget enum
    ConfigurationTarget: {
        Global: 1,
        Workspace: 2,
        WorkspaceFolder: 3
    },
    
    // Mock Uri object
    Uri: {
        file: jest.fn().mockImplementation((path: string) => ({ fsPath: path, path })),
        parse: mockFunction(),
        joinPath: mockFunction()
    }
};

// Make vscode available globally
(global as any).vscode = vscode;

// Global test utilities
export const createMockContext = () => ({
    subscriptions: [],
    workspaceState: {
        get: mockFunction(),
        update: mockFunction(),
        keys: jest.fn().mockReturnValue([])
    },
    globalState: {
        get: mockFunction(),
        update: mockFunction(),
        keys: jest.fn().mockReturnValue([]),
        setKeysForSync: mockFunction()
    },
    extensionUri: vscode.Uri.file('/mock/extension/path'),
    extensionPath: '/mock/extension/path',
    storagePath: '/mock/storage/path',
    globalStoragePath: '/mock/global/storage/path',
    asAbsolutePath: jest.fn((relativePath: string) => `/mock/extension/path/${relativePath}`)
});

// WP-V90 · AQUÍ VIVÍA `measurePerformance`, Y SE HA IDO. NO SE REPONE.
//
// Devolvía `{ result, duration }` con `duration` medida en
// `process.hrtime.bigint()`. Su único consumidor era
// `tests/performance/serviceStartup.test.ts`, que V90 ha borrado entero por no
// importar ni una línea de producto. Sin consumidor, esto era código muerto —
// pero código muerto de una clase peculiar: un cronómetro de reloj de PARED
// ofrecido por el fichero que carga TODA la suite (`jest.config.js:33`,
// `setupFilesAfterEnv`). Es decir, el arma cargada que este WP existe para
// descargar, dejada en la mesa.
//
// Si alguien necesita medir tiempos, que monte un banco que se REPORTE y se
// compare consigo mismo a lo largo del tiempo. Lo que no debe volver a esta
// suite es `expect(duration)…`: el estado del mundo se compara por CONJUNTO DE
// ROJOS POR NOMBRE (`scripts/rojos-jest.mjs`), y un rojo que va y viene con la
// carga hace que un rojo REAL se pueda despachar como flapeo.
//
// Y no, un reloj falso no lo habría salvado. MEDIDO en este árbol —jest 29.7.0
// con @sinonjs/fake-timers 10.3.0—: `jest.useFakeTimers()` moderno REEMPLAZA
// `process.hrtime.bigint`, igual que `Date.now` y `performance.now`. Bajo
// timers falsos la duración vale exactamente lo que el propio test haya
// avanzado con `advanceTimersByTime` —cero si no avanza nada—, así que la
// aserción sobrevive convertida en tautología sobre su propio guion: verde
// perpetuo que no mide nada.

// Global test constants
export const TEST_CONSTANTS = {
    MOCK_WORKSPACE_PATH: '/mock/workspace',
    MOCK_FILE_PATH: '/mock/workspace/test.ts',
    TIMEOUT: {
        SHORT: 1000,
        MEDIUM: 5000,
        LONG: 10000
    },
    PERFORMANCE_THRESHOLDS: {
        SERVICE_INITIALIZATION: 100, // ms
        COMMAND_EXECUTION: 200, // ms
        AI_RESPONSE: 500, // ms
        WEBVIEW_CREATION: 300 // ms
    }
};

// Global mock for logger service
export const createMockLogger = () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    level: 'info',
    addConsoleHandler: jest.fn(),
    addFileHandler: jest.fn(),
    clearHandlers: jest.fn(),
    getLogLevel: jest.fn(),
    setLogLevel: jest.fn()
});

// Global mock for analytics service
export const createMockAnalyticsService = () => ({
    getInstance: jest.fn(),
    trackEvent: jest.fn(),
    trackUserAction: jest.fn(),
    trackError: jest.fn(),
    startSession: jest.fn(),
    endSession: jest.fn(),
    getStatistics: jest.fn().mockReturnValue({
        totalEvents: 0,
        sessionsCount: 0,
        averageSessionDuration: 0,
        errorCount: 0
    }),
    getEvents: jest.fn().mockReturnValue([]),
    generateDashboard: jest.fn().mockResolvedValue('<html>Mock Dashboard</html>'),
    dispose: jest.fn()
});

// Global mock for configuration service  
export const createMockConfigurationService = () => ({
    getInstance: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    has: jest.fn(),
    getAll: jest.fn().mockReturnValue({}),
    dispose: jest.fn(),
    onDidChange: jest.fn()
});

// Setup global mocks before tests
beforeAll(() => {
    // Mock console methods to avoid noise in test output
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
});

// Cleanup after tests
afterAll(() => {
    jest.restoreAllMocks();
});
