import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity,
    Alert, StatusBar, ActivityIndicator, ListRenderItem,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { COLORS, SIZES } from '../theme/colors';
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
        Alert.alert('Withdraw Application', `Withdraw application for ${application.jobTitle}?`, [
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

    const renderApplicationCard: ListRenderItem<Application> = ({ item }) => (
        <View style={styles.applicationCard}>
            <View style={styles.cardHeader}>
                <View style={styles.logoContainer}><Ionicons name="business" size={28} color={COLORS.primary} /></View>
                <View style={styles.cardInfo}>
                    <Text style={styles.jobTitle} numberOfLines={1}>{item.jobTitle}</Text>
                    <Text style={styles.companyName}>{item.company}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'Accepted' ? COLORS.successBg : item.status === 'Rejected' ? COLORS.errorBg : COLORS.warningBg }]}>
                    <Text style={[styles.statusText, { color: item.status === 'Accepted' ? COLORS.success : item.status === 'Rejected' ? COLORS.error : COLORS.warning }]}>{item.status}</Text>
                </View>
            </View>
            <View style={styles.cardDetails}>
                <View style={styles.detailItem}><Ionicons name="location-outline" size={16} color={COLORS.textSecondary} /><Text style={styles.detailText}>{item.location}</Text></View>
                <View style={styles.detailItem}><Ionicons name="cash-outline" size={16} color={COLORS.textSecondary} /><Text style={styles.detailText}>{item.salary}</Text></View>
            </View>
            <View style={styles.cardFooter}>
                <Text style={styles.appliedDate}>Applied: {new Date(item.appliedAt).toLocaleDateString()}</Text>
                {item.status === 'Pending' && (
                    <TouchableOpacity style={styles.withdrawButton} onPress={() => handleWithdraw(item)}>
                        <Text style={styles.withdrawText}>Withdraw</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    if (loading) {
        return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.primary} /><Text style={styles.loadingText}>Loading...</Text></View>;
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <FlatList
                data={applications}
                renderItem={renderApplicationCard}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={() => (
                    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
                        <Text style={styles.headerTitle}>My Applications</Text>
                        <Text style={styles.headerSubtitle}>{applications.length} Applications</Text>
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}><Text style={styles.statValue}>{applications.filter(a => a.status === 'Pending').length}</Text><Text style={styles.statLabel}>Pending</Text></View>
                            <View style={styles.statItem}><Text style={styles.statValue}>{applications.filter(a => a.status === 'Accepted').length}</Text><Text style={styles.statLabel}>Accepted</Text></View>
                            <View style={styles.statItem}><Text style={styles.statValue}>{applications.filter(a => a.status === 'Rejected').length}</Text><Text style={styles.statLabel}>Rejected</Text></View>
                        </View>
                    </LinearGradient>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}><Ionicons name="document-text-outline" size={60} color={COLORS.textLight} /><Text style={styles.emptyText}>No Applications Yet</Text></View>
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
    header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 24, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    headerTitle: { fontSize: 26, fontWeight: '700', color: COLORS.white, marginBottom: 4 },
    headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 20 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    statItem: { alignItems: 'center' },
    statValue: { fontSize: 18, fontWeight: '700', color: COLORS.white },
    statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
    listContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },
    applicationCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 12, elevation: 3 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    logoContainer: { width: 50, height: 50, borderRadius: 12, backgroundColor: COLORS.infoBg, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    cardInfo: { flex: 1 },
    jobTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
    companyName: { fontSize: 14, color: COLORS.textSecondary },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    statusText: { fontSize: 12, fontWeight: '600' },
    cardDetails: { flexDirection: 'row', marginBottom: 12 },
    detailItem: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
    detailText: { fontSize: 13, color: COLORS.textSecondary, marginLeft: 4 },
    cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12 },
    appliedDate: { fontSize: 12, color: COLORS.textSecondary },
    withdrawButton: { backgroundColor: COLORS.errorBg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    withdrawText: { fontSize: 13, fontWeight: '600', color: COLORS.error },
    emptyContainer: { alignItems: 'center', paddingTop: 60 },
    emptyText: { fontSize: 20, fontWeight: '600', color: COLORS.textPrimary, marginTop: 16 },
});

export default AppliedJobsScreen;
