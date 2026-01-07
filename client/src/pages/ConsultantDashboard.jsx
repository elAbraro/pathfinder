import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Users, Calendar, MessageSquare, TrendingUp, Search, Star, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ConsultantDashboard = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [activeTab, setActiveTab] = useState('overview');
    const [editingSession, setEditingSession] = useState(null);
    const [meetingLinkInput, setMeetingLinkInput] = useState('');
    const [notesInput, setNotesInput] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [studentRes, sessionRes] = await Promise.all([
                    api.get('/students/all'),
                    api.get('/consultations')
                ]);
                // setAllStudents(studentRes.data);

                // Filter students who have booked a session
                const bookedStudentIds = new Set(sessionRes.data.map(s => s.student._id));
                const bookedStudents = studentRes.data.filter(s => bookedStudentIds.has(s._id));
                setStudents(bookedStudents);

                setSessions(sessionRes.data);
            } catch (err) {
                console.error("Failed to fetch data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCancelSession = async (sessionId) => {
        if (!window.confirm("Are you sure you want to cancel this session? The student will be notified.")) return;

        try {
            await api.put(`/consultations/${sessionId}/cancel`);
            addToast('Session cancelled successfully', 'success');
            // Refresh sessions
            const res = await api.get('/consultations');
            setSessions(res.data);
        } catch (err) {
            console.error(err);
            addToast('Failed to cancel session', 'error');
        }
    };



    const handleUpdateSession = async (sessionId, type) => {
        try {
            const payload = {};
            if (type === 'link') payload.meetingLink = meetingLinkInput;
            if (type === 'notes') payload.notes = notesInput;

            await api.put(`/consultations/${sessionId}/update`, payload);
            addToast('Session updated!', 'success');
            setEditingSession(null);

            // Refresh
            const res = await api.get('/consultations');
            setSessions(res.data);
        } catch (err) {
            addToast('Update failed', 'error');
        }
    };

    const handleCompleteSession = async (sessionId) => {
        if (!window.confirm("Mark this session as completed?")) return;
        try {
            await api.put(`/consultations/${sessionId}/complete`);
            addToast('Session marked as completed', 'success');
            const res = await api.get('/consultations');
            setSessions(res.data);
        } catch (err) {
            addToast('Action failed', 'error');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900">Consultant Dashboard</h1>
                    <p className="text-slate-600">Welcome back, {user?.profile?.firstName}!</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'overview' ? 'bg-white shadow text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('schedule')}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'schedule' ? 'bg-white shadow text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        My Schedule
                    </button>
                    <button
                        onClick={() => setActiveTab('availability')}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'availability' ? 'bg-white shadow text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        Availability
                    </button>
                </div>
            </div>

            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Keep existing Stats & Sidebar logic here but standardized */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Quick Stats</h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600">Active Students</span>
                                    <span className="font-bold text-slate-900">{students.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600">Total Sessions</span>
                                    <span className="font-bold text-slate-900">{sessions.length}</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-lg">
                            <h3 className="font-bold text-lg mb-2">Next Session</h3>
                            {sessions.filter(s => s.status === 'Scheduled').length > 0 ? (
                                <div>
                                    <p className="text-2xl font-bold mb-1">
                                        {new Date(sessions.filter(s => s.status === 'Scheduled')[0].date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <p className="text-indigo-100 text-sm mb-4">
                                        {new Date(sessions.filter(s => s.status === 'Scheduled')[0].date).toLocaleDateString()}
                                    </p>
                                    <button onClick={() => setActiveTab('schedule')} className="w-full py-2 bg-white/20 rounded-lg text-sm font-semibold hover:bg-white/30">
                                        Manage Schedule
                                    </button>
                                </div>
                            ) : <p className="text-indigo-200">No upcoming sessions.</p>}
                        </div>
                    </div>

                    <div className="lg:col-span-3 space-y-6">
                        {/* Existing Student Table Logic */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-slate-800">Your Students</h2>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="pl-9 pr-4 py-2 border rounded-full text-sm bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>
                            {/* Reusing existing simplified table logic for brevity */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="text-xs text-slate-400 uppercase bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3">Name</th>
                                            <th className="px-4 py-3">Email</th>
                                            <th className="px-4 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {students.filter(s => s.email.includes(searchTerm)).map(student => (
                                            <tr key={student._id}>
                                                <td className="px-4 py-3 font-medium">{student.profile.firstName} {student.profile.lastName}</td>
                                                <td className="px-4 py-3 text-slate-500">{student.email}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <button onClick={() => navigate(`/collaboration?userId=${student._id}`)} className="text-indigo-600 font-bold text-sm hover:underline">Message</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {students.length === 0 && <tr><td colSpan="3" className="px-4 py-8 text-center text-slate-400">No active students.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'schedule' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Calendar size={20} className="text-indigo-600" /> Session Management
                        </h2>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {sessions.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">No sessions found.</div>
                        ) : sessions.map(session => (
                            <div key={session._id} className="p-6 hover:bg-slate-50 transition-colors">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${session.status === 'Scheduled' ? 'bg-green-100 text-green-700' :
                                                session.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {session.status}
                                            </span>
                                            <span className="text-sm text-slate-500 font-medium">
                                                {new Date(session.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} • {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-1">{session.student?.profile?.firstName} {session.student?.profile?.lastName}</h3>
                                        <p className="text-slate-600 text-sm mb-3">Topic: {session.topic}</p>

                                        {/* Meeting Link Display */}
                                        {session.meetingLink ? (
                                            <div className="flex items-center gap-2 mb-2">
                                                <a href={session.meetingLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1">
                                                    Join Meeting <TrendingUp size={14} />
                                                </a>
                                                <button onClick={() => {
                                                    setEditingSession(session._id);
                                                    setMeetingLinkInput(session.meetingLink);
                                                }} className="text-xs text-slate-400 hover:text-slate-600">(Edit)</button>
                                            </div>
                                        ) : (
                                            session.status === 'Scheduled' && (
                                                <div className="mb-2">
                                                    {editingSession === session._id ? (
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="text"
                                                                placeholder="Paste Zoom/Meet Link"
                                                                className="border rounded px-2 py-1 text-sm w-64"
                                                                value={meetingLinkInput}
                                                                onChange={e => setMeetingLinkInput(e.target.value)}
                                                            />
                                                            <button onClick={() => handleUpdateSession(session._id, 'link')} className="bg-green-600 text-white px-3 py-1 rounded text-sm font-bold">Save</button>
                                                            <button onClick={() => setEditingSession(null)} className="text-slate-500 text-sm">Cancel</button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                setEditingSession(session._id);
                                                                setMeetingLinkInput('');
                                                            }}
                                                            className="text-indigo-600 text-sm font-bold hover:underline"
                                                        >
                                                            + Add Meeting Link
                                                        </button>
                                                    )}
                                                </div>
                                            )
                                        )}

                                        {/* Notes Section */}
                                        <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 inline-block w-full max-w-xl">
                                            <p className="text-xs font-bold text-amber-800 mb-1">Private Notes:</p>
                                            <p className="text-sm text-amber-900">{session.notes || "No notes added."}</p>
                                            <button
                                                onClick={() => {
                                                    const note = prompt("Update Notes:", session.notes || "");
                                                    if (note !== null) {
                                                        setNotesInput(note);
                                                        // Direct update wrapper since prompt returns value
                                                        api.put(`/consultations/${session._id}/update`, { notes: note }).then(() => {
                                                            addToast('Notes saved', 'success');
                                                            api.get('/consultations').then(r => setSessions(r.data));
                                                        });
                                                    }
                                                }}
                                                className="text-amber-700 text-xs font-bold mt-2 hover:underline"
                                            >
                                                Edit Notes
                                            </button>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2 justify-center items-end min-w-[140px]">
                                        {session.status === 'Scheduled' && (
                                            <>
                                                <button
                                                    onClick={() => handleCompleteSession(session._id)}
                                                    className="w-full py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 flex items-center justify-center gap-2"
                                                >
                                                    <Star size={16} /> Complete
                                                </button>
                                                <button
                                                    onClick={() => handleCancelSession(session._id)}
                                                    className="w-full py-2 border border-slate-200 text-slate-600 rounded-lg font-bold text-sm hover:bg-red-50 hover:text-red-600 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => navigate(`/collaboration?userId=${session.student?._id}`)}
                                            className="text-slate-500 text-sm font-medium hover:text-indigo-600"
                                        >
                                            Message Student
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'availability' && (
                <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
                        <Calendar size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">My Availability</h2>
                    <p className="text-slate-600 max-w-md mx-auto mb-8">
                        Your availability is currently managed automatically based on your booked sessions.
                        You are set to standard working hours (09:00 - 18:00).
                    </p>
                    <button onClick={() => setActiveTab('schedule')} className="text-indigo-600 font-bold hover:underline">View Booked Slots</button>
                </div>
            )}
        </div>
    );
};

const ArrowRight = ({ size, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
);

export default ConsultantDashboard;
