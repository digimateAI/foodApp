import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Image, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUserStore, Meal } from '../../store/useUserStore';

const { width } = Dimensions.get('window');

const FoodScreen = ({ navigation }: { navigation: any }) => {
    // 1. Get History from Store
    const { dailyLog, profile, history } = useUserStore();
    const { dailyCalorieTarget, proteinTarget, carbTarget, fatTarget } = profile;

    // 2. Local State for Date Navigation
    const [selectedDate, setSelectedDate] = React.useState(new Date());

    // 3. Helper to get date string key (YYYY-MM-DD)
    const getDateKey = (date: Date) => date.toISOString().split('T')[0];

    // 4. Determine Data to Display
    // If selected date is today, show live 'dailyLog'. Else show historical log or empty default.
    const isToday = getDateKey(selectedDate) === getDateKey(new Date());

    // Fallback empty log
    const emptyLog = {
        consumedCalories: 0,
        consumedProtein: 0,
        consumedCarbs: 0,
        consumedFat: 0,
        meals: [],
    };

    const displayLog = isToday
        ? dailyLog
        : (history && history[getDateKey(selectedDate)]) || emptyLog; // Handle missing history safely

    const { consumedCalories, consumedProtein, consumedCarbs, consumedFat, meals } = displayLog;

    // Navigation Handlers
    const goToPreviousDay = () => {
        const prev = new Date(selectedDate);
        prev.setDate(prev.getDate() - 1);
        setSelectedDate(prev);
    };

    const goToNextDay = () => {
        const next = new Date(selectedDate);
        next.setDate(next.getDate() + 1);
        // Optional: Prevent going into future? For now, allow it (future is empty)
        setSelectedDate(next);
    };

    const renderMacroProgress = (label: string, filled: number, total: number, color: string) => (
        <View style={styles.macroProgressItem}>
            <Text style={styles.miniMacroLabel}>{label}</Text>
            <View style={styles.miniMacroTrack}>
                <View style={[styles.miniMacroFill, { backgroundColor: color, width: `${total > 0 ? Math.min((filled / total) * 100, 100) : 0}%` }]} />
            </View>
            <Text style={styles.miniMacroValue}>{filled}/{total}g</Text>
        </View>
    );

    const renderLoggedMeal = (name: string, cals: string, imageUri: string, macros: { p: number, c: number, f: number }) => (
        <View style={styles.loggedMealCard}>
            <Image source={{ uri: imageUri }} style={styles.mealImage} />
            <Text style={styles.mealTitle}>{name}</Text>
            <Text style={styles.mealCalories}>{cals}</Text>
            <View style={styles.mealTags}>
                <View style={[styles.tag, { backgroundColor: '#E8F5E9' }]}>
                    <Text style={[styles.tagText, { color: '#28A745' }]}>P: {macros.p}g</Text>
                </View>
                <View style={[styles.tag, { backgroundColor: '#FFFDE7' }]}>
                    <Text style={[styles.tagText, { color: '#FFC107' }]}>C: {macros.c}g</Text>
                </View>
                <View style={[styles.tag, { backgroundColor: '#F3E5F5' }]}>
                    <Text style={[styles.tagText, { color: '#9C27B0' }]}>F: {macros.f}g</Text>
                </View>
            </View>
        </View>
    );

    const renderUnloggedMeal = (prompt: string) => (
        <TouchableOpacity style={styles.unloggedCard} onPress={() => navigation.navigate('Camera')}>
            <Ionicons name="camera" size={32} color="#B0B0B0" />
            <Text style={styles.unloggedText}>{prompt}</Text>
            <View style={styles.plusIcon}>
                <MaterialCommunityIcons name="plus" size={16} color="#B0B0B0" />
            </View>
        </TouchableOpacity>
    );

    const renderSection = (title: string, time: string, mealData?: any) => (
        <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{title}</Text>
                <Text style={styles.sectionTime}>{time}</Text>
            </View>
            {mealData && mealData.length > 0 ?
                mealData.map((meal: Meal) => (
                    <View key={meal.id} style={{ marginBottom: 12 }}>
                        {renderLoggedMeal(meal.name, `${meal.calories} kcal`, meal.imageUri || '', { p: meal.protein, c: meal.carbs, f: meal.fat })}
                    </View>
                ))
                :
                // Only show "Add" button if it is TODAY. Past/Future days shouldn't prompt to add (usually).
                isToday ? renderUnloggedMeal(`Log your ${title.toLowerCase()}`) : <Text style={{ marginHorizontal: 16, color: '#999', fontStyle: 'italic' }}>No entry</Text>
            }
        </View>
    );

    const getFormattedDate = () => {
        if (isToday) {
            return `Today, ${selectedDate.toLocaleString('default', { month: 'short' })} ${selectedDate.getDate()}`;
        }
        return selectedDate.toLocaleDateString('default', { weekday: 'long', month: 'short', day: 'numeric' });
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* 1. Top Day Selector */}
            <View style={styles.topBar}>
                <TouchableOpacity style={styles.arrowButton} onPress={goToPreviousDay}>
                    <Ionicons name="chevron-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.dateText}>{getFormattedDate()}</Text>
                <TouchableOpacity style={styles.arrowButton} onPress={goToNextDay}>
                    <Ionicons name="chevron-forward" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* 2. Calories & Macros Summary Card */}
                <View style={styles.summaryCard}>
                    <Text style={styles.cardTitle}>Calories</Text>

                    {/* Calorie Values */}
                    <View style={styles.calorieRow}>
                        <View style={styles.consumedContainer}>
                            <Text style={styles.consumedText}>{consumedCalories}</Text>
                            <Text style={styles.totalText}> / {dailyCalorieTarget} kcal</Text>
                        </View>
                        <Text style={styles.remainingText}>{dailyCalorieTarget - consumedCalories} left</Text>
                    </View>

                    {/* Main Progress Bar */}
                    <View style={styles.mainProgressTrack}>
                        <View style={[styles.mainProgressFill, { width: `${Math.min((consumedCalories / dailyCalorieTarget) * 100, 100)}%` }]} />
                    </View>

                    {/* Macro Bars */}
                    {/* Macro Bars */}
                    <View style={styles.macrosContainer}>
                        {renderMacroProgress('Protein', consumedProtein, proteinTarget, '#64B5F6')}
                        {renderMacroProgress('Carbs', consumedCarbs, carbTarget, '#FFD600')}
                        {renderMacroProgress('Fat', consumedFat, fatTarget, '#BA68C8')}
                    </View>
                </View>

                {/* 3. Meal Sections */}
                {/* 3. Meal Sections */}
                {renderSection('Breakfast', '06:00 - 10:00 AM', meals.filter(m => m.type === 'breakfast'))}
                {renderSection('Lunch', '12:00 - 02:00 PM', meals.filter(m => m.type === 'lunch'))}
                {renderSection('Dinner', '06:00 - 09:00 PM', meals.filter(m => m.type === 'dinner'))}
                {renderSection('Snacks', 'Anytime', meals.filter(m => m.type === 'snacks'))}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* 4. Floating Action Button - Show only on Today */}
            {isToday && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => navigation.navigate('Camera')}
                >
                    <Ionicons name="camera" size={24} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={styles.fabText}>Snap Meal</Text>
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#F9F9F9',
    },
    arrowButton: {
        padding: 8,
    },
    dateText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    summaryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 16,
        marginVertical: 12,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    calorieRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 12,
    },
    consumedContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    consumedText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    totalText: {
        fontSize: 14,
        color: '#808080',
        marginLeft: 4,
    },
    remainingText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#33CC33',
        marginBottom: 6, // adjust alignment with baseline
    },
    mainProgressTrack: {
        height: 10,
        backgroundColor: '#E0E0E0',
        borderRadius: 5,
        overflow: 'hidden',
        marginBottom: 20,
    },
    mainProgressFill: {
        height: '100%',
        backgroundColor: '#33CC33',
        borderRadius: 5,
    },
    macrosContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    macroProgressItem: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    miniMacroLabel: {
        fontSize: 12,
        color: '#333',
        marginBottom: 4,
    },
    miniMacroTrack: {
        width: '100%',
        height: 6,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        marginBottom: 4,
        overflow: 'hidden',
    },
    miniMacroFill: {
        height: '100%',
        borderRadius: 3,
    },
    miniMacroValue: {
        fontSize: 10,
        color: '#808080',
    },
    sectionContainer: {
        marginTop: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    sectionTime: {
        fontSize: 14,
        color: '#808080',
    },
    loggedMealCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginHorizontal: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 1,
    },
    mealImage: {
        width: '100%',
        height: 150,
        borderRadius: 10,
        marginBottom: 12,
        backgroundColor: '#eee',
    },
    mealTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    mealCalories: {
        fontSize: 14,
        fontWeight: '600',
        color: '#33CC33',
        marginBottom: 12,
    },
    mealTags: {
        flexDirection: 'row',
        gap: 8,
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 5,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '600',
    },
    unloggedCard: {
        marginHorizontal: 16,
        height: 180,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#B0B0B0',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    unloggedText: {
        color: '#808080',
        marginTop: 8,
        fontSize: 14,
    },
    plusIcon: {
        position: 'absolute',
        top: '40%', // Adjust to overlay on camera icon if needed, or just near it. 
        // Prompt said "Camera Icon: Icon (camera with plus sign)". Using separate icon for simplicity.
        // Actually MaterialCommunityIcons 'camera-plus' exists usually.
    },
    fab: {
        position: 'absolute',
        bottom: 80, // Above bottom tab bar
        right: 16,
        backgroundColor: '#33CC33',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    fabText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default FoodScreen;
