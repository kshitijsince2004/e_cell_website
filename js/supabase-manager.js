/**
 * Centralized Supabase Client Manager
 * Prevents multiple client instances and manages connections efficiently
 */

class SupabaseManager {
    constructor() {
        this.clients = new Map();
        this.SUPABASE_URL = "https://khxeesffponvgpgnszpz.supabase.co";
        this.SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoeGVlc2ZmcG9udmdwZ25zenB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MjQ0OTcsImV4cCI6MjA4NTIwMDQ5N30.Nie54ajcJH6Ll51VBVTablRlZEETYUMOHxogWHbwThY";
    }

    /**
     * Get or create a Supabase client
     * @param {string} key - API key to use
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
     * Get public client (anon key)
     */
    getPublicClient() {
        return this.getClient(this.SUPABASE_ANON_KEY, 'public');
    }

    /**
     * Get admin client (service role key)
     */
    getAdminClient(serviceRoleKey) {
        return this.getClient(serviceRoleKey, 'admin');
    }

    /**
     * Clear all clients (useful for cleanup)
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