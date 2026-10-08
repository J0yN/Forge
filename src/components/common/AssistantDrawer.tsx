import React, { useState, useEffect, useRef } from 'react';
import { Project, AssistantMessage, Task } from '../../types';
import { useProjectStore } from '../../store/useProjectStore';
import { askProjectAssistant } from '../../services/aiService';
import { DeliverableModal } from './DeliverableModal';
import {
  X,
  Send,
  Sparkles,
  ArrowRight,
  Bot,
  User,
  ShieldAlert,
  Compass,
  Zap,
  ListTodo,
} from 'lucide-react';

interface AssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onNavigateToRoadmap?: () => void;
  onNavigateToTasks?: () => void;
}

export const AssistantDrawer: React.FC<AssistantDrawerProps> = ({
  isOpen,
  onClose,
  project,
  onNavigateToRoadmap,
  onNavigateToTasks,
}) => {
  const {
    getProjectMilestones,
    getProjectTasks,
    getProjectRealityCheck,
    getProjectMemory,
  } = useProjectStore();

  const milestones = getProjectMilestones(project.id);
  const tasks = getProjectTasks(project.id);
  const realityCheck = getProjectRealityCheck(project.id);
  const memory = getProjectMemory(project.id);

  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'init-1',
      projectId: project.id,
      role: 'assistant',
      content: `I am FORGE, your execution strategist. I have analyzed **${project.title}**, current milestone progress (${project.progress}%), and identified active risks.\n\nAsk me how to eliminate blockers, what to execute next, or request specific deliverables.`,
      createdAt: new Date().toISOString(),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeDeliverableTask, setActiveDeliverableTask] = useState<Task | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input.trim();
    if (!text || isLoading) return;

    const userMsg: AssistantMessage = {
      id: `msg-${Date.now()}`,
      projectId: project.id,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const response = await askProjectAssistant({
        project,
        milestones,
        tasks,
        memory,
        realityCheck,
        messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
      });

      const assistantMsg: AssistantMessage = {
        id: `msg-${Date.now() + 1}`,
        projectId: project.id,
        role: 'assistant',
        content: response.content,
        suggestedAction: response.suggestedAction,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          projectId: project.id,
          role: 'assistant',
          content: 'FORGE encountered a temporary processing error. Your project is safe. Please re-submit your question.',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: AssistantMessage['suggestedAction']) => {
    if (!action) return;
    if (action.type === 'start_task' && action.taskId) {
      const target = tasks.find((t) => t.id === action.taskId);
      if (target) {
        setActiveDeliverableTask(target);
        return;
      }
    }
    if (action.type === 'view_roadmap' && onNavigateToRoadmap) {
      onNavigateToRoadmap();
      onClose();
      return;
    }
    if (onNavigateToTasks) {
      onNavigateToTasks();
      onClose();
    }
  };

  const quickPrompts = [
    { label: 'What should I do next?', icon: Compass },
    { label: 'Review my plan & risks', icon: ShieldAlert },
    { label: 'Help with active tasks', icon: ListTodo },
    { label: 'Find unrealistic assumptions', icon: Zap },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <aside
        className="fixed top-0 right-0 z-50 h-full w-full max-w-md md:max-w-lg bg-[#12161B] border-l border-[#252B33] shadow-2xl flex flex-col text-[#F5F7FA] animate-in slide-in-from-right duration-200"
        aria-label="AI Project Assistant"
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#252B33] bg-[#181D23]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#F5A524]/10 text-[#F5A524] flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-[#9AA4B2] flex items-center gap-2">
                <span>FORGE</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#35C98A]">Context Aware</span>
              </div>
              <h2 className="text-sm font-semibold text-[#F5F7FA]">Project Assistant</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9AA4B2] hover:text-[#F5F7FA] hover:bg-[#252B33] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Actions Ribbon */}
        <div className="px-4 py-2.5 bg-[#0B0D10] border-b border-[#252B33] flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          {quickPrompts.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSend(item.label)}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#181D23] hover:bg-[#252B33] text-[#9AA4B2] hover:text-[#F5F7FA] border border-[#252B33] transition-colors whitespace-nowrap cursor-pointer shrink-0"
              >
                <Icon className="w-3.5 h-3.5 text-[#F5A524]" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs leading-relaxed ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-md bg-[#181D23] border border-[#252B33] flex items-center justify-center text-[#F5A524] shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-lg p-3.5 space-y-2.5 ${
                  msg.role === 'user'
                    ? 'bg-[#F5A524] text-[#0B0D10] font-medium'
                    : 'bg-[#181D23] border border-[#252B33] text-[#F5F7FA]'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Suggested Action Trigger */}
                {msg.suggestedAction && (
                  <div className="pt-1">
                    <button
                      onClick={() => handleActionClick(msg.suggestedAction)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#F5A524] text-[#0B0D10] font-semibold text-xs hover:bg-[#F5A524]/90 transition-all cursor-pointer shadow-sm"
                    >
                      <span>{msg.suggestedAction.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-md bg-[#252B33] flex items-center justify-center text-[#F5F7FA] shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 text-xs">
              <div className="w-7 h-7 rounded-md bg-[#181D23] border border-[#252B33] flex items-center justify-center text-[#F5A524] shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-lg bg-[#181D23] border border-[#252B33] text-[#9AA4B2] flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#F5A524] animate-pulse" />
                <span>Evaluating project context & milestones...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Area */}
        <div className="p-4 border-t border-[#252B33] bg-[#181D23]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask FORGE about your milestones, blockers, or next moves..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-3.5 py-2.5 rounded-lg bg-[#0B0D10] border border-[#252B33] text-xs text-[#F5F7FA] placeholder-[#9AA4B2]/60 focus:outline-none focus:border-[#F5A524]"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 rounded-lg bg-[#F5A524] text-[#0B0D10] hover:bg-[#F5A524]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-[11px] text-[#9AA4B2] mt-2 flex items-center justify-between">
            <span>Grounds answers in real project facts</span>
            <span className="font-mono text-[#F5A524]">Gemini 3.8 Flash</span>
          </div>
        </div>
      </aside>

      {/* Deliverable Modal if action invoked */}
      {activeDeliverableTask && (
        <DeliverableModal
          task={activeDeliverableTask}
          project={project}
          isOpen={!!activeDeliverableTask}
          onClose={() => setActiveDeliverableTask(null)}
        />
      )}
    </>
  );
};
