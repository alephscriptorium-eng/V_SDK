/**
 * SnapshotManager - Gestión de snapshots de conversaciones Copilot
 * 
 * Parte de FEATURE-SNAPSHOTS-1.0.0
 * SCRIPT-2.2.0: Añadido soporte para selección de modelo en generateAbstract
 * 
 * Los snapshots capturan el estado actual del cache de requests
 * y lo persisten a disco para consulta posterior.
 * 
 * Refactorizado: Tipos extraídos a types/snapshot.types.ts
 * 
 * @see ARCHIVO/DISCO/COPILOT_SNAPSHOTS/ - ubicación de almacenamiento
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { CcreqDocumentContent, getCachedRequestIds, getCachedRequestContent, getCacheStats } from './CcreqDocumentResolver';
import { getModelConfigService } from './ModelConfigService';
import { 
    SnapshotMetadata, 
    Snapshot, 
    CaptureSnapshotOptions, 
    CaptureResult,
    SnapshotStats,
    TokenCount
} from './types/snapshot.types';

// Re-export types for backward compatibility
export { SnapshotMetadata, Snapshot, CaptureSnapshotOptions, CaptureResult };

/**
 * SnapshotManager - Singleton para gestionar snapshots
 */
export class SnapshotManager {
    private static instance: SnapshotManager;
    private snapshotsPath: string;
    private outputChannel: vscode.OutputChannel;

    private constructor(workspacePath: string, outputChannel?: vscode.OutputChannel) {
        this.snapshotsPath = path.join(workspacePath, 'ARCHIVO', 'DISCO', 'COPILOT_SNAPSHOTS');
        this.outputChannel = outputChannel || vscode.window.createOutputChannel('Copilot Snapshots');
    }

    /**
     * Obtener instancia singleton
     */
    static getInstance(workspacePath?: string, outputChannel?: vscode.OutputChannel): SnapshotManager {
        if (!SnapshotManager.instance) {
            if (!workspacePath) {
                const folders = vscode.workspace.workspaceFolders;
                if (!folders || folders.length === 0) {
                    throw new Error('No workspace folder found');
                }
                workspacePath = folders[0].uri.fsPath;
            }
            SnapshotManager.instance = new SnapshotManager(workspacePath, outputChannel);
        }
        return SnapshotManager.instance;
    }

    /**
     * Capturar snapshot del cache actual
     */
    async captureSnapshot(options: CaptureSnapshotOptions): Promise<CaptureResult> {
        try {
            this.outputChannel.appendLine(`📸 Capturing snapshot: ${options.name}`);

            // Obtener IDs en cache
            const cachedIds = getCachedRequestIds();
            if (cachedIds.length === 0) {
                return {
                    success: false,
                    error: 'No hay requests en cache. Haz algunas consultas a Copilot primero.'
                };
            }

            // Recopilar requests del cache
            const requests: CcreqDocumentContent[] = [];
            const models = new Set<string>();
            let totalPromptTokens = 0;
            let totalCompletionTokens = 0;

            for (const id of cachedIds) {
                const content = getCachedRequestContent(id);
                if (content) {
                    requests.push(content);
                    if (content.metadata?.model) {
                        models.add(content.metadata.model);
                    }
                    totalPromptTokens += content.metadata?.promptTokens || 0;
                    totalCompletionTokens += content.metadata?.completionTokens || 0;
                }
            }

            if (requests.length === 0) {
                return {
                    success: false,
                    error: 'No se pudo recuperar contenido del cache.'
                };
            }

            // Generar ID único
            const now = new Date();
            const timestamp = this.formatTimestamp(now);
            const sanitizedName = this.sanitizeName(options.name);
            const snapshotId = `${timestamp}_${sanitizedName}`;

            // Crear metadata
            const metadata: SnapshotMetadata = {
                id: snapshotId,
                name: options.name,
                description: options.description,
                createdAt: now,
                requestCount: requests.length,
                models: Array.from(models),
                linkedBacklog: options.linkedBacklog,
                totalTokens: {
                    prompt: totalPromptTokens,
                    completion: totalCompletionTokens
                }
            };

            // Guardar a disco
            await this.saveSnapshot({ metadata, requests });

            // Actualizar INDEX.md
            await this.updateIndex();

            this.outputChannel.appendLine(`✅ Snapshot saved: ${snapshotId} (${requests.length} requests)`);

            return {
                success: true,
                snapshotId,
                requestCount: requests.length
            };

        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.outputChannel.appendLine(`❌ Error capturing snapshot: ${errorMsg}`);
            return {
                success: false,
                error: errorMsg
            };
        }
    }

