import React from 'react';

const FitScoreDisplay = ({ score, size = 'large' }) => {
    // Score is 0-100
    const normalizedScore = Math.max(0, Math.min(100, score || 0));

    let colorClass = 'text-slate-400 stroke-slate-400';
    let bgColorClass = 'bg-slate-50';
    let text = 'N/A';

    if (score !== undefined && score !== null) {
        if (normalizedScore >= 80) {
            colorClass = 'text-green-500 stroke-green-500';
            bgColorClass = 'bg-green-50';
            text = 'Excellent Fit';
        } else if (normalizedScore >= 60) {
            colorClass = 'text-blue-500 stroke-blue-500';
            bgColorClass = 'bg-blue-50';
            text = 'Good Fit';
        } else if (normalizedScore >= 40) {
            colorClass = 'text-yellow-500 stroke-yellow-500';
            bgColorClass = 'bg-yellow-50';
            text = 'Moderate Fit';
        } else {
            colorClass = 'text-red-500 stroke-red-500';
            bgColorClass = 'bg-red-50';
            text = 'Low Fit';
        }
    }

    const radius = size === 'large' ? 40 : 20;
    const stroke = size === 'large' ? 8 : 4;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;
    const boxSize = size === 'large' ? 120 : 60;
    const viewSize = size === 'large' ? 100 : 50;

    return (
        <div className={`flex flex-col items-center ${bgColorClass} p-4 rounded-xl`}>
            <div className="relative flex items-center justify-center">
                <svg width={boxSize} height={boxSize} viewBox={`0 0 ${viewSize} ${viewSize}`} className="transform -rotate-90">
                    <circle
                        cx={viewSize / 2}
                        cy={viewSize / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={stroke}
                        fill="transparent"
                        className="text-slate-200"
                    />
                    <circle
                        cx={viewSize / 2}
                        cy={viewSize / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={stroke}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className={`${colorClass} transition-all duration-1000 ease-out`}
                        strokeLinecap="round"
                    />
                </svg>
                <div className={`absolute flex flex-col items-center justify-center inset-0 ${colorClass}`}>
                    <span className={`font-bold ${size === 'large' ? 'text-3xl' : 'text-xl'}`}>{normalizedScore}%</span>
                </div>
            </div>
            {size === 'large' && (
                <div className={`mt-2 font-medium ${colorClass} text-center`}>
                    {text}
                </div>
            )}
        </div>
    );
};

export default FitScoreDisplay;