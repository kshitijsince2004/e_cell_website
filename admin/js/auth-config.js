// =====================================================
// SECURE AUTHENTICATION CONFIGURATION
// Uses Supabase Auth with proper security
// =====================================================

const SUPABASE_URL = window?.ECELL_ENV?.SUPABASE_URL || "";
// ANON KEY - Safe for public use (read-only with RLS)
const SUPABASE_ANON_KEY = window?.ECELL_ENV?.SUPABASE_ANON_KEY || "";

// Create Supabase client with ANON key (secure with RLS)
window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

// Database table names
const TABLES = {
    BLOGS: 'blogs',
    EVENTS: 'events',
    ADVERTISEMENTS: 'advertisements',
    SETTINGS: 'settings'
};

// Configuration object
const CONFIG = {
    SUPABASE_URL: SUPABASE_URL,
    SUPABASE_ANON_KEY: SUPABASE_ANON_KEY,
    tables: TABLES,
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm'
};

// Export for use in other files
window.CONFIG = CONFIG;

console.log('🔐 Admin panel initialized with Supabase Auth');
console.log('✅ Using ANON key with Row Level Security');
