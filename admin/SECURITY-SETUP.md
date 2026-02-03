# 🔐 Security Setup Guide

## Step 1: Get Your Service Role Key

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `khxeesffponvgpgnszpz`

2. **Navigate to Settings**
   - Click on "Settings" in the left sidebar
   - Click on "API" tab

3. **Copy Your Service Role Key**
   - Find the "Service Role" section
   - Copy the **service_role** key (NOT the anon key)
   - It should start with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Step 2: Update Admin Configuration

1. **Open `admin/js/secure-config.js`**
2. **Replace `YOUR_SERVICE_ROLE_KEY_HERE`** with your actual service role key:

```javascript
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoeGVlc2ZmcG9udmdwZ25zenB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYyNDQ5NywiZXhwIjoyMDg1MjAwNDk3fQ.YOUR_ACTUAL_KEY_HERE";
```

## Step 3: Security Verification

After updating the key:

1. **Test Admin Panel**
   - Open `admin/index.html`
   - Try logging in (use any email/password for now)
   - Check if you can create/edit blogs and events

2. **Test Public Website**
   - Open your main website
   - Verify blogs and events still load
   - Check that data is visible

## Current Security Status

✅ **Public Website**: Uses ANON key (read-only access)
- Can read published blogs
- Can read active events
- Can read active advertisements
- Cannot modify any data

✅ **Admin Panel**: Uses SERVICE ROLE key (full access)
- Can create, read, update, delete all data
- Bypasses Row Level Security policies
- Full database administration

## Important Security Notes

⚠️ **NEVER expose the service role key publicly**
- Don't commit it to GitHub
- Don't share it in screenshots
- Don't include it in client-side code that users can see

✅ **Your database is now secure**
- Third parties can only read published content
- Only your admin panel can modify data
- All write operations require the service role key

## Troubleshooting

**If admin panel shows "no data":**
- Check that you used the SERVICE ROLE key (not anon key)
- Verify the key is complete and not truncated
- Check browser console for errors

**If public website shows "no data":**
- Verify RLS policies are working
- Check that content status is 'published' or 'active'
- Ensure ANON key is correct in public files

## Next Steps

1. Update the service role key in `secure-config.js`
2. Test both admin panel and public website
3. Create some test content to verify everything works
4. Set up proper admin authentication (optional)

Your E-Cell website is now secure! 🎉