// INKLUSIV Extension Accessibility Features
// Real-time accessibility enhancements

class InklusivAccessibility {
  constructor() {
    this.activeFeatures = new Set();
    this.styleIds = new Map();
    this.ttsUtterance = null;
    this.ttsQueue = [];
    this.isReading = false;
    
    this.initializeFeatures();
    this.setupEventListeners();
  }

  initializeFeatures() {
    // Initialize Text-to-Speech if supported
    if (window.inklusivUtils.isAPISupported('speechSynthesis')) {
      this.initializeTTS();
    }
    
    // Setup hover listeners for TTS
    this.setupTTSHoverListeners();
  }

  setupEventListeners() {
    // Listen for settings updates
    window.inklusivUtils.onMessage('settingsUpdated', (request) => {
      this.applySettings(request.data);
    });

    window.inklusivUtils.onMessage('featureToggled', (request) => {
      const { feature, value } = request.data;
      this.toggleFeature(feature, value);
    });
  }

  async applySettings(settings) {
    try {
      // Apply each accessibility feature based on settings
      Object.entries(settings).forEach(([feature, enabled]) => {
        this.toggleFeature(feature, enabled);
      });
    } catch (error) {
      window.inklusivUtils.log('Settings application error: ' + error.message, 'error');
    }
  }

  toggleFeature(feature, enabled) {
    try {
      if (enabled) {
        this.enableFeature(feature);
      } else {
        this.disableFeature(feature);
      }
    } catch (error) {
      window.inklusivUtils.log(`Feature toggle error (${feature}): ${error.message}`, 'error');
    }
  }

  enableFeature(feature) {
    if (this.activeFeatures.has(feature)) return;

    switch (feature) {
      case 'dyslexiaFont':
        this.enableDyslexiaFont();
        break;
      case 'textToSpeech':
        this.enableTextToSpeech();
        break;
      case 'colorblindMode':
        // This will be handled separately with the specific mode
        break;
      case 'adhdMode':
        this.enableADHDMode();
        break;
      case 'highContrast':
        this.enableHighContrast();
        break;
      case 'darkMode':
        this.enableDarkMode();
        break;
    }

    this.activeFeatures.add(feature);
  }

  disableFeature(feature) {
    if (!this.activeFeatures.has(feature)) return;

    switch (feature) {
      case 'dyslexiaFont':
        this.disableDyslexiaFont();
        break;
      case 'textToSpeech':
        this.disableTextToSpeech();
        break;
      case 'colorblindMode':
        this.disableColorblindMode();
        break;
      case 'adhdMode':
        this.disableADHDMode();
        break;
      case 'highContrast':
        this.disableHighContrast();
        break;
      case 'darkMode':
        this.disableDarkMode();
        break;
    }

    this.activeFeatures.delete(feature);
  }

  // Dyslexia-Friendly Font Implementation
  enableDyslexiaFont() {
    const dyslexiaCSS = `
      @import url('https://fonts.googleapis.com/css2?family=OpenDyslexic:wght@400;700&display=swap');
      
      * {
        font-family: 'OpenDyslexic', 'Comic Sans MS', cursive !important;
        letter-spacing: 0.1em !important;
        line-height: 1.6 !important;
      }
      
      p, div, span, a, li, td, th, h1, h2, h3, h4, h5, h6 {
        font-family: 'OpenDyslexic', 'Comic Sans MS', cursive !important;
      }
    `;

    const styleId = window.inklusivUtils.injectCSS(dyslexiaCSS, 'inklusiv-dyslexia-font');
    this.styleIds.set('dyslexiaFont', styleId);
    
    window.inklusivUtils.showNotification('Dyslexia-friendly font enabled', 'success');
  }

  disableDyslexiaFont() {
    const styleId = this.styleIds.get('dyslexiaFont');
    if (styleId) {
      window.inklusivUtils.removeCSS(styleId);
      this.styleIds.delete('dyslexiaFont');
    }
  }

