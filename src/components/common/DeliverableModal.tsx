import React, { useState } from 'react';
import { Task, Project, Deliverable } from '../../types';
import { generateDeliverable } from '../../services/aiService';
import { useProjectStore } from '../../store/useProjectStore';
import { X, Sparkles, Copy, Check, Download, ArrowRight, Loader2, FileText, CheckCircle2 } from 'lucide-react';

interface DeliverableModalProps {
  task: Task;
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onTaskCompleted?: (taskId: string) => void;
}

export const DeliverableModal: React.FC<DeliverableModalProps> = ({
  task,
  project,
  isOpen,
  onClose,
  onTaskCompleted,
}) => {
  const { saveDeliverable, toggleTaskCompletion } = useProjectStore();
  const [selectedType, setSelectedType] = useState<string>(
    task.deliverableSuggestions?.[0] || 'Actionable Execution Plan'
  );
  const [customArtifactType, setCustomArtifactType] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [deliverableContent, setDeliverableContent] = useState<string | null>(null);
  const [deliverableTitle, setDeliverableTitle] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [taskMarkedDone, setTaskMarkedDone] = useState(task.status === 'done');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (typeToGenerate?: string) => {
    const targetType = typeToGenerate || (customArtifactType.trim() ? customArtifactType.trim() : selectedType);
    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateDeliverable({
        project,
        task,
        requestedDeliverableType: targetType,
      });

      setDeliverableTitle(result.title);
      setDeliverableContent(result.content);

      // Save to project deliverables store
      const newDeliverable: Deliverable = {
        id: `deliv-${Date.now()}`,
        projectId: project.id,
        taskId: task.id,
        taskTitle: task.title,
        title: result.title,
        type: 'artifact',
        content: result.content,
        createdAt: new Date().toISOString(),
      };
      saveDeliverable(newDeliverable);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'FORGE could not generate that deliverable. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!deliverableContent) return;
    navigator.clipboard.writeText(deliverableContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!deliverableContent) return;
    const blob = new Blob([deliverableContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deliverableTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleMarkTaskComplete = () => {
    if (task.status !== 'done') {
      toggleTaskCompletion(task.id);
      setTaskMarkedDone(true);
      if (onTaskCompleted) {
        onTaskCompleted(task.id);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#12161B] border border-[#252B33] rounded-xl shadow-2xl overflow-hidden text-[#F5F7FA]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#252B33] bg-[#181D23]">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#F5A524]/10 text-[#F5A524]">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2 text-xs text-[#9AA4B2]">
                <span>DO IT ENGINE</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[#F5A524]">TASK ARTIFACT GENERATOR</span>
              </div>
              <h2 className="text-base font-semibold text-[#F5F7FA] truncate max-w-md sm:max-w-xl">
                {task.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9AA4B2] hover:text-[#F5F7FA] hover:bg-[#252B33] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!deliverableContent && !isGenerating && (
            <div className="space-y-6">
              <div>
                <p className="text-sm text-[#9AA4B2] leading-relaxed">
                  FORGE turns this task into execution by generating the exact, tangible artifact required to complete it. Select a high-impact deliverable or specify what you need:
                </p>
              </div>

              {/* Suggested Artifact Options */}
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#9AA4B2]">
                  Recommended Artifacts for this Task
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {task.deliverableSuggestions && task.deliverableSuggestions.length > 0 ? (
                    task.deliverableSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedType(suggestion);
                          setCustomArtifactType('');
                        }}
                        className={`flex items-start gap-3 p-3.5 text-left rounded-lg border transition-all ${
                          selectedType === suggestion && !customArtifactType
                            ? 'bg-[#181D23] border-[#F5A524] text-[#F5F7FA] shadow-sm'
                            : 'bg-[#12161B] border-[#252B33] text-[#9AA4B2] hover:border-[#374151] hover:text-[#F5F7FA]'
                        }`}
                      >
                        <FileText className={`w-4 h-4 mt-0.5 shrink-0 ${
                          selectedType === suggestion && !customArtifactType ? 'text-[#F5A524]' : 'text-[#9AA4B2]'
                        }`} />
                        <div>
                          <div className="text-sm font-medium text-[#F5F7FA]">{suggestion}</div>
                          <div className="text-xs text-[#9AA4B2] mt-0.5">Click to generate immediately</div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="col-span-2 text-xs text-[#9AA4B2]">Standard execution blueprint available.</div>
                  )}
                </div>
              </div>

              {/* Custom Deliverable Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#9AA4B2]">
                  Or Specify a Custom Deliverable
                </label>
                <input
                  type="text"
                  placeholder="e.g., Supplier cold outreach DM script, Unit economics spreadsheet structure..."
                  value={customArtifactType}
                  onChange={(e) => setCustomArtifactType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#181D23] border border-[#252B33] text-sm text-[#F5F7FA] placeholder-[#9AA4B2]/50 focus:outline-none focus:border-[#F5A524]"
                />
              </div>

              {/* Task Details context */}
              <div className="p-4 rounded-lg bg-[#181D23]/60 border border-[#252B33] space-y-2 text-xs">
                <div className="text-[#9AA4B2] font-semibold uppercase tracking-wider">Task Context</div>
                <div className="text-[#F5F7FA]">{task.description}</div>
                {task.completionCriteria?.length > 0 && (
                  <div className="text-[#9AA4B2] pt-1">
                    <span className="text-[#F5A524]">Criteria:</span> {task.completionCriteria.join(' · ')}
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 text-xs text-[#EF6461] bg-[#EF6461]/10 border border-[#EF6461]/20 rounded-lg">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Loading Animation */}
          {isGenerating && (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-[#252B33] border-t-[#F5A524] animate-spin" />
                <Sparkles className="w-5 h-5 text-[#F5A524] absolute inset-0 m-auto" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#F5F7FA]">Forging Deliverable</h3>
                <p className="text-xs text-[#9AA4B2] mt-1 max-w-sm">
                  Generating "{customArtifactType || selectedType}" specifically tailored to your project goals and constraints...
                </p>
              </div>
            </div>
          )}

          {/* Generated Deliverable Output */}
          {deliverableContent && !isGenerating && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[#181D23] p-3 rounded-lg border border-[#252B33]">
                <div>
                  <div className="text-xs text-[#9AA4B2]">GENERATED DELIVERABLE</div>
                  <div className="text-sm font-semibold text-[#F5F7FA]">{deliverableTitle}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#12161B] border border-[#252B33] hover:border-[#374151] text-[#F5F7FA] transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#35C98A]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#12161B] border border-[#252B33] hover:border-[#374151] text-[#F5F7FA] transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Markdown</span>
                  </button>
                </div>
              </div>

              {/* Rendered Markdown Box */}
              <div className="p-5 rounded-lg bg-[#0B0D10] border border-[#252B33] font-mono text-xs leading-relaxed text-[#F5F7FA] whitespace-pre-wrap max-h-[380px] overflow-y-auto selection:bg-[#F5A524]/30">
                {deliverableContent}
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setDeliverableContent(null)}
                  className="text-xs text-[#9AA4B2] hover:text-[#F5F7FA] underline underline-offset-4"
                >
                  Generate a different artifact
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleMarkTaskComplete}
                    disabled={taskMarkedDone}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all w-full sm:w-auto ${
                      taskMarkedDone
                        ? 'bg-[#35C98A]/20 text-[#35C98A] border border-[#35C98A]/40'
                        : 'bg-[#35C98A] text-[#0B0D10] hover:bg-[#35C98A]/90'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{taskMarkedDone ? 'Task Completed ✓' : 'Mark Task Complete'}</span>
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#252B33] text-[#F5F7FA] hover:bg-[#374151] transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer for Selection Stage */}
        {!deliverableContent && !isGenerating && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#252B33] bg-[#181D23]">
            <div className="text-xs text-[#9AA4B2]">
              Direct execution · Usable immediately
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#9AA4B2] hover:text-[#F5F7FA] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleGenerate()}
                className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-[#0B0D10] bg-[#F5A524] hover:bg-[#F5A524]/90 rounded-lg transition-all shadow-md shadow-[#F5A524]/10 cursor-pointer"
              >
                <span>Generate Artifact</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
