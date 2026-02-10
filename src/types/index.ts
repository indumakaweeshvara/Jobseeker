import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

// ============================================
// Firebase Models
// ============================================

/**
 * Represents a job listing in the application
 * @interface Job
 */
export interface Job {
    /** Unique identifier for the job */
    id: string;
    /** Job position title */
    title: string;
    /** Company offering the position */
    company: string;
    /** Job location (city/country or remote) */
    location: string;
    /** Salary range or amount */
    salary: string;
    /** Detailed job description */
    description: string;
    /** Job category (Development, Design, etc.) */
    category?: string;
    /** Job type (Full-time, Part-time, Remote, etc.) */
    type?: string;
    /** Experience level (Junior, Mid-Level, Senior, Entry) */
    level?: string;
    /** List of job requirements */
    requirements?: string[];
    /** List of job responsibilities */
    responsibilities?: string[];
    /** List of job benefits */
    benefits?: string[];
    /** Date when job was posted (ISO string) */
    postedAt?: string;
    /** URL to company logo image */
    companyLogo?: string;
    /** Legacy: Date when job was posted */
    postedDate?: string;
}

/**
 * Represents a registered user in the application
 * @interface User
 */
export interface User {
    /** Firebase user unique identifier */
    uid: string;
    /** User's full name */
    name: string;
    /** User's email address */
    email: string;
    /** User's phone number */
    phone: string;
    /** URL to user's profile picture */
    profilePic: string;
    /** URL to user's resume PDF */
    resumeUrl?: string;
    /** Filename of the uploaded resume */
    resumeName?: string;
    /** List of user skills */
    skills?: string[];
    /** Account creation timestamp */
    createdAt: string;
}

/**
 * Represents a job application submitted by a user
 * @interface Application
 */
export interface Application {
    /** Unique application identifier */
    id: string;
    /** Reference to the applied job */
    jobId: string;
    /** Reference to the applicant user */
    userId: string;
    /** The job details */
    job: Job;
    /** Current status of the application */
    status: 'Pending' | 'Reviewing' | 'Interviewing' | 'Decision' | 'Accepted' | 'Rejected';
    /** Date when application was submitted */
    appliedDate: string;
}

// ============================================
// Navigation Types
// ============================================

export type RootStackParamList = {
    Login: undefined;
    Signup: undefined;
    MainTabs: undefined;
};

export type MainTabParamList = {
    Home: undefined;
    Saved: undefined;
    AppliedJobs: undefined;
    Profile: undefined;
};

export type HomeStackParamList = {
    HomeScreen: undefined;
    JobDetail: { jobId: string };
};

// Navigation Props
export type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
export type SignupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Signup'>;
export type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'HomeScreen'>;
export type JobDetailScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'JobDetail'>;
export type JobDetailScreenRouteProp = RouteProp<HomeStackParamList, 'JobDetail'>;

export interface HomeScreenProps {
    navigation: HomeScreenNavigationProp;
}

export interface JobDetailScreenProps {
    route: JobDetailScreenRouteProp;
    navigation: JobDetailScreenNavigationProp;
}

// ============================================
// Component Props
// ============================================

export interface CustomButtonProps {
    title: string;
    onPress: () => void;
    type?: 'primary' | 'secondary' | 'outline' | 'gradient';
    loading?: boolean;
    disabled?: boolean;
    style?: any;
    textStyle?: any;
}

export interface InputFieldProps {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    icon?: string;
    error?: string;
    editable?: boolean;
    multiline?: boolean;
    numberOfLines?: number;
}

export interface JobCardProps {
    job: Job;
    onPress: () => void;
    showStatus?: boolean;
    status?: 'Pending' | 'Accepted' | 'Rejected';
}

// ============================================
// Auth Context Types
// ============================================

export interface AuthContextType {
    user: any | null; // Firebase User type
    userData: User | null;
    loading: boolean;
    signup: (email: string, password: string, name: string, phone: string) => Promise<AuthResult>;
    login: (email: string, password: string) => Promise<AuthResult>;
    logout: () => Promise<AuthResult>;
    refreshUserData: () => Promise<void>;
}

export interface AuthResult {
    success: boolean;
    error?: string;
}

// ============================================
// Seed Data Types
// ============================================

export interface SeedResult {
    success: boolean;
    error?: string;
}
