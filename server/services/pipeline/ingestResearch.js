const axios = require('axios');

// OpenAlex is free and doesn't require an API key for low volume, but good practice to be polite
const fetchResearchMetrics = async (universityName) => {
    try {
        // Search for the institution
        const searchUrl = `https://api.openalex.org/institutions?search=${encodeURIComponent(universityName)}`;
        const response = await axios.get(searchUrl);

        const results = response.data.results;
        if (!results || results.length === 0) return null;

        // Take the top result
        const institution = results[0];

        return {
            worksCount: institution.works_count,
            citations: institution.cited_by_count,
            hIndex: Math.floor(institution.cited_by_count / 1000), // Estimation as OpenAlex provides raw counts
            i10Index: Math.floor(institution.works_count / 10), // Rough estimation
            source: 'OpenAlex',
            lastUpdated: new Date()
        };
    } catch (error) {
        // Silent fail for individual universities to not break pipeline
        // console.error(`Research metrics failed for ${universityName}:`, error.message);
        return null;
    }
};

module.exports = { fetchResearchMetrics };
