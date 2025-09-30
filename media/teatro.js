// Teatro WebView JavaScript

// Global variables
let vscode = null;
if (typeof window !== 'undefined') {
    if (window.vscode) {
        vscode = window.vscode;
    } else if (typeof acquireVsCodeApi === 'function') {
        try {
            vscode = acquireVsCodeApi();
            window.vscode = vscode;
        } catch (error) {
            console.warn('VS Code API already acquired elsewhere, using existing window.vscode if any');
            vscode = window.vscode || null;
        }
    }
}
let currentAgents = [];
let currentStatus = { total: 0, active: 0, inactive: 0 };

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // No need to acquire API here, it's done globally
    initializeEventListeners();
    requestInitialData();
    setInterval(requestInitialData, 5000); // Refresh data every 5 seconds
});

// Handle messages from the extension
window.addEventListener('message', event => {
    const message = event.data;
    
    switch (message.command) {
        case 'updateStatus':
            updateStatus(message.status);
            updateAgents(message.activeAgents);
            break;
    }
});

// Update status display
function updateStatus(status) {
    currentStatus = status;
    
    const totalElement = document.getElementById('totalAgents');
    const activeElement = document.getElementById('activeAgents');
    const inactiveElement = document.getElementById('inactiveAgents');
    
    if (totalElement) totalElement.textContent = status.total;
    if (activeElement) activeElement.textContent = status.active;
    if (inactiveElement) inactiveElement.textContent = status.inactive;
}

// Update agents display
function updateAgents(agents) {
    currentAgents = agents;
    const container = document.getElementById('agentsContainer');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    // Get all agents (we'll need to get inactive ones too)
    const allAgents = [
        {
            id: 'isaac',
            name: 'Isaac',
            fullName: 'Isaac - El Marinero',
            description: 'Tu marinero fiel para navegación técnica y exploración de frameworks',
            specialization: 'Navegación Técnica & Documentación',
            icon: '⚓',
            isActive: agents.some(a => a.id === 'isaac')
        },
        {
            id: 'don-alvaro',
            name: 'Don Álvaro',
            fullName: 'Don Álvaro - Capataz de Astilleros',
            description: 'Ingeniero especializado en mantenimiento y optimización de frameworks',
            specialization: 'Mantenimiento & Optimización',
            icon: '🔧',
            isActive: agents.some(a => a.id === 'don-alvaro')
        },
        {
            id: 'capitan-didac',
            name: 'Capitán Dídac',
            fullName: 'Capitán Dídac - Líder de Expedición',
            description: 'Liderazgo técnico para navegación en territorios desconocidos',
            specialization: 'Liderazgo & Estrategia',
            icon: '👑',
            isActive: agents.some(a => a.id === 'capitan-didac')
        },
        {
            id: 'indra',
            name: 'Indra',
            fullName: 'Indra - Agente de Integración',
            description: 'Especialista en integración cross-component y comunicación entre servicios',
            specialization: 'Integración & Comunicación',
            icon: '🔗',
            isActive: agents.some(a => a.id === 'indra')
        },
        {
            id: 'backend-agent',
            name: 'Backend Agent',
            fullName: 'Backend Agent - Arquitecto de Backend',
            description: 'Especialista en desarrollo de backend, APIs y arquitectura de servidores',
            specialization: 'Backend & APIs',
            icon: '🖥️',
            isActive: agents.some(a => a.id === 'backend-agent')
        }
    ];
    
    allAgents.forEach(agent => {
        const agentCard = createAgentCard(agent);
        container.appendChild(agentCard);
    });
}

