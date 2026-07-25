/**
 * Core TypeScript Interfaces for Theatrical System
 * Sprint S09-001 - Artillero Alpha Implementation
 * Partnership Histórico Standards: >90% accuracy enforced
 */

import { ChatParticipant, ChatRequest, ChatResponseTurn } from 'vscode';

/**
 * Base interface for all theatrical agents
 * Compatible with VibeCoding micro-sprint system
 */
export interface ITheatricalAgent {
  // Identity and metadata
  readonly id: string;
  readonly name: string;
  readonly displayName: string;
  readonly category: 'framework-retro' | 'technical-devops' | 'validation' | 'custom';
  readonly emoji: string;
  
  // Content and configuration
  readonly content: AgentContent;
  readonly configuration: AgentConfiguration;
  readonly vibeCodingIntegration: VibeCodingIntegration;
  
  // MCP Integration
  readonly mcpIntegration?: MCPIntegration;
  
  // Core functionality
  createChatParticipant(): ChatParticipant;
  handleRequest(request: ChatRequest): Promise<ChatResponseTurn>;
  validateConfiguration(): ValidationResult;
  
  // Lifecycle management
  initialize(): Promise<void>;
  dispose(): void;
}

/**
 * Agent content loaded from markdown files
 * Natural language layer - no technical configuration
 */
export interface AgentContent {
  readonly markdown: string;
  readonly frontMatter: AgentFrontMatter;
  readonly instructions: string[];
  readonly personality: PersonalityTraits;
  readonly expertise: string[];
}

/**
 * YAML frontmatter from agent markdown files
 */
export interface AgentFrontMatter {
  readonly name: string;
  readonly title: string;
  readonly emoji: string;
  readonly category: string;
  readonly expertise: string[];
  readonly personality: string;
  readonly vibecoding_role?: string;
  readonly sprint_authority?: string[];
}

/**
 * Agent configuration from JSON files
 * Technical behavior and VibeCoding integration
 */
export interface AgentConfiguration {
  readonly agentId: string;
  readonly displayName: string;
  readonly model: string;
  readonly tools: string[];
  readonly vibecoding: VibeCodingConfiguration;
  readonly mcp?: MCPConfiguration;
  readonly personality: PersonalityConfiguration;
  readonly capabilities: AgentCapabilities;
}

/**
 * VibeCoding system integration configuration
 * Sprint-based workflow compatibility
 */
export interface VibeCodingConfiguration {
  readonly sprint_role: string;
  readonly checkpoint_authority: string[];
  readonly validation_level: 'documentation' | 'technical' | 'integration' | 'full';
  readonly can_block_sprint: boolean;
  readonly reports_to?: string;
  readonly quality_gates: string[];
}

/**
 * MCP (Model Context Protocol) integration
 */
export interface MCPConfiguration {
  readonly servers: string[];
  readonly tools: string[];
  readonly resources: string[];
  readonly customIntegrations?: CustomMCPIntegration[];
}

export interface CustomMCPIntegration {
  readonly name: string;
  readonly endpoint: string;
  readonly tools: string[];
  readonly resources: string[];
}

/**
 * Agent personality and behavior configuration
 */
export interface PersonalityConfiguration {
  readonly style: 'technical' | 'nautical' | 'formal' | 'casual' | 'creative';
  readonly formality: 'formal' | 'casual' | 'mixed';
  readonly emoji_usage: 'none' | 'minimal' | 'moderate' | 'frequent';
  readonly captain_relationship?: 'loyal_crew' | 'technical_expert' | 'independent' | 'supervisor';
  readonly vibecoding_integration: boolean;
}

/**
 * Agent capabilities and authorities
 */
export interface AgentCapabilities {
  readonly project_management: boolean;
  readonly documentation: boolean;
  readonly code_generation: boolean;
  readonly architecture_decisions: boolean;
  readonly quality_validation: boolean;
  readonly sprint_blocking: boolean;
  readonly mcp_integration: boolean;
}

/**
 * Personality traits from content analysis
 */
export interface PersonalityTraits {
  readonly communication_style: string;
  readonly technical_focus: string[];
  readonly collaboration_patterns: string[];
  readonly authority_level: 'contributor' | 'specialist' | 'lead' | 'supervisor' | 'director';
}

/**
 * VibeCoding integration points
 */
export interface VibeCodingIntegration {
  readonly sprintManager: ISprintManager;
  readonly checkpointTracker: ICheckpointTracker;
  readonly validationGateway: IValidationGateway;
  readonly iterationManager: IIterationManager;
}

/**
 * MCP system integration
 */
export interface MCPIntegration {
  readonly clientManager: IMCPClientManager;
  readonly toolRegistry: IMCPToolRegistry;
  readonly resourceManager: IMCPResourceManager;
}

/**
 * Validation result for agent configuration
 */
export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: ValidationError[];
  readonly warnings: ValidationWarning[];
  readonly score: number; // Partnership Histórico standard: >90%
}

export interface ValidationError {
  readonly field: string;
  readonly message: string;
  readonly severity: 'error' | 'warning' | 'info';
}

export interface ValidationWarning {
  readonly field: string;
  readonly message: string;
  readonly recommendation: string;
}

/**
 * Sprint management integration
 */
