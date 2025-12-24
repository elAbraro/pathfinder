const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const fixIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');

        const collection = mongoose.connection.collection('students');
        const indexes = await collection.indexes();
        console.log('Current Indexes:', indexes);

        const userIdIndex = indexes.find(idx => idx.name === 'userId_1');
        if (userIdIndex) {
            console.log('Found offending index userId_1. Dropping it...');
            await collection.dropIndex('userId_1');
            console.log('✅ Dropped userId_1 index successfully.');
        } else {
            console.log('ℹ️ userId_1 index not found.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

fixIndexes();
