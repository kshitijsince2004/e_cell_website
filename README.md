# 🚀 E-Cell NFSU TC Website

Modern, secure website for the Entrepreneurship Cell at National Forensic Sciences University (NFSU TC) with integrated admin panel and database management.

## ✨ Features

### 🌐 **Public Website**
- **Responsive Design**: Mobile-first, modern UI/UX
- **Dynamic Content**: Database-driven blogs and events
- **Advertisement System**: Smart popup management
- **SEO Optimized**: Meta tags, structured data
- **Performance**: Fast loading, optimized assets

### 🔐 **Admin Panel**
- **Secure Authentication**: Row Level Security (RLS) enabled
- **Rich Text Editor**: Quill.js integration for blog content
- **Image Management**: Upload and URL support
- **Event Management**: Comprehensive event creation system
- **Advertisement Control**: Popup management with preview
- **Settings Panel**: Google Form integration and site configuration

### 🛡️ **Security Features**
- **Database Security**: Row Level Security (RLS) policies
- **API Key Separation**: Different keys for public/admin access
- **Admin Protection**: Service role key required for modifications
- **Public Safety**: Read-only access for visitors

## 🏗️ Architecture

### **Database (Supabase)**
- **PostgreSQL**: Robust relational database
- **Real-time**: Live data synchronization
- **Security**: RLS policies and proper authentication
- **Scalable**: Cloud-hosted with automatic backups

### **Frontend**
- **Vanilla JavaScript**: No framework dependencies
- **Bootstrap**: Responsive UI components
- **Modern CSS**: Flexbox, Grid, animations
- **Progressive Enhancement**: Works without JavaScript

## 🚀 Quick Start

### **1. Database Setup**
```sql
-- Run in Supabase SQL Editor
-- 1. Main database structure
\i admin/clean-database-setup.sql

-- 2. Admin authentication
\i admin/safe-admin-table.sql

-- 3. Enable security
\i admin/enable-rls-security.sql
```

### **2. Configuration**
```javascript
// Update admin/js/secure-config.js
const SUPABASE_SERVICE_ROLE_KEY = "your_service_role_key_here";
```

### **3. Deploy**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=your-repo-url)

## 🔧 Admin Panel Access

Multiple secure access methods:

1. **Direct URL**: `yoursite.com/admin/`
2. **Redirect**: `yoursite.com/admin.html` → redirects to admin panel
3. **Hidden Button**: Bottom-right corner of main site
4. **Keyboard Shortcut**: `Ctrl+Alt+A` on any page

### **Default Credentials**
- **Username**: `admin`
- **Password**: `password`
- ⚠️ **Change immediately after first login!**

## 📁 Project Structure

```
├── 🌐 Public Website
│   ├── index.html              # Homepage
│   ├── blog.html               # Blog listing
│   ├── blog-details.html       # Individual blog posts
│   ├── events.html             # Events page
│   ├── team.html               # Team page
│   ├── about.html              # About page
│   └── contact.html            # Contact page
│
├── 🔐 Admin Panel
│   ├── admin/
│   │   ├── index.html          # Admin dashboard
│   │   ├── js/
│   │   │   ├── secure-config.js    # Secure configuration
│   │   │   └── admin.js            # Admin functionality
│   │   └── css/
│   │       └── admin.css           # Admin styles
│   │
│   └── Database Scripts
│       ├── clean-database-setup.sql    # Main DB setup
│       ├── safe-admin-table.sql        # Admin authentication
│       └── enable-rls-security.sql     # Security policies
│
├── 🎨 Assets
│   ├── css/                    # Stylesheets
│   ├── js/                     # JavaScript files
│   ├── img/                    # Images and media
│   └── fonts/                  # Web fonts
│
└── ⚙️ Configuration
    ├── vercel.json             # Vercel deployment config
    ├── package.json            # Project metadata
    ├── .gitignore              # Git ignore rules
    └── _redirects              # URL redirects
```

## 🛠️ Development

