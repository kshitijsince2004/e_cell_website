-- COMPREHENSIVE EVENTS DATABASE SETUP
-- This creates a full-featured events table with all advanced fields
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
-- STEP 2: CREATE COMPREHENSIVE EVENTS TABLE
-- =====================================================

CREATE TABLE events (
    -- Primary key
    id SERIAL PRIMARY KEY,
    
    -- Basic Information
    title VARCHAR(255) NOT NULL,
    event_type VARCHAR(100), -- Workshop, Competition, Seminar, etc.
    organizer VARCHAR(255) DEFAULT 'E-Cell Team',
    category VARCHAR(255), -- Entrepreneurship, Innovation, etc.
    date DATE NOT NULL,
    time TIME,
    duration VARCHAR(100), -- e.g., "4 Hours"
    venue TEXT, -- Main venue field
    location TEXT, -- Legacy field for backward compatibility
    status VARCHAR(50) DEFAULT 'upcoming', -- upcoming, ongoing, completed, cancelled
    image TEXT, -- URL to event image
    description TEXT NOT NULL, -- Short description for cards
    
    -- Event Overview
    overview TEXT, -- Detailed event description
    learning_description TEXT, -- What participants will learn
    
    -- Learning Points (stored as JSON array)
    learning_points JSON, -- Array of learning points
    
    -- Event Schedule (stored as JSON array)
    schedule_description TEXT, -- Overall schedule description
    schedule JSON, -- Array of schedule items
    
    -- Registration Information
    registration_link TEXT, -- Google Form or external registration link
    registration_note TEXT,
    
    -- Additional Information
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    contact_email VARCHAR(255),
    tags TEXT, -- Comma-separated tags
    special_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 3: CREATE BLOGS TABLE
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

-- =====================================================
-- STEP 4: CREATE INDEXES
-- =====================================================

-- Events table indexes
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_events_created_at ON events(created_at);

-- Blogs table indexes
CREATE INDEX idx_blogs_date ON blogs(date);
CREATE INDEX idx_blogs_status ON blogs(status);
CREATE INDEX idx_blogs_created_at ON blogs(created_at);

-- =====================================================
-- STEP 5: CREATE UPDATE TRIGGER FUNCTION
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
-- STEP 6: INSERT COMPREHENSIVE SAMPLE DATA
-- =====================================================

-- Insert comprehensive sample events
INSERT INTO events (
    title, event_type, organizer, category, date, time, duration, venue, location, status, image, description,
    overview, learning_description, learning_points, schedule_description, schedule,
    registration_link, registration_note,
    rating, contact_email, tags, special_notes
) VALUES 
(
    'Startup Pitch Competition 2024',
    'Competition',
    'E-Cell Team',
    'Entrepreneurship, Innovation, Startups',
    '2024-03-15',
    '10:00:00',
    '6 Hours',
    'Main Auditorium, College Campus',
    'Main Auditorium, College Campus',
    'upcoming',
    'img/gallery/protfolio-img01.png',
    'Annual competition where students present their innovative business ideas to industry experts and investors. Join us for an exciting day of entrepreneurship and innovation.',
    'This comprehensive startup pitch competition is designed to provide aspiring entrepreneurs with a platform to showcase their innovative business ideas to a panel of industry experts, successful entrepreneurs, and potential investors. The event brings together the brightest minds in entrepreneurship to compete for prizes, mentorship opportunities, and potential funding.',
    'Participants will learn how to craft compelling pitches, present their ideas confidently, handle investor questions, understand market validation techniques, and network with industry professionals and fellow entrepreneurs.',
    '["Crafting compelling business pitches", "Market validation and research techniques", "Understanding investor expectations", "Financial modeling and projections", "Presentation and public speaking skills", "Networking with industry professionals"]',
    'The event is structured to maximize learning and networking opportunities. We start with registration and networking breakfast, followed by pitch presentations, expert feedback sessions, and conclude with an awards ceremony and networking reception.',
    '["10:00 AM - Registration & Welcome Coffee", "10:30 AM - Opening Keynote: The Future of Entrepreneurship", "11:30 AM - Pitch Presentations Round 1", "12:30 PM - Expert Panel Discussion", "1:30 PM - Networking Lunch", "2:30 PM - Pitch Presentations Round 2", "3:30 PM - Investor Feedback Session", "4:00 PM - Awards Ceremony & Closing"]',
    'https://forms.google.com/startup-pitch-competition-2024',
    'Registration is required. Limited seats available. Please register early to secure your spot.',
    5,
    'events@ecell.com',
    'startup, pitch, competition, entrepreneurship, innovation, investors',
    'Participants should prepare a 5-minute pitch presentation. Laptops and projectors will be provided.'
),
(
    'Entrepreneurship Workshop Series',
    'Workshop',
    'E-Cell Team',
    'Entrepreneurship, Business Development',
    '2024-03-20',
    '14:00:00',
    '4 Hours',
    'Conference Room A, Business Center',
    'Conference Room A, Business Center',
    'upcoming',
    'img/gallery/protfolio-img02.png',
    'Comprehensive workshop series covering the fundamentals of starting and scaling a successful business. Perfect for aspiring entrepreneurs and early-stage founders.',
    'This intensive workshop series is designed to equip participants with the essential knowledge and practical skills needed to launch and scale successful ventures. Led by experienced entrepreneurs and industry experts, the workshop covers everything from idea validation to business model development.',
    'Participants will gain hands-on experience in business planning, market research, customer development, funding strategies, and growth hacking techniques that are essential for entrepreneurial success.',
    '["Business idea validation and market research", "Lean startup methodology and MVP development", "Customer discovery and development", "Business model canvas and planning", "Funding options and investor relations", "Growth strategies and scaling techniques"]',
    'The workshop is designed as an interactive learning experience with a mix of presentations, hands-on exercises, case studies, and group discussions to ensure maximum engagement and practical learning.',
    '["2:00 PM - Welcome & Introduction", "2:15 PM - Business Model Canvas Workshop", "3:15 PM - Market Validation Techniques", "4:00 PM - Coffee Break & Networking", "4:15 PM - Funding Strategies Session", "5:15 PM - Growth Hacking Workshop", "6:00 PM - Q&A and Wrap-up"]',
    'https://forms.google.com/entrepreneurship-workshop-2024',
    'Workshop includes materials, refreshments, and certificate of completion. Please bring a notebook and laptop.',
    4,
    'workshops@ecell.com',
    'workshop, entrepreneurship, business, startup, training',
    'Bring a notebook and laptop. Workshop materials will be provided.'
),
(
    'Innovation Summit 2024',
    'Conference',
    'E-Cell Team',
    'Innovation, Technology, Future Trends',
    '2024-04-05',
    '09:00:00',
    '8 Hours',
    'Grand Hall, Convention Center',
    'Grand Hall, Convention Center',
    'upcoming',
    'img/gallery/protfolio-img03.png',
    'A full-day summit featuring keynote speakers, panel discussions, and networking opportunities focused on innovation, emerging technologies, and future business trends.',
    'The Innovation Summit brings together thought leaders, innovators, and entrepreneurs to explore the latest trends in technology, business innovation, and future market opportunities. This premier event features inspiring keynotes, interactive panels, and extensive networking opportunities.',
    'Attendees will gain insights into emerging technologies, innovation frameworks, future market trends, and strategies for staying ahead in rapidly evolving industries.',
    '["Understanding emerging technology trends", "Innovation frameworks and methodologies", "Future market opportunities and disruptions", "Building innovative company cultures", "Collaboration and partnership strategies", "Scaling innovation in organizations"]',
    'The summit features a carefully curated program of keynote presentations, panel discussions, interactive workshops, and networking sessions designed to inspire and educate attendees about the future of innovation.',
    '["9:00 AM - Registration & Welcome Coffee", "9:30 AM - Opening Keynote: The Future of Innovation", "10:30 AM - Panel: Emerging Technologies", "11:30 AM - Coffee Break & Networking", "12:00 PM - Workshop: Innovation Frameworks", "1:00 PM - Networking Lunch", "2:00 PM - Keynote: Building Innovation Culture", "3:00 PM - Panel: Future Market Trends", "4:00 PM - Closing Remarks & Networking Reception"]',
    'https://forms.google.com/innovation-summit-2024',
    'Summit includes all sessions, materials, lunch, and networking reception. Professional networking event - business attire recommended.',
    5,
    'summit@ecell.com',
    'innovation, summit, technology, future, trends, conference',
    'Professional networking event. Business attire recommended.'
);

-- Insert sample blogs
INSERT INTO blogs (title, author, date, status, content, excerpt, image) VALUES 
(
    'The Future of Entrepreneurship in 2024',
    'John Doe',
    '2024-02-01',
    'published',
    'Entrepreneurship is evolving rapidly in the digital age. This comprehensive analysis explores the key trends, opportunities, and challenges that will shape the entrepreneurial landscape in 2024 and beyond. From AI-powered startups to sustainable business models, discover what it takes to succeed in tomorrow''s economy.',
    'Exploring the key trends and opportunities shaping the entrepreneurial landscape in 2024.',
    'img/blog/inner_b1.jpg'
),
(
    'Building Your First Startup: A Complete Guide',
    'Jane Smith',
    '2024-02-15',
    'published',
    'Starting your first business can be overwhelming, but with the right guidance and framework, anyone can build a successful startup. This comprehensive guide covers everything from idea validation to scaling your business, providing practical steps and real-world examples from successful entrepreneurs.',
    'A comprehensive guide covering everything from idea validation to scaling your business.',
    'img/blog/inner_b2.jpg'
);

-- =====================================================
-- STEP 7: ENABLE ROW LEVEL SECURITY
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
-- STEP 8: VERIFICATION QUERIES
-- =====================================================

-- Check events table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'events' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Count records
SELECT 'events' as table_name, COUNT(*) as record_count FROM events
UNION ALL
SELECT 'blogs' as table_name, COUNT(*) as record_count FROM blogs;

-- Show sample data
SELECT id, title, event_type, date, venue, status FROM events ORDER BY date;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================

COMMENT ON TABLE events IS 'Comprehensive events table with all advanced features';
COMMENT ON TABLE blogs IS 'Blogs table for content management';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ COMPREHENSIVE DATABASE SETUP COMPLETE!';
    RAISE NOTICE '📊 Created events table with all advanced fields';
    RAISE NOTICE '📝 Inserted sample events with full data';
    RAISE NOTICE '🔒 Enabled Row Level Security';
    RAISE NOTICE '🚀 Ready for full-featured event management!';
END $$;