import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

// ============================================
// Firebase Models
// ============================================

export interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    salary: string;
    description: string;
    requirements?: string[];
    responsibilities?: string[];
    benefits?: string[];
    postedDate?: string;
    type?: string; // e.g., 'full-time', 'part-time', 'contract'
}

export interface User {
    uid: string;
    name: string;
    email: string;
    phone: string;
    profilePic: string;
    createdAt: string;
}

export interface Application {
    id: string;
    jobId: string;
    userId: string;
    job: Job;
    status: 'Pending' | 'Accepted' | 'Rejected';
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
    AppliedJobs: undefined;
    Profile: undefined;
};

export type HomeStackParamList = {
    HomeScreen: undefined;
    JobDetail: { job: Job };
};

// Navigation Props
export type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
export type SignupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Signup'>;
export type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'HomeScreen'>;
export type JobDetailScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'JobDetail'>;
export type JobDetailScreenRouteProp = RouteProp<HomeStackParamList, 'JobDetail'>;

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
