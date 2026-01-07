import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Register = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const roleParam = queryParams.get('role') || 'student';

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: roleParam,
        specialization: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { addToast } = useToast();

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            addToast("Passwords don't match", 'error');
            return;
        }
        try {
            const payload = { ...formData };
            if (formData.role === 'consultant') {
                payload.consultantProfile = {
                    specialization: formData.specialization || 'General Guidance'
                };
            }
            await register(payload);
            addToast("Registration successful! Redirecting...", 'success');
            setTimeout(() => {
                if (formData.role === 'consultant') {
                    navigate('/consultant/profile');
                } else {
                    navigate('/profile');
                }
            }, 1500);
        } catch (err) {
            console.error("Registration error:", err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to register';
            addToast(errorMessage, 'error');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 dark:bg-[#18191a] py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">

            <div className="max-w-md w-full space-y-8 bg-white dark:bg-[#242526] p-8 rounded-xl shadow-lg border border-slate-100 dark:border-[#3e4042]">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <UserPlus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-slate-900 dark:text-[#e4e6eb]">Create your account</h2>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {/* Role Selector */}
                    <div className="flex bg-slate-100 dark:bg-[#3a3b3c] p-1 rounded-lg mb-6">
                        <button
                            type="button"
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${formData.role === 'student' ? 'bg-white dark:bg-[#242526] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-[#b0b3b8] hover:text-slate-700 dark:hover:text-[#e4e6eb]'}`}
                            onClick={() => setFormData({ ...formData, role: 'student' })}
                        >
                            Student
                        </button>
                        <button
                            type="button"
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${formData.role === 'consultant' ? 'bg-white dark:bg-[#242526] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-[#b0b3b8] hover:text-slate-700 dark:hover:text-[#e4e6eb]'}`}
                            onClick={() => setFormData({ ...formData, role: 'consultant' })}
                        >
                            Consultant
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-[#b0b3b8]">First Name</label>
                            <input
                                type="text"
                                required
                                className="input-field mt-1 dark:bg-[#3a3b3c] dark:border-[#3e4042] dark:text-[#e4e6eb] dark:placeholder-[#b0b3b8]"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-[#b0b3b8]">Last Name</label>
                            <input
                                type="text"
                                required
                                className="input-field mt-1 dark:bg-[#3a3b3c] dark:border-[#3e4042] dark:text-[#e4e6eb] dark:placeholder-[#b0b3b8]"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-[#b0b3b8]">Email address</label>
                        <input
                            type="email"
                            required
                            className="input-field mt-1 dark:bg-[#3a3b3c] dark:border-[#3e4042] dark:text-[#e4e6eb] dark:placeholder-[#b0b3b8]"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    {formData.role === 'consultant' && (
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-[#b0b3b8]">Specialization</label>
                            <input
                                type="text"
                                required={formData.role === 'consultant'}
                                placeholder="e.g. Visa, Essay Writing, Career Coach"
                                className="input-field mt-1 dark:bg-[#3a3b3c] dark:border-[#3e4042] dark:text-[#e4e6eb] dark:placeholder-[#b0b3b8]"
                                value={formData.specialization}
                                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                            />
                        </div>
                    )}

                    <div className="relative">
                        <label className="text-sm font-medium text-slate-700 dark:text-[#b0b3b8]">Password</label>
                        <div className="relative mt-1">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="input-field pr-10 dark:bg-[#3a3b3c] dark:border-[#3e4042] dark:text-[#e4e6eb] dark:placeholder-[#b0b3b8]"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-[#e4e6eb]"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="relative">
                        <label className="text-sm font-medium text-slate-700 dark:text-[#b0b3b8]">Confirm Password</label>
                        <div className="relative mt-1">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                className="input-field pr-10 dark:bg-[#3a3b3c] dark:border-[#3e4042] dark:text-[#e4e6eb] dark:placeholder-[#b0b3b8]"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-[#e4e6eb]"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="w-full btn-primary py-3">
                        Sign up
                    </button>

                    <p className="text-center text-sm text-slate-600 dark:text-[#b0b3b8]">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;
