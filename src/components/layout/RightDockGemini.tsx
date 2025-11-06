import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  ChevronDown,
  Sparkles,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { geminiClient } from '@/lib/geminiClient';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

const quickPrompts = [
  { label: 'Explain this finding', prompt: 'Can you explain this genetic finding in simple terms?' },
  { label: 'What should I do?', prompt: 'What are the recommended next steps for this result?' },
  { label: 'Is this serious?', prompt: 'How significant is this genetic marker for my health?' },
  { label: 'Talk to my doctor', prompt: 'What should I discuss with my doctor about this result?' },
];

export const RightDockGemini: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [showQuickPrompts, setShowQuickPrompts] = useState(false);

  const location = useLocation();
  const { showToast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    chatHistory,
    addChatMessage,
    settings,
    geneticMarkers,
    recommendations,
  } = useAppStore();

  const hasApiKey = settings.geminiApiKey || geminiClient.hasApiKey();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, currentResponse]);

  // Load API key on mount
  useEffect(() => {
    if (settings.geminiApiKey) {
      geminiClient.setApiKey(settings.geminiApiKey, settings.persistApiKey);
    } else {
      geminiClient.loadApiKey();
    }
  }, [settings.geminiApiKey, settings.persistApiKey]);

  const handleSend = async (messageText?: string) => {
    console.log('🎯 handleSend called with:', messageText || input);
    
    const text = messageText || input.trim();
    if (!text) {
      console.log('❌ Empty text, aborting');
      return;
    }

    console.log('✅ Sending message:', text);

    // Clear input immediately
    setInput('');
    setShowQuickPrompts(false);
    setCurrentResponse('');

    // Add user message to chat
    console.log('💬 Adding user message to chat');
    addChatMessage({
      role: 'user',
      content: text,
    });

    // Check if we have API key
    const currentApiKey = settings.geminiApiKey || geminiClient.loadApiKey();
    
    if (!currentApiKey) {
      // Mock mode
      console.log('🎭 No API key - using mock mode');
      
      setTimeout(() => {
        addChatMessage({
          role: 'assistant',
          content: "I'm in demo mode. Please add your Gemini API key in Settings to unlock real AI features. This is a simulated response.",
        });
      }, 500);
      return;
    }

    // Ensure API key is set
    console.log('🔑 Setting API key for this request');
    geminiClient.setApiKey(currentApiKey, false);

    setIsGenerating(true);

    try {
      // Build context from current page
      const context: any = {
        page: location.pathname,
        markers: geneticMarkers.slice(0, 5),
        recommendations: recommendations.slice(0, 3),
      };

      console.log('🚀 Calling Gemini API...');
      console.log('📝 Model: gemini-2.0-flash-exp');
      console.log('💬 Prompt:', text);
      console.log('📊 Context:', context);

      let fullResponse = '';
      let tokenCount = 0;

      await geminiClient.generate(text, {
        stream: true,
        context,
        onToken: (token) => {
          tokenCount++;
          console.log(`📥 Token #${tokenCount}:`, token);
          fullResponse += token;
          setCurrentResponse(fullResponse);
        },
        onComplete: (finalText) => {
          console.log('✅ Stream complete!');
          console.log('📄 Full response:', finalText);
          console.log('📊 Total tokens:', tokenCount);
          
          addChatMessage({
            role: 'assistant',
            content: finalText || fullResponse,
          });
          setCurrentResponse('');
          setIsGenerating(false);
        },
        onError: (error) => {
          console.error('❌ Gemini Stream Error:', error);
          showToast(`AI Error: ${error.message}`, 'error');
          addChatMessage({
            role: 'assistant',
            content: `❌ Error: ${error.message}. Please check your API key in Settings.`,
          });
          setIsGenerating(false);
          setCurrentResponse('');
        },
      });
    } catch (error: any) {
      console.error('❌ Generate Error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      
      showToast(`Failed: ${error.message}`, 'error');
      addChatMessage({
        role: 'assistant',
        content: `❌ Error: ${error.message}. Please verify your API key is valid and you have internet connectivity.`,
      });
      setIsGenerating(false);
      setCurrentResponse('');
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    console.log('🎯 Quick prompt selected:', prompt);
    setInput('');
    setShowQuickPrompts(false);
    // Use setTimeout to ensure state updates don't interfere
    setTimeout(() => {
      handleSend(prompt);
    }, 10);
  };

  const getPageContext = () => {
    const pathMap: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/upload': 'Upload Genetics',
      '/manual': 'Manual Entry',
      '/recommendations': 'Recommendations',
      '/lifestyle': 'Lifestyle Planner',
      '/settings': 'Settings',
    };
    return pathMap[location.pathname] || 'SERA AI';
  };

  return (
    <>
      {/* Floating Button - Optimized */}
      <AnimatePresence mode="wait">
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-primary via-secondary to-accent text-white p-5 rounded-full shadow-glow hover:shadow-glow-secondary transition-all duration-200 will-change-transform"
            style={{
              boxShadow: '0 0 30px rgba(74, 144, 226, 0.6), 0 0 60px rgba(108, 99, 255, 0.4)',
            }}
            aria-label="Open AI Assistant"
          >
            <Sparkles className="w-7 h-7 animate-pulse" />
            {!hasApiKey && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-warning rounded-full animate-ping border-2 border-white" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Dock Panel - Optimized */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed right-0 top-0 h-full z-50 flex flex-col bg-surface/95 backdrop-blur-xl shadow-elevated border-l border-white/30 will-change-transform"
            style={{ width: isExpanded ? '420px' : '370px' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/20 bg-gradient-to-r from-primary to-secondary text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">AI Assistant</h3>
                  <p className="text-xs opacity-90">{getPageContext()}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 rounded hover:bg-white/10 transition-colors"
                  aria-label={isExpanded ? 'Collapse' : 'Expand'}
                >
                  <ChevronDown
                    className={cn('w-4 h-4 transition-transform', !isExpanded && 'rotate-180')}
                  />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* API Key Warning */}
            {!hasApiKey && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-gradient-to-r from-warning/10 to-warning/5 border-b border-warning/30 flex items-start gap-2"
              >
                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5 animate-pulse" />
                <div className="text-xs text-text">
                  <p className="font-bold">🎭 Demo Mode Active</p>
                  <p className="mt-1 text-text-secondary">Add your Gemini API key in Settings for real AI responses.</p>
                </div>
              </motion.div>
            )}

            {/* Messages - Enhanced styling */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-behavior-contain bg-gradient-to-b from-bg/30 to-transparent">
              {chatHistory.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center text-gray-500 mt-8"
                >
                  <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30 animate-pulse" />
                  <p className="text-sm font-medium">Ask me anything about your genetic results!</p>
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold text-primary">Quick Prompts:</p>
                    {quickPrompts.map((qp, idx) => (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        onClick={() => handleQuickPrompt(qp.prompt)}
                        className="block w-full text-left px-4 py-2.5 text-xs font-medium bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 rounded-xl transition-all transform hover:scale-105 border border-primary/20"
                      >
                        {qp.label}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {chatHistory.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={cn(
                    'flex',
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-xl px-4 py-3 text-sm shadow-md',
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-primary to-primary-light text-white'
                        : 'bg-white/90 text-text border border-primary/20'
                    )}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {/* Streaming Response */}
              {currentResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[85%] rounded-xl px-4 py-3 text-sm bg-white/90 text-text border border-primary/20 shadow-md">
                    {currentResponse}
                    <span className="inline-block w-0.5 h-4 ml-1 bg-primary animate-pulse" />
                  </div>
                </motion.div>
              )}

              {/* Loading */}
              {isGenerating && !currentResponse && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex items-center gap-2 px-4 py-3 bg-white/90 rounded-xl shadow-md border border-primary/20">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="text-sm font-medium text-primary">Gemini is thinking...</span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Dropdown */}
            {showQuickPrompts && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-white/20 p-3 bg-gradient-to-b from-primary/5 to-secondary/5 overflow-hidden"
              >
                <p className="text-xs font-semibold text-primary mb-2 px-2">✨ Quick Prompts:</p>
                <div className="space-y-2">
                  {quickPrompts.map((qp, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleQuickPrompt(qp.prompt);
                      }}
                      type="button"
                      className="w-full text-left px-4 py-2.5 text-xs font-medium bg-white hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10 rounded-xl transition-all transform hover:scale-105 border border-primary/20 shadow-sm"
                    >
                      {qp.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Input - Fixed to prevent window closing */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                return false;
              }}
              className="border-t border-white/20 p-4 bg-surface/50 backdrop-blur-sm"
            >
              <div className="flex gap-2 items-end">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowQuickPrompts(!showQuickPrompts);
                  }}
                  className="p-3 text-primary hover:text-secondary hover:bg-primary/10 rounded-xl transition-all transform hover:scale-110"
                  aria-label="Quick prompts"
                  type="button"
                >
                  <ChevronDown
                    className={cn(
                      'w-5 h-5 transition-transform',
                      showQuickPrompts && 'rotate-180'
                    )}
                  />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        e.stopPropagation();
                        if (input.trim() && !isGenerating) {
                          handleSend();
                        }
                        return false;
                      }
                    }}
                    placeholder="Ask about your genetics..."
                    className="w-full px-4 py-3 pr-12 border-2 border-primary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-white shadow-sm transition-all"
                    disabled={isGenerating}
                    autoComplete="off"
                  />
                  {input.trim() && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary font-bold bg-primary/10 px-2 py-1 rounded-md"
                    >
                      Press ↵
                    </motion.div>
                  )}
                </div>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (input.trim() && !isGenerating) {
                      handleSend();
                    }
                    return false;
                  }}
                  disabled={!input.trim() || isGenerating}
                  size="sm"
                  className="px-4 py-3 gap-2"
                  type="button"
                >
                  <Send className="w-4 h-4" />
                  Send
                </Button>
              </div>
              {!hasApiKey && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-warning mt-2 flex items-center gap-1 font-medium"
                >
                  <AlertCircle className="w-3 h-3 animate-pulse" />
                  Using demo mode. Add API key in Settings for real AI.
                </motion.p>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

