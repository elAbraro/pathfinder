import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            <footer className="bg-white border-t border-slate-200 py-8">
                <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
                    &copy; {new Date().getFullYear()} PathFinder. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Layout;
