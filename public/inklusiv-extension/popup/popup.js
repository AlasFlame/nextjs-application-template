// INKLUSIV Extension Popup JavaScript
// Settings dashboard functionality

class InklusivPopup {
  constructor() {
    this.settings = {};
    this.defaultSettings = {
      voiceInput: false,
      gestureInput: false,
      dyslexiaFont: false,
      textToSpeech: false,
      colorblindMode: 'none',
      adhdMode: false,
      highContrast: false,
      darkMode: false,
      widgetPosition: 'bottom-right'
    };
    
    this.initializePopup();
  }

  async initializePopup() {
    try {
      // Load current settings
      await this.loadSettings();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Update UI with current settings
      this.updateUI();
      
      // Show ready status
      this.showStatus('Settings loaded', 'success');
    } catch (error) {
      console.error('INKLUSIV Popup: Initialization error:', error);
      this.showStatus('Failed to load settings', 'error');
    }
  }

  async loadSettings() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
      
      if (response && response.success) {
        this.settings = { ...this.defaultSettings, ...response.settings };
      } else {
        this.settings = { ...this.defaultSettings };
      }
    } catch (error) {
      console.error('INKLUSIV Popup: Load settings error:', error);
      this.settings = { ...this.defaultSettings };
    }
  }

  async saveSettings() {
    try {
      this.showStatus('Saving...', 'info');
      this.setButtonsDisabled(true);

      const response = await chrome.runtime.sendMessage({
        action: 'saveSettings',
        settings: this.settings
      });

      if (response && response.success) {
        this.showStatus('Settings saved successfully', 'success');
        
        // Add visual feedback to changed settings
        this.highlightChangedSettings();
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('INKLUSIV Popup: Save settings error:', error);
      this.showStatus('Failed to save settings', 'error');
    } finally {
      this.setButtonsDisabled(false);
    }
  }

  setupEventListeners() {
    // Toggle switches
    const toggles = document.querySelectorAll('input[type="checkbox"][data-feature]');
    toggles.forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        const feature = e.target.dataset.feature;
        const enabled = e.target.checked;
        this.updateSetting(feature, enabled);
      });
    });

    // Select dropdowns
    const selects = document.querySelectorAll('select[data-feature]');
    selects.forEach(select => {
      select.addEventListener('change', (e) => {
        const feature = e.target.dataset.feature;
        const value = e.target.value;
        this.updateSetting(feature, value);
      });
    });

    // Save button
    const saveButton = document.getElementById('save-settings');
    saveButton.addEventListener('click', () => {
      this.saveSettings();
    });

    // Reset button
    const resetButton = document.getElementById('reset-settings');
    resetButton.addEventListener('click', () => {
      this.resetSettings();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            this.saveSettings();
            break;
          case 'r':
            e.preventDefault();
            this.resetSettings();
            break;
        }
      }
    });

    // Auto-save on setting change (with debounce)
    this.debouncedSave = this.debounce(() => {
      this.saveSettings();
    }, 1000);
  }

  updateSetting(feature, value) {
    const oldValue = this.settings[feature];
    this.settings[feature] = value;

    // Mark setting as changed for visual feedback
    const settingItem = document.querySelector(`[data-feature="${feature}"]`).closest('.setting-item');
    if (settingItem) {
      settingItem.classList.add('changed');
      setTimeout(() => {
        settingItem.classList.remove('changed');
      }, 600);
    }

    // Auto-save after a delay
    this.debouncedSave();

    // Log the change
    console.log(`INKLUSIV: ${feature} changed from ${oldValue} to ${value}`);
  }

  updateUI() {
    // Update toggle switches
    Object.entries(this.settings).forEach(([feature, value]) => {
      const toggle = document.querySelector(`input[data-feature="${feature}"]`);
      if (toggle && toggle.type === 'checkbox') {
        toggle.checked = Boolean(value);
      }

      const select = document.querySelector(`select[data-feature="${feature}"]`);
      if (select) {
        select.value = value;
      }
    });

    // Update feature availability indicators
    this.updateFeatureAvailability();
  }

  updateFeatureAvailability() {
    // Check voice input availability
    const voiceToggle = document.getElementById('voice-toggle');
    const voiceItem = voiceToggle.closest('.setting-item');
    
    if (!this.isVoiceInputSupported()) {
      voiceToggle.disabled = true;
      voiceItem.classList.add('loading');
      const description = voiceItem.querySelector('.setting-description');
      description.textContent = 'Voice input not supported in this browser';
    }

    // Check gesture input availability
    const gestureToggle = document.getElementById('gesture-toggle');
    const gestureItem = gestureToggle.closest('.setting-item');
    
    if (!this.isGestureInputSupported()) {
      gestureToggle.disabled = true;
      gestureItem.classList.add('loading');
      const description = gestureItem.querySelector('.setting-description');
      description.textContent = 'Camera access required for gesture input';
    }

    // Check TTS availability
    const ttsToggle = document.getElementById('tts-toggle');
    const ttsItem = ttsToggle.closest('.setting-item');
    
    if (!this.isTTSSupported()) {
      ttsToggle.disabled = true;
      ttsItem.classList.add('loading');
      const description = ttsItem.querySelector('.setting-description');
      description.textContent = 'Text-to-speech not supported in this browser';
    }
  }

  isVoiceInputSupported() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  isGestureInputSupported() {
    return navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
  }

  isTTSSupported() {
    return 'speechSynthesis' in window;
  }

  async resetSettings() {
    try {
      const confirmed = confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.');
      
      if (!confirmed) return;

      this.showStatus('Resetting settings...', 'info');
      this.setButtonsDisabled(true);

      // Reset to default settings
      this.settings = { ...this.defaultSettings };

      // Save the reset settings
      const response = await chrome.runtime.sendMessage({
        action: 'saveSettings',
        settings: this.settings
      });

      if (response && response.success) {
        // Update UI
        this.updateUI();
        this.showStatus('Settings reset to defaults', 'success');
        
        // Highlight all settings as changed
        const settingItems = document.querySelectorAll('.setting-item');
        settingItems.forEach(item => {
          item.classList.add('changed');
          setTimeout(() => {
            item.classList.remove('changed');
          }, 600);
        });
      } else {
        throw new Error('Failed to reset settings');
      }
    } catch (error) {
      console.error('INKLUSIV Popup: Reset settings error:', error);
      this.showStatus('Failed to reset settings', 'error');
    } finally {
      this.setButtonsDisabled(false);
    }
  }

  highlightChangedSettings() {
    const settingItems = document.querySelectorAll('.setting-item');
    settingItems.forEach(item => {
      item.classList.add('changed');
      setTimeout(() => {
        item.classList.remove('changed');
      }, 600);
    });
  }

  showStatus(message, type = 'info') {
    const statusElement = document.getElementById('status-message');
    
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.className = `status-message show ${type}`;
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        statusElement.classList.remove('show');
      }, 3000);
    }
  }

  setButtonsDisabled(disabled) {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
      button.disabled = disabled;
    });
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Export settings functionality
  async exportSettings() {
    try {
      const dataStr = JSON.stringify(this.settings, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'inklusiv-settings.json';
      link.click();
      
      URL.revokeObjectURL(url);
      this.showStatus('Settings exported successfully', 'success');
    } catch (error) {
      console.error('INKLUSIV Popup: Export error:', error);
      this.showStatus('Failed to export settings', 'error');
    }
  }

  // Import settings functionality
  async importSettings(file) {
    try {
      const text = await file.text();
      const importedSettings = JSON.parse(text);
      
      // Validate imported settings
      const validSettings = {};
      Object.keys(this.defaultSettings).forEach(key => {
        if (key in importedSettings) {
          validSettings[key] = importedSettings[key];
        } else {
          validSettings[key] = this.defaultSettings[key];
        }
      });
      
      this.settings = validSettings;
      
      // Save imported settings
      const response = await chrome.runtime.sendMessage({
        action: 'saveSettings',
        settings: this.settings
      });
      
      if (response && response.success) {
        this.updateUI();
        this.showStatus('Settings imported successfully', 'success');
      } else {
        throw new Error('Failed to save imported settings');
      }
    } catch (error) {
      console.error('INKLUSIV Popup: Import error:', error);
      this.showStatus('Failed to import settings', 'error');
    }
  }

  // Get current tab info for context
  async getCurrentTabInfo() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      return tab;
    } catch (error) {
      console.error('INKLUSIV Popup: Get tab info error:', error);
      return null;
    }
  }

  // Send test message to content script
  async testContentScript() {
    try {
      const tab = await this.getCurrentTabInfo();
      if (!tab) return;

      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'test',
        message: 'Hello from popup!'
      });

      if (response) {
        this.showStatus('Content script communication successful', 'success');
      } else {
        this.showStatus('Content script not responding', 'error');
      }
    } catch (error) {
      console.error('INKLUSIV Popup: Test content script error:', error);
      this.showStatus('Content script communication failed', 'error');
    }
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.inklusivPopup = new InklusivPopup();
});

