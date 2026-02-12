import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const LogMealMethodScreen = ({ navigation, route }: { navigation: any, route: any }) => {
    // Default to 'Breakfast' if not passed
    const { mealType = 'Breakfast' } = route.params || {};

    const renderRecentMealItem = (name: string, imageUri: string) => (
        <TouchableOpacity style={styles.recentMealItem}>
            <Image source={{ uri: imageUri }} style={styles.recentMealImage} />
            <Text style={styles.recentMealName}>{name}</Text>
            <View style={styles.addIconSmall}>
                <Ionicons name="add" size={14} color="#333" />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* 1. Top Navigation Bar */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Log {mealType}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* 2. Main Question and Description */}
                <View style={styles.questionSection}>
                    <Text style={styles.mainQuestion}>How would you like to add this meal?</Text>
                    <Text style={styles.descriptionText}>
                        Snap a picture for AI analysis or type it in yourself.
                    </Text>
                </View>

                {/* 3. "Take Photo" Method Card */}
                <View style={styles.photoCard}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80' }}
                            style={styles.previewImage}
                        />
                        <View style={styles.aiTag}>
                            <MaterialCommunityIcons name={"sparkles" as any} size={12} color="#333" style={{ marginRight: 4 }} />
                            <Text style={styles.aiTagText}>AI Powered</Text>
                        </View>
                    </View>

                    <View style={styles.cardBody}>
                        <View style={styles.cardTextContent}>
                            <Text style={styles.cardTitle}>Take Photo</Text>
                            <Text style={styles.cardDesc}>Scan food to auto-track calories</Text>
                        </View>
                        <View style={styles.cameraIconCircle}>
                            <Ionicons name="camera" size={24} color="#FFF" />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.cameraButton}
                        onPress={() => navigation.navigate('Camera', { mealType })} // Proceed to generic camera for now
                    >
                        <Text style={styles.cameraButtonText}>Start Camera</Text>
                    </TouchableOpacity>
                </View>

                {/* 4. "Log Manually" Method Card */}
                <TouchableOpacity style={styles.manualCard} onPress={() => {/* Navigate to Form */ }}>
                    <View style={styles.manualIconCircle}>
                        <MaterialCommunityIcons name="pencil" size={24} color="#333" />
                    </View>
                    <View style={styles.manualContent}>
                        <Text style={styles.manualTitle}>Log Manually</Text>
                        <Text style={styles.manualDesc}>Search database or type details</Text>
                    </View>
                    <TouchableOpacity>
                        <Text style={styles.openFormLink}>Open Form →</Text>
                    </TouchableOpacity>
                </TouchableOpacity>

                {/* 5. Recent Meals Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>RECENT MEALS</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewAllLink}>View All</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentScroll}>
                    {renderRecentMealItem('Oatmeal & Berries', 'https://images.unsplash.com/photo-1517093725438-27fc8b0aaa45?w=500&q=80')}
                    {renderRecentMealItem('Avocado Toast', 'https://images.unsplash.com/photo-1588137372308-15f75323a4dd?w=500&q=80')}
                    {renderRecentMealItem('Greek Yogurt', 'https://images.unsplash.com/photo-1488477181946-6428a029177b?w=500&q=80')}
                </ScrollView>

                <View style={{ height: 50 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
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
        textTransform: 'capitalize',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    questionSection: {
        alignItems: 'center',
        marginVertical: 24,
        paddingHorizontal: 24,
    },
    mainQuestion: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 8,
    },
    descriptionText: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 20,
    },
    photoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginHorizontal: 16,
        padding: 16,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    imageContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    previewImage: {
        width: '100%',
        height: 180,
        borderRadius: 10,
        backgroundColor: '#eee',
    },
    aiTag: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E0E0E0',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
    },
    aiTagText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
    },
    cardBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    cardTextContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    cardDesc: {
        fontSize: 14,
        color: '#808080',
    },
    cameraIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#33CC33',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    cameraButton: {
        backgroundColor: '#33CC33',
        borderRadius: 30,
        paddingVertical: 15,
        marginTop: 16,
        alignItems: 'center',
    },
    cameraButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    manualCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 1,
    },
    manualIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    manualContent: {
        flex: 1,
    },
    manualTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    manualDesc: {
        fontSize: 13,
        color: '#808080',
    },
    openFormLink: {
        color: '#33CC33',
        fontSize: 14,
        fontWeight: '600',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 16,
        marginTop: 32,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        letterSpacing: 0.5,
    },
    viewAllLink: {
        color: '#33CC33',
        fontSize: 14,
        fontWeight: '600',
    },
    recentScroll: {
        paddingHorizontal: 16,
    },
    recentMealItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 8,
        paddingRight: 12,
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    recentMealImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 8,
        backgroundColor: '#eee',
    },
    recentMealName: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
        marginRight: 8,
    },
    addIconSmall: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default LogMealMethodScreen;
