# 🚀 GitHub Pages Deployment Guide - SERA AI

This guide will walk you through deploying your SERA AI application to GitHub Pages step-by-step.

## 📋 Prerequisites

- [x] Git installed on your computer
- [x] GitHub account created
- [x] Project built successfully locally (`npm run build` works)

---

## 🎯 Deployment Methods

You have **TWO OPTIONS**:
1. **Manual Deployment** (Quick & Simple)
2. **Automatic Deployment** (Professional CI/CD with GitHub Actions)

---

## ✨ Option 1: Manual Deployment (Recommended for First Time)

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Fill in repository details:
   - **Repository name**: `sera-ai` (or your preferred name)
   - **Description**: "Privacy-first genetics health platform with AI insights"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README (we already have files)
3. Click **"Create repository"**

### Step 2: Initialize Git (If Not Already Done)

Open PowerShell in your project folder and run:

```powershell
cd "E:\innovation project"
git init
git add .
git commit -m "Initial commit: SERA AI v1.0.0"
```

### Step 3: Connect to GitHub Repository

Replace `YOUR-USERNAME` and `YOUR-REPO-NAME` with your actual GitHub username and repository name:

```powershell
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git branch -M main
git push -u origin main
```

**Example:**
```powershell
git remote add origin https://github.com/johndoe/sera-ai.git
git branch -M main
git push -u origin main
```

### Step 4: Build the Project

```powershell
npm run build
```

This creates a `dist/` folder with your production-ready static files.

### Step 5: Deploy to GitHub Pages

```powershell
npm run deploy
```

This command:
- Builds your project
- Pushes the `dist/` folder to a `gh-pages` branch
- Takes about 1-2 minutes

**You'll see output like:**
```
Published
```

### Step 6: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll to **Pages** section (left sidebar)
4. Under **Source**, select:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
5. Click **Save**

### Step 7: Access Your Live Site

Your site will be available at:
```
https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/
```

**Example:** `https://johndoe.github.io/sera-ai/`

⏱️ **Wait Time**: First deployment takes 2-5 minutes to go live.

---

## 🤖 Option 2: Automatic Deployment with GitHub Actions

This method automatically deploys whenever you push to the main branch.

### Step 1-3: Same as Option 1

Complete Steps 1-3 from Option 1 above (create repo, initialize git, push code).

### Step 4: Enable GitHub Actions

The workflow file is already created at `.github/workflows/deploy.yml`

### Step 5: Configure Repository Permissions

1. Go to your GitHub repository
2. Click **Settings** → **Actions** → **General**
3. Scroll to **Workflow permissions**
4. Select **"Read and write permissions"**
5. Check **"Allow GitHub Actions to create and approve pull requests"**
6. Click **Save**

### Step 6: Configure GitHub Pages

1. Still in **Settings**, go to **Pages** (left sidebar)
2. Under **Source**, select:
   - **Source**: GitHub Actions (not a branch)
3. This enables the new Pages deployment method

### Step 7: Trigger First Deployment

```powershell
# Make a small change or just re-push
git commit --allow-empty -m "Trigger GitHub Actions deployment"
git push origin main
```

### Step 8: Monitor Deployment

1. Go to **Actions** tab in your repository
2. Click on the running workflow "Deploy to GitHub Pages"
3. Watch the build and deploy steps (takes 2-5 minutes)
4. When complete, you'll see a green checkmark ✅

### Step 9: Access Your Live Site

Your site will be at:
```
https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/
```

**Future Updates**: Just push to main branch, and it auto-deploys! 🎉

---

## 🔧 Troubleshooting

### Issue: `gh-pages` command not found

**Solution:**
```powershell
npm install -g gh-pages
# Then try again
npm run deploy
```

### Issue: Permission denied (GitHub)

**Solution:** You need to authenticate with GitHub

**Option A - HTTPS with Personal Access Token:**
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. When pushing, use token as password

**Option B - SSH (Recommended):**
1. Generate SSH key:
   ```powershell
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```
2. Add to GitHub: Settings → SSH and GPG keys → New SSH key
3. Change remote to SSH:
   ```powershell
   git remote set-url origin git@github.com:YOUR-USERNAME/YOUR-REPO-NAME.git
   ```

### Issue: Build fails with "out of memory"

