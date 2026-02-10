import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    RefreshControl,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { JobCard, Skeleton } from '../components';
import { Job } from '../types';
import { useTheme } from '../context/ThemeContext';

const SavedJobsScreen = ({ navigation }: any) => {
    const [savedJobs, setSavedJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { user } = useAuth();
    const { colors, isDark } = useTheme();

    const fetchSavedJobs = async () => {
        if (!user) return;
        try {
            const savedQuery = query(
                collection(db, 'SavedJobs'),
                where('userId', '==', user.uid)
            );
            const snapshot = await getDocs(savedQuery);

            const fullJobs: Job[] = [];
            for (const docSnapshot of snapshot.docs) {
                const data = docSnapshot.data();
                const jobDoc = await getDoc(doc(db, 'Jobs', data.jobId));
                if (jobDoc.exists()) {
                    fullJobs.push({
                        id: jobDoc.id,
                        ...jobDoc.data(),
                    } as Job);
                }
            }

            setSavedJobs(fullJobs);
        } catch (error) {
            console.error('Error fetching saved jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSavedJobs();
    }, [user]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchSavedJobs();
        setRefreshing(false);
    }, []);

    const SavedSkeleton = () => (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={{ height: 160, backgroundColor: isDark ? colors.card : '#E2E8F0' }} />
            <View style={{ padding: 16 }}>
                {[1, 2, 3].map((i) => (
                    <View key={i} style={styles.skeletonCard}>
                        <Skeleton width="100%" height={120} borderRadius={16} />
                    </View>
                ))}
            </View>
        </View>
    );

    if (loading) return <SavedSkeleton />;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={isDark ? [colors.card, colors.background] : ['#1E40AF', '#3B82F6']}
                style={styles.header}
            >
                <Text style={[styles.headerTitle, { color: isDark ? colors.textPrimary : '#FFFFFF' }]}>Saved Jobs</Text>
                <Text style={[styles.headerSubtitle, { color: isDark ? colors.textSecondary : '#BFDBFE' }]}>
                    {savedJobs.length} {savedJobs.length === 1 ? 'Job' : 'Jobs'} bookmarked
                </Text>
            </LinearGradient>

            <FlatList
                data={savedJobs}
                renderItem={({ item }) => (
                    <JobCard
                        job={item}
                        onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
                    />
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
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
                            <Ionicons name="bookmark-outline" size={40} color={colors.textSecondary} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No saved jobs yet</Text>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Jobs you bookmark will appear here</Text>
                        <TouchableOpacity
                            style={[styles.browseBtn, { backgroundColor: colors.primary }]}
                            onPress={() => navigation.navigate('Home')}
                        >
                            <Text style={styles.browseBtnText}>Browse Jobs</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#BFDBFE',
        marginTop: 4,
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    skeletonCard: {
        marginBottom: 16,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyIconBg: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#334155',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#94A3B8',
        marginBottom: 24,
    },
    browseBtn: {
        backgroundColor: '#2563EB',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    browseBtnText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default SavedJobsScreen;
