import { useState, useEffect, useCallback } from 'react';
import {
  Project,
  Milestone,
  Task,
  RealityCheck,
  ProjectMemory,
  Deliverable,
  NextAction,
  UserSettings,
} from '../types';
import { INITIAL_SEED_DATA, SeedData } from '../data/initialData';

const STORAGE_KEY = 'forge_app_state_v1';
const SETTINGS_KEY = 'forge_user_settings_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  profile: {
    displayName: 'Alex Mercer',
    role: 'Founder & Builder',
    email: 'builder@forge.app',
  },
  appearance: {
    theme: 'dark',
    reducedMotion: false,
  },
  aiPreferences: {
    responseStyle: 'strategic',
    challengeAssumptions: true,
    autoSuggestDeliverables: true,
  },
};

interface StoreState extends SeedData {
  settings: UserSettings;
  activeProjectId: string | null;
}

function loadInitialState(): StoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const rawSettings = localStorage.getItem(SETTINGS_KEY);
    const settings = rawSettings ? JSON.parse(rawSettings) : DEFAULT_SETTINGS;

    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...parsed,
        settings,
        activeProjectId: parsed.activeProjectId || parsed.projects[0]?.id || null,
      };
    }
  } catch (err) {
    console.error('Failed to load state from localStorage:', err);
  }

  return {
    ...INITIAL_SEED_DATA,
    settings: DEFAULT_SETTINGS,
    activeProjectId: INITIAL_SEED_DATA.projects[0].id,
  };
}

let globalState: StoreState = loadInitialState();
const listeners = new Set<(state: StoreState) => void>();

function notify() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      projects: globalState.projects,
      milestones: globalState.milestones,
      tasks: globalState.tasks,
      realityChecks: globalState.realityChecks,
      memories: globalState.memories,
      deliverables: globalState.deliverables,
      activeProjectId: globalState.activeProjectId,
    }));
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(globalState.settings));
  } catch (e) {
    console.error('Storage sync error:', e);
  }
  listeners.forEach((listener) => listener(globalState));
}

