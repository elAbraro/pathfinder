const mongoose = require('mongoose');
const { syncData } = require('./services/dataSync');
const DataSnapshot = require('./models/dataSnapshot');
const InteractionLog = require('./models/interactionLog');
const University = require('./models/university');
require('dotenv').config();

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // 1. Test Data Sync
        console.log('Testing Data Sync...');
        const version = await syncData();

        const snapshot = await DataSnapshot.findOne({ version });
        if (snapshot && snapshot.status === 'Published') {
            console.log('✅ Data Snapshot created and published.');
        } else {
            console.error('❌ Data Snapshot failed.');
        }

        const uniCount = await University.countDocuments();
        console.log(`✅ Live University Count: ${uniCount}`);

        // 2. Test Interaction Logging (Simulated)
        // We can't easily simulate the route call here without starting the server, 
        // but we can verify the model works.
        console.log('Testing Interaction Log Model...');
        await InteractionLog.create({
            student: new mongoose.Types.ObjectId(), // Fake ID
            action: 'View',
            targetId: new mongoose.Types.ObjectId(),
            targetName: 'Test University',
            dataVersion: version
        });

        const log = await InteractionLog.findOne({ action: 'View' });
        if (log) {
            console.log('✅ Interaction Log created.');
        } else {
            console.error('❌ Interaction Log failed.');
        }

        mongoose.connection.close();
    } catch (error) {
        console.error(error);
        mongoose.connection.close();
    }
};

verify();
