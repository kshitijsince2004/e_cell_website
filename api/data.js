// Vercel Serverless Function - Supabase proxy
// Keys are in Vercel env vars, never exposed to browser

const ALLOWED_TABLES = ['events', 'blogs', 'advertisements', 'settings'];

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    // Check env vars are set
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        return res.status(500).json({ error: 'Server not configured: missing environment variables' });
    }

    const { table, id, status, limit } = req.query;

    if (!table || !ALLOWED_TABLES.includes(table)) {
        return res.status(400).json({ error: 'Invalid table' });
    }

    try {
        // Lazy-load client so env vars are read at request time
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

        let query = supabase.from(table).select('*');

        if (table === 'blogs') query = query.eq('status', 'published');
        if (table === 'settings') query = query.eq('is_public', true);
        if (status) query = query.eq('status', status);
        if (id) query = query.eq('id', id).single();
        if (limit) query = query.limit(parseInt(limit));

        if (table !== 'settings') {
            query = query.order('date', { ascending: false });
        }

        const { data, error } = await query;
        if (error) throw error;

        return res.status(200).json({ data });
    } catch (error) {
        console.error('API error:', error.message);
        return res.status(500).json({ error: error.message });
    }
};
