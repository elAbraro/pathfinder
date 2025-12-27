const getRankings = (universityName, country, researchMetrics = null) => {
    // We simulate realistic rankings based on country, name prestige, and REAL research metrics from OpenAlex
    let baseRank = 800;
    const nameLower = universityName.toLowerCase();

    // 1. Research-based Bonus (OpenAlex proxy)
    if (researchMetrics) {
        // High citations and h-index significantly boost rank
        const citationsBoost = Math.min(Math.floor(researchMetrics.citations / 2000), 100);
        const hIndexBoost = Math.min(researchMetrics.hIndex * 5, 150);
        baseRank -= (citationsBoost + hIndexBoost);
    }

    // 2. Keyword/Prestige Bonus
    if (nameLower.includes('technology') || nameLower.includes('tech')) baseRank -= 30;
    if (nameLower.includes('institute')) baseRank -= 20;
    if (nameLower.includes('university of')) baseRank -= 10;

    // Ivy league / top keywords
    if (nameLower.includes('harvard') || nameLower.includes('oxford') || nameLower.includes('stanford') || nameLower.includes('mit')) {
        baseRank = 20;
    }

    // 3. Country Tier Bonus
    if (country === 'United States' || country === 'United Kingdom') baseRank -= 50;

    // 4. Random variation for realism
    const variation = Math.floor(Math.random() * 50);
    const finalRank = Math.max(1, baseRank + variation);

    return [
        { provider: 'Simulated Global', rank: Math.floor(finalRank), year: 2025 },
        { provider: 'OpenAlex Proxy', rank: Math.floor(finalRank + (Math.random() * 20 - 10)), year: 2025 }
    ];
};

module.exports = { getRankings };
