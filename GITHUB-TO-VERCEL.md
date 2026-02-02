# 📚 GitHub to Vercel Deployment Guide

## Step 1: Prepare for GitHub

### 1.1 Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit: E-Cell website with admin panel"
```

### 1.2 Create GitHub Repository
1. Go to [github.com](https://github.com)
2. Click "New repository"
3. Name it: `ecell-website` (or your preferred name)
4. Keep it public or private (your choice)
5. **Don't** initialize with README (we already have one)
6. Click "Create repository"

### 1.3 Connect Local to GitHub
```bash
# Replace YOUR_USERNAME and YOUR_REPO_NAME
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### 2.1 Connect GitHub to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub account
3. Click "New Project"
4. Import your repository
5. Configure project:
   - **Project Name**: `ecell-website`
   - **Framework Preset**: Other
   - **Root Directory**: `./` (default)
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
   - **Install Command**: Leave empty

### 2.2 Deploy Settings
- ✅ Auto-deploy from `main` branch
- ✅ Production domain will be: `your-project.vercel.app`
- ✅ Admin panel will be: `your-project.vercel.app/admin`

### 2.3 Click "Deploy"
Vercel will automatically:
- Build your project
- Deploy to production
- Generate a live URL

## Step 3: Post-Deployment Setup

### 3.1 Test Your Deployment
1. Visit your Vercel URL
2. Test main website functionality
3. Test admin panel: `your-url.vercel.app/admin`
4. Verify all routes work correctly

### 3.2 Update Supabase Configuration
After deployment, you may need to:
1. Update CORS settings in Supabase
2. Add your Vercel domain to allowed origins
3. Test database connections

## Step 4: Custom Domain (Optional)

### 4.1 Add Custom Domain
1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### 4.2 Update Admin Access
With custom domain, admin will be:
- `yourdomain.com/admin`

## 🔄 Future Updates

### Automatic Deployment
Every time you push to GitHub:
```bash
git add .
git commit -m "Update website"
git push
```
Vercel will automatically redeploy!

### Manual Deployment
If needed, you can also deploy manually:
```bash
vercel --prod
```

## 📋 Pre-Push Checklist

Before pushing to GitHub, ensure:
- [ ] All files are saved
- [ ] Supabase credentials are correct
- [ ] No sensitive data in code
- [ ] All images and assets are included
- [ ] Admin panel works locally

## 🚨 Important Notes

1. **Supabase CORS**: Add your Vercel domain to Supabase allowed origins
2. **Environment Variables**: Keep sensitive data secure
3. **Database Setup**: Run SQL scripts after deployment
4. **Testing**: Always test admin panel after deployment

## 📞 Need Help?

- **GitHub Issues**: Check repository issues
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **E-Cell Contact**: ecell@nfsutc.ac.in

---

**Ready to deploy? Let's go! 🚀**