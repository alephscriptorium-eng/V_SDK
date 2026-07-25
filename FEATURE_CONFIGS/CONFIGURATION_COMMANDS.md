# 🎭 Arrakis Theater Configuration Management

Los nuevos comandos de configuración permiten una gestión flexible y dinámica de las configuraciones de Arrakis Theater, aprovechando el sistema centralizado implementado.

## 📋 Comandos Disponibles

### 🎭 Load Opera Configuration (`ArrakisTheater.LoadConfig`)

Permite seleccionar un archivo JSON de configuración personalizado y reiniciar la extensión con esa configuración.

**Cómo usar:**
1. Ejecutar el comando desde la Command Palette (`Ctrl+Shift+P`)
2. Seleccionar un archivo `.json` de configuración
3. La extensión validará el archivo y ofrecerá reiniciar
4. La ruta del archivo se guardará en los settings de VS Code para sesiones futuras

**Formato del archivo:** Similar a `sample-config.json` pero personalizado para tu entorno.

### 🎭 Download Configuration (`ArrakisTheater.DownloadConfig`)

Exporta la configuración actual a un archivo JSON que puede ser reutilizado o compartido.

**Cómo usar:**
1. Ejecutar el comando desde la Command Palette
2. Elegir ubicación y nombre para el archivo (por defecto: `ArrakisTheater_OperaConfig.json`)
3. El archivo se guarda con formato pretty-print para fácil edición
4. Opción de abrir el archivo o la carpeta directamente

### 🎭 Reset to Defaults (`ArrakisTheater.ResetConfig`)

Resetea la configuración a los valores por defecto, limpiando cualquier configuración personalizada.

**Cómo usar:**
1. Ejecutar el comando (requiere confirmación)
2. La extensión vuelve a usar la configuración por defecto
3. Se eliminan las referencias a archivos externos de los settings

### 🎭 Show Current Configuration (`ArrakisTheater.ShowCurrentConfig`)

Muestra la configuración actualmente cargada en un documento de VS Code para inspección.

**Cómo usar:**
1. Ejecutar el comando
2. Se abre un nuevo documento con la configuración actual en formato JSON
3. Útil para debugging y verificación de configuración

## ⚙️ Settings de VS Code

Los comandos integran con los settings nativos de VS Code:

### `alephscript.configurationFile`
- **Tipo:** String
- **Default:** ""
- **Descripción:** Ruta al archivo de configuración de Arrakis Theater
- **Scope:** Workspace

### `alephscript.autoLoadConfig`
- **Tipo:** Boolean  
- **Default:** true
- **Descripción:** Cargar automáticamente el archivo de configuración al iniciar
- **Scope:** Workspace

### `alephscript.configValidation`
- **Tipo:** Boolean
- **Default:** true
- **Descripción:** Habilitar validación de configuración al cargar
- **Scope:** Workspace

### `mcpSocketManager.configPath` (Legacy)
- **Tipo:** String
- **Default:** ""
- **Descripción:** Ruta al archivo de configuración MCP (compatibilidad)
- **Scope:** Workspace

## 🔄 Persistencia Entre Sesiones

Cuando usas `LoadConfig`, la extensión:

1. **Guarda la ruta** en `settings.json` del workspace
2. **Auto-carga** la configuración en futuras sesiones
3. **Mantiene sincronización** entre el archivo externo y la configuración interna
4. **Valida** el archivo cada vez que se carga

## 📁 Estructura de Configuración

Los archivos de configuración deben seguir la estructura de `AlephScriptConfiguration`:

```json
{
  "app": { "type": "..." },
  "launcher": { 
    "ollamaUrl": "...",
    "mcpServiceLauncherPort": 3050,
    ...
  },
  "mcp": {
    "servers": {
      "server-id": {
        "port": 3001,
        "cmd": "...",
        "args": {}
      }
    }
  },
  "ui": [...],
  "orchestration": {...}
}
```

## 🎯 Casos de Uso

### Desarrollo Local
```bash
# Usar configuración de desarrollo
ArrakisTheater.LoadConfig -> dev-config.json
```

### Producción
```bash
# Exportar config actual para producción
ArrakisTheater.DownloadConfig -> production-config.json
```

### Colaboración
```bash
# Compartir configuración de equipo
ArrakisTheater.LoadConfig -> team-shared-config.json
```

### Backup/Restore
```bash
# Backup antes de cambios
ArrakisTheater.DownloadConfig -> backup-YYYY-MM-DD.json

# Restore desde backup
ArrakisTheater.LoadConfig -> backup-YYYY-MM-DD.json
```

## 🔧 Integración con VS Code

Los comandos aprovechan las capacidades nativas de VS Code:

- **File Picker:** Diálogos nativos para seleccionar archivos
- **Settings Integration:** Persistencia automática en workspace settings
- **Validation:** Feedback inmediato sobre errores de configuración
- **Hot Reload:** Aplicación de cambios sin reiniciar VS Code (opcional)
- **Command Palette:** Acceso rápido desde `Ctrl+Shift+P`

## 🚀 Flujo Recomendado

1. **Desarrollo:** Usar `sample-config.json` como base
2. **Personalización:** Exportar con `DownloadConfig`
3. **Edición:** Modificar el archivo exportado según necesidades
4. **Aplicación:** Cargar con `LoadConfig`
5. **Compartir:** Versionar el archivo de configuración en el proyecto

Este sistema proporciona flexibilidad máxima mientras mantiene la simplicidad de uso y aprovecha las mejores prácticas de VS Code para gestión de configuración.