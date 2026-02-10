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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LoginScreenNavigationProp } from '../types';

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
    const [statusMessage, setStatusMessage] = useState('');

    const { login } = useAuth();
    const { colors, isDark } = useTheme();

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
        setStatusMessage('');
        if (!validateForm()) {
            setStatusMessage('⚠️ Please fill in all fields correctly');
            return;
        }

        setStatusMessage('🔄 Signing in...');
        setLoading(true);
        try {
            const result = await login(email.trim(), password);
            setLoading(false);

            if (!result.success) {
                setStatusMessage(`❌ ${result.error || 'Login failed'}`);
                Alert.alert('Login Failed', result.error || 'Unknown error');
            } else {
                setStatusMessage('✅ Login successful! Redirecting...');
            }
        } catch (err: any) {
            setLoading(false);
            setStatusMessage(`❌ ${err.message || 'Something went wrong'}`);
            Alert.alert('Login Error', err.message || 'Something went wrong');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Animated Background with Gradient */}
            <LinearGradient
                colors={['#1E40AF', '#7C3AED', '#DB2777']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                {/* Floating Circles for Visual Effect */}
                <View style={[styles.floatingCircle, { top: 40, left: 20, width: 96, height: 96 }]} />
                <View style={[styles.floatingCircle, { top: 128, right: 32, width: 64, height: 64 }]} />
                <View style={[styles.floatingCircle, { bottom: 80, left: 80, width: 48, height: 48, backgroundColor: 'rgba(255,255,255,0.15)' }]} />

                {/* Logo Container */}
                <View style={styles.logoOuter}>
                    <View style={styles.logoInner}>
                        <Ionicons name="briefcase" size={45} color={colors.primary} />
                    </View>
                </View>
                <Text style={styles.appTitle}>JobSeeker</Text>
                <Text style={[styles.appSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>Your Dream Career Awaits ✨</Text>
            </LinearGradient>

            {/* Form Container */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.formWrapper}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.formCard, { backgroundColor: colors.card }]}>
                        <Text style={[styles.welcomeTitle, { color: colors.textPrimary }]}>Welcome Back! 👋</Text>
                        <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
                            Sign in to continue your journey
                        </Text>

                        {/* Status Message */}
                        {statusMessage ? (
                            <View style={{ backgroundColor: isDark ? colors.background : '#FFF8E1', padding: 12, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: isDark ? colors.border : '#FFE082' }}>
                                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, textAlign: 'center' }}>{statusMessage}</Text>
                            </View>
                        ) : null}

                        {/* Email Input */}
                        <InputField
                            label="Email Address"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            icon="mail-outline"
                            error={errors.email}
                        />

                        {/* Password Input */}
                        <InputField
                            label="Password"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            icon="lock-closed-outline"
                            error={errors.password}
                        />

                        {/* Forgot Password */}
                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>Forgot Password?</Text>
                        </TouchableOpacity>

                        {/* Login Button */}
                        <CustomButton
                            title="Sign In"
                            onPress={handleLogin}
                            type="gradient"
                            loading={loading}
                        />

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                            <Text style={[styles.dividerText, { color: colors.textSecondary }]}>OR</Text>
                            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                        </View>

                        {/* Social Login Buttons */}
                        <View style={styles.socialRow}>
                            <TouchableOpacity style={[styles.socialButton, { backgroundColor: isDark ? colors.background : '#F8FAFC' }]}>
                                <Ionicons name="logo-google" size={24} color="#EA4335" />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.socialButton, { backgroundColor: isDark ? colors.background : '#F8FAFC' }]}>
                                <Ionicons name="logo-apple" size={24} color={isDark ? '#FFF' : '#000'} />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.socialButton, { backgroundColor: isDark ? colors.background : '#F8FAFC' }]}>
                                <Ionicons name="logo-linkedin" size={24} color="#0A66C2" />
                            </TouchableOpacity>
                        </View>

                        {/* Sign Up Link */}
                        <View style={styles.signupRow}>
                            <Text style={[styles.signupText, { color: colors.textSecondary }]}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                                <Text style={[styles.signupLink, { color: colors.primary }]}>Sign Up</Text>
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
        backgroundColor: '#F8FAFC',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: 50,
        borderBottomRightRadius: 50,
    },
    floatingCircle: {
        position: 'absolute',
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    logoOuter: {
        width: 112,
        height: 112,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    logoInner: {
        width: 80,
        height: 80,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    appTitle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
        letterSpacing: 1,
    },
    appSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
    },
    formWrapper: {
        flex: 1,
        marginTop: -32,
    },
    formCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: 28,
        paddingTop: 40,
        paddingBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 20,
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 8,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: '#64748B',
        marginBottom: 32,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: '#2563EB',
        fontSize: 14,
        fontWeight: '600',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 32,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E2E8F0',
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#94A3B8',
        fontSize: 14,
        fontWeight: '500',
    },
    socialRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginBottom: 24,
    },
    socialButton: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    signupRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    signupText: {
        fontSize: 16,
        color: '#64748B',
    },
    signupLink: {
        fontSize: 16,
        color: '#2563EB',
        fontWeight: 'bold',
    },
});

export default LoginScreen;
