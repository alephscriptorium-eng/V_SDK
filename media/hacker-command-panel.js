// Hacker Command Panel JavaScript - Command Registry Terminal

(function() {
    'use strict';

    // Acquire the VS Code API once and store it. Reuse if already set on window.
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
    
    let commandCategories = [];
    let timeInterval;

    // Initialize the panel
    document.addEventListener('DOMContentLoaded', function() {
        startMatrixTime();
        requestCommands();
        setupEventListeners();
        
        // Request command refresh every 30 seconds
        setInterval(requestCommands, 30000);
    });

    // Setup event listeners for buttons
    function setupEventListeners() {
        // Add a single delegated event listener for the entire panel
        document.addEventListener('click', handleDocumentClick);
    }

    // Toggle category collapse/expand
    function toggleCategory(categoryId) {
        const categoryElement = document.getElementById(categoryId);
        
        if (!categoryElement) {
            console.error('Category element not found for ID:', categoryId);
            return;
        }
        
        const headerElement = categoryElement.previousElementSibling;
        const toggle = headerElement ? headerElement.querySelector('.category-toggle') : null;
        
        if (categoryElement.classList.contains('expanded')) {
            // Collapse the category
            categoryElement.classList.remove('expanded');
            categoryElement.classList.add('collapsed');
            if (toggle) toggle.classList.add('collapsed');
            localStorage.setItem(categoryId, 'collapsed');
        } else {
            // Expand the category
            categoryElement.classList.remove('collapsed');
            categoryElement.classList.add('expanded');
            if (toggle) toggle.classList.remove('collapsed');
            localStorage.removeItem(categoryId);
        }
    }
    
    // Separate click handler function to avoid duplicates
    function handleDocumentClick(event) {
        const target = event.target.closest('[data-action], [data-execute-command], [data-execute-command-input], [data-show-command-info], [data-toggle-category], [data-close-modal]');
        
        if (!target) return;

        // Handle command control buttons
        if (target.hasAttribute('data-action')) {
            const action = target.getAttribute('data-action');
            switch (action) {
                case 'refreshCommands':
                    refreshCommands();
                    break;
                case 'showAllCommands':
                    showAllCommands();
                    break;
                case 'exportCommands':
                    exportCommands();
                    break;
            }
        }
        
        // Handle command execution
        if (target.hasAttribute('data-execute-command')) {
            const commandId = target.getAttribute('data-execute-command');
            executeCommand(commandId);
        }
        
        // Handle command execution with input
        if (target.hasAttribute('data-execute-command-input')) {
            const commandId = target.getAttribute('data-execute-command-input');
            const inputType = target.getAttribute('data-input-type');
            executeCommandWithInput(commandId, inputType);
        }
        
        // Handle command info
        if (target.hasAttribute('data-show-command-info')) {
            const commandId = target.getAttribute('data-show-command-info');
            showCommandInfo(commandId);
        }
        
        // Handle category toggle
        if (target.hasAttribute('data-toggle-category')) {
            const categoryId = target.getAttribute('data-toggle-category');
            toggleCategory(categoryId);
        }
        
        // Handle modal close
        if (target.hasAttribute('data-close-modal')) {
            closeInfoModal();
        }
    }

    // Matrix Rain removed

    // Matrix Time Display
    function startMatrixTime() {
        function updateTime() {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-US', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            const dateStr = now.toISOString().split('T')[0];
            const timeElement = document.getElementById('matrixTime');
            if (timeElement) {
                timeElement.textContent = `${dateStr}_${timeStr}`;
            }
        }
        
        updateTime();
        timeInterval = setInterval(updateTime, 1000);
    }

    // Message handling from VS Code extension
    window.addEventListener('message', event => {
        const message = event.data;
        
        switch (message.command) {
            case 'updateCommands':
                updateCommandDisplay(message.data);
                break;
            case 'commandExecuted':
                handleCommandExecuted(message);
                break;
            case 'commandInfo':
                showCommandInfo(message.data);
                break;
            case 'showMessage':
                showStatusMessage(message.message);
                break;
        }
    });

    // Request commands from extension
    function requestCommands() {
        vscode.postMessage({
            command: 'refreshCommands'
        });
    }

    // Global functions for button clicks
    window.refreshCommands = function() {
        showStatusMessage('>>> RESCANNING COMMAND REGISTRY...');
        vscode.postMessage({
            command: 'refreshCommands'
        });
    };

    window.showAllCommands = function() {
        vscode.postMessage({
            command: 'showAllCommands'
        });
    };

    window.exportCommands = function() {
        showStatusMessage('>>> EXPORTING COMMAND REGISTRY...');
        vscode.postMessage({
            command: 'exportCommands'
        });
    };

    // Update command display
    function updateCommandDisplay(data) {
        commandCategories = data.categories;
        renderCommandCategories();
        updateStats(data);
        updateProcessCount();
    }

    // Render command categories
    function renderCommandCategories() {
        const container = document.getElementById('commandPanels');
        
        if (!commandCategories || commandCategories.length === 0) {
            container.innerHTML = `
                <div class="loading-commands">
                    <span class="blinking-text">>>> NO COMMANDS DETECTED IN REGISTRY...</span>
                </div>
            `;
            return;
        }

        let html = '';
        
        commandCategories.forEach((category, categoryIndex) => {
            const categoryId = `category-${categoryIndex}`;
            const isCollapsed = localStorage.getItem(categoryId) === 'collapsed';
            
            html += `
                <div class="command-category">
                    <div class="category-header" data-toggle-category="${categoryId}">
                        <div class="category-info">
                            <span class="category-toggle ${isCollapsed ? 'collapsed' : ''}">▼</span>
                            <span class="category-icon">${category.icon}</span>
                            <span class="category-title">${category.name}</span>
                            <span class="category-description">${category.description}</span>
                        </div>
                        <div class="category-stats">
                            <span>CMDS: ${category.commands.length}</span>
                            <span>EXEC: ${getTotalExecutions(category.commands)}</span>
                        </div>
                    </div>
                    <div class="commands-table ${isCollapsed ? 'collapsed' : 'expanded'}" id="${categoryId}">
                        ${renderCommandTable(category.commands)}
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    // Render command table
    function renderCommandTable(commands) {
        if (!commands || commands.length === 0) {
            return '<div class="loading-commands">No commands in this category</div>';
        }

        let tableHtml = `
            <table class="command-table">
                <thead>
                    <tr>
                        <th>🔧</th>
                        <th>Command ID</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>⌨️</th>
                        <th>📊</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        commands.forEach(command => {
            const executionCount = command.executionCount || 0;
            const lastExecuted = command.lastExecuted ? 
                new Date(command.lastExecuted).toLocaleTimeString() : 'Never';
            
            tableHtml += `
                <tr id="cmd-${command.id}" class="command-row">
                    <td class="command-icon">${command.icon || '⚡'}</td>
                    <td class="command-id" title="${command.id}">${command.id}</td>
                    <td class="command-title" title="${command.title}">${command.title}</td>
                    <td class="command-description" title="${command.description || 'No description'}">${command.description || 'No description'}</td>
                    <td class="command-shortcut">
                        ${command.shortcut ? `<span class="command-shortcut">${command.shortcut}</span>` : '-'}
                    </td>
                    <td class="command-stats">
                        <div class="exec-count">${executionCount}</div>
                        <div class="last-executed">${lastExecuted}</div>
                    </td>
                    <td class="command-actions">
                        ${generateActionButtons(command)}
                    </td>
                </tr>
            `;
        });

        tableHtml += `
                </tbody>
            </table>
        `;

        return tableHtml;
    }

    // Generate action buttons for command
    function generateActionButtons(command) {
        let buttons = '';

        if (command.requiresInput) {
            buttons += `
                <button class="cmd-btn with-input" 
                        data-execute-command-input="${command.id}" 
                        data-input-type="${command.inputType}">
                    EXEC<span class="input-indicator">?</span>
                </button>
            `;
        } else {
            buttons += `
                <button class="cmd-btn execute" data-execute-command="${command.id}">
                    EXEC
                </button>
            `;
        }

        buttons += `
            <button class="cmd-btn info" data-show-command-info="${command.id}">
                INFO
            </button>
        `;

        return buttons;
    }

    // Toggle category collapse/expand
    window.toggleCategory = function(categoryId) {
        const categoryElement = document.getElementById(categoryId);
        
        if (!categoryElement) {
            console.error('Category element not found for ID:', categoryId);
            return;
        }
        
        const headerElement = categoryElement.previousElementSibling;
        const toggle = headerElement ? headerElement.querySelector('.category-toggle') : null;
        
        if (categoryElement.classList.contains('expanded')) {
            // Collapse the category
            categoryElement.classList.remove('expanded');
            categoryElement.classList.add('collapsed');
            if (toggle) toggle.classList.add('collapsed');
            localStorage.setItem(categoryId, 'collapsed');
        } else {
            // Expand the category
            categoryElement.classList.remove('collapsed');
            categoryElement.classList.add('expanded');
            if (toggle) toggle.classList.remove('collapsed');
            localStorage.removeItem(categoryId);
        }
    };

    // Execute command
    window.executeCommand = function(commandId) {
        console.log(`JavaScript: executeCommand called with commandId: ${commandId}`);
        showStatusMessage(`>>> EXECUTING: ${commandId}`);
        
        const commandRow = document.getElementById(`cmd-${commandId}`);
        if (commandRow) {
            commandRow.classList.add('command-executed');
            setTimeout(() => {
                commandRow.classList.remove('command-executed');
            }, 1000);
        }

        vscode.postMessage({
            command: 'executeCommand',
            commandId: commandId
        });
        console.log(`JavaScript: Sent executeCommand message for: ${commandId}`);
    };

    // Execute command with input
    window.executeCommandWithInput = function(commandId, inputType) {
        showStatusMessage(`>>> REQUESTING INPUT FOR: ${commandId}`);
        
        vscode.postMessage({
            command: 'requestInput',
            commandId: commandId,
            inputType: inputType
        });
    };

    // Show command info
    window.showCommandInfo = function(commandId) {
        vscode.postMessage({
            command: 'getCommandInfo',
            commandId: commandId
        });
    };

    // Handle command execution result
    function handleCommandExecuted(message) {
        const commandRow = document.getElementById(`cmd-${message.commandId}`);
        
        if (commandRow) {
            if (message.success) {
                commandRow.classList.add('command-executed');
                setTimeout(() => {
                    commandRow.classList.remove('command-executed');
                }, 1000);
            } else {
                commandRow.classList.add('command-error');
                setTimeout(() => {
                    commandRow.classList.remove('command-error');
                }, 1000);
            }
        }

        showStatusMessage(message.message);
        
        // Refresh the display to update execution counts
        setTimeout(() => {
            requestCommands();
        }, 1000);
    }

    // Show command info modal
    function showCommandInfo(commandInfo) {
        const infoHtml = `
            <div class="command-info-modal">
                <h3>🔧 COMMAND DETAILS</h3>
                <div class="info-grid">
                    <div><strong>ID:</strong> ${commandInfo.id}</div>
                    <div><strong>Title:</strong> ${commandInfo.title}</div>
                    <div><strong>Category:</strong> ${commandInfo.category}</div>
                    <div><strong>Description:</strong> ${commandInfo.description || 'No description'}</div>
                    <div><strong>Requires Input:</strong> ${commandInfo.requiresInput ? 'Yes' : 'No'}</div>
                    ${commandInfo.inputType ? `<div><strong>Input Type:</strong> ${commandInfo.inputType}</div>` : ''}
                    <div><strong>Executions:</strong> ${commandInfo.executionCount || 0}</div>
                    <div><strong>Last Executed:</strong> ${commandInfo.lastExecuted ? new Date(commandInfo.lastExecuted).toLocaleString() : 'Never'}</div>
                </div>
                <button data-close-modal="true">CLOSE</button>
            </div>
        `;
        
        showStatusMessage(infoHtml, 5000);
    }

    // Update statistics
    function updateStats(data) {
        const totalCommandsEl = document.getElementById('totalCommands');
        const totalCategoriesEl = document.getElementById('totalCategories');
        const totalExecutionsEl = document.getElementById('totalExecutions');

        if (totalCommandsEl) totalCommandsEl.textContent = data.totalCommands;
        if (totalCategoriesEl) totalCategoriesEl.textContent = data.totalCategories;
        if (totalExecutionsEl) totalExecutionsEl.textContent = data.totalExecutions;
    }

    // Update process count
    function updateProcessCount() {
        const processCountEl = document.getElementById('processCount');
        if (processCountEl) {
            processCountEl.textContent = commandCategories.length;
        }
    }

    // Get total executions for category
    function getTotalExecutions(commands) {
        return commands.reduce((sum, cmd) => sum + (cmd.executionCount || 0), 0);
    }

    // Show status message
    function showStatusMessage(message, duration = 2000) {
        // Remove existing status messages
        const existingMessages = document.querySelectorAll('.status-message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = 'status-message';
        messageDiv.innerHTML = message;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, duration);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        // Ctrl+R: Refresh commands
        if (event.ctrlKey && event.key === 'r') {
            event.preventDefault();
            refreshCommands();
        }
        
        // Ctrl+E: Export commands
        if (event.ctrlKey && event.key === 'e') {
            event.preventDefault();
            exportCommands();
        }
        
        // Ctrl+A: Show all commands
        if (event.ctrlKey && event.key === 'a') {
            event.preventDefault();
            showAllCommands();
        }
        
        // Escape: Close any open modals
        if (event.key === 'Escape') {
            event.preventDefault();
            const modals = document.querySelectorAll('.status-message');
            modals.forEach(modal => modal.remove());
        }
    });

    // Clean up on page unload
    window.addEventListener('beforeunload', function() {
        if (matrixInterval) {
            clearInterval(matrixInterval);
        }
        if (timeInterval) {
            clearInterval(timeInterval);
        }
    });

    // Add hover effects for command rows
    document.addEventListener('mouseover', function(event) {
        if (event.target.closest('.command-row')) {
            const row = event.target.closest('.command-row');
            row.style.transform = 'translateX(3px)';
            row.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.3)';
        }
    });

    document.addEventListener('mouseout', function(event) {
        if (event.target.closest('.command-row')) {
            const row = event.target.closest('.command-row');
            row.style.transform = 'translateX(0)';
            row.style.boxShadow = 'none';
        }
    });

})();