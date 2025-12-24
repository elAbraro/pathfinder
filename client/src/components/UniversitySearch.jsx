import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const UniversitySearch = ({ initialSearch = '', onSearch, className = '' }) => {
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSearch) {
            onSearch(searchTerm);
        } else {
            navigate(`/search?q=${searchTerm}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={`max-w-xl mx-auto bg-white p-2 rounded-xl shadow-lg flex gap-2 ${className}`}>
            <div className="flex-grow flex items-center px-3 gap-2">
                <Search className="text-slate-400" />
                <input
                    type="text"
                    placeholder="Search by name, country, or major..."
                    className="w-full py-3 outline-none text-slate-800"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button type="submit" className="btn-primary py-3 px-6">
                Search
            </button>
        </form>
    );
};

export default UniversitySearch;