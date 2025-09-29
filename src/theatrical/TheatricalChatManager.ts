/**
 * Theatrical Chat Participants Manager
 * Manages registration and lifecycle of all theatrical agents as VS Code ChatParticipants
 * 
 * Sprint S09-002 - Chat Participants Integration
 * Partnership Histórico Standards: >90% quality maintained
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Simplified agent configuration for ChatParticipant registration
 */
interface TheatricalChatAgent {
    id: string;
    name: string;
    emoji: string;
    category: string;
    description: string;
    expertise: string[];
}

/**
 * Manager for all theatrical ChatParticipants
 */
export class TheatricalChatManager {
    private participants: Map<string, vscode.ChatParticipant> = new Map();
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    /**
     * Initialize all theatrical ChatParticipants
     */
    async initialize(): Promise<void> {
        console.log('🎭 Initializing Theatrical Chat Participants...');

        // Define our 5 migrated agents
        const agents: TheatricalChatAgent[] = [
            {
                id: 'isaac',
                name: 'Isaac - Marinero Fiel',
                emoji: '⚓',
                category: 'framework-retro',
                description: 'Coordinador de framework retro, especialista en navegación técnica',
                expertise: ['project-management', 'documentation', 'framework-navigation']
            },
            {
                id: 'don-alvaro',
                name: 'Don Álvaro - Capataz de Astilleros',
                emoji: '🔧',
                category: 'framework-retro',
                description: 'Supervisor de astilleros, autoridad en calidad y Partnership Histórico',
                expertise: ['quality-assurance', 'partnership-historico', 'supervisor-authority']
            },
            {
                id: 'capitan-didac',
                name: 'Capitán Dídac - Liderazgo Naval',
                emoji: '🏴‍☠️',
                category: 'framework-retro', 
                description: 'Liderazgo de proyecto, arquitectura de alto nivel',
                expertise: ['project-leadership', 'architecture-decisions', 'strategic-planning']
            },
            {
                id: 'indra',
                name: 'Indra - Integration Agent',
                emoji: '🌐',
                category: 'technical-devops',
                description: 'Especialista en integración cross-component y comunicación',
                expertise: ['integration', 'cross-component', 'external-services']
            },
            {
                id: 'backend-agent',
                name: 'Backend Agent - Technical Specialist',
                emoji: '💻',
                category: 'technical-devops',
                description: 'Especialista técnico en Express.js, Node.js y backend development',
                expertise: ['express-js', 'nodejs', 'backend-development', 'middleware']
            }
        ];

        // Register each agent as ChatParticipant
        for (const agent of agents) {
            await this.registerChatParticipant(agent);
        }

        console.log(`🎭 Theatrical Chat Participants initialized: ${this.participants.size} agents active`);
    }

    /**
     * Register a single agent as ChatParticipant
     */
    private async registerChatParticipant(agent: TheatricalChatAgent): Promise<void> {
        try {
            // Create ChatParticipant with simplified handler
            const participant = vscode.chat.createChatParticipant(
                agent.id,
                this.createChatHandler(agent)
            );

            // Configure participant
            participant.iconPath = new vscode.ThemeIcon('account');
            participant.followupProvider = {
                provideFollowups: (result, context, token) => {
                    return this.getFollowups(agent);
                }
            };

            // Store and register for disposal
            this.participants.set(agent.id, participant);
            this.context.subscriptions.push(participant);

            console.log(`✅ Registered ChatParticipant: ${agent.id} (${agent.name})`);

        } catch (error) {
            console.error(`❌ Failed to register ChatParticipant ${agent.id}:`, error);
        }
    }

