import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useUserStore } from '../store/useUserStore';

// Screen imports (will create these next)
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import HomeScreen from '../screens/main/HomeScreen';
import FoodScreen from '../screens/main/FoodScreen';
import ActivityScreen from '../screens/main/ActivityScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import CameraScreen from '../screens/food/CameraScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import PersonalDetailsScreen from '../screens/onboarding/PersonalDetailsScreen';
import ActivityGoalScreen from '../screens/onboarding/ActivityGoalScreen';
import CaloriePlanScreen from '../screens/onboarding/CaloriePlanScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

import LogMealScreen from '../screens/food/LogMealScreen';
import LogMealMethodScreen from '../screens/food/LogMealMethodScreen';
import { Ionicons } from '@expo/vector-icons';

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: '#56AB2F',
                tabBarInactiveTintColor: '#808080',
                tabBarStyle: {
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                    borderTopWidth: 1,
                    borderTopColor: '#E0E0E0',
                    backgroundColor: '#FFFFFF',
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Food') {
                        iconName = focused ? 'book' : 'book-outline'; // Diary
                    } else if (route.name === 'Activity') {
                        iconName = focused ? 'bar-chart' : 'bar-chart-outline'; // Reports
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'settings' : 'settings-outline'; // Settings
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Food" component={FoodScreen} options={{ title: 'Diary' }} />
            <Tab.Screen name="Activity" component={ActivityScreen} options={{ title: 'Reports' }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Settings' }} />
        </Tab.Navigator>
    );
}

function AuthStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="PersonalDetails" component={PersonalDetailsScreen} />
            <Stack.Screen name="ActivityGoal" component={ActivityGoalScreen} />
            <Stack.Screen name="CaloriePlan" component={CaloriePlanScreen} />
        </Stack.Navigator>
    );
}

export default function AppNavigator() {
    const { isAuthenticated } = useUserStore();

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isAuthenticated ? (
                    <>
                        <Stack.Screen name="Main" component={MainTabs} />
                        <Stack.Screen name="LogMeal" component={LogMealScreen} />
                        <Stack.Screen name="LogMealMethod" component={LogMealMethodScreen} />
                        <Stack.Screen name="Camera" component={CameraScreen} />
                    </>
                ) : (
                    <Stack.Screen name="Auth" component={AuthStack} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
