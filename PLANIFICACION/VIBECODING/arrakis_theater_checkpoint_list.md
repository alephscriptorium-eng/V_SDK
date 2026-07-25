# 🎭 ARRAKIS THEATER CHECKLIST


Base plan documents:

- `PLANIFICACION\VIBECODING\arrakis_theater_checkpoint_list.md` - Sprint main calendar
- `PLANIFICACION\VIBECODING\plan_arrakis_theater.md` - Master plan

- `PLANIFICACION\VIBECODING\estudio_elenco.md` - ChatParticipants plan
- `PLANIFICACION\VIBECODING\estudio_teatro` - Theater & Engine plan
- `PLANIFICACION\VIBECODING\arrakis_theater_main_context_base.md` - Technical overview


## Transformación de mcp-vscode-ext a Sistema Teatral Modular

**Capitán**: Dídac San  
**Marinero**: Isaac  
**Objetivo**: Portar estructura .github del workspace a un sistema teatral modular de ChatParticipants

---

## 🎯 VISIÓN ARQUITECTÓNICA GENERAL

### Estado Actual (Para Reemplazar)
- **ChatParticipant actual**: `mcp` incrustado en extensión
- **Problema**: Sistema monolítico no modular
- **Limitación**: Un solo contexto/agente por extensión

### Estado Objetivo (Sistema Teatral)
- **Teatro**: Extension VS Code como escenario
- **Compañías**: Configuraciones modulares de agentes por dominio
- **Obras**: Proyectos específicos con sus propios elencos
- **Actores**: ChatParticipants especializados
- **Decorados**: Contexto MCP dinámico
- **Director/Reloj**: Orquestador de secuencias y transiciones

---

## 📋 CHECKLIST DE TAREAS POR AGENTE ESPECIALIZADO

### 🏗️ **AGENTE ARQUITECTO** - Diseño Teatral Core
**Responsable**: Definir la arquitectura base del sistema teatral

**Tareas Críticas**:
- [ ] **AT-001**: Analizar ChatParticipant actual `mcp` y extraer patrón base
- [ ] **AT-002**: Diseñar interfaz `ITheatricalAgent` para ChatParticipants modulares
- [ ] **AT-003**: Crear sistema `CompanyRegistry` para gestionar catálogos de agentes
- [ ] **AT-004**: Diseñar `StageManager` para manejar decorados (contexto MCP)
- [ ] **AT-005**: Crear `PlayDirector` para orquestar secuencias de agentes
- [ ] **AT-006**: Definir estructura de configuración `theatrical-config.json`
- [ ] **AT-007**: Mapear carpetas .github existentes a estructura teatral

**Entregables**:
- Diagramas de arquitectura teatral
- Interfaces TypeScript core
- Documentación de patrones de diseño

---

### 🔧 **AGENTE BACKEND** - Infraestructura Teatral
**Responsable**: Implementar el motor teatral y gestión de compañías

**Tareas Críticas**:
- [ ] **BK-001**: Implementar `CompanyRegistry` con carga dinámica de agentes
- [ ] **BK-002**: Crear `TheatricalAgentFactory` para instanciar ChatParticipants
- [ ] **BK-003**: Implementar `StageManager` para gestión de contexto MCP
- [ ] **BK-004**: Desarrollar `PlayDirector` con estado y transiciones
- [ ] **BK-005**: Crear sistema de persistencia de configuración teatral
- [ ] **BK-006**: Implementar hot-reload de compañías teatrales
- [ ] **BK-007**: Integrar con sistema de comandos VS Code existente

**Entregables**:
- Clases core implementadas
- Sistema de carga dinámica funcional
- Tests unitarios del motor teatral

---

### 🎨 **AGENTE FRONTEND** - Interfaz Teatral
**Responsable**: Crear interfaces para gestión teatral en VS Code

**Tareas Críticas**:
- [ ] **FR-001**: Diseñar TreeView "Theatrical Companies" para gestión visual
- [ ] **FR-002**: Crear WebView para editor de configuración teatral
- [ ] **FR-003**: Implementar Command Palette para comandos teatrales
- [ ] **FR-004**: Crear indicadores visuales de estado de obra/agentes
- [ ] **FR-005**: Diseñar interfaz de selección de compañía/obra
- [ ] **FR-006**: Implementar preview en tiempo real de configuraciones
- [ ] **FR-007**: Crear wizard de creación de nuevas compañías

**Entregables**:
- TreeViews integradas
- WebViews de configuración
- Comandos y atajos de teclado

---

