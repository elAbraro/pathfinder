import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Notifications = () => {
    const [show, setShow] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const { user } = useAuth();

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
            // Optional: Set empty notifications or handle 401 specifically if needed
        }
    }, [user]);

    useEffect(() => {
        fetchNotifications();
        // Poll every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Error marking read');
        }
    };

    const toggle = () => setShow(!show);

    return (
        <div className="relative">
            <button onClick={toggle} className="relative p-2 text-slate-600 hover:text-indigo-600">
                <Bell size={20} />
                {notifications.some(n => !n.isRead) && (
                    <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                )}
            </button>

            {show && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-100 z-50">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-800">Notifications</h3>
                        <div className="flex gap-2">
                            <Link to="/notifications" onClick={() => setShow(false)} className="text-xs text-indigo-600 hover:underline">View All</Link>
                            <button onClick={fetchNotifications} className="text-xs text-blue-600 hover:underline">Refresh</button>
                        </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-slate-500">No notifications</div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n._id}
                                    onClick={() => !n.isRead && markAsRead(n._id)}
                                    className={`p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${!n.isRead ? 'bg-blue-50' : ''}`}
                                >
                                    <h4 className="font-medium text-sm text-slate-800">{n.title}</h4>
                                    <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                                    <span className="text-[10px] text-slate-400 mt-2 block">{new Date(n.createdAt).toLocaleString()}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;