// Create agent card element
function createAgentCard(agent) {
    const card = document.createElement('div');
    card.className = `agent-card ${agent.isActive ? 'active' : 'inactive'}`;
    
    const statusIndicator = agent.isActive 
        ? '<span class="status-indicator active">🟢 Activo</span>'
        : '<span class="status-indicator inactive">💤 Inactivo</span>';
    
    const primaryAction = agent.isActive
        ? `<button class="agent-btn primary" onclick="openChatParticipant('${agent.id}')">💬 Abrir Chat</button>`
        : `<button class="agent-btn success" onclick="activateAgent('${agent.id}')">▶️ Activar</button>`;
    
    const secondaryAction = agent.isActive
        ? `<button class="agent-btn warning" onclick="deactivateAgent('${agent.id}')">⏸️ Desactivar</button>`
        : `<button class="agent-btn secondary" onclick="showAgentInfo('${agent.id}')">ℹ️ Info</button>`;
    
    card.innerHTML = `
        <div class="agent-info">
            <div class="agent-name">
                <span>${agent.icon}</span>
                <span>${agent.name}</span>
                ${statusIndicator}
            </div>
            <div class="agent-description">${agent.description}</div>
            <div class="agent-specialization">${agent.specialization}</div>
        </div>
        <div class="agent-actions">
            ${primaryAction}
            ${secondaryAction}
        </div>
    `;
    
    return card;
}

// Action functions
function activateAgent(agentId) {
    if (vscode) {
        vscode.postMessage({
            command: 'activateAgent',
            agentId: agentId
        });
    } else {
        console.error("VS Code API not available, cannot activate agent.");
    }
}

function deactivateAgent(agentId) {
    if (vscode) {
        vscode.postMessage({
            command: 'deactivateAgent',
            agentId: agentId
        });
    } else {
        console.error("VS Code API not available, cannot deactivate agent.");
    }
}

function openChatParticipant(agentId, command = null) {
    if (vscode) {
        vscode.postMessage({
            command: 'openChatParticipant',
            agentId: agentId,
            command: command
        });
    } else {
        console.error("VS Code API not available, cannot open chat participant.");
    }
}

function refreshTeatro() {
    if (vscode) {
        vscode.postMessage({ command: 'refresh' });
        
        // Visual feedback
        const btn = event.target;
        const originalText = btn.innerHTML;
        btn.innerHTML = '🔄 Actualizando...';
        btn.disabled = true;
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 1000);
    } else {
        console.error("VS Code API not available, cannot refresh Teatro.");
    }
}

function openAllChats() {
    if (vscode) {
        // Open the chat panel
        vscode.postMessage({
            command: 'openChatParticipant',
            agentId: 'general',
            command: 'panel'
        });
    } else {
        console.error("VS Code API not available, cannot open all chats.");
    }
}

function showSystemInfo() {
    const info = `
🎭 Teatro de Agentes - Información del Sistema

📊 Estado Actual:
• Total de Agentes: ${currentStatus.total}
• Agentes Activos: ${currentStatus.active}
• Agentes Inactivos: ${currentStatus.inactive}

🎪 Agentes Disponibles:
${currentAgents.map(agent => `• ${agent.icon || '🤖'} ${agent.name} - ${agent.specialization}`).join('\n')}

⚡ Sistema Operativo: VS Code Extension
🔧 Versión: Teatro v1.0
📅 Última Actualización: ${new Date().toLocaleString()}
    `;
    
    // Send to VS Code for display
    if (vscode) {
        vscode.postMessage({
            command: 'openChatParticipant',
            agentId: 'system',
            command: 'info'
        });
    } else {
        console.error("VS Code API not available, cannot show system info.");
    }
}

function showAgentInfo(agentId) {
    if (vscode) {
        vscode.postMessage({
            command: 'openChatParticipant',
            agentId: agentId,
            command: 'info'
        });
    } else {
        console.error("VS Code API not available, cannot show agent info.");
    }
}

// Request initial data from the extension
function requestInitialData() {
    if (vscode) {
        vscode.postMessage({ command: 'getInitialData' });
    } else {
        console.error("VS Code API not available, cannot request initial data.");
    }
}

// Utility functions
function formatTimestamp() {
    return new Date().toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Auto-refresh every 30 seconds
setInterval(() => {
    if (vscode) {
        vscode.postMessage({ command: 'getStatus' });
    } else {
        console.error("VS Code API not available, cannot auto-refresh.");
    }
}, 30000);

console.log('🎭 Teatro WebView JavaScript loaded successfully');