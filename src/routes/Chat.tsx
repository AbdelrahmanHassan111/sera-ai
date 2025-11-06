import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  Trash2,
  Download,
  Sparkles,
  Bot,
  User,
  Loader2,
  AlertCircle,
  MessageSquare,
  Clock,
  Zap,
  Database,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useAppStore } from '@/store/useAppStore';
import { geminiClient } from '@/lib/geminiClient';
import { cn, downloadJSON, formatDateTime } from '@/lib/utils';

const quickPrompts = [
  { 
    label: '💊 Drug Interactions', 
    prompt: 'Based on my genetic markers, what medications should I be careful with and why? Explain the genetic interactions in detail.',
    category: 'drug'
  },
  { 
    label: '🏃 Lifestyle Tips', 
    prompt: 'What lifestyle changes should I make based on my genetic profile? Include exercise, diet, and habits.',
    category: 'lifestyle'
  },
  { 
    label: '🧬 Explain My Genetics', 
    prompt: 'Explain my top genetic findings in simple terms. What do they mean for my health?',
    category: 'explain'
  },
  { 
    label: '⚕️ Talk to Doctor', 
    prompt: 'What should I discuss with my doctor about my genetic results? What tests or screenings should I ask about?',
    category: 'medical'
  },
  { 
    label: '🎯 Risk Assessment', 
    prompt: 'What are my highest genetic risks and what can I do to mitigate them?',
    category: 'risk'
  },
  { 
    label: '💡 Personalized Plan', 
    prompt: 'Create a comprehensive personalized health plan based on my genetics including supplements, screening schedule, and preventive measures.',
    category: 'plan'
  },
];

