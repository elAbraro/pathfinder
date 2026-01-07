const mongoose = require('mongoose');
require('dotenv').config();
const Student = require('./models/student');

async function audit() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('--- Database Audit ---');

        const allUsers = await Student.find({}, 'email role profile.firstName');
        console.log(`Total Records: ${allUsers.length}`);

        const roleCounts = {};
        allUsers.forEach(u => {
            roleCounts[u.role] = (roleCounts[u.role] || 0) + 1;
            console.log(`- ${u.email} [${u.role}]`);
        });

        console.log('\nRole Breakdown:');
        console.log(JSON.stringify(roleCounts, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

audit();
