import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    StatusBar,
    ActivityIndicator,
    Image,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { db, storage } from '../services/firebaseConfig';
import { COLORS, SIZES } from '../theme/colors';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import { useAuth } from '../context/AuthContext';

const ProfileScreen: React.FC = () => {
    const { user, userData, logout, refreshUserData } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [profileImage, setProfileImage] = useState<string | null>(null);

    useEffect(() => {
        if (userData) {
            setName(userData.name || '');
            setPhone(userData.phone || '');
            setProfileImage(userData.profilePic || null);
        }
    }, [userData]);

    // Request camera permissions
    const requestPermissions = async (): Promise<boolean> => {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
            Alert.alert(
                'Permissions Required',
                'Please enable camera and photo library permissions in settings.'
            );
            return false;
        }
        return true;
    };

    // Pick image from camera or gallery
    const pickImage = async (useCamera: boolean = false): Promise<void> => {
        const hasPermissions = await requestPermissions();
        if (!hasPermissions) return;

        const options: ImagePicker.ImagePickerOptions = {
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        };

        let result;
        if (useCamera) {
            result = await ImagePicker.launchCameraAsync(options);
        } else {
            result = await ImagePicker.launchImageLibraryAsync(options);
        }

        if (!result.canceled && result.assets[0]) {
            uploadProfileImage(result.assets[0].uri);
        }
    };

    // Show image picker options
    const showImageOptions = (): void => {
        Alert.alert(
            'Update Profile Photo',
            'Choose how you want to add a photo',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: '📷 Camera', onPress: () => pickImage(true) },
                { text: '🖼️ Gallery', onPress: () => pickImage(false) },
            ]
        );
    };

    // Upload image to Firebase Storage
    const uploadProfileImage = async (uri: string): Promise<void> => {
        setUploadingImage(true);
        try {
            // Convert URI to blob
            const response = await fetch(uri);
            const blob = await response.blob();

            // Create storage reference
            const imageRef = ref(storage, `profilePhotos/${user?.uid}`);

            // Upload image
            await uploadBytes(imageRef, blob);

            // Get download URL
            const downloadURL = await getDownloadURL(imageRef);

            // Update Firestore with new profile pic URL
            if (user?.uid) {
                await updateDoc(doc(db, 'Users', user.uid), {
                    profilePic: downloadURL,
                    updatedAt: new Date().toISOString(),
                });
            }

            setProfileImage(downloadURL);
            await refreshUserData();
            Alert.alert('Success', 'Profile photo updated!');
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Error', 'Failed to upload photo. Please try again.');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSave = async (): Promise<void> => {
        if (!name.trim()) {
            Alert.alert('Error', 'Name is required');
            return;
        }

        setLoading(true);
        try {
            if (user?.uid) {
                await updateDoc(doc(db, 'Users', user.uid), {
                    name: name.trim(),
                    phone: phone.trim(),
                    updatedAt: new Date().toISOString(),
                });
            }
            await refreshUserData();
            setIsEditing(false);
            Alert.alert('Success', 'Profile updated successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile. Please try again.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = (): void => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                    },
                },
            ]
        );
    };

    const handleCancel = (): void => {
        setName(userData?.name || '');
        setPhone(userData?.phone || '');
        setIsEditing(false);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <LinearGradient
                colors={[COLORS.gradientStart, COLORS.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>My Profile</Text>
                    {!isEditing && (
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => setIsEditing(true)}
                        >
                            <Ionicons name="pencil" size={18} color={COLORS.white} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Profile Avatar with Photo */}
                <View style={styles.avatarContainer}>
                    <TouchableOpacity
                        style={styles.avatarWrapper}
                        onPress={showImageOptions}
                        disabled={uploadingImage}
                    >
                        {uploadingImage ? (
                            <View style={styles.avatar}>
                                <ActivityIndicator size="large" color={COLORS.primary} />
                            </View>
                        ) : profileImage ? (
                            <Image
                                source={{ uri: profileImage }}
                                style={styles.avatarImage}
                            />
                        ) : (
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </Text>
                            </View>
                        )}
                        <View style={styles.cameraIcon}>
                            <Ionicons name="camera" size={16} color={COLORS.white} />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.userName}>{userData?.name || 'User'}</Text>
                    <Text style={styles.userEmail}>{userData?.email || user?.email}</Text>
                    <Text style={styles.tapHint}>Tap photo to change</Text>
                </View>
            </LinearGradient>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Profile Info Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Personal Information</Text>

                    {isEditing ? (
                        <>
                            <InputField
                                label="Full Name"
                                placeholder="Enter your name"
                                value={name}
                                onChangeText={setName}
                                icon="person-outline"
                                autoCapitalize="words"
                            />
                            <InputField
                                label="Phone Number"
                                placeholder="Enter your phone"
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                                icon="call-outline"
                            />
                            <View style={styles.buttonRow}>
                                <CustomButton
                                    title="Cancel"
                                    onPress={handleCancel}
                                    type="outline"
                                    style={styles.cancelButton}
                                />
                                <CustomButton
                                    title="Save"
                                    onPress={handleSave}
                                    type="gradient"
                                    loading={loading}
                                    style={styles.saveButton}
                                />
                            </View>
                        </>
                    ) : (
                        <>
                            <View style={styles.infoItem}>
                                <Ionicons name="person-outline" size={22} color={COLORS.primary} />
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Full Name</Text>
                                    <Text style={styles.infoValue}>{userData?.name || 'Not set'}</Text>
                                </View>
                            </View>
                            <View style={styles.infoItem}>
                                <Ionicons name="mail-outline" size={22} color={COLORS.primary} />
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Email</Text>
                                    <Text style={styles.infoValue}>{userData?.email || user?.email}</Text>
                                </View>
                            </View>
                            <View style={styles.infoItem}>
                                <Ionicons name="call-outline" size={22} color={COLORS.primary} />
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Phone</Text>
                                    <Text style={styles.infoValue}>{userData?.phone || 'Not set'}</Text>
                                </View>
                            </View>
                        </>
                    )}
                </View>

                {/* Settings Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Settings</Text>

                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingLeft}>
                            <View style={[styles.settingIcon, { backgroundColor: COLORS.infoBg }]}>
                                <Ionicons name="notifications-outline" size={20} color={COLORS.info} />
                            </View>
                            <Text style={styles.settingText}>Notifications</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingLeft}>
                            <View style={[styles.settingIcon, { backgroundColor: COLORS.warningBg }]}>
                                <Ionicons name="lock-closed-outline" size={20} color={COLORS.warning} />
                            </View>
                            <Text style={styles.settingText}>Privacy</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingLeft}>
                            <View style={[styles.settingIcon, { backgroundColor: COLORS.successBg }]}>
                                <Ionicons name="help-circle-outline" size={20} color={COLORS.success} />
                            </View>
                            <Text style={styles.settingText}>Help & Support</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                {/* App Version */}
                <Text style={styles.version}>JobSeeker v1.0.0</Text>
            </ScrollView>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 40,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.white,
    },
    editButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarContainer: {
        alignItems: 'center',
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 12,
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    avatarImage: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 3,
        borderColor: COLORS.white,
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    avatarText: {
        fontSize: 36,
        fontWeight: '700',
        color: COLORS.primary,
    },
    userName: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.white,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    tapHint: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
        marginTop: 4,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 16,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    infoContent: {
        marginLeft: 14,
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '500',
        color: COLORS.textPrimary,
    },
    buttonRow: {
        flexDirection: 'row',
        marginTop: 8,
    },
    cancelButton: {
        flex: 1,
        marginRight: 8,
    },
    saveButton: {
        flex: 1,
        marginLeft: 8,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingIcon: {
        width: 38,
        height: 38,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    settingText: {
        fontSize: 15,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.errorBg,
        padding: 16,
        borderRadius: 14,
        marginTop: 8,
    },
    logoutText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.error,
    },
    version: {
        textAlign: 'center',
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 24,
    },
});

export default ProfileScreen;
