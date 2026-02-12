import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useUserStore } from '../../store/useUserStore';

WebBrowser.maybeCompleteAuthSession();

import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen({ navigation }: any) {
    const { login, setUser } = useUserStore();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            console.log("DEBUG: Auth State Changed:", user ? "User is logged in: " + user.email : "User is logged out");
            if (user) {
                // Optional: Force update store here if needed, but for now just logging
            }
        });
        return unsubscribe;
    }, []);

    const [request, response, promptAsync] = Google.useAuthRequest({
        webClientId: "70591556658-n4nk1u5eloekce6htjavk6lagmscsr9e.apps.googleusercontent.com",
        iosClientId: "70591556658-bdfhag8ft3jqih5dh88h7vtt222of35g.apps.googleusercontent.com",
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            const credential = GoogleAuthProvider.credential(id_token);

            signInWithCredential(auth, credential)
                .then((userCredential) => {
                    const user = userCredential.user;
                    // Update Global Store
                    setUser({
                        uid: user.uid,
                        name: user.displayName || 'User',
                        email: user.email || '',
                        photoUrl: user.photoURL || undefined
                    });
                    login(); // Sets authenticated = true
                })
                .catch((error) => {
                    Alert.alert("Login Error", error.message);
                });
        }
    }, [response]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="nutrition" size={60} color="#33CC33" />
                    </View>
                    <Text style={styles.title}>FoodVision</Text>
                    <Text style={styles.subtitle}>Track your calories with AI</Text>
                </View>

                <View style={styles.form}>
                    <TouchableOpacity
                        style={styles.googleButton}
                        onPress={() => promptAsync()}
                        disabled={!request}
                    >
                        <Ionicons name="logo-google" size={24} color="#333" />
                        <Text style={styles.googleButtonText}>Sign in with Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => {
                        // Demo Login for testing without Google
                        setUser({ uid: 'demo-user-123', name: 'Demo User', email: 'demo@example.com' });
                        login();
                    }}>
                        <Text style={styles.demoLink}>Or try Demo Mode</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 30,
    },
    header: {
        alignItems: 'center',
        marginBottom: 50,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    form: {
        width: '100%',
    },
    googleButton: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ddd'
    },
    googleButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    demoLink: {
        color: '#888',
        textAlign: 'center',
        marginTop: 10,
    }
});
