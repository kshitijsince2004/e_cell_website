-- =====================================================
-- E-CELL CLEAN DATABASE SETUP
-- Fresh database creation with proper syntax
-- =====================================================

-- Drop all existing tables and views
DROP VIEW IF EXISTS published_blogs CASCADE;
DROP VIEW IF EXISTS upcoming_events CASCADE;
DROP VIEW IF EXISTS active_advertisements CASCADE;
DROP TABLE IF EXISTS advertisements CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS blogs CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS generate_slug(TEXT) CASCADE;

-- =====================================================
-- CREATE HELPER FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_slug(title_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(
                regexp_replace(title_text, '[^a-zA-Z0-9\s-]', '', 'g'),
                '\s+', '-', 'g'
            ),
            '^-+|-+$', '', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CREATE BLOGS TABLE
-- =====================================================

CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('published', 'draft')),
    image TEXT,
    image_alt TEXT,
    excerpt TEXT,
    content TEXT NOT NULL,
    slug VARCHAR(500) UNIQUE,
    meta_description TEXT,
    category VARCHAR(255),
    tags TEXT,
    view_count INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- CREATE EVENTS TABLE
-- =====================================================

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    event_type VARCHAR(100),
    organizer VARCHAR(255) DEFAULT 'E-Cell Team',
    category VARCHAR(255),
    date DATE NOT NULL,
    time TIME,
    duration VARCHAR(100),
    venue TEXT,
    location TEXT,
    status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    image TEXT,
    image_alt TEXT,
    gallery JSONB,
    description TEXT NOT NULL,
    overview TEXT,
    learning_description TEXT,
    learning_points JSONB,
    schedule_description TEXT,
    schedule JSONB,
    registration_link TEXT,
    registration_note TEXT,
    max_capacity INTEGER,
    current_registrations INTEGER DEFAULT 0,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    contact_email VARCHAR(255),
    tags TEXT,
    special_notes TEXT,
    featured BOOLEAN DEFAULT FALSE,
    slug VARCHAR(500) UNIQUE,
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREATE ADVERTISEMENTS TABLE
-- =====================================================

CREATE TABLE advertisements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    image_alt TEXT,
    event_id INTEGER REFERENCES events(id) ON DELETE SET NULL,
    external_link TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'scheduled')),
    display_type VARCHAR(50) DEFAULT 'popup' CHECK (display_type IN ('popup', 'banner', 'sidebar')),
    start_date DATE,
    end_date DATE,
    display_frequency INTEGER DEFAULT 1,
    target_pages JSONB,
    view_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREATE SETTINGS TABLE
-- =====================================================

CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    category VARCHAR(100) DEFAULT 'general',
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREATE INDEXES
-- =====================================================

-- Blogs indexes
CREATE INDEX idx_blogs_date ON blogs(date DESC);
CREATE INDEX idx_blogs_status ON blogs(status);
CREATE INDEX idx_blogs_featured ON blogs(featured);
CREATE INDEX idx_blogs_slug ON blogs(slug);
CREATE INDEX idx_blogs_category ON blogs(category);
CREATE INDEX idx_blogs_created_at ON blogs(created_at DESC);
CREATE INDEX idx_blogs_published_at ON blogs(published_at DESC);

-- Events indexes
CREATE INDEX idx_events_date ON events(date DESC);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_events_featured ON events(featured);
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_created_at ON events(created_at DESC);

-- Advertisements indexes
CREATE INDEX idx_advertisements_status ON advertisements(status);
CREATE INDEX idx_advertisements_dates ON advertisements(start_date, end_date);
CREATE INDEX idx_advertisements_event_id ON advertisements(event_id);

-- Settings indexes
CREATE INDEX idx_settings_key ON settings(setting_key);
CREATE INDEX idx_settings_category ON settings(category);
CREATE INDEX idx_settings_public ON settings(is_public);

-- =====================================================
-- CREATE TRIGGERS
-- =====================================================

CREATE TRIGGER update_blogs_updated_at 
    BEFORE UPDATE ON blogs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advertisements_updated_at 
    BEFORE UPDATE ON advertisements 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at 
    BEFORE UPDATE ON settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate blog fields
CREATE OR REPLACE FUNCTION auto_generate_blog_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug = generate_slug(NEW.title);
        WHILE EXISTS (SELECT 1 FROM blogs WHERE slug = NEW.slug AND id != COALESCE(NEW.id, 0)) LOOP
            NEW.slug = NEW.slug || '-' || extract(epoch from now())::int;
        END LOOP;
    END IF;
    
    IF NEW.status = 'published' AND (OLD IS NULL OR OLD.status != 'published' OR OLD.published_at IS NULL) THEN
        NEW.published_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_blog_fields_trigger 
    BEFORE INSERT OR UPDATE ON blogs 
    FOR EACH ROW 
    EXECUTE FUNCTION auto_generate_blog_fields();

