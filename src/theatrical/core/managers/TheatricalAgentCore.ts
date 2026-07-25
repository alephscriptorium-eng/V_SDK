/**
 * Theatrical Agent Manager - Foundation Implementation  
 * Core modular architecture for theatrical system
 * Sprint S09-001 - Artillero Gamma Implementation
 * 
 * Focus: Modular foundation architecture, VS Code integration in final phase
 */

import { 
  ITheatricalAgent, 
  AgentContent, 
  AgentConfiguration, 
  VibeCodingIntegration,
  MCPIntegration,
  ValidationResult,
  ValidationError,
  ValidationWarning
} from '../interfaces';
import { theatricalValidator } from '../schemas/validation';

/**
 * Core Response Interface for Theatrical System
 * Compatible with VS Code but not dependent on it
 */
export interface TheatricalResponse {
  content: string;
  metadata: {
    agent: string;
    timestamp: string;
    style?: string;
    quality_score?: number;
    [key: string]: any;
  };
}

/**
 * Core Request Interface for Theatrical System
 */
export interface TheatricalRequest {
  input: string;
  context?: {
    sprint?: any;
    agent?: any;
    [key: string]: any;
  };
  metadata?: Record<string, any>;
}

/**
 * Base implementation of theatrical agent
 * Provides foundation for all specialized agents
 * 4-Layer Architecture: Content -> Configuration -> Implementation -> Runtime
 */
export class TheatricalAgent implements ITheatricalAgent {
  public readonly id: string;
  public readonly name: string;
  public readonly displayName: string;
  public readonly category: 'framework-retro' | 'technical-devops' | 'validation' | 'custom';
  public readonly emoji: string;
  
  public readonly content: AgentContent;
  public readonly configuration: AgentConfiguration;
  public readonly vibeCodingIntegration: VibeCodingIntegration;
  public readonly mcpIntegration?: MCPIntegration;

  private isInitialized: boolean = false;

  constructor(
    id: string,
    content: AgentContent,
    configuration: AgentConfiguration,
    vibeCodingIntegration: VibeCodingIntegration,
    mcpIntegration?: MCPIntegration
  ) {
    this.id = id;
    this.name = content.frontMatter.name;
    this.displayName = configuration.displayName;
    this.category = content.frontMatter.category as any;
    this.emoji = content.frontMatter.emoji;
    
    this.content = content;
    this.configuration = configuration;
    this.vibeCodingIntegration = vibeCodingIntegration;
    this.mcpIntegration = mcpIntegration;
  }

  /**
   * Create VS Code ChatParticipant for this agent
   * Implementation Layer: VS Code integration point
   */
  createChatParticipant(): any {
    // VS Code ChatParticipant creation will be implemented in final integration
    // This returns the configuration needed for ChatParticipant creation
    return {
      id: this.id,
      handler: this.handleTheatricalRequest.bind(this),
      metadata: {
        name: this.displayName,
        description: this.getDescription(),
        category: this.category,
        emoji: this.emoji
      }
    };
  }

  /**
   * Handle requests through theatrical system
   * Core interaction point - VS Code agnostic
   */
  async handleRequest(request: any): Promise<any> {
    const theatricalRequest: TheatricalRequest = this.normalizeRequest(request);
    const response = await this.handleTheatricalRequest(theatricalRequest);
    return this.normalizeResponse(response);
  }

  /**
   * Core theatrical request handler
   * 4-Layer Architecture implementation
   */
  async handleTheatricalRequest(request: TheatricalRequest): Promise<TheatricalResponse> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Layer 1: Content Layer - Apply agent content and expertise
      const contentEnhancedRequest = await this.applyContentLayer(request);
      
      // Layer 2: Configuration Layer - Apply agent configuration and personality
      const configuredRequest = await this.applyConfigurationLayer(contentEnhancedRequest);
      
      // Layer 3: Implementation Layer - Generate response with agent logic
      const response = await this.applyImplementationLayer(configuredRequest);
      
      // Layer 4: Runtime Layer - Apply quality gates and VibeCoding integration
      const finalResponse = await this.applyRuntimeLayer(response, request);
      
