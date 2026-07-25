/**
 * Index file for Theatrical System Core Interfaces
 * Sprint S09-001 - Artillero Alpha Implementation
 */

// Core interfaces
export * from './ITheatricalAgent';
export * from './ICompany';
export * from './IPlay';

// Re-export common types for convenience
export type {
  AgentContent,
  AgentConfiguration,
  PersonalityConfiguration,
  VibeCodingConfiguration,
  MCPConfiguration,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from './ITheatricalAgent';

export type {
  CompanyCategory,
  CompanyAuthority,
  CollaborationStyle,
  CompanyTask,
  CompanyResult,
  CompanyStatus,
  CompanyHealth,
  QualityMetrics,
} from './ICompany';

export type {
  PlayCategory,
  PlayComplexity,
  PlayRequirements,
  PlayOutcomes,
  PlayResult,
  ActResult,
  SceneResult,
  PlayStatus,
} from './IPlay';