**Solution:** Increase Node.js memory:
```powershell
$env:NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### Issue: 404 Error when accessing site

**Possible causes:**
1. **Wait 5 minutes** - Initial deployment takes time
2. Check if `gh-pages` branch exists (go to branches tab)
3. Verify GitHub Pages is enabled in Settings
4. Check that base path in `vite.config.ts` is correct

**For custom domain:** Update `base: './'` to `base: '/'` in `vite.config.ts`

### Issue: Blank page or router not working

**Cause:** GitHub Pages doesn't support client-side routing by default

**Solution:** We're using `HashRouter` which is already configured! Routes use `#` like:
- `https://yoursite.github.io/sera-ai/#/dashboard`
- `https://yoursite.github.io/sera-ai/#/recommendations`

### Issue: Assets not loading (404 for CSS/JS)

**Solution:** Check `vite.config.ts` has correct base path:
```typescript
export default defineConfig({
  // For GitHub Pages subdirectory
  base: './',  // ✅ Correct for GitHub Pages
  
  // For custom domain at root
  // base: '/',
})
```

---

## 📝 Deployment Checklist

Before deploying, ensure:

- [ ] `npm run build` completes without errors
- [ ] `npm run preview` shows working site locally
- [ ] All environment-specific configs removed (no hardcoded localhost URLs)
- [ ] No console errors in production build
- [ ] README.md updated with live site URL
- [ ] Test files/fixtures not accidentally deployed (they're in `.gitignore`)

---

## 🔄 Updating Your Live Site

### Manual Method:
```powershell
# Make your changes
git add .
git commit -m "Update: description of changes"
git push origin main

# Redeploy
npm run deploy
```

### Automatic Method (if using GitHub Actions):
```powershell
# Make your changes
git add .
git commit -m "Update: description of changes"
git push origin main
# Deployment happens automatically!
```

---

## 🌐 Custom Domain (Optional)

To use your own domain (e.g., `sera.yourdomain.com`):

### Step 1: Configure DNS
Add a CNAME record pointing to:
```
YOUR-USERNAME.github.io
```

### Step 2: Add Custom Domain in GitHub
1. Repository → Settings → Pages
2. Enter your custom domain
3. Check "Enforce HTTPS"

### Step 3: Update Vite Config
In `vite.config.ts`:
```typescript
base: '/',  // Change from './' to '/'
```

### Step 4: Add CNAME file
Create `public/CNAME` with your domain:
```
sera.yourdomain.com
```

Rebuild and redeploy!

---

## 📊 Post-Deployment Verification

After deployment, test these critical flows:

1. **Landing Page Loads** ✅
   - Visit: `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`
   - Should see SERA AI landing page

2. **Onboarding Flow** ✅
   - Click "Get Started"
   - Complete all 4 steps
   - Accept consent

3. **Upload Sample Data** ✅
   - Load diabetes_risk sample
   - Verify parsing works

4. **Generate Recommendations** ✅
   - Click "Generate Recommendations"
   - See results appear

5. **3D Helix Renders** ✅
   - Dashboard shows rotating DNA helix
   - Hover tooltips work

6. **AI Chat Dock** ✅
   - Floating chat button appears
   - Opens chat interface
   - Shows demo mode message (without API key)

7. **Data Persistence** ✅
   - Refresh page
   - Data still present

8. **Settings Page** ✅
   - Can add Gemini API key
   - Export/Import works

---

## 🎉 Success!

Your SERA AI application is now live on GitHub Pages! 

### Share Your Site:
```
🌐 Live Site: https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/
📦 Repository: https://github.com/YOUR-USERNAME/YOUR-REPO-NAME
```

### Next Steps:
- Share with friends/colleagues for feedback
- Monitor GitHub Issues for bug reports
- Set up analytics (optional - Google Analytics, Plausible, etc.)
- Consider adding GitHub Discussions for community support

---

## 📞 Need Help?

If you encounter issues not covered here:
1. Check GitHub Actions logs (if using automatic deployment)
2. Review browser console for errors (F12 → Console)
3. Verify `gh-pages` branch was created
4. Try incognito mode (clears cache)
5. Check GitHub Status: https://www.githubstatus.com/

---

**Happy Deploying! 🚀**

