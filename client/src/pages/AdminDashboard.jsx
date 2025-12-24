import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchStats = useCallback(async () => {
        try {
            const token = await user.getIdToken();
            const res = await adminAPI.getStats();
            setStats(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching stats:', error);
            setError('Access Denied. Admin privileges required.');
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const [showScholarshipModal, setShowScholarshipModal] = useState(false);
    const [newScholarship, setNewScholarship] = useState({
        name: '', provider: '', amount: '', deadline: '', type: 'Merit'
    });

    const handleAddScholarship = async (e) => {
        e.preventDefault();
        try {
            const { scholarshipAPI, adminAPI } = require('../services/api'); // Dynamic import or move to top
            await scholarshipAPI.create(newScholarship);
            alert('Scholarship added successfully!');
            setShowScholarshipModal(false);
            setNewScholarship({ name: '', provider: '', amount: '', deadline: '', type: 'Merit' });
        } catch (error) {
            alert('Failed to add scholarship');
        }
    };

    if (loading) return <div className="p-10 text-center">Loading Admin Dashboard...</div>;
    if (error) return <div className="p-10 text-center text-red-600 font-bold">{error}</div>;

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-blue-600 text-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold">Total Students</h3>
                    <p className="text-4xl font-bold">{stats.totalStudents}</p>
                </div>
                <div className="bg-green-600 text-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold">Universities</h3>
                    <p className="text-4xl font-bold">{stats.totalUniversities}</p>
                </div>
                <div className="bg-purple-600 text-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold">Active Users</h3>
                    <p className="text-4xl font-bold">{stats.activeUsers}</p>
                </div>
                <div className="bg-yellow-600 text-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold">Premium Users</h3>
                    <p className="text-4xl font-bold">{stats.premiumUsers}</p>
                </div>
            </div>

            {/* Management Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">University Management</h2>
                    <p className="text-gray-600 mb-4">Add, edit, or remove university data.</p>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Manage Universities
                    </button>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Scholarship Management</h2>
                    <p className="text-gray-600 mb-4">Update scholarship opportunities.</p>
                    <button
                        onClick={() => setShowScholarshipModal(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        Add Scholarship
                    </button>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Data Pipeline</h2>
                    <p className="text-gray-600 mb-4">Trigger master data ingestion.</p>
                    <button
                        onClick={async () => {
                            if (window.confirm('This will wipe and rebuild university data. Continue?')) {
                                try {
                                    const { adminAPI } = require('../services/api');
                                    await adminAPI.runPipeline();
                                    alert('Pipeline started!');
                                } catch (e) { alert('Failed to start pipeline'); }
                            }
                        }}
                        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                    >
                        Run Pipeline
                    </button>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Resource Management</h2>
                    <p className="text-gray-600 mb-4">Manage study materials library.</p>
                    <button
                        onClick={() => alert("Feature coming soon: Add custom resources via form.")}
                        className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                    >
                        Add Resource
                    </button>
                </div>
            </div>

            {/* Simple Modal for Adding Scholarship */}
            {showScholarshipModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Add New Scholarship</h2>
                        <form onSubmit={handleAddScholarship} className="space-y-4">
                            <input
                                type="text" placeholder="Scholarship Name" required
                                className="w-full p-2 border rounded"
                                value={newScholarship.name}
                                onChange={e => setNewScholarship({ ...newScholarship, name: e.target.value })}
                            />
                            <input
                                type="text" placeholder="Provider (University/Org)" required
                                className="w-full p-2 border rounded"
                                value={newScholarship.provider}
                                onChange={e => setNewScholarship({ ...newScholarship, provider: e.target.value })}
                            />
                            <input
                                type="text" placeholder="Amount (e.g. $10,000)" required
                                className="w-full p-2 border rounded"
                                value={newScholarship.amount}
                                onChange={e => setNewScholarship({ ...newScholarship, amount: e.target.value })}
                            />
                            <input
                                type="date" required
                                className="w-full p-2 border rounded"
                                value={newScholarship.deadline}
                                onChange={e => setNewScholarship({ ...newScholarship, deadline: e.target.value })}
                            />
                            <select
                                className="w-full p-2 border rounded"
                                value={newScholarship.type}
                                onChange={e => setNewScholarship({ ...newScholarship, type: e.target.value })}
                            >
                                <option value="Merit">Merit Based</option>
                                <option value="Need-Based">Need Based</option>
                                <option value="Sports">Sports</option>
                                <option value="Research">Research</option>
                            </select>
                            <div className="flex gap-4 mt-6">
                                <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700">Save</button>
                                <button type="button" onClick={() => setShowScholarshipModal(false)} className="flex-1 bg-slate-200 text-slate-800 py-2 rounded hover:bg-slate-300">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
