const mongoose = require('mongoose');
const Resource = require('./models/resource');
require('dotenv').config();

const seedResources = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        await Resource.deleteMany({});
        console.log('Cleared Resources');

        const seedData = [
            { title: 'IELTS Official Practice Materials', category: 'IELTS', type: 'Article', url: 'https://www.ielts.org/for-test-takers/sample-test-questions', description: 'Official sample test questions from the IELTS organization.' },
            { title: 'SAT Practice Tests by College Board', category: 'SAT', type: 'PDF', url: 'https://satsuite.collegeboard.org/sat/practice-preparation/practice-tests', description: 'Full-length practice tests for the generated SAT.' },
            { title: 'U.S. Student Visa Guide (F-1)', category: 'Visa', type: 'Video', url: 'https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html', description: 'Official U.S. Department of State guide for student visas.' },
            { title: 'Common App Essay Prompts & Tips', category: 'Essay', type: 'Article', url: 'https://www.commonapp.org/blog/2024-2025-common-app-essay-prompts', description: 'Breakdown of the current essay prompts with writing advice.' },
            { title: 'GRE General Test Prep', category: 'GRE', type: 'PDF', url: 'https://www.ets.org/gre/test-takers/general-test/prepare.html', description: 'Official preparation materials from ETS.' },
            { title: 'TOEFL iBT Free Practice Test', category: 'TOEFL', type: 'Article', url: 'https://www.ets.org/toefl/test-takers/ibt/prepare/practice-tests.html', description: 'Free full-length practice test to simulate the exam experience.' },
            { title: 'UK Student Visa (Tier 4) Application', category: 'Visa', type: 'Article', url: 'https://www.gov.uk/student-visa', description: 'Official UK government guidance for international students.' }
        ];

        await Resource.insertMany(seedData);
        console.log('✅ Real Resources Inserted');
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

seedResources();
