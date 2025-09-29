import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import * as vscode from 'vscode';
import { ExtensionBootstrap } from '../../src/core/extensionBootstrap';

// Mock VS Code module with additional chat support
jest.mock('vscode', () => ({
    window: {
        showErrorMessage: jest.fn().mockReturnValue(Promise.resolve('Show Details')),
        showInformationMessage: jest.fn().mockReturnValue(Promise.resolve('OK')),
        createOutputChannel: jest.fn().mockReturnValue({
            append: jest.fn(),
            appendLine: jest.fn(),
            clear: jest.fn(),
            show: jest.fn(),
            hide: jest.fn(),
            dispose: jest.fn()
        })
    },
    workspace: {
        workspaceFolders: [],
        fs: {
            writeFile: jest.fn()
        },
        getConfiguration: jest.fn().mockReturnValue({
            get: jest.fn().mockReturnValue('info'),
            has: jest.fn().mockReturnValue(true),
            inspect: jest.fn(),
            update: jest.fn()
        }),
        onDidChangeConfiguration: jest.fn().mockReturnValue({
            dispose: jest.fn()
        })
    },
    extensions: {
        all: []
    },
    commands: {
        registerCommand: jest.fn()
    },
    chat: {
        createChatParticipant: jest.fn().mockReturnValue({
            iconPath: undefined,
            dispose: jest.fn()
        })
    },
    Uri: {
        joinPath: jest.fn().mockReturnValue('mocked/path/to/icon.svg')
    },
    LanguageModelChatMessage: {
        User: jest.fn((content: string) => ({ role: 'user', content })),
        Assistant: jest.fn((content: string) => ({ role: 'assistant', content }))
    },
    ChatResponseMarkdownPart: jest.fn(),
    ChatResponseTurn: jest.fn()
}));

// Mock all the manager modules
jest.mock('../../src/core/managerFactory', () => ({
    createStandardManagers: jest.fn()
}));

describe('Extension Integration with Chat Participant', () => {
    let mockContext: Partial<vscode.ExtensionContext>;
    let extensionBootstrap: ExtensionBootstrap;

    beforeEach(() => {
        mockContext = {
            extensionUri: 'mock://extension/uri' as any,
            subscriptions: []
        };

        extensionBootstrap = ExtensionBootstrap.getInstance();
        jest.clearAllMocks();
        
        // Set up the mock implementation for createStandardManagers
        const { createStandardManagers } = require('../../src/core/managerFactory');
        // @ts-ignore - TypeScript issue with Jest mock typing
        (createStandardManagers as jest.Mock).mockResolvedValue({
            factory: { disposeAll: jest.fn() },
            errorBoundary: {},
            configService: { 
                get: jest.fn().mockImplementation((key: any) => {
                    switch(key) {
                        case 'logging.level': return 'info';
                        case 'logging.enabledCategories': return ['general'];
                        default: return 'info';
                    }
                })
            },
            loggingManager: { 
                setLogLevelFromString: jest.fn(),
                setEnabledCategories: jest.fn()
            },
            processManager: {},
            webViewManager: {},
            commandPaletteManager: {},
            analyticsService: { 
                trackEvent: jest.fn()
            },
            aiAssistantService: {}
        });
    });

    it('should initialize extension with chat participant', async () => {
        const context = await extensionBootstrap.initialize(mockContext as vscode.ExtensionContext);

        // Verify the extension context includes the chat participant
        expect(context.chatParticipant).toBeDefined();
        expect(context.managers).toBeDefined();
        expect(context.logger).toBeDefined();
    });

    it('should create chat participant with correct configuration', async () => {
        await extensionBootstrap.initialize(mockContext as vscode.ExtensionContext);

        // Verify the chat participant was created with correct ID
        expect(vscode.chat.createChatParticipant).toHaveBeenCalledWith(
            'mcp-vscode-ext.mcp-assistant',
            expect.any(Function)
        );

        // Verify icon path was set
        expect(vscode.Uri.joinPath).toHaveBeenCalledWith(
            mockContext.extensionUri,
            'media',
            'mcp.svg'
        );
    });

    it('should dispose chat participant on extension disposal', async () => {
        const mockDispose = jest.fn();
        (vscode.chat.createChatParticipant as jest.Mock).mockReturnValue({
            iconPath: undefined,
            dispose: mockDispose
        });

        await extensionBootstrap.initialize(mockContext as vscode.ExtensionContext);
        await extensionBootstrap.dispose();

        expect(mockDispose).toHaveBeenCalled();
    });

    it('should track extension activation with analytics', async () => {
        const context = await extensionBootstrap.initialize(mockContext as vscode.ExtensionContext);

        expect(context.managers.analytics.trackEvent).toHaveBeenCalled();
    });
});