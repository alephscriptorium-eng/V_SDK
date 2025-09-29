#!/bin/bash

# Script para configurar el comando 'code' de VS Code en macOS/Unix
# Este script agrega VS Code al PATH para poder usar el comando 'code' desde terminal

echo "🔧 Configurando VS Code CLI para macOS..."

# Detectar la ruta de VS Code en macOS
VSCODE_PATH="/Applications/Visual Studio Code.app/Contents/Resources/app/bin"

# Verificar si VS Code está instalado
if [ ! -d "/Applications/Visual Studio Code.app" ]; then
    echo "❌ Error: VS Code no está instalado en /Applications/Visual Studio Code.app"
    echo "   Por favor, instala VS Code desde https://code.visualstudio.com/"
    exit 1
fi

# Verificar si ya existe en el PATH
if command -v code &> /dev/null; then
    echo "✅ El comando 'code' ya está disponible"
    echo "   Versión: $(code --version | head -1)"
    exit 0
fi

# Determinar el archivo de configuración de shell
SHELL_CONFIG=""
if [ -n "$ZSH_VERSION" ] || [ "$SHELL" = "/bin/zsh" ] || [ "$SHELL" = "/usr/bin/zsh" ]; then
    SHELL_CONFIG="$HOME/.zshrc"
    echo "🐚 Detectado Zsh shell"
elif [ -n "$BASH_VERSION" ] || [ "$SHELL" = "/bin/bash" ] || [ "$SHELL" = "/usr/bin/bash" ]; then
    SHELL_CONFIG="$HOME/.bash_profile"
    echo "🐚 Detectado Bash shell"
else
    echo "⚠️  Shell no detectado automáticamente. Usando .bash_profile por defecto."
    SHELL_CONFIG="$HOME/.bash_profile"
fi

# Crear el archivo de configuración si no existe
if [ ! -f "$SHELL_CONFIG" ]; then
    touch "$SHELL_CONFIG"
    echo "📄 Creado archivo de configuración: $SHELL_CONFIG"
fi

# Verificar si ya está configurado
if grep -q "Visual Studio Code" "$SHELL_CONFIG"; then
    echo "⚠️  VS Code ya parece estar configurado en $SHELL_CONFIG"
else
    # Agregar VS Code al PATH
    echo "" >> "$SHELL_CONFIG"
    echo "# Visual Studio Code CLI" >> "$SHELL_CONFIG"
    echo "export PATH=\"\$PATH:$VSCODE_PATH\"" >> "$SHELL_CONFIG"
    echo "✅ Agregado VS Code al PATH en $SHELL_CONFIG"
fi

# Aplicar los cambios en la sesión actual
export PATH="$PATH:$VSCODE_PATH"

# Verificar que funciona
if command -v code &> /dev/null; then
    echo "✅ ¡Configuración exitosa!"
    echo "   El comando 'code' está ahora disponible"
    echo "   Versión: $(code --version | head -1)"
    echo ""
    echo "📝 Para usar en nuevas terminales, ejecuta:"
    echo "   source $SHELL_CONFIG"
    echo "   o abre una nueva terminal"
else
    echo "❌ Error: No se pudo configurar el comando 'code'"
    echo "   Intenta reiniciar la terminal o ejecutar:"
    echo "   export PATH=\"\$PATH:$VSCODE_PATH\""
fi

echo ""
echo "🚀 Ahora puedes usar comandos como:"
echo "   code .                    # Abrir directorio actual"
echo "   code archivo.txt          # Abrir archivo específico"
echo "   code --install-extension  # Instalar extensiones"