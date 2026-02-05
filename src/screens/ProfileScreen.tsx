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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { db, storage } from '../services/firebaseConfig';
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

    const uploadProfileImage = async (uri: string): Promise<void> => {
        setUploadingImage(true);
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const imageRef = ref(storage, `profilePhotos/${user?.uid}`);
            await uploadBytes(imageRef, blob);
            const downloadURL = await getDownloadURL(imageRef);

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
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: async () => await logout() },
        ]);
    };

    const handleCancel = (): void => {
        setName(userData?.name || '');
        setPhone(userData?.phone || '');
        setIsEditing(false);
    };

    return (
        <View className="flex-1 bg-slate-50">
            <StatusBar barStyle="light-content" />

            {/* Premium Header */}
            <LinearGradient
                colors={['#1E40AF', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="pt-14 pb-12 px-6 rounded-b-[40px] shadow-lg"
            >
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-white text-2xl font-bold">My Profile</Text>
                    {!isEditing && (
                        <TouchableOpacity
                            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center backdrop-blur-md"
                            onPress={() => setIsEditing(true)}
                        >
                            <Ionicons name="pencil" size={20} color="white" />
                        </TouchableOpacity>
                    )}
                </View>

                <View className="items-center">
                    <TouchableOpacity
                        className="mb-4 relative"
                        onPress={showImageOptions}
                        disabled={uploadingImage}
                    >
                        <View className="w-28 h-28 rounded-full border-4 border-white/30 shadow-2xl justify-center items-center overflow-hidden bg-white">
                            {uploadingImage ? (
                                <ActivityIndicator size="large" color="#2563EB" />
                            ) : profileImage ? (
                                <Image source={{ uri: profileImage }} className="w-full h-full" />
                            ) : (
                                <Text className="text-4xl font-bold text-blue-600">
                                    {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </Text>
                            )}
                        </View>
                        <View className="absolute bottom-0 right-0 bg-blue-600 w-8 h-8 rounded-full items-center justify-center border-2 border-white shadow-sm">
                            <Ionicons name="camera" size={14} color="white" />
                        </View>
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-white mb-1">{userData?.name || 'User'}</Text>
                    <Text className="text-blue-100 text-sm">{userData?.email || user?.email}</Text>
                </View>
            </LinearGradient>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pt-6 mb-10">
                {/* Info Card */}
                <View className="bg-white rounded-3xl p-6 shadow-md shadow-slate-200 mb-6">
                    <Text className="text-lg font-bold text-slate-800 mb-4">Personal Information</Text>

                    {isEditing ? (
                        <View>
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
                            <View className="flex-row mt-2">
                                <View className="flex-1 mr-2">
                                    <CustomButton title="Cancel" onPress={handleCancel} type="outline" />
                                </View>
                                <View className="flex-1 ml-2">
                                    <CustomButton title="Save" onPress={handleSave} type="gradient" loading={loading} />
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View className="space-y-4">
                            {[
                                { label: 'Full Name', value: userData?.name, icon: 'person-outline' },
                                { label: 'Email', value: userData?.email || user?.email, icon: 'mail-outline' },
                                { label: 'Phone', value: userData?.phone || 'Not set', icon: 'call-outline' },
                            ].map((item, index) => (
                                <View key={index} className="flex-row items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                                        <Ionicons name={item.icon as any} size={20} color="#2563EB" />
                                    </View>
                                    <View>
                                        <Text className="text-xs text-slate-500 font-medium">{item.label}</Text>
                                        <Text className="text-base text-slate-800 font-semibold">{item.value}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* Settings Card */}
                <View className="bg-white rounded-3xl p-6 shadow-md shadow-slate-200 mb-8">
                    <Text className="text-lg font-bold text-slate-800 mb-4">Settings</Text>
                    {[
                        { label: 'Notifications', icon: 'notifications-outline', color: 'bg-blue-100', iconColor: '#2563EB' },
                        { label: 'Privacy & Security', icon: 'shield-checkmark-outline', color: 'bg-green-100', iconColor: '#16A34A' },
                        { label: 'Help & Support', icon: 'help-circle-outline', color: 'bg-amber-100', iconColor: '#D97706' },
                    ].map((item, index) => (
                        <TouchableOpacity key={index} className="flex-row items-center justify-between py-3 border-b border-slate-50 last:border-0">
                            <View className="flex-row items-center">
                                <View className={`w-10 h-10 rounded-xl ${item.color} items-center justify-center mr-3`}>
                                    <Ionicons name={item.icon as any} size={20} color={item.iconColor} />
                                </View>
                                <Text className="text-base font-semibold text-slate-800">{item.label}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    className="flex-row items-center justify-center bg-red-50 p-4 rounded-2xl border border-red-100 mb-8 active:bg-red-100"
                    onPress={handleLogout}
                >
                    <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                    <Text className="ml-2 text-lg font-bold text-red-500">Log Out</Text>
                </TouchableOpacity>

                <Text className="text-center text-slate-400 text-xs mb-10">JobSeeker App v1.0.0</Text>
            </ScrollView>
        </View>
    );
};

export default ProfileScreen;
