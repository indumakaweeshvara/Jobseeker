import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
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
import CustomButton from '../components/CustomButton';
import { useAuth } from '../context/AuthContext';
import { JobDetailScreenNavigationProp, JobDetailScreenRouteProp } from '../types';

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
        <View className="flex-1 bg-slate-50">
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <LinearGradient
                colors={['#1E40AF', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="pt-12 pb-6 px-6 flex-row justify-between items-center z-10"
            >
                <TouchableOpacity
                    className="w-10 h-10 rounded-xl bg-white/20 items-center justify-center backdrop-blur-md"
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold">Job Details</Text>
                <TouchableOpacity className="w-10 h-10 rounded-xl bg-white/20 items-center justify-center backdrop-blur-md">
                    <Ionicons name="share-outline" size={24} color="white" />
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* Background Decor */}
                <View className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-blue-700 to-purple-600" />
                <LinearGradient
                    colors={['#1E40AF', '#7C3AED']}
                    className="absolute top-0 left-0 right-0 h-32 rounded-b-[40px]"
                />

                {/* Company Card */}
                <View className="mx-6 -mt-8 bg-white rounded-[24px] p-6 shadow-xl shadow-slate-200/50 items-center">
                    <View className="w-20 h-20 bg-blue-50 rounded-2xl items-center justify-center -mt-12 mb-4 border-4 border-white shadow-sm">
                        <Ionicons name="business" size={40} color="#2563EB" />
                    </View>
                    <Text className="text-2xl font-bold text-slate-800 text-center mb-1">{job.title}</Text>
                    <Text className="text-slate-500 text-base font-medium mb-4">{job.company}</Text>

                    <View className="flex-row flex-wrap justify-center gap-2">
                        <View className="flex-row items-center bg-blue-50 px-3 py-1.5 rounded-full">
                            <Ionicons name="location-outline" size={14} color="#2563EB" />
                            <Text className="text-blue-700 text-xs font-semibold ml-1">{job.location}</Text>
                        </View>
                        <View className="flex-row items-center bg-purple-50 px-3 py-1.5 rounded-full">
                            <Ionicons name="time-outline" size={14} color="#7C3AED" />
                            <Text className="text-purple-700 text-xs font-semibold ml-1">Full-time</Text>
                        </View>
                        <View className="flex-row items-center bg-green-50 px-3 py-1.5 rounded-full">
                            <Ionicons name="cash-outline" size={14} color="#16A34A" />
                            <Text className="text-green-700 text-xs font-semibold ml-1">{job.salary}</Text>
                        </View>
                    </View>
                </View>

                {/* Description Section */}
                <View className="mx-6 mt-6">
                    <Text className="text-lg font-bold text-slate-800 mb-3">Job Description</Text>
                    <Text className="text-slate-500 text-base leading-6">
                        {job.description ||
                            `We are looking for a talented ${job.title} to join our team at ${job.company}. \n\nThis is an excellent opportunity to work with a dynamic team and grow your career in a supportive environment.`}
                    </Text>
                </View>

                {/* Requirements Section */}
                <View className="mx-6 mt-8">
                    <Text className="text-lg font-bold text-slate-800 mb-4">Requirements</Text>
                    {[
                        "Bachelor's degree or equivalent",
                        "2+ years of experience",
                        "Excellent communication skills",
                        "Team collaboration experience"
                    ].map((req, index) => (
                        <View key={index} className="flex-row items-center mb-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                            <View className="w-6 h-6 rounded-full bg-green-100 items-center justify-center mr-3">
                                <Ionicons name="checkmark" size={14} color="#16A34A" />
                            </View>
                            <Text className="text-slate-600 font-medium flex-1">{req}</Text>
                        </View>
                    ))}
                </View>

                {/* Benefits Section Mock */}
                <View className="mx-6 mt-8">
                    <Text className="text-lg font-bold text-slate-800 mb-4">Perks & Benefits</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
                        {[
                            { icon: 'medkit-outline', label: 'Health' },
                            { icon: 'cafe-outline', label: 'Coffee' },
                            { icon: 'airplane-outline', label: 'Travel' },
                            { icon: 'fitness-outline', label: 'Gym' },
                            { icon: 'school-outline', label: 'Learning' }
                        ].map((item, i) => (
                            <View key={i} className="mr-4 items-center">
                                <View className="w-14 h-14 bg-white rounded-2xl border border-slate-100 items-center justify-center shadow-sm mb-2">
                                    <Ionicons name={item.icon as any} size={24} color="#2563EB" />
                                </View>
                                <Text className="text-xs text-slate-500 font-medium">{item.label}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </ScrollView>

            {/* Bottom Bar */}
            <View className="absolute bottom-0 left-0 right-0 bg-white p-5 rounded-t-[30px] shadow-2xl shadow-black border-t border-slate-50">
                {checkingStatus ? (
                    <ActivityIndicator size="small" color="#2563EB" />
                ) : hasApplied ? (
                    <View className="flex-row items-center justify-center bg-green-50 py-4 rounded-2xl border border-green-100">
                        <Ionicons name="checkmark-circle" size={24} color="#16A34A" />
                        <Text className="ml-2 text-green-700 font-bold text-lg">Application Submitted</Text>
                    </View>
                ) : (
                    <CustomButton
                        title="Apply Now"
                        onPress={handleApply}
                        type="gradient"
                        loading={loading}
                    />
                )}
            </View>
        </View>
    );
};

export default JobDetailScreen;
