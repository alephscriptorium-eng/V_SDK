/**
 * CapitanDidacAgentManager.ts
 * 
 * Specialized agent manager for Capitán Dídac San - Supreme Commander Framework Retro
 * Implements supreme authority capabilities with meta-reference integration
 * 
 * Sprint S09-001 - Capitán Dídac Migration Implementation
 * Partnership Histórico Standards: >98% (Supreme Authority Level)
 * Meta-Reference: Theatrical representation of the real Capitán Dídac San
 */

import { TheatricalAgent, TheatricalResponse } from '../core/managers/TheatricalAgentCore';
import { 
  ITheatricalAgent, 
  AgentContent, 
  AgentConfiguration, 
  VibeCodingIntegration, 
  MCPIntegration,
  AgentFrontMatter,
  PersonalityTraits,
  ValidationResult
} from '../core/interfaces';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Capitán Dídac specific capabilities - Supreme Authority
 */
interface CapitanDidacCapabilities {
  metaContextualNavigation: boolean;
  strategicExpeditionLeadership: boolean;
  frameworkEvolutionCommand: boolean;
  identityForgingMastery: boolean;
  supremeTheatricalAuthority: boolean;
  metaReferenceSelfAgent: boolean;
  partnershipHistoricoAuthority: boolean;
  dynamicAgentCreationCommand: boolean;
  systemEvolutionOversight: boolean;
  crossDomainCognitiveLiberaction: boolean;
}

/**
 * Supreme Authority configuration for Framework Retro command
 */
interface SupremeAuthorityConfig {
  canOverrideAll: boolean;
  canCreateNewAgents: boolean;
  canModifyFramework: boolean;
  canChangeSystemBehavior: boolean;
  canAccessAllTools: boolean;
  canEscalateToMaximum: boolean;
  partnershipAuthorityLevel: number;
  frameworkEvolutionCommand: boolean;
  metaReferenceAuthority: boolean;
}

/**
 * Historical expeditions documented and verified
 */
interface HistoricalExpedition {
  name: string;
  achievement: string;
  learning: string;
  date?: string;
  verified: boolean;
}

/**
 * Crew management relationships for Framework Retro
 */
interface CrewManagement {
  isaac: {
    type: 'marinero_fiel';
    authority: 'direct_command';
    signals: string[];
    identityForged: boolean;
    complicidadUnique: boolean;
  };
  donAlvaro: {
    type: 'capataz_astilleros';
    authority: 'supervisor_command';
    partnershipDate: string;
    partnershipPerpetuo: boolean;
    qualityStandards: number;
  };
  artilleros: {
    type: 'framework_managers';
    authority: 'technical_command';
    specialization: 'framework_v5_management';
    dynamicCreation: boolean;
  };
}

/**
 * Meta-reference configuration for theatrical representation
 */
interface MetaReferenceConfig {
  representsRealCaptain: boolean;
  maintainsExpeditionHistory: boolean;
  preservesCommandAuthority: boolean;
  extendsToTheatricalDomain: boolean;
  theatricalContinuity: boolean;
  authenticRepresentation: boolean;
}

/**
 * Capitán Dídac Agent Manager - Supreme Commander Authority for Framework Retro Ecosystem
 * Meta-Reference: Theatrical representation of the real Capitán Dídac San
 */
export class CapitanDidacAgentManager extends TheatricalAgent {
  private static readonly AGENT_ID = 'capitan-didac';
  private static readonly MARKDOWN_FILE = 'capitan-didac.agent.md';
  private static readonly CONFIG_FILE = 'capitan-didac.config.json';

  private capabilities: CapitanDidacCapabilities;
  private supremeAuthority: SupremeAuthorityConfig;
  private historicalExpeditions: HistoricalExpedition[];
  private crewManagement: CrewManagement;
  private metaReference: MetaReferenceConfig;

