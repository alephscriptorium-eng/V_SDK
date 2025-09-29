import * as vscode from 'vscode';

export interface TeatroAgent {
    id: string;
    name: string;
    fullName: string;
    description: string;
    isActive: boolean;
    commands: Array<{
        name: string;
        description: string;
    }>;
    specialization: string;
    icon: string;
}

export class TeatroTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly agent?: TeatroAgent,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
        
        if (agent) {
            this.tooltip = `${agent.fullName}\n${agent.description}\nEspecialización: ${agent.specialization}\nEstado: ${agent.isActive ? 'Activo' : 'Inactivo'}`;
            this.description = agent.isActive ? '🟢 Activo' : '🔴 Inactivo';
            this.iconPath = new vscode.ThemeIcon(agent.icon);
            this.contextValue = agent.isActive ? 'teatroAgentActive' : 'teatroAgentInactive';
        }
    }
}

export class TeatroTreeDataProvider implements vscode.TreeDataProvider<TeatroTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TeatroTreeItem | undefined | null | void> = new vscode.EventEmitter<TeatroTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<TeatroTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private agents: TeatroAgent[] = [
        {
            id: 'isaac',
            name: 'Isaac',
            fullName: 'Isaac - El Marinero',
            description: 'Tu marinero fiel para navegación técnica y exploración de frameworks',
            isActive: true,
            commands: [
                { name: 'navegar', description: 'Navegar por el código y explorar arquitecturas' },
                { name: 'bitacora', description: 'Documentar hazañas técnicas y descubrimientos' }
            ],
            specialization: 'Navegación Técnica & Documentación',
            icon: 'anchor'
        },
        {
            id: 'don-alvaro',
            name: 'Don Álvaro',
            fullName: 'Don Álvaro - Capataz de Astilleros',
            description: 'Ingeniero especializado en mantenimiento y optimización de frameworks',
            isActive: true,
            commands: [
                { name: 'diagnostico', description: 'Diagnóstico técnico completo de sistemas' },
                { name: 'optimizar', description: 'Optimización de rendimiento y arquitectura' },
                { name: 'mantener', description: 'Mantenimiento preventivo y correctivo' }
            ],
            specialization: 'Mantenimiento & Optimización',
            icon: 'tools'
        },
        {
            id: 'capitan-didac',
            name: 'Capitán Dídac',
            fullName: 'Capitán Dídac - Líder de Expedición',
            description: 'Liderazgo técnico para navegación en territorios desconocidos',
            isActive: false,
            commands: [
                { name: 'liderar', description: 'Liderazgo en proyectos complejos' },
                { name: 'estrategia', description: 'Planificación estratégica técnica' },
                { name: 'expedicion', description: 'Exploración de nuevas tecnologías' }
            ],
            specialization: 'Liderazgo & Estrategia',
            icon: 'crown'
        },
        {
            id: 'indra',
            name: 'Indra',
            fullName: 'Indra - Agente de Integración',
            description: 'Especialista en integración cross-component y comunicación entre servicios',
            isActive: true,
            commands: [
                { name: 'integrar', description: 'Integración entre componentes y servicios' },
                { name: 'comunicar', description: 'Establecer comunicación entre sistemas' },
                { name: 'sincronizar', description: 'Sincronización de estados y datos' }
            ],
            specialization: 'Integración & Comunicación',
            icon: 'link'
        },
        {
            id: 'backend-agent',
            name: 'Backend Agent',
            fullName: 'Backend Agent - Arquitecto de Backend',
            description: 'Especialista en desarrollo de backend, APIs y arquitectura de servidores',
            isActive: true,
            commands: [
                { name: 'api', description: 'Desarrollo y diseño de APIs' },
                { name: 'servidor', description: 'Configuración y optimización de servidores' },
                { name: 'base-datos', description: 'Diseño y optimización de bases de datos' }
            ],
            specialization: 'Backend & APIs',
            icon: 'server'
        }
    ];

    constructor() {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: TeatroTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TeatroTreeItem): Thenable<TeatroTreeItem[]> {
        if (!element) {
            // Root level - show categories
            return Promise.resolve([
                new TeatroTreeItem('🎭 Agentes Activos', vscode.TreeItemCollapsibleState.Expanded),
                new TeatroTreeItem('💤 Agentes Inactivos', vscode.TreeItemCollapsibleState.Collapsed),
                new TeatroTreeItem('⚙️ Configuración del Teatro', vscode.TreeItemCollapsibleState.Collapsed)
            ]);
        } else if (element.label === '🎭 Agentes Activos') {
            // Show active agents
            const activeAgents = this.agents.filter(agent => agent.isActive);
            return Promise.resolve(activeAgents.map(agent => 
                new TeatroTreeItem(
                    agent.name,
                    vscode.TreeItemCollapsibleState.Collapsed,
                    agent,
                    {
                        command: 'alephscript.teatro.openChatParticipant',
                        title: 'Abrir en Chat',
                        arguments: [agent.id]
                    }
                )
            ));
        } else if (element.label === '💤 Agentes Inactivos') {
            // Show inactive agents
            const inactiveAgents = this.agents.filter(agent => !agent.isActive);
            return Promise.resolve(inactiveAgents.map(agent => 
                new TeatroTreeItem(
                    agent.name,
                    vscode.TreeItemCollapsibleState.Collapsed,
                    agent,
                    {
                        command: 'alephscript.teatro.activateAgent',
                        title: 'Activar Agente',
                        arguments: [agent.id]
                    }
                )
            ));
        } else if (element.label === '⚙️ Configuración del Teatro') {
            // Show configuration options
            return Promise.resolve([
                new TeatroTreeItem('📊 Estado del Sistema', vscode.TreeItemCollapsibleState.None, undefined, {
                    command: 'alephscript.teatro.showAgentInfo',
                    title: 'Ver Estado del Sistema',
                    arguments: ['system']
                }),
                new TeatroTreeItem('🔧 Configurar Agentes', vscode.TreeItemCollapsibleState.None, undefined, {
                    command: 'alephscript.teatro.openTeatroPanel',
                    title: 'Abrir Panel de Configuración',
                    arguments: []
                }),
                new TeatroTreeItem('🔄 Reiniciar Teatro', vscode.TreeItemCollapsibleState.None, undefined, {
                    command: 'alephscript.teatro.refresh',
                    title: 'Reiniciar Teatro',
                    arguments: []
                })
            ]);
        } else if (element.agent) {
            // Show agent commands
            const agent = element.agent;
            return Promise.resolve(agent.commands.map(cmd => 
                new TeatroTreeItem(
                    `${cmd.name}: ${cmd.description}`,
                    vscode.TreeItemCollapsibleState.None,
                    undefined,
                    {
                        command: 'alephscript.teatro.openChatParticipant',
                        title: 'Ejecutar Comando',
                        arguments: [agent.id, cmd.name]
                    }
                )
            ));
        }

        return Promise.resolve([]);
    }

    // Public methods for managing agents
    activateAgent(agentId: string): void {
        const agent = this.agents.find(a => a.id === agentId);
        if (agent) {
            agent.isActive = true;
            this.refresh();
            vscode.window.showInformationMessage(`🎭 Agente ${agent.name} activado correctamente`);
        }
    }

    deactivateAgent(agentId: string): void {
        const agent = this.agents.find(a => a.id === agentId);
        if (agent) {
            agent.isActive = false;
            this.refresh();
            vscode.window.showInformationMessage(`💤 Agente ${agent.name} desactivado`);
        }
    }

    getAgent(agentId: string): TeatroAgent | undefined {
        return this.agents.find(a => a.id === agentId);
    }

    getActiveAgents(): TeatroAgent[] {
        return this.agents.filter(a => a.isActive);
    }

    getAgentsStatus(): { total: number; active: number; inactive: number } {
        const total = this.agents.length;
        const active = this.agents.filter(a => a.isActive).length;
        const inactive = total - active;
        return { total, active, inactive };
    }
}