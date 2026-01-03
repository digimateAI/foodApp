import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const LogMealScreen = ({ navigation }: { navigation: any }) => {

    const renderMealCard = (id: string, label: string, time: string, icon: any) => (
        <TouchableOpacity
            style={styles.mealCard}
            onPress={() => navigation.navigate('Camera', { mealType: id })} // Pass meal type to camera
        >
            <View style={styles.iconCircle}>
                <MaterialCommunityIcons name={icon} size={32} color="#33CC33" />
            </View>
            <Text style={styles.mealLabel}>{label}</Text>
            <Text style={styles.mealTime}>{time}</Text>
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

            {/* 2. Progress Indicator Section */}
            <View style={styles.progressContainer}>
                <View style={styles.dotsRow}>
                    <View style={[styles.dot, styles.dotFilled]} />
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                </View>
                <Text style={styles.stepText}>Step 1 of 3</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* 3. Main Question */}
                <Text style={styles.questionText}>Which meal is this for?</Text>

                {/* 4. Meal Type Choice Cards */}
                <View style={styles.cardsGrid}>
                    {renderMealCard('breakfast', 'Breakfast', '7:00 - 10:00 AM', 'croissant')}
                    {renderMealCard('lunch', 'Lunch', '12:00 - 2:00 PM', 'hamburger')}
                    {renderMealCard('dinner', 'Dinner', '6:00 - 9:00 PM', 'silverware-fork-knife')}
                    {renderMealCard('snacks', 'Snacks', 'Anytime', 'cookie')}
                </View>
            </ScrollView>

            {/* 5. Quick Scan Barcode Button */}
            <TouchableOpacity style={styles.scanButton}>
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
    progressContainer: {
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 32,
    },
    dotsRow: {
        flexDirection: 'row',
        marginBottom: 8,
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E0E0E0',
    },
    dotFilled: {
        backgroundColor: '#33CC33',
    },
    stepText: {
        fontSize: 12,
        color: '#808080',
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
