/**
 * Hacker Tasks Panel - Client-side JavaScript
 * Handles task display, filtering, and execution
 */
(function() {
    // VS Code API - use existing if already acquired by theme switcher
    const vscode = window.vscode || acquireVsCodeApi();
    if (!window.vscode) {
        window.vscode = vscode;
    }
    console.log('hacker-tasks-panel.js: vscode API acquired:', !!vscode);

    // State
    let categories = [];
    let expandedCategories = new Set(); // Will be populated on first load
    let filterText = '';
    let isFirstLoad = true;

    // DOM Elements
    const tasksPanels = document.getElementById('tasksPanels');
    const taskFilter = document.getElementById('taskFilter');
    const totalTasksEl = document.getElementById('totalTasks');
    const totalTasksDisplayEl = document.getElementById('totalTasksDisplay');
    const totalCategoriesEl = document.getElementById('totalCategories');
    const runningTasksEl = document.getElementById('runningTasks');
    const visibleCountEl = document.getElementById('visibleCount');
    const processCountEl = document.getElementById('processCount');
    const matrixTimeEl = document.getElementById('matrixTime');

    // Initialize
    function init() {
        console.log('hacker-tasks-panel.js: init() called');
        setupEventListeners();
        setupMatrixTime();
        // Notify extension we're ready
        console.log('hacker-tasks-panel.js: sending ready message');
        vscode.postMessage({ command: 'ready' });
    }

    // Event Listeners
    function setupEventListeners() {
        // Filter input
        if (taskFilter) {
            taskFilter.addEventListener('input', (e) => {
                filterText = e.target.value.toLowerCase();
                renderCategories();
            });
        }

        // Control buttons
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Use currentTarget to get the button with data-action, not a child element
                const button = e.currentTarget;
                const action = button.dataset.action;
                console.log('Button clicked, action:', action);
                if (action) {
                    handleAction(action);
                }
            });
        });

        // Message handler from extension
        window.addEventListener('message', (event) => {
            const message = event.data;
            console.log('hacker-tasks-panel.js: message received from extension:', message);
            handleMessage(message);
        });
    }

    // Handle messages from extension
    function handleMessage(message) {
        console.log('Tasks panel received:', message);

        switch (message.command) {
            case 'updateTasks':
                categories = message.categories || [];                // On first load, expand all categories so tasks are visible
                if (isFirstLoad && categories.length > 0) {
                    categories.forEach(cat => expandedCategories.add(cat.prefix));
                    isFirstLoad = false;
                }                updateStats(message);
                renderCategories();
                break;

            case 'taskStarted':
                updateTaskStatus(message.taskLabel, true);
                break;

            case 'taskEnded':
                updateTaskStatus(message.taskLabel, false);
                break;

            case 'applyTheme':
                applyTheme(message.theme);
                break;
        }
    }

    // Handle control actions
    function handleAction(action) {
        switch (action) {
            case 'refreshTasks':
                vscode.postMessage({ command: 'refreshTasks' });
                showLoading();
                break;

            case 'runDefault':
                vscode.postMessage({ command: 'runDefault' });
                break;

            case 'stopAll':
                vscode.postMessage({ command: 'stopAll' });
                break;

            case 'openTasksJson':
                vscode.postMessage({ command: 'openTasksJson' });
                break;
        }
    }

    // Update statistics display
    function updateStats(data) {
        if (totalTasksEl) totalTasksEl.textContent = data.totalTasks || 0;
        if (totalTasksDisplayEl) totalTasksDisplayEl.textContent = data.totalTasks || 0;
        if (totalCategoriesEl) totalCategoriesEl.textContent = data.totalCategories || 0;
        if (runningTasksEl) runningTasksEl.textContent = data.runningCount || 0;
        if (processCountEl) processCountEl.textContent = data.runningCount || 0;
    }

    // Show loading state
    function showLoading() {
        if (tasksPanels) {
            tasksPanels.innerHTML = `
                <div class="loading-message">
                    <span class="blinking-text">>>> SCANNING TASKS.JSON...</span>
                </div>
            `;
        }
    }

    // Render all categories
    function renderCategories() {
        if (!tasksPanels) return;

        if (categories.length === 0) {
            tasksPanels.innerHTML = `
                <div class="empty-state">
                    <div class="icon">📋</div>
                    <div class="message">NO_TASKS_FOUND</div>
                    <div class="hint">Create .vscode/tasks.json to define tasks</div>
                </div>
            `;
            return;
        }

        let visibleCount = 0;
        let html = '';

        for (const category of categories) {
            const filteredTasks = filterTasks(category.tasks);
            if (filteredTasks.length === 0 && filterText) continue;

            visibleCount += filteredTasks.length;
            const isExpanded = expandedCategories.has(category.prefix);
            const hasRunning = filteredTasks.some(t => t.isRunning);

            html += renderCategory(category, filteredTasks, isExpanded, hasRunning);
        }

        tasksPanels.innerHTML = html || `
            <div class="empty-state">
                <div class="icon">🔍</div>
                <div class="message">NO_MATCHING_TASKS</div>
                <div class="hint">Try a different filter</div>
            </div>
        `;

        if (visibleCountEl) visibleCountEl.textContent = visibleCount;

        // Re-attach event listeners
        attachCategoryListeners();
    }

    // Filter tasks by search text
    function filterTasks(tasks) {
        if (!filterText) return tasks;
        return tasks.filter(t => 
            t.label.toLowerCase().includes(filterText) ||
            (t.detail && t.detail.toLowerCase().includes(filterText)) ||
            (t.action && t.action.toLowerCase().includes(filterText))
        );
    }

    // Render a single category
    function renderCategory(category, tasks, isExpanded, hasRunning) {
        const runningCount = tasks.filter(t => t.isRunning).length;
        const portsDisplay = category.ports && category.ports.length > 0 
            ? `<span class="ports">Ports: ${category.ports.join(', ')}</span>` 
            : '';

        return `
            <div class="task-category ${hasRunning ? 'has-running' : ''}" data-prefix="${category.prefix}">
                <div class="category-header ${isExpanded ? '' : 'collapsed'}" data-prefix="${category.prefix}">
                    <div class="category-info">
                        <span class="category-toggle">${isExpanded ? '▼' : '▶'}</span>
                        <span class="category-icon">${category.icon || '📦'}</span>
                        <span class="category-title">${category.name}</span>
                        <span class="category-prefix">${category.prefix}</span>
                    </div>
                    <div class="category-meta">
                        <span class="task-count">${tasks.length} tasks</span>
                        ${portsDisplay}
                        ${runningCount > 0 ? `<span class="running-indicator">● ${runningCount} running</span>` : ''}
                    </div>
                </div>
                <div class="tasks-list ${isExpanded ? 'expanded' : ''}">
                    ${tasks.map(task => renderTask(task)).join('')}
                </div>
            </div>
        `;
    }

    // Render a single task item
    function renderTask(task) {
        const badges = [];
        if (task.isRunning) badges.push('<span class="running-badge">● RUNNING</span>');
        if (task.isCompound) badges.push('<span class="compound-badge">⚙ COMPOUND</span>');
        if (task.isBackground) badges.push('<span class="background-badge">⟳ BG</span>');

        const portInfo = task.port ? `<span class="port">:${task.port}</span>` : '';
        const detail = task.detail ? `<div class="task-detail">${task.detail} ${portInfo}</div>` : '';

        return `
            <div class="task-item ${task.isRunning ? 'running' : ''} ${task.isCompound ? 'compound' : ''}" 
                 data-label="${escapeHtml(task.label)}">
                <div class="task-info">
                    <div class="task-label">
                        <span class="action">${escapeHtml(task.action)}</span>
                        ${task.target ? `<span class="target">[${escapeHtml(task.target)}]</span>` : ''}
                        ${badges.join('')}
                    </div>
                    ${detail}
                </div>
                <div class="task-actions">
                    ${task.isRunning 
                        ? `<button class="task-btn stop" data-task="${escapeHtml(task.label)}" data-action="stop">⏹ STOP</button>`
                        : `<button class="task-btn run" data-task="${escapeHtml(task.label)}" data-action="run">▶ RUN</button>`
                    }
                </div>
            </div>
        `;
    }

    // Attach event listeners to rendered elements
    function attachCategoryListeners() {
        // Category headers (collapse/expand)
        document.querySelectorAll('.category-header').forEach(header => {
            header.addEventListener('click', (e) => {
                const prefix = header.dataset.prefix;
                toggleCategory(prefix);
            });
        });

        // Task buttons
        document.querySelectorAll('.task-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const taskLabel = btn.dataset.task;
                const action = btn.dataset.action;

                if (action === 'run') {
                    vscode.postMessage({ command: 'runTask', taskLabel });
                } else if (action === 'stop') {
                    vscode.postMessage({ command: 'stopTask', taskLabel });
                }
            });
        });
    }

    // Toggle category expanded state
    function toggleCategory(prefix) {
        if (expandedCategories.has(prefix)) {
            expandedCategories.delete(prefix);
        } else {
            expandedCategories.add(prefix);
        }
        renderCategories();
    }

    // Update task running status
    function updateTaskStatus(taskLabel, isRunning) {
        // Update in data
        for (const category of categories) {
            const task = category.tasks.find(t => t.label === taskLabel);
            if (task) {
                task.isRunning = isRunning;
                break;
            }
        }

        // Update running count
        const runningCount = categories.reduce((count, cat) => 
            count + cat.tasks.filter(t => t.isRunning).length, 0
        );
        if (runningTasksEl) runningTasksEl.textContent = runningCount;
        if (processCountEl) processCountEl.textContent = runningCount;

        // Re-render
        renderCategories();
    }

    // Apply theme
    function applyTheme(theme) {
        document.body.className = document.body.className
            .replace(/theme-\w+/g, '')
            .trim() + ` theme-${theme}`;
    }

    // Matrix time display
    function setupMatrixTime() {
        function updateTime() {
            if (matrixTimeEl) {
                const now = new Date();
                const hours = String(now.getHours()).padStart(2, '0');
                const mins = String(now.getMinutes()).padStart(2, '0');
                const secs = String(now.getSeconds()).padStart(2, '0');
                matrixTimeEl.textContent = `${hours}:${mins}:${secs}`;
            }
        }
        updateTime();
        setInterval(updateTime, 1000);
    }

    // Escape HTML
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initialize when DOM is ready
    console.log('hacker-tasks-panel.js: script loaded, readyState:', document.readyState);
    if (document.readyState === 'loading') {
        console.log('hacker-tasks-panel.js: waiting for DOMContentLoaded');
        document.addEventListener('DOMContentLoaded', init);
    } else {
        console.log('hacker-tasks-panel.js: DOM already ready, calling init');
        init();
    }
})();
