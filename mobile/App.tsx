import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { NotificationService } from './src/services/NotificationService';
import { useUserStore } from './src/store/useUserStore';

export default function App() {
    const appState = useRef(AppState.currentState);

    useEffect(() => {
        // Initial check and setup
        useUserStore.getState().checkDailyReset();
        useUserStore.getState().calculateTargets(); // Force recalculation to update water target if needed

        NotificationService.registerForPushNotificationsAsync();
        NotificationService.scheduleDailyBreakfastReminder();
        NotificationService.scheduleDailySnackReminder();

        // Listen for app state changes (background -> foreground)
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                useUserStore.getState().checkDailyReset();
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, []);

    return (
        <SafeAreaProvider>
            <AppNavigator />
            <StatusBar style="auto" />
        </SafeAreaProvider>
    );
}
