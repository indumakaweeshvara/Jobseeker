import React from 'react';
import {
    TouchableOpacity,
    Text,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

interface CustomButtonProps {
    title: string;
    onPress: () => void;
    type?: 'primary' | 'secondary' | 'outline' | 'gradient';
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

const CustomButton: React.FC<CustomButtonProps> = ({
    title,
    onPress,
    type = 'primary',
    loading = false,
    disabled = false,
    style,
    textStyle,
}) => {
    const { colors, isDark } = useTheme();
    if (type === 'gradient') {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled || loading}
                style={[
                    styles.gradientButton,
                    { shadowColor: colors.primary },
                    disabled && styles.disabled,
                    style,
                ]}
            >
                <LinearGradient
                    colors={[colors.primary, colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientInner}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.buttonText} />
                    ) : (
                        <Text style={[styles.gradientText, { color: colors.buttonText }, textStyle]}>
                            {title}
                        </Text>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    const getButtonStyle = (): ViewStyle => {
        switch (type) {
            case 'primary':
                return { backgroundColor: colors.primary };
            case 'secondary':
                return { backgroundColor: colors.secondary };
            case 'outline':
                return { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.primary };
            default:
                return { backgroundColor: colors.primary };
        }
    };

    const getTextColor = (): string => {
        return type === 'outline' ? colors.primary : colors.buttonText;
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                styles.button,
                getButtonStyle(),
                disabled && styles.disabled,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator
                    color={type === 'outline' ? colors.primary : colors.buttonText}
                />
            ) : (
                <Text style={[styles.buttonText, { color: getTextColor() }, textStyle]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    gradientButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    gradientInner: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gradientText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    button: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    disabled: {
        opacity: 0.6,
    },
});

export default CustomButton;
