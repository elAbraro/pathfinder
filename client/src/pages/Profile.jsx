import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Save, User } from 'lucide-react';
import Toast from '../components/Toast';

import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        gpa: '',
        sat: '',
        toefl: '',
        ielts: '',
        maxTuition: '',
        desiredMajor: '',
        preferredDestinations: '',
        careerGoals: '',
        campusPreferences: []
    });

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.profile?.firstName || '',
                lastName: user.profile?.lastName || '',
                gpa: user.academicHistory?.gpa || '',
                sat: user.testScores?.sat || '',
                toefl: user.testScores?.toefl || '',
                ielts: user.testScores?.ielts || '',
                maxTuition: user.budget?.maxTuition || '',
                desiredMajor: user.interests?.desiredMajor?.join(', ') || '',
                preferredDestinations: user.interests?.preferredStudyDestinations?.join(', ') || '',
                careerGoals: user.interests?.careerGoals || '',
                campusPreferences: user.interests?.campusPreferences || []
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'campusPreferences') {
            const currentPrefs = formData.campusPreferences;
            if (checked) {
                setFormData({ ...formData, campusPreferences: [...currentPrefs, value] });
            } else {
                setFormData({ ...formData, campusPreferences: currentPrefs.filter(p => p !== value) });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const updatePayload = {
            profile: {
                firstName: formData.firstName,
                lastName: formData.lastName
            },
            academicHistory: {
                gpa: parseFloat(formData.gpa) || undefined
            },
            testScores: {
                sat: parseInt(formData.sat) || undefined,
                toefl: parseInt(formData.toefl) || undefined,
                ielts: parseFloat(formData.ielts) || undefined
            },
            budget: {
                maxTuition: parseInt(formData.maxTuition) || undefined
            },
            interests: {
                desiredMajor: formData.desiredMajor.split(',').map(s => s.trim()).filter(Boolean),
                preferredStudyDestinations: formData.preferredDestinations.split(',').map(s => s.trim()).filter(Boolean),
                careerGoals: formData.careerGoals,
                campusPreferences: formData.campusPreferences
            }
        };

        try {
            const response = await authAPI.updateProfile(updatePayload);
            updateUser(response.data);
            setToast({ show: true, message: 'Profile updated successfully! Redirecting...', type: 'success' });

            // Redirect to search/recommendations after short delay to show toast
            setTimeout(() => {
                navigate('/search');
            }, 1000);

        } catch (error) {
            console.error(error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile.';
            setToast({ show: true, message: errorMessage, type: 'error' });
        }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}

            <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <User className="text-blue-600" /> My Profile
            </h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-8">
                {/* Personal Info */}
                <div>
                    <h2 className="text-xl font-bold mb-4 border-b pb-2">Personal Information</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="input-field" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="input-field" />
                        </div>
                    </div>
                </div>

                {/* Academic Info */}
                <div>
                    <h2 className="text-xl font-bold mb-4 border-b pb-2">Academic & Test Scores</h2>
                    <div className="grid md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">GPA (0-4.0)</label>
                            <input type="number" step="0.1" name="gpa" value={formData.gpa} onChange={handleChange} className="input-field" placeholder="e.g. 3.8" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">SAT Score</label>
                            <input type="number" name="sat" value={formData.sat} onChange={handleChange} className="input-field" placeholder="e.g. 1400" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">TOEFL</label>
                            <input type="number" name="toefl" value={formData.toefl} onChange={handleChange} className="input-field" placeholder="e.g. 100" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">IELTS</label>
                            <input type="number" step="0.5" name="ielts" value={formData.ielts} onChange={handleChange} className="input-field" placeholder="e.g. 7.5" />
                        </div>
                    </div>
                </div>

                {/* Preferences */}
                <div>
                    <h2 className="text-xl font-bold mb-4 border-b pb-2">Preferences & Budget</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Max Annual Tuition (USD)</label>
                            <input type="number" name="maxTuition" value={formData.maxTuition} onChange={handleChange} className="input-field" placeholder="e.g. 50000" />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Desired Majors (comma separated)</label>
                                <input type="text" name="desiredMajor" value={formData.desiredMajor} onChange={handleChange} className="input-field" placeholder="e.g. Computer Science, Engineering" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Destinations (comma separated)</label>
                                <input type="text" name="preferredDestinations" value={formData.preferredDestinations} onChange={handleChange} className="input-field" placeholder="e.g. USA, UK, Canada" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Career Goals</label>
                            <textarea
                                name="careerGoals"
                                value={formData.careerGoals}
                                onChange={handleChange}
                                className="input-field h-24"
                                placeholder="Describe your career aspirations..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Campus Preferences</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {['Urban', 'Suburban', 'Rural', 'Large', 'Medium', 'Small'].map(pref => (
                                    <label key={pref} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="campusPreferences"
                                            value={pref}
                                            checked={formData.campusPreferences.includes(pref)}
                                            onChange={handleChange}
                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        {pref}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                        <Save size={18} />
                        {loading ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>
            </form >
        </div >
    );
};

export default Profile;