### **Local Setup**
```bash
# 1. Clone repository
git clone <your-repo-url>
cd ecell-website

# 2. Start local server
python -m http.server 8000
# or
npx serve .

# 3. Access locally
# Website: http://localhost:8000
# Admin:   http://localhost:8000/admin
```

### **Database Development**
1. Create Supabase project
2. Run SQL setup scripts
3. Update API keys in configuration files
4. Test admin panel functionality

## 🔒 Security Implementation

### **Row Level Security (RLS)**
```sql
-- Public users can only read published content
CREATE POLICY "Public can read published blogs" ON blogs
FOR SELECT USING (status = 'published');

-- Admin panel has full access with service role key
CREATE POLICY "Admin full access" ON blogs
FOR ALL USING (auth.role() = 'service_role');
```

### **API Key Strategy**
- **Public Website**: Uses `anon` key (read-only)
- **Admin Panel**: Uses `service_role` key (full access)
- **Security**: Service role key never exposed to public

## 📊 Admin Panel Features

### **Dashboard**
- 📈 Content statistics
- 📝 Recent activity
- 🎯 Quick actions

### **Blog Management**
- ✍️ Rich text editor (Quill.js)
- 🖼️ Image upload/URL support
- 📂 Categories and tags
- 🔄 Draft/Published status
- 🔗 SEO-friendly URLs

### **Event Management**
- 📅 Date and time scheduling
- 📍 Venue management
- 📋 Learning points (JSON array)
- ⏰ Schedule builder
- 🔗 Registration links
- ⭐ Rating system

### **Advertisement System**
- 🎯 Popup management
- 🖼️ Image preview
- 🔗 Event linking
- 👁️ View/click analytics
- ⏰ Scheduling support

### **Settings Panel**
- 📝 Google Form integration
- 🔧 Site configuration
- 📱 Social media links
- 📊 Analytics settings

## 🚀 Deployment

### **Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### **Netlify**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy

# Production deployment
netlify deploy --prod
```

### **Manual Deployment**
1. Upload files to web server
2. Ensure `.htaccess` rules are applied
3. Configure database connection
4. Test admin panel access

## 🔧 Configuration

### **Environment Variables**
```javascript
// Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### **Vercel Configuration**
```json
{
  "rewrites": [
    { "source": "/admin", "destination": "/admin/index.html" }
  ],
  "headers": [
    {
      "source": "/admin/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    }
  ]
}
```

## 📱 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 90+     | ✅ Full Support |
| Firefox | 88+     | ✅ Full Support |
| Safari  | 14+     | ✅ Full Support |
| Edge    | 90+     | ✅ Full Support |

## 🧪 Testing

### **Manual Testing Checklist**
- [ ] Homepage loads correctly
- [ ] Blog posts display and navigate properly
- [ ] Events page shows upcoming events
- [ ] Admin panel login works
- [ ] Blog creation/editing functions
- [ ] Event management works
- [ ] Advertisement system functions
- [ ] Mobile responsiveness

### **Security Testing**
- [ ] Public users cannot modify data
- [ ] Admin panel requires proper authentication
- [ ] RLS policies prevent unauthorized access
- [ ] Service role key is not exposed

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### **Development Guidelines**
- Follow existing code style
- Test all functionality before submitting
- Update documentation for new features
- Ensure security best practices

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 📞 Support & Contact

- **Email**: ecell@nfsutc.ac.in
- **Phone**: +91 9999882696
- **Instagram**: [@ecell.nfsu.tc](https://www.instagram.com/ecell.nfsu.tc)

## 🏆 Acknowledgments

- **NFSU TC** - National Forensic Sciences University
- **Supabase** - Backend infrastructure
- **Vercel** - Hosting platform
- **Bootstrap** - UI framework
- **Quill.js** - Rich text editor

---

**🎯 E-Cell NFSU TC** - *Empowering Student Entrepreneurs*

*Built with ❤️ for the entrepreneurship community*