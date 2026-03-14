// =====================================================
// SUPABASE CLIENT MANAGER - Legacy stub
// Public pages now use /api/data proxy instead.
// This file is kept for backward compatibility only.
// =====================================================

class SupabaseManager {
    constructor() {
        this.clients = new Map();
        this.SUPABASE_URL = window?.ECELL_ENV?.SUPABASE_URL || "";
        this.SUPABASE_ANON_KEY = window?.ECELL_ENV?.SUPABASE_ANON_KEY || "";
    }

    getClient(key = null, clientId = 'default') {
        if (!this.SUPABASE_URL || !this.SUPABASE_ANON_KEY) {
            console.warn('SupabaseManager: no keys configured, use /api/data proxy instead');
            return null;
        }
        const apiKey = key || this.SUPABASE_ANON_KEY;
        const clientKey = `${clientId}_${apiKey.substring(0, 10)}`;
        if (!this.clients.has(clientKey)) {
            if (typeof window.supabase === 'undefined') return null;
            const client = window.supabase.createClient(this.SUPABASE_URL, apiKey);
            this.clients.set(clientKey, client);
        }
        return this.clients.get(clientKey);
    }

    getPublicClient() {
        return this.getClient(this.SUPABASE_ANON_KEY, 'public');
    }
}

window.supabaseManager = new SupabaseManager();
window.getSupabaseClient = (key, clientId) => window.supabaseManager.getClient(key, clientId);
