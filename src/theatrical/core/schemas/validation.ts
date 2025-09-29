/**
 * Validation Utilities for Theatrical System
 * Provides runtime JSON schema validation and TypeScript type checking
 * Sprint S09-001 - Artillero Beta Implementation
 */

import Ajv, { JSONSchemaType, ValidateFunction } from 'ajv';
// Note: ajv-formats would be added as dependency in package.json
// import addFormats from 'ajv-formats';
import { 
  ITheatricalAgent, 
  ICompany, 
  IPlay,
  ValidationResult,
  ValidationError,
  ValidationWarning
} from '../interfaces';

// JSON Schema imports (these would be loaded at runtime)
import * as agentSchema from '../schemas/agent.schema.json';
import * as companySchema from '../schemas/company.schema.json';
import * as playSchema from '../schemas/play.schema.json';

/**
 * Main validation class for theatrical system configurations
 * Integrates with Partnership Histórico standards (>90% accuracy)
 */
export class TheatricalValidator {
  private ajv: Ajv;
  private agentValidator: ValidateFunction;
  private companyValidator: ValidateFunction;
  private playValidator: ValidateFunction;

  constructor() {
    // Initialize AJV with formats support
    this.ajv = new Ajv({ 
      allErrors: true, 
      verbose: true,
      strict: false, // Allow for flexibility in VS Code environment
      removeAdditional: false // Preserve additional properties for extensibility
    });
    
    // Add format validation (date-time, uri, etc.)
    // addFormats(this.ajv); // Would be enabled when ajv-formats is available

    // Compile schemas for performance
    this.agentValidator = this.ajv.compile(agentSchema);
    this.companyValidator = this.ajv.compile(companySchema);
    this.playValidator = this.ajv.compile(playSchema);
  }

  /**
   * Validate agent configuration against schema
   * Partnership Histórico standard: >90% accuracy required
   */
  validateAgentConfig(config: any): ValidationResult {
    const isValid = this.agentValidator(config);
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!isValid && this.agentValidator.errors) {
      for (const error of this.agentValidator.errors) {
        const validationError: ValidationError = {
          field: error.instancePath || error.schemaPath,
          message: error.message || 'Unknown validation error',
          severity: this.determineSeverity(error)
        };
        
        if (validationError.severity === 'error') {
          errors.push(validationError);
        } else {
          warnings.push({
            field: validationError.field,
            message: validationError.message,
            recommendation: this.generateRecommendation(error)
          });
        }
      }
    }

    // Partnership Histórico validation
    const partnershipScore = this.validatePartnershipHistorico(config);
    if (partnershipScore < 90) {
      errors.push({
        field: 'metadata.partnership_historico.quality_standards',
        message: `Partnership Histórico standards not met: ${partnershipScore}% < 90% required`,
        severity: 'error'
      });
    }

    // VibeCoding integration validation
    this.validateVibeCodingIntegration(config, errors, warnings);

    const score = this.calculateValidationScore(errors, warnings, partnershipScore);

