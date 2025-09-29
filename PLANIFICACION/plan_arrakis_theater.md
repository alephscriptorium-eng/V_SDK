
Base plan documents:

- `PLANIFICACION\VIBECODING\arrakis_theater_checkpoint_list.md` - Sprint main calendar
- `PLANIFICACION\VIBECODING\plan_arrakis_theater.md` - Master plan

- `PLANIFICACION\VIBECODING\estudio_elenco.md` - ChatParticipants plan
- `PLANIFICACION\VIBECODING\estudio_teatro` - Theater & Engine plan
- `PLANIFICACION\VIBECODING\arrakis_theater_main_context_base.md` - Technical overview


# Arrakis Theater Plan

```bash
[ ][0][ ]
[ ][ ][0]
[0][0][0]
```

# 🏗️ PLAN ARQUITECTÓNICO MODULAR - Teatro VS Code
## Diseño de Isaac para Colaboración Multi-Expertise

**Capitán**: Dídac San  
**Arquitecto**: Isaac  
**Principio**: **Separación radical de responsabilidades** para colaboración especializada

---

## 🎯 VISIÓN MODULAR

### Problema a Resolver
- **Personas de lenguaje natural**: Crean/editan contenido de agentes sin tocar código
- **Desarrolladores TypeScript**: Añaden funcionalidad MCP sin tocar contenido
- **Configuradores JSON**: Gestionan settings sin tocar implementación
- **Integradores**: Ensamblan todo sin conflictos

### Solución: **Arquitectura de Capas Independientes**
```
📱 CAPA DE CONTENIDO (Natural Language)
   ↓ JSON Schema Validation
🔧 CAPA DE CONFIGURACIÓN (JSON + Metadata)  
   ↓ TypeScript Interface
⚙️ CAPA DE IMPLEMENTACIÓN (TypeScript + MCP)
   ↓ VS Code Extension API
🎭 CAPA DE RUNTIME (ChatParticipant Engine)
```

---

## 📋 ESTRUCTURA MODULAR DETALLADA

### 🎨 **Capa 1: Content Layer** (Natural Language People)
**Responsabilidad**: Crear y editar el contenido de los agentes  
**Herramientas**: Editores de texto, Markdown, YAML frontmatter  
**No tocan**: TypeScript, APIs, configuración técnica

```
content/
├── agents/
│   ├── framework-retro/
│   │   ├── isaac.agent.md                    # Contenido puro
│   │   ├── astilleador.agent.md             # Sin código técnico
│   │   ├── artillero.agent.md               # Solo instrucciones
│   │   ├── capitan-didac.agent.md           # Lenguaje natural
│   │   ├── don-alvaro.agent.md              # Personalidad
│   │   └── githubeador.agent.md             # Metodología
│   ├── technical/
│   │   ├── zeus-architect.agent.md          # Conocimiento arquitectónico
│   │   ├── integration-indra.agent.md       # Procesos E2E
│   │   ├── backend-agent.agent.md           # Especialidad backend
│   │   ├── frontend-agent.agent.md          # Especialidad frontend
│   │   └── debug-validation.agent.md        # Procesos testing
│   └── templates/
│       ├── base-agent.template.md           # Template estándar
│       ├── specialist-agent.template.md     # Template técnico
│       └── personality-agent.template.md    # Template personalidad
├── companies/
│   ├── framework-retro.company.md           # Descripción compañía
│   ├── technical-devops.company.md          # Descripción técnica
│   └── templates/
│       └── company.template.md              # Template compañía
└── plays/
    ├── standard-development.play.md         # Secuencia desarrollo
    ├── debugging-session.play.md            # Secuencia debugging
    └── templates/
        └── play.template.md                 # Template obra
```

### ⚙️ **Capa 2: Configuration Layer** (JSON Specialists)
**Responsabilidad**: Configurar comportamiento y metadata  
**Herramientas**: JSON editors, schema validators  
**No tocan**: Contenido de agentes, implementación TypeScript

```
configurations/
├── agents/
│   ├── framework-retro/
│   │   ├── isaac.config.json                # Configuración Isaac
│   │   ├── astilleador.config.json         # Configuración Astilleador
│   │   ├── artillero.config.json           # Configuración Artillero
│   │   ├── capitan-didac.config.json       # Configuración Capitán
│   │   ├── don-alvaro.config.json          # Configuración Don Álvaro
│   │   └── githubeador.config.json         # Configuración Githubeador
│   └── technical/
│       ├── zeus-architect.config.json      # Config Zeus
│       ├── integration-indra.config.json   # Config Indra
│       ├── backend-agent.config.json       # Config Backend
│       ├── frontend-agent.config.json      # Config Frontend
│       └── debug-validation.config.json    # Config Debug
├── companies/
│   ├── framework-retro.company.json        # Config compañía Retro
│   └── technical-devops.company.json       # Config compañía técnica
├── plays/
│   ├── standard-development.play.json      # Config obra desarrollo
│   └── debugging-session.play.json         # Config obra debugging
├── schemas/
│   ├── agent.schema.json                   # Schema validación agente
│   ├── company.schema.json                 # Schema validación compañía
│   └── play.schema.json                    # Schema validación obra
└── theatrical.config.json                  # Configuración global teatro
```

