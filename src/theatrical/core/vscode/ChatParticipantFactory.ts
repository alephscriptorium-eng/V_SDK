/**
 * ChatParticipantFactory.ts
 * 
 * Factory for creating VS Code ChatParticipants from theatrical agents
 * Implements the Runtime Layer of the 4-layer theatrical architecture
 * 
 * Quality Standard: Partnership Histórico >90%
 * VibeCoding Integration: S09-001 Sprint Compatible
 */

import * as vscode from 'vscode';
import { TheatricalAgent } from '../managers/TheatricalAgentCore';
import { ITheatricalAgent, ICompany, VibeCodingIntegration } from '../interfaces';
import { theatricalValidator } from '../schemas/validation';

/**
 * VibeCoding Context for request processing
 */
interface VibeCodingContext {
  sprintId: string;
  checkpointId: string;
  qualityTargets: {
    targetAccuracy: number;
    standard: string;
  };
  metrics: {
    accuracy: number;
    completeness: number;
    performance: number;
  };
}

/**
 * Factory for creating VS Code ChatParticipants from theatrical agent configurations
 */
export class ChatParticipantFactory {
    private agents: Map<string, TheatricalAgent> = new Map();
    private registeredParticipants: Map<string, vscode.ChatParticipant> = new Map();

    /**
     * Create a VS Code ChatParticipant from a theatrical agent configuration
     */
    async createChatParticipant(
        agentConfig: ITheatricalAgent, 
        company: ICompany
    ): Promise<vscode.ChatParticipant | null> {
        try {
            // 1. Validate agent configuration using theatrical validator
            const validation = theatricalValidator.validateAgent(agentConfig as any);
            if (!validation.isValid) {
                console.error(`[ChatParticipantFactory] Invalid agent config for ${agentConfig.id}:`, validation.errors);
                return null;
            }

            // 2. Create theatrical agent instance
            const agentInstance = new TheatricalAgent(
                agentConfig.id,
                agentConfig.content,
                agentConfig.configuration,
                agentConfig.vibeCodingIntegration,
                agentConfig.mcpIntegration
            );
            
            await agentInstance.initialize();
            this.agents.set(agentConfig.id, agentInstance);

            // 3. Create VS Code ChatParticipant
            const participant = vscode.chat.createChatParticipant(
                agentConfig.id,
                this.createRequestHandler(agentInstance, company, agentConfig)
            );

            // 4. Configure participant metadata (only available properties)
            participant.iconPath = new vscode.ThemeIcon(agentConfig.emoji || 'robot');

            // 5. Register and track
            this.registeredParticipants.set(agentConfig.id, participant);
            
            console.log(`[ChatParticipantFactory] Successfully created ChatParticipant: ${agentConfig.id}`);
            return participant;

        } catch (error) {
            console.error(`[ChatParticipantFactory] Error creating ChatParticipant for ${agentConfig.id}:`, error);
            return null;
        }
    }

