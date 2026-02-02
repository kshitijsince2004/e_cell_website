-- Enhanced Events Table Structure for E-Cell Admin Panel
-- This SQL creates a comprehensive events table that matches the events-detail.html structure

-- IMPORTANT: Choose one of the following options:
-- Option 1: If you have an existing events table, use migrate-events-table.sql instead
-- Option 2: If this is a fresh setup, uncomment the DROP TABLE line below

-- Drop existing table if you want to recreate (CAUTION: This will delete all existing data)
-- DROP TABLE IF EXISTS events CASCADE;

-- Create the enhanced events table (for fresh installations)
CREATE TABLE IF NOT EXISTS events (
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
    registration_fee DECIMAL(10,2),
    early_bird_fee DECIMAL(10,2),
    student_fee DECIMAL(10,2),
    early_bird_deadline DATE,
    max_capacity INTEGER,
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
INSERT INTO events (
    title, event_type, category, date, time, duration, venue, description,
    overview, registration_fee, early_bird_fee, student_fee, max_capacity
) VALUES (
    'Startup Pitch Competition',
    'Competition',
    'Entrepreneurship, Innovation',
    '2024-03-15',
    '10:00:00',
    '4 Hours',
    'Main Auditorium, College Campus',
    'Annual competition where students present their innovative business ideas to industry experts and investors',
    'This comprehensive entrepreneurship workshop is designed to equip aspiring entrepreneurs with the essential skills, knowledge, and mindset needed to launch and scale successful ventures.',
    500.00,
    350.00,
    250.00,
    200
) ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS) if needed
-- ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (adjust as needed)
-- CREATE POLICY "Enable all operations for authenticated users" ON events
--     FOR ALL USING (auth.role() = 'authenticated');

COMMENT ON TABLE events IS 'Enhanced events table for E-Cell website with comprehensive event details';