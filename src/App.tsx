/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useProjectStore } from './store/useProjectStore';
import { AppShell } from './components/common/AppShell';
import { LandingView } from './views/LandingView';
import { OnboardingView } from './views/OnboardingView';
import { HomeDashboardView } from './views/HomeDashboardView';
import { NewProjectView } from './views/NewProjectView';
import { ProjectsListView } from './views/ProjectsListView';
import { ProjectDashboardView } from './views/ProjectDashboardView';
import { RoadmapView } from './views/RoadmapView';
import { TasksView } from './views/TasksView';
import { AssistantView } from './views/AssistantView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const { projects, activeProjectId, setActiveProjectId } = useProjectStore();

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  // Extract route params
  const isLanding = currentPath === '/';
  const isOnboarding = currentPath === '/onboarding';

  // Project route matching: /app/projects/:id/...
  const projectMatch = currentPath.match(/^\/app\/projects\/([^/]+)(\/(roadmap|tasks|assistant))?$/);
  const matchedProjectId = projectMatch ? projectMatch[1] : null;
  const projectSubRoute = projectMatch ? projectMatch[3] : null;

  // Resolve active project
  const targetProject = matchedProjectId
    ? projects.find((p) => p.id === matchedProjectId) || projects[0]
    : projects.find((p) => p.id === activeProjectId) || projects[0];

  useEffect(() => {
    if (matchedProjectId && matchedProjectId !== activeProjectId) {
      setActiveProjectId(matchedProjectId);
    }
  }, [matchedProjectId, activeProjectId, setActiveProjectId]);

  // Render top-level landing or onboarding without shell
  if (isLanding) {
    return <LandingView onNavigate={navigate} />;
  }

  if (isOnboarding) {
    return <OnboardingView onNavigate={navigate} />;
  }

  // Inside App Shell
  return (
    <AppShell currentPath={currentPath} onNavigate={navigate}>
      {(() => {
        if (currentPath === '/app') {
          return <HomeDashboardView onNavigate={navigate} />;
        }

        if (currentPath === '/app/new') {
          return <NewProjectView onNavigate={navigate} />;
        }

        if (currentPath === '/app/projects') {
          return <ProjectsListView onNavigate={navigate} />;
        }

        if (currentPath === '/app/settings') {
          return <SettingsView onNavigate={navigate} />;
        }

        if (targetProject) {
          if (projectSubRoute === 'roadmap') {
            return <RoadmapView project={targetProject} onNavigate={navigate} />;
          }
          if (projectSubRoute === 'tasks') {
            return <TasksView project={targetProject} onNavigate={navigate} />;
          }
          if (projectSubRoute === 'assistant') {
            return <AssistantView project={targetProject} onNavigate={navigate} />;
          }
          return <ProjectDashboardView project={targetProject} onNavigate={navigate} />;
        }

        // Fallback to home dashboard
        return <HomeDashboardView onNavigate={navigate} />;
      })()}
    </AppShell>
  );
}
