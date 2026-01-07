const mongoose = require('mongoose');
const Student = require('./models/student');
const Consultation = require('./models/consultation');
require('dotenv').config();

const createUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // Create Counselor
        const counselorEmail = 'counselor@test.com';
        await Student.deleteOne({ email: counselorEmail });

        const counselor = new Student({
            email: counselorEmail,
            password: 'dev_password', // won't be used with dev token
            role: 'consultant', // Correct role name based on schema checks (schema says 'consultant')
            profile: {
                firstName: 'Test',
                lastName: 'Counselor',
                dateOfBirth: new Date(),
                nationality: 'US'
            },
            counselorProfile: {
                specialization: 'General Admission',
                experienceYears: 5,
                bio: 'Experienced counselor.'
            }
        });
        await counselor.save();
        console.log('Counselor created/reset:', counselor._id);

        // Create Student
        const studentEmail = 'student@test.com';
        await Student.deleteOne({ email: studentEmail });

        const student = new Student({
            email: studentEmail,
            password: 'dev_password',
            role: 'student',
            profile: {
                firstName: 'Test',
                lastName: 'Student',
                dateOfBirth: new Date(),
                nationality: 'UK'
            }
        });
        await student.save();
        console.log('Student created/reset:', student._id);

        // Create a scheduled consultation
        await Consultation.deleteMany({ student: student._id });
        const consultation = new Consultation({
            student: student._id,
            consultant: counselor._id,
            expertName: 'Test Counselor',
            expertRole: 'Senior Counselor',
            date: new Date(Date.now() + 86400000), // Tomorrow
            status: 'Scheduled',
            topic: 'General Inquiry'
        });
        await consultation.save();
        console.log('Consultation created:', consultation._id);

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
};

createUsers();
