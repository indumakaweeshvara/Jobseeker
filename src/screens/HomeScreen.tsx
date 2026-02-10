import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    RefreshControl,
    TextInput,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Alert,
    ListRenderItem,
    ScrollView,
    StyleSheet,
    Animated,
    Dimensions,
    Modal,
    Image as RNImage,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { seedJobs } from '../services/seedData';
import { useAuth } from '../context/AuthContext';
import { JobCard, Skeleton } from '../components';
import { Job, HomeScreenProps } from '../types';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const JOBS_CACHE_KEY = '@jobseeker_jobs_cache';


const { width } = Dimensions.get('window');

const CATEGORIES = ['All', 'Development', 'Design', 'Marketing', 'Finance', 'Sales', 'Engineering'];

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }: HomeScreenProps) => {
    const { user } = useAuth();
    const { colors, isDark } = useTheme();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
    const [popularJobs, setPopularJobs] = useState<Job[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
    const [filters, setFilters] = useState({
        type: 'All',
        level: 'All'
    });
    const { userData } = useAuth();

    const fetchJobs = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            console.log('HomeScreen: Fetching jobs...');
            let snapshot;
            try {
                // Try sorted query first
                const jobsQuery = query(collection(db, 'Jobs'), orderBy('postedAt', 'desc'));
                snapshot = await getDocs(jobsQuery);
            } catch (queryError) {
                console.log('HomeScreen: Ordered query failed, falling back to simple query:', queryError);
                // Fallback to simple query if orderBy fails (e.g. missing index)
                snapshot = await getDocs(collection(db, 'Jobs'));
            }

            const jobsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as Job[];

            console.log(`HomeScreen: Fetched ${jobsList.length} jobs`);
            setJobs(jobsList);
            setPopularJobs(jobsList.slice(0, 5));

            // Update cache
            await AsyncStorage.setItem(JOBS_CACHE_KEY, JSON.stringify(jobsList));
        } catch (error: any) {
            console.log('HomeScreen: Error fetching jobs:', error);
            if (!silent) Alert.alert('Error', 'Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    const loadCachedJobs = async () => {
        try {
            const cachedData = await AsyncStorage.getItem(JOBS_CACHE_KEY);
            if (cachedData) {
                const cachedJobs = JSON.parse(cachedData) as Job[];
                setJobs(cachedJobs);
                setPopularJobs(cachedJobs.slice(0, 5));
                setLoading(false); // Hide skeleton if cache exists
                return true;
            }
        } catch (e) {
            console.log('Error loading cached jobs:', e);
        }
        return false;
    };

    useEffect(() => {
        const init = async () => {
            // 1. Load from cache first for instant UI
            const hasCache = await loadCachedJobs();

            // 2. Initial fetch in background if cache exists, otherwise foreground
            await fetchJobs(hasCache);

            // 3. Background seed check (now uses AsyncStorage flag check first internally)
            const seedResult = await seedJobs();
            if (seedResult.success && seedResult.dataAdded) {
                await fetchJobs(true);
            }
        };
        init();
    }, []);

    useEffect(() => {
        console.log(`HomeScreen: Filtering ${jobs.length} jobs with query "${searchQuery}" and category "${selectedCategory}"`);
        let filtered = jobs;

        if (selectedCategory !== 'All') {
            filtered = filtered.filter(job => job.category === selectedCategory);
        }

        if (filters.type !== 'All') {
            filtered = filtered.filter(job => job.type === filters.type);
        }

        if (filters.level !== 'All') {
            filtered = filtered.filter(job => job.level === filters.level);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                job =>
                    (job.title || '').toLowerCase().includes(query) ||
                    (job.company || '').toLowerCase().includes(query) ||
                    (job.location || '').toLowerCase().includes(query) ||
                    (job.description || '').toLowerCase().includes(query)
            );
        }

        console.log(`HomeScreen: After filtering, ${filtered.length} jobs remaining`);
        setFilteredJobs(filtered);
    }, [searchQuery, selectedCategory, filters, jobs]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchJobs(true);
        setRefreshing(false);
    }, []);

    const renderJobCard: ListRenderItem<Job> = ({ item, index }) => (
        <JobCard
            job={item}
            index={index}
            onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
        />
    );

    const HomeSkeleton = () => (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { height: 230, backgroundColor: colors.background }]} />
            <View style={{ padding: 16 }}>
                {[1, 2, 3].map((i) => (
                    <View key={i} style={[styles.jobCardSkeleton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Skeleton width={50} height={50} borderRadius={12} />
                            <View style={{ marginLeft: 12, flex: 1 }}>
                                <Skeleton width="70%" height={18} />
                                <Skeleton width="40%" height={14} style={{ marginTop: 8 }} />
                            </View>
                        </View>
                        <View style={{ marginTop: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Skeleton width={80} height={24} borderRadius={12} />
                            <Skeleton width={100} height={20} />
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );

    const renderHeader = () => (
        <View>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <View>
                    <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>Welcome back,</Text>
                    <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.name || 'Job Seeker'}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.profileButton, { backgroundColor: colors.card }]}
                    onPress={() => navigation.navigate('Profile' as any)}
                >
                    {user?.profilePic ? (
                        <RNImage source={{ uri: user.profilePic }} style={styles.profilePic} />
                    ) : (
                        <Ionicons name="person" size={24} color={colors.primary} />
                    )}
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
                    <Ionicons name="search" size={20} color={colors.textLight} />
                    <TextInput
                        placeholder="Search for jobs..."
                        placeholderTextColor={colors.textLight}
                        style={[styles.searchInput, { color: colors.textPrimary }]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <TouchableOpacity
                    style={[styles.filterButton, { backgroundColor: colors.primary }]}
                    onPress={() => setIsFilterModalVisible(true)}
                >
                    <Ionicons name="options" size={20} color="#FFF" />
                </TouchableOpacity>
            </View>

            {/* Categories */}
            <View style={styles.categorySection}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryList}
                >
                    {CATEGORIES.map((category) => (
                        <TouchableOpacity
                            key={category}
                            style={[
                                styles.categoryPill,
                                { backgroundColor: colors.card, borderColor: colors.border },
                                selectedCategory === category && styles.categoryPillActive,
                                selectedCategory === category && { backgroundColor: colors.primary, borderColor: colors.primary }
                            ]}
                            onPress={() => setSelectedCategory(category)}
                        >
                            <Text
                                style={[
                                    styles.categoryText,
                                    { color: colors.textPrimary },
                                    selectedCategory === category && styles.categoryTextActive,
                                    selectedCategory === category && { color: colors.buttonText }
                                ]}
                            >
                                {category}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Popular Jobs Section */}
            {popularJobs.length > 0 && selectedCategory === 'All' && !searchQuery && (
                <View style={styles.popularSection}>
                    <View style={styles.popularHeader}>
                        <Text style={[styles.popularTitle, { color: colors.textPrimary }]}>Popular Jobs</Text>
                        <TouchableOpacity>
                            <Text style={[styles.showAllText, { color: colors.primary }]}>Show all</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.popularList}
                    >
                        {popularJobs.map((job) => (
                            <TouchableOpacity
                                key={job.id}
                                style={[styles.popularCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]}
                                onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}
                            >
                                <View style={styles.popularCardHeader}>
                                    <View style={[styles.companyIconBg, { backgroundColor: isDark ? colors.background : '#EFF6FF' }]}>
                                        <Ionicons name="business" size={24} color={colors.primary} />
                                    </View>
                                    <View style={[styles.typeTag, { backgroundColor: isDark ? colors.primary + '20' : '#F0FDF4' }]}>
                                        <Text style={[styles.typeTagText, { color: isDark ? colors.primary : '#16A34A' }]}>{job.type}</Text>
                                    </View>
                                </View>
                                <Text style={[styles.popularJobTitle, { color: colors.textPrimary }]} numberOfLines={1}>{job.title}</Text>
                                <Text style={[styles.popularJobCompany, { color: colors.textSecondary }]}>{job.company}</Text>
                                <View style={styles.popularCardFooter}>
                                    <Text style={[styles.popularJobSalary, { color: colors.primary }]}>{job.salary}</Text>
                                    <Text style={[styles.popularJobLocation, { color: colors.textSecondary }]}>{job.location.split(',')[0]}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Results Header */}
            <View style={styles.resultsHeader}>
                <Text style={[styles.resultsTitle, { color: colors.textPrimary }]}>
                    {selectedCategory === 'All' ? 'Recent Jobs' : selectedCategory}
                </Text>
                <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>{filteredJobs.length} found</Text>
            </View>
        </View>
    );

    if (loading && jobs.length === 0) {
        return <HomeSkeleton />;
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

            <FlatList
                data={filteredJobs}
                renderItem={renderJobCard}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.jobList}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={[styles.emptyIconBg, { backgroundColor: colors.card }]}>
                            <Ionicons name="search-outline" size={40} color={colors.textLight} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No jobs found</Text>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            Try adjusting your search or category filter
                        </Text>
                    </View>
                }
            />

            {/* Filter Modal */}
            <Modal
                transparent
                visible={isFilterModalVisible}
                animationType="slide"
                onRequestClose={() => setIsFilterModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Filters</Text>
                            <TouchableOpacity onPress={() => setIsFilterModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.filterLabel, { color: colors.textPrimary }]}>Job Type</Text>
                        <View style={styles.filterOptions}>
                            {['All', 'Full-time', 'Remote', 'Contract'].map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.filterPill,
                                        { backgroundColor: colors.background, borderColor: colors.border },
                                        filters.type === type && styles.filterPillActive,
                                        filters.type === type && { backgroundColor: colors.primary, borderColor: colors.primary }
                                    ]}
                                    onPress={() => setFilters({ ...filters, type })}
                                >
                                    <Text
                                        style={[
                                            styles.filterPillText,
                                            { color: colors.textPrimary },
                                            filters.type === type && styles.filterPillTextActive,
                                            filters.type === type && { color: colors.buttonText }
                                        ]}
                                    >
                                        {type}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={[styles.filterLabel, { color: colors.textPrimary }]}>Seniority Level</Text>
                        <View style={styles.filterOptions}>
                            {['All', 'Junior', 'Mid-Level', 'Senior'].map((level) => (
                                <TouchableOpacity
                                    key={level}
                                    style={[
                                        styles.filterPill,
                                        { backgroundColor: colors.background, borderColor: colors.border },
                                        filters.level === level && styles.filterPillActive,
                                        filters.level === level && { backgroundColor: colors.primary, borderColor: colors.primary }
                                    ]}
                                    onPress={() => setFilters({ ...filters, level })}
                                >
                                    <Text
                                        style={[
                                            styles.filterPillText,
                                            { color: colors.textPrimary },
                                            filters.level === level && styles.filterPillTextActive,
                                            filters.level === level && { color: colors.buttonText }
                                        ]}
                                    >
                                        {level}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={[styles.applyBtn, { backgroundColor: colors.primary }]}
                            onPress={() => setIsFilterModalVisible(false)}
                        >
                            <Text style={styles.applyBtnText}>Apply Filters</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.resetBtn}
                            onPress={() => setFilters({ type: 'All', level: 'All' })}
                        >
                            <Text style={[styles.resetBtnText, { color: colors.textSecondary }]}>Reset All</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    loadingText: {
        color: '#FFF',
        marginTop: 16,
        fontSize: 16,
        fontWeight: '500',
    },
    header: {
        paddingTop: 52,
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },
    welcomeText: {
        fontSize: 14,
        fontWeight: '500',
    },
    profileButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    profilePic: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 52,
        borderRadius: 16,
        paddingHorizontal: 16,
    },
    filterButton: {
        width: 52,
        height: 52,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    greetingText: {
        fontSize: 14,
        color: '#BFDBFE',
        fontWeight: '500',
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 2,
    },
    notificationBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationDot: {
        position: 'absolute',
        top: 10,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#F59E0B',
        borderWidth: 1.5,
        borderColor: '#1E40AF',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        color: '#1E293B',
    },
    filterBtn: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 16,
        padding: 14,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 18,
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
    categorySection: {
        marginTop: 16,
    },
    categoryList: {
        paddingHorizontal: 16,
        gap: 8,
    },
    categoryPill: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 25,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    categoryPillActive: {
        backgroundColor: '#2563EB',
        borderColor: '#2563EB',
        shadowColor: '#2563EB',
        shadowOpacity: 0.3,
        elevation: 4,
    },
    categoryText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
    },
    categoryTextActive: {
        color: '#FFFFFF',
    },
    resultsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 18,
        marginBottom: 8,
    },
    resultsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    resultsCount: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    jobList: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
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
    },
    jobCardSkeleton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    popularSection: {
        marginTop: 24,
    },
    popularHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    popularTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    showAllText: {
        fontSize: 14,
        color: '#2563EB',
        fontWeight: '600',
    },
    popularList: {
        paddingLeft: 20,
        paddingRight: 8,
    },
    popularCard: {
        width: 280,
        marginRight: 16,
        borderRadius: 24,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 6,
        marginBottom: 12,
    },
    popularCardGradient: {
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    popularCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    companyIconBg: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    typeTag: {
        backgroundColor: '#F0FDF4',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    typeTagText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#16A34A',
    },
    popularJobTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 4,
    },
    popularJobCompany: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 16,
    },
    popularCardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    popularJobSalary: {
        fontSize: 14,
        fontWeight: '700',
        color: '#2563EB',
    },
    popularJobLocation: {
        fontSize: 13,
        color: '#94A3B8',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    filterLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#334155',
        marginBottom: 12,
        marginTop: 8,
    },
    filterOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 20,
    },
    filterPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    filterPillActive: {
        backgroundColor: '#2563EB',
        borderColor: '#2563EB',
    },
    filterPillText: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    filterPillTextActive: {
        color: '#FFFFFF',
    },
    applyBtn: {
        backgroundColor: '#2563EB',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 12,
    },
    applyBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resetBtn: {
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    resetBtnText: {
        color: '#64748B',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default HomeScreen;