    return {
      isValid: errors.length === 0 && score >= 90,
      errors,
      warnings,
      score
    };
  }

  /**
   * Validate company configuration against schema
   */
  validateCompanyConfig(config: any): ValidationResult {
    const isValid = this.companyValidator(config);
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!isValid && this.companyValidator.errors) {
      for (const error of this.companyValidator.errors) {
        const validationError: ValidationError = {
          field: error.instancePath || error.schemaPath,
          message: error.message || 'Unknown validation error',
          severity: this.determineSeverity(error)
        };
        
        if (validationError.severity === 'error') {
          errors.push(validationError);
        } else {
          warnings.push({
            field: validationError.field,
            message: validationError.message,
            recommendation: this.generateRecommendation(error)
          });
        }
      }
    }

    // Company-specific validations
    this.validateCompanyStructure(config, errors, warnings);
    this.validateCompanyAuthority(config, errors, warnings);

    const score = this.calculateValidationScore(errors, warnings, 100);

    return {
      isValid: errors.length === 0 && score >= 90,
      errors,
      warnings,
      score
    };
  }

  /**
   * Validate play/workflow configuration against schema
   */
  validatePlayConfig(config: any): ValidationResult {
    const isValid = this.playValidator(config);
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!isValid && this.playValidator.errors) {
      for (const error of this.playValidator.errors) {
        const validationError: ValidationError = {
          field: error.instancePath || error.schemaPath,
          message: error.message || 'Unknown validation error',
          severity: this.determineSeverity(error)
        };
        
        if (validationError.severity === 'error') {
          errors.push(validationError);
        } else {
          warnings.push({
            field: validationError.field,
            message: validationError.message,
            recommendation: this.generateRecommendation(error)
          });
        }
      }
    }

    // Play-specific validations
    this.validatePlayStructure(config, errors, warnings);
    this.validateCastAssignments(config, errors, warnings);
    this.validateWorkflowLogic(config, errors, warnings);

    const score = this.calculateValidationScore(errors, warnings, 100);

    return {
      isValid: errors.length === 0 && score >= 90,
      errors,
      warnings,
      score
    };
  }

  /**
   * Validate a complete theatrical agent instance
   */
  validateAgent(agent: ITheatricalAgent): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Type-level validation
    if (!agent.id || typeof agent.id !== 'string') {
      errors.push({
        field: 'id',
        message: 'Agent ID is required and must be a string',
        severity: 'error'
      });
    }

    if (!agent.name || typeof agent.name !== 'string') {
      errors.push({
        field: 'name',
        message: 'Agent name is required and must be a string',
        severity: 'error'
      });
    }

    // Validate configuration consistency
    try {
      const configResult = agent.validateConfiguration();
      errors.push(...configResult.errors);
      warnings.push(...configResult.warnings);
    } catch (error) {
      errors.push({
        field: 'configuration',
        message: `Configuration validation failed: ${error instanceof Error ? error.message : String(error)}`,
        severity: 'error'
      });
    }

    // VibeCoding integration validation
    if (agent.vibeCodingIntegration) {
      this.validateVibeCodingIntegrationInstance(agent.vibeCodingIntegration, errors, warnings);
    }

    const score = this.calculateValidationScore(errors, warnings, 100);

    return {
      isValid: errors.length === 0 && score >= 90,
      errors,
      warnings,
      score
    };
  }

  /**
   * Validate Partnership Histórico compliance
   * Returns quality score (0-100)
   */
  private validatePartnershipHistorico(config: any): number {
    let score = 100;

    // Check for required Partnership Histórico metadata
    if (!config.metadata?.partnership_historico) {
      score -= 20;
    } else {
      const ph = config.metadata.partnership_historico;
      
      if (!ph.quality_standards || ph.quality_standards < 90) {
        score -= 15;
      }
      
      if (!ph.validation_date) {
        score -= 10;
      }
      
      if (!ph.validated_by) {
        score -= 10;
      }
    }

    // Check VibeCoding integration completeness
    if (!config.vibecoding || !config.vibeCodingIntegration) {
      score -= 15;
    }

    // Check capability completeness
    if (!config.capabilities) {
      score -= 10;
    }

    // Check documentation quality
    if (!config.content_source?.markdown_file) {
      score -= 10;
    }

    return Math.max(0, score);
  }

  /**
   * Validate VibeCoding integration requirements
   */
  private validateVibeCodingIntegration(config: any, errors: ValidationError[], warnings: ValidationWarning[]): void {
    if (!config.vibecoding) {
      errors.push({
        field: 'vibecoding',
        message: 'VibeCoding integration is required for theatrical agents',
        severity: 'error'
      });
      return;
    }

    const vibe = config.vibecoding;

    if (!vibe.sprint_role) {
      errors.push({
        field: 'vibecoding.sprint_role',
        message: 'Sprint role is required for VibeCoding integration',
        severity: 'error'
      });
    }

    if (!vibe.validation_level) {
      errors.push({
        field: 'vibecoding.validation_level',
        message: 'Validation level is required for VibeCoding integration',
        severity: 'error'
      });
    }

    if (typeof vibe.can_block_sprint !== 'boolean') {
      errors.push({
        field: 'vibecoding.can_block_sprint',
        message: 'Sprint blocking capability must be explicitly defined',
        severity: 'error'
      });
    }

    // Check quality gates
    if (!vibe.quality_gates || !Array.isArray(vibe.quality_gates)) {
      warnings.push({
        field: 'vibecoding.quality_gates',
        message: 'Quality gates not defined',
        recommendation: 'Define at least one quality gate for validation'
      });
    }
  }

  /**
   * Validate company structure and relationships
   */
  private validateCompanyStructure(config: any, errors: ValidationError[], warnings: ValidationWarning[]): void {
    // Validate agent assignments
    if (!config.agents || !Array.isArray(config.agents) || config.agents.length === 0) {
      errors.push({
        field: 'agents',
        message: 'Company must have at least one agent',
        severity: 'error'
      });
    }

    // Validate primary agent exists in agents list
    if (config.primaryAgent && config.agents && !config.agents.includes(config.primaryAgent)) {
      errors.push({
        field: 'primaryAgent',
        message: 'Primary agent must be included in agents list',
        severity: 'error'
      });
    }

    // Validate support agents exist in agents list
    if (config.supportAgents && config.agents) {
      for (const supportAgent of config.supportAgents) {
        if (!config.agents.includes(supportAgent)) {
          errors.push({
            field: 'supportAgents',
            message: `Support agent ${supportAgent} must be included in agents list`,
            severity: 'error'
          });
        }
      }
    }
  }

  /**
   * Validate company authority levels and permissions
   */
  private validateCompanyAuthority(config: any, errors: ValidationError[], warnings: ValidationWarning[]): void {
    if (!config.authority) {
      errors.push({
        field: 'authority',
        message: 'Company authority configuration is required',
        severity: 'error'
      });
      return;
    }

    const auth = config.authority;

    // Validate authority consistency
    if (auth.level === 'advisory' && auth.canBlockSprints) {
      warnings.push({
        field: 'authority.canBlockSprints',
        message: 'Advisory companies typically should not block sprints',
        recommendation: 'Consider changing authority level or sprint blocking capability'
      });
    }

    if (auth.level === 'autonomous' && auth.reportingStructure?.length > 0) {
      warnings.push({
        field: 'authority.reportingStructure',
        message: 'Autonomous companies typically do not have reporting structures',
        recommendation: 'Consider removing reporting structure or changing authority level'
      });
    }
  }

  /**
   * Validate play structure and workflow logic
   */
  private validatePlayStructure(config: any, errors: ValidationError[], warnings: ValidationWarning[]): void {
    if (!config.acts || !Array.isArray(config.acts) || config.acts.length === 0) {
      errors.push({
        field: 'acts',
        message: 'Play must have at least one act',
        severity: 'error'
      });
      return;
    }

    // Validate act ordering
    const actOrders = config.acts.map((act: any) => act.order).sort((a: number, b: number) => a - b);
    for (let i = 0; i < actOrders.length; i++) {
      if (actOrders[i] !== i + 1) {
        errors.push({
          field: 'acts',
          message: `Act ordering must be sequential starting from 1. Missing order ${i + 1}`,
          severity: 'error'
        });
        break;
      }
    }

    // Validate scenes within acts
    for (const act of config.acts) {
      if (!act.scenes || !Array.isArray(act.scenes) || act.scenes.length === 0) {
        errors.push({
          field: `acts[${act.order - 1}].scenes`,
          message: `Act "${act.name}" must have at least one scene`,
          severity: 'error'
        });
      }
    }
  }

  /**
   * Validate cast assignments and role consistency
   */
  private validateCastAssignments(config: any, errors: ValidationError[], warnings: ValidationWarning[]): void {
    if (!config.cast) {
      errors.push({
        field: 'cast',
        message: 'Play must have cast configuration',
        severity: 'error'
      });
      return;
    }

    const { roles, assignments } = config.cast;

    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      errors.push({
        field: 'cast.roles',
        message: 'Play must define at least one role',
        severity: 'error'
      });
      return;
    }

    if (!assignments || !Array.isArray(assignments)) {
      warnings.push({
        field: 'cast.assignments',
        message: 'No cast assignments defined',
        recommendation: 'Define agent assignments for roles'
      });
      return;
    }

    // Validate assignments reference valid roles
    const roleIds = new Set(roles.map((role: any) => role.id));
    for (const assignment of assignments) {
      if (!roleIds.has(assignment.roleId)) {
        errors.push({
          field: 'cast.assignments',
          message: `Assignment references unknown role: ${assignment.roleId}`,
          severity: 'error'
        });
      }
    }

    // Check for required roles without assignments
    const assignedRoles = new Set(assignments.map((assignment: any) => assignment.roleId));
    for (const role of roles) {
      if (role.importance === 'lead' && !assignedRoles.has(role.id)) {
        warnings.push({
          field: 'cast.assignments',
          message: `Lead role "${role.name}" has no assignment`,
          recommendation: 'Assign an agent to this critical role'
        });
      }
    }
  }

  /**
   * Validate workflow logic and transitions
   */
  private validateWorkflowLogic(config: any, errors: ValidationError[], warnings: ValidationWarning[]): void {
    // This would include validation of:
    // - Scene transitions
    // - Dependency cycles
    // - Resource availability
    // - Timeline consistency
    
    // For now, basic validation
    if (config.duration) {
      if (config.duration.minimum > config.duration.maximum) {
        errors.push({
          field: 'duration',
          message: 'Minimum duration cannot be greater than maximum duration',
          severity: 'error'
        });
      }

      if (config.duration.estimated < config.duration.minimum || 
          config.duration.estimated > config.duration.maximum) {
        warnings.push({
          field: 'duration.estimated',
          message: 'Estimated duration is outside min/max range',
          recommendation: 'Adjust estimated duration to be within the specified range'
        });
      }
    }
  }

  /**
   * Validate VibeCoding integration instance
   */
  private validateVibeCodingIntegrationInstance(integration: any, errors: ValidationError[], warnings: ValidationWarning[]): void {
    // Implementation depends on VibeCoding interface definition
    // This would validate the actual integration object
    
    if (!integration.sprintManager) {
      warnings.push({
        field: 'vibeCodingIntegration.sprintManager',
        message: 'Sprint manager not configured',
        recommendation: 'Configure sprint manager for VibeCoding integration'
      });
    }

    if (!integration.checkpointTracker) {
      warnings.push({
        field: 'vibeCodingIntegration.checkpointTracker',
        message: 'Checkpoint tracker not configured',
        recommendation: 'Configure checkpoint tracker for progress monitoring'
      });
    }
  }

  /**
   * Determine error severity based on validation context
   */
  private determineSeverity(error: any): 'error' | 'warning' | 'info' {
    // Critical fields that must be correct
    const criticalFields = [
      'agentId', 'id', 'name', 'category', 'vibecoding.sprint_role',
      'vibecoding.validation_level', 'capabilities', 'authority.level'
    ];

    if (criticalFields.some(field => error.instancePath?.includes(field) || error.schemaPath?.includes(field))) {
      return 'error';
    }

    // Required fields are warnings if missing but not critical
    if (error.keyword === 'required') {
      return 'warning';
    }

    // Type mismatches are usually errors
    if (error.keyword === 'type') {
      return 'error';
    }

    // Everything else is info
    return 'info';
  }

  /**
   * Generate helpful recommendations for validation errors
   */
  private generateRecommendation(error: any): string {
    switch (error.keyword) {
      case 'required':
        return `Add the required property: ${error.params?.missingProperty}`;
      case 'type':
        return `Change type to ${error.schema} (currently ${error.data?.constructor?.name || typeof error.data})`;
      case 'enum':
        return `Use one of the allowed values: ${error.schema?.join(', ')}`;
      case 'pattern':
        return `Value must match the pattern: ${error.schema}`;
      case 'minLength':
        return `Minimum length is ${error.schema} characters`;
      case 'maxLength':
        return `Maximum length is ${error.schema} characters`;
      default:
        return 'Check the schema documentation for valid values';
    }
  }

  /**
   * Calculate overall validation score
   */
  private calculateValidationScore(errors: ValidationError[], warnings: ValidationWarning[], baseScore: number): number {
    let score = baseScore;
    
    // Deduct points for errors (more severe)
    score -= errors.length * 10;
    
    // Deduct fewer points for warnings
    score -= warnings.length * 3;

    return Math.max(0, Math.min(100, score));
  }
}

