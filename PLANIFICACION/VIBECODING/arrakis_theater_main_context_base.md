# Zeus Main Context Base


Base plan documents:

- `PLANIFICACION\VIBECODING\arrakis_theater_checkpoint_list.md` - Sprint main calendar
- `PLANIFICACION\VIBECODING\plan_arrakis_theater.md` - Master plan

- `PLANIFICACION\VIBECODING\estudio_elenco.md` - ChatParticipants plan
- `PLANIFICACION\VIBECODING\estudio_teatro` - Theater & Engine plan
- `PLANIFICACION\VIBECODING\arrakis_theater_main_context_base.md` - Technical overview


## Project Overview

**Project**: Zeus - MCP Mesh SDK Web Interface (Refactored)  
**Goal**: Clean production version of asterion following diogenes patterns  

### Key Context
- **Source**: asterion (preserve ALL functionality)
- **Reference**: diogenes (adopt patterns & architecture)
- **Target**: zeus (clean, maintainable, production-ready)

## Work Dynamics

### Micro-Sprint Methodology
- **Unit**: Request-based sprints (not calendar days)
- **Tracking**: Checkpoint-based progress
- **Documentation**: All changes tracked in ITERATIONS/
- **Collaboration**: Multi-agent with clear handoffs

### Agent Rules
1. **READ FIRST**: Current checkpoint status
2. **UPDATE**: Only assigned checkpoints
3. **DOCUMENT**: All work in iteration file
4. **HANDOFF**: Clear status updates for next agent

### File Permissions
- `zeus_main_context_base.md` - READ ONLY (user approval for edits)
- `agents.md` - EDITABLE (with user permission)  
- `zeus_main_checkpoint_list.md` - STATUS ONLY (no new items without approval)
- `iteration_template.md` - READ ONLY
- `ITERATIONS/` - CREATE sprint files as needed

## Technical Architecture

### Base Technology Stack
```
Technology: Node.js + Express.js + HyperAxe
Pattern: Diogenes-compatible modular architecture
Structure: backend/ + server/ + views/ + configs/ + models/
```

### Core Principles
1. **Diogenes Compatibility**: Mirror patterns exactly
2. **Clean Code**: No Spanish comments, no legacy code
3. **Modular Design**: Clear separation of concerns  
4. **Configuration-Driven**: Feature flags and themes
5. **Type Safety**: Consistent JavaScript (no mixed TS/JS)

### Directory Structure (Target)
```
zeus/
├── backend/          # Main application logic
├── server/           # Server infrastructure  
├── client/assets/    # Static files & themes
├── configs/          # Configuration management
├── models/           # Data models
├── views/            # HyperAxe templates
└── PLANIFICACION/    # Project documentation
```

### Views to Migrate (Preserve 100%)
1. **Home** (`/`) - Landing page with navigation
2. **AI Conversation** (`/ai`) - Chat with preset context
3. **Preset Library** (`/presets`) - Catalog of saved presets  
4. **MCP Editor** (`/editor`) - Server explorer (renamed from explorer)
5. **Settings** (`/settings`) - Theme & configuration
6. **Statistics** (`/stats`) - Usage metrics

## Integration Requirements

### Diogenes Compatibility
- **HyperAxe**: Same templating engine
- **Themes**: Compatible CSS system (THEMES MUST BE COMPATIBLE & INTERCHANGEABLE WITH DIOGENES THEMES)
- **i18n**: Similar translation structure
- **Navigation**: Emoji + text pattern
- **Configuration**: JSON-based management

### Critical Fixes from Asterion
- **Hydration bifurcation**: Resolve rendering inconsistency
- **Mixed languages**: Standardize on JavaScript
- **Duplicate logic**: Consolidate preset management
- **Configuration scatter**: Centralize config files

## Key Reference Files

- `PLANIFICACION/estudio_diogenes.md` - Diogenes analysis
- `PLANIFICACION/estudio_asterion.md` - Asterion analysis  
- `PLANIFICACION/plan_zeus.md` - Complete architecture plan
- `VIBECODING/agents.md` - Technical collaboration guidelines