# 🚀 Vercel Deployment Guide

## Quick Start

### Option 1: One-Click Deploy
1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Deploy! ✨

### Option 2: CLI Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Option 3: Use the Deploy Script
```bash
./deploy.sh
```

## 🔧 Configuration

The project includes:
- ✅ `vercel.json` - Routing and headers configuration
- ✅ `package.json` - Project metadata
- ✅ `.gitignore` - Ignore unnecessary files
- ✅ `_redirects` - Netlify fallback (if needed)

## 🌐 Admin Panel Access

After deployment, your admin panel will be available at:
- `https://your-project.vercel.app/admin`

## 🔐 Security Features

- Admin routes have no-cache headers
- Security headers (X-Frame-Options, X-Content-Type-Options)
- Static assets have long-term caching

## 📋 Post-Deployment Checklist

1. **Test Admin Access**: Visit `/admin` and verify it loads
2. **Update Supabase Config**: Update credentials in `admin/js/admin.js`
3. **Database Setup**: Run SQL scripts in `admin/` folder
4. **Test Functionality**: 
   - Login to admin panel
   - Create a test blog post
   - Create a test event
   - Test advertisement system
5. **Custom Domain** (optional): Add your domain in Vercel dashboard

## 🐛 Troubleshooting

### Admin Panel Not Loading
- Check browser console for errors
- Verify Supabase credentials
- Check network tab for failed requests

### Routing Issues
- Ensure `vercel.json` is in root directory
- Check Vercel function logs in dashboard

### Database Connection Issues
- Verify Supabase URL and API key
- Check database table structure
- Run setup SQL scripts

## 📊 Performance Tips

1. **Images**: Optimize images before uploading
2. **Caching**: Static assets are cached for 1 year
3. **Admin Security**: Admin routes have no-cache headers
4. **Clean URLs**: Enabled for better SEO

## 🔄 Updates

To update your deployment:
```bash
# Make changes to your code
git add .
git commit -m "Update website"
git push

# Vercel will auto-deploy if connected to Git
# Or manually deploy:
vercel --prod
```

## 📞 Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Project Issues**: Check GitHub issues
- **E-Cell Support**: ecell@nfsutc.ac.in

---

**Happy Deploying! 🎉**