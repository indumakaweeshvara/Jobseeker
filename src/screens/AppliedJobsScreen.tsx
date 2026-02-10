import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, FlatList, RefreshControl, TouchableOpacity,
    Alert, StatusBar, ActivityIndicator, ListRenderItem, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Skeleton } from '../components';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface Application {
    id: string;
    jobId: string;
    jobTitle: string;
    company: string;
    status: string;
    appliedAt: string;
}

const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
        case 'accepted':
            return { bg: '#D1FAE5', color: '#10B981', icon: 'checkmark-circle' as const, label: 'Accepted' };
        case 'rejected':
            return { bg: '#FEE2E2', color: '#EF4444', icon: 'close-circle' as const, label: 'Rejected' };
        case 'interviewing':
            return { bg: '#E0E7FF', color: '#4338CA', icon: 'people' as const, label: 'Interviewing' };
        case 'reviewing':
            return { bg: '#DBEAFE', color: '#1D4ED8', icon: 'search' as const, label: 'Reviewing' };
        case 'decision':
            return { bg: '#F3E8FF', color: '#7E22CE', icon: 'ribbon' as const, label: 'Decision' };
        default:
            return { bg: '#FEF3C7', color: '#F59E0B', icon: 'time' as const, label: 'Pending' };
    }
};

const STAGES = ['Pending', 'Reviewing', 'Interviewing', 'Decision'];

const StatusProgress = ({ currentStatus }: { currentStatus: string }) => {
    const { colors, isDark } = useTheme();
    const currentIndex = STAGES.findIndex(s => s.toLowerCase() === currentStatus.toLowerCase());

    // If accepted/rejected, we show a full or empty bar respectively? 
    // Usually these are terminal states. We'll show progress up to the current stage.
    const displayIndex = currentStatus.toLowerCase() === 'accepted' ? 4 : (currentStatus.toLowerCase() === 'rejected' ? -1 : currentIndex);

    return (
        <View style={styles.progressContainer}>
            {STAGES.map((stage, index) => {
                const isCompleted = index < displayIndex;
                const isCurrent = index === displayIndex;
                return (
                    <View key={stage} style={styles.stageItem}>
                        <View style={[
                            styles.stageDot,
                            { backgroundColor: isDark ? colors.border : '#E2E8F0' },
                            isCompleted && styles.completedDot,
                            isCurrent && [styles.currentDot, { borderColor: isDark ? colors.card : '#DBEAFE', backgroundColor: colors.primary }]
                        ]}>
                            {isCompleted && <Ionicons name="checkmark" size={10} color="#FFF" />}
                        </View>
                        <Text style={[
                            styles.stageLabel,
                            { color: colors.textSecondary },
                            (isCompleted || isCurrent) && [styles.activeStageLabel, { color: colors.textPrimary }]
                        ]}>{stage}</Text>
                        {index < STAGES.length - 1 && (
                            <View style={[
                                styles.stageLine,
                                { backgroundColor: isDark ? colors.border : '#E2E8F0' },
                                index < displayIndex && styles.completedLine
                            ]} />
                        )}
                    </View>
                );
            })}
        </View>
    );
};

