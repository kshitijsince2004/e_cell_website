# E-Cell Website - Production Deployment

## Quick Setup

### 1. Database Setup
Run these SQL files in your Supabase SQL editor in order:
1. `admin/setup.sql` - Basic tables
2. `admin/setup-events-table.sql` - Events table
3. `admin/setup-advertisements-table.sql` - Advertisements table  
4. `admin/setup-settings-table.sql` - Settings table (for Google Form integration)

### 2. Admin Access
1. Create admin user in Supabase Authentication
2. Access admin panel at `/admin/index.html`
3. Login with your admin credentials

### 3. Configuration
- Update Supabase credentials in `js/supabase-client.js` and `admin/js/config.js`
- Configure Google Form integration in admin panel Settings section

## Features
- **Blog Management**: Create and manage blog posts
- **Event Management**: Full event lifecycle with registration links
- **Advertisement Popups**: Configurable promotional popups
- **Google Form Integration**: Connect Join E-Cell buttons to Google Forms
- **Responsive Design**: Mobile-friendly interface

## File Structure
```
/
├── admin/           # Admin panel
├── css/            # Stylesheets
├── js/             # JavaScript files
├── img/            # Images and assets
├── fonts/          # Font files
├── *.html          # Website pages
└── *.php           # Contact form handlers
```

## Production Checklist
- [ ] Database tables created
- [ ] Admin user configured
- [ ] Supabase credentials updated
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] Contact forms tested
- [ ] Admin panel access verified