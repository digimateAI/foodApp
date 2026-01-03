import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification behavior (show alert when app is in foreground)
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const NotificationService = {
    async registerForPushNotificationsAsync() {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                console.log('Failed to get push token for push notification!');
                return;
            }
        } else {
            console.log('Must use physical device for Push Notifications');
        }
    },

    async scheduleWaterReminder(remainingAmount: number) {
        // Cancel all existing notifications to avoid duplicate or outdated nudges
        await Notifications.cancelAllScheduledNotificationsAsync();

        if (remainingAmount <= 0) {
            // Goal reached! Maybe send a congrats message? For now, we just stop nudging.
            return;
        }

        // Schedule for 2 hours from now
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "💧 Time to Hydrate!",
                body: `You have ${remainingAmount}ml left to reach your daily goal. Drink up!`,
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: 2 * 60 * 60, // 2 hours
                repeats: false,
            },
        });
        console.log(`Water reminder scheduled for 2 hours from now. Remaining: ${remainingAmount}ml`);
    },

    async scheduleDailyBreakfastReminder() {
        // Schedule for 9:00 AM daily
        const triggerDate = new Date();
        triggerDate.setHours(9, 0, 0, 0);
        if (triggerDate <= new Date()) {
            triggerDate.setDate(triggerDate.getDate() + 1);
        }

        const secondsUntil9AM = Math.floor((triggerDate.getTime() - Date.now()) / 1000);

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "☀️ Good Morning!",
                body: "Have you had breakfast yet? Don't forget to log it!",
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour: 9,
                minute: 0,
            },
        });
        console.log('Breakfast reminder scheduled for 9:00 AM daily');
    },

    async scheduleLunchInsight(consumedCalories: number, totalTarget: number) {
        const remaining = totalTarget - consumedCalories;
        const remainingAbs = Math.max(0, remaining);

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "🥗 Lunch Time Insight",
                body: `You've eaten ${consumedCalories} cal so far. You have ${remainingAbs} cal left for today. Choose wisely!`,
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour: 13, // 1:00 PM
                minute: 0,
            },
        });
        console.log(`Lunch insight scheduled for 1:00 PM daily. Consumed: ${consumedCalories}, Left: ${remainingAbs}`);
    },

    async scheduleDailySnackReminder() {
        // Schedule for 4:30 PM daily
        const triggerDate = new Date();
        triggerDate.setHours(16, 30, 0, 0);
        if (triggerDate <= new Date()) {
            triggerDate.setDate(triggerDate.getDate() + 1);
        }

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "🍎 Snack Time?",
                body: "Feeling peckish? Log your snack to stay on track!",
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour: 16,
                minute: 30,
            },
        });
        console.log('Snack reminder scheduled for 4:30 PM daily');
    },

    async scheduleDinnerInsight(consumedCalories: number, totalTarget: number) {
        const remaining = totalTarget - consumedCalories;
        const remainingAbs = Math.max(0, remaining);

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "🍽️ Dinner Time Insight",
                body: `Dinner time! You have ${remainingAbs} cal left for the day. Enjoy your meal!`,
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour: 20, // 8:00 PM
                minute: 0,
            },
        });
        console.log(`Dinner insight scheduled for 8:00 PM daily. Consumed: ${consumedCalories}, Left: ${remainingAbs}`);
    }
};
