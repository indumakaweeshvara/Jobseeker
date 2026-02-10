import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform, ActivityIndicator } from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import JobDetailScreen from '../screens/JobDetailScreen';
import AppliedJobsScreen from '../screens/AppliedJobsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SavedJobsScreen from '../screens/SavedJobsScreen';
import { MainTabParamList, RootStackParamList, HomeStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();

// Home Stack for nested navigation
const HomeStackNavigator: React.FC = () => {
    const { colors } = useTheme();
    return (
        <HomeStack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                cardStyle: { backgroundColor: colors.background }
            }}
        >
            <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
            <HomeStack.Screen name="JobDetail" component={JobDetailScreen} />
        </HomeStack.Navigator>
    );
};

// Main Tab Navigator
const MainTabs: React.FC = () => {
    const { colors } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

                    if (route.name === 'Home') {
                        iconName = focused ? 'briefcase' : 'briefcase-outline';
                    } else if (route.name === 'Saved') {
                        iconName = focused ? 'bookmark' : 'bookmark-outline';
                    } else if (route.name === 'AppliedJobs') {
                        iconName = focused ? 'document-text' : 'document-text-outline';
                    } else { // Profile
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return (
                        <View style={focused ? [styles.activeIconContainer, { backgroundColor: colors.primary + '15' }] : undefined}>
                            <Ionicons name={iconName} size={24} color={color} />
                        </View>
                    );
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: [styles.tabBar, { backgroundColor: colors.card, borderTopColor: colors.border }],
                tabBarLabelStyle: styles.tabBarLabel,
                tabBarItemStyle: styles.tabBarItem,
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeStackNavigator}
                options={{ tabBarLabel: 'Jobs' }}
            />
            <Tab.Screen
                name="Saved"
                component={SavedJobsScreen}
                options={{ tabBarLabel: 'Saved' }}
            />
            <Tab.Screen
                name="AppliedJobs"
                component={AppliedJobsScreen}
                options={{ tabBarLabel: 'Applied' }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ tabBarLabel: 'Profile' }}
            />
        </Tab.Navigator>
    );
};

const AppNavigator: React.FC = () => {
    const { user, loading } = useAuth();
    const { colors } = useTheme();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
                cardStyle: { backgroundColor: colors.background }
            }}
        >
            {!user ? (
                <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Signup" component={SignupScreen} />
                </>
            ) : (
                <Stack.Screen name="MainTabs" component={MainTabs} />
            )}
        </Stack.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 24 : 12,
        left: 16,
        right: 16,
        height: 64,
        borderRadius: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        paddingBottom: 0,
        borderTopWidth: 0,
    },
    tabBarLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    tabBarItem: {
        height: 64,
    },
    activeIconContainer: {
        borderRadius: 14,
        padding: 6,
    },
});

export default AppNavigator;