export const Chat: React.FC = () => {
  const { showToast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    chatHistory,
    addChatMessage,
    clearChatHistory,
    settings,
    geneticMarkers,
    recommendations,
    userProfile,
  } = useAppStore();

  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
    const text = messageText || input.trim();
    if (!text) return;

    console.log('🎯 Chat: Sending message:', text);
    setInput('');
    setCurrentResponse('');

    // Add user message
    addChatMessage({
      role: 'user',
      content: text,
      context: {
        markersCount: geneticMarkers.length,
        recsCount: recommendations.length,
        profile: userProfile,
      },
    });

    // Check API key
    const currentApiKey = settings.geminiApiKey || geminiClient.loadApiKey();
    
    if (!currentApiKey) {
      setTimeout(() => {
        addChatMessage({
          role: 'assistant',
          content: "I'm in demo mode. Please add your Gemini API key in Settings to unlock real AI features. Visit https://makersuite.google.com/app/apikey to get your free key.",
        });
      }, 500);
      return;
    }

    geminiClient.setApiKey(currentApiKey, false);
    setIsGenerating(true);

    try {
      // Build comprehensive context
      const context: any = {
        userProfile,
        geneticMarkers: geneticMarkers.slice(0, 10),
        recommendations: recommendations.slice(0, 10),
        highPriorityRecs: recommendations.filter(r => r.confidence === 'high').slice(0, 5),
      };

      console.log('🚀 Calling Gemini with comprehensive context');

      let fullResponse = '';

      await geminiClient.generate(text, {
        stream: true,
        context,
        onToken: (token) => {
          fullResponse += token;
          setCurrentResponse(fullResponse);
        },
        onComplete: (finalText) => {
          console.log('✅ Response complete');
          addChatMessage({
            role: 'assistant',
            content: finalText || fullResponse,
          });
          setCurrentResponse('');
          setIsGenerating(false);
        },
        onError: (error) => {
          console.error('❌ Error:', error);
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
      showToast(`Failed: ${error.message}`, 'error');
      addChatMessage({
        role: 'assistant',
        content: `❌ Error: ${error.message}. Please verify your API key.`,
      });
      setIsGenerating(false);
      setCurrentResponse('');
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => {
      handleSend(prompt);
    }, 50);
  };

  const handleClearHistory = () => {
    clearChatHistory();
    showToast('Chat history cleared', 'info');
  };

  const handleExportChat = () => {
    downloadJSON(chatHistory, `sera-ai-chat-${Date.now()}.json`);
    showToast('Chat history exported', 'success');
  };

  const filteredPrompts = selectedCategory === 'all' 
    ? quickPrompts 
    : quickPrompts.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Quick Prompts & Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Header Card */}
            <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-br from-primary to-secondary p-3 rounded-2xl shadow-glow">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">AI Assistant</h2>
                    <p className="text-sm text-text-secondary">Powered by Gemini</p>
                  </div>
                </div>
                
                {!hasApiKey && (
                  <div className="bg-warning/10 border border-warning/30 rounded-xl p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-text">
                        <p className="font-bold">Demo Mode</p>
                        <p className="mt-1">Add API key in Settings for real AI</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 space-y-2 text-sm text-text-secondary">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-primary" />
                    <span>{geneticMarkers.length} genetic markers loaded</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-secondary" />
                    <span>{recommendations.length} recommendations generated</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-accent" />
                    <span>{chatHistory.length} messages in history</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Prompts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-accent" />
                  Quick Prompts
                </CardTitle>
                <CardDescription>Start with these common questions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredPrompts.map((qp, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleQuickPrompt(qp.prompt)}
                      className="w-full text-left px-4 py-3 bg-gradient-to-r from-primary/5 to-secondary/5 hover:from-primary/15 hover:to-secondary/15 rounded-xl transition-all transform hover:scale-105 border border-primary/20 text-sm font-medium"
                    >
                      {qp.label}
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Chat Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={handleExportChat}
                  variant="outline"
                  className="w-full gap-2"
                  disabled={chatHistory.length === 0}
                >
                  <Download className="w-4 h-4" />
                  Export History
                </Button>
                <Button
                  onClick={handleClearHistory}
                  variant="danger"
                  className="w-full gap-2"
                  disabled={chatHistory.length === 0}
                >
                  <Trash2 className="w-4 h-4" />
                  Clear History
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Chat Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <Card className="h-[calc(100vh-180px)] flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-primary" />
                    Genetics AI Chat
                  </CardTitle>
                  <Badge variant="primary">{chatHistory.length} messages</Badge>
                </div>
                <CardDescription>
                  Ask questions about your genetic profile, get personalized recommendations
                </CardDescription>
              </CardHeader>

              {/* Messages Area */}
              <CardContent className="flex-1 overflow-y-auto space-y-4">
                {chatHistory.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="bg-gradient-to-br from-primary to-secondary p-6 rounded-3xl shadow-glow mb-6">
                      <Sparkles className="w-16 h-16 text-white animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Start a Conversation</h3>
                    <p className="text-text-secondary mb-6 max-w-md">
                      Ask me anything about your genetic results, drug interactions, lifestyle recommendations, or health risks.
                    </p>
                    <p className="text-sm text-text-muted">
                      Try one of the quick prompts on the left to get started! →
                    </p>
                  </div>
                )}

                {chatHistory.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                    className={cn(
                      'flex gap-3',
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-secondary to-secondary-light rounded-full flex items-center justify-center shadow-glow-secondary">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}

                    <div
                      className={cn(
                        'max-w-[75%] rounded-2xl px-5 py-4 shadow-md',
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-primary to-primary-light text-white'
                          : 'bg-white/90 text-text border-2 border-primary/20'
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      <p className="text-xs opacity-60 mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDateTime(msg.timestamp)}
                      </p>
                    </div>

                    {msg.role === 'user' && (
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center shadow-glow">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Streaming Response */}
                {currentResponse && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 justify-start"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-secondary to-secondary-light rounded-full flex items-center justify-center shadow-glow-secondary animate-pulse">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="max-w-[75%] rounded-2xl px-5 py-4 bg-white/90 text-text border-2 border-secondary/30 shadow-md">
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {currentResponse}
                        <span className="inline-block w-0.5 h-4 ml-1 bg-secondary animate-pulse" />
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Loading */}
                {isGenerating && !currentResponse && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex gap-3 justify-start"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-secondary to-secondary-light rounded-full flex items-center justify-center shadow-glow-secondary">
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                    <div className="px-5 py-4 bg-white/90 rounded-2xl shadow-md border-2 border-secondary/30">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-secondary" />
                        <span className="text-sm font-medium text-secondary">Gemini is thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </CardContent>

              {/* Input Area */}
              <div className="border-t-2 border-primary/10 p-6 bg-gradient-to-r from-bg/30 to-surface/30 backdrop-blur-sm">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (input.trim() && !isGenerating) {
                      handleSend();
                    }
                    return false;
                  }}
                >
                  <div className="flex gap-3 items-end">
                    <div className="flex-1 relative">
                      <textarea
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
                        placeholder="Ask about your genetics, drug interactions, lifestyle recommendations..."
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-primary/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-white shadow-sm transition-all resize-none"
                        disabled={isGenerating}
                        autoComplete="off"
                      />
                      {input.trim() && !isGenerating && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute right-3 bottom-3 text-xs text-primary font-bold bg-primary/10 px-3 py-1.5 rounded-lg"
                        >
                          Shift+Enter for new line, Enter to send
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
                      size="lg"
                      className="px-6 py-6 gap-2 shadow-glow"
                      type="button"
                    >
                      <Send className="w-5 h-5" />
                      Send
                    </Button>
                  </div>
                </form>

                {!hasApiKey && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-warning mt-3 flex items-center gap-2 font-medium bg-warning/10 px-3 py-2 rounded-lg"
                  >
                    <AlertCircle className="w-4 h-4 animate-pulse" />
                    Demo mode active. Add your Gemini API key in Settings for real AI responses.
                  </motion.p>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

