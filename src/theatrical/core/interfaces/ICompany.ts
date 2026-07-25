/**
 * Company Interface for Theatrical System
 * Manages collections of theatrical agents as cohesive units
 * Sprint S09-001 - Artillero Alpha Implementation
 *
 * WP-V09 · SEPARACIÓN: ICompany es el Modelo B (compañía teatral IDE /
 * ChatParticipants). NO es `reparto/1` ni alimenta el cast-table.
 * Elenco de dominio = Modelo A (`src/elenco/`, filasCastDesdeReparto).
 * Ver `src/elenco/DOS-MODELOS.md`.
 */

import { ITheatricalAgent, VibeCodingIntegration, ValidationResult } from './ITheatricalAgent';

/**
 * A Company represents a collection of theatrical agents
 * that work together as a cohesive unit (e.g., Framework Retro crew)
 *
 * SEPARADO de reparto/1 (carril Z). Prohibido fusionar con elenco de dominio.
 */
export interface ICompany {
  // Identity
  readonly id: string;
  readonly name: string;
  readonly displayName: string;
  readonly description: string;
  readonly emoji: string;

  // Agents management
  readonly agents: ITheatricalAgent[];
  readonly primaryAgent?: ITheatricalAgent;
  readonly supportAgents: ITheatricalAgent[];

  // Company characteristics
  readonly category: CompanyCategory;
  readonly expertise: string[];
  readonly authority: CompanyAuthority;
  readonly collaboration: CollaborationStyle;

  // VibeCoding integration
  readonly vibeCodingIntegration: CompanyVibeCodingIntegration;

  // Core functionality
  addAgent(agent: ITheatricalAgent): Promise<void>;
  removeAgent(agentId: string): Promise<void>;
  getAgent(agentId: string): ITheatricalAgent | undefined;
  
  // Company-wide operations
  initializeCompany(): Promise<void>;
  validateCompany(): Promise<ValidationResult>;
  activateCompany(): Promise<void>;
  deactivateCompany(): Promise<void>;
  
  // Collaboration coordination
  coordinateAgents(task: CompanyTask): Promise<CompanyResult>;
  delegateToAgent(agentId: string, task: AgentTask): Promise<AgentResult>;
  getCompanyStatus(): CompanyStatus;
}

/**
 * Company categories for organizational purposes
 */
export type CompanyCategory = 
  | 'framework-retro'     // Isaac, Astilleador, Artillero, etc.
  | 'technical-devops'    // Backend, Frontend, Debug agents
  | 'validation'          // Quality assurance and testing
  | 'project-management'  // Sprint management and coordination
  | 'custom';             // User-defined companies

/**
 * Company authority levels within the theatrical system
 */
export interface CompanyAuthority {
  readonly level: 'advisory' | 'executive' | 'supervisory' | 'autonomous';
  readonly canBlockSprints: boolean;
  readonly canCreateSprints: boolean;
  readonly canModifyArchitecture: boolean;
  readonly canOverrideValidation: boolean;
  readonly reportingStructure: string[];
}

/**
 * How the company collaborates internally and externally
 */
export interface CollaborationStyle {
  readonly internal: 'hierarchical' | 'democratic' | 'lead-driven' | 'consensus';
  readonly external: 'cooperative' | 'independent' | 'service-provider' | 'advisory';
  readonly conflictResolution: 'escalation' | 'voting' | 'lead-decision' | 'external-arbitration';
  readonly knowledgeSharing: 'open' | 'restricted' | 'hierarchical' | 'need-to-know';
}

/**
 * VibeCoding integration at company level
 */
export interface CompanyVibeCodingIntegration extends VibeCodingIntegration {
  readonly companyRole: string;
  readonly crossCompanyAuthority: string[];
  readonly companyValidationLevel: 'basic' | 'comprehensive' | 'strategic';
  readonly canInfluenceOtherCompanies: boolean;
}

/**
 * Task assigned to entire company
 */
export interface CompanyTask {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly priority: 'low' | 'medium' | 'high' | 'critical';
  readonly deadline?: Date;
  readonly requiredExpertise: string[];
  readonly deliverables: CompanyDeliverable[];
  readonly dependencies: string[];
  readonly sprintId?: string;
}

/**
 * Task assigned to specific agent within company
 */
export interface AgentTask {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly assignedAgent: string;
  readonly priority: 'low' | 'medium' | 'high' | 'critical';
  readonly deadline?: Date;
  readonly context: TaskContext;
  readonly deliverables: AgentDeliverable[];
}

/**
 * Result from company-wide operation
 */
export interface CompanyResult {
  readonly taskId: string;
  readonly status: 'completed' | 'partial' | 'failed' | 'delegated';
  readonly completedBy: string[];
  readonly deliverables: CompanyDeliverable[];
  readonly duration: number;
  readonly quality: QualityMetrics;
  readonly nextSteps?: string[];
}

/**
 * Result from individual agent operation
 */
