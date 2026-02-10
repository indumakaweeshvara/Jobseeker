import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    TouchableOpacity,
    KeyboardTypeOptions,
    ViewStyle,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface InputFieldProps {
    label?: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
    keyboardType?: KeyboardTypeOptions;
    icon?: keyof typeof Ionicons.glyphMap;
    error?: string;
    style?: ViewStyle;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

const InputField: React.FC<InputFieldProps> = ({
    label,
    placeholder,
    value,
    onChangeText,
    secureTextEntry = false,
    keyboardType = 'default',
    icon,
    error,
    style,
    autoCapitalize = 'none',
}) => {
    const { colors, isDark } = useTheme();
    const [isSecure, setIsSecure] = useState(secureTextEntry);
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={[styles.container, style]}>
            {label && (
                <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>
            )}
            <View
                style={[
                    styles.inputWrapper,
                    { backgroundColor: isDark ? colors.card : '#F8FAFC' },
                    error
                        ? [styles.inputError, { borderColor: colors.error, backgroundColor: isDark ? colors.error + '10' : '#FFF5F5' }]
                        : isFocused
                            ? [styles.inputFocused, { borderColor: colors.primary, shadowColor: colors.primary }]
                            : [styles.inputDefault, { borderColor: colors.border }],
                ]}
            >
                {icon && (
                    <Ionicons
                        name={icon}
                        size={20}
                        color={error ? colors.error : isFocused ? colors.primary : colors.textSecondary}
                        style={{ marginRight: 10 }}
                    />
                )}
                <TextInput
                    style={[styles.input, { color: colors.textPrimary }]}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textLight}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={isSecure}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
                {secureTextEntry && (
                    <TouchableOpacity
                        onPress={() => setIsSecure(!isSecure)}
                        style={{ padding: 4 }}
                    >
                        <Ionicons
                            name={isSecure ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color={colors.textSecondary}
                        />
                    </TouchableOpacity>
                )}
            </View>
            {error && (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={14} color={colors.error} />
                    <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
    },
    inputDefault: {
        borderColor: '#E2E8F0',
    },
    inputFocused: {
        borderColor: '#2563EB',
        backgroundColor: '#FFFFFF',
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    inputError: {
        borderColor: '#EF4444',
        backgroundColor: '#FFF5F5',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1E293B',
        height: '100%',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        marginLeft: 4,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginLeft: 4,
        fontWeight: '500',
    },
});

export default InputField;
