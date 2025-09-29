/**
 * IsaacChatParticipant.ts
 * 
 * VS Code ChatParticipant implementation for Isaac - Marinero Fiel del Framework Retro
 * Integrates IsaacAgentManager with VS Code Chat API
 * 
 * Sprint S09-001 - Isaac Migration VS Code Integration
 * Partnership Histórico Standards: >90%
 */

import * as vscode from 'vscode';
import { IsaacAgentManager } from './IsaacAgentManager';
import { ChatParticipantFactory } from '../core/vscode/ChatParticipantFactory';
import path from 'path';

/**
 * Isaac ChatParticipant - Specialized VS Code integration for Isaac agent
 */
export class IsaacChatParticipant {
  private participant: vscode.ChatParticipant;
  private agentManager: IsaacAgentManager;
  private isDisposed: boolean = false;

  constructor(agentDirectory: string, extensionContext: vscode.ExtensionContext) {
    // Initialize Isaac Agent Manager
    this.agentManager = new IsaacAgentManager(agentDirectory);
    
    // Create VS Code ChatParticipant
    this.participant = vscode.chat.createChatParticipant(
      'isaac',
      this.createRequestHandler()
    );
    
    // Configure participant
    this.configureParticipant();
    
    // Register for disposal
    extensionContext.subscriptions.push(this.participant);
  }

  /**
   * Initialize the agent manager (public method for external initialization)
   */
  async initialize(): Promise<void> {
    await this.agentManager.initialize();
  }

  /**
   * Configure the ChatParticipant with Isaac's characteristics
   */
  private configureParticipant(): void {
    // Set icon
    this.participant.iconPath = new vscode.ThemeIcon('compass');
    
    // Configure participant metadata
    // Note: VS Code ChatParticipant doesn't expose name/description properties directly
    // These are managed through the package.json contribution points
  }

  /**
   * Create request handler for Isaac ChatParticipant
   */
  private createRequestHandler(): (
    request: vscode.ChatRequest,
    context: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
  ) => vscode.ProviderResult<vscode.ChatResult> {
    
    return async (request, context, stream, token) => {
      try {
        // Handle cancellation
        if (token.isCancellationRequested) {
          return { metadata: { command: '', type: 'cancelled' } };
        }

        // Process request through Isaac Agent Manager
        const response = await this.agentManager.handleRequest({
          input: request.prompt,
          command: request.command,
          context: {
            vscode: {
              request,
              context,
              workspaceFolder: vscode.workspace.workspaceFolders?.[0]
            }
          }
        });

        // Stream Isaac's response
        await this.streamIsaacResponse(stream, response, request);

        return {
          metadata: {
            command: request.command || 'chat',
            type: 'success',
            agent: 'isaac',
            timestamp: new Date().toISOString()
          }
        };

      } catch (error) {
        console.error('[IsaacChatParticipant] Error processing request:', error);
        
        // Stream error in Isaac's style
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        stream.markdown(`⚓ **Isaac** - Navigation Error:\n\n🌊 ${errorMessage}\n\nAjustando curso y trying again, Captain! Revisando sistemas de navegación...`);
        
        return {
          metadata: {
            command: '',
            type: 'error',
            agent: 'isaac',
            error: errorMessage
          }
        };
      }
    };
  }

  /**
   * Stream Isaac's response with proper formatting
   */
  private async streamIsaacResponse(
    stream: vscode.ChatResponseStream,
    response: any,
    request: vscode.ChatRequest
  ): Promise<void> {
    if (!response || !response.content) {
      stream.markdown('⚓ **Isaac**: Sin respuesta generada. Revisando sistemas de navegación...');
      return;
    }

    // Add Isaac's header if not present
    let content = response.content;
    if (!content.includes('Isaac') && !content.includes('🧭')) {
      content = `🧭 **Isaac - Marinero Fiel** responding:\n\n${content}`;
    }

    // Stream the content
    stream.markdown(content);

    // Add metadata footer if available
    if (response.metadata) {
      const frameworkStatus = response.metadata.framework_status;
      const signals = response.metadata.isaac_signals;
      
      if (frameworkStatus || signals) {
        stream.markdown('\n---');
        
        if (frameworkStatus) {
          stream.markdown(`\n🔧 **Framework Status**: ${frameworkStatus}`);
        }
        
        if (signals && signals.length > 0) {
          stream.markdown(`\n📡 **Signals Detected**: ${signals.join(', ')}`);
        }
        
        stream.markdown('\n⚓ *Partnership Histórico standards maintained*');
      }
    }
  }

  /**
   * Get the underlying VS Code ChatParticipant
   */
  getParticipant(): vscode.ChatParticipant {
    return this.participant;
  }

  /**
   * Dispose of the ChatParticipant
   */
  dispose(): void {
    if (!this.isDisposed) {
      this.participant.dispose();
      this.agentManager.dispose();
      this.isDisposed = true;
    }
  }

  /**
   * Check if the participant is disposed
   */
  isParticipantDisposed(): boolean {
    return this.isDisposed;
  }
}

/**
 * Factory function to create Isaac ChatParticipant
 */
export async function createIsaacChatParticipant(
  agentDirectory: string,
  extensionContext: vscode.ExtensionContext
): Promise<IsaacChatParticipant> {
  try {
    // Verify agent files exist
    const agentPath = path.join(agentDirectory, 'isaac.agent.md');
    const configPath = path.join(agentDirectory, 'isaac.config.json');
    
    // Check if files exist (using VS Code file system)
    try {
      await vscode.workspace.fs.stat(vscode.Uri.file(agentPath));
      await vscode.workspace.fs.stat(vscode.Uri.file(configPath));
    } catch (error) {
      throw new Error(`Isaac agent files not found. Expected: ${agentPath} and ${configPath}`);
    }

    // Create and initialize Isaac ChatParticipant
    const isaacParticipant = new IsaacChatParticipant(agentDirectory, extensionContext);
    
    // Initialize the agent manager
    await isaacParticipant.initialize();
    
    console.log('✅ Isaac ChatParticipant created successfully');
    return isaacParticipant;
    
  } catch (error) {
    console.error('❌ Failed to create Isaac ChatParticipant:', error);
    throw error;
  }
}

/**
 * Register Isaac ChatParticipant in VS Code extension
 */
export function registerIsaacChatParticipant(
  agentDirectory: string,
  context: vscode.ExtensionContext
): Promise<IsaacChatParticipant> {
  return createIsaacChatParticipant(agentDirectory, context);
}

export default IsaacChatParticipant;