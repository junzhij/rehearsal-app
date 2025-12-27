-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- Members Table
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_members_project_id ON members(project_id);

-- Lyric Lines Table
CREATE TABLE IF NOT EXISTS lyric_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    text TEXT NOT NULL,
    line_number INTEGER NOT NULL,
    timestamp_start INTEGER DEFAULT 0,
    timestamp_end INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_lyric_lines_project_id ON lyric_lines(project_id);
CREATE INDEX IF NOT EXISTS idx_lyric_lines_line_number ON lyric_lines(line_number);

-- Audio Files Table
CREATE TABLE IF NOT EXISTS audio_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    duration INTEGER NOT NULL,
    original_pitch INTEGER DEFAULT 0,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audio_files_project_id ON audio_files(project_id);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE lyric_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_files ENABLE ROW LEVEL SECURITY;

-- Policies for Projects (Allow ALL for everyone for MVP)
CREATE POLICY "Enable all access for all users on projects" ON projects FOR ALL USING (true) WITH CHECK (true);

-- Policies for Members
CREATE POLICY "Enable all access for all users on members" ON members FOR ALL USING (true) WITH CHECK (true);

-- Policies for Lyric Lines
CREATE POLICY "Enable all access for all users on lyric_lines" ON lyric_lines FOR ALL USING (true) WITH CHECK (true);

-- Policies for Audio Files
CREATE POLICY "Enable all access for all users on audio_files" ON audio_files FOR ALL USING (true) WITH CHECK (true);

-- Also Grant usage just in case
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
