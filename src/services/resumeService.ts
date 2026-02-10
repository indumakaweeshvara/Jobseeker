import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { storage, db } from './firebaseConfig';

export const uploadResume = async (
    userId: string,
    uri: string,
    fileName: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
    try {
        // 1. Fetch the file blob
        const response = await fetch(uri);
        const blob = await response.blob();

        // 2. Create storage reference
        const resumeRef = ref(storage, `resumes/${userId}/${fileName}`);

        // 3. Upload
        await uploadBytes(resumeRef, blob);

        // 4. Get download URL
        const downloadURL = await getDownloadURL(resumeRef);

        // 5. Update Firestore user document
        const userRef = doc(db, 'Users', userId);
        await updateDoc(userRef, {
            resumeUrl: downloadURL,
            resumeName: fileName,
        });

        return { success: true, url: downloadURL };
    } catch (error: any) {
        console.error('Error uploading resume:', error);
        return { success: false, error: error.message };
    }
};

export const deleteResume = async (
    userId: string,
    resumeName: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        const resumeRef = ref(storage, `resumes/${userId}/${resumeName}`);
        await deleteObject(resumeRef);

        const userRef = doc(db, 'Users', userId);
        await updateDoc(userRef, {
            resumeUrl: null,
            resumeName: null,
        });

        return { success: true };
    } catch (error: any) {
        console.error('Error deleting resume:', error);
        return { success: false, error: error.message };
    }
};
