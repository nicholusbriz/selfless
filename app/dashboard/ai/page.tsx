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
  Search,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAIUserData } from '@/hooks/useAIUserData';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

// =========================================================
// Design tokens — ink/brass palette matching the rest of the app
// =========================================================

const TOKENS = `
  [data-ai-scope] {
    --ink:        #12203B;
    --ink-2:      #3D4A61;
    --ink-3:      #6B7268;
    --ink-4:      #8A9088;

    --surface:    #FFFFFF;
    --surface-2:  #F7F6F2;
    --surface-3:  #EDECE6;

    --line:       #DADCD3;
    --line-strong:#C8CABF;

    --brand:      #12203B;
    --brand-hover:#1C2E4E;
    --brand-soft: #F0F0EB;

    --brass:      #B98A3E;
    --brass-hover:#A67A34;
    --brass-soft: #F8F3E8;

    --ok:         #55705B;
    --ok-soft:    #EEF3EE;

    --warn:       #8A6E3A;
    --warn-soft:  #F8F4EC;

    --bad:        #A4462F;
    --bad-soft:   #FBF0EC;

    --radius:     0px;

    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum' 1, 'cv05' 1;
  }
`;

const focusRing =
  'outline-none focus-visible:ring-1 focus-visible:ring-[var(--brass)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface)]';

const panel =
  'border border-[var(--line)] bg-[var(--surface)]';

const btnBase = `inline-flex items-center justify-center gap-2 px-3.5 py-2 text-[11px] font-mono font-semibold uppercase tracking-[0.1em] transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${focusRing}`;

const btnPrimary = `${btnBase} bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)]`;

const btnQuiet = `${btnBase} border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-2)] hover:border-[var(--brass)] hover:text-[var(--ink)]`;

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
  const { user } = useAuth();
  const { userContext, profileRecommendations } = useAIUserData();

  const [ragEnabled, setRagEnabled] = useState(true);
  const [strictMode, setStrictMode] = useState(false);
  const [hybridSearch, setHybridSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const getWelcomeMessage = useCallback(() => {
    const hour = new Date().getHours();
    const userName = user?.firstName || 'there';

    let timeGreeting = 'Good evening';
    if (hour >= 5 && hour < 12) timeGreeting = 'Good morning';
    else if (hour >= 12 && hour < 17) timeGreeting = 'Good afternoon';

    const greeting = `${timeGreeting}, ${userName}!`;

    let welcomeMessage = `**${greeting}** Welcome to Atbriz Ai — your intelligent learning companion.\n\n`;

    if (profileRecommendations) {
      welcomeMessage += `${profileRecommendations}\n\n`;
    }

    welcomeMessage += `**What I can help you with:**\n\n`;
    welcomeMessage += `• Academic guidance and assignment support\n`;
    welcomeMessage += `• Personalized learning based on your progress\n`;
    welcomeMessage += `• Platform navigation and feature guidance\n`;
    welcomeMessage += `• Coding assistance and debugging\n`;
    welcomeMessage += `• General knowledge and research\n`;
    welcomeMessage += `• Selfless CE organization information\n`;
    welcomeMessage += `• Developer and platform information\n\n`;

    if (ragEnabled) {
      welcomeMessage += `**Knowledge base enabled:** I'll provide accurate answers with source attribution.\n\n`;
    }

    welcomeMessage += `I learn from our interactions to provide increasingly personalized assistance. Ask me anything about the platform or your studies.\n\n`;
    welcomeMessage += `Let's start learning together.`;

    return welcomeMessage;
  }, [user?.firstName, profileRecommendations, ragEnabled]);

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

  useEffect(() => {
    if (user?.id) {
      fetch('/api/ai/log-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          techCenterId: user.techCenterId || undefined,
          details: {
            messageCount: 0,
            firstMessage: 'AI page opened',
          },
        }),
      }).catch((err) => console.error('Failed to log AI usage:', err));
    }
  }, [user?.id, user?.techCenterId]);

  const loadConversationHistory = useCallback(async () => {
    if (!user?.id) {
      setHistoryItems([]);
      return;
    }

    setHistoryLoading(true);
    try {
      const response = await fetch(`/api/ai/chat?userId=${user.id}`);
      const data = await response.json();
      if (data.success) {
        setHistoryItems(data.data.conversations || []);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, [user]);

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

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const atBottom = scrollHeight - scrollTop - clientHeight < 50;

    shouldAutoScrollRef.current = atBottom;
  }, []);

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
        setPasteContent('Images and videos are not supported. Text only.');
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
            setPasteContent(`Pasted ${text.length} characters`);
            setTimeout(() => setPasteContent(null), 1500);
          } else if (text.length > 0) {
            setPasteContent('Text pasted');
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
          <div className="relative my-3 border border-[var(--line)] bg-[var(--brand)]">
            <div className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--brand-hover)] px-3 py-2">
              <div className="flex items-center gap-2">
                <FileCode className="h-3.5 w-3.5 text-[var(--brass)]" />
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--ink-4)]">{match[1]}</span>
              </div>
              <button
                onClick={() => handleCopyCode(codeString, codeId)}
                className={`${btnQuiet} px-2 py-1 text-[10px]`}
              >
                {copiedMessageId === codeId ? (
                  <>
                    <Check className="h-3 w-3 text-[var(--ok)]" />
                    <span className="text-[var(--ok)]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="overflow-x-auto p-4">
              <pre className="m-0 overflow-x-auto font-mono text-[13px] leading-relaxed text-[var(--surface-2)]">
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
          'font-mono text-[12px] break-words',
          inline
            ? 'border border-[var(--line)] bg-[var(--brand)] px-1.5 py-0.5 text-[var(--surface-2)]'
            : 'block border border-[var(--line)] bg-[var(--brand)] p-4 overflow-x-auto text-[var(--surface-2)]'
        )} {...props}>
          {children}
        </code>
      );
    },
    h1: ({ children }: MarkdownTextProps) => (
      <h1 className="mt-4 mb-2.5 border-b border-[var(--line)] pb-2 font-semibold text-[18px] tracking-tight text-[var(--ink)]">
        {children}
      </h1>
    ),
    h2: ({ children }: MarkdownTextProps) => (
      <h2 className="mt-3.5 mb-2 font-semibold text-[16px] tracking-tight text-[var(--ink)]">
        {children}
      </h2>
    ),
    h3: ({ children }: MarkdownTextProps) => (
      <h3 className="mt-3 mb-1.5 font-semibold text-[14px] tracking-tight text-[var(--ink)]">
        {children}
      </h3>
    ),
    p: ({ children }: MarkdownTextProps) => (
      <p className="mb-2 last:mb-0 break-words font-mono text-[13px] leading-relaxed text-[var(--ink-2)]">
        {children}
      </p>
    ),
    ul: ({ children }: MarkdownTextProps) => (
      <ul className="my-2.5 list-disc list-inside space-y-1 font-mono text-[13px] text-[var(--ink-2)]">
        {children}
      </ul>
    ),
    ol: ({ children }: MarkdownTextProps) => (
      <ol className="my-2.5 list-decimal list-inside space-y-1 font-mono text-[13px] text-[var(--ink-2)]">
        {children}
      </ol>
    ),
    li: ({ children }: MarkdownTextProps) => (
      <li className="break-words font-mono text-[13px] leading-relaxed text-[var(--ink-2)]">
        {children}
      </li>
    ),
    blockquote: ({ children }: MarkdownTextProps) => (
      <blockquote className="my-2.5 border-l-4 border-[var(--brass)] bg-[var(--brand-soft)] pl-4 py-2 text-[var(--ink-2)]">
        {children}
      </blockquote>
    ),
    a: ({ href, children }: MarkdownLinkProps) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-[var(--brass)] underline underline-offset-2 transition-colors break-all hover:text-[var(--brass-hover)]"
      >
        {children}
      </a>
    ),
    strong: ({ children }: MarkdownTextProps) => (
      <strong className="font-bold text-[var(--ink)] break-words">
        {children}
      </strong>
    ),
    em: ({ children }: MarkdownTextProps) => (
      <em className="italic text-[var(--ink-3)] break-words">
        {children}
      </em>
    ),
    hr: () => <hr className="my-4 border-[var(--line)]" />,
  }), [copiedMessageId, createMessageId]);

  const openConversation = async (conversationId: string) => {
    if (!user?.id) return;

    setHistoryOpen(false);
    setHistoryLoading(true);
    try {
      const response = await fetch(`/api/ai/chat?userId=${user.id}&conversationId=${conversationId}`);
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
          userId: user?.id,
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

        if (user?.id && data.data.ragEnabled) {
          fetch('/api/ai/log-usage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              techCenterId: user.techCenterId,
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
        } else if (user?.id) {
          fetch('/api/ai/log-usage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              techCenterId: user.techCenterId,
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
        content: 'An error occurred. Please try again. If this persists, contact support.',
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

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  return (
    <div
      data-ai-scope
      className="min-h-screen bg-[var(--surface-2)] text-[var(--ink)] antialiased"
    >
      <style dangerouslySetInnerHTML={{ __html: TOKENS }} />

      <div
        className="flex flex-col overflow-hidden border border-[var(--line)] bg-[var(--surface)]"
        style={chatHeight ? { height: `${chatHeight}px` } : { minHeight: '500px' }}
      >

        {/* ========== HEADER ========== */}
        <div className="flex-shrink-0 flex items-center justify-between border-b border-[var(--line)] bg-[var(--surface)] px-3 py-3 sm:px-4">
          <div className="flex items-center gap-3">
            {/* Back button — visible on mobile */}
            <Link
              href="/dashboard"
              className={`${btnQuiet} sm:hidden px-2.5`}
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center border border-[var(--line)] bg-[var(--brand)] overflow-hidden">
              <Image src="/atbriz.png" alt="Atbriz Ai" width={40} height={40} className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-mono text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--ink)]">
                  Atbriz Ai
                </h1>
                <Sparkles className="h-3 w-3 text-[var(--brass)]" />
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--ink-3)]">
                Learning assistant
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setHistoryOpen((prev) => !prev)}
              className={btnQuiet}
              title="Chat history"
            >
              <MessageSquare className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={startNewChat}
              className={btnQuiet}
              title="Start new chat"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={cn(
                btnQuiet,
                showSettings && 'border-[var(--brass)] text-[var(--brass)]'
              )}
              title="AI Settings"
            >
              <Settings className="h-3.5 w-3.5" />
            </button>
            <Link
              href="/dashboard"
              className={`${btnQuiet} hidden sm:flex`}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Link>
          </div>
        </div>

        {/* ========== SETTINGS PANEL ========== */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-[var(--line)] bg-[var(--surface-2)]"
            >
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Settings className="h-4 w-4 text-[var(--brass)]" />
                  <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--ink)]">
                    Response Settings
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* RAG Toggle */}
                  <div className="border border-[var(--line)] bg-[var(--surface)] p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-[var(--ok)]" />
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink)]">
                          Knowledge Base
                        </span>
                      </div>
                      <button
                        onClick={() => setRagEnabled(!ragEnabled)}
                        className={`relative w-10 h-5 border transition-colors ${focusRing} ${
                          ragEnabled ? 'border-[var(--brass)] bg-[var(--brass)]' : 'border-[var(--line)] bg-[var(--surface-2)]'
                        }`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-[var(--surface)] transition-transform ${
                          ragEnabled ? 'left-5' : 'left-0.5'
                        }`} />
                      </button>
                    </div>
                    <p className="font-mono text-[10px] text-[var(--ink-3)]">
                      {ragEnabled ? 'Using knowledge base' : 'Standard responses'}
                    </p>
                  </div>

                  {/* Strict Mode */}
                  <div className="border border-[var(--line)] bg-[var(--surface)] p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-[var(--warn)]" />
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink)]">
                          Strict Mode
                        </span>
                      </div>
                      <button
                        onClick={() => setStrictMode(!strictMode)}
                        disabled={!ragEnabled}
                        className={`relative w-10 h-5 border transition-colors ${focusRing} ${
                          strictMode ? 'border-[var(--brass)] bg-[var(--brass)]' : 'border-[var(--line)] bg-[var(--surface-2)]'
                        } ${!ragEnabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-[var(--surface)] transition-transform ${
                          strictMode ? 'left-5' : 'left-0.5'
                        }`} />
                      </button>
                    </div>
                    <p className="font-mono text-[10px] text-[var(--ink-3)]">
                      {strictMode ? 'Knowledge base only' : 'General knowledge allowed'}
                    </p>
                  </div>

                  {/* Hybrid Search */}
                  <div className="border border-[var(--line)] bg-[var(--surface)] p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-[var(--brand)]" />
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink)]">
                          Hybrid Search
                        </span>
                      </div>
                      <button
                        onClick={() => setHybridSearch(!hybridSearch)}
                        disabled={!ragEnabled}
                        className={`relative w-10 h-5 border transition-colors ${focusRing} ${
                          hybridSearch ? 'border-[var(--brass)] bg-[var(--brass)]' : 'border-[var(--line)] bg-[var(--surface-2)]'
                        } ${!ragEnabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-[var(--surface)] transition-transform ${
                          hybridSearch ? 'left-5' : 'left-0.5'
                        }`} />
                      </button>
                    </div>
                    <p className="font-mono text-[10px] text-[var(--ink-3)]">
                      {hybridSearch ? 'Semantic + keyword' : 'Semantic only'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== MAIN CHAT AREA ========== */}
        <div className="relative flex min-h-0 flex-1 overflow-hidden">

          {/* History Panel */}
          <AnimatePresence>
            {historyOpen && (
              <motion.div
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-y-0 left-0 z-20 flex w-[280px] flex-col border-r border-[var(--line)] bg-[var(--surface)] p-3 shadow-lg"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--ink)]">
                      Chat History
                    </p>
                    <p className="font-mono text-[10px] text-[var(--ink-3)]">
                      Past conversations
                    </p>
                  </div>
                  <button
                    onClick={() => setHistoryOpen(false)}
                    className={btnQuiet}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={() => {
                    resetChat();
                    setHistoryOpen(false);
                  }}
                  className={`${btnQuiet} mb-3 w-full justify-start`}
                >
                  <Plus className="h-4 w-4" />
                  New chat
                </button>
                <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                  {historyLoading ? (
                    <p className="font-mono text-[12px] text-[var(--ink-3)]">Loading…</p>
                  ) : historyItems.length === 0 ? (
                    <p className="font-mono text-[12px] text-[var(--ink-3)]">No saved chats.</p>
                  ) : (
                    historyItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => void openConversation(item.id)}
                        className={`w-full border px-3 py-2.5 text-left transition-colors ${focusRing} ${
                          activeConversationId === item.id
                            ? 'border-[var(--brass)] bg-[var(--brass-soft)]'
                            : 'border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-2)]'
                        }`}
                      >
                        <p className="truncate font-mono text-[12px] font-semibold text-[var(--ink)]">
                          {item.title || 'Untitled'}
                        </p>
                        <p className="mt-1 font-mono text-[10px] text-[var(--ink-3)]">
                          {new Date(item.updatedAt).toLocaleString()}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ========== MESSAGES ========== */}
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 py-4 sm:px-4 space-y-4"
          >
            {/* New Chat Confirmation */}
            <AnimatePresence>
              {showNewChatConfirm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ink)]/50"
                  onClick={() => setShowNewChatConfirm(false)}
                >
                  <motion.div
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mx-4 w-full max-w-sm border border-[var(--line)] bg-[var(--surface)] p-5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="mb-3 flex items-center gap-2.5">
                      <div className="border border-[var(--line)] bg-[var(--brand)] p-1.5">
                        <MessageSquare className="h-5 w-5 text-[var(--surface-2)]" />
                      </div>
                      <h4 className="font-mono text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--ink)]">
                        Start New Chat?
                      </h4>
                    </div>
                    <p className="mb-5 font-mono text-[12px] text-[var(--ink-2)]">
                      This will clear the current conversation.
                    </p>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowNewChatConfirm(false)}
                        className={btnQuiet}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={resetChat}
                        className={btnPrimary}
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
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                {/* Avatar */}
                <div className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden border border-[var(--line)]',
                  message.role === 'user'
                    ? 'bg-[var(--brand)]'
                    : 'bg-[var(--brand)]'
                )}>
                  {message.role === 'user' ? (
                    user?.profileImageUrl ? (
                      <Image
                        src={user.profileImageUrl}
                        alt={`${user.firstName} ${user.lastName}`}
                        width={32}
                        height={32}
                        className="h-full w-full object-cover grayscale"
                        unoptimized
                      />
                    ) : (
                      <User className="h-4 w-4 text-[var(--surface-2)]" />
                    )
                  ) : (
                    <Image src="/atbriz.png" alt="Atbriz Ai" width={32} height={32} className="h-full w-full object-cover" />
                  )}
                </div>

                {/* Message Content */}
                <div className={cn(
                  'min-w-0 max-w-[85%] sm:max-w-[75%]',
                  message.role === 'user' ? 'text-right' : 'text-left'
                )}>
                  <div className={cn(
                    'inline-block w-full max-w-full border px-4 py-3 font-mono text-[13px] leading-relaxed break-words',
                    message.role === 'user'
                      ? 'border-[var(--brand)] bg-[var(--brand)] text-[var(--surface-2)]'
                      : 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)]'
                  )}>
                    <div className="prose prose-invert max-w-none overflow-hidden text-left prose-p:my-1 prose-headings:my-1.5 break-words">
                      <ReactMarkdown components={MarkdownComponents}>
                        {message.content}
                      </ReactMarkdown>
                    </div>

                    {/* Copy Button */}
                    {message.role === 'assistant' && (
                      <button
                        onClick={() => handleCopyMessage(message.content, message.id)}
                        className={`mt-2 border border-[var(--line)] bg-[var(--surface)] px-2 py-1 text-[10px] font-mono transition-colors hover:border-[var(--brass)] hover:text-[var(--brass)] ${focusRing}`}
                      >
                        {copiedMessageId === message.id ? (
                          <span className="text-[var(--ok)]">Copied</span>
                        ) : (
                          'Copy'
                        )}
                      </button>
                    )}
                  </div>

                  {/* Timestamp & Metadata */}
                  <div className="mt-1 flex items-center gap-2 px-1">
                    <span className="font-mono text-[9px] text-[var(--ink-4)]">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {message.role === 'user' && (
                      <span className="font-mono text-[9px] text-[var(--brand)]">• You</span>
                    )}
                    {message.role === 'assistant' && message.ragEnabled && (
                      <span className="font-mono text-[9px] text-[var(--brass)]">• Knowledge Base</span>
                    )}
                    {message.role === 'assistant' && message.fromCache && (
                      <span className="font-mono text-[9px] text-[var(--ok)]">• Cached</span>
                    )}
                  </div>

                  {/* Sources */}
                  {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                    <div className="mt-2 border border-[var(--line)] bg-[var(--surface-2)] p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <BookOpen className="h-3.5 w-3.5 text-[var(--brass)]" />
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ink)]">
                          Sources
                        </span>
                        <span className="font-mono text-[9px] text-[var(--ink-4)]">
                          ({message.sources.length})
                        </span>
                      </div>
                      <div className="space-y-2">
                        {message.sources.map((source, index) => (
                          <div
                            key={`${source.id}-${index}`}
                            className="border border-[var(--line)] bg-[var(--surface)] p-2"
                          >
                            <div className="flex items-start gap-2">
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-[var(--line)] bg-[var(--brand)] font-mono text-[9px] font-bold text-[var(--surface-2)]">
                                {index + 1}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-mono text-[11px] font-semibold text-[var(--ink)]">
                                  {source.title}
                                </p>
                                <div className="mt-0.5 flex items-center gap-2">
                                  <span className="font-mono text-[9px] text-[var(--ink-3)]">
                                    {source.category}
                                    {source.subcategory && ` > ${source.subcategory}`}
                                  </span>
                                  <span className="text-[var(--ink-4)]">•</span>
                                  <span className="font-mono text-[9px] text-[var(--ink-3)]">
                                    {Math.round(source.similarity * 100)}% match
                                  </span>
                                </div>
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
                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden border border-[var(--line)] bg-[var(--brand)]">
                  <Image src="/atbriz.png" alt="Atbriz Ai" width={32} height={32} className="h-full w-full object-cover" />
                </div>
                <div className="border border-[var(--line)] bg-[var(--surface-2)] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 animate-pulse bg-[var(--brass)]" />
                    <div className="h-1.5 w-1.5 animate-pulse delay-100 bg-[var(--brass)]" />
                    <div className="h-1.5 w-1.5 animate-pulse delay-200 bg-[var(--brass)]" />
                    <span className="ml-1 font-mono text-[10px] text-[var(--ink-3)]">Thinking</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

        </div>

        {/* ========== INPUT AREA ========== */}
        <div className="flex-shrink-0 border-t border-[var(--line)] bg-[var(--surface)] px-3 py-3 sm:px-4">
          {/* Paste Notification */}
          <AnimatePresence>
            {pasteContent && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className={`mb-2 flex items-center gap-2 border px-3 py-1.5 font-mono text-[10px] ${
                  pasteContent.includes('not supported')
                    ? 'border-[var(--bad)] bg-[var(--bad-soft)] text-[var(--bad)]'
                    : 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-2)]'
                }`}
              >
                <ClipboardPaste className="h-3.5 w-3.5" />
                {pasteContent}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              onPaste={handlePaste}
              placeholder="Ask Atbriz Ai anything..."
              rows={1}
              className={`flex-1 resize-none overflow-hidden border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2.5 font-mono text-[13px] text-[var(--ink)] placeholder:text-[var(--ink-4)] min-h-[40px] max-h-[120px] ${focusRing}`}
              style={{ height: '40px' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={cn(
                btnPrimary,
                'h-10 w-10 flex-shrink-0',
                (!input.trim() || isLoading) && 'opacity-40 cursor-not-allowed'
              )}
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-1.5 flex items-center justify-between font-mono text-[9px] text-[var(--ink-4)] px-1">
            <span>Press <kbd className="border border-[var(--line)] px-1.5 py-0.5 text-[8px]">Enter</kbd> to send</span>
            <span>Paste text directly</span>
          </div>
        </div>
      </div>
    </div>
  );
}