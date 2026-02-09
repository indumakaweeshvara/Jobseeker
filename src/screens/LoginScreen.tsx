import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Alert,
    StatusBar,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import { useAuth } from '../context/AuthContext';
import { LoginScreenNavigationProp } from '../types';
import { LinearGradient } from 'expo-linear-gradient';

interface FormErrors {
    email?: string;
    password?: string;
}

interface LoginScreenProps {
    navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    const { login } = useAuth();

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async (): Promise<void> => {
        if (!validateForm()) return;

        setLoading(true);
        const result = await login(email, password);
        setLoading(false);

        if (!result.success) {
            Alert.alert('Login Failed', result.error);
        }
    };

    return (
        <View className="flex-1 bg-slate-50">
            <StatusBar barStyle="light-content" />

            {/* Animated Background with Gradient */}
            <LinearGradient
                colors={['#1E40AF', '#7C3AED', '#DB2777']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="h-80 justify-center items-center"
                style={{
                    borderBottomLeftRadius: 50,
                    borderBottomRightRadius: 50,
                }}
            >
                {/* Floating Circles for Visual Effect */}
                <View className="absolute top-10 left-5 w-24 h-24 rounded-full bg-white/10" />
                <View className="absolute top-32 right-8 w-16 h-16 rounded-full bg-white/10" />
                <View className="absolute bottom-20 left-20 w-12 h-12 rounded-full bg-white/15" />

                {/* Logo Container with Glassmorphism Effect */}
                <View className="w-28 h-28 rounded-3xl bg-white/20 justify-center items-center mb-4 shadow-2xl"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.3,
                        shadowRadius: 20,
                    }}
                >
                    <View className="w-20 h-20 rounded-2xl bg-white justify-center items-center">
                        <Ionicons name="briefcase" size={45} color="#2563EB" />
                    </View>
                </View>
                <Text className="text-4xl font-bold text-white mb-2 tracking-wider">
                    JobSeeker
                </Text>
                <Text className="text-base text-white/80 font-medium">
                    Your Dream Career Awaits ✨
                </Text>
            </LinearGradient>

            {/* Form Container with Modern Card Design */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 -mt-8"
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="flex-1 bg-white rounded-t-[40px] px-7 pt-10 pb-8"
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: -10 },
                            shadowOpacity: 0.1,
                            shadowRadius: 20,
                            elevation: 20,
                        }}
                    >
                        <Text className="text-3xl font-bold text-slate-800 mb-2">
                            Welcome Back! 👋
                        </Text>
                        <Text className="text-base text-slate-500 mb-8">
                            Sign in to continue your journey
                        </Text>

                        {/* Email Input with Icon */}
                        <InputField
                            label="Email Address"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            icon="mail-outline"
                            error={errors.email}
                        />

                        {/* Password Input with Icon */}
                        <InputField
                            label="Password"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            icon="lock-closed-outline"
                            error={errors.password}
                        />

                        {/* Forgot Password Link */}
                        <TouchableOpacity className="self-end mb-6">
                            <Text className="text-blue-600 text-sm font-semibold">
                                Forgot Password?
                            </Text>
                        </TouchableOpacity>

                        {/* Login Button with Gradient */}
                        <CustomButton
                            title="Sign In"
                            onPress={handleLogin}
                            type="gradient"
                            loading={loading}
                        />

                        {/* Divider */}
                        <View className="flex-row items-center my-8">
                            <View className="flex-1 h-px bg-slate-200" />
                            <Text className="mx-4 text-slate-400 text-sm font-medium">
                                OR
                            </Text>
                            <View className="flex-1 h-px bg-slate-200" />
                        </View>

                        {/* Social Login Buttons */}
                        <View className="flex-row justify-center gap-4 mb-6">
                            <TouchableOpacity className="w-14 h-14 rounded-2xl bg-slate-100 items-center justify-center"
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 5,
                                    elevation: 3,
                                }}
                            >
                                <Ionicons name="logo-google" size={24} color="#EA4335" />
                            </TouchableOpacity>
                            <TouchableOpacity className="w-14 h-14 rounded-2xl bg-slate-100 items-center justify-center"
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 5,
                                    elevation: 3,
                                }}
                            >
                                <Ionicons name="logo-apple" size={24} color="#000" />
                            </TouchableOpacity>
                            <TouchableOpacity className="w-14 h-14 rounded-2xl bg-slate-100 items-center justify-center"
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 5,
                                    elevation: 3,
                                }}
                            >
                                <Ionicons name="logo-linkedin" size={24} color="#0A66C2" />
                            </TouchableOpacity>
                        </View>

                        {/* Sign Up Link */}
                        <View className="flex-row justify-center items-center mt-2">
                            <Text className="text-base text-slate-500">
                                Don't have an account?{' '}
                            </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                                <Text className="text-base text-blue-600 font-bold">
                                    Sign Up
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default LoginScreen;
