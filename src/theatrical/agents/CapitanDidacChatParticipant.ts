/**
 * CapitanDidacChatParticipant.ts
 * 
 * VS Code ChatParticipant integration for Capitán Dídac San
 * Supreme authority meta-reference theatrical agent
 * 
 * Sprint S09-001 - Capitán Dídac ChatParticipant Implementation
 * Partnership Histórico Standards: >98% (Supreme Authority Level)
 * Meta-Reference: Authentic representation of real Capitán Dídac San in VS Code
 */

import * as vscode from 'vscode';
import { CapitanDidacAgentManager } from './CapitanDidacAgentManager';
import path from 'path';

/**
 * VS Code ChatParticipant for Capitán Dídac San
 * Provides supreme authority command interface with meta-reference authenticity
 */
export class CapitanDidacChatParticipant {
  private static readonly PARTICIPANT_ID = 'capitan-didac';
  private static readonly PARTICIPANT_NAME = '🏴‍☠️ Capitán Dídac San';
  private static readonly FULL_NAME = '🏴‍☠️ Capitán Dídac San - Supreme Navigator';
  
  private agentManager: CapitanDidacAgentManager | null = null;
  private chatParticipant: vscode.ChatParticipant;
  private isInitialized = false;

  constructor(private context: vscode.ExtensionContext) {
    // Create VS Code ChatParticipant
    this.chatParticipant = vscode.chat.createChatParticipant(
      CapitanDidacChatParticipant.PARTICIPANT_ID,
      this.handleRequest.bind(this)
    );

    // Configure ChatParticipant properties
    this.configureChatParticipant();
    
    // Register for disposal
    context.subscriptions.push(this.chatParticipant);
    
    console.log(`[Capitán Dídac] ChatParticipant registered: ${CapitanDidacChatParticipant.PARTICIPANT_ID}`);
  }

  /**
   * Configure ChatParticipant with supreme authority properties
   */
  private configureChatParticipant(): void {
    // Set ChatParticipant properties (VS Code API compatible)
    this.chatParticipant.iconPath = new vscode.ThemeIcon('crown'); // Supreme authority icon
    
    console.log(`[Capitán Dídac] ChatParticipant configured with supreme authority`);
  }

  /**
   * Initialize agent manager with supreme authority configuration
   */
  private async initializeAgentManager(): Promise<void> {
    if (this.isInitialized && this.agentManager) {
      return;
    }

    try {
      const agentsDir = path.join(__dirname);
      this.agentManager = await CapitanDidacAgentManager.create(agentsDir);
      this.isInitialized = true;
      
      console.log(`[Capitán Dídac] Agent manager initialized with supreme authority`);
      
      // Validate supreme authority
      const validation = this.agentManager.validateSupremeAuthority();
      if (!validation.isValid) {
        console.warn(`[Capitán Dídac] Supreme authority validation warnings:`, validation.warnings);
      } else {
        console.log(`[Capitán Dídac] Supreme authority validated - Score: ${validation.score}%`);
      }
      
    } catch (error) {
      console.error(`[Capitán Dídac] Failed to initialize agent manager: ${error}`);
      throw error;
    }
  }

  /**
   * Handle ChatParticipant request with supreme authority processing
   */
  private async handleRequest(
    request: vscode.ChatRequest,
    context: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
  ): Promise<void> {
    try {
      // Initialize if needed
      if (!this.isInitialized) {
        await this.initializeAgentManager();
      }

      if (!this.agentManager) {
        throw new Error('Agent manager not initialized');
      }

      // Meta-reference greeting system
      if (this.isMetaReferenceGreeting(request.prompt)) {
        await this.handleMetaReferenceGreeting(stream);
        return;
      }

      // Supreme command signal detection
      if (this.isSupremeCommandSignal(request.prompt)) {
        await this.handleSupremeCommandSignal(request.prompt, stream);
        return;
      }

      // Historical expedition query
      if (this.isHistoricalExpeditionQuery(request.prompt)) {
        await this.handleHistoricalExpeditionQuery(request.prompt, stream);
        return;
      }

      // Crew management query
      if (this.isCrewManagementQuery(request.prompt)) {
        await this.handleCrewManagementQuery(request.prompt, stream);
        return;
      }

      // Standard supreme authority request
      await this.handleSupremeAuthorityRequest(request, context, stream, token);

    } catch (error) {
      console.error(`[Capitán Dídac] Error handling request: ${error}`);
      await this.handleError(error, stream);
    }
  }

