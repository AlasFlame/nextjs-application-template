// INKLUSIV Extension Background Service Worker
// Handles communication between popup and content scripts

class InklusivBackground {
  constructor() {
    this.initializeListeners();
  }

  initializeListeners() {
    // Listen for extension installation
    chrome.runtime.onInstalled.addListener(this.handleInstall.bind(this));
    
    // Listen for messages from popup and content scripts
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
    
    // Listen for tab updates to reinject scripts if needed
    chrome.tabs.onUpdated.addListener(this.handleTabUpdate.bind(this));
  }

  async handleInstall(details) {
    try {
      if (details.reason === 'install') {
        // Set default settings on first install
        const defaultSettings = {
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
        
        await chrome.storage.local.set({ inklusivSettings: defaultSettings });
        console.log('INKLUSIV: Default settings initialized');
      }
    } catch (error) {
      console.error('INKLUSIV Background: Install error:', error);
    }
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'getSettings':
          const settings = await this.getSettings();
          sendResponse({ success: true, settings });
          break;
          
        case 'saveSettings':
          await this.saveSettings(request.settings);
          // Broadcast settings to all tabs
          await this.broadcastToAllTabs('settingsUpdated', request.settings);
          sendResponse({ success: true });
          break;
          
        case 'toggleFeature':
          await this.toggleFeature(request.feature, request.value);
          sendResponse({ success: true });
          break;
          
        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('INKLUSIV Background: Message handling error:', error);
      sendResponse({ success: false, error: error.message });
    }
    
    return true; // Keep message channel open for async response
  }

  async handleTabUpdate(tabId, changeInfo, tab) {
    try {
      if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
        // Optionally reinject content scripts or send settings to new pages
        const settings = await this.getSettings();
        await chrome.tabs.sendMessage(tabId, {
          action: 'initializeWithSettings',
          settings: settings
        }).catch(() => {
          // Ignore errors for tabs that don't have content scripts
        });
      }
    } catch (error) {
      console.error('INKLUSIV Background: Tab update error:', error);
    }
  }

  async getSettings() {
    try {
      const result = await chrome.storage.local.get('inklusivSettings');
      return result.inklusivSettings || {};
    } catch (error) {
      console.error('INKLUSIV Background: Get settings error:', error);
      return {};
    }
  }

  async saveSettings(settings) {
    try {
      await chrome.storage.local.set({ inklusivSettings: settings });
      console.log('INKLUSIV: Settings saved successfully');
    } catch (error) {
      console.error('INKLUSIV Background: Save settings error:', error);
      throw error;
    }
  }

  async toggleFeature(feature, value) {
    try {
      const settings = await this.getSettings();
      settings[feature] = value;
      await this.saveSettings(settings);
      
      // Broadcast to all tabs
      await this.broadcastToAllTabs('featureToggled', { feature, value });
    } catch (error) {
      console.error('INKLUSIV Background: Toggle feature error:', error);
      throw error;
    }
  }

  async broadcastToAllTabs(action, data) {
    try {
      const tabs = await chrome.tabs.query({});
      const promises = tabs.map(tab => {
        if (!tab.url.startsWith('chrome://')) {
          return chrome.tabs.sendMessage(tab.id, { action, data }).catch(() => {
            // Ignore errors for tabs without content scripts
          });
        }
      });
      
      await Promise.all(promises);
    } catch (error) {
      console.error('INKLUSIV Background: Broadcast error:', error);
    }
  }
}

// Initialize the background service
new InklusivBackground();
