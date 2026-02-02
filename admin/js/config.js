const SUPABASE_URL = "https://khxeesffponvgpgnszpz.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoeGVlc2ZmcG9udmdwZ25zenB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MjQ0OTcsImV4cCI6MjA4NTIwMDQ5N30.Nie54ajcJH6Ll51VBVTablRlZEETYUMOHxogWHbwThY";

// initialization
window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// Database table names
const TABLES = {
    BLOGS: 'blogs',
    EVENTS: 'events',
    ADMINS: 'admins'
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