    /**
     * Listar todos los snapshots disponibles
     */
    async listSnapshots(): Promise<SnapshotMetadata[]> {
        try {
            await this.ensureSnapshotsDir();
            const entries = fs.readdirSync(this.snapshotsPath, { withFileTypes: true });
            const snapshots: SnapshotMetadata[] = [];

            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const metadataPath = path.join(this.snapshotsPath, entry.name, 'metadata.json');
                    if (fs.existsSync(metadataPath)) {
                        try {
                            const content = fs.readFileSync(metadataPath, 'utf-8');
                            const metadata = JSON.parse(content) as SnapshotMetadata;
                            // Convertir string de fecha a Date
                            metadata.createdAt = new Date(metadata.createdAt);
                            snapshots.push(metadata);
                        } catch {
                            this.outputChannel.appendLine(`⚠️ Invalid metadata in ${entry.name}`);
                        }
                    }
                }
            }

            // Ordenar por fecha descendente
            snapshots.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            return snapshots;

        } catch (error) {
            this.outputChannel.appendLine(`Error listing snapshots: ${error}`);
            return [];
        }
    }

    /**
     * Obtener un snapshot por ID
     */
    async getSnapshot(snapshotId: string): Promise<Snapshot | null> {
        try {
            const snapshotDir = path.join(this.snapshotsPath, snapshotId);
            
            if (!fs.existsSync(snapshotDir)) {
                return null;
            }

            const metadataPath = path.join(snapshotDir, 'metadata.json');
            const requestsPath = path.join(snapshotDir, 'requests.json');

            if (!fs.existsSync(metadataPath) || !fs.existsSync(requestsPath)) {
                return null;
            }

            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8')) as SnapshotMetadata;
            metadata.createdAt = new Date(metadata.createdAt);

            const requests = JSON.parse(fs.readFileSync(requestsPath, 'utf-8')) as CcreqDocumentContent[];

            return { metadata, requests };

        } catch (error) {
            this.outputChannel.appendLine(`Error getting snapshot ${snapshotId}: ${error}`);
            return null;
        }
    }

    /**
     * Obtener el directorio de snapshots
     */
    getSnapshotsDirectory(): string {
        return this.snapshotsPath;
    }

    /**
     * Eliminar un snapshot
     */
    async deleteSnapshot(snapshotId: string): Promise<boolean> {
        try {
            const snapshotDir = path.join(this.snapshotsPath, snapshotId);
            
            if (!fs.existsSync(snapshotDir)) {
                return false;
            }

            fs.rmSync(snapshotDir, { recursive: true, force: true });
            await this.updateIndex();

            this.outputChannel.appendLine(`🗑️ Snapshot deleted: ${snapshotId}`);
            return true;

        } catch (error) {
            this.outputChannel.appendLine(`Error deleting snapshot ${snapshotId}: ${error}`);
            return false;
        }
    }

    /**
     * Exportar snapshot a formato markdown
     */
    async exportToMarkdown(snapshotId: string): Promise<string | null> {
        const snapshot = await this.getSnapshot(snapshotId);
        if (!snapshot) {
            return null;
        }

        const { metadata, requests } = snapshot;
        let md = `# Snapshot: ${metadata.name}\n\n`;
        md += `> **ID**: ${metadata.id}  \n`;
        md += `> **Fecha**: ${metadata.createdAt.toLocaleString()}  \n`;
        md += `> **Requests**: ${metadata.requestCount}  \n`;
        md += `> **Modelos**: ${metadata.models.join(', ')}  \n`;
        if (metadata.linkedBacklog) {
            md += `> **Backlog**: ${metadata.linkedBacklog}  \n`;
        }
        if (metadata.description) {
            md += `\n${metadata.description}\n`;
        }
        md += `\n---\n\n`;

        for (let i = 0; i < requests.length; i++) {
            const req = requests[i];
            md += `## Request ${i + 1}: ${req.requestId}\n\n`;
            
            if (req.metadata) {
                md += `**Modelo**: ${req.metadata.model || 'unknown'}  \n`;
                md += `**Tokens**: ${req.metadata.promptTokens || '?'} prompt, ${req.metadata.completionTokens || '?'} completion  \n\n`;
            }

            if (req.systemMessage) {
                md += `### System Message (${req.systemMessage.length} chars)\n\n`;
                md += `\`\`\`\n${req.systemMessage.substring(0, 500)}${req.systemMessage.length > 500 ? '...' : ''}\n\`\`\`\n\n`;
            }

            if (req.userMessages.length > 0) {
                md += `### User Messages\n\n`;
                for (const msg of req.userMessages) {
                    md += `> ${msg.substring(0, 300)}${msg.length > 300 ? '...' : ''}\n\n`;
                }
            }

            if (req.assistantResponses.length > 0) {
                md += `### Assistant Responses\n\n`;
                for (const resp of req.assistantResponses) {
                    md += `${resp.substring(0, 500)}${resp.length > 500 ? '...' : ''}\n\n`;
                }
            }

            if (req.toolCalls.length > 0) {
                md += `### Tool Calls\n\n`;
                for (const tool of req.toolCalls) {
                    md += `- **${tool.name}**\n`;
                }
                md += '\n';
            }

            md += `---\n\n`;
        }

        return md;
    }

    /**
     * Obtener estadísticas del sistema de snapshots
     */
    getStats(): SnapshotStats {
        const snapshots = fs.existsSync(this.snapshotsPath)
            ? fs.readdirSync(this.snapshotsPath, { withFileTypes: true })
                .filter(e => e.isDirectory() && e.name !== '.git')
                .length
            : 0;

        const cacheStats = getCacheStats();

        return {
            snapshotCount: snapshots,
            cacheSize: cacheStats.size,
            cacheMaxSize: cacheStats.maxSize,
            cachedIds: cacheStats.ids
        };
    }

    // =========================================================================
    // Private methods
    // =========================================================================

    private async ensureSnapshotsDir(): Promise<void> {
        if (!fs.existsSync(this.snapshotsPath)) {
            fs.mkdirSync(this.snapshotsPath, { recursive: true });
        }
    }

    private async saveSnapshot(snapshot: Snapshot): Promise<void> {
        await this.ensureSnapshotsDir();

        const snapshotDir = path.join(this.snapshotsPath, snapshot.metadata.id);
        fs.mkdirSync(snapshotDir, { recursive: true });

        // Guardar metadata
        const metadataPath = path.join(snapshotDir, 'metadata.json');
        fs.writeFileSync(metadataPath, JSON.stringify(snapshot.metadata, null, 2));

        // Guardar requests
        const requestsPath = path.join(snapshotDir, 'requests.json');
        fs.writeFileSync(requestsPath, JSON.stringify(snapshot.requests, null, 2));

        // Generar summary.md
        const summaryPath = path.join(snapshotDir, 'summary.md');
        const summary = await this.generateSummary(snapshot);
        fs.writeFileSync(summaryPath, summary);
    }

    private async generateSummary(snapshot: Snapshot): Promise<string> {
        const { metadata, requests } = snapshot;
        
        let md = `# Snapshot: ${metadata.name}\n\n`;
        md += `- **ID**: ${metadata.id}\n`;
        md += `- **Fecha**: ${metadata.createdAt.toISOString()}\n`;
        md += `- **Requests**: ${metadata.requestCount}\n`;
        md += `- **Modelos**: ${metadata.models.join(', ')}\n`;
        md += `- **Tokens**: ${metadata.totalTokens.prompt} prompt, ${metadata.totalTokens.completion} completion\n`;
        
        if (metadata.linkedBacklog) {
            md += `- **Backlog**: ${metadata.linkedBacklog}\n`;
        }
        if (metadata.description) {
            md += `\n## Descripción\n\n${metadata.description}\n`;
        }

        md += `\n## Requests Capturados\n\n`;
        for (const req of requests) {
            md += `- \`${req.requestId}\`: ${req.userMessages[0]?.substring(0, 60) || 'Sin mensaje'}...\n`;
        }

        return md;
    }

    private async updateIndex(): Promise<void> {
        const snapshots = await this.listSnapshots();
        const indexPath = path.join(this.snapshotsPath, 'INDEX.md');

        let md = `# Índice de Snapshots — Copilot Logs\n\n`;
        md += `> **Generado automáticamente** por SnapshotManager  \n`;
        md += `> **Actualizado**: ${new Date().toISOString()}\n\n`;
        md += `---\n\n`;
        md += `## Snapshots Disponibles\n\n`;
        md += `| ID | Nombre | Fecha | Requests | Backlog |\n`;
        md += `|----|--------|-------|----------|--------|\n`;

        if (snapshots.length === 0) {
            md += `| — | *Sin snapshots aún* | — | — | — |\n`;
        } else {
            for (const s of snapshots) {
                const date = s.createdAt.toLocaleDateString();
                const backlog = s.linkedBacklog || '—';
                md += `| ${s.id} | ${s.name} | ${date} | ${s.requestCount} | ${backlog} |\n`;
            }
        }

        md += `\n---\n\n`;
        md += `## Instrucciones de Uso\n\n`;
        md += `### Capturar Snapshot\n\n`;
        md += `\`\`\`\n@workspace usa el tool capture_snapshot para guardar la conversación actual\n\`\`\`\n\n`;
        md += `O desde Command Palette:\n`;
        md += `\`\`\`\n> Copilot Logs: Capture Snapshot\n\`\`\`\n\n`;
        md += `### Listar Snapshots\n\n`;
        md += `\`\`\`\n@workspace usa el tool list_snapshots\n\`\`\`\n\n`;
        md += `### Recuperar Snapshot\n\n`;
        md += `\`\`\`\n@workspace usa el tool get_snapshot con id "YYYY-MM-DD_HH-MM_nombre"\n\`\`\`\n\n`;
        md += `---\n\n`;
        md += `## Advertencia\n\n`;
        md += `⚠️ **Los logs de Copilot Chat tienen un límite de ~100 requests en memoria.**  \n`;
        md += `En sesiones largas, los requests antiguos se sobrescriben automáticamente.\n\n`;
        md += `**Recomendación**: Captura snapshots cada 30 minutos durante sesiones intensivas.\n\n`;
        md += `---\n\n`;
        md += `*Generado por Aleph Scriptorium v1.0.0-beta.1*\n`;

        fs.writeFileSync(indexPath, md);
    }

    /**
     * Generar ABSTRACT.md con resúmenes semánticos usando LLM (T009)
     * SCRIPT-2.2.0: Añadido soporte para selección de modelo
     * Usa la API vscode.lm para generar resúmenes inteligentes
     * 
     * @param modelId - Optional model ID to use (e.g., 'claude-sonnet-4')
     */
    async generateAbstract(modelId?: string): Promise<string | null> {
        try {
            const snapshots = await this.listSnapshots();
            if (snapshots.length === 0) {
                this.outputChannel.appendLine('No hay snapshots para generar abstract');
                return null;
            }

            // SCRIPT-2.2.0: Use ModelConfigService for model selection
            const modelConfigService = getModelConfigService(undefined, this.outputChannel);
            const modelSelection = await modelConfigService.selectModel(modelId);
            
            let models: vscode.LanguageModelChat[] = [];
            let selectedModelName = 'unknown';

            if (modelSelection.success && modelSelection.model) {
                selectedModelName = modelSelection.model.name;
                models = await vscode.lm.selectChatModels({
                    vendor: modelSelection.model.vendor,
                    family: modelSelection.model.family
                });
                
                if (modelSelection.usedFallback) {
                    this.outputChannel.appendLine(
                        `[SnapshotManager] Using fallback model: ${selectedModelName}`
                    );
                } else {
                    this.outputChannel.appendLine(
                        `[SnapshotManager] Using selected model: ${selectedModelName}`
                    );
                }
            } else {
                // Last resort fallback to gpt-4o
                this.outputChannel.appendLine(
                    `[SnapshotManager] Model selection failed, trying gpt-4o fallback`
                );
                models = await vscode.lm.selectChatModels({ vendor: 'copilot', family: 'gpt-4o' });
                selectedModelName = 'GPT-4o (fallback)';
            }
            
            let abstractContent = `# Resúmenes de Sesiones — Copilot Logs\n\n`;
            abstractContent += `> **Generado automáticamente** por SnapshotManager + LLM  \n`;
            abstractContent += `> **Modelo**: ${selectedModelName}  \n`;
            abstractContent += `> **Actualizado**: ${new Date().toISOString()}\n\n`;
            abstractContent += `---\n\n`;

            for (const metadata of snapshots.slice(0, 10)) { // Limitar a 10 más recientes
                const snapshot = await this.getSnapshot(metadata.id);
                if (!snapshot) continue;

                let summary: string;

                if (models.length > 0) {
                    // Usar LLM para generar resumen semántico
                    summary = await this.generateLLMSummary(models[0], snapshot);
                } else {
                    // Fallback: resumen básico sin LLM
                    summary = this.generateBasicSummary(snapshot);
                }

                abstractContent += `## ${metadata.id}\n\n`;
                abstractContent += `**${metadata.name}**\n\n`;
                abstractContent += summary;
                abstractContent += `\n\n---\n\n`;
            }

            abstractContent += `*Generado por Aleph Scriptorium v1.0.0-beta.1*\n`;

            // Guardar ABSTRACT.md
            const abstractPath = path.join(this.snapshotsPath, 'ABSTRACT.md');
            fs.writeFileSync(abstractPath, abstractContent);
            
            this.outputChannel.appendLine(`✅ ABSTRACT.md generado con ${snapshots.length} snapshots`);
            return abstractPath;

        } catch (error) {
            this.outputChannel.appendLine(`Error generando abstract: ${error}`);
            return null;
        }
    }

    /**
     * Generar resumen usando LLM
     */
    private async generateLLMSummary(model: vscode.LanguageModelChat, snapshot: Snapshot): Promise<string> {
        try {
            // Extraer los primeros mensajes de usuario para contexto
            const userMessages = snapshot.requests
                .flatMap(r => r.userMessages || [])
                .slice(0, 5)
                .join('\n---\n');

            const prompt = [
                vscode.LanguageModelChatMessage.User(
                    `Eres un asistente que genera resúmenes concisos de sesiones de desarrollo.
                    
Genera un resumen de 2-3 párrafos para la siguiente sesión de Copilot Chat.
El resumen debe incluir:
1. Tema principal de la sesión
2. Conceptos clave discutidos
3. Archivos o áreas del código tocadas (si se mencionan)

Responde SOLO con el resumen, sin encabezados adicionales.

Sesión "${snapshot.metadata.name}" (${snapshot.metadata.requestCount} requests):

${userMessages}`
                )
            ];

            const response = await model.sendRequest(prompt, {}, new vscode.CancellationTokenSource().token);
            
            let summary = '';
            for await (const fragment of response.text) {
                summary += fragment;
            }
            
            return summary || this.generateBasicSummary(snapshot);

        } catch (error) {
            this.outputChannel.appendLine(`LLM summary failed, using fallback: ${error}`);
            return this.generateBasicSummary(snapshot);
        }
    }

    /**
     * Generar resumen básico sin LLM (fallback)
     */
    private generateBasicSummary(snapshot: Snapshot): string {
        const { metadata, requests } = snapshot;
        
        // Extraer palabras clave de los mensajes
        const allText = requests
            .flatMap(r => r.userMessages || [])
            .join(' ')
            .toLowerCase();
        
        // Estadísticas básicas
        const lines = [
            `Sesión con ${metadata.requestCount} requests usando ${metadata.models.join(', ') || 'modelo desconocido'}.`,
            `Tokens utilizados: ${metadata.totalTokens.prompt} prompt, ${metadata.totalTokens.completion} completion.`
        ];

        if (metadata.linkedBacklog) {
            lines.push(`Vinculado a backlog: ${metadata.linkedBacklog}`);
        }

        if (metadata.description) {
            lines.push(`\n${metadata.description}`);
        }

        return lines.join('\n');
    }

    private formatTimestamp(date: Date): string {
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}`;
    }

    private sanitizeName(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 50);
    }
}

// ============================================================================
// Singleton accessor
// ============================================================================

let managerInstance: SnapshotManager | null = null;

/**
 * Get the SnapshotManager singleton
 */
export function getSnapshotManager(outputChannel?: vscode.OutputChannel): SnapshotManager {
    if (!managerInstance) {
        managerInstance = SnapshotManager.getInstance(undefined, outputChannel);
    }
    return managerInstance;
}
