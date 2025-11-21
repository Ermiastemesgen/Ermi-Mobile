# Install Git and Deploy to GitHub

Git is not installed on your system. Follow these steps to install Git and deploy your project.

## 📥 Step 1: Install Git

### Download Git for Windows:
1. Go to: https://git-scm.com/download/win
2. Download the installer (64-bit recommended)
3. Run the installer
4. Use default settings (just click "Next" through all options)
5. Click "Install"

### Verify Installation:
Open a new Command Prompt or PowerShell and run:
```bash
git --version
```

You should see something like: `git version 2.43.0`

## 🚀 Step 2: Configure Git

Set your name and email (used for commits):
```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@gmail.com"
```

## 📁 Step 3: Initialize Repository

In your project folder:
```bash
# Initialize git
git init

# Create main branch
git branch -M main

# Add all files
git add .

# Make first commit
git commit -m "Initial commit - Ermi Mobile e-commerce website"
```

## 🌐 Step 4: Create GitHub Repository

1. Go to https://github.com
2. Sign up or log in
3. Click the "+" icon (top right) → "New repository"
4. Fill in:
   - **Repository name:** ermi-mobile
   - **Description:** Mobile accessories e-commerce website
   - **Public** or **Private** (your choice)
   - **DO NOT** check "Initialize with README"
5. Click "Create repository"

## 🔗 Step 5: Connect to GitHub

GitHub will show you commands. Use these:

```bash
# Add remote repository (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/ermi-mobile.git

# Push to GitHub
git push -u origin main
```

### If it asks for credentials:
- **Username:** Your GitHub username
- **Password:** Use a Personal Access Token (not your password!)

### Create Personal Access Token:
1. Go to GitHub → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token
4. Select scopes: `repo` (full control)
5. Copy the token (you won't see it again!)
6. Use this token as your password

## ✅ Step 6: Verify

Go to your GitHub repository URL:
```
https://github.com/YOUR_USERNAME/ermi-mobile
```

You should see all your files!

## 🚀 Alternative: Deploy Without Git (Easier!)

If you don't want to use Git, you can deploy directly:

### Option 1: Render.com (No Git Required)
1. Go to https://render.com
2. Sign up
3. Click "New +" → "Web Service"
4. Choose "Deploy from GitHub" OR "Deploy from GitLab"
5. Or use "Deploy from a Git repository" and paste your repo URL

### Option 2: Railway.app
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project"
4. Choose "Deploy from GitHub repo"
5. Select your repository

### Option 3: Vercel (Easiest!)
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Deploy!

## 🔒 Important: Secure Your .env File

**BEFORE pushing to GitHub:**

1. Make sure `.gitignore` exists with:
```
node_modules/
.env
.env.local
*.log
```

2. Check what will be uploaded:
```bash
git status
```

3. If you see `.env` in the list, remove it:
```bash
git rm --cached .env
git commit -m "Remove .env from tracking"
```

## 📝 Quick Reference

### Common Git Commands:
```bash
# Check status
git status

# Add files
git add .

# Commit changes
git commit -m "Your message"

# Push to GitHub
git push

# Pull from GitHub
git pull

# Check remote
git remote -v

# View history
git log --oneline
```

## 🆘 Troubleshooting

### "git is not recognized"
- Git is not installed or not in PATH
- Restart your terminal after installing Git
- Or download from: https://git-scm.com/download/win

### "src refspec main does not match any"
- You haven't made your first commit yet
- Run: `git add .` then `git commit -m "Initial commit"`

### "failed to push some refs"
- Repository already has files
- Run: `git pull origin main --allow-unrelated-histories`
- Then: `git push -u origin main`

### "remote origin already exists"
- Remove it: `git remote remove origin`
- Add again: `git remote add origin YOUR_URL`

## 🎯 Recommended Workflow

1. **Install Git** (one time)
2. **Create GitHub account** (one time)
3. **Initialize repository** (one time per project)
4. **Make changes to your code**
5. **Commit changes:**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```
6. **Repeat step 4-5** as you develop

## 🌟 After Deployment

Once on GitHub, you can:
- ✅ Deploy to Render, Railway, or Vercel
- ✅ Share your code with others
- ✅ Collaborate with team members
- ✅ Track changes and history
- ✅ Roll back if something breaks

---

**Choose your path:**
- **Want full control?** Install Git and use GitHub
- **Want quick deployment?** Use Render/Railway/Vercel directly
- **Want both?** Install Git first, then deploy

**Need help?** Follow the steps in order and check for error messages!
