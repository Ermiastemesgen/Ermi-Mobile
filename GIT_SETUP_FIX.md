# Fix: "src refspec main does not match any"

This error occurs when trying to push to a branch that doesn't exist yet. Here's how to fix it:

## 🔧 Quick Fix (Choose One Method)

### Method 1: Create the main branch first (Recommended)

```bash
# 1. Check current branch
git branch

# 2. If you're on 'master', rename it to 'main'
git branch -M main

# 3. Add your files
git add .

# 4. Make your first commit
git commit -m "Initial commit - Ermi Mobile"

# 5. Now push
git push -u origin main
```

### Method 2: Use master branch instead

```bash
# 1. Add files
git add .

# 2. Commit
git commit -m "Initial commit - Ermi Mobile"

# 3. Push to master
git push -u origin master

# 4. (Optional) Later rename to main on GitHub
```

## 📝 Complete Step-by-Step Guide

### Step 1: Initialize Git (if not done)
```bash
git init
```

### Step 2: Check your current branch
```bash
git branch
```

If it shows `* master`, you need to rename it to `main`:
```bash
git branch -M main
```

### Step 3: Add all files
```bash
git add .
```

### Step 4: Check what will be committed
```bash
git status
```

### Step 5: Make your first commit
```bash
git commit -m "Initial commit - Ermi Mobile e-commerce website"
```

### Step 6: Add remote repository
```bash
# Replace YOUR_USERNAME and YOUR_REPO with your GitHub details
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

### Step 7: Push to GitHub
```bash
git push -u origin main
```

## 🚨 Common Issues & Solutions

### Issue 1: "fatal: not a git repository"
**Solution:**
```bash
git init
```

### Issue 2: "nothing to commit"
**Solution:**
```bash
git add .
git commit -m "Initial commit"
```

### Issue 3: "remote origin already exists"
**Solution:**
```bash
# Remove old remote
git remote remove origin

# Add new remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

### Issue 4: "failed to push some refs"
**Solution:**
```bash
# Pull first (if repository has files)
git pull origin main --allow-unrelated-histories

# Then push
git push -u origin main
```

## 🎯 Complete Fresh Start

If you want to start completely fresh:

```bash
# 1. Remove existing git folder (if any)
Remove-Item -Recurse -Force .git

# 2. Initialize new repository
git init

# 3. Create main branch
git branch -M main

# 4. Add all files
git add .

# 5. Commit
git commit -m "Initial commit - Ermi Mobile"

# 6. Add remote
git remote add origin https://github.com/YOUR_USERNAME/ermi-mobile.git

# 7. Push
git push -u origin main
```

## 📋 Before Pushing - Important!

### 1. Make sure .gitignore is working
```bash
# Check what will be committed
git status

# You should NOT see:
# - node_modules/
# - .env (contains your email password!)
```

### 2. Verify .gitignore exists
Your `.gitignore` file should contain:
```
node_modules/
.env
.env.local
*.log
.DS_Store
Thumbs.db
```

### 3. If .env is already tracked, remove it:
```bash
git rm --cached .env
git commit -m "Remove .env from tracking"
```

## 🔐 Security Check

**IMPORTANT:** Never commit your `.env` file!

Check if .env is in your commit:
```bash
git status
```

If you see `.env` listed, run:
```bash
# Remove from staging
git reset .env

# Or if already committed
git rm --cached .env
git commit -m "Remove .env"
```

## ✅ Verification

After pushing, verify on GitHub:
1. Go to your repository on GitHub
2. Check that files are there
3. Verify `.env` is NOT visible
4. Check that `node_modules/` is NOT uploaded

## 🚀 Quick Commands Reference

```bash
# Check status
git status

# Check current branch
git branch

# Check remote
git remote -v

# View commit history
git log --oneline

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

## 💡 Pro Tips

1. **Always check git status before committing**
   ```bash
   git status
   ```

2. **Use meaningful commit messages**
   ```bash
   git commit -m "Add email verification feature"
   ```

3. **Push regularly**
   ```bash
   git push
   ```

4. **Create .gitignore FIRST**
   - Before your first commit
   - Prevents committing sensitive files

## 🎓 Understanding the Error

**"src refspec main does not match any"** means:
- You're trying to push to a branch called "main"
- But that branch doesn't exist in your local repository
- Usually happens when you haven't made your first commit yet
- Or when the branch is named "master" instead of "main"

**Solution:** Make sure you have commits on the "main" branch before pushing!

---

**Need more help?** Check the error message carefully and follow the steps above.