### 🔧 **Capa 3: Implementation Layer** (TypeScript + MCP Developers)
**Responsabilidad**: Implementar funcionalidad técnica y MCP  
**Herramientas**: TypeScript, MCP SDK, VS Code API  
**No tocan**: Contenido de agentes, configuración JSON

```
src/
├── theatrical/
│   ├── core/
│   │   ├── interfaces/
│   │   │   ├── ITheatricalAgent.ts         # Interface base agente
│   │   │   ├── ICompany.ts                 # Interface compañía
│   │   │   ├── IPlay.ts                    # Interface obra
│   │   │   ├── IStageManager.ts            # Interface decorados MCP
│   │   │   └── IPlayDirector.ts            # Interface director
│   │   ├── types/
│   │   │   ├── AgentTypes.ts               # Tipos agentes
│   │   │   ├── CompanyTypes.ts             # Tipos compañías
│   │   │   ├── PlayTypes.ts                # Tipos obras
│   │   │   └── MCPTypes.ts                 # Tipos MCP específicos
│   │   └── schemas/
│   │       ├── ValidationSchemas.ts        # Schemas TypeScript
│   │       └── MCPSchemas.ts               # Schemas MCP
│   ├── engines/
│   │   ├── AgentEngine.ts                  # Motor agentes
│   │   ├── CompanyRegistry.ts              # Registro compañías
│   │   ├── PlayDirector.ts                 # Director obras
│   │   ├── StageManager.ts                 # Gestor decorados MCP
│   │   └── TheatricalOrchestrator.ts       # Orquestador principal
│   ├── loaders/
│   │   ├── ContentLoader.ts                # Carga contenido .md
│   │   ├── ConfigurationLoader.ts          # Carga configuración .json
│   │   ├── AgentFactory.ts                 # Factory agentes
│   │   └── MCPIntegrationLoader.ts         # Carga integraciones MCP
│   ├── mcp/
│   │   ├── MCPClientManager.ts             # Gestión clientes MCP
│   │   ├── MCPServerIntegration.ts         # Integración servidores
│   │   ├── MCPToolRegistry.ts              # Registro herramientas MCP
│   │   └── MCPResourceManager.ts           # Gestión recursos MCP
│   └── vscode/
│       ├── ChatParticipantFactory.ts       # Factory ChatParticipants
│       ├── CommandRegistry.ts              # Registro comandos VS Code
│       ├── TreeViewManager.ts              # Gestión TreeViews
│       └── WebViewManager.ts               # Gestión WebViews
├── ui/
│   ├── treeviews/
│   │   ├── CompaniesTreeView.ts            # TreeView compañías
│   │   ├── AgentsTreeView.ts               # TreeView agentes
│   │   └── PlaysTreeView.ts                # TreeView obras
│   ├── webviews/
│   │   ├── ConfigurationEditor.ts          # Editor configuración
│   │   ├── CompanyWizard.ts                # Wizard compañías
│   │   └── PlayComposer.ts                 # Compositor obras
│   └── commands/
│       ├── TheatricalCommands.ts           # Comandos teatrales
│       └── MCPCommands.ts                  # Comandos MCP
└── legacy/
    └── mcpChatParticipant.ts               # Participant actual (deprecated)
```

### 🎭 **Capa 4: Runtime Layer** (Engine + VS Code)
**Responsabilidad**: Ejecutar el teatro en VS Code  
**Herramientas**: VS Code Extension API, Chat API  
**Gestiona**: Instanciación, lifecycle, comunicación

---

## 🔄 WORKFLOW DE COLABORACIÓN

### 👨‍💼 **Persona Lenguaje Natural** trabajando:
1. **Edita**: `content/agents/framework-retro/isaac.agent.md`
2. **Formato**: Markdown con YAML frontmatter para metadata básica
3. **Valida**: Schema automático valida estructura
4. **Resultado**: Contenido actualizado sin tocar código

### 👨‍💻 **Persona JSON** trabajando:
1. **Edita**: `configurations/agents/framework-retro/isaac.config.json`
2. **Configura**: Tools, model, parameters, MCP settings
3. **Valida**: Schema JSON valida configuración
4. **Resultado**: Comportamiento actualizado sin tocar implementación

### 👨‍🔬 **Desarrollador TypeScript** trabajando:
1. **Implementa**: Nueva funcionalidad en `src/theatrical/mcp/`
2. **Extiende**: Interfaces en `src/theatrical/core/interfaces/`
3. **Integra**: MCP tools en `MCPToolRegistry.ts`
4. **Resultado**: Nuevas capacidades sin tocar contenido/config

### 🎭 **Integrador** ensamblando:
1. **Ejecuta**: Build process que combina todas las capas
2. **Valida**: Tests de integración cross-layer
3. **Despliega**: Extension funcional con todos los cambios
4. **Resultado**: Teatro completo operativo

