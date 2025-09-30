# Manual de Empaquetado e Instalación Local

## Guía para Empaquetar y Probar la Extensión MCP VS Code

Esta guía te ayudará a empaquetar e instalar la extensión MCP VS Code en tu IDE local para pruebas y desarrollo.

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior)
- **npm** (viene incluido con Node.js)
- **Visual Studio Code** (versión 1.74.0 o superior)
- **vsce** (VS Code Extension Manager)

### Instalación de vsce

```bash
npm install -g @vscode/vsce
```

## 🔧 Preparación del Proyecto

### 1. Verificar el Estado del Proyecto

Primero, asegúrate de que el proyecto esté en un estado funcional:

```bash
cd "c:\Users\oracl\Documents\REPOS\mcp-vscode-ext"

# Verificar que las dependencias estén instaladas
npm install

# Compilar el proyecto
npm run compile

# Ejecutar tests (opcional pero recomendado)
npm test
```

### 2. Verificar la Configuración del package.json

Revisa que el `package.json` tenga la configuración correcta:

```json
{
  "name": "mcp-socket-gamification-manager",
  "displayName": "MCP Socket.io Gamification Manager",
  "description": "VS Code extension to manage MCP-Socket.io gamification ecosystem",
  "version": "0.0.1",
  "publisher": "mcp-gamification",
  "engines": {
    "vscode": "^1.74.0"
  },
  "main": "./out/extension.js"
}
```

## 📦 Empaquetado de la Extensión

### Método 1: Empaquetado Simple (Recomendado para pruebas)

```bash
# Desde el directorio raíz del proyecto
vsce package
```

Esto creará un archivo `.vsix` con el nombre similar a: `mcp-socket-gamification-manager-0.0.1.vsix`

### Método 2: Empaquetado con Configuraciones Específicas

```bash
# Empaquetar con un nombre específico
vsce package --out mcp-arrakis-theater-ext.vsix

# Empaquetar sin ejecutar prepublish scripts
vsce package --no-dependencies

# Empaquetar incluyendo archivos específicos
vsce package --baseContentUrl https://github.com/tu-usuario/tu-repo
```

### Solución de Problemas Comunes en el Empaquetado

Si encuentras errores durante el empaquetado:

#### Error: "No files included"
```bash
# Verificar que exista la carpeta out/
npm run compile

# Si el problema persiste, verificar el .vscodeignore
```

#### Error: "Missing publisher"
```bash
# Editar package.json y agregar:
"publisher": "tu-nombre-o-organizacion"
```

#### Error: "Missing main field"
```bash
# Verificar que package.json tenga:
"main": "./out/extension.js"
```

## 🚀 Instalación Local

### Opción 1: Instalación vía Línea de Comandos

```bash
# Instalar desde el archivo .vsix
code --install-extension mcp-socket-gamification-manager-0.0.1.vsix

# Verificar que se instaló correctamente
code --list-extensions | grep mcp
```

### Opción 2: Instalación vía Interfaz de VS Code

1. **Abrir VS Code**
2. **Ir a Extensions** (Ctrl+Shift+X)
3. **Hacer clic en los "..." (tres puntos)** en la barra superior del panel de extensiones
4. **Seleccionar "Install from VSIX..."**
5. **Navegar y seleccionar** tu archivo `.vsix`
6. **Hacer clic en "Install"**
7. **Reiniciar VS Code** si es necesario

### Opción 3: Desarrollo en Modo Debug

Para desarrollo activo sin empaquetar:

1. **Abrir VS Code**
2. **File > Open Folder** → Seleccionar la carpeta del proyecto
3. **Presionar F5** o **Run > Start Debugging**
4. Esto abrirá una nueva ventana de VS Code con la extensión cargada en modo desarrollo

## 🧪 Verificación de la Instalación

### 1. Verificar que la Extensión está Activa

```bash
# Listar extensiones instaladas
code --list-extensions

# Debería aparecer algo como:
# mcp-gamification.mcp-socket-gamification-manager
```

