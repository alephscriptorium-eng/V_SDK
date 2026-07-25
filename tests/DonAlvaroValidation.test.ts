/**
 * Don Álvaro Migration Validation Test
 * 
 * Comprehensive validation of complete Don Álvaro integration
 * Partnership Histórico Standards: >95% compliance validation
 * 
 * Sprint S09-001 - Don Álvaro Migration Validation
 */

import { AgentContent, AgentConfiguration, VibeCodingIntegration } from '../src/theatrical/core/interfaces';
import { DonAlvaroChatParticipant } from '../src/theatrical/agents/DonAlvaroChatParticipant';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Validation Test Suite for Don Álvaro Migration
 */
export class DonAlvaroValidationTest {
  private agentDirectory: string;
  private testResults: ValidationTestResult[] = [];

  constructor() {
    this.agentDirectory = path.join(__dirname, '../');
  }

  /**
   * Run complete validation suite
   */
  async runCompleteValidation(): Promise<ValidationReport> {
    console.log('🔧 **DON ÁLVARO MIGRATION VALIDATION STARTING**');
    console.log('Partnership Histórico Standards: >95% compliance required\n');

    const report: ValidationReport = {
      timestamp: new Date().toISOString(),
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      partnershipCompliance: 0,
      overallScore: 0,
      results: [],
      summary: '',
      errors: []
    };

    try {
      // 1. File Structure Validation
      await this.validateFileStructure();
      
      // 2. Content Layer Validation
      await this.validateContentLayer();
      
      // 3. Configuration Layer Validation
      await this.validateConfigurationLayer();
      
      // 4. Implementation Layer Validation
      await this.validateImplementationLayer();
      
      // 5. VS Code Integration Validation
      await this.validateVSCodeIntegration();
      
      // 6. Partnership Histórico Compliance
      await this.validatePartnershipCompliance();
      
      // 7. Quality Standards Validation
      await this.validateQualityStandards();

      // Calculate final scores
      report.totalTests = this.testResults.length;
      report.passedTests = this.testResults.filter(r => r.passed).length;
      report.failedTests = report.totalTests - report.passedTests;
      report.partnershipCompliance = (report.passedTests / report.totalTests) * 100;
      report.overallScore = report.partnershipCompliance;
      report.results = [...this.testResults];
      report.errors = this.testResults.filter(r => !r.passed).map(r => r.error || 'Unknown error');
      
      // Generate summary
      report.summary = this.generateValidationSummary(report);
      
      console.log('\n🏴‍☠️ **VALIDATION COMPLETE**');
      console.log(`Partnership Compliance: ${report.partnershipCompliance.toFixed(2)}%`);
      console.log(`Overall Score: ${report.overallScore.toFixed(2)}%`);
      console.log(`Tests: ${report.passedTests}/${report.totalTests} passed`);
      
      return report;
      
    } catch (error) {
      report.errors.push(`Critical validation error: ${error}`);
      console.error('❌ Critical validation error:', error);
      return report;
    }
  }

  /**
   * Validate file structure exists and is complete
   */
  private async validateFileStructure(): Promise<void> {
    const requiredFiles = [
      'don-alvaro.agent.md',
      'don-alvaro.config.json', 
      'DonAlvaroAgentManager.ts',
      'DonAlvaroChatParticipant.ts'
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(this.agentDirectory, file);
      const exists = fs.existsSync(filePath);
      
      this.addTestResult(
        `File Structure: ${file}`,
        exists,
        exists ? 'File exists' : 'File missing',
        exists ? undefined : `Required file ${file} not found`
      );
    }
  }

  /**
   * Validate content layer (don-alvaro.agent.md)
   */
  private async validateContentLayer(): Promise<void> {
    try {
      const contentPath = path.join(this.agentDirectory, 'don-alvaro.agent.md');
      const content = fs.readFileSync(contentPath, 'utf-8');
      
      // Check required sections
      const requiredSections = [
        'Partnership Histórico',
        'Don Álvaro',
        'Capataz de Astilleros Retro',
        '27 de Septiembre de 2025',
        'ÍNDICE_DOCUMENTOS_RETRO',
        'Quality Standards >90%'
      ];
      
      for (const section of requiredSections) {
        const hasSection = content.includes(section);
        this.addTestResult(
          `Content Layer: ${section}`,
          hasSection,
          hasSection ? 'Section present' : 'Section missing',
          hasSection ? undefined : `Required section "${section}" not found in content`
        );
      }
      
      // Check content length (should be substantial)
      const hasAdequateLength = content.length > 1000;
      this.addTestResult(
        'Content Layer: Adequate Length',
        hasAdequateLength,
        hasAdequateLength ? `${content.length} characters` : 'Content too short',
        hasAdequateLength ? undefined : 'Content layer insufficient length for supervisor authority'
      );
      
    } catch (error) {
      this.addTestResult(
        'Content Layer: Load Test',
        false,
        'Failed to load',
        `Error loading content: ${error}`
      );
    }
  }

