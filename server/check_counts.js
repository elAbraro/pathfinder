const mongoose = require('mongoose');
const Student = require('./models/student');
const University = require('./models/university');
require('dotenv').config();

async function checkCounts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const total = await Student.countDocuments({});
        const students = await Student.countDocuments({ role: 'student' });
        const consultants = await Student.countDocuments({ role: 'consultant' });
        const admins = await Student.countDocuments({ role: 'admin' });
        const superusers = await Student.countDocuments({ role: 'superuser' });

        console.log('\n--- Precise Counts ---');
        console.log('Total Users:', total);
        console.log('Students:', students);
        console.log('Consultants:', consultants);
        console.log('Admins:', admins);
        console.log('Superusers:', superusers);

        const all = await Student.find({}, 'email role');
        console.log('\n--- User List ---');
        all.forEach(u => console.log(`${u.email}: ${u.role}`));

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkCounts();
