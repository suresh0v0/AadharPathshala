-- 1. Create tables IF NOT EXISTS
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id UUID PRIMARY KEY,
    xp INTEGER DEFAULT 0,
    tests_completed INTEGER DEFAULT 0,
    avg_score INTEGER DEFAULT 0,
    badges TEXT[] DEFAULT '{}',
    completed_chapters TEXT[] DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS study_hub (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    text_content TEXT,
    link_url TEXT,
    youtube_id TEXT,
    marks INTEGER DEFAULT 0,
    topics TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS news_notices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    is_notice BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS notices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    text TEXT NOT NULL,
    type TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    text TEXT NOT NULL,
    done BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT,
    content TEXT,
    date TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Note: DO block used to safely drop constraints or policies before recreating them 
-- so that this script can be run multiple times safely.

DO $$ 
BEGIN
    -- user_profiles
    DROP POLICY IF EXISTS "Users can manage own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON user_profiles;
    
    -- study_hub
    DROP POLICY IF EXISTS "Public read access for study_hub" ON study_hub;
    DROP POLICY IF EXISTS "Allow authenticated insert for study_hub" ON study_hub;
    DROP POLICY IF EXISTS "Allow authenticated delete for study_hub" ON study_hub;
    
    -- news_notices
    DROP POLICY IF EXISTS "Public read access for news" ON news_notices;
    DROP POLICY IF EXISTS "Allow authenticated insert for news" ON news_notices;
    DROP POLICY IF EXISTS "Allow authenticated delete for news" ON news_notices;
    
    -- notices
    DROP POLICY IF EXISTS "Public read access for notices" ON notices;
    DROP POLICY IF EXISTS "Allow authenticated insert for notices" ON notices;
    DROP POLICY IF EXISTS "Allow authenticated delete for notices" ON notices;
    
    -- tasks
    DROP POLICY IF EXISTS "Users can manage own tasks" ON tasks;
    
    -- notes
    DROP POLICY IF EXISTS "Users can manage own notes" ON notes;
END $$;

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_hub ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- 2. Create Row Level Security (RLS) Policies
CREATE POLICY "Users can manage own profile" ON user_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Profiles are viewable by everyone" ON user_profiles FOR SELECT USING (true);

-- Usually only admins can insert, but for now we'll allow any authenticated user or specific emails
CREATE POLICY "Public read access for study_hub" ON study_hub FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert for study_hub" ON study_hub FOR INSERT WITH CHECK (auth.email() IN ('admin@aadhar.edu.np', 'subashgautam305@gmail.com', 'gopanigautam96@gmail.com'));
CREATE POLICY "Allow authenticated delete for study_hub" ON study_hub FOR DELETE USING (auth.email() IN ('admin@aadhar.edu.np', 'subashgautam305@gmail.com', 'gopanigautam96@gmail.com'));

CREATE POLICY "Public read access for news" ON news_notices FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert for news" ON news_notices FOR INSERT WITH CHECK (auth.email() IN ('admin@aadhar.edu.np', 'subashgautam305@gmail.com', 'gopanigautam96@gmail.com'));
CREATE POLICY "Allow authenticated delete for news" ON news_notices FOR DELETE USING (auth.email() IN ('admin@aadhar.edu.np', 'subashgautam305@gmail.com', 'gopanigautam96@gmail.com'));

CREATE POLICY "Public read access for notices" ON notices FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert for notices" ON notices FOR INSERT WITH CHECK (auth.email() IN ('admin@aadhar.edu.np', 'subashgautam305@gmail.com', 'gopanigautam96@gmail.com'));
CREATE POLICY "Allow authenticated delete for notices" ON notices FOR DELETE USING (auth.email() IN ('admin@aadhar.edu.np', 'subashgautam305@gmail.com', 'gopanigautam96@gmail.com'));

CREATE POLICY "Users can manage own tasks" ON tasks FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own notes" ON notes FOR ALL USING (auth.uid() = user_id);


-- 3. Create Storage Bucket for official-assets
INSERT INTO storage.buckets (id, name, public) VALUES ('official-assets', 'official-assets', true) ON CONFLICT (id) DO NOTHING;

-- 4. Storage Bucket Policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public views official-assets" ON storage.objects;
    DROP POLICY IF EXISTS "Admin inserts official-assets" ON storage.objects;
    DROP POLICY IF EXISTS "Admin deletes official-assets" ON storage.objects;
END $$;

CREATE POLICY "Public views official-assets" ON storage.objects FOR SELECT USING (bucket_id = 'official-assets');
CREATE POLICY "Admin inserts official-assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'official-assets' AND auth.email() IN ('admin@aadhar.edu.np', 'subashgautam305@gmail.com', 'gopanigautam96@gmail.com'));
CREATE POLICY "Admin deletes official-assets" ON storage.objects FOR DELETE USING (bucket_id = 'official-assets' AND auth.email() IN ('admin@aadhar.edu.np', 'subashgautam305@gmail.com', 'gopanigautam96@gmail.com'));
