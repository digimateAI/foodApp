import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUserStore } from '../../store/useUserStore';

const CaloriePlanScreen = ({ navigation }: { navigation: any }) => {
    const { profile, login } = useUserStore();
    const { dailyCalorieTarget, proteinTarget, carbTarget, fatTarget, bmr, tdee } = profile;

    // Dynamic Macros based on user profile
    const macros = [
        {
            id: 'protein',
            label: 'Protein',
            desc: 'Muscle building & repair',
            amount: `${proteinTarget}g`,
            percent: 30, // 30%
            color: '#33CC33',
            bgColor: '#D4EDDA',
            icon: 'arm-flex',
        },
        {
            id: 'carbs',
            label: 'Carbs',
            desc: 'Main energy source',
            amount: `${carbTarget}g`,
            percent: 40, // 40%
            color: '#4A90E2',
            bgColor: '#E1E9F4',
            icon: 'barley',
        },
        {
            id: 'fats',
            label: 'Fats',
            desc: 'Hormone balance',
            amount: `${fatTarget}g`,
            percent: 30, // 30%
            color: '#F5A623',
            bgColor: '#FDEBD0',
            icon: 'water-percent',
        },
    ];

    const scienceMetrics = [
        {
            id: 'bmr',
            label: 'Basal Metabolic Rate',
            value: bmr.toLocaleString(),
            icon: 'chart-bell-curve-cumulative',
            color: '#6B7A8F',
        },
        {
            id: 'tdee',
            label: 'Daily Energy Expend.',
            value: tdee.toLocaleString(),
            icon: 'flash',
            color: '#F9A825',
        },
    ];

    const handleStartTracking = () => {
        // Complete Onboarding
        login(); // Sets isAuthenticated = true
        // Note: The AppNavigator listens to 'isAuthenticated' in the store and will automatically switch to MainTabs
    };

    const renderMacroCard = (item: any) => {
        return (
            <View key={item.id} style={styles.macroCard}>
                <View style={styles.macroCardHeader}>
                    <View style={[styles.iconCircle, { backgroundColor: item.bgColor }]}>
                        <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
                    </View>
                    <View style={styles.macroTextContainer}>
                        <Text style={styles.macroLabel}>{item.label}</Text>
                        <Text style={styles.macroDesc}>{item.desc}</Text>
                    </View>
                    <View style={styles.macroValues}>
                        <Text style={styles.macroAmount}>{item.amount}</Text>
                        <Text style={[styles.macroPercent, { color: item.color }]}>{item.percent}%</Text>
                    </View>
                </View>
                {/* Progress Bar */}
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${item.percent}%`, backgroundColor: item.color }]} />
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Your Plan</Text>
                <TouchableOpacity style={styles.backButton}>
                    <MaterialCommunityIcons name="pencil-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.explanationText}>
                    Based on your age, height, weight, activity and goal.
                </Text>

                {/* Daily Target Display */}
                <View style={styles.targetContainer}>
                    <View style={styles.targetTitleContainer}>
                        <MaterialCommunityIcons name="fire" size={16} color="#56AB2F" />
                        <Text style={styles.targetTitle}>DAILY TARGET</Text>
                    </View>
                    <Text style={styles.caloriesValue}>
                        {dailyCalorieTarget} <Text style={styles.caloriesUnit}>kcal</Text>
                    </Text>
                </View>

                {/* Macro Split Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Macro Split</Text>
                    <View style={styles.recommendedTag}>
                        <Text style={styles.recommendedText}>Recommended</Text>
                    </View>
                </View>

                <View style={styles.macroList}>
                    {macros.map(renderMacroCard)}
                </View>

                {/* The Science Section */}
                <Text style={styles.sectionTitle}>The Science</Text>
                <View style={styles.scienceContainer}>
                    {scienceMetrics.map((item) => (
                        <View key={item.id} style={styles.scienceCard}>
                            <View style={styles.scienceIconRow}>
                                <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
                            </View>
                            <Text style={styles.scienceValue}>{item.value}</Text>
                            <Text style={styles.scienceLabel}>{item.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Macro Ratio Summary Card */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryText}>
                        Your macro ratio is balanced for moderate activity.
                    </Text>
                    {/* Placeholder Pie Chart */}
                    <View style={styles.pieChartPlaceholder}>
                        <MaterialCommunityIcons name="chart-pie" size={32} color="#33CC33" />
                        <MaterialCommunityIcons name="crosshairs" size={12} color="#999" style={{ position: 'absolute' }} />
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.nextButton} onPress={handleStartTracking}>
                    <Text style={styles.nextButtonText}>Start Tracking</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
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
    explanationText: {
        color: '#56AB2F',
        fontSize: 14,
        marginBottom: 24,
        marginTop: 4,
    },
    targetContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    targetTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 4,
    },
    targetTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#56AB2F',
        letterSpacing: 0.5,
    },
    caloriesValue: {
        fontSize: 48,
        fontWeight: '800',
        color: '#1A1A1A',
        lineHeight: 56,
    },
    caloriesUnit: {
        fontSize: 18,
        fontWeight: '600',
        color: '#56AB2F',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    recommendedTag: {
        backgroundColor: '#D4EDDA',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    recommendedText: {
        color: '#28A745',
        fontSize: 12,
        fontWeight: '600',
    },
    macroList: {
        gap: 16,
        marginBottom: 32,
    },
    macroCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    macroCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    macroTextContainer: {
        flex: 1,
    },
    macroLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    macroDesc: {
        fontSize: 12,
        color: '#808080',
    },
    macroValues: {
        alignItems: 'flex-end',
    },
    macroAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    macroPercent: {
        fontSize: 12,
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
        borderRadius: 3,
    },
    scienceContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    scienceCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    scienceIconRow: {
        marginBottom: 12,
    },
    scienceValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    scienceLabel: {
        fontSize: 12,
        color: '#808080',
        lineHeight: 18,
    },
    summaryCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    summaryText: {
        flex: 1,
        color: '#333',
        fontSize: 14,
        lineHeight: 20,
        marginRight: 16,
    },
    pieChartPlaceholder: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
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

export default CaloriePlanScreen;
