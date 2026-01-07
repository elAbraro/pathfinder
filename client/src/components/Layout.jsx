import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#18191a] flex flex-col transition-colors duration-300">
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            <footer className="bg-white dark:bg-[#242526] border-t border-slate-200 dark:border-[#3e4042] py-8 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 dark:text-[#b0b3b8] text-sm">
                    &copy; {new Date().getFullYear()} PathFinder. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Layout;
