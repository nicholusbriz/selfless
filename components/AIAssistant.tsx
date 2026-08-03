'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Minimize2, Maximize2, Bot, User, Brain, Zap, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIAssistant() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `🚀 Welcome to **Atbriz Ai** - Your intelligent learning companion!\n\nI can help you with:\n\n• 📚 Academic guidance and assignment help\n• 🎯 Personalized learning based on your progress\n• 💡 Site navigation and platform features\n• 🔧 Coding help and debugging\n• 📖 General knowledge and research\n• 🏢 Selfless CE organization information\n• 👨‍💻 Developer and platform information\n\nI'm designed to learn from your interactions and provide increasingly personalized assistance. Feel free to ask me about the platform, your studies, or even who created me!\n\nLet's start learning together!`,
      timestamp: new Date()
    }
  ]);

  // Update greeting when session changes
  useEffect(() => {
    const hour = new Date().getHours();
    const userName = session?.user?.firstName || 'there';
    
    let timeGreeting;
    if (hour >= 5 && hour < 12) timeGreeting = 'Good morning';
    else if (hour >= 12 && hour < 17) timeGreeting = 'Good afternoon';
    else timeGreeting = 'Good evening';
    
    const greeting = `${timeGreeting}, ${userName}!`;
    
    setMessages(prev => [{
      ...prev[0],
      content: `🚀 ${greeting} Welcome to **Atbriz Ai** - Your intelligent learning companion!\n\nI can help you with:\n\n• 📚 Academic guidance and assignment help\n• 🎯 Personalized learning based on your progress\n• 💡 Site navigation and platform features\n• 🔧 Coding help and debugging\n• 📖 General knowledge and research\n• 🏢 Selfless CE organization information\n• 👨‍💻 Developer and platform information\n\nI'm designed to learn from your interactions and provide increasingly personalized assistance. Feel free to ask me about the platform, your studies, or even who created me!\n\nLet's start learning together!`
    }]);
  }, [session]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

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
          conversationHistory: messages.slice(-10), // Send last 10 messages for context
          userId: session?.user?.id // Send user ID for personalization
        })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
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

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "w-auto h-16 rounded-2xl",
          "bg-gradient-to-br from-[#E8A33D] via-[#FB7185] to-[#14B8A6]",
          "shadow-2xl shadow-[#E8A33D]/40",
          "flex items-center gap-3 px-4",
          "text-white",
          "transition-all duration-300",
          "border-2 border-white/20",
          isOpen && "hidden"
        )}
      >
        <div className="relative">
          <img src="/atbriz.png" alt="Atbriz Ai" className="w-10 h-10 rounded-xl object-cover" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-4 h-4 text-[#E8A33D]" />
          </motion.div>
        </div>
        <span className="font-bold text-sm whitespace-nowrap">Atbriz Ai</span>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              "fixed bottom-6 right-6 z-50",
              "w-[420px] max-w-[calc(100vw-3rem)]",
              "bg-[#0F0A1A] rounded-3xl",
              "shadow-2xl shadow-black/50",
              "border border-[#1A1228]",
              "overflow-hidden",
              isMinimized ? "h-20" : "h-[650px] max-h-[calc(100vh-6rem)]"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#1A1228] bg-gradient-to-r from-[#1A1228] via-[#241B35] to-[#1A1228]">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#E8A33D] via-[#FB7185] to-[#14B8A6] rounded-full blur-xl opacity-60 animate-pulse" />
                  <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E8A33D] via-[#FB7185] to-[#14B8A6] flex items-center justify-center shadow-xl overflow-hidden">
                    <img src="/atbriz.png" alt="Atbriz Ai" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold text-lg">Atbriz Ai</h3>
                    <Zap className="w-4 h-4 text-[#E8A33D]" />
                  </div>
                  <p className="text-[#8A8278] text-xs">Intelligent Learning Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 rounded-xl text-[#8A8278] hover:text-white hover:bg-[#1A1228] transition-all hover:scale-110"
                >
                  {isMinimized ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-[#8A8278] hover:text-white hover:bg-[#1A1228] transition-all hover:scale-110"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-5 space-y-4 h-[calc(100%-160px)] bg-gradient-to-b from-[#0F0A1A] to-[#1A1228]/50">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex gap-3",
                        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                      )}
                    >
                      <div className={cn(
                        "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden",
                        message.role === 'user' 
                          ? 'bg-gradient-to-br from-[#14B8A6] to-[#0D9488]' 
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
                            <User className="w-5 h-5 text-white" />
                          )
                        ) : (
                          <img src="/atbriz.png" alt="Atbriz Ai" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className={cn(
                        "flex-1 max-w-[80%]",
                        message.role === 'user' ? 'text-right' : 'text-left'
                      )}>
                        <div className={cn(
                          "inline-block p-4 rounded-2xl text-sm shadow-lg relative group",
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white rounded-tr-sm'
                            : 'bg-[#1A1228] text-[#F8F5F0] rounded-tl-sm border border-[#241B35]'
                        )}>
                          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                          {message.role === 'assistant' && (
                            <button
                              onClick={() => handleCopy(message.content, message.id)}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-[#241B35] hover:bg-[#E8A33D] text-[#8A8278] hover:text-white"
                              title="Copy response"
                            >
                              {copiedMessageId === message.id ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[10px] text-[#8A8278] font-medium">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {message.role === 'assistant' && copiedMessageId === message.id && (
                            <span className="text-[10px] text-[#14B8A6] font-medium">Copied!</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#E8A33D] via-[#FB7185] to-[#14B8A6] flex items-center justify-center shadow-lg overflow-hidden">
                        <img src="/atbriz.png" alt="Atbriz Ai" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="inline-block p-4 rounded-2xl rounded-tl-sm bg-[#1A1228] border border-[#241B35] shadow-lg">
                          <div className="flex gap-2 items-center">
                            <div className="w-2 h-2 bg-[#E8A33D] rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-[#FB7185] rounded-full animate-bounce delay-100" />
                            <div className="w-2 h-2 bg-[#14B8A6] rounded-full animate-bounce delay-200" />
                            <span className="text-[#8A8278] text-xs ml-2">Atbriz Ai is thinking...</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-5 border-t border-[#1A1228] bg-gradient-to-r from-[#1A1228] via-[#241B35] to-[#1A1228]">
                  <div className="flex gap-3">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Ask Atbriz Ai anything..."
                      rows={1}
                      className="flex-1 bg-[#0F0A1A] border-2 border-[#241B35] rounded-2xl px-5 py-4 text-white text-sm placeholder-[#8A8278] focus:outline-none focus:border-[#E8A33D] resize-none transition-all shadow-inner"
                      style={{ minHeight: '52px', maxHeight: '130px' }}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                        "bg-gradient-to-br from-[#E8A33D] via-[#FB7185] to-[#14B8A6]",
                        "text-white shadow-xl shadow-[#E8A33D]/30",
                        "hover:scale-105 active:scale-95",
                        "border-2 border-white/20",
                        (!input.trim() || isLoading) && "opacity-50 cursor-not-allowed hover:scale-100"
                      )}
                    >
                      <Send className="w-5 h-5" />
                    </button>
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