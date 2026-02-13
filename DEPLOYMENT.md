# GrowFund Dashboard - Deployment Guide

## Quick Deploy to Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier available at vercel.com)

### Step 1: Push to GitHub
```bash
cd Growfund-Dashboard/trading-dashboard
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)
1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name? **growfund-dashboard** (or your choice)
   - Directory? **./** (current directory)
   - Override settings? **N**

5. For production deployment:
```bash
vercel --prod
```

#### Option B: Using Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: **Create React App**
   - Root Directory: **trading-dashboard**
   - Build Command: **npm run build**
   - Output Directory: **build**
5. Click "Deploy"

### Step 3: Environment Configuration
No environment variables needed for demo mode!

### Features Included
✅ Login gate with demo bypass
✅ Auto-login functionality
✅ ExaCoin with custom icon
✅ Mobile-responsive design
✅ All investment features
✅ Settings & notifications
✅ Trade Now with live charts
✅ Referral/Earn system

### Demo Access
Users can:
- Click "Continue as Demo User" for instant access
- Or use the login page for full authentication

### Build Command
```bash
npm run build
```

### Local Testing
```bash
npm start
```

### Troubleshooting
- **Build fails**: Run `npm install` first
- **Port in use**: Kill process on port 3000 or use different port
- **Module not found**: Delete node_modules and package-lock.json, then `npm install`

### Post-Deployment
Your app will be live at: `https://your-project-name.vercel.app`

Share the link and users can access with demo mode instantly!
