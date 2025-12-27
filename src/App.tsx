import React, { useState } from "react";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Settings } from "./pages/Settings";
import { Rehearsal } from "./pages/Rehearsal";
import { Project, ViewState } from "./types";
import { api } from "./services/api";

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ViewState>("DASHBOARD");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNavigate = async (screen: ViewState, project?: Project) => {
    if (project) {
        setLoading(true);
        try {
            // Fetch full details
            const fullProject = await api.getProjectDetails(project.id);
            setSelectedProject(fullProject || project);
        } catch (e) {
            console.error("Failed to fetch project details", e);
            setSelectedProject(project);
        } finally {
            setLoading(false);
        }
    }
    setCurrentScreen(screen);
  };

  const handleUpdateProject = (updated: Project) => {
    setSelectedProject(updated);
  };

  if (loading) {
      return (
          <Layout>
              <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark text-primary">
                  <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
              </div>
          </Layout>
      )
  }

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
          onBack={() => setCurrentScreen("DASHBOARD")}
          onSave={(updated) => {
              handleUpdateProject(updated);
              setCurrentScreen("REHEARSAL");
          }}
        />
      )}

      {currentScreen === "REHEARSAL" && selectedProject && (
        <Rehearsal
          project={selectedProject}
          onBack={() => setCurrentScreen("DASHBOARD")}
          onSettings={() => handleNavigate("SETTINGS", selectedProject)}
        />
      )}
    </Layout>
  );
};

export default App;
