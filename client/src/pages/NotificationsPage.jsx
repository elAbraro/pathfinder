import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Bell, Check, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const NotificationsPage = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (error) {
            console.error('Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Error marking as read');
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Error marking all as read');
        }
    };

    if (loading) return <div className="p-10 text-center">Loading notifications...</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
                        <Bell size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
                </div>
                {notifications.some(n => !n.isRead) && (
                    <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800"
                    >
                        <Check size={16} /> Mark all as read
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {notifications.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <Bell size={48} className="mx-auto mb-4 opacity-20" />
                        <p>You have no notifications yet.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {notifications.map(n => (
                            <div
                                key={n._id}
                                className={`p-6 flex gap-4 transition-colors ${!n.isRead ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                            >
                                <div className={`h-2 w-2 mt-2 rounded-full flex-shrink-0 ${!n.isRead ? 'bg-blue-500' : 'bg-slate-300'}`} />
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`text-sm font-semibold ${!n.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                                            {n.title || 'Notification'}
                                        </h3>
                                        <span className="text-xs text-slate-400 whitespace-nowrap ml-4">
                                            {new Date(n.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 text-sm mb-3">{n.message}</p>

                                    <div className="flex items-center gap-4">
                                        {n.relatedLink && (
                                            <Link
                                                to={n.relatedLink}
                                                className="text-xs font-bold text-indigo-600 hover:underline"
                                            >
                                                View Details →
                                            </Link>
                                        )}
                                        {!n.isRead && (
                                            <button
                                                onClick={() => markAsRead(n._id)}
                                                className="text-xs text-slate-500 hover:text-indigo-600"
                                            >
                                                Mark as read
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
