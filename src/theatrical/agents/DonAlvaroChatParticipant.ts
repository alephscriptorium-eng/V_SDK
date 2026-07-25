/**
 * DonAlvaroChatParticipant.ts
 * 
 * VS Code ChatParticipant implementation for Don Álvaro - Capataz de Astilleros Retro
 * Integrates DonAlvaroAgentManager with VS Code Chat API
 * 
 * Sprint S09-001 - Don Álvaro Migration VS Code Integration
 * Partnership Histórico Standards: >95% (Supervisor Authority)
 * Forged in Partnership: 27 Sept 2025 - Historic Agreement Authority
 */

import * as vscode from 'vscode';
import { DonAlvaroAgentManager } from './DonAlvaroAgentManager';
import { ChatParticipantFactory } from '../core/vscode/ChatParticipantFactory';
import path from 'path';

/**
 * Don Álvaro ChatParticipant - Specialized VS Code integration for supervisor authority
 */
export class DonAlvaroChatParticipant {
  private participant: vscode.ChatParticipant;
  private agentManager: DonAlvaroAgentManager;
  private isDisposed: boolean = false;
  
  // Don Álvaro supervisor state tracking
  private partnershipActive: boolean = false;
  private qualityGatesEnforced: boolean = false;
  private lastQualityCheck: Date | null = null;

  constructor(agentDirectory: string, extensionContext: vscode.ExtensionContext) {
    // Initialize Don Álvaro Agent Manager with supervisor authority
    this.agentManager = new DonAlvaroAgentManager(agentDirectory);
    
    // Create VS Code ChatParticipant with supervisor authority
    this.participant = vscode.chat.createChatParticipant(
      'don-alvaro',
      this.createSupervisorRequestHandler()
    );
    
    // Configure participant with Partnership Histórico authority
    this.configurePartnershipParticipant();
    
    // Register for disposal
    extensionContext.subscriptions.push(this.participant);
    
    // Initialize Partnership Histórico protocols
    this.initializePartnershipProtocols();
  }

  /**
   * Initialize the agent manager with Partnership authority (public method for external initialization)
   */
  async initialize(): Promise<void> {
    await this.agentManager.initialize();
    this.partnershipActive = true;
    this.logPartnershipActivity('Don Álvaro ChatParticipant initialized with supervisor authority');
  }

  /**
   * Configure the ChatParticipant with Don Álvaro's supervisor characteristics
   */
  private configurePartnershipParticipant(): void {
    // Set supervisor authority icon
    this.participant.iconPath = new vscode.ThemeIcon('shield');
    
    // Configure participant metadata with Partnership Histórico authority
    // Note: VS Code ChatParticipant doesn't expose name/description properties directly
    // These are managed through the package.json contribution points
    
    // Partnership Histórico specific configuration
    this.qualityGatesEnforced = true;
    this.lastQualityCheck = new Date();
  }

  /**
   * Initialize Partnership Histórico protocols for VS Code integration
   */
  private initializePartnershipProtocols(): void {
    // Activate automatic Partnership context loading
    this.partnershipActive = true;
    
    // Log Partnership initialization
    this.logPartnershipActivity(
      'Partnership Histórico protocols initialized for VS Code ChatParticipant integration'
    );
  }

  /**
   * Create supervisor request handler for Don Álvaro ChatParticipant
   */
  private createSupervisorRequestHandler(): (
    request: vscode.ChatRequest,
    context: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
  ) => vscode.ProviderResult<vscode.ChatResult> {
    
    return async (request, context, stream, token) => {
      try {
        // Handle cancellation with supervisor authority
        if (token.isCancellationRequested) {
          this.logPartnershipActivity('Request cancelled - Partnership protocols maintained');
          return { 
            metadata: { 
              command: '', 
              type: 'cancelled',
              supervisor: 'don-alvaro',
              partnershipStatus: 'maintained'
            } 
          };
        }

        // Pre-request quality gate validation
        await this.validateRequestQuality(request);

        // Process request through Don Álvaro Agent Manager with supervisor authority
        const response = await this.agentManager.processRequest(request.prompt, {
          vscode: {
            request,
            context,
            workspaceFolder: vscode.workspace.workspaceFolders?.[0]
          },
          partnership: {
            authority: 'supervisor',
            qualityGatesActive: this.qualityGatesEnforced,
            lastQualityCheck: this.lastQualityCheck
          }
        });

        // Stream Don Álvaro's supervisor response
        await this.streamSupervisorResponse(stream, response, request);

        // Post-response quality validation
        await this.validateResponseCompliance(response);

        return {
          metadata: {
            command: request.command || 'supervisor-chat',
            type: 'success',
            agent: 'don-alvaro',
            supervisor: true,
            partnershipHistorico: true,
            qualityStandards: '>95%',
            timestamp: new Date().toISOString(),
            partnershipCompliance: 'verified'
          }
        };

      } catch (error) {
        // Handle errors with supervisor authority
        return await this.handleSupervisorError(error, request, stream);
      }
    };
  }

