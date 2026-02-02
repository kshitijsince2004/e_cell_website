# Server Configuration for Admin Panel Access

## Apache (.htaccess) - Already created
The `.htaccess` file is already in place and will handle `/admin` routing automatically.

## Nginx Configuration
Add this to your Nginx server block:

```nginx
location /admin {
    try_files $uri $uri/ /admin/index.html;
}

location /admin/ {
    try_files $uri $uri/ /admin/index.html;
}
```

## Node.js/Express Server
If using a Node.js server, add this route:

```javascript
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin/index.html'));
});
```

## Static File Hosting (Netlify, Vercel, etc.)

### Netlify (_redirects file)
Create a `_redirects` file in the root:
```
/admin /admin/index.html 200
/admin/* /admin/index.html 200
```

### Vercel (vercel.json)
Create a `vercel.json` file:
```json
{
  "rewrites": [
    {
      "source": "/admin",
      "destination": "/admin/index.html"
    },
    {
      "source": "/admin/(.*)",
      "destination": "/admin/index.html"
    }
  ]
}
```

## GitHub Pages
GitHub Pages doesn't support server-side redirects, but the JavaScript router will handle it.

## Testing
1. Visit `yoursite.com/admin` - should redirect to admin panel
2. Use the hidden admin link in the bottom-right corner
3. Use keyboard shortcut: Ctrl+Alt+A
4. Direct access: `yoursite.com/admin.html`