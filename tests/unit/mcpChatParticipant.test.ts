import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import * as vscode from 'vscode';
import { McpChatParticipant } from '../../src/mcpChatParticipant';

// Mock VS Code module
jest.mock('vscode', () => ({
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

describe('McpChatParticipant', () => {
    let mockContext: Partial<vscode.ExtensionContext>;
    let chatParticipant: McpChatParticipant;

    beforeEach(() => {
        mockContext = {
            extensionUri: 'mock://extension/uri' as any,
            subscriptions: []
        };

        // Reset mocks
        jest.clearAllMocks();
    });

    it('should create a chat participant with correct ID', () => {
        chatParticipant = new McpChatParticipant(mockContext as vscode.ExtensionContext);

        expect(vscode.chat.createChatParticipant).toHaveBeenCalledWith(
            'mcp-vscode-ext.mcp-assistant',
            expect.any(Function)
        );
    });

    it('should set the correct icon path', () => {
        chatParticipant = new McpChatParticipant(mockContext as vscode.ExtensionContext);

        expect(vscode.Uri.joinPath).toHaveBeenCalledWith(
            mockContext.extensionUri,
            'media',
            'mcp.svg'
        );
    });

    it('should register for disposal in context subscriptions', () => {
        chatParticipant = new McpChatParticipant(mockContext as vscode.ExtensionContext);

        expect(mockContext.subscriptions).toHaveLength(1);
    });

    it('should dispose properly', () => {
        const mockDispose = jest.fn();
        (vscode.chat.createChatParticipant as jest.Mock).mockReturnValue({
            iconPath: undefined,
            dispose: mockDispose
        });

        chatParticipant = new McpChatParticipant(mockContext as vscode.ExtensionContext);
        chatParticipant.dispose();

        expect(mockDispose).toHaveBeenCalled();
    });
});