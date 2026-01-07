import React, { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../services/api';
import { Sparkles, Send, User, Bot, Loader2 } from 'lucide-react';

const AIBrainstorm = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hi! I'm Pathfinder AI. Ask me about essays, university fit, or visa requirements!" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Send conversation history context (or just last message depending on backend)
            // Here sending full history for context if backend supports it, or just a wrapper
            const res = await aiAPI.brainstorm({ messages: [...messages, userMsg] });

            const aiMsg = res.data; // Expecting { role: 'assistant', content: '...' }
            setMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            // Only log unexpected errors (ignore 429 rate limits to keep console clean)
            if (error.response?.status !== 429) {
                console.error("AI Error:", error);
            }
            const errorMsg = error.response?.data?.content || "Sorry, I'm having trouble connecting to the AI. Please try again later.";
            setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
        }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-100px)] flex flex-col">
            <div className="text-center mb-6 shrink-0">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-[#e4e6eb] flex items-center justify-center gap-2">
                    <Sparkles className="text-indigo-600 dark:text-indigo-400" /> AI Assistant
                </h1>
                <p className="text-slate-500 dark:text-[#b0b3b8] text-sm">Your personal guide for the application journey</p>
            </div>

            <div className="flex-grow bg-white dark:bg-[#242526] rounded-2xl border border-slate-200 dark:border-[#3e4042] shadow-sm overflow-hidden flex flex-col transition-colors duration-300">
                {/* Chat Area */}
                <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-[#18191a]">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-green-600 text-white'
                                }`}>
                                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                            </div>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                : 'bg-white dark:bg-[#242526] border border-slate-200 dark:border-[#3e4042] text-slate-700 dark:text-[#e4e6eb] rounded-tl-none shadow-sm'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center shrink-0">
                                <Bot size={16} />
                            </div>
                            <div className="bg-white dark:bg-[#242526] border border-slate-200 dark:border-[#3e4042] px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center">
                                <Loader2 size={16} className="animate-spin text-slate-400" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} className="p-4 bg-white dark:bg-[#242526] border-t border-slate-200 dark:border-[#3e4042] flex gap-2 transition-colors">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your question..."
                        className="flex-grow rounded-xl border-slate-300 dark:border-[#3e4042] bg-white dark:bg-[#3a3b3c] text-slate-900 dark:text-[#e4e6eb] focus:ring-2 focus:ring-indigo-500 focus:border-transparent px-4 py-3 outline-none"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AIBrainstorm;
