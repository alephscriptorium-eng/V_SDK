/**
 * Play Interface for Theatrical System
 * Represents structured workflows and interaction patterns
 * Sprint S09-001 - Artillero Alpha Implementation
 */

import { ITheatricalAgent, ValidationResult } from './ITheatricalAgent';
import { ICompany } from './ICompany';

/**
 * A Play represents a structured workflow or interaction pattern
 * that defines how agents and companies collaborate to achieve specific goals
 */
export interface IPlay {
  // Identity
  readonly id: string;
  readonly name: string;
  readonly displayName: string;
  readonly description: string;
  readonly emoji: string;

  // Play structure
  readonly acts: IAct[];
  readonly scenes: IScene[];
  readonly cast: PlayCast;
  readonly duration: PlayDuration;

  // Play characteristics
  readonly category: PlayCategory;
  readonly complexity: PlayComplexity;
  readonly requirements: PlayRequirements;
  readonly outcomes: PlayOutcomes;

  // VibeCoding integration
  readonly vibeCodingIntegration: PlayVibeCodingIntegration;

  // Execution control
  executePlay(context: PlayContext): Promise<PlayResult>;
  pausePlay(): Promise<void>;
  resumePlay(): Promise<void>;
  stopPlay(): Promise<void>;
  
  // Validation and health
  validatePlay(): Promise<ValidationResult>;
  getPlayStatus(): PlayStatus;
  
  // Cast management
  assignRole(role: string, agent: ITheatricalAgent): Promise<void>;
  assignCompany(company: ICompany, roles: string[]): Promise<void>;
  getCastMember(role: string): ITheatricalAgent | undefined;
}

/**
 * An Act represents a major phase or section of a play
 */
export interface IAct {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly order: number;
  readonly scenes: IScene[];
  readonly duration: ActDuration;
  readonly objectives: string[];
  readonly prerequisites: string[];
  readonly deliverables: ActDeliverable[];
  
  executeAct(context: ActContext): Promise<ActResult>;
  validateAct(): Promise<ValidationResult>;
}

/**
 * A Scene represents a specific interaction or workflow step
 */
export interface IScene {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly actId: string;
  readonly order: number;
  readonly participants: SceneParticipant[];
  readonly duration: SceneDuration;
  readonly dialogues: IDialogue[];
  readonly actions: IAction[];
  readonly transitions: ITransition[];
  
  executeScene(context: SceneContext): Promise<SceneResult>;
  validateScene(): Promise<ValidationResult>;
}

/**
 * Dialogue represents communication between agents
 */
export interface IDialogue {
  readonly id: string;
  readonly speaker: string;
  readonly audience: string[];
  readonly content: DialogueContent;
  readonly timing: DialogueTiming;
  readonly expectations: DialogueExpectation[];
  
  executeDialogue(context: DialogueContext): Promise<DialogueResult>;
}

/**
 * Action represents a specific task or operation
 */
export interface IAction {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly performer: string;
  readonly type: ActionType;
  readonly parameters: ActionParameters;
  readonly validation: ActionValidation;
  readonly rollback?: ActionRollback;
  
  executeAction(context: ActionContext): Promise<ActionResult>;
  validateAction(): Promise<ValidationResult>;
  rollbackAction(): Promise<void>;
}

/**
 * Transition represents movement between scenes or states
 */
export interface ITransition {
  readonly id: string;
  readonly name: string;
  readonly fromScene: string;
  readonly toScene: string;
  readonly condition: TransitionCondition;
  readonly actions: IAction[];
  
  evaluateTransition(context: TransitionContext): Promise<boolean>;
  executeTransition(context: TransitionContext): Promise<TransitionResult>;
}

// Play characteristics and metadata

