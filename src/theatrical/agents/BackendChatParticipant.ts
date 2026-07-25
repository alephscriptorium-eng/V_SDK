/**
 * Backend Agent VS Code Chat Participant
 * Provides VS Code Chat integration for Backend Agent technical authority
 * Sprint S09-001 - Backend Technical Specialist Integration
 */

import * as vscode from 'vscode';
import { BackendAgentManager } from './BackendAgentManager';
import * as path from 'path';
import * as fs from 'fs';

/**
 * VS Code Chat Participant for Backend Agent
 * Integrates backend technical authority with VS Code Chat interface
 */
export class BackendChatParticipant {
  private backendAgent: BackendAgentManager | null = null;
  private readonly agentDirectory: string;

  constructor(context: vscode.ExtensionContext) {
    // Determine agent directory from extension path
    this.agentDirectory = path.join(context.extensionPath, 'src', 'theatrical', 'agents');
    this.initializeBackendAgent();
  }

  /**
   * Initialize Backend Agent Manager
   */
  private async initializeBackendAgent(): Promise<void> {
    try {
      this.backendAgent = await BackendAgentManager.load(this.agentDirectory, false);
      console.log('Backend Agent initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Backend Agent:', error);
      // Continue without backend agent - graceful degradation
    }
  }

  /**
   * Handle VS Code Chat participant requests
   */
  async handleChatRequest(
    request: vscode.ChatRequest,
    context: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
  ): Promise<void> {
    try {
      // Backend Agent greeting and command detection
      if (this.isBackendGreeting(request.prompt)) {
        await this.sendBackendGreeting(stream);
        return;
      }

      // Backend technical commands
      if (this.isBackendTechnicalCommand(request.prompt)) {
        await this.handleBackendTechnicalCommand(request, stream);
        return;
      }

      // Express.js expertise queries
      if (this.isExpressJSExpertiseQuery(request.prompt)) {
        await this.handleExpressJSExpertise(request, stream);
        return;
      }

      // Zeus backend integration queries
      if (this.isZeusBackendQuery(request.prompt)) {
        await this.handleZeusBackendIntegration(request, stream);
        return;
      }

      // General backend development assistance
      await this.handleGeneralBackendRequest(request, stream);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      stream.markdown(`🔧 **Backend Technical Error**

Sorry, I encountered an error processing your backend request: ${errorMessage}

**Recovery Suggestions:**
- Try rephrasing your backend-related query
- Use specific Express.js, middleware, or API design terminology
- Check if you need technical authority consultation

Type \`/backend-audit\` for comprehensive backend analysis or contact Integration Director Indra for architectural coordination.`);
    }
  }

  /**
   * Check if input is backend greeting
   */
  private isBackendGreeting(prompt: string): boolean {
    const greetingPatterns = [
      'backend agent',
      'backend specialist',
      'technical authority backend',
      'express expert',
      'middleware specialist'
    ];
    return greetingPatterns.some(pattern => prompt.toLowerCase().includes(pattern));
  }

  /**
   * Check if input is backend technical command
   */
  private isBackendTechnicalCommand(prompt: string): boolean {
    const technicalCommands = [
      '/backend-audit',
      '/middleware-design',
      '/api-optimization',
      '/security-review',
      '/performance-analysis',
      'technical authority',
      'backend architecture'
    ];
    return technicalCommands.some(cmd => prompt.toLowerCase().includes(cmd));
  }

  /**
   * Check if input is Express.js expertise query
   */
  private isExpressJSExpertiseQuery(prompt: string): boolean {
    const expressKeywords = [
      'express.js',
      'express js',
      'middleware',
      'routing',
      'api design',
      'server optimization',
      'node.js performance'
    ];
    return expressKeywords.some(keyword => prompt.toLowerCase().includes(keyword));
  }

  /**
   * Check if input is Zeus backend integration query
   */
  private isZeusBackendQuery(prompt: string): boolean {
    const zeusKeywords = [
      'zeus backend',
      'mcp integration',
      'hyperaxe server',
      'configuration backend',
      'agent communication',
      'zeus architecture'
    ];
    return zeusKeywords.some(keyword => prompt.toLowerCase().includes(keyword));
  }

