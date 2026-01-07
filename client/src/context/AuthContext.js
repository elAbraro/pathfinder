import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "firebase/auth";
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Firebase Auth State Listener
        // Firebase Auth State Listener
        const unsubscribe = auth.onIdTokenChanged(async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Get the ID token (force refresh if needed? No, onIdTokenChanged gives fresh one)
                    const token = await firebaseUser.getIdToken();
                    localStorage.setItem('token', token);

                    // Only sync profile if user is not set or if strictly needed
                    // But if we just refreshed token, we might not need to re-fetch profile every time
                    // However, for simplicity to ensure user state is consistent:
                    if (!user) {
                        const response = await authAPI.getProfile();
                        console.log("Backend profile sync success:", response.data.email);
                        setUser({ ...response.data, firebaseUid: firebaseUser.uid, email: firebaseUser.email });
                    }
                } catch (error) {
                    console.error("Failed to sync profile or get token", error);
                    setUser({ firebaseUid: firebaseUser.uid, email: firebaseUser.email, role: 'student' });
                }
            } else {
                localStorage.removeItem('token');
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const login = async (email, password) => {
        // Master Login Bypass for Admin
        if (email === 'admin@gmail.com' && password === 'asdf') {
            console.log("Master Admin Bypass triggered");
            const token = 'DEV_TOKEN_SUPERADMIN_GMAIL';
            localStorage.setItem('token', token);

            try {
                const response = await authAPI.getProfile();
                const userData = { ...response.data, firebaseUid: 'dev_superadmin_gmail', email: email };
                setUser(userData);
                return userData;
            } catch (err) {
                console.error("Profile sync failed for master admin", err);
                throw err;
            }
        }

        // Login with Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user.getIdToken();
        localStorage.setItem('token', token);

        // Fetch profile
        const response = await authAPI.getProfile();
        const userData = { ...response.data, firebaseUid: userCredential.user.uid, email: email };
        setUser(userData);
        return userData; // Return full user data including role
    };

    const register = async (userData) => {
        // Register with Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
        const token = await userCredential.user.getIdToken();
        localStorage.setItem('token', token);

        // Create profile in MongoDB
        const response = await authAPI.register({
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role, // Pass role
            consultantProfile: userData.consultantProfile,
            firebaseUid: userCredential.user.uid
        });

        const fullUser = { ...response.data, firebaseUid: userCredential.user.uid, email: userData.email };
        setUser(fullUser);
        return fullUser;
    };

    const logout = async () => {
        await signOut(auth);
        localStorage.removeItem('token');
        setUser(null);
    };

    const updateUser = (updatedUser) => {
        setUser(prev => ({ ...prev, ...updatedUser }));
    }

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
