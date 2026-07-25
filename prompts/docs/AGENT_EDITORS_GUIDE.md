# Sistema de Editores de Agentes - Guía de Usuario

## 🎭 Descripción General

El sistema de editores de agentes permite crear, editar y configurar agentes de manera visual e intuitiva directamente en VS Code. Utiliza editores personalizados (Custom Editors) para proporcionar interfaces especializadas para el contenido y configuración de agentes.

## 📂 Estructura de Archivos

El sistema utiliza una arquitectura modular de 4 capas:

```
theatrical-content/
├── content/agents/           # Capa de Contenido (Natural Language)
│   ├── isaac.agent.md        # Contenido del agente Isaac
│   ├── backend-agent.agent.md # Contenido del agente Backend
│   └── ...
├── configurations/agents/    # Capa de Configuración (JSON)
│   ├── isaac.config.json     # Configuración del agente Isaac
│   ├── backend-agent.config.json # Configuración del agente Backend
│   └── ...
└── configurations/schemas/   # Esquemas de validación
    └── agent.schema.json     # Schema JSON para validación
```

## 🔧 Editores Disponibles

### 1. Editor de Contenido de Agente (`.agent.md`)

**Tipo de archivo**: `*.agent.md`  
**Editor**: Custom Markdown Editor con características especiales

#### Características:
- ✅ Editor markdown enriquecido con toolbar
- ✅ Árbol de estructura del documento
- ✅ Editor de metadatos YAML (frontmatter)
- ✅ Vista previa en tiempo real
- ✅ Validación de contenido
- ✅ Estadísticas del documento
- ✅ Plantillas y guías rápidas

#### Funcionalidades del Toolbar:
- **Formato**: Negrita, cursiva, código, listas
- **Estructura**: Títulos, enlaces, imágenes
- **Especializado**: Emojis, plantillas de agente
- **Navegación**: Ir a sección, tabla de contenidos

### 2. Editor de Configuración de Agente (`.config.json`)

**Tipo de archivo**: `**/theatrical-content/configurations/agents/*.config.json`  
**Editor**: Custom JSON Editor con interfaz visual

#### Características:
- ✅ Editor de formularios tabulado
- ✅ Validación JSON Schema en tiempo real
- ✅ Configuración visual de herramientas MCP
- ✅ Gestión de capacidades y comandos
- ✅ Configuración de servidores MCP
- ✅ Editor JSON raw alternativo

#### Pestañas del Editor:
1. **Básico**: ID, nombre, descripción, versión
2. **Herramientas**: Selección visual de herramientas MCP
3. **Capacidades**: Configuración de capacidades del agente
4. **MCP**: Configuración de servidores y presets MCP
5. **JSON**: Editor de código JSON directo

## 🚀 Uso del Sistema

### Crear un Nuevo Agente

1. **Comando**: `Ctrl+Shift+P` → "Create New Agent"
2. **Proceso**:
   - Ingresa el ID del agente (ej: `isaac`, `backend-agent`)
   - Ingresa el nombre para mostrar (ej: "Isaac - El Marinero")
   - El sistema crea automáticamente:
     - `content/agents/{id}.agent.md`
     - `configurations/agents/{id}.config.json`
   - Se abre automáticamente el editor de contenido

### Editar Contenido de Agente

1. **Método 1**: Comando "Edit Agent Content" → Seleccionar agente
2. **Método 2**: Abrir directamente archivo `.agent.md`
3. **Método 3**: Clic derecho en archivo → "Open with Agent Content Editor"

#### Interfaz del Editor de Contenido:
```
┌─────────────────────────────────────────────────────────────┐
│ 🎭 Isaac - El Marinero                          [Save][Preview] │
├─────────────┬───────────────────────────────────────────────┤
│ Estructura  │ Toolbar: [B][I][U] [H1][H2] [Link][Img] [📝]  │
│ ├─ Identidad│ ─────────────────────────────────────────────  │
│ ├─ Comandos │ Editor Principal:                             │
│ ├─ Ejemplos │ # Isaac: Marinero Fiel 🌊                    │
│ └─ Meta     │                                               │
│             │ ## Mi Identidad Forjada 🧭                   │
├─────────────┤                                               │
│ Metadatos   │ ¡Aquí estoy, capitán! Soy **Isaac**...      │
│ name: isaac │                                               │
│ emoji: 🌊   │                                               │
│ version:1.0 │                                               │
├─────────────┼───────────────────────────────────────────────┤
│ Estadísticas│ Vista Previa:                                 │
│ 📝 1,234    │ [Rendering live preview...]                   │
│ 💬 145      │                                               │
│ 📏 8        │                                               │
└─────────────┴───────────────────────────────────────────────┘
```

### Editar Configuración de Agente

1. **Método 1**: Comando "Edit Agent Configuration" → Seleccionar agente
2. **Método 2**: Abrir directamente archivo `.config.json`
3. **Método 3**: Clic derecho en archivo → "Open with Agent Config Editor"

#### Interfaz del Editor de Configuración:
```
┌─────────────────────────────────────────────────────────────┐
│ ⚙️ Isaac Configuration                         [Save][Test]   │
├─────────────────────────────────────────────────────────────┤
│ [Básico] [Herramientas] [Capacidades] [MCP] [JSON]          │
├─────────────────────────────────────────────────────────────┤
│ Información Básica:                                         │
│ ┌─────────────────┬─────────────────────────────────────┐   │
│ │ ID: isaac       │ Nombre: Isaac - El Marinero        │   │
│ │ Versión: 1.0.0  │ Rol: assistant                     │   │
│ └─────────────────┴─────────────────────────────────────┘   │
│                                                             │
│ Descripción:                                                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Tu marinero fiel para navegación técnica y exploración │ │
│ │ de frameworks...                                        │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ✅ Valid Configuration                 📊 5 tools configured │
└─────────────────────────────────────────────────────────────┘
```

### Validar Todos los Agentes

**Comando**: "Validate All Agents"

Este comando verifica:
- ✅ Cada archivo `.agent.md` tiene su correspondiente `.config.json`
- ✅ Los archivos JSON siguen el schema válido
- ✅ Los IDs coinciden entre contenido y configuración
- ✅ No hay agentes duplicados

## 🔄 Flujo de Trabajo Recomendado

### Para Creadores de Contenido:
1. Usar comando "Create New Agent"
2. Editar contenido en el editor markdown enriquecido
3. Usar herramientas visuales para estructura y metadatos
4. Guardar y previsualizar resultado

### Para Configuradores Técnicos:
1. Abrir archivo `.config.json` con el editor visual
2. Configurar herramientas MCP en pestaña "Herramientas"
3. Definir capacidades y comandos
4. Configurar servidores MCP si es necesario
5. Validar configuración antes de guardar

### Para Validación y QA:
1. Ejecutar "Validate All Agents" regularmente
2. Revisar resultados de validación
3. Corregir discrepancias encontradas

## 🎯 Ventajas del Sistema

### Para el Desarrollo:
- ✅ **Separación clara**: Contenido vs configuración técnica
- ✅ **Interfaz visual**: Sin necesidad de editar JSON manualmente
- ✅ **Validación automática**: Prevención de errores
- ✅ **Plantillas**: Rápida creación de agentes consistentes

### Para la Colaboración:
- ✅ **Roles especializados**: Escritores y configuradores técnicos
- ✅ **Flujo de trabajo visual**: Interfaz familiar de VS Code
- ✅ **Control de versiones**: Archivos separados para diferentes concernos
- ✅ **Documentación viva**: Los agentes se documentan a sí mismos

### Para la Mantención:
- ✅ **Consistencia**: Schema JSON asegura estructura uniforme
- ✅ **Escalabilidad**: Fácil agregar nuevos agentes
- ✅ **Debugging**: Validación ayuda a identificar problemas
- ✅ **Migración**: Estructura modular facilita cambios futuros

## 🚨 Solución de Problemas

### Editor no se abre correctamente:
1. Verificar que el archivo tenga la extensión correcta (`.agent.md` o `.config.json`)
2. Verificar que esté en la ruta correcta (`theatrical-content/...`)
3. Reiniciar VS Code si es necesario

### Validación JSON falla:
1. Abrir pestaña "JSON" en el editor de configuración
2. Verificar sintaxis JSON válida
3. Comparar con `agent.schema.json` para campos requeridos

### Archivos no se guardan:
1. Verificar permisos de escritura en la carpeta
2. Verificar que no haya caracteres especiales en nombres de archivo
3. Revisar logs de VS Code para errores específicos

## 📚 Recursos Adicionales

- **Schema de Validación**: `theatrical-content/configurations/schemas/agent.schema.json`
- **Ejemplos**: Ver `isaac.agent.md` y `isaac.config.json` para referencia
- **Logs**: VS Code Output → "AlephScript Extension" para debugging

---

*Esta documentación es parte del sistema de editores de agentes v1.0.0*