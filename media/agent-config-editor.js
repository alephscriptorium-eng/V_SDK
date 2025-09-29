// Agent Config Editor JavaScript

(function() {
    'use strict';

    // VS Code API
    const vscode = acquireVsCodeApi();

    // Global state
    let configData = {};
    let schema = {};
    let isModified = false;
    let validationErrors = [];

    // DOM elements
    let tabButtons = [];
    let tabPanels = [];
    let currentTab = 'basic';

    // Initialize the editor
    function init() {
        setupTabs();
        setupFormHandlers();
        setupKeyboardShortcuts();
        
        // Request initial data
        vscode.postMessage({
            type: 'ready'
        });
    }

    // Tab management
    function setupTabs() {
        tabButtons = Array.from(document.querySelectorAll('.tab-btn'));
        tabPanels = Array.from(document.querySelectorAll('.tab-panel'));

        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = e.target.dataset.tab;
                switchTab(tabId);
            });
        });
    }

    function switchTab(tabId) {
        // Update buttons
        tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });

        // Update panels
        tabPanels.forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabId}-tab`);
        });

        currentTab = tabId;
    }

    // Form handling
    function setupFormHandlers() {
        // Basic form inputs
        setupBasicFormInputs();
        
        // Tools and capabilities
        setupToolsAndCapabilities();
        
        // Array editors
        setupArrayEditors();
        
        // MCP configuration
        setupMCPConfiguration();
        
        // JSON editor
        setupJSONEditor();
        
        // Action buttons
        setupActionButtons();
    }

    function setupBasicFormInputs() {
        const inputs = document.querySelectorAll('#basic-tab input, #basic-tab textarea, #basic-tab select');
        
        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const field = e.target.name;
                const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
                
                updateConfigField(field, value);
            });
        });
    }

    function setupToolsAndCapabilities() {
        setupCheckboxGrid('tools', '.tools-grid');
        setupCheckboxGrid('capabilities', '.capabilities-grid');
    }

    function setupCheckboxGrid(category, selector) {
        const container = document.querySelector(selector);
        if (!container) return;

        container.addEventListener('click', (e) => {
            const item = e.target.closest('.tool-item, .capability-item');
            if (!item) return;

            const checkbox = item.querySelector('input[type="checkbox"]');
            const isChecked = checkbox.checked;
            
            // Toggle visual state
            item.classList.toggle('selected', isChecked);
            
            // Update config
            updateArrayConfig(category, checkbox.value, isChecked);
        });
    }

    function setupArrayEditors() {
        const arrayEditors = document.querySelectorAll('.array-editor');
        
        arrayEditors.forEach(editor => {
            const field = editor.dataset.field;
            const addBtn = editor.querySelector('.add-item');
            const itemsContainer = editor.querySelector('.array-items');
            
            if (addBtn) {
                addBtn.addEventListener('click', () => {
                    addArrayItem(field, itemsContainer);
                });
            }
            
            itemsContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('remove-item')) {
                    const item = e.target.closest('.array-item');
                    removeArrayItem(field, item);
                }
            });
            
            itemsContainer.addEventListener('input', (e) => {
                if (e.target.matches('.array-item input')) {
                    updateArrayFromDOM(field);
                }
            });
        });
    }

    function setupMCPConfiguration() {
        const testBtn = document.getElementById('test-mcp-connection');
        const addServerBtn = document.getElementById('add-mcp-server');
        
        if (testBtn) {
            testBtn.addEventListener('click', testMCPConnection);
        }
        
        if (addServerBtn) {
            addServerBtn.addEventListener('click', addMCPServer);
        }
    }

    function setupJSONEditor() {
        const textarea = document.getElementById('json-content');
        const formatBtn = document.getElementById('format-json');
        const validateBtn = document.getElementById('validate-json');
        
        if (textarea) {
            textarea.addEventListener('input', (e) => {
                try {
                    const data = JSON.parse(e.target.value);
                    configData = data;
                    markAsModified();
                    updateFormFromConfig();
                    validateConfiguration();
                } catch (error) {
                    // Invalid JSON - will be caught by validation
                }
            });
        }
        
        if (formatBtn) {
            formatBtn.addEventListener('click', formatJSON);
        }
        
        if (validateBtn) {
            validateBtn.addEventListener('click', validateConfiguration);
        }
    }

    function setupActionButtons() {
        const saveBtn = document.getElementById('save-config');
        const revertBtn = document.getElementById('revert-config');
        const previewBtn = document.getElementById('preview-config');
        
        if (saveBtn) {
            saveBtn.addEventListener('click', saveConfiguration);
        }
        
        if (revertBtn) {
            revertBtn.addEventListener('click', revertChanges);
        }
        
        if (previewBtn) {
            previewBtn.addEventListener('click', previewConfiguration);
        }
    }

    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                saveConfiguration();
            } else if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                revertChanges();
            } else if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                formatJSON();
            }
        });
    }

    // Configuration management
    function updateConfigField(field, value) {
        const keys = field.split('.');
        let obj = configData;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!obj[keys[i]]) {
                obj[keys[i]] = {};
            }
            obj = obj[keys[i]];
        }
        
        obj[keys[keys.length - 1]] = value;
        markAsModified();
        updateJSONEditor();
        validateConfiguration();
    }

    function updateArrayConfig(category, value, isAdding) {
        if (!configData[category]) {
            configData[category] = [];
        }
        
        const array = configData[category];
        const index = array.indexOf(value);
        
        if (isAdding && index === -1) {
            array.push(value);
        } else if (!isAdding && index !== -1) {
            array.splice(index, 1);
        }
        
        markAsModified();
        updateJSONEditor();
        validateConfiguration();
    }

    function addArrayItem(field, container) {
        const newItem = createArrayItemElement('', field);
        container.appendChild(newItem);
        
        const input = newItem.querySelector('input');
        input.focus();
        
        updateArrayFromDOM(field);
    }

    function removeArrayItem(field, item) {
        item.remove();
        updateArrayFromDOM(field);
    }

    function updateArrayFromDOM(field) {
        const container = document.querySelector(`[data-field="${field}"] .array-items`);
        const inputs = container.querySelectorAll('input');
        const values = Array.from(inputs)
            .map(input => input.value.trim())
            .filter(value => value !== '');
        
        updateConfigField(field, values);
    }

    function createArrayItemElement(value, field) {
        const item = document.createElement('div');
        item.className = 'array-item';
        item.innerHTML = `
            <input type="text" value="${value}" placeholder="Enter value...">
            <button type="button" class="remove-item">×</button>
        `;
        return item;
    }

    // MCP functions
    function testMCPConnection() {
        const url = document.getElementById('mcp-server-url').value;
        if (!url) {
            showNotification('Please enter an MCP server URL', 'warning');
            return;
        }
        
        vscode.postMessage({
            type: 'testMCPConnection',
            url: url
        });
    }

    function addMCPServer() {
        const name = prompt('Enter server name:');
        if (!name) return;
        
        const url = prompt('Enter server URL:');
        if (!url) return;
        
        if (!configData.mcp) {
            configData.mcp = { servers: {} };
        }
        
        configData.mcp.servers[name] = {
            url: url,
            enabled: true
        };
        
        markAsModified();
        updateFormFromConfig();
        updateJSONEditor();
        validateConfiguration();
    }

    // JSON handling
    function formatJSON() {
        try {
            const formatted = JSON.stringify(configData, null, 2);
            document.getElementById('json-content').value = formatted;
        } catch (error) {
            showNotification('Invalid JSON structure', 'error');
        }
    }

    function updateJSONEditor() {
        const textarea = document.getElementById('json-content');
        if (textarea) {
            textarea.value = JSON.stringify(configData, null, 2);
        }
    }

    function updateFormFromConfig() {
        // Update basic form fields
        updateBasicFields();
        
        // Update tools and capabilities
        updateToolsAndCapabilities();
        
        // Update array editors
        updateArrayEditors();
        
        // Update MCP configuration
        updateMCPConfiguration();
    }

    function updateBasicFields() {
        const fields = ['id', 'name', 'description', 'role', 'version', 'enabled'];
        
        fields.forEach(field => {
            const input = document.querySelector(`[name="${field}"]`);
            if (input && configData[field] !== undefined) {
                if (input.type === 'checkbox') {
                    input.checked = configData[field];
                } else {
                    input.value = configData[field];
                }
            }
        });
    }

    function updateToolsAndCapabilitiesDisplay() {
        updateCheckboxGrid('tools', '.tools-grid');
        updateCheckboxGrid('capabilities', '.capabilities-grid');
    }

    function updateCheckboxGrid(category, selector) {
        const container = document.querySelector(selector);
        if (!container) return;

        const items = container.querySelectorAll('.tool-item, .capability-item');
        const selectedValues = configData[category] || [];
        
        items.forEach(item => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            const isSelected = selectedValues.includes(checkbox.value);
            
            checkbox.checked = isSelected;
            item.classList.toggle('selected', isSelected);
        });
    }

    function updateArrayEditorsDisplay() {
        const arrayEditors = document.querySelectorAll('.array-editor');
        
        arrayEditors.forEach(editor => {
            const field = editor.dataset.field;
            const container = editor.querySelector('.array-items');
            const values = getNestedValue(configData, field) || [];
            
            // Clear existing items
            container.innerHTML = '';
            
            // Add items from config
            values.forEach(value => {
                const item = createArrayItemElement(value, field);
                container.appendChild(item);
            });
        });
    }

    function updateMCPConfigurationDisplay() {
        // Update MCP server list
        const serversContainer = document.getElementById('mcp-servers-list');
        if (serversContainer && configData.mcp && configData.mcp.servers) {
            serversContainer.innerHTML = '';
            
            Object.entries(configData.mcp.servers).forEach(([name, config]) => {
                const serverElement = createMCPServerElement(name, config);
                serversContainer.appendChild(serverElement);
            });
        }
    }

    function createMCPServerElement(name, config) {
        const element = document.createElement('div');
        element.className = 'mcp-server-item';
        element.innerHTML = `
            <div class="server-info">
                <h4>${name}</h4>
                <p>${config.url}</p>
            </div>
            <div class="server-actions">
                <label>
                    <input type="checkbox" ${config.enabled ? 'checked' : ''}>
                    Enabled
                </label>
                <button type="button" class="btn btn-small btn-secondary">Edit</button>
                <button type="button" class="btn btn-small btn-danger">Remove</button>
            </div>
        `;
        return element;
    }

    // Validation
    function validateConfiguration() {
        // Basic validation
        validationErrors = [];
        
        // Required fields
        if (!configData.id) {
            validationErrors.push('Agent ID is required');
        }
        
        if (!configData.name) {
            validationErrors.push('Agent name is required');
        }
        
        if (!configData.role) {
            validationErrors.push('Agent role is required');
        }
        
        // Version format
        if (configData.version && !/^\d+\.\d+\.\d+$/.test(configData.version)) {
            validationErrors.push('Version must be in format X.Y.Z');
        }
        
        // JSON Schema validation (if available)
        if (schema && typeof jsonschema !== 'undefined') {
            try {
                const result = jsonschema.validate(configData, schema);
                if (!result.valid) {
                    validationErrors.push(...result.errors.map(err => err.message));
                }
            } catch (error) {
                validationErrors.push('Schema validation error');
            }
        }
        
        updateValidationStatus();
    }

    function updateValidationStatus() {
        const statusElement = document.querySelector('.status-indicator');
        const detailsElement = document.querySelector('.validation-details');
        
        if (validationErrors.length === 0) {
            statusElement.className = 'status-indicator valid';
            statusElement.textContent = 'Valid';
            detailsElement.textContent = 'Configuration is valid';
        } else {
            statusElement.className = 'status-indicator invalid';
            statusElement.textContent = 'Invalid';
            detailsElement.textContent = `${validationErrors.length} error(s): ${validationErrors.join(', ')}`;
        }
    }

    // Actions
    function saveConfiguration() {
        if (validationErrors.length > 0) {
            showNotification('Please fix validation errors before saving', 'error');
            return;
        }
        
        vscode.postMessage({
            type: 'save',
            content: JSON.stringify(configData, null, 2)
        });
        
        markAsClean();
        showNotification('Configuration saved successfully', 'success');
    }

    function revertChanges() {
        vscode.postMessage({
            type: 'revert'
        });
    }

    function previewConfiguration() {
        vscode.postMessage({
            type: 'preview',
            config: configData
        });
    }

    // Utility functions
    function getNestedValue(obj, path) {
        const keys = path.split('.');
        let current = obj;
        
        for (const key of keys) {
            if (current === null || current === undefined) {
                return undefined;
            }
            current = current[key];
        }
        
        return current;
    }

    function markAsModified() {
        if (!isModified) {
            isModified = true;
            document.title = '● ' + document.title;
            
            const saveBtn = document.getElementById('save-config');
            if (saveBtn) {
                saveBtn.disabled = false;
            }
        }
    }

    function markAsClean() {
        isModified = false;
        document.title = document.title.replace('● ', '');
        
        const saveBtn = document.getElementById('save-config');
        if (saveBtn) {
            saveBtn.disabled = true;
        }
    }

    function showNotification(message, type = 'info') {
        vscode.postMessage({
            type: 'notification',
            message: message,
            level: type
        });
    }

    // Message handling from VS Code
    window.addEventListener('message', event => {
        const message = event.data;
        
        switch (message.type) {
            case 'init':
                configData = message.config || {};
                schema = message.schema || {};
                updateFormFromConfig();
                updateJSONEditor();
                validateConfiguration();
                markAsClean();
                break;
                
            case 'mcpTestResult':
                const result = message.result;
                if (result.success) {
                    showNotification('MCP connection successful', 'success');
                } else {
                    showNotification(`MCP connection failed: ${result.error}`, 'error');
                }
                break;
                
            case 'revertComplete':
                configData = message.config || {};
                updateFormFromConfig();
                updateJSONEditor();
                validateConfiguration();
                markAsClean();
                showNotification('Changes reverted', 'info');
                break;
        }
    });

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();