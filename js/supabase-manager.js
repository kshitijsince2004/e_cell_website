// =====================================================
// SECURE SUPABASE CLIENT MANAGER
// Uses ANON key with Row Level Security
// =====================================================

const SUPABASE_URL = window?.ECELL_ENV?.SUPABASE_URL || "";
// ANON KEY - Safe for public use (read-only with RLS)
const SUPABASE_ANON_KEY = window?.ECELL_ENV?.SUPABASE_ANON_KEY || "";

/**
 * Centralized Supabase Client Manager
 * Prevents multiple client instances and manages connections efficiently
 */
class SupabaseManager {
    constructor() {
        this.clients = new Map();
        this.SUPABASE_URL = SUPABASE_URL;
        this.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
    }

    /**
     * Get or create a Supabase client
     * @param {string} key - API key to use (defaults to ANON key)
     * @param {string} clientId - Unique identifier for this client
     * @returns {Object} Supabase client instance
     */
    getClient(key = null, clientId = 'default') {
        const apiKey = key || this.SUPABASE_ANON_KEY;
        const clientKey = `${clientId}_${apiKey.substring(0, 10)}`;

        if (!this.clients.has(clientKey)) {
            if (typeof window.supabase === 'undefined') {
                console.error('Supabase library not loaded');
                return null;
            }

            const client = window.supabase.createClient(this.SUPABASE_URL, apiKey);
            this.clients.set(clientKey, client);
            console.log(`✅ Created Supabase client: ${clientId}`);
        }

        return this.clients.get(clientKey);
    }

    /**
     * Get public client (read-only with RLS)
     */
    getPublicClient() {
        return this.getClient(this.SUPABASE_ANON_KEY, 'public');
    }

    /**
     * Clear all clients
     */
    clearClients() {
        this.clients.clear();
        console.log('🧹 Cleared all Supabase clients');
    }
}

// Create global instance
window.supabaseManager = new SupabaseManager();

// Backward compatibility - provide global client
window.getSupabaseClient = (key, clientId) => {
    return window.supabaseManager.getClient(key, clientId);
};

console.log('🔐 Supabase Manager initialized');
console.log('✅ Using ANON key with Row Level Security');
console.log('⚠️  Service role key removed from client code');