/**
 * Singleton instance for global use
 */
export const theatricalValidator = new TheatricalValidator();

/**
 * Convenience functions for specific validations
 */
export const validateAgent = (config: any): ValidationResult => 
  theatricalValidator.validateAgentConfig(config);

export const validateCompany = (config: any): ValidationResult => 
  theatricalValidator.validateCompanyConfig(config);

export const validatePlay = (config: any): ValidationResult => 
  theatricalValidator.validatePlayConfig(config);

/**
 * Validation utilities for runtime checks
 */
export class ValidationUtils {
  /**
   * Check if a configuration meets Partnership Histórico standards
   */
  static meetsPartnershipHistoricoStandards(validationResult: ValidationResult): boolean {
    return validationResult.isValid && validationResult.score >= 90;
  }

  /**
   * Check if a configuration is VibeCoding compatible
   */
  static isVibeCodingCompatible(config: any): boolean {
    return !!(config.vibecoding && config.vibecoding.sprint_role && config.vibecoding.validation_level);
  }

  /**
   * Extract quality metrics from validation result
   */
  static extractQualityMetrics(validationResult: ValidationResult) {
    return {
      accuracy: validationResult.score,
      completeness: validationResult.errors.length === 0 ? 100 : Math.max(0, 100 - (validationResult.errors.length * 10)),
      errorCount: validationResult.errors.length,
      warningCount: validationResult.warnings.length,
      isPartnershipCompliant: ValidationUtils.meetsPartnershipHistoricoStandards(validationResult)
    };
  }

  /**
   * Generate validation summary report
   */
  static generateValidationReport(validationResult: ValidationResult): string {
    const metrics = ValidationUtils.extractQualityMetrics(validationResult);
    
    let report = `Validation Report\n`;
    report += `================\n`;
    report += `Overall Score: ${validationResult.score}/100\n`;
    report += `Status: ${validationResult.isValid ? '✅ VALID' : '❌ INVALID'}\n`;
    report += `Partnership Histórico: ${metrics.isPartnershipCompliant ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}\n`;
    report += `Errors: ${metrics.errorCount}\n`;
    report += `Warnings: ${metrics.warningCount}\n\n`;

    if (validationResult.errors.length > 0) {
      report += `Errors:\n`;
      for (const error of validationResult.errors) {
        report += `  ❌ ${error.field}: ${error.message}\n`;
      }
      report += `\n`;
    }

    if (validationResult.warnings.length > 0) {
      report += `Warnings:\n`;
      for (const warning of validationResult.warnings) {
        report += `  ⚠️  ${warning.field}: ${warning.message}\n`;
        if (warning.recommendation) {
          report += `     💡 ${warning.recommendation}\n`;
        }
      }
    }

    return report;
  }
}