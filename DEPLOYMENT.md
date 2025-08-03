# 🚀 Deploy Your Cover Letter API to Vercel (Free)

This guide will help you deploy your API to Vercel so users can use your extension without running a local server.

## 📋 Prerequisites
- GitHub account
- Vercel account (free at https://vercel.com)
- Your Gemini API key

## 🎯 Quick Deployment (10 minutes)

### 1. **Push to GitHub**
```bash
# Initialize git repository (if not already done)
git init
git add .
git commit -m "Initial commit: Cover letter extension with Gemini API"

# Create GitHub repository and push
# (Create repo at https://github.com/new)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 2. **Deploy to Vercel**
1. Visit https://vercel.com and sign in with GitHub
2. Click **"New Project"**
3. Import your GitHub repository
4. **Framework Preset**: Select "Other"
5. **Root Directory**: Leave as `.` (root)
6. Click **"Deploy"**

### 3. **Add Environment Variables**
After deployment:
1. Go to your project dashboard on Vercel
2. Click **"Settings"** → **"Environment Variables"**
3. Add these variables:
   ```
   GEMINI_API_KEY = AIzaSyAzeloHWpylZ_TQfSJ7X-iNcTf_566kNsA
   GEMINI_MODEL = gemini-1.5-flash
   NODE_ENV = production
   ```
4. Click **"Save"**
5. Go to **"Deployments"** and redeploy

### 4. **Update Extension Configuration**
1. Copy your Vercel URL (e.g., `https://your-project.vercel.app`)
2. Update the extension to use this URL instead of localhost

### 5. **Test Your API**
Visit: `https://your-project.vercel.app/api/health`
Should return: `{"status":"healthy",...}`

## 🔧 Alternative: Railway (Another Free Option)

### Railway Deployment
1. Visit https://railway.app
2. Connect GitHub repository
3. Add environment variables
4. Deploy automatically

## 🌟 Benefits
- ✅ **Free hosting** (Vercel: 100GB bandwidth/month)
- ✅ **Global CDN** - Fast worldwide
- ✅ **Auto-scaling** - Handles traffic spikes
- ✅ **HTTPS** - Secure by default
- ✅ **No server maintenance** required
- ✅ **Users don't need localhost**

## 🔧 Updating Your Extension
After deployment, update your extension configuration:

```javascript
// In extension/src/popup/App.tsx
const API_BASE_URL = 'https://your-project.vercel.app/api'
```

Then rebuild: `pnpm run build`

## 📊 Usage Limits (Free Tiers)
- **Vercel**: 100GB bandwidth, 100GB-hours compute/month
- **Gemini**: 15 requests/minute, 1M tokens/day
- **Perfect for personal extensions!**

## 🆘 Troubleshooting
- **API not working?** Check environment variables in Vercel dashboard
- **CORS errors?** Make sure the vercel-handler.js includes CORS headers
- **Timeout errors?** Vercel functions timeout after 10s on free tier
