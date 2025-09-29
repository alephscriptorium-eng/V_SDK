Perfecto, ahora vamos a probar el empaquetado:

```
npm run package:local
```

¡Perfecto! 🎉 El empaquetado fue exitoso. Ahora vamos a probar el deployment completo:

```
npm run deploy:local
```

El comando de desinstalación falló porque la extensión no estaba previamente instalada, pero eso está bien. Vamos a continuar con la instalación:

```
npm run install:local
```

¡Excelente! 🎉 La extensión se ha instalado exitosamente. Ahora vamos a verificar que se instaló correctamente:


## 🚀 Cómo Usar el Chat Participant MCP

### 1. **Prerequisitos**

Necesitas tener instalado:

- ✅ **GitHub Copilot** (extensión de VS Code)

- ✅ **Suscripción activa de GitHub Copilot**

- ✅ **VS Code 1.95.0 o superior**

### 2. **Activar el Chat Participant**

1\. **Abrir GitHub Copilot Chat:**

   - Presiona `Ctrl+Alt+I` (Windows/Linux) o `Cmd+Alt+I` (Mac)

   - O usar Command Palette: `Ctrl+Shift+P` → "GitHub Copilot: Open Chat"

2\. **Usar el participant MCP:**

   ```

   @mcp hello

   ```

### 3. **Comandos Disponibles**

| Comando | Descripción | Ejemplo |
|---------|-------------|---------|
| `@mcp` | Asistencia general MCP | `@mcp ¿Cómo configurar un servidor MCP?` |
| `@mcp /config` | Ayuda con configuración | `@mcp /config Necesito configurar Socket.IO` |
| `@mcp /troubleshoot` | Solución de problemas | `@mcp /troubleshoot El servidor no conecta` |
| `@mcp /examples` | Ejemplos de código | `@mcp /examples Servidor MCP con TypeScript` |
| `@mcp /socket` | Ayuda con Socket.IO | `@mcp /socket Configurar rooms en tiempo real` |

### 4. **Ejemplos Prácticos**


- Configuración básica

@mcp /config ¿Cómo configurar un servidor MCP básico?

- Solucionar problemas

@mcp /troubleshoot Mi cliente MCP no puede conectar al servidor

- Obtener ejemplos

@mcp /examples Muéstrame un servidor MCP completo con Socket.IO

- Ayuda específica con Socket.IO  

@mcp /socket ¿Cómo manejar desconexiones automáticas?



## 📚 Guías y Documentación

### **Guías que Creamos:**

1\. **📋 Manual Completo:** `MANUAL_INSTALACION_LOCAL.md`

   - Instalación paso a paso

   - Verificación de funcionamiento

   - Solución de problemas

2\. **⚡ Guía Rápida:** `README-DEV.md`

   - Comandos de desarrollo

   - Tips y tricks

   - Solución rápida de problemas

### **Documentación Oficial de VS Code:**

