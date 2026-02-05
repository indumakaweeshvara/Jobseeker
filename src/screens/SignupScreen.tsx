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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import { useAuth } from '../context/AuthContext';
import { SignupScreenNavigationProp } from '../types';

interface FormErrors {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
}

interface SignupScreenProps {
    navigation: SignupScreenNavigationProp;
}

const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    const { signup } = useAuth();

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!name) {
            newErrors.name = 'Name is required';
        }

        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!phone) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Invalid phone number';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignup = async (): Promise<void> => {
        if (!validateForm()) return;

        setLoading(true);
        const result = await signup(email, password, name, phone);
        setLoading(false);

        if (!result.success) {
            Alert.alert('Signup Failed', result.error);
        } else {
            Alert.alert('Success', 'Account created successfully!');
        }
    };

    return (
        <View className="flex-1 bg-slate-50">
            <StatusBar barStyle="light-content" />

            {/* Header with Gradient */}
            <LinearGradient
                colors={['#1E40AF', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="pt-12 pb-20 px-6 rounded-b-[40px] shadow-xl"
                style={{
                    shadowColor: '#2563EB',
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.3,
                    shadowRadius: 20,
                }}
            >
                <View className="flex-row items-center justify-between mb-8">
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full bg-white/20 items-center justify-center backdrop-blur-md"
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center backdrop-blur-md">
                        <Ionicons name="person-add" size={20} color="white" />
                    </View>
                </View>

                <View>
                    <Text className="text-3xl font-bold text-white mb-2">Create Account</Text>
                    <Text className="text-blue-100 text-lg">Join us and jumpstart your career</Text>
                </View>

                {/* Decorative Circles */}
                <View className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-[100px] -mr-10 -mt-10" />
                <View className="absolute bottom-10 right-10 w-16 h-16 bg-white/5 rounded-full" />
            </LinearGradient>

            {/* Form Container */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 -mt-12"
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                    className="px-6"
                >
                    <View className="bg-white rounded-[30px] p-6 shadow-xl shadow-slate-200/50 mb-8">
                        <InputField
                            label="Full Name"
                            placeholder="Type your full name"
                            value={name}
                            onChangeText={setName}
                            icon="person-outline"
                            error={errors.name}
                            autoCapitalize="words"
                        />

                        <InputField
                            label="Email Address"
                            placeholder="Type your email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            icon="mail-outline"
                            error={errors.email}
                        />

                        <InputField
                            label="Phone Number"
                            placeholder="Type your phone number"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            icon="call-outline"
                            error={errors.phone}
                        />

                        <InputField
                            label="Password"
                            placeholder="Create a strong password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            icon="lock-closed-outline"
                            error={errors.password}
                        />

                        <InputField
                            label="Confirm Password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            icon="lock-closed-outline"
                            error={errors.confirmPassword}
                        />

                        <View className="mt-4">
                            <CustomButton
                                title="Sign Up"
                                onPress={handleSignup}
                                type="gradient"
                                loading={loading}
                            />
                        </View>

                        <View className="flex-row justify-center items-center mt-6">
                            <Text className="text-slate-500">Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Text className="text-blue-600 font-bold ml-1">Log In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default SignupScreen;
