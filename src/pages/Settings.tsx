import React, { useState, useEffect, useRef } from "react";
import { Project, LyricLine, Part, DbMember } from "../types";
import { api } from "../services/api";
import { supabase } from "../lib/supabase"; // Direct usage for simple queries not in api yet

interface SettingsProps {
  project: Project;
  onBack: () => void;
  onSave: (updatedProject: Project) => void;
}

type Tab = "AUDIO" | "LYRICS" | "MEMBERS";

export const Settings: React.FC<SettingsProps> = ({
  project,
  onBack,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>("LYRICS");
  const [lyrics, setLyrics] = useState<LyricLine[]>(project.lyrics || []);
  const [selectedLineIds, setSelectedLineIds] = useState<Set<string>>(new Set());
  const [members, setMembers] = useState<DbMember[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load initial data
  useEffect(() => {
    setLyrics(project.lyrics || []);
    setSelectedLineIds(new Set());
    loadMembers();
    loadAudio();
  }, [project]);

  const loadMembers = async () => {
      const { data } = await supabase.from('members').select('*').eq('project_id', project.id).order('order_index');
      if (data) setMembers(data);
  };

  const loadAudio = async () => {
      const url = await api.getAudioUrl(project.id);
      setAudioUrl(url);
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedLineIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedLineIds(newSet);
  };

  const assignPart = (memberId: string) => {
    if (selectedLineIds.size === 0) return;
    
    // Find member name
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    const partName = member.name as Part; 

    const updatedLyrics = lyrics.map((line) => {
      if (selectedLineIds.has(line.id)) {
        const newParts = [partName];
        return { ...line, parts: newParts };
      }
      return line;
    });

    setLyrics(updatedLyrics);
  };

  const clearAssignment = () => {
    const updatedLyrics = lyrics.map((line) => {
      if (selectedLineIds.has(line.id)) {
        return { ...line, parts: [] };
      }
      return line;
    });
    setLyrics(updatedLyrics);
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
        await api.updateProjectLyrics(project.id, lyrics);
        onSave({ ...project, lyrics });
        onBack();
    } catch (e) {
        console.error(e);
        alert("Failed to save");
    } finally {
        setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      try {
          const url = await api.uploadAudio(project.id, file);
          // For MVP, assume a default duration or 0 until we play it.
          // Or read duration from Audio element.
          // Let's just save metadata with 0 duration for now, user can update or auto-detect later.
          // Ideally we create an Audio object to read duration.
          const audio = new Audio(url);
          audio.onloadedmetadata = async () => {
             const duration = Math.floor(audio.duration * 1000);
             await api.saveAudioMetadata(project.id, file.name, url, duration);
             setAudioUrl(url);
             setUploading(false);
          };
          audio.onerror = async () => {
             await api.saveAudioMetadata(project.id, file.name, url, 0);
             setAudioUrl(url);
             setUploading(false);
          }
      } catch (err) {
          console.error(err);
          alert("Upload failed");
          setUploading(false);
      }
  };

  const handleAddMember = async () => {
      const name = prompt("Member Name:");
      if (!name) return;
      // Random color
      const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      try {
          await api.addMember(project.id, name, color);
          loadMembers();
      } catch (e) {
          alert("Failed to add member");
      }
  };

  const handleDeleteMember = async (id: string) => {
      if (!confirm("Delete member?")) return;
      try {
          await api.deleteMember(id);
          loadMembers();
      } catch (e) {
          alert("Failed to delete member");
      }
  };

  const handleLrcUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const newLyrics: LyricLine[] = [];
      const lines = text.split("\n");
      const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

      lines.forEach((line, index) => {
        const match = line.match(timeRegex);
        if (match) {
          const content = line.replace(timeRegex, "").trim();
          if (content) {
             // Basic formatting: 00:00
             const timestamp = `${match[1]}:${match[2]}`;
             newLyrics.push({
                 id: `lrc-${Date.now()}-${index}`,
                 content: content,
                 parts: [],
                 timestamp: timestamp
             });
          }
        }
      });

      if (newLyrics.length > 0) {
          if (confirm(`Parsed ${newLyrics.length} lines. Replace existing lyrics?`)) {
              setLyrics(newLyrics);
          }
      } else {
          alert("No valid LRC lyrics found.");
      }
    };
    reader.readAsText(file);
  };

  // Helper to get color classes for chips
  const getPartColor = (part: Part) => {
    // Basic mapping based on name if it matches standard parts, else default
    switch (part) {
      case Part.Soprano1: return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case Part.Soprano2: return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case Part.Alto: return "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300";
      case Part.Tenor: return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case Part.Bass: return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default: return "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300";
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111418] px-10 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-4 text-slate-900 dark:text-white">
          <div className="size-6 text-primary">
            <span className="material-symbols-outlined text-3xl">
              queue_music
            </span>
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">
            ChoirMaster
          </h2>
        </div>
        <div className="flex flex-1 justify-end gap-8">
           {/* ... kept header same ... */}
        </div>
      </header>

      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[1200px] flex-1">
            {/* Page Heading */}
            <div className="flex flex-wrap justify-between gap-3 p-4 items-end">
              <div className="flex min-w-72 flex-col gap-2">
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 text-sm text-primary font-medium hover:underline"
                >
                  <span className="material-symbols-outlined text-lg">
                    arrow_back
                  </span>
                  Back to Projects
                </button>
                <p className="text-slate-900 dark:text-white tracking-light text-[32px] font-bold leading-tight">
                  {project.title} - Setup
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">
                    schedule
                  </span>
                  Last edited just now
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handlePublish}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary text-white font-medium text-sm hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-lg">
                    publish
                  </span>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="pb-3 px-4">
              <div className="flex border-b border-slate-200 dark:border-slate-700 gap-8 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("AUDIO")}
                  className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 whitespace-nowrap px-2 transition-colors ${activeTab === "AUDIO" ? "border-b-primary text-primary" : "border-b-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
                >
                  <p className="text-sm font-bold leading-normal tracking-[0.015em]">
                    Audio Settings
                  </p>
                </button>
                <button
                   onClick={() => setActiveTab("MEMBERS")}
                   className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 whitespace-nowrap px-2 transition-colors ${activeTab === "MEMBERS" ? "border-b-primary text-primary" : "border-b-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
                >
                  <p className="text-sm font-bold leading-normal tracking-[0.015em]">
                    Member Management
                  </p>
                </button>
                <button
                   onClick={() => setActiveTab("LYRICS")}
                   className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 whitespace-nowrap px-2 transition-colors ${activeTab === "LYRICS" ? "border-b-primary text-primary" : "border-b-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
                >
                  <p className="text-sm font-bold leading-normal tracking-[0.015em]">
                    Lyrics & Assignment
                  </p>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex flex-col lg:flex-row gap-6 p-4 h-full min-h-[600px]">
                
              {activeTab === "AUDIO" && (
                  <div className="w-full bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center gap-6">
                      <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                          <span className="material-symbols-outlined text-5xl">music_note</span>
                      </div>
                      <h3 className="text-xl font-bold">Audio Track</h3>
                      
                      {audioUrl ? (
                          <div className="w-full max-w-md flex flex-col gap-4">
                              <audio controls src={audioUrl} className="w-full" />
                              <button onClick={() => fileInputRef.current?.click()} className="text-sm text-slate-500 hover:text-primary">Replace Audio</button>
                          </div>
                      ) : (
                          <div className="text-slate-500">No audio uploaded yet.</div>
                      )}

                      <input 
                        type="file" 
                        accept="audio/*" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        className="hidden" 
                      />
                      
                      {!audioUrl && (
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="bg-primary text-white px-6 py-3 rounded-lg font-bold shadow hover:bg-blue-600 transition-colors disabled:opacity-50">
                            {uploading ? "Uploading..." : "Upload Audio File"}
                        </button>
                      )}
                  </div>
              )}

              {activeTab === "MEMBERS" && (
                  <div className="w-full bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 p-8">
                      <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-bold">Project Members</h3>
                          <button onClick={handleAddMember} className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-600">
                              + Add Member
                          </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {members.map(member => (
                              <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a2129]">
                                  <div className="flex items-center gap-3">
                                      <div className="size-8 rounded-full" style={{ backgroundColor: member.color }}></div>
                                      <span className="font-bold text-slate-700 dark:text-slate-200">{member.name}</span>
                                  </div>
                                  <button onClick={() => handleDeleteMember(member.id)} className="text-slate-400 hover:text-red-500">
                                      <span className="material-symbols-outlined">delete</span>
                                  </button>
                              </div>
                          ))}
                          {members.length === 0 && (
                              <div className="col-span-full text-center py-10 text-slate-500">
                                  No members yet. Add members to assign lyrics.
                              </div>
                          )}
                      </div>
                  </div>
              )}

              {activeTab === "LYRICS" && (
              <>
              {/* LEFT COLUMN: Lyrics Editor */}
              <div className="flex-1 flex flex-col bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                {/* Editor Toolbar */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a2129]">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">
                      edit_note
                    </span>
                    Lyrics Editor
                  </h3>
                  <div className="flex gap-2">
                    <label className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer" title="Import LRC">
                        <span className="material-symbols-outlined text-[20px]">upload_file</span>
                        <input type="file" accept=".lrc" className="hidden" onChange={handleLrcUpload} />
                    </label>
                    <button
                      onClick={() => setLyrics([...lyrics, { id: `new-${Date.now()}`, content: "New Line", parts: [] }])}
                      className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title="Add Line"
                    >
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                </div>
                {/* Lyrics List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2 max-h-[700px]">
                  {/* Header Row */}
                  <div className="grid grid-cols-[auto_1fr] gap-4 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <div className="w-6"></div> {/* Checkbox spacer */}
                    <div>Line Content</div>
                  </div>
                  {/* Lines Loop */}
                  {lyrics.length === 0 ? (
                     <div className="p-8 text-center text-slate-500">No lyrics found. Add lines to begin.</div>
                  ) : lyrics.map((line) => {
                    const isSelected = selectedLineIds.has(line.id);
                    return (
                      <div
                        key={line.id}
                        className={`group flex items-start gap-4 p-3 rounded-lg transition-colors border cursor-pointer ${
                          isSelected
                            ? "bg-primary/5 border-primary/20"
                            : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                        }`}
                        onClick={() => toggleSelection(line.id)}
                      >
                        <div className="pt-1 pointer-events-none">
                          <div className={`
                            h-5 w-5 rounded border flex items-center justify-center transition-all
                            ${isSelected 
                                ? "bg-primary border-primary text-white" 
                                : "border-slate-300 dark:border-slate-600 bg-transparent text-transparent group-hover:border-primary/50"}
                          `}>
                            <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                          <div
                            className="text-slate-900 dark:text-white text-lg outline-none focus:border-b focus:border-primary border-b border-transparent"
                            contentEditable
                            suppressContentEditableWarning
                            onClick={(e) => e.stopPropagation()} // Prevent triggering row selection
                            onBlur={(e) => {
                                const content = e.currentTarget.textContent || "";
                                setLyrics(prev => prev.map(l => l.id === line.id ? {...l, content} : l))
                            }}
                          >
                            {line.content}
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {line.timestamp && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-500">
                                    {line.timestamp}
                                </span>
                            )}
                            {line.parts.map((p, idx) => (
                              <span
                                key={idx}
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPartColor(p)}`}
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div
                          className={`flex items-center transition-opacity ${
                            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                          }`}
                        >
                          <span 
                            onClick={() => {
                                // Delete line logic
                                if(confirm("Delete this line?")) {
                                    setLyrics(prev => prev.filter(l => l.id !== line.id));
                                }
                            }}
                            className="material-symbols-outlined text-slate-400 cursor-pointer hover:text-red-500">
                            delete
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT COLUMN: Assignment Tools */}
              <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
                {/* Assignment Panel */}
                <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm sticky top-24">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Assignment Tools
                    </h3>
                    <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">
                      {selectedLineIds.size} Selected
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 uppercase font-semibold tracking-wider">
                    Assign to Member
                  </p>
                  {/* Member/Part Chips */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {members.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => assignPart(member.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a2129] transition-colors group hover:bg-slate-100`}
                      >
                        <div className="size-2 rounded-full" style={{ backgroundColor: member.color }}></div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {member.name}
                        </span>
                      </button>
                    ))}
                    {members.length === 0 && (
                        <div className="text-xs text-slate-400">No members available. Go to Member Management to add.</div>
                    )}
                  </div>
                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={clearAssignment}
                      className="w-full flex items-center justify-center gap-2 bg-transparent border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium py-2.5 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">
                        backspace
                      </span>
                      Clear Assignment
                    </button>
                  </div>
                </div>
              </div>
              </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
