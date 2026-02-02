#!/bin/bash

echo "🚀 E-Cell Website - GitHub to Vercel Setup"
echo "=========================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
else
    echo "✅ Git repository already initialized"
fi

# Check git status
echo ""
echo "📊 Current Git Status:"
git status --short

echo ""
echo "📋 Pre-deployment Checklist:"
echo "[ ] 1. All files saved and ready"
echo "[ ] 2. Supabase credentials configured"
echo "[ ] 3. Admin panel tested locally"
echo "[ ] 4. Images and assets included"

echo ""
echo "🔧 Next Steps:"
echo "1. Run: git add ."
echo "2. Run: git commit -m 'Initial commit: E-Cell website with admin panel'"
echo "3. Create GitHub repository"
echo "4. Run: git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
echo "5. Run: git push -u origin main"
echo "6. Deploy on Vercel by importing GitHub repository"

echo ""
echo "📖 For detailed instructions, see: GITHUB-TO-VERCEL.md"
echo ""
echo "🌐 After deployment, your admin panel will be at:"
echo "   https://your-project.vercel.app/admin"

echo ""
read -p "🤔 Ready to add all files to git? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📦 Adding all files to git..."
    git add .
    echo "✅ Files added! Now run:"
    echo "   git commit -m 'Initial commit: E-Cell website with admin panel'"
    echo "   Then follow the GitHub setup steps in GITHUB-TO-VERCEL.md"
else
    echo "👍 No problem! Run this script again when ready."
fi