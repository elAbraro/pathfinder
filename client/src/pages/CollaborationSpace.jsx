import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api, { collaborationAPI, BASE_URL } from '../services/api';
import { Search, Send, FileText, MessageSquare, X, User, Clock, UserPlus, Plus, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const CollaborationSpace = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [attachments, setAttachments] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [consultations, setConsultations] = useState([]); // For meeting links
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        fetchChats();
        fetchConsultations();
        const userId = searchParams.get('userId');
        if (userId) {
            setupActiveChat(userId);
        }
    }, [searchParams]);

    const fetchConsultations = async () => {
        try {
            const res = await api.get('/consultations');
            setConsultations(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (activeChat && activeChat.user?._id) {
            const interval = setInterval(() => fetchMessages(activeChat.user._id), 3000);
            return () => clearInterval(interval);
        }
    }, [activeChat]);

    const fetchChats = async () => {
        try {
            const res = await collaborationAPI.getChats();
            setChats(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const setupActiveChat = async (userId) => {
        try {
            // Delay slightly to ensure chats are loaded if this is called on mount
            const existing = chats.find(c => c.user._id === userId);
            if (existing) {
                setActiveChat(existing);
                fetchMessages(userId);
                return;
            }

            // If not found in existing chats, we need to fetch this specific user's info
            // For now, we'll leverage the search endpoint or students/all if available
            // In a real app, a GET /api/users/:id would be better.
            const res = await api.get('/students/all');
            const targetUser = res.data.find(u => u._id === userId);
            if (targetUser) {
                setActiveChat({ user: targetUser, isNew: true });
                setMessages([]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSearch = async (val) => {
        setSearchQuery(val);
        if (val.length < 2) {
            setSearchResults([]);
            return;
        }
        setSearching(true);
        try {
            const res = await collaborationAPI.searchUsers(val);
            setSearchResults(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setSearching(false);
        }
    };

    const startChat = (targetUser) => {
        // Check if chat already exists
        const existing = chats.find(c => c.user._id === targetUser._id);
        if (existing) {
            setActiveChat(existing);
        } else {
            setActiveChat({ user: targetUser, isNew: true });
            setMessages([]);
        }
        setShowSearch(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    const fetchMessages = async (userId) => {
        try {
            const res = await api.get(`/collaboration/messages/${userId}`);
            setMessages(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && attachments.length === 0) return;

        try {
            await collaborationAPI.sendMessage({
                recipientId: activeChat.user?._id,
                content: newMessage,
                attachments
            });
            setNewMessage('');
            setAttachments([]);
            if (activeChat.isNew) {
                fetchChats(); // Refresh sidebar to show new chat
                setActiveChat({ ...activeChat, isNew: false });
            }
            fetchMessages(activeChat.user?._id);
        } catch (err) {
            console.error('Send message error:', err);
            const msg = err.response?.data?.details || err.response?.data?.message || 'Failed to send message';
            addToast(msg, 'error');
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/upload', formData);

            setAttachments([...attachments, {
                name: file.name,
                url: `${BASE_URL}${res.data.filePath}`,
                type: file.type
            }]);
            addToast('File uploaded successfully', 'success');
        } catch (err) {
            console.error('Upload failed', err);
            const msg = err.response?.data?.message || 'Upload failed. Please try again.';
            addToast(msg, 'error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 h-[calc(100vh-100px)]">
            <div className="bg-white dark:bg-[#242526] rounded-3xl border border-slate-200 dark:border-[#3e4042] shadow-xl overflow-hidden flex h-full transition-colors duration-300">

                {/* Sidebar: Group List / Contacts */}
                <div className="w-80 border-r border-slate-100 dark:border-[#3e4042] flex flex-col bg-slate-50/50 dark:bg-[#18191a]/50">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-extrabold text-slate-800 dark:text-[#e4e6eb] flex items-center gap-2">
                                <MessageSquare className="text-indigo-600 dark:text-indigo-400" size={24} />
                                Discussions
                            </h2>
                            <button
                                onClick={() => setShowSearch(!showSearch)}
                                className={`p-2 rounded-xl transition-all ${showSearch ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-[#3a3b3c] text-slate-400 dark:text-[#b0b3b8] border border-slate-200 dark:border-[#3e4042] hover:bg-slate-50 dark:hover:bg-[#4e4f50]'}`}
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        {showSearch && (
                            <div className="relative animate-in slide-in-from-top-2 duration-200 mb-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder={user?.role === 'student' ? "Find a counselor..." : "Find a student..."}
                                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#3a3b3c] border border-slate-200 dark:border-[#3e4042] rounded-xl text-sm text-slate-900 dark:text-[#e4e6eb] focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                                {searchResults.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#242526] border border-slate-100 dark:border-[#3e4042] rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto p-2 space-y-1">
                                        {searchResults.map(u => (
                                            <button
                                                key={u._id}
                                                onClick={() => startChat(u)}
                                                className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-[#3a3b3c] rounded-xl transition-colors text-left"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs ring-1 ring-white dark:ring-[#3e4042]">
                                                    {u.profile?.firstName?.[0]}{u.profile?.lastName?.[0]}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-800 dark:text-[#e4e6eb]">{u.profile?.firstName} {u.profile?.lastName}</div>
                                                    <div className="text-[10px] text-slate-400 dark:text-[#b0b3b8] capitalize">{u.role}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {searching && searchQuery.length >= 2 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#242526] border border-slate-100 dark:border-[#3e4042] rounded-2xl shadow-lg z-50 p-4 text-center text-xs text-slate-400 dark:text-[#b0b3b8]">
                                        Searching...
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto px-3 space-y-1 pb-4">
                        {loading ? (
                            <div className="p-4 text-center text-slate-400 text-sm">Loading chats...</div>
                        ) : chats.length === 0 ? (
                            <div className="p-8 text-center bg-white/40 dark:bg-[#3a3b3c]/40 rounded-3xl mx-3 border border-dashed border-slate-200 dark:border-[#3e4042]">
                                <div className="w-12 h-12 bg-white dark:bg-[#3a3b3c] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                                    <UserPlus className="text-slate-300 dark:text-[#b0b3b8]" size={24} />
                                </div>
                                <p className="text-slate-400 dark:text-[#b0b3b8] text-xs font-medium">No discussions yet</p>
                                <button
                                    onClick={() => setShowSearch(true)}
                                    className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                                >
                                    Start a conversation
                                </button>
                            </div>
                        ) : (
                            chats.map((chat) => (
                                <button
                                    key={chat.user._id}
                                    onClick={() => {
                                        setActiveChat(chat);
                                        fetchMessages(chat.user._id);
                                    }}
                                    className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${activeChat?.user?._id === chat.user._id
                                        ? 'bg-white dark:bg-[#3a3b3c] shadow-lg shadow-indigo-100/50 dark:shadow-none border border-slate-100 dark:border-[#3e4042] ring-1 ring-slate-100 dark:ring-[#3e4042]'
                                        : 'hover:bg-white/60 dark:hover:bg-[#3a3b3c]/60'
                                        }`}
                                >
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-inner overflow-hidden border-2 border-white dark:border-[#242526]">
                                            {chat.user.profile?.firstName?.[0]}{chat.user.profile?.lastName?.[0]}
                                        </div>
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#242526] rounded-full"></div>
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <span className={`font-bold text-sm truncate ${activeChat?.user?._id === chat.user._id ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-[#e4e6eb]'}`}>
                                                {chat.user.profile?.firstName} {chat.user.profile?.lastName}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                                {chat.lastMessage ? new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-[#b0b3b8] truncate mr-2 font-medium">
                                            {chat.lastMessage?.sender === user?._id ? 'You: ' : ''}{chat.lastMessage?.content || 'Started a new conversation'}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col bg-white dark:bg-[#242526]">
                    {activeChat ? (
                        <>
                            {/* Chat Header */}
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-[#3e4042] flex items-center justify-between bg-white/80 dark:bg-[#242526]/80 backdrop-blur-md sticky top-0 z-10 shadow-sm shadow-slate-50 dark:shadow-none">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#3a3b3c] flex items-center justify-center text-slate-600 dark:text-[#e4e6eb] font-bold border border-slate-200 dark:border-[#3e4042]">
                                        {activeChat.user.profile?.firstName?.[0]}{activeChat.user.profile?.lastName?.[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 dark:text-[#e4e6eb] tracking-tight">
                                            {activeChat.user.profile?.firstName} {activeChat.user.profile?.lastName}
                                        </h3>
                                        <p className="text-[10px] text-green-500 font-bold flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Online
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {chats.find(c => c.user._id === activeChat.user._id) && (
                                        (() => {
                                            // Check for active session
                                            const session = consultations.find(s =>
                                                s.status === 'Scheduled' &&
                                                (s.consultant?._id === activeChat.user._id || s.consultant === activeChat.user._id ||
                                                    s.student?._id === activeChat.user._id || s.student === activeChat.user._id)
                                            );

                                            if (session) {
                                                if (session.meetingLink) {
                                                    return (
                                                        <a
                                                            href={session.meetingLink}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none animate-pulse"
                                                        >
                                                            <TrendingUp size={16} /> Join Meeting
                                                        </a>
                                                    );
                                                }
                                                return (
                                                    <div className="px-3 py-1.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg text-xs font-bold border border-green-200 dark:border-green-900/30">
                                                        Upcoming Session
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()
                                    )}
                                    <button className="p-2 hover:bg-slate-50 dark:hover:bg-[#3a3b3c] rounded-xl text-slate-400 transition-colors"><Search size={20} /></button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/20 dark:bg-[#18191a] scroll-smooth">
                                {messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-12">
                                        <div className="w-16 h-16 bg-white dark:bg-[#3a3b3c] rounded-3xl flex items-center justify-center mb-4 shadow-sm border border-slate-100 dark:border-[#3e4042]">
                                            <Sparkles className="text-indigo-600 dark:text-indigo-400" size={32} />
                                        </div>
                                        <h4 className="font-bold text-slate-800 dark:text-[#e4e6eb]">No Messages Yet</h4>
                                        <p className="text-xs text-slate-400 dark:text-[#b0b3b8] mt-1 max-w-[200px]">Send a hello to start your collaboration journey!</p>
                                    </div>
                                ) : (
                                    messages.map((m, idx) => {
                                        const isMe = m.sender === user?._id;
                                        return (
                                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                                {!isMe && (
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#3a3b3c] flex items-center justify-center text-slate-500 dark:text-[#b0b3b8] text-[10px] font-bold mr-3 mt-auto border border-white dark:border-[#3e4042]">
                                                        {activeChat.user.profile?.firstName?.[0]}
                                                    </div>
                                                )}
                                                <div className={`max-w-[70%] group relative`}>
                                                    <div className={`rounded-2xl px-5 py-3 text-sm shadow-sm transition-all ${isMe
                                                        ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-100 dark:shadow-none'
                                                        : 'bg-white dark:bg-[#3a3b3c] border border-slate-100 dark:border-[#3e4042] text-slate-800 dark:text-[#e4e6eb] rounded-bl-none'
                                                        }`}>
                                                        <p className="leading-relaxed font-medium">{m.content}</p>
                                                        {m.attachments && m.attachments.length > 0 && (
                                                            <div className="mt-3 space-y-2">
                                                                {m.attachments.map((file, fIdx) => (
                                                                    <a
                                                                        key={fIdx}
                                                                        href={file.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className={`flex items-center gap-2 p-2.5 rounded-xl text-xs border transition-colors ${isMe ? 'bg-white/10 border-white/20 hover:bg-white/20' : 'bg-slate-50 dark:bg-[#242526] border-slate-100 dark:border-[#3e4042] hover:bg-slate-100 dark:hover:bg-[#3e4042] text-indigo-600 dark:text-indigo-400'
                                                                            }`}
                                                                    >
                                                                        <FileText size={16} />
                                                                        <span className="truncate max-w-[150px] font-bold">{file.name}</span>
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className={`text-[9px] text-slate-400 mt-1.5 font-bold tracking-tighter uppercase ${isMe ? 'text-right' : 'text-left'}`}>
                                                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-6 bg-white dark:bg-[#242526] border-t border-slate-100 dark:border-[#3e4042]">
                                {attachments.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {attachments.map((file, i) => (
                                            <div key={i} className="flex items-center gap-2 bg-slate-100 dark:bg-[#3a3b3c] px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-[#e4e6eb] font-bold border border-slate-200 dark:border-[#3e4042]">
                                                <FileText size={14} className="text-slate-400" />
                                                <span className="max-w-[120px] truncate">{file.name}</span>
                                                <button onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))} className="hover:text-red-500 ml-1">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                                    <label className={`p-3 bg-slate-50 dark:bg-[#3a3b3c] hover:bg-slate-100 dark:hover:bg-[#4e4f50] rounded-2xl text-slate-400 cursor-pointer transition-all border border-slate-100 dark:border-[#3e4042] ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                        {uploading ? <Clock className="animate-spin" size={20} /> : <FileText size={20} />}
                                        <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Communicate your vision..."
                                        className="flex-1 bg-slate-50 dark:bg-[#3a3b3c] border border-slate-100 dark:border-[#3e4042] rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-[#18191a] text-slate-900 dark:text-[#e4e6eb] outline-none transition-all font-medium"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() && attachments.length === 0}
                                        className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 dark:shadow-none transition-all disabled:opacity-30 disabled:shadow-none active:scale-95"
                                    >
                                        <Send size={24} />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-slate-50/10 dark:bg-[#18191a]">
                            <div className="w-24 h-24 bg-indigo-50 dark:bg-[#3a3b3c] text-indigo-600 dark:text-indigo-400 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-sm ring-8 ring-white dark:ring-[#242526]">
                                <MessageSquare size={48} />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-[#e4e6eb] mb-3 tracking-tight">Collaboration Hub</h3>
                            <p className="text-slate-500 dark:text-[#b0b3b8] max-w-sm text-sm font-medium leading-relaxed">
                                {user?.role === 'student'
                                    ? "Connect with elite counselors to refine your strategy, perfect your essays, and unlock your academic potential."
                                    : "Engage with ambitious students to provide critical feedback and guide them through their most important decisions."}
                            </p>
                            <button
                                onClick={() => setShowSearch(true)}
                                className="mt-8 px-8 py-4 bg-white dark:bg-[#3a3b3c] border border-slate-200 dark:border-[#3e4042] text-slate-700 dark:text-[#e4e6eb] rounded-2xl font-bold shadow-sm hover:shadow-md hover:bg-slate-50 dark:hover:bg-[#4e4f50] transition-all flex items-center gap-2"
                            >
                                <Plus size={20} className="text-indigo-600 dark:text-indigo-400" /> Start New Discussion
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const Sparkles = ({ className, size }) => (
    <div className={className}>
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m12 3-1.912 5.813a2.01 2.01 0 0 1-1.275 1.275L3 12l5.813 1.912a2.01 2.01 0 0 1 1.275 1.275L12 21l1.912-5.813a2.01 2.01 0 0 1 1.275-1.275L21 12l-5.813-1.912a2.01 2.01 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" />
            <path d="M19 17v4" />
            <path d="M3 5h4" />
            <path d="M17 19h4" />
        </svg>
    </div>
);

export default CollaborationSpace;
