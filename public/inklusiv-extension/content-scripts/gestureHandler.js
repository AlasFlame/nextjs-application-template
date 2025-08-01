// INKLUSIV Extension Gesture Input Handler
// MediaPipe hand tracking implementation for gesture controls

class InklusivGestureHandler {
  constructor() {
    this.isEnabled = false;
    this.isInitialized = false;
    this.camera = null;
    this.hands = null;
    this.videoElement = null;
    this.canvasElement = null;
    this.canvasCtx = null;
    this.gestureHistory = [];
    this.lastGestureTime = 0;
    this.gestureThreshold = 500; // Minimum time between gestures (ms)
    
    this.setupEventListeners();
    this.loadMediaPipe();
  }

  setupEventListeners() {
    // Listen for settings updates
    window.inklusivUtils.onMessage('settingsUpdated', (request) => {
      const settings = request.data;
      if (settings.gestureInput !== this.isEnabled) {
        this.toggleGestureInput(settings.gestureInput);
      }
    });

    window.inklusivUtils.onMessage('featureToggled', (request) => {
      const { feature, value } = request.data;
      if (feature === 'gestureInput') {
        this.toggleGestureInput(value);
      }
    });
  }

  async loadMediaPipe() {
    try {
      // Check if WebGL is supported (required for MediaPipe)
      if (!window.inklusivUtils.isAPISupported('webGL')) {
        window.inklusivUtils.log('WebGL not supported - gesture input unavailable', 'warn');
        return;
      }

      // Load MediaPipe from CDN
      await this.loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
      await this.loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js');
      await this.loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js');
      await this.loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');

      this.initializeMediaPipe();
    } catch (error) {
      window.inklusivUtils.log('MediaPipe loading error: ' + error.message, 'error');
      window.inklusivUtils.showNotification('Gesture input unavailable - MediaPipe failed to load', 'warning');
    }
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  initializeMediaPipe() {
    try {
      if (!window.Hands) {
        throw new Error('MediaPipe Hands not available');
      }

      // Initialize MediaPipe Hands
      this.hands = new window.Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });

      this.hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.hands.onResults(this.onResults.bind(this));

      this.isInitialized = true;
      window.inklusivUtils.log('MediaPipe initialized successfully');
    } catch (error) {
      window.inklusivUtils.log('MediaPipe initialization error: ' + error.message, 'error');
    }
  }

  async toggleGestureInput(enabled) {
    this.isEnabled = enabled;

    if (enabled) {
      await this.startGestureTracking();
    } else {
      this.stopGestureTracking();
    }
  }

  async startGestureTracking() {
    if (!this.isInitialized) {
      window.inklusivUtils.showNotification('Gesture tracking not available', 'error');
      return;
    }

    try {
      // Request camera permission
      if (!window.inklusivUtils.isAPISupported('mediaDevices')) {
        throw new Error('Camera access not supported');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: 'user'
        }
      });

      // Create video element for camera feed
      this.createVideoElements();
      this.videoElement.srcObject = stream;

      // Initialize camera with MediaPipe
      this.camera = new window.Camera(this.videoElement, {
        onFrame: async () => {
          if (this.hands) {
            await this.hands.send({ image: this.videoElement });
          }
        },
        width: 640,
        height: 480
      });

      await this.camera.start();
      
      window.inklusivUtils.showNotification('Gesture tracking started', 'success');
      this.updateGestureStatus(true);

    } catch (error) {
      window.inklusivUtils.log('Gesture tracking start error: ' + error.message, 'error');
      
      if (error.name === 'NotAllowedError') {
        window.inklusivUtils.showNotification('Camera access denied. Please allow camera access for gesture input.', 'error');
      } else {
        window.inklusivUtils.showNotification('Failed to start gesture tracking', 'error');
      }
      
      this.isEnabled = false;
    }
  }

  stopGestureTracking() {
    try {
      if (this.camera) {
        this.camera.stop();
        this.camera = null;
      }

      if (this.videoElement && this.videoElement.srcObject) {
        const tracks = this.videoElement.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        this.videoElement.srcObject = null;
      }

      this.removeVideoElements();
      this.updateGestureStatus(false);
      
      window.inklusivUtils.showNotification('Gesture tracking stopped', 'info');
    } catch (error) {
      window.inklusivUtils.log('Gesture tracking stop error: ' + error.message, 'error');
    }
  }

  createVideoElements() {
    // Create hidden video element for camera feed
    this.videoElement = window.inklusivUtils.createElement('video', {
      id: 'inklusiv-gesture-video',
      style: 'display: none;',
      autoplay: true,
      muted: true,
      playsinline: true
    });

    // Create canvas for hand tracking visualization (optional)
    this.canvasElement = window.inklusivUtils.createElement('canvas', {
      id: 'inklusiv-gesture-canvas',
      width: '640',
      height: '480',
      style: `
        position: fixed;
        top: 10px;
        right: 10px;
        width: 160px;
        height: 120px;
        border: 2px solid #007acc;
        border-radius: 8px;
        z-index: 2147483646;
        background: black;
        display: none;
      `
    });

    this.canvasCtx = this.canvasElement.getContext('2d');

    document.body.appendChild(this.videoElement);
    document.body.appendChild(this.canvasElement);

    // Toggle canvas visibility with double-click
    this.canvasElement.addEventListener('dblclick', () => {
      const isVisible = this.canvasElement.style.display !== 'none';
      this.canvasElement.style.display = isVisible ? 'none' : 'block';
    });
  }

  removeVideoElements() {
    if (this.videoElement) {
      this.videoElement.remove();
      this.videoElement = null;
    }

    if (this.canvasElement) {
      this.canvasElement.remove();
      this.canvasElement = null;
      this.canvasCtx = null;
    }
  }

  onResults(results) {
    if (!this.isEnabled) return;

    try {
      // Clear canvas
      if (this.canvasCtx) {
        this.canvasCtx.save();
        this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        this.canvasCtx.drawImage(results.image, 0, 0, this.canvasElement.width, this.canvasElement.height);
      }

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        for (let i = 0; i < results.multiHandLandmarks.length; i++) {
          const landmarks = results.multiHandLandmarks[i];
          const handedness = results.multiHandedness[i];
          
          // Draw hand landmarks on canvas
          if (this.canvasCtx) {
            this.drawHandLandmarks(landmarks);
          }

          // Detect gestures
          this.detectGestures(landmarks, handedness);
        }
      }

      if (this.canvasCtx) {
        this.canvasCtx.restore();
      }
    } catch (error) {
      window.inklusivUtils.log('Gesture processing error: ' + error.message, 'error');
    }
  }

  drawHandLandmarks(landmarks) {
    if (!this.canvasCtx) return;

    // Draw connections
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // Index finger
      [0, 9], [9, 10], [10, 11], [11, 12], // Middle finger
      [0, 13], [13, 14], [14, 15], [15, 16], // Ring finger
      [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
      [5, 9], [9, 13], [13, 17] // Palm
    ];

    this.canvasCtx.strokeStyle = '#00ff00';
    this.canvasCtx.lineWidth = 2;

    connections.forEach(([start, end]) => {
      const startPoint = landmarks[start];
      const endPoint = landmarks[end];
      
      this.canvasCtx.beginPath();
      this.canvasCtx.moveTo(startPoint.x * this.canvasElement.width, startPoint.y * this.canvasElement.height);
      this.canvasCtx.lineTo(endPoint.x * this.canvasElement.width, endPoint.y * this.canvasElement.height);
      this.canvasCtx.stroke();
    });

    // Draw landmarks
    this.canvasCtx.fillStyle = '#ff0000';
    landmarks.forEach(landmark => {
      this.canvasCtx.beginPath();
      this.canvasCtx.arc(
        landmark.x * this.canvasElement.width,
        landmark.y * this.canvasElement.height,
        3, 0, 2 * Math.PI
      );
      this.canvasCtx.fill();
    });
  }

  detectGestures(landmarks, handedness) {
    const now = Date.now();
    if (now - this.lastGestureTime < this.gestureThreshold) {
      return; // Prevent gesture spam
    }

    const gesture = this.classifyGesture(landmarks);
    if (gesture && gesture !== 'unknown') {
      this.executeGesture(gesture, handedness);
      this.lastGestureTime = now;
    }
  }

  classifyGesture(landmarks) {
    try {
      // Get finger tip and pip positions
      const fingerTips = [4, 8, 12, 16, 20]; // Thumb, Index, Middle, Ring, Pinky tips
      const fingerPips = [3, 6, 10, 14, 18]; // Corresponding PIP joints

      // Check which fingers are extended
      const fingersUp = [];
      
      // Thumb (special case - check x coordinate)
      if (landmarks[4].x > landmarks[3].x) {
        fingersUp.push(1);
      } else {
        fingersUp.push(0);
      }

      // Other fingers (check y coordinate)
      for (let i = 1; i < 5; i++) {
        if (landmarks[fingerTips[i]].y < landmarks[fingerPips[i]].y) {
          fingersUp.push(1);
        } else {
          fingersUp.push(0);
        }
      }

      // Classify gestures based on finger positions
      const fingerCount = fingersUp.reduce((a, b) => a + b, 0);

      // Pointing gesture (index finger only)
      if (fingersUp[1] === 1 && fingerCount === 1) {
        return 'point';
      }

      // Peace sign (index and middle finger)
      if (fingersUp[1] === 1 && fingersUp[2] === 1 && fingerCount === 2) {
        return 'peace';
      }

      // OK sign (thumb and index finger touching)
      if (this.isOKGesture(landmarks)) {
        return 'ok';
      }

      // Fist (no fingers up)
      if (fingerCount === 0) {
        return 'fist';
      }

      // Open hand (all fingers up)
      if (fingerCount === 5) {
        return 'open';
      }

      // Thumbs up
      if (fingersUp[0] === 1 && fingerCount === 1) {
        return 'thumbsup';
      }

      return 'unknown';
    } catch (error) {
      window.inklusivUtils.log('Gesture classification error: ' + error.message, 'error');
      return 'unknown';
    }
  }

  isOKGesture(landmarks) {
    try {
      // Check if thumb tip and index finger tip are close
      const thumbTip = landmarks[4];
      const indexTip = landmarks[8];
      
      const distance = Math.sqrt(
        Math.pow(thumbTip.x - indexTip.x, 2) + 
        Math.pow(thumbTip.y - indexTip.y, 2)
      );
      
      return distance < 0.05; // Threshold for "touching"
    } catch (error) {
      return false;
    }
  }

  executeGesture(gesture, handedness) {
    const hand = handedness.label.toLowerCase(); // 'left' or 'right'
    
    window.inklusivUtils.log(`Gesture detected: ${gesture} (${hand} hand)`);

    try {
      switch (gesture) {
        case 'point':
          this.handlePointGesture();
          break;
        case 'peace':
          this.handlePeaceGesture();
          break;
        case 'ok':
          this.handleOKGesture();
          break;
        case 'fist':
          this.handleFistGesture();
          break;
        case 'open':
          this.handleOpenHandGesture();
          break;
        case 'thumbsup':
          this.handleThumbsUpGesture();
          break;
      }

      // Show visual feedback
      this.showGestureFeedback(gesture);
    } catch (error) {
      window.inklusivUtils.log('Gesture execution error: ' + error.message, 'error');
    }
  }

  handlePointGesture() {
    // Scroll down
    window.scrollBy(0, 200);
  }

  handlePeaceGesture() {
    // Scroll up
    window.scrollBy(0, -200);
  }

  handleOKGesture() {
    // Click the currently focused element or first button
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'BUTTON' || activeElement.tagName === 'A')) {
      activeElement.click();
    } else {
      const button = document.querySelector('button, input[type="submit"], input[type="button"]');
      if (button) {
        button.click();
      }
    }
  }

  handleFistGesture() {
    // Go back
    window.history.back();
  }

  handleOpenHandGesture() {
    // Stop/pause current action or refresh page
    if (window.inklusivAccessibility.isReading) {
      window.inklusivAccessibility.stopSpeaking();
    } else {
      window.location.reload();
    }
  }

  handleThumbsUpGesture() {
    // Toggle voice input
    const currentVoiceState = window.inklusivVoiceHandler.isEnabled;
    window.inklusivUtils.toggleFeature('voiceInput', !currentVoiceState);
  }

  showGestureFeedback(gesture) {
    const gestureNames = {
      point: 'Point (Scroll Down)',
      peace: 'Peace (Scroll Up)',
      ok: 'OK (Click)',
      fist: 'Fist (Go Back)',
      open: 'Open Hand (Stop/Refresh)',
      thumbsup: 'Thumbs Up (Toggle Voice)'
    };

    const gestureName = gestureNames[gesture] || gesture;
    window.inklusivUtils.showNotification(`Gesture: ${gestureName}`, 'info', 1500);
  }

  updateGestureStatus(isActive) {
    // Update widget gesture indicator if it exists
    const gestureButton = document.querySelector('.inklusiv-widget-gesture');
    if (gestureButton) {
      gestureButton.classList.toggle('active', isActive);
    }

    // Show/hide gesture canvas based on status
    if (this.canvasElement) {
      this.canvasElement.style.display = isActive ? 'block' : 'none';
    }
  }

  // Public method to show gesture help
  showGestureHelp() {
    const helpText = `
      Gesture Controls:
      
      👉 Point: Scroll down
      ✌️ Peace: Scroll up  
      👌 OK: Click button/link
      ✊ Fist: Go back
      ✋ Open Hand: Stop/Refresh
      👍 Thumbs Up: Toggle voice input
      
      Double-click the camera preview to hide/show it.
    `;
    
    window.inklusivUtils.showNotification(helpText, 'info', 6000);
  }
}

// Initialize gesture handler
window.inklusivGestureHandler = new InklusivGestureHandler();
