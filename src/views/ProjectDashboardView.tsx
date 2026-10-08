import React, { useState } from 'react';
import { Project, Task } from '../types';
import { useProjectStore } from '../store/useProjectStore';
import { DeliverableModal } from '../components/common/DeliverableModal';
import { AssistantDrawer } from '../components/common/AssistantDrawer';
import {
  Compass,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Milestone as MilestoneIcon,
  CheckCircle2,
  ListTodo,
  Bot,
  ExternalLink,
  ChevronRight,
  Clock,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

interface ProjectDashboardViewProps {
  project: Project;
  onNavigate: (path: string) => void;
}

export const ProjectDashboardView: React.FC<ProjectDashboardViewProps> = ({
  project,
  onNavigate,
}) => {
  const {
    getProjectMilestones,
    getProjectTasks,
    getProjectRealityCheck,
    getNextAction,
    toggleTaskCompletion,
    applyRealityCheckRecommendation,
  } = useProjectStore();

  const [assistantOpen, setAssistantOpen] = useState(false);
  const [selectedTaskForDoIt, setSelectedTaskForDoIt] = useState<Task | null>(null);
  const [unlockToast, setUnlockToast] = useState<string | null>(null);

  const milestones = getProjectMilestones(project.id);
  const tasks = getProjectTasks(project.id);
  const realityCheck = getProjectRealityCheck(project.id);
  const nextAction = getNextAction(project.id);

  const activeMilestone =
    milestones.find((m) => m.id === project.currentMilestoneId) ||
    milestones.find((m) => m.status === 'in_progress' || m.status === 'available') ||
    milestones[0];

  const currentTasks = tasks.filter((t) => t.milestoneId === activeMilestone?.id);
  const completedTasksCount = tasks.filter((t) => t.status === 'done').length;
  const completedMilestonesCount = milestones.filter((m) => m.status === 'completed').length;

  const currentFocusTask = nextAction?.taskId
    ? tasks.find((t) => t.id === nextAction.taskId) || currentTasks.find((t) => t.status !== 'done') || null
    : currentTasks.find((t) => t.status !== 'done') || null;

  const handleTaskToggle = (taskId: string) => {
    const res = toggleTaskCompletion(taskId);
    if (res.unlockedMessage) {
      setUnlockToast(res.unlockedMessage);
      setTimeout(() => setUnlockToast(null), 4000);
    }
  };

  const handleApplyRecommendation = (rec: string) => {
    applyRealityCheckRecommendation(project.id, rec);
    setUnlockToast(`Applied: "${rec}" saved to project memory.`);
    setTimeout(() => setUnlockToast(null), 4000);
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {unlockToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-[#181D23] border border-[#35C98A] text-[#35C98A] text-xs font-semibold shadow-2xl animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{unlockToast}</span>
        </div>
      )}

      {/* Top Project Header & Action Strip */}
      <section className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-[#252B33] pb-6">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2 text-xs text-[#9AA4B2]">
            <span className="font-mono uppercase text-[#F5A524]">{project.goal.category}</span>
            <span aria-hidden="true">·</span>
            <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#F5F7FA] tracking-tight">
            {project.title}
          </h1>

          <p className="text-sm text-[#9AA4B2] leading-relaxed">
            {project.goal.outcome || project.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setAssistantOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#181D23] border border-[#252B33] hover:border-[#F5A524] text-xs font-semibold text-[#F5F7FA] transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F5A524]" />
            <span>Ask FORGE</span>
          </button>

          <button
            onClick={() => onNavigate(`/app/projects/${project.id}/roadmap`)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#181D23] border border-[#252B33] hover:border-[#374151] text-xs font-semibold text-[#9AA4B2] hover:text-[#F5F7FA] transition-colors cursor-pointer"
          >
            <MilestoneIcon className="w-3.5 h-3.5" />
            <span>Roadmap</span>
          </button>

          <button
            onClick={() => onNavigate(`/app/projects/${project.id}/tasks`)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#181D23] border border-[#252B33] hover:border-[#374151] text-xs font-semibold text-[#9AA4B2] hover:text-[#F5F7FA] transition-colors cursor-pointer"
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Tasks</span>
          </button>
        </div>
      </section>

      {/* Progress & Milestone Overview Card */}
      <section className="p-6 rounded-2xl bg-[#12161B] border border-[#252B33] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#9AA4B2] font-semibold">
              Execution Progress
            </span>
            <div className="text-sm font-semibold text-[#F5F7FA]">
              {completedMilestonesCount} of {milestones.length} milestones complete
              <span className="text-[#9AA4B2] font-normal ml-2">
                ({completedTasksCount} of {tasks.length} tasks)
              </span>
            </div>
          </div>
          <div className="font-mono text-xl font-extrabold text-[#F5A524]">
            {project.progress}%
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[#0B0D10] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#F5A524] h-full transition-all duration-300"
            style={{ width: `${project.progress}%` }}
          />
        </div>

        {/* Roadmap Milestone Sequence Bar */}
        <div className="pt-3 border-t border-[#252B33]/60 flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          {milestones.map((m, idx) => {
            const isCompleted = m.status === 'completed';
            const isCurrent = m.id === activeMilestone?.id;

            return (
              <div
                key={m.id}
                onClick={() => onNavigate(`/app/projects/${project.id}/roadmap`)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs whitespace-nowrap cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-[#181D23] border-[#F5A524] text-[#F5F7FA]'
                    : isCompleted
                    ? 'bg-[#0B0D10] border-[#35C98A]/30 text-[#35C98A]'
                    : 'bg-[#0B0D10] border-[#252B33] text-[#9AA4B2]'
                }`}
              >
                <span className="font-mono font-bold">
                  {isCompleted ? '✓' : `0${idx + 1}`}
                </span>
                <span className="truncate max-w-[160px]">{m.title.replace(/^\d+\.\s*/, '')}</span>
                {isCurrent && (
                  <span className="text-[10px] font-mono text-[#F5A524] uppercase font-bold">
                    Focus
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Primary Section: CURRENT FOCUS (Section 14) */}
      {currentFocusTask && (
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#F5A524] font-semibold">
            <Compass className="w-4 h-4" />
            <span>CURRENT FOCUS</span>
          </div>

          <div className="p-6 md:p-8 rounded-2xl bg-[#181D23] border border-[#F5A524]/40 space-y-5 shadow-xl relative overflow-hidden">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-[#9AA4B2]">
                <span className="font-semibold text-[#F5F7FA]">{activeMilestone?.title}</span>
                <span aria-hidden="true">·</span>
                <span>Effort: {currentFocusTask.estimatedEffort || '2 hours'}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-[#F5F7FA]">
                {currentFocusTask.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#9AA4B2] leading-relaxed max-w-3xl">
                {currentFocusTask.description || nextAction?.reason}
              </p>
            </div>

            {currentFocusTask.completionCriteria?.length > 0 && (
              <div className="p-3.5 rounded-lg bg-[#12161B] border border-[#252B33] text-xs space-y-1">
                <span className="text-[#F5A524] font-semibold">Completion criteria:</span>
                <p className="text-[#F5F7FA]">{currentFocusTask.completionCriteria.join(' · ')}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <div className="text-xs text-[#9AA4B2]">
                Unlocks downstream deliverables and removes uncertainty
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleTaskToggle(currentFocusTask.id)}
                  className="px-4 py-2.5 rounded-lg border border-[#252B33] hover:border-[#35C98A] text-[#9AA4B2] hover:text-[#35C98A] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Complete</span>
                </button>

                <button
                  onClick={() => setSelectedTaskForDoIt(currentFocusTask)}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#F5A524] text-[#0B0D10] text-xs font-bold hover:bg-[#F5A524]/90 transition-all shadow-md shadow-[#F5A524]/10 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Do it</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Grid: Reality Check & Active Tasks Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Reality Check Card (Section 14 & 18) */}
        {realityCheck && (
          <div className="p-6 rounded-2xl bg-[#12161B] border border-[#252B33] flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#252B33] pb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#EF6461]" />
                  <span className="text-xs font-mono uppercase tracking-wider text-[#F5F7FA] font-bold">
                    REALITY CHECK
                  </span>
                </div>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold ${
                    realityCheck.overallRisk === 'low'
                      ? 'bg-[#35C98A]/10 text-[#35C98A] border border-[#35C98A]/30'
                      : realityCheck.overallRisk === 'moderate'
                      ? 'bg-[#F5A524]/10 text-[#F5A524] border border-[#F5A524]/30'
                      : 'bg-[#EF6461]/10 text-[#EF6461] border border-[#EF6461]/30'
                  }`}
                >
                  {realityCheck.overallRisk.toUpperCase()} RISK
                </span>
              </div>

              <p className="text-xs text-[#9AA4B2] leading-relaxed">
                {realityCheck.summary}
              </p>

              {/* Concerns List */}
              <div className="space-y-3">
                {realityCheck.concerns.slice(0, 2).map((concern, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#181D23] border border-[#252B33] space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#F5F7FA]">{concern.title}</span>
                      <span className="text-[10px] font-mono text-[#EF6461] uppercase">{concern.severity}</span>
                    </div>
                    <p className="text-[#9AA4B2] leading-relaxed">{concern.reason}</p>
                    <div className="text-[#35C98A] pt-1">
                      <span className="font-semibold">Mitigation:</span> {concern.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Recommendation Action */}
            {realityCheck.recommendations.length > 0 && (
              <div className="pt-3 border-t border-[#252B33] flex items-center justify-between">
                <span className="text-xs text-[#9AA4B2] line-clamp-1 max-w-xs">
                  Rec: {realityCheck.recommendations[0]}
                </span>
                <button
                  onClick={() => handleApplyRecommendation(realityCheck.recommendations[0])}
                  className="px-3 py-1.5 rounded-lg bg-[#252B33] hover:bg-[#374151] text-xs font-semibold text-[#F5F7FA] transition-colors shrink-0"
                >
                  Apply recommendation
                </button>
              </div>
            )}
          </div>
        )}

        {/* Current Milestone Tasks Preview */}
        <div className="p-6 rounded-2xl bg-[#12161B] border border-[#252B33] flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#252B33] pb-3">
              <div className="flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-[#F5A524]" />
                <span className="text-xs font-mono uppercase tracking-wider text-[#F5F7FA] font-bold">
                  ACTIVE TASKS ({currentTasks.length})
                </span>
              </div>
              <button
                onClick={() => onNavigate(`/app/projects/${project.id}/tasks`)}
                className="text-xs text-[#F5A524] hover:underline font-semibold"
              >
                View all tasks →
              </button>
            </div>

            <div className="space-y-2.5">
              {currentTasks.length === 0 ? (
                <div className="text-xs text-[#9AA4B2] py-8 text-center">
                  No active tasks in current milestone.
                </div>
              ) : (
                currentTasks.map((t) => {
                  const isDone = t.status === 'done';
                  return (
                    <div
                      key={t.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                        isDone
                          ? 'bg-[#0B0D10] border-[#252B33]/60 opacity-60'
                          : 'bg-[#181D23] border-[#252B33] hover:border-[#374151]'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <button
                          onClick={() => handleTaskToggle(t.id)}
                          className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center shrink-0 transition-colors ${
                            isDone
                              ? 'bg-[#35C98A] text-[#0B0D10]'
                              : 'border border-[#252B33] hover:border-[#F5A524]'
                          }`}
                        >
                          {isDone && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                        <div className="min-w-0">
                          <div className={`text-xs font-medium leading-snug ${isDone ? 'line-through text-[#9AA4B2]' : 'text-[#F5F7FA]'}`}>
                            {t.title}
                          </div>
                          <div className="text-[11px] text-[#9AA4B2] mt-0.5 flex items-center gap-2">
                            <span>{t.estimatedEffort || '2h'}</span>
                            <span aria-hidden="true">·</span>
                            <span className="uppercase font-mono">{t.priority}</span>
                          </div>
                        </div>
                      </div>

                      {!isDone && (
                        <button
                          onClick={() => setSelectedTaskForDoIt(t)}
                          className="px-2.5 py-1 rounded bg-[#F5A524]/10 hover:bg-[#F5A524]/20 text-[#F5A524] text-[11px] font-semibold transition-colors shrink-0 cursor-pointer"
                        >
                          Do it
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[#252B33] flex items-center justify-between text-xs text-[#9AA4B2]">
            <span>Milestone: {activeMilestone?.title}</span>
            <span className="font-mono text-[#F5A524]">{activeMilestone?.status}</span>
          </div>
        </div>

      </div>

      {/* Deliverable Modal */}
      {selectedTaskForDoIt && (
        <DeliverableModal
          task={selectedTaskForDoIt}
          project={project}
          isOpen={!!selectedTaskForDoIt}
          onClose={() => setSelectedTaskForDoIt(null)}
          onTaskCompleted={(tId) => handleTaskToggle(tId)}
        />
      )}

      {/* Persistent AI Project Assistant Drawer */}
      <AssistantDrawer
        isOpen={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        project={project}
        onNavigateToRoadmap={() => onNavigate(`/app/projects/${project.id}/roadmap`)}
        onNavigateToTasks={() => onNavigate(`/app/projects/${project.id}/tasks`)}
      />
    </div>
  );
};
