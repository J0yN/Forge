/**
 * FORGE Data Models and Type Definitions
 */

export type GoalCategory =
  | 'business'
  | 'career'
  | 'learning'
  | 'creator'
  | 'personal'
  | 'technology'
  | 'other';

export type ProjectStatus = 'active' | 'completed' | 'paused' | 'archived';

export type MilestoneStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface Constraint {
  type: 'budget' | 'time' | 'skill' | 'resource' | 'other';
  value: string;
}

export interface ProjectGoal {
  outcome: string;
  successCriteria: string[];
  category: GoalCategory;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  goal: ProjectGoal;
  constraints: Constraint[];
  status: ProjectStatus;
  progress: number;
  currentMilestoneId: string;
  currentTaskId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  objective: string;
  status: MilestoneStatus;
  order: number;
  dependencies: string[];
  completionCriteria: string[];
  tasks: string[]; // task IDs
}

export interface Task {
  id: string;
  projectId: string;
  milestoneId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dependencies: string[];
  estimatedEffort: string;
  completionCriteria: string[];
  deliverableSuggestions: string[];
  createdAt: string;
  completedAt: string | null;
}

export interface RealityConcern {
  id: string;
  severity: 'low' | 'moderate' | 'medium' | 'high' | 'critical';
  title: string;
  reason: string;
  evidence: string;
  recommendation: string;
}

export interface RealityCheck {
  id: string;
  projectId: string;
  overallRisk: RiskLevel;
  summary: string;
  strengths: string[];
  concerns: RealityConcern[];
  missingInformation: string[];
  recommendations: string[];
  updatedAt: string;
}

export interface NextAction {
  taskId: string | null;
  title: string;
  reason: string;
  impact: 'low' | 'medium' | 'high';
  estimatedEffort: string;
  blockingFactor: string | null;
}

export interface ProjectMemoryFact {
  key: string;
  value: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface ProjectMemoryDecision {
  decision: string;
  reason: string;
  date: string;
}

export interface ProjectMemoryItem {
  key: string;
  value: string;
}

export interface ProjectMemory {
  id: string;
  projectId: string;
  facts: ProjectMemoryFact[];
  decisions: ProjectMemoryDecision[];
  constraints: ProjectMemoryItem[];
  preferences: ProjectMemoryItem[];
}

export interface Deliverable {
  id: string;
  projectId: string;
  taskId: string;
  taskTitle: string;
  title: string;
  type: string;
  content: string; // Markdown artifact
  createdAt: string;
}

export interface AssistantMessage {
  id: string;
  projectId: string;
  role: 'user' | 'assistant';
  content: string;
  suggestedAction?: {
    type: 'start_task' | 'create_deliverable' | 'apply_recommendation' | 'view_roadmap';
    taskId?: string;
    label: string;
  };
  createdAt: string;
}

export interface UserSettings {
  profile: {
    displayName: string;
    role: string;
    email: string;
  };
  appearance: {
    theme: 'dark' | 'light' | 'system';
    reducedMotion: boolean;
  };
  aiPreferences: {
    responseStyle: 'direct' | 'detailed' | 'strategic';
    challengeAssumptions: boolean;
    autoSuggestDeliverables: boolean;
  };
}
