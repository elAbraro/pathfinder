import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { authAPI } from '../services/api';
import api from '../services/api';
import { CheckCircle, CreditCard, ShieldCheck, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Payment = () => {
    const { user } = useAuth();
    const [processing, setProcessing] = useState(false);
    const [status, setStatus] = useState(null); // 'success', 'error'
    const [step, setStep] = useState(0); // 0: Idle, 1+: steps
    const [transaction, setTransaction] = useState(null);

    const steps = [
        "Initializing secure connection...",
        "Validating card with gateway...",
        "Running fraud protection check...",
        "Finalizing your premium access..."
    ];

    useEffect(() => {
        let timer;
        if (processing && step < steps.length - 1) {
            timer = setTimeout(() => {
                setStep(prev => prev + 1);
            }, 800);
        }
        return () => clearTimeout(timer);
    }, [processing, step]);

    const handlePayment = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setStatus(null);
        setStep(0);

        try {
            const res = await api.post('/payment/process', {
                amount: 2999,
                currency: 'USD',
                planName: 'Elite Pathfinder Premium',
                source: 'tok_visa'
            });

            // Ensure the UI steps show for at least some time
            await new Promise(resolve => setTimeout(resolve, 3200));

            setTransaction(res.data);
            setStatus('success');

            // Refresh would ideally be handled by context or global state
        } catch (error) {
            console.error(error);
            setStatus('error');
        } finally {
            setProcessing(false);
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar />
                <div className="flex-grow flex items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl border border-green-100 max-w-md w-full text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl text-green-600">
                            <CheckCircle size={48} />
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Success!</h2>
                        <p className="text-slate-600 mb-8">Your transaction <b>{transaction?.transactionId}</b> was successful. Premium features are now unlocked.</p>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-8 text-left space-y-2">
                            <div className="flex justify-between text-sm text-slate-500">
                                <span>Plan</span>
                                <span className="font-bold text-slate-700">{transaction?.plan}</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-500">
                                <span>Amount Paid</span>
                                <span className="font-bold text-slate-700">$29.99</span>
                            </div>
                        </div>

                        <button onClick={() => window.location.href = '/dashboard'} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                            Go to Dashboard <Sparkles size={18} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <div className="flex-grow flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 max-w-lg w-full">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-3xl font-extrabold text-slate-900 mb-1">Upgrade</h2>
                            <p className="text-slate-500">Unlock your full potential today</p>
                        </div>
                        <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg">
                            <CreditCard size={28} />
                        </div>
                    </div>

                    <div className="mb-8 p-6 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl text-white relative overflow-hidden shadow-lg">
                        <div className="relative z-10">
                            <span className="text-blue-200 text-xs font-bold uppercase tracking-widest">Premium Plan</span>
                            <div className="text-4xl font-black mt-1">$29.99 <span className="text-lg font-normal opacity-70">/ one-time</span></div>
                        </div>
                    </div>

                    {processing ? (
                        <div className="py-12 text-center space-y-6">
                            <Loader2 size={64} className="text-blue-600 animate-spin mx-auto" />
                            <div className="space-y-2">
                                <h3 className="font-bold text-xl text-slate-800">{steps[step]}</h3>
                                <p className="text-slate-500 text-sm">Validating with 256-bit encryption...</p>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-blue-600 h-full transition-all duration-1000 ease-out"
                                    style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handlePayment} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Card Information</label>
                                <input type="text" placeholder="4242 4242 4242 4242" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="MM/YY" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                                <input type="text" placeholder="CVC" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                            </div>

                            {status === 'error' && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
                                    Transaction failed. Please try again.
                                </div>
                            )}

                            <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl active:scale-95">
                                Pay $29.99
                            </button>
                            <div className="flex items-center justify-center gap-2 text-slate-400">
                                <ShieldCheck size={14} />
                                <span className="text-[10px] uppercase font-bold">Secure SSL Encrypted Payment</span>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Payment;
