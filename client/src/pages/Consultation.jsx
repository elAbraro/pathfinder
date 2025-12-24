import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Consultation = () => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [formData, setFormData] = useState({
        expertName: 'Dr. Sarah Smith',
        expertRole: 'Senior Counselor',
        date: '',
        topic: 'General Guidance'
    });

    const [experts, setExperts] = useState([]);

    useEffect(() => {
        fetchSessions();
        fetchExperts();
    }, []);

    const fetchExperts = async () => {
        try {
            // Auto-seed if empty (for demo)
            await axios.post('http://localhost:5000/api/experts/seed');
            const res = await axios.get('http://localhost:5000/api/experts');
            setExperts(res.data);
            if (res.data.length > 0) {
                setFormData(prev => ({ ...prev, expertName: res.data[0].name, expertRole: res.data[0].role }));
            }
        } catch (error) {
            console.error('Error fetching experts');
        }
    };

    const fetchSessions = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/consultations', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSessions(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching sessions:', error);
            setLoading(false);
        }
    };

    const handleBook = async (e) => {
        e.preventDefault();
        if (!formData.expertName || !formData.date || !formData.topic) {
            alert('Please fill in all booking details.');
            return;
        }
        try {
            // Fix: User object in context is the DB profile, not Firebase User.
            // Use auth from firebase directly or localStorage
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/consultations', {
                expertName: formData.expertName,
                expertRole: formData.expertRole,
                date: formData.date,
                topic: formData.topic
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Session booked successfully!');
            // Reset form fields
            setFormData(prev => ({ ...prev, date: '', topic: 'General Guidance' }));
            fetchSessions(); // Refresh sessions list
        } catch (error) {
            console.error(error);
            alert('Booking failed: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Consultation Services</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Booking Section */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Book a Session</h2>
                    <form onSubmit={handleBook} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Expert</label>
                            <select
                                className="w-full border p-2 rounded"
                                value={formData.expertName}
                                onChange={(e) => {
                                    const selected = experts.find(ex => ex.name === e.target.value);
                                    setFormData({
                                        ...formData,
                                        expertName: e.target.value,
                                        expertRole: selected ? selected.role : ''
                                    });
                                }}
                            >
                                {experts.length > 0 ? experts.map(expert => (
                                    <option key={expert._id} value={expert.name}>
                                        {expert.name} ({expert.role})
                                    </option>
                                )) : <option>Loading experts...</option>}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Date & Time</label>
                            <input
                                type="datetime-local"
                                required
                                className="w-full border p-2 rounded"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Topic</label>
                            <input
                                type="text"
                                className="w-full border p-2 rounded"
                                value={formData.topic}
                                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                        >
                            Book Session
                        </button>
                    </form>
                </div>

                {/* My Sessions Section */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">My Scheduled Sessions</h2>
                    {loading ? <p>Loading...</p> : (
                        <div className="space-y-4">
                            {sessions.length === 0 ? (
                                <p className="text-gray-500">No sessions scheduled.</p>
                            ) : (
                                sessions.map(session => (
                                    <div key={session._id} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded">
                                        <p className="font-bold">{session.expertName}</p>
                                        <p className="text-sm text-gray-600">{new Date(session.date).toLocaleString()}</p>
                                        <p className="text-sm">{session.topic}</p>
                                        <span className={`text-xs px-2 py-1 rounded ${session.status === 'Scheduled' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {session.status}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Consultation;
