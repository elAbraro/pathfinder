const mongoose = require('mongoose');
const Resource = require('./models/resource');
require('dotenv').config();

const realResources = [
    // IELTS Resources
    {
        title: 'IELTS Official Practice Materials',
        type: 'Practice Test',
        category: 'IELTS',
        url: 'https://www.ielts.org/for-test-takers/sample-test-questions',
        description: 'Free sample test questions for Listening, Reading, Writing and Speaking from the official IELTS organization.',
        isPremium: false
    },
    {
        title: 'IELTS Liz - Free Lessons & Tips',
        type: 'Article',
        category: 'IELTS',
        url: 'https://ieltsliz.com/',
        description: 'Comprehensive lessons, tips, and model answers for high band scores by an experienced examiner.',
        isPremium: false
    },
    {
        title: 'IELTS Speaking Band 9 Sample',
        type: 'Video',
        category: 'IELTS',
        url: 'https://www.youtube.com/watch?v=sRFEVaxC93s',
        description: 'Watch a Band 9 Speaking test interview to understand what is required for top scores.',
        isPremium: false
    },
    {
        title: 'Cambridge IELTS 16 Academic PDF',
        type: 'PDF',
        category: 'IELTS',
        url: 'https://www.cambridge.org/us/cambridgeenglish/catalog/cambridge-english-exams-ielts/ielts-16',
        description: 'Authentic examination papers from Cambridge Assessment English.',
        isPremium: true
    },

    // SAT Resources
    {
        title: 'Official SAT Practice by Khan Academy',
        type: 'Guide',
        category: 'SAT',
        url: 'https://www.khanacademy.org/test-prep/sat',
        description: 'Free, personalized practice for the SAT with thousands of interactive questions and video lessons.',
        isPremium: false
    },
    {
        title: 'CollegeBoard SAT Practice Tests',
        type: 'Practice Test',
        category: 'SAT',
        url: 'https://satsuite.collegeboard.org/sat/practice/full-length-practice-tests',
        description: 'Downloadable full-length practice tests from the creators of the SAT.',
        isPremium: false
    },
    {
        title: 'Scalar Learning - SAT Math Review',
        type: 'Video',
        category: 'SAT',
        url: 'https://www.youtube.com/c/ScalarLearning',
        description: 'In-depth math tutorials and live test solving sessions for SAT Math.',
        isPremium: false
    },

    // GRE Resources
    {
        title: 'ETS GRE General Test Prep',
        type: 'Guide',
        category: 'GRE',
        url: 'https://www.ets.org/gre/test-takers/general-test/prepare.html',
        description: 'Official test preparation materials from ETS, including POWERPREP practice tests.',
        isPremium: false
    },
    {
        title: 'GregMat - GRE Strategies',
        type: 'Video',
        category: 'GRE',
        url: 'https://www.youtube.com/@GregMat',
        description: 'Highly acclaimed strategies for verbal and quant sections of the GRE.',
        isPremium: false
    },
    {
        title: 'Magoosh GRE Vocabulary Flashcards',
        type: 'Article',
        category: 'GRE',
        url: 'https://gre.magoosh.com/flashcards/vocabulary',
        description: 'Master the 1000 most important GRE words with these free flashcards.',
        isPremium: false
    },

    // GMAT Resources
    {
        title: 'GMAT Official Starter Kit',
        type: 'Practice Test',
        category: 'GMAT',
        url: 'https://www.mba.com/exam-prep/gmat-official-starter-kit-practice-exams-1-2-free',
        description: 'Two full-length practice exams and practice questions from the makers of the GMAT.',
        isPremium: false
    },
    {
        title: 'GMAT Ninja - Sentence Correction',
        type: 'Video',
        category: 'GMAT',
        url: 'https://www.youtube.com/@GMATNinja',
        description: 'Expert lessons on GMAT Verbal, focusing on Sentence Correction and Critical Reasoning.',
        isPremium: false
    },

    // TOEFL Resources
    {
        title: 'ETS TOEFL Official Prep',
        type: 'Guide',
        category: 'TOEFL',
        url: 'https://www.ets.org/toefl/test-takers/ibt/prepare.html',
        description: 'Free practice tests and preparation courses from the test makers.',
        isPremium: false
    },
    {
        title: 'TST Prep - TOEFL Tips',
        type: 'Video',
        category: 'TOEFL',
        url: 'https://www.youtube.com/@TSTPrep',
        description: 'High-quality TOEFL advice and practice questions for speaking and writing.',
        isPremium: false
    },

    // Visa Resources
    {
        title: 'US Student Visa (F1) Guide',
        type: 'Article',
        category: 'Visa',
        url: 'https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html',
        description: 'Official U.S. Department of State guide on how to apply for a student visa.',
        isPremium: false
    },
    {
        title: 'UK Student Visa Overview',
        type: 'Guide',
        category: 'Visa',
        url: 'https://www.gov.uk/student-visa',
        description: 'Complete guide to documents, fees, and processing times for studying in the UK.',
        isPremium: false
    },
    {
        title: 'Canada Study Permit Guide',
        type: 'Article',
        category: 'Visa',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html',
        description: 'Official Government of Canada instructions for international students.',
        isPremium: false
    },

    // Essay / SOP
    {
        title: 'Harvard College Essay Tips',
        type: 'Article',
        category: 'Essay',
        url: 'https://college.harvard.edu/admissions/apply/first-year-applicants/application-requirements/essays',
        description: 'Advice from Harvard admissions on how to write a compelling personal statement.',
        isPremium: false
    },
    {
        title: 'Format for Statement of Purpose (SOP)',
        type: 'PDF',
        category: 'Essay',
        url: 'https://grad.berkeley.edu/admissions/apply/statement-of-purpose/',
        description: 'Guidelines and structure for writing a Statement of Purpose for graduate school.',
        isPremium: false
    }
];

const seedResources = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB for Resource Seeding');

        await Resource.deleteMany({});
        console.log('Cleared existing resources');

        await Resource.insertMany(realResources);
        console.log(`Seeded ${realResources.length} real resources successfully`);

        mongoose.connection.close();
        console.log('Connection closed');
    } catch (err) {
        console.error('Error seeding resources:', err);
    }
};

seedResources();
