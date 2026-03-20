-- Senior Residences Database Schema
-- Optimized for Cloudflare D1 (SQLite-based)

CREATE TABLE IF NOT EXISTS senior_residences (
    id TEXT PRIMARY KEY NOT NULL,
    source_id TEXT,
    source TEXT,
    
    -- Basic Information
    name TEXT NOT NULL,
    name_local TEXT,
    facility_type TEXT,
    description TEXT,
    
    -- Address
    street TEXT,
    house_number TEXT,
    city TEXT,
    postal_code TEXT,
    region TEXT,
    country TEXT,
    country_code TEXT,
    full_address TEXT,
    
    -- Geolocation
    lat REAL,
    lon REAL,
    geo_accuracy TEXT,
    
    -- Contact Information
    phone TEXT,
    phone_2 TEXT,
    fax TEXT,
    email TEXT,
    website TEXT,
    
    -- Capacity
    capacity INTEGER,
    beds INTEGER,
    
    -- Operator
    operator TEXT,
    operator_type TEXT,
    founded_year INTEGER,
    
    -- Services
    specializations TEXT,
    opening_hours TEXT,
    is_24h INTEGER DEFAULT 0,
    
    -- Ratings
    rating REAL,
    rating_count INTEGER,
    rating_source TEXT,
    
    -- Regulatory
    license_number TEXT,
    accreditation TEXT,
    inspection_date TEXT,
    quality_score TEXT,
    regulatory_body TEXT,
    
    -- Pricing
    price_min REAL,
    price_max REAL,
    price_currency TEXT,
    
    -- Additional
    amenities TEXT,
    languages TEXT,
    tags TEXT,
    
    -- Media
    image_url TEXT,
    image_urls TEXT,
    
    -- Metadata
    data_source_url TEXT,
    scraped_at TEXT,
    updated_at TEXT,
    last_verified TEXT,
    is_verified INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    is_duplicate INTEGER DEFAULT 0,
    duplicate_of TEXT,
    raw_data TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_country_code ON senior_residences(country_code);
CREATE INDEX IF NOT EXISTS idx_city ON senior_residences(city);
CREATE INDEX IF NOT EXISTS idx_facility_type ON senior_residences(facility_type);
CREATE INDEX IF NOT EXISTS idx_country_city ON senior_residences(country_code, city);
CREATE INDEX IF NOT EXISTS idx_lat_lon ON senior_residences(lat, lon);
CREATE INDEX IF NOT EXISTS idx_source ON senior_residences(source);
CREATE INDEX IF NOT EXISTS idx_is_active ON senior_residences(is_active);

-- Scraping Logs
CREATE TABLE IF NOT EXISTS scraping_logs (
    id TEXT PRIMARY KEY NOT NULL,
    source TEXT,
    started_at TEXT,
    finished_at TEXT,
    status TEXT,
    records_new INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_skipped INTEGER DEFAULT 0,
    records_error INTEGER DEFAULT 0,
    error_message TEXT,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_scraping_source ON scraping_logs(source);
CREATE INDEX IF NOT EXISTS idx_scraping_started ON scraping_logs(started_at);

-- Countries Reference Table
CREATE TABLE IF NOT EXISTS countries (
    code TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    name_local TEXT,
    lang TEXT,
    priority INTEGER DEFAULT 3,
    total_residences INTEGER DEFAULT 0
);

-- Insert European Countries
INSERT OR REPLACE INTO countries (code, name, name_local, lang, priority) VALUES
    ('DE', 'Deutschland', 'Deutschland', 'de', 1),
    ('FR', 'Frankreich', 'France', 'fr', 1),
    ('GB', 'Großbritannien', 'United Kingdom', 'en', 1),
    ('IT', 'Italien', 'Italia', 'it', 1),
    ('ES', 'Spanien', 'España', 'es', 1),
    ('NL', 'Niederlande', 'Nederland', 'nl', 1),
    ('BE', 'Belgien', 'Belgique/België', 'nl', 1),
    ('CH', 'Schweiz', 'Schweiz/Suisse', 'de', 1),
    ('AT', 'Österreich', 'Österreich', 'de', 1),
    ('SE', 'Schweden', 'Sverige', 'sv', 2),
    ('NO', 'Norwegen', 'Norge', 'no', 2),
    ('DK', 'Dänemark', 'Danmark', 'da', 2),
    ('FI', 'Finnland', 'Suomi', 'fi', 2),
    ('PL', 'Polen', 'Polska', 'pl', 2),
    ('CZ', 'Tschechien', 'Česko', 'cs', 2),
    ('HU', 'Ungarn', 'Magyarország', 'hu', 2),
    ('RO', 'Rumänien', 'România', 'ro', 2),
    ('PT', 'Portugal', 'Portugal', 'pt', 2),
    ('GR', 'Griechenland', 'Ελλάδα', 'el', 3),
    ('IE', 'Irland', 'Ireland', 'en', 3),
    ('HR', 'Kroatien', 'Hrvatska', 'hr', 3),
    ('BG', 'Bulgarien', 'България', 'bg', 3),
    ('LU', 'Luxemburg', 'Luxembourg', 'fr', 3),
    ('SK', 'Slowakei', 'Slovensko', 'sk', 3),
    ('SI', 'Slowenien', 'Slovenija', 'sl', 3),
    ('LT', 'Litauen', 'Lietuva', 'lt', 3),
    ('LV', 'Lettland', 'Latvija', 'lv', 3),
    ('EE', 'Estland', 'Eesti', 'et', 3);
