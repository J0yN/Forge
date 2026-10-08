import React, { useState } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { Project, Task } from '../types';
import { DeliverableModal } from '../components/common/DeliverableModal';
import {
  Compass,
  ArrowRight,
  FolderKanban,
  CheckCircle2,
  Paperclip,
  Clock,
  Sparkles,
  Milestone as MilestoneIcon,
  Plus,
} from 'lucide-react';

interface HomeDashboardViewProps {
  onNavigate: (path: string) => void;
}

export const HomeDashboardView: React.FC<HomeDashboardViewProps> = ({ onNavigate }) => {
  const {
    projects,
    activeProject,
    setActiveProjectId,
    getNextAction,
    getProjectMilestones,
    getProjectTasks,
    toggleTaskCompletion,
  } = useProjectStore();

  const [quickInput, setQuickInput] = useState('');
  const [selectedTaskForDoIt, setSelectedTaskForDoIt] = useState<Task | null>(null);
  const [unlockNotification, setUnlockNotification] = useState<string | null>(null);

  // Derive highest impact next action from active project or first active project
  const currentTargetProject = activeProject || projects[0] || null;
  const nextAction = currentTargetProject ? getNextAction(currentTargetProject.id) : null;
  const targetProjectTasks = currentTargetProject ? getProjectTasks(currentTargetProject.id) : [];
  const activeTask = nextAction?.taskId
    ? targetProjectTasks.find((t) => t.id === nextAction.taskId) || null
    : null;

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    sessionStorage.setItem('forge_draft_goal', quickInput.trim());
    onNavigate('/app/new');
  };

  const handleDoItClick = () => {
    if (activeTask && currentTargetProject) {
      setSelectedTaskForDoIt(activeTask);
    } else if (currentTargetProject) {
      onNavigate(`/app/projects/${currentTargetProject.id}/tasks`);
    } else {
      onNavigate('/app/new');
    }
  };

  const handleTaskComplete = (taskId: string) => {
    const res = toggleTaskCompletion(taskId);
    if (res.unlockedMessage) {
      setUnlockNotification(res.unlockedMessage);
      setTimeout(() => setUnlockNotification(null), 4000);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-200">
      
      {/* Unlock Toast Notification */}
      {unlockNotification && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#181D23] border border-[#35C98A] text-[#35C98A] text-xs font-semibold shadow-2xl animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{unlockNotification}</span>
        </div>
      )}

      {/* Top Greeting & Fast Goal Input */}
      <section className="space-y-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-[#9AA4B2] font-semibold">
            Execution Console
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-[#F5F7FA] mt-1">
            Good morning.
          </h1>
          <p className="text-base text-[#9AA4B2]">
            What are you working toward?
          </p>
        </div>

        <form onSubmit={handleQuickSubmit} className="relative">
          <div className="p-3 sm:p-4 rounded-xl bg-[#12161B] border border-[#252B33] focus-within:border-[#F5A524] transition-all flex flex-col sm:flex-row items-center gap-3 shadow-lg">
            <input
              type="text"
              placeholder="Describe a goal, problem, idea, or project..."
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              className="flex-1 w-full bg-transparent text-sm md:text-base text-[#F5F7FA] placeholder-[#9AA4B2]/60 focus:outline-none"
            />
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => {
                  sessionStorage.setItem('forge_draft_goal', quickInput);
                  onNavigate('/app/new');
                }}
                className="p-2.5 rounded-lg text-[#9AA4B2] hover:text-[#F5F7FA] hover:bg-[#181D23] transition-colors"
                title="Attach document or spec"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                type="submit"
                disabled={!quickInput.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#F5A524] text-[#0B0D10] text-xs md:text-sm font-semibold hover:bg-[#F5A524]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Start Forging</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Core "YOUR NEXT MOVE" Feature Card */}
      {currentTargetProject && nextAction && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#F5A524] font-semibold">
              <Compass className="w-4 h-4" />
              <span>YOUR NEXT MOVE</span>
            </div>
            <div className="text-xs text-[#9AA4B2] flex items-center gap-1.5">
              <span>Project:</span>
              <button
                onClick={() => onNavigate(`/app/projects/${currentTargetProject.id}`)}
                className="text-[#F5F7FA] hover:underline font-medium truncate max-w-[200px]"
              >
                {currentTargetProject.title}
              </button>
            </div>
          </div>

          <div className="p-6 md:p-8 rounded-2xl bg-[#12161B] border border-[#252B33] hover:border-[#374151] transition-all space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5A524]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-3">
              <h2 className="text-xl md:text-2xl font-bold text-[#F5F7FA] leading-snug">
                {nextAction.title}
              </h2>
              
              <div className="space-y-1.5 text-xs sm:text-sm text-[#9AA4B2] max-w-3xl">
                <div className="text-[#F5A524] font-semibold uppercase tracking-wider text-[11px]">
                  Why this matters:
                </div>
                <p className="leading-relaxed text-[#F5F7FA]/90">
                  {nextAction.reason}
                </p>
              </div>

              {nextAction.blockingFactor && (
                <div className="text-xs text-[#9AA4B2] flex items-center gap-2 pt-1 font-mono">
                  <span className="text-[#EF6461] font-semibold">Dependency:</span>
                  <span>{nextAction.blockingFactor}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 border-t border-[#252B33]/60">
              <div className="flex items-center gap-4 text-xs text-[#9AA4B2]">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Est: {nextAction.estimatedEffort}</span>
                </div>
                <span aria-hidden="true">·</span>
                <span>Impact: High Leverage</span>
              </div>

              <div className="flex items-center gap-3">
                {activeTask && (
                  <button
                    onClick={() => handleTaskComplete(activeTask.id)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#252B33] hover:border-[#35C98A] text-[#9AA4B2] hover:text-[#35C98A] text-xs font-semibold transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Done</span>
                  </button>
                )}
                <button
                  onClick={handleDoItClick}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#F5A524] text-[#0B0D10] text-xs sm:text-sm font-bold hover:bg-[#F5A524]/90 transition-all shadow-md shadow-[#F5A524]/10 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Do it</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Active Projects List */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#9AA4B2]">Projects</div>
            <h2 className="text-lg font-bold text-[#F5F7FA]">Continue Execution</h2>
          </div>
          <button
            onClick={() => onNavigate('/app/projects')}
            className="text-xs text-[#F5A524] hover:underline flex items-center gap-1 font-semibold"
          >
            <span>View all ({projects.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="p-10 rounded-2xl bg-[#12161B] border border-[#252B33] text-center space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#181D23] text-[#9AA4B2] flex items-center justify-center mx-auto">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#F5F7FA]">Nothing here yet.</h3>
              <p className="text-xs text-[#9AA4B2] mt-1 max-w-sm mx-auto">
                Every meaningful project starts as an unfinished idea. Describe what you want to achieve above.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/app/new')}
              className="px-5 py-2 rounded-lg bg-[#F5A524] text-[#0B0D10] text-xs font-semibold"
            >
              Start Forging
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => {
              const milestones = getProjectMilestones(project.id);
              const activeMilestone = milestones.find((m) => m.id === project.currentMilestoneId) || milestones[0];
              const projectNext = getNextAction(project.id);

              return (
                <div
                  key={project.id}
                  onClick={() => {
                    setActiveProjectId(project.id);
                    onNavigate(`/app/projects/${project.id}`);
                  }}
                  className={`p-5 rounded-xl border transition-all flex flex-col justify-between cursor-pointer space-y-4 ${
                    project.id === activeProject?.id
                      ? 'bg-[#181D23] border-[#F5A524]/60 shadow-md'
                      : 'bg-[#12161B] border-[#252B33] hover:border-[#374151]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-[#F5F7FA] line-clamp-1">
                        {project.title}
                      </h3>
                      <span className="font-mono text-xs font-semibold text-[#F5A524] shrink-0">
                        {project.progress}%
                      </span>
                    </div>

                    <p className="text-xs text-[#9AA4B2] line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#0B0D10] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#F5A524] h-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>

                  {/* Milestone & Next Action */}
                  <div className="pt-2 border-t border-[#252B33] space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 text-[#9AA4B2]">
                      <MilestoneIcon className="w-3.5 h-3.5 text-[#F5A524]" />
                      <span className="truncate">{activeMilestone?.title || 'Initial Milestone'}</span>
                    </div>

                    {projectNext && (
                      <div className="text-[11px] text-[#F5F7FA]/90 bg-[#0B0D10] p-2 rounded-lg line-clamp-1 border border-[#252B33]">
                        <span className="text-[#F5A524] font-semibold">Next:</span> {projectNext.title}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Deliverable Modal */}
      {selectedTaskForDoIt && currentTargetProject && (
        <DeliverableModal
          task={selectedTaskForDoIt}
          project={currentTargetProject}
          isOpen={!!selectedTaskForDoIt}
          onClose={() => setSelectedTaskForDoIt(null)}
          onTaskCompleted={(tId) => handleTaskComplete(tId)}
        />
      )}
    </div>
  );
};
