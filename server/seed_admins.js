const mongoose = require('mongoose');
const Student = require('./models/student');
require('dotenv').config();

const createAdminUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const adminEmail = 'admin@gmail.com';
        const adminPassword = 'asdf'; // Note: In a real app, use bcrypt or have Firebase handle this

        // Delete existing if it exists
        await Student.deleteOne({ email: adminEmail });

        const superuser = new Student({
            email: adminEmail,
            password: adminPassword,
            role: 'superuser',
            profile: {
                firstName: 'Super',
                lastName: 'Admin'
            }
        });

        await superuser.save();
        console.log(`✅ Superuser created: ${adminEmail} with role: superuser`);
        console.log('Use password: asdf to login (if bypass is not used)');

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
};

createAdminUsers();
