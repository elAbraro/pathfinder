import React from 'react';

const FitScoreBadge = ({ score }) => {
    if (score === undefined || score === null) return null;

    let colorClass = 'bg-slate-100 text-slate-600';
    if (score >= 80) colorClass = 'bg-green-100 text-green-700 border-green-200';
    else if (score >= 60) colorClass = 'bg-blue-100 text-blue-700 border-blue-200';
    else if (score >= 40) colorClass = 'bg-yellow-100 text-yellow-700 border-yellow-200';
    else colorClass = 'bg-red-100 text-red-700 border-red-200';

    return (
        <div className={`px-3 py-1 rounded-full border text-sm font-bold flex items-center gap-1 ${colorClass}`}>
            <span className="text-xs font-medium uppercase tracking-wider">Fit Score</span>
            <span>{score}%</span>
        </div>
    );
};

export default FitScoreBadge;
