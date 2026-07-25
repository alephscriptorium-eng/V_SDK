// Hacker Control Panel JavaScript - Matrix Terminal Functionality

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
    
    let webviewGroups = [];
    let timeInterval;

    // Initialize the panel
    document.addEventListener('DOMContentLoaded', function() {
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
        const actionEl = target.closest('[data-action]');
        if (actionEl) {
            const action = actionEl.getAttribute('data-action');
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
        const launchEl = target.closest('[data-launch-webview]');
        if (launchEl) {
            const command = launchEl.getAttribute('data-launch-webview');
            launchWebview(command);
        }
        // Handle webview close
        const closeEl = target.closest('[data-close-webview]');
        if (closeEl) {
            event.stopPropagation();
            const webviewId = closeEl.getAttribute('data-close-webview');
            closeWebview(webviewId);
        }
        // Handle group toggle
        const headerEl = target.closest('[data-toggle-group]');
        if (headerEl) {
            const groupId = headerEl.getAttribute('data-toggle-group');
            toggleGroup(groupId);
        }
    }

    // Matrix rain removed

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
        console.log('Received message from backend:', message);
        
        switch (message.command) {
            case 'updateStatus':
                console.log('Updating status with data:', message.data);
                updateWebviewGroups(message.data);
                break;
        }
    });

    // Request status from extension
    function requestStatus() {
        console.log('Requesting status from backend...');
        if (vscode) {
            vscode.postMessage({
                command: 'getStatus'
            });
        } else {
            console.error('VS Code API not available, cannot request status.');
        }
    }

    // Launch a webview
    function launchWebview(command) {
        if (vscode) {
            vscode.postMessage({
                command: 'launchWebview',
                commandId: command,
                payload: { command: command }
            });
        } else {
            console.error('VS Code API not available, cannot launch webview.');
        }
    }

    // Close a webview
    function closeWebview(webviewId) {
        if (vscode) {
            vscode.postMessage({
                command: 'closeWebview',
                webviewId: webviewId,
                payload: { webviewId: webviewId }
            });
        } else {
            console.error('VS Code API not available, cannot close webview.');
        }
    }

    // Refresh all statuses
    function refreshAll() {
        requestStatus();
    }

    // Reload all webviews
    function reloadAllWebviews() {
        if (vscode) {
            vscode.postMessage({ command: 'reloadAllWebviews' });
        } else {
            console.error('VS Code API not available, cannot reload webviews.');
        }
    }



    // Toggle webview group visibility
    window.toggleGroup = function(groupId) {
        const groupElement = document.getElementById(groupId);
        
        if (!groupElement) {
            console.error('Group element not found for ID:', groupId);
            return;
        }
        
        const headerElement = groupElement.previousElementSibling;
        const icon = headerElement ? headerElement.querySelector('.group-icon') : null;
        const isCollapsed = groupElement.classList.contains('collapsed');
        if (isCollapsed) {
            // Expand the group
            groupElement.classList.remove('collapsed');
            if (headerElement) headerElement.classList.remove('collapsed');
            if (icon) icon.classList.remove('collapsed');
            localStorage.removeItem(groupId);
        } else {
            // Collapse the group
            groupElement.classList.add('collapsed');
            if (headerElement) headerElement.classList.add('collapsed');
            if (icon) icon.classList.add('collapsed');
            localStorage.setItem(groupId, 'collapsed');
        }
    };

    // Update webview groups display
    function updateWebviewGroups(groups) {
        console.log('updateWebviewGroups called with:', groups);
        webviewGroups = groups;
        renderWebviewGroups();
        updateActiveLinkCount();
    }

    // Render webview groups
    function renderWebviewGroups() {
        console.log('renderWebviewGroups called, webviewGroups:', webviewGroups);
        const container = document.getElementById('controlPanels');
        
        if (!webviewGroups || webviewGroups.length === 0) {
            console.log('No webview groups to render');
            container.innerHTML = `
                <div class="loading-message">
                    <span class="blinking-text">>>> NO QUANTUM INTERFACES DETECTED...</span>
                </div>
            `;
            return;
        }

        console.log('Rendering', webviewGroups.length, 'groups');
        let html = '';
        
        webviewGroups.forEach((group, groupIndex) => {
            const groupId = `group-${groupIndex}`;
            let isCollapsed = localStorage.getItem(groupId) === 'collapsed';
            // Ensure last group is open by default
            if (groupIndex === webviewGroups.length - 1) {
                isCollapsed = false;
                localStorage.removeItem(groupId);
            }
            
            html += `
                <div class="webview-group">
                    <div class="group-header ${isCollapsed ? 'collapsed' : ''}" data-toggle-group="${groupId}">
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