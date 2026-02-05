import React from 'react';
import {
    TouchableOpacity,
    Text,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CustomButtonProps {
    title: string;
    onPress: () => void;
    type?: 'primary' | 'secondary' | 'outline' | 'gradient';
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    className?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
    title,
    onPress,
    type = 'primary',
    loading = false,
    disabled = false,
    style,
    textStyle,
    className,
}) => {
    if (type === 'gradient') {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled || loading}
                className={`rounded-2xl overflow-hidden shadow-lg shadow-blue-500/30 active:opacity-90 ${disabled ? 'opacity-60' : ''} ${className}`}
                style={style}
            >
                <LinearGradient
                    colors={['#2563EB', '#7C3AED']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="py-4 px-6 justify-center items-center"
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white text-lg font-bold tracking-wide" style={textStyle}>
                            {title}
                        </Text>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    const getButtonStyle = () => {
        switch (type) {
            case 'primary':
                return 'bg-blue-600 active:bg-blue-700';
            case 'secondary':
                return 'bg-purple-600 active:bg-purple-700';
            case 'outline':
                return 'bg-transparent border-2 border-blue-600 active:bg-blue-50';
            default:
                return 'bg-blue-600';
        }
    };

    const getTextStyle = () => {
        switch (type) {
            case 'outline':
                return 'text-blue-600';
            default:
                return 'text-white';
        }
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            className={`py-4 px-6 rounded-2xl justify-center items-center shadow-md ${getButtonStyle()} ${disabled ? 'opacity-60' : ''} ${className}`}
            style={style}
        >
            {loading ? (
                <ActivityIndicator
                    color={type === 'outline' ? '#2563EB' : 'white'}
                />
            ) : (
                <Text className={`text-lg font-bold tracking-wide ${getTextStyle()}`} style={textStyle}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

export default CustomButton;
