const mongoose = require('mongoose');
const dotenv = require('dotenv');
const University = require('./models/university');

dotenv.config();

const checkDuplicates = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const name = "University of Glasgow";
        const unis = await University.find({ name: { $regex: 'Glasgow', $options: 'i' } });

        console.log(`Found ${unis.length} universities matching 'Glasgow':`);
        unis.forEach(u => {
            console.log(`- [${u._id}] ${u.name}`);
        });

        if (unis.length > 1) {
            console.log("\n⚠️ DUPLICATES DETECTED! Students might have shortlisted different copies.");
        } else {
            console.log("\n✅ No obvious duplicates found by name.");
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkDuplicates();
