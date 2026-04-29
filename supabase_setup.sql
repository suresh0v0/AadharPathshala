-- ═════════════════════════════════════════════════════════════════════
-- SUPABASE DATABASE SETUP FOR AADHAR PATHSHALA
-- ═════════════════════════════════════════════════════════════════════

-- 1. EXTENSIONS
-- Required for uuid generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES

-- A. NOTES TABLE (User specific)
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT,
    content TEXT,
    date TEXT,
    category TEXT DEFAULT 'General',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- B. STUDY HUB TABLE (Admin managed materials)
CREATE TABLE IF NOT EXISTS public.study_hub (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    type TEXT NOT NULL, -- chapter, video, note, mcq, model_question, etc.
    description TEXT,
    link_url TEXT,
    text_content TEXT,
    youtube_id TEXT,
    file_url TEXT,
    marks INTEGER DEFAULT 0,
    topics TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- C. NEWS & BROADCASTS TABLE
CREATE TABLE IF NOT EXISTS public.news_notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    image_url TEXT,
    is_notice BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- D. LIVE NOTICES (Banner)
CREATE TABLE IF NOT EXISTS public.notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- info, alert, update
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- E. USER PROFILES (Stats and Progress)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    xp INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 1,
    badges TEXT[] DEFAULT '{}',
    tests_completed INTEGER DEFAULT 0,
    avg_score REAL DEFAULT 0,
    completed_chapters TEXT[] DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ADMIN CHECK FUNCTION
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS boolean AS $$
BEGIN
  RETURN (
    LOWER(auth.jwt() ->> 'email') IN ('admin@aadhar.edu.np', 'subashgautam305@gmail.com', 'gopanigautam96@gmail.com') OR
    LOWER(auth.jwt() ->> 'email') LIKE '%ashish%'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. ROW LEVEL SECURITY (RLS) policies

-- Enable RLS on all tables
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_hub ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Note Policies: Users can only see/edit their own notes
CREATE POLICY "Users can view their own notes" ON public.notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own notes" ON public.notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes" ON public.notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notes" ON public.notes FOR DELETE USING (auth.uid() = user_id);

-- Study Hub Policies: Everyone can read, Only admins can write
CREATE POLICY "Everyone can view study hub" ON public.study_hub FOR SELECT USING (true);
CREATE POLICY "Admins can manage study hub" ON public.study_hub FOR ALL USING (is_admin());

-- News Policies: Everyone can read, Only admins can write
CREATE POLICY "Everyone can view news" ON public.news_notices FOR SELECT USING (true);
CREATE POLICY "Admins can manage news" ON public.news_notices FOR ALL USING (is_admin());

-- Notice Policies: Everyone can read, Only admins can write
CREATE POLICY "Everyone can view notices" ON public.notices FOR SELECT USING (true);
CREATE POLICY "Admins can manage notices" ON public.notices FOR ALL USING (is_admin());

-- User Profile Policies: Users can view/update their own profile
CREATE POLICY "Users can view their own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR ALL USING (auth.uid() = user_id);

-- 5. STORAGE BUCKET SETUP
-- Ensure the 'official-assets' bucket exists in the Supabase UI
-- Then run these policies (replace 'official-assets' with your bucket name if different)

-- Allow public access to read files
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'official-assets');

-- Allow admins to upload/delete files
-- CREATE POLICY "Admins can upload files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'official-assets' AND is_admin());
-- CREATE POLICY "Admins can delete files" ON storage.objects FOR DELETE USING (bucket_id = 'official-assets' AND is_admin());
