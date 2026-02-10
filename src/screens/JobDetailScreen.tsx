import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    StatusBar,
    ActivityIndicator,
    StyleSheet,
    Dimensions,
    Share,
    Animated,
    Image as RNImage,
} from 'react-native';
import { Skeleton } from '../components';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, where, limit } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Job, JobDetailScreenProps, RootStackParamList } from '../types';

const { width } = Dimensions.get('window');

const getCategoryColor = (category: string): string => {
    switch (category) {
        case 'Development': return '#2563EB';
        case 'Design': return '#7C3AED';
        case 'Marketing': return '#F59E0B';
        case 'Finance': return '#10B981';
        case 'Sales': return '#EF4444';
        case 'Engineering': return '#0EA5E9';
        default: return '#64748B';
    }
};

const getCategoryGradient = (category: string): readonly [string, string] => {
    switch (category) {
        case 'Development': return ['#2563EB', '#1D4ED8'] as const;
        case 'Design': return ['#7C3AED', '#6D28D9'] as const;
        case 'Marketing': return ['#F59E0B', '#D97706'] as const;
        case 'Finance': return ['#10B981', '#059669'] as const;
        case 'Sales': return ['#EF4444', '#DC2626'] as const;
        case 'Engineering': return ['#0EA5E9', '#0284C7'] as const;
        default: return ['#64748B', '#475569'] as const;
    }
};

