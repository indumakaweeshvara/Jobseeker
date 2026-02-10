import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { JobCardProps } from '../types';
import { useTheme } from '../context/ThemeContext';

const getCategoryConfig = (category: string) => {
    switch (category) {
        case 'Development':
            return { icon: 'code-slash' as const, gradient: ['#2563EB', '#1D4ED8'] as const, bg: '#EFF6FF' };
        case 'Design':
            return { icon: 'color-palette' as const, gradient: ['#7C3AED', '#6D28D9'] as const, bg: '#F5F3FF' };
        case 'Marketing':
            return { icon: 'megaphone' as const, gradient: ['#F59E0B', '#D97706'] as const, bg: '#FFFBEB' };
        case 'Finance':
            return { icon: 'bar-chart' as const, gradient: ['#10B981', '#059669'] as const, bg: '#ECFDF5' };
        case 'Sales':
            return { icon: 'trending-up' as const, gradient: ['#EF4444', '#DC2626'] as const, bg: '#FEF2F2' };
        case 'Engineering':
            return { icon: 'hardware-chip' as const, gradient: ['#0EA5E9', '#0284C7'] as const, bg: '#F0F9FF' };
        default:
            return { icon: 'briefcase' as const, gradient: ['#64748B', '#475569'] as const, bg: '#F8FAFC' };
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

const JobCard = React.memo(({ job, onPress, index = 0 }: JobCardProps & { index?: number }) => {
    const { colors, isDark } = useTheme();
    const config = getCategoryConfig(job.category || '');
    const initials = getCompanyInitials(job.company);

    const translateY = React.useRef(new Animated.Value(20)).current;
    const opacity = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 0,
                duration: 500,
                delay: index * 50,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 500,
                delay: index * 50,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View style={{ opacity, transform: [{ translateY }] }}>
            <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <View style={styles.topRow}>
                    <LinearGradient
                        colors={[...config.gradient]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.companyLogo}
                    >
                        <Text style={styles.companyInitials}>{initials}</Text>
                    </LinearGradient>

                    <View style={styles.topRight}>
                        <View style={[styles.categoryIcon, { backgroundColor: config.gradient[0] + '15' }]}>
                            <Ionicons name={config.icon} size={14} color={config.gradient[0]} />
                        </View>
                        <TouchableOpacity style={[styles.bookmarkSmallBtn, { backgroundColor: isDark ? colors.background : '#F8FAFC' }]}>
                            <Ionicons name="bookmark-outline" size={16} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>{job.title}</Text>
                <Text style={[styles.company, { color: colors.textSecondary }]} numberOfLines={1}>{job.company}</Text>

                <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                        <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                        <Text style={[styles.detailText, { color: colors.textSecondary }]}>{job.location}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                        <Text style={[styles.detailText, { color: colors.textSecondary }]}>{job.type || 'Full-time'}</Text>
                    </View>
                </View>

                <View style={[styles.bottomRow, { borderTopColor: colors.border }]}>
                    <View>
                        <Text style={styles.salaryLabel}>Monthly</Text>
                        <Text style={styles.salary}>{job.salary || 'Negotiable'}</Text>
                    </View>
                    <LinearGradient
                        colors={['#2563EB', '#7C3AED']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.arrowBtn}
                    >
                        <Ionicons name="arrow-forward" size={16} color="#FFF" />
                    </LinearGradient>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
});

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 18,
        marginBottom: 16,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    companyLogo: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    companyInitials: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    topRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    categoryIcon: {
        width: 30,
        height: 30,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bookmarkSmallBtn: {
        width: 30,
        height: 30,
        borderRadius: 10,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 4,
    },
    company: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
        marginBottom: 12,
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 16,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 14,
    },
    salaryLabel: {
        fontSize: 10,
        color: '#94A3B8',
        fontWeight: '500',
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    salary: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#10B981',
    },
    arrowBtn: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default JobCard;