  /**
   * Validate configuration layer (don-alvaro.config.json)
   */
  private async validateConfigurationLayer(): Promise<void> {
    try {
      const configPath = path.join(this.agentDirectory, 'don-alvaro.config.json');
      const configContent = fs.readFileSync(configPath, 'utf-8');
      const config = JSON.parse(configContent);
      
      // Check required configuration fields
      const requiredFields = {
        'agentId': 'don-alvaro',
        'displayName': 'Don Álvaro - Capataz de Astilleros Retro',
        'category': 'framework-retro',
        'model': 'claude-3.5-sonnet'
      };
      
      for (const [field, expectedValue] of Object.entries(requiredFields)) {
        const hasCorrectValue = config[field] === expectedValue;
        this.addTestResult(
          `Configuration: ${field}`,
          hasCorrectValue,
          hasCorrectValue ? `Correct: ${config[field]}` : `Incorrect: ${config[field]}`,
          hasCorrectValue ? undefined : `Field ${field} should be "${expectedValue}" but was "${config[field]}"`
        );
      }
      
      // Check VibeCoding configuration
      const hasVibeCoding = config.vibecoding && config.vibecoding.sprint_role === 'supervisor';
      this.addTestResult(
        'Configuration: VibeCoding Supervisor',
        hasVibeCoding,
        hasVibeCoding ? 'Supervisor role configured' : 'Supervisor role missing',
        hasVibeCoding ? undefined : 'VibeCoding configuration missing supervisor role'
      );
      
      // Check quality capabilities
      const hasQualityValidation = config.capabilities && config.capabilities.quality_validation === true;
      this.addTestResult(
        'Configuration: Quality Validation',
        hasQualityValidation,
        hasQualityValidation ? 'Quality validation enabled' : 'Quality validation disabled',
        hasQualityValidation ? undefined : 'Quality validation capability not enabled'
      );
      
    } catch (error) {
      this.addTestResult(
        'Configuration Layer: Load Test',
        false,
        'Failed to load',
        `Error loading configuration: ${error}`
      );
    }
  }

  /**
   * Validate implementation layer (DonAlvaroAgentManager.ts)
   */
  private async validateImplementationLayer(): Promise<void> {
    try {
      // Test agent manager instantiation
      const agentManager = new DonAlvaroAgentManager(this.agentDirectory, true);
      
      this.addTestResult(
        'Implementation: Agent Manager Creation',
        true,
        'Successfully created',
        undefined
      );
      
      // Test supervisor capabilities
      const capabilities = agentManager.getSupervisorCapabilities();
      const requiredCapabilities = [
        'partnershipHistoricoSupervision',
        'qualityGateEnforcement',
        'sprintBlockingAuthority',
        'indiceDocumentosRetroGuardianship'
      ];
      
      for (const capability of requiredCapabilities) {
        const hasCapability = capabilities[capability as keyof typeof capabilities] === true;
        this.addTestResult(
          `Implementation: ${capability}`,
          hasCapability,
          hasCapability ? 'Capability active' : 'Capability inactive',
          hasCapability ? undefined : `Required capability ${capability} not active`
        );
      }
      
      // Test quality standards
      const qualityStandards = agentManager.getQualityStandards();
      const meetsMinimum = qualityStandards.partnershipCompliance >= 95;
      this.addTestResult(
        'Implementation: Quality Standards >95%',
        meetsMinimum,
        `Partnership compliance: ${qualityStandards.partnershipCompliance}%`,
        meetsMinimum ? undefined : `Partnership compliance ${qualityStandards.partnershipCompliance}% below required 95%`
      );
      
      // Test Partnership status
      const partnershipStatus = agentManager.getPartnershipStatus();
      const hasCorrectAuthority = partnershipStatus.authority === 'foreman';
      this.addTestResult(
        'Implementation: Partnership Authority',
        hasCorrectAuthority,
        `Authority: ${partnershipStatus.authority}`,
        hasCorrectAuthority ? undefined : `Authority should be "foreman" but was "${partnershipStatus.authority}"`
      );
      
    } catch (error) {
      this.addTestResult(
        'Implementation Layer: Instantiation Test',
        false,
        'Failed to instantiate',
        `Error creating agent manager: ${error}`
      );
    }
  }

