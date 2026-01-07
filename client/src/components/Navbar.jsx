import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, User, BookOpen, Sun, Moon } from 'lucide-react';
import Notifications from './Notifications';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="glass sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-1.5 rounded-lg text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-indigo-600 transition-all">
                                PathFinder
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Toggle Dark Mode"
                        >
                            {theme === 'dark' ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} className="text-slate-500" />}
                        </button>
                        {user ? (
                            <>
                                {user.role === 'student' ? (
                                    <>
                                        <Link to="/dashboard" className="text-slate-600 hover:text-indigo-600 font-medium px-3 py-2 rounded-md transition-colors">
                                            Dashboard
                                        </Link>
                                        <Link to="/resources" className="text-slate-600 hover:text-indigo-600 font-medium px-3 py-2 rounded-md transition-colors">
                                            Resources
                                        </Link>
                                        <Link to="/analytics" className="text-slate-600 hover:text-indigo-600 font-medium px-3 py-2 rounded-md transition-colors">
                                            Analytics
                                        </Link>
                                        <Link to="/ai-brainstorm" className="text-slate-600 hover:text-indigo-600 font-medium px-3 py-2 rounded-md transition-colors">
                                            AI Tools
                                        </Link>
                                        <Link to="/consultation" className="text-slate-600 hover:text-indigo-600 font-medium px-3 py-2 rounded-md transition-colors">
                                            Consultation
                                        </Link>
                                        <Link to="/collaboration" className="text-slate-600 hover:text-indigo-600 font-medium px-3 py-2 rounded-md transition-colors">
                                            Collab Space
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/consultant/dashboard" className="text-slate-600 hover:text-indigo-600 font-medium px-3 py-2 rounded-md transition-colors">
                                            Dashboard
                                        </Link>
                                        <Link to="/collaboration" className="text-slate-600 hover:text-indigo-600 font-medium px-3 py-2 rounded-md transition-colors">
                                            Collab Space
                                        </Link>
                                    </>
                                )}
                                {(user.role === 'admin' || user.role === 'superuser') && (
                                    <Link to="/admin" className="text-red-600 hover:text-red-800 font-medium px-3 py-2 rounded-md transition-colors">
                                        Admin
                                    </Link>
                                )}
                                <div className="flex items-center gap-4 pl-2">
                                    <Notifications />
                                    <div className="hidden md:flex flex-col items-end mr-2">
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Welcome Back</span>
                                            {user.isPremium && <span className="bg-amber-100 text-amber-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter border border-amber-200">Pro</span>}
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700">{user.profile?.firstName} {user.profile?.lastName || ''}</span>
                                    </div>
                                    <Link to="/profile" className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-100 border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm" title="My Profile">
                                        <User size={20} />
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-50 border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
                                        title="Logout"
                                    >
                                        <LogOut size={18} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/resources" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Resources</Link>
                                <Link to="/scholarships" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Scholarships</Link>
                                <Link to="/consultation" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Consultation</Link>
                                <Link to="/login" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">
                                    Log in
                                </Link>
                                <Link to="/register" className="btn-primary">
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