export type PlayCategory = 
  | 'architecture'      // System design and planning
  | 'implementation'    // Code development and creation
  | 'validation'        // Testing and quality assurance
  | 'documentation'     // Writing and updating docs
  | 'deployment'        // Release and deployment
  | 'maintenance'       // Ongoing system care
  | 'crisis'           // Emergency response
  | 'training';        // Learning and skill development

export interface PlayComplexity {
  readonly level: 'simple' | 'moderate' | 'complex' | 'expert';
  readonly agentCount: { min: number; max: number; optimal: number };
  readonly parallelism: 'sequential' | 'parallel' | 'mixed';
  readonly dependencies: 'none' | 'few' | 'moderate' | 'complex';
  readonly skillRequirements: string[];
}

export interface PlayRequirements {
  readonly minimumAgents: number;
  readonly requiredRoles: string[];
  readonly requiredExpertise: string[];
  readonly requiredTools: string[];
  readonly requiredResources: string[];
  readonly prerequisites: string[];
  readonly constraints: PlayConstraint[];
}

export interface PlayOutcomes {
  readonly primaryGoals: string[];
  readonly secondaryGoals: string[];
  readonly deliverables: PlayDeliverable[];
  readonly metrics: PlayMetric[];
  readonly successCriteria: string[];
  readonly qualityGates: string[];
}

export interface PlayConstraint {
  readonly type: 'time' | 'resource' | 'quality' | 'scope' | 'dependency';
  readonly description: string;
  readonly severity: 'soft' | 'hard' | 'critical';
  readonly enforcement: 'warning' | 'blocking' | 'automated';
}

export interface PlayDeliverable {
  readonly id: string;
  readonly name: string;
  readonly type: 'code' | 'documentation' | 'configuration' | 'report' | 'decision';
  readonly description: string;
  readonly responsible: string[];
  readonly dependencies: string[];
  readonly acceptanceCriteria: string[];
  readonly qualityStandards: QualityStandard[];
}

export interface PlayMetric {
  readonly name: string;
  readonly type: 'time' | 'quality' | 'efficiency' | 'satisfaction' | 'coverage';
  readonly target: number;
  readonly unit: string;
  readonly measurement: 'automatic' | 'manual' | 'calculated';
}

export interface QualityStandard {
  readonly name: string;
  readonly description: string;
  readonly threshold: number;
  readonly measurement: string;
  readonly enforcement: 'advisory' | 'blocking' | 'automatic';
}

// Cast and participants

export interface PlayCast {
  readonly roles: PlayRole[];
  readonly companies: CompanyRole[];
  readonly assignments: CastAssignment[];
  readonly understudies: UnderstudyAssignment[];
}

export interface PlayRole {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly importance: 'lead' | 'supporting' | 'background' | 'cameo';
  readonly requiredExpertise: string[];
  readonly requiredCapabilities: string[];
  readonly responsibilities: string[];
  readonly authority: RoleAuthority;
}

export interface CompanyRole {
  readonly companyId: string;
  readonly roles: string[];
  readonly coordination: 'internal' | 'external' | 'mixed';
  readonly authority: 'advisory' | 'executive' | 'collaborative';
}

export interface CastAssignment {
  readonly roleId: string;
  readonly agentId: string;
  readonly assignment: 'primary' | 'secondary' | 'backup';
  readonly confidence: number;
  readonly notes?: string;
}

export interface UnderstudyAssignment {
  readonly primaryRole: string;
  readonly understudyAgent: string;
  readonly readiness: number;
  readonly conditions: string[];
}

export interface RoleAuthority {
  readonly canMakeDecisions: boolean;
  readonly canBlockProgress: boolean;
  readonly canOverrideOthers: boolean;
  readonly reportingStructure: string[];
  readonly escalationPath: string[];
}

export interface SceneParticipant {
  readonly agentId: string;
  readonly role: string;
  readonly participation: 'active' | 'passive' | 'observer';
  readonly required: boolean;
}

// Execution contexts and results

