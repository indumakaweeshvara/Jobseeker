// Firebase Configuration for JobSeeker App
// ⚠️ IMPORTANT: Replace these with your own Firebase config values
// Go to Firebase Console -> Project Settings -> Your apps -> Config

import { initializeApp, FirebaseApp } from 'firebase/app';
import { initializeAuth, Auth } from 'firebase/auth';
// @ts-ignore - getReactNativePersistence is exported but not typed in firebase/auth
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyAfJxbL9L5f_wbIekfOVx9sv-XwTJS70Cw",
    authDomain: "assignment-8-bb726.firebaseapp.com",
    projectId: "assignment-8-bb726",
    storageBucket: "assignment-8-bb726.firebasestorage.app",
    messagingSenderId: "44029384291",
    appId: "1:44029384291:web:edbdaf04d6ff7c1b6d4a56",
    measurementId: "G-JKN291DERN"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth: Auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db: Firestore = getFirestore(app);

// Initialize Storage for profile photos
const storage: FirebaseStorage = getStorage(app);

export { auth, db, storage };
export default app;