  // Text-to-Speech Implementation
  initializeTTS() {
    if (!window.speechSynthesis) return;

    // Get available voices
    this.updateVoices();
    
    // Update voices when they change
    window.speechSynthesis.onvoiceschanged = () => {
      this.updateVoices();
    };
  }

  updateVoices() {
    this.voices = window.speechSynthesis.getVoices();
    // Prefer English voices
    this.preferredVoice = this.voices.find(voice => 
      voice.lang.startsWith('en') && voice.localService
    ) || this.voices[0];
  }

  enableTextToSpeech() {
    this.ttsEnabled = true;
    window.inklusivUtils.showNotification('Text-to-Speech enabled. Hover over text to hear it read aloud.', 'success');
  }

  disableTextToSpeech() {
    this.ttsEnabled = false;
    this.stopSpeaking();
  }

  setupTTSHoverListeners() {
    let hoverTimeout;

    document.addEventListener('mouseover', (e) => {
      if (!this.ttsEnabled) return;

      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        this.speakElement(e.target);
      }, 500); // Delay to avoid reading every element on quick mouse movements
    });

    document.addEventListener('mouseout', () => {
      clearTimeout(hoverTimeout);
    });

    // Also support text selection
    document.addEventListener('mouseup', () => {
      if (!this.ttsEnabled) return;
      
      const selection = window.getSelection();
      if (selection.toString().trim()) {
        this.speakText(selection.toString());
      }
    });
  }

  speakElement(element) {
    const text = window.inklusivUtils.getElementText(element).trim();
    if (text && text.length > 3 && text.length < 500) { // Reasonable text length
      this.speakText(text);
    }
  }

  speakText(text) {
    if (!window.speechSynthesis || !text) return;

    // Stop current speech
    this.stopSpeaking();

    try {
      this.ttsUtterance = new SpeechSynthesisUtterance(text);
      this.ttsUtterance.voice = this.preferredVoice;
      this.ttsUtterance.rate = 0.9;
      this.ttsUtterance.pitch = 1;
      this.ttsUtterance.volume = 0.8;

      this.ttsUtterance.onstart = () => {
        this.isReading = true;
      };

      this.ttsUtterance.onend = () => {
        this.isReading = false;
      };

      this.ttsUtterance.onerror = (error) => {
        window.inklusivUtils.log('TTS error: ' + error.error, 'error');
        this.isReading = false;
      };

      window.speechSynthesis.speak(this.ttsUtterance);
    } catch (error) {
      window.inklusivUtils.log('TTS speak error: ' + error.message, 'error');
    }
  }

  stopSpeaking() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      this.isReading = false;
    }
  }

  // Colorblind Mode Implementation
  enableColorblindMode(mode) {
    this.disableColorblindMode(); // Remove any existing filter

    let filterCSS = '';
    
    switch (mode) {
      case 'protanopia':
        filterCSS = `
          html {
            filter: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'><defs><filter id='protanopia'><feColorMatrix values='0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0'/></filter></defs></svg>#protanopia") !important;
          }
        `;
        break;
      case 'deuteranopia':
        filterCSS = `
          html {
            filter: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'><defs><filter id='deuteranopia'><feColorMatrix values='0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0'/></filter></defs></svg>#deuteranopia") !important;
          }
        `;
        break;
      case 'tritanopia':
        filterCSS = `
          html {
            filter: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'><defs><filter id='tritanopia'><feColorMatrix values='0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0'/></filter></defs></svg>#tritanopia") !important;
          }
        `;
        break;
    }

    if (filterCSS) {
      const styleId = window.inklusivUtils.injectCSS(filterCSS, 'inklusiv-colorblind-filter');
      this.styleIds.set('colorblindMode', styleId);
      window.inklusivUtils.showNotification(`${mode} filter applied`, 'success');
    }
  }

  disableColorblindMode() {
    const styleId = this.styleIds.get('colorblindMode');
    if (styleId) {
      window.inklusivUtils.removeCSS(styleId);
      this.styleIds.delete('colorblindMode');
    }
  }

  // ADHD-Friendly Mode Implementation
  enableADHDMode() {
    const adhdCSS = `
      /* Hide distracting elements */
      [class*="ad"], [id*="ad"], [class*="banner"], [class*="popup"],
      [class*="modal"], [class*="overlay"], [class*="carousel"],
      [class*="slider"], [class*="animation"], [class*="blink"] {
        display: none !important;
      }
      
      /* Reduce motion */
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
      
      /* Focus enhancement */
      *:focus {
        outline: 3px solid #007acc !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 5px rgba(0, 122, 204, 0.3) !important;
      }
      
      /* Reduce visual clutter */
      body {
        background: #f8f9fa !important;
      }
      
      /* Chunk content with better spacing */
      p, div, section, article {
        margin-bottom: 1.5em !important;
        line-height: 1.8 !important;
      }
    `;

    const styleId = window.inklusivUtils.injectCSS(adhdCSS, 'inklusiv-adhd-mode');
    this.styleIds.set('adhdMode', styleId);
    
    window.inklusivUtils.showNotification('ADHD-friendly mode enabled', 'success');
  }

  disableADHDMode() {
    const styleId = this.styleIds.get('adhdMode');
    if (styleId) {
      window.inklusivUtils.removeCSS(styleId);
      this.styleIds.delete('adhdMode');
    }
  }

  // High Contrast Mode Implementation
  enableHighContrast() {
    const contrastCSS = `
      * {
        background: white !important;
        color: black !important;
        border-color: black !important;
      }
      
      a, a * {
        color: #0000EE !important;
        text-decoration: underline !important;
      }
      
      a:visited, a:visited * {
        color: #551A8B !important;
      }
      
      button, input, select, textarea {
        background: white !important;
        color: black !important;
        border: 2px solid black !important;
      }
      
      img {
        filter: contrast(150%) !important;
      }
    `;

    const styleId = window.inklusivUtils.injectCSS(contrastCSS, 'inklusiv-high-contrast');
    this.styleIds.set('highContrast', styleId);
    
    window.inklusivUtils.showNotification('High contrast mode enabled', 'success');
  }

  disableHighContrast() {
    const styleId = this.styleIds.get('highContrast');
    if (styleId) {
      window.inklusivUtils.removeCSS(styleId);
      this.styleIds.delete('highContrast');
    }
  }

  // Dark Mode Implementation
  enableDarkMode() {
    const darkCSS = `
      * {
        background: #1a1a1a !important;
        color: #e0e0e0 !important;
        border-color: #444 !important;
      }
      
      a, a * {
        color: #66b3ff !important;
      }
      
      a:visited, a:visited * {
        color: #b19cd9 !important;
      }
      
      button, input, select, textarea {
        background: #2d2d2d !important;
        color: #e0e0e0 !important;
        border: 1px solid #555 !important;
      }
      
      img {
        filter: brightness(0.8) !important;
      }
      
      [style*="background-color: white"], [style*="background: white"] {
        background: #1a1a1a !important;
      }
      
      [style*="color: black"] {
        color: #e0e0e0 !important;
      }
    `;

    const styleId = window.inklusivUtils.injectCSS(darkCSS, 'inklusiv-dark-mode');
    this.styleIds.set('darkMode', styleId);
    
    window.inklusivUtils.showNotification('Dark mode enabled', 'success');
  }

  disableDarkMode() {
    const styleId = this.styleIds.get('darkMode');
    if (styleId) {
      window.inklusivUtils.removeCSS(styleId);
      this.styleIds.delete('darkMode');
    }
  }

  // Public methods for widget controls
  toggleTTS() {
    if (this.isReading) {
      this.stopSpeaking();
    } else {
      this.enableTextToSpeech();
    }
  }

  setColorblindMode(mode) {
    if (mode === 'none') {
      this.disableColorblindMode();
    } else {
      this.enableColorblindMode(mode);
    }
  }
}

// Initialize accessibility features
window.inklusivAccessibility = new InklusivAccessibility();
