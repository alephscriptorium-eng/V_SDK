// Hacker Config Panel JavaScript - Matrix Theme
(function() {
    'use strict';

    const vscode = acquireVsCodeApi();
    let configData = [];

    // Matrix rain effect
    function initMatrixRain() {
        const matrixContainer = document.getElementById('matrixRain');
        if (!matrixContainer) return;

        const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        const drops = [];
        const fontSize = 14;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        matrixContainer.appendChild(canvas);
        
        function resizeCanvas() {
            canvas.width = matrixContainer.offsetWidth;
            canvas.height = matrixContainer.offsetHeight;
            
            const columns = Math.floor(canvas.width / fontSize);
            drops.length = 0;
            for (let i = 0; i < columns; i++) {
                drops[i] = Math.random() * canvas.height;
            }
        }
        
        function draw() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#00ff00';
            ctx.font = `${fontSize}px Courier New`;
            
            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * fontSize, drops[i]);
                
                if (drops[i] > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i] += fontSize;
            }
        }
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        setInterval(draw, 100);
    }

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
                                    <th style="width: 25%">Configuration</th>
                                    <th style="width: 35%">Description</th>
                                    <th style="width: 15%">Type</th>
                                    <th style="width: 15%">Value</th>
                                    <th style="width: 10%">Action</th>
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

        // Add animation delays
        const configRows = document.querySelectorAll('.config-table tr');
        configRows.forEach((row, index) => {
            row.style.animationDelay = `${index * 0.1}s`;
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
            const isVisible = content.style.display !== 'none';
            content.style.display = isVisible ? 'none' : 'block';
            
            if (!isVisible) {
                content.style.animation = 'configAppear 0.5s ease-out';
            }
        }
    };

    // Open VS Code setting
    window.openVSCodeSetting = function(settingKey) {
        console.log(`JavaScript: openVSCodeSetting called with settingKey: ${settingKey}`);
        vscode.postMessage({
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
        
        vscode.postMessage({
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
        
        vscode.postMessage({
            command: 'refreshConfigs'
        });
        console.log('JavaScript: Sent refreshConfigs message');
    };

    // Open workspace settings
    window.openWorkspaceSettings = function() {
        vscode.postMessage({
            command: 'openWorkspaceSettings'
        });
    };

    // Open user settings
    window.openUserSettings = function() {
        vscode.postMessage({
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

    // Add hover effects for enhanced interactivity
    document.addEventListener('mouseover', (e) => {
        if (e.target.classList.contains('config-name')) {
            e.target.style.transform = 'translateX(5px)';
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.classList.contains('config-name')) {
            e.target.style.transform = 'translateX(0)';
        }
    });

    // Initialize the panel
    function initialize() {
        initMatrixRain();
        updateSystemTime();
        setInterval(updateSystemTime, 1000);
        setupEventListeners();
        
        // Request initial configuration data
        vscode.postMessage({
            command: 'refreshConfigs'
        });
        
        // Add welcome animation
        const terminal = document.querySelector('.hacker-terminal');
        if (terminal) {
            terminal.style.animation = 'fadeIn 1s ease-out';
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
    console.log('%c>>> ARRAKIS CONFIG MATRIX INITIALIZED <<<', 
                'color: #00ff00; font-family: Courier New; font-weight: bold; font-size: 14px;');
    console.log('%cQuantum configuration interface online. Neural pathways synchronized.', 
                'color: #00cc00; font-family: Courier New; font-size: 12px;');
})();