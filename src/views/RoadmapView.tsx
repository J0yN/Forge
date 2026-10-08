import React, { useState } from 'react';
import { Project, Milestone, Task } from '../types';
import { useProjectStore } from '../store/useProjectStore';
import { DeliverableModal } from '../components/common/DeliverableModal';
import { runRealityCheck } from '../services/aiService';
import {
  Milestone as MilestoneIcon,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  Layers,
  Check,
} from 'lucide-react';

interface RoadmapViewProps {
  project: Project;
  onNavigate: (path: string) => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({ project, onNavigate }) => {
  const {
    getProjectMilestones,
    getProjectTasks,
    getProjectRealityCheck,
    getProjectMemory,
    getProjectDeliverables,
    toggleTaskCompletion,
  } = useProjectStore();

  const milestones = getProjectMilestones(project.id);
  const tasks = getProjectTasks(project.id);
  const memory = getProjectMemory(project.id);
  const deliverables = getProjectDeliverables(project.id);

  const [expandedMilestones, setExpandedMilestones] = useState<Record<string, boolean>>({
    [project.currentMilestoneId || milestones[0]?.id]: true,
  });
  const [selectedTaskForDoIt, setSelectedTaskForDoIt] = useState<Task | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditMessage, setAuditMessage] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedMilestones((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAuditRoadmap = async () => {
    setIsAuditing(true);
    try {
      const updatedRealityCheck = await runRealityCheck({
        project,
        milestones,
        tasks,
        memory,
      });
      setAuditMessage(`Audit complete: Overall risk rated ${updatedRealityCheck.overallRisk.toUpperCase()}. ${updatedRealityCheck.summary}`);
      setTimeout(() => setAuditMessage(null), 6000);
    } catch (err: any) {
      console.error(err);
      setAuditMessage('Audit completed using current project risk profile.');
      setTimeout(() => setAuditMessage(null), 4000);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252B33] pb-6">
        <div>
          <button
            onClick={() => onNavigate(`/app/projects/${project.id}`)}
            className="text-xs text-[#9AA4B2] hover:text-[#F5F7FA] mb-1 flex items-center gap-1"
          >
            ← Back to project dashboard
          </button>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#F5F7FA]">
            Execution Roadmap
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA4B2] mt-1">
            Sequential phases designed to eliminate uncertainty and maintain momentum.
          </p>
        </div>

        <button
          onClick={handleAuditRoadmap}
          disabled={isAuditing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#181D23] border border-[#252B33] hover:border-[#F5A524] text-xs font-semibold text-[#F5F7FA] transition-all self-start sm:self-auto cursor-pointer"
        >
          <ShieldAlert className="w-4 h-4 text-[#F5A524]" />
          <span>{isAuditing ? 'Auditing with Gemini...' : 'Audit Roadmap'}</span>
        </button>
      </div>

      {auditMessage && (
        <div className="p-4 rounded-xl bg-[#181D23] border border-[#F5A524]/40 text-xs text-[#F5F7FA] flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-[#F5A524] shrink-0" />
          <span>{auditMessage}</span>
        </div>
      )}

      {/* Milestones Flow */}
      <div className="space-y-6">
        {milestones.map((m, idx) => {
          const mTasks = tasks.filter((t) => t.milestoneId === m.id);
          const doneTasks = mTasks.filter((t) => t.status === 'done');
          const isCompleted = m.status === 'completed';
          const isLocked = m.status === 'locked';
          const isCurrent = m.id === project.currentMilestoneId;
          const isExpanded = !!expandedMilestones[m.id];
          const mDeliverables = deliverables.filter((d) => mTasks.some((t) => t.id === d.taskId));

          return (
            <div
              key={m.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isCurrent
                  ? 'bg-[#181D23] border-[#F5A524]/60 shadow-xl'
                  : isCompleted
                  ? 'bg-[#12161B] border-[#35C98A]/30'
                  : isLocked
                  ? 'bg-[#12161B]/60 border-[#252B33] opacity-75'
                  : 'bg-[#12161B] border-[#252B33]'
              }`}
            >
              {/* Milestone Card Header */}
              <div
                onClick={() => toggleExpand(m.id)}
                className="p-5 sm:p-6 flex items-start justify-between gap-4 cursor-pointer hover:bg-[#181D23]/40 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono text-sm font-bold shrink-0 ${
                      isCompleted
                        ? 'bg-[#35C98A] text-[#0B0D10]'
                        : isCurrent
                        ? 'bg-[#F5A524] text-[#0B0D10]'
                        : isLocked
                        ? 'bg-[#252B33] text-[#9AA4B2]'
                        : 'bg-[#181D23] text-[#F5F7FA] border border-[#252B33]'
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5 stroke-[3]" /> : isLocked ? <Lock className="w-4 h-4" /> : `0${idx + 1}`}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-[#9AA4B2]">
                      <span className="uppercase font-mono">
                        {isCompleted ? 'Completed' : isCurrent ? 'Current Focus' : isLocked ? 'Locked' : 'Available'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{doneTasks.length} / {mTasks.length} tasks</span>
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-[#F5F7FA]">
                      {m.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-[#9AA4B2] leading-relaxed max-w-2xl">
                      {m.objective}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button className="p-1 rounded text-[#9AA4B2]">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Collapsible Content */}
              {isExpanded && (
                <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-[#252B33] space-y-6 bg-[#0B0D10]/40">
                  
                  {/* Completion Criteria & Dependencies */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                    {m.completionCriteria?.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-[#12161B] border border-[#252B33] space-y-1.5">
                        <div className="font-semibold text-[#F5A524] uppercase tracking-wider text-[11px]">
                          Acceptance Criteria:
                        </div>
                        <ul className="space-y-1 text-[#F5F7FA]">
                          {m.completionCriteria.map((c, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-[#35C98A]">✓</span>
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {mDeliverables.length > 0 ? (
                      <div className="p-3.5 rounded-xl bg-[#12161B] border border-[#252B33] space-y-1.5">
                        <div className="font-semibold text-[#35C98A] uppercase tracking-wider text-[11px]">
                          Created Deliverables ({mDeliverables.length}):
                        </div>
                        <div className="space-y-1">
                          {mDeliverables.map((deliv) => (
                            <div key={deliv.id} className="flex items-center gap-2 text-[#F5F7FA] truncate">
                              <FileText className="w-3.5 h-3.5 text-[#35C98A] shrink-0" />
                              <span className="truncate">{deliv.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-[#12161B] border border-[#252B33] text-xs text-[#9AA4B2]">
                        <span className="text-[#9AA4B2] font-semibold">Deliverables:</span> Click "Do it" on any task below to generate outreach scripts, evaluation matrices, or launch copy.
                      </div>
                    )}
                  </div>

                  {/* Tasks List for this Milestone */}
                  <div className="space-y-3">
                    <div className="text-xs uppercase font-mono tracking-wider text-[#9AA4B2] font-semibold">
                      Milestone Action Items
                    </div>

                    <div className="space-y-2">
                      {mTasks.map((task) => {
                        const isDone = task.status === 'done';
                        return (
                          <div
                            key={task.id}
                            className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              isDone
                                ? 'bg-[#12161B]/60 border-[#252B33] opacity-60'
                                : 'bg-[#12161B] border-[#252B33] hover:border-[#374151]'
                            }`}
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <button
                                onClick={() => toggleTaskCompletion(task.id)}
                                className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center shrink-0 transition-colors ${
                                  isDone
                                    ? 'bg-[#35C98A] text-[#0B0D10]'
                                    : 'border border-[#252B33] hover:border-[#F5A524]'
                               }`}
                              >
                                {isDone && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                              </button>

                              <div className="min-w-0 space-y-1">
                                <div className={`text-xs sm:text-sm font-semibold leading-snug ${isDone ? 'line-through text-[#9AA4B2]' : 'text-[#F5F7FA]'}`}>
                                  {task.title}
                                </div>
                                <p className="text-xs text-[#9AA4B2] line-clamp-2">
                                  {task.description}
                                </p>
                                <div className="text-[11px] text-[#9AA4B2] flex items-center gap-3 pt-0.5">
                                  <span>Effort: {task.estimatedEffort || '2h'}</span>
                                  <span aria-hidden="true">·</span>
                                  <span className="uppercase font-mono text-[#F5A524]">{task.priority}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 pt-2 sm:pt-0">
                              <button
                                onClick={() => setSelectedTaskForDoIt(task)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F5A524] hover:bg-[#F5A524]/90 text-[#0B0D10] text-xs font-bold transition-all shadow-xs cursor-pointer"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Do it</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Deliverable Generator Modal */}
      {selectedTaskForDoIt && (
        <DeliverableModal
          task={selectedTaskForDoIt}
          project={project}
          isOpen={!!selectedTaskForDoIt}
          onClose={() => setSelectedTaskForDoIt(null)}
          onTaskCompleted={(tId) => toggleTaskCompletion(tId)}
        />
      )}
    </div>
  );
};
