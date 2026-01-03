import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LoginScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Login Screen</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.button}>
                <Text style={styles.buttonText}>Go Back</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    button: {
        padding: 10,
        backgroundColor: '#eee',
        borderRadius: 5,
    },
    buttonText: {
        color: '#333',
    },
});

export default LoginScreen;
