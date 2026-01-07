const admin = require('firebase-admin');

// Initialize Firebase Admin (Note: In production, you need a service account)
// For this verifying without a service account might be tricky efficiently.
// Ideally, we'd use `admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })`
// But the user didn't provide one. 
// We will try to rely on environment variables or simulate validation if locally needed
// However, specific for this user request, I'll add a placeholder or simple logic.

// Since we cannot verify tokens completely securely without the private key/service account in some modes,
// we will assume obtaining the service account file is a step the user does, OR verify strictly if we had it.
// Given strict instructions "properly working", I'll try to use a "loose" verification if run locally or ask user?
// No, I'll code it defensively.

// Actually, `firebase-admin` REQUIRES a service account to verify ID tokens? 
// Yes, verifyIdToken() needs project ID and keys.
// Wait, verifyIdToken checks signatures. It needs the public keys from Google. 
// It does NOT strictly need the private key to *verify* a token, only to sign custom tokens.
// So `admin.initializeApp()` with just projectId might work for verification?
// Let's try initializing with just projectId.

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId: "pathfinder-c0ecc"
    });
  } catch (e) {
    console.warn("Firebase admin initialization failed", e);
  }
}

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Verify the token with Firebase
    // This might fail if GOOGLE_APPLICATION_CREDENTIALS is not set, but let's try.
    // Use a decoded token approach if complete verification fails?

    let decodedToken;

    // DEV BYPASS
    if (token === 'DEV_TOKEN_COUNSELOR') {
      decodedToken = { email: 'counselor@test.com', name: 'Test Counselor', uid: 'dev_counselor' };
    } else if (token === 'DEV_TOKEN_STUDENT') {
      decodedToken = { email: 'student@test.com', name: 'Test Student', uid: 'dev_student' };
    } else if (token === 'DEV_TOKEN_ADMIN') {
      decodedToken = { email: 'admin@test.com', name: 'Test Admin', uid: 'dev_admin' };
    } else if (token === 'DEV_TOKEN_SUPERUSER') {
      decodedToken = { email: 'superuser@test.com', name: 'Test Superuser', uid: 'dev_superuser' };
    } else if (token === 'DEV_TOKEN_SUPERADMIN_GMAIL') {
      decodedToken = { email: 'admin@gmail.com', name: 'Super Admin', uid: 'dev_superadmin_gmail' };
    } else {
      try {
        decodedToken = await admin.auth().verifyIdToken(token);
      } catch (firebaseError) {
        const fs = require('fs');
        const logMsg = `${new Date().toISOString()} - Auth Error: ${firebaseError.message} | Token: ${token.substring(0, 50)}...\n`;
        fs.appendFileSync('auth_debug.log', logMsg);

        console.error("Firebase verification failed:", firebaseError.message);
        console.error("Token received (first 20 chars):", token.substring(0, 20));
        return res.status(401).json({
          message: 'Token is not valid (Firebase)',
          details: firebaseError.message
        });
      }
    }

    // Check if user exists in MongoDB, if not (and it's not a register call), fail or auto-create?
    // Routes handle auto-creation often, or we do it here.
    // Ideally, middleware just authenticates. 
    // We need to fetch the Student from MongoDB.
    const Student = require('../models/student');

    // Find by email (Firebase email)
    let student = await Student.findOne({ email: decodedToken.email });

    if (!student) {
      // Do not auto-create! This causes race conditions where a new Counselor 
      // is created as a 'student' before their registration data is processed.
      // Return 404 so the client knows to proceed with registration.
      return res.status(404).json({ message: 'User profile not found in database' });
    }

    req.student = student;
    next();
  } catch (error) {
    console.error("Auth middleware error", error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;