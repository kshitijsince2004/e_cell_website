# E-Cell NFSU TC Website

Entrepreneurship Cell website for National Forensic Sciences University (NFSU TC) with integrated admin panel.

## 🚀 Features

- **Responsive Website**: Modern, mobile-friendly design
- **Admin Panel**: Complete content management system
- **Blog Management**: Create and manage blog posts
- **Event Management**: Comprehensive event creation and management
- **Advertisement System**: Popup advertisement management
- **Settings Panel**: Google Form integration and site settings

## 🔧 Admin Panel Access

The admin panel can be accessed through multiple methods:

1. **URL Route**: `yoursite.com/admin`
2. **Direct Link**: `yoursite.com/admin/index.html`
3. **Hidden Link**: Small "Admin" button in bottom-right corner
4. **Keyboard Shortcut**: `Ctrl+Alt+A`

## 📦 Deployment on Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=your-repo-url)

### Manual Deployment

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Production Deploy**:
   ```bash
   vercel --prod
   ```

### Environment Setup

The project uses Supabase for backend services. Make sure to:

1. Set up your Supabase project
2. Update the credentials in `admin/js/admin.js`
3. Run the database setup scripts in the `admin/` folder

## 🗂️ Project Structure

```
├── admin/                  # Admin panel
│   ├── css/               # Admin styles
│   ├── js/                # Admin JavaScript
│   ├── index.html         # Admin panel entry point
│   └── *.sql              # Database setup scripts
├── css/                   # Main website styles
├── js/                    # Main website JavaScript
├── img/                   # Images and assets
├── index.html             # Main website entry point
├── vercel.json            # Vercel configuration
└── package.json           # Project configuration
```

## 🔐 Admin Panel Features

- **Dashboard**: Overview statistics
- **Blog Management**: CRUD operations for blog posts
- **Event Management**: Comprehensive event creation with:
  - Basic information
  - Learning points
  - Schedule management
  - Registration links
- **Advertisement Management**: Popup ads with preview
- **Settings**: Google Form integration

## 🛠️ Local Development

1. **Clone the repository**
2. **Start local server**:
   ```bash
   python -m http.server 8000
   ```
3. **Access the site**: `http://localhost:8000`
4. **Access admin**: `http://localhost:8000/admin`

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 📞 Support

For support, email: ecell@nfsutc.ac.in

---

**E-Cell NFSU TC** - Empowering Student Entrepreneurs