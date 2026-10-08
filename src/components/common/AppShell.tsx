import React, { useState } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import {
  Flame,
  Plus,
  LayoutDashboard,
  FolderKanban,
  Settings,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface AppShellProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentPath,
  onNavigate,
  children,
}) => {
  const { projects, activeProjectId, activeProject, setActiveProjectId, settings } = useProjectStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);

  const navItems = [
    { label: 'Home', path: '/app', icon: LayoutDashboard },
    { label: 'Projects', path: '/app/projects', icon: FolderKanban },
    { label: 'Settings', path: '/app/settings', icon: Settings },
  ];

  const handleNav = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F5F7FA] flex flex-col md:flex-row antialiased">
      
      {/* Mobile Top Navigation */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#12161B] border-b border-[#252B33] sticky top-0 z-30">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleNav('/')}>
          <div className="w-8 h-8 rounded-lg bg-[#F5A524] flex items-center justify-center text-[#0B0D10] shadow-sm">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <span className="font-display font-bold text-lg tracking-wider text-[#F5F7FA]">FORGE</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleNav('/app/new')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F5A524] text-[#0B0D10] text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>New</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#9AA4B2] hover:text-[#F5F7FA] hover:bg-[#181D23]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[53px] z-40 bg-[#12161B] border-b border-[#252B33] p-5 space-y-4 animate-in slide-in-from-top duration-150">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wider text-[#9AA4B2] px-3 py-1">Navigation</div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#181D23] text-[#F5A524] border border-[#252B33]'
                      : 'text-[#9AA4B2] hover:text-[#F5F7FA] hover:bg-[#181D23]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#252B33] space-y-2">
            <div className="text-xs uppercase tracking-wider text-[#9AA4B2] px-3">Switch Project</div>
            <div className="space-y-1 max-h-44 overflow-y-auto">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setActiveProjectId(p.id);
                    handleNav(`/app/projects/${p.id}`);
                  }}
                  className={`w-full text-left px-3.5 py-2 rounded-lg text-xs truncate transition-colors ${
                    p.id === activeProjectId
                      ? 'bg-[#F5A524]/10 text-[#F5A524] border border-[#F5A524]/20'
                      : 'text-[#9AA4B2] hover:text-[#F5F7FA] hover:bg-[#181D23]'
                  }`}
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-[#12161B] border-r border-[#252B33] h-screen sticky top-0 select-none">
        {/* Brand Area */}
        <div className="p-5 border-b border-[#252B33] flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNav('/')}>
            <div className="w-9 h-9 rounded-xl bg-[#F5A524] flex items-center justify-center text-[#0B0D10] shadow-md shadow-[#F5A524]/20">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="font-display font-bold text-lg tracking-wider text-[#F5F7FA] leading-none">
                FORGE
              </div>
              <div className="text-[11px] text-[#9AA4B2] tracking-tight mt-1">
                Turn intentions into execution
              </div>
            </div>
          </div>
        </div>

        {/* Action: + New Project */}
        <div className="p-4">
          <button
            onClick={() => handleNav('/app/new')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#F5A524] text-[#0B0D10] text-sm font-semibold hover:bg-[#F5A524]/90 transition-all shadow-md shadow-[#F5A524]/10 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Project</span>
          </button>
        </div>

        {/* Primary Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path || (item.path === '/app/projects' && currentPath.startsWith('/app/projects'));
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#181D23] text-[#F5F7FA] border border-[#252B33]'
                    : 'text-[#9AA4B2] hover:text-[#F5F7FA] hover:bg-[#181D23]/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#F5A524]' : 'text-[#9AA4B2]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Quick Active Project Selector */}
          {activeProject && (
            <div className="pt-6">
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9AA4B2]">
                  Active Project
                </span>
                <span className="text-[11px] font-mono text-[#F5A524]">{activeProject.progress}%</span>
              </div>
              <div className="relative">
                <button
                  onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#181D23] border border-[#252B33] text-left text-xs text-[#F5F7FA] hover:border-[#374151] transition-colors"
                >
                  <span className="truncate">{activeProject.title}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#9AA4B2] shrink-0" />
                </button>

                {projectDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#181D23] border border-[#252B33] rounded-lg shadow-xl py-1 z-20 max-h-48 overflow-y-auto">
                    {projects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setActiveProjectId(p.id);
                          setProjectDropdownOpen(false);
                          handleNav(`/app/projects/${p.id}`);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs truncate transition-colors ${
                          p.id === activeProject.id
                            ? 'text-[#F5A524] font-semibold bg-[#F5A524]/10'
                            : 'text-[#9AA4B2] hover:text-[#F5F7FA] hover:bg-[#252B33]'
                        }`}
                      >
                        {p.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>

        {/* User Footer Card */}
        <div className="p-4 border-t border-[#252B33] bg-[#0B0D10]/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#181D23] border border-[#252B33] flex items-center justify-center font-bold text-xs text-[#F5A524]">
              {settings.profile.displayName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-[#F5F7FA] truncate">
                {settings.profile.displayName}
              </div>
              <div className="text-[11px] text-[#9AA4B2] truncate">
                {settings.profile.role}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
