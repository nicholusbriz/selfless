// app/dashboard/ai/page.tsx
'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Sparkles,
  User,
  Plus,
  FileCode,
  ClipboardPaste,
  AlertCircle,
  Copy,
  Check,
  ArrowLeft,
  BookOpen,
  Database,
  Zap,
  Settings,
  ToggleLeft,
  ToggleRight,
  Search,
  Shield,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useAIUserData } from '@/hooks/useAIUserData';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Array<{
    id: string;
    title: string;
    category: string;
    subcategory: string | null;
    similarity: number;
    source: 'semantic' | 'keyword' | 'hybrid';
    chunkIndex?: number;
  }>;
  ragEnabled?: boolean;
  fromCache?: boolean;
  provider?: string;
}

interface ConversationSummary {
  id: string;
  title: string | null;
  updatedAt: string;
  topics?: string[];
}

export default function AIDashboardPage() {
  const { data: session } = useSession();
  const { userContext, profileRecommendations } = useAIUserData();

  // RAG Settings - declare before use
  const [ragEnabled, setRagEnabled] = useState(true);
  const [strictMode, setStrictMode] = useState(false);
  const [hybridSearch, setHybridSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // CLEAN welcome message - no duplication
  const getWelcomeMessage = useCallback(() => {
    const hour = new Date().getHours();
    const userName = session?.user?.firstName || 'there';

    let timeGreeting = 'Good evening';
    if (hour >= 5 && hour < 12) timeGreeting = 'Good morning';
    else if (hour >= 12 && hour < 17) timeGreeting = 'Good afternoon';

    const greeting = `${timeGreeting}, ${userName}!`;

    // Clean, well-structured welcome message
    let welcomeMessage = `🚀 **${greeting}** Welcome to Atbriz Ai - Your intelligent learning companion!\n\n`;

    if (profileRecommendations) {
      welcomeMessage += `${profileRecommendations}\n\n`;
    }

    welcomeMessage += `**What I Can Help You With:**\n\n`;
    welcomeMessage += `• 📚 Academic guidance and assignment help\n`;
    welcomeMessage += `• 🎯 Personalized learning based on your progress\n`;
    welcomeMessage += `• 💡 Site navigation and platform features\n`;
    welcomeMessage += `• 🔧 Coding help and debugging\n`;
    welcomeMessage += `• 📖 General knowledge and research\n`;
    welcomeMessage += `• 🏢 Selfless CE organization information\n`;
    welcomeMessage += `• 👨‍💻 Developer and platform information\n\n`;
    
    // Add RAG info
    if (ragEnabled) {
      welcomeMessage += `**🔍 Smart Search Enabled:** I'll use your knowledge base to provide accurate answers with source attribution.\n\n`;
    }
    
    welcomeMessage += `I'm designed to learn from your interactions and provide increasingly personalized assistance. Feel free to ask me about the platform, your studies, or even who created me!\n\n`;
    welcomeMessage += `Let's start learning together! 🎉`;

    return welcomeMessage;
  }, [session?.user?.firstName, profileRecommendations, ragEnabled]);

  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content: getWelcomeMessage(),
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showNewChatConfirm, setShowNewChatConfirm] = useState(false);
  const [pasteContent, setPasteContent] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<ConversationSummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [chatHeight, setChatHeight] = useState<number | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messageIdCounterRef = useRef(0);
  const shouldAutoScrollRef = useRef(true);

  const createMessageId = useCallback((prefix = 'msg') => {
    messageIdCounterRef.current += 1;
    return `${prefix}-${messageIdCounterRef.current}`;
  }, []);

  useEffect(() => {
    const updateChatHeight = () => {
      const topOffset = window.innerWidth >= 1024 ? 88 : 96;
      setChatHeight(Math.max(window.innerHeight - topOffset, 520));
    };

    updateChatHeight();
    window.addEventListener('resize', updateChatHeight);
    return () => window.removeEventListener('resize', updateChatHeight);
  }, []);

  // Log usage on mount
  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/ai/log-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          techCenterId: session.user.techCenterId || undefined,
          details: {
            messageCount: 0,
            firstMessage: 'AI page opened',
          },
        }),
      }).catch((err) => console.error('Failed to log AI usage:', err));
    }
  }, [session?.user?.id, session?.user?.techCenterId]);

  const loadConversationHistory = useCallback(async () => {
    if (!session?.user?.id) {
      setHistoryItems([]);
      return;
    }

    setHistoryLoading(true);
    try {
      const response = await fetch(`/api/ai/chat?userId=${session.user.id}`);
      const data = await response.json();
      if (data.success) {
        setHistoryItems(data.data.conversations || []);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, [session]);

  useEffect(() => {
    let isActive = true;

    const runLoad = async () => {
      await loadConversationHistory();
      if (!isActive) {
        return;
      }
    };

    void runLoad();

    return () => {
      isActive = false;
    };
  }, [loadConversationHistory]);

  // Improved scroll to bottom
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const container = messagesContainerRef.current;
    if (!container) return;

    requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior,
      });
    });
  }, []);

  // Check if user is at bottom
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const atBottom = scrollHeight - scrollTop - clientHeight < 50;

    if (!atBottom) {
      shouldAutoScrollRef.current = false;
    } else {
      shouldAutoScrollRef.current = true;
    }
  }, []);

  // Auto-scroll only when the user is still following the latest message
  useEffect(() => {
    if (messages.length > 0 && shouldAutoScrollRef.current) {
      const timer = setTimeout(() => scrollToBottom('smooth'), 50);
      return () => clearTimeout(timer);
    }
  }, [messages, scrollToBottom]);

  const resetChat = () => {
    setMessages([
      {
        id: createMessageId('welcome'),
        role: 'assistant',
        content: getWelcomeMessage(),
        timestamp: new Date(),
      },
    ]);
    setInput('');
    setActiveConversationId(null);
    setShowNewChatConfirm(false);
    setIsLoading(false);
    setPasteContent(null);
    shouldAutoScrollRef.current = true;

    setTimeout(() => {
      inputRef.current?.focus();
      scrollToBottom('auto');
    }, 100);
  };

  // Update welcome message when RAG settings change
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === 'welcome') {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: getWelcomeMessage(),
          timestamp: new Date(),
        },
      ]);
    }
  }, [ragEnabled, strictMode, hybridSearch, getWelcomeMessage, messages.length]);

  const startNewChat = () => {
    if (messages.length > 1) {
      setShowNewChatConfirm(true);
    } else {
      resetChat();
    }
  };

  const handleCopyCode = (code: string, messageId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleCopyMessage = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();

    try {
      const clipboardData = e.clipboardData;
      const items = clipboardData.items;
      let hasImageOrVideo = false;

      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        if (item.type.startsWith('image/') || item.type.startsWith('video/')) {
          hasImageOrVideo = true;
          break;
        }
      }

      if (hasImageOrVideo) {
        setPasteContent('⚠️ Images and videos are not supported. Text only.');
        setTimeout(() => setPasteContent(null), 3000);
        return;
      }

      const text = clipboardData.getData('text/plain');
      if (text) {
        const textarea = inputRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const currentValue = input;

          if (start !== end) {
            setInput(currentValue.substring(0, start) + text + currentValue.substring(end));
          } else {
            const newValue = currentValue.substring(0, start) + text + currentValue.substring(start);
            setInput(newValue);
            setTimeout(() => {
              if (textarea) {
                const newPosition = start + text.length;
                textarea.selectionStart = newPosition;
                textarea.selectionEnd = newPosition;
                textarea.focus();
              }
            }, 0);
          }

          if (text.length > 100) {
            setPasteContent(`📄 Pasted ${text.length} characters`);
            setTimeout(() => setPasteContent(null), 1500);
          } else if (text.length > 0) {
            setPasteContent('✅ Text pasted');
            setTimeout(() => setPasteContent(null), 1000);
          }
        }
      }
    } catch {
      console.error('Paste error');
      const text = e.clipboardData.getData('text/plain');
      if (text) {
        setInput((prev) => prev + text);
      }
    }
  }, [input]);

  // Enhanced Markdown components
  type MarkdownTextProps = { children?: ReactNode };
  type MarkdownLinkProps = MarkdownTextProps & { href?: string };
  type MarkdownCodeProps = ComponentPropsWithoutRef<'code'> & { inline?: boolean };

  const MarkdownComponents = useMemo(() => ({
    code({ inline, className, children, ...props }: MarkdownCodeProps) {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');

      if (!inline && match) {
        const codeId = createMessageId('code');
        return (
          <div className="relative group my-3 rounded-xl overflow-hidden border border-[#2A1F3D] bg-[#0A0615] shadow-xl">
            <div className="flex items-center justify-between px-3 py-2 bg-[#140E24] border-b border-[#2A1F3D]">
              <div className="flex items-center gap-2">
                <FileCode className="w-3.5 h-3.5 text-[#E8A33D]" />
                <span className="text-[10px] text-[#A89F96] font-mono uppercase tracking-wider">{match[1]}</span>
              </div>
              <button
                onClick={() => handleCopyCode(codeString, codeId)}
                className="flex items-center gap-1.5 text-[10px] text-[#A89F96] hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-[#2A1F3D]"
              >
                {copiedMessageId === codeId ? (
                  <>
                    <Check className="w-3 h-3 text-[#14B8A6]" />
                    <span className="text-[#14B8A6] font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="overflow-x-auto p-4 bg-[#0A0615]">
              <pre className="m-0 overflow-x-auto text-sm text-[#F0EDE8] leading-relaxed">
                <code className="font-mono" {...props}>
                  {codeString}
                </code>
              </pre>
            </div>
          </div>
        );
      }

      return (
        <code className={cn(
          'px-1.5 py-0.5 rounded-md text-xs font-mono break-words',
          inline 
            ? 'bg-[#1A1228] text-[#F2C879] border border-[#2A1F3D]' 
            : 'block bg-[#1A1228] p-4 rounded-xl border border-[#2A1F3D] overflow-x-auto text-[#F0EDE8]'
        )} {...props}>
          {children}
        </code>
      );
    },
    h1: ({ children }: MarkdownTextProps) => (
      <h1 className="text-2xl font-bold text-white mt-4 mb-2.5 break-words tracking-tight border-b border-[#2A1F3D] pb-2">
        {children}
      </h1>
    ),
    h2: ({ children }: MarkdownTextProps) => (
      <h2 className="text-xl font-bold text-white mt-3.5 mb-2 break-words tracking-tight">
        {children}
      </h2>
    ),
    h3: ({ children }: MarkdownTextProps) => (
      <h3 className="text-lg font-bold text-white mt-3 mb-1.5 break-words tracking-tight">
        {children}
      </h3>
    ),
    p: ({ children }: MarkdownTextProps) => (
      <p className="text-[#F0EDE8] leading-relaxed mb-2 last:mb-0 break-words text-sm">
        {children}
      </p>
    ),
    ul: ({ children }: MarkdownTextProps) => (
      <ul className="list-disc list-inside space-y-1 text-[#F0EDE8] my-2.5">
        {children}
      </ul>
    ),
    ol: ({ children }: MarkdownTextProps) => (
      <ol className="list-decimal list-inside space-y-1 text-[#F0EDE8] my-2.5">
        {children}
      </ol>
    ),
    li: ({ children }: MarkdownTextProps) => (
      <li className="text-[#F0EDE8] break-words text-sm leading-relaxed">
        {children}
      </li>
    ),
    blockquote: ({ children }: MarkdownTextProps) => (
      <blockquote className="border-l-4 border-[#E8A33D] pl-4 py-2 my-2.5 bg-[#1A1228]/60 rounded-r-xl text-[#F0EDE8]">
        {children}
      </blockquote>
    ),
    a: ({ href, children }: MarkdownLinkProps) => (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-[#F2C879] hover:text-[#FB7185] underline underline-offset-2 transition-colors break-all font-medium"
      >
        {children}
      </a>
    ),
    strong: ({ children }: MarkdownTextProps) => (
      <strong className="font-bold text-white break-words">
        {children}
      </strong>
    ),
    em: ({ children }: MarkdownTextProps) => (
      <em className="italic text-[#A89F96] break-words">
        {children}
      </em>
    ),
    hr: () => <hr className="my-4 border-[#2A1F3D]" />,
  }), [copiedMessageId, createMessageId]);

  const openConversation = async (conversationId: string) => {
    if (!session?.user?.id) return;

    setHistoryOpen(false);
    setHistoryLoading(true);
    try {
      const response = await fetch(`/api/ai/chat?userId=${session.user.id}&conversationId=${conversationId}`);
      const data = await response.json();
      if (data.success && data.data.conversation) {
        const loadedMessages = Array.isArray(data.data.conversation.messages)
          ? data.data.conversation.messages.map((message: { role: string; content: string; timestamp?: string | Date }) => ({
              id: createMessageId(message.role),
              role: message.role === 'user' ? 'user' : 'assistant',
              content: message.content,
              timestamp: new Date(message.timestamp || new Date().toISOString()),
            }))
          : [];

        setActiveConversationId(conversationId);
        setMessages(loadedMessages.length > 0 ? loadedMessages : [
          {
            id: 'welcome',
            role: 'assistant',
            content: getWelcomeMessage(),
            timestamp: new Date(),
          },
        ]);
        shouldAutoScrollRef.current = true;
        setTimeout(() => scrollToBottom('auto'), 100);
      }
    } catch (err) {
      console.error('Failed to open conversation:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    shouldAutoScrollRef.current = true;

    const userMessage: Message = {
      id: createMessageId('user'),
      role: 'user',
      content: trimmedInput,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmedInput,
          conversationHistory: messages.slice(-5),
          userId: session?.user?.id,
          userContext,
          profileRecommendations,
          conversationId: activeConversationId || undefined,
          useRAG: ragEnabled,
          strictMode: strictMode,
          hybridSearch: hybridSearch,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: createMessageId('assistant'),
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          ragEnabled: data.data.ragEnabled || false,
          fromCache: data.data.fromCache || false,
          provider: data.data.provider || 'unknown',
          sources: data.data.sources || [],
        };
        setMessages((prev) => [...prev, assistantMessage]);
        if (data.data.conversationId) {
          setActiveConversationId(data.data.conversationId);
        }

        const responseText = typeof data.data.response === 'string' ? data.data.response : '';
        streamAssistantResponse(assistantMessage.id, responseText);
        void loadConversationHistory();

        // Log RAG metrics if available
        if (session?.user?.id && data.data.ragEnabled) {
          fetch('/api/ai/log-usage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: session.user.id,
              techCenterId: session.user.techCenterId,
              details: { messageCount: messages.length + 1 },
              ragMetrics: {
                ragEnabled: data.data.ragEnabled,
                sourcesFound: data.data.sourcesFound,
                fromCache: data.data.fromCache,
                provider: data.data.provider,
                tokenUsage: data.data.tokenUsage,
                processingTime: data.data.processingTime,
                sources: data.data.sources,
              },
            }),
          }).catch((err) => console.error('Failed to log AI message:', err));
        } else if (session?.user?.id) {
          fetch('/api/ai/log-usage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: session.user.id,
              techCenterId: session.user.techCenterId,
              details: { messageCount: messages.length + 1 },
            }),
          }).catch((err) => console.error('Failed to log AI message:', err));
        }
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch {
      const errorMessage: Message = {
        id: createMessageId('assistant-error'),
        role: 'assistant',
        content: '⚠️ I encountered an error. Please try again. If this persists, please contact support.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const streamAssistantResponse = useCallback((messageId: string, fullText: string) => {
    if (!fullText) return;

    let index = 0;
    const speed = 8;

    const tick = () => {
      index += 1;
      setMessages((prev) => prev.map((message) => (
        message.id === messageId ? { ...message, content: fullText.slice(0, index) } : message
      )));

      if (index < fullText.length) {
        window.setTimeout(tick, speed);
      }
    };

    tick();
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  return (
    <div
      className="flex min-h-[500px] flex-col overflow-hidden rounded-2xl border border-[#2A1F3D] bg-[#0A0615] shadow-2xl shadow-black/40"
      style={chatHeight ? { height: `${chatHeight}px` } : undefined}
    >
      
      {/* ========== FIXED HEADER - STICKY ========== */}
      <div className="sticky top-0 z-20 flex-shrink-0 flex items-center justify-between border-b border-[#2A1F3D] bg-gradient-to-r from-[#0A0615] via-[#140E24] to-[#0A0615] px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#E8A33D] via-[#FB7185] to-[#14B8A6] rounded-2xl blur-xl opacity-60" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E8A33D] via-[#FB7185] to-[#14B8A6] overflow-hidden shadow-lg shadow-[#E8A33D]/30">
              <Image src="/atbriz.png" alt="Atbriz Ai" width={40} height={40} className="h-full w-full object-cover" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">Atbriz Ai</h1>
              <Sparkles className="h-4 w-4 text-[#E8A33D] animate-pulse" />
            </div>
            <p className="text-xs text-[#A89F96]">Your dedicated learning assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHistoryOpen((prev) => !prev)}
            className="rounded-xl border border-[#2A1F3D] bg-[#0A0615] p-2 text-[#A89F96] transition-all hover:bg-[#140E24] hover:text-white hover:border-[#E8A33D]/30"
            title="View chat history"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
          <button
            onClick={startNewChat}
            className="rounded-xl border border-[#2A1F3D] bg-[#0A0615] p-2 text-[#A89F96] transition-all hover:bg-[#140E24] hover:text-white hover:border-[#E8A33D]/30"
            title="Start new chat"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`rounded-xl border p-2 transition-all ${
              showSettings 
                ? 'border-[#E8A33D] bg-[#E8A33D]/20 text-[#E8A33D]' 
                : 'border-[#2A1F3D] bg-[#0A0615] text-[#A89F96] hover:bg-[#140E24] hover:text-white hover:border-[#E8A33D]/30'
            }`}
            title="AI Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl border border-[#2A1F3D] bg-[#0A0615] px-3 py-2 text-sm text-[#A89F96] transition-all hover:bg-[#140E24] hover:text-white hover:border-[#E8A33D]/30"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
        </div>
      </div>

      {/* ========== RAG SETTINGS PANEL ========== */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-[#2A1F3D] bg-[#140E24]/50"
          >
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Settings className="h-4 w-4 text-[#E8A33D]" />
                <h3 className="text-sm font-semibold text-white">AI Response Settings</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* RAG Toggle */}
                <div className="bg-[#0A0615] border border-[#2A1F3D] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-[#14B8A6]" />
                      <span className="text-sm text-[#F0EDE8]">RAG Mode</span>
                    </div>
                    <button
                      onClick={() => setRagEnabled(!ragEnabled)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        ragEnabled ? 'bg-[#14B8A6]' : 'bg-[#2A1F3D]'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        ragEnabled ? 'left-7' : 'left-1'
                      }`} />
                    </button>
                  </div>
                  <p className="text-[10px] text-[#A89F96]">
                    {ragEnabled ? 'Using knowledge base for better answers' : 'Standard AI responses'}
                  </p>
                </div>

                {/* Strict Mode Toggle */}
                <div className="bg-[#0A0615] border border-[#2A1F3D] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-[#E8A33D]" />
                      <span className="text-sm text-[#F0EDE8]">Strict Mode</span>
                    </div>
                    <button
                      onClick={() => setStrictMode(!strictMode)}
                      disabled={!ragEnabled}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        strictMode ? 'bg-[#E8A33D]' : 'bg-[#2A1F3D]'
                      } ${!ragEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        strictMode ? 'left-7' : 'left-1'
                      }`} />
                    </button>
                  </div>
                  <p className="text-[10px] text-[#A89F96]">
                    {strictMode ? 'Only answer from knowledge base' : 'Can use general knowledge'}
                  </p>
                </div>

                {/* Hybrid Search Toggle */}
                <div className="bg-[#0A0615] border border-[#2A1F3D] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-[#8B5CF6]" />
                      <span className="text-sm text-[#F0EDE8]">Hybrid Search</span>
                    </div>
                    <button
                      onClick={() => setHybridSearch(!hybridSearch)}
                      disabled={!ragEnabled}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        hybridSearch ? 'bg-[#8B5CF6]' : 'bg-[#2A1F3D]'
                      } ${!ragEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        hybridSearch ? 'left-7' : 'left-1'
                      }`} />
                    </button>
                  </div>
                  <p className="text-[10px] text-[#A89F96]">
                    {hybridSearch ? 'Combine semantic and keyword search' : 'Semantic search only'}
                  </p>
                </div>
              </div>

              {/* Info Banner */}
              <div className="flex items-start gap-2 p-3 bg-[#0A0615] border border-[#2A1F3D] rounded-lg">
                <Zap className="h-4 w-4 text-[#E8A33D] mt-0.5 flex-shrink-0" />
                <div className="text-xs text-[#A89F96]">
                  <p className="font-semibold text-[#F0EDE8] mb-1">About These Settings</p>
                  <p><strong>RAG Mode:</strong> Uses your knowledge base to provide accurate, contextual answers with source attribution.</p>
                  <p className="mt-1"><strong>Strict Mode:</strong> Only answers questions using information from your knowledge base.</p>
                  <p className="mt-1"><strong>Hybrid Search:</strong> Combines semantic understanding with keyword matching for best results.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== MAIN CHAT AREA - FLEXIBLE ========== */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        
        {/* History Panel */}
        <AnimatePresence>
          {historyOpen && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-y-0 left-0 z-20 flex w-[280px] flex-col border-r border-[#2A1F3D] bg-[#0A0615]/95 p-3 shadow-2xl shadow-black/50 backdrop-blur-xl"
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Chat history</p>
                  <p className="text-[10px] text-[#A89F96]">Pick a past conversation</p>
                </div>
                <button 
                  onClick={() => setHistoryOpen(false)} 
                  className="rounded-lg p-1.5 text-[#A89F96] hover:bg-[#140E24] hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={() => {
                  resetChat();
                  setHistoryOpen(false);
                }}
                className="mb-3 flex items-center gap-2 rounded-xl border border-[#2A1F3D] bg-[#140E24] px-3 py-2.5 text-left text-sm text-[#F0EDE8] transition-all hover:border-[#E8A33D]/40 hover:bg-[#1A1228]"
              >
                <Plus className="h-4 w-4 text-[#E8A33D]" />
                Start a new chat
              </button>
              <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                {historyLoading ? (
                  <p className="text-sm text-[#A89F96]">Loading history…</p>
                ) : historyItems.length === 0 ? (
                  <p className="text-sm text-[#A89F96]">No saved chats yet.</p>
                ) : (
                  historyItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => void openConversation(item.id)}
                      className={`w-full rounded-xl border px-3 py-2.5 text-left transition-all ${
                        activeConversationId === item.id 
                          ? 'border-[#E8A33D]/60 bg-[#140E24]' 
                          : 'border-[#2A1F3D] bg-[#0A0615] hover:border-[#E8A33D]/40 hover:bg-[#140E24]'
                      }`}
                    >
                      <p className="truncate text-sm font-semibold text-white">
                        {item.title || 'Untitled conversation'}
                      </p>
                      <p className="mt-1 text-[10px] text-[#A89F96]">
                        {new Date(item.updatedAt).toLocaleString()}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== SCROLLABLE MESSAGES ========== */}
        <div 
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 py-4 space-y-4 overscroll-contain"
          style={{ scrollBehavior: 'smooth' }}
        >
          {/* New Chat Confirmation Modal */}
          <AnimatePresence>
            {showNewChatConfirm && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                onClick={() => setShowNewChatConfirm(false)}
              >
                <motion.div
                  initial={{ y: 16 }}
                  animate={{ y: 0 }}
                  className="mx-4 w-full max-w-sm rounded-2xl border border-[#2A1F3D] bg-[#140E24] p-5 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mb-3 flex items-center gap-2.5">
                    <div className="rounded-lg bg-[#E8A33D]/20 p-1.5">
                      <MessageSquare className="h-5 w-5 text-[#E8A33D]" />
                    </div>
                    <h4 className="text-base font-bold text-white">Start New Chat?</h4>
                  </div>
                  <p className="mb-5 text-sm text-[#A89F96]">
                    This will clear the current conversation and start fresh.
                  </p>
                  <div className="flex justify-end gap-2.5">
                    <button 
                      onClick={() => setShowNewChatConfirm(false)} 
                      className="rounded-lg px-3.5 py-1.5 text-sm text-[#A89F96] transition-all hover:bg-[#0A0615] hover:text-white"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={resetChat} 
                      className="rounded-lg bg-gradient-to-r from-[#E8A33D] to-[#FB7185] px-3.5 py-1.5 text-sm font-semibold text-white transition-all hover:opacity-90 hover:scale-105"
                    >
                      Start Fresh
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              {/* Avatar */}
              <div className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-lg',
                message.role === 'user' 
                  ? 'bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9]' 
                  : 'bg-gradient-to-br from-[#E8A33D] via-[#FB7185] to-[#14B8A6]'
              )}>
                {message.role === 'user' ? (
                  session?.user?.profileImageUrl ? (
                    <Image 
                      src={session.user.profileImageUrl} 
                      alt={`${session.user.firstName} ${session.user.lastName}`} 
                      width={36} 
                      height={36} 
                      className="h-full w-full object-cover" 
                      unoptimized 
                    />
                  ) : (
                    <User className="h-4 w-4 text-white" />
                  )
                ) : (
                  <Image src="/atbriz.png" alt="Atbriz Ai" width={36} height={36} className="h-full w-full object-cover" />
                )}
              </div>

              {/* Message Content */}
              <div className={cn(
                'min-w-0 max-w-[88%] sm:max-w-[75%]',
                message.role === 'user' ? 'text-right' : 'text-left'
              )}>
                <div className={cn(
                  'relative inline-block w-full max-w-full rounded-2xl px-4 py-3 text-sm shadow-lg break-words',
                  message.role === 'user' 
                    ? 'rounded-tr-sm bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white' 
                    : 'rounded-tl-sm border border-[#2A1F3D] bg-[#0A0615] text-[#F0EDE8]'
                )}>
                  <div className="prose prose-invert max-w-none overflow-hidden text-left prose-p:my-1 prose-headings:my-1.5 break-words prose-p:text-[#F0EDE8] prose-strong:text-white prose-a:text-[#F2C879] prose-a:hover:text-[#FB7185]">
                    <ReactMarkdown components={MarkdownComponents}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  
                  {/* Copy Button */}
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => handleCopyMessage(message.content, message.id)}
                      className={cn(
                        "absolute right-2 top-2 rounded-lg p-1.5 transition-all duration-200",
                        "bg-[#1A1228] border border-[#2A1F3D]",
                        "text-[#A89F96] hover:text-white hover:border-[#E8A33D]/40 hover:bg-[#140E24]",
                        "shadow-lg"
                      )}
                      title="Copy response"
                    >
                      {copiedMessageId === message.id ? (
                        <Check className="h-3.5 w-3.5 text-[#14B8A6]" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                </div>
                
                {/* Timestamp */}
                <div className="mt-1 flex items-center gap-1.5 px-1">
                  <p className="text-[9px] text-[#A89F96]">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {message.role === 'user' && (
                    <span className="text-[9px] text-[#8B5CF6]">• You</span>
                  )}
                  {message.role === 'assistant' && copiedMessageId === message.id && (
                    <span className="text-[9px] text-[#14B8A6]">• Copied!</span>
                  )}
                  {message.role === 'assistant' && message.ragEnabled && (
                    <span className="text-[9px] text-[#E8A33D]">• RAG</span>
                  )}
                  {message.role === 'assistant' && message.fromCache && (
                    <span className="text-[9px] text-[#14B8A6]">• Cached</span>
                  )}
                </div>

                {/* RAG Sources */}
                {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                  <div className="mt-2 rounded-xl border border-[#2A1F3D] bg-[#140E24]/50 p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <BookOpen className="h-3.5 w-3.5 text-[#E8A33D]" />
                      <span className="text-xs font-semibold text-white">Sources</span>
                      <span className="text-[10px] text-[#A89F96]">({message.sources.length})</span>
                    </div>
                    <div className="space-y-2">
                      {message.sources.map((source, index) => (
                        <div
                          key={`${source.id}-${index}`}
                          className="flex items-start gap-2 rounded-lg bg-[#0A0615] p-2"
                        >
                          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#E8A33D]/20 text-[10px] font-bold text-[#E8A33D]">
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-white truncate">{source.title}</p>
                            <div className="mt-0.5 flex items-center gap-2">
                              <span className="text-[10px] text-[#A89F96]">
                                {source.category}
                                {source.subcategory && ` > ${source.subcategory}`}
                              </span>
                              <span className="text-[10px] text-[#A89F96]">•</span>
                              <span className="text-[10px] text-[#A89F96]">
                                {Math.round(source.similarity * 100)}% match
                              </span>
                              {source.source === 'semantic' && (
                                <Zap className="h-3 w-3 text-[#14B8A6]" />
                              )}
                              {source.source === 'keyword' && (
                                <Database className="h-3 w-3 text-[#A89F96]" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#E8A33D] via-[#FB7185] to-[#14B8A6] shadow-lg">
                <Image src="/atbriz.png" alt="Atbriz Ai" width={36} height={36} className="h-full w-full object-cover" />
              </div>
              <div className="rounded-2xl rounded-tl-sm border border-[#2A1F3D] bg-[#0A0615] px-4 py-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-[#E8A33D]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-[#FB7185] delay-100" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-[#14B8A6] delay-200" />
                  <span className="ml-1 text-xs text-[#A89F96]">Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

      </div>

      {/* ========== FIXED INPUT AREA - STICKY BOTTOM ========== */}
      <div className="sticky bottom-0 z-20 flex-shrink-0 border-t border-[#2A1F3D] bg-gradient-to-r from-[#0A0615] via-[#140E24] to-[#0A0615] px-4 py-3 backdrop-blur-xl">
        {/* Paste Notification */}
        <AnimatePresence>
          {pasteContent && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`mb-2 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10px] ${
                pasteContent.includes('⚠️') 
                  ? 'border-red-500/30 bg-red-500/10 text-red-400' 
                  : 'border-[#2A1F3D] bg-[#0A0615] text-[#A89F96]'
              }`}
            >
              {pasteContent.includes('⚠️') ? (
                <AlertCircle className="h-3.5 w-3.5 text-red-400" />
              ) : (
                <ClipboardPaste className="h-3.5 w-3.5 text-[#E8A33D]" />
              )}
              {pasteContent}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            onPaste={handlePaste}
            placeholder="Ask Atbriz Ai anything..."
            rows={1}
            className="flex-1 resize-none overflow-hidden rounded-xl border-2 border-[#2A1F3D] bg-[#0A0615] px-4 py-2.5 text-sm text-white placeholder-[#A89F96] shadow-inner transition-all focus:border-[#E8A33D] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/20 min-h-[44px] max-h-[120px]"
            style={{ height: '44px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-xl border-2 border-white/10 bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] text-white shadow-lg shadow-[#8B5CF6]/30 transition-all hover:scale-105 active:scale-95 flex-shrink-0',
              (!input.trim() || isLoading) && 'cursor-not-allowed opacity-50 hover:scale-100'
            )}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[9px] text-[#A89F96] px-1">
          <p>Press <kbd className="px-1.5 py-0.5 rounded bg-[#1A1228] border border-[#2A1F3D] text-[8px]">Enter</kbd> to send</p>
          <p>Paste text directly into the box</p>
        </div>
      </div>
    </div>
  );
}