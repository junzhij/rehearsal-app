import React, { useEffect, useState } from "react";
import { Project } from "../types";
import { api } from "../services/api";

interface DashboardProps {
  onNavigate: (screen: "SETTINGS" | "REHEARSAL", project: Project) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (error) {
      console.error("Failed to load projects", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newProjectName.trim()) return;
    
    setCreating(true);
    try {
      const newProject = await api.createProject(newProjectName, "New Composition");
      if (newProject) {
        setNewProjectName("");
        setShowCreateModal(false);
        await loadProjects();
        onNavigate("SETTINGS", newProject);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to create project");
    } finally {
        setCreating(false);
    }
  };

  return (
    <>
      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1a1d21] rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New Project</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Project Name</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Hallelujah Chorus"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-black/20 px-4 py-2.5 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
              <div className="flex justify-end gap-3 mt-2">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!newProjectName.trim() || creating}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2">
                  {creating && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <header className="flex items-center justify-between border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111418] px-4 py-3 md:px-10">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-white">
              <span className="material-symbols-outlined text-xl">music_note</span>
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-tight dark:text-white">
              Rehearsal App
            </h2>
          </div>
          {/* ... (Menu items kept same) ... */}
          <div className="hidden md:flex items-center gap-6">
            <a className="text-sm font-medium text-slate-900 dark:text-white hover:text-primary transition-colors" href="#">Dashboard</a>
            <a className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" href="#">Community</a>
          </div>
        </div>
        {/* ... (Search and Profile kept same) ... */}
         <div className="flex flex-1 justify-end gap-4 md:gap-8">
          <label className="hidden md:flex flex-col min-w-40 h-10 max-w-64">
            <div className="flex w-full flex-1 items-stretch rounded-lg bg-slate-100 dark:bg-[#283039] focus-within:ring-2 focus-within:ring-primary/50 transition-shadow">
              <div className="flex items-center justify-center pl-3 text-slate-400">
                <span className="material-symbols-outlined text-[20px]">
                  search
                </span>
              </div>
              <input
                className="w-full flex-1 border-none bg-transparent px-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-0"
                placeholder="Search projects..."
              />
            </div>
          </label>
          <div
            className="h-10 w-10 cursor-pointer rounded-full bg-slate-200 dark:bg-slate-700 bg-cover bg-center ring-2 ring-transparent hover:ring-primary transition-all"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDk5Snt155qPB65MPRV7Ip2WAAmFbEKm46FxHEL0CzHTu82V2aIRvCmnkb58JrJaJqAuwrsAI8mJ1OEEX9HqeaSm3iYh_Om4bqEWfkOxxv7hivJDk0SjsIZc9eqIIeV6dBqvwlk3G1wIOAJnSJ3P6UozNuOu_wfHIl77HVDU5gvnvBp62xGeZkXC-XnWERx_fL7UVaHXsdEhBdOblf2RlEeoCET5DrT7UNqCAXhKrw8XKdRqVcBVWf4BX2B_3rvcsSwqZGIUNaTEUGK")',
            }}
          ></div>
        </div>
      </header>

      {/* Main Content */}
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5 px-4 md:px-10 lg:px-20">
          <div className="layout-content-container flex flex-col w-full max-w-6xl flex-1 gap-6">
            {/* Page Heading */}
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white md:text-4xl">
                  My Projects
                </h1>
                <p className="text-base text-slate-500 dark:text-slate-400">
                  Manage your rehearsal tracks, setlists, and groups.
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20">
                  <span className="material-symbols-outlined text-[20px]">
                    add
                  </span>
                  <span>New Project</span>
                </button>
              </div>
            </div>

            {/* Toolbar / Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-2">
                 <button className="group flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d21] px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">
                    sort
                  </span>
                  <span>Last Updated</span>
                </button>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing {projects.length} projects
              </p>
            </div>

            {/* Projects Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
                </div>
            ) : projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                    <span className="material-symbols-outlined text-6xl mb-4">library_music</span>
                    <p className="text-lg">No projects yet.</p>
                    <button onClick={() => setShowCreateModal(true)} className="text-primary font-bold mt-2 hover:underline">Create one now</button>
                </div>
            ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark transition-all hover:border-primary/50 hover:shadow-lg dark:hover:bg-card-hover-dark"
                >
                  {/* Clickable Area for Main Action -> Rehearsal */}
                  <div
                    onClick={() => onNavigate("REHEARSAL", project)}
                    className="flex flex-col flex-1 cursor-pointer"
                  >
                    <div className="relative h-40 w-full overflow-hidden bg-slate-800">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105 opacity-80"
                        style={{ backgroundImage: `url("${project.coverImage}")` }}
                      ></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-3 left-4 right-4">
                        <h3 className="line-clamp-1 text-xl font-bold text-white">
                          {project.title}
                        </h3>
                        <p className="text-xs font-medium text-slate-300">
                          {project.composer}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 p-4">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">
                            groups
                          </span>
                          <span>{project.membersCount} Members</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">
                            schedule
                          </span>
                          <span>{project.duration}</span>
                        </div>
                      </div>
                      <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {project.updatedAt}
                        </span>
                        <div className="flex items-center gap-1 text-primary text-xs font-bold opacity-0 transition-opacity group-hover:opacity-100">
                          <span>Open Rehearsal</span>
                          <span className="material-symbols-outlined text-[14px]">
                            arrow_forward
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Settings Button -> Settings Screen */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate("SETTINGS", project);
                    }}
                    aria-label="Project Settings"
                    className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      settings
                    </span>
                  </button>
                </div>
              ))}
            </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
