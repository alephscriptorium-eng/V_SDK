// Agent Content Editor JavaScript

// Global variables
let vscode;
let currentContent = '';
let isPreviewOpen = false;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Acquire VS Code API
    vscode = acquireVsCodeApi();
    
    // Initialize editor
    initializeEditor();
    
    console.log('🎭 Agent Content Editor initialized');
});

// Handle messages from the extension
window.addEventListener('message', event => {
    const message = event.data;
    
    switch (message.type) {
        case 'update':
            updateContent(message.text);
            break;
    }
});

function initializeEditor() {
    const textarea = document.getElementById('contentTextarea');
    const saveBtn = document.getElementById('saveBtn');
    const validateBtn = document.getElementById('validateBtn');
    const openConfigBtn = document.getElementById('openConfigBtn');
    const previewBtn = document.getElementById('previewBtn');
    const closePreviewBtn = document.getElementById('closePreviewBtn');
    const closeValidationBtn = document.getElementById('closeValidationBtn');

    // Set up event listeners
    if (textarea) {
        textarea.addEventListener('input', handleContentChange);
        textarea.addEventListener('keydown', handleKeydown);
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', saveContent);
    }

    if (validateBtn) {
        validateBtn.addEventListener('click', validateContent);
    }

    if (openConfigBtn) {
        openConfigBtn.addEventListener('click', openConfigFile);
    }

    if (previewBtn) {
        previewBtn.addEventListener('click', togglePreview);
    }

    if (closePreviewBtn) {
        closePreviewBtn.addEventListener('click', closePreview);
    }

    if (closeValidationBtn) {
        closeValidationBtn.addEventListener('click', closeValidation);
    }

    // Set up toolbar buttons
    setupToolbarButtons();

    // Set up quick guides
    setupQuickGuides();

    // Set up structure tree
    setupStructureTree();

    // Set up metadata editor
    setupMetadataEditor();
}

function updateContent(content) {
    currentContent = content;
    const textarea = document.getElementById('contentTextarea');
    if (textarea) {
        textarea.value = content;
        updateStats();
        parseStructure();
        parseMetadata();
    }
}

function handleContentChange(event) {
    currentContent = event.target.value;
    updateStats();
    parseStructure();
    
    // Debounced validation
    clearTimeout(window.validationTimeout);
    window.validationTimeout = setTimeout(() => {
        validateContentSilent();
    }, 1000);
}

function handleKeydown(event) {
    // Handle special key combinations
    if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
            case 's':
                event.preventDefault();
                saveContent();
                break;
            case 'b':
                event.preventDefault();
                insertMarkdown('**', '**');
                break;
            case 'i':
                event.preventDefault();
                insertMarkdown('*', '*');
                break;
        }
    }

    // Handle tab for indentation
    if (event.key === 'Tab') {
        event.preventDefault();
        insertAtCursor('    '); // 4 spaces
    }
}

function insertMarkdown(before, after) {
    const textarea = document.getElementById('contentTextarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    const newText = before + selectedText + after;
    textarea.setRangeText(newText, start, end, 'end');
    
    // Update content
    currentContent = textarea.value;
    updateStats();
}

function insertAtCursor(text) {
    const textarea = document.getElementById('contentTextarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    textarea.setRangeText(text, start, end, 'end');
    
    // Update content
    currentContent = textarea.value;
    updateStats();
}

function setupToolbarButtons() {
    const toolbarBtns = document.querySelectorAll('.toolbar-btn');
    
    toolbarBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action');
            handleToolbarAction(action);
        });
    });
}

function handleToolbarAction(action) {
    switch (action) {
        case 'bold':
            insertMarkdown('**', '**');
            break;
        case 'italic':
            insertMarkdown('*', '*');
            break;
        case 'code':
            insertMarkdown('`', '`');
            break;
        case 'emoji':
            showEmojiPicker();
            break;
        case 'header1':
            insertAtCursor('\n# ');
            break;
        case 'header2':
            insertAtCursor('\n## ');
            break;
        case 'header3':
            insertAtCursor('\n### ');
            break;
        case 'list':
            insertAtCursor('\n- ');
            break;
    }
}

function showEmojiPicker() {
    const commonEmojis = ['🎭', '⚓', '🌊', '🔧', '⚡', '🎯', '📋', '🧭', '🚢', '🏴‍☠️', '👨‍✈️', '🗺️', '📜', '⚙️', '🔗', '🎪', '🏗️', '🎨'];
    const emoji = prompt('Selecciona un emoji:\n' + commonEmojis.join(' '));
    if (emoji && emoji.length <= 2) {
        insertAtCursor(emoji);
    }
}

