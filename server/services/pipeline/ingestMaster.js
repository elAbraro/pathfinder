const axios = require('axios');

const fetchMasterData = async () => {
    try {
        console.log('Fetching master list from Hipo...');
        const response = await axios.get('https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json');

        // Global Coverage: No longer filtering by specific countries.
        // Returning all domains from the list.

        return response.data.map(u => ({
            name: u.name,
            country: u.country,
            domains: u.domains,
            web_pages: u.web_pages,
            alpha_two_code: u.alpha_two_code
        }));
    } catch (error) {
        console.error('Master data ingestion failed:', error);
        return [];
    }
};

module.exports = { fetchMasterData };