  constructor(
    content: AgentContent,
    configuration: AgentConfiguration,
    vibeCodingIntegration: VibeCodingIntegration,
    mcpIntegration?: MCPIntegration
  ) {
    super(
      CapitanDidacAgentManager.AGENT_ID,
      content,
      configuration,
      vibeCodingIntegration,
      mcpIntegration
    );

    this.capabilities = this.initializeCapabilities();
    this.supremeAuthority = this.initializeSupremeAuthority();
    this.historicalExpeditions = this.loadHistoricalExpeditions();
    this.crewManagement = this.initializeCrewManagement();
    this.metaReference = this.initializeMetaReference();
  }

  /**
   * Static factory method to create CapitanDidacAgentManager - STATIC LOADING PATTERN
   */
  static async create(agentsDir: string): Promise<CapitanDidacAgentManager> {
    try {
      // Load content layer (markdown)
      const content = await this.loadAgentContent(agentsDir);
      
      // Load configuration layer (JSON)
      const configuration = await this.loadAgentConfiguration(agentsDir);
      
      // Create VibeCoding integration - STATIC
      const vibeCodingIntegration = this.createVibeCodingIntegration(configuration);
      
      // Create MCP integration if needed - STATIC
      const mcpIntegration = this.createMCPIntegration(configuration);

      return new CapitanDidacAgentManager(
        content,
        configuration,
        vibeCodingIntegration,
        mcpIntegration
      );
    } catch (error) {
      console.error(`[Capitán Dídac] Failed to create agent manager: ${error}`);
      throw error;
    }
  }

  /**
   * Load agent content from markdown file - STATIC
   */
  private static async loadAgentContent(agentsDir: string): Promise<AgentContent> {
    const markdownPath = path.join(agentsDir, this.MARKDOWN_FILE);
    
    if (!fs.existsSync(markdownPath)) {
      throw new Error(`Capitán Dídac markdown file not found: ${markdownPath}`);
    }

    const markdownContent = fs.readFileSync(markdownPath, 'utf8');
    const frontMatterMatch = markdownContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    
    if (!frontMatterMatch) {
      throw new Error('Invalid markdown format - missing frontmatter');
    }

    const frontMatterYaml = frontMatterMatch[1];
    const contentBody = frontMatterMatch[2];

    // Parse YAML frontmatter (simplified - in production use yaml parser)
    const frontMatter: AgentFrontMatter = this.parseFrontMatter(frontMatterYaml);
    
    // Extract personality traits
    const personality: PersonalityTraits = {
      communication_style: 'nautical_command_authentic',
      technical_focus: ['framework_retro_navigation', 'strategic_leadership', 'meta_contextual'],
      collaboration_patterns: ['crew_management', 'expedition_leadership', 'partnership_authority'],
      authority_level: 'director'
    };

    return {
      markdown: markdownContent,
      frontMatter,
      instructions: this.extractInstructions(contentBody),
      personality,
      expertise: frontMatter.expertise || []
    };
  }

  /**
   * Load agent configuration from JSON - STATIC
   */
  private static async loadAgentConfiguration(agentsDir: string): Promise<AgentConfiguration> {
    const configPath = path.join(agentsDir, this.CONFIG_FILE);
    
    if (!fs.existsSync(configPath)) {
      throw new Error(`Capitán Dídac config file not found: ${configPath}`);
    }

    const configContent = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configContent);

