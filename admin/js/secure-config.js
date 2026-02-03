// =====================================================
// SECURE ADMIN CONFIGURATION
// Uses SERVICE ROLE key for full database access
// =====================================================

const SUPABASE_URL = "https://khxeesffponvgpgnszpz.supabase.co";

// SERVICE ROLE KEY - Full database access (admin only)
// ⚠️ NEVER expose this key publicly or commit to GitHub!
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoeGVlc2ZmcG9udmdwZ25zenB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYyNDQ5NywiZXhwIjoyMDg1MjAwNDk3fQ.N26bpGHFc0WcPDWu6bAKhgW-Hre12cJlEN0cJyg93dw";

// Create admin client with service role key
window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
);

// Database table names
const TABLES = {
    BLOGS: 'blogs',
    EVENTS: 'events',
    ADVERTISEMENTS: 'advertisements',
    SETTINGS: 'settings',
    ADMIN: 'admin'
};

// Configuration object
const CONFIG = {
    supabase: supabase,
    tables: TABLES,
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm'
};

// Export for use in other files
window.CONFIG = CONFIG;
window.supabase = supabase;

console.log('🔐 Admin panel initialized with SERVICE ROLE key');
console.log('✅ Full database access enabled');