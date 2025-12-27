import React, { useState, useEffect, useRef } from "react";
import * as Tone from "tone";
import { Project, Part } from "../types";
import { api } from "../services/api";

interface RehearsalProps {
  project: Project;
  onBack: () => void;
  onSettings: () => void;
}

export const Rehearsal: React.FC<RehearsalProps> = ({ project, onBack, onSettings }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [pitch, setPitch] = useState(0);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [filterMode, setFilterMode] = useState<"ALL" | "MY_PART">("MY_PART");
  const [selectedRole, setSelectedRole] = useState<string>("All");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Determine roles available in this song
  const availableRoles = Array.from(new Set(project.lyrics.flatMap(l => l.parts))).sort();
  const [isLoaded, setIsLoaded] = useState(false);

  const playerRef = useRef<Tone.Player | null>(null);
  const pitchShiftRef = useRef<Tone.PitchShift | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);

  // Load Audio URL
  useEffect(() => {
      api.getAudioUrl(project.id).then(url => {
          setAudioUrl(url);
      });
  }, [project.id]);

  // Setup Tone.js
  useEffect(() => {
      if (!audioUrl) return;

      const setupAudio = async () => {
          setIsLoaded(false);
          const player = new Tone.Player(audioUrl).toDestination();
          // PitchShift
          const pitchShift = new Tone.PitchShift(0).toDestination();
          player.disconnect();
          player.connect(pitchShift);
          
          await player.loaded;
          
          playerRef.current = player;
          pitchShiftRef.current = pitchShift;
          setIsLoaded(true);
      };

      setupAudio();

      return () => {
          playerRef.current?.dispose();
          pitchShiftRef.current?.dispose();
      };
  }, [audioUrl]);

  // Handle Pitch Change
  useEffect(() => {
      if (pitchShiftRef.current) {
          pitchShiftRef.current.pitch = pitch;
      }
  }, [pitch]);

  // Playback Logic
  const togglePlay = async () => {
      if (!isLoaded || !playerRef.current) return;

      if (isPlaying) {
          // Pause
          playerRef.current.stop();
          pausedAtRef.current = currentSeconds;
          setIsPlaying(false);
      } else {
          // Play
          await Tone.start();
          playerRef.current.start(undefined, pausedAtRef.current);
          startTimeRef.current = Tone.now() - pausedAtRef.current;
          setIsPlaying(true);
      }
  };

  // Time Sync Loop
  useEffect(() => {
      let animationFrame: number;

      const updateTime = () => {
          if (isPlaying && playerRef.current) {
              // Calculate time based on Tone.now()
              const now = Tone.now();
              const elapsed = now - startTimeRef.current;
              
              if (elapsed >= (playerRef.current.buffer.duration || 0)) {
                  setIsPlaying(false);
                  pausedAtRef.current = 0;
                  setCurrentSeconds(0);
              } else {
                  setCurrentSeconds(elapsed);
                  animationFrame = requestAnimationFrame(updateTime);
              }
          }
      };

      if (isPlaying) {
          animationFrame = requestAnimationFrame(updateTime);
      }

      return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const time = parseFloat(e.target.value);
      setCurrentSeconds(time);
      pausedAtRef.current = time;
      startTimeRef.current = Tone.now() - time;
      
      if (isPlaying && playerRef.current) {
          playerRef.current.stop();
          playerRef.current.start(undefined, time);
      }
  };

  const formatTime = (totalSeconds: number) => {
    const min = Math.floor(totalSeconds / 60);
    const sec = Math.floor(totalSeconds % 60);
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // Determine current active line based on timestamp
  const activeLineIndex = project.lyrics.reduce((closestIdx, line, idx) => {
    if (!line.seconds) return closestIdx;
    if (line.seconds <= currentSeconds && (closestIdx === -1 || line.seconds > (project.lyrics[closestIdx].seconds || 0))) {
      return idx;
    }
    return closestIdx;
  }, -1);
  
  // Auto-scroll to active line
  useEffect(() => {
      if (activeLineIndex !== -1) {
          const el = document.getElementById(`line-${activeLineIndex}`);
          if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
      }
  }, [activeLineIndex]);

  const getPartColor = (part: Part) => {
     // Use dynamic colors from project members if available
     if (project.members) {
         const member = project.members.find(m => m.name === part);
         if (member) {
             // Tailwind arbitrary values are tricky dynamically.
             // We can use style attribute for exact colors, but existing logic splits classes.
             // "text-purple-500 bg-purple-500/20 bg-purple-500" -> [text, bg-opacity, bg-bar]
             // We need to return a string format that our component parses.
             // But our component expects Tailwind classes currently.
             // Let's refactor the component to use style={{}} for colors instead of class names where possible.
             // Or return a special marker to indicate custom color.
             return `custom|${member.color}`;
         }
     }

     if (part === Part.Tenor) return "text-purple-500 bg-purple-500/20 bg-purple-500";
     if (part === Part.Soprano1) return "text-emerald-500 bg-emerald-500/20 bg-emerald-500";
     if (part === Part.Alto) return "text-primary bg-primary/20 bg-primary"; 
     if (part === Part.Bass) return "text-orange-500 bg-orange-500/20 bg-orange-500";
     return "text-slate-500 bg-slate-500/20 bg-slate-400";
  };
  
  const getAvatar = (part: Part) => {
      return part.substring(0, 2).toUpperCase();
  }

  // Duration in seconds
  const durationSec = playerRef.current?.buffer.duration || parseDuration(project.duration);

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased overflow-hidden h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="flex-none flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e5e7eb] dark:border-[#283039] bg-white dark:bg-[#111418] px-6 py-3 z-20">
        <div className="flex items-center gap-4 text-slate-900 dark:text-white cursor-pointer" onClick={onBack}>
          <div className="size-8 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
            <span className="material-symbols-outlined">queue_music</span>
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">
            Choir Master
          </h2>
        </div>
        <div className="flex flex-1 justify-end gap-4">
          <button onClick={onSettings} className="flex items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-slate-100 dark:bg-[#283039] hover:bg-slate-200 dark:hover:bg-[#3b4754] text-slate-900 dark:text-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">
              settings
            </span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full h-full">
          {/* Song Header Info */}
          <div className="flex-none px-6 pt-6 pb-2">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                {project.title}
              </h1>
              <div className="flex items-center gap-2 text-slate-500 dark:text-[#9dabb9] text-sm font-medium">
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                  Rehearsal
                </span>
              </div>
            </div>
          </div>

          {/* Sticky Audio Controls Section */}
          <div className="flex-none px-6 py-4 z-10">
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-[#283039] shadow-sm p-4 flex flex-col gap-4">
              {/* Progress Bar */}
              <div className="w-full flex flex-col gap-2">
                <div className="flex w-full items-center justify-between px-1">
                  <p className="text-slate-900 dark:text-white text-sm font-medium font-mono">
                    {formatTime(currentSeconds)}
                  </p>
                  <p className="text-slate-500 dark:text-[#9dabb9] text-xs font-medium uppercase tracking-wide">
                    Line {activeLineIndex + 1}
                  </p>
                  <p className="text-slate-500 dark:text-[#9dabb9] text-sm font-medium font-mono">
                    {project.duration}
                  </p>
                </div>
                <div className="group relative flex h-6 w-full items-center cursor-pointer">
                  {/* Native Range Input for seeking */}
                  <input 
                    type="range" 
                    min={0} 
                    max={durationSec || 100} // Avoid 0 max
                    value={currentSeconds} 
                    onChange={handleSeek}
                    className="absolute z-10 w-full opacity-0 cursor-pointer h-full"
                  />
                  
                  <div className="absolute h-1.5 w-full rounded-full bg-slate-200 dark:bg-[#3b4754]"></div>
                  <div
                    className="absolute h-1.5 rounded-full bg-primary"
                    style={{ width: `${Math.min((currentSeconds / (durationSec || 1)) * 100, 100)}%` }} 
                  ></div>
                  <div
                    className="absolute h-4 w-4 rounded-full bg-white shadow-md border border-slate-200 dark:border-none transform -translate-x-1/2 group-hover:scale-100 transition-transform duration-100"
                     style={{ left: `${Math.min((currentSeconds / (durationSec || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              {/* Controls Row */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Playback Buttons */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setCurrentSeconds(0);
                      pausedAtRef.current = 0;
                      startTimeRef.current = Tone.now();
                      if (isPlaying && playerRef.current) {
                        playerRef.current.stop();
                        playerRef.current.start(undefined, 0);
                      }
                    }}
                    className="p-2 rounded-full text-slate-500 hover:text-primary hover:bg-primary/10 dark:text-[#9dabb9] dark:hover:text-primary transition-all">
                    <span className="material-symbols-outlined text-[28px]">
                      skip_previous
                    </span>
                  </button>
                  <button 
                    onClick={togglePlay}
                    disabled={!isLoaded}
                    className={`flex items-center justify-center h-12 w-12 rounded-full bg-primary text-white hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/30 ${!isLoaded ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {isLoaded ? (
                        <span className="material-symbols-outlined text-[32px] fill-1">
                        {isPlaying ? 'pause' : 'play_arrow'}
                        </span>
                    ) : (
                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    )}
                  </button>
                  <button 
                    onClick={() => {
                        // Skip forward 5s (optional, or just disable)
                        // For now keep it as "Skip Next" visual but maybe no-op or just +5s
                        const newTime = Math.min(currentSeconds + 5, durationSec);
                        setCurrentSeconds(newTime);
                        pausedAtRef.current = newTime;
                        startTimeRef.current = Tone.now() - newTime;
                        if (isPlaying && playerRef.current) {
                            playerRef.current.stop();
                            playerRef.current.start(undefined, newTime);
                        }
                    }}
                    className="p-2 rounded-full text-slate-500 hover:text-primary hover:bg-primary/10 dark:text-[#9dabb9] dark:hover:text-primary transition-all">
                    <span className="material-symbols-outlined text-[28px]">
                      skip_next
                    </span>
                  </button>
                </div>
                {/* Pitch Controls */}
                <div className="flex items-center bg-slate-100 dark:bg-[#283039] rounded-lg p-1">
                  <button 
                    onClick={() => setPitch(p => p - 1)}
                    className="h-9 w-10 flex items-center justify-center rounded hover:bg-white dark:hover:bg-[#3b4754] text-slate-900 dark:text-white transition-colors">
                    <span className="material-symbols-outlined text-[20px]">
                      remove
                    </span>
                  </button>
                  <div className="h-9 px-3 flex items-center justify-center min-w-[90px] text-sm font-bold border-x border-slate-200 dark:border-[#3b4754]">
                    Pitch: {pitch > 0 ? `+${pitch}` : pitch}
                  </div>
                  <button 
                    onClick={() => setPitch(p => p + 1)}
                    className="h-9 w-10 flex items-center justify-center rounded hover:bg-white dark:hover:bg-[#3b4754] text-slate-900 dark:text-white transition-colors">
                    <span className="material-symbols-outlined text-[20px]">
                      add
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* View Controls */}
          <div className="flex-none px-6 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-[#283039] pb-4">
              {/* Toggle Switch */}
              <div className="inline-flex bg-slate-100 dark:bg-[#283039] p-1 rounded-lg">
                <button 
                    onClick={() => setFilterMode("ALL")}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filterMode === "ALL" ? 'bg-white dark:bg-[#3b4754] text-primary shadow-sm font-bold' : 'text-slate-500 dark:text-[#9dabb9] hover:text-slate-900 dark:hover:text-white'}`}>
                  All Lyrics
                </button>
                <button 
                    onClick={() => setFilterMode("MY_PART")}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filterMode === "MY_PART" ? 'bg-white dark:bg-[#3b4754] text-primary shadow-sm font-bold' : 'text-slate-500 dark:text-[#9dabb9] hover:text-slate-900 dark:hover:text-white'}`}>
                  My Part
                </button>
              </div>
              {/* Member Selection */}
              <div className="relative group">
                <select 
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="appearance-none flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-[#283039] hover:bg-slate-200 dark:hover:bg-[#3b4754] rounded-lg text-sm font-medium transition-colors text-slate-900 dark:text-white font-bold cursor-pointer pr-8 outline-none focus:ring-2 focus:ring-primary/50"
                >
                    <option value="All">All Roles</option>
                    {availableRoles.map(role => (
                        <option key={role} value={role}>{role}</option>
                    ))}
                </select>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-slate-500 pointer-events-none">
                    expand_more
                </span>
              </div>
            </div>
          </div>

          {/* Lyrics Scroll Area */}
          <div className="flex-1 overflow-y-auto px-6 pb-20 lyric-scroll-container scroll-smooth">
            <div className="flex flex-col gap-3 py-10">
              {project.lyrics.length === 0 ? (
                  <div className="text-center text-slate-500 py-10">No lyrics available. Go to settings to add lyrics.</div>
              ) : project.lyrics.map((line, idx) => {
                 const isActive = idx === activeLineIndex;
                 const isPast = idx < activeLineIndex;
                 // Filtering logic
                 const isMyPart = filterMode === "MY_PART" ? (
                     selectedRole === "All" ? true : (line.parts.includes(selectedRole as Part) || line.parts.includes(Part.Tutti))
                 ) : true;
                 // If filtered out, we can hide or dim. Let's dim heavily.
                 const isHidden = !isMyPart;

                 if (isHidden) return null; // Or return simplified view
                 
                 const primaryPart = line.parts[0] || Part.Tutti;
                 
                 // Handle Color Logic
                 const colorData = getPartColor(primaryPart);
                 let textColorClass = "", badgeBgClass = "", barBgClass = "";
                 let customColor = null;

                 if (colorData.startsWith("custom|")) {
                     customColor = colorData.split("|")[1];
                 } else {
                     const parts = colorData.split(' ');
                     textColorClass = parts[0];
                     badgeBgClass = parts[1];
                     barBgClass = parts[2];
                 }

                 const avatar = getAvatar(primaryPart);

                 // Dynamic Styles based on Active State
                 let containerClass = "";
                 if (isActive) {
                     containerClass = "bg-primary/5 dark:bg-primary/10 border border-primary/20 shadow-lg shadow-primary/5 transform scale-[1.01] ring-1 ring-primary/30";
                 } else {
                     containerClass = "bg-slate-50 dark:bg-[#18212b] border border-transparent hover:bg-slate-100 dark:hover:bg-surface-dark-hover";
                     if (isPast) containerClass += " opacity-60 hover:opacity-100";
                 }

                 return (
                    <div 
                        key={line.id}
                        id={`line-${idx}`}
                        onClick={() => {
                            // Seek to line timestamp
                            if (line.seconds !== undefined) {
                                setCurrentSeconds(line.seconds);
                                pausedAtRef.current = line.seconds;
                                startTimeRef.current = Tone.now() - line.seconds;
                                if (isPlaying && playerRef.current) {
                                    playerRef.current.stop();
                                    playerRef.current.start(undefined, line.seconds);
                                }
                            }
                        }}
                        className={`flex items-stretch gap-4 p-4 md:p-5 rounded-xl transition-all cursor-pointer ${containerClass}`}
                    >
                        <div 
                            className={`w-1.5 rounded-full self-stretch ${isActive ? 'shadow-[0_0_10px_rgba(19,127,236,0.6)]' : ''} ${!customColor ? barBgClass : ''}`}
                            style={isActive ? { backgroundColor: '#137FEC' } : (customColor ? { backgroundColor: customColor } : {})}
                        ></div>
                        <div className="flex flex-col gap-1 w-full">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div 
                                        className={`size-6 rounded-full flex items-center justify-center text-xs font-bold ${isActive ? 'bg-primary text-white' : ''} ${!customColor && !isActive ? `${badgeBgClass} ${textColorClass}` : ''}`}
                                        style={!isActive && customColor ? { backgroundColor: `${customColor}33`, color: customColor } : {}}
                                    >
                                        {avatar}
                                    </div>
                                    <span 
                                        className={`text-xs uppercase tracking-wide ${isActive ? 'font-bold text-primary' : 'font-semibold'}`}
                                        style={!isActive && customColor ? { color: customColor } : {}}
                                    >
                                        {primaryPart === Part.Alto && isActive ? "Alto (You)" : primaryPart}
                                    </span>
                                </div>
                                <span className={`text-xs font-mono ${isActive ? 'text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded' : 'text-slate-400'}`}>
                                    {line.timestamp}
                                </span>
                            </div>
                            <p className={`text-lg md:text-xl md:text-2xl transition-colors ${isActive ? 'font-bold text-slate-900 dark:text-white leading-snug' : 'font-medium text-slate-600 dark:text-[#9dabb9]'}`}>
                                {line.content}
                            </p>
                        </div>
                        {isActive && (
                            <div className="self-center opacity-0 group-hover:opacity-100 md:opacity-100 hidden sm:block">
                                <span className="material-symbols-outlined text-primary">equalizer</span>
                            </div>
                        )}
                    </div>
                 )
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Helper need to be duplicated or imported
const parseDuration = (timeStr: string): number => {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  if (parts.length === 2) {
      return (parseInt(parts[0]) * 60 + parseInt(parts[1])); // return seconds here
  }
  return 0;
};
