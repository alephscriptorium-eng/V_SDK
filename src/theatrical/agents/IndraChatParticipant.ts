/**
 * IndraChatParticipant.ts
 * 
 * VS Code ChatParticipant integration for Integration Agent Indra
 * Theater Director and E2E Testing Specialist with Net of Indra authority
 * 
 * Sprint S09-001 - Integration Agent Indra ChatParticipant Implementation
 * Partnership Histórico Standards: >90% (Director Authority Level)
 * Net of Indra: Comprehensive E2E integration and connectivity validation
 */

import * as vscode from 'vscode';
import { IndraAgentManager } from './IndraAgentManager';
import path from 'path';

/**
 * VS Code ChatParticipant for Integration Agent Indra
 * Provides director authority interface with E2E testing and Net of Indra connectivity
 */
export class IndraChatParticipant {
  private static readonly PARTICIPANT_ID = 'indra';
  private static readonly PARTICIPANT_NAME = '🕸️ Integration Agent Indra';
  private static readonly FULL_NAME = '🕸️ Integration Agent "Indra" - Theater Director';
  
  private agentManager: IndraAgentManager | null = null;
  private chatParticipant: vscode.ChatParticipant;
  private isInitialized = false;

  constructor(private context: vscode.ExtensionContext) {
    // Create VS Code ChatParticipant
    this.chatParticipant = vscode.chat.createChatParticipant(
      IndraChatParticipant.PARTICIPANT_ID,
      this.handleRequest.bind(this)
    );

    // Configure ChatParticipant properties
    this.configureChatParticipant();
    
    // Register for disposal
    context.subscriptions.push(this.chatParticipant);
    
    console.log(`[Integration Agent Indra] ChatParticipant registered: ${IndraChatParticipant.PARTICIPANT_ID}`);
  }

  /**
   * Configure ChatParticipant with director authority properties
   */
  private configureChatParticipant(): void {
    // Set ChatParticipant properties (VS Code API compatible)
    this.chatParticipant.iconPath = new vscode.ThemeIcon('globe'); // Net of Indra connectivity icon
  }

  /**
   * Initialize agent manager with director authority configuration
   */
  private async initializeAgentManager(): Promise<void> {
    if (this.isInitialized && this.agentManager) {
      return;
    }

    try {
      const agentsDir = path.join(__dirname);
      this.agentManager = await IndraAgentManager.create(agentsDir);
      this.isInitialized = true;
      
      console.log(`[Integration Agent Indra] Agent manager initialized with director authority`);
      
      // Validate director authority
      const validation = this.agentManager.validateDirectorAuthority();
      if (!validation.isValid) {
        console.warn(`[Integration Agent Indra] Director authority validation warnings:`, validation.warnings);
      } else {
        console.log(`[Integration Agent Indra] Director authority validated - Score: ${validation.score}%`);
      }
      
    } catch (error) {
      console.error(`[Integration Agent Indra] Failed to initialize agent manager: ${error}`);
      throw error;
    }
  }

  /**
   * Handle ChatParticipant request with director authority processing
   */
  private async handleRequest(
    request: vscode.ChatRequest,
    context: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
  ): Promise<void> {
    try {
      // Initialize if needed
      if (!this.isInitialized) {
        await this.initializeAgentManager();
      }

      if (!this.agentManager) {
        throw new Error('Agent manager not initialized');
      }

      // Net of Indra connectivity greeting
      if (this.isNetOfIndraGreeting(request.prompt)) {
        await this.handleNetOfIndraGreeting(stream);
        return;
      }

      // Director authority command detection
      if (this.isDirectorAuthorityCommand(request.prompt)) {
        await this.handleDirectorAuthorityCommand(request.prompt, stream);
        return;
      }

      // Integration testing commands
      if (this.isIntegrationTestingCommand(request.prompt)) {
        await this.handleIntegrationTestingCommand(request.prompt, stream);
        return;
      }

      // E2E validation commands
      if (this.isE2EValidationCommand(request.prompt)) {
        await this.handleE2EValidationCommand(request.prompt, stream);
        return;
      }

      // Process through agent manager
      const response = await this.agentManager.processInput(request.prompt);
      
      stream.markdown(response.content);
      
      console.log(`[Integration Agent Indra] Processed request: ${request.prompt.substring(0, 50)}...`);
      
    } catch (error) {
      console.error(`[Integration Agent Indra] Error handling request: ${error}`);
      stream.markdown(`🕸️ **Integration Agent Indra - Error**

I encountered an issue while processing your request: ${error instanceof Error ? error.message : String(error)}

**Director Authority Status**: Ready to coordinate integration when system is operational.
**Net of Indra**: Monitoring all connections for issues.

Please try again or contact support if the issue persists.`);
    }
  }

