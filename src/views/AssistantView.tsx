import React, { useState, useRef, useEffect } from 'react';
import { Project, AssistantMessage, Task } from '../types';
import { useProjectStore } from '../store/useProjectStore';
import { askProjectAssistant } from '../services/aiService';
import { DeliverableModal } from '../components/common/DeliverableModal';
import {
  Sparkles,
  Send,
  Bot,
  User,
  ArrowRight,
  Compass,
  ShieldAlert,
  Zap,
  ListTodo,
  Database,
  CheckCircle2,
} from 'lucide-react';

interface AssistantViewProps {
  project: Project;
  onNavigate: (path: string) => void;
}

export const AssistantView: React.FC<AssistantViewProps> = ({ project, onNavigate }) => {
  const {
    getProjectMilestones,
    getProjectTasks,
    getProjectRealityCheck,
    getProjectMemory,
    toggleTaskCompletion,
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
      content: `I am FORGE, your project execution strategist.\n\nI am currently tracking **${project.title}** at **${project.progress}% progress** with **${tasks.filter((t) => t.status === 'done').length}/${tasks.length} tasks completed**.\n\nAsk me how to resolve current blockers, evaluate supplier or distribution tradeoffs, or request deliverables directly.`,
      createdAt: new Date().toISOString(),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTaskForDoIt, setSelectedTaskForDoIt] = useState<Task | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
          content: 'FORGE encountered an issue completing that analysis. Your project is safe. Please re-ask your question.',
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
        setSelectedTaskForDoIt(target);
        return;
      }
    }
    if (action.type === 'view_roadmap') {
      onNavigate(`/app/projects/${project.id}/roadmap`);
      return;
    }
    onNavigate(`/app/projects/${project.id}/tasks`);
  };

  const quickPrompts = [
    { label: 'What should I do next?', icon: Compass },
    { label: 'Review my plan & risks', icon: ShieldAlert },
    { label: 'Help with active tasks', icon: ListTodo },
    { label: 'Find unrealistic assumptions', icon: Zap },
  ];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto h-[calc(100vh-60px)] md:h-screen flex flex-col space-y-4 animate-in fade-in duration-200">
      
      {/* Top Context Header */}
      <div className="flex items-center justify-between border-b border-[#252B33] pb-4">
        <div>
          <button
            onClick={() => onNavigate(`/app/projects/${project.id}`)}
            className="text-xs text-[#9AA4B2] hover:text-[#F5F7FA] mb-1 flex items-center gap-1"
          >
            ← Back to project dashboard
          </button>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-bold text-[#F5F7FA]">
              AI Project Assistant
            </h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#35C98A]/10 text-[#35C98A] border border-[#35C98A]/30">
              Live Context Active
            </span>
          </div>
        </div>

        <div className="text-right text-xs text-[#9AA4B2] hidden sm:block">
          <div>{project.title}</div>
          <div className="font-mono text-[#F5A524]">{project.progress}% Complete</div>
        </div>
      </div>

      {/* Quick Prompts Bar */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
        {quickPrompts.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSend(item.label)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#12161B] border border-[#252B33] hover:border-[#F5A524] text-xs font-medium text-[#9AA4B2] hover:text-[#F5F7FA] transition-all shrink-0 cursor-pointer"
            >
              <Icon className="w-3.5 h-3.5 text-[#F5A524]" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-[#12161B] border border-[#252B33] space-y-5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 text-xs md:text-sm leading-relaxed ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-[#181D23] border border-[#252B33] flex items-center justify-center text-[#F5A524] shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-xl p-4 space-y-3 ${
                msg.role === 'user'
                  ? 'bg-[#F5A524] text-[#0B0D10] font-medium'
                  : 'bg-[#181D23] border border-[#252B33] text-[#F5F7FA]'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

              {msg.suggestedAction && (
                <div className="pt-2">
                  <button
                    onClick={() => handleActionClick(msg.suggestedAction)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F5A524] text-[#0B0D10] font-bold text-xs hover:bg-[#F5A524]/90 transition-all cursor-pointer shadow-md"
                  >
                    <span>{msg.suggestedAction.label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-[#252B33] flex items-center justify-center text-[#F5F7FA] shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 text-xs">
            <div className="w-8 h-8 rounded-lg bg-[#181D23] border border-[#252B33] flex items-center justify-center text-[#F5A524] shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-xl bg-[#181D23] border border-[#252B33] text-[#9AA4B2] flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#F5A524] animate-pulse" />
              <span>Analyzing constraints & project memory...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-3 pt-2"
      >
        <input
          type="text"
          placeholder="Ask FORGE about your milestones, blockers, or next moves..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          className="flex-1 px-4 py-3 rounded-xl bg-[#12161B] border border-[#252B33] text-xs md:text-sm text-[#F5F7FA] placeholder-[#9AA4B2]/60 focus:outline-none focus:border-[#F5A524]"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-3.5 rounded-xl bg-[#F5A524] text-[#0B0D10] font-bold hover:bg-[#F5A524]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Deliverable Modal */}
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
