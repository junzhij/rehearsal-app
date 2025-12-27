import { supabase } from '../lib/supabase';
import { Project, LyricLine, Part, DbProject, DbLyricLine, DbMember, DbAudioFile } from '../types';

// Helper to format duration (ms -> mm:ss)
const formatDuration = (ms: number): string => {
  if (!ms) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Helper to parse duration (mm:ss -> ms)
const parseDuration = (timeStr: string): number => {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  if (parts.length === 2) {
      return (parseInt(parts[0]) * 60 + parseInt(parts[1])) * 1000;
  }
  return 0;
};

export const api = {
  getProjects: async (): Promise<Project[]> => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        members (id),
        audio_files (duration)
      `)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return data.map((p: any) => ({
      id: p.id,
      title: p.name,
      composer: p.description || 'Unknown',
      membersCount: p.members?.length || 0,
      duration: formatDuration(p.audio_files?.[0]?.duration || 0),
      updatedAt: new Date(p.updated_at).toLocaleDateString(),
      coverImage: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=2070&auto=format&fit=crop', // Default image
      lyrics: []
    }));
  },

  getProjectDetails: async (projectId: string): Promise<Project | null> => {
    // 1. Get Project info
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select(`
        *,
        audio_files (duration, file_url)
      `)
      .eq('id', projectId)
      .single();
    
    if (projectError) return null;

    // 2. Get Members
    const { data: membersData } = await supabase
      .from('members')
      .select('*')
      .eq('project_id', projectId);

    // 3. Get Lyrics
    const { data: lyricsData } = await supabase
      .from('lyric_lines')
      .select('*')
      .eq('project_id', projectId)
      .order('line_number', { ascending: true });

    // 4. Map to frontend type
    const lyrics: LyricLine[] = (lyricsData || []).map((l: DbLyricLine) => ({
      id: l.id,
      content: l.text,
      parts: [], 
      timestamp: formatDuration(l.timestamp_start),
      seconds: l.timestamp_start / 1000
    }));

    // We need to map member_id to parts.
    const membersMap = new Map(membersData?.map((m: DbMember) => [m.id, m]));
    
    const lyricsWithParts = lyrics.map((l, index) => {
        const dbLine = lyricsData![index];
        const member = membersMap.get(dbLine.member_id || '');
        
        let parts: Part[] = [];
        if (member) {
            // Use member name directly. Since Part is an enum string, we can cast or just use string[] if types allowed.
            // But types.ts defines parts as Part[].
            // For MVP, we treat custom member names as valid "Parts" by casting.
            parts = [member.name as Part];
        } else {
            // If no member assigned, empty or Tutti?
            // DB says member_id is nullable.
            parts = []; 
        }
        
        // Inject color info? Ideally LyricLine shouldn't carry color, but we can look it up in UI.
        // But the UI currently hardcodes colors in getPartColor.
        // We should probably expose members in Project to let UI lookup colors.
        return { ...l, parts };
    });

    return {
      id: projectData.id,
      title: projectData.name,
      composer: projectData.description || '',
      membersCount: membersData?.length || 0,
      duration: formatDuration(projectData.audio_files?.[0]?.duration || 0),
      updatedAt: new Date(projectData.updated_at).toLocaleDateString(),
      coverImage: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=2070&auto=format&fit=crop',
      lyrics: lyricsWithParts,
      members: membersData || [] // Expose members to frontend
    };
  },

  createProject: async (name: string, description: string): Promise<Project | null> => {
      const { data, error } = await supabase
        .from('projects')
        .insert({ name, description })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
          id: data.id,
          title: data.name,
          composer: data.description || '',
          membersCount: 0,
          duration: '0:00',
          updatedAt: new Date(data.created_at).toLocaleDateString(),
          coverImage: '',
          lyrics: []
      }
  },

  updateProjectLyrics: async (projectId: string, lyrics: LyricLine[]) => {
      // 1. Fetch members to map names back to IDs
      const { data: members } = await supabase.from('members').select('*').eq('project_id', projectId);
      // Map Part Name (or Member Name) -> Member ID
      // The UI uses Part Enum values as names for standard parts.
      // If we added custom members, we need to match them.
      const memberMap = new Map(members?.map(m => [m.name, m.id])); 

      // 2. Delete existing lyrics
      const { error: deleteError } = await supabase
        .from('lyric_lines')
        .delete()
        .eq('project_id', projectId);
      
      if (deleteError) throw deleteError;

      // 3. Prepare new lines
      const linesToInsert = lyrics.map((l, index) => {
          const partName = l.parts[0]; 
          let memberId = null;
          if (partName) {
              memberId = memberMap.get(partName) || null;
              // If member not found by name, we skip assignment (or create member? no, simpler to skip)
          }

          return {
              project_id: projectId,
              member_id: memberId,
              text: l.content,
              line_number: index,
              timestamp_start: parseDuration(l.timestamp || "0:00"),
              timestamp_end: 0
          };
      });

      if (linesToInsert.length > 0) {
        const { error: insertError } = await supabase.from('lyric_lines').insert(linesToInsert);
        if (insertError) throw insertError;
      }
  },

  addMember: async (projectId: string, name: string, color: string) => {
      const { data, error } = await supabase
          .from('members')
          .insert({ project_id: projectId, name, color })
          .select()
          .single();
      if (error) throw error;
      return data;
  },

  deleteMember: async (memberId: string) => {
      const { error } = await supabase.from('members').delete().eq('id', memberId);
      if (error) throw error;
  },

  uploadAudio: async (projectId: string, file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${projectId}/${Date.now()}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage
        .from('audio-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('audio-files')
        .getPublicUrl(fileName);
      
      return publicUrl;
  },

  saveAudioMetadata: async (projectId: string, fileName: string, fileUrl: string, duration: number) => {
      // Delete existing audio for MVP
      await supabase.from('audio_files').delete().eq('project_id', projectId);

      const { error } = await supabase.from('audio_files').insert({
          project_id: projectId,
          file_name: fileName,
          file_url: fileUrl,
          duration: duration
      });
      if (error) throw error;
  },

  getAudioUrl: async (projectId: string): Promise<string | null> => {
      const { data } = await supabase
          .from('audio_files')
          .select('file_url')
          .eq('project_id', projectId)
          .single();
      return data?.file_url || null;
  }
};
