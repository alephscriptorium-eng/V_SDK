# Script de PowerShell para Empaquetado e Instalación Local
# Uso: .\build-and-install.ps1

param(
    [switch]$SkipTests
)

# Configuración de colores
$Host.UI.RawUI.ForegroundColor = "White"

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

Write-Status "🚀 Iniciando proceso de empaquetado e instalación local..."

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Error-Custom "No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
}

Write-Status "Verificando prerrequisitos..."

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Status "Node.js versión: $nodeVersion"
} catch {
    Write-Error-Custom "Node.js no está instalado. Por favor instala Node.js primero."
    exit 1
}

# Verificar npm
try {
    $npmVersion = npm --version
    Write-Status "npm versión: $npmVersion"
} catch {
    Write-Error-Custom "npm no está instalado. Por favor instala npm primero."
    exit 1
}

# Verificar vsce
try {
    $vsceVersion = vsce --version
    Write-Status "vsce versión: $vsceVersion"
} catch {
    Write-Warning "vsce no está instalado. Instalando..."
    npm install -g @vscode/vsce
}

# Verificar VS Code
try {
    $codeVersion = code --version | Select-Object -First 1
    Write-Status "VS Code versión: $codeVersion"
} catch {
    Write-Error-Custom "VS Code no está instalado o no está en el PATH."
    exit 1
}

Write-Success "Todos los prerrequisitos están disponibles."

# Obtener información del proyecto
$packageJson = Get-Content "package.json" | ConvertFrom-Json
$projectName = $packageJson.name
$projectVersion = $packageJson.version
$packageFile = "$projectName-$projectVersion.vsix"

Write-Status "Proyecto: $projectName v$projectVersion"

# Paso 1: Instalar dependencias
Write-Status "Instalando dependencias..."
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Error al instalar dependencias."
    exit 1
}

# Paso 2: Compilar el proyecto
Write-Status "Compilando el proyecto..."
npm run compile
if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Error en la compilación."
    exit 1
}

# Verificar que la compilación fue exitosa
if (-not (Test-Path "out")) {
    Write-Error-Custom "La compilación falló. No se encontró el directorio 'out'."
    exit 1
}

Write-Success "Compilación exitosa."

# Paso 3: Ejecutar tests (opcional)
if (-not $SkipTests) {
    Write-Status "Ejecutando tests..."
    npm test
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Algunos tests fallaron, pero continuando con el empaquetado..."
    } else {
        Write-Success "Tests pasaron correctamente."
    }
} else {
    Write-Warning "Saltando tests..."
}

# Paso 4: Limpiar packages anteriores
if (Test-Path $packageFile) {
    Write-Status "Removiendo package anterior: $packageFile"
    Remove-Item $packageFile
}

# Paso 5: Empaquetar la extensión
Write-Status "Empaquetando la extensión..."
vsce package
if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Error en el empaquetado."
    exit 1
}

if (-not (Test-Path $packageFile)) {
    Write-Error-Custom "El empaquetado falló. No se encontró $packageFile."
    exit 1
}

Write-Success "Extensión empaquetada: $packageFile"

# Paso 6: Desinstalar versión anterior (si existe)
$extensionId = "mcp-gamification.mcp-socket-gamification-manager"
$installedExtensions = code --list-extensions
if ($installedExtensions -contains $extensionId) {
    Write-Status "Desinstalando versión anterior..."
    code --uninstall-extension $extensionId
    Write-Success "Versión anterior desinstalada."
}

# Paso 7: Instalar la nueva extensión
Write-Status "Instalando la nueva extensión..."
code --install-extension $packageFile
if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Error en la instalación."
    exit 1
}

# Verificar instalación
$installedExtensions = code --list-extensions
if ($installedExtensions -contains $extensionId) {
    Write-Success "¡Extensión instalada exitosamente!"
} else {
    Write-Error-Custom "La instalación falló."
    exit 1
}

# Resumen
Write-Host ""
Write-Host "📋 Resumen:" -ForegroundColor Cyan
Write-Host "   • Proyecto: $projectName"
Write-Host "   • Versión: $projectVersion"
Write-Host "   • Package: $packageFile"
Write-Host "   • Estado: ✅ Instalado y listo para usar"
Write-Host ""
Write-Host "🧪 Para probar la extensión:" -ForegroundColor Cyan
Write-Host "   1. Abre VS Code"
Write-Host "   2. Presiona Ctrl+Shift+P"
Write-Host "   3. Busca comandos 'MCP Manager' o 'AlephScript'"
Write-Host "   4. Prueba el chat participant con '@mcp' (si tienes Copilot)"
Write-Host ""
Write-Host "🔄 Para actualizar, ejecuta este script nuevamente."
Write-Host ""
Write-Success "¡Listo para usar! 🎉"