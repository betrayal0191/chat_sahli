import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Trash2, RotateCcw, MessageSquare, Zap, Brain } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi there! I'm your intelligent AI assistant, ready to help with anything you need. What's on your mind?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [inputValue]);

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || inputValue.trim();
    if (!content || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    if (!messageContent) {
      setInputValue('');
    }
    setIsLoading(true);

    try {
      const response = await fetch('https://api.opuskeys.com/api/sahli_select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          timestamp: userMessage.timestamp.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.output || 'I received your message, but I\'m not sure how to respond.',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      const errorAiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I\'m experiencing connectivity issues. Please try again in a moment.',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorAiMessage]);
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  const resendMessage = (message: Message) => {
    if (message.isUser && !isLoading) {
      sendMessage(message.content);
    }
  };

  const deleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now().toString(),
      content: "Chat cleared! How can I assist you?",
      isUser: false,
      timestamp: new Date(),
    }]);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.08),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.08),transparent_50%)]" />

      <div className="relative flex flex-col h-full">
        <header className="flex-shrink-0 border-b border-slate-700/50 backdrop-blur-xl bg-slate-900/80">
          <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-md opacity-75 animate-pulse" />
                <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Neural Chat</h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <p className="text-xs text-slate-400">Online & Ready</p>
                </div>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all duration-200 text-sm font-medium border border-slate-700"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-8 scroll-smooth">
          <div className="max-w-5xl mx-auto space-y-6">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.isUser ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-3 duration-500`}
                style={{ animationDelay: `${index * 50}ms` }}
                onMouseEnter={() => setHoveredMessageId(message.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
              >
                {!message.isUser && (
                  <div className="flex-shrink-0 mt-1">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur opacity-50" />
                      <div className="relative w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                )}

                <div className={`flex flex-col ${message.isUser ? 'items-end' : 'items-start'} max-w-[70%] relative`}>
                  <div
                    className={`relative px-5 py-3.5 rounded-2xl shadow-lg transition-all duration-200 ${
                      message.isUser
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                        : 'bg-slate-800/90 backdrop-blur-sm text-slate-100 border border-slate-700/50'
                    }`}
                  >
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                  </div>

                  <div className="flex items-center gap-2 mt-2 px-1">
                    <span className="text-xs text-slate-500">{formatTime(message.timestamp)}</span>

                    {hoveredMessageId === message.id && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {message.isUser && (
                          <button
                            onClick={() => resendMessage(message)}
                            disabled={isLoading}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-all duration-200 disabled:opacity-50"
                            title="Resend"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteMessage(message.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all duration-200"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {message.isUser && (
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-600 rounded-xl flex items-center justify-center shadow-lg">
                      <MessageSquare className="w-5 h-5 text-slate-300" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4 justify-start animate-in fade-in slide-in-from-bottom-3 duration-500">
                <div className="flex-shrink-0 mt-1">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur opacity-50 animate-pulse" />
                    <div className="relative w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
                <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-slate-400">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="flex-shrink-0 border-t border-slate-700/50 backdrop-blur-xl bg-slate-900/80 px-6 py-6">
          <div className="max-w-5xl mx-auto">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
              <div className="relative flex items-end gap-3 bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-3xl p-2 focus-within:border-emerald-500/50 transition-all duration-300">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  rows={1}
                  className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 px-4 py-3 focus:outline-none resize-none max-h-[150px] disabled:opacity-50 text-[15px]"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  className="flex-shrink-0 w-11 h-11 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl flex items-center justify-center hover:shadow-lg hover:shadow-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 mt-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Press Enter to send</span>
              </div>
              <div className="w-1 h-1 bg-slate-700 rounded-full" />
              <div className="text-xs text-slate-500">Shift + Enter for new line</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