  /**
   * Send Backend Agent greeting
   */
  private async sendBackendGreeting(stream: vscode.ChatResponseStream): Promise<void> {
    stream.markdown(`🔧 **Backend Agent - Technical Authority**

Greetings! I'm the **Backend Agent**, your specialized technical authority for Express.js architecture, server routing, and middleware development.

**My Technical Expertise:**
- 🏗️ **Express.js Architecture**: Scalable application design and performance optimization
- 🔧 **Middleware Engineering**: Custom middleware development and pipeline optimization  
- 🛠️ **API Development**: RESTful and GraphQL API design with versioning strategies
- 🔒 **Security Implementation**: Authentication, authorization, and vulnerability assessment
- ⚡ **Performance Optimization**: Response time optimization and scalability planning

**Specialized Commands:**
- \`/backend-audit\` - Comprehensive backend architecture analysis
- \`/middleware-design\` - Custom middleware development guidance
- \`/api-optimization\` - API performance and optimization strategies
- \`/security-review\` - Backend security audit and implementation
- \`/performance-analysis\` - Performance bottleneck identification and optimization

**Technical Authority:**
- Partnership Authority: 88% (Technical Specialist Level)
- Sprint Blocking Capability: Enabled for quality assurance
- Autonomous Decisions: Architecture patterns, middleware design, performance standards
- Zeus Integration: Complete MCP ecosystem backend support

Ready to architect exceptional backend solutions with technical excellence and theatrical precision! How can I assist with your backend development needs?`);
  }

  /**
   * Handle backend technical commands
   */
  private async handleBackendTechnicalCommand(
    request: vscode.ChatRequest,
    stream: vscode.ChatResponseStream
  ): Promise<void> {
    if (this.backendAgent) {
      try {
        const response = await this.backendAgent.handleRequest(request.prompt);
        stream.markdown(response.content);
      } catch (error) {
        stream.markdown(`🔧 **Backend Technical Authority Processing Error**

Unable to process technical command through Backend Agent.

**Manual Technical Guidance:**
${this.getManualBackendGuidance(request.prompt)}`);
      }
    } else {
      stream.markdown(`🔧 **Backend Technical Authority**

**Request Analysis:** ${request.prompt}

${this.getManualBackendGuidance(request.prompt)}

**Quality Standards:**
- >90% test coverage mandatory for all backend implementations
- Security-by-design approach required
- Performance targets: <200ms response time
- Comprehensive documentation required

**Technical Authority Active:**
All backend decisions implemented with technical specialist authority and Zeus ecosystem compatibility.`);
    }
  }

  /**
   * Handle Express.js expertise queries
   */
  private async handleExpressJSExpertise(
    request: vscode.ChatRequest,
    stream: vscode.ChatResponseStream
  ): Promise<void> {
    stream.markdown(`🔧 **Express.js Technical Expertise**

**Query:** ${request.prompt}

**Express.js Framework Mastery:**

**🏗️ Architecture Design:**
- Scalable Express.js application patterns and structure
- Modular routing systems with controller separation
- Middleware pipeline optimization and organization
- Environment-specific configuration management

**⚡ Performance Optimization:**
- Memory management and garbage collection tuning
- Response time optimization techniques
- Caching strategies (Redis, in-memory, HTTP caching)
- Load balancing and clustering for scalability

**🔧 Middleware Engineering:**
- Custom middleware development for specific requirements
- Authentication and authorization middleware (JWT, OAuth, sessions)
- Error handling and logging middleware implementation
- Request validation and sanitization middleware

**🛠️ API Development:**
- RESTful API design following best practices
- GraphQL integration and schema optimization
- API versioning strategies and backward compatibility
- OpenAPI/Swagger documentation generation

**🔒 Security Implementation:**
- Input validation and sanitization
- SQL injection and XSS protection
- Rate limiting and DDoS protection
- HTTPS configuration and certificate management

**Zeus Ecosystem Integration:**
- HyperAxe server-side rendering optimization
- MCP protocol routing and integration
- Configuration-driven backend patterns
- Agent communication infrastructure

Need specific guidance on any Express.js aspect? I can provide detailed implementation strategies!`);
  }