function setupQuickGuides() {
    const guideBtns = document.querySelectorAll('.guide-btn');
    
    guideBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const guide = btn.getAttribute('data-guide');
            insertGuideTemplate(guide);
        });
    });
}

function insertGuideTemplate(guide) {
    let template = '';
    
    switch (guide) {
        case 'personality':
            template = `
## Mi Personalidad 👤

### Estilo de Comunicación
- **Tono**: [Describe tu tono]
- **Formalidad**: [Nivel de formalidad]
- **Emojis**: [Frecuencia de uso]

### Relación con el Usuario
- **Tipo**: [Profesional/Amigable/Leal/etc.]
- **Dinámicas**: [Cómo interactúas]
`;
            break;
        case 'commands':
            template = `
### Comandos Disponibles ⚡

#### \`/comando1\` - Descripción
Usado para [propósito del comando]:
- [Función 1]
- [Función 2]
- [Función 3]

#### \`/comando2\` - Descripción
Usado para [propósito del comando]:
- [Función 1]
- [Función 2]
`;
            break;
        case 'capabilities':
            template = `
## Mis Capacidades 🔧

### Especialización Principal
- **[Área 1]**: [Descripción]
- **[Área 2]**: [Descripción]
- **[Área 3]**: [Descripción]

### Herramientas que Domino
\`\`\`
- [Herramienta 1]: [Descripción de uso]
- [Herramienta 2]: [Descripción de uso]
- [Herramienta 3]: [Descripción de uso]
\`\`\`
`;
            break;
        case 'relationships':
            template = `
## Mis Relaciones 🤝

### Con el Capitán/Usuario
[Describe la relación especial]

### Con Otros Agentes
- **[Agente 1]**: [Tipo de relación]
- **[Agente 2]**: [Tipo de relación]

### Códigos y Señales
- **"[Código 1]"**: [Significado]
- **"[Código 2]"**: [Significado]
`;
            break;
    }
    
    insertAtCursor(template);
}