export function useProjectStore() {
  const [state, setState] = useState<StoreState>(globalState);

  useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  const setActiveProjectId = useCallback((id: string | null) => {
    globalState = { ...globalState, activeProjectId: id };
    notify();
  }, []);

  const activeProject = globalState.projects.find((p) => p.id === globalState.activeProjectId) || globalState.projects[0] || null;

  const getProjectMilestones = useCallback((projectId: string) => {
    return globalState.milestones
      .filter((m) => m.projectId === projectId)
      .sort((a, b) => a.order - b.order);
  }, [state.milestones]);

  const getProjectTasks = useCallback((projectId: string) => {
    return globalState.tasks.filter((t) => t.projectId === projectId);
  }, [state.tasks]);

  const getProjectRealityCheck = useCallback((projectId: string) => {
    return globalState.realityChecks.find((rc) => rc.projectId === projectId) || null;
  }, [state.realityChecks]);

  const getProjectMemory = useCallback((projectId: string) => {
    return globalState.memories.find((m) => m.projectId === projectId) || null;
  }, [state.memories]);

  const getProjectDeliverables = useCallback((projectId: string) => {
    return globalState.deliverables.filter((d) => d.projectId === projectId);
  }, [state.deliverables]);

  const getNextAction = useCallback((projectId: string): NextAction | null => {
    const project = globalState.projects.find((p) => p.id === projectId);
    if (!project) return null;

    const projectMilestones = globalState.milestones
      .filter((m) => m.projectId === projectId)
      .sort((a, b) => a.order - b.order);

    const projectTasks = globalState.tasks.filter((t) => t.projectId === projectId);

    // Look for first available/in_progress milestone's uncompleted critical or high priority task
    const activeMilestone =
      projectMilestones.find((m) => m.id === project.currentMilestoneId) ||
      projectMilestones.find((m) => m.status === 'in_progress' || m.status === 'available') ||
      projectMilestones[0];

    if (!activeMilestone) return null;

    const milestoneTasks = projectTasks.filter((t) => t.milestoneId === activeMilestone.id && t.status !== 'done');
    const criticalTask = milestoneTasks.find((t) => t.priority === 'critical') || milestoneTasks[0];

    if (criticalTask) {
      return {
        taskId: criticalTask.id,
        title: criticalTask.title,
        reason: `This unlocks downstream progress for Milestone: "${activeMilestone.title}" and eliminates key uncertainty.`,
        impact: criticalTask.priority === 'critical' ? 'high' : 'medium',
        estimatedEffort: criticalTask.estimatedEffort || '2-3 hours',
        blockingFactor: `Required before closing ${activeMilestone.title}`,
      };
    }

    // If active milestone is complete, find next available milestone task
    const anyIncompleteTask = projectTasks.find((t) => t.status !== 'done');
    if (anyIncompleteTask) {
      return {
        taskId: anyIncompleteTask.id,
        title: anyIncompleteTask.title,
        reason: 'Continue forward velocity on open project requirements.',
        impact: 'medium',
        estimatedEffort: anyIncompleteTask.estimatedEffort || '2 hours',
        blockingFactor: null,
      };
    }

    return {
      taskId: null,
      title: 'All current project tasks completed',
      reason: 'You have executed all planned milestone tasks for this goal.',
      impact: 'low',
      estimatedEffort: 'None',
      blockingFactor: null,
    };
  }, [state]);

  const createProject = useCallback((payload: {
    project: Project;
    milestones: Milestone[];
    tasks: Task[];
    realityCheck: RealityCheck;
    memory: ProjectMemory;
    deliverables?: Deliverable[];
  }) => {
    globalState = {
      ...globalState,
      projects: [payload.project, ...globalState.projects],
      milestones: [...globalState.milestones, ...payload.milestones],
      tasks: [...globalState.tasks, ...payload.tasks],
      realityChecks: [...globalState.realityChecks, payload.realityCheck],
      memories: [...globalState.memories, payload.memory],
      deliverables: payload.deliverables
        ? [...globalState.deliverables, ...payload.deliverables]
        : globalState.deliverables,
      activeProjectId: payload.project.id,
    };
    notify();
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    globalState = {
      ...globalState,
      projects: globalState.projects.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      ),
    };
    notify();
  }, []);

  const deleteProject = useCallback((id: string) => {
    const remainingProjects = globalState.projects.filter((p) => p.id !== id);
    const newActiveId = remainingProjects[0]?.id || null;

    globalState = {
      ...globalState,
      projects: remainingProjects,
      milestones: globalState.milestones.filter((m) => m.projectId !== id),
      tasks: globalState.tasks.filter((t) => t.projectId !== id),
      realityChecks: globalState.realityChecks.filter((rc) => rc.projectId !== id),
      memories: globalState.memories.filter((m) => m.projectId !== id),
      deliverables: globalState.deliverables.filter((d) => d.projectId !== id),
      activeProjectId: newActiveId,
    };
    notify();
  }, []);

  const toggleTaskCompletion = useCallback((taskId: string): { unlockedMessage?: string } => {
    const task = globalState.tasks.find((t) => t.id === taskId);
    if (!task) return {};

    const willBeDone = task.status !== 'done';
    const newStatus = willBeDone ? 'done' : 'todo';
    const now = willBeDone ? new Date().toISOString() : null;

    const updatedTasks = globalState.tasks.map((t) =>
      t.id === taskId ? { ...t, status: newStatus as any, completedAt: now } : t
    );

    const projectId = task.projectId;
    const projectTasks = updatedTasks.filter((t) => t.projectId === projectId);
    const totalCount = projectTasks.length;
    const doneCount = projectTasks.filter((t) => t.status === 'done').length;
    const newProgress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

    // Check milestone status
    const milestoneTasks = projectTasks.filter((t) => t.milestoneId === task.milestoneId);
    const milestoneAllDone = milestoneTasks.length > 0 && milestoneTasks.every((t) => t.status === 'done');

    const projectMilestones = globalState.milestones
      .filter((m) => m.projectId === projectId)
      .sort((a, b) => a.order - b.order);

    const currentMilestoneIndex = projectMilestones.findIndex((m) => m.id === task.milestoneId);
    let unlockedMsg: string | undefined;

    let updatedMilestones = globalState.milestones.map((m) => {
      if (m.id === task.milestoneId) {
        return {
          ...m,
          status: (milestoneAllDone ? 'completed' : 'in_progress') as any,
        };
      }
      return m;
    });

    let currentMilestoneId = globalState.projects.find((p) => p.id === projectId)?.currentMilestoneId || task.milestoneId;

    if (milestoneAllDone && currentMilestoneIndex >= 0 && currentMilestoneIndex < projectMilestones.length - 1) {
      const nextMilestone = projectMilestones[currentMilestoneIndex + 1];
      updatedMilestones = updatedMilestones.map((m) =>
        m.id === nextMilestone.id && m.status === 'locked' ? { ...m, status: 'available' as any } : m
      );
      currentMilestoneId = nextMilestone.id;
      unlockedMsg = `Milestone complete! Unlocked: "${nextMilestone.title}"`;
    }

    globalState = {
      ...globalState,
      tasks: updatedTasks,
      milestones: updatedMilestones,
      projects: globalState.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              progress: newProgress,
              currentMilestoneId,
              status: newProgress === 100 ? 'completed' : p.status,
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    };

    notify();
    return { unlockedMessage: unlockedMsg };
  }, []);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    globalState = {
      ...globalState,
      tasks: globalState.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
    };
    notify();
  }, []);

  const saveDeliverable = useCallback((deliverable: Deliverable) => {
    // Avoid duplicates for same task if re-generated, or prepend
    const existingIndex = globalState.deliverables.findIndex((d) => d.id === deliverable.id);
    let updatedDeliverables: Deliverable[];

    if (existingIndex >= 0) {
      updatedDeliverables = globalState.deliverables.map((d) =>
        d.id === deliverable.id ? deliverable : d
      );
    } else {
      updatedDeliverables = [deliverable, ...globalState.deliverables];
    }

    globalState = {
      ...globalState,
      deliverables: updatedDeliverables,
    };
    notify();
  }, []);

  const applyRealityCheckRecommendation = useCallback((projectId: string, recommendation: string) => {
    const mem = globalState.memories.find((m) => m.projectId === projectId);
    const newDecision = {
      decision: `Applied recommendation: ${recommendation}`,
      reason: 'Reality Check risk mitigation',
      date: new Date().toISOString().split('T')[0],
    };

    if (mem) {
      globalState = {
        ...globalState,
        memories: globalState.memories.map((m) =>
          m.projectId === projectId
            ? { ...m, decisions: [newDecision, ...m.decisions] }
            : m
        ),
      };
    } else {
      globalState = {
        ...globalState,
        memories: [
          ...globalState.memories,
          {
            id: `mem-${Date.now()}`,
            projectId,
            facts: [],
            decisions: [newDecision],
            constraints: [],
            preferences: [],
          },
        ],
      };
    }
    notify();
  }, []);

  const addProjectMemoryFact = useCallback((projectId: string, key: string, value: string) => {
    globalState = {
      ...globalState,
      memories: globalState.memories.map((m) =>
        m.projectId === projectId
          ? {
              ...m,
              facts: [{ key, value, confidence: 'high' as const }, ...m.facts],
            }
          : m
      ),
    };
    notify();
  }, []);

  const addProjectMemoryDecision = useCallback((projectId: string, decision: string, reason: string) => {
    globalState = {
      ...globalState,
      memories: globalState.memories.map((m) =>
        m.projectId === projectId
          ? {
              ...m,
              decisions: [
                { decision, reason, date: new Date().toISOString().split('T')[0] },
                ...m.decisions,
              ],
            }
          : m
      ),
    };
    notify();
  }, []);

  const deleteProjectMemoryFact = useCallback((projectId: string, key: string) => {
    globalState = {
      ...globalState,
      memories: globalState.memories.map((m) =>
        m.projectId === projectId
          ? { ...m, facts: m.facts.filter((f) => f.key !== key) }
          : m
      ),
    };
    notify();
  }, []);

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    globalState = {
      ...globalState,
      settings: { ...globalState.settings, ...newSettings },
    };
    notify();
  }, []);

  const resetToDemoData = useCallback(() => {
    globalState = {
      ...INITIAL_SEED_DATA,
      settings: DEFAULT_SETTINGS,
      activeProjectId: INITIAL_SEED_DATA.projects[0].id,
    };
    notify();
  }, []);

  return {
    state,
    projects: state.projects,
    activeProjectId: state.activeProjectId,
    activeProject,
    settings: state.settings,
    setActiveProjectId,
    getProjectMilestones,
    getProjectTasks,
    getProjectRealityCheck,
    getProjectMemory,
    getProjectDeliverables,
    getNextAction,
    createProject,
    updateProject,
    deleteProject,
    toggleTaskCompletion,
    updateTask,
    saveDeliverable,
    applyRealityCheckRecommendation,
    addProjectMemoryFact,
    addProjectMemoryDecision,
    deleteProjectMemoryFact,
    updateSettings,
    resetToDemoData,
  };
}
