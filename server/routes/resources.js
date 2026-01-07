const express = require('express');
const router = express.Router();
const Resource = require('../models/resource');

// Get all resources with filtering
router.get('/', async (req, res) => {
    try {
        const { category, type, search } = req.query;
        let query = {};

        if (category && category !== 'All') {
            query.category = category;
        }
        if (type && type !== 'All') {
            query.type = type;
        }
        if (search) {
            query.$text = { $search: search };
        }

        let resources = await Resource.find(query);

        // Seed if empty (One-time auto-fix)
        if (resources.length === 0 && !search && (!category || category === 'All')) {
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
            resources = await Resource.find(query);
        }

        // Apply sorting after potential seeding
        resources = resources.sort((a, b) => b.createdAt - a.createdAt);

        res.json(resources);
    } catch (error) {
        console.error('Get resources error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a resource (For admin or seeding)
router.post('/', async (req, res) => {
    try {
        const resource = new Resource(req.body);
        await resource.save();
        res.status(201).json(resource);
    } catch (error) {
        console.error('Create resource error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a resource
router.delete('/:id', async (req, res) => {
    try {
        await Resource.findByIdAndDelete(req.params.id);
        res.json({ message: 'Resource deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
