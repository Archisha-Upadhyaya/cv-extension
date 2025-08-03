# 🤖 AI Cover Letter Generator - Chrome Extension

**Generate personalized cover letters instantly using AI and your resume data!**

## ✨ Features
- 📄 **Resume parsing** - Upload PDF/DOCX/TXT resumes for automatic data extraction
- 📝 **Select text** from any job posting webpage
- 🤖 **AI-powered** personalized cover letter generation using Google Gemini
-  **Smart data storage** - Resume and selections saved in browser
- 📋 **One-click copy** to clipboard
- ⚙️ **Easy setup** - just add your free API key and upload resume
- 🆓 **Completely free** to use (with free Gemini API)
- 🔒 **Privacy-first** - All data stays on your device

## 🚀 Quick Start (3 minutes)

### 1. Download & Install
1. **Download** this extension folder
2. Open Chrome and go to `chrome://extensions/`
3. Enable **"Developer mode"** (top right toggle)
4. Click **"Load unpacked"** and select the `dist` folder
5. Pin the extension to your toolbar

### 2. Get Free API Key
1. Visit: **https://aistudio.google.com/app/apikey**
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key (starts with `AIza...`)

### 3. Configure Extension
1. Click the extension icon
2. Click the **⚙️ Settings** button
3. Paste your API key
4. Click **"Save API Key"**

### 4. Upload Your Resume
1. Click the **📄 Resume** button
2. Upload your resume (PDF, DOCX, or TXT)
3. Review and edit the extracted information
4. Click **"Save Resume Data"**

### 5. Start Using!
1. Visit any job posting website
2. Click the extension icon
3. Click **"Select Text from Page"**
4. Select the job description text
5. Click **"Generate Cover Letter"**
6. Copy and customize your highly personalized cover letter!

## 💡 How It Works
- **Resume Parsing** - AI extracts your info from PDF/DOCX/TXT files
- **Smart Matching** - Automatically matches your skills to job requirements
- **No servers** - everything runs in your browser
- **No data sent** to third parties (only to Google Gemini API)
- **Privacy-first** - all your data stays on your device
- **Easy Updates** - Edit your resume data anytime with the 📄 button

## 📄 Resume Features
- **Auto-parsing** of PDF, DOCX, and TXT files
- **AI enhancement** for better data extraction
- **Manual editing** for complete control
- **Secure storage** in your browser only
- **Easy updates** - re-upload or edit anytime
- **Fallback support** - manual entry if parsing fails

## 🔧 Building from Source
```bash
# Install dependencies
pnpm install

# Build extension (optimized for size)
pnpm run build

# Load the 'dist' folder in Chrome
```

## 📊 Bundle Size (Optimized)
- **Main popup**: 217 kB (down from 746 kB)
- **Resume parser**: 501 kB (lazy loaded only when uploading)
- **AI client**: 28 kB (lazy loaded only when generating)
- **Total initial load**: ~220 kB (fast popup opening)

## 🐛 Troubleshooting
- Check `TROUBLESHOOTING.md` for common issues
- Open DevTools on popup for error details
- Verify extension permissions are granted
- Ensure API key is valid and saved

## 🔒 Privacy & Security
- **Local storage only** - No data sent to servers
- **Resume files** never leave your device
- **API calls** only to Google Gemini (your choice)
- **Open source** - Full transparency

## 🆓 Free Usage Limits
- **Gemini API**: 15 requests/minute, 1M tokens/day
- **Perfect for personal use** - hundreds of cover letters per day

## 🛠️ Troubleshooting
- **"Set your API key"**: Click settings ⚙️ and add your Gemini API key
- **"Cannot select text"**: Try refreshing the webpage first
- **"API quota exceeded"**: Wait a minute and try again (free tier limits)

## 🎯 Perfect For
- Job seekers applying to multiple positions
- Career changers needing tailored applications  
- Students applying for internships
- Anyone who wants professional, personalized cover letters

**Stop writing generic cover letters - let AI create personalized ones in seconds!** 🚀