const getCompanyInitials = (company: string): string => {
    return company
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

const JobDetailScreen: React.FC<JobDetailScreenProps> = ({ route, navigation }: JobDetailScreenProps) => {
    const { jobId } = route.params;
    const { user } = useAuth();
    const { colors, isDark } = useTheme();
    const [job, setJob] = useState<Job | null>(null);
    const [similarJobs, setSimilarJobs] = useState<Job[]>([]);
    const [salaryInsight, setSalaryInsight] = useState<{ average: number; comparison: 'higher' | 'lower' | 'average' } | null>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [isApplied, setIsApplied] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        fetchJobDetail();
    }, [jobId]);

    const fetchJobDetail = async () => {
        try {
            const jobDoc = await getDoc(doc(db, 'Jobs', jobId));
            if (jobDoc.exists()) {
                const jobData = { id: jobDoc.id, ...jobDoc.data() } as Job;
                setJob(jobData);

                // Fetch Similar Jobs
                if (jobData.category) {
                    const similarQuery = query(
                        collection(db, 'Jobs'),
                        where('category', '==', jobData.category),
                        where('__name__', '!=', jobId),
                        limit(5)
                    );
                    const similarSnapshot = await getDocs(similarQuery);
                    const similarList = similarSnapshot.docs
                        .map(doc => ({ id: doc.id, ...doc.data() } as Job));
                    setSimilarJobs(similarList);

                    // Salary Insights calculation - limit to 20 for performance while maintaining statistical relevance
                    const statsQuery = query(
                        collection(db, 'Jobs'),
                        where('category', '==', jobData.category),
                        limit(20)
                    );
                    const allInCatSnapshot = await getDocs(statsQuery);
                    const salaries = allInCatSnapshot.docs.map(doc => {
                        const s = (doc.data() as Job).salary;
                        const match = s.match(/(\d+),(\d+)/g);
                        if (match) {
                            const nums = match.map(n => parseInt(n.replace(',', '')));
                            return nums.reduce((a, b) => a + b, 0) / nums.length;
                        }
                        return 0;
                    }).filter(s => s > 0);

                    if (salaries.length > 0) {
                        const avg = salaries.reduce((a, b) => a + b, 0) / salaries.length;
                        const currentMatch = jobData.salary.match(/(\d+),(\d+)/g);
                        if (currentMatch) {
                            const cNums = currentMatch.map(n => parseInt(n.replace(',', '')));
                            const cAvg = cNums.reduce((a, b) => a + b, 0) / cNums.length;
                            setSalaryInsight({
                                average: avg,
                                comparison: cAvg > avg * 1.1 ? 'higher' : cAvg < avg * 0.9 ? 'lower' : 'average'
                            });
                        }
                    }
                }
            }
            // Check if already applied
            if (user) {
                const appsQuery = query(
                    collection(db, 'Applications'),
                    where('userId', '==', user.uid),
                    where('jobId', '==', jobId)
                );
                const appsSnapshot = await getDocs(appsQuery);
                setIsApplied(!appsSnapshot.empty);

                // Check if already saved
                const savedQuery = query(
                    collection(db, 'SavedJobs'),
                    where('userId', '==', user.uid),
                    where('jobId', '==', jobId)
                );
                const savedSnapshot = await getDocs(savedQuery);
                setIsSaved(!savedSnapshot.empty);
            }
        } catch (error) {
            console.log('Error fetching job:', error);
            Alert.alert('Error', 'Failed to load job details');
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async () => {
        if (!user) return;

        Alert.alert(
            'Withdraw Application',
            'Are you sure you want to withdraw?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Withdraw',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const applicationId = `${user.uid}_${jobId}`;
                            await deleteDoc(doc(db, 'Applications', applicationId));
                            setIsApplied(false);
                            Alert.alert('Done', 'Application withdrawn.');
                        } catch (error: any) {
                            Alert.alert('Error', error.message);
                        }
                    },
                },
            ]
        );
    };

    const handleApply = async () => {
        if (!user || !job) return;

        setApplying(true);
        try {
            const applicationId = `${user.uid}_${jobId}`;
            await setDoc(doc(db, 'Applications', applicationId), {
                userId: user.uid,
                jobId: jobId,
                jobTitle: job.title,
                company: job.company,
                status: 'pending',
                appliedAt: new Date().toISOString(),
            });
            setIsApplied(true);
            Alert.alert('✅ Success!', 'Your application has been submitted.');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to apply');
        } finally {
            setApplying(false);
        }
    };

    const handleShare = async () => {
        if (!job) return;
        try {
            await Share.share({
                message: `Check out this job: ${job.title} at ${job.company} in ${job.location}. Download JobSeeker app to apply!`,
                title: job.title,
            });
        } catch (error: any) {
            console.log('Error sharing:', error);
        }
    };

    const handleSaveJob = async () => {
        if (!user || !job) return;

        try {
            const savedId = `${user.uid}_${jobId}`;
            if (isSaved) {
                await deleteDoc(doc(db, 'SavedJobs', savedId));
                setIsSaved(false);
            } else {
                await setDoc(doc(db, 'SavedJobs', savedId), {
                    userId: user.uid,
                    jobId: jobId,
                    jobTitle: job.title,
                    company: job.company,
                    savedAt: new Date().toISOString(),
                });
                setIsSaved(true);
            }
        } catch (error: any) {
            console.log('Error toggling save:', error);
        }
    };

    const DetailSkeleton = () => (
        <View style={styles.container}>
            <Skeleton height={280} borderRadius={0} />
            <View style={{ padding: 20 }}>
                <Skeleton width="60%" height={32} />
                <Skeleton width="40%" height={20} style={{ marginTop: 12 }} />
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
                    <Skeleton width={100} height={40} borderRadius={20} />
                    <Skeleton width={100} height={40} borderRadius={20} />
                </View>
                <View style={{ marginTop: 32 }}>
                    <Skeleton width="100%" height={150} />
                </View>
            </View>
        </View>
    );

    if (loading) {
        return <DetailSkeleton />;
    }

    if (!job) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <Ionicons name="alert-circle-outline" size={60} color={colors.textLight} />
                <Text style={[styles.errorText, { color: colors.textSecondary }]}>Job not found</Text>
            </View>
        );
    }

    const categoryColor = getCategoryColor(job.category || '');

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header with Image Background */}
                <View style={styles.header}>
                    <RNImage source={{ uri: job.companyLogo || 'https://via.placeholder.com/150' }} style={styles.headerImage} blurRadius={2} />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.headerGradient}
                    />

                    <View style={styles.headerContent}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="chevron-back" size={24} color="#FFF" />
                        </TouchableOpacity>

                        <View style={styles.logoAndTitle}>
                            <View style={[styles.logoContainer, { backgroundColor: isDark ? colors.card : '#FFF' }]}>
                                <RNImage source={{ uri: job.companyLogo || 'https://via.placeholder.com/150' }} style={styles.companyLogo} />
                            </View>
                            <View style={styles.titleContainer}>
                                <Text style={[styles.jobTitle, { color: '#FFF' }]}>{job.title}</Text>
                                <Text style={[styles.companyName, { color: '#E2E8F0' }]}>{job.company}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Main Content */}
                <View style={[styles.contentContainer, { backgroundColor: colors.background }]}>
                    {/* Quick Info Tags */}
                    <View style={styles.tagsContainer}>
                        <View style={[styles.tag, { backgroundColor: colors.primary + '15' }]}>
                            <Ionicons name="briefcase-outline" size={16} color={colors.primary} />
                            <Text style={[styles.tagText, { color: colors.primary }]}>{job.type}</Text>
                        </View>
                        <View style={[styles.tag, { backgroundColor: colors.success + '15' }]}>
                            <Ionicons name="location-outline" size={16} color={colors.success} />
                            <Text style={[styles.tagText, { color: colors.success }]}>{job.location}</Text>
                        </View>
                        <View style={[styles.tag, { backgroundColor: colors.warning + '15' }]}>
                            <Ionicons name="time-outline" size={16} color={colors.warning} />
                            <Text style={[styles.tagText, { color: colors.warning }]}>{job.postedAt}</Text>
                        </View>
                    </View>

                    {/* Salary Section */}
                    <View style={[styles.salaryCard, { backgroundColor: colors.card }]}>
                        <View>
                            <Text style={[styles.salaryLabel, { color: colors.textSecondary }]}>Monthly Salary</Text>
                            <Text style={[styles.salaryValue, { color: colors.textPrimary }]}>{job.salary || 'Negotiable'}</Text>
                            {salaryInsight && (
                                <View style={[styles.insightBadge, { backgroundColor: isDark ? '#334155' : '#F8FAFC' }]}>
                                    <Ionicons
                                        name={salaryInsight.comparison === 'higher' ? "trending-up" : salaryInsight.comparison === 'lower' ? "trending-down" : "analytics"}
                                        size={12}
                                        color={salaryInsight.comparison === 'higher' ? colors.success : salaryInsight.comparison === 'lower' ? colors.error : colors.primary}
                                    />
                                    <Text style={[styles.insightText, { color: salaryInsight.comparison === 'higher' ? colors.success : salaryInsight.comparison === 'lower' ? colors.error : colors.primary }]}>
                                        {salaryInsight.comparison === 'higher' ? 'Above Market Avg' : salaryInsight.comparison === 'lower' ? 'Below Market Avg' : 'Market Average'}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <TouchableOpacity
                            style={[styles.saveButton, { borderColor: isSaved ? colors.primary : colors.border, backgroundColor: isSaved ? colors.primary + '10' : 'transparent' }]}
                            onPress={handleSaveJob}
                        >
                            <Ionicons
                                name={isSaved ? "bookmark" : "bookmark-outline"}
                                size={24}
                                color={isSaved ? colors.primary : colors.textSecondary}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Description Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Job Description</Text>
                        <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>{job.description}</Text>
                    </View>

                    {/* Requirements Section */}
                    {job.requirements && job.requirements.length > 0 && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Requirements</Text>
                            {job.requirements.map((req, index) => (
                                <View key={index} style={styles.bulletItem}>
                                    <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
                                    <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{req}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Similar Jobs */}
                    {similarJobs.length > 0 && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Similar Opportunities</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.similarJobsScroll}>
                                {similarJobs.map(sj => (
                                    <TouchableOpacity
                                        key={sj.id}
                                        style={[styles.similarCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                                        onPress={() => navigation.push('JobDetail', { jobId: sj.id })}
                                    >
                                        <RNImage source={{ uri: sj.companyLogo }} style={styles.similarLogo} />
                                        <Text style={[styles.similarTitle, { color: colors.textPrimary }]} numberOfLines={1}>{sj.title}</Text>
                                        <Text style={[styles.similarCompany, { color: colors.textSecondary }]}>{sj.company}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>
            </ScrollView>

            <View style={[styles.bottomBar, { backgroundColor: colors.background, borderColor: colors.border }]}>
                {isApplied ? (
                    <View style={styles.appliedRow}>
                        <View style={[styles.appliedBadge, { backgroundColor: colors.success + '15' }]}>
                            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                            <Text style={[styles.appliedText, { color: colors.success }]}>Applied</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.withdrawBtn, { backgroundColor: colors.error + '15' }]}
                            onPress={handleWithdraw}
                        >
                            <Text style={[styles.withdrawText, { color: colors.error }]}>Withdraw</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.applyButton}
                        onPress={handleApply}
                        disabled={applying}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#2563EB', '#7C3AED']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.applyButton}
                        >
                            {applying ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <Ionicons name="paper-plane" size={20} color="#FFF" />
                                    <Text style={styles.applyButtonText}>Apply Now</Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </View>
        </View>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
    },
    header: {
        height: 280,
        position: 'relative',
    },
    headerImage: {
        width: '100%',
        height: '100%',
    },
    headerGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '100%',
    },
    headerContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 30,
    },
    backButton: {
        position: 'absolute',
        top: -180,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoAndTitle: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoContainer: {
        width: 70,
        height: 70,
        borderRadius: 16,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    companyLogo: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    titleContainer: {
        marginLeft: 16,
        flex: 1,
    },
    jobTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
    },
    companyName: {
        fontSize: 16,
        marginTop: 4,
    },
    contentContainer: {
        flex: 1,
        marginTop: -20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 24,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 6,
    },
    tagText: {
        fontSize: 13,
        fontWeight: '600',
    },
    salaryCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    salaryLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
    },
    salaryValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    insightBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginTop: 6,
        gap: 4,
        alignSelf: 'flex-start',
    },
    insightText: {
        fontSize: 11,
        fontWeight: '700',
    },
    saveButton: {
        width: 52,
        height: 52,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    section: {
        marginBottom: 28,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    descriptionText: {
        fontSize: 15,
        lineHeight: 24,
    },
    bulletItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
        gap: 12,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 8,
    },
    bulletText: {
        fontSize: 15,
        lineHeight: 22,
        flex: 1,
    },
    similarJobsScroll: {
        marginTop: 4,
    },
    similarCard: {
        width: 160,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 16,
    },
    similarLogo: {
        width: 40,
        height: 40,
        borderRadius: 10,
        marginBottom: 12,
    },
    similarTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    similarCompany: {
        fontSize: 12,
    },
    bottomBar: {
        padding: 20,
        paddingBottom: 30,
        borderTopWidth: 1,
    },
    applyButton: {
        height: 56,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    applyButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    appliedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    appliedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 14,
    },
    appliedText: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    withdrawBtn: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 14,
    },
    withdrawText: {
        fontSize: 14,
        fontWeight: '600',
    },
});

export default JobDetailScreen;
