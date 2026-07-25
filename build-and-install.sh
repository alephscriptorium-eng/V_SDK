#!/bin/bash

# Script de Empaquetado e Instalación Local para MCP VS Code Extension
# Uso: ./build-and-install.sh

set -e  # Salir si hay algún error

echo "🚀 Iniciando proceso de empaquetado e instalación local..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con colores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

print_status "Verificando prerrequisitos..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado. Por favor instala Node.js primero."
    exit 1
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado. Por favor instala npm primero."
    exit 1
fi

# Verificar vsce
if ! command -v vsce &> /dev/null; then
    print_warning "vsce no está instalado. Instalando..."
    npm install -g @vscode/vsce
fi

# Verificar VS Code
if ! command -v code &> /dev/null; then
    print_error "VS Code no está instalado o no está en el PATH."
    exit 1
fi

print_success "Todos los prerrequisitos están disponibles."

# Obtener información del proyecto
PROJECT_NAME=$(node -p "require('./package.json').name")
PROJECT_VERSION=$(node -p "require('./package.json').version")
PACKAGE_FILE="${PROJECT_NAME}-${PROJECT_VERSION}.vsix"

print_status "Proyecto: $PROJECT_NAME v$PROJECT_VERSION"

# Paso 1: Instalar dependencias
print_status "Instalando dependencias..."
npm install

# Paso 2: Compilar el proyecto
print_status "Compilando el proyecto..."
npm run compile

# Verificar que la compilación fue exitosa
if [ ! -d "out" ]; then
    print_error "La compilación falló. No se encontró el directorio 'out'."
    exit 1
fi

print_success "Compilación exitosa."

# Paso 3: Ejecutar tests (opcional)
if [ "$1" != "--skip-tests" ]; then
    print_status "Ejecutando tests..."
    if npm test; then
        print_success "Tests pasaron correctamente."
    else
        print_warning "Algunos tests fallaron, pero continuando con el empaquetado..."
    fi
else
    print_warning "Saltando tests..."
fi

# Paso 4: Limpiar packages anteriores
if [ -f "$PACKAGE_FILE" ]; then
    print_status "Removiendo package anterior: $PACKAGE_FILE"
    rm "$PACKAGE_FILE"
fi

# Paso 5: Empaquetar la extensión
print_status "Empaquetando la extensión..."
vsce package

if [ ! -f "$PACKAGE_FILE" ]; then
    print_error "El empaquetado falló. No se encontró $PACKAGE_FILE."
    exit 1
fi

print_success "Extensión empaquetada: $PACKAGE_FILE"

# Paso 6: Desinstalar versión anterior (si existe)
EXTENSION_ID="mcp-gamification.mcp-socket-gamification-manager"
if code --list-extensions | grep -q "$EXTENSION_ID"; then
    print_status "Desinstalando versión anterior..."
    code --uninstall-extension "$EXTENSION_ID"
    print_success "Versión anterior desinstalada."
fi

# Paso 7: Instalar la nueva extensión
print_status "Instalando la nueva extensión..."
code --install-extension "$PACKAGE_FILE"

# Verificar instalación
if code --list-extensions | grep -q "$EXTENSION_ID"; then
    print_success "¡Extensión instalada exitosamente!"
else
    print_error "La instalación falló."
    exit 1
fi

# Resumen
echo ""
echo "📋 Resumen:"
echo "   • Proyecto: $PROJECT_NAME"
echo "   • Versión: $PROJECT_VERSION"
echo "   • Package: $PACKAGE_FILE"
echo "   • Estado: ✅ Instalado y listo para usar"
echo ""
echo "🧪 Para probar la extensión:"
echo "   1. Abre VS Code"
echo "   2. Presiona Ctrl+Shift+P"
echo "   3. Busca comandos 'MCP Manager' o 'AlephScript'"
echo "   4. Prueba el chat participant con '@mcp' (si tienes Copilot)"
echo ""
echo "🔄 Para actualizar, ejecuta este script nuevamente."
echo ""
print_success "¡Listo para usar! 🎉"