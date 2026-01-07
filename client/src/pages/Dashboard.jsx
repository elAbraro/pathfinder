import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import FitScoreBadge from '../components/FitScoreBadge';
import { Trash2, MapPin, BarChart3, ChevronRight, Sparkles, Activity, Award } from 'lucide-react';
import { shortlistAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

const Dashboard = () => {
    const { user, updateUser } = useAuth();
    const { addToast } = useToast();

    const handleRemove = async (uniId) => {
        if (!window.confirm("Remove from shortlist?")) return;
        try {
            await shortlistAPI.remove(uniId);
            window.location.reload();
        } catch (error) {
            console.error("Failed to remove", error);
        }
    };

    const handleStatusChange = async (uniId, newStatus) => {
        try {
            await shortlistAPI.updateStatus(uniId, { applicationStatus: newStatus });
            window.location.reload();
        } catch (error) {
            console.error("Failed to update status", error);
            addToast("Failed to update status", "error");
        }
    };

    if (!user) return <div className="p-10">Please login</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Student Dashboard</h1>
                    <p className="text-slate-600 dark:text-slate-400">Welcome back, {user.profile?.firstName}!</p>
                </div>
                <Link to="/search" className="btn-primary flex items-center gap-2">
                    <Sparkles size={18} /> Discover Universities
                </Link>
            </div>

            <section>
                {(() => {
                    const validShortlist = user.shortlistedUniversities?.filter(item => item.university) || [];

                    return (
                        <>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-[#e4e6eb]">
                                Shortlisted Universities
                                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                                    {validShortlist.length}
                                </span>
                            </h2>

                            {validShortlist.length > 0 ? (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {validShortlist.map((item) => {
                                        const uni = item.university;
                                        return (
                                            <div key={uni._id} className="bg-white dark:bg-[#242526] border border-slate-200 dark:border-[#3e4042] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
                                                {/* Card Header/Image */}
                                                <div className="relative h-40 bg-slate-100 dark:bg-[#3e4042]">
                                                    {uni.images && uni.images[0] ? (
                                                        <img src={uni.images[0]} alt={uni.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-[#3e4042] text-slate-400">
                                                            <span className="text-4xl">🏛️</span>
                                                        </div>
                                                    )}
                                                    <div className="absolute top-3 right-3">
                                                        <FitScoreBadge score={item.fitScore} />
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemove(uni._id)}
                                                        className="absolute top-3 left-3 bg-white/90 dark:bg-[#242526]/90 p-1.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-[#3e4042] transition-colors shadow-sm"
                                                        title="Remove"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>

                                                <div className="p-5 flex flex-col flex-grow">
                                                    <h3 className="font-bold text-lg text-slate-900 dark:text-[#e4e6eb] mb-1 line-clamp-1" title={uni.name}>{uni.name}</h3>

                                                    <div className="flex items-center gap-2 mb-3 text-sm text-slate-500 dark:text-[#b0b3b8]">
                                                        <MapPin size={14} />
                                                        {uni.city}, {uni.country}
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                                                        <div className="bg-slate-50 dark:bg-[#3a3b3c] p-2 rounded border border-transparent dark:border-[#3e4042]">
                                                            <div className="text-slate-500 dark:text-[#b0b3b8]">Global Rank</div>
                                                            <div className="font-semibold text-slate-700 dark:text-[#e4e6eb]">#{uni.ranking?.global || 'N/A'}</div>
                                                        </div>
                                                        <div className="bg-slate-50 dark:bg-[#3a3b3c] p-2 rounded border border-transparent dark:border-[#3e4042]">
                                                            <div className="text-slate-500 dark:text-[#b0b3b8]">Tuition</div>
                                                            <div className="font-semibold text-slate-700 dark:text-[#e4e6eb]">
                                                                {uni.financials?.tuitionFee?.international?.currency} {uni.financials?.tuitionFee?.international?.min?.toLocaleString() || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-auto pt-4 border-t border-slate-100 dark:border-[#3e4042] flex justify-between items-center gap-2">
                                                        <select
                                                            value={item.applicationStatus}
                                                            onChange={(e) => handleStatusChange(uni._id, e.target.value)}
                                                            className={`text-xs font-semibold px-2 py-1.5 rounded border-0 cursor-pointer focus:ring-1 focus:ring-blue-500 flex-grow ${item.applicationStatus === 'Accepted' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                                item.applicationStatus === 'Rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                                    'bg-slate-100 text-slate-600 dark:bg-[#3a3b3c] dark:text-[#e4e6eb]'
                                                                }`}
                                                        >
                                                            {['Not Started', 'In Progress', 'Submitted', 'Accepted', 'Rejected', 'Waitlisted'].map(status => (
                                                                <option key={status} value={status} className="dark:bg-[#242526]">{status}</option>
                                                            ))}
                                                        </select>
                                                        <Link to={`/application/${uni._id}`} className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline whitespace-nowrap">
                                                            Manage App →
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white dark:bg-[#242526] rounded-xl border border-dashed border-slate-300 dark:border-[#3e4042]">
                                    <p className="text-slate-500 dark:text-[#b0b3b8] mb-4">You haven't shortlisted any universities yet.</p>
                                    <Link to="/search" className="btn-primary">Find Universities</Link>
                                </div>
                            )}
                        </>
                    );
                })()}
            </section>

            {/* Analytics Summary Section */}
            <section className="mt-12 mb-8 bg-white dark:bg-[#242526] p-8 rounded-3xl border border-slate-200 dark:border-[#3e4042] shadow-sm transition-colors duration-300">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-[#e4e6eb]">Your Progress Overview</h2>
                        <p className="text-slate-500 dark:text-[#b0b3b8]">Quick snapshot of your current activity</p>
                    </div>
                    <Link to="/analytics" className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                        View Detailed Analytics <ChevronRight size={18} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-slate-50 dark:bg-[#3a3b3c] p-6 rounded-2xl border border-slate-100 dark:border-[#3e4042]">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><BarChart3 size={20} /></div>
                            <h3 className="font-bold text-slate-700 dark:text-[#e4e6eb]">App Velocity</h3>
                        </div>
                        <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                            {user.shortlistedUniversities?.filter(u => u.applicationStatus !== 'Not Started').length || 0}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-[#b0b3b8]">Active applications in progress</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-[#3a3b3c] p-6 rounded-2xl border border-slate-100 dark:border-[#3e4042]">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><Activity size={20} /></div>
                            <h3 className="font-bold text-slate-700 dark:text-[#e4e6eb]">Engagement</h3>
                        </div>
                        <div className="text-3xl font-black text-slate-900 dark:text-white mb-1 text-indigo-600 dark:text-indigo-400">
                            {/* Simplified proxy for engagement level */}
                            {(user.shortlistedUniversities?.length || 0) * 5 + (user.testScoreHistory?.length || 0) * 10 > 20 ? 'High' : 'Growing'}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-[#b0b3b8]">Based on activity</p>
                    </div>

                    {!user.isPremium ? (
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-[#3a3b3c] dark:to-[#3a3b3c] p-6 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-2">
                                    <Sparkles size={16} /> Go Premium
                                </h3>
                                <p className="text-xs text-amber-600 dark:text-amber-500/80 mt-1">Unlock AI predictions and full analytics.</p>
                            </div>
                            <Link to="/payment" className="mt-4 bg-amber-600 text-white text-center py-2 rounded-xl text-sm font-bold shadow-lg shadow-amber-200 dark:shadow-none hover:bg-amber-700 active:scale-95 transition-all">
                                Upgrade Now
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-[#3a3b3c] dark:to-[#3a3b3c] p-6 rounded-2xl border border-green-100 dark:border-green-900/30">
                            <h3 className="font-bold text-green-800 dark:text-green-400 flex items-center gap-2">
                                <Award size={16} className="text-green-600 dark:text-green-400" /> Premium User
                            </h3>
                            <p className="text-xs text-green-600 dark:text-green-500/80 mt-1">You have full access to all elite features.</p>
                            <div className="mt-4 text-[10px] font-bold text-green-500 uppercase tracking-widest">Active Since {new Date(user.premiumSince).toLocaleDateString()}</div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};
export default Dashboard;
