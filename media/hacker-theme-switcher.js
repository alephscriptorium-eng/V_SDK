'use strict';
(function() {
  // Acquire VS Code API from webview context
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

  function applyTheme(t) {
    document.body.classList.remove('theme-matrix','theme-light','theme-dark');
    document.body.classList.add('theme-' + t);
  }

  function initThemeSelector() {
    var selector = document.getElementById('themeSelector');
    if (!selector) return;
    selector.addEventListener('change', function() {
      var val = selector.value;
      if (val === 'auto') {
        vscode && vscode.postMessage({ command: 'setThemeAuto' });
        return; // host will send applyTheme with auto mapping
      }
      applyTheme(val);
      vscode && vscode.postMessage({ command: 'setTheme', theme: val });
    });
  }

  function listenForHostTheme() {
    window.addEventListener('message', function(event) {
      var msg = event.data;
      if (!msg || !msg.command) return;
      if (msg.command === 'applyTheme' && msg.theme) {
        applyTheme(msg.theme);
        var selector = document.getElementById('themeSelector');
        if (selector) selector.value = (msg.mode === 'auto') ? 'auto' : msg.theme;
      }
    });
  }

  // Initialize on DOMContentLoaded to ensure controls exist
  document.addEventListener('DOMContentLoaded', function() {
    initThemeSelector();
    listenForHostTheme();
  });
})();
