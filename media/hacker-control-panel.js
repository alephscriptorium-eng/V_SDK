// Hacker Control Panel JavaScript - Matrix Terminal Functionality

(function() {
    'use strict';

    // Get VS Code API
    const vscode = acquireVsCodeApi();
    
    let webviewGroups = [];
    let matrixInterval;
    let timeInterval;

    // Initialize the panel
    document.addEventListener('DOMContentLoaded', function() {
        initializeMatrixRain();
        startMatrixTime();
        requestStatus();
        setupEventListeners();
        
        // Request status every 10 seconds
        setInterval(requestStatus, 10000);
    });

    // Setup event listeners for buttons
    function setupEventListeners() {
        // Remove any existing listeners to avoid duplicates
        document.removeEventListener('click', handleDocumentClick);
        
        // Add event listeners for control buttons
        document.addEventListener('click', handleDocumentClick);
    }
    
    // Separate click handler function to avoid duplicates
    function handleDocumentClick(event) {
        const target = event.target;
        
        // Handle control buttons
        if (target.hasAttribute('data-action')) {
            const action = target.getAttribute('data-action');
            switch (action) {
                case 'refreshAll':
                    refreshAll();
                    break;
                case 'reloadAllWebviews':
                    reloadAllWebviews();
                    break;
            }
        }
        
        // Handle webview launch
        if (target.hasAttribute('data-launch-webview')) {
            const command = target.getAttribute('data-launch-webview');
            launchWebview(command);
        }
        
        // Handle webview close
        if (target.hasAttribute('data-close-webview')) {
            event.stopPropagation();
            const webviewId = target.getAttribute('data-close-webview');
            closeWebview(webviewId);
        }
        
        // Handle group toggle
        if (target.hasAttribute('data-toggle-group')) {
            const groupId = target.getAttribute('data-toggle-group');
            toggleGroup(groupId);
        }
    }

    // Matrix Rain Animation
    function initializeMatrixRain() {
        const matrixContainer = document.getElementById('matrixRain');
        const characters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        
        function createMatrixChar() {
            const char = document.createElement('div');
            char.className = 'matrix-char';
            char.textContent = characters[Math.floor(Math.random() * characters.length)];
            char.style.left = Math.random() * 100 + '%';
            char.style.animationDuration = (Math.random() * 3 + 2) + 's';
            char.style.fontSize = (Math.random() * 8 + 8) + 'px';
            char.style.opacity = Math.random() * 0.3 + 0.1;
            
            matrixContainer.appendChild(char);
            
            setTimeout(() => {
                if (char.parentNode) {
                    char.parentNode.removeChild(char);
                }
            }, 5000);
        }
        
        // Create matrix characters
        matrixInterval = setInterval(createMatrixChar, 200);
    }

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
            document.getElementById('matrixTime').textContent = `${dateStr}_${timeStr}`;
        }
        
        updateTime();
        timeInterval = setInterval(updateTime, 1000);
    }

    // Message handling from VS Code extension
    window.addEventListener('message', event => {
        const message = event.data;
        
        switch (message.command) {
            case 'updateStatus':
                updateWebviewGroups(message.data);
                break;
        }
    });

    // Request status from extension
    function requestStatus() {
        vscode.postMessage({
            command: 'getStatus'
        });
    }

    // Global functions for button clicks
    window.refreshAll = function() {
        console.log('JavaScript: refreshAll called');
        showTerminalMessage('>>> REFRESHING QUANTUM MATRIX...');
        vscode.postMessage({
            command: 'refreshPanel'
        });
        console.log('JavaScript: Sent refreshPanel message');
        
        setTimeout(() => {
            showTerminalMessage('>>> MATRIX REFRESH COMPLETE');
        }, 1000);
    };

    window.reloadAllWebviews = function() {
        showTerminalMessage('>>> RELOADING ALL NEURAL LINKS...');
        vscode.postMessage({
            command: 'reloadAllWebviews'
        });
        
        setTimeout(() => {
            showTerminalMessage('>>> NEURAL LINKS RELOADED');
        }, 2000);
    };

    // Update webview groups display
    function updateWebviewGroups(groups) {
        webviewGroups = groups;
        renderWebviewGroups();
        updateActiveLinkCount();
    }

    // Render webview groups
    function renderWebviewGroups() {
        const container = document.getElementById('controlPanels');
        
        if (!webviewGroups || webviewGroups.length === 0) {
            container.innerHTML = `
                <div class="loading-message">
                    <span class="blinking-text">>>> NO QUANTUM INTERFACES DETECTED...</span>
                </div>
            `;
            return;
        }

        let html = '';
        
        webviewGroups.forEach((group, groupIndex) => {
            const groupId = `group-${groupIndex}`;
            const isCollapsed = localStorage.getItem(groupId) === 'collapsed';
            
            html += `
                <div class="webview-group">
                    <div class="group-header" data-toggle-group="${groupId}">
                        <span class="group-icon ${isCollapsed ? 'collapsed' : ''}">▼</span>
                        <span class="group-title">${group.icon} ${group.name}</span>
                        <span class="group-description">${group.description}</span>
                    </div>
                    <div class="webview-list ${isCollapsed ? 'collapsed' : ''}" id="${groupId}">
                        ${renderWebviewItems(group.webviews)}
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    // Render individual webview items
    function renderWebviewItems(webviews) {
        return webviews.map(webview => {
            const statusClass = webview.status;
            const statusText = webview.status.toUpperCase();
            const portInfo = webview.port ? `PORT: ${webview.port}` : '';
            
            return `
                <div class="webview-item" data-launch-webview="${webview.command}">
                    <span class="webview-icon">${webview.icon}</span>
                    <div class="webview-info">
                        <div class="webview-name">${webview.name}</div>
                        <div class="webview-description">${webview.description}</div>
                        ${portInfo ? `<div class="webview-port">${portInfo}</div>` : ''}
                    </div>
                    <div class="webview-status ${statusClass}">${statusText}</div>
                    <div class="webview-actions">
                        ${webview.status === 'active' ? `
                            <button class="action-btn danger" data-close-webview="${webview.id}">CLOSE</button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Toggle group collapse/expand
    window.toggleGroup = function(groupId) {
        const groupElement = document.getElementById(groupId);
        
        if (!groupElement) {
            console.error('Group element not found for ID:', groupId);
            return;
        }
        
        const headerElement = groupElement.previousElementSibling;
        const icon = headerElement ? headerElement.querySelector('.group-icon') : null;
        
        if (groupElement.classList.contains('collapsed')) {
            // Expand the group
            groupElement.classList.remove('collapsed');
            if (icon) icon.classList.remove('collapsed');
            localStorage.removeItem(groupId);
        } else {
            // Collapse the group
            groupElement.classList.add('collapsed');
            if (icon) icon.classList.add('collapsed');
            localStorage.setItem(groupId, 'collapsed');
        }
    };

    // Launch webview
    window.launchWebview = function(command) {
        console.log(`JavaScript: launchWebview called with command: ${command}`);
        showTerminalMessage(`>>> LAUNCHING NEURAL INTERFACE: ${command}`);
        vscode.postMessage({
            command: 'launchWebview',
            commandId: command
        });
        console.log(`JavaScript: Sent message to launch webview: ${command}`);
    };

    // Close webview
    window.closeWebview = function(webviewId) {
        showTerminalMessage(`>>> TERMINATING NEURAL LINK: ${webviewId}`);
        vscode.postMessage({
            command: 'closeWebview',
            webviewId: webviewId
        });
    };

    // Update active link count
    function updateActiveLinkCount() {
        if (!webviewGroups) return;
        
        let activeCount = 0;
        webviewGroups.forEach(group => {
            group.webviews.forEach(webview => {
                if (webview.status === 'active') {
                    activeCount++;
                }
            });
        });
        
        const activeLinkElement = document.getElementById('activeLinkCount');
        if (activeLinkElement) {
            activeLinkElement.textContent = activeCount;
        } else {
            console.log('Active neural links:', activeCount);
        }
    }

    // Show terminal message (temporary feedback)
    function showTerminalMessage(message) {
        // Create temporary message overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 50, 0, 0.9);
            border: 2px solid #00ff00;
            padding: 20px;
            border-radius: 10px;
            z-index: 1000;
            font-family: 'Courier New', monospace;
            color: #00ff00;
            font-size: 14px;
            font-weight: bold;
            text-align: center;
            min-width: 300px;
            box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
        `;
        overlay.textContent = message;
        
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 2000);
    }

    // Terminal command effects
    function addTerminalGlow(element) {
        element.style.textShadow = '0 0 10px #00ff00';
        setTimeout(() => {
            element.style.textShadow = '0 0 5px #00ff00';
        }, 300);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        // Ctrl+R: Refresh
        if (event.ctrlKey && event.key === 'r') {
            event.preventDefault();
            refreshAll();
        }
        
        // Ctrl+Shift+R: Reload all webviews
        if (event.ctrlKey && event.shiftKey && event.key === 'R') {
            event.preventDefault();
            reloadAllWebviews();
        }
        
        // Escape: Request status
        if (event.key === 'Escape') {
            event.preventDefault();
            requestStatus();
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

    // Add some terminal styling effects on hover
    document.addEventListener('mouseover', function(event) {
        if (event.target.classList.contains('webview-item')) {
            addTerminalGlow(event.target);
        }
    });

})();