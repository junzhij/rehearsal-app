import React, { useState } from "react";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Settings } from "./pages/Settings";
import { Rehearsal } from "./pages/Rehearsal";
import { MOCK_PROJECTS } from "./constants";
import { Project, ViewState } from "./types";

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ViewState>("DASHBOARD");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // In a real app, projects would come from a backend/context. 
  // We'll simulate updating the "Database" here when settings change.
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);

  const handleNavigate = (screen: ViewState, project?: Project) => {
    if (project) {
        // Always ensure we have the latest version of the project from our state
        const freshProject = projects.find(p => p.id === project.id) || project;
        setSelectedProject(freshProject);
    }
    setCurrentScreen(screen);
  };

  const handleUpdateProject = (updated: Project) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    setSelectedProject(updated);
  };

  return (
    <Layout>
      {currentScreen === "DASHBOARD" && (
        <Dashboard 
            onNavigate={(screen, project) => handleNavigate(screen, project)} 
        />
      )}
      
      {currentScreen === "SETTINGS" && selectedProject && (
        <Settings
          project={selectedProject}
          onBack={() => handleNavigate("DASHBOARD")}
          onSave={handleUpdateProject}
        />
      )}

      {currentScreen === "REHEARSAL" && selectedProject && (
        <Rehearsal
          project={selectedProject}
          onBack={() => handleNavigate("DASHBOARD")}
          onSettings={() => handleNavigate("SETTINGS", selectedProject)}
        />
      )}
    </Layout>
  );
};

export default App;
