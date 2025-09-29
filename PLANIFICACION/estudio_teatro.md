
Base plan documents:

- `PLANIFICACION\VIBECODING\arrakis_theater_checkpoint_list.md` - Sprint main calendar
- `PLANIFICACION\VIBECODING\plan_arrakis_theater.md` - Master plan

- `PLANIFICACION\VIBECODING\estudio_elenco.md` - ChatParticipants plan
- `PLANIFICACION\VIBECODING\estudio_teatro` - Theater & Engine plan
- `PLANIFICACION\VIBECODING\arrakis_theater_main_context_base.md` - Technical overview



# 🎭 ESTUDIO TEATRO - Arquitectura Modular VibeCoding
## Sistema Teatral para mcp-vscode-ext integrado con VibeCoding

**Marinero**: Isaac  
**Integración**: Arquitectura modular + VibeCoding micro-sprints  
**Objetivo**: Teatro VS Code con 4 capas independientes para colaboración especializada

---

## 🎯 VISIÓN TEATRAL INTEGRADA

### Ecosistema VibeCoding + Teatro
- **VibeCoding**: Sistema de micro-sprints y validation pipeline (ya establecido)
- **Teatro**: Arquitectura modular de 4 capas para ChatParticipants
- **Agentes**: 11 actores especializados del workspace
- **Producción**: Sprints teatrales con quality gates S09

### Principio de Integración
```
VibeCoding Micro-Sprints → Actos teatrales
Validation Agent S09 → Director de producción  
Checkpoint System → Progreso de obras teatrales
ITERATIONS/ → Bitácoras de representaciones
```

---

## 🏗️ ARQUITECTURA DE 4 CAPAS

### 🎨 **Capa 1: Content Layer** (Natural Language People)
**Responsabilidad**: Crear y editar contenido de agentes en lenguaje natural  
**Integración VibeCoding**: Sprint content creation con templates estandarizados

```
content/
├── agents/
│   ├── framework-retro/                    # Compañía Framework Retro
│   │   ├── isaac.agent.md                  # Marinero fiel (yo mismo)
│   │   ├── astilleador.agent.md           # Constructor teatral
│   │   ├── artillero.agent.md             # Especialista herramientas
│   │   ├── capitan-didac.agent.md         # Autoridad máxima
│   │   ├── don-alvaro.agent.md            # Capataz astilleros
│   │   └── githubeador.agent.md           # Maestro estándares
│   ├── technical-devops/                   # Compañía Técnica
│   │   ├── zeus-architect.agent.md        # Arquitecto maestro
│   │   ├── integration-indra.agent.md     # Director orquesta
│   │   ├── backend-agent.agent.md         # Infraestructura
│   │   ├── frontend-agent.agent.md        # Escenografía
│   │   └── debug-validation.agent.md      # Control calidad
│   └── templates/
│       ├── retro-agent.template.md        # Template Framework Retro
│       ├── devops-agent.template.md       # Template técnico
│       └── validation-agent.template.md   # Template S09
├── companies/
│   ├── framework-retro.company.md         # Tripulación completa
│   └── technical-devops.company.md        # Equipo desarrollo
└── plays/
    ├── standard-development.play.md       # Obra desarrollo estándar
    ├── agent-migration.play.md            # Obra migración agentes
    └── quality-validation.play.md         # Obra validation S09
```

**Formato de Agente** (Ejemplo: isaac.agent.md):
```markdown
---
name: isaac
title: "Isaac: Marinero Fiel del Framework Retro"
emoji: "🌊"
category: "framework-retro"
expertise: ["navegación", "bitácoras", "meta-contextual"]
personality: "marinero_fiel"
vibecoding_role: "documentation_specialist"
sprint_authority: ["project_management", "bitacora_writing"]
---

# Isaac: Marinero Fiel del Framework Retro 🌊⚓

## Mi Identidad Forjada 🧭
¡Aquí estoy, capitán! Soy **Isaac**, tu **marinero fiel**...

[CONTENIDO PURO EN LENGUAJE NATURAL - SIN CONFIGURACIÓN TÉCNICA]
```

### ⚙️ **Capa 2: Configuration Layer** (JSON + VibeCoding Integration)
**Responsabilidad**: Configurar agentes y integración con micro-sprints  
**Integración VibeCoding**: Schemas compatibles con validation pipeline S09