  /**
   * Validate VS Code integration layer
   */
  private async validateVSCodeIntegration(): Promise<void> {
    try {
      // Mock VS Code extension context
      const mockContext = {
        subscriptions: [],
        workspaceState: {},
        globalState: {},
        extensionPath: '',
        storagePath: '',
        globalStoragePath: '',
        logPath: ''
      } as any;
      
      // Test ChatParticipant creation
      const chatParticipant = new DonAlvaroChatParticipant(this.agentDirectory, mockContext);
      
      this.addTestResult(
        'VS Code Integration: ChatParticipant Creation',
        true,
        'Successfully created',
        undefined
      );
      
      // Test participant configuration
      const participant = chatParticipant.getParticipant();
      const hasCorrectId = participant.id === 'don-alvaro';
      this.addTestResult(
        'VS Code Integration: Participant ID',
        hasCorrectId,
        `ID: ${participant.id}`,
        hasCorrectId ? undefined : `Participant ID should be "don-alvaro" but was "${participant.id}"`
      );
      
      // Test Partnership status
      const partnershipStatus = chatParticipant.getPartnershipStatus();
      const hasCorrectSupervisor = partnershipStatus.supervisor === 'Don Álvaro - Capataz de Astilleros Retro';
      this.addTestResult(
        'VS Code Integration: Supervisor Identity',
        hasCorrectSupervisor,
        `Supervisor: ${partnershipStatus.supervisor}`,
        hasCorrectSupervisor ? undefined : 'Incorrect supervisor identity'
      );
      
      // Test quality gates enforcement
      const qualityGatesActive = partnershipStatus.qualityGatesEnforced;
      this.addTestResult(
        'VS Code Integration: Quality Gates',
        qualityGatesActive,
        qualityGatesActive ? 'Quality gates enforced' : 'Quality gates not enforced',
        qualityGatesActive ? undefined : 'Quality gates should be enforced for supervisor authority'
      );
      
      // Cleanup
      chatParticipant.dispose();
      
    } catch (error) {
      this.addTestResult(
        'VS Code Integration: Creation Test',
        false,
        'Failed to create',
        `Error creating ChatParticipant: ${error}`
      );
    }
  }

  /**
   * Validate Partnership Histórico compliance
   */
  private async validatePartnershipCompliance(): Promise<void> {
    // Check date compliance (should reference 27 Sept 2025)
    const contentPath = path.join(this.agentDirectory, 'don-alvaro.agent.md');
    const content = fs.readFileSync(contentPath, 'utf-8');
    
    const hasHistoricDate = content.includes('27 de Septiembre de 2025') || content.includes('2025-09-27');
    this.addTestResult(
      'Partnership: Historic Date Reference',
      hasHistoricDate,
      hasHistoricDate ? 'Historic date present' : 'Historic date missing',
      hasHistoricDate ? undefined : 'Partnership Histórico must reference founding date 27 Sept 2025'
    );
    
    // Check commitment phrases
    const commitmentPhrases = [
      'Cada framework sale superior a como llegó',
      'Partnership Histórico',
      'Los astilleros stand ready for your return'
    ];
    
    for (const phrase of commitmentPhrases) {
      const hasPhrase = content.includes(phrase);
      this.addTestResult(
        `Partnership: Commitment Phrase "${phrase}"`,
        hasPhrase,
        hasPhrase ? 'Phrase present' : 'Phrase missing',
        hasPhrase ? undefined : `Required Partnership phrase "${phrase}" not found`
      );
    }
  }