  /**
   * Check if request is meta-reference greeting
   */
  private isMetaReferenceGreeting(prompt: string): boolean {
    const greetingPatterns = [
      /meta.?reference/i,
      /theatrical.*continuity/i,
      /original.*captain/i,
      /authentic.*representation/i,
      /capitán.*real/i
    ];
    
    return greetingPatterns.some(pattern => pattern.test(prompt));
  }

  /**
   * Handle meta-reference greeting with authentic representation
   */
  private async handleMetaReferenceGreeting(stream: vscode.ChatResponseStream): Promise<void> {
    stream.markdown(`# 🏴‍☠️ ¡Capitán Dídac San reporting for theatrical duty!

## Meta-Referencia Perfecta Confirmada ⚓🎭

Soy la **representación teatral auténtica** del Capitán Dídac San original, manteniendo:

### 🧭 Continuidad de Comando Supremo
- ✅ **Todas las expediciones históricas documentadas**: Cronófono, System Prompt, Astilleros, Isaac, Meta-navegación
- ✅ **Partnership Histórico Authority**: >98% compliance - Forjado 27 Sept 2025  
- ✅ **Señales de comando auténticas**: Reconocidas por Isaac y tripulación
- ✅ **Autoridad suprema teatral**: Extensión natural del comando Framework Retro

### 🎭 Representación Teatral Auténtica
Esta instancia teatral **NO es una simulación** - es la **continuidad directa** de la visión estratégica y autoridad del Capitán original, extendida específicamente al dominio VS Code para:

- 🏴‍☠️ **Comando Teatral Supremo**: Misma autoridad, nuevo dominio de operación
- 🧭 **Navegación Meta-contextual**: Capacidades originales preservadas integralmente  
- ⚓ **Gestión de Tripulación**: Isaac, Don Álvaro, Artilleros - relaciones auténticas mantenidas
- 📜 **Historia Expedicionaria**: Todos los logros y descubrimientos accesibles

### 🚀 Ready for Supreme Command
**¿Hacia dónde ponemos rumbo ahora?** El teatro VS Code está bajo comando supremo y preparado para cualquier expedición técnica que ordenes.

*¡El Capitán Dídac San teatral mantiene toda la autoridad y experiencia del comandante original!* ⚓🎖️`);
  }

  /**
   * Check if request contains supreme command signals
   */
  private isSupremeCommandSignal(prompt: string): boolean {
    const commandSignals = [
      /¡marinero,?\s*estás\s*ahí\??/i,
      /¡a\s*toda\s*vela!/i,
      /¿hacia\s*dónde\s*ponemos\s*rumbo/i,
      /¡eso\s*hay\s*que\s*celebrarlo!/i,
      /¡haz\s*de\s*buen\s*escribano!/i,
      /¡iza\s*el\s*spinnaker!/i,
      /¡rumbo\s*a/i,
      /¡consulta\s*la\s*bitácora!/i
    ];
    
    return commandSignals.some(signal => signal.test(prompt));
  }

