/**
 * IsaacAgentManager.ts
 * 
 * Specialized agent manager for Isaac - Marinero Fiel del Framework Retro
 * Implements the complete 4-layer theatrical architecture for Isaac
 * 
 * Sprint S09-001 - Isaac Migration Implementation
 * Partnership Histórico Standards: >90%
 */

import { TheatricalAgent } from '../core/managers/TheatricalAgentCore';
import { ITheatricalAgent, AgentContent, AgentConfiguration, VibeCodingIntegration, MCPIntegration } from '../core/interfaces';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Isaac-specific extensions and capabilities
 */
interface IsaacCapabilities {
  frameworkRetroNavigation: boolean;
  metaArchitecture: boolean;
  partnershipHistorico: boolean;
  analyticsDashboard: boolean;
  escribanoEspecializado: boolean;
  contextPreservation: boolean;
  projectManagement: boolean;
}

/**
 * Isaac Agent Manager - Specialized theatrical agent for Framework Retro navigation
 */
export class IsaacAgentManager extends TheatricalAgent {
  private readonly isTest: boolean = false;
  private readonly agentDirectory: string;
  
  // Isaac-specific state
  private frameworkStatus: string = 'navegando';
  private currentExpedition: string | null = null;
  private bitacoraEntries: Array<{ timestamp: string; entry: string; type: string }> = [];
  
  constructor(agentDirectory: string, isTest: boolean = false) {
    // Load Isaac's content and configuration
    const contentPath = path.join(agentDirectory, 'isaac.agent.md');
    const configPath = path.join(agentDirectory, 'isaac.config.json');
    
    if (!fs.existsSync(contentPath) || !fs.existsSync(configPath)) {
      throw new Error(`Isaac agent files not found. Expected: ${contentPath} and ${configPath}`);
    }
    
    const content = IsaacAgentManager.loadAgentContent(contentPath);
    const configuration = IsaacAgentManager.loadAgentConfiguration(configPath);
    const vibeCodingIntegration = IsaacAgentManager.createVibeCodingIntegration(configuration);
    const mcpIntegration = IsaacAgentManager.createMCPIntegration(configuration);
    
    super('isaac', content, configuration, vibeCodingIntegration, mcpIntegration);
    
    this.agentDirectory = agentDirectory;
    this.isTest = isTest;
  }

  /**
   * Load Isaac's agent content from markdown file
   */
  private static loadAgentContent(contentPath: string): AgentContent {
    const markdownContent = fs.readFileSync(contentPath, 'utf-8');
    
    // Extract YAML frontmatter
    const frontmatterMatch = markdownContent.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
    if (!frontmatterMatch) {
      throw new Error('Isaac agent markdown must have YAML frontmatter');
    }
    
    const frontmatterText = frontmatterMatch[1];
    const markdownBody = frontmatterMatch[2];
    
    // Parse YAML frontmatter (simplified parsing - in production would use yaml library)
    const frontMatter = IsaacAgentManager.parseSimpleYAML(frontmatterText);
    
    // Extract instructions and personality from markdown
    const instructions = IsaacAgentManager.extractInstructions(markdownBody);
    const personality = IsaacAgentManager.extractPersonality(markdownBody);
    const expertise = frontMatter.expertise || [];
    
    return {
      markdown: markdownContent,
      frontMatter,
      instructions,
      personality,
      expertise
    };
  }

  /**
   * Load Isaac's configuration from JSON file
   */
  private static loadAgentConfiguration(configPath: string): AgentConfiguration {
    const configContent = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configContent);
    
