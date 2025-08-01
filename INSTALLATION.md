# INKLUSIV Extension - Installation Guide

## 📦 Complete Project Files

The INKLUSIV Chrome extension consists of the following key files:

### Chrome Extension Files (`inklusiv-extension/` folder)
```
inklusiv-extension/
├── manifest.json                 # Extension configuration
├── background.js                 # Service worker
├── content-scripts/
│   ├── utilities.js             # Helper functions
│   ├── accessibility.js         # Accessibility features
│   ├── voiceHandler.js          # Voice input system
│   ├── gestureHandler.js        # Gesture recognition
│   └── widget.js                # Floating UI widget
├── popup/
│   ├── popup.html               # Settings dashboard
│   ├── popup.css                # Dashboard styling
│   └── popup.js                 # Dashboard functionality
└── demo/
    └── index.html               # Demo page
```

### Next.js Demo Website (Optional)
```
src/
├── app/
│   ├── layout.tsx               # App layout
│   ├── page.tsx                 # Homepage
│   └── globals.css              # Global styles
└── components/ui/               # UI components (shadcn/ui)
```

## 🚀 Installation Methods

### Method 1: Install Chrome Extension Only

1. **Download the Extension Folder**
   - Copy the entire `inklusiv-extension/` folder to your computer
   - Or clone this repository: `git clone [repository-url]`

2. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the `inklusiv-extension` folder
   - The extension will appear in your extensions list

3. **Start Using**
   - Visit any webpage
   - Look for the floating "I" widget (usually bottom-right)
   - Click to expand and access all accessibility features

### Method 2: Full Development Setup

1. **Clone Repository**
   ```bash
   git clone [repository-url]
   cd inklusiv-extension-project
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Demo Server**
   ```bash
   npm run dev
   ```

4. **Load Extension**
   - Follow steps from Method 1 to load the extension
   - Visit `http://localhost:8000` for the demo website
   - Visit `http://localhost:8000/demo/index.html` for interactive testing

## 🧪 Testing the Extension

### Quick Test Checklist

1. **Widget Visibility**
   - [ ] Floating widget appears on web pages
   - [ ] Widget is draggable
   - [ ] Widget expands when clicked

2. **Voice Input**
   - [ ] Enable voice input in widget
   - [ ] Try command: "focus search" (if search field exists)
   - [ ] Try command: "type hello world"
   - [ ] Try command: "scroll down"

3. **Gesture Control**
   - [ ] Enable gesture input in widget
   - [ ] Allow camera access when prompted
   - [ ] Try pointing gesture to scroll
   - [ ] Try peace sign to scroll up

4. **Accessibility Features**
   - [ ] Toggle dyslexia font
   - [ ] Enable text-to-speech and hover over text
   - [ ] Try high contrast mode
   - [ ] Test dark mode
   - [ ] Enable ADHD-friendly mode

### Demo Page Testing

1. **Visit Demo Page**
   - Go to `http://localhost:8000/demo/index.html`
   - Or use the demo page in the extension folder

2. **Test Voice Commands**
   - Enable voice input
   - Try: "focus email", "type test message", "click submit"

3. **Test Accessibility Features**
   - Enable different visual modes
   - Hover over text with TTS enabled
   - Try colorblind filters on images

## 🔧 Troubleshooting

### Common Issues

**Extension not loading:**
- Ensure you selected the correct `inklusiv-extension` folder
- Check that `manifest.json` is in the root of the selected folder
- Try refreshing the extension in `chrome://extensions/`

**Voice input not working:**
- Check microphone permissions in Chrome
- Ensure you're on HTTPS or localhost (required for microphone access)
- Try saying "help" to see available commands

**Gesture input not working:**
- Allow camera access when prompted
- Ensure good lighting for hand detection
- Try different hand positions and gestures

**Widget not appearing:**
- Check if the page has strict Content Security Policy
- Try refreshing the page
- Check browser console for errors

### Browser Console Debugging

1. **Open Developer Tools** (F12)
2. **Check Console Tab** for error messages
3. **Look for INKLUSIV logs** (prefixed with "INKLUSIV:")

## 📱 Browser Compatibility

### Supported Browsers
- ✅ **Chrome 88+** (Full support)
- ✅ **Microsoft Edge 88+** (Chromium-based)
- ✅ **Brave Browser** (Chromium-based)
- ✅ **Opera** (Chromium-based)

### Feature Compatibility
- **Voice Input**: Requires Web Speech API support
- **Gesture Recognition**: Requires camera access and WebGL
- **Text-to-Speech**: Requires Speech Synthesis API
- **All Visual Features**: Work on all supported browsers

## 🔒 Permissions Explained

### Required Permissions

1. **Storage** (`"storage"`)
   - **Purpose**: Save your accessibility preferences
   - **Data**: Only your settings (font preferences, enabled features, etc.)

2. **Active Tab** (`"activeTab"`)
   - **Purpose**: Inject accessibility features into web pages
   - **Access**: Only when you interact with the extension

3. **Scripting** (`"scripting"`)
   - **Purpose**: Add the floating widget and accessibility features
   - **Scope**: All websites you visit

### Optional Permissions (Requested when needed)

4. **Microphone**
   - **Purpose**: Voice input and commands
   - **When**: Only when you enable voice input feature
   - **Privacy**: All processing happens locally, no data sent anywhere

5. **Camera**
   - **Purpose**: Hand gesture recognition
   - **When**: Only when you enable gesture input feature
   - **Privacy**: All processing happens locally, no video data stored or sent

## 📋 System Requirements

### Minimum Requirements
- **Browser**: Chrome 88+ or Chromium-based browser
- **OS**: Windows 10+, macOS 10.15+, or Linux
- **RAM**: 4GB (extension uses minimal memory)
- **Storage**: 50MB for extension files

### Recommended for Best Experience
- **Microphone**: For voice input features
- **Camera**: For gesture recognition
- **Good lighting**: For optimal gesture detection
- **Stable internet**: For loading MediaPipe libraries

## 🆘 Getting Help

### Support Resources

1. **Documentation**: Check README.md for detailed feature explanations
2. **Demo Page**: Use the interactive demo to test all features
3. **Browser Console**: Check for error messages and logs
4. **GitHub Issues**: Report bugs or request features

### Contact Information

- **GitHub**: [Repository URL]
- **Issues**: [Repository URL]/issues
- **Email**: support@inklusiv-extension.com

---

**Ready to make the web more accessible? Install INKLUSIV and start exploring! 🌟**
