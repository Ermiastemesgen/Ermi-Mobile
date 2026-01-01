#!/bin/bash

echo "========================================"
echo "  Deploying to Render.com"
echo "========================================"
echo ""

echo "Step 1: Adding all changes to git..."
git add .
echo ""

echo "Step 2: Committing changes..."
read -p "Enter commit message (or press Enter for default): " commit_message
if [ -z "$commit_message" ]; then
    commit_message="Update deployment"
fi

git commit -m "$commit_message"
echo ""

echo "Step 3: Pushing to GitHub..."
git push origin main
echo ""

echo "========================================"
echo "  Deployment Triggered!"
echo "========================================"
echo ""
echo "Render will automatically deploy in 1-2 minutes."
echo ""
echo "Check deployment status:"
echo "  https://dashboard.render.com"
echo ""
echo "Your site will be live at:"
echo "  https://your-app.onrender.com"
echo ""