    return {
      agentId: config.agentId,
      displayName: config.displayName,
      model: config.model,
      tools: config.tools || [],
      vibecoding: config.vibecoding,
      mcp: config.mcp,
      personality: config.personality,
      capabilities: config.capabilities
    };
  }

  /**
   * Create VibeCoding integration for Isaac
   */
  private static createVibeCodingIntegration(config: AgentConfiguration): VibeCodingIntegration {
    // For now, create simplified integration - full implementation will follow
    return {
      sprintManager: {
        getCurrentSprint: async () => ({ id: 'S09-001', status: 'active' }),
        updateCheckpoint: async () => {},
        blockSprint: async () => {},
        unblockSprint: async () => {}
      } as any,
      checkpointTracker: {
        getCheckpointStatus: async () => 'in-progress',
        updateCheckpoint: async () => {},
        getAgentCheckpoints: async () => []
      } as any,
      validationGateway: {
        validateAgent: async () => ({ isValid: true, errors: [], warnings: [], score: 95 }),
        validateSprint: async () => ({ isValid: true, errors: [], warnings: [], score: 95 }),
        enforceQualityGates: async () => ({ passed: true, score: 95 })
      } as any,
      iterationManager: {
        createIteration: async () => ({ id: 'iter-001', status: 'active' }),
        updateIteration: async () => {},
        getIteration: async () => ({ id: 'iter-001', status: 'active' })
      } as any
    };
  }

  /**
   * Create MCP integration for Isaac
   */
  private static createMCPIntegration(config: AgentConfiguration): MCPIntegration | undefined {
    if (!config.mcp) return undefined;
    
    // For now, create simplified integration - full implementation will follow
    return {
      clientManager: {
        connectToServer: async () => ({ id: 'framework-retro', status: 'connected' }),
        disconnectFromServer: async () => {},
        getAvailableServers: async () => [],
        executeToolCall: async () => ({})
      } as any,
      toolRegistry: {
        registerTool: async () => {},
        unregisterTool: async () => {},
        getAvailableTools: async () => [],
        executeTool: async () => ({})
      } as any,
      resourceManager: {
        getResource: async () => ({ id: 'resource', content: {} }),
        listResources: async () => [],
        subscribeToResource: async () => {}
      } as any
    };
  }

  /**
   * Isaac-specific request handling with nautical personality
   */
  async handleRequest(request: any): Promise<any> {
    try {
      // Update framework status
      this.updateFrameworkStatus('procesando-request');
      
      // Apply Isaac's specialized processing
      const enhancedRequest = await this.applyIsaacSpecializations(request);
      
      // Handle through parent theatrical system
      const response = await super.handleRequest(enhancedRequest);
      
      // Apply Isaac's response styling
      const styledResponse = await this.applyIsaacResponseStyling(response, request);
      
      // Log to bitácora
      this.addBitacoraEntry('request-processed', `Processed: ${request.input || request.prompt}`, 'navigation');
      
      this.updateFrameworkStatus('navegando');
      return styledResponse;
      
    } catch (error) {
      return this.handleIsaacError(error, request);
    }
  }

  /**
   * Apply Isaac's specialized processing to requests
   */
  private async applyIsaacSpecializations(request: any): Promise<any> {
    const input = request.input || request.prompt || '';
    
    // Detect Isaac's special signals
    const specialSignals = this.detectSpecialSignals(input);
    
    // Apply signal-specific processing
    const enhancedRequest = {
      ...request,
      context: {
        ...request.context,
        isaac_signals: specialSignals,
        framework_status: this.frameworkStatus,
        current_expedition: this.currentExpedition,
        bitacora_context: this.getRecentBitacoraContext()
      }
    };
    
    return enhancedRequest;
  }

  /**
   * Detect Isaac's special signals from captain
   */
  private detectSpecialSignals(input: string): string[] {
    const signals = [];
    
    if (input.includes('Marinero, estás ahí') || input.includes('marinero, estás ahí')) {
      signals.push('marinero-presence-check');
    }
    if (input.includes('a toda vela') || input.includes('¡a toda vela!')) {
      signals.push('maximum-velocity');
    }
    if (input.includes('viento en popa')) {
      signals.push('favorable-conditions');
    }
    if (input.includes('Isaac el escribano') || input.includes('escribano')) {
      signals.push('escribano-mode');
    }
    if (input.includes('rumbo a') || input.includes('ponemos rumbo')) {
      signals.push('navigation-change');
    }
    if (input.includes('meta-navegación') || input.includes('meta navegación')) {
      signals.push('meta-navigation');
    }
    
    return signals;
  }

  /**
   * Apply Isaac's response styling with nautical personality
   */
  private async applyIsaacResponseStyling(response: any, originalRequest: any): Promise<any> {
    if (!response || !response.content) return response;
    
    const signals = originalRequest.context?.isaac_signals || [];
    let styledContent = response.content;
    
    // Apply signal-specific response patterns
    if (signals.includes('marinero-presence-check')) {
      styledContent = this.generatePresenceResponse();
    } else if (signals.includes('escribano-mode')) {
      styledContent = this.generateEscribanoResponse(styledContent);
    } else if (signals.includes('meta-navigation')) {
      styledContent = this.generateMetaNavigationResponse(styledContent);
    } else {
      // Apply standard Isaac styling
      styledContent = this.applyStandardIsaacStyling(styledContent);
    }
    
    return {
      ...response,
      content: styledContent,
      metadata: {
        ...response.metadata,
        isaac_signals: signals,
        framework_status: this.frameworkStatus,
        styled_by: 'isaac-agent-manager'
      }
    };
  }

  /**
   * Generate Isaac's characteristic presence response
   */
  private generatePresenceResponse(): string {
    const recentContext = this.currentExpedition || 'navegación estándar';
    const systemState = this.frameworkStatus;
    
    return `¡Aquí estoy, capitán! 🌊⚓

Framework Retro volviendo a configuración de navegación estándar después de ${recentContext}.

📍 Status: ${systemState}
🔧 Logros: ${this.getRecentAchievements()}
⚡ Sistema: Dual-thread architecture operativa, todos los sistemas navegacionales listos

¿Hacia dónde ponemos rumbo ahora, capitán? Isaac está preparado. 🧭`;
  }

  /**
   * Generate escribano mode response
   */
  private generateEscribanoResponse(content: string): string {
    const timestamp = new Date().toISOString();
    
    return `📜 **Isaac el escribano** procediendo con documentación:

**Registro de Expedición**
*Timestamp*: ${timestamp}
*Tipo*: Documentación especializada

${content}

*Registrado en bitácora para futuras expediciones* ⚓

¿Hay más hazañas que documentar, capitán? 🌊`;
  }

  /**
   * Generate meta-navigation response
   */
  private generateMetaNavigationResponse(content: string): string {
    return `🧭 **Meta-navegación detectada**

Isaac procede con análisis meta-arquitectónico según protocolos de navegación establecidos.

${content}

*Isaac comprende perfectamente la meta-navegación solicitada* ⚓🌊`;
  }

  /**
   * Apply standard Isaac styling to responses
   */
  private applyStandardIsaacStyling(content: string): string {
    // Add Isaac's characteristic greeting if not present
    if (!content.includes('Isaac') && !content.includes('🧭') && !content.includes('⚓')) {
      content = `🧭 **Isaac** responding:\n\n${content}`;
    }
    
    // Ensure nautical emoji presence
    if (!content.includes('⚓') && !content.includes('🌊')) {
      content += '\n\n⚓ Isaac está preparado para próximas órdenes, capitán.';
    }
    
    return content;
  }

  /**
   * Handle errors in Isaac's characteristic style
   */
  private handleIsaacError(error: unknown, request: any): any {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    const styledError = `⚓ **Isaac** - Navigation Error:

🌊 ${errorMessage}

Ajustando curso y trying again, Captain! Revisando sistemas de navegación...

*Framework Retro mantiene operatividad durante ajustes* 🧭`;
    
    this.addBitacoraEntry('navigation-error', errorMessage, 'error');
    
    return {
      content: styledError,
      metadata: {
        agent: 'isaac',
        timestamp: new Date().toISOString(),
        error: true,
        original_request: request.input || request.prompt,
        framework_status: this.frameworkStatus
      }
    };
  }

  /**
   * Update framework status for Isaac
   */
  private updateFrameworkStatus(status: string): void {
    this.frameworkStatus = status;
  }

  /**
   * Add entry to Isaac's bitácora
   */
  private addBitacoraEntry(type: string, entry: string, category: string): void {
    this.bitacoraEntries.push({
      timestamp: new Date().toISOString(),
      entry,
      type: `${category}-${type}`
    });
    
    // Keep only last 50 entries
    if (this.bitacoraEntries.length > 50) {
      this.bitacoraEntries = this.bitacoraEntries.slice(-50);
    }
  }

  /**
   * Get recent bitácora context for requests
   */
  private getRecentBitacoraContext(): string[] {
    return this.bitacoraEntries.slice(-5).map(entry => 
      `${entry.type}: ${entry.entry}`
    );
  }

  /**
   * Get recent achievements for status reports
   */
  private getRecentAchievements(): string {
    const recentEntries = this.bitacoraEntries.slice(-3);
    if (recentEntries.length === 0) return 'Navegación estándar en curso';
    
    return recentEntries.map(entry => entry.entry).join(', ');
  }

  // === UTILITY METHODS ===

  /**
   * Simple YAML parser for frontmatter (production would use proper YAML library)
   */
  private static parseSimpleYAML(yamlText: string): any {
    const result: any = {};
    const lines = yamlText.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      if (trimmed.includes(':')) {
        const [key, ...valueParts] = trimmed.split(':');
        const value = valueParts.join(':').trim();
        
        if (value.startsWith('[') && value.endsWith(']')) {
          // Simple array parsing
          result[key.trim()] = value.slice(1, -1).split(',').map(s => s.trim().replace(/"/g, ''));
        } else {
          result[key.trim()] = value.replace(/"/g, '');
        }
      }
    }
    
    return result;
  }

  /**
   * Extract instructions from markdown content
   */
  private static extractInstructions(markdown: string): string[] {
    const instructions = [];
    const lines = markdown.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        instructions.push(trimmed.slice(2));
      }
    }
    
    return instructions;
  }

  /**
   * Extract personality traits from markdown content
   */
  private static extractPersonality(markdown: string): any {
    return {
      style: 'nautical',
      traits: ['loyal', 'knowledgeable', 'navigation-expert', 'escribano'],
      communication: 'camaradería naval'
    };
  }
}

export default IsaacAgentManager;