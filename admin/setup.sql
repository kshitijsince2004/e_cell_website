-- Supabase Database Setup for E-Cell Admin Panel
-- Run these SQL commands in your Supabase SQL editor

-- Create blogs table
CREATE TABLE IF NOT EXISTS blogs (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
    image TEXT,
    excerpt TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time TIME,
    location VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed')),
    image TEXT,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admins table (optional - for admin user management)
CREATE TABLE IF NOT EXISTS admins (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_blogs_updated_at BEFORE UPDATE ON blogs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
INSERT INTO blogs (title, author, date, status, excerpt, content) VALUES
('Getting Started with E-Cell', 'Admin', '2025-01-29', 'published', 'Welcome to our entrepreneurship journey', 'This is the full content of our first blog post about E-Cell and entrepreneurship...'),
('Innovation Workshop Success', 'Team E-Cell', '2025-01-28', 'published', 'Our recent innovation workshop was a huge success', 'The workshop covered various aspects of innovation and startup development...');

INSERT INTO events (title, date, time, location, status, description) VALUES
('Startup Pitch Competition 2025', '2025-02-15', '10:00', 'NFSU Auditorium', 'upcoming', 'Annual startup pitch competition where students present their innovative business ideas to industry experts and investors'),
('Entrepreneurship Workshop', '2025-02-20', '14:00', 'Conference Hall A', 'upcoming', 'Interactive workshop covering business planning, market research, and startup fundamentals for aspiring entrepreneurs'),
('Industry Expert Talk', '2025-01-25', '16:00', 'Seminar Hall', 'completed', 'Guest lecture by successful entrepreneur sharing insights on startup journey and business growth strategies');

-- Row Level Security (RLS) policies
-- Enable RLS on tables
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (admins)
CREATE POLICY "Authenticated users can view blogs" ON blogs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert blogs" ON blogs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update blogs" ON blogs
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete blogs" ON blogs
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view events" ON events
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert events" ON events
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update events" ON events
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete events" ON events
    FOR DELETE USING (auth.role() = 'authenticated');

-- Public read access for published content (for the main website)
CREATE POLICY "Public can view published blogs" ON blogs
    FOR SELECT USING (status = 'published');

CREATE POLICY "Public can view events" ON events
    FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX idx_blogs_status ON blogs(status);
CREATE INDEX idx_blogs_date ON blogs(date DESC);
CREATE INDEX idx_events_date ON events(date DESC);
CREATE INDEX idx_events_status ON events(status);