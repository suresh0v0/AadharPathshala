-- db_setup.sql
-- Simply copy and paste the following SQL commands into your Supabase SQL Editor and hit "RUN".

-- ==========================================
-- 1. Create the `notes` table
-- ==========================================
CREATE TABLE notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for notes
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Policies for notes
CREATE POLICY "Users can insert their own notes"
ON notes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own notes"
ON notes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
ON notes FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
ON notes FOR DELETE
USING (auth.uid() = user_id);


-- ==========================================
-- 2. Create the `tasks` table
-- ==========================================
CREATE TABLE tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    done BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policies for tasks
CREATE POLICY "Users can insert their own tasks"
ON tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tasks"
ON tasks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
ON tasks FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
ON tasks FOR DELETE
USING (auth.uid() = user_id);

-- ==========================================
-- 3. Create the `user_profiles` table
-- ==========================================
CREATE TABLE user_profiles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    xp INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    tests_completed INTEGER DEFAULT 0,
    avg_score FLOAT DEFAULT 0,
    badges TEXT[] DEFAULT '{}',
    completed_chapters TEXT[] DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view their own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert their own profile"
ON user_profiles FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 4. Create the `study_hub` table
-- ==========================================
CREATE TABLE study_hub (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    type TEXT NOT NULL, -- 'note', 'video', 'pdf', 'mcq'
    description TEXT,
    link_url TEXT,
    text_content TEXT,
    youtube_id TEXT,
    file_url TEXT,
    marks INTEGER DEFAULT 0,
    topics TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE study_hub ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Access" ON study_hub FOR SELECT USING (true);
CREATE POLICY "Admin All Access" ON study_hub FOR ALL USING (true); -- Securing this normally requires checking auth.email or a role

-- ==========================================
-- 5. Create the `news_notices` table
-- ==========================================
CREATE TABLE news_notices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    image_url TEXT,
    is_notice BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE news_notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Access" ON news_notices FOR SELECT USING (true);
CREATE POLICY "Admin All Access" ON news_notices FOR ALL USING (true);

-- ==========================================
-- 6. Create the `notices` table
-- ==========================================
CREATE TABLE notices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    text TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- 'info', 'alert', 'update'
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Access" ON notices FOR SELECT USING (true);
CREATE POLICY "Admin All Access" ON notices FOR ALL USING (true);

-- ==========================================
-- 7. Storage Bucket Setup
-- ==========================================
-- Manually create a bucket named 'official-assets' in the Supabase Dashboard
-- Set it to "Public" so urls are accessible.
