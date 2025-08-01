// INKLUSIV Extension Utilities
// Common helper functions and error handlers

class InklusivUtilities {
  constructor() {
    this.extensionId = chrome.runtime.id;
    this.messageHandlers = new Map();
    this.initializeMessageListener();
  }

  initializeMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      const handler = this.messageHandlers.get(request.action);
      if (handler) {
        handler(request, sender, sendResponse);
        return true; // Keep message channel open
      }
    });
  }

  // Register message handlers
  onMessage(action, handler) {
    this.messageHandlers.set(action, handler);
  }

  // Send message to background script
  async sendToBackground(action, data = {}) {
    try {
      return await chrome.runtime.sendMessage({ action, ...data });
    } catch (error) {
      console.error('INKLUSIV Utilities: Background message error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get settings from storage
  async getSettings() {
    try {
      const response = await this.sendToBackground('getSettings');
      return response.success ? response.settings : {};
    } catch (error) {
      console.error('INKLUSIV Utilities: Get settings error:', error);
      return {};
    }
  }

  // Save settings to storage
  async saveSettings(settings) {
    try {
      const response = await this.sendToBackground('saveSettings', { settings });
      return response.success;
    } catch (error) {
      console.error('INKLUSIV Utilities: Save settings error:', error);
      return false;
    }
  }

  // Toggle a specific feature
  async toggleFeature(feature, value) {
    try {
      const response = await this.sendToBackground('toggleFeature', { feature, value });
      return response.success;
    } catch (error) {
      console.error('INKLUSIV Utilities: Toggle feature error:', error);
      return false;
    }
  }

  // Create and inject CSS styles
  injectCSS(css, id = null) {
    try {
      const styleId = id || `inklusiv-style-${Date.now()}`;
      
      // Remove existing style if updating
      if (id) {
        const existing = document.getElementById(styleId);
        if (existing) existing.remove();
      }

      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = css;
      document.head.appendChild(style);
      
      return styleId;
    } catch (error) {
      console.error('INKLUSIV Utilities: CSS injection error:', error);
      return null;
    }
  }

  // Remove injected CSS
  removeCSS(styleId) {
    try {
      const style = document.getElementById(styleId);
      if (style) {
        style.remove();
        return true;
      }
      return false;
    } catch (error) {
      console.error('INKLUSIV Utilities: CSS removal error:', error);
      return false;
    }
  }

  // Create DOM element with attributes
  createElement(tag, attributes = {}, textContent = '') {
    try {
      const element = document.createElement(tag);
      
      Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
          element.className = value;
        } else if (key === 'innerHTML') {
          element.innerHTML = value;
        } else {
          element.setAttribute(key, value);
        }
      });
      
      if (textContent) {
        element.textContent = textContent;
      }
      
      return element;
    } catch (error) {
      console.error('INKLUSIV Utilities: Element creation error:', error);
      return null;
    }
  }

  // Check if API is supported
  isAPISupported(apiName) {
    const apiChecks = {
      speechRecognition: () => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
      speechSynthesis: () => 'speechSynthesis' in window,
      mediaDevices: () => navigator.mediaDevices && navigator.mediaDevices.getUserMedia,
      webGL: () => {
        try {
          const canvas = document.createElement('canvas');
          return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch (e) {
          return false;
        }
      }
    };

    return apiChecks[apiName] ? apiChecks[apiName]() : false;
  }

  // Debounce function for performance
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

  // Throttle function for performance
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Show notification to user
  showNotification(message, type = 'info', duration = 3000) {
    try {
      const notification = this.createElement('div', {
        className: `inklusiv-notification inklusiv-notification-${type}`,
        innerHTML: message
      });

      const notificationCSS = `
        .inklusiv-notification {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #333;
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          z-index: 2147483647;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          max-width: 300px;
          word-wrap: break-word;
          animation: inklusivSlideIn 0.3s ease-out;
        }
        
        .inklusiv-notification-success {
          background: #10b981;
        }
        
        .inklusiv-notification-error {
          background: #ef4444;
        }
        
        .inklusiv-notification-warning {
          background: #f59e0b;
        }
        
        @keyframes inklusivSlideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `;

      this.injectCSS(notificationCSS, 'inklusiv-notification-styles');
      document.body.appendChild(notification);

      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, duration);

      return notification;
    } catch (error) {
      console.error('INKLUSIV Utilities: Notification error:', error);
      return null;
    }
  }

  // Log with extension prefix
  log(message, type = 'info') {
    const prefix = 'INKLUSIV:';
    switch (type) {
      case 'error':
        console.error(prefix, message);
        break;
      case 'warn':
        console.warn(prefix, message);
        break;
      default:
        console.log(prefix, message);
    }
  }

  // Check if element is visible
  isElementVisible(element) {
    try {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.visibility !== 'hidden' &&
        style.display !== 'none' &&
        style.opacity !== '0'
      );
    } catch (error) {
      return false;
    }
  }

  // Get readable text from element
  getElementText(element) {
    try {
      // Get text content, excluding script and style elements
      const clone = element.cloneNode(true);
      const scripts = clone.querySelectorAll('script, style');
      scripts.forEach(script => script.remove());
      
      return clone.textContent || clone.innerText || '';
    } catch (error) {
      return '';
    }
  }
}

// Create global utilities instance
window.inklusivUtils = new InklusivUtilities();