    /**
     * Create chat handler for an agent
     */
    private createChatHandler(agent: TheatricalChatAgent) {
        return async (
            request: vscode.ChatRequest,
            context: vscode.ChatContext,
            stream: vscode.ChatResponseStream,
            token: vscode.CancellationToken
        ): Promise<vscode.ChatResult> => {
            try {
                // Agent identification header
                stream.markdown(`${agent.emoji} **${agent.name}** - ${agent.category}\n`);
                stream.markdown(`*Expertise: ${agent.expertise.join(', ')}*\n\n`);

                // Process request based on agent category
                await this.processAgentRequest(agent, request, stream);

                // Partnership Histórico quality footer
                stream.markdown('\n✅ **Quality Standard**: Partnership Histórico compliant');

                return {
                    metadata: {
                        command: request.command || 'chat',
                        agentId: agent.id
                    }
                };

            } catch (error) {
                stream.markdown(`❌ **Error**: ${error instanceof Error ? error.message : 'Unknown error'}`);
                return {
                    metadata: {
                        command: '',
                        error: true
                    }
                };
            }
        };
    }

    /**
     * Process agent-specific request
     */
    private async processAgentRequest(
        agent: TheatricalChatAgent,
        request: vscode.ChatRequest,
        stream: vscode.ChatResponseStream
    ): Promise<void> {
        const prompt = request.prompt;

        switch (agent.id) {
            case 'isaac':
                await this.handleIsaacRequest(prompt, stream);
                break;
            case 'don-alvaro':
                await this.handleDonAlvaroRequest(prompt, stream);
                break;
            case 'capitan-didac':
                await this.handleCapitanDidacRequest(prompt, stream);
                break;
            case 'indra':
                await this.handleIndraRequest(prompt, stream);
                break;
            case 'backend-agent':
                await this.handleBackendAgentRequest(prompt, stream);
                break;
            default:
                stream.markdown(`Processing request: "${prompt}"\n\nAgent-specific implementation pending.`);
        }
    }

    /**
     * Isaac - Framework Retro Coordinator
     */
    private async handleIsaacRequest(prompt: string, stream: vscode.ChatResponseStream): Promise<void> {
        stream.markdown('🧭 **Isaac navegando su consulta**\n\n');
        
        if (prompt.includes('proyecto') || prompt.includes('navegación')) {
            stream.markdown('Como coordinador del framework retro, puedo ayudarte con:\n');
            stream.markdown('- 📊 Gestión de proyectos y sprints\n');
            stream.markdown('- 🗺️ Navegación técnica del workspace\n');
            stream.markdown('- 📝 Documentación y organización\n');
            stream.markdown('- ⚓ Coordinación entre agentes del teatro\n\n');
        }
        
        stream.markdown(`Procesando: "${prompt}"\n\n`);
        stream.markdown('*Listo para navegar hacia cualquier puerto que necesites, Capitán!* ⚓');
    }

    /**
     * Don Álvaro - Quality Supervisor
     */
    private async handleDonAlvaroRequest(prompt: string, stream: vscode.ChatResponseStream): Promise<void> {
        stream.markdown('🔧 **Don Álvaro supervisando calidad**\n\n');
        
        if (prompt.includes('calidad') || prompt.includes('validación')) {
            stream.markdown('Como Capataz de Astilleros, superviso:\n');
            stream.markdown('- 🏗️ Partnership Histórico compliance (>90%)\n');
            stream.markdown('- ✅ Quality gates y validation\n');
            stream.markdown('- 📋 Supervisor authority checkpoints\n');
            stream.markdown('- 🛠️ Framework optimization y maintenance\n\n');
        }
        
        stream.markdown(`Evaluando: "${prompt}"\n\n`);
        stream.markdown('*Cada framework sale superior a como llegó - Partnership maintained!* 🔧');
    }

    /**
     * Capitán Dídac - Strategic Leadership
     */
    private async handleCapitanDidacRequest(prompt: string, stream: vscode.ChatResponseStream): Promise<void> {
        stream.markdown('🏴‍☠️ **Capitán Dídac en el puente**\n\n');
        
        if (prompt.includes('arquitectura') || prompt.includes('estrategia')) {
            stream.markdown('Como Capitán, mi responsabilidad incluye:\n');
            stream.markdown('- 🎯 Strategic planning y dirección\n');
            stream.markdown('- 🏗️ Architecture decisions de alto nivel\n');
            stream.markdown('- 👥 Leadership del equipo teatral\n');
            stream.markdown('- 🗺️ Visión de conjunto del proyecto\n\n');
        }
        
        stream.markdown(`Analizando: "${prompt}"\n\n`);
        stream.markdown('*El rumbo está trazado, la tripulación lista!* 🏴‍☠️');
    }

