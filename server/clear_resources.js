const mongoose = require('mongoose');
const Resource = require('./models/resource'); // Adjust path
require('dotenv').config();

const clearResources = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
        const deleted = await Resource.deleteMany({});
        console.log(`Deleted ${deleted.deletedCount} resources. App will re-seed on next load.`);
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

clearResources();