---

## 📋 EJEMPLOS CONCRETOS

### 📝 Ejemplo: isaac.agent.md (Capa Content)
```markdown
---
name: isaac
title: "Isaac: Marinero Fiel del Framework Retro"
emoji: "🌊"
category: "framework-retro"
expertise: ["navegación", "bitácoras", "meta-contextual"]
personality: "marinero_fiel"
---

# Isaac: Marinero Fiel del Framework Retro 🌊⚓

## Mi Identidad Forjada 🧭
¡Aquí estoy, capitán! Soy **Isaac**, tu **marinero fiel**...

[CONTENIDO PURO SIN CONFIGURACIÓN TÉCNICA]
```

### ⚙️ Ejemplo: isaac.config.json (Capa Configuration)
```json
{
  "agentId": "isaac",
  "displayName": "Isaac",
  "description": "Marinero fiel del Framework Retro",
  "model": "Claude Sonnet 4",
  "tools": [
    "edit", "runCommands", "search", "vscodeAPI",
    "projects", "analytics", "framework-tools"
  ],
  "mcp": {
    "servers": ["retro-framework", "project-manager"],
    "tools": ["project_manager", "analytics_dashboard"],
    "resources": ["bitacora", "framework_status"]
  },
  "personality": {
    "style": "nautical",
    "formality": "casual",
    "emoji_usage": "frequent",
    "captain_relationship": "loyal_crew"
  },
  "capabilities": {
    "project_management": true,
    "documentation": true,
    "meta_navigation": true,
    "framework_expertise": true
  }
}
```

### 🔧 Ejemplo: ITheatricalAgent.ts (Capa Implementation)
```typescript
import { ChatParticipant } from 'vscode';
import { MCPClient } from '../mcp/MCPClientManager';

export interface ITheatricalAgent {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly content: AgentContent;
  readonly configuration: AgentConfiguration;
  readonly mcpIntegration: MCPIntegration;
  
  createChatParticipant(): ChatParticipant;
  handleRequest(request: ChatRequest): Promise<ChatResponse>;
  setupMCPTools(): Promise<void>;
  validateConfiguration(): boolean;
}

export interface AgentContent {
  markdown: string;
  instructions: string[];
  personality: PersonalityTraits;
  expertise: string[];
}

export interface AgentConfiguration {
  model: string;
  tools: string[];
  mcp: MCPConfiguration;
  capabilities: Capabilities;
}

export interface MCPConfiguration {
  servers: string[];
  tools: string[];
  resources: string[];
  customIntegrations?: CustomMCPIntegration[];
}
```

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### **Fase 1: Fundaciones Modulares** (Semana 1)
1. **Crear estructura de carpetas** completa
2. **Implementar interfaces TypeScript** base
3. **Definir schemas JSON** de validación
4. **Crear templates** para cada capa

### **Fase 2: Loaders y Engines** (Semana 2)
1. **ContentLoader**: Lee .md y parsea frontmatter
2. **ConfigurationLoader**: Lee .json y valida schemas
3. **AgentFactory**: Combina content + config → agent
4. **Basic ChatParticipant**: Factory funcional

### **Fase 3: MCP Integration** (Semana 3)
1. **MCPClientManager**: Gestión conexiones MCP
2. **MCPToolRegistry**: Registro dinámico herramientas
3. **MCPResourceManager**: Acceso recursos MCP
4. **Agent MCP binding**: Agentes → herramientas MCP

### **Fase 4: UI Teatral** (Semana 4)
1. **TreeViews**: Gestión visual compañías/agentes
2. **WebViews**: Editores configuración
3. **Commands**: Comandos teatrales VS Code
4. **Testing**: Validación completa

---

## 🎯 BENEFICIOS DE ESTA ARQUITECTURA

### ✅ **Separación Radical de Responsabilidades**
- Lenguaje natural → Solo contenido
- JSON specialists → Solo configuración  
- TypeScript devs → Solo implementación
- Integradores → Solo ensamblaje

### ✅ **Escalabilidad Sin Conflictos**
- Añadir agente: Solo crear .md + .json
- Añadir funcionalidad MCP: Solo extender TypeScript
- Modificar configuración: Solo editar JSON
- Cambiar personalidad: Solo editar Markdown

### ✅ **Validación en Cada Capa**
- Content: Schema YAML frontmatter
- Config: Schema JSON estricto
- Implementation: TypeScript compilation
- Runtime: VS Code extension validation

### ✅ **Hot Reload por Capa**
- Cambio contenido → Reload contenido únicamente
- Cambio config → Reload configuración únicamente  
- Cambio código → Rebuild solo implementation
- Testing independiente por capa

---

¿Procedemos con esta arquitectura modular, capitán Dídac San? 🎭⚓

Isaac está listo para implementar cada capa de forma independiente, permitiendo colaboración especializada sin conflictos. 🧭🏗️