export interface ISprintManager {
  getCurrentSprint(): Promise<SprintInfo>;
  updateCheckpoint(checkpointId: string, status: CheckpointStatus): Promise<void>;
  blockSprint(reason: string, agentId: string): Promise<void>;
  unblockSprint(agentId: string): Promise<void>;
}

/**
 * Checkpoint tracking system
 */
export interface ICheckpointTracker {
  getCheckpointStatus(checkpointId: string): Promise<CheckpointStatus>;
  updateCheckpoint(checkpointId: string, status: CheckpointStatus, agentId: string): Promise<void>;
  getAgentCheckpoints(agentId: string): Promise<CheckpointInfo[]>;
}

/**
 * Validation gateway for S09 pipeline
 */
export interface IValidationGateway {
  validateAgent(agent: ITheatricalAgent): Promise<ValidationResult>;
  validateSprint(sprintId: string): Promise<SprintValidationResult>;
  enforceQualityGates(agentId: string, deliverables: Deliverable[]): Promise<QualityGateResult>;
}

/**
 * Iteration management for documentation
 */
export interface IIterationManager {
  createIteration(sprintId: string, template: IterationTemplate): Promise<IterationInfo>;
  updateIteration(iterationId: string, content: IterationContent): Promise<void>;
  getIteration(iterationId: string): Promise<IterationInfo>;
}

/**
 * MCP Client Manager
 */
export interface IMCPClientManager {
  connectToServer(serverUrl: string): Promise<MCPConnection>;
  disconnectFromServer(serverId: string): Promise<void>;
  getAvailableServers(): Promise<MCPServerInfo[]>;
  executeToolCall(serverId: string, toolName: string, parameters: any): Promise<any>;
}

/**
 * MCP Tool Registry
 */
export interface IMCPToolRegistry {
  registerTool(tool: MCPTool): Promise<void>;
  unregisterTool(toolId: string): Promise<void>;
  getAvailableTools(serverId?: string): Promise<MCPTool[]>;
  executeTool(toolId: string, parameters: any): Promise<any>;
}

/**
 * MCP Resource Manager  
 */
export interface IMCPResourceManager {
  getResource(resourceId: string): Promise<MCPResource>;
  listResources(serverId?: string): Promise<MCPResource[]>;
  subscribeToResource(resourceId: string, callback: (resource: MCPResource) => void): Promise<void>;
}

// Supporting types

export interface SprintInfo {
  readonly id: string;
  readonly name: string;
  readonly status: 'planned' | 'active' | 'blocked' | 'completed';
  readonly startDate: Date;
  readonly endDate?: Date;
  readonly assignedAgents: string[];
  readonly checkpoints: CheckpointInfo[];
}

export interface CheckpointInfo {
  readonly id: string;
  readonly name: string;
  readonly status: CheckpointStatus;
  readonly assignedAgent?: string;
  readonly dependencies: string[];
  readonly deliverables: string[];
}

export type CheckpointStatus = 'not-started' | 'in-progress' | 'blocked' | 'completed' | 'validated';

export interface SprintValidationResult {
  readonly sprintId: string;
  readonly isValid: boolean;
  readonly completedCheckpoints: number;
  readonly totalCheckpoints: number;
  readonly blockedBy: string[];
  readonly readyForNext: boolean;
}

export interface QualityGateResult {
  readonly passed: boolean;
  readonly score: number;
  readonly requirements: QualityRequirement[];
  readonly recommendations: string[];
}

export interface QualityRequirement {
  readonly id: string;
  readonly name: string;
  readonly status: 'passed' | 'failed' | 'warning';
  readonly score: number;
  readonly details: string;
}

export interface Deliverable {
  readonly id: string;
  readonly name: string;
  readonly type: 'code' | 'documentation' | 'configuration' | 'test';
  readonly path: string;
  readonly status: 'created' | 'modified' | 'validated';
}

export interface IterationTemplate {
  readonly name: string;
  readonly sections: IterationSection[];
  readonly requiredFields: string[];
}

export interface IterationSection {
  readonly id: string;
  readonly name: string;
  readonly required: boolean;
  readonly template: string;
}

export interface IterationContent {
  readonly sections: Record<string, string>;
  readonly metadata: Record<string, any>;
  readonly lastUpdated: Date;
  readonly updatedBy: string;
}

export interface IterationInfo {
  readonly id: string;
  readonly sprintId: string;
  readonly template: IterationTemplate;
  readonly content: IterationContent;
  readonly created: Date;
  readonly status: 'draft' | 'active' | 'completed' | 'archived';
}

export interface MCPConnection {
  readonly id: string;
  readonly serverUrl: string;
  readonly status: 'connected' | 'disconnected' | 'error';
  readonly capabilities: string[];
}

export interface MCPServerInfo {
  readonly id: string;
  readonly name: string;
  readonly url: string;
  readonly status: 'available' | 'unavailable' | 'error';
  readonly tools: string[];
  readonly resources: string[];
}

export interface MCPTool {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly parameters: MCPToolParameter[];
  readonly serverId: string;
}

export interface MCPToolParameter {
  readonly name: string;
  readonly type: string;
  readonly required: boolean;
  readonly description: string;
  readonly defaultValue?: any;
}

export interface MCPResource {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly data: any;
  readonly serverId: string;
  readonly lastUpdated: Date;
}