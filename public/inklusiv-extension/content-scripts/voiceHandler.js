// INKLUSIV Extension Voice Input Handler
// Web Speech API implementation for voice commands

class InklusivVoiceHandler {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.isEnabled = false;
    this.currentField = null;
    this.commands = new Map();
    
    this.initializeVoiceRecognition();
    this.setupCommands();
    this.setupEventListeners();
  }

  initializeVoiceRecognition() {
    // Check for Speech Recognition API support
    if (!window.inklusivUtils.isAPISupported('speechRecognition')) {
      window.inklusivUtils.log('Speech Recognition API not supported', 'warn');
      return;
    }

    try {
      // Initialize Speech Recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      // Configure recognition settings
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 1;

      // Setup event handlers
      this.recognition.onstart = () => {
        this.isListening = true;
        window.inklusivUtils.showNotification('Voice recognition started. Say "help" for commands.', 'info');
        this.updateMicrophoneStatus(true);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.updateMicrophoneStatus(false);
        
        // Restart if still enabled (for continuous listening)
        if (this.isEnabled) {
          setTimeout(() => {
            if (this.isEnabled && !this.isListening) {
              this.startListening();
            }
          }, 1000);
        }
      };

      this.recognition.onresult = (event) => {
        this.handleSpeechResult(event);
      };

      this.recognition.onerror = (event) => {
        this.handleSpeechError(event);
      };

      this.recognition.onnomatch = () => {
        window.inklusivUtils.log('No speech match found', 'warn');
      };

    } catch (error) {
      window.inklusivUtils.log('Voice recognition initialization error: ' + error.message, 'error');
    }
  }

  setupCommands() {
    // Navigation commands
    this.commands.set('scroll up', () => window.scrollBy(0, -300));
    this.commands.set('scroll down', () => window.scrollBy(0, 300));
    this.commands.set('scroll to top', () => window.scrollTo(0, 0));
    this.commands.set('scroll to bottom', () => window.scrollTo(0, document.body.scrollHeight));
    this.commands.set('go back', () => window.history.back());
    this.commands.set('go forward', () => window.history.forward());
    this.commands.set('refresh page', () => window.location.reload());

    // Focus commands
    this.commands.set('focus search', () => this.focusElement('input[type="search"], input[name*="search"], input[placeholder*="search"]'));
    this.commands.set('focus email', () => this.focusElement('input[type="email"], input[name*="email"]'));
    this.commands.set('focus password', () => this.focusElement('input[type="password"]'));
    this.commands.set('focus next field', () => this.focusNextField());
    this.commands.set('focus previous field', () => this.focusPreviousField());

    // Form commands
    this.commands.set('submit form', () => this.submitCurrentForm());
    this.commands.set('clear field', () => this.clearCurrentField());
    this.commands.set('select all', () => this.selectAllText());

    // Click commands
    this.commands.set('click submit', () => this.clickElement('input[type="submit"], button[type="submit"], button:contains("Submit")'));
    this.commands.set('click login', () => this.clickElement('button:contains("Login"), input[value*="Login"], a:contains("Login")'));
    this.commands.set('click sign up', () => this.clickElement('button:contains("Sign"), input[value*="Sign"], a:contains("Sign")'));
    this.commands.set('click next', () => this.clickElement('button:contains("Next"), a:contains("Next")'));
    this.commands.set('click previous', () => this.clickElement('button:contains("Previous"), a:contains("Previous")'));

    // Accessibility commands
    this.commands.set('toggle dark mode', () => window.inklusivAccessibility.toggleFeature('darkMode', !window.inklusivAccessibility.activeFeatures.has('darkMode')));
    this.commands.set('toggle high contrast', () => window.inklusivAccessibility.toggleFeature('highContrast', !window.inklusivAccessibility.activeFeatures.has('highContrast')));
    this.commands.set('read page', () => this.readPageContent());
    this.commands.set('stop reading', () => window.inklusivAccessibility.stopSpeaking());

    // Help command
    this.commands.set('help', () => this.showVoiceHelp());
    this.commands.set('voice help', () => this.showVoiceHelp());
  }

  setupEventListeners() {
    // Listen for settings updates
    window.inklusivUtils.onMessage('settingsUpdated', (request) => {
      const settings = request.data;
      if (settings.voiceInput !== this.isEnabled) {
        this.toggleVoiceInput(settings.voiceInput);
      }
    });

    window.inklusivUtils.onMessage('featureToggled', (request) => {
      const { feature, value } = request.data;
      if (feature === 'voiceInput') {
        this.toggleVoiceInput(value);
      }
    });

    // Track current focused field
    document.addEventListener('focusin', (e) => {
      if (this.isInputElement(e.target)) {
        this.currentField = e.target;
      }
    });

    document.addEventListener('focusout', () => {
      // Keep reference for a short time in case user wants to return
      setTimeout(() => {
        if (document.activeElement !== this.currentField) {
          this.currentField = null;
        }
      }, 1000);
    });
  }

  toggleVoiceInput(enabled) {
    this.isEnabled = enabled;
    
    if (enabled) {
      this.startListening();
    } else {
      this.stopListening();
    }
  }

  startListening() {
    if (!this.recognition || this.isListening) return;

    try {
      this.recognition.start();
    } catch (error) {
      window.inklusivUtils.log('Failed to start voice recognition: ' + error.message, 'error');
      window.inklusivUtils.showNotification('Voice recognition failed to start', 'error');
    }
  }

  stopListening() {
    if (!this.recognition || !this.isListening) return;

    try {
      this.recognition.stop();
      window.inklusivUtils.showNotification('Voice recognition stopped', 'info');
    } catch (error) {
      window.inklusivUtils.log('Failed to stop voice recognition: ' + error.message, 'error');
    }
  }

  handleSpeechResult(event) {
    let finalTranscript = '';
    let interimTranscript = '';

    // Process all results
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    // Handle final results
    if (finalTranscript) {
      this.processSpeechCommand(finalTranscript.trim().toLowerCase());
    }

    // Show interim results for text input
    if (interimTranscript && this.currentField && this.isInputElement(this.currentField)) {
      this.showInterimText(interimTranscript);
    }
  }

  processSpeechCommand(transcript) {
    window.inklusivUtils.log('Voice command: ' + transcript);

    // Check for direct commands first
    if (this.commands.has(transcript)) {
      this.commands.get(transcript)();
      return;
    }

    // Check for partial command matches
    for (const [command, action] of this.commands) {
      if (transcript.includes(command)) {
        action();
        return;
      }
    }

    // Check for text input commands
    if (transcript.startsWith('type ')) {
      const text = transcript.substring(5);
      this.typeText(text);
      return;
    }

    if (transcript.startsWith('search for ')) {
      const query = transcript.substring(11);
      this.performSearch(query);
      return;
    }

    if (transcript.startsWith('click ')) {
      const target = transcript.substring(6);
      this.clickByText(target);
      return;
    }

    // If no command matched, treat as text input if field is focused
    if (this.currentField && this.isInputElement(this.currentField)) {
      this.typeText(transcript);
    } else {
      window.inklusivUtils.showNotification(`Command not recognized: "${transcript}"`, 'warning');
    }
  }

  handleSpeechError(event) {
    let errorMessage = 'Speech recognition error';
    
    switch (event.error) {
      case 'no-speech':
        errorMessage = 'No speech detected';
        break;
      case 'audio-capture':
        errorMessage = 'Audio capture failed';
        break;
      case 'not-allowed':
        errorMessage = 'Microphone access denied';
        break;
      case 'network':
        errorMessage = 'Network error occurred';
        break;
      default:
        errorMessage = `Speech recognition error: ${event.error}`;
    }

    window.inklusivUtils.log(errorMessage, 'error');
    
    if (event.error === 'not-allowed') {
      window.inklusivUtils.showNotification('Please allow microphone access for voice input', 'error');
      this.isEnabled = false;
    }
  }

  // Helper methods
  isInputElement(element) {
    const inputTypes = ['input', 'textarea', 'select'];
    const editableTypes = ['text', 'email', 'password', 'search', 'url', 'tel'];
    
    if (inputTypes.includes(element.tagName.toLowerCase())) {
      if (element.tagName.toLowerCase() === 'input') {
        return editableTypes.includes(element.type) || !element.type;
      }
      return true;
    }
    
    return element.contentEditable === 'true';
  }

  typeText(text) {
    if (!this.currentField) {
      // Try to find an active input field
      this.currentField = document.activeElement;
      if (!this.isInputElement(this.currentField)) {
        window.inklusivUtils.showNotification('No text field selected', 'warning');
        return;
      }
    }

    try {
      if (this.currentField.contentEditable === 'true') {
        this.currentField.textContent += text;
      } else {
        this.currentField.value += text;
      }
      
      // Trigger input events
      this.currentField.dispatchEvent(new Event('input', { bubbles: true }));
      this.currentField.dispatchEvent(new Event('change', { bubbles: true }));
      
      window.inklusivUtils.showNotification(`Typed: "${text}"`, 'success');
    } catch (error) {
      window.inklusivUtils.log('Text input error: ' + error.message, 'error');
    }
  }

  showInterimText(text) {
    // Visual feedback for interim results
    const indicator = document.getElementById('inklusiv-voice-indicator') || this.createVoiceIndicator();
    indicator.textContent = `Listening: ${text}`;
    indicator.style.display = 'block';
    
    clearTimeout(this.indicatorTimeout);
    this.indicatorTimeout = setTimeout(() => {
      indicator.style.display = 'none';
    }, 2000);
  }

  createVoiceIndicator() {
    const indicator = window.inklusivUtils.createElement('div', {
      id: 'inklusiv-voice-indicator',
      className: 'inklusiv-voice-indicator'
    });

    const indicatorCSS = `
      .inklusiv-voice-indicator {
        position: fixed;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 14px;
        z-index: 2147483647;
        display: none;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
    `;

    window.inklusivUtils.injectCSS(indicatorCSS, 'inklusiv-voice-indicator-styles');
    document.body.appendChild(indicator);
    
    return indicator;
  }

  focusElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
      element.focus();
      this.currentField = element;
      window.inklusivUtils.showNotification('Field focused', 'success');
    } else {
      window.inklusivUtils.showNotification('Field not found', 'warning');
    }
  }

  focusNextField() {
    const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
    const currentIndex = inputs.indexOf(this.currentField);
    const nextField = inputs[currentIndex + 1];
    
    if (nextField) {
      nextField.focus();
      this.currentField = nextField;
      window.inklusivUtils.showNotification('Next field focused', 'success');
    }
  }

  focusPreviousField() {
    const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
    const currentIndex = inputs.indexOf(this.currentField);
    const prevField = inputs[currentIndex - 1];
    
    if (prevField) {
      prevField.focus();
      this.currentField = prevField;
      window.inklusivUtils.showNotification('Previous field focused', 'success');
    }
  }

  clickElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
      element.click();
      window.inklusivUtils.showNotification('Element clicked', 'success');
    } else {
      window.inklusivUtils.showNotification('Element not found', 'warning');
    }
  }

  clickByText(text) {
    const elements = Array.from(document.querySelectorAll('button, a, input[type="submit"], input[type="button"]'));
    const element = elements.find(el => 
      el.textContent.toLowerCase().includes(text.toLowerCase()) ||
      el.value?.toLowerCase().includes(text.toLowerCase()) ||
      el.title?.toLowerCase().includes(text.toLowerCase())
    );
    
    if (element) {
      element.click();
      window.inklusivUtils.showNotification(`Clicked: ${text}`, 'success');
    } else {
      window.inklusivUtils.showNotification(`Button not found: ${text}`, 'warning');
    }
  }

  performSearch(query) {
    const searchField = document.querySelector('input[type="search"], input[name*="search"], input[placeholder*="search"]');
    if (searchField) {
      searchField.value = query;
      searchField.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Try to submit the search
      const form = searchField.closest('form');
      if (form) {
        form.submit();
      } else {
        searchField.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      }
      
      window.inklusivUtils.showNotification(`Searching for: ${query}`, 'success');
    } else {
      window.inklusivUtils.showNotification('Search field not found', 'warning');
    }
  }

  submitCurrentForm() {
    const form = this.currentField?.closest('form') || document.querySelector('form');
    if (form) {
      form.submit();
      window.inklusivUtils.showNotification('Form submitted', 'success');
    } else {
      window.inklusivUtils.showNotification('No form found', 'warning');
    }
  }

  clearCurrentField() {
    if (this.currentField && this.isInputElement(this.currentField)) {
      if (this.currentField.contentEditable === 'true') {
        this.currentField.textContent = '';
      } else {
        this.currentField.value = '';
      }
      this.currentField.dispatchEvent(new Event('input', { bubbles: true }));
      window.inklusivUtils.showNotification('Field cleared', 'success');
    }
  }

  selectAllText() {
    if (this.currentField && this.isInputElement(this.currentField)) {
      this.currentField.select();
      window.inklusivUtils.showNotification('Text selected', 'success');
    }
  }

  readPageContent() {
    const content = document.body.textContent || document.body.innerText || '';
    const cleanContent = content.replace(/\s+/g, ' ').trim().substring(0, 1000); // Limit length
    
    if (cleanContent) {
      window.inklusivAccessibility.speakText(cleanContent);
    }
  }

  showVoiceHelp() {
    const helpText = `
      Voice Commands Available:
      
      Navigation: "scroll up", "scroll down", "go back", "refresh page"
      
      Focus: "focus search", "focus email", "focus next field"
      
      Text Input: "type [your text]", "clear field", "select all"
      
      Actions: "click submit", "click login", "submit form"
      
      Search: "search for [query]"
      
      Accessibility: "toggle dark mode", "read page", "stop reading"
      
      Say "help" anytime for this list.
    `;
    
    window.inklusivUtils.showNotification(helpText, 'info', 8000);
    window.inklusivAccessibility.speakText('Voice commands help displayed. Check the notification for available commands.');
  }

  updateMicrophoneStatus(isActive) {
    // Update widget microphone indicator if it exists
    const micButton = document.querySelector('.inklusiv-widget-mic');
    if (micButton) {
      micButton.classList.toggle('active', isActive);
    }
  }
}

// Initialize voice handler
window.inklusivVoiceHandler = new InklusivVoiceHandler();