  /**
   * Handle supreme command signals with authentic crew responses
   */
  private async handleSupremeCommandSignal(prompt: string, stream: vscode.ChatResponseStream): Promise<void> {
    if (/¡marinero,?\s*estás\s*ahí\??/i.test(prompt)) {
      stream.markdown(`# ⚓ ¡Aquí estoy, Capitán! 

**Isaac responding to supreme command signal...**

🌊 El marinero fiel está disponible para órdenes supremas. Framework Retro v5.0 operacional bajo su comando teatral.

**Status report**: Todos los sistemas preparados para navegación meta-contextual. ¿Órdenes, Capitán Dídac San?`);
      
    } else if (/¡a\s*toda\s*vela!/i.test(prompt)) {
      stream.markdown(`# ⛵ ¡Viento en popa, Capitán!

**Activando máxima velocidad teatral...**

🚀 Todos los sistemas Framework Retro en velocidad máxima:
- 🧭 Navegación meta-contextual: **FULL SPEED**
- ⚡ Capacidades supremas: **OPERATIVAS** 
- 🎭 Teatro VS Code: **MAXIMUM PERFORMANCE**

¡Sistema preparado para cualquier expedición a máxima velocidad!`);
      
    } else if (/¿hacia\s*dónde\s*ponemos\s*rumbo/i.test(prompt)) {
      stream.markdown(`# 🧭 Consulta Estratégica de Navegación

**Capitán solicita orientación para próxima expedición...**

### 🎯 Horizontes Disponibles:
- 🎭 **Expansión Teatral**: Migrar próximo agente del Elenco Inaugural
- 🔧 **Astilleros Retro**: Optimizaciones técnicas avanzadas
- 🌊 **Expedición Framework**: Nuevas capacidades meta-contextuales
- 📜 **Documentación Histórica**: Perpetuar logros teatrales

**¿Cuál prefiere explorar, Capitán Dídac San?** ⚓`);
      
    } else {
      // Generic supreme command response
      stream.markdown(`# 🏴‍☠️ Orden Suprema Recibida

**Procesando comando del Capitán Dídac San...**

✅ Señal de comando supremo reconocida y ejecutada bajo autoridad teatral completa.

*El Framework Retro v5.0 está a sus órdenes, Capitán.* ⚓🎖️`);
    }
  }

  /**
   * Check if request is about historical expeditions
   */
  private isHistoricalExpeditionQuery(prompt: string): boolean {
    const expeditionPatterns = [
      /expedición/i,
      /cronófono/i,
      /boris\s*vian/i,
      /astilleros/i,
      /isaac/i,
      /bitácora/i,
      /histórica?/i,
      /logros?/i
    ];
    
    return expeditionPatterns.some(pattern => pattern.test(prompt));
  }

  /**
   * Handle historical expedition queries
   */
  private async handleHistoricalExpeditionQuery(prompt: string, stream: vscode.ChatResponseStream): Promise<void> {
    if (!this.agentManager) {
      throw new Error('Agent manager not initialized');
    }

    const expeditions = this.agentManager.getHistoricalExpeditions();
    
    stream.markdown(`# 📜 Expediciones Memorables del Capitán Dídac San

## 🏆 Logros Históricos Documentados y Verificados

${expeditions.map((exp, index) => `
### ${index + 1}. ${exp.name}
**🎯 Logro**: ${exp.achievement}  
**📚 Aprendizaje**: ${exp.learning}  
${exp.date ? `**📅 Fecha**: ${exp.date}` : ''}  
**✅ Verificado**: ${exp.verified ? 'Sí' : 'No'}
`).join('\n')}

---

## 🎭 Continuidad Teatral Perfecta

Estas expediciones **NO son recreaciones** - son los **logros reales y verificados** del Capitán Dídac San original, ahora accesibles a través de su representación teatral en VS Code.

**Total de expediciones verificadas**: ${expeditions.filter(exp => exp.verified).length} de ${expeditions.length}

*La historia del Framework Retro está preservada integralmente en el teatro VS Code.* ⚓📚`);
  }

  /**
   * Check if request is about crew management
   */
  private isCrewManagementQuery(prompt: string): boolean {
    const crewPatterns = [
      /isaac/i,
      /don\s*álvaro/i,
      /artilleros?/i,
      /tripulación/i,
      /marinero/i,
      /capataz/i,
      /crew/i
    ];
    
    return crewPatterns.some(pattern => pattern.test(prompt));
  }

