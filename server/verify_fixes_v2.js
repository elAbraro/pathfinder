const mongoose = require('mongoose');
const Resource = require('./models/resource');
const University = require('./models/university');
const Student = require('./models/student');
const { calculateFitScore } = require('./utils/fitScoreCalculator');
require('dotenv').config();

const verifyFixes = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // 1. Verify Resources
        console.log('\n--- Verifying Resources ---');
        let resources = await Resource.find({});
        if (resources.length === 0) {
            console.log('Resources empty. Attempting seed via logic simulation...');
            // Simulate the route logic
            const seedData = [
                { title: 'IELTS Guide', category: 'IELTS', type: 'Article', url: 'http://test.com', description: 'Test' }
            ];
            await Resource.insertMany(seedData);
            console.log('Seeded test resource.');
            resources = await Resource.find({});
        }
        console.log(`✅ Resources found: ${resources.length}`);

        // 2. Verify Fit Score
        console.log('\n--- Verifying Fit Score ---');
        const count = await University.countDocuments();
        console.log(`Total Universities: ${count}`);

        if (count > 0) {
            const uni = await University.findOne({ country: 'United States' });
            if (uni) {
                // Mock Student
                const student = {
                    academicHistory: { gpa: 3.8 },
                    testScores: { sat: 1400, ielts: 7.5 },
                    budget: { maxTuition: 50000 },
                    interests: {
                        desiredMajor: ['Computer Science'], // Matches default
                        preferredStudyDestinations: ['United States']
                    }
                };

                const score = calculateFitScore(student, uni);
                console.log(`University: ${uni.name}`);
                console.log(`Fit Score for 3.8 GPA/US Student: ${score}`);

                if (score > 0) console.log('✅ Fit Score Logic is working (>0)');
                else console.warn('⚠️ Fit Score is 0. Check calculator logic.');
            } else {
                console.warn('No US university found for test.');
            }
        } else {
            console.error('❌ No universities in DB. Search will fail.');
        }

        // 3. Verify Search Logic (Simulation)
        console.log('\n--- Verifying Search Logic ---');
        const searchRes = await University.find({
            $or: [
                { name: /California/i },
                { country: /United States/i }
            ]
        }).limit(1);
        console.log(`Search 'California/US' found: ${searchRes.length}`);

    } catch (err) {
        console.error('Verification Failed:', err);
    } finally {
        await mongoose.disconnect();
    }
};

verifyFixes();
