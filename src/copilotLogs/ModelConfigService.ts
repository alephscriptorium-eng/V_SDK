/**
 * SCRIPT-2.2.0: Model Configuration Service
 * Manages available LLM models for Generate Abstract feature
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { 
    ModelConfig, 
    ModelsConfigFile, 
    ModelInfo, 
    ModelSelectionResult 
} from './types/model.types';
import { CopilotUsageMetrics } from './types';

// Singleton instance
let instance: ModelConfigService | null = null;

/**
 * Service for managing model configuration
 */
export class ModelConfigService {
    private config: ModelsConfigFile | null = null;
    private configPath: string;
    private discoveredModels: Map<string, ModelInfo> = new Map();
    private outputChannel: vscode.OutputChannel;

    constructor(extensionPath: string, outputChannel?: vscode.OutputChannel) {
        this.configPath = path.join(
            extensionPath, 
            'src', 
            'copilotLogs', 
            'config', 
            'models-config.json'
        );
        this.outputChannel = outputChannel || vscode.window.createOutputChannel('Model Config');
        this.loadConfig();
    }

    /**
     * Load configuration from JSON file
     */
    private loadConfig(): void {
        try {
            // Try multiple paths for config
            const possiblePaths = [
                this.configPath,
                path.join(__dirname, 'config', 'models-config.json'),
                path.join(__dirname, '..', 'copilotLogs', 'config', 'models-config.json')
            ];

            for (const configPath of possiblePaths) {
                if (fs.existsSync(configPath)) {
                    const content = fs.readFileSync(configPath, 'utf-8');
                    this.config = JSON.parse(content);
                    this.outputChannel.appendLine(`[ModelConfig] Loaded config from: ${configPath}`);
                    return;
                }
            }

            // Fallback to embedded config
            this.config = this.getDefaultConfig();
            this.outputChannel.appendLine('[ModelConfig] Using embedded default config');
        } catch (error) {
            this.outputChannel.appendLine(`[ModelConfig] Error loading config: ${error}`);
            this.config = this.getDefaultConfig();
        }
    }

    /**
     * Get default embedded configuration
     */
    private getDefaultConfig(): ModelsConfigFile {
        return {
            version: '1.0.0',
            models: [
                {
                    id: 'claude-opus-4.5',
                    name: 'Claude Opus 4.5',
                    vendor: 'copilot',
                    family: 'claude-opus',
                    description: 'Most capable, best for complex reasoning',
                    tier: 'premium',
                    enabled: true
                },
                {
                    id: 'claude-sonnet-4',
                    name: 'Claude Sonnet 4',
                    vendor: 'copilot',
                    family: 'claude-sonnet',
                    description: 'Balanced performance and speed',
                    tier: 'standard',
                    enabled: true
                },
                {
                    id: 'claude-haiku-3.5',
                    name: 'Claude Haiku 3.5',
                    vendor: 'copilot',
                    family: 'claude-haiku',
                    description: 'Fast and lightweight',
                    tier: 'lite',
                    enabled: true
                },
                {
                    id: 'gemini-pro-3',
                    name: 'Gemini Pro 3',
                    vendor: 'copilot',
                    family: 'gemini-pro',
                    description: "Google's advanced model",
                    tier: 'standard',
                    enabled: true
                },
                {
                    id: 'gpt-5.2',
                    name: 'GPT-5.2',
                    vendor: 'copilot',
                    family: 'gpt-5',
                    description: "OpenAI's latest",
                    tier: 'premium',
                    enabled: true
                },
                {
                    id: 'gpt-4o',
                    name: 'GPT-4o',
                    vendor: 'copilot',
                    family: 'gpt-4o',
                    description: 'Fast multimodal (default)',
                    tier: 'standard',
                    enabled: true
                }
            ],
            defaultModel: 'claude-sonnet-4'
        };
    }

    /**
     * Get all available models (config + discovered)
     */
    getAvailableModels(): ModelInfo[] {
        const models: ModelInfo[] = [];

        // Add models from config
        if (this.config) {
            for (const model of this.config.models) {
                if (model.enabled) {
                    const discovered = this.discoveredModels.get(model.id);
                    models.push({
                        ...model,
                        source: 'config',
                        usedInLogs: discovered?.usedInLogs || false,
                        lastUsed: discovered?.lastUsed,
                        usageCount: discovered?.usageCount || 0
                    });
                }
            }
        }

        // Add discovered models not in config
        for (const [id, model] of this.discoveredModels) {
            if (!models.find(m => m.id === id)) {
                models.push(model);
            }
        }

        return models;
    }

    /**
     * Get a specific model by ID
     */
    getModelById(modelId: string): ModelInfo | undefined {
        // Check config first
        if (this.config) {
            const configModel = this.config.models.find(m => m.id === modelId);
            if (configModel) {
                const discovered = this.discoveredModels.get(modelId);
                return {
                    ...configModel,
                    source: 'config',
                    usedInLogs: discovered?.usedInLogs || false,
                    lastUsed: discovered?.lastUsed,
                    usageCount: discovered?.usageCount || 0
                };
            }
        }

        // Check discovered models
        return this.discoveredModels.get(modelId);
    }

