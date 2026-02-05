import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, FlatList, RefreshControl, TouchableOpacity,
    Alert, StatusBar, ActivityIndicator, ListRenderItem,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../context/AuthContext';

interface Application {
    id: string;
    jobId: string;
    userId: string;
    jobTitle: string;
    company: string;
    location: string;
    salary: string;
    status: 'Pending' | 'Accepted' | 'Rejected';
    appliedAt: string;
}

const AppliedJobsScreen: React.FC = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchApplications = async (): Promise<void> => {
        try {
            const applicationsRef = collection(db, 'Applications');
            const q = query(applicationsRef, where('userId', '==', user?.uid));
            const snapshot = await getDocs(q);
            const appsList: Application[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
            setApplications(appsList);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchApplications(); }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchApplications();
        setRefreshing(false);
    }, []);

    const handleWithdraw = (application: Application): void => {
        Alert.alert('Withdraw Application', `Are you sure you want to withdraw your application for ${application.jobTitle}?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Withdraw', style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteDoc(doc(db, 'Applications', application.id));
                        setApplications(prev => prev.filter(app => app.id !== application.id));
                        Alert.alert('Success', 'Application withdrawn.');
                    } catch { Alert.alert('Error', 'Failed to withdraw.'); }
                },
            },
        ]);
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Accepted': return { bg: 'bg-green-100', text: 'text-green-700', icon: 'checkmark-circle' };
            case 'Rejected': return { bg: 'bg-red-100', text: 'text-red-700', icon: 'close-circle' };
            default: return { bg: 'bg-amber-100', text: 'text-amber-700', icon: 'time' };
        }
    };

    const renderApplicationCard: ListRenderItem<Application> = ({ item }) => {
        const statusStyle = getStatusStyle(item.status);

        return (
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-md shadow-slate-200 border border-slate-100">
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center flex-1">
                        <View className="w-12 h-12 rounded-xl bg-blue-50 items-center justify-center mr-3 border border-blue-100">
                            <Ionicons name="business" size={24} color="#2563EB" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-lg font-bold text-slate-800" numberOfLines={1}>{item.jobTitle}</Text>
                            <Text className="text-slate-500 font-medium">{item.company}</Text>
                        </View>
                    </View>
                </View>

                {/* Status Badge */}
                <View className={`flex-row items-center self-start px-3 py-1.5 rounded-full mb-4 ${statusStyle.bg}`}>
                    <Ionicons name={statusStyle.icon as any} size={14} className={statusStyle.text} />
                    <Text className={`ml-1.5 text-xs font-bold uppercase tracking-wider ${statusStyle.text}`}>
                        {item.status}
                    </Text>
                </View>

                <View className="flex-row items-center mb-4 space-x-4">
                    <View className="flex-row items-center">
                        <Ionicons name="location-outline" size={14} color="#94A3B8" />
                        <Text className="text-slate-600 ml-1 text-sm">{item.location}</Text>
                    </View>
                    <View className="flex-row items-center">
                        <Ionicons name="cash-outline" size={14} color="#94A3B8" />
                        <Text className="text-slate-600 ml-1 text-sm">{item.salary}</Text>
                    </View>
                </View>

                <View className="flex-row items-center justify-between pt-4 border-t border-slate-100">
                    <Text className="text-slate-400 text-xs">Applied on {new Date(item.appliedAt).toLocaleDateString()}</Text>
                    {item.status === 'Pending' && (
                        <TouchableOpacity
                            className="bg-red-50 px-3 py-1.5 rounded-lg border border-red-100"
                            onPress={() => handleWithdraw(item)}
                        >
                            <Text className="text-red-600 text-xs font-bold">Withdraw</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-slate-50">
                <ActivityIndicator size="large" color="#2563EB" />
                <Text className="mt-3 text-slate-500">Loading your applications...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-50">
            <StatusBar barStyle="light-content" />
            <FlatList
                data={applications}
                renderItem={renderApplicationCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={() => (
                    <LinearGradient
                        colors={['#1E40AF', '#7C3AED']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="pt-14 pb-8 px-6 rounded-b-[40px] shadow-lg mb-6"
                    >
                        <Text className="text-white text-3xl font-bold mb-1">Applications</Text>
                        <Text className="text-blue-100 text-base mb-6">Track your career progress</Text>

                        <View className="flex-row justify-between bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                            <View className="items-center flex-1 border-r border-white/10">
                                <Text className="text-white text-xl font-bold">{applications.filter(a => a.status === 'Pending').length}</Text>
                                <Text className="text-blue-200 text-xs uppercase font-bold mt-1">Pending</Text>
                            </View>
                            <View className="items-center flex-1 border-r border-white/10">
                                <Text className="text-green-300 text-xl font-bold">{applications.filter(a => a.status === 'Accepted').length}</Text>
                                <Text className="text-blue-200 text-xs uppercase font-bold mt-1">Accepted</Text>
                            </View>
                            <View className="items-center flex-1">
                                <Text className="text-red-300 text-xl font-bold">{applications.filter(a => a.status === 'Rejected').length}</Text>
                                <Text className="text-blue-200 text-xs uppercase font-bold mt-1">Rejected</Text>
                            </View>
                        </View>
                    </LinearGradient>
                )}
                ListEmptyComponent={() => (
                    <View className="items-center pt-20 px-10">
                        <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-4">
                            <Ionicons name="document-text-outline" size={40} color="#94A3B8" />
                        </View>
                        <Text className="text-xl font-bold text-slate-700 mb-2">No Applications Yet</Text>
                        <Text className="text-slate-400 text-center">
                            You haven't applied to any jobs yet. Start exploring and apply to your dream job!
                        </Text>
                    </View>
                )}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
            />
        </View>
    );
};

export default AppliedJobsScreen;
