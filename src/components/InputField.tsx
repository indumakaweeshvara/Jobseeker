import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    TouchableOpacity,
    KeyboardTypeOptions,
    ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styled } from 'nativewind';

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
    className?: string;
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
    className,
}) => {
    const [isSecure, setIsSecure] = useState(secureTextEntry);
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View className={`mb-4 ${className}`} style={style}>
            {label && (
                <Text className="text-sm font-semibold text-slate-700 mb-2 ml-1">
                    {label}
                </Text>
            )}
            <View
                className={`flex-row items-center bg-slate-50 border rounded-2xl px-4 h-[56px] transition-all duration-200 ${error
                        ? 'border-red-500 bg-red-50/10'
                        : isFocused
                            ? 'border-blue-500 bg-white shadow-sm ring-2 ring-blue-100'
                            : 'border-slate-200'
                    }`}
            >
                {icon && (
                    <Ionicons
                        name={icon}
                        size={20}
                        color={error ? '#EF4444' : isFocused ? '#2563EB' : '#94A3B8'}
                        style={{ marginRight: 10 }}
                    />
                )}
                <TextInput
                    className="flex-1 text-base text-slate-800 h-full"
                    placeholder={placeholder}
                    placeholderTextColor="#94A3B8"
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
                        className="p-1"
                    >
                        <Ionicons
                            name={isSecure ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color="#94A3B8"
                        />
                    </TouchableOpacity>
                )}
            </View>
            {error && (
                <View className="flex-row items-center mt-1 ml-1">
                    <Ionicons name="alert-circle-outline" size={14} color="#EF4444" />
                    <Text className="text-red-500 text-xs ml-1 font-medium">{error}</Text>
                </View>
            )}
        </View>
    );
};

export default InputField;
