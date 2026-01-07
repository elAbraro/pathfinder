const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const University = require('./models/university');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI;

// Helper to generate realistic data for missing fields
const generateDetails = (name, country, rank) => {
    const types = ['General', 'Tech', 'Business', 'Med'];
    const type = name.includes('Tech') || name.includes('Institute') ? 'Tech' :
        name.includes('Business') || name.includes('Management') ? 'Business' :
            name.includes('Medical') || name.includes('Health') ? 'Med' : 'General';

    const majorsBase = ['Computer Science', 'Business', 'Psychology', 'Economics', 'Engineering'];
    const majors = [...majorsBase];
    if (type === 'Tech') majors.push('Robotics', 'Data Science', 'AI');
    if (type === 'Med') majors.push('Medicine', 'Nursing', 'Public Health');

    // Tuition based on country
    let minTuition = 10000;
    let currency = 'USD';
    if (country === 'USA') minTuition = 40000 + Math.random() * 20000;
    if (country === 'UK') { minTuition = 20000 + Math.random() * 15000; currency = 'GBP'; }
    if (country === 'Canada') { minTuition = 25000 + Math.random() * 15000; currency = 'CAD'; }

    return {
        city: 'Unknown', // Hard to scrape without dedicated API
        type,
        ranking: { global: rank, national: Math.floor(rank / 5) + 1 },
        description: `${name} is a leading institution in ${country}, known for its excellence in ${type.toLowerCase()} education.`,
        images: ['https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80'], // Placeholder
        academics: {
            majorsOffered: majors,
            coursesHighlight: [{ name: 'Global Perspectives', description: 'Core module', duration: '1 Semester' }],
            facultyStrength: Math.floor(1000 + Math.random() * 2000),
            studentTeacherRatio: '15:1'
        },
        admissions: {
            acceptanceRate: Math.max(0.05, 0.8 - (rank / 200)),
            requirements: {
                minGPA: 3.0,
                testScores: {
                    sat: { min: 1200, max: 1600 },
                    ielts: { min: 6.5 },
                    toefl: { min: 85 }
                },
                applicationDeadlines: [
                    { term: 'Fall 2025', deadline: new Date('2025-01-15'), year: 2025 }
                ]
            }
        },
        financials: {
            tuitionFee: { international: { min: Math.floor(minTuition), max: Math.floor(minTuition * 1.2), currency } },
            financialAidAvailable: true,
            scholarships: [{ name: 'Merit Scholarship', amount: 5000, criteria: 'GPA > 3.8' }]
        },
        campusLife: {
            campusType: 'Urban',
            facilities: ['Library', 'Labs', 'Dorms'],
            clubs: ['Debate', 'Coding', 'Sports']
        },
        outcomes: {
            employmentRate: 0.9,
            averageSalary: 60000
        },
        testimonials: [],
        contact: {
            website: `https://www.${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.edu`,
            email: 'admissions@university.edu',
            phone: '+1 234 567 890'
        }
    };
};

const scrapeUniversities = async () => {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');

        // 1. Fetch Real List from GitHub (Reliable Source)
        console.log('Fetching university list...');
        const response = await axios.get('https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json');
        const allUniversities = response.data;

        // Filter for top countries to keep it relevant
        const targetCountries = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Singapore', 'China', 'Japan'];
        let relevantUniversities = allUniversities.filter(u => targetCountries.includes(u.country));

        // Limit to 150 to avoid overwhelming DB
        relevantUniversities = relevantUniversities.slice(0, 150);

        console.log(`Found ${relevantUniversities.length} universities. Processing...`);

        await University.deleteMany({});
        console.log('Cleared old data.');

        const universityDocs = relevantUniversities.map((uni, index) => {
            const details = generateDetails(uni.name, uni.country, index + 1);
            return {
                name: uni.name,
                country: uni.country,
                ...details,
                contact: {
                    ...details.contact,
                    website: uni.web_pages[0] || details.contact.website
                }
            };
        });

        await University.insertMany(universityDocs);
        console.log('Successfully seeded universities!');

        mongoose.connection.close();
    } catch (error) {
        console.error('Scraping failed:', error);
        mongoose.connection.close();
    }
};

scrapeUniversities();
