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
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Get the ID token
                    const token = await firebaseUser.getIdToken();
                    localStorage.setItem('token', token);

                    // Sync with backend (create/get profile)
                    // We might need to send the token to the backend to get the user profile from MongoDB
                    const response = await authAPI.getProfile();
                    setUser({ ...response.data, firebaseUid: firebaseUser.uid, email: firebaseUser.email });
                } catch (error) {
                    console.error("Failed to sync profile", error);
                    // If profile doesn't exist (404), we might just set the basic firebase info
                    // But for now, let's assume register flow handles profile creation
                    setUser({ firebaseUid: firebaseUser.uid, email: firebaseUser.email });
                }
            } else {
                localStorage.removeItem('token');
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email, password) => {
        // Login with Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user.getIdToken();
        localStorage.setItem('token', token);

        // Fetch profile
        const response = await authAPI.getProfile();
        setUser({ ...response.data, firebaseUid: userCredential.user.uid, email: email });
        return userCredential.user;
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
            firebaseUid: userCredential.user.uid
        });

        setUser({ ...response.data, firebaseUid: userCredential.user.uid, email: userData.email });
        return userCredential.user;
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
