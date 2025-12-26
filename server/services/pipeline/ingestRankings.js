const getRankings = (universityName, country) => {
    // In a real production system, this would scrape or hit paid APIs (QS, THE).
    // Here we simulate realistic rankings based on country and name prestige.

    // Simple heuristic for demo purposes:
    let baseRank = 500;
    const nameLower = universityName.toLowerCase();

    // Boost for famous keywords
    if (nameLower.includes('technology') || nameLower.includes('tech')) baseRank -= 50;
    if (nameLower.includes('institute')) baseRank -= 30;
    if (nameLower.includes('university of')) baseRank -= 20;

    // Boost for top countries
    if (country === 'United States' || country === 'United Kingdom') baseRank -= 100;

    // Random variation
    const variation = Math.floor(Math.random() * 100);
    const qsRank = Math.max(1, baseRank + variation);
    const theRank = Math.max(1, baseRank + variation + (Math.random() * 50 - 25));
    const arwuRank = Math.max(1, baseRank + variation + (Math.random() * 50 - 25));

    return [
        { provider: 'QS', rank: Math.floor(qsRank), year: 2025 },
        { provider: 'THE', rank: Math.floor(theRank), year: 2025 },
        { provider: 'ARWU', rank: Math.floor(arwuRank), year: 2024 },
        { provider: 'Simulated', rank: Math.floor((qsRank + theRank + arwuRank) / 3), year: 2025 }
    ];
};

module.exports = { getRankings };
