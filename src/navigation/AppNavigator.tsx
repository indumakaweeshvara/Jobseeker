import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme/colors';
import { RootStackParamList, MainTabParamList, HomeStackParamList } from '../types';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';

// Main Screens
import HomeScreen from '../screens/HomeScreen';
import JobDetailScreen from '../screens/JobDetailScreen';
import AppliedJobsScreen from '../screens/AppliedJobsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStackNav = createStackNavigator<HomeStackParamList>();

// Auth Stack Navigator
const AuthStack: React.FC = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
);

// Home Stack Navigator (for JobDetail)
const HomeStack: React.FC = () => (
    <HomeStackNav.Navigator screenOptions={{ headerShown: false }}>
        <HomeStackNav.Screen name="HomeScreen" component={HomeScreen} />
        <HomeStackNav.Screen name="JobDetail" component={JobDetailScreen} />
    </HomeStackNav.Navigator>
);

// Main Tab Navigator
const MainTabs: React.FC = () => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused, color }) => {
                let iconName: keyof typeof Ionicons.glyphMap;

                if (route.name === 'Home') {
                    iconName = focused ? 'briefcase' : 'briefcase-outline';
                } else if (route.name === 'AppliedJobs') {
                    iconName = focused ? 'document-text' : 'document-text-outline';
                } else {
                    iconName = focused ? 'person' : 'person-outline';
                }

                return (
                    <View style={focused ? styles.activeIconContainer : undefined}>
                        <Ionicons name={iconName} size={24} color={color} />
                    </View>
                );
            },
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.textSecondary,
            tabBarStyle: styles.tabBar,
            tabBarLabelStyle: styles.tabBarLabel,
            tabBarItemStyle: styles.tabBarItem,
        })}
    >
        <Tab.Screen
            name="Home"
            component={HomeStack}
            options={{ tabBarLabel: 'Jobs' }}
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

// Main App Navigator
const AppNavigator: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return null; // Or a loading screen
    }

    return (
        <NavigationContainer>
            {user ? <MainTabs /> : <AuthStack />}
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        backgroundColor: COLORS.white,
        borderTopWidth: 0,
        height: Platform.OS === 'ios' ? 85 : 65,
        paddingTop: 10,
        paddingBottom: Platform.OS === 'ios' ? 25 : 10,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 20,
    },
    tabBarLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 4,
    },
    tabBarItem: {
        paddingVertical: 5,
    },
    activeIconContainer: {
        backgroundColor: COLORS.infoBg,
        borderRadius: 12,
        padding: 8,
        marginTop: -8,
    },
});

export default AppNavigator;
