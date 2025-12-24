import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { universityAPI, shortlistAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import FitScoreBadge from '../components/FitScoreBadge';
import { MapPin, Globe, DollarSign, Award, BookOpen, Heart, CheckCircle } from 'lucide-react';

const UniversityDetails = () => {
    const { id } = useParams();
    const [university, setUniversity] = useState(null);
    const [fitScore, setFitScore] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user, updateUser } = useAuth(); // Need updateUser to refresh shortlist in context if needed

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const uniRes = await universityAPI.getById(id);
                setUniversity(uniRes.data);

                if (user) {
                    const fitRes = await universityAPI.getFitScore(id);
                    setFitScore(fitRes.data.fitScore);
                }
            } catch (error) {
                console.error("Error fetching details", error);
            }
            setLoading(false);
        };
        fetchDetails();
    }, [id, user]);

    const isShortlisted = user?.shortlistedUniversities?.some(item =>
        item.university && (typeof item.university === 'string' ? item.university : item.university?._id) === id
    );

    const handleShortlist = async () => {
        if (!user) return alert("Please login to shortlist");
        try {
            await shortlistAPI.add(id, { fitScore });
            // Refresh user profile to update local shortlist state
            // In a real app we might just update local state optimistically
            alert("Added to shortlist!");
            window.location.reload(); // Simple refresh to sync state
        } catch (error) {
            alert(error.response?.data?.message || "Failed to shortlist");
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!university) return <div className="p-10 text-center">University not found</div>;

    return (
        <div className="bg-slate-50 min-h-screen pb-12">
            {/* Header / Hero */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">{university.name}</h1>
                            <div className="flex items-center gap-4 mt-2 text-slate-600">
                                <span className="flex items-center gap-1"><MapPin size={18} /> {university.city}, {university.country}</span>
                                <span className="flex items-center gap-1"><Award size={18} /> Global Rank: #{university.ranking?.global}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {user && <FitScoreBadge score={fitScore} />}
                            <button
                                onClick={handleShortlist}
                                disabled={isShortlisted}
                                className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${isShortlisted
                                    ? 'bg-green-100 text-green-700 cursor-default'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                {isShortlisted ? <><CheckCircle size={18} /> Shortlisted</> : <><Heart size={18} /> Shortlist</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-8">
                    <section className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-bold mb-4">About</h2>
                        <p className="text-slate-600 leading-relaxed">{university.description}</p>
                    </section>

                    <section className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-bold mb-4">Academics</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-medium text-slate-900 mb-2">Majors Offered</h3>
                                <div className="flex flex-wrap gap-2">
                                    {university.academics?.majorsOffered?.map(major => (
                                        <span key={major} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm">
                                            {major}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium text-slate-900 mb-2">Key Stats</h3>
                                <ul className="space-y-2 text-sm text-slate-600">
                                    <li>Student/Teacher Ratio: {university.academics?.studentTeacherRatio}</li>
                                    <li>Faculty Strength: {university.academics?.facultyStrength}</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-bold mb-4">Admissions</h2>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-medium text-slate-900 mb-2">Requirements</h3>
                                <ul className="space-y-2 text-sm text-slate-600 list-disc pl-4">
                                    <li>Min GPA: {university.admissions?.requirements?.minGPA}</li>
                                    <li>Acceptance Rate: {(university.admissions?.acceptanceRate * 100).toFixed(1)}%</li>
                                    {university.admissions?.requirements?.testScores?.sat?.min && (
                                        <li>SAT: {university.admissions.requirements.testScores.sat.min}+</li>
                                    )}
                                    {university.admissions?.requirements?.testScores?.toefl?.min && (
                                        <li>TOEFL: {university.admissions.requirements.testScores.toefl.min}+</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </section>

                    {university.testimonials && university.testimonials.length > 0 && (
                        <section className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-xl font-bold mb-4">Student Testimonials</h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {university.testimonials.map((t, index) => (
                                    <div key={index} className="bg-slate-50 p-4 rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-bold text-slate-900">{t.studentName}</p>
                                                <p className="text-xs text-slate-500">{t.major}, Class of {t.graduationYear}</p>
                                            </div>
                                            <div className="flex text-yellow-500 text-sm">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i}>{i < t.rating ? '★' : '☆'}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-600 italic">"{t.testimonial}"</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <DollarSign className="text-green-600" /> Financials
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-slate-500">International Tuition</p>
                                <p className="text-xl font-bold text-slate-900">
                                    {university.financials?.tuitionFee?.international?.currency} {university.financials?.tuitionFee?.international?.min?.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Financial Aid</p>
                                <p className="font-medium text-slate-900">
                                    {university.financials?.financialAidAvailable ? "Available" : "Not Available"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Globe className="text-blue-600" /> Campus Life
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-slate-500">Type</p>
                                <p className="font-medium text-slate-900">{university.campusLife?.campusType}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Facilities</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {university.campusLife?.facilities?.map(f => (
                                        <span key={f} className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">{f}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UniversityDetails;
