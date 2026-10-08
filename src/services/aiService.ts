import { Project, Milestone, Task, RealityCheck, ProjectMemory, AssistantMessage } from '../types';

export interface CreateProjectApiResponse {
  title: string;
  description: string;
  goal: {
    outcome: string;
    successCriteria: string[];
    category: any;
  };
  constraints: { type: any; value: string }[];
  milestones: {
    id: string;
    title: string;
    objective: string;
    status: any;
    order: number;
    dependencies: string[];
    completionCriteria: string[];
    tasks: {
      id: string;
      title: string;
      description: string;
      status: any;
      priority: any;
      dependencies: string[];
      estimatedEffort: string;
      completionCriteria: string[];
      deliverableSuggestions: string[];
    }[];
  }[];
  realityCheck: {
    overallRisk: any;
    summary: string;
    strengths: string[];
    concerns: {
      id: string;
      severity: any;
      title: string;
      reason: string;
      evidence: string;
      recommendation: string;
    }[];
    missingInformation: string[];
    recommendations: string[];
  };
  nextAction: {
    taskId: string;
    title: string;
    reason: string;
    impact: any;
    estimatedEffort: string;
    blockingFactor: string;
  };
  memory: {
    facts: { key: string; value: string; confidence: any }[];
    decisions: { decision: string; reason: string; date: string }[];
    constraints: { key: string; value: string }[];
    preferences: { key: string; value: string }[];
  };
}

export async function analyzeAndCreateProject(params: {
  goalText: string;
  attachmentContent?: string;
  userContext?: any;
}): Promise<CreateProjectApiResponse> {
  const response = await fetch('/api/ai/analyze-and-create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Execution analysis failed: ${errorText || response.statusText}`);
  }

  const result = await response.json();
  if (!result.data) {
    throw new Error('Invalid response structure received from FORGE engine');
  }

  return result.data;
}

export async function generateDeliverable(params: {
  project: Project;
  task: Task;
  requestedDeliverableType?: string;
}): Promise<{ title: string; content: string }> {
  const response = await fetch('/api/ai/deliverable', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Failed to generate deliverable artifact');
  }

  const result = await response.json();
  return {
    title: result.title || params.requestedDeliverableType || `${params.task.title} Artifact`,
    content: result.content || '',
  };
}

export async function runRealityCheck(params: {
  project: Project;
  milestones: Milestone[];
  tasks: Task[];
  memory?: ProjectMemory | null;
}): Promise<RealityCheck> {
  const response = await fetch('/api/ai/reality-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Failed to run reality check');
  }

  const result = await response.json();
  const rawData = result.data;

  return {
    id: `rc-${Date.now()}`,
    projectId: params.project.id,
    overallRisk: rawData.overallRisk || 'moderate',
    summary: rawData.summary || 'Audit completed with active mitigation recommendations.',
    strengths: rawData.strengths || [],
    concerns: rawData.concerns || [],
    missingInformation: rawData.missingInformation || [],
    recommendations: rawData.recommendations || [],
    updatedAt: new Date().toISOString(),
  };
}

export async function askProjectAssistant(params: {
  project: Project;
  milestones: Milestone[];
  tasks: Task[];
  memory?: ProjectMemory | null;
  realityCheck?: RealityCheck | null;
  messages: { role: 'user' | 'assistant'; content: string }[];
}): Promise<{ content: string; suggestedAction?: AssistantMessage['suggestedAction'] }> {
  const response = await fetch('/api/ai/assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Project assistant request failed');
  }

  const result = await response.json();
  return result.data;
}