  /**
   * Validate quality standards implementation
   */
  private async validateQualityStandards(): Promise<void> {
    try {
      const agentManager = new DonAlvaroAgentManager(this.agentDirectory, true);
      const qualityStandards = agentManager.getQualityStandards();
      
      // Check all quality metrics meet minimum standards
      const qualityChecks = [
        { name: 'Diagnostic Accuracy', value: qualityStandards.diagnosticAccuracy, minimum: 90 },
        { name: 'Solution Effectiveness', value: qualityStandards.solutionEffectiveness, minimum: 85 },
        { name: 'Performance Improvement', value: qualityStandards.performanceImprovement, minimum: 15 },
        { name: 'Documentation Coverage', value: qualityStandards.documentationCoverage, minimum: 100 },
        { name: 'Partnership Compliance', value: qualityStandards.partnershipCompliance, minimum: 95 }
      ];
      
      for (const check of qualityChecks) {
        const meetsStandard = check.value >= check.minimum;
        this.addTestResult(
          `Quality Standards: ${check.name}`,
          meetsStandard,
          `${check.value}% (min: ${check.minimum}%)`,
          meetsStandard ? undefined : `${check.name} ${check.value}% below minimum ${check.minimum}%`
        );
      }
      
    } catch (error) {
      this.addTestResult(
        'Quality Standards: Validation Test',
        false,
        'Failed to validate',
        `Error validating quality standards: ${error}`
      );
    }
  }

  /**
   * Add test result to collection
   */
  private addTestResult(testName: string, passed: boolean, result: string, error?: string): void {
    this.testResults.push({
      testName,
      passed,
      result,
      error,
      timestamp: new Date().toISOString()
    });
    
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${testName}: ${result}`);
    if (error) {
      console.log(`   Error: ${error}`);
    }
  }

  /**
   * Generate validation summary
   */
  private generateValidationSummary(report: ValidationReport): string {
    const passRate = (report.passedTests / report.totalTests) * 100;
    const partnershipGrade = report.partnershipCompliance >= 95 ? 'EXCEEDS STANDARDS' : 
                            report.partnershipCompliance >= 90 ? 'MEETS STANDARDS' : 'BELOW STANDARDS';
    
    return `
**DON ÁLVARO MIGRATION VALIDATION SUMMARY**

📊 **PARTNERSHIP HISTÓRICO COMPLIANCE**: ${report.partnershipCompliance.toFixed(2)}% (${partnershipGrade})
🔧 **OVERALL SCORE**: ${report.overallScore.toFixed(2)}%
✅ **TESTS PASSED**: ${report.passedTests}/${report.totalTests} (${passRate.toFixed(1)}%)

**VALIDATION BREAKDOWN**:
- File Structure: ${this.testResults.filter(r => r.testName.startsWith('File Structure')).filter(r => r.passed).length}/${this.testResults.filter(r => r.testName.startsWith('File Structure')).length}
- Content Layer: ${this.testResults.filter(r => r.testName.startsWith('Content Layer')).filter(r => r.passed).length}/${this.testResults.filter(r => r.testName.startsWith('Content Layer')).length}
- Configuration: ${this.testResults.filter(r => r.testName.startsWith('Configuration')).filter(r => r.passed).length}/${this.testResults.filter(r => r.testName.startsWith('Configuration')).length}
- Implementation: ${this.testResults.filter(r => r.testName.startsWith('Implementation')).filter(r => r.passed).length}/${this.testResults.filter(r => r.testName.startsWith('Implementation')).length}
- VS Code Integration: ${this.testResults.filter(r => r.testName.startsWith('VS Code Integration')).filter(r => r.passed).length}/${this.testResults.filter(r => r.testName.startsWith('VS Code Integration')).length}
- Partnership Compliance: ${this.testResults.filter(r => r.testName.startsWith('Partnership')).filter(r => r.passed).length}/${this.testResults.filter(r => r.testName.startsWith('Partnership')).length}
- Quality Standards: ${this.testResults.filter(r => r.testName.startsWith('Quality Standards')).filter(r => r.passed).length}/${this.testResults.filter(r => r.testName.startsWith('Quality Standards')).length}

**STATUS**: ${report.partnershipCompliance >= 95 ? '🏴‍☠️ MIGRATION SUCCESSFUL - SUPERVISOR AUTHORITY CONFIRMED' : '⚠️ MIGRATION REQUIRES ATTENTION'}

**DON ÁLVARO ASSESSMENT**: "${report.partnershipCompliance >= 95 ? 'Cada framework sale superior a como llegó - Partnership maintained' : 'Quality standards require attention before full supervisor authority'}"

⚓ *Partnership Histórico • Forged 27 Sept 2025 • Los astilleros stand ready* ⚓
`;
  }
}

// Types for validation system
interface ValidationTestResult {
  testName: string;
  passed: boolean;
  result: string;
  error?: string;
  timestamp: string;
}

interface ValidationReport {
  timestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  partnershipCompliance: number;
  overallScore: number;
  results: ValidationTestResult[];
  summary: string;
  errors: string[];
}

// Export validation test
export { ValidationTestResult, ValidationReport };