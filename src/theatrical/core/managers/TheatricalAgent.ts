/**
 * Theatrical Agent Manager - Foundation Implementation
 * Core modular architecture for theatrical system
 * Sprint S09-001 - Artillero Gamma Implementation
 * 
 * Focus: Minimal compilation-ready base class
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
import * as vscode from 'vscode';

/**
 * Core Response Interface for Theatrical System
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
    return {
      id: this.id,
      handler: this.handleRequest.bind(this),
      metadata: {
        name: this.displayName,
        description: this.getDescription(),
        category: this.category,
        emoji: this.emoji
      }
    };
  }

  /**
   * Handle chat requests from VS Code
   * Core interaction point with users
   */
  async handleRequest(request: any): Promise<any> {
    return {
      content: `Response from ${this.displayName}`,
      metadata: {
        agent: this.id,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Validate agent configuration
   */
  validateConfiguration(): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    if (!this.configuration.agentId) {
      errors.push({
        field: 'agentId',
        message: 'Agent ID is required',
        severity: 'error'
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: errors.length === 0 ? 100 : 0
    };
  }

  /**
   * Initialize the agent
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    this.isInitialized = true;
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.isInitialized = false;
  }

  /**
   * Get description for the agent
   */
  private getDescription(): string {
    return `${this.displayName} - Theatrical agent for ${this.category}`;
  }
}