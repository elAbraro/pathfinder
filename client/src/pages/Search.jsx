import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { universityAPI } from '../services/api';
import UniversityCard from '../components/UniversityCard';
import { useAuth } from '../context/AuthContext';
import { Filter, X } from 'lucide-react';

const Search = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [universities, setUniversities] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // Filters state
    const [filters, setFilters] = useState({
        search: searchParams.get('q') || '', // Search by Name
        country: '',
        maxTuition: '',
        minRanking: '',
        major: ''
    });

    const [showFilters, setShowFilters] = useState(false);

    const [limit, setLimit] = useState(20);

    useEffect(() => {
        const fetchUniversities = async () => {
            setLoading(true);
            try {
                const params = {
                    search: filters.search,
                    country: filters.country,
                    maxTuition: filters.maxTuition,
                    minRanking: filters.minRanking,
                    major: filters.major,
                    limit: limit // Dynamic Limit
                };

                let response;
                if (user) {
                    response = await universityAPI.searchWithFitScore(params);
                    setUniversities(response.data);
                } else {
                    response = await universityAPI.search(params);
                    setUniversities(response.data.universities);
                }
            } catch (error) {
                console.error(error);
            }
            setLoading(false);
        };

        // Debounce could be added here
        const timer = setTimeout(fetchUniversities, 300);
        return () => clearTimeout(timer);
    }, [filters, user, limit]);

    // specific effect to sync URL param to local state on load
    useEffect(() => {
        setFilters(prev => ({ ...prev, search: searchParams.get('q') || '' }));
    }, [searchParams]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Discover Universities</h1>
                <button
                    className="md:hidden flex items-center gap-2 btn-secondary"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter size={18} /> Filters
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Filters Sidebar */}
                <div className={`w-full md:w-64 flex-shrink-0 space-y-6 ${showFilters ? 'block' : 'hidden md:block'}`}>
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-slate-800">Filters</h2>
                            {showFilters && <button onClick={() => setShowFilters(false)}><X size={18} /></button>}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">University Name</label>
                                <input
                                    type="text"
                                    name="search"
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                    className="input-field text-sm"
                                    placeholder="Keyword..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                                <input
                                    type="text"
                                    name="country"
                                    value={filters.country}
                                    onChange={handleFilterChange}
                                    className="input-field text-sm"
                                    placeholder="e.g. USA"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Major</label>
                                <input
                                    type="text"
                                    name="major"
                                    value={filters.major}
                                    onChange={handleFilterChange}
                                    className="input-field text-sm"
                                    placeholder="e.g. Computer Science"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Max Ranking</label>
                                <input
                                    type="number"
                                    name="minRanking"
                                    value={filters.minRanking}
                                    onChange={handleFilterChange}
                                    className="input-field text-sm"
                                    placeholder="e.g. 50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Max Tuition ($)</label>
                                <input
                                    type="number"
                                    name="maxTuition"
                                    value={filters.maxTuition}
                                    onChange={handleFilterChange}
                                    className="input-field text-sm"
                                    placeholder="e.g. 50000"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Grid */}
                <div className="flex-grow">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                        </div>
                    ) : universities.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {universities.map(uni => (
                                <UniversityCard key={uni._id} university={uni} fitScore={uni.fitScore} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-slate-100 rounded-xl">
                            <p className="text-slate-500">No universities found matching your criteria.</p>
                        </div>
                    )}
                </div>
                {/* Load More / Pagination */}
                {universities.length > 0 && !loading && (
                    <div className="flex justify-center mt-8">
                        <button
                            onClick={() => setLimit(prev => prev + 20)}
                            className="btn-secondary px-6 py-2"
                        >
                            Load More Results
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
