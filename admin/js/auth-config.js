// =====================================================
// SECURE AUTHENTICATION CONFIGURATION
// Uses Supabase Auth with proper security
// =====================================================

const SUPABASE_URL = "https://cheyadkgpxtvdbsvzlgq.supabase.co";
// ANON KEY - Safe for public use (read-only with RLS)
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoZXlhZGtncHh0dmRic3Z6bGdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNzk4ODcsImV4cCI6MjA4NTg1NTg4N30.CNgwaHZFc8bWlk0NOzJNndy9EVB0hKPJKg1FF5PdxVk";

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
