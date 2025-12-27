const express = require('express');
const router = express.Router();
const University = require('../models/university');
const Student = require('../models/student');
const auth = require('../middleware/auth');
const { calculateFitScore } = require('../utils/fitScoreCalculator');

// Get All Universities with Filters
router.get('/', async (req, res) => {
  try {
    const {
      country,
      major,
      minRanking,
      maxRanking,
      minTuition,
      maxTuition,
      search,
      page = 1,
      limit = 12
    } = req.query;

    let query = {};

    if (country) {
      query.country = new RegExp(country, 'i');
    }

    if (major) {
      query['academics.majorsOffered'] = new RegExp(major, 'i');
    }

    if (minRanking || maxRanking) {
      query['ranking.global'] = {};
      if (minRanking) query['ranking.global'].$gte = parseInt(minRanking);
      if (maxRanking) query['ranking.global'].$lte = parseInt(maxRanking);
    }

    if (minTuition || maxTuition) {
      query['financials.tuitionFee.international.min'] = {};
      if (minTuition) query['financials.tuitionFee.international.min'].$gte = parseInt(minTuition);
      if (maxTuition) query['financials.tuitionFee.international.min'].$lte = parseInt(maxTuition);
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { 'academics.majorsOffered': new RegExp(search, 'i') },
        { country: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const universities = await University.find(query)
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ 'ranking.global': 1 });

    const total = await University.countDocuments(query);

    res.json({
      universities,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      total
    });
  } catch (error) {
    console.error('Get universities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single university by ID (with Auto-Enrichment)
router.get('/:id', async (req, res) => {
  try {
    let university = await University.findById(req.params.id);

    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }

    // --- AI Enrichment Logic ---
    const needsEnrichment = !university.description ||
      university.ranking?.global === 9999 ||
      !university.tuition?.undergraduate;

    if (needsEnrichment && process.env.GEMINI_API_KEY) {
      try {
        const { enrichUniversityData } = require('../services/aiEnricher');
        const enrichedData = await enrichUniversityData(university.name, university.country);

        if (enrichedData) {
          if (enrichedData.ranking) university.ranking = enrichedData.ranking;
          if (enrichedData.tuition) university.tuition = {
            undergraduate: enrichedData.tuition.underic || enrichedData.tuition.undergraduate || 15000,
            graduate: enrichedData.tuition.graduate || 20000,
            currency: 'USD'
          };
          if (enrichedData.acceptanceRate) university.admissions.acceptanceRate = enrichedData.acceptanceRate;
          if (enrichedData.description) university.description = enrichedData.description;
          if (enrichedData.popularMajors) university.academics.popularMajors = enrichedData.popularMajors;

          await university.save();
        }
      } catch (err) {
        console.log("Enrichment skipped:", err.message);
      }
    }
    // ---------------------------

    // Log Interaction (if authenticated)
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      try {
        // Ideally use actual admin-sdk or verify logic here
        // For now, we wrap in try-catch to avoid crashing if token is invalid
        // const decodedToken = await admin.auth().verifyIdToken(token);
        // const student = await Student.findOne({ email: decodedToken.email });
        // if (student) { ... log interaction ... }
      } catch (e) {
        // Ignore logging errors on public route
      }
    }

    res.json(university);
  } catch (err) {
    console.error('Get university error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Calculate Fit Score for a University (requires authentication)
router.get('/:id/fit-score', auth, async (req, res) => {
  try {
    const university = await University.findById(req.params.id);

    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }

    const student = await Student.findById(req.student._id);
    const fitScore = calculateFitScore(student, university);

    res.json({ fitScore, university: university.name });
  } catch (error) {
    console.error('Calculate fit score error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Universities with Fit Scores (requires authentication)
router.get('/search/with-fit-scores', auth, async (req, res) => {
  try {
    if (!req.student) {
      return res.status(404).json({ message: 'Student profile not found. Please complete your profile.' });
    }
    const {
      country,
      major,
      minRanking,
      maxRanking,
      minTuition,
      maxTuition,
      limit = 12
    } = req.query;

    let query = {};

    if (country) query.country = new RegExp(country, 'i');
    if (major) query['academics.majorsOffered'] = new RegExp(major, 'i');
    if (minRanking || maxRanking) {
      query['ranking.global'] = {};
      if (minRanking) query['ranking.global'].$gte = parseInt(minRanking);
      if (maxRanking) query['ranking.global'].$lte = parseInt(maxRanking);
    }

    // Fix: Add Text Search support (copied from main search route)
    if (req.query.search) {
      const search = req.query.search;
      query.$or = [
        { name: new RegExp(search, 'i') },
        { 'academics.majorsOffered': new RegExp(search, 'i') },
        { country: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') }
      ];
    }

    // Fetch ALL matching universities to calculate fit scores globally
    // Note: In production with 10k+ unis, this needs optimized DB hooks or pre-calc.
    // For now, we fetch all matches to ensure "Best Fit" is truly the best.
    const universities = await University.find(query);
    const student = await Student.findById(req.student._id);

    const universitiesWithScores = universities.map(uni => ({
      ...uni.toObject(),
      fitScore: calculateFitScore(student, uni)
    }));

    // Sort by fit score
    universitiesWithScores.sort((a, b) => b.fitScore - a.fitScore);

    // Apply limit/pagination manually after sort
    const paginatedResults = universitiesWithScores.slice(0, parseInt(limit));

    res.json(paginatedResults);
  } catch (error) {
    console.error('Get universities with fit scores error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;