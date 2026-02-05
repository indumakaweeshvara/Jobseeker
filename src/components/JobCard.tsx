import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../theme/colors';
import { JobCardProps } from '../types';

const JobCard: React.FC<JobCardProps> = ({ job, onPress, showStatus = false, status }) => {
    const getStatusColor = () => {
        switch (status) {
            case 'Accepted':
                return { bg: COLORS.successBg, text: COLORS.success };
            case 'Rejected':
                return { bg: COLORS.errorBg, text: COLORS.error };
            default:
                return { bg: COLORS.warningBg, text: COLORS.warning };
        }
    };

    const statusColors = getStatusColor();

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    <Ionicons name="business" size={28} color={COLORS.primary} />
                </View>
                <View style={styles.headerInfo}>
                    <Text style={styles.title} numberOfLines={1}>
                        {job.title}
                    </Text>
                    <Text style={styles.company} numberOfLines={1}>
                        {job.company}
                    </Text>
                </View>
                {showStatus && status && (
                    <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                        <Text style={[styles.statusText, { color: statusColors.text }]}>
                            {status}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.details}>
                <View style={styles.detailItem}>
                    <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.detailText}>{job.location}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Ionicons name="cash-outline" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.detailText}>{job.salary}</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.tags}>
                    <View style={styles.tag}>
                        <Text style={styles.tagText}>Full-time</Text>
                    </View>
                    <View style={styles.tag}>
                        <Text style={styles.tagText}>Remote</Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: 16,
        marginBottom: 12,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    logoContainer: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: COLORS.infoBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    headerInfo: {
        flex: 1,
    },
    title: {
        fontSize: SIZES.lg,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    company: {
        fontSize: SIZES.md,
        color: COLORS.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusText: {
        fontSize: SIZES.sm,
        fontWeight: '600',
    },
    details: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    detailText: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        marginLeft: 4,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: 12,
    },
    tags: {
        flexDirection: 'row',
    },
    tag: {
        backgroundColor: COLORS.background,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        marginRight: 8,
    },
    tagText: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
});

export default JobCard;
