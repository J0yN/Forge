import React, { useState } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import {
  FolderKanban,
  Plus,
  Search,
  ArrowRight,
  Trash2,
  Milestone as MilestoneIcon,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ProjectsListViewProps {
  onNavigate: (path: string) => void;
}

export const ProjectsListView: React.FC<ProjectsListViewProps> = ({ onNavigate }) => {
  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    deleteProject,
    getProjectMilestones,
    getProjectTasks,
    getNextAction,
  } = useProjectStore();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filterStatus === 'all'
        ? true
        : filterStatus === 'completed'
        ? p.status === 'completed' || p.progress === 100
        : p.status !== 'completed' && p.progress < 100;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteProject(id);
    setConfirmDeleteId(null);
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* Header & New Project CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252B33] pb-6">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-[#9AA4B2]">Portfolio</div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-[#F5F7FA] mt-1">
            Projects
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA4B2] mt-1">
            Manage your execution roadmaps, milestone progress, and deliverables.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/app/new')}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#F5A524] text-[#0B0D10] text-xs font-bold hover:bg-[#F5A524]/90 transition-all shadow-md shadow-[#F5A524]/10 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#9AA4B2] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#12161B] border border-[#252B33] text-xs text-[#F5F7FA] placeholder-[#9AA4B2]/60 focus:outline-none focus:border-[#F5A524]"
          />
        </div>

        {/* Segmented Filter Control */}
        <div className="flex items-center gap-1 p-1 bg-[#12161B] border border-[#252B33] rounded-lg">
          {(['all', 'active', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                filterStatus === status
                  ? 'bg-[#181D23] text-[#F5F7FA] shadow-xs'
                  : 'text-[#9AA4B2] hover:text-[#F5F7FA]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#12161B] border border-[#252B33] text-center space-y-4">
          <FolderKanban className="w-8 h-8 text-[#9AA4B2] mx-auto" />
          <div>
            <h3 className="text-sm font-semibold text-[#F5F7FA]">No projects found</h3>
            <p className="text-xs text-[#9AA4B2] mt-1">
              Try adjusting your filter or start forging a new goal.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/app/new')}
            className="px-4 py-2 rounded-lg bg-[#F5A524] text-[#0B0D10] text-xs font-semibold"
          >
            Start Forging
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProjects.map((p) => {
            const milestones = getProjectMilestones(p.id);
            const tasks = getProjectTasks(p.id);
            const nextAction = getNextAction(p.id);
            const completedTasksCount = tasks.filter((t) => t.status === 'done').length;

            return (
              <div
                key={p.id}
                onClick={() => {
                  setActiveProjectId(p.id);
                  onNavigate(`/app/projects/${p.id}`);
                }}
                className={`p-6 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer space-y-5 ${
                  p.id === activeProjectId
                    ? 'bg-[#181D23] border-[#F5A524]/60 shadow-lg'
                    : 'bg-[#12161B] border-[#252B33] hover:border-[#374151]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[11px] text-[#9AA4B2]">
                        <span className="uppercase font-mono">{p.goal.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{milestones.length} Milestones</span>
                      </div>
                      <h2 className="text-base font-bold text-[#F5F7FA] leading-snug">
                        {p.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-xs font-bold text-[#F5A524]">
                        {p.progress}%
                      </span>
                      {confirmDeleteId === p.id ? (
                        <div
                          className="flex items-center gap-1.5 bg-[#EF6461]/20 p-1 rounded-md"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => handleDelete(p.id, e)}
                            className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#EF6461] text-white"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-1 text-[11px] text-[#9AA4B2]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(p.id);
                          }}
                          className="p-1 rounded text-[#9AA4B2] hover:text-[#EF6461] hover:bg-[#252B33] transition-colors"
                          title="Delete project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-[#9AA4B2] line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                {/* Progress Bar & Stats */}
                <div className="space-y-2">
                  <div className="w-full bg-[#0B0D10] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#F5A524] h-full transition-all duration-300"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#9AA4B2]">
                    <span>{completedTasksCount} of {tasks.length} tasks completed</span>
                    <span>{p.status === 'completed' ? 'Completed ✓' : 'Active'}</span>
                  </div>
                </div>

                {/* Next Action Box */}
                {nextAction && (
                  <div className="p-3 rounded-xl bg-[#0B0D10] border border-[#252B33] flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase font-mono text-[#F5A524] font-semibold">
                        Recommended Next Move
                      </div>
                      <div className="text-[#F5F7FA] truncate font-medium mt-0.5">
                        {nextAction.title}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#9AA4B2] shrink-0" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
