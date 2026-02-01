import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../theme/colors';

const CustomButton = ({
    title,
    onPress,
    type = 'primary',
    loading = false,
    disabled = false,
    style,
    textStyle,
}) => {
    if (type === 'gradient') {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled || loading}
                style={[styles.buttonContainer, style]}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={[COLORS.gradientStart, COLORS.gradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.gradient, disabled && styles.disabled]}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <Text style={[styles.buttonText, styles.whiteText, textStyle]}>
                            {title}
                        </Text>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    const buttonStyles = [
        styles.button,
        type === 'primary' && styles.primaryButton,
        type === 'secondary' && styles.secondaryButton,
        type === 'outline' && styles.outlineButton,
        disabled && styles.disabled,
        style,
    ];

    const textStyles = [
        styles.buttonText,
        type === 'primary' && styles.whiteText,
        type === 'secondary' && styles.whiteText,
        type === 'outline' && styles.primaryText,
        textStyle,
    ];

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={buttonStyles}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator
                    color={type === 'outline' ? COLORS.primary : COLORS.white}
                />
            ) : (
                <Text style={textStyles}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        borderRadius: SIZES.radius,
        overflow: 'hidden',
    },
    button: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        justifyContent: 'center',
    },
    gradient: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
    },
    secondaryButton: {
        backgroundColor: COLORS.secondary,
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    buttonText: {
        fontSize: SIZES.lg,
        fontWeight: '600',
    },
    whiteText: {
        color: COLORS.white,
    },
    primaryText: {
        color: COLORS.primary,
    },
    disabled: {
        opacity: 0.6,
    },
});

export default CustomButton;
