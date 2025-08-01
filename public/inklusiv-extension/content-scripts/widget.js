// INKLUSIV Extension Floating Widget
// Main UI widget that appears on all pages

class InklusivWidget {
  constructor() {
    this.widget = null;
    this.isExpanded = false;
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };
    this.position = { x: window.innerWidth - 80, y: window.innerHeight - 80 };
    this.settings = {};
    
    this.initializeWidget();
    this.setupEventListeners();
    this.loadSettings();
  }

  setupEventListeners() {
    // Listen for settings updates
    window.inklusivUtils.onMessage('settingsUpdated', (request) => {
      this.settings = request.data;
      this.updateWidgetState();
    });

    window.inklusivUtils.onMessage('featureToggled', (request) => {
      const { feature, value } = request.data;
      this.settings[feature] = value;
      this.updateWidgetState();
    });

    window.inklusivUtils.onMessage('initializeWithSettings', (request) => {
      this.settings = request.data.settings || {};
      this.updateWidgetState();
    });

    // Handle window resize
    window.addEventListener('resize', window.inklusivUtils.debounce(() => {
      this.adjustPositionOnResize();
    }, 250));

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.ensureWidgetVisible();
      }
    });
  }

  async loadSettings() {
    try {
      this.settings = await window.inklusivUtils.getSettings();
      this.updateWidgetState();
    } catch (error) {
      window.inklusivUtils.log('Failed to load settings: ' + error.message, 'error');
    }
  }

  initializeWidget() {
    // Don't create widget on extension pages or chrome pages
    if (window.location.href.startsWith('chrome://') || 
        window.location.href.startsWith('chrome-extension://')) {
      return;
    }

    this.createWidget();
    this.injectWidgetStyles();
    this.attachEventListeners();
  }

  createWidget() {
    // Main widget container
    this.widget = window.inklusivUtils.createElement('div', {
      id: 'inklusiv-widget',
      className: 'inklusiv-widget'
    });

    // Widget toggle button (always visible)
    const toggleButton = window.inklusivUtils.createElement('button', {
      className: 'inklusiv-widget-toggle',
      title: 'INKLUSIV Accessibility Widget',
      innerHTML: 'I'
    });

    // Expanded widget panel
    const panel = window.inklusivUtils.createElement('div', {
      className: 'inklusiv-widget-panel',
      innerHTML: this.createPanelHTML()
    });

    this.widget.appendChild(toggleButton);
    this.widget.appendChild(panel);
    document.body.appendChild(this.widget);

    // Set initial position
    this.updateWidgetPosition();
  }

  createPanelHTML() {
    return `
      <div class="inklusiv-widget-header">
        <span class="inklusiv-widget-title">INKLUSIV</span>
        <button class="inklusiv-widget-close" title="Close">×</button>
      </div>
      
      <div class="inklusiv-widget-content">
        <div class="inklusiv-widget-section">
          <h4>Input Methods</h4>
          <div class="inklusiv-widget-controls">
            <button class="inklusiv-widget-btn inklusiv-widget-voice" title="Toggle Voice Input">
              <span class="inklusiv-btn-text">Voice</span>
              <span class="inklusiv-status-indicator"></span>
            </button>
            <button class="inklusiv-widget-btn inklusiv-widget-gesture" title="Toggle Gesture Input">
              <span class="inklusiv-btn-text">Gesture</span>
              <span class="inklusiv-status-indicator"></span>
            </button>
          </div>
        </div>

        <div class="inklusiv-widget-section">
          <h4>Accessibility</h4>
          <div class="inklusiv-widget-controls">
            <button class="inklusiv-widget-btn inklusiv-widget-dyslexia" title="Toggle Dyslexia Font">
              <span class="inklusiv-btn-text">Dyslexia Font</span>
              <span class="inklusiv-status-indicator"></span>
            </button>
            <button class="inklusiv-widget-btn inklusiv-widget-tts" title="Toggle Text-to-Speech">
              <span class="inklusiv-btn-text">Read Aloud</span>
              <span class="inklusiv-status-indicator"></span>
            </button>
            <button class="inklusiv-widget-btn inklusiv-widget-contrast" title="Toggle High Contrast">
              <span class="inklusiv-btn-text">High Contrast</span>
              <span class="inklusiv-status-indicator"></span>
            </button>
            <button class="inklusiv-widget-btn inklusiv-widget-dark" title="Toggle Dark Mode">
              <span class="inklusiv-btn-text">Dark Mode</span>
              <span class="inklusiv-status-indicator"></span>
            </button>
          </div>
        </div>

        <div class="inklusiv-widget-section">
          <h4>Focus & Attention</h4>
          <div class="inklusiv-widget-controls">
            <button class="inklusiv-widget-btn inklusiv-widget-adhd" title="Toggle ADHD Mode">
              <span class="inklusiv-btn-text">Focus Mode</span>
              <span class="inklusiv-status-indicator"></span>
            </button>
            <select class="inklusiv-widget-select inklusiv-widget-colorblind" title="Colorblind Filter">
              <option value="none">No Color Filter</option>
              <option value="protanopia">Protanopia</option>
              <option value="deuteranopia">Deuteranopia</option>
              <option value="tritanopia">Tritanopia</option>
            </select>
          </div>
        </div>

        <div class="inklusiv-widget-section">
          <div class="inklusiv-widget-controls">
            <button class="inklusiv-widget-btn inklusiv-widget-help" title="Show Help">
              <span class="inklusiv-btn-text">Help</span>
            </button>
            <button class="inklusiv-widget-btn inklusiv-widget-settings" title="Open Settings">
              <span class="inklusiv-btn-text">Settings</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  injectWidgetStyles() {
    const widgetCSS = `
      .inklusiv-widget {
        position: fixed;
        z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.4;
        color: #333;
        user-select: none;
        cursor: move;
      }

      .inklusiv-widget-toggle {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #007acc;
        color: white;
        border: none;
        font-size: 20px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 122, 204, 0.3);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .inklusiv-widget-toggle:hover {
        background: #005a9e;
        transform: scale(1.05);
        box-shadow: 0 6px 16px rgba(0, 122, 204, 0.4);
      }

      .inklusiv-widget-panel {
        position: absolute;
        bottom: 60px;
        right: 0;
        width: 280px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        border: 1px solid #e0e0e0;
        opacity: 0;
        visibility: hidden;
        transform: translateY(10px);
        transition: all 0.3s ease;
        max-height: 500px;
        overflow-y: auto;
      }

      .inklusiv-widget.expanded .inklusiv-widget-panel {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      .inklusiv-widget-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        border-bottom: 1px solid #e0e0e0;
        background: #f8f9fa;
        border-radius: 12px 12px 0 0;
      }

      .inklusiv-widget-title {
        font-weight: 600;
        font-size: 16px;
        color: #007acc;
      }

      .inklusiv-widget-close {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #666;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
      }

      .inklusiv-widget-close:hover {
        background: #e0e0e0;
        color: #333;
      }

      .inklusiv-widget-content {
        padding: 16px;
      }

      .inklusiv-widget-section {
        margin-bottom: 20px;
      }

      .inklusiv-widget-section:last-child {
        margin-bottom: 0;
      }

      .inklusiv-widget-section h4 {
        margin: 0 0 12px 0;
        font-size: 13px;
        font-weight: 600;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .inklusiv-widget-controls {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .inklusiv-widget-btn {
        flex: 1;
        min-width: 120px;
        padding: 10px 12px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        background: white;
        color: #333;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 13px;
      }

      .inklusiv-widget-btn:hover {
        border-color: #007acc;
        background: #f0f8ff;
      }

      .inklusiv-widget-btn.active {
        background: #007acc;
        color: white;
        border-color: #007acc;
      }

      .inklusiv-widget-btn.active .inklusiv-status-indicator {
        background: #4ade80;
      }

      .inklusiv-status-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #e0e0e0;
        transition: background 0.2s ease;
      }

      .inklusiv-widget-select {
        flex: 1;
        padding: 10px 12px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        background: white;
        color: #333;
        cursor: pointer;
        font-size: 13px;
      }

      .inklusiv-widget-select:focus {
        outline: none;
        border-color: #007acc;
        box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
      }

      /* Dragging state */
      .inklusiv-widget.dragging {
        cursor: grabbing;
      }

      .inklusiv-widget.dragging .inklusiv-widget-toggle {
        transform: scale(0.95);
      }

      /* Responsive adjustments */
      @media (max-width: 480px) {
        .inklusiv-widget-panel {
          width: 260px;
          right: -10px;
        }
        
        .inklusiv-widget-btn {
          min-width: 100px;
          font-size: 12px;
        }
      }

      /* Animation for status changes */
      .inklusiv-widget-btn.status-change {
        animation: inklusivPulse 0.6s ease;
      }

      @keyframes inklusivPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }

      /* Accessibility improvements */
      .inklusiv-widget-btn:focus,
      .inklusiv-widget-select:focus,
      .inklusiv-widget-toggle:focus {
        outline: 2px solid #007acc;
        outline-offset: 2px;
      }

      /* High contrast mode compatibility */
      @media (prefers-contrast: high) {
        .inklusiv-widget-panel {
          border: 2px solid #000;
        }
        
        .inklusiv-widget-btn {
          border: 2px solid #000;
        }
      }
    `;

    window.inklusivUtils.injectCSS(widgetCSS, 'inklusiv-widget-styles');
  }

  attachEventListeners() {
    if (!this.widget) return;

    // Toggle button click
    const toggleButton = this.widget.querySelector('.inklusiv-widget-toggle');
    toggleButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleWidget();
    });

    // Close button click
    const closeButton = this.widget.querySelector('.inklusiv-widget-close');
    closeButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeWidget();
    });

    // Feature toggle buttons
    this.attachFeatureListeners();

    // Dragging functionality
    this.attachDragListeners();

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!this.widget.contains(e.target) && this.isExpanded) {
        this.closeWidget();
      }
    });

    // Prevent panel clicks from closing widget
    const panel = this.widget.querySelector('.inklusiv-widget-panel');
    panel.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  attachFeatureListeners() {
    // Voice input toggle
    const voiceBtn = this.widget.querySelector('.inklusiv-widget-voice');
    voiceBtn.addEventListener('click', () => {
      this.toggleFeature('voiceInput');
    });

    // Gesture input toggle
    const gestureBtn = this.widget.querySelector('.inklusiv-widget-gesture');
    gestureBtn.addEventListener('click', () => {
      this.toggleFeature('gestureInput');
    });

    // Dyslexia font toggle
    const dyslexiaBtn = this.widget.querySelector('.inklusiv-widget-dyslexia');
    dyslexiaBtn.addEventListener('click', () => {
      this.toggleFeature('dyslexiaFont');
    });

    // Text-to-speech toggle
    const ttsBtn = this.widget.querySelector('.inklusiv-widget-tts');
    ttsBtn.addEventListener('click', () => {
      this.toggleFeature('textToSpeech');
    });

    // High contrast toggle
    const contrastBtn = this.widget.querySelector('.inklusiv-widget-contrast');
    contrastBtn.addEventListener('click', () => {
      this.toggleFeature('highContrast');
    });

    // Dark mode toggle
    const darkBtn = this.widget.querySelector('.inklusiv-widget-dark');
    darkBtn.addEventListener('click', () => {
      this.toggleFeature('darkMode');
    });

    // ADHD mode toggle
    const adhdBtn = this.widget.querySelector('.inklusiv-widget-adhd');
    adhdBtn.addEventListener('click', () => {
      this.toggleFeature('adhdMode');
    });

    // Colorblind filter select
    const colorblindSelect = this.widget.querySelector('.inklusiv-widget-colorblind');
    colorblindSelect.addEventListener('change', (e) => {
      this.setColorblindMode(e.target.value);
    });

    // Help button
    const helpBtn = this.widget.querySelector('.inklusiv-widget-help');
    helpBtn.addEventListener('click', () => {
      this.showHelp();
    });

    // Settings button
    const settingsBtn = this.widget.querySelector('.inklusiv-widget-settings');
    settingsBtn.addEventListener('click', () => {
      this.openSettings();
    });
  }

  attachDragListeners() {
    const toggleButton = this.widget.querySelector('.inklusiv-widget-toggle');

    let dragStartTime = 0;
    let hasMoved = false;

    toggleButton.addEventListener('mousedown', (e) => {
      dragStartTime = Date.now();
      hasMoved = false;
      this.startDrag(e);
    });

    toggleButton.addEventListener('touchstart', (e) => {
      dragStartTime = Date.now();
      hasMoved = false;
      this.startDrag(e.touches[0]);
    }, { passive: false });

    document.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        hasMoved = true;
        this.drag(e);
      }
    });

    document.addEventListener('touchmove', (e) => {
      if (this.isDragging) {
        hasMoved = true;
        this.drag(e.touches[0]);
        e.preventDefault();
      }
    }, { passive: false });

    document.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.endDrag();
        // If it was a quick click without movement, toggle the widget
        if (!hasMoved && Date.now() - dragStartTime < 200) {
          setTimeout(() => this.toggleWidget(), 0);
        }
      }
    });

    document.addEventListener('touchend', () => {
      if (this.isDragging) {
        this.endDrag();
        // If it was a quick tap without movement, toggle the widget
        if (!hasMoved && Date.now() - dragStartTime < 200) {
          setTimeout(() => this.toggleWidget(), 0);
        }
      }
    });
  }

  startDrag(event) {
    this.isDragging = true;
    this.widget.classList.add('dragging');
    
    const rect = this.widget.getBoundingClientRect();
    this.dragOffset.x = event.clientX - rect.left;
    this.dragOffset.y = event.clientY - rect.top;
  }

  drag(event) {
    if (!this.isDragging) return;

    const x = event.clientX - this.dragOffset.x;
    const y = event.clientY - this.dragOffset.y;

    // Keep widget within viewport bounds
    const maxX = window.innerWidth - this.widget.offsetWidth;
    const maxY = window.innerHeight - this.widget.offsetHeight;

    this.position.x = Math.max(0, Math.min(x, maxX));
    this.position.y = Math.max(0, Math.min(y, maxY));

    this.updateWidgetPosition();
  }

  endDrag() {
    this.isDragging = false;
    this.widget.classList.remove('dragging');
    
    // Snap to edges if close
    const snapThreshold = 50;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (this.position.x < snapThreshold) {
      this.position.x = 20;
    } else if (this.position.x > viewportWidth - this.widget.offsetWidth - snapThreshold) {
      this.position.x = viewportWidth - this.widget.offsetWidth - 20;
    }

    if (this.position.y < snapThreshold) {
      this.position.y = 20;
    } else if (this.position.y > viewportHeight - this.widget.offsetHeight - snapThreshold) {
      this.position.y = viewportHeight - this.widget.offsetHeight - 20;
    }

    this.updateWidgetPosition();
  }

  updateWidgetPosition() {
    if (this.widget) {
      this.widget.style.left = `${this.position.x}px`;
      this.widget.style.top = `${this.position.y}px`;
    }
  }

  toggleWidget() {
    this.isExpanded = !this.isExpanded;
    this.widget.classList.toggle('expanded', this.isExpanded);
  }

  closeWidget() {
    this.isExpanded = false;
    this.widget.classList.remove('expanded');
  }

  async toggleFeature(feature) {
    const currentValue = this.settings[feature] || false;
    const newValue = !currentValue;
    
    // Update local settings
    this.settings[feature] = newValue;
    
    // Save to storage and notify background
    const success = await window.inklusivUtils.toggleFeature(feature, newValue);
    
    if (success) {
      this.updateButtonState(feature, newValue);
      this.animateStatusChange(feature);
    } else {
      // Revert local change if save failed
      this.settings[feature] = currentValue;
      window.inklusivUtils.showNotification('Failed to save setting', 'error');
    }
  }

  async setColorblindMode(mode) {
    this.settings.colorblindMode = mode;
    
    const success = await window.inklusivUtils.toggleFeature('colorblindMode', mode);
    
    if (success) {
      window.inklusivAccessibility.setColorblindMode(mode);
    } else {
      window.inklusivUtils.showNotification('Failed to save colorblind setting', 'error');
    }
  }

  updateWidgetState() {
    if (!this.widget) return;

    // Update button states
    Object.entries(this.settings).forEach(([feature, enabled]) => {
      this.updateButtonState(feature, enabled);
    });

    // Update colorblind select
    const colorblindSelect = this.widget.querySelector('.inklusiv-widget-colorblind');
    if (colorblindSelect && this.settings.colorblindMode) {
      colorblindSelect.value = this.settings.colorblindMode;
    }
  }

  updateButtonState(feature, enabled) {
    const buttonMap = {
      voiceInput: '.inklusiv-widget-voice',
      gestureInput: '.inklusiv-widget-gesture',
      dyslexiaFont: '.inklusiv-widget-dyslexia',
      textToSpeech: '.inklusiv-widget-tts',
      highContrast: '.inklusiv-widget-contrast',
      darkMode: '.inklusiv-widget-dark',
      adhdMode: '.inklusiv-widget-adhd'
    };

    const selector = buttonMap[feature];
    if (selector) {
      const button = this.widget.querySelector(selector);
      if (button) {
        button.classList.toggle('active', enabled);
      }
    }
  }

  animateStatusChange(feature) {
    const buttonMap = {
      voiceInput: '.inklusiv-widget-voice',
      gestureInput: '.inklusiv-widget-gesture',
      dyslexiaFont: '.inklusiv-widget-dyslexia',
      textToSpeech: '.inklusiv-widget-tts',
      highContrast: '.inklusiv-widget-contrast',
      darkMode: '.inklusiv-widget-dark',
      adhdMode: '.inklusiv-widget-adhd'
    };

    const selector = buttonMap[feature];
    if (selector) {
      const button = this.widget.querySelector(selector);
      if (button) {
        button.classList.add('status-change');
        setTimeout(() => {
          button.classList.remove('status-change');
        }, 600);
      }
    }
  }

  showHelp() {
    const helpText = `
      INKLUSIV Accessibility Widget Help:
      
      🎤 Voice: Enable voice commands and text input
      👋 Gesture: Enable hand gesture controls  
      📖 Dyslexia Font: Use dyslexia-friendly fonts
      🔊 Read Aloud: Text-to-speech on hover/selection
      🌓 High Contrast: High contrast color scheme
      🌙 Dark Mode: Dark theme for reduced eye strain
      🎯 Focus Mode: Hide distractions, improve focus
      🎨 Color Filter: Filters for colorblind users
      
      Drag the widget to move it around the page.
      Click outside the panel to close it.
    `;
    
    window.inklusivUtils.showNotification(helpText, 'info', 8000);
  }

  openSettings() {
    // Open the extension popup
    try {
      chrome.runtime.sendMessage({ action: 'openPopup' });
    } catch (error) {
      window.inklusivUtils.showNotification('Settings panel not available', 'warning');
    }
  }

  adjustPositionOnResize() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Ensure widget stays within bounds
    this.position.x = Math.min(this.position.x, viewportWidth - this.widget.offsetWidth);
    this.position.y = Math.min(this.position.y, viewportHeight - this.widget.offsetHeight);
    
    this.updateWidgetPosition();
  }

  ensureWidgetVisible() {
    if (this.widget && !window.inklusivUtils.isElementVisible(this.widget)) {
      this.position.x = window.innerWidth - 80;
      this.position.y = window.innerHeight - 80;
      this.updateWidgetPosition();
    }
  }
}

// Initialize widget when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.inklusivWidget = new InklusivWidget();
  });
} else {
  window.inklusivWidget = new InklusivWidget();
}
