import React, { useState, useEffect } from 'react';
import { resourceAPI } from '../services/api';
import { Search, Play, BookOpen, FileText, ExternalLink } from 'lucide-react';

const ResourceLibrary = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchResources();
    }, [category]);

    const fetchResources = async () => {
        setLoading(true);
        try {
            const res = await resourceAPI.getAll({ category: category, search: searchQuery });
            if (res.data) {
                setResources(res.data);
            }
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchResources();
    };

    const categories = ['All', 'IELTS', 'TOEFL', 'SAT', 'GRE', 'GMAT', 'Essay', 'Visa'];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Resource Library</h1>
                <p className="text-slate-600">Curated materials to help you ace your tests and applications</p>
            </div>

            {/* Search & Filter */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${category === cat ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSearch} className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Search resources..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                </form>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="text-center py-20 text-slate-400">Loading resources...</div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.map(resource => (
                        <div key={resource._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
                            <div className="h-40 bg-slate-100 relative flex items-center justify-center">
                                {resource.type === 'Video' ? <Play size={48} className="text-red-500 opacity-80 group-hover:scale-110 transition-transform" /> :
                                    resource.type === 'PDF' ? <FileText size={48} className="text-orange-500 opacity-80 group-hover:scale-110 transition-transform" /> :
                                        <BookOpen size={48} className="text-blue-500 opacity-80 group-hover:scale-110 transition-transform" />}
                                <span className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded text-xs font-bold uppercase tracking-wide text-slate-500 shadow-sm">
                                    {resource.category}
                                </span>
                            </div>
                            <div className="p-5">
                                <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2">{resource.title}</h3>
                                <p className="text-slate-600 text-sm mb-4 line-clamp-3">{resource.description}</p>
                                <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline"
                                >
                                    Access Material <ExternalLink size={16} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {/* AI Helper Section */}
            <div className="mt-12 bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-2xl border border-blue-100 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                    <div className="md:w-1/3">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                            <span className="text-2xl">🤖</span> Gemini Study Pal
                        </h2>
                        <p className="text-slate-600 mb-4">
                            Need specific help? Ask Gemini for study plans, topic explanations, or essay ideas.
                        </p>
                    </div>

                    <div className="md:w-2/3 w-full bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <AIHelperChat />
                    </div>
                </div>
            </div>
        </div>
    );
};

const AIHelperChat = () => {
    const [messages, setMessages] = useState([{ role: 'model', text: 'Hi! I can help you find resources or explain reliable study topics. What do you need?' }]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const { useAuth } = require('../context/AuthContext'); // Inline import for context inside component if needed or use parent

    // Simple direct API call for demo (ideally move to services)
    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const newMsgs = [...messages, { role: 'user', text: input }];
        setMessages(newMsgs);
        setInput('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            // Fix: Use correct endpoint /brainstorm and payload structure { messages: [] }
            const response = await fetch('http://localhost:5000/api/ai/brainstorm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    messages: [...newMsgs.map(m => ({ role: m.role === 'model' ? 'assistant' : 'user', content: m.text }))]
                })
            });
            const data = await response.json();
            setMessages([...newMsgs, { role: 'model', text: data.content || "I'm digging for that..." }]);
        } catch (err) {
            setMessages([...newMsgs, { role: 'model', text: "Sorry, I'm having trouble connecting to the brain." }]);
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col h-64">
            <div className="flex-grow overflow-y-auto space-y-3 mb-3 pr-2 custom-scrollbar">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loading && <div className="text-xs text-slate-400 italic">Gemini is typing...</div>}
            </div>
            <form onSubmit={handleSend} className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask about IELTS tips..."
                    className="flex-grow text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                />
                <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                    Send
                </button>
            </form>
        </div>
    );
};

export default ResourceLibrary;
