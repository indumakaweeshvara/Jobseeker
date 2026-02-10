// Firebase Configuration for JobSeeker App

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

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

// Initialize Auth (using getAuth which works on all platforms)
const auth: Auth = getAuth(app);

// Initialize Firestore
const db: Firestore = getFirestore(app);

// Initialize Storage for profile photos
const storage: FirebaseStorage = getStorage(app);

export { auth, db, storage };
export default app;
