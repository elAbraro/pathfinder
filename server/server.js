const express = require('express'); // Server entry point
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

const { initScheduler } = require('./services/scheduler');

// Initialize Scheduler
initScheduler();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploads Static Folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/universities', require('./routes/universities'));
app.use('/api/students', require('./routes/students'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/scholarships', require('./routes/scholarships'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/consultations', require('./routes/consultations'));
app.use('/api/ai', require('./routes/ai')); // AI Tools
app.use('/api/collaboration', require('./routes/collaboration')); // Mentorship/Collab
app.use('/api/comments', require('./routes/comments')); // App Comments
app.use('/api/payment', require('./routes/payment')); // Real Payment
app.use('/api/upload', require('./routes/upload')); // Real File Upload
app.use('/api/admin', require('./routes/admin')); // Admin Dashboard
app.use('/api/experts', require('./routes/experts')); // Experts List

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'PathFinder API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

// Export the app (needed for Firebase Cloud Functions)
exports.app = app;

// Only start the server if running locally (not imported as a module)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}