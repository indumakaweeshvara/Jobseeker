/**
 * Application Constants for JobSeeker App
 * @module constants/app
 */

/** Application metadata */
export const APP_INFO = {
    name: 'JobSeeker',
    version: '1.0.0',
    description: 'Your Dream Career Awaits',
    author: 'ITS 2127 Student',
} as const;

/** Navigation route names */
export const ROUTES = {
    LOGIN: 'Login',
    SIGNUP: 'Signup',
    MAIN_TABS: 'MainTabs',
    HOME: 'Home',
    HOME_SCREEN: 'HomeScreen',
    JOB_DETAIL: 'JobDetail',
    APPLIED_JOBS: 'AppliedJobs',
    PROFILE: 'Profile',
} as const;

/** Firestore collection names */
export const COLLECTIONS = {
    USERS: 'Users',
    JOBS: 'Jobs',
    APPLICATIONS: 'Applications',
} as const;

/** Application status types */
export const APPLICATION_STATUS = {
    PENDING: 'Pending',
    ACCEPTED: 'Accepted',
    REJECTED: 'Rejected',
} as const;

/** Job categories */
export const JOB_CATEGORIES = [
    'All',
    'Design',
    'Development',
    'Marketing',
    'Finance',
    'Engineering',
    'Sales',
] as const;

/** Error messages */
export const ERROR_MESSAGES = {
    GENERIC: 'Something went wrong. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
    AUTH_FAILED: 'Authentication failed. Please try again.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    WEAK_PASSWORD: 'Password must be at least 6 characters.',
    NO_USER: 'No user found with this email.',
} as const;

export type AppRoutes = typeof ROUTES[keyof typeof ROUTES];
export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];
