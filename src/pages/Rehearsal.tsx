import React, { useState, useEffect, useRef } from "react";
import { Project, Part } from "../types";

interface RehearsalProps {
  project: Project;
  onBack: () => void;
  onSettings: () => void;
}

export const Rehearsal: React.FC<RehearsalProps> = ({ project, onBack, onSettings }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [pitch, setPitch] = useState(0);
  const [currentSeconds, setCurrentSeconds] = useState(45); // Start at 0:45 for demo
  const [filterMode, setFilterMode] = useState<"ALL" | "MY_PART">("MY_PART");
  const [selectedRole, setSelectedRole] = useState<Part>(Part.Alto);
  
  // Simulation logic
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatTime = (totalSeconds: number) => {
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // Determine current active line based on timestamp
  // In a real app, this would be more complex range checking.
  // Here we just find the line closest to current time without going over.
  const activeLineIndex = project.lyrics.reduce((closestIdx, line, idx) => {
    if (!line.seconds) return closestIdx;
    if (line.seconds <= currentSeconds && (closestIdx === -1 || line.seconds > (project.lyrics[closestIdx].seconds || 0))) {
      return idx;
    }
    return closestIdx;
  }, -1);

  const getPartColor = (part: Part) => {
     // Use colors from screenshots
     if (part === Part.Tenor) return "text-purple-500 bg-purple-500/20 bg-purple-500";
     if (part === Part.Soprano1) return "text-emerald-500 bg-emerald-500/20 bg-emerald-500";
     if (part === Part.Alto) return "text-primary bg-primary/20 bg-primary"; // Alto is 'ME' in demo
     if (part === Part.Bass) return "text-orange-500 bg-orange-500/20 bg-orange-500";
     return "text-slate-500 bg-slate-500/20 bg-slate-400";
  };
  
  const getAvatar = (part: Part) => {
    if (part === Part.Tenor) return "JD";
    if (part === Part.Soprano1) return "AL";
    if (part === Part.Alto) return "ME";
    if (part === Part.Bass) return "BK";
    return "ALL";
  }

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
          <div
            className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-white dark:border-[#283039]"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDsREbKF5RhNz4w_mrkwGNVJ-GsAYUt_B5Mu5ZyTrdTvqqdRPf-7hfhb0_C7BIPDojNXDgyjk_FJUQeOvZ7GKcOV1fK1TlUHAuX7HNmoqpwk3G3ShETJVO4JzbfILyVYCr3VHkWWCY1eB3USDpMmDrFyWG4QZrlqe4CwFrr6PnOACKgNGXJSNrpcLnLz0i1tJfUKCGE85Wf_-BTUmnUBphkUK8dz0hD5X-LARWw2SwgvphUisK9bA2Hap1d0QEQsKIVD3TUmRU44rX0")',
            }}
          ></div>
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
                <span>•</span>
                <span>Arrangement by {project.composer}</span>
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
                    Measure {Math.floor(currentSeconds / 2) + 1}
                  </p>
                  <p className="text-slate-500 dark:text-[#9dabb9] text-sm font-medium font-mono">
                    {project.duration}
                  </p>
                </div>
                <div className="group relative flex h-6 w-full items-center cursor-pointer">
                  <div className="absolute h-1.5 w-full rounded-full bg-slate-200 dark:bg-[#3b4754]"></div>
                  <div
                    className="absolute h-1.5 rounded-full bg-primary"
                    style={{ width: `${Math.min((currentSeconds / 252) * 100, 100)}%` }} // rough calc based on 4:12 duration
                  ></div>
                  <div
                    className="absolute h-4 w-4 rounded-full bg-white shadow-md border border-slate-200 dark:border-none transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform duration-100"
                     style={{ left: `${Math.min((currentSeconds / 252) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              {/* Controls Row */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Playback Buttons */}
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-full text-slate-500 hover:text-primary hover:bg-primary/10 dark:text-[#9dabb9] dark:hover:text-primary transition-all">
                    <span className="material-symbols-outlined text-[28px]">
                      skip_previous
                    </span>
                  </button>
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-white hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/30">
                    <span className="material-symbols-outlined text-[32px] fill-1">
                      {isPlaying ? 'pause' : 'play_arrow'}
                    </span>
                  </button>
                  <button className="p-2 rounded-full text-slate-500 hover:text-primary hover:bg-primary/10 dark:text-[#9dabb9] dark:hover:text-primary transition-all">
                    <span className="material-symbols-outlined text-[28px]">
                      skip_next
                    </span>
                  </button>
                  <button className="ml-2 p-2 rounded-lg text-primary bg-primary/10 dark:text-primary dark:bg-primary/20">
                    <span className="material-symbols-outlined text-[24px]">
                      repeat
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
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-[#283039] hover:bg-slate-200 dark:hover:bg-[#3b4754] rounded-lg text-sm font-medium transition-colors">
                  <span className="text-slate-500 dark:text-[#9dabb9]">Role:</span>
                  <span className="text-slate-900 dark:text-white font-bold">{selectedRole}</span>
                  <span className="material-symbols-outlined text-[20px] text-slate-500">
                    expand_more
                  </span>
                </button>
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
                 const isMyPart = filterMode === "MY_PART" ? line.parts.includes(selectedRole) || line.parts.includes(Part.Tutti) : true;
                 
                 // If filtering is on and it's not my part, we can dim it or hide it.
                 // The text description says "dim but don't hide".
                 // However, "My Part" button usually implies hiding others or strong dimming. 
                 // Let's stick to the visual style of the screenshot. The screenshot highlights specific parts.
                 
                 const primaryPart = line.parts[0] || Part.Tutti;
                 const colorClasses = getPartColor(primaryPart).split(' '); // [text, bg-opacity, bg-bar]
                 const textColor = colorClasses[0];
                 const badgeBg = colorClasses[1];
                 const barBg = colorClasses[2];
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
                        onClick={() => setCurrentSeconds(line.seconds || 0)} // Click to jump
                        className={`flex items-stretch gap-4 p-4 md:p-5 rounded-xl transition-all cursor-pointer ${containerClass}`}
                    >
                        <div className={`w-1.5 rounded-full self-stretch ${isActive ? 'bg-primary shadow-[0_0_10px_rgba(19,127,236,0.6)]' : barBg}`}></div>
                        <div className="flex flex-col gap-1 w-full">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`size-6 rounded-full flex items-center justify-center text-xs font-bold ${isActive ? 'bg-primary text-white' : `${badgeBg} ${textColor}`}`}>
                                        {avatar}
                                    </div>
                                    <span className={`text-xs uppercase tracking-wide ${isActive ? 'font-bold text-primary' : 'font-semibold text-slate-500 dark:text-[#9dabb9]'}`}>
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