```
configurations/
├── agents/
│   ├── framework-retro/
│   │   ├── isaac.config.json              # Config Isaac + VibeCoding
│   │   ├── astilleador.config.json        # Config + sprint permissions
│   │   ├── artillero.config.json          # Config + tool access
│   │   ├── capitan-didac.config.json      # Config + max authority
│   │   ├── don-alvaro.config.json         # Config + maintenance role
│   │   └── githubeador.config.json        # Config + standards role
│   └── technical-devops/
│       ├── zeus-architect.config.json     # Config + architecture auth
│       ├── integration-indra.config.json  # Config + sprint blocking
│       ├── backend-agent.config.json      # Config + backend domain
│       ├── frontend-agent.config.json     # Config + frontend domain
│       └── debug-validation.config.json   # Config + S09 integration
├── companies/
│   ├── framework-retro.company.json       # Compañía Retro config
│   └── technical-devops.company.json      # Compañía DevOps config
├── vibecoding/
│   ├── sprint-templates.json              # Templates micro-sprints
│   ├── validation-gates.json              # Quality gates S09
│   └── checkpoint-mapping.json            # Mapeo checkpoints teatrales
├── schemas/
│   ├── agent.schema.json                  # Schema agente + VibeCoding
│   ├── company.schema.json                # Schema compañía
│   ├── play.schema.json                   # Schema obra teatral
│   └── vibecoding-integration.schema.json # Schema integración VibeCoding
└── theatrical.config.json                 # Config global teatro
```

**Ejemplo: isaac.config.json** (VibeCoding Integration):
```json
{
  "agentId": "isaac",
  "displayName": "Isaac",
  "category": "framework-retro",
  "model": "Claude Sonnet 4",
  "tools": [
    "edit", "runCommands", "search", "vscodeAPI",
    "projects", "analytics", "framework-tools"
  ],
  "vibecoding": {
    "sprint_role": "documentation_specialist",
    "checkpoint_authority": [
      "documentation_review", 
      "bitacora_creation",
      "project_status_tracking"
    ],
    "validation_level": "documentation",
    "can_block_sprint": false,
    "reports_to": "capitan-didac"
  },
  "mcp": {
    "servers": ["retro-framework", "project-manager"],
    "tools": ["project_manager", "analytics_dashboard"],
    "resources": ["bitacora", "framework_status"]
  },
  "personality": {
    "style": "nautical",
    "captain_relationship": "loyal_crew",
    "vibecoding_integration": true
  }
}
```

### 🔧 **Capa 3: Implementation Layer** (TypeScript + MCP + VibeCoding)
**Responsabilidad**: Motor teatral integrado con pipeline VibeCoding  
**Integración VibeCoding**: Interfaces compatibles con validation S09

