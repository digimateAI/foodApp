import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useUserStore } from '../../store/useUserStore';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }: { navigation: any }) => {
    const { profile, dailyLog } = useUserStore();
    const { dailyCalorieTarget, proteinTarget, carbTarget, fatTarget } = profile;
    const { consumedCalories, consumedProtein, consumedCarbs, consumedFat, meals } = dailyLog;

    const renderMacroBar = (label: string, value: string, color: string, percent: number) => (
        <View style={styles.macroRow}>
            <View style={styles.macroLabelContainer}>
                <Text style={styles.macroLabel}>{label}</Text>
                <Text style={styles.macroValue}>{value}</Text>
            </View>
            <View style={styles.macroTrack}>
                <View style={[styles.macroFill, { backgroundColor: color, width: `${percent}%` }]} />
            </View>
        </View>
    );

    const renderMealCard = (name: string, cals: string, imageUri: string) => (
        <TouchableOpacity style={styles.mealCard}>
            <Image source={{ uri: imageUri }} style={styles.mealImage} />
            <Text style={styles.mealName}>{name}</Text>
            <Text style={styles.mealCals}>{cals}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* 1. Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={{ uri: 'https://placehold.co/100x100/E0E0E0/333333.png?text=A' }}
                                style={styles.avatar}
                            />
                        </View>
                        <View style={styles.greetingContainer}>
                            <Text style={styles.greetingSmall}>Good Morning,</Text>
                            <Text style={styles.greetingName}>{profile.name || 'Alex'}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.notificationButton}>
                        <Ionicons name="notifications-outline" size={24} color="#333" />
                        <View style={styles.notificationBadge} />
                    </TouchableOpacity>
                </View>

                {/* 2. Today's Calories Widget */}
                <View style={styles.calorieCard}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Today's Calories</Text>
                        <TouchableOpacity>
                            <Text style={styles.detailsLink}>Details</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.ringContainer}>
                        {/* Simplified CSS Ring using borders */}
                        <View style={styles.ringOuter}>
                            <View style={styles.ringInner} />
                            {/* Overlay to hide part of it or use SVG if available. 
                                 For standard View, consistent ring is hard. 
                                 Using a border hack for visual representation. */}
                            <View style={styles.ringProgress} />
                        </View>
                        <View style={styles.ringTextContainer}>
                            <Text style={styles.ringMainValue}>{consumedCalories}</Text>
                            <Text style={styles.ringSubValue}>/ {dailyCalorieTarget} KCAL</Text>
                        </View>
                    </View>

                    <View style={styles.macroContainer}>
                        <View style={styles.macroContainer}>
                            {renderMacroBar('Protein', `${proteinTarget - consumedProtein}g left`, '#56AB2F', (consumedProtein / proteinTarget) * 100)}
                            {renderMacroBar('Carbs', `${carbTarget - consumedCarbs}g left`, '#4A90E2', (consumedCarbs / carbTarget) * 100)}
                            {renderMacroBar('Fat', `${fatTarget - consumedFat}g left`, '#F5A623', (consumedFat / fatTarget) * 100)}
                        </View>
                    </View>
                </View>

                {/* 3. Sleep & Activity Cards */}
                <View style={styles.statsRow}>
                    {/* Sleep Card */}
                    <TouchableOpacity style={[styles.statCard, { marginRight: 8 }]}>
                        <View style={styles.statHeader}>
                            <View style={styles.statIconContainer}>
                                <Ionicons name="moon" size={18} color="#9B59B6" />
                            </View>
                            <View style={styles.goodTag}>
                                <Text style={styles.tagText}>GOOD</Text>
                            </View>
                        </View>
                        <Text style={styles.statLabel}>Sleep Duration</Text>
                        <Text style={styles.statValue}>7h 12m</Text>
                    </TouchableOpacity>

                    {/* Active Burn Card */}
                    <TouchableOpacity style={[styles.statCard, { marginLeft: 8 }]}>
                        <View style={styles.statHeader}>
                            <View style={styles.statIconContainer}>
                                <MaterialCommunityIcons name="fire" size={20} color="#F57C00" />
                            </View>
                            <Ionicons name="arrow-forward" size={18} color="#B0B0B0" />
                        </View>
                        <Text style={styles.statLabel}>Active Burn</Text>
                        <Text style={styles.statValue}>450 kcal</Text>
                        <View style={styles.stepsContainer}>
                            <Ionicons name="footsteps" size={12} color="#56AB2F" />
                            <Text style={styles.stepsText}>8,432 steps</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* 4. Recent Meals */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Meals</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewAllText}>View all</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mealsScroll}>
                    {meals.length > 0 ? (
                        meals.slice(-5).reverse().map((meal, index) => (
                            <View key={index} style={{ marginRight: 16 }}>
                                {renderMealCard(meal.name, `${meal.calories} kcal`, meal.imageUri || 'https://via.placeholder.com/150')}
                            </View>
                        ))
                    ) : (
                        <Text style={{ marginRight: 16, color: '#888', fontStyle: 'italic', alignSelf: 'center' }}>No meals yet</Text>
                    )}

                    {/* Add Snack Card */}
                    <TouchableOpacity style={styles.addSnackCard}>
                        <View style={styles.addSnackCircle}>
                            <Ionicons name="add" size={24} color="#808080" />
                        </View>
                        <Text style={styles.addSnackText}>Add Snack</Text>
                    </TouchableOpacity>
                </ScrollView>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* 5. Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('LogMeal')}
            >
                <Ionicons name="camera" size={24} color="#FFF" style={styles.fabIcon} />
                <Text style={styles.fabText}>Log Meal</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollContent: {
        paddingTop: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#A8E063',
        padding: 2, // gap
        marginRight: 12,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 24,
        backgroundColor: '#E0E0E0',
    },
    greetingContainer: {
        justifyContent: 'center',
    },
    greetingSmall: {
        fontSize: 14,
        color: '#56AB2F',
    },
    greetingName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    notificationButton: {
        padding: 4,
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF4D4D',
    },
    calorieCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    detailsLink: {
        fontSize: 14,
        color: '#56AB2F',
        fontWeight: '600',
    },
    ringContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 160,
        marginBottom: 20,
    },
    ringOuter: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 10,
        borderColor: '#E0E0E0',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    ringProgress: {
        position: 'absolute',
        top: -10,
        left: -10,
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 10,
        borderColor: '#33CC33',
        borderLeftColor: 'transparent', // Hack to look like partial ring
        borderBottomColor: 'transparent',
        transform: [{ rotate: '-45deg' }],
    },
    ringInner: {
        // Just empty space
    },
    ringTextContainer: {
        position: 'absolute',
        alignItems: 'center',
    },
    ringMainValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    ringSubValue: {
        fontSize: 14,
        color: '#808080',
    },
    macroContainer: {
        gap: 12,
    },
    macroRow: {
        // flexDirection: 'row', // actually design said label then bar, but let's stack or row? 
        // "layout: flexDirection: 'row', justifyContent: 'space-between' ... with the progress bar on its own row."
        // Let's do standard stack: Row(Label, Value) -> Bar
    },
    macroLabelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    macroLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    macroValue: {
        fontSize: 12,
        color: '#808080',
    },
    macroTrack: {
        height: 6,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        overflow: 'hidden',
    },
    macroFill: {
        height: '100%',
        borderRadius: 3,
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    statIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#F2F2F2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    goodTag: {
        backgroundColor: '#D4EDDA',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    tagText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#28A745',
    },
    statLabel: {
        fontSize: 14,
        color: '#333',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    stepsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 4,
    },
    stepsText: {
        fontSize: 12,
        color: '#808080',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    viewAllText: {
        fontSize: 14,
        color: '#808080',
    },
    mealsScroll: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    mealCard: {
        marginRight: 16,
        width: 120,
    },
    mealImage: {
        width: 120,
        height: 120,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#eee',
    },
    mealName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    mealCals: {
        fontSize: 12,
        color: '#808080',
    },
    addSnackCard: {
        width: 120,
        height: 120,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#B0B0B0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addSnackCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F2F2F2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    addSnackText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#808080',
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
        backgroundColor: '#33CC33',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    fabIcon: {
        marginRight: 8,
    },
    fabText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default HomeScreen;
