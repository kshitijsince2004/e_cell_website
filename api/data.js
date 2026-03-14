// Vercel Serverless Function - Supabase proxy
// Keys are in Vercel env vars, never exposed to browser
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Allowed tables for public read access
const ALLOWED_TABLES = ['events', 'blogs', 'advertisements', 'settings'];

export default async function handler(req, res) {
    // CORS - only allow your domain
    res.setHeader('Access-Control-Allow-Origin', 'https://e-cell-website-live.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const { table, id, status, limit } = req.query;

    if (!table || !ALLOWED_TABLES.includes(table)) {
        return res.status(400).json({ error: 'Invalid table' });
    }

    try {
        let query = supabase.from(table).select('*');

        if (table === 'blogs') query = query.eq('status', 'published');
        if (table === 'settings') query = query.eq('is_public', true);
        if (status) query = query.eq('status', status);
        if (id) query = query.eq('id', id).single();
        if (limit) query = query.limit(parseInt(limit));

        query = query.order(table === 'blogs' ? 'date' : 'date', { ascending: false });

        const { data, error } = await query;
        if (error) throw error;

        return res.status(200).json({ data });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