// Handle popup unload
window.addEventListener('beforeunload', () => {
  // Save any pending changes
  if (window.inklusivPopup && window.inklusivPopup.debouncedSave) {
    window.inklusivPopup.saveSettings();
  }
});

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
  // Tab navigation enhancement
  if (e.key === 'Tab') {
    const focusableElements = document.querySelectorAll(
      'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }
  
  // Escape to close popup
  if (e.key === 'Escape') {
    window.close();
  }
});

// Add context menu for advanced options (right-click)
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  
  // Show custom context menu for advanced options
  const contextMenu = document.createElement('div');
  contextMenu.className = 'context-menu';
  contextMenu.innerHTML = `
    <div class="context-item" data-action="export">Export Settings</div>
    <div class="context-item" data-action="import">Import Settings</div>
    <div class="context-item" data-action="test">Test Content Script</div>
  `;
  
  contextMenu.style.cssText = `
    position: fixed;
    top: ${e.clientY}px;
    left: ${e.clientX}px;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    min-width: 150px;
  `;
  
  // Style context items
  const style = document.createElement('style');
  style.textContent = `
    .context-item {
      padding: 8px 12px;
      cursor: pointer;
      font-size: 13px;
      border-bottom: 1px solid #f3f4f6;
    }
    .context-item:last-child {
      border-bottom: none;
    }
    .context-item:hover {
      background: #f9fafb;
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(contextMenu);
  
  // Handle context menu clicks
  contextMenu.addEventListener('click', (e) => {
    const action = e.target.dataset.action;
    if (action && window.inklusivPopup) {
      switch (action) {
        case 'export':
          window.inklusivPopup.exportSettings();
          break;
        case 'import':
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.json';
          input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
              window.inklusivPopup.importSettings(file);
            }
          };
          input.click();
          break;
        case 'test':
          window.inklusivPopup.testContentScript();
          break;
      }
    }
    contextMenu.remove();
    style.remove();
  });
  
  // Remove context menu on outside click
  setTimeout(() => {
    document.addEventListener('click', () => {
      if (contextMenu.parentNode) {
        contextMenu.remove();
        style.remove();
      }
    }, { once: true });
  }, 0);
});