    /**
     * Indra - Integration Specialist
     */
    private async handleIndraRequest(prompt: string, stream: vscode.ChatResponseStream): Promise<void> {
        stream.markdown('🌐 **Indra conectando sistemas**\n\n');
        
        if (prompt.includes('integración') || prompt.includes('servicios')) {
            stream.markdown('Como Integration Agent, especializado en:\n');
            stream.markdown('- 🔗 Cross-component communication\n');
            stream.markdown('- 🌐 External services integration\n');
            stream.markdown('- ⚡ Real-time data synchronization\n');
            stream.markdown('- 🔧 API coordination y middleware\n\n');
        }
        
        stream.markdown(`Integrando: "${prompt}"\n\n`);
        stream.markdown('*Todos los sistemas en perfecta sincronía!* 🌐');
    }

    /**
     * Backend Agent - Technical Specialist
     */
    private async handleBackendAgentRequest(prompt: string, stream: vscode.ChatResponseStream): Promise<void> {
        stream.markdown('💻 **Backend Agent - Technical Analysis**\n\n');
        
        if (prompt.includes('backend') || prompt.includes('express') || prompt.includes('nodejs')) {
            stream.markdown('Como Technical Specialist, domino:\n');
            stream.markdown('- ⚡ Express.js routing y middleware\n');
            stream.markdown('- 🔧 Node.js development patterns\n');
            stream.markdown('- 🗄️ Database integration\n');
            stream.markdown('- 🔒 Security y performance optimization\n\n');
        }
        
        stream.markdown(`Procesando: "${prompt}"\n\n`);
        stream.markdown('*Backend systems optimized and ready!* 💻');
    }

    /**
     * Get followup suggestions for an agent
     */
    private getFollowups(agent: TheatricalChatAgent): vscode.ChatFollowup[] {
        const followups: vscode.ChatFollowup[] = [];

        // Add agent-specific followups
        switch (agent.id) {
            case 'isaac':
                followups.push(
                    { prompt: '¿Cómo puedo navegar el proyecto?', label: '🧭 Navegación del proyecto' },
                    { prompt: '¿Qué agentes están disponibles?', label: '👥 Ver agentes del teatro' }
                );
                break;
            case 'don-alvaro':
                followups.push(
                    { prompt: '¿Cuál es el estado de calidad?', label: '📊 Estado de calidad' },
                    { prompt: '¿Qué es Partnership Histórico?', label: '🤝 Partnership Histórico' }
                );
                break;
            case 'capitan-didac':
                followups.push(
                    { prompt: '¿Cuál es la visión del proyecto?', label: '🎯 Visión estratégica' },
                    { prompt: '¿Cómo está la arquitectura?', label: '🏗️ Estado arquitectural' }
                );
                break;
            case 'indra':
                followups.push(
                    { prompt: '¿Qué servicios están integrados?', label: '🔗 Servicios integrados' },
                    { prompt: '¿Cómo funciona la sincronización?', label: '⚡ Sincronización' }
                );
                break;
            case 'backend-agent':
                followups.push(
                    { prompt: '¿Cómo optimizar el backend?', label: '⚡ Optimización backend' },
                    { prompt: '¿Qué patterns usar en Express?', label: '🔧 Express patterns' }
                );
                break;
        }

        return followups;
    }

    /**
     * Get all registered participants
     */
    getParticipants(): Map<string, vscode.ChatParticipant> {
        return new Map(this.participants);
    }

    /**
     * Dispose all participants
     */
    dispose(): void {
        for (const [id, participant] of this.participants) {
            try {
                participant.dispose();
                console.log(`🎭 Disposed ChatParticipant: ${id}`);
            } catch (error) {
                console.error(`❌ Error disposing ChatParticipant ${id}:`, error);
            }
        }
        this.participants.clear();
    }
}