function parseStructure() {
    const structureTree = document.getElementById('structureTree');
    if (!structureTree) return;
    
    const headers = currentContent.match(/^#{1,6}\s+(.+)$/gm) || [];
    structureTree.innerHTML = '';
    
    headers.forEach((header, index) => {
        const level = header.match(/^#{1,6}/)[0].length;
        const text = header.replace(/^#{1,6}\s+/, '');
        
        const item = document.createElement('div');
        item.className = 'structure-item';
        item.style.paddingLeft = `${8 + (level - 1) * 16}px`;
        item.textContent = text;
        item.addEventListener('click', () => scrollToHeader(text));
        
        structureTree.appendChild(item);
    });
}

function scrollToHeader(headerText) {
    const textarea = document.getElementById('contentTextarea');
    const content = textarea.value;
    const index = content.indexOf(headerText);
    
    if (index !== -1) {
        // Calculate approximate line number
        const beforeText = content.substring(0, index);
        const lineNumber = beforeText.split('\n').length;
        
        // Scroll to approximate position
        const lineHeight = 20; // Approximate line height
        textarea.scrollTop = (lineNumber - 1) * lineHeight;
        
        // Focus and set cursor
        textarea.focus();
        textarea.setSelectionRange(index, index);
    }
}

function parseMetadata() {
    const metadataEditor = document.getElementById('metadataEditor');
    if (!metadataEditor) return;
    
    const frontmatterMatch = currentContent.match(/^---\s*\n([\s\S]*?)\n---/);
    let metadata = {};
    
    if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        frontmatter.split('\n').forEach(line => {
            const match = line.match(/^(.+?):\s*(.+)$/);
            if (match) {
                metadata[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
            }
        });
    }
    
    // Update metadata editor
    metadataEditor.innerHTML = '';
    
    const fields = ['name', 'title', 'emoji', 'category', 'version', 'author'];
    fields.forEach(field => {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'metadata-field';
        
        const label = document.createElement('label');
        label.textContent = field.charAt(0).toUpperCase() + field.slice(1) + ':';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = metadata[field] || '';
        input.addEventListener('change', () => updateMetadata(field, input.value));
        
        fieldDiv.appendChild(label);
        fieldDiv.appendChild(input);
        metadataEditor.appendChild(fieldDiv);
    });
}

function updateMetadata(field, value) {
    const frontmatterMatch = currentContent.match(/^---\s*\n([\s\S]*?)\n---/);
    let frontmatter = '';
    let content = currentContent;
    
    if (frontmatterMatch) {
        frontmatter = frontmatterMatch[1];
        content = currentContent.replace(/^---\s*\n([\s\S]*?)\n---\s*\n?/, '');
    }
    
    // Update or add field
    const fieldRegex = new RegExp(`^${field}:.*$`, 'm');
    const newLine = `${field}: "${value}"`;
    
    if (fieldRegex.test(frontmatter)) {
        frontmatter = frontmatter.replace(fieldRegex, newLine);
    } else {
        frontmatter += (frontmatter ? '\n' : '') + newLine;
    }
    
    // Reconstruct content
    const newContent = `---\n${frontmatter}\n---\n\n${content}`;
    
    // Update textarea
    const textarea = document.getElementById('contentTextarea');
    textarea.value = newContent;
    currentContent = newContent;
    
    updateStats();
}

function updateStats() {
    const words = currentContent.split(/\s+/).filter(word => word.length > 0).length;
    const chars = currentContent.length;
    const lines = currentContent.split('\n').length;
    
    const wordCountEl = document.getElementById('wordCount');
    const charCountEl = document.getElementById('charCount');
    const lineCountEl = document.getElementById('lineCount');
    
    if (wordCountEl) wordCountEl.textContent = `${words} palabras`;
    if (charCountEl) charCountEl.textContent = `${chars} caracteres`;
    if (lineCountEl) lineCountEl.textContent = `${lines} líneas`;
}

function saveContent() {
    vscode.postMessage({
        type: 'save',
        content: currentContent
    });
}

function validateContent() {
    vscode.postMessage({
        type: 'validate',
        content: currentContent
    });
    
    // Show validation panel
    const validationPanel = document.getElementById('validationPanel');
    const validationResults = document.getElementById('validationResults');
    
    if (validationPanel && validationResults) {
        validationPanel.style.display = 'flex';
        validationResults.innerHTML = '<div class="validation-item">⏳ Validando contenido...</div>';
    }
}

function validateContentSilent() {
    const errors = [];
    const warnings = [];
    
    // Basic validation
    if (!currentContent.match(/^---\s*\n([\s\S]*?)\n---/)) {
        errors.push('El archivo debe comenzar con frontmatter YAML');
    }
    
    const requiredSections = ['Mi Identidad', 'Especialización', 'Capacidades'];
    requiredSections.forEach(section => {
        if (!currentContent.includes(section)) {
            warnings.push(`Sección recomendada faltante: ${section}`);
        }
    });
    
    const wordCount = currentContent.split(/\s+/).length;
    if (wordCount < 300) {
        warnings.push('El contenido parece muy breve (menos de 300 palabras)');
    }
    
    // Update status indicator
    const statusIndicator = document.querySelector('.validation-status .status-indicator');
    if (statusIndicator) {
        if (errors.length > 0) {
            statusIndicator.textContent = `❌ ${errors.length} errores`;
            statusIndicator.className = 'status-indicator invalid';
        } else if (warnings.length > 0) {
            statusIndicator.textContent = `⚠️ ${warnings.length} advertencias`;
            statusIndicator.className = 'status-indicator warning';
        } else {
            statusIndicator.textContent = '✅ Contenido válido';
            statusIndicator.className = 'status-indicator valid';
        }
    }
}

function openConfigFile() {
    vscode.postMessage({
        type: 'openConfig'
    });
}

function togglePreview() {
    const previewPanel = document.getElementById('editorPreview');
    const previewContent = document.getElementById('previewContent');
    
    if (!isPreviewOpen) {
        // Show preview
        previewPanel.style.display = 'flex';
        isPreviewOpen = true;
        
        // Convert markdown to HTML (basic implementation)
        const html = markdownToHtml(currentContent);
        previewContent.innerHTML = html;
        
        // Update button text
        const previewBtn = document.getElementById('previewBtn');
        if (previewBtn) {
            previewBtn.innerHTML = '❌ Cerrar Vista Previa';
        }
    } else {
        closePreview();
    }
}

function closePreview() {
    const previewPanel = document.getElementById('editorPreview');
    previewPanel.style.display = 'none';
    isPreviewOpen = false;
    
    // Update button text
    const previewBtn = document.getElementById('previewBtn');
    if (previewBtn) {
        previewBtn.innerHTML = '👁️ Vista Previa';
    }
}

function closeValidation() {
    const validationPanel = document.getElementById('validationPanel');
    validationPanel.style.display = 'none';
}

function markdownToHtml(markdown) {
    // Remove frontmatter
    const content = markdown.replace(/^---\s*\n([\s\S]*?)\n---\s*\n?/, '');
    
    // Basic markdown conversion
    return content
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/`(.*?)`/gim, '<code>$1</code>')
        .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
        .replace(/^\- (.*$)/gim, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
        .replace(/\n/gim, '<br>');
}

console.log('🎭 Agent Content Editor JavaScript loaded successfully');