3\. **🔗 Chat Tutorial:** [VS Code AI Chat Guide](https://code.visualstudio.com/api/extension-guides/ai/chat-tutorial)

   - Tutorial oficial que seguimos

   - Conceptos avanzados de Chat Participants

4\. **🛠️ VS Code Extension API:** [Extension API Docs](https://code.visualstudio.com/api)

   - Documentación completa de APIs

## 🧪 Verificar que Funciona

### **Test Rápido:**

```bash

# 1. Verificar extensión instalada

code --list-extensions | grep mcp

# 2. Abrir VS Code y probar

# Ctrl+Alt+I → @mcp hello

```

### **Debugging si no Funciona:**

1\. **Verificar GitHub Copilot:**

   - Extensions → buscar "GitHub Copilot" → debe estar activo

   - Command Palette → "GitHub Copilot: Sign In"

2\. **Verificar logs:**

   - `F12` → Console → buscar errores

   - View → Output → "AlephScript - All Logs"

3\. **Reinstalar si es necesario:**

   ```bash

   npm run uninstall:local

   npm run deploy:local

   ```

## 💡 Tips de Uso

- **💬 Conversaciones largas:** El chat mantiene contexto de la conversación

- **🎯 Comandos específicos:** Usa `/config`, `/troubleshoot`, etc. para respuestas especializadas

- **🔄 Historial:** Puedes hacer follow-up questions en la misma conversación

- **📝 Markdown:** Las respuestas incluyen formato, código y ejemplos

## 🆘 Soporte Rápido

Si tienes problemas:

1\. **Revisar prerequisitos** (Copilot activo)

2\. **Verificar logs** (F12 → Console)

3\. **Reinstalar extensión** (`npm run deploy:local`)

4\. **Consultar manual** (MANUAL_INSTALACION_LOCAL.md)

¿Te gustaría que probemos el chat participant ahora mismo o necesitas ayuda con algún paso específico? 🚀


# LEGACY------------------

MCP Socket.io Gamification Manager

A comprehensive VS Code extension for managing MCP (Model Context Protocol) Socket.io gamification ecosystems. This extension provides a centralized interface for configuration management, process control, UI orchestration, and real-time message monitoring.

## Features

### 🔧 Visual Configuration Editor
- **Interactive Config Management**: Edit complex JSON configurations through intuitive web-based forms
- **Multi-section Support**: Separate editors for App settings, Game configuration, Agent definitions, UI instances, and MCP servers
- **Real-time Validation**: Immediate feedback and error checking while editing
- **Auto-save Functionality**: Changes are automatically saved to your configuration file

### ⚡ Process Management
- **Launcher Control**: Start and stop your X+1 application launcher with any configuration file
- **MCP Server Management**: Individual control over multiple MCP server instances
- **Health Monitoring**: Built-in connection testing and status monitoring
- **Centralized Logging**: Unified log viewer for all managed processes

### 🎮 UI Management System
- **Multi-UI Support**: Manage various gamification interface types:
  - Custom console interfaces
  - HTML5 web applications
  - ThreeJS 3D experiences
  - Unity WebGL builds
  - WebRTC communication hubs
  - Node-RED visual flows
  - Blockly visual programming
- **Port Management**: Automatic port assignment and conflict resolution
- **Quick Launch**: One-click start/stop and browser opening for web-based UIs

### 📡 Socket.io Bus Monitor
- **Real-time Message Monitoring**: Live view of all socket.io communications
- **Three-Channel Architecture**: 
  - **Application Channel**: Game logic and agent interactions
  - **System Channel**: Infrastructure and health monitoring
  - **UserInterface Channel**: UI updates and user interactions
- **Room-based Communication**: Join and monitor specific communication rooms
- **Message Filtering**: Filter messages by channel type, room, or custom criteria
- **Interactive Testing**: Send custom messages to test your system

### 🔌 MCP Server Integration
- **Multi-server Support**: Built-in support for common MCP servers:
  - State Machine Server (game state management)
  - Wiki MCP Browser (knowledge access and web browsing)
  - DevOps MCP Server (system operations)
- **Health Checks**: Automatic connection testing and status reporting
- **Port Configuration**: Flexible port assignment with defaults for common servers

## Installation

### Development Installation
1. Clone this repository
2. Open the folder in VS Code
3. Run `npm install` to install dependencies
4. Press `F5` to launch the Extension Development Host
5. In the new VS Code window, the extension will be active

### Package Installation
1. Run `npm run compile` to build the extension
2. Run `vsce package` to create a `.vsix` file
3. Install the `.vsix` file in VS Code via Extensions > Install from VSIX

## Usage

### Getting Started
1. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Type "MCP Manager" to see available commands
3. Start with "Open Config Editor" to set up your configuration file

### Available Commands
- **Open Config Editor**: Launch the visual configuration editor
- **Start Launcher**: Start the X+1 application launcher
- **Stop Launcher**: Stop the launcher process
- **Open Socket Monitor**: Monitor real-time socket.io communications
- **Manage UIs**: Control all gamification user interfaces
- **Manage MCP Servers**: Control MCP server instances

### Configuration Structure
The extension works with JSON configuration files that define:
- Application type and launcher settings
- Game definitions with agent configurations
- MCP server bindings and health settings
- UI instance definitions with ports and types
- Orchestration settings for message routing

See `sample-config.json` for a complete example configuration.

## Architecture

### Extension Components
- **ConfigEditor**: Web-based configuration management with forms
- **ProcessManager**: Lifecycle management for all system processes
- **SocketMonitor**: Real-time socket.io communication monitoring
- **UIManager**: Management of multiple gamification UI instances
- **MCPServerManager**: Health monitoring and control of MCP servers

### Communication Patterns
The extension supports a three-channel socket.io communication pattern:
- **Application**: Game logic, agent interactions, and core functionality
- **System**: Infrastructure monitoring, health checks, and system events
- **UserInterface**: UI updates, user interactions, and interface coordination

## Requirements

- VS Code 1.74.0 or higher
- Node.js 18+ for running managed processes
- Socket.io server for message monitoring
- MCP-compatible servers for full functionality

## Extension Settings

- `mcpSocketManager.configPath`: Path to your configuration file
- `mcpSocketManager.autoStart`: Automatically start services when opening workspace

## Development

### Project Structure
```
├── src/
│   ├── extension.ts          # Main extension entry point
│   ├── configEditor.ts       # Configuration management
│   ├── processManager.ts     # Process lifecycle management
│   ├── socketMonitor.ts      # Socket.io monitoring
│   ├── uiManager.ts          # UI instance management
│   └── mcpServerManager.ts   # MCP server control
├── out/                      # Compiled JavaScript output
├── package.json              # Extension manifest
├── tsconfig.json             # TypeScript configuration
└── sample-config.json        # Example configuration
```

### Building
```bash
npm run compile      # Compile TypeScript
npm run watch        # Watch mode for development
npm run package      # Create VSIX package
```

### Testing
```bash
node test-extension.js   # Verify compilation and configuration
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and ensure compilation succeeds
5. Submit a pull request

## Troubleshooting

### Common Issues
- **Extension not loading**: Ensure VS Code version is 1.74.0+
- **Process startup failures**: Check that required ports are available
- **Socket.io connection issues**: Verify your socket.io server is running
- **MCP server errors**: Ensure MCP servers are installed and accessible

### Debugging
- Use the Extension Development Host for testing
- Check the "MCP Socket Manager" output channel for logs
- Use the Socket.io Monitor to debug communication issues

## License

ISC License - See package.json for details

## Support

For issues and feature requests, please use the repository's issue tracker.