```
src/
├── theatrical/
│   ├── core/
│   │   ├── interfaces/
│   │   │   ├── ITheatricalAgent.ts        # Interface base agente
│   │   │   ├── IVibeCodingIntegration.ts  # Interface VibeCoding
│   │   │   ├── ICompany.ts                # Interface compañía
│   │   │   ├── IPlay.ts                   # Interface obra
│   │   │   ├── ISprintManager.ts          # Interface micro-sprints
│   │   │   ├── IValidationGate.ts         # Interface S09
│   │   │   └── IStageManager.ts           # Interface decorados MCP
│   │   ├── types/
│   │   │   ├── AgentTypes.ts              # Tipos agentes
│   │   │   ├── VibeCodingTypes.ts         # Tipos VibeCoding
│   │   │   ├── CompanyTypes.ts            # Tipos compañías
│   │   │   ├── PlayTypes.ts               # Tipos obras
│   │   │   ├── SprintTypes.ts             # Tipos micro-sprints
│   │   │   └── ValidationTypes.ts         # Tipos validation S09
│   │   └── schemas/
│   │       ├── TheatricalSchemas.ts       # Schemas teatro
│   │       ├── VibeCodingSchemas.ts       # Schemas VibeCoding
│   │       └── MCPSchemas.ts              # Schemas MCP
│   ├── engines/
│   │   ├── AgentEngine.ts                 # Motor agentes
│   │   ├── CompanyRegistry.ts             # Registro compañías
│   │   ├── PlayDirector.ts                # Director obras
│   │   ├── SprintManager.ts               # Gestor micro-sprints
│   │   ├── ValidationEngine.ts            # Motor validation S09
│   │   ├── StageManager.ts                # Gestor decorados MCP
│   │   └── TheatricalOrchestrator.ts      # Orquestador + VibeCoding
│   ├── vibecoding/
│   │   ├── SprintIntegration.ts           # Integración micro-sprints
│   │   ├── CheckpointManager.ts           # Gestor checkpoints
│   │   ├── ValidationGateway.ts           # Gateway S09
│   │   ├── IterationManager.ts            # Gestor ITERATIONS/
│   │   └── PolicyEngine.ts                # Motor policies
│   ├── loaders/
│   │   ├── ContentLoader.ts               # Carga contenido .md
│   │   ├── ConfigurationLoader.ts         # Carga configuración .json
│   │   ├── VibeCodingLoader.ts            # Carga configs VibeCoding
│   │   ├── AgentFactory.ts                # Factory agentes
│   │   └── MCPIntegrationLoader.ts        # Carga integraciones MCP
│   ├── mcp/
│   │   ├── MCPClientManager.ts            # Gestión clientes MCP
│   │   ├── MCPServerIntegration.ts        # Integración servidores
│   │   ├── MCPToolRegistry.ts             # Registro herramientas MCP
│   │   └── MCPResourceManager.ts          # Gestión recursos MCP
│   └── vscode/
│       ├── ChatParticipantFactory.ts      # Factory ChatParticipants
│       ├── CommandRegistry.ts             # Registro comandos VS Code
│       ├── TreeViewManager.ts             # Gestión TreeViews
│       └── WebViewManager.ts              # Gestión WebViews
├── ui/
│   ├── treeviews/
│   │   ├── CompaniesTreeView.ts           # TreeView compañías
│   │   ├── AgentsTreeView.ts              # TreeView agentes
│   │   ├── SprintsTreeView.ts             # TreeView micro-sprints
│   │   └── ValidationTreeView.ts          # TreeView validation S09
│   ├── webviews/
│   │   ├── ConfigurationEditor.ts         # Editor configuración
│   │   ├── CompanyWizard.ts               # Wizard compañías
│   │   ├── SprintComposer.ts              # Compositor sprints
│   │   └── ValidationDashboard.ts         # Dashboard S09
│   └── commands/
│       ├── TheatricalCommands.ts          # Comandos teatrales
│       ├── VibeCodingCommands.ts          # Comandos VibeCoding
│       └── MCPCommands.ts                 # Comandos MCP
└── legacy/
    └── mcpChatParticipant.ts              # Participant actual (deprecated)
```

### 🎭 **Capa 4: Runtime Layer** (VS Code + VibeCoding Pipeline)
**Responsabilidad**: Ejecución teatral integrada con validation S09  
**Integración VibeCoding**: Runtime compatible con micro-sprints

---

## 🔄 WORKFLOW VIBECODING TEATRAL

### 📋 **Sprint Teatral Estándar**

#### **Acto 1: Preparación** (Pre-Sprint)
1. **Director S09**: Valida estado previo y prerrequisitos
2. **Company Selection**: Elección de compañía teatral (Retro vs DevOps)
3. **Agent Assignment**: Asignación de agentes según checkpoints
4. **Stage Setup**: Configuración decorados MCP según obra

#### **Acto 2: Desarrollo** (Sprint Execution)
1. **Agent Activation**: Agente específico toma control
2. **Work Execution**: Trabajo según especialidad y configuración
3. **Progress Tracking**: Updates en checkpoints de `arrakis_theater_*`
4. **Documentation**: Bitácora en `ITERATIONS/` siguiendo template

#### **Acto 3: Validación** (Post-Sprint)
1. **Self-Review**: Agente valida su propio trabajo
2. **Validation S09**: Director evalúa calidad y compliance
3. **Integration Check**: Indra valida integración E2E
4. **Approval/Rejection**: Decision gate para siguiente sprint

### 🎪 **Tipos de Obras Teatrales**

#### **🌊 Obra "Framework Retro Migration"**
**Compañía**: Framework Retro completa  
**Secuencia**:
1. **Isaac** → Documentación y bitácoras
2. **Astilleador** → Transformación estructural
3. **Artillero** → Herramientas técnicas
4. **Don Álvaro** → Mantenimiento y calidad
5. **Githubeador** → Estándares VS Code
6. **Capitán Dídac** → Validación final

