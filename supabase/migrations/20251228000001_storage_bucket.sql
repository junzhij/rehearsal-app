-- Create a storage bucket for audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-files', 'audio-files', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public access to audio files
-- Note: storage.objects RLS is enabled by default. We need to add policies.

CREATE POLICY "Give public access to audio-files bucket" ON storage.objects FOR SELECT USING (bucket_id = 'audio-files');

CREATE POLICY "Give public upload access to audio-files bucket" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'audio-files');

CREATE POLICY "Give public update access to audio-files bucket" ON storage.objects FOR UPDATE USING (bucket_id = 'audio-files');

CREATE POLICY "Give public delete access to audio-files bucket" ON storage.objects FOR DELETE USING (bucket_id = 'audio-files');
