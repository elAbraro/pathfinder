import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Get the role from search param if it exists
    const queryParams = new URLSearchParams(location.search);
    const roleParam = queryParams.get('role');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const loggedInUser = await login(email, password);
            // Use the user's role from the backend for routing
            if (loggedInUser.role === 'consultant') {
                navigate('/counselor/dashboard');
            } else if (loggedInUser.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 dark:bg-[#18191a] py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-[#242526] p-8 rounded-xl shadow-lg border border-slate-100 dark:border-[#3e4042]">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <LogIn className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-slate-900 dark:text-[#e4e6eb]">Sign in to your account</h2>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-lg text-sm text-center border border-red-100 dark:border-red-800">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-[#b0b3b8]">Email address</label>
                            <input
                                type="email"
                                required
                                className="input-field mt-1 dark:bg-[#3a3b3c] dark:border-[#3e4042] dark:text-[#e4e6eb] dark:placeholder-[#b0b3b8]"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-[#b0b3b8]">Password</label>
                            <input
                                type="password"
                                required
                                className="input-field mt-1 dark:bg-[#3a3b3c] dark:border-[#3e4042] dark:text-[#e4e6eb] dark:placeholder-[#b0b3b8]"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button type="submit" className="w-full btn-primary py-3 shadow-blue-500/20">
                        Sign in
                    </button>

                    <p className="text-center text-sm text-slate-600 dark:text-[#b0b3b8]">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
                            Sign up
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
