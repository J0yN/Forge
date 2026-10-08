import React, { useState } from 'react';
import { Project, Task, TaskStatus } from '../types';
import { useProjectStore } from '../store/useProjectStore';
import { DeliverableModal } from '../components/common/DeliverableModal';
import { AssistantDrawer } from '../components/common/AssistantDrawer';
import {
  ListTodo,
  CheckCircle2,
  Sparkles,
  Search,
  Filter,
  Plus,
  ArrowRight,
  Clock,
  Layers,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface TasksViewProps {
  project: Project;
  onNavigate: (path: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({ project, onNavigate }) => {
  const {
    getProjectTasks,
    getProjectMilestones,
    toggleTaskCompletion,
    updateTask,
  } = useProjectStore();

  const tasks = getProjectTasks(project.id);
  const milestones = getProjectMilestones(project.id);

  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [milestoneFilter, setMilestoneFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedTaskForDoIt, setSelectedTaskForDoIt] = useState<Task | null>(null);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredTasks = tasks.filter((t) => {
    const matchesStatus = statusFilter === 'all' ? true : t.status === statusFilter;
    const matchesMilestone = milestoneFilter === 'all' ? true : t.milestoneId === milestoneFilter;
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesMilestone && matchesSearch;
  });

  const handleToggle = (taskId: string) => {
    const res = toggleTaskCompletion(taskId);
    if (res.unlockedMessage) {
      setToastMessage(res.unlockedMessage);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTask(taskId, {
      status: newStatus,
      completedAt: newStatus === 'done' ? new Date().toISOString() : null,
    });
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-[#181D23] border border-[#35C98A] text-[#35C98A] text-xs font-semibold shadow-2xl animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

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
            Project Tasks
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA4B2] mt-1">
            Action items broken down with concrete effort estimates and artifact generators.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setAssistantOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#181D23] border border-[#252B33] hover:border-[#F5A524] text-xs font-semibold text-[#F5F7FA] transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#F5A524]" />
            <span>Ask FORGE</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Ribbon */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#9AA4B2] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#12161B] border border-[#252B33] text-xs text-[#F5F7FA] placeholder-[#9AA4B2]/60 focus:outline-none focus:border-[#F5A524]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Milestone Select */}
          <select
            value={milestoneFilter}
            onChange={(e) => setMilestoneFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#12161B] border border-[#252B33] text-xs text-[#F5F7FA] focus:outline-none"
          >
            <option value="all">All Milestones</option>
            {milestones.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#12161B] border border-[#252B33] rounded-lg">
            {(['all', 'todo', 'in_progress', 'done'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-md text-xs font-medium uppercase font-mono transition-colors ${
                  statusFilter === st
                    ? 'bg-[#181D23] text-[#F5F7FA] shadow-xs'
                    : 'text-[#9AA4B2] hover:text-[#F5F7FA]'
                }`}
              >
                {st === 'all' ? 'All' : st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-12 rounded-2xl bg-[#12161B] border border-[#252B33] text-center space-y-3">
            <ListTodo className="w-8 h-8 text-[#9AA4B2] mx-auto" />
            <h3 className="text-sm font-semibold text-[#F5F7FA]">No active tasks</h3>
            <p className="text-xs text-[#9AA4B2] max-w-sm mx-auto">
              You're either finished or the next move hasn't been defined yet. Ask FORGE to recommend the next phase.
            </p>
            <button
              onClick={() => setAssistantOpen(true)}
              className="px-4 py-2 rounded-lg bg-[#F5A524] text-[#0B0D10] text-xs font-semibold"
            >
              Ask FORGE
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const milestone = milestones.find((m) => m.id === task.milestoneId);
            const isDone = task.status === 'done';

            return (
              <div
                key={task.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isDone
                    ? 'bg-[#12161B]/50 border-[#252B33]/60 opacity-60'
                    : 'bg-[#12161B] border-[#252B33] hover:border-[#374151]'
                }`}
              >
                <div className="flex items-start gap-4 min-w-0">
                  <button
                    onClick={() => handleToggle(task.id)}
                    className={`w-5 h-5 mt-0.5 rounded flex items-center justify-center shrink-0 transition-colors ${
                      isDone
                        ? 'bg-[#35C98A] text-[#0B0D10]'
                        : 'border border-[#252B33] hover:border-[#F5A524]'
                    }`}
                  >
                    {isDone && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#9AA4B2]">
                      <span className="font-semibold text-[#F5A524]">{milestone?.title || 'Milestone'}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono uppercase text-xs font-semibold">{task.priority} Priority</span>
                      <span aria-hidden="true">·</span>
                      <span>Est: {task.estimatedEffort || '2h'}</span>
                    </div>

                    <h3 className={`text-sm md:text-base font-semibold leading-snug ${isDone ? 'line-through text-[#9AA4B2]' : 'text-[#F5F7FA]'}`}>
                      {task.title}
                    </h3>

                    <p className="text-xs text-[#9AA4B2] leading-relaxed line-clamp-2 max-w-3xl">
                      {task.description}
                    </p>

                    {task.completionCriteria?.length > 0 && (
                      <div className="text-[11px] text-[#9AA4B2] flex items-center gap-1.5 pt-1">
                        <span className="text-[#35C98A]">Criteria:</span>
                        <span>{task.completionCriteria.join(' · ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action Trigger */}
                <div className="flex items-center gap-3 self-end md:self-center shrink-0 pt-2 md:pt-0">
                  {/* Status Dropdown */}
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#181D23] border border-[#252B33] text-xs text-[#9AA4B2] focus:outline-none uppercase font-mono text-[11px]"
                  >
                    <option value="todo">TODO</option>
                    <option value="in_progress">IN PROGRESS</option>
                    <option value="blocked">BLOCKED</option>
                    <option value="done">DONE</option>
                  </select>

                  <button
                    onClick={() => setSelectedTaskForDoIt(task)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F5A524] hover:bg-[#F5A524]/90 text-[#0B0D10] text-xs font-bold transition-all shadow-sm shadow-[#F5A524]/10 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Do it</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Deliverable Modal */}
      {selectedTaskForDoIt && (
        <DeliverableModal
          task={selectedTaskForDoIt}
          project={project}
          isOpen={!!selectedTaskForDoIt}
          onClose={() => setSelectedTaskForDoIt(null)}
          onTaskCompleted={(tId) => handleToggle(tId)}
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
