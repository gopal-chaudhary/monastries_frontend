#!/bin/bash

# Quick Deploy to GitHub Pages Script

echo "🚀 Deploying Frontend to GitHub Pages"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "Please run this script from monastries_frontend directory"
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Error: Not a git repository"
    echo "Please initialize git first: git init"
    exit 1
fi

echo "✅ Pre-flight checks passed"
echo ""

# Build locally to test
echo "📦 Building project locally..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Fix errors before deploying."
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Add and commit
echo "📝 Committing changes..."
git add .
git commit -m "Deploy to GitHub Pages"

if [ $? -ne 0 ]; then
    echo "⚠️  Nothing to commit or commit failed"
fi

# Push to main
echo "🚢 Pushing to GitHub..."
git push origin main

if [ $? -ne 0 ]; then
    echo "❌ Push failed! Check your git configuration."
    exit 1
fi

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "📊 Next steps:"
echo "1. Go to your GitHub repository"
echo "2. Click 'Actions' tab"
echo "3. Watch the deployment progress"
echo "4. Wait 2-3 minutes"
echo "5. Visit: https://yourusername.github.io/final-project/"
echo ""
echo "⚠️  IMPORTANT: Update backend CORS settings!"
echo "See UPDATE_BACKEND_CORS.md for instructions"
echo ""
echo "🎉 Done!"
