import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUserStore } from '../../store/useUserStore';

const ActivityGoalScreen = ({ navigation, route }: { navigation: any, route: any }) => {
    const { updateProfile, calculateTargets, profile } = useUserStore();
    const isEditMode = route.params?.mode === 'edit';

    const [activityLevel, setActivityLevel] = useState<string | null>(isEditMode ? profile.activityLevel : null);
    const [goal, setGoal] = useState<string | null>(isEditMode ? profile.goal : null);

    const isFormValid = activityLevel !== null && goal !== null;

    const activityLevels = [
        { id: 'Sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
        { id: 'Lightly Active', label: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
        { id: 'Moderately Active', label: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
        { id: 'Very Active', label: 'Very Active', desc: 'Hard exercise 6-7 days/week' },
        { id: 'Extremely Active', label: 'Extremely Active', desc: 'Very hard exercise & physical job' },
    ];

    const goals = [
        { id: 'Weight Loss', label: 'Weight Loss', icon: 'trending-down' },
        { id: 'Maintain Weight', label: 'Maintain Weight', icon: 'scale-balance' },
        { id: 'Muscle Gain', label: 'Muscle Gain', icon: 'dumbbell' },
    ];

    const renderActivityCard = (item: any) => {
        const isSelected = activityLevel === item.id;
        return (
            <TouchableOpacity
                key={item.id}
                style={[styles.activityCard, isSelected && styles.activityCardSelected]}
                onPress={() => setActivityLevel(item.id)}
            >
                <View style={styles.radioContainer}>
                    <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                        {isSelected && <View style={styles.radioInner} />}
                    </View>
                </View>
                <View style={styles.activityTextContainer}>
                    <Text style={[styles.activityLabel, isSelected && styles.activityLabelSelected]}>
                        {item.label}
                    </Text>
                    <Text style={[styles.activityDesc, isSelected && styles.activityDescSelected]}>
                        {item.desc}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderGoalCard = (item: any) => {
        const isSelected = goal === item.id;
        return (
            <TouchableOpacity
                key={item.id}
                style={[styles.goalCard, isSelected && styles.goalCardSelected]}
                onPress={() => setGoal(item.id)}
            >
                <View style={[styles.goalIconCircle, isSelected && styles.goalIconCircleSelected]}>
                    <MaterialCommunityIcons
                        name={item.icon}
                        size={24}
                        color={isSelected ? '#fff' : '#666'}
                    />
                </View>
                <Text style={[styles.goalLabel, isSelected && styles.goalLabelSelected]}>
                    {item.label}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isEditMode ? 'Update Plan' : 'Personalize Your Plan'}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Progress Indicator - Hide in Edit Mode */}
                {!isEditMode && (
                    <View style={styles.progressSection}>
                        <View style={styles.progressLabels}>
                            <Text style={styles.stepText}>Step 2 of 2</Text>
                        </View>
                    </View>
                )}

                {/* Activity Level Section */}
                <View style={styles.section}>
                    <Text style={styles.mainHeading}>Activity Level</Text>
                    <Text style={styles.descriptionText}>
                        Select your typical activity level to calculate calorie needs.
                    </Text>
                    <View style={styles.cardsContainer}>
                        {activityLevels.map(renderActivityCard)}
                    </View>
                </View>

                {/* Primary Goal Section */}
                <View style={styles.section}>
                    <Text style={styles.mainHeading}>Primary Goal</Text>
                    <Text style={styles.descriptionText}>
                        We'll adjust your macro ratios based on this goal.
                    </Text>
                    <View style={styles.goalContainer}>
                        {goals.map(renderGoalCard)}
                    </View>
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.nextButton, !isFormValid && { backgroundColor: '#CCCCCC', opacity: 0.7 }]}
                    disabled={!isFormValid}
                    onPress={() => {
                        if (activityLevel && goal) {
                            updateProfile({ activityLevel, goal });
                            calculateTargets();

                            if (isEditMode) {
                                navigation.goBack();
                            } else {
                                navigation.navigate('CaloriePlan');
                            }
                        }
                    }}
                >
                    <Text style={styles.nextButtonText}>{isEditMode ? 'Save Changes' : 'Next Step'}</Text>
                    {!isEditMode && <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />}
                </TouchableOpacity>
            </View>
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
        backgroundColor: '#F9F9F9',
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
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    progressSection: {
        marginTop: 10,
        marginBottom: 32,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    stepText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    percentText: {
        fontSize: 14,
        color: '#33CC33',
        fontWeight: '600',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#33CC33',
        borderRadius: 3,
    },
    section: {
        marginBottom: 32,
    },
    mainHeading: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    descriptionText: {
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
        marginBottom: 20,
    },
    cardsContainer: {
        gap: 12,
    },
    activityCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    activityCardSelected: {
        backgroundColor: '#D4EDDA',
        borderColor: '#33CC33',
    },
    radioContainer: {
        marginRight: 16,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#B0B0B0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioOuterSelected: {
        borderColor: '#33CC33',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#33CC33',
    },
    activityTextContainer: {
        flex: 1,
    },
    activityLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    activityLabelSelected: {
        color: '#28A745',
    },
    activityDesc: {
        fontSize: 13,
        color: '#808080',
    },
    activityDescSelected: {
        color: '#388E3C', // slightly darker green for readability
    },
    goalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    goalCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        paddingVertical: 20,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    goalCardSelected: {
        backgroundColor: '#D4EDDA',
        borderColor: '#33CC33',
    },
    goalIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    goalIconCircleSelected: {
        backgroundColor: '#33CC33',
    },
    goalLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    goalLabelSelected: {
        color: '#28A745',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        backgroundColor: 'rgba(249, 249, 249, 0.9)',
    },
    nextButton: {
        backgroundColor: '#33CC33',
        height: 56,
        borderRadius: 28,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
});

export default ActivityGoalScreen;