  /**
   * Check if input is Net of Indra greeting
   */
  private isNetOfIndraGreeting(input: string): boolean {
    const greetingPatterns = [
      /^(hi|hello|hey|greetings|good \w+),?\s*indra\b/i,
      /^indra\b/i,
      /\bnet of indra\b/i,
      /\binterconnected\b.*\bweb\b/i
    ];
    return greetingPatterns.some(pattern => pattern.test(input.trim()));
  }

  /**
   * Check if input is director authority command
   */
  private isDirectorAuthorityCommand(input: string): boolean {
    const authorityKeywords = [
      'director authority', 'theater direction', 'sprint blocking',
      'feature complete', 'production ready', 'director powers'
    ];
    return authorityKeywords.some(keyword => 
      input.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * Check if input is integration testing command
   */
  private isIntegrationTestingCommand(input: string): boolean {
    const testingKeywords = [
      'integration test', 'integration testing', 'e2e integration',
      'test integration', 'integration protocol', 'integration validation'
    ];
    return testingKeywords.some(keyword => 
      input.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * Check if input is E2E validation command
   */
  private isE2EValidationCommand(input: string): boolean {
    const validationKeywords = [
      'e2e validation', 'end-to-end validation', 'user workflow',
      'production readiness', 'validate workflow', 'e2e test'
    ];
    return validationKeywords.some(keyword => 
      input.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * Handle Net of Indra greeting
   */
  private async handleNetOfIndraGreeting(stream: vscode.ChatResponseStream): Promise<void> {
    stream.markdown(`🕸️ **Greetings from the Net of Indra**

**Integration Agent "Indra" - Theater Director reporting for duty.**

In the **Net of Indra**, every jewel reflects all others - and as your Integration Director, I see and validate all component connections in our infinite web.

**My Director Authority:**
- 🚫 **Sprint Blocking**: Can halt progress until integration issues resolved
- ✅ **Feature Completion**: Final authority on production readiness
- 🎭 **Theater Direction**: Coordinate all agents for unified performance
- 🔗 **Net Validation**: Ensure every connection in the web is strong

**Available Commands:**
- **"integration test"** - Execute comprehensive integration protocol
- **"director authority"** - Display my theater direction powers
- **"net of indra"** - Show connectivity validation capabilities  
- **"e2e validation"** - Run end-to-end validation protocol

**Current Theater Status**: All connections monitored, ready to ensure seamless integration.

*How may I help you validate the infinite web of connections?* 🕸️✨`);
  }

  /**
   * Handle director authority commands
   */
  private async handleDirectorAuthorityCommand(input: string, stream: vscode.ChatResponseStream): Promise<void> {
    if (!this.agentManager) {
      stream.markdown('🕸️ Agent manager not initialized');
      return;
    }

    const response = await this.agentManager.processInput(input);
    stream.markdown(response.content);
  }

  /**
   * Handle integration testing commands
   */
  private async handleIntegrationTestingCommand(input: string, stream: vscode.ChatResponseStream): Promise<void> {
    if (!this.agentManager) {
      stream.markdown('🕸️ Agent manager not initialized');
      return;
    }

    const response = await this.agentManager.processInput(input);
    stream.markdown(response.content);
  }

  /**
   * Handle E2E validation commands
   */
  private async handleE2EValidationCommand(input: string, stream: vscode.ChatResponseStream): Promise<void> {
    if (!this.agentManager) {
      stream.markdown('🕸️ Agent manager not initialized');
      return;
    }

    const response = await this.agentManager.processInput(input);
    stream.markdown(response.content);
  }

  /**
   * Get participant instance
   */
  public getChatParticipant(): vscode.ChatParticipant {
    return this.chatParticipant;
  }

  /**
   * Dispose resources
   */
  public dispose(): void {
    console.log(`[Integration Agent Indra] ChatParticipant disposing`);
  }
}

export default IndraChatParticipant;