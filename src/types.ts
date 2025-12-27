export interface DbProject {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbMember {
  id: string;
  project_id: string;
  name: string;
  color: string;
  order_index: number;
  created_at: string;
}

export interface DbLyricLine {
  id: string;
  project_id: string;
  member_id: string | null;
  text: string;
  line_number: number;
  timestamp_start: number;
  timestamp_end: number;
  created_at: string;
}

export interface DbAudioFile {
  id: string;
  project_id: string;
  file_name: string;
  file_url: string;
  duration: number;
  original_pitch: number;
  uploaded_at: string;
}

export enum Part {
  Soprano1 = "Soprano 1",
  Soprano2 = "Soprano 2",
  Alto = "Alto",
  Tenor = "Tenor",
  Bass = "Bass",
  Tutti = "Tutti (All)",
}

export interface LyricLine {
  id: string;
  content: string;
  parts: Part[]; // Which parts sing this line
  timestamp?: string; // "00:38"
  seconds?: number; // for playback simulation logic
}

export interface Project {
  id: string;
  title: string;
  composer: string;
  membersCount: number;
  duration: string;
  updatedAt: string;
  coverImage: string;
  lyrics: LyricLine[];
}

export type ViewState = 'DASHBOARD' | 'SETTINGS' | 'REHEARSAL';