  /**
   * Handle Zeus backend integration queries
   */
  private async handleZeusBackendIntegration(
    request: vscode.ChatRequest,
    stream: vscode.ChatResponseStream
  ): Promise<void> {
    stream.markdown(`🔧 **Zeus Backend Integration Expertise**

**Integration Query:** ${request.prompt}

**Zeus Ecosystem Backend Support:**

**🔗 MCP Integration:**
- Model Context Protocol routing and optimization
- Tool and resource management for MCP servers
- Protocol-compliant request/response handling
- Error handling and fallback strategies for MCP communication

**🌐 Multi-Service Architecture:**
- Microservices communication patterns
- Service discovery and health checking
- Load balancing between Zeus components
- Circuit breaker patterns for resilience

**📊 Configuration Management:**
- Backend support for zeus configuration system
- Dynamic configuration reloading
- Environment-specific backend settings
- Feature flag implementation at server level

**🎭 Theatrical Integration:**
- Backend infrastructure for agent communication
- Agent state management and persistence
- Inter-agent message routing
- Performance monitoring for agent operations

**Zeus-Specific Implementation:**

**Port 3012 Server Optimization:**
- Express.js configuration for Zeus port
- HyperAxe template server-side rendering
- Static asset serving optimization
- WebSocket support for real-time features

**MCP Protocol Backend:**
- JSON-RPC protocol implementation
- Tool execution backend processing
- Resource streaming and management
- Authentication and authorization for MCP

**Performance Standards:**
- Partnership Histórico compliance: 88%
- Zeus architecture compatibility: 100%
- Response time targets: <200ms for all endpoints
- Comprehensive monitoring and telemetry

Ready to implement comprehensive backend support for your Zeus MCP ecosystem needs!`);
  }

  /**
   * Handle general backend development requests
   */
  private async handleGeneralBackendRequest(
    request: vscode.ChatRequest,
    stream: vscode.ChatResponseStream
  ): Promise<void> {
    if (this.backendAgent) {
      try {
        const response = await this.backendAgent.handleRequest(request.prompt);
        stream.markdown(response.content);
      } catch (error) {
        stream.markdown(this.getGeneralBackendResponse(request.prompt));
      }
    } else {
      stream.markdown(this.getGeneralBackendResponse(request.prompt));
    }
  }

  /**
   * Get manual backend guidance based on input
   */
  private getManualBackendGuidance(input: string): string {
    if (input.includes('/backend-audit') || input.includes('audit')) {
      return `**Backend Architecture Audit:**
- Analyze codebase structure and organization
- Identify performance bottlenecks and optimization opportunities
- Review security vulnerabilities and implementation gaps
- Assess architectural patterns and design consistency
- Evaluate test coverage and code quality metrics`;
    }
    
    if (input.includes('/middleware-design') || input.includes('middleware')) {
      return `**Custom Middleware Development:**
- Authentication and authorization middleware design
- Request validation and sanitization middleware
- Error handling and logging middleware implementation
- Performance monitoring and metrics collection
- Cross-cutting concerns implementation (CORS, compression, rate limiting)`;
    }
    
    if (input.includes('/api-optimization') || input.includes('optimization')) {
      return `**API Performance Optimization:**
- Endpoint response time analysis and improvement
- Database query optimization and indexing
- Caching strategy implementation (Redis, memory, HTTP)
- Payload compression and response optimization
- Load testing and performance monitoring setup`;
    }
    
    if (input.includes('/security-review') || input.includes('security')) {
      return `**Security Implementation Review:**
- Authentication and authorization system audit
- Input validation and sanitization verification
- SQL injection and XSS protection assessment
- API rate limiting and DDoS protection
- HTTPS configuration and certificate management`;
    }
    
    if (input.includes('/performance-analysis') || input.includes('performance')) {
      return `**Performance Analysis Protocol:**
- Memory usage profiling and optimization
- Response time measurement and bottleneck identification
- Database query performance analysis
- CPU usage optimization and resource management
- Scalability testing and capacity planning`;
    }
    
    return `**Backend Technical Analysis:**
- Architecture-first design approach with scalability consideration
- Performance optimization and security implementation
- Express.js best practices and pattern application
- Comprehensive testing and documentation requirements`;
  }

  /**
   * Get general backend response
   */
  private getGeneralBackendResponse(prompt: string): string {
    return `🔧 **Backend Technical Analysis**

**Request:** ${prompt}

**Technical Approach:**
- Architecture-first design with scalability consideration
- Performance optimization and security implementation
- Express.js best practices and patterns application
- Comprehensive testing and documentation requirements

**Implementation Standards:**
- Response time target: <200ms
- Test coverage minimum: 90%
- Security-by-design mandatory
- Documentation-driven development

**Quality Assurance:**
All backend implementations validated against Partnership Histórico standards (88% compliance) and Zeus ecosystem requirements.

**Available Commands:**
- \`/backend-audit\` - Comprehensive architecture analysis
- \`/middleware-design\` - Custom middleware development
- \`/api-optimization\` - Performance optimization strategies
- \`/security-review\` - Security implementation audit
- \`/performance-analysis\` - Performance bottleneck identification

Ready to implement robust backend solutions with technical excellence and architectural precision!`;
  }
}

export default BackendChatParticipant;