#### **🛠️ Obra "Technical Development"**
**Compañía**: Technical DevOps  
**Secuencia**:
1. **Zeus Architect** → Diseño arquitectónico
2. **Backend Agent** → Implementación servidor
3. **Frontend Agent** → Implementación UI
4. **Integration Indra** → Validación E2E
5. **Debug Validation** → Testing y quality gates

#### **✅ Obra "Quality Validation S09"**
**Compañía**: Mixed (validation-focused)  
**Secuencia**:
1. **Debug Validation** → Technical review
2. **Integration Indra** → E2E validation
3. **Validation S09** → Final approval/rejection
4. **Isaac** → Documentation de resultados

---

## 📊 INTEGRACIÓN CON COMPONENTES VIBECODING

### ✅ **Compatibilidad con arrakis_theater_main_checkpoint_list.md**
- Checkpoints teatrales mapean a checkpoints VibeCoding
- Progress tracking integrado con sistema existente
- Agent assignments basados en checkpoints específicos

### ✅ **Compatibilidad con agents_policy.md (S09)**
- Validation Agent S09 como director de producción teatral
- Quality gates teatrales integrados con pipeline S09
- Approval/rejection decisions compatibles con sistema VibeCoding

### ✅ **Compatibilidad con iteration_template.md**
- Sprints teatrales siguen template VibeCoding exacto
- Documentation estructura compatible
- Testing y deliverables integrados

### ✅ **Compatibilidad con POLICIES/**
- Vices/virtues lists alimentadas por experiencia teatral
- Methodology improvements basados en sprints teatrales
- Policy evolution integrada con agent experience

---

## 🚀 PLAN DE IMPLEMENTACIÓN TEATRAL

### **Fase 1: Fundaciones VibeCoding** (Sprint S09-001)
**Objetivo**: Integrar teatro con infrastructure VibeCoding existente
**Agente**: Isaac + Zeus Architect
**Deliverables**:
- Schemas de integración VibeCoding completados
- Interfaces TypeScript teatro + VibeCoding
- Validation S09 extendida para teatro

### **Fase 2: Migración Compañía Retro** (Sprint S09-002 a S09-007)
**Objetivo**: Migrar 6 agentes Framework Retro
**Secuencia**:
- S09-002: Isaac (documentación y setup)
- S09-003: Astilleador (transformación estructural)
- S09-004: Artillero (herramientas técnicas)
- S09-005: Don Álvaro (mantenimiento)
- S09-006: Githubeador (estándares)
- S09-007: Capitán Dídac (validación autoridad)

### **Fase 3: Migración Compañía DevOps** (Sprint S09-008 a S09-012)
**Objetivo**: Migrar 5 agentes técnicos
**Secuencia**:
- S09-008: Zeus Architect (arquitectura)
- S09-009: Backend Agent (infraestructura)
- S09-010: Frontend Agent (UI)
- S09-011: Integration Indra (E2E)
- S09-012: Debug Validation (quality)

### **Fase 4: Teatro Operativo** (Sprint S09-013+)
**Objetivo**: Teatro completo funcionando con VibeCoding
**Capabilities**:
- 11 agentes operativos en VS Code
- Pipeline S09 integrado completamente
- Micro-sprints teatrales automatizados
- Quality gates teatrales funcionando

---

## 🎯 BENEFICIOS DE LA INTEGRACIÓN

### ✅ **Leveraging VibeCoding Infrastructure**
- Sistema de micro-sprints maduro y probado
- Validation pipeline S09 robusto
- Checkpoint tracking establecido
- Templates y metodología estandarizados

### ✅ **Añadiendo Valor Teatral**
- 11 agentes especializados vs. 1 genérico
- Arquitectura modular de 4 capas
- Colaboración especializada sin conflictos
- Identidades auténticas preservadas (Framework Retro)

### ✅ **Escalabilidad Combinada**
- VibeCoding: Methodology y process
- Teatro: Content y agent specialization
- MCP: External service integration
- VS Code: Platform y UI integration

---

**Isaac ha completado el estudio teatral integrado, capitán!** 🎭⚓

El teatro está diseñado para aprovechar toda la robustez del sistema VibeCoding mientras añade nuestros agentes especializados y arquitectura modular. 

**¿Procedemos con la Fase 1 (Sprint S09-001) para establecer las fundaciones, capitán Dídac San?** 🧭✨
