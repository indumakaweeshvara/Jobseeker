import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { JobCardProps } from '../types';

const JobCard: React.FC<JobCardProps> = ({ job, onPress, showStatus = false, status }) => {
    const getStatusColor = () => {
        switch (status) {
            case 'Accepted':
                return { bg: 'bg-green-100', text: 'text-green-600', icon: 'checkmark-circle' };
            case 'Rejected':
                return { bg: 'bg-red-100', text: 'text-red-600', icon: 'close-circle' };
            default:
                return { bg: 'bg-amber-100', text: 'text-amber-600', icon: 'time' };
        }
    };

    const statusInfo = getStatusColor();

    return (
        <TouchableOpacity
            className="bg-white rounded-[20px] p-5 mb-4 shadow-sm border border-slate-100 active:bg-slate-50"
            onPress={onPress}
            activeOpacity={0.7}
            style={{
                shadowColor: '#64748B',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
                elevation: 3,
            }}
        >
            <View className="flex-row items-start mb-4">
                <View className="w-14 h-14 rounded-2xl bg-blue-50 items-center justify-center mr-4 border border-blue-100">
                    <Ionicons name="business" size={26} color="#2563EB" />
                </View>

                <View className="flex-1">
                    <View className="flex-row justify-between items-start">
                        <Text className="text-lg font-bold text-slate-800 flex-1 mr-2" numberOfLines={1}>
                            {job.title}
                        </Text>
                        {showStatus && status && (
                            <View className={`px-2.5 py-1 rounded-full flex-row items-center ${statusInfo.bg}`}>
                                <Ionicons name={statusInfo.icon as any} size={12} className={`mr-1 ${statusInfo.text}`} />
                                <Text className={`text-xs font-bold ${statusInfo.text}`}>
                                    {status}
                                </Text>
                            </View>
                        )}
                    </View>
                    <Text className="text-slate-500 text-sm font-medium mt-1">
                        {job.company}
                    </Text>
                </View>
            </View>

            <View className="flex-row items-center mb-4 space-x-4">
                <View className="flex-row items-center bg-slate-50 px-3 py-1.5 rounded-lg">
                    <Ionicons name="location-outline" size={14} color="#64748B" />
                    <Text className="text-slate-600 text-xs font-semibold ml-1.5">
                        {job.location}
                    </Text>
                </View>
                <View className="flex-row items-center bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                    <Ionicons name="cash-outline" size={14} color="#16A34A" />
                    <Text className="text-green-700 text-xs font-bold ml-1.5">
                        {job.salary}
                    </Text>
                </View>
            </View>

            <View className="flex-row justify-between items-center pt-4 border-t border-slate-100">
                <View className="flex-row space-x-2">
                    <View className="bg-slate-100 px-2.5 py-1 rounded-md">
                        <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">full-time</Text>
                    </View>
                    <View className="bg-slate-100 px-2.5 py-1 rounded-md">
                        <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">remote</Text>
                    </View>
                </View>
                <View className="flex-row items-center">
                    <Text className="text-slate-400 text-xs font-medium mr-1">Details</Text>
                    <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default JobCard;
