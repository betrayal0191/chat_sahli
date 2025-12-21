import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, AlertCircle, Loader2, RotateCcw, Trash2, Edit2, Check, X, Sparkles, Settings } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI assistant. What can I help you with today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    setError(null);

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
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to AI service';
      setError(errorMessage);

      const errorAiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I\'m having trouble connecting right now. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorAiMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
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

  const startEditing = (message: Message) => {
    setEditingId(message.id);
    setEditingContent(message.content);
  };

  const saveEdit = (messageId: string) => {
    if (!editingContent.trim()) return;
    setMessages(prev => prev.map(msg =>
      msg.id === messageId
        ? { ...msg, content: editingContent.trim() }
        : msg
    ));
    setEditingId(null);
    setEditingContent('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingContent('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <div className="bg-slate-900 border-b border-slate-700 px-6 py-5 shadow-xl">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Chat Assistant</h1>
              <p className="text-sm text-slate-400 mt-0.5">Powered by AI</p>
            </div>
          </div>
          <button className="w-10 h-10 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg flex items-center justify-center transition-colors duration-200">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-gradient-to-r from-red-950 to-red-900 border-b border-red-700 px-6 py-4 animate-in slide-in-from-top duration-300">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0" />
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${message.isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              onMouseEnter={() => setHoveredMessageId(message.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
            >
              {!message.isUser && (
                <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}

              <div className={`max-w-xl ${message.isUser ? 'order-1' : 'order-2'} relative group`}>
                {editingId === message.id ? (
                  <div className="flex gap-2 items-end">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="flex-1 px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm"
                      autoFocus
                    />
                    <button
                      onClick={() => saveEdit(message.id)}
                      className="w-9 h-9 bg-green-600 hover:bg-green-500 text-white rounded-lg flex items-center justify-center transition-colors duration-200 flex-shrink-0 shadow-lg"
                      title="Save edit"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="w-9 h-9 bg-slate-600 hover:bg-slate-500 text-slate-200 rounded-lg flex items-center justify-center transition-colors duration-200 flex-shrink-0"
                      title="Cancel edit"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div
                      className={`px-5 py-4 rounded-xl shadow-lg border transition-all duration-200 ${
                        message.isUser
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400 rounded-br-sm'
                          : 'bg-slate-700 text-slate-100 border-slate-600 rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>

                    <div className={`absolute top-0 flex gap-1 ${
                      message.isUser ? '-left-24 flex-row-reverse' : '-right-24'
                    } opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto`}>
                      {message.isUser && (
                        <>
                          <button
                            onClick={() => startEditing(message)}
                            className="w-8 h-8 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center transition-all duration-200 shadow-lg"
                            title="Edit message"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => resendMessage(message)}
                            disabled={isLoading}
                            className="w-8 h-8 bg-slate-600 hover:bg-slate-500 text-slate-200 rounded-lg flex items-center justify-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            title="Resend message"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => deleteMessage(message.id)}
                        className="w-8 h-8 bg-red-600 hover:bg-red-500 text-white rounded-lg flex items-center justify-center transition-colors duration-200 shadow-lg"
                        title="Delete message"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className={`text-xs text-slate-400 mt-2 ${message.isUser ? 'text-right' : 'text-left'}`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </>
                )}
              </div>

              {message.isUser && (
                <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-slate-700 border border-slate-600 rounded-xl shadow-lg px-5 py-4 max-w-xs">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400 flex-shrink-0" />
                  <span className="text-sm text-slate-200">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-slate-900 border-t border-slate-700 px-6 py-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                disabled={isLoading}
                rows={1}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent disabled:bg-slate-700 disabled:cursor-not-allowed resize-none text-sm"
                style={{ minHeight: '3rem', maxHeight: '6rem' }}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className="w-11 h-11 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl flex items-center justify-center hover:from-cyan-400 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0 shadow-lg"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-3 text-center">
            Press Enter to send • Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