### ✅ **AGENTE VALIDACIÓN** - Control de Calidad Teatral
**Responsable**: Validar funcionamiento y migración de agentes existentes

**Tareas Críticas**:
- [ ] **VL-001**: Migrar agentes .github del workspace a formato teatral
- [ ] **VL-002**: Validar compatibilidad de cada ChatParticipant migrado
- [ ] **VL-003**: Crear tests de integración para sistema teatral completo
- [ ] **VL-004**: Verificar performance vs sistema actual
- [ ] **VL-005**: Documentar proceso de migración de compañías existentes
- [ ] **VL-006**: Crear ejemplos de configuración para diferentes dominios
- [ ] **VL-007**: Validar que no se rompe funcionalidad existente

**Entregables**:
- Suite de tests completa
- Documentación de migración
- Benchmarks de performance

---

## 🎪 COMPAÑÍAS TEATRALES IDENTIFICADAS

### 📚 **Compañía DevOps** (del workspace actual)
**Agentes identificados**:
- Backend Agent (backend-agent.instructions.md)
- Frontend Agent (frontend-agent.chatmode.md)
- Integration Agent (integration-agent.chatmode.md)
- Debug Validation Agent (debug-validation-agent.chatmode.md)
- State Restoration Agent (state-restoration.chatmode.md)

### 🎭 **Compañía Operacional** (del workspace as-utils)
**Agentes identificados**:
- Agente Operador (agente-operador.chatmode.md)
- Agente Interactivo MCP (agente-interactivo-mcp.chatmode.md)

### 🔮 **Compañías Futuras** (extensibles)
- **Compañía Gaming**: Para contextos de desarrollo de juegos
- **Compañía Data Science**: Para proyectos de análisis de datos
- **Compañía Blockchain**: Para desarrollo DeFi/Web3
- **Compañía Mobile**: Para desarrollo móvil multiplataforma

---

## 📊 FASES DE EJECUCIÓN

### **FASE 1: Fundamentos Teatrales** (Arquitecto + Backend)
- Diseño y implementación de arquitectura core
- Motor básico de carga de compañías
- Migración del ChatParticipant `mcp` existente

### **FASE 2: Interfaz Teatral** (Frontend)
- Interfaces de usuario para gestión teatral
- Comandos y TreeViews integrados
- Editor de configuraciones

### **FASE 3: Migración y Validación** (Validación)
- Migración completa de agentes .github
- Tests y validación de calidad
- Documentación final

### **FASE 4: Expansión** (Todos los agentes)
- Creación de nuevas compañías
- Optimización y polish
- Preparación para distribución

---

## 🗺️ ESTRUCTURA OBJETIVO FINAL

```
mcp-vscode-ext/
├── src/
│   ├── theatrical/
│   │   ├── core/
│   │   │   ├── ITheatricalAgent.ts
│   │   │   ├── CompanyRegistry.ts
│   │   │   ├── StageManager.ts
│   │   │   └── PlayDirector.ts
│   │   ├── companies/
│   │   │   ├── devops/
│   │   │   │   ├── backend-agent.ts
│   │   │   │   ├── frontend-agent.ts
│   │   │   │   └── integration-agent.ts
│   │   │   ├── operational/
│   │   │   │   ├── operador-agent.ts
│   │   │   │   └── interactivo-mcp-agent.ts
│   │   │   └── templates/
│   │   │       └── company-template.ts
│   │   ├── ui/
│   │   │   ├── TheatricalTreeView.ts
│   │   │   ├── ConfigurationWebView.ts
│   │   │   └── CompanyWizard.ts
│   │   └── utils/
│   │       ├── ConfigLoader.ts
│   │       └── AgentFactory.ts
│   └── legacy/
│       └── mcpChatParticipant.ts (deprecated)
├── configurations/
│   ├── companies/
│   │   ├── devops-company.json
│   │   ├── operational-company.json
│   │   └── templates/
│   └── theatrical-config.json
└── docs/
    ├── THEATRICAL_ARCHITECTURE.md
    ├── COMPANY_CREATION_GUIDE.md
    └── MIGRATION_GUIDE.md
```

---

## 🚢 ESTADO DE LA EXPEDICIÓN

**Status**: 🎯 Checklist creado - Listo para asignación de agentes  
**Próximo paso**: Asignar agente especializado para comenzar FASE 1  
**Coordinación**: Isaac documentará progreso en bitácora teatral

---

¿Qué agente asignamos primero para comenzar la expedición, Capitán Dídac San? ⚓🎭