const mongoose = require('mongoose');
const University = require('./models/university');
const { fetchMasterData } = require('./services/pipeline/ingestMaster');
require('dotenv').config();

const forceIngest = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB. Fetching Master Data (this may take a moment)...');

        const rawData = await fetchMasterData();
        console.log(`Fetched ${rawData.length} universities from source.`);

        if (rawData.length < 100) {
            console.error('Data invalid or too small. Check internet connection/URL.');
            return;
        }

        console.log('Clearing existing universities...');
        await University.deleteMany({});

        console.log('Inserting new matching data...');
        // Map to Schema
        const docs = rawData.map(u => ({
            name: u.name,
            country: u.country,
            // Map web_pages to Schema's contact.website
            contact: {
                website: u.web_pages && u.web_pages.length > 0 ? u.web_pages[0] : ''
            },
            domains: u.domains,
            alpha_two_code: u.alpha_two_code,
            // Default dummy data for fields not in master list to ensure UI works
            ranking: { global: 9999 },
            images: [`https://source.unsplash.com/800x600/?university,${encodeURIComponent(u.name)}`]
        }));

        // Batch insert to avoid timeout
        const batchSize = 1000;
        for (let i = 0; i < docs.length; i += batchSize) {
            await University.insertMany(docs.slice(i, i + batchSize));
            console.log(`Inserted batch ${i} - ${i + batchSize}`);
        }

        console.log('✅ Ingestion Complete. Global database populated.');

    } catch (err) {
        console.error('Ingestion Failed:', err);
    } finally {
        await mongoose.disconnect();
    }
};

forceIngest();
