import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, setDoc, getDocs, query, where, collection } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { COLORS, SIZES } from '../theme/colors';
import CustomButton from '../components/CustomButton';
import { useAuth } from '../context/AuthContext';
import { JobDetailScreenNavigationProp, JobDetailScreenRouteProp, Job } from '../types';

interface JobDetailScreenProps {
    route: JobDetailScreenRouteProp;
    navigation: JobDetailScreenNavigationProp;
}

const JobDetailScreen: React.FC<JobDetailScreenProps> = ({ route, navigation }) => {
    const { job } = route.params;
    const { user } = useAuth();
    const [hasApplied, setHasApplied] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);

    useEffect(() => {
        checkApplicationStatus();
    }, []);

    const checkApplicationStatus = async (): Promise<void> => {
        try {
            const applicationsRef = collection(db, 'Applications');
            const q = query(
                applicationsRef,
                where('userId', '==', user?.uid),
                where('jobId', '==', job.id)
            );
            const snapshot = await getDocs(q);
            setHasApplied(!snapshot.empty);
        } catch (error) {
            console.error('Error checking application status:', error);
        } finally {
            setCheckingStatus(false);
        }
    };

    const handleApply = async (): Promise<void> => {
        if (hasApplied) {
            Alert.alert('Already Applied', 'You have already applied for this job.');
            return;
        }

        Alert.alert(
            'Apply for Job',
            `Are you sure you want to apply for ${job.title} at ${job.company}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Apply',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const appId = `${user?.uid}_${job.id}_${Date.now()}`;
                            await setDoc(doc(db, 'Applications', appId), {
                                appId: appId,
                                jobId: job.id,
                                userId: user?.uid,
                                jobTitle: job.title,
                                company: job.company,
                                location: job.location,
                                salary: job.salary,
                                status: 'Pending',
                                appliedAt: new Date().toISOString(),
                            });
                            setHasApplied(true);
                            Alert.alert('Success! 🎉', 'Your application has been submitted.');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to apply. Please try again.');
                            console.error(error);
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <LinearGradient
                colors={[COLORS.gradientStart, COLORS.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Job Details</Text>
                <TouchableOpacity style={styles.shareButton}>
                    <Ionicons name="share-outline" size={24} color={COLORS.white} />
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Company Card */}
                <View style={styles.companyCard}>
                    <View style={styles.logoContainer}>
                        <Ionicons name="business" size={40} color={COLORS.primary} />
                    </View>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <Text style={styles.companyName}>{job.company}</Text>

                    <View style={styles.tagContainer}>
                        <View style={styles.tag}>
                            <Ionicons name="location-outline" size={14} color={COLORS.primary} />
                            <Text style={styles.tagText}>{job.location}</Text>
                        </View>
                        <View style={styles.tag}>
                            <Ionicons name="time-outline" size={14} color={COLORS.primary} />
                            <Text style={styles.tagText}>Full-time</Text>
                        </View>
                    </View>
                </View>

                {/* Salary Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Salary</Text>
                    <View style={styles.salaryCard}>
                        <Ionicons name="cash-outline" size={24} color={COLORS.success} />
                        <Text style={styles.salaryText}>{job.salary}</Text>
                        <Text style={styles.salaryPeriod}>/month</Text>
                    </View>
                </View>

                {/* Description Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Job Description</Text>
                    <Text style={styles.description}>
                        {job.description ||
                            `We are looking for a talented ${job.title} to join our team at ${job.company}. 
              
This is an excellent opportunity to work with a dynamic team and grow your career in a supportive environment.

Key Responsibilities:
• Collaborate with team members on various projects
• Contribute to the development and improvement of our products
• Participate in team meetings and brainstorming sessions
• Stay up-to-date with industry trends and best practices

Requirements:
• Relevant experience in the field
• Strong communication skills
• Ability to work in a fast-paced environment
• Team player with a positive attitude`}
                    </Text>
                </View>

                {/* Requirements Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Requirements</Text>
                    <View style={styles.requirementItem}>
                        <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                        <Text style={styles.requirementText}>Bachelor's degree or equivalent</Text>
                    </View>
                    <View style={styles.requirementItem}>
                        <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                        <Text style={styles.requirementText}>2+ years of experience</Text>
                    </View>
                    <View style={styles.requirementItem}>
                        <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                        <Text style={styles.requirementText}>Excellent communication skills</Text>
                    </View>
                    <View style={styles.requirementItem}>
                        <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                        <Text style={styles.requirementText}>Team collaboration experience</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Apply Button */}
            <View style={styles.bottomBar}>
                {checkingStatus ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                ) : hasApplied ? (
                    <View style={styles.appliedContainer}>
                        <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                        <Text style={styles.appliedText}>Application Submitted</Text>
                    </View>
                ) : (
                    <CustomButton
                        title="Apply Now"
                        onPress={handleApply}
                        type="gradient"
                        loading={loading}
                        style={styles.applyButton}
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.white,
    },
    shareButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    companyCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginTop: -10,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: COLORS.infoBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    jobTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: 6,
    },
    companyName: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginBottom: 16,
    },
    tagContainer: {
        flexDirection: 'row',
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.infoBg,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginHorizontal: 4,
    },
    tagText: {
        marginLeft: 4,
        fontSize: 13,
        color: COLORS.primary,
        fontWeight: '500',
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 12,
    },
    salaryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.successBg,
        padding: 16,
        borderRadius: 14,
    },
    salaryText: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.success,
        marginLeft: 12,
    },
    salaryPeriod: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginLeft: 2,
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
        color: COLORS.textSecondary,
    },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    requirementText: {
        marginLeft: 10,
        fontSize: 15,
        color: COLORS.textSecondary,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        padding: 20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    applyButton: {
        width: '100%',
    },
    appliedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
    },
    appliedText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.success,
    },
});

export default JobDetailScreen;
