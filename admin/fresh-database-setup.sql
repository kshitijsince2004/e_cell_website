-- FRESH DATABASE SETUP - E-Cell Events System
-- This script will create a clean database from scratch
-- Run this in your Supabase SQL Editor

-- =====================================================
-- STEP 1: CLEAN SLATE - Remove existing tables
-- =====================================================

-- Drop existing events table (this will delete all data)
DROP TABLE IF EXISTS events CASCADE;

-- Drop existing blogs table (this will delete all data)
DROP TABLE IF EXISTS blogs CASCADE;

-- Drop any existing functions and triggers
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- =====================================================
-- STEP 2: CREATE EVENTS TABLE (MINIMAL & WORKING)
-- =====================================================

CREATE TABLE events (
    -- Primary key
    id SERIAL PRIMARY KEY,
    
    -- Essential fields that we know work
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME,
    location TEXT NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_created_at ON events(created_at);

-- =====================================================
-- STEP 3: CREATE BLOGS TABLE (MINIMAL & WORKING)
-- =====================================================

CREATE TABLE blogs (
    -- Primary key
    id SERIAL PRIMARY KEY,
    
    -- Essential fields
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'published',
    image TEXT,
    excerpt TEXT,
    content TEXT NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_blogs_date ON blogs(date);
CREATE INDEX idx_blogs_status ON blogs(status);
CREATE INDEX idx_blogs_created_at ON blogs(created_at);

-- =====================================================
-- STEP 4: CREATE UPDATE TRIGGER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to both tables
CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blogs_updated_at 
    BEFORE UPDATE ON blogs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 5: INSERT SAMPLE DATA
-- =====================================================

-- Insert sample events
INSERT INTO events (title, description, date, time, location) VALUES 
(
    'Startup Pitch Competition',
    'Annual competition where students present their innovative business ideas to industry experts and investors. Join us for an exciting day of entrepreneurship and innovation.',
    '2024-03-15',
    '10:00:00',
    'Main Auditorium, College Campus'
),
(
    'Entrepreneurship Workshop',
    'Learn the fundamentals of starting your own business. This comprehensive workshop covers business planning, funding, and market validation.',
    '2024-03-20',
    '14:00:00',
    'Conference Room A, Business Center'
),
(
    'Innovation Summit 2024',
    'A day-long summit featuring keynote speakers, panel discussions, and networking opportunities for aspiring entrepreneurs and innovators.',
    '2024-04-05',
    '09:00:00',
    'Grand Hall, Convention Center'
);

-- Insert sample blogs
INSERT INTO blogs (title, author, date, status, content, excerpt) VALUES 
(
    'The Future of Entrepreneurship',
    'John Doe',
    '2024-02-01',
    'published',
    'Entrepreneurship is evolving rapidly in the digital age. This article explores the trends and opportunities that will shape the future of business creation and innovation.',
    'Exploring the trends and opportunities shaping the future of business creation.'
),
(
    'Building Your First Startup',
    'Jane Smith',
    '2024-02-15',
    'published',
    'Starting your first business can be overwhelming. Here are the essential steps every entrepreneur should follow to build a successful startup from the ground up.',
    'Essential steps every entrepreneur should follow to build a successful startup.'
);

-- =====================================================
-- STEP 6: ENABLE ROW LEVEL SECURITY (OPTIONAL)
-- =====================================================

-- Enable RLS for both tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Enable read access for all users" ON events
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON blogs
    FOR SELECT USING (true);

-- Create policies for authenticated users (admin operations)
CREATE POLICY "Enable all operations for authenticated users" ON events
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON blogs
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- STEP 7: VERIFICATION QUERIES
-- =====================================================

-- Check events table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'events' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check blogs table structure  
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'blogs' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Count records
SELECT 'events' as table_name, COUNT(*) as record_count FROM events
UNION ALL
SELECT 'blogs' as table_name, COUNT(*) as record_count FROM blogs;

-- Show sample data
SELECT id, title, date, location FROM events ORDER BY date;
SELECT id, title, author, date, status FROM blogs ORDER BY date;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================

COMMENT ON TABLE events IS 'Clean events table with minimal working fields';
COMMENT ON TABLE blogs IS 'Clean blogs table with minimal working fields';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ DATABASE SETUP COMPLETE!';
    RAISE NOTICE '📊 Created tables: events, blogs';
    RAISE NOTICE '🔒 Enabled Row Level Security';
    RAISE NOTICE '📝 Inserted sample data';
    RAISE NOTICE '🚀 Ready to use!';
END $$;