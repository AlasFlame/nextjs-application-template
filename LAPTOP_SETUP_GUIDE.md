# INKLUSIV Extension - Complete Laptop Setup Guide

## ❌ Common Error Fix

**Error you encountered:**
```
npm error code ENOENT
npm error path C:\Users\linya\package.json
npm error errno -4058
```

**Solution:** You need to navigate to the project directory first!

---

## 📋 Step-by-Step Setup Instructions

### Step 1: Download/Clone the Project
```bash
# Option A: If you have Git installed
git clone [repository-url]
cd inklusiv-extension-project

# Option B: If you downloaded as ZIP
# Extract the ZIP file to a folder like C:\Users\linya\inklusiv-extension-project
```

### Step 2: Navigate to Project Directory
```bash
# Windows Command Prompt
cd C:\Users\linya\inklusiv-extension-project

# Or if using PowerShell
Set-Location "C:\Users\linya\inklusiv-extension-project"

# Verify you're in the right directory (should show package.json)
dir
# or
ls
```

### Step 3: Install Dependencies
```bash
# Now run npm install (make sure you see package.json in current directory)
npm install
```

### Step 4: Start the Demo Server
```bash
# Start the Next.js development server
npm run dev
```
**Expected output:**
```
> my-app@0.1.0 dev
> PORT=8000 next dev --turbopack
✓ Ready in 1674ms
- Local: http://localhost:8000
```

### Step 5: Install Chrome Extension

1. **Open Chrome** and go to `chrome://extensions/`

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Navigate to your project folder
   - Select the `inklusiv-extension` folder (NOT the root project folder)
   - Click "Select Folder"

4. **Verify Installation**
   - You should see "INKLUSIV" in your extensions list
   - The extension should be enabled

### Step 6: Test the Extension

1. **Visit any website** (e.g., google.com)
2. **Look for the floating widget** - a blue circle with "I" (usually bottom-right corner)
3. **Click the widget** to expand accessibility controls
4. **Test features:**
   - Enable "Voice Input" and try saying "help"
   - Enable "Text-to-Speech" and hover over text
   - Try other accessibility features

### Step 7: Test the Demo Page

1. **Open your browser** and go to `http://localhost:8000`
2. **Click "Try Live Demo"** or go directly to `http://localhost:8000/demo/index.html`
3. **Follow the on-page instructions** to test all features

---

## 🔧 Troubleshooting

### Issue: "npm install" fails
**Solution:** Make sure you're in the correct directory
```bash
# Check if package.json exists in current directory
ls package.json
# or on Windows
dir package.json

# If not found, navigate to the project directory
cd path/to/your/inklusiv-extension-project
```

### Issue: Extension not loading
**Solutions:**
- Make sure you selected the `inklusiv-extension` folder, not the root project folder
- Try refreshing the extension: go to `chrome://extensions/` and click the refresh icon
- Check that Developer mode is enabled

### Issue: Widget not appearing
**Solutions:**
- Refresh the webpage
- Check if the extension is enabled in `chrome://extensions/`
- Try a different website (some sites may block extensions)

### Issue: Voice input not working
**Solutions:**
- Allow microphone access when prompted
- Make sure you're on HTTPS or localhost (required for microphone access)
- Try saying "help" to see available commands

### Issue: Gesture input not working
**Solutions:**
- Allow camera access when prompted
- Ensure good lighting for hand detection
- Try different hand positions and gestures

---

## 📁 Project Structure

Your project folder should contain:
```
inklusiv-extension-project/
├── package.json                 ← This file must exist for npm install
├── package-lock.json
├── next.config.ts
├── tsconfig.json
├── inklusiv-extension/          ← Select this folder in Chrome
│   ├── manifest.json
│   ├── background.js
│   ├── content-scripts/
│   ├── popup/
│   └── demo/
├── src/
│   └── app/
├── public/
└── README.md
```

---

## 🎯 Quick Verification Checklist

- [ ] I'm in the correct project directory (can see package.json)
- [ ] `npm install` completed successfully
- [ ] `npm run dev` is running (shows localhost:8000)
- [ ] Chrome extension is loaded from `inklusiv-extension` folder
- [ ] Extension appears in chrome://extensions/ list
- [ ] Floating widget appears on websites
- [ ] Demo page loads at localhost:8000

---

## 🆘 Still Having Issues?

1. **Check Node.js version:** `node --version` (should be 18+)
2. **Check npm version:** `npm --version`
3. **Clear npm cache:** `npm cache clean --force`
4. **Try different browser:** Test in Chrome Incognito mode
5. **Check browser console:** Press F12 and look for errors

---

**Need more help?** Check the `README.md` and `INSTALLATION.md` files in the project folder for additional details.
