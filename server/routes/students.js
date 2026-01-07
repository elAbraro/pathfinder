const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Student = require('../models/student');
const auth = require('../middleware/auth');

// Register/Sync Student (Called after Firebase Register)
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, firstName, lastName, role, counselorProfile } = req.body;

    // Check if exists
    let student = await Student.findOne({ email });
    if (student) {
      return res.status(400).json({ message: 'User already exists' });
    }

    student = new Student({
      email,
      password: 'firebase-managed', // Dummy password
      role: role || 'student',
      profile: { firstName, lastName },
      counselorProfile: role === 'consultant' ? counselorProfile : undefined
    });

    await student.save();

    res.status(201).json({
      student: {
        id: student._id,
        email: student.email,
        firstName: student.profile.firstName,
        lastName: student.profile.lastName
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login (Actually just fetching profile)
// We removed password check because valid Token means authenticated
router.post('/login', async (req, res) => {
  // This endpoint might strictly be for returning the profile if the token is valid
  // But since `auth` middleware runs before this? No, usually login is public.
  // BUT with Firebase, the client has the token. So they call `getProfile` directly.
  // So this endpoint might be redundant or just a "sync" check.
  // let's keep it simple: Client calls /profile directly after login.
  res.json({ message: "Use /profile to get user data with token" });
});

// Get Current Student Profile
router.get('/profile', auth, async (req, res) => {
  try {
    // req.student is guaranteed by auth middleware now
    const student = await Student.findById(req.student._id)
      .select('-password')
      .populate('shortlistedUniversities.university');

    res.json(student);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Student Profile
router.put('/profile', auth, async (req, res) => {
  try {
    const updates = req.body;
    let student;

    if (!req.student) {
      // Self-Healing: If student missing from DB but has valid Token (req.firebaseUser)
      // Create the student now.
      if (req.firebaseUser) {
        console.log('Creating missing student record for:', req.firebaseUser.email);
        student = new Student({
          email: req.firebaseUser.email,
          password: 'firebase-managed',
          ...updates
        });
        await student.save();
        return res.json(student);
      }
      return res.status(404).json({ message: 'Student not found and no token data available' });
    }

    // Normal Update
    student = await Student.findByIdAndUpdate(
      req.student._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(student);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Add University to Shortlist
router.post('/shortlist/:universityId', auth, async (req, res) => {
  try {
    if (!req.student) return res.status(404).json({ message: 'User not found' });

    const { universityId } = req.params;
    const { fitScore, notes } = req.body;

    const student = await Student.findById(req.student._id);

    const alreadyShortlisted = student.shortlistedUniversities.some(
      item => item.university.toString() === universityId
    );

    if (alreadyShortlisted) {
      return res.status(400).json({ message: 'University already shortlisted' });
    }

    student.shortlistedUniversities.push({
      university: universityId,
      fitScore,
      notes
    });

    await student.save();
    await student.populate('shortlistedUniversities.university');

    // Create Notifications
    try {
      const Notification = require('../models/notification');
      const Consultation = require('../models/consultation');
      const uniName = student.shortlistedUniversities.find(i => i.university && i.university._id.toString() === universityId)?.university?.name || 'University';

      // Notify Student
      await Notification.create({
        recipient: req.student._id,
        title: 'University Shortlisted',
        message: `Added ${uniName} to your shortlist.`,
        type: 'System',
        relatedLink: `/search`
      });

      // Notify Counselors who have had sessions with this student
      const sessions = await Consultation.find({ student: req.student._id, status: 'Scheduled' });
      const consultantIds = [...new Set(sessions.map(s => s.consultant.toString()))];

      for (const cId of consultantIds) {
        await Notification.create({
          recipient: cId,
          title: 'Student Shortlisted University',
          message: `${req.student.profile.firstName} shortlisted ${uniName}.`,
          type: 'Application',
          relatedLink: `/application/${req.student._id}`
        });
      }
    } catch (err) { console.error('Notify error:', err); }

    res.json(student.shortlistedUniversities);
  } catch (error) {
    console.error('Add shortlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove University from Shortlist
router.delete('/shortlist/:universityId', auth, async (req, res) => {
  try {
    if (!req.student) return res.status(404).json({ message: 'User not found' });

    const { universityId } = req.params;

    const student = await Student.findById(req.student._id);
    student.shortlistedUniversities = student.shortlistedUniversities.filter(
      item => item.university.toString() !== universityId
    );

    await student.save();
    res.json(student.shortlistedUniversities);
  } catch (error) {
    console.error('Remove shortlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Application Status
router.put('/shortlist/:universityId/status', auth, async (req, res) => {
  try {
    if (!req.student) return res.status(404).json({ message: 'User not found' });

    const { universityId } = req.params;
    const { applicationStatus, notes } = req.body;

    // Populate student with university details
    const student = await Student.findById(req.student._id).populate('shortlistedUniversities.university');
    if (!student) return res.status(404).json({ message: 'User not found' });

    console.log('Update Status Probe:', { universityId, shortlistCount: student.shortlistedUniversities.length });

    // Debug log each item's university field
    student.shortlistedUniversities.forEach((s, i) => {
      console.log(`Item ${i}:`, s.university);
    });

    const shortlistItem = student.shortlistedUniversities.find(
      item => item.university && (item.university._id ? item.university._id.toString() === universityId : item.university.toString() === universityId)
    );

    if (!shortlistItem) {
      return res.status(404).json({ message: 'University not in shortlist' });
    }

    shortlistItem.applicationStatus = applicationStatus;
    if (notes) shortlistItem.notes = notes;

    // Notification Trigger
    try {
      const Notification = require('../models/notification');
      await Notification.create({
        recipient: req.student._id,
        title: 'Status Updated',
        message: `Application status for ${shortlistItem.university.name} updated to ${applicationStatus}.`,
        type: 'Application',
        actionLink: `/application/${shortlistItem.university._id}`
      });
    } catch (err) { console.error('Notification creation error:', err); }

    await student.save();
    // The student object is already populated, so no need to re-populate here.

    res.json(student.shortlistedUniversities);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Timeline Step
router.put('/shortlist/:universityId/timeline', auth, async (req, res) => {
  try {
    if (!req.student) return res.status(404).json({ message: 'User not found' });

    const { universityId } = req.params;
    const { stepName, status, dueDate, completedDate } = req.body;

    const student = await Student.findById(req.student._id);
    const shortlistItem = student.shortlistedUniversities.find(
      item => item.university.toString() === universityId
    );

    if (!shortlistItem) {
      return res.status(404).json({ message: 'University not in shortlist' });
    }

    // Find or create the timeline step
    const timelineItem = shortlistItem.myTimeline.find(t => t.stepName === stepName);
    if (timelineItem) {
      if (status) timelineItem.status = status;
      if (dueDate) timelineItem.dueDate = dueDate;
      if (completedDate) timelineItem.completedDate = completedDate;
    } else {
      shortlistItem.myTimeline.push({ stepName, status, dueDate, completedDate });
    }

    await student.save();
    // Re-populate to return full object if needed, or just send back the specific updated list
    await student.populate('shortlistedUniversities.university');

    res.json(student.shortlistedUniversities);
  } catch (error) {
    console.error('Update timeline error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Checklist Item
router.put('/shortlist/:universityId/checklist', auth, async (req, res) => {
  try {
    if (!req.student) return res.status(404).json({ message: 'User not found' });

    const { universityId } = req.params;
    const { documentName, status, fileUrl } = req.body;

    const student = await Student.findById(req.student._id);
    const shortlistItem = student.shortlistedUniversities.find(
      item => item.university.toString() === universityId
    );

    if (!shortlistItem) {
      return res.status(404).json({ message: 'University not in shortlist' });
    }

    const checklistItem = shortlistItem.myChecklist.find(c => c.documentName === documentName);
    if (checklistItem) {
      if (status) checklistItem.status = status;
      if (fileUrl) checklistItem.fileUrl = fileUrl;
      checklistItem.lastUpdated = Date.now();
    } else {
      shortlistItem.myChecklist.push({
        documentName,
        status,
        fileUrl,
        lastUpdated: Date.now()
      });
    }

    await student.save();
    await student.populate('shortlistedUniversities.university');

    res.json(student.shortlistedUniversities);
  } catch (error) {
    console.error('Update checklist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all students (for counselors/admin)
router.get('/all', auth, async (req, res) => {
  try {
    if (req.student.role === 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const students = await Student.find({ role: 'student' })
      .select('profile email academicHistory interests')
      .sort({ 'profile.lastName': 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Log Student Interaction
router.post('/interaction', auth, async (req, res) => {
  try {
    const { action, targetId, targetName, category, metadata } = req.body;
    const InteractionLog = require('../models/interactionLog');

    const log = new InteractionLog({
      student: req.student._id,
      action,
      targetId,
      targetName,
      dataVersion: 1,
      metadata: { ...metadata, category }
    });

    await log.save();
    res.status(201).json({ message: 'Interaction logged' });
  } catch (error) {
    console.error('Interaction log error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Student Analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const InteractionLog = require('../models/interactionLog');
    const student = await Student.findById(req.student._id).populate('shortlistedUniversities.university');

    if (!student) return res.status(404).json({ message: 'Student not found' });

    // 1. Application Progress
    const appProgress = {
      'Not Started': 0,
      'In Progress': 0,
      'Submitted': 0,
      'Accepted': 0,
      'Rejected': 0,
      'Waitlisted': 0
    };
    student.shortlistedUniversities.forEach(item => {
      if (appProgress[item.applicationStatus] !== undefined) {
        appProgress[item.applicationStatus]++;
      }
    });

    // 2. Test Score Trends
    const scoreTrends = student.testScoreHistory || [];

    // 3. Resource Engagement
    const logs = await InteractionLog.find({ student: req.student._id });
    const engagement = {};
    logs.forEach(log => {
      const cat = log.metadata?.category || 'General';
      engagement[cat] = (engagement[cat] || 0) + 1;
    });

    res.json({
      appProgress,
      scoreTrends,
      engagement,
      isPremium: student.isPremium,
      premiumSince: student.premiumSince
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
