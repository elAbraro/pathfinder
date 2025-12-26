import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';

const Payment = () => {
    const [processing, setProcessing] = useState(false);
    const [status, setStatus] = useState(null); // 'success', 'error'
    const handlePayment = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            const token = localStorage.getItem('token');
            // Call Real Backend Endpoint
            await axios.post('http://localhost:5000/api/payment/process', {
                amount: 2999,
                currency: 'USD',
                source: 'card_tok_visa' // Dummy token for backend internal logic
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setProcessing(false);
            setStatus('success');
        } catch (error) {
            setProcessing(false);
            alert('Payment Processing Failed. Please try again.');
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar />
                <div className="flex-grow flex items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-green-100 max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🎉</div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Payment Successful!</h2>
                        <p className="text-slate-600 mb-6">You now have access to Premium Consultations and Advanced Analytics.</p>
                        <button onClick={() => window.location.href = '/dashboard'} className="btn-primary w-full">Go to Dashboard</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <div className="flex-grow flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 max-w-md w-full">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        💳 Secure Checkout
                    </h2>

                    <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex justify-between font-bold text-slate-800 mb-1">
                            <span>Premium Plan</span>
                            <span>$29.99</span>
                        </div>
                        <p className="text-xs text-slate-500">Unlocks AI Tools, Unlimited Consultations, and Advanced Stats.</p>
                    </div>

                    <form onSubmit={handlePayment} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Card Number</label>
                            <input type="text" placeholder="0000 0000 0000 0000" className="input-field" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Expiry</label>
                                <input type="text" placeholder="MM/YY" className="input-field" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">CVC</label>
                                <input type="text" placeholder="123" className="input-field" required />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={processing}
                            className={`w-full py-3 rounded-xl font-bold text-white transition-all ${processing ? 'bg-slate-400' : 'bg-slate-900 hover:bg-slate-800 shadow-lg'}`}
                        >
                            {processing ? 'Processing...' : 'Pay $29.99'}
                        </button>
                    </form>

                    <div className="mt-4 flex items-center justify-center gap-4 opacity-50 grayscale">
                        <span className="text-xs font-bold">POWERED BY</span>
                        <span className="font-bold italic">STRIPE</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