    /**
     * Get the default model
     */
    getDefaultModel(): ModelInfo | undefined {
        const defaultId = this.config?.defaultModel || 'gpt-4o';
        return this.getModelById(defaultId) || this.getAvailableModels()[0];
    }

    /**
     * Enrich model list with historical usage from logs
     */
    enrichWithHistoricalModels(metrics: CopilotUsageMetrics): void {
        for (const [modelName, stats] of metrics.byModel) {
            // Normalize model name to ID format
            const modelId = this.normalizeModelId(modelName);
            
            // Check if already in config
            const existingConfig = this.config?.models.find(
                m => m.id === modelId || m.family === modelName || m.name.toLowerCase().includes(modelName.toLowerCase())
            );

            if (existingConfig) {
                // Update discovered info for config model
                this.discoveredModels.set(existingConfig.id, {
                    ...existingConfig,
                    source: 'config',
                    usedInLogs: true,
                    usageCount: stats.requests
                });
            } else {
                // Add as discovered model
                this.discoveredModels.set(modelId, {
                    id: modelId,
                    name: this.formatModelName(modelName),
                    vendor: 'copilot',
                    family: modelName,
                    description: `Discovered from logs (${stats.requests} requests)`,
                    tier: 'standard',
                    enabled: true,
                    source: 'discovered',
                    usedInLogs: true,
                    usageCount: stats.requests
                });
            }
        }

        this.outputChannel.appendLine(
            `[ModelConfig] Enriched with ${this.discoveredModels.size} models from logs`
        );
    }

    /**
     * Normalize a model name to ID format
     */
    private normalizeModelId(name: string): string {
        return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_.]/g, '');
    }

    /**
     * Format a model ID to display name
     */
    private formatModelName(id: string): string {
        return id
            .split(/[-_]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Select a model for use with vscode.lm API
     */
    async selectModel(modelId?: string): Promise<ModelSelectionResult> {
        const targetModel = modelId 
            ? this.getModelById(modelId) 
            : this.getDefaultModel();

        if (!targetModel) {
            return {
                success: false,
                error: `Model not found: ${modelId || 'default'}`
            };
        }

        try {
            // Try to get the model from VS Code LM API
            const models = await vscode.lm.selectChatModels({
                vendor: targetModel.vendor,
                family: targetModel.family
            });

            if (models.length > 0) {
                return {
                    success: true,
                    model: targetModel,
                    usedFallback: false
                };
            }

            // Model not available, try fallback
            this.outputChannel.appendLine(
                `[ModelConfig] Model ${targetModel.id} not available, trying fallback`
            );

            // Try default model as fallback
            const defaultModel = this.getDefaultModel();
            if (defaultModel && defaultModel.id !== targetModel.id) {
                const fallbackModels = await vscode.lm.selectChatModels({
                    vendor: defaultModel.vendor,
                    family: defaultModel.family
                });

                if (fallbackModels.length > 0) {
                    return {
                        success: true,
                        model: defaultModel,
                        usedFallback: true
                    };
                }
            }

            // Try gpt-4o as last resort
            const gpt4oModels = await vscode.lm.selectChatModels({
                vendor: 'copilot',
                family: 'gpt-4o'
            });

            if (gpt4oModels.length > 0) {
                return {
                    success: true,
                    model: this.getModelById('gpt-4o') || {
                        id: 'gpt-4o',
                        name: 'GPT-4o',
                        vendor: 'copilot',
                        family: 'gpt-4o',
                        description: 'Fallback model',
                        tier: 'standard',
                        enabled: true,
                        source: 'config'
                    },
                    usedFallback: true
                };
            }

            return {
                success: false,
                error: 'No LLM models available. Make sure GitHub Copilot is active.'
            };

        } catch (error) {
            return {
                success: false,
                error: `Error selecting model: ${error}`
            };
        }
    }

    /**
     * Reload configuration from file
     */
    reloadConfig(): void {
        this.loadConfig();
        this.outputChannel.appendLine('[ModelConfig] Configuration reloaded');
    }

    /**
     * Get models grouped by tier
     */
    getModelsByTier(): Map<string, ModelInfo[]> {
        const byTier = new Map<string, ModelInfo[]>();
        
        for (const model of this.getAvailableModels()) {
            const tier = model.tier;
            if (!byTier.has(tier)) {
                byTier.set(tier, []);
            }
            byTier.get(tier)!.push(model);
        }

        return byTier;
    }
}

/**
 * Get the singleton ModelConfigService instance
 */
export function getModelConfigService(
    extensionPath?: string, 
    outputChannel?: vscode.OutputChannel
): ModelConfigService {
    if (!instance) {
        const extPath = extensionPath || 
            vscode.extensions.getExtension('escrivivir-co.aleph-script')?.extensionPath ||
            __dirname;
        instance = new ModelConfigService(extPath, outputChannel);
    }
    return instance;
}

/**
 * Reset the singleton instance (for testing)
 */
export function resetModelConfigService(): void {
    instance = null;
}
