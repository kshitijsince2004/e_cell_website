-- Create settings table for storing global configuration
-- Run this SQL command in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS settings (
    id BIGSERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger for updated_at
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO settings (setting_key, setting_value, description) VALUES
('google_form_join_ecell', '', 'Google Form link for Join E-Cell and Become a Member buttons'),
('google_form_enabled', 'false', 'Enable/disable Google Form redirection for Join E-Cell buttons')
ON CONFLICT (setting_key) DO NOTHING;

-- Row Level Security (RLS) policies
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (admins)
CREATE POLICY "Authenticated users can view settings" ON settings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update settings" ON settings
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Public read access for specific settings (for the main website)
CREATE POLICY "Public can view join form settings" ON settings
    FOR SELECT USING (setting_key IN ('google_form_join_ecell', 'google_form_enabled'));

-- Create index for better performance
CREATE INDEX idx_settings_key ON settings(setting_key);