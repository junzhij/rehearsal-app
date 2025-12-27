import React, { useState, useEffect } from "react";
import { Project, LyricLine, Part } from "../types";

interface SettingsProps {
  project: Project;
  onBack: () => void;
  onSave: (updatedProject: Project) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  project,
  onBack,
  onSave,
}) => {
  const [lyrics, setLyrics] = useState<LyricLine[]>(project.lyrics || []);
  const [selectedLineIds, setSelectedLineIds] = useState<Set<string>>(new Set());

  // Reset local state if project changes
  useEffect(() => {
    setLyrics(project.lyrics || []);
    setSelectedLineIds(new Set());
  }, [project]);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedLineIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedLineIds(newSet);
  };

  const assignPart = (part: Part) => {
    if (selectedLineIds.size === 0) return;

    const updatedLyrics = lyrics.map((line) => {
      if (selectedLineIds.has(line.id)) {
        // Toggle part logic: if part exists, remove it, otherwise add it
        // Or simply set logic. The prompt implies "Assign Selected", so we'll add.
        // For simplicity in MVP, we replace or add unique. Let's add unique.
        const newParts = line.parts.includes(part) ? line.parts : [...line.parts, part];
        return { ...line, parts: newParts };
      }
      return line;
    });

    setLyrics(updatedLyrics);
    // Optional: Clear selection after assignment
    // setSelectedLineIds(new Set());
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

  const handlePublish = () => {
    onSave({ ...project, lyrics });
    onBack();
  };

  // Helper to get color classes for chips
  const getPartColor = (part: Part) => {
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
          <div className="hidden md:flex items-center gap-9">
            <a
              className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary text-sm font-medium leading-normal transition-colors"
              href="#"
            >
              Dashboard
            </a>
            <a
              className="text-primary text-sm font-medium leading-normal"
              href="#"
            >
              Projects
            </a>
            <a
              className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary text-sm font-medium leading-normal transition-colors"
              href="#"
            >
              Calendar
            </a>
          </div>
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-slate-200 dark:ring-slate-700"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBHKWqxmxlKXsR38cMkNCXPTbPyGM8xywpRve2VACm5Yb1Rx__pEv1DzKXYfQE219ItnCohXJmYKWlnwWw71u2YNknG8dqYbvAj6WBSomMVLDxL-kmyhQrLVUeATvXCOJa3PDZ1xarxvAKHKruFH-c0MvewFUZ9iTCkEJIKPAug2JuN3sx7iheud9AK0j43lg5GDXxU77ZutVfU4jp5ekBIgbfO2QrewIMKxSv0WPbHPSA3q_X1hYQzK_5bk64nrHXhId3WtE6WbwJM")',
            }}
          ></div>
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
                  {project.title} - Rehearsal A
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">
                    schedule
                  </span>
                  Last edited just now
                </p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-sm hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                  <span className="material-symbols-outlined text-lg">
                    save
                  </span>
                  Save Draft
                </button>
                <button
                  onClick={handlePublish}
                  className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary text-white font-medium text-sm hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
                >
                  <span className="material-symbols-outlined text-lg">
                    publish
                  </span>
                  Publish Changes
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="pb-3 px-4">
              <div className="flex border-b border-slate-200 dark:border-slate-700 gap-8 overflow-x-auto">
                <a
                  className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-slate-500 dark:text-slate-400 pb-[13px] pt-4 hover:text-slate-700 dark:hover:text-slate-200 transition-colors whitespace-nowrap px-2"
                  href="#"
                >
                  <p className="text-sm font-bold leading-normal tracking-[0.015em]">
                    Audio Settings
                  </p>
                </a>
                <a
                  className="flex flex-col items-center justify-center border-b-[3px] border-b-primary text-primary pb-[13px] pt-4 whitespace-nowrap px-2"
                  href="#"
                >
                  <p className="text-sm font-bold leading-normal tracking-[0.015em]">
                    Lyrics & Assignment
                  </p>
                </a>
                <a
                  className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-slate-500 dark:text-slate-400 pb-[13px] pt-4 hover:text-slate-700 dark:hover:text-slate-200 transition-colors whitespace-nowrap px-2"
                  href="#"
                >
                  <p className="text-sm font-bold leading-normal tracking-[0.015em]">
                    Member Management
                  </p>
                </a>
              </div>
            </div>

            {/* Main Workspace (2 Columns) */}
            <div className="flex flex-col lg:flex-row gap-6 p-4 h-full min-h-[600px]">
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
                    <button
                      className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title="Add Line"
                    >
                      <span className="material-symbols-outlined">add</span>
                    </button>
                    <div className="w-px bg-slate-300 dark:bg-slate-700 h-6 my-auto"></div>
                    <button
                      className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title="Decrease Font"
                    >
                      <span className="material-symbols-outlined text-lg">
                        text_decrease
                      </span>
                    </button>
                    <button
                      className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title="Increase Font"
                    >
                      <span className="material-symbols-outlined text-lg">
                        text_increase
                      </span>
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
                        className={`group flex items-start gap-4 p-3 rounded-lg transition-colors border ${
                          isSelected
                            ? "bg-primary/5 border-primary/20 hover:bg-primary/10"
                            : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                        }`}
                      >
                        <div className="pt-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelection(line.id)}
                            className="h-5 w-5 rounded border-slate-300 dark:border-slate-600 bg-transparent text-primary focus:ring-primary dark:checked:bg-primary dark:checked:border-primary cursor-pointer"
                          />
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                          <div
                            className="text-slate-900 dark:text-white text-lg outline-none focus:border-b focus:border-primary border-b border-transparent"
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => {
                                // Simplified update logic - in real app would validate content
                                const content = e.currentTarget.textContent || "";
                                setLyrics(prev => prev.map(l => l.id === line.id ? {...l, content} : l))
                            }}
                          >
                            {line.content}
                          </div>
                          <div className="flex gap-2 flex-wrap">
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
                          <span className="material-symbols-outlined text-slate-400 cursor-grab">
                            drag_indicator
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
                    Assign Parts
                  </p>
                  {/* Member/Part Chips */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {[
                      { part: Part.Soprano1, color: "bg-purple-500", label: "Soprano 1", hover: "hover:bg-purple-50 hover:border-purple-200" },
                      { part: Part.Soprano2, color: "bg-purple-400", label: "Soprano 2", hover: "hover:bg-purple-50 hover:border-purple-200" },
                      { part: Part.Alto, color: "bg-pink-500", label: "Alto", hover: "hover:bg-pink-50 hover:border-pink-200" },
                      { part: Part.Tenor, color: "bg-blue-500", label: "Tenor", hover: "hover:bg-blue-50 hover:border-blue-200" },
                      { part: Part.Bass, color: "bg-green-500", label: "Bass", hover: "hover:bg-green-50 hover:border-green-200" },
                      { part: Part.Tutti, color: "bg-slate-400", label: "Tutti (All)", hover: "hover:bg-slate-200" },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => assignPart(item.part)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a2129] transition-colors group ${item.hover}`}
                      >
                        <div className={`size-2 rounded-full ${item.color}`}></div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {item.label}
                        </span>
                      </button>
                    ))}
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
                  <hr className="my-6 border-slate-200 dark:border-slate-700" />
                  {/* Pitch Control Mini Widget */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">
                        Song Key
                      </p>
                      <span className="text-xs font-mono bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                        0 Semi
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-[#1a2129] rounded-lg p-2 border border-slate-200 dark:border-slate-700">
                      <button className="size-8 flex items-center justify-center rounded bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-600 shadow-sm hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-lg">
                          remove
                        </span>
                      </button>
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-bold text-slate-900 dark:text-white">
                          C Maj
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          Original Key
                        </span>
                      </div>
                      <button className="size-8 flex items-center justify-center rounded bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-600 shadow-sm hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-lg">
                          add
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
