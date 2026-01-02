/**
 * SCRIPT-2.2.0: Model Selector Types
 * Types for LLM model configuration and selection
 */

/**
 * Tier classification for models
 */
export type ModelTier = 'lite' | 'standard' | 'premium';

/**
 * Configuration for a single LLM model
 */
export interface ModelConfig {
    /** Unique identifier (e.g., "claude-sonnet-4") */
    id: string;
    /** Display name (e.g., "Claude Sonnet 4") */
    name: string;
    /** VS Code LM API vendor (usually "copilot") */
    vendor: string;
    /** VS Code LM API family (e.g., "claude-sonnet") */
    family: string;
    /** Human-readable description */
    description: string;
    /** Pricing/capability tier */
    tier: ModelTier;
    /** Whether the model is enabled for selection */
    enabled: boolean;
}

/**
 * Full models configuration file structure
 */
export interface ModelsConfigFile {
    /** Schema reference */
    $schema?: string;
    /** Config version */
    version: string;
    /** Description of the config */
    description?: string;
    /** Available models */
    models: ModelConfig[];
    /** Default model ID to use */
    defaultModel: string;
}

/**
 * Extended model info with runtime data
 */
export interface ModelInfo extends ModelConfig {
    /** Source of the model entry */
    source: 'config' | 'discovered';
    /** Whether the model was used in recent logs */
    usedInLogs?: boolean;
    /** Last time this model was used (from logs) */
    lastUsed?: Date;
    /** Number of times used (from logs) */
    usageCount?: number;
}

/**
 * Result of model selection for generate_abstract
 */
export interface ModelSelectionResult {
    /** Whether a model was found */
    success: boolean;
    /** Selected model info */
    model?: ModelInfo;
    /** Error message if failed */
    error?: string;
    /** Whether fallback was used */
    usedFallback?: boolean;
}