const AppliedJobsScreen: React.FC = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { user } = useAuth();
    const { colors, isDark } = useTheme();

    const fetchApplications = async () => {
        if (!user) return;
        try {
            const appsQuery = query(
                collection(db, 'Applications'),
                where('userId', '==', user.uid)
            );
            const snapshot = await getDocs(appsQuery);
            const appsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as Application[];

            // Sort by appliedAt descending
            appsList.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
            setApplications(appsList);
        } catch (error) {
            console.log('Error fetching applications:', error);
            Alert.alert('Error', 'Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchApplications();
        setRefreshing(false);
    }, []);

    const handleWithdraw = async (appId: string) => {
        Alert.alert(
            'Withdraw Application',
            'Are you sure you want to withdraw this application?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Withdraw', style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'Applications', appId));
                            setApplications(prev => prev.filter(a => a.id !== appId));
                            Alert.alert('Done', 'Application withdrawn');
                        } catch (error: any) {
                            Alert.alert('Error', error.message);
                        }
                    },
                },
            ]
        );
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const renderApplication: ListRenderItem<Application> = ({ item }) => {
        const statusStyle = getStatusStyle(item.status);

        return (
            <View style={[styles.appCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.appCardTop}>
                    <View style={[styles.appIconContainer, { backgroundColor: colors.primary + '15' }]}>
                        <Ionicons name="document-text" size={22} color={colors.primary} />
                    </View>
                    <View style={styles.appInfo}>
                        <Text style={[styles.appTitle, { color: colors.textPrimary }]} numberOfLines={1}>{item.jobTitle}</Text>
                        <Text style={[styles.appCompany, { color: colors.textSecondary }]}>{item.company}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: isDark ? statusStyle.color + '20' : statusStyle.bg }]}>
                        <Ionicons name={statusStyle.icon} size={13} color={statusStyle.color} />
                        <Text style={[styles.statusText, { color: statusStyle.color }]}>
                            {statusStyle.label}
                        </Text>
                    </View>
                </View>

                {/* Status Progress Pipeline */}
                {!['accepted', 'rejected'].includes(item.status.toLowerCase()) && (
                    <StatusProgress currentStatus={item.status} />
                )}

                <View style={[styles.appCardBottom, { borderTopColor: colors.border }]}>
                    <View style={styles.dateRow}>
                        <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                        <Text style={[styles.dateText, { color: colors.textSecondary }]}>Applied {formatDate(item.appliedAt)}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.withdrawButton, { backgroundColor: colors.error + '15' }]}
                        onPress={() => handleWithdraw(item.id)}
                    >
                        <Ionicons name="trash-outline" size={16} color={colors.error} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const AppsSkeleton = () => (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { height: 230 }]} />
            <View style={{ padding: 16 }}>
                {[1, 2, 3].map((i) => (
                    <View key={i} style={[styles.appCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                            <Skeleton width={44} height={44} borderRadius={14} />
                            <View style={{ marginLeft: 12, flex: 1 }}>
                                <Skeleton width="60%" height={16} />
                                <Skeleton width="40%" height={12} style={{ marginTop: 8 }} />
                            </View>
                            <Skeleton width={80} height={24} borderRadius={20} />
                        </View>
                        <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Skeleton width={120} height={14} />
                            <Skeleton width={36} height={36} borderRadius={12} />
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );

    if (loading) {
        return <AppsSkeleton />;
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <LinearGradient
                colors={isDark ? [colors.card, colors.background] : ['#1E40AF', '#3B82F6', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <Text style={[styles.headerTitle, { color: isDark ? colors.textPrimary : '#FFFFFF' }]}>My Applications</Text>
                <Text style={[styles.headerSubtitle, { color: isDark ? colors.textSecondary : '#BFDBFE' }]}>Track your job applications</Text>

                {/* Stats */}
                <View style={[styles.statsRow, { backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.12)' }]}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{applications.length}</Text>
                        <Text style={[styles.statLabel, { color: isDark ? colors.textSecondary : '#BFDBFE' }]}>Total</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: isDark ? colors.border : 'rgba(255,255,255,0.2)' }]} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: colors.textPrimary }]}>
                            {applications.filter(a => a.status === 'pending').length}
                        </Text>
                        <Text style={[styles.statLabel, { color: isDark ? colors.textSecondary : '#BFDBFE' }]}>Pending</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: isDark ? colors.border : 'rgba(255,255,255,0.2)' }]} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: colors.textPrimary }]}>
                            {applications.filter(a => a.status === 'accepted').length}
                        </Text>
                        <Text style={[styles.statLabel, { color: isDark ? colors.textSecondary : '#BFDBFE' }]}>Accepted</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Application List */}
            <FlatList
                data={applications}
                renderItem={renderApplication}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={[styles.emptyIconBg, { backgroundColor: colors.card }]}>
                            <Ionicons name="document-text-outline" size={48} color={colors.textSecondary} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Applications Yet</Text>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            Start exploring jobs and applying to build your career!
                        </Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F5F9',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
    },
    header: {
        paddingTop: 56,
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#BFDBFE',
        marginBottom: 18,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 16,
        padding: 14,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    statLabel: {
        fontSize: 11,
        color: '#BFDBFE',
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    list: {
        padding: 16,
        paddingBottom: 100,
    },
    appCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    appCardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    appIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    appInfo: {
        flex: 1,
    },
    appTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 2,
    },
    appCompany: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    appCardBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 12,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateText: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '500',
    },
    withdrawButton: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#FEE2E2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyIconBg: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#334155',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#94A3B8',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 4,
    },
    stageItem: {
        flex: 1,
        alignItems: 'center',
        position: 'relative',
    },
    stageDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    completedDot: {
        backgroundColor: '#10B981',
    },
    currentDot: {
        backgroundColor: '#2563EB',
        borderWidth: 2,
        borderColor: '#DBEAFE',
    },
    stageLine: {
        position: 'absolute',
        top: 8,
        left: '50%',
        width: '100%',
        height: 2,
        backgroundColor: '#E2E8F0',
        zIndex: 1,
    },
    completedLine: {
        backgroundColor: '#10B981',
    },
    stageLabel: {
        fontSize: 9,
        color: '#94A3B8',
        marginTop: 6,
        fontWeight: '500',
    },
    activeStageLabel: {
        color: '#1E293B',
        fontWeight: 'bold',
    },
});

export default AppliedJobsScreen;
