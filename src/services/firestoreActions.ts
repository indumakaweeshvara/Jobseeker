// Centralized Firestore CRUD Operations for JobSeeker App
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Job, User, Application } from '../types';

// ============================================
// Jobs Collection Operations
// ============================================

/**
 * Fetch all jobs from Firestore
 */
export const getAllJobs = async (): Promise<Job[]> => {
    try {
        const jobsSnapshot = await getDocs(collection(db, 'Jobs'));
        return jobsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Job[];
    } catch (error) {
        console.error('Error fetching jobs:', error);
        throw error;
    }
};

/**
 * Fetch a single job by ID
 */
export const getJobById = async (jobId: string): Promise<Job | null> => {
    try {
        const jobDoc = await getDoc(doc(db, 'Jobs', jobId));
        if (jobDoc.exists()) {
            return { id: jobDoc.id, ...jobDoc.data() } as Job;
        }
        return null;
    } catch (error) {
        console.error('Error fetching job:', error);
        throw error;
    }
};

// ============================================
// Applications Collection Operations
// ============================================

/**
 * Apply for a job (Create Application)
 */
export const applyForJob = async (
    userId: string,
    job: Job
): Promise<string> => {
    try {
        const applicationData = {
            userId,
            jobId: job.id,
            jobTitle: job.title,
            company: job.company,
            location: job.location,
            salary: job.salary,
            status: 'Pending',
            appliedAt: new Date().toISOString(),
        };

        const docRef = await addDoc(collection(db, 'Applications'), applicationData);
        return docRef.id;
    } catch (error) {
        console.error('Error applying for job:', error);
        throw error;
    }
};

/**
 * Fetch all applications for a user
 */
export const getApplicationsByUser = async (userId: string): Promise<Application[]> => {
    try {
        const q = query(
            collection(db, 'Applications'),
            where('userId', '==', userId)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Application[];
    } catch (error) {
        console.error('Error fetching applications:', error);
        throw error;
    }
};

/**
 * Check if user has already applied to a job
 */
export const hasAppliedToJob = async (userId: string, jobId: string): Promise<boolean> => {
    try {
        const q = query(
            collection(db, 'Applications'),
            where('userId', '==', userId),
            where('jobId', '==', jobId)
        );
        const snapshot = await getDocs(q);
        return !snapshot.empty;
    } catch (error) {
        console.error('Error checking application status:', error);
        throw error;
    }
};

/**
 * Withdraw/Delete an application
 */
export const withdrawApplication = async (applicationId: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, 'Applications', applicationId));
    } catch (error) {
        console.error('Error withdrawing application:', error);
        throw error;
    }
};

// ============================================
// Users Collection Operations
// ============================================

/**
 * Get user profile data
 */
export const getUserProfile = async (userId: string): Promise<User | null> => {
    try {
        const userDoc = await getDoc(doc(db, 'Users', userId));
        if (userDoc.exists()) {
            return userDoc.data() as User;
        }
        return null;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
    userId: string,
    data: Partial<User>
): Promise<void> => {
    try {
        await updateDoc(doc(db, 'Users', userId), data);
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};
