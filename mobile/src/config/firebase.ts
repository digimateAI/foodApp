import { initializeApp } from 'firebase/app';
import { initializeFirestore, getFirestore, setLogLevel } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// @ts-ignore
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Replace with your actual Firebase project config
// Get this from Firebase Console -> Project Settings -> General -> Your Apps -> Web App
const firebaseConfig = {
    apiKey: "AIzaSyDWI2NakezDyVNoGgmnZYXn85uUZS-M4cc",
    authDomain: "gen-lang-client-0175883062.firebaseapp.com",
    projectId: "gen-lang-client-0175883062",
    storageBucket: "gen-lang-client-0175883062.firebasestorage.app",
    messagingSenderId: "70591556658",
    appId: "1:70591556658:web:d44c4d924ef2ab3939202b",
    measurementId: "G-PH0MBVQFY8"
};

const app = initializeApp(firebaseConfig);

// Improved Firestore initialization for React Native (fixes connection hangs)
export const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    ignoreUndefinedProperties: true,
}, 'food-app-db'); // Connect to specific named database
setLogLevel('debug'); // Help debug why connection is hanging

export const storage = getStorage(app);

// Initialize Firebase Auth with Async Storage Persistence
// This ensures the user stays logged in across app restarts
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});
