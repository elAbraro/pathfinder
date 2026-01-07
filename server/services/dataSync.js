const University = require('../models/university');
const DataSnapshot = require('../models/dataSnapshot');
const { fetchMasterData } = require('./pipeline/ingestMaster');
const { fetchResearchMetrics } = require('./pipeline/ingestResearch');
const { getRankings } = require('./pipeline/ingestRankings');
const { normalizeUniversityData } = require('./pipeline/normalize');

const syncData = async () => {
    console.log('🚀 Starting Advanced Data Pipeline...');
    const startTime = Date.now();

    try {
        // 1. Ingest Master Data (Hipo)
        console.log('Phase 1: Ingesting Master Data...');
        const masterList = await fetchMasterData();
        console.log(`> Fetched ${masterList.length} universities.`);

        // 2. Process in Batches (to respect API limits)
        console.log('Phase 2: Enriching data (Research & Rankings)...');
        const enrichedData = [];
        const BATCH_SIZE = 10;

        // For demo speed, limit to 20 universities total
        const subset = masterList.slice(0, 20);

        for (let i = 0; i < subset.length; i += BATCH_SIZE) {
            const batch = subset.slice(i, i + BATCH_SIZE);
            const promises = batch.map(async (uni) => {
                // Parallel fetch for each uni in batch
                const research = await fetchResearchMetrics(uni.name);
                const rankings = getRankings(uni.name, uni.country, research);

                return normalizeUniversityData(uni, research, rankings);
            });

            const results = await Promise.all(promises);
            enrichedData.push(...results);
            console.log(`> Processed ${Math.min(i + BATCH_SIZE, subset.length)}/${subset.length}`);
        }

        // 3. Create Snapshot (Caching/Version Control)
        console.log('Phase 3: Creating Snapshot...');
        const lastSnapshot = await DataSnapshot.findOne().sort({ version: -1 });
        const newVersion = (lastSnapshot?.version || 0) + 1;

        const snapshot = new DataSnapshot({
            version: newVersion,
            status: 'Published', // Auto-publish for demo
            data: enrichedData,
            changeLog: `Pipeline run with ${enrichedData.length} universities. Source: Multi-origin.`
        });
        await snapshot.save();

        // 4. Update Live Database (Wipe & Replace Strategy)
        console.log('Phase 4: Updating Live Database...');
        await University.deleteMany({});
        await University.insertMany(enrichedData);

        const duration = (Date.now() - startTime) / 1000;
        console.log(`✅ Pipeline completed in ${duration}s. Version ${newVersion} live.`);

        return newVersion;

    } catch (error) {
        console.error('❌ Pipeline Failed:', error);
        throw error;
    }
};

module.exports = { syncData };
