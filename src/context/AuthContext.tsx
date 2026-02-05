import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';
import { AuthContextType, User, AuthResult } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [userData, setUserData] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                // Fetch user data from Firestore
                const userDoc = await getDoc(doc(db, 'Users', currentUser.uid));
                if (userDoc.exists()) {
                    setUserData(userDoc.data() as User);
                }
            } else {
                setUser(null);
                setUserData(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Signup function
    const signup = async (email: string, password: string, name: string, phone: string): Promise<AuthResult> => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const newUser = userCredential.user;

            // Create user document in Firestore
            await setDoc(doc(db, 'Users', newUser.uid), {
                uid: newUser.uid,
                name: name,
                email: email,
                phone: phone,
                profilePic: '',
                createdAt: new Date().toISOString(),
            });

            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    // Login function
    const login = async (email: string, password: string): Promise<AuthResult> => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    // Logout function
    const logout = async (): Promise<AuthResult> => {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    // Refresh user data
    const refreshUserData = async (): Promise<void> => {
        if (user) {
            const userDoc = await getDoc(doc(db, 'Users', user.uid));
            if (userDoc.exists()) {
                setUserData(userDoc.data() as User);
            }
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                userData,
                loading,
                signup,
                login,
                logout,
                refreshUserData,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
