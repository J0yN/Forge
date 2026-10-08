import React, { useState } from 'react';
import { Flame, ArrowRight, Check, Sparkles } from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';

interface OnboardingViewProps {
  onNavigate: (path: string) => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onNavigate }) => {
  const { updateSettings } = useProjectStore();
  const [step, setStep] = useState<number>(1);
  const [goalIdea, setGoalIdea] = useState<string>('');
  const [persona, setPersona] = useState<string>('Entrepreneur');
  const [helpModes, setHelpModes] = useState<string[]>([
    'Plan better',
    'Challenge my assumptions',
    'Create the work for me',
  ]);

  const personas = [
    'Entrepreneur',
    'Creator',
    'Student',
    'Professional',
    'Developer',
    'Other',
  ];

  const helpOptions = [
    'Plan better',
    'Move faster',
    'Stay organized',
    'Challenge my assumptions',
    'Create the work for me',
  ];

  const toggleHelpOption = (option: string) => {
    setHelpModes((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  const handleFinish = () => {
    updateSettings({
      profile: {
        displayName: 'Builder',
        role: persona,
        email: 'builder@forge.app',
      },
    });

    if (goalIdea.trim()) {
      // Store draft goal in session or pass via query/navigate
      sessionStorage.setItem('forge_draft_goal', goalIdea.trim());
      onNavigate('/app/new');
    } else {
      onNavigate('/app');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F5F7FA] flex flex-col justify-between p-6 antialiased">
      {/* Top Header */}
      <div className="max-w-xl w-full mx-auto flex items-center justify-between pt-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#F5A524] flex items-center justify-center text-[#0B0D10]">
            <Flame className="w-4 h-4 fill-current" />
          </div>
          <span className="font-display font-bold text-base tracking-wider">FORGE</span>
        </div>

        <button
          onClick={() => onNavigate('/app')}
          className="text-xs text-[#9AA4B2] hover:text-[#F5F7FA] transition-colors"
        >
          Skip onboarding
        </button>
      </div>

      {/* Main Form Container */}
      <div className="max-w-xl w-full mx-auto my-auto py-12">
        {/* Progress Dots */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === i
                  ? 'w-8 bg-[#F5A524]'
                  : step > i
                  ? 'w-4 bg-[#35C98A]'
                  : 'w-4 bg-[#252B33]'
              }`}
            />
          ))}
        </div>

        {/* Screen 1: Welcome & Goal */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#F5A524] mb-2">Step 1 of 3</div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F5F7FA]">
                Welcome to FORGE.
              </h1>
              <p className="text-sm text-[#9AA4B2] mt-2">
                What do you want to accomplish right now?
              </p>
            </div>

            <div>
              <textarea
                rows={4}
                value={goalIdea}
                onChange={(e) => setGoalIdea(e.target.value)}
                placeholder="e.g., Launch an online clothing brand with $600, build a developer tool, prepare for a PM interview, learn Python in 60 days..."
                className="w-full p-4 rounded-xl bg-[#12161B] border border-[#252B33] text-sm text-[#F5F7FA] placeholder-[#9AA4B2]/50 focus:outline-none focus:border-[#F5A524] transition-colors leading-relaxed"
                autoFocus
              />
              <div className="text-[11px] text-[#9AA4B2] mt-2">
                Explain your goal once. FORGE will infer structure, milestones, and deliverables.
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#F5A524] text-[#0B0D10] text-xs font-semibold hover:bg-[#F5A524]/90 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Screen 2: Persona */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#F5A524] mb-2">Step 2 of 3</div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F5F7FA]">
                What best describes you?
              </h1>
              <p className="text-sm text-[#9AA4B2] mt-2">
                Helps FORGE calibrate the strategic depth of your roadmaps.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {personas.map((p) => (
                <button
                  key={p}
                  onClick={() => setPersona(p)}
                  className={`p-4 rounded-xl border text-sm font-medium text-left transition-all ${
                    persona === p
                      ? 'bg-[#181D23] border-[#F5A524] text-[#F5F7FA] shadow-md shadow-[#F5A524]/10'
                      : 'bg-[#12161B] border-[#252B33] text-[#9AA4B2] hover:border-[#374151] hover:text-[#F5F7FA]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setStep(1)}
                className="text-xs text-[#9AA4B2] hover:text-[#F5F7FA]"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#F5A524] text-[#0B0D10] text-xs font-semibold hover:bg-[#F5A524]/90 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Screen 3: How FORGE helps */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#F5A524] mb-2">Step 3 of 3</div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F5F7FA]">
                How should FORGE help you?
              </h1>
              <p className="text-sm text-[#9AA4B2] mt-2">
                Select all that apply.
              </p>
            </div>

            <div className="space-y-2.5">
              {helpOptions.map((opt) => {
                const selected = helpModes.includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => toggleHelpOption(opt)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border text-sm font-medium transition-all text-left ${
                      selected
                        ? 'bg-[#181D23] border-[#F5A524] text-[#F5F7FA]'
                        : 'bg-[#12161B] border-[#252B33] text-[#9AA4B2] hover:border-[#374151]'
                    }`}
                  >
                    <span>{opt}</span>
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center border ${
                        selected
                          ? 'bg-[#F5A524] border-[#F5A524] text-[#0B0D10]'
                          : 'border-[#252B33]'
                      }`}
                    >
                      {selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setStep(2)}
                className="text-xs text-[#9AA4B2] hover:text-[#F5F7FA]"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#F5A524] text-[#0B0D10] text-xs font-semibold hover:bg-[#F5A524]/90 transition-all cursor-pointer"
              >
                <span>Finalize</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Screen 4: Finish */}
        {step === 4 && (
          <div className="space-y-6 text-center animate-in fade-in duration-200 py-6">
            <div className="w-14 h-14 rounded-2xl bg-[#F5A524]/10 text-[#F5A524] flex items-center justify-center mx-auto border border-[#F5A524]/20 shadow-lg">
              <Sparkles className="w-7 h-7" />
            </div>

            <div>
              <h1 className="font-display text-3xl font-extrabold text-[#F5F7FA]">
                You're ready.
              </h1>
              <p className="text-base text-[#9AA4B2] mt-2">
                Let's forge something.
              </p>
            </div>

            <div className="pt-4 flex flex-col items-center gap-3">
              <button
                onClick={handleFinish}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#F5A524] text-[#0B0D10] text-sm font-bold hover:bg-[#F5A524]/90 transition-all shadow-lg shadow-[#F5A524]/20 cursor-pointer"
              >
                {goalIdea.trim() ? 'Forge this goal →' : 'Create your first project'}
              </button>

              <button
                onClick={() => onNavigate('/app')}
                className="text-xs text-[#9AA4B2] hover:text-[#F5F7FA] mt-2"
              >
                Explore sample projects first
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-xl w-full mx-auto text-center pb-4 text-xs text-[#9AA4B2]">
        Designed for execution · Minimal user effort
      </div>
    </div>
  );
};