-- Auto-generate event slugs
CREATE OR REPLACE FUNCTION auto_generate_event_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug = generate_slug(NEW.title);
        WHILE EXISTS (SELECT 1 FROM events WHERE slug = NEW.slug AND id != COALESCE(NEW.id, 0)) LOOP
            NEW.slug = NEW.slug || '-' || extract(epoch from now())::int;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_event_slug_trigger 
    BEFORE INSERT OR UPDATE ON events 
    FOR EACH ROW 
    EXECUTE FUNCTION auto_generate_event_slug();

-- =====================================================
-- INSERT DEFAULT SETTINGS
-- =====================================================

INSERT INTO settings (setting_key, setting_value, setting_type, description, category, is_public) VALUES
('google_form_enabled', 'false', 'boolean', 'Enable Google Form integration for membership', 'forms', true),
('google_form_link', '', 'string', 'Google Form link for membership registration', 'forms', true),
('global_popup_enabled', 'true', 'boolean', 'Enable global advertisement popups', 'advertisements', true),
('popup_frequency', '1', 'number', 'How often to show popups (1 = every visit)', 'advertisements', false),
('site_title', 'E-Cell NFSU TC', 'string', 'Website title', 'general', true),
('site_description', 'Entrepreneurship Cell - National Forensic Sciences University', 'string', 'Website description', 'general', true),
('contact_email', 'ecell@nfsutc.ac.in', 'string', 'Primary contact email', 'contact', true),
('contact_phone', '+91 9999882696', 'string', 'Primary contact phone', 'contact', true),
('instagram_url', 'https://www.instagram.com/ecell.nfsu.tc?igsh=Ym45bms0eTZwOHFs', 'string', 'Instagram profile URL', 'social', true),
('linkedin_url', '', 'string', 'LinkedIn profile URL', 'social', true),
('blogs_per_page', '6', 'number', 'Number of blogs to show per page', 'blog', false),
('featured_blogs_count', '3', 'number', 'Number of featured blogs on homepage', 'blog', false),
('events_per_page', '9', 'number', 'Number of events to show per page', 'events', false),
('featured_events_count', '3', 'number', 'Number of featured events on homepage', 'events', false);

-- =====================================================
-- INSERT SAMPLE DATA
-- =====================================================

INSERT INTO blogs (title, author, date, status, content, category, tags, featured, excerpt) VALUES
(
    'Welcome to E-Cell NFSU TC',
    'E-Cell Team',
    CURRENT_DATE,
    'published',
    '<h2>Welcome to Our Blog!</h2><p>This is your first blog post created with our enhanced admin panel. You can now use <strong>rich text formatting</strong>, add <em>emphasis</em>, create lists, and much more!</p><h3>Features Available:</h3><ul><li>Rich text editing with Quill.js</li><li>Image upload and management</li><li>Category and tag organization</li><li>SEO-friendly URLs</li><li>Analytics tracking</li></ul><p>Start creating amazing content for your entrepreneurship community!</p>',
    'General, Welcome',
    'welcome, blog, entrepreneurship, e-cell',
    true,
    'Welcome to the enhanced E-Cell blog with rich text editing and modern features!'
);

INSERT INTO events (title, event_type, category, date, venue, description, overview, status, featured) VALUES
(
    'Entrepreneurship Workshop 2024',
    'Workshop',
    'Entrepreneurship, Learning',
    CURRENT_DATE + INTERVAL '30 days',
    'Main Auditorium, NFSU TC',
    'Join us for an exciting workshop on entrepreneurship fundamentals and startup strategies.',
    '<p>This comprehensive workshop will cover the essential aspects of entrepreneurship, from idea generation to business execution.</p><p>Perfect for students who want to start their entrepreneurial journey!</p>',
    'upcoming',
    true
);

-- =====================================================
-- CREATE VIEWS
-- =====================================================

CREATE VIEW published_blogs AS
SELECT 
    id, title, author, date, image, image_alt, excerpt, content, 
    category, tags, view_count, featured, slug, meta_description,
    created_at, published_at
FROM blogs 
WHERE status = 'published' 
ORDER BY published_at DESC NULLS LAST;

CREATE VIEW upcoming_events AS
SELECT 
    id, title, event_type, date, time, venue, image, image_alt, description,
    featured, slug, registration_link, max_capacity, current_registrations
FROM events 
WHERE status = 'upcoming' AND date >= CURRENT_DATE
ORDER BY date ASC;

CREATE VIEW active_advertisements AS
SELECT 
    id, title, description, image_url, image_alt, event_id, external_link, 
    display_type, start_date, end_date, view_count, click_count
FROM advertisements 
WHERE status = 'active' 
    AND (start_date IS NULL OR start_date <= CURRENT_DATE)
    AND (end_date IS NULL OR end_date >= CURRENT_DATE);