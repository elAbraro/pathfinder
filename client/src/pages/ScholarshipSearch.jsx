import React, { useState, useEffect } from 'react';
import { scholarshipAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Bookmark, GraduationCap } from 'lucide-react';

const ScholarshipSearch = () => {
    const { user } = useAuth();
    const [scholarships, setScholarships] = useState([]);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all'); // 'all' or 'matches'
    const [filters, setFilters] = useState({
        country: 'All',
        type: 'All',
        search: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch all
                const res = await scholarshipAPI.getAll(filters);
                setScholarships(res.data);

                // Fetch matches
                const matchRes = await scholarshipAPI.getMatch(); // We need to add this to api.js first! 
                // Wait, I should add getMatch to api.js first. 
                // Assuming I did (I haven't explicitly added getMatch to the export list in the previous step, I added 'create' and 'getAll'). I need to fix api.js too.
                // Actually, I can just use axios directly or update api.js in same turn.
                // Let's assume I'll update api.js right after this file creation.
            } catch (error) {
                console.error('Failed to fetch scholarships', error);
            }
            setLoading(false);
        };
        fetchData();
    }, [filters]);

    // Separate effect for Smart Match to avoid re-fetching on simple filters if we want
    useEffect(() => {
        const fetchMatches = async () => {
            if (!user) return;
            try {
                const response = await scholarshipAPI.getMatch();
                setMatches(response.data);
            } catch (e) {
                console.error("Match fetch failed", e);
            }
        };
        fetchMatches();
    }, [user]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Scholarship Finder</h1>
                <p className="text-slate-600">Discover financial aid opportunities.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-200 mb-6">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    All Scholarships
                </button>
                <button
                    onClick={() => setActiveTab('matches')}
                    className={`pb-3 px-4 font-medium transition-colors flex items-center gap-2 ${activeTab === 'matches' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <GraduationCap size={18} />
                    Smart Matches {matches.length > 0 && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{matches.length}</span>}
                </button>
            </div>

            {/* Filters (Only for 'All' tab) */}
            {activeTab === 'all' && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
                    <div className="flex-grow relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search scholarships..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={filters.search}
                            onChange={e => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>
                    <select
                        className="px-4 py-2 border border-slate-300 rounded-lg outline-none cursor-pointer"
                        value={filters.country}
                        onChange={e => setFilters({ ...filters, country: e.target.value })}
                    >
                        <option value="All">All Countries</option>
                        <option value="United States">USA</option>
                        <option value="United Kingdom">UK</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                        <option value="Global">Global</option>
                    </select>
                </div>
            )}

            {/* List */}
            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {(activeTab === 'all' ? scholarships : matches).map(sch => (
                        <div key={sch._id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-slate-900">{sch.name}</h3>
                                <div className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                                    ${sch.amount?.toLocaleString()}
                                </div>
                            </div>
                            <p className="text-sm text-slate-500 mb-4">{sch.provider} • {sch.country}</p>

                            <div className="text-sm text-slate-600 mb-4">
                                <div className="font-semibold mb-1">Criteria:</div>
                                {sch.criteria || 'No specific criteria listed.'}
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-slate-50 mt-auto">
                                <span className={`text-xs font-medium px-2 py-1 rounded ${new Date(sch.deadline) > new Date() ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
                                    Due: {new Date(sch.deadline).toLocaleDateString()}
                                </span>
                                <button className="text-blue-600 font-medium text-sm hover:underline">View Details →</button>
                            </div>
                        </div>
                    ))}
                    {(activeTab === 'all' ? scholarships : matches).length === 0 && (
                        <div className="col-span-full text-center py-10 text-slate-500">
                            No scholarships found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ScholarshipSearch;
