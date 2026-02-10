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
    StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
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

const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }: SignupScreenProps) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [statusMessage, setStatusMessage] = useState('');

    const { signup } = useAuth();
    const { colors, isDark } = useTheme();

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!name.trim()) newErrors.name = 'Name is required';
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Invalid email format';
        }
        if (!phone.trim()) {
            newErrors.phone = 'Phone number is required';
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

        if (Object.keys(newErrors).length > 0) {
            const errorFields = Object.keys(newErrors).join(', ');
            setStatusMessage(`⚠️ Please fix: ${errorFields}`);
        }

        return Object.keys(newErrors).length === 0;
    };

    const handleSignup = async (): Promise<void> => {
        setStatusMessage('');

        if (!validateForm()) {
            return;
        }

        setStatusMessage('📝 Creating your account...');
        setLoading(true);
        try {
            const result = await signup(email.trim(), password, name.trim(), phone.trim());
            setLoading(false);

            if (!result.success) {
                setStatusMessage(`❌ ${result.error || 'Signup failed'}`);
                Alert.alert('Signup Failed', result.error || 'Unknown error');
            } else {
                setStatusMessage('✅ Account created! Redirecting...');
            }
        } catch (err: any) {
            setLoading(false);
            setStatusMessage(`❌ Error: ${err.message || 'Something went wrong'}`);
            Alert.alert('Signup Error', err.message || 'Something went wrong');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header with Gradient */}
            <LinearGradient
                colors={isDark ? [colors.card, colors.background] : ['#1E40AF', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerNav}>
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: isDark ? colors.background + '50' : 'rgba(255,255,255,0.2)' }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View style={[styles.headerIconRight, { backgroundColor: isDark ? colors.background + '50' : 'rgba(255,255,255,0.2)' }]}>
                        <Ionicons name="person-add" size={20} color="white" />
                    </View>
                </View>

                <View>
                    <Text style={[styles.headerTitle, { color: isDark ? colors.textPrimary : '#FFFFFF' }]}>Create Account</Text>
                    <Text style={[styles.headerSubtitle, { color: isDark ? colors.textSecondary : '#BFDBFE' }]}>Join us and jumpstart your career</Text>
                </View>
            </LinearGradient>

            {/* Form Container */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.formWrapper}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                    style={styles.scrollView}
                >
                    <View style={[styles.formCard, { backgroundColor: colors.card }]}>
                        {/* Status Message */}
                        {statusMessage ? (
                            <View style={[styles.statusContainer, { backgroundColor: isDark ? colors.background : '#FFF8E1', borderColor: isDark ? colors.border : '#FFE082' }]}>
                                <Text style={[styles.statusText, { color: colors.textPrimary }]}>{statusMessage}</Text>
                            </View>
                        ) : null}

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

                        <View style={{ marginTop: 16 }}>
                            <CustomButton
                                title="Sign Up"
                                onPress={handleSignup}
                                type="gradient"
                                loading={loading}
                            />
                        </View>

                        <View style={styles.loginRow}>
                            <Text style={[styles.loginText, { color: colors.textSecondary }]}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Text style={[styles.loginLink, { color: colors.primary }]}>Log In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 48,
        paddingBottom: 80,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    headerNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerIconRight: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    headerSubtitle: {
        color: '#BFDBFE',
        fontSize: 18,
    },
    formWrapper: {
        flex: 1,
        marginTop: -48,
    },
    scrollView: {
        paddingHorizontal: 24,
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
        padding: 24,
        shadowColor: '#94A3B8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 8,
        marginBottom: 32,
    },
    statusContainer: {
        backgroundColor: '#FFF8E1',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#FFE082',
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    loginRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
    },
    loginText: {
        color: '#64748B',
        fontSize: 14,
    },
    loginLink: {
        color: '#2563EB',
        fontWeight: 'bold',
        fontSize: 14,
        marginLeft: 4,
    },
});

export default SignupScreen;
