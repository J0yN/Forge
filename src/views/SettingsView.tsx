import React, { useState } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import {
  User,
  Moon,
  Sparkles,
  Database,
  Trash2,
  Download,
  RotateCcw,
  Plus,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface SettingsViewProps {
  onNavigate: (path: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onNavigate }) => {
  const {
    settings,
    updateSettings,
    activeProject,
    getProjectMemory,
    addProjectMemoryFact,
    addProjectMemoryDecision,
    deleteProjectMemoryFact,
    resetToDemoData,
    state,
  } = useProjectStore();

  const [displayName, setDisplayName] = useState(settings.profile.displayName);
  const [role, setRole] = useState(settings.profile.role);
  const [theme, setTheme] = useState(settings.appearance.theme);
  const [responseStyle, setResponseStyle] = useState(settings.aiPreferences.responseStyle);
  const [challengeAssumptions, setChallengeAssumptions] = useState(
    settings.aiPreferences.challengeAssumptions
  );

  // Project Memory adding form
  const [newFactKey, setNewFactKey] = useState('');
  const [newFactVal, setNewFactVal] = useState('');
  const [newDecision, setNewDecision] = useState('');
  const [newDecisionReason, setNewDecisionReason] = useState('');

  const [confirmReset, setConfirmReset] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const memory = activeProject ? getProjectMemory(activeProject.id) : null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      profile: {
        ...settings.profile,
        displayName,
        role,
      },
      appearance: {
        ...settings.appearance,
        theme,
      },
      aiPreferences: {
        ...settings.aiPreferences,
        responseStyle,
        challengeAssumptions,
      },
    });
    setToast('Preferences saved successfully.');
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddFact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !newFactKey.trim() || !newFactVal.trim()) return;
    addProjectMemoryFact(activeProject.id, newFactKey.trim(), newFactVal.trim());
    setNewFactKey('');
    setNewFactVal('');
    setToast('Project memory updated.');
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !newDecision.trim()) return;
    addProjectMemoryDecision(activeProject.id, newDecision.trim(), newDecisionReason.trim() || 'Strategic choice');
    setNewDecision('');
    setNewDecisionReason('');
    setToast('Decision added to project memory.');
    setTimeout(() => setToast(null), 3000);
  };

  const handleExportData = () => {
    const exportData = {
      project: activeProject,
      memory,
      exportedAt: new Date().toISOString(),
      platform: 'FORGE Execution Engine',
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forge-export-${activeProject?.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'all'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    resetToDemoData();
    setConfirmReset(false);
    setToast('Demo projects restored.');
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-10 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-[#181D23] border border-[#35C98A] text-[#35C98A] text-xs font-semibold shadow-2xl animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="border-b border-[#252B33] pb-6">
        <div className="text-xs font-mono uppercase tracking-wider text-[#9AA4B2]">Preferences</div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] mt-1">
          Settings & Memory
        </h1>
        <p className="text-xs sm:text-sm text-[#9AA4B2] mt-1">
          Control execution defaults, calibrate AI strategic skepticism, and manage persistent project facts.
        </p>
      </div>

      {/* Form Section: Profile & Preferences */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        
        {/* User Profile */}
        <div className="p-6 rounded-2xl bg-[#12161B] border border-[#252B33] space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#F5A524] font-semibold">
            <User className="w-4 h-4" />
            <span>Profile & Persona</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-[#9AA4B2] font-medium">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#181D23] border border-[#252B33] text-[#F5F7FA] focus:outline-none focus:border-[#F5A524]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[#9AA4B2] font-medium">Primary Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#181D23] border border-[#252B33] text-[#F5F7FA] focus:outline-none focus:border-[#F5A524]"
              />
            </div>
          </div>
        </div>

        {/* AI Preferences */}
        <div className="p-6 rounded-2xl bg-[#12161B] border border-[#252B33] space-y-5">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#F5A524] font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>AI Execution Preferences</span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-2">
              <label className="text-[#9AA4B2] font-medium">Response Strategy Style</label>
              <div className="grid grid-cols-3 gap-3">
                {(['direct', 'strategic', 'detailed'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setResponseStyle(st)}
                    className={`p-3 rounded-lg border text-center capitalize transition-colors ${
                      responseStyle === st
                        ? 'bg-[#181D23] border-[#F5A524] text-[#F5F7FA] font-semibold'
                        : 'bg-[#0B0D10] border-[#252B33] text-[#9AA4B2] hover:text-[#F5F7FA]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#181D23] border border-[#252B33]">
              <div>
                <div className="text-[#F5F7FA] font-semibold">Challenge Unrealistic Assumptions</div>
                <div className="text-[11px] text-[#9AA4B2]">
                  Actively audit missing dependencies and overly optimistic deadlines.
                </div>
              </div>
              <input
                type="checkbox"
                checked={challengeAssumptions}
                onChange={(e) => setChallengeAssumptions(e.target.checked)}
                className="w-4 h-4 accent-[#F5A524] rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#F5A524] text-[#0B0D10] text-xs font-bold hover:bg-[#F5A524]/90 transition-all cursor-pointer"
          >
            Save Preferences
          </button>
        </div>
      </form>

      {/* Project Memory Inspector (Section 20 & 34) */}
      {activeProject && memory && (
        <section className="p-6 rounded-2xl bg-[#12161B] border border-[#252B33] space-y-6">
          <div className="flex items-center justify-between border-b border-[#252B33] pb-4">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#35C98A]" />
              <div>
                <h2 className="text-sm font-bold text-[#F5F7FA]">
                  Active Project Memory ({activeProject.title})
                </h2>
                <p className="text-xs text-[#9AA4B2]">
                  Persistent facts, decisions, and constraints provided to Gemini for all contextual requests.
                </p>
              </div>
            </div>
          </div>

          {/* Known Facts */}
          <div className="space-y-3">
            <div className="text-xs uppercase font-mono tracking-wider text-[#9AA4B2] font-semibold">
              Project Facts
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {memory.facts.map((fact, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#181D23] border border-[#252B33] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-[#F5F7FA]">{fact.key}:</span>{' '}
                    <span className="text-[#9AA4B2]">{fact.value}</span>
                  </div>
                  <button
                    onClick={() => deleteProjectMemoryFact(activeProject.id, fact.key)}
                    className="p-1 text-[#9AA4B2] hover:text-[#EF6461] transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Fact Form */}
            <form onSubmit={handleAddFact} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Fact Key (e.g. Budget Cap)"
                value={newFactKey}
                onChange={(e) => setNewFactKey(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-[#0B0D10] border border-[#252B33] text-xs text-[#F5F7FA] focus:outline-none"
              />
              <input
                type="text"
                placeholder="Value (e.g. $1,500)"
                value={newFactVal}
                onChange={(e) => setNewFactVal(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-[#0B0D10] border border-[#252B33] text-xs text-[#F5F7FA] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!newFactKey.trim() || !newFactVal.trim()}
                className="px-4 py-2 rounded-lg bg-[#252B33] hover:bg-[#374151] text-xs font-semibold text-[#F5F7FA] disabled:opacity-40"
              >
                Add Fact
              </button>
            </form>
          </div>

          {/* Recorded Decisions */}
          <div className="space-y-3 pt-3 border-t border-[#252B33]">
            <div className="text-xs uppercase font-mono tracking-wider text-[#9AA4B2] font-semibold">
              Strategic Decisions
            </div>

            <div className="space-y-2">
              {memory.decisions.map((dec, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#181D23] border border-[#252B33] text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#F5F7FA]">{dec.decision}</span>
                    <span className="font-mono text-[10px] text-[#9AA4B2]">{dec.date}</span>
                  </div>
                  <div className="text-[#9AA4B2]">Reason: {dec.reason}</div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddDecision} className="flex flex-col sm:flex-row gap-2 pt-1">
              <input
                type="text"
                placeholder="Decision (e.g. Launch with 3 products only)"
                value={newDecision}
                onChange={(e) => setNewDecision(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-[#0B0D10] border border-[#252B33] text-xs text-[#F5F7FA] focus:outline-none"
              />
              <input
                type="text"
                placeholder="Reason (e.g. Conserve cash)"
                value={newDecisionReason}
                onChange={(e) => setNewDecisionReason(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-[#0B0D10] border border-[#252B33] text-xs text-[#F5F7FA] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!newDecision.trim()}
                className="px-4 py-2 rounded-lg bg-[#252B33] hover:bg-[#374151] text-xs font-semibold text-[#F5F7FA] disabled:opacity-40"
              >
                Record Decision
              </button>
            </form>
          </div>
        </section>
      )}

      {/* Data Management & Export */}
      <section className="p-6 rounded-2xl bg-[#12161B] border border-[#252B33] space-y-4">
        <div className="text-xs font-mono uppercase tracking-wider text-[#9AA4B2] font-semibold">
          Data & Local Storage
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#181D23] border border-[#252B33] hover:border-[#F5A524] text-[#F5F7FA] transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#F5A524]" />
            <span>Export Active Project (JSON)</span>
          </button>

          {confirmReset ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetData}
                className="px-3.5 py-2 rounded-lg bg-[#EF6461] text-white font-semibold"
              >
                Confirm Restore Demo Data
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-3 py-2 text-[#9AA4B2]"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#181D23] border border-[#252B33] hover:border-[#EF6461] text-[#9AA4B2] hover:text-[#EF6461] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restore Demo Projects</span>
            </button>
          )}
        </div>
      </section>
    </div>
  );
};
