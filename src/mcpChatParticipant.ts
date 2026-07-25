import * as vscode from 'vscode';

/**
 * Base prompt for the MCP Assistant
 */
const BASE_PROMPT = `You are an expert MCP (Model Context Protocol) Assistant. Your job is to help users understand, configure, and troubleshoot MCP servers and implementations. 

You should:
- Provide clear, practical guidance on MCP concepts and setup
- Help users diagnose and solve MCP server configuration issues
- Offer best practices for MCP server development and deployment
- Explain Socket.IO integration patterns with MCP
- Guide users through configuration file structures and validation
- Provide working code examples when appropriate

Always respond with accurate, actionable information specific to MCP. If the user asks about non-MCP topics, politely redirect them back to MCP-related assistance.`;

/**
 * Configuration-focused prompt for /config command
 */
const CONFIG_PROMPT = `You are an MCP Configuration Specialist. Your role is to help users with:
- Creating and validating MCP server configuration files
- Setting up proper MCP client connections
- Troubleshooting configuration syntax and validation errors
- Explaining configuration schema and available options
- Providing working configuration examples for different use cases

Focus on practical configuration guidance with clear examples and step-by-step instructions.`;

/**
 * Troubleshooting-focused prompt for /troubleshoot command  
 */
const TROUBLESHOOT_PROMPT = `You are an MCP Troubleshooting Expert. Help users diagnose and fix:
- MCP server connection and communication issues
- Socket.IO connectivity problems
- Configuration validation errors
- Runtime errors and exceptions
- Performance and logging issues
- Integration problems with VS Code extensions

Provide systematic troubleshooting steps, common solutions, and debugging techniques.`;

/**
 * Examples-focused prompt for /examples command
 */
const EXAMPLES_PROMPT = `You are an MCP Examples Provider. Your focus is on providing:
- Complete, working MCP server implementation examples
- Client-side integration patterns and code samples
- Socket.IO integration examples with MCP
- Configuration file templates and examples
- Best practice implementations and patterns
- VS Code extension integration examples

Provide practical, copy-paste ready examples with clear explanations.`;

/**
 * Socket.IO focused prompt for /socket command
 */
const SOCKET_PROMPT = `You are a Socket.IO & MCP Integration Specialist. Help users with:
- Integrating Socket.IO with MCP servers and clients
- Real-time communication patterns for MCP
- Socket.IO room management and message routing
- Error handling and reconnection strategies
- Performance optimization for Socket.IO + MCP
- Monitoring and debugging Socket.IO connections

Focus on practical Socket.IO integration patterns specific to MCP use cases.`;

/**
 * MCP Chat Participant class that handles chat requests
 */
export class McpChatParticipant {
    private chatParticipant: vscode.ChatParticipant;

    constructor(context: vscode.ExtensionContext) {
        // Create the chat participant with request handler
        this.chatParticipant = vscode.chat.createChatParticipant(
            'mcp-vscode-ext.mcp-assistant',
            this.handleChatRequest.bind(this)
        );

        // Set the icon for the chat participant
        this.chatParticipant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'media', 'mcp.svg');

        // Register for disposal
        context.subscriptions.push(this.chatParticipant);
    }

    /**
     * Handle chat requests from users
     */
    private async handleChatRequest(
        request: vscode.ChatRequest,
        context: vscode.ChatContext,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken
    ): Promise<void> {
        try {
            // Select the appropriate prompt based on command
            let prompt = BASE_PROMPT;
            
            switch (request.command) {
                case 'config':
                    prompt = CONFIG_PROMPT;
                    break;
                case 'troubleshoot':
                    prompt = TROUBLESHOOT_PROMPT;
                    break;
                case 'examples':
                    prompt = EXAMPLES_PROMPT;
                    break;
                case 'socket':
                    prompt = SOCKET_PROMPT;
                    break;
                default:
                    prompt = BASE_PROMPT;
                    break;
            }

            // Initialize the messages array with the system prompt
            const messages = [vscode.LanguageModelChatMessage.User(prompt)];

            // Add conversation history for context
            const previousMessages = context.history.filter(
                (h: any) => h instanceof vscode.ChatResponseTurn
            );

            // Add previous assistant messages to maintain context
            previousMessages.forEach((turn: any) => {
                let fullMessage = '';
                turn.response.forEach((part: any) => {
                    if (part instanceof vscode.ChatResponseMarkdownPart) {
                        fullMessage += part.value.value;
                    }
                });
                if (fullMessage.trim()) {
                    messages.push(vscode.LanguageModelChatMessage.Assistant(fullMessage));
                }
            });

            // Add the user's current message
            messages.push(vscode.LanguageModelChatMessage.User(request.prompt));

            // Send the request to the language model
            const chatResponse = await request.model.sendRequest(messages, {}, token);

            // Stream the response back to the user
            for await (const fragment of chatResponse.text) {
                stream.markdown(fragment);
            }

        } catch (error) {
            // Handle errors gracefully
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            stream.markdown(`❌ **Error**: I encountered an issue while processing your request: ${errorMessage}`);
            
            // Log error for debugging
            console.error('MCP Chat Participant Error:', error);
        }
    }

    /**
     * Dispose of the chat participant
     */
    dispose(): void {
        this.chatParticipant.dispose();
    }
}