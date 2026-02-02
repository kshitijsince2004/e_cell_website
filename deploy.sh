#!/bin/bash

# E-Cell Website Deployment Script for Vercel

echo "🚀 Deploying E-Cell Website to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in
echo "🔐 Checking Vercel authentication..."
vercel whoami

if [ $? -ne 0 ]; then
    echo "🔑 Please login to Vercel:"
    vercel login
fi

# Deploy to preview first
echo "📦 Deploying to preview environment..."
vercel

echo "✅ Preview deployment complete!"
echo ""
echo "🎯 To deploy to production, run:"
echo "   vercel --prod"
echo ""
echo "🔗 Admin panel will be available at:"
echo "   https://your-domain.vercel.app/admin"
echo ""
echo "📋 Don't forget to:"
echo "   1. Update Supabase credentials in admin/js/admin.js"
echo "   2. Set up your database using the SQL scripts in admin/"
echo "   3. Test the admin panel functionality"