export interface AgentResult {
  readonly taskId: string;
  readonly agentId: string;
  readonly status: 'completed' | 'failed' | 'needs-review' | 'escalated';
  readonly deliverables: AgentDeliverable[];
  readonly duration: number;
  readonly confidence: number;
  readonly recommendations?: string[];
}

/**
 * Current status of the company
 */
export interface CompanyStatus {
  readonly isActive: boolean;
  readonly agentCount: number;
  readonly activeAgents: number;
  readonly currentTasks: number;
  readonly completedTasks: number;
  readonly averagePerformance: number;
  readonly lastActivity: Date;
  readonly health: CompanyHealth;
}

/**
 * Company health metrics
 */
export interface CompanyHealth {
  readonly overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  readonly agentSynchronization: number; // 0-100%
  readonly taskCompletionRate: number;   // 0-100%
  readonly collaborationEfficiency: number; // 0-100%
  readonly knowledgeSharing: number;     // 0-100%
  readonly conflictResolution: number;   // 0-100%
}

/**
 * Deliverable expected from company
 */
export interface CompanyDeliverable {
  readonly id: string;
  readonly name: string;
  readonly type: 'architecture' | 'implementation' | 'documentation' | 'validation' | 'coordination';
  readonly description: string;
  readonly acceptanceCriteria: string[];
  readonly assignedAgents: string[];
  readonly dependencies: string[];
  readonly status: 'not-started' | 'in-progress' | 'review' | 'completed' | 'rejected';
}

/**
 * Deliverable expected from individual agent
 */
export interface AgentDeliverable {
  readonly id: string;
  readonly name: string;
  readonly type: 'code' | 'documentation' | 'configuration' | 'analysis' | 'recommendation';
  readonly description: string;
  readonly path?: string;
  readonly content?: string;
  readonly metadata: Record<string, any>;
  readonly status: 'created' | 'modified' | 'validated' | 'deployed';
}

/**
 * Context information for task execution
 */
export interface TaskContext {
  readonly projectId?: string;
  readonly sprintId?: string;
  readonly previousTasks: string[];
  readonly relatedAgents: string[];
  readonly environment: 'development' | 'staging' | 'production';
  readonly constraints: TaskConstraint[];
  readonly resources: TaskResource[];
}

/**
 * Constraint that affects task execution
 */
export interface TaskConstraint {
  readonly type: 'time' | 'resource' | 'dependency' | 'quality' | 'scope';
  readonly description: string;
  readonly severity: 'soft' | 'hard' | 'critical';
  readonly impact: string;
}

/**
 * Resource available for task execution
 */
export interface TaskResource {
  readonly type: 'documentation' | 'tool' | 'service' | 'expertise' | 'template';
  readonly name: string;
  readonly location: string;
  readonly availability: 'always' | 'scheduled' | 'on-demand' | 'limited';
  readonly access: 'public' | 'restricted' | 'private';
}

/**
 * Quality metrics for work evaluation
 */
export interface QualityMetrics {
  readonly accuracy: number;        // 0-100% - Partnership Histórico standard: >90%
  readonly completeness: number;    // 0-100%
  readonly efficiency: number;      // 0-100%
  readonly maintainability: number; // 0-100%
  readonly documentation: number;   // 0-100%
  readonly testCoverage?: number;   // 0-100%
  readonly overallScore: number;    // Weighted average
}

/**
 * Company factory for creating predefined company structures
 */
export interface ICompanyFactory {
  createFrameworkRetroCompany(): Promise<ICompany>;
  createTechnicalDevOpsCompany(): Promise<ICompany>;
  createValidationCompany(): Promise<ICompany>;
  createCustomCompany(config: CompanyConfiguration): Promise<ICompany>;
  
  // Standard company templates
  getAvailableTemplates(): CompanyTemplate[];
  createFromTemplate(templateId: string, customization?: CompanyCustomization): Promise<ICompany>;
}

/**
 * Configuration for creating custom companies
 */
export interface CompanyConfiguration {
  readonly name: string;
  readonly displayName: string;
  readonly description: string;
  readonly category: CompanyCategory;
  readonly agentIds: string[];
  readonly primaryAgentId?: string;
  readonly authority: CompanyAuthority;
  readonly collaboration: CollaborationStyle;
  readonly vibeCodingIntegration: Partial<CompanyVibeCodingIntegration>;
}

/**
 * Template for creating standard company types
 */
export interface CompanyTemplate {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: CompanyCategory;
  readonly defaultAgents: string[];
  readonly requiredExpertise: string[];
  readonly recommendedSize: { min: number; max: number; optimal: number };
  readonly authority: CompanyAuthority;
  readonly collaboration: CollaborationStyle;
}

/**
 * Customization options when creating from template
 */
export interface CompanyCustomization {
  readonly name?: string;
  readonly displayName?: string;
  readonly additionalAgents?: string[];
  readonly excludedAgents?: string[];
  readonly authorityOverrides?: Partial<CompanyAuthority>;
  readonly collaborationOverrides?: Partial<CollaborationStyle>;
  readonly expertiseAdditions?: string[];
}