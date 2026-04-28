-- Ensure RLS is enabled for tables but relaxed for demonstration/initial setup
-- Drop all existing policies that might conflict
DO $$ 
DECLARE 
    tbl record;
BEGIN
    FOR tbl IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(tbl.tablename) || ' DISABLE ROW LEVEL SECURITY;';
    END LOOP;
END $$;

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_hub ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: allow users to read all and insert/update their own
DROP POLICY IF EXISTS "Public profiles" ON user_profiles;
CREATE POLICY "Public profiles" ON user_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own profile" ON user_profiles;
CREATE POLICY "Users can manage own profile" ON user_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 2. Notes and Tasks: allow users to manage their own
DROP POLICY IF EXISTS "Users can manage own notes" ON notes;
CREATE POLICY "Users can manage own notes" ON notes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own tasks" ON tasks;
CREATE POLICY "Users can manage own tasks" ON tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. Public content: allow public read, and any authenticated user can create/edit to test it easily.
-- If you want ONLY specific emails, you must use ((auth.jwt() ->> 'email') IN ('your@email.com'))
-- For immediate fix, we allow any authenticated user to act as admin. 
DROP POLICY IF EXISTS "Public read study_hub" ON study_hub;
CREATE POLICY "Public read study_hub" ON study_hub FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage study_hub" ON study_hub;
CREATE POLICY "Admin manage study_hub" ON study_hub FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public read news_notices" ON news_notices;
CREATE POLICY "Public read news_notices" ON news_notices FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage news_notices" ON news_notices;
CREATE POLICY "Admin manage news_notices" ON news_notices FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public read notices" ON notices;
CREATE POLICY "Public read notices" ON notices FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage notices" ON notices;
CREATE POLICY "Admin manage notices" ON notices FOR ALL USING (auth.role() = 'authenticated');

-- 4. Storage Bucket constraints
INSERT INTO storage.buckets (id, name, public) VALUES ('official-assets', 'official-assets', true) ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public views official-assets" ON storage.objects;
CREATE POLICY "Public views official-assets" ON storage.objects FOR SELECT USING (bucket_id = 'official-assets');

DROP POLICY IF EXISTS "Admin manage official-assets" ON storage.objects;
CREATE POLICY "Admin manage official-assets" ON storage.objects FOR ALL USING (bucket_id = 'official-assets' AND auth.role() = 'authenticated');
