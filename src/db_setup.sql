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
