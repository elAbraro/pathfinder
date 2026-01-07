import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { universityAPI } from '../services/api';
import UniversityCard from '../components/UniversityCard';
import UniversitySearch from '../components/UniversitySearch';
import { Search, Filter, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const [universities, setUniversities] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchUniversities();
    }, [user]);

    const fetchUniversities = async () => {
        setLoading(true);
        try {
            let response;
            if (user) {
                response = await universityAPI.searchWithFitScore({ limit: 6 });
                // The API returns an array directly for this endpoint
                setUniversities(response.data);
            } else {
                response = await universityAPI.search({ limit: 6 });
                // The API returns { universities: [...] } for this endpoint
                setUniversities(response.data.universities);
            }
        } catch (error) {
            console.error("Failed to fetch universities", error);
        }
        setLoading(false);
    };

    return (
        <div className="space-y-16 pb-16 bg-slate-50 dark:bg-[#18191a] transition-colors duration-300">
            {/* Hero Section */}
            <section className="relative bg-blue-600 dark:bg-blue-900 py-24 px-4 sm:px-6 lg:px-8">
                <div className="absolute inset-0 bg-blue-900/10 dark:bg-black/30 mix-blend-multiply"></div>
                <div className="max-w-4xl mx-auto relative text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 animate-fade-in">
                        Find Your Dream University
                    </h1>
                    <p className="text-xl text-blue-100 dark:text-blue-200 mb-10 max-w-2xl mx-auto animate-slide-up">
                        Discover universities that match your academic profile, budget, and preferences with our AI-powered Fit Score.
                    </p>

                    <div className="animate-slide-up flex flex-col items-center gap-6">
                        <UniversitySearch />
                        <div className="flex gap-4">
                            <button
                                onClick={() => navigate('/welcome')}
                                className="text-blue-100 dark:text-blue-200 hover:text-white text-sm font-medium underline flex items-center gap-2"
                            >
                                <Users size={16} /> Are you a Counselor? Join our Portal
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Universities */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-[#e4e6eb]">Featured Universities</h2>
                        <p className="text-slate-600 dark:text-[#b0b3b8] mt-2">Top ranked institutions from around the globe</p>
                    </div>
                    <button onClick={() => navigate('/search')} className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1">
                        View all <Filter size={16} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 dark:border-blue-400"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {universities.map(uni => (
                            <UniversityCard key={uni._id} university={uni} fitScore={uni.fitScore} />
                        ))}
                    </div>
                )}
            </section>

            {/* Features Grid */}
            <section className="bg-slate-50 dark:bg-[#18191a] py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white dark:bg-[#242526] p-6 rounded-xl shadow-sm border border-slate-100 dark:border-[#3e4042] text-center">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search />
                            </div>
                            <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-[#e4e6eb]">Smart Search</h3>
                            <p className="text-slate-500 dark:text-[#b0b3b8]">Filter by tuition, ranking, and location to find what fits you best.</p>
                        </div>
                        <div className="bg-white dark:bg-[#242526] p-6 rounded-xl shadow-sm border border-slate-100 dark:border-[#3e4042] text-center">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <div className="font-bold text-xl">%</div>
                            </div>
                            <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-[#e4e6eb]">Fit Score</h3>
                            <p className="text-slate-500 dark:text-[#b0b3b8]">Get a personalized compatibility score based on your unique profile.</p>
                        </div>
                        <div className="bg-white dark:bg-[#242526] p-6 rounded-xl shadow-sm border border-slate-100 dark:border-[#3e4042] text-center">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users />
                            </div>
                            <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-[#e4e6eb]">Shortlisting</h3>
                            <p className="text-slate-500 dark:text-[#b0b3b8]">Track your favorite universities and manage your application status.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