### 2. Probar Funcionalidades Básicas

1. **Abrir Command Palette** (Ctrl+Shift+P)
2. **Buscar comandos MCP**:
   - `MCP Manager: Open Config Editor`
   - `AlephScript: Show System Status Panel`
   - `AlephScript: Quick Start - Launch Everything`

3. **Verificar Panel de Actividad**:
   - Debería aparecer el icono "MCP Socket Manager" en la barra lateral

### 3. Probar Chat Participant (Nueva Funcionalidad)

1. **Abrir GitHub Copilot Chat** (si tienes Copilot instalado)
2. **Escribir**: `@mcp hello`
3. **Probar comandos**:
   - `@mcp /config` - Ayuda con configuración
   - `@mcp /troubleshoot` - Solución de problemas
   - `@mcp /examples` - Ejemplos de implementación
   - `@mcp /socket` - Ayuda con Socket.IO

## 🔄 Actualización de la Extensión

### Para Actualizar Durante el Desarrollo

1. **Hacer cambios en el código**
2. **Compilar**:
   ```bash
   npm run compile
   ```
3. **Re-empaquetar**:
   ```bash
   vsce package --out mcp-arrakis-theater-ext-v2.vsix
   ```
4. **Desinstalar versión anterior**:
   ```bash
   code --uninstall-extension mcp-gamification.mcp-socket-gamification-manager
   ```
5. **Instalar nueva versión**:
   ```bash
   code --install-extension mcp-arrakis-theater-ext-v2.vsix
   ```

### Para Desarrollo Continuo

Usa el modo debug (F5) para pruebas rápidas sin necesidad de empaquetar cada vez.

## 📝 Scripts Útiles

Agrega estos scripts a tu `package.json` para facilitar el desarrollo:

```json
{
  "scripts": {
    "package": "vsce package",
    "package-local": "vsce package --out mcp-arrakis-theater-ext.vsix",
    "install-local": "code --install-extension mcp-arrakis-theater-ext.vsix",
    "dev-package": "npm run compile && npm run package-local",
    "dev-install": "npm run dev-package && npm run install-local"
  }
}
```

Luego puedes usar:

```bash
# Empaquetar e instalar en un solo comando
npm run dev-install
```

## 🐛 Solución de Problemas

### La Extensión No Se Activa

1. **Verificar logs**:
   - Abrir **Developer Tools** (Help > Toggle Developer Tools)
   - Buscar errores en la consola

2. **Verificar activationEvents**:
   - Asegúrate de que el `package.json` tenga eventos de activación apropiados

### El Chat Participant No Funciona

1. **Verificar GitHub Copilot**:
   - Asegúrate de tener GitHub Copilot instalado y activo
   - Verifica tu suscripción de Copilot

2. **Verificar configuración**:
   - El chat participant requiere VS Code 1.74.0 o superior

### Errores de Compilación

```bash
# Limpiar y recompilar
rm -rf out/
npm run compile

# Si hay errores de tipos
npm install @types/vscode@latest
```

## 📋 Checklist de Verificación

Antes de considerar la extensión lista:

- [ ] ✅ Compilación exitosa (`npm run compile`)
- [ ] ✅ Tests pasando (`npm test`)
- [ ] ✅ Empaquetado exitoso (`vsce package`)
- [ ] ✅ Instalación local exitosa
- [ ] ✅ Comandos básicos funcionan
- [ ] ✅ Panel de actividad visible
- [ ] ✅ Chat participant responde (`@mcp`)
- [ ] ✅ Comandos slash funcionan (`/config`, `/troubleshoot`, etc.)
- [ ] ✅ No errores en Developer Tools

## 📞 Soporte

Si encuentras problemas:

1. **Verificar logs**: Developer Tools > Console
2. **Verificar versión de VS Code**: Help > About
3. **Verificar versión de Node.js**: `node --version`
4. **Revisar documentación**: [VS Code Extension API](https://code.visualstudio.com/api)

¡Tu extensión MCP VS Code está lista para ser probada en local! 🎉