export interface PlayContext {
  readonly environment: 'development' | 'staging' | 'production';
  readonly priority: 'low' | 'medium' | 'high' | 'critical';
  readonly resources: ContextResource[];
  readonly constraints: ContextConstraint[];
  readonly metadata: Record<string, any>;
  readonly vibeCodingContext?: VibeCodingContext;
}

export interface ActContext extends PlayContext {
  readonly actId: string;
  readonly previousActs: string[];
  readonly actObjectives: string[];
}

export interface SceneContext extends ActContext {
  readonly sceneId: string;
  readonly participants: string[];
  readonly sceneObjectives: string[];
}

export interface DialogueContext extends SceneContext {
  readonly speaker: string;
  readonly audience: string[];
  readonly conversationHistory: DialogueHistory[];
}

export interface ActionContext extends SceneContext {
  readonly performer: string;
  readonly actionType: ActionType;
  readonly parameters: Record<string, any>;
}

export interface TransitionContext extends SceneContext {
  readonly fromScene: string;
  readonly toScene: string;
  readonly transitionData: Record<string, any>;
}

export interface ContextResource {
  readonly type: 'tool' | 'service' | 'data' | 'documentation' | 'expertise';
  readonly name: string;
  readonly location: string;
  readonly access: 'available' | 'restricted' | 'unavailable';
}

export interface ContextConstraint {
  readonly type: 'time' | 'resource' | 'quality' | 'dependency';
  readonly value: any;
  readonly enforcement: 'soft' | 'hard';
}

export interface VibeCodingContext {
  readonly sprintId: string;
  readonly iteration: number;
  readonly checkpoints: string[];
  readonly validationLevel: 'basic' | 'comprehensive' | 'full';
}

// Results and outcomes

export interface PlayResult {
  readonly playId: string;
  readonly status: 'completed' | 'partial' | 'failed' | 'cancelled';
  readonly startTime: Date;
  readonly endTime: Date;
  readonly duration: number;
  readonly deliverables: PlayDeliverable[];
  readonly metrics: PlayMetricResult[];
  readonly quality: QualityResult;
  readonly lessons: string[];
  readonly recommendations: string[];
}

export interface ActResult {
  readonly actId: string;
  readonly status: 'completed' | 'partial' | 'failed' | 'skipped';
  readonly duration: number;
  readonly deliverables: ActDeliverable[];
  readonly scenesExecuted: number;
  readonly scenesTotal: number;
  readonly quality: QualityResult;
}

export interface SceneResult {
  readonly sceneId: string;
  readonly status: 'completed' | 'partial' | 'failed' | 'skipped';
  readonly duration: number;
  readonly participantResults: ParticipantResult[];
  readonly dialoguesExecuted: number;
  readonly actionsExecuted: number;
  readonly transitionsTriggered: number;
  readonly quality: QualityResult;
}

export interface DialogueResult {
  readonly dialogueId: string;
  readonly speaker: string;
  readonly audience: string[];
  readonly content: string;
  readonly response: DialogueResponse[];
  readonly effectiveness: number;
  readonly clarity: number;
}

export interface ActionResult {
  readonly actionId: string;
  readonly performer: string;
  readonly status: 'completed' | 'failed' | 'partial' | 'rollback';
  readonly output: any;
  readonly sideEffects: string[];
  readonly duration: number;
  readonly quality: QualityResult;
}

export interface TransitionResult {
  readonly transitionId: string;
  readonly fromScene: string;
  readonly toScene: string;
  readonly triggered: boolean;
  readonly reason: string;
  readonly actionsExecuted: number;
}

export interface ParticipantResult {
  readonly agentId: string;
  readonly role: string;
  readonly participation: number; // 0-100%
  readonly contribution: number;  // 0-100%
  readonly satisfaction: number;  // 0-100%
  readonly feedback: string[];
}

export interface PlayMetricResult {
  readonly name: string;
  readonly target: number;
  readonly actual: number;
  readonly unit: string;
  readonly achievement: number; // 0-100%
  readonly status: 'met' | 'partial' | 'missed' | 'exceeded';
}

export interface QualityResult {
  readonly overall: number; // 0-100%
  readonly accuracy: number;
  readonly completeness: number;
  readonly efficiency: number;
  readonly maintainability: number;
  readonly standards: QualityStandardResult[];
}

export interface QualityStandardResult {
  readonly name: string;
  readonly threshold: number;
  readonly actual: number;
  readonly status: 'passed' | 'failed' | 'warning';
  readonly impact: string;
}

// Supporting types

export interface PlayDuration {
  readonly estimated: number; // minutes
  readonly minimum: number;
  readonly maximum: number;
  readonly factors: DurationFactor[];
}

export interface ActDuration {
  readonly estimated: number;
  readonly dependencies: string[];
  readonly parallelizable: boolean;
}

export interface SceneDuration {
  readonly estimated: number;
  readonly variable: boolean;
  readonly factors: string[];
}

export interface DurationFactor {
  readonly name: string;
  readonly impact: 'low' | 'medium' | 'high';
  readonly description: string;
}

export interface DialogueContent {
  readonly template: string;
  readonly variables: Record<string, any>;
  readonly style: 'formal' | 'casual' | 'technical' | 'creative';
  readonly expectations: string[];
}

export interface DialogueTiming {
  readonly maxDuration: number;
  readonly expectedTurns: number;
  readonly timeout: number;
}

export interface DialogueExpectation {
  readonly type: 'response' | 'action' | 'decision' | 'information';
  readonly description: string;
  readonly required: boolean;
  readonly validation: string;
}

export interface DialogueResponse {
  readonly respondent: string;
  readonly content: string;
  readonly type: 'answer' | 'question' | 'action' | 'clarification';
  readonly satisfaction: number;
}

export interface DialogueHistory {
  readonly speaker: string;
  readonly content: string;
  readonly timestamp: Date;
  readonly context: Record<string, any>;
}

export type ActionType = 
  | 'code-generation'
  | 'file-operation'
  | 'validation'
  | 'configuration'
  | 'communication'
  | 'analysis'
  | 'decision'
  | 'coordination';

export interface ActionParameters {
  readonly inputs: Record<string, any>;
  readonly options: Record<string, any>;
  readonly context: Record<string, any>;
}

export interface ActionValidation {
  readonly preconditions: string[];
  readonly postconditions: string[];
  readonly invariants: string[];
  readonly rollbackConditions: string[];
}

export interface ActionRollback {
  readonly strategy: 'automatic' | 'manual' | 'none';
  readonly commands: string[];
  readonly verification: string[];
}

export interface TransitionCondition {
  readonly type: 'always' | 'conditional' | 'manual' | 'timed';
  readonly expression: string;
  readonly dependencies: string[];
  readonly timeout?: number;
}

export interface ActDeliverable {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly status: 'created' | 'modified' | 'validated';
  readonly quality: number;
}

export interface PlayStatus {
  readonly current: 'not-started' | 'in-progress' | 'paused' | 'completed' | 'failed';
  readonly currentAct?: string;
  readonly currentScene?: string;
  readonly progress: number; // 0-100%
  readonly participants: string[];
  readonly startTime?: Date;
  readonly estimatedCompletion?: Date;
  readonly issues: PlayIssue[];
}

export interface PlayIssue {
  readonly type: 'error' | 'warning' | 'blocker' | 'dependency';
  readonly description: string;
  readonly impact: 'low' | 'medium' | 'high' | 'critical';
  readonly recommendation: string;
}

export interface PlayVibeCodingIntegration {
  readonly sprintIntegration: boolean;
  readonly checkpointMapping: Record<string, string>;
  readonly validationPoints: string[];
  readonly reportingStructure: string[];
  readonly qualityGates: string[];
}