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
    ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
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
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = ['All', 'Design', 'Development', 'Marketing', 'Finance'];

    const fetchJobs = async (): Promise<void> => {
        try {
            const jobsRef = collection(db, 'Jobs');
            const snapshot = await getDocs(jobsRef);
            const jobsList: Job[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
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
        let result = jobs;

        if (searchQuery) {
            result = result.filter(job =>
                job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.location?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (activeCategory !== 'All') {
            // Filter by category logic here if available
        }

        setFilteredJobs(result);
    }, [searchQuery, jobs, activeCategory]);

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
        } catch {
            Alert.alert('Error', 'Failed to add jobs');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-slate-50">
                <ActivityIndicator size="large" color="#2563EB" />
                <Text className="mt-4 text-slate-500 font-medium">
                    Finding your next career...
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-50">
            <StatusBar barStyle="light-content" />
            <FlatList
                data={filteredJobs}
                renderItem={renderJobCard}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={() => (
                    <>
                        <LinearGradient
                            colors={['#1E40AF', '#7C3AED']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="pt-14 pb-8 px-6 rounded-b-[40px] shadow-lg mb-6"
                            style={{
                                shadowColor: '#2563EB',
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.2,
                                shadowRadius: 16,
                            }}
                        >
                            {/* Header */}
                            <View className="flex-row justify-between items-center mb-6">
                                <View>
                                    <Text className="text-blue-100 text-base font-medium">Good Morning,</Text>
                                    <Text className="text-white text-2xl font-bold">
                                        {userData?.name || 'Job Seeker'} 👋
                                    </Text>
                                </View>
                                <TouchableOpacity className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center backdrop-blur-md border border-white/10">
                                    <View className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#7C3AED]" />
                                    <Ionicons name="notifications-outline" size={24} color="white" />
                                </TouchableOpacity>
                            </View>

                            {/* Search Bar */}
                            <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 shadow-md mb-6">
                                <Ionicons name="search-outline" size={22} color="#94A3B8" />
                                <TextInput
                                    className="flex-1 ml-3 text-base text-slate-800"
                                    placeholder="Search for jobs, companies..."
                                    placeholderTextColor="#94A3B8"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                                <TouchableOpacity className="bg-blue-50 p-2 rounded-xl">
                                    <Ionicons name="options-outline" size={20} color="#2563EB" />
                                </TouchableOpacity>
                            </View>

                            {/* Stats */}
                            <View className="flex-row justify-between space-x-3">
                                <View className="flex-1 bg-white/10 p-3 rounded-2xl border border-white/10 items-center justify-center">
                                    <Text className="text-white font-bold text-xl">{jobs.length}</Text>
                                    <Text className="text-blue-100 text-xs mt-1">Open Jobs</Text>
                                </View>
                                <View className="flex-1 bg-white/10 p-3 rounded-2xl border border-white/10 items-center justify-center">
                                    <Text className="text-white font-bold text-xl">12</Text>
                                    <Text className="text-blue-100 text-xs mt-1">New</Text>
                                </View>
                                <View className="flex-1 bg-white/10 p-3 rounded-2xl border border-white/10 items-center justify-center">
                                    <Text className="text-white font-bold text-xl">5</Text>
                                    <Text className="text-blue-100 text-xs mt-1">Applied</Text>
                                </View>
                            </View>
                        </LinearGradient>

                        {/* Categories */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="px-6 mb-6"
                            contentContainerStyle={{ paddingRight: 24 }}
                        >
                            {categories.map((cat, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => setActiveCategory(cat)}
                                    className={`mr-3 px-5 py-2.5 rounded-full border ${
                                        activeCategory === cat
                                            ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-500/30'
                                            : 'bg-white border-slate-200'
                                    }`}
                                >
                                    <Text
                                        className={`font-semibold text-sm ${
                                            activeCategory === cat ? 'text-white' : 'text-slate-500'
                                        }`}
                                    >
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View className="px-6 flex-row justify-between items-end mb-4">
                            <Text className="text-xl font-bold text-slate-800">Recent Jobs</Text>
                            <TouchableOpacity>
                                <Text className="text-blue-600 text-sm font-semibold">View All</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
                ListEmptyComponent={() => (
                    <View className="items-center pt-10 px-6">
                        <View className="w-24 h-24 bg-slate-100 rounded-full items-center justify-center mb-4">
                            <Ionicons name="briefcase-outline" size={40} color="#94A3B8" />
                        </View>
                        <Text className="text-xl font-bold text-slate-700">No Jobs Found</Text>
                        <Text className="text-slate-400 text-center mt-2 mb-6">
                            We couldn't find any jobs matching your search. Try different keywords.
                        </Text>
                        <TouchableOpacity
                            className="bg-blue-600 px-6 py-3 rounded-xl shadow-lg shadow-blue-500/30"
                            onPress={handleSeedJobs}
                        >
                            <Text className="text-white font-bold">Post Sample Jobs</Text>
                        </TouchableOpacity>
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
            />
        </View>
    );
};

export default HomeScreen;