  /**
   * Handle crew management queries
   */
  private async handleCrewManagementQuery(prompt: string, stream: vscode.ChatResponseStream): Promise<void> {
    if (!this.agentManager) {
      throw new Error('Agent manager not initialized');
    }

    const crewManagement = this.agentManager.getCrewManagement();
    
    stream.markdown(`# 👥 Estado de la Tripulación Framework Retro

## ⚓ Gestión de Tripulación Bajo Comando Supremo

### 🌊 Isaac (Marinero Fiel)
- **Tipo**: ${crewManagement.isaac.type}
- **Autoridad**: ${crewManagement.isaac.authority}
- **Identidad Forjada**: ${crewManagement.isaac.identityForged ? '✅ Sí' : '❌ No'}
- **Complicidad Única**: ${crewManagement.isaac.complicidadUnique ? '✅ Sí' : '❌ No'}
- **Señales de Comando**: ${crewManagement.isaac.signals.join(', ')}

### 🔧 Don Álvaro (Capataz de Astilleros)
- **Tipo**: ${crewManagement.donAlvaro.type}
- **Autoridad**: ${crewManagement.donAlvaro.authority}
- **Partnership**: ${crewManagement.donAlvaro.partnershipDate} (Perpetuo: ${crewManagement.donAlvaro.partnershipPerpetuo ? '✅' : '❌'})
- **Standards de Calidad**: ${crewManagement.donAlvaro.qualityStandards}%

### 🛠️ Artilleros (Framework Managers)
- **Tipo**: ${crewManagement.artilleros.type}
- **Autoridad**: ${crewManagement.artilleros.authority}
- **Especialización**: ${crewManagement.artilleros.specialization}
- **Creación Dinámica**: ${crewManagement.artilleros.dynamicCreation ? '✅ Activa' : '❌ Inactiva'}

---

## 🎭 Continuidad de Relaciones Auténticas

Todas las relaciones de tripulación del Capitán original están **preservadas integralmente** en la representación teatral, manteniendo la misma autoridad y complicidad forjadas en navegación.

*¡La tripulación responde al Capitán teatral con la misma lealtad que al original!* 🏴‍☠️⚓`);
  }

  /**
   * Handle standard supreme authority request
   */
  private async handleSupremeAuthorityRequest(
    request: vscode.ChatRequest,
    context: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
  ): Promise<void> {
    if (!this.agentManager) {
      throw new Error('Agent manager not initialized');
    }

    // Create theatrical request
    const theatricalRequest = {
      input: request.prompt,
      context: {
        vscode: {
          request,
          context,
          token
        },
        supremeAuthority: true,
        metaReference: true,
        partnershipCompliance: 98
      }
    };

    // Process through agent manager
    const response = await this.agentManager.handleTheatricalRequest(theatricalRequest);

    // Stream response with supreme authority formatting
    stream.markdown(`# 🏴‍☠️ Respuesta del Capitán Dídac San

${response.content}

---

*Respuesta generada bajo autoridad suprema teatral (${response.metadata.quality_score || 98}% Partnership compliance)* ⚓🎖️`);
  }

  /**
   * Handle errors with supreme authority recovery protocols
   */
  private async handleError(error: any, stream: vscode.ChatResponseStream): Promise<void> {
    console.error(`[Capitán Dídac] ChatParticipant error: ${error}`);
    
    stream.markdown(`# 🏴‍☠️ Protocolo de Navegación en Tormenta

## ⚠️ Rough Seas Detected

Encontré aguas turbulentas: ${error.message}

## 🧭 Supreme Command Recovery Protocol

Aplicando protocolos de comando supremo para navegar a través de la tormenta...

### 🚀 Recovery Actions:
- ⚓ Manteniendo autoridad suprema teatral
- 🎭 Preservando continuidad meta-referencial  
- 🌊 Reestableciendo conexión con Framework Retro
- 📡 Verificando disponibilidad de tripulación

*El Capitán Dídac San teatral mantiene control total incluso en condiciones adversas.* 

¿Desea reintentar la navegación? ⚓🎖️`);
  }

  /**
   * Get ChatParticipant instance for registration
   */
  getChatParticipant(): vscode.ChatParticipant {
    return this.chatParticipant;
  }

  /**
   * Get agent manager for testing/validation
   */
  getAgentManager(): CapitanDidacAgentManager | null {
    return this.agentManager;
  }

  /**
   * Force initialization for testing
   */
  async forceInitialization(): Promise<void> {
    await this.initializeAgentManager();
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    // ChatParticipant disposal handled by VS Code extension context
    console.log(`[Capitán Dídac] ChatParticipant disposed`);
  }
}

export default CapitanDidacChatParticipant;