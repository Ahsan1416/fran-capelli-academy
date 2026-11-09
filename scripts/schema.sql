-- Fran Capelli Academy (FCA) Complete PostgreSQL Database Schema
-- Compatible with standard PostgreSQL (pg) and embedded PostgreSQL (PGlite)

-- 1. Admin Users & Authentication
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Site-wide Global Settings (Logo, Navigation, Footer, Contact info, Socials)
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  site_name TEXT DEFAULT 'Fran Capelli Academy',
  rto_code TEXT DEFAULT '6055',
  logo_url TEXT DEFAULT '/images/fca/logo.png',
  logo_alt TEXT DEFAULT 'Fran Capelli Academy Official Logo',
  phone_melbourne TEXT DEFAULT '03 9818 0089',
  phone_adelaide TEXT DEFAULT '08 7137 1433',
  phone_general TEXT DEFAULT '08 7690 6185',
  whatsapp TEXT DEFAULT '+61 413 826 320',
  email TEXT DEFAULT 'enquiries@fca.edu.au',
  address_hawthorn TEXT DEFAULT '355 Burwood Road, Hawthorn, VIC 3122',
  address_coolaroo TEXT DEFAULT 'G01, 1510 Pascoe Vale Road, Coolaroo, VIC, 3048',
  address_mawson TEXT DEFAULT '1-3 Metro Parade, Mawson Lakes, South Australia, 5095',
  address_canberra TEXT DEFAULT 'Level 5, 15 Moore Street, Canberra City, ACT 2601',
  nav_menu TEXT NOT NULL, -- JSON array of nav items
  footer_text TEXT NOT NULL,
  social_facebook TEXT DEFAULT 'https://facebook.com/francapelli',
  social_instagram TEXT DEFAULT 'https://instagram.com/francapelli',
  social_linkedin TEXT DEFAULT 'https://linkedin.com/company/francapelli',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Homepage Config & Section Reordering / Visibility
CREATE TABLE IF NOT EXISTS homepage_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  hero_badge TEXT NOT NULL,
  hero_title TEXT NOT NULL,
  hero_subtitle TEXT NOT NULL,
  hero_image TEXT NOT NULL,
  hero_primary_btn_text TEXT NOT NULL,
  hero_primary_btn_link TEXT NOT NULL,
  hero_secondary_btn_text TEXT NOT NULL,
  hero_secondary_btn_link TEXT NOT NULL,
  featured_course_slugs TEXT NOT NULL, -- JSON array of slugs
  faqs TEXT NOT NULL, -- JSON array of { question, answer }
  section_order TEXT NOT NULL, -- JSON array: ['hero', 'stats', 'categories', 'featured_courses', 'support', 'states', 'testimonials', 'faqs', 'cta']
  section_visibility TEXT NOT NULL, -- JSON object: { hero: true, ... }
  
  -- Draft / Preview state fields
  has_draft BOOLEAN DEFAULT FALSE,
  draft_hero_badge TEXT,
  draft_hero_title TEXT,
  draft_hero_subtitle TEXT,
  draft_hero_image TEXT,
  draft_hero_primary_btn_text TEXT,
  draft_hero_primary_btn_link TEXT,
  draft_hero_secondary_btn_text TEXT,
  draft_hero_secondary_btn_link TEXT,
  draft_featured_course_slugs TEXT,
  draft_faqs TEXT,
  draft_section_order TEXT,
  draft_section_visibility TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Accredited Courses
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category_slug TEXT NOT NULL,
  category_name TEXT NOT NULL,
  duration TEXT NOT NULL,
  prerequisite TEXT NOT NULL,
  units_count TEXT NOT NULL,
  subsidised_fee TEXT,
  standard_fee TEXT,
  delivery_mode TEXT NOT NULL,
  funding_notes TEXT NOT NULL,
  career_outcomes TEXT NOT NULL, -- JSON array
  overview TEXT NOT NULL,
  featured_image TEXT NOT NULL,
  states_available TEXT NOT NULL, -- JSON array
  is_funded_sa BOOLEAN DEFAULT FALSE,
  faqs TEXT NOT NULL, -- JSON array
  
  -- Draft / Preview state
  has_draft BOOLEAN DEFAULT FALSE,
  draft_data TEXT, -- JSON string of draft fields
  status TEXT NOT NULL DEFAULT 'published',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Public Static & State Pages (VIC, WA, ACT, SA, About, Contact, Policies)
CREATE TABLE IF NOT EXISTS pages (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  hero_heading TEXT NOT NULL,
  hero_subheading TEXT,
  hero_image TEXT,
  content_html TEXT NOT NULL,
  state_code TEXT, -- VIC, WA, ACT, SA or null
  campus_address TEXT,
  phone TEXT,
  email TEXT,
  funding_info TEXT,
  seo_title TEXT,
  meta_description TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  has_draft BOOLEAN DEFAULT FALSE,
  draft_data TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Blog Posts
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  featured_image TEXT,
  image_alt_text TEXT,
  seo_title TEXT,
  meta_description TEXT,
  status TEXT NOT NULL DEFAULT 'draft', -- 'published' | 'draft'
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Local Area Pages (with Campus vs Service Area Distinction)
CREATE TABLE IF NOT EXISTS local_areas (
  id SERIAL PRIMARY KEY,
  area_name TEXT NOT NULL,
  state TEXT NOT NULL, -- 'VIC', 'SA', 'ACT', 'WA'
  slug TEXT UNIQUE NOT NULL,
  intro TEXT NOT NULL,
  relevant_courses TEXT NOT NULL, -- JSON array of course slugs
  is_real_campus BOOLEAN NOT NULL DEFAULT FALSE,
  campus_name TEXT,
  campus_address TEXT,
  delivery_info TEXT NOT NULL,
  faqs TEXT NOT NULL, -- JSON array
  featured_image TEXT,
  image_alt_text TEXT,
  seo_title TEXT,
  meta_description TEXT,
  status TEXT NOT NULL DEFAULT 'draft', -- 'published' | 'draft'
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Media Items (Persistent store metadata)
CREATE TABLE IF NOT EXISTS media_items (
  id SERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  mime_type TEXT,
  size_bytes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance indices
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_local_areas_status ON local_areas(status);
CREATE INDEX IF NOT EXISTS idx_local_areas_slug ON local_areas(slug);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
