import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const LogMealScreen = ({ navigation }: { navigation: any }) => {

    const renderMealCard = (id: string, label: string, icon: any) => (
        <TouchableOpacity
            style={styles.mealCard}
            onPress={() => navigation.navigate('Camera', { mealType: id })} // Pass meal type to camera
        >
            <View style={styles.iconCircle}>
                <MaterialCommunityIcons name={icon} size={32} color="#33CC33" />
            </View>
            <Text style={styles.mealLabel}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* 1. Top Navigation Bar */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Log Meal</Text>
                <View style={{ width: 24 }} />
            </View>



            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* 3. Main Question */}
                <Text style={styles.questionText}>Which meal is this for?</Text>

                {/* 4. Meal Type Choice Cards */}
                <View style={styles.cardsGrid}>
                    {renderMealCard('breakfast', 'Breakfast', 'croissant')}
                    {renderMealCard('lunch', 'Lunch', 'hamburger')}
                    {renderMealCard('dinner', 'Dinner', 'silverware-fork-knife')}
                    {renderMealCard('snacks', 'Snacks', 'cookie')}
                </View>
            </ScrollView>

            {/* 5. Quick Scan Barcode Button */}
            <TouchableOpacity
                style={styles.scanButton}
                onPress={() => navigation.navigate('Camera', { mode: 'barcode' })}
            >
                <MaterialCommunityIcons name="barcode-scan" size={24} color="#33CC33" style={{ marginRight: 10 }} />
                <Text style={styles.scanButtonText}>Quick Scan Barcode</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7FDF7', // Pale green tint
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },

    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 100, // Space for bottom button
    },
    questionText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 32,
    },
    cardsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    mealCard: {
        width: '47%', // Slightly less than 50% for gap
        aspectRatio: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 16,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    mealLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    mealTime: {
        fontSize: 12,
        color: '#808080',
        textAlign: 'center',
    },
    scanButton: {
        position: 'absolute',
        bottom: 32,
        left: 16,
        right: 16,
        backgroundColor: '#D4EDDA',
        paddingVertical: 16,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    scanButtonText: {
        color: '#33CC33',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default LogMealScreen;
