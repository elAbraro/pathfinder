import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Award, DollarSign, ExternalLink, Globe } from 'lucide-react';
import FitScoreBadge from './FitScoreBadge';

const UniversityCard = ({ university, fitScore }) => {
    const [imgError, setImgError] = useState(false);

    // Fallback image logic
    const handleImgError = () => {
        setImgError(true);
    };

    // Use specific image if available and valid, else generic fallback
    const displayImage = !imgError && university.images && university.images[0]
        ? university.images[0]
        : "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80";

    return (
        <div className="card group h-full flex flex-col hover:-translate-y-1">
            <div className="relative h-48 overflow-hidden bg-slate-100">
                <img
                    src={displayImage}
                    alt={university.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={handleImgError}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
            </div>

            <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
                        {university.ranking?.global && university.ranking.global !== 9999 ? `#${university.ranking.global} Global` : 'Unranked'}
                    </span>
                    {fitScore !== undefined && (
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${fitScore >= 80 ? 'bg-green-100 text-green-700' :
                                fitScore >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {fitScore}% Match
                        </span>
                    )}
                </div>

                <h3 className="font-bold text-slate-900 text-lg mb-1 line-clamp-1">{university.name}</h3>
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
                    <MapPin size={14} />
                    {university.city ? `${university.city}, ` : ''}{university.country}
                </div>

                <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Tuition</span>
                        <span className="font-medium text-slate-900">
                            {university.financials?.tuitionFee?.international?.min
                                ? `$${university.financials.tuitionFee.international.min.toLocaleString()}`
                                : university.tuition?.undergraduate
                                    ? `$${university.tuition.undergraduate.toLocaleString()}`
                                    : 'N/A'}
                        </span>
                    </div>
                    {university.contact?.website && (
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Website</span>
                            <a href={university.contact.website} target="_blank" rel="noreferrer" className="font-medium text-blue-600 hover:underline truncate max-w-[150px]">
                                {new URL(university.contact.website).hostname}
                            </a>
                        </div>
                    )}
                </div>

                <div className="mt-auto grid grid-cols-5 gap-3">
                    <Link
                        to={`/university/${university._id}`}
                        className="btn-primary col-span-5 text-center text-sm shadow-indigo-500/20"
                    >
                        View Details
                    </Link>
                    {university.contact?.website && (
                        <a
                            href={university.contact.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 rounded-lg transition-all border border-slate-200 group/link"
                            title="Visit Website"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Globe size={18} className="group-hover/link:scale-110 transition-transform" />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UniversityCard;