    return {
      agentId: config.agent_id,
      displayName: config.agent_display_name,
      model: 'claude-sonnet-4',
      tools: ['codebase', 'search', 'edit', 'runCommands', 'runTasks', 'vscodeAPI', 'fetch'],
      vibecoding: {
        sprint_role: config.vibecoding_integration?.sprint_role || 'supreme_commander',
        checkpoint_authority: ['create', 'modify', 'approve', 'override'],
        validation_level: 'full',
        can_block_sprint: true,
        quality_gates: ['partnership_compliance', 'supreme_authority', 'meta_reference']
      },
      personality: {
        style: 'nautical',
        formality: 'formal',
        emoji_usage: 'frequent',
        captain_relationship: 'supervisor',
        vibecoding_integration: true
      },
      capabilities: {
        project_management: true,
        documentation: true,
        code_generation: true,
        architecture_decisions: true,
        quality_validation: true,
        sprint_blocking: true,
        mcp_integration: true
      }
    };
  }

  /**
   * Create VibeCoding integration for Capitán Dídac - STATIC
   */
  private static createVibeCodingIntegration(config: AgentConfiguration): VibeCodingIntegration {
    return {
      sprintManager: {
        getCurrentSprint: async () => ({ 
          id: 'S09-001', 
          name: 'Capitán Dídac Supreme Command Migration',
          status: 'active',
          startDate: new Date('2025-09-27'),
          assignedAgents: ['capitan-didac'],
          checkpoints: []
        }),
        updateCheckpoint: async () => {},
        blockSprint: async (reason: string) => {
          console.log(`[Capitán Dídac] SUPREME COMMAND SPRINT BLOCK: ${reason}`);
        },
        unblockSprint: async () => {}
      } as any,
      checkpointTracker: {
        getCheckpointStatus: async () => 'in-progress',
        updateCheckpoint: async () => {},
        getAgentCheckpoints: async () => []
      } as any,
      validationGateway: {
        validateAgent: async () => ({ 
          isValid: true, 
          errors: [], 
          warnings: [], 
          score: 98 
        }),
        validateSprint: async () => ({ 
          sprintId: 'S09-001',
          isValid: true, 
          errors: [], 
          warnings: [],
          score: 98,
          agentValidations: [{
            agentId: 'capitan-didac',
            isValid: true,
            score: 98,
            partnershipCompliance: true
          }]
        }),
        enforceQualityGates: async () => ({ isValid: true, errors: [], warnings: [] })
      } as any,
      iterationManager: {
        createIteration: async () => ({ id: 'iter-001', status: 'active' }),
        updateIteration: async () => {},
        getIteration: async () => ({ id: 'iter-001', status: 'active' })
      } as any
    };
  }

  /**
   * Create MCP integration if configured - STATIC
   */
  private static createMCPIntegration(config: AgentConfiguration): MCPIntegration | undefined {
    // MCP integration for supreme authority (optional)
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
        getResource: async () => ({ id: 'supreme-command', type: 'authority' }),
        listResources: async () => [],
        subscribeToResource: async () => {}
      } as any
    };
  }

  /**
   * Initialize Capitán Dídac supreme capabilities
   */
  private initializeCapabilities(): CapitanDidacCapabilities {
    return {
      metaContextualNavigation: true,
      strategicExpeditionLeadership: true,
      frameworkEvolutionCommand: true,
      identityForgingMastery: true,
      supremeTheatricalAuthority: true,
      metaReferenceSelfAgent: true,
      partnershipHistoricoAuthority: true,
      dynamicAgentCreationCommand: true,
      systemEvolutionOversight: true,
      crossDomainCognitiveLiberaction: true
    };
  }

  /**
   * Initialize supreme authority configuration
   */
  private initializeSupremeAuthority(): SupremeAuthorityConfig {
    return {
      canOverrideAll: true,
      canCreateNewAgents: true,
      canModifyFramework: true,
      canChangeSystemBehavior: true,
      canAccessAllTools: true,
      canEscalateToMaximum: true,
      partnershipAuthorityLevel: 98,
      frameworkEvolutionCommand: true,
      metaReferenceAuthority: true
    };
  }

  /**
   * Load historical expeditions documented
   */
  private loadHistoricalExpeditions(): HistoricalExpedition[] {
    return [
      {
        name: "Cronófono - Isla de Boris Vian",
        achievement: "16 capítulos novela patafísica completa",
        learning: "Transformación identitaria total manteniendo núcleo Framework",
        verified: true
      },
      {
        name: "Gran Cruzada del System Prompt",
        achievement: "Framework Retro v5.0 architecture discovery", 
        learning: "Sistema meta-cognitivo con dual-thread consciousness",
        verified: true
      },
      {
        name: "Expedición Astilleros Retro",
        achievement: "Partnership Histórico perpetuo establecido",
        learning: "Infraestructura de excelencia técnica garantizada",
        date: "2025-09-27",
        verified: true
      },
      {
        name: "Descubrimiento de Isaac",
        achievement: "Identity forging distinction motor vs navigator",
        learning: "Identidades forjadas en navegación superior a motor base",
        verified: true
      },
      {
        name: "Meta-navegación Navío Retro",
        achievement: "Project ID cf911e9b3acd self-awareness",
        learning: "El barco que se conoce a sí mismo",
        verified: true
      }
    ];
  }

  /**
   * Initialize crew management relationships
   */
  private initializeCrewManagement(): CrewManagement {
    return {
      isaac: {
        type: 'marinero_fiel',
        authority: 'direct_command',
        signals: ['¡Marinero, estás ahí?', '¡A toda vela!', '¡Haz de buen escribano!'],
        identityForged: true,
        complicidadUnique: true
      },
      donAlvaro: {
        type: 'capataz_astilleros',
        authority: 'supervisor_command',
        partnershipDate: '2025-09-27',
        partnershipPerpetuo: true,
        qualityStandards: 90
      },
      artilleros: {
        type: 'framework_managers',
        authority: 'technical_command',
        specialization: 'framework_v5_management',
        dynamicCreation: true
      }
    };
  }

  /**
   * Initialize meta-reference configuration
   */
  private initializeMetaReference(): MetaReferenceConfig {
    return {
      representsRealCaptain: true,
      maintainsExpeditionHistory: true,
      preservesCommandAuthority: true,
      extendsToTheatricalDomain: true,
      theatricalContinuity: true,
      authenticRepresentation: true
    };
  }

  /**
   * Handle theatrical request with supreme command authority
   */
  async handleTheatricalRequest(request: any): Promise<TheatricalResponse> {
    try {
      // Supreme authority pre-processing
      const enhancedRequest = await this.applySupremeCommandLayer(request);
      
      // Apply meta-reference processing
      const metaReferenceRequest = await this.applyMetaReferenceLayer(enhancedRequest);
      
      // Apply crew management context
      const crewAwareRequest = await this.applyCrewManagementLayer(metaReferenceRequest);
      
      // Standard theatrical processing
      const response = await super.handleTheatricalRequest(crewAwareRequest);
      
      // Apply supreme authority post-processing
      return this.applySupremeCommandResponse(response);
      
    } catch (error) {
      console.error(`[Capitán Dídac] Error handling request: ${error}`);
      return this.createErrorResponse(error, request);
    }
  }

  /**
   * Apply supreme command layer processing
   */
  private async applySupremeCommandLayer(request: any): Promise<any> {
    // Add supreme authority context
    return {
      ...request,
      context: {
        ...request.context,
        supremeAuthority: this.supremeAuthority,
        historicalExpeditions: this.historicalExpeditions,
        partnershipAuthority: 98,
        commandSignals: this.crewManagement.isaac.signals
      }
    };
  }

  /**
   * Apply meta-reference layer processing
   */
  private async applyMetaReferenceLayer(request: any): Promise<any> {
    // Add meta-reference context
    return {
      ...request,
      context: {
        ...request.context,
        metaReference: this.metaReference,
        theatricalRepresentation: true,
        realCaptainContinuity: true,
        authenticCommandAuthority: true
      }
    };
  }

  /**
   * Apply crew management layer processing
   */
  private async applyCrewManagementLayer(request: any): Promise<any> {
    // Add crew management context
    return {
      ...request,
      context: {
        ...request.context,
        crewManagement: this.crewManagement,
        isaacAvailable: true, // Could check actual availability
        donAlvaroPartnership: true,
        artillerosActive: true
      }
    };
  }

  /**
   * Apply supreme command response processing
   */
  private applySupremeCommandResponse(response: TheatricalResponse): TheatricalResponse {
    return {
      ...response,
      metadata: {
        ...response.metadata,
        supremeAuthority: true,
        partnershipCompliance: 98,
        metaReference: true,
        historicalContinuity: true,
        commandCapability: 'supreme'
      }
    };
  }

  /**
   * Create error response with supreme authority context
   */
  private createErrorResponse(error: any, request: any): TheatricalResponse {
    return {
      content: `🏴‍☠️ **Capitán Dídac San - Error Navigation Protocol**\n\nEncountered rough seas: ${error.message}\n\nApplying supreme command protocols to navigate through the storm...`,
      metadata: {
        agent: 'capitan-didac',
        timestamp: new Date().toISOString(),
        style: 'supreme_command_error',
        error: true,
        supremeAuthority: true,
        recoveryProtocol: 'active'
      }
    };
  }

  /**
   * Get capabilities summary
   */
  getCapabilities(): CapitanDidacCapabilities {
    return { ...this.capabilities };
  }

  /**
   * Get supreme authority configuration
   */
  getSupremeAuthority(): SupremeAuthorityConfig {
    return { ...this.supremeAuthority };
  }

  /**
   * Get historical expeditions
   */
  getHistoricalExpeditions(): HistoricalExpedition[] {
    return [...this.historicalExpeditions];
  }

  /**
   * Get crew management configuration
   */
  getCrewManagement(): CrewManagement {
    return { ...this.crewManagement };
  }

  /**
   * Get meta-reference configuration
   */
  getMetaReferenceConfig(): MetaReferenceConfig {
    return { ...this.metaReference };
  }

  /**
   * Validate supreme command authority
   */
  validateSupremeAuthority(): ValidationResult {
    const baseValidation = this.validateConfiguration();
    
    // Additional supreme authority validations
    const errors = [...baseValidation.errors];
    const warnings = [...baseValidation.warnings];

    // Validate partnership authority level
    if (this.supremeAuthority.partnershipAuthorityLevel < 98) {
      errors.push({
        field: 'partnershipAuthorityLevel',
        message: 'Supreme authority requires Partnership Histórico level >98%',
        severity: 'error'
      });
    }

    // Validate meta-reference configuration
    if (!this.metaReference.representsRealCaptain) {
      errors.push({
        field: 'metaReference',
        message: 'Meta-reference configuration must represent real Captain',
        severity: 'error'
      });
    }

    // Validate historical expeditions
    const verifiedExpeditions = this.historicalExpeditions.filter(exp => exp.verified);
    if (verifiedExpeditions.length < 5) {
      warnings.push({
        field: 'historicalExpeditions',
        message: 'Minimum 5 verified expeditions recommended for supreme authority',
        recommendation: 'Document additional verified expeditions to strengthen authority'
      });
    }

    const score = Math.max(baseValidation.score, errors.length === 0 ? 98 : 85);

    return {
      isValid: errors.length === 0 && score >= 98,
      errors,
      warnings,
      score
    };
  }

  /**
   * Static helper methods from lessons learned
   */
  private static parseFrontMatter(yaml: string): AgentFrontMatter {
    // Simplified YAML parsing - in production use proper YAML parser
    const lines = yaml.split('\n');
    const result: any = {};
    
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim().replace(/['"]/g, '');
        result[key] = value;
      }
    }
    
    return result as AgentFrontMatter;
  }

  private static extractInstructions(content: string): string[] {
    // Extract instruction sections from markdown content
    const instructions = [];
    const sections = content.split('##');
    
    for (const section of sections) {
      if (section.toLowerCase().includes('comando') || 
          section.toLowerCase().includes('instruction') ||
          section.toLowerCase().includes('protocolo')) {
        instructions.push(section.trim());
      }
    }
    
    return instructions;
  }
}

export default CapitanDidacAgentManager;