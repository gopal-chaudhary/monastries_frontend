#!/bin/bash

# Quick deployment script for GitHub Pages
# This will commit the workflow fix and trigger redeployment

echo "🚀 Deploying Frontend to GitHub Pages"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f ".github/workflows/deploy.yml" ]; then
    echo "❌ Error: Not in monastries_frontend directory"
    echo "Please run: cd monastries_frontend && bash DEPLOY_NOW.sh"
    exit 1
fi

# Check git status
echo "📋 Checking git status..."
git status --short

echo ""
echo "📝 Committing workflow fix..."
git add .github/workflows/deploy.yml
git commit -m "fix: use VITE_API_URL in GitHub Actions workflow for production backend connection"

echo ""
echo "⬆️  Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Changes pushed successfully!"
echo ""
echo "📊 Next steps:"
echo "1. Monitor deployment: https://github.com/gopal-chaudhary/monastries_frontend/actions"
echo "2. Wait 2-3 minutes for deployment to complete"
echo "3. Update backend CORS on Render to include: https://gopal-chaudhary.github.io"
echo "4. Test site: https://gopal-chaudhary.github.io/monastries_frontend/"
echo ""
echo "🔗 Backend CORS Update:"
echo "   Go to: https://dashboard.render.com"
echo "   Service: monastries-backend"
echo "   Environment → CORS_ORIGIN → Add: https://gopal-chaudhary.github.io"
echo ""