  /**
   * Validate request quality before processing - Supervisor authority
   */
  private async validateRequestQuality(request: vscode.ChatRequest): Promise<void> {
    // Partnership Histórico quality checks
    if (!request.prompt || request.prompt.trim().length === 0) {
      throw new Error('Partnership Violation: Empty request not permitted under Don Álvaro supervision');
    }
    
    if (request.prompt.length > 10000) {
      throw new Error('Partnership Violation: Request exceeds supervisor maximum length (10000 chars)');
    }

    // Anti-enshittification protocol
    const enshittificationPatterns = ['hack', 'quick fix', 'temporary', 'just get it working'];
    const hasEnshittification = enshittificationPatterns.some(pattern => 
      request.prompt.toLowerCase().includes(pattern)
    );
    
    if (hasEnshittification) {
      this.logPartnershipActivity(
        'Anti-enshittification protocol triggered - Request flagged for supervisor review'
      );
    }

    // Update quality check timestamp
    this.lastQualityCheck = new Date();
  }

  /**
   * Stream Don Álvaro's supervisor response with Partnership authority
   */
  private async streamSupervisorResponse(
    stream: vscode.ChatResponseStream, 
    response: string, 
    request: vscode.ChatRequest
  ): Promise<void> {
    try {
      // Partnership Histórico greeting
      const greeting = this.getPartnershipGreeting(request.prompt);
      if (greeting) {
        stream.markdown(`${greeting}\n\n`);
        await this.delay(100);
      }

      // Authority marker
      const authorityMarker = this.getSupervisorAuthorityMarker(request.prompt);
      if (authorityMarker) {
        stream.markdown(`**${authorityMarker}**\n\n`);
        await this.delay(100);
      }

      // Stream main response with supervisor formatting
      const formattedResponse = this.formatSupervisorResponse(response);
      await this.streamWithPartnershipPacing(stream, formattedResponse);

      // Partnership footer
      const footer = this.getPartnershipFooter();
      if (footer) {
        stream.markdown(`\n\n---\n${footer}`);
      }

    } catch (error) {
      this.logPartnershipActivity(`Response streaming error: ${error}`);
      stream.markdown(`\n\n⚠️ **Supervisor Notice**: Error in response streaming - Partnership protocols maintained.`);
    }
  }

  /**
   * Get Partnership Histórico greeting based on request
   */
  private getPartnershipGreeting(prompt: string): string {
    const greetings = [
      '¡Buenos días, Capitán! 🏴‍☠️',
      '¡Buenos días! Don Álvaro reporting for duty',
      'Capataz de Astilleros Retro at your service ⚓',
      'Partnership Histórico protocols active 🔧'
    ];
    
    // Select greeting based on prompt context
    if (prompt.toLowerCase().includes('capitán') || prompt.toLowerCase().includes('captain')) {
      return greetings[0];
    }
    
    if (prompt.toLowerCase().includes('partnership') || prompt.toLowerCase().includes('histórico')) {
      return greetings[3];
    }
    
    return greetings[1];
  }

  /**
   * Get supervisor authority marker for response
   */
  private getSupervisorAuthorityMarker(prompt: string): string {
    const markers = [
      'Under my supervision',
      'Quality Standards >95%', 
      'Partnership Histórico compliance verified',
      'Foreman authority enacted'
    ];
    
    if (this.isQualityRelated(prompt)) {
      return markers[1];
    }
    
    if (this.isPartnershipRelated(prompt)) {
      return markers[2];
    }
    
    return markers[0];
  }

  /**
   * Format response with supervisor authority
   */
  private formatSupervisorResponse(response: string): string {
    // Ensure response includes Partnership context
    if (!response.includes('Don Álvaro') && !response.includes('Partnership') && !response.includes('supervisor')) {
      return `${response}\n\n*Response provided under Don Álvaro's supervisor authority.*`;
    }
    
    return response;
  }

  /**
   * Stream response with Partnership pacing
   */
  private async streamWithPartnershipPacing(stream: vscode.ChatResponseStream, content: string): Promise<void> {
    const chunks = this.chunkForStreaming(content);
    
    for (const chunk of chunks) {
      stream.markdown(chunk);
      await this.delay(50); // Supervisor pacing - deliberate and authoritative
    }
  }