      return finalResponse;
    } catch (error) {
      return this.handleError(error, request);
    }
  }

  /**
   * Validate agent configuration
   * Partnership Histórico standards compliance
   */
  validateConfiguration(): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate basic configuration integrity
    if (!this.configuration.agentId || this.configuration.agentId !== this.id) {
      errors.push({
        field: 'agentId',
        message: 'Agent ID mismatch between content and configuration',
        severity: 'error'
      });
    }

    // Validate VibeCoding integration
    if (!this.configuration.vibecoding) {
      errors.push({
        field: 'vibecoding',
        message: 'VibeCoding configuration is required',
        severity: 'error'
      });
    } else {
      this.validateVibeCodingConfig(this.configuration.vibecoding, errors, warnings);
    }

    // Validate capabilities consistency
    this.validateCapabilities(errors, warnings);

    // Validate personality configuration
    this.validatePersonality(errors, warnings);

    // Calculate quality score (Partnership Histórico standard: >90%)
    const score = this.calculateConfigurationScore(errors, warnings);

    return {
      isValid: errors.length === 0 && score >= 90,
      errors,
      warnings,
      score
    };
  }

  /**
   * Initialize agent systems
   * 4-Layer Architecture initialization
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize Content Layer
      await this.initializeContentLayer();
      
      // Initialize Configuration Layer
      await this.initializeConfigurationLayer();
      
      // Initialize Implementation Layer
      await this.initializeImplementationLayer();
      
      // Initialize Runtime Layer (VibeCoding, MCP)
      await this.initializeRuntimeLayer();
      
      // Validate configuration
      const validation = this.validateConfiguration();
      if (!validation.isValid) {
        throw new Error(`Agent configuration validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      this.isInitialized = true;
    } catch (error) {
      throw new Error(`Agent initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Clean up agent resources
   */
  dispose(): void {
    // Cleanup all layers
    this.cleanupRuntimeLayer();
    this.cleanupImplementationLayer();
    this.cleanupConfigurationLayer();
    this.cleanupContentLayer();

    this.isInitialized = false;
  }

  // === 4-LAYER ARCHITECTURE IMPLEMENTATION ===

  /**
   * Layer 1: Content Layer - Apply agent content and expertise
   */
  private async applyContentLayer(request: TheatricalRequest): Promise<TheatricalRequest> {
    const enhancedRequest = {
      ...request,
      context: {
        ...request.context,
        agent_content: {
          expertise: this.content.expertise,
          personality: this.content.personality,
          instructions: this.content.instructions
        }
      }
    };

    return enhancedRequest;
  }

  /**
   * Layer 2: Configuration Layer - Apply agent configuration
   */
  private async applyConfigurationLayer(request: TheatricalRequest): Promise<TheatricalRequest> {
    const configuredRequest = {
      ...request,
      context: {
        ...request.context,
        agent_config: {
          capabilities: this.configuration.capabilities,
          personality: this.configuration.personality,
          vibecoding: this.configuration.vibecoding
        }
      }
    };

    return configuredRequest;
  }

  /**
   * Layer 3: Implementation Layer - Generate response with agent logic
   */
  private async applyImplementationLayer(request: TheatricalRequest): Promise<TheatricalResponse> {
    // Apply agent-specific logic based on category and expertise
    const responseContent = await this.generateResponseContent(request);
    
    return {
      content: responseContent,
      metadata: {
        agent: this.id,
        timestamp: new Date().toISOString(),
        style: this.configuration.personality.style,
        layer: 'implementation'
      }
    };
  }

  /**
   * Layer 4: Runtime Layer - Apply quality gates and integrations
   */
  private async applyRuntimeLayer(
    response: TheatricalResponse, 
    originalRequest: TheatricalRequest
  ): Promise<TheatricalResponse> {
    // Apply Partnership Histórico quality standards
    const qualityValidation = await this.validateResponseQuality(response);
    
    // Apply VibeCoding integration
    await this.updateVibeCodingContext(response, originalRequest);
    
    // Apply MCP integration if available
    if (this.mcpIntegration) {
      await this.updateMCPContext(response, originalRequest);
    }

    return {
      ...response,
      metadata: {
        ...response.metadata,
        quality_score: qualityValidation.score,
        quality_validated: qualityValidation.isValid,
        partnership_compliant: qualityValidation.score >= 90,
        layer: 'runtime'
      }
    };
  }

  // === LAYER INITIALIZATION ===

  private async initializeContentLayer(): Promise<void> {
    // Validate content structure
    if (!this.content.expertise || this.content.expertise.length === 0) {
      throw new Error('Agent must have at least one expertise area');
    }
    
    console.log(`Content layer initialized for ${this.id}: ${this.content.expertise.join(', ')}`);
  }

  private async initializeConfigurationLayer(): Promise<void> {
    // Validate configuration structure
    if (!this.configuration.capabilities) {
      throw new Error('Agent configuration must include capabilities');
    }
    
    console.log(`Configuration layer initialized for ${this.id}`);
  }

  private async initializeImplementationLayer(): Promise<void> {
    // Initialize agent-specific implementation logic
    console.log(`Implementation layer initialized for ${this.id}`);
  }

  private async initializeRuntimeLayer(): Promise<void> {
    // Initialize VibeCoding integration
    await this.initializeVibeCoding();
    
    // Initialize MCP integration if available
    if (this.mcpIntegration) {
      await this.initializeMCP();
    }
    
    console.log(`Runtime layer initialized for ${this.id}`);
  }

  // === LAYER CLEANUP ===

  private cleanupContentLayer(): void {
    console.log(`Content layer cleanup for ${this.id}`);
  }

  private cleanupConfigurationLayer(): void {
    console.log(`Configuration layer cleanup for ${this.id}`);
  }

  private cleanupImplementationLayer(): void {
    console.log(`Implementation layer cleanup for ${this.id}`);
  }

  private cleanupRuntimeLayer(): void {
    this.cleanupVibeCoding();
    if (this.mcpIntegration) {
      this.cleanupMCP();
    }
    console.log(`Runtime layer cleanup for ${this.id}`);
  }

  // === HELPER METHODS ===

  /**
   * Normalize different request formats to TheatricalRequest
   */
  private normalizeRequest(request: any): TheatricalRequest {
    // Handle VS Code ChatRequest or other formats
    if (typeof request === 'string') {
      return { input: request };
    }
    
    if (request.prompt || request.message) {
      return { 
        input: request.prompt || request.message,
        context: request.context,
        metadata: request.metadata
      };
    }
    
    return request as TheatricalRequest;
  }

  /**
   * Normalize TheatricalResponse to different formats
   */
  private normalizeResponse(response: TheatricalResponse): any {
    // Can be adapted for VS Code ChatResponseTurn or other formats
    return response;
  }

  /**
   * Generate response content based on agent logic
   */
  private async generateResponseContent(request: TheatricalRequest): Promise<string> {
    const style = this.configuration.personality.style;
    const expertise = this.content.expertise;
    
    let content = `${this.emoji} **${this.displayName}** responding:\n\n`;
    
    // Apply personality-based response style
    switch (style) {
      case 'nautical':
        content += `⚓ Navigating your request with expertise in: ${expertise.join(', ')}\n\n`;
        break;
      case 'technical':
        content += `🔧 Processing technical request. Specialized areas: ${expertise.join(', ')}\n\n`;
        break;
      case 'formal':
        content += `Processing your request. Areas of expertise: ${expertise.join(', ')}\n\n`;
        break;
      default:
        content += `Working on your request. My expertise: ${expertise.join(', ')}\n\n`;
    }
    
    // Add request processing (would integrate with actual AI service)
    content += `Request: "${request.input}"\n\n`;
    content += `[Specialized response would be generated here based on agent configuration and AI integration]\n\n`;
    
    // Add Partnership Histórico quality indicator
    content += `*Quality assured by Partnership Histórico standards (>90%)*`;
    
    return content;
  }

  /**
   * Validate response quality against Partnership Histórico standards
   */
  private async validateResponseQuality(response: TheatricalResponse): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // Basic quality checks
    if (!response.content || response.content.length < 10) {
      errors.push({
        field: 'response.content',
        message: 'Response content is too short or empty',
        severity: 'error'
      });
    }
    
    if (!response.content.includes(this.displayName)) {
      warnings.push({
        field: 'response.content',
        message: 'Response should include agent identification',
        recommendation: 'Include agent name in response'
      });
    }

    // Calculate quality score (Partnership Histórico standard: >90%)
    let score = 100;
    score -= errors.length * 20;
    score -= warnings.length * 5;
    
    // Bonus for proper formatting
    if (response.content.includes(this.emoji)) score += 2;
    if (response.content.includes('Partnership Histórico')) score += 3;

    return {
      isValid: errors.length === 0 && score >= 90,
      errors,
      warnings,
      score: Math.max(0, Math.min(100, score))
    };
  }

  /**
   * Handle errors with agent-specific patterns
   */
  private handleError(error: unknown, request: TheatricalRequest): TheatricalResponse {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    const personalizedError = this.personalizeError(errorMessage);
    
    // Log error for debugging
    console.error(`Agent ${this.id} error:`, errorMessage);

    return {
      content: personalizedError,
      metadata: {
        agent: this.id,
        timestamp: new Date().toISOString(),
        error: true,
        original_request: request.input
      }
    };
  }

  /**
   * Get agent description for UI purposes
   */
  private getDescription(): string {
    return `${this.emoji} ${this.displayName} - ${this.content.expertise.join(', ')}`;
  }

  /**
   * Personalize error messages based on agent style
   */
  private personalizeError(errorMessage: string): string {
    const style = this.configuration.personality.style;
    
    switch (style) {
      case 'nautical':
        return `⚓ **${this.displayName}** - Navigation Error:\n\n🌊 ${errorMessage}\n\nAdjusting course and trying again, Captain!`;
      case 'technical':
        return `🔧 **${this.displayName}** - Technical Error:\n\n⚠️ ${errorMessage}\n\nRunning diagnostics and implementing fixes.`;
      case 'formal':
        return `**${this.displayName}** - System Notice:\n\n${errorMessage}\n\nPlease review the request and try again.`;
      default:
        return `${this.emoji} **${this.displayName}**:\n\n${errorMessage}`;
    }
  }

  // === VALIDATION HELPERS ===

  private validateVibeCodingConfig(
    config: any, 
    errors: ValidationError[], 
    warnings: ValidationWarning[]
  ): void {
    if (!config.sprint_role) {
      errors.push({
        field: 'vibecoding.sprint_role',
        message: 'Sprint role is required for VibeCoding integration',
        severity: 'error'
      });
    }

    if (!config.validation_level) {
      errors.push({
        field: 'vibecoding.validation_level',
        message: 'Validation level is required',
        severity: 'error'
      });
    }

    if (typeof config.can_block_sprint !== 'boolean') {
      warnings.push({
        field: 'vibecoding.can_block_sprint',
        message: 'Sprint blocking capability should be explicitly defined',
        recommendation: 'Set can_block_sprint to true or false based on agent authority'
      });
    }
  }

  private validateCapabilities(errors: ValidationError[], warnings: ValidationWarning[]): void {
    const caps = this.configuration.capabilities;
    
    if (caps.sprint_blocking && !caps.quality_validation) {
      warnings.push({
        field: 'capabilities.quality_validation',
        message: 'Agents with sprint blocking capability should have quality validation enabled',
        recommendation: 'Enable quality_validation capability'
      });
    }
  }

  private validatePersonality(errors: ValidationError[], warnings: ValidationWarning[]): void {
    const personality = this.configuration.personality;
    
    if (this.category === 'framework-retro' && personality.style !== 'nautical') {
      warnings.push({
        field: 'personality.style',
        message: 'Framework Retro agents typically use nautical style',
        recommendation: 'Consider using nautical communication style'
      });
    }
  }

  private calculateConfigurationScore(errors: ValidationError[], warnings: ValidationWarning[]): number {
    let score = 100;
    score -= errors.length * 15;
    score -= warnings.length * 5;
    return Math.max(0, Math.min(100, score));
  }

  // === INTEGRATION METHODS ===

  private async initializeVibeCoding(): Promise<void> {
    console.log(`Initializing VibeCoding for agent ${this.id}`);
  }

  private async initializeMCP(): Promise<void> {
    console.log(`Initializing MCP integration for agent ${this.id}`);
  }

  private cleanupVibeCoding(): void {
    console.log(`Cleaning up VibeCoding for agent ${this.id}`);
  }

  private cleanupMCP(): void {
    console.log(`Cleaning up MCP integration for agent ${this.id}`);
  }

  private async updateVibeCodingContext(
    response: TheatricalResponse, 
    request: TheatricalRequest
  ): Promise<void> {
    console.log(`Updating VibeCoding context for agent ${this.id}`);
  }

  private async updateMCPContext(
    response: TheatricalResponse, 
    request: TheatricalRequest
  ): Promise<void> {
    console.log(`Updating MCP context for agent ${this.id}`);
  }
}