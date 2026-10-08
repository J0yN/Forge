import React, { useState } from 'react';
import {
  Flame,
  ArrowRight,
  ShieldAlert,
  Milestone,
  CheckCircle2,
  Sparkles,
  FileCode,
  Zap,
  Target,
  Compass,
  Play,
  RotateCcw,
} from 'lucide-react';

interface LandingViewProps {
  onNavigate: (path: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onNavigate }) => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const sampleTransformation = [
    {
      step: 'Messy Input',
      input: '"I want to start a clothing brand with ₹50,000"',
      annotation: 'Ambiguous goal, unvalidated budget, unknown sourcing',
    },
    {
      step: 'FORGE Analyzes',
      outcome: 'Target 3-SKU capsule collection with validated customer demand and positive unit economics.',
      constraints: 'Budget limit: ₹50,000 · Timeline: 45 days · D2C Online',
    },
    {
      step: 'Reality Check',
      badge: 'MODERATE RISK',
      insight: 'Biggest vulnerability: committing funds to inventory before customer pre-commitments.',
      fix: 'Interlock 10 customer interviews prior to supplier deposit.',
    },
    {
      step: '6 Milestones',
      milestones: [
        '01 Customer & Aesthetic Validation',
        '02 Sourcing & Sample Fit Approval',
        '03 Brand & E-Commerce Storefront',
        '04 VIP Drop & Fulfillment',
      ],
    },
    {
      step: 'Concrete Deliverable',
      action: 'Task: Contact 5 low-MOQ textile suppliers',
      result: 'FORGE generates: Supplier RFP email script + Evaluation scoring matrix',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F5F7FA] selection:bg-[#F5A524]/20 selection:text-[#F5A524]">
      {/* Top Header */}
      <header className="border-b border-[#252B33] bg-[#0B0D10]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('/')}>
            <div className="w-8 h-8 rounded-lg bg-[#F5A524] flex items-center justify-center text-[#0B0D10]">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <span className="font-display font-bold text-xl tracking-wider text-[#F5F7FA]">FORGE</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('/app')}
              className="text-xs font-medium text-[#9AA4B2] hover:text-[#F5F7FA] transition-colors"
            >
              Open Dashboard
            </button>
            <button
              onClick={() => onNavigate('/app/new')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F5A524] text-[#0B0D10] text-xs font-semibold hover:bg-[#F5A524]/90 transition-all cursor-pointer shadow-sm shadow-[#F5A524]/10"
            >
              <span>Start Forging</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181D23] border border-[#252B33] text-xs text-[#9AA4B2] mb-8">
          <span className="w-2 h-2 rounded-full bg-[#F5A524] animate-pulse" />
          <span>The AI Execution Platform</span>
          <span aria-hidden="true">·</span>
          <span className="text-[#F5F7FA]">Beyond Chatbots</span>
        </div>

        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#F5F7FA] max-w-4xl mx-auto leading-[1.1]">
          Turn intentions <br className="hidden sm:block" />
          into <span className="text-[#F5A524]">execution.</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg md:text-xl text-[#9AA4B2] max-w-2xl mx-auto leading-relaxed">
          FORGE transforms messy goals into realistic plans, actionable tasks, and the actual work required to make them happen.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => onNavigate('/app/new')}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-[#F5A524] text-[#0B0D10] font-semibold text-sm hover:bg-[#F5A524]/90 transition-all shadow-lg shadow-[#F5A524]/20 cursor-pointer"
          >
            <span>Start Forging</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
          <a
            href="#interactive-transformation"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#181D23] border border-[#252B33] text-[#F5F7FA] font-medium text-sm hover:border-[#374151] transition-colors"
          >
            <span>See how it works</span>
          </a>
        </div>
      </section>

      {/* Interactive Conceptual Transformation */}
      <section id="interactive-transformation" className="py-16 px-6 max-w-5xl mx-auto">
        <div className="bg-[#12161B] border border-[#252B33] rounded-2xl p-6 sm:p-10 shadow-2xl space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252B33] pb-6">
            <div>
              <div className="text-xs uppercase tracking-wider text-[#F5A524] font-semibold font-mono">
                Interactive Transformation
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#F5F7FA] mt-1">
                How FORGE executes an ambiguous goal
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {sampleTransformation.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeStep === idx
                      ? 'bg-[#F5A524] text-[#0B0D10]'
                      : 'bg-[#181D23] text-[#9AA4B2] hover:text-[#F5F7FA]'
                  }`}
                >
                  Step {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Step Visualization Display */}
          <div className="min-h-[220px] flex flex-col justify-center">
            {activeStep === 0 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="text-xs uppercase tracking-wider text-[#9AA4B2]">Stage 1 · Raw User Input</div>
                <div className="p-5 rounded-xl bg-[#0B0D10] border border-[#252B33] text-lg font-mono text-[#F5F7FA]">
                  {sampleTransformation[0].input}
                </div>
                <div className="text-xs text-[#9AA4B2] flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#F5A524]" />
                  <span>{sampleTransformation[0].annotation}</span>
                </div>
              </div>
            )}

            {activeStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="text-xs uppercase tracking-wider text-[#9AA4B2]">Stage 2 · Intent Extraction & Scope Normalization</div>
                <div className="p-5 rounded-xl bg-[#181D23] border border-[#252B33] space-y-3">
                  <div className="text-sm font-semibold text-[#F5F7FA]">
                    {sampleTransformation[1].outcome}
                  </div>
                  <div className="text-xs text-[#9AA4B2] font-mono">
                    {sampleTransformation[1].constraints}
                  </div>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="text-xs uppercase tracking-wider text-[#EF6461] font-semibold">Stage 3 · Skeptical Reality Check</div>
                <div className="p-5 rounded-xl bg-[#181D23] border border-[#252B33] space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#F5A524]/10 text-[#F5A524] border border-[#F5A524]/30">
                      {sampleTransformation[2].badge}
                    </span>
                    <span className="text-xs text-[#9AA4B2]">Assumption audit</span>
                  </div>
                  <p className="text-sm text-[#F5F7FA]">{sampleTransformation[2].insight}</p>
                  <div className="text-xs text-[#35C98A] flex items-center gap-2 pt-1 border-t border-[#252B33]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Recommendation: {sampleTransformation[2].fix}</span>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="text-xs uppercase tracking-wider text-[#9AA4B2]">Stage 4 · Critical-Path Milestones</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sampleTransformation[3].milestones?.map((m, i) => (
                    <div key={i} className="p-3.5 rounded-lg bg-[#181D23] border border-[#252B33] flex items-center gap-3">
                      <span className="w-6 h-6 rounded bg-[#252B33] text-[#F5A524] flex items-center justify-center font-mono text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="text-xs font-medium text-[#F5F7FA]">{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeStep === 4 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="text-xs uppercase tracking-wider text-[#35C98A] font-semibold">Stage 5 · "Do It" Artifact Generation</div>
                <div className="p-5 rounded-xl bg-[#181D23] border border-[#252B33] space-y-3">
                  <div className="text-xs font-semibold text-[#9AA4B2]">{sampleTransformation[4].action}</div>
                  <div className="text-sm font-semibold text-[#F5A524]">{sampleTransformation[4].result}</div>
                  <p className="text-xs text-[#9AA4B2]">
                    Generates the actual email outreach copy, evaluation sheet, and checklists immediately ready to copy, download, and send.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Stepper Navigation */}
          <div className="flex items-center justify-between border-t border-[#252B33] pt-6">
            <button
              onClick={() => setActiveStep((prev) => (prev > 0 ? prev - 1 : 4))}
              className="text-xs text-[#9AA4B2] hover:text-[#F5F7FA]"
            >
              ← Previous Stage
            </button>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    activeStep === i ? 'bg-[#F5A524]' : 'bg-[#252B33]'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setActiveStep((prev) => (prev < 4 ? prev + 1 : 0))}
              className="text-xs text-[#F5A524] hover:underline flex items-center gap-1 font-medium"
            >
              <span>Next Stage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Feature Pillar Grid */}
      <section className="py-20 px-6 max-w-6xl mx-auto border-t border-[#252B33]">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-mono uppercase tracking-wider text-[#F5A524]">Engine Architecture</div>
          <h2 className="text-3xl font-bold text-[#F5F7FA] mt-2 font-display">
            The 5 Pillars of FORGE
          </h2>
          <p className="text-sm text-[#9AA4B2] mt-3">
            Every layer is designed to move you from thinking to shipping.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="p-6 rounded-xl bg-[#12161B] border border-[#252B33] space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#181D23] border border-[#252B33] flex items-center justify-center text-[#F5A524]">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#F5F7FA]">1. Understand</h3>
            <p className="text-xs text-[#9AA4B2] leading-relaxed">
              Turns unstructured input, constraints, and uploaded specs into a razor-sharp outcome definition with non-negotiable success criteria.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-xl bg-[#12161B] border border-[#252B33] space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#181D23] border border-[#252B33] flex items-center justify-center text-[#F5A524]">
              <Milestone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#F5F7FA]">2. Plan</h3>
            <p className="text-xs text-[#9AA4B2] leading-relaxed">
              Builds sequential milestones with clear dependencies, effort estimates, and prerequisites. No premature execution.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-xl bg-[#12161B] border border-[#252B33] space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#181D23] border border-[#252B33] flex items-center justify-center text-[#EF6461]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#F5F7FA]">3. Reality Check</h3>
            <p className="text-xs text-[#9AA4B2] leading-relaxed">
              Acts as a skeptical co-founder. Audits flawed timelines, unvalidated market demand, and skill gaps before you waste capital.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="p-6 rounded-xl bg-[#12161B] border border-[#252B33] space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#181D23] border border-[#252B33] flex items-center justify-center text-[#35C98A]">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#F5F7FA]">4. Execute ("Do It")</h3>
            <p className="text-xs text-[#9AA4B2] leading-relaxed">
              Don't just look at a to-do list. Click "Do it" to generate the emails, calculation spreadsheets, copy, and checklists required to complete it.
            </p>
          </div>

          {/* Pillar 5 */}
          <div className="p-6 rounded-xl bg-[#12161B] border border-[#252B33] space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#181D23] border border-[#252B33] flex items-center justify-center text-[#F5A524]">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#F5F7FA]">5. Adapt & Memory</h3>
            <p className="text-xs text-[#9AA4B2] leading-relaxed">
              Maintains project memory of key decisions and constraints. As tasks finish, downstream milestones unlock automatically.
            </p>
          </div>

          {/* Pillar 6 - Single Focus Next Move */}
          <div className="p-6 rounded-xl bg-[#181D23] border border-[#F5A524]/30 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#F5A524]/10 text-[#F5A524] flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#F5F7FA]">Zero Decision Fatigue</h3>
            <p className="text-xs text-[#9AA4B2] leading-relaxed">
              Every morning FORGE answers one question: "What is my single highest-impact move today?"
            </p>
          </div>
        </div>
      </section>

      {/* Final Bottom CTA */}
      <section className="py-24 px-6 max-w-4xl mx-auto text-center border-t border-[#252B33]">
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#F5F7FA]">
          Your next move starts here.
        </h2>
        <p className="mt-4 text-sm sm:text-base text-[#9AA4B2] max-w-lg mx-auto">
          Stop staring at an empty notes app. Give FORGE your messy goal and start executing today.
        </p>
        <div className="mt-8">
          <button
            onClick={() => onNavigate('/app/new')}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-[#F5A524] text-[#0B0D10] font-bold text-sm hover:bg-[#F5A524]/90 transition-all shadow-xl shadow-[#F5A524]/20 cursor-pointer"
          >
            <span>Start Forging</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#252B33] py-8 px-6 text-center text-xs text-[#9AA4B2]">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Flame className="w-4 h-4 text-[#F5A524]" />
          <span className="font-bold text-[#F5F7FA]">FORGE</span>
          <span>· Turn intentions into execution</span>
        </div>
        <p>© 2026 FORGE Execution Engine. Powered by Google Gemini.</p>
      </footer>
    </div>
  );
};
