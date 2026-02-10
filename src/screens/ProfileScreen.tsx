import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    StatusBar,
    ActivityIndicator,
    Image,
    StyleSheet,
    Dimensions,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc, collection, query, where, getDocs, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../services/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { uploadResume, deleteResume } from '../services/resumeService';

const { width } = Dimensions.get('window');

const ProfileScreen: React.FC = () => {
    const { user, userData, logout, refreshUserData } = useAuth();
    const { colors, isDark, toggleTheme } = useTheme();
    const [uploading, setUploading] = useState(false);
    const [resuming, setResuming] = useState(false);
    const [newSkill, setNewSkill] = useState('');
    const [showSkillInput, setShowSkillInput] = useState(false);

    const [applicationsCount, setApplicationsCount] = useState(0);
    const [savedCount, setSavedCount] = useState(0);

    const fetchStats = async () => {
        if (!user) return;
        try {
            // Applications count
            const appsQuery = query(collection(db, 'Applications'), where('userId', '==', user.uid));
            const appsSnapshot = await getDocs(appsQuery);
            setApplicationsCount(appsSnapshot.size);

            // Saved count
            const savedQuery = query(collection(db, 'SavedJobs'), where('userId', '==', user.uid));
            const savedSnapshot = await getDocs(savedQuery);
            setSavedCount(savedSnapshot.size);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [user]);

    const handlePickImage = async () => {
        try {
            const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permResult.granted) {
                Alert.alert('Permission Needed', 'Camera roll permission is required.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (!result.canceled && result.assets[0] && user) {
                setUploading(true);
                try {
                    const response = await fetch(result.assets[0].uri);
                    const blob = await response.blob();
                    const storageRef = ref(storage, `profilePics/${user.uid}`);
                    await uploadBytes(storageRef, blob);
                    const downloadURL = await getDownloadURL(storageRef);
                    await updateDoc(doc(db, 'Users', user.uid), { profilePic: downloadURL });
                    await refreshUserData();
                    Alert.alert('✅ Success', 'Profile photo updated!');
                } catch (error: any) {
                    Alert.alert('Error', error.message || 'Failed to upload photo');
                } finally {
                    setUploading(false);
                }
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const handlePickResume = async () => {
        if (!user) return;
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets[0]) {
                setResuming(true);
                const file = result.assets[0];
                const uploadResult = await uploadResume(user.uid, file.uri, file.name);

                if (uploadResult.success) {
                    await refreshUserData();
                    Alert.alert('✅ Success', 'Resume uploaded successfully!');
                } else {
                    Alert.alert('Error', uploadResult.error || 'Failed to upload resume');
                }
                setResuming(false);
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
            setResuming(false);
        }
    };

    const handleDeleteResume = () => {
        if (!user || !userData?.resumeName) return;
        Alert.alert(
            'Delete Resume',
            'Are you sure you want to remove your resume?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setResuming(true);
                        const result = await deleteResume(user.uid, userData.resumeName!);
                        if (result.success) {
                            await refreshUserData();
                            Alert.alert('Success', 'Resume deleted');
                        } else {
                            Alert.alert('Error', result.error);
                        }
                        setResuming(false);
                    },
                },
            ]
        );
    };

    const handleAddSkill = async () => {
        if (!user || !newSkill.trim()) return;
        try {
            await updateDoc(doc(db, 'Users', user.uid), {
                skills: arrayUnion(newSkill.trim())
            });
            setNewSkill('');
            setShowSkillInput(false);
            await refreshUserData();
        } catch (error) {
            Alert.alert('Error', 'Failed to add skill');
        }
    };

    const handleRemoveSkill = async (skill: string) => {
        if (!user) return;
        try {
            await updateDoc(doc(db, 'Users', user.uid), {
                skills: arrayRemove(skill)
            });
            await refreshUserData();
        } catch (error) {
            Alert.alert('Error', 'Failed to remove skill');
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        const result = await logout();
                        if (!result.success) {
                            Alert.alert('Error', result.error);
                        }
                    },
                },
            ]
        );
    };

    const menuItems = [
        { icon: 'person-outline' as const, title: 'Edit Profile', subtitle: 'Update your information', color: '#2563EB' },
        { icon: 'document-text-outline' as const, title: 'My Resume', subtitle: 'Manage your resume', color: '#7C3AED' },
        { icon: 'moon-outline' as const, title: 'Dark Mode', subtitle: isDark ? 'On' : 'Off', color: '#6366F1', isToggle: true },
        { icon: 'notifications-outline' as const, title: 'Notifications', subtitle: 'Manage alerts', color: '#F59E0B' },
        { icon: 'shield-checkmark-outline' as const, title: 'Privacy & Security', subtitle: 'Account security settings', color: '#10B981' },
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" />
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <LinearGradient
                    colors={['#1E40AF', '#3B82F6', '#7C3AED']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <Text style={styles.headerTitle}>My Profile</Text>

                    {/* Profile Photo */}
                    <View style={styles.avatarSection}>
                        <TouchableOpacity
                            style={styles.avatarContainer}
                            onPress={handlePickImage}
                            disabled={uploading}
                        >
                            {userData?.profilePic ? (
                                <View>
                                    <Image
                                        source={{ uri: userData.profilePic }}
                                        style={[styles.avatar, { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.4)' }]}
                                    />
                                </View>
                            ) : (
                                <View style={[styles.avatarPlaceholder, { backgroundColor: isDark ? colors.card : '#E2E8F0', borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.4)' }]}>
                                    <Ionicons name="person" size={40} color={isDark ? colors.textSecondary : "#94A3B8"} />
                                </View>
                            )}

                            {uploading ? (
                                <View style={styles.uploadingOverlay}>
                                    <ActivityIndicator color="#FFF" />
                                </View>
                            ) : (
                                <View style={[styles.cameraBtn, { borderColor: colors.background }]}>
                                    <Ionicons name="camera" size={14} color="#FFF" />
                                </View>
                            )}
                        </TouchableOpacity>

                        <Text style={styles.userName}>{userData?.name || 'User'}</Text>
                        <Text style={[styles.userEmail, { color: isDark ? colors.textSecondary : '#BFDBFE' }]}>{userData?.email || user?.email}</Text>

                        {/* Quick Stats */}
                        <View style={[styles.quickStats, { backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.1)' }]}>
                            <View style={styles.quickStatItem}>
                                <Text style={styles.quickStatValue}>{applicationsCount}</Text>
                                <Text style={[styles.quickStatLabel, { color: isDark ? colors.textSecondary : '#BFDBFE' }]}>Applied</Text>
                            </View>
                            <View style={[styles.quickStatDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)' }]} />
                            <View style={styles.quickStatItem}>
                                <Text style={styles.quickStatValue}>{savedCount}</Text>
                                <Text style={[styles.quickStatLabel, { color: isDark ? colors.textSecondary : '#BFDBFE' }]}>Saved</Text>
                            </View>
                        </View>
                    </View>
                </LinearGradient>

                {/* Skills Section */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Technical Skills</Text>
                        <TouchableOpacity onPress={() => setShowSkillInput(!showSkillInput)}>
                            <Ionicons
                                name={showSkillInput ? "close-circle" : "add-circle"}
                                size={24}
                                color={colors.primary}
                            />
                        </TouchableOpacity>
                    </View>

                    {showSkillInput && (
                        <View style={styles.skillInputWrapper}>
                            <View style={styles.skillInputContainer}>
                                <TextInput
                                    style={[styles.skillInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.textPrimary }]}
                                    placeholder="Enter skill (e.g. React Native)"
                                    placeholderTextColor={colors.textSecondary}
                                    value={newSkill}
                                    onChangeText={setNewSkill}
                                    autoFocus
                                />
                                <TouchableOpacity style={[styles.addSkillBtn, { backgroundColor: colors.primary }]} onPress={handleAddSkill}>
                                    <Text style={styles.addSkillBtnText}>Add</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    <View style={styles.skillsWrapper}>
                        {userData?.skills && userData.skills.length > 0 ? (
                            userData.skills.map((skill, index) => (
                                <View key={index} style={[styles.skillBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                    <Text style={[styles.skillText, { color: colors.textPrimary }]}>{skill}</Text>
                                    <TouchableOpacity onPress={() => handleRemoveSkill(skill)}>
                                        <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>
                            ))
                        ) : (
                            <Text style={[styles.emptySkillsText, { color: colors.textSecondary }]}>No skills added yet</Text>
                        )}
                    </View>
                </View>

                {/* Resume Section */}
                <View style={[styles.sectionContainer, { marginTop: 12 }]}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>My Resume</Text>
                    {userData?.resumeUrl ? (
                        <View style={[styles.resumeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={[styles.resumeIconBg, { backgroundColor: colors.primary + '15' }]}>
                                <Ionicons name="document-text" size={30} color={colors.primary} />
                            </View>
                            <View style={styles.resumeInfo}>
                                <Text style={[styles.resumeName, { color: colors.textPrimary }]} numberOfLines={1}>
                                    {userData.resumeName || 'Resume.pdf'}
                                </Text>
                                <Text style={[styles.resumeStatus, { color: colors.textSecondary }]}>PDF Document • Uploaded</Text>
                            </View>
                            <TouchableOpacity style={styles.deleteResumeBtn} onPress={handleDeleteResume}>
                                <Ionicons name="trash-outline" size={20} color={colors.error} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[styles.uploadResumePlaceholder, { backgroundColor: colors.card, borderColor: colors.border }]}
                            onPress={handlePickResume}
                            disabled={resuming}
                        >
                            {resuming ? (
                                <ActivityIndicator color={colors.primary} />
                            ) : (
                                <>
                                    <Ionicons name="cloud-upload-outline" size={32} color={colors.textSecondary} />
                                    <Text style={[styles.uploadResumeText, { color: colors.textPrimary }]}>Upload your PDF resume</Text>
                                    <Text style={[styles.uploadResumeSubtext, { color: colors.textSecondary }]}>Max size 5MB</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                {/* Info Cards */}
                <View style={styles.infoCardRow}>
                    <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
                        <View style={[styles.infoIconBg, { backgroundColor: colors.primary + '15' }]}>
                            <Ionicons name="mail-outline" size={18} color={colors.primary} />
                        </View>
                        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email</Text>
                        <Text style={[styles.infoValue, { color: colors.textPrimary }]} numberOfLines={1}>
                            {userData?.email || user?.email || 'Not set'}
                        </Text>
                    </View>
                    <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
                        <View style={[styles.infoIconBg, { backgroundColor: colors.success + '15' }]}>
                            <Ionicons name="call-outline" size={18} color={colors.success} />
                        </View>
                        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Phone</Text>
                        <Text style={[styles.infoValue, { color: colors.textPrimary }]} numberOfLines={1}>
                            {userData?.phone || 'Not set'}
                        </Text>
                    </View>
                </View>

                {/* Menu Items */}
                <View style={styles.menuSection}>
                    <Text style={[styles.menuSectionTitle, { color: colors.textPrimary }]}>Settings</Text>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.menuItem, { backgroundColor: colors.card }]}
                            activeOpacity={0.7}
                            onPress={() => item.isToggle ? toggleTheme() : null}
                        >
                            <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
                                <Ionicons name={item.icon} size={20} color={item.color} />
                            </View>
                            <View style={styles.menuInfo}>
                                <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                                <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
                            </View>
                            {item.isToggle ? (
                                <View style={[styles.toggleContainer, { backgroundColor: isDark ? colors.primary : colors.border }]}>
                                    <View style={[styles.toggleCircle, { transform: [{ translateX: isDark ? 20 : 0 }] }]} />
                                </View>
                            ) : (
                                <Ionicons name="chevron-forward" size={18} color={isDark ? colors.border : "#CBD5E1"} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    style={[styles.logoutBtn, { backgroundColor: colors.error + '10', borderColor: colors.error + '25' }]}
                    onPress={handleLogout}
                    activeOpacity={0.8}
                >
                    <Ionicons name="log-out-outline" size={20} color={colors.error} />
                    <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
                </TouchableOpacity>

                <Text style={[styles.version, { color: colors.textSecondary }]}>Version 1.0.0</Text>
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F5F9',
    },
    header: {
        paddingTop: 56,
        paddingBottom: 32,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        alignSelf: 'flex-start',
        marginBottom: 20,
    },
    avatarSection: {
        alignItems: 'center',
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 14,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    uploadingOverlay: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cameraBtn: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#2563EB',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#BFDBFE',
    },
    quickStats: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 16,
    },
    quickStatItem: {
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    quickStatValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    quickStatLabel: {
        fontSize: 11,
        color: '#BFDBFE',
        marginTop: 2,
    },
    quickStatDivider: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    infoCardRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 12,
        marginTop: -16,
    },
    infoCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 16,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    infoIconBg: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    infoLabel: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '500',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1E293B',
    },
    menuSection: {
        paddingHorizontal: 16,
        marginTop: 24,
    },
    menuSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 12,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        marginBottom: 8,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    menuInfo: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 2,
    },
    menuSubtitle: {
        fontSize: 12,
        color: '#94A3B8',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginHorizontal: 16,
        marginTop: 24,
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#FEE2E2',
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    logoutText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#EF4444',
    },
    version: {
        textAlign: 'center',
        fontSize: 12,
        color: '#CBD5E1',
        marginTop: 16,
    },
    sectionContainer: {
        paddingHorizontal: 16,
        marginTop: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    skillsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    skillBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    skillText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#334155',
    },
    emptySkillsText: {
        color: '#94A3B8',
        fontStyle: 'italic',
        fontSize: 13,
    },
    skillInputWrapper: {
        marginBottom: 16,
    },
    skillInputContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    skillInput: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 14,
    },
    addSkillBtn: {
        backgroundColor: '#2563EB',
        borderRadius: 12,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    addSkillBtnText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    resumeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    resumeIconBg: {
        width: 50,
        height: 50,
        borderRadius: 14,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    resumeInfo: {
        flex: 1,
        marginLeft: 14,
    },
    resumeName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    resumeStatus: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    deleteResumeBtn: {
        padding: 10,
    },
    uploadResumePlaceholder: {
        height: 120,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadResumeText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#475569',
        marginTop: 8,
    },
    uploadResumeSubtext: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 2,
    },
    toggleContainer: {
        width: 44,
        height: 24,
        borderRadius: 12,
        padding: 2,
        justifyContent: 'center',
    },
    toggleCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#FFF',
    },
});

export default ProfileScreen;
