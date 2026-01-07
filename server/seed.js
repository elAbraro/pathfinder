const mongoose = require('mongoose');
const University = require('./models/university');
require('dotenv').config();

const universityList = [
    // North America - USA
    { name: 'Massachusetts Institute of Technology (MIT)', country: 'USA', city: 'Cambridge', type: 'Tech', rank: 1, website: 'https://www.mit.edu', image: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=800&q=80' },
    { name: 'Stanford University', country: 'USA', city: 'Stanford', type: 'General', rank: 3, website: 'https://www.stanford.edu', image: 'https://images.unsplash.com/photo-1589885802227-d04b6bd9422b?auto=format&fit=crop&w=800&q=80' },
    { name: 'Harvard University', country: 'USA', city: 'Cambridge', type: 'General', rank: 4, website: 'https://www.harvard.edu', image: 'https://images.unsplash.com/photo-1622397333309-3056849bc70b?auto=format&fit=crop&w=800&q=80' },
    { name: 'California Institute of Technology (Caltech)', country: 'USA', city: 'Pasadena', type: 'Tech', rank: 6, website: 'https://www.caltech.edu', image: 'https://images.unsplash.com/photo-1590579491624-f98f36d4c763?auto=format&fit=crop&w=800&q=80' },
    { name: 'University of Chicago', country: 'USA', city: 'Chicago', type: 'General', rank: 10, website: 'https://www.uchicago.edu', image: 'https://images.unsplash.com/photo-1592657732958-947343d2ac2f?auto=format&fit=crop&w=800&q=80' },
    { name: 'University of Pennsylvania', country: 'USA', city: 'Philadelphia', type: 'General', rank: 12, website: 'https://www.upenn.edu', image: 'https://images.unsplash.com/photo-1599587422709-0d19f86422d3?auto=format&fit=crop&w=800&q=80' },
    { name: 'Princeton University', country: 'USA', city: 'Princeton', type: 'General', rank: 13, website: 'https://www.princeton.edu', image: 'https://images.unsplash.com/photo-1605370425316-568eb406977e?auto=format&fit=crop&w=800&q=80' },
    { name: 'Yale University', country: 'USA', city: 'New Haven', type: 'General', rank: 14, website: 'https://www.yale.edu', image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?auto=format&fit=crop&w=800&q=80' },
    { name: 'Cornell University', country: 'USA', city: 'Ithaca', type: 'General', rank: 15, website: 'https://www.cornell.edu', image: 'https://images.unsplash.com/photo-1563823485-6184a515c1e2?auto=format&fit=crop&w=800&q=80' },
    { name: 'Columbia University', country: 'USA', city: 'New York', type: 'General', rank: 16, website: 'https://www.columbia.edu', image: 'https://images.unsplash.com/photo-1626379555238-d62be0cf3182?auto=format&fit=crop&w=800&q=80' },
    { name: 'Johns Hopkins University', country: 'USA', city: 'Baltimore', type: 'Med', rank: 17, website: 'https://www.jhu.edu', image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80' },
    { name: 'University of Michigan-Ann Arbor', country: 'USA', city: 'Ann Arbor', type: 'General', rank: 20, website: 'https://umich.edu', image: 'https://images.unsplash.com/photo-1620397509532-6a6d669e46a9?auto=format&fit=crop&w=800&q=80' },
    { name: 'University of California, Berkeley (UCB)', country: 'USA', city: 'Berkeley', type: 'General', rank: 21, website: 'https://www.berkeley.edu', image: 'https://images.unsplash.com/photo-1622397159784-06cba3353591?auto=format&fit=crop&w=800&q=80' },
    { name: 'University of California, Los Angeles (UCLA)', country: 'USA', city: 'Los Angeles', type: 'General', rank: 25, website: 'https://www.ucla.edu', image: 'https://images.unsplash.com/photo-1610446781427-6f1707a0c102?auto=format&fit=crop&w=800&q=80' },
    { name: 'New York University (NYU)', country: 'USA', city: 'New York', type: 'General', rank: 28, website: 'https://www.nyu.edu', image: 'https://images.unsplash.com/photo-1614713568397-b30b779d0499?auto=format&fit=crop&w=800&q=80' },
    { name: 'Duke University', country: 'USA', city: 'Durham', type: 'General', rank: 30 },
    { name: 'Northwestern University', country: 'USA', city: 'Evanston', type: 'General', rank: 31 },
    { name: 'Carnegie Mellon University', country: 'USA', city: 'Pittsburgh', type: 'Tech', rank: 35 },
    { name: 'University of Texas at Austin', country: 'USA', city: 'Austin', type: 'General', rank: 40 },
    { name: 'Georgia Institute of Technology', country: 'USA', city: 'Atlanta', type: 'Tech', rank: 42 },
    { name: 'University of Washington', country: 'USA', city: 'Seattle', type: 'General', rank: 45 },
    { name: 'University of Illinois at Urbana-Champaign', country: 'USA', city: 'Champaign', type: 'Tech', rank: 48 },
    { name: 'University of North Carolina at Chapel Hill', country: 'USA', city: 'Chapel Hill', type: 'General', rank: 50 },
    { name: 'Boston University', country: 'USA', city: 'Boston', type: 'General', rank: 55 },
    { name: 'Rice University', country: 'USA', city: 'Houston', type: 'General', rank: 60 },
    { name: 'Brown University', country: 'USA', city: 'Providence', type: 'General', rank: 61 },
    { name: 'Purdue University', country: 'USA', city: 'West Lafayette', type: 'Tech', rank: 65 },
    { name: 'University of Southern California', country: 'USA', city: 'Los Angeles', type: 'General', rank: 68 },
    { name: 'Ohio State University', country: 'USA', city: 'Columbus', type: 'General', rank: 70 },
    { name: 'Pennsylvania State University', country: 'USA', city: 'University Park', type: 'General', rank: 75 },

    // North America - Canada
    { name: 'University of Toronto', country: 'Canada', city: 'Toronto', type: 'General', rank: 18, website: 'https://www.utoronto.ca', image: 'https://images.unsplash.com/photo-1594132472714-3887ae5f3088?auto=format&fit=crop&w=800&q=80' },
    { name: 'McGill University', country: 'Canada', city: 'Montreal', type: 'General', rank: 27, website: 'https://www.mcgill.ca', image: 'https://images.unsplash.com/photo-1565985226950-c6519280d468?auto=format&fit=crop&w=800&q=80' },
    { name: 'University of British Columbia', country: 'Canada', city: 'Vancouver', type: 'General', rank: 34, website: 'https://www.ubc.ca', image: 'https://images.unsplash.com/photo-1569420556209-66b97779f6a7?auto=format&fit=crop&w=800&q=80' },
    { name: 'University of Alberta', country: 'Canada', city: 'Edmonton', type: 'General', rank: 110 },
    { name: 'University of Waterloo', country: 'Canada', city: 'Waterloo', type: 'Tech', rank: 149, website: 'https://uwaterloo.ca', image: 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&w=800&q=80' },
    { name: 'Western University', country: 'Canada', city: 'London', type: 'Business', rank: 170 },
    { name: 'McMaster University', country: 'Canada', city: 'Hamilton', type: 'Med', rank: 130 },
    { name: 'University of Montreal', country: 'Canada', city: 'Montreal', type: 'General', rank: 115 },

    // UK & Europe
    { name: 'University of Oxford', country: 'UK', city: 'Oxford', type: 'General', rank: 2, website: 'https://www.ox.ac.uk', image: 'https://images.unsplash.com/photo-1582234057630-349809968853?auto=format&fit=crop&w=800&q=80' },
    { name: 'University of Cambridge', country: 'UK', city: 'Cambridge', type: 'General', rank: 5, website: 'https://www.cam.ac.uk', image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80' },
    { name: 'Imperial College London', country: 'UK', city: 'London', type: 'Tech', rank: 8, website: 'https://www.imperial.ac.uk', image: 'https://images.unsplash.com/photo-1627964645063-8a30366810a9?auto=format&fit=crop&w=800&q=80' },
    { name: 'UCL (University College London)', country: 'UK', city: 'London', type: 'General', rank: 9, website: 'https://www.ucl.ac.uk', image: 'https://images.unsplash.com/photo-1551601251-5452d2f7041a?auto=format&fit=crop&w=800&q=80' },
    { name: 'University of Edinburgh', country: 'UK', city: 'Edinburgh', type: 'General', rank: 15 },
    { name: 'University of Manchester', country: 'UK', city: 'Manchester', type: 'General', rank: 27 },
    { name: 'King\'s College London', country: 'UK', city: 'London', type: 'Med', rank: 35 },
    { name: 'London School of Economics (LSE)', country: 'UK', city: 'London', type: 'Business', rank: 45 },
    { name: 'University of Bristol', country: 'UK', city: 'Bristol', type: 'General', rank: 58 },
    { name: 'University of Warwick', country: 'UK', city: 'Coventry', type: 'Business', rank: 62 },
    { name: 'University of Glasgow', country: 'UK', city: 'Glasgow', type: 'General', rank: 73 },
    { name: 'ETH Zurich', country: 'Switzerland', city: 'Zurich', type: 'Tech', rank: 7, website: 'https://ethz.ch/en.html', image: 'https://images.unsplash.com/photo-1520638573216-978d3886e246?auto=format&fit=crop&w=800&q=80' },
    { name: 'EPFL', country: 'Switzerland', city: 'Lausanne', type: 'Tech', rank: 14 },
    { name: 'Technical University of Munich', country: 'Germany', city: 'Munich', type: 'Tech', rank: 50, website: 'https://www.tum.de/en/', image: 'https://images.unsplash.com/photo-1596484877716-e4293f01c9c7?auto=format&fit=crop&w=800&q=80' },
    { name: 'Heidelberg University', country: 'Germany', city: 'Heidelberg', type: 'Med', rank: 65 },
    { name: 'LMU Munich', country: 'Germany', city: 'Munich', type: 'General', rank: 66 },
    { name: 'University of Amsterdam', country: 'Netherlands', city: 'Amsterdam', type: 'General', rank: 60 },
    { name: 'Delft University of Technology', country: 'Netherlands', city: 'Delft', type: 'Tech', rank: 70 },
    { name: 'KU Leuven', country: 'Belgium', city: 'Leuven', type: 'General', rank: 75 },
    { name: 'Sorbonne University', country: 'France', city: 'Paris', type: 'General', rank: 80 },
    { name: 'PSL Research University', country: 'France', city: 'Paris', type: 'General', rank: 40 },

    // Asia
    { name: 'National University of Singapore (NUS)', country: 'Singapore', city: 'Singapore', type: 'General', rank: 11, website: 'https://nus.edu.sg', image: 'https://images.unsplash.com/photo-1595180028751-bb3864190c74?auto=format&fit=crop&w=800&q=80' },
    { name: 'Nanyang Technological University (NTU)', country: 'Singapore', city: 'Singapore', type: 'Tech', rank: 19 },
    { name: 'Tsinghua University', country: 'China', city: 'Beijing', type: 'Tech', rank: 12, website: 'https://www.tsinghua.edu.cn/en/', image: 'https://images.unsplash.com/photo-1599839556822-7f2820579e0a?auto=format&fit=crop&w=800&q=80' },
    { name: 'Peking University', country: 'China', city: 'Beijing', type: 'General', rank: 16 },
    { name: 'University of Hong Kong (HKU)', country: 'Hong Kong', city: 'Hong Kong', type: 'General', rank: 22 },
    { name: 'HKUST', country: 'Hong Kong', city: 'Hong Kong', type: 'Tech', rank: 34 },
    { name: 'University of Tokyo', country: 'Japan', city: 'Tokyo', type: 'General', rank: 23 },
    { name: 'Kyoto University', country: 'Japan', city: 'Kyoto', type: 'General', rank: 36 },
    { name: 'Seoul National University', country: 'South Korea', city: 'Seoul', type: 'General', rank: 37 },
    { name: 'KAIST', country: 'South Korea', city: 'Daejeon', type: 'Tech', rank: 41 },
    { name: 'Fudan University', country: 'China', city: 'Shanghai', type: 'General', rank: 34 },
    { name: 'Shanghai Jiao Tong University', country: 'China', city: 'Shanghai', type: 'Tech', rank: 46 },
    { name: 'Indian Institute of Science', country: 'India', city: 'Bangalore', type: 'Tech', rank: 155 },
    { name: 'IIT Bombay', country: 'India', city: 'Mumbai', type: 'Tech', rank: 172 },

    // Australia & NZ
    { name: 'University of Melbourne', country: 'Australia', city: 'Melbourne', type: 'General', rank: 14, website: 'https://www.unimelb.edu.au', image: 'https://images.unsplash.com/photo-1518544955749-d7c36eb9c882?auto=format&fit=crop&w=800&q=80' },
    { name: 'University of Sydney', country: 'Australia', city: 'Sydney', type: 'General', rank: 38, website: 'https://www.sydney.edu.au', image: 'https://images.unsplash.com/photo-1563539958744-8d960731a556?auto=format&fit=crop&w=800&q=80' },
    { name: 'University of New South Wales (UNSW)', country: 'Australia', city: 'Sydney', type: 'Tech', rank: 43 },
    { name: 'Australian National University', country: 'Australia', city: 'Canberra', type: 'General', rank: 30 },
    { name: 'University of Queensland', country: 'Australia', city: 'Brisbane', type: 'General', rank: 50 },
    { name: 'Monash University', country: 'Australia', city: 'Melbourne', type: 'General', rank: 57 },
    { name: 'University of Auckland', country: 'New Zealand', city: 'Auckland', type: 'General', rank: 85 }
];

// Pool of generic high-quality university images for generated universities
const campusImages = [
    'https://images.unsplash.com/photo-1592657732958-947343d2ac2f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1592233816694-84619a9d249f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1525921429624-479b6a26d84d?auto=format&fit=crop&w=800&q=80'
];

// Helper to fill data
function getMajors(type) {
    const base = ['Economics', 'Psychology', 'Environmental Science'];
    const tech = ['Computer Science', 'Data Science', 'Mechanical Engineering', 'Electrical Engineering', 'Physics', 'Mathematics', 'Robotics'];
    const business = ['BBA', 'MBA', 'Finance', 'Marketing', 'Accounting', 'International Business', 'Management Info Systems'];
    const med = ['Medicine', 'Biomedicine', 'Public Health', 'Nursing', 'Pharmacy', 'Biological Sciences'];
    const arts = ['History', 'English Literature', 'Philosophy', 'Sociology', 'Political Science', 'Fine Arts'];

    if (type === 'Tech') return [...tech, ...base, 'BBA']; // Many tech schools have BBA/Business now
    if (type === 'Business') return [...business, 'Economics', 'Statistics', 'Computer Science'];
    if (type === 'Med') return [...med, 'Chemistry', 'Biology', 'Psychology'];
    // General
    return [...base, ...tech, ...business, ...med, ...arts]; // Comprehensive has everything
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateUniversityData(baseInfo) {
    const majors = getMajors(baseInfo.type);
    const acceptanceRate = Math.max(0.04, Math.min(0.80, (baseInfo.rank / 200) + (Math.random() * 0.1))); // Rank correlates somewhat with acceptance

    // Randomize tuition based on country roughly
    let minTuition = 20000;
    let currency = 'USD';
    if (baseInfo.country === 'USA') minTuition = getRandomInt(40000, 60000);
    if (baseInfo.country === 'UK') { minTuition = getRandomInt(20000, 40000); currency = 'GBP'; }
    if (baseInfo.country === 'Canada') { minTuition = getRandomInt(30000, 50000); currency = 'CAD'; }
    if (baseInfo.country === 'Australia') { minTuition = getRandomInt(30000, 45000); currency = 'AUD'; }
    if (['Germany', 'Switzerland', 'France'].includes(baseInfo.country)) { minTuition = getRandomInt(1000, 15000); currency = 'EUR'; if (baseInfo.country === 'Switzerland') currency = 'CHF'; }

    // Assign image: use specific if provided, else random from pool
    const image = baseInfo.image || campusImages[getRandomInt(0, campusImages.length - 1)];

    // Assign website: use specific if provided, else generate generic
    const website = baseInfo.website || `http://www.${baseInfo.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.edu`;

    return {
        name: baseInfo.name,
        country: baseInfo.country,
        city: baseInfo.city,
        ranking: { global: baseInfo.rank, national: getRandomInt(1, 20) },
        description: `A prestigious ${baseInfo.type === 'General' ? 'comprehensive' : baseInfo.type.toLowerCase()}-focused university located in ${baseInfo.city}, ${baseInfo.country}. Known for excellence in teaching and research.`,
        images: [image],
        contact: {
            website: website,
            email: 'admissions@' + website.split('www.')[1],
            phone: '+1 555-0123'
        },
        academics: {
            majorsOffered: majors,
            coursesHighlight: [
                { name: 'Introduction to ' + majors[0], description: 'Foundation course', duration: '1 Semester' },
                { name: 'Advanced ' + majors[1], description: 'Specialized track', duration: '1 Year' }
            ],
            facultyStrength: getRandomInt(500, 3000),
            studentTeacherRatio: getRandomInt(3, 20) + ':1'
        },
        admissions: {
            acceptanceRate: parseFloat(acceptanceRate.toFixed(2)),
            requirements: {
                minGPA: (3.0 + (Math.random() * 1.0)).toFixed(1),
                testScores: {
                    sat: { min: getRandomInt(1200, 1500), max: 1600 },
                    ielts: { min: 6.5 + (Math.random() * 1.5) },
                    toefl: { min: 80 + getRandomInt(0, 30) }
                },
                applicationDeadlines: [
                    { term: 'Fall 2026', deadline: new Date('2025-12-01'), year: 2026 }, // Past/Closing soon depending on current date simulation
                    { term: 'Spring 2026', deadline: new Date('2026-05-15'), year: 2026 },
                    { term: 'Fall 2025', deadline: new Date('2025-01-01'), year: 2025 }
                ]
            }
        },
        financials: {
            tuitionFee: { international: { min: minTuition, max: minTuition + 5000, currency: currency } },
            financialAidAvailable: Math.random() > 0.3,
            scholarships: Math.random() > 0.5 ? [{ name: 'International Excellence Award', amount: 10000, criteria: 'Merit-based' }] : []
        },
        campusLife: {
            campusType: ['Urban', 'Suburban', 'Rural'][getRandomInt(0, 2)],
            facilities: ['Modern Library', 'Student Center', 'Sports Complex', 'Research Labs'],
            clubs: ['SGA', 'Debate Society', 'Tech Club', 'E-Sports', 'Cultural Association']
        },
        outcomes: {
            employmentRate: parseFloat((0.85 + (Math.random() * 0.14)).toFixed(2)),
            averageSalary: getRandomInt(50000, 120000)
        },
        testimonials: [
            { studentName: 'John Doe', graduationYear: 2023, major: majors[0], testimonial: 'Great experience, amazing campus life.', rating: 5 },
            { studentName: 'Jane Smith', graduationYear: 2022, major: majors[1], testimonial: 'Challenging academics but worth it.', rating: 4 }
        ]
    };
}

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        await University.deleteMany({});
        console.log('Cleared Universities');

        const universities = [];
        // Generate data for listed universities
        for (const uni of universityList) {
            universities.push(generateUniversityData(uni));
        }

        // Generative: Fill remaining to reach ~100 if list is short, or just use the list.
        // The list above is around 70. Let's add some generic ones to hit 100 if needed, or just stick to real ones.
        // User asked for "at least 100".

        const cities = ['New York', 'London', 'Berlin', 'Tokyo', 'Sydney', 'Paris', 'Toronto', 'Singapore', 'Munich', 'Seoul'];
        const types = ['Tech', 'Business', 'General', 'Med'];

        let counter = 1;
        while (universities.length < 100) {
            const city = cities[getRandomInt(0, cities.length - 1)];
            universities.push(generateUniversityData({
                name: `International University of ${city} - Campus ${counter}`,
                country: 'International', // or map city to country
                city: city,
                type: types[getRandomInt(0, types.length - 1)],
                rank: 200 + counter
            }));
            counter++;
        }

        await University.insertMany(universities);
        console.log(`Seeded ${universities.length} Universities`);

        mongoose.connection.close();
        console.log('Connection closed');
    } catch (err) {
        console.error(err);
    }
};

seedDB();
