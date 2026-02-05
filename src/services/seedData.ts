// Sample Jobs Data Seeder
// Run this once to add sample jobs to Firestore

import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Job, SeedResult } from '../types';

const sampleJobs: Job[] = [
    {
        id: 'job1',
        title: 'Software Engineer',
        company: 'Tech Solutions Lanka',
        location: 'Colombo, Sri Lanka',
        salary: 'LKR 150,000 - 200,000',
        description: 'We are looking for a skilled Software Engineer to join our dynamic team. You will be responsible for developing high-quality applications, collaborating with cross-functional teams, and contributing to the full software development lifecycle.\n\nRequirements:\n• 2+ years of experience in software development\n• Proficiency in JavaScript, React, or similar technologies\n• Strong problem-solving skills\n• Excellent communication abilities',
    },
    {
        id: 'job2',
        title: 'UI/UX Designer',
        company: 'Creative Hub',
        location: 'Kandy, Sri Lanka',
        salary: 'LKR 100,000 - 150,000',
        description: 'Join our creative team as a UI/UX Designer. You will create beautiful, intuitive designs for web and mobile applications.\n\nRequirements:\n• Experience with Figma, Adobe XD, or similar tools\n• Strong portfolio showcasing design work\n• Understanding of user-centered design principles\n• Ability to work in a fast-paced environment',
    },
    {
        id: 'job3',
        title: 'Mobile App Developer',
        company: 'AppWorks Sri Lanka',
        location: 'Galle, Sri Lanka',
        salary: 'LKR 120,000 - 180,000',
        description: 'We need a talented Mobile App Developer to build cross-platform mobile applications using React Native.\n\nRequirements:\n• 1+ years of React Native experience\n• Knowledge of mobile app architecture\n• Experience with REST APIs\n• Published apps on App Store or Play Store is a plus',
    },
    {
        id: 'job4',
        title: 'Data Analyst',
        company: 'Analytics Pro',
        location: 'Colombo, Sri Lanka',
        salary: 'LKR 130,000 - 160,000',
        description: 'Looking for a Data Analyst to help us make data-driven decisions. You will analyze large datasets and create insightful reports.\n\nRequirements:\n• Proficiency in SQL and Excel\n• Experience with data visualization tools\n• Strong analytical and problem-solving skills\n• Knowledge of Python or R is a plus',
    },
    {
        id: 'job5',
        title: 'DevOps Engineer',
        company: 'CloudTech Lanka',
        location: 'Remote',
        salary: 'LKR 200,000 - 280,000',
        description: 'Join us as a DevOps Engineer to build and maintain our cloud infrastructure.\n\nRequirements:\n• Experience with AWS, Azure, or GCP\n• Knowledge of Docker and Kubernetes\n• CI/CD pipeline experience\n• Strong scripting skills (Bash, Python)',
    },
    {
        id: 'job6',
        title: 'Frontend Developer',
        company: 'WebCraft',
        location: 'Colombo, Sri Lanka',
        salary: 'LKR 100,000 - 140,000',
        description: 'We are hiring a Frontend Developer to create responsive and engaging web interfaces.\n\nRequirements:\n• Strong HTML, CSS, and JavaScript skills\n• Experience with React or Vue.js\n• Knowledge of responsive design\n• Eye for detail and design aesthetics',
    },
    {
        id: 'job7',
        title: 'Project Manager',
        company: 'Digital Dynamics',
        location: 'Colombo, Sri Lanka',
        salary: 'LKR 180,000 - 250,000',
        description: 'Lead our project teams to deliver successful software projects on time and within budget.\n\nRequirements:\n• 3+ years of project management experience\n• PMP or Agile certification preferred\n• Excellent leadership and communication skills\n• Experience with project management tools',
    },
    {
        id: 'job8',
        title: 'Quality Assurance Engineer',
        company: 'QualityFirst',
        location: 'Negombo, Sri Lanka',
        salary: 'LKR 90,000 - 120,000',
        description: 'Ensure the quality of our software products through comprehensive testing.\n\nRequirements:\n• Experience in manual and automated testing\n• Knowledge of testing frameworks\n• Attention to detail\n• Strong documentation skills',
    },
];

export const seedJobs = async (): Promise<SeedResult> => {
    try {
        const jobsRef = collection(db, 'Jobs');

        for (const job of sampleJobs) {
            await setDoc(doc(jobsRef, job.id), {
                ...job,
                createdAt: new Date().toISOString(),
            });
            console.log(`Added job: ${job.title}`);
        }

        console.log('All sample jobs added successfully!');
        return { success: true };
    } catch (error: any) {
        console.error('Error seeding jobs:', error);
        return { success: false, error: error.message };
    }
};

export default sampleJobs;
