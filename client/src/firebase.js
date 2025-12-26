// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDvsObRYGnc9xOusNpe8JleAjVfUo6HxoM",
    authDomain: "pathfinder-c0ecc.firebaseapp.com",
    projectId: "pathfinder-c0ecc",
    storageBucket: "pathfinder-c0ecc.firebasestorage.app",
    messagingSenderId: "725047942586",
    appId: "1:725047942586:web:6ffafd392efa4cbc735183",
    measurementId: "G-G7K8QSMY1M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { auth, app, analytics };
