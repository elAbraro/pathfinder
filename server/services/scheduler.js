const cron = require('node-cron');
const { syncData } = require('./dataSync');

const initScheduler = () => {
    console.log('Initializing Scheduler...');

    // Schedule Data Sync: Run every Sunday at midnight
    cron.schedule('0 0 * * 0', async () => {
        console.log('Running scheduled data sync...');
        try {
            await syncData();
        } catch (error) {
            console.error('Scheduled sync failed:', error);
        }
    });

    console.log('Scheduler active: Data Sync set for Sunday 00:00');
};

module.exports = { initScheduler };