    /**
     * Create the request handler for a ChatParticipant
     */
    private createRequestHandler(
        agentInstance: TheatricalAgent,
        company: ICompany,
        agentConfig: ITheatricalAgent
    ): (request: vscode.ChatRequest, context: vscode.ChatContext, stream: vscode.ChatResponseStream, token: vscode.CancellationToken) => vscode.ProviderResult<vscode.ChatResult> {
        
        return async (request, context, stream, token) => {
            try {
                // Create VibeCoding context for the request
                const vibeCodingContext: VibeCodingContext = {
                    sprintId: this.extractSprintId(request.prompt) || 'S09-001',
                    checkpointId: this.generateCheckpointId(),
                    qualityTargets: {
                        standard: 'Partnership Histórico',
                        targetAccuracy: 0.90
                    },
                    metrics: {
                        accuracy: 0,
                        completeness: 0,
                        performance: 0
                    }
                };

                // Process request through theatrical agent
                const response = await agentInstance.handleRequest({
                    input: request.prompt,
                    context: {
                        company,
                        vibeCoding: vibeCodingContext,
                        vsCodeContext: {
                            request,
                            context,
                            workspaceFolder: vscode.workspace.workspaceFolders?.[0]
                        }
                    }
                });

                if (!response || !response.content) {
                    stream.markdown('❌ **Error**: No response generated from theatrical agent');
                    return { metadata: { command: '', type: 'error' } };
                }

                // Stream response with Partnership Histórico formatting
                await this.streamTheatricalResponse(stream, response, agentInstance, vibeCodingContext);

                return { 
                    metadata: { 
                        command: request.command || 'chat',
                        type: 'success',
                        agentId: agentInstance.id,
                        sprintId: vibeCodingContext.sprintId
                    } 
                };

            } catch (error) {
                console.error(`[ChatParticipantFactory] Error in request handler:`, error);
                stream.markdown(`❌ **Error**: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
                return { metadata: { command: '', type: 'error' } };
            }
        };
    }

    /**
     * Stream theatrical response with proper formatting and quality validation
     */
    private async streamTheatricalResponse(
        stream: vscode.ChatResponseStream,
        response: any,
        agentInstance: TheatricalAgent,
        vibeCodingContext: VibeCodingContext
    ): Promise<void> {
        // Partnership Histórico header
        stream.markdown(`🎭 **${agentInstance.displayName}** - ${agentInstance.category}\n`);
        stream.markdown(`*Sprint: ${vibeCodingContext.sprintId} | Checkpoint: ${vibeCodingContext.checkpointId}*\n\n`);

        // Main response content
        stream.markdown(response.content);

        // Quality validation footer
        const qualityCheck = this.validateResponseQuality(response.content);
        if (qualityCheck.accuracy >= vibeCodingContext.qualityTargets.targetAccuracy) {
            stream.markdown(`\n✅ **Quality Standard**: Partnership Histórico (${(qualityCheck.accuracy * 100).toFixed(1)}%)`);
        } else {
            stream.markdown(`\n⚠️ **Quality Warning**: Below Partnership Histórico standard (${(qualityCheck.accuracy * 100).toFixed(1)}%)`);
        }
    }

    /**
     * Create multiple ChatParticipants from a company configuration
     */
    async createCompanyParticipants(company: ICompany): Promise<vscode.ChatParticipant[]> {
        const participants: vscode.ChatParticipant[] = [];
        
        for (const agentConfig of company.agents) {
            const participant = await this.createChatParticipant(agentConfig, company);
            if (participant) {
                participants.push(participant);
            }
        }

        console.log(`[ChatParticipantFactory] Created ${participants.length}/${company.agents.length} participants for company ${company.name}`);
        return participants;
    }

    /**
     * Dispose of all registered ChatParticipants
     */
    dispose(): void {
        for (const [id, participant] of this.registeredParticipants) {
            try {
                participant.dispose();
                console.log(`[ChatParticipantFactory] Disposed ChatParticipant: ${id}`);
            } catch (error) {
                console.error(`[ChatParticipantFactory] Error disposing ChatParticipant ${id}:`, error);
            }
        }
        this.registeredParticipants.clear();

        // Dispose theatrical agents
        for (const [id, agent] of this.agents) {
            try {
                agent.dispose();
                console.log(`[ChatParticipantFactory] Disposed TheatricalAgent: ${id}`);
            } catch (error) {
                console.error(`[ChatParticipantFactory] Error disposing TheatricalAgent ${id}:`, error);
            }
        }
        this.agents.clear();
    }

    /**
     * Get all registered ChatParticipants
     */
    getRegisteredParticipants(): Map<string, vscode.ChatParticipant> {
        return new Map(this.registeredParticipants);
    }

    // --- UTILITY METHODS ---

    private extractSprintId(prompt: string): string | null {
        const sprintMatch = prompt.match(/S\d{2}-\d{3}/);
        return sprintMatch ? sprintMatch[0] : null;
    }

    private generateCheckpointId(): string {
        return `CP-${Date.now().toString(36)}`;
    }

    private validateResponseQuality(response: string): { accuracy: number; completeness: number; performance: number } {
        // Basic quality validation - can be enhanced
        const hasStructure = response.includes('**') || response.includes('#') || response.includes('*');
        const hasContent = response.length > 50;
        const hasEmojis = /[\u{1F000}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/u.test(response);
        
        let accuracy = 0.6; // Base score
        if (hasStructure) accuracy += 0.2;
        if (hasContent) accuracy += 0.15;
        if (hasEmojis) accuracy += 0.05;

        return {
            accuracy: Math.min(accuracy, 1.0),
            completeness: hasContent ? 0.9 : 0.5,
            performance: 0.85 // Placeholder - can be enhanced with timing metrics
        };
    }
}

export default ChatParticipantFactory;