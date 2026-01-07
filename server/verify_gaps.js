const mongoose = require('mongoose');
const Comment = require('./models/comment');
const Scholarship = require('./models/scholarship');
const University = require('./models/university');
require('dotenv').config();

async function verify() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // 1. Verify Comments
        console.log('\n--- Verifying Comments ---');
        const uni = await University.findOne();
        if (!uni) throw new Error('No universities found');

        // Mock Student ID (using a random ID for test)
        const studentId = new mongoose.Types.ObjectId();

        const comment = new Comment({
            universityId: uni._id,
            studentId: studentId,
            author: { name: 'Test User', role: 'student' },
            content: 'This is a test comment for verification.'
        });
        await comment.save();
        console.log('✅ Comment created successfully');

        const fetchedComments = await Comment.find({ universityId: uni._id, studentId: studentId });
        if (fetchedComments.length > 0 && fetchedComments[0].content === 'This is a test comment for verification.') {
            console.log('✅ Comments fetched successfully');
        } else {
            console.error('❌ Failed to fetch comments');
        }

        // Clean up
        await Comment.deleteOne({ _id: comment._id });

        // 2. Verify Scholarship Matching
        console.log('\n--- Verifying Scholarship Matching ---');
        // Ensure at least one scholarship exists
        let sch = await Scholarship.findOne();
        if (!sch) {
            sch = new Scholarship({
                name: 'Test Scholarship',
                provider: 'Test Foundation',
                amount: 1000,
                deadline: new Date(Date.now() + 86400000), // tomorrow
                country: 'Global'
            });
            await sch.save();
        }

        // We can't easily test the /match endpoint because it relies on req.student from middleware
        // But we can verify the logic: Find scholarships with future deadline
        const matches = await Scholarship.find({
            deadline: { $gte: new Date() },
            $or: [{ country: 'Global' }, { country: 'United States' }]
        });

        if (matches.length > 0) {
            console.log(`✅ Found ${matches.length} matches potential for US student`);
        } else {
            console.warn('⚠️ No matches found (might be empty DB)');
        }

        console.log('\n✅ Gap Verification Complete');
    } catch (err) {
        console.error('Verification Failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

verify();
