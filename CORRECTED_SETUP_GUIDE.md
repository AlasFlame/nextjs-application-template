# INKLUSIV Extension - Complete Laptop Setup Guide

## ❌ Common Error Fix

**Error you encountered:**
```
npm error code ENOENT
npm error path C:\Users\linya\package.json
npm error errno -4058
```

**Solution:** You're trying to run npm install in the wrong place! The Chrome extension itself doesn't need npm install.

---

## 🚨 IMPORTANT CLARIFICATION

**The Chrome extension (`inklusiv-extension` folder) works WITHOUT npm install!**

- ✅ **Chrome Extension**: No npm install needed - works directly
- ⚠️ **Demo Website**: Only needs npm install if you want to run the showcase website

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

### Step 2: Install Chrome Extension (MAIN STEP!)

**This is all you need for the extension to work:**

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

**🎉 That's it! The extension is now ready to use.**

### Step 3: Test the Extension

1. **Visit any website** (e.g., google.com)
2. **Look for the floating widget** - a blue circle with "I" (usually bottom-right corner)
3. **Click the widget** to expand accessibility controls
4. **Test features:**
   - Enable "Voice Input" and try saying "help"
   - Enable "Text-to-Speech" and hover over text
   - Try other accessibility features

---

## 🌐 Optional: Run Demo Website

**Only do this if you want to see the showcase website:**

### Step 4: Navigate to Project Directory (Optional)
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

### Step 5: Install Dependencies (Optional)
```bash
# Only needed for the demo website, NOT the extension
npm install
```

### Step 6: Start the Demo Server (Optional)
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

### Step 7: Test the Demo Page (Optional)

1. **Open your browser** and go to `http://localhost:8000`
2. **Click "Try Live Demo"** or go directly to `http://localhost:8000/demo/index.html`
3. **Follow the on-page instructions** to test all features

---

## 🔧 Troubleshooting

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

### Issue: "npm install" fails (For Demo Website Only)
**Solution:** Make sure you're in the correct directory
```bash
# Check if package.json exists in current directory
ls package.json
# or on Windows
dir package.json

# If not found, navigate to the project directory
cd path/to/your/inklusiv-extension-project
```

---

## 📁 Project Structure

Your project folder should contain:
```
inklusiv-extension-project/
├── package.json                 ← Only needed for demo website
├── package-lock.json
├── next.config.ts
├── tsconfig.json
├── inklusiv-extension/          ← SELECT THIS FOLDER IN CHROME
│   ├── manifest.json           ← Extension works with just these files
│   ├── background.js
│   ├── content-scripts/
│   ├── popup/
│   └── demo/
├── src/                        ← Only for demo website
│   └── app/
├── public/                     ← Only for demo website
└── README.md
```

---

## 🎯 Quick Verification Checklist

**For Chrome Extension (Essential):**
- [ ] Chrome extension is loaded from `inklusiv-extension` folder
- [ ] Extension appears in chrome://extensions/ list
- [ ] Floating widget appears on websites

**For Demo Website (Optional):**
- [ ] I'm in the correct project directory (can see package.json)
- [ ] `npm install` completed successfully
- [ ] `npm run dev` is running (shows localhost:8000)
- [ ] Demo page loads at localhost:8000

---

## 🆘 Still Having Issues?

1. **Check Chrome version:** Make sure you're using Chrome 88+ for Manifest V3 support
2. **Try different website:** Some sites may block extensions
3. **Check browser console:** Press F12 and look for errors
4. **Restart Chrome:** Sometimes helps with extension loading

---

## 📝 Summary

**To use the INKLUSIV extension:**
1. Load the `inklusiv-extension` folder in Chrome (no npm install needed)
2. The floating widget will appear on websites
3. Click the widget to access accessibility features

**To see the demo website (optional):**
1. Run `npm install` and `npm run dev` in the project root
2. Visit `http://localhost:8000`

**Need more help?** Check the `README.md` and `INSTALLATION.md` files in the project folder for additional details.
