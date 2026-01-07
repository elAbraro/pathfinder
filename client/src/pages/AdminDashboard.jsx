import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI, resourceAPI, scholarshipAPI } from '../services/api';


const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('stats');
    const [resources, setResources] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [isPipelineRunning, setIsPipelineRunning] = useState(false);

    const fetchStats = useCallback(async () => {
        try {
            const res = await adminAPI.getStats();
            setStats(res.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
            setError('Access Denied. Admin privileges required.');
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        try {
            const res = await adminAPI.getUsers();
            setUsers(res.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }, []);

    const fetchResources = useCallback(async () => {
        try {
            const res = await resourceAPI.getAll();
            setResources(res.data);
        } catch (error) {
            console.error('Error fetching resources:', error);
        }
    }, []);

    const handleDeleteUser = async (userId, userEmail) => {
        if (window.confirm(`Are you sure you want to delete ${userEmail}? This action is permanent.`)) {
            try {
                await adminAPI.deleteUser(userId);
                alert('User deleted successfully');
                fetchUsers(); // Refresh list
                fetchStats(); // Refresh stats
            } catch (error) {
                alert(error.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    const loadData = useCallback(async () => {
        setLoading(true);
        await Promise.all([fetchStats(), fetchUsers(), fetchResources()]);
        setLoading(false);
    }, [fetchStats, fetchUsers, fetchResources]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const [showResourceModal, setShowResourceModal] = useState(false);
    const [newResource, setNewResource] = useState({
        title: '', type: 'Article', category: 'General', url: '', description: '', isPremium: false
    });

    const [showScholarshipModal, setShowScholarshipModal] = useState(false);
    const [newScholarship, setNewScholarship] = useState({
        name: '', provider: '', amount: '', deadline: '', type: 'Merit'
    });

    const handleAddResource = async (e) => {
        e.preventDefault();
        try {
            await resourceAPI.create(newResource);
            alert('Resource added successfully!');
            setShowResourceModal(false);
            setNewResource({ title: '', type: 'Article', category: 'General', url: '', description: '', isPremium: false });
            fetchResources();
        } catch (error) {
            alert('Failed to add resource');
        }
    };

    const handleDeleteResource = async (id, title) => {
        if (window.confirm(`Delete resource: ${title}?`)) {
            try {
                await resourceAPI.delete(id);
                alert('Resource deleted');
                fetchResources();
            } catch (err) {
                alert('Failed to delete resource');
            }
        }
    };

    const handleAddScholarship = async (e) => {
        e.preventDefault();
        try {
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
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`px-4 py-2 rounded-md transition ${activeTab === 'stats' ? 'bg-white shadow text-blue-600' : 'text-slate-600'}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 rounded-md transition ${activeTab === 'users' ? 'bg-white shadow text-blue-600' : 'text-slate-600'}`}
                    >
                        User Management
                    </button>
                    <button
                        onClick={() => setActiveTab('resources')}
                        className={`px-4 py-2 rounded-md transition ${activeTab === 'resources' ? 'bg-white shadow text-blue-600' : 'text-slate-600'}`}
                    >
                        Resources
                    </button>
                    <button
                        onClick={() => setActiveTab('unis')}
                        className={`px-4 py-2 rounded-md transition ${activeTab === 'unis' ? 'bg-white shadow text-blue-600' : 'text-slate-600'}`}
                    >
                        Universities
                    </button>
                </div>
            </div>

            {activeTab === 'stats' ? (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
                        <div className="bg-blue-600 text-white p-5 rounded-xl shadow-lg">
                            <h3 className="text-xs font-semibold uppercase opacity-80 mb-1">Students</h3>
                            <p className="text-3xl font-bold">{stats?.totalStudents || 0}</p>
                        </div>
                        <div className="bg-indigo-600 text-white p-5 rounded-xl shadow-lg">
                            <h3 className="text-xs font-semibold uppercase opacity-80 mb-1">Consultants</h3>
                            <p className="text-3xl font-bold">{stats?.totalConsultants || 0}</p>
                        </div>
                        <div className="bg-green-600 text-white p-5 rounded-xl shadow-lg">
                            <h3 className="text-xs font-semibold uppercase opacity-80 mb-1">Universities</h3>
                            <p className="text-3xl font-bold">{stats?.totalUniversities || 0}</p>
                        </div>
                        <div className="bg-purple-600 text-white p-5 rounded-xl shadow-lg">
                            <h3 className="text-xs font-semibold uppercase opacity-80 mb-1">Active (St.)</h3>
                            <p className="text-3xl font-bold">{stats?.activeUsers || 0}</p>
                        </div>
                        <div className="bg-amber-500 text-white p-5 rounded-xl shadow-lg">
                            <h3 className="text-xs font-semibold uppercase opacity-80 mb-1">Premium</h3>
                            <p className="text-3xl font-bold">{stats?.premiumUsers || 0}</p>
                        </div>
                    </div>

                    {/* Management Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                            <h2 className="text-xl font-bold mb-4">University Management</h2>
                            <p className="text-gray-600 mb-4">Add, edit, or remove university data.</p>
                            <button
                                onClick={() => setActiveTab('unis')}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Manage Universities
                            </button>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                            <h2 className="text-xl font-bold mb-4">Scholarship Management</h2>
                            <p className="text-gray-600 mb-4">Update scholarship opportunities.</p>
                            <button
                                onClick={() => setShowScholarshipModal(true)}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                            >
                                Add Scholarship
                            </button>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                            <h2 className="text-xl font-bold mb-4">Data Pipeline</h2>
                            <p className="text-gray-600 mb-4">Trigger master data ingestion.</p>
                            <button
                                onClick={async () => {
                                    if (window.confirm('This will wipe and rebuild university data. Continue?')) {
                                        try {
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

                        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                            <h2 className="text-xl font-bold mb-4">Resource Management</h2>
                            <p className="text-gray-600 mb-4">Manage study materials library.</p>
                            <button
                                onClick={() => setActiveTab('resources')}
                                className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                            >
                                View Resources
                            </button>
                        </div>
                    </div>
                </>
            ) : activeTab === 'users' ? (
                <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">User Management</h2>
                            <p className="text-slate-500 text-sm">Monitor and manage all students and consultants.</p>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <input
                                type="text"
                                placeholder="Search name or email..."
                                className="p-2 border rounded-md text-sm w-full md:w-64 outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <select
                                className="p-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="all">All Roles</option>
                                <option value="student">Students</option>
                                <option value="consultant">Consultants</option>
                                <option value="admin">Admins</option>
                                <option value="superuser">Superusers</option>
                            </select>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-600 text-sm uppercase">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users
                                    .filter(u => {
                                        const searchLower = searchTerm.toLowerCase();
                                        const matchesSearch = (u.profile?.firstName + ' ' + u.profile?.lastName).toLowerCase().includes(searchLower) ||
                                            u.email.toLowerCase().includes(searchLower);
                                        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
                                        return matchesSearch && matchesRole;
                                    })
                                    .map((u) => (
                                        <tr key={u._id} className="hover:bg-slate-50 transition">
                                            <td className="px-6 py-4 font-medium text-slate-800">
                                                {u.profile?.firstName} {u.profile?.lastName}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">{u.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${u.role === 'superuser' ? 'bg-red-100 text-red-700' :
                                                    u.role === 'admin' ? 'bg-orange-100 text-orange-700' :
                                                        u.role === 'consultant' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-green-100 text-green-700'
                                                    }`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {u.email !== 'admin@gmail.com' && (
                                                    <button
                                                        onClick={() => handleDeleteUser(u._id, u.email)}
                                                        className="text-red-600 hover:text-red-800 font-medium text-sm transition"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : activeTab === 'unis' ? (
                <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">University Database</h2>
                            <p className="text-slate-500 text-sm">Manage {stats?.totalUniversities || 0} universities in the system.</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab('stats')}
                                className="bg-slate-100 text-slate-700 px-4 py-2 rounded text-sm font-semibold hover:bg-slate-200"
                            >
                                Back to Pipeline
                            </button>
                        </div>
                    </div>
                    <div className="p-12 text-center">
                        <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🏛️</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">University Management</h3>
                        <p className="text-slate-600 max-w-sm mx-auto mb-6">
                            The university database is currently managed via the master data pipeline on the Overview tab.
                        </p>
                        <button
                            onClick={() => setActiveTab('stats')}
                            className="text-blue-600 font-bold hover:underline"
                        >
                            Configure Data Pipeline &rarr;
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Resource Library</h2>
                            <p className="text-slate-500 text-sm">View and manage all downloadable study materials.</p>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <input
                                type="text"
                                placeholder="Search title or category..."
                                className="p-2 border rounded-md text-sm w-full md:w-64 outline-none focus:ring-2 focus:ring-orange-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button
                                onClick={() => setShowResourceModal(true)}
                                className="bg-orange-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-orange-700 transition"
                            >
                                + Add New
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-600 text-sm uppercase">
                                <tr>
                                    <th className="px-6 py-4">Resource Title</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Access</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {resources
                                    .filter(r => {
                                        const searchLower = searchTerm.toLowerCase();
                                        return r.title.toLowerCase().includes(searchLower) ||
                                            r.category.toLowerCase().includes(searchLower);
                                    })
                                    .map((r) => (
                                        <tr key={r._id} className="hover:bg-slate-50 transition">
                                            <td className="px-6 py-4 font-medium text-slate-800">{r.title}</td>
                                            <td className="px-6 py-4 text-slate-600">{r.category}</td>
                                            <td className="px-6 py-4 text-slate-600">{r.type}</td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {r.isPremium ?
                                                    <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Premium</span> :
                                                    <span className="text-xs text-slate-400">Public</span>
                                                }
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteResource(r._id, r.title)}
                                                    className="text-red-600 hover:text-red-800 font-medium text-sm transition"
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                {resources.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">No resources found in the library.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

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

            {/* Resource Modal */}
            {showResourceModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
                        <h2 className="text-2xl font-bold mb-4 text-slate-800">Add New Resource</h2>
                        <form onSubmit={handleAddResource} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                <input
                                    type="text" placeholder="e.g. IELTS Grammar Guide" required
                                    className="w-full p-2 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    value={newResource.title}
                                    onChange={e => setNewResource({ ...newResource, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                    <select
                                        className="w-full p-2 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={newResource.type}
                                        onChange={e => setNewResource({ ...newResource, type: e.target.value })}
                                    >
                                        <option value="Article">Article</option>
                                        <option value="Video">Video</option>
                                        <option value="PDF">PDF</option>
                                        <option value="Guide">Guide</option>
                                        <option value="Practice Test">Practice Test</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                    <select
                                        className="w-full p-2 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={newResource.category}
                                        onChange={e => setNewResource({ ...newResource, category: e.target.value })}
                                    >
                                        <option value="General">General</option>
                                        <option value="IELTS">IELTS</option>
                                        <option value="TOEFL">TOEFL</option>
                                        <option value="SAT">SAT</option>
                                        <option value="GRE">GRE</option>
                                        <option value="GMAT">GMAT</option>
                                        <option value="Essay">Essay</option>
                                        <option value="Visa">Visa</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Resource URL</label>
                                <input
                                    type="url" placeholder="https://example.com/resource" required
                                    className="w-full p-2 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    value={newResource.url}
                                    onChange={e => setNewResource({ ...newResource, url: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    placeholder="Brief internal description..."
                                    className="w-full p-2 border border-slate-200 rounded h-24 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    value={newResource.description}
                                    onChange={e => setNewResource({ ...newResource, description: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox" id="resPremium"
                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                    checked={newResource.isPremium}
                                    onChange={e => setNewResource({ ...newResource, isPremium: e.target.checked })}
                                />
                                <label htmlFor="resPremium" className="text-sm text-slate-700 select-none">Premium Resource (Pro Only)</label>
                            </div>
                            <div className="flex gap-4 mt-6">
                                <button type="submit" className="flex-1 bg-orange-600 text-white py-2 rounded font-semibold hover:bg-orange-700 transition">Save Resource</button>
                                <button type="button" onClick={() => setShowResourceModal(false)} className="flex-1 bg-slate-100 text-slate-600 py-2 rounded font-semibold hover:bg-slate-200 transition">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