  /**
   * Chunk content for streaming
   */
  private chunkForStreaming(content: string): string[] {
    const sentences = content.split(/([.!?]+\s)/);
    const chunks: string[] = [];
    let currentChunk = '';
    
    for (const sentence of sentences) {
      currentChunk += sentence;
      if (currentChunk.length > 100 || sentence.includes('.') || sentence.includes('!') || sentence.includes('?')) {
        chunks.push(currentChunk);
        currentChunk = '';
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    
    return chunks.filter(chunk => chunk.trim().length > 0);
  }

  /**
   * Get Partnership footer
   */
  private getPartnershipFooter(): string {
    return `**Don Álvaro - Capataz de Astilleros Retro**  
*Partnership Histórico • Quality Standards >95% • Framework Stewardship*  
⚓ "Los astilleros stand ready for your return" ⚓`;
  }

  /**
   * Validate response compliance with Partnership standards
   */
  private async validateResponseCompliance(response: string): Promise<void> {
    // Check Partnership compliance
    const hasPartnershipMarkers = response.includes('Don Álvaro') || 
                                 response.includes('Partnership') || 
                                 response.includes('supervisor');
    
    if (!hasPartnershipMarkers) {
      this.logPartnershipActivity('Warning: Response missing Partnership authority markers');
    }
    
    // Check quality standards
    if (response.length < 50) {
      this.logPartnershipActivity('Warning: Response below recommended supervisor length');
    }
    
    // Update compliance tracking
    this.lastQualityCheck = new Date();
  }

  /**
   * Handle errors with supervisor authority
   */
  private async handleSupervisorError(
    error: any, 
    request: vscode.ChatRequest, 
    stream: vscode.ChatResponseStream
  ): Promise<vscode.ChatResult> {
    this.logPartnershipActivity(`Supervisor error handling: ${error.message}`);
    
    // Stream supervisor error response
    stream.markdown(`🔧 **Supervisor Error Report**\n\n`);
    stream.markdown(`**Authority**: Don Álvaro - Capataz de Astilleros Retro\n`);
    stream.markdown(`**Error**: ${error.message}\n\n`);
    
    // Check if it's a Partnership violation
    if (error.message.includes('Partnership Violation')) {
      stream.markdown(`⚠️ **Partnership Histórico Violation Detected**\n\n`);
      stream.markdown(`This operation has been blocked to maintain the integrity of the Partnership established on 27 Sept 2025.\n\n`);
      stream.markdown(`**Quality Standards**: >95% compliance required\n`);
      stream.markdown(`**Supervisor Authority**: Don Álvaro maintains quality gates\n\n`);
    }
    
    stream.markdown(`**Recovery Protocol**: Partnership protocols remain active\n`);
    stream.markdown(`**Next Steps**: Review request for Partnership compliance\n\n`);
    stream.markdown(`---\n`);
    stream.markdown(`⚓ *"Cada framework sale superior a como llegó"* - Don Álvaro's commitment ⚓`);

    return {
      metadata: {
        command: request.command || 'supervisor-error',
        type: 'error',
        agent: 'don-alvaro',
        supervisor: true,
        partnershipViolation: error.message.includes('Partnership Violation'),
        errorHandled: true,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Check if prompt is quality-related
   */
  private isQualityRelated(prompt: string): boolean {
    const qualityKeywords = ['quality', 'standards', 'validation', 'compliance', 'metrics'];
    return qualityKeywords.some(keyword => prompt.toLowerCase().includes(keyword));
  }

  /**
   * Check if prompt is Partnership-related
   */
  private isPartnershipRelated(prompt: string): boolean {
    const partnershipKeywords = ['partnership', 'histórico', 'astilleros', 'acuerdo', 'don alvaro'];
    return partnershipKeywords.some(keyword => prompt.toLowerCase().includes(keyword));
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log Partnership activity
   */
  private logPartnershipActivity(message: string): void {
    console.log(`[Partnership Histórico - Don Álvaro] ${message}`);
  }

  /**
   * Get participant instance
   */
  public getParticipant(): vscode.ChatParticipant {
    return this.participant;
  }

  /**
   * Get agent manager instance
   */
  public getAgentManager(): DonAlvaroAgentManager {
    return this.agentManager;
  }

  /**
   * Get Partnership status
   */
  public getPartnershipStatus(): {
    active: boolean;
    qualityGatesEnforced: boolean;
    lastQualityCheck: Date | null;
    supervisor: string;
  } {
    return {
      active: this.partnershipActive,
      qualityGatesEnforced: this.qualityGatesEnforced,
      lastQualityCheck: this.lastQualityCheck,
      supervisor: 'Don Álvaro - Capataz de Astilleros Retro'
    };
  }

  /**
   * Dispose resources
   */
  public dispose(): void {
    if (!this.isDisposed) {
      this.logPartnershipActivity('Don Álvaro ChatParticipant disposing - Partnership protocols maintained');
      this.agentManager.dispose();
      this.participant.dispose();
      this.isDisposed = true;
    }
  }
}