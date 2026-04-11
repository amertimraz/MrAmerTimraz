import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiApi } from '../../api/ai';
import { useAuthStore } from '../../store/authStore';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

interface FloatingAiChatProps {
  context?: string;
  initialMessage?: string;
}

export default function FloatingAiChat({ context = 'مساعد منصة أ. عامر تمراز', initialMessage }: FloatingAiChatProps) {
  const { isDark } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const generateId = () => Math.random().toString(36).substring(2, 15);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Create conversation history for context
      const conversationHistory = messages
        .slice(-5) // Last 5 messages for context
        .map(m => `${m.role === 'user' ? 'المستخدم' : 'المساعد'}: ${m.content}`)
        .join('\n');

      const fullPrompt = `${context}

المحادثة السابقة:
${conversationHistory}

السؤال الجديد: ${userMessage.content}

أجب بشكل مفيد وواضح باللغة العربية:`;

      const response = await aiApi.describe(fullPrompt, 'محادثة مباشرة');
      
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: response.description,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: 'عذراً، حدث خطأ في الاتصال. حاول مرة أخرى.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startChat = () => {
    setIsOpen(true);
    if (!hasStarted && initialMessage) {
      setHasStarted(true);
      setMessages([
        {
          id: generateId(),
          role: 'assistant',
          content: initialMessage,
          timestamp: new Date(),
        },
      ]);
    }
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  const clearChat = () => {
    setMessages([]);
    setHasStarted(false);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={startChat}
            className={`fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg font-medium transition-all ${
              isDark
                ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-green-900/30'
                : 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/30'
            }`}
          >
            <MessageSquare size={20} />
            <span>تحدث مع AI</span>
            <Sparkles size={16} className="animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`fixed bottom-6 left-6 z-50 w-[400px] max-w-[90vw] rounded-2xl shadow-2xl overflow-hidden ${
              isDark
                ? 'bg-[#1a1f2e] border border-white/10'
                : 'bg-white border border-gray-200'
            }`}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between px-4 py-3 ${
                isDark ? 'bg-gradient-to-r from-green-600/20 to-green-500/20' : 'bg-gradient-to-r from-green-50 to-green-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
                <div>
                  <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>مساعد AI</h3>
                  <p className={`text-xs ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    {isLoading ? 'يكتب...' : 'متصل'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
                    }`}
                    title="مسح المحادثة"
                  >
                    <span className="text-xs">مسح</span>
                  </button>
                )}
                <button
                  onClick={closeChat}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
                  }`}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              className={`h-[350px] overflow-y-auto p-4 space-y-4 ${
                isDark ? 'bg-[#1a1f2e]' : 'bg-gray-50'
              }`}
            >
              {messages.length === 0 ? (
                <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  <Bot size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-sm">كيف يمكنني مساعدتك اليوم؟</p>
                  <p className="text-xs mt-2 opacity-70">اسألني عن الكورسات، الدروس، أو أي استفسار تعليمي</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        msg.role === 'user'
                          ? isDark
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-blue-100 text-blue-600'
                          : isDark
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-green-100 text-green-600'
                      }`}
                    >
                      {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? isDark
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-blue-500 text-white rounded-tr-none'
                          : isDark
                          ? 'bg-[#2a2f3e] text-gray-100 rounded-tl-none border border-white/5'
                          : 'bg-white text-gray-800 rounded-tl-none shadow-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))
              )}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
                    }`}
                  >
                    <Bot size={16} />
                  </div>
                  <div
                    className={`rounded-2xl rounded-tl-none px-4 py-3 ${
                      isDark ? 'bg-[#2a2f3e] border border-white/5' : 'bg-white shadow-sm'
                    }`}
                  >
                    <Loader2 size={16} className="animate-spin text-green-500" />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              className={`p-3 border-t ${
                isDark ? 'border-white/10 bg-[#1a1f2e]' : 'border-gray-200 bg-white'
              }`}
            >
              <div
                className={`flex items-center gap-2 rounded-xl px-3 py-2 ${
                  isDark ? 'bg-[#2a2f3e] border border-white/10' : 'bg-gray-100'
                }`}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="اكتب رسالتك..."
                  className={`flex-1 bg-transparent text-sm outline-none ${
                    isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
                  }`}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className={`p-2 rounded-lg transition-colors ${
                    input.trim() && !isLoading
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : isDark
                      ? 'text-gray-500 cursor-not-allowed'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
