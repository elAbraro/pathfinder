import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success', duration = 3000) => {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type, duration }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} {...toast} onRemove={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem = ({ id, message, type, duration, onRemove }) => {
    const [isExiting, setIsExiting] = React.useState(false);

    React.useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                handleRemove();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration]);

    const handleRemove = () => {
        setIsExiting(true);
        setTimeout(() => {
            onRemove(id);
        }, 300); // Wait for exit animation
    };

    const icons = {
        success: <CheckCircle className="w-5 h-5" />,
        error: <AlertCircle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />
    };

    const styles = {
        success: "bg-green-50 border-green-200 text-green-800",
        error: "bg-red-50 border-red-200 text-red-800",
        info: "bg-blue-50 border-blue-200 text-blue-800"
    };

    return (
        <div
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm transform transition-all duration-300 ease-in-out ${styles[type]} ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100 animate-slide-in'}`}
            style={{ minWidth: '300px', maxWidth: '400px' }}
        >
            <div className="shrink-0">{icons[type]}</div>
            <p className="flex-grow text-sm font-medium">{message}</p>
            <button onClick={handleRemove} className="p-1 hover:bg-black/5 rounded-full transition-colors shrink-0">
                <X size={16} />
            </button>
        </div>
    );
};
