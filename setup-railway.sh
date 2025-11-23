#!/bin/bash

# Railway Migration Setup Script
# Automates the preparation for Railway deployment

echo "🚀 Railway Migration Setup"
echo "=========================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository. Please run 'git init' first."
    exit 1
fi

# Run the migration helper script
echo "📋 Running migration helper..."
node railway-migration-script.js

echo ""
echo "🔄 Committing changes to GitHub..."

# Add all files
git add .

# Commit changes
git commit -m "Prepare for Railway migration - add configuration files"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Setup complete! Your repository is ready for Railway."
echo ""
echo "🚀 Next steps:"
echo "1. Go to https://railway.app"
echo "2. Login with GitHub"
echo "3. Click 'New Project' → 'Deploy from GitHub repo'"
echo "4. Select your repository"
echo "5. Follow the checklist in RAILWAY_MIGRATION_CHECKLIST.md"
echo ""
echo "🌐 Railway will automatically detect and deploy your Node.js app!"