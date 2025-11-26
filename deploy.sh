#!/bin/bash
# Quick Deploy Script for Railway
# Usage: ./deploy.sh "Your commit message"

# Check if commit message provided
if [ -z "$1" ]; then
    echo "❌ Error: Please provide a commit message"
    echo "Usage: ./deploy.sh \"Your commit message\""
    exit 1
fi

echo "🚀 Starting deployment process..."
echo ""

# Stage all changes
echo "📦 Staging changes..."
git add -A

# Commit changes
echo "💾 Committing changes..."
git commit -m "$1"

# Push to GitHub (triggers Railway deploy)
echo "🌐 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Changes pushed to GitHub!"
echo "🚂 Railway will automatically deploy in 1-2 minutes"
echo "📊 Check status: https://railway.app/dashboard"
echo "🌍 Your site: https://ermimobile.up.railway.app"
