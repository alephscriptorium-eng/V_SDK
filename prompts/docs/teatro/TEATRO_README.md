# 🎭 Teatro de Agentes - VS Code Extension

## Descripción

El **Teatro de Agentes** es un panel de control integrado en la extensión MCP Socket Manager que permite gestionar y controlar los 5 agentes especializados del sistema teatral.

## Agentes Disponibles

### 🎯 Agentes Activos por Defecto

1. **⚓ Isaac - El Marinero**
   - **Especialización**: Navegación Técnica & Documentación
   - **Descripción**: Tu marinero fiel para navegación técnica y exploración de frameworks
   - **Comandos**: `/navegar`, `/bitacora`

2. **🔧 Don Álvaro - Capataz de Astilleros**
   - **Especialización**: Mantenimiento & Optimización
   - **Descripción**: Ingeniero especializado en mantenimiento y optimización de frameworks
   - **Comandos**: `/diagnostico`, `/optimizar`, `/mantener`

3. **🔗 Indra - Agente de Integración**
   - **Especialización**: Integración & Comunicación
   - **Descripción**: Especialista en integración cross-component y comunicación entre servicios
   - **Comandos**: `/integrar`, `/comunicar`, `/sincronizar`

4. **🖥️ Backend Agent - Arquitecto de Backend**
   - **Especialización**: Backend & APIs
   - **Descripción**: Especialista en desarrollo de backend, APIs y arquitectura de servidores
   - **Comandos**: `/api`, `/servidor`, `/base-datos`

### 💤 Agentes Inactivos

5. **👑 Capitán Dídac - Líder de Expedición**
   - **Especialización**: Liderazgo & Estrategia
   - **Descripción**: Liderazgo técnico para navegación en territorios desconocidos
   - **Comandos**: `/liderar`, `/estrategia`, `/expedicion`

## Características del Panel

### 🎪 TreeView del Teatro
- **Vista jerárquica** de agentes activos e inactivos
- **Categorías organizadas** por estado (Activos/Inactivos/Configuración)
- **Comandos contextuales** para cada agente
- **Iconos intuitivos** y estados visuales

### 🎛️ Panel de Control WebView
- **Dashboard centralizado** con estado del sistema en tiempo real
- **Tarjetas de agentes** con información detallada
- **Botones de acción** para activar/desactivar agentes
- **Acceso directo** a ChatParticipants
- **Estadísticas del sistema** (Total/Activos/Inactivos)

### ⚡ Funcionalidades

#### Gestión de Agentes
- **Activar/Desactivar** agentes individuales
- **Abrir chat directo** con cualquier agente
- **Ver información detallada** de especialización y comandos
- **Actualización en tiempo real** del estado

#### Integración VS Code
- **ChatParticipants registrados** como `@isaac`, `@don-alvaro`, etc.
- **Comandos de paleta** para acceso rápido
- **Menús contextuales** en TreeView items
- **Panel WebView** integrado

## Uso

### Acceso al Teatro

1. **Desde la Barra Lateral**: Busca el icono 🎭 "Teatro de Agentes" en el panel MCP Socket Manager
2. **Desde Paleta de Comandos**: `Ctrl+Shift+P` → "🎭 Abrir Panel del Teatro"
3. **Desde TreeView**: Click derecho en cualquier agente → menú contextual

### Trabajar con Agentes

#### Via TreeView
```
🎭 Agentes Activos
  ├── ⚓ Isaac (Click para abrir chat)
  ├── 🔧 Don Álvaro
  ├── 🔗 Indra
  └── 🖥️ Backend Agent

💤 Agentes Inactivos  
  └── 👑 Capitán Dídac (Click para activar)
```

#### Via Chat
```
@isaac /navegar - Explorar arquitectura del proyecto
@don-alvaro /diagnostico - Análisis completo del sistema
@indra /integrar - Conectar componentes
@backend-agent /api - Diseñar nueva API
```

### Comandos Disponibles

#### Paleta de Comandos
- `🎭 Abrir Panel del Teatro` - Abre el panel de control principal
- `Actualizar Teatro` - Refresca el estado de todos los agentes
- `Activar Agente` - Activa un agente específico
- `Desactivar Agente` - Desactiva un agente específico

#### Menús Contextuales
- **Click derecho en agente activo**: Desactivar, Abrir Chat, Ver Info
- **Click derecho en agente inactivo**: Activar, Ver Info
- **Barra de título**: Actualizar, Abrir Panel

## Arquitectura Técnica

### Componentes Principales

1. **TeatroTreeDataProvider.ts** - Proveedor de datos para TreeView
2. **TeatroWebViewProvider.ts** - Proveedor de WebView con panel de control
3. **TheatricalChatManager.ts** - Gestor de ChatParticipants
4. **Media files** - CSS y JavaScript para WebView

### Integración

- **ExtensionBootstrap**: Registro automático de todos los componentes
- **Package.json**: Contribuciones de commands, views, menus y chatParticipants
- **VS Code API**: TreeDataProvider, WebviewViewProvider, ChatParticipants

### Estados Persistentes

- **Agentes activos/inactivos** gestionados por TeatroTreeDataProvider
- **Configuración** accesible via VS Code settings
- **Logs y Analytics** integrados con sistema de monitoreo

## Desarrollo y Extensión

### Añadir Nuevos Agentes

1. **Editar TeatroTreeDataProvider.ts** - Añadir definición del agente
2. **Actualizar package.json** - Registrar nuevo ChatParticipant  
3. **Modificar TheatricalChatManager.ts** - Añadir handler específico
4. **Compilar y desplegar** - `npm run deploy:local`

### Personalizar Panel WebView

1. **Editar teatro.css** - Modificar estilos
2. **Actualizar teatro.js** - Añadir nuevas funcionalidades
3. **Modificar TeatroWebViewProvider.ts** - Cambiar estructura HTML

---

*🎭 Teatro de Agentes v1.0 - Una experiencia teatral para el desarrollo con VS Code*