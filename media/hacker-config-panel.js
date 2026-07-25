// Hacker Config Panel JavaScript - Matrix Theme
(function() {
    'use strict';

    // Acquire the VS Code API once and store it. Reuse if already set on window.
    let vscode = null;
    const messageQueue = [];
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
    let configData = [];
    // Flush any queued messages once API becomes available
    if (vscode && messageQueue.length) {
        while (messageQueue.length) {
            try {
                vscode.postMessage(messageQueue.shift());
            } catch (e) {
                console.warn('Failed to flush queued message', e);
                break;
            }
        }
    }

    // Safe postMessage wrapper to avoid runtime errors if VS Code API isn't available
    function safePostMessage(message) {
        if (vscode && typeof vscode.postMessage === 'function') {
            vscode.postMessage(message);
        } else {
            // Queue until VS Code API is ready to avoid CSP/early-load issues
            messageQueue.push(message);
        }
    }

    // Matrix rain removed

    // Initialize system time display
    function updateSystemTime() {
        const timeElement = document.getElementById('matrixTime');
        if (timeElement) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
            });
            timeElement.textContent = timeString;
        }
    }

    // Render configuration groups
    function renderConfigGroups(groups) {
        const container = document.getElementById('configPanels');
        if (!container) return;

        let totalConfigs = 0;
        let html = '';

        groups.forEach((group, groupIndex) => {
            totalConfigs += group.configs.length;
            
            html += `
                <div class="config-group" data-category="${group.name.toLowerCase().replace(/\s+/g, '-')}">
                    <div class="config-group-header" data-toggle-group="${groupIndex}">
                        <span class="config-group-icon">${group.icon}</span>
                        <span class="config-group-title">${group.name}</span>
                        <span class="config-group-description">${group.description}</span>
                    </div>
                    <div class="config-group-content" id="group-${groupIndex}">
                        <table class="config-table">
                            <thead>
                                <tr>
                                    <th>Configuration</th>
                                    <th>Description</th>
                                    <th>Type</th>
                                    <th>Value</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${renderConfigItems(group.configs)}
                            </tbody>
                        </table>
                        <div class="config-stats">
                            <span>Configurations: <span class="config-count">${group.configs.length}</span></span>
                            <span>Category: ${group.name}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Update active config count in footer
        const activeLinkCount = document.getElementById('activeLinkCount');
        if (activeLinkCount) {
            activeLinkCount.textContent = totalConfigs;
        }

        // Optional: mark rows for CSS-driven stagger (no inline styles to satisfy CSP)
        const configRows = document.querySelectorAll('.config-table tr');
        configRows.forEach((row, index) => {
            row.dataset.appearIndex = String(index);
            row.classList.add('stagger-appear');
        });
    }

    function renderConfigItems(configs) {
        return configs.map(config => {
            const value = config.value !== undefined ? 
                (typeof config.value === 'object' ? JSON.stringify(config.value) : String(config.value)) : 
                'N/A';

            const actionButton = config.type === 'vscode-setting' ?
                `<button class="config-link" data-open-vscode-setting="${config.settingKey}">
                    ⚙️ EDIT
                </button>` :
                `<button class="config-link" data-open-config-file="${config.filePath?.replace(/\\/g, '\\\\')}">
                    📝 OPEN
                </button>`;

            const nameAction = config.type === 'vscode-setting' ? 
                `data-open-vscode-setting="${config.settingKey}"` : 
                `data-open-config-file="${config.filePath?.replace(/\\/g, '\\\\')}"`;

            return `
                <tr>
                    <td>
                        <div class="config-name" ${nameAction}>
                            <span class="config-icon">${config.icon}</span>
                            ${config.name}
                        </div>
                    </td>
                    <td class="config-description">${config.description}</td>
                    <td>
                        <span class="config-type ${config.type}">${config.type.replace('-', ' ')}</span>
                    </td>
                    <td>
                        <div class="config-value" title="${value}">${value}</div>
                    </td>
                    <td class="config-action">
                        ${actionButton}
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Toggle configuration group visibility
    window.toggleGroup = function(groupIndex) {
        const content = document.getElementById(`group-${groupIndex}`);
        if (content) {
            const isHidden = content.classList.contains('hidden');
            const willBeHidden = !isHidden;
            // Toggle visibility via CSS class to avoid inline styles
            content.classList.toggle('hidden', willBeHidden);
            // If we are showing it (was hidden), play appear animation
            if (isHidden) {
                content.classList.add('animate-appear');
                setTimeout(() => content.classList.remove('animate-appear'), 600);
            }
        }
    };

    // Open VS Code setting
    window.openVSCodeSetting = function(settingKey) {
        console.log(`JavaScript: openVSCodeSetting called with settingKey: ${settingKey}`);
        safePostMessage({
            command: 'openVSCodeSetting',
            settingKey: settingKey
        });
        console.log(`JavaScript: Sent openVSCodeSetting message for: ${settingKey}`);
    };

    // Open configuration file
    window.openConfigFile = function(filePath) {
        if (!filePath || filePath === 'undefined') {
            console.error('Invalid file path:', filePath);
            return;
        }
        
        safePostMessage({
            command: 'openConfigFile',
            filePath: filePath
        });
    };

    // Refresh configurations
    window.refreshConfigs = function() {
        console.log('JavaScript: refreshConfigs called');
        const loadingMessage = document.querySelector('.loading-message');
        if (loadingMessage) {
            loadingMessage.innerHTML = '<span class="blinking-text">>>> RESCANNING QUANTUM CONFIGURATIONS...</span>';
        }
        
        safePostMessage({
            command: 'refreshConfigs'
        });
        console.log('JavaScript: Sent refreshConfigs message');
    };

    // Open workspace settings
    window.openWorkspaceSettings = function() {
        safePostMessage({
            command: 'openWorkspaceSettings'
        });
    };

    // Open user settings
    window.openUserSettings = function() {
        safePostMessage({
            command: 'openUserSettings'
        });
    };

    // Handle messages from extension
    window.addEventListener('message', event => {
        const message = event.data;
        
        switch (message.command) {
            case 'updateConfigs':
                configData = message.data;
                renderConfigGroups(configData);
                break;
        }
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'r':
                    e.preventDefault();
                    refreshConfigs();
                    break;
                case ',':
                    e.preventDefault();
                    openUserSettings();
                    break;
                case 'Shift':
                    if (e.shiftKey) {
                        e.preventDefault();
                        openWorkspaceSettings();
                    }
                    break;
            }
        }
    });

    // Hover effects handled by CSS; avoid inline style mutations to satisfy CSP

    // Initialize the panel
    function initialize() {
        updateSystemTime();
        setInterval(updateSystemTime, 1000);
        setupEventListeners();
        
        // Request initial configuration data
        safePostMessage({
            command: 'refreshConfigs'
        });
        
        // Add welcome animation via CSS class (CSP-safe)
        const terminal = document.querySelector('.hacker-terminal');
        if (terminal) {
            terminal.classList.add('animate-fade-in');
            setTimeout(() => terminal.classList.remove('animate-fade-in'), 1100);
        }
    }

    // Setup event listeners for buttons and interactions
    function setupEventListeners() {
        document.addEventListener('click', function(event) {
            const target = event.target;
            
            // Handle control buttons
            if (target.hasAttribute('data-action')) {
                const action = target.getAttribute('data-action');
                switch (action) {
                    case 'refreshConfigs':
                        refreshConfigs();
                        break;
                    case 'openWorkspaceSettings':
                        openWorkspaceSettings();
                        break;
                    case 'openUserSettings':
                        openUserSettings();
                        break;
                }
            }
            
            // Handle config item clicks
            if (target.hasAttribute('data-open-vscode-setting')) {
                const settingKey = target.getAttribute('data-open-vscode-setting');
                openVSCodeSetting(settingKey);
            }
            
            if (target.hasAttribute('data-open-config-file')) {
                const filePath = target.getAttribute('data-open-config-file');
                openConfigFile(filePath);
            }
            
            // Handle group toggle
            if (target.hasAttribute('data-toggle-group')) {
                const groupIndex = target.getAttribute('data-toggle-group');
                toggleGroup(parseInt(groupIndex));
            }
        });
    }

    // Start everything when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // Add some console styling for fun
    console.log('%c>>> ALEPH-0 CONFIG MATRIX INITIALIZED <<<',
                'color: #00ff00; font-family: Courier New; font-weight: bold; font-size: 14px;');
    console.log('%cQuantum configuration interface online. Neural pathways synchronized.', 
                'color: #00cc00; font-family: Courier New; font-size: 12px;');
})();