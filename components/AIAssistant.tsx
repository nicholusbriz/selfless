'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, X, Send, Sparkles, Minimize2, Maximize2, 
  Bot, User, Brain, Zap, Copy, Check, Plus, ChevronDown,
  Code, Terminal, FileCode, CornerDownLeft, Clipboard, ClipboardPaste,
  FileText, Image, Link, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { useAIUserData } from '@/hooks/useAIUserData';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export default function AIAssistant() {
  const { data: session } = useSession();
  const { userContext, profileRecommendations, isLoading: userDataLoading } = useAIUserData();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showNewChatConfirm, setShowNewChatConfirm] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isPasting, setIsPasting] = useState(false);
  const [pasteContent, setPasteContent] = useState<string | null>(null);

  // Memoize the welcome message to prevent unnecessary re-renders
  const getWelcomeMessage = useCallback(() => {
    const hour = new Date().getHours();
    const userName = session?.user?.firstName || 'there';
    
    let timeGreeting;
    if (hour >= 5 && hour < 12) timeGreeting = 'Good morning';
    else if (hour >= 12 && hour < 17) timeGreeting = 'Good afternoon';
    else timeGreeting = 'Good evening';
    
    const greeting = `${timeGreeting}, ${userName}!`;
    
    let welcomeMessage = `🚀 ${greeting} Welcome to **Atbriz Ai** - Your intelligent learning companion!\n\n`;
    
    if (profileRecommendations) {
      welcomeMessage += profileRecommendations + '\n\n';
    }
    
    welcomeMessage += `I can help you with:\n\n• 📚 Academic guidance and assignment help\n• 🎯 Personalized learning based on your progress\n• 💡 Site navigation and platform features\n• 🔧 Coding help and debugging\n• 📖 General knowledge and research\n• 🏢 Selfless CE organization information\n• 👨‍💻 Developer and platform information\n\nI'm designed to learn from your interactions and provide increasingly personalized assistance. Feel free to ask me about the platform, your studies, or even who created me!\n\nLet's start learning together!`;
    
    return welcomeMessage;
  }, [session?.user?.firstName, profileRecommendations]);

  // Initialize messages with welcome message
  const [messages, setMessages] = useState<Message[]>(() => {
    // Try to load from localStorage first
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ai-chat-messages');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Only restore if it's from the same session
          const savedSessionId = localStorage.getItem('ai-chat-session-id');
          if (savedSessionId === session?.user?.id) {
            return parsed;
          }
        } catch (e) {
          console.error('Failed to parse saved messages:', e);
        }
      }
    }
    
    return [
      {
        id: '1',
        role: 'assistant',
        content: getWelcomeMessage(),
        timestamp: new Date()
      }
    ];
  });

  // Log when AI chat is opened
  useEffect(() => {
    if (isOpen && session?.user?.id) {
      fetch('/api/ai/log-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          techCenterId: session.user.techCenterId || undefined,
          details: {
            messageCount: 0,
            firstMessage: 'Chat opened'
          }
        })
      }).catch(err => console.error('Failed to log AI usage:', err));
    }
  }, [isOpen, session?.user?.id, session?.user?.techCenterId]);

  // Clear localStorage when session changes (user logs out or different user logs in)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSessionId = localStorage.getItem('ai-chat-session-id');
      const currentSessionId = session?.user?.id;
      
      if (savedSessionId && currentSessionId && savedSessionId !== currentSessionId) {
        // Different user logged in, clear previous chat
        localStorage.removeItem('ai-chat-messages');
        localStorage.removeItem('ai-chat-session-id');
        // Reset to welcome message for new user
        const hour = new Date().getHours();
        const userName = session?.user?.firstName || 'there';
        let timeGreeting;
        if (hour >= 5 && hour < 12) timeGreeting = 'Good morning';
        else if (hour >= 12 && hour < 17) timeGreeting = 'Good afternoon';
        else timeGreeting = 'Good evening';
        
        const greeting = `${timeGreeting}, ${userName}!`;
        let welcomeMessage = `🚀 ${greeting} Welcome to **Atbriz Ai** - Your intelligent learning companion!\n\n`;
        welcomeMessage += `I can help you with:\n\n• 📚 Academic guidance and assignment help\n• 🎯 Personalized learning based on your progress\n• 💡 Site navigation and platform features\n• 🔧 Coding help and debugging\n• 📖 General knowledge and research\n• 🏢 Selfless CE organization information\n• 👨‍💻 Developer and platform information\n\nI'm designed to learn from your interactions and provide increasingly personalized assistance. Feel free to ask me about the platform, your studies, or even who created me!\n\nLet's start learning together!`;
        
        setMessages([{
          id: '1',
          role: 'assistant',
          content: welcomeMessage,
          timestamp: new Date()
        }]);
      } else if (!currentSessionId && savedSessionId) {
        // User logged out
        localStorage.removeItem('ai-chat-messages');
        localStorage.removeItem('ai-chat-session-id');
      }
    }
  }, [session?.user?.id, session?.user?.firstName]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && session?.user?.id) {
      localStorage.setItem('ai-chat-messages', JSON.stringify(messages));
      localStorage.setItem('ai-chat-session-id', session.user.id);
    }
  }, [messages, session?.user?.id]);

  // Update welcome message when session or profile recommendations change
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === '1') {
      setMessages(prev => [{
        ...prev[0],
        content: getWelcomeMessage()
      }]);
    }
  }, [getWelcomeMessage, messages.length]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Smooth scroll to bottom with animation
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const targetScrollTop = container.scrollHeight - container.clientHeight;
      
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      
      if (isNearBottom || behavior === 'auto') {
        container.scrollTo({
          top: targetScrollTop,
          behavior: behavior
        });
      }
    }
  }, []);

  // Check scroll position for showing scroll button
  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    }
  }, []);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      const timeoutId = setTimeout(() => {
        scrollToBottom('smooth');
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [messages, scrollToBottom]);

  // New Chat Function
  const startNewChat = () => {
    if (messages.length > 1) {
      setShowNewChatConfirm(true);
    } else {
      resetChat();
    }
  };

  const resetChat = () => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: getWelcomeMessage(),
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
    setInput('');
    setShowNewChatConfirm(false);
    setIsLoading(false);
    setShowScrollButton(false);
    setPasteContent(null);
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ai-chat-messages');
      localStorage.removeItem('ai-chat-session-id');
    }
    
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Handle code copying
  const handleCopyCode = (code: string, messageId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  // Handle paste functionality - accepts text only, blocks images/videos
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setIsPasting(true);
    
    try {
      // Check what's in the clipboard
      const clipboardData = e.clipboardData;
      const items = clipboardData.items;
      
      // Check if there are any image or video items
      let hasImageOrVideo = false;
      let pastedText = '';
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/') || item.type.startsWith('video/')) {
          hasImageOrVideo = true;
          break;
        }
        if (item.type === 'text/plain') {
          item.getAsString((text) => {
            pastedText = text;
          });
        }
      }
      
      // If there's an image or video, show a message and don't paste
      if (hasImageOrVideo) {
        setPasteContent('⚠️ Images and videos are not supported. Text only.');
        setTimeout(() => setPasteContent(null), 3000);
        setIsPasting(false);
        return;
      }
      
      // Get plain text
      const text = clipboardData.getData('text/plain');
      
      if (text) {
        const textarea = inputRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const currentValue = input;
          
          // If there's selected text, replace it
          if (start !== end) {
            const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);
            setInput(newValue);
          } else {
            // Insert at cursor position
            const newValue = currentValue.substring(0, start) + text + currentValue.substring(start);
            setInput(newValue);
            
            // Set cursor position after pasted content
            setTimeout(() => {
              if (textarea) {
                const newPosition = start + text.length;
                textarea.selectionStart = newPosition;
                textarea.selectionEnd = newPosition;
                textarea.focus();
              }
            }, 0);
          }
          
          // Show paste indicator
          if (text.length > 100) {
            setPasteContent(`📄 Pasted ${text.length} characters`);
            setTimeout(() => setPasteContent(null), 1500);
          } else if (text.length > 0) {
            setPasteContent('✅ Text pasted');
            setTimeout(() => setPasteContent(null), 1000);
          }
        }
      }
    } catch (error) {
      console.error('Paste error:', error);
      // Fallback to default paste
      const text = e.clipboardData.getData('text/plain');
      if (text) {
        setInput(prev => prev + text);
      }
    } finally {
      setIsPasting(false);
    }
  }, [input]);

  // Custom markdown components with proper mobile handling
  const MarkdownComponents = useMemo(() => ({
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');
      
      if (!inline && match) {
        return (
          <div className="relative group my-2 rounded-lg overflow-hidden border border-[#241B35] bg-[#0F0A1A]">
            <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#1A1228] border-b border-[#241B35]">
              <div className="flex items-center gap-1.5">
                <FileCode className="w-3 h-3 text-[#E8A33D]" />
                <span className="text-[9px] text-[#8A8278] font-mono uppercase">{match[1]}</span>
              </div>
              <button
                onClick={() => handleCopyCode(codeString, `code-${Date.now()}`)}
                className="flex items-center gap-1 text-[9px] text-[#8A8278] hover:text-white transition-colors px-1.5 py-0.5 rounded hover:bg-[#241B35]"
              >
                {copiedMessageId === `code-${Date.now()}` ? (
                  <>
                    <Check className="w-2.5 h-2.5 text-[#14B8A6]" />
                    <span className="text-[#14B8A6]">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-2.5 h-2.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="overflow-x-auto">
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                className="!m-0 !bg-transparent !p-2.5 text-xs"
                showLineNumbers
                wrapLines
                wrapLongLines={true}
                lineNumberStyle={{ minWidth: '1.5em', paddingRight: '0.5em' }}
                {...props}
              >
                {codeString}
              </SyntaxHighlighter>
            </div>
          </div>
        );
      }
      
      return (
        <code className={cn(
          "px-1 py-0.5 rounded text-[11px] font-mono break-all",
          inline ? "bg-[#1A1228] text-[#E8A33D] border border-[#241B35]" : "block bg-[#1A1228] p-2.5 rounded-lg border border-[#241B35] overflow-x-auto"
        )} {...props}>
          {children}
        </code>
      );
    },
    // Enhanced markdown components with reduced spacing
    h1: ({ children }: any) => <h1 className="text-lg font-bold text-white mt-2.5 mb-1.5 break-words">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-base font-bold text-white mt-2 mb-1 break-words">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-sm font-bold text-white mt-1.5 mb-1 break-words">{children}</h3>,
    p: ({ children }: any) => <p className="text-[#F8F5F0] leading-relaxed mb-1.5 last:mb-0 break-words">{children}</p>,
    ul: ({ children }: any) => <ul className="list-disc list-inside space-y-0.5 text-[#F8F5F0] my-1.5">{children}</ul>,
    ol: ({ children }: any) => <ol className="list-decimal list-inside space-y-0.5 text-[#F8F5F0] my-1.5">{children}</ol>,
    li: ({ children }: any) => <li className="text-[#F8F5F0] break-words text-xs">{children}</li>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-3 border-[#E8A33D] pl-2.5 py-1 my-1.5 bg-[#1A1228]/50 rounded-r-lg break-words">
        {children}
      </blockquote>
    ),
    a: ({ href, children }: any) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#E8A33D] hover:text-[#FB7185] underline transition-colors break-all">
        {children}
      </a>
    ),
    strong: ({ children }: any) => <strong className="font-bold text-white break-words">{children}</strong>,
    em: ({ children }: any) => <em className="italic text-[#8A8278] break-words">{children}</em>,
    // Table support with horizontal scroll only for tables
    table: ({ children }: any) => (
      <div className="overflow-x-auto my-2 border border-[#241B35] rounded-lg">
        <table className="min-w-full divide-y divide-[#241B35]">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: any) => (
      <thead className="bg-[#1A1228]">
        {children}
      </thead>
    ),
    tbody: ({ children }: any) => (
      <tbody className="divide-y divide-[#241B35]">
        {children}
      </tbody>
    ),
    tr: ({ children }: any) => (
      <tr className="hover:bg-[#1A1228]/50 transition-colors">
        {children}
      </tr>
    ),
    th: ({ children }: any) => (
      <th className="px-2.5 py-1.5 text-left text-[10px] font-medium text-[#8A8278] uppercase tracking-wider break-words">
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className="px-2.5 py-1.5 text-xs text-[#F8F5F0] break-words">
        {children}
      </td>
    ),
  }), [copiedMessageId]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages.slice(-5),
          userId: session?.user?.id,
          userContext: userContext,
          profileRecommendations
        })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);

        if (session?.user?.id) {
          fetch('/api/ai/log-usage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: session.user.id,
              techCenterId: session.user.techCenterId,
              details: {
                messageCount: messages.length + 1
              }
            })
          }).catch(err => console.error('Failed to log AI message:', err));
        }
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "⚠️ I encountered an error. Please try again. If this persists, please contact support.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
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

  const handleCopy = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  // Keyboard shortcut for new chat (Ctrl/Cmd + N)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        if (isOpen) {
          e.preventDefault();
          startNewChat();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, messages.length]);

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-4 right-4 z-50",
          "w-auto h-14 rounded-2xl",
          "bg-gradient-to-br from-[#E8A33D] via-[#FB7185] to-[#14B8A6]",
          "shadow-2xl shadow-[#E8A33D]/40",
          "flex items-center gap-2.5 px-3.5",
          "text-white",
          "transition-all duration-300",
          "border-2 border-white/20",
          isOpen && "hidden"
        )}
      >
        <div className="relative">
          <img src="/atbriz.png" alt="Atbriz Ai" className="w-8 h-8 rounded-xl object-cover" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1.5 -right-1.5"
          >
            <Sparkles className="w-3 h-3 text-[#E8A33D]" />
          </motion.div>
        </div>
        <span className="font-bold text-xs whitespace-nowrap">Atbriz Ai</span>
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              "fixed bottom-4 right-4 z-50",
              "w-[400px] max-w-[calc(100vw-2rem)]",
              "bg-[#0F0A1A] rounded-2xl",
              "shadow-2xl shadow-black/50",
              "border border-[#1A1228]",
              "overflow-hidden",
              isMinimized ? "h-16" : "h-[600px] max-h-[calc(100vh-4rem)]"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#1A1228] bg-gradient-to-r from-[#1A1228] via-[#241B35] to-[#1A1228]">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#E8A33D] via-[#FB7185] to-[#14B8A6] rounded-full blur-lg opacity-60 animate-pulse" />
                  <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-[#E8A33D] via-[#FB7185] to-[#14B8A6] flex items-center justify-center shadow-lg overflow-hidden">
                    <img src="/atbriz.png" alt="Atbriz Ai" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-white font-bold text-sm">Atbriz Ai</h3>
                    <Zap className="w-3 h-3 text-[#E8A33D]" />
                  </div>
                  <p className="text-[#8A8278] text-[9px]">Intelligent Learning Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={startNewChat}
                  className="p-1.5 rounded-lg text-[#8A8278] hover:text-white hover:bg-[#1A1228] transition-all"
                  title="New chat (Ctrl+N)"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 rounded-lg text-[#8A8278] hover:text-white hover:bg-[#1A1228] transition-all"
                >
                  {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-[#8A8278] hover:text-white hover:bg-[#1A1228] transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div 
                  ref={messagesContainerRef}
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 space-y-3 h-[calc(100%-145px)] bg-gradient-to-b from-[#0F0A1A] to-[#1A1228]/50 scroll-smooth"
                >
                  {/* New Chat Confirmation Dialog */}
                  <AnimatePresence>
                    {showNewChatConfirm && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]"
                        onClick={() => setShowNewChatConfirm(false)}
                      >
                        <motion.div
                          initial={{ y: 20 }}
                          animate={{ y: 0 }}
                          className="bg-[#1A1228] border border-[#241B35] rounded-xl p-5 max-w-xs w-full mx-4 shadow-2xl"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-2.5 mb-3">
                            <div className="p-1.5 rounded-lg bg-[#E8A33D]/20">
                              <MessageSquare className="w-5 h-5 text-[#E8A33D]" />
                            </div>
                            <h4 className="text-white font-bold text-base">Start New Chat?</h4>
                          </div>
                          <p className="text-[#8A8278] text-xs mb-5">
                            This will clear the current conversation and start fresh.
                          </p>
                          <div className="flex gap-2.5 justify-end">
                            <button
                              onClick={() => setShowNewChatConfirm(false)}
                              className="px-3.5 py-1.5 rounded-lg text-[#8A8278] hover:text-white hover:bg-[#0F0A1A] transition-all text-sm"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={resetChat}
                              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#E8A33D] to-[#FB7185] text-white font-medium hover:opacity-90 transition-all text-sm"
                            >
                              Start Fresh
                            </button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "flex gap-2",
                        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                      )}
                    >
                      <div className={cn(
                        "flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center shadow-lg overflow-hidden",
                        message.role === 'user' 
                          ? 'bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9]' 
                          : 'bg-gradient-to-br from-[#E8A33D] via-[#FB7185] to-[#14B8A6]'
                      )}>
                        {message.role === 'user' ? (
                          session?.user?.profileImageUrl ? (
                            <img 
                              src={session.user.profileImageUrl} 
                              alt={`${session.user.firstName} ${session.user.lastName}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-3.5 h-3.5 text-white" />
                          )
                        ) : (
                          <img src="/atbriz.png" alt="Atbriz Ai" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className={cn(
                        "flex-1 max-w-[82%] min-w-0",
                        message.role === 'user' ? 'text-right' : 'text-left'
                      )}>
                        <div className={cn(
                          "inline-block px-3 py-2 rounded-2xl text-sm shadow-lg relative group max-w-full",
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white rounded-tr-sm'
                            : 'bg-[#1A1228] text-[#F8F5F0] rounded-tl-sm border border-[#241B35]'
                        )}>
                          <div className="prose prose-invert max-w-none prose-p:my-0.5 prose-headings:my-1 overflow-hidden text-left">
                            <ReactMarkdown components={MarkdownComponents}>
                              {message.content}
                            </ReactMarkdown>
                          </div>
                          
                          {message.role === 'assistant' && (
                            <button
                              onClick={() => handleCopy(message.content, message.id)}
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg bg-[#241B35] hover:bg-[#E8A33D] text-[#8A8278] hover:text-white"
                              title="Copy response"
                            >
                              {copiedMessageId === message.id ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <p className="text-[8px] text-[#8A8278] font-medium">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {message.role === 'user' && (
                            <span className="text-[8px] text-[#8B5CF6] font-medium">• You</span>
                          )}
                          {message.role === 'assistant' && copiedMessageId === message.id && (
                            <span className="text-[8px] text-[#14B8A6] font-medium">• Copied!</span>
                          )}
                          {message.role === 'assistant' && message.id === messages[messages.length - 1]?.id && message.id !== '1' && (
                            <span className="text-[8px] text-[#E8A33D] font-medium">• Just now</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-2"
                    >
                      <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-[#E8A33D] via-[#FB7185] to-[#14B8A6] flex items-center justify-center shadow-lg overflow-hidden">
                        <img src="/atbriz.png" alt="Atbriz Ai" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="inline-block px-3 py-2 rounded-2xl rounded-tl-sm bg-[#1A1228] border border-[#241B35] shadow-lg">
                          <div className="flex gap-1.5 items-center">
                            <div className="w-1.5 h-1.5 bg-[#E8A33D] rounded-full animate-bounce" />
                            <div className="w-1.5 h-1.5 bg-[#FB7185] rounded-full animate-bounce delay-100" />
                            <div className="w-1.5 h-1.5 bg-[#14B8A6] rounded-full animate-bounce delay-200" />
                            <span className="text-[9px] text-[#8A8278] ml-1">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Scroll to bottom button */}
                <AnimatePresence>
                  {showScrollButton && messages.length > 1 && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => scrollToBottom('smooth')}
                      className="absolute bottom-[75px] right-3 z-20 p-1.5 rounded-full bg-[#E8A33D] hover:bg-[#d4953a] text-white shadow-lg shadow-[#E8A33D]/30 transition-all hover:scale-110"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Input */}
                <div className="px-3 py-2.5 border-t border-[#1A1228] bg-gradient-to-r from-[#1A1228] via-[#241B35] to-[#1A1228]">
                  {/* Paste notification */}
                  <AnimatePresence>
                    {pasteContent && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`mb-1.5 px-2.5 py-1 rounded-lg border text-[9px] flex items-center gap-1.5 ${
                          pasteContent.includes('⚠️') 
                            ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                            : 'bg-[#1A1228] border-[#241B35] text-[#8A8278]'
                        }`}
                      >
                        {pasteContent.includes('⚠️') ? (
                          <AlertCircle className="w-3 h-3 text-red-400" />
                        ) : (
                          <ClipboardPaste className="w-3 h-3 text-[#E8A33D]" />
                        )}
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
                      placeholder="Ask Atbriz Ai anything... (Paste supported)"
                      rows={1}
                      className="flex-1 bg-[#0F0A1A] border-2 border-[#241B35] rounded-xl px-3 py-2 text-white text-sm placeholder-[#8A8278] focus:outline-none focus:border-[#E8A33D] resize-none transition-all shadow-inner overflow-hidden"
                      style={{ minHeight: '38px', maxHeight: '100px' }}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                        "bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9]",
                        "text-white shadow-lg shadow-[#8B5CF6]/30",
                        "hover:scale-105 active:scale-95",
                        "border-2 border-white/20",
                        (!input.trim() || isLoading) && "opacity-50 cursor-not-allowed hover:scale-100"
                      )}
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center gap-2">
                      <p className="text-[8px] text-[#8A8278]">
                        <kbd className="px-1 py-0.5 bg-[#0F0A1A] rounded border border-[#241B35] text-[8px]">Shift</kbd> + <kbd className="px-1 py-0.5 bg-[#0F0A1A] rounded border border-[#241B35] text-[8px]">Enter</kbd> new line
                      </p>
                      <span className="text-[8px] text-[#8A8278]">•</span>
                      <p className="text-[8px] text-[#8A8278]">
                        <kbd className="px-1 py-0.5 bg-[#0F0A1A] rounded border border-[#241B35] text-[8px]">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-[#0F0A1A] rounded border border-[#241B35] text-[8px]">V</kbd> to paste
                      </p>
                    </div>
                    <p className="text-[8px] text-[#8A8278]">
                      <kbd className="px-1 py-0.5 bg-[#0F0A1A] rounded border border-[#241B35] text-[8px]">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-[#0F0A1A] rounded border border-[#241B35] text-[8px]">N</kbd> new chat
                    </p>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}