import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import FitScoreBadge from '../components/FitScoreBadge';
import { Trash2, MapPin } from 'lucide-react';
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
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Student Dashboard</h1>
                <p className="text-slate-600">Welcome back, {user.profile?.firstName}!</p>
            </div>

            <section>
                {(() => {
                    const validShortlist = user.shortlistedUniversities?.filter(item => item.university) || [];

                    return (
                        <>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
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
                                            <div key={uni._id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                                                {/* Card Header/Image */}
                                                <div className="relative h-40 bg-slate-100">
                                                    {uni.images && uni.images[0] ? (
                                                        <img src={uni.images[0]} alt={uni.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                                                            <span className="text-4xl">🏛️</span>
                                                        </div>
                                                    )}
                                                    <div className="absolute top-3 right-3">
                                                        <FitScoreBadge score={item.fitScore} />
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemove(uni._id)}
                                                        className="absolute top-3 left-3 bg-white/90 p-1.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-white transition-colors shadow-sm"
                                                        title="Remove"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>

                                                <div className="p-5 flex flex-col flex-grow">
                                                    <h3 className="font-bold text-lg text-slate-900 mb-1 line-clamp-1" title={uni.name}>{uni.name}</h3>

                                                    <div className="flex items-center gap-2 mb-3 text-sm text-slate-500">
                                                        <MapPin size={14} />
                                                        {uni.city}, {uni.country}
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                                                        <div className="bg-slate-50 p-2 rounded">
                                                            <div className="text-slate-500">Global Rank</div>
                                                            <div className="font-semibold">#{uni.ranking?.global || 'N/A'}</div>
                                                        </div>
                                                        <div className="bg-slate-50 p-2 rounded">
                                                            <div className="text-slate-500">Tuition</div>
                                                            <div className="font-semibold">
                                                                {uni.financials?.tuitionFee?.international?.currency} {uni.financials?.tuitionFee?.international?.min?.toLocaleString() || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center gap-2">
                                                        <select
                                                            value={item.applicationStatus}
                                                            onChange={(e) => handleStatusChange(uni._id, e.target.value)}
                                                            className={`text-xs font-semibold px-2 py-1.5 rounded border-0 cursor-pointer focus:ring-1 focus:ring-blue-500 flex-grow ${item.applicationStatus === 'Accepted' ? 'bg-green-100 text-green-700' :
                                                                item.applicationStatus === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                                    'bg-slate-100 text-slate-600'
                                                                }`}
                                                        >
                                                            {['Not Started', 'In Progress', 'Submitted', 'Accepted', 'Rejected', 'Waitlisted'].map(status => (
                                                                <option key={status} value={status}>{status}</option>
                                                            ))}
                                                        </select>
                                                        <Link to={`/application/${uni._id}`} className="text-blue-600 text-sm font-medium hover:underline whitespace-nowrap">
                                                            Manage App →
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                                    <p className="text-slate-500 mb-4">You haven't shortlisted any universities yet.</p>
                                    <Link to="/" className="btn-primary">Find Universities</Link>
                                </div>
                            )}
                        </>
                    );
                })()}
            </section>

            {/* Analytics Section */}
            <section className="mt-12 mb-8">
                <h2 className="text-xl font-bold mb-6 text-slate-900">Your Progress Analytics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-700 mb-2">Test Score Readiness</h3>
                        <div className="h-32 flex items-end justify-around pb-2 border-b border-slate-100">
                            {/* Simple Bar Chart Simulation */}
                            <div className="w-8 bg-blue-200 h-[60%] rounded-t relative group">
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-blue-700 opacity-0 group-hover:opacity-100">You</span>
                            </div>
                            <div className="w-8 bg-slate-300 h-[80%] rounded-t relative group">
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-600 opacity-0 group-hover:opacity-100">Avg</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 text-center">Your scores vs. Admitted Average</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-700 mb-2">Resource Engagement</h3>
                        <div className="flex items-center gap-4 mt-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-indigo-600">5</div>
                                <div className="text-xs text-slate-500">Read</div>
                            </div>
                            <div className="text-center border-l pl-4">
                                <div className="text-3xl font-bold text-green-600">2</div>
                                <div className="text-xs text-slate-500">Saved</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-700 mb-2">Application Velocity</h3>
                        <div className="text-sm text-slate-600 mt-2">
                            You are on track! <br />
                            <span className="text-green-600 font-bold">2 Applications</span> in progress.
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 mt-4">
                            <div className="bg-green-500 h-2 rounded-full w-[40%]"></div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
