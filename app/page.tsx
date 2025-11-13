'use client';

import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string, sources?: string[]}>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        sources: data.sources
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again.'
      }]);
    }

    setLoading(false);
  };

  const quickQuestions = [
    { emoji: '🏆', text: 'Latest F1 News', query: 'Tell me about the latest Formula 1 news' },
    { emoji: '👥', text: 'Current Drivers', query: 'Who are the current F1 drivers?' },
    { emoji: '🏁', text: 'Teams', query: 'Tell me about the F1 teams' },
    { emoji: '📊', text: 'Scoring System', query: 'How does F1 scoring work?' },
    { emoji: '⚙️', text: 'Technical Rules', query: 'What are the F1 technical regulations?' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-950 flex flex-col relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/40 backdrop-blur-xl border-b border-red-900/50 shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-red-600 blur-xl opacity-50 animate-pulse"></div>
                <div className="relative text-5xl">🏎️</div>
              </div>
              <div>
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-gradient">
                  Formula 1 AI Assistant
                </h1>
                <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Powered by Vector AI • Real-time F1 Insights
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-600/20 rounded-full border border-red-500/30">
              <span className="text-red-400 text-sm font-semibold">LIVE</span>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 relative z-10 max-w-6xl mx-auto w-full p-4 flex flex-col">
        {/* Messages Container */}
        <div className="flex-1 bg-black/30 backdrop-blur-xl rounded-3xl border border-red-900/30 shadow-2xl p-6 mb-4 overflow-y-auto custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              {/* Welcome Screen */}
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-red-600 blur-3xl opacity-30 animate-pulse"></div>
                <div className="relative text-8xl mb-4 animate-bounce">🏁</div>
              </div>
              
              <h2 className="text-4xl font-bold text-white mb-4">
                Welcome to the <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Pit Lane!</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-2xl">
                Your AI-powered Formula 1 expert is ready to answer any questions about drivers, teams, rules, and the latest racing news.
              </p>

              {/* Quick Questions */}
              <div className="w-full max-w-3xl">
                <p className="text-gray-500 text-sm mb-4 font-semibold">QUICK QUESTIONS</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(q.query)}
                      className="group relative overflow-hidden bg-gradient-to-br from-red-900/30 to-orange-900/30 hover:from-red-800/40 hover:to-orange-800/40 border border-red-800/50 hover:border-red-600/80 rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-red-600/20"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/10 to-red-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                      <div className="relative flex items-center gap-3">
                        <span className="text-3xl">{q.emoji}</span>
                        <span className="text-white font-semibold text-left">{q.text}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                >
                  <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                    {/* Message bubble */}
                    <div
                      className={`relative group ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-red-600 to-red-700 text-white rounded-3xl rounded-tr-md shadow-lg shadow-red-600/30'
                          : 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 text-white rounded-3xl rounded-tl-md border border-red-900/30 shadow-xl'
                      } p-5 backdrop-blur-sm`}
                    >
                      <div className="prose prose-invert max-w-none">
                        <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                      </div>
                      
                      {/* Sources */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                            <span>📚</span>
                            <span className="font-semibold">Sources:</span>
                          </div>
                          <div className="space-y-1">
                            {message.sources.map((source, idx) => (
                              <div key={idx} className="text-xs text-red-400 hover:text-red-300 transition-colors">
                                {source.startsWith('http') ? (
                                  <a href={source} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                                    <span>🔗</span>
                                    <span>{source}</span>
                                  </a>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <span>✨</span>
                                    <span>{source}</span>
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Avatar */}
                    <div className={`flex items-center gap-2 mt-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-2xl">{message.role === 'user' ? '👤' : '🤖'}</span>
                      <span className="text-xs text-gray-500">
                        {message.role === 'user' ? 'You' : 'F1 AI'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Loading indicator */}
              {loading && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 text-white rounded-3xl rounded-tl-md border border-red-900/30 p-5 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-sm text-gray-400">Analyzing F1 data...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-orange-600/20 to-red-600/20 blur-xl"></div>
          <div className="relative flex gap-3 bg-black/50 backdrop-blur-xl rounded-2xl border border-red-900/50 p-3 shadow-2xl">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
              placeholder="Ask about Formula 1... 🏎️"
              className="flex-1 p-4 rounded-xl bg-slate-900/50 border border-red-900/30 text-white placeholder-gray-500 focus:outline-none focus:border-red-600/60 focus:ring-2 focus:ring-red-600/20 transition-all"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="group relative px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:from-gray-700 disabled:to-gray-800 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-600/50 disabled:scale-100 disabled:shadow-none overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <span className="relative flex items-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Thinking...</span>
                  </>
                ) : (
                  <>
                    <span>Send</span>
                    <span className="text-xl">🚀</span>
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-black/40 backdrop-blur-xl border-t border-red-900/50 py-4 mt-4">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            Built with <span className="text-red-500">❤️</span> using Next.js, TypeScript, AstraDB & Vector AI
          </p>
          <p className="text-gray-600 text-xs mt-1">
            © 2025 Formula 1 AI Assistant • Racing into the future of AI
          </p>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #dc2626, #ea580c);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #ef4444, #f97316);
        }
        
        .prose h1, .prose h2, .prose h3 {
          color: white;
          font-weight: bold;
        }
        
        .prose strong {
          color: #fca5a5;
        }
        
        .prose p {
          margin: 0.5em 0;
        }
      `}</style>
    </div>
  );
}
