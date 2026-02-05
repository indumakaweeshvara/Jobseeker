import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, RefreshControl, TextInput,
    TouchableOpacity, StatusBar, ActivityIndicator, Alert, ListRenderItem,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { COLORS, SIZES } from '../theme/colors';
import JobCard from '../components/JobCard';
import { useAuth } from '../context/AuthContext';
import { seedJobs } from '../services/seedData';
import { HomeScreenNavigationProp, Job } from '../types';

interface HomeScreenProps {
    navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const { userData } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchJobs = async (): Promise<void> => {
        try {
            const jobsRef = collection(db, 'Jobs');
            const snapshot = await getDocs(jobsRef);
            const jobsList: Job[] = snapshot.docs.map(doc => ({
                id: doc.id, ...doc.data()
            } as Job));
            setJobs(jobsList);
            setFilteredJobs(jobsList);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchJobs(); }, []);

    useEffect(() => {
        if (searchQuery) {
            const filtered = jobs.filter(job =>
                job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.location?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredJobs(filtered);
        } else {
            setFilteredJobs(jobs);
        }
    }, [searchQuery, jobs]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchJobs();
        setRefreshing(false);
    }, []);

    const renderJobCard: ListRenderItem<Job> = ({ item }) => (
        <JobCard job={item} onPress={() => navigation.navigate('JobDetail', { job: item })} />
    );

    const handleSeedJobs = async (): Promise<void> => {
        setLoading(true);
        try {
            const result = await seedJobs();
            if (result.success) {
                Alert.alert('Success!', 'Sample jobs added!');
                await fetchJobs();
            } else {
                Alert.alert('Error', result.error || 'Failed');
            }
        } catch { Alert.alert('Error', 'Failed to add jobs'); }
        finally { setLoading(false); }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading jobs...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <FlatList
                data={filteredJobs}
                renderItem={renderJobCard}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={() => (
                    <>
                        <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
                            <View style={styles.headerContent}>
                                <View>
                                    <Text style={styles.greeting}>Hello, {userData?.name || 'User'}! 👋</Text>
                                    <Text style={styles.subtitle}>Find your perfect job</Text>
                                </View>
                                <TouchableOpacity style={styles.notificationBtn}>
                                    <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.searchContainer}>
                                <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} />
                                <TextInput style={styles.searchInput} placeholder="Search jobs..." placeholderTextColor={COLORS.textSecondary} value={searchQuery} onChangeText={setSearchQuery} />
                            </View>
                        </LinearGradient>
                        <View style={styles.statsContainer}>
                            <View style={styles.statCard}><Text style={styles.statNumber}>{jobs.length}</Text><Text style={styles.statLabel}>Jobs</Text></View>
                            <View style={styles.statCard}><Text style={styles.statNumber}>12</Text><Text style={styles.statLabel}>Companies</Text></View>
                            <View style={styles.statCard}><Text style={styles.statNumber}>5</Text><Text style={styles.statLabel}>Categories</Text></View>
                        </View>
                        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Recent Jobs</Text></View>
                    </>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="briefcase-outline" size={60} color={COLORS.textLight} />
                        <Text style={styles.emptyText}>No jobs found</Text>
                        <TouchableOpacity style={styles.seedButton} onPress={handleSeedJobs}>
                            <Text style={styles.seedButtonText}>Load Sample Jobs</Text>
                        </TouchableOpacity>
                    </View>
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
    loadingText: { marginTop: 12, fontSize: SIZES.md, color: COLORS.textSecondary },
    header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    greeting: { fontSize: 24, fontWeight: '700', color: COLORS.white, marginBottom: 4 },
    subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
    notificationBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12 },
    searchInput: { flex: 1, marginLeft: 10, fontSize: SIZES.md, color: COLORS.textPrimary },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 20 },
    statCard: { flex: 1, backgroundColor: COLORS.white, borderRadius: 12, padding: 12, marginHorizontal: 4, alignItems: 'center' },
    statNumber: { fontSize: 20, fontWeight: '700', color: COLORS.primary },
    statLabel: { fontSize: 11, color: COLORS.textSecondary },
    sectionHeader: { paddingHorizontal: 20, marginTop: 24, marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
    listContent: { paddingHorizontal: 20, paddingBottom: 100 },
    emptyContainer: { alignItems: 'center', paddingTop: 40 },
    emptyText: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary, marginTop: 16 },
    seedButton: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 20 },
    seedButtonText: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
});

